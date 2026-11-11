import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { seedDatabase } from "../../prisma/seed.js";
import { pool, prisma } from "../../src/db/prisma.js";
import { discordWebhookClient } from "../../src/integrations/discordWebhookClient.js";
import {
  dispatchDueNotifications,
  recoverInterruptedNotifications,
} from "../../src/jobs/overdueScheduler.js";
import {
  listOverdueNotifications,
  resendOverdueNotification,
  runOverdueCheck,
} from "../../src/services/overdueNotificationService.js";
import { addDaysToDateStr, getSlotStartUtc } from "../../src/utils/taipeiTime.js";
import {
  createDiscordWebhookSimulator,
  type DiscordWebhookSimulator,
  type SimulatorMode,
} from "../../scripts/discordWebhookSimulator.js";

// 逾期通知送出與重試整合測試（research §8；notification/plan.md §7 NS1～NS10、NS12～NS14、NS16～NS18、NS20～NS21，
// 另以分類函式直接驗證模擬器無法重現的回應 NS11、NS15）：量測 SC-001（時段結束後 10 分鐘內送出）與 SC-003（重試結果）。
// 不啟動真實計時器：直接呼叫 runOverdueCheck、dispatchDueNotifications、recoverInterruptedNotifications，
// 以 vi.setSystemTime 固定時間；每個情境使用各自的日期（2031 年起、逐日遞增），不依賴執行當下的台北時間，
// 也不會被前一個情境留下的速率限制暫停（pausedUntilMs）影響。

const WU_ID = "11111111-1111-4111-8111-111111111103";
const CHEN_ID = "11111111-1111-4111-8111-111111111102";
const SLOT_IDS = {
  morning: "33333333-3333-4333-8333-333333333001",
  afternoon: "33333333-3333-4333-8333-333333333002",
  evening: "33333333-3333-4333-8333-333333333003",
} as const;
type SlotKey = keyof typeof SLOT_IDS;
const SLOT_END: Record<SlotKey, string> = {
  morning: "12:00",
  afternoon: "17:00",
  evening: "21:00",
};
const SLOT_LABEL: Record<SlotKey, string> = {
  morning: "上午 09:00–12:00",
  afternoon: "下午 13:00–17:00",
  evening: "晚間 18:00–21:00",
};

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const RESERVATION_PREFIX = "RV-T031-";

let dayCounter = 0;
let reservationCounter = 0;
let simulators: DiscordWebhookSimulator[] = [];
let stubServers: http.Server[] = [];
let equipmentIds: Record<string, string> = {};

function nextDate(): string {
  dayCounter += 1;
  return addDaysToDateStr("2031-03-01", dayCounter);
}

/** 該日期的時段結束時間再加上指定秒數。 */
function afterSlotEnd(date: string, slot: SlotKey, seconds: number): Date {
  return new Date(getSlotStartUtc(date, SLOT_END[slot]).getTime() + seconds * 1000);
}

function at(date: Date): Date {
  vi.setSystemTime(date);
  return date;
}

function plus(base: Date, seconds: number): Date {
  return new Date(base.getTime() + seconds * 1000);
}

