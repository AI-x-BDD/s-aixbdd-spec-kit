import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:5183",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm --prefix backend run dev",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm --prefix frontend run dev -- --port 5183 --strictPort",
      port: 5183,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
