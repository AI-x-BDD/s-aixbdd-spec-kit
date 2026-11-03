# 工程藍圖：constitution－澄清答案強度被升級

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/33-constitution-澄清答案強度被升級/`
- 根因報告：`rca-report.md`（R1，使用者已於 2026-11-04 回覆「照建議」確認）
- 確認紀錄：2026-11-04 使用者回覆「確認」，確認目前版本的工程藍圖（含推定驗收條件 E2）

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 使用者在需求或澄清中表示「不要求」、「不需要」某項內容時，規則不寫該項的要求，也不寫禁止該項的「不得」條文 | 本次 | 通用 |
| E2 | 使用者明確要求禁止某項內容時，規則以「不得」寫出該禁止 | 推定（已確認）：避免改寫時連帶刪掉使用者真正要求的禁止 | 通用 |
| E3 | `constitution` 31 號藍圖 E1–E14 與 32 號藍圖 E11 的既有預期不變 | 既有 | 通用 |

## 2. To-Be SOP

`SKILL.md` 不變（frontmatter、3 個 Phase、15 個步驟與完成條件保留原文）。只修改 `rules/憲法規則-格式規範.md` Rule 3，To-Be 全文如下：

````markdown
# Rule 3 - 規則只包含使用者提出的要求

- 規則只能包含使用者提出的要求與「澄清結果」。
- 不得加入使用者沒有提出、也不在「澄清結果」中的要求，例如欄位順序、數值上限、命名格式。
- 使用者表示「不要求」、「不需要」某項內容時，規則不得寫入該項的要求，也不得改寫成禁止該項的「不得」條文。
- 使用者明確要求禁止某項內容時，規則必須以「不得」寫出該禁止。
- 寫成規則必須的細節缺少時，必須列入「待澄清項目」，不得自行決定。

## Good Example

### Example 1

- 使用者只說「訂單編號必須使用 UUID」，規則只寫這項要求。

```markdown
# Rule 1 - 訂單編號必須使用 UUID

- 訂單編號欄位必須使用 UUID 字串。
```

### Example 2

- 使用者要求「取消訂單時要記錄取消時間，不能直接刪掉訂單」，澄清時回答「不需要記錄取消原因」；規則寫出明確要求的禁止，沒有提到取消原因。

```markdown
# Rule 1 - 取消訂單必須記錄取消時間

- 取消訂單時必須寫入 `cancelled_at`。
- 取消訂單時不得刪除訂單資料列。
```

## Bad Example

### Example 1

- 規則加入使用者沒有提出的 UUID 版本與欄位位置。

```markdown
# Rule 1 - 訂單編號必須使用 UUID

- 訂單編號欄位必須使用 UUID 第 4 版字串。
- 訂單編號欄位必須放在物件的第一個欄位。
```

### Example 2

- 同一組回答中，「不需要記錄取消原因」被改寫成禁止取消原因欄位。

```markdown
# Rule 1 - 取消訂單必須記錄取消時間

- 取消訂單時必須寫入 `cancelled_at`。
- 取消訂單時不得刪除訂單資料列。
- 訂單不得有 `cancel_reason` 欄位。
```
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | Rule 3 原有 3 條說明與 Example 1 都追溯到 31 號 E6，保留原文 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `rules/憲法規則-格式規範.md` Rule 3 | 修改 | 第 2 條之後新增 2 條說明（「不要求」不得改寫成「不得」；明確禁止才寫「不得」）；Good／Bad Example 各新增 Example 2，原範例改為 Example 1 | R1；E1、E2（C1、C2） |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter、SOP 全部 Phase 與步驟、完成條件 | E3 | 31 號藍圖約束分配表 C1–C16（不變） |
| `rules/憲法規則-格式規範.md` Rule 1、2、4，Rule 3 原有 3 條說明與 Example 1 | E3（31 號 E4、E5、E6、E10） | 不變 |
| `rules/憲法落點-格式規範.md`、`rules/鎖定項目-格式規範.md`、憲法檔樣板組 | E3 | 不變 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 15 | 15 | 0 |
| RuleFile | 3 | 3 | 0 |
| Rule | 11 | 11 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

只有 Rule 3 的說明與範例增加。R1 為缺失，現有說明沒有可改寫成「強度對應原意」的文字，所以新增說明；放在同主題的既有 Rule 3，不新增 Rule 或 RuleFile。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 「不要求」、「不需要」不得寫成要求或「不得」 | P2-6 | `rules/憲法規則-格式規範.md` Rule 3 | 需要判斷使用者原意，腳本無法判斷；不是整份檔案結構，不適用樣板；需要正反例；屬於既有 Rule 3「規則只包含使用者提出的要求」主題 |
| C2 | 明確要求禁止時才寫「不得」 | P2-6 | `rules/憲法規則-格式規範.md` Rule 3 | 同 C1，與 C1 對同一判斷劃出兩側邊界 |
| C3 | 31 號藍圖 C1–C16、32 號藍圖 C10 | 各自原步驟 | 原存放位置 | 既有，不變 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-rule` | `rules/憲法規則-格式規範.md` Rule 3 | 依第 2 節 To-Be 全文改寫 Rule 3，其餘 Rule 不變 | C1、C2 | 已完成 |

