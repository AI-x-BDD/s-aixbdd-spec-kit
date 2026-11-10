import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// 007 無損遷移測試（research §5、FR-018、US1 情境 13）：在獨立測試資料庫依序執行 007 之前的 migration.sql，
// 寫入 003～006 的資料（一台 unavailable 設備與各種狀態的預約、借用與改期申請），再執行 007 的 migration.sql，
// 確認設備變成 retired、既有取消紀錄的 cancel_reason 為 member_cancelled，其餘欄位值與資料列數都不變。

const MIGRATIONS_DIR = fileURLToPath(new URL("../../prisma/migrations", import.meta.url));
const TARGET = "equipment_maintenance_retire";
const TEST_DB = "equipment_loan_migration_test";

const baseUrl = new URL(
  process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/equipment_loan?schema=public",
);
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
const before007 = migrations.slice(0, targetIndex);
const migration007 = migrations[targetIndex];

const readSql = (name: string) => readFileSync(join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");

const TABLES = [
  "users",
  "captcha_challenges",
  "sessions",
  "equipments",
  "time_slots",
  "reservations",
  "reschedule_requests",
];

const MEMBER = "11111111-1111-4111-8111-1111111110a1";
const ADMIN = "11111111-1111-4111-8111-1111111110a2";
const EQ_UNAVAILABLE = "22222222-2222-4222-8222-2222222220a1";
const EQ_AVAILABLE = "22222222-2222-4222-8222-2222222220a2";
const SLOT = "33333333-3333-4333-8333-3333333330a1";

/** 003～006 的資料：每種預約狀態、借用中與已歸還、改期審核中／成功／已失效，以及一台 unavailable 設備。 */
const SEED_SQL = `
INSERT INTO "users" ("id", "username", "password_hash", "display_name", "role") VALUES
  ('${MEMBER}', 'mig.member', 'hash-member', '遷移測試成員', 'member'),
  ('${ADMIN}', 'mig.admin', 'hash-admin', '遷移測試管理員', 'admin');
INSERT INTO "sessions" ("id", "token", "user_id", "expires_at") VALUES
  ('66666666-6666-4666-8666-6666666660a1', 'mig-token', '${MEMBER}', '2026-12-31T00:00:00Z');
INSERT INTO "equipments" ("id", "equipment_code", "name", "category", "status", "requires_approval", "updated_by") VALUES
  ('${EQ_UNAVAILABLE}', 'EQ-M01', '遷移測試不可用設備', '遷移測試', 'unavailable', true, '${ADMIN}'),
  ('${EQ_AVAILABLE}', 'EQ-M02', '遷移測試可用設備', '遷移測試', 'available', false, NULL);
INSERT INTO "time_slots" ("id", "slot_code", "name", "start_time", "end_time", "sort_order") VALUES
  ('${SLOT}', 'morning', '上午', '09:00', '12:00', 1);
INSERT INTO "reservations"
  ("id", "reservation_no", "user_id", "equipment_id", "reservation_date", "slot_id", "status",
   "reviewed_by", "reviewed_at", "reject_reason", "checked_out_by", "checked_out_at",
   "returned_by", "returned_at", "cancelled_at") VALUES
  ('44444444-4444-4444-8444-4444444440a1', 'RV-MIG-01', '${MEMBER}', '${EQ_UNAVAILABLE}', '2026-10-01', '${SLOT}', 'returned',
   '${ADMIN}', '2026-09-30T01:00:00Z', NULL, '${ADMIN}', '2026-10-01T01:00:00Z', '${ADMIN}', '2026-10-01T04:00:00Z', NULL),
  ('44444444-4444-4444-8444-4444444440a2', 'RV-MIG-02', '${MEMBER}', '${EQ_UNAVAILABLE}', '2026-10-02', '${SLOT}', 'cancelled',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30T02:00:00Z'),
  ('44444444-4444-4444-8444-4444444440a3', 'RV-MIG-03', '${MEMBER}', '${EQ_UNAVAILABLE}', '2026-10-03', '${SLOT}', 'rejected',
   '${ADMIN}', '2026-09-30T03:00:00Z', '設備維護中', NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440a4', 'RV-MIG-04', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-01', '${SLOT}', 'pending_approval',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440a5', 'RV-MIG-05', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-02', '${SLOT}', 'confirmed',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440a6', 'RV-MIG-06', '${MEMBER}', '${EQ_AVAILABLE}', '2026-11-09', '${SLOT}', 'checked_out',
   NULL, NULL, NULL, '${ADMIN}', '2026-11-09T01:05:00Z', NULL, NULL, NULL),
  ('44444444-4444-4444-8444-4444444440a7', 'RV-MIG-07', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-03', '${SLOT}', 'cancelled',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T02:00:00Z'),
  ('44444444-4444-4444-8444-4444444440a8', 'RV-MIG-08', '${MEMBER}', '${EQ_AVAILABLE}', '2026-12-04', '${SLOT}', 'confirmed',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "reschedule_requests"
  ("id", "request_no", "reservation_id", "user_id", "from_reservation_date", "from_slot_id",
   "to_reservation_date", "to_slot_id", "status", "reviewed_by", "reviewed_at", "expired_at", "expire_reason") VALUES
  ('55555555-5555-4555-8555-5555555550a1', 'RS-MIG-01', '44444444-4444-4444-8444-4444444440a5', '${MEMBER}', '2026-12-02', '${SLOT}',
   '2026-12-05', '${SLOT}', 'pending_approval', NULL, NULL, NULL, NULL),
  ('55555555-5555-4555-8555-5555555550a2', 'RS-MIG-02', '44444444-4444-4444-8444-4444444440a8', '${MEMBER}', '2026-11-30', '${SLOT}',
   '2026-12-04', '${SLOT}', 'approved', NULL, NULL, NULL, NULL),
  ('55555555-5555-4555-8555-5555555550a3', 'RS-MIG-03', '44444444-4444-4444-8444-4444444440a7', '${MEMBER}', '2026-12-03', '${SLOT}',
   '2026-12-06', '${SLOT}', 'expired', NULL, NULL, '2026-11-01T02:00:00Z', 'reservation_cancelled');
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

describe("Iteration 5 lossless migration (FR-018, US1 scenario 13)", () => {
  let admin: pg.Client;
  let client: pg.Client;
  let before: Record<string, Row[]>;
  let after: Record<string, Row[]>;

  beforeAll(async () => {
    expect(targetIndex, "007 migration 目錄").toBeGreaterThan(0);
    admin = new pg.Client({ connectionString: adminUrl.toString() });
    await admin.connect();
    await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${TEST_DB}"`);

    client = new pg.Client({ connectionString: testUrl.toString() });
    await client.connect();
    for (const name of before007) {
      await client.query(readSql(name));
    }
    await client.query(SEED_SQL);
    before = await snapshot(client);

    await client.query(readSql(migration007));
    after = await snapshot(client);
  });

  afterAll(async () => {
    await client?.end();
    await admin?.query(`DROP DATABASE IF EXISTS "${TEST_DB}" WITH (FORCE)`);
    await admin?.end();
  });

  it("依序執行 007 之前的 migration 後，再執行 007 的 migration.sql", () => {
    expect(before007.length).toBeGreaterThanOrEqual(4);
    expect(migration007).toMatch(/_equipment_maintenance_retire$/);
    expect(before.equipments.find((e) => e.id === EQ_UNAVAILABLE)?.status).toBe("unavailable");
  });

  it("設備狀態 Enum 變成 available、maintenance、retired，unavailable 設備變成 retired，其餘欄位不變", async () => {
    const { rows } = await client.query<{ label: string }>(
      `SELECT e.enumlabel AS label FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
       WHERE t.typname = 'equipment_status' ORDER BY e.enumsortorder`,
    );
    expect(rows.map((r) => r.label)).toEqual(["available", "maintenance", "retired"]);

    expect(after.equipments).toHaveLength(before.equipments.length);
    for (const prev of before.equipments) {
      const now = after.equipments.find((e) => e.id === prev.id);
      const expectedStatus = prev.status === "unavailable" ? "retired" : prev.status;
      expect(now, String(prev.equipment_code)).toEqual({ ...prev, status: expectedStatus });
    }
  });

  it("既有取消紀錄的 cancel_reason 為 member_cancelled，其他預約為 null，其餘欄位值不變", () => {
    expect(after.reservations).toHaveLength(before.reservations.length);
    for (const prev of before.reservations) {
      const now = after.reservations.find((r) => r.id === prev.id)!;
      const { cancel_reason: cancelReason, ...rest } = now;
      expect(rest, String(prev.reservation_no)).toEqual(prev);
      expect(cancelReason, String(prev.reservation_no)).toBe(
        prev.status === "cancelled" ? "member_cancelled" : null,
      );
    }
    expect(before.reservations.filter((r) => r.status === "cancelled")).toHaveLength(2);
  });

  it("借用、改期申請與其他資料表的資料列數與欄位值都不變，並新增空的 equipment_status_changes", async () => {
    for (const table of TABLES.filter((t) => t !== "equipments" && t !== "reservations")) {
      expect(after[table], table).toEqual(before[table]);
    }
    expect(after.reschedule_requests).toHaveLength(3);
    const { rows } = await client.query<{ n: string }>(
      `SELECT count(*) AS n FROM "equipment_status_changes"`,
    );
    expect(Number(rows[0].n)).toBe(0);
  });
});
