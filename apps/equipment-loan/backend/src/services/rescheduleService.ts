import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
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

/**
 * 惰性失效（research §3，FR-011、FR-012、SC-004）：以一條 UPDATE 把原時段或新時段開始時間已到的
 * pending_approval 申請改為 expired；expire_reason 依先到的時段寫入 original_slot_started 或 new_slot_started，
 * expired_at 寫入該時段的開始時間（依 Asia/Taipei 換算），updated_by 為 null。
 * 由各操作在交易開頭呼叫，回傳本次失效的筆數。
 */
export async function expireDueRescheduleRequests(
  tx: Prisma.TransactionClient,
  now: Date = new Date(),
): Promise<number> {
  return tx.$executeRaw`
    UPDATE reschedule_requests AS rr
    SET status = 'expired'::reschedule_request_status,
        expire_reason = CASE
          WHEN due.from_start <= due.to_start THEN 'original_slot_started'::reschedule_expire_reason
          ELSE 'new_slot_started'::reschedule_expire_reason
        END,
        expired_at = LEAST(due.from_start, due.to_start),
        updated_at = ${now},
        updated_by = NULL
    FROM (
      SELECT r.id,
             (r.from_reservation_date + fs.start_time::time) AT TIME ZONE 'Asia/Taipei' AS from_start,
             (r.to_reservation_date + ts.start_time::time) AT TIME ZONE 'Asia/Taipei' AS to_start
      FROM reschedule_requests AS r
      JOIN time_slots AS fs ON fs.id = r.from_slot_id
      JOIN time_slots AS ts ON ts.id = r.to_slot_id
      WHERE r.status = 'pending_approval' AND r.deleted_at IS NULL
    ) AS due
    WHERE rr.id = due.id
      AND rr.status = 'pending_approval'
      AND rr.deleted_at IS NULL
      AND (due.from_start <= ${now} OR due.to_start <= ${now})
  `;
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

const PENDING_PER_RESERVATION_INDEX = "uq_reschedule_requests_pending_per_reservation";

/** 判斷 P2002 是否來自 uq_reschedule_requests_pending_per_reservation（與 uq_reservations_active_slot 分開判斷）。 */
function isPendingPerReservationViolation(err: unknown): boolean {
  const cause = (
    err as {
      meta?: {
        driverAdapterError?: {
          cause?: { constraint?: { index?: string }; originalMessage?: string };
        };
        target?: unknown;
      };
    }
  ).meta;
  const adapterCause = cause?.driverAdapterError?.cause;
  return (
    adapterCause?.constraint?.index === PENDING_PER_RESERVATION_INDEX ||
    (adapterCause?.originalMessage ?? "").includes(PENDING_PER_RESERVATION_INDEX) ||
    String(cause?.target ?? "").includes(PENDING_PER_RESERVATION_INDEX)
  );
}

function alreadyPendingError(reservationNo: string, requestNo: string): AppError {
  return rescheduleError(
    "RESCHEDULE_ALREADY_PENDING",
    `無法送出：預約 ${reservationNo} 已有一筆改期審核中的申請 ${requestNo}，請先撤回這筆申請，再重新申請改期。`,
  );
}

/**
 * 成員送出改期（POST /api/reservations/:reservationId/reschedule-requests）。
 * 在單一互動式交易內完成 FR-001 的可改期檢查；免審核設備即時改期（FR-002），
 * 新時段占用由 uq_reservations_active_slot 保護，P2002 轉成 409 RESCHEDULE_SLOT_CONFLICT（FR-014）；
 * 需人工審核設備只建立 pending_approval 申請（FR-003），同一預約已有審核中申請時回 409 RESCHEDULE_ALREADY_PENDING（FR-004）。
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
  let reservationNoForError: string | null = null;

  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      // 先讓到期的改期審核中申請失效，避免已到期的申請擋住單一審核中檢查（research §3）
      await expireDueRescheduleRequests(tx, now);

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
      reservationNoForError = reservation.reservation_no;

      if (reservation.status !== "confirmed") {
        throw rescheduleError(
          "RESCHEDULE_NOT_ALLOWED",
          `無法改期：預約 ${reservation.reservation_no} 目前為「${RESERVATION_STATUS_LABEL[reservation.status]}」。只有原時段尚未開始的「已核准／有效」預約可以改期。`,
        );
      }

      // 免審核與需人工審核兩條路徑都先檢查單一審核中限制（FR-004）
      const existingPending = await tx.reschedule_requests.findFirst({
        where: { reservation_id: reservation.id, status: "pending_approval", deleted_at: null },
      });
      if (existingPending) {
        throw alreadyPendingError(reservation.reservation_no, existingPending.request_no);
      }

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
        // 需人工審核設備（FR-003）：只建立 pending_approval 申請，不寫入 reservations、不保留新時段
        const pending = await tx.reschedule_requests.create({
          data: {
            request_no: generateRescheduleRequestNo(now),
            reservation_id: reservation.id,
            user_id: params.userId,
            from_reservation_date: reservation.reservation_date,
            from_slot_id: fromSlot.id,
            to_reservation_date: toDateUtc,
            to_slot_id: toSlot.id,
            status: "pending_approval",
            created_at: now,
            updated_at: now,
            updated_by: params.userId,
          },
          include: { from_slot: true, to_slot: true, reviewer: true },
        });

        const unchangedReservation = await tx.reservations.findUniqueOrThrow({
          where: { id: reservation.id },
          include: memberReservationInclude,
        });

        return {
          rescheduleRequest: toRescheduleRequestDto(pending),
          reservation: toMemberReservationDto(unchangedReservation, now),
        };
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
    if (isUniqueViolation(err) && isPendingPerReservationViolation(err)) {
      // 並發送出時只成立一筆（FR-004）：交易已回滾，查出已成立的申請編號組訊息
      const winner = await prisma.reschedule_requests.findFirst({
        where: {
          reservation_id: params.reservationId,
          status: "pending_approval",
          deleted_at: null,
        },
      });
      throw alreadyPendingError(
        reservationNoForError ?? params.reservationId,
        winner?.request_no ?? "（另一筆）",
      );
    }
    if (isUniqueViolation(err)) {
      throw rescheduleError(
        "RESCHEDULE_SLOT_CONFLICT",
        conflictMessage ?? "改期失敗：新時段剛被其他預約占用，您的預約沒有任何變更。",
      );
    }
    throw err;
  }
}

export interface AdminRescheduleRequestItemDto {
  id: string;
  requestNumber: string;
  reservationId: string;
  reservationNumber: string;
  userId: string;
  username: string;
  userDisplayName: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentRequiresApproval: boolean;
  status: RescheduleRequestStatus;
  fromReservationDate: string;
  fromSlot: TimeSlotSummaryDto;
  toReservationDate: string;
  toSlot: TimeSlotSummaryDto;
  createdAt: string;
  reviewedBy: string | null;
  reviewedByUsername: string | null;
  reviewedByDisplayName: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  withdrawnAt: string | null;
  expiredAt: string | null;
  expireReason: RescheduleExpireReason | null;
}

export interface AdminRescheduleRequestPageDto {
  items: AdminRescheduleRequestItemDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const adminRescheduleRequestInclude = {
  reservation: { include: { equipment: true } },
  user: true,
  reviewer: true,
  from_slot: true,
  to_slot: true,
} as const;

export function toAdminRescheduleRequestDto(row: {
  id: string;
  request_no: string;
  reservation_id: string;
  user_id: string;
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
  user: { username: string; display_name: string };
  reviewer: { username: string; display_name: string } | null;
  reservation: {
    reservation_no: string;
    equipment_id: string;
    equipment: { equipment_code: string; name: string; requires_approval: boolean };
  };
}): AdminRescheduleRequestItemDto {
  return {
    id: row.id,
    requestNumber: row.request_no,
    reservationId: row.reservation_id,
    reservationNumber: row.reservation.reservation_no,
    userId: row.user_id,
    username: row.user.username,
    userDisplayName: row.user.display_name,
    equipmentId: row.reservation.equipment_id,
    equipmentCode: row.reservation.equipment.equipment_code,
    equipmentName: row.reservation.equipment.name,
    equipmentRequiresApproval: row.reservation.equipment.requires_approval,
    status: row.status,
    fromReservationDate: formatUtcDateToDateStr(row.from_reservation_date),
    fromSlot: toTimeSlotSummaryDto(row.from_slot),
    toReservationDate: formatUtcDateToDateStr(row.to_reservation_date),
    toSlot: toTimeSlotSummaryDto(row.to_slot),
    createdAt: row.created_at.toISOString(),
    reviewedBy: row.reviewed_by,
    reviewedByUsername: row.reviewer ? row.reviewer.username : null,
    reviewedByDisplayName: row.reviewer ? row.reviewer.display_name : null,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    rejectReason: row.reject_reason,
    withdrawnAt: row.withdrawn_at ? row.withdrawn_at.toISOString() : null,
    expiredAt: row.expired_at ? row.expired_at.toISOString() : null,
    expireReason: row.expire_reason,
  };
}

/**
 * 管理員分頁查詢改期申請（GET /api/admin/reschedule-requests，FR-005）。
 * 依新日期、新時段順序、申請時間與 id 排序；不受設備目前 requires_approval 影響（FR-008）。
 */
export async function listRescheduleRequests(params: {
  status?: RescheduleRequestStatus;
  equipmentId?: string;
  page: number;
  pageSize: number;
}): Promise<AdminRescheduleRequestPageDto> {
  const whereClause = {
    deleted_at: null as Date | null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.equipmentId ? { reservation: { equipment_id: params.equipmentId } } : {}),
  };

  return prisma.$transaction(async (tx) => {
    // 查詢前先讓到期的改期審核中申請失效（research §3）
    await expireDueRescheduleRequests(tx, new Date());

    const totalItems = await tx.reschedule_requests.count({ where: whereClause });
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / params.pageSize);

    if (totalPages === 0 || params.page > totalPages) {
      return {
        items: [],
        page: params.page,
        pageSize: params.pageSize,
        totalItems,
        totalPages,
      };
    }

    const rows = await tx.reschedule_requests.findMany({
      where: whereClause,
      include: adminRescheduleRequestInclude,
      orderBy: [
        { to_reservation_date: "asc" },
        { to_slot: { sort_order: "asc" } },
        { created_at: "asc" },
        { id: "asc" },
      ],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    });

    return {
      items: rows.map((row) => toAdminRescheduleRequestDto(row)),
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    };
  });
}

