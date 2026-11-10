import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { AppError, equipmentStatusError } from "../middleware/errorHandler.js";
import type { AdminEquipmentSettingDto, EquipmentStatus } from "./equipmentService.js";
import { expireDueRescheduleRequests } from "./rescheduleService.js";
import { formatUtcDateToDateStr } from "../utils/taipeiTime.js";

/** 設為送修或停用的目標狀態（contracts/openapi.yaml EquipmentStatusChangePreview.targetStatus）。 */
export type UnavailableTargetStatus = "maintenance" | "retired";

/** 設備借用中預約的摘要（contracts/openapi.yaml CheckedOutReservationSummary）。 */
export interface CheckedOutReservationSummaryDto {
  reservationId: string;
  reservationNumber: string;
  userDisplayName: string;
  reservationDate: string;
  slotName: string;
  slotStartTime: string;
  slotEndTime: string;
  isOverdue: boolean;
}

/** 設為送修或停用前的預覽結果（contracts/openapi.yaml EquipmentStatusChangePreview）。 */
export interface EquipmentStatusChangePreviewDto {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  currentStatus: EquipmentStatus;
  targetStatus: UnavailableTargetStatus;
  cancelCount: number;
  expireCount: number;
  hasCheckedOutReservation: boolean;
  checkedOutReservations: CheckedOutReservationSummaryDto[];
}

/** 預覽與確認共用的計數結果（research §2：兩者以相同條件計算）。 */
export interface EquipmentStatusImpact {
  cancelCount: number;
  expireCount: number;
  checkedOutReservations: CheckedOutReservationSummaryDto[];
}

/**
 * 計算設定送修或停用時受影響的預約（預覽與確認共用，FR-002～FR-005、FR-007、FR-019）：
 * - cancelCount：這台設備未刪除、狀態為 pending_approval 或 confirmed，且時段結束時間
 *   （reservation_date + time_slots.end_time，依 Asia/Taipei 解讀）晚於目前時間的預約數。
 * - expireCount：上述預約中有 pending_approval 改期申請的筆數。
 * - checkedOutReservations：checked_out 預約（含逾期未還），依 reservationDate、slotStartTime、reservationId 由小到大。
 */
export async function computeEquipmentStatusImpact(
  tx: Prisma.TransactionClient,
  equipmentId: string,
  now: Date,
): Promise<EquipmentStatusImpact> {
  const counts = await tx.$queryRaw<Array<{ cancel_count: bigint; expire_count: bigint }>>`
    SELECT COUNT(*) AS cancel_count,
           COUNT(*) FILTER (
             WHERE EXISTS (
               SELECT 1 FROM reschedule_requests AS rr
               WHERE rr.reservation_id = r.id
                 AND rr.status = 'pending_approval'
                 AND rr.deleted_at IS NULL
             )
           ) AS expire_count
    FROM reservations AS r
    JOIN time_slots AS s ON s.id = r.slot_id
    WHERE r.equipment_id = ${equipmentId}::uuid
      AND r.status IN ('pending_approval', 'confirmed')
      AND r.deleted_at IS NULL
      AND ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') > ${now}
  `;

  const checkedOutRows = await tx.$queryRaw<
    Array<{
      id: string;
      reservation_no: string;
      display_name: string;
      reservation_date: Date;
      slot_name: string;
      start_time: string;
      end_time: string;
      is_overdue: boolean;
    }>
  >`
    SELECT r.id,
           r.reservation_no,
           u.display_name,
           r.reservation_date,
           s.name AS slot_name,
           s.start_time,
           s.end_time,
           ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') <= ${now} AS is_overdue
    FROM reservations AS r
    JOIN time_slots AS s ON s.id = r.slot_id
    JOIN users AS u ON u.id = r.user_id
    WHERE r.equipment_id = ${equipmentId}::uuid
      AND r.status = 'checked_out'
      AND r.deleted_at IS NULL
    ORDER BY r.reservation_date ASC, s.start_time ASC, r.id ASC
  `;

  return {
    cancelCount: Number(counts[0]?.cancel_count ?? 0),
    expireCount: Number(counts[0]?.expire_count ?? 0),
    checkedOutReservations: checkedOutRows.map((row) => ({
      reservationId: row.id,
      reservationNumber: row.reservation_no,
      userDisplayName: row.display_name,
      reservationDate: formatUtcDateToDateStr(row.reservation_date),
      slotName: row.slot_name,
      slotStartTime: row.start_time,
      slotEndTime: row.end_time,
      isOverdue: row.is_overdue,
    })),
  };
}

/**
 * 預覽設為送修或停用時將取消的預約數、將失效的改期申請數與借用中預約（FR-007、US1 情境 3、4）。
 * 只讀取，不改變設備、預約與改期申請；處理前先讓到期的改期申請失效。
 */
