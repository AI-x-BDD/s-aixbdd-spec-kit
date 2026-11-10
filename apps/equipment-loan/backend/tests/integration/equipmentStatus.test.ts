import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { addDaysToDateStr, getSlotStartUtc, getTaipeiNow } from "../../src/utils/taipeiTime.js";

// 設備送修與停用整合測試（research §5）：真實 PostgreSQL，量測 SC-001、SC-003 與 FR-002、FR-003、FR-019。
// 每個測試先以 demo seed 重設，再建立一台專用測試設備與它的預約，避免和 seed 的其他設備互相影響。
// 系統時間預設固定在「今日 08:00 Asia/Taipei」（所有今日時段都尚未開始）；FR-002、FR-003 再以 vi.setSystemTime 推進到時段進行中。

const TODAY = getTaipeiNow().dateStr;
const D = (days: number) => addDaysToDateStr(TODAY, days);

const LIN = { username: "lin.yating", password: "Member@2026" };
const WU = { username: "wu.chenghan", password: "Admin@2026" };

const LIN_ID = "11111111-1111-4111-8111-111111111101";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const WU_ID = "11111111-1111-4111-8111-111111111103";

const MORNING = "33333333-3333-4333-8333-333333333001";
const AFTERNOON = "33333333-3333-4333-8333-333333333002";
const EVENING = "33333333-3333-4333-8333-333333333003";

/** 專用測試設備（需人工審核，才能同時有待審核與已核准／有效預約）。 */
const TEST_EQ = "22222222-2222-4222-8222-222222222901";

type ReservationStatus =
  "pending_approval" | "confirmed" | "checked_out" | "returned" | "rejected" | "cancelled";

function setNow(dateStr: string, hhmm: string): void {
  vi.setSystemTime(getSlotStartUtc(dateStr, hhmm));
}

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

/** 直接寫入一筆測試設備的預約（測試資料準備，不經過 API 的時段檢查）。 */
async function insertReservation(
  status: ReservationStatus,
  dateStr: string,
  slotId: string,
  userId: string = LIN_ID,
): Promise<string> {
  seq += 1;
  const row = await prisma.reservations.create({
    data: {
      reservation_no: `RV-T037-${String(seq).padStart(4, "0")}`,
      user_id: userId,
      equipment_id: TEST_EQ,
      reservation_date: new Date(`${dateStr}T00:00:00Z`),
      slot_id: slotId,
      status,
      cancel_reason: status === "cancelled" ? "member_cancelled" : null,
      cancelled_at: status === "cancelled" ? new Date() : null,
      reviewed_by: status === "rejected" || status === "confirmed" ? WU_ID : null,
      reviewed_at: status === "rejected" || status === "confirmed" ? new Date() : null,
      reject_reason: status === "rejected" ? "測試駁回" : null,
      checked_out_by: status === "checked_out" || status === "returned" ? WU_ID : null,
      checked_out_at: status === "checked_out" || status === "returned" ? new Date() : null,
      returned_by: status === "returned" ? WU_ID : null,
      returned_at: status === "returned" ? new Date() : null,
    },
  });
  return row.id;
}

/** 在一筆已核准／有效預約上建立「改期審核中」的改期申請。 */
async function insertPendingReschedule(
  reservationId: string,
  fromDate: string,
  fromSlotId: string,
  toDate: string,
  toSlotId: string,
): Promise<string> {
  seq += 1;
  const row = await prisma.reschedule_requests.create({
    data: {
      request_no: `RS-T037-${String(seq).padStart(4, "0")}`,
      reservation_id: reservationId,
      user_id: LIN_ID,
      from_reservation_date: new Date(`${fromDate}T00:00:00Z`),
      from_slot_id: fromSlotId,
      to_reservation_date: new Date(`${toDate}T00:00:00Z`),
      to_slot_id: toSlotId,
      status: "pending_approval",
    },
  });
  return row.id;
}

/** 測試設備、它的所有預約與改期申請的完整快照，用來確認「資料不變」。 */
async function equipmentSnapshot() {
  const equipment = await prisma.equipments.findUniqueOrThrow({ where: { id: TEST_EQ } });
  const reservations = await prisma.reservations.findMany({
    where: { equipment_id: TEST_EQ },
    orderBy: { reservation_no: "asc" },
  });
  const reschedules = await prisma.reschedule_requests.findMany({
    where: { reservation: { equipment_id: TEST_EQ } },
    orderBy: { request_no: "asc" },
  });
  const changes = await prisma.equipment_status_changes.count({
    where: { equipment_id: TEST_EQ },
  });
  return JSON.parse(JSON.stringify({ equipment, reservations, reschedules, changes }));
}

