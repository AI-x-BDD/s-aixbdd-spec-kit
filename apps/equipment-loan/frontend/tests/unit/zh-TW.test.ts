import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES, getErrorMessage, UI_TEXT } from "../../src/text/zh-TW";
import { validateLoginForm } from "../../src/views/LoginView";

describe("frontend zh-TW text and form validation unit tests", () => {
  it("contains Traditional Chinese messages for all 19 error codes, 6 reservation statuses, and 6 slot statuses", () => {
    expect(Object.keys(ERROR_MESSAGES)).toHaveLength(19);
    expect(getErrorMessage("CAPTCHA_MISMATCH")).toContain("區分大小寫");
    expect(getErrorMessage("RESERVATION_CONFLICT")).toContain("不重新開放重複預約");
    expect(getErrorMessage("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION")).toContain("重複申請遭拒");
    expect(getErrorMessage("INVALID_RESERVATION_STATUS")).toContain("登記領取");
    expect(getErrorMessage("PICKUP_DATE_NOT_TODAY")).toContain("拒絕未來日期提前領取");
    expect(getErrorMessage("PICKUP_WINDOW_EXPIRED")).toContain("無法補登領取");
    expect(getErrorMessage("RESERVATION_ALREADY_CHECKED_OUT")).toContain("禁止取消預約");
    expect(getErrorMessage("FORBIDDEN")).toContain("權限不足");

    expect(UI_TEXT.approvalModes.requiresApproval).toBe("需人工審核");
    expect(UI_TEXT.approvalModes.noApproval).toBe("免審核");
    expect(UI_TEXT.slotStatus).toEqual({
      available: "可預約",
      pending_by_me: "本人待審核",
      booked_by_me: "本人已預約",
      checked_out_by_me: "本人借用中",
      returned_by_me: "本人已歸還",
      booked_by_others: "已被預約",
    });
    expect(UI_TEXT.reservationStatus).toEqual({
      pending_approval: "待審核",
      confirmed: "已核准／有效",
      checked_out: "借用中",
      returned: "已歸還",
      rejected: "已駁回",
      cancelled: "已取消",
    });
    expect(UI_TEXT.actions.pickup).toBe("登記領取");
    expect(UI_TEXT.actions.returnEquipment).toBe("登記歸還");
  });

  it("validates login form fields and 7-char alphanumeric captcha", () => {
    expect(validateLoginForm({ username: "", password: "", captchaCode: "A1b2" })).toEqual({
      username: UI_TEXT.fieldValidation.usernameRequired,
      password: UI_TEXT.fieldValidation.passwordRequired,
      captchaCode: UI_TEXT.fieldValidation.captchaInvalid,
    });

    expect(
      validateLoginForm({
        username: "lin.yating",
        password: "Member@2026",
        captchaCode: "a123456",
      }),
    ).toEqual({});
  });
});
