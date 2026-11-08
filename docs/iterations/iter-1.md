# 迭代 1：成員登入、查看預建設備、預約固定時段與取消

- spec 目錄：`specs/003-equipment-loan-booking/`
- 執行者：OpenCode＋Gemini 4 Argon
- 開始／結束：2026-11-08／2026-11-09

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | stevedeMac-mini（macOS） |
| 執行工具與版本 | OpenCode 1.19.5，Build agent |
| 模型與 effort | Gemini 4 Argon，high |
| Skill 版本（開始時） | `673897f` |
| 中途變動 | 步驟 1 新增憲法規則（commit `b4b6ca2`） |
| 臨時改寫的提示詞 | P0：`read docs/dev/迭代-runbook.md, Based on it，開始跑第一次迭代`<br>P2 `{FEATURE}` 加入使用者指定的「登入時需要輸入驗證碼（7 位數，由英文與阿拉伯數字組成，英文有區分大小寫，例如 a123456 與 A123456 不同）」 |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-1.md` | 指示依 runbook 開始第 1 次迭代 | 沒有 | — |
| 1 | `constitution` | `.agents/constitution/skills/api-plan/openapi.md`（Rule 6、7）、`.agents/constitution/skills/data-plan/data-model.md`（Rule 3、4） | 回答 `clarify` 3 題（皆採推薦選項） | 沒有 | `b4b6ca2` |
| 2 | `s-specify` | `specs/003-equipment-loan-booking/spec.md` | 回答 `clarify` 3 題（皆採推薦選項） | 第 5 節觀察規則（「設備與預約單位」、「同時搶同一時段」）皆已問到；含 6 條推定需求（FR-001、FR-003、FR-004、FR-011、NFR-001、NFR-002）與 2 條推定 SC 門檻（SC-002、SC-003） | `fa8cd0d` |
| 3 | `clarify-over-specs` | 更新 `specs/003-equipment-loan-booking/spec.md` | 回答 2 輪共 5 題（皆採推薦選項） | 沒有（全部 8 項推定項目皆已確認並從 Assumptions 移除） | `fa8cd0d` |
| 4 | `technical-research` | `specs/003-equipment-loan-booking/research.md`、`specs/003-equipment-loan-booking/techstack.md` | 提供技術限制 | 沒有（6 個主題皆有獨立採用理由與 npm 版本查證，新增帳號密碼、`scrypt`、7 碼驗證碼挑戰與工作階段決策，並排除 Socket.IO） | `c22fa5f` |
| 5 | `system-analysis`（含 `ui-plan`、`api-plan`、`data-plan`） | `plan.md`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/admin.html`、`contracts/openapi.yaml`、`data/data-model.dbml` | 於 `clarify` 選定選項 1 視覺風格並補充要求支援 Light Mode 與 Dark Mode 雙主題切換 | 沒有；三個 Planner 檢查腳本（`check_ui.py`、`check_contracts.py`、`check_data_model.py`）皆零問題通過；本次無標為「沒有 Planner」的端點 | `c22fa5f` |
| 6 | `tasks` | `specs/003-equipment-loan-booking/tasks.md` | 觸發執行 | 沒有；包含 demo seed 任務（T009、T016、T034、T035）；Notes 待確認共 2 項（欄位命名轉換）；`check_tasks.py` 0 issues、0 warnings | `3a890f8` |
| 7 | `analyze` | `specs/003-equipment-loan-booking/analysis.md` | 觸發執行 | 沒有；CRITICAL 0 筆、HIGH 0 筆、MEDIUM 3 筆（F1、F2、F3）、LOW 0 筆；12 條憲法規則全部通過，需求與介面涵蓋率 100% | `3a890f8` |
| 8 | `implement` | `apps/equipment-loan/`（前後端程式、Prisma migration 與 seed、Vitest／Supertest／Playwright 測試、`README.md`）、更新 `tasks.md`（35/35 完成） | 觸發執行 | 沒有；受阻任務 0 個，自行決策 3 條（見下節），全套測試通過 | `ac34799`、`140ee38`、`4658d9e`、`7c0f3ed`、`7c3df52`、`61162c4` |
| 9 | （使用者驗證） | 更新 `docs/iterations/iter-1.md`「使用者驗證」 | 委派代理啟動前後端並以雙瀏覽器視窗實際跑完 7 個情境驗證 | 沒有（成功操作 1～4、關鍵失敗 1～3 共 7 個情境全部通過，並已重設 demo seed） | `61162c4` |
| 10 | （檢查 Skill 表現） | 更新 `docs/iterations/iter-1.md`「Skill 表現檢查」 | 觸發執行 | 沒有（12 支 Skill 皆無 Skill 缺陷） | 見步驟 12 commit |
| 12 | （收尾） | 更新 `docs/iterations/iter-1.md`「流程不足」與「影片素材清單」並提交 | 觸發執行 | 沒有 | 見本次 commit |

