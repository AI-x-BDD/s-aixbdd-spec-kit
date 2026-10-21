---
name: skill-form-description
description: 建立或修改 Skill 的 SKILL.md frontmatter（name 與 description）時，必須使用此 Skill；description 決定 Skill 何時被觸發，需寫明用途、觸發情境與相鄰 Skill 的分流。撰寫 SOP 內容時改用 skill-form-sop。
---

# SOP

## Phase 1 -- 理解與設計

1. `READ` 使用者需求、目標 Skill 的 `# SOP`（若已存在）、修改既有 Skill 時的目前 frontmatter，以及本專案所有 skills 目錄（例如 `.agents/skills`、`.claude/skills`、`skills`）中其他 Skill 的 `name` 與 `description`，建立「觸發現況」。
2. `READ` `rules/Skill描述-格式規範.md` 的所有 Rule，建立描述完成檢查清單。
3. `THINK` 依「觸發現況」與已載入的描述完成檢查清單，確定 `name`、Skill 的產出結果、觸發情境、使用者會提到的關鍵字，以及與範圍重疊之相鄰 Skill 的分流條件；呼叫者提供已確認的設計（例如工程藍圖的工作項內容，或 skill-derive-* 的已確認提案）時，以該設計為內容，不另行設計，該設計不符合描述完成檢查清單時向呼叫者回報差異並停止。

完成條件：已確定符合描述完成檢查清單的 `name` 與 `description` 內容。

## Phase 2 -- 寫入與驗證

1. `WRITE` 目標 Skill 目錄或 `SKILL.md` 不存在時先建立；依已載入的描述完成檢查清單，在目標 `SKILL.md` 開頭建立或更新 frontmatter，不修改 `# SOP` section。
2. `CHECK` 逐條驗證描述完成檢查清單；未通過時修正後重新檢查。
3. `CHECK` 列出至少三個應觸發本 Skill 的使用者請求，以及至少三個應改用相鄰 Skill 或不需任何 Skill 的請求，逐一只依「觸發現況」中各 Skill 的 `description` 判斷應使用的 Skill；判斷結果與預期不符時修正 `description` 後重新檢查。

完成條件：frontmatter 已寫入，描述完成檢查清單均已通過，且所有觸發演練請求的判斷結果均符合預期。
