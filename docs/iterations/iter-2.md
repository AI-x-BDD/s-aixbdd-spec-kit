# 迭代 2：管理員把指定設備改成人工審核，並處理申請

- spec 目錄：`specs/004-equipment-approval-review/`
- 上一次 spec 目錄：`specs/003-equipment-loan-booking/`
- 執行者：OpenCode＋Gemini 4 Argon
- 開始／結束：2026-11-09／2026-11-09

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | stevedeMac-mini（macOS） |
| 執行工具與版本 | OpenCode 1.19.5，Build agent |
| 模型與 effort | Gemini 4 Argon，high |
| Skill 版本（開始時） | `809b910` |
| 中途變動 | 沒有 |
| 臨時改寫的提示詞 | 沒有 |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-2.md` | 貼 P0 開始第 2 次迭代 | 沒有 | — |
| 2 | `s-specify` | `specs/004-equipment-approval-review/spec.md` | 回答 `clarify` 3 題（皆採推薦選項） | 第 5 節觀察規則（「待審是否占用時段」、「引入審核後舊預約怎麼處理」）皆已在第 1、2 題問到；含 7 條推定需求（FR-001、FR-003、FR-005、FR-007、FR-011、NFR-001、NFR-002）、1 條獨立推定 SC 門檻（SC-002）與 1 項推定排除範圍（Out of Scope），已記錄於此 | `09ca8c8` |
| 3 | `clarify-over-specs` | 更新 `specs/004-equipment-approval-review/spec.md` | 回答 2 輪共 5 題（皆採推薦選項） | 沒有（全部 9 項推定項目皆已確認並從 Assumptions／Out of Scope 移除推定標記；技術實作問題列為 Deferred） | `09ca8c8` |
| 4 | `technical-research` | `specs/004-equipment-approval-review/research.md`、`specs/004-equipment-approval-review/techstack.md` | 提供技術限制 | 沒有（5 個主題皆針對本次新增的雙重部分唯一索引、核准衝突重檢交易、審核狀態呈現與跨迭代遷移／回歸給出明確決策與獨立依據，未直接照抄上一次結論） | `0f5c631` |
| 5 | `system-analysis`（含 `ui-plan`、`api-plan`、`data-plan`） | `plan.md`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/admin.html`、`contracts/openapi.yaml`、`data/data-model.dbml` | 指定沿用 `003` 的專案結構與視覺風格 | 沒有 Skill 問題（`api-plan` 子代理首次呼叫遇平台 API 暫時錯誤 `Requests ending with a model turn are not supported.`，重送後完成）；三個 Planner 檢查腳本（`check_ui.py`、`check_contracts.py`、`check_data_model.py`）皆 `ok: true`（0 issues）；本次無標為「沒有 Planner」的端點 | `0f5c631` |
| 6 | `tasks` | `specs/004-equipment-approval-review/tasks.md` | 觸發執行 | 沒有；包含舊資料無損遷移與回歸任務（T004、T005、T009、T013、T025、T026、T028）、擴充 demo seed 任務（T006、T009、T028），Notes 待確認共 2 項（欄位命名轉換），`check_tasks.py` 0 issues、0 warnings | `9043431` |
| 7 | `analyze` | `specs/004-equipment-approval-review/analysis.md` | 觸發執行 | 沒有；CRITICAL 0 筆、HIGH 0 筆、MEDIUM 3 筆（F1、F2 由 `api-plan` 或 `data-plan` 處理，F3 由 `ui-plan` 處理）、LOW 0 筆；12 條憲法規則全部通過，需求與介面涵蓋率 100% | `9043431` |
| 8 | `implement` | `apps/equipment-loan/`（雙重部分唯一索引無損遷移、擴充 demo seed、前後端審核與設備設定功能、Vitest／Supertest／Playwright 測試、`README.md`）、更新 `tasks.md`（28/28 完成） | 觸發執行（中途遇一次 Gemini API `Requests ending with a model turn are not supported` 錯誤後回覆 `continue` 續跑） | 沒有 Skill 問題；受阻任務 0 個，自行決策 3 條（見下節），全套單元、整合與 E2E 測試全部通過 | `31e0eb4`、`d03e110`、`1ef3859`、`6a3c036`、`a184cf9`、`1376178` |
| 9 | （使用者驗證） | 更新 `docs/iterations/iter-2.md`「使用者驗證」 | 委派代理啟動前後端並以雙瀏覽器視窗實際跑完 9 個情境驗證 | 沒有（成功操作 1～4、關鍵失敗 1～3、前幾次功能回歸 1～2 共 9 個情境全部通過，並已重設 demo seed） | `1376178` |
| 10 | （檢查 Skill 表現） | 更新 `docs/iterations/iter-2.md`「Skill 表現檢查」 | 觸發執行 | 沒有（11 支相關 Skill 皆照預期運作，無發現具有證據的 Skill 缺陷） | 見步驟 12 commit |
| 12 | （收尾） | 更新 `docs/iterations/iter-2.md`「流程不足」與「影片素材清單」並提交 | 觸發執行 | 沒有 | 見本次 commit |

