import React, { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getEquipmentStatusChangePreview,
  updateEquipmentStatus,
  type CheckedOutReservationSummary,
  type EquipmentStatus,
  type EquipmentStatusChangePreview,
  type EquipmentStatusChangeResult,
  type UnavailableTargetStatus,
} from "../api/client";
import { EQUIPMENT_STATUS_ERROR_MESSAGES, UI_TEXT } from "../text/zh-TW";

/** 確認視窗開啟時需要的設備資訊。 */
export interface EquipmentStatusDialogEquipment {
  id: string;
  equipmentCode: string;
  name: string;
  status: EquipmentStatus;
}

interface EquipmentStatusDialogProps {
  equipment: EquipmentStatusDialogEquipment;
  targetStatus: UnavailableTargetStatus;
  onClose: () => void;
  onSuccess: (result: EquipmentStatusChangeResult) => void;
  /** 確認時資料已改變（EQUIPMENT_STATE_CHANGED）或設備剛被登記領取（EQUIPMENT_ON_LOAN）：視窗關閉，由上層顯示錯誤並重新載入（FR-019、FR-005）。 */
  onConfirmRejected: (error: ApiError) => void;
  /** 設備借用中時的「前往登記歸還」。 */
  onGoToReturn?: () => void;
}

const STATUS_BADGE_STYLE: Record<EquipmentStatus, React.CSSProperties> = {
  available: {
    background: "var(--success-soft)",
    color: "var(--success)",
    border: "1px solid var(--success)",
  },
  maintenance: {
    background: "var(--pending-soft)",
    color: "var(--pending)",
    border: "1px solid var(--pending)",
  },
  retired: { background: "var(--occupied-soft)", color: "var(--occupied)" },
};

const ACTION_TEXT: Record<UnavailableTargetStatus, { title: string; confirm: string }> = {
  maintenance: {
    title: UI_TEXT.equipmentStatusActions.setMaintenance,
    confirm: UI_TEXT.equipmentStatusActions.confirmMaintenance,
  },
  retired: {
    title: UI_TEXT.equipmentStatusActions.setRetired,
    confirm: UI_TEXT.equipmentStatusActions.confirmRetired,
  },
};

function StatusBadge({ status }: { status: EquipmentStatus }): React.ReactElement {
  return (
    <span className="badge" style={STATUS_BADGE_STYLE[status]}>
      {UI_TEXT.equipmentStatus[status]}
    </span>
  );
}

/** 借用中預約的說明（逾期時說明已超過歸還時間）（ui/plan.md §5「設備借用中」）。 */
export function describeCheckedOutReservation(r: CheckedOutReservationSummary): string {
  const slot = `${r.reservationDate} ${r.slotName} ${r.slotStartTime}–${r.slotEndTime}`;
  return `預約 ${r.reservationNumber}（${r.userDisplayName}，${slot}）${r.isOverdue ? "已超過歸還時間，" : ""}仍在借用中。`;
}

/** 確認視窗中的取消範圍說明（ui/equipment-status.html「設為送修確認視窗」）。 */
export function impactNotes(targetStatus: UnavailableTargetStatus): string[] {
  const reason =
    UI_TEXT.cancelReason[
      targetStatus === "maintenance" ? "equipment_maintenance" : "equipment_retired"
    ];
  return [
    `這台設備時段尚未結束的「待審核」與「已核准／有效」預約會改成「已取消」，取消原因記為「${reason}」。`,
    "這些預約的「改期審核中」申請會變成「改期已失效」，失效原因為「原預約已取消」。",
    "已歸還、已駁回、已取消的紀錄不會變動。",
    targetStatus === "maintenance"
      ? "送修中的設備仍顯示在成員的設備清單，標示「送修中」，不能預約。"
      : "停用後，這台設備會從成員的設備清單隱藏。",
    "設備恢復可用後，被取消的預約不會自動復原。",
  ];
}

/**
 * 設為送修或停用的確認視窗（FR-005、FR-007、FR-019；research §4）：
 * 開啟時先呼叫預覽，確認時把預覽的 currentStatus、cancelCount、expireCount 原樣放進請求。
 */
