import { describe, expect, it } from "vitest";
import type { OverdueNotification, OverdueNotificationPage } from "../../src/api/client";
import { UI_TEXT } from "../../src/text/zh-TW";
import { fetchPageWithinRange } from "../../src/views/OverdueNotificationsView";

const PAGE_SIZE = 20;

/** 建立篩選「送出失敗」的第 n 則假通知。 */
function failedNotification(n: number): OverdueNotification {
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    reservationId: `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    reservationNumber: `RV-20261027-${String(n).padStart(2, "0")}`,
    equipmentId: "20000000-0000-4000-8000-000000000001",
    equipmentCode: "EQ-107",
    equipmentName: "恆溫培養箱 Memmert IN110",
    userId: "30000000-0000-4000-8000-000000000001",
    userDisplayName: "陳冠廷",
    reservationDate: "2026-10-27",
    slotName: "下午",
    slotStartTime: "13:00",
    slotEndTime: "17:00",
    status: "failed",
    attemptCount: 1,
    lastAttemptedAt: "2026-10-27T09:01:00.000Z",
    sentAt: null,
    discordMessageId: null,
    failureReason: "webhook_invalid",
    loanReturned: true,
    returnedAt: "2026-10-28T02:00:00.000Z",
    canResend: false,
    createdAt: "2026-10-27T09:01:00.000Z",
  };
}

/** 依合約 listOverdueNotifications：page 超過 totalPages 時回應空的 items，totalItems 與 totalPages 照常回傳。 */
function fakeFetch(totalItems: number): {
  fetchPage: (page: number) => Promise<OverdueNotificationPage>;
  calls: number[];
} {
  const all = Array.from({ length: totalItems }, (_, i) => failedNotification(i + 1));
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const calls: number[] = [];
  return {
    calls,
    fetchPage: async (page) => {
      calls.push(page);
      return {
        items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        page,
        pageSize: PAGE_SIZE,
        totalItems,
        totalPages,
      };
    },
  };
}

function pagerText(currentPage: number, result: OverdueNotificationPage): string {
  return UI_TEXT.overdueNotifications.pager(
    currentPage,
    result.totalPages,
    (currentPage - 1) * result.pageSize + 1,
    Math.min(currentPage * result.pageSize, result.totalItems),
  );
}

describe("逾期通知紀錄：目前頁碼超過總頁數時改載最後一頁", () => {
  it("送出失敗最後一頁重送後剩 40 則：第 3 頁回應空清單，改載第 2 頁的 20 則", async () => {
    const { fetchPage, calls } = fakeFetch(40);

    const { result, currentPage } = await fetchPageWithinRange(fetchPage, 3);

    expect(calls).toEqual([3, 2]);
    expect(currentPage).toBe(2);
    expect(result.items).toHaveLength(20);
    expect(result.totalItems).toBe(40);
    expect(result.totalPages).toBe(2);
    expect(pagerText(currentPage, result)).toBe("第 2／2 頁，第 21–40 則");
  });

  it("篩選結果為 0 則時不再查詢，維持空清單", async () => {
    const { fetchPage, calls } = fakeFetch(0);

    const { result, currentPage } = await fetchPageWithinRange(fetchPage, 3);

    expect(calls).toEqual([3]);
    expect(currentPage).toBe(3);
    expect(result.items).toEqual([]);
    expect(result.totalItems).toBe(0);
  });
});
