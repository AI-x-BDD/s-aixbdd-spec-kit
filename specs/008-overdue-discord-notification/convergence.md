# 收斂評估：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查

- **spec 目錄**：`specs/008-overdue-discord-notification/`
- **程式目錄**：`apps/equipment-loan/`
- **輪次**：1

## 第 1 輪

- **日期**：2026-11-20
- **評估狀態**：程式與文件都是 commit `9586fc7`；工作目錄只有未追蹤的 `docs/wb-secret-formula/`，不在程式目錄與 spec 目錄內
- **結果**：有缺口（附加任務 3、上游缺口 0、不處理 0）

### 檢查範圍

| 項目 | 數量 | 說明 |
|---|---|---|
| 功能需求 | 21 | FR-001～FR-021 |
| 非功能需求 | 3 | NFR-001～NFR-003 |
| 成功標準 | 7 | SC-001～SC-007，都是可以實作與量測的項目，沒有排除上線後指標 |
| User Story 情境 | 37 | US1 15、US2 16、US3 6 |
| Edge Case | 13 | `spec.md` Edge Cases 的 13 項 |
| 系統介面 | 15 | `plan.md` 系統介面盤點 F1～F4、B1～B4、D1～D2、S1～S3、N1～N2 |
| 技術決定 | 8 | `research.md` §1～§8；`techstack.md`「本次開發不引入的技術」也對照了前後端 `package.json`，沒有新增套件 |
| 憲法規則 | 1 | `.agents/constitution/shared.md` Rule 1，只約束文件的說明文字，不適用於程式碼與註解；`skills/implement/code.md` 不存在，略過 |
| 任務 | 42 | T001～T042 全部已勾選；勾選不算證據，每個任務都對照程式重新確認。T037～T039 是執行檢查、測試與手動驗證的任務，依 SOP 不執行，只確認指令與測試檔存在。T040～T042 改變 T023 的分頁與載入呈現，依 `tasks.md` Notes 待確認 4 與 T041、T042 的說明，以最終行為評估 |
| 待確認 | 4 | `tasks.md` Notes 待確認 1～4，上游決定都已寫入 `ui/plan.md` 與 `research.md`，程式都已照決定實作 |

程式範圍（依 `plan.md` Source Code 與任務引用的路徑，沒有不存在的路徑）：

- 前端：`frontend/index.html`、`frontend/src/App.tsx`、`frontend/src/api/client.ts`、`frontend/src/text/zh-TW.ts`、`frontend/src/views/OverdueNotificationsView.tsx`、`frontend/src/components/ResendUnknownDialog.tsx`
- 後端：`backend/package.json`、`backend/.env.example`、`backend/src/server.ts`、`backend/src/app.ts`、`backend/src/config/notificationConfig.ts`、`backend/src/integrations/discordWebhookClient.ts`、`backend/src/jobs/overdueScheduler.ts`、`backend/src/services/overdueNotificationService.ts`、`backend/src/routes/adminRouter.ts`、`backend/src/middleware/errorHandler.ts`、`backend/src/middleware/authMiddleware.ts`、`backend/src/utils/taipeiTime.ts`、`backend/scripts/discordWebhookSimulator.ts`
- 資料庫：`backend/prisma/schema.prisma`、`backend/prisma/migrations/20261111000000_overdue_notifications/migration.sql`、`backend/prisma/seed.ts`
- 測試與設定：`backend/tests/integration/overdue*.test.ts`（5 個）、`backend/tests/migration/overdueDiscordNotification.test.ts`、`frontend/tests/unit/overdueNotificationsPaging.test.ts`、`frontend/tests/unit/zh-TW.test.ts`、`playwright.config.ts`、`e2e/support/fixed-clock.mjs`（來自 `specs/bugs/pickup-test-time-dependent/` 的測試修正，只影響 E2E 啟動的後端）、`README.md`、`.gitignore`
- 入口點：後端 5 個 router 的 27 個路由都對應 `contracts/openapi.yaml` 的 operationId；前端 5 個 view 都對應 `plan.md` 的 F1～F4；`schema.prisma` 的 9 個 model 都對應 `data/data-model.dbml` 的資料表；沒有找不到對應的入口點

