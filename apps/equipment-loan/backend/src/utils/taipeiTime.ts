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

export function isWithinOpenDateWindow(dateStr: string, now: Date = new Date()): boolean {
  if (!isValidDateString(dateStr)) {
    return false;
  }
  const { dateStr: todayStr } = getTaipeiNow(now);
  const maxDateStr = addDaysToDateStr(todayStr, 6);
  return dateStr >= todayStr && dateStr <= maxDateStr;
}

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
