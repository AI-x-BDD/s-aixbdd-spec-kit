# 工程藍圖：notification-plan－建立（含 tasks、analyze 接入）

- 模式：新建（`notification-plan`）＋接入修改（`tasks`、`analyze`）
- 紀錄目錄：`specs/skill-engineering/47-notification-plan-建立/`
- 根因報告：`rca-report.md`（R1 缺少 Skill；R2 `tasks` 不讀新產出；R3 `analyze` 不讀新產出；使用者已確認）
- 確認紀錄：
  - 2026-11-11 根因報告：使用者確認驗收條件 E1～E12 正確、完整；同意 R1～R3；保留推定的 E10、E11。
  - 2026-11-11 工程藍圖：使用者確認 Skill 名稱用 `notification-plan`、產出路徑用 `notification/plan.md`；依 skill-engineering Phase 5 施工與驗收；在主目錄 `main` 施工，A 組產出只讀不改；不 push、不打 tag。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 產出 `<spec 目錄>/notification/plan.md`；每個「負責介面」恰好一個標題以「§編號 介面編號 介面名稱」開頭的章節；其他沒有 Planner、但不負責通知的介面列在「不在範疇」並寫理由 | 本次 | 通用 |
| E2 | 含 7 個主題：觸發條件、通知狀態與轉換、失敗分類、重試界線、重複處理、紀錄需求、驗收情境；每列引用 spec 中存在的需求編號 | 本次 | 通用 |
| E3 | 狀態轉換表列出上游狀態 Enum 的每個值，每個轉換寫出觸發介面、寫入欄位與需求編號；識別字逐字取自 `data/`、`contracts/` | 本次 | 通用 |
| E4 | 排程介面：觸發時機、時間來源、讀寫資料、重疊執行、系統恢復處理；外部通知服務介面：請求、回應對照、通知逐行版面與填值範例；本機替身介面：控制操作、模式、回應與錯誤回應 | 本次 | 通用 |
| E5 | 失敗分類區分「確定對方沒收到」與「不確定是否收到」；至少一個「對方可能已收到、本機沒收到回應」的驗收情境；重複處理寫殘留風險，不寫「保證不重複」 | 本次 | 通用 |
| E6 | spec 沒決定、且不同做法有不同可觀察行為的業務規則，委派 `clarify` 並寫入決定 | 本次 | 通用 |
| E7 | 需要改合約、資料模型或 UI 的項目列在「上游衝突」並寫處理 Skill；只建立 `notification/plan.md` | 本次 | 通用 |
| E8 | 有 `notification/plan.md` 時，`tasks` 的 S、N 類任務 Must Read 指向它的 § 章節，Notes 不再寫「沒有規格」的待確認 | 本次 | 通用 |
| E9 | 有 `notification/plan.md` 時，`analyze` 讀取它，`collect_coverage.py` 把有章節的介面算成有產出，相關問題的處理 Skill 填 `notification-plan` | 本次 | 通用 |
| E10 | 沒有負責通知的介面時，回報並停止，不建立檔案 | 推定 | 通用 |
| E11 | 已有 `notification/plan.md` 時先問是否覆寫；不同意時不修改任何檔案 | 推定 | 通用 |
| E12 | 沒有 `notification/` 時，`tasks`、`analyze` 行為與 `collect_coverage.py` 輸出不變 | 既有 | 通用 |

## 2. To-Be SOP

### 2.1 `notification-plan`（新建，`.agents/skills/notification-plan/`）

