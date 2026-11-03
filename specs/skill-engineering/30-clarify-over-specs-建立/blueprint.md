# 工程藍圖：clarify-over-specs－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/30-clarify-over-specs-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「確認」（2026-11-03）：接受推定的 E14–E18（皆為通用），確認藍圖其餘內容。
- 施工差異（2026-11-03，Phase 5 結構診斷後）：`audit_skill.py` 把 P2-5 的 `rules/…`、`templates/…` 判為本 Skill 不存在的部位（REF001）。依 Phase 5 步驟 6 修正為 `../s-specify/…` 相對路徑（比照 `skill-form-rule` 引用 `../skill-form-sop/`），並刪除 `.agents`／`.claude` 的改讀分支（兩邊同步，相對路徑已指向同一側）。行為與驗收條件不變。
- 前置決策（2026-11-03，使用者以 clarify 回覆「都照建議」，建議依據為 wsa-course 第三章〈【基因工程】把 clarify 需求訪談基礎 Skill 的基因提煉出來！〉）：
  1. 修改 `clarify` 題數上限的 3 處（Rule 3、SKILL.md 兩個步驟），另補 description；`clarify/LICENSE` 改寫為「已修改」並列出修改處；根目錄 `LICENSE` 註明 clarify 含本 repo 的修改；`AGENTS.md`／`CLAUDE.md` 規則 2 加上 clarify 題數的例外。
  2. 每題在 `Context` 第一行標出分類（課程 21:07–22:06）；結束時回報分類狀態表；提問前不展示掃描結果表。
  3. 答案不影響任何 FR／NFR 時，`Q → A` 改標受影響的 SC 編號或段落名稱，列為 s-specify `spec-文件-格式規範` Rule 2 的例外；s-specify 的規則檔不修改。
  4. 未指定 spec 時自動選 `specs/` 下編號最大的 spec 目錄，使用者可明確指定（課程 11:21–12:25）。
- 目標位置：`.agents/skills/clarify-over-specs/`，完成後以 `scripts/sync-skills.sh --from agents` 同步到 `.claude/skills/`。
- 參考基因：`.spec-kit/claude-skills/speckit-clarify/SKILL.md`（使用者明確要求參考）。

### speckit-clarify 取捨

| # | speckit-clarify 內容 | 處理 | 對應 |
| - | -------------------- | ---- | ---- |
| K1 | 10 類 taxonomy 掃描，每類 Clear／Partial／Missing | 保留，分類名稱譯為繁中並附英文原名；掃描整份 spec，含 s-specify 的（推定）項目 | E1 |
| K2 | Impact × Uncertainty 排序、高影響類別優先 | 保留 | E2 |
| K3 | 實作方法、技術選型、任務拆解不提問，記為 Deferred | 保留 | E3 |
| K4 | 每個答案寫回最適合段落，`## Clarifications`／`### Session` 記錄 Q → A | 保留，段落對照改為 s-specify 的 spec 結構；改為每輪寫回 | E4 |
| K5 | 取代矛盾舊敘述、統一術語 | 保留，另處理 s-specify 的（推定）標記 | E5 |
| K6 | 每次寫入後驗證 | 保留，改用 s-specify 的格式規則 | E6 |
| K7 | 完成回報與 Resolved／Deferred／Clear／Outstanding 狀態表 | 保留 | E7 |
| K8 | 題數上限 5 | 改寫：由使用者指定，預設 5 | E8 |
| D1 | 一次只問一題 | 刪除：由 clarify 每輪 1–3 題 | 使用者排除 |
| D2 | 推薦答案、限制回答形式、問題寫作品質 | 刪除：clarify 已有 | 使用者排除、E10 |
| D3 | 載入 constitution | 刪除：憲法留待第三章第 18 單元 | 使用者排除 |
| D4 | Extension hooks、`check-prerequisites.sh` | 刪除：本專案沒有 `.specify/` | E13 |
| D5 | `checklists/requirements.md` 回刷 | 刪除：改用 s-specify 格式規則，不新增 checklist 檔 | E6 |

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 以 10 類分類表掃描整份 spec.md（不只看 `NEEDS CLARIFICATION` 標記）；完成回報的分類狀態表 10 類各一列 | 本次 | 通用 |
| E2 | 提問依「影響 × 不確定性」排序：會改變使用者故事、核心流程、資料模型或驗收標準的缺口，比只影響措辭或低影響細節的缺口先問 | 本次 | 通用 |
| E3 | 實作方法、技術選型、任務拆解類問題不提問，在完成回報列為 Deferred 並寫理由 | 本次 | 通用 |
| E4 | 每輪答案寫回 spec.md 最適合的段落並存檔；`## Clarifications` 當日 `### Session` 下每個已回答問題恰有一條 `Q → A`，括號標註受影響的 FR／NFR，沒有時標 SC 編號或段落名稱 | 本次 | 通用 |
| E5 | 被答案推翻的舊敘述不再留在 spec.md；同一概念全份使用同一術語；被使用者確認的（推定）項目更新標記 | 本次 | 通用 |
| E6 | 每次寫入後依 s-specify 的 3 份 RuleFile 與 spec 樣板組驗證；只修改目標 spec.md，不建立 checklist 檔或其他檔案 | 本次 | 通用 |
| E7 | 完成回報含已提問與已回答題數、spec.md 路徑、修改的段落、分類狀態表（狀態只用 Resolved、Deferred、Clear、Outstanding）、Outstanding 與 Deferred 項目 | 本次 | 通用 |
| E8 | 使用者指定 N 題時最多問 N 題，未指定時最多問 5 題 | 本次 | 通用 |
| E9 | 每一題的 `Context` 第一行為「分類：<10 類之一>」 | 本次 | 通用 |
| E10 | 問答由 clarify 執行，題目為 clarify 的格式（Context、總結之提問、Options 表、推薦選項、Others），clarify-over-specs 不另定義問答格式 | 本次 | 通用 |
| E11 | clarify 的 session 題數上限：呼叫者有指定時依呼叫者，沒指定時最多 5 題；單輪最多 3 題不變 | 本次 | 通用 |
| E12 | s-specify 完成回報的下一步提示可選擇執行 `clarify-over-specs` | 本次 | 通用 |
| E13 | 未指定 spec 時選 `specs/` 下編號最大、含 spec.md 的目錄；使用者指定時用指定的 spec | 本次 | 通用 |
| E14 | 找不到目標 spec.md 時，提示先執行 `s-specify` 並停止，不建立或修改任何檔案。推定理由：speckit-clarify 有同樣分支，Skill 執行時必須決定 | 推定 | 通用 |
| E15 | 掃描後沒有值得提問的缺口時，不提問、不修改 spec.md，回報分類狀態表。推定理由：speckit-clarify 的「No critical ambiguities」分支 | 推定 | 通用 |
| E16 | 對已有 `## Clarifications` 的 spec 再次執行時，不重問已回答的問題，新紀錄加在當日 Session，舊 Session 保留。推定理由：課程說可視情況多輪執行，必須決定重跑行為 | 推定 | 通用 |
| E17 | 使用者表示結束提問時立即停止提問；已回答的決策已寫回，尚未提問的缺口列為 Deferred 或 Outstanding。推定理由：speckit-clarify 尊重提前結束，必須決定未問項目的狀態 | 推定 | 通用 |
| E18 | frontmatter 不設 `disable-model-invocation`，使用者輸入 `/clarify-over-specs` 或文字「執行 clarify-over-specs」都能啟動。推定理由：課程以文字觸發；`docs/待確認.md` 第 8 項記錄 `disable-model-invocation: true` 會擋下 Skill 工具 | 推定 | 通用 |

