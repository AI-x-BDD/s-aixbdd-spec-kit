# 迭代 3：管理員登記領取與歸還，成員查看借用狀態

- spec 目錄：`specs/005-equipment-pickup-return/`
- 上一次 spec 目錄：`specs/004-equipment-approval-review`
- 執行者：OpenCode＋Gemini 4 Argon
- 開始／結束：2026-11-09／2026-11-09

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | steve-10（macOS） |
| 執行工具與版本 | OpenCode 1.19.5，Build agent |
| 模型與 effort | Gemini 4 Argon，high |
| Skill 版本（開始時） | `fce38b1` |
| 中途變動 | 2026-11-09 跨機接續至 `stevedeMac-mini（macOS）`（OpenCode 1.19.5 Build agent、Gemini 4 Argon high、接續時 commit `b0805b5`），從步驟 6（`tasks`）接續 |
| 臨時改寫的提示詞 | 沒有 |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-3.md` | 貼 P0 開始第 3 次迭代 | 沒有 | — |
| 2 | `s-specify` | `specs/005-equipment-pickup-return/spec.md` | 回答 `clarify` 3 題（皆採推薦選項） | 第 5 節第 3 列觀察規則（「預約與借用的狀態轉移限制」）已在第 1、2 題主動問到；含 6 條推定需求（FR-004、FR-005、FR-007、FR-009、NFR-001、NFR-002，含沿用之 SC-004、SC-005）與 1 項推定排除範圍（Out of Scope），已記錄於此 | `a3ea247` |
| 3 | `clarify-over-specs` | 更新 `specs/005-equipment-pickup-return/spec.md` | 回答 2 輪共 5 題（皆採推薦選項） | 沒有（全部 7 項推定項目皆已確認並從 Assumptions／Out of Scope 移除推定標記；技術實作問題列為 Deferred） | `a3ea247` |
| 4 | `technical-research` | `specs/005-equipment-pickup-return/research.md`、`specs/005-equipment-pickup-return/techstack.md` | 提供技術限制 | 沒有（5 個主題皆針對本次新增的 6 態借還狀態、領取當日時段時間窗、逾時歸還、領取後禁取消及雙重部分唯一索引升級給出明確決策與獨立依據，未直接照抄上一次結論） | `ed0f842` |
| 5 | `system-analysis`（含 `ui-plan`、`api-plan`、`data-plan`） | `plan.md`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/admin.html`、`contracts/openapi.yaml`、`data/data-model.dbml` | 指定沿用 `004` 的專案結構與 `003` 的視覺風格 | 沒有（三個 Planner 檢查腳本 `check_ui.py`、`check_contracts.py`、`check_data_model.py` 與 64 個雛形狀態瀏覽器檢查皆 `ok: true`、0 issues；API 與 UI 對可領取、可歸還、可取消狀態定義一致；本次無標為「沒有 Planner」的端點） | `ed0f842` |
| 6 | `tasks` | `specs/005-equipment-pickup-return/tasks.md` | 觸發執行 | 沒有；包含舊資料無損遷移與回歸任務（T004、T005、T009、T011、T014、T020、T021、T023）、擴充 demo seed 任務（T006、T009、T023），Notes 待確認共 2 項（欄位命名轉換），`check_tasks.py` 0 issues、0 warnings | `9de6716` |
| 7 | `analyze` | `specs/005-equipment-pickup-return/analysis.md` | 觸發執行 | 沒有；CRITICAL 0 筆、HIGH 0 筆、MEDIUM 2 筆（F1 由 `api-plan` 或 `data-plan` 處理，F2 由 `api-plan`、`data-plan` 或 `s-specify` 處理）、LOW 0 筆；12 條憲法規則全部通過，需求與介面涵蓋率 100% | `9de6716` |
| 8 | `implement` | `apps/equipment-loan/`（6 態與雙重部分唯一索引無損遷移、13 筆 6 態 demo seed、前後端領取／歸還／目前借用中與 6 態時段功能、Vitest／Supertest／Playwright 測試、`README.md`）、更新 `tasks.md`（23/23 完成） | 觸發執行 | 沒有 Skill 問題；受阻任務 0 個，自行決策 3 條（見下節），全套單元、整合與 E2E 測試全部通過 | `ced1d31`、`fdb1203`、`acbe3b6`、`20cc960`、`fa51574`、`8bdd455` |
| 9 | （使用者驗證） | 更新 `docs/iterations/iter-3.md`「使用者驗證」 | 委派代理啟動前後端並以雙瀏覽器視窗實際跑完 9 個情境驗證 | 沒有（成功操作 1～4、關鍵失敗 1～3、前幾次功能回歸 1～2 共 9 個情境全部通過，並已重設 demo seed） | `8bdd455` |
| 10 | （檢查 Skill 表現） | 更新 `docs/iterations/iter-3.md`「Skill 表現檢查」 | 觸發執行 | 沒有（11 支相關 Skill 皆照預期運作，無發現具有證據的 Skill 缺陷） | 見步驟 12 commit |
| 12 | （收尾） | 更新 `docs/iterations/iter-3.md`「流程不足」與「影片素材清單」並提交 | 觸發執行 | 沒有 | 見本次 commit |

