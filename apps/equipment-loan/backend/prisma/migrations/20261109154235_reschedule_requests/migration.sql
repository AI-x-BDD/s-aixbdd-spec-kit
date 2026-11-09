-- CreateEnum
CREATE TYPE "reschedule_request_status" AS ENUM ('pending_approval', 'approved', 'rejected', 'withdrawn', 'expired');

-- CreateEnum
CREATE TYPE "reschedule_expire_reason" AS ENUM ('original_slot_started', 'new_slot_started', 'reservation_cancelled', 'reservation_checked_out');

-- CreateTable
CREATE TABLE "reschedule_requests" (
    "id" UUID NOT NULL,
    "request_no" VARCHAR(32) NOT NULL,
    "reservation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "from_reservation_date" DATE NOT NULL,
    "from_slot_id" UUID NOT NULL,
    "to_reservation_date" DATE NOT NULL,
    "to_slot_id" UUID NOT NULL,
    "status" "reschedule_request_status" NOT NULL DEFAULT 'pending_approval',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "reject_reason" VARCHAR(200),
    "withdrawn_at" TIMESTAMPTZ(6),
    "expired_at" TIMESTAMPTZ(6),
    "expire_reason" "reschedule_expire_reason",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "reschedule_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reschedule_requests_request_no_key" ON "reschedule_requests"("request_no");

-- CreateIndex
CREATE INDEX "idx_reschedule_requests_status_to_slot" ON "reschedule_requests"("status", "to_reservation_date", "to_slot_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_reschedule_requests_reservation_created" ON "reschedule_requests"("reservation_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_reschedule_requests_pending_per_reservation" ON "reschedule_requests"("reservation_id") WHERE (status = 'pending_approval' AND deleted_at IS NULL);

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_from_slot_id_fkey" FOREIGN KEY ("from_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_to_slot_id_fkey" FOREIGN KEY ("to_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
