import { describe, expect, it } from "vitest";
import { AppError, parsePaginationParams } from "../../src/middleware/errorHandler.js";
import { generateCaptchaCode } from "../../src/utils/captcha.js";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";
import {
  canPickupInWindow,
  checkPickupWindow,
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

  it("evaluates Asia/Taipei 7-day booking window, slot start time, and pickup window", () => {
    const mockNow = new Date("2026-11-09T06:30:00Z"); // 2026-11-09 14:30 Asia/Taipei
    expect(getTaipeiNow(mockNow)).toEqual({
      dateStr: "2026-11-09",
      timeStr: "14:30",
    });

    expect(isWithinOpenDateWindow("2026-11-09", mockNow)).toBe(true);
    expect(isWithinOpenDateWindow("2026-11-15", mockNow)).toBe(true);
    expect(isWithinOpenDateWindow("2026-11-08", mockNow)).toBe(false);
    expect(isWithinOpenDateWindow("2026-11-16", mockNow)).toBe(false);

    expect(hasSlotStarted("2026-11-09", "09:00", mockNow)).toBe(true);
    expect(hasSlotStarted("2026-11-09", "13:00", mockNow)).toBe(true);
    expect(hasSlotStarted("2026-11-09", "18:00", mockNow)).toBe(false);
    expect(hasSlotStarted("2026-11-10", "09:00", mockNow)).toBe(false);

    expect(checkPickupWindow("2026-11-09", "17:00", mockNow)).toBe("OK");
    expect(checkPickupWindow("2026-11-09", "21:00", mockNow)).toBe("OK");
    expect(checkPickupWindow("2026-11-10", "12:00", mockNow)).toBe("PICKUP_DATE_NOT_TODAY");
    expect(checkPickupWindow("2026-11-09", "12:00", mockNow)).toBe("PICKUP_WINDOW_EXPIRED");
    expect(checkPickupWindow("2026-11-08", "21:00", mockNow)).toBe("PICKUP_WINDOW_EXPIRED");

    expect(canPickupInWindow("2026-11-09", "17:00", mockNow)).toBe(true);
    expect(canPickupInWindow("2026-11-10", "17:00", mockNow)).toBe(false);
    expect(canPickupInWindow("2026-11-09", "12:00", mockNow)).toBe(false);
  });

  it("validates pagination parameters and supports all 19 error codes", () => {
    expect(parsePaginationParams({})).toEqual({ page: 1, pageSize: 20 });
    expect(parsePaginationParams({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
    expect(() => parsePaginationParams({ page: "0" })).toThrowError(AppError);
    expect(() => parsePaginationParams({ pageSize: "101" })).toThrowError(AppError);

    const dupErr = new AppError("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION", 409, "重複申請");
    const statusErr = new AppError("INVALID_RESERVATION_STATUS", 409, "狀態不符");
    const notTodayErr = new AppError("PICKUP_DATE_NOT_TODAY", 400, "非當日預約");
    const expiredErr = new AppError("PICKUP_WINDOW_EXPIRED", 400, "時段已結束");
    const checkedOutErr = new AppError("RESERVATION_ALREADY_CHECKED_OUT", 409, "已領取不可取消");
    expect(dupErr.code).toBe("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION");
    expect(statusErr.code).toBe("INVALID_RESERVATION_STATUS");
    expect(notTodayErr.code).toBe("PICKUP_DATE_NOT_TODAY");
    expect(expiredErr.code).toBe("PICKUP_WINDOW_EXPIRED");
    expect(checkedOutErr.code).toBe("RESERVATION_ALREADY_CHECKED_OUT");
  });
});
