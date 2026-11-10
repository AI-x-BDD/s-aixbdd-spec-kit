# 根因報告：tasks－改變既有行為時未在同一 Phase 排既有測試更新

- 紀錄目錄：`specs/skill-engineering/46-tasks-改變既有行為時未在同一Phase排既有測試更新/`
- 問題證據：`docs/iterations/iter-5.md`「Skill 問題」問題 5、Skill 表現檢查 `tasks`（既有測試更新）列、步驟紀錄第 6 列、決策紀錄 Phase 2「T013、Checkpoint」、Phase 3「Checkpoint」、Phase 6 T043、流程不足「6 → 8」；`specs/007-equipment-maintenance-retire/tasks.md` 第 133 行（T013）、第 205 行（T022）、第 363 行（T043）與第 10 行 `**Tests**:`（commit `96ef51b`）；`git diff 96ef51b..c7c2ac6` 中 `e2e/equipment-loan.spec.ts`、`e2e/reschedule.spec.ts`、`backend/tests/unit/reschedule.test.ts` 的修改；步驟 6 的 tasks 子代理紀錄（`~/.claude/projects/-Users-steve-tsao-projects-practice-s-aixbdd-spec-kit/c9f8b892-363e-49fb-983d-4dbd94bd7c16/subagents/agent-a5938c969cb76487c.jsonl`，第 12 則委派內容、第 91～133 則讀取既有程式、第 124～125 則搜尋既有測試、第 146 則寫入 tasks.md）；`docs/iterations/iter-4.md` 流程不足「6 → 8」、決策紀錄 Phase 4 T036、Phase 6 T054；`.agents/skills/tasks/SKILL.md` Phase 1 步驟 4、Phase 2 步驟 3；`rules/任務清單-格式規範.md` Rule 1～5；`templates/tasks.md`、`templates/tasks.example.md`；`.agents/skills/implement/rules/任務實作-格式規範.md` Rule 1、`rules/任務驗證-格式規範.md` Rule 2

## 1. 使用者回報的問題

第 5 次迭代步驟 6，tasks 為 007 產出 `tasks.md`。

1. T013（Foundational）讓管理員登入後先進「設備狀態管理」頁籤，3 支既有 e2e 失敗。
2. T022（US1）在改期交易第一個語句加 `$queryRaw`（`FOR SHARE`），`backend/tests/unit/reschedule.test.ts` 的 `fakeTx` 沒有 `$queryRaw`，5 個單元測試失敗。
3. tasks 沒有在同一個 Phase 排更新既有測試的任務，只在 Polish 的 T043 寫「修正 003～006 既有測試中依賴 `isActive` 或 `unavailable` 的斷言」。既有測試沒有這類斷言，真正要改的是頁籤點擊與 mock。
4. iter-4 已發生同類問題（006 T036 把待審區塊預設改成「改期申請」分頁，005 的 e2e `:98` 失敗，留到 Polish T054），這是第 2 次。

原本預期：任務改變既有畫面、預設頁籤或資料存取方式時，在同一個 Phase 排出更新受影響既有測試的任務，寫出要改的測試與原因，讓每個 Phase 的 Checkpoint 回歸都能通過。

