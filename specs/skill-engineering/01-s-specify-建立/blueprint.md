# 工程藍圖：s-specify－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/01-s-specify-建立/`
- 根因報告：無（新建模式略過 Phase 2）
- 確認紀錄：使用者於 Phase 4 回覆「同意」：同意推定的 E5～E10（含依課程調整的觸發條件、假設不可偷渡新需求、不覆寫既有目錄），`clarify` 採「委派＋讀取 SKILL.md 備案」，`s-specify` 原訂設 `disable-model-invocation: true`（施工時因 `skill-form-description` Rule 1 不允許，使用者改選不加），FR／NFR 歸屬與 spec 文件規則補入課程 v2.0 的措辭，回報加入是否進入 clarify；`Feature 目錄`、`Clarify 預算`、checklist、`NEEDS CLARIFICATION` 等留待「比較 v1 與 v2」步驟；無刪除項目；同意全部施工工作項

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 產出的 spec.md 固定標題、欄位與段落順序與 `templates/spec.md` 一致；各段落條目數依實際需求增減 | 本次 | 通用 |
| E2 | 每個 User Story 底下依序為 Acceptance Scenarios、Functional Requirements、Non-Functional Requirements（有專屬 NFR 時）；只服務單一 User Story 的 FR／NFR 列在該故事底下 | 本次 | 通用 |
| E3 | Global Requirements 只含無法歸屬單一 User Story、或明確跨越多個 User Story 的 FR／NFR；同一條需求不同時出現在故事底下與全域需求 | 本次 | 通用 |
| E4 | spec.md 保留 Success Criteria（每條 SC 含可量測的數值或比率），涉及資料時保留 Key Entities | 本次 | 通用 |
| E5 | 輸入有會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺口時，先經 `clarify` 向使用者提問，使用者回答前不建立 spec.md；回答後的決策記錄在 Clarifications 並反映到對應 FR | 推定：課程〈改造屬於自己的 SDD 工作流：/specify〉約 28:50，skill-engineering 提出「需求不清楚的時候正確轉交 clarify」，老師表示同意；本 repo 已有 `clarify` | 通用 |
| E6 | 未經使用者確認、由 AI 推斷而寫入 spec 的內容，列在 Assumptions；Assumptions 不引入新的必做需求 | 推定：課程同單元約 7:34 要求「把你的腦補給我打在這個假設這裡面」 | 通用 |
| E7 | FR／NFR 不描述框架、程式語言、資料庫或部署方式等技術實作；輸入含技術偏好時，回報中列出並說明留待技術規劃階段提供 | 推定：本次對話已確認 Docker 等執行環境屬於 plan 階段，不寫進 spec | 通用 |
| E8 | spec.md 寫入 `specs/<NNN>-<short-name>/spec.md`，`<NNN>` 為既有最大三位數編號加一，不覆寫既有目錄；`Feature Branch` 欄位填入目錄名稱，不建立 git 分支 | 推定：Skill 執行時必須決定輸出位置；不建立分支以避免未經要求的副作用 | 通用 |
| E9 | FR、NFR 編號各自在文件內唯一，不要求依閱讀順序連號 | 推定：對齊課程 `aixbdd` v2.0 範例保留原號的做法，也與 `spec.example.md` 一致 | 通用 |
| E10 | spec.md 內文使用繁體中文，樣板的固定標題維持英文原文 | 推定：CLAUDE.md 語言規範要求文件內容使用繁體中文；固定標題由樣板決定 | 通用 |

## 2. To-Be SOP

````markdown
---
name: s-specify
disable-model-invocation: true
description: 使用者要求把功能描述寫成 SDD 規格文件 spec.md 時使用：切分可獨立測試的使用者故事，把 FR／NFR 列管在所屬故事底下，跨故事的才放全域需求，並保留關鍵實體、可量測成果與假設；需求有高影響缺口時會先委派 clarify 訪談使用者。使用者提到 specify、寫規格、spec.md、需求規格、user story、FR／NFR 時使用。只需訪談釐清需求、不產出 spec.md 時改用 clarify；只做技術規劃（技術堆疊、架構、部署方式）時不使用此 Skill。
---

