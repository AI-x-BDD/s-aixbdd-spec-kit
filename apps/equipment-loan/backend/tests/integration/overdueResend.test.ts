import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { dispatchDueNotifications } from "../../src/jobs/overdueScheduler.js";
import { addDaysToDateStr, getSlotStartUtc } from "../../src/utils/taipeiTime.js";
import {
  createDiscordWebhookSimulator,
  type DiscordWebhookSimulator,
} from "../../scripts/discordWebhookSimulator.js";

// 重送與手動檢查回應時間整合測試（SC-004、SC-005；FR-005、NFR-001；research §8）：
// 真實 PostgreSQL；系統時間固定在 2031-06-10 下午時段結束後 10 分鐘，不依賴執行當下的台北時間。

const DATE = "2031-06-10";
const NOW = new Date(getSlotStartUtc(DATE, "17:00").getTime() + 10 * 60 * 1000);

const WU = { username: "wu.chenghan", password: "Admin@2026" };
const WU_ID = "11111111-1111-4111-8111-111111111103";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const AFTERNOON = "33333333-3333-4333-8333-333333333002";
const LOAN_COUNT = 100;
const RESPONSE_LIMIT_MS = 2000;

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

describe("重送與手動檢查回應時間（SC-004、SC-005）", () => {
  const originalWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  let admin: string;
  let equipmentId: string;
  let simulator: DiscordWebhookSimulator | null = null;

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
    vi.setSystemTime(NOW);
    admin = await login(WU);
  });

  afterEach(async () => {
    if (simulator !== null) {
      await simulator.close();
      simulator = null;
    }
    await prisma.overdue_notifications.deleteMany({});
    await prisma.reservations.deleteMany({ where: { reservation_no: { startsWith: "RV-T033-" } } });
  });

  afterAll(async () => {
    vi.useRealTimers();
    if (originalWebhookUrl === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = originalWebhookUrl;
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it("SC-004 重送「送出失敗」的通知、模擬器為 success：同一則通知變成 sent，attempt_count 加 1，通知總數不變", async () => {
    simulator = await createDiscordWebhookSimulator({ port: 0, mode: "success" });
    process.env.DISCORD_WEBHOOK_URL = simulator.webhookUrl;
    const reservation = await prisma.reservations.create({
      data: {
        reservation_no: "RV-T033-0001",
        user_id: CHEN_ID,
        equipment_id: equipmentId,
        reservation_date: new Date(`${DATE}T00:00:00Z`),
        slot_id: AFTERNOON,
        status: "checked_out",
        checked_out_by: WU_ID,
        checked_out_at: new Date(`${DATE}T05:05:00Z`),
      },
    });
    const notification = await prisma.overdue_notifications.create({
      data: {
        reservation_id: reservation.id,
        status: "failed",
        attempt_count: 4,
        auto_retry_count: 3,
        failure_reason: "discord_server_error",
        last_attempted_at: NOW,
      },
    });
    const totalBefore = await prisma.overdue_notifications.count({});

    const res = await request(app)
      .post(`/api/admin/overdue-notifications/${notification.id}/resend`)
      .set("Authorization", `Bearer ${admin}`);
    expect(res.status).toBe(202);
    expect(res.body.id).toBe(notification.id);
    expect(res.body.status).toBe("sending");

    // 重送由送出程序接手
    expect(await dispatchDueNotifications(NOW)).toBe(1);

    const row = await prisma.overdue_notifications.findUniqueOrThrow({
      where: { id: notification.id },
    });
    expect(row.status).toBe("sent");
    expect(row.attempt_count).toBe(5);
    expect(row.failure_reason).toBeNull();
    expect(row.discord_message_id).toBeTruthy();
    expect(await prisma.overdue_notifications.count({})).toBe(totalBefore);
    expect(simulator.getMessages()).toHaveLength(1);
  });

  it(`SC-005 ${LOAN_COUNT} 筆逾期借用：POST /api/admin/overdue-checks 回應時間低於 2 秒，createdCount 為 ${LOAN_COUNT}`, async () => {
    await prisma.reservations.createMany({
      data: Array.from({ length: LOAN_COUNT }, (_, i) => ({
        reservation_no: `RV-T033-${String(i + 1).padStart(4, "0")}`,
        user_id: CHEN_ID,
        equipment_id: equipmentId,
        reservation_date: new Date(`${addDaysToDateStr("2031-01-01", i)}T00:00:00Z`),
        slot_id: AFTERNOON,
        status: "checked_out" as const,
        checked_out_by: WU_ID,
        checked_out_at: new Date(`${addDaysToDateStr("2031-01-01", i)}T05:05:00Z`),
      })),
    });

    const startedAt = performance.now();
    const res = await request(app)
      .post("/api/admin/overdue-checks")
      .set("Authorization", `Bearer ${admin}`);
    const elapsedMs = performance.now() - startedAt;

    expect(res.status).toBe(200);
    expect(res.body.createdCount).toBe(LOAN_COUNT);
    expect(await prisma.overdue_notifications.count({})).toBe(LOAN_COUNT);
    expect(elapsedMs).toBeLessThan(RESPONSE_LIMIT_MS);
    console.info(
      `[SC-005] ${LOAN_COUNT} 筆逾期借用的手動檢查回應時間：${Math.round(elapsedMs)} ms`,
    );
  });
});
