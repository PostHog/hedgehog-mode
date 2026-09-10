// pixi generates shaders, uniform setters and particle updaters with `new Function`, which
// MV3 content scripts and any strict-CSP host forbid. `pixi.js/unsafe-eval` swaps in
// eval-free polyfills at runtime, but the eval-based modules still ship in the bundle. These
// replacements rip them out at build time, so a missed polyfill fails loudly here instead of
// silently reaching for eval on a user's page.
//
// Shared by the extension build and the e2e CSP fixtures — keep one list, not two.
const replacements = [
  [
    /unsafeEvalSupported\.mjs$/,
    "export const unsafeEvalSupported = () => false;",
  ],
  [
    /generateParticleUpdateFunction\.mjs$/,
    'export const generateParticleUpdateFunction = () => { throw new Error("Pixi eval-free particle patch was not installed"); };',
  ],
  [
    /GenerateShaderSyncCode\.mjs$/,
    'export const generateShaderSyncCode = () => { throw new Error("Pixi eval-free shader patch was not installed"); };',
  ],
  // Was `createUboSyncFunction.mjs` until pixi 8.20.1 renamed it to `compileBufferSync.mjs`.
  // The `new Function` call came along with it, so this patch still has to land — the GL and
  // WebGPU UBO paths both reach it.
  [
    /compileBufferSync\.mjs$/,
    'export const compileBufferSync = () => { throw new Error("Pixi eval-free UBO patch was not installed"); };',
  ],
  [
    /generateUniformsSync\.mjs$/,
    'export const generateUniformsSync = () => { throw new Error("Pixi eval-free uniform patch was not installed"); };',
  ],
];

// Every replacement above is matched by file path, so a pixi upgrade that renames or deletes
// one of these modules makes it silently stop applying: esbuild simply never calls us, the
// build stays green, and the bundle ships an eval-using pixi that only dies later against a
// real CSP. pixi 8.20.1 did exactly that to the UBO module. Track what actually fired and
// fail the build on a miss, so the next upgrade tells us instead of the users.
export function pixiEvalFree() {
  return {
    name: "pixi-eval-free",
    setup: (build) => {
      const applied = new Set();

      build.onLoad({ filter: /pixi\.js.*\.mjs$/ }, (args) => {
        const replacement = replacements.find(([pattern]) =>
          pattern.test(args.path)
        );
        if (!replacement) {
          return undefined;
        }
        applied.add(replacement[0]);
        return { contents: replacement[1], loader: "js" };
      });

      build.onEnd((result) => {
        // Only meaningful when the bundle was actually produced; a failed build may never
        // have reached the pixi modules at all.
        if (result.errors.length) {
          return;
        }
        const missed = replacements.filter(
          ([pattern]) => !applied.has(pattern)
        );
        if (missed.length) {
          // Throw rather than push onto result.errors — esbuild ignores late additions there
          // and would still exit 0, which is the exact silence we're fixing.
          throw new Error(
            `pixi eval patches matched no file: ${missed
              .map(([pattern]) => String(pattern))
              .join(", ")}.\n` +
              `pixi likely renamed or removed the module. Check whether the eval is gone in ` +
              `the new version, then either drop the patch or retarget it.`
          );
        }
      });
    },
  };
}
