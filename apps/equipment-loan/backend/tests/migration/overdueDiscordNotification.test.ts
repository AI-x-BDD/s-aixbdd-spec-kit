import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// 008 無損遷移測試（research §8、FR-020、US1 情境 10）：在獨立測試資料庫依序執行 008 之前的 migration.sql，
// 寫入 003～007 的資料（各種狀態的預約、借用中與已歸還、改期申請與設備狀態變更紀錄），再執行 008 的 migration.sql，
// 確認既有資料表的資料列數與欄位值都不變，且 overdue_notifications 已建立、是空表，狀態與失敗原因 Enum、索引與外鍵都存在。
// 獨立測試資料庫的名稱由 DATABASE_URL 的資料庫名稱加上後綴組成，不會和其他資料庫或其他迭代的測試資料庫同名。

const MIGRATIONS_DIR = fileURLToPath(new URL("../../prisma/migrations", import.meta.url));
const TARGET = "overdue_notifications";

const baseUrl = new URL(
  process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/equipment_loan?schema=public",
);
const TEST_DB = `${baseUrl.pathname.replace(/^\//, "")}_migration_008_test`;
const adminUrl = new URL(baseUrl);
adminUrl.pathname = "/postgres";
adminUrl.search = "";
const testUrl = new URL(baseUrl);
testUrl.pathname = `/${TEST_DB}`;
testUrl.search = "";

const migrations = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const targetIndex = migrations.findIndex((name) => name.endsWith(TARGET));
const before008 = migrations.slice(0, targetIndex);
const migration008 = migrations[targetIndex];