### 步驟 8 `implement` 受阻任務與自行決策紀錄

- **受阻任務**：無（0 個）。
- **自行決策紀錄**：

| 任務 | 情況 | 決定 | 理由 | 影響範圍 |
| --- | --- | --- | --- | --- |
| T009、T018 | `data/data-model.dbml` 的 `time_slots.slot_code` 註解為小寫（`morning`、`afternoon`、`evening`）且 `equipments.status` 為 Enum（`available`／`unavailable`），而 `contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` 為大寫（`MORNING`、`AFTERNOON`、`EVENING`）且 `EquipmentWithSlotAvailability` 使用布林欄位 `isActive`（`tasks.md` Notes 待確認 1） | 資料庫維持 `morning`／`afternoon`／`evening` 與 `status` Enum，在 `equipmentService.ts` 回應時轉為大寫 `slotCode` 與 `isActive: eq.status === "available"` | 沿用 `tasks.md` Notes 待確認 1 的暫行做法，維持資料庫與 API 雙邊契約原樣（`自主決策-格式規範.md` Rule 1） | `backend/prisma/seed.ts`、`backend/src/services/equipmentService.ts` |
| T019、T024、T028 | `data/data-model.dbml` 的 `Table reservations` 欄位名為 `reservation_no`，而 `contracts/openapi.yaml` 的 `Reservation` 與 `AdminReservationItem` 欄位名為 `reservationNumber`（`tasks.md` Notes 待確認 2） | 資料庫維持 `reservation_no`，在 `reservationService.ts` 的 `toReservationDto()` 映射為 `reservationNumber` | 沿用 `tasks.md` Notes 待確認 2 的暫行做法，維持資料庫與 API 雙邊契約原樣（`自主決策-格式規範.md` Rule 1） | `backend/src/services/reservationService.ts` |
| T017 | 驗證碼單次消耗（FR-001、SC-001）若放在同一個在驗證失敗時會拋出例外並 rollback 的 Prisma 互動式交易內，驗證碼或密碼錯誤時 `consumed_at` 會隨交易回滾而未被持久化 | 在 `authService.ts` 的 `login()` 先以獨立原子 `updateMany`（`WHERE id = challengeId AND consumed_at IS NULL AND expires_at > now`）立即提交 `consumed_at = now`，再比對大小寫敏感的 `captchaCode` 與密碼 | 確保符合 `spec.md` FR-001、SC-001「一旦送出登入驗證（無論成功或失敗），原驗證碼必須立即失效」的最高權威要求 | `backend/src/services/authService.ts` |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| `constitution` | 判斷規則落點、以 `clarify` 確認細節、拒絕非跨產出物憲法的業務功能、寫入對應憲法檔，並以「檢查紀錄」與「衝突清單」雙表格回報一致性且不修改衝突檔案 | 於 `openapi.md` 新增 Rule 6、7，於 `data-model.md` 新增 Rule 3、4；將 7 位數驗證碼歸為業務功能交由 `s-specify`；完整輸出雙表格並保留 001/002 與樣板範例原樣 | 沒有問題 | `.agents/constitution/skills/api-plan/openapi.md`、`.agents/constitution/skills/data-plan/data-model.md`（commit `b4b6ca2`） |
| `clarify` | 依呼叫者指定的面向與題數上限（單輪最多 3 題），直接於對話輸出 `Context`、`總結之提問` 與含推薦理由的 Markdown `Options` 表格，不使用 Ask 工具 | 於 `constitution`、`s-specify`、`clarify-over-specs`、`system-analysis` 四次委派中皆按樣板直接輸出表格並推薦選項 | 沒有問題 | `specs/003-equipment-loan-booking/spec.md` `## Clarifications`（commit `fa8cd0d`） |
| `s-specify` | 主動詢問第 5 節觀察規則（「設備與預約單位：單一組織、單件設備、單日固定時段」與「同時搶同一時段」），切分可獨立驗證的 User Story，並將 AI 預設值標為推定需求 | 第 1 輪 `clarify` 3 題即完整問出「單一組織、單件獨立設備、單日固定時段」與「同時搶同一時段僅一人成功、時段開始前取消釋出」；切出 US1～US3、FR-001～FR-011、NFR-001～NFR-002、SC-001～SC-005 並列出 8 項推定引用 | 沒有問題 | `specs/003-equipment-loan-booking/spec.md`（commit `fa8cd0d`） |
| `clarify-over-specs` | 以 10 類分類表掃描 `spec.md`，每題標出分類、分輪提問（最多 5 題），把決策寫回對應段落並移除已確認的推定引用，實作問題標為 Deferred | 分 2 輪提問 5 題，寫回後消除全部 8 項推定引用，並將工作階段、驗證碼儲存與並發鎖定技術方案標為 Deferred | 沒有問題 | `specs/003-equipment-loan-booking/spec.md`（commit `fa8cd0d`） |
| `technical-research` | 以 1A2B `techstack.md` 為起點，逐項重新查證版本並寫出本系統採用理由，研究帳號密碼、`scrypt`、7 碼驗證碼挑戰與工作階段，排除不需要的 Socket.IO | 產出 `research.md`（6 個主題，含 `npm view` 最新版本查證與量化依據）與 `techstack.md`（10 列採用技術、9 列不引入技術） | 沒有問題 | `specs/003-equipment-loan-booking/research.md`、`techstack.md`（commit `c22fa5f`） |
| `system-analysis` | 盤點前端、後端、資料庫介面並涵蓋所有需求與 User Story，排定 Wave，以 `clarify` 確認視覺風格後依 Wave 平行委派 Planner | 盤出 `F1`～`F4`、`B1`～`B4`、`D1`～`D2` 共 10 個介面，通過兩個 `grep` 查核命令；確認視覺風格（含 Light／Dark Mode）後依 Wave 1、Wave 2 完成委派 | 沒有問題 | `specs/003-equipment-loan-booking/plan.md`（commit `c22fa5f`） |
| `ui-plan` | 依 `F1`～`F4` 與視覺風格（含 Light／Dark Mode 雙主題）產出 `ui/plan.md` 與可互動 HTML 雛形，通過 `check_ui.py` 與瀏覽器檢查 | 產出 `ui/plan.md` 與 `index.html`、`booking.html`、`my-reservations.html`、`admin.html`；`check_ui.py` 0 issues，並通過 `agent-browser` 36 個狀態與雙主題切換零錯誤驗證 | 沒有問題 | `specs/003-equipment-loan-booking/ui/`（commit `c22fa5f`） |
| `api-plan` | 依 `B1`～`B4` 與憲法 `openapi.md` Rule 1–7 產出 `contracts/openapi.yaml` 並通過 `check_contracts.py` | 產出 9 個 operation，完整遵循分頁 Rule 1–5、`401`/`403` Rule 6、時間時區 Rule 7，`check_contracts.py` 0 issues（與同在 Wave 2 平行執行的 `data-plan` 有 `slotCode` 大小寫、`isActive` vs `status`、`reservationNumber` vs `reservation_no` 命名差異，屬平行 Wave 預期映射，已記於「流程不足」） | 沒有問題 | `specs/003-equipment-loan-booking/contracts/openapi.yaml`（commit `c22fa5f`） |
| `data-plan` | 依 `D1`～`D2` 與憲法 `data-model.md` Rule 1–4 產出 `data/data-model.dbml` 並通過 `check_data_model.py` | 產出 6 張資料表與 3 個 Enum，完整遵循 4 個生命週期欄位、軟刪除、`timestamptz`/`date`、`uq_reservations_active_slot` 部分唯一索引與取消歷程保留，`check_data_model.py` 0 issues | 沒有問題 | `specs/003-equipment-loan-booking/data/data-model.dbml`（commit `c22fa5f`） |
| `tasks` | 依 User Story 與技術端點拆解任務與 Must Read／Optional 參考，包含 demo seed 任務，將上游命名差異記為 Notes 待確認並通過 `check_tasks.py` | 產出 `T001`～`T035`（含 demo seed 任務 `T009`、`T016`、`T034`、`T035`），主動記錄 `待確認 1`、`待確認 2`，`check_tasks.py` 0 issues、0 warnings | 沒有問題 | `specs/003-equipment-loan-booking/tasks.md`（commit `3a890f8`） |
| `analyze` | 不修改上游文件，執行 `collect_coverage.py` 並檢查跨文件一致性與 12 條憲法規則 | 產出 `analysis.md`（0 CRITICAL、0 HIGH、3 MEDIUM F1～F3、0 LOW），12 條憲法規則與 18 項需求涵蓋率 100% | 沒有問題 | `specs/003-equipment-loan-booking/analysis.md`（commit `3a890f8`） |
| `implement` | 依 `tasks_state.py` 順序逐一實作、驗證與打勾，執行各 Phase Checkpoint 驗證，對上游差異自主決策並輸出完成報告 | 完成 `35/35` 任務（受阻 0 個），記錄 3 條自主決策，全套單元、整合（Vitest + Supertest）與 Playwright E2E 測試全部通過 | 沒有問題 | `specs/003-equipment-loan-booking/tasks.md`、`apps/equipment-loan/`（commit `ac34799`～`61162c4`） |

