import { randomBytes } from "node:crypto";
import { prisma } from "../db/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  canPickupInWindow,
  checkPickupWindow,
  formatUtcDateToDateStr,
  getTaipeiNow,
  hasSlotStarted,
  isValidDateString,
  isWithinOpenDateWindow,
  parseDateOnlyToUtc,
} from "../utils/taipeiTime.js";
import {
  toRescheduleRequestDto,
  type RescheduleExpireReason,
  type RescheduleRequestDto,
  type RescheduleRequestStatus,
  type TimeSlotSummaryDto,
} from "./rescheduleService.js";

export type ReservationStatus =
  "pending_approval" | "confirmed" | "checked_out" | "returned" | "rejected" | "cancelled";

export interface ReservationDto {
  id: string;
  reservationNumber: string;
  userId: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentRequiresApproval: boolean;
  reservationDate: string;
  slotId: string;
  slotName: string;
  slotStartTime: string;
  slotEndTime: string;
  slotSortOrder: number;
  status: ReservationStatus;
  reviewedBy: string | null;
  reviewedByDisplayName: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  checkedOutAt: string | null;
  checkedOutByUserId: string | null;
  checkedOutByName: string | null;
  returnedAt: string | null;
  returnedByUserId: string | null;
  returnedByName: string | null;
  canCancel: boolean;
  createdAt: string;
  cancelledAt: string | null;
}

export interface PendingRescheduleSummaryDto {
  id: string;
  requestNumber: string;
  toReservationDate: string;
  toSlot: TimeSlotSummaryDto;
  createdAt: string;
}

/** 成員檢視的預約（B3）：在 005 的欄位上加上可改期判斷、改期審核中摘要與改期紀錄（FR-001、FR-004、FR-009）。 */
export interface MemberReservationDto extends ReservationDto {
  canReschedule: boolean;
  pendingRescheduleRequest: PendingRescheduleSummaryDto | null;
  rescheduleRequests: RescheduleRequestDto[];
}

