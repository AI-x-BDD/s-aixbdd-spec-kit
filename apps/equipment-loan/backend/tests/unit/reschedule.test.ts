import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 單元測試不連資料庫：以假的互動式交易取代 prisma，只驗證 createRescheduleRequest 在寫入前的可改期判斷（FR-001）
const fakeTx = vi.hoisted(() => ({
  $executeRaw: vi.fn(async () => 0),
  reservations: { findFirst: vi.fn() },
  time_slots: { findFirst: vi.fn() },
  reschedule_requests: { findFirst: vi.fn(), create: vi.fn() },
}));

vi.mock("../../src/db/prisma.js", () => ({
  pool: {},
  prisma: {
    $transaction: async (fn: (tx: typeof fakeTx) => Promise<unknown>) => fn(fakeTx),
    reschedule_requests: { findFirst: vi.fn() },
  },
}));

import { AppError } from "../../src/middleware/errorHandler.js";
import { createRescheduleRequest } from "../../src/services/rescheduleService.js";
import {
  toMemberReservationDto,
  type ReservationStatus,
} from "../../src/services/reservationService.js";
import {
  addDaysToDateStr,
  getSlotStartUtc,
  hasSlotStarted,
  isWithinOpenDateWindow,
} from "../../src/utils/taipeiTime.js";

// 2026-11-09 14:30 Asia/Taipei
const NOW = new Date("2026-11-09T06:30:00Z");

const MORNING = {
  id: "slot-morning",
  name: "上午",
  start_time: "09:00",
  end_time: "12:00",
  sort_order: 1,
};
const AFTERNOON = {
  id: "slot-afternoon",
  name: "下午",
  start_time: "13:00",
  end_time: "17:00",
  sort_order: 2,
};
const EVENING = {
  id: "slot-evening",
  name: "晚上",
  start_time: "18:00",
  end_time: "21:00",
  sort_order: 3,
};

type Slot = typeof MORNING;

function makeReservation(overrides: {
  status?: ReservationStatus;
  date?: string;
  slot?: Slot;
  requiresApproval?: boolean;
}) {
  const slot = overrides.slot ?? EVENING;
  return {
    id: "rv-1",
    reservation_no: "RV-20261109-AAAAAA",
    user_id: "member-1",
    equipment_id: "eq-1",
    reservation_date: new Date(`${overrides.date ?? "2026-11-10"}T00:00:00Z`),
    slot_id: slot.id,
    status: overrides.status ?? "confirmed",
    reviewed_by: null,
    reviewed_at: null,
    reject_reason: null,
    created_at: new Date("2026-11-08T02:00:00Z"),
    cancelled_at: null,
    equipment: {
      equipment_code: "EQ-001",
      name: "投影機",
      category: "影音",
      requires_approval: overrides.requiresApproval ?? false,
    },
    slot,
    reschedule_requests: [],
  };
}

