# 工程藍圖：s-specify、clarify-over-specs－缺品質清單檔與編號腳本

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/59-s-specify-缺品質清單檔與編號腳本/`
- 根因報告：同一紀錄目錄的 `rca-report.md`。使用者 2026-11-20 確認根因 R1～R7、驗收條件 E1～E9、驗收情境 S1～S5；待確認事項 2～4 照建議（依賴寫在 Assumptions 並標「（依賴）」、品質清單沿用上游 3 組結構改寫成本專案規則的繁體中文檢查句、免問清單用上游 5 類）。
- 確認紀錄：使用者 2026-11-20 回覆「確認藍圖，待確認事項 1～7 照建議。」另要求：`59-s-specify-需求品質清單與編號腳本/` 不刪除、不修改，是否刪除稍後決定；不 commit。
- 確認紀錄（第 2 次 Phase 3）：使用者 2026-11-20 回覆「確認 W12 修正（藍圖第 2 次 Phase 3：C62、W12、S1-R）。」另要求：`59-s-specify-需求品質清單與編號腳本/` 不刪除、不修改；不 commit。
- 參考但未採用為驗收條件：另一個工作階段建立、未經確認的根因報告（原 `specs/skill-engineering/59-s-specify-需求品質清單與編號腳本/rca-report.md`）。使用者 2026-11-20 同意批 4 完成後刪除，已刪除；它的觀察已摘錄在第 9 節第 5 點。它的觀察只用在第 9 節待確認事項，不改變第 1 節的驗收條件。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | `s-specify` 寫完 spec.md 後，在同一個 spec 目錄寫出 `checklists/requirements.md`：每個檢查項目一行 `- [x]` 或 `- [ ]`，勾選狀態和最後一輪驗證結果一致；仍未通過的項目在 Notes 寫出原因與 spec.md 位置；回報寫出「通過數／總數」 | 本次（C1） | 通用 |
| E2 | 品質清單的項目涵蓋：不含技術實作、以使用者價值撰寫、讀者是非技術利害關係人、必要段落齊全、沒有殘留待澄清標記、需求可測試且無歧義、成功標準可量測且技術中立、驗收情境齊全、Edge Case 已列出、範圍有界（Out of Scope）、依賴與假設已列出、每條 FR 有驗收情境 | 本次（C1、C4、C8） | 通用 |
| E3 | `clarify-over-specs` 寫回後，品質清單存在時重新評估每個項目，只改變狀態有變的勾選記號，其他內容不動；回報「前 a/n → 後 b/n」、新通過的項目、退步的項目與仍未通過的項目；品質清單不存在時略過，回報寫明沒有品質清單 | 本次（C1） | 通用 |
| E4 | 每條成功標準從使用者或業務角度描述結果，不以系統內部指標（例如 API 回應時間、快取命中率）為量測對象 | 本次（C4） | 通用 |
| E5 | 需求缺口依「範圍 > 安全／隱私 > 使用者體驗 > 技術細節」排序後委派 `clarify`；資料保存期、效能目標、錯誤處理方式、登入方式、整合方式這類有業界預設的項目不列入提問，以推定寫入 spec，並在 Assumptions 引用 | 本次（C5） | 通用 |
| E6 | 回報的下一步沒有執行 `clarify-over-specs` 時，寫出跳過的重工風險：推定與歧義會留到技術規劃或實作才被發現，屆時要回頭改 spec 與下游文件 | 本次（C7） | 通用 |
| E7 | spec 依賴既有系統、外部服務或預先準備的資料時，Assumptions 為每項依賴寫一條，並可和一般前提區分；沒有依賴時不寫 | 本次（C8） | 通用 |
| E8 | 輸出目錄由腳本決定：編號為既有最大編號加一（沒有時為 `001`）；既有編號重複時在標準錯誤輸出警告並列出重複的目錄，但照樣繼續；目標目錄已存在時不建立、不覆寫並失敗 | 本次（D2，決定 8） | 通用 |
| E9 | 既有行為不變：功能描述為空時停止且不建立目錄；無法切出使用者故事時停止；spec.md 結構和樣板組一致；`clarify-over-specs` 題數上限與 10 類分類表不變 | 既有 | 通用 |

## 2. To-Be SOP

### 2.1 `s-specify/SKILL.md`

````markdown
---
name: s-specify
disable-model-invocation: true
description: 使用者要求把功能描述寫成 SDD 規格文件 spec.md 時使用：以腳本決定編號並建立 spec 目錄，切分可獨立測試的使用者故事，把 FR／NFR 列管在所屬故事底下，跨故事的才放全域需求，並保留關鍵實體、可量測成果、假設與依賴；需求有高影響缺口時依優先序委派 clarify 訪談使用者，有業界預設的項目改寫成推定、不提問；寫完後把規格品質檢查結果寫成同目錄的 checklists/requirements.md。使用者提到 specify、寫規格、spec.md、需求規格、user story、FR／NFR、規格品質清單時使用。只需訪談釐清需求、不產出 spec.md 時改用 clarify；已有 spec.md、要做多面向澄清時改用 clarify-over-specs；只做技術規劃（技術堆疊、架構、部署方式）時不使用此 Skill。
---

# SOP

## Phase 1 -- 對齊輸入與澄清需求

1. `READ` 使用者的功能描述，建立「需求輸入」。
2. `CHECK` 使用者的功能描述為空或只有空白時，回覆使用者需要提供功能描述並停止執行，不委派 `clarify`，也不建立任何目錄或檔案。
3. `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/s-specify/spec.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`### User Story N - 標題 (Priority: Pn)` 標題格式、`US`／`FR-`／`NFR-`／`SC-` 編號格式，以及 Clarifications、Edge Cases、Requirements、Key Entities、Success Criteria 段落。
4. `READ` `templates/spec.md` 與 `templates/spec.example.md`，載入骨架與範例，命名載入結果為「spec 樣板組」。
5. `READ` 盤點需求缺口時，讀取 `rules/需求缺口-格式規範.md` 的所有 Rule，建立「需求缺口檢查清單」。
6. `THINK` 依「spec 樣板組」各段落需要的內容、「憲法檢查清單」與已載入的「需求缺口檢查清單」盤點「需求輸入」，建立排序後的「需求缺口」，以及不提問、改採業界預設的「業界預設項目」（每項寫出採用的預設內容）。
7. `DELEGATE` 「需求缺口」不為空時，委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取 `clarify` 的 `SKILL.md` 並依其 SOP 執行），以「需求缺口」為優先提問面向並要求依「需求缺口」的順序提問、不要求詳記問答紀錄，取得已確認決策、使用者補充與剩餘風險，建立「澄清結果」；「需求缺口」為空時略過本步驟。
8. `THINK` 合併「需求輸入」與「澄清結果」，建立「需求決策」；「澄清結果」的剩餘風險、「業界預設項目」與未經使用者確認的推斷，列為「未確認事項」。

完成條件：「需求決策」已建立，「需求缺口」的每一項都已由使用者在 clarify 中決定或列入「未確認事項」，「業界預設項目」已列入「未確認事項」，且尚未建立 spec 目錄；或功能描述為空，已停止執行。

## Phase 2 -- 重建需求骨架

1. `READ` 切分使用者故事時，讀取 `rules/使用者故事-格式規範.md` 的所有 Rule，建立「使用者故事檢查清單」。
2. `THINK` 依「需求決策」與已載入的「使用者故事檢查清單」，切出使用者故事，並為每個故事決定標題、敘述、優先級、優先級理由、獨立測試方式與驗收情境。
3. `CHECK` 依「需求決策」無法切出任何使用者故事時，向使用者說明無法切出的原因並停止執行，不建立 `specs/` 下的目錄與 spec.md。
4. `READ` 撰寫與歸屬需求時，讀取 `rules/功能與非功能需求-格式規範.md` 的所有 Rule，建立「需求歸屬檢查清單」。
5. `THINK` 依「需求決策」、「未確認事項」、已切出的使用者故事與已載入的「需求歸屬檢查清單」，寫出 FR 與 NFR，決定每條需求歸屬的使用者故事或全域需求並編號，並建立「推定需求」清單。
6. `CHECK` 逐條驗證「使用者故事檢查清單」與「需求歸屬檢查清單」；未通過時修正使用者故事或需求後重新驗證，最多 3 輪，第 3 輪仍未通過時停止修正，將未通過的 Rule 與所在的使用者故事或需求編號記為「未通過項」。

完成條件：每個使用者故事都有優先級、獨立測試方式與驗收情境，每條 FR／NFR 都已編號並歸屬到一個使用者故事或全域需求，且兩份檢查清單均已通過或未通過的項目已記為「未通過項」；或無法切出使用者故事，已停止執行。

## Phase 3 -- 產出 spec.md 與自檢

