import { execSync } from "node:child_process";
import { expect, test, type Browser, type Page } from "@playwright/test";

// 迭代 4 改期 E2E（research §5）：成員與管理員各開一個瀏覽器視窗操作。
// 只操作明日以後的時段，結果不受執行當下的時刻影響（避開 Asia/Taipei 午夜換日）。

const BASE_URL = "http://localhost:5183";

function taipeiDate(offsetDays: number): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + offsetDays))
    .toISOString()
    .slice(0, 10);
}

const d1 = taipeiDate(1);
const d2 = taipeiDate(2);
const d3 = taipeiDate(3);

const USERS = {
  lin: { username: "lin.yating", header: "林雅婷（一般成員）" },
  chen: { username: "chen.guanting", header: "陳冠廷（一般成員）" },
  wu: { username: "wu.chenghan", header: "吳承翰（管理員）" },
} as const;

/** 開一個新的瀏覽器視窗並登入；成員停在「設備預約」，管理員停在「審核與借用管理」。 */
async function openWindowAs(
  browser: Browser,
  who: keyof typeof USERS,
): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 1120, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(BASE_URL);
  // 驗證碼載入後才帶入帳號，避免帶入空白驗證碼
  await expect(page.getByTestId("captcha-code")).toHaveText(
    /^[A-Za-z0-9]{7}$/,
    { timeout: 15_000 },
  );
  await page.getByTestId(`quick-fill-${USERS[who].username}`).click();
  await page.getByTestId("login-submit-btn").click();
  await expect(page.getByTestId("header-user")).toContainText(
    USERS[who].header,
  );
  if (who === "wu") {
    // 007：管理員登入後先進入「設備狀態管理」，切換到「審核與借用管理」
    await page.getByTestId("nav-admin").click();
    await expect(page.getByTestId("review-tab-reschedule")).toBeVisible();
  } else {
    await expect(page.getByTestId("submit-booking-btn")).toBeVisible();
  }
  return page;
}

async function openMyReservations(
  page: Page,
  reservationNo: string,
): Promise<void> {
  await page.getByTestId("nav-my-reservations").click();
  await expect(
    page.getByTestId(`reservation-card-${reservationNo}`),
  ).toBeVisible();
}

async function openBookingDate(page: Page, dateStr: string): Promise<void> {
  await page.getByTestId("nav-booking").click();
  await page.getByTestId(`date-chip-${dateStr}`).click();
}

