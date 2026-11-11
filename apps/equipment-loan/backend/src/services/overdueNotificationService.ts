import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { AppError, overdueNotificationError } from "../middleware/errorHandler.js";
import { formatUtcDateToDateStr, getSlotStartUtc, getTaipeiNow } from "../utils/taipeiTime.js";

export type OverdueNotificationStatus = "sending" | "sent" | "failed" | "unknown";

export type OverdueNotificationFailureReason =
  | "rate_limited"
  | "discord_server_error"
  | "connection_failed"
  | "webhook_invalid"
  | "webhook_not_configured"
  | "message_rejected";

/** 逾期通知（contracts/openapi.yaml OverdueNotification）。 */
export interface OverdueNotificationDto {
  id: string;
  reservationId: string;
  reservationNumber: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  userId: string;
  userDisplayName: string;
  reservationDate: string;
  slotName: string;
  slotStartTime: string;
  slotEndTime: string;
  status: OverdueNotificationStatus;
  attemptCount: number;
  lastAttemptedAt: string | null;
  sentAt: string | null;
  discordMessageId: string | null;
  failureReason: OverdueNotificationFailureReason | null;
  loanReturned: boolean;
  returnedAt: string | null;
  canResend: boolean;
  createdAt: string;
}

/** 逾期通知分頁回應（contracts/openapi.yaml OverdueNotificationPage）。 */
export interface OverdueNotificationPageDto {
  items: OverdueNotificationDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const NOTIFICATION_INCLUDE = {
  reservation: { include: { equipment: true, user: true, slot: true } },
} as const;

type NotificationRow = Prisma.overdue_notificationsGetPayload<{
  include: typeof NOTIFICATION_INCLUDE;
}>;

function toOverdueNotificationDto(row: NotificationRow): OverdueNotificationDto {
  const reservation = row.reservation;
  return {
    id: row.id,
    reservationId: reservation.id,
    reservationNumber: reservation.reservation_no,
    equipmentId: reservation.equipment.id,
    equipmentCode: reservation.equipment.equipment_code,
    equipmentName: reservation.equipment.name,
    userId: reservation.user.id,
    userDisplayName: reservation.user.display_name,
    reservationDate: formatUtcDateToDateStr(reservation.reservation_date),
    slotName: reservation.slot.name,
    slotStartTime: reservation.slot.start_time,
    slotEndTime: reservation.slot.end_time,
    status: row.status,
    attemptCount: row.attempt_count,
    lastAttemptedAt: row.last_attempted_at?.toISOString() ?? null,
    sentAt: row.sent_at?.toISOString() ?? null,
    discordMessageId: row.discord_message_id,
    failureReason: row.failure_reason,
    loanReturned: reservation.status === "returned",
    returnedAt: reservation.returned_at?.toISOString() ?? null,
    canResend:
      (row.status === "failed" || row.status === "unknown") && reservation.status === "checked_out",
    createdAt: row.created_at.toISOString(),
  };
}

/**
 * 通知紀錄查詢（S2，FR-003、FR-004、FR-008、FR-012）：只讀取，不改變通知與預約。
 * 依 created_at 由新到舊、相同時依 id 由小到大排序；page 超過 totalPages 時 items 為空陣列。
 * 回傳內容不含 Webhook 位址（NFR-003）。
 */
export async function listOverdueNotifications(params: {
  status?: OverdueNotificationStatus;
  page: number;
  pageSize: number;
}): Promise<OverdueNotificationPageDto> {
  const { status, page, pageSize } = params;
  const where = { deleted_at: null, ...(status ? { status } : {}) };

  const [totalItems, rows] = await Promise.all([
    prisma.overdue_notifications.count({ where }),
    prisma.overdue_notifications.findMany({
      where,
      orderBy: [{ created_at: "desc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: NOTIFICATION_INCLUDE,
    }),
  ]);

  return {
    items: rows.map(toOverdueNotificationDto),
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}

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

const STATUS_LABELS: Record<OverdueNotificationStatus, string> = {
  sending: "送出中",
  sent: "送出成功",
  failed: "送出失敗",
  unknown: "結果不明",
};

function formatTaipeiDateTime(at: Date): string {
  const { dateStr, timeStr } = getTaipeiNow(at);
  return `${dateStr} ${timeStr}`;
}

/**
 * 管理員重送一則「送出失敗」或「結果不明」的通知（S2，FR-005、FR-007、FR-008、FR-018）。
 *
 * 以一條條件式更新領取重送權：同一則通知改回 `sending`，`next_attempt_at` 設為目前時間，
 * `auto_retry_count` 歸 0，`failure_reason` 清為 null；不建立新列，`attempt_count` 不歸 0（SC-004）。
 * 不等送出結果，送出由送出程序接手。更新 0 列時依序判斷：通知不存在、借用已歸還、
 * 通知狀態為 `sending` 或 `sent`。
 */
export async function resendOverdueNotification(
  notificationId: string,
  adminId: string,
  now: Date = new Date(),
): Promise<OverdueNotificationDto> {
  const updated = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE overdue_notifications n
    SET status = 'sending'::overdue_notification_status,
        next_attempt_at = ${now}::timestamptz,
        auto_retry_count = 0,
        failure_reason = NULL,
        updated_by = ${adminId}::uuid,
        updated_at = ${now}::timestamptz
    FROM reservations r
    WHERE n.id = ${notificationId}::uuid
      AND n.deleted_at IS NULL
      AND r.id = n.reservation_id
      AND n.status IN ('failed', 'unknown')
      AND r.status = 'checked_out'
    RETURNING n.id
  `;

  const row = await prisma.overdue_notifications.findFirst({
    where: { id: notificationId, deleted_at: null },
    include: NOTIFICATION_INCLUDE,
  });

  if (updated.length > 0 && row) {
    return toOverdueNotificationDto(row);
  }

  if (!row) {
    throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的逾期通知不存在。");
  }

  const reservation = row.reservation;
  const label = reservation.reservation_no;

  if (reservation.status !== "checked_out") {
    const returnedAt = reservation.returned_at
      ? `已在 ${formatTaipeiDateTime(reservation.returned_at)} 登記歸還`
      : "已歸還";
    throw overdueNotificationError(
      "OVERDUE_LOAN_RETURNED",
      `借用已歸還，不需要重送：${label}（${reservation.user.display_name}，${reservation.equipment.equipment_code} ${reservation.equipment.name}）${returnedAt}。`,
    );
  }

  if (row.status === "sent") {
    const sentAt = row.sent_at ? `（送出時間 ${formatTaipeiDateTime(row.sent_at)}）` : "";
    throw overdueNotificationError(
      "OVERDUE_NOTIFICATION_NOT_RESENDABLE",
      `無法重送：${label} 的通知已「${STATUS_LABELS.sent}」${sentAt}，Discord 頻道已收到這則通知。`,
    );
  }

  throw overdueNotificationError(
    "OVERDUE_NOTIFICATION_NOT_RESENDABLE",
    `無法重送：${label} 的通知目前為「${STATUS_LABELS[row.status]}」，系統正在送出，請稍後按「重新整理」查看結果。`,
  );
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
