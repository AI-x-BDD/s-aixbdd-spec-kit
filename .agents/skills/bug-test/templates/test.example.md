# 錯誤實測：逾期通知紀錄頁按「重新整理」時畫面抖動

- **代號**：refresh-jitter
- **實測日期**：2026-11-19
- **模式**：修正後實測
- **評估報告**：./assessment.md
- **修正報告**：./fix.md
- **結果**：待使用者驗證

## 摘要

修正前的程式在瀏覽器重現了評估報告重現步驟 3、5 的位移和空狀態消失。修正後，「完整預期行為」E1～E4 在 1120px 和 360px 都通過。新 e2e 在修正前 4 項全部失敗、修正後 4 項全部通過，證明它抓得到這個錯誤。雛形的量測結果和實作相同。回歸檢查有 2 項失敗，修正前同樣失敗，和本次修正無關。頁頂橫幅清除造成的上移（I1）仍會發生，它已轉回 `ui-plan`，不算這次修正失敗。請依「使用者驗證」實際操作後回覆結果。

## 實測環境

- 修正前版本：`fix.md` 修改的檔案還沒有 commit，所以用 `git worktree add /tmp/refresh-jitter-before HEAD` 取出 HEAD。worktree 的 `apps/equipment-loan/node_modules` 和 `apps/equipment-loan/frontend/node_modules` 用符號連結指向工作目錄，沒有重新安裝。測完執行 `git worktree remove /tmp/refresh-jitter-before`。
- 修正後版本：工作目錄，包含 `fix.md` 列出的未 commit 修改。
- 服務：後端 `:3000` 依 `apps/equipment-loan/.env` 啟動。前端 `:5183` 先啟動修正前版本，量完後停止，再啟動修正後版本。測完停止本次啟動的前端和後端。沒有執行重設或匯入資料的命令。
- 瀏覽器：Chromium（Playwright），寬度 1120px 和 360px。
- 量測腳本：`repro-measure.mjs` 量實作，`proto-measure.mjs` 量雛形，都放在本目錄。腳本用 `--app apps/equipment-loan` 找到 Playwright，不寫死絕對路徑。

## 完整預期行為實測

依評估報告「完整預期行為」的量測方式和通過標準執行。兩種寬度都通過，才算通過。

| # | 預期行為 | 修正前 | 修正後 | 結果 |
|---|---|---|---|---|
| E1 | 有反應 | 通過：點擊後 100ms 內，按鈕為「重新整理中…」且停用，載入提示列可見 | 通過：點擊後 100ms 內，按鈕為「重新整理中…」且停用，載入提示列從隱藏變成可見 | 通過 |
| E2 | 不位移 | 不通過：載入中清單下移 28px（360px 為 68px），「立即檢查逾期」左移 26px（360px 為 96px）；篩選為空時 `overdue-empty-filter` 在載入中消失 | 通過：兩種寬度 × 有通知、篩選為空，共 4 種情境；載入前到載入中、載入前到載入後，x、y、寬、高相差都不超過 1px | 通過 |
| E3 | 不閃爍 | 不通過：篩選為空時，不延遲和延遲 2 秒兩種情況，`overdue-empty-filter` 都出現「可見 → 不可見 → 可見」 | 通過：兩種延遲下，清單、空狀態、`overdue-count` 都沒有消失再出現 | 通過 |
| E4 | 看得出完成 | 通過：回應送出後 500ms 內，按鈕恢復「重新整理」且可按，載入提示列移除，清單不透明度為 1，`overdue-count` 從「共 3 則通知」變成「共 4 則通知」 | 通過：回應送出後 500ms 內，按鈕恢復「重新整理」且可按，載入提示列不可見，清單不透明度為 1，`overdue-count` 變成「共 4 則通知」 | 通過 |

## 檢查紀錄

命令在 `apps/equipment-loan` 執行，另有註明的除外。

| 檢查 | 命令或操作 | 版本 | 結果 | 說明 |
|---|---|---|---|---|
| 重現步驟 1～3、5 | `node ../../specs/bugs/refresh-jitter/repro-measure.mjs --app . --base-url http://localhost:5183` | 修正前 | 不通過（成功重現） | E2、E3 不通過，數值見「完整預期行為實測」 |
| 重現步驟 1～3、5 | 同上 | 修正後 | 通過 | E1～E4 都通過 |
| 重現步驟 4（I1，頁頂橫幅） | `node ../../specs/bugs/refresh-jitter/proto-measure.mjs --app . --file ../../specs/008-overdue-discord-notification/ui/overdue-notifications.html --state resent` | 修正後 | 仍會發生（轉回項目） | 卡片上移 66px（360px 為 111px），只移一次，不會彈回。I1 轉回 `ui-plan`，不列入結果判定 |
| 新 e2e | `npx playwright test e2e/overdue-notifications-refresh.spec.ts` | 修正前 | 不通過（符合預期） | 4 failed：有通知的兩項在「立即檢查逾期」的 x 座標失敗，篩選為空的兩項找不到 `overdue-empty-filter` |
| 新 e2e | 同上 | 修正後 | 通過 | 4 passed (6.7s) |
| 雛形 | `node ../../specs/bugs/refresh-jitter/proto-measure.mjs --app . --file /tmp/refresh-jitter-before/specs/008-overdue-discord-notification/ui/overdue-notifications.html` | 修正前 | 不通過（符合預期） | 和實作相同的位移：下移 29px（360px 為 68px），按鈕左移，360px 版面按鈕列換行 |
| 雛形 | `node ../../specs/bugs/refresh-jitter/proto-measure.mjs --app . --file ../../specs/008-overdue-discord-notification/ui/overdue-notifications.html` | 修正後 | 通過 | `list`、`filter-empty` 兩種狀態 × 兩種寬度，重新整理期間 0 位移，按鈕文字切換正確 |
| 前端單元測試（含 T041） | `npm run test:frontend` | 修正後 | 通過 | 2 個檔案、6 項測試 |
| 型別檢查、lint、格式 | `npm run check` | 修正後 | 通過 | 後端、前端的 `tsc`、`eslint`、`prettier --check` 都通過 |
| 新 e2e 檔格式 | `npm --prefix frontend exec -- prettier --check e2e/overdue-notifications-refresh.spec.ts` | 修正後 | 通過 | `frontend` 的 check 不涵蓋 `e2e/`，所以另外檢查 |
| 後端測試 | `npm run test:backend` | 修正後 | 不通過（既有、無關） | 76 項中 75 項通過。`api.test.ts` SC-001 `expected 200 to be 400`，和 `fix.md` 記錄的相同。本次修正沒有修改後端 |
| 完整 e2e | `npm run test:e2e` | 修正後 | 不通過（既有、無關） | 9 項中 8 項通過。`equipment-loan.spec.ts:21` 的 `pickup-hint-RV-20261108-02` 等不到「時段已結束未領（逾期不可領取）」 |
| 完整 e2e 失敗項 | `npx playwright test e2e/equipment-loan.spec.ts` | 修正前 | 不通過（同樣失敗） | 修正前同樣失敗，不是本次修正造成的回歸 |