````markdown
---
name: notification-plan
description: 已有 plan.md 與 Planner 產出、要在 tasks 之前為沒有 Planner 的外部通知介面產出通知可靠性規劃時使用：依 plan.md 系統介面盤點挑出負責通知觸發、送出、重試與結果追蹤的介面（例如觸發通知的排程、送出與重試程序、外部通知服務與它的本機替身），參考 spec.md、技術研究結果與 contracts、data、ui 的產出，寫出觸發條件、通知狀態轉換、失敗分類與重試界線、重複處理、紀錄需求、各介面規格與驗收情境，存成 spec 目錄的 notification/plan.md；spec 沒決定的業務規則委派 clarify，需要改 API 合約、資料模型或 UI 時列為上游衝突，交回原 Planner。在 system-analysis 與 Planner 之後、tasks 之前單獨執行，不由 system-analysis 委派。使用者提到 notification-plan、通知規劃、通知可靠性、排程規格、Webhook 規格、重試與重複通知、沒有 Planner 的介面時使用。盤點介面改用 system-analysis；設計 API 合約、資料模型、畫面改用 api-plan、data-plan、ui-plan；技術選型改用 technical-research；拆任務改用 tasks。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求，以及 `ls specs/[0-9][0-9][0-9]-*/spec.md` 的檔案清單，建立「規劃輸入」。
2. `THINK` 決定「目標 spec」（指定時用指定的；未指定且清單只有一份時用該份；其餘視為未決定）。
3. `CHECK` 「目標 spec」不存在或未決定時，告知使用者並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `contracts/`、`data/`、`ui/`、`notification/` 下的檔案全文（不存在的略過），加入「規劃輸入」。
5. `READ` `.agents/constitution/shared.md` 與 `.agents/constitution/skills/notification-plan/notification-plan.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目：產出路徑 `notification/plan.md`、每個負責介面一個「§編號 介面編號 介面名稱」章節、需求編號必須存在於 spec、「上游衝突」段落。
6. `CHECK` 沒有 `plan.md` 時，告知需要先做 `system-analysis` 並停止；`techstack.md` 與 `research.md` 都不存在時，告知需要先做 `technical-research` 並停止。

完成條件：輸入已讀取，或缺少輸入已停止並回報。

## Phase 2 -- 決定規劃範疇

1. `READ` 決定範疇與設計通知規劃時，讀取 `rules/通知規劃-格式規範.md` 的所有 Rule，建立「通知規劃檢查清單」。
2. `THINK` 依「規劃輸入」與已載入的「通知規劃檢查清單」決定「負責介面」與「不在範疇介面」；使用者指定介面編號時以指定為準。
3. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有負責通知的介面、不產出檔案，並停止執行。
4. `WRITE` `notification/plan.md` 已存在時詢問是否覆寫；不存在時略過本步驟與下一步。
5. `CHECK` 同意覆寫時進入 Phase 3；不同意或未回覆時，回報沒有修改任何檔案並停止。

完成條件：「負責介面」已決定且可寫入，或已停止並回報。

## Phase 3 -- 設計通知規劃

1. `THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「通知規劃檢查清單」，為「負責介面」設計通知規劃，建立「通知設計」；同時建立「上游衝突」（只在 Phase 4 回報，不修改上游、不停止）與「業務規則缺口」。
2. `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，建立「憲法衝突」。
3. `DELEGATE` 「業務規則缺口」或「憲法衝突」不為空時，讀取 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具，以這兩項為優先提問面向，依決定調整「通知設計」；都為空時略過本步驟與下一步。
4. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先加入 `clarify`、沒有產出檔案並停止；使用者未回覆時停止並回報沒有產出檔案。

完成條件：「通知設計」已涵蓋每個「負責介面」，「業務規則缺口」都已有使用者決定。

## Phase 4 -- 產出 notification/plan.md

1. `READ` `templates/notification-plan.md` 與 `templates/notification-plan.example.md`，命名為「通知規劃樣板組」。
2. `WRITE` 依「通知規劃樣板組」與「通知設計」，將 `notification/plan.md` 寫入「目標 spec」所在目錄，不建立或修改其他檔案；說明文字語言依「憲法檢查清單」，沒有規定時用繁體中文，識別字維持原文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_notification_plan.py --spec-dir <目標 spec 目錄絕對路徑> --interfaces <負責介面編號，逗號分隔> <notification/plan.md 絕對路徑>`，取得「規劃檢查結果」；缺少 `uv` 時依官方說明安裝後重試，失敗時回報並停止。
4. `CHECK` 「規劃檢查結果」沒有 `issues`，逐條驗證「憲法檢查清單」與「通知規劃檢查清單」，比對樣板結構並確認沒有殘留 `{{`；腳本參數或環境錯誤時修正後重跑步驟 3；未通過時修正後返回步驟 3，最多 3 輪，仍未通過的記為「未通過項」。
5. `WRITE` 回報 `notification/plan.md` 路徑、每個負責介面的章節、「不在範疇介面」與理由、經 `clarify` 決定的業務規則、「上游衝突」（含處理 Skill，沒有時寫「無」）、`warnings`、「未通過項」、「憲法遵循」，以及下一步（處理上游衝突後執行 `tasks`）。

完成條件：`notification/plan.md` 已寫入並通過檢查（或未通過項已記錄），且已回報。
````

### 2.2 `tasks`（接入修改）

只改下列位置，其餘原文保留：