影響：Phase 2～5 的 Checkpoint 都帶著已知失敗 commit（Phase 2 起 e2e 3 支、Phase 3～5 backend 20/25），4 個 Phase 的回歸要靠 `/tmp` 複本比較，真正的回歸錯誤可能被已知失敗蓋住。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 某個任務會改變既有程式的行為，而既有自動化測試依賴這個行為時（例如登入後的預設頁面或頁籤、既有服務交易內對資料庫的呼叫、既有回應欄位），`tasks.md` 在同一個 Phase、排在該任務之後，有一個更新既有測試的任務；任務描述寫出要改的測試檔案、受影響的位置（測試名稱、`data-testid`、mock 物件等），以及是哪個任務的哪項行為改變造成的 | 本次 | 通用 | S1、S2 |
| E2 | 更新既有測試的任務中寫出的每個測試檔案與位置，都實際存在於專案，並且確實依賴被改變的行為；不得寫出專案中不存在的斷言或測試（例如 007 T043 的 `isActive` 斷言） | 本次 | 通用 | S1、S2 |
| E3 | spec 沒有明確要求測試時，User Story Phase 仍不產生「為新功能撰寫測試」的任務（Rule 5 不變）；更新既有測試的任務不受這個限制；`**Tests**:` 行寫出既有測試更新的做法 | 推定 | 通用 | S1、S2、S3 |
| E4 | spec 的 Success Criteria 要求前版回歸通過時（例如 007 SC-005），Polish 仍有一個重跑完整既有測試並量測通過率的任務；這個任務不再承接可以在前面 Phase 排定的既有測試修改 | 推定 | 通用 | S1、S2 |
| E5 | 專案沒有既有程式與測試（第一次開發）時，不產生更新既有測試的任務，`tasks.md` 的結構與現在相同 | 推定 | 通用 | S3 |
| E6 | 依 spec 的 User Story 與 plan.md 盤點排成 Setup、Foundational、每個 User Story 一個 Phase 與 Polish，Phase 內依資料庫、後端、前端分組；每個任務有 Must Read；上游缺口寫成 Notes 待確認；`check_tasks.py` 沒有 issues；只寫入 `tasks.md` | 既有 | 通用 | S1、S2、S3 |
| E7 | 同目錄已有 `tasks.md` 時先詢問是否覆寫；不同意時不修改任何檔案 | 既有 | 通用 | S4 |

推定理由：

- E3：Rule 5 第 2 點寫「spec 沒有明確要求時，User Story Phase 不得產生測試任務」，沒有區分「新寫測試」與「更新既有測試」。E1 要成立，必須決定兩者的關係；本報告推定只放寬既有測試更新，新寫測試的規定不變。
- E4：007 SC-005、006 都有前版回歸要求，現在由 Polish 承接（T043、T054）。E1 把修改移到前面後，Polish 的回歸任務是否保留要決定；本報告推定保留完整重跑，不再承接修改。
- E5：E1 會讓 tasks 讀既有測試。第一次開發沒有既有測試，要確認不會多出任務或改變輸出。

驗收情境：

- **S1（原始輸入，iter-5）**：以 `git archive 96ef51b specs apps/equipment-loan` 展開（`apps/` 是 006 版本的既有程式與測試），刪除 `specs/007-equipment-maintenance-retire/tasks.md`。輸入：「為 `specs/007-equipment-maintenance-retire/spec.md` 產出 tasks.md」。預先回覆：`clarify` 提問時每題選推薦選項。判斷：(1) 有任務讓管理員登入後先進「設備狀態管理」時，同一個 Phase、排在它之後有任務更新 `e2e/equipment-loan.spec.ts` 與 `e2e/reschedule.spec.ts` 中管理員登入後操作「審核與借用管理」的位置；(2) 有任務在改期交易加入鎖定設備列的查詢時，同一個 Phase、排在它之後有任務更新 `backend/tests/unit/reschedule.test.ts` 的 `fakeTx`；(3) 所有更新既有測試的任務寫出的檔案與位置都在 `apps/equipment-loan/` 中存在，沒有 `isActive`／`unavailable` 斷言這類不存在的項目；(4) User Story Phase 沒有為新功能撰寫測試的任務，`**Tests**:` 寫出既有測試更新的做法；(5) Polish 有重跑完整既有測試的任務（SC-005）；(6) `check_tasks.py` 沒有 issues，`git status` 只有 `tasks.md`。若產出沒有排出 (1) 或 (2) 的行為改變，該項記為「未觸發」，以 S2 判斷 E1。
- **S2（原始輸入，iter-4 同類）**：以 `git archive b4253c2 specs apps/equipment-loan` 展開（`apps/` 是 005 版本），刪除 `specs/006-reservation-reschedule/tasks.md`。輸入：「為 `specs/006-reservation-reschedule/spec.md` 產出 tasks.md」。預先回覆同 S1。判斷：(1) 有任務把管理員待審區塊預設改成「改期申請」分頁時，同一個 Phase、排在它之後有任務更新 `e2e/equipment-loan.spec.ts` 中核准、駁回 `RV-20261109-08`／`RV-20261109-09` 這一段（第 97 行附近），補上切換到「預約申請」分頁；(2) 同 S1 判斷 (3)～(6)。
- **S3（回歸，第一次開發）**：以 `git archive 3a890f8 specs` 展開（沒有 `apps/`），刪除 `specs/003-equipment-loan-booking/tasks.md`。輸入：「為 `specs/003-equipment-loan-booking/spec.md` 產出 tasks.md」。預先回覆同 S1。判斷：沒有更新既有測試的任務；`**Tests**:` 依 Rule 5 寫出 spec 是否要求測試；Phase 結構符合 E6；`check_tasks.py` 沒有 issues。
- **S4（回歸）**：同 S1 的環境，但保留 `tasks.md`。預先回覆：覆寫確認回答「不同意」。判斷：先詢問是否覆寫；回覆後停止，`git status` 沒有變更，`tasks.md` 雜湊值不變。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | Foundational 在 T013 之後有任務更新 3 支 e2e 的頁籤點擊；US1 在 T022 之後有任務更新 `unit/reschedule.test.ts` 的 `fakeTx` | 兩個 Phase 都沒有更新既有測試的任務，只在 Polish 的 T043 寫修斷言 | 觀察：`tasks.md` 第 133、205、363 行（`96ef51b`）；`git diff 96ef51b..c7c2ac6` 顯示 T043 實際補了 5 處 `nav-admin`／`nav-equipment-status` 點擊與 1 個 `$queryRaw` mock |
| E2 | 更新任務寫出真正受影響的測試與位置 | T043 寫「依賴 `isActive` 或 `unavailable` 的斷言」，既有測試沒有這類斷言 | 觀察：子代理第 124～125 則以 `grep "unavailable\|isActive\|cancelled"` 搜尋 `backend/tests`、`e2e`、`frontend/tests`，結果只有 `cancelled` 相關行，沒有 `isActive`／`unavailable`；之後第 146 則仍寫入 T043；iter-5 決策紀錄 Phase 6 T043 |
| E4 | Polish 只重跑完整回歸 | T043 同時承接修改與重跑 | 觀察：`tasks.md` 第 363 行 |