### 步驟 8 `implement` 受阻任務與自行決策紀錄

- **受阻任務**：無（0 個）。
- **自行決策紀錄**：

| 任務 | 情況 | 決定 | 理由 | 影響範圍 |
|---|---|---|---|---|
| T006、T014、T016 | `data/data-model.dbml` 的 `time_slots.slot_code` 註解為小寫（`morning`、`afternoon`、`evening`）且 `equipments.status` 為 Enum（`available`、`unavailable`），而 `contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` 為大寫（`MORNING`、`AFTERNOON`、`EVENING`）且 `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` 使用布林欄位 `isActive` | 沿用 `tasks.md` 待確認 1：資料庫維持 `data-model.dbml` 的小寫 `slot_code` 與 `status` Enum，於後端 `equipmentService.ts` 轉換為大寫 `slotCode` 與 `isActive: eq.status === "available"` | 兩份文件同屬權威 2，且 `tasks.md` 待確認 1 已明定暫行做法，維持雙方對外契約 | `apps/equipment-loan/backend/prisma/seed.ts`、`apps/equipment-loan/backend/src/services/equipmentService.ts` |
| T008（Phase 2 Checkpoint） | T004／T005 將 Prisma `reservation_status` Enum 擴充為 6 個值（新增 `checked_out`、`returned`）並重新產生 Prisma Client，既有 `reservationService.ts` 的 `ReservationStatus` 聯合型別與 `getStatusZhLabel` 仍為 4 個值，導致 Phase 2 Checkpoint 執行後端 `tsc --noEmit` 時報錯 | 在 Phase 2 Checkpoint 同步將 `reservationService.ts` 的 `ReservationStatus` 聯合型別與 `getStatusZhLabel` 擴充為 6 個值 | 依 `implement/rules/任務驗證-格式規範.md` Rule 2，Foundational Checkpoint 必須讓前後端型別檢查與 lint 通過 | `apps/equipment-loan/backend/src/services/reservationService.ts` |
| T010、T013、T017 | 預約編號與領取／歸還經手管理員欄位在 `spec.md`（`checked_out_by_user_id`、`returned_by_user_id`）、`data/data-model.dbml`（`reservation_no`、`checked_out_by`、`returned_by`）與 `contracts/openapi.yaml`（`reservationNumber`、`checkedOutByUserId`、`checkedOutByUsername`、`checkedOutByName`、`returnedByUserId`、`returnedByUsername`、`returnedByName`）命名不同 | 沿用 `tasks.md` 待確認 2：資料庫層使用 `data-model.dbml` 的 `reservation_no`、`checked_out_by`、`returned_by`，並在後端 `reservationService.ts` 的 `toReservationDto()` 與 `toAdminReservationDto()` join `users` 映射為 `openapi.yaml` 的回應欄位 | `tasks.md` 待確認 2 已明定暫行做法，且完全滿足 `spec.md` FR-001、FR-004、FR-005、FR-006 與權威 2 的資料表及 API 合約 | `apps/equipment-loan/backend/src/services/reservationService.ts` |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| `clarify` | 依呼叫者指定的面向與題數上限（單輪最多 3 題），直接於對話輸出 `Context`、`總結之提問` 與含推薦理由的 Markdown `Options` 表格，不使用 Ask 工具 | 於 `s-specify`（1 輪 3 題）與 `clarify-over-specs`（2 輪 5 題）中皆按樣板直接輸出表格並標明推薦理由 | 沒有問題 | `specs/005-equipment-pickup-return/spec.md` `## Clarifications`（commit `a3ea247`） |
| `s-specify` | 主動詢問第 5 節第 3 列觀察規則（「預約與借用的狀態轉移限制」），切分可獨立驗證的 User Story，並將 AI 預設值標為推定需求 | 第 1 輪 `clarify` 第 1、2 題即主動問出「嚴格單向狀態流（`confirmed` → `checked_out` → `returned`）、領取後不可取消」與「領取限當日且時段結束前、歸還不限時段結束前後」；切出 US1～US3、FR-001～FR-009、NFR-001～NFR-002、SC-001～SC-005 並列出 7 項推定項目 | 沒有問題 | `specs/005-equipment-pickup-return/spec.md`（commit `a3ea247`） |
| `clarify-over-specs` | 以 10 類分類表掃描 `spec.md`，每題標出分類、分輪提問（最多 5 題），統一術語並把決策寫回對應段落，移除已確認的推定標記，實作問題標為 Deferred | 分 2 輪提問 5 題（涵蓋領域與資料模型、互動與 UX 流程、功能範圍與行為、術語與一致性、非功能品質屬性），統一 6 種標準狀態名稱與代碼，消除全部 7 項推定標記，並將技術實作問題標為 Deferred | 沒有問題 | `specs/005-equipment-pickup-return/spec.md`（commit `a3ea247`） |
| `technical-research` | 沿用 `004` 的 `techstack.md`，針對本次新增技術主題給出明確決策與獨立依據（不直接照抄上一次結論） | 產出 `research.md`（5 個主題：6 態與雙重部分唯一索引無損升級、當日時段領取時間窗與領取後禁取消交易、頁頂借用中醒目區塊與 6 態時段標示、管理員權限攔截、逾時歸還測試與 6 態 demo seed 擴充）與 `techstack.md` | 沒有問題 | `specs/005-equipment-pickup-return/research.md`、`techstack.md`（commit `ed0f842`） |
| `system-analysis` | 盤點前端、後端、資料庫介面並涵蓋所有需求與 User Story，排定 Wave，沿用指定專案結構與視覺風格並依 Wave 委派 Planner | 盤出 `F1`～`F4`、`B1`～`B6`、`D1`～`D2` 共 12 個介面，16 個需求編號與 US1～US3 零缺漏，並依 Wave 1、Wave 2 完成委派 | 沒有問題 | `specs/005-equipment-pickup-return/plan.md`（commit `ed0f842`） |
| `ui-plan` | 依 `F1`～`F4` 與沿用的視覺風格產出 `ui/plan.md` 與可互動 HTML 雛形，通過 `check_ui.py` 與瀏覽器檢查 | 產出 `ui/plan.md` 與 `index.html`、`booking.html`、`my-reservations.html`、`admin.html`；`check_ui.py` `ok: true`（0 issues），並通過全部 64 個雛形狀態與雙主題切換零錯誤驗證 | 沒有問題 | `specs/005-equipment-pickup-return/ui/`（commit `ed0f842`） |
| `api-plan` | 依 `B1`～`B6` 與憲法 `openapi.md` Rule 1–7 產出 `contracts/openapi.yaml` 並通過 `check_contracts.py` | 產出 17 個 operation，完整遵循分頁 Rule 1–5、`401`/`403` Rule 6、時間時區 Rule 7，API 與 UI 對可領取、可歸還、可取消狀態定義一致，`check_contracts.py` `ok: true`（0 issues） | 沒有問題 | `specs/005-equipment-pickup-return/contracts/openapi.yaml`（commit `ed0f842`） |
| `data-plan` | 依 `D1`～`D2` 與憲法 `data-model.md` Rule 1–4 產出 `data/data-model.dbml` 並通過 `check_data_model.py` | 產出 6 張資料表與 3 個 Enum，完整定義 `reservation_status` 6 種狀態、領取／歸還稽核欄位與升級後的雙重部分唯一索引（`uq_reservations_active_slot`、`uq_reservations_user_active_request`），`check_data_model.py` `ok: true`（0 issues） | 沒有問題 | `specs/005-equipment-pickup-return/data/data-model.dbml`（commit `ed0f842`） |
| `tasks` | 拆解任務與 Must Read／Optional 參考，包含舊資料遷移、舊功能回歸與擴充 demo seed 任務，將上游命名差異記為 Notes 待確認並通過 `check_tasks.py` | 產出 `T001`～`T023`（含無損遷移與回歸任務 `T004`、`T005`、`T009`、`T011`、`T014`、`T020`、`T021`、`T023` 及擴充 demo seed 任務 `T006`、`T009`、`T023`），記錄 `待確認 1`、`待確認 2`，`check_tasks.py` 0 issues、0 warnings | 沒有問題 | `specs/005-equipment-pickup-return/tasks.md`（commit `9de6716`） |
| `analyze` | 不修改上游文件，執行 `collect_coverage.py` 並檢查跨文件一致性與 12 條憲法規則 | 產出 `analysis.md`（0 CRITICAL、0 HIGH、2 MEDIUM F1～F2、0 LOW），12 條憲法規則與 16 項需求、12 個介面涵蓋率皆 100% | 沒有問題 | `specs/005-equipment-pickup-return/analysis.md`（commit `9de6716`） |
| `implement` | 依 `tasks_state.py` 順序逐一實作、驗證與打勾，執行各 Phase Checkpoint 驗證，對上游差異自主決策並輸出完成報告 | 完成 `23/23` 任務（受阻 0 個），記錄 3 條自主決策，全套單元、整合（Vitest + Supertest）與 Playwright E2E 測試全部通過 | 沒有問題 | `specs/005-equipment-pickup-return/tasks.md`、`apps/equipment-loan/`（commit `ced1d31`～`8bdd455`） |

