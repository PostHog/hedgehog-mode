// Serves the fixture under a real Content-Security-Policy.
//
// The header is the whole point of these tests, so it is set here — on the wire — rather than
// through the browser driver. Driver-side header injection is easy to get subtly wrong: a
// silent fall-through leaves the page with no CSP at all and every assertion still passes.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const assets = join(root, "../hedgehog-mode/assets");
const port = Number(process.env.PORT || 8010);

// Two policies, because a page can fail a CSP for two unrelated reasons and we want to know
// which one bit.
//
// Neither grants `unsafe-eval`, and neither grants `unsafe-inline` — every script here is an
// external same-origin file, so 'self' alone is enough. Anything pixi compiles with
// `new Function` dies under both.
//
// The difference is workers. `worker-src` falls back to `script-src` (not `default-src`), so a
// bare `script-src 'self'` also blocks pixi's blob-URL texture worker. That is a real
// constraint for MV3, but it is not the eval question, and letting it fire would make these
// tests fail for the wrong reason.
const CSP = {
  // Isolates the eval question: workers allowed, runtime compilation still forbidden.
  eval: "script-src 'self'; worker-src 'self' blob:",
  // What an MV3 content script actually faces: no eval, and no blob worker either.
  strict: "script-src 'self'",
};

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

// Which bundle each route loads, and under which policy. Same HTML throughout.
const PAGES = {
  "/": { bundle: "app.js", csp: CSP.eval },
  "/extension": { bundle: "app-extension.js", csp: CSP.eval },
  // The extension build disables pixi's blob worker, so it is the only one that can survive
  // the strict policy. This route is what guards the MV3 story.
  "/extension-strict": { bundle: "app-extension.js", csp: CSP.strict },
};

const send = (res, status, body, type, extraHeaders = {}) => {
  res.writeHead(status, { "content-type": type, ...extraHeaders });
  res.end(body);
};

const server = http.createServer(async (req, res) => {
  const path = normalize(new URL(req.url, "http://localhost").pathname);

  try {
    if (path in PAGES) {
      const page = PAGES[path];
      const html = await readFile(join(root, "fixtures/index.html"), "utf8");
      return send(
        res,
        200,
        html.replace("__BUNDLE__", page.bundle),
        TYPES[".html"],
        { "content-security-policy": page.csp }
      );
    }

    if (path === "/probe.js") {
      const body = await readFile(join(root, "fixtures/probe.js"));
      return send(res, 200, body, TYPES[".js"]);
    }

    if (path === "/app.js" || path === "/app-extension.js") {
      const body = await readFile(join(root, "dist", path));
      return send(res, 200, body, TYPES[".js"]);
    }

    if (path.startsWith("/assets/")) {
      // normalize() above already collapsed any `..`, so this cannot escape the assets dir.
      const body = await readFile(join(assets, path.slice("/assets/".length)));
      return send(
        res,
        200,
        body,
        TYPES[extname(path)] || "application/octet-stream"
      );
    }
  } catch (error) {
    return send(res, 500, String(error), "text/plain");
  }

  return send(res, 404, "not found", "text/plain");
});

server.listen(port, () => {
  console.log(`CSP fixture server on http://localhost:${port}`);
  for (const [path, page] of Object.entries(PAGES)) {
    console.log(`  ${path} -> ${page.bundle}  [${page.csp}]`);
  }
});