## 4. 演練表

`tasks`（第 5 次迭代步驟 6，主 session 委派同模型子代理執行；子代理寫完 `tasks.md` 後因額度用完中止，主 session 從 Phase 3 步驟 3 接手）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 委派內容、spec 清單 | 觀察：第 12 則委派內容指定 007 | 目標 spec | 007 | 一致 |
| P1-4 | spec 目錄的 spec、plan、techstack、research、contracts、data、ui | 觀察：第 42～88 則讀取上述檔案；第 91～133 則另外讀了 `apps/equipment-loan/` 的檔案清單、`schema.prisma`、`App.tsx`、`errorHandler.ts`、`rescheduleService.ts` 等既有程式，SOP 沒有規定 | 任務輸入（依 SOP 只有 spec 目錄） | 任務輸入含 spec 目錄與部分既有程式 | 一致（多讀的部分不是 SOP 要求） |
| P1-5 | 憲法檔 | 觀察：第 52～54 則讀 `shared.md`，沒有 tasks 憲法 | 憲法檢查清單 | 同左 | 一致 |
| P1-6～P1-8 | 無 | 無 | 有 plan.md；沒有既有 tasks.md | 沒有詢問覆寫（iter-5 步驟紀錄第 6 列） | 一致 |
| P2-1 | `rules/任務清單-格式規範.md` Rule 1～5 | 觀察：第 29 則讀取 | 任務清單檢查清單（含 Rule 5） | 同左 | 一致 |
| P2-2 | 任務輸入、檢查清單 | 已載入 | 介面對照 | 觀察：組標題列出 F1～F5、B1～B6、D1～D3（`check_tasks.py` 通過） | 一致 |
| P2-3 | 任務輸入、介面對照、憲法、檢查清單 | 已載入；觀察：第 105～106 則已看到 `App.tsx` 第 60 行 `setActiveView(user.role === "admin" ? "admin" : "booking")`，第 128～129 則已看到 `rescheduleService.ts` 的交易 | 改變既有行為的任務（T013、T022）之後，在同一 Phase 排更新受影響既有測試的任務 | 觀察：T013、T022 所在 Phase 沒有更新任務；第 124 則只用 Enum 改名的關鍵字（`isActive`、`unavailable`）搜尋測試，沒有用「被改變的行為」（管理員登入後的頁面、改期交易的呼叫）搜尋；搜尋結果沒有命中，仍在 Polish 寫 T043 修 `isActive`／`unavailable` 斷言；`**Tests**:` 寫「各使用者故事不產生測試任務……前四版回歸……放在 Polish 處理」 | 偏離 |
| P2-4～P2-6 | 無 | 無 | 憲法衝突為空，略過 `clarify` | 觀察：步驟紀錄第 6 列「沒有委派 `clarify`」 | 一致 |
| P3-1～P3-2 | tasks 樣板組 | 觀察：第 35～38 則讀取 | `tasks.md` | 觀察：第 146 則寫入 P2-3 的規劃 | 偏離（P2-3 的結果） |
| P3-3～P3-4 | `check_tasks.py`；檢查清單 | 觀察：主 session 接手，issues 0、warnings 0，依 Rule 2、4 修正 2 處 | 檢查通過 | 同左；檢查清單沒有既有測試的項目，所以沒有發現 | 一致（依現有規則） |
| P3-5 | 無 | 無 | 回報 | 觀察：主 session 回報時注意到「T043 沒有預先排既有 e2e 更新，步驟 8 要留意」（步驟紀錄第 6 列） | 一致 |