const readSql = (name: string) => readFileSync(join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");

// 008 之前就存在的資料表
const TABLES = [
  "users",
  "captcha_challenges",
  "sessions",
  "equipments",
  "time_slots",
  "reservations",
  "reschedule_requests",
  "equipment_status_changes",
];

const MEMBER = "11111111-1111-4111-8111-1111111110b1";
const ADMIN = "11111111-1111-4111-8111-1111111110b2";
const EQ_AVAILABLE = "22222222-2222-4222-8222-2222222220b1";
const EQ_MAINTENANCE = "22222222-2222-4222-8222-2222222220b2";
const EQ_RETIRED = "22222222-2222-4222-8222-2222222220b3";
const SLOT = "33333333-3333-4333-8333-3333333330b1";

/** 003～007 的資料：每種預約狀態（含借用中的逾期借用）、改期申請，以及設備三種狀態與狀態變更紀錄。 */
const SEED_SQL = `
INSERT INTO "users" ("id", "username", "password_hash", "display_name", "role") VALUES
  ('${MEMBER}', 'mig8.member', 'hash-member', '遷移測試成員', 'member'),
  ('${ADMIN}', 'mig8.admin', 'hash-admin', '遷移測試管理員', 'admin');
INSERT INTO "sessions" ("id", "token", "user_id", "expires_at") VALUES
  ('66666666-6666-4666-8666-6666666660b1', 'mig8-token', '${MEMBER}', '2026-12-31T00:00:00Z');
INSERT INTO "equipments" ("id", "equipment_code", "name", "category", "status", "requires_approval", "updated_by") VALUES
  ('${EQ_AVAILABLE}', 'EQ-N01', '遷移測試可用設備', '遷移測試', 'available', false, NULL),
  ('${EQ_MAINTENANCE}', 'EQ-N02', '遷移測試送修中設備', '遷移測試', 'maintenance', true, '${ADMIN}'),
  ('${EQ_RETIRED}', 'EQ-N03', '遷移測試停用設備', '遷移測試', 'retired', true, '${ADMIN}');
INSERT INTO "time_slots" ("id", "slot_code", "name", "start_time", "end_time", "sort_order") VALUES
  ('${SLOT}', 'morning', '上午', '09:00', '12:00', 1);
INSERT INTO "reservations"
  ("id", "reservation_no", "user_id", "equipment_id", "reservation_date", "slot_id", "status", "cancel_reason",
   "reviewed_by", "reviewed_at", "reject_reason", "checked_out_by", "checked_out_at",
   "returned_by", "returned_at", "cancelled_at") VALUES
  ('44444444-4444-4444-8444-4444444440b1', 'RV-MIG8-01', '${MEMBER}', '${EQ_AVAILABLE}', '2026-10-01', '${SLOT}', 'returned', NULL,
   '${ADMIN}', '2026-09-30T01:00:00Z', NULL, '${ADMIN}', '2026-10-01T01:00:00Z', '${ADMIN}', '2026-10-01T04:00:00Z', NULL),
  ('44444444-4444-4444-8444-4444444440b2', 'RV-MIG8-02', '${MEMBER}', '${EQ_AVAILABLE}', '2026-10-02', '${SLOT}', 'cancelled', 'member_cancelled',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30T02:00:00Z'),
  ('44444444-4444-4444-8444-4444444440b3', 'RV-MIG8-03', '${MEMBER}', '${EQ_AVAILABLE}', '2026-10-03', '${SLOT}', 'rejected', NULL,
   '${ADMIN}', '2026-09-30T03:00:00Z', '設備維護中', NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440b4', 'RV-MIG8-04', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-01', '${SLOT}', 'pending_approval', NULL,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440b5', 'RV-MIG8-05', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-02', '${SLOT}', 'confirmed', NULL,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440b6', 'RV-MIG8-06', '${MEMBER}', '${EQ_AVAILABLE}', '2026-11-09', '${SLOT}', 'checked_out', NULL,
   NULL, NULL, NULL, '${ADMIN}', '2026-11-09T01:05:00Z', NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440b7', 'RV-MIG8-07', '${MEMBER}', '${EQ_MAINTENANCE}', '2026-12-03', '${SLOT}', 'cancelled', 'equipment_maintenance',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T02:00:00Z'),
  ('44444444-4444-4444-8444-4444444440b8', 'RV-MIG8-08', '${MEMBER}', '${EQ_RETIRED}', '2026-12-04', '${SLOT}', 'cancelled', 'equipment_retired',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-02T02:00:00Z'),
  ('44444444-4444-4444-8444-4444444440b9', 'RV-MIG8-09', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-05', '${SLOT}', 'confirmed', NULL,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "reschedule_requests"
  ("id", "request_no", "reservation_id", "user_id", "from_reservation_date", "from_slot_id",
   "to_reservation_date", "to_slot_id", "status", "reviewed_by", "reviewed_at", "expired_at", "expire_reason") VALUES
  ('55555555-5555-4555-8555-5555555550b1', 'RS-MIG8-01', '44444444-4444-4444-8444-4444444440b5', '${MEMBER}', '2026-12-02', '${SLOT}',
   '2026-12-06', '${SLOT}', 'pending_approval', NULL, NULL, NULL, NULL),
  ('55555555-5555-4555-8555-5555555550b2', 'RS-MIG8-02', '44444444-4444-4444-8444-4444444440b9', '${MEMBER}', '2026-11-30', '${SLOT}',
   '2026-12-05', '${SLOT}', 'approved', NULL, NULL, NULL, NULL),
  ('55555555-5555-4555-8555-5555555550b3', 'RS-MIG8-03', '44444444-4444-4444-8444-4444444440b7', '${MEMBER}', '2026-12-03', '${SLOT}',
   '2026-12-07', '${SLOT}', 'expired', NULL, NULL, '2026-11-01T02:00:00Z', 'reservation_cancelled');
INSERT INTO "equipment_status_changes"
  ("id", "equipment_id", "from_status", "to_status", "changed_by", "changed_at", "cancelled_reservation_count") VALUES
  ('77777777-7777-4777-8777-7777777770b1', '${EQ_MAINTENANCE}', 'available', 'maintenance', '${ADMIN}', '2026-11-01T02:00:00Z', 1),
  ('77777777-7777-4777-8777-7777777770b2', '${EQ_RETIRED}', 'available', 'retired', '${ADMIN}', '2026-11-02T02:00:00Z', 1);
`;

type Row = Record<string, unknown>;

async function snapshot(client: pg.Client): Promise<Record<string, Row[]>> {
  const result: Record<string, Row[]> = {};
  for (const table of TABLES) {
    const { rows } = await client.query<{ j: Row }>(
      `SELECT row_to_json(t) AS j FROM "${table}" t ORDER BY t."id"`,
    );
    result[table] = rows.map((r) => r.j);
  }
  return result;
}

describe("Iteration 6 lossless migration (FR-020, US1 scenario 10)", () => {
  let admin: pg.Client;
  let client: pg.Client;
  let before: Record<string, Row[]>;
  let after: Record<string, Row[]>;

  beforeAll(async () => {
    expect(targetIndex, "008 migration 目錄").toBeGreaterThan(0);
    admin = new pg.Client({ connectionString: adminUrl.toString() });
    await admin.connect();
    await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${TEST_DB}"`);

    client = new pg.Client({ connectionString: testUrl.toString() });
    await client.connect();
    for (const name of before008) {
      await client.query(readSql(name));
    }
    await client.query(SEED_SQL);
    before = await snapshot(client);

    await client.query(readSql(migration008));
    after = await snapshot(client);
  });

  afterAll(async () => {
    await client?.end();
    await admin?.query(`DROP DATABASE IF EXISTS "${TEST_DB}" WITH (FORCE)`);
    await admin?.end();
  });

  it("依序執行 008 之前的 migration，寫入既有資料後，再執行 008 的 migration.sql", () => {
    expect(before008.length).toBeGreaterThanOrEqual(5);
    expect(migration008).toMatch(/_overdue_notifications$/);
    expect(before.reservations).toHaveLength(9);
    expect(before.reservations.filter((r) => r.status === "checked_out")).toHaveLength(1);
    expect(before.reschedule_requests).toHaveLength(3);
    expect(before.equipment_status_changes).toHaveLength(2);
    expect(before.equipments.map((e) => e.status).sort()).toEqual([
      "available",
      "maintenance",
      "retired",
    ]);
  });

  it("既有資料表的資料列數與每個欄位值都不變", () => {
    for (const table of TABLES) {
      expect(after[table], table).toEqual(before[table]);
    }
  });

  it("overdue_notifications 已建立且是空表，沒有為既有的逾期借用補建通知", async () => {
    const { rows } = await client.query<{ n: string }>(
      `SELECT count(*) AS n FROM "overdue_notifications"`,
    );
    expect(Number(rows[0].n)).toBe(0);
  });

  it("新增通知狀態與失敗原因 Enum，欄位、唯一約束、索引與外鍵都存在", async () => {
    const enumLabels = async (typeName: string) => {
      const { rows } = await client.query<{ label: string }>(
        `SELECT e.enumlabel AS label FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
         WHERE t.typname = $1 ORDER BY e.enumsortorder`,
        [typeName],
      );
      return rows.map((r) => r.label);
    };
    expect(await enumLabels("overdue_notification_status")).toEqual([
      "sending",
      "sent",
      "failed",
      "unknown",
    ]);
    expect(await enumLabels("overdue_notification_failure_reason")).toEqual([
      "rate_limited",
      "discord_server_error",
      "connection_failed",
      "webhook_invalid",
      "webhook_not_configured",
      "message_rejected",
    ]);

    const { rows: columns } = await client.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'overdue_notifications' ORDER BY ordinal_position`,
    );
    expect(columns.map((c) => c.column_name)).toEqual([
      "id",
      "reservation_id",
      "status",
      "attempt_count",
      "auto_retry_count",
      "next_attempt_at",
      "last_attempted_at",
      "sent_at",
      "failure_reason",
      "discord_message_id",
      "created_at",
      "updated_at",
      "updated_by",
      "deleted_at",
    ]);

    const { rows: indexes } = await client.query<{ indexname: string; indexdef: string }>(
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'overdue_notifications'`,
    );
    const names = indexes.map((i) => i.indexname);
    expect(names).toEqual(
      expect.arrayContaining([
        "overdue_notifications_pkey",
        "uq_overdue_notifications_reservation",
        "idx_overdue_notifications_status_created",
        "idx_overdue_notifications_created",
        "idx_overdue_notifications_due",
      ]),
    );
    expect(
      indexes.find((i) => i.indexname === "uq_overdue_notifications_reservation")?.indexdef,
    ).toMatch(/UNIQUE/);

    const { rows: fks } = await client.query<{ conname: string }>(
      `SELECT conname FROM pg_constraint
       WHERE conrelid = 'overdue_notifications'::regclass AND contype = 'f'`,
    );
    expect(fks.map((f) => f.conname)).toEqual(["overdue_notifications_reservation_id_fkey"]);
  });

  it("同一筆借用只能有一則通知（唯一約束）", async () => {
    const reservationId = "44444444-4444-4444-8444-4444444440b6";
    await client.query(
      `INSERT INTO "overdue_notifications" ("id", "reservation_id", "updated_at")
       VALUES ('88888888-8888-4888-8888-8888888880b1', $1, now())`,
      [reservationId],
    );
    await expect(
      client.query(
        `INSERT INTO "overdue_notifications" ("id", "reservation_id", "updated_at")
         VALUES ('88888888-8888-4888-8888-8888888880b2', $1, now())`,
        [reservationId],
      ),
    ).rejects.toThrow(/uq_overdue_notifications_reservation/);
  });
});
