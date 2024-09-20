import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // append the CopyPlugin to copy the file to your public dir
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "node_modules/hedgehog-mode/assets"),
            to: path.resolve(__dirname, "public/assets"),
          },
        ],
      })
    );

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