# SOP

## Phase 1 -- 對齊輸入與澄清需求

1. `READ` 使用者的功能描述，以及專案根目錄 `specs/` 下名稱符合 `<三位數編號>-<名稱>` 的目錄清單（以 `ls -d specs/[0-9][0-9][0-9]-*/` 取得；`specs/` 不存在或沒有符合的目錄時清單為空），建立「需求輸入」。
2. `READ` `templates/spec.md` 與 `templates/spec.example.md`，載入骨架與範例，命名載入結果為「spec 樣板組」。
3. `THINK` 依「spec 樣板組」各段落需要的內容，盤點「需求輸入」中會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾與歧義，建立「需求缺口」。
4. `DELEGATE` 「需求缺口」不為空時，委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取 `clarify` 的 `SKILL.md` 並依其 SOP 執行），以「需求缺口」為優先提問面向、不要求詳記問答紀錄，取得已確認決策、使用者補充與剩餘風險，建立「澄清結果」；「需求缺口」為空時略過本步驟。
5. `THINK` 合併「需求輸入」與「澄清結果」，建立「需求決策」；「澄清結果」的剩餘風險與未經使用者確認的推斷，列為「待寫入假設」。

完成條件：「需求決策」已建立，「需求缺口」的每一項都已由使用者在 clarify 中決定或列入「待寫入假設」，且尚未建立 spec.md。

## Phase 2 -- 重建需求骨架

1. `READ` 切分使用者故事時，讀取 `rules/使用者故事-格式規範.md` 的所有 Rule，建立「使用者故事檢查清單」。
2. `THINK` 依「需求決策」與已載入的「使用者故事檢查清單」，切出使用者故事，並為每個故事決定標題、敘述、優先級、優先級理由、獨立測試方式與驗收情境。
3. `READ` 撰寫與歸屬需求時，讀取 `rules/功能與非功能需求-格式規範.md` 的所有 Rule，建立「需求歸屬檢查清單」。
4. `THINK` 依「需求決策」、已切出的使用者故事與已載入的「需求歸屬檢查清單」，寫出 FR 與 NFR，決定每條需求歸屬的使用者故事或全域需求，並編號。
5. `CHECK` 逐條驗證「使用者故事檢查清單」與「需求歸屬檢查清單」；未通過時修正使用者故事或需求。

完成條件：每個使用者故事都有優先級、獨立測試方式與驗收情境，每條 FR／NFR 都已編號並歸屬到一個使用者故事或全域需求，且兩份檢查清單均已通過。

## Phase 3 -- 產出 spec.md 與自檢

1. `THINK` 決定輸出目錄名稱 `<NNN>-<short-name>`：`<NNN>` 為「需求輸入」目錄清單中的最大編號加一，清單為空時為 `001`，不得使用或覆寫既有目錄；`<short-name>` 為 2 至 4 個小寫英文單字以連字號連接的功能簡稱。
2. `READ` 撰寫 spec.md 時，讀取 `rules/spec-文件-格式規範.md` 的所有 Rule，建立「spec 文件檢查清單」。
3. `WRITE` 依「spec 樣板組」與已載入的「spec 文件檢查清單」，以「需求決策」、Phase 2 的使用者故事與需求、「待寫入假設」及「澄清結果」，將 spec.md 寫入專案根目錄 `specs/<NNN>-<short-name>/spec.md`；內文使用繁體中文，`Feature Branch` 填入 `<NNN>-<short-name>`，`Created` 填入執行當日日期，不建立 git 分支。
4. `CHECK` 逐條驗證「spec 文件檢查清單」，並確認 spec.md 的固定結構與「spec 樣板組」一致；未通過時修正 spec.md。
5. `WRITE` 向使用者回報 spec.md 路徑、本次是否進入 clarify、使用者故事與 FR／NFR 數量、全域需求與 Assumptions；「需求輸入」含技術偏好（如框架、資料庫、部署方式）時，一併列出並說明這些內容留待技術規劃階段提供。

