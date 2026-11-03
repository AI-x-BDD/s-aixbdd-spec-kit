# 交接：第三章第 18 單元「憲法」進度（2026-11-03）

給換電腦後接手的 agent 閱讀。先讀本檔，再讀 `docs/handoff/sdd-skill-憲法接入設計.md`。

## 0. 換電腦前必做（使用者或 agent 執行）

本次工作大多**尚未 commit**。換電腦前必須先 commit 並 push，否則另一台電腦拿不到：

```
 M AGENTS.md / CLAUDE.md          目錄結構加入 .agents/constitution/（W8）
 M LICENSE                        授權範圍加入 constitution
?? .agents/skills/constitution/   新 Skill（兩邊已同步）
?? .claude/skills/constitution/
?? specs/skill-engineering/31-constitution-建立/   工程藍圖（含驗收結果）
?? docs/handoff/                  本交接文件
```

- 已 commit：`bfba9e5 docs(constitution): 新增分頁、資料稽核與共用語言的範例憲法檔`。本機 `main` 比 `origin/main` 多 1 個 commit，尚未 push。
- push 前要先問使用者（CLAUDE.md 與全域規則：commit、push 前先問）。commit 訊息用 `conventional-commits` Skill。
- `/tmp/constitution-accept/S1～S7` 是驗收用的暫存複本，不需要帶走，可以刪除。

## 1. 目前在課程的位置

課程：第三章〈【基因工程】憲法終於要上了，讓所有 SDD Skill 都有專案客製化的空間！〉（chapterId 3、lessonId 18，全長 35:35）。可用 `wsa-course` MCP 的 `get_lesson_content` 取逐字稿。

| 時間 | 課程內容 | 狀態 |
|---|---|---|
| 04:08–13:39 | 下提示詞、`/clarify` 至少 5 題、回答 | ✅ |
| 13:39–22:22 | 提案、Artifact-First 寫範例、簡化（metadata、Shared、巢狀、規則格式） | ✅ |
| 22:52–23:56 | `/skill-engineering` 建立 `constitution` Skill | ✅ 子代理驗收 7/7 通過；**使用者尚未親自驗證** |
| 23:56–25:45 | 測試 `/constitution` 寫 API 分頁規則 | ⏳ 下一步候選（可用 `user-verify-skill`） |
| 26:03–28:39 | `/skill-engineering` 讓所有 SDD Skill 讀取憲法 | ⏳ 未開始；設計見 `sdd-skill-憲法接入設計.md` |
| 29:00–31:00 | 再測 `/constitution` 寫資料稽核規則 | ⏳ |
| 32:00–35:35 | 用 `002-room-game-chat` 跑 `technical-research` → `system-analysis`，檢查 DBML 稽核欄位與 API `page`／`pageSize` | ⏳ 最終驗收 |

課程與本專案的差異：分頁、稽核規則已在 Artifact-First 階段手寫成 `.agents/constitution/` 的範例（`bfba9e5`），課程是用 `/constitution` 產生。

## 2. 已完成的產出（看檔案，不在此重述）

| 產出 | 路徑 |
|---|---|
| 範例憲法檔（3 份） | `.agents/constitution/shared.md`、`skills/api-plan/openapi.md`（5 條：分頁）、`skills/data-plan/data-model.md`（2 條：生命週期欄位、軟刪除） |
| `constitution` Skill | `.agents/skills/constitution/`（SKILL.md 3 Phase／15 步、3 個 RuleFile、1 組樣板、LICENSE） |
| 工程藍圖（驗收條件 E1–E14、To-Be、約束分配、施工、驗收結果） | `specs/skill-engineering/31-constitution-建立/blueprint.md` |

## 3. 已確認的決策（只存在於對話，檔案沒有完整記錄）

### 3.1 憲法機制（使用者以 clarify 與「照建議」確認）

