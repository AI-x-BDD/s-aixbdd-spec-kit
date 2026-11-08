import React from "react";

export interface CaptchaChallenge {
  challengeId: string;
  captchaCode: string;
  expiresAt: string;
}

interface CaptchaBoxProps {
  challenge: CaptchaChallenge | null;
  loading: boolean;
  disabled: boolean;
  noteText?: string;
  onRefresh: () => void;
}

export function CaptchaBox({
  challenge,
  loading,
  disabled,
  noteText,
  onRefresh,
}: CaptchaBoxProps): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "10px",
        padding: "12px 14px",
        border: "1px solid var(--line)",
        borderRadius: "10px",
        background: "var(--surface-muted)",
      }}
    >
      {loading || !challenge ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--muted)",
            fontSize: "13px",
          }}
        >
          <span>正在產生 7 位數驗證碼…</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span
            className="mono"
            data-testid="captcha-code"
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "var(--primary)",
              userSelect: "all",
            }}
          >
            {challenge.captchaCode}
          </span>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            挑戰編號 <span className="mono">{challenge.challengeId.slice(0, 8)}</span>｜
            {noteText || "有效期限 5 分鐘"}
          </span>
        </div>
      )}

      <button
        type="button"
        className="btn btn-sm"
        disabled={loading || disabled}
        onClick={onRefresh}
        data-testid="refresh-captcha-btn"
      >
        重整驗證碼
      </button>
    </div>
  );
}
