// https://vitejs.dev/config
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@posthog/hedgehog-mode"],
  },
  server: {
    watch: {
      ignored: ["!**/node_modules/@posthog/hedgehog-mode/dist/**"],
    },
  },
});
