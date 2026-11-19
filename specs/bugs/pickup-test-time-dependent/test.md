# 錯誤實測：領取借用的回歸測試只在台北 12:00–21:00 通過

- **代號**：pickup-test-time-dependent
- **實測日期**：2026-11-19
- **模式**：修正後實測
- **評估報告**：./assessment.md
- **修正報告**：./fix.md
- **結果**：使用者已驗證（2026-11-19）

## 摘要

本次實測對象是重新評估後的修正：評估報告首選修法第 1～8 項全部套用後的工作目錄（第 1～5 項為前次套用，第 6～8 項為本次套用）。修正前版本（HEAD，沒有任何修正）在模擬時刻 08:00 和 22:30 重現了評估報告的症狀：`equipment-loan.spec.ts` 在 08:00 於 `:77`、22:30 於 `:83` 失敗；`npm run test:backend` 在 08:00 有 SC-001 失敗、22:30 有 SC-001 與 SC-003 失敗。修正後，E1～E7 在模擬時刻 08:00、14:30、19:00、22:30 都通過：e2e 4 個時刻都是 `1 passed`，`npm run test:backend` 4 個時刻都是 76 項全部通過，SC-003、SC-002 單獨執行 4 個時刻都通過，完整 e2e 在模擬 14:30 與實際時間都是 `5 passed`，產品程式沒有修改。沒有回歸。修正前 14:30 的 e2e 第 1 次在 `:160` 逾時，重跑通過，判斷為偶發逾時，和執行時刻無關。SC-002 新增的斷言在修正前版本不存在，依 E7 的通過標準判定修正前不通過，並以修正前 SC-003 在 22:30 對同一筆預約領取回 400 作為間接證據（見「檢查紀錄」）。請依「使用者驗證」用模擬時刻執行後回覆結果。

## 實測環境

- 修正前版本：`fix.md` 修改的檔案還沒有 commit，所以用 `git worktree add --detach /tmp/pickup-test-time-dependent-before2 HEAD` 取出 HEAD（`6a2b756`），這個版本沒有評估報告首選第 1～8 項的任何修正。worktree 的 `apps/equipment-loan/node_modules`、`backend/node_modules`、`frontend/node_modules` 和 `backend/.env` 用符號連結指向工作目錄，沒有重新安裝。測完先刪除符號連結，再執行 `git worktree remove --force`（worktree 內只剩被 git 忽略的測試暫存檔）。
- 修正後版本：工作目錄，包含 `fix.md` 列出的未 commit 修改（第 1～8 項）。
- 模擬時刻：`run-at.sh` 以 `NODE_OPTIONS=--import sim-clock.mjs` 把整個 Node 行程樹（Playwright、demo seed、Playwright 啟動的後端與前端、vitest）的時間平移到當天台北的指定時刻，時間照常往前走；所有行程共用同一個基準時間，平移量一致。瀏覽器的時間不平移。修正後的 e2e 後端另外預載 `fixed-clock.mjs`，在模擬時刻之上再平移到 14:30；修正後的 SC-001～SC-003 在測試內以 `vi.setSystemTime` 固定在 14:30。
- 服務：每次量測前確認 3000、4010、5183 埠沒有服務，由 Playwright 自行啟動並在結束時停止。實際時間為台北 14:56–15:06。
- 資料：`npm run test:backend`、`npm run test:e2e`、`npx playwright test`、`npx vitest run` 每次都會把本機資料庫重設成 demo seed。評估報告的量測方式要求執行這些命令，使用者也明確同意，所以照做，沒有略過。
- 瀏覽器：Chromium（Playwright），沿用 `equipment-loan.spec.ts` 內的 360px 和 1120px。
- 量測腳本：`run-at.sh`（用法：`run-at.sh <應用程式目錄> <HH:MM|real> <命令...>`）與 `sim-clock.mjs`，都放在本目錄，沿用前次實測的版本，本次沒有修改，不寫死絕對路徑。

## 完整預期行為實測

