import React, { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "../App";
import {
  ApiError,
  listOverdueNotifications,
  type OverdueNotification,
  resendOverdueNotification,
  type OverdueNotificationStatus,
} from "../api/client";
import { ResendUnknownDialog } from "../components/ResendUnknownDialog";
import { UI_TEXT } from "../text/zh-TW";

const TEXT = UI_TEXT.overdueNotifications;

/** T020 的 UI_TEXT 沒有涵蓋的文字（ui/plan.md §4 嘗試次數單位、§5「權限不足」），只在本畫面使用。 */
const FORBIDDEN_TEXT = {
  title: "權限不足",
  message: (displayName: string) =>
    `逾期通知紀錄、重送通知與立即檢查逾期只限管理員操作。您目前登入的身分是一般成員（${displayName}）。`,
  switchAccount: "切換管理員帳號登入",
};
const ATTEMPT_UNIT = "次";

const STATUS_OPTIONS: OverdueNotificationStatus[] = ["sending", "sent", "failed", "unknown"];

/** 單頁查詢筆數；ui/plan.md 沒有規劃分頁控制項，tasks.md Notes 待確認 4：以 page=1、pageSize=100 查詢。 */
const PAGE_SIZE = 100;

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/** 預約日期（日曆日期）加星期，例如 2026-11-10（二）。 */
function formatDateWithWeekday(dateStr: string): string {
  const weekday = WEEKDAYS[new Date(`${dateStr}T00:00:00Z`).getUTCDay()];
  return `${dateStr}（${weekday}）`;
}

/** UTC 時間點換算成 Asia/Taipei 的 YYYY-MM-DD HH:mm。 */
function formatTaipeiDateTime(iso: string): string {
  const at = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(at);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
  return `${date} ${time}`;
}

function StatusCell({ item }: { item: OverdueNotification }): React.ReactElement {
  return (
    <>
      <span className={`badge odn-badge-${item.status}`} data-testid="overdue-status-badge">
        {item.status === "sending" && <span className="odn-spinner" aria-hidden="true" />}
        {TEXT.status[item.status]}
      </span>
      {item.status === "sent" && item.sentAt && (
        <div className="odn-sent-line" data-testid="overdue-sent-at">
          {TEXT.sentAtLine} <span className="mono">{formatTaipeiDateTime(item.sentAt)}</span>
        </div>
      )}
      {item.status === "failed" && item.failureReason && (
        <div className="odn-reason-line" data-testid="overdue-failure-reason">
          {TEXT.failureReasonLine(TEXT.failureReason[item.failureReason])}
        </div>
      )}
      <span className="odn-meta">
        {TEXT.createdAtLabel} <span className="mono">{formatTaipeiDateTime(item.createdAt)}</span>
      </span>
    </>
  );
}

function LoanCell({ item }: { item: OverdueNotification }): React.ReactElement {
  if (item.loanReturned) {
    return (
      <>
        <span className="badge odn-badge-returned">{TEXT.loan.returned}</span>
        {item.returnedAt && (
          <span className="odn-meta">
            {TEXT.loan.returnedAtLabel}{" "}
            <span className="mono">{formatTaipeiDateTime(item.returnedAt)}</span>
          </span>
        )}
      </>
    );
  }
  return <span className="badge odn-badge-loan">{TEXT.loan.checkedOut}</span>;
}

function ActionCell({
  item,
  resending,
  onResend,
}: {
  item: OverdueNotification;
  /** 這一列正在重送，按鈕改為「重送中…」並停用 */
  resending: boolean;
  onResend: (item: OverdueNotification) => void;
}): React.ReactElement {
  if (item.canResend) {
    return (
      <button
        type="button"
        className={`btn btn-sm${item.status === "unknown" ? " btn-pending" : ""}`}
        disabled={resending}
        onClick={() => onResend(item)}
        data-testid={`overdue-resend-btn-${item.reservationNumber}`}
      >
        {resending ? TEXT.resending : TEXT.resend}
      </button>
    );
  }
  if (item.loanReturned && (item.status === "failed" || item.status === "unknown")) {
    return <span className="odn-action-note">{TEXT.loanReturnedNote}</span>;
  }
  return <span className="odn-action-note">—</span>;
}

interface OverdueNotificationsViewProps {
  currentUser: AuthenticatedUser;
  /** 權限不足卡片的「切換管理員帳號登入」 */
  onSwitchAccount: () => void;
}

/** 管理員的逾期通知紀錄：通知清單與狀態篩選（F1，ui/plan.md §4、§5 overdue-notifications.html）。 */
export function OverdueNotificationsView({
  currentUser,
  onSwitchAccount,
}: OverdueNotificationsViewProps): React.ReactElement {
  const [filter, setFilter] = useState<OverdueNotificationStatus | "all">("all");
  const [items, setItems] = useState<OverdueNotification[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  /** 已載入過一次：之後換篩選只淡化清單，不再回到整頁骨架 */
  const [loaded, setLoaded] = useState<boolean>(false);
  const [forbidden, setForbidden] = useState<boolean>(currentUser.role !== "admin");
  const [loadError, setLoadError] = useState<string>("");
  const [banner, setBanner] = useState<{ tone: "info" | "danger"; text: string } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [dialogTarget, setDialogTarget] = useState<OverdueNotification | null>(null);

  const load = useCallback(
    async (status: OverdueNotificationStatus | "all") => {
      if (currentUser.role !== "admin") {
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const page = await listOverdueNotifications({
          status: status === "all" ? undefined : status,
          page: 1,
          pageSize: PAGE_SIZE,
        });
        setItems(page.items);
        setTotalItems(page.totalItems);
        setLoaded(true);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setForbidden(true);
        } else {
          setLoadError(
            err instanceof ApiError ? err.message : "無法載入逾期通知紀錄，請稍後再試。",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [currentUser.role],
  );

  useEffect(() => {
    void load(filter);
  }, [load, filter]);

  /** 重送：不等送出結果；202 顯示「送出中」橫幅，409 顯示後端訊息，兩者都重新查詢清單（FR-005、FR-007、FR-008、FR-018）。 */
  async function doResend(item: OverdueNotification): Promise<void> {
    setResendingId(item.id);
    setBanner(null);
    try {
      await resendOverdueNotification(item.id);
      setBanner({ tone: "info", text: TEXT.banner.resent(item.reservationNumber) });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
        return;
      }
      setBanner({
        tone: "danger",
        text: err instanceof ApiError ? err.message : "重送失敗，請稍後再試。",
      });
    } finally {
      setResendingId(null);
    }
    await load(filter);
  }

  function handleResendClick(item: OverdueNotification): void {
    if (item.status === "unknown") {
      setDialogTarget(item);
      return;
    }
    void doResend(item);
  }

  function handleConfirmResend(): void {
    const target = dialogTarget;
    setDialogTarget(null);
    if (target) {
      void doResend(target);
    }
  }

  function handleRefresh(): void {
    setBanner(null);
    void load(filter);
  }

  if (forbidden) {
    return (
      <div data-testid="overdue-notifications-view">
        <style>{OVERDUE_NOTIFICATIONS_CSS}</style>
        <h1>{TEXT.title}</h1>
        <section className="card odn-forbidden" data-testid="overdue-forbidden">
          <h2 style={{ color: "var(--danger)", marginTop: 0 }}>{FORBIDDEN_TEXT.title}</h2>
          <p style={{ margin: 0 }}>{FORBIDDEN_TEXT.message(currentUser.displayName)}</p>
          <div className="odn-forbidden-actions">
            <button type="button" className="btn btn-primary" onClick={onSwitchAccount}>
              {FORBIDDEN_TEXT.switchAccount}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const hasFilter = filter !== "all";
  const initialLoading = loading && !loaded;
  const refreshing = loading && loaded;
  const showEmptyAll = !loading && !loadError && items.length === 0 && !hasFilter;
  const showEmptyFilter = !loading && !loadError && items.length === 0 && hasFilter;
  const showTable = loaded && items.length > 0;

  return (
    <div data-testid="overdue-notifications-view">
      <style>{OVERDUE_NOTIFICATIONS_CSS}</style>
      <h1>{TEXT.title}</h1>

      {banner && (
        <div
          className={`banner banner-${banner.tone}`}
          role="alert"
          data-testid="overdue-banner"
          data-tone={banner.tone}
        >
          {banner.text}
        </div>
      )}

      {loadError && (
        <div className="banner banner-danger" role="alert" data-testid="overdue-load-error">
          {loadError}
        </div>
      )}

      {initialLoading && (
        <section data-testid="overdue-loading">
          <div className="odn-loading-line">
            <span className="odn-spinner odn-spinner-lg" aria-hidden="true" />
            <span>{TEXT.loading}</span>
          </div>
          <div className="odn-skeleton" style={{ height: 40, marginBottom: 12 }} />
          <div className="odn-skeleton" style={{ height: 320 }} />
        </section>
      )}

      <section
        className="card odn-section"
        style={initialLoading ? { display: "none" } : undefined}
      >
        <div className="odn-section-head">
          <h2 style={{ margin: 0 }}>{TEXT.listTitle}</h2>
          <div className="odn-toolbar-actions">
            <button
              type="button"
              className="btn btn-sm"
              disabled={refreshing}
              onClick={handleRefresh}
              data-testid="overdue-refresh-btn"
            >
              {refreshing ? TEXT.refreshing : TEXT.refresh}
            </button>
          </div>
        </div>
        <div className="odn-toolbar">
          <div className="odn-field">
            <label htmlFor="overdue-status-filter">{TEXT.filterLabel}</label>
            <select
              id="overdue-status-filter"
              data-testid="overdue-status-filter"
              value={filter}
              disabled={refreshing}
              onChange={(e) => setFilter(e.target.value as OverdueNotificationStatus | "all")}
            >
              <option value="all">{TEXT.filterAll}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {TEXT.status[status]}
                </option>
              ))}
            </select>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {TEXT.sortHint}
          </span>
        </div>

        {refreshing && (
          <div className="odn-refresh-line" data-testid="overdue-refreshing">
            <span className="odn-spinner" aria-hidden="true" />
            <span>{TEXT.refreshingLine}</span>
          </div>
        )}

        {showTable && (
          <>
            <div className="odn-count" data-testid="overdue-count">
              {TEXT.totalCount(totalItems)}
            </div>
            <div className={`odn-table-wrap${loading ? " odn-refreshing" : ""}`}>
              <table className="odn-table" data-testid="overdue-notifications-table">
                <thead>
                  <tr>
                    <th>{TEXT.columns.equipment}</th>
                    <th>{TEXT.columns.member}</th>
                    <th>{TEXT.columns.slot}</th>
                    <th>{TEXT.columns.status}</th>
                    <th>{TEXT.columns.attempts}</th>
                    <th>{TEXT.columns.lastAttemptedAt}</th>
                    <th>{TEXT.columns.loan}</th>
                    <th>{TEXT.columns.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      data-testid={`overdue-row-${item.reservationNumber}`}
                      data-status={item.status}
                    >
                      <td className="odn-eq" data-label={TEXT.columns.equipment}>
                        <span className="mono">{item.equipmentCode}</span>
                        {item.equipmentName}
                        <span className="odn-rv">
                          {TEXT.reservationNumberLabel}{" "}
                          <span className="mono">{item.reservationNumber}</span>
                        </span>
                      </td>
                      <td data-label={TEXT.columns.member}>{item.userDisplayName}</td>
                      <td className="odn-slot" data-label={TEXT.columns.slot}>
                        <span className="mono">
                          {formatDateWithWeekday(item.reservationDate)}
                          {item.slotName} {item.slotStartTime}–{item.slotEndTime}
                        </span>
                      </td>
                      <td className="odn-status" data-label={TEXT.columns.status}>
                        <StatusCell item={item} />
                      </td>
                      <td data-label={TEXT.columns.attempts}>
                        <span className="mono" data-testid="overdue-attempt-count">
                          {item.attemptCount}
                        </span>{" "}
                        {ATTEMPT_UNIT}
                      </td>
                      <td data-label={TEXT.columns.lastAttemptedAt}>
                        <span className="mono">
                          {item.lastAttemptedAt
                            ? formatTaipeiDateTime(item.lastAttemptedAt)
                            : TEXT.notAttempted}
                        </span>
                      </td>
                      <td className="odn-loan" data-label={TEXT.columns.loan}>
                        <LoanCell item={item} />
                      </td>
                      <td data-label={TEXT.columns.actions}>
                        <ActionCell
                          item={item}
                          resending={resendingId === item.id}
                          onResend={handleResendClick}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showEmptyFilter && (
          <div className="odn-empty" data-testid="overdue-empty-filter">
            <h3>{TEXT.emptyFilterTitle(TEXT.status[filter])}</h3>
            <button type="button" className="btn btn-sm" onClick={() => setFilter("all")}>
              {TEXT.showAll}
            </button>
          </div>
        )}

        {showEmptyAll && (
          <div className="odn-empty" data-testid="overdue-empty-all">
            <h3>{TEXT.emptyAllTitle}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {TEXT.emptyAllHint}
            </p>
          </div>
        )}
      </section>
      {dialogTarget && (
        <ResendUnknownDialog
          notification={dialogTarget}
          onCancel={() => setDialogTarget(null)}
          onConfirm={handleConfirmResend}
        />
      )}
    </div>
  );
}

const OVERDUE_NOTIFICATIONS_CSS = `
.odn-section { padding: 20px; }
.odn-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.odn-toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.odn-refresh-line { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; margin-bottom: 8px; }
.odn-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.odn-field { min-width: 200px; }
.odn-field label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
.odn-field select { width: 100%; height: 40px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); font: inherit; }
.odn-field select:focus { outline: 3px solid var(--primary-soft); border-color: var(--primary); }
.odn-count { color: var(--muted); font-size: 13px; margin-bottom: 8px; }
.odn-table-wrap { overflow-x: auto; transition: opacity .15s; }
.odn-table-wrap.odn-refreshing { opacity: .45; pointer-events: none; }
.odn-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.odn-table th, .odn-table td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
.odn-table th { color: var(--muted); font-size: 12px; font-weight: 600; background: var(--surface-muted); white-space: nowrap; }
.odn-eq .mono { color: var(--primary); margin-right: 6px; font-weight: 600; }
.odn-rv { display: block; font-size: 12px; color: var(--muted); }
.odn-rv .mono { color: inherit; margin: 0; font-weight: 400; }
.odn-slot .mono { display: block; font-size: 13px; }
.odn-status { min-width: 200px; }
.odn-meta { display: block; margin-top: 6px; font-size: 12px; color: var(--muted); }
.odn-loan .odn-meta { margin-top: 4px; }
.odn-reason-line { margin-top: 6px; padding: 4px 10px; border-left: 4px solid var(--danger); border-radius: 0 8px 8px 0; background: var(--danger-soft); font-size: 13px; color: var(--danger); }
[data-theme="dark"] .odn-reason-line { color: var(--ink); }
.odn-sent-line { margin-top: 6px; font-size: 13px; color: var(--success); }
[data-theme="dark"] .odn-sent-line { color: var(--ink); }
.odn-action-note { font-size: 13px; color: var(--muted); white-space: nowrap; }
.odn-badge-sending { background: var(--primary-soft); color: var(--primary); border: 1px solid var(--primary); }
.odn-badge-sent { background: var(--success-soft); color: var(--success); }
.odn-badge-failed { background: var(--danger-soft); color: var(--danger); }
.odn-badge-unknown { background: var(--pending-soft); color: var(--pending); border: 1px solid var(--pending); }
.odn-badge-loan { background: var(--primary); color: #ffffff; }
.odn-badge-returned { background: var(--occupied-soft); color: var(--occupied); border: 1px solid var(--line); }
[data-theme="dark"] .odn-badge-sending, [data-theme="dark"] .odn-badge-sent, [data-theme="dark"] .odn-badge-failed, [data-theme="dark"] .odn-badge-unknown { color: var(--ink); }
.odn-spinner { width: 12px; height: 12px; border: 2px solid var(--primary-soft); border-top-color: var(--primary); border-radius: 50%; animation: odn-spin .8s linear infinite; display: inline-block; margin-right: 4px; vertical-align: -1px; }
.odn-spinner-lg { width: 20px; height: 20px; border-width: 3px; margin-right: 0; vertical-align: baseline; }
@keyframes odn-spin { to { transform: rotate(360deg); } }
.odn-skeleton { background: var(--surface-muted); border-radius: 8px; min-height: 20px; border: 1px dashed var(--line); }
.odn-loading-line { display: flex; align-items: center; gap: 10px; color: var(--muted); margin-bottom: 14px; }
.odn-empty { padding: 36px 20px; text-align: center; }
.odn-forbidden { max-width: 560px; margin: 24px auto; padding: 28px; text-align: center; border-color: var(--danger); }
.odn-forbidden-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 18px; }
@media (max-width: 720px) {
  .odn-table thead { display: none; }
  .odn-table tr { display: block; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .odn-table td { display: block; padding: 4px 0; border: 0; }
  .odn-table td[data-label]::before { content: attr(data-label); display: block; font-size: 12px; color: var(--muted); }
  .odn-field { width: 100%; }
}
`;
