import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { withdrawRescheduleRequest } from "../services/rescheduleService.js";

/** /api/reschedule-requests：成員撤回改期申請路由（FR-010）。 */
export const rescheduleRequestsRouter = express.Router();

const rescheduleRequestIdParamsSchema = z.object({
  rescheduleRequestId: z.string().uuid("改期申請 ID 格式不合法"),
});

rescheduleRequestsRouter.post("/:rescheduleRequestId/withdraw", requireAuth, async (req, res) => {
  const { rescheduleRequestId } = rescheduleRequestIdParamsSchema.parse(req.params);
  const withdrawn = await withdrawRescheduleRequest({
    userId: req.authUser!.id,
    rescheduleRequestId,
  });
  res.status(200).json(withdrawn);
});