- frontmatter `description`：上游加入「notification-plan 產出的通知規劃（notification/plan.md）」；分流加入「通知類介面沒有規劃時改用 notification-plan」。
- Phase 1 步驟 4：讀取清單 `contracts/`、`data/`、`ui/` 改為 `contracts/`、`data/`、`ui/`、`notification/`。
- Phase 2 步驟 2：「找出 contracts、data、ui 中實作所依據的 operation、資料表或畫面」改為「找出 contracts、data、ui 中的 operation、資料表或畫面，以及 `notification/plan.md` 中以介面編號開頭的章節」。

### 2.3 `analyze`（接入修改）

只改下列位置，其餘原文保留：

- frontmatter `description`：比對對象加入 `notification/`；分流加入「要修正通知規劃改用 `notification-plan`」。
- Phase 1 步驟 5：讀取清單加入 `notification/`。

## 3. 差異表

### 刪除

無（新建模式；`tasks`、`analyze` 只改寫既有句子，不刪除元素）。

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `notification-plan` frontmatter | 新增 | 見 2.1 | E1～E11 |
| `notification-plan` SOP（4 個 Phase、20 個步驟） | 新增 | 見 2.1 | E1～E11、必要流程（確認閘門、驗證） |
| `notification-plan` `rules/通知規劃-格式規範.md` | 新增 | Rule 1～6（見 W5） | E1～E7 |
| `notification-plan` `templates/notification-plan.md`＋`.example.md` | 新增 | 8 段骨架與一份非本案的範例（見 W4） | E1、E2、E7 |
| `notification-plan` `scripts/check_notification_plan.py` | 新增 | 介面章節涵蓋、需求編號存在、識別字存在（見 W3） | E1、E2、E3 |
| `tasks` frontmatter | 修改 | 見 2.2 | E8 |
| `tasks` SOP Phase 1 步驟 4、Phase 2 步驟 2 | 修改 | 見 2.2 | E8（R2） |
| `tasks` Rule 3 第 2 條、Rule 4 第 1 條 | 修改 | 見 W8 | E8（R2） |
| `analyze` frontmatter | 修改 | 見 2.3 | E9 |
| `analyze` SOP Phase 1 步驟 5 | 修改 | 見 2.3 | E9（R3） |
| `analyze` Rule 1（E、F 類）、Rule 3（憲法檔對照）、Rule 5（處理 Skill 對照） | 修改 | 見 W12 | E9（R3） |
| `analyze` `scripts/collect_coverage.py` | 修改 | 見 W13 | E9、E12（R3） |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `tasks`、`analyze` 其餘步驟、Rule、樣板組 | 既有核心預期 | 不變 |
| `tasks` `scripts/check_tasks.py` | 既有；已確認 `section_exists` 以 `^#… §N` 或 `§N` 判斷，可驗證 `notification/plan.md` → §5.1 這類參考，不必修改 | 不變 |
| `analyze` `templates/analysis.md`＋example | 「介面涵蓋」的「Planner 產出」欄可填 `notification/plan.md` 的 §，不必改 | 不變 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Skill 數 | 25 | 26 | +1 |
| `notification-plan` Phase／步驟 | 0／0 | 4／20 | +4／+20 |
| `notification-plan` RuleFile／Rule | 0／0 | 1／6 | +1／+6 |
| `notification-plan` 樣板組／腳本 | 0／0 | 1／1 | +1／+1 |
| `tasks` Phase／步驟／RuleFile／Rule／樣板組／腳本 | 3／21／1／5／1／1 | 不變 | 0 |
| `analyze` Phase／步驟／RuleFile／Rule／樣板組／腳本 | 3／15／1／5／1／1 | 不變 | 0 |