依評估報告「完整預期行為」的量測方式和通過標準執行。E1～E4、E6、E7 在模擬時刻 08:00、14:30、19:00、22:30 各量一次，4 個時刻都符合通過標準，才算通過。

| # | 預期行為 | 修正前 | 修正後 | 結果 |
|---|---|---|---|---|
| E1 | 時段已結束的提示和執行時刻無關 | 不通過（成功重現）：08:00 在 `:77` 找不到 `pickup-hint-RV-20261108-02`；14:30、19:00、22:30 的 `:77-79` 通過 | 通過：4 個時刻的 `:77-79` 都通過 | 通過 |
| E2 | 當日可領取和執行時刻無關 | 不通過（成功重現）：22:30 在 `:83` 找不到 `pickup-btn-RV-20261108-06`；14:30、19:00 通過；08:00 在 `:77` 先失敗，沒有執行到 `:82-87` | 通過：4 個時刻的 `:82-87` 都通過 | 通過 |
| E3 | 整支 e2e 測試結果和執行時刻無關 | 不通過（成功重現）：08:00 `1 failed`、19:00 `1 passed`、22:30 `1 failed`；14:30 第 1 次 `1 failed`（`:160` 逾時，`:77-87` 已通過），重跑 `1 passed` | 通過：4 個時刻都是 `1 passed` | 通過 |
| E4 | 產品的領取時窗仍依實際時間判斷，後端測試結果和執行時刻無關 | 不通過（成功重現）：`npm run test:backend` 08:00 有 1 項失敗（SC-001）、14:30 與 19:00 全部 76 項通過、22:30 有 2 項失敗（SC-001、SC-003） | 通過：`git diff --stat -- backend/src frontend/src` 沒有輸出；`npm run test:backend` 4 個時刻都是 76 項全部通過 | 通過 |
| E5 | 其他 e2e 不受影響 | 通過：`npm run test:e2e` 模擬 14:30、實際時間（15:00）都是 `5 passed` | 通過：模擬 14:30、實際時間（15:04）都是 `5 passed` | 通過 |
| E6 | SC-003 的「時段開始前提早領取後不可取消」和執行時刻無關 | 不通過（成功重現）：22:30 在 `api.test.ts:218` 失敗（`expected 400 to be 200`）；08:00、14:30、19:00 通過（19:00 的領取已不是「時段開始前」） | 通過：4 個時刻都通過 | 通過 |
| E7 | SC-002 的「提早歸還後時段仍被占用」真的執行了領取和歸還 | 不通過：4 個時刻都 `1 passed`，但修正前的 SC-002 第 4 步沒有斷言領取與歸還的狀態碼（`earlyPickup`、`earlyReturn` 斷言不存在），不符合「測試斷言了領取 200 與歸還 200」 | 通過：4 個時刻都通過，`api.test.ts:139` 斷言領取 200、`:143` 斷言歸還 200 | 通過 |

## 檢查紀錄

命令在 `apps/equipment-loan`（修正前為 worktree 中的同一路徑）執行，透過 `../../specs/bugs/pickup-test-time-dependent/run-at.sh <應用程式目錄> <時刻>` 啟動；「時刻」欄寫在命令中。SC-002、SC-003 單獨執行時，應用程式目錄為 `backend`。