## Skill 問題（交給 skill-engineering）

沒有（本次迭代 12 支相關 Skill 皆照預期運作，無發現具有證據的 Skill 缺陷；Wave 2 平行 Planner 的欄位命名映射差異記於下方「流程不足」）。

## 使用者驗證

- commit SHA：`61162c4`
- 啟動方式（從乾淨環境開始的指令）：
  ```bash
  # 1. 進入應用程式目錄
  cd apps/equipment-loan

  # 2. 安裝依賴與準備環境變數
  npm install
  npm --prefix backend install
  npm --prefix frontend install
  cp -n backend/.env.example backend/.env || true

  # 3. 啟動 PostgreSQL 18 容器、執行 migration 與載入 demo seed
  docker compose up -d --wait
  npm run db:migrate
  npm run db:seed

  # 4. 啟動後端（埠號 3000）與前端（埠號 5173，可開兩個終端機分別執行）
  npm --prefix backend run dev
  npm --prefix frontend run dev
  ```
  啟動後：
  - **一般視窗（成員視角）**：開啟 `http://localhost:5173`
  - **無痕視窗或另一個分頁（管理員／第二位成員視角）**：開啟 `http://localhost:5173`
- demo seed 重設展示資料指令（已實跑確認可隨時重設 3 組預建帳號、4 台單件設備、3 個單日固定時段與 6 筆範例預約紀錄）：
  ```bash
  npm --prefix apps/equipment-loan run db:seed
  ```