test.beforeEach(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test.afterAll(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test("US1：免審核設備即時改期、原時段釋出，新時段被搶先占用時拒絕改期且原預約不變", async ({
  browser,
}) => {
  const lin = await openWindowAs(browser, "lin");
  const chen = await openWindowAs(browser, "chen");

  // 林雅婷把 EQ-104 的 RV-20261108-05（後天上午）改到後天下午
  await openMyReservations(lin, "RV-20261108-05");
  await lin.getByTestId("reschedule-btn-RV-20261108-05").click();
  const dialog = lin.getByTestId("reschedule-dialog");
  await expect(dialog).toContainText("這台設備免審核");
  await expect(dialog.getByTestId(`reschedule-cell-${d2}-MORNING`)).toHaveText(
    "原時段",
  );
  await expect(
    dialog.getByTestId(`reschedule-cell-${d2}-AFTERNOON`),
  ).toHaveText("可改期");
  await dialog.getByTestId(`reschedule-cell-${d2}-AFTERNOON`).click();
  await dialog.getByTestId("reschedule-submit-btn").click();

  const banner = lin.getByTestId("my-reservations-banner");
  await expect(banner).toContainText(
    `改期成功：預約 RV-20261108-05（EQ-104 微量分光光度計 Thermo NanoDrop One）已改到 ${d2} 下午 13:00–17:00，預約編號與「已核准／有效」狀態不變；原時段 ${d2} 上午 09:00–12:00 已釋出。`,
  );
  const card = lin.getByTestId("reservation-card-RV-20261108-05");
  await expect(card).toContainText("下午 13:00–17:00");
  await expect(card).toContainText("已核准／有效");

  // 陳冠廷看到原時段「可預約」
  await openBookingDate(chen, d2);
  await expect(chen.getByTestId("slot-EQ-104-MORNING")).toContainText("可預約");
  await expect(chen.getByTestId("slot-EQ-104-AFTERNOON")).toContainText(
    "已被預約",
  );

  // 林雅婷選好大後天晚間，送出前陳冠廷先預約同一時段
  await lin.getByTestId("reschedule-btn-RV-20261108-05").click();
  await dialog.getByTestId(`reschedule-cell-${d3}-EVENING`).click();
  await expect(dialog.getByTestId("reschedule-chosen")).toHaveText(
    `${d3} 晚間 18:00–21:00`,
  );

  await chen.getByTestId(`date-chip-${d3}`).click();
  await expect(chen.getByTestId("slot-EQ-104-EVENING")).toContainText("可預約");
  await chen.getByTestId("slot-EQ-104-EVENING").click();
  await chen.getByTestId("submit-booking-btn").click();
  await expect(chen.getByTestId("booking-banner")).toContainText("預約已成立");

  await dialog.getByTestId("reschedule-submit-btn").click();
  const dialogError = dialog.getByTestId("reschedule-dialog-error");
  await expect(dialogError).toContainText(`改期失敗：${d3} 晚間 18:00–21:00`);
  await expect(dialogError).toContainText("沒有任何變更。");
  await expect(dialog.getByTestId(`reschedule-cell-${d3}-EVENING`)).toHaveText(
    "已被預約",
  );
  await dialog.getByTestId("reschedule-close-btn").click();

  await lin.reload();
  await openMyReservations(lin, "RV-20261108-05");
  await expect(card).toContainText(d2);
  await expect(card).toContainText("下午 13:00–17:00");
  await expect(card).toContainText("已核准／有效");
});

test("US2：需人工審核改期送出後對本人顯示「本人改期審核中」、對其他成員顯示「可預約」，管理員核准衝突與核准成功", async ({
  browser,
}) => {
  const chen = await openWindowAs(browser, "chen");
  const lin = await openWindowAs(browser, "lin");
  const wu = await openWindowAs(browser, "wu");

  // 陳冠廷把 EQ-101 的 RV-20261108-07（明日下午）申請改到後天上午
  await openMyReservations(chen, "RV-20261108-07");
  await chen.getByTestId("reschedule-btn-RV-20261108-07").click();
  const dialog = chen.getByTestId("reschedule-dialog");
  await expect(dialog.getByTestId("reschedule-notice")).toContainText(
    "這台設備需人工審核：送出後建立「改期審核中」的申請。",
  );
  await dialog.getByTestId(`reschedule-cell-${d2}-MORNING`).click();
  await dialog.getByTestId("reschedule-submit-btn").click();

  const banner = chen.getByTestId("my-reservations-banner");
  await expect(banner).toContainText("已送出，目前為「改期審核中」");
  const requestNo = ((await banner.textContent()) ?? "").match(
    /RR-\d{8}-[0-9A-F]{6}/,
  )?.[0];
  expect(requestNo).toBeTruthy();
  const card = chen.getByTestId("reservation-card-RV-20261108-07");
  await expect(card).toContainText(d1);
  await expect(card).toContainText("下午 13:00–17:00");
  await expect(card).toContainText("已核准／有效");

  // 「設備預約」：本人看到「本人改期審核中」，其他成員看到「可預約」且不揭露申請
  await openBookingDate(chen, d2);
  await expect(chen.getByTestId("slot-EQ-101-MORNING")).toContainText(
    "本人改期審核中",
  );
  await openBookingDate(lin, d2);
  await expect(lin.getByTestId("slot-EQ-101-MORNING")).toContainText("可預約");
  await expect(lin.getByTestId("slot-EQ-101-MORNING")).not.toContainText("RR-");

  // 管理員：核准新時段已被占用的 demo seed 申請（RV-20261108-11 → RV-20261109-12 占用）被拒
  await wu.reload();
  // 007：重新整理後回到「設備狀態管理」，再切換到「審核與借用管理」
  await wu.getByTestId("nav-admin").click();
  await expect(wu.getByTestId(`rr-item-${requestNo}`)).toContainText(
    "改期申請",
  );
  const conflictItem = wu.locator('[data-testid^="rr-item-"]', {
    hasText: "RV-20261108-11",
  });
  const conflictNo = (
    (await conflictItem.getAttribute("data-testid")) ?? ""
  ).replace("rr-item-", "");
  await wu.getByTestId(`rr-approve-btn-${conflictNo}`).click();
  const adminBanner = wu.getByTestId("admin-banner");
  await expect(adminBanner).toContainText(`無法核准改期申請 ${conflictNo}`);
  await expect(adminBanner).toContainText("已被預約 RV-20261109-12 占用");
  await expect(wu.getByTestId(`rr-item-${conflictNo}`)).toBeVisible();

  // 管理員核准陳冠廷的申請 → 預約改到後天上午，原時段釋出
  await wu.getByTestId(`rr-approve-btn-${requestNo}`).click();
  await expect(adminBanner).toContainText(`已核准改期申請 ${requestNo}`);
  await expect(adminBanner).toContainText(`已改到 ${d2} 上午 09:00–12:00`);
  await expect(wu.getByTestId(`rr-item-${requestNo}`)).toHaveCount(0);

  await chen.reload();
  await openMyReservations(chen, "RV-20261108-07");
  await expect(card).toContainText(d2);
  await expect(card).toContainText("上午 09:00–12:00");
  await expect(card).toContainText("已核准／有效");

  await openBookingDate(lin, d1);
  await expect(lin.getByTestId("slot-EQ-101-AFTERNOON")).toContainText(
    "可預約",
  );
});

test("US3：成員撤回改期審核中的申請，變成「改期已撤回」、原預約不變並移出管理員待審清單", async ({
  browser,
}) => {
  const lin = await openWindowAs(browser, "lin");
  const wu = await openWindowAs(browser, "wu");

  // demo seed：林雅婷 RV-20261108-04（EQ-101 明日上午）有一筆改到後天晚間的改期審核中申請
  await openBookingDate(lin, d2);
  await expect(lin.getByTestId("slot-EQ-101-EVENING")).toContainText(
    "本人改期審核中",
  );

  await openMyReservations(lin, "RV-20261108-04");
  const card = lin.getByTestId("reservation-card-RV-20261108-04");
  const withdrawBtn = card.locator('[data-testid^="withdraw-btn-"]');
  const requestNo = (
    (await withdrawBtn.getAttribute("data-testid")) ?? ""
  ).replace("withdraw-btn-", "");
  expect(requestNo).toMatch(/^RR-\d{8}-[0-9A-F]{6}$/);
  await expect(wu.getByTestId(`rr-item-${requestNo}`)).toBeVisible();

  await withdrawBtn.click();
  await expect(lin.getByTestId("withdraw-confirm-modal")).toContainText(
    `改期申請：${requestNo}`,
  );
  await lin.getByTestId("confirm-withdraw-submit-btn").click();
  await expect(lin.getByTestId("my-reservations-banner")).toContainText(
    `已撤回改期申請 ${requestNo}。預約 RV-20261108-04 仍為 ${d1} 上午 09:00–12:00 的「已核准／有效」。`,
  );
  await expect(lin.getByTestId(`reschedule-status-${requestNo}`)).toContainText(
    "改期已撤回",
  );
  await expect(card).toContainText(d1);
  await expect(card).toContainText("已核准／有效");

  await wu.reload();
  // 007：重新整理後回到「設備狀態管理」，再切換到「審核與借用管理」
  await wu.getByTestId("nav-admin").click();
  await expect(wu.getByTestId("review-tab-reschedule")).toBeVisible();
  await expect(wu.getByTestId(`rr-item-${requestNo}`)).toHaveCount(0);

  await openBookingDate(lin, d2);
  await expect(lin.getByTestId("slot-EQ-101-EVENING")).not.toContainText(
    "本人改期審核中",
  );
});
