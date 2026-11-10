import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthenticatedUser } from "../App";
import {
  ApiError,
  apiRequest,
  type EquipmentAvailabilityPageDto,
  type EquipmentStatus,
  type EquipmentWithSlotsDto,
  type ReservationDto,
  type SlotAvailabilityDto,
} from "../api/client";
import { SlotStatusBadge } from "../components/SlotStatusBadge";
import { UI_TEXT } from "../text/zh-TW";

/** 設備狀態徽章：可用為綠色、送修中為琥珀色實心（暫時性）、停用為中性灰（長期）（ui/plan.md §2）。 */
const EQUIPMENT_STATUS_BADGE_CLASS: Record<EquipmentStatus, string> = {
  available: "badge-available",
  maintenance: "badge-pending",
  retired: "badge-occupied",
};
const EQUIPMENT_STATUS_BADGE_STYLE: Record<EquipmentStatus, React.CSSProperties | undefined> = {
  available: undefined,
  maintenance: {
    background: "var(--pending)",
    color: "#ffffff",
  },
  retired: { background: "var(--occupied-soft)", color: "var(--occupied)" },
};

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
  // 點選「本人改期審核中」時段時，右側面板的琥珀色說明（FR-017、ui/plan.md §5）
  const [rescheduleNotice, setRescheduleNotice] = useState<string>("");
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
    setRescheduleNotice("");

    if (
      slot.myRescheduleRequest &&
      (slot.availabilityStatus === "reschedule_pending_by_me" ||
        slot.slotStatus === "MY_RESCHEDULE_PENDING")
    ) {
      // 本人改期審核中的新時段不保留、不占用（FR-003），不選取、送出預約時也不會送出任何預約
      const ref = slot.myRescheduleRequest;
      setSelectedSlot(null);
      setRescheduleNotice(
        `${selectedDate} ${slot.slotName} ${slot.startTime}–${slot.endTime} 是您改期申請 ${ref.requestNumber} 的新時段（預約 ${ref.reservationNumber} 原為 ${ref.fromReservationDate} ${ref.fromSlot.slotName} ${ref.fromSlot.startTime}–${ref.fromSlot.endTime}）。管理員核准前，這個時段不會替您保留，原預約照常有效。`,
      );
      return;
    }

    if (slot.availabilityStatus === "returned_by_me" || slot.slotStatus === "MY_RETURNED") {
      setBanner({
        tone: "danger",
        text: `申請失敗：${eq.equipmentCode} ${eq.name} 於 ${selectedDate} ${slot.slotName} ${slot.startTime}–${slot.endTime} 已完成當日借用並歸還結案（或已被其他有效／借用中紀錄占用），同一固定時段不重新開放重複預約。`,
      });
      return;
    }

    if (
      slot.availabilityStatus === "pending_by_me" ||
      slot.availabilityStatus === "booked_by_me" ||
      slot.availabilityStatus === "checked_out_by_me"
    ) {
      const statusLabel =
        slot.availabilityStatus === "pending_by_me"
          ? "待審核"
          : slot.availabilityStatus === "checked_out_by_me"
            ? "借用中"
            : "已核准／有效";
      setBanner({
        tone: "danger",
        text: `重複申請遭拒：您已對 ${eq.equipmentCode} ${eq.name} 於 ${selectedDate} ${slot.slotName} ${slot.startTime}–${slot.endTime} 持有一筆未結束的「${statusLabel}」紀錄，同一成員不得對同一設備時段重複申請。`,
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
      // 與即時改期、核准改期同時搶同一時段而失敗（FR-014）：提示剛被占用，重新載入後該格顯示「已被預約」
      const isEquipmentUnavailable =
        err instanceof ApiError && err.code === "EQUIPMENT_UNAVAILABLE";
      const msg =
        err instanceof ApiError && err.code === "RESERVATION_CONFLICT"
          ? `預約失敗：${selectedSlot.equipmentCode} ${selectedSlot.equipmentName} ${selectedDate} ${selectedSlot.slotName} ${selectedSlot.startTime}–${selectedSlot.endTime} 剛被其他預約占用，請改選其他時段。`
          : isEquipmentUnavailable
            ? UI_TEXT.bookingEquipmentUnavailable(
                err.message,
                `${selectedSlot.equipmentCode} ${selectedSlot.equipmentName}`,
                err.message.includes("停用") ? "retired" : "maintenance",
              )
            : err instanceof ApiError
              ? err.message
              : "預約申請送出失敗，請稍後再試。";
      setBanner({ tone: "danger", text: msg });
      if (
        err instanceof ApiError &&
        (err.code === "RESERVATION_CONFLICT" || isEquipmentUnavailable)
      ) {
        // FR-006、US1 情境 9：設備已送修或停用時清除右側選取，重新拉取後送修中設備不能點選、停用設備消失
        setSelectedSlot(null);
      }
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
                setRescheduleNotice("");
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
                  setRescheduleNotice("");
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          <span>固定時段狀態說明：</span>
          <span className="badge badge-available">可預約</span>
          <span className="badge badge-pending">本人待審核</span>
          <span className="badge badge-mine">本人已預約</span>
          <span className="badge badge-loan">本人借用中</span>
          <span className="badge badge-returned">本人已歸還</span>
          <SlotStatusBadge
            status="reschedule_pending_by_me"
            slotStatus="MY_RESCHEDULE_PENDING"
            isBookable={false}
          />
          <span className="badge badge-occupied">已被預約（不揭露他人身分）</span>
        </div>
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
        <>
          <div
            style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--muted)" }}
            data-testid="booking-equipment-count"
          >
            {UI_TEXT.bookingEquipmentCount(equipments.length)}
          </div>
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
                      <span
                        className={`badge ${EQUIPMENT_STATUS_BADGE_CLASS[eq.status]}`}
                        style={EQUIPMENT_STATUS_BADGE_STYLE[eq.status]}
                      >
                        {UI_TEXT.equipmentStatus[eq.status]}
                      </span>
                    </div>
                    <h2 style={{ margin: "6px 0 2px", fontSize: "17px" }}>{eq.name}</h2>
                    <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                      分類：{eq.category} ｜ 審核規則：
                      {eq.requiresApproval
                        ? "送出後進入待審核，核准前不占用時段"
                        : "送出後立即成為已核准／有效並占用時段"}
                    </div>
                    {eq.status === "maintenance" && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          borderLeft: "3px solid var(--pending)",
                          background: "var(--pending-soft)",
                          borderRadius: "6px",
                          fontSize: "13px",
                        }}
                        data-testid={`maintenance-notice-${eq.equipmentCode}`}
                      >
                        {UI_TEXT.bookingMaintenanceNotice}
                      </div>
                    )}
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
                      // FR-014：送修中設備的所有時段為不能點選的灰色格子，點選時右側面板不變
                      const isMaintenance = eq.status === "maintenance";
                      const disabled =
                        isMaintenance ||
                        submitting ||
                        !isDateInRange ||
                        slot.availabilityStatus === "booked_by_others";
                      const isMyReschedulePending =
                        slot.availabilityStatus === "reschedule_pending_by_me" ||
                        slot.slotStatus === "MY_RESCHEDULE_PENDING";
                      const isAlreadyMine =
                        slot.availabilityStatus === "pending_by_me" ||
                        slot.availabilityStatus === "booked_by_me" ||
                        slot.availabilityStatus === "checked_out_by_me" ||
                        slot.availabilityStatus === "returned_by_me";

                      const subnote = isMaintenance
                        ? ""
                        : isMyReschedulePending && slot.myRescheduleRequest
                          ? `改期申請 ${slot.myRescheduleRequest.requestNumber}`
                          : slot.availabilityStatus === "checked_out_by_me"
                            ? "已登記領取（不可取消）"
                            : slot.availabilityStatus === "returned_by_me"
                              ? "已歸還結案（不重開預約）"
                              : slot.availabilityStatus === "booked_by_me"
                                ? "已核准／有效（待領取）"
                                : slot.availabilityStatus === "pending_by_me"
                                  ? "等待管理員核准"
                                  : slot.availabilityStatus === "booked_by_others"
                                    ? "已被占用（不揭露借用人身分）"
                                    : !slot.isBookable
                                      ? "已逾申請截止時間"
                                      : "";

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
                            border: `1.5px ${isMyReschedulePending ? "dashed" : "solid"} ${
                              isMyReschedulePending
                                ? "var(--pending)"
                                : isSelected
                                  ? "var(--primary)"
                                  : slot.availabilityStatus === "checked_out_by_me"
                                    ? "var(--loan)"
                                    : slot.availabilityStatus === "returned_by_me"
                                      ? "var(--returned)"
                                      : "var(--line)"
                            }`,
                            borderRadius: "10px",
                            background: isMyReschedulePending
                              ? "var(--surface)"
                              : slot.availabilityStatus === "checked_out_by_me"
                                ? "var(--loan-soft)"
                                : slot.availabilityStatus === "returned_by_me"
                                  ? "var(--returned-soft)"
                                  : disabled || isAlreadyMine
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
                            {isMaintenance ? (
                              <span
                                className="badge"
                                style={{
                                  background: "var(--surface)",
                                  color: "var(--pending)",
                                  border: "1px solid var(--pending)",
                                }}
                                data-testid={`slot-maintenance-${eq.equipmentCode}-${slot.slotCode}`}
                              >
                                {UI_TEXT.equipmentStatus.maintenance}
                              </span>
                            ) : (
                              <SlotStatusBadge
                                status={slot.availabilityStatus}
                                slotStatus={slot.slotStatus}
                                isBookable={slot.isBookable}
                              />
                            )}
                          </div>
                          <span
                            className="mono"
                            style={{ fontSize: "13px", color: "var(--muted)" }}
                          >
                            {slot.startTime}–{slot.endTime}
                          </span>
                          {subnote && (
                            <span
                              className={isMyReschedulePending ? "mono" : undefined}
                              style={{ fontSize: "11px", color: "var(--muted)" }}
                              data-testid={
                                isMyReschedulePending
                                  ? `slot-reschedule-${eq.equipmentCode}-${slot.slotCode}`
                                  : undefined
                              }
                            >
                              {subnote}
                            </span>
                          )}
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

              {rescheduleNotice && (
                <div
                  role="status"
                  data-testid="panel-reschedule-notice"
                  style={{
                    margin: "0 0 12px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "var(--pending-soft)",
                    border: "1px dashed var(--pending)",
                    color: "var(--ink)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  <div>{rescheduleNotice}</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-block"
                    style={{ marginTop: "10px" }}
                    onClick={onGoToMyReservations}
                    data-testid="panel-go-my-reservations"
                  >
                    查看我的預約
                  </button>
                </div>
              )}

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
        </>
      )}
    </div>
  );
}
