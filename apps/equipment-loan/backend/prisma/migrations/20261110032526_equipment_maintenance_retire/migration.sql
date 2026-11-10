-- 007 設備送修與停用：增量遷移（FR-018 無損遷移）
-- 以 RENAME VALUE 原地改名，不重建型別、不轉型既有資料列（research §1）

-- AlterEnum：既有不可用設備原地改名為停用
ALTER TYPE "equipment_status" RENAME VALUE 'unavailable' TO 'retired';

-- AlterEnum：新增送修中，排在 retired 之前；本 Migration 不使用此新值
ALTER TYPE "equipment_status" ADD VALUE 'maintenance' BEFORE 'retired';

-- CreateEnum
CREATE TYPE "reservation_cancel_reason" AS ENUM ('member_cancelled', 'equipment_maintenance', 'equipment_retired');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "cancel_reason" "reservation_cancel_reason";

-- 補上既有取消紀錄的原因（003～006 只有成員本人能取消）；不改動其他欄位
UPDATE "reservations" SET "cancel_reason" = 'member_cancelled' WHERE "status" = 'cancelled';

-- CreateTable
CREATE TABLE "equipment_status_changes" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "from_status" "equipment_status" NOT NULL,
    "to_status" "equipment_status" NOT NULL,
    "changed_by" UUID NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL,
    "cancelled_reservation_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "equipment_status_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_equipment_status_changes_equipment_changed" ON "equipment_status_changes"("equipment_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_reservations_equipment_status_date" ON "reservations"("equipment_id", "status", "reservation_date");

-- AddForeignKey
ALTER TABLE "equipment_status_changes" ADD CONSTRAINT "equipment_status_changes_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_status_changes" ADD CONSTRAINT "equipment_status_changes_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
