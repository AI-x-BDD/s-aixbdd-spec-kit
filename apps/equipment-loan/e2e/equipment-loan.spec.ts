import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test.afterAll(() => {
  execSync("npm --prefix backend run db:seed", { stdio: "inherit" });
});

test("US1, US2, US3 end-to-end flow + Light/Dark Mode + RWD (360px & 1120px)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1120, height: 800 });
  await page.goto("/");

  // Verify Light Mode / Dark Mode toggle
  const themeBtn = page.getByTestId("theme-toggle");
  await expect(themeBtn).toHaveText("深色模式");
  await themeBtn.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeBtn).toHaveText("淺色模式");
  await themeBtn.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");

  // US1 Scenario 2 & 3: Refresh 7-char captcha & reject case mismatch
  const captchaCodeEl = page.getByTestId("captcha-code");
  await expect(captchaCodeEl).toHaveText(/^[A-Za-z0-9]{7}$/);

  await page.getByTestId("refresh-captcha-btn").click();
  await expect(page.getByTestId("login-banner")).toContainText(
    "已更換為新的 7 位數驗證碼",
  );
  const refreshedCode = (await captchaCodeEl.textContent())!.trim();
  expect(refreshedCode).toHaveLength(7);

  // Fill member account and invert captcha letter case
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

  // US1 Scenario 1: Valid member login
  await page.getByTestId("quick-fill-lin.yating").click();
  await page.getByTestId("login-submit-btn").click();

  await expect(page.getByTestId("header-user")).toContainText(
    "林雅婷（一般成員）",
  );
  await expect(page.getByTestId("equipment-card-EQ-101")).toBeVisible();

  // US1 Scenario 4 & 5: Book an available slot (EQ-101 EVENING) and reload page to verify session & persistence
  const eveningSlotBtn = page.getByTestId("slot-EQ-101-EVENING");
  await expect(eveningSlotBtn).toContainText("可預約");
  await eveningSlotBtn.click();
  await page.getByTestId("submit-booking-btn").click();

  await expect(page.getByTestId("booking-banner")).toContainText("預約已成立");
  await expect(page.getByTestId("slot-EQ-101-EVENING")).toContainText(
    "本人已預約",
  );

  await page.reload();
  await expect(page.getByTestId("header-user")).toContainText(
    "林雅婷（一般成員）",
  );
  await expect(page.getByTestId("slot-EQ-101-EVENING")).toContainText(
    "本人已預約",
  );

  // US2: View My Reservations and cancel RV-20261108-03 (EQ-101 MORNING), verify slot released
  await page.getByTestId("nav-my-reservations").click();
  await expect(
    page.getByTestId("reservation-card-RV-20261108-03"),
  ).toBeVisible();
  await page.getByTestId("cancel-btn-RV-20261108-03").click();
  await expect(page.getByTestId("cancel-confirm-modal")).toBeVisible();
  await page.getByTestId("confirm-cancel-submit-btn").click();

  await expect(page.getByTestId("my-reservations-banner")).toContainText(
    "已取消預約 RV-20261108-03",
  );
  await expect(
    page.getByTestId("reservation-card-RV-20261108-03"),
  ).toContainText("已取消");

  // Return to booking view and verify EQ-101 MORNING is now available again
  await page.getByTestId("banner-go-booking").click();
  await expect(page.getByTestId("slot-EQ-101-MORNING")).toContainText("可預約");

  // US3 Scenario 2: Member attempting to view Admin Overview is blocked
  await page.getByTestId("nav-admin").click();
  await expect(page.getByTestId("admin-forbidden-card")).toBeVisible();

  // Logout and login as Admin (US3 Scenario 1) at 360px mobile viewport
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByTestId("forbidden-switch-account").click();
  await page.getByTestId("quick-fill-wu.chenghan").click();
  await page.getByTestId("login-submit-btn").click();

  await expect(page.getByTestId("header-user")).toContainText(
    "吳承翰（管理員）",
  );
  await expect(page.getByTestId("admin-eq-card-EQ-101")).toBeVisible();
  await expect(page.getByTestId("admin-reservations-table")).toBeVisible();
  await expect(page.getByTestId("admin-row-RV-20261108-04")).toContainText(
    "陳冠廷",
  );
});
