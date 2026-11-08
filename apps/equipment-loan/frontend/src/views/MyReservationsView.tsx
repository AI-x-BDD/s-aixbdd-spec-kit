import React, { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "../api/client";

export interface ReservationItem {
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

export interface ReservationPage {
  items: ReservationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
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

interface MyReservationsViewProps {
  onGoToBooking: () => void;
}

export function MyReservationsView({ onGoToBooking }: MyReservationsViewProps): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "confirmed" | "cancelled">("ALL");
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingCancel, setPendingCancel] = useState<ReservationItem | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [banner, setBanner] = useState<{
    tone: "danger" | "success" | "info";
    text: string;
    showRebookBtn?: boolean;
  } | null>(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "50",
      });
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      const data = await apiRequest<ReservationPage>(`/reservations?${params.toString()}`);
      setReservations(data.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "載入個人預約紀錄失敗。";
      setBanner({ tone: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const handleConfirmCancel = async (): Promise<void> => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      const updated = await apiRequest<ReservationItem>(
        `/reservations/${pendingCancel.id}/cancel`,
        {
          method: "POST",
        },
      );
      setPendingCancel(null);
      setBanner({
        tone: "success",
        text: `已取消預約 ${updated.reservationNumber}（${updated.equipmentCode} ${updated.equipmentName}，${updated.reservationDate} ${updated.slotName} ${updated.slotStartTime}–${updated.slotEndTime}），該時段已立即恢復為可預約狀態。`,
        showRebookBtn: true,
      });
      await loadReservations();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "取消預約失敗，請稍後再試。";
      setPendingCancel(null);
      setBanner({ tone: "danger", text: msg });
      await loadReservations();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h1>我的設備預約紀錄與取消管理</h1>
      <p className="page-lead">
        預設依預約日期由新到舊、固定時段順序及建立時間排序；尚未到達開始時間的有效預約可於此取消並立即釋出時段。
      </p>

      {banner && (
        <div
          className={`banner banner-${banner.tone}`}
          role="alert"
          data-testid="my-reservations-banner"
        >
          <span>{banner.text}</span>
          {banner.showRebookBtn && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={onGoToBooking}
              data-testid="banner-go-booking"
            >
              前往設備預約重新預約
            </button>
          )}
        </div>
      )}

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
          aria-label="預約狀態篩選"
        >
          {(
            [
              { value: "ALL", label: "全部紀錄" },
              { value: "confirmed", label: "有效預約（本人已預約）" },
              { value: "cancelled", label: "已取消歷史紀錄" },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                data-testid={`filter-tab-${tab.value}`}
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

        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={onGoToBooking}
          data-testid="go-to-booking-btn"
        >
          新增設備預約
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "24px", color: "var(--muted)" }}>
          正在載入您的預約紀錄…
        </div>
      ) : reservations.length === 0 ? (
        <div className="card" style={{ padding: "44px 24px", textAlign: "center" }}>
          <h2>您目前還沒有任何設備預約紀錄</h2>
          <p className="muted">
            前往預建設備清單選擇日期與固定時段，送出後即可在此查看與管理預約。
          </p>
          <button type="button" className="btn btn-primary" onClick={onGoToBooking}>
            前往設備預約
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {reservations.map((r) => {
            const isConfirmed = r.status === "confirmed";
            return (
              <article
                key={r.id}
                className="card"
                data-testid={`reservation-card-${r.reservationNumber}`}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
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
                    <span className={`badge ${isConfirmed ? "badge-mine" : "badge-cancelled"}`}>
                      {isConfirmed ? "本人已預約（有效）" : "已取消"}
                    </span>
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
                    <span>
                      取消時間：
                      <span className="mono">{formatIsoToTaipeiDateTime(r.cancelledAt)}</span>
                    </span>
                  </div>
                </div>

                <div>
                  {isConfirmed ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      data-testid={`cancel-btn-${r.reservationNumber}`}
                      onClick={() => setPendingCancel(r)}
                    >
                      取消預約
                    </button>
                  ) : (
                    <span className="muted" style={{ fontSize: "13px" }}>
                      已取消紀錄
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
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
            <h2 id="modal-title">確認取消設備預約</h2>
            <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
              取消後該筆預約狀態將更新為「已取消」並保留於歷史紀錄中，同時立即釋出該時段供重新預約：
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
                {cancelling ? "取消處理中…" : "確認取消並釋出時段"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
