import React, { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "../App";
import {
  type AdminEquipmentSettingDto,
  type AdminReservationItemDto,
  type AdminReservationPageDto,
  type AdminRescheduleRequestItem,
  ApiError,
  apiRequest,
  approveRescheduleRequest,
  approveReservationApi,
  fetchAdminEquipments,
  fetchPendingReservations,
  listRescheduleRequests,
  pickupReservationByAdmin,
  rejectRescheduleRequest,
  rejectReservationApi,
  type ReservationStatus,
  returnReservationByAdmin,
  updateEquipmentApprovalModeApi,
} from "../api/client";
import { UI_TEXT } from "../text/zh-TW";

export type AdminReservationItem = AdminReservationItemDto;
export type AdminReservationPage = AdminReservationPageDto;

function getTaipeiTodayStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getTaipeiTimeStr(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function isOverdueCheckedOut(item: AdminReservationItem): boolean {
  if (item.status !== "checked_out") return false;
  const todayStr = getTaipeiTodayStr();
  if (item.reservationDate < todayStr) return true;
  if (item.reservationDate === todayStr && getTaipeiTimeStr() >= item.slotEndTime) return true;
  return false;
}

function formatIsoToTaipeiDateTime(iso: string | null): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dt);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
  return `${datePart} ${timePart}`;
}

function slotRangeText(
  date: string,
  slot: { slotName: string; startTime: string; endTime: string },
): string {
  return `${date} ${slot.slotName} ${slot.startTime}–${slot.endTime}`;
}

/** 「改期申請」標示：琥珀色虛線框（ui/admin.html 的 badge-reschedule） */
const RESCHEDULE_BADGE_STYLE: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--pending)",
  border: "1px dashed var(--pending)",
};

/**
 * 核准或駁回收到 INVALID_RESCHEDULE_STATUS 時，查回該申請的最新狀態，組出原時段已開始、新時段已開始或已撤回的提示
 * （ui/plan.md §5；Notes 待確認 4：只用合約既有的 listRescheduleRequests 欄位）；查不到或其他狀態時沿用後端訊息。
 */
