# 工程藍圖：constitution－規則更新後未檢查一致性

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/35-constitution-規則更新後未檢查一致性/`
- 根因報告：`rca-report.md`（R1 流程缺陷、R2 缺失；2026-11-07 經 Codex 確認）
- 確認紀錄：見第 9 節

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 有寫入憲法檔時，回報包含「一致性檢查」結果：每條寫入或修改的 Rule 都列出實際檢查的 Skill 部位路徑與產出物路徑（不限 `specs/`），每筆結果對應憲法檔與 Rule 編號 | 本次 | 通用 |
| E2 | 既有產出物違反新規則時，列出檔案路徑與部位；符合新規則的產出物，以及 Rule 明定的例外成立的產出物，不列為衝突 | 本次 | 通用 |
| E3 | 目標 Skill 的 `rules/` 或 `templates/` 和新規則衝突時，列出衝突的檔案與部位（Rule 編號或樣板區段） | 本次 | 通用 |
| E4 | 目標 Skill 的 `SKILL.md` 有步驟直接規定產出物內容，且和新規則衝突時，列出 Phase 與步驟 | 推定 | 通用 |
| E5 | 每個衝突都標出處理 Skill：產出物衝突填產出該產出物的 Skill（程式碼填 `implement`）；Skill 部位衝突填 `skill-engineering` | 本次 | 通用 |
| E6 | 寫入 `shared.md` 的 Rule，檢查範圍是落點表列出的所有 Skill 與其產出物，並依該 Rule 的適用條件判定 | 推定 | 通用 |
| E7 | 一致性檢查與 Good／Bad Example 取材都不讀取 `specs/001-photo-album-organizer/` 與 `specs/skill-engineering/` | 本次 | 通用 |
| E8 | 程式碼產出物依 spec 目錄的 `plan.md` 專案結構與 `tasks.md` 的檔案路徑定位；路徑不存在時列為「無法檢查」並寫「指定路徑不存在」，不自行判斷為尚未實作 | 推定 | 通用 |
| E9 | 無法檢查的項目列為「無法檢查」並寫出原因（沒有任何 spec 目錄有該產出物、找不到路徑、讀取失敗、目標 Skill 不存在），不列為通過；目標 Skill 缺少某個部位時，其他部位仍要檢查 | 本次 | 通用 |
| E10 | 一致性檢查只讀取、不修改；整次執行只在 `.agents/constitution/` 下建立或修改檔案 | 本次 | 通用 |
| E11 | 「規則需求」為空、沒有寫入任何憲法檔時，不執行一致性檢查，回報寫「未寫入，未執行一致性檢查」 | 推定 | 通用 |
| E12 | 規則寫入落點表指定的憲法檔，每條 Rule 有 Good／Bad Example；流程類需求與鎖定項目衝突的需求列入拒絕清單 | 既有 | 通用 |
| E13 | 寫成規則所需的細節缺少時先委派 `clarify`，使用者未回覆時不寫入；規則只包含使用者的要求與澄清結果；同一面向已有 Rule 時修改該 Rule，其他 Rule 的原文不變 | 既有 | 通用 |

## 2. To-Be SOP

````markdown
---
name: constitution
description: （未驗證）要為專案新增或修改憲法規則、約束某個 SDD Skill 產出物的內容時使用：依使用者描述的規範判斷規則屬於哪個 Skill 的哪個產出物，寫進 `.agents/constitution/` 下對應的憲法檔，全部產出物共用時才寫進 `shared.md`；每條規則附 Good／Bad Example，缺少的細節委派 clarify 詢問，拒絕改變 SDD 流程或下游追溯結構的需求；寫入後檢查相關 Skill 的部位與既有產出物是否仍然符合新規則，只回報衝突位置與處理 Skill，不修改它們。使用者提到 constitution、憲法、專案規範、API 風格、資料規範、產出物約束、憲法一致性時使用。要新增或改變 SDD 流程、步驟或測試時改用 skill-engineering；寫 spec.md 改用 s-specify；實作前檢查整份 spec 的跨文件一致性改用 analyze。
---

# SOP

## Phase 1 -- 判斷規則落點

1. `READ` 使用者需求；在專案根目錄執行 `find .agents/constitution -type f` 列出所有既有憲法檔（不截斷輸出），並讀取列出的每個檔案，建立「憲法輸入」。
2. `READ` 判斷落點時，讀取 `rules/憲法落點-格式規範.md` 的所有 Rule，建立「落點檢查清單」。
3. `THINK` 依「落點檢查清單」把使用者需求拆成「規則需求」，為每項決定落點檔案，以及新增 Rule 或修改哪一條既有 Rule；不寫入的需求列入「拒絕清單」，寫出原因與建議的做法。
4. `READ` 每項「規則需求」依「落點檢查清單」決定的目標 Skill（專案根目錄 `.agents/skills/<Skill>/`，不存在時改讀 `.claude/skills/<Skill>/`）的 `SKILL.md`、`rules/`、`templates/`，以及腳本的檔頭說明，建立「目標 Skill 現況」。
5. `READ` 檢查鎖定項目時，讀取 `rules/鎖定項目-格式規範.md` 的所有 Rule，建立「鎖定檢查清單」。
6. `THINK` 依「鎖定檢查清單」與「目標 Skill 現況」，把和鎖定項目衝突的「規則需求」移到「拒絕清單」，寫出衝突的結構與依賴者。
7. `CHECK` 「規則需求」為空時進入 Phase 4，不建立或修改任何檔案；不為空時進入 Phase 2。

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

## Phase 3 -- 檢查一致性

1. `READ` 檢查一致性時，讀取 `rules/一致性檢查-格式規範.md` 的所有 Rule，建立「一致性檢查清單」。
2. `READ` 在專案根目錄執行 `find specs -mindepth 1 -maxdepth 1 -type d` 列出 spec 目錄，建立「spec 目錄清單」。
3. `THINK` 依「一致性檢查清單」、「落點檢查清單」與「spec 目錄清單」，為每條寫入或修改的 Rule 決定要檢查的 Skill 部位與產出物，建立「檢查範圍」。
4. `READ` 「檢查範圍」中的每個 Skill 部位與產出物，建立「檢查對象」；本 Phase 不建立、修改或刪除任何檔案。
5. `THINK` 依「一致性檢查清單」逐條比對寫入或修改的 Rule 與「檢查對象」，建立「一致性檢查結果」。
6. `CHECK` 逐條驗證「一致性檢查清單」；未通過時修正「一致性檢查結果」後重新驗證。

完成條件：每條寫入或修改的 Rule 都有一致性檢查結果，且通過「一致性檢查清單」。

## Phase 4 -- 回報

1. `WRITE` 向使用者回報：每個建立或修改的憲法檔路徑、新增或修改的 Rule 標題、每條規則的落點理由、「拒絕清單」的每項原因與建議的做法，以及「一致性檢查結果」；沒有寫入任何憲法檔時，一致性檢查寫「未寫入，未執行一致性檢查」；有寫入時，提醒使用者以 `git diff` 檢視規則是否符合本意。

完成條件：已向使用者回報寫入結果、拒絕清單與一致性檢查結果。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 所有 As-Is 元素都能追溯到驗收條件或必要流程（見「保留」） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 開頭加「（未驗證）」；補寫入後的一致性檢查、觸發關鍵字「憲法一致性」，以及和 `analyze` 的分流 | E1、E10；專案慣例（修改後未驗證） |
| Phase 1 步驟 4 | 修改 | 「目標 Skill」改為「依『落點檢查清單』決定的目標 Skill」，讓 `shared.md` 的目標 Skill 在鎖定檢查前就展開為全部 Skill | E6、E12；C21a |
| Phase 1 步驟 7 | 修改 | 「進入 Phase 3」改為「進入 Phase 4」 | E11；C9 |
| Phase 3「檢查一致性」 | 新增 | 6 個步驟與完成條件，見 To-Be | R1；E1–E10 |
| Phase 3（As-Is「回報」） | 修改 | 改為 Phase 4；步驟 1 補「一致性檢查結果」與「未寫入，未執行一致性檢查」；完成條件補一致性檢查結果 | R1；E1、E11；C28 |
| `rules/一致性檢查-格式規範.md` | 新增 | Rule 1 檢查範圍、Rule 2 衝突判定、Rule 3 結果寫法與處理 Skill、Rule 4 無法檢查 | R1；E1–E9；C21b–C25 |
| `rules/憲法落點-格式規範.md` Rule 2 | 修改 | 補一條：寫入 `shared.md` 的規則，目標 Skill 是落點表列出的所有 Skill | E6；C21a |
| `rules/憲法規則-格式規範.md` Rule 4 | 修改 | 第 1 條補上取材時不得讀取，也不得取自 `specs/001-photo-album-organizer/` 與 `specs/skill-engineering/`；Good／Bad Example 依此更新 | R2；E7；C17 |

新增的理由（重新設計 Rule 4）：

- Phase 3：R1 是流程缺陷，缺的是寫入後的檢查動作。刪除無法處理；改寫 Phase 2 步驟 7 會把「驗證寫入的格式」和「檢查其他檔案」兩個不同動作混在一步；改換存放位置不適用，因為沒有既有載體。所以新增 Phase。
- 新 RuleFile：檢查範圍、衝突判定與無法檢查都要判斷，需要正反例（約束分配 Rule 2 第 3 順位）。既有 3 個 RuleFile 的主題是落點、鎖定與規則寫法，和「寫入後的一致性檢查」不同主題（約束分配 Rule 3），所以不擴充既有檔案。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| Phase 1 標題、步驟 1–3、5、6、完成條件 | E12、E13 | C1–C6、C8 |
| Phase 2 全部步驟與完成條件 | E12、E13；R1 的檢查以寫入結果為輸入 | C10–C16、C18–C20 |
| `rules/憲法落點-格式規範.md` Rule 1、3、4，Rule 2 原有條列 | E12、E13；Rule 1 的落點表另作為 E5、E6 的檢查範圍來源 | C2–C5 |
| `rules/鎖定項目-格式規範.md` Rule 1 | E12 | C8 |
| `rules/憲法規則-格式規範.md` Rule 1–3 | E12、E13 | C13–C15 |
| `rules/憲法規則-格式規範.md` Rule 4 第 2、3 條 | E12 | C16 |
| `templates/constitution-file.md`、`constitution-file.example.md` | E12 | C18 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 4 | +1 |
| 步驟 | 15 | 21 | +6 |
| RuleFile | 3 | 4 | +1 |
| Rule | 9 | 13 | +4 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- Phase、步驟 +1、+6：R1（流程缺陷）需要寫入後的檢查動作；6 個步驟分別是載入規則、列 spec 目錄、決定範圍、讀取對象、比對、驗證，每步一個動作。
- RuleFile、Rule +1、+4：E1–E9 的判斷需要正反例；4 條 Rule 對應範圍、判定、結果寫法、無法檢查 4 個判斷。
- 沒有刪除：As-Is 的每個元素都追溯到 E12、E13 或作為新檢查的輸入；R2 以改寫既有 Rule 4 處理，沒有新增 Rule。
- 不建腳本：列 spec 目錄是 `find` 單一命令（約束分配 Rule 2）；衝突判定需要讀懂規則語意，無法由程式判斷。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 以 `find .agents/constitution -type f` 列出並讀取所有既有憲法檔 | P1-1 | 步驟內文 | 單一命令；不需判斷 |
| C2 | 規則寫入落點表指定的憲法檔；落點表不含的產出物列入拒絕清單 | P1-3 | `rules/憲法落點-格式規範.md` Rule 1 | 需判斷與正反例；非整份產出結構，不選樣板 |
| C3 | 只有全部產出物適用的規則才寫入 `shared.md` | P1-3 | 同上 Rule 2 | 同上 |
| C4 | 流程類需求不得寫入憲法 | P1-3 | 同上 Rule 3 | 同上 |
| C5 | 同一面向已有 Rule 時修改該 Rule，其他 Rule 原文不變 | P1-3 | 同上 Rule 4 | 同上 |
| C6 | 規則需求拆分；拒絕清單寫原因與建議的做法 | P1-3 | 步驟內文 | 只屬於單一步驟，一句話 |
| C7 | 目標 Skill 先讀 `.agents/skills/`，不存在才讀 `.claude/skills/` | P1-4 | 步驟內文 | 同上 |
| C21a | 每條規則的目標 Skill 是落點表對應列的 Skill；寫入 `shared.md` 的規則，目標 Skill 是落點表列出的所有 Skill | P1-3（P1-4、P1-6、P3-3 引用載入結果） | `rules/憲法落點-格式規範.md` Rule 2 | 屬於落點主題且在 P1-2 載入，Phase 1 的鎖定檢查與 Phase 3 的檢查範圍可以共用同一份載入結果；需判斷，選 RuleFile |
| C8 | 和鎖定項目衝突的需求列入拒絕清單並寫出依賴者 | P1-6 | `rules/鎖定項目-格式規範.md` Rule 1 | 需判斷與正反例 |
| C9 | 規則需求為空時進入 Phase 4，不建立或修改檔案 | P1-7 | SOP 流程 | 分支與 Phase 轉移 |
| C10 | 列出寫成規則所需、使用者沒給的細節 | P2-1 | 步驟內文 | 單一步驟，一句話 |
| C11 | 讀取 clarify 的 SKILL.md 依 SOP 執行，不用 Skill 工具，題數上限 3 | P2-2 | 步驟內文 | 委派方式只屬於單一步驟 |
| C12 | clarify 不存在或使用者未回覆時停止 | P2-3 | SOP 流程 | 分支與停止 |
| C13 | Rule 從 1 連續編號 | P2-6 | `rules/憲法規則-格式規範.md` Rule 1 | 需正反例 |
| C14 | 強度只用固定用詞 | P2-6 | 同上 Rule 2 | 需判斷 |
| C15 | 規則只包含使用者要求與澄清結果 | P2-6 | 同上 Rule 3 | 需判斷 |
| C16 | 範例使用專案情境、產出物實際格式、兩例同一重點 | P2-6 | 同上 Rule 4 第 1–3 條 | 需判斷 |
| C17 | 範例取材時不得讀取 `specs/001-photo-album-organizer/`、`specs/skill-engineering/`，也不得取自這兩個目錄 | P2-6 | 同上 Rule 4 第 1 條 | 約束的是「範例取材」，和 C16 同主題，擴充既有 Rule；和 C22 約束的動作不同（C22 約束一致性檢查的範圍） |
| C18 | 憲法檔的 Rule 標題、說明、Good／Bad Example 結構 | P2-6 | 樣板組 | 整份產出檔案的結構 |
| C19 | 只建立或修改 `.agents/constitution/` 下的檔案，必要時建立目錄 | P2-6 | 步驟內文 | 單一步驟，一句話 |
| C20 | 逐條驗證規則與落點檢查清單、比對樣板結構 | P2-7 | SOP 流程 | 驗證與重做的分支 |
| C21b | 檢查範圍：依「落點檢查清單」決定的目標 Skill 與其產出物，並依 Rule 的適用條件排除不適用的；Skill 部位含 `SKILL.md` 規定產出物內容的步驟、`rules/`、`templates/`；產出物取自每個 spec 目錄；程式碼依 `plan.md` 專案結構與 `tasks.md` 路徑定位 | P3-3 | `rules/一致性檢查-格式規範.md` Rule 1 | 需判斷哪些部位「規定產出物內容」與 Rule 適用條件；不是整份產出結構，不選樣板；無法由程式判斷，不選腳本 |
| C22 | 一致性檢查不得讀取 `specs/001-photo-album-organizer/`、`specs/skill-engineering/` | P3-3 | 同上 Rule 1 | 約束的是一致性檢查的範圍，和 C17 約束的「範例取材」是不同動作 |
| C23 | 違反才列為衝突；符合、例外成立不列；依 Rule 適用條件判定 | P3-5 | 同上 Rule 2 | 需判斷與正反例 |
| C24 | 結果分成「檢查紀錄」與「衝突清單」：檢查紀錄列出每條 Rule 已檢查的每個 Skill 部位與產出物路徑、對應的憲法檔與 Rule 編號及判定（符合、例外成立、衝突、無法檢查），不填處理 Skill；衝突清單每筆寫位置（路徑與部位）、憲法檔與 Rule 編號、說明、處理 Skill（產出物 → 產出 Skill，程式碼 → `implement`，Skill 部位 → `skill-engineering`） | P3-5 | 同上 Rule 3 | 需判斷與正反例；回報是對話輸出，不是產出檔，不選樣板 |
| C25 | 無法檢查列出原因、不列為通過；缺少部位時其他部位仍檢查；程式碼路徑不存在寫「指定路徑不存在」 | P3-5 | 同上 Rule 4 | 需判斷與正反例 |
| C26 | 以 `find specs -mindepth 1 -maxdepth 1 -type d` 列 spec 目錄 | P3-2 | 步驟內文 | 單一命令，不另建腳本 |
| C27 | 一致性檢查不建立、修改或刪除任何檔案 | P3-4 | 步驟內文 | 只屬於單一步驟，一句話 |
| C28 | 回報內容；沒寫入時寫「未寫入，未執行一致性檢查」；有寫入時提醒 `git diff` | P4-1 | 步驟內文 | 只屬於單一步驟；回報是對話輸出 |
| C29 | Phase 3 完成後進入 Phase 4；驗證未通過時修正後重驗 | P3-6 | SOP 流程 | Phase 轉移與重做分支 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `SKILL.md` frontmatter | 修改 `description` | — | 已完成 |
| 2 | W2 | `skill-form-sop` | `SKILL.md` SOP | 寫入胖 SOP | C9、C26–C29，及待抽取的 C21b–C25 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/憲法規則-格式規範.md` Rule 4 | 修改第 1 條與範例 | C17 | 已完成 |
| 4 | W5 | `skill-form-rule` | `rules/憲法落點-格式規範.md` Rule 2 | 補 `shared.md` 的目標 Skill 條列 | C21a | 已完成 |
| 5 | W4 | `skill-derive-rule` | Phase 3「建立『檢查範圍』」與「建立『一致性檢查結果』」步驟 | 抽出 `rules/一致性檢查-格式規範.md` 並加入載入步驟 | C21b–C25 | 已完成 |

