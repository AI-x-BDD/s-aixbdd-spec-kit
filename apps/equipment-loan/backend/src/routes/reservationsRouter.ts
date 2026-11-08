import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createReservation } from "../services/reservationService.js";

export const reservationsRouter = express.Router();

const createReservationSchema = z.object({
  equipmentId: z.string().uuid("設備 ID 格式不合法"),
  reservationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "預約日期必須為有效的 YYYY-MM-DD 格式。"),
  slotId: z.string().uuid("固定時段 ID 格式不合法"),
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
