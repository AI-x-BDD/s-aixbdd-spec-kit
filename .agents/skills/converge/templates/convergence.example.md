# 收斂評估：設備逾期未還時自動發 Discord 通知

- **spec 目錄**：`specs/008-overdue-discord-notification/`
- **程式目錄**：`apps/equipment-loan/`
- **輪次**：2

## 第 1 輪

- **日期**：2026-11-11
- **評估狀態**：程式與文件都是 commit `e035de3`，工作目錄沒有未 commit 的變更
- **結果**：有缺口（附加任務 0、上游缺口 4、不處理 0）

### 檢查範圍

| 項目 | 數量 | 說明 |
|---|---|---|
| 功能需求 | 21 | FR-001～FR-021 |
| 非功能需求 | 3 | NFR-001～NFR-003 |
| 成功標準 | 7 | SC-001～SC-007，都是可以實作與量測的項目，沒有排除上線後指標 |
| User Story 情境 | 37 | US1 15、US2 16、US3 6 |
| Edge Case | 13 | `spec.md` Edge Cases 的 13 項 |
| 系統介面 | 15 | `plan.md` 系統介面盤點 F1～F4、B1～B4、D1～D2、S1～S3、N1～N2 |
| 技術決定 | 8 | `research.md` §1～§8 |
| 憲法規則 | 1 | `.agents/constitution/shared.md` Rule 1；`skills/implement/code.md` 不存在 |
| 任務 | 39 | T001～T039 全部已勾選；勾選不算證據，每個任務都對照程式重新確認 |
| 待確認 | 4 | `tasks.md` Notes 待確認 1～4，都還沒有上游決定 |

程式範圍（依 `plan.md` Source Code 與任務引用的路徑）：

- 前端：`frontend/src/App.tsx`、`frontend/src/api/client.ts`、`frontend/src/text/zh-TW.ts`、`frontend/src/views/OverdueNotificationsView.tsx`、`frontend/src/components/ResendUnknownDialog.tsx`
- 後端：`backend/src/server.ts`、`backend/src/config/notificationConfig.ts`、`backend/src/integrations/discordWebhookClient.ts`、`backend/src/jobs/overdueScheduler.ts`、`backend/src/services/overdueNotificationService.ts`、`backend/src/routes/adminRouter.ts`、`backend/src/middleware/errorHandler.ts`、`backend/scripts/discordWebhookSimulator.ts`
- 資料庫：`backend/prisma/schema.prisma`、`backend/prisma/migrations/20261111000000_overdue_notifications/`、`backend/prisma/seed.ts`
- 測試：`backend/tests/integration/overdue*.test.ts`（5 個）、`backend/tests/migration/overdueDiscordNotification.test.ts`、`backend/tests/integration/api.test.ts`、`e2e/equipment-loan.spec.ts`

### 缺口

| ID | 缺口類型 | 嚴重度 | 來源 | 證據 | 剩餘工作 | 處理 |
|---|---|---|---|---|---|---|
| G1 | 部分 | HIGH | FR-003；US2 情境 1；`tasks.md` 待確認 4 | `frontend/src/views/OverdueNotificationsView.tsx:27-28` 固定 `PAGE_SIZE = 100`，`:157-161` 固定查詢 `page: 1`，畫面沒有換頁操作；`contracts/openapi.yaml:27`、`:52` 的 `listOverdueNotifications` 有 `page`、`pageSize`；`ui/plan.md` §4 只有「共 N 則通知」，沒有換頁控制項 | 通知超過 100 則時，第 101 則以後看不到，也不能重送。換頁的操作與狀態要先由 `ui-plan` 設計，再實作 | 上游缺口：`ui-plan` |
| G2 | 矛盾 | MEDIUM | `tasks.md` 待確認 3；F4 | `frontend/src/App.tsx:69`、`:106` 讓管理員登入後進入 `equipment-status`；`ui/plan.md:19` 寫「把管理員登入後的入口改到逾期通知紀錄」，`ui/plan.md:62` 的雛形入口是「前往逾期通知紀錄」；`plan.md:43` 與 `research.md` §7 只寫新增頁籤 | 程式照 `plan.md` 與 `research.md` §7。由 `ui-plan` 決定入口；決定改入口時，再附加修改 `App.tsx` 的任務 | 上游缺口：`ui-plan` |
| G3 | 矛盾 | LOW | `tasks.md` 待確認 1；FR-003；FR-015 | `frontend/src/text/zh-TW.ts:261-264` 寫「無法連線」「通知設定有誤：沒有設定」「Discord 拒絕訊息內容」，和 `data/data-model.dbml:22-25` 的 Enum note 一致；`ui/overdue-notifications.html:307-310` 寫「無法連線到 Discord」「通知設定有誤：沒有設定 Webhook」「Discord 拒絕這則訊息的內容」 | 程式照資料模型。由 `ui-plan` 在 `ui/plan.md` 列出 6 種失敗原因的畫面文字，並統一雛形 | 上游缺口：`ui-plan` |
| G4 | 部分 | LOW | `tasks.md` 待確認 2；FR-015；`notification/plan.md` UC2 | `research.md` §6 的模擬器只有 6 種模式，沒有決定其他 `4xx`、`401`／`403`、`200` 沒有 `id`、沒有等待秒數的 `429` 怎麼驗證；`notification/plan.md:228` 寫以單元測試驗證；`backend/tests/integration/overdueDispatch.test.ts:429-436` 實際用臨時固定回應位址驗證 `message_rejected` | 由 `technical-research` 決定這 4 類回應的驗證方式；決定和目前測試不同時，再附加修改測試的任務 | 上游缺口：`technical-research` |

