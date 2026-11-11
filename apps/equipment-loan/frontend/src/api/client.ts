import { getErrorMessage } from "../text/zh-TW";

const SESSION_TOKEN_KEY = "el_session_token";

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

export type ReservationStatus =
  "pending_approval" | "confirmed" | "checked_out" | "returned" | "rejected" | "cancelled";

/** 設備 3 種狀態（contracts EquipmentStatus）；只有 available 可以被預約。 */
export type EquipmentStatus = "available" | "maintenance" | "retired";

/** 預約取消原因（contracts ReservationCancelReason）。 */
export type ReservationCancelReason =
  "member_cancelled" | "equipment_maintenance" | "equipment_retired";

export type RescheduleRequestStatus =
  "pending_approval" | "approved" | "rejected" | "withdrawn" | "expired";

export type RescheduleExpireReason =
  | "original_slot_started"
  | "new_slot_started"
  | "reservation_cancelled"
  | "reservation_checked_out";

export interface TimeSlotSummary {
  slotId: string;
  slotName: "上午" | "下午" | "晚間";
  startTime: string;
  endTime: string;
  sortOrder: number;
}

export interface MyRescheduleSlotRef {
  rescheduleRequestId: string;
  requestNumber: string;
  reservationId: string;
  reservationNumber: string;
  fromReservationDate: string;
  fromSlot: TimeSlotSummary;
}

export interface PendingRescheduleSummary {
  id: string;
  requestNumber: string;
  toReservationDate: string;
  toSlot: TimeSlotSummary;
  createdAt: string;
}

