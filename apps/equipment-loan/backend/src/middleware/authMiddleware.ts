import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { AppError } from "./errorHandler.js";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: "member" | "admin";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      sessionToken?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      "UNAUTHORIZED",
      401,
      "請先完成帳號密碼與 7 位數驗證碼登入，才能檢視設備清單或執行預約操作。",
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    throw new AppError(
      "UNAUTHORIZED",
      401,
      "請先完成帳號密碼與 7 位數驗證碼登入，才能檢視設備清單或執行預約操作。",
    );
  }

  const session = await prisma.sessions.findFirst({
    where: {
      token,
      deleted_at: null,
      expires_at: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!session || session.user.deleted_at !== null) {
    throw new AppError(
      "UNAUTHORIZED",
      401,
      "請先完成帳號密碼與 7 位數驗證碼登入，才能檢視設備清單或執行預約操作。",
    );
  }

  req.authUser = {
    id: session.user.id,
    username: session.user.username,
    displayName: session.user.display_name,
    role: session.user.role,
  };
  req.sessionToken = token;
  next();
}

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.authUser) {
    throw new AppError(
      "UNAUTHORIZED",
      401,
      "請先完成帳號密碼與 7 位數驗證碼登入，才能檢視設備清單或執行預約操作。",
    );
  }

  if (req.authUser.role !== "admin") {
    throw new AppError(
      "FORBIDDEN",
      403,
      "權限不足：「管理員設備審核設定與待審核申請清單」僅供管理員（admin）角色存取與操作。",
    );
  }

  next();
}