export interface MemberReservationPageDto {
  items: MemberReservationDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ReservationPageDto {
  items: ReservationDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function generateReservationNo(): string {
  const { dateStr } = getTaipeiNow();
  const compactDate = dateStr.replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `RV-${compactDate}-${suffix}`;
}

export function toReservationDto(
  row: {
    id: string;
    reservation_no: string;
    user_id: string;
    equipment_id: string;
    reservation_date: Date;
    slot_id: string;
    status: ReservationStatus;
    reviewed_by: string | null;
    reviewed_at: Date | null;
    reject_reason: string | null;
    checked_out_by?: string | null;
    checked_out_at?: Date | null;
    returned_by?: string | null;
    returned_at?: Date | null;
    created_at: Date;
    cancelled_at: Date | null;
    equipment: {
      equipment_code: string;
      name: string;
      category: string;
      requires_approval: boolean;
    };
    slot: {
      name: string;
      start_time: string;
      end_time: string;
      sort_order: number;
    };
    reviewer?: {
      username: string;
      display_name: string;
    } | null;
    checkout_admin?: {
      username: string;
      display_name: string;
    } | null;
    return_admin?: {
      username: string;
      display_name: string;
    } | null;
  },
  now: Date = new Date(),
): ReservationDto {
  const reservationDateStr = formatUtcDateToDateStr(row.reservation_date);
  const canCancel =
    (row.status === "pending_approval" || row.status === "confirmed") &&
    !hasSlotStarted(reservationDateStr, row.slot.start_time, now);

  return {
    id: row.id,
    reservationNumber: row.reservation_no,
    userId: row.user_id,
    equipmentId: row.equipment_id,
    equipmentCode: row.equipment.equipment_code,
    equipmentName: row.equipment.name,
    equipmentCategory: row.equipment.category,
    equipmentRequiresApproval: row.equipment.requires_approval,
    reservationDate: reservationDateStr,
    slotId: row.slot_id,
    slotName: row.slot.name,
    slotStartTime: row.slot.start_time,
    slotEndTime: row.slot.end_time,
    slotSortOrder: row.slot.sort_order,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedByDisplayName: row.reviewer ? row.reviewer.display_name : null,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    rejectReason: row.reject_reason,
    checkedOutAt: row.checked_out_at ? row.checked_out_at.toISOString() : null,
    checkedOutByUserId: row.checked_out_by ?? null,
    checkedOutByName: row.checkout_admin ? row.checkout_admin.display_name : null,
    returnedAt: row.returned_at ? row.returned_at.toISOString() : null,
    returnedByUserId: row.returned_by ?? null,
    returnedByName: row.return_admin ? row.return_admin.display_name : null,
    canCancel,
    createdAt: row.created_at.toISOString(),
    cancelledAt: row.cancelled_at ? row.cancelled_at.toISOString() : null,
  };
}

interface RescheduleSlotRow {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

/** 讀取成員預約時一併載入的改期紀錄：依 created_at 由新到舊、相同時依 id 由小到大（idx_reschedule_requests_reservation_created）。 */
export const memberReservationInclude = {
  equipment: true,
  slot: true,
  reviewer: true,
  checkout_admin: true,
  return_admin: true,
  reschedule_requests: {
    where: { deleted_at: null },
    include: { from_slot: true, to_slot: true, reviewer: true },
    orderBy: [{ created_at: "desc" as const }, { id: "asc" as const }],
  },
};

export function toMemberReservationDto(
  row: Parameters<typeof toReservationDto>[0] & {
    reschedule_requests: Array<{
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
      from_slot: RescheduleSlotRow;
      to_slot: RescheduleSlotRow;
      reviewer?: { display_name: string } | null;
    }>;
  },
  now: Date = new Date(),
): MemberReservationDto {
  const baseDto = toReservationDto(row, now);
  const rescheduleRequests = row.reschedule_requests.map((rr) => toRescheduleRequestDto(rr));
  const pending = rescheduleRequests.find((rr) => rr.status === "pending_approval");
  const canReschedule =
    row.status === "confirmed" &&
    !hasSlotStarted(baseDto.reservationDate, row.slot.start_time, now) &&
    !pending;

  return {
    ...baseDto,
    canReschedule,
    pendingRescheduleRequest: pending
      ? {
          id: pending.id,
          requestNumber: pending.requestNumber,
          toReservationDate: pending.toReservationDate,
          toSlot: pending.toSlot,
          createdAt: pending.createdAt,
        }
      : null,
    rescheduleRequests,
  };
}

export async function createReservation(params: {
  userId: string;
  equipmentId: string;
  reservationDate: string;
  slotId: string;
}): Promise<MemberReservationDto> {
  if (!isValidDateString(params.reservationDate)) {
    throw new AppError(
      "VALIDATION_FAILED",
      400,
      "預約日期 reservationDate 必須為有效的 YYYY-MM-DD 格式。",
    );
  }

  if (!isWithinOpenDateWindow(params.reservationDate)) {
    throw new AppError(
      "DATE_OUT_OF_RANGE",
      400,
      "僅開放申請當日起算 7 天內尚未開始的固定時段，所選日期不在開放範圍內。",
    );
  }

  const [equipment, slot] = await Promise.all([
    prisma.equipments.findFirst({
      where: { id: params.equipmentId, deleted_at: null },
    }),
    prisma.time_slots.findFirst({
      where: { id: params.slotId, deleted_at: null },
    }),
  ]);

  if (!equipment || !slot) {
    throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的設備或固定時段不存在。");
  }

  if (equipment.status !== "available") {
    throw new AppError(
      "EQUIPMENT_UNAVAILABLE",
      409,
      "該單件設備目前不可預約，請選擇其他可用設備。",
    );
  }

  if (hasSlotStarted(params.reservationDate, slot.start_time)) {
    throw new AppError(
      "SLOT_ALREADY_STARTED",
      400,
      `無法申請：${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 時段已開始或已結束，請選擇尚未開始的固定時段。`,
    );
  }

  const targetDateUtc = parseDateOnlyToUtc(params.reservationDate);

  const [existingOccupied, existingMyOpen] = await Promise.all([
    prisma.reservations.findFirst({
      where: {
        equipment_id: params.equipmentId,
        reservation_date: targetDateUtc,
        slot_id: params.slotId,
        status: { in: ["confirmed", "checked_out", "returned"] },
        deleted_at: null,
      },
    }),
    prisma.reservations.findFirst({
      where: {
        user_id: params.userId,
        equipment_id: params.equipmentId,
        reservation_date: targetDateUtc,
        slot_id: params.slotId,
        status: { in: ["pending_approval", "confirmed", "checked_out"] },
        deleted_at: null,
      },
    }),
  ]);

  if (existingMyOpen) {
    const statusLabel = getStatusZhLabel(existingMyOpen.status);
    throw new AppError(
      "DUPLICATE_PENDING_OR_ACTIVE_RESERVATION",
      409,
      `重複申請遭拒：您已對 ${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 持有一筆未結束的「${statusLabel}」紀錄（${existingMyOpen.reservation_no}），同一成員不得對同一設備時段重複申請。`,
    );
  }

  if (existingOccupied) {
    throw new AppError(
      "RESERVATION_CONFLICT",
      409,
      `申請失敗：${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 已完成當日借用並歸還結案（或已被其他有效／借用中紀錄占用），同一固定時段不重新開放重複預約。`,
    );
  }

  const targetStatus: ReservationStatus = equipment.requires_approval
    ? "pending_approval"
    : "confirmed";

  try {
    const created = await prisma.reservations.create({
      data: {
        reservation_no: generateReservationNo(),
        user_id: params.userId,
        equipment_id: params.equipmentId,
        reservation_date: targetDateUtc,
        slot_id: params.slotId,
        status: targetStatus,
        updated_by: params.userId,
      },
      include: memberReservationInclude,
    });

    return toMemberReservationDto(created);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      if (targetStatus === "pending_approval") {
        throw new AppError(
          "DUPLICATE_PENDING_OR_ACTIVE_RESERVATION",
          409,
          `重複申請遭拒：您已對 ${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 持有一筆未結束的「待審核」或「已核准／有效」申請，同一成員不得對同一設備時段重複申請。`,
        );
      }
      throw new AppError(
        "RESERVATION_CONFLICT",
        409,
        `預約失敗：${equipment.equipment_code} ${equipment.name} ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 剛被其他預約占用，請改選其他時段。`,
      );
    }
    throw err;
  }
}

export async function listMyReservations(params: {
  userId: string;
  status?: ReservationStatus;
  page: number;
  pageSize: number;
}): Promise<MemberReservationPageDto> {
  const whereClause = {
    user_id: params.userId,
    deleted_at: null as Date | null,
    ...(params.status ? { status: params.status } : {}),
  };

  const totalItems = await prisma.reservations.count({
    where: whereClause,
  });

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

  const skip = (params.page - 1) * params.pageSize;

  const rows = await prisma.reservations.findMany({
    where: whereClause,
    include: memberReservationInclude,
    orderBy: [
      { reservation_date: "desc" },
      { slot: { sort_order: "asc" } },
      { created_at: "desc" },
      { id: "asc" },
    ],
    skip,
    take: params.pageSize,
  });

  return {
    items: rows.map((row) => toMemberReservationDto(row)),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}

export const listMyLoanReservations = listMyReservations;

function getStatusZhLabel(status: ReservationStatus): string {
  switch (status) {
    case "pending_approval":
      return "待審核";
    case "confirmed":
      return "已核准／有效";
    case "checked_out":
      return "借用中";
    case "returned":
      return "已歸還";
    case "rejected":
      return "已駁回";
    case "cancelled":
      return "已取消";
  }
}

export async function approveReservation(params: {
  adminUserId: string;
  reservationId: string;
}): Promise<AdminReservationItemDto> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.reservations.findFirst({
        where: {
          id: params.reservationId,
          deleted_at: null,
        },
        include: {
          user: true,
          equipment: true,
          slot: true,
          reviewer: true,
        },
      });

      if (!existing) {
        throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的待審核預約申請紀錄不存在。");
      }

      if (existing.status !== "pending_approval") {
        throw new AppError(
          "INVALID_RESERVATION_STATUS",
          409,
          `無法執行審核：預約編號 ${existing.reservation_no} 目前狀態為「${getStatusZhLabel(existing.status)}」，僅處於「待審核」狀態的申請可執行核准或駁回。`,
        );
      }

      const reservationDateStr = formatUtcDateToDateStr(existing.reservation_date);
      if (hasSlotStarted(reservationDateStr, existing.slot.start_time)) {
        throw new AppError(
          "RESERVATION_ALREADY_STARTED",
          400,
          `無法執行審核：該筆申請的預約時段（${reservationDateStr} ${existing.slot.name} ${existing.slot.start_time}–${existing.slot.end_time}）已到達或超過開始時間，管理員僅能審核尚未開始的待審核申請。`,
        );
      }

      const conflict = await tx.reservations.findFirst({
        where: {
          equipment_id: existing.equipment_id,
          reservation_date: existing.reservation_date,
          slot_id: existing.slot_id,
          status: { in: ["confirmed", "checked_out", "returned"] },
          deleted_at: null,
        },
      });

      if (conflict) {
        throw new AppError(
          "RESERVATION_CONFLICT",
          409,
          `無法核准申請：預約編號 ${existing.reservation_no} 所申請的 ${existing.equipment.equipment_code} ${existing.equipment.name}（${reservationDateStr} ${existing.slot.name} ${existing.slot.start_time}–${existing.slot.end_time}）已被另一筆占用狀態紀錄（${conflict.reservation_no}）鎖定；${existing.reservation_no} 仍維持「待審核」狀態，請改為執行駁回。`,
        );
      }

      const now = new Date();
      const updated = await tx.reservations.update({
        where: { id: existing.id },
        data: {
          status: "confirmed",
          reviewed_by: params.adminUserId,
          reviewed_at: now,
          updated_at: now,
          updated_by: params.adminUserId,
        },
        include: {
          user: true,
          equipment: true,
          slot: true,
          reviewer: true,
          checkout_admin: true,
          return_admin: true,
        },
      });

      return toAdminReservationDto(updated, now);
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      throw new AppError(
        "RESERVATION_CONFLICT",
        409,
        "無法核准申請：該設備於同一日期與同一固定時段剛剛已被另一筆「已核准／有效」預約占用；本筆申請仍維持「待審核」狀態，請改為執行駁回。",
      );
    }
    throw err;
  }
}