const RESCHEDULE_STATUS_LABEL: Record<RescheduleRequestStatus, string> = {
  pending_approval: "改期審核中",
  approved: "改期成功",
  rejected: "改期被駁回",
  withdrawn: "改期已撤回",
  expired: "改期已失效",
};

function notPendingError(
  action: "核准" | "駁回",
  requestNo: string,
  status: RescheduleRequestStatus,
) {
  return rescheduleError(
    "INVALID_RESCHEDULE_STATUS",
    `無法${action}：改期申請 ${requestNo} 目前為「${RESCHEDULE_STATUS_LABEL[status]}」。只有「改期審核中」的申請可以核准或駁回。`,
  );
}

/**
 * 管理員核准改期申請（POST /api/admin/reschedule-requests/:rescheduleRequestId/approve，FR-006）。
 * 單一交易內重檢申請狀態、原預約狀態、原／新時段尚未開始與新時段占用；
 * 新時段被占用或寫入違反 uq_reservations_active_slot（P2002）時回 409 RESCHEDULE_SLOT_CONFLICT，交易回滾、申請維持 pending_approval。
 */
interface ApproveConflictContext {
  requestNo: string;
  equipmentId: string;
  toDate: Date;
  toSlotId: string;
  toText: string;
  memberName: string;
  reservationNo: string;
  fromText: string;
}

