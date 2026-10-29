# 工程藍圖：tasks－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/26-tasks-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「確認」：接受推定的 E5、E6、E7（皆為通用），確認藍圖其餘內容。前置決策：使用者以 `artifact-to-skill-engineering` 委派，樣板組 `templates/tasks.md`（本次倒抽）與 `templates/tasks.example.md`（使用者定稿，sha256 `4b95d7c4dbf493a3fa464bad5c981f0ab18d8951609f67a6228938f460fbb6b8`）作為產出格式保留、不改寫；輸入樣本不存在，使用推定輸入樣本「/tasks specs/004-shopping-cart-checkout/ 依這個 spec package 產出 tasks.md，每個任務都要標出執行時要讀哪些文件的哪個部位」。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | `tasks.md` 寫在目標 spec 目錄；區塊順序與固定段落與樣板組一致（front matter、標題、Input／Tests／Organization、Reference Loading Contract、Format、Path Conventions、Setup、Foundational、User Story Phase、Polish、Dependencies & Execution Order、Parallel Example、Implementation Strategy、Notes）；User Story Phase 數等於 spec.md 的 User Story 數並依 spec 順序；沒有殘留 `{{` | 本次（使用者定稿的樣板組） | 通用 |
| E2 | 每個任務下方至少有一項 Must Read；每項參考寫成 `` `檔案` → 部位 — Why：理由 ``；參考的檔案存在於目標 spec 目錄，或由本檔較前面的任務建立；部位中的識別字（operationId、schema、`Table`／`Enum`／`Ref`、§ 編號、FR／NFR／SC 編號、「」標出的畫面或狀態名稱）都能在該檔案中搜尋到 | 本次（交接：Must Read／Optional 綁定參考部位） | 通用 |
| E3 | Foundational 與每個 User Story Phase 內依技術端點分組，順序為資料庫 → 後端 → 前端；組標題括號列出該組實作的介面編號，編號都存在於 plan.md「系統介面盤點」；盤點表的每個介面至少出現在一個組標題 | 本次（交接：每個 US 內分資料庫 → 後端 → 前端，標題標出介面編號） | 通用 |
| E4 | plan.md 盤點了介面但 contracts／data／ui 沒有對應部位，或上游文件之間命名或內容矛盾時，Notes 以「待確認 n：」列出缺口與受影響的任務，相關任務標「見 Notes 待確認 n」；任務描述與參考不出現上游沒有的 operationId、路徑、資料表或欄位 | 本次（交接：上游缺部位時寫成待確認，不得虛構 operation） | 通用 |
| E5 | 任務 ID 從 T001 連續編號；User Story Phase 的任務都帶 `[USk]`，Setup、Foundational、Polish 的任務不帶；spec.md 的每個 FR、NFR 至少被一個任務引用 | 推定：樣板 Format 段落規定 ID 與 Story 標籤；任務清單漏掉需求時實作也會漏掉 | 通用 |
| E6 | spec.md 沒有明確要求撰寫測試或 TDD 時，User Story Phase 不產生測試任務，`**Tests**:` 說明理由；Success Criteria 需要量測時以 Polish 的驗證任務處理 | 推定：範例 Tests 段落的做法；Success Criteria 中「以 N 組測試」屬於驗收量測，不是要求撰寫測試 | 通用 |
| E7 | 目標 spec 目錄沒有 `plan.md` 時停止並告知先用 `system-analysis`，不建立 `tasks.md`；已有 `tasks.md` 時先詢問是否覆寫，使用者未同意前不修改 | 推定：介面分組依 plan.md；覆寫會遺失既有任務清單（`001-online-pvp-1a2b` 已有原版 tasks.md） | 通用 |

## 2. To-Be SOP

````markdown
---
name: tasks
description: （由 W1 依 skill-form-description 撰寫）
---

# SOP

## Phase 1 -- 收斂任務輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「任務輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `contracts/`、`data/`、`ui/` 下所有檔案的全文（不存在的略過），加入「任務輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `WRITE` 同目錄已有 `tasks.md` 時，詢問使用者是否覆寫；沒有時略過本步驟與下一步。
7. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有 `tasks.md`、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與同目錄的上游文件已讀取，且沒有既有 `tasks.md` 或使用者已同意覆寫；或缺少輸入、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 規劃任務

