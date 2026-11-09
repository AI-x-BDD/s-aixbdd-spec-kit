import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  createRescheduleRequest,
  listEquipments,
  type CreateRescheduleRequestResponse,
  type ReservationDto,
  type SlotAvailabilityDto,
} from "../api/client";

/** 格子狀態：原時段、已開始、本人已有預約、已被預約、可改期、未開放（第 8 天）。 */
export type RescheduleCellStatus =
  "original" | "started" | "own" | "occupied" | "available" | "closed-range";

const CELL_META: Record<RescheduleCellStatus, { cls: string; text: string }> = {
  available: { cls: "rd-slot-available", text: "可改期" },
  original: { cls: "rd-slot-original", text: "原時段" },
  started: { cls: "rd-slot-closed", text: "已開始" },
  own: { cls: "rd-slot-mine", text: "本人已有預約" },
  occupied: { cls: "rd-slot-occupied", text: "已被預約" },
  "closed-range": { cls: "rd-slot-closed", text: "未開放" },
};

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const DIRECT_NOTICE =
  "這台設備免審核：送出時新時段仍未被占用，就立即改期，預約編號與「已核准／有效」狀態不變，原時段立即釋出。新時段已被占用時改期失敗，原預約不變。";
const REVIEW_NOTICE =
  "這台設備需人工審核：送出後建立「改期審核中」的申請。管理員核准前，原預約照常有效並繼續占用原時段，新時段不會替您保留。";
const NO_SLOT_SELECTED = "請先選擇一個標示「可改期」的新時段。";

interface SlotRow {
  slotId: string;
  slotCode: SlotAvailabilityDto["slotCode"];
  slotName: string;
  startTime: string;
  endTime: string;
}

interface DayColumn {
  date: string;
  slots: SlotAvailabilityDto[];
}

function getTaipeiNowParts(now: Date = new Date()): { date: string; time: string } {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return { date, time };
}