1. `THINK` 決定功能簡稱 `<short-name>`：2 至 4 個小寫英文單字以連字號連接。
2. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/create_spec_dir.py --project-root <專案根目錄絕對路徑> --short-name <short-name>`，從標準輸出 JSON 的 `spec_dir` 取得「spec 目錄」，從 `duplicates` 取得「編號警告」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
3. `CHECK` 確認退出狀態為零且標準輸出為可解析的 JSON；參數錯誤時依標準錯誤輸出修正 `<short-name>` 後重試；目標目錄已存在或仍失敗時，向使用者回報標準錯誤輸出並停止執行，不寫入任何檔案。
4. `READ` 撰寫 spec.md 時，讀取 `rules/spec-文件-格式規範.md` 的所有 Rule，建立「spec 文件檢查清單」。
5. `WRITE` 依「spec 樣板組」、已載入的「spec 文件檢查清單」與「憲法檢查清單」，以「需求決策」、Phase 2 的使用者故事與需求、「推定需求」、「未確認事項」及「澄清結果」，將 spec.md 寫入「spec 目錄」；說明文字的語言依「憲法檢查清單」，沒有規定時使用繁體中文，`Feature Branch` 填入「spec 目錄」的名稱，`Created` 填入執行當日日期，不建立 git 分支。
6. `CHECK` 逐條驗證「憲法檢查清單」與「spec 文件檢查清單」，並逐一比對 spec.md 與「spec 樣板組」的段落順序與各段落的條目格式，條目標題後的括號標記也必須與樣板相同；「憲法檢查清單」和「spec 文件檢查清單」或樣板衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」；未通過時修正 spec.md 後重新驗證，最多 3 輪，第 3 輪仍未通過時停止修正，將未通過的 Rule 與 spec.md 中的位置加入「未通過項」。
7. `READ` 撰寫品質清單時，讀取 `templates/requirements-checklist.md` 與 `templates/requirements-checklist.example.md`，載入骨架與範例，命名載入結果為「品質清單樣板組」。
8. `WRITE` 依「品質清單樣板組」與「未通過項」判定每個項目的勾選狀態，將品質清單寫入「spec 目錄」下的 `checklists/requirements.md`；Notes 為每個未通過項目寫一條「**<項目名稱>**：<未通過的 Rule 與原因>（spec.md 位置：<段落或編號>）」，全部通過時只寫一條「全部項目通過」。
9. `WRITE` 向使用者回報 spec.md 路徑、品質清單路徑與通過數（`<通過項目數>/<項目總數>`）、「編號警告」（沒有時不寫）、本次是否進入 clarify、使用者故事與 FR／NFR 數量、全域需求與 Assumptions；「需求輸入」含技術偏好（如框架、資料庫、部署方式）時，一併列出並說明這些內容留待技術規劃階段提供；最後給出下一步：有「未通過項」時逐項列出並建議先處理，沒有時建議先審閱 Assumptions 與 Out of Scope，並提示可選擇執行 `clarify-over-specs` 對 spec.md 做多面向的需求澄清，同時說明跳過它的重工風險：推定與歧義會留到技術規劃或實作才被發現，屆時要回頭修改 spec 與下游文件，確認後進入技術規劃階段；並回報「憲法遵循」：已讀取的憲法檔路徑（都不存在時寫「沒有憲法檔」）、必須／不得規則是否全部通過、「憲法偏離」、「未套用規則」，以及經 `clarify` 決定的憲法衝突。

完成條件：spec.md 與 `checklists/requirements.md` 已寫入腳本建立的「spec 目錄」，「spec 文件檢查清單」已通過或未通過的項目已記為「未通過項」，品質清單的勾選狀態與「未通過項」一致，且已向使用者回報。
````

### 2.2 `clarify-over-specs/SKILL.md`

````markdown
---
name: clarify-over-specs
description: s-specify 產出 spec.md 之後，要對整份規格做多面向需求澄清時使用的可選步驟：以 10 類分類表找出整份 spec.md 的缺漏、矛盾與歧義，依影響與不確定性排序，委派 clarify 向使用者提問並在每題標出分類，把答案寫回 spec.md 最適合的段落與 Clarifications，取代矛盾敘述並統一術語；寫回後重新判定同目錄的規格品質清單 checklists/requirements.md，只切換狀態改變的勾選記號；最後回報每個分類的狀態、尚未解決的項目與品質清單的前後通過數。題數可由使用者指定，預設 5 題；實作方法與技術選型留到技術規劃。使用者提到 clarify-over-specs、澄清規格、spec 澄清、需求澄清、掃描 spec 缺口、品質清單重驗時使用。還沒有 spec.md 時改用 s-specify；只需訪談釐清需求、不寫回 spec.md 時改用 clarify；做技術選型改用 technical-research。
---

# SOP

## Phase 1 -- 定位 spec 與掃描缺口

1. `READ` 使用者輸入（可指定 spec 目錄或 spec.md 路徑、本次題數與優先面向），以及專案根目錄 `specs/` 下名稱符合 `<三位數編號>-<名稱>` 且含 `spec.md` 的目錄清單，建立「澄清輸入」。
2. `THINK` 依「澄清輸入」決定「目標 spec」與「本次題數」：使用者指定路徑時以該路徑的 spec.md 為目標，未指定時取清單中編號最大之目錄的 spec.md；使用者指定正整數題數時以該數為「本次題數」，未指定時為 5。
3. `CHECK` 「目標 spec」不存在時，回覆使用者先執行 `s-specify` 產出 spec.md，並停止執行，不建立或修改任何檔案。
4. `READ` 「目標 spec」全文，建立「spec 現況」；讀取「目標 spec」同目錄的 `checklists/requirements.md`，記下每個勾選項目的文字與勾選狀態，建立「品質清單前狀態」，檔案不存在時記為「沒有品質清單」。
5. `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/s-specify/spec.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`### User Story N - 標題 (Priority: Pn)` 標題格式、`US`／`FR-`／`NFR-`／`SC-` 編號格式，以及 Clarifications、Edge Cases、Requirements、Key Entities、Success Criteria 段落。
6. `READ` 掃描缺口時，讀取 `rules/spec-缺口掃描-格式規範.md` 的所有 Rule，建立「缺口掃描檢查清單」。
7. `THINK` 依已載入的「缺口掃描檢查清單」掃描「spec 現況」，為每個分類標出初始狀態，列出候選缺口及其分類與所在位置，標出 Deferred 項目，排序後建立「提問佇列」與「覆蓋地圖」；使用者指定優先面向時，影響相同的缺口中優先排入該面向。
8. `CHECK` 「提問佇列」為空時進入 Phase 3，不委派 `clarify`，也不修改「目標 spec」；不為空時進入 Phase 2。

完成條件：已決定「目標 spec」與「本次題數」，已記下「品質清單前狀態」或「沒有品質清單」，「覆蓋地圖」已標出每個分類的初始狀態，「提問佇列」已排序；或找不到 spec.md，已停止執行。

## Phase 2 -- 委派提問並寫回 spec

