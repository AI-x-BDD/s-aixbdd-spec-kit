import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { AppError, parsePaginationParams } from "../middleware/errorHandler.js";
import { listAdminEquipments, updateEquipmentApprovalMode } from "../services/equipmentService.js";
import {
  approveReservation,
  listAllReservations,
  listPendingReservations,
  pickupReservationByAdmin,
  rejectReservation,
  returnReservationByAdmin,
} from "../services/reservationService.js";

export const adminRouter = express.Router();

const listAdminEquipmentsQuerySchema = z.object({
  category: z.string().min(1).max(50).optional(),
  requiresApproval: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const equipmentIdParamsSchema = z.object({
  equipmentId: z.string().uuid("單件設備 ID 格式不合法"),
});

const updateEquipmentApprovalModeBodySchema = z.object({
  requiresApproval: z.boolean({
    message: "請求欄位 requiresApproval 必須為布林值（true 或 false）。",
  }),
});

adminRouter.get("/equipments", requireAuth, requireAdmin, async (req, res) => {
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

  const query = listAdminEquipmentsQuerySchema.parse({
    category: req.query.category,
    requiresApproval: req.query.requiresApproval,
  });

  const result = await listAdminEquipments({
    category: query.category,
    requiresApproval: query.requiresApproval,
    page,
    pageSize,
  });

  res.status(200).json(result);
});

adminRouter.patch(
  "/equipments/:equipmentId/approval-mode",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { equipmentId } = equipmentIdParamsSchema.parse(req.params);
    const body = updateEquipmentApprovalModeBodySchema.parse(req.body);

    const updated = await updateEquipmentApprovalMode({
      adminUserId: req.authUser!.id,
      equipmentId,
      requiresApproval: body.requiresApproval,
    });

    res.status(200).json(updated);
  },
);

const listPendingQuerySchema = z.object({
  equipmentId: z.string().uuid("設備 ID 格式不合法").optional(),
});

const listAllReservationsQuerySchema = z.object({
  status: z
    .enum(["pending_approval", "confirmed", "checked_out", "returned", "rejected", "cancelled"])
    .optional(),
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

adminRouter.post(
  "/reservations/:reservationId/pickup",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { reservationId } = reservationIdParamsSchema.parse(req.params);
    const result = await pickupReservationByAdmin({
      adminUserId: req.authUser!.id,
      reservationId,
    });
    res.status(200).json(result);
  },
);

adminRouter.post(
  "/reservations/:reservationId/return",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { reservationId } = reservationIdParamsSchema.parse(req.params);
    const result = await returnReservationByAdmin({
      adminUserId: req.authUser!.id,
      reservationId,
    });
    res.status(200).json(result);
  },
);
