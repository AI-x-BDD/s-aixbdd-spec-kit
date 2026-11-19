# 錯誤修正：逾期通知紀錄頁按「重新整理」時畫面抖動

- **代號**：refresh-jitter
- **修正日期**：2026-11-19
- **評估報告**：./assessment.md
- **狀態**：已套用

## 摘要

依使用者核准的首選修法第 1～4 項修改：重新整理期間，「逾期通知紀錄」頁的版面尺寸不變，只改變可見性、透明度和文字。載入提示列一直掛在畫面上並預留高度，只切換可見；「重新整理」「立即檢查逾期」按鈕寬度固定為兩段文字中較寬的一段；空狀態在重新整理期間保留，只變淡；雛形 `ui/overdue-notifications.html` 同步修改。I1、I2 要改變已同意的意圖，轉回 `ui-plan`，這次沒有修改。

## 實作計畫

1. 修法 1：載入提示列常駐並預留高度，修改 `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx`。
2. 修法 2：「重新整理」「立即檢查逾期」按鈕寬度固定，修改 `OverdueNotificationsView.tsx`（含同檔 CSS）。
3. 修法 3：空狀態在重新整理期間保留，修改 `OverdueNotificationsView.tsx`。
4. 修法 4：雛形同步，修改 `specs/008-overdue-discord-notification/ui/overdue-notifications.html`；並新增 `apps/equipment-loan/e2e/overdue-notifications-refresh.spec.ts` 作為要補的測試。

## 執行的修法

| 修法項目 | 結果 | 說明 |
|---|---|---|
| 1 載入提示列常駐並預留高度 | 完成 | 提示列一直掛在 DOM 上，平時 `visibility: hidden`，`refreshing` 時顯示，加 `role="status"` |
| 2 按鈕寬度固定 | 完成 | 「重新整理」「立即檢查逾期」的兩段文字疊在同一格，寬度取較寬的一段 |
| 3 空狀態在重新整理期間保留 | 完成 | `showEmptyAll`、`showEmptyFilter` 改成不看 `loading`，載入期間只加淡化 class |
| 4 雛形同步 | 完成 | `ui/overdue-notifications.html` 同步第 1～3 項 |

## 未執行的項目

| 項目 | 原因 |
|---|---|
| I1 頁頂橫幅改成載入完成後才清除 | 要改變 `ui/plan.md` §4「重新整理中」已同意的意圖，轉回 SDD 流程，由 `ui-plan` 處理；橫幅清除時機維持原狀 |
| I2 `ui/plan.md` 補寫版面不位移 | 要修改 `ui/plan.md`，轉回 SDD 流程，由 `ui-plan` 處理 |

## 修改的檔案

| 檔案 | 動作 | 對應修法項目 | 說明 |
|---|---|---|---|
| `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx` | 修改 | 1、2、3 | 載入提示列常駐；新增 `StableLabel` 固定按鈕寬度；空狀態改依 `loaded` 和新增的 `loadedFilter` 判斷，載入期間加 `odn-refreshing` 淡化；同檔 CSS 補對應樣式 |
| `apps/equipment-loan/e2e/overdue-notifications-refresh.spec.ts` | 新增 | 要補的測試 | 攔住清單 API，比對重新整理前、中、後的版面座標；桌面 1120px 和 360px 各跑一次 |
| `specs/008-overdue-discord-notification/ui/overdue-notifications.html` | 修改 | 4 | 雛形同步：`#refresh-line` 改用 `.is-idle` 切換可見；按鈕改用 `.stable-label`；空狀態在載入期間加 `.is-refreshing` 淡化 |

## 重點差異

載入提示列不再依 `refreshing` 掛上或移除，改成一直掛著、只切換可見：

```tsx
<div
  className={`odn-refresh-line${refreshing ? "" : " odn-refresh-line-idle"}`}
  role="status"
  data-testid="overdue-refreshing"
>
```

按鈕兩段文字疊在同一格，另一段文字用 CSS 產生內容撐寬；產生內容不算在 `textContent` 和無障礙名稱裡：

```css
.odn-stable-label { display: inline-grid; justify-items: center; }
.odn-stable-label > span, .odn-stable-label::after { grid-area: 1 / 1; }
.odn-stable-label::after { content: attr(data-sizer); visibility: hidden; }
```