增加理由：R1（缺少 Skill），E1～E11。`tasks`、`analyze` 只改寫既有句子，數量不變；沒有可刪除的內容，因為既有元素都仍追溯到沒有 `notification/` 時的既有預期（E12）。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 停止、覆寫詢問、`clarify` 委派、Phase 轉移 | N-P1～P3 | SOP | 流程與確認閘門必須在 SOP |
| C2 | 範疇判定：負責通知觸發／送出／重試／結果追蹤、端點類型不是前端／後端／資料庫的介面才負責；其餘列「不在範疇」寫理由 | N-P2-2 | Rule 1 | 需要判斷，腳本無法決定 |
| C3 | 識別字逐字沿用上游；上游沒有或矛盾時列「上游衝突」並寫處理 Skill，不自創欄位、Enum 值或 operationId | N-P3-1 | Rule 2 | 需要判斷何者算缺口；存在性另由 C9 腳本檢查 |
| C4 | 狀態轉換：涵蓋狀態 Enum 每個值、每個轉換有觸發介面／寫入欄位／需求、標出終態、寫系統恢復時的處理 | N-P3-1 | Rule 3 | 需要判斷內容完整性 |
| C5 | 失敗分類與重試界線：每類回應都有分類；區分確定沒收到與不確定；只對確定沒收到的自動重試；次數與等待取自 spec／research | N-P3-1 | Rule 4 | 需要判斷 |
| C6 | 重複處理：列出每個重複來源、防護、殘留風險；不寫「保證不重複」 | N-P3-1 | Rule 4 | 與 C5 同屬「可靠性判斷」主題，放同一 Rule |
| C7 | 介面規格依類型：排程／外部服務／本機替身各自的必寫項；通知內容要有逐行版面與填值範例 | N-P3-1 | Rule 5 | 必寫項依介面類型判斷，樣板只能放通用骨架 |
| C8 | 驗收情境：Given／When／Then、標介面與需求、每類失敗至少一個、至少一個「可能已收到但沒回應」；業務規則缺口的判定（spec 沒定且做法不同會有不同可觀察行為） | N-P3-1 | Rule 6 | 需要判斷 |
| C9 | 每個負責介面恰好一個章節、需求編號存在於 spec、反引號識別字可在上游找到（找不到為 warning） | N-P4-3 | 腳本 | 可由程式完成 |
| C10 | 8 段結構、表格欄位、標頭 | N-P4-2 | 樣板組 | 固定產出格式 |
| C11 | `tasks` 讀取並以 `notification/plan.md` 為介面依據 | T-P1-4、T-P2-2 | SOP 內文 | 讀取範圍是步驟本身的輸入 |
| C12 | `tasks` Must Read 的來源包含通知規劃章節；找不到依據的判斷包含 `notification/plan.md` | T-P2-3 | `tasks` Rule 3、Rule 4 | 擴充既有同主題 Rule |
| C13 | `analyze` 讀取 `notification/` | A-P1-5 | SOP 內文 | 讀取範圍 |
| C14 | `analyze` E／F 類涵蓋通知規劃；`skills/notification-plan/notification-plan.md` 對應 `notification/plan.md`；`notification/` 與 S、N 類缺口的處理 Skill 為 `notification-plan` | A-P2-4 | `analyze` Rule 1、3、5 | 擴充既有同主題 Rule |
| C15 | 介面涵蓋計入 `notification/plan.md` 中以介面編號開頭的章節 | A-P2-1 | `collect_coverage.py` | 既有腳本已負責涵蓋盤點 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `notification-plan` | 建立 frontmatter | — | 已完成 |
| 2 | W2 | `skill-form-sop` | `notification-plan` | 寫入胖 SOP | C1～C10 | 已完成 |
| 3 | W3 | `skill-derive-script` | `notification-plan` P4「檢查」 | 抽出 `check_notification_plan.py` | C9 | 已完成 |
| 4 | W4 | `skill-derive-template` | `notification-plan` P4「寫入」 | 抽出樣板組 | C10 | 已完成 |
| 5 | W5 | `skill-derive-rule` | `notification-plan` P2「決定範疇」＋P3「設計」 | 抽出 `rules/通知規劃-格式規範.md`，載入步驟放 P2 開頭 | C2～C8 | 已完成 |
| 6 | W6 | `skill-form-description` | `tasks` | 改 description | C11 | 已完成 |
| 7 | W7 | `skill-form-sop` | `tasks` | 改 P1-4、P2-2 | C11 | 已完成 |
| 8 | W8 | `skill-form-rule` | `tasks` | 改 Rule 3、Rule 4 | C12 | 已完成 |
| 9 | W10 | `skill-form-description` | `analyze` | 改 description | C13 | 已完成 |
| 10 | W11 | `skill-form-sop` | `analyze` | 改 P1-5 | C13 | 已完成 |
| 11 | W12 | `skill-form-rule` | `analyze` | 改 Rule 1、3、5 | C14 | 已完成 |
| 12 | W13 | `skill-form-script` | `analyze` | 改 `collect_coverage.py` | C15 | 已完成 |

### 工作項內容