### 步驟 8 `implement` 受阻任務與自行決策紀錄

- **受阻任務**：無（0 個）。
- **自行決策紀錄**：

| 任務 | 情況 | 決定 | 理由 | 影響範圍 |
| --- | --- | --- | --- | --- |
| T006、T010、T022 | `data/data-model.dbml` 的 `time_slots.slot_code` 註解為小寫（`morning`、`afternoon`、`evening`）且 `equipments.status` 為 Enum（`available`／`unavailable`），而 `contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` 為大寫（`MORNING`、`AFTERNOON`、`EVENING`）且 `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` 使用布林欄位 `isActive`（`tasks.md` Notes 待確認 1） | 資料庫維持 `morning`／`afternoon`／`evening` 與 `status` Enum，在 `equipmentService.ts` 回應時轉為大寫 `slotCode` 與 `isActive: eq.status === "available"` | 沿用 `tasks.md` Notes 待確認 1 的暫行做法，維持資料庫與 API 雙邊契約原樣（`自主決策-格式規範.md` Rule 1） | `backend/prisma/seed.ts`、`backend/src/services/equipmentService.ts` |
| T011、T012、T017 | `data/data-model.dbml` 的 `Table reservations` 欄位名為 `reservation_no`，而 `contracts/openapi.yaml` 的 `Reservation` 與 `AdminReservationItem` 欄位名為 `reservationNumber`（`tasks.md` Notes 待確認 2） | 資料庫維持 `reservation_no`，在 `reservationService.ts` 的 `toReservationDto()` 映射為 `reservationNumber` | 沿用 `tasks.md` Notes 待確認 2 的暫行做法，維持資料庫與 API 雙邊契約原樣（`自主決策-格式規範.md` Rule 1） | `backend/src/services/reservationService.ts` |
| T026 | 本機埠號 `5173` 與 `5174` 已被其他背景服務占用，導致 Playwright 若沿用 `5173` 會連到其他專案畫面 | 在 `apps/equipment-loan/playwright.config.ts` 將 Playwright 測試專用前端伺服器埠號設為 `5183`（`--port 5183 --strictPort`），保留一般 `npm --prefix frontend run dev` 預設設定 | 屬於測試執行環境埠號衝突排除，確保 E2E 測試穩定連接本專案前端（`自主決策-格式規範.md` Rule 2） | `apps/equipment-loan/playwright.config.ts` |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| `clarify` | 依呼叫者指定的面向與題數上限（單輪最多 3 題），直接於對話輸出 `Context`、`總結之提問` 與含推薦理由的 Markdown `Options` 表格，不使用 Ask 工具 | 於 `s-specify`（1 輪 3 題）與 `clarify-over-specs`（2 輪 5 題）中皆按樣板直接輸出表格並標明推薦理由 | 沒有問題 | `specs/004-equipment-approval-review/spec.md` `## Clarifications`（commit `09ca8c8`） |
| `s-specify` | 主動詢問第 5 節第 2 列觀察規則（「待審是否占用時段」與「引入審核後舊預約怎麼處理」），切分可獨立驗證的 User Story，並將 AI 預設值標為推定需求 | 第 1 輪 `clarify` 第 1、2 題即主動問出「待審不占位、核准時重檢衝突」與「舊預約保留原有效力、新設定僅適用新申請」；切出 US1～US3、FR-001～FR-011、NFR-001～NFR-002、SC-001～SC-005 並列出 9 項推定項目 | 沒有問題 | `specs/004-equipment-approval-review/spec.md`（commit `09ca8c8`） |
| `clarify-over-specs` | 以 10 類分類表掃描 `spec.md`，每題標出分類、分輪提問（最多 5 題），統一術語並把決策寫回對應段落，移除已確認的推定標記，實作問題標為 Deferred | 分 2 輪提問 5 題（涵蓋互動與 UX 流程、功能範圍與行為、領域與資料模型、術語與一致性、非功能品質屬性），將有效狀態術語統一為「已核准／有效」（`confirmed`），消除全部 9 項推定標記，並將實作與遷移技術方案標為 Deferred | 沒有問題 | `specs/004-equipment-approval-review/spec.md`（commit `09ca8c8`） |
| `technical-research` | 沿用 `003` 的 `techstack.md`，針對本次新增技術主題給出明確決策與獨立依據（不直接照抄上一次結論） | 產出 `research.md`（5 個主題：雙重部分唯一索引與無損遷移、管理員核准衝突重檢交易、審核狀態互動架構、型別安全與權限攔截、並發核准測試與 demo seed 擴充）與 `techstack.md`（10 列採用技術、10 列不引入技術） | 沒有問題 | `specs/004-equipment-approval-review/research.md`、`techstack.md`（commit `0f5c631`） |
| `system-analysis` | 盤點前端、後端、資料庫介面並涵蓋所有需求與 User Story，排定 Wave，沿用指定專案結構與視覺風格並依 Wave 委派 Planner | 盤出 `F1`～`F4`、`B1`～`B5`、`D1`～`D2` 共 11 個介面，通過兩道 `grep` 查核命令（18 個需求編號與 US1～US3 零缺漏），並依 Wave 1、Wave 2 完成委派 | 沒有問題 | `specs/004-equipment-approval-review/plan.md`（commit `0f5c631`） |
| `ui-plan` | 依 `F1`～`F4` 與沿用的視覺風格產出 `ui/plan.md` 與可互動 HTML 雛形，通過 `check_ui.py` 與瀏覽器檢查 | 產出 `ui/plan.md` 與 `index.html`、`booking.html`、`my-reservations.html`、`admin.html`；`check_ui.py` `ok: true`（0 issues），並通過 `agent-browser` 全部 52 個雛形狀態與雙主題切換零錯誤驗證 | 沒有問題 | `specs/004-equipment-approval-review/ui/`（commit `0f5c631`） |
| `api-plan` | 依 `B1`～`B5` 與憲法 `openapi.md` Rule 1–7 產出 `contracts/openapi.yaml` 並通過 `check_contracts.py` | 產出 14 個 operation，完整遵循分頁 Rule 1–5、`401`/`403` Rule 6、時間時區 Rule 7，`check_contracts.py` `ok: true`（0 issues；與 `data-plan` 平行執行的欄位命名映射延續第 1 次迭代記錄於「流程不足」） | 沒有問題 | `specs/004-equipment-approval-review/contracts/openapi.yaml`（commit `0f5c631`） |
| `data-plan` | 依 `D1`～`D2` 與憲法 `data-model.md` Rule 1–4 產出 `data/data-model.dbml` 並通過 `check_data_model.py` | 產出 6 張資料表與 3 個 Enum，完整定義 `equipments.requires_approval`、`reservation_status` 四種狀態、審核欄位與兩條部分唯一索引（`uq_reservations_active_slot`、`uq_reservations_user_active_request`），`check_data_model.py` `ok: true`（0 issues） | 沒有問題 | `specs/004-equipment-approval-review/data/data-model.dbml`（commit `0f5c631`） |
| `tasks` | 拆解任務與 Must Read／Optional 參考，包含舊資料遷移、舊功能回歸與擴充 demo seed 任務，將上游命名差異記為 Notes 待確認並通過 `check_tasks.py` | 產出 `T001`～`T028`（含無損遷移與回歸任務 `T004`、`T005`、`T009`、`T013`、`T025`、`T026`、`T028` 及擴充 demo seed 任務 `T006`、`T009`、`T028`），記錄 `待確認 1`、`待確認 2`，`check_tasks.py` 0 issues、0 warnings | 沒有問題 | `specs/004-equipment-approval-review/tasks.md`（commit `9043431`） |
| `analyze` | 不修改上游文件，執行 `collect_coverage.py` 並檢查跨文件一致性與 12 條憲法規則 | 產出 `analysis.md`（0 CRITICAL、0 HIGH、3 MEDIUM F1～F3、0 LOW），12 條憲法規則與 18 項需求、11 個介面涵蓋率皆 100% | 沒有問題 | `specs/004-equipment-approval-review/analysis.md`（commit `9043431`） |
| `implement` | 依 `tasks_state.py` 順序逐一實作、驗證與打勾，執行各 Phase Checkpoint 驗證，對上游差異自主決策並輸出完成報告 | 完成 `28/28` 任務（受阻 0 個），記錄 3 條自主決策，全套單元、整合（Vitest + Supertest）與 Playwright E2E 測試全部通過 | 沒有問題 | `specs/004-equipment-approval-review/tasks.md`、`apps/equipment-loan/`（commit `31e0eb4`～`1376178`） |

