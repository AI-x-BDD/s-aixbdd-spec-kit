import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { addDaysToDateStr, getSlotStartUtc, getTaipeiNow } from "../../src/utils/taipeiTime.js";

// 設定送修與預約、核准並發整合測試（research §5、§3）：真實 PostgreSQL 的設備列鎖，量測 SC-002、FR-009、US1 情境 12。
// 每輪建立一台新的測試設備，以 Promise.all 同時送出兩個請求，各重複 20 輪。
// 系統時間固定在「今日 08:00 Asia/Taipei」，明天的時段都尚未開始。
//
// 「預約先拿到鎖」的輪次：設定交易重算數量時多了一筆新預約，依 FR-019 回 409 EQUIPMENT_STATE_CHANGED、資料不變
// （research §3「把它取消或因數量不同依 FR-019 拒絕」）。管理員依提示「請重新確認」重新預覽並確認後，
// 新預約被取消並帶 equipment_maintenance。每輪在管理員的設定流程完成後檢查設備沒有尚未結束的預約。

const ROUNDS = 20;
const TODAY = getTaipeiNow().dateStr;
const TOMORROW = addDaysToDateStr(TODAY, 1);

const LIN = { username: "lin.yating", password: "Member@2026" };
const WU = { username: "wu.chenghan", password: "Admin@2026" };
const LIN_ID = "11111111-1111-4111-8111-111111111101";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const WU_ID = "11111111-1111-4111-8111-111111111103";
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

let seq = 0;

async function createTestEquipment(requiresApproval: boolean): Promise<string> {
  seq += 1;
  const id = `22222222-2222-4222-8222-222222${String(910000 + seq)}`;
  await prisma.equipments.create({
    data: {
      id,
      equipment_code: `EQ-C${String(seq).padStart(3, "0")}`,
      name: `並發測試設備 ${seq}`,
      category: "整合測試",
      status: "available",
      requires_approval: requiresApproval,
      updated_by: WU_ID,
    },
  });
  return id;
}

async function insertReservation(
  equipmentId: string,
  status: "pending_approval" | "confirmed",
  slotId: string,
  userId: string,
): Promise<string> {
  seq += 1;
  const row = await prisma.reservations.create({
    data: {
      reservation_no: `RV-T039-${String(seq).padStart(4, "0")}`,
      user_id: userId,
      equipment_id: equipmentId,
      reservation_date: new Date(`${TOMORROW}T00:00:00Z`),
      slot_id: slotId,
      status,
      reviewed_by: status === "confirmed" ? WU_ID : null,
      reviewed_at: status === "confirmed" ? new Date() : null,
    },
  });
  return row.id;
}

function preview(token: string, equipmentId: string) {
  return request(app)
    .get(`/api/admin/equipments/${equipmentId}/status-change-preview`)
    .query({ targetStatus: "maintenance" })
    .set("Authorization", `Bearer ${token}`);
}