## Skill 問題（交給 skill-engineering）

沒有（本次迭代 11 支相關 Skill 皆照預期運作，無發現具有證據的 Skill 缺陷；Wave 2 平行 Planner 的欄位命名映射記於下方「流程不足」）。

## 使用者驗證

- commit SHA：`8bdd455`
- 啟動方式（從乾淨環境開始的指令）：
  ```bash
  # 1. 進入應用程式目錄
  cd apps/equipment-loan

  # 2. 安裝依賴與準備環境變數
  npm install
  npm --prefix backend install
  npm --prefix frontend install
  cp -n backend/.env.example backend/.env || true

  # 3. 啟動 PostgreSQL 18 容器、執行無損 migration 與載入擴充後 6 態 demo seed
  docker compose up -d --wait
  npm run db:migrate
  npm run db:seed

  # 4. 啟動後端（埠號 3000）與前端（預設 5173；若本機 5173 已被其他專案占用，可加 -- --port 5183）
  npm --prefix backend run dev
  npm --prefix frontend run dev -- --port 5183
  ```
  啟動後：
  - **一般視窗（成員視角：林雅婷 `lin.yating`／陳冠廷 `chen.guanting`）**：開啟 `http://localhost:5183`（或 `http://localhost:5173`）
  - **無痕視窗（管理員視角：吳承翰 `wu.chenghan`）**：開啟同一網址
