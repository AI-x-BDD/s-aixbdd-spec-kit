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
      // 本機 Discord Webhook 模擬器（連接埠 4010）；後端的逾期通知送到這裡，不會連到真實的 Discord
      command: "npm --prefix backend run discord:sim",
      url: "http://127.0.0.1:4010/__sim/state",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm --prefix backend run dev",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      // 後端 dev 會啟動排程：關閉自動逾期檢查，避免 demo seed 的逾期借用被自動建立通知並送出
      env: {
        OVERDUE_AUTO_CHECK_ENABLED: "false",
        DISCORD_WEBHOOK_URL:
          "http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token",
      },
    },
    {
      command: "npm --prefix frontend run dev -- --port 5183 --strictPort",
      port: 5183,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
