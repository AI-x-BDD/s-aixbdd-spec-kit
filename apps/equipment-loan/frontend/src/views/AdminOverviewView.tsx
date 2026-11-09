import React, { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "../App";
import {
  type AdminEquipmentSettingDto,
  type AdminReservationItemDto,
  type AdminReservationPageDto,
  ApiError,
  apiRequest,
  approveReservationApi,
  fetchAdminEquipments,
  fetchPendingReservations,
  pickupReservationByAdmin,
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

      const [eqData, pendingData, resData] = await Promise.all([
        fetchAdminEquipments(),
        fetchPendingReservations(
          equipmentFilter !== "ALL" ? { equipmentId: equipmentFilter } : undefined,
        ),
        apiRequest<AdminReservationPageDto>(`/admin/reservations?${resParams.toString()}`),
      ]);

      setEquipments(eqData.items);
      setPendingList(pendingData.items);
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
      setBanner({
        tone: "success",
        text: `已更新設備審核設定：${updated.equipmentCode} ${updated.name} 已設為「${updated.requiresApproval ? "需人工審核" : "免審核"}」；既有「已核准／有效」預約與既有「待審核」申請均維持原狀態與效力不變，新設定僅適用於後續新送出的預約申請。`,
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

  const handleOpenRejectModal = (item: AdminReservationItem): void => {
    setRejectTarget(item);
    setRejectReasonInput("");
    setRejectError("");
  };

  const handlePickup = async (item: AdminReservationItem): Promise<void> => {
    setPickupProcessingId(item.id);
    setBanner(null);
    try {
      const updated = await pickupReservationByAdmin(item.id);
      setBanner({
        tone: "success",
        text: `已完成登記領取！預約編號 ${updated.reservationNumber}（${updated.userDisplayName}，${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}）狀態已更新為「借用中」，記錄領取時間 ${formatIsoToTaipeiDateTime(updated.checkedOutAt)} 與領取經手管理員${updated.checkedOutByName ?? "管理員"}${updated.checkedOutByUsername ? ` (${updated.checkedOutByUsername})` : ""}。`,
      });
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
          <h2>權限不足：拒絕存取管理員審核與現場借還管理</h2>
          <p className="muted" style={{ margin: "8px 0 22px" }}>
            權限不足：「登記領取」、「登記歸還」與「審核及借用管理」僅供管理員（admin）角色執行，您目前的身分為一般成員（
            {currentUser.displayName}），系統已攔截拒絕操作。
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
          <div style={{ padding: "16px 0", color: "var(--muted)" }}>正在載入待審核申請清單…</div>
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
                        <span className="mono" style={{ color: "var(--primary)", fontWeight: 600 }}>
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
    </div>
  );
}