- demo seed 重設展示資料指令（已實跑確認可隨時重設 3 組預建帳號、4 台含審核設定的單件設備、3 個單日固定時段與涵蓋全部 6 種狀態的 13 筆範例借還紀錄）：
  ```bash
  npm --prefix apps/equipment-loan run db:seed
  ```
- 本次驗證情境：

| 類別 | 情境名稱 | 操作步驟 | 預期結果 |
| --- | --- | --- | --- |
| 成功操作 1 | 管理員對當日未結束「已核准／有效」預約單鍵執行「登記領取」轉為「借用中」 | 1. 無痕視窗以管理員吳承翰（`wu.chenghan`）點擊「帶入帳號」並登入，進入「審核與借用管理」。<br>2. 在下方「全體預約與借用管理清單」點擊快速篩選頁籤「已核准／有效（待領取）」。<br>3. 找到當日晚間 `18:00–21:00` 尚未結束的 `RV-20261108-06`（林雅婷，`EQ-103 高精度工業熱像儀 FLIR E86`），點擊「登記領取」按鈕。 | 1. 頁頂顯示綠色成功橫幅「已完成登記領取！預約編號 RV-20261108-06…狀態已更新為『借用中』，記錄領取時間…與領取經手管理員吳承翰 (wu.chenghan)」。<br>2. 該列狀態徽章更新為湖水青藍「借用中」，記錄領取時間與經手人吳承翰，且操作按鈕切換為「登記歸還」。 |
| 成功操作 2 | 成員在「我的預約」頁頂「目前借用中設備」醒目區塊與 6 態清單查看借用狀態 | 1. 一般視窗以成員林雅婷（`lin.yating`）點擊「帶入帳號」並登入，點擊頂部導覽「我的預約」。<br>2. 檢視頁面頂部「目前借用中設備」醒目區塊。<br>3. 切換下方 6 態篩選頁籤（全部紀錄／待審核／已核准／有效／借用中／已歸還／已駁回／已取消），檢視 `RV-20261108-03`（借用中）與 `RV-20261108-01`（已歸還）的領取與歸還稽核資訊。 | 1. 頁頂「目前借用中設備」醒目區塊清楚列出林雅婷目前所有處於「借用中」的設備（`RV-20261108-03`，以及若已執行成功操作 1 則一併顯示 `RV-20261108-06`）、設備編號、預約日期、固定時段、領取時間與領取經手管理員吳承翰。<br>2. 下方清單切換至「已歸還」時，完整顯示 `RV-20261108-01` 的領取時間、歸還時間與經手管理員吳承翰。 |
| 成功操作 3 | 成員與其他成員在「設備預約」頁面檢視單日固定時段 6 態狀態（本人借用中／本人已歸還 vs 他人已被預約） | 1. 在林雅婷視窗點擊頂部導覽「設備預約」，點選今日日期標籤（`今日`）。<br>2. 檢視 `EQ-101` 下午時段（`RV-20261108-03`）、`EQ-102` 上午時段（`RV-20261108-01`）與 `EQ-104` 上午時段（陳冠廷 `RV-20261108-02`）的徽章。<br>3. 切換以另一位成員陳冠廷（`chen.guanting`）登入並點選今日日期，檢視同一批設備時段。 | 1. 林雅婷視角：`EQ-101` 下午顯示湖水青藍「本人借用中」、`EQ-102` 上午顯示青松綠「本人已歸還」、`EQ-104` 上午顯示中性灰「已被預約」。<br>2. 陳冠廷視角：林雅婷處於「借用中」的 `EQ-101` 下午與處於「已歸還」的 `EQ-102` 上午，對陳冠廷皆統一顯示為「已被預約」且不揭露林雅婷身分，並禁止重複預約。 |
| 成功操作 4 | 管理員對時段內「借用中」與逾時未還「借用中」紀錄單鍵執行「登記歸還」 | 1. 在管理員視窗點擊快速篩選頁籤「借用中（待歸還）」。<br>2. 對當日下午借用中紀錄 `RV-20261108-03`（林雅婷，`EQ-101`）點擊「登記歸還」。<br>3. 對前一日晚間逾時未還借用中紀錄 `RV-20261107-05`（陳冠廷，`EQ-103`，標示「借用中（逾時未還）」）點擊「登記歸還」。 | 1. `RV-20261108-03` 完成歸還，顯示綠色橫幅說明狀態已更新為「已歸還」、記錄歸還時間與歸還經手管理員吳承翰，且該時段視為已履約結案不重新開放。<br>2. `RV-20261107-05` 雖已超過原時段結束時間，系統仍允許完成歸還結案並更新為「已歸還」，完整記錄實際歸還時間與歸還經手管理員吳承翰。 |
| 關鍵失敗 1 | 非當日預約提前領取、過期未領補登領取，以及非可操作狀態領取／歸還攔截 | 1. 在管理員視窗切換至「已核准／有效（待領取）」篩選。<br>2. 檢視明日以後的 `RV-20261108-04`、`RV-20261108-07`、`RV-20261108-05` 與當日上午已結束未領的 `RV-20261108-02`。<br>3. 檢視「已歸還」（`RV-20261108-01`）、「待審核」（`RV-20261109-08`）、「已駁回」與「已取消」紀錄的操作欄。 | 1. 未來日期的已核准預約標示「非當日預約（限當日領取）」，當日時段已結束未領的預約標示「時段已結束未領（逾期不可領取）」，均不開放「登記領取」按鈕（後端 API 亦分別以 `400 PICKUP_DATE_NOT_TODAY` 與 `400 PICKUP_WINDOW_EXPIRED` 攔截）。<br>2. 已歸還紀錄標示「已完成歸還結案」，待審核、已駁回與已取消紀錄均不開放領取或歸還按鈕（後端 API 以 `409 INVALID_RESERVATION_STATUS` 攔截）。 |
| 關鍵失敗 2 | 成員對已領取「借用中」或「已歸還」紀錄禁止取消預約（含時段開始前提早領取） | 1. 在成員林雅婷「我的預約」頁面，檢視處於「借用中」（如 `RV-20261108-03` 或剛於晚間時段開始前提早領取的 `RV-20261108-06`）與「已歸還」（`RV-20261108-01`）的紀錄卡片操作欄。 | 1. 畫面對所有「借用中」與「已歸還」紀錄嚴格隱藏「取消預約」按鈕，改顯示「已領取借用中（不可取消）」與「已完成歸還結案（不可取消）」；若直接呼叫取消 API 則以 `409 RESERVATION_ALREADY_CHECKED_OUT` 攔截拒絕。 |
| 關鍵失敗 3 | 一般成員越權存取管理員審核與現場借還管理頁面或呼叫領取／歸還 API 遭拒 | 1. 在一般成員（林雅婷）登入的視窗中，點擊頂部導覽「審核與借用管理」。 | 1. 隱藏管理員設備審核設定、待審清單與全體預約借還管理表格，顯示紅色權限攔截卡片「權限不足：拒絕存取管理員審核與現場借還管理」。 |
| 前幾次功能回歸 1 | 7 位數區分大小寫英數驗證碼登入、單次消耗、深淺色主題切換與未開始預約取消釋出 | 1. 在登入頁切換「深色模式／淺色模式」、點擊「重整驗證碼」，並測試大小寫不符驗證碼遭拒與自動換發。<br>2. 林雅婷登入後於「我的預約」對明日尚未開始且尚未領取的 `RV-20261108-04` 點擊「取消預約」並確認。 | 1. 驗證碼嚴格區分大小寫且單次消耗，深淺色主題即時切換。<br>2. `RV-20261108-04` 取消成功，狀態更新為「已取消」並立即釋出該時段。 |
| 前幾次功能回歸 2 | 設備人工審核設定切換、同設備同時段雙人待審核准衝突重檢與填寫原因駁回 | 1. 管理員在「待審核申請清單」先核准 `RV-20261109-08`（林雅婷，`EQ-101` 明日晚間），再點擊同設備同時段的 `RV-20261109-09`（陳冠廷）「核准申請」。<br>2. 對被衝突攔截的 `RV-20261109-09` 點擊「駁回申請」，填寫原因後確認駁回。<br>3. 點擊 `EQ-103` 的「切換為需人工審核」。 | 1. `RV-20261109-08` 核准成功；`RV-20261109-09` 因時段衝突（`409 RESERVATION_CONFLICT`）被攔截並留在待審清單。<br>2. `RV-20261109-09` 駁回成功並記錄駁回原因。<br>3. `EQ-103` 切換為「需人工審核」且既有借還紀錄維持原狀態不變。 |

