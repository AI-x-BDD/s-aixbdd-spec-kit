# 錯誤評估：領取借用的回歸測試只在台北 12:00–21:00 通過

- **代號**：pickup-test-time-dependent
- **建立日期**：2026-11-19
- **來源**：`docs/待確認.md` 第 33 項（使用者依 `docs/dev/spec-kit-1.4.2-調整計畫.md` 批 1 第 5 點指定）；重新評估的新證據為 `bug-test` 實測報告 `./test.md`（結果「失敗」）
- **判定**：成立
- **嚴重度**：medium
- **核准狀態**：已核准（2026-11-19，核准首選修法第 6～8 項）

## 回報內容

> 錯誤回報（docs/待確認.md 第 33 項）：apps/equipment-loan 的 e2e 測試 `e2e/equipment-loan.spec.ts:77`（`pickup-hint-RV-20261108-02`）在 T041、T042 修改前後都失敗，迭代 4～6 共 4 次。T041 的 agent 判斷原因是晚上 21:00 後執行、晚間時段已結束，根本原因沒有查證。疑似測試依賴實際時間。相關 spec 目錄：specs/008-overdue-discord-notification/（另請自行找出 equipment-loan 相關 spec 目錄）。

> 重新評估（2026-11-19）：bug-test 結果為失敗，新證據為 specs/bugs/pickup-test-time-dependent/test.md。修正後在模擬時刻 22:30 執行 npm run test:backend，backend/tests/integration/api.test.ts 的 SC-003（:220-224，用實際時間領取今天晚間的 RV-20261108-06）失敗，修正前同樣失敗；原評估只列 SC-001。請一併檢查 api.test.ts 與其他後端測試是否還有依賴實際時間的地方。已套用的 fixed-clock.mjs、playwright.config.ts、README.md、SC-001 修改保留，不要還原。

## 症狀

在 `apps/equipment-loan` 執行 `npm run test:e2e` 時，`e2e/equipment-loan.spec.ts` 的結果取決於執行當下的台北時間：

- 12:00 以前執行：`:77` 的 `pickup-hint-RV-20261108-02` 等不到「時段已結束未領（逾期不可領取）」，測試失敗。`iter-5.md:40` 記錄 11:21 執行在當時的 `:75` 失敗；`test.md` 修正前版本在模擬時刻 08:00 也在 `:77` 失敗。
- 12:00–21:00 執行：測試通過。`iter-5.md:31` 記錄 12:38 實跑通過；`test.md` 修正前版本在模擬時刻 14:30 通過。
- 21:00 以後執行：`:77` 通過，但 `:83` 的 `pickup-btn-RV-20261108-06` 不會出現，測試失敗（`test.md` 修正前版本，模擬時刻 22:30）。

失敗和本次修改無關，卻被看成回歸，迭代 4～6 共 4 次要另外用假時鐘重跑才能分辨。

後端整合測試 `backend/tests/integration/api.test.ts` 有同一個根本原因：

- SC-001（`:35`）預期 RV-20261108-02 回 `PICKUP_WINDOW_EXPIRED`，12:00 以前失敗；也預期 RV-20261108-06 可領取，21:00 以後失敗。首選修法第 5 項已把它固定在當天台北 14:30，`test.md` 在 08:00、14:30、22:30 都通過。
- SC-003（`:171`）第 3 步（`:220-224`）用實際時間登記領取今天晚間時段（18:00–21:00）的 RV-20261108-06，斷言 200。21:00 以後晚間時段已結束，後端回 400，測試失敗。`test.md` 在模擬時刻 22:30 量到修正前、修正後都失敗（`api.test.ts:224`，`expected 400 to be 200`），所以 E4 不通過。原評估沒有列入。
- SC-002（`:89`）第 4 步（`:131-147`）用實際時間對 RV-20261108-06 登記領取再登記歸還，但不斷言這兩個請求的結果，只斷言之後 EQ-103 晚間時段為 `OCCUPIED`。21:00 以後領取回 400、歸還回 409，RV-20261108-06 仍是「已核准／有效」，時段照樣是 `OCCUPIED`，所以測試照樣通過，但沒有驗證到 005 Edge Case「當日借用提早歸還後的時段占用保護」（`specs/005-equipment-pickup-return/spec.md:101`）。這是不會失敗的時間依賴，`test.md` 量不到。