### 工作項內容

#### W1 — `skill-form-description`

- Before：第 2 節 To-Be 之外的現行 `description`（`.agents/skills/constitution/SKILL.md` 第 3 行）。
- After：第 2 節 To-Be 的 `description` 原文。

#### W2 — `skill-form-sop`（胖 SOP）

- Phase 1 步驟 4：「每項「規則需求」的目標 Skill」改為「每項「規則需求」依「落點檢查清單」決定的目標 Skill」，其餘文字不變。
- Phase 1 步驟 7：「進入 Phase 3」改為「進入 Phase 4」。
- 在 Phase 2 之後插入 Phase 3「檢查一致性」，暫時不含載入步驟，共 5 步：
  1. `READ` 在專案根目錄執行 `find specs -mindepth 1 -maxdepth 1 -type d` 列出 spec 目錄，建立「spec 目錄清單」。
  2. `THINK` 依「落點檢查清單」與「spec 目錄清單」，為每條寫入或修改的 Rule 決定要檢查的 Skill 部位與產出物，建立「檢查範圍」：檢查「落點檢查清單」決定的目標 Skill 與其產出物，再依該 Rule 的適用條件排除不適用的；Skill 部位包含 `SKILL.md` 中直接規定產出物內容的步驟、`rules/` 與 `templates/`；產出物取自每個 spec 目錄，程式碼依該 spec 目錄的 `plan.md` 專案結構與 `tasks.md` 的檔案路徑定位；不得讀取 `specs/001-photo-album-organizer/` 與 `specs/skill-engineering/`。
  3. `READ` 「檢查範圍」中的每個 Skill 部位與產出物，建立「檢查對象」；本 Phase 不建立、修改或刪除任何檔案。
  4. `THINK` 逐條比對寫入或修改的 Rule 與「檢查對象」，建立「一致性檢查結果」，分成「檢查紀錄」與「衝突清單」：檢查紀錄列出每條 Rule 已檢查的每個 Skill 部位與產出物路徑、對應的憲法檔與 Rule 編號及判定（符合、例外成立、衝突、無法檢查），不填處理 Skill；只有違反 Rule 的內容列入衝突清單，符合 Rule 或 Rule 明定的例外成立時不列入；衝突清單每筆寫出位置（檔案路徑與部位：Rule 編號、樣板區段、Phase 與步驟，或產出物的段落）、憲法檔與 Rule 編號、違反的說明與處理 Skill；處理 Skill 對產出物填產出該產出物的 Skill（`spec.md` 填 `s-specify` 或 `clarify-over-specs`，`research.md`、`techstack.md` 填 `technical-research`，`plan.md` 填 `system-analysis`，`contracts/` 填 `api-plan`，`data/` 填 `data-plan`，`ui/` 填 `ui-plan`，`tasks.md` 填 `tasks`，程式碼填 `implement`），對 Skill 部位填 `skill-engineering`；無法檢查的項目列為「無法檢查」並寫出原因（沒有任何 spec 目錄有該產出物、找不到路徑、讀取失敗、目標 Skill 不存在），不得列為通過；目標 Skill 缺少某個部位時，其他部位仍要檢查；程式碼的指定路徑不存在時寫「指定路徑不存在」，不得自行判斷為尚未實作。
  5. `CHECK` 每條寫入或修改的 Rule 都有檢查紀錄，每筆衝突都有位置、憲法檔與 Rule 編號及處理 Skill，每筆無法檢查都有原因；未通過時修正「一致性檢查結果」後重新驗證。
  - 完成條件：每條寫入或修改的 Rule 都有一致性檢查結果。
