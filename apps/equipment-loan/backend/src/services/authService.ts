import { randomUUID } from "node:crypto";
import { prisma } from "../db/prisma.js";
import type { AuthUser } from "../middleware/authMiddleware.js";
import { AppError } from "../middleware/errorHandler.js";
import { generateCaptchaCode } from "../utils/captcha.js";
import { verifyPassword } from "../utils/password.js";

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface CaptchaChallengeDto {
  challengeId: string;
  captchaCode: string;
  expiresAt: string;
}

export interface LoginInput {
  username: string;
  password: string;
  challengeId: string;
  captchaCode: string;
}

export interface LoginResultDto {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export async function createCaptchaChallenge(
  previousChallengeId?: string,
): Promise<CaptchaChallengeDto> {
  const now = new Date();

  if (previousChallengeId) {
    await prisma.captcha_challenges.updateMany({
      where: {
        id: previousChallengeId,
        consumed_at: null,
        deleted_at: null,
      },
      data: {
        consumed_at: now,
        updated_at: now,
      },
    });
  }

  const captchaCode = generateCaptchaCode();
  const expiresAt = new Date(now.getTime() + CAPTCHA_TTL_MS);

  const created = await prisma.captcha_challenges.create({
    data: {
      captcha_code: captchaCode,
      expires_at: expiresAt,
    },
  });

  return {
    challengeId: created.id,
    captchaCode: created.captcha_code,
    expiresAt: created.expires_at.toISOString(),
  };
}

export async function login(input: LoginInput): Promise<LoginResultDto> {
  const now = new Date();

  const challenge = await prisma.captcha_challenges.findFirst({
    where: {
      id: input.challengeId,
      deleted_at: null,
    },
  });

  if (!challenge) {
    throw new AppError(
      "CAPTCHA_EXPIRED",
      400,
      "此 7 位數驗證碼已超過 5 分鐘有效期限或已失效，系統已換發新驗證碼，請重新輸入。",
    );
  }

  const consumed = await prisma.captcha_challenges.updateMany({
    where: {
      id: challenge.id,
      consumed_at: null,
      deleted_at: null,
      expires_at: {
        gt: now,
      },
    },
    data: {
      consumed_at: now,
      updated_at: now,
    },
  });

  if (consumed.count === 0) {
    if (challenge.consumed_at === null) {
      await prisma.captcha_challenges.updateMany({
        where: { id: challenge.id, consumed_at: null },
        data: { consumed_at: now, updated_at: now },
      });
    }
    throw new AppError(
      "CAPTCHA_EXPIRED",
      400,
      "此 7 位數驗證碼已超過 5 分鐘有效期限或已失效，系統已換發新驗證碼，請重新輸入。",
    );
  }

  if (input.captchaCode !== challenge.captcha_code) {
    throw new AppError(
      "CAPTCHA_MISMATCH",
      400,
      "驗證碼輸入錯誤（英文須區分大小寫，例如 a 與 A 不同），原驗證碼已失效，請輸入新驗證碼後重試。",
    );
  }

  const user = await prisma.users.findFirst({
    where: {
      username: input.username,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      401,
      "帳號或密碼不正確，且原驗證碼已單次消耗失效，請確認密碼並輸入新驗證碼。",
    );
  }

  const passwordValid = await verifyPassword(input.password, user.password_hash);
  if (!passwordValid) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      401,
      "帳號或密碼不正確，且原驗證碼已單次消耗失效，請確認密碼並輸入新驗證碼。",
    );
  }

  const token = randomUUID();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  const session = await prisma.sessions.create({
    data: {
      token,
      user_id: user.id,
      expires_at: expiresAt,
      updated_by: user.id,
    },
  });

  return {
    token: session.token,
    expiresAt: session.expires_at.toISOString(),
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
    },
  };
}

export function getCurrentUser(user: AuthUser): AuthUser {
  return user;
}

export async function logout(sessionToken: string, userId: string): Promise<{ message: string }> {
  const now = new Date();
  await prisma.sessions.updateMany({
    where: {
      token: sessionToken,
      deleted_at: null,
    },
    data: {
      deleted_at: now,
      updated_at: now,
      updated_by: userId,
    },
  });

  return {
    message: "您已安全登出工作階段。",
  };
}
