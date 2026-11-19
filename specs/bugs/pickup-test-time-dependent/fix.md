# 錯誤修正：領取借用的回歸測試只在台北 12:00–21:00 通過

- **代號**：pickup-test-time-dependent
- **修正日期**：2026-11-19
- **評估報告**：./assessment.md
- **狀態**：已套用

## 摘要

依使用者在重新評估後核准的首選修法第 6～8 項修改，沒有改產品程式：後端整合測試 `api.test.ts` 的 SC-003、SC-002 比照 SC-001，在各測試內用 `vi.setSystemTime` 固定在當天台北 14:30，以 `try`／`finally` 還原真實時間；SC-002 第 4 步補上領取 200、歸還 200 的斷言；README 注意事項的「SC-001」改成「SC-001～SC-003」。第 1～5 項已於前次核准並由 `bug-fix` 套用（`fixed-clock.mjs`、`playwright.config.ts`、README、SC-001），本次保留，沒有還原或重做；前次的修正報告備份在 `/tmp/bf2-old-fix.md`。替代做法 4 項與「風險」所列的剩餘風險不在本次範圍。`npm run check`、`npm run test:backend`、`npm run test:e2e` 在實際時間 14:52–14:53 全部通過；08:00、19:00、22:30 等模擬時刻的量測留給 `bug-test`。

## 執行的修法

| 修法項目 | 結果 | 說明 |
|---|---|---|
| 1～5（前次已套用） | 保留 | 前次核准並套用，本次沒有修改；內容見 `/tmp/bf2-old-fix.md` 與評估報告首選第 1～5 項 |
| 6 SC-003 固定在當天台北 14:30 | 完成 | 測試用的帳號都登入後才啟用只假造 `Date` 的假時鐘並 `vi.setSystemTime` 到 14:30，其餘本體包在 `try`／`finally`，結束時 `vi.useRealTimers()`；第 3 步因此一定是「晚間時段開始前提早領取」 |
| 7 SC-002 固定在 14:30，並斷言領取與歸還都回 200 | 完成 | 固定時間做法同第 6 項；第 4 步把兩個請求存成 `earlyPickup`、`earlyReturn`，各加 `expect(...status).toBe(200)` |
| 8 更新 `README.md:222` 的注意事項 | 完成 | 「SC-001 以 `vi.setSystemTime` 固定」改成「SC-001～SC-003 以 `vi.setSystemTime` 固定」，讓「測試結果不受執行時刻影響」這句成立 |

## 未執行的項目

| 項目 | 原因 |
|---|---|
| 替代做法：後端加時鐘覆寫設定 | 未核准；要改產品程式，影響範圍大（澄清紀錄 Q2） |
| 替代做法：測試依執行時刻改變斷言 | 未核准；21:00 後無法測試「登記領取」，覆蓋率下降 |
| 替代做法：SC-003、SC-002 改用另一筆預約 | 未核准；seed 沒有這種資料，仍要固定時間 |
| 替代做法：12:00–21:00 以外用 `test.skip` 略過 | 未核准；評估報告標為不建議 |
| demo seed 在台北 21:00–24:00 沒有當日可立即領取的預約，和 FR-009 不一致 | 不在本次修正範圍；使用者決定只記為剩餘風險（澄清紀錄 Q4） |
| SC-005、Iterations 1 & 2 回歸測試固定時間 | 不在本次修正範圍；評估報告判定不依賴今天時段，使用者選擇只在各測試內固定（澄清紀錄 Q6） |

## 修改的檔案

| 檔案 | 動作 | 對應修法項目 | 說明 |
|---|---|---|---|
| `apps/equipment-loan/backend/tests/integration/api.test.ts` | 修改 | 6、7 | SC-002、SC-003 加入固定時間與 `try`／`finally`（差異行數多數是縮排）；SC-002 第 4 步加 2 個斷言；SC-001 的前次修改保留 |
| `apps/equipment-loan/README.md` | 修改 | 8 | 第 222 行注意事項的測試範圍改成 SC-001～SC-003；前次第 4 項的改寫保留 |

## 重點差異

SC-002、SC-003 的固定時間（兩者相同，比照 SC-001）：

