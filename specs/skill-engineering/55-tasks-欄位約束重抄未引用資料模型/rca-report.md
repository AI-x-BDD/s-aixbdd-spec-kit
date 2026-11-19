# 根因報告：tasks－欄位約束重抄未引用資料模型

- 紀錄目錄：`specs/skill-engineering/55-tasks-欄位約束重抄未引用資料模型/`
- 問題證據：
  - 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md` 第 3.2 節 C14（「改用引用可刪掉任務描述裡重抄的約束，符合單一溯源」）、第 4 節批 2 第 3～5 點、第 6 節批 2 那一列。
  - 上游批 2 第 1 步：`specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/blueprint.md` 第 1 節「固定寫法」（「驗證」「轉換」「跨欄位」）。
  - Skill 檔案：`.claude/skills/tasks/` 的 `SKILL.md`、`rules/任務清單-格式規範.md`、`templates/tasks.md`、`templates/tasks.example.md`、`scripts/check_tasks.py`（全文）。
  - 產出檔：`specs/008-overdue-discord-notification/tasks.md` T003、T011，與同目錄 `data/data-model.dbml` 第 77 行。
  - 上游 v1.4.2：`.spec-kit/v1.4.2/templates/commands/tasks.md:74、81、201-204`；`.spec-kit/v1.4.2/templates/tasks-template.md`（沒有欄位引用的寫法）。
  - 上游樣本：session 暫存沙盒 `sk142-tasks/`（`specify init`，`git+https://github.com/github/spec-kit.git@v1.4.2`，`--integration claude`）放入 008 的 `spec.md`、`plan.md`、`data/`、`contracts/`，以 headless Claude（Sonnet）執行 `/speckit-tasks`，產出 39 個任務。上游 `setup-tasks.sh` 只偵測功能目錄根層的 `data-model.md`，所以另放一份內容同 `data/data-model.dbml` 的 `data-model.md`。沙盒在 session 暫存區，可能被清除；下面引用的內容已摘錄在本報告。

## 1. 使用者回報的問題

調整計畫 C14 要求 `tasks` 引用資料模型的欄位，不在任務描述重抄約束。現在的 `tasks` 會把資料模型的欄位定義整段抄進任務描述，抄的時候會漏掉約束。資料模型因此不是欄位約束的唯一來源，`analyze`（C15）也沒有引用可以檢查。

## 2. 驗收條件

「受約束欄位」在本報告指：`data-model.dbml` 中欄位 `note` 以「驗證：」或「轉換：」開頭的欄位，以及資料表 `Note` 的「跨欄位：」括號內列出的每個 `table.column`（`data-plan` 的固定寫法）。界定方式見 E2，是推定，請確認。

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 每個受約束欄位，至少有一個實作它的任務在 Must Read 寫 `` `data/data-model.dbml` → `table.column` ``；`table` 是資料模型中的資料表，`column` 是該資料表的欄位 | 本次 | 通用 | S1、S2 |
| E2 | 受約束欄位只包含「驗證」「轉換」「跨欄位」寫到的欄位。只有型別與設定（`varchar(n)`、`not null`、`unique`、`Enum`、`default`）的欄位，建立資料表的任務以 `` `data/data-model.dbml` → `Table <table>` `` 引用即可，不要求逐欄引用。推定理由：上游把型別與 nullable 也算受約束，幾乎每個欄位都要引用；上游樣本 T003 一個任務就列了 `overdue_notifications` 的 14 個欄位。`data-plan` 已把需求規定的約束用固定寫法分出來 | 推定 | 通用 | S1、S2 |
| E3 | 任務描述不重述資料模型已有的約束：型別、長度、數值範圍、格式、預設值、可否為空、唯一、Enum 的值清單、狀態轉換。任務描述可以寫出欄位名稱，以及任務要寫入或比對的值（例如 `status = 'sent'`） | 本次 | 通用 | S1、S2、S3 |
| E4 | 任務比資料模型多加或收窄的限制，在任務描述以「任務限定：」標出，且不和資料模型矛盾。推定理由：上游 `tasks.md:204` 只允許寫新增或收窄的限制並要標出；上游樣本 T007、T024 寫成「任務限定：」。沒有這條，E3 會讓任務寫不出必要的額外限制 | 推定 | 通用 | S1 |
| E5 | 寫出 `tasks.md` 前檢查 E1：找出沒有被引用的受約束欄位，以及資料模型中找不到的 `table.column`；先修正再寫出，3 輪仍未通過時列為「未通過項」並回報 | 本次 | 通用 | S1、S2 |
| E6 | 資料模型沒有受約束欄位（例如 `data-plan` 改版前的舊寫法）時，不要求逐欄引用，也不因此判定未通過；E3 仍適用。推定理由：計畫風險 R12 規定舊目錄不重跑；上游 `analyze.md:106` 規定沒有受約束欄位時不適用，不虛構欄位 | 推定 | 通用 | S3 |
| E7 | Phase 依 Setup、Foundational、每個 User Story、Polish 排列；Phase 內依資料庫 → 後端 → 前端分組，組標題寫介面編號 | 既有 | 通用 | S1、S2、S3 |
| E8 | 每個任務至少一項 Must Read；部位的識別字在上游文件逐字存在；Why 寫出部位決定任務的哪一部分；Optional 的 Why 以「……時」寫出情況 | 既有 | 通用 | S1、S2、S3 |
| E9 | 上游缺少或矛盾的部位寫成 Notes 的「待確認 n」，受影響的任務標出編號；不寫出上游沒有的 operationId、路徑、資料表、欄位或錯誤碼 | 既有 | 通用 | S1、S2、S3 |
| E10 | 測試任務依 spec 是否要求與既有測試的依賴而定，`**Tests**:` 行寫出依據 | 既有 | 通用 | S1、S2 |
| E11 | `check_tasks.py` 沒有 `issues`；區塊順序與樣板一致；沒有殘留的 `{{`；`implement` 的 `tasks_state.py status` 的 `format_issues` 為空 | 既有（`tasks_state.py` 一項來自計畫批 2 第 5 點） | 通用 | S1、S2、S3 |
| E12 | 只寫入 `tasks.md`；已有 `tasks.md` 時先取得覆寫同意，不同意時不修改任何檔案 | 既有 | 通用 | S1、S4 |
| E13 | 回報路徑、各 Phase 任務數、待確認、`warnings`、「未通過項」與「憲法遵循」 | 既有 | 通用 | S1、S2、S3 |