1. 憲法只約束各 Skill 的**產出物**，不改 SDD 流程。流程類需求（例如必須先寫測試）要開新 Skill（test-plan 等），不寫進憲法。
2. 覆寫範圍：憲法最高優先，可覆寫產出格式規則；但**不能動流程與下游追溯結構（鎖定項目）**。鎖定項目寫在各 Skill 的憲法載入步驟（一行清單），不在每條 rule 上標記。
3. 模組化：Skill 為主索引，Skill 底下一個產出物一個檔：`.agents/constitution/skills/<Skill>/<產出物>.md`；全部產出物共用的放 `shared.md`（單一檔案，不用 `shared/` 資料夾）。**不放**根目錄 `CONSTITUTION.md`、索引、Module、Pack 檔；憲法檔沒有標題與 Apply To，直接從 `# Rule 1` 開始。
4. 憲法只放一份，`scripts/sync-skills.sh` 不同步它。
5. 規則格式同 `skill-form-rule`：條列說明＋Good／Bad Example；強度用「必須／不得／應／可以」（「必須／不得」＝MUST，違反時阻擋；「應」＝SHOULD，可偏離但寫理由）。
6. 違反時：MUST 違反→能修就修，不能修時互動 Skill 委派 `clarify`，`implement` 列為受阻任務寫進完成報告；SHOULD 偏離只寫在完成回報。
7. 版本由 git 管理，不寫版本號與 Sync Impact Report。
8. `shared.md` 寫入門檻：適用全部產出物、且寫法不需依產出物改變才放；只適用部分產出物時分別寫進各檔（老師把「成功與失敗回應」移回 api-plan 的判斷）。
9. `shared.md` Rule 1 的範圍：只管「文件說明文字用繁中」；不管產品畫面文字（依 spec）與程式碼註解（依 `skills/implement/code.md`）。

### 3.2 分頁規則的數值（使用者「照建議」）

`pageSize` 預設 20、上限 100；參數不合法回 `400`＋`PAGINATION_INVALID`（不自動調整）；`page` 超過總頁數回 `200` 空 `items`；`description` 必須寫排序依據且最後一個條件是唯一欄位；保留 `totalPages`；只禁止其他參數名稱，不點名 cursor。風險已告知使用者：以後做「新的在上、無限捲動」聊天要改憲法允許 cursor。

### 3.3 `constitution` Skill 的推定條件（使用者已確認）

E9 同面向修改既有 Rule；E12 落點表外不寫入；E13 寫入前不設確認閘門；E14 clarify 最多 3 題。

## 4. 待使用者決定的事

1. **commit 與 push**（見第 0 節）。
2. 下一步順序，三選一（上次已列給使用者，尚未回答）：
   - 先 commit；
   - 用 `user-verify-skill` 親自驗證 `constitution`（對應課程 23:56）；
   - 進入課程 26:03，接入 9 個 SDD Skill（見 `sdd-skill-憲法接入設計.md`）。
3. 可選改善（未施工）：`constitution` Phase 1 步驟 1 指定以 `find .agents/constitution -type f` 列出既有憲法檔。原因：驗收 S1 子代理用 `find | head` 被截斷，誤把既有檔案覆寫（後來自行還原）。
4. 可選改善（家族 Skill，需跨專案同步，未記錄到 `docs/待確認.md`）：`skill-engineering` Phase 3 寫藍圖時先載入執行者（`skill-form-*`、`skill-derive-*`）的格式規則。原因見第 6 節的兩次施工停止。要做的話先問使用者是否記到 `docs/待確認.md`。

## 5. 單元完成後的後續（已記錄在檔案）

- 單元完成且使用者實際驗證通過後，提議打 annotated tag（CLAUDE.md 規則 6），例如 `ch3-18-constitution`，先問使用者。
- 打 tag 後提醒做 Analyze 作業：`docs/待確認.md` 第 18 項。
- `docs/待確認.md` 第 15 項（`clarify-over-specs` 是否載入憲法）在接入 9 個 Skill 時一併處理，處理完更新該項。

## 6. 踩過的坑（接手時避免重犯）

1. **description 不得含 `<` 或 `>`**：`skill-form-description` Rule 1，源自 Anthropic 官方（文件寫「Cannot contain XML tags」，官方 `skill-creator` 的 `quick_validate.py` 直接禁止角括號）。SOP 與 RuleFile 內文的 `<Skill>` 佔位符不受限。使用者對這次才發現很不滿，寫藍圖時要先檢查。
2. **`skill-derive-rule` 一次只能針對可唯一定位的單一步驟**：一個 RuleFile 不能同時服務兩個步驟；需要時拆成兩個 RuleFile。
3. **驗收情境輸入不得和 Skill 部位範例相同**（`skill-engineering` 驗收條件 Rule 4）。施工後要比對 RuleFile／樣板的範例再定情境。
4. **同步**：W8 改的是 `CLAUDE.md`，但 Skill 寫在 `.agents/`。做法是先 `cp CLAUDE.md AGENTS.md`，再 `./scripts/sync-skills.sh --from agents`，最後 `--check`。
5. **新 Skill 的 description 開頭要加「（未驗證）」**（CLAUDE.md 課程規範；使用者實際驗證後由 `user-verify-skill` 移除）。
6. 使用者偏好：先給結論、只講重點；回答用繁中並套用 ASD-STE100 寫法（CLAUDE.md「回答方式」）；不確定時要說不確定，查證後再回答；比對課程時用「已對齊／不一樣／沒辦法比」並附影片時間點。

## 7. 建議呼叫的 Skill