## Skill 問題（交給 skill-engineering）

沒有（本次迭代 11 支相關 Skill 皆照預期運作，無發現具有證據的 Skill 缺陷；Wave 2 平行 Planner 的欄位命名映射與跨 Wave 錯誤碼對照記於下方「流程不足」）。

## 使用者驗證

- commit SHA：`1376178`
- 啟動方式（從乾淨環境開始的指令）：
  ```bash
  # 1. 進入應用程式目錄
  cd apps/equipment-loan

  # 2. 安裝依賴與準備環境變數
  npm install
  npm --prefix backend install
  npm --prefix frontend install
  cp -n backend/.env.example backend/.env || true

  # 3. 啟動 PostgreSQL 18 容器、執行無損 migration 與載入擴充後 demo seed
  docker compose up -d --wait
  npm run db:migrate
  npm run db:seed

  # 4. 啟動後端（埠號 3000）與前端（預設 5173；若本機 5173 已被其他專案占用，可加 -- --port 5183）
  npm --prefix backend run dev
  npm --prefix frontend run dev -- --port 5183
  ```
  啟動後：
  - **一般視窗（成員視角：林雅婷／陳冠廷）**：開啟 `http://localhost:5183`（或 `http://localhost:5173`）
  - **無痕視窗（管理員視角：吳承翰，或第二位成員視角）**：開啟同一網址