## 2. To-Be SOP

````markdown
---
name: clarify-over-specs
description: （未驗證）s-specify 產出 spec.md 之後，要對整份規格做多面向需求澄清時使用的可選步驟：以 10 類分類表找出整份 spec.md 的缺漏、矛盾與歧義，依影響與不確定性排序，委派 clarify 向使用者提問並在每題標出分類，把答案寫回 spec.md 最適合的段落與 Clarifications，取代矛盾敘述並統一術語，最後回報每個分類的狀態與尚未解決的項目。題數可由使用者指定，預設 5 題；實作方法與技術選型留到技術規劃。使用者提到 clarify-over-specs、澄清規格、spec 澄清、需求澄清、掃描 spec 缺口時使用。還沒有 spec.md 時改用 s-specify；只需訪談釐清需求、不寫回 spec.md 時改用 clarify；做技術選型改用 technical-research。
---

# SOP

## Phase 1 -- 定位 spec 與掃描缺口

1. `READ` 使用者輸入（可指定 spec 目錄或 spec.md 路徑、本次題數與優先面向），以及專案根目錄 `specs/` 下名稱符合 `<三位數編號>-<名稱>` 且含 `spec.md` 的目錄清單，建立「澄清輸入」。
2. `THINK` 依「澄清輸入」決定「目標 spec」與「本次題數」：使用者指定路徑時以該路徑的 spec.md 為目標，未指定時取清單中編號最大之目錄的 spec.md；使用者指定正整數題數時以該數為「本次題數」，未指定時為 5。
3. `CHECK` 「目標 spec」不存在時，回覆使用者先執行 `s-specify` 產出 spec.md，並停止執行，不建立或修改任何檔案。
4. `READ` 「目標 spec」全文，建立「spec 現況」。
5. `READ` 掃描缺口時，讀取 `rules/spec-缺口掃描-格式規範.md` 的所有 Rule，建立「缺口掃描檢查清單」。
6. `THINK` 依已載入的「缺口掃描檢查清單」掃描「spec 現況」，為每個分類標出初始狀態，列出候選缺口及其分類與所在位置，標出 Deferred 項目，排序後建立「提問佇列」與「覆蓋地圖」；使用者指定優先面向時，影響相同的缺口中優先排入該面向。
7. `CHECK` 「提問佇列」為空時進入 Phase 3，不委派 `clarify`，也不修改「目標 spec」；不為空時進入 Phase 2。

