import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });

await Promise.all([
  build({
    entryPoints: ["src/main.mjs"],
    bundle: true,
    outdir: "dist",
    outExtension: { ".js": ".mjs" },
    platform: "node",
    format: "esm",
    external: ["electron"],
  }),
  build({
    entryPoints: ["src/renderer.jsx"],
    bundle: true,
    outfile: "dist/renderer.js",
    platform: "browser",
    format: "esm",
  }),
  copyFile("src/index.html", "dist/index.html"),
  copyFile("src/preload.cjs", "dist/preload.cjs"),
]);