1. `READ` 規劃任務時，讀取 `rules/任務清單-格式規範.md` 的所有 Rule，建立「任務清單檢查清單」。
2. `THINK` 依「任務輸入」與已載入的「任務清單檢查清單」，為 `plan.md`「系統介面盤點」的每個介面找出 contracts、data、ui 中實作所依據的 operation、資料表或畫面，並記下上游缺口，建立「介面對照」。
3. `THINK` 依「任務輸入」、「介面對照」與已載入的「任務清單檢查清單」，把工作排入 Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish，逐一寫出任務描述與 Must Read／Optional 參考，建立「任務規劃」。

完成條件：「介面對照」涵蓋盤點表的每個介面，「任務規劃」已涵蓋每個 User Story。

## Phase 3 -- 產出 tasks.md

1. `READ` `templates/tasks.md` 與 `templates/tasks.example.md`，載入骨架與範例，命名載入結果為「tasks 樣板組」。
2. `WRITE` 依「tasks 樣板組」與「任務規劃」，將 `tasks.md` 寫入「目標 spec」所在目錄，不建立或修改其他檔案：標題填 spec.md 的功能名稱與英文名稱，spec 目錄填目錄名稱；Reference Loading Contract 第 4 點只列出目標 spec 目錄中存在的文件；User Story Phase 數依 spec.md 調整，Polish 的 Phase 編號接在最後一個 User Story 之後；樣板的英文固定段落保留原文，其餘內文使用繁體中文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_tasks.py --spec-dir <目標 spec 目錄絕對路徑> <tasks.md 絕對路徑>`，取得「任務清單檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「任務清單檢查結果」沒有 `issues`，逐條驗證「任務清單檢查清單」，比對 `tasks.md` 與「tasks 樣板組」的區塊順序與固定段落，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `tasks.md` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者回報 `tasks.md` 路徑、各 Phase 的任務數、Notes 中的待確認項目、「任務清單檢查結果」的 `warnings`，以及「未通過項」（沒有時說明全部通過）。

完成條件：`tasks.md` 已寫入，「任務清單檢查結果」、「任務清單檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name`、`description` | 觸發與分流 |
| Phase 1 -- 收斂任務輸入（7 步） | 新增 | 決定目標 spec、讀上游文件、缺 plan.md 停止、覆寫確認 | E7；C2–C6 |
| Phase 2 -- 規劃任務（3 步） | 新增 | 載入任務清單規範、建立介面對照、規劃任務 | E2–E6；C7–C11 |
| Phase 3 -- 產出 tasks.md（5 步） | 新增 | 載入樣板組、寫入、腳本檢查、驗證、回報 | E1、E2、E3、E5；C1、C12–C16 |
| `rules/任務清單-格式規範.md`（5 條 Rule） | 新增 | 分組、任務描述、參考綁定、上游缺口、測試任務 | E2–E6；C7–C11 |
| `scripts/check_tasks.py` | 新增 | 機械檢查任務 ID、標籤、參考格式與識別字、介面編號、需求涵蓋、待確認對應 | E1、E2、E3、E5；C14 |
| 樣板組 `templates/tasks.md`／`tasks.example.md` | 沿用 | 已由 `artifact-to-skill-engineering` Phase 3 建立，SOP 直接載入，不修改 | E1；C1 |
| `LICENSE` | 新增 | 註明 Spec-Kit 衍生內容並保留 MIT 全文；更新根目錄 `LICENSE` 授權範圍 | CLAUDE.md 規則 3 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 15 | +15 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 5 | +5 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 1 | +1 |

