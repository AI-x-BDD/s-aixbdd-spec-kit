import { describe, expect, it } from "vitest";
import {
  ERROR_MESSAGES,
  getErrorMessage,
  RESCHEDULE_ERROR_MESSAGES,
  UI_TEXT,
} from "../../src/text/zh-TW";
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

  it("contains Traditional Chinese text for 5 reschedule statuses, MY_RESCHEDULE_PENDING, 4 expire reasons, and 5 reschedule error codes (NFR-001)", () => {
    // 只含中文與全形標點：不得出現英文字母，避免把狀態值或錯誤碼原樣顯示給使用者
    const isZhTw = (text: string) => /[\u4e00-\u9fff]/.test(text) && !/[A-Za-z]/.test(text);

    expect(UI_TEXT.rescheduleStatus).toEqual({
      pending_approval: "改期審核中",
      approved: "改期成功",
      rejected: "改期被駁回",
      withdrawn: "改期已撤回",
      expired: "改期已失效",
    });
    expect(UI_TEXT.slotStatusByCode.MY_RESCHEDULE_PENDING).toBe("本人改期審核中");
    // 失效原因文字依 tasks.md Notes 待確認 2 的暫行做法
    expect(UI_TEXT.rescheduleExpireReason).toEqual({
      original_slot_started: "原時段開始",
      new_slot_started: "新時段開始",
      reservation_cancelled: "原預約已取消",
      reservation_checked_out: "原預約已登記領取",
    });

    const rescheduleErrorCodes = [
      "RESCHEDULE_NOT_ALLOWED",
      "RESCHEDULE_TARGET_INVALID",
      "RESCHEDULE_SLOT_CONFLICT",
      "RESCHEDULE_ALREADY_PENDING",
      "INVALID_RESCHEDULE_STATUS",
    ];
    expect(Object.keys(RESCHEDULE_ERROR_MESSAGES).sort()).toEqual([...rescheduleErrorCodes].sort());
    for (const code of rescheduleErrorCodes) {
      expect(isZhTw(getErrorMessage(code)), code).toBe(true);
    }
    expect(getErrorMessage("RESCHEDULE_NOT_ALLOWED")).toContain("原時段尚未開始");
    expect(getErrorMessage("RESCHEDULE_SLOT_CONFLICT")).toContain("已被占用");
    expect(getErrorMessage("RESCHEDULE_ALREADY_PENDING")).toContain("改期審核中");
    expect(getErrorMessage("INVALID_RESCHEDULE_STATUS")).toContain("已非「改期審核中」");

    for (const text of [
      ...Object.values(UI_TEXT.rescheduleStatus),
      UI_TEXT.slotStatusByCode.MY_RESCHEDULE_PENDING,
      ...Object.values(UI_TEXT.rescheduleExpireReason),
      ...Object.values(UI_TEXT.reschedule),
    ]) {
      expect(isZhTw(text), text).toBe(true);
    }
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