function buildApproveConflictMessage(ctx: ApproveConflictContext, occupantNo: string): string {
  return `無法核准改期申請 ${ctx.requestNo}：新時段 ${ctx.toText} 已被預約 ${occupantNo} 占用。這筆申請維持「改期審核中」，${ctx.memberName}的預約 ${ctx.reservationNo} 仍為 ${ctx.fromText}。您可以改為駁回。`;
}

export async function approveRescheduleRequest(params: {
  adminUserId: string;
  rescheduleRequestId: string;
}): Promise<AdminRescheduleRequestItemDto> {
  // 交易回滾後組 P2002 訊息時使用
  const conflictHolder: { ctx: ApproveConflictContext | null } = { ctx: null };

  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      // 先讓到期的改期審核中申請失效；已失效的申請在下方狀態檢查回 409 INVALID_RESCHEDULE_STATUS（FR-011、FR-012、SC-004）
      await expireDueRescheduleRequests(tx, now);

      const request = await tx.reschedule_requests.findFirst({
        where: { id: params.rescheduleRequestId, deleted_at: null },
        include: adminRescheduleRequestInclude,
      });
      if (!request) {
        throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的改期申請不存在。");
      }

      if (request.status !== "pending_approval") {
        throw notPendingError("核准", request.request_no, request.status);
      }

      const reservation = request.reservation;
      const fromDateStr = formatUtcDateToDateStr(request.from_reservation_date);
      const toDateStr = formatUtcDateToDateStr(request.to_reservation_date);
      const fromText = formatSlotText(fromDateStr, request.from_slot);
      const toText = formatSlotText(toDateStr, request.to_slot);

      if (reservation.status !== "confirmed") {
        throw rescheduleError(
          "INVALID_RESCHEDULE_STATUS",
          `無法核准：改期申請 ${request.request_no} 的原預約 ${reservation.reservation_no} 目前為「${RESERVATION_STATUS_LABEL[reservation.status]}」，不是「已核准／有效」，這筆申請不能再核准。`,
        );
      }

      if (hasSlotStarted(fromDateStr, request.from_slot.start_time, now)) {
        throw rescheduleError(
          "INVALID_RESCHEDULE_STATUS",
          `無法核准：改期申請 ${request.request_no} 的原時段 ${fromText} 已開始，這筆申請不能再核准。${request.user.display_name}的預約 ${reservation.reservation_no} 維持原時段。`,
        );
      }
      if (hasSlotStarted(toDateStr, request.to_slot.start_time, now)) {
        throw rescheduleError(
          "INVALID_RESCHEDULE_STATUS",
          `無法核准：改期申請 ${request.request_no} 的新時段 ${toText} 已開始，這筆申請不能再核准。${request.user.display_name}的預約 ${reservation.reservation_no} 維持原時段。`,
        );
      }

      const conflictContext: ApproveConflictContext = {
        requestNo: request.request_no,
        equipmentId: reservation.equipment_id,
        toDate: request.to_reservation_date,
        toSlotId: request.to_slot_id,
        toText,
        memberName: request.user.display_name,
        reservationNo: reservation.reservation_no,
        fromText,
      };
      conflictHolder.ctx = conflictContext;

      const occupied = await tx.reservations.findFirst({
        where: {
          equipment_id: reservation.equipment_id,
          reservation_date: request.to_reservation_date,
          slot_id: request.to_slot_id,
          status: { in: ["confirmed", "checked_out", "returned"] },
          deleted_at: null,
        },
      });
      if (occupied) {
        throw rescheduleError(
          "RESCHEDULE_SLOT_CONFLICT",
          buildApproveConflictMessage(conflictContext, occupied.reservation_no),
        );
      }

      // 只在預約仍為原日期時段且為 confirmed 時改寫（id、reservation_no、status 不變）
      const moved = await tx.reservations.updateMany({
        where: {
          id: request.reservation_id,
          reservation_date: request.from_reservation_date,
          slot_id: request.from_slot_id,
          status: "confirmed",
          deleted_at: null,
        },
        data: {
          reservation_date: request.to_reservation_date,
          slot_id: request.to_slot_id,
          updated_at: now,
          updated_by: params.adminUserId,
        },
      });
      if (moved.count !== 1) {
        throw rescheduleError(
          "INVALID_RESCHEDULE_STATUS",
          `無法核准：改期申請 ${request.request_no} 的原預約 ${reservation.reservation_no} 剛被變更，請重新整理後再試。`,
        );
      }

      // 只在申請仍為 pending_approval 時改為 approved，避免與撤回或另一位管理員的審核互相覆蓋
      const reviewed = await tx.reschedule_requests.updateMany({
        where: { id: request.id, status: "pending_approval", deleted_at: null },
        data: {
          status: "approved",
          reviewed_by: params.adminUserId,
          reviewed_at: now,
          updated_at: now,
          updated_by: params.adminUserId,
        },
      });
      if (reviewed.count !== 1) {
        throw rescheduleError(
          "INVALID_RESCHEDULE_STATUS",
          `無法核准：改期申請 ${request.request_no} 剛被處理，已不是「改期審核中」。`,
        );
      }

      const updated = await tx.reschedule_requests.findUniqueOrThrow({
        where: { id: request.id },
        include: adminRescheduleRequestInclude,
      });
      return toAdminRescheduleRequestDto(updated);
    });
  } catch (err: unknown) {
    const ctx = conflictHolder.ctx;
    if (isUniqueViolation(err) && ctx) {
      const occupant = await prisma.reservations.findFirst({
        where: {
          equipment_id: ctx.equipmentId,
          reservation_date: ctx.toDate,
          slot_id: ctx.toSlotId,
          status: { in: ["confirmed", "checked_out", "returned"] },
          deleted_at: null,
        },
      });
      throw rescheduleError(
        "RESCHEDULE_SLOT_CONFLICT",
        buildApproveConflictMessage(ctx, occupant?.reservation_no ?? "（另一筆預約）"),
      );
    }
    throw err;
  }
}

