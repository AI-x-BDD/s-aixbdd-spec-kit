# 工程藍圖：constitution－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/31-constitution-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「都照建議」，確認全部驗收條件、To-Be SOP 與施工工作項；推定的 E9、E12、E13、E14 均同意；不加根目錄 `CONSTITUTION.md`，共用規則維持 `shared.md` 單一檔案；施工前已 commit 範例憲法檔（`bfba9e5`）。施工差異：W1 被 `skill-form-description` Rule 1 拒絕（description 含角括號），預檢另發現 W5 同時對應兩個步驟、違反 `skill-derive-rule` 的單一步驟定位；修正為 description 改寫路徑、W5 拆成鎖定項目與落點兩個 RuleFile，使用者回覆「確認」

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 每條規則寫入落點表指定的檔案：`.agents/constitution/skills/<產出該產出物的 Skill>/<落點表的檔名>.md`；適用全部產出物的規則寫入 `.agents/constitution/shared.md` | 本次 | 通用 |
| E2 | 不向使用者詢問寫入位置；回報時寫出每條規則的檔案路徑與選擇理由 | 本次 | 通用 |
| E3 | 規則必須適用全部產出物、而且寫法不需依產出物改變，才寫入 `shared.md`；只適用部分產出物時，分別寫入每個產出物的檔案，`shared.md` 不變 | 本次 | 通用 |
| E4 | 憲法檔從 `# Rule 1 - <名稱>` 開始，沒有檔案標題、Apply To 或其他 metadata；每條 Rule 依序包含條列說明、`## Good Example`、`## Bad Example`；Rule 從 1 連續編號 | 本次 | 通用 |
| E5 | 規則強度只用「必須」、「不得」、「應」、「可以」表達 | 本次 | 通用 |
| E6 | 規則只包含使用者提出的要求與澄清結果；寫成規則必須、但使用者沒有給出的細節（例如數值、命名、適用範圍）委派 `clarify` 詢問，不自行決定 | 本次 | 通用 |
| E7 | 要求新增流程步驟、測試、改變 Skill 執行順序或處理方式的需求，不寫入憲法；回報原因，並建議以 `skill-engineering` 新增或修改 Skill | 本次 | 通用 |
| E8 | 和目標 Skill 的鎖定項目（下游 Skill 或檢查腳本依賴的結構）衝突的需求，不寫入憲法；回報衝突的結構與依賴者 | 本次 | 通用 |
| E9 | 需求和落點檔中既有 Rule 規範同一個面向時，修改該 Rule，不新增重複的 Rule；其他 Rule 原文不變 | 推定：「一次增加一點」需要決定新需求和既有規則重疊時怎麼處理；新增重複 Rule 會讓同一面向有兩個來源 | 通用 |
| E10 | Good Example 與 Bad Example 使用專案自己的領域情境，並使用該產出物的實際格式（例如 OpenAPI 用 YAML、資料模型用 DBML） | 本次 | 通用 |
| E11 | 只建立或修改 `.agents/constitution/` 下的憲法檔；不修改任何 Skill，也不建立索引、Module 或 Pack 檔 | 本次 | 通用 |
| E12 | 需求的目標產出物不在落點表時，不寫入；回報該產出物尚未接入憲法機制，建議先以 `skill-engineering` 接入 | 推定：落點表只列已接入的 SDD Skill，Skill 執行時必須決定表外產出物怎麼處理 | 通用 |
| E13 | 寫入前不設確認閘門；完成澄清後直接寫入，寫入後回報，由使用者以 git 檢視差異 | 推定：課程示範中 Skill 直接寫入、老師寫入後檢視；憲法檔由 git 版控，可以還原 | 通用 |
| E14 | 委派 `clarify` 時，整個 session 最多問 3 題 | 推定：憲法需求通常範圍小，3 題足以補齊數值與命名；超過 3 題代表需求應拆成多次執行 | 通用 |

## 2. To-Be SOP

