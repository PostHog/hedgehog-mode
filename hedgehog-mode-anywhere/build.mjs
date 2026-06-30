import { build, context } from "esbuild";
import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

const options = {
  entryPoints: {
    content: join(root, "src/content.jsx"),
    popup: join(root, "src/popup.jsx"),
    background: join(root, "src/background.js"),
  },
  outdir: join(root, "dist"),
  bundle: true,
  format: "iife",
  jsx: "automatic",
  target: "chrome110",
  minify: true,
  sourcemap: false,
  // React (and its deps) gate dev-only code on this; without it `process` is undefined at runtime.
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
  plugins: [
    {
      // Re-copy on every (re)build so a watch session picks up spritesheet changes.
      name: "copy-assets",
      setup: (b) => b.onEnd(copyAssets),
    },
  ],
};

async function copyAssets() {
  const from = join(root, "node_modules/@posthog/hedgehog-mode/assets");
  const to = join(root, "assets");
  await mkdir(to, { recursive: true });
  for (const file of ["sprites.png", "sprites.json"]) {
    await cp(join(from, file), join(to, file));
  }
}

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("Watching for changes…");
} else {
  await build(options);
}