| 檢查 | 命令或操作 | 版本 | 結果 | 說明 |
|---|---|---|---|---|
| 重現步驟 1～2 | `run-at.sh . 08:00 npx playwright test e2e/equipment-loan.spec.ts` | 修正前 | 不通過（成功重現） | `:77` 的 `pickup-hint-RV-20261108-02` 找不到 |
| 重現步驟 1～2 | 同上 | 修正後 | 通過 | `1 passed (5.7s)` |
| 重現步驟 3～4 | `run-at.sh . 22:30 npx playwright test e2e/equipment-loan.spec.ts` | 修正前 | 不通過（成功重現） | `:77` 通過，`:83` 的 `pickup-btn-RV-20261108-06` 找不到 |
| 重現步驟 3～4 | 同上 | 修正後 | 通過 | `1 passed (5.8s)` |
| 重現步驟 5 | `run-at.sh . 14:30 npx playwright test e2e/equipment-loan.spec.ts` | 修正前 | 不通過 | 第 1 次：`Test timeout of 30000ms exceeded`，停在 `:160`（陳冠廷登入後點日期），`:77-87` 已通過。和時段無關，判斷為偶發逾時 |
| 重現步驟 5（重跑） | 同上 | 修正前 | 通過 | `1 passed (7.7s)`，和評估報告相同 |
| 重現步驟 5 | 同上 | 修正後 | 通過 | `1 passed (5.8s)` |
| e2e 19:00（E1～E3） | `run-at.sh . 19:00 npx playwright test e2e/equipment-loan.spec.ts` | 修正前 | 通過 | `1 passed (6.1s)` |
| e2e 19:00（E1～E3） | 同上 | 修正後 | 通過 | `1 passed (5.6s)` |
| 重現步驟 6～7（E4） | `run-at.sh . 22:30 npm run test:backend` | 修正前 | 不通過（成功重現） | SC-001 `:44` 與 SC-003 `:218` 都是 `expected 400 to be 200`；74 passed |
| 重現步驟 6～7（E4） | 同上 | 修正後 | 通過 | 76 passed |
| 後端測試（E4） | `run-at.sh . 08:00 npm run test:backend` | 修正前 | 不通過（成功重現） | SC-001 `:79` `expected 200 to be 400`；75 passed |
| 後端測試（E4） | 同上 | 修正後 | 通過 | 76 passed |
| 後端測試（E4） | `run-at.sh . 14:30 npm run test:backend` | 修正前 | 通過 | 76 passed |
| 後端測試（E4） | 同上 | 修正後 | 通過 | 76 passed |
| 後端測試（E4） | `run-at.sh . 19:00 npm run test:backend` | 修正前 | 通過 | 76 passed |
| 後端測試（E4） | 同上 | 修正後 | 通過 | 76 passed |
| 產品程式未修改（E4） | `git diff --stat -- backend/src frontend/src` | 修正後 | 通過 | 沒有輸出 |
| SC-003（E6） | `run-at.sh backend 22:30 npx vitest run tests/integration/api.test.ts -t "SC-003"` | 修正前 | 不通過（成功重現） | `api.test.ts:218` `expected 400 to be 200`；`1 failed \| 4 skipped` |
| SC-003（E6） | 同上 | 修正後 | 通過 | `1 passed \| 4 skipped` |
| SC-003（E6） | 同上，時刻 08:00、14:30、19:00 | 修正前 | 通過 | 3 個時刻都是 `1 passed \| 4 skipped` |
| SC-003（E6） | 同上，時刻 08:00、14:30、19:00 | 修正後 | 通過 | 3 個時刻都是 `1 passed \| 4 skipped` |
| SC-002（E7） | `run-at.sh backend <時刻> npx vitest run tests/integration/api.test.ts -t "SC-002"`，時刻 08:00、14:30、19:00、22:30 | 修正前 | 不通過（成功重現） | 4 個時刻都是 `1 passed \| 4 skipped`，但修正前的第 4 步沒有斷言領取與歸還的狀態碼，依 E7 通過標準判定不通過。間接證據：同一版本在 22:30 的 SC-003 對同一筆 RV-20261108-06 登記領取，後端回 400（上一列 `:218`），所以 SC-002 第 4 步的領取在 22:30 同樣失敗，舊測試沒有發現 |
| SC-002（E7） | 同上 | 修正後 | 通過 | 4 個時刻都是 `1 passed \| 4 skipped`；斷言在 `api.test.ts:139`、`:143` |
| 完整 e2e（E5） | `run-at.sh . 14:30 npm run test:e2e` | 修正前 | 通過 | `5 passed (17.1s)` |
| 完整 e2e（E5） | 同上 | 修正後 | 通過 | `5 passed (18.4s)` |
| 完整 e2e（E5） | `run-at.sh . real npm run test:e2e` | 修正前 | 通過 | `5 passed (15.9s)`，實際時間 15:00 |
| 完整 e2e（E5） | 同上 | 修正後 | 通過 | `5 passed (16.7s)`，實際時間 15:04 |
| 要補的測試：修改的 SC-003 | 同 E6 各列 | 修正前 | 不通過（符合預期） | 評估報告不新增測試案例；修改的 SC-003 在修正前 22:30 不通過 |
| 要補的測試：修改的 SC-003 | 同 E6 各列 | 修正後 | 通過 | 4 個時刻都通過 |
| 要補的測試：SC-002 新增的斷言 | 同 E7 各列 | 修正前 | 不通過（符合預期） | 新斷言在修正前版本不存在，無法直接執行；依 E7 通過標準與上方間接證據判定（使用者指定的判定方式） |
| 要補的測試：SC-002 新增的斷言 | 同 E7 各列 | 修正後 | 通過 | 4 個時刻都通過 |
| 修正報告本機驗證：型別檢查、lint、格式 | `run-at.sh . real npm run check` | 修正後 | 通過 | 後端、前端 `tsc`、`eslint`、`prettier --check` 都通過 |
| 修正報告本機驗證：後端測試 | 同 E4 各列 | 修正後 | 通過 | 4 個模擬時刻都是 76 passed |
| 修正報告本機驗證：完整 e2e | 同 E5 實際時間列 | 修正後 | 通過 | `5 passed` |