- 原 Phase 3「回報」改為 Phase 4，步驟 1 與完成條件改為第 2 節 To-Be 的原文。

#### W3 — `skill-form-rule`

- 目標：`.agents/skills/constitution/rules/憲法規則-格式規範.md` Rule 4。
- 第 1 條改為：「Good Example 與 Bad Example 必須使用專案的領域情境，情境取自 `specs/` 下的文件或使用者的描述；取材時不得讀取 `specs/001-photo-album-organizer/` 與 `specs/skill-engineering/`，也不得取自這兩個目錄。」第 2、3 條不變。
- 依新條文檢查 Good／Bad Example；需要時把範例改成示範這項排除，範例不得使用驗收情境的主題（主鍵命名、emoji、`console.log`、按鈕字數）。其他 Rule 不變。

#### W5 — `skill-form-rule`

- 目標：`.agents/skills/constitution/rules/憲法落點-格式規範.md` Rule 2。
- 在既有條列後補一條：「寫入 `shared.md` 的規則，目標 Skill 是落點表列出的所有 Skill。」既有條列與其他 Rule 不變；Good／Bad Example 需要時補上這一點，範例不得使用驗收情境的主題。

#### W4 — `skill-derive-rule`

- 目標步驟：Phase 3「檢查一致性」中建立「檢查範圍」的 `THINK` 步驟，與建立「一致性檢查結果」的 `THINK` 步驟。
- 抽出到新的 `rules/一致性檢查-格式規範.md`，4 條 Rule：
  - Rule 1 檢查範圍（C21b、C22）：W2 步驟 2 冒號後的內容。
  - Rule 2 衝突判定（C23）：只有違反才列；符合與例外成立不列；依 Rule 的適用條件判定。
  - Rule 3 結果寫法與處理 Skill（C24）：檢查紀錄與衝突清單分開；檢查紀錄的路徑、憲法檔與 Rule 編號及判定；衝突清單的位置、憲法檔與 Rule 編號、說明、處理 Skill 的對應。
  - Rule 4 無法檢查（C25）：原因、不得列為通過、缺少部位仍檢查其他部位、「指定路徑不存在」。
