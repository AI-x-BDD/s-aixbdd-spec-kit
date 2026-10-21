---
name: skill-form-rule
description: 撰寫或修改 Skill 之 rules/ 底下的 RuleFile（條列規則加正反範例）內容時，必須使用此 Skill；使用者提到 rule file、規則檔、格式規範時使用。要為某個 SOP 步驟新增規則並掛上載入步驟時，改用 skill-derive-rule。
---

# SOP

## Phase 1 -- 理解與設計

1. `READ` 使用者需求、目標 Skill 的 `SKILL.md` 與其 SOP 載入的其他 RuleFile 與樣板組、其 SOP 委派之腳本的介面說明，以及修改既有 RuleFile 時的目標 RuleFile。
2. `READ` `rules/RuleFile-格式規範.md` 的所有 Rule，建立完成檢查清單。
3. `READ` 需要更新目標 `SKILL.md` 的載入步驟時，讀取 `../skill-form-sop/rules/SOP-按需載入-格式規範.md` 的所有 Rule，補入完成檢查清單。
4. `THINK` 依已載入的完成檢查清單，確定每個 RuleFile 的主題與 Rule 清單；呼叫者提供已確認的設計（例如工程藍圖的工作項內容，或 skill-derive-* 的已確認提案）時，以該設計為內容，不另行設計，該設計不符合完成檢查清單時向呼叫者回報差異並停止。

完成條件：已確定目標檔案與 Rule 清單。

## Phase 2 -- 寫入與驗證

1. `WRITE` 依已載入的完成檢查清單修改目標 RuleFile；呼叫者沒有負責更新目標 `SKILL.md` 時，一併更新其中載入該 RuleFile 的步驟。
2. `CHECK` 逐條驗證完成檢查清單；若有任一項未通過，修正後重新檢查。

完成條件：所有檢查項目均已通過。
