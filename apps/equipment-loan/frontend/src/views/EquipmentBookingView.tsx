import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthenticatedUser } from "../App";
import {
  ApiError,
  apiRequest,
  type EquipmentAvailabilityPageDto,
  type EquipmentWithSlotsDto,
  type ReservationDto,
  type SlotAvailabilityDto,
} from "../api/client";
import { SlotStatusBadge } from "../components/SlotStatusBadge";
import { UI_TEXT } from "../text/zh-TW";

export type EquipmentSlotItem = SlotAvailabilityDto;
export type EquipmentAvailabilityItem = EquipmentWithSlotsDto;
export type EquipmentAvailabilityPage = EquipmentAvailabilityPageDto;

function getTaipeiOpenDates(): Array<{ date: string; label: string }> {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(Date.UTC(y!, m! - 1, d! + i));
    const dateStr = dt.toISOString().slice(0, 10);
    const md = dateStr.slice(5).replace("-", "/");
    const wd = weekdays[dt.getUTCDay()] ?? "";
    return {
      date: dateStr,
      label: i === 0 ? `${md}（${wd}）今日` : `${md}（${wd}）`,
    };
  });
}

interface EquipmentBookingViewProps {
  currentUser: AuthenticatedUser;
  onGoToMyReservations: () => void;
  initialDate?: string | null;
}

