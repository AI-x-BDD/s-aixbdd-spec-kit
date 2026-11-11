import { z } from "zod";

const DEFAULT_AUTO_CHECK_ENABLED = true;
const DEFAULT_CHECK_INTERVAL_SECONDS = 60;

const webhookUrlSchema = z.url({ protocol: /^https?$/ }).refine((value) => value.trim() === value);

const autoCheckEnabledSchema = z.enum(["true", "false"]);

const intervalSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(10).max(300));

let warnedWebhook = false;
let warnedSettings = false;

/**
 * 每次呼叫都重新讀取環境變數，整合測試在模擬器啟動後才設定的值也能讀到。
 * log 只寫固定文字，不寫輸入值（NFR-003）。
 */
function readWebhookUrl(): string | null {
  const raw = process.env.DISCORD_WEBHOOK_URL?.trim() ?? "";
  const parsed = webhookUrlSchema.safeParse(raw);
  if (parsed.success) {
    warnedWebhook = false;
    return parsed.data;
  }
  if (!warnedWebhook) {
    warnedWebhook = true;
    console.warn("DISCORD_WEBHOOK_URL 沒有設定或格式不正確");
  }
  return null;
}

/** 只提供給 discordWebhookClient 使用；其他模組使用 isWebhookConfigured。 */
export function getWebhookUrlForClient(): string | null {
  return readWebhookUrl();
}

export function isWebhookConfigured(): boolean {
  return readWebhookUrl() !== null;
}

export interface SchedulerConfig {
  autoCheckEnabled: boolean;
  checkIntervalSeconds: number;
}

export function getSchedulerConfig(): SchedulerConfig {
  const rawEnabled = process.env.OVERDUE_AUTO_CHECK_ENABLED?.trim();
  const rawInterval = process.env.OVERDUE_CHECK_INTERVAL_SECONDS?.trim();

  const enabledResult =
    rawEnabled === undefined || rawEnabled === ""
      ? null
      : autoCheckEnabledSchema.safeParse(rawEnabled.toLowerCase());
  const intervalResult =
    rawInterval === undefined || rawInterval === "" ? null : intervalSchema.safeParse(rawInterval);

  const invalid =
    (enabledResult !== null && !enabledResult.success) ||
    (intervalResult !== null && !intervalResult.success);
  if (invalid && !warnedSettings) {
    warnedSettings = true;
    console.warn(
      "OVERDUE_AUTO_CHECK_ENABLED 或 OVERDUE_CHECK_INTERVAL_SECONDS 格式不正確，改用預設值",
    );
  }

  return {
    autoCheckEnabled:
      enabledResult?.success === true ? enabledResult.data === "true" : DEFAULT_AUTO_CHECK_ENABLED,
    checkIntervalSeconds:
      intervalResult?.success === true ? intervalResult.data : DEFAULT_CHECK_INTERVAL_SECONDS,
  };
}