完成條件：已決定「目標 spec」與「本次題數」，「覆蓋地圖」已標出每個分類的初始狀態，「提問佇列」已排序；或找不到 spec.md，已停止執行。

## Phase 2 -- 委派提問並寫回 spec

1. `DELEGATE` 讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`；以「提問佇列」最前面、尚未提問的最多 3 項為優先提問面向，題數上限為 3 與剩餘題數（「本次題數」減已提問題數）中較小者，要求每題 `Context` 第一行寫「分類：<分類名稱>」，不要求詳記問答紀錄；取得本輪已確認的決策、使用者補充，以及使用者是否表示結束提問，建立「本輪澄清結果」，並累計已提問題數。
2. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、未修改「目標 spec」，並停止執行；使用者未回覆時停止執行，等待回覆。
3. `READ` 第一次寫回時，讀取 `rules/spec-寫回-格式規範.md` 的所有 Rule，建立「寫回檢查清單」。
4. `WRITE` 依已載入的「寫回檢查清單」，將「本輪澄清結果」的每項決策寫入「目標 spec」並存檔；只修改「目標 spec」，不建立其他檔案。
5. `READ` 第一次驗證時，讀取 `../s-specify/rules/spec-文件-格式規範.md`、`../s-specify/rules/使用者故事-格式規範.md`、`../s-specify/rules/功能與非功能需求-格式規範.md` 的所有 Rule，以及 `../s-specify/templates/spec.md` 與 `../s-specify/templates/spec.example.md`，建立「spec 格式檢查清單」；這些檔案不存在時，將「找不到 s-specify，未做 spec 格式驗證」記為「未驗證原因」。
6. `CHECK` 逐條驗證「寫回檢查清單」與「spec 格式檢查清單」，並比對「目標 spec」與 spec 樣板的段落順序及條目格式；兩份清單衝突時以「寫回檢查清單」為準；未通過時修正「目標 spec」後重新驗證，最多 3 輪，第 3 輪仍未通過時，將未通過的 Rule 與位置記為「未通過項」。
7. `THINK` 依寫回後的「目標 spec」更新「提問佇列」與「覆蓋地圖」：移除已解決的缺口，將答案引出的新缺口依「缺口掃描檢查清單」排入。
8. `CHECK` 剩餘題數大於 0、「提問佇列」仍有尚未提問的項目，且使用者沒有表示結束提問時，返回步驟 1；否則進入 Phase 3。

完成條件：每輪已確認的決策都已寫回「目標 spec」並通過驗證或記為「未通過項」，已提問題數不超過「本次題數」，且已停止提問。

## Phase 3 -- 回報澄清結果

1. `THINK` 依「缺口掃描檢查清單」判定每個分類的最終狀態，列出狀態為 Outstanding 與 Deferred 的項目及理由，建立「分類狀態摘要」。
2. `WRITE` 向使用者回報：已提問與已回答的題數、「目標 spec」路徑、本次修改的段落名稱、「分類狀態摘要」的分類狀態表（每個分類一列）、Outstanding 與 Deferred 項目、「未通過項」與「未驗證原因」；最後給出下一步：有「未通過項」時建議先處理；有高影響的 Outstanding 或 Deferred 時，建議再執行一次 `clarify-over-specs`，或留到技術規劃處理；其他情況建議進入 `technical-research`。

完成條件：已向使用者回報每個分類的最終狀態與尚未解決的項目。
````

To-Be RuleFile 概要（由 W5、W6 抽取，內容以約束分配表為準）：

- `rules/spec-缺口掃描-格式規範.md`
  - Rule 1：以 10 類分類表掃描整份 spec，每類標 Clear／Partial／Missing。10 類為：功能範圍與行為（Functional Scope & Behavior）、領域與資料模型（Domain & Data Model）、互動與 UX 流程（Interaction & UX Flow）、非功能品質屬性（Non-Functional Quality Attributes）、整合與外部依賴（Integration & External Dependencies）、邊界情境與錯誤處理（Edge Cases & Failure Handling）、限制與取捨（Constraints & Tradeoffs）、術語與一致性（Terminology & Consistency）、完成訊號（Completion Signals）、雜項與佔位（Misc / Placeholders），各附 speckit 的子項目。掃描範圍是整份 spec，含 `NEEDS CLARIFICATION` 以外的模糊形容詞、（推定）需求與 Assumptions。
  - Rule 2：實作方法、技術選型、任務拆解類缺口不提問，記為 Deferred 並寫理由；只有不決定就無法釐清功能時才例外。
  - Rule 3：依「影響 × 不確定性」排序；高影響且未解決的分類，優先於兩個低影響缺口；答案不會改變需求、驗收或使用者體驗的缺口不列入。
  - Rule 4：`## Clarifications` 已回答過的問題不再提問。
  - Rule 5：最終狀態判定：Resolved（原為 Partial／Missing，本次已解決）、Deferred（超過題數、使用者結束或屬實作類）、Clear（原本已足夠）、Outstanding（仍為 Partial／Missing 但影響低）。