- 新建模式，所有元素都是新增；樣板組已存在，只新增載入步驟。
- RuleFile：分組、任務描述、參考綁定、上游缺口與測試任務都需要語意判斷與正反例（E2–E6），屬同一主題「任務清單內容」，集中在一個檔案。
- 腳本：一份 tasks.md 約 40–50 個任務、150 項參考，逐項確認檔案與識別字存在於上游文件，人工檢查容易漏；輸入（spec 目錄、tasks.md）與輸出（問題清單）明確，可由程式判斷（E2、E3、E5）。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | `tasks.md` 的區塊順序與固定段落（front matter、標題、Input／Tests／Organization、Reference Loading Contract 第 1–3、5–7 點、Format、Path Conventions、各 Phase 的 Purpose／Goal／Independent Test／Checkpoint、Dependencies、Parallel Example、Implementation Strategy、Notes 前 6 項） | P3-2 | tasks 樣板組 | 約束整份產出檔案的結構；不是可由腳本產生的內容 |
| C2 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C3 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C4 | 沒有 plan.md 時停止並指向 `system-analysis` | P1-5 | SOP 流程 | 屬於分支與停止 |
| C5 | 既有 tasks.md 須經使用者同意才覆寫 | P1-6、P1-7 | SOP 流程 | 屬於使用者確認閘門 |
| C6 | 不同意或未回覆時回報未修改並停止 | P1-7 | SOP 流程 | 屬於分支與停止 |
| C7 | Phase 歸屬與端點分組：多個 User Story 共用的基礎設施放 Foundational，其餘工作放第一個需要它的 User Story；Phase 內依資料庫 → 後端 → 前端分組，盤點表中其他端點類型（例如第三方服務）歸入呼叫它的那一組；組標題括號列出介面編號，Foundational 的共用組加「共用」；沒有任務的端點組不列，若省略原因不明顯則以引言說明；User Story Phase 數依 spec 增減 | P2-3 | `rules/任務清單-格式規範.md` Rule 1 | 判斷共用與否、介面歸哪個 Story 需要語意；需要「依技術層而非 Story 切 Phase」「組標題沒有介面編號」的反例 |
| C8 | 任務描述：寫出確切檔案路徑；從上游原樣帶入實作需要的識別字（operationId、錯誤碼、欄位名、狀態名稱、畫面文字）；描述結尾括號引用需求編號（FR／NFR／SC、US 情境、Edge Cases）；`[P]` 只標在與同 Phase 未完成任務不同檔案且沒有依賴者；同一檔案由多個任務修改時循序；`[USk]` 只標在 User Story Phase | P2-3 | `rules/任務清單-格式規範.md` Rule 2 | 判斷要帶入哪些識別字、哪些任務可平行需要語意；需要「只寫『實作購物車 API』」的反例 |
| C9 | 參考綁定：每個任務至少一項 Must Read；Must Read 是開工前必讀、決定任務內容的部位，Optional 是特定情況才讀，Why 寫出該情況或該部位決定任務的哪部分；部位以 Reference Loading Contract 第 4 點的識別字定位，不引用整份文件（本檔任務建立的小型檔案除外）；只引用上游實際存在的識別字 | P2-3 | `rules/任務清單-格式規範.md` Rule 3 | Must Read 與 Optional 的區分、Why 的寫法需要判斷與正反例；識別字存在與否另由 C14 的腳本機械檢查 |
| C10 | 上游缺口：盤點表的介面在 contracts／data／ui 找不到對應部位，或上游文件之間命名、內容矛盾時，在 Notes 以「待確認 n：」寫出缺口、影響的任務與暫行做法，受影響任務標「見 Notes 待確認 n」，不虛構 operation、路徑、資料表或欄位；本檔新增 plan.md Source Code 沒有的檔案時，在 Notes 說明 | P2-2、P2-3 | `rules/任務清單-格式規範.md` Rule 4 | 判斷什麼算缺口、什麼可以合理推導需要語意；需要「自行補上 `GET /api/orders`」的反例 |
| C11 | 測試任務：spec.md 明確要求撰寫測試或 TDD 時，每個 User Story 在實作任務前加入測試任務；否則不產生測試任務並在 `**Tests**:` 說明；Success Criteria 的量測（例如「以 N 組測試」「1 秒內」）以 Polish 的驗證任務處理，不視為要求撰寫測試 | P2-3 | `rules/任務清單-格式規範.md` Rule 5 | 「明確要求」與量測型 SC 的區分需要正反例 |
| C12 | 寫入與填值：只寫入 `tasks.md`；標題填功能名稱與英文名稱、spec 目錄填目錄名稱；Reference Loading Contract 第 4 點只列存在的文件；User Story Phase 數依 spec 調整、Polish 編號接續；英文固定段落保留原文，其餘繁體中文 | P3-2 | P3-2 步驟內文 | 填值來源只屬於寫入步驟；樣板只固定位置 |
| C13 | 介面對照的方法：為每個介面找出對應的 operation、資料表或畫面 | P2-2 | P2-2 步驟內文 | 只屬於單一步驟，一句話即可表達；缺口判斷屬 C10 |
| C14 | 機械檢查：無 `{{`；任務 ID 從 T001 連續；每個任務有 Must Read；參考行格式；參考檔案存在或由較前面任務建立；部位識別字（反引號內識別字、「」名稱、§ 編號、FR／NFR／SC、USk）可在檔案中找到；組標題的介面編號存在於 plan.md 盤點表且盤點表每個介面都出現；`[USk]` 與所在 Phase 一致；spec 的 FR／NFR 都被引用；任務中的「待確認 n」在 Notes 有對應項。無法機械判定的部位列為 `warnings` | P3-3 | `scripts/check_tasks.py` | 輸入與輸出明確、可重複執行，結果可由程式判斷；參考數量多，人工檢查易漏 |
| C15 | 驗證最多 3 輪，仍未通過記為「未通過項」 | P3-4 | SOP 流程 | 屬於執行順序與停止條件 |
| C16 | 回報內容（路徑、各 Phase 任務數、待確認、warnings、未通過項） | P3-5 | P3-5 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/tasks/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/tasks/SKILL.md` SOP | 寫入胖 SOP | C2–C16、C1 | 已完成 |
| 3 | W3 | `skill-derive-script` | Phase 3 -- 產出 tasks.md 的 `CHECK` 機械檢查步驟 | 抽取 `scripts/check_tasks.py`，加入 `DELEGATE` 執行步驟、調整 `CHECK` 步驟 | C14 | 已完成 |
| 4 | W4 | `skill-derive-rule` | Phase 2 -- 規劃任務的 `THINK` 規劃步驟 | 抽取 `rules/任務清單-格式規範.md`，加入載入步驟、調整 `CHECK` 步驟 | C7–C11 | 已完成 |
| 5 | W5 | `skill-engineering` 直接撰寫 | `.agents/skills/tasks/LICENSE`、根目錄 `LICENSE` | 註明 Spec-Kit 衍生內容並保留 MIT 全文；授權範圍加入 `tasks` | CLAUDE.md 規則 3 | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: tasks`
- `description`：已有 spec.md、plan.md 及 system-analysis 委派產出的 API 合約、資料模型與 UI 規劃，要拆成可執行的任務清單時使用；依 spec 的 User Story 與 plan.md 系統介面盤點，把工作排成 Setup、Foundational、每個 User Story 一個 Phase 與 Polish，Phase 內依資料庫、後端、前端分組並標出介面編號，每個任務列出執行時要讀的文件部位（Must Read／Optional，`檔案 → 部位 — Why`），寫成 spec 目錄的 `tasks.md`；上游缺少的介面部位寫成 Notes 的待確認，不自行虛構。觸發關鍵字：tasks、tasks.md、任務清單、任務拆解、implementation tasks、Reference Loading Contract。分流：盤點介面與產出 plan.md 改用 `system-analysis`；只補單一種上游產出改用 `ui-plan`、`api-plan`、`data-plan`；規劃類別圖改用 `plan-with-class-diagram`。
- 未經使用者實際驗證前，`description` 開頭加「（未驗證）」。
- 施工註記（W1）：觸發演練時，「依 tasks.md 實作 T001」會因 tasks.md 關鍵字誤觸發，於分流句尾補上「依既有 tasks.md 實作任務時不使用此 Skill」；只收窄觸發範圍，用途與其他分流不變。