export async function rejectReservation(params: {
  adminUserId: string;
  reservationId: string;
  rejectReason?: string | null;
}): Promise<AdminReservationItemDto> {
  const normalizedReason =
    params.rejectReason !== undefined && params.rejectReason !== null
      ? params.rejectReason.trim()
      : null;

  if (normalizedReason !== null && normalizedReason.length > 200) {
    throw new AppError(
      "VALIDATION_FAILED",
      400,
      `駁回原因為選填，但長度不得超過 200 字（目前已輸入 ${normalizedReason.length} 字）。`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.reservations.findFirst({
      where: {
        id: params.reservationId,
        deleted_at: null,
      },
      include: {
        user: true,
        equipment: true,
        slot: true,
        reviewer: true,
      },
    });

    if (!existing) {
      throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的待審核預約申請紀錄不存在。");
    }

    if (existing.status !== "pending_approval") {
      throw new AppError(
        "INVALID_RESERVATION_STATUS",
        409,
        `無法執行審核：預約編號 ${existing.reservation_no} 目前狀態為「${getStatusZhLabel(existing.status)}」，僅處於「待審核」狀態的申請可執行核准或駁回。`,
      );
    }

    const reservationDateStr = formatUtcDateToDateStr(existing.reservation_date);
    if (hasSlotStarted(reservationDateStr, existing.slot.start_time)) {
      throw new AppError(
        "RESERVATION_ALREADY_STARTED",
        400,
        `無法執行審核：該筆申請的預約時段（${reservationDateStr} ${existing.slot.name} ${existing.slot.start_time}–${existing.slot.end_time}）已到達或超過開始時間，管理員僅能審核尚未開始的待審核申請。`,
      );
    }

    const now = new Date();
    const updated = await tx.reservations.update({
      where: { id: existing.id },
      data: {
        status: "rejected",
        reviewed_by: params.adminUserId,
        reviewed_at: now,
        reject_reason: normalizedReason && normalizedReason.length > 0 ? normalizedReason : null,
        updated_at: now,
        updated_by: params.adminUserId,
      },
      include: {
        user: true,
        equipment: true,
        slot: true,
        reviewer: true,
        checkout_admin: true,
        return_admin: true,
      },
    });

    return toAdminReservationDto(updated, now);
  });
}

