-- CreateEnum
CREATE TYPE "overdue_notification_status" AS ENUM ('sending', 'sent', 'failed', 'unknown');

-- CreateEnum
CREATE TYPE "overdue_notification_failure_reason" AS ENUM ('rate_limited', 'discord_server_error', 'connection_failed', 'webhook_invalid', 'webhook_not_configured', 'message_rejected');

-- CreateTable
CREATE TABLE "overdue_notifications" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "status" "overdue_notification_status" NOT NULL DEFAULT 'sending',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "auto_retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ(6),
    "last_attempted_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "failure_reason" "overdue_notification_failure_reason",
    "discord_message_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "overdue_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_overdue_notifications_reservation" ON "overdue_notifications"("reservation_id");

-- CreateIndex
CREATE INDEX "idx_overdue_notifications_status_created" ON "overdue_notifications"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_overdue_notifications_created" ON "overdue_notifications"("created_at");

-- CreateIndex（手動加入的部分索引，供送出程序找出到期的通知）
CREATE INDEX "idx_overdue_notifications_due" ON "overdue_notifications"("next_attempt_at") WHERE status = 'sending';

-- AddForeignKey
ALTER TABLE "overdue_notifications" ADD CONSTRAINT "overdue_notifications_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
