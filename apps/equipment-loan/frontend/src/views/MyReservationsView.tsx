import React, { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  apiRequest,
  listMyLoanReservations,
  withdrawRescheduleRequest,
  type CreateRescheduleRequestResponse,
  type RescheduleRequest,
  type RescheduleRequestStatus,
  type ReservationDto,
  type ReservationPageDto,
  type ReservationStatus,
} from "../api/client";
import { RescheduleDialog } from "../components/RescheduleDialog";
import { UI_TEXT } from "../text/zh-TW";

export type ReservationItem = ReservationDto;
export type ReservationPage = ReservationPageDto;

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

function formatSlotText(
  date: string,
  slot: { slotName: string; startTime: string; endTime: string },
) {
  return `${date} ${slot.slotName} ${slot.startTime}–${slot.endTime}`;
}

const RESCHEDULE_STATUS_BADGE: Record<RescheduleRequestStatus, string> = {
  pending_approval: "badge-pending",
  approved: "badge-available",
  rejected: "badge-cancelled",
  withdrawn: "badge-occupied",
  expired: "badge-occupied",
};

/** 改期紀錄「說明」欄（ui/my-reservations.html historyNote；失效原因文字見 tasks.md Notes 待確認 2）。 */
function rescheduleHistoryNote(rr: RescheduleRequest): string {
  switch (rr.status) {
    case "approved":
      return rr.reviewedBy === null
        ? "免審核設備，送出時立即改期"
        : `審核管理員 ${rr.reviewedByDisplayName ?? "管理員"}`;
    case "rejected":
      return `駁回原因：${rr.rejectReason || "（未填寫）"}｜審核管理員 ${rr.reviewedByDisplayName ?? "管理員"}`;
    case "withdrawn":
      return `撤回時間 ${formatIsoToTaipeiDateTime(rr.withdrawnAt)}`;
    case "expired":
      return `失效原因：${rr.expireReason ? UI_TEXT.rescheduleExpireReason[rr.expireReason] : "—"}｜失效時間 ${formatIsoToTaipeiDateTime(rr.expiredAt)}`;
    default:
      return "等待管理員審核；核准前原預約照常有效";
  }
}

/** 「改期審核中」標籤：琥珀色虛線框（ui/plan.md §2） */
const RESCHEDULE_PENDING_TAG_STYLE: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--pending)",
  border: "1px dashed var(--pending)",
};

type ReservationListFilter = "ALL" | "RESCHEDULE_PENDING" | ReservationStatus;

interface MyReservationsViewProps {
  onGoToBooking: (targetDate?: string) => void;
}

/** 琥珀色橫幅（改期審核中），沿用 index.html 的 --pending 與 --pending-soft 色彩 */
const PENDING_BANNER_STYLE: React.CSSProperties = {
  background: "var(--pending-soft)",
  color: "var(--pending)",
  borderColor: "var(--pending)",
};