export async function getEquipmentStatusChangePreview(
  equipmentId: string,
  targetStatus: UnavailableTargetStatus,
): Promise<EquipmentStatusChangePreviewDto> {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    await expireDueRescheduleRequests(tx, now);

    const equipment = await tx.equipments.findFirst({
      where: { id: equipmentId, deleted_at: null },
    });
    if (!equipment) {
      throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的單件設備不存在。");
    }
    if (equipment.status === targetStatus) {
      throw equipmentStatusError("EQUIPMENT_STATUS_UNCHANGED");
    }

    const impact = await computeEquipmentStatusImpact(tx, equipment.id, now);

    return {
      equipmentId: equipment.id,
      equipmentCode: equipment.equipment_code,
      equipmentName: equipment.name,
      currentStatus: equipment.status,
      targetStatus,
      cancelCount: impact.cancelCount,
      expireCount: impact.expireCount,
      hasCheckedOutReservation: impact.checkedOutReservations.length > 0,
      checkedOutReservations: impact.checkedOutReservations,
    };
  });
}

/** 一筆設備狀態變更紀錄（contracts/openapi.yaml EquipmentStatusChange）。 */
export interface EquipmentStatusChangeDto {
  id: string;
  equipmentId: string;
  fromStatus: EquipmentStatus;
  toStatus: EquipmentStatus;
  changedBy: string;
  changedByDisplayName: string;
  changedAt: string;
  cancelledReservationCount: number;
}

/** 設備狀態變更的結果（contracts/openapi.yaml EquipmentStatusChangeResult）。 */
export interface EquipmentStatusChangeResultDto {
  equipment: AdminEquipmentSettingDto;
  statusChange: EquipmentStatusChangeDto;
  expiredRescheduleRequestCount: number;
}

/** 設為送修或停用的請求（contracts/openapi.yaml SetEquipmentUnavailableRequest）。 */
export interface SetEquipmentUnavailableParams {
  adminUserId: string;
  equipmentId: string;
  targetStatus: UnavailableTargetStatus;
  expectedCurrentStatus: EquipmentStatus;
  expectedCancelCount: number;
  expectedExpireCount: number;
}

/** 把送修中或停用的設備恢復成可用的請求（contracts/openapi.yaml RestoreEquipmentRequest）。 */
export interface RestoreEquipmentParams {
  adminUserId: string;
  equipmentId: string;
  targetStatus: "available";
}

/** 設備狀態變更請求（contracts/openapi.yaml UpdateEquipmentStatusRequest）。 */
export type UpdateEquipmentStatusParams = SetEquipmentUnavailableParams | RestoreEquipmentParams;

const CANCEL_REASON_BY_TARGET = {
  maintenance: "equipment_maintenance",
  retired: "equipment_retired",
} as const;

/**
 * 把設備設為送修中或停用（FR-001～FR-005、FR-008、FR-010、FR-019）。
 * 單一互動式交易：第一個語句以 FOR UPDATE 鎖定設備列（research §3），再讓到期的改期申請失效，
 * 依序檢查借用中 → 目前狀態與 expectedCurrentStatus → 目標等於目前狀態（Notes 待確認 3）→ 重算數量，
 * 通過後批次取消預約、批次讓改期申請失效、更新設備狀態並新增一筆狀態變更紀錄。
 */
export async function updateEquipmentStatus(
  params: UpdateEquipmentStatusParams,
): Promise<EquipmentStatusChangeResultDto> {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: EquipmentStatus }>>`
      SELECT status FROM equipments
      WHERE id = ${params.equipmentId}::uuid AND deleted_at IS NULL
      FOR UPDATE
    `;
    if (locked.length === 0) {
      throw new AppError("RESOURCE_NOT_FOUND", 404, "指定的單件設備不存在。");
    }
    const currentStatus = locked[0]!.status;

    if (params.targetStatus === "available") {
      return restoreEquipmentInTx(tx, params, currentStatus);
    }

    const now = new Date();
    await expireDueRescheduleRequests(tx, now);

    const impact = await computeEquipmentStatusImpact(tx, params.equipmentId, now);

    // (1) FR-005：有借用中（含逾期未還）的預約時拒絕
    if (impact.checkedOutReservations.length > 0) {
      throw equipmentStatusError("EQUIPMENT_ON_LOAN");
    }
    // (2) FR-019：目前狀態和確認視窗不同時拒絕；再判斷目標等於目前狀態
    if (currentStatus !== params.expectedCurrentStatus) {
      throw equipmentStatusError("EQUIPMENT_STATE_CHANGED");
    }
    if (currentStatus === params.targetStatus) {
      throw equipmentStatusError("EQUIPMENT_STATUS_UNCHANGED");
    }
    // (3) FR-019：以預覽相同條件重算的數量和確認視窗不同時拒絕，交易回滾
    if (
      impact.cancelCount !== params.expectedCancelCount ||
      impact.expireCount !== params.expectedExpireCount
    ) {
      throw equipmentStatusError("EQUIPMENT_STATE_CHANGED");
    }

    const cancelReason = CANCEL_REASON_BY_TARGET[params.targetStatus];

    // (4) FR-002、FR-003：批次取消時段尚未結束的 pending_approval 與 confirmed 預約
    const cancelled = await tx.$queryRaw<Array<{ id: string }>>`
      UPDATE reservations AS r
      SET status = 'cancelled'::reservation_status,
          cancel_reason = ${cancelReason}::reservation_cancel_reason,
          cancelled_at = ${now},
          updated_at = ${now},
          updated_by = ${params.adminUserId}::uuid
      FROM time_slots AS s
      WHERE s.id = r.slot_id
        AND r.equipment_id = ${params.equipmentId}::uuid
        AND r.status IN ('pending_approval', 'confirmed')
        AND r.deleted_at IS NULL
        AND ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') > ${now}
      RETURNING r.id
    `;
    const cancelledIds = cancelled.map((row) => row.id);

    // (5) FR-004：這些預約的改期審核中申請改為改期已失效
    const expired =
      cancelledIds.length === 0
        ? { count: 0 }
        : await tx.reschedule_requests.updateMany({
            where: {
              reservation_id: { in: cancelledIds },
              status: "pending_approval",
              deleted_at: null,
            },
            data: {
              status: "expired",
              expire_reason: "reservation_cancelled",
              expired_at: now,
              updated_at: now,
              updated_by: params.adminUserId,
            },
          });

    // (6) FR-001、FR-008：更新設備狀態（不改 requires_approval），新增一筆狀態變更紀錄
    return writeStatusChange(tx, {
      adminUserId: params.adminUserId,
      equipmentId: params.equipmentId,
      fromStatus: currentStatus,
      toStatus: params.targetStatus,
      now,
      cancelledReservationCount: cancelledIds.length,
      expiredRescheduleRequestCount: expired.count,
    });
  });
}

