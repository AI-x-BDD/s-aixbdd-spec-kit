import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { addDaysToDateStr, getSlotStartUtc, getTaipeiNow } from "../../src/utils/taipeiTime.js";

// 改期整合測試（research §5）：真實 PostgreSQL，量測 SC-001～SC-004、SC-006 與 FR-004。
// 系統時間固定在「今日 08:00 Asia/Taipei」，所有時段都尚未開始；SC-004 再以 vi.setSystemTime 推進到時段開始。

const TODAY = getTaipeiNow().dateStr;
const D = (days: number) => addDaysToDateStr(TODAY, days);

const LIN = { username: "lin.yating", password: "Member@2026" };
const CHEN = { username: "chen.guanting", password: "Member@2026" };
const WU = { username: "wu.chenghan", password: "Admin@2026" };

// EQ-102 需人工審核；EQ-104 免審核（demo seed）
const EQ102 = "22222222-2222-4222-8222-222222222102";
const EQ104 = "22222222-2222-4222-8222-222222222104";
const MORNING = "33333333-3333-4333-8333-333333333001";
const AFTERNOON = "33333333-3333-4333-8333-333333333002";
const EVENING = "33333333-3333-4333-8333-333333333003";
const SLOT_START: Record<string, string> = {
  [MORNING]: "09:00",
  [AFTERNOON]: "13:00",
  [EVENING]: "18:00",
};

// demo seed：林雅婷已取消的預約，與一筆可核准的改期審核中申請
const LIN_CANCELLED_RESERVATION = "44444444-4444-4444-8444-444444444013";
const SEED_PENDING_RESCHEDULE = "55555555-5555-4555-8555-555555555002";

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

const api = {
  createReservation: (
    token: string,
    equipmentId: string,
    reservationDate: string,
    slotId: string,
  ) =>
    request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ equipmentId, reservationDate, slotId }),
  approveReservation: (token: string, reservationId: string) =>
    request(app)
      .post(`/api/admin/reservations/${reservationId}/approve`)
      .set("Authorization", `Bearer ${token}`),
  cancelReservation: (token: string, reservationId: string) =>
    request(app)
      .post(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`),
  pickup: (token: string, reservationId: string) =>
    request(app)
      .post(`/api/admin/reservations/${reservationId}/pickup`)
      .set("Authorization", `Bearer ${token}`),
  reschedule: (token: string, reservationId: string, toReservationDate: string, toSlotId: string) =>
    request(app)
      .post(`/api/reservations/${reservationId}/reschedule-requests`)
      .set("Authorization", `Bearer ${token}`)
      .send({ toReservationDate, toSlotId }),
  approveReschedule: (token: string, id: string) =>
    request(app)
      .post(`/api/admin/reschedule-requests/${id}/approve`)
      .set("Authorization", `Bearer ${token}`),
  rejectReschedule: (token: string, id: string, rejectReason?: string) =>
    request(app)
      .post(`/api/admin/reschedule-requests/${id}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send(rejectReason ? { rejectReason } : {}),
  withdraw: (token: string, id: string) =>
    request(app)
      .post(`/api/reschedule-requests/${id}/withdraw`)
      .set("Authorization", `Bearer ${token}`),
};

/** 原預約的日期、時段、狀態與更新時間；用來計算變動率。 */
async function snapshot(reservationId: string) {
  const row = await prisma.reservations.findUniqueOrThrow({ where: { id: reservationId } });
  return {
    reservationDate: row.reservation_date.toISOString().slice(0, 10),
    slotId: row.slot_id,
    status: row.status,
    updatedAt: row.updated_at.toISOString(),
  };
}

/** 占用同一設備、日期與時段的紀錄筆數（confirmed、checked_out、returned）。 */
async function occupancy(equipmentId: string, dateStr: string, slotId: string): Promise<number> {
  return prisma.reservations.count({
    where: {
      equipment_id: equipmentId,
      reservation_date: new Date(`${dateStr}T00:00:00Z`),
      slot_id: slotId,
      status: { in: ["confirmed", "checked_out", "returned"] },
      deleted_at: null,
    },
  });
}

