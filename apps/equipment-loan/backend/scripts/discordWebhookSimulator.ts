import http from "node:http";
import type { AddressInfo } from "node:net";
import { pathToFileURL } from "node:url";

export const SIMULATOR_MODES = [
  "success",
  "rate_limit",
  "server_error",
  "timeout",
  "disconnect",
  "not_found",
] as const;

export type SimulatorMode = (typeof SIMULATOR_MODES)[number];

export interface SimulatorState {
  mode: SimulatorMode;
  retryAfterSeconds: number;
  statusCode: number;
  /** 前 N 次請求依模式回應，之後改回 success；null 代表不限次數 */
  failTimes: number | null;
  /** 剩餘的 failTimes；failTimes 為 null 時也是 null */
  remainingFailTimes: number | null;
}

export interface SimulatorMessage {
  id: string;
  content: string;
  timestamp: string;
}

export interface SimulatorModeSettings {
  mode: SimulatorMode;
  retryAfterSeconds?: number;
  statusCode?: number;
  failTimes?: number;
}

export interface CreateSimulatorOptions {
  /** 預設 0（由系統挑選連接埠） */
  port?: number;
  host?: string;
  mode?: SimulatorMode;
  /** 設為 true 時才寫 log（模式與收到的訊息數，不寫請求路徑） */
  log?: boolean;
}

export interface DiscordWebhookSimulator {
  port: number;
  host: string;
  /** 指向這個模擬器的 Webhook 位址，可直接設為 DISCORD_WEBHOOK_URL */
  webhookUrl: string;
  getState(): SimulatorState;
  setMode(settings: SimulatorModeSettings): SimulatorState;
  getMessages(): SimulatorMessage[];
  clearMessages(): void;
  close(): Promise<void>;
}

const DEFAULT_RETRY_AFTER_SECONDS = 2;
const DEFAULT_STATUS_CODE = 500;
const WEBHOOK_PATH = /^\/api\/webhooks\/[^/]+\/[^/]+$/;

