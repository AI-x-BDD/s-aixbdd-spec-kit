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
  | "PICKUP_DATE_NOT_TODAY"
  | "PICKUP_WINDOW_EXPIRED"
  | "RESERVATION_ALREADY_CHECKED_OUT"
  | "RESERVATION_ALREADY_STARTED"
  | "RESERVATION_ALREADY_CANCELLED";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: "請求欄位或路徑參數格式不合法，請檢查輸入內容。",
  PAGINATION_INVALID: "分頁參數 page 或 pageSize 不合法。",
  CAPTCHA_MISMATCH:
    "驗證碼輸入錯誤（英文須區分大小寫，例如 a 與 A 不同），原驗證碼已失效，請輸入新驗證碼後重試。",
  CAPTCHA_EXPIRED: "此 7 位數驗證碼已超過 5 分鐘有效期限或已失效，系統已換發新驗證碼，請重新輸入。",
  INVALID_CREDENTIALS: "帳號或密碼不正確，且原驗證碼已單次消耗失效，請確認密碼並輸入新驗證碼。",
  UNAUTHORIZED:
    "請先完成帳號密碼與 7 位數驗證碼登入，才能檢視設備清單或執行預約、領取與歸還管理操作。",
  FORBIDDEN:
    "權限不足：「登記領取」、「登記歸還」與「審核及借用管理」僅供管理員（admin）角色執行。",
  RESOURCE_NOT_FOUND: "找不到指定的預約借用紀錄或目標設備，請重新整理清單後再試。",
  DATE_OUT_OF_RANGE: "僅開放申請當日起算 7 天內尚未開始的固定時段，所選日期不在開放範圍內。",
  SLOT_ALREADY_STARTED: "無法申請：所選固定時段已開始或已結束，請選擇尚未開始的固定時段。",
  EQUIPMENT_UNAVAILABLE:
    "無法建立預約：指定的設備不存在或目前處於不可借用狀態，請重新整理設備清單後改選其他設備。",
  RESERVATION_CONFLICT:
    "申請失敗：該設備於所選日期與固定時段已完成當日借用並歸還結案（或已被其他有效／借用中紀錄占用），同一固定時段不重新開放重複預約。",
  DUPLICATE_PENDING_OR_ACTIVE_RESERVATION:
    "重複申請遭拒：您已對同一台設備、同一日期與同一固定時段持有一筆未結束的紀錄，同一成員不得對同一設備時段重複申請。",
  INVALID_RESERVATION_STATUS:
    "無法執行此操作：該筆預約或借用紀錄目前狀態不允許執行此操作（僅「已核准／有效」預約可執行登記領取，僅「借用中」紀錄可執行登記歸還）。",
  PICKUP_DATE_NOT_TODAY:
    "無法登記領取：系統僅開放預約當日且尚未超過該固定時段結束時間的已核准預約辦理現場領取，拒絕未來日期提前領取。",
  PICKUP_WINDOW_EXPIRED:
    "無法登記領取：該筆預約的固定時段已經結束，已逾期未領取的預約無法補登領取。",
  RESERVATION_ALREADY_CHECKED_OUT:
    "無法取消預約：該筆預約已完成現場登記領取（目前狀態為「借用中」或「已歸還」），一旦領取設備後即禁止取消預約，請於使用完畢後將設備帶回現場由管理員執行「登記歸還」。",
  RESERVATION_ALREADY_STARTED: "無法執行此操作：該筆申請的預約時段已到達或超過開始時間。",
  RESERVATION_ALREADY_CANCELLED: "無法取消預約：該筆申請已經處於「已取消」狀態，無須重複取消。",
};

export type RescheduleErrorCode =
  | "RESCHEDULE_NOT_ALLOWED"
  | "RESCHEDULE_TARGET_INVALID"
  | "RESCHEDULE_SLOT_CONFLICT"
  | "RESCHEDULE_ALREADY_PENDING"
  | "INVALID_RESCHEDULE_STATUS";

/** 迭代 4 改期錯誤碼說明；與 ERROR_MESSAGES 分開，保留前三次迭代的 19 個錯誤碼清單不變（NFR-001、SC-006）。 */
export const RESCHEDULE_ERROR_MESSAGES: Record<RescheduleErrorCode, string> = {
  RESCHEDULE_NOT_ALLOWED:
    "無法申請改期：只有「已核准／有效」且原時段尚未開始的預約可以改期，這筆預約目前不符合條件。",
  RESCHEDULE_TARGET_INVALID:
    "無法改到所選時段：新時段不可與原時段相同、不可已開始、須在今日起 7 天內，且您在該時段不可已有其他未結束的預約。",
  RESCHEDULE_SLOT_CONFLICT: "改期失敗：新時段已被占用，原預約維持不變，請改選其他時段。",
  RESCHEDULE_ALREADY_PENDING:
    "無法再次申請改期：這筆預約已有一筆「改期審核中」的申請，請先撤回後再重新申請。",
  INVALID_RESCHEDULE_STATUS:
    "無法執行此操作：這筆改期申請已非「改期審核中」（已改期成功、被駁回、已撤回或已失效）。",
};

export const UI_TEXT = {
  brandTitle: "精密實驗設備借用中心",
  nav: {
    login: "登入",
    booking: "設備預約",
    myReservations: "我的預約",
    equipmentStatus: "設備狀態管理",
    admin: "審核與借用管理",
    logout: "登出",
    darkMode: "深色模式",
    lightMode: "淺色模式",
  },
  roles: {
    member: "一般成員",
    admin: "管理員",
    guest: "尚未登入",
  },
  equipmentStatus: {
    available: "可用",
    maintenance: "送修中",
    retired: "停用",
  },
  approvalModes: {
    requiresApproval: "需人工審核",
    noApproval: "免審核",
  },
  slotStatus: {
    available: "可預約",
    pending_by_me: "本人待審核",
    booked_by_me: "本人已預約",
    checked_out_by_me: "本人借用中",
    returned_by_me: "本人已歸還",
    booked_by_others: "已被預約",
  },
  slotStatusByCode: {
    AVAILABLE: "可預約",
    MY_PENDING: "本人待審核",
    MY_CONFIRMED: "本人已預約",
    MY_CHECKED_OUT: "本人借用中",
    MY_RETURNED: "本人已歸還",
    OCCUPIED: "已被預約",
    MY_RESCHEDULE_PENDING: "本人改期審核中",
  },
  reservationStatus: {
    pending_approval: "待審核",
    confirmed: "已核准／有效",
    checked_out: "借用中",
    returned: "已歸還",
    rejected: "已駁回",
    cancelled: "已取消",
  },
  rescheduleStatus: {
    pending_approval: "改期審核中",
    approved: "改期成功",
    rejected: "改期被駁回",
    withdrawn: "改期已撤回",
    expired: "改期已失效",
  },
  rescheduleExpireReason: {
    original_slot_started: "原時段開始",
    new_slot_started: "新時段開始",
    reservation_cancelled: "原預約已取消",
    reservation_checked_out: "原預約已登記領取",
  },
  reschedule: {
    requestReschedule: "申請改期",
    withdraw: "撤回",
    rescheduleRequestTag: "改期申請",
  },
  actions: {
    pickup: "登記領取",
    pickupProcessing: "登記領取中…",
    returnEquipment: "登記歸還",
    returnProcessing: "登記歸還中…",
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
  if (code && code in RESCHEDULE_ERROR_MESSAGES) {
    return RESCHEDULE_ERROR_MESSAGES[code as RescheduleErrorCode];
  }
  return "操作失敗，請稍後再試。";
}
