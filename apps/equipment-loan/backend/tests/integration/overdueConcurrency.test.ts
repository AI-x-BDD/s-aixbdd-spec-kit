import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { dispatchDueNotifications } from "../../src/jobs/overdueScheduler.js";
import { runOverdueCheck } from "../../src/services/overdueNotificationService.js";
import { getSlotStartUtc } from "../../src/utils/taipeiTime.js";
import {
  createDiscordWebhookSimulator,
  type DiscordWebhookSimulator,
} from "../../scripts/discordWebhookSimulator.js";

// 逾期通知不重複整合測試（SC-002；notification/plan.md §7 NS19、NS20；research §8）：
// 真實 PostgreSQL 的唯一約束與條件式更新。手動檢查（POST /api/admin/overdue-checks）與自動檢查
// （runOverdueCheck）以 Promise.all 同時執行，重複 20 輪，每輪重設資料；再同時送出兩個重送請求。
// 系統時間固定在 2031-06-10 下午時段結束後 10 分鐘，不依賴執行當下的台北時間。

const ROUNDS = 20;
const DATE = "2031-06-10";
const NOW = new Date(getSlotStartUtc(DATE, "17:00").getTime() + 10 * 60 * 1000);

const WU = { username: "wu.chenghan", password: "Admin@2026" };
const WU_ID = "11111111-1111-4111-8111-111111111103";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const AFTERNOON = "33333333-3333-4333-8333-333333333002";
const RESERVATION_NO = "RV-T032-0001";

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

describe("逾期通知不重複（SC-002、FR-012、FR-018、US2 情境 14、US3 情境 4）", () => {
  const originalWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  let admin: string;
  let equipmentId: string;
  let simulator: DiscordWebhookSimulator | null = null;

  async function resetData(): Promise<string> {
    await prisma.overdue_notifications.deleteMany({});
    await prisma.reservations.deleteMany({ where: { reservation_no: RESERVATION_NO } });
    const row = await prisma.reservations.create({
      data: {
        reservation_no: RESERVATION_NO,
        user_id: CHEN_ID,
        equipment_id: equipmentId,
        reservation_date: new Date(`${DATE}T00:00:00Z`),
        slot_id: AFTERNOON,
        status: "checked_out",
        checked_out_by: WU_ID,
        checked_out_at: new Date(`${DATE}T05:05:00Z`),
      },
    });
    return row.id;
  }

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
  });

  afterAll(async () => {
    vi.useRealTimers();
    if (originalWebhookUrl === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = originalWebhookUrl;
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it(`NS19 手動檢查與自動檢查同時執行 ${ROUNDS} 輪：每輪只有 1 則通知、createdCount 合計 1、模擬器只收到 1 則訊息`, async () => {
    simulator = await createDiscordWebhookSimulator({ port: 0, mode: "success" });
    process.env.DISCORD_WEBHOOK_URL = simulator.webhookUrl;

    for (let round = 0; round < ROUNDS; round += 1) {
      const reservationId = await resetData();
      simulator.clearMessages();

      const [manual, autoCreated] = await Promise.all([
        request(app).post("/api/admin/overdue-checks").set("Authorization", `Bearer ${admin}`),
        runOverdueCheck(new Date()),
      ]);
      expect(manual.status, `round ${round}`).toBe(200);
      expect(manual.body.createdCount + autoCreated, `round ${round}`).toBe(1);

      expect(
        await prisma.overdue_notifications.count({ where: { reservation_id: reservationId } }),
        `round ${round}`,
      ).toBe(1);
      expect(await prisma.overdue_notifications.count({}), `round ${round}`).toBe(1);

      // 同時執行兩個送出程序，也只會送出 1 則
      await Promise.all([dispatchDueNotifications(NOW), dispatchDueNotifications(NOW)]);
      expect(simulator.getMessages(), `round ${round}`).toHaveLength(1);
      const row = await prisma.overdue_notifications.findUniqueOrThrow({
        where: { reservation_id: reservationId },
      });
      expect(row.status, `round ${round}`).toBe("sent");
      expect(row.attempt_count, `round ${round}`).toBe(1);
    }
  }, 60_000);

  it("NS20 同時送出兩個重送：只有一個回 202、另一個回 409，通知總數不變，模擬器只收到 1 次", async () => {
    simulator = await createDiscordWebhookSimulator({ port: 0, mode: "success" });
    process.env.DISCORD_WEBHOOK_URL = simulator.webhookUrl;
    const reservationId = await resetData();
    const notification = await prisma.overdue_notifications.create({
      data: {
        reservation_id: reservationId,
        status: "failed",
        attempt_count: 4,
        auto_retry_count: 3,
        failure_reason: "discord_server_error",
        last_attempted_at: NOW,
      },
    });

    const resend = () =>
      request(app)
        .post(`/api/admin/overdue-notifications/${notification.id}/resend`)
        .set("Authorization", `Bearer ${admin}`);
    const responses = await Promise.all([resend(), resend()]);

    const statuses = responses.map((r) => r.status).sort();
    expect(statuses).toEqual([202, 409]);
    const conflict = responses.find((r) => r.status === 409);
    expect(conflict?.body.code).toBe("OVERDUE_NOTIFICATION_NOT_RESENDABLE");

    // 重送由送出程序接手；同時執行兩個送出程序也只送出 1 次
    await Promise.all([dispatchDueNotifications(NOW), dispatchDueNotifications(NOW)]);
    expect(simulator.getMessages()).toHaveLength(1);
    expect(await prisma.overdue_notifications.count({})).toBe(1);
    const row = await prisma.overdue_notifications.findUniqueOrThrow({
      where: { id: notification.id },
    });
    expect(row.status).toBe("sent");
    expect(row.attempt_count).toBe(5);
  });
});