- 情境與結果：全部通過（9／9）。
  1. **成功操作 1（管理員登記領取）**：通過。管理員吳承翰篩選「已核准／有效（待領取）」，對當日晚間未結束的 `RV-20261108-06` 單鍵點擊「登記領取」，狀態更新為「借用中」並顯示領取時間與領取經手管理員吳承翰。
  2. **成功操作 2（成員查看目前借用中設備與 6 態歷史）**：通過。林雅婷於「我的預約」頁頂「目前借用中設備」醒目區塊看到借用中設備與領取時間，並於下方 6 態篩選檢視 `checked_out` 與 `returned` 紀錄的領取／歸還稽核資訊。
  3. **成功操作 3（單日固定時段 6 態狀態本人與他人視角區分）**：通過。林雅婷檢視當日時段看到 `EQ-101` 下午為「本人借用中」、`EQ-102` 上午為「本人已歸還」；陳冠廷在獨立瀏覽器視窗檢視同一日期，該兩個時段皆顯示為「已被預約」且不揭露林雅婷身分。
  4. **成功操作 4（管理員對時段內與逾時借用中紀錄執行登記歸還）**：通過。管理員對當日借用中 `RV-20261108-03` 與前一日逾時未還借用中 `RV-20261107-05` 單鍵點擊「登記歸還」，兩者皆成功更新為「已歸還」並記錄歸還時間與歸還經手管理員吳承翰。
  5. **關鍵失敗 1（非當日領取、過期未領補登與非可操作狀態攔截）**：通過。明日以後的已核准預約標示「非當日預約（限當日領取）」、當日上午已過期未領預約標示「時段已結束未領（逾期不可領取）」，且非可操作狀態均不開放領取或歸還按鈕並由後端攔截。
  6. **關鍵失敗 2（領取後禁止取消預約）**：通過。處於「借用中」（含當日時段開始前提早領取）與「已歸還」的紀錄在畫面隱藏「取消預約」按鈕並標示不可取消，後端亦以 `409 RESERVATION_ALREADY_CHECKED_OUT` 攔截。
  7. **關鍵失敗 3（一般成員越權攔截）**：通過。一般成員點擊「審核與借用管理」時顯示紅色權限攔截卡片，後端管理員端點亦以 `403 FORBIDDEN` 攔截。
  8. **前幾次功能回歸 1（7 位數大小寫驗證碼登入、深淺色主題與未開始預約取消釋出）**：通過。深淺色主題切換正常，驗證碼嚴格區分大小寫且單次消耗，未開始且未領取的 `RV-20261108-04` 取消成功並釋出時段。
  9. **前幾次功能回歸 2（設備審核設定切換、雙人待審核准衝突重檢與駁回）**：通過。核准 `RV-20261109-08` 後，同設備同時段的 `RV-20261109-09` 核准遭衝突攔截並可填寫原因駁回，切換 `EQ-103` 為需人工審核時既有借還紀錄維持原狀態不變。