async function describeRescheduleNotPending(
  item: AdminRescheduleRequestItem,
  action: "核准" | "駁回",
  fallbackMessage: string,
): Promise<string> {
  try {
    const page = await listRescheduleRequests({ page: 1, pageSize: 100 });
    const latest = page.items.find((rr) => rr.id === item.id);
    if (!latest) return fallbackMessage;
    const fromText = slotRangeText(latest.fromReservationDate, latest.fromSlot);
    const toText = slotRangeText(latest.toReservationDate, latest.toSlot);
    if (latest.status === "expired" && latest.expireReason === "original_slot_started") {
      return `無法${action}：改期申請 ${latest.requestNumber} 的原時段 ${fromText} 已開始，申請已自動變成「改期已失效」並移出待審清單。${latest.userDisplayName}的預約 ${latest.reservationNumber} 維持原時段，可以照常登記領取。`;
    }
    if (latest.status === "expired" && latest.expireReason === "new_slot_started") {
      return `無法${action}：改期申請 ${latest.requestNumber} 的新時段 ${toText} 已開始（早於原時段 ${fromText}），申請已自動變成「改期已失效」並移出待審清單。${latest.userDisplayName}的預約 ${latest.reservationNumber} 維持原時段。`;
    }
    if (latest.status === "withdrawn") {
      return `無法審核：改期申請 ${latest.requestNumber} 已在 ${formatIsoToTaipeiDateTime(latest.withdrawnAt)} 被${latest.userDisplayName}撤回，目前為「改期已撤回」。只有「改期審核中」的申請可以核准或駁回。`;
    }
    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

/** 從核准失敗訊息取出占用新時段的預約編號（Notes 待確認 4：細節由後端寫在 message） */
function extractOccupantNumber(message: string): string | null {
  const match = message.match(/已被預約\s*(\S+?)\s*占用/);
  return match ? match[1] : null;
}

interface AdminOverviewViewProps {
  currentUser: AuthenticatedUser;
  onGoToBooking: () => void;
  onSwitchAccount: () => void;
}

export function AdminOverviewView({
  currentUser,
  onGoToBooking,
  onSwitchAccount,
}: AdminOverviewViewProps): React.ReactElement {
  const [equipments, setEquipments] = useState<AdminEquipmentSettingDto[]>([]);
  const [pendingList, setPendingList] = useState<AdminReservationItem[]>([]);
  const [rescheduleList, setRescheduleList] = useState<AdminRescheduleRequestItem[]>([]);
  const [reviewTab, setReviewTab] = useState<"reschedule" | "reservation">("reschedule");
  const [approvingRescheduleId, setApprovingRescheduleId] = useState<string | null>(null);
  const [rescheduleRejectTarget, setRescheduleRejectTarget] =
    useState<AdminRescheduleRequestItem | null>(null);
  const [rescheduleRejectReason, setRescheduleRejectReason] = useState<string>("");
  const [rescheduleRejectError, setRescheduleRejectError] = useState<string>("");
  const [rejectingReschedule, setRejectingReschedule] = useState<boolean>(false);
  const [rescheduleConflict, setRescheduleConflict] = useState<{
    id: string;
    occupantNumber: string | null;
  } | null>(null);
  const [reservations, setReservations] = useState<AdminReservationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReservationStatus>("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(currentUser.role === "admin");
  const [forbidden, setForbidden] = useState<boolean>(currentUser.role !== "admin");
  const [banner, setBanner] = useState<{
    tone: "danger" | "success" | "info";
    text: string;
  } | null>(null);
  const [togglingEqId, setTogglingEqId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [pickupProcessingId, setPickupProcessingId] = useState<string | null>(null);
  const [returnProcessingId, setReturnProcessingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminReservationItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>("");
  const [rejectError, setRejectError] = useState<string>("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const resParams = new URLSearchParams({
        page: "1",
        pageSize: "100",
      });
      if (statusFilter !== "ALL") {
        resParams.set("status", statusFilter);
      }
      if (equipmentFilter !== "ALL") {
        resParams.set("equipmentId", equipmentFilter);
      }

      const [eqData, pendingData, resData, rescheduleData] = await Promise.all([
        fetchAdminEquipments(),
        fetchPendingReservations(
          equipmentFilter !== "ALL" ? { equipmentId: equipmentFilter } : undefined,
        ),
        apiRequest<AdminReservationPageDto>(`/admin/reservations?${resParams.toString()}`),
        listRescheduleRequests({
          status: "pending_approval",
          ...(equipmentFilter !== "ALL" ? { equipmentId: equipmentFilter } : {}),
        }),
      ]);

      setEquipments(eqData.items);
      setPendingList(pendingData.items);
      setRescheduleList(rescheduleData.items);
      setReservations(resData.items);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      } else {
        setBanner({
          tone: "danger",
          text: err instanceof ApiError ? err.message : "載入管理員審核與預約資料失敗。",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, equipmentFilter]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const handleToggleApprovalMode = async (eq: AdminEquipmentSettingDto): Promise<void> => {
    setTogglingEqId(eq.id);
    setBanner(null);
    try {
      const updated = await updateEquipmentApprovalModeApi(eq.id, !eq.requiresApproval);
      // FR-008：切換前送出的改期審核中申請仍留在待審清單
      const kept = await listRescheduleRequests({
        status: "pending_approval",
        equipmentId: updated.id,
      });
      const keptNumbers = kept.items.map((rr) => rr.requestNumber);
      const rescheduleNote =
        keptNumbers.length > 0
          ? `切換前送出的 ${keptNumbers.length} 筆改期審核中申請（${keptNumbers.join("、")}）仍留在待審清單，請繼續核准或駁回；之後新送出的改期依新設定處理。`
          : "之後新送出的預約與改期依新設定處理。";
      setBanner({
        tone: "success",
        text: `已更新設備審核設定：${updated.equipmentCode} ${updated.name} 已設為「${updated.requiresApproval ? "需人工審核" : "免審核"}」；既有「已核准／有效」預約與既有「待審核」申請均維持原狀態與效力不變，新設定僅適用於後續新送出的預約申請。${rescheduleNote}`,
      });
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "更新設備人工審核設定失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      await loadAdminData();
    } finally {
      setTogglingEqId(null);
    }
  };

  const handleApprove = async (item: AdminReservationItem): Promise<void> => {
    setReviewingId(item.id);
    setBanner(null);
    try {
      const updated = await approveReservationApi(item.id);
      setBanner({
        tone: "success",
        text: `已核准預約申請 ${updated.reservationNumber}（${updated.userDisplayName}，${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}），狀態已更新為「已核准／有效」並正式鎖定占用該時段。`,
      });
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "核准申請失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      await loadAdminData();
    } finally {
      setReviewingId(null);
    }
  };

  const handleApproveReschedule = async (item: AdminRescheduleRequestItem): Promise<void> => {
    setApprovingRescheduleId(item.id);
    setBanner(null);
    try {
      const rr = await approveRescheduleRequest(item.id);
      setRescheduleConflict(null);
      setBanner({
        tone: "success",
        text: `已核准改期申請 ${rr.requestNumber}：${rr.userDisplayName}的預約 ${rr.reservationNumber}（${rr.equipmentCode} ${rr.equipmentName}）已改到 ${slotRangeText(rr.toReservationDate, rr.toSlot)}，狀態仍為「已核准／有效」；原時段 ${slotRangeText(rr.fromReservationDate, rr.fromSlot)} 已釋出。審核管理員${rr.reviewedByDisplayName ?? currentUser.displayName}，審核時間 ${formatIsoToTaipeiDateTime(rr.reviewedAt)}。`,
      });
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "核准改期申請失敗，請稍後再試。";
      if (err instanceof ApiError && err.code === "RESCHEDULE_SLOT_CONFLICT") {
        // 申請維持「改期審核中」並留在清單，該列標紅框
        setRescheduleConflict({ id: item.id, occupantNumber: extractOccupantNumber(msg) });
      } else {
        setRescheduleConflict(null);
      }
      if (err instanceof ApiError && err.code === "INVALID_RESCHEDULE_STATUS") {
        // FR-011、FR-012、SC-004：已失效或已撤回的申請移出清單，並說明原因
        setRescheduleList((prev) => prev.filter((rr) => rr.id !== item.id));
        setBanner({
          tone: "danger",
          text: await describeRescheduleNotPending(item, "核准", msg),
        });
      } else {
        setBanner({ tone: "danger", text: msg });
      }
      await loadAdminData();
    } finally {
      setApprovingRescheduleId(null);
    }
  };

  const handleOpenRescheduleReject = (item: AdminRescheduleRequestItem): void => {
    setRescheduleRejectTarget(item);
    setRescheduleRejectReason("");
    setRescheduleRejectError("");
  };

  const handleConfirmRescheduleReject = async (): Promise<void> => {
    if (!rescheduleRejectTarget) return;
    const length = Array.from(rescheduleRejectReason).length;
    if (length > 200) {
      // 超過 200 字時欄位紅框並顯示提示，不關閉對話框
      setRescheduleRejectError(`駁回原因最多 200 字，目前 ${length} 字。`);
      return;
    }
    const trimmed = rescheduleRejectReason.trim();
    setRejectingReschedule(true);
    setRescheduleRejectError("");
    try {
      const rr = await rejectRescheduleRequest(rescheduleRejectTarget.id, {
        rejectReason: trimmed.length > 0 ? trimmed : null,
      });
      setRescheduleRejectTarget(null);
      if (rescheduleConflict?.id === rr.id) setRescheduleConflict(null);
      setBanner({
        tone: "success",
        text: `已駁回改期申請 ${rr.requestNumber}，狀態變成「改期被駁回」。${rr.userDisplayName}的預約 ${rr.reservationNumber} 維持 ${slotRangeText(rr.fromReservationDate, rr.fromSlot)}，不會變動；成員可在「我的預約」查看駁回原因。`,
      });
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "駁回改期申請失敗，請稍後再試。";
      const target = rescheduleRejectTarget;
      setRescheduleRejectTarget(null);
      if (err instanceof ApiError && err.code === "INVALID_RESCHEDULE_STATUS") {
        // 已失效或已撤回的申請移出清單，並說明原因
        setRescheduleList((prev) => prev.filter((rr) => rr.id !== target.id));
        setBanner({
          tone: "danger",
          text: await describeRescheduleNotPending(target, "駁回", msg),
        });
      } else {
        setBanner({ tone: "danger", text: msg });
      }
      await loadAdminData();
    } finally {
      setRejectingReschedule(false);
    }
  };

  const handleOpenRejectModal = (item: AdminReservationItem): void => {
    setRejectTarget(item);
    setRejectReasonInput("");
    setRejectError("");
  };

  const handlePickup = async (item: AdminReservationItem): Promise<void> => {
    setPickupProcessingId(item.id);
    setBanner(null);
    // FR-016：登記領取前的改期審核中申請，領取成功後同時變成「改期已失效」
    const pendingReschedule = item.pendingRescheduleRequest;
    try {
      const updated = await pickupReservationByAdmin(item.id);
      setBanner({
        tone: "success",
        text: `已完成登記領取！預約編號 ${updated.reservationNumber}（${updated.userDisplayName}，${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}）狀態已更新為「借用中」，記錄領取時間 ${formatIsoToTaipeiDateTime(updated.checkedOutAt)} 與領取經手管理員${updated.checkedOutByName ?? "管理員"}${updated.checkedOutByUsername ? ` (${updated.checkedOutByUsername})` : ""}。${
          pendingReschedule
            ? `這筆預約的改期申請 ${pendingReschedule.requestNumber} 已同時變成「改期已失效」，並已移出待審清單。`
            : ""
        }`,
      });
      // 重新載入預約與改期申請清單
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "登記領取失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      await loadAdminData();
    } finally {
      setPickupProcessingId(null);
    }
  };

  const handleReturn = async (item: AdminReservationItem): Promise<void> => {
    const wasOverdue = isOverdueCheckedOut(item);
    setReturnProcessingId(item.id);
    setBanner(null);
    try {
      const updated = await returnReservationByAdmin(item.id);
      if (wasOverdue) {
        setBanner({
          tone: "success",
          text: `已完成逾時設備登記歸還！預約編號 ${updated.reservationNumber}（${updated.userDisplayName}，${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}）雖已超過原時段結束時間，系統已允許結案並更新為「已歸還」，記錄實際歸還時間 ${formatIsoToTaipeiDateTime(updated.returnedAt)} 與歸還經手管理員${updated.returnedByName ?? "管理員"}${updated.returnedByUsername ? ` (${updated.returnedByUsername})` : ""}。`,
        });
      } else {
        setBanner({
          tone: "success",
          text: `已完成登記歸還！預約編號 ${updated.reservationNumber}（${updated.userDisplayName}，${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}）狀態已更新為「已歸還」，記錄歸還時間 ${formatIsoToTaipeiDateTime(updated.returnedAt)} 與歸還經手管理員${updated.returnedByName ?? "管理員"}${updated.returnedByUsername ? ` (${updated.returnedByUsername})` : ""}，該時段視為已履約結案不重新開放。`,
        });
      }
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "登記歸還失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      await loadAdminData();
    } finally {
      setReturnProcessingId(null);
    }
  };

  const handleConfirmReject = async (): Promise<void> => {
    if (!rejectTarget) return;
    const trimmed = rejectReasonInput.trim();
    if (trimmed.length > 200) {
      setRejectError(`駁回原因為選填，但長度不得超過 200 字（目前已輸入 ${trimmed.length} 字）。`);
      return;
    }

    setReviewingId(rejectTarget.id);
    setRejectError("");
    try {
      const updated = await rejectReservationApi(
        rejectTarget.id,
        trimmed.length > 0 ? trimmed : null,
      );
      setRejectTarget(null);
      setBanner({
        tone: "success",
        text: `已駁回預約申請 ${updated.reservationNumber}（${updated.userDisplayName}，${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}），已記錄審核時間與駁回原因並保留於全體預約歷史紀錄。`,
      });
      await loadAdminData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "駁回申請失敗，請稍後再試。";
      setRejectTarget(null);
      setBanner({ tone: "danger", text: msg });
      await loadAdminData();
    } finally {
      setReviewingId(null);
    }
  };

  if (forbidden || currentUser.role !== "admin") {
    return (
      <div>
        <h1>管理員設備審核設定、待審清單與核准駁回</h1>
        <p className="page-lead">
          集中管理組織預建設備的人工審核設定、處理待審核申請清單（核准重檢時段衝突或填寫原因駁回），以及檢視全體成員預約紀錄。
        </p>

        <section
          className="card"
          role="alert"
          data-testid="admin-forbidden-card"
          style={{
            maxWidth: "560px",
            margin: "24px auto",
            padding: "32px",
            textAlign: "center",
            borderColor: "var(--danger)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 14px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "var(--danger-soft)",
              color: "var(--danger)",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h2 style={{ color: "var(--danger)" }}>權限不足</h2>
          <p className="muted" style={{ margin: "8px 0 22px" }}>
            核准或駁回改期申請、審核預約與登記領取歸還，只限管理員操作。您目前登入的身分是一般成員（
            {currentUser.displayName}）。
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGoToBooking}
              data-testid="forbidden-go-booking"
            >
              返回設備預約
            </button>
            <button
              type="button"
              className="btn"
              onClick={onSwitchAccount}
              data-testid="forbidden-switch-account"
            >
              切換管理員帳號登入
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <h1>管理員設備審核設定、待審清單與現場領取歸還登記</h1>
      <p className="page-lead">
        支援依全部 6
        種狀態（待審核、已核准／有效、借用中、已歸還、已駁回、已取消）篩選紀錄，完整顯示領取與歸還時間及經手管理員；僅對當日且尚未超過時段結束時間的「已核准／有效」預約開放單鍵「登記領取」，僅對「借用中」紀錄（含逾時未還）開放單鍵「登記歸還」。
      </p>

      {banner && (
        <div className={`banner banner-${banner.tone}`} role="alert" data-testid="admin-banner">
          <span>{banner.text}</span>
        </div>
      )}

      <h2>預建單件獨立設備清單（共 {equipments.length} 台）</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {equipments.map((eq) => (
          <div
            key={eq.id}
            className="card"
            data-testid={`admin-eq-card-${eq.equipmentCode}`}
            style={{ padding: "16px", display: "grid", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                {eq.equipmentCode}
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span
                  className={`badge ${eq.requiresApproval ? "badge-pending" : "badge-available"}`}
                  data-testid={`admin-eq-mode-${eq.equipmentCode}`}
                >
                  {eq.requiresApproval
                    ? UI_TEXT.approvalModes.requiresApproval
                    : UI_TEXT.approvalModes.noApproval}
                </span>
                <span className="badge badge-available">
                  {eq.isActive ? "可供借用" : "暫停借用"}
                </span>
              </div>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{eq.name}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              分類：{eq.category}｜更新：
              <span className="mono">{formatIsoToTaipeiDateTime(eq.updatedAt)}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              disabled={togglingEqId === eq.id}
              data-testid={`toggle-approval-btn-${eq.equipmentCode}`}
              onClick={() => void handleToggleApprovalMode(eq)}
              style={{ marginTop: "4px" }}
            >
              {togglingEqId === eq.id
                ? "儲存設定中…"
                : eq.requiresApproval
                  ? "切換為免審核"
                  : "切換為需人工審核"}
            </button>
          </div>
        ))}
      </div>

      <section
        className="card"
        data-testid="admin-pending-section"
        style={{ padding: "20px", marginBottom: "24px" }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: "18px" }}>待審清單</h2>
        <div
          role="tablist"
          aria-label="待審清單分頁"
          style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}
        >
          {(
            [
              ["reschedule", `改期申請（${rescheduleList.length}）`],
              ["reservation", `預約申請（${pendingList.length}）`],
            ] as const
          ).map(([key, label]) => {
            const selected = reviewTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                data-testid={`review-tab-${key}`}
                onClick={() => setReviewTab(key)}
                style={{
                  height: "36px",
                  padding: "0 14px",
                  border: `1px solid ${selected ? "var(--primary)" : "var(--line)"}`,
                  borderRadius: "8px",
                  background: selected ? "var(--primary-soft)" : "var(--surface)",
                  color: selected ? "var(--primary)" : "var(--ink)",
                  font: "inherit",
                  fontSize: "14px",
                  fontWeight: selected ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {reviewTab === "reschedule" ? (
          loading && rescheduleList.length === 0 ? (
            <div style={{ padding: "16px 0", color: "var(--muted)" }}>正在載入待審改期申請…</div>
          ) : rescheduleList.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                background: "var(--surface-muted)",
                borderRadius: "10px",
                color: "var(--muted)",
              }}
              data-testid="reschedule-pending-empty"
            >
              <h3 style={{ margin: "0 0 6px", color: "var(--ink)" }}>目前沒有待審的改期申請</h3>
              <p style={{ margin: 0 }}>成員對需人工審核設備送出改期後，申請會出現在這裡。</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }} data-testid="reschedule-pending-list">
              {rescheduleList.map((rr) => {
                const isConflict = rescheduleConflict?.id === rr.id;
                const isApproving = approvingRescheduleId === rr.id;
                return (
                  <div
                    key={rr.id}
                    data-testid={`rr-item-${rr.requestNumber}`}
                    data-conflict={isConflict ? "true" : undefined}
                    style={{
                      padding: "14px 16px",
                      border: `1px solid ${isConflict ? "var(--danger)" : "var(--line)"}`,
                      background: isConflict ? "var(--danger-soft)" : undefined,
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "grid", gap: "4px", fontSize: "14px" }}>
                      <div>
                        <span className="badge" style={RESCHEDULE_BADGE_STYLE}>
                          改期申請
                        </span>{" "}
                        <span className="mono">{rr.requestNumber}</span>｜{rr.userDisplayName}
                        ｜預約 <span className="mono">{rr.reservationNumber}</span>
                      </div>
                      <div>
                        <span className="mono">{rr.equipmentCode}</span> {rr.equipmentName}
                      </div>
                      <div className="mono" style={{ fontSize: "13px" }}>
                        原 {slotRangeText(rr.fromReservationDate, rr.fromSlot)} → 新{" "}
                        {slotRangeText(rr.toReservationDate, rr.toSlot)}
                      </div>
                      <div className="mono" style={{ fontSize: "12px", color: "var(--muted)" }}>
                        申請時間 {formatIsoToTaipeiDateTime(rr.createdAt)}
                        {isConflict &&
                          `｜新時段已被${rescheduleConflict?.occupantNumber ? `預約 ${rescheduleConflict.occupantNumber} ` : ""}占用`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={isApproving}
                        data-testid={`rr-approve-btn-${rr.requestNumber}`}
                        onClick={() => void handleApproveReschedule(rr)}
                      >
                        {isApproving ? "核准中…" : "核准改期"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        disabled={isApproving}
                        data-testid={`rr-reject-btn-${rr.requestNumber}`}
                        onClick={() => handleOpenRescheduleReject(rr)}
                      >
                        駁回
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "18px" }}>
                  待審核申請清單（共 {pendingList.length} 筆待審）
                </h2>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                  預設依預約日期由近到遠、固定時段順序及申請建立時間由早到晚排序；核准時系統將即時重檢時段衝突並正式鎖定時段。
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "16px 0", color: "var(--muted)" }}>
                正在載入待審核申請清單…
              </div>
            ) : pendingList.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  background: "var(--surface-muted)",
                  borderRadius: "10px",
                  color: "var(--muted)",
                }}
                data-testid="pending-empty"
              >
                目前沒有待審核的預約申請紀錄。
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  data-testid="admin-pending-table"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "var(--surface-muted)",
                        color: "var(--muted)",
                        fontSize: "13px",
                      }}
                    >
                      <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                        預約編號
                      </th>
                      <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                        申請成員
                      </th>
                      <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                        申請設備
                      </th>
                      <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                        預約日期與時段
                      </th>
                      <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                        申請建立時間
                      </th>
                      <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                        審核操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingList.map((item) => {
                      const isBusy = reviewingId === item.id;
                      return (
                        <tr
                          key={item.id}
                          data-testid={`pending-row-${item.reservationNumber}`}
                          style={{ borderBottom: "1px solid var(--line)" }}
                        >
                          <td className="mono" style={{ padding: "12px 14px", fontWeight: 600 }}>
                            {item.reservationNumber}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <strong>{item.userDisplayName}</strong>{" "}
                            <span className="muted mono" style={{ fontSize: "12px" }}>
                              ({item.username})
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              className="mono"
                              style={{ color: "var(--primary)", fontWeight: 600 }}
                            >
                              {item.equipmentCode}
                            </span>{" "}
                            {item.equipmentName}
                          </td>
                          <td className="mono" style={{ padding: "12px 14px" }}>
                            {item.reservationDate} {item.slotName} {item.slotStartTime}–
                            {item.slotEndTime}
                          </td>
                          <td className="mono" style={{ padding: "12px 14px" }}>
                            {formatIsoToTaipeiDateTime(item.createdAt)}
                          </td>
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={isBusy}
                                data-testid={`approve-btn-${item.reservationNumber}`}
                                onClick={() => void handleApprove(item)}
                              >
                                {isBusy ? "審核處理中…" : "核准申請"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                disabled={isBusy}
                                data-testid={`reject-btn-${item.reservationNumber}`}
                                onClick={() => handleOpenRejectModal(item)}
                              >
                                {isBusy ? "審核處理中…" : "駁回申請"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>全體預約與借用管理清單（現場登記領取／登記歸還）</strong>
            <span className="muted" style={{ fontSize: "13px", marginLeft: "8px" }}>
              共 {reservations.length} 筆紀錄
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label htmlFor="admin-status-filter" className="muted" style={{ fontSize: "13px" }}>
              預約狀態：
            </label>
            <select
              id="admin-status-filter"
              data-testid="admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | ReservationStatus)}
              style={{
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
                fontSize: "13px",
              }}
            >
              <option value="ALL">全部狀態（6 種狀態）</option>
              <option value="pending_approval">待審核 (pending_approval)</option>
              <option value="confirmed">已核准／有效 — 待領取 (confirmed)</option>
              <option value="checked_out">借用中 — 待歸還 (checked_out)</option>
              <option value="returned">已歸還 (returned)</option>
              <option value="rejected">已駁回 (rejected)</option>
              <option value="cancelled">已取消 (cancelled)</option>
            </select>

            <label htmlFor="admin-eq-filter" className="muted" style={{ fontSize: "13px" }}>
              單件設備：
            </label>
            <select
              id="admin-eq-filter"
              data-testid="admin-eq-filter"
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              style={{
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
                fontSize: "13px",
              }}
            >
              <option value="ALL">全部預建設備</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.equipmentCode} {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          role="group"
          aria-label="6 態快速篩選"
          style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
        >
          {[
            { value: "ALL", label: "全部狀態" },
            { value: "confirmed", label: "已核准／有效（待領取）" },
            { value: "checked_out", label: "借用中（待歸還）" },
            { value: "returned", label: "已歸還" },
            { value: "pending_approval", label: "待審核" },
            { value: "rejected", label: "已駁回" },
            { value: "cancelled", label: "已取消" },
          ].map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                data-testid={`admin-tab-${tab.value}`}
                onClick={() => setStatusFilter(tab.value as "ALL" | ReservationStatus)}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${active ? "var(--primary)" : "var(--line)"}`,
                  borderRadius: "8px",
                  background: active ? "var(--primary)" : "var(--surface)",
                  color: active ? "#ffffff" : "var(--muted)",
                  font: "inherit",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "24px", color: "var(--muted)" }}>
          正在載入设备審核設定、待審核申請清單與全體預約紀錄…
        </div>
      ) : reservations.length === 0 ? (
        <div className="card" style={{ padding: "44px 24px", textAlign: "center" }}>
          <h2>目前沒有符合篩選條件的預約申請紀錄</h2>
          <p className="muted">請調整上方狀態或設備篩選條件，重新檢視全體成員預約紀錄。</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setStatusFilter("ALL");
              setEquipmentFilter("ALL");
            }}
          >
            重設篩選條件
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table
            data-testid="admin-reservations-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--surface-muted)",
                  color: "var(--muted)",
                  fontSize: "13px",
                }}
              >
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  預約編號
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  預約成員
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  單件設備
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  預約日期與時段
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  預約狀態
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  領取時間／經手管理員
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  歸還時間／經手管理員
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  審核資訊／駁回原因
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  建立／取消時間
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  現場管理操作
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const todayStr = getTaipeiTodayStr();
                const overdue = isOverdueCheckedOut(r);
                const badgeClass =
                  r.status === "confirmed"
                    ? "badge-mine"
                    : r.status === "checked_out"
                      ? "badge-loan"
                      : r.status === "returned"
                        ? "badge-returned"
                        : r.status === "pending_approval"
                          ? "badge-pending"
                          : r.status === "rejected"
                            ? "badge-cancelled"
                            : "badge-occupied";

                return (
                  <tr
                    key={r.id}
                    data-testid={`admin-row-${r.reservationNumber}`}
                    style={{ borderBottom: "1px solid var(--line)" }}
                  >
                    <td className="mono" style={{ padding: "13px 16px" }}>
                      {r.reservationNumber}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <strong>{r.userDisplayName}</strong>{" "}
                      <span className="muted mono" style={{ fontSize: "12px" }}>
                        ({r.username})
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span className="mono" style={{ color: "var(--primary)", fontWeight: 600 }}>
                        {r.equipmentCode}
                      </span>{" "}
                      {r.equipmentName}
                    </td>
                    <td className="mono" style={{ padding: "13px 16px" }}>
                      {r.reservationDate} {r.slotName} {r.slotStartTime}–{r.slotEndTime}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        className={`badge ${badgeClass}`}
                        data-testid={`admin-status-${r.reservationNumber}`}
                      >
                        {overdue ? "借用中（逾時未還）" : UI_TEXT.reservationStatus[r.status]}
                      </span>
                      {r.pendingRescheduleRequest && (
                        <div style={{ marginTop: "4px" }}>
                          <span
                            className="badge"
                            style={RESCHEDULE_BADGE_STYLE}
                            data-testid={`admin-reschedule-pending-${r.reservationNumber}`}
                          >
                            改期審核中 {r.pendingRescheduleRequest.requestNumber}
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px" }}>
                      {r.checkedOutAt ? (
                        <div>
                          <div className="mono">{formatIsoToTaipeiDateTime(r.checkedOutAt)}</div>
                          <div className="muted" style={{ fontSize: "11px" }}>
                            經手：{r.checkedOutByName ?? "管理員"}
                            {r.checkedOutByUsername ? ` (${r.checkedOutByUsername})` : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px" }}>
                      {r.returnedAt ? (
                        <div>
                          <div className="mono">{formatIsoToTaipeiDateTime(r.returnedAt)}</div>
                          <div className="muted" style={{ fontSize: "11px" }}>
                            經手：{r.returnedByName ?? "管理員"}
                            {r.returnedByUsername ? ` (${r.returnedByUsername})` : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px" }}>
                      {r.reviewedAt ? (
                        <div>
                          <div>
                            {r.reviewedByDisplayName ?? "管理員"}（
                            <span className="mono">{formatIsoToTaipeiDateTime(r.reviewedAt)}</span>
                            ）
                          </div>
                          {r.rejectReason && (
                            <div
                              style={{ color: "var(--danger)", marginTop: "2px" }}
                              data-testid={`admin-reject-reason-${r.reservationNumber}`}
                            >
                              原因：{r.rejectReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="mono" style={{ padding: "13px 16px", fontSize: "12px" }}>
                      <div>建立：{formatIsoToTaipeiDateTime(r.createdAt)}</div>
                      {r.cancelledAt && (
                        <div className="muted">
                          取消：{formatIsoToTaipeiDateTime(r.cancelledAt)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {r.canPickup ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-loan"
                          disabled={pickupProcessingId === r.id}
                          data-testid={`pickup-btn-${r.reservationNumber}`}
                          onClick={() => void handlePickup(r)}
                        >
                          {pickupProcessingId === r.id
                            ? UI_TEXT.actions.pickupProcessing
                            : UI_TEXT.actions.pickup}
                        </button>
                      ) : r.canReturn ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-returned"
                          disabled={returnProcessingId === r.id}
                          data-testid={`return-btn-${r.reservationNumber}`}
                          onClick={() => void handleReturn(r)}
                        >
                          {returnProcessingId === r.id
                            ? UI_TEXT.actions.returnProcessing
                            : UI_TEXT.actions.returnEquipment}
                        </button>
                      ) : r.status === "confirmed" && r.reservationDate > todayStr ? (
                        <span
                          className="muted"
                          style={{ fontSize: "12px" }}
                          data-testid={`pickup-hint-${r.reservationNumber}`}
                        >
                          非當日預約（限當日領取）
                        </span>
                      ) : r.status === "confirmed" ? (
                        <span
                          className="muted"
                          style={{ fontSize: "12px" }}
                          data-testid={`pickup-hint-${r.reservationNumber}`}
                        >
                          時段已結束未領（逾期不可領取）
                        </span>
                      ) : r.status === "returned" ? (
                        <span
                          className="muted"
                          style={{ fontSize: "12px" }}
                          data-testid={`return-hint-${r.reservationNumber}`}
                        >
                          已完成歸還結案
                        </span>
                      ) : r.status === "pending_approval" ? (
                        <span className="muted" style={{ fontSize: "12px" }}>
                          請先於上方待審清單審核
                        </span>
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>
                          無可用操作
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          data-testid="reject-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(15, 23, 42, 0.55)",
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
        >
          <div className="card" style={{ width: "100%", maxWidth: "520px", padding: "24px" }}>
            <h2 id="reject-modal-title">駁回待審核預約申請</h2>
            <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
              駁回後該筆申請狀態將更新為「已駁回」並保留於全體預約歷史紀錄中；您可選填最多 200
              字的駁回原因供申請成員查閱：
            </p>

            <div
              style={{
                margin: "14px 0 16px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "var(--surface-muted)",
                border: "1px solid var(--line)",
                fontSize: "14px",
                display: "grid",
                gap: "6px",
              }}
            >
              <div>
                <strong>預約編號：</strong>
                <span className="mono">{rejectTarget.reservationNumber}</span>｜
                <strong>申請成員：</strong>
                {rejectTarget.userDisplayName} (
                <span className="mono">{rejectTarget.username}</span>)
              </div>
              <div>
                <strong>借用設備：</strong>
                <span className="mono">{rejectTarget.equipmentCode}</span>{" "}
                {rejectTarget.equipmentName}
              </div>
              <div>
                <strong>申請時段：</strong>
                <span className="mono">
                  {rejectTarget.reservationDate} {rejectTarget.slotName}{" "}
                  {rejectTarget.slotStartTime}–{rejectTarget.slotEndTime}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label htmlFor="reject-reason-input" style={{ fontWeight: 600 }}>
                  駁回原因（選填，上限 200 字）
                </label>
                <span
                  className="mono muted"
                  style={{ fontSize: "12px" }}
                  data-testid="reject-char-count"
                >
                  {rejectReasonInput.trim().length} / 200 字
                </span>
              </div>
              <textarea
                id="reject-reason-input"
                data-testid="reject-reason-input"
                rows={3}
                value={rejectReasonInput}
                onChange={(e) => {
                  setRejectReasonInput(e.target.value);
                  if (e.target.value.trim().length <= 200) {
                    setRejectError("");
                  }
                }}
                placeholder="可選填駁回原因供申請成員查閱（最多 200 字）"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${rejectError ? "var(--danger)" : "var(--line)"}`,
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  font: "inherit",
                  resize: "vertical",
                }}
              />
              {rejectError && (
                <div
                  role="alert"
                  data-testid="reject-reason-error"
                  style={{
                    marginTop: "6px",
                    color: "var(--danger)",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {rejectError}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn"
                disabled={reviewingId === rejectTarget.id}
                onClick={() => setRejectTarget(null)}
              >
                返回
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={reviewingId === rejectTarget.id}
                data-testid="confirm-reject-submit-btn"
                onClick={() => void handleConfirmReject()}
              >
                {reviewingId === rejectTarget.id ? "審核處理中…" : "確認駁回申請"}
              </button>
            </div>
          </div>
        </div>
      )}
      {rescheduleRejectTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rr-reject-modal-title"
          data-testid="rr-reject-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(15, 23, 42, 0.55)",
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
        >
          <div className="card" style={{ width: "100%", maxWidth: "520px", padding: "24px" }}>
            <h2 id="rr-reject-modal-title">駁回改期申請</h2>
            <dl
              style={{
                margin: "14px 0",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "6px 12px",
                fontSize: "14px",
              }}
            >
              <dt className="muted">改期申請</dt>
              <dd className="mono" style={{ margin: 0 }}>
                {rescheduleRejectTarget.requestNumber}
              </dd>
              <dt className="muted">成員</dt>
              <dd style={{ margin: 0 }}>{rescheduleRejectTarget.userDisplayName}</dd>
              <dt className="muted">設備</dt>
              <dd style={{ margin: 0 }}>
                {rescheduleRejectTarget.equipmentCode} {rescheduleRejectTarget.equipmentName}
              </dd>
              <dt className="muted">原時段</dt>
              <dd className="mono" style={{ margin: 0 }}>
                {slotRangeText(
                  rescheduleRejectTarget.fromReservationDate,
                  rescheduleRejectTarget.fromSlot,
                )}
              </dd>
              <dt className="muted">新時段</dt>
              <dd className="mono" style={{ margin: 0 }}>
                {slotRangeText(
                  rescheduleRejectTarget.toReservationDate,
                  rescheduleRejectTarget.toSlot,
                )}
              </dd>
            </dl>
            <div
              style={{
                margin: "12px 0",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                border: "1px solid var(--line)",
                background: "var(--surface-muted)",
              }}
            >
              駁回後，成員的原預約不會變動。
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="rr-reject-reason-input"
                style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}
              >
                駁回原因（選填，最多 200 字）
              </label>
              <textarea
                id="rr-reject-reason-input"
                data-testid="rr-reject-reason-input"
                rows={3}
                value={rescheduleRejectReason}
                disabled={rejectingReschedule}
                onChange={(e) => {
                  setRescheduleRejectReason(e.target.value);
                  if (Array.from(e.target.value).length <= 200) setRescheduleRejectError("");
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${rescheduleRejectError ? "var(--danger)" : "var(--line)"}`,
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  font: "inherit",
                  resize: "vertical",
                }}
              />
              <div
                className="mono"
                data-testid="rr-reject-char-count"
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  textAlign: "right",
                  marginTop: "4px",
                }}
              >
                {Array.from(rescheduleRejectReason).length} / 200
              </div>
              {rescheduleRejectError && (
                <div
                  role="alert"
                  data-testid="rr-reject-reason-error"
                  style={{ marginTop: "6px", color: "var(--danger)", fontSize: "13px" }}
                >
                  {rescheduleRejectError}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn"
                disabled={rejectingReschedule}
                data-testid="rr-reject-close-btn"
                onClick={() => setRescheduleRejectTarget(null)}
              >
                返回
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={rejectingReschedule}
                data-testid="rr-reject-confirm-btn"
                onClick={() => void handleConfirmRescheduleReject()}
              >
                {rejectingReschedule ? "駁回中…" : "確認駁回"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
