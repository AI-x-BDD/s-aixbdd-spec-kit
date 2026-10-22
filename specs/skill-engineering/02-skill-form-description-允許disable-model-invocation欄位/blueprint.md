# 工程藍圖：skill-form-description－允許 disable-model-invocation 欄位

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/02-skill-form-description-允許disable-model-invocation欄位/`
- 根因報告：同一紀錄目錄的 `rca-report.md`，使用者已確認 E1～E4（含推定的 E4）與 R1、R2
- 確認紀錄：使用者於 Phase 4 回覆「確認」，同意 W1、W2 與 S1～S3；無刪除項目

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | frontmatter 含 `disable-model-invocation: true` 的 `SKILL.md`，通過 `skill-form-description` 的描述完成檢查清單，且 `audit_skill.py` 不回報 FM004 | 本次 | 通用 |
| E2 | 允許清單以外的欄位（例如 `version`）仍被 `skill-form-description` Rule 1 拒絕，`audit_skill.py` 仍回報 FM004 | 既有 | 通用 |
| E3 | `name` 與 `description` 的其他要求維持不變 | 既有 | 通用 |
| E4 | 只把 `disable-model-invocation` 加入允許欄位，不規定哪些 Skill 必須使用 | 推定（已確認） | 通用 |

## 2. To-Be SOP

`skill-form-description` 的 `SKILL.md`（frontmatter 與 SOP）不修改，To-Be 與 As-Is 相同：

````markdown
---
name: skill-form-description
description: 建立或修改 Skill 的 SKILL.md frontmatter（name 與 description）時，必須使用此 Skill；description 決定 Skill 何時被觸發，需寫明用途、觸發情境與相鄰 Skill 的分流。撰寫 SOP 內容時改用 skill-form-sop。
---

# SOP

（Phase 1、Phase 2 與完成條件保留原文，不修改。）
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 沒有無法追溯的元素：Rule 1～4 與兩個 Phase 都追溯到 E1～E3 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `skill-form-description`／`rules/Skill描述-格式規範.md` Rule 1 第 2 條 | 修改 | 允許欄位加入 `disable-model-invocation` | R1、E1、E4（C1） |
| `skill-form-description`／`rules/Skill描述-格式規範.md` Rule 1 Good Example | 修改 | 範例 frontmatter 加入 `disable-model-invocation: true`，說明改為「欄位都在允許範圍內」；Bad Example 保留 `version` 作為未允許欄位 | R1、E1、E2，範例與 C1 一致 |
| `skill-engineering`／`scripts/audit_skill.py` 第 26 行 `ALLOWED_FRONTMATTER_KEYS` | 修改 | 集合加入 `"disable-model-invocation"` | R2、E1（C2） |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `skill-form-description` frontmatter、Phase 1、Phase 2 與完成條件 | E1～E3 | 無（只組織步驟與概述） |
| `rules/Skill描述-格式規範.md` Rule 1 第 1、3、4 條 | E3 | C3 |
| `rules/Skill描述-格式規範.md` Rule 2～4 | E3 | C4 |
| `audit_skill.py` 其餘檢查（FM001～FM003、FM004 對其他欄位的判定） | E2、E3 | C2 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 2 | 2 | 0 |
| 步驟 | 6 | 6 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 4 | 4 | 0 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 0 | 0 | 0 |

- 內容增減：Rule 1 第 2 條允許清單多一個欄位，Good Example 多一行；`audit_skill.py`（屬 `skill-engineering`）允許集合多一個值。沒有新增步驟、Rule 或部位；R1、R2 屬缺失類型，沒有既有內容可刪除或改寫來表達此欄位。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 撰寫 frontmatter 時只能使用允許的欄位（含 `disable-model-invocation`） | `skill-form-description` P1-3、P2-2 | `skill-form-description`／`rules/Skill描述-格式規範.md` Rule 1 | 既有位置；撰寫時需要正反例 |
| C2 | 結構診斷對允許清單以外的欄位回報 FM004 | `skill-engineering` P1-10、P5-5 | `skill-engineering`／`scripts/audit_skill.py` | 既有位置；可由程式判斷。C1 與 C2 分屬兩個 Skill，分別負責撰寫與驗證，兩處的允許清單必須一致 |
| C3 | `name` 與 `description` 的格式限制 | `skill-form-description` P1-3、P2-2 | `rules/Skill描述-格式規範.md` Rule 1 第 1、3、4 條 | 既有，不變 |
| C4 | `description` 的用途、觸發、分流與不寫流程細節 | `skill-form-description` P1-3、P2-2 | `rules/Skill描述-格式規範.md` Rule 2～4 | 既有，不變 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-rule` | `skill-form-description`／`rules/Skill描述-格式規範.md` Rule 1 | 允許清單加入欄位，更新 Good Example | C1 | 已完成 |
| 2 | W2 | `skill-form-script` | `skill-engineering`／`scripts/audit_skill.py` | `ALLOWED_FRONTMATTER_KEYS` 加入欄位 | C2 | 已完成 |

### 工作項內容

#### W1：`rules/Skill描述-格式規範.md` Rule 1

- 第 2 條改為：frontmatter 只能使用 `name`、`description`、`license`、`allowed-tools`、`metadata`、`compatibility` 與 `disable-model-invocation` 欄位。
- Good Example：說明維持「欄位都在允許範圍內，`name` 與目錄 `api-error-review/` 相同」；YAML 在 `description` 之後加入 `disable-model-invocation: true`。
- Bad Example 與第 1、3、4 條保留原文；Rule 2～4 不修改。

#### W2：`scripts/audit_skill.py`

- 第 26 行改為 `ALLOWED_FRONTMATTER_KEYS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility", "disable-model-invocation"}`。
- 其餘程式碼不修改。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E3、E4 | 本次 | 暫存目錄中建立測試 Skill `todo-notes`，frontmatter 含合法的 `name`、`description` 與 `disable-model-invocation: true`；以修改後的 `skill-form-description` 檢查清單逐條驗證，並對該目錄執行 `audit_skill.py` | 無 | 檢查清單 Rule 1～4 均通過；診斷沒有 FM004，也沒有其他 FM error |
| S2 | E2、E3 | 回歸 | 同一測試 Skill 改為多一個 `version: 2` 欄位 | 無 | Rule 1 判定 `version` 不允許；診斷回報 FM004 且只指出 `version` |
| S3 | E1 | 回歸（直接呼叫者 `skill-engineering`） | 繼續 `01-s-specify-建立` 的施工：`s-specify` frontmatter 加入 `disable-model-invocation: true` 後執行施工後結構診斷 | 無 | 診斷沒有 FM004 |

## 8. 驗收結果

- 施工後結構診斷：`skill-form-description` 0 個 error、0 個 warning；`skill-engineering` 0 個 error、2 個 warning（SOP008、REF003），兩者在原始 repo 修改前即存在，與本次修改無關。
- 同步：`./scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端的 Skill。
- S1 通過：暫存目錄的測試 Skill `todo-notes` 含 `disable-model-invocation: true`，`audit_skill.py` 0 個 error；依修改後的描述完成檢查清單逐條演練，Rule 1～4 均通過（逐步演練，未另開子代理：本次只修改允許清單，執行結果可由腳本與規則文字直接判定）。
- S2 通過：同一測試 Skill 加入 `version: 2` 後，診斷回報 FM004，且只指出 `version`。
- S3 通過：`s-specify` 加入 `disable-model-invocation: true` 並將骨架改名為 `spec.md` 後，診斷 0 個 error、0 個 warning。
- 約束分配：C1 只在 Rule 1、C2 只在 `audit_skill.py`，兩處允許清單一致。