驗收情境（施工後在暫存專案複本執行；S1、S2 先以改版後的 `data-plan` 重跑資料模型，取得新寫法）：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E5、E7～E13 | 本次 | 暫存複本對 `specs/008-overdue-discord-notification/` 依序執行 `data-plan`（資料庫介面）與 `tasks` | 兩個覆寫詢問都回覆「同意覆寫」 | (1) `check_data_model.py` 報告的每個 `constrained_fields` 與「跨欄位」列出的欄位，都在某個任務的 Must Read 以 `` `data/data-model.dbml` → `table.column` `` 出現，包括 `overdue_notifications.auto_retry_count`；(2) 建立 `overdue_notifications` 的任務描述沒有欄位型別、預設值、可否為空、範圍與 Enum 值清單；(3) 有額外限制的任務以「任務限定：」標出；(4) 故意把一個引用改成不存在的欄位、刪掉一個受約束欄位的引用時，檢查都會找出來；(5) `check_tasks.py` 沒有 `issues`，`tasks_state.py status` 的 `format_issues` 為空；(6) 只有 `data/data-model.dbml` 與 `tasks.md` 改變 |
| S2 | E1～E3、E5、E7～E11、E13 | 本次（換情境） | 暫存複本對 `specs/006-reservation-reschedule/` 依序執行 `data-plan` 與 `tasks` | 兩個覆寫詢問都回覆「同意覆寫」 | 同 S1 的 (1)(2)(5)；`reschedule_requests.reject_reason`（200 字）、`captcha_challenges.captcha_code`（英數 7 碼）、`reschedule_requests.status` 的轉換都只以引用出現，任務描述沒有重抄 |
| S3 | E3、E6～E9、E11、E13 | 回歸 | 暫存複本對 `specs/002-room-game-chat/` 只執行 `tasks`（資料模型維持舊寫法，沒有固定寫法） | 覆寫詢問回覆「同意覆寫」 | 沒有因缺少逐欄引用而列「未通過項」；建立資料表的任務以 `Table <table>` 引用，沒有重抄欄位定義；`check_tasks.py` 沒有 `issues` |
| S4 | E12 | 回歸 | 暫存複本對 `specs/004-equipment-approval-review/` 執行 `tasks` | 覆寫詢問回覆「不同意」 | 回報沒有修改既有 `tasks.md`；`git status` 與執行前相同 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 受約束欄位以 `table.column` 引用 | 引用整張表，或寫成 `Table x` 的 `column` | 觀察：008 `tasks.md` T003 的 Must Read 為 `Table overdue_notifications` — Why「欄位、預設值、可為空的條件、唯一約束與三個索引」；T011 寫 `Table overdue_notifications` 的 `next_attempt_at`、`auto_retry_count`。觀察：`rules/任務清單-格式規範.md` Rule 3 Good Example 寫 `Table reservations` 的 `expires_at` |
| E3 | 任務描述只留引用 | 任務描述重抄欄位定義，且漏掉約束 | 觀察：008 T003 寫 `attempt_count` 與 `auto_retry_count`（`Int`，預設 0）、`next_attempt_at`、`last_attempted_at`、`sent_at`（`Timestamptz(6)`，可為空），沒有 `data/data-model.dbml:77` 的「0～3」 |
| E3 | 範例只留引用 | 樣板範例本身整段重抄 DBML 定義 | 觀察：`templates/tasks.example.md` T008、T016、T026 把 `products`、`carts`、`cart_items`、`orders` 的每個欄位寫成 `quantity integer [not null]`「必須大於 0，以 `CHECK (quantity > 0)` 保證」這種形式 |
| E4 | 任務多加的限制標出 | 沒有規定，額外限制與重抄的約束混在一起 | 觀察：Rule 1～Rule 5 沒有任何條列提到任務自己的限制要怎麼標 |
| E5 | 寫出前檢查欄位引用 | 沒有欄位層級的檢查 | 觀察：`check_tasks.py` 的 `token_exists` 遇到 `a.b` 只檢查 `b` 這個字在檔案任何位置出現（第 62～64 行），不檢查 `b` 是否屬於資料表 `a`；也沒有受約束欄位的涵蓋檢查 |

