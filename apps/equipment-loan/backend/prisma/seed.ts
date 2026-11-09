import { randomBytes } from "node:crypto";
import { prisma, pool } from "../src/db/prisma.js";
import { hashPassword } from "../src/utils/password.js";

function getTaipeiDateOffset(daysOffset: number): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + daysOffset));
}

// 改期申請編號：RR- 加申請當下的 Asia/Taipei 日期 yyyyMMdd 加隨機碼（tasks.md Notes 待確認 1）
function generateRescheduleRequestNo(appliedAt: Date): string {
  const compactDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(appliedAt)
    .replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `RR-${compactDate}-${suffix}`;
}

export async function seedDatabase(): Promise<void> {
  await prisma.reschedule_requests.deleteMany();
  await prisma.reservations.deleteMany();
  await prisma.sessions.deleteMany();
  await prisma.captcha_challenges.deleteMany();
  await prisma.time_slots.deleteMany();
  await prisma.equipments.deleteMany();
  await prisma.users.deleteMany();

  const memberHash = await hashPassword("Member@2026");
  const adminHash = await hashPassword("Admin@2026");

  const linYating = await prisma.users.create({
    data: {
      id: "11111111-1111-4111-8111-111111111101",
      username: "lin.yating",
      password_hash: memberHash,
      display_name: "林雅婷",
      role: "member",
    },
  });

  const chenGuanting = await prisma.users.create({
    data: {
      id: "11111111-1111-4111-8111-111111111102",
      username: "chen.guanting",
      password_hash: memberHash,
      display_name: "陳冠廷",
      role: "member",
    },
  });

  const wuChenghan = await prisma.users.create({
    data: {
      id: "11111111-1111-4111-8111-111111111103",
      username: "wu.chenghan",
      password_hash: adminHash,
      display_name: "吳承翰",
      role: "admin",
    },
  });

  const eq101 = await prisma.equipments.create({
    data: {
      id: "22222222-2222-4222-8222-222222222101",
      equipment_code: "EQ-101",
      name: "高解析度光學顯微鏡 Olympus BX53",
      category: "光學檢測",
      status: "available",
      requires_approval: true,
      updated_by: wuChenghan.id,
    },
  });

  const eq102 = await prisma.equipments.create({
    data: {
      id: "22222222-2222-4222-8222-222222222102",
      equipment_code: "EQ-102",
      name: "四通道數位示波器 Keysight DSOX3024T",
      category: "電子量測",
      status: "available",
      requires_approval: true,
      updated_by: wuChenghan.id,
    },
  });

  const eq103 = await prisma.equipments.create({
    data: {
      id: "22222222-2222-4222-8222-222222222103",
      equipment_code: "EQ-103",
      name: "高精度工業熱像儀 FLIR E86",
      category: "熱流分析",
      status: "available",
      requires_approval: false,
    },
  });

  const eq104 = await prisma.equipments.create({
    data: {
      id: "22222222-2222-4222-8222-222222222104",
      equipment_code: "EQ-104",
      name: "微量分光光度計 Thermo NanoDrop One",
      category: "生醫分析",
      status: "available",
      requires_approval: false,
    },
  });

  const slotMorning = await prisma.time_slots.create({
    data: {
      id: "33333333-3333-4333-8333-333333333001",
      slot_code: "morning",
      name: "上午",
      start_time: "09:00",
      end_time: "12:00",
      sort_order: 1,
    },
  });

  const slotAfternoon = await prisma.time_slots.create({
    data: {
      id: "33333333-3333-4333-8333-333333333002",
      slot_code: "afternoon",
      name: "下午",
      start_time: "13:00",
      end_time: "17:00",
      sort_order: 2,
    },
  });

  const slotEvening = await prisma.time_slots.create({
    data: {
      id: "33333333-3333-4333-8333-333333333003",
      slot_code: "evening",
      name: "晚間",
      start_time: "18:00",
      end_time: "21:00",
      sort_order: 3,
    },
  });

  const yesterday = getTaipeiDateOffset(-1);
  const today = getTaipeiDateOffset(0);
  const tomorrow = getTaipeiDateOffset(1);
  const dayAfterTomorrow = getTaipeiDateOffset(2);
  const threeDaysLater = getTaipeiDateOffset(3);
  const fourDaysLater = getTaipeiDateOffset(4);

  await prisma.reservations.createMany({
    data: [
      {
        id: "44444444-4444-4444-8444-444444444001",
        reservation_no: "RV-20261108-01",
        user_id: linYating.id,
        equipment_id: eq102.id,
        reservation_date: today,
        slot_id: slotMorning.id,
        status: "returned",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T01:30:00Z"),
        checked_out_by: wuChenghan.id,
        checked_out_at: new Date("2026-11-09T01:05:00Z"),
        returned_by: wuChenghan.id,
        returned_at: new Date("2026-11-09T03:40:00Z"),
        created_at: new Date("2026-11-07T07:10:00Z"),
        updated_at: new Date("2026-11-09T03:40:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444002",
        reservation_no: "RV-20261108-02",
        user_id: chenGuanting.id,
        equipment_id: eq104.id,
        reservation_date: today,
        slot_id: slotMorning.id,
        status: "confirmed",
        created_at: new Date("2026-11-08T00:50:00Z"),
        updated_at: new Date("2026-11-08T00:50:00Z"),
        updated_by: chenGuanting.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444003",
        reservation_no: "RV-20261108-03",
        user_id: linYating.id,
        equipment_id: eq101.id,
        reservation_date: today,
        slot_id: slotAfternoon.id,
        status: "checked_out",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T02:40:00Z"),
        checked_out_by: wuChenghan.id,
        checked_out_at: new Date("2026-11-09T05:05:00Z"),
        created_at: new Date("2026-11-08T01:20:00Z"),
        updated_at: new Date("2026-11-09T05:05:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444006",
        reservation_no: "RV-20261108-06",
        user_id: linYating.id,
        equipment_id: eq103.id,
        reservation_date: today,
        slot_id: slotEvening.id,
        status: "confirmed",
        created_at: new Date("2026-11-08T07:20:00Z"),
        updated_at: new Date("2026-11-08T07:20:00Z"),
        updated_by: linYating.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444011",
        reservation_no: "RV-20261107-05",
        user_id: chenGuanting.id,
        equipment_id: eq103.id,
        reservation_date: yesterday,
        slot_id: slotEvening.id,
        status: "checked_out",
        checked_out_by: wuChenghan.id,
        checked_out_at: new Date("2026-11-08T10:02:00Z"),
        created_at: new Date("2026-11-07T02:15:00Z"),
        updated_at: new Date("2026-11-08T10:02:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444004",
        reservation_no: "RV-20261108-04",
        user_id: linYating.id,
        equipment_id: eq101.id,
        reservation_date: tomorrow,
        slot_id: slotMorning.id,
        status: "confirmed",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T03:00:00Z"),
        created_at: new Date("2026-11-08T01:12:00Z"),
        updated_at: new Date("2026-11-08T03:00:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444012",
        reservation_no: "RV-20261108-07",
        user_id: chenGuanting.id,
        equipment_id: eq101.id,
        reservation_date: tomorrow,
        slot_id: slotAfternoon.id,
        status: "confirmed",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T03:15:00Z"),
        created_at: new Date("2026-11-08T01:25:00Z"),
        updated_at: new Date("2026-11-08T03:15:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444005",
        reservation_no: "RV-20261108-05",
        user_id: linYating.id,
        equipment_id: eq104.id,
        reservation_date: dayAfterTomorrow,
        slot_id: slotMorning.id,
        status: "confirmed",
        created_at: new Date("2026-11-08T01:40:00Z"),
        updated_at: new Date("2026-11-08T01:40:00Z"),
        updated_by: linYating.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444013",
        reservation_no: "RV-20261107-06",
        user_id: linYating.id,
        equipment_id: eq103.id,
        reservation_date: tomorrow,
        slot_id: slotMorning.id,
        status: "cancelled",
        cancelled_at: new Date("2026-11-08T11:30:00Z"),
        created_at: new Date("2026-11-07T03:05:00Z"),
        updated_at: new Date("2026-11-08T11:30:00Z"),
        updated_by: linYating.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444007",
        reservation_no: "RV-20261109-07",
        user_id: linYating.id,
        equipment_id: eq102.id,
        reservation_date: tomorrow,
        slot_id: slotAfternoon.id,
        status: "rejected",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T08:05:00Z"),
        reject_reason: "該時段已有實驗室年度高頻校驗排程，請改申請其他時段或隔日借用。",
        created_at: new Date("2026-11-08T06:20:00Z"),
        updated_at: new Date("2026-11-08T08:05:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444008",
        reservation_no: "RV-20261109-08",
        user_id: linYating.id,
        equipment_id: eq101.id,
        reservation_date: tomorrow,
        slot_id: slotEvening.id,
        status: "pending_approval",
        created_at: new Date("2026-11-09T01:45:00Z"),
        updated_at: new Date("2026-11-09T01:45:00Z"),
        updated_by: linYating.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444009",
        reservation_no: "RV-20261109-09",
        user_id: chenGuanting.id,
        equipment_id: eq101.id,
        reservation_date: tomorrow,
        slot_id: slotEvening.id,
        status: "pending_approval",
        created_at: new Date("2026-11-09T01:52:00Z"),
        updated_at: new Date("2026-11-09T01:52:00Z"),
        updated_by: chenGuanting.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444010",
        reservation_no: "RV-20261109-10",
        user_id: linYating.id,
        equipment_id: eq102.id,
        reservation_date: dayAfterTomorrow,
        slot_id: slotAfternoon.id,
        status: "pending_approval",
        created_at: new Date("2026-11-09T02:05:00Z"),
        updated_at: new Date("2026-11-09T02:05:00Z"),
        updated_by: linYating.id,
      },
      // 006 US1：陳冠廷占用 EQ-104 後天晚間，展示林雅婷 RV-20261108-05（EQ-104 後天上午，可即時改期到後天下午）改到晚間時被拒絕
      {
        id: "44444444-4444-4444-8444-444444444014",
        reservation_no: "RV-20261109-13",
        user_id: chenGuanting.id,
        equipment_id: eq104.id,
        reservation_date: dayAfterTomorrow,
        slot_id: slotEvening.id,
        status: "confirmed",
        created_at: new Date("2026-11-09T03:30:00Z"),
        updated_at: new Date("2026-11-09T03:30:00Z"),
        updated_by: chenGuanting.id,
      },
      // 006 US1：林雅婷在 EQ-103 的預約，已由三天後上午即時改期到三天後下午
      {
        id: "44444444-4444-4444-8444-444444444015",
        reservation_no: "RV-20261108-08",
        user_id: linYating.id,
        equipment_id: eq103.id,
        reservation_date: threeDaysLater,
        slot_id: slotAfternoon.id,
        status: "confirmed",
        created_at: new Date("2026-11-08T02:20:00Z"),
        updated_at: new Date("2026-11-08T08:20:00Z"),
        updated_by: linYating.id,
      },
      // 006 US2：林雅婷占用 EQ-102 三天後下午，展示陳冠廷改期申請核准時新時段已被占用
      {
        id: "44444444-4444-4444-8444-444444444016",
        reservation_no: "RV-20261109-12",
        user_id: linYating.id,
        equipment_id: eq102.id,
        reservation_date: threeDaysLater,
        slot_id: slotAfternoon.id,
        status: "confirmed",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-09T02:30:00Z"),
        created_at: new Date("2026-11-09T02:10:00Z"),
        updated_at: new Date("2026-11-09T02:30:00Z"),
        updated_by: wuChenghan.id,
      },
      // 006 US2：陳冠廷在需人工審核設備 EQ-102 四天後上午的預約，申請改到三天後下午
      {
        id: "44444444-4444-4444-8444-444444444017",
        reservation_no: "RV-20261108-11",
        user_id: chenGuanting.id,
        equipment_id: eq102.id,
        reservation_date: fourDaysLater,
        slot_id: slotMorning.id,
        status: "confirmed",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T06:00:00Z"),
        created_at: new Date("2026-11-08T04:30:00Z"),
        updated_at: new Date("2026-11-08T06:00:00Z"),
        updated_by: wuChenghan.id,
      },
    ],
  });

  // 006 US1：免審核設備即時改期的「改期成功」紀錄（不經管理員審核，reviewed_by、reviewed_at 為 null）
  const instantRescheduledAt = new Date("2026-11-08T08:20:00Z");
  await prisma.reschedule_requests.create({
    data: {
      id: "55555555-5555-4555-8555-555555555001",
      request_no: generateRescheduleRequestNo(instantRescheduledAt),
      reservation_id: "44444444-4444-4444-8444-444444444015",
      user_id: linYating.id,
      from_reservation_date: threeDaysLater,
      from_slot_id: slotMorning.id,
      to_reservation_date: threeDaysLater,
      to_slot_id: slotAfternoon.id,
      status: "approved",
      reviewed_by: null,
      reviewed_at: null,
      created_at: instantRescheduledAt,
      updated_at: instantRescheduledAt,
      updated_by: linYating.id,
    },
  });

  // 006 US2：需人工審核設備的改期申請範例（FR-015、US2 情境 8）
  // 可以核准：林雅婷 RV-20261108-04（EQ-101 明天上午）申請改到後天晚間，新時段未被占用
  const approvableAppliedAt = new Date("2026-11-09T01:15:00Z");
  // 核准會被拒：陳冠廷 RV-20261108-11（EQ-102 四天後上午）申請改到三天後下午，新時段已被 RV-20261109-12 占用
  const conflictingAppliedAt = new Date("2026-11-09T01:50:00Z");
  // 改期被駁回：陳冠廷 RV-20261108-07（EQ-101 明天下午）申請改到後天上午，由吳承翰駁回
  const rejectedAppliedAt = new Date("2026-11-08T09:10:00Z");
  const rejectedReviewedAt = new Date("2026-11-08T10:30:00Z");
  await prisma.reschedule_requests.createMany({
    data: [
      {
        id: "55555555-5555-4555-8555-555555555002",
        request_no: generateRescheduleRequestNo(approvableAppliedAt),
        reservation_id: "44444444-4444-4444-8444-444444444004",
        user_id: linYating.id,
        from_reservation_date: tomorrow,
        from_slot_id: slotMorning.id,
        to_reservation_date: dayAfterTomorrow,
        to_slot_id: slotEvening.id,
        status: "pending_approval",
        created_at: approvableAppliedAt,
        updated_at: approvableAppliedAt,
        updated_by: linYating.id,
      },
      {
        id: "55555555-5555-4555-8555-555555555003",
        request_no: generateRescheduleRequestNo(conflictingAppliedAt),
        reservation_id: "44444444-4444-4444-8444-444444444017",
        user_id: chenGuanting.id,
        from_reservation_date: fourDaysLater,
        from_slot_id: slotMorning.id,
        to_reservation_date: threeDaysLater,
        to_slot_id: slotAfternoon.id,
        status: "pending_approval",
        created_at: conflictingAppliedAt,
        updated_at: conflictingAppliedAt,
        updated_by: chenGuanting.id,
      },
      {
        id: "55555555-5555-4555-8555-555555555004",
        request_no: generateRescheduleRequestNo(rejectedAppliedAt),
        reservation_id: "44444444-4444-4444-8444-444444444012",
        user_id: chenGuanting.id,
        from_reservation_date: tomorrow,
        from_slot_id: slotAfternoon.id,
        to_reservation_date: dayAfterTomorrow,
        to_slot_id: slotMorning.id,
        status: "rejected",
        reviewed_by: wuChenghan.id,
        reviewed_at: rejectedReviewedAt,
        reject_reason: "後天上午顯微鏡需保留給校外合作計畫，請改選其他時段後重新申請。",
        created_at: rejectedAppliedAt,
        updated_at: rejectedReviewedAt,
        updated_by: wuChenghan.id,
      },
    ],
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
      await pool.end();
    })
    .catch(async (err) => {
      console.error(err);
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    });
}