空狀態改成不看 `loading`，依目前資料所屬的篩選判斷：

```tsx
const loadedHasFilter = loadedFilter !== "all";
const showEmptyAll = loaded && !loadError && items.length === 0 && !loadedHasFilter;
const showEmptyFilter = loaded && !loadError && items.length === 0 && loadedHasFilter;
```

## 新增或修改的測試

- `e2e/overdue-notifications-refresh.spec.ts`「有通知時，清單與按鈕在重新整理前、中、後位置相同」（桌面表格、360px 卡片版面）：比對「立即檢查逾期」「重新整理」按鈕、`overdue-count`、`overdue-notifications-table` 的 x、y、寬、高，三個時間點相差都不超過 1px；用可見性判斷載入提示，不看它是否存在。
- `e2e/overdue-notifications-refresh.spec.ts`「篩選結果為空時，空狀態在重新整理期間保留且不位移」（兩種寬度）：篩選「送出中」後重新整理，載入期間 `overdue-empty-filter` 仍可見，位置和尺寸不變。
- `frontend/tests/unit/overdueNotificationsPaging.test.ts`（T041）：沒有修改，重跑通過。

## 本機驗證

**執行的命令與結果**：

- `npm run check`：通過（後端、前端 `tsc`、`eslint`、`prettier --check` 都通過）。
- `npm run test:frontend`：2 個檔案、6 項測試通過（含 T041 的 `overdueNotificationsPaging.test.ts`）。
- `npx playwright test e2e/overdue-notifications-refresh.spec.ts`：4 項通過（Prettier 格式化前後各跑一次）。
- `npm run test:e2e`（評估報告核准執行的命令，會把本機資料庫重設成 demo seed）：9 項中 8 項通過，1 項失敗：`e2e/equipment-loan.spec.ts:21`，在 `pickup-hint-RV-20261108-02` 等不到「時段已結束未領（逾期不可領取）」。

**和本次修改無關的失敗**：

- 上面的失敗測領取規則，這次沒有修改後端，也沒有修改領取頁。demo seed 的 `RV-20261108-02` 是今天上午 09:00–12:00 的時段，執行時是台北時間 09:41 左右，時段還沒結束，所以「已結束」的判斷不成立。這是測試取決於執行時刻的既有問題，記錄不修。

**沒有執行的驗證**：

- `npm run test:backend`：評估報告只核准 `npm run test:e2e`，這個命令沒有被核准，沒有執行。
- 沒有確認新 e2e 在修正前的程式上會失敗：暫時還原 view 檔的命令需要權限，沒有執行。留給 `bug-test`。
- 雛形沒有在瀏覽器裡驗證：量測雛形座標的暫存腳本在專案外，需要權限，沒有執行；雛形的修改只檢查過程式碼。留給 `bug-test`。

## 偏離評估

| # | 等級 | 內容 | 理由 | 處理 |
|---|---|---|---|---|
| 1 | 補充 | 新增 `loadedFilter` 狀態，空狀態和標題依「目前資料所屬的篩選」判斷 | 評估報告只寫「依 `items.length` 判斷，不看 `loading`」；只拿掉 `!loading`、仍用下拉選單的 `filter` 時，從「送出中」（空）切回「全部」的載入期間，`items` 還是空的但 `filter` 已是 `all`，畫面會先錯誤顯示「目前沒有逾期通知」。這是完成第 3 項必須加入的細節，仍在列出的檔案內，沒有動 `fetchPageWithinRange` 和 `load()` 的頁碼邏輯 | 記錄後繼續 |

## 後續事項

- 執行 `bug-test`：在修正前的程式上跑新 e2e，確認它會失敗；在瀏覽器裡實際操作雛形。
- I1（橫幅清除時機）、I2（`ui/plan.md` 補寫版面不位移）交給 `ui-plan`；I1 完成前，橫幅清除造成的上移仍會發生，驗證時不要把它當成這次修正失敗。
- `tests/integration/api.test.ts` 的 SC-001 和 `e2e/equipment-loan.spec.ts` 依賴執行時刻，另外處理（`docs/待確認.md` 第 33 項）。