/**
 * 管理員駁回改期申請（POST /api/admin/reschedule-requests/:rescheduleRequestId/reject，FR-007）。
 * 只把 pending_approval 申請改為 rejected 並記錄審核者、審核時間與選填駁回原因；原預約不寫入（SC-002）。
 */
export async function rejectRescheduleRequest(params: {
  adminUserId: string;
  rescheduleRequestId: string;
  rejectReason?: string | null;
}): Promise<AdminRescheduleRequestItemDto> {
  const trimmedReason = params.rejectReason?.trim() ?? "";
  if (trimmedReason.length > 200) {
    throw new AppError("VALIDATION_FAILED", 400, "駁回原因為選填，但長度不得超過 200 字。");
  }
  const rejectReason = trimmedReason === "" ? null : trimmedReason;

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    // 先讓到期的改期審核中申請失效（research §3）
    await expireDueRescheduleRequests(tx, now);

    const request = await tx.reschedule_requests.findFirst({
      where: { id: params.rescheduleRequestId, deleted_at: null },
    });
    if (!request) {
      throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的改期申請不存在。");
    }
    if (request.status !== "pending_approval") {
      throw notPendingError("駁回", request.request_no, request.status);
    }

    // 只在申請仍為 pending_approval 時改為 rejected，避免與撤回或核准互相覆蓋
    const reviewed = await tx.reschedule_requests.updateMany({
      where: { id: request.id, status: "pending_approval", deleted_at: null },
      data: {
        status: "rejected",
        reviewed_by: params.adminUserId,
        reviewed_at: now,
        reject_reason: rejectReason,
        updated_at: now,
        updated_by: params.adminUserId,
      },
    });
    if (reviewed.count !== 1) {
      throw rescheduleError(
        "INVALID_RESCHEDULE_STATUS",
        `無法駁回：改期申請 ${request.request_no} 剛被處理，已不是「改期審核中」。`,
      );
    }

    const updated = await tx.reschedule_requests.findUniqueOrThrow({
      where: { id: request.id },
      include: adminRescheduleRequestInclude,
    });
    return toAdminRescheduleRequestDto(updated);
  });
}