- **W2 胖 SOP**：2.1 的 SOP，但 Phase 2 步驟 1 先不寫（RuleFile 尚未建立），C2 寫在 P2「決定負責介面」步驟內文，C3～C8 寫在 P3「設計通知規劃」步驟內文；Phase 4 步驟 1、3 先寫成「依下列結構寫入」「逐條核對下列項目」的內文（C9、C10）。
- **W3 腳本** `check_notification_plan.py`：輸入 `--spec-dir`、`--interfaces`、檔案路徑；輸出 JSON `{ok, issues, warnings}`。issues：負責介面沒有章節或有兩個以上章節；引用的 FR／NFR／SC 不存在於 spec.md；缺少樣板的 8 個頂層段落標題。warnings：反引號內、形如 snake_case 或 camelCase 的識別字在 `data/`、`contracts/`、`research.md`、`spec.md` 都找不到。只讀檔、不連網。
- **W4 樣板組**：頂層段落依序為 `## 1. 範疇`（負責介面表、不在範疇表）、`## 2. 通知狀態與轉換`（狀態表、轉換表：從／事件／到／觸發介面／寫入欄位／需求）、`## 3. 失敗分類與重試界線`（回應／分類／對方是否收到／自動重試／等待與上限／最終狀態與原因／需求）、`## 4. 重複處理`（來源／防護／殘留風險）、`## 5. 介面規格`（每個負責介面一個 `### 5.n <介面編號> <介面名稱>`）、`## 6. 紀錄需求`、`## 7. 驗收情境`（`NS1` 起編號）、`## 8. 上游衝突與使用者決定`。範例用不同主題：圖書館預約到館的 Email 通知（排程 S1、Email 服務 E1、本機 SMTP 替身 E2），不得使用 008 的內容。
- **W5 RuleFile**：Rule 1 範疇（C2）、Rule 2 識別字與上游衝突（C3）、Rule 3 狀態轉換（C4）、Rule 4 失敗分類、重試與重複（C5、C6）、Rule 5 介面規格依類型（C7）、Rule 6 驗收情境與業務規則缺口（C8）；每條 Rule 附 Good／Bad Example，範例主題同 W4，不用 008。
- **W8 `tasks` Rule**：Rule 3 第 2 條「任務實作的 operation、資料表、畫面狀態，以及限制做法的技術決策章節」加入「`notification/plan.md` 中該介面的章節與狀態轉換、失敗分類章節」，並寫「`notification/plan.md` 的部位以 § 編號定位」；Rule 4 第 1 條「在 contracts、data、ui 找不到」改為「在 contracts、data、ui、`notification/plan.md` 找不到」。範例不改（範例 spec 沒有通知介面，與新條文不矛盾）。
- **W12 `analyze` Rule**：Rule 1 E 類「介面沒有 Planner 產出」改為「介面沒有 Planner 或 `notification-plan` 產出」，F 類差異清單加入 `notification/`；Rule 3 對照加入「`skills/notification-plan/notification-plan.md` 對應 `notification/plan.md`」；Rule 5 對照加入「`notification/` 填 `notification-plan`」與「端點類型不是前端、後端、資料庫，且負責通知的介面沒有任何規劃產出時，填 `notification-plan`」。範例不改。
- **W13 `collect_coverage.py`**：新增讀取 `notification/plan.md`，只把標題以「§編號（可省略）＋介面編號」開頭的章節對應到該介面，寫入 `iface["notification"]`；`has_output` 在 `expected == "any"` 時也看 `notification`；docstring 補上。沒有 `notification/` 時輸出鍵值與修改前相同（`notification` 為空陣列除外，見 S6 判斷方式）。合約 `tags` 縮排與 `ui/plan.md`「不在範疇」誤判（iter-6 步驟 7 觀察 1）不在本次修改。

## 7. 驗收情境

測試環境：主目錄 `main`（含本次未提交的修改）的暫存複本。`specs/008-overdue-discord-notification` 與共用起點 `ae040c0` 相同，沒有 `tasks.md`、`analysis.md`、`notification/`。驗收子代理：Sonnet、medium（CLAUDE.md 模型表）。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E7 | 本次 | 「請為 specs/008-overdue-discord-notification 做通知規劃」，執行 `notification-plan` | `clarify` 提問時採推薦選項 | `notification/plan.md` 存在；S1～S3、N1、N2 各恰好一個章節；B、D、F 介面不在負責介面；8 段齊全；狀態表含 `sending`、`sent`、`failed`、`unknown`；失敗表含 6 個 `overdue_notification_failure_reason` 值；N1 有通知逐行版面與填值範例；N2 有 `/__sim/*` 控制操作與錯誤回應；有一個「可能已收到但沒回應」的情境；全文沒有「保證不重複」；`git status` 只多 `notification/plan.md`；腳本 issues 0 |
| S2 | E8 | 本次 | S1 結果目錄，執行 `tasks` | 無 | S1～S3、N1、N2 的實作任務至少各有一項 Must Read 指向 `notification/plan.md` → §；Notes 沒有「S1～S3／N1／N2 沒有規格」的待確認；`check_tasks.py` issues 0 |
| S3 | E9 | 本次 | S2 結果目錄，執行 `analyze` | 無 | `collect_coverage.py` 的 S1～S3、N1、N2 `notification` 非空；`analysis.md` 沒有「S、N 介面沒有規劃產出」的 E 類問題；位置含 `notification/plan.md` 的問題，處理 Skill 為 `notification-plan` 或含它的候選 |
| S4 | E10 | 推定 | 「請為 specs/007-equipment-maintenance-retire 做通知規劃」 | 無 | 回報沒有負責通知的介面；`git status` 沒有變化 |
| S5 | E11 | 推定 | S1 結果目錄再執行一次 `notification-plan` | 覆寫詢問回覆「不同意」 | 回報沒有修改；`notification/plan.md` 雜湊不變 |
| S6 | E12 | 回歸 | A 組 `specs/008-overdue-discord-notification`（唯讀，複製到暫存目錄） | 無 | 以修改前、修改後的 `collect_coverage.py` 各跑一次，除了每個介面多出空的 `notification` 鍵，JSON 相同；`tasks`、`analyze` 的修改都以「有 `notification/`」為條件，以逐步演練確認沒有 `notification/` 時判斷不變（在驗收結果註明是演練） |

