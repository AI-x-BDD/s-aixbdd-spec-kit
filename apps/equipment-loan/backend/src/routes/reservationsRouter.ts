import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { parsePaginationParams } from "../middleware/errorHandler.js";
import {
  cancelReservation,
  createReservation,
  listMyLoanReservations,
  listMyReservations,
} from "../services/reservationService.js";
import { createRescheduleRequest } from "../services/rescheduleService.js";

export const reservationsRouter = express.Router();

const listMyReservationsQuerySchema = z.object({
  status: z
    .enum(["pending_approval", "confirmed", "checked_out", "returned", "rejected", "cancelled"])
    .optional(),
});

const createReservationSchema = z.object({
  equipmentId: z.string().uuid("設備 ID 格式不合法"),
  reservationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "預約日期必須為有效的 YYYY-MM-DD 格式。"),
  slotId: z.string().uuid("固定時段 ID 格式不合法"),
});

const cancelParamsSchema = z.object({
  reservationId: z.string().uuid("預約紀錄 ID 格式不合法"),
});

const createRescheduleRequestSchema = z.object({
  toReservationDate: z
    .string({ error: "請提供新預約日期 toReservationDate（YYYY-MM-DD）。" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "新預約日期必須為有效的 YYYY-MM-DD 格式。"),
  toSlotId: z.string({ error: "請提供新固定時段 ID toSlotId。" }).uuid("新固定時段 ID 格式不合法"),
});

reservationsRouter.get("/", requireAuth, async (req, res) => {
  const { page, pageSize } = parsePaginationParams(req.query);
  const query = listMyReservationsQuerySchema.parse({
    status: req.query.status,
  });

  const result = await listMyReservations({
    userId: req.authUser!.id,
    status: query.status,
    page,
    pageSize,
  });

  res.status(200).json(result);
});

reservationsRouter.get("/my", requireAuth, async (req, res) => {
  const { page, pageSize } = parsePaginationParams(req.query);
  const query = listMyReservationsQuerySchema.parse({
    status: req.query.status,
  });

  const result = await listMyLoanReservations({
    userId: req.authUser!.id,
    status: query.status,
    page,
    pageSize,
  });

  res.status(200).json(result);
});

reservationsRouter.post("/", requireAuth, async (req, res) => {
  const body = createReservationSchema.parse(req.body);
  const created = await createReservation({
    userId: req.authUser!.id,
    equipmentId: body.equipmentId,
    reservationDate: body.reservationDate,
    slotId: body.slotId,
  });
  res.status(201).json(created);
});

reservationsRouter.post("/:reservationId/cancel", requireAuth, async (req, res) => {
  const { reservationId } = cancelParamsSchema.parse(req.params);
  const cancelled = await cancelReservation({
    userId: req.authUser!.id,
    reservationId,
  });
  res.status(200).json(cancelled);
});

reservationsRouter.post("/:reservationId/reschedule-requests", requireAuth, async (req, res) => {
  const { reservationId } = cancelParamsSchema.parse(req.params);
  const body = createRescheduleRequestSchema.parse(req.body);
  const created = await createRescheduleRequest({
    userId: req.authUser!.id,
    reservationId,
    toReservationDate: body.toReservationDate,
    toSlotId: body.toSlotId,
  });
  res.status(201).json(created);
});