export async function cancelReservation(params: {
  userId: string;
  reservationId: string;
}): Promise<MemberReservationDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.reservations.findFirst({
      where: {
        id: params.reservationId,
        deleted_at: null,
      },
      include: {
        equipment: true,
        slot: true,
        reviewer: true,
        checkout_admin: true,
        return_admin: true,
      },
    });

    if (!existing) {
      throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的預約紀錄不存在。");
    }

    if (existing.user_id !== params.userId) {
      throw new AppError(
        "FORBIDDEN",
        403,
        `權限不足：預約編號 ${existing.reservation_no} 不屬於您本人名下，系統拒絕取消他人預約申請。`,
      );
    }

    if (existing.status === "checked_out" || existing.status === "returned") {
      throw new AppError(
        "RESERVATION_ALREADY_CHECKED_OUT",
        409,
        `無法取消預約：預約編號 ${existing.reservation_no} 已完成現場登記領取（目前狀態為「借用中」或「已歸還」），一旦領取設備後即禁止取消預約，請於使用完畢後將設備帶回現場由管理員執行「登記歸還」。`,
      );
    }

    if (existing.status === "cancelled") {
      throw new AppError(
        "RESERVATION_ALREADY_CANCELLED",
        409,
        `無法取消：預約編號 ${existing.reservation_no} 已經處於「已取消」狀態，無須重複取消。`,
      );
    }

    if (existing.status === "rejected") {
      throw new AppError(
        "INVALID_RESERVATION_STATUS",
        409,
        `無法取消：預約編號 ${existing.reservation_no} 目前狀態為「已駁回」，僅處於「待審核」或尚未領取之「已核准／有效」狀態的申請可執行取消。`,
      );
    }

    const reservationDateStr = formatUtcDateToDateStr(existing.reservation_date);
    if (hasSlotStarted(reservationDateStr, existing.slot.start_time)) {
      throw new AppError(
        "RESERVATION_ALREADY_STARTED",
        409,
        `無法取消：預約編號 ${existing.reservation_no}（${reservationDateStr} ${existing.slot.name} ${existing.slot.start_time}–${existing.slot.end_time}）已到達或超過時段開始時間，僅能在預約時段開始前取消待審核或尚未領取的已核准／有效申請。`,
      );
    }

    const now = new Date();
    const updated = await tx.reservations.update({
      where: { id: existing.id },
      data: {
        status: "cancelled",
        cancelled_at: now,
        updated_at: now,
        updated_by: params.userId,
      },
      include: memberReservationInclude,
    });

    return toMemberReservationDto(updated, now);
  });
}