## 輸出摘錄

修正前的實作，載入前到載入中（載入後全部為空，代表內容彈回原位）：

```
desktop-1120/with-items   overdue-check-btn dx=-26 | overdue-refresh-btn dx=-26 dw=26 | overdue-count dy=28 | overdue-notifications-table dy=29
desktop-1120/empty-filter overdue-empty-filter present -> absent
card-360/with-items       overdue-check-btn dx=-96 dy=40 | overdue-count dy=68 | overdue-notifications-table dy=68
card-360/empty-filter     overdue-empty-filter present -> absent
```

修正後的實作：4 種情境的載入前到載入中、載入前到載入後都是 `{}`。

新 e2e 在修正前的程式上：

```
Error: 重新整理中：overdue-check-btn 的 x 不應改變（893 → 867）     # 桌面
Error: 重新整理中：overdue-check-btn 的 x 不應改變（133 → 37）      # 360px
Locator: getByTestId('overdue-empty-filter')  Error: element(s) not found
4 failed
```

回歸檢查的既有失敗：

```
test:backend  Tests  1 failed | 75 passed (76)   AssertionError: expected 200 to be 400   (SC-001)
test:e2e      1 failed / 8 passed   Locator: getByTestId('pickup-hint-RV-20261108-02')  Expected substring: "時段已結束未領（逾期不可領取）"
```

實測時間約台北 09:46。demo seed 的 `RV-20261108-02` 時段是 09:00–12:00，還沒有結束。

## 剩餘風險

- 頁頂橫幅清除造成的上移（I1）仍會發生，要等 `ui-plan` 修改 `ui/plan.md` §4 後，再走 `tasks` → `implement`。
- 換頁中（`paging`）沒有在實作上量測：demo seed 只有 3 則通知，不會分頁。換頁和重新整理共用同一條載入提示列，程式路徑相同。
- 「目前沒有逾期通知」（`overdue-empty-all`）空狀態沒有在實作上量測：demo seed 有通知。修正對它和 `overdue-empty-filter` 的處理方式相同。
- 平時清單上方多約 28px 空白，這是 `fix.md` 已知的取捨，沒有另外做視覺審查。
- 只在 Chromium 上測試，沒有測 Firefox、Safari，也沒有用螢幕閱讀器確認 `role="status"` 的朗讀效果。

## 使用者驗證

`bug-test` 不代替你宣稱已驗證。請在瀏覽器依下列項目操作，回覆每一項的結果；回覆後由 `bug-test` 記錄。

- 驗證日期：待使用者驗證

| # | 驗證項目 | 操作 | 通過標準 | 你的結果 |
|---|---|---|---|---|
| U1 | 重新整理時清單和按鈕不跳動（E1、E2、E4） | 以管理員開啟「逾期通知紀錄」頁，視窗寬度約 1120px，按「重新整理」3 次 | 按下後立即顯示「重新整理中…」；清單、筆數和「立即檢查逾期」都不上下、左右移動；結束後按鈕恢復「重新整理」 | 待使用者驗證 |
| U2 | 篩選為空時不閃爍（E3） | 篩選選「送出中」，出現「沒有符合篩選的通知」後按「重新整理」 | 空狀態一直顯示，只變淡，不消失再出現 | 待使用者驗證 |
| U3 | 窄螢幕不跳動（E2） | 把視窗縮到約 360px，重複 U1 | 按鈕列不換行，清單不上下移動 | 待使用者驗證 |
| U4 | 原本看到的抖動已消失 | 對照 U1～U3 和你原本回報的現象 | 原本的抖動不再出現；頁頂橫幅消失造成的上移屬於 I1，另外處理 | 待使用者驗證 |

## 後續事項

- 依「使用者驗證」實際操作後回覆結果。`bug-test` 會把結果寫入該段，結果改成「使用者已驗證（日期）」或「使用者驗證未通過」。
- 使用者驗證未通過時，以本報告為新證據，重新執行 `bug-assess`。
- I1（橫幅清除時機）、I2（`ui/plan.md` 補寫版面不位移）交給 `ui-plan`。
- SC-001 和 `equipment-loan.spec.ts:21` 取決於執行時刻，另外處理（`docs/待確認.md` 第 33 項）。