- demo seed 重設展示資料指令（已實跑確認可隨時重設 3 組預建帳號、4 台含審核設定的單件設備、3 個單日固定時段與涵蓋四種審核狀態的 10 筆範例預約紀錄）：
  ```bash
  npm --prefix apps/equipment-loan run db:seed
  ```
- 本次驗證情境：

| 類別 | 情境名稱 | 操作步驟 | 預期結果 |
| --- | --- | --- | --- |
| 成功操作 1 | 成員檢視需人工審核／免審核標示，對需審核設備送出申請進入「待審核」且不占位 | 1. 一般視窗以林雅婷（`lin.yating`）點擊「帶入帳號」並登入。<br>2. 在「設備預約」頁面（預設明日日期），確認 `EQ-101`、`EQ-102` 標示琥珀色「需人工審核」，`EQ-103`、`EQ-104` 標示翠綠色「免審核」，且 `EQ-101` 晚間顯示「本人待審核」。<br>3. 點選 `EQ-102` 的「下午時段 `13:00–17:00`（可預約，原申請已駁回釋出）」，點擊右側「送出待審核申請」。<br>4. 開啟第二個成員視窗以陳冠廷（`chen.guanting`）登入檢視同一日期的 `EQ-102` 下午時段並點選送出。 | 1. 林雅婷送出後顯示琥珀色橫幅「待審核申請已送出」，`EQ-102` 下午對林雅婷顯示「本人待審核」。<br>2. 陳冠廷視窗檢視 `EQ-102` 下午仍顯示「可預約」（不揭露林雅婷的待審申請），且陳冠廷也能成功送出同一時段的待審申請。 |
| 成功操作 2 | 成員在「我的預約」檢視四種審核狀態、駁回原因並取消待審或已核准申請 | 1. 在林雅婷視窗點擊頂部導覽「我的預約」。<br>2. 切換狀態篩選（全部紀錄／待審核／已核准／有效／已駁回／已取消），檢視 `RV-20261109-07`（已駁回）的審核管理員、審核時間與駁回原因。<br>3. 對一筆「待審核」申請點擊「取消待審申請」，在對話框點擊「確認取消申請」。 | 1. 清楚顯示四種狀態徽章，且 `RV-20261109-07` 顯示紅色駁回原因區塊（「該時段已有實驗室年度高頻校驗排程…」）。<br>2. 取消待審申請後顯示綠色橫幅，該筆狀態更新為「已取消」並自管理員待審清單移除。 |
| 成功操作 3 | 管理員於待審清單核准申請並填寫原因駁回申請 | 1. 無痕視窗以管理員吳承翰（`wu.chenghan`）點擊「帶入帳號」並登入，進入「審核與預約管理」。<br>2. 在「待審核申請清單」對第一筆待審申請 `RV-20261109-08`（林雅婷，`EQ-101` 明日晚間 `18:00–21:00`）點擊「核准申請」。<br>3. 對另一筆待審申請點擊「駁回申請」，在對話框輸入駁回原因（上限 200 字）並點擊「確認駁回申請」。 | 1. `RV-20261109-08` 核准成功，顯示綠色橫幅並移出待審清單，在下方全體預約表格狀態更新為「已核准／有效」並記錄審核管理員吳承翰與審核時間，正式占用該時段。<br>2. 被駁回的申請移出待審清單，在全體預約表格狀態更新為「已駁回」並完整顯示駁回原因。 |
| 成功操作 4 | 管理員切換指定設備的人工審核設定並維持既有預約與待審效力 | 1. 在管理員頁面「預建單件獨立設備清單」區塊，對 `EQ-103`（原為免審核）點擊「切換為需人工審核」，再對 `EQ-102`（原為需人工審核）點擊「切換為免審核」。<br>2. 檢查下方待審清單與全體預約紀錄中的既有紀錄（如 `RV-20261108-01` 已核准、`RV-20261109-10` 待審核）。<br>3. 切回成員視窗對 `EQ-103` 送出新預約申請。 | 1. 設備卡片標示立即更新並顯示綠色橫幅，既有「已核准／有效」預約與既有「待審核」申請 100% 維持原狀態不變。<br>2. 切換後成員對 `EQ-103` 新送出的申請改為進入「待審核」狀態。 |
| 關鍵失敗 1 | 同設備同時段多筆待審申請，管理員核准第一筆後再核准第二筆遭衝突攔截 | 1. 先執行 `npm --prefix apps/equipment-loan run db:seed` 重設資料。<br>2. 管理員登入後，在「待審核申請清單」先對 `RV-20261109-08`（林雅婷，`EQ-101` 明日晚間）點擊「核准申請」。<br>3. 接著對同為 `EQ-101` 明日晚間的第二筆待審申請 `RV-20261109-09`（陳冠廷）點擊「核准申請」。 | 1. `RV-20261109-08` 核准成功並鎖定占用該時段。<br>2. `RV-20261109-09` 核准被拒絕（`409 RESERVATION_CONFLICT`），頁頂顯示紅色錯誤橫幅提示該時段已被 `RV-20261109-08` 占用，且 `RV-20261109-09` 仍留在待審清單中供管理員點擊「駁回申請」。 |
| 關鍵失敗 2 | 同一成員對同一設備時段重複申請遭拒與駁回原因超過 200 字攔截 | 1. 成員林雅婷在「設備預約」頁面點選已顯示為「本人待審核」（如 `EQ-101` 晚間）或「本人已預約」（如 `EQ-101` 上午）的時段。<br>2. 管理員在待審清單點擊「駁回申請」，在駁回原因輸入超過 200 字的文字並點擊「確認駁回申請」。 | 1. 成員端顯示紅色錯誤橫幅「重複申請遭拒：您已對…持有一筆未結束的申請，同一成員不得對同一設備時段重複申請」。<br>2. 管理員對話框顯示紅色錯誤提示「駁回原因為選填，但長度不得超過 200 字」並攔截送出。 |
| 關鍵失敗 3 | 一般成員越權存取管理員審核頁面或呼叫管理員 API 遭拒 | 1. 在一般成員（林雅婷）登入的視窗中，點擊頂部導覽「審核與預約管理」。 | 1. 隱藏設備審核設定、待審清單與全體預約表格，顯示紅色權限攔截卡片「權限不足：拒絕存取管理員設備審核設定與待審核申請清單」。 |
| 前幾次功能回歸 1 | 7 位數區分大小寫英數驗證碼登入、單次消耗與 Light／Dark Mode 切換 | 1. 在登入頁切換右上角「深色模式／淺色模式」並點擊「重整驗證碼」。<br>2. 點擊「帶入帳號」後將驗證碼任一英文字母改為相反大小寫送出登入。 | 1. 深淺色主題即時切換，重整驗證碼立即換發新 7 碼。<br>2. 大小寫不符時拒絕登入（`400 CAPTCHA_MISMATCH`），原驗證碼單次消耗作廢並自動換發新驗證碼。 |
| 前幾次功能回歸 2 | 免審核設備預約立即成立、時段開始前取消立即釋出時段 | 1. 成員點選免審核設備（如 `EQ-103`）的可預約時段並點擊「確認送出預約」。<br>2. 到「我的預約」對 `RV-20261108-03`（`EQ-101` 明日上午）點擊「取消預約」並確認。 | 1. 免審核設備送出後立即成為「已核准／有效」並显示「本人已預約」。<br>2. 取消後 `EQ-101` 明日上午立即恢復為「可預約」，且「已取消」歷史紀錄完整保留。 |

