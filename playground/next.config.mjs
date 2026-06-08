/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the local workspace package so Next watches its built `dist`
  // (symlinked via pnpm) and hot-reloads the playground when the library is
  // rebuilt by `vite build --watch`. Without this, Next ignores node_modules.
  transpilePackages: ["@posthog/hedgehog-mode"],
};

export default nextConfig;
