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
  isActive: boolean;
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

export function listMyLoanReservations(params?: {
  status?: ReservationStatus;
  page?: number;
  pageSize?: number;
}): Promise<ReservationPageDto> {
  const qs = new URLSearchParams({
    page: String(params?.page ?? 1),
    pageSize: String(params?.pageSize ?? 50),
  });
  if (params?.status) qs.set("status", params.status);
  return apiRequest<ReservationPageDto>(`/reservations/my?${qs.toString()}`);
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
