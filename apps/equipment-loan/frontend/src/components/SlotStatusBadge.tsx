import React from "react";
import type { SlotAvailabilityStatus, SlotStatus } from "../api/client";

export type { SlotAvailabilityStatus, SlotStatus };

interface SlotStatusBadgeProps {
  status: SlotAvailabilityStatus;
  slotStatus?: SlotStatus;
  isBookable: boolean;
}

export function SlotStatusBadge({
  status,
  slotStatus,
  isBookable,
}: SlotStatusBadgeProps): React.ReactElement {
  if (status === "checked_out_by_me" || slotStatus === "MY_CHECKED_OUT") {
    return <span className="badge badge-loan">本人借用中</span>;
  }
  if (status === "returned_by_me" || slotStatus === "MY_RETURNED") {
    return <span className="badge badge-returned">本人已歸還</span>;
  }
  if (status === "booked_by_me" || slotStatus === "MY_CONFIRMED") {
    return <span className="badge badge-mine">本人已預約</span>;
  }
  if (status === "pending_by_me" || slotStatus === "MY_PENDING") {
    return <span className="badge badge-pending">本人待審核</span>;
  }
  if (status === "booked_by_others" || slotStatus === "OCCUPIED") {
    return <span className="badge badge-occupied">已被預約</span>;
  }
  if (!isBookable) {
    return <span className="badge badge-occupied">時段已開始</span>;
  }
  return <span className="badge badge-available">可預約</span>;
}
