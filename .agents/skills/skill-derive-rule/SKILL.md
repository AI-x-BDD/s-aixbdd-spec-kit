---
name: skill-derive-rule
description: 針對既有 Skill 的指定 SOP 步驟，設計並寫入按需載入的 RuleFile；當使用者要求為某一步驟展開、補強或逐步增加規則（extract rules、add rules to a step）時，必須使用此 Skill。只修改 RuleFile 內容而不改載入步驟時改用 skill-form-rule；建立新 Skill 或整體優化既有 Skill 時改用 skill-engineering。
---

# SOP

## Phase 1 -- 定位規則展開點

1. `READ` 使用者需求、目標 Skill 的 `SKILL.md`，以及指定步驟已載入的既有 RuleFile（若有）。
2. `CHECK` 使用者或呼叫者指定的 Phase 與步驟可在目標 SOP 中唯一定位；無法唯一定位時，停止並請指定者補充。
3. `READ` 分析指定步驟時，讀取 `rules/規則展開分析-格式規範.md` 的所有 Rule，建立規則展開分析檢查清單。
4. `THINK` 依已載入的規則展開分析檢查清單，分析指定步驟的輸入、輸出、風險與完成條件，確定需要展開的單一規則主題與必要 Rule；呼叫者提供經使用者確認的工程藍圖時，以該工作項內容作為規則主題與 Rule 清單，並以規則展開分析檢查清單驗證該內容，不另行設計。
5. `CHECK` 逐條驗證規則展開分析檢查清單；未通過時修正規則主題與 Rule 清單。
6. `THINK` 比較必要 Rule 與既有 RuleFile 的主題；同一主題時規劃擴充既有 RuleFile，不同主題時規劃新增 RuleFile，並確定第一個依賴規則的步驟。

完成條件：規則展開分析檢查清單均已通過，且已確定目標步驟、單一規則主題、Rule 清單、RuleFile 歸屬與按需載入位置。

## Phase 2 -- 提出 Before／After

1. `WRITE` 整理原始 SOP 片段、修改後 SOP 片段、RuleFile 歸屬與預計新增或調整的 Rule，作為 Before／After；呼叫者未提供工程藍圖時，向使用者展示 Before／After。
2. `CHECK` 呼叫者已提供經使用者確認的工程藍圖時，比對 Before／After 是否與工程藍圖中該工作項的內容及 To-Be SOP 一致：一致時視為已確認，不一致時向呼叫者回報差異並停止執行；未提供工程藍圖時檢查使用者回覆，要求修改時返回 Phase 1，未明確確認時停止執行。

完成條件：使用者已明確確認 Before／After 與 Rule 清單，或兩者與已確認的工程藍圖一致。

## Phase 3 -- 寫入與驗證

1. `READ` 委派 RuleFile 寫入時，讀取 `rules/RuleFile委派-格式規範.md` 的所有 Rule，建立 RuleFile 委派檢查清單。
2. `CHECK` 已確認的提案符合 RuleFile 委派檢查清單；未通過時返回 Phase 2。
3. `DELEGATE` 依已確認的提案與 RuleFile 委派檢查清單，使用 `skill-form-rule` 建立或更新 RuleFile。
4. `DELEGATE` 依已確認的 After 使用 `skill-form-sop` 更新目標 `SKILL.md`，讓 RuleFile 在第一個依賴步驟前按需載入並產生具名檢查清單。
5. `CHECK` 實際變更符合已確認的 Before／After，原有流程目的與順序未被非必要改變，且受影響的 Skill 通過適用驗證；`skill-form-rule` 或 `skill-form-sop` 回報差異並停止時，向使用者或呼叫者回報本次未完成、已寫入的檔案與回報的差異，並返回 Phase 2。

完成條件：RuleFile 委派檢查清單已通過，RuleFile 與 SOP 載入步驟均符合已確認的提案，且所有適用驗證均已通過。