## 完整預期行為

「目前」欄依程式碼與 `test.md` 的實測結果判斷。本次重新評估沒有執行測試。修正前與修正後的實測由 `bug-test` 依「量測方式」執行。

「模擬時刻」指在 `apps/equipment-loan` 執行命令時，用 `NODE_OPTIONS=--import <報告目錄的時鐘平移模組>` 把整個 Node 行程樹（Playwright、demo seed、Playwright 啟動的後端、vitest）的時間平移到當天台北的指定時刻，時間照常往前走。`test.md` 用的 `run-at.sh` 與 `sim-clock.mjs` 就是這個做法。量測前確認 3000、4010、5183 埠沒有既有服務，讓 Playwright 自行啟動伺服器。瀏覽器的時間不平移，因為前端只用日期判斷，模擬時刻和實際時間是同一天。

本次把量測時刻從 3 個增加為 4 個：08:00、14:30、19:00、22:30。19:00 落在晚間時段內，這時 SC-003 第 3 步不再是「時段開始前提早領取」，可以檢查晚間時段內的結果。

| # | 預期行為 | 目前 | 量測方式 | 通過標準 |
|---|---|---|---|---|
| E1 | 時段已結束的提示和執行時刻無關：管理員的「已核准／有效（待領取）」清單中，RV-20261108-02 顯示「時段已結束未領（逾期不可領取）」 | 符合：首選修法第 1～3 項已套用，`test.md` 修正後在 08:00、14:30、22:30 的 `:77-79` 都通過 | 在模擬時刻 08:00、14:30、19:00、22:30 各執行一次 `npx playwright test e2e/equipment-loan.spec.ts`，看 `:77-79` 的斷言結果 | 4 個時刻都通過 `:77-79` |
| E2 | 當日可領取和執行時刻無關：RV-20261108-06 出現「登記領取」按鈕，按下後橫幅顯示「已完成登記領取！預約編號 RV-20261108-06」 | 符合：同 E1，`test.md` 修正後 3 個時刻的 `:82-87` 都通過 | 同 E1，看 `:82-87` 的斷言結果 | 4 個時刻都通過 `:82-87` |
| E3 | 整支 e2e 測試結果和執行時刻無關 | 符合：`test.md` 修正後 3 個時刻都是 `1 passed` | 同 E1，看 `equipment-loan.spec.ts` 的總結果 | 4 個時刻都是 `1 passed` |
| E4 | 產品的領取時窗仍依實際時間判斷，後端測試結果和執行時刻無關 | 不符合：產品程式沒有修改，但 `test.md` 修正後在 22:30 的 `npm run test:backend` 有 1 項失敗（SC-003，`api.test.ts:224`） | 修正後執行 `git diff --stat -- backend/src frontend/src`；在模擬時刻 08:00、14:30、19:00、22:30 各執行一次 `npm run test:backend` | `backend/src`、`frontend/src` 沒有修改；`npm run test:backend` 在 4 個時刻都全部通過 |
| E5 | 其他 e2e 不受影響 | 符合：`test.md` 修正後在模擬 14:30 與實際時間都是 `5 passed` | 在模擬時刻 14:30 與實際時間各執行一次 `npm run test:e2e` | 兩次都全部通過 |
| E6 | SC-003 的「時段開始前提早領取後不可取消」和執行時刻無關：RV-20261108-06 登記領取回 200，成員取消回 409 `RESERVATION_ALREADY_CHECKED_OUT` | 不符合：只在 21:00 以前通過；18:00–21:00 雖然通過，但領取已不是「時段開始前」（`api.test.ts:220-229`） | 在模擬時刻 08:00、14:30、19:00、22:30 各執行一次 `npx vitest run tests/integration/api.test.ts -t "SC-003"`（在 `backend` 目錄） | 4 個時刻都通過 |
| E7 | SC-002 的「提早歸還後時段仍被占用」真的執行了領取和歸還：RV-20261108-06 登記領取回 200、登記歸還回 200，之後 EQ-103 晚間時段對其他成員為 `OCCUPIED`（澄清紀錄 Q5） | 不符合：21:00 以後領取與歸還都失敗，但 `:131-136` 沒有斷言結果，測試照樣通過 | 在模擬時刻 08:00、14:30、19:00、22:30 各執行一次 `npx vitest run tests/integration/api.test.ts -t "SC-002"`（在 `backend` 目錄）；檢查 `:131-136` 有斷言領取與歸還的狀態碼 | 4 個時刻都通過，而且測試斷言了領取 200 與歸還 200 |

