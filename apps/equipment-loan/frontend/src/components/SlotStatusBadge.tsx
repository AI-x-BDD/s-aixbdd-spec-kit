import React from "react";
import type { SlotAvailabilityStatus } from "../api/client";

export type { SlotAvailabilityStatus };

interface SlotStatusBadgeProps {
  status: SlotAvailabilityStatus;
  isBookable: boolean;
}

export function SlotStatusBadge({ status, isBookable }: SlotStatusBadgeProps): React.ReactElement {
  if (status === "booked_by_me") {
    return <span className="badge badge-mine">本人已預約</span>;
  }
  if (status === "pending_by_me") {
    return <span className="badge badge-pending">本人待審核</span>;
  }
  if (status === "booked_by_others") {
    return <span className="badge badge-occupied">已被預約</span>;
  }
  if (!isBookable) {
    return <span className="badge badge-occupied">時段已開始</span>;
  }
  return <span className="badge badge-available">可預約</span>;
}
