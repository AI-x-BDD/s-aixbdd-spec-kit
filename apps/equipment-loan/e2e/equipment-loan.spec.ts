import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test.afterAll(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test("US1, US2, US3 approval review flow + Iteration 1 regression + Light/Dark Mode + RWD (360px & 1120px)", async ({
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

  // 3. US1: Login as Lin Yating, inspect approval badges & submit pending + direct bookings
  await page.getByTestId("quick-fill-lin.yating").click();
  await page.getByTestId("login-submit-btn").click();

  await expect(page.getByTestId("header-user")).toContainText(
    "林雅婷（一般成員）",
  );
  await expect(page.getByTestId("approval-badge-EQ-101")).toHaveText(
    "需人工審核",
  );
  await expect(page.getByTestId("approval-badge-EQ-102")).toHaveText(
    "需人工審核",
  );
  await expect(page.getByTestId("approval-badge-EQ-103")).toHaveText("免審核");
  await expect(page.getByTestId("approval-badge-EQ-104")).toHaveText("免審核");

  // EQ-101 EVENING already has RV-20261109-08 pending by Lin Yating
  await expect(page.getByTestId("slot-EQ-101-EVENING")).toContainText(
    "本人待審核",
  );

  // Re-apply to EQ-102 AFTERNOON (previously rejected RV-20261109-07, so now available)
  const eq102Afternoon = page.getByTestId("slot-EQ-102-AFTERNOON");
  await expect(eq102Afternoon).toContainText("可預約");
  await eq102Afternoon.click();
  await expect(page.getByTestId("panel-approval-mode")).toContainText(
    "需人工審核",
  );
  await expect(page.getByTestId("submit-booking-btn")).toHaveText(
    "送出待審核申請",
  );
  await page.getByTestId("submit-booking-btn").click();

  await expect(page.getByTestId("booking-banner")).toContainText(
    "待審核申請已送出",
  );
  await expect(page.getByTestId("slot-EQ-102-AFTERNOON")).toContainText(
    "本人待審核",
  );

  // Verify another member (Chen Guanting) still sees EQ-102 AFTERNOON as available (pending does not lock slot)
  const chenContext = await browser.newContext();
  const chenPage = await chenContext.newPage();
  await chenPage.goto("/");
  await chenPage.getByTestId("quick-fill-chen.guanting").click();
  await chenPage.getByTestId("login-submit-btn").click();
  await expect(chenPage.getByTestId("slot-EQ-102-AFTERNOON")).toContainText(
    "可預約",
  );
  await chenPage.getByTestId("slot-EQ-102-AFTERNOON").click();
  await chenPage.getByTestId("submit-booking-btn").click();
  await expect(chenPage.getByTestId("booking-banner")).toContainText(
    "待審核申請已送出",
  );
  await chenContext.close();

  // Direct booking on EQ-103 (免審核) AFTERNOON immediately becomes confirmed
  const eq103Afternoon = page.getByTestId("slot-EQ-103-AFTERNOON");
  await expect(eq103Afternoon).toContainText("可預約");
  await eq103Afternoon.click();
  await expect(page.getByTestId("submit-booking-btn")).toHaveText(
    "確認送出預約",
  );
  await page.getByTestId("submit-booking-btn").click();
  await expect(page.getByTestId("booking-banner")).toContainText("預約已成立");
  await expect(page.getByTestId("slot-EQ-103-AFTERNOON")).toContainText(
    "本人已預約",
  );

  // 4. US1: View My Reservations (verify rejected reason & cancel confirmed reservation)
  await page.getByTestId("nav-my-reservations").click();
  await expect(page.getByTestId("reject-reason-RV-20261109-07")).toContainText(
    "該時段已有實驗室年度高頻校驗排程",
  );

  await page.getByTestId("cancel-btn-RV-20261108-03").click();
  await expect(page.getByTestId("cancel-confirm-modal")).toBeVisible();
  await page.getByTestId("confirm-cancel-submit-btn").click();
  await expect(page.getByTestId("my-reservations-banner")).toContainText(
    "已取消已核准／有效預約 RV-20261108-03",
  );

  // Member attempting to view Admin page is blocked
  await page.getByTestId("nav-admin").click();
  await expect(page.getByTestId("admin-forbidden-card")).toBeVisible();

  // 5. US2 & US3: Switch to Admin at 360px mobile viewport, approve, verify conflict, reject with reason, and toggle equipment approval mode
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByTestId("forbidden-switch-account").click();
  await page.getByTestId("quick-fill-wu.chenghan").click();
  await page.getByTestId("login-submit-btn").click();

  await expect(page.getByTestId("header-user")).toContainText(
    "吳承翰（管理員）",
  );
  await expect(page.getByTestId("admin-pending-section")).toBeVisible();

  // Approve RV-20261109-08 (Lin Yating, EQ-101 EVENING)
  await page.getByTestId("approve-btn-RV-20261109-08").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已核准預約申請 RV-20261109-08",
  );

  // Attempt to approve competing RV-20261109-09 (Chen Guanting, same EQ-101 EVENING slot) -> blocked by conflict
  await page.getByTestId("approve-btn-RV-20261109-09").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "無法核准申請：預約編號 RV-20261109-09",
  );
  await expect(page.getByTestId("pending-row-RV-20261109-09")).toBeVisible();

  // Reject RV-20261109-09 with reason
  await page.getByTestId("reject-btn-RV-20261109-09").click();
  await expect(page.getByTestId("reject-modal")).toBeVisible();
  await page
    .getByTestId("reject-reason-input")
    .fill("該時段已核准另一位成員的實驗專案申請，請改選其他可用時段。");
  await page.getByTestId("confirm-reject-submit-btn").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已駁回預約申請 RV-20261109-09",
  );

  // US3: Toggle EQ-103 from 免審核 to 需人工審核
  await expect(page.getByTestId("admin-eq-mode-EQ-103")).toHaveText("免審核");
  await page.getByTestId("toggle-approval-btn-EQ-103").click();
  await expect(page.getByTestId("admin-banner")).toContainText(
    "已更新設備審核設定：EQ-103",
  );
  await expect(page.getByTestId("admin-eq-mode-EQ-103")).toHaveText(
    "需人工審核",
  );
});