const EXPIRE_REASON_LABEL: Record<RescheduleExpireReason, string> = {
  original_slot_started: "原時段開始",
  new_slot_started: "新時段開始",
  reservation_cancelled: "原預約已取消",
  reservation_checked_out: "原預約已登記領取",
};

function formatTaipeiDateTime(at: Date): string {
  const { dateStr, timeStr } = getTaipeiNow(at);
  return `${dateStr} ${timeStr}`;
}

/** 撤回失敗時說明申請目前狀態與發生時間（tasks.md Notes 待確認 4：細節寫進 message）。 */
function describeTerminalStatus(request: {
  status: RescheduleRequestStatus;
  created_at: Date;
  reviewed_at: Date | null;
  withdrawn_at: Date | null;
  expired_at: Date | null;
  expire_reason: RescheduleExpireReason | null;
}): string {
  switch (request.status) {
    case "approved":
      return request.reviewed_at
        ? `已在 ${formatTaipeiDateTime(request.reviewed_at)} 被管理員核准`
        : `已在 ${formatTaipeiDateTime(request.created_at)} 即時改期成功`;
    case "rejected":
      return `已在 ${formatTaipeiDateTime(request.reviewed_at ?? request.created_at)} 被管理員駁回`;
    case "withdrawn":
      return `已在 ${formatTaipeiDateTime(request.withdrawn_at ?? request.created_at)} 撤回`;
    case "expired": {
      const reason = request.expire_reason
        ? `（失效原因：${EXPIRE_REASON_LABEL[request.expire_reason]}）`
        : "";
      return `已在 ${formatTaipeiDateTime(request.expired_at ?? request.created_at)} 失效${reason}`;
    }
    default:
      return "已被處理";
  }
}