/** 建立一筆已核准／有效的預約；需人工審核設備由管理員核准。 */
async function confirmedReservation(
  memberToken: string,
  adminToken: string,
  equipmentId: string,
  dateStr: string,
  slotId: string,
): Promise<string> {
  const created = await api.createReservation(memberToken, equipmentId, dateStr, slotId);
  expect(created.status).toBe(201);
  if (created.body.status === "pending_approval") {
    const approved = await api.approveReservation(adminToken, created.body.id);
    expect(approved.status).toBe(200);
  }
  const snap = await snapshot(created.body.id);
  expect(snap.status).toBe("confirmed");
  return created.body.id as string;
}

describe("Iteration 4 Reservation Reschedule (SC-001 ~ SC-004, SC-006, FR-004)", () => {
  let lin: string;
  let chen: string;
  let wu: string;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    setNow(TODAY, "08:00");
    await seedDatabase();
    lin = await login(LIN);
    chen = await login(CHEN);
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

  it("SC-001: 免審核設備即時改期成功並釋出原時段；各種拒絕時原預約日期、時段、狀態變動率 0%", async () => {
    const id = await confirmedReservation(lin, wu, EQ104, D(5), MORNING);

    // 成功：改到 D5 下午，預約 id、編號與 confirmed 不變，改期申請為 approved
    const ok = await api.reschedule(lin, id, D(5), AFTERNOON);
    expect(ok.status).toBe(201);
    expect(ok.body.rescheduleRequest.status).toBe("approved");
    expect(ok.body.rescheduleRequest.reviewedBy).toBeNull();
    expect(ok.body.reservation.id).toBe(id);
    expect(ok.body.reservation.status).toBe("confirmed");
    expect(ok.body.reservation.reservationDate).toBe(D(5));
    expect(ok.body.reservation.slotId).toBe(AFTERNOON);
    expect(await occupancy(EQ104, D(5), MORNING)).toBe(0);
    expect(await occupancy(EQ104, D(5), AFTERNOON)).toBe(1);

    // 原時段已釋出：陳冠廷可預約 D5 上午
    const chenTakesMorning = await api.createReservation(chen, EQ104, D(5), MORNING);
    expect(chenTakesMorning.status).toBe(201);
    expect(chenTakesMorning.body.status).toBe("confirmed");

    // 本人在 D6 晚上已有同設備預約
    await confirmedReservation(lin, wu, EQ104, D(6), EVENING);

    const before = await snapshot(id);
    const rejections: Array<{
      label: string;
      date: string;
      slot: string;
      status: number;
      code: string;
    }> = [
      {
        label: "新時段與原時段相同",
        date: D(5),
        slot: AFTERNOON,
        status: 400,
        code: "RESCHEDULE_TARGET_INVALID",
      },
      {
        label: "超出當日起算 7 天",
        date: D(7),
        slot: MORNING,
        status: 400,
        code: "RESCHEDULE_TARGET_INVALID",
      },
      {
        label: "新時段已開始（昨日）",
        date: D(-1),
        slot: EVENING,
        status: 400,
        code: "RESCHEDULE_TARGET_INVALID",
      },
      {
        label: "本人在新時段已有預約",
        date: D(6),
        slot: EVENING,
        status: 400,
        code: "RESCHEDULE_TARGET_INVALID",
      },
      {
        label: "新時段已被他人占用",
        date: D(5),
        slot: MORNING,
        status: 409,
        code: "RESCHEDULE_SLOT_CONFLICT",
      },
    ];
    let changed = 0;
    for (const r of rejections) {
      const res = await api.reschedule(lin, id, r.date, r.slot);
      expect(res.status, r.label).toBe(r.status);
      expect(res.body.code, r.label).toBe(r.code);
      if (JSON.stringify(await snapshot(id)) !== JSON.stringify(before)) changed += 1;
    }

    // 預約狀態不是 confirmed（已取消）
    const cancelledBefore = await snapshot(LIN_CANCELLED_RESERVATION);
    const notAllowed = await api.reschedule(lin, LIN_CANCELLED_RESERVATION, D(5), EVENING);
    expect(notAllowed.status).toBe(409);
    expect(notAllowed.body.code).toBe("RESCHEDULE_NOT_ALLOWED");
    if (
      JSON.stringify(await snapshot(LIN_CANCELLED_RESERVATION)) !== JSON.stringify(cancelledBefore)
    )
      changed += 1;

    // 原時段已開始：時間推進到 D5 13:00
    setNow(D(5), "13:00");
    const linLater = await login(LIN);
    const started = await api.reschedule(linLater, id, D(6), MORNING);
    expect(started.status).toBe(409);
    expect(started.body.code).toBe("RESCHEDULE_NOT_ALLOWED");
    if (JSON.stringify(await snapshot(id)) !== JSON.stringify(before)) changed += 1;

    // 7 次拒絕，原預約變動率 0%
    expect(changed / (rejections.length + 2)).toBe(0);
  });

  it("SC-002: 需人工審核設備的改期在核准前原預約維持已核准／有效；駁回、撤回與核准被拒時原預約變動率 0%", async () => {
    const id = await confirmedReservation(lin, wu, EQ102, D(5), MORNING);
    const before = await snapshot(id);
    let changed = 0;
    const check = async () => {
      if (JSON.stringify(await snapshot(id)) !== JSON.stringify(before)) changed += 1;
    };

    // 送出 → pending_approval，原預約仍為 confirmed 並占用原時段，新時段不保留
    const r1 = await api.reschedule(lin, id, D(5), EVENING);
    expect(r1.status).toBe(201);
    expect(r1.body.rescheduleRequest.status).toBe("pending_approval");
    expect(r1.body.reservation.status).toBe("confirmed");
    expect(r1.body.reservation.slotId).toBe(MORNING);
    expect(await occupancy(EQ102, D(5), MORNING)).toBe(1);
    expect(await occupancy(EQ102, D(5), EVENING)).toBe(0);
    await check();

    // 駁回
    const rejected = await api.rejectReschedule(
      wu,
      r1.body.rescheduleRequest.id,
      "該時段需保留給課程使用",
    );
    expect(rejected.status).toBe(200);
    expect(rejected.body.status).toBe("rejected");
    await check();

    // 撤回
    const r2 = await api.reschedule(lin, id, D(5), EVENING);
    expect(r2.status).toBe(201);
    const withdrawn = await api.withdraw(lin, r2.body.rescheduleRequest.id);
    expect(withdrawn.status).toBe(200);
    await check();

    // 核准被拒：審核期間陳冠廷搶到 D5 晚上並被核准
    const r3 = await api.reschedule(lin, id, D(5), EVENING);
    expect(r3.status).toBe(201);
    await confirmedReservation(chen, wu, EQ102, D(5), EVENING);
    const conflict = await api.approveReschedule(wu, r3.body.rescheduleRequest.id);
    expect(conflict.status).toBe(409);
    expect(conflict.body.code).toBe("RESCHEDULE_SLOT_CONFLICT");
    const r3Row = await prisma.reschedule_requests.findUniqueOrThrow({
      where: { id: r3.body.rescheduleRequest.id },
    });
    expect(r3Row.status).toBe("pending_approval");
    await check();
    expect(changed).toBe(0);

    // 核准成功：駁回衝突申請後改送 D6 下午，核准後原預約移到新時段並釋出原時段
    expect((await api.rejectReschedule(wu, r3.body.rescheduleRequest.id)).status).toBe(200);
    const r4 = await api.reschedule(lin, id, D(6), AFTERNOON);
    expect(r4.status).toBe(201);
    const approved = await api.approveReschedule(wu, r4.body.rescheduleRequest.id);
    expect(approved.status).toBe(200);
    expect(approved.body.status).toBe("approved");
    expect(approved.body.reviewedBy).toBe("11111111-1111-4111-8111-111111111103");
    const after = await snapshot(id);
    expect(after).toMatchObject({ reservationDate: D(6), slotId: AFTERNOON, status: "confirmed" });
    expect(await occupancy(EQ102, D(5), MORNING)).toBe(0);
  });

  it("SC-003: 多筆請求同時搶同一設備同一時段時恰好 1 筆成功，時段重複占用 0%", async () => {
    const rounds = [
      { date: D(5), slot: AFTERNOON },
      { date: D(5), slot: EVENING },
      { date: D(6), slot: MORNING },
      { date: D(6), slot: AFTERNOON },
    ];
    let duplicated = 0;

    // 免審核設備 EQ-104：即時改期 vs 新預約
    for (const [i, target] of rounds.entries()) {
      const fromDate = i % 2 === 0 ? D(3) : D(4);
      const fromSlot = i < 2 ? MORNING : AFTERNOON;
      const id = await confirmedReservation(lin, wu, EQ104, fromDate, fromSlot);
      const [moved, booked] = await Promise.all([
        api.reschedule(lin, id, target.date, target.slot),
        api.createReservation(chen, EQ104, target.date, target.slot),
      ]);
      const successes = [moved.status === 201, booked.status === 201].filter(Boolean).length;
      expect(successes, `EQ-104 ${target.date} 第 ${i + 1} 輪`).toBe(1);
      if (moved.status !== 201) expect(moved.body.code).toBe("RESCHEDULE_SLOT_CONFLICT");
      if (booked.status !== 201) expect(booked.status).toBe(409);
      const count = await occupancy(EQ104, target.date, target.slot);
      if (count > 1) duplicated += 1;
      expect(count).toBe(1);
    }

    // 需人工審核設備 EQ-102：核准改期 vs 核准待審預約
    for (const [i, target] of rounds.entries()) {
      const id = await confirmedReservation(lin, wu, EQ102, D(i + 1), EVENING);
      const rr = await api.reschedule(lin, id, target.date, target.slot);
      expect(rr.status).toBe(201);
      const pending = await api.createReservation(chen, EQ102, target.date, target.slot);
      expect(pending.status).toBe(201);
      expect(pending.body.status).toBe("pending_approval");
      const [approveRr, approveRes] = await Promise.all([
        api.approveReschedule(wu, rr.body.rescheduleRequest.id),
        api.approveReservation(wu, pending.body.id),
      ]);
      const successes = [approveRr.status === 200, approveRes.status === 200].filter(
        Boolean,
      ).length;
      expect(successes, `EQ-102 ${target.date} 第 ${i + 1} 輪`).toBe(1);
      if (approveRr.status !== 200) expect(approveRr.body.code).toBe("RESCHEDULE_SLOT_CONFLICT");
      if (approveRes.status !== 200) expect(approveRes.status).toBe(409);
      const count = await occupancy(EQ102, target.date, target.slot);
      if (count > 1) duplicated += 1;
      expect(count).toBe(1);
    }

    expect(duplicated / (rounds.length * 2)).toBe(0);
  });

  it("SC-004: 原時段或新時段開始、原預約取消或登記領取時，審核中申請 100% 變成 expired 且核准回 409", async () => {
    // (a) 原時段先開始：D5 上午 → D6 晚上
    const a = await confirmedReservation(lin, wu, EQ102, D(5), MORNING);
    const ra = await api.reschedule(lin, a, D(6), EVENING);
    expect(ra.status).toBe(201);
    // (b) 新時段先開始：D6 晚上 → D5 下午
    const b = await confirmedReservation(lin, wu, EQ102, D(6), EVENING);
    const rb = await api.reschedule(lin, b, D(5), AFTERNOON);
    expect(rb.status).toBe(201);
    // (c) 原預約被取消
    const c = await confirmedReservation(chen, wu, EQ102, D(4), EVENING);
    const rc = await api.reschedule(chen, c, D(6), MORNING);
    expect(rc.status).toBe(201);
    // (d) 原預約被登記領取（今日晚上）
    const d = await confirmedReservation(lin, wu, EQ102, TODAY, EVENING);
    const rd = await api.reschedule(lin, d, D(3), MORNING);
    expect(rd.status).toBe(201);

    // 取消與登記領取在今日 08:00 進行
    expect((await api.cancelReservation(chen, c)).status).toBe(200);
    expect((await api.pickup(wu, d)).status).toBe(200);

    const cases: Array<{ id: string; reason: string; at: [string, string] | null }> = [
      { id: rc.body.rescheduleRequest.id, reason: "reservation_cancelled", at: null },
      { id: rd.body.rescheduleRequest.id, reason: "reservation_checked_out", at: null },
      {
        id: rb.body.rescheduleRequest.id,
        reason: "new_slot_started",
        at: [D(5), SLOT_START[AFTERNOON]],
      },
      {
        id: ra.body.rescheduleRequest.id,
        reason: "original_slot_started",
        at: [D(5), SLOT_START[MORNING]],
      },
    ];
    // (a) 的原時段 D5 09:00 早於 (b) 的新時段 D5 13:00，先推進到 09:00 驗證 (a)，再推進到 13:00 驗證 (b)
    cases.sort((x, y) =>
      (x.at ? `${x.at[0]} ${x.at[1]}` : "").localeCompare(y.at ? `${y.at[0]} ${y.at[1]}` : ""),
    );

    let expired = 0;
    let approvedCount = 0;
    for (const item of cases) {
      let admin = wu;
      if (item.at) {
        setNow(item.at[0], item.at[1]);
        admin = await login(WU);
      }
      const res = await api.approveReschedule(admin, item.id);
      expect(res.status, item.reason).toBe(409);
      expect(res.body.code, item.reason).toBe("INVALID_RESCHEDULE_STATUS");
      if (res.status === 200) approvedCount += 1;
      // 以管理員改期申請清單讀取（查詢前惰性失效並提交，research §3），與畫面看到的狀態一致
      const list = await request(app)
        .get("/api/admin/reschedule-requests?pageSize=100")
        .set("Authorization", `Bearer ${admin}`);
      expect(list.status).toBe(200);
      const row = (
        list.body.items as Array<{
          id: string;
          status: string;
          expireReason: string | null;
          expiredAt: string | null;
        }>
      ).find((it) => it.id === item.id);
      expect(row?.status, item.reason).toBe("expired");
      expect(row?.expireReason, item.reason).toBe(item.reason);
      if (item.at) {
        expect(row?.expiredAt).toBe(getSlotStartUtc(item.at[0], item.at[1]).toISOString());
      }
      if (row?.status === "expired") expired += 1;
    }

    // 原預約維持原日期時段
    expect(await snapshot(a)).toMatchObject({
      reservationDate: D(5),
      slotId: MORNING,
      status: "confirmed",
    });
    expect(await snapshot(b)).toMatchObject({
      reservationDate: D(6),
      slotId: EVENING,
      status: "confirmed",
    });

    expect(expired / cases.length).toBe(1);
    expect(approvedCount).toBe(0);
  });

  it("SC-006: 一般成員呼叫核准或駁回改期申請 100% 回 403", async () => {
    let forbidden = 0;
    const calls = [
      () => api.approveReschedule(lin, SEED_PENDING_RESCHEDULE),
      () => api.rejectReschedule(lin, SEED_PENDING_RESCHEDULE, "成員不能駁回"),
      () => api.approveReschedule(chen, SEED_PENDING_RESCHEDULE),
      () => api.rejectReschedule(chen, SEED_PENDING_RESCHEDULE),
    ];
    for (const call of calls) {
      const res = await call();
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
      if (res.status === 403) forbidden += 1;
    }
    expect(forbidden / calls.length).toBe(1);
    const row = await prisma.reschedule_requests.findUniqueOrThrow({
      where: { id: SEED_PENDING_RESCHEDULE },
    });
    expect(row.status).toBe("pending_approval");
    expect(row.reviewed_by).toBeNull();
  });

  it("FR-004: 同一預約並發送出兩次改期審核只成立一筆", async () => {
    const id = await confirmedReservation(lin, wu, EQ102, D(5), MORNING);
    const [first, second] = await Promise.all([
      api.reschedule(lin, id, D(5), EVENING),
      api.reschedule(lin, id, D(6), AFTERNOON),
    ]);
    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);
    const loser = first.status === 409 ? first : second;
    expect(loser.body.code).toBe("RESCHEDULE_ALREADY_PENDING");
    const pendingCount = await prisma.reschedule_requests.count({
      where: { reservation_id: id, status: "pending_approval", deleted_at: null },
    });
    expect(pendingCount).toBe(1);
  });
});