## 輸出摘錄

修正前，模擬時刻 08:00：

```
Locator: getByTestId('pickup-hint-RV-20261108-02')
Expected substring: "時段已結束未領（逾期不可領取）"
Error: element(s) not found
    at .../e2e/equipment-loan.spec.ts:77:64
1 failed
```

修正前，模擬時刻 22:30：

```
Locator: getByTestId('pickup-btn-RV-20261108-06')
Expected: visible
Error: element(s) not found
    at .../e2e/equipment-loan.spec.ts:83:29
1 failed
```

修正前，模擬時刻 14:30 第 1 次（偶發逾時，重跑 `1 passed (7.7s)`）：

```
Test timeout of 30000ms exceeded.
> 160 |   await chenPage.getByTestId(`date-chip-${todayStr}`).click();
1 failed
```

`npm run test:backend`：

```
修正前 08:00  Tests  1 failed | 75 passed (76)   × SC-001  api.test.ts:79:31  expected 200 to be 400
修正前 14:30  Tests  76 passed (76)
修正前 19:00  Tests  76 passed (76)
修正前 22:30  Tests  2 failed | 74 passed (76)   × SC-001  api.test.ts:44:29  × SC-003  api.test.ts:218:32  expected 400 to be 200
修正後 08:00  Tests  76 passed (76)
修正後 14:30  Tests  76 passed (76)
修正後 19:00  Tests  76 passed (76)
修正後 22:30  Tests  76 passed (76)
```

SC-003、SC-002 單獨執行：

```
修正前 SC-003 22:30  1 failed | 4 skipped   api.test.ts:218:32  expected 400 to be 200
修正前 SC-003 其他 3 個時刻、SC-002 4 個時刻  1 passed | 4 skipped
修正後 SC-003、SC-002 4 個時刻  1 passed | 4 skipped
```

修正後，模擬時刻 08:00、14:30、19:00、22:30 的 `equipment-loan.spec.ts`：都是 `1 passed`。

## 剩餘風險

