import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { addDaysToDateStr, getSlotStartUtc, getTaipeiNow } from "../../src/utils/taipeiTime.js";

// 設備狀態變更回應時間（research §5）：真實 PostgreSQL，量測 SC-006、NFR-002。
// 一台測試設備有 100 筆尚未結束的預約（另有 20 筆改期審核中申請），量測預覽、設為送修、設為停用與恢復可用都低於 2 秒。
// 系統時間固定在「今日 08:00 Asia/Taipei」；預約排在明天起的時段，都尚未結束。

const LIMIT_MS = 2000;
const RESERVATIONS = 100;
const TODAY = getTaipeiNow().dateStr;

const WU = { username: "wu.chenghan", password: "Admin@2026" };
const MEMBER_IDS = ["11111111-1111-4111-8111-111111111101", "11111111-1111-4111-8111-111111111102"];
const WU_ID = "11111111-1111-4111-8111-111111111103";
const SLOTS = [
  "33333333-3333-4333-8333-333333333001",
  "33333333-3333-4333-8333-333333333002",
  "33333333-3333-4333-8333-333333333003",
];
const TEST_EQ = "22222222-2222-4222-8222-222222222940";

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

let seq = 0;

/** 建立 100 筆尚未結束的預約：明天起依序排在每天的 3 個時段，待審核與已核准／有效各半；前 20 筆已核准附改期審核中申請。 */
async function seedUpcomingReservations(dayOffset: number): Promise<void> {
  let reschedules = 0;
  for (let i = 0; i < RESERVATIONS; i += 1) {
    seq += 1;
    const dateStr = addDaysToDateStr(TODAY, dayOffset + Math.floor(i / SLOTS.length));
    const slotId = SLOTS[i % SLOTS.length];
    const status = i % 2 === 0 ? "confirmed" : "pending_approval";
    const row = await prisma.reservations.create({
      data: {
        reservation_no: `RV-T040-${String(seq).padStart(4, "0")}`,
        user_id: MEMBER_IDS[i % MEMBER_IDS.length],
        equipment_id: TEST_EQ,
        reservation_date: new Date(`${dateStr}T00:00:00Z`),
        slot_id: slotId,
        status,
        reviewed_by: status === "confirmed" ? WU_ID : null,
        reviewed_at: status === "confirmed" ? new Date() : null,
      },
    });
    if (status === "confirmed" && reschedules < 20) {
      reschedules += 1;
      await prisma.reschedule_requests.create({
        data: {
          request_no: `RS-T040-${String(seq).padStart(4, "0")}`,
          reservation_id: row.id,
          user_id: row.user_id,
          from_reservation_date: row.reservation_date,
          from_slot_id: slotId,
          to_reservation_date: new Date(`${addDaysToDateStr(dateStr, 60)}T00:00:00Z`),
          to_slot_id: slotId,
          status: "pending_approval",
        },
      });
    }
  }
}

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  const result = await fn();
  return { result, ms: performance.now() - start };
}

describe("Iteration 5 Equipment Status Performance (SC-006, NFR-002)", () => {
  let wu: string;

  beforeAll(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(getSlotStartUtc(TODAY, "08:00"));
    await seedDatabase();
    await prisma.equipments.create({
      data: {
        id: TEST_EQ,
        equipment_code: "EQ-940",
        name: "效能測試設備 T040",
        category: "整合測試",
        status: "available",
        requires_approval: true,
        updated_by: WU_ID,
      },
    });
    wu = await login(WU);
  });

  afterAll(async () => {
    vi.useRealTimers();
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it(`100 筆尚未結束的預約時，預覽、設為送修、設為停用與恢復可用的回應時間都低於 ${LIMIT_MS} ms`, async () => {
    const measured: Record<string, number> = {};

    for (const [index, targetStatus] of (["maintenance", "retired"] as const).entries()) {
      // 每輪重新建立 100 筆尚未結束的預約（前一輪被取消的預約不會復原）
      await seedUpcomingReservations(1 + index * 40);

      const preview = await timed(() =>
        request(app)
          .get(`/api/admin/equipments/${TEST_EQ}/status-change-preview`)
          .query({ targetStatus })
          .set("Authorization", `Bearer ${wu}`),
      );
      expect(preview.result.status).toBe(200);
      expect(preview.result.body.cancelCount).toBe(RESERVATIONS);
      expect(preview.result.body.expireCount).toBe(20);
      measured[`preview ${targetStatus}`] = preview.ms;

      const setting = await timed(() =>
        request(app)
          .patch(`/api/admin/equipments/${TEST_EQ}/status`)
          .set("Authorization", `Bearer ${wu}`)
          .send({
            targetStatus,
            expectedCurrentStatus: preview.result.body.currentStatus,
            expectedCancelCount: preview.result.body.cancelCount,
            expectedExpireCount: preview.result.body.expireCount,
          }),
      );
      expect(setting.result.status).toBe(200);
      expect(setting.result.body.statusChange.cancelledReservationCount).toBe(RESERVATIONS);
      expect(setting.result.body.expiredRescheduleRequestCount).toBe(20);
      measured[`set ${targetStatus}`] = setting.ms;

      const restore = await timed(() =>
        request(app)
          .patch(`/api/admin/equipments/${TEST_EQ}/status`)
          .set("Authorization", `Bearer ${wu}`)
          .send({ targetStatus: "available" }),
      );
      expect(restore.result.status).toBe(200);
      expect(restore.result.body.equipment.status).toBe("available");
      measured[`restore from ${targetStatus}`] = restore.ms;
    }

    console.info(
      `[T040] 回應時間（ms）：${Object.entries(measured)
        .map(([label, ms]) => `${label}=${ms.toFixed(1)}`)
        .join("、")}`,
    );
    for (const [label, ms] of Object.entries(measured)) {
      expect(ms, label).toBeLessThan(LIMIT_MS);
    }
  });
});
