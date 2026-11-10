# 一致性分析報告：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

- **Spec 目錄**：`specs/008-overdue-discord-notification/`
- **分析日期**：2026-11-11
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/overdue-notifications.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | 涵蓋 | HIGH | `plan.md` → `S1`、`S2`、`S3`；`research.md` → `2. 逾期檢查與通知送出的排程方式` | 已記錄：tasks.md 待確認 1。排程 S1 逾期自動檢查、S2 送出與自動重試、S3 恢復運作處理沒有任何 Planner 產出（plan.md Wave 3 沒有 Planner 可委派）；這 3 個介面承載 P1 的 FR-001、FR-002、FR-014、FR-016、FR-021 與 SC-001、SC-003，T010、T012、T013 只能依 research §2、§3 的文字決策與 `Table overdue_notifications` 的欄位說明實作，狀態轉換、領取語句與恢復條件沒有可驗證的介面規格 | 為 S1～S3 補一份排程規格：列出每個排程函式的觸發時機、輸入的 `now`、讀寫的欄位、`overdue_notification_status` 的狀態轉換表與重疊執行的處理，放在 spec 目錄並在 `plan.md` 系統介面盤點標出 S1～S3 的產出位置；補齊後由 `tasks` 把 T010、T012、T013 的 Must Read 改指向該規格 | 需要使用者決定（候選：`system-analysis`、`technical-research`） |
| E2 | 涵蓋 | HIGH | `plan.md` → `N1`；`spec.md` → `FR-013`；`research.md` → `3. 呼叫 Discord Webhook 與送出結果分類` | 已記錄：tasks.md 待確認 2。N1 Discord Webhook 逾期通知送出沒有 Planner 產出：沒有 Discord 請求與回應的外部 API 規格，也沒有定義 FR-013 通知文字的版面與「已逾期多久」的單位與格式；T009、T011 只能依 research §3 的結果分類表與 tasks Notes 的暫行格式實作 | 為 N1 補一份外部介面規格：寫出 Execute Webhook 的請求（`?wait=true`、`allowed_mentions`）、各回應對應的分類與 `overdue_notification_failure_reason`，以及通知文字的逐行版面與「已逾期多久」的格式範例；補齊後由 `tasks` 把 T009、T011 的 Must Read 改指向該規格 | 需要使用者決定（候選：`system-analysis`、`technical-research`） |
| F1 | 不一致 | HIGH | `contracts/openapi.yaml` → `listOverdueNotifications`；`ui/plan.md` → `共 8 則通知`；`ui/overdue-notifications.html` → `count-text` | 已記錄：tasks.md 待確認 4。合約依憲法 `skills/api-plan/openapi.md` Rule 1 以 `page`、`pageSize`（預設 20、上限 100）分頁回傳 `OverdueNotificationPage`；`ui/plan.md` 與雛形沒有分頁控制，只顯示「共 N 則通知」。通知超過一頁時畫面看不到之後的通知，違反 FR-003「列出每則逾期通知」；tasks T024 的暫行做法 `pageSize=100` 在超過 100 則時仍看不到 | 以合約為準（合約遵循憲法「必須」規則），在 `ui/plan.md` §3.3 新增換頁操作、§4 新增「第 2 頁」與「最後一頁」狀態，並在 `ui/overdue-notifications.html` 的通知清單下方加上分頁控制與對應的雛形狀態；補齊後由 `tasks` 更新 T024 並刪除待確認 4 | `ui-plan` |
| F2 | 不一致 | HIGH | `ui/plan.md` → `把管理員登入後的入口改到逾期通知紀錄`；`plan.md` → `App.tsx` | 已記錄：tasks.md 待確認 5。`ui/plan.md` §1 寫管理員登入後的入口改到逾期通知紀錄；`plan.md` Source Code 對 `App.tsx` 只寫新增「逾期通知紀錄」管理員頁籤，沒有改變登入後的預設畫面，而既有 E2E 依賴管理員登入後先進「設備狀態管理」。兩份文件會讓實作做出不同的登入後畫面 | 若入口只適用雛形，在 `ui/plan.md` §1 改寫為「雛形的 `index.html` 只連到逾期通知紀錄；產品維持 007 的登入後畫面」；若產品也要改入口，在 `plan.md` Source Code 的 `App.tsx` 寫明預設畫面改變，並由 `tasks` 補更新既有 E2E 登入步驟的任務 | 需要使用者決定（候選：`ui-plan`、`system-analysis`） |
| E3 | 涵蓋 | MEDIUM | `plan.md` → `N2`；`research.md` → `6. 本機 Discord Webhook 模擬器` | 已記錄：tasks.md 待確認 3。N2 本機 Discord Webhook 模擬器沒有 Planner 產出：Webhook 端點與 `/__sim/*` 控制端點沒有合約，T015、T032、T033～T035 只能依 research §6 的模式表實作，控制端點的錯誤回應由 tasks Notes 暫定 | 為 N2 補一份控制端點規格：列出 `GET /__sim/state`、`PUT /__sim/mode`、`GET /__sim/messages`、`DELETE /__sim/messages` 的請求、回應與錯誤回應，以及 6 種模式的回應內容；補齊後由 `tasks` 把 T015 的 Must Read 改指向該規格 | 需要使用者決定（候選：`system-analysis`、`technical-research`） |
| F3 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `resendOverdueNotification` 的 `RESOURCE_NOT_FOUND`；`ui/plan.md` → `5. 驗證與錯誤回饋` | 合約的重送在通知不存在時回應 `404`（`RESOURCE_NOT_FOUND`），`ui/plan.md` §5 沒有對應的畫面回饋；tasks T026 也只處理 `202` 與 `409`，收到 `404` 時畫面行為沒有定義 | 在 `ui/plan.md` §5 新增「重送時通知不存在」情境（例如紅色橫幅說明通知已不存在並重新拉取清單），並在 `ui/overdue-notifications.html` 加上對應的雛形狀態；補齊後由 `tasks` 在 T026 加上 `404` 的處理 | `ui-plan` |
| F4 | 不一致 | MEDIUM | `ui/overdue-notifications.html` → `無法連線到 Discord`；`data/data-model.dbml` → `Enum overdue_notification_failure_reason`；`ui/plan.md` → `5. 驗證與錯誤回饋` | 雛形的失敗原因文字 `無法連線到 Discord`、`通知設定有誤：沒有設定 Webhook`、`Discord 拒絕這則訊息的內容`，與 `Enum overdue_notification_failure_reason` 的說明、research §1 及 tasks T023 的 `無法連線`、`通知設定有誤：沒有設定`、`Discord 拒絕訊息內容` 不同，可以一一對應；`ui/plan.md` §5 只寫出 6 種失敗原因中的 3 種 | 以 `data/data-model.dbml` 與 research §1 的文字為準，把雛形 `failureReasons` 的 3 個文字改成相同寫法，並在 `ui/plan.md` §5 補上 `connection_failed`、`webhook_not_configured`、`message_rejected` 的畫面回饋 | `ui-plan` |
| B1 | 歧義 | MEDIUM | `spec.md` → `通知送出中或結果不明時借用被歸還`；`research.md` → `dispatchDueNotifications` | Edge Cases 寫「通知的狀態不變」，沒有說明「送出中」且正在等待自動重試的通知，在借用歸還後是否仍要送出；research §2 的送出程序不檢查預約狀態，會繼續重試並把通知改成「送出成功」，和「狀態不變」的字面意思不同 | 在 `spec.md` 的 Edge Cases 寫明等待自動重試時借用被歸還的處理（繼續送出，或停止送出並維持原狀態），必要時新增對應的驗收情境 | `clarify-over-specs` |
| A1 | 重複 | LOW | `spec.md` → `NFR-001`、`SC-005` | NFR-001 與 SC-005 都寫「逾期借用在 100 筆以內時，手動逾期檢查從點擊到顯示建立的通知數低於 2 秒」，內容相同 | 保留 NFR-001 為需求，把 SC-005 改寫為引用 NFR-001 的量測結果，或刪除其中一條 | `s-specify` |

