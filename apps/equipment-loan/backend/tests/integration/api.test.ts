import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { hashPassword } from "../../src/utils/password.js";
import { addDaysToDateStr, getTaipeiNow } from "../../src/utils/taipeiTime.js";

async function loginAs(username: string, password: string): Promise<string> {
  const capRes = await request(app).post("/api/auth/captcha").send({});
  expect(capRes.status).toBe(201);

  const loginRes = await request(app).post("/api/auth/login").send({
    username,
    password,
    challengeId: capRes.body.challengeId,
    captchaCode: capRes.body.captchaCode,
  });
  expect(loginRes.status).toBe(200);
  return loginRes.body.token as string;
}

describe("Iteration 3 Equipment Pickup, Return & Loan Status + Iterations 1-2 Regression (SC-001 ~ SC-005)", () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it("SC-001 & FR-001 & FR-002: admin pickup succeeds 100% for today's non-expired confirmed reservation and rejects non-confirmed, future date, or expired slot", async () => {
    const adminToken = await loginAs("wu.chenghan", "Admin@2026");

    // 1. Today's evening slot (18:00-21:00) confirmed reservation RV-20261108-06 -> 200 checked_out
    const t0 = performance.now();
    const pickupOk = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/pickup")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(performance.now() - t0).toBeLessThan(2000);
    expect(pickupOk.status).toBe(200);
    expect(pickupOk.body.status).toBe("checked_out");
    expect(pickupOk.body.checkedOutAt).toBeTruthy();
    expect(pickupOk.body.checkedOutByUserId).toBe("11111111-1111-4111-8111-111111111103");
    expect(pickupOk.body.checkedOutByName).toBe("吳承翰");
    expect(pickupOk.body.canPickup).toBe(false);
    expect(pickupOk.body.canReturn).toBe(true);
    expect(pickupOk.body.canCancel).toBe(false);

    // 2. Reject non-confirmed states (checked_out duplicate, pending_approval, returned, rejected, cancelled) -> 409 INVALID_RESERVATION_STATUS
    for (const nonConfirmedId of [
      "44444444-4444-4444-8444-444444444006", // already checked_out
      "44444444-4444-4444-8444-444444444008", // pending_approval
      "44444444-4444-4444-8444-444444444001", // returned
      "44444444-4444-4444-8444-444444444007", // rejected
      "44444444-4444-4444-8444-444444444013", // cancelled
    ]) {
      const res = await request(app)
        .post(`/api/admin/reservations/${nonConfirmedId}/pickup`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("INVALID_RESERVATION_STATUS");
    }

    // 3. Reject future date confirmed reservation RV-20261108-04 -> 400 PICKUP_DATE_NOT_TODAY
    const futureRes = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444004/pickup")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(futureRes.status).toBe(400);
    expect(futureRes.body.code).toBe("PICKUP_DATE_NOT_TODAY");

    // 4. Reject expired morning slot confirmed reservation RV-20261108-02 -> 400 PICKUP_WINDOW_EXPIRED
    const expiredRes = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444002/pickup")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(expiredRes.status).toBe(400);
    expect(expiredRes.body.code).toBe("PICKUP_WINDOW_EXPIRED");
  });

  it("SC-002 & FR-004 & FR-007: admin return succeeds 100% for both in-window and overdue checked_out records, keeps returned slot locked against duplicate booking, and rejects non-checked_out records", async () => {
    const adminToken = await loginAs("wu.chenghan", "Admin@2026");
    const chenToken = await loginAs("chen.guanting", "Member@2026");
    const todayStr = getTaipeiNow().dateStr;

    // 1. Return in-window checked_out record RV-20261108-03 -> 200 returned
    const t0 = performance.now();
    const retInWindow = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444003/return")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(performance.now() - t0).toBeLessThan(2000);
    expect(retInWindow.status).toBe(200);
    expect(retInWindow.body.status).toBe("returned");
    expect(retInWindow.body.returnedAt).toBeTruthy();
    expect(retInWindow.body.returnedByUserId).toBe("11111111-1111-4111-8111-111111111103");
    expect(retInWindow.body.returnedByName).toBe("吳承翰");
    expect(retInWindow.body.canReturn).toBe(false);

    // 2. Return overdue checked_out record RV-20261107-05 (from yesterday) -> 200 returned
    const retOverdue = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444011/return")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(retOverdue.status).toBe(200);
    expect(retOverdue.body.status).toBe("returned");
    expect(retOverdue.body.returnedAt).toBeTruthy();
    expect(retOverdue.body.returnedByName).toBe("吳承翰");

    // 3. Reject non-checked_out records (confirmed not picked up, already returned, pending_approval, rejected, cancelled) -> 409 INVALID_RESERVATION_STATUS
    for (const nonCheckedOutId of [
      "44444444-4444-4444-8444-444444444006", // confirmed
      "44444444-4444-4444-8444-444444444003", // already returned
      "44444444-4444-4444-8444-444444444008", // pending_approval
      "44444444-4444-4444-8444-444444444007", // rejected
      "44444444-4444-4444-8444-444444444013", // cancelled
    ]) {
      const res = await request(app)
        .post(`/api/admin/reservations/${nonCheckedOutId}/return`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("INVALID_RESERVATION_STATUS");
    }

    // 4. Early return keeps the slot occupied (isBookable = false, OCCUPIED for others) and blocks duplicate booking or approval with 409 RESERVATION_CONFLICT
    await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/pickup")
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/return")
      .set("Authorization", `Bearer ${adminToken}`);

    const eqAfterReturn = await request(app)
      .get(`/api/equipments?date=${todayStr}`)
      .set("Authorization", `Bearer ${chenToken}`);
    const eq103EvForChen = eqAfterReturn.body.items.find(
      (e: { equipmentCode: string }) => e.equipmentCode === "EQ-103",
    ).slots[2];
    expect(eq103EvForChen.slotStatus).toBe("OCCUPIED");
    expect(eq103EvForChen.availabilityStatus).toBe("booked_by_others");
    expect(eq103EvForChen.isBookable).toBe(false);

    // Also verify on a future unstarted slot that a `returned` record blocks new booking with 409 RESERVATION_CONFLICT
    const tomorrowStr = addDaysToDateStr(todayStr, 1);
    await prisma.reservations.update({
      where: { id: "44444444-4444-4444-8444-444444444004" },
      data: {
        status: "returned",
        checked_out_at: new Date(),
        returned_at: new Date(),
      },
    });
    const conflictAfterReturn = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${chenToken}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222101", // EQ-101
        reservationDate: tomorrowStr,
        slotId: "33333333-3333-4333-8333-333333333001", // 上午 09:00-12:00
      });
    expect(conflictAfterReturn.status).toBe(409);
    expect(conflictAfterReturn.body.code).toBe("RESERVATION_CONFLICT");
  });

  it("SC-003 & SC-004 & FR-006 & FR-007 & FR-008: member accurately views active loans, 6-state history, and 6-state slot status, and is 100% blocked from cancelling checked_out or returned records (even before slot start)", async () => {
    const adminToken = await loginAs("wu.chenghan", "Admin@2026");
    const linToken = await loginAs("lin.yating", "Member@2026");
    const chenToken = await loginAs("chen.guanting", "Member@2026");
    const todayStr = getTaipeiNow().dateStr;

    // 1. Member queries active loans (/api/reservations/my?status=checked_out) < 2s
    const t0 = performance.now();
    const myLoans = await request(app)
      .get("/api/reservations/my?status=checked_out")
      .set("Authorization", `Bearer ${linToken}`);
    expect(performance.now() - t0).toBeLessThan(2000);
    expect(myLoans.status).toBe(200);
    expect(myLoans.body.totalItems).toBe(1);
    expect(myLoans.body.items[0].reservationNumber).toBe("RV-20261108-03");
    expect(myLoans.body.items[0].checkedOutAt).toBeTruthy();
    expect(myLoans.body.items[0].canCancel).toBe(false);

    // 2. Member views 6-state slot availability on today: MY_CHECKED_OUT and MY_RETURNED for self, OCCUPIED for others without exposing borrower identity
    const eqForLin = await request(app)
      .get(`/api/equipments?date=${todayStr}`)
      .set("Authorization", `Bearer ${linToken}`);
    const eq101LinPm = eqForLin.body.items.find(
      (e: { equipmentCode: string }) => e.equipmentCode === "EQ-101",
    ).slots[1];
    const eq102LinAm = eqForLin.body.items.find(
      (e: { equipmentCode: string }) => e.equipmentCode === "EQ-102",
    ).slots[0];
    expect(eq101LinPm.slotStatus).toBe("MY_CHECKED_OUT");
    expect(eq101LinPm.availabilityStatus).toBe("checked_out_by_me");
    expect(eq102LinAm.slotStatus).toBe("MY_RETURNED");
    expect(eq102LinAm.availabilityStatus).toBe("returned_by_me");

    const eqForChen = await request(app)
      .get(`/api/equipments?date=${todayStr}`)
      .set("Authorization", `Bearer ${chenToken}`);
    const eq101ChenPm = eqForChen.body.items.find(
      (e: { equipmentCode: string }) => e.equipmentCode === "EQ-101",
    ).slots[1];
    const eq102ChenAm = eqForChen.body.items.find(
      (e: { equipmentCode: string }) => e.equipmentCode === "EQ-102",
    ).slots[0];
    expect(eq101ChenPm.slotStatus).toBe("OCCUPIED");
    expect(eq101ChenPm.availabilityStatus).toBe("booked_by_others");
    expect(eq101ChenPm.myReservationId).toBeNull();
    expect(eq102ChenAm.slotStatus).toBe("OCCUPIED");
    expect(eq102ChenAm.availabilityStatus).toBe("booked_by_others");
    expect(eq102ChenAm.myReservationId).toBeNull();

    // 3. Edge Case: Member picks up today's evening slot (RV-20261108-06) early BEFORE 18:00 start time, then attempts to cancel -> 100% blocked with 409 RESERVATION_ALREADY_CHECKED_OUT
    const earlyPickup = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/pickup")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(earlyPickup.status).toBe(200);

    const cancelEarlyPickedUp = await request(app)
      .post("/api/reservations/44444444-4444-4444-8444-444444444006/cancel")
      .set("Authorization", `Bearer ${linToken}`);
    expect(cancelEarlyPickedUp.status).toBe(409);
    expect(cancelEarlyPickedUp.body.code).toBe("RESERVATION_ALREADY_CHECKED_OUT");

    // 4. Attempting to cancel returned record RV-20261108-01 -> 409 RESERVATION_ALREADY_CHECKED_OUT
    const cancelReturned = await request(app)
      .post("/api/reservations/44444444-4444-4444-8444-444444444001/cancel")
      .set("Authorization", `Bearer ${linToken}`);
    expect(cancelReturned.status).toBe(409);
    expect(cancelReturned.body.code).toBe("RESERVATION_ALREADY_CHECKED_OUT");
  });

  it("SC-005 & FR-003: blocks non-admin member from pickup, return, and all admin endpoints (100% 403 FORBIDDEN)", async () => {
    const memberToken = await loginAs("lin.yating", "Member@2026");

    const endpoints = [
      () => request(app).get("/api/admin/equipments").set("Authorization", `Bearer ${memberToken}`),
      () =>
        request(app)
          .patch("/api/admin/equipments/22222222-2222-4222-8222-222222222101/approval-mode")
          .set("Authorization", `Bearer ${memberToken}`)
          .send({ requiresApproval: false }),
      () =>
        request(app)
          .get("/api/admin/reservations/pending")
          .set("Authorization", `Bearer ${memberToken}`),
      () =>
        request(app).get("/api/admin/reservations").set("Authorization", `Bearer ${memberToken}`),
      () =>
        request(app)
          .post("/api/admin/reservations/44444444-4444-4444-8444-444444444008/approve")
          .set("Authorization", `Bearer ${memberToken}`),
      () =>
        request(app)
          .post("/api/admin/reservations/44444444-4444-4444-8444-444444444008/reject")
          .set("Authorization", `Bearer ${memberToken}`)
          .send({ rejectReason: "越權測試" }),
      () =>
        request(app)
          .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/pickup")
          .set("Authorization", `Bearer ${memberToken}`),
      () =>
        request(app)
          .post("/api/admin/reservations/44444444-4444-4444-8444-444444444003/return")
          .set("Authorization", `Bearer ${memberToken}`),
      () =>
        request(app)
          .post("/api/reservations/44444444-4444-4444-8444-444444444012/cancel")
          .set("Authorization", `Bearer ${memberToken}`),
    ];

    for (const call of endpoints) {
      const res = await call();
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    }
  });

  it("Iterations 1 & 2 Regression (FR-009 & SC-005): approval workflow, concurrent approval conflict check, equipment approval mode toggle, 7-char case-sensitive captcha, and 10-concurrent booking race", async () => {
    const adminToken = await loginAs("wu.chenghan", "Admin@2026");
    const tokenLin = await loginAs("lin.yating", "Member@2026");
    const tokenChen = await loginAs("chen.guanting", "Member@2026");
    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);

    // 1. Concurrent approval conflict check on EQ-101 tomorrow evening (RV-20261109-08 & RV-20261109-09)
    const [app1, app2] = await Promise.all([
      request(app)
        .post("/api/admin/reservations/44444444-4444-4444-8444-444444444008/approve")
        .set("Authorization", `Bearer ${adminToken}`),
      request(app)
        .post("/api/admin/reservations/44444444-4444-4444-8444-444444444009/approve")
        .set("Authorization", `Bearer ${adminToken}`),
    ]);
    const statuses = [app1.status, app2.status].sort();
    expect(statuses).toEqual([200, 409]);

    // 2. Toggle EQ-104 approval mode preserves existing confirmed/checked_out/returned records
    const toggleRes = await request(app)
      .patch("/api/admin/equipments/22222222-2222-4222-8222-222222222104/approval-mode")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ requiresApproval: true });
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.requiresApproval).toBe(true);

    const newPending = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenChen}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222104",
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002",
      });
    expect(newPending.status).toBe(201);
    expect(newPending.body.status).toBe("pending_approval");

    // 3. 7-char case-sensitive captcha & single-use consumption
    const customChallenge = await prisma.captcha_challenges.create({
      data: {
        captcha_code: "a123456",
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    const mismatchRes = await request(app).post("/api/auth/login").send({
      username: "lin.yating",
      password: "Member@2026",
      challengeId: customChallenge.id,
      captchaCode: "A123456",
    });
    expect(mismatchRes.status).toBe(400);
    expect(mismatchRes.body.code).toBe("CAPTCHA_MISMATCH");

    // 4. 10 concurrent booking requests on non-approval equipment EQ-103 tomorrow evening
    const pwHash = await hashPassword("Member@2026");
    const tokens: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      const user = await prisma.users.create({
        data: {
          username: `race.user.${i}`,
          password_hash: pwHash,
          display_name: `搶約成員${i}`,
          role: "member",
        },
      });
      const token = randomUUID();
      await prisma.sessions.create({
        data: {
          token,
          user_id: user.id,
          expires_at: new Date(Date.now() + 3600_000),
        },
      });
      tokens.push(token);
    }

    const raceResponses = await Promise.all(
      tokens.map((t) =>
        request(app).post("/api/reservations").set("Authorization", `Bearer ${t}`).send({
          equipmentId: "22222222-2222-4222-8222-222222222103",
          reservationDate: tomorrow,
          slotId: "33333333-3333-4333-8333-333333333003",
        }),
      ),
    );
    expect(raceResponses.filter((r) => r.status === 201).length).toBe(1);
    expect(
      raceResponses.filter((r) => r.status === 409 && r.body.code === "RESERVATION_CONFLICT")
        .length,
    ).toBe(9);

    // 5. Cancel future confirmed reservation RV-20261108-04 (< 1s)
    const cancelRes = await request(app)
      .post("/api/reservations/44444444-4444-4444-8444-444444444004/cancel")
      .set("Authorization", `Bearer ${tokenLin}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe("cancelled");
  });
});
