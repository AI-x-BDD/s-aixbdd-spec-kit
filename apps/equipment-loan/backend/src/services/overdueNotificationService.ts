import { prisma } from "../db/prisma.js";
import { getSlotStartUtc } from "../utils/taipeiTime.js";

/**
 * 逾期檢查（S1，FR-001、FR-009、FR-011、FR-012）。自動檢查與手動檢查共用這個函式。
 *
 * - 逾期判定只看預約狀態與時段，不讀 `equipments.status`。
 * - `now` 由呼叫端傳入，SQL 不使用資料庫的 `now()`。
 * - 以唯一約束 `reservation_id` 與 `ON CONFLICT DO NOTHING`，已有通知的借用不再建立，
 *   同時執行的兩次檢查也只會建立一則通知。
 *
 * @returns 這次新建立的通知數
 */
export async function runOverdueCheck(now: Date): Promise<number> {
  const rows = await prisma.$transaction(
    async (tx) =>
      tx.$queryRaw<{ id: string }[]>`
      INSERT INTO overdue_notifications (
        id, reservation_id, status, attempt_count, auto_retry_count,
        next_attempt_at, created_at, updated_at
      )
      SELECT
        gen_random_uuid(), r.id, 'sending'::overdue_notification_status, 0, 0,
        ${now}::timestamptz, ${now}::timestamptz, ${now}::timestamptz
      FROM reservations r
      JOIN time_slots s ON s.id = r.slot_id
      WHERE r.status = 'checked_out'
        AND r.deleted_at IS NULL
        AND ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') < ${now}::timestamptz
      ON CONFLICT (reservation_id) DO NOTHING
      RETURNING id
    `,
  );
  return rows.length;
}

export interface OverdueNotificationContentInput {
  equipmentCode: string;
  equipmentName: string;
  memberName: string;
  /** 預約日期 YYYY-MM-DD（Asia/Taipei） */
  reservationDate: string;
  slotName: string;
  /** HH:mm */
  slotStartTime: string;
  /** HH:mm */
  slotEndTime: string;
}

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];
const MAX_CONTENT_LENGTH = 2000;

/** 預約日期是日曆日期，星期不受時區影響，以 UTC 換算。 */
function getWeekdayName(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** 「已逾期多久」：分鐘無條件捨去，只省略前面為 0 的單位，不到 1 分鐘寫「已逾期不到 1 分鐘」。 */
export function formatOverdueDuration(overdueMs: number): string {
  const totalMinutes = Math.max(0, Math.floor(overdueMs / 60_000));
  if (totalMinutes < 1) {
    return "已逾期不到 1 分鐘";
  }
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `已逾期 ${days} 天 ${hours} 小時 ${minutes} 分鐘`;
  }
  if (hours > 0) {
    return `已逾期 ${hours} 小時 ${minutes} 分鐘`;
  }
  return `已逾期 ${minutes} 分鐘`;
}

/** 組出 Discord 通知內容（FR-013、NFR-002）：四行文字，全文 2000 字以內。 */
export function buildOverdueNotificationContent(
  input: OverdueNotificationContentInput,
  now: Date,
): string {
  const endsAt = getSlotStartUtc(input.reservationDate, input.slotEndTime);
  const lines = [
    `【逾期未還】${input.equipmentCode} ${input.equipmentName}`,
    `借用成員：${input.memberName}`,
    `預約時段：${input.reservationDate}（${getWeekdayName(input.reservationDate)}）${input.slotName} ${input.slotStartTime}–${input.slotEndTime}`,
    formatOverdueDuration(now.getTime() - endsAt.getTime()),
  ];
  return lines.join("\n").slice(0, MAX_CONTENT_LENGTH);
}