export interface RescheduleRequest {
  id: string;
  requestNumber: string;
  reservationId: string;
  status: RescheduleRequestStatus;
  fromReservationDate: string;
  fromSlot: TimeSlotSummary;
  toReservationDate: string;
  toSlot: TimeSlotSummary;
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

export interface SlotAvailabilityDto {
  slotId: string;
  slotCode: "MORNING" | "AFTERNOON" | "EVENING";
  slotName: "上午" | "下午" | "晚間";
  startTime: string;
  endTime: string;
  sortOrder: number;
  slotStatus?: SlotStatus;
  availabilityStatus: SlotAvailabilityStatus;
  isBookable: boolean;
  myReservationId: string | null;
  myRescheduleRequest: MyRescheduleSlotRef | null;
}

export type EquipmentSlotAvailability = SlotAvailabilityDto;

export interface EquipmentWithSlotsDto {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  requiresApproval: boolean;
  reservationDate: string;
  slots: SlotAvailabilityDto[];
}

export interface EquipmentAvailabilityPageDto {
  items: EquipmentWithSlotsDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface ReservationBaseDto {
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
  /** 取消原因；status 為 cancelled 時不為 null，其餘為 null（contracts ReservationCancelReason）。 */
  cancelReason: ReservationCancelReason | null;
}

export interface ReservationDto extends ReservationBaseDto {
  canReschedule: boolean;
  pendingRescheduleRequest: PendingRescheduleSummary | null;
  rescheduleRequests: RescheduleRequest[];
}

export type Reservation = ReservationDto;

export interface ReservationPageDto {
  items: ReservationDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminReservationItemDto extends ReservationBaseDto {
  username: string;
  userDisplayName: string;
  reviewedByUsername: string | null;
  checkedOutByUsername: string | null;
  returnedByUsername: string | null;
  canPickup: boolean;
  canReturn: boolean;
  pendingRescheduleRequest: PendingRescheduleSummary | null;
}

export type AdminReservationItem = AdminReservationItemDto;

export interface AdminReservationPageDto {
  items: AdminReservationItemDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminRescheduleRequestItem {
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
  fromSlot: TimeSlotSummary;
  toReservationDate: string;
  toSlot: TimeSlotSummary;
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

export interface AdminRescheduleRequestPage {
  items: AdminRescheduleRequestItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateRescheduleRequestResponse {
  rescheduleRequest: RescheduleRequest;
  reservation: ReservationDto;
}

/** 設備最近一次狀態變更（contracts LastEquipmentStatusChange）。 */
export interface LastEquipmentStatusChange {
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
  /** 沒有任何狀態變更紀錄時為 null，畫面顯示「尚無狀態變更」。 */
  lastStatusChange: LastEquipmentStatusChange | null;
  updatedAt: string;
}

export type AdminEquipmentSetting = AdminEquipmentSettingDto;

/** 全部設備依狀態的台數，不受篩選條件影響（contracts EquipmentStatusCounts）。 */
export interface EquipmentStatusCounts {
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
  statusCounts: EquipmentStatusCounts;
}

/** 設為送修或停用的目標狀態。 */
export type UnavailableTargetStatus = "maintenance" | "retired";

/** 設備借用中預約的摘要（contracts CheckedOutReservationSummary）。 */
export interface CheckedOutReservationSummary {
  reservationId: string;
  reservationNumber: string;
  userDisplayName: string;
  reservationDate: string;
  slotName: string;
  slotStartTime: string;
  slotEndTime: string;
  isOverdue: boolean;
}

/** 設為送修或停用前的預覽結果（contracts EquipmentStatusChangePreview）。 */
export interface EquipmentStatusChangePreview {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  currentStatus: EquipmentStatus;
  targetStatus: UnavailableTargetStatus;
  cancelCount: number;
  expireCount: number;
  hasCheckedOutReservation: boolean;
  checkedOutReservations: CheckedOutReservationSummary[];
}

/** 設為送修或停用的請求；expected 欄位取自預覽結果（contracts SetEquipmentUnavailableRequest）。 */
export interface SetEquipmentUnavailableRequest {
  targetStatus: UnavailableTargetStatus;
  expectedCurrentStatus: EquipmentStatus;
  expectedCancelCount: number;
  expectedExpireCount: number;
}

/** 恢復可用的請求（contracts RestoreEquipmentRequest）。 */
export interface RestoreEquipmentRequest {
  targetStatus: "available";
}

/** 設備狀態變更請求（contracts UpdateEquipmentStatusRequest）。 */
export type UpdateEquipmentStatusRequest = SetEquipmentUnavailableRequest | RestoreEquipmentRequest;

/** 一筆設備狀態變更紀錄（contracts EquipmentStatusChange）。 */
export interface EquipmentStatusChange {
  id: string;
  equipmentId: string;
  fromStatus: EquipmentStatus;
  toStatus: EquipmentStatus;
  changedBy: string;
  changedByDisplayName: string;
  changedAt: string;
  cancelledReservationCount: number;
}

/** 設備狀態變更的結果（contracts EquipmentStatusChangeResult）。 */
export interface EquipmentStatusChangeResult {
  equipment: AdminEquipmentSetting;
  statusChange: EquipmentStatusChange;
  expiredRescheduleRequestCount: number;
}

export type OverdueNotificationStatus = "sending" | "sent" | "failed" | "unknown";

export type OverdueNotificationFailureReason =
  | "rate_limited"
  | "discord_server_error"
  | "connection_failed"
  | "webhook_invalid"
  | "webhook_not_configured"
  | "message_rejected";

/** 一則逾期通知與它對應的逾期借用（contracts OverdueNotification）。 */
export interface OverdueNotification {
  id: string;
  reservationId: string;
  reservationNumber: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  userId: string;
  userDisplayName: string;
  reservationDate: string;
  slotName: "上午" | "下午" | "晚間";
  slotStartTime: "09:00" | "13:00" | "18:00";
  slotEndTime: "12:00" | "17:00" | "21:00";
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

/** 逾期通知紀錄的分頁回應（contracts OverdueNotificationPage）。 */
export interface OverdueNotificationPage {
  items: OverdueNotification[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // ignore storage errors in non-browser test environments
  }
}

export function clearStoredToken(): void {
  try {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore storage errors in non-browser test environments
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const code = data?.code || "VALIDATION_FAILED";
    const message = getErrorMessage(code, data?.message);
    throw new ApiError(code, response.status, message);
  }

  return data as T;
}

export function listEquipments(params: {
  date: string;
  equipmentId?: string;
  category?: string;
  requiresApproval?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<EquipmentAvailabilityPageDto> {
  const qs = new URLSearchParams({
    date: params.date,
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 50),
  });
  if (params.equipmentId) qs.set("equipmentId", params.equipmentId);
  if (params.category) qs.set("category", params.category);
  if (params.requiresApproval !== undefined) {
    qs.set("requiresApproval", String(params.requiresApproval));
  }
  return apiRequest<EquipmentAvailabilityPageDto>(`/equipments?${qs.toString()}`);
}

export function createRescheduleRequest(
  reservationId: string,
  body: { toReservationDate: string; toSlotId: string },
): Promise<CreateRescheduleRequestResponse> {
  return apiRequest<CreateRescheduleRequestResponse>(
    `/reservations/${reservationId}/reschedule-requests`,
    {
      method: "POST",
      body: JSON.stringify({
        toReservationDate: body.toReservationDate,
        toSlotId: body.toSlotId,
      }),
    },
  );
}

/** 本人預約清單（GET /reservations/my，與 GET /reservations 行為一致）；hasPendingRescheduleRequest 供「改期審核中」篩選（FR-009）。 */
export function listMyLoanReservations(params?: {
  status?: ReservationStatus;
  hasPendingRescheduleRequest?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<ReservationPageDto> {
  const qs = new URLSearchParams({
    page: String(params?.page ?? 1),
    pageSize: String(params?.pageSize ?? 50),
  });
  if (params?.status) qs.set("status", params.status);
  if (params?.hasPendingRescheduleRequest !== undefined) {
    qs.set("hasPendingRescheduleRequest", String(params.hasPendingRescheduleRequest));
  }
  return apiRequest<ReservationPageDto>(`/reservations/my?${qs.toString()}`);
}

/** 撤回本人改期審核中的申請（POST /reschedule-requests/:rescheduleRequestId/withdraw，FR-010）。 */
export function withdrawRescheduleRequest(rescheduleRequestId: string): Promise<RescheduleRequest> {
  return apiRequest<RescheduleRequest>(`/reschedule-requests/${rescheduleRequestId}/withdraw`, {
    method: "POST",
  });
}

export function fetchAdminEquipments(params?: {
  category?: string;
  requiresApproval?: boolean;
}): Promise<AdminEquipmentPageDto> {
  const qs = new URLSearchParams({ page: "1", pageSize: "50" });
  if (params?.category) qs.set("category", params.category);
  if (params?.requiresApproval !== undefined) {
    qs.set("requiresApproval", String(params.requiresApproval));
  }
  return apiRequest<AdminEquipmentPageDto>(`/admin/equipments?${qs.toString()}`);
}

export function updateEquipmentApprovalModeApi(
  equipmentId: string,
  requiresApproval: boolean,
): Promise<AdminEquipmentSettingDto> {
  return apiRequest<AdminEquipmentSettingDto>(`/admin/equipments/${equipmentId}/approval-mode`, {
    method: "PATCH",
    body: JSON.stringify({ requiresApproval }),
  });
}

/** 預覽設為送修或停用時將取消的預約數與將失效的改期申請數（getEquipmentStatusChangePreview）。 */
export function getEquipmentStatusChangePreview(
  equipmentId: string,
  targetStatus: UnavailableTargetStatus,
): Promise<EquipmentStatusChangePreview> {
  const qs = new URLSearchParams({ targetStatus });
  return apiRequest<EquipmentStatusChangePreview>(
    `/admin/equipments/${equipmentId}/status-change-preview?${qs.toString()}`,
  );
}

/** 把設備設為送修、停用或恢復可用（updateEquipmentStatus）。 */
export function updateEquipmentStatus(
  equipmentId: string,
  body: UpdateEquipmentStatusRequest,
): Promise<EquipmentStatusChangeResult> {
  return apiRequest<EquipmentStatusChangeResult>(`/admin/equipments/${equipmentId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function fetchPendingReservations(params?: {
  equipmentId?: string;
}): Promise<AdminReservationPageDto> {
  const qs = new URLSearchParams({ page: "1", pageSize: "50" });
  if (params?.equipmentId) qs.set("equipmentId", params.equipmentId);
  return apiRequest<AdminReservationPageDto>(`/admin/reservations/pending?${qs.toString()}`);
}

export function approveReservationApi(reservationId: string): Promise<AdminReservationItemDto> {
  return apiRequest<AdminReservationItemDto>(`/admin/reservations/${reservationId}/approve`, {
    method: "POST",
  });
}

export function rejectReservationApi(
  reservationId: string,
  rejectReason?: string | null,
): Promise<AdminReservationItemDto> {
  return apiRequest<AdminReservationItemDto>(`/admin/reservations/${reservationId}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectReason: rejectReason ?? null }),
  });
}

export function pickupReservationByAdmin(reservationId: string): Promise<AdminReservationItemDto> {
  return apiRequest<AdminReservationItemDto>(`/admin/reservations/${reservationId}/pickup`, {
    method: "POST",
  });
}

export function returnReservationByAdmin(reservationId: string): Promise<AdminReservationItemDto> {
  return apiRequest<AdminReservationItemDto>(`/admin/reservations/${reservationId}/return`, {
    method: "POST",
  });
}

export function listRescheduleRequests(params?: {
  status?: RescheduleRequestStatus;
  equipmentId?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminRescheduleRequestPage> {
  const qs = new URLSearchParams({
    page: String(params?.page ?? 1),
    pageSize: String(params?.pageSize ?? 50),
  });
  if (params?.status) qs.set("status", params.status);
  if (params?.equipmentId) qs.set("equipmentId", params.equipmentId);
  return apiRequest<AdminRescheduleRequestPage>(`/admin/reschedule-requests?${qs.toString()}`);
}

export function approveRescheduleRequest(
  rescheduleRequestId: string,
): Promise<AdminRescheduleRequestItem> {
  return apiRequest<AdminRescheduleRequestItem>(
    `/admin/reschedule-requests/${rescheduleRequestId}/approve`,
    { method: "POST" },
  );
}

export function rejectRescheduleRequest(
  rescheduleRequestId: string,
  body: { rejectReason?: string | null },
): Promise<AdminRescheduleRequestItem> {
  return apiRequest<AdminRescheduleRequestItem>(
    `/admin/reschedule-requests/${rescheduleRequestId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ rejectReason: body.rejectReason ?? null }),
    },
  );
}

/** 管理員分頁查詢逾期通知紀錄，可依通知狀態篩選（listOverdueNotifications）。 */
export function listOverdueNotifications(params?: {
  status?: OverdueNotificationStatus;
  page?: number;
  pageSize?: number;
}): Promise<OverdueNotificationPage> {
  const qs = new URLSearchParams({
    page: String(params?.page ?? 1),
    pageSize: String(params?.pageSize ?? 20),
  });
  if (params?.status) qs.set("status", params.status);
  return apiRequest<OverdueNotificationPage>(`/admin/overdue-notifications?${qs.toString()}`);
}

/** 管理員重送一則「送出失敗」或「結果不明」的逾期通知，回傳狀態為 sending 的通知（resendOverdueNotification）。 */
export function resendOverdueNotification(notificationId: string): Promise<OverdueNotification> {
  return apiRequest<OverdueNotification>(`/admin/overdue-notifications/${notificationId}/resend`, {
    method: "POST",
  });
}