## 重現步驟

1. 在台北 12:00 以前（或模擬時刻 08:00），於 `apps/equipment-loan` 執行 `npx playwright test e2e/equipment-loan.spec.ts`。
2. 觀察：`:77` 的 `pickup-hint-RV-20261108-02` 等不到「時段已結束未領（逾期不可領取）」，測試失敗。這時 RV-20261108-02 的上午時段還沒結束，管理員頁顯示它的「登記領取」按鈕。
3. 在台北 21:00 以後（或模擬時刻 22:30）再執行一次。
4. 觀察：`:77` 通過；`:83` 的 `pickup-btn-RV-20261108-06` 不可見，測試失敗。
5. 在台北 12:00–21:00（或模擬時刻 14:30）再執行一次，測試通過。
6. 在台北 21:00 以後（或模擬時刻 22:30），於 `apps/equipment-loan` 執行 `npm run test:backend`。
7. 觀察：SC-003 在 `api.test.ts:224` 失敗（`expected 400 to be 200`）；SC-002 通過，但它在 `:131-136` 的領取與歸還實際上失敗了。

第 1～5 步在首選修法第 1～3 項套用後不再重現（`test.md` E1～E3）。第 6～7 步在修正前、修正後都會重現。

## 可疑程式路徑

本次新發現：

- `apps/equipment-loan/backend/tests/integration/api.test.ts:220-224` — SC-003 第 3 步在實際時間登記領取 RV-20261108-06，斷言 200，只在 21:00 以前成立。註解寫「early BEFORE 18:00」，意圖是 005 Edge Case「成員於當日提早領取後，在時段開始前嘗試自行取消預約」（`specs/005-equipment-pickup-return/spec.md:97`），所以只有 18:00 以前執行才符合意圖。`:226-230` 的取消斷言依賴這次領取成功。
- `apps/equipment-loan/backend/tests/integration/api.test.ts:131-147` — SC-002 第 4 步對 RV-20261108-06 登記領取再登記歸還，`:131-136` 不檢查回應；`:138-147` 斷言 EQ-103 晚間時段為 `OCCUPIED`。「已核准／有效」本來就占用時段，所以領取失敗時斷言照樣通過，`spec.md:101` 的提早歸還情境沒有被驗證。
- `apps/equipment-loan/backend/tests/integration/api.test.ts:24-34` — `beforeEach` 以實際時間執行 `seedDatabase()`，整個 `describe` 沒有固定時間。只有 SC-001 在測試內部用 `vi.useFakeTimers({ toFake: ["Date"] })` 固定在 14:30（`:38-39`、`:85`）。

已檢查、不依賴實際時間的部分：

- `api.test.ts` 的 SC-005（`:240`）在時間判斷之前就回 403，不依賴時間。
- `api.test.ts` 的「Iterations 1 & 2 Regression」（`:286`）使用明日日期（`:290`），只在跨過台北午夜時受影響。
- 其他後端測試都已固定時間：`equipmentStatus.test.ts:33`、`reschedule.test.ts:35` 等用 `vi.setSystemTime` 固定在今日 08:00 再推進；`overdue*.test.ts` 固定在 2031 年的日期或 `NOW`（例如 `overdueResend.test.ts:58`）；單元測試用 `vi.setSystemTime` 或 `mockNow`。`tests/migration/` 的 2 個檔案不涉及時間。