超過 50 筆的部分：無（共 9 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T013、T014、T032、T033 | 見 E1 |
| FR-002 | 是 | T010、T013、T014 | 見 E1 |
| FR-003 | 是 | T003、T004、T019、T021、T022、T023、T024 | 見 F1 |
| FR-004 | 是 | T019、T021、T022、T024 | |
| FR-005 | 是 | T012、T020、T021、T022、T026、T036 | 見 F3 |
| FR-006 | 是 | T023、T025、T026 | |
| FR-007 | 是 | T018、T020、T023、T026 | |
| FR-008 | 是 | T018、T019、T020、T023、T024、T026 | 見 B1 |
| FR-009 | 是 | T028、T029、T031 | |
| FR-010 | 是 | T028、T029、T030、T031 | |
| NFR-001 | 是 | T028、T031、T037 | 見 A1 |
| FR-011 | 是 | T010 | |
| FR-012 | 是 | T005、T006、T010、T028、T031、T034 | |
| FR-013 | 是 | T011 | 見 E2 |
| FR-014 | 是 | T009、T012、T015、T035 | 見 E1、E2 |
| FR-015 | 是 | T008、T009、T012、T015、T035 | 見 E2 |
| FR-016 | 是 | T009、T012、T015、T035 | 見 E1、E2 |
| FR-017 | 是 | T005、T009、T012、T019 | |
| FR-018 | 是 | T010、T012、T020、T026、T028、T034 | |
| FR-019 | 是 | T003、T021、T023、T024、T028、T039 | |
| FR-020 | 是 | T003、T005、T006、T007、T016、T017、T027、T032、T039 | 見 F2 |
| FR-021 | 是 | T005、T013、T035 | 見 E1 |
| NFR-002 | 是 | T003、T004、T011、T018、T023、T024、T025、T030、T041 | 見 F4 |
| NFR-003 | 是 | T001、T002、T005、T008、T009、T015、T018、T019、T024、T032、T038 | |
| SC-001 | 是 | T013、T033 | 見 E1 |
| SC-002 | 是 | T010、T033、T034 | |
| SC-003 | 是 | T012、T015、T035 | 見 E1、E3 |
| SC-004 | 是 | T020、T036 | |
| SC-005 | 是 | T031、T037 | 見 A1 |
| SC-006 | 是 | T008、T009、T038 | |
| SC-007 | 是 | T016、T017、T021、T039 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 管理員「逾期通知紀錄」頁籤的通知清單與狀態篩選介面 | 前端 | `ui/plan.md` → §1、§3.3 A6、A7、A11、§4、§5；`ui/overdue-notifications.html` | T003、T004、T022、T023、T024、T025、T026 | 見 F1、F4 |
| F2 通知重送操作與「結果不明」確認視窗介面 | 前端 | `ui/plan.md` → §1、§3.3 A8、A9、A10、§4、§5；`ui/overdue-notifications.html` | T003、T004、T022、T023、T024、T025、T026 | 見 F3 |
| F3 「立即檢查逾期」操作與建立數量提示介面 | 前端 | `ui/plan.md` → §1、§3.3 A12、§4；`ui/overdue-notifications.html` | T003、T004、T029、T030、T031 | |
| F4 前五版成員與管理員既有畫面（登入、設備預約、我的預約、管理員總覽） | 前端 | `ui/plan.md` → §1、§3.1；`ui/index.html`（只有登入，其餘畫面沿用 007 的 `ui/`） | T003、T004 | 見 F2 |
| B1 逾期通知紀錄查詢 API | 後端 | `contracts/openapi.yaml` → `listOverdueNotifications` | T018、T019、T020、T021 | 見 F1；涵蓋盤點沒有比對到合約（見統計下方說明） |
| B2 通知重送 API | 後端 | `contracts/openapi.yaml` → `resendOverdueNotification` | T018、T019、T020、T021 | 見 F3；涵蓋盤點沒有比對到合約 |
| B3 手動逾期檢查 API | 後端 | `contracts/openapi.yaml` → `runOverdueCheck` | T028 | 涵蓋盤點沒有比對到合約 |
| B4 前五版既有 API（驗證碼登入、設備與時段、預約、改期、審核、領取歸還、設備狀態） | 後端 | `contracts/openapi.yaml` → `createCaptchaChallenge` 等 24 個 operation | T008、T009、T010、T011、T012、T013、T014、T015、T016 | 涵蓋盤點沒有比對到合約；任務由 US1 的「後端（S1–S3、N1、N2、B4）」組帶入 |
| D1 逾期通知紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table overdue_notifications` | T005、T006、T007、T017 | |
| D2 前五版帳號、設備、固定時段、預約借還、改期與設備狀態變更資料存取與無損遷移 | 資料庫 | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions`、`Table equipments`、`Table equipment_status_changes`、`Table time_slots`、`Table reservations`、`Table reschedule_requests` | T005、T006、T007、T017、T027 | |
| S1 逾期自動檢查排程 | 排程 | 無 | T008、T009、T010、T011、T012、T013、T014、T015、T016 | 見 E1；涵蓋盤點把 `ui/plan.md` §1「不在範疇」提到 S1 算成產出 |
| S2 通知送出與自動重試程序 | 排程 | 無 | T008、T009、T010、T011、T012、T013、T014、T015、T016 | 見 E1；同 S1 |
| S3 系統恢復運作時中斷通知的處理 | 排程 | 無 | T008、T009、T010、T011、T012、T013、T014、T015、T016 | 見 E1；同 S1 |
| N1 Discord Webhook 逾期通知送出 | 通知服務 | 無 | T008、T009、T010、T011、T012、T013、T014、T015、T016 | 見 E2；同 S1 |
| N2 本機 Discord Webhook 模擬器 | 通知服務 | 無 | T008、T009、T010、T011、T012、T013、T014、T015、T016 | 見 E3 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/`、`data/`、`tasks.md` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 3 時間點與純日期欄位必須分別使用 timestamptz 與 date 型別 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 4 唯一性約束與業務歷程保留必須明確定義 | `data/data-model.dbml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 page 與 pageSize 分頁 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 4 page 超過總頁數時必須回應空的 items | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 6 需要驗證身分或權限的 operation 必須分別定義 401 與 403 錯誤回應 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 7 時間點與純日期欄位必須使用 ISO 8601 格式並以 Asia/Taipei 為業務時區 | `contracts/openapi.yaml` | 通過 | — |

