import React, { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "../App";
import { ApiError, apiRequest } from "../api/client";
import type { EquipmentAvailabilityItem, EquipmentAvailabilityPage } from "./EquipmentBookingView";
import type { ReservationItem } from "./MyReservationsView";

export interface AdminReservationItem extends ReservationItem {
  username: string;
  userDisplayName: string;
}

export interface AdminReservationPage {
  items: AdminReservationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

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
  const [equipments, setEquipments] = useState<EquipmentAvailabilityItem[]>([]);
  const [reservations, setReservations] = useState<AdminReservationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "confirmed" | "cancelled">("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(currentUser.role === "admin");
  const [forbidden, setForbidden] = useState<boolean>(currentUser.role !== "admin");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
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

      const [eqData, resData] = await Promise.all([
        apiRequest<EquipmentAvailabilityPage>(`/equipments?date=${today}&page=1&pageSize=50`),
        apiRequest<AdminReservationPage>(`/admin/reservations?${resParams.toString()}`),
      ]);

      setEquipments(eqData.items);
      setReservations(resData.items);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      } else {
        setErrorMessage(err instanceof ApiError ? err.message : "載入管理員總覽資料失敗。");
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, equipmentFilter]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  if (forbidden || currentUser.role !== "admin") {
    return (
      <div>
        <h1>管理員預建設備與全體成員預約總覽</h1>
        <p className="page-lead">
          集中檢視組織內所有預建單件獨立設備，以及全體成員的有效與已取消預約紀錄（預設依預約日期由新到舊、固定時段順序及建立時間排序）。
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
          <h2>權限不足：拒絕存取管理員全體預約清單</h2>
          <p className="muted" style={{ margin: "8px 0 22px" }}>
            權限不足：「管理員全體成員預約清單」僅供管理員（admin）角色存取，您目前的身分為一般成員（
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
      <h1>管理員預建設備與全體成員預約總覽</h1>
      <p className="page-lead">
        集中檢視組織內所有預建單件獨立設備，以及全體成員的有效與已取消預約紀錄（預設依預約日期由新到舊、固定時段順序及建立時間排序）。
      </p>

      {errorMessage && (
        <div className="banner banner-danger" role="alert">
          <span>{errorMessage}</span>
        </div>
      )}

      <h2>預建單件獨立設備清單（共 {equipments.length} 台）</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {equipments.map((eq) => (
          <div
            key={eq.id}
            className="card"
            data-testid={`admin-eq-card-${eq.equipmentCode}`}
            style={{ padding: "16px", display: "grid", gap: "6px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
              <span className="badge badge-available">{eq.isActive ? "可供借用" : "暫停借用"}</span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{eq.name}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>分類：{eq.category}</div>
          </div>
        ))}
      </div>

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
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "confirmed" | "cancelled")}
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
            <option value="ALL">全部狀態（有效＋已取消）</option>
            <option value="confirmed">有效預約 (confirmed)</option>
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
          正在載入全組織預建設備與全體成員預約紀錄…
        </div>
      ) : reservations.length === 0 ? (
        <div className="card" style={{ padding: "44px 24px", textAlign: "center" }}>
          <h2>目前沒有符合篩選條件的成員預約紀錄</h2>
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
                  預約日期
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  固定時段
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  預約狀態
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  建立時間
                </th>
                <th style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  取消時間
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const isConfirmed = r.status === "confirmed";
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
                      {r.reservationDate}
                    </td>
                    <td className="mono" style={{ padding: "13px 16px" }}>
                      {r.slotName} {r.slotStartTime}–{r.slotEndTime}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span className={`badge ${isConfirmed ? "badge-mine" : "badge-cancelled"}`}>
                        {isConfirmed ? "有效預約" : "已取消"}
                      </span>
                    </td>
                    <td className="mono" style={{ padding: "13px 16px" }}>
                      {formatIsoToTaipeiDateTime(r.createdAt)}
                    </td>
                    <td className="mono" style={{ padding: "13px 16px" }}>
                      {formatIsoToTaipeiDateTime(r.cancelledAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