| 時機 | Skill |
|---|---|
| commit 訊息 | `conventional-commits` |
| 親自驗證 `constitution` | `user-verify-skill` |
| 接入 9 個 SDD Skill、或優化 `constitution` | `skill-engineering`（它會再委派 `skill-form-*`、`skill-derive-*`） |
| 寫新的憲法規則（課程 29:00 稽核規則的測試） | `constitution` |
| 最終驗收 | `technical-research` → `system-analysis`（再委派 `api-plan`、`data-plan`、`ui-plan`） |
| 比對課程內容 | `wsa-course` MCP（`search`、`get_lesson_content` chapterId 3 lessonId 18） |
| 需求不明確時 | `clarify`（`.agents/skills/clarify/`，依其 SOP 執行，不用 Skill 工具呼叫） |

模型與 effort 依 CLAUDE.md「模型與 effort（Claude Code）」：設計與根因分析在主 session（Opus、high）；驗收子代理用 Agent 工具指定 `model: sonnet`、`effort: medium`；依已確認計畫實作用 `implementer` agent。

## 8. 可直接複製使用的 prompt

### 8.1 換電腦前（在舊電腦執行）

```text
請把目前所有未 commit 的變更（constitution Skill、LICENSE、CLAUDE.md、AGENTS.md、specs/skill-engineering/31-constitution-建立/、docs/handoff/）用 conventional-commits 分成合理的 commit，先給我看 commit 訊息草稿，我確認後再 commit 並 push 到 origin/main。
```

### 8.2 新電腦開場（第一句話）

```text
請先讀 docs/handoff/README.md 與 docs/handoff/sdd-skill-憲法接入設計.md，接手第三章第 18 單元「憲法」的工作。讀完後：
1. 用 git status 與 git log 確認交接文件第 0 節的變更都已在本機（若沒有，停下來告訴我）。
2. 用三句話以內告訴我目前進度，以及第 4 節「待使用者決定的事」。
不要開始做任何修改，等我決定下一步。
```

### 8.3 親自驗證 constitution（對應課程 23:56）

```text
/user-verify-skill 驗證 constitution。紀錄目錄是 specs/skill-engineering/31-constitution-建立/。測試輸入用：「我希望查詢 API 的 Request 都要說第幾頁、每頁幾筆，Response 也要回傳第幾頁和總共幾筆」（先把測試專案的 .agents/constitution/skills/api-plan/openapi.md 刪掉，讓 Skill 重新產生）。
```

### 8.4 接入 9 個 SDD Skill（對應課程 26:03）

```text
/skill-engineering 優化 s-specify、clarify-over-specs、technical-research、system-analysis、api-plan、data-plan、ui-plan、tasks、implement，讓每個 Skill 在適當時機載入 .agents/constitution/ 的憲法，並以憲法規則作為最高優先權覆蓋自己對產出物的規範。需求輸入與已確認的方向見 docs/handoff/sdd-skill-憲法接入設計.md（鎖定項目只是初稿，要逐一對照各 Skill 的檢查腳本確認）。clarify 不修改。寫藍圖前，先讀 skill-form-description、skill-form-sop、skill-derive-rule、skill-derive-template 的 rules/，確認藍圖不違反它們（例如 description 不得含角括號、skill-derive-rule 一次只對一個步驟）。同時處理 docs/待確認.md 第 15 項。
```

### 8.5 再測 constitution：資料稽核規則（對應課程 29:00）

```text
/constitution 這個專案還有一個要求：凡是進資料庫的資料都必須有生命週期欄位，用來稽核：什麼時候建立、什麼時候修改、修改的人是誰（存 ID），刪除一定要是軟刪除，刪除時間就叫軟刪除欄位。
```

（目前 `.agents/constitution/skills/data-plan/data-model.md` 已有這兩條規則。預期 Skill 判斷為同一面向，修改既有 Rule 而不是新增；或先刪除該檔再測，比照課程。）

### 8.6 最終驗收（對應課程 32:00）

```text
請對 specs/002-room-game-chat 做 technical-research，接著做 system-analysis，一次做完全部。完成後幫我檢查：data/data-model.dbml 每張表是否有 created_at、updated_at、updated_by、deleted_at 且刪除為軟刪除；contracts/openapi.yaml 的查詢聊天歷史是否符合 .agents/constitution/skills/api-plan/openapi.md 的 5 條分頁規則。逐條列出符合與不符合。
```

### 8.7 單元收尾

```text
第 18 單元已驗證通過。請依 CLAUDE.md 規則 6 提議 annotated tag（例如 ch3-18-constitution），先給我看 tag 名稱與訊息；接著依 docs/待確認.md 第 18 項提醒我做 Analyze 作業。
```
