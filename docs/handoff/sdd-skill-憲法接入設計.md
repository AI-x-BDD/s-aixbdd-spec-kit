# SDD Skill 憲法接入設計（課程 26:03–28:39 的輸入）

狀態：使用者已在對話中以「都照建議」同意大方向，**尚未寫成工程藍圖**。接手時以 `/skill-engineering` 優化模式處理，本檔內容作為需求輸入，仍要走完 skill-engineering 的驗收條件、藍圖與使用者確認。

## 1. 範圍

要接入的 Skill（`clarify` 不改，課程 27:37 確認）：

`s-specify`、`clarify-over-specs`、`technical-research`、`system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`tasks`、`implement`

各 Skill 讀取的憲法檔，依 `.agents/skills/constitution/rules/憲法落點-格式規範.md` Rule 1 的落點表（`clarify-over-specs` 讀 `skills/s-specify/spec.md`）。`system-analysis` 不代替 Planner 載入憲法，每個 Planner 各自載入。

## 2. 每個 Skill 加的三件事

1. **載入**：Phase 1 新增 `READ` 步驟，讀取 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/<本 Skill>/<產出物>.md`（不存在時略過），建立「憲法檢查清單」。步驟內列出本 Skill 的鎖定項目（見第 4 節）。
2. **產出**：寫產出物時，優先順序為「Skill 專屬憲法檔 ＞ `shared.md` ＞ Skill 內建規則（SKILL.md 步驟內文、`rules/`、`templates/`）」。
3. **驗證**：完成前新增 `CHECK`，逐條核對憲法：
   - 違反「必須／不得」且可修正 → 修正後再完成。
   - 違反「必須／不得」但無法修正（例如和 spec 衝突）→ 互動 Skill 委派 `clarify`；`implement` 不提問，列為受阻任務並寫進完成報告。
   - 偏離「應」→ 可繼續，在完成回報寫理由。

完成回報新增「憲法遵循」：載入了哪些憲法檔、必須／不得規則是否全部通過、「應」的偏離與理由。

## 3. 語言預設的處理

7 個 SKILL.md 的寫入步驟寫死「內文使用繁體中文」（`s-specify`、`technical-research`、`system-analysis`、`api-plan`、`data-plan`、`ui-plan`，`tasks` 也有相關描述）。決定：保留為預設，並註明憲法可覆寫；沒有憲法的專案照樣產出繁中。

## 4. 鎖定項目初稿（施工時要逐一對照各 Skill 的檢查腳本確認）

| Skill | 鎖定項目（憲法不可覆寫） | 依賴者 |
|---|---|---|
| `s-specify` | US／FR／NFR／SC 編號、Edge Cases 段落 | 所有下游 Skill |
| `system-analysis` | 介面編號、端點類型、Wave | Planner、`tasks` |
| `api-plan` | 一個 operation 一個 tag「介面編號 介面名稱」、description 引用需求編號 | `check_contracts.py`、`tasks` |
| `data-plan` | 資料表 note 引用介面與需求 | `check_data_model.py` |
| `ui-plan` | `ui/plan.md` 章節編號、流程節點 | `check_ui.py` |
| `tasks` | 任務 ID、Phase 結構、Must Read／Optional 格式 | `check_tasks.py`、`implement` |
| `implement` | 任務順序、勾選格式 | `tasks_state.py` |

`technical-research`、`clarify-over-specs` 的鎖定項目尚未盤點。

## 5. 驗收方向（課程 32:00–35:35）

1. 在 `002-room-game-chat`（目前只有 `spec.md`）跑 `technical-research` → `system-analysis`。
2. 檢查 `data/data-model.dbml` 每張表有 `created_at`、`updated_at`、`updated_by`、`deleted_at`，刪除寫成軟刪除。
3. 檢查 `contracts/openapi.yaml` 的「查詢本房聊天歷史」有 `page`／`pageSize`（預設 20、上限 100），回應有 `items`、`page`、`pageSize`、`totalItems`、`totalPages`，有 400 `PAGINATION_INVALID`，description 寫排序依據。
4. 衝突案例：`001-online-pvp-1a2b` 的 spec 要求玩家斷線時刪除資料，和軟刪除規則衝突，可用來測「必須規則無法修正 → 委派 clarify」。

## 6. 同時處理的待確認項

- `docs/待確認.md` 第 15 項：`clarify-over-specs` 是否載入憲法。本設計已把它列入接入範圍，處理完更新該項。