/**
 * 成員撤回本人改期審核中的申請（POST /api/reschedule-requests/:rescheduleRequestId/withdraw，FR-010）。
 * 交易開頭先讓到期申請失效；只把 pending_approval 改為 withdrawn 並寫入 withdrawn_at 與 updated_by，原預約不寫入（SC-002）。
 */
export async function withdrawRescheduleRequest(params: {
  userId: string;
  rescheduleRequestId: string;
}): Promise<RescheduleRequestDto> {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    await expireDueRescheduleRequests(tx, now);

    const request = await tx.reschedule_requests.findFirst({
      where: { id: params.rescheduleRequestId, deleted_at: null },
    });
    if (!request) {
      throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的改期申請不存在。");
    }
    if (request.user_id !== params.userId) {
      throw new AppError("FORBIDDEN", 403, "只能撤回本人的改期申請。");
    }

    const notWithdrawable = () =>
      rescheduleError(
        "INVALID_RESCHEDULE_STATUS",
        `無法撤回：改期申請 ${request.request_no} ${describeTerminalStatus(request)}，目前為「${RESCHEDULE_STATUS_LABEL[request.status]}」。只有「改期審核中」的申請可以撤回。`,
      );
    if (request.status !== "pending_approval") {
      throw notWithdrawable();
    }

    // 只在申請仍為 pending_approval 時改為 withdrawn，避免與管理員核准或駁回互相覆蓋
    const withdrawn = await tx.reschedule_requests.updateMany({
      where: { id: request.id, status: "pending_approval", deleted_at: null },
      data: {
        status: "withdrawn",
        withdrawn_at: now,
        updated_at: now,
        updated_by: params.userId,
      },
    });
    if (withdrawn.count !== 1) {
      throw rescheduleError(
        "INVALID_RESCHEDULE_STATUS",
        `無法撤回：改期申請 ${request.request_no} 剛被處理，已不是「改期審核中」。請重新整理後查看最新狀態。`,
      );
    }

    const updated = await tx.reschedule_requests.findUniqueOrThrow({
      where: { id: request.id },
      include: { from_slot: true, to_slot: true, reviewer: true },
    });
    return toRescheduleRequestDto(updated);
  });
}