function isSimulatorMode(value: unknown): value is SimulatorMode {
  return typeof value === "string" && (SIMULATOR_MODES as readonly string[]).includes(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseModeSettings(body: unknown): SimulatorModeSettings | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  if (!isSimulatorMode(input.mode)) return null;
  const settings: SimulatorModeSettings = { mode: input.mode };
  if (input.retryAfterSeconds !== undefined) {
    if (!isNonNegativeInteger(input.retryAfterSeconds)) return null;
    settings.retryAfterSeconds = input.retryAfterSeconds;
  }
  if (input.statusCode !== undefined) {
    if (
      !isNonNegativeInteger(input.statusCode) ||
      input.statusCode < 500 ||
      input.statusCode > 599
    ) {
      return null;
    }
    settings.statusCode = input.statusCode;
  }
  if (input.failTimes !== undefined) {
    if (!isNonNegativeInteger(input.failTimes)) return null;
    settings.failTimes = input.failTimes;
  }
  return settings;
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

export async function createDiscordWebhookSimulator(
  options: CreateSimulatorOptions = {},
): Promise<DiscordWebhookSimulator> {
  const host = options.host ?? "127.0.0.1";
  const shouldLog = options.log ?? false;

  let mode: SimulatorMode = options.mode ?? "success";
  let retryAfterSeconds = DEFAULT_RETRY_AFTER_SECONDS;
  let statusCode = DEFAULT_STATUS_CODE;
  let failTimes: number | null = null;
  let remainingFailTimes: number | null = null;
  let messages: SimulatorMessage[] = [];
  // 遞增的 snowflake 字串（用 BigInt 避免超出安全整數）
  let nextId = 1_000_000_000_000_000_000n;

  const getState = (): SimulatorState => ({
    mode,
    retryAfterSeconds,
    statusCode,
    failTimes,
    remainingFailTimes,
  });

  const log = (): void => {
    if (shouldLog) {
      console.log(`[discord-simulator] mode=${mode} messages=${messages.length}`);
    }
  };

  const setMode = (settings: SimulatorModeSettings): SimulatorState => {
    mode = settings.mode;
    retryAfterSeconds = settings.retryAfterSeconds ?? DEFAULT_RETRY_AFTER_SECONDS;
    statusCode = settings.statusCode ?? DEFAULT_STATUS_CODE;
    failTimes = settings.failTimes ?? null;
    remainingFailTimes = failTimes;
    return getState();
  };

  const recordMessage = (rawBody: string): SimulatorMessage => {
    let content = "";
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (typeof parsed === "object" && parsed !== null && "content" in parsed) {
        const value = (parsed as { content: unknown }).content;
        if (typeof value === "string") content = value;
      }
    } catch {
      // 內容不是合法 JSON 時，content 留空
    }
    const message: SimulatorMessage = {
      id: String(nextId),
      content,
      timestamp: new Date().toISOString(),
    };
    nextId += 1n;
    messages.push(message);
    return message;
  };

  const handleWebhook = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL,
  ): Promise<void> => {
    const rawBody = await readBody(req);

    // failTimes 用完後改回 success
    if (mode !== "success" && remainingFailTimes !== null) {
      if (remainingFailTimes <= 0) {
        mode = "success";
      } else {
        remainingFailTimes -= 1;
      }
    }

    const currentMode = mode;
    switch (currentMode) {
      case "success": {
        const message = recordMessage(rawBody);
        log();
        if (url.searchParams.get("wait") === "true") {
          sendJson(
            res,
            200,
            {
              id: message.id,
              channel_id: "000000000000000001",
              content: message.content,
              timestamp: message.timestamp,
            },
            { "X-RateLimit-Remaining": "4", "X-RateLimit-Reset-After": "1" },
          );
        } else {
          res.writeHead(204, { "X-RateLimit-Remaining": "4", "X-RateLimit-Reset-After": "1" });
          res.end();
        }
        return;
      }
      case "rate_limit":
        log();
        sendJson(
          res,
          429,
          {
            message: "You are being rate limited.",
            retry_after: retryAfterSeconds,
            global: false,
          },
          {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset-After": String(retryAfterSeconds),
          },
        );
        return;
      case "server_error":
        log();
        sendJson(
          res,
          statusCode,
          { message: "Internal Server Error" },
          { "X-RateLimit-Remaining": "4", "X-RateLimit-Reset-After": "1" },
        );
        return;
      case "timeout":
        // 讀完請求並記錄訊息後不回應
        recordMessage(rawBody);
        log();
        return;
      case "disconnect":
        // 讀完請求並記錄訊息後直接中斷連線
        recordMessage(rawBody);
        log();
        req.socket.destroy();
        return;
      case "not_found":
        log();
        sendJson(
          res,
          404,
          { message: "Unknown Webhook", code: 10015 },
          { "X-RateLimit-Remaining": "4", "X-RateLimit-Reset-After": "1" },
        );
        return;
    }
  };

  const handle = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const url = new URL(req.url ?? "/", "http://simulator.local");
    const method = req.method ?? "GET";

    if (method === "POST" && WEBHOOK_PATH.test(url.pathname)) {
      await handleWebhook(req, res, url);
      return;
    }
    if (method === "GET" && url.pathname === "/__sim/state") {
      sendJson(res, 200, getState());
      return;
    }
    if (method === "PUT" && url.pathname === "/__sim/mode") {
      let body: unknown = null;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        body = null;
      }
      const settings = parseModeSettings(body);
      if (settings === null) {
        sendJson(res, 400, { error: "invalid mode settings" });
        return;
      }
      sendJson(res, 200, setMode(settings));
      return;
    }
    if (method === "GET" && url.pathname === "/__sim/messages") {
      sendJson(res, 200, messages);
      return;
    }
    if (method === "DELETE" && url.pathname === "/__sim/messages") {
      messages = [];
      res.writeHead(204);
      res.end();
      return;
    }
    sendJson(res, 404, { error: "not found" });
  };

  const server = http.createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) sendJson(res, 500, { error: "simulator error" });
      else res.destroy();
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const port = (server.address() as AddressInfo).port;

  return {
    port,
    host,
    webhookUrl: `http://${host}:${port}/api/webhooks/000000000000000000/simulator-token`,
    getState,
    setMode,
    getMessages: () => [...messages],
    clearMessages: () => {
      messages = [];
    },
    close: () =>
      new Promise<void>((resolve) => {
        // timeout 模式下有未回應的連線，要先關閉才能停止
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}

function parseModeArgument(argv: string[]): SimulatorMode {
  const arg = argv.find((value) => value.startsWith("--mode="));
  if (arg === undefined) return "success";
  const value = arg.slice("--mode=".length);
  if (!isSimulatorMode(value)) {
    console.error(`--mode 必須是下列其中之一：${SIMULATOR_MODES.join("、")}`);
    process.exit(1);
  }
  return value;
}

const isDirectRun =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const mode = parseModeArgument(process.argv.slice(2));
  const port = Number(process.env.DISCORD_SIM_PORT ?? 4010);
  const simulator = await createDiscordWebhookSimulator({
    port,
    host: "127.0.0.1",
    mode,
    log: true,
  });
  console.log(
    `[discord-simulator] 已啟動 host=${simulator.host} port=${simulator.port} mode=${mode}`,
  );
  const shutdown = (): void => {
    void simulator.close().then(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
