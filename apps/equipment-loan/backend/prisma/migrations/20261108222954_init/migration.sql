-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('member', 'admin');

-- CreateEnum
CREATE TYPE "equipment_status" AS ENUM ('available', 'unavailable');

-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captcha_challenges" (
    "id" UUID NOT NULL,
    "captcha_code" VARCHAR(7) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "captcha_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "token" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" UUID NOT NULL,
    "equipment_code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "status" "equipment_status" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL,
    "slot_code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "reservation_no" VARCHAR(32) NOT NULL,
    "user_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "reservation_date" DATE NOT NULL,
    "slot_id" UUID NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'confirmed',
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_users_role_active" ON "users"("role", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_captcha_challenges_validity" ON "captcha_challenges"("expires_at", "consumed_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "idx_sessions_user_active" ON "sessions"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_sessions_expires_at" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_equipment_code_key" ON "equipments"("equipment_code");

-- CreateIndex
CREATE INDEX "idx_equipments_category_status" ON "equipments"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_slot_code_key" ON "time_slots"("slot_code");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_sort_order_key" ON "time_slots"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_reservation_no_key" ON "reservations"("reservation_no");

-- CreateIndex
CREATE INDEX "idx_reservations_user_date_created" ON "reservations"("user_id", "reservation_date", "created_at");

-- CreateIndex
CREATE INDEX "idx_reservations_date_slot_created" ON "reservations"("reservation_date", "slot_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_reservations_date_equipment_status" ON "reservations"("reservation_date", "equipment_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_reservations_active_slot" ON "reservations"("equipment_id", "reservation_date", "slot_id") WHERE ("status" = 'confirmed' AND "deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