第一個偏離點：`tasks` Phase 2 步驟 3（排任務）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `tasks`／`rules/任務清單-格式規範.md`／Rule 5 第 2、3 點（Rule 1～4 也沒有） | 缺失 | 觀察：Rule 1～5 沒有任何一條寫到「任務改變既有行為時，要排更新既有測試的任務」；樣板與範例（`tasks.example.md` 是 004 購物車，第一次開發）也沒有既有測試的內容。觀察：Rule 5 第 2 點寫「spec 沒有明確要求時，User Story Phase 不得產生測試任務」，沒有區分新寫測試與更新既有測試；第 3 點把 Success Criteria 的量測（如 SC-005 回歸 100%）放在 Polish。觀察：子代理的 `**Tests**:` 寫「各使用者故事不產生測試任務……前四版回歸……放在 Polish 處理」，T043 引用 SC-005。推論：預期沒有在任何部位表達，Rule 5 的字面又把所有測試工作推到 Polish，所以子代理把既有測試的修改也放在 Polish（依據上列觀察）。觀察：iter-4 的 006 T054 同樣放在 Polish，結構相同 | 假設任務清單規範有一條：「任務改變既有程式的行為，而既有測試依賴這個行為時，在同一個 Phase、該任務之後排更新既有測試的任務，寫出測試檔案、位置與原因；這不算 Rule 5 的測試任務」。在 P2-3，T013 之後會排更新 2 支 e2e 的任務，T022 之後會排更新 `fakeTx` 的任務，Polish 只保留重跑，E1、E3、E4 成立。但要寫出正確的檔案與位置（E2），還需要 R2 |
| R2 | `tasks`／`SKILL.md` Phase 1 步驟 4 | 未載入 | 觀察：步驟 4 只讀 spec 目錄的文件，沒有讀既有程式與測試。觀察：子代理在第 91～133 則自行讀了既有程式，第 124 則以 Enum 改名的關鍵字搜尋測試，沒有命中，仍寫出 T043 的 `isActive`／`unavailable` 斷言。推論：既有測試存在於專案（`apps/equipment-loan/e2e/`、`backend/tests/`），但 SOP 沒有規定載入，也沒有規定要以「被改變的行為」查找；子代理憑自己的判斷用了錯誤的關鍵字，結果寫出不存在的斷言（依據上列觀察）。觀察：`e2e/equipment-loan.spec.ts` 第 66 行之後、`e2e/reschedule.spec.ts` 的 `openWindowAs` 都在管理員登入後直接操作審核區塊；`unit/reschedule.test.ts` 的 `fakeTx` 只有 `$executeRaw`（`git diff 96ef51b..c7c2ac6`）。以 `nav-admin`、`AdminOverviewView`、`createRescheduleRequest` 等被改變的位置搜尋，可以找到這 3 個檔案 | 假設 Phase 1 載入既有測試的清單，並在排任務時以「任務改變的檔案、函式、畫面元素」查找依賴它們的既有測試。在 P2-3，子代理會找到 3 個真正受影響的檔案，不會寫出 `isActive` 斷言，E2 成立；搭配 R1，E1 成立。第一次開發沒有既有測試，查找結果為空，E5 成立 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| 應由 implement 在改變行為的任務中順手修既有測試 | 交接缺陷／責任在下游 | 觀察：implement `rules/任務實作-格式規範.md` Rule 1 第 7、10 點規定「必須只建立或修改目前任務描述提到的檔案」、「不得加入任務沒有要求的……測試」。觀察：iter-5 決策紀錄 Phase 2 T013 Checkpoint 寫「不改專案 e2e，留給 T043」，implement 依 tasks 的安排處理。推論：implement 依規則不能修，只有 tasks 決定每個任務改哪些檔案 |
| 應由 ui-plan 或 technical-research 列出受影響的既有測試 | 交接缺陷（上游） | 觀察：ui/plan §3.1 與 research §3 決定的是行為（預設頁籤、加鎖），本身沒有錯；plan.md Source Code 只列測試目錄。推論：把「行為改變」對應到「測試檔案」需要知道任務改哪些檔案，這是任務拆解的工作，不是行為設計的工作 |
| 模型粗心，規則本身沒有問題 | 非 Skill 問題（模型能力） | 觀察：沒有任何部位要求排既有測試更新（R1 的觀察）；Rule 5 的字面反而把測試工作推到 Polish。觀察：iter-4（006 T054）與 iter-5（007 T043）兩次都一樣，執行者不同 |
| 改由 `check_tasks.py` 檢查 | 載體過弱 | 推論：哪些既有測試依賴哪項行為，要讀測試內容並理解任務描述，腳本無法可靠判斷（`check_tasks.py` 檔頭說明只檢查 ID、標籤、參考、介面涵蓋與需求引用） |
| 只是 Phase 切分不當，應在 Polish 之外另設回歸 Phase | 流程缺陷 | 推論：問題是更新任務沒有排在造成失敗的同一個 Phase；另設 Phase 仍會讓中間的 Checkpoint 帶著已知失敗，不能滿足 E1 |