- 使用者回饋：委派代理啟動前後端並以雙瀏覽器視窗完成全部 9 個情境驗證，通過，並已執行 `npm --prefix apps/equipment-loan run db:seed` 重設展示資料。使用者觀察與心得：發現本次步驟 9 代理直接重跑步驟 8（T021）寫好的 Playwright E2E 腳本（`npm run test:e2e`），雖然速度極快（5.6 秒完成），但形同「拿步驟 8 自己寫的測試腳本驗收步驟 8 的程式」，且僅檢查 `data-testid` DOM 文字斷言，缺乏獨立於開發階段之外的逐頁視覺排版與探索式互動檢查，不確定實際測試效果是否足夠深入（已同步記入下方「流程不足」）。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| 步驟 5（Wave 2 `api-plan` 與 `data-plan` 平行分析） | 延續前兩次迭代既有契約，`api-plan` 與 `data-plan` 在同一 Wave 平行執行，保留了前兩版既有的可一一對應欄位命名差異（`slot_code` 小寫 vs `slotCode` 大寫、`equipments.status` Enum vs `isActive` 布林、`reservation_no` vs `reservationNumber`），以及本次經手管理員在 `spec.md`（`checked_out_by_user_id`、`returned_by_user_id`）、`data-model.dbml`（`checked_out_by`、`returned_by`）與 `openapi.yaml`（`checkedOutByUserId`／`checkedOutByName`、`returnedByUserId`／`returnedByName`）的欄位命名差異；6 種 `status` Enum 值與可領取／可歸還／可取消規則則完全對齊 | `tasks` 將這兩組差異列為 Notes 待確認 1、2，`analyze` 列為 MEDIUM（F1、F2），`implement` 在後端服務層維持無損映射 | 在委派 Wave 2 Planner 時提示參考前一次迭代的 `openapi.yaml` 與 `data-model.dbml`，使本次新增的 6 種狀態代碼與錯誤碼在 `ui/plan.md`、`openapi.yaml`、`data-model.dbml` 完全一致（消除了前一次迭代的 F3 錯誤碼遺漏） |
| 步驟 9（使用者驗證委派 AI 代跑時直接重跑步驟 8 的 Playwright E2E 腳本） | 使用者委派代理以雙瀏覽器視窗驗證 9 個情境時，因步驟 8（T021）已將 9 個情境寫入 `apps/equipment-loan/e2e/equipment-loan.spec.ts`，代理直接執行 `npm run test:e2e`（耗時 5.6 秒通過），而未另外使用 `agent-browser` 進行獨立的逐頁視覺與探索式互動檢查 | 優點是自動化回歸速度極快（5.6 秒 vs 數分鐘），但缺點是形同「拿步驟 8 自己寫的測試腳本驗收步驟 8 的程式」，且僅驗證 `data-testid` 文字斷言，難以獨立發現排版跑版、元素遮擋或腳本未覆蓋的視覺互動細節 | 記錄於此；後續迭代若由 AI 協助步驟 9 驗證，除執行 `npm run test:e2e` 確認斷言外，應搭配 `agent-browser` 獨立抽查關鍵畫面與視覺狀態，或由使用者親手操作關鍵路徑 |
| 步驟 6～12（跨步驟對話提示） | TUI 畫面不易往上翻找歷史，當某一步驟結束回報時若漏寫「目前完成第幾步、下一步是什麼、下一步可直接貼上的提示詞」，使用者忙完別的事回來會不知道目前進度與該貼哪一段提示詞 | 增加使用者的記憶與查找負擔，容易中斷迭代節奏 | 於本次收尾後將「每一步結束都必須提示目前完成步驟、下一步名稱與已代換變數的可直接執行提示詞」寫入 `AGENTS.md`／`CLAUDE.md` 與 `scripts/hooks/answer-style.sh` |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
| 迭代 3 完整 SDD 工作流產出物（`spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/`、`contracts/openapi.yaml`、`data/data-model.dbml`、`tasks.md`、`analysis.md`），含主動問出「嚴格單向狀態流（`confirmed` → `checked_out` → `returned`）、當日時段領取時間窗、逾時歸還與領取後禁止取消」 | `specs/005-equipment-pickup-return/` | `a3ea247`、`ed0f842`、`9de6716` | 檢視 `specs/005-equipment-pickup-return/` 下各階段產出物與檢查報告 | 否 |
| PostgreSQL 6 態擴充與雙重部分唯一索引無損升級（`uq_reservations_active_slot` 納入 `confirmed`、`checked_out`、`returned` 確保提早歸還結案不重開時段、`uq_reservations_user_active_request` 納入 `checked_out`）及 13 筆 6 態 demo seed | `apps/equipment-loan/backend/prisma/schema.prisma`、`apps/equipment-loan/backend/prisma/migrations/20261109120000_pickup_return/migration.sql`、`apps/equipment-loan/backend/prisma/seed.ts` | `fdb1203` | 在 `apps/equipment-loan/` 執行 `npm run db:migrate && npm run db:seed` | 否 |
| 管理員現場登記領取（攔截非當日與過期未領）、時段內與逾時登記歸還、成員頁頂「目前借用中設備」醒目區塊、時段 6 態標示（本人借用中／本人已歸還 vs 他人已被預約）、領取後禁止取消（`409 RESERVATION_ALREADY_CHECKED_OUT`）及前兩版回歸測試 | `apps/equipment-loan/backend/tests/integration/api.test.ts`、`apps/equipment-loan/e2e/equipment-loan.spec.ts` | `acbe3b6`、`20cc960`、`fa51574`、`8bdd455` | 在 `apps/equipment-loan/` 執行 `npm run test:backend`、`npm run test:frontend` 與 `npm run test:e2e` | 否 |
