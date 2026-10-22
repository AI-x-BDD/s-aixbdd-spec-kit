# 根因報告：skill-form-description－允許 disable-model-invocation 欄位

- 紀錄目錄：`specs/skill-engineering/02-skill-form-description-允許disable-model-invocation欄位/`
- 問題證據：本次對話上下文（使用者訊息「改 skill-form-description 跟課程一致」）；`specs/skill-engineering/01-s-specify-建立/blueprint.md` 第 8 節施工差異 1；`.agents/skills/skill-form-description/rules/Skill描述-格式規範.md` Rule 1；`.agents/skills/skill-engineering/scripts/audit_skill.py` 第 26 行與第 204～206 行；課程 repo `Waterball-Software-Academy/aixbdd` 的 16 個 Skill frontmatter（本次對話以 `gh api` 讀取）

## 1. 使用者回報的問題

建立 `s-specify` 時，工程藍圖要求比照課程在 frontmatter 加入 `disable-model-invocation: true`，讓 Skill 只在使用者明確輸入斜線指令時啟動。`skill-form-description` 依其 Rule 1 回報此欄位不在允許範圍，施工因此停止。使用者希望本 repo 的 Skill 規範與課程一致。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | frontmatter 含 `disable-model-invocation: true` 的 `SKILL.md`，通過 `skill-form-description` 的描述完成檢查清單，且 `audit_skill.py` 不回報 FM004 | 本次 | 通用 | S1 |
| E2 | 允許清單以外的欄位（例如 `version`）仍被 `skill-form-description` Rule 1 拒絕，`audit_skill.py` 仍回報 FM004 | 既有 | 通用 | S2 |
| E3 | `name` 與 `description` 的其他要求維持不變：`name` 為 64 字元內的 kebab-case 且與目錄同名；`description` 為 1024 字元內、不含角括號，並說明用途、觸發情境與相鄰 Skill 的分流 | 既有 | 通用 | S1、S2 |
| E4 | 本次只把 `disable-model-invocation` 加入允許欄位，不規定哪些 Skill 必須使用它；是否使用由呼叫者的設計決定 | 推定：課程影片沒有說明此欄位的使用時機，只能從課程 repo 得知全部 Skill 都使用，規定使用時機會超出現有證據 | 通用 | S1 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | `disable-model-invocation: true` 可寫入並通過檢查 | `skill-form-description` 回報差異並停止；即使寫入，`audit_skill.py` 也會回報 FM004 | 觀察：`01-s-specify-建立/blueprint.md` 第 8 節施工差異 1；觀察：`audit_skill.py` 第 26 行 `ALLOWED_FRONTMATTER_KEYS` 不含此欄位，第 204～206 行對未允許欄位回報 FM004 |

## 4. 演練表

`skill-engineering`（建立 `s-specify`，工作項 W1）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P5-3 | 已確認的工程藍圖 W1 | 觀察：已讀取 | 委派 `skill-form-description` 寫入含 `disable-model-invocation` 的 frontmatter | 觀察：已委派 | 一致 |

`skill-form-description`（受委派）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1 | 無 | 無 | 觸發現況 | 觀察：已讀取各 Skill 的 `name` 與 `description` | 一致 |
| P1-2 | 描述完成檢查清單 | 觀察：已讀取 `rules/Skill描述-格式規範.md` | 描述完成檢查清單 | 觀察：已建立 | 一致 |
| P1-3 | 描述完成檢查清單 | 觀察：已使用 | 接受已確認設計中的 `disable-model-invocation` | 觀察：依 Rule 1 第 2 條判定不在允許範圍，回報差異並停止 | 偏離 |

第一個偏離點：`skill-form-description` P1-3（`THINK` 以描述完成檢查清單驗證已確認的設計）。P1-3 本身依檢查清單正確執行；推論：偏離來自檢查清單的內容，也就是 Rule 1（依據 P1-3 的觀察）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `skill-form-description`／`rules/Skill描述-格式規範.md`／Rule 1 第 2 條 | 缺失 | 觀察：Rule 1 第 2 條只允許 `name`、`description`、`license`、`allowed-tools`、`metadata`、`compatibility`。觀察：課程 repo 的 16 個 Skill 全部使用 `disable-model-invocation: true`；本 repo 的外部 Skill `clarify` 也使用此欄位。推論：課程採用的欄位沒有在允許清單中表達（依據以上觀察）。 | 假設 Rule 1 允許此欄位：P1-3 通過，P2-1 寫入 frontmatter；但 `skill-engineering` P5-5 的診斷仍回報 FM004，E1 無法滿足，因此還需要 R2。 |
| R2 | `skill-engineering`／`scripts/audit_skill.py`／第 26 行 `ALLOWED_FRONTMATTER_KEYS` | 缺失 | 觀察：允許欄位集合與 R1 的六個欄位相同，第 204～206 行對其他欄位回報 FM004 error。推論：腳本的允許集合同樣缺少此欄位（依據以上觀察）。 | 假設 R1 與 R2 同時允許此欄位：P1-3 通過，P5-5 不回報 FM004，E1 可滿足；`version` 等其他欄位仍不在兩處的允許清單中，E2 不受影響；`name` 與 `description` 的檢查不變，E3 不受影響。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H3：只是本次 `s-specify` 的個案偏好 | 非 Skill 問題 | 觀察：課程 repo 的 16 個 Skill 全部使用此欄位，本 repo 的 `clarify` 也使用；推論：這是課程通用的 frontmatter 慣例，不只適用本次產出 |
| H4：`skill-form-description` 不該載入 Rule 1，或載入時機錯誤 | 未載入 | 觀察：P1-2 已讀取 `rules/Skill描述-格式規範.md`，P1-3 正確依 Rule 1 判斷；偏離來自 Rule 1 的內容，不是載入方式 |
| H5：`skill-engineering` 的藍圖不該設計此欄位 | 交接缺陷 | 觀察：藍圖 W1 完整交出欄位與用途，`skill-form-description` 也收到了；委派內容沒有缺漏 |

## 7. 影響範圍

- 直接委派 `skill-form-description` 的 Skill：`skill-engineering`（Phase 5 步驟 3 的施工委派）。
- `audit_skill.py` 由 `skill-engineering` 在 Phase 1 步驟 10 與 Phase 5 步驟 5 執行，診斷對象可以是任何 Skill；R2 影響所有 Skill 的結構診斷結果。
- 本 repo 與原始 repo `/Volumes/data/Projects-practice/s-aixbdd` 的 `skill-form-description` 與 `audit_skill.py` 目前完全相同（本次對話以 `diff` 確認），影響範圍相同。

## 8. 待確認事項

- 驗收條件 E1～E4 是否正確、完整？
- 是否同意 R1 與 R2？
- E4 是推定的預期：本次只允許此欄位、不規定哪些 Skill 必須使用，是否同意？
- 沒有仍缺少的證據。