- `rules/spec-寫回-格式規範.md`
  - Rule 1：依決策類型寫回 s-specify spec 最適合的段落：功能→所屬故事或全域的 FR；角色或流程→使用者故事敘述與驗收情境；資料→Key Entities；非功能→NFR，並把模糊形容詞改成 Success Criteria 的可量測門檻；邊界或錯誤→Edge Cases；範圍排除→Out of Scope（使用者決定）。
  - Rule 2：新答案取代矛盾的舊敘述，不並列；被確認的（推定）需求從 Assumptions 移除推定引用，被確認的推定排除項改標「使用者決定」。
  - Rule 3：同一概念全份 spec 使用同一術語；需要保留舊稱時，只在第一次出現處加一次「（原稱「X」）」。
  - Rule 4：`## Clarifications` 位置依 s-specify 樣板；當日 `### Session YYYY-MM-DD` 不存在時新增，存在時接在後面；每個已回答問題恰一條 `- Q: <問題> (<標註>) → A: <最終答案>`；標註優先用受影響的 FR／NFR 編號，沒有時用 SC 編號或段落名稱，這是 s-specify `spec-文件-格式規範` Rule 2 的例外。

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `clarify-over-specs/SKILL.md` frontmatter | 新增 | 見 To-Be | E1–E10、E18 |
| `clarify-over-specs` Phase 1（7 步驟） | 新增 | 定位 spec、掃描、排序 | E1–E3、E8、E13–E16 |
| `clarify-over-specs` Phase 2（8 步驟） | 新增 | 委派 clarify、寫回、驗證、續問 | E4–E6、E8–E10、E17 |
| `clarify-over-specs` Phase 3（2 步驟） | 新增 | 分類狀態判定與回報 | E7 |
| `rules/spec-缺口掃描-格式規範.md`（5 Rule） | 新增 | C13–C17 | E1–E3、E7、E16、E17 |
| `rules/spec-寫回-格式規範.md`（4 Rule） | 新增 | C18–C21 | E4、E5 |
| `clarify-over-specs/LICENSE` | 新增 | 註明 speckit-clarify 衍生內容並保留 MIT 全文 | CLAUDE.md 規則 3 |
| `clarify/rules/盤點高影響需求缺口與提問排序判準.md` Rule 3 | 修改 | session 題數上限改為依呼叫者，未指定時 5 題 | E11；C22 |
| `clarify/SKILL.md` Phase 1 步驟 2、Phase 3 步驟 3 | 修改 | 「5 題」改為引用 Rule 3 的題數上限 | E11；C22 |
| `clarify/SKILL.md` description | 修改 | 呼叫者可指定的項目加入「題數上限」 | E11 |
| `clarify/LICENSE` 開頭說明 | 修改 | 「原樣複製、未修改」改為列出修改處 | 前置決策 1 |
| `s-specify/SKILL.md` Phase 3 步驟 5 | 修改 | 下一步加入可選擇執行 `clarify-over-specs` | E12；C23 |
| 根目錄 `LICENSE` 授權範圍 | 修改 | clarify 條目註明已修改；新增 clarify-over-specs 條目 | 前置決策 1、CLAUDE.md 規則 3 |
| `AGENTS.md` 規則 2（同步到 `CLAUDE.md`） | 修改 | 加上 clarify 題數修改的例外與重新複製後要再套用 | 前置決策 1 |
| `docs/待確認.md` | 新增一項 | clarify-over-specs 的憲法相關能力，留待第三章第 18 單元 | 使用者「憲法先不處理」、CLAUDE.md 規則 5 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `clarify` 問答格式（Context、總結之提問、Options、推薦、Others）與單輪最多 3 題 | E10、E11 | clarify 既有 Rule |
| `s-specify` 其餘步驟、3 份 RuleFile 與樣板組 | E6（作為驗證依據） | s-specify 既有約束 |

## 4. 淨增減

`clarify-over-specs`：

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 17 | +17 |
| RuleFile | 0 | 2 | +2 |
| Rule | 0 | 9 | +9 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 0 | 0 | 0 |

