import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { dispatchDueNotifications } from "../../src/jobs/overdueScheduler.js";
import { runOverdueCheck } from "../../src/services/overdueNotificationService.js";
import { addDaysToDateStr, getSlotStartUtc } from "../../src/utils/taipeiTime.js";
import {
  createDiscordWebhookSimulator,
  type DiscordWebhookSimulator,
  type SimulatorMode,
} from "../../scripts/discordWebhookSimulator.js";

// Webhook 位址不外洩整合測試（SC-006、NFR-003、FR-015；notification/plan.md §7 NS23、§6）：
// 以 vi.spyOn 收集 console.log、console.warn、console.error；模擬器依序切換 6 種模式並停止一次，
// 送出程序處理每種情況；再搜尋 log、所有 API 回應與 overdue_notifications 的內容，
// Webhook 位址的任何部分（完整位址、路徑、Webhook ID、token）出現次數必須為 0。
// 系統時間以 vi.setSystemTime 固定，每個情況使用各自的日期（2031 年起、逐日遞增）。

const WU = { username: "wu.chenghan", password: "Admin@2026" };
const WU_ID = "11111111-1111-4111-8111-111111111103";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const AFTERNOON = "33333333-3333-4333-8333-333333333002";

const SECRET_TOKEN = "simulator-token";
// Webhook ID 全為 0，會和模擬器產生的訊息編號（1000000000000000000 起）重疊，所以改搜尋含 ID 的路徑片段
const SECRET_WEBHOOK_PATH = "webhooks/000000000000000000";

interface Scenario {
  name: string;
  mode: SimulatorMode | "stopped";
  settings?: { retryAfterSeconds?: number; statusCode?: number };
  /** 送出程序執行的時間點（距離時段結束的秒數） */
  dispatchOffsets: number[];
}

// 順序固定：6 種模式依序切換，最後停止模擬器
const SCENARIOS: Scenario[] = [
  { name: "success", mode: "success", dispatchOffsets: [60] },
  {
    name: "rate_limit",
    mode: "rate_limit",
    settings: { retryAfterSeconds: 120 },
    dispatchOffsets: [60],
  },
  { name: "server_error", mode: "server_error", dispatchOffsets: [60, 62, 66, 74] },
  { name: "timeout", mode: "timeout", dispatchOffsets: [60] },
  { name: "disconnect", mode: "disconnect", dispatchOffsets: [60] },
  { name: "not_found", mode: "not_found", dispatchOffsets: [60] },
  { name: "stopped", mode: "stopped", dispatchOffsets: [60, 62, 66, 74] },
];