上游樣本的寫法（供設計參考，不是落差）：
- 上游在任務描述內寫 `` `data-model.md` `overdue_notifications.auto_retry_count` ``，13 行任務有這種引用；檔頭加一句「欄位約束以 `data-model.md` 為準……不重述；任務自行追加的限制會標明『任務限定』」。
- 上游把型別、預設值、可否為空都算受約束，T003 列出 `overdue_notifications` 的 14 個欄位。
- 上游 T015、T025 仍寫出 `auto_retry_count` < 3、`attempt_count` 加 1 等處理步驟。這些是任務要做的事，不是欄位定義。

## 4. 演練表

`tasks`（以 008 的產出為對象；當次對話紀錄沒有保存，載入行為只能從產出推論）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 目標 spec | 觀察：`tasks.md` 的 Input 為 `/specs/008-overdue-discord-notification/` | 一致 |
| P1-4 | 上游文件全文 | 觀察：任務引用 `data/data-model.dbml`、`notification/plan.md` §5.2 等 | 含資料模型的任務輸入 | 觀察：T003 寫出 `data-model.dbml` 的欄位名稱與索引名稱 | 一致 |
| P1-5～P1-8 | 憲法檔 | 無證據 | 憲法檢查清單 | 無法核對 | 無證據 |
| P2-1 | `rules/任務清單-格式規範.md` | 推論：已讀取（產出符合 Rule 1 分組、Rule 3 的 Must Read 與 Why 格式） | 任務清單檢查清單 | 觀察：清單內沒有欄位引用與「不重抄約束」的條列（RuleFile 只有 Rule 1～5） | 一致 |
| P2-2 | 檢查清單 | — | 介面對照 | 觀察：組標題含 D1、B1 等介面編號 | 一致 |
| P2-3 | 任務輸入、介面對照、檢查清單 | — | 任務描述只引用資料模型的欄位約束 | 觀察：T003 重抄欄位型別與預設值，漏掉「0～3」；T003、T011 以整張表或 `Table x` 的 `column` 引用 | 偏離 |
| P2-4～P2-8 | 既有測試 | — | 既有測試依賴、憲法衝突 | 與欄位引用無關 | 一致 |
| P3-1 | 樣板組 | 推論：已讀取（區塊順序與樣板一致） | 樣板組 | 觀察：範例 T008、T016、T026 示範整段重抄 | 一致 |
| P3-2～P3-4 | 樣板組、腳本 | — | 檢查結果 | 推論：Rule 與腳本都沒有欄位引用的項目，檢查只能通過（依據 `check_tasks.py` 全文與 RuleFile） | 一致 |

