import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthenticatedUser } from "../App";
import { ApiError, apiRequest } from "../api/client";
import { SlotStatusBadge, type SlotAvailabilityStatus } from "../components/SlotStatusBadge";
import { UI_TEXT } from "../text/zh-TW";

export interface EquipmentSlotItem {
  slotId: string;
  slotCode: "MORNING" | "AFTERNOON" | "EVENING";
  slotName: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
  availabilityStatus: SlotAvailabilityStatus;
  isBookable: boolean;
  myReservationId: string | null;
}

export interface EquipmentAvailabilityItem {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  isActive: boolean;
  reservationDate: string;
  slots: EquipmentSlotItem[];
}

export interface EquipmentAvailabilityPage {
  items: EquipmentAvailabilityItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface ReservationCreatedResponse {
  id: string;
  reservationNumber: string;
  equipmentCode: string;
  equipmentName: string;
  reservationDate: string;
  slotName: string;
  slotStartTime: string;
  slotEndTime: string;
}

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
}

export function EquipmentBookingView({
  currentUser,
  onGoToMyReservations,
}: EquipmentBookingViewProps): React.ReactElement {
  const openDates = useMemo(() => getTaipeiOpenDates(), []);
  const minDate = openDates[0]?.date ?? "";
  const maxDate = openDates[openDates.length - 1]?.date ?? "";
  const defaultDate = openDates[1]?.date ?? openDates[0]?.date ?? "";

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [equipments, setEquipments] = useState<EquipmentAvailabilityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
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
      const data = await apiRequest<EquipmentAvailabilityPage>(`/equipments?${params.toString()}`);
      setEquipments(data.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "載入設備與時段狀態失敗。";
      setBanner({ tone: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCategory]);

  useEffect(() => {
    void loadEquipments();
  }, [loadEquipments]);

  const handleSelectSlot = (eq: EquipmentAvailabilityItem, slot: EquipmentSlotItem): void => {
    setPanelError("");
    setBanner(null);
    if (!slot.isBookable) {
      setBanner({
        tone: "danger",
        text: `無法預約：${selectedDate} ${slot.slotName} ${slot.startTime}–${slot.endTime} 時段已開始或已結束，請選擇尚未開始的固定時段。`,
      });
      return;
    }
    setSelectedSlot({
      equipmentId: eq.id,
      equipmentCode: eq.equipmentCode,
      equipmentName: eq.name,
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
        text: `僅開放預約當日起算 7 天內（${minDate} 至 ${maxDate}）尚未開始的固定時段，所選日期不在開放範圍內。`,
      });
      return;
    }
    if (!selectedSlot) {
      setPanelError(UI_TEXT.fieldValidation.slotRequired);
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiRequest<ReservationCreatedResponse>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          equipmentId: selectedSlot.equipmentId,
          reservationDate: selectedDate,
          slotId: selectedSlot.slotId,
        }),
      });
      setBanner({
        tone: "success",
        text: `預約已成立！預約編號 ${created.reservationNumber}（${created.equipmentCode} ${created.equipmentName}，${created.reservationDate} ${created.slotName} ${created.slotStartTime}–${created.slotEndTime}）已立即生效並占用時段。`,
        showMyReservationsBtn: true,
      });
      setSelectedSlot(null);
      await loadEquipments();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "預約送出失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      await loadEquipments();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>預建單件設備清單與單日固定時段預約</h1>
      <p className="page-lead">
        選擇當日起算 7 天內的借用日期（台灣時間 <span className="mono">{minDate}</span> 至{" "}
        <span className="mono">{maxDate}</span>），並點選任一單件設備尚未開始的可預約時段送出預約。
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
          <strong>選擇借用日期（7 天開放範圍）</strong>
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
            僅開放預約當日起算 7 天內（{minDate} 至 {maxDate}
            ）尚未開始的固定時段，所選日期不在開放範圍內。
          </div>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "24px", color: "var(--muted)" }}>
          正在載入預建設備與單日固定時段狀態…
        </div>
      ) : equipments.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
          <h2>目前分類下沒有符合條件的設備</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSelectedCategory("ALL")}
          >
            顯示全部設備
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
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
                  <div>
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
                    </span>{" "}
                    <span className="badge badge-available">
                      {eq.isActive ? "可供借用" : "暫停借用"}
                    </span>
                  </div>
                  <h2 style={{ margin: "6px 0 2px", fontSize: "17px" }}>{eq.name}</h2>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>分類：{eq.category}</div>
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
                      slot.availabilityStatus === "booked_by_me" ||
                      slot.availabilityStatus === "booked_by_others";

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
                          background: disabled
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
            <h2>單日固定時段預約確認</h2>
            <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
              每次選取一台單件設備與一個固定時段，送出後立即生效並占用該時段。
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
                <span className="muted">預約成員</span>
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
              {submitting ? "送出預約中…" : "確認送出預約"}
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
