import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { parsePaginationParams } from "../middleware/errorHandler.js";
import { listEquipments } from "../services/equipmentService.js";

export const equipmentsRouter = express.Router();

const listEquipmentsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "查詢日期 date 必須為有效的 YYYY-MM-DD 格式。"),
  category: z.string().min(1).max(50).optional(),
});

equipmentsRouter.get("/", requireAuth, async (req, res) => {
  const { page, pageSize } = parsePaginationParams(req.query);
  const query = listEquipmentsQuerySchema.parse({
    date: req.query.date,
    category: req.query.category,
  });

  const result = await listEquipments({
    userId: req.authUser!.id,
    date: query.date,
    category: query.category,
    page,
    pageSize,
  });

  res.status(200).json(result);
});
