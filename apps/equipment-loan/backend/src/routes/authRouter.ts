import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createCaptchaChallenge, getCurrentUser, login, logout } from "../services/authService.js";

export const authRouter = express.Router();

const createCaptchaSchema = z
  .object({
    previousChallengeId: z.string().uuid("驗證碼挑戰 ID 格式不合法").optional(),
  })
  .optional();

const loginSchema = z.object({
  username: z.string().min(1, "請輸入登入帳號").max(64),
  password: z.string().min(1, "請輸入登入密碼").max(128),
  challengeId: z.string().uuid("驗證碼挑戰 ID 格式不合法"),
  captchaCode: z
    .string()
    .length(7, "請輸入完整的 7 位數英數驗證碼（區分英文大小寫）")
    .regex(/^[A-Za-z0-9]{7}$/, "請輸入完整的 7 位數英數驗證碼（區分英文大小寫）"),
});

authRouter.post("/captcha", async (req, res) => {
  const parsed = createCaptchaSchema.parse(
    req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
  );
  const result = await createCaptchaChallenge(parsed?.previousChallengeId);
  res.status(201).json(result);
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.parse(req.body);
  const result = await login(parsed);
  res.status(200).json(result);
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = getCurrentUser(req.authUser!);
  res.status(200).json(user);
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  const result = await logout(req.sessionToken!, req.authUser!.id);
  res.status(200).json(result);
});
