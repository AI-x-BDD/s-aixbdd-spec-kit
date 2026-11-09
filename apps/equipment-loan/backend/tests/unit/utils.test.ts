import { describe, expect, it } from "vitest";
import { AppError, parsePaginationParams } from "../../src/middleware/errorHandler.js";
import { generateCaptchaCode } from "../../src/utils/captcha.js";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";
import {
  getTaipeiNow,
  hasSlotStarted,
  isWithinOpenDateWindow,
} from "../../src/utils/taipeiTime.js";

describe("backend utils & error handler unit tests", () => {
  it("generates 7-char alphanumeric captcha codes containing both letters and digits", () => {
    for (let i = 0; i < 50; i += 1) {
      const code = generateCaptchaCode();
      expect(code).toMatch(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{7}$/);
    }
  });

  it("hashes and verifies passwords with case sensitivity", async () => {
    const hash = await hashPassword("Member@2026");
    expect(await verifyPassword("Member@2026", hash)).toBe(true);
    expect(await verifyPassword("member@2026", hash)).toBe(false);
    expect(await verifyPassword("wrong", "invalid-format")).toBe(false);
  });

  it("evaluates Asia/Taipei 7-day booking window and slot start time", () => {
    const mockNow = new Date("2026-11-08T02:30:00Z"); // 2026-11-08 10:30 Asia/Taipei
    expect(getTaipeiNow(mockNow)).toEqual({
      dateStr: "2026-11-08",
      timeStr: "10:30",
    });

    expect(isWithinOpenDateWindow("2026-11-08", mockNow)).toBe(true);
    expect(isWithinOpenDateWindow("2026-11-14", mockNow)).toBe(true);
    expect(isWithinOpenDateWindow("2026-11-07", mockNow)).toBe(false);
    expect(isWithinOpenDateWindow("2026-11-15", mockNow)).toBe(false);

    expect(hasSlotStarted("2026-11-08", "09:00", mockNow)).toBe(true);
    expect(hasSlotStarted("2026-11-08", "13:00", mockNow)).toBe(false);
    expect(hasSlotStarted("2026-11-09", "09:00", mockNow)).toBe(false);
  });

  it("validates pagination parameters and supports all 16 error codes", () => {
    expect(parsePaginationParams({})).toEqual({ page: 1, pageSize: 20 });
    expect(parsePaginationParams({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
    expect(() => parsePaginationParams({ page: "0" })).toThrowError(AppError);
    expect(() => parsePaginationParams({ pageSize: "101" })).toThrowError(AppError);

    const dupErr = new AppError("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION", 409, "重複申請");
    const statusErr = new AppError("INVALID_RESERVATION_STATUS", 409, "狀態不符");
    expect(dupErr.code).toBe("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION");
    expect(statusErr.code).toBe("INVALID_RESERVATION_STATUS");
  });
});