export interface AdminReservationItemDto extends ReservationDto {
  username: string;
  userDisplayName: string;
  reviewedByUsername: string | null;
  checkedOutByUsername: string | null;
  returnedByUsername: string | null;
  canPickup: boolean;
  canReturn: boolean;
}

export interface AdminReservationPageDto {
  items: AdminReservationItemDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function toAdminReservationDto(
  row: {
    id: string;
    reservation_no: string;
    user_id: string;
    equipment_id: string;
    reservation_date: Date;
    slot_id: string;
    status: ReservationStatus;
    reviewed_by: string | null;
    reviewed_at: Date | null;
    reject_reason: string | null;
    checked_out_by?: string | null;
    checked_out_at?: Date | null;
    returned_by?: string | null;
    returned_at?: Date | null;
    created_at: Date;
    cancelled_at: Date | null;
    user: {
      username: string;
      display_name: string;
    };
    equipment: {
      equipment_code: string;
      name: string;
      category: string;
      requires_approval: boolean;
    };
    slot: {
      name: string;
      start_time: string;
      end_time: string;
      sort_order: number;
    };
    reviewer?: {
      username: string;
      display_name: string;
    } | null;
    checkout_admin?: {
      username: string;
      display_name: string;
    } | null;
    return_admin?: {
      username: string;
      display_name: string;
    } | null;
  },
  now: Date = new Date(),
): AdminReservationItemDto {
  const baseDto = toReservationDto(row, now);
  return {
    ...baseDto,
    username: row.user.username,
    userDisplayName: row.user.display_name,
    reviewedByUsername: row.reviewer ? row.reviewer.username : null,
    checkedOutByUsername: row.checkout_admin ? row.checkout_admin.username : null,
    returnedByUsername: row.return_admin ? row.return_admin.username : null,
    canPickup:
      row.status === "confirmed" &&
      canPickupInWindow(baseDto.reservationDate, row.slot.end_time, now),
    canReturn: row.status === "checked_out",
  };
}

export async function pickupReservationByAdmin(params: {
  adminUserId: string;
  reservationId: string;
  now?: Date;
}): Promise<AdminReservationItemDto> {
  const now = params.now ?? new Date();
  return prisma.$transaction(async (tx) => {
    const existing = await tx.reservations.findFirst({
      where: {
        id: params.reservationId,
        deleted_at: null,
      },
      include: {
        user: true,
        equipment: true,
        slot: true,
        reviewer: true,
        checkout_admin: true,
        return_admin: true,
      },
    });

    if (!existing) {
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "操作失敗：找不到指定的預約借用紀錄，請重新整理清單後再試。",
      );
    }

    if (existing.status !== "confirmed") {
      throw new AppError(
        "INVALID_RESERVATION_STATUS",
        409,
        `無法登記領取：預約編號 ${existing.reservation_no} 目前狀態為「${getStatusZhLabel(existing.status)}」（非「已核准／有效」狀態），系統僅允許對「已核准／有效」預約執行單次登記領取，禁止對待審核、借用中、已歸還、已駁回或已取消紀錄重複領取。`,
      );
    }

    const reservationDateStr = formatUtcDateToDateStr(existing.reservation_date);
    const { dateStr: todayStr, timeStr } = getTaipeiNow(now);
    const windowResult = checkPickupWindow(reservationDateStr, existing.slot.end_time, now);

    if (windowResult === "PICKUP_DATE_NOT_TODAY") {
      throw new AppError(
        "PICKUP_DATE_NOT_TODAY",
        400,
        `無法登記領取：預約編號 ${existing.reservation_no} 的預約日期為 ${reservationDateStr}（非今日 ${todayStr}），系統僅開放預約當日且尚未超過該固定時段結束時間的已核准預約辦理現場領取，拒絕未來日期提前領取。`,
      );
    }

    if (windowResult === "PICKUP_WINDOW_EXPIRED") {
      throw new AppError(
        "PICKUP_WINDOW_EXPIRED",
        400,
        `無法登記領取：預約編號 ${existing.reservation_no}（${reservationDateStr} ${existing.slot.name} ${existing.slot.start_time}–${existing.slot.end_time}）的固定時段已經結束（目前台灣時間 ${timeStr} 已超過 ${existing.slot.end_time}），已逾期未領取的預約無法補登領取。`,
      );
    }

    const updated = await tx.reservations.update({
      where: { id: existing.id },
      data: {
        status: "checked_out",
        checked_out_at: now,
        checked_out_by: params.adminUserId,
        updated_at: now,
        updated_by: params.adminUserId,
      },
      include: {
        user: true,
        equipment: true,
        slot: true,
        reviewer: true,
        checkout_admin: true,
        return_admin: true,
      },
    });

    return toAdminReservationDto(updated, now);
  });
}

