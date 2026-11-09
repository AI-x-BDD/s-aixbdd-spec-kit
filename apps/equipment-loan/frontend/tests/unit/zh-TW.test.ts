import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES, getErrorMessage, UI_TEXT } from "../../src/text/zh-TW";
import { validateLoginForm } from "../../src/views/LoginView";

describe("frontend zh-TW text and form validation unit tests", () => {
  it("contains Traditional Chinese messages for all 16 error codes and 4 reservation statuses", () => {
    expect(Object.keys(ERROR_MESSAGES)).toHaveLength(16);
    expect(getErrorMessage("CAPTCHA_MISMATCH")).toContain("區分大小寫");
    expect(getErrorMessage("RESERVATION_CONFLICT")).toContain("已核准／有效");
    expect(getErrorMessage("DUPLICATE_PENDING_OR_ACTIVE_RESERVATION")).toContain("重複申請遭拒");
    expect(getErrorMessage("INVALID_RESERVATION_STATUS")).toContain("狀態已變更");
    expect(getErrorMessage("FORBIDDEN")).toContain("權限不足");

    expect(UI_TEXT.approvalModes.requiresApproval).toBe("需人工審核");
    expect(UI_TEXT.approvalModes.noApproval).toBe("免審核");
    expect(UI_TEXT.slotStatus.pending_by_me).toBe("本人待審核");
    expect(UI_TEXT.reservationStatus).toEqual({
      pending_approval: "待審核",
      confirmed: "已核准／有效",
      rejected: "已駁回",
      cancelled: "已取消",
    });
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