```ts
const adminToken = await loginAs("wu.chenghan", "Admin@2026");
// ...其他帳號登入
// 固定在當天台北 14:30：...，結果不受執行時刻影響
vi.useFakeTimers({ toFake: ["Date"] });
vi.setSystemTime(getSlotStartUtc(getTaipeiNow().dateStr, "14:30"));
try {
  const todayStr = getTaipeiNow().dateStr;
  // 原本的各段斷言
} finally {
  vi.useRealTimers();
}
```

SC-002 第 4 步：

```ts
const earlyPickup = await request(app)
  .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/pickup")
  .set("Authorization", `Bearer ${adminToken}`);
expect(earlyPickup.status).toBe(200);
const earlyReturn = await request(app)
  .post("/api/admin/reservations/44444444-4444-4444-8444-444444444006/return")
  .set("Authorization", `Bearer ${adminToken}`);
expect(earlyReturn.status).toBe(200);
```

## 新增或修改的測試

- `backend/tests/integration/api.test.ts` SC-003：斷言內容不變，只把執行時的系統時間固定在當天台北 14:30。
- `backend/tests/integration/api.test.ts` SC-002：系統時間固定在當天台北 14:30；第 4 步新增「登記領取回 200」「登記歸還回 200」2 個斷言（評估報告 E7）。
- 沒有新增測試案例（評估報告「要補的測試」）。

## 本機驗證

**執行的命令與結果**：

在 `apps/equipment-loan` 執行，實際時間為台北 2026-11-19 14:52–14:53，3000、4010、5183 埠執行前都是空的：

- `npm run check`：第 1 輪通過（後端、前端 `tsc`、`eslint`、`prettier --check` 都通過）。
- `npm run test:backend`：14 個檔案、76 項測試全部通過（包含 SC-001～SC-003）。
- `npm run test:e2e`：5 項全部通過（`equipment-loan.spec.ts`、`equipment-maintenance.spec.ts`、`reschedule.spec.ts` US1～US3）。
- `git diff --stat -- backend/src frontend/src`：沒有輸出，產品程式沒有修改。

**和本次修改無關的失敗**：

- 無。

**沒有執行的驗證**：

- 模擬時刻 08:00、19:00、22:30 的量測（評估報告 E1～E7）：屬於 `bug-test` 的修正前後實測，這次沒有執行。實際時間 14:52 在原本可通過的時段內，所以這次通過還不能證明修正有效。
- 無其他略過的命令。附註：`npm run test:backend`、`npm run test:e2e` 會把本機資料庫重設成 demo seed，屬於「會覆寫既有資料」的命令；評估報告指定要重跑，使用者也明確同意執行，所以照做。

## 偏離評估

| # | 等級 | 內容 | 理由 | 處理 |
|---|---|---|---|---|
| 1 | 補充 | SC-002、SC-003 的 `todayStr` 移到 `try` 內、固定時間之後才計算 | 讓查詢日期和固定後的「現在」來自同一個時鐘；固定時刻和實際時間是同一天，結果不變 | 記錄後繼續 |
| 2 | 補充 | SC-002 的整個本體（第 1～4 步與未來時段衝突檢查）都在 14:30 執行，不只第 4 步 | 評估報告寫「SC-002 固定在當天台北 14:30」，做法比照 SC-001 包住整個本體；其他步驟只用「今天」與「明天」日期，不依賴當天時刻。未來時段檢查裡 `prisma.reservations.update` 的 `new Date()` 會變成 14:30，只寫入時間戳，不影響斷言 | 記錄後繼續 |

## 後續事項

- 執行 `bug-test`：在模擬時刻 08:00、14:30、19:00、22:30 量測修正前與修正後的 E1～E4、E6、E7，並在模擬時刻 14:30 與實際時間量測 E5。
- 執行 e2e 前要先停掉 3000 埠手動啟動的後端，否則 Playwright 會報錯（澄清紀錄 Q3 的取捨）。
- demo seed 在台北 21:00 後不符合 FR-009，只記為剩餘風險（澄清紀錄 Q4）。
- `docs/待確認.md` 第 33 項在 `bug-test` 與使用者驗證通過後更新。
