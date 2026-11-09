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

export async function seedDatabase(): Promise<void> {
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

  const today = getTaipeiDateOffset(0);
  const tomorrow = getTaipeiDateOffset(1);
  const dayAfterTomorrow = getTaipeiDateOffset(2);

  await prisma.reservations.createMany({
    data: [
      {
        id: "44444444-4444-4444-8444-444444444001",
        reservation_no: "RV-20261108-01",
        user_id: linYating.id,
        equipment_id: eq102.id,
        reservation_date: today,
        slot_id: slotMorning.id,
        status: "confirmed",
        created_at: new Date("2026-11-07T07:10:00Z"),
        updated_at: new Date("2026-11-07T07:10:00Z"),
        updated_by: linYating.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444002",
        reservation_no: "RV-20261108-02",
        user_id: chenGuanting.id,
        equipment_id: eq103.id,
        reservation_date: tomorrow,
        slot_id: slotMorning.id,
        status: "cancelled",
        cancelled_at: new Date("2026-11-08T00:50:00Z"),
        created_at: new Date("2026-11-07T08:20:00Z"),
        updated_at: new Date("2026-11-08T00:50:00Z"),
        updated_by: chenGuanting.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444003",
        reservation_no: "RV-20261108-03",
        user_id: linYating.id,
        equipment_id: eq101.id,
        reservation_date: tomorrow,
        slot_id: slotMorning.id,
        status: "confirmed",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T02:40:00Z"),
        created_at: new Date("2026-11-08T01:12:00Z"),
        updated_at: new Date("2026-11-08T02:40:00Z"),
        updated_by: wuChenghan.id,
      },
      {
        id: "44444444-4444-4444-8444-444444444004",
        reservation_no: "RV-20261108-04",
        user_id: chenGuanting.id,
        equipment_id: eq101.id,
        reservation_date: tomorrow,
        slot_id: slotAfternoon.id,
        status: "confirmed",
        reviewed_by: wuChenghan.id,
        reviewed_at: new Date("2026-11-08T02:55:00Z"),
        created_at: new Date("2026-11-08T01:25:00Z"),
        updated_at: new Date("2026-11-08T02:55:00Z"),
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
        id: "44444444-4444-4444-8444-444444444006",
        reservation_no: "RV-20261107-06",
        user_id: linYating.id,
        equipment_id: eq103.id,
        reservation_date: today,
        slot_id: slotEvening.id,
        status: "cancelled",
        cancelled_at: new Date("2026-11-07T11:30:00Z"),
        created_at: new Date("2026-11-07T03:05:00Z"),
        updated_at: new Date("2026-11-07T11:30:00Z"),
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
        created_at: new Date("2026-11-08T06:15:00Z"),
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
        created_at: new Date("2026-11-09T01:10:00Z"),
        updated_at: new Date("2026-11-09T01:10:00Z"),
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
        created_at: new Date("2026-11-09T01:25:00Z"),
        updated_at: new Date("2026-11-09T01:25:00Z"),
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
        created_at: new Date("2026-11-09T02:00:00Z"),
        updated_at: new Date("2026-11-09T02:00:00Z"),
        updated_by: linYating.id,
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