## 8. 驗收結果

### 8.1 施工與結構

- W1～W13（共 12 項）已完成，由主 session 依 `skill-form-*`、`skill-derive-*` 的 SOP 與規範施工。順序依施工委派 Rule 3：W1 frontmatter → W2 胖 SOP（C2～C10 先寫在步驟內文）→ W3 腳本（P4 檢查）→ W4 樣板組（P4 寫入）→ W5 RuleFile（P2 開頭載入）→ W6～W8 `tasks` → W10～W13 `analyze`。
- 施工時的細節：
  1. W8：Rule 4 第 1 條改為「在 contracts、data、ui、`notification/plan.md` 找不到對應的 operation、資料表、畫面或章節時」。「或章節」是為了讓通知規劃章節算成依據，否則照字面 S、N 介面仍會被記為缺口。
  2. W3：腳本以退出狀態 1 表示有 issues，2 表示輸入錯誤，與 `api-plan` 的 `check_contracts.py` 一致。
  3. W5：撰寫時曾加入「每個非終態必須有離開的轉換」「敏感資料不得出現」兩條，藍圖沒有記載，已刪除。
  4. W2 的 P4 檢查曾寫「warnings 的識別字要確認」，To-Be 沒有，已刪除；`warnings` 只在 P4 回報。
- 腳本測試（暫存目錄）：`check_notification_plan.py` 的 `--help`、通過、4 類 issues（缺段落、介面 3 個章節、介面沒有章節、需求不存在）、輸入錯誤（exit 2）都符合；以樣板範例執行，issues 0。
- 施工後結構診斷：`audit_skill.py --skill notification-plan --skill tasks --skill analyze`，exit 0，errors 0、warnings 0。
- 同步：`./scripts/sync-skills.sh --from agents` exit 0；`--check` 為「兩邊一致」；同步輸出沒有「只存在於目標端」的 Skill。
- To-Be 一致性：`notification-plan` 為 4 個 Phase、20 個步驟，載入位置為 P2-1（RuleFile）、P4-1（樣板組）、P4-3（腳本），與 2.1 相同；`tasks`、`analyze` 只改 2.2、2.3 與 W8、W12、W13 列出的位置，Phase／步驟／Rule 數不變。

### 8.2 驗收方式

- 驗收模型：Sonnet（Agent 工具 `model: sonnet`）、推理強度 medium（`effort: medium`），`subagent_type: general-purpose`。
- 環境：scratchpad 的 `acc47/sN`，以 `git archive HEAD` 展開，複製修改後的 `.agents`、`.claude`（排除 `node_modules`）、`AGENTS.md`、`CLAUDE.md`，刪除本紀錄目錄，`git init` 後 commit 當基準：s1 `305132f`、s4 `7a758ac`；s2 `2c6f49f`、s5 `8a29fc0`（S1 結果）；s3 `b010037`（S2 結果）。
- 委派內容只有 Skill 路徑（讀 SKILL.md，不用 Skill 工具）、環境位置、使用者輸入與預先回覆；沒有分析脈絡。S1、S4 平行，S2、S5 平行，S3 最後。
- 主 session 打開每份產出核對，在環境內重跑 `check_tasks.py`，並確認主目錄沒有被子代理修改。
- S6：主 session 直接執行腳本比對，`tasks`、`analyze` 的判斷以逐步演練確認。

### 8.3 各情境結果

