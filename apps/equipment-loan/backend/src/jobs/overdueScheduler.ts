import { getSchedulerConfig } from "../config/notificationConfig.js";
import { prisma } from "../db/prisma.js";
import {
  discordWebhookClient,
  type DiscordSendResult,
} from "../integrations/discordWebhookClient.js";
import {
  buildOverdueNotificationContent,
  runOverdueCheck,
} from "../services/overdueNotificationService.js";

/** 每輪最多自動重試 3 次（FR-014）。 */
const MAX_AUTO_RETRIES = 3;
/** 沒有等待秒數時的退避間隔：第 1、2、3 次自動重試分別等 2、4、8 秒。 */
const BACKOFF_SECONDS = [2, 4, 8];

/** 速率限制暫停：到這個時間點之前不領取下一則通知（毫秒時間戳，依傳入的 now 計算）。 */
let pausedUntilMs: number | null = null;

interface ClaimedNotification {
  id: string;
  reservation_id: string;
  auto_retry_count: number;
}

interface NotificationSource {
  equipment_code: string;
  equipment_name: string;
  member_name: string;
  reservation_date: string;
  slot_name: string;
  slot_start_time: string;
  slot_end_time: string;
}

/**
 * S3 系統恢復運作時的處理（FR-021）：把「已送出、等待 Discord 回應」的通知改為「結果不明」，
 * `next_attempt_at` 有值（等待送出或等待自動重試）的通知保留。只在程序啟動時執行一次。
 *
 * @returns 改為「結果不明」的通知數
 */
export async function recoverInterruptedNotifications(now: Date): Promise<number> {
  return prisma.$executeRaw`
    UPDATE overdue_notifications
    SET status = 'unknown'::overdue_notification_status, updated_at = ${now}::timestamptz
    WHERE status = 'sending' AND next_attempt_at IS NULL
  `;
}

async function claimDueNotification(now: Date): Promise<ClaimedNotification | null> {
  const rows = await prisma.$queryRaw<ClaimedNotification[]>`
    UPDATE overdue_notifications
    SET next_attempt_at = NULL,
        attempt_count = attempt_count + 1,
        last_attempted_at = ${now}::timestamptz,
        updated_at = ${now}::timestamptz
    WHERE id = (
      SELECT id FROM overdue_notifications
      WHERE status = 'sending' AND next_attempt_at <= ${now}::timestamptz
      ORDER BY next_attempt_at
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, reservation_id, auto_retry_count
  `;
  return rows[0] ?? null;
}

async function readNotificationSource(reservationId: string): Promise<NotificationSource | null> {
  const rows = await prisma.$queryRaw<NotificationSource[]>`
    SELECT e.equipment_code AS equipment_code,
           e.name AS equipment_name,
           u.display_name AS member_name,
           to_char(r.reservation_date, 'YYYY-MM-DD') AS reservation_date,
           s.name AS slot_name,
           s.start_time AS slot_start_time,
           s.end_time AS slot_end_time
    FROM reservations r
    JOIN equipments e ON e.id = r.equipment_id
    JOIN users u ON u.id = r.user_id
    JOIN time_slots s ON s.id = r.slot_id
    WHERE r.id = ${reservationId}::uuid
  `;
  return rows[0] ?? null;
}

/** 依 notification/plan.md §2 轉換表與 §3 分類更新同一列；只寫 overdue_notifications，updated_by 為空。 */
async function applyResult(
  notification: ClaimedNotification,
  result: DiscordSendResult,
  now: Date,
): Promise<void> {
  const { id, auto_retry_count: autoRetryCount } = notification;

  switch (result.outcome) {
    case "sent":
      await prisma.overdue_notifications.update({
        where: { id },
        data: {
          status: "sent",
          sent_at: now,
          discord_message_id: result.messageId,
          updated_at: now,
        },
      });
      console.log(`[overdueScheduler] notification=${id} status=sent`);
      return;
    case "retryable": {
      if (autoRetryCount < MAX_AUTO_RETRIES) {
        const waitSeconds = result.waitSeconds ?? BACKOFF_SECONDS[autoRetryCount];
        await prisma.overdue_notifications.update({
          where: { id },
          data: {
            next_attempt_at: new Date(now.getTime() + waitSeconds * 1000),
            auto_retry_count: autoRetryCount + 1,
            updated_at: now,
          },
        });
        console.log(
          `[overdueScheduler] notification=${id} status=sending reason=${result.failureReason} autoRetry=${autoRetryCount + 1}`,
        );
        return;
      }
      await prisma.overdue_notifications.update({
        where: { id },
        data: { status: "failed", failure_reason: result.failureReason, updated_at: now },
      });
      console.log(
        `[overdueScheduler] notification=${id} status=failed reason=${result.failureReason}`,
      );
      return;
    }
    case "failed":
      await prisma.overdue_notifications.update({
        where: { id },
        data: { status: "failed", failure_reason: result.failureReason, updated_at: now },
      });
      console.log(
        `[overdueScheduler] notification=${id} status=failed reason=${result.failureReason}`,
      );
      return;
    case "unknown":
      await prisma.overdue_notifications.update({
        where: { id },
        data: { status: "unknown", failure_reason: null, updated_at: now },
      });
      console.log(`[overdueScheduler] notification=${id} status=unknown`);
      return;
  }
}

