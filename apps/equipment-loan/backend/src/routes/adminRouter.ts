import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { parsePaginationParams } from "../middleware/errorHandler.js";
import { listAllReservations } from "../services/reservationService.js";

export const adminRouter = express.Router();

const listAllReservationsQuerySchema = z.object({
  status: z.enum(["confirmed", "cancelled"]).optional(),
  equipmentId: z.string().uuid("設備 ID 格式不合法").optional(),
});

adminRouter.get("/reservations", requireAuth, requireAdmin, async (req, res) => {
  const { page, pageSize } = parsePaginationParams(req.query);
  const query = listAllReservationsQuerySchema.parse({
    status: req.query.status,
    equipmentId: req.query.equipmentId,
  });

  const result = await listAllReservations({
    status: query.status,
    equipmentId: query.equipmentId,
    page,
    pageSize,
  });

  res.status(200).json(result);
});
