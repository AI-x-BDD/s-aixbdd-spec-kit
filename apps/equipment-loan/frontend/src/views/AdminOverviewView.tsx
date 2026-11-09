import React, { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "../App";
import {
  type AdminReservationItemDto,
  type AdminReservationPageDto,
  ApiError,
  apiRequest,
  approveReservationApi,
  type EquipmentAvailabilityPageDto,
  type EquipmentWithSlotsDto,
  fetchPendingReservations,
  rejectReservationApi,
  type ReservationStatus,
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
  const [equipments, setEquipments] = useState<EquipmentWithSlotsDto[]>([]);
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
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminReservationItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>("");
  const [rejectError, setRejectError] = useState<string>("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const today = getTaipeiTodayStr();
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
        apiRequest<EquipmentAvailabilityPageDto>(`/equipments?date=${today}&page=1&pageSize=50`),
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
          <h2>權限不足：拒絕存取管理員設備審核設定與待審核申請清單</h2>
          <p className="muted" style={{ margin: "8px 0 22px" }}>
            權限不足：「管理員設備審核設定與待審核申請清單」僅供管理員（admin）角色存取與操作，您目前的身分為一般成員（
            {currentUser.displayName}），系統已拒絕存取。
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
      <h1>管理員設備審核設定、待審清單與核准駁回</h1>
      <p className="page-lead">
        集中管理組織內預建單件設備的「需人工審核／免審核」設定、依預約日期由近到遠與申請時間由早到晚處理待審清單，並檢視全體成員的四種狀態預約紀錄。
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
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>分類：{eq.category}</div>
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
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>全體成員預約紀錄清單</strong>
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
            <option value="ALL">全部狀態</option>
            <option value="pending_approval">待審核 (pending_approval)</option>
            <option value="confirmed">已核准／有效 (confirmed)</option>
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
                  審核資訊／駁回原因
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  建立／取消時間
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const badgeClass =
                  r.status === "confirmed"
                    ? "badge-mine"
                    : r.status === "pending_approval"
                      ? "badge-pending"
                      : "badge-cancelled";

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
                      <span className={`badge ${badgeClass}`}>
                        {UI_TEXT.reservationStatus[r.status]}
                      </span>
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
