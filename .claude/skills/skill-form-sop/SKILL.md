---
name: skill-form-sop
description: 撰寫或修改 Skill 的 SKILL.md 中 SOP 流程（Phase、步驟、完成條件與部位載入步驟）時，必須使用此 Skill；使用者提到 SOP、流程、Phase、workflow steps 時使用。撰寫 frontmatter 時改用 skill-form-description；建立新 Skill 或整體優化既有 Skill 時改用 skill-engineering。
---

# SOP

## Phase 1 -- 理解與設計

1. `READ` 使用者需求，以及修改既有 Skill 時的目標 `SKILL.md`、其 SOP 載入的 RuleFile 與樣板組，以及其 SOP 委派之腳本的介面說明，確認 Skill 的目的、輸入、輸出與限制。
2. `READ` `rules/SOP-格式規範.md` 的所有 Rule；SOP 需要引用 `rules/`、`templates/` 或 `scripts/` 的部位時，另讀取 `rules/SOP-按需載入-格式規範.md` 的所有 Rule，建立完成檢查清單。
3. `THINK` 依已載入的完成檢查清單，將工作拆成 Phase、步驟與完成條件；呼叫者提供已確認的設計（例如工程藍圖的工作項內容，或 skill-derive-* 的已確認提案）時，以該設計為內容，不另行設計，該設計不符合完成檢查清單時向呼叫者回報差異並停止。

完成條件：已定義符合完成檢查清單的 SOP 結構。

## Phase 2 -- 寫入與驗證

1. `WRITE` 依已載入的完成檢查清單，在目標 `SKILL.md` 建立或更新 `# SOP` section。
2. `CHECK` 逐條驗證完成檢查清單；若有任一項未通過，修正後重新檢查。

完成條件：所有檢查項目均已通過。
