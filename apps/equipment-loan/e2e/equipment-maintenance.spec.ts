import { execSync } from "node:child_process";
import {
  expect,
  request as pwRequest,
  test,
  type Browser,
  type Page,
} from "@playwright/test";

// 迭代 5 設備送修與停用 E2E（research §5、SC-001、SC-004）：管理員與成員各開一個瀏覽器視窗操作 demo seed 的 EQ-104（免審核）。
// 確認視窗的數量以同一時刻的預覽 API 為準；今日時段是否已結束會改變數量，所以不寫死。
// 成員重新預約只操作三天後的時段，結果不受執行當下的時刻影響。

const BASE_URL = "http://localhost:5183";
const API = "http://localhost:3000/api";
const EQ104 = "22222222-2222-4222-8222-222222222104";
const EQ104_NAME = "EQ-104 微量分光光度計 Thermo NanoDrop One";
// demo seed：林雅婷在 EQ-104 後天上午的已核准／有效預約
const LIN_EQ104_RESERVATION = "RV-20261108-05";

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

const USERS = {
  lin: { username: "lin.yating", header: "林雅婷（一般成員）" },
  wu: { username: "wu.chenghan", header: "吳承翰（管理員）" },
} as const;

/** 開一個新的瀏覽器視窗並登入；管理員停在「設備狀態管理」，成員停在「設備預約」。 */
async function openWindowAs(
  browser: Browser,
  who: keyof typeof USERS,
): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 1120, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(BASE_URL);
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
    await expect(page.getByTestId("equipment-status-table")).toBeVisible();
  } else {
    await expect(page.getByTestId("submit-booking-btn")).toBeVisible();
  }
  return page;
}

/** 以 API 取得與確認視窗相同的預覽數量。 */
async function previewCounts(
  targetStatus: "maintenance" | "retired",
): Promise<{ cancelCount: number; expireCount: number }> {
  const ctx = await pwRequest.newContext();
  const cap = await (
    await ctx.post(`${API}/auth/captcha`, { data: {} })
  ).json();
  const login = await ctx.post(`${API}/auth/login`, {
    data: {
      username: USERS.wu.username,
      password: "Admin@2026",
      challengeId: cap.challengeId,
      captchaCode: cap.captchaCode,
    },
  });
  const { token } = await login.json();
  const res = await ctx.get(
    `${API}/admin/equipments/${EQ104}/status-change-preview?targetStatus=${targetStatus}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  expect(res.status()).toBe(200);
  const body = await res.json();
  await ctx.dispose();
  return { cancelCount: body.cancelCount, expireCount: body.expireCount };
}

/** 重新進入「設備預約」頁，讓清單重新載入。 */
async function reopenBooking(page: Page): Promise<void> {
  await page.getByTestId("nav-my-reservations").click();
  await page.getByTestId("nav-booking").click();
  await expect(page.getByTestId("booking-equipment-count")).toBeVisible();
}

test.beforeAll(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test.afterAll(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test("管理員設為送修、成員看到送修中與取消原因、停用設備從清單消失、恢復可用後成員重新預約", async ({
  browser,
}) => {
  const admin = await openWindowAs(browser, "wu");
  const member = await openWindowAs(browser, "lin");

  // 1. 管理員設為送修：確認視窗顯示將取消的預約數與將失效的改期申請數
  const maintenance = await previewCounts("maintenance");
  expect(maintenance.cancelCount).toBeGreaterThanOrEqual(2);
  await admin.getByTestId("eq-set-maintenance-btn-EQ-104").click();
  await expect(admin.getByTestId("equipment-status-dialog")).toContainText(
    `設為送修：${EQ104_NAME}`,
  );
  await expect(admin.getByTestId("equipment-status-impact")).toHaveText(
    `將取消 ${maintenance.cancelCount} 筆預約、${maintenance.expireCount} 筆改期申請將失效`,
  );
  await admin.getByTestId("equipment-status-confirm-btn").click();
  await expect(admin.getByTestId("admin-banner")).toContainText(
    `已將 ${EQ104_NAME} 設為「送修中」，取消 ${maintenance.cancelCount} 筆預約`,
  );
  await expect(admin.getByTestId("admin-eq-status-EQ-104")).toHaveText(
    "送修中",
  );

  // 2. 成員看到「送修中」，「我的預約」顯示取消原因「設備送修」
  await reopenBooking(member);
  await expect(member.getByTestId("equipment-card-EQ-104")).toContainText(
    "送修中",
  );
  await expect(member.getByTestId("maintenance-notice-EQ-104")).toContainText(
    "設備送修中，暫停預約",
  );
  await member.getByTestId("nav-my-reservations").click();
  await expect(
    member.getByTestId(`status-badge-${LIN_EQ104_RESERVATION}`),
  ).toHaveText("已取消");
  await expect(
    member.getByTestId(`cancel-reason-${LIN_EQ104_RESERVATION}`),
  ).toContainText("取消原因：設備送修");

  // 3. 管理員把送修中的設備改為停用，成員的設備清單不再出現這台設備
  const retired = await previewCounts("retired");
  expect(retired).toEqual({ cancelCount: 0, expireCount: 0 });
  await admin.getByTestId("eq-set-retired-btn-EQ-104").click();
  await expect(admin.getByTestId("equipment-status-impact")).toHaveText(
    "將取消 0 筆預約、0 筆改期申請將失效",
  );
  await admin.getByTestId("equipment-status-confirm-btn").click();
  await expect(admin.getByTestId("admin-eq-status-EQ-104")).toHaveText("停用");
  await reopenBooking(member);
  await expect(member.getByTestId("equipment-card-EQ-104")).toHaveCount(0);
  await expect(member.getByTestId("equipment-card-EQ-103")).toBeVisible();

  // 4. 管理員恢復可用（不開確認視窗）；被取消的預約不會復原
  await admin.getByTestId("eq-restore-btn-EQ-104").click();
  await expect(admin.getByTestId("equipment-status-dialog")).toHaveCount(0);
  await expect(admin.getByTestId("admin-banner")).toContainText(
    "停用時取消的預約不會自動復原。",
  );
  await expect(admin.getByTestId("admin-eq-status-EQ-104")).toHaveText("可用");

  // 5. 成員重新預約這台設備三天後的上午（免審核 → 已核准／有效）
  const d3 = taipeiDate(3);
  await reopenBooking(member);
  await member.getByTestId(`date-chip-${d3}`).click();
  const slot = member.getByTestId("slot-EQ-104-MORNING");
  await expect(slot).toBeEnabled();
  await expect(slot).toContainText("可預約");
  await slot.click();
  await member.getByTestId("submit-booking-btn").click();
  await expect(member.getByTestId("booking-banner")).toContainText(
    "預約已成立！",
  );
  await expect(member.getByTestId("booking-banner")).toContainText(
    `${d3} 上午`,
  );
  await expect(member.getByTestId("booking-banner")).toContainText(
    "狀態為「已核准／有效」",
  );

  await member.getByTestId("nav-my-reservations").click();
  await expect(
    member.getByTestId(`status-badge-${LIN_EQ104_RESERVATION}`),
  ).toHaveText("已取消");

  await admin.context().close();
  await member.context().close();
});