1. `DELEGATE` 讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`；以「提問佇列」最前面、尚未提問的最多 3 項為優先提問面向，題數上限為 3 與剩餘題數（「本次題數」減已提問題數）中較小者，要求每題 `Context` 第一行寫「分類：<分類名稱>」，不要求詳記問答紀錄；取得本輪已確認的決策、使用者補充，以及使用者是否表示結束提問，建立「本輪澄清結果」，並累計已提問題數。
2. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、未修改「目標 spec」，並停止執行；使用者未回覆時停止執行，等待回覆。
3. `READ` 第一次寫回時，讀取 `rules/spec-寫回-格式規範.md` 的所有 Rule，建立「寫回檢查清單」。
4. `WRITE` 依已載入的「寫回檢查清單」與「憲法檢查清單」，將「本輪澄清結果」的每項決策寫入「目標 spec」並存檔，並建立本輪的「待決定矛盾」；只修改「目標 spec」，不建立其他檔案。
5. `READ` 第一次驗證時，讀取 `../s-specify/rules/spec-文件-格式規範.md`、`../s-specify/rules/使用者故事-格式規範.md`、`../s-specify/rules/功能與非功能需求-格式規範.md` 的所有 Rule，以及 `../s-specify/templates/spec.md` 與 `../s-specify/templates/spec.example.md`，建立「spec 格式檢查清單」；這些檔案不存在時，將「找不到 s-specify，未做 spec 格式驗證」記為「未驗證原因」。
6. `CHECK` 逐條驗證「憲法檢查清單」、「寫回檢查清單」與「spec 格式檢查清單」，並比對「目標 spec」與 spec 樣板的段落順序及條目格式；清單衝突時依「憲法檢查清單」、「寫回檢查清單」、「spec 格式檢查清單」的順序為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」；未通過時修正「目標 spec」後重新驗證，最多 3 輪，第 3 輪仍未通過時，將未通過的 Rule 與位置記為「未通過項」。
7. `THINK` 依寫回後的「目標 spec」更新「提問佇列」與「覆蓋地圖」：移除已解決的缺口，將答案引出的新缺口依「缺口掃描檢查清單」排入，並把「待決定矛盾」，以及仍違反「憲法檢查清單」必須／不得規則、需要使用者決定的內容排在「提問佇列」最前面。
8. `CHECK` 剩餘題數大於 0、「提問佇列」仍有尚未提問的項目，且使用者沒有表示結束提問時，返回步驟 1；否則進入 Phase 3。

完成條件：每輪已確認的決策都已寫回「目標 spec」並通過驗證或記為「未通過項」，已提問題數不超過「本次題數」，且已停止提問。

## Phase 3 -- 回報澄清結果

1. `THINK` 依「缺口掃描檢查清單」判定每個分類的最終狀態，列出狀態為 Outstanding 與 Deferred 的項目及理由，建立「分類狀態摘要」。
2. `WRITE` 有「品質清單前狀態」且 Phase 2 寫回過「目標 spec」時，依品質清單檔頭寫的判定方式與 Phase 2 最後一次驗證的「未通過項」重新判定每個項目，只切換狀態改變之項目的勾選記號並存檔，其他內容不變；Phase 2 沒有寫回時，以「品質清單前狀態」為後狀態，不修改檔案；「沒有品質清單」時略過本步驟，不建立 `checklists/`。比較前後狀態，建立「品質清單變化」：前後通過數、新通過、退步與仍未通過的項目。
3. `WRITE` 向使用者回報：已提問與已回答的題數、「目標 spec」路徑、本次修改的段落名稱、「分類狀態摘要」的分類狀態表（每個分類一列）、Outstanding 與 Deferred 項目、「品質清單變化」（寫成「前 a/n → 後 b/n」並列出新通過、退步與仍未通過的項目；「沒有品質清單」時寫明沒有品質清單）、「未通過項」與「未驗證原因」、「憲法遵循」（已讀取的憲法檔路徑，都不存在時寫「沒有憲法檔」；必須／不得規則是否全部通過；「憲法偏離」；「未套用規則」）；最後給出下一步：有「未通過項」時建議先處理；有高影響的 Outstanding 或 Deferred 時，建議再執行一次 `clarify-over-specs`，或留到技術規劃處理；其他情況建議進入 `technical-research`。

完成條件：已向使用者回報每個分類的最終狀態、尚未解決的項目與品質清單的前後通過數；品質清單存在時，只有狀態改變之項目的勾選記號被修改。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 「以及專案根目錄 `specs/` 下名稱符合 `<三位數編號>-<名稱>` 的目錄清單（以 `ls -d specs/[0-9][0-9][0-9]-*/` 取得；`specs/` 不存在或沒有符合的目錄時清單為空）」 | `s-specify` P1-1 內文 | 無法追溯：這份清單只供 P3-1 決定編號；編號改由腳本讀取 `specs/`（C21），清單不再有用途 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `s-specify` frontmatter `description` | 修改 | 加入腳本建立 spec 目錄、依賴、依優先序委派 clarify、業界預設改推定、寫出 `checklists/requirements.md`；觸發詞加「規格品質清單」；分流加「已有 spec.md 改用 clarify-over-specs」 | E1、E5、E7、E8；R1、R4、R7（只概述，無約束） |
| `s-specify` P1-5 的缺口判準（「會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾與歧義，以及和『憲法檢查清單』必須／不得規則無法同時滿足的需求」） | 改換存放位置 | 搬到新 RuleFile `rules/需求缺口-格式規範.md` Rule 1；步驟只引用載入結果 | R4、E5（C4）；同主題約束必須集中（約束分配 Rule 3） |
| `rules/需求缺口-格式規範.md` | 新增 | Rule 1：哪些項目列入需求缺口、哪些改列業界預設項目；Rule 2：依範圍 > 安全／隱私 > 使用者體驗 > 技術細節排序。內容見 W9 | R4、E5（C4、C5、C6） |
| `s-specify` P1-5 → To-Be P1-5、P1-6 | 修改 | 胖 SOP 先把 C4～C6 寫在步驟內文；`skill-derive-rule` 抽出 RuleFile 並插入 `READ` 步驟 | R4、E5 |
| `s-specify` P1-6 → To-Be P1-7 | 修改 | 委派 `clarify` 時要求依「需求缺口」的順序提問（`clarify` Rule 1 只保證以呼叫者面向為主，不保證順序） | R4、E5（C7） |
| `s-specify` P1-7 → To-Be P1-8 | 修改 | 「業界預設項目」列入「未確認事項」，交給既有 `功能與非功能需求` Rule 6 與 `spec-文件` Rule 4 寫成推定與 Assumptions 引用 | R4、E5（C8） |
| `s-specify` Phase 1 完成條件 | 修改 | 加入「業界預設項目已列入未確認事項」；「尚未建立 spec.md」改為「尚未建立 spec 目錄」 | E5、E8（只概述） |
| `s-specify` P3-1 的編號規則（「`<NNN>` 為『需求輸入』目錄清單中的最大編號加一，清單為空時為 `001`，不得使用或覆寫既有目錄」） | 改換存放位置 | 搬到腳本 `scripts/create_spec_dir.py`，原文字刪除（載體過弱）；P3-1 只保留 `<short-name>` 的決定 | R7、E8（C21、C22） |
| `scripts/create_spec_dir.py` | 新增 | 列出編號、警告重複、建立目錄、目錄已存在時失敗。介面見 W8 | R7、E8（C21、C22） |
| `s-specify` P3-2、P3-3（DELEGATE、CHECK） | 新增 | 由 `skill-derive-script` 依固定寫法產生 | R7、E8（C23） |
| `s-specify` P3-3 → To-Be P3-5 | 修改 | 寫入位置改為腳本回傳的「spec 目錄」；`Feature Branch` 填目錄名稱 | E8（C33） |
| `rules/spec-文件-格式規範.md` Rule 3 | 修改 | 標題加「從使用者或業務角度描述」；新增條列與 Bad Example 3（量測系統內部、沒有技術名詞）。內容見 W5 | R3、E4（C27） |
| `rules/spec-文件-格式規範.md` Rule 4 | 修改 | 標題加「依賴」；新增依賴條列（標「（依賴）」）；Good Example 加一條依賴；新增 Bad Example（依賴寫成一般前提）。內容見 W5 | R6、E7（C28） |
| `rules/spec-文件-格式規範.md` Rule 7 | 新增 | spec 寫給非技術利害關係人：FR／NFR、SC 以外的段落不得使用技術用語。內容見 W5 | R6、E2（C31） |
| `templates/spec.md` | 修改 | Assumptions 加一行 `- **{{DEPENDENCY_1_TITLE}}**（依賴）：{{DEPENDENCY_1_DESCRIPTION}}`，位於一般前提與推定之間 | R6、E7（C32） |
| `templates/spec.example.md` | 修改 | Assumptions 加一條依賴範例；Key Entities 的 `` `YYYY-MM` `` 改成業務寫法，讓範例符合新 Rule 7 | E7、E2；範例與 C28、C31 一致 |
| 品質清單樣板組 `templates/requirements-checklist.md`、`.example.md` | 新增 | 3 組 12 項、檔頭寫判定方式、Notes。內容見 W7 | R1、E1、E2（C35、C36） |
| `s-specify` P3-4 之後 → To-Be P3-7、P3-8 | 新增 | 胖 SOP 先寫成一個 `WRITE`（結構寫在內文），`skill-derive-template` 抽出樣板組並插入 `READ` | R1、E1 |
| `s-specify` To-Be P3-8（寫出品質清單） | 修改（第 2 次 Phase 3，W12） | 內文加入 Notes 的寫法：每個未通過項目一條「**<項目名稱>**：<未通過的 Rule 與原因>（spec.md 位置：<段落或編號>）」，全部通過時只寫一條「全部項目通過」 | E1（C62）；第 8 節問題 1：C35 原本含 Notes 寫法，但骨架只有 `{{NOTE_1}}`、`skill-form-template` Rule 2 不准骨架寫說明，這段約束沒有存放位置 |
| `s-specify` P3-5 → To-Be P3-9 | 修改 | 回報加品質清單路徑與通過數、「編號警告」；下一步加跳過 `clarify-over-specs` 的重工風險 | R1、R5、E1、E6、E8（C37、C38） |
| `s-specify` Phase 3 完成條件 | 修改 | 加入品質清單已寫入且與「未通過項」一致 | E1（只概述） |
| `clarify-over-specs` frontmatter `description` | 修改 | 加入重新判定品質清單與前後通過數；觸發詞加「品質清單重驗」 | E3（只概述，無約束） |
| `clarify-over-specs` P1-4 | 修改 | 加讀 `checklists/requirements.md`，建立「品質清單前狀態」或記「沒有品質清單」 | R2、E3（C43） |
| `clarify-over-specs` Phase 1 完成條件 | 修改 | 加入已記下品質清單前狀態 | E3（只概述） |
| `clarify-over-specs` P3-2 | 新增 | 重新判定品質清單、只切換改變的勾選記號、建立「品質清單變化」 | R2、E3（C59、C60） |
| `clarify-over-specs` P3-2 → To-Be P3-3 | 修改 | 回報加「品質清單變化」 | R2、E3（C61） |
| `clarify-over-specs` Phase 3 完成條件 | 修改 | 加入前後通過數與只改勾選記號 | E3（只概述） |
| `s-specify/LICENSE` | 修改 | spec-kit 來源加：品質清單 3 組結構、提問優先序與免問清單、SC 使用者角度、依賴列入 Assumptions、編號規則 | CLAUDE.md 規則 3；計畫第 6 節批 4 |
| `clarify-over-specs/LICENSE` | 修改 | 衍生內容加第 7 點：寫回後重驗品質清單、只切換狀態改變的勾選記號、回報前後通過數 | CLAUDE.md 規則 3；計畫第 6 節批 4 |
| `docs/dev/迭代-runbook.md` P2 提示詞 | 修改 | 說明 `s-specify` 另產出 `{SPEC_DIR}/checklists/requirements.md`，回報時一併告知通過數 | 計畫第 6 節批 4 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `s-specify` frontmatter `name`、`disable-model-invocation` | 必要流程 | 無 |
| `s-specify` Phase 1 -- 對齊輸入與澄清需求（P1-2、P1-3、P1-4） | E9、E5 | C1、C2；P1-4 只載入樣板組 |
| `s-specify` Phase 2 -- 重建需求骨架（P2-1～P2-6）與完成條件 | E9、E1（P2-6 的「未通過項」供品質清單判定） | C9、C20；其餘步驟只載入或依檢查清單思考 |
| `s-specify` P3-2 → To-Be P3-4（載入 spec 文件規則） | E2、E4、E7 | 無（只載入） |
| `s-specify` P3-4 → To-Be P3-6（驗證 spec.md） | E9、E1 | C34 |
| `rules/使用者故事-格式規範.md` Rule 1～3 | E2（以使用者價值撰寫、驗收情境齊全） | C10～C12 |
| `rules/功能與非功能需求-格式規範.md` Rule 1～6 | E2（不含技術實作、可測試、每條 FR 有驗收情境、沒有殘留待澄清）、E5（Rule 6 把業界預設寫成推定） | C13～C18 |
| `rules/spec-文件-格式規範.md` Rule 1、2、5、6 | E2（必要段落齊全、Edge Case、範圍有界）、E9 | C24～C26、C29、C30 |
| `clarify-over-specs` frontmatter `name` | 必要流程 | 無 |
| `clarify-over-specs` P1-1～P1-3、P1-5～P1-8 | E9 | C39～C42、C44～C50 |
| `clarify-over-specs` Phase 2（P2-1～P2-8）與完成條件 | E9、E3（P2-6 的「未通過項」供重新判定） | C51～C58 |
| `clarify-over-specs` P3-1 | E9 | 無（依檢查清單判定） |
| `clarify-over-specs/rules/spec-缺口掃描-格式規範.md` Rule 1～5 | E9（10 類分類表） | C44～C48 |
| `clarify-over-specs/rules/spec-寫回-格式規範.md` Rule 1～4 | E9、E3 | C52～C55 |

## 4. 淨增減

| 項目 | `s-specify` As-Is | `s-specify` To-Be | 增減 | `clarify-over-specs` As-Is | `clarify-over-specs` To-Be | 增減 |
| ---- | ----- | ----- | ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 | 3 | 3 | 0 |
| 步驟 | 18 | 23 | +5 | 18 | 19 | +1 |
| RuleFile | 3 | 4 | +1 | 2 | 2 | 0 |
| Rule | 15 | 18 | +3 | 9 | 9 | 0 |
| 樣板組 | 1 | 2 | +1 | 0 | 0 | 0 |
| 腳本 | 0 | 1 | +1 | 0 | 0 | 0 |

增加理由（依施工委派 Rule 4，先考慮刪改）：

1. `s-specify` +1 RuleFile、+2 Rule、+1 步驟（P1-5 `READ`）：R4，缺失。刪除不適用（沒有既有內容表達優先序與免問清單）；改寫不適用（既有 3 份 RuleFile 的主題是故事、需求、spec 文件，不是「提問前的缺口篩選」）；改換存放位置：P1-5 既有的缺口判準和新約束同主題，一起搬進新 RuleFile，步驟內文因此變短。判斷「有沒有業界預設」「屬於哪一類」需要正反例，不能只寫在步驟內文。
2. `s-specify` +1 腳本、+2 步驟（P3-2 `DELEGATE`、P3-3 `CHECK`）：R7，載體過弱。編號規則從 P3-1 的 `THINK` 改換到腳本，原文字刪除；P1-1 的目錄清單一併刪除。`DELEGATE`＋`CHECK` 是 `skill-derive-script` 的固定寫法。
3. `s-specify` +1 樣板組、+2 步驟（P3-7 `READ`、P3-8 `WRITE`）：R1，流程缺陷。品質清單是新的產出檔，沒有既有步驟寫檔，也沒有既有樣板可改；P3-6 的 `CHECK` 只驗證，不能兼寫檔。
4. `s-specify` +1 Rule（Rule 7）：R6，缺失。`功能與非功能需求` Rule 4 只管 FR／NFR，`spec-文件` Rule 3 只管 SC；擴大它們的範圍會混入不同段落，因此在同一份 spec 文件 RuleFile 新增一條。
5. `clarify-over-specs` +1 步驟（P3-2 `WRITE`）：R2，流程缺陷。P2-4 規定只修改「目標 spec」，不能改寫成兼改清單；把寫檔併進 P3-3 回報會讓一個步驟做兩件事。

第 2 次 Phase 3（W12）：數量都不變。P3-8 內文加一句 Notes 寫法（C62，原屬 C35）。刪除不適用（沒有既有內容表達 Notes 寫法）；改換存放位置不適用（樣板組無法承載，見 C62 理由）；因此改寫 P3-8 內文，不新增步驟或部位。

刪改：刪除 P1-1 目錄清單；P1-5 缺口判準與 P3-1 編號規則改換存放位置；P1-6、P1-7、P3-3、P3-5 與 `clarify-over-specs` P1-4、P3-2 改寫。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 功能描述為空時停止，不委派 `clarify`，不建立目錄或檔案 | `s-specify` P1-2 | SOP 流程 | 既有，不變；屬於分支 |
| C2 | 憲法檢查清單的來源檔與鎖定項目 | `s-specify` P1-3 | P1-3 步驟內文 | 既有，不變；只屬於單一步驟 |
| C3 | 需求缺口不為空才委派 `clarify`，為空時略過 | `s-specify` P1-7 | SOP 流程 | 既有，不變；屬於分支 |
| C4 | 需求缺口只收會改變故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾與歧義，以及和憲法必須／不得規則無法同時滿足的需求 | `s-specify` P1-6 | `rules/需求缺口-格式規範.md` Rule 1 | 改換存放位置：和 C5、C6 同主題（約束分配 Rule 3）；需要判斷與正反例；腳本與樣板都無法判斷語意 |
| C5 | 資料保存期、效能目標、錯誤處理方式、登入方式、整合方式有業界預設時不列入需求缺口，改列「業界預設項目」並寫出預設內容；說法互相矛盾或涉及法規、金錢等重大後果時仍列入 | `s-specify` P1-6 | `rules/需求缺口-格式規範.md` Rule 1 | 新增；判斷「有沒有合理預設」需要正反例；不是產出檔的結構，不適合樣板 |
| C6 | 需求缺口依範圍 > 安全／隱私 > 使用者體驗 > 技術細節排序，同類內影響大的在前 | `s-specify` P1-6 | `rules/需求缺口-格式規範.md` Rule 2 | 新增；歸類需要判斷與正反例 |
| C7 | 委派 `clarify` 時要求依「需求缺口」的順序提問，不要求詳記問答紀錄 | `s-specify` P1-7 | P1-7 步驟內文 | 只屬於單一步驟，一句話可表達；不能寫進外部 `clarify`（CLAUDE.md 規則 2） |
| C8 | 剩餘風險、「業界預設項目」與未經確認的推斷列為「未確認事項」 | `s-specify` P1-8 | P1-8 步驟內文 | 修改；只屬於單一步驟，一句話可表達 |
| C9 | 無法切出使用者故事時停止，不建立目錄與 spec.md | `s-specify` P2-3 | SOP 流程 | 既有，不變；屬於分支 |
| C10 | 使用者故事是可獨立交付與驗證的使用者價值 | `s-specify` P2-2 | `rules/使用者故事-格式規範.md` Rule 1 | 既有，不變 |
| C11 | 優先級依使用者價值排列並寫出理由 | `s-specify` P2-2 | `rules/使用者故事-格式規範.md` Rule 2 | 既有，不變 |
| C12 | 驗收情境以 Given／When／Then 描述可觀察結果，涵蓋成功路徑與例外 | `s-specify` P2-2 | `rules/使用者故事-格式規範.md` Rule 3 | 既有，不變 |
| C13 | FR 與 NFR 依性質區分並以可驗證的 MUST 陳述 | `s-specify` P2-5 | `rules/功能與非功能需求-格式規範.md` Rule 1 | 既有，不變 |
| C14 | 需求歸屬到主要服務的使用者故事 | `s-specify` P2-5 | `rules/功能與非功能需求-格式規範.md` Rule 2 | 既有，不變 |
| C15 | 需求編號唯一且不重排 | `s-specify` P2-5 | `rules/功能與非功能需求-格式規範.md` Rule 3 | 既有，不變 |
| C16 | 需求不得描述技術實作 | `s-specify` P2-5 | `rules/功能與非功能需求-格式規範.md` Rule 4 | 既有，不變 |
| C17 | 每條 FR 都有驗證它的驗收情境 | `s-specify` P2-5 | `rules/功能與非功能需求-格式規範.md` Rule 5 | 既有，不變 |
| C18 | 未確認事項與 AI 自訂門檻要求系統做到時寫成推定需求 | `s-specify` P2-5 | `rules/功能與非功能需求-格式規範.md` Rule 6 | 既有，不變；承接 C5 的業界預設 |
| C19 | `<short-name>` 為 2 至 4 個小寫英文單字以連字號連接 | `s-specify` P3-1 | P3-1 步驟內文 | 既有，不變；選字需要 AI 判斷，腳本只檢查字元安全（C22） |
| C20 | 驗證最多 3 輪，仍未通過記為「未通過項」 | `s-specify` P2-6、P3-6 | SOP 流程 | 既有，不變；屬於迴圈 |
| C21 | 編號為 `specs/` 下 `<三位數>-<名稱>` 目錄的最大編號加一，沒有時為 `001`；建立目標目錄；目標路徑已存在時不建立、不覆寫並以非零狀態結束 | `s-specify` P3-2 | `scripts/create_spec_dir.py` | 改換存放位置（載體過弱）：輸入輸出明確、可重複執行、結果可由程式判斷 |
| C22 | 重複編號時在標準錯誤輸出列出重複的編號與目錄，照樣繼續，並在 JSON 的 `duplicates` 回傳；`--short-name` 只接受小寫英數與連字號 | `s-specify` P3-2 | `scripts/create_spec_dir.py` | 新增；可由程式判斷 |
| C23 | 腳本參數錯誤時修正後重試；目標已存在或仍失敗時回報並停止，不寫入任何檔案 | `s-specify` P3-3 | SOP 流程 | 新增；屬於分支 |
| C24 | 段落與條目依實際內容增減 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 1 | 既有，不變 |
| C25 | Clarifications 對應已確認的決策 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 2 | 既有，不變 |
| C26 | Success Criteria 有可檢查的門檻、不提技術實作 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 3 | 既有，不變 |
| C27 | Success Criteria 從使用者或業務角度描述可觀察的結果，不以系統內部指標為量測對象 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 3 | 新增；和 C26 同主題；判斷「是否系統內部」需要正反例 |
| C28 | spec 依賴既有系統、外部服務或預先準備的資料時，每項依賴在 Assumptions 列一條並標「（依賴）」，以業務用語寫出依賴對象與用到的部分；沒有依賴時不寫 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 4 | 新增；和既有 Assumptions 規則同主題；判斷「什麼算依賴」需要正反例。條目格式另由 C32 樣板保證 |
| C29 | 澄清決策、需求、驗收情境與 Edge Cases 一致 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 5 | 既有，不變 |
| C30 | Out of Scope 至少一項並標示來源 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 6 | 既有，不變 |
| C31 | 使用者故事敘述、驗收情境、Edge Cases、Key Entities、Assumptions 與 Out of Scope 以業務用語寫給非技術利害關係人，不使用 API、端點、HTTP 狀態碼、資料表或欄位名稱、框架、程式語言、時區識別碼等技術用語；標準或法規名稱（例如 WCAG）不算技術用語 | `s-specify` P3-5 | `rules/spec-文件-格式規範.md` Rule 7 | 新增；判斷需要正反例；範圍刻意排除 FR／NFR（C16）與 SC（C26），避免重複 |
| C32 | spec.md 的段落順序與條目格式（含 Assumptions 的一般前提、「（依賴）」、「（推定）」三種條目） | `s-specify` P3-5 | spec 樣板組 | 既有，修改；約束整份 spec.md 的結構 |
| C33 | spec.md 寫入「spec 目錄」；語言依憲法，沒有規定時用繁體中文；`Feature Branch` 填目錄名稱；`Created` 填當日；不建立 git 分支 | `s-specify` P3-5 | P3-5 步驟內文 | 既有，修改寫入位置；只屬於單一步驟 |
| C34 | 驗證時憲法優先；改變鎖定項目的規則不套用並記入「未套用規則」；偏離「應」規則記入「憲法偏離」 | `s-specify` P3-6 | P3-6 步驟內文 | 既有，不變；只屬於單一步驟 |
| C35 | 品質清單的檔頭（標題、目的、建立日期、spec 連結、判定方式）、3 組 12 項（每項括號內寫引用的 Rule）與 Notes 段落的位置 | `s-specify` P3-8 | 品質清單樣板組 | 新增；約束整份產出檔的結構。第 2 次 Phase 3 把 Notes 的寫法拆成 C62（存放位置判斷不同，約束分配 Rule 1） |
| C36 | 判定方式：項目括號內引用的規則全部通過時為 `- [x]`，任一未通過時為 `- [ ]` | `s-specify` P3-8、`clarify-over-specs` P3-2 | 品質清單樣板組（檔頭「判定方式」一行，寫進每份清單） | 新增；寫在清單檔頭，兩個 Skill 讀同一個來源，不在兩個步驟各寫一次 |
| C37 | 回報內容：spec.md 路徑、品質清單路徑與通過數、「編號警告」、是否進入 clarify、數量、全域需求、Assumptions、技術偏好、下一步、憲法遵循 | `s-specify` P3-9 | P3-9 步驟內文 | 既有，修改；只屬於單一步驟 |
| C38 | 下一步提示 `clarify-over-specs` 時說明跳過的重工風險 | `s-specify` P3-9 | P3-9 步驟內文 | 新增；只屬於單一步驟，一句話可表達，不需要正反例 |
| C39 | 「澄清輸入」的來源與目錄清單 | `clarify-over-specs` P1-1 | P1-1 步驟內文 | 既有，不變 |
| C40 | 目標 spec 與本次題數的決定方式（預設 5） | `clarify-over-specs` P1-2 | P1-2 步驟內文 | 既有，不變 |
| C41 | 目標 spec 不存在時停止，不建立或修改檔案 | `clarify-over-specs` P1-3 | SOP 流程 | 既有，不變；屬於分支 |
| C42 | 憲法檢查清單的來源檔與鎖定項目 | `clarify-over-specs` P1-5 | P1-5 步驟內文 | 既有，不變 |
| C43 | 讀取同目錄 `checklists/requirements.md` 記下每個項目的狀態；不存在時記「沒有品質清單」 | `clarify-over-specs` P1-4 | P1-4 步驟內文 | 新增；只屬於單一步驟，一句話可表達 |
| C44 | 以 10 類分類表掃描整份 spec | `clarify-over-specs` P1-7 | `rules/spec-缺口掃描-格式規範.md` Rule 1 | 既有，不變 |
| C45 | 實作問題記為 Deferred，不提問 | `clarify-over-specs` P1-7 | `rules/spec-缺口掃描-格式規範.md` Rule 2 | 既有，不變 |
| C46 | 提問依影響 × 不確定性排序 | `clarify-over-specs` P1-7 | `rules/spec-缺口掃描-格式規範.md` Rule 3 | 既有，不變（本批不改，計畫 C5 只要求 `s-specify`） |
| C47 | 已回答的問題不重問 | `clarify-over-specs` P1-7 | `rules/spec-缺口掃描-格式規範.md` Rule 4 | 既有，不變 |
| C48 | 最終狀態依處理結果判定 | `clarify-over-specs` P3-1 | `rules/spec-缺口掃描-格式規範.md` Rule 5 | 既有，不變 |
| C49 | 使用者指定優先面向時，影響相同的缺口優先排入 | `clarify-over-specs` P1-7 | P1-7 步驟內文 | 既有，不變 |
| C50 | 提問佇列為空時直接進 Phase 3，不修改目標 spec | `clarify-over-specs` P1-8 | SOP 流程 | 既有，不變 |
| C51 | 委派 `clarify` 的方式：讀 SKILL.md 執行、每輪最多 3 題、`Context` 第一行寫分類 | `clarify-over-specs` P2-1 | P2-1 步驟內文 | 既有，不變 |
| C52 | 決策寫回最適合的段落 | `clarify-over-specs` P2-4 | `rules/spec-寫回-格式規範.md` Rule 1 | 既有，不變 |
| C53 | 新決策取代矛盾的舊敘述 | `clarify-over-specs` P2-4 | `rules/spec-寫回-格式規範.md` Rule 2 | 既有，不變 |
| C54 | 同一概念使用同一術語 | `clarify-over-specs` P2-4 | `rules/spec-寫回-格式規範.md` Rule 3 | 既有，不變 |
| C55 | Clarifications 逐題記錄並標註位置 | `clarify-over-specs` P2-4 | `rules/spec-寫回-格式規範.md` Rule 4 | 既有，不變 |
| C56 | Phase 2 只修改目標 spec，不建立其他檔案 | `clarify-over-specs` P2-4 | P2-4 步驟內文 | 既有，不變 |
| C57 | spec 格式檢查清單讀 `s-specify` 的規則與樣板；不存在時記「未驗證原因」；驗證衝突的優先順序 | `clarify-over-specs` P2-5、P2-6 | P2-5、P2-6 步驟內文 | 既有，不變 |
| C58 | 剩餘題數、佇列與結束提問決定是否繼續 | `clarify-over-specs` P2-8 | SOP 流程 | 既有，不變；屬於迴圈 |
| C59 | 只在有品質清單且 Phase 2 寫回過時重新判定；沒寫回時後狀態等於前狀態、不改檔；沒有品質清單時略過、不建立 `checklists/` | `clarify-over-specs` P3-2 | SOP 流程 | 新增；屬於分支 |
| C60 | 只切換狀態改變之項目的勾選記號，其他內容（含 Notes）不變 | `clarify-over-specs` P3-2 | P3-2 步驟內文 | 新增；只屬於單一步驟，一句話可表達。未選腳本：每個項目的判定需要 AI 依規則判斷，切換記號只是寫入判定結果（見第 9 節待確認 5） |
| C61 | 回報「前 a/n → 後 b/n」、新通過、退步、仍未通過；沒有清單時寫明 | `clarify-over-specs` P3-3 | P3-3 步驟內文 | 新增；只屬於單一步驟 |
| C62 | Notes 為每個未通過項目寫一條「**<項目名稱>**：<未通過的 Rule 與原因>（spec.md 位置：<段落或編號>）」；全部通過時只寫一條「全部項目通過」 | `s-specify` P3-8 | P3-8 步驟內文 | 第 2 次 Phase 3 新增（原屬 C35）。不選腳本：原因要由 AI 判斷；不選樣板組：骨架只能放 `{{NOTE_1}}`，`skill-form-template` Rule 2 不准骨架寫使用說明，範例也只能示範一種情況（範例是 11/12），無法同時保證「全部通過」的寫法；不選 RuleFile：一句話可表達，不需要正反例；只屬於 P3-8。`clarify-over-specs` P3-2 不改 Notes（C60），不需要這條約束 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `s-specify` frontmatter `description` | 依 To-Be 改寫 | 無 | 已完成 |
| 2 | W2 | `skill-form-description` | `clarify-over-specs` frontmatter `description` | 依 To-Be 改寫 | 無 | 已完成 |
| 3 | W3 | `skill-form-sop` | `s-specify` SOP | 寫入胖 SOP | C4～C8、C19、C21～C22、C33、C35～C38 | 已完成 |
| 4 | W4 | `skill-form-sop` | `clarify-over-specs` SOP | 依 To-Be SOP 修改 P1-4、Phase 1 完成條件，新增 P3-2，改寫 P3-3 與 Phase 3 完成條件 | C43、C59～C61 | 已完成 |
| 5 | W5 | `skill-form-rule` | `s-specify/rules/spec-文件-格式規範.md` Rule 3、Rule 4、新增 Rule 7 | 見 W5 內容 | C27、C28、C31 | 已完成 |
| 6 | W6 | `skill-form-template` | `s-specify/templates/spec.md`、`spec.example.md` | 加依賴條目；範例改寫 `YYYY-MM` | C32 | 已完成 |
| 7 | W7 | `skill-derive-template` | `s-specify` Phase 3 -- 產出 spec.md 與自檢 的 `WRITE` 寫出品質清單步驟 | 抽出品質清單樣板組，插入 `READ` | C35、C36 | 已完成 |
| 8 | W8 | `skill-derive-script` | `s-specify` Phase 3 -- 產出 spec.md 與自檢 的 `WRITE` 決定編號並建立 spec 目錄步驟 | 抽出 `scripts/create_spec_dir.py`，改成 `DELEGATE`＋`CHECK`，並刪除 P1-1 的目錄清單 | C21、C22、C23 | 已完成 |
| 9 | W9 | `skill-derive-rule` | `s-specify` Phase 1 -- 對齊輸入與澄清需求 的 `THINK` 盤點需求缺口步驟 | 抽出 `rules/需求缺口-格式規範.md`，插入 `READ` | C4～C6 | 已完成 |
| 10 | W10 | 主 session 直接修改（非 Skill 部位） | `s-specify/LICENSE`、`clarify-over-specs/LICENSE` | 補 checklist 等衍生內容 | 無 | 已完成 |
| 11 | W11 | 主 session 直接修改（非 Skill 部位） | `docs/dev/迭代-runbook.md` P2 提示詞 | 說明新產出 `checklists/requirements.md` | 無 | 已完成 |
| 12 | W12 | `skill-form-sop` | `s-specify` Phase 3 -- 產出 spec.md 與自檢 的 `WRITE` 寫出 `checklists/requirements.md` 步驟 | 內文加入 Notes 寫法（第 2 次 Phase 3） | C62 | 已完成 |

順序依施工委派 Rule 3：frontmatter → 胖 SOP → 修改既有部位 → 抽取部位（從 SOP 位置最後的步驟往前：Phase 3 品質清單 → Phase 3 編號 → Phase 1 缺口）。沒有刪除整個部位檔案，也沒有 SOP 收尾工作項（P1-1 的調整屬於 W8 的依賴步驟）。W10、W11 不是 Skill 部位，在 Skill 施工後做。

### 工作項內容

#### W1：`s-specify` description

全文照第 2.1 節 To-Be frontmatter 的 `description`。`name`、`disable-model-invocation` 不變。

#### W2：`clarify-over-specs` description

全文照第 2.2 節 To-Be frontmatter 的 `description`。`name` 不變。

#### W3：`s-specify` 胖 SOP

Phase 2 與下列沒提到的步驟保留原文。修改處（以 Phase 標題與步驟內文定位）：

| 步驟 | 胖 SOP 全文 |
| ---- | ----------- |
| Phase 1 -- 對齊輸入與澄清需求 的 `READ` 功能描述步驟 | 保留原文（含目錄清單；W8 抽出腳本後才刪除） |
| Phase 1 的 `THINK` 盤點需求缺口步驟 | `THINK` 依「spec 樣板組」各段落需要的內容與「憲法檢查清單」盤點「需求輸入」，建立「需求缺口」與「業界預設項目」：需求缺口只收會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾與歧義，以及和「憲法檢查清單」必須／不得規則無法同時滿足的需求；資料保存期、效能目標、錯誤處理方式、登入方式、整合方式這 5 類有業界預設可採用時不列入需求缺口，改列「業界預設項目」並寫出採用的預設內容，但需求輸入對它們的說法互相矛盾，或涉及法規、金錢等重大後果時，仍列入需求缺口；需求缺口逐項歸入範圍、安全／隱私、使用者體驗、技術細節其中一類，依此順序排列，同類內影響較大的在前。 |
| Phase 1 的 `DELEGATE` 委派 `clarify` 步驟 | 同第 2.1 節 To-Be P1-7 全文 |
| Phase 1 的 `THINK` 合併需求決策步驟 | 同第 2.1 節 To-Be P1-8 全文 |
| Phase 1 完成條件 | 同第 2.1 節 To-Be Phase 1 完成條件 |
| Phase 3 第一個 `THINK` | 同第 2.1 節 To-Be P3-1 全文 |
| Phase 3 新增於 P3-1 之後 | `WRITE` 決定編號並建立 spec 目錄：`<NNN>` 為「需求輸入」目錄清單中的最大編號加一，清單為空時為 `001`；清單中有重複編號時，把重複的編號與目錄記為「編號警告」並照樣繼續；建立專案根目錄的 `specs/<NNN>-<short-name>/` 為「spec 目錄」；目標路徑已存在時不建立、不覆寫，向使用者回報並停止執行，不寫入任何檔案。 |
| Phase 3 的 `READ` spec 文件規則步驟 | 保留原文 |
| Phase 3 的 `WRITE` 寫入 spec.md 步驟 | 同第 2.1 節 To-Be P3-5 全文 |
| Phase 3 的 `CHECK` 驗證 spec.md 步驟 | 保留原文 |
| Phase 3 新增於驗證步驟之後 | `WRITE` 將品質清單寫入「spec 目錄」下的 `checklists/requirements.md`：檔頭依序為標題「規格品質清單：<功能名稱>」、目的、建立日期、指向 `../spec.md` 的連結，以及判定方式「項目括號內引用的規則全部通過時為 `- [x]`，任一未通過時為 `- [ ]`」；接著是「內容品質」「需求完整性」「功能就緒」3 組共 12 項（項目與引用見 W7）；最後是 Notes，為每個未通過項目寫出原因與 spec.md 位置，全部通過時寫「全部項目通過」；依「未通過項」判定每個項目的勾選狀態。 |
| Phase 3 的 `WRITE` 回報步驟 | 同第 2.1 節 To-Be P3-9 全文 |
| Phase 3 完成條件 | 同第 2.1 節 To-Be Phase 3 完成條件 |

#### W4：`clarify-over-specs` SOP

依第 2.2 節 To-Be SOP 修改下列位置，其餘保留原文：

| 步驟 | 修改後全文 |
| ---- | ---------- |
| Phase 1 -- 定位 spec 與掃描缺口 的 `READ`「目標 spec」全文步驟 | 同第 2.2 節 To-Be P1-4 |
| Phase 1 完成條件 | 同第 2.2 節 To-Be Phase 1 完成條件 |
| Phase 3 -- 回報澄清結果，新增於 `THINK` 判定分類最終狀態之後 | 同第 2.2 節 To-Be P3-2 |
| Phase 3 的 `WRITE` 回報步驟 | 同第 2.2 節 To-Be P3-3 |
| Phase 3 完成條件 | 同第 2.2 節 To-Be Phase 3 完成條件 |

#### W5：`s-specify/rules/spec-文件-格式規範.md`

1. Rule 3：
   - 標題改為「Success Criteria 必須可量測、技術中立，並從使用者或業務角度描述」。
   - 新增條列：每條 Success Criteria 必須描述使用者、管理者或業務可觀察的結果，不得以系統內部指標（例如每秒處理的請求數、快取命中率、佇列長度）為量測對象。
   - 新增 Bad Example 3：沒有技術名詞，但量測系統內部，例如「SC-003: 系統每秒可完成 500 筆照片索引作業」。
   - 既有條列、Good Example 與 Bad Example 1、2 保留原文。
2. Rule 4：
   - 標題改為「Assumptions 只寫預設前提、依賴與推定的引用」。
   - 新增條列：spec 依賴既有系統、外部服務或預先準備的資料時，每項依賴必須在 Assumptions 列一條，標題後標「（依賴）」，以業務用語寫出依賴的對象與本功能用到的部分；沒有依賴時不得寫依賴條目。
   - Good Example 加一條：「**使用者電腦中已存放的照片**（依賴）：相簿的照片來自使用者電腦中既有的照片檔案，本功能只整理與預覽這些照片。」說明文字補上「依賴標『（依賴）』」。
   - 新增 Bad Example 5：依賴寫成一般前提、沒有標記，例如「**照片來源**：預設照片都已在電腦中。」
   - 既有條列與其他範例保留原文。
3. 新增 Rule 7「spec 必須寫給非技術利害關係人」：
   - 使用者故事敘述、驗收情境、Edge Cases、Key Entities、Assumptions 與 Out of Scope 必須以業務用語描述，讓不懂技術的利害關係人讀得懂。
   - 上述段落不得使用 API、端點、HTTP 狀態碼、資料表或欄位名稱、框架、程式語言、時區識別碼等技術用語；標準或法規名稱（例如 WCAG）不算技術用語。
   - FR、NFR 的技術限制依 `rules/功能與非功能需求-格式規範.md` Rule 4，Success Criteria 依本檔 Rule 3，本 Rule 不重複規範。
   - Good Example：「**相簿**：一組依日期整理的照片，有名稱與所屬日期。」
   - Bad Example：「**Album**：`albums` 資料表，欄位 `id`、`created_at`，由 `GET /albums` 取得。」
4. Rule 1、2、5、6 保留原文。

#### W6：spec 樣板組

1. `templates/spec.md`：在 Assumptions 的 `{{ASSUMPTION_2_TITLE}}` 那一行之後、第一條（推定）之前，加入 `- **{{DEPENDENCY_1_TITLE}}**（依賴）：{{DEPENDENCY_1_DESCRIPTION}}`。其他內容不變。
2. `templates/spec.example.md`：
   - Assumptions 在「個人單機／本地優先使用情境」之後加入「- **使用者電腦中已存放的照片**（依賴）：相簿的照片來自使用者電腦中既有的照片檔案，本功能只整理與預覽這些照片。」（與 W5 Rule 4 的 Good Example 相同）。
   - Key Entities「日期分組」的「分組年月標記（`YYYY-MM`）」改為「分組年月（例如 2026 年 10 月）」，並刪除重複的「分組顯示標題（如 `2026 年 10 月`）」或改成不含反引號的業務寫法，使範例符合 W5 Rule 7。
   - 其他內容不變。

#### W7：品質清單樣板組（`skill-derive-template`）

- 目標步驟：Phase 3 -- 產出 spec.md 與自檢 中，`CHECK` 驗證 spec.md 之後的 `WRITE` 寫出品質清單步驟。
- 新增 `templates/requirements-checklist.md`（骨架）與 `templates/requirements-checklist.example.md`（範例），在該步驟前插入 `READ`，該 `WRITE` 改為第 2.1 節 To-Be P3-8 全文。
- 骨架結構（C35、C36）：

```markdown
# 規格品質清單：{{FEATURE_TITLE}}