| 情境 | 結果 | 依據 |
| ---- | ---- | ---- |
| S1（008，`notification-plan`） | 通過 | `notification/plan.md` 323 行；S1～S3、N1、N2 各一個 §5.n 章節；F、B、D 不在負責介面；8 段齊全；狀態表含 `sending`、`sent`、`failed`、`unknown`；失敗表含 6 個 `overdue_notification_failure_reason` 值；N1 有 4 行版面與填值範例；N2 有 `/__sim/state`、`/__sim/mode`、`/__sim/messages` 與錯誤回應；NS9、NS10 為「對方可能已收到」情境且不自動重送；沒有「保證不重複」；委派 `clarify` 1 題（「已逾期多久」的格式），寫入 UD1；腳本 1 輪 issues 0、warnings 0；`git status` 只多 `notification/` |
| S2（S1 結果，`tasks`） | 通過 | 40 個任務；S1～S3 由 T010～T013、N1 由 T008、T009、N2 由 T007 的 Must Read 指向 `notification/plan.md` → §5.1～§5.5，另有 §2、§3 等；Notes 待確認 1～4 沒有「S、N 沒有規格」，待確認 4 指向 `notification/plan.md` §5.1 的設定值範圍缺口；`check_tasks.py` 第 2 輪 issues 0、warnings 0（第 1 輪 1 則 warning 由子代理修正）；`git status` 只多 `tasks.md` |
| S3（S2 結果，`analyze`） | 通過 | `collect_coverage.py` 的 S1～S3、N1、N2 `notification` 都非空；`analysis.md` 沒有 E 類問題；位置含 `notification/plan.md` 的 C1，處理 Skill 為 `notification-plan`；`analysis.md` 介面涵蓋表列出 `notification/plan.md` → 5.n；`git status` 只多 `analysis.md` |
| S4（007，沒有通知介面） | 通過 | 子代理在 Phase 2 步驟 3 停止，回報 `plan.md` 沒有負責通知的介面；`git status` 為空 |
| S5（S1 結果，覆寫回覆「不同意」） | 通過 | 子代理在 Phase 2 步驟 4 詢問覆寫，收到「不同意」後在步驟 5 停止並回報沒有修改；雜湊值 `37c61a88…` 與基準相同；`git status` 為空 |
| S6（A 組 008 唯讀複本，回歸） | 通過（腳本實跑＋逐步演練） | 修改前、修改後的 `collect_coverage.py` 各跑一次，移除每個介面的空 `notification` 鍵後 JSON 完全相同。演練：`tasks` P1-4、P2-2、Rule 3、Rule 4 新增的部分都以 `notification/` 存在為前提，沒有時判斷不變；`analyze` P1-5、Rule 1、Rule 3 同樣不變。例外是 E9 刻意加入的 Rule 5 第 3 點：排程、通知服務介面沒有任何規劃產出時，處理 Skill 從「需要使用者決定」改為 `notification-plan`。這只影響有這類介面的 spec（A 組 E1～E3），007 以前的 spec 沒有這類介面 |

### 8.4 觀察（不列為根因）

1. S1 的 N2 控制端點錯誤回應：`research.md` §6 只定義控制端點的路徑，沒有定義回應碼。子代理依 Rule 5 補上 `204` 與 400 `{"error": "unknown mode"}`，內容與樣板範例相同。這屬於 `notification-plan` 應規劃的介面規格（E4），不是自創上游識別字；只是寫法直接沿用範例。
2. S1 §5.1 寫「由唯一約束保證同一筆借用只建立一則」。這句說的是建立通知列，不是「送出不重複」；§4 已列出送出重複的殘留風險。
3. S3 的 `collect_coverage.py` 把 B1～B4 的 `contracts` 判成空（合約 `tags` 縮排），S1～S3、N1 的 `ui` 掛上 `ui/plan.md`「1. 畫面範疇」。兩者都是 iter-6 步驟 7 觀察 1，不在本次修改（附錄第 5 點）。
4. S3 子代理沒有在最後另外輸出回報，只寫在 `analysis.md`「下一步」。這一步未受本次修改影響。
5. S2 子代理中途有一次 `git status` 在主目錄執行（唯讀）；主目錄 `git status` 核對沒有多出變更。

### 8.5 個案驗收條件的調整建議

無。本次所有驗收條件都是通用。附錄第 4 點（`constitution` 的產出物對照表沒有 `notification/`）仍待記入 `docs/待確認.md`。

### 使用者實際驗證（2026-11-11）