async function login(user: { username: string; password: string }): Promise<string> {
  const cap = await request(app).post("/api/auth/captcha").send({});
  expect(cap.status).toBe(201);
  const res = await request(app).post("/api/auth/login").send({
    username: user.username,
    password: user.password,
    challengeId: cap.body.challengeId,
    captchaCode: cap.body.captchaCode,
  });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

describe("Webhook 位址不外洩（SC-006、NFR-003）", () => {
  const originalWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  let simulator: DiscordWebhookSimulator | null = null;
  const logs: string[] = [];
  const responseBodies: string[] = [];
  let equipmentId: string;

  beforeAll(async () => {
    await seedDatabase();
    // demo seed 內本來就有逾期的借用中紀錄；改為已歸還，讓逾期檢查只看到本檔建立的資料
    await prisma.overdue_notifications.deleteMany({});
    await prisma.reservations.updateMany({
      where: { status: "checked_out" },
      data: { status: "returned", returned_by: WU_ID, returned_at: new Date() },
    });
    const equipment = await prisma.equipments.findFirstOrThrow({
      where: { equipment_code: "EQ-102" },
    });
    equipmentId = equipment.id;
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(async () => {
    if (simulator !== null) {
      await simulator.close();
      simulator = null;
    }
  });

  afterAll(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalWebhookUrl === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = originalWebhookUrl;
    await prisma.overdue_notifications.deleteMany({});
    await prisma.reservations.deleteMany({ where: { reservation_no: { startsWith: "RV-T034-" } } });
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it("6 種模式與停止模擬器都處理一次後，log、API 回應與通知紀錄都找不到 Webhook 位址（出現次數 0）", async () => {
    for (const method of ["log", "warn", "error"] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logs.push(args.map(String).join(" "));
      });
    }

    const webhookUrls: string[] = [];
    for (const [index, scenario] of SCENARIOS.entries()) {
      const date = addDaysToDateStr("2031-04-01", index);
      const slotEnd = getSlotStartUtc(date, "17:00");
      const at = (seconds: number): Date => {
        const value = new Date(slotEnd.getTime() + seconds * 1000);
        vi.setSystemTime(value);
        return value;
      };

      simulator = await createDiscordWebhookSimulator({
        port: 0,
        mode: scenario.mode === "stopped" ? "success" : scenario.mode,
      });
      webhookUrls.push(simulator.webhookUrl);
      process.env.DISCORD_WEBHOOK_URL = simulator.webhookUrl;
      if (scenario.mode === "stopped") {
        await simulator.close();
        simulator = null;
      } else if (scenario.settings !== undefined) {
        simulator.setMode({ mode: scenario.mode, ...scenario.settings });
      }

      await prisma.reservations.create({
        data: {
          reservation_no: `RV-T034-${String(index + 1).padStart(4, "0")}`,
          user_id: CHEN_ID,
          equipment_id: equipmentId,
          reservation_date: new Date(`${date}T00:00:00Z`),
          slot_id: AFTERNOON,
          status: "checked_out",
          checked_out_by: WU_ID,
          checked_out_at: new Date(`${date}T05:05:00Z`),
        },
      });

      const admin = await (async () => {
        at(60);
        return login(WU);
      })();
      const check = await request(app)
        .post("/api/admin/overdue-checks")
        .set("Authorization", `Bearer ${admin}`);
      expect(check.status, scenario.name).toBe(200);
      expect(check.body.createdCount, scenario.name).toBe(1);
      responseBodies.push(JSON.stringify(check.body));

      for (const seconds of scenario.dispatchOffsets) {
        await dispatchDueNotifications(at(seconds));
      }

      const list = await request(app)
        .get("/api/admin/overdue-notifications")
        .query({ page: 1, pageSize: 100 })
        .set("Authorization", `Bearer ${admin}`);
      expect(list.status, scenario.name).toBe(200);
      responseBodies.push(JSON.stringify(list.body));
    }

    // 每個情況都確實處理過一則通知，而且狀態與失敗原因符合各模式
    const rows = await prisma.overdue_notifications.findMany({
      include: { reservation: true },
      orderBy: { reservation: { reservation_no: "asc" } },
    });
    expect(rows.map((r) => [r.status, r.failure_reason])).toEqual([
      ["sent", null],
      ["failed", "rate_limited"],
      ["failed", "discord_server_error"],
      ["unknown", null],
      ["unknown", null],
      ["failed", "webhook_invalid"],
      ["failed", "connection_failed"],
    ]);

    // 重送與錯誤回應也不含位址
    const admin = await login(WU);
    const failed = rows[5];
    const resend = await request(app)
      .post(`/api/admin/overdue-notifications/${failed.id}/resend`)
      .set("Authorization", `Bearer ${admin}`);
    expect(resend.status).toBe(202);
    responseBodies.push(JSON.stringify(resend.body));
    const notResendable = await request(app)
      .post(`/api/admin/overdue-notifications/${failed.id}/resend`)
      .set("Authorization", `Bearer ${admin}`);
    expect(notResendable.status).toBe(409);
    responseBodies.push(JSON.stringify(notResendable.body));
    const missing = await request(app)
      .post("/api/admin/overdue-notifications/00000000-0000-4000-8000-000000000000/resend")
      .set("Authorization", `Bearer ${admin}`);
    expect(missing.status).toBe(404);
    responseBodies.push(JSON.stringify(missing.body));

    // 沒有設定位址時 log 只寫固定文字
    process.env.DISCORD_WEBHOOK_URL = "";
    await runOverdueCheck(new Date());
    await dispatchDueNotifications(new Date());

    const tableContent = JSON.stringify(await prisma.overdue_notifications.findMany({}));
    const searched = [...logs, ...responseBodies, tableContent].join("\n");

    // 搜尋範圍不是空的：確實收集到 log 與 API 回應
    expect(logs.length).toBeGreaterThan(0);
    expect(responseBodies.length).toBeGreaterThan(0);
    expect(logs.some((line) => line.includes("[discordWebhookClient]"))).toBe(true);

    const secrets = [
      SECRET_TOKEN,
      SECRET_WEBHOOK_PATH,
      "/api/webhooks",
      ...webhookUrls,
      ...webhookUrls.map((url) => new URL(url).host),
    ];
    for (const secret of secrets) {
      expect(searched.split(secret).length - 1, `出現次數：${secret}`).toBe(0);
    }
  }, 60_000);
});
