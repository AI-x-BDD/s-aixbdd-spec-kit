import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { hashPassword } from "../../src/utils/password.js";
import { addDaysToDateStr, getTaipeiNow, parseDateOnlyToUtc } from "../../src/utils/taipeiTime.js";

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

describe("Iteration 2 Equipment Approval & Review + Iteration 1 Regression (SC-001 ~ SC-005)", () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it("SC-001 & FR-002 & FR-003: requires_approval=true enters pending_approval without locking slot, blocks same-member duplicates, allows re-application after reject/cancel, and requires_approval=false immediately becomes confirmed", async () => {
    const tokenLin = await loginAs("lin.yating", "Member@2026");
    const tokenChen = await loginAs("chen.guanting", "Member@2026");
    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);

    // 1. Lin re-applies to EQ-102 tomorrow afternoon (where her previous RV-20261109-07 was rejected)
    const t0 = performance.now();
    const pendingRes = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenLin}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222102", // EQ-102 (requires_approval = true)
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002", // 下午 13:00-17:00
      });
    const elapsedPendingMs = performance.now() - t0;
    expect(pendingRes.status).toBe(201);
    expect(pendingRes.body.status).toBe("pending_approval");
    expect(elapsedPendingMs).toBeLessThan(2000);

    // 2. Same member (Lin) submitting duplicate pending request for same slot -> 409 DUPLICATE_PENDING_OR_ACTIVE_RESERVATION
    const dupRes = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenLin}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222102",
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002",
      });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.code).toBe("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION");

    // 3. Another member (Chen) still sees slot as available and can submit pending request for the same slot
    const eqForChen = await request(app)
      .get(`/api/equipments?date=${tomorrow}`)
      .set("Authorization", `Bearer ${tokenChen}`);
    const eq102Chen = eqForChen.body.items.find(
      (i: { equipmentCode: string }) => i.equipmentCode === "EQ-102",
    );
    expect(eq102Chen.slots[1].availabilityStatus).toBe("available");

    const chenPendingRes = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenChen}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222102",
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002",
      });
    expect(chenPendingRes.status).toBe(201);
    expect(chenPendingRes.body.status).toBe("pending_approval");

    // 4. Non-approval equipment (EQ-103, requires_approval = false) immediately becomes confirmed and locks slot
    const directRes = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenLin}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222103", // EQ-103 (requires_approval = false)
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002",
      });
    expect(directRes.status).toBe(201);
    expect(directRes.body.status).toBe("confirmed");

    const conflictDirect = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${tokenChen}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222103",
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002",
      });
    expect(conflictDirect.status).toBe(409);
    expect(conflictDirect.body.code).toBe("RESERVATION_CONFLICT");
  });

  it("SC-002 & FR-006: when multiple pending_approval requests exist for the same equipment, date, and slot, concurrent approval requests result in exactly 1 confirmed and 100% 409 RESERVATION_CONFLICT for the rest", async () => {
    const adminToken = await loginAs("wu.chenghan", "Admin@2026");
    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);
    const tomorrowUtc = parseDateOnlyToUtc(tomorrow);
    const pwHash = await hashPassword("Member@2026");

    // Seed already has RV-20261109-08 and RV-20261109-09 on EQ-101 tomorrow evening; add 3 more competing pending requests (total 5)
    const extraIds: string[] = [];
    for (let i = 1; i <= 3; i += 1) {
      const u = await prisma.users.create({
        data: {
          username: `concurrent.member.${i}`,
          password_hash: pwHash,
          display_name: `並發測試成員${i}`,
          role: "member",
        },
      });
      const r = await prisma.reservations.create({
        data: {
          reservation_no: `RV-CONC-0${i}`,
          user_id: u.id,
          equipment_id: "22222222-2222-4222-8222-222222222101",
          reservation_date: tomorrowUtc,
          slot_id: "33333333-3333-4333-8333-333333333003",
          status: "pending_approval",
          updated_by: u.id,
        },
      });
      extraIds.push(r.id);
    }

    const targetIds = [
      "44444444-4444-4444-8444-444444444008",
      "44444444-4444-4444-8444-444444444009",
      ...extraIds,
    ];

    const t0 = performance.now();
    const responses = await Promise.all(
      targetIds.map((id) =>
        request(app)
          .post(`/api/admin/reservations/${id}/approve`)
          .set("Authorization", `Bearer ${adminToken}`),
      ),
    );
    const elapsedMs = performance.now() - t0;

    const approved = responses.filter((r) => r.status === 200);
    const conflicts = responses.filter(
      (r) => r.status === 409 && r.body.code === "RESERVATION_CONFLICT",
    );

    expect(approved.length).toBe(1);
    expect(conflicts.length).toBe(4);
    expect(elapsedMs).toBeLessThan(2000);

    // Verify in DB that only 1 confirmed exists for that slot and the other 4 remain pending_approval
    const dbRows = await prisma.reservations.findMany({
      where: { id: { in: targetIds } },
    });
    expect(dbRows.filter((r) => r.status === "confirmed").length).toBe(1);
    expect(dbRows.filter((r) => r.status === "pending_approval").length).toBe(4);
  });

  it("SC-003 & SC-004 & FR-010: toggling equipment requires_approval preserves 100% of existing confirmed and pending_approval records, and all admin review operations respond within < 2s", async () => {
    const adminToken = await loginAs("wu.chenghan", "Admin@2026");
    const memberToken = await loginAs("lin.yating", "Member@2026");
    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);

    // 1. Toggle EQ-104 (currently false, has confirmed RV-20261108-05) to true
    const tToggle1 = performance.now();
    const toggleToTrue = await request(app)
      .patch("/api/admin/equipments/22222222-2222-4222-8222-222222222104/approval-mode")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ requiresApproval: true });
    expect(performance.now() - tToggle1).toBeLessThan(2000);
    expect(toggleToTrue.status).toBe(200);
    expect(toggleToTrue.body.requiresApproval).toBe(true);

    // Existing confirmed reservation RV-20261108-05 on EQ-104 remains confirmed
    const existingConfirmed = await prisma.reservations.findUnique({
      where: { id: "44444444-4444-4444-8444-444444444005" },
    });
    expect(existingConfirmed?.status).toBe("confirmed");

    // New booking on EQ-104 now enters pending_approval
    const newOn104 = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222104",
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333002",
      });
    expect(newOn104.status).toBe(201);
    expect(newOn104.body.status).toBe("pending_approval");

    // 2. Toggle EQ-102 (currently true, has pending RV-20261109-10) to false
    const toggleToFalse = await request(app)
      .patch("/api/admin/equipments/22222222-2222-4222-8222-222222222102/approval-mode")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ requiresApproval: false });
    expect(toggleToFalse.status).toBe(200);
    expect(toggleToFalse.body.requiresApproval).toBe(false);

    // Existing pending RV-20261109-10 still stays in pending queue
    const tList = performance.now();
    const pendingQueue = await request(app)
      .get("/api/admin/reservations/pending")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(performance.now() - tList).toBeLessThan(2000);
    expect(
      pendingQueue.body.items.some(
        (item: { id: string }) => item.id === "44444444-4444-4444-8444-444444444010",
      ),
    ).toBe(true);

    // Reject RV-20261109-10 with reason (< 2s)
    const tReject = performance.now();
    const rejectRes = await request(app)
      .post("/api/admin/reservations/44444444-4444-4444-8444-444444444010/reject")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ rejectReason: "設備切換模式前之待審申請，因時段調整予以駁回。" });
    expect(performance.now() - tReject).toBeLessThan(2000);
    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.status).toBe("rejected");
  });

  it("SC-005 & FR-008 & FR-009: blocks non-admin member from all admin equipment settings and reservation review endpoints (100% 403 FORBIDDEN)", async () => {
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
          .post("/api/reservations/44444444-4444-4444-8444-444444444004/cancel")
          .set("Authorization", `Bearer ${memberToken}`),
    ];

    for (const call of endpoints) {
      const res = await call();
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    }
  });

  it("Iteration 1 Regression (FR-011 & SC-003): 7-char case-sensitive captcha, 10-concurrent non-approval booking race, and < 1s cancellation slot release", async () => {
    // 1. 7-char case-sensitive captcha & single-use consumption
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

    const replayRes = await request(app).post("/api/auth/login").send({
      username: "lin.yating",
      password: "Member@2026",
      challengeId: customChallenge.id,
      captchaCode: "a123456",
    });
    expect(replayRes.status).toBe(400);
    expect(replayRes.body.code).toBe("CAPTCHA_EXPIRED");

    // 2. 10 concurrent booking requests by 10 members on non-approval equipment EQ-103
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

    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);
    const raceResponses = await Promise.all(
      tokens.map((t) =>
        request(app).post("/api/reservations").set("Authorization", `Bearer ${t}`).send({
          equipmentId: "22222222-2222-4222-8222-222222222103", // EQ-103 (requires_approval = false)
          reservationDate: tomorrow,
          slotId: "33333333-3333-4333-8333-333333333003", // 晚間 18:00-21:00
        }),
      ),
    );
    expect(raceResponses.filter((r) => r.status === 201).length).toBe(1);
    expect(
      raceResponses.filter((r) => r.status === 409 && r.body.code === "RESERVATION_CONFLICT")
        .length,
    ).toBe(9);

    // 3. Cancel confirmed reservation < 1s and release slot
    const tokenLin = await loginAs("lin.yating", "Member@2026");
    const tCancel = performance.now();
    const cancelRes = await request(app)
      .post("/api/reservations/44444444-4444-4444-8444-444444444003/cancel")
      .set("Authorization", `Bearer ${tokenLin}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe("cancelled");
    expect(performance.now() - tCancel).toBeLessThan(1000);
  });
});