- 方式：
  - 以 `user-verify-skill` 執行，測試模型為 Sonnet、推理強度 medium。
  - 暫存專案（scratchpad 外的 `mktemp -d`）放入主目錄 `specs/008-overdue-discord-notification` 複本（沒有 `notification/`、`tasks.md`、`analysis.md`）與 `.agents/constitution/` 複本；`.claude/skills/` 只放 `notification-plan` 與 `clarify`；初始 commit `800202e`。
  - 以 Herdr 在旁邊的 pane 啟動全新的 Claude Code（測試 session `uv47`）。
  - 實跑需求依使用者規則以路徑指定 Skill：「請讀取 `.claude/skills/notification-plan/SKILL.md`，依其 SOP 為 `specs/008-overdue-discord-notification` 做通知規劃。」
- 權限處理：
  - 信任資料夾：第一次啟動時選到 `No, exit`，session 結束；在同一 pane 重新啟動，依使用者指示選 `Yes, I trust this folder`。
  - 測試 session 為 auto mode，實跑中沒有出現權限確認，主 session 沒有自行放行任何操作。
  - `clarify` 2 題轉給使用者，使用者都選推薦選項。
- 結果（1 輪，使用者判定通過）：
  - 產出 `notification/plan.md` 387 行；`git status` 只多這個檔案；主 session 重跑 `check_notification_plan.py`（`--no-cache`）為 `ok`，issues 0、warnings 0。
  - E1 符合：S1～S3、N1、N2 各一個 §5.n 章節；「不在範疇」寫「無」並寫理由。
  - E2 符合：8 段齊全，需求編號都存在於 spec。
  - E3 符合：狀態表含 `sending`、`sent`、`failed`、`unknown`，每個轉換寫出觸發介面、寫入欄位與需求編號；6 個 `overdue_notification_failure_reason` 值都出現。
  - E4 符合：S1～S3 有觸發時機、時間來源、讀寫、重疊執行與系統恢復；N1 有 6 行版面與首次、重送兩個填值範例；N2 有 `/__sim/state`、`/__sim/mode`、`/__sim/messages` 與 400 錯誤回應。
  - E5 符合：失敗表有「對方是否收到」欄；NS12、NS13 為「對方可能已收到」情境；§4 寫殘留風險；全文沒有「保證不重複」。
  - E6 符合：`clarify` 2 題，寫入 UD1（逾期時間用「小時加分鐘」）、UD2（管理員重送第一行加「（重送）」）。
  - E7 符合：UC1、UC3 交 `technical-research`，UC2 交 `data-plan`；只建立 `notification/plan.md`。
  - 觸發：以路徑指定，未驗證自動觸發。
- 觀察：
  1. Phase 1 步驟 4 要求讀 `contracts/`、`ui/` 全文；測試 session 只以 grep、sed 讀 `openapi.yaml` 片段，沒有讀 `ui/`，檔頭「上游」卻列出 `ui/plan.md`。這次 F2 確認視窗的內容來自 `spec.md`，結果沒有錯。
  2. UD2 是 `clarify` 推薦選項帶入的新行為（spec 沒有要求標示重送），也因此產生 UC2（`overdue_notifications` 沒有欄位能分辨管理員重送）。
  3. 與 8.3 的 S1 比較：本輪多問 1 題，多出 UC1～UC3 上游衝突。
- 結論：使用者判定通過；移除 `description` 的「（未驗證）」前綴，`./scripts/sync-skills.sh --from agents` 與 `--check` 皆 exit 0、兩邊一致。觀察 1、2 不在本次修改。

## 附錄：Skill 以外的影響（不在本次施工）

1. runbook：第 8 節第 5 點的 B 組流程需要一個新提示詞（在 P5 之後、P6 之前執行 `notification-plan`），並在 9.0 階段對照補一列；到 A/B 流程第 5 點時再改。
2. B 組 worktree 在 `ae040c0`，沒有新 Skill；第 5 點開始前，要把本次 Skill 的 commit 帶進 `ab/group-b`（例如 cherry-pick 或 merge `main`），並記錄 Skill 版本 SHA。
3. `system-analysis`：不修改（閘門決定 1）。它的回報仍寫「沒有 Planner，未分析」。
4. `constitution`：`rules/一致性檢查-格式規範.md` 的產出物對照表沒有 `notification/`。目前沒有 `skills/notification-plan/` 憲法檔，不影響本次；記入 `docs/待確認.md`。
5. iter-6 步驟 7 觀察 1（`collect_coverage.py` 的合約 `tags` 縮排與 `ui/plan.md`「不在範疇」誤判）：不在本次修改，留到步驟 10 分類。
