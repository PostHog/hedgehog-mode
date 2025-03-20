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
        external: ["react", "react-dom"],
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
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
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
