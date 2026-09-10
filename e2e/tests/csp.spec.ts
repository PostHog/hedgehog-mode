import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

// "This page tried to compile code at runtime." pixi does that with `new Function` for
// shaders, uniform setters, UBO sync and particle updates; under our CSP each attempt
// surfaces as one of these. Deliberately narrow — a blocked worker is also a CSP violation,
// but it is a different defence and must not be reported as an eval failure.
const EVAL_VIOLATION = /EvalError|Refused to evaluate|unsafe-eval/i;

// The extension build replaces pixi's eval modules with throwing stubs. If pixi ever routes
// around `pixi.js/unsafe-eval` and calls one for real, this is the message we get.
const MISSING_PATCH = /patch was not installed/i;

type PageFailures = { console: string[]; errors: string[] };

function collectFailures(page: Page): PageFailures {
  const failures: PageFailures = { console: [], errors: [] };
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() === "error" || message.type() === "warning") {
      failures.console.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    failures.errors.push(error.stack || error.message);
  });
  return failures;
}

const matching = (failures: PageFailures, pattern: RegExp): string[] =>
  [...failures.console, ...failures.errors].filter((line) =>
    pattern.test(line)
  );

/**
 * Wait for the engine to boot, but give up the moment the CSP kills it.
 *
 * A blocked `eval` aborts pixi's async init from the inside: `render()` never resolves and
 * nothing rejects, so a plain wait on `__ready` just burns the full timeout and then reports
 * "timed out", which says nothing about why. Watching the console alongside it lets the test
 * name the real cause.
 */
async function waitForBoot(
  page: Page,
  failures: PageFailures
): Promise<string> {
  let outcome = "still loading";
  await expect
    .poll(
      async () => {
        if (matching(failures, EVAL_VIOLATION).length > 0) {
          return (outcome = "blocked by CSP");
        }
        if (matching(failures, MISSING_PATCH).length > 0) {
          return (outcome = "hit an unpatched pixi eval path");
        }
        if (await page.evaluate(() => window.__bootError !== undefined)) {
          return (outcome = "threw during boot");
        }
        if (await page.evaluate(() => window.__ready === true)) {
          return (outcome = "ready");
        }
        return outcome;
      },
      { timeout: 30_000, intervals: [100, 250, 500] }
    )
    .not.toBe("still loading");
  return outcome;
}

// `worker-src` falls back to `script-src`, so a bare `script-src 'self'` blocks pixi's
// blob-URL texture worker as well as its eval. The first two routes allow the worker to keep
// the eval question isolated; the third takes both away, which is what MV3 actually does.
const ROUTES = [
  { name: "library build (pixi's own unsafe-eval polyfill)", path: "/" },
  { name: "extension build (pixi-eval-free patches)", path: "/extension" },
  {
    name: "extension build, no blob worker either (MV3)",
    path: "/extension-strict",
  },
];

for (const route of ROUTES) {
  test.describe(route.name, () => {
    test("renders hedgehogs with unsafe-eval forbidden", async ({ page }) => {
      const failures = collectFailures(page);

      await page.goto(route.path);

      // The CSP has to be real before any other assertion here means anything. A page served
      // without the header renders perfectly and reports zero violations — a silent pass.
      // The probe is page-authored on purpose: script injected through the driver is exempt
      // from CSP and would report "allowed" even when the header is live.
      const probe = await page.evaluate(() => window.__cspProbe);
      expect(
        probe,
        "CSP was not enforced, so this run proves nothing about eval"
      ).toMatch(/^blocked:/);

      const outcome = await waitForBoot(page, failures);

      // Report the specific cause before the generic one, so a failure names eval rather
      // than just "never became ready".
      expect(
        matching(failures, EVAL_VIOLATION),
        "pixi tried to compile code at runtime"
      ).toEqual([]);
      expect(
        matching(failures, MISSING_PATCH),
        "a pixi eval path escaped the polyfill"
      ).toEqual([]);
      expect(await page.evaluate(() => window.__bootError)).toBeUndefined();
      expect(outcome, "the engine never finished booting").toBe("ready");

      // pixi must have a live WebGL context, or it never compiled a shader and never had the
      // chance to reach for eval.
      const canvas = await page.evaluate(() => {
        const element = document.querySelector("#app canvas");
        if (!(element instanceof HTMLCanvasElement)) {
          return null;
        }
        const gl = element.getContext("webgl2") || element.getContext("webgl");
        return {
          width: element.width,
          contextLost: gl ? gl.isContextLost() : null,
        };
      });
      expect(canvas, "pixi produced no canvas").not.toBeNull();
      expect(canvas!.width).toBeGreaterThan(0);
      expect(canvas!.contextLost).toBe(false);

      // Spawning exercises sprites, filters and accessories — the shader-heavy paths where
      // pixi generates code.
      const before = await page.evaluate(
        () => window.__game!.getAllHedgehogs().length
      );
      await page.evaluate(() => {
        for (let i = 0; i < 5; i++) {
          window.__game!.spawnHedgehog({ id: `csp-spec-${i}` });
        }
      });
      await expect
        .poll(() =>
          page.evaluate(() => window.__game!.getAllHedgehogs().length)
        )
        .toBe(before + 5);

      // The render loop has to still be ticking; a frozen first frame would pass every check
      // above.
      const first = await page.screenshot();
      await page.waitForTimeout(1200);
      const second = await page.screenshot();
      expect(
        Buffer.compare(first, second),
        "frames are identical, so the render loop stalled"
      ).not.toBe(0);

      // Re-check: the shader-heavy work all happened after the boot assertions above.
      expect(
        matching(failures, EVAL_VIOLATION),
        "pixi tried to compile code at runtime while rendering"
      ).toEqual([]);
      expect(
        matching(failures, MISSING_PATCH),
        "a pixi eval path escaped the polyfill while rendering"
      ).toEqual([]);
      expect(failures.errors, "uncaught page errors").toEqual([]);
    });
  });
}
