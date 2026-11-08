import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES, getErrorMessage, UI_TEXT } from "../../src/text/zh-TW";
import { validateLoginForm } from "../../src/views/LoginView";

describe("frontend zh-TW text and form validation unit tests", () => {
  it("contains Traditional Chinese messages for all 14 error codes", () => {
    expect(Object.keys(ERROR_MESSAGES)).toHaveLength(14);
    expect(getErrorMessage("CAPTCHA_MISMATCH")).toContain("區分大小寫");
    expect(getErrorMessage("RESERVATION_CONFLICT")).toContain("已被其他成員預約");
    expect(getErrorMessage("FORBIDDEN")).toContain("權限不足");
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