export function EquipmentStatusDialog({
  equipment,
  targetStatus,
  onClose,
  onSuccess,
  onConfirmRejected,
  onGoToReturn,
}: EquipmentStatusDialogProps): React.ReactElement {
  const [preview, setPreview] = useState<EquipmentStatusChangePreview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setErrorText("");
    try {
      setPreview(await getEquipmentStatusChangePreview(equipment.id, targetStatus));
    } catch (err) {
      setPreview(null);
      setErrorText(err instanceof ApiError ? err.message : "無法計算將取消的預約數，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }, [equipment.id, targetStatus]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  async function handleConfirm() {
    if (!preview || preview.hasCheckedOutReservation) return;
    setErrorText("");
    setSubmitting(true);
    try {
      const result = await updateEquipmentStatus(equipment.id, {
        targetStatus,
        expectedCurrentStatus: preview.currentStatus,
        expectedCancelCount: preview.cancelCount,
        expectedExpireCount: preview.expireCount,
      });
      onSuccess(result);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === "EQUIPMENT_STATE_CHANGED" || err.code === "EQUIPMENT_ON_LOAN")
      ) {
        onConfirmRejected(err);
        return;
      }
      setErrorText(err instanceof ApiError ? err.message : "設定失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  const action = ACTION_TEXT[targetStatus];
  const onLoan = preview?.hasCheckedOutReservation ?? false;
  const canConfirm = !loading && !submitting && preview !== null && !onLoan;

  return (
    <div className="esd-backdrop" data-testid="equipment-status-dialog">
      <style>{EQUIPMENT_STATUS_DIALOG_CSS}</style>
      <section
        className="card esd-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="esd-title"
      >
        <h2 id="esd-title" style={{ marginTop: 0 }}>
          {action.title}：{equipment.equipmentCode} {equipment.name}
        </h2>
        <div className="esd-transition" data-testid="equipment-status-transition">
          狀態 <StatusBadge status={preview?.currentStatus ?? equipment.status} /> →{" "}
          <StatusBadge status={targetStatus} />
        </div>

        {loading && (
          <div className="esd-loading" data-testid="equipment-status-loading">
            <span className="esd-spinner" aria-hidden="true" />
            <span>{UI_TEXT.equipmentStatusActions.calculating}</span>
          </div>
        )}

        {!loading && preview && !onLoan && (
          <div data-testid="equipment-status-preview">
            <p className="esd-impact" data-testid="equipment-status-impact">
              {UI_TEXT.equipmentStatusActions.impactSummary(
                preview.cancelCount,
                preview.expireCount,
              )}
            </p>
            <ul className="esd-notes">
              {impactNotes(targetStatus).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {!loading && preview && onLoan && (
          <div className="esd-error" role="alert" data-testid="equipment-status-on-loan">
            <strong>{EQUIPMENT_STATUS_ERROR_MESSAGES.EQUIPMENT_ON_LOAN}</strong>
            {preview.checkedOutReservations.map((r) => (
              <div key={r.reservationId}>{describeCheckedOutReservation(r)}</div>
            ))}
            {onGoToReturn && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ marginTop: "8px", alignSelf: "flex-start" }}
                onClick={onGoToReturn}
                data-testid="equipment-status-go-return"
              >
                前往登記歸還
              </button>
            )}
          </div>
        )}

        {errorText && (
          <div className="esd-error" role="alert" data-testid="equipment-status-dialog-error">
            {errorText}
          </div>
        )}

        <div className="esd-actions">
          <button
            type="button"
            className="btn"
            disabled={submitting}
            onClick={onClose}
            data-testid="equipment-status-cancel-btn"
          >
            {UI_TEXT.equipmentStatusActions.cancel}
          </button>
          <button
            type="button"
            className="btn btn-pending"
            disabled={!canConfirm}
            onClick={() => void handleConfirm()}
            data-testid="equipment-status-confirm-btn"
          >
            {submitting ? UI_TEXT.equipmentStatusActions.processing : action.confirm}
          </button>
        </div>
      </section>
    </div>
  );
}

const EQUIPMENT_STATUS_DIALOG_CSS = `
.esd-backdrop { position: fixed; inset: 0; z-index: 30; background: rgba(15, 23, 42, .45); display: grid; place-items: center; padding: 16px; }
.esd-dialog { width: min(560px, 100%); max-height: calc(100vh - 32px); overflow: auto; padding: 22px; }
.esd-transition { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); }
.esd-loading { display: flex; align-items: center; gap: 10px; margin-top: 16px; color: var(--muted); font-size: 14px; }
.esd-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--line); border-top-color: var(--primary); animation: esd-spin .8s linear infinite; }
@keyframes esd-spin { to { transform: rotate(360deg); } }
.esd-impact { margin: 16px 0 8px; font-size: 22px; font-weight: 700; color: var(--ink); }
.esd-notes { margin: 0; padding-left: 20px; font-size: 13px; color: var(--muted); display: grid; gap: 4px; }
.esd-error { display: flex; flex-direction: column; gap: 4px; margin-top: 14px; padding: 10px 12px; border-radius: 8px; background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger); font-size: 13px; font-weight: 500; }
[data-theme="dark"] .esd-error { color: var(--ink); }
.esd-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
@media (max-width: 640px) {
  .esd-backdrop { padding: 0; }
  .esd-dialog { width: 100%; min-height: 100vh; max-height: 100vh; border-radius: 0; }
}
`;