### 下一步

1. 依 G1、G2、G3 執行 `ui-plan`，依 G4 執行 `technical-research`。
2. 上游處理完成後，再執行一次 `converge`。
3. 本輪沒有「附加任務」，不執行 `tasks` 附加模式。

## 第 2 輪

- **日期**：2026-11-11
- **評估狀態**：程式是 commit `e035de3`；`ui/`、`research.md`、`plan.md` 是 commit `99755c9` 的版本；`tasks.md` 是第 1 輪的版本，不含 `99755c9` 在 Polish 加入的 T040
- **結果**：有缺口（附加任務 1、上游缺口 0、不處理 0）

### 檢查範圍

| 項目 | 數量 | 說明 |
|---|---|---|
| 功能需求 | 21 | FR-001～FR-021 |
| 非功能需求 | 3 | NFR-001～NFR-003 |
| 成功標準 | 7 | SC-001～SC-007 |
| User Story 情境 | 37 | US1 15、US2 16、US3 6 |
| Edge Case | 13 | `spec.md` Edge Cases 的 13 項 |
| 系統介面 | 15 | 和第 1 輪相同 |
| 技術決定 | 8 | `research.md` §1～§8，§6 已補上 4 類回應的驗證方式 |
| 憲法規則 | 1 | `.agents/constitution/shared.md` Rule 1 |
| 任務 | 39 | T001～T039 全部已勾選 |
| 待確認 | 4 | 待確認 1～4 的上游決定都已寫入 `ui/plan.md` 與 `research.md` |
| 前一輪缺口 | 4 | G1 改由 G5 處理；G2、G3、G4 重新確認後已沒有缺口 |

程式範圍：和第 1 輪相同。

前一輪缺口的重新確認：

- G2：`ui/plan.md:19` 已改為「產品中管理員登入後仍進入 007 的『設備狀態管理』」，和 `App.tsx:69`、`:106` 一致。
- G3：`ui/plan.md:122` 列出的失敗原因文字，和 `zh-TW.ts:261-264` 一致。
- G4：`research.md:182` 決定「測試內以 `node:http` 在連接埠 `0` 臨時啟動只回傳固定回應的位址」，和 `overdueDispatch.test.ts:430-433` 一致。

### 缺口

| ID | 缺口類型 | 嚴重度 | 來源 | 證據 | 剩餘工作 | 處理 |
|---|---|---|---|---|---|---|
| G5 | 部分 | HIGH | FR-003；`ui/plan.md` A14；第 1 輪 G1 | `ui/plan.md:100` 的 A14 規定每頁 20 則、清單下方換頁列有「上一頁」「下一頁」，「重新整理」停在目前頁碼，「立即檢查逾期」後回到第 1 頁；`ui/plan.md:117-120` 規定「通知超過一頁」「換頁中」「中間頁」「最後一頁」4 個狀態；`OverdueNotificationsView.tsx:27-28`、`:157-161` 仍固定第 1 頁 100 則，沒有換頁列 | 在通知清單實作 A14 的換頁列與 4 個狀態，查詢改用目前頁碼與每頁 20 則 | 附加任務 |

### 下一步

1. 執行 `tasks` 附加模式，把 G5 附加為新的 Convergence Phase。
2. 執行 `implement`，只跑新的 Phase。
3. 執行第 3 輪 `converge`。