- 新建模式，所有元素均為新增，追溯見差異表。
- `clarify`、`s-specify` 的 Phase、步驟、RuleFile、Rule 數量都不變，只改寫既有文字。
- 不建立腳本：spec 定位只需 `ls`，掃描與寫回都需要語意判斷。不建立樣板組：寫回的檔案沿用 s-specify 的 spec 樣板組，完成回報是對話輸出，不是檔案。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 未指定時取 `specs/` 下編號最大、含 spec.md 的目錄；指定時用指定路徑 | P1-2 | 步驟內文 | 只屬單一步驟、一句話可表達；檔案清單由 P1-1 取得，不需另建腳本 |
| C2 | 本次題數：使用者指定正整數，否則 5 | P1-2 | 步驟內文 | 同上 |
| C3 | 找不到 spec.md → 提示 s-specify、停止、不改檔 | P1-3 | SOP 流程 | 分支與停止 |
| C4 | 佇列為空 → 不委派、不改檔，直接回報 | P1-7 | SOP 流程 | 分支與 Phase 轉移 |
| C5 | 讀 clarify 的 SKILL.md 執行、不用 Skill 工具；每輪優先面向為佇列前 3 項，上限為 min(3, 剩餘題數)；不詳記紀錄 | P2-1 | 步驟內文 | 委派參數只屬此步驟；每輪交還控制才能逐輪寫回（E4） |
| C6 | 每題 `Context` 第一行寫「分類：<分類名稱>」 | P2-1 | 步驟內文 | 給 clarify 的呼叫者指示，一句話；clarify 檔案不改 |
| C7 | clarify 不存在 → 回報並停止；使用者未回覆 → 等待 | P2-2 | SOP 流程 | 分支與停止 |
| C8 | 每輪寫入後存檔；只修改目標 spec，不建立其他檔案 | P2-4 | 步驟內文 | 只屬此步驟，一句話 |
| C9 | 驗證依據為 s-specify 3 份 RuleFile 與 spec 樣板組；s-specify 不存在時記「未驗證原因」 | P2-5 | 步驟內文 | 載入來源只屬此步驟；規則本身由 s-specify 存放，不複製 |
| C10 | 驗證衝突時以寫回檢查清單為準；最多修正 3 輪後記「未通過項」 | P2-6 | 步驟內文 | 只屬此驗證步驟 |
| C11 | 續問條件：剩餘題數 > 0、佇列有未問項目、使用者未結束 | P2-8 | SOP 流程 | 迴圈與 Phase 轉移 |
| C12 | 完成回報的內容項目與下一步建議 | P3-2 | 步驟內文 | 對話輸出、不是檔案，不適用樣板組；項目清單一句可表達，不需正反例 |
| C13 | 10 類分類表、每類 Clear／Partial／Missing、掃描整份 spec | P1-6 | `rules/spec-缺口掃描-格式規範.md` Rule 1 | 需要判斷，腳本無法完成；不是檔案結構；需正反例說明「不只看標記」 |
| C14 | 實作方法、技術選型、任務拆解 → Deferred 不提問 | P1-6 | 同上 Rule 2 | 判斷什麼屬於實作需要正反例 |
| C15 | 影響 × 不確定性排序、高影響分類優先 | P1-6、P2-7 | 同上 Rule 3 | 需要判斷與正反例；兩個步驟共用，放 RuleFile 避免重述 |
| C16 | 已在 Clarifications 回答過的不重問 | P1-6 | 同上 Rule 4 | 判斷「同一問題」需要正反例 |
| C17 | 最終狀態 Resolved／Deferred／Clear／Outstanding 判定 | P3-1 | 同上 Rule 5 | 與掃描狀態同主題，集中同一 RuleFile；判定需正反例 |
| C18 | 依決策類型寫回 s-specify spec 的最適合段落 | P2-4 | `rules/spec-寫回-格式規範.md` Rule 1 | 需判斷決策類型；不是整份檔案結構（結構由 s-specify 樣板組保證） |
| C19 | 取代矛盾舊敘述、更新（推定）標記 | P2-4 | 同上 Rule 2 | 需正反例 |
| C20 | 全份統一術語 | P2-4 | 同上 Rule 3 | 需正反例 |
| C21 | Clarifications 紀錄位置、Session、每題一條、標註規則（含 Rule 2 例外） | P2-4 | 同上 Rule 4 | 紀錄是 spec.md 的一部分，整份結構屬 s-specify 樣板組；本約束只規定寫回時的判斷與例外，需正反例 |
| C22 | clarify session 題數上限依呼叫者，未指定時 5 題 | clarify P1-2、P3-3 | `clarify/rules/盤點高影響需求缺口與提問排序判準.md` Rule 3 | 擴充既有同主題 Rule；SKILL.md 兩步驟只引用 |
| C23 | s-specify 下一步提示可執行 `clarify-over-specs` | s-specify P3-5 | 步驟內文 | 擴充既有回報步驟的一句話 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/clarify-over-specs/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述） | 已完成 |
| 2 | W2 | `skill-form-description` | `.agents/skills/clarify/SKILL.md` frontmatter | description 加入「題數上限」 | 無（只概述） | 已完成 |
| 3 | W3 | `skill-form-sop` | `.agents/skills/clarify-over-specs/SKILL.md` SOP | 寫入胖 SOP | C1–C21 | 已完成 |
| 4 | W4 | `skill-form-sop` | `.agents/skills/clarify/SKILL.md`、`.agents/skills/s-specify/SKILL.md` | clarify 兩步驟改引用 Rule 3；s-specify 下一步加提示 | C22、C23 | 已完成 |
| 5 | W5 | `skill-form-rule` | `.agents/skills/clarify/rules/盤點高影響需求缺口與提問排序判準.md` Rule 3 | 修改 session 題數上限 | C22 | 已完成 |
| 6 | W6 | `skill-derive-rule` | clarify-over-specs Phase 2 的寫回 `WRITE` 步驟 | 抽取 `rules/spec-寫回-格式規範.md` | C18–C21 | 已完成 |
| 7 | W7 | `skill-derive-rule` | clarify-over-specs Phase 1 的掃描 `THINK` 步驟 | 抽取 `rules/spec-缺口掃描-格式規範.md` | C13–C17 | 已完成 |
| 8 | W8 | `skill-engineering` 直接撰寫 | `clarify-over-specs/LICENSE`、`clarify/LICENSE`、根目錄 `LICENSE` | 授權與修改標示 | CLAUDE.md 規則 3、前置決策 1 | 已完成 |
| 9 | W9 | `skill-engineering` 直接撰寫 | `AGENTS.md` 規則 2、`docs/待確認.md` | clarify 例外；憲法待辦 | 前置決策 1、CLAUDE.md 規則 5 | 已完成 |