- 本次驗證情境：

| 類別 | 情境名稱 | 操作步驟 | 預期結果 |
| --- | --- | --- | --- |
| 成功操作 1 | Light Mode／Dark Mode 雙主題切換与重整 7 位數驗證碼 | 1. 開啟 `http://localhost:5173`。<br>2. 點擊右上角「深色模式」再點「淺色模式」。<br>3. 點擊驗證碼區塊的「重整驗證碼」。 | 1. 畫面即時切換深色（`#0F172A` 底）與淺色（`#F8FAFC` 底）主題。<br>2. 驗證碼立即更換為新的一組 7 位數英數驗證碼，並顯示繁體中文提示橫幅。 |
| 成功操作 2 | 成員登入、查看預建設備時段、預約固定時段並重新整理頁面 | 1. 在登入頁右側點擊林雅婷（`lin.yating`）的「帶入帳號」，點擊「登入系統」。<br>2. 在「設備預約」頁面（預設為明日日期），確認 `EQ-101` 上午為「本人已預約」、下午為「已被預約」（不顯示陳冠廷姓名）、晚間為「可預約」。<br>3. 點選 `EQ-101` 的「晚間時段 `18:00–21:00`（可預約）」，點擊右側「確認送出預約」。<br>4. 按瀏覽器重新整理（Reload）。 | 1. 登入成功進入「設備預約」頁面，右上角顯示「林雅婷（一般成員）」。<br>2. 送出預約後頁頂顯示綠色成功橫幅與預約編號，`EQ-101` 晚間時段立即變為「本人已預約」。<br>3. 重新整理頁面後仍維持林雅婷登入狀態，且 `EQ-101` 晚間時段持續顯示為「本人已預約」。 |
| 成功操作 3 | 成員查看個人預約、取消未開始預約並立即釋出時段供重新預約 | 1. 點擊頂部導覽「我的預約」（或成功橫幅的「查看我的預約」）。<br>2. 對明日上午的 `RV-20261108-03`（`EQ-101`）點擊「取消預約」，在確認對話框點擊「確認取消並釋出時段」。<br>3. 點擊「前往設備預約重新預約」回到設備預約頁。 | 1. 顯示綠色取消成功橫幅，`RV-20261108-03` 狀態改為「已取消」、填入取消時間並保留在歷史清單中。<br>2. 回到設備預約頁時，`EQ-101` 明日上午 `09:00–12:00` 已立即恢復為綠色「可預約」，可再次點選預約。 |
| 成功操作 4 | 管理員登入檢視所有預建設備與全體成員預約清單 | 1. 開啟無痕視窗進入 `http://localhost:5173`，點擊吳承翰（`wu.chenghan`，管理員）的「帶入帳號」並登入。<br>2. 在「全體預約管理」頁面切換狀態篩選（全部／有效預約／已取消）與單件設備篩選。 | 1. 登入後自動進入「全體預約管理」，上方顯示 4 台預建單件設備（`EQ-101`～`EQ-104`），下方表格顯示林雅婷與陳冠廷的所有有效與已取消預約紀錄。 |
| 關鍵失敗 1 | 7 位數驗證碼英文大小寫不符攔截與單次作廢 | 1. 在登入頁點擊「帶入帳號」（自動帶入正確驗證碼）。<br>2. 將「7 位數英數驗證碼」欄位中的任一英文字母改為相反大小寫（例如小寫 `a` 改大寫 `A`，或大寫改小寫），點擊「登入系統」。 | 1. 系統拒絕登入，顯示紅色錯誤橫幅說明驗證碼輸入錯誤（英文須區分大小寫）且原驗證碼已失效，同時自動換發新的一組 7 位數驗證碼並清空驗證碼輸入框。 |
| 關鍵失敗 2 | 同時搶約同一台設備、同一日期與同一固定時段衝突攔截 | 1. 視窗 A（林雅婷）與視窗 B（陳冠廷）都切換到同一日期，並都點選同一台設備的同一個「可預約」時段（例如 `EQ-102` 下午 `13:00–17:00`）。<br>2. 視窗 A 先點擊「確認送出預約」，接著視窗 B 點擊「確認送出預約」。 | 1. 視窗 A 預約成功並顯示「本人已預約」。<br>2. 視窗 B 被拒絕（`409 RESERVATION_CONFLICT`），顯示紅色錯誤橫幅提示該時段剛剛已被其他成員預約，且該時段自動更新為「已被預約」。 |
| 關鍵失敗 3 | 一般成員越權存取管理員全體預約清單遭拒 | 1. 在以一般成員（林雅婷）登入的視窗中，點擊頂部導覽「全體預約管理」。 | 1. 不顯示全體成員預約表格，改顯示紅色權限攔截卡片「權限不足：拒絕存取管理員全體預約清單」（提供「返回設備預約」與「切換管理員帳號登入」按鈕）。 |
| 前幾次功能回歸 | 第 1 次迭代基線確認 | 本次為第 1 次迭代（無前次迭代功能），本次驗證情境已完整覆蓋作為第 2 次迭代的回歸基線。 | 全部通過。 |

