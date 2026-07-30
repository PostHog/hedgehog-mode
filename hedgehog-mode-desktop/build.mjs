import { build } from "esbuild";
import { chmod, copyFile, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });

async function copyMacOSWindowHelper() {
  const destination = "dist/get-windows-macos";
  await copyFile("node_modules/get-windows/main", destination);
  await copyFile(
    "node_modules/get-windows/license",
    "dist/get-windows-LICENSE"
  );
  await chmod(destination, 0o755);
}

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
  copyFile("src/interaction-preload.cjs", "dist/interaction-preload.cjs"),
  copyMacOSWindowHelper(),
]);