async function processNotification(notification: ClaimedNotification, now: Date): Promise<void> {
  // 已歸還的借用照常送出（UD2），不檢查 reservations.status
  const source = await readNotificationSource(notification.reservation_id);
  if (source === null) {
    // 讀不到內容資料時沒有送出請求；領取時已清空 next_attempt_at，標成結果不明交由管理員確認
    await applyResult(notification, { outcome: "unknown", rateLimit: null }, now);
    return;
  }

  const content = buildOverdueNotificationContent(
    {
      equipmentCode: source.equipment_code,
      equipmentName: source.equipment_name,
      memberName: source.member_name,
      reservationDate: source.reservation_date,
      slotName: source.slot_name,
      slotStartTime: source.slot_start_time,
      slotEndTime: source.slot_end_time,
    },
    now,
  );

  const result = await discordWebhookClient.send(content);
  await applyResult(notification, result, now);

  // 速率限制：剩餘為 0 時暫停到 reset-after 秒之後才領取下一則
  if (result.rateLimit?.remaining === 0 && result.rateLimit.resetAfterSeconds !== null) {
    pausedUntilMs = now.getTime() + result.rateLimit.resetAfterSeconds * 1000;
  }
}

/**
 * S2 通知送出與自動重試程序：領取到期的「送出中」通知，一次處理一則，直到沒有到期的通知。
 * 速率限制暫停時直接結束，下次執行（每 1 秒）再檢查是否已過暫停時間。
 *
 * @returns 這次處理的通知數
 */
export async function dispatchDueNotifications(now: Date): Promise<number> {
  let processed = 0;
  for (;;) {
    if (pausedUntilMs !== null) {
      if (now.getTime() < pausedUntilMs) return processed;
      pausedUntilMs = null;
    }

    const notification = await claimDueNotification(now);
    if (notification === null) return processed;

    await processNotification(notification, now);
    processed += 1;
  }
}

/** S2 送出程序的執行間隔（毫秒）。 */
const DISPATCH_INTERVAL_MS = 1000;

let stopScheduler: (() => void) | null = null;

/** 排程失敗只記錄錯誤名稱，不寫錯誤物件原文（NFR-003）。 */
function logJobError(job: string, error: unknown): void {
  const name = error instanceof Error ? error.name : "UnknownError";
  console.error(`[overdueScheduler] ${job} 執行失敗 error=${name}`);
}

/**
 * 啟動排程（S3 → S1、S2）：先執行一次恢復處理，完成後才啟動自動檢查與送出程序。
 *
 * - `OVERDUE_AUTO_CHECK_ENABLED` 為 `true`：立即執行一次 `runOverdueCheck`，之後以 `setTimeout` 串接，
 *   上一次結束後才排下一次，間隔為 `OVERDUE_CHECK_INTERVAL_SECONDS` 秒；為 `false` 時不排自動檢查。
 * - 送出程序不受開關影響，每 1 秒執行一次，上一次還沒結束時跳過這一次。
 *
 * @returns 停止排程的函式（已經啟動時回傳同一個函式，不重複啟動）
 */
export async function start(): Promise<() => void> {
  if (stopScheduler !== null) return stopScheduler;

  const config = getSchedulerConfig();
  let stopped = false;
  let checkTimer: NodeJS.Timeout | null = null;
  let dispatchTimer: NodeJS.Timeout | null = null;

  // S3：先恢復，完成後才啟動 S1 與 S2
  await recoverInterruptedNotifications(new Date());

  if (config.autoCheckEnabled) {
    const runCheckLoop = async (): Promise<void> => {
      try {
        await runOverdueCheck(new Date());
      } catch (error) {
        logJobError("逾期檢查", error);
      }
      if (!stopped) {
        checkTimer = setTimeout(() => void runCheckLoop(), config.checkIntervalSeconds * 1000);
        checkTimer.unref();
      }
    };
    void runCheckLoop();
  }

  let dispatching = false;
  dispatchTimer = setInterval(() => {
    if (dispatching) return;
    dispatching = true;
    dispatchDueNotifications(new Date())
      .catch((error: unknown) => logJobError("通知送出", error))
      .finally(() => {
        dispatching = false;
      });
  }, DISPATCH_INTERVAL_MS);
  dispatchTimer.unref();

  const stop = (): void => {
    stopped = true;
    if (checkTimer !== null) clearTimeout(checkTimer);
    if (dispatchTimer !== null) clearInterval(dispatchTimer);
    stopScheduler = null;
  };
  stopScheduler = stop;
  return stop;
}
