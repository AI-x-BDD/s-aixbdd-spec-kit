import { randomBytes } from "node:crypto";
import { prisma } from "../db/prisma.js";
import { AppError, rescheduleError } from "../middleware/errorHandler.js";
import {
  addDaysToDateStr,
  formatUtcDateToDateStr,
  getTaipeiNow,
  hasSlotStarted,
  isValidDateString,
  isWithinOpenDateWindow,
  parseDateOnlyToUtc,
} from "../utils/taipeiTime.js";
import {
  memberReservationInclude,
  toMemberReservationDto,
  type MemberReservationDto,
  type ReservationStatus,
} from "./reservationService.js";

export type RescheduleRequestStatus =
  "pending_approval" | "approved" | "rejected" | "withdrawn" | "expired";

export type RescheduleExpireReason =
  | "original_slot_started"
  | "new_slot_started"
  | "reservation_cancelled"
  | "reservation_checked_out";

export interface TimeSlotSummaryDto {
  slotId: string;
  slotName: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
}

export interface RescheduleRequestDto {
  id: string;
  requestNumber: string;
  reservationId: string;
  status: RescheduleRequestStatus;
  fromReservationDate: string;
  fromSlot: TimeSlotSummaryDto;
  toReservationDate: string;
  toSlot: TimeSlotSummaryDto;
  createdAt: string;
  reviewedBy: string | null;
  reviewedByDisplayName: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  withdrawnAt: string | null;
  expiredAt: string | null;
  expireReason: RescheduleExpireReason | null;
  canWithdraw: boolean;
}

export interface CreateRescheduleRequestResultDto {
  rescheduleRequest: RescheduleRequestDto;
  reservation: MemberReservationDto;
}

interface SlotRow {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pending_approval: "待審核",
  confirmed: "已核准／有效",
  checked_out: "借用中",
  returned: "已歸還",
  rejected: "已駁回",
  cancelled: "已取消",
};

/** 改期申請編號：RR- 加申請當下的 Asia/Taipei 日期 yyyyMMdd 加隨機碼（tasks.md Notes 待確認 1）。 */
export function generateRescheduleRequestNo(now: Date = new Date()): string {
  const { dateStr } = getTaipeiNow(now);
  const compactDate = dateStr.replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `RR-${compactDate}-${suffix}`;
}

function toTimeSlotSummaryDto(slot: SlotRow): TimeSlotSummaryDto {
  return {
    slotId: slot.id,
    slotName: slot.name,
    startTime: slot.start_time,
    endTime: slot.end_time,
    sortOrder: slot.sort_order,
  };
}

function formatSlotText(dateStr: string, slot: SlotRow): string {
  return `${dateStr} ${slot.name} ${slot.start_time}–${slot.end_time}`;
}