async function expectRescheduleError(
  promise: Promise<unknown>,
  code: string,
  status: number,
): Promise<AppError> {
  const err = await promise.then(
    () => {
      throw new Error("預期拒絕改期，但改期成功");
    },
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(AppError);
  expect((err as AppError).code).toBe(code);
  expect((err as AppError).status).toBe(status);
  return err as AppError;
}

describe("taipeiTime：時段開始時間換算與 7 天範圍（research §5）", () => {
  it("把 Asia/Taipei 的日期與時段開始時間換算成 UTC 時間點", () => {
    expect(getSlotStartUtc("2026-11-09", "09:00").toISOString()).toBe("2026-11-09T01:00:00.000Z");
    expect(getSlotStartUtc("2026-11-09", "18:00").toISOString()).toBe("2026-11-09T10:00:00.000Z");
    // 台北 00:30 仍是 UTC 前一天
    expect(getSlotStartUtc("2026-11-10", "00:30").toISOString()).toBe("2026-11-09T16:30:00.000Z");
  });

  it("時段開始時間到達的那一刻即視為已開始", () => {
    const start = getSlotStartUtc("2026-11-09", "18:00");
    const justBefore = new Date(start.getTime() - 60_000);
    expect(hasSlotStarted("2026-11-09", "18:00", justBefore)).toBe(false);
    expect(hasSlotStarted("2026-11-09", "18:00", start)).toBe(true);
    expect(hasSlotStarted("2026-11-08", "18:00", NOW)).toBe(true);
    expect(hasSlotStarted("2026-11-10", "09:00", NOW)).toBe(false);
  });

  it("新日期只接受當日起算 7 天內（今日至今日 + 6 天）", () => {
    expect(addDaysToDateStr("2026-11-09", 6)).toBe("2026-11-15");
    expect(isWithinOpenDateWindow("2026-11-09", NOW)).toBe(true);
    expect(isWithinOpenDateWindow("2026-11-15", NOW)).toBe(true);
    expect(isWithinOpenDateWindow("2026-11-16", NOW)).toBe(false);
    expect(isWithinOpenDateWindow("2026-11-08", NOW)).toBe(false);
    expect(isWithinOpenDateWindow("2026-02-30", NOW)).toBe(false);
    // 台北已跨日（UTC 仍是 11-09 16:30），7 天範圍改從 11-10 起算
    const afterMidnight = new Date("2026-11-09T16:30:00Z");
    expect(isWithinOpenDateWindow("2026-11-09", afterMidnight)).toBe(false);
    expect(isWithinOpenDateWindow("2026-11-16", afterMidnight)).toBe(true);
  });
});

describe("可改期條件：canReschedule（FR-001）", () => {
  it("只有原時段尚未開始的「已核准／有效」預約可以改期", () => {
    const statuses: ReservationStatus[] = [
      "pending_approval",
      "confirmed",
      "checked_out",
      "returned",
      "rejected",
      "cancelled",
    ];
    for (const status of statuses) {
      const dto = toMemberReservationDto(makeReservation({ status }), NOW);
      expect(dto.canReschedule, status).toBe(status === "confirmed");
    }
  });

  it("原時段已開始的已核准預約不能改期", () => {
    const started = toMemberReservationDto(
      makeReservation({ date: "2026-11-09", slot: AFTERNOON }),
      NOW,
    );
    const notStarted = toMemberReservationDto(
      makeReservation({ date: "2026-11-09", slot: EVENING }),
      NOW,
    );
    expect(started.canReschedule).toBe(false);
    expect(notStarted.canReschedule).toBe(true);
  });
});

describe("可改期條件：createRescheduleRequest 的拒絕判斷（FR-001）", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    fakeTx.$executeRaw.mockClear();
    fakeTx.reservations.findFirst.mockReset();
    fakeTx.time_slots.findFirst.mockReset();
    fakeTx.reschedule_requests.findFirst.mockReset().mockResolvedValue(null);
    fakeTx.reschedule_requests.create.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function arrange(reservation: ReturnType<typeof makeReservation>, toSlot: Slot) {
    // 第 1 次 findFirst 讀原預約，第 2 次查本人在新時段的其他未結束預約
    fakeTx.reservations.findFirst.mockResolvedValueOnce(reservation).mockResolvedValue(null);
    fakeTx.time_slots.findFirst.mockResolvedValue(toSlot);
  }

  const baseParams = { userId: "member-1", reservationId: "rv-1" };

  it("預約狀態不是「已核准／有效」時回 RESCHEDULE_NOT_ALLOWED（409）", async () => {
    for (const status of [
      "pending_approval",
      "checked_out",
      "returned",
      "rejected",
      "cancelled",
    ] as const) {
      arrange(makeReservation({ status }), MORNING);
      const err = await expectRescheduleError(
        createRescheduleRequest({
          ...baseParams,
          toReservationDate: "2026-11-11",
          toSlotId: MORNING.id,
        }),
        "RESCHEDULE_NOT_ALLOWED",
        409,
      );
      expect(err.message).toContain("只有原時段尚未開始的「已核准／有效」預約可以改期");
    }
    expect(fakeTx.reschedule_requests.create).not.toHaveBeenCalled();
  });

  it("原時段已開始時回 RESCHEDULE_NOT_ALLOWED（409）", async () => {
    arrange(makeReservation({ date: "2026-11-09", slot: AFTERNOON }), MORNING);
    const err = await expectRescheduleError(
      createRescheduleRequest({
        ...baseParams,
        toReservationDate: "2026-11-11",
        toSlotId: MORNING.id,
      }),
      "RESCHEDULE_NOT_ALLOWED",
      409,
    );
    expect(err.message).toContain("已開始");
  });

  it("新時段與原時段相同時回 RESCHEDULE_TARGET_INVALID（400）", async () => {
    arrange(makeReservation({ date: "2026-11-10", slot: EVENING }), EVENING);
    const err = await expectRescheduleError(
      createRescheduleRequest({
        ...baseParams,
        toReservationDate: "2026-11-10",
        toSlotId: EVENING.id,
      }),
      "RESCHEDULE_TARGET_INVALID",
      400,
    );
    expect(err.message).toContain("新時段不能與原時段相同");
  });

  it("新日期超出當日起算 7 天時回 RESCHEDULE_TARGET_INVALID（400）", async () => {
    arrange(makeReservation({ date: "2026-11-10", slot: EVENING }), MORNING);
    const err = await expectRescheduleError(
      createRescheduleRequest({
        ...baseParams,
        toReservationDate: "2026-11-16",
        toSlotId: MORNING.id,
      }),
      "RESCHEDULE_TARGET_INVALID",
      400,
    );
    expect(err.message).toContain("2026-11-09 至 2026-11-15");
  });

  it("新時段已開始時回 RESCHEDULE_TARGET_INVALID（400）", async () => {
    arrange(makeReservation({ date: "2026-11-10", slot: EVENING }), MORNING);
    const err = await expectRescheduleError(
      createRescheduleRequest({
        ...baseParams,
        toReservationDate: "2026-11-09",
        toSlotId: MORNING.id,
      }),
      "RESCHEDULE_TARGET_INVALID",
      400,
    );
    expect(err.message).toContain("已開始");
  });
});
