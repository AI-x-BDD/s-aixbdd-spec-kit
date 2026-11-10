import { prisma } from "../db/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  formatUtcDateToDateStr,
  hasSlotStarted,
  isValidDateString,
  isWithinOpenDateWindow,
  parseDateOnlyToUtc,
} from "../utils/taipeiTime.js";
import { expireDueRescheduleRequests, type TimeSlotSummaryDto } from "./rescheduleService.js";

/** 設備 3 種狀態（contracts/openapi.yaml EquipmentStatus）；只有 available 可以被預約（FR-006）。 */
export type EquipmentStatus = "available" | "maintenance" | "retired";

/** 成員設備清單可見的設備狀態（contracts/openapi.yaml MemberVisibleEquipmentStatus）；retired 不出現在成員清單（FR-014）。 */
export type MemberVisibleEquipmentStatus = "available" | "maintenance";

const MEMBER_VISIBLE_STATUSES: MemberVisibleEquipmentStatus[] = ["available", "maintenance"];

export type SlotStatus =
  | "AVAILABLE"
  | "MY_PENDING"
  | "MY_CONFIRMED"
  | "MY_CHECKED_OUT"
  | "MY_RETURNED"
  | "OCCUPIED"
  | "MY_RESCHEDULE_PENDING";

export type SlotAvailabilityStatus =
  | "available"
  | "pending_by_me"
  | "booked_by_me"
  | "checked_out_by_me"
  | "returned_by_me"
  | "booked_by_others"
  | "reschedule_pending_by_me";

/** 時段為本人改期審核中申請的新時段時回傳的申請摘要（只對申請人本人回傳，FR-017）。 */
export interface MyRescheduleSlotRefDto {
  rescheduleRequestId: string;
  requestNumber: string;
  reservationId: string;
  reservationNumber: string;
  fromReservationDate: string;
  fromSlot: TimeSlotSummaryDto;
}

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
  myRescheduleRequest: MyRescheduleSlotRefDto | null;
}