function weekdayOf(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

async function startSimulator(
  mode: SimulatorMode = "success",
  port = 0,
): Promise<DiscordWebhookSimulator> {
  const simulator = await createDiscordWebhookSimulator({ port, mode });
  simulators.push(simulator);
  process.env.DISCORD_WEBHOOK_URL = simulator.webhookUrl;
  return simulator;
}

async function createLoan(params: {
  date: string;
  slot: SlotKey;
  equipment?: string;
  status?: "checked_out" | "returned";
}): Promise<string> {
  reservationCounter += 1;
  const row = await prisma.reservations.create({
    data: {
      reservation_no: `${RESERVATION_PREFIX}${String(reservationCounter).padStart(4, "0")}`,
      user_id: CHEN_ID,
      equipment_id: equipmentIds[params.equipment ?? "EQ-102"],
      reservation_date: new Date(`${params.date}T00:00:00Z`),
      slot_id: SLOT_IDS[params.slot],
      status: params.status ?? "checked_out",
      checked_out_by: WU_ID,
      checked_out_at: new Date(`${params.date}T01:00:00Z`),
      ...(params.status === "returned"
        ? { returned_by: WU_ID, returned_at: new Date(`${params.date}T08:55:00Z`) }
        : {}),
    },
  });
  return row.id;
}

async function createNotification(
  reservationId: string,
  data: Partial<{
    status: "sending" | "sent" | "failed" | "unknown";
    attempt_count: number;
    auto_retry_count: number;
    next_attempt_at: Date | null;
    failure_reason: "discord_server_error" | "webhook_invalid" | null;
  }>,
): Promise<string> {
  const row = await prisma.overdue_notifications.create({
    data: {
      reservation_id: reservationId,
      status: data.status ?? "sending",
      attempt_count: data.attempt_count ?? 0,
      auto_retry_count: data.auto_retry_count ?? 0,
      next_attempt_at: data.next_attempt_at ?? null,
      failure_reason: data.failure_reason ?? null,
      sent_at: data.status === "sent" ? new Date() : null,
      discord_message_id: data.status === "sent" ? "1304000000000000999" : null,
    },
  });
  return row.id;
}

async function readNotification(reservationId: string) {
  return prisma.overdue_notifications.findUniqueOrThrow({
    where: { reservation_id: reservationId },
  });
}

/** 啟動只回傳固定回應的假 Discord 位址，用來驗證模擬器無法重現的回應（Notes 待確認 2）。 */
async function startStub(
  respond: (res: http.ServerResponse) => void,
): Promise<{ url: string; requests: () => number }> {
  let count = 0;
  const server = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      count += 1;
      respond(res);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  stubServers.push(server);
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}/api/webhooks/000000000000000000/stub-token`;
  process.env.DISCORD_WEBHOOK_URL = url;
  return { url, requests: () => count };
}

describe("逾期通知送出與重試（SC-001、SC-003；NS1～NS21）", () => {
  const originalWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  beforeAll(async () => {
    await seedDatabase();
    // demo seed 內本來就有逾期的借用中紀錄；改為已歸還，讓逾期檢查只看到本檔建立的資料
    await prisma.overdue_notifications.deleteMany({});
    await prisma.reservations.updateMany({
      where: { status: "checked_out" },
      data: { status: "returned", returned_by: WU_ID, returned_at: new Date() },
    });
    const equipments = await prisma.equipments.findMany({
      where: { equipment_code: { in: ["EQ-101", "EQ-102", "EQ-103"] } },
    });
    equipmentIds = Object.fromEntries(equipments.map((e) => [e.equipment_code, e.id]));
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(simulators.map((s) => s.close()));
    await Promise.all(stubServers.map((s) => new Promise((resolve) => s.close(resolve))));
    simulators = [];
    stubServers = [];
    await prisma.overdue_notifications.deleteMany({});
    await prisma.reservations.deleteMany({
      where: { reservation_no: { startsWith: RESERVATION_PREFIX } },
    });
  });

  afterAll(async () => {
    vi.useRealTimers();
    if (originalWebhookUrl === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = originalWebhookUrl;
    await seedDatabase();
    await prisma.$disconnect();
    await pool.end();
  });

  it("NS1 時段結束後送出第一則通知：建立 1 則並變成 sent，內容與規劃的填值範例相同", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const now = at(afterSlotEnd(date, "afternoon", 8 * 60 + 30));

    expect(await runOverdueCheck(now)).toBe(1);
    expect(await dispatchDueNotifications(now)).toBe(1);

    const row = await readNotification(reservationId);
    expect(row.status).toBe("sent");
    expect(row.attempt_count).toBe(1);
    expect(row.sent_at?.getTime()).toBe(now.getTime());
    expect(row.discord_message_id).toBeTruthy();
    const messages = sim.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe(
      [
        "【逾期未還】EQ-102 四通道數位示波器 Keysight DSOX3024T",
        "借用成員：陳冠廷",
        `預約時段：${date}（${weekdayOf(date)}）${SLOT_LABEL.afternoon}`,
        "已逾期 8 分鐘",
      ].join("\n"),
    );
  });

  it("NS2 時段還沒結束或已歸還不建立通知", async () => {
    await startSimulator("success");
    const date = nextDate();
    const notEnded = await createLoan({ date, slot: "evening", equipment: "EQ-102" });
    const returned = await createLoan({
      date,
      slot: "afternoon",
      equipment: "EQ-103",
      status: "returned",
    });
    const now = at(afterSlotEnd(date, "afternoon", 5 * 60));

    expect(await runOverdueCheck(now)).toBe(0);
    expect(await dispatchDueNotifications(now)).toBe(0);
    expect(await prisma.overdue_notifications.count({})).toBe(0);
    expect(notEnded).not.toBe(returned);
  });

  it("NS3 已有通知的逾期借用不再建立：再檢查 3 次，原狀態不變、沒有新訊息", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const sentLoan = await createLoan({ date, slot: "afternoon", equipment: "EQ-102" });
    const failedLoan = await createLoan({ date, slot: "morning", equipment: "EQ-103" });
    await createNotification(sentLoan, { status: "sent", attempt_count: 1 });
    await createNotification(failedLoan, {
      status: "failed",
      attempt_count: 4,
      auto_retry_count: 3,
      failure_reason: "discord_server_error",
    });
    const now = at(afterSlotEnd(date, "afternoon", 3600));

    for (let i = 0; i < 3; i += 1) {
      expect(await runOverdueCheck(now)).toBe(0);
      expect(await dispatchDueNotifications(now)).toBe(0);
    }

    expect(await prisma.overdue_notifications.count({})).toBe(2);
    expect((await readNotification(sentLoan)).status).toBe("sent");
    const failed = await readNotification(failedLoan);
    expect(failed.status).toBe("failed");
    expect(failed.attempt_count).toBe(4);
    expect(sim.getMessages()).toHaveLength(0);
  });

  it("NS4 請求太頻繁、等待後重試成功：第 1 次後仍為 sending，2 秒後 sent，只有 1 則訊息", async () => {
    const sim = await startSimulator("rate_limit");
    sim.setMode({ mode: "rate_limit", retryAfterSeconds: 2, failTimes: 1 });
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const first = await readNotification(reservationId);
    expect(first.status).toBe("sending");
    expect(first.auto_retry_count).toBe(1);
    expect(first.attempt_count).toBe(1);
    expect(first.next_attempt_at?.getTime()).toBe(plus(t0, 2).getTime());
    expect(sim.getMessages()).toHaveLength(0);

    await dispatchDueNotifications(at(plus(t0, 2)));
    const second = await readNotification(reservationId);
    expect(second.status).toBe("sent");
    expect(second.attempt_count).toBe(2);
    expect(sim.getMessages()).toHaveLength(1);
  });

  it("NS5 請求太頻繁且要求等待超過 1 分鐘：直接 failed／rate_limited，之後不再送出", async () => {
    const sim = await startSimulator("rate_limit");
    sim.setMode({ mode: "rate_limit", retryAfterSeconds: 120 });
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("failed");
    expect(row.failure_reason).toBe("rate_limited");
    expect(row.attempt_count).toBe(1);

    // 超過速率限制暫停（120 秒）之後再執行，確認不送出是因為通知已是 failed
    expect(await dispatchDueNotifications(at(plus(t0, 130)))).toBe(0);
    expect((await readNotification(reservationId)).attempt_count).toBe(1);
    const page = await listOverdueNotifications({ page: 1, pageSize: 20 });
    expect(page.items[0].failureReason).toBe("rate_limited");
  });

  it("NS6 伺服器錯誤自動重試 3 次仍失敗：attempt_count 4、auto_retry_count 3，之後不再送出", async () => {
    const sim = await startSimulator("server_error");
    sim.setMode({ mode: "server_error", statusCode: 500 });
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    // 退避間隔 2、4、8 秒：送出時間為 0、2、6、14 秒
    for (const seconds of [0, 2, 6, 14]) {
      expect(await dispatchDueNotifications(at(plus(t0, seconds)))).toBe(1);
    }
    const row = await readNotification(reservationId);
    expect(row.status).toBe("failed");
    expect(row.failure_reason).toBe("discord_server_error");
    expect(row.attempt_count).toBe(4);
    expect(row.auto_retry_count).toBe(3);
    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(sim.getMessages()).toHaveLength(0);
  });

  it("NS7 送出前連線失敗、恢復後重試成功", async () => {
    const stopped = await startSimulator("success");
    const port = stopped.port;
    await stopped.close();
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const first = await readNotification(reservationId);
    expect(first.status).toBe("sending");
    expect(first.auto_retry_count).toBe(1);

    const restored = await startSimulator("success", port);
    await dispatchDueNotifications(at(plus(t0, 2)));
    const second = await readNotification(reservationId);
    expect(second.status).toBe("sent");
    expect(restored.getMessages()).toHaveLength(1);
  });

  it("NS8 送出前連線一直失敗：failed／connection_failed，attempt_count 4", async () => {
    const stopped = await startSimulator("success");
    await stopped.close();
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    for (const seconds of [0, 2, 6, 14]) {
      expect(await dispatchDueNotifications(at(plus(t0, seconds)))).toBe(1);
    }
    const row = await readNotification(reservationId);
    expect(row.status).toBe("failed");
    expect(row.failure_reason).toBe("connection_failed");
    expect(row.attempt_count).toBe(4);
    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
  });

  it("NS9 Webhook 已失效不重試：failed／webhook_invalid，失敗原因、API 回應與 log 沒有 Webhook 位址", async () => {
    const sim = await startSimulator("not_found");
    const logs: string[] = [];
    for (const method of ["log", "warn", "error"] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logs.push(args.map(String).join(" "));
      });
    }
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("failed");
    expect(row.failure_reason).toBe("webhook_invalid");
    expect(row.attempt_count).toBe(1);
    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(sim.getMessages()).toHaveLength(0);

    const page = await listOverdueNotifications({ page: 1, pageSize: 20 });
    expect(JSON.stringify(page)).not.toContain("simulator-token");
    expect(JSON.stringify(row)).not.toContain("simulator-token");
    expect(logs.join("\n")).not.toContain("simulator-token");
    expect(logs.join("\n")).not.toContain(String(sim.port));
  });

  it("NS10 沒有設定 Webhook 位址：不送出請求，failed／webhook_not_configured，log 只寫固定文字", async () => {
    const sim = await startSimulator("success");
    process.env.DISCORD_WEBHOOK_URL = "";
    const warnings: string[] = [];
    vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
      warnings.push(args.map(String).join(" "));
    });
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("failed");
    expect(row.failure_reason).toBe("webhook_not_configured");
    expect(sim.getMessages()).toHaveLength(0);
    expect(warnings).toEqual(["DISCORD_WEBHOOK_URL 沒有設定或格式不正確"]);
  });

  it("NS11 Discord 拒絕訊息內容（400）：分類為 message_rejected，S2 標為 failed／message_rejected，不重試", async () => {
    const stub = await startStub((res) => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid Form Body", code: 50035 }));
    });
    expect(await discordWebhookClient.send("測試")).toMatchObject({
      outcome: "failed",
      failureReason: "message_rejected",
    });

    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);
    const before = stub.requests();
    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("failed");
    expect(row.failure_reason).toBe("message_rejected");
    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(stub.requests()).toBe(before + 1);
  });

  it("NS15 回應沒有訊息編號：標為 unknown，不自動重試；其他模擬器無法重現的回應也直接分類（Notes 待確認 2）", async () => {
    // 200 沒有 id
    const noId = await startStub((res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ channel_id: "1", content: "x" }));
    });
    expect(await discordWebhookClient.send("測試")).toMatchObject({ outcome: "unknown" });

    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);
    const before = noId.requests();
    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("unknown");
    expect(row.failure_reason).toBeNull();
    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(noId.requests()).toBe(before + 1);

    // 401、403：webhook_invalid；204：結果不明；沒有等待秒數的 429：可重試、用退避間隔
    for (const status of [401, 403]) {
      await startStub((res) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end("{}");
      });
      expect(await discordWebhookClient.send("測試")).toMatchObject({
        outcome: "failed",
        failureReason: "webhook_invalid",
      });
    }
    await startStub((res) => {
      res.writeHead(204);
      res.end();
    });
    expect(await discordWebhookClient.send("測試")).toMatchObject({ outcome: "unknown" });
    await startStub((res) => {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "You are being rate limited." }));
    });
    expect(await discordWebhookClient.send("測試")).toMatchObject({
      outcome: "retryable",
      failureReason: "rate_limited",
      waitSeconds: null,
    });
  });

  it("NS12 等不到回應標為結果不明：10 秒逾時後 unknown，failure_reason 為空，不自動重送", async () => {
    const sim = await startSimulator("timeout");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("unknown");
    expect(row.failure_reason).toBeNull();
    expect(row.auto_retry_count).toBe(0);
    expect(sim.getMessages()).toHaveLength(1);

    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(sim.getMessages()).toHaveLength(1);
    expect((await readNotification(reservationId)).attempt_count).toBe(1);
  }, 30_000);

  it("NS13 送出後連線中斷：unknown，對方可能已收到（1 則訊息），不自動重送", async () => {
    const sim = await startSimulator("disconnect");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("unknown");
    expect(row.failure_reason).toBeNull();
    expect(sim.getMessages()).toHaveLength(1);

    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(sim.getMessages()).toHaveLength(1);
  });

  it("NS14 自動重試途中等不到回應：第 2 次逾時後 unknown，auto_retry_count 為 1，不再自動重試", async () => {
    const sim = await startSimulator("server_error");
    sim.setMode({ mode: "server_error", statusCode: 500, failTimes: 1 });
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const t0 = at(afterSlotEnd(date, "afternoon", 60));
    await runOverdueCheck(t0);

    await dispatchDueNotifications(t0);
    expect((await readNotification(reservationId)).status).toBe("sending");
    sim.setMode({ mode: "timeout" });

    await dispatchDueNotifications(at(plus(t0, 2)));
    const row = await readNotification(reservationId);
    expect(row.status).toBe("unknown");
    expect(row.auto_retry_count).toBe(1);
    expect(row.attempt_count).toBe(2);
    expect(await dispatchDueNotifications(at(plus(t0, 100)))).toBe(0);
    expect(sim.getMessages()).toHaveLength(1);
  }, 30_000);

  it("NS16 恢復時等待自動重試的通知繼續重試：S3 不修改，S2 送出後 sent，只有 1 則訊息", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const now = at(afterSlotEnd(date, "afternoon", 600));
    await createNotification(reservationId, {
      status: "sending",
      attempt_count: 3,
      auto_retry_count: 2,
      next_attempt_at: plus(now, -5),
    });

    expect(await recoverInterruptedNotifications(now)).toBe(0);
    const recovered = await readNotification(reservationId);
    expect(recovered.status).toBe("sending");
    expect(recovered.auto_retry_count).toBe(2);

    await dispatchDueNotifications(now);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("sent");
    expect(row.attempt_count).toBe(4);
    expect(sim.getMessages()).toHaveLength(1);
  });

  it("NS17 恢復時等待回應的通知標為結果不明：之後的 S2 不送出", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const now = at(afterSlotEnd(date, "afternoon", 600));
    await createNotification(reservationId, {
      status: "sending",
      attempt_count: 1,
      next_attempt_at: null,
    });

    expect(await recoverInterruptedNotifications(now)).toBe(1);
    expect((await readNotification(reservationId)).status).toBe("unknown");
    expect(await dispatchDueNotifications(plus(now, 60))).toBe(0);
    expect(sim.getMessages()).toHaveLength(0);
  });

  it("NS18 停機期間才逾期的借用：S3 完成後第一次 S1 建立 1 則通知，S2 送出", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "morning" });
    // 程序停止 2 小時後啟動：時段在停機期間結束
    const now = at(afterSlotEnd(date, "morning", 2 * 3600));

    expect(await recoverInterruptedNotifications(now)).toBe(0);
    expect(await runOverdueCheck(now)).toBe(1);
    expect(await dispatchDueNotifications(now)).toBe(1);
    expect((await readNotification(reservationId)).status).toBe("sent");
    expect(sim.getMessages()).toHaveLength(1);
    expect(sim.getMessages()[0].content).toContain("已逾期 2 小時 0 分鐘");
  });

  it("NS20 重送「送出失敗」的通知由 S2 送出：兩位管理員同時重送只有一個成功，attempt_count 5，只送 1 則", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const failedAt = at(afterSlotEnd(date, "afternoon", 600));
    const notificationId = await createNotification(reservationId, {
      status: "failed",
      attempt_count: 4,
      auto_retry_count: 3,
      failure_reason: "discord_server_error",
    });
    const total = await prisma.overdue_notifications.count({});

    const results = await Promise.allSettled([
      resendOverdueNotification(notificationId, WU_ID, failedAt),
      resendOverdueNotification(notificationId, WU_ID, failedAt),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((r) => r.status === "rejected");
    expect(rejected).toBeDefined();
    expect((rejected as PromiseRejectedResult).reason).toMatchObject({
      status: 409,
      code: "OVERDUE_NOTIFICATION_NOT_RESENDABLE",
    });

    // 重送後 S2 在更晚的時間送出，第 4 行依送出當下重新計算
    const sendAt = at(plus(failedAt, 3600));
    expect(await dispatchDueNotifications(sendAt)).toBe(1);
    const row = await readNotification(reservationId);
    expect(row.status).toBe("sent");
    expect(row.attempt_count).toBe(5);
    expect(await prisma.overdue_notifications.count({})).toBe(total);
    const messages = sim.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].content.split("\n")[3]).toBe("已逾期 1 小時 10 分鐘");
  });

  it("NS21 送出中時借用被歸還，照常送出：sent，loanReturned 為 true、canResend 為 false", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const reservationId = await createLoan({ date, slot: "afternoon" });
    const now = at(afterSlotEnd(date, "afternoon", 600));
    await createNotification(reservationId, {
      status: "sending",
      attempt_count: 1,
      auto_retry_count: 1,
      next_attempt_at: plus(now, 2),
    });
    await prisma.reservations.update({
      where: { id: reservationId },
      data: { status: "returned", returned_by: WU_ID, returned_at: now },
    });

    await dispatchDueNotifications(at(plus(now, 2)));
    expect((await readNotification(reservationId)).status).toBe("sent");
    expect(sim.getMessages()).toHaveLength(1);

    const page = await listOverdueNotifications({ page: 1, pageSize: 20 });
    expect(page.items[0].loanReturned).toBe(true);
    expect(page.items[0].canResend).toBe(false);
  });

  it("SC-001 時段結束後 10 分鐘內送出：每 60 秒執行一次檢查與送出，3 筆逾期借用 100% 在 10 分鐘內 sent", async () => {
    const sim = await startSimulator("success");
    const date = nextDate();
    const slots: { slot: SlotKey; equipment: string }[] = [
      { slot: "morning", equipment: "EQ-101" },
      { slot: "afternoon", equipment: "EQ-102" },
      { slot: "evening", equipment: "EQ-103" },
    ];
    const loans = await Promise.all(slots.map((s) => createLoan({ date, ...s })));

    // 各時段結束前後的檢查週期（其餘時間沒有逾期借用，檢查不會建立通知）；起點錯開，不剛好對齊結束時間
    for (const { slot } of slots) {
      for (let seconds = -540; seconds <= 11 * 60; seconds += 60) {
        const tick = at(afterSlotEnd(date, slot, seconds + 17));
        await runOverdueCheck(tick);
        await dispatchDueNotifications(tick);
      }
    }

    for (let i = 0; i < slots.length; i += 1) {
      const row = await readNotification(loans[i]);
      expect(row.status, slots[i].slot).toBe("sent");
      expect(row.attempt_count).toBe(1);
      const delayMs =
        (row.sent_at as Date).getTime() - afterSlotEnd(date, slots[i].slot, 0).getTime();
      expect(delayMs, slots[i].slot).toBeGreaterThan(0);
      expect(delayMs, slots[i].slot).toBeLessThanOrEqual(10 * 60 * 1000);
    }
    expect(sim.getMessages()).toHaveLength(3);
  }, 60_000);

  it("SC-003 等待不超過 1 分鐘且 3 次內恢復：3 則通知 100% 為 sent", async () => {
    const sim = await startSimulator("rate_limit");
    // 每則等待 30 秒；前 2 次請求被限制，第 3 次起恢復（單一通知最多重試 2 次，不超過 3 次）
    sim.setMode({ mode: "rate_limit", retryAfterSeconds: 30, failTimes: 2 });
    const date = nextDate();
    const loans = [
      await createLoan({ date, slot: "morning", equipment: "EQ-101" }),
      await createLoan({ date, slot: "afternoon", equipment: "EQ-102" }),
      await createLoan({ date, slot: "evening", equipment: "EQ-103" }),
    ];
    const t0 = at(afterSlotEnd(date, "evening", 60));
    expect(await runOverdueCheck(t0)).toBe(3);

    for (let seconds = 0; seconds <= 200; seconds += 1) {
      await dispatchDueNotifications(at(plus(t0, seconds)));
    }

    for (const id of loans) {
      const row = await readNotification(id);
      expect(row.status).toBe("sent");
      expect(row.auto_retry_count).toBeLessThanOrEqual(3);
    }
    expect(sim.getMessages()).toHaveLength(3);
  });

  it("SC-003 送出後連線中斷：3 則通知 100% 為 unknown，自動重送 0 次", async () => {
    const sim = await startSimulator("disconnect");
    const date = nextDate();
    const loans = [
      await createLoan({ date, slot: "morning", equipment: "EQ-101" }),
      await createLoan({ date, slot: "afternoon", equipment: "EQ-102" }),
      await createLoan({ date, slot: "evening", equipment: "EQ-103" }),
    ];
    const t0 = at(afterSlotEnd(date, "evening", 60));
    expect(await runOverdueCheck(t0)).toBe(3);

    for (let seconds = 0; seconds <= 120; seconds += 1) {
      await dispatchDueNotifications(at(plus(t0, seconds)));
    }

    for (const id of loans) {
      const row = await readNotification(id);
      expect(row.status).toBe("unknown");
      expect(row.failure_reason).toBeNull();
      expect(row.attempt_count).toBe(1);
      expect(row.auto_retry_count).toBe(0);
    }
    expect(sim.getMessages()).toHaveLength(3);
  });
});
