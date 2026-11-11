import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { dispatchDueNotifications } from "../../src/jobs/overdueScheduler.js";
import { getSlotStartUtc } from "../../src/utils/taipeiTime.js";
import {
  createDiscordWebhookSimulator,
  type DiscordWebhookSimulator,
} from "../../scripts/discordWebhookSimulator.js";

// 逾期通知角色權限整合測試（SC-007 的權限部分、FR-019、NFR-002）：
// 一般成員以 HTTP 呼叫查看通知紀錄、重送通知與手動逾期檢查，100% 回 403 FORBIDDEN，訊息為繁體中文，
// 且沒有建立或送出任何通知。系統時間固定在 2031-06-10 下午時段結束後 10 分鐘。

const DATE = "2031-06-10";
const NOW = new Date(getSlotStartUtc(DATE, "17:00").getTime() + 10 * 60 * 1000);

const LIN = { username: "lin.yating", password: "Member@2026" };
const WU_ID = "11111111-1111-4111-8111-111111111103";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const MORNING = "33333333-3333-4333-8333-333333333001";
const AFTERNOON = "33333333-3333-4333-8333-333333333002";

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

describe("逾期通知角色權限（SC-007、FR-019）", () => {
  const originalWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  let member: string;
  let simulator: DiscordWebhookSimulator;
  let failedNotificationId: string;

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
    simulator = await createDiscordWebhookSimulator({ port: 0, mode: "success" });
    process.env.DISCORD_WEBHOOK_URL = simulator.webhookUrl;

    // 一筆已有「送出失敗」通知的逾期借用，另一筆還沒有通知的逾期借用
    const withNotification = await prisma.reservations.create({
      data: {
        reservation_no: "RV-T035-0001",
        user_id: CHEN_ID,
        equipment_id: equipment.id,
        reservation_date: new Date(`${DATE}T00:00:00Z`),
        slot_id: AFTERNOON,
        status: "checked_out",
        checked_out_by: WU_ID,
        checked_out_at: new Date(`${DATE}T05:05:00Z`),
      },
    });
    await prisma.reservations.create({
      data: {
        reservation_no: "RV-T035-0002",
        user_id: CHEN_ID,
        equipment_id: equipment.id,
        reservation_date: new Date(`${DATE}T00:00:00Z`),
        slot_id: MORNING,
        status: "checked_out",
        checked_out_by: WU_ID,
        checked_out_at: new Date(`${DATE}T01:05:00Z`),
      },
    });
    const notification = await prisma.overdue_notifications.create({
      data: {
        reservation_id: withNotification.id,
        status: "failed",
        attempt_count: 4,
        auto_retry_count: 3,
        failure_reason: "discord_server_error",
        last_attempted_at: NOW,
      },
    });
    failedNotificationId = notification.id;

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    member = await login(LIN);
  });

  afterEach(async () => {
    simulator.clearMessages();
  });

  afterAll(async () => {
    vi.useRealTimers();
    await simulator.close();
    if (originalWebhookUrl === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = originalWebhookUrl;
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  async function expectNothingChanged(): Promise<void> {
    // 沒有建立新通知、原通知沒有改變，也沒有送出任何訊息
    expect(await prisma.overdue_notifications.count({})).toBe(1);
    const row = await prisma.overdue_notifications.findUniqueOrThrow({
      where: { id: failedNotificationId },
    });
    expect(row.status).toBe("failed");
    expect(row.attempt_count).toBe(4);
    expect(row.updated_by).toBeNull();
    expect(await dispatchDueNotifications(NOW)).toBe(0);
    expect(simulator.getMessages()).toHaveLength(0);
  }

  function expectForbidden(res: request.Response): void {
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
    expect(typeof res.body.message).toBe("string");
    // 繁體中文提示：含中日韓字元，且不是英文預設訊息
    expect(res.body.message).toMatch(/[一-鿿]/);
  }

  it("一般成員查看通知紀錄：403 FORBIDDEN，訊息為繁體中文", async () => {
    const res = await request(app)
      .get("/api/admin/overdue-notifications")
      .query({ page: 1, pageSize: 20 })
      .set("Authorization", `Bearer ${member}`);
    expectForbidden(res);
    expect(res.body.items).toBeUndefined();
    await expectNothingChanged();
  });

  it("一般成員重送通知：403 FORBIDDEN，通知狀態不變、沒有送出", async () => {
    const res = await request(app)
      .post(`/api/admin/overdue-notifications/${failedNotificationId}/resend`)
      .set("Authorization", `Bearer ${member}`);
    expectForbidden(res);
    await expectNothingChanged();
  });

  it("一般成員手動逾期檢查：403 FORBIDDEN，不建立通知", async () => {
    const res = await request(app)
      .post("/api/admin/overdue-checks")
      .set("Authorization", `Bearer ${member}`);
    expectForbidden(res);
    expect(res.body.createdCount).toBeUndefined();
    await expectNothingChanged();
  });
});