function setMaintenance(
  token: string,
  equipmentId: string,
  p: { currentStatus: string; cancelCount: number; expireCount: number },
) {
  return request(app)
    .patch(`/api/admin/equipments/${equipmentId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      targetStatus: "maintenance",
      expectedCurrentStatus: p.currentStatus,
      expectedCancelCount: p.cancelCount,
      expectedExpireCount: p.expireCount,
    });
}

/** 設備尚未結束的待審核與已核准／有效預約筆數（明天的時段都尚未結束）。 */
async function upcomingCount(equipmentId: string): Promise<number> {
  return prisma.reservations.count({
    where: {
      equipment_id: equipmentId,
      status: { in: ["pending_approval", "confirmed"] },
      deleted_at: null,
    },
  });
}

describe("Iteration 5 Equipment Maintenance Concurrency (SC-002, FR-009, US1 scenario 12)", () => {
  let lin: string;
  let wu: string;

  beforeAll(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(getSlotStartUtc(TODAY, "08:00"));
    await seedDatabase();
    lin = await login(LIN);
    wu = await login(WU);
  });

  afterAll(async () => {
    vi.useRealTimers();
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it(`同時送出新預約與設定送修 ${ROUNDS} 輪：設備留下尚未結束預約 0 筆，新預約不是被拒絕就是被取消並帶 equipment_maintenance`, async () => {
    const outcomes = { settingFirst: 0, reservationFirst: 0 };
    let leftover = 0;

    for (let round = 0; round < ROUNDS; round += 1) {
      // 免審核設備：新預約一成立就是已核准／有效；另有一筆既有預約，讓確認視窗的數量不為 0
      const equipmentId = await createTestEquipment(false);
      await insertReservation(equipmentId, "confirmed", AFTERNOON, CHEN_ID);
      const p = await preview(wu, equipmentId);
      expect(p.status).toBe(200);
      expect(p.body.cancelCount).toBe(1);

      const [created, setting] = await Promise.all([
        request(app)
          .post("/api/reservations")
          .set("Authorization", `Bearer ${lin}`)
          .send({ equipmentId, reservationDate: TOMORROW, slotId: MORNING }),
        setMaintenance(wu, equipmentId, p.body),
      ]);

      if (setting.status === 200) {
        // 設定先拿到鎖（或預約在設定重算前尚未提交）：新預約被拒絕，或成立後在同一個設定交易中被取消
        outcomes.settingFirst += 1;
        if (created.status === 201) {
          const row = await prisma.reservations.findUniqueOrThrow({
            where: { id: created.body.id },
          });
          expect(row.status, `round ${round}`).toBe("cancelled");
          expect(row.cancel_reason, `round ${round}`).toBe("equipment_maintenance");
        } else {
          expect(created.status, `round ${round}`).toBe(409);
          expect(created.body.code, `round ${round}`).toBe("EQUIPMENT_UNAVAILABLE");
        }
      } else {
        // 預約先拿到鎖：數量和確認視窗不同，依 FR-019 拒絕，設備仍可用、新預約成立
        outcomes.reservationFirst += 1;
        expect(created.status, `round ${round}`).toBe(201);
        expect(setting.status, `round ${round}`).toBe(409);
        expect(setting.body.code, `round ${round}`).toBe("EQUIPMENT_STATE_CHANGED");
        const unchanged = await prisma.equipments.findUniqueOrThrow({ where: { id: equipmentId } });
        expect(unchanged.status, `round ${round}`).toBe("available");
        expect(await upcomingCount(equipmentId), `round ${round}`).toBe(2);

        // 管理員依「請重新確認」重新預覽並確認
        const again = await preview(wu, equipmentId);
        expect(again.body.cancelCount, `round ${round}`).toBe(2);
        const retry = await setMaintenance(wu, equipmentId, again.body);
        expect(retry.status, `round ${round}`).toBe(200);
        const row = await prisma.reservations.findUniqueOrThrow({ where: { id: created.body.id } });
        expect(row.status, `round ${round}`).toBe("cancelled");
        expect(row.cancel_reason, `round ${round}`).toBe("equipment_maintenance");
      }

      leftover += await upcomingCount(equipmentId);
    }

    console.info(
      `[T039] 預約 × 設定送修 ${ROUNDS} 輪：設定先完成 ${outcomes.settingFirst} 輪；` +
        `預約先完成、設定依 FR-019 被拒絕後重新確認 ${outcomes.reservationFirst} 輪；留下未結束預約 ${leftover} 筆`,
    );
    expect(leftover).toBe(0);
  });

  it(`同時核准待審預約與設定送修 ${ROUNDS} 輪：設備留下尚未結束預約 0 筆`, async () => {
    const outcomes = { approvedFirst: 0, settingFirst: 0 };
    let leftover = 0;

    for (let round = 0; round < ROUNDS; round += 1) {
      const equipmentId = await createTestEquipment(true);
      const pendingId = await insertReservation(equipmentId, "pending_approval", MORNING, LIN_ID);
      const p = await preview(wu, equipmentId);
      expect(p.status).toBe(200);
      expect(p.body.cancelCount).toBe(1);

      const [approve, setting] = await Promise.all([
        request(app)
          .post(`/api/admin/reservations/${pendingId}/approve`)
          .set("Authorization", `Bearer ${wu}`),
        setMaintenance(wu, equipmentId, p.body),
      ]);

      // 核准不改變將取消的筆數（待審核與已核准／有效都會被取消），所以設定一定成功
      expect(setting.status, `round ${round}`).toBe(200);
      if (approve.status === 200) {
        outcomes.approvedFirst += 1;
      } else {
        outcomes.settingFirst += 1;
        expect(approve.status, `round ${round}`).toBe(409);
      }
      const row = await prisma.reservations.findUniqueOrThrow({ where: { id: pendingId } });
      expect(row.status, `round ${round}`).toBe("cancelled");
      expect(row.cancel_reason, `round ${round}`).toBe("equipment_maintenance");

      leftover += await upcomingCount(equipmentId);
    }

    console.info(
      `[T039] 核准 × 設定送修 ${ROUNDS} 輪：核准先完成 ${outcomes.approvedFirst} 輪；` +
        `設定先完成 ${outcomes.settingFirst} 輪；留下未結束預約 ${leftover} 筆`,
    );
    expect(leftover).toBe(0);
  });
});