### 缺口

| ID | 缺口類型 | 嚴重度 | 來源 | 證據 | 剩餘工作 | 處理 |
|---|---|---|---|---|---|---|
| G1 | 部分 | MEDIUM | F1；`ui/plan.md` §2 配色與版面；T023 | `ui/plan.md:51-54` 新增 4 個徽章文字色 `--badge-sending-ink` `#1D4ED8`、`--badge-sent-ink` `#166534`、`--badge-failed-ink` `#B91C1C`、`--badge-unknown-ink` `#92400E`，`ui/plan.md:57` 規定 Light Mode 的 4 種通知狀態徽章文字改用這 4 色，和底色的對比在 WCAG AA 4.5:1 以上；雛形 `ui/overdue-notifications.html:26-29`、`:105-108` 已改用。`frontend/src/views/OverdueNotificationsView.tsx:637-640` 的徽章文字仍用 `--primary`、`--success`、`--danger`、`--pending`，`frontend/index.html:12-22` 也沒有定義這 4 個顏色 | 在前端定義 4 個 Light Mode 徽章文字色，`.odn-badge-sending`、`.odn-badge-sent`、`.odn-badge-failed`、`.odn-badge-unknown` 的文字改用它們；底色、邊框、Dark Mode（`OverdueNotificationsView.tsx:643` 沿用 `--ink`）與其他元件不變 | 附加任務 |
| G2 | 部分 | MEDIUM | D1；`data/data-model.dbml` `Table overdue_notifications` 的 `updated_by`；`notification/plan.md` §6；T011 | `data/data-model.dbml:85` 規定送出程序與恢復處理修改時 `updated_by` 為 null，`notification/plan.md:239` 寫「S1、S2、S3 寫入時為空」，`tasks.md:139` 的 T011 寫「`updated_by` 為空」。`backend/src/services/overdueNotificationService.ts:185` 重送時寫入管理員 ID，但 `backend/src/jobs/overdueScheduler.ts:52-56` 的領取、`:88-150` 的結果更新與 `:43-47` 的恢復處理都沒有寫 `updated_by`（只有 `:87` 的註解提到），重送後由送出程序更新的通知仍保留管理員 ID | 送出程序領取通知、寫入送出結果，以及恢復處理改為 `unknown` 時，都把 `updated_by` 設為 null | 附加任務 |
| G3 | 部分 | MEDIUM | `research.md` §5 設定驗證；`notification/plan.md` §6「Webhook 位址設定錯誤」；T006；FR-015；NFR-003 | `research.md:139` 規定啟動時以 zod 4 驗證三個設定，`notification/plan.md:242` 規定啟動時 `DISCORD_WEBHOOK_URL` 空白或格式錯誤要寫 log。`backend/src/config/notificationConfig.ts:23-35` 只在讀取位址時驗證並寫 log，唯一的呼叫端是 `backend/src/integrations/discordWebhookClient.ts:94` 的 `send`；`backend/src/jobs/overdueScheduler.ts:225-234` 的 `start()` 只讀 `getSchedulerConfig()`，沒有驗證位址。位址沒有設定時，要等到第一則通知送出才寫 log | 後端啟動時（`start()` 或 `server.ts`）驗證一次 `DISCORD_WEBHOOK_URL`，沒有設定或格式錯誤時寫固定文字的 log，不寫輸入值；保留每次送出時重新讀取環境變數（T006 的整合測試需求） | 附加任務 |

### 下一步

1. 執行 `tasks` 附加模式，把 G1、G2、G3 附加為新的 Convergence Phase。
2. 執行 `implement`，只跑新的 Phase。
3. 執行第 2 輪 `converge`。
4. 本輪沒有上游缺口，不需要執行其他上游 Skill。