/**
 * 恢復可用（FR-011～FR-013、US2 情境 1–4、SC-004）：在已以 FOR UPDATE 鎖定設備列的同一交易內，
 * 目前狀態已是 available 時回 EQUIPMENT_STATUS_UNCHANGED；否則只更新設備狀態並新增一筆
 * cancelled_reservation_count 為 0 的狀態變更紀錄，不讀取也不修改任何預約與改期申請，
 * requires_approval 保持不變。
 */
async function restoreEquipmentInTx(
  tx: Prisma.TransactionClient,
  params: RestoreEquipmentParams,
  currentStatus: EquipmentStatus,
): Promise<EquipmentStatusChangeResultDto> {
  if (currentStatus === "available") {
    throw equipmentStatusError("EQUIPMENT_STATUS_UNCHANGED");
  }
  return writeStatusChange(tx, {
    adminUserId: params.adminUserId,
    equipmentId: params.equipmentId,
    fromStatus: currentStatus,
    toStatus: "available",
    now: new Date(),
    cancelledReservationCount: 0,
    expiredRescheduleRequestCount: 0,
  });
}

/** 更新設備狀態（只改 status、updated_at、updated_by）並新增一筆狀態變更紀錄，組出回應（FR-008）。 */
async function writeStatusChange(
  tx: Prisma.TransactionClient,
  input: {
    adminUserId: string;
    equipmentId: string;
    fromStatus: EquipmentStatus;
    toStatus: EquipmentStatus;
    now: Date;
    cancelledReservationCount: number;
    expiredRescheduleRequestCount: number;
  },
): Promise<EquipmentStatusChangeResultDto> {
  const { adminUserId, equipmentId, now } = input;
  const equipment = await tx.equipments.update({
    where: { id: equipmentId },
    data: { status: input.toStatus, updated_at: now, updated_by: adminUserId },
  });
  const change = await tx.equipment_status_changes.create({
    data: {
      equipment_id: equipmentId,
      from_status: input.fromStatus,
      to_status: input.toStatus,
      changed_by: adminUserId,
      changed_at: now,
      cancelled_reservation_count: input.cancelledReservationCount,
      created_at: now,
      updated_at: now,
      updated_by: adminUserId,
    },
    include: { changer: { select: { display_name: true } } },
  });

  const statusChange: EquipmentStatusChangeDto = {
    id: change.id,
    equipmentId: change.equipment_id,
    fromStatus: change.from_status,
    toStatus: change.to_status,
    changedBy: change.changed_by,
    changedByDisplayName: change.changer.display_name,
    changedAt: change.changed_at.toISOString(),
    cancelledReservationCount: change.cancelled_reservation_count,
  };

  return {
    equipment: {
      id: equipment.id,
      equipmentCode: equipment.equipment_code,
      name: equipment.name,
      category: equipment.category,
      status: equipment.status,
      requiresApproval: equipment.requires_approval,
      lastStatusChange: {
        changedBy: statusChange.changedBy,
        changedByDisplayName: statusChange.changedByDisplayName,
        changedAt: statusChange.changedAt,
        fromStatus: statusChange.fromStatus,
        toStatus: statusChange.toStatus,
      },
      updatedAt: equipment.updated_at.toISOString(),
    },
    statusChange,
    expiredRescheduleRequestCount: input.expiredRescheduleRequestCount,
  };
}