- 情境與結果：
  - **成功操作 1（Light／Dark Mode 切換與重整 7 位數驗證碼）**：通過（`data-theme="dark"` 與預設淺色即時切換；原驗證碼 `L219pUH` 重整後立即作廢並換發新 7 碼）。
  - **成功操作 2（成員登入、查看預建設備時段、預約固定時段並重新整理頁面）**：通過（林雅婷登入後預約 `EQ-101` 晚間 `18:00–21:00` 立即顯示「預約已成立」並變更為「本人已預約」，重新整理頁面後仍維持登入與「本人已預約」狀態）。
  - **成功操作 3（成員查看個人預約、取消未開始預約並立即釋出時段）**：通過（取消 `RV-20261108-03` 後狀態更新為「已取消」並保留於清單中，回到設備預約頁確認 `EQ-101` 明日上午 `09:00–12:00` 已立即恢復為「可預約」）。
  - **成功操作 4（管理員登入檢視所有預建設備與全體成員預約清單）**：通過（吳承翰登入後顯示 `EQ-101`～`EQ-104` 共 4 台設備總覽與全體成員預約紀錄，切換狀態篩選為「已取消」可檢視 `RV-20261108-03` 等已取消紀錄）。
  - **關鍵失敗 1（7 位數驗證碼英文大小寫不符攔截與單次作廢）**：通過（畫面驗證碼 `UXd66fn` 改輸大小寫相反的 `uxD66FN` 時回 `400 CAPTCHA_MISMATCH`，顯示區分大小寫錯誤橫幅、作廢原驗證碼並自動換發新驗證碼）。
  - **關鍵失敗 2（同時搶約同一台設備、同一日期與同一固定時段衝突攔截）**：通過（視窗 A 林雅婷與視窗 B 陳冠廷同時選取 `EQ-102` 明日下午 `13:00–17:00`，視窗 A 先送出成功，視窗 B 送出時收到 `409 RESERVATION_CONFLICT` 錯誤橫幅且時段更新為「已被預約」）。
  - **關鍵失敗 3（一般成員越權存取管理員全體預約清單遭拒）**：通過（林雅婷點選「全體預約管理」時隱藏表格並顯示紅色權限攔截卡片）。