export async function returnReservationByAdmin(params: {
  adminUserId: string;
  reservationId: string;
  now?: Date;
}): Promise<AdminReservationItemDto> {
  const now = params.now ?? new Date();
  return prisma.$transaction(async (tx) => {
    const existing = await tx.reservations.findFirst({
      where: {
        id: params.reservationId,
        deleted_at: null,
      },
      include: {
        user: true,
        equipment: true,
        slot: true,
        reviewer: true,
        checkout_admin: true,
        return_admin: true,
      },
    });

    if (!existing) {
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "操作失敗：找不到指定的預約借用紀錄，請重新整理清單後再試。",
      );
    }

    if (existing.status !== "checked_out") {
      throw new AppError(
        "INVALID_RESERVATION_STATUS",
        409,
        `無法登記歸還：預約編號 ${existing.reservation_no} 目前狀態為「${getStatusZhLabel(existing.status)}」，系統僅允許對處於「借用中」狀態的紀錄執行登記歸還，禁止未領先還或重複歸還。`,
      );
    }

    const updated = await tx.reservations.update({
      where: { id: existing.id },
      data: {
        status: "returned",
        returned_at: now,
        returned_by: params.adminUserId,
        updated_at: now,
        updated_by: params.adminUserId,
      },
      include: {
        user: true,
        equipment: true,
        slot: true,
        reviewer: true,
        checkout_admin: true,
        return_admin: true,
      },
    });

    return toAdminReservationDto(updated, now);
  });
}