原評估的路徑（第 1～3 項已修正 e2e 的部分）：

- `apps/equipment-loan/e2e/equipment-loan.spec.ts:77-79` — 斷言 RV-20261108-02 顯示「時段已結束未領」，前提是上午時段（09:00–12:00）已經結束。
- `apps/equipment-loan/e2e/equipment-loan.spec.ts:82-87` — 斷言 RV-20261108-06 可登記領取，前提是晚間時段（18:00–21:00）還沒結束。
- `apps/equipment-loan/backend/prisma/seed.ts:6-16` — `getTaipeiDateOffset` 依實際日期算出 `today`（`:199`），只固定日期，不固定當天的時刻。
- `apps/equipment-loan/backend/prisma/seed.ts:225-235`、`:253-262` — RV-20261108-02 為今天上午、RV-20261108-06 為今天晚間，都是 `confirmed`。兩筆的「可否領取」隨執行時刻改變。
- `apps/equipment-loan/backend/src/utils/taipeiTime.ts:98-111` — `checkPickupWindow` 以 `now`（預設 `new Date()`）判斷：日期是今天且 `timeStr < slotEndTime` 才回 `OK`。實作符合 FR-002，不是缺陷所在。
- `apps/equipment-loan/backend/src/services/reservationService.ts:943` — 清單的 `canPickup` 由 `canPickupInWindow(..., now)` 算出，`now` 是實際時間。
- `apps/equipment-loan/playwright.config.ts:32-47` — 後端 webServer。第 2、3 項已改為預載 `fixed-clock.mjs`、`reuseExistingServer: false`。
- `apps/equipment-loan/README.md:222` — 第 4 項已改寫注意事項，但寫「測試結果不受執行時刻影響」，而 SC-003 在 21:00 以後仍會失敗，這句目前不正確。

## 根本原因假設

demo seed 依實際日期建立「今天上午」和「今天晚間」的已核准預約，測試卻把它們當成固定狀態來斷言：上午一定已結束、晚間一定還沒結束（SC-003、SC-002 還假設晚間一定還沒開始）。後端依實際時間判斷領取時窗，測試沒有固定時刻，所以這些前提只在部分時段成立。原評估只追到 e2e 和 SC-001，沒有逐一檢查 `api.test.ts` 其他用到 RV-20261108-06 的測試，所以漏掉 SC-003 和 SC-002。產品的領取時窗照 FR-002 正確實作。

信心：high。SC-003 在 22:30 的失敗已由 `test.md` 實測，失敗訊息和 `taipeiTime.ts:98-111` 推出的結果一致。沒有實測的部分：SC-002 在 21:00 以後領取與歸還實際失敗，是依程式碼推論（RV-20261108-06 晚間時段已結束 → 領取回 400 → 狀態仍為 `confirmed` → 歸還回 409），沒有印出回應確認；19:00 的結果也還沒量。

### 嚴重度理由

回報沒有寫嚴重度。評估維持 `medium`：產品功能正確，資料、權限、通知都不受影響；但回歸測試在一天中約 3 小時（21:00–24:00）仍誤報失敗，而 SC-002 在同一段時間不再驗證 `spec.md:101` 的情境，卻仍顯示通過。這使 SC-005「回歸測試通過率 100%」與 005 T023「全套測試零錯誤通過」仍無法在任意時間量測。有替代操作（避開 21:00 以後執行），所以不到 `high`。

## 修法

**首選**：e2e 啟動的後端和後端整合測試 `api.test.ts` 中依賴今天時段的測試都把時間固定在「當天台北 14:30」，不改產品程式（澄清紀錄 Q1、Q2）。第 1～5 項已由 `bug-fix` 套用（`./fix.md`），本次保留，不重做：