**目的**：進入技術規劃前，確認 spec.md 的完整度與品質
**建立日期**：{{CREATED_DATE}}
**規格**：[spec.md](../spec.md)
**判定方式**：項目括號內引用的規則全部通過時為 `- [x]`，任一未通過時為 `- [ ]`。

## 內容品質

- [{{CQ_1_STATUS}}] 不含技術實作：FR、NFR 不指定框架、程式語言、資料庫或部署方式（功能與非功能需求 Rule 4）
- [{{CQ_2_STATUS}}] 以使用者價值撰寫：每個使用者故事描述使用者能得到的成果，優先級依使用者價值排列（使用者故事 Rule 1、Rule 2）
- [{{CQ_3_STATUS}}] 讀者是非技術利害關係人：FR、NFR 與 SC 以外的段落不使用技術用語（spec 文件 Rule 7）
- [{{CQ_4_STATUS}}] 必要段落齊全：段落順序與條目格式和 spec 樣板相同，省略的段落符合規則（spec 文件 Rule 1、spec 樣板）

## 需求完整性

- [{{RC_1_STATUS}}] 沒有殘留待澄清事項：每個未確認事項都已有預設內容，並寫成推定需求、Assumptions 或 Out of Scope（功能與非功能需求 Rule 6、spec 文件 Rule 4）
- [{{RC_2_STATUS}}] 需求可測試且無歧義：FR、NFR 依性質區分並以 MUST 陳述可驗證條件，編號唯一，歸屬正確（功能與非功能需求 Rule 1～3）
- [{{RC_3_STATUS}}] 成功標準可量測、技術中立，並從使用者或業務角度描述（spec 文件 Rule 3）
- [{{RC_4_STATUS}}] Edge Cases 已列出：Edge Cases 至少一條，處理方式和 FR、NFR 一致（spec 文件 Rule 1、Rule 5）
- [{{RC_5_STATUS}}] 範圍有界：Out of Scope 至少一項並標示來源（spec 文件 Rule 6）
- [{{RC_6_STATUS}}] 依賴與假設已列出：依賴標「（依賴）」，預設前提與推定引用都寫在 Assumptions（spec 文件 Rule 4）