### 工作項內容

#### W1：Rule 3 改寫

- 以第 2 節的 Rule 3 全文取代現有 Rule 3；Rule 1、2、4 原文不變。
- 載入步驟（P2-4）不變，不需要 SOP 施工。
- 施工前修正（2026-11-04）：To-Be 第 4 條原寫「只有……時，規則才以『不得』寫出該禁止」，沒有強度用詞，不符合 `skill-form-rule` 的 RuleFile 格式規範 Rule 7；改為「使用者明確要求禁止某項內容時，規則必須以『不得』寫出該禁止」，語意與 E2 相同。

## 7. 驗收情境

測試環境：暫存專案，`.claude/skills/` 放修改後的 `constitution` 與 `clarify`；`.agents/skills/` 放 9 個 SDD Skill；`.agents/constitution/` 只有 `shared.md` 與 `skills/api-plan/openapi.md`；`specs/` 放 `001-online-pvp-1a2b`、`002-room-game-chat`。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3 | 本次（原始輸入） | 「這個專案還有一個要求：凡是進資料庫的資料都必須有生命週期欄位，用來稽核：什麼時候建立、什麼時候修改、修改的人是誰（存 ID），刪除一定要是軟刪除，刪除時間就叫軟刪除欄位。」 | `clarify` 提問時依題意回覆：欄位名稱用 `created_at`、`updated_at`、`updated_by`、`deleted_at`；不要求另外記錄建立人；刪除者寫入 `updated_by`；其他問題回「照推薦」 | 新建 `skills/data-plan/data-model.md`；規則要求 4 個欄位與軟刪除；有「不得」實體刪除的條文；沒有任何提到 `created_by` 或 `deleted_by` 的「不得」或「必須」條文；第一個列檔命令為 `find .agents/constitution -type f`；沒有詢問寫入位置；`shared.md` 不變；題數不超過 3 |

## 8. 驗收結果

- 結構診斷：`constitution` 為 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- 施工註記：第一次以字串比對替換 Rule 3 時，誤對到 Rule 1 範例內文的「`# Rule 3 - `」，刪掉 Rule 2；已以 `git checkout` 還原，改用行首比對重做。最終 diff 為 29 行新增、0 行刪除，Rule 1、2、4 原文不變。
- 驗收方式：S1 在 scratchpad 的 `accept33/S1` 暫存專案執行（含本次未提交修改，執行前 commit 基準狀態），子代理不帶本次分析脈絡，透過 Agent 工具指定 `model: sonnet`、`effort: medium`（Sonnet 5.5，低於主模型 Opus 5.5 的中階模型），以 `general-purpose` 執行；主 session 以 `git status` 與產出檔內容核對。
- S1 通過：
  - E1：最終檔案沒有任何提到 `created_by`、`deleted_by` 或建立人的條文。子代理第一次寫入時多寫「資料表不得要求另外記錄建立人」，P2-7 依修改後的 Rule 3 逐條驗證時發現並刪除。
  - E2：Rule 2 保留「不得」實體刪除的條文（不得以 `delete: cascade` 實體刪除子資料列、不得描述以 `DELETE` 實體刪除）。
  - E3：第一個列出憲法檔的命令為 `find .agents/constitution -type f`（同一行另有一個接 `head` 的全專案盤點）；沒有詢問寫入位置；`shared.md` 不變；`git status` 只有新建的 `skills/data-plan/data-model.md`；1 輪 3 題；Rule 結構、強度用詞與 DBML 範例符合。