export function EquipmentBookingView({
  currentUser,
  onGoToMyReservations,
  initialDate,
}: EquipmentBookingViewProps): React.ReactElement {
  const openDates = useMemo(() => getTaipeiOpenDates(), []);
  const minDate = openDates[0]?.date ?? "";
  const maxDate = openDates[openDates.length - 1]?.date ?? "";
  const defaultDate = openDates[1]?.date ?? openDates[0]?.date ?? "";

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || defaultDate);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedApprovalFilter, setSelectedApprovalFilter] = useState<
    "ALL" | "REQUIRED" | "DIRECT"
  >("ALL");
  const [equipments, setEquipments] = useState<EquipmentAvailabilityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    requiresApproval: boolean;
    slotId: string;
    slotName: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [panelError, setPanelError] = useState<string>("");
  const [banner, setBanner] = useState<{
    tone: "danger" | "success" | "info";
    text: string;
    showMyReservationsBtn?: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const isDateInRange = selectedDate >= minDate && selectedDate <= maxDate;

  const loadEquipments = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        page: "1",
        pageSize: "50",
      });
      if (selectedCategory !== "ALL") {
        params.set("category", selectedCategory);
      }
      if (selectedApprovalFilter === "REQUIRED") {
        params.set("requiresApproval", "true");
      } else if (selectedApprovalFilter === "DIRECT") {
        params.set("requiresApproval", "false");
      }
      const data = await apiRequest<EquipmentAvailabilityPage>(`/equipments?${params.toString()}`);
      setEquipments(data.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "載入設備與時段狀態失敗。";
      setBanner({ tone: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCategory, selectedApprovalFilter]);

  useEffect(() => {
    void loadEquipments();
  }, [loadEquipments]);

  const handleSelectSlot = (eq: EquipmentAvailabilityItem, slot: EquipmentSlotItem): void => {
    setPanelError("");
    setBanner(null);

    if (slot.availabilityStatus === "pending_by_me" || slot.availabilityStatus === "booked_by_me") {
      const statusLabel = slot.availabilityStatus === "pending_by_me" ? "待審核" : "已核准／有效";
      setBanner({
        tone: "danger",
        text: `重複申請遭拒：您已對 ${eq.equipmentCode} ${eq.name} 於 ${selectedDate} ${slot.slotName} ${slot.startTime}–${slot.endTime} 持有一筆未結束的「${statusLabel}」申請，同一成員不得對同一設備時段重複申請。`,
      });
      return;
    }

    if (!slot.isBookable) {
      setBanner({
        tone: "danger",
        text: `無法申請：${selectedDate} ${slot.slotName} ${slot.startTime}–${slot.endTime} 時段已開始或已結束，請選擇尚未開始的固定時段。`,
      });
      return;
    }

    setSelectedSlot({
      equipmentId: eq.id,
      equipmentCode: eq.equipmentCode,
      equipmentName: eq.name,
      requiresApproval: eq.requiresApproval,
      slotId: slot.slotId,
      slotName: slot.slotName,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleSubmitBooking = async (): Promise<void> => {
    setPanelError("");
    if (!isDateInRange) {
      setBanner({
        tone: "danger",
        text: `僅開放申請當日起算 7 天內（${minDate} 至 ${maxDate}）尚未開始的固定時段，所選日期不在開放範圍內。`,
      });
      return;
    }
    if (!selectedSlot) {
      setPanelError(UI_TEXT.fieldValidation.slotRequired);
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiRequest<ReservationDto>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          equipmentId: selectedSlot.equipmentId,
          reservationDate: selectedDate,
          slotId: selectedSlot.slotId,
        }),
      });
      if (created.status === "pending_approval") {
        setBanner({
          tone: "info",
          text: `待審核申請已送出！預約編號 ${created.reservationNumber}（${created.equipmentCode} ${created.equipmentName}，${created.reservationDate} ${created.slotName} ${created.slotStartTime}–${created.slotEndTime}）目前狀態為「待審核」，核准前不占用時段，請靜候管理員審核。`,
          showMyReservationsBtn: true,
        });
      } else {
        setBanner({
          tone: "success",
          text: `預約已成立！預約編號 ${created.reservationNumber}（${created.equipmentCode} ${created.equipmentName}，${created.reservationDate} ${created.slotName} ${created.slotStartTime}–${created.slotEndTime}）屬於免審核設備，狀態為「已核准／有效」並已立即占用該時段。`,
          showMyReservationsBtn: true,
        });
      }
      setSelectedSlot(null);
      await loadEquipments();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "預約申請送出失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      await loadEquipments();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>預建單件設備審核標示與單日固定時段預約申請</h1>
      <p className="page-lead">
        選擇當日起算 7 天內的借用日期（台灣時間 <span className="mono">{minDate}</span> 至{" "}
        <span className="mono">{maxDate}</span>
        ）；「需人工審核」設備送出後進入待審核且核准前不占用時段，「免審核」設備送出後立即成為已核准／有效並占用時段。
      </p>

      {banner && (
        <div className={`banner banner-${banner.tone}`} role="alert" data-testid="booking-banner">
          <span>{banner.text}</span>
          {banner.showMyReservationsBtn && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={onGoToMyReservations}
              data-testid="banner-go-my-reservations"
            >
              查看我的預約
            </button>
          )}
        </div>
      )}

      <div
        className="card"
        style={{
          padding: "18px 20px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <strong>選擇借用日期與審核模式篩選（7 天開放範圍）</strong>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label htmlFor="date-input" className="muted" style={{ fontSize: "13px" }}>
              指定日期：
            </label>
            <input
              id="date-input"
              type="date"
              className="mono"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
                setPanelError("");
              }}
              style={{
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
              }}
            />
            <label htmlFor="approval-filter-select" className="muted" style={{ fontSize: "13px" }}>
              審核模式：
            </label>
            <select
              id="approval-filter-select"
              data-testid="approval-filter-select"
              value={selectedApprovalFilter}
              onChange={(e) => {
                setSelectedApprovalFilter(e.target.value as "ALL" | "REQUIRED" | "DIRECT");
                setSelectedSlot(null);
              }}
              style={{
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
              }}
            >
              <option value="ALL">全部模式</option>
              <option value="REQUIRED">需人工審核</option>
              <option value="DIRECT">免審核</option>
            </select>
            <label htmlFor="category-select" className="muted" style={{ fontSize: "13px" }}>
              設備分類：
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSlot(null);
              }}
              style={{
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
              }}
            >
              <option value="ALL">全部分類</option>
              <option value="光學檢測">光學檢測</option>
              <option value="電子量測">電子量測</option>
              <option value="熱流分析">熱流分析</option>
              <option value="生醫分析">生醫分析</option>
            </select>
          </div>
        </div>

        <div
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
          role="group"
          aria-label="7 天開放預約日期"
        >
          {openDates.map((d) => {
            const active = d.date === selectedDate;
            return (
              <button
                key={d.date}
                type="button"
                className="mono"
                data-testid={`date-chip-${d.date}`}
                onClick={() => {
                  setSelectedDate(d.date);
                  setSelectedSlot(null);
                  setPanelError("");
                  setBanner(null);
                }}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${active ? "var(--primary)" : "var(--line)"}`,
                  borderRadius: "8px",
                  background: active ? "var(--primary)" : "var(--surface)",
                  color: active ? "#ffffff" : "var(--ink)",
                  fontWeight: active ? 600 : 400,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {!isDateInRange && (
          <div style={{ color: "var(--danger)", fontSize: "13px", fontWeight: 500 }}>
            僅開放申請當日起算 7 天內（{minDate} 至 {maxDate}
            ）尚未開始的固定時段，所選日期不在開放範圍內。
          </div>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "24px", color: "var(--muted)" }}>
          正在載入預建設備審核標示與單日固定時段狀態…
        </div>
      ) : equipments.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
          <h2>目前篩選條件下沒有符合的設備</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedApprovalFilter("ALL");
            }}
          >
            顯示全部設備
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 350px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "16px" }}>
            {equipments.map((eq) => (
              <article
                key={eq.id}
                className="card"
                style={{ padding: "20px" }}
                data-testid={`equipment-card-${eq.equipmentCode}`}
              >
                <div style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--primary)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "var(--primary-soft)",
                      }}
                    >
                      {eq.equipmentCode}
                    </span>
                    <span
                      className={`badge ${eq.requiresApproval ? "badge-pending" : "badge-available"}`}
                      data-testid={`approval-badge-${eq.equipmentCode}`}
                    >
                      {eq.requiresApproval
                        ? UI_TEXT.approvalModes.requiresApproval
                        : UI_TEXT.approvalModes.noApproval}
                    </span>
                    <span className="badge badge-available">
                      {eq.isActive ? "可供借用" : "暫停借用"}
                    </span>
                  </div>
                  <h2 style={{ margin: "6px 0 2px", fontSize: "17px" }}>{eq.name}</h2>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                    分類：{eq.category} ｜ 審核規則：
                    {eq.requiresApproval
                      ? "送出後進入待審核，核准前不占用時段"
                      : "送出後立即成為已核准／有效並占用時段"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {eq.slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.equipmentId === eq.id && selectedSlot?.slotId === slot.slotId;
                    const disabled =
                      submitting ||
                      !isDateInRange ||
                      slot.availabilityStatus === "booked_by_others";
                    const isAlreadyMine =
                      slot.availabilityStatus === "pending_by_me" ||
                      slot.availabilityStatus === "booked_by_me";

                    return (
                      <button
                        key={slot.slotId}
                        type="button"
                        disabled={disabled}
                        data-testid={`slot-${eq.equipmentCode}-${slot.slotCode}`}
                        onClick={() => handleSelectSlot(eq, slot)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "6px",
                          padding: "12px 14px",
                          border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--line)"}`,
                          borderRadius: "10px",
                          background:
                            disabled || isAlreadyMine
                              ? "var(--surface-muted)"
                              : isSelected
                                ? "var(--primary-soft)"
                                : "var(--surface)",
                          color: "var(--ink)",
                          font: "inherit",
                          textAlign: "left",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.88 : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: "14px" }}>
                            {slot.slotName}時段
                          </span>
                          <SlotStatusBadge
                            status={slot.availabilityStatus}
                            isBookable={slot.isBookable}
                          />
                        </div>
                        <span className="mono" style={{ fontSize: "13px", color: "var(--muted)" }}>
                          {slot.startTime}–{slot.endTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <aside
            className="card"
            style={{ position: "sticky", top: "84px", padding: "22px" }}
            aria-label="預約確認面板"
          >
            <h2>單日固定時段預約申請確認</h2>
            <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
              依所選設備的審核模式，送出後將進入「待審核」（不占位）或直接成為「已核准／有效」（立即占位）。
            </p>

            <div
              style={{
                margin: "12px 0 16px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "var(--surface-muted)",
                border: "1px solid var(--line)",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span className="muted">申請成員</span>
                <span style={{ fontWeight: 600 }}>
                  {currentUser.displayName} (<span className="mono">{currentUser.username}</span>)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span className="muted">預約日期</span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  {selectedDate}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span className="muted">所選設備</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>
                  {selectedSlot
                    ? `${selectedSlot.equipmentCode} ${selectedSlot.equipmentName}`
                    : "尚未選擇設備"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span className="muted">審核模式</span>
                <span
                  style={{ fontWeight: 600, textAlign: "right" }}
                  data-testid="panel-approval-mode"
                >
                  {selectedSlot
                    ? selectedSlot.requiresApproval
                      ? "需人工審核（送出後進入待審核，核准前不鎖定時段）"
                      : "免審核（送出後立即成為已核准／有效並占用時段）"
                    : "請先選擇時段"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                }}
              >
                <span className="muted">固定時段</span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  {selectedSlot
                    ? `${selectedSlot.slotName} ${selectedSlot.startTime}–${selectedSlot.endTime}`
                    : "尚未選擇時段"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={submitting || !isDateInRange}
              onClick={() => void handleSubmitBooking()}
              data-testid="submit-booking-btn"
            >
              {submitting
                ? "送出申請中…"
                : selectedSlot?.requiresApproval
                  ? "送出待審核申請"
                  : "確認送出預約"}
            </button>

            {panelError && (
              <div
                role="alert"
                style={{
                  marginTop: "10px",
                  color: "var(--danger)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {panelError}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
