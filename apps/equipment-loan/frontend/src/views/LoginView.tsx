import React, { useCallback, useEffect, useState } from "react";
import type { AuthenticatedUser } from "../App";
import { ApiError, apiRequest, setStoredToken } from "../api/client";
import { CaptchaBox, type CaptchaChallenge } from "../components/CaptchaBox";
import { UI_TEXT } from "../text/zh-TW";

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthenticatedUser;
}

interface QuickAccount {
  username: string;
  password: string;
  displayName: string;
  role: "member" | "admin";
  roleLabel: string;
  dept: string;
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    username: "lin.yating",
    password: "Member@2026",
    displayName: "林雅婷",
    role: "member",
    roleLabel: "一般成員",
    dept: "光電材料實驗室",
  },
  {
    username: "chen.guanting",
    password: "Member@2026",
    displayName: "陳冠廷",
    role: "member",
    roleLabel: "一般成員",
    dept: "嵌入式系統實驗室",
  },
  {
    username: "wu.chenghan",
    password: "Admin@2026",
    displayName: "吳承翰",
    role: "admin",
    roleLabel: "管理員",
    dept: "研發設備管理組",
  },
];

export function validateLoginForm(values: {
  username: string;
  password: string;
  captchaCode: string;
}): { username?: string; password?: string; captchaCode?: string } {
  const errors: { username?: string; password?: string; captchaCode?: string } = {};
  if (!values.username.trim()) {
    errors.username = UI_TEXT.fieldValidation.usernameRequired;
  }
  if (!values.password.trim()) {
    errors.password = UI_TEXT.fieldValidation.passwordRequired;
  }
  const code = values.captchaCode.trim();
  if (!code || code.length !== 7 || !/^[A-Za-z0-9]{7}$/.test(code)) {
    errors.captchaCode = UI_TEXT.fieldValidation.captchaInvalid;
  }
  return errors;
}

interface LoginViewProps {
  bannerMessage?: { tone: "danger" | "info" | "success"; text: string } | null;
  onLoginSuccess: (user: AuthenticatedUser) => void;
}