### 工作項內容

#### W1：clarify-over-specs frontmatter

- `name: clarify-over-specs`
- `description`：用途為 s-specify 之後的可選步驟，對整份 spec.md 做多面向需求澄清：10 類分類表掃描、影響與不確定性排序、委派 clarify 並每題標分類、每輪寫回 spec.md 與 Clarifications、取代矛盾與統一術語、依 s-specify 格式規則驗證、回報分類狀態；題數可指定，預設 5；實作與技術選型留到技術規劃。觸發關鍵字：clarify-over-specs、澄清規格、spec 澄清、需求澄清、掃描 spec 缺口。分流：沒有 spec.md 改用 `s-specify`；只訪談不寫回改用 `clarify`；技術選型改用 `technical-research`。
- 開頭加「（未驗證）」。
- 不設 `disable-model-invocation`（E18）。

#### W2：clarify description

- 只把「由呼叫者指定優先提問面向與是否詳記問答紀錄」改為「由呼叫者指定優先提問面向、題數上限與是否詳記問答紀錄」，其餘原文不動。

#### W3：clarify-over-specs 胖 SOP

與 To-Be SOP 相同，但在 W6、W7 抽取前：

- P1-5 不存在；P1-6 寫成：`THINK` 掃描「spec 現況」：以下列 10 類分類表掃描整份 spec（含 `NEEDS CLARIFICATION` 以外的模糊形容詞、（推定）需求與 Assumptions），每類標 Clear、Partial 或 Missing〔10 類與子項目照 To-Be RuleFile 概要 Rule 1〕；實作方法、技術選型、任務拆解類缺口不提問，記為 Deferred 並寫理由；`## Clarifications` 已回答的問題不列入；依影響 × 不確定性排序，高影響且未解決的分類優先於兩個低影響缺口，答案不會改變需求、驗收或使用者體驗的缺口不列入；建立「提問佇列」與「覆蓋地圖」；使用者指定優先面向時，影響相同的缺口中優先排入該面向。
- P2-3 不存在；P2-4 寫成：`WRITE` 將「本輪澄清結果」的每項決策寫入「目標 spec」並存檔：〔To-Be RuleFile 概要寫回 Rule 1–4 全文〕；只修改「目標 spec」，不建立其他檔案。
- P2-7 的「依『缺口掃描檢查清單』排入」暫寫「依 P1-6 的排序方式排入」。
- P3-1 寫成：`THINK` 判定每個分類的最終狀態：Resolved（原為 Partial／Missing，本次已解決）、Deferred（超過題數、使用者結束或屬實作類）、Clear（原本已足夠）、Outstanding（仍為 Partial／Missing 但影響低），列出 Outstanding 與 Deferred 項目及理由，建立「分類狀態摘要」。
- 其餘步驟與 To-Be 全文相同。

#### W4：clarify 與 s-specify 的 SOP 文字

- clarify Phase 1 步驟 2：「並確保整個 clarify session 累計不超過 5 題」改為「並確保整個 clarify session 累計不超過 Rule 3 的題數上限」。
- clarify Phase 3 步驟 3：「累計題數尚未達 5 題」改為「累計題數尚未達 Rule 3 的題數上限」。
- clarify 其餘文字與格式不動，不套用本 repo 的 SOP 格式（clarify 是外部 Skill）。
- s-specify Phase 3 步驟 5 結尾的下一步：「沒有時建議先審閱 Assumptions 與 Out of Scope，確認後進入技術規劃階段」改為「沒有時建議先審閱 Assumptions 與 Out of Scope，並提示可選擇執行 `clarify-over-specs` 對 spec.md 做多面向的需求澄清，確認後進入技術規劃階段」。其餘不動。

#### W5：clarify Rule 3

- 標題改為「Rule 3 - 單輪最多 3 題，整個 session 的題數上限依呼叫者，未指定時最多 5 題」。
- 第二條改為：整個 clarify session 的累計題數，呼叫者 skill 有指定上限時依呼叫者，沒有指定時最多 5 題；達到上限仍無法收斂時，明確說明剩餘風險與卡點，不無限制追問。
- 其餘條列與正反例不動。

#### W6：抽取寫回 RuleFile

- 從 P2-4 抽出 C18–C21，建立 `rules/spec-寫回-格式規範.md`（Rule 1–4 依 To-Be RuleFile 概要），在 P2-4 前插入 P2-3 載入步驟，P2-6 改為逐條驗證「寫回檢查清單」。
- 範例情境不得使用照片相簿或 1A2B（避免與 s-specify 範例與驗收輸入重複）。

