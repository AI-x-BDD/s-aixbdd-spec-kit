import { prisma } from "../db/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  hasSlotStarted,
  isValidDateString,
  isWithinOpenDateWindow,
  parseDateOnlyToUtc,
} from "../utils/taipeiTime.js";

export type SlotStatus =
  "AVAILABLE" | "MY_PENDING" | "MY_CONFIRMED" | "MY_CHECKED_OUT" | "MY_RETURNED" | "OCCUPIED";

export type SlotAvailabilityStatus =
  | "available"
  | "pending_by_me"
  | "booked_by_me"
  | "checked_out_by_me"
  | "returned_by_me"
  | "booked_by_others";

export interface EquipmentSlotAvailabilityDto {
  slotId: string;
  slotCode: "MORNING" | "AFTERNOON" | "EVENING";
  slotName: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
  slotStatus: SlotStatus;
  availabilityStatus: SlotAvailabilityStatus;
  isBookable: boolean;
  myReservationId: string | null;
}

export interface EquipmentWithSlotAvailabilityDto {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  isActive: boolean;
  requiresApproval: boolean;
  reservationDate: string;
  slots: EquipmentSlotAvailabilityDto[];
}

export interface EquipmentAvailabilityPageDto {
  items: EquipmentWithSlotAvailabilityDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export async function listEquipments(params: {
  userId: string;
  date: string;
  category?: string;
  requiresApproval?: boolean;
  page: number;
  pageSize: number;
}): Promise<EquipmentAvailabilityPageDto> {
  if (!params.date || !isValidDateString(params.date)) {
    throw new AppError("VALIDATION_FAILED", 400, "查詢日期 date 必須為有效的 YYYY-MM-DD 格式。");
  }

  const whereClause = {
    deleted_at: null as Date | null,
    ...(params.category ? { category: params.category } : {}),
    ...(params.requiresApproval !== undefined
      ? { requires_approval: params.requiresApproval }
      : {}),
  };

  const totalItems = await prisma.equipments.count({
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

  const [equipments, timeSlots, dayReservations] = await Promise.all([
    prisma.equipments.findMany({
      where: whereClause,
      orderBy: [{ equipment_code: "asc" }, { id: "asc" }],
      skip,
      take: params.pageSize,
    }),
    prisma.time_slots.findMany({
      where: { deleted_at: null },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    }),
    prisma.reservations.findMany({
      where: {
        reservation_date: parseDateOnlyToUtc(params.date),
        deleted_at: null,
        OR: [
          { status: { in: ["confirmed", "checked_out", "returned"] } },
          { status: "pending_approval", user_id: params.userId },
        ],
      },
    }),
  ]);

  const occupiedByEqAndSlot = new Map<
    string,
    { id: string; user_id: string; status: "confirmed" | "checked_out" | "returned" }
  >();
  const myPendingByEqAndSlot = new Map<string, { id: string }>();

  for (const res of dayReservations) {
    const key = `${res.equipment_id}|${res.slot_id}`;
    if (res.status === "confirmed" || res.status === "checked_out" || res.status === "returned") {
      occupiedByEqAndSlot.set(key, {
        id: res.id,
        user_id: res.user_id,
        status: res.status,
      });
    } else if (res.status === "pending_approval" && res.user_id === params.userId) {
      myPendingByEqAndSlot.set(key, { id: res.id });
    }
  }

  const inOpenWindow = isWithinOpenDateWindow(params.date);

  const items: EquipmentWithSlotAvailabilityDto[] = equipments.map((eq) => {
    const isActive = eq.status === "available";
    const slots: EquipmentSlotAvailabilityDto[] = timeSlots.map((slot) => {
      const key = `${eq.id}|${slot.id}`;
      const occupied = occupiedByEqAndSlot.get(key);
      const myPending = myPendingByEqAndSlot.get(key);
      let slotStatus: SlotStatus = "AVAILABLE";
      let availabilityStatus: SlotAvailabilityStatus = "available";
      let myReservationId: string | null = null;

      if (occupied) {
        if (occupied.user_id === params.userId) {
          myReservationId = occupied.id;
          if (occupied.status === "checked_out") {
            slotStatus = "MY_CHECKED_OUT";
            availabilityStatus = "checked_out_by_me";
          } else if (occupied.status === "returned") {
            slotStatus = "MY_RETURNED";
            availabilityStatus = "returned_by_me";
          } else {
            slotStatus = "MY_CONFIRMED";
            availabilityStatus = "booked_by_me";
          }
        } else {
          slotStatus = "OCCUPIED";
          availabilityStatus = "booked_by_others";
        }
      } else if (myPending) {
        slotStatus = "MY_PENDING";
        availabilityStatus = "pending_by_me";
        myReservationId = myPending.id;
      }

      const started = hasSlotStarted(params.date, slot.start_time);
      const isBookable = isActive && inOpenWindow && !started && availabilityStatus === "available";

      return {
        slotId: slot.id,
        slotCode: slot.slot_code.toUpperCase() as "MORNING" | "AFTERNOON" | "EVENING",
        slotName: slot.name,
        startTime: slot.start_time,
        endTime: slot.end_time,
        sortOrder: slot.sort_order,
        slotStatus,
        availabilityStatus,
        isBookable,
        myReservationId,
      };
    });

    return {
      id: eq.id,
      equipmentCode: eq.equipment_code,
      name: eq.name,
      category: eq.category,
      isActive,
      requiresApproval: eq.requires_approval,
      reservationDate: params.date,
      slots,
    };
  });

  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}

export interface AdminEquipmentSettingDto {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  isActive: boolean;
  requiresApproval: boolean;
  updatedAt: string;
}

export interface AdminEquipmentPageDto {
  items: AdminEquipmentSettingDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

function toAdminEquipmentSettingDto(eq: {
  id: string;
  equipment_code: string;
  name: string;
  category: string;
  status: "available" | "unavailable";
  requires_approval: boolean;
  updated_at: Date;
}): AdminEquipmentSettingDto {
  return {
    id: eq.id,
    equipmentCode: eq.equipment_code,
    name: eq.name,
    category: eq.category,
    isActive: eq.status === "available",
    requiresApproval: eq.requires_approval,
    updatedAt: eq.updated_at.toISOString(),
  };
}

export async function listAdminEquipments(params: {
  category?: string;
  requiresApproval?: boolean;
  page: number;
  pageSize: number;
}): Promise<AdminEquipmentPageDto> {
  const whereClause = {
    deleted_at: null as Date | null,
    ...(params.category ? { category: params.category } : {}),
    ...(params.requiresApproval !== undefined
      ? { requires_approval: params.requiresApproval }
      : {}),
  };

  const totalItems = await prisma.equipments.count({
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

  const equipments = await prisma.equipments.findMany({
    where: whereClause,
    orderBy: [{ equipment_code: "asc" }, { id: "asc" }],
    skip,
    take: params.pageSize,
  });

  return {
    items: equipments.map(toAdminEquipmentSettingDto),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}

export async function updateEquipmentApprovalMode(params: {
  adminUserId: string;
  equipmentId: string;
  requiresApproval: boolean;
}): Promise<AdminEquipmentSettingDto> {
  const existing = await prisma.equipments.findFirst({
    where: {
      id: params.equipmentId,
      deleted_at: null,
    },
  });

  if (!existing) {
    throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的單件設備不存在。");
  }

  const now = new Date();
  const updated = await prisma.equipments.update({
    where: { id: existing.id },
    data: {
      requires_approval: params.requiresApproval,
      updated_at: now,
      updated_by: params.adminUserId,
    },
  });

  return toAdminEquipmentSettingDto(updated);
}
