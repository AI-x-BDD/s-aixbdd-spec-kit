const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Taipei",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const offsetFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Taipei",
  timeZoneName: "longOffset",
});

function getTaipeiOffsetMinutes(at: Date): number {
  const zoneName = offsetFormatter.formatToParts(at).find((p) => p.type === "timeZoneName")?.value;
  const match = zoneName?.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    return 0;
  }
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

export function getTaipeiNow(now: Date = new Date()): { dateStr: string; timeStr: string } {
  const dateStr = dateFormatter.format(now);
  const timeStr = timeFormatter.format(now);
  return { dateStr, timeStr };
}

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function parseDateOnlyToUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatUtcDateToDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const dt = parseDateOnlyToUtc(dateStr);
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatUtcDateToDateStr(dt);
}

/** 判斷日期是否在當日起算 7 天內（今日至今日 + 6 天，依 Asia/Taipei）；新預約與改期的新日期共用。 */
export function isWithinOpenDateWindow(dateStr: string, now: Date = new Date()): boolean {
  if (!isValidDateString(dateStr)) {
    return false;
  }
  const { dateStr: todayStr } = getTaipeiNow(now);
  const maxDateStr = addDaysToDateStr(todayStr, 6);
  return dateStr >= todayStr && dateStr <= maxDateStr;
}

/**
 * 依預約日期（YYYY-MM-DD，Asia/Taipei）與 time_slots.start_time（HH:mm）算出時段開始的 UTC 時間點；
 * 供改期申請的可改期檢查、核准檢查與自動失效寫入 expired_at 共用（FR-001、FR-006、FR-011、FR-012）。
 */
export function getSlotStartUtc(reservationDateStr: string, slotStartTime: string): Date {
  const [y, m, d] = reservationDateStr.split("-").map(Number);
  const [hh, mm] = slotStartTime.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(y, m - 1, d, hh, mm);
  const offsetMinutes = getTaipeiOffsetMinutes(new Date(wallClockAsUtc));
  return new Date(wallClockAsUtc - offsetMinutes * 60_000);
}

/** 判斷時段在指定時間（預設現在）是否已開始，依 Asia/Taipei 解讀；改期的原時段與新時段檢查也使用本函式。 */
export function hasSlotStarted(
  reservationDateStr: string,
  slotStartTime: string,
  now: Date = new Date(),
): boolean {
  const { dateStr: todayStr, timeStr } = getTaipeiNow(now);
  if (reservationDateStr < todayStr) {
    return true;
  }
  if (reservationDateStr > todayStr) {
    return false;
  }
  return timeStr >= slotStartTime;
}

export function checkPickupWindow(
  reservationDateStr: string,
  slotEndTime: string,
  now: Date = new Date(),
): "OK" | "PICKUP_DATE_NOT_TODAY" | "PICKUP_WINDOW_EXPIRED" {
  const { dateStr: todayStr, timeStr } = getTaipeiNow(now);
  if (reservationDateStr > todayStr) {
    return "PICKUP_DATE_NOT_TODAY";
  }
  if (reservationDateStr < todayStr || timeStr >= slotEndTime) {
    return "PICKUP_WINDOW_EXPIRED";
  }
  return "OK";
}

export function canPickupInWindow(
  reservationDateStr: string,
  slotEndTime: string,
  now: Date = new Date(),
): boolean {
  return checkPickupWindow(reservationDateStr, slotEndTime, now) === "OK";
}
