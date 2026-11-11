import { getWebhookUrlForClient } from "../config/notificationConfig.js";

export type DiscordFailureReason =
  | "rate_limited"
  | "discord_server_error"
  | "connection_failed"
  | "webhook_invalid"
  | "webhook_not_configured"
  | "message_rejected";

export interface RateLimitInfo {
  /** `X-RateLimit-Remaining`；沒有標頭時為 null */
  remaining: number | null;
  /** `X-RateLimit-Reset-After`（秒）；沒有標頭時為 null */
  resetAfterSeconds: number | null;
}

export type DiscordSendOutcome =
  | { outcome: "sent"; messageId: string }
  /** 確定沒收到、可自動重試。waitSeconds 為 null 時由呼叫端使用退避間隔。 */
  | { outcome: "retryable"; failureReason: DiscordFailureReason; waitSeconds: number | null }
  /** 確定沒收到、不會自己恢復，不自動重試 */
  | { outcome: "failed"; failureReason: DiscordFailureReason }
  /** 不確定對方是否收到，不自動重試 */
  | { outcome: "unknown" };

export type DiscordSendResult = DiscordSendOutcome & {
  /** 沒有收到回應（沒送出、連線失敗、逾時）時為 null */
  rateLimit: RateLimitInfo | null;
};

const TIMEOUT_MS = 10_000;
const MAX_WAIT_SECONDS = 60;

const CONNECT_FAILURE_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ENETDOWN",
  "EHOSTDOWN",
  "UND_ERR_CONNECT_TIMEOUT",
]);

function parseNumberHeader(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function errorName(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "name" in error
    ? String((error as { name: unknown }).name)
    : undefined;
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const cause = (error as { cause?: unknown }).cause;
  if (typeof cause === "object" && cause !== null && "code" in cause) {
    return String((cause as { code: unknown }).code);
  }
  if ("code" in error) return String((error as { code: unknown }).code);
  return undefined;
}

/** log 只寫狀態碼、錯誤代碼與主機名稱，不寫位址、請求與回應物件、錯誤物件（NFR-003）。 */
function logResult(host: string, detail: { status?: number; code?: string; result: string }): void {
  const parts = [`host=${host}`, `result=${detail.result}`];
  if (detail.status !== undefined) parts.push(`status=${detail.status}`);
  if (detail.code !== undefined) parts.push(`code=${detail.code}`);
  console.log(`[discordWebhookClient] ${parts.join(" ")}`);
}

async function readRetryAfterSeconds(response: Response): Promise<number | null> {
  const fromHeader = parseNumberHeader(response.headers.get("retry-after"));
  if (fromHeader !== null) return fromHeader;
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "retry_after" in body) {
      const value = (body as { retry_after: unknown }).retry_after;
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
    }
    return null;
  } catch (error) {
    // 逾時一律視為結果不明，交給外層處理；其他讀取失敗視為沒有等待秒數
    if (errorName(error) === "TimeoutError") throw error;
    return null;
  }
}

async function send(content: string): Promise<DiscordSendResult> {
  const webhookUrl = getWebhookUrlForClient();
  if (webhookUrl === null) {
    logResult("none", { result: "webhook_not_configured" });
    return { outcome: "failed", failureReason: "webhook_not_configured", rateLimit: null };
  }

  const url = new URL(webhookUrl);
  url.searchParams.set("wait", "true");
  const host = url.hostname;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    return classifyError(error, host, null);
  }

  const rateLimit: RateLimitInfo = {
    remaining: parseNumberHeader(response.headers.get("x-ratelimit-remaining")),
    resetAfterSeconds: parseNumberHeader(response.headers.get("x-ratelimit-reset-after")),
  };
  const status = response.status;

  try {
    if (status === 200) {
      const body: unknown = await response.json();
      const id =
        typeof body === "object" && body !== null && "id" in body
          ? (body as { id: unknown }).id
          : undefined;
      if (typeof id === "string" && id !== "") {
        logResult(host, { status, result: "sent" });
        return { outcome: "sent", messageId: id, rateLimit };
      }
      if (typeof id === "number") {
        logResult(host, { status, result: "sent" });
        return { outcome: "sent", messageId: String(id), rateLimit };
      }
      logResult(host, { status, result: "unknown" });
      return { outcome: "unknown", rateLimit };
    }

    if (status === 204) {
      logResult(host, { status, result: "unknown" });
      return { outcome: "unknown", rateLimit };
    }

    if (status === 429) {
      const waitSeconds = await readRetryAfterSeconds(response);
      if (waitSeconds !== null && waitSeconds > MAX_WAIT_SECONDS) {
        logResult(host, { status, result: "failed:rate_limited" });
        return { outcome: "failed", failureReason: "rate_limited", rateLimit };
      }
      logResult(host, { status, result: "retryable:rate_limited" });
      return { outcome: "retryable", failureReason: "rate_limited", waitSeconds, rateLimit };
    }

    if (status >= 500 && status <= 599) {
      logResult(host, { status, result: "retryable:discord_server_error" });
      return {
        outcome: "retryable",
        failureReason: "discord_server_error",
        waitSeconds: null,
        rateLimit,
      };
    }

    if (status === 401 || status === 403 || status === 404) {
      logResult(host, { status, result: "failed:webhook_invalid" });
      return { outcome: "failed", failureReason: "webhook_invalid", rateLimit };
    }

    if (status >= 400 && status <= 499) {
      logResult(host, { status, result: "failed:message_rejected" });
      return { outcome: "failed", failureReason: "message_rejected", rateLimit };
    }

    // 其他不在分類內的狀態碼（例如 1xx、3xx、其他 2xx）：不確定對方是否收到
    logResult(host, { status, result: "unknown" });
    return { outcome: "unknown", rateLimit };
  } catch (error) {
    // 讀取回應內容失敗（含逾時）：結果不明
    return classifyError(error, host, rateLimit, status);
  }
}

function classifyError(
  error: unknown,
  host: string,
  rateLimit: RateLimitInfo | null,
  status?: number,
): DiscordSendResult {
  const code = errorCode(error);
  const logCode = errorName(error) === "TimeoutError" ? "TimeoutError" : code;

  // 只有回應還沒收到、且確定在連線建立前失敗，才算確定沒收到
  if (status === undefined && code !== undefined && CONNECT_FAILURE_CODES.has(code)) {
    logResult(host, { code, result: "retryable:connection_failed" });
    return {
      outcome: "retryable",
      failureReason: "connection_failed",
      waitSeconds: null,
      rateLimit,
    };
  }

  logResult(host, { status, code: logCode, result: "unknown" });
  return { outcome: "unknown", rateLimit };
}

export const discordWebhookClient = { send };