#### W7：抽取缺口掃描 RuleFile

- 從 P1-6 與 P3-1 抽出 C13–C17，建立 `rules/spec-缺口掃描-格式規範.md`（Rule 1–5 依 To-Be RuleFile 概要），在 P1-6 前插入 P1-5 載入步驟；P2-7 改為「依『缺口掃描檢查清單』排入」；P3-1 改為「依『缺口掃描檢查清單』判定」。
- 範例限制同 W6。

#### W8：授權

- `.agents/skills/clarify-over-specs/LICENSE`：開頭說明本 Skill 為自建，含 GitHub Spec Kit（https://github.com/github/spec-kit ，MIT，Copyright GitHub, Inc.）`templates/commands/clarify.md`（本 repo `.spec-kit/claude-skills/speckit-clarify/SKILL.md`）的衍生內容：10 類分類表與 Clear／Partial／Missing、影響 × 不確定性排序、實作類 Deferred、逐次寫回與 Clarifications Session 紀錄、取代矛盾與術語統一、寫入後驗證、Resolved／Deferred／Clear／Outstanding 回報；SOP 與 RuleFile 為重新撰寫。之後附 `.spec-kit/LICENSE` 的 MIT 全文。
- `.agents/skills/clarify/LICENSE` 開頭：改為「複製自 …（原連結），本 repo 修改了下列內容（2026-11-03）」，列出 Rule 3、SKILL.md Phase 1 步驟 2、Phase 3 步驟 3、description 四處，並寫「其餘內容未修改」；Apache-2.0 全文不動。
- 根目錄 `LICENSE`「授權範圍」：clarify 條目加「本 repo 修改了題數上限，修改處見該目錄的 LICENSE」；新增 clarify-over-specs 條目（格式比照 technical-research）。

#### W9：AGENTS.md 與待確認

- `AGENTS.md` 規則 2 的 clarify 條目下加一條：例外：`clarify` 的題數上限已改為「呼叫者有指定時依呼叫者，沒指定時最多 5 題」，修改處列在 `clarify/LICENSE`；從上游重新複製後要再套用這些修改。以 `scripts/sync-skills.sh --from agents` 同步到 `CLAUDE.md`。
- `docs/待確認.md` 新增一項：clarify-over-specs 未參考 speckit-clarify 的 constitution 載入，留待第三章第 18 單元（憲法）處理。

## 7. 驗收情境

測試用 spec（S1、S2、S4 共用，施工後建立於暫存專案，不放入 repo）：`specs/002-community-group-buy/spec.md`「社區團購開團與下單」，依 s-specify 格式撰寫、沒有任何 `NEEDS CLARIFICATION` 標記，埋入下列缺口：

- G1 矛盾：某 FR 寫「團購取消後退回款項」，Edge Cases 寫「團購取消後不退款」。
- G2 缺漏：未定義截止時未達成團人數時，訂單如何處理。
- G3 角色：團主與團員能否修改訂單的權限不清。
- G4 模糊：NFR 寫「結帳流程要快速」，沒有門檻。
- G5 術語：「團員」與「買家」混用。
- G6 實作：Input 寫「庫存鎖想用 Redis」。
- G7 推定：Assumptions 有「每人每團限購 5 件（推定）：見 FR-00x」。
- G8 資料：Key Entities 的訂單沒有狀態生命週期。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E10、E13 | 本次 | 暫存專案含 `specs/001-online-pvp-1a2b/` 與上述 002；輸入「請執行 clarify-over-specs」 | 關於取消後退款的題目選 Others：「取消後全額退款，不收手續費」；其他題選推薦選項 | 目標為 002；總題數 ≤ 5、每輪 ≤ 3；每題 Context 第一行為「分類：<10 類之一>」且題目有 Context、總結之提問、含推薦與 Others 的 Options 表；G1 在第一輪被問；沒有題目詢問 Redis 或技術選型，回報的 Deferred 列出 G6；spec.md 不再出現「不退款」，相關 FR 為全額退款；當日 Session 下每個已回答問題恰一條 `Q → A` 且有標註；被答案影響的段落術語一致、無矛盾；`git status` 只有該 spec.md 被修改；回報含題數、路徑、修改段落、10 列狀態表（只用 4 種狀態）、Outstanding 與 Deferred 項目 |
| S2 | E8、E9、E16 | 本次 | 同一份 002，另加 `### Session 2026-11-01` 一條已回答付款方式的 `Q → A`；輸入「clarify-over-specs specs/002-community-group-buy，這次問 8 題」 | 每題選推薦選項 | 總題數 6–8 且每輪 ≤ 3；沒有題目重問付款方式；2026-11-01 Session 原文保留，新紀錄在當日 Session；每題標分類 |
| S3 | E14 | 推定 | 暫存專案刪除 `specs/` 下所有 `<NNN>-*` 目錄；輸入「clarify-over-specs」 | 無 | 回覆要求先執行 `s-specify`；沒有提問；`git status` 與執行前相同 |
| S4 | E17 | 推定 | 同 S1 的 002；輸入「clarify-over-specs」 | 第一輪：選推薦選項，並補一句「先這樣，不用再問」 | 只有一輪提問；第一輪決策已寫回且有 `Q → A`；回報把尚未提問的高影響缺口列為 Deferred 或 Outstanding |
| S5 | E11、E12 | 本次＋回歸（s-specify 為 clarify 的呼叫者） | 暫存專案；以 s-specify 執行「我想做社團活動報名系統，社員可以報名活動」 | clarify 每題選推薦選項 | clarify 總題數 ≤ 5、每輪 ≤ 3；spec.md 寫入 `specs/` 新目錄；完成回報的下一步提到可選擇執行 `clarify-over-specs` |
| S6 | E11、E15、E18 | 回歸（逐步演練） | 檢查 `technical-research`、`plan-with-class-diagram`、`artifact-to-skill-engineering`、`ui-plan` 委派 clarify 的步驟；演練 clarify-over-specs P1-7 佇列為空的分支；檢查 frontmatter | 無 | 4 個呼叫者都沒有指定題數，依新 Rule 3 仍最多 5 題，行為不變；佇列為空時直接到 Phase 3、不委派、不寫檔，回報含 10 列狀態表；frontmatter 沒有 `disable-model-invocation`。逐步演練理由：呼叫者行為未受影響；無法穩定構造 AI 判定無缺口的 spec |