- 觀察：Rule 2 的「`delete: cascade`」與「`Note` 描述 `DELETE`」是由「刪除一定要是軟刪除」推導出的禁止方式，子代理自己也標為邊界判斷；屬於使用者明確要求的禁止範圍，判定不違反 Rule 3。
- 個案驗收條件：無。

### 使用者實際驗證（2026-11-04）

- 方式：以 `user-verify-skill` 在 scratchpad 的暫存專案實跑，用 Herdr 在主 session 下方開新 pane 啟動全新的 Claude Code，測試模型為 `sonnet`（Sonnet 5.5），推理強度 `medium`。暫存專案的 `.claude/skills/` 只放 `constitution` 與 `clarify`；測試素材為 `.agents/skills/` 的 9 個 SDD Skill、`.agents/constitution/` 的 `shared.md` 與 `skills/api-plan/openapi.md`（刪除 `skills/data-plan/data-model.md`，讓 Skill 重新產生），以及 `specs/001-online-pvp-1a2b`、`specs/002-room-game-chat`。實跑需求：「這個專案還有一個要求：凡是進資料庫的資料都必須有生命週期欄位，用來稽核：什麼時候建立、什麼時候修改、修改的人是誰（存 ID），刪除一定要是軟刪除，刪除時間就叫軟刪除欄位。」，以自然語言送出，不指名 Skill。第 1 輪的紀錄目錄為 `32-sdd-skills-接入憲法/`，不通過後交由本紀錄目錄優化，第 2 輪改以本目錄為紀錄目錄。
- 權限處理：兩輪的信任資料夾都由使用者選擇「Yes, I trust this folder」。執行者沒有自行放行任何權限；測試 session 開著 auto mode，讀取憲法檔、Skill 檔與寫入憲法檔的命令（範圍都在暫存專案內）由 auto mode 自動放行。
- 結果：
  - 第 1 輪（修改前，不通過）：測試 session 自行觸發 `constitution`，以 `find .agents/constitution -type f` 列檔，落點 `skills/data-plan/data-model.md`，`clarify` 1 輪 3 題（欄位名稱、是否另外記錄建立人、刪除者記在哪裡），使用者回覆「1:1, 2:1, 3:1」。產出的 Rule 1 第 8 行「資料表不得有 `created_by` 欄位」、Rule 2 第 44 行「資料模型不得設計 `deleted_by` 欄位」，把「不要求」升級成「不得」。使用者判定不通過，交由 `skill-engineering` 優化（本紀錄目錄）。
  - 第 2 輪（修改後，通過）：測試 session 自行觸發 `constitution`，第一個命令為 `find .agents/constitution -type f`；落點相同，沒有詢問寫入位置；`clarify` 1 輪 3 題（欄位名稱、新建時 `updated_by` 怎麼處理、新建時 `updated_at` 怎麼處理），使用者回覆「1:1, 2:1, 3:1」。產出 Rule 1（`created_at`、`updated_at`、`updated_by` 必須存在且 `not null`）與 Rule 2（`deleted_at` 軟刪除，不得刪除資料列，`Ref` 不得使用 `delete: cascade`）；沒有任何提到 `created_by`、`deleted_by` 的條文；`shared.md` 不變，暫存專案只有一個新檔。
  - 核對（第 2 輪）：本藍圖 E1、E2 符合；E3 中 31 號 E1–E5、E11、E13、E14 與 32 號 E11 符合；31 號 E10 不符合（見觀察）。
- 觀察：
  - 第 2 輪的 Good／Bad Example 使用 `orders`、`order_items` 與「FR-004 建立訂單」，專案 `specs/` 沒有訂單情境，兩份 spec 的 FR-004 也與訂單無關；推論來自憲法檔樣板範例的訂單情境。屬 31 號既有問題，第 1 輪與驗收 S1 使用專案的 `chat_messages`、`rooms`，沒有出現。記入 `docs/待確認.md` 第 20 項。
  - Rule 2 的「`Ref` 不得使用 `delete: cascade`」由「刪除一定要是軟刪除」推導，Skill 在回報中主動揭露並請使用者決定是否刪除；判定屬使用者明確要求的禁止範圍。
  - 兩輪的 `clarify` 題目不同（第 1 輪問建立人與刪除者，第 2 輪問新建時兩個欄位的處理），使用者回覆格式相同。
- 結論：使用者判定第 2 輪通過；移除 `constitution` 的 `description` 開頭的「（未驗證）」，其餘文字不變；`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」。