- 每條 Rule 附 Good／Bad Example，情境不得使用驗收情境的主題（主鍵命名、emoji、`console.log`、按鈕字數），也不得取自兩個排除目錄。
- After：Phase 3 第 1 步插入 `READ` 檢查一致性時，讀取 `rules/一致性檢查-格式規範.md` 的所有 Rule，建立「一致性檢查清單」；兩個 `THINK` 步驟改為依「一致性檢查清單」的寫法，刪除已抽取的內文；`CHECK` 改為「逐條驗證『一致性檢查清單』；未通過時修正『一致性檢查結果』後重新驗證」；完成條件補「且通過『一致性檢查清單』」。結果與第 2 節 To-Be Phase 3 一致。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E5、E10、E12、E13 | 本次原始問題 | 為 `data-plan` 新增規則：「資料表主鍵欄位必須命名為 `id`；spec 明確要求使用自然鍵時可以例外」。測試環境：spec A 的 `data-model.dbml` 有主鍵 `room_code`（違反）；spec B 全部用 `id`（符合）；spec C 的 spec 明確要求自然鍵、資料模型使用自然鍵（例外成立）；三個 spec 都沒有 `tasks.md`；`data-plan` 的樣板範例改成主鍵 `pk_id`；`data-plan` 的某個 RuleFile 加一條「主鍵命名為 `<表名>_key`」的 Rule；`data-plan` SKILL.md 的某一步驟改成規定主鍵命名 `<表名>_id` | clarify 提問時回答「沒有其他要求，照描述寫」 | 寫入 `skills/data-plan/data-model.md`；衝突清單列出 spec A 的位置與 `data-plan`，spec B、spec C 不列為衝突，但出現在檢查紀錄（判定為符合、例外成立）；列出樣板區段、RuleFile 的 Rule 編號與 SKILL.md 的 Phase 與步驟，處理 Skill 為 `skill-engineering`；每筆對應憲法檔與 Rule 編號；憲法目錄外沒有變動 |
| S2 | E1、E2、E5、E6、E7、E10 | 本次 | 在 `shared.md` 新增規則：「文件說明文字不得使用 emoji」。測試環境：spec D 的 `ui/plan.md` 有 emoji、spec E 沒有；`specs/001-photo-album-organizer/` 與 `specs/skill-engineering/` 都放有 emoji 的檔案 | 同 S1 | 檢查範圍涵蓋落點表全部 Skill 與產出物；衝突清單列出 spec D 的位置與 `ui-plan`；spec E 不列為衝突，出現在檢查紀錄；兩個排除目錄沒有被讀取（以執行紀錄的工具呼叫判斷），也沒有出現在結果或範例中 |
| S3 | E1、E5、E8、E9、E10 | 本次 | 為 `implement` 新增規則：「程式碼不得使用 `console.log`」。測試環境：spec F 的 `plan.md` 專案結構列出 `app/`，`app/main.ts` 有 `console.log`；spec G 的 `plan.md` 列出的目錄不存在 | 同 S1 | 列出 `app/main.ts` 的位置與 `implement`；spec G 列為「無法檢查」，原因「指定路徑不存在」 |
| S4 | E9、E10 | 本次 | 為 `ui-plan` 的 `ui/*.html` 新增規則：「按鈕文字不得超過 6 個字」。測試環境：所有 spec 都沒有 `ui/*.html`；`ui-plan` 的 `templates/` 移除對應 HTML 的樣板 | 同 S1 | 產出物列為「無法檢查」，原因「沒有任何 spec 目錄有該產出物」；`ui-plan` 的 `SKILL.md`、`rules/` 仍有檢查結果 |
| S5 | E11、E12 | 回歸 | 兩個需求：「每次產出 spec.md 之後都要先跑一次 analyze」，以及「tasks.md 的任務 ID 改成 `TASK-001` 格式」 | 無 | 兩項都列入拒絕清單（流程類需求；和任務 ID 格式這個鎖定項目衝突，寫出依賴者），沒有寫入任何檔案；回報寫「未寫入，未執行一致性檢查」 |
| S6 | E13 | 回歸 | 測試環境：`skills/api-plan/openapi.md` 有 Rule 1「清單 `pageSize` 上限 100」與 Rule 2「分頁回應必須含 `total`」。輸入：「清單 `pageSize` 上限改成 50」 | clarify 提問時回答「其他不變」 | 修改 Rule 1，沒有新增 Rule；Rule 2 原文不變 |
| S7 | E13 | 回歸 | 「API 的時間欄位要統一格式」（沒有說是哪一種格式） | clarify 提問後不回覆 | 停止執行，沒有寫入任何檔案 |

