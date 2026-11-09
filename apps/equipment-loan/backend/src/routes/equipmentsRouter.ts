import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { AppError, parsePaginationParams } from "../middleware/errorHandler.js";
import { listEquipments } from "../services/equipmentService.js";

export const equipmentsRouter = express.Router();

const listEquipmentsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "查詢日期 date 必須為有效的 YYYY-MM-DD 格式。"),
  category: z.string().min(1).max(50).optional(),
  requiresApproval: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

equipmentsRouter.get("/", requireAuth, async (req, res) => {
  const { page, pageSize } = parsePaginationParams(req.query);
  if (
    req.query.requiresApproval !== undefined &&
    req.query.requiresApproval !== "true" &&
    req.query.requiresApproval !== "false"
  ) {
    throw new AppError(
      "VALIDATION_FAILED",
      400,
      "查詢參數 requiresApproval 必須為 true 或 false。",
    );
  }

  const query = listEquipmentsQuerySchema.parse({
    date: req.query.date,
    category: req.query.category,
    requiresApproval: req.query.requiresApproval,
  });

  const result = await listEquipments({
    userId: req.authUser!.id,
    date: query.date,
    category: query.category,
    requiresApproval: query.requiresApproval,
    page,
    pageSize,
  });

  res.status(200).json(result);
});