- 使用者回饋：使用者指示由代理代為執行瀏覽器實際操作驗證；全部 7 個情境皆通過，驗證後已執行 `npm run db:seed` 重設展示資料。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| 步驟 5（Wave 2 `api-plan` 與 `data-plan` 平行分析） | `api-plan` 與 `data-plan` 在同一個 Wave 平行執行，彼此不讀取對方產出，導致同一概念的欄位或常數命名出現可一一對應的差異（`slot_code` 小寫 vs `slotCode` 大寫、`equipments.status` Enum vs `isActive` 布林、`reservation_no` vs `reservationNumber`） | `tasks` 需將差異列為 Notes 待確認 1、2，`analyze` 列為 MEDIUM（F1、F2），`implement` 需在後端服務層做 DTO 欄位映射 | 本次由 `tasks` Notes 待確認與 `implement` 自主決策在服務層完成無損映射；後續迭代觀察是否頻繁發生，再決定是否調整 Wave 依賴或憲法命名規則 |
| 步驟 5（Wave 1 `ui-plan` 與 Wave 2 `api-plan` 錯誤碼對照） | `ui-plan` 在 Wave 1 先完成，Wave 2 的 `api-plan` 定義了通用資源錯誤碼（`RESOURCE_NOT_FOUND`、`EQUIPMENT_UNAVAILABLE`），使 `analyze` 檢出 `ui/plan.md` §5 未單獨列出這兩個錯誤碼的表格列（F3） | 不影響實作（`tasks` T014 已將全部 14 個錯誤碼納入 `frontend/src/text/zh-TW.ts`），但會在 `analysis.md` 產生 MEDIUM 項目 | 記錄觀察，後續迭代持續追蹤跨 Wave 錯誤碼對齊情況 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
| 專案憲法增補（API 401/403 權限錯誤分離、ISO 8601 UTC + `Asia/Taipei` 時間時區、DBML 唯一性索引與業務終態歷程保留） | `.agents/constitution/skills/api-plan/openapi.md`、`.agents/constitution/skills/data-plan/data-model.md` | `b4b6ca2` | `git show b4b6ca2` | 否 |
| 迭代 1 完整 SDD 工作流產出物（`spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/`、`contracts/openapi.yaml`、`data/data-model.dbml`、`tasks.md`、`analysis.md`） | `specs/003-equipment-loan-booking/` | `fa8cd0d`、`c22fa5f`、`3a890f8` | 檢視 `specs/003-equipment-loan-booking/` 下各階段產出物與檢查報告 | 否 |
| 7 位數區分大小寫英數驗證碼、PostgreSQL 部分唯一索引（`uq_reservations_active_slot`）阻擋 10 並發搶約、時段開始前取消 `< 1 秒` 釋出並保留紀錄、Light／Dark Mode 與管理員權限攔截 | `apps/equipment-loan/backend/tests/integration/api.test.ts`、`apps/equipment-loan/e2e/equipment-loan.spec.ts` | `61162c4` | 在 `apps/equipment-loan/` 執行 `npm run test:backend` 與 `npm run test:e2e` | 否 |