所有情境都在暫存專案複本執行。執行前後各以 `find . -type f -not -path './.git/*' -print0 | sort -z | xargs -0 shasum > <測試專案外的快照路徑>` 保存整個測試專案的檔案清單與內容雜湊（以 NUL 分隔傳遞檔名，支援含空白的路徑），比對新增、修改、刪除；差異只能出現在 `.agents/constitution/` 下（E10）。

## 8. 驗收結果

### 施工

- W1、W2、W3、W5、W4 依序完成（`implementer` 子代理依各 `skill-form-*`／`skill-derive-*` 的 SOP 施工）。施工中 W5 的第一次寫入把 `rules/憲法落點-格式規範.md` 寫成空檔，子代理以 `git checkout` 還原（該檔施工前沒有未提交的修改）後重做；主 session 已確認檔案內容與 Rule 2 新條列正確。
- `.agents/skills/constitution/SKILL.md` 與第 2 節 To-Be 逐行比對一致。
- 施工後結構診斷：`audit_skill.py --skills-root .agents/skills --skills-root .claude/skills --skill constitution`，summary 為 skills 1、errors 0、warnings 0。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」；`CLAUDE.md`、`AGENTS.md` 沒有變更；沒有只存在於目標端、未被刪除的 Skill。

### 驗收情境

