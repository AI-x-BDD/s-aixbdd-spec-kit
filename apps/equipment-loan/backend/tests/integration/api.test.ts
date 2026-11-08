import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { app } from "../../src/app.js";
import { pool, prisma } from "../../src/db/prisma.js";
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

describe("Equipment Loan & Booking API integration tests (SC-001 ~ SC-005)", () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it("SC-001: enforces 7-digit case-sensitive captcha, 5-minute expiry, and single-use invalidation", async () => {
    // 1. Exact case sensitivity check (e.g. a123456 vs A123456)
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

    // 2. Replaying the already-attempted challenge must be blocked 100%
    const replayRes = await request(app).post("/api/auth/login").send({
      username: "lin.yating",
      password: "Member@2026",
      challengeId: customChallenge.id,
      captchaCode: "a123456",
    });
    expect(replayRes.status).toBe(400);
    expect(replayRes.body.code).toBe("CAPTCHA_EXPIRED");

    // 3. Expired challenge (> 5 minutes) must be blocked
    const expiredChallenge = await prisma.captcha_challenges.create({
      data: {
        captcha_code: "B765432",
        expires_at: new Date(Date.now() - 1000),
      },
    });
    const expiredRes = await request(app).post("/api/auth/login").send({
      username: "lin.yating",
      password: "Member@2026",
      challengeId: expiredChallenge.id,
      captchaCode: "B765432",
    });
    expect(expiredRes.status).toBe(400);
    expect(expiredRes.body.code).toBe("CAPTCHA_EXPIRED");
  });

  it("SC-002: under 10 concurrent booking requests for the same equipment, date, and slot, exactly 1 succeeds and 9 return 409 RESERVATION_CONFLICT", async () => {
    const token1 = await loginAs("lin.yating", "Member@2026");
    const token2 = await loginAs("chen.guanting", "Member@2026");
    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);

    const payload = {
      equipmentId: "22222222-2222-4222-8222-222222222101", // EQ-101
      reservationDate: tomorrow,
      slotId: "33333333-3333-4333-8333-333333333003", // 晚間 18:00-21:00 (available)
    };

    const requests = Array.from({ length: 10 }, (_, idx) =>
      request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${idx % 2 === 0 ? token1 : token2}`)
        .send(payload),
    );

    const responses = await Promise.all(requests);
    const created = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter(
      (r) => r.status === 409 && r.body.code === "RESERVATION_CONFLICT",
    );

    expect(created.length).toBe(1);
    expect(conflicts.length).toBe(9);
  });

  it("SC-003 & SC-004: cancels unstarted reservation within < 1s, releases slot immediately, and preserves cancelled history", async () => {
    const token1 = await loginAs("lin.yating", "Member@2026");
    const token2 = await loginAs("chen.guanting", "Member@2026");
    const tomorrow = addDaysToDateStr(getTaipeiNow().dateStr, 1);

    const t0 = performance.now();
    const cancelRes = await request(app)
      .post("/api/reservations/44444444-4444-4444-8444-444444444003/cancel")
      .set("Authorization", `Bearer ${token1}`);
    const eqRes = await request(app)
      .get(`/api/equipments?date=${tomorrow}`)
      .set("Authorization", `Bearer ${token1}`);
    const elapsedMs = performance.now() - t0;

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe("cancelled");
    expect(cancelRes.body.cancelledAt).toBeTruthy();
    expect(elapsedMs).toBeLessThan(1000);

    const eq101 = eqRes.body.items.find(
      (item: { equipmentCode: string }) => item.equipmentCode === "EQ-101",
    );
    expect(eq101.slots[0].availabilityStatus).toBe("available");

    // Rebooking the released slot succeeds while keeping the cancelled record
    const rebookRes = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        equipmentId: "22222222-2222-4222-8222-222222222101",
        reservationDate: tomorrow,
        slotId: "33333333-3333-4333-8333-333333333001",
      });
    expect(rebookRes.status).toBe(201);

    const myRes = await request(app)
      .get("/api/reservations?status=cancelled")
      .set("Authorization", `Bearer ${token1}`);
    expect(myRes.status).toBe(200);
    expect(
      myRes.body.items.some(
        (item: { id: string }) => item.id === "44444444-4444-4444-8444-444444444003",
      ),
    ).toBe(true);
  });

  it("SC-005: blocks member from cancelling another member's reservation or accessing admin reservation list (100% 403 FORBIDDEN)", async () => {
    const memberToken = await loginAs("lin.yating", "Member@2026");

    const cancelOther = await request(app)
      .post("/api/reservations/44444444-4444-4444-8444-444444444004/cancel")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(cancelOther.status).toBe(403);
    expect(cancelOther.body.code).toBe("FORBIDDEN");

    const adminListByMember = await request(app)
      .get("/api/admin/reservations")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(adminListByMember.status).toBe(403);
    expect(adminListByMember.body.code).toBe("FORBIDDEN");

    const adminToken = await loginAs("wu.chenghan", "Admin@2026");
    const adminListByAdmin = await request(app)
      .get("/api/admin/reservations")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminListByAdmin.status).toBe(200);
    expect(adminListByAdmin.body.totalItems).toBe(6);
  });
});