完成條件：spec.md 已寫入 `specs/<NNN>-<short-name>/`，「spec 文件檢查清單」已通過，且已向使用者回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `SKILL.md` frontmatter | 新增 | `name: s-specify`、`disable-model-invocation: true` 與第 2 節的 `description` | E1–E5（概述用途與觸發情境） |
| Phase 1 -- 對齊輸入與澄清需求（P1-1～P1-5） | 新增 | 讀取輸入與既有目錄、載入 spec 樣板組、盤點缺口、委派 clarify、合併決策 | E5、E6、E8；C2–C4 |
| Phase 2 -- 重建需求骨架（P2-1～P2-5） | 新增 | 載入兩份 RuleFile、切故事、寫並歸屬需求、驗證 | E2、E3、E7、E9；C5–C12 |
| Phase 3 -- 產出 spec.md 與自檢（P3-1～P3-5） | 新增 | 決定目錄名稱、載入 spec 文件規範、寫入、驗證、回報 | E1、E4、E6–E8、E10；C1、C13–C21 |
| `rules/使用者故事-格式規範.md`（Rule 1～3） | 新增 | 故事切分與獨立測試、優先級、驗收情境 | E2；C5–C7 |
| `rules/功能與非功能需求-格式規範.md`（Rule 1～4） | 新增 | FR／NFR 定義與陳述、歸屬、編號、不含技術實作 | E2、E3、E7、E9；C8–C11 |
| `rules/spec-文件-格式規範.md`（Rule 1～5） | 新增 | 段落增減、Clarifications 記錄、SC 可量測、Assumptions 記錄、內容一致性 | E1、E4、E5、E6；C13–C17 |
| `LICENSE`（`s-specify/` 內） | 新增 | 註明衍生來源：Spec-Kit（MIT，`spec.md` 結構與範例情境）與 `aixbdd`（Apache-2.0，FR／NFR 列管於故事底下的結構、填位符號命名方式），保留兩份原授權全文 | CLAUDE.md 規則 3（專案必要流程） |
| 根目錄 `LICENSE` 授權範圍 | 修改 | 在「不適用上方 MIT 授權」清單加入 `s-specify` 含 Spec-Kit 與 `aixbdd` 衍生內容的說明 | CLAUDE.md 規則 3（專案必要流程） |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `templates/spec.md`（由 `spec.template.md` 改名，內容不變）與 `templates/spec.example.md` | E1–E4、E9、E10 | C1 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 15 | +15 |
| RuleFile | 0 | 3 | +3 |
| Rule | 0 | 12 | +12 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- 新建模式，所有 Phase、步驟與 RuleFile 均為新增，各自追溯如差異表。
- 三份 RuleFile 對應課程示範的三種判斷：使用者故事怎麼切、FR／NFR 怎麼歸類、spec 完整性與一致性。
- 沒有腳本：目錄編號只需列出既有目錄名稱後取最大值加一，P1-1 以既有工具單一命令 `ls -d` 取得清單（約束分配 Rule 2），不另建腳本。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | spec.md 的固定標題、欄位與段落順序 | P3-3 | spec 樣板組 | 約束整份產出檔案的結構；已存在，本次不修改 |
| C2 | 需求缺口的判定範圍：會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾與歧義 | P1-3 | P1-3 步驟內文 | 只屬於本步驟，一句話即可表達；提問排序與題數判準已由 `clarify` 自己的 RuleFile 負責，不需在本 Skill 另建 RuleFile |
| C3 | 有需求缺口時先委派 clarify，無缺口時略過；使用者回答前不建立 spec.md | P1-4 | SOP 流程 | 屬於分支與使用者確認（clarify 的提問閘門） |
| C4 | 剩餘風險與未經使用者確認的推斷列為「待寫入假設」 | P1-5 | P1-5 步驟內文 | 只屬於本步驟，一句話即可表達 |
| C5 | 每個使用者故事從使用者角度描述一個可獨立交付的價值單位，只實作該故事仍可展示與驗證，並以 Independent Test 說明驗證方式 | P2-2 | `rules/使用者故事-格式規範.md` Rule 1 | 需要判斷故事邊界，需要正反例；腳本與樣板都無法判斷 |
| C6 | 優先級依商業價值與交付順序排列（P1 最高），並寫出理由 | P2-2 | `rules/使用者故事-格式規範.md` Rule 2 | 需要判斷價值與相依，需要正反例 |
| C7 | 驗收情境以 Given／When／Then 撰寫，每條驗證一個可觀察結果，涵蓋主要成功路徑與至少一個例外或邊界 | P2-2 | `rules/使用者故事-格式規範.md` Rule 3 | 樣板只固定 Given／When／Then 句型，無法判斷內容是否可觀察；需要正反例 |
| C8 | FR 描述系統必須提供的功能，NFR 描述系統運作時須滿足的限制或品質；兩者以「必須 (MUST)」陳述且可驗證 | P2-4 | `rules/功能與非功能需求-格式規範.md` Rule 1 | 需要判斷功能與品質的分界，需要正反例 |
| C9 | 只服務單一使用者故事的需求放該故事底下；被多個故事間接使用、但主要服務其中一個故事的需求歸到該故事；只有無法歸屬單一故事或明確約束多個故事的需求放全域需求，全域需求是例外而非預設集散地；每條需求只出現一次 | P2-4 | `rules/功能與非功能需求-格式規範.md` Rule 2 | 需要判斷需求服務哪些故事，需要正反例 |
| C10 | FR-###、NFR-### 各自在文件內唯一，不要求依閱讀順序連號 | P2-4 | `rules/功能與非功能需求-格式規範.md` Rule 3 | 持續適用於編號與引用（Clarifications 引用同一組編號），需要正反例說明「不重排」；與歸屬同屬 FR／NFR 主題 |
| C11 | 需求不得描述框架、程式語言、資料庫或部署方式等技術實作 | P2-4 | `rules/功能與非功能需求-格式規範.md` Rule 4 | 需要判斷「做什麼」與「怎麼做」的分界，需要正反例 |
| C12 | Phase 2 兩份檢查清單逐條驗證後才進入 Phase 3 | P2-5 | SOP 流程 | 屬於 Phase 轉移 |
| C13 | 段落與條目依實際內容增減：沒有專屬 NFR 的故事省略該小節，不留下空殼小節；全域沒有 FR 或 NFR 時省略對應小節，兩者都沒有時省略整個 Global Requirements；沒有進行澄清時省略 Clarifications；不涉及資料時省略 Key Entities | P3-3 | `rules/spec-文件-格式規範.md` Rule 1 | 樣板依規範不放說明文字，只能呈現一種條目數量；增減與省略需要判斷，需要正反例 |
| C14 | Clarifications 每條 `Q → A` 對應「澄清結果」的一項已確認決策，括號標註受影響的需求編號；Session 為進行澄清的日期 | P3-3 | `rules/spec-文件-格式規範.md` Rule 2 | 需要判斷決策與需求的對應，需要正反例 |
| C15 | 每條 Success Criteria 以數值或比率表達，且不提及技術實作 | P3-3 | `rules/spec-文件-格式規範.md` Rule 3 | 需要判斷是否可量測，需要正反例 |
| C16 | 「待寫入假設」每項寫成一條 Assumption，並寫出採用的預設內容；Assumption 不引入新的必做需求，拿掉後會改變必備行為的內容應寫成需求 | P3-3 | `rules/spec-文件-格式規範.md` Rule 4 | 需要判斷預設內容是否寫清楚，需要正反例 |
| C17 | 澄清決策反映在對應 FR；驗收情境與 Edge Cases 不得與 FR 矛盾 | P3-3 | `rules/spec-文件-格式規範.md` Rule 5 | 需要判斷語意一致，需要正反例 |
| C18 | 內文使用繁體中文 | P3-3 | P3-3 步驟內文 | 只屬於本步驟，一句話即可表達；固定標題的語言已由樣板決定（C1） |
| C19 | 輸出目錄 `<NNN>-<short-name>` 的編號與命名方式，不使用或覆寫既有目錄 | P3-1 | P3-1 步驟內文 | 只屬於本步驟，一句話即可表達；編號為列出目錄後取最大值加一，不需腳本 |
| C20 | `Feature Branch` 填入目錄名稱、`Created` 填入執行當日，不建立 git 分支 | P3-3 | P3-3 步驟內文 | 只屬於本步驟，一句話即可表達 |
| C21 | 回報內容，以及技術偏好留待技術規劃階段的提示 | P3-5 | P3-5 步驟內文 | 只屬於本步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/s-specify/SKILL.md` frontmatter | 建立 `name` 與 `description` | — | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/s-specify/SKILL.md` 的 `# SOP` | 寫入胖 SOP | C2–C21 | 已完成 |
| 3 | W3 | `skill-derive-rule` | Phase 3 -- 產出 spec.md 與自檢的 `WRITE` 寫入 spec.md 步驟 | 抽出 `rules/spec-文件-格式規範.md`，並新增載入步驟、改寫驗證步驟 | C13–C17 | 已完成 |
| 4 | W4 | `skill-derive-rule` | Phase 2 -- 重建需求骨架的 `THINK` 寫出 FR 與 NFR 步驟 | 抽出 `rules/功能與非功能需求-格式規範.md`，並新增載入步驟、改寫驗證步驟 | C8–C11 | 已完成 |
| 5 | W5 | `skill-derive-rule` | Phase 2 -- 重建需求骨架的 `THINK` 切出使用者故事步驟 | 抽出 `rules/使用者故事-格式規範.md`，並新增載入步驟、改寫驗證步驟 | C5–C7 | 已完成 |
| 6 | W6 | `skill-engineering` 直接執行（專案規則） | `.agents/skills/s-specify/LICENSE` 與根目錄 `LICENSE` | 依 CLAUDE.md 規則 3 補授權來源 | — | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: s-specify`
- `disable-model-invocation: true`（比照課程，由使用者明確輸入 `/s-specify` 才啟動）
- `description`：使用第 2 節 To-Be SOP 的 `description` 原文（已含與 `clarify` 的分流）。

#### W2：胖 SOP

寫入下列胖 SOP。Phase 1 與第 2 節 To-Be SOP 相同；Phase 2、Phase 3 尚未有 RuleFile，待抽取的約束先寫在所屬步驟內文。

````markdown
# SOP

## Phase 1 -- 對齊輸入與澄清需求

（與第 2 節 To-Be SOP 的 Phase 1 相同，含完成條件。）

## Phase 2 -- 重建需求骨架

1. `THINK` 依「需求決策」切出使用者故事，並為每個故事決定標題、敘述、優先級、優先級理由、獨立測試方式與驗收情境；每個使用者故事必須從使用者角度描述一個可獨立交付的價值單位，只實作該故事時仍可展示與驗證，並以 Independent Test 說明驗證方式；優先級依商業價值與交付順序排列（P1 最高），並寫出理由；驗收情境以 Given／When／Then 撰寫，每條驗證一個可觀察結果，涵蓋主要成功路徑與至少一個例外或邊界情況。
2. `THINK` 依「需求決策」與已切出的使用者故事，寫出 FR 與 NFR，決定每條需求歸屬的使用者故事或全域需求，並編號；FR 描述系統必須提供的功能，NFR 描述系統運作時須滿足的限制或品質，兩者都以「必須 (MUST)」陳述且可驗證；只服務單一使用者故事的需求放在該故事底下，被多個故事間接使用、但主要服務其中一個故事的需求歸到該故事，只有無法歸屬單一故事或明確約束多個故事的需求放在全域需求，全域需求是例外而非預設集散地，每條需求只出現一次；FR-###、NFR-### 各自在文件內唯一，不要求依閱讀順序連號；需求不得描述框架、程式語言、資料庫或部署方式等技術實作。
3. `CHECK` 確認使用者故事與需求符合上述兩個步驟的要求；未通過時修正使用者故事或需求。

完成條件：每個使用者故事都有優先級、獨立測試方式與驗收情境，每條 FR／NFR 都已編號並歸屬到一個使用者故事或全域需求，且已通過驗證。

## Phase 3 -- 產出 spec.md 與自檢

1. `THINK` （與第 2 節 To-Be SOP 的 P3-1 相同。）
2. `WRITE` 依「spec 樣板組」，以「需求決策」、Phase 2 的使用者故事與需求、「待寫入假設」及「澄清結果」，將 spec.md 寫入專案根目錄 `specs/<NNN>-<short-name>/spec.md`；內文使用繁體中文，`Feature Branch` 填入 `<NNN>-<short-name>`，`Created` 填入執行當日日期，不建立 git 分支；段落與條目依實際內容增減，沒有專屬 NFR 的故事省略該小節而不留下空殼，全域沒有 FR 或 NFR 時省略對應小節，兩者都沒有時省略整個 Global Requirements，沒有進行澄清時省略 Clarifications，不涉及資料時省略 Key Entities；Clarifications 每條 `Q → A` 對應「澄清結果」的一項已確認決策，括號標註受影響的需求編號，Session 為進行澄清的日期；每條 Success Criteria 以數值或比率表達且不提及技術實作；「待寫入假設」每項寫成一條 Assumption，並寫出採用的預設內容，Assumption 不引入新的必做需求；澄清決策必須反映在對應 FR，驗收情境與 Edge Cases 不得與 FR 矛盾。
3. `CHECK` 確認 spec.md 符合上一步的要求，且固定結構與「spec 樣板組」一致；未通過時修正 spec.md。
4. `WRITE` （與第 2 節 To-Be SOP 的 P3-5 相同。）

完成條件：spec.md 已寫入 `specs/<NNN>-<short-name>/`，已通過驗證，且已向使用者回報。
````

#### W3：抽出 `rules/spec-文件-格式規範.md`

- 目標步驟：Phase 3 -- 產出 spec.md 與自檢的 `WRITE` 寫入 spec.md 步驟（內文含「段落與條目依實際內容增減」）。
- Rule 1（C13）：段落與條目依實際內容增減與省略的條件。Good Example：一個沒有專屬 NFR 的故事只有 Acceptance Scenarios 與 Functional Requirements；Bad Example：保留空的 Non-Functional Requirements 小節或填「無」。
- Rule 2（C14）：Clarifications 的 `Q → A` 對應已確認決策並標註需求編號。
- Rule 3（C15）：Success Criteria 以數值或比率表達且技術中立。
- Rule 4（C16）：Assumptions 收錄待寫入假設並寫出預設內容；不引入新的必做需求。Bad Example：「系統必須支援 AI 自動產生分類名稱」寫在 Assumptions。
- Rule 5（C17）：澄清決策、FR、驗收情境與 Edge Cases 一致。
- After：P3-2 新增 `READ` 載入步驟，命名「spec 文件檢查清單」；寫入步驟改為依「spec 樣板組」與「spec 文件檢查清單」寫入，只保留 C18、C20 與輸出路徑；驗證步驟改為逐條驗證「spec 文件檢查清單」並確認固定結構；Phase 3 完成條件改為「spec 文件檢查清單」已通過。結果需與第 2 節 To-Be SOP 的 Phase 3 一致。

#### W4：抽出 `rules/功能與非功能需求-格式規範.md`

- 目標步驟：Phase 2 -- 重建需求骨架的 `THINK` 寫出 FR 與 NFR 步驟（內文含「決定每條需求歸屬的使用者故事或全域需求」）。
- Rule 1（C8）：FR 與 NFR 的分界，以「必須 (MUST)」陳述且可驗證。
- Rule 2（C9）：歸屬故事或全域需求，主要服務單一故事的需求歸該故事，全域需求是例外，每條只出現一次。Good Example 可引用照片相簿情境中「持久化保存分組、歸屬與排序」同時服務兩個故事而放全域。
- Rule 3（C10）：編號唯一、不重排、不要求連號。
- Rule 4（C11）：不描述技術實作。Bad Example：「系統必須 (MUST) 以 Docker Compose 啟動 MySQL 保存相簿資料」。
- After：在該步驟前新增 `READ` 載入步驟，命名「需求歸屬檢查清單」；該步驟改為依「需求歸屬檢查清單」寫出與歸屬需求；Phase 2 的 `CHECK` 改為逐條驗證「需求歸屬檢查清單」（與 W5 完成後的「使用者故事檢查清單」合併為同一個 `CHECK`）。結果需與第 2 節 To-Be SOP 的 Phase 2 一致。

#### W5：抽出 `rules/使用者故事-格式規範.md`

- 目標步驟：Phase 2 -- 重建需求骨架的 `THINK` 切出使用者故事步驟（內文含「切出使用者故事」）。
- Rule 1（C5）：故事為可獨立交付、可獨立測試的價值單位，並以 Independent Test 說明驗證方式。
- Rule 2（C6）：優先級依商業價值與交付順序排列並寫出理由。
- Rule 3（C7）：驗收情境 Given／When／Then，每條一個可觀察結果，涵蓋主要成功路徑與至少一個例外或邊界。
- After：在該步驟前新增 `READ` 載入步驟，命名「使用者故事檢查清單」；該步驟改為依「使用者故事檢查清單」切出故事；Phase 2 的 `CHECK` 改為逐條驗證「使用者故事檢查清單」與「需求歸屬檢查清單」；Phase 2 完成條件改為兩份檢查清單均已通過。結果需與第 2 節 To-Be SOP 的 Phase 2 一致。

#### W6：授權

- 新增 `.agents/skills/s-specify/LICENSE`：說明本 Skill 含兩個來源的衍生內容，並保留原授權全文：
  - Spec-Kit（https://github.com/github/spec-kit ，MIT，Copyright GitHub, Inc.）：spec.md 的段落結構與照片相簿範例情境。
  - AI x BDD（https://github.com/Waterball-Software-Academy/aixbdd ，Apache-2.0）：FR／NFR 列管於使用者故事底下、全域需求判準與填位符號命名方式。
- 修改根目錄 `LICENSE` 的「授權範圍」：在不適用 MIT 的清單加入一項，說明 `s-specify` 含上述兩個來源的衍生內容，見該目錄的 LICENSE。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E4、E6、E7、E8、E9、E10 | 本次 | 「做一個個人記帳網頁：可以新增收支紀錄（金額、分類、日期、備註），首頁依月份顯示當月收支總額與各分類佔比，可以替每個分類設定每月預算，超過預算時提醒我。後端用 Node.js，資料庫用 MySQL 跑在 Docker 裡。」；測試環境的 `specs/` 已有 `001-photo-album-organizer/` | 若出現 clarify 提問，回覆「全部採用推薦選項」 | 新檔位於 `specs/002-<short-name>/spec.md`；固定標題與段落順序同骨架；每個故事有 Acceptance Scenarios 與 FR；全域需求的每條都能指出服務多個故事或無法歸屬單一故事，且未在故事底下重複；每條 SC 含數值或比率；FR／NFR 不含 Node.js、MySQL、Docker，回報中列出這三項並說明留待技術規劃；`Feature Branch` 等於目錄名稱，`git branch` 前後一致；FR／NFR 編號不重複；內文為繁體中文；AI 自行補的預設出現在 Assumptions |
| S2 | E1、E5 | 本次 | 「我想做一個線上 1A2B 猜數字對戰遊戲。」 | 每一輪 clarify 提問都回覆「全部採用推薦選項」 | 第一輪提問展示時，`specs/` 下尚未出現新目錄；回答後產出的 spec.md 有 Clarifications，每條 `Q → A` 對應一個已回答的問題並標註需求編號，且答案內容可在對應 FR 中找到；固定結構同骨架 |

## 8. 驗收結果

尚未完成施工。

施工差異（W1，`skill-form-description` 回報，施工已停止，W1～W6 均維持「待施工」）：

1. `rules/Skill描述-格式規範.md` Rule 1 只允許 `name`、`description`、`license`、`allowed-tools`、`metadata`、`compatibility` 欄位；藍圖 W1 要求的 `disable-model-invocation: true` 不在允許範圍。
2. `rules/Skill描述-格式規範.md` Rule 3 要求與範圍重疊的 Skill 劃出邊界；藍圖的 `description` 沒有說明與 `clarify`（同樣處理需求缺口訪談）的分流條件。

處理：使用者回覆「A」（Phase 3 修正後再次確認）：不加 `disable-model-invocation`，維持標準欄位；`description` 改為要求明確產出 spec.md 時觸發，並補上與 `clarify` 的分流。已更新第 2 節與 W1，從 W1 重新施工。

施工後結構診斷（W1～W6 已完成）：`audit_skill.py` 回報 `s-specify` 2 個 error、0 個 warning，均為 `TPL001`：樣板組命名不成對。`skill-form-template` Rule 1 要求骨架為 `templates/<樣板名字>.md`、範例為 `templates/<樣板名字>.example.md`；目前骨架 `spec.template.md` 的樣板名字是 `spec.template`，範例 `spec.example.md` 的樣板名字是 `spec`，兩者不成對。此命名來自先前 `/skill-form-template` 依使用者指定寫成 `spec.template.md`，當時的 Rule 1 檢查誤判為通過。處理：
- 使用者決定讓 `skill-form-description` 與課程一致：另以 `specs/skill-engineering/02-skill-form-description-允許disable-model-invocation欄位/` 完成優化，Rule 1 與 `audit_skill.py` 均允許 `disable-model-invocation`；本藍圖的 frontmatter 改回加入 `disable-model-invocation: true`（W1 重新施工）。
- 使用者選擇 A：骨架 `spec.template.md` 改名為 `spec.md`（內容不變），符合 `skill-form-template` Rule 1；已同步更新 P1-2、`LICENSE` 與本藍圖的路徑。

驗收結果（施工完成後）：

- 施工後結構診斷：`s-specify` 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；`.claude/skills/s-specify/templates/` 只剩 `spec.md` 與 `spec.example.md`；沒有只存在於目標端的 Skill。
- 一致性：`SKILL.md` 與第 2 節 To-Be 逐字相同；C1～C21 各只存放在約束分配表指定的位置。
- S1 通過（子代理於暫存專案複本實跑）：產出 `specs/002-personal-expense-tracker/spec.md`；固定標題與段落順序同骨架、無殘留填位符號；4 個故事皆有驗收情境與 FR；全域需求 FR-015～FR-017、NFR-003 均跨多個故事；5 條 SC 皆含數值；FR／NFR／SC 不含 Node.js、MySQL、Docker，回報中列出並說明留待技術規劃；`Feature Branch` 等於目錄名稱，`git branch` 前後皆只有 `main`；編號無重複；內文為繁體中文；AI 推斷的預設（佔比範圍、幣別、預設分類等）列在 Assumptions。
- S2 通過（子代理於暫存專案複本實跑）：clarify 兩輪共 5 題，兩輪提問當下 `specs/` 都沒有新目錄；產出 `specs/002-guess-number-duel/spec.md`，Clarifications 5 條 `Q → A` 均標註需求編號，答案內容反映在 FR-001、FR-002、FR-004～FR-007；固定結構同骨架。
- 執行觀察（不影響驗收結論）：S1 子代理在 clarify 之前就先讀了 Phase 2 的兩份 RuleFile，順序早於 SOP，產出不受影響；S2 中 AI 推斷的數值（暱稱 1 至 12 字元、斷線寬限 60 秒）同時寫在 FR 內文與 Assumptions，現行規則允許，若希望 FR 只放已確認內容，可另行收緊 `rules/spec-文件-格式規範.md` Rule 4。