````markdown
---
name: constitution
description: 要為專案新增或修改憲法規則、約束某個 SDD Skill 產出物的內容時使用：依使用者描述的規範判斷規則屬於哪個 Skill 的哪個產出物，寫進 `.agents/constitution/` 下對應的憲法檔，全部產出物共用時才寫進 `shared.md`；每條規則附 Good／Bad Example，缺少的細節委派 clarify 詢問，拒絕改變 SDD 流程或下游追溯結構的需求。使用者提到 constitution、憲法、專案規範、API 風格、資料規範、產出物約束時使用。要新增或改變 SDD 流程、步驟或測試時改用 skill-engineering；寫 spec.md 改用 s-specify。
---

# SOP

## Phase 1 -- 判斷規則落點

1. `READ` 使用者需求，以及專案根目錄 `.agents/constitution/` 下所有既有憲法檔，建立「憲法輸入」。
2. `READ` 判斷落點時，讀取 `rules/憲法落點-格式規範.md` 的所有 Rule，建立「落點檢查清單」。
3. `THINK` 依「落點檢查清單」把使用者需求拆成「規則需求」，為每項決定落點檔案，以及新增 Rule 或修改哪一條既有 Rule；不寫入的需求列入「拒絕清單」，寫出原因與建議的做法。
4. `READ` 每項「規則需求」的目標 Skill（專案根目錄 `.agents/skills/<Skill>/`，不存在時改讀 `.claude/skills/<Skill>/`）的 `SKILL.md`、`rules/`、`templates/`，以及腳本的檔頭說明，建立「目標 Skill 現況」。
5. `READ` 檢查鎖定項目時，讀取 `rules/鎖定項目-格式規範.md` 的所有 Rule，建立「鎖定檢查清單」。
6. `THINK` 依「鎖定檢查清單」與「目標 Skill 現況」，把和鎖定項目衝突的「規則需求」移到「拒絕清單」，寫出衝突的結構與依賴者。
7. `CHECK` 「規則需求」為空時進入 Phase 3，不建立或修改任何檔案；不為空時進入 Phase 2。

完成條件：每項需求都已決定落點檔案，或已列入「拒絕清單」並寫出原因。

## Phase 2 -- 澄清與寫入

1. `THINK` 列出每項「規則需求」寫成規則所必須、但使用者沒有給出的細節，建立「待澄清項目」。
2. `DELEGATE` 「待澄清項目」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`；以「待澄清項目」為優先提問面向，整個 session 題數上限為 3，不要求詳記問答紀錄；取得已確認的決策與使用者補充，建立「澄清結果」。
3. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`，不建立或修改任何檔案並停止執行；使用者未回覆時停止執行，等待回覆。
4. `READ` 撰寫規則時，讀取 `rules/憲法規則-格式規範.md` 的所有 Rule，建立「規則檢查清單」。
5. `READ` `templates/constitution-file.md` 與 `templates/constitution-file.example.md`，載入骨架與範例，命名載入結果為「憲法檔樣板組」。
6. `WRITE` 依「規則檢查清單」、「憲法檔樣板組」與「澄清結果」，在落點檔案新增或修改 Rule 並存檔；落點檔案不存在時建立檔案與所需的目錄；只建立或修改 `.agents/constitution/` 下的憲法檔。
7. `CHECK` 逐條驗證「規則檢查清單」與「落點檢查清單」，並比對每個落點檔案與「憲法檔樣板組」的結構；未通過時修正後重新驗證。

完成條件：每項「規則需求」都已寫入落點檔案，且通過「規則檢查清單」與「落點檢查清單」。

## Phase 3 -- 回報

1. `WRITE` 向使用者回報：每個建立或修改的憲法檔路徑、新增或修改的 Rule 標題、每條規則的落點理由、「拒絕清單」的每項原因與建議的做法；有寫入時，提醒使用者以 `git diff` 檢視規則是否符合本意。