## 5. 沒有對應需求的任務

- T040（Phase 6 Polish）：在 `backend/` 與 `frontend/` 執行 `npm run check`（`tsc --noEmit`、ESLint 10、`prettier --check`）並修正所有錯誤。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 31 |
| 有任務的需求數 | 31 |
| 涵蓋率 | 100% |
| 任務總數 | 41 |
| 介面總數 | 15 |
| 沒有 Planner 產出的介面數 | 5 |
| 沒有任務的介面數 | 0 |

說明：「沒有 Planner 產出的介面數」取自涵蓋盤點。涵蓋盤點判定的 5 個介面是 B1～B4、N2：合約的 `tags` 以「`tags:` 下一行同縮排的 `- `」寫成，涵蓋盤點沒有讀到，所以 B1～B4 沒有比對到合約；S1～S3、N1 被 `ui/plan.md` §1「不在範疇」的文字比對成有產出。依上游文件的實際內容，沒有 Planner 產出的介面是 S1、S2、S3、N1、N2，數量同樣是 5。

## 7. 下一步

- 沒有 CRITICAL 問題，可以繼續 `implement`。
- 建議先處理 HIGH 問題：E1、E2 需要使用者決定由 `system-analysis` 或 `technical-research` 補排程與 Discord 介面規格；F1 用 `ui-plan` 補分頁設計；F2 需要使用者決定以 `ui-plan` 或 `system-analysis` 為準。處理後用 `tasks` 更新對應任務的 Must Read 與 Notes 待確認，再重新執行 `analyze`。
- 建議一併處理 E3、F3、F4、B1；A1 可以之後再處理。