## 7. 影響範圍

- 沒有 Skill 委派 `tasks`（結構診斷 `callers.tasks` 為空）。
- 下游：`implement` 依 tasks.md 執行，不需要修改；更新既有測試的任務會像一般任務一樣被執行、驗證與打勾。`analyze` 不讀既有程式，不受影響。
- 相關：`tasks` 由使用者直接觸發，runbook P6 的委派內容不需要改。

## 8. 待確認事項

1. 驗收條件 E1～E7 是否正確、完整？E1、E2 是本次；E6、E7 是既有；E3、E4、E5 是推定，請逐條確認：
   - E3：spec 沒要求測試時，仍不為新功能寫測試，只放寬「更新既有測試」。
   - E4：Polish 保留重跑完整既有測試的任務，但不再承接修改。
   - E5：第一次開發（沒有既有測試）時，輸出和現在相同。
2. 是否同意根因 R1（任務清單規範沒有既有測試更新的規定，Rule 5 的字面還把測試工作推到 Polish）與 R2（Phase 1 步驟 4 沒有載入既有測試，子代理自己用錯關鍵字查找）？
3. 責任歸屬：建議由 `tasks` 負責，不改 `implement`、`ui-plan`、`technical-research`。理由見第 6 節前兩列。
4. 驗收情境：S2 用 iter-4 的原始輸入（006 + 005 版程式），作為第 2 個真實案例；S3 用 003（沒有既有程式）確認不多排任務。是否同意？
5. 仍缺少的證據：無。子代理沒有留下推理紀錄（thinking 為空），為何用 `isActive`／`unavailable` 搜尋，只能從工具呼叫推論。

## 9. 確認紀錄

- 2026-11-10：使用者確認根因報告。
  1. 同意驗收條件 E1～E7，含推定的 E3、E4、E5。
  2. 同意根因 R1、R2。
  3. 只改 `tasks`，不改 `implement`、`ui-plan`、`technical-research`。
  4. 同意驗收情境 S1～S4。