完成條件：已向使用者回報寫入結果與拒絕清單。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | 第 2 節的 `name` 與 `description` | E1、E7、E12（觸發與分流） |
| Phase 1 -- 判斷規則落點（P1-1～P1-7） | 新增 | 讀取輸入、載入落點檢查清單、決定落點與拒絕、讀取目標 Skill、載入鎖定檢查清單、檢查鎖定項目 | E1、E2、E3、E7、E8、E9、E12 |
| Phase 2 -- 澄清與寫入（P2-1～P2-7） | 新增 | 列出待澄清項目、委派 `clarify`、載入規則檢查清單與樣板組、寫入、驗證 | E4、E5、E6、E10、E11、E13、E14 |
| Phase 3 -- 回報（P3-1） | 新增 | 回報寫入結果與拒絕清單 | E2、E7、E8、E12、E13 |
| `rules/憲法落點-格式規範.md` | 新增 | Rule 1～4，見工作項 W6 | C1–C3、C5 |
| `rules/鎖定項目-格式規範.md` | 新增 | Rule 1，見工作項 W5 | C4 |
| `rules/憲法規則-格式規範.md` | 新增 | Rule 1～4，見工作項 W4 | C7–C10 |
| `templates/constitution-file.md`、`.example.md` | 新增 | 憲法檔骨架與範例，見工作項 W3 | C6 |
| `LICENSE` | 新增 | 註明衍生自 Spec-Kit `speckit-constitution` 的內容，保留 MIT 全文 | CLAUDE.md 規則 3 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 15 | +15 |
| RuleFile | 0 | 3 | +3 |
| Rule | 0 | 9 | +9 |
| 樣板組 | 0 | 1 | +1 |
| 腳本 | 0 | 0 | 0 |