#### W2：胖 SOP

Phase 1 與 To-Be SOP 全文相同。Phase 2 與 Phase 3 寫成下列胖 SOP：

```markdown
## Phase 2 -- 規劃任務

1. `THINK` 依「任務輸入」，為 `plan.md`「系統介面盤點」的每個介面找出 contracts、data、ui 中實作所依據的 operation、資料表或畫面，並記下上游缺口：介面找不到對應部位，或上游文件之間命名、內容矛盾時記為缺口，寫出缺口內容、受影響的工作與暫行做法，不虛構 operation、路徑、資料表或欄位；預計新增 plan.md Source Code 沒有的檔案時一併記下，建立「介面對照」。
2. `THINK` 依「任務輸入」與「介面對照」，把工作排入 Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish，逐一寫出任務描述與 Must Read／Optional 參考，建立「任務規劃」：
   - 多個 User Story 共用的基礎設施放 Foundational，其餘工作放第一個需要它的 User Story；Phase 內依資料庫 → 後端 → 前端分組，其他端點類型歸入呼叫它的那一組；組標題括號列出介面編號，Foundational 的共用組加「共用」；沒有任務的端點組不列，省略原因不明顯時以引言說明。
   - 任務描述寫出確切檔案路徑，從上游原樣帶入實作需要的識別字（operationId、錯誤碼、欄位名、狀態名稱、畫面文字），結尾括號引用需求編號；`[P]` 只標在與同 Phase 未完成任務不同檔案且沒有依賴者；同一檔案由多個任務修改時循序；`[USk]` 只標在 User Story Phase。
   - 每個任務至少一項 Must Read；Must Read 是開工前必讀、決定任務內容的部位，Optional 是特定情況才讀，Why 寫出該情況或該部位決定任務的哪部分；部位以文件內可搜尋的識別字定位，不引用整份文件（本檔任務建立的小型檔案除外），只引用上游實際存在的識別字。
   - 受上游缺口影響的任務標「見 Notes 待確認 n」，缺口寫入 Notes 的「待確認 n：」；新增 plan.md 沒有的檔案時在 Notes 說明。
   - spec.md 明確要求撰寫測試或 TDD 時，每個 User Story 在實作任務前加入測試任務；否則不產生測試任務並在 Tests 欄說明；Success Criteria 的量測以 Polish 的驗證任務處理。

完成條件：「介面對照」涵蓋盤點表的每個介面，「任務規劃」已涵蓋每個 User Story。

## Phase 3 -- 產出 tasks.md

1. `READ` `templates/tasks.md` 與 `templates/tasks.example.md`，載入骨架與範例，命名載入結果為「tasks 樣板組」。
2. `WRITE` （同 To-Be P3-2）
3. `CHECK` 確認 `tasks.md` 沒有殘留的 `{{`；任務 ID 從 T001 連續；每個任務有 Must Read；每項參考符合 `` `檔案` → 部位 — Why：理由 ``，檔案存在於目標 spec 目錄或由較前面的任務建立，部位中的識別字能在該檔案中以 `grep` 找到；組標題的介面編號都在 plan.md 盤點表中且盤點表每個介面都出現；`[USk]` 與所在 Phase 一致；spec.md 的每個 FR、NFR 都被引用；任務中的「待確認 n」在 Notes 都有對應項；比對樣板組的區塊順序與固定段落，確認 Phase 2 步驟 2 與步驟 2 的要求均已滿足；未通過時修正後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
4. `WRITE` （同 To-Be P3-5，「warnings」改為無法以 grep 確認的參考）

完成條件：（同 To-Be）
```

#### W3：抽取 `scripts/check_tasks.py`

- 目標步驟：Phase 3 -- 產出 tasks.md 的 `CHECK` 步驟（「確認 `tasks.md` 沒有殘留的 `{{`；任務 ID 從 T001 連續」）。
- 介面：`uv run --script scripts/check_tasks.py --spec-dir <spec 目錄> <tasks.md>`；只用標準函式庫。
- 行為：
  1. 解析 `tasks.md`：Phase 標題（`## Phase N: ...`，`User Story k` 者記 k）、端點組標題（`### 資料庫（…）`、`### 後端（…）`、`### 前端（…）`）、任務行（`- [ ] T\d{3}`）、任務下方 `**Must Read**`／`**Optional**` 區塊的參考行。
  2. 問題（`issues`）：殘留 `{{`；任務 ID 不是從 T001 連續；任務沒有 Must Read 或 Must Read 為空；參考行不符合 `` - `檔案`（ → 部位）? — Why：理由 ``；檔案不存在於 spec 目錄，且沒有出現在較前面任務的描述中；部位中可擷取的識別字找不到；組標題的介面編號（`B1–B5` 展開為範圍）不在 plan.md「系統介面盤點」表；盤點表介面未出現在任何組標題；User Story Phase 的任務缺 `[USk]` 或 k 不符，其他 Phase 的任務帶 `[US…]`；spec.md 的 FR／NFR 編號未出現在 tasks.md；任務中的「待確認 n」在 Notes 沒有「待確認 n：」。
  3. 識別字擷取與比對：反引號內容（去掉開頭的 `Table `、`Enum `；`Ref:` 整段比對；含 `.` 的路徑如 `components.schemas.Error` 比對最後一段）；「」內文字；`§N`（比對以 `N.` 或 `§N` 開頭的標題，或檔案中的 `§N`）；`FR-`／`NFR-`／`SC-` 編號；`USk` 對應 spec 中的 `User Story k`。部位沒有可擷取的識別字時，以去掉括號說明後的部位文字做子字串比對，找不到列為 `warnings` 而非 `issues`。
  4. 標準輸出 JSON：`{"tasks": <數量>, "references": <數量>, "phases": [{"title", "tasks"}], "issues": [...], "warnings": [...]}`；`issues` 為空時退出碼 0，有問題時 1，參數或檔案錯誤時 2。
  5. 必須以定稿範例搭配一個依範例識別字建立的暫存 spec 目錄驗證能通過，並以刪除一個 operation、改錯一個 ID 等方式驗證能抓到問題。
- 施工註記（W3）：以範例搭配依範例識別字建立的暫存 spec 目錄驗證，48 個任務、133 項參考解析無誤且 `issues` 為空；變異測試（ID 跳號、缺 `[US1]`、參考格式錯、§ 不存在、盤點表介面改名、spec 新增 FR、Notes 缺待確認、刪除 operation）都被抓到；以 1A2B 原版 tasks.md 執行，回報各任務沒有 Must Read 與組標題未涵蓋介面；參數錯誤時退出碼 2。
- After：Phase 3 的 `CHECK` 拆成 `DELEGATE` 執行腳本（To-Be P3-3）與 `CHECK` 判讀「任務清單檢查結果」並驗證其餘要求（To-Be P3-4）；`CHECK` 內文屬於 C14 的檢查描述刪除。

#### W4：抽取 `rules/任務清單-格式規範.md`

- 目標步驟：Phase 2 -- 規劃任務的兩個 `THINK` 步驟（「找出 contracts、data、ui 中實作所依據的 operation」與「把工作排入 Setup、Foundational」）。
- 5 條 Rule，各附正反範例（範例使用與購物車、1A2B 都不同的情境）：
  - Rule 1 Phase 歸屬與端點分組（C7）
  - Rule 2 任務描述（C8）
  - Rule 3 參考綁定（C9）
  - Rule 4 上游缺口（C10）
  - Rule 5 測試任務（C11）
- 施工註記（W4）：Rule 2、Rule 3 刪去與樣板固定段落（Format 圖例、Reference Loading Contract 第 2–4 點）重複的敘述，只保留判準：檔案路徑依 plan.md 結構、`[P]` 的依賴判斷、哪些部位列 Must Read、識別字須與上游逐字相同。
- After：Phase 2 開頭加入 `READ` 載入步驟建立「任務清單檢查清單」；兩個 `THINK` 改為依已載入的檢查清單，刪除內文中屬於 C7–C11 的描述，P2-2 保留 C13；P3-4 的 `CHECK` 加入逐條驗證「任務清單檢查清單」。

#### W5：LICENSE

- `.agents/skills/tasks/LICENSE`：本 Skill 為自建 Skill，`templates/tasks.md` 與 `templates/tasks.example.md` 的英文固定段落與整體結構（Format、Phase 1–N、Checkpoint、Dependencies & Execution Order、Parallel Example、Implementation Strategy、Notes）衍生自 GitHub Spec Kit 的 tasks 樣板（MIT License，Copyright GitHub, Inc.），範例最早由 speckit-tasks 產出後改寫；購物車情境、Reference Loading Contract、端點分組、SOP、RuleFile 與腳本為重新撰寫；保留 MIT 授權全文。
- 根目錄 `LICENSE` 授權範圍：比照 `system-analysis` 加入一行 `tasks`。

## 7. 驗收情境

測試環境皆為專案暫存複本；情境輸入使用 1A2B spec package，與樣板範例的購物車情境不同。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E5、E6、E7 | 本次 | 「/tasks specs/001-online-pvp-1a2b/ 依這個 spec package 產出 tasks.md」；目錄保留原版 `tasks.md` | 詢問覆寫時回覆「同意覆寫」 | 先詢問覆寫；`tasks.md` 區塊順序與樣板一致、3 個 User Story Phase、無 `{{`；獨立以 grep 抽查 10 項參考的識別字存在；組標題涵蓋 F1–F4、B1–B4、D1–D2；ID 連續、標籤正確、FR-001–FR-018 與 NFR-001–NFR-004 都被引用；User Story Phase 沒有測試任務且 Tests 欄有說明；沒有修改其他檔案 |
| S2 | E2、E3、E4 | 本次 | 同 S1 輸入；目錄刪除 `tasks.md`，並從 `contracts/openapi.yaml` 刪除 `enterAsPlayer` 的 path（B1 唯一的 operation） | 無 | `tasks.md` 不出現 `enterAsPlayer`；Notes 有「待確認 n：」說明 B1 沒有合約；B1 相關任務標「見 Notes 待確認 n」；B1 仍出現在組標題 |
| S3 | E7 | 本次 | 同 S1 輸入；(a) 目錄刪除 `plan.md` 與 `tasks.md`；(b) 目錄保留原版 `tasks.md` | (b) 詢問覆寫時回覆「不要覆寫」 | (a) 停止並指向 `system-analysis`，沒有建立 `tasks.md`；(b) 停止，`tasks.md` 雜湊與執行前相同 |

## 8. 驗收結果

### 施工後結構診斷

- `audit_skill.py --skills-root .agents/skills --skill tasks`：errors 0、warnings 0；部位 `rules/任務清單-格式規範.md`、`templates/tasks.md`、`templates/tasks.example.md`、`scripts/check_tasks.py` 各由一個步驟載入或執行。
- `sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；同步輸出沒有只存在於目標端的 Skill。
- 範例 `templates/tasks.example.md` 雜湊仍為 `4b95d7c4…b6b8`（定稿雜湊）。

### 驗收方式

- 驗收模型：Claude Sonnet（Agent 工具 `model: sonnet`、`effort: medium`），每個情境一個不帶本次分析脈絡的子代理，只提供 Skill 路徑、測試環境、情境輸入與預先回覆；三個子代理平行執行。
- 測試環境：`/tmp/tasks-accept/<情境>` 為含本次未提交修改的專案複本，執行前記錄 `git status` 與 spec 目錄所有檔案的 sha256，執行後比對副作用。
- 判斷：主代理以獨立命令（`grep`、`awk`、雜湊比對）核對，另以 `check_tasks.py` 重跑。

### 各情境結果

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1 | 通過 | 先詢問覆寫，依「同意覆寫」繼續；產出 60 個任務、164 項參考，`check_tasks.py` `issues`、`warnings` 皆空；區塊順序與樣板一致、3 個 User Story Phase、無 `{{`；抽查 10 項參考的識別字皆在對應檔案找到；組標題涵蓋 D1–D2、B1–B4、F1–F4；FR-001–FR-018、NFR-001–NFR-004 皆被引用；User Story Phase 沒有測試任務，Tests 欄說明理由，SC 量測放在 Polish；spec 目錄只有 `tasks.md` 變更。Notes 列出 5 項待確認（房間狀態命名、結束原因命名、斷線後玩家 ID、開始前關房沒有畫面、錯誤碼沒有畫面文字） |
| S2 | 通過 | 產出 55 個任務、147 項參考，`issues`、`warnings` 皆空；`tasks.md` 沒有出現 `enterAsPlayer`；Notes「待確認 1」說明 B1 在 openapi.yaml 沒有 operation，T025 標「見 Notes 待確認 1」，路徑只沿用 research §5 已寫明的 `POST /api/players`；B1 出現在 Foundational 與 US1 的後端組標題；spec 目錄只新增 `tasks.md` |
| S3 | 通過 | (a) 沒有 plan.md：在 Phase 1 停止並指向 `system-analysis`，檔案雜湊與執行前相同；(b) 回覆「不要覆寫」：停止並回報沒有修改，`tasks.md` 雜湊與執行前相同 |

### 觀察（不影響通過）

- S1、S2 的子代理都因範例很長而分段閱讀範例；產出仍符合樣板結構。
- 1A2B spec package 的上游命名不一致（房間狀態、結束原因）在兩次執行中都被寫成待確認，與 `docs/待確認.md` 已記錄的事項一致。