export function toRescheduleRequestDto(row: {
  id: string;
  request_no: string;
  reservation_id: string;
  status: RescheduleRequestStatus;
  from_reservation_date: Date;
  to_reservation_date: Date;
  created_at: Date;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  reject_reason: string | null;
  withdrawn_at: Date | null;
  expired_at: Date | null;
  expire_reason: RescheduleExpireReason | null;
  from_slot: SlotRow;
  to_slot: SlotRow;
  reviewer?: { display_name: string } | null;
}): RescheduleRequestDto {
  return {
    id: row.id,
    requestNumber: row.request_no,
    reservationId: row.reservation_id,
    status: row.status,
    fromReservationDate: formatUtcDateToDateStr(row.from_reservation_date),
    fromSlot: toTimeSlotSummaryDto(row.from_slot),
    toReservationDate: formatUtcDateToDateStr(row.to_reservation_date),
    toSlot: toTimeSlotSummaryDto(row.to_slot),
    createdAt: row.created_at.toISOString(),
    reviewedBy: row.reviewed_by,
    reviewedByDisplayName: row.reviewer ? row.reviewer.display_name : null,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    rejectReason: row.reject_reason,
    withdrawnAt: row.withdrawn_at ? row.withdrawn_at.toISOString() : null,
    expiredAt: row.expired_at ? row.expired_at.toISOString() : null,
    expireReason: row.expire_reason,
    canWithdraw: row.status === "pending_approval",
  };
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

/**
 * 成員送出改期（POST /api/reservations/:reservationId/reschedule-requests）。
 * 在單一互動式交易內完成 FR-001 的可改期檢查；免審核設備即時改期（FR-002），
 * 新時段占用由 uq_reservations_active_slot 保護，P2002 轉成 409 RESCHEDULE_SLOT_CONFLICT（FR-014）。
 */
export async function createRescheduleRequest(params: {
  userId: string;
  reservationId: string;
  toReservationDate: string;
  toSlotId: string;
}): Promise<CreateRescheduleRequestResultDto> {
  if (!isValidDateString(params.toReservationDate)) {
    throw new AppError(
      "VALIDATION_FAILED",
      400,
      "新預約日期 toReservationDate 必須為有效的 YYYY-MM-DD 格式。",
    );
  }

  // 交易回滾後組 P2002 訊息時使用
  let conflictMessage: string | null = null;

  try {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservations.findFirst({
        where: { id: params.reservationId, deleted_at: null },
        include: { equipment: true, slot: true },
      });
      const toSlot = await tx.time_slots.findFirst({
        where: { id: params.toSlotId, deleted_at: null },
      });

      if (!reservation || !toSlot) {
        throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的預約或固定時段不存在。");
      }

      if (reservation.user_id !== params.userId) {
        throw new AppError("FORBIDDEN", 403, "只能對本人的預約申請改期。");
      }

      const fromDateStr = formatUtcDateToDateStr(reservation.reservation_date);
      const fromSlot = reservation.slot;
      const fromText = formatSlotText(fromDateStr, fromSlot);

      if (reservation.status !== "confirmed") {
        throw rescheduleError(
          "RESCHEDULE_NOT_ALLOWED",
          `無法改期：預約 ${reservation.reservation_no} 目前為「${RESERVATION_STATUS_LABEL[reservation.status]}」。只有原時段尚未開始的「已核准／有效」預約可以改期。`,
        );
      }

      const now = new Date();
      if (hasSlotStarted(fromDateStr, fromSlot.start_time, now)) {
        throw rescheduleError(
          "RESCHEDULE_NOT_ALLOWED",
          `無法改期：預約 ${reservation.reservation_no} 的原時段 ${fromText} 已開始。只有原時段尚未開始的「已核准／有效」預約可以改期。`,
        );
      }

      const toDateStr = params.toReservationDate;
      const toText = formatSlotText(toDateStr, toSlot);

      if (toDateStr === fromDateStr && toSlot.id === fromSlot.id) {
        throw rescheduleError(
          "RESCHEDULE_TARGET_INVALID",
          `新時段不能與原時段相同（${fromText}），請選擇其他時段。`,
        );
      }

      if (!isWithinOpenDateWindow(toDateStr, now)) {
        const { dateStr: todayStr } = getTaipeiNow(now);
        throw rescheduleError(
          "RESCHEDULE_TARGET_INVALID",
          `只能改到 ${todayStr} 至 ${addDaysToDateStr(todayStr, 6)}（當日起算 7 天）內的時段。`,
        );
      }

      if (hasSlotStarted(toDateStr, toSlot.start_time, now)) {
        throw rescheduleError(
          "RESCHEDULE_TARGET_INVALID",
          `${toText} 已開始，請選擇尚未開始的時段。`,
        );
      }

      const toDateUtc = parseDateOnlyToUtc(toDateStr);

      const myOpen = await tx.reservations.findFirst({
        where: {
          id: { not: reservation.id },
          user_id: params.userId,
          equipment_id: reservation.equipment_id,
          reservation_date: toDateUtc,
          slot_id: toSlot.id,
          status: { in: ["pending_approval", "confirmed", "checked_out"] },
          deleted_at: null,
        },
      });
      if (myOpen) {
        throw rescheduleError(
          "RESCHEDULE_TARGET_INVALID",
          `您在 ${toText} 已有這台設備的預約 ${myOpen.reservation_no}，不能改到同一時段。`,
        );
      }

      conflictMessage = `改期失敗：${toText} 剛被其他預約占用。您的預約 ${reservation.reservation_no} 仍為 ${fromText}，沒有任何變更。`;

      const occupied = await tx.reservations.findFirst({
        where: {
          equipment_id: reservation.equipment_id,
          reservation_date: toDateUtc,
          slot_id: toSlot.id,
          status: { in: ["confirmed", "checked_out", "returned"] },
          deleted_at: null,
        },
      });
      if (occupied) {
        throw rescheduleError(
          "RESCHEDULE_SLOT_CONFLICT",
          `改期失敗：${toText} 已被其他預約占用。您的預約 ${reservation.reservation_no} 仍為 ${fromText}，沒有任何變更。`,
        );
      }

      if (reservation.equipment.requires_approval) {
        // 需人工審核設備建立 pending_approval 申請的路徑由 T026 實作
        throw new Error("需人工審核設備的改期申請尚未實作。");
      }

      // 只在預約仍為原日期時段且為 confirmed 時改寫，避免同一預約的並發改期或取消互相覆蓋
      const moved = await tx.reservations.updateMany({
        where: {
          id: reservation.id,
          reservation_date: reservation.reservation_date,
          slot_id: fromSlot.id,
          status: "confirmed",
          deleted_at: null,
        },
        data: {
          reservation_date: toDateUtc,
          slot_id: toSlot.id,
          updated_at: now,
          updated_by: params.userId,
        },
      });
      if (moved.count !== 1) {
        throw rescheduleError(
          "RESCHEDULE_NOT_ALLOWED",
          `無法改期：預約 ${reservation.reservation_no} 剛被變更，請重新整理後再試。只有原時段尚未開始的「已核准／有效」預約可以改期。`,
        );
      }

      const created = await tx.reschedule_requests.create({
        data: {
          request_no: generateRescheduleRequestNo(now),
          reservation_id: reservation.id,
          user_id: params.userId,
          from_reservation_date: reservation.reservation_date,
          from_slot_id: fromSlot.id,
          to_reservation_date: toDateUtc,
          to_slot_id: toSlot.id,
          status: "approved",
          reviewed_by: null,
          reviewed_at: null,
          created_at: now,
          updated_at: now,
          updated_by: params.userId,
        },
        include: { from_slot: true, to_slot: true, reviewer: true },
      });

      const updatedReservation = await tx.reservations.findUniqueOrThrow({
        where: { id: reservation.id },
        include: memberReservationInclude,
      });

      return {
        rescheduleRequest: toRescheduleRequestDto(created),
        reservation: toMemberReservationDto(updatedReservation, now),
      };
    });
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      throw rescheduleError(
        "RESCHEDULE_SLOT_CONFLICT",
        conflictMessage ?? "改期失敗：新時段剛被其他預約占用，您的預約沒有任何變更。",
      );
    }
    throw err;
  }
}
