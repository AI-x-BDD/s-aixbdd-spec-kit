import { randomBytes } from "node:crypto";
import { prisma } from "../db/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  formatUtcDateToDateStr,
  getTaipeiNow,
  hasSlotStarted,
  isValidDateString,
  isWithinOpenDateWindow,
  parseDateOnlyToUtc,
} from "../utils/taipeiTime.js";

export type ReservationStatus = "pending_approval" | "confirmed" | "rejected" | "cancelled";

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
  createdAt: string;
  cancelledAt: string | null;
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

export function toReservationDto(row: {
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
}): ReservationDto {
  return {
    id: row.id,
    reservationNumber: row.reservation_no,
    userId: row.user_id,
    equipmentId: row.equipment_id,
    equipmentCode: row.equipment.equipment_code,
    equipmentName: row.equipment.name,
    equipmentCategory: row.equipment.category,
    equipmentRequiresApproval: row.equipment.requires_approval,
    reservationDate: formatUtcDateToDateStr(row.reservation_date),
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
    createdAt: row.created_at.toISOString(),
    cancelledAt: row.cancelled_at ? row.cancelled_at.toISOString() : null,
  };
}

export async function createReservation(params: {
  userId: string;
  equipmentId: string;
  reservationDate: string;
  slotId: string;
}): Promise<ReservationDto> {
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

  const [existingConfirmed, existingMyOpen] = await Promise.all([
    prisma.reservations.findFirst({
      where: {
        equipment_id: params.equipmentId,
        reservation_date: targetDateUtc,
        slot_id: params.slotId,
        status: "confirmed",
        deleted_at: null,
      },
    }),
    prisma.reservations.findFirst({
      where: {
        user_id: params.userId,
        equipment_id: params.equipmentId,
        reservation_date: targetDateUtc,
        slot_id: params.slotId,
        status: { in: ["pending_approval", "confirmed"] },
        deleted_at: null,
      },
    }),
  ]);

  if (existingConfirmed && existingConfirmed.user_id !== params.userId) {
    throw new AppError(
      "RESERVATION_CONFLICT",
      409,
      `申請失敗：${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 已被其他「已核准／有效」預約占用，請改選其他可預約時段。`,
    );
  }

  if (existingMyOpen) {
    const statusLabel = existingMyOpen.status === "pending_approval" ? "待審核" : "已核准／有效";
    throw new AppError(
      "DUPLICATE_PENDING_OR_ACTIVE_RESERVATION",
      409,
      `重複申請遭拒：您已對 ${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 持有一筆未結束的「${statusLabel}」申請（${existingMyOpen.reservation_no}），同一成員不得對同一設備時段重複申請。`,
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
      include: {
        equipment: true,
        slot: true,
        reviewer: true,
      },
    });

    return toReservationDto(created);
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
        `申請失敗：${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 剛剛已被其他成員預約，請改選其他可預約時段。`,
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
}): Promise<ReservationPageDto> {
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
    include: {
      equipment: true,
      slot: true,
      reviewer: true,
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
    items: rows.map(toReservationDto),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}

export async function cancelReservation(params: {
  userId: string;
  reservationId: string;
}): Promise<ReservationDto> {
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
        `無法取消：預約編號 ${existing.reservation_no} 目前狀態為「已駁回」，僅處於「待審核」或「已核准／有效」狀態的申請可執行取消。`,
      );
    }

    const reservationDateStr = formatUtcDateToDateStr(existing.reservation_date);
    if (hasSlotStarted(reservationDateStr, existing.slot.start_time)) {
      throw new AppError(
        "RESERVATION_ALREADY_STARTED",
        409,
        `無法取消：預約編號 ${existing.reservation_no}（${reservationDateStr} ${existing.slot.name} ${existing.slot.start_time}–${existing.slot.end_time}）已到達或超過時段開始時間，僅能在預約時段開始前取消待審核或已核准／有效申請。`,
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
      include: {
        equipment: true,
        slot: true,
        reviewer: true,
      },
    });

    return toReservationDto(updated);
  });
}

export interface AdminReservationItemDto extends ReservationDto {
  username: string;
  userDisplayName: string;
  reviewedByUsername: string | null;
}

export interface AdminReservationPageDto {
  items: AdminReservationItemDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
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
    items: rows.map((row) => ({
      ...toReservationDto(row),
      username: row.user.username,
      userDisplayName: row.user.display_name,
      reviewedByUsername: row.reviewer ? row.reviewer.username : null,
    })),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}
