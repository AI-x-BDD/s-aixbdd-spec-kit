---
name: constitution
description: （未驗證）要為專案新增或修改憲法規則、約束某個 SDD Skill 產出物的內容時使用：依使用者描述的規範判斷規則屬於哪個 Skill 的哪個產出物，寫進 `.agents/constitution/` 下對應的憲法檔，全部產出物共用時才寫進 `shared.md`；每條規則附 Good／Bad Example，缺少的細節委派 clarify 詢問，拒絕改變 SDD 流程或下游追溯結構的需求。使用者提到 constitution、憲法、專案規範、API 風格、資料規範、產出物約束時使用。要新增或改變 SDD 流程、步驟或測試時改用 skill-engineering；寫 spec.md 改用 s-specify。
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