1. （已套用）新增 e2e 專用的時鐘平移模組 `e2e/support/fixed-clock.mjs`：以 Node `--import` 預載，把行程的 `Date` 平移到啟動當天台北 14:30，之後照常往前走。對應 E1～E3。
2. （已套用）`playwright.config.ts` 的後端 webServer `env` 加上 `NODE_OPTIONS=--import <模組的 file URL>`，保留外部傳入的 `NODE_OPTIONS`。對應 E1～E3。
3. （已套用）後端 webServer 的 `reuseExistingServer` 改為 `false`（澄清紀錄 Q3）。對應 E1～E3。
4. （已套用）更新 `apps/equipment-loan/README.md:222` 的注意事項。
5. （已套用）`backend/tests/integration/api.test.ts` 的 SC-001 改用 `vi.useFakeTimers({ toFake: ["Date"] })` 加 `vi.setSystemTime` 固定在當天台北 14:30，測試結束後還原真實時間。對應 E4。
6. `api.test.ts` 的 SC-003 固定在當天台北 14:30，讓第 3 步一定是「晚間時段開始前提早領取」，符合 `spec.md:97`。做法比照 SC-001：先登入，再固定時間，在該測試內以 `try`／`finally` 還原真實時間（澄清紀錄 Q6）。對應 E4、E6。
7. `api.test.ts` 的 SC-002 固定在當天台北 14:30，讓第 4 步一定是「晚間時段結束前提早歸還」；並在 `:131-136` 加上斷言：領取回 200、歸還回 200（澄清紀錄 Q5）。固定時間的做法同第 6 項，在該測試內以 `try`／`finally` 還原（澄清紀錄 Q6）。對應 E4、E7。
8. 更新 `apps/equipment-loan/README.md:222` 的注意事項：把「SC-001」改成實際固定時間的測試（SC-001～SC-003），讓「測試結果不受執行時刻影響」這句成立。

**替代做法**：

- 後端加「時鐘覆寫」設定（例如環境變數），把約 20 處 `new Date()` 改成共用的取時函式：可以精準控制時間，但要改產品程式，影響範圍大。
- 測試依執行時刻改變斷言：上午、晚間各分兩種情況。21:00 後無法測試「登記領取」，後段依賴領取結果的斷言也要跟著分支，覆蓋率下降。
- SC-003、SC-002 改用另一筆在明日以後、或在時段尚未結束的預約：seed 沒有這種資料，要在測試內另建，而且仍要固定時間才能保證「時段開始前」，比固定時間複雜。
- 不建議：12:00–21:00 以外用 `test.skip` 略過。失敗不再出現，但回歸測試在那段時間沒有實際執行。

**要改的檔案**：

- `apps/equipment-loan/e2e/support/fixed-clock.mjs`（已新增，本次不改）
- `apps/equipment-loan/playwright.config.ts`（已修改，本次不改）
- `apps/equipment-loan/README.md`（第 8 項）
- `apps/equipment-loan/backend/tests/integration/api.test.ts`（第 6、7 項；SC-001 的修改保留）

**要補的測試**：

- 不新增測試案例。修正對象是既有的 `e2e/equipment-loan.spec.ts` 與 `api.test.ts` 的 SC-001～SC-003；SC-002 在既有的第 4 步補上領取與歸還的斷言（澄清紀錄 Q5）。
- 由 `bug-test` 依 E1～E7 在模擬時刻 08:00、14:30、19:00、22:30 驗證。
- 重跑 `npm run check`、`npm run test:backend`、`npm run test:e2e`。

## 轉回 SDD 流程的項目

下列項目要改變已同意的意圖，不放進本次修法，由處理 Skill 先修改上游文件，再走 `tasks` → `implement`。

| # | 要改的事 | 已同意的意圖 | 處理 Skill |
|---|---|---|---|
| — | 無 | — | — |

## 風險