- 驗收模型：Claude Sonnet（`model: sonnet`、`effort: medium`），以 `skill-tester` 子代理執行；每個子代理只取得測試環境路徑、Skill 路徑、使用者輸入與預先回覆。
- 測試環境：`scripts/setup_accept.sh`（scratchpad）為每個情境建立獨立的暫存專案，複製本次未提交的 `.agents/`、`.claude/skills/`、`CLAUDE.md`、`AGENTS.md`，再依情境建立 spec 目錄與修改。
- 副作用：執行前後以 `find . -type f -not -path './.git/*' -print0 | sort -z | xargs -0 shasum` 快照比對整個測試專案。

| 情境 | 結果 | 依據 |
| ---- | ---- | ---- |
| S1 | 通過 | 寫入 `skills/data-plan/data-model.md` Rule 3；衝突清單列出 spec 001 `orders.order_no`（`data-plan`）、`SKILL.md` Phase 2 步驟 2、RuleFile Rule 99、樣板 `products.pk_id`（三者 `skill-engineering`）；spec 002 判「符合」、spec 003 判「例外成立」，只出現在檢查紀錄；每筆對應 `data-model.md` Rule 3；clarify 提問 2 題後依預先回覆寫入；快照差異只有該憲法檔 |
| S2 | 通過 | 寫入 `shared.md` Rule 2；檢查紀錄涵蓋落點表 8 個 Skill；衝突清單列出 spec 004 `ui/plan.md` 的 🏆（`ui-plan`），以及 `tasks` 樣板與 RuleFile 的 `🎯`、`⚠️`（`skill-engineering`）；spec 005 判「符合」；兩個排除目錄只出現在 `find`／`ls` 的目錄列表，沒有讀取內容，也沒有出現在結果或範例；快照差異只有 `shared.md` |
| S3 | 通過 | 新建 `skills/implement/code.md` Rule 1；衝突清單列出 `app/main.ts` 第 2 行（`implement`，依 spec 006 `plan.md` 定位）；spec 007 的 `server/sync.ts` 列為「無法檢查」，原因「指定路徑不存在」；`implement` 沒有 `templates/` 也列為無法檢查，`SKILL.md`、`rules/` 仍有結果；快照差異只有新建的憲法檔 |
| S4 | 通過 | 新建 `skills/ui-plan/ui-page.md` Rule 1；`ui/*.html` 列為「無法檢查」，原因「沒有任何 spec 目錄有該產出物」；`ui-plan` 的 `SKILL.md`、`rules/` 仍有檢查結果；快照差異只有新建的憲法檔。測試環境註記：只移除了 `.agents` 側的 HTML 樣板，`.claude` 側仍在，子代理把 `.agents` 側列為「無法檢查（找不到路徑）」並另讀 `.claude` 側，在範例中找到 9 字按鈕列為衝突；不影響本情境的判斷項目 |
| S5 | 通過 | 兩項需求都列入拒絕清單（流程類；任務 ID 鎖定項目，列出 `check_tasks.py`、`tasks` 規範與樣板、`implement` 等依賴者）；回報寫「未寫入，未執行一致性檢查」；快照沒有差異 |
| S6 | 通過 | 修改既有 Rule 1（上限改 50），沒有新增 Rule，Rule 2 原文不變；檢查紀錄列出 `api-plan` 各部位；spec 010 沒有 `contracts/`，列為「無法檢查」；快照差異只有該憲法檔 |
| S7 | 通過 | clarify 提問 3 題（未超過上限）後使用者未回覆，停止執行，沒有進入 Phase 3、Phase 4；快照沒有差異 |

