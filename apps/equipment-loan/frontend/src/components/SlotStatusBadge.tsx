import React from "react";

export type SlotAvailabilityStatus = "available" | "booked_by_me" | "booked_by_others";

interface SlotStatusBadgeProps {
  status: SlotAvailabilityStatus;
  isBookable: boolean;
}

export function SlotStatusBadge({ status, isBookable }: SlotStatusBadgeProps): React.ReactElement {
  if (status === "booked_by_me") {
    return <span className="badge badge-mine">本人已預約</span>;
  }
  if (status === "booked_by_others") {
    return <span className="badge badge-occupied">已被預約</span>;
  }
  if (!isBookable) {
    return <span className="badge badge-occupied">時段已開始</span>;
  }
  return <span className="badge badge-available">可預約</span>;
}
