import React from "react";
import type { OverdueNotification } from "../api/client";
import { UI_TEXT } from "../text/zh-TW";

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

interface ResendUnknownDialogProps {
  notification: OverdueNotification;
  /** 重送進行中時停用兩個按鈕 */
  busy?: boolean;
  /** 管理員取消：只關閉視窗，不呼叫 API */
  onCancel: () => void;
  /** 管理員確認：由呼叫端呼叫重送 API */
  onConfirm: () => void;
}

/** 重送「結果不明」的通知前的確認視窗（FR-006、US2 情境 6、7）。 */
export function ResendUnknownDialog({
  notification,
  busy = false,
  onCancel,
  onConfirm,
}: ResendUnknownDialogProps): React.ReactElement {
  const text = UI_TEXT.overdueNotifications.confirmDialog;
  return (
    <div className="ru-backdrop" data-testid="resend-unknown-dialog">
      <style>{RESEND_UNKNOWN_DIALOG_CSS}</style>
      <section
        className="card ru-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ru-title"
      >
        <h2 id="ru-title" style={{ marginTop: 0 }}>
          {text.title}
        </h2>
        <dl className="ru-detail">
          <dt>{text.equipment}</dt>
          <dd data-testid="resend-dialog-equipment">
            <span className="mono">{notification.equipmentCode}</span> {notification.equipmentName}
          </dd>
          <dt>{text.member}</dt>
          <dd data-testid="resend-dialog-member">{notification.userDisplayName}</dd>
          <dt>{text.slot}</dt>
          <dd className="mono" data-testid="resend-dialog-slot">
            {formatDateWithWeekday(notification.reservationDate)}
            {notification.slotName} {notification.slotStartTime}–{notification.slotEndTime}
          </dd>
          <dt>{text.lastAttempt}</dt>
          <dd className="mono" data-testid="resend-dialog-last-attempt">
            {notification.lastAttemptedAt
              ? formatTaipeiDateTime(notification.lastAttemptedAt)
              : UI_TEXT.overdueNotifications.notAttempted}
          </dd>
        </dl>
        <div className="ru-notice" data-testid="resend-dialog-notice">
          <strong>{text.noticeTitle}</strong>
          <div>{text.notice}</div>
        </div>
        <div className="ru-actions">
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={onCancel}
            data-testid="resend-dialog-cancel-btn"
          >
            {text.cancel}
          </button>
          <button
            type="button"
            className="btn btn-pending"
            disabled={busy}
            onClick={onConfirm}
            data-testid="resend-dialog-confirm-btn"
          >
            {text.confirm}
          </button>
        </div>
      </section>
    </div>
  );
}

const RESEND_UNKNOWN_DIALOG_CSS = `
.ru-backdrop { position: fixed; inset: 0; z-index: 30; background: rgba(15, 23, 42, .45); display: grid; place-items: center; padding: 16px; }
.ru-dialog { width: min(560px, 100%); max-height: calc(100vh - 32px); overflow: auto; padding: 22px; }
.ru-detail { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 12px 0; padding: 12px 14px; border-radius: 10px; background: var(--surface-muted); font-size: 14px; }
.ru-detail dt { color: var(--muted); }
.ru-detail dd { margin: 0; font-weight: 600; }
.ru-notice { margin: 12px 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; border: 1px solid var(--pending); background: var(--pending-soft); }
[data-theme="dark"] .ru-notice { color: var(--ink); }
.ru-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
@media (max-width: 640px) {
  .ru-backdrop { padding: 0; }
  .ru-dialog { width: 100%; min-height: 100vh; max-height: 100vh; border-radius: 0; }
}
`;
