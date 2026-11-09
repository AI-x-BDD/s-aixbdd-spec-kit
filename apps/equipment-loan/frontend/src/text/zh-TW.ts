export type ErrorCode =
  | "VALIDATION_FAILED"
  | "PAGINATION_INVALID"
  | "CAPTCHA_MISMATCH"
  | "CAPTCHA_EXPIRED"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "DATE_OUT_OF_RANGE"
  | "SLOT_ALREADY_STARTED"
  | "EQUIPMENT_UNAVAILABLE"
  | "RESERVATION_CONFLICT"
  | "DUPLICATE_PENDING_OR_ACTIVE_RESERVATION"
  | "INVALID_RESERVATION_STATUS"
  | "RESERVATION_ALREADY_STARTED"
  | "RESERVATION_ALREADY_CANCELLED";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: "請求欄位或路徑參數格式不合法，請檢查輸入內容。",
  PAGINATION_INVALID: "分頁參數 page 或 pageSize 不合法。",
  CAPTCHA_MISMATCH:
    "驗證碼輸入錯誤（英文須區分大小寫，例如 a 與 A 不同），原驗證碼已失效，請輸入新驗證碼後重試。",
  CAPTCHA_EXPIRED: "此 7 位數驗證碼已超過 5 分鐘有效期限或已失效，系統已換發新驗證碼，請重新輸入。",
  INVALID_CREDENTIALS: "帳號或密碼不正確，且原驗證碼已單次消耗失效，請確認密碼並輸入新驗證碼。",
  UNAUTHORIZED: "請先完成帳號密碼與 7 位數驗證碼登入，才能檢視設備清單或執行預約與審核操作。",
  FORBIDDEN: "權限不足：您沒有權限執行此操作或存取此資源。",
  RESOURCE_NOT_FOUND: "指定的設備、固定時段或預約申請紀錄不存在。",
  DATE_OUT_OF_RANGE: "僅開放申請當日起算 7 天內尚未開始的固定時段，所選日期不在開放範圍內。",
  SLOT_ALREADY_STARTED: "無法申請：所選固定時段已開始或已結束，請選擇尚未開始的固定時段。",
  EQUIPMENT_UNAVAILABLE: "該單件設備目前不可預約，請選擇其他可用設備。",
  RESERVATION_CONFLICT:
    "操作失敗：該設備於所選日期與固定時段已被其他「已核准／有效」預約占用，請改選其他可預約時段。",
  DUPLICATE_PENDING_OR_ACTIVE_RESERVATION:
    "重複申請遭拒：您已對同一台設備、同一日期與同一固定時段持有一筆未結束的「待審核」或「已核准／有效」申請，同一成員不得重複申請。",
  INVALID_RESERVATION_STATUS:
    "無法執行此操作：該筆預約申請目前狀態已變更（如已取消、已核准或已駁回），請重新整理列表。",
  RESERVATION_ALREADY_STARTED: "無法執行此操作：該筆申請的預約時段已到達或超過開始時間。",
  RESERVATION_ALREADY_CANCELLED: "無法取消預約：該筆申請已經處於「已取消」狀態，無須重複取消。",
};

export const UI_TEXT = {
  brandTitle: "精密實驗設備借用中心",
  nav: {
    login: "登入",
    booking: "設備預約",
    myReservations: "我的預約",
    admin: "審核與預約管理",
    logout: "登出",
    darkMode: "深色模式",
    lightMode: "淺色模式",
  },
  roles: {
    member: "一般成員",
    admin: "管理員",
    guest: "尚未登入",
  },
  approvalModes: {
    requiresApproval: "需人工審核",
    noApproval: "免審核",
  },
  slotStatus: {
    available: "可預約",
    pending_by_me: "本人待審核",
    booked_by_me: "本人已預約",
    booked_by_others: "已被預約",
  },
  reservationStatus: {
    pending_approval: "待審核",
    confirmed: "已核准／有效",
    rejected: "已駁回",
    cancelled: "已取消",
  },
  fieldValidation: {
    usernameRequired: "請輸入登入帳號",
    passwordRequired: "請輸入登入密碼",
    captchaInvalid: "請輸入完整的 7 位數英數驗證碼（區分英文大小寫）",
    slotRequired: "請先從上方設備卡片點選一個狀態為「可預約」的固定時段",
    rejectReasonTooLong: "駁回原因為選填，但長度不得超過 200 字",
  },
} as const;

export function getErrorMessage(code?: string, fallbackMessage?: string): string {
  if (fallbackMessage && fallbackMessage.trim()) {
    return fallbackMessage;
  }
  if (code && code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[code as ErrorCode];
  }
  return "操作失敗，請稍後再試。";
}
