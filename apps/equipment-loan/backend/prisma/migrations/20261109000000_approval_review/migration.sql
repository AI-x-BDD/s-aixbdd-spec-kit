-- AlterEnum (non-destructive in-transaction migration preserving all existing confirmed/cancelled rows)
DROP INDEX IF EXISTS "uq_reservations_active_slot";
DROP INDEX IF EXISTS "idx_reservations_date_equipment_status";

ALTER TYPE "reservation_status" RENAME TO "reservation_status_old";
CREATE TYPE "reservation_status" AS ENUM ('pending_approval', 'confirmed', 'rejected', 'cancelled');

ALTER TABLE "reservations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reservations"
  ALTER COLUMN "status" TYPE "reservation_status"
  USING ("status"::text::"reservation_status");
ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'confirmed';

DROP TYPE "reservation_status_old";

-- AlterTable: equipments
ALTER TABLE "equipments"
  ADD COLUMN "requires_approval" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: reservations
ALTER TABLE "reservations"
  ADD COLUMN "reviewed_by" UUID,
  ADD COLUMN "reviewed_at" TIMESTAMPTZ(6),
  ADD COLUMN "reject_reason" VARCHAR(200);

-- CreateIndex
CREATE INDEX "idx_equipments_approval_status" ON "equipments"("requires_approval", "status");

-- CreateIndex
CREATE INDEX "idx_reservations_status_date_slot" ON "reservations"("status", "reservation_date", "slot_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_reservations_date_equipment_status" ON "reservations"("reservation_date", "equipment_id", "status");

-- CreateIndex (Dual partial unique indexes)
CREATE UNIQUE INDEX "uq_reservations_active_slot"
  ON "reservations"("equipment_id", "reservation_date", "slot_id")
  WHERE ("status" = 'confirmed' AND "deleted_at" IS NULL);

CREATE UNIQUE INDEX "uq_reservations_user_active_request"
  ON "reservations"("user_id", "equipment_id", "reservation_date", "slot_id")
  WHERE ("status" IN ('pending_approval', 'confirmed') AND "deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
