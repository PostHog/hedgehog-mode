import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    cacheDir: `node_modules/.vite`,
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        formats: ["es"],
        fileName: "index",
      },
      sourcemap: true,
      rollupOptions: {
        // Externalize React and ALL of its subpaths (react-dom/server,
        // react-dom/client, react/jsx-runtime, …). Exact-string externals only
        // match the bare specifier, so a subpath like `react-dom/server` —
        // which `react-shadow` imports — would otherwise get bundled. Inlining
        // React's own renderer is fatal: the bundled copy reaches into React's
        // internal dispatcher, and if its version doesn't match the host app's
        // React it throws at module-eval (e.g. a React 19 build of
        // `react-dom/server` crashes on a React 18 host). Always defer to the
        // host's React via the peer dependency.
        //
        // pixi.js (and subpaths like pixi.js/unsafe-eval) is externalized for
        // the same single-instance reason: pixi is already a dependency, so
        // consumers resolve one shared copy from their tree rather than a ~1.3MB
        // duplicate welded into this bundle. Inlining it also makes pixi
        // unreachable — consumers can't apply `pixi.js/unsafe-eval` (needed under
        // strict-CSP / MV3 hosts that forbid `new Function`) or otherwise
        // configure the renderer, because the patch can't see the bundled copy.
        external: [/^react($|\/)/, /^react-dom($|\/)/, /^pixi\.js($|\/)/],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
    },
    resolve: {
      alias: { src: resolve("src/") },
      dedupe: ["react", "react-dom", "pixi.js"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "pixi.js"],
      exclude: ["@posthog/hedgehog-mode"],
    },
    test: {
      globals: true,
      include: ["test/*.test.ts"],
    },
    plugins: [
      // generate typescript types
      dts({
        insertTypesEntry: true,
      }),
    ],
    define: {
      "import.meta.vitest": mode !== "production",
    },
  };
});