- SC-002 新增的斷言沒有在「21:00 以後、沒有固定時間」的程式上直接執行；它能抓到錯誤，是依修正前 SC-003 對同一筆預約的領取結果推論。
- 只量了 4 個模擬時刻，沒有量跨午夜執行；`fixed-clock.mjs` 的平移時刻在後端啟動時決定，`api.test.ts` 的固定時間以測試當下的日期計算，跨午夜時日期會不一致（評估報告「風險」第 2 項）。
- SC-002、SC-003 固定在 14:30 後，只驗證「時段開始前」的情境，沒有測試固定在 18:00–21:00 驗證時段進行中的領取（評估報告「風險」第 4 項）。
- 修正前 14:30 的 e2e 出現 1 次 30 秒逾時（`:160`），重跑通過；修正後 4 次沒有出現。偶發逾時的原因沒有調查。
- 瀏覽器的時間沒有平移。前端只用日期判斷，模擬時刻和實際時間是同一天，所以不影響本次量測。
- demo seed 在台北 21:00 後不符合 FR-009，使用者決定只記為風險（評估報告澄清紀錄 Q4）。

## 使用者驗證

`bug-test` 不代替你宣稱已驗證。這個錯誤的症狀是測試結果，所以請在終端機用模擬時刻執行下列命令，親眼確認結果，回覆每一項的結果；回覆後由 `bug-test` 記錄。模擬時刻用本目錄的 `run-at.sh` 把測試與後端的時鐘平移到指定時刻，不用等待實際時間。命令都在 `apps/equipment-loan` 執行；執行前先停掉 3000 埠手動啟動的後端；這些命令會把本機資料庫重設成 demo seed。

- 驗證日期：2026-11-19

| # | 驗證項目 | 操作 | 通過標準 | 你的結果 |
|---|---|---|---|---|
| U1 | 晚上的後端測試全部通過（E4、E6、E7） | 執行 `../../specs/bugs/pickup-test-time-dependent/run-at.sh . 22:30 npm run test:backend` | 最後顯示 `Tests  76 passed (76)`，沒有 `failed` | 通過（使用者要求 agent 代為執行並記錄；15:35 執行，`Tests  76 passed (76)`） |
| U2 | 晚上的領取借用 e2e 通過（E1～E3） | 執行 `../../specs/bugs/pickup-test-time-dependent/run-at.sh . 22:30 npx playwright test e2e/equipment-loan.spec.ts` | 最後顯示 `1 passed`，沒有 `failed` | 通過（使用者要求 agent 代為執行並記錄；15:36 執行，`1 passed (8.5s)`） |
| U3 | 中午以前的後端測試全部通過（E4、E6、E7） | 執行 `../../specs/bugs/pickup-test-time-dependent/run-at.sh . 08:00 npm run test:backend` | 最後顯示 `Tests  76 passed (76)`，沒有 `failed` | 通過（使用者要求 agent 代為執行並記錄；15:36 執行，`Tests  76 passed (76)`） |
| U4 | 中午以前的領取借用 e2e 通過（E1～E3） | 執行 `../../specs/bugs/pickup-test-time-dependent/run-at.sh . 08:00 npx playwright test e2e/equipment-loan.spec.ts` | 最後顯示 `1 passed`，沒有 `failed` | 通過（使用者要求 agent 代為執行並記錄；15:37 執行，`1 passed (7.3s)`） |
| U5 | 原本回報的現象已消失 | 對照 U1～U4 和 `docs/待確認.md` 第 33 項的現象（`equipment-loan.spec.ts` 只在 12:00–21:00 通過，晚上 21:00 後失敗） | 08:00 和 22:30 都不再失敗 | 通過（U1～U4 在 08:00、22:30 都通過，原本的現象沒有再出現） |

## 後續事項

- 依「使用者驗證」用模擬時刻執行後回覆結果。`bug-test` 會把結果寫入該段，結果改成「使用者已驗證（日期）」或「使用者驗證未通過」。
- 使用者驗證未通過時，以本報告為新證據，重新執行 `bug-assess`。
- 使用者驗證通過後，更新 `docs/待確認.md` 第 33 項。
- 前次的實測報告（結果「失敗」）備份在 `/tmp/bt2-old-test.md`，執行紀錄在 `/tmp/bt-runs/`；本次執行紀錄在 `/tmp/bt2-runs/`。