export interface EquipmentWithSlotAvailabilityDto {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  status: MemberVisibleEquipmentStatus;
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
  equipmentId?: string;
  category?: string;
  requiresApproval?: boolean;
  page: number;
  pageSize: number;
}): Promise<EquipmentAvailabilityPageDto> {
  if (!params.date || !isValidDateString(params.date)) {
    throw new AppError("VALIDATION_FAILED", 400, "查詢日期 date 必須為有效的 YYYY-MM-DD 格式。");
  }

  // FR-014：停用（retired）設備不出現在成員清單，也不計入 totalItems；以 equipmentId 篩選停用設備時 items 為空
  const whereClause = {
    deleted_at: null as Date | null,
    status: { in: MEMBER_VISIBLE_STATUSES },
    ...(params.equipmentId ? { id: params.equipmentId } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.requiresApproval !== undefined
      ? { requires_approval: params.requiresApproval }
      : {}),
  };

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    // 查詢前先讓到期的改期審核中申請失效，已失效申請的新時段不再標示本人改期審核中（research §3）
    await expireDueRescheduleRequests(tx, now);

    const totalItems = await tx.equipments.count({
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
    const reservationDate = parseDateOnlyToUtc(params.date);

    // 互動式交易內依序查詢（同一連線不並行送出查詢）
    const equipments = await tx.equipments.findMany({
      where: whereClause,
      orderBy: [{ equipment_code: "asc" }, { id: "asc" }],
      skip,
      take: params.pageSize,
    });
    const timeSlots = await tx.time_slots.findMany({
      where: { deleted_at: null },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    });
    const dayReservations = await tx.reservations.findMany({
      where: {
        reservation_date: reservationDate,
        deleted_at: null,
        OR: [
          { status: { in: ["confirmed", "checked_out", "returned"] } },
          { status: "pending_approval", user_id: params.userId },
        ],
      },
    });
    // 只查目前登入成員本人的改期審核中申請（idx_reschedule_requests_status_to_slot），不讀取其他成員的申請（FR-017）
    const myPendingReschedules = await tx.reschedule_requests.findMany({
      where: {
        status: "pending_approval",
        to_reservation_date: reservationDate,
        user_id: params.userId,
        deleted_at: null,
      },
      include: { reservation: true, from_slot: true },
      orderBy: [{ created_at: "asc" }, { id: "asc" }],
    });

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

    const myRescheduleByEqAndSlot = new Map<string, MyRescheduleSlotRefDto>();
    for (const rr of myPendingReschedules) {
      const key = `${rr.reservation.equipment_id}|${rr.to_slot_id}`;
      if (!myRescheduleByEqAndSlot.has(key)) {
        myRescheduleByEqAndSlot.set(key, {
          rescheduleRequestId: rr.id,
          requestNumber: rr.request_no,
          reservationId: rr.reservation_id,
          reservationNumber: rr.reservation.reservation_no,
          fromReservationDate: formatUtcDateToDateStr(rr.from_reservation_date),
          fromSlot: {
            slotId: rr.from_slot.id,
            slotName: rr.from_slot.name,
            startTime: rr.from_slot.start_time,
            endTime: rr.from_slot.end_time,
            sortOrder: rr.from_slot.sort_order,
          },
        });
      }
    }

    const inOpenWindow = isWithinOpenDateWindow(params.date, now);

    const items: EquipmentWithSlotAvailabilityDto[] = equipments.map((eq) => {
      const isAvailable = eq.status === "available";
      const slots: EquipmentSlotAvailabilityDto[] = timeSlots.map((slot) => {
        const key = `${eq.id}|${slot.id}`;
        const occupied = occupiedByEqAndSlot.get(key);
        const myPending = myPendingByEqAndSlot.get(key);
        // 本人改期審核中申請的新時段一律回傳摘要，不受 slotStatus 影響
        const myReschedule = myRescheduleByEqAndSlot.get(key) ?? null;
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
        } else if (myReschedule) {
          // FR-017：沒有被任何預約占用時，對本人標示「本人改期審核中」；新時段不保留，其他成員仍為 AVAILABLE
          slotStatus = "MY_RESCHEDULE_PENDING";
          availabilityStatus = "reschedule_pending_by_me";
        } else if (myPending) {
          slotStatus = "MY_PENDING";
          availabilityStatus = "pending_by_me";
          myReservationId = myPending.id;
        }

        const started = hasSlotStarted(params.date, slot.start_time, now);
        const isBookable =
          isAvailable && inOpenWindow && !started && availabilityStatus === "available";

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
          myRescheduleRequest: myReschedule,
        };
      });

      return {
        id: eq.id,
        equipmentCode: eq.equipment_code,
        name: eq.name,
        category: eq.category,
        // 查詢條件已排除 retired
        status: eq.status === "maintenance" ? "maintenance" : "available",
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
  });
}

/** 設備最近一次狀態變更的摘要（contracts/openapi.yaml LastEquipmentStatusChange，FR-008）。 */
export interface LastEquipmentStatusChangeDto {
  changedBy: string;
  changedByDisplayName: string;
  changedAt: string;
  fromStatus: EquipmentStatus;
  toStatus: EquipmentStatus;
}

export interface AdminEquipmentSettingDto {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  requiresApproval: boolean;
  lastStatusChange: LastEquipmentStatusChangeDto | null;
  updatedAt: string;
}

/** 全部設備依狀態的台數，不受查詢篩選條件影響（contracts/openapi.yaml EquipmentStatusCounts）。 */
export interface EquipmentStatusCountsDto {
  available: number;
  maintenance: number;
  retired: number;
}

export interface AdminEquipmentPageDto {
  items: AdminEquipmentSettingDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  statusCounts: EquipmentStatusCountsDto;
}

type AdminEquipmentRow = {
  id: string;
  equipment_code: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  requires_approval: boolean;
  updated_at: Date;
};

type StatusChangeRow = {
  changed_by: string;
  changed_at: Date;
  from_status: EquipmentStatus;
  to_status: EquipmentStatus;
  changer: { display_name: string };
};

/** 取設備最近一次有效狀態變更（changed_at 最大、deleted_at 為 null）的查詢條件，使用 idx_equipment_status_changes_equipment_changed。 */
const lastStatusChangeInclude = {
  status_changes: {
    where: { deleted_at: null },
    orderBy: [{ changed_at: "desc" as const }, { id: "desc" as const }],
    take: 1,
    select: {
      changed_by: true,
      changed_at: true,
      from_status: true,
      to_status: true,
      changer: { select: { display_name: true } },
    },
  },
};

function toAdminEquipmentSettingDto(
  eq: AdminEquipmentRow & { status_changes: StatusChangeRow[] },
): AdminEquipmentSettingDto {
  const last = eq.status_changes[0];
  return {
    id: eq.id,
    equipmentCode: eq.equipment_code,
    name: eq.name,
    category: eq.category,
    status: eq.status,
    requiresApproval: eq.requires_approval,
    lastStatusChange: last
      ? {
          changedBy: last.changed_by,
          changedByDisplayName: last.changer.display_name,
          changedAt: last.changed_at.toISOString(),
          fromStatus: last.from_status,
          toStatus: last.to_status,
        }
      : null,
    updatedAt: eq.updated_at.toISOString(),
  };
}

async function countEquipmentsByStatus(): Promise<EquipmentStatusCountsDto> {
  const groups = await prisma.equipments.groupBy({
    by: ["status"],
    where: { deleted_at: null },
    _count: { _all: true },
  });
  const counts: EquipmentStatusCountsDto = { available: 0, maintenance: 0, retired: 0 };
  for (const g of groups) {
    counts[g.status] = g._count._all;
  }
  return counts;
}

export async function listAdminEquipments(params: {
  status?: EquipmentStatus;
  category?: string;
  requiresApproval?: boolean;
  page: number;
  pageSize: number;
}): Promise<AdminEquipmentPageDto> {
  const whereClause = {
    deleted_at: null as Date | null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.requiresApproval !== undefined
      ? { requires_approval: params.requiresApproval }
      : {}),
  };

  const totalItems = await prisma.equipments.count({
    where: whereClause,
  });
  const statusCounts = await countEquipmentsByStatus();

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / params.pageSize);

  if (totalPages === 0 || params.page > totalPages) {
    return {
      items: [],
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
      statusCounts,
    };
  }

  const skip = (params.page - 1) * params.pageSize;

  const equipments = await prisma.equipments.findMany({
    where: whereClause,
    orderBy: [{ equipment_code: "asc" }, { id: "asc" }],
    skip,
    take: params.pageSize,
    include: lastStatusChangeInclude,
  });

  return {
    items: equipments.map(toAdminEquipmentSettingDto),
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
    statusCounts,
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
    include: lastStatusChangeInclude,
  });

  return toAdminEquipmentSettingDto(updated);
}