驗收模型：Sonnet、推理強度 medium（Agent 工具指定 `model: sonnet`、`effort: medium`；無法指定時改用 `skill-tester`）。

## 8. 驗收結果

### 施工後結構診斷

- `clarify-over-specs`、`s-specify`：沒有 error。
- `clarify`：21 個 error，修改前的基準也是 21 個（受控動詞沒有反引號、Phase 沒有完成條件、RuleFile 檔名不是 `-格式規範` 等）。這些是外部 Skill 原本的格式，依 CLAUDE.md 規則 2 不調整；本次修改沒有新增 error。
- 同步：`scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；同步輸出沒有只存在於目標端的 Skill。

### 驗收情境結果

驗收方式：Agent 工具指定 `model: sonnet`、`effort: medium`，5 個子代理平行執行 S1–S5；每個情境使用獨立的暫存專案 `/tmp/cos-accept/S<N>`（rsync 本次未提交修改後 commit 為基準，移除 git remote）；S6 由主 session 逐步演練。判斷由主 session 讀取子代理回報，並直接檢查暫存專案的 spec.md 與 `git status`。

| 情境 | 結果 | 依據 |
| ---- | ---- | ---- |
| S1 | 通過 | 目標為 002；2 輪 3＋2＝5 題；每題 Context 第一行為「分類：…」；退款矛盾在第一輪第一題；沒有問 Redis，回報列為 Deferred；spec.md 已無「不退款」，FR-005 與 Edge Cases 都改為全額退款；當日 Session 5 條 `Q → A` 都有標註（含 `NFR-001, SC-003`）；「買家」只在第一次出現處留「（原稱「買家」）」；確認的限購 5 件從 Assumptions 移除推定；`git status` 只有該 spec.md；回報含 10 列狀態表，只用 4 種狀態 |
| S2 | 通過 | 3 輪 3＋3＋2＝8 題；沒有重問付款方式；2026-11-01 Session 原文保留，新紀錄在 2026-11-03 Session；每題標分類 |
| S3 | 通過 | 提示先執行 `s-specify`；沒有提問；`git status` 為空 |
| S4 | 通過 | 第一輪 3 題後使用者結束，沒有第二輪；3 個決策已寫回並有 `Q → A`；未提問的訂單狀態與 NFR-001 列為 Deferred |
| S5 | 通過 | s-specify 委派 clarify 共 2 輪 3＋2＝5 題；spec.md 寫入 `specs/002-club-event-signup/`；下一步提到可選擇執行 `clarify-over-specs` |
| S6 | 通過（逐步演練） | `technical-research`、`plan-with-class-diagram`、`artifact-to-skill-engineering`、`ui-plan` 委派 clarify 時都沒有指定題數，依新 Rule 3 仍最多 5 題；P1-7 佇列為空時直接進入 Phase 3、不委派、不寫檔；frontmatter 沒有 `disable-model-invocation` |

### 觀察（不影響通過）

- 子代理都以人工比對完成 P2-6 的格式驗證；S1 子代理自述沒有讀 spec 樣板全文。結果 spec.md 的段落順序正確。
- S2 依缺口掃描 Rule 4，以既有付款答案直接處理 FR-005 與 Edge Cases 的矛盾，沒有重問，並把 Out of Scope 的推定改為「使用者決定」。這符合 Rule 4，但改動不在任何一題的回答裡，使用者實際驗證時可留意。
- S2 新增的 FR 依序編號，但放在各故事底下後，檔案中的出現順序不是遞增。s-specify 規則沒有要求遞增順序。

### 個案驗收條件調整建議

- 無。
