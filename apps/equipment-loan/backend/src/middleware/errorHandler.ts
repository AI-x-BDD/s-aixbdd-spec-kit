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
  | "RESERVATION_ALREADY_STARTED"
  | "RESERVATION_ALREADY_CANCELLED";

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