- 情境與結果：
  - **成功操作 1（成員檢視需人工審核／免審核標示，對需審核設備送出申請進入「待審核」且不占位）**：通過（`EQ-101`、`EQ-102` 顯示「需人工審核」，`EQ-103`、`EQ-104` 顯示「免審核」；林雅婷對 `EQ-102` 明日下午送出後建立 `RV-20261109-104003` 待審申請並顯示「本人待審核」，同時陳冠廷視窗檢視同一時段仍顯示「可預約」並成功送出待審申請 `RV-20261109-7892F3`）。
  - **成功操作 2（成員在「我的預約」檢視四種審核狀態、駁回原因並取消待審或已核准申請）**：通過（清單完整顯示四種狀態與 `RV-20261109-07` 的駁回原因「該時段已有實驗室年度高頻校驗排程，請改申請其他時段或隔日借用。」；取消待審申請 `RV-20261109-10` 後顯示已自管理員待審清單移除並更新為「已取消」）。
  - **成功操作 3（管理員於待審清單核准申請並填寫原因駁回申請）**：通過（吳承翰登入後核准 `RV-20261109-08`，狀態更新為「已核准／有效」並正式占用 `EQ-101` 明日晚間時段；對 `RV-20261109-09` 輸入駁回原因並駁回後，狀態更新為「已駁回」並保留於全體紀錄中）。
  - **成功操作 4（管理員切換指定設備的人工審核設定並維持既有預約與待審效力）**：通過（將 `EQ-103` 由「免審核」切換為「需人工審核」後，既有已核准與待審紀錄皆維持原狀態不變，而成員林雅婷後續對 `EQ-103` 明日晚間送出的新申請 `RV-20261109-07E8FE` 進入「待審核」狀態）。
  - **關鍵失敗 1（同設備同時段多筆待審申請，管理員核准第一筆後再核准第二筆遭衝突攔截）**：通過（先核准 `RV-20261109-08` 後，再對同為 `EQ-101` 明日晚間的 `RV-20261109-09` 點擊核准時，收到 `409 RESERVATION_CONFLICT` 紅色錯誤橫幅「無法核准申請：預約編號 RV-20261109-09 所申請的 EQ-101…已被另一筆『已核准／有效』預約（RV-20261109-08）占用；RV-20261109-09 仍維持『待審核』狀態，請改為執行駁回」）。
  - **關鍵失敗 2（同一成員對同一設備時段重複申請遭拒與駁回原因超過 200 字攔截）**：通過（林雅婷點選已有待審申請的 `EQ-101` 晚間時段時顯示「重複申請遭拒」錯誤橫幅；管理員在駁回原因輸入 220 字時顯示「駁回原因為選填，但長度不得超過 200 字（目前已輸入 220 字）。」並攔截送出）。
  - **關鍵失敗 3（一般成員越權存取管理員審核頁面或呼叫管理員 API 遭拒）**：通過（林雅婷點選「審核與預約管理」時隱藏管理內容並顯示紅色權限攔截卡片）。
  - **前幾次功能回歸 1（7 位數區分大小寫英數驗證碼登入、單次消耗與 Light／Dark Mode 切換）**：通過（`data-theme="dark"` 與淺色即時切換；驗證碼 `UbQu7Px` 重整換發 `K6wJdJX`，輸入大小寫相反時遭 `400 CAPTCHA_MISMATCH` 攔截、原驗證碼單次消耗作廢並換發新驗證碼 `8tTlR4h`）。
  - **前幾次功能回歸 2（免審核設備預約立即成立、時段開始前取消立即釋出時段）**：通過（對免審核設備 `EQ-103` 明日下午送出預約立即建立 `RV-20261109-DC9215` 並占用時段；取消 `RV-20261108-03` 後立即釋出時段並保留已取消歷史紀錄）。