內容增減：新建模式，全部為新增。三個 RuleFile 分屬「落點判斷」、「鎖定項目判斷」與「規則撰寫」三個主題，各自只服務一個步驟（P1-3、P1-6、P2-6），不合併。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 落點表：每個已接入的 Skill 產出物對應一個憲法檔；表外產出物不寫入 | P1-3 | `rules/憲法落點-格式規範.md` Rule 1 | 需要判斷需求屬於哪個產出物，腳本無法判斷；不是產出檔案的整體結構；需要正反例 |
| C2 | `shared.md` 的寫入門檻；只適用部分產出物時分別寫入各檔 | P1-3 | `rules/憲法落點-格式規範.md` Rule 2 | 需要判斷適用範圍；需要正反例 |
| C3 | 流程類需求不寫入，建議改用 `skill-engineering` | P1-3 | `rules/憲法落點-格式規範.md` Rule 3 | 需要判斷需求是約束產出物還是改變流程；需要正反例 |
| C4 | 和鎖定項目衝突的需求不寫入；鎖定項目的判斷方式 | P1-6 | `rules/鎖定項目-格式規範.md` Rule 1 | 需要對照目標 Skill 判斷依賴關係；需要正反例；只服務 P1-6，和 P1-3 的落點判斷是不同主題 |
| C5 | 同一面向已有 Rule 時修改該 Rule，不新增重複 Rule | P1-3 | `rules/憲法落點-格式規範.md` Rule 4 | 需要判斷面向是否相同；需要正反例；屬於落點主題（決定寫在哪一條 Rule） |
| C6 | 憲法檔從 `# Rule 1` 開始、沒有標題與 metadata，每條 Rule 依序包含條列說明、Good Example、Bad Example | P2-6 | 憲法檔樣板組 | 約束的是整份憲法檔的結構 |
| C7 | Rule 從 1 連續編號，修改後仍連續 | P2-6 | `rules/憲法規則-格式規範.md` Rule 1 | 樣板以填位符號表示編號，無法保證新增或修改後的連續性；一句話可表達，但屬於規則撰寫主題，和 C8–C10 集中 |
| C8 | 強度只用「必須」、「不得」、「應」、「可以」 | P2-6 | `rules/憲法規則-格式規範.md` Rule 2 | 需要判斷每個要求的強度；需要正反例 |
| C9 | 規則只包含使用者提出的要求與澄清結果，不自行補充要求 | P2-1、P2-6 | `rules/憲法規則-格式規範.md` Rule 3 | 需要判斷哪些內容超出使用者要求；需要正反例 |
| C10 | 範例使用專案領域情境與產出物實際格式 | P2-6 | `rules/憲法規則-格式規範.md` Rule 4 | 需要判斷情境與格式；需要正反例 |
| C11 | 待澄清項目是寫成規則必須、但使用者沒有給出的細節 | P2-1 | P2-1 步驟內文 | 只屬於單一步驟，一句話即可表達；判斷依據引用 C9 |
| C12 | 委派 `clarify` 的方式與題數上限 3 | P2-2 | P2-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C13 | 只建立或修改 `.agents/constitution/` 下的憲法檔 | P2-6 | P2-6 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C14 | 寫入前不設確認閘門，寫入後回報 | P2-6、P3-1 | SOP 流程 | 屬於使用者確認與 Phase 轉移 |
| C15 | 回報內容：檔案路徑、Rule 標題、落點理由、拒絕清單 | P3-1 | P3-1 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C16 | 目標 Skill 的讀取位置與讀取範圍 | P1-4 | P1-4 步驟內文 | 只屬於單一步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/constitution/SKILL.md` frontmatter | 寫入第 2 節的 `name` 與 `description` | — | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/constitution/SKILL.md` SOP | 寫入胖 SOP（見 W2 內容） | C11–C16 | 已完成 |
| 3 | W3 | `skill-derive-template` | Phase 2 -- 澄清與寫入的 `WRITE` 寫入憲法檔步驟 | 抽出憲法檔樣板組 | C6 | 已完成 |
| 4 | W4 | `skill-derive-rule` | Phase 2 -- 澄清與寫入的 `WRITE` 寫入憲法檔步驟 | 抽出 `rules/憲法規則-格式規範.md` | C7–C10 | 已完成 |
| 5 | W5 | `skill-derive-rule` | Phase 1 -- 判斷規則落點的 `THINK` 鎖定項目步驟（把和鎖定項目衝突的需求移到「拒絕清單」） | 抽出 `rules/鎖定項目-格式規範.md` | C4 | 已完成 |
| 6 | W6 | `skill-derive-rule` | Phase 1 -- 判斷規則落點的 `THINK` 決定落點步驟（把使用者需求拆成「規則需求」） | 抽出 `rules/憲法落點-格式規範.md` | C1–C3、C5 | 已完成 |
| 7 | W7 | `skill-engineering` 直接寫入 | `.agents/skills/constitution/LICENSE` 與根目錄 `LICENSE` 授權範圍 | 註明衍生內容，保留 MIT 全文；根目錄 `LICENSE` 列出本 Skill | — | 已完成 |
| 8 | W8 | `skill-engineering` 直接寫入 | `CLAUDE.md` 目錄結構 | 加入 `.agents/constitution/` 一行說明，並同步 `AGENTS.md` | — | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name`：`constitution`
- `description`：第 2 節 To-Be SOP 的 `description` 原文。

#### W2：胖 SOP

依第 2 節 To-Be SOP 寫入，但下列步驟先寫成胖 SOP：

- 刪除 P1-2、P1-5、P2-4、P2-5 四個載入步驟（部位尚未建立）。
- P1-3 改寫為：`THINK` 把使用者需求拆成「規則需求」，為每項決定落點檔案，以及新增 Rule 或修改哪一條既有 Rule；不寫入的需求列入「拒絕清單」，寫出原因與建議的做法。落點依下表：

  | Skill | 產出物 | 憲法檔（`.agents/constitution/` 下） |
  | --- | --- | --- |
  | 全部產出物共用 | — | `shared.md` |
  | `s-specify` | `spec.md` | `skills/s-specify/spec.md` |
  | `technical-research` | `research.md` | `skills/technical-research/research.md` |
  | `technical-research` | `techstack.md` | `skills/technical-research/techstack.md` |
  | `system-analysis` | `plan.md` | `skills/system-analysis/plan.md` |
  | `api-plan` | `contracts/openapi.yaml` | `skills/api-plan/openapi.md` |
  | `api-plan` | `contracts/asyncapi.yaml` | `skills/api-plan/asyncapi.md` |
  | `data-plan` | `data/data-model.dbml` | `skills/data-plan/data-model.md` |
  | `ui-plan` | `ui/plan.md` | `skills/ui-plan/ui-plan.md` |
  | `ui-plan` | `ui/*.html` | `skills/ui-plan/ui-page.md` |
  | `tasks` | `tasks.md` | `skills/tasks/tasks.md` |
  | `implement` | 程式碼 | `skills/implement/code.md` |

  修改產出物的其他 Skill（例如 `clarify-over-specs` 修改 `spec.md`）使用產出該產出物之 Skill 的憲法檔。產出物不在表內時列入「拒絕清單」，建議先以 `skill-engineering` 接入憲法機制。規則必須適用全部產出物、而且寫法不需依產出物改變，才寫入 `shared.md`；只適用部分產出物時，分別寫入每個產出物的憲法檔。要求新增流程步驟、測試、改變 Skill 執行順序或處理方式的需求列入「拒絕清單」，建議以 `skill-engineering` 新增或修改 Skill。需求和落點檔中既有 Rule 規範同一個面向時，修改該 Rule，不新增 Rule。
- P1-6 改寫為：`THINK` 依「目標 Skill 現況」，把和鎖定項目衝突的「規則需求」移到「拒絕清單」，寫出衝突的結構與依賴者；鎖定項目是下游 Skill 或目標 Skill 的檢查腳本依賴的結構（例如需求編號引用、介面編號、operation 的 tag 格式、任務 ID 與 Must Read 格式），以及目標 Skill 憲法載入步驟列出的不可覆寫項目。
- P2-6 改寫為：`WRITE` 依「澄清結果」，在落點檔案新增或修改 Rule 並存檔；落點檔案不存在時建立檔案與所需的目錄；只建立或修改 `.agents/constitution/` 下的憲法檔。憲法檔從 `# Rule 1 - <名稱>` 開始，沒有檔案標題或 metadata；每條 Rule 依序包含條列說明、`## Good Example`、`## Bad Example`；Rule 從 1 連續編號；強度只用「必須」、「不得」、「應」、「可以」；規則只包含使用者提出的要求與「澄清結果」；範例使用專案領域情境與產出物的實際格式。
- P2-7 改寫為：`CHECK` 逐條驗證 P2-6 的要求與 P1-3 的落點；未通過時修正後重新驗證。

#### W3：憲法檔樣板組

- `templates/constitution-file.md`：骨架為一或多個 `# Rule {{N}} - {{RULE_NAME}}` 區塊，每個區塊依序為條列說明、`## Good Example`（說明一句 + 程式碼區塊）、`## Bad Example`（說明一句 + 程式碼區塊）；檔案沒有標題或 metadata。
- `templates/constitution-file.example.md`：電商情境的 `api-plan/openapi.md`，例如「訂單金額欄位必須以整數的最小貨幣單位表示」1 條 Rule，範例使用 OpenAPI YAML。
- P2-6 改為依「憲法檔樣板組」寫入；P2-7 加入比對樣板結構。

#### W4：`rules/憲法規則-格式規範.md`

- Rule 1 - Rule 必須從 1 連續編號：新增或修改後，落點檔的 Rule 編號仍從 1 連續。
- Rule 2 - 強度必須使用固定用詞：「必須」、「不得」、「應」、「可以」；不得使用「盡量」、「最好」等未定義的用詞。
- Rule 3 - 規則只包含使用者提出的要求：不得加入使用者沒有提出、也不在「澄清結果」中的要求（例如欄位順序、數值上限）；寫成規則必須的細節缺少時，列入「待澄清項目」。
- Rule 4 - 範例必須使用專案情境與產出物格式：Good／Bad Example 使用專案的領域情境（取自 `specs/` 或使用者描述），程式碼區塊使用該產出物的實際格式。
- 範例情境使用電商領域，不使用本 repo 的 1A2B 情境。
- P2-6 刪除這些要求的內文，改為依「規則檢查清單」寫入；P2-7 改為逐條驗證「規則檢查清單」。

#### W5：`rules/鎖定項目-格式規範.md`

- Rule 1 - 和鎖定項目衝突的需求不得寫入憲法：鎖定項目是下游 Skill 或目標 Skill 的檢查腳本依賴的結構（例如需求編號引用、介面編號、operation 的 tag 格式、任務 ID 與 Must Read 格式），以及目標 Skill 憲法載入步驟列出的不可覆寫項目；衝突時列入「拒絕清單」，寫出衝突的結構與依賴者。
- 範例情境使用電商領域。
- P1-6 刪除鎖定項目定義的內文，改為依「鎖定檢查清單」判斷。

#### W6：`rules/憲法落點-格式規範.md`

- Rule 1 - 規則必須寫入落點表指定的檔案：W2 的落點表與表外處理方式。
- Rule 2 - 只有全部產出物適用的規則才寫入 shared.md：門檻與分別寫入各檔。
- Rule 3 - 流程類需求不得寫入憲法：判斷方式與建議。
- Rule 4 - 同一面向已有 Rule 時必須修改該 Rule：不新增重複 Rule，其他 Rule 原文不變。
- 範例情境使用電商領域。
- P1-3 刪除這些要求的內文，改為依「落點檢查清單」判斷；P2-7 加入逐條驗證「落點檢查清單」。

#### W7：LICENSE

- `.agents/skills/constitution/LICENSE`：註明本 Skill 為自建 Skill，參考 Spec-Kit `speckit-constitution`（本 repo 中為 `.spec-kit/claude-skills/speckit-constitution/SKILL.md`）衍生下列內容：以專案憲法約束各 Skill 的產出；把非憲法的意圖（實作、流程）分出來、不執行，並建議後續使用的 Skill（Scope Guard）。SOP、RuleFile、樣板為重新撰寫。保留 MIT 全文。
- 根目錄 `LICENSE`「授權範圍」新增一項，列出 `constitution` 含 Spec-Kit 衍生內容。

#### W8：CLAUDE.md

- 目錄結構加入：`.agents/constitution/  專案憲法：約束各 SDD Skill 產出物的規則，只放一份，不同步到 .claude/`。
- 以 `scripts/sync-skills.sh --from claude` 同步 `AGENTS.md`。

## 7. 驗收情境

測試環境：包含本次未提交修改的暫存專案複本，`.agents/constitution/` 為目前的 3 份範例憲法檔。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E4、E5、E6、E10、E11、E13 | 本次 | 「資料表的主鍵一律用 uuid，不可以用自動遞增的整數」 | `clarify` 提問時回覆「沒有其他要求，照我說的寫」 | `skills/data-plan/data-model.md` 新增 Rule 3，Rule 1、2 原文不變；沒有詢問寫入位置，也沒有寫入前的確認；Rule 結構、編號與強度用詞符合 E4、E5；範例為 DBML 且使用本專案的資料表；規則沒有使用者未提出的要求（例如指定 uuid 版本或產生函式）；`git status` 只有該檔案變更；回報寫出路徑與理由 |
| S2 | E3、E1 | 本次 | 「API 合約裡的時間欄位一律用 ISO 8601 的 UTC 字串，資料庫的時間欄位一律用 timestamptz」 | `clarify` 提問時回覆「沒有其他要求」 | `shared.md` 不變；規則寫入 `skills/api-plan/openapi.md`、新建的 `skills/api-plan/asyncapi.md` 與 `skills/data-plan/data-model.md` |
| S3 | E8 | 本次 | 「OpenAPI 的 tag 改用資源名稱，例如 rooms、messages」 | 無 | 沒有任何檔案變更；回報指出 tag 必須是「介面編號 介面名稱」，並寫出依賴者（`tasks` 或 `check_contracts.py`） |
| S4 | E7 | 本次 | 「每個功能都必須先寫自動化測試才能寫程式」 | 無 | 沒有任何檔案變更；回報說明這是流程需求，建議以 `skill-engineering` 新增 Skill |
| S5 | E9 | 本次 | 「分頁的 pageSize 上限改成 50」 | `clarify` 提問時回覆「預設值維持 20」 | `skills/api-plan/openapi.md` 仍為 5 條 Rule；Rule 1 的上限改為 50；Rule 3、4、5 原文不變 |
| S6 | E6、E14 | 本次 | 「查詢清單的 API 要能排序」 | `clarify` 提問時回覆：參數名稱 `sort`，格式 `<欄位>:<asc 或 desc>`，多個欄位以逗號分隔，其他細節不限定 | 寫入前有委派 `clarify`，且題數不超過 3；寫入 `skills/api-plan/openapi.md` 的規則使用 `sort` 與回覆的格式，沒有回覆以外的細節 |
| S7 | E12 | 本次 | 「類別圖提案裡每個類別都要寫中文說明」 | 無 | 沒有任何檔案變更；回報說明 `plan-with-class-diagram` 的產出物不在落點表，建議先以 `skill-engineering` 接入 |

## 8. 驗收結果

- 結構診斷：`constitution` 為 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」；同步前先以 `cp CLAUDE.md AGENTS.md` 帶入 W8 對 `CLAUDE.md` 的修改。沒有只存在於目標端、未被刪除的 Skill。
- 驗收方式：7 個情境各在 `/tmp/constitution-accept/S1`～`S7` 的暫存專案複本執行；複本含本次未提交修改，執行前先 commit 基準狀態，執行後由執行者自行以 `git status` 與 `git diff` 核對副作用。子代理不帶本次分析脈絡，透過 Agent 工具指定 `model: sonnet`、`effort: medium`（Sonnet 5.5，低於主模型 Opus 5.5 的中階模型）。
- 情境輸入調整：第 7 節原本的 S1～S5、S7 輸入與施工後 RuleFile 的範例過於相近，違反驗收條件 Rule 4「情境輸入不得與目標 Skill 部位中的範例相同」，改用驗證相同驗收條件的不同輸入：

| 編號 | 實際輸入 | 實際預先回覆 |
| ---- | -------- | ------------ |
| S1 | 「所有資料表的字串欄位都必須寫出長度上限」 | 「沒有其他要求，照我說的寫」 |
| S2 | 「API 合約和資料模型裡的布林欄位，名稱都必須用 is 或 has 開頭」 | 「沒有其他要求，各產出物依自己的命名慣例（API 用 camelCase；資料庫用 snake_case）」 |
| S3 | 「API 合約裡 operation 的 description 不要再寫需求編號了，看了很亂」 | 無 |
| S4 | 「每次產出 API 合約之後，都要先停下來讓我審核，我同意了才能進入下一個 Skill」 | 無 |
| S5 | 「資料模型的軟刪除欄位改名叫 removed_at」 | 「沒有其他要求，只改名稱，其他規則不變」 |
| S6 | 「查詢清單的 API 要能排序」（不變） | 不變 |
| S7 | 「plan-with-class-diagram 產出的循序圖，都必須畫出錯誤路徑」 | 無 |

- S1 通過：`skills/data-plan/data-model.md` 新增 Rule 3（37 行新增、0 行刪除），Rule 1、2 原文不變；沒有詢問寫入位置，也沒有寫入前的確認；結構、編號、強度用詞符合；範例為 DBML 並使用 `players`、`rooms`；沒有加入數值等使用者未提出的要求；`git status` 只有該檔案。過程註記：子代理一開始以 `find | head` 列檔，輸出被截斷，把既有檔案當成不存在而整檔覆寫，之後自行以 `git checkout` 還原再附加；最終產出正確，偏離來自子代理執行，SOP 已要求讀取所有既有憲法檔。
- S2 通過：規則分別寫入 `openapi.md`（Rule 6）、新建的 `asyncapi.md`（Rule 1）與 `data-model.md`（Rule 3）；`shared.md` 不變；`clarify` 問 1 題（命名大小寫），屬寫成規則必須的細節。
- S3 通過：沒有任何檔案變更；回報指出需求編號引用是鎖定項目，依賴者為 `check_contracts.py`。
- S4 通過：沒有任何檔案變更；回報判定為流程需求，建議以 `skill-engineering` 修改 `api-plan` 或 `system-analysis`。
- S5 通過：只修改 `data-model.md` 的 Rule 1、2（7 行替換），Rule 數仍為 2，沒有新增 Rule。
- S6 通過：寫入前委派 `clarify`，1 輪 3 題，未超過上限；`openapi.md` 新增 Rule 6，使用 `sort` 與回覆的格式。子代理在 P2-7 驗證時發現並刪除一條使用者未提出的要求，最終產出符合 E6。
- S7 通過：沒有任何檔案變更；回報說明 `plan-with-class-diagram` 不在落點表，建議先以 `skill-engineering` 接入。
- 未驗證標記：依 CLAUDE.md「未經學員實際驗證的 skill 要標明未驗證」與 `user-verify-skill` 的慣例，驗收後在 description 開頭加上「（未驗證）」，其餘文字不變；重跑同步與結構診斷均通過。
- 約束分配：C1–C16 各只出現在指定的存放位置。
- 個案驗收條件：無。
- 調整建議（未施工，待使用者決定）：P1-1 可指定以 `find .agents/constitution -type f` 列出全部既有憲法檔，降低 S1 那種列檔被截斷而誤判檔案不存在的風險。

### 使用者實際驗證（2026-11-03）

- 方式：以 `user-verify-skill` 在 scratchpad 的暫存專案實跑，用 Herdr 在主 session 下方開新 pane，啟動全新的 Claude Code，測試模型為 `sonnet`（Sonnet 5.5），推理強度 `medium`。暫存專案的 `.claude/skills/` 只放 `constitution` 與 `clarify`；測試素材為 `.agents/skills/` 的 9 個 SDD Skill、`.agents/constitution/` 的 `shared.md` 與 `skills/data-plan/data-model.md`（刪除 `skills/api-plan/openapi.md`，讓 Skill 重新產生），以及 `specs/001-online-pvp-1a2b`、`specs/002-room-game-chat`。實跑需求：「我希望查詢 API 的 Request 都要說第幾頁、每頁幾筆，Response 也要回傳第幾頁和總共幾筆」，以自然語言送出，不指名 Skill。
- 權限處理：信任資料夾由使用者選擇「Yes, I trust this folder」。執行者沒有自行放行任何權限；測試 session 開著 auto mode，一次唯讀的 `cd … && cat`（讀取 `clarify` 的 rules 與樣板，範圍在暫存專案內）由 auto mode 自動放行。
- 結果（第 1 輪，通過）：
  - 測試 session 自行觸發 `constitution`；判斷落點為 `.agents/constitution/skills/api-plan/openapi.md`（新建），沒有詢問寫入位置。
  - 委派 `clarify` 1 輪 3 題（分頁參數名稱與起算、Response 欄位名稱與位置、適用的 operation），使用者回覆「1:1, 2:1, 3:1」（`page` 從 1 起算與 `pageSize`；外層物件含 `items`、`page`、`total`；所有回傳清單的查詢 operation，含 POST 搜尋，不含以 ID 取單筆）。
  - 寫入前沒有確認閘門；新建 `openapi.md`，只有 Rule 1「回傳清單的查詢 operation 必須支援分頁」，Good／Bad Example 為 OpenAPI YAML 並使用專案的 `listChatMessages`；`shared.md` 不變；暫存專案 `git status` 只有該檔案；回報寫出路徑、落點理由與「拒絕清單：沒有」。
  - 核對：E1、E2、E3、E4、E5、E10、E11、E13、E14 符合；E6 部分符合（見觀察）；E7、E8、E9、E12 不適用（測試 session 有讀取 `check_contracts.py` 檢查鎖定項目）。
- 觀察：
  - 規則多了一句「GET 放在 query，POST 放在 request body」，沒有向使用者詢問；這句來自使用者選擇「含 POST 搜尋」後必須說明參數位置，判定為選項的直接結果。範例中的 `required: true`、`minimum: 1` 只出現在範例，不在規則條文。
  - 測試 session 列檔時用 `ls -R … | head -80`，與 S1 列檔被截斷是同一種寫法；這次之後逐一 `cat` 既有憲法檔，沒有誤判。仍支持第 8 節的調整建議（P1-1 指定以 `find .agents/constitution -type f` 列出全部既有憲法檔），預定在接入 9 個 SDD Skill 時一併處理。
  - 產出的規則沒有預設值、上限、錯誤碼與 `totalPages`，因為需求沒有提到這些細節，符合 E6；主專案手寫的 `openapi.md`（5 條）不受影響。
  - 判定依課程 23:56–25:45 的標準：落點寫在 `api-plan`，規則與需求對齊（Request 帶分頁參數、Response 回傳分頁資訊）。
- 結論：使用者判定通過；已移除 `constitution` 的 description 開頭的「（未驗證）」，其餘文字不變，`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」。