export async function listPendingReservations(params: {
  equipmentId?: string;
  page: number;
  pageSize: number;
}): Promise<AdminReservationPageDto> {
  const whereClause = {
    deleted_at: null as Date | null,
    status: "pending_approval" as const,
    ...(params.equipmentId ? { equipment_id: params.equipmentId } : {}),
  };

  const totalItems = await prisma.reservations.count({
    where: whereClause,
  });

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

  const skip = (params.page - 1) * params.pageSize;

  const rows = await prisma.reservations.findMany({
    where: whereClause,
    include: {
      user: true,
      equipment: true,
      slot: true,
      reviewer: true,
      checkout_admin: true,
      return_admin: true,
    },
    orderBy: [
      { reservation_date: "asc" },
      { slot: { sort_order: "asc" } },
      { created_at: "asc" },
      { id: "asc" },
    ],
    skip,
    take: params.pageSize,
  });

  return {
    items: rows.map((row) => toAdminReservationDto(row)),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}

export async function listAllReservations(params: {
  status?: ReservationStatus;
  equipmentId?: string;
  page: number;
  pageSize: number;
}): Promise<AdminReservationPageDto> {
  const whereClause = {
    deleted_at: null as Date | null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.equipmentId ? { equipment_id: params.equipmentId } : {}),
  };

  const totalItems = await prisma.reservations.count({
    where: whereClause,
  });

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

  const skip = (params.page - 1) * params.pageSize;

  const rows = await prisma.reservations.findMany({
    where: whereClause,
    include: {
      user: true,
      equipment: true,
      slot: true,
      reviewer: true,
      checkout_admin: true,
      return_admin: true,
    },
    orderBy: [
      { reservation_date: "desc" },
      { slot: { sort_order: "asc" } },
      { created_at: "desc" },
      { id: "asc" },
    ],
    skip,
    take: params.pageSize,
  });

  return {
    items: rows.map((row) => toAdminReservationDto(row)),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}