- 使用者回饋：使用者指示由代理啟動前後端並以雙瀏覽器視窗實際執行操作驗證；全部 9 個情境皆通過，驗證後已執行 `npm --prefix apps/equipment-loan run db:seed` 重設展示資料。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| 步驟 5（Wave 2 `api-plan` 與 `data-plan` 平行分析） | 延續第 1 次迭代既有契約，`api-plan` 與 `data-plan` 在同一 Wave 平行執行，保留了第一版既有的三個可一一對應欄位命名差異（`slot_code` 小寫 vs `slotCode` 大寫、`equipments.status` Enum vs `isActive` 布林、`reservation_no` vs `reservationNumber`）；本次新增的 `requires_approval`／`requiresApproval`、四種 `status` Enum（`pending_approval`、`confirmed`、`rejected`、`cancelled`）與審核欄位則完全對齊 | `tasks` 將第一版既有差異列為 Notes 待確認 1、2，`analyze` 列為 MEDIUM（F1、F2），`implement` 在後端服務層維持無損映射 | 在委派 Wave 2 Planner 時提示參考前一次迭代的 `openapi.yaml` 與 `data-model.dbml`，使本次新增欄位與狀態值完全一致，未再產生新的命名分歧 |
| 步驟 5（Wave 1 `ui-plan` 與 Wave 2 `api-plan` 錯誤碼對照） | `ui-plan` 在 Wave 1 先完成，Wave 2 的 `api-plan` 包含通用資源錯誤碼（`RESOURCE_NOT_FOUND`、`EQUIPMENT_UNAVAILABLE`），使 `analyze` 檢出 `ui/plan.md` §5 未單獨列出這兩個錯誤碼的表格列（F3） | 不影響實作（`tasks` T008 已將全部 16 個錯誤碼納入 `frontend/src/text/zh-TW.ts`），但會在 `analysis.md` 產生 1 筆 MEDIUM 項目 | 持續記錄觀察跨 Wave 錯誤碼對齊情況 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
| 迭代 2 完整 SDD 工作流產出物（`spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/`、`contracts/openapi.yaml`、`data/data-model.dbml`、`tasks.md`、`analysis.md`），含主動問出「待審不占位、核准重檢衝突」與「切換審核設定保留舊預約效力」 | `specs/004-equipment-approval-review/` | `09ca8c8`、`0f5c631`、`9043431` | 檢視 `specs/004-equipment-approval-review/` 下各階段產出物與檢查報告 | 否 |
| PostgreSQL 雙重部分唯一索引（`uq_reservations_active_slot` 確保待審不占位且核准唯一占位、`uq_reservations_user_active_request` 禁止同成員同設備時段重複申請）與第一版資料無損遷移 | `apps/equipment-loan/backend/prisma/schema.prisma`、`apps/equipment-loan/backend/prisma/migrations/20261109000000_approval_review/migration.sql` | `d03e110` | 在 `apps/equipment-loan/` 執行 `npm run db:migrate && npm run db:seed` | 否 |
| 多筆待審申請並發核准時僅 1 筆成功、其餘 100% 回 `409 RESERVATION_CONFLICT`，切換設備審核設定 100% 保留既有預約與待審狀態，以及第一版回歸與雙視窗 E2E 驗證 | `apps/equipment-loan/backend/tests/integration/api.test.ts`、`apps/equipment-loan/e2e/equipment-loan.spec.ts` | `1376178` | 在 `apps/equipment-loan/` 執行 `npm run test:backend`、`npm run test:frontend` 與 `npm run test:e2e` | 否 |