function addDays(dateStr: string, days: number): string {
  const dt = new Date(`${dateStr}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function columnLabel(dateStr: string): string {
  const weekday = WEEKDAYS[new Date(`${dateStr}T00:00:00Z`).getUTCDay()];
  return `${dateStr.slice(5).replace("-", "/")}（${weekday}）`;
}

function slotText(date: string, slot: { slotName: string; startTime: string; endTime: string }) {
  return `${date} ${slot.slotName} ${slot.startTime}–${slot.endTime}`;
}

/** 依 listEquipments 的時段狀態判斷改期格子的狀態（FR-001）。 */
export function getRescheduleCellStatus(params: {
  reservation: Pick<ReservationDto, "reservationDate" | "slotId">;
  date: string;
  slot: Pick<SlotAvailabilityDto, "slotId" | "startTime" | "slotStatus" | "availabilityStatus">;
  todayStr: string;
  nowTime: string;
  lastOpenDate: string;
  takenKeys?: ReadonlySet<string>;
}): RescheduleCellStatus {
  const { reservation, date, slot, todayStr, nowTime, lastOpenDate } = params;
  if (date < todayStr || date > lastOpenDate) return "closed-range";
  if (date === reservation.reservationDate && slot.slotId === reservation.slotId) {
    return "original";
  }
  if (date < todayStr || (date === todayStr && nowTime >= slot.startTime)) return "started";
  const status =
    slot.slotStatus ??
    (
      {
        available: "AVAILABLE",
        pending_by_me: "MY_PENDING",
        booked_by_me: "MY_CONFIRMED",
        checked_out_by_me: "MY_CHECKED_OUT",
        returned_by_me: "MY_RETURNED",
        booked_by_others: "OCCUPIED",
        reschedule_pending_by_me: "MY_RESCHEDULE_PENDING",
      } as const
    )[slot.availabilityStatus];
  if (status === "MY_PENDING" || status === "MY_CONFIRMED" || status === "MY_CHECKED_OUT") {
    return "own";
  }
  if (status === "OCCUPIED" || status === "MY_RETURNED") return "occupied";
  if (params.takenKeys?.has(`${date}|${slot.slotId}`)) return "occupied";
  return "available";
}

interface RescheduleDialogProps {
  reservation: ReservationDto;
  /** 用來在「本人已有預約」提示中顯示預約編號 */
  myReservations?: ReservationDto[];
  onClose: () => void;
  onSuccess: (result: CreateRescheduleRequestResponse) => void;
  /** 送出失敗時先交給呼叫端處理（例如頁頂橫幅）；回傳 true 表示已處理，對話框不再顯示錯誤 */
  onSubmitError?: (err: ApiError) => boolean;
}

export function RescheduleDialog({
  reservation,
  myReservations = [],
  onClose,
  onSuccess,
  onSubmitError,
}: RescheduleDialogProps): React.ReactElement {
  const [{ date: todayStr, time: nowTime }] = useState(() => getTaipeiNowParts());
  const openDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(todayStr, i)),
    [todayStr],
  );
  const closedDate = addDays(todayStr, 7);
  const lastOpenDate = openDates[openDates.length - 1];

  const [columns, setColumns] = useState<DayColumn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chosen, setChosen] = useState<{ date: string; slot: SlotRow } | null>(null);
  const [errorText, setErrorText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [takenKeys, setTakenKeys] = useState<Set<string>>(new Set());

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      // 合約一次只查一天，逐日取得同一設備 7 天的時段狀態
      const pages = await Promise.all(
        openDates.map((date) => listEquipments({ date, equipmentId: reservation.equipmentId })),
      );
      setColumns(
        pages.map((page, i) => ({
          date: openDates[i],
          slots: page.items[0]?.slots ?? [],
        })),
      );
    } catch (err) {
      setErrorText(
        err instanceof ApiError ? err.message : "無法載入同一設備的時段狀態，請稍後再試。",
      );
    } finally {
      setLoading(false);
    }
  }, [openDates, reservation.equipmentId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const slotRows: SlotRow[] = useMemo(() => {
    const first = columns.find((c) => c.slots.length > 0);
    return (first?.slots ?? []).map((s) => ({
      slotId: s.slotId,
      slotCode: s.slotCode,
      slotName: s.slotName,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  }, [columns]);

  function cellStatusOf(date: string, row: SlotRow): RescheduleCellStatus {
    if (date === closedDate) return "closed-range";
    const slot = columns.find((c) => c.date === date)?.slots.find((s) => s.slotId === row.slotId);
    if (!slot) return "closed-range";
    return getRescheduleCellStatus({
      reservation,
      date,
      slot,
      todayStr,
      nowTime,
      lastOpenDate,
      takenKeys,
    });
  }

  function cellError(date: string, row: SlotRow, status: RescheduleCellStatus): string {
    const text = slotText(date, row);
    if (status === "original") return `新時段不能與原時段相同（${text}），請選擇其他時段。`;
    if (status === "started") return `${text} 已開始，請選擇尚未開始的時段。`;
    if (status === "closed-range") {
      return `只能改到 ${todayStr} 至 ${lastOpenDate}（當日起算 7 天）內的時段。`;
    }
    if (status === "own") {
      const slot = columns.find((c) => c.date === date)?.slots.find((s) => s.slotId === row.slotId);
      const mine = myReservations.find((r) => r.id === slot?.myReservationId);
      return mine
        ? `您在 ${text} 已有這台設備的預約 ${mine.reservationNumber}，不能改到同一時段。`
        : `您在 ${text} 已有這台設備的預約，不能改到同一時段。`;
    }
    return `${text} 已被預約，請選擇標示「可改期」的時段。`;
  }

  function handleCellClick(date: string, row: SlotRow) {
    const status = cellStatusOf(date, row);
    if (status === "available") {
      setChosen({ date, slot: row });
      setErrorText("");
    } else {
      setErrorText(cellError(date, row, status));
    }
  }

  async function handleSubmit() {
    if (!chosen) {
      setErrorText(NO_SLOT_SELECTED);
      return;
    }
    setErrorText("");
    setSubmitting(true);
    try {
      const result = await createRescheduleRequest(reservation.id, {
        toReservationDate: chosen.date,
        toSlotId: chosen.slot.slotId,
      });
      onSuccess(result);
    } catch (err) {
      if (err instanceof ApiError && onSubmitError?.(err)) {
        return;
      }
      if (err instanceof ApiError && err.code === "RESCHEDULE_SLOT_CONFLICT") {
        const key = `${chosen.date}|${chosen.slot.slotId}`;
        setTakenKeys((prev) => new Set(prev).add(key));
        setChosen(null);
      }
      setErrorText(err instanceof ApiError ? err.message : "送出改期失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  const fromText = `${reservation.reservationDate} ${reservation.slotName} ${reservation.slotStartTime}–${reservation.slotEndTime}`;
  const allDates = [...openDates, closedDate];

  return (
    <div className="rd-backdrop" data-testid="reschedule-dialog">
      <style>{RESCHEDULE_DIALOG_CSS}</style>
      <section
        className="card rd-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rd-title"
      >
        <h2 id="rd-title" style={{ marginTop: 0 }}>
          申請改期
        </h2>
        <dl className="rd-detail">
          <dt>預約編號</dt>
          <dd className="mono" data-testid="reschedule-reservation-number">
            {reservation.reservationNumber}
          </dd>
          <dt>設備</dt>
          <dd>
            {reservation.equipmentCode} {reservation.equipmentName}（
            {reservation.equipmentRequiresApproval ? "需人工審核" : "免審核"}）
          </dd>
          <dt>原時段</dt>
          <dd className="mono">{fromText}</dd>
        </dl>
        <div
          className={`rd-notice ${reservation.equipmentRequiresApproval ? "rd-notice-pending" : "rd-notice-success"}`}
          data-testid="reschedule-notice"
        >
          {reservation.equipmentRequiresApproval ? REVIEW_NOTICE : DIRECT_NOTICE}
        </div>
        <strong style={{ fontSize: "14px" }}>選擇同一台設備的新時段</strong>
        {loading ? (
          <div className="rd-loading">正在載入同一設備 7 天內的時段狀態…</div>
        ) : (
          <div className="rd-grid-wrap">
            <div className="rd-grid" data-testid="reschedule-grid">
              <div />
              {allDates.map((date) => (
                <div key={date} className="rd-col-head">
                  {columnLabel(date)}
                </div>
              ))}
              {slotRows.map((row) => (
                <React.Fragment key={row.slotId}>
                  <div className="rd-row-head">
                    {row.slotName}
                    <span className="mono muted" style={{ fontWeight: 400 }}>
                      {row.startTime}–{row.endTime}
                    </span>
                  </div>
                  {allDates.map((date) => {
                    const status = cellStatusOf(date, row);
                    const isChosen = chosen?.date === date && chosen.slot.slotId === row.slotId;
                    return (
                      <button
                        key={`${date}-${row.slotId}`}
                        type="button"
                        className={`rd-slot ${CELL_META[status].cls}${isChosen ? " rd-selected" : ""}`}
                        disabled={submitting}
                        aria-label={`${date} ${row.slotName}`}
                        data-testid={`reschedule-cell-${date}-${row.slotCode}`}
                        data-status={status}
                        onClick={() => handleCellClick(date, row)}
                      >
                        <span className="rd-slot-state">
                          {isChosen ? "已選取" : CELL_META[status].text}
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <div className="rd-chosen">
          新時段：
          <span className="mono" data-testid="reschedule-chosen">
            {chosen ? slotText(chosen.date, chosen.slot) : "尚未選擇"}
          </span>
        </div>
        {errorText && (
          <div className="rd-error" role="alert" data-testid="reschedule-dialog-error">
            {errorText}
          </div>
        )}
        <div className="rd-actions">
          <button
            type="button"
            className="btn"
            disabled={submitting}
            onClick={onClose}
            data-testid="reschedule-close-btn"
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            data-testid="reschedule-submit-btn"
          >
            {submitting ? "送出改期中…" : "送出改期申請"}
          </button>
        </div>
      </section>
    </div>
  );
}

const RESCHEDULE_DIALOG_CSS = `
.rd-backdrop { position: fixed; inset: 0; z-index: 30; background: rgba(15, 23, 42, .45); display: grid; place-items: center; padding: 16px; }
.rd-dialog { width: min(880px, 100%); max-height: calc(100vh - 32px); overflow: auto; padding: 22px; }
.rd-detail { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 0; font-size: 14px; }
.rd-detail dt { color: var(--muted); }
.rd-detail dd { margin: 0; font-weight: 600; }
.rd-notice { margin: 12px 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; border: 1px solid var(--line); background: var(--surface-muted); }
.rd-notice-pending { background: var(--pending-soft); border-color: var(--pending); }
.rd-notice-success { background: var(--success-soft); border-color: var(--success); }
.rd-loading { margin-top: 12px; color: var(--muted); font-size: 13px; }
.rd-grid-wrap { overflow-x: auto; margin-top: 12px; }
.rd-grid { display: grid; grid-template-columns: 72px repeat(8, minmax(84px, 1fr)); gap: 6px; min-width: 820px; }
.rd-col-head { font-size: 12px; font-weight: 600; text-align: center; font-family: var(--font-mono); }
.rd-row-head { font-size: 12px; font-weight: 600; display: flex; flex-direction: column; justify-content: center; }
.rd-slot { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; width: 100%; min-height: 58px; padding: 8px; border: 1.5px solid var(--line); border-radius: 10px; background: var(--surface); color: var(--ink); font: inherit; text-align: left; cursor: pointer; }
.rd-slot:hover:not(:disabled) { border-color: var(--primary); }
.rd-slot:disabled { cursor: not-allowed; opacity: .7; }
.rd-slot-state { font-weight: 600; font-size: 11px; }
.rd-slot-available { border-color: var(--success); }
.rd-slot-available .rd-slot-state { color: var(--success); }
.rd-slot-mine { background: var(--primary-soft); border-color: var(--primary); }
.rd-slot-mine .rd-slot-state { color: var(--primary); }
.rd-slot-occupied, .rd-slot-closed { background: var(--occupied-soft); border-color: var(--line); color: var(--muted); }
.rd-slot-occupied .rd-slot-state, .rd-slot-closed .rd-slot-state { color: var(--occupied); }
.rd-slot-original { background: var(--surface-muted); border: 1.5px solid var(--primary); }
.rd-slot-original .rd-slot-state { color: var(--primary); }
.rd-slot.rd-selected { border-color: var(--primary); background: var(--primary-soft); box-shadow: 0 0 0 3px var(--primary-soft); }
.rd-slot.rd-selected .rd-slot-state { color: var(--primary); }
[data-theme="dark"] .rd-slot-mine .rd-slot-state, [data-theme="dark"] .rd-slot.rd-selected .rd-slot-state { color: var(--ink); }
.rd-chosen { margin-top: 12px; font-size: 14px; }
.rd-error { margin-top: 12px; padding: 10px 12px; border-radius: 8px; background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger); font-size: 13px; font-weight: 500; }
[data-theme="dark"] .rd-error { color: var(--ink); }
.rd-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
@media (max-width: 640px) {
  .rd-backdrop { padding: 0; }
  .rd-dialog { width: 100%; min-height: 100vh; max-height: 100vh; border-radius: 0; }
}
`;
