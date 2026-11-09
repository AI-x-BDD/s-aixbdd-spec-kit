import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "PAGINATION_INVALID"
  | "CAPTCHA_MISMATCH"
  | "CAPTCHA_EXPIRED"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "DATE_OUT_OF_RANGE"
  | "SLOT_ALREADY_STARTED"
  | "EQUIPMENT_UNAVAILABLE"
  | "RESERVATION_CONFLICT"
  | "DUPLICATE_PENDING_OR_ACTIVE_RESERVATION"
  | "INVALID_RESERVATION_STATUS"
  | "PICKUP_DATE_NOT_TODAY"
  | "PICKUP_WINDOW_EXPIRED"
  | "RESERVATION_ALREADY_CHECKED_OUT"
  | "RESERVATION_ALREADY_STARTED"
  | "RESERVATION_ALREADY_CANCELLED"
  | RescheduleErrorCode;

export type RescheduleErrorCode =
  | "RESCHEDULE_NOT_ALLOWED"
  | "RESCHEDULE_TARGET_INVALID"
  | "RESCHEDULE_SLOT_CONFLICT"
  | "RESCHEDULE_ALREADY_PENDING"
  | "INVALID_RESCHEDULE_STATUS";

/** 改期錯誤碼對應的 HTTP 狀態碼（contracts/openapi.yaml 的 RescheduleBadRequest、CreateRescheduleConflict、RescheduleStatusConflict、ApproveRescheduleConflict）。 */
export const RESCHEDULE_ERROR_STATUS: Record<RescheduleErrorCode, number> = {
  RESCHEDULE_NOT_ALLOWED: 409,
  RESCHEDULE_TARGET_INVALID: 400,
  RESCHEDULE_SLOT_CONFLICT: 409,
  RESCHEDULE_ALREADY_PENDING: 409,
  INVALID_RESCHEDULE_STATUS: 409,
};

/** 改期錯誤碼的預設繁體中文訊息；呼叫端可傳入更具體的失敗原因（NFR-001）。 */
export const RESCHEDULE_ERROR_MESSAGE: Record<RescheduleErrorCode, string> = {
  RESCHEDULE_NOT_ALLOWED:
    "這筆預約目前不可申請改期：只有已核准／有效且原時段尚未開始的預約可以改期。",
  RESCHEDULE_TARGET_INVALID:
    "新時段不可申請：新時段不可與原時段相同、不可已開始、須在今日起 7 天內，且本人在該時段不可已有未結束的預約。",
  RESCHEDULE_SLOT_CONFLICT: "新時段已被占用，請改選其他時段。",
  RESCHEDULE_ALREADY_PENDING: "這筆預約已有改期審核中的申請，請先撤回後再重新申請。",
  INVALID_RESCHEDULE_STATUS:
    "這筆改期申請已非改期審核中（已核准、已駁回、已撤回或已失效），無法再撤回或審核。",
};

export function rescheduleError(code: RescheduleErrorCode, message?: string): AppError {
  return new AppError(
    code,
    RESCHEDULE_ERROR_STATUS[code],
    message ?? RESCHEDULE_ERROR_MESSAGE[code],
  );
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;

  constructor(code: ErrorCode, status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function parsePaginationParams(query: { page?: unknown; pageSize?: unknown }): {
  page: number;
  pageSize: number;
} {
  let page = 1;
  let pageSize = 20;

  if (query.page !== undefined) {
    if (typeof query.page !== "string" || !/^-?\d+$/.test(query.page)) {
      throw new AppError(
        "PAGINATION_INVALID",
        400,
        "分頁參數 page 或 pageSize 不合法（page 須為大於等於 1 的整數，pageSize 須為 1 至 100 的整數）。",
      );
    }
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      throw new AppError(
        "PAGINATION_INVALID",
        400,
        "分頁參數 page 或 pageSize 不合法（page 須為大於等於 1 的整數，pageSize 須為 1 至 100 的整數）。",
      );
    }
  }

  if (query.pageSize !== undefined) {
    if (typeof query.pageSize !== "string" || !/^-?\d+$/.test(query.pageSize)) {
      throw new AppError(
        "PAGINATION_INVALID",
        400,
        "分頁參數 page 或 pageSize 不合法（page 須為大於等於 1 的整數，pageSize 須為 1 至 100 的整數）。",
      );
    }
    pageSize = Number(query.pageSize);
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new AppError(
        "PAGINATION_INVALID",
        400,
        "分頁參數 page 或 pageSize 不合法（page 須為大於等於 1 的整數，pageSize 須為 1 至 100 的整數）。",
      );
    }
  }

  return { page, pageSize };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    const isPaginationError = err.issues.some(
      (issue) => issue.path.includes("page") || issue.path.includes("pageSize"),
    );
    if (isPaginationError) {
      res.status(400).json({
        code: "PAGINATION_INVALID",
        message:
          "分頁參數 page 或 pageSize 不合法（page 須為大於等於 1 的整數，pageSize 須為 1 至 100 的整數）。",
      });
      return;
    }

    const firstMessage = err.issues[0]?.message || "請求欄位或路徑參數格式不合法。";
    res.status(400).json({
      code: "VALIDATION_FAILED",
      message: firstMessage,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    code: "VALIDATION_FAILED",
    message: "伺服器處理請求時發生錯誤，請稍後再試。",
  });
}