- 平移時鐘只作用在 Playwright 啟動的後端。3000 埠有手動啟動的後端時 e2e 會直接報錯，開發者要先停掉它；這是刻意的取捨（澄清紀錄 Q3）。
- 平移時刻在後端啟動時決定，`api.test.ts` 的 `todayStr` 也在測試內以當時日期計算。測試跨過台北午夜時，日期會不一致；這和修正前相同，`test.md` 沒有量跨午夜。
- 後端所有依時間的功能（改期失效、逾期判斷、登入期限）在 e2e 中都以 14:30 計算。E5 已確認 `reschedule.spec.ts`、`equipment-maintenance.spec.ts` 仍通過。
- SC-002、SC-003 固定在 14:30 後，只驗證「時段開始前」的情境，不驗證 18:00–21:00 時段進行中的領取。FR-002 的時段內領取由 SC-001 第 1 步涵蓋（同樣在 14:30，也是開始前）；時段進行中的領取目前沒有測試固定在該時刻驗證。
- demo seed 在台北 21:00–24:00 沒有「當日尚未結束、可立即登記領取」的預約，和 FR-009 不一致。修正後測試不受影響，只有 21:00 後手動展示時會遇到。使用者決定只記為剩餘風險，不轉回 `s-specify`（澄清紀錄 Q4）。
- 量測只用 4 個模擬時刻，其他時刻的結果是依程式碼推論。

## 使用者關卡

### 澄清紀錄

| # | 問題 | 使用者回答 | 寫回位置 |
|---|---|---|---|
| Q1 | 修正範圍只含 e2e `equipment-loan.spec.ts`（第 33 項），還是一併修正後端 `api.test.ts` SC-001（同一根本原因）？ | 一併修正：e2e 用時鐘平移，SC-001 用 `vi.setSystemTime` 固定在 14:30 | 「症狀」；「完整預期行為」E4；「修法」首選第 5 項、要改的檔案 |
| Q2 | 修法採哪一種：e2e 專用的時鐘平移到當天台北 14:30（不改產品程式，14:30 和 005 雛形情境相同）、後端加時鐘覆寫設定（改產品程式），或測試依時刻改變斷言？ | e2e 專用的時鐘平移到當天台北 14:30，不改產品程式 | 「修法」首選第 1、2 項 |
| Q3 | 3000 埠已有後端時，e2e 要改成不沿用（直接報錯，提醒先停掉），還是維持沿用並在 README 寫明要先停掉？ | 不沿用，直接報錯 | 「修法」首選第 3、4 項；「風險」第 1 項 |
| Q4 | demo seed 在 21:00 後沒有當日可領取的預約，和 FR-009 不一致。要列為轉回 `s-specify` 的項目，還是只記為剩餘風險？ | 只記為剩餘風險 | 「風險」第 5 項；「轉回 SDD 流程的項目」維持「無」 |
| Q5 | SC-002 第 4 步在 21:00 以後領取與歸還都失敗，但測試照樣通過（不會失敗的時間依賴）。要一併修正（固定在 14:30，並斷言領取與歸還都回 200）、只固定時間不加斷言，還是不修、只記為風險？ | 一併修正：SC-002 固定在當天台北 14:30，並斷言領取與歸還都回 200 | 「完整預期行為」E7；「修法」首選第 7 項、要補的測試 |
| Q6 | SC-002、SC-003 的固定時間做法：比照 SC-001 在各測試內 `try`／`finally`，還是改在 `describe` 的 `beforeEach`／`afterEach` 把整個 `api.test.ts` 固定在 14:30（SC-001 的寫法要跟著移到 hook，SC-005 與 Iterations 1 & 2 回歸測試也會在 14:30 執行）？ | 比照 SC-001，在各測試內 `try`／`finally`；SC-005 與 Iterations 1 & 2 回歸測試不固定時間 | 「修法」首選第 6、7 項 |

### 核准

- 核准日期：2026-11-19
- 核准的修法：首選修法第 6～8 項。第 1～5 項已於前次核准並由 `bug-fix` 套用（`./fix.md`），本次保留，不重做
- 不在本次修正範圍：替代做法 4 項；「風險」所列的剩餘風險（含 demo seed 在 21:00 後沒有當日可領取的預約，澄清紀錄 Q4）