export function MyReservationsView({ onGoToBooking }: MyReservationsViewProps): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState<ReservationListFilter>("ALL");
  const [reschedulePendingCount, setReschedulePendingCount] = useState<number>(0);
  const [activeLoans, setActiveLoans] = useState<ReservationItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingCancel, setPendingCancel] = useState<ReservationItem | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  // 撤回改期申請的確認對話框（FR-010）
  const [pendingWithdraw, setPendingWithdraw] = useState<{
    reservation: ReservationItem;
    request: RescheduleRequest;
  } | null>(null);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [banner, setBanner] = useState<{
    tone: "danger" | "success" | "info" | "pending";
    text: string;
    showRebookBtn?: boolean;
    rebookDate?: string;
    rebookText?: string;
  } | null>(null);
  const [rescheduling, setRescheduling] = useState<ReservationItem | null>(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "50",
      });
      if (statusFilter === "RESCHEDULE_PENDING") {
        params.set("hasPendingRescheduleRequest", "true");
      } else if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      const [activeLoanData, listData, reschedulePendingData] = await Promise.all([
        listMyLoanReservations({ status: "checked_out", page: 1, pageSize: 50 }),
        apiRequest<ReservationPage>(`/reservations?${params.toString()}`),
        // 篩選列「改期審核中（n）」的筆數（FR-009）
        listMyLoanReservations({ hasPendingRescheduleRequest: true, page: 1, pageSize: 1 }),
      ]);
      setActiveLoans(activeLoanData.items);
      setReservations(listData.items);
      setReschedulePendingCount(reschedulePendingData.totalItems);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "載入個人預約與借用紀錄失敗。";
      setBanner({ tone: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const handleConfirmWithdraw = async (): Promise<void> => {
    if (!pendingWithdraw) return;
    const { reservation, request } = pendingWithdraw;
    setWithdrawing(true);
    try {
      const withdrawn = await withdrawRescheduleRequest(request.id);
      setPendingWithdraw(null);
      setBanner({
        tone: "success",
        text: `已撤回改期申請 ${withdrawn.requestNumber}。預約 ${reservation.reservationNumber} 仍為 ${reservation.reservationDate} ${reservation.slotName} ${reservation.slotStartTime}–${reservation.slotEndTime} 的「已核准／有效」。`,
      });
      await loadReservations();
    } catch (err) {
      // INVALID_RESCHEDULE_STATUS 等錯誤：頁頂紅色橫幅顯示後端訊息（含目前狀態與時間，Notes 待確認 4），並重新載入紀錄
      const msg = err instanceof ApiError ? err.message : "撤回改期申請失敗，請稍後再試。";
      setPendingWithdraw(null);
      setBanner({ tone: "danger", text: msg });
      await loadReservations();
    } finally {
      setWithdrawing(false);
    }
  };

  const handleConfirmCancel = async (): Promise<void> => {
    if (!pendingCancel) return;
    const wasPending = pendingCancel.status === "pending_approval";
    // FR-013：取消前的改期審核中申請，取消成功後同時變成「改期已失效」
    const pendingReschedule = pendingCancel.pendingRescheduleRequest;
    setCancelling(true);
    try {
      const updated = await apiRequest<ReservationItem>(
        `/reservations/${pendingCancel.id}/cancel`,
        {
          method: "POST",
        },
      );
      setPendingCancel(null);
      if (wasPending) {
        setBanner({
          tone: "success",
          text: `已取消待審核申請 ${updated.reservationNumber}（${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}），已自管理員待審清單移除並保留歷史紀錄。`,
          showRebookBtn: true,
          rebookDate: updated.reservationDate,
        });
      } else {
        setBanner({
          tone: "success",
          text: `已取消已核准／有效預約 ${updated.reservationNumber}（${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}），該時段已立即釋出恢復為可預約狀態。${
            pendingReschedule
              ? `改期申請 ${pendingReschedule.requestNumber} 已同時變成「改期已失效」。`
              : ""
          }`,
          showRebookBtn: true,
          rebookDate: updated.reservationDate,
        });
      }
      await loadReservations();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "取消預約申請失敗，請稍後再試。";
      setPendingCancel(null);
      setBanner({ tone: "danger", text: msg });
      await loadReservations();
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleSuccess = (result: CreateRescheduleRequestResponse): void => {
    setRescheduling(null);
    const { rescheduleRequest: rr, reservation: updated } = result;
    if (rr.status === "approved") {
      setBanner({
        tone: "success",
        text: `改期成功：預約 ${updated.reservationNumber}（${updated.equipmentCode} ${updated.equipmentName}）已改到 ${rr.toReservationDate} ${rr.toSlot.slotName} ${rr.toSlot.startTime}–${rr.toSlot.endTime}，預約編號與「已核准／有效」狀態不變；原時段 ${rr.fromReservationDate} ${rr.fromSlot.slotName} ${rr.fromSlot.startTime}–${rr.fromSlot.endTime} 已釋出。`,
        showRebookBtn: true,
        rebookDate: rr.toReservationDate,
        rebookText: "到設備預約查看時段",
      });
    } else if (rr.status === "pending_approval") {
      // 需人工審核設備（FR-003）：原預約維持原時段，新時段不保留
      setBanner({
        tone: "pending",
        text: `改期申請 ${rr.requestNumber} 已送出，目前為「改期審核中」。管理員核准前，預約 ${updated.reservationNumber} 仍為 ${rr.fromReservationDate} ${rr.fromSlot.slotName} ${rr.fromSlot.startTime}–${rr.fromSlot.endTime} 的「已核准／有效」；新時段 ${rr.toReservationDate} ${rr.toSlot.slotName} ${rr.toSlot.startTime}–${rr.toSlot.endTime} 不會替您保留。`,
      });
    }
    void loadReservations();
  };

  const handleRescheduleError = (err: ApiError): boolean => {
    // RESCHEDULE_ALREADY_PENDING（FR-004）：頁頂紅色橫幅顯示須先撤回的提示
    if (err.code !== "RESCHEDULE_NOT_ALLOWED" && err.code !== "RESCHEDULE_ALREADY_PENDING") {
      return false;
    }
    setRescheduling(null);
    setBanner({ tone: "danger", text: err.message });
    void loadReservations();
    return true;
  };

  return (
    <div>
      <h1>我的借用中設備與 6 態預約狀態查詢</h1>
      <p className="page-lead">
        頁頂「目前借用中設備」醒目區塊即時列出本人已領取尚未歸還的設備；下方清單支援依全部 6
        種狀態（待審核、已核准／有效、借用中、已歸還、已駁回、已取消）篩選並檢視領取時間與歸還時間。一旦設備完成現場登記領取後即禁止取消預約。
      </p>

      {banner && (
        <div
          className={`banner banner-${banner.tone}`}
          style={banner.tone === "pending" ? PENDING_BANNER_STYLE : undefined}
          role="alert"
          data-testid="my-reservations-banner"
        >
          <span>{banner.text}</span>
          {banner.showRebookBtn && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onGoToBooking(banner.rebookDate)}
              data-testid="banner-go-booking"
            >
              {banner.rebookText ?? "前往設備預約重新預約"}
            </button>
          )}
        </div>
      )}

      <section
        className="card"
        aria-label="目前借用中設備醒目區塊"
        data-testid="active-loans-section"
        style={{
          marginBottom: "24px",
          padding: "20px 22px",
          border: "2px solid var(--loan)",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "14px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>目前借用中設備</h2>
            <span className="badge badge-loan" data-testid="active-loans-count">
              借用中 {activeLoans.length} 件
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => onGoToBooking()}
            data-testid="go-to-booking-btn"
          >
            前往設備預約
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div
            data-testid="active-loans-empty"
            style={{
              padding: "22px 18px",
              borderRadius: "10px",
              background: "var(--surface-muted)",
              border: "1px dashed var(--line)",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "14px",
            }}
          >
            目前名下沒有借用中的設備。當您於預約當日到現場由管理員完成「登記領取」後，借用中的設備與領取時間會立即顯示於此區塊。
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {activeLoans.map((r) => (
              <div
                key={r.id}
                data-testid={`active-loan-item-${r.reservationNumber}`}
                style={{
                  padding: "16px 18px",
                  borderRadius: "10px",
                  background: "var(--loan-soft)",
                  border: "1px solid var(--loan)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "grid", gap: "6px", flex: 1, minWidth: "260px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="mono" style={{ fontWeight: 700 }}>
                      {r.reservationNumber}
                    </span>
                    <span className="badge badge-loan">借用中</span>
                    <span className="mono" style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {r.equipmentCode}
                    </span>
                    <strong>{r.equipmentName}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    <span>
                      預約日期：<strong className="mono">{r.reservationDate}</strong>
                    </span>
                    <span>
                      固定時段：
                      <strong className="mono">
                        {r.slotName} {r.slotStartTime}–{r.slotEndTime}
                      </strong>
                    </span>
                    <span>
                      領取時間：
                      <strong className="mono">{formatIsoToTaipeiDateTime(r.checkedOutAt)}</strong>
                    </span>
                    <span>
                      領取經手管理員：<strong>{r.checkedOutByName ?? "管理員"}</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                    已領取設備禁止自行取消預約；使用完畢後請將設備帶回現場由管理員執行「登記歸還」。
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    已領取借用中（不可取消）
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
          role="group"
          aria-label="預約與借用 6 態狀態篩選"
        >
          {(
            [
              { value: "ALL", label: "全部紀錄" },
              {
                value: "RESCHEDULE_PENDING",
                label: `改期審核中（${reschedulePendingCount}）`,
                testId: "filter-tab-reschedule_pending",
              },
              { value: "pending_approval", label: "待審核" },
              { value: "confirmed", label: "已核准／有效" },
              { value: "checked_out", label: "借用中" },
              { value: "returned", label: "已歸還" },
              { value: "rejected", label: "已駁回" },
              { value: "cancelled", label: "已取消" },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                data-testid={"testId" in tab ? tab.testId : `filter-tab-${tab.value}`}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  padding: "6px 14px",
                  border: `1px solid ${active ? "var(--primary)" : "var(--line)"}`,
                  borderRadius: "8px",
                  background: active ? "var(--primary)" : "var(--surface)",
                  color: active ? "#ffffff" : "var(--muted)",
                  fontWeight: active ? 600 : 400,
                  fontSize: "13px",
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
          正在載入目前借用中設備與 6 態借還歷史紀錄…
        </div>
      ) : reservations.length === 0 ? (
        <div
          className="card"
          style={{ padding: "44px 24px", textAlign: "center" }}
          data-testid="reservations-empty"
        >
          <h2>目前沒有符合篩選條件的預約</h2>
          <p className="muted">切換其他篩選條件，或到設備預約建立新的預約。</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStatusFilter("ALL")}
              data-testid="empty-show-all-btn"
            >
              顯示全部預約
            </button>
            <button type="button" className="btn" onClick={() => onGoToBooking()}>
              前往設備預約
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {reservations.map((r) => {
            const canCancel =
              r.canCancel && (r.status === "pending_approval" || r.status === "confirmed");
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
              <article
                key={r.id}
                className="card"
                data-testid={`reservation-card-${r.reservationNumber}`}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "grid", gap: "6px", flex: 1, minWidth: "260px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted)",
                      }}
                    >
                      {r.reservationNumber}
                    </span>
                    <span
                      className={`badge ${badgeClass}`}
                      data-testid={`status-badge-${r.reservationNumber}`}
                    >
                      {UI_TEXT.reservationStatus[r.status]}
                    </span>
                    {r.pendingRescheduleRequest && (
                      <span
                        className="badge"
                        style={RESCHEDULE_PENDING_TAG_STYLE}
                        data-testid={`reschedule-pending-badge-${r.reservationNumber}`}
                      >
                        {UI_TEXT.rescheduleStatus.pending_approval}
                      </span>
                    )}
                    <span
                      className="mono"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--primary)",
                      }}
                    >
                      {r.equipmentCode}
                    </span>
                    <span
                      className={`badge ${r.equipmentRequiresApproval ? "badge-pending" : "badge-available"}`}
                    >
                      {r.equipmentRequiresApproval
                        ? UI_TEXT.approvalModes.requiresApproval
                        : UI_TEXT.approvalModes.noApproval}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    {r.equipmentName}
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    <span>
                      預約日期：<strong className="mono">{r.reservationDate}</strong>
                    </span>
                    <span>
                      固定時段：
                      <strong className="mono">
                        {r.slotName} {r.slotStartTime}–{r.slotEndTime}
                      </strong>
                    </span>
                    <span>
                      建立時間：
                      <span className="mono">{formatIsoToTaipeiDateTime(r.createdAt)}</span>
                    </span>
                    {r.reviewedAt && (
                      <span>
                        審核資訊：
                        <span className="mono">
                          {r.reviewedByDisplayName
                            ? `${r.reviewedByDisplayName} 於 ${formatIsoToTaipeiDateTime(r.reviewedAt)}`
                            : formatIsoToTaipeiDateTime(r.reviewedAt)}
                        </span>
                      </span>
                    )}
                    <span>
                      領取時間：
                      <span className="mono">{formatIsoToTaipeiDateTime(r.checkedOutAt)}</span>
                    </span>
                    <span>
                      歸還時間：
                      <span className="mono">{formatIsoToTaipeiDateTime(r.returnedAt)}</span>
                    </span>
                    {r.cancelledAt && (
                      <span>
                        取消時間：
                        <span className="mono">{formatIsoToTaipeiDateTime(r.cancelledAt)}</span>
                      </span>
                    )}
                  </div>

                  {(r.status === "checked_out" || r.status === "returned") && (
                    <div
                      data-testid={`loan-audit-${r.reservationNumber}`}
                      style={{
                        marginTop: "4px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "var(--surface-muted)",
                        border: "1px solid var(--line)",
                        fontSize: "13px",
                        display: "flex",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <strong>領取時間：</strong>
                        <span className="mono">{formatIsoToTaipeiDateTime(r.checkedOutAt)}</span>
                        （經手人：{r.checkedOutByName ?? "—"}）
                      </span>
                      <span>
                        <strong>歸還時間：</strong>
                        <span className="mono">
                          {r.returnedAt
                            ? formatIsoToTaipeiDateTime(r.returnedAt)
                            : "尚未歸還（借用中）"}
                        </span>
                        {r.returnedByName ? `（經手人：${r.returnedByName}）` : ""}
                      </span>
                    </div>
                  )}

                  {r.status === "confirmed" && !r.canCancel && (
                    <div
                      data-testid={`reschedule-note-${r.reservationNumber}`}
                      style={{
                        marginTop: "4px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "var(--surface-muted)",
                        border: "1px solid var(--line)",
                        fontSize: "13px",
                      }}
                    >
                      原時段已開始，不能申請改期或取消；請在時段結束前到現場由管理員登記領取。
                    </div>
                  )}

                  {r.status === "rejected" && r.rejectReason && (
                    <div
                      data-testid={`reject-reason-${r.reservationNumber}`}
                      style={{
                        marginTop: "4px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "var(--danger-soft)",
                        color: "var(--danger)",
                        fontSize: "13px",
                      }}
                    >
                      <strong>駁回原因：</strong>
                      {r.rejectReason}
                    </div>
                  )}

                  {r.pendingRescheduleRequest && (
                    <div
                      data-testid={`reschedule-pending-note-${r.reservationNumber}`}
                      style={{
                        marginTop: "4px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "var(--pending-soft)",
                        border: "1px dashed var(--pending)",
                        fontSize: "13px",
                      }}
                    >
                      改期申請 {r.pendingRescheduleRequest.requestNumber}{" "}
                      審核中：要改到別的時段，請先撤回這筆申請再重新申請。
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {r.canReschedule && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      data-testid={`reschedule-btn-${r.reservationNumber}`}
                      onClick={() => setRescheduling(r)}
                    >
                      申請改期
                    </button>
                  )}
                  {canCancel ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      data-testid={`cancel-btn-${r.reservationNumber}`}
                      onClick={() => setPendingCancel(r)}
                    >
                      {r.status === "pending_approval" ? "取消待審申請" : "取消預約"}
                    </button>
                  ) : r.status === "checked_out" ? (
                    <span
                      data-testid={`non-cancel-note-${r.reservationNumber}`}
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "var(--surface-muted)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      已領取借用中（不可取消）
                    </span>
                  ) : r.status === "returned" ? (
                    <span
                      data-testid={`non-cancel-note-${r.reservationNumber}`}
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "var(--surface-muted)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      已完成歸還結案（不可取消）
                    </span>
                  ) : r.status === "confirmed" || r.status === "pending_approval" ? (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "var(--surface-muted)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      時段已開始（不可取消）
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm"
                      data-testid={`reapply-btn-${r.reservationNumber}`}
                      onClick={() => onGoToBooking(r.reservationDate)}
                    >
                      重新申請此時段
                    </button>
                  )}
                </div>

                {r.rescheduleRequests.length > 0 && (
                  <details
                    open
                    data-testid={`reschedule-history-${r.reservationNumber}`}
                    style={{
                      flexBasis: "100%",
                      borderTop: "1px solid var(--line)",
                      paddingTop: "10px",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--primary)",
                      }}
                    >
                      改期紀錄（{r.rescheduleRequests.length} 筆）
                    </summary>
                    <div style={{ overflowX: "auto", marginTop: "8px" }}>
                      <table
                        style={{
                          width: "100%",
                          minWidth: "760px",
                          borderCollapse: "collapse",
                          fontSize: "12px",
                        }}
                      >
                        <thead>
                          <tr>
                            {[
                              "改期申請",
                              "狀態",
                              "原日期時段",
                              "新日期時段",
                              "申請時間",
                              "審核時間",
                              "說明",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "8px",
                                  borderBottom: "1px solid var(--line)",
                                  textAlign: "left",
                                  color: "var(--muted)",
                                  fontWeight: 600,
                                  background: "var(--surface-muted)",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {r.rescheduleRequests.map((rr) => {
                            const cell: React.CSSProperties = {
                              padding: "8px",
                              borderBottom: "1px solid var(--line)",
                              textAlign: "left",
                              verticalAlign: "top",
                            };
                            return (
                              <tr key={rr.id} data-testid={`reschedule-row-${rr.requestNumber}`}>
                                <td className="mono" style={cell}>
                                  {rr.requestNumber}
                                </td>
                                <td style={cell}>
                                  <span
                                    className={`badge ${RESCHEDULE_STATUS_BADGE[rr.status]}`}
                                    data-testid={`reschedule-status-${rr.requestNumber}`}
                                  >
                                    {UI_TEXT.rescheduleStatus[rr.status]}
                                  </span>
                                </td>
                                <td className="mono" style={cell}>
                                  {formatSlotText(rr.fromReservationDate, rr.fromSlot)}
                                </td>
                                <td className="mono" style={cell}>
                                  {formatSlotText(rr.toReservationDate, rr.toSlot)}
                                </td>
                                <td className="mono" style={cell}>
                                  {formatIsoToTaipeiDateTime(rr.createdAt)}
                                </td>
                                <td className="mono" style={cell}>
                                  {formatIsoToTaipeiDateTime(rr.reviewedAt)}
                                </td>
                                <td
                                  style={cell}
                                  data-testid={`reschedule-note-${rr.requestNumber}`}
                                >
                                  {rescheduleHistoryNote(rr)}
                                  {rr.status === "pending_approval" && rr.canWithdraw && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      style={{ marginLeft: "8px" }}
                                      data-testid={`withdraw-btn-${rr.requestNumber}`}
                                      onClick={() =>
                                        setPendingWithdraw({ reservation: r, request: rr })
                                      }
                                    >
                                      {UI_TEXT.reschedule.withdraw}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      )}

      {rescheduling && (
        <RescheduleDialog
          reservation={rescheduling}
          myReservations={reservations}
          onClose={() => setRescheduling(null)}
          onSuccess={handleRescheduleSuccess}
          onSubmitError={handleRescheduleError}
        />
      )}

      {pendingCancel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          data-testid="cancel-confirm-modal"
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
          <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "24px" }}>
            <h2 id="modal-title">
              {pendingCancel.status === "pending_approval"
                ? "確認取消待審核申請"
                : "確認取消已核准／有效預約"}
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
              {pendingCancel.status === "pending_approval"
                ? "取消後該筆待審申請將自管理員待審清單移除，狀態更新為「已取消」並保留於歷史紀錄中："
                : "取消後該筆尚未領取的預約將更新為「已取消」並保留於歷史紀錄中，同時立即釋出該時段供重新預約："}
            </p>
            <div
              style={{
                margin: "14px 0 20px",
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
                <span className="mono">{pendingCancel.reservationNumber}</span>
              </div>
              <div>
                <strong>目前狀態：</strong>
                <span>{UI_TEXT.reservationStatus[pendingCancel.status]}</span>
              </div>
              <div>
                <strong>借用設備：</strong>
                <span className="mono">{pendingCancel.equipmentCode}</span>{" "}
                {pendingCancel.equipmentName}
              </div>
              <div>
                <strong>預約時段：</strong>
                <span className="mono">
                  {pendingCancel.reservationDate} {pendingCancel.slotName}{" "}
                  {pendingCancel.slotStartTime}–{pendingCancel.slotEndTime}
                </span>
              </div>
            </div>

            {pendingCancel.pendingRescheduleRequest && (
              <div
                role="note"
                data-testid="cancel-reschedule-notice"
                style={{
                  margin: "0 0 16px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "var(--pending-soft)",
                  border: "1px dashed var(--pending)",
                  fontSize: "13px",
                }}
              >
                這筆預約有一筆改期審核中的申請{" "}
                {pendingCancel.pendingRescheduleRequest.requestNumber}
                （改到{" "}
                {formatSlotText(
                  pendingCancel.pendingRescheduleRequest.toReservationDate,
                  pendingCancel.pendingRescheduleRequest.toSlot,
                )}
                ）。取消預約後，這筆申請會同時變成「改期已失效」並移出管理員的待審清單。
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn"
                disabled={cancelling}
                onClick={() => setPendingCancel(null)}
              >
                返回
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={cancelling}
                onClick={() => void handleConfirmCancel()}
                data-testid="confirm-cancel-submit-btn"
              >
                {cancelling
                  ? "取消處理中…"
                  : pendingCancel.status === "pending_approval"
                    ? "確認取消申請"
                    : "確認取消並釋出時段"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingWithdraw && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-modal-title"
          data-testid="withdraw-confirm-modal"
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
          <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "24px" }}>
            <h2 id="withdraw-modal-title">撤回改期申請</h2>
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
                <strong>改期申請：</strong>
                <span className="mono">{pendingWithdraw.request.requestNumber}</span>
              </div>
              <div>
                <strong>預約：</strong>
                <span className="mono">
                  {pendingWithdraw.reservation.reservationNumber}｜
                  {pendingWithdraw.reservation.equipmentCode}
                </span>
              </div>
              <div>
                <strong>原時段：</strong>
                <span className="mono">
                  {formatSlotText(
                    pendingWithdraw.request.fromReservationDate,
                    pendingWithdraw.request.fromSlot,
                  )}
                </span>
              </div>
              <div>
                <strong>新時段：</strong>
                <span className="mono">
                  {formatSlotText(
                    pendingWithdraw.request.toReservationDate,
                    pendingWithdraw.request.toSlot,
                  )}
                </span>
              </div>
            </div>
            <p className="muted" style={{ margin: "0 0 20px", fontSize: "13px" }}>
              撤回後，這筆申請變成「改期已撤回」並移出管理員的待審清單；預約{" "}
              {pendingWithdraw.reservation.reservationNumber} 維持原時段，不會變動。
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn"
                disabled={withdrawing}
                onClick={() => setPendingWithdraw(null)}
              >
                返回
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={withdrawing}
                onClick={() => void handleConfirmWithdraw()}
                data-testid="confirm-withdraw-submit-btn"
              >
                {withdrawing ? "撤回處理中…" : "確認撤回"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