const api = {
  preview: (token: string, targetStatus: string) =>
    request(app)
      .get(`/api/admin/equipments/${TEST_EQ}/status-change-preview`)
      .query({ targetStatus })
      .set("Authorization", `Bearer ${token}`),
  update: (token: string, body: Record<string, unknown>) =>
    request(app)
      .patch(`/api/admin/equipments/${TEST_EQ}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send(body),
  createReservation: (token: string, reservationDate: string, slotId: string) =>
    request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ equipmentId: TEST_EQ, reservationDate, slotId }),
};

/** 依確認視窗的流程：先預覽，再以預覽結果確認設定。 */
async function previewAndConfirm(token: string, targetStatus: "maintenance" | "retired") {
  const preview = await api.preview(token, targetStatus);
  expect(preview.status).toBe(200);
  const res = await api.update(token, {
    targetStatus,
    expectedCurrentStatus: preview.body.currentStatus,
    expectedCancelCount: preview.body.cancelCount,
    expectedExpireCount: preview.body.expireCount,
  });
  return { preview, res };
}

describe("Iteration 5 Equipment Maintenance and Retirement (SC-001, SC-003, FR-002, FR-003, FR-019)", () => {
  let lin: string;
  let wu: string;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    setNow(TODAY, "08:00");
    await seedDatabase();
    await prisma.equipments.create({
      data: {
        id: TEST_EQ,
        equipment_code: "EQ-901",
        name: "測試用設備 T037",
        category: "整合測試",
        status: "available",
        requires_approval: true,
        updated_by: WU_ID,
      },
    });
    lin = await login(LIN);
    wu = await login(WU);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    vi.useRealTimers();
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  for (const [targetStatus, cancelReason] of [
    ["maintenance", "equipment_maintenance"],
    ["retired", "equipment_retired"],
  ] as const) {
    it(`SC-001: 設為 ${targetStatus} 後尚未結束的待審核與已核准／有效預約 100% 取消並帶 ${cancelReason}，已結束紀錄變動率 0%`, async () => {
      // US1 Independent Test：明天已核准／有效（附改期審核中申請）、後天待審核、過去已歸還
      const confirmedTomorrow = await insertReservation("confirmed", D(1), MORNING);
      const reschedule = await insertPendingReschedule(
        confirmedTomorrow,
        D(1),
        MORNING,
        D(3),
        AFTERNOON,
      );
      const pendingDayAfter = await insertReservation("pending_approval", D(2), AFTERNOON);
      const pendingOther = await insertReservation("pending_approval", D(4), EVENING, CHEN_ID);
      // 已結束紀錄：已歸還、已駁回、成員取消
      await insertReservation("returned", D(-2), MORNING);
      await insertReservation("rejected", D(3), MORNING, CHEN_ID);
      await insertReservation("cancelled", D(5), EVENING);
      const before = await equipmentSnapshot();
      const upcoming = new Set([confirmedTomorrow, pendingDayAfter, pendingOther]);

      const { preview, res } = await previewAndConfirm(wu, targetStatus);
      expect(preview.body.cancelCount).toBe(3);
      expect(preview.body.expireCount).toBe(1);
      expect(preview.body.hasCheckedOutReservation).toBe(false);
      expect(res.status).toBe(200);
      expect(res.body.equipment.status).toBe(targetStatus);
      expect(res.body.statusChange.fromStatus).toBe("available");
      expect(res.body.statusChange.toStatus).toBe(targetStatus);
      expect(res.body.statusChange.cancelledReservationCount).toBe(3);
      expect(res.body.expiredRescheduleRequestCount).toBe(1);

      const after = await equipmentSnapshot();
      expect(after.equipment.status).toBe(targetStatus);
      expect(after.changes).toBe(before.changes + 1);
      let cancelled = 0;
      for (const prev of before.reservations) {
        const now = after.reservations.find((r: { id: string }) => r.id === prev.id);
        if (upcoming.has(prev.id)) {
          expect(now.status, prev.reservation_no).toBe("cancelled");
          expect(now.cancel_reason, prev.reservation_no).toBe(cancelReason);
          expect(now.cancelled_at, prev.reservation_no).not.toBeNull();
          cancelled += 1;
        } else {
          // 已結束紀錄：每個欄位都不變（變動率 0%）
          expect(now, prev.reservation_no).toEqual(prev);
        }
      }
      expect(cancelled / upcoming.size).toBe(1);

      const expired = after.reschedules.find((r: { id: string }) => r.id === reschedule);
      expect(expired.status).toBe("expired");
      expect(expired.expire_reason).toBe("reservation_cancelled");

      // 成員再預約這台設備被拒絕
      const again = await api.createReservation(lin, D(6), MORNING);
      expect(again.status).toBe(409);
      expect(again.body.code).toBe("EQUIPMENT_UNAVAILABLE");
    });
  }

  it("FR-002、FR-003: 時段進行中設為送修，已開始未領取與已開始仍待審核的預約一併取消，已結束時段不變", async () => {
    // 今日上午 09:00–12:00 進行中
    const startedConfirmed = await insertReservation("confirmed", TODAY, MORNING);
    const startedPending = await insertReservation("pending_approval", TODAY, MORNING, CHEN_ID);
    const laterToday = await insertReservation("confirmed", TODAY, EVENING);
    // 已結束時段：昨天晚間已核准但從未領取、昨天晚間仍待審核
    const endedConfirmed = await insertReservation("confirmed", D(-1), EVENING);
    const endedPending = await insertReservation("pending_approval", D(-1), AFTERNOON, CHEN_ID);
    setNow(TODAY, "10:30");
    const before = await equipmentSnapshot();

    const { preview, res } = await previewAndConfirm(wu, "maintenance");
    expect(preview.body.cancelCount).toBe(3);
    expect(res.status).toBe(200);

    const after = await equipmentSnapshot();
    const byId = (id: string) => after.reservations.find((r: { id: string }) => r.id === id);
    for (const id of [startedConfirmed, startedPending, laterToday]) {
      expect(byId(id).status).toBe("cancelled");
      expect(byId(id).cancel_reason).toBe("equipment_maintenance");
    }
    for (const id of [endedConfirmed, endedPending]) {
      const prev = before.reservations.find((r: { id: string }) => r.id === id);
      expect(byId(id)).toEqual(prev);
    }
  });

  it("SC-003: 設備有借用中預約時，設為送修與停用都回 EQUIPMENT_ON_LOAN，資料不變（成功率 0%）", async () => {
    await insertReservation("checked_out", TODAY, MORNING);
    const confirmed = await insertReservation("confirmed", D(1), AFTERNOON);
    await insertPendingReschedule(confirmed, D(1), AFTERNOON, D(2), EVENING);
    await insertReservation("pending_approval", D(2), MORNING, CHEN_ID);
    setNow(TODAY, "10:30");
    const before = await equipmentSnapshot();

    let succeeded = 0;
    for (const targetStatus of ["maintenance", "retired"] as const) {
      const preview = await api.preview(wu, targetStatus);
      expect(preview.status).toBe(200);
      expect(preview.body.hasCheckedOutReservation).toBe(true);
      expect(preview.body.checkedOutReservations).toHaveLength(1);

      const res = await api.update(wu, {
        targetStatus,
        expectedCurrentStatus: preview.body.currentStatus,
        expectedCancelCount: preview.body.cancelCount,
        expectedExpireCount: preview.body.expireCount,
      });
      expect(res.status, targetStatus).toBe(409);
      expect(res.body.code, targetStatus).toBe("EQUIPMENT_ON_LOAN");
      if (res.status === 200) succeeded += 1;
      expect(await equipmentSnapshot()).toEqual(before);
    }
    expect(succeeded / 2).toBe(0);
  });

  it("FR-019: 開啟預覽後成員插入新預約，確認時回 EQUIPMENT_STATE_CHANGED，設備、預約與改期申請都不變", async () => {
    const confirmed = await insertReservation("confirmed", D(1), MORNING);
    await insertPendingReschedule(confirmed, D(1), MORNING, D(2), AFTERNOON);

    const preview = await api.preview(wu, "maintenance");
    expect(preview.status).toBe(200);
    expect(preview.body.cancelCount).toBe(1);
    expect(preview.body.expireCount).toBe(1);

    // 確認視窗開啟期間，成員又送出一筆預約（需人工審核 → 待審核）
    const inserted = await api.createReservation(lin, D(3), EVENING);
    expect(inserted.status).toBe(201);
    expect(inserted.body.status).toBe("pending_approval");
    const before = await equipmentSnapshot();

    const res = await api.update(wu, {
      targetStatus: "maintenance",
      expectedCurrentStatus: preview.body.currentStatus,
      expectedCancelCount: preview.body.cancelCount,
      expectedExpireCount: preview.body.expireCount,
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("EQUIPMENT_STATE_CHANGED");
    expect(await equipmentSnapshot()).toEqual(before);
  });
  for (const [fromStatus, cancelReason] of [
    ["maintenance", "equipment_maintenance"],
    ["retired", "equipment_retired"],
  ] as const) {
    it(`SC-004: 從 ${fromStatus} 恢復可用後被取消的預約 0% 復原，成員新預約 100% 依 requires_approval 成立或待審核`, async () => {
      const confirmed = await insertReservation("confirmed", D(1), MORNING);
      const pending = await insertReservation("pending_approval", D(2), AFTERNOON, CHEN_ID);
      const set = await previewAndConfirm(wu, fromStatus);
      expect(set.res.status).toBe(200);
      const cancelledIds = [confirmed, pending];
      const beforeRestore = await equipmentSnapshot();

      const restore = await api.update(wu, { targetStatus: "available" });
      expect(restore.status).toBe(200);
      expect(restore.body.equipment.status).toBe("available");
      expect(restore.body.statusChange.fromStatus).toBe(fromStatus);
      expect(restore.body.statusChange.toStatus).toBe("available");
      expect(restore.body.statusChange.cancelledReservationCount).toBe(0);

      const afterRestore = await equipmentSnapshot();
      let restored = 0;
      for (const id of cancelledIds) {
        const prev = beforeRestore.reservations.find((r: { id: string }) => r.id === id);
        const now = afterRestore.reservations.find((r: { id: string }) => r.id === id);
        expect(now.cancel_reason).toBe(cancelReason);
        expect(now).toEqual(prev);
        if (now.status !== "cancelled") restored += 1;
      }
      expect(restored / cancelledIds.length).toBe(0);

      // 需人工審核 → 待審核；改成免審核 → 直接成立（已核准／有效）
      let followed = 0;
      const attempts: Array<[boolean, string, string, string]> = [
        [true, D(3), MORNING, "pending_approval"],
        [false, D(4), EVENING, "confirmed"],
      ];
      for (const [requiresApproval, dateStr, slotId, expected] of attempts) {
        await prisma.equipments.update({
          where: { id: TEST_EQ },
          data: { requires_approval: requiresApproval },
        });
        const created = await api.createReservation(lin, dateStr, slotId);
        expect(created.status, String(requiresApproval)).toBe(201);
        expect(created.body.status, String(requiresApproval)).toBe(expected);
        if (created.body.status === expected) followed += 1;
      }
      expect(followed / attempts.length).toBe(1);
    });
  }

  it("SC-005、FR-017: 一般成員呼叫預覽、設為送修、設為停用與恢復可用 100% 回 403 FORBIDDEN，資料不變", async () => {
    const confirmed = await insertReservation("confirmed", D(1), MORNING, CHEN_ID);
    await insertPendingReschedule(confirmed, D(1), MORNING, D(2), AFTERNOON);
    const calls: Array<[string, () => request.Test]> = [
      ["preview maintenance", () => api.preview(lin, "maintenance")],
      ["preview retired", () => api.preview(lin, "retired")],
      [
        "set maintenance",
        () =>
          api.update(lin, {
            targetStatus: "maintenance",
            expectedCurrentStatus: "available",
            expectedCancelCount: 1,
            expectedExpireCount: 1,
          }),
      ],
      [
        "set retired",
        () =>
          api.update(lin, {
            targetStatus: "retired",
            expectedCurrentStatus: "available",
            expectedCancelCount: 1,
            expectedExpireCount: 1,
          }),
      ],
    ];
    let forbidden = 0;
    const before = await equipmentSnapshot();
    for (const [label, call] of calls) {
      const res = await call();
      expect(res.status, label).toBe(403);
      expect(res.body.code, label).toBe("FORBIDDEN");
      if (res.status === 403) forbidden += 1;
      expect(await equipmentSnapshot(), label).toEqual(before);
    }

    // 恢復可用：先由管理員設為送修，再以一般成員呼叫
    const set = await previewAndConfirm(wu, "maintenance");
    expect(set.res.status).toBe(200);
    const beforeRestore = await equipmentSnapshot();
    const restore = await api.update(lin, { targetStatus: "available" });
    expect(restore.status).toBe(403);
    expect(restore.body.code).toBe("FORBIDDEN");
    if (restore.status === 403) forbidden += 1;
    expect(await equipmentSnapshot()).toEqual(beforeRestore);

    expect(forbidden / (calls.length + 1)).toBe(1);
  });
});