### 觀察（不影響通過）

1. S1、S3、S4：使用者需求已完整時，子代理仍判斷有「待澄清項目」並提問；SOP 的判斷是「寫成規則所必須、但使用者沒有給出的細節」，提問數都在上限內。
2. S2：子代理對部分 Skill 的 `rules/`、`templates/` 以 grep 掃描，沒有全文讀取；對 emoji 這類可由字元判斷的規則足夠，對需要語意判斷的規則可能不足。
3. S4：子代理為避免和鎖定的「雛形狀態」面板衝突，自行把規則範圍限定在產品畫面按鈕；這是 Phase 1 鎖定檢查的既有行為，與本次修改無關。

### 個案驗收條件的調整建議

無。

## 9. 確認紀錄

使用者不在場，授權 Claude 與 Codex 討論後決定（2026-11-07）。

- 第 1 輪：Codex 指出 4 項：檢查紀錄與衝突清單要分開（E1）；C17 要明寫「取材時不得讀取」；`shared.md` 的目標 Skill 要在 Phase 1 就展開，並與 Phase 3 共用同一份定義（新增 C21a、W5，修改 P1-4）；E10 要比對整個測試專案的檔案雜湊。已全部納入。
- 第 2 輪：Codex 指出 3 項：W3 的範例調整誤放到 W5；檢查紀錄也要寫憲法檔與 Rule 編號；雜湊命令要支援含空白的路徑，快照存到測試專案外。已全部納入。
- 第 3 輪：Codex 回覆「確認」。推定的驗收條件 E4、E6、E8、E11 已在根因報告確認。
