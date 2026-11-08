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

export interface ReservationDto {
  id: string;
  reservationNumber: string;
  userId: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentCategory: string;
  reservationDate: string;
  slotId: string;
  slotName: string;
  slotStartTime: string;
  slotEndTime: string;
  slotSortOrder: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
  cancelledAt: string | null;
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
  status: "confirmed" | "cancelled";
  created_at: Date;
  cancelled_at: Date | null;
  equipment: {
    equipment_code: string;
    name: string;
    category: string;
  };
  slot: {
    name: string;
    start_time: string;
    end_time: string;
    sort_order: number;
  };
}): ReservationDto {
  return {
    id: row.id,
    reservationNumber: row.reservation_no,
    userId: row.user_id,
    equipmentId: row.equipment_id,
    equipmentCode: row.equipment.equipment_code,
    equipmentName: row.equipment.name,
    equipmentCategory: row.equipment.category,
    reservationDate: formatUtcDateToDateStr(row.reservation_date),
    slotId: row.slot_id,
    slotName: row.slot.name,
    slotStartTime: row.slot.start_time,
    slotEndTime: row.slot.end_time,
    slotSortOrder: row.slot.sort_order,
    status: row.status,
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
      "僅開放預約當日起算 7 天內尚未開始的固定時段，所選日期不在開放範圍內。",
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
      `無法預約：${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 時段已開始或已結束，請選擇尚未開始的固定時段。`,
    );
  }

  try {
    const created = await prisma.reservations.create({
      data: {
        reservation_no: generateReservationNo(),
        user_id: params.userId,
        equipment_id: params.equipmentId,
        reservation_date: parseDateOnlyToUtc(params.reservationDate),
        slot_id: params.slotId,
        status: "confirmed",
        updated_by: params.userId,
      },
      include: {
        equipment: true,
        slot: true,
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
      throw new AppError(
        "RESERVATION_CONFLICT",
        409,
        `預約失敗：${equipment.equipment_code} ${equipment.name} 於 ${params.reservationDate} ${slot.name} ${slot.start_time}–${slot.end_time} 剛剛已被其他成員預約，請改選其他可預約時段。`,
      );
    }
    throw err;
  }
}
