import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { parsePaginationParams } from "../middleware/errorHandler.js";
import {
  approveReservation,
  listAllReservations,
  listPendingReservations,
  rejectReservation,
} from "../services/reservationService.js";

export const adminRouter = express.Router();

const listPendingQuerySchema = z.object({
  equipmentId: z.string().uuid("設備 ID 格式不合法").optional(),
});

const listAllReservationsQuerySchema = z.object({
  status: z.enum(["pending_approval", "confirmed", "rejected", "cancelled"]).optional(),
  equipmentId: z.string().uuid("設備 ID 格式不合法").optional(),
});

const reservationIdParamsSchema = z.object({
  reservationId: z.string().uuid("預約申請 ID 格式不合法"),
});

const rejectBodySchema = z
  .object({
    rejectReason: z
      .string()
      .max(200, "駁回原因為選填，但長度不得超過 200 字。")
      .nullable()
      .optional(),
  })
  .optional();

adminRouter.get("/reservations/pending", requireAuth, requireAdmin, async (req, res) => {
  const { page, pageSize } = parsePaginationParams(req.query);
  const query = listPendingQuerySchema.parse({
    equipmentId: req.query.equipmentId,
  });

  const result = await listPendingReservations({
    equipmentId: query.equipmentId,
    page,
    pageSize,
  });

  res.status(200).json(result);
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

adminRouter.post(
  "/reservations/:reservationId/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { reservationId } = reservationIdParamsSchema.parse(req.params);
    const result = await approveReservation({
      adminUserId: req.authUser!.id,
      reservationId,
    });
    res.status(200).json(result);
  },
);

adminRouter.post(
  "/reservations/:reservationId/reject",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { reservationId } = reservationIdParamsSchema.parse(req.params);
    const parsedBody = rejectBodySchema.parse(
      req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
    );
    const result = await rejectReservation({
      adminUserId: req.authUser!.id,
      reservationId,
      rejectReason: parsedBody?.rejectReason ?? null,
    });
    res.status(200).json(result);
  },
);
