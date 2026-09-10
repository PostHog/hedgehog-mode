// Bundles the fixture page two ways, so the CSP specs can tell apart two different defences:
//
//   app.js            plain build. Relies only on pixi's own `pixi.js/unsafe-eval` polyfill,
//                     which the engine imports. This is what a normal npm consumer ships.
//   app-extension.js  same page through the extension's `pixi-eval-free` patches, which also
//                     rip pixi's eval-based modules out of the bundle. Any patch pixi has
//                     outgrown throws at runtime instead of quietly reaching for eval.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pixiEvalFree } from "../hedgehog-mode-anywhere/pixi-eval-free.mjs";

const root = dirname(fileURLToPath(import.meta.url));

const common = {
  entryPoints: [join(root, "fixtures/app.ts")],
  bundle: true,
  format: "esm",
  target: ["chrome110"],
  sourcemap: false,
  logLevel: "info",
};

// React rides along (the library's entry re-exports its component) and gates dev-only code —
// including an `eval` — on this. Without it the fixture would fail the CSP on React's
// account and tell us nothing about pixi.
const productionReact = { "process.env.NODE_ENV": '"production"' };

await build({
  ...common,
  outfile: join(root, "dist/app.js"),
  define: { ...productionReact, "process.env.HEDGEHOG_FIXTURE": '"library"' },
});

await build({
  ...common,
  outfile: join(root, "dist/app-extension.js"),
  define: { ...productionReact, "process.env.HEDGEHOG_FIXTURE": '"extension"' },
  plugins: [pixiEvalFree()],
});