export function LoginView({ bannerMessage, onLoginSuccess }: LoginViewProps): React.ReactElement {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [loadingCaptcha, setLoadingCaptcha] = useState<boolean>(true);
  const [captchaNote, setCaptchaNote] = useState<string>("有效期限 5 分鐘");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    captchaCode?: string;
  }>({});
  const [banner, setBanner] = useState<{
    tone: "danger" | "info" | "success";
    text: string;
  } | null>(bannerMessage ?? null);

  useEffect(() => {
    if (bannerMessage) {
      setBanner(bannerMessage);
    }
  }, [bannerMessage]);

  const fetchCaptcha = useCallback(async (previousId?: string, note?: string) => {
    setLoadingCaptcha(true);
    try {
      const data = await apiRequest<CaptchaChallenge>("/auth/captcha", {
        method: "POST",
        body: JSON.stringify(previousId ? { previousChallengeId: previousId } : {}),
      });
      setChallenge(data);
      setCaptchaNote(note || "有效期限 5 分鐘");
      return data;
    } finally {
      setLoadingCaptcha(false);
    }
  }, []);

  useEffect(() => {
    void fetchCaptcha();
  }, [fetchCaptcha]);

  const handleRefreshCaptcha = async (): Promise<void> => {
    const next = await fetchCaptcha(
      challenge?.challengeId,
      "已更換為新的 7 位數驗證碼，有效期限 5 分鐘",
    );
    setCaptchaInput("");
    if (next) {
      setBanner({
        tone: "info",
        text: `已更換為新的 7 位數驗證碼 ${next.captchaCode}，有效期限 5 分鐘。`,
      });
    }
  };

  const handleQuickFill = (acc: QuickAccount): void => {
    setUsername(acc.username);
    setPassword(acc.password);
    setCaptchaInput(challenge?.captchaCode ?? "");
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setBanner(null);

    const errors = validateLoginForm({
      username,
      password,
      captchaCode: captchaInput,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !challenge) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password,
          challengeId: challenge.challengeId,
          captchaCode: captchaInput.trim(),
        }),
      });
      setStoredToken(result.token);
      onLoginSuccess(result.user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "登入失敗，請重新輸入驗證碼後再試。";
      setCaptchaInput("");
      const next = await fetchCaptcha(undefined, "原驗證碼已單次消耗失效，已換發新驗證碼");
      setBanner({
        tone: "danger",
        text: next ? `${message}（新驗證碼：${next.captchaCode}）` : message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>系統登入與身分驗證</h1>
      <p className="page-lead">
        請使用組織預建的成員或管理員帳號登入，並輸入畫面上 7 位數區分英文大小寫的英數驗證碼。
      </p>

      {banner && (
        <div className={`banner banner-${banner.tone}`} role="alert" data-testid="login-banner">
          <span>{banner.text}</span>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <form
          className="card"
          style={{ padding: "28px" }}
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
        >
          <h2>帳號密碼與驗證碼登入</h2>

          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="username"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              登入帳號<span style={{ color: "var(--danger)", marginLeft: "2px" }}>*</span>
            </label>
            <input
              id="username"
              name="username"
              className="mono"
              value={username}
              disabled={submitting}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例如 lin.yating"
              style={{
                width: "100%",
                height: "42px",
                padding: "0 12px",
                border: `1px solid ${fieldErrors.username ? "var(--danger)" : "var(--line)"}`,
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
              }}
            />
            {fieldErrors.username && (
              <div
                style={{
                  marginTop: "4px",
                  color: "var(--danger)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {fieldErrors.username}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              登入密碼<span style={{ color: "var(--danger)", marginLeft: "2px" }}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入登入密碼"
              style={{
                width: "100%",
                height: "42px",
                padding: "0 12px",
                border: `1px solid ${fieldErrors.password ? "var(--danger)" : "var(--line)"}`,
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
              }}
            />
            {fieldErrors.password && (
              <div
                style={{
                  marginTop: "4px",
                  color: "var(--danger)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {fieldErrors.password}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="captchaInput"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              7 位數英數驗證碼（區分大小寫）
              <span style={{ color: "var(--danger)", marginLeft: "2px" }}>*</span>
            </label>

            <CaptchaBox
              challenge={challenge}
              loading={loadingCaptcha}
              disabled={submitting}
              noteText={captchaNote}
              onRefresh={() => void handleRefreshCaptcha()}
            />

            <input
              id="captchaInput"
              name="captcha"
              className="mono"
              maxLength={7}
              value={captchaInput}
              disabled={submitting}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="請依上方大小寫輸入 7 位數驗證碼"
              style={{
                width: "100%",
                height: "42px",
                padding: "0 12px",
                border: `1px solid ${fieldErrors.captchaCode ? "var(--danger)" : "var(--line)"}`,
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--ink)",
                font: "inherit",
              }}
            />
            <div style={{ marginTop: "4px", color: "var(--muted)", fontSize: "12px" }}>
              驗證碼由英文（A–Z、a–z）與阿拉伯數字（0–9）組成；送出驗證或手動重整後原驗證碼立即失效。
            </div>
            {fieldErrors.captchaCode && (
              <div
                style={{
                  marginTop: "4px",
                  color: "var(--danger)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {fieldErrors.captchaCode}
              </div>
            )}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting || loadingCaptcha}
            data-testid="login-submit-btn"
          >
            {submitting ? "登入驗證中…" : "登入系統"}
          </button>
        </form>

        <aside className="card" style={{ padding: "24px" }} aria-label="預建測試帳號">
          <h2>預建展示帳號快速帶入</h2>
          <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
            點選下方預建帳號可自動填入帳號、密碼與目前畫面上的 7 位數驗證碼：
          </p>

          <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
            {QUICK_ACCOUNTS.map((acc) => (
              <div
                key={acc.username}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: "10px",
                  background: "var(--surface-muted)",
                }}
              >
                <div>
                  <div>
                    <strong>{acc.displayName}</strong>{" "}
                    <span
                      className={`badge ${acc.role === "admin" ? "badge-mine" : "badge-available"}`}
                    >
                      {acc.roleLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                    帳號：<span className="mono">{acc.username}</span>｜密碼：
                    <span className="mono">{acc.password}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleQuickFill(acc)}
                  data-testid={`quick-fill-${acc.username}`}
                >
                  帶入帳號
                </button>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
