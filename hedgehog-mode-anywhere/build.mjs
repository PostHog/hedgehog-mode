import { build, context } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");
const artifacts = join(root, "artifacts");

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
  target: ["chrome110", "firefox142"],
  minify: true,
  sourcemap: false,
  // React (and its deps) gate dev-only code on this; without it `process` is undefined at runtime.
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
  plugins: [
    {
      name: "pixi-eval-free",
      setup: (build) => {
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
          [
            /createUboSyncFunction\.mjs$/,
            'export const createUboSyncFunction = () => { throw new Error("Pixi eval-free UBO patch was not installed"); };',
          ],
          [
            /generateUniformsSync\.mjs$/,
            'export const generateUniformsSync = () => { throw new Error("Pixi eval-free uniform patch was not installed"); };',
          ],
        ];

        build.onLoad({ filter: /pixi\.js.*\.mjs$/ }, (args) => {
          const replacement = replacements.find(([pattern]) =>
            pattern.test(args.path),
          );
          return replacement
            ? { contents: replacement[1], loader: "js" }
            : undefined;
        });
      },
    },
    {
      name: "package-extensions",
      setup: (b) => b.onEnd(packageExtensions),
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

async function packageExtensions() {
  await copyAssets();

  const chromeManifest = JSON.parse(
    await readFile(join(root, "manifest.json"), "utf8"),
  );
  const firefoxManifest = {
    ...chromeManifest,
    background: { scripts: ["dist/background.js"] },
    browser_specific_settings: {
      gecko: {
        id: "hedgehog-mode-anywhere@posthog.com",
        strict_min_version: "142.0",
        data_collection_permissions: { required: ["none"] },
      },
    },
  };

  await Promise.all([
    packageExtension("chrome", chromeManifest),
    packageExtension("firefox", firefoxManifest),
  ]);
}

async function packageExtension(browser, manifest) {
  const destination = join(artifacts, browser);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await Promise.all(
    ["assets", "dist", "icons"].map((directory) =>
      cp(join(root, directory), join(destination, directory), {
        recursive: true,
      }),
    ),
  );
  await cp(join(root, "popup.html"), join(destination, "popup.html"));
  await writeFile(
    join(destination, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("Watching for changes…");
} else {
  await build(options);
}
