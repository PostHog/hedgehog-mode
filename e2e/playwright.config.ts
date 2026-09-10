import { defineConfig, devices } from "@playwright/test";

const PORT = 8010;

export default defineConfig({
  testDir: "./tests",
  // These tests wait on real asset loading and a settling physics world.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // The "frames differ" check compares two screenshots 1.2s apart. Sprite animation makes an
  // identical pair very unlikely, but it is the one timing-dependent assertion here, so give
  // CI a single retry rather than a red build over one unlucky frame.
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "list" : "line",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // CI runners have no GPU. Without SwiftShader pixi gets no WebGL context and the
          // suite fails for a reason that has nothing to do with the CSP.
          args: [
            "--enable-unsafe-swiftshader",
            "--use-gl=angle",
            "--use-angle=swiftshader",
          ],
        },
      },
    },
  ],
  webServer: {
    command: "node server.mjs",
    port: PORT,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
  },
});
