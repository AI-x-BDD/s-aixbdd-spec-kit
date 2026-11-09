import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

function getTaipeiTodayStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

test.beforeEach(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test.afterAll(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test("US1, US2, US3 pickup/return & 6-state loan tracking + Iterations 1-2 regression + Light/Dark Mode + RWD (360px & 1120px)", async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1120, height: 800 });
  await page.goto("/");

  // 1. Verify Light Mode / Dark Mode toggle
  const themeBtn = page.getByTestId("theme-toggle");
  await expect(themeBtn).toHaveText("深色模式");
  await themeBtn.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeBtn).toHaveText("淺色模式");
  await themeBtn.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");

  // 2. Iteration 1 Regression: Refresh 7-char captcha & reject case mismatch
  const captchaCodeEl = page.getByTestId("captcha-code");
  await expect(captchaCodeEl).toHaveText(/^[A-Za-z0-9]{7}$/);

  await page.getByTestId("refresh-captcha-btn").click();
  await expect(page.getByTestId("login-banner")).toContainText(
    "已更換為新的 7 位數驗證碼",
  );
  const refreshedCode = (await captchaCodeEl.textContent())!.trim();
  expect(refreshedCode).toHaveLength(7);

  await page.getByTestId("quick-fill-lin.yating").click();
  const wrongCaseCode = refreshedCode
    .split("")
    .map((ch) =>
      ch >= "a" && ch <= "z"
        ? ch.toUpperCase()
        : ch >= "A" && ch <= "Z"
          ? ch.toLowerCase()
          : ch,
    )
    .join("");
  await page.locator("#captchaInput").fill(wrongCaseCode);
  await page.getByTestId("login-submit-btn").click();
  await expect(page.getByTestId("login-banner")).toContainText("區分大小寫");

  // 3. US1 & US2: Login as Admin (wu.chenghan), verify pickup rules, register pickup, and register returns (in-window & overdue)
  await page.getByTestId("quick-fill-wu.chenghan").click();
  await page.getByTestId("login-submit-btn").click();
  await expect(page.getByTestId("header-user")).toContainText(
    "吳承翰（管理員）",
  );

  // Filter confirmed (待領取) records
  await page.getByTestId("admin-tab-confirmed").click();
  await expect(page.getByTestId("pickup-hint-RV-20261108-04")).toContainText(
    "非當日預約（限當日領取）",
  );
  await expect(page.getByTestId("pickup-hint-RV-20261108-02")).toContainText(
    "時段已結束未領（逾期不可領取）",
  );

  // Single-click pickup on today's evening confirmed reservation RV-20261108-06
  const pickupBtn06 = page.getByTestId("pickup-btn-RV-20261108-06");
  await expect(pickupBtn06).toBeVisible();
  await pickupBtn06.click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已完成登記領取！預約編號 RV-20261108-06",
  );

  // Filter checked_out (借用中) records and register return on overdue RV-20261107-05
  await page.getByTestId("admin-tab-checked_out").click();
  await expect(page.getByTestId("admin-status-RV-20261107-05")).toContainText(
    "借用中（逾時未還）",
  );
  await page.getByTestId("return-btn-RV-20261107-05").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已完成逾時設備登記歸還！預約編號 RV-20261107-05",
  );

  // Iteration 2 Regression: Approve RV-20261109-08, verify conflict on RV-20261109-09, reject RV-20261109-09 with reason, and toggle EQ-103 approval mode
  await page.getByTestId("approve-btn-RV-20261109-08").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已核准預約申請 RV-20261109-08",
  );

  await page.getByTestId("approve-btn-RV-20261109-09").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "無法核准申請：預約編號 RV-20261109-09",
  );
  await page.getByTestId("reject-btn-RV-20261109-09").click();
  await page
    .getByTestId("reject-reason-input")
    .fill("該時段已核准另一位成員的實驗專案申請，請改選其他可用時段。");
  await page.getByTestId("confirm-reject-submit-btn").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已駁回預約申請 RV-20261109-09",
  );

  await page.getByTestId("toggle-approval-btn-EQ-103").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已更新設備審核設定：EQ-103",
  );
  await expect(page.getByTestId("admin-eq-mode-EQ-103")).toHaveText(
    "需人工審核",
  );

  await page.getByTestId("logout-btn").click();

  // 4. US3: Login as Member Lin Yating, inspect 6-state slot badges on today & active loans highlight section
  await page.getByTestId("quick-fill-lin.yating").click();
  await page.getByTestId("login-submit-btn").click();
  await expect(page.getByTestId("header-user")).toContainText(
    "林雅婷（一般成員）",
  );

  const todayStr = getTaipeiTodayStr();
  await page.getByTestId(`date-chip-${todayStr}`).click();
  await expect(page.getByTestId("slot-EQ-101-AFTERNOON")).toContainText(
    "本人借用中",
  );
  await expect(page.getByTestId("slot-EQ-102-MORNING")).toContainText(
    "本人已歸還",
  );
  await expect(page.getByTestId("slot-EQ-103-EVENING")).toContainText(
    "本人借用中",
  );
  await expect(page.getByTestId("slot-EQ-104-MORNING")).toContainText(
    "已被預約",
  );

  // Verify another member (Chen Guanting) sees Lin's checked_out and returned slots as 已被預約 without exposing borrower identity
  const chenContext = await browser.newContext();
  const chenPage = await chenContext.newPage();
  await chenPage.goto("/");
  await chenPage.getByTestId("quick-fill-chen.guanting").click();
  await chenPage.getByTestId("login-submit-btn").click();
  await chenPage.getByTestId(`date-chip-${todayStr}`).click();
  await expect(chenPage.getByTestId("slot-EQ-101-AFTERNOON")).toContainText(
    "已被預約",
  );
  await expect(chenPage.getByTestId("slot-EQ-102-MORNING")).toContainText(
    "已被預約",
  );
  await chenContext.close();

  // Go to My Reservations: check active loans highlight section, 6-state filter, hidden cancel button on checked_out/returned, and cancel future confirmed reservation
  await page.getByTestId("nav-my-reservations").click();
  await expect(page.getByTestId("active-loans-section")).toBeVisible();
  await expect(page.getByTestId("active-loans-count")).toHaveText(
    "借用中 2 件",
  );
  await expect(
    page.getByTestId("active-loan-item-RV-20261108-03"),
  ).toBeVisible();
  await expect(
    page.getByTestId("active-loan-item-RV-20261108-06"),
  ).toBeVisible();

  await page.getByTestId("filter-tab-checked_out").click();
  await expect(
    page.getByTestId("non-cancel-note-RV-20261108-03"),
  ).toContainText("已領取借用中（不可取消）");
  await expect(page.getByTestId("cancel-btn-RV-20261108-03")).toHaveCount(0);

  await page.getByTestId("filter-tab-returned").click();
  await expect(page.getByTestId("loan-audit-RV-20261108-01")).toContainText(
    "吳承翰",
  );
  await expect(
    page.getByTestId("non-cancel-note-RV-20261108-01"),
  ).toContainText("已完成歸還結案（不可取消）");
  await expect(page.getByTestId("cancel-btn-RV-20261108-01")).toHaveCount(0);

  // Filter confirmed and cancel future reservation RV-20261108-04
  await page.getByTestId("filter-tab-confirmed").click();
  await page.getByTestId("cancel-btn-RV-20261108-04").click();
  await page.getByTestId("confirm-cancel-submit-btn").click();
  await expect(page.getByTestId("my-reservations-banner")).toContainText(
    "已取消已核准／有效預約 RV-20261108-04",
  );

  // Member attempting to view Admin page at 360px viewport is blocked
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByTestId("nav-admin").click();
  await expect(page.getByTestId("admin-forbidden-card")).toBeVisible();
});