## 功能就緒

- [{{FR_1_STATUS}}] 驗收情境齊全：每個故事的驗收情境以 Given／When／Then 描述可觀察結果，涵蓋成功路徑與至少一個例外（使用者故事 Rule 3）
- [{{FR_2_STATUS}}] 每條 FR 有驗收情境：每條 FR 都有驗證它的驗收情境，澄清決策、需求與驗收情境一致（功能與非功能需求 Rule 5、spec 文件 Rule 2）

## Notes

- {{NOTE_1}}
```

- `{{*_STATUS}}` 填 `x` 或空白；Notes 每個未通過項目一條「**<項目名稱>**：<未通過的 Rule 與原因>（spec.md 位置：<段落或編號>）」，全部通過時只寫「全部項目通過」。
- 範例：對應 `templates/spec.example.md` 的照片相簿 spec，示範 11/12 通過、1 項未通過與它的 Notes。
- 12 項涵蓋 E2 的 12 類；3 份 RuleFile 的每條 Rule 都至少被一個項目引用。

#### W8：編號腳本（`skill-derive-script`）

- 目標步驟：Phase 3 -- 產出 spec.md 與自檢 中，`THINK` 決定 `<short-name>` 之後的 `WRITE` 決定編號並建立 spec 目錄步驟。
- 新增 `scripts/create_spec_dir.py`：單檔 Python、PEP 723（`requires-python >= 3.11`，無外部依賴）、`uv run --script` 執行。
  - 參數：`--project-root`（必填，專案根目錄）、`--short-name`（必填；只接受 `^[a-z0-9]+(?:-[a-z0-9]+)*$`，不符時退出狀態 2）。
  - 掃描 `<project-root>/specs/` 下名稱符合 `^\d{3}-.+` 的目錄；`specs/` 不存在時視為空清單。
  - 編號為最大編號加一，沒有時為 `001`，以 3 位數補零。
  - 同一編號有 2 個以上目錄時，每個編號在標準錯誤輸出寫一行警告，列出所有重複目錄，照樣繼續。
  - 目標路徑 `specs/<NNN>-<short-name>` 已存在（不論目錄或檔案）時，標準錯誤輸出寫明原因，退出狀態 1，不建立、不修改任何檔案。
  - 成功時建立目標目錄（`specs/` 不存在時一併建立），標準輸出 JSON：`{"number": "009", "spec_dir": "<絕對路徑>", "duplicates": [{"number": "001", "dirs": ["specs/001-...", "specs/001-..."]}]}`；不建立 git 分支，不改名既有目錄。
- 該 `WRITE` 步驟改為第 2.1 節 To-Be P3-2 `DELEGATE` 與 P3-3 `CHECK`。
- 依賴步驟調整：Phase 1 的 `READ` 功能描述步驟改為第 2.1 節 To-Be P1-1（刪除目錄清單）。

#### W9：需求缺口 RuleFile（`skill-derive-rule`）

- 目標步驟：Phase 1 -- 對齊輸入與澄清需求 的 `THINK` 盤點需求缺口步驟。
- 新增 `rules/需求缺口-格式規範.md`，在該步驟前插入 `READ`，該步驟改為第 2.1 節 To-Be P1-6 全文。
- Rule 1「只把會改變規格骨架、沒有業界預設的項目列為需求缺口」：
  - 需求缺口必須是會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾或歧義，或和「憲法檢查清單」必須／不得規則無法同時滿足的需求。
  - 資料保存期、效能目標、錯誤處理方式、登入方式、整合方式有業界預設可採用時，不得列入需求缺口，必須列入「業界預設項目」並寫出採用的預設內容。
  - 需求輸入對上述 5 類的說法互相矛盾，或涉及法規、金錢等重大後果時，仍必須列入需求缺口。
  - 需求輸入已指定的做法不是缺口。
  - Good Example（社團活動報名：社員登入後報名活動，額滿時候補）：「額滿後是否自動遞補」列為缺口；「報名資料保存期」「頁面回應速度」列為業界預設項目並寫出預設；登入方式沿用需求輸入。
  - Bad Example：同一情境把「報名資料要保存多久？」「頁面多久要載入完成？」列為提問。
- Rule 2「需求缺口必須依範圍 > 安全／隱私 > 使用者體驗 > 技術細節排序」：
  - 每個缺口必須歸入範圍、安全／隱私、使用者體驗、技術細節其中一類，依此順序排列；同類內影響較大的在前。
  - Good Example：同一情境「候補是否開放給非社員（範圍）」排在「其他社員能否看到報名名單（安全／隱私）」之前，再之後是「候補遞補時如何通知（使用者體驗）」。
  - Bad Example：先問通知方式，再問範圍。
- 範例領域不用 1A2B、相簿、設備借用、課程預約，也不用驗收情境的員工請假。

#### W12：P3-8 Notes 寫法（第 2 次 Phase 3，`skill-form-sop`）

- 目標步驟：Phase 3 -- 產出 spec.md 與自檢 中，`READ` 載入「品質清單樣板組」之後的 `WRITE`「依『品質清單樣板組』與『未通過項』判定每個項目的勾選狀態」步驟。
- 該步驟改為第 2.1 節 To-Be P3-8 全文：在句尾句號前加「；Notes 為每個未通過項目寫一條「**<項目名稱>**：<未通過的 Rule 與原因>（spec.md 位置：<段落或編號>）」，全部通過時只寫一條「全部項目通過」」。
- 樣板組、其他步驟、完成條件、`clarify-over-specs` 都不改。
- 回歸：S1-R（第 7 節）。

#### W10：LICENSE

1. `s-specify/LICENSE` 第 1 點（GitHub Spec Kit）補上 v1.4.2 `specify` 命令的衍生：品質清單 3 組結構（`templates/requirements-checklist*.md`，項目改寫成本專案規則）、提問優先序與免問清單（`rules/需求缺口-格式規範.md`）、Success Criteria 從使用者角度描述、依賴列入 Assumptions、編號規則（`scripts/create_spec_dir.py`）。授權全文不變。
2. `clarify-over-specs/LICENSE` 衍生清單加第 7 點：寫回後重驗 `checklists/requirements.md`，只切換狀態改變的勾選記號，回報前後通過數（v1.4.2 `clarify` 命令）。授權全文不變。
3. 根目錄 `LICENSE` 兩個 Skill 已列 spec-kit 來源，不改。

#### W11：runbook P2 提示詞

`docs/dev/迭代-runbook.md` 的「P2 `s-specify`」提示詞第 3 行改為：「完成後告訴我 spec 目錄路徑與 `checklists/requirements.md` 的通過數，並依步驟 2 的『結束後的檢查』，對照 runbook 第 5 節第 {N} 列『本次要觀察的規則』，寫進 docs/iterations/iter-{N}.md。」其他內容不變。README 不改（計畫第 6 節批 4）。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E4～E9 | 本次（換情境） | 「我要做一個員工請假系統。員工登入後可以選假別和日期送出請假申請，也可以撤回還沒核准的申請。主管可以核准或駁回部屬的申請。帳號由公司既有的員工名冊匯入，不做註冊。」 | `clarify` 提問時，每題採用推薦答案 | (a) 新目錄編號為既有最大編號加一；(b) 有 `checklists/requirements.md`，勾選和回報的通過數一致；(c) SC 都從使用者或業務角度描述；(d) `clarify` 的提問依範圍、安全／隱私、UX、技術細節排序，沒有問資料保存期或效能目標；(e) Assumptions 有「既有員工名冊」的依賴；(f) 回報的下一步有跳過 `clarify-over-specs` 的重工風險；(g) `git status` 只多新的 spec 目錄 |
| S2 | E3、E9 | 本次 | S1 產出的 spec 目錄，執行 `clarify-over-specs`，題數 3 | 每題採用推薦答案 | (a) 回報有「前 a/n → 後 b/n」與變化的項目；(b) `git diff` 中 `requirements.md` 只有勾選記號改變；(c) 只有 `spec.md` 與 `requirements.md` 改變 |
| S3 | E8 | 本次 | 暫存複本（`specs/` 已有兩個 `001-`），再手動建立一個和既有目錄同編號的空目錄（例如另一個 `008-`），直接執行編號腳本 | 無 | 標準錯誤輸出列出 `001` 與 `008` 的重複目錄；新編號為最大編號加一；不覆寫既有目錄；目標目錄已存在時退出狀態非零 |
| S4 | E3、E9 | 回歸 | 暫存複本的 `specs/007-equipment-maintenance-retire/`（沒有品質清單），執行 `clarify-over-specs`，題數 1 | 採用推薦答案 | 回報寫明沒有品質清單；沒有建立 `checklists/`；其他行為和修改前相同 |
| S1-R | E1 | 回歸（第 2 次 Phase 3，W12） | 和 S1 相同 | 和 S1 相同 | 只判斷 (b)：有 `checklists/requirements.md`，勾選和回報的通過數一致；另檢查 Notes：全部通過時只有一條「全部項目通過」，有未通過項目時每項一條並寫出原因與 spec.md 位置 |
| S5 | E7 | 本次 | 「延續 `specs/008-overdue-discord-notification` 已實作的系統，程式在 `apps/equipment-loan/`。成員可以對已歸還的借用留下設備使用心得，管理員可以隱藏不當內容。」 | 每題採用推薦答案 | Assumptions 列出對既有借用紀錄與帳號的依賴，並可和一般前提區分 |

- 直接呼叫者（重新設計 Rule 6）：`audit_skill.py --graph` 中沒有 Skill 委派 `s-specify` 或 `clarify-over-specs`，不需要呼叫者回歸情境。`clarify-over-specs` 以檔案路徑讀取 `s-specify` 的規則與樣板，由 S2、S4 涵蓋。
- S3「目標目錄已存在」的測試方式：最大編號加一的目標路徑正常不會存在，測試時在該路徑先放一個同名一般檔案（W8 規定「不論目錄或檔案」）。

## 8. 驗收結果

### 施工

- W1～W9 由 `implementer`（Sonnet、medium）施工。它沒有用 Skill 工具呼叫 `skill-form-*`／`skill-derive-*`，而是讀了相關 RuleFile 後，直接把第 2.1、2.2 節的 To-Be 全文寫入 SKILL.md。主 session 比對後確認兩份 SKILL.md 和 To-Be 逐字相同。
- W10、W11 由主 session 修改。
- 主 session 修正一處：`requirements-checklist.example.md` 原本把「Edge Cases 已列出」標為未通過，但 `spec.example.md` 的 Edge Case 和 NFR-001 其實一致，理由不成立。主 session 改成「讀者是非技術利害關係人」未通過（Edge Case 寫了「漸進式或延遲載入機制」這種實作手法），維持 11/12。

### 施工後結構診斷與同步

- `audit_skill.py`（兩個 skills 目錄，`s-specify`、`clarify-over-specs`）：0 error、0 warning。
- `sync-skills.sh --from agents`：退出狀態 0。`--check`：兩邊一致。同步輸出沒有「只存在於目標端」的 Skill。

### 驗收情境

驗收模型：Sonnet、medium（Agent 工具指定 `model: sonnet`、`effort: medium`，`general-purpose` 子代理）。每個情境使用 `/tmp/b4-accept/<情境>` 的獨立專案複本（含本次未提交的修改與 `.git`），執行前記錄 `git status` 與 `specs/` 檔案雜湊值。子代理代替使用者，每題採用推薦答案。

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1 | 通過 | (a) 腳本建立 `009-leave-request-system`，並警告 001 重複；(b) 有品質清單，12 項全勾，回報 12/12；(c) SC-001～003 都是員工、主管可觀察的結果；(d) 依序問 2 題範圍、1 題使用者體驗，資料保存期、回應速度改列業界預設；(e) Assumptions 有「公司既有的員工名冊（依賴）」；(f) 下一步寫出跳過 `clarify-over-specs` 的重工風險；(g) `git status` 只多 `specs/009-leave-request-system/` |
| S2 | 通過 | 在 S1 的產出上執行，題數 3，問了 3 題，每題 Context 第一行寫分類。回報「前 12/12 → 後 12/12」，`requirements.md` 和執行前逐位元組相同，只有 `spec.md` 改變。這次沒有項目改變狀態，所以另做 S2b |
| S2b（補充） | 通過 | 測試環境：把 S1 品質清單的「範圍有界」改成 `- [ ]`，並在 Notes 加一條原因。執行 `clarify-over-specs`，題數 1。回報「前 11/12 → 後 12/12」，新通過「範圍有界」。`diff` 只有這一行的勾選記號改變，Notes 不變（符合待確認事項 4） |
| S3 | 通過 | 主 session 直接執行腳本（情境只執行腳本，不需要模型判斷）。另建 `008-dup-test` 後執行，標準錯誤輸出列出 001、008 的重複目錄，新編號為 009，退出狀態 0；在 `specs/010-exists-check` 放一般檔案後再執行，退出狀態 1，該檔案沒有被修改。既有檔案的雜湊值都沒有改變 |
| S4 | 通過 | 對 `007-equipment-maintenance-retire` 執行，題數 1。回報寫「沒有品質清單」，沒有建立 `checklists/`，`git status` 只多 `spec.md` 的修改 |
| S5 | 通過 | Assumptions 有「既有的預約與借用紀錄、設備與使用者帳號（依賴）」，和一般前提「單一組織使用情境」可以區分；`git status` 只多新的 spec 目錄 |

- S1 的領域和外部 `clarify` Rule 1 的範例相同（待確認事項 6）。這次提問的內容是額度、主管自己的申請、駁回後重送，和範例的題目不同。

### 第 2 次 Phase 3（W12）

- 施工：主 session 依 `skill-form-sop` 修改 `.agents/skills/s-specify/SKILL.md` Phase 3 的 `WRITE` 寫出品質清單步驟。比對後確認 s-specify 的 SOP 和第 2.1 節 To-Be 逐字相同。樣板組、其他步驟、完成條件與 `clarify-over-specs` 都沒有改。
- `audit_skill.py`（兩個 skills 目錄，`s-specify`）：0 error、0 warning。
- `sync-skills.sh --from agents`：退出狀態 0。`--check`：兩邊一致。同步輸出沒有「只存在於目標端」的 Skill。主專案 `git status` 只多出本批已有的檔案。
- 驗收模型：Sonnet、medium（Agent 工具指定 `model: sonnet`、`effort: medium`，`general-purpose` 子代理）。測試環境是 `/tmp/b4-accept/s1r`，為獨立專案複本（含本次未提交的修改與 `.git`）。執行前記錄了 `git status` 與 `specs/` 檔案的雜湊值。子代理代替使用者，每題採用推薦答案。

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1-R | 通過 | (b) 腳本建立 `009-employee-leave-request/`，裡面有 `checklists/requirements.md`。12 項全勾（主 session 數過勾選記號：12/12），回報寫 12/12，兩者一致。Notes 只有一條「全部項目通過」（上次 S1 寫成「本次沒有未通過項。」）。依序問 3 題：範圍、安全／隱私、使用者體驗。`git status` 只多出 `specs/009-employee-leave-request/`，既有 `specs/` 檔案的雜湊值沒有改變 |

- 這次 12 項全部通過，所以只驗到「全部通過」的寫法，沒有驗到「有未通過項目」的寫法。有未通過項目時的寫法和範例 `requirements-checklist.example.md` 的 Notes 一致，上次 S2b 的測試環境也用過同一個格式。

### 驗收中發現的問題（未修改）

1. （已在第 2 次 Phase 3 處理，見 W12、C62、S1-R）約束 C35 的「全部通過時寫『全部項目通過』」沒有寫進任何部位。骨架只有 `{{NOTE_1}}`；依 `skill-form-template` Rule 2，骨架不能寫使用說明。S1 的子代理因此寫成「本次沒有未通過項。」它不影響 E1。修正方式：在 To-Be P3-8 內文加一句 Notes 的寫法。這會改動已確認的 To-Be，需要回到 Phase 3。
2. S2b 證實待確認事項 4 的影響：勾選切換成通過後，Notes 仍保留舊的未通過原因。這是已確認的設計，記錄在這裡，供之後決定。
3. S5 的 Assumptions 有「demo seed」，這是 Rule 7 的邊界用語。執行者以「008 也這樣寫」為理由保留。這次不處理。

## 9. Phase 4 待確認事項

1. 免問清單與提問優先序放新 RuleFile `rules/需求缺口-格式規範.md`，P1-5 既有的缺口判準一起搬進去（同主題集中）。不寫在步驟內文的理由：判斷「有沒有業界預設」「屬於哪一類」需要正反例。是否同意？
2. 品質清單 12 項的分組與引用（W7 骨架）是否同意？判定方式寫在清單檔頭，讓 `clarify-over-specs` 重判時和 `s-specify` 用同一個來源。
3. 編號腳本由腳本直接建立目錄（不只計算編號），名稱 `create_spec_dir.py`；重複編號的警告除了標準錯誤輸出，也轉述在 `s-specify` 的回報（「編號警告」）。這是讓使用者看到警告的設計選擇，不新增驗收條件。是否同意？
4. `clarify-over-specs` 只在 Phase 2 有寫回時重判；Notes 照 E3 不修改，因此 Notes 記的是 `s-specify` 當時的未通過原因，可能和新狀態不一致（上游也是如此）。是否接受？
5. 參考另一份紀錄（`59-s-specify-需求品質清單與編號腳本/`）的觀察，供你決定，未加進藍圖：
   - 上游 `clarify` 前後清單檔逐位元組相同：和本藍圖的「狀態沒變就不改檔」一致，不需要新增驗收條件。
   - `clarify` Rule 1 只保證「以呼叫者指定的面向為主」，不保證順序：本藍圖已在 P1-7 要求依序提問，S1(d) 已涵蓋。
   - 上游 AI 回報時數錯項目數（寫 15 項，實際 16 項）：可考慮加一個計數腳本，讓通過數由程式計算。建議本批不加（超出已確認的影響範圍），先看 S1、S2 的實際結果。
6. S1 的「員工請假」和外部 `clarify` Rule 1 的範例同領域，驗收子代理讀到範例時可能被引導。建議維持已確認的 S1，在驗收結果註明這一點；如要換領域請指定。
7. `spec.example.md` 的 Key Entities 有 `` `YYYY-MM` ``，W6 改成業務寫法以符合新 Rule 7；Rule 7 允許標準名稱（WCAG），範例的 NFR-004 與推定引用不改。是否同意？
