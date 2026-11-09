-- AlterEnum (non-destructive in-transaction migration preserving all existing pending_approval/confirmed/rejected/cancelled rows)
DROP INDEX IF EXISTS "uq_reservations_active_slot";
DROP INDEX IF EXISTS "uq_reservations_user_active_request";
DROP INDEX IF EXISTS "idx_reservations_status_date_slot";
DROP INDEX IF EXISTS "idx_reservations_user_date_created";
DROP INDEX IF EXISTS "idx_reservations_date_equipment_status";

ALTER TYPE "reservation_status" RENAME TO "reservation_status_old";
CREATE TYPE "reservation_status" AS ENUM ('pending_approval', 'confirmed', 'checked_out', 'returned', 'rejected', 'cancelled');

ALTER TABLE "reservations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reservations"
  ALTER COLUMN "status" TYPE "reservation_status"
  USING ("status"::text::"reservation_status");
ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'confirmed';

DROP TYPE "reservation_status_old";

-- AlterTable: reservations
ALTER TABLE "reservations"
  ADD COLUMN "checked_out_by" UUID,
  ADD COLUMN "checked_out_at" TIMESTAMPTZ(6),
  ADD COLUMN "returned_by" UUID,
  ADD COLUMN "returned_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "idx_reservations_status_date_slot" ON "reservations"("status", "reservation_date", "slot_id", "created_at");
CREATE INDEX "idx_reservations_user_date_created" ON "reservations"("user_id", "status", "reservation_date", "created_at");
CREATE INDEX "idx_reservations_date_equipment_status" ON "reservations"("reservation_date", "equipment_id", "status");

-- CreateIndex (Upgraded dual partial unique indexes covering checked_out and returned)
CREATE UNIQUE INDEX "uq_reservations_active_slot"
  ON "reservations"("equipment_id", "reservation_date", "slot_id")
  WHERE ("status" IN ('confirmed', 'checked_out', 'returned') AND "deleted_at" IS NULL);

CREATE UNIQUE INDEX "uq_reservations_user_active_request"
  ON "reservations"("user_id", "equipment_id", "reservation_date", "slot_id")
  WHERE ("status" IN ('pending_approval', 'confirmed', 'checked_out') AND "deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_checked_out_by_fkey"
  FOREIGN KEY ("checked_out_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_returned_by_fkey"
  FOREIGN KEY ("returned_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