第一個偏離點：P2-3（`THINK` 寫出任務描述與 Must Read／Optional）。P2-3 依的「任務清單檢查清單」沒有欄位引用的要求。Rule 2 第 2 條要求「從上游文件原樣帶入……資料表與欄位名稱、Enum 值」，沒有區分欄位名稱和欄位約束。P3-1 載入的範例再示範整段重抄。推論：模型照範例把欄位定義抄進任務（依據 P2-1、P3-1 的觀察）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `tasks`／`rules/任務清單-格式規範.md` Rule 2 第 2 條與 Rule 3（Good Example 的 `Table reservations` 的 `expires_at`）；`templates/tasks.example.md` T008、T016、T026；`templates/tasks.example.md` 的 Reference Loading Contract 第 4 點（`data/data-model.dbml` 只列 `Table`、`Enum`、`Ref`）；`scripts/check_tasks.py` 沒有欄位引用的檢查 | 缺失 | 觀察：Rule 1～5 沒有「以 `table.column` 引用受約束欄位」「不重述資料模型的約束」「任務限定要標出」任一條。觀察：Rule 2 第 2 條只要求帶入識別字；範例反過來示範整段重抄。觀察：Contract 第 4 點沒有 `table.column` 這種部位。觀察：上游 v1.4.2 `tasks.md:201-204` 把資料模型當欄位約束的唯一來源，要求引用、不重述、標出任務自己的限制，`:81` 要求寫出前檢查每個受約束欄位都有引用。推論：預期沒有在任何部位表達，P2-3 只能照範例重抄（依據 008 T003 與範例 T008 的寫法相同的觀察）。 | 假設 RuleFile、範例與 Contract 規定 `table.column` 引用、不重述約束、標出任務限定，腳本檢查涵蓋與可解析：P2-3 會為每個受約束欄位寫引用、不抄定義；P3-4 會找出漏引與錯引；E1～E6 可滿足。E7～E13 的既有要求不受影響（Phase、分組、Must Read 格式、待確認、測試、覆寫、回報都不變）。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：規則與範例沒有在規劃前載入 | 未載入 | 觀察：SKILL.md Phase 2 步驟 1 在規劃前讀取全部 Rule；008 產出符合 Rule 1 的分組與 Rule 3 的 Must Read 與 Why 格式 |
| H3：資料模型沒有交出約束 | 交接缺陷 | 觀察：`data/data-model.dbml:77` 的 `auto_retry_count` note 有「0～3」；T003 的 Must Read 列了 `Table overdue_notifications`，輸入已經到達。`data-plan` 的固定寫法已在批 2 第 1 步完成 |
| H4：模型能力不足 | 非 Skill 問題 | 觀察：上游樣本以同一份輸入、同級模型寫出了 `Entity.field` 引用與「任務限定」；推論：有規則時模型做得到，落差來自本 Skill 沒有規則（依據上游樣本的觀察） |
| H5：檢查只交給 AI，腳本沒有檢查 | 載體過弱 | 觀察：偏離發生在 P2-3 規劃，不在 P3-4 檢查；推論：沒有引用規則前，腳本沒有東西可檢查，這是 R1 的結果（依據演練表）。`token_exists` 只比對欄位名稱的弱點列在落差 E5，施工時一起處理 |

## 7. 影響範圍

- 呼叫 `tasks` 的 Skill：無。結構診斷的呼叫圖沒有指向 `tasks` 的邊；以內文核對，`bug-fix`、`notification-plan` 只在分流說明中提到 `tasks`，不委派它。
- 讀取 `tasks.md` 的下游（不是呼叫者）：
  - `implement`：`tasks_state.py` 只要求參考行以 4 個以上空白加 `- ` 開頭（`REF_LINE_RE`），不解析部位內容；Must Read 改寫成 `table.column` 不影響解析。`implement` 依 Reference Loading Contract 讀部位，Contract 第 4 點會多一種部位。
  - `analyze`：批 2 第 3 步，會依新的引用做欄位涵蓋表（C15）。
- 上游 `data-plan`：不受影響，只被讀取。
- runbook：計畫第 6 節批 2 要在步驟 6、7 的檢查點加欄位引用與涵蓋表，`analyze` 做完後一起改。
- 既有 `specs/` 的 `tasks.md` 不重跑（計畫風險 R12）。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整？
2. E2（受約束欄位只算「驗證」「轉換」「跨欄位」，型別與設定以整張表引用）是推定，和上游的界定不同。是否同意？
3. E4（任務多加的限制標「任務限定：」）、E6（舊寫法的資料模型不要求逐欄引用）是推定，是否保留？
4. 是否同意第 5 節的根因 R1？
5. 缺少的證據：當次產出 008 `tasks.md` 的對話紀錄沒有保存，載入行為只能從產出推論。R1 可由 Skill 檔案直接核對，不受影響。

## 9. 確認紀錄

- 2026-11-19，使用者回覆「都同意，E2、E4、E6 保留，繼續 Phase 3」：
  - 第 2 節驗收條件 E1～E13 與驗收情境 S1～S4 正確、完整；推定的 E2、E4、E6 保留。
  - 同意根因 R1。
