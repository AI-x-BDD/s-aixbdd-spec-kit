# 迭代 Runbook（OpenCode＋Gemini Argon 執行用）

- 建立日期：2026-11-08
- 適用範圍：第三題「設備借用與預約審核系統」的每一次迭代（`s-specify` → `implement`）
- 規劃依據：[第三題選題討論.md](./第三題選題討論.md)（題目、迭代內容、排程、證據保存、第四題 A/B）
- 狀態：未驗證。第 1 次迭代跑完後依實際情況修正本文件

## 0. 開工前準備（只做一次，在第 1 次迭代的 P0 之前）

### 0.1 你要先決定或完成的事

| 項目 | 狀態 | 做法 |
|---|---|---|
| 原始碼位置 | 已確認（2026-11-08） | `apps/equipment-loan/`，底下分 `frontend/`、`backend/` |
| 規劃文件 commit | 已完成（2026-11-08） | 把 `docs/dev/` 的修改 commit，讓第 1 次迭代從乾淨的 `git status` 開始 |
| 憲法增補要加哪幾條 | 待決定 | 看 P1 列的 3 條（權限錯誤格式、時間與時區、唯一性與歷程），刪掉不要的再貼 |
| Discord 伺服器與 Webhook | 不急 | 通知迭代前建好通知頻道與 Webhook URL。第 1 次迭代用不到 |

### 0.2 環境檢查（2026-11-08 已在本機確認）

| 項目 | 結果 | 備註 |
|---|---|---|
| OpenCode | 1.19.5 | 用 Build agent，模型選 Gemini 4 Argon、effort high |
| `uv` | 0.12.1 | Planner、`tasks`、`analyze`、`implement` 的檢查腳本要用 |
| Node.js | 26.8.2 | 1A2B 用 Node.js 24 LTS。第 1 次迭代的 `technical-research` 決定版本；決定的版本和本機不同時，要先切換版本再跑 P8 |
| Docker、Docker Compose | 29.9.2、v5.6.1 | PostgreSQL 用 |
| Skill 兩邊同步 | `scripts/sync-skills.sh --check` 回報「兩邊一致」 | 每次迭代開始前再跑一次 |
| `.gitignore` | 根目錄只忽略 `docs/tmp/`、`.DS_Store` | 第 1 次迭代的 `implement` 要建立 `apps/equipment-loan/` 的 `.gitignore`（`node_modules/`、`.env`、建置產出）。P8 之後檢查 `.env` 與 `node_modules/` 沒有被 commit |

### 0.3 換電腦接力

途中可能換到另一台電腦執行。接力靠 git，但有些東西不在 git 裡，要在每台電腦各準備一次。

#### 不在 git 裡、每台電腦都要準備的東西

| 項目 | 位置 | 沒準備時會怎樣 | 做法 |
|---|---|---|---|
| Argon API 設定 | `~/.config/opencode/`（OpenCode 的 provider 設定） | 新電腦無法用 Argon | 在新電腦設定同一個 Argon API。API 到期日一樣是 2026-11-26 |
| git hooks（pre-commit、pre-push 的外洩掃描） | `~/dotfiles/git/hooks`，由全域 `core.hooksPath` 指定 | commit 時不掃描機密，Webhook URL 等可能被 commit 進去 | 新電腦也安裝 dotfiles，確認 `git config --global core.hooksPath` 有值 |
| 全域 git 忽略規則 | `~/.config/git/ignore`（目前忽略 `.claude/settings.local.json`） | 個人設定檔可能被 commit | 新電腦也安裝同一份 |
| `.env` | `apps/equipment-loan/` 下（Webhook URL、資料庫連線） | 程式無法連資料庫或送通知 | 依 `.env.example` 在新電腦重建。Webhook URL 不要用聊天或 git 傳，從 Discord 頻道設定重新複製 |
| 資料庫資料 | Docker volume | 新電腦是空資料庫 | 跑 migration 與 demo seed 重建。不搬資料庫 |
| `node_modules/` | 各專案目錄 | 程式跑不起來 | 依 lockfile 重新安裝 |
| `docs/tmp/` | repo 內，被 git 忽略 | 課程筆記等暫存檔不會跟過去 | 需要時另外複製。runbook 流程不依賴它 |
| Claude Code 記憶與全域指引 | `~/.claude/CLAUDE.md`、`~/.claude/projects/<專案路徑>/memory/` | 新電腦的 Claude Code 不知道之前的偏好（例如一律用繁體中文） | 複製這兩處。記憶目錄的名稱由專案的絕對路徑決定，兩台電腦的專案路徑不同時，要放到新路徑對應的目錄 |
| 全域 Skills | `~/.claude/skills/`、`~/.agents/skills/`、`~/.config/opencode/skills/` | 不影響本流程：runbook 一律用路徑指定專案 Skill | 不需要處理 |

#### 兩台電腦的工具版本要一致

| 工具 | 本機版本（2026-11-08） | 規則 |
|---|---|---|
| OpenCode | 1.19.5 | 兩台用同一版 |
| `uv` | 0.12.1 | 兩台用同一版 |
| Node.js | 26.8.2 | 以 `techstack.md` 決定的版本為準，兩台都切換到那一版 |
| Docker、Docker Compose | 29.9.2、v5.6.1 | 大版本相同即可 |
| 作業系統 | macOS | 另一台是 Windows 時，`scripts/sync-skills.sh` 與 hook 腳本是 bash，要在 WSL 或 Git Bash 裡執行 |

#### 什麼時候可以換

1. **只在檢查點之後換。** 換之前確認 `git status` 乾淨，迭代紀錄 `docs/iterations/iter-<N>.md` 已 commit。
2. **換之前 push，換之後 pull。** 這是接力唯一的傳遞方式。push 由你執行或明確同意。
3. **通知迭代的 A/B 要在同一台電腦做完。** A、B 兩組的 git worktree 只存在本機，不會跟著 git 過去。必須換電腦時，先把兩組各自 commit 到自己的 branch 再 push。
4. **OpenCode session 不會跟過去。** 新電腦開新 session，用 P0r 接續。
5. **換電腦算環境變動。** 在迭代紀錄的「固定環境」記下：哪一台電腦、工具版本、從哪一步接續。

#### 新電腦第一次接手的檢查

1. `git pull`，確認 `git log -1` 和舊電腦最後一個 commit 相同。
2. `scripts/sync-skills.sh --check`，確認「兩邊一致」。
3. 確認上表工具版本一致。
4. 確認 `git config --global core.hooksPath` 有值。
5. 重建 `.env`，跑 migration 與 demo seed，確認程式能啟動。
6. 開 OpenCode，確認模型是 Gemini 4 Argon、effort high、Build agent。
7. 貼 P0r。

### 0.4 開工順序

1. 完成 0.1 的前三項。換到另一台電腦開工時，先做 0.3「新電腦第一次接手的檢查」。
2. 跑 `scripts/sync-skills.sh --check`，確認「兩邊一致」。
3. 在 repo 根目錄開 OpenCode，選 Build agent 與 Gemini 4 Argon。
4. 照 9.6「第 1 次迭代的貼上順序」，從 P0 開始貼。P0 會建立 `docs/iterations/` 與 `iter-1.md`。

第 1 次迭代和之後不同的地方：

- 要先跑 P1（憲法增補），再跑 P2。
- P5 用「第 1 次迭代」版，`clarify` 會問你視覺風格。這次選定的風格，之後每次沿用。
- 專案骨架（`apps/equipment-loan/` 的目錄、套件、docker-compose、demo seed）不另外手動建立，由 `tasks.md` 的 Setup Phase 列出，P8 的 `implement` 建立。

## 1. 角色分工

| 角色 | 工具與模型 | 負責 | 不負責 |
|---|---|---|---|
| 執行者 | OpenCode＋Gemini 4 Argon（下稱 Argon） | 依本 runbook 跑完一次迭代的所有步驟；寫迭代紀錄；記錄 Skill 的問題與證據 | 修改任何 Skill（`.claude/skills/`、`.agents/skills/`）；自行決定產品規則 |
| 規劃、Skill 優化與最後報告 | Claude Code（Opus）、Codex | 排程調整；`skill-engineering` 根因分析與優化；第四題新 Skill 的設計。最後報告與內容由 Claude Code 負責：SDD 流程不足總整理、第四題前後比較報告、影片旁白稿與鏡頭清單、提交前核對 | 代替使用者做實際驗證；跑迭代的 `s-specify` → `implement` |
| 使用者 | — | 回答 `clarify` 的問題；同意覆寫；實際操作驗證；同意 commit 與 tag | — |

Argon 發現 Skill 問題時，只記錄問題與證據，交給 Claude Code 用 `skill-engineering` 處理（見第 6 節）。理由：專案規則規定 Skill 設計與根因分析由 Opus 在主 session 執行，修改 Skill 後還要同步兩邊目錄。

## 2. OpenCode 環境須知

OpenCode 和 Claude Code、Codex 的差異如下。開始第 1 次迭代前確認一次。

| 項目 | OpenCode 的行為 | 對本專案的影響 |
|---|---|---|
| 規則檔 | 從工作目錄往上找 `AGENTS.md`；同目錄已有 `AGENTS.md` 時，不讀 `CLAUDE.md` | 讀的是 `AGENTS.md`，內容和 `CLAUDE.md` 同步，規則相同 |
| 回答方式提醒 | `scripts/hooks/answer-style.sh` 只接在 Claude Code 與 Codex，OpenCode 不執行 | 回答方式只靠 `AGENTS.md` 的「回答方式」一節 |
| Skill 載入位置 | 同時載入專案的 `.claude/skills/`、`.agents/skills/`，以及全域的 `~/.claude/skills/`、`~/.agents/skills/`、`~/.config/opencode/skills/`。同名時後載入的優先：專案 `.agents/skills/` 比全域 `.claude/skills/`、`.agents/skills/` 優先 | 全域也有一支同名但內容不同的 `implement`。為避免載錯，**每一步都用路徑指定 Skill**：「讀取 `.agents/skills/<name>/SKILL.md` 並依其 SOP 執行」 |
| `clarify` 提問 | `clarify` 規定直接在對話中輸出問題，不使用 Ask 工具 | 使用者直接在對話中回答 |
| 子代理 | `system-analysis` 依 Wave 平行委派 Planner 子代理；OpenCode 用 Task 工具開子代理 | 子代理預設用同一個模型（Argon）。子代理停止或沒產出時，`system-analysis` 會記為未完成，要檢查回報 |
| 腳本 | `api-plan`、`data-plan`、`ui-plan`、`tasks`、`analyze`、`implement` 用 `uv run --script` 跑檢查腳本 | 本機已安裝 `uv` 0.12.1 |
| 權限 | 存取工作目錄以外的路徑時，跳出 external directory 權限確認 | 所有工作檔放在 repo 內。暫存檔放 `docs/tmp/`（已被 git 忽略） |
| 不適用的設定 | `.claude/agents/`（`implementer`、`skill-tester`）、`.codex/model-routing.md` 只給 Claude Code、Codex 用 | Argon 不使用這些設定 |

來源：OpenCode 官方文件 Skills、Rules、Permissions（以 Context7 查詢 `anomalyco/opencode`，2026-11-08）；本機 OpenCode 1.19.5。

## 3. 固定約定

| 項目 | 約定 |
|---|---|
| 原始碼位置 | `apps/equipment-loan/`，底下放 `frontend/`、`backend/`（使用者 2026-11-08 確認）。`docker-compose.yml`、啟動說明 `README.md`、跨前後端的 e2e 測試放在 `apps/equipment-loan/` 這一層。第 1 次迭代時，在 `technical-research` 與 `system-analysis` 以技術限制提供，讓 `plan.md` 的專案結構照這個位置寫 |
| spec 目錄 | `s-specify` 每次自動建新目錄 `specs/<NNN>-<short-name>/`，編號為現有最大編號加一。一次迭代一個 spec 目錄。目前最大編號 002，第 1 次迭代預期為 003 |
| 迭代紀錄 | `docs/iterations/iter-<N>.md`，格式見第 7 節。每一步結束就寫，不等迭代結束才補 |
| Skill 問題交接 | 寫在當次迭代紀錄的「Skill 問題」一節，格式見第 7 節 |
| commit | 依 `conventional-commits` Skill 撰寫訊息。在第 4 節標出的檢查點 commit。使用者在開場提示詞同意後，Argon 才可以自行 commit |
| tag | 依專案規則：使用者驗證通過後才提議，使用者同意才打。不 push |
| 不讀的目錄 | `.spec-kit/`、`specs/001-photo-album-organizer/`（參考素材，使用者要求時才讀） |

## 4. 一次迭代的步驟

每一步都寫成：要做什麼、給 Skill 的輸入、產出、使用者要做的事、結束後的檢查。每一步可以直接貼上的提示詞見第 9 節。

### 步驟 0：準備

1. 確認 `git status` 乾淨，沒有未 commit 的修改。
2. 讀本 runbook、[第三題選題討論.md](./第三題選題討論.md) 的「第一推薦 A+ 的迭代計畫」與第 5 節本次迭代的備註。
3. 讀上一次迭代的紀錄 `docs/iterations/iter-<N-1>.md`（第 1 次迭代略過）。
4. 依第 7 節樣板建立 `docs/iterations/iter-<N>.md`，填入本次功能與開始時間。

### 步驟 1（視需要）：`constitution`

1. 什麼時候跑：
   - 第 1 次迭代開始前，處理「憲法可考慮的增補」（權限錯誤回應格式、時間表示與時區、唯一性約束與歷程保留）。使用者同意要加哪幾條才跑。
   - 任何一步發現「之後每次迭代都要遵守的共同規則」時。
2. 不跑的情況：產品規則（例如待審是否占位）寫進 spec，不寫進憲法。要改流程或步驟時，交給 Claude Code 的 `skill-engineering`。
3. 產出：`.agents/constitution/` 下的憲法檔；`constitution` 回報的衝突位置。
4. 檢查點：commit `docs(constitution): ...`。

### 步驟 2：`s-specify`

1. 指令：「讀取 `.agents/skills/s-specify/SKILL.md` 並依其 SOP 執行。功能描述：<本次功能>」。
2. 功能描述要寫：
   - 本次功能（取自第 5 節）。
   - 既有系統：第 2 次迭代起寫「延續 `specs/<上一次 spec 目錄>/` 已實作的系統，程式在 `apps/equipment-loan/`」。
3. 使用者要做的事：回答 `clarify` 的問題。
4. 產出：`specs/<NNN>-<short-name>/spec.md`。
5. 結束後的檢查：
   - 對照第 5 節「本次要觀察的規則」，記下 `clarify` 有沒有問到。沒問到的寫進迭代紀錄的「Skill 問題」。
   - 記下 spec.md 的「推定需求」與「未確認事項」數量。

### 步驟 3（視需要）：`clarify-over-specs`

1. 什麼時候跑：spec.md 有「推定需求」或「未確認事項」，或第 5 節列的規則在步驟 2 沒被問到。
2. 指令：「讀取 `.agents/skills/clarify-over-specs/SKILL.md` 並依其 SOP 執行，目標 spec：`specs/<NNN>-<short-name>/spec.md`」。題數沒指定時預設 5 題。
3. 使用者要做的事：回答問題。
4. 產出：更新後的 spec.md（Clarifications 一節）。
5. 檢查點（步驟 2～3 結束）：commit `docs(specs): ...`。

### 步驟 4：`technical-research`

1. 指令：「讀取 `.agents/skills/technical-research/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>。技術限制：<見下>」。
2. 技術限制要寫：
   - 第 1 次迭代：以 `specs/001-online-pvp-1a2b/techstack.md` 為研究起點，原始碼放 `apps/equipment-loan/`，外部通知用 Discord Webhook（通知迭代才用到）。
   - 第 2 次迭代起：沿用上一次迭代的 `techstack.md`，只研究本次新增的技術主題。
3. 使用者要做的事：同意覆寫（若跳出）；回答技術限制衝突的問題。
4. 產出：`research.md`、`techstack.md`。
5. 結束後的檢查：本次新增的技術主題都有決策；沒有直接照抄上一次的結論而不寫理由。

### 步驟 5：`system-analysis`（含 Planner）

1. 指令：「讀取 `.agents/skills/system-analysis/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
2. 視覺風格：第 1 次迭代由 `clarify` 決定。第 2 次迭代起，在指令中寫明「沿用 `specs/<第 1 次 spec 目錄>/ui/plan.md` 的視覺風格」，避免每次重選。
3. 使用者要做的事：同意覆寫；回答憲法衝突或視覺風格的問題。
4. 產出：`plan.md`；Planner 依 Wave 產出 `contracts/`（`api-plan`）、`data/data-model.dbml`（`data-plan`）、`ui/`（`ui-plan`）。
5. 結束後的檢查：
   - 每個 Planner 都有產出，或回報了停止原因。
   - `plan.md` 中標為「沒有 Planner」的端點，記進迭代紀錄（第四題的證據）。
   - 各 Planner 的檢查腳本結果。
6. 檢查點（步驟 4～5 結束）：commit `docs(specs): ...`。

### 步驟 6：`tasks`

1. 指令：「讀取 `.agents/skills/tasks/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
2. 使用者要做的事：同意覆寫（若跳出）。
3. 產出：`tasks.md`。
4. 結束後的檢查：
   - 第 2 次迭代起，有沒有舊資料遷移與舊功能回歸的任務。
   - 有沒有擴充 demo seed 的任務。沒有時記進「Skill 問題」，並在步驟 9 手動補。
   - Notes 的待確認項目數量。

### 步驟 7：`analyze`

1. 指令：「讀取 `.agents/skills/analyze/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
2. 產出：`analysis.md`。
3. 有 CRITICAL 時：
   1. 依 `analysis.md` 標出的處理 Skill 修正上游文件（例如 `api-plan`、`tasks`）。
   2. 重跑 `analyze`。
   3. 在迭代紀錄寫下：問題、哪支 Skill 修、重跑結果。
4. 檢查點（步驟 6～7 結束）：commit `docs(specs): ...`。

### 步驟 8：`implement`

1. 指令：「讀取 `.agents/skills/implement/SKILL.md` 並依其 SOP 執行，目標 tasks：<路徑>」。一定要用路徑指定，全域有一支同名的 `implement`。
2. `implement` 全程不向使用者提問。上游矛盾與受阻由它自己決策，寫進完成報告。
3. 產出：`apps/equipment-loan/` 的程式碼與測試；更新後的 `tasks.md`；完成報告。
4. 結束後的檢查：
   - 完成報告中的受阻任務與自行決策，逐條記進迭代紀錄。
   - 測試全部通過。
5. 檢查點：每個 Phase 結束 commit 一次 `feat(...)` 或 `fix(...)`。

### 步驟 9：使用者驗證

1. Argon 寫出啟動方式與驗證情境（成功操作、關鍵失敗、舊功能回歸）。
2. 確認 demo seed 可以重設本次的展示資料。
3. 使用者實際操作驗證。成員與管理員各用一個瀏覽器視窗（一般視窗、無痕視窗）。
4. 在迭代紀錄寫下：驗證的 commit SHA、情境、結果、使用者回饋。

### 步驟 10：檢查 Skill 的表現

1. 填迭代紀錄的「Skill 表現檢查」表（第 7 節）。
2. 每個問題先分類：需求缺漏、程式錯誤、Skill 缺陷。
   - 需求缺漏：回到 `clarify-over-specs` 或下一次迭代處理。
   - 程式錯誤：修程式。
   - Skill 缺陷：進步驟 11。
3. 沒有證據就不算 Skill 缺陷。沒有發現問題時，如實寫「沒有」，不為了作業硬找問題。
4. 錯誤產出會被覆寫前，先保存到迭代紀錄，或先 commit。

### 步驟 11：Skill 優化交接

1. Argon 在迭代紀錄的「Skill 問題」一節，依第 7 節格式寫下問題與證據。Argon 不改 Skill。
2. 使用者把問題交給 Claude Code，用 `skill-engineering` 處理：根因分析 → 使用者確認 → 修改 → 同步 → 驗收。
3. 優化的 commit 訊息要有 5 個欄位（第 7 節）。
4. 優化完成後，回到 OpenCode，用修改後的 Skill 重跑受影響的步驟，把重跑結果寫進迭代紀錄。

### 步驟 12：收尾

1. 更新迭代紀錄的「影片素材清單」與「流程不足」。
2. 檢查點：commit `docs(iterations): ...`。
3. 使用者驗證通過時，提議打 tag，使用者同意才打。

## 5. 各次迭代的備註

| 次 | 本次功能 | 本次要觀察的規則（`clarify` 有沒有問到） | 備註 |
|---|---|---|---|
| 1 | 成員登入、查看預建設備、預約固定時段與取消 | 設備與預約單位（單一組織、單件設備、單日固定時段）；同時搶同一時段 | 先做步驟 1 的憲法增補；決定視覺風格；建立專案骨架與 demo seed；帳號為預建的成員與管理員 |
| 2 | 管理員把指定設備改成人工審核，並處理申請 | 待審是否占用時段；引入審核後舊預約怎麼處理 | 要有舊資料遷移與前一次的回歸 |
| 3 | 管理員登記領取與歸還，成員查看借用狀態 | 預約與借用的狀態轉移限制 | 檢查 API 與 UI 對「可操作狀態」的定義是否一致 |
| 4 | 成員申請改期，改期成功前保留原預約 | 改期失敗時原預約如何保留；重新審核 | 第 13 天閘門：決定走 6 次或 5 次路徑；確認第四題方向；選 1 個影片用的 Skill 優化案例 |
| 5 | 設備送修或停用、恢復可用，處理受影響的未來預約 | 送修時受影響預約的處理；停用與刪除的差別 | 只在 6 次路徑做；預估 2 天 |
| 6（通知迭代） | 系統辨識逾期借用（可手動觸發），呼叫 Discord 通知，管理員查看結果與重試 | 逾期檢查要能手動觸發；通知失敗、逾時、重複的處理 | 依第 8 節的 A/B 流程跑；Webhook URL 放 `.env`，不 commit。5 次路徑時，這次改成第 5 次 |
| 7（餘裕） | 候補與限時確認 | 候補順序與確認期限 | 通知迭代完成、還有時間才做 |

迭代次數：目標 6 次、保底 5 次。詳細理由與兩條路徑見 [第三題選題討論.md](./第三題選題討論.md) 的「迭代次數（第三次修正）」。

## 6. Argon 的可用期限

1. Argon API 預計 2026-11-26 到期。Argon 執行的工作要在 **2026-11-25** 前結束。
2. 第 1 天是 2026-11-08 或 11-09，所以第 18 天是 11-25 或 11-26。依 6 次路徑，Argon 執行第 1～5 次迭代，以及通知迭代的步驟 2～5（第 16 天）。走 5 次路徑時，Argon 執行第 1～4 次迭代與通知迭代的步驟 2～5（第 14 天）。
3. 到期後由 **Claude Code** 接手執行（使用者 2026-11-08 決定），步驟與紀錄方式不變，迭代紀錄的「執行者」改寫 Claude Code 與模型名稱。
4. 第四題 A/B 比較的 A、B 兩組要用同一個模型。B 組一定在到期後才跑，所以 **A 組的步驟 6～7 也由 Claude Code 跑**，不由 Argon 跑。兩組使用同一個 Claude 模型與 effort，開跑時記進迭代紀錄。
5. 通知迭代之前的迭代與通知迭代的執行模型不同。Skill 表現的差異可能來自模型，不一定來自 Skill。整理流程不足時要標出這一點。

## 7. 樣板

### 7.1 迭代紀錄 `docs/iterations/iter-<N>.md`

```markdown
# 迭代 <N>：<本次功能>

- spec 目錄：specs/<NNN>-<short-name>/
- 執行者：OpenCode＋Gemini 4 Argon
- 開始／結束：<日期>／<日期>

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | <哪一台> |
| 執行工具與版本 | OpenCode 1.19.5，Build agent |
| 模型與 effort | Gemini 4 Argon，high |
| Skill 版本（開始時） | <commit SHA> |
| 中途變動 | <沒有／時間、變動內容、新的 commit SHA> |
| 臨時改寫的提示詞 | <沒有／實際貼的內容> |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 2 | s-specify | spec.md | 回答 3 題 | 沒問到「待審是否占位」 | <SHA> |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|

## Skill 問題（交給 skill-engineering）

### 問題 <編號>：<Skill 名稱>

- 發生了什麼：
- 原本預期：
- 證據：<檔案路徑、行號、對話摘錄或 commit SHA>
- 影響：
- 處理結果：<由 Claude Code 填：優化 commit SHA、重跑結果>

## 使用者驗證

- commit SHA：
- 情境與結果：
- 使用者回饋：

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
```

### 7.2 Skill 優化的 commit 訊息

```text
fix(<skill>): <一句話說明修改>

- 問題：<哪一支 Skill 發生了什麼問題>
- 預期：<原本預期它產出什麼>
- 根因：<判斷的根因>
- 修改部位：<SKILL.md 的哪一步、哪個 rules／templates／scripts 檔>
- 重跑結果：<修改後再次執行的結果>
- 紀錄：docs/iterations/iter-<N>.md 問題 <編號>
```

## 8. 通知迭代的 A/B 流程

詳細設計見 [第三題選題討論.md](./第三題選題討論.md) 的「A/B 比較設計」與「當下必須保存的證據」。執行順序：

1. 6 次路徑第 16 天（5 次路徑第 14 天）：跑步驟 2～5，commit，記下這個 commit SHA 作為共用起點。
2. 從共用起點建立兩個 git worktree：A 組、B 組。兩組用同一個模型設定。
3. A 組：由 Claude Code 在 A 組 worktree 跑步驟 6～7（`tasks`、`analyze`），理由見第 6 節。產出先存在 A 組 worktree，不放進主目錄。
4. 6 次路徑第 17～18 天（第 14～15 天先平行做根因分析與藍圖）；5 次路徑第 15～17 天：Claude Code 用 `skill-engineering` 建第四題的新 Skill，並修改 `tasks`、`analyze` 接入。
5. B 組：由 Claude Code 用與 A 組相同的模型設定，在 B 組 worktree 跑新 Skill，再跑步驟 6～8。
6. 兩組都跑完後，把原始產出歸檔到 `docs/ab-test/group-a/`、`docs/ab-test/group-b/`，附上模型設定與 Skill 版本（commit SHA）。歸檔後不再修改。
7. 只把 B 組的實作合併回主線，繼續步驟 9～12。

## 9. 可直接貼上的提示詞

### 9.0 階段對照與固定環境

#### 第三題要求的階段，對應到本 runbook

| 第三題的階段 | 本 runbook 步驟 | 提示詞 | 何時跑 |
|---|---|---|---|
| （準備） | 步驟 0 | P0 | 每次 |
| `/constitution` | 步驟 1 | P1 | 第 1 次；之後發現共同規則時 |
| `/specify` | 步驟 2 | P2 | 每次 |
| `/clarify` | 步驟 3（`clarify-over-specs`）；其他步驟中由 Skill 自動委派 | P3 | 需求不清楚時 |
| `/technical-research` | 步驟 4 | P4 | 每次 |
| `/system-analysis` | 步驟 5 | P5 | 每次 |
| `/api-plan`、`/data-plan`、`/ui-plan` | 步驟 5 內，由 `system-analysis` 依 Wave 委派 | P5（自動）；P5b（單獨重跑） | 每次；某個 Planner 停止或產出有問題時用 P5b |
| `/tasks` | 步驟 6 | P6 | 每次 |
| `/analyze` | 步驟 7 | P7；P7b（修 CRITICAL） | 每次 |
| `/implement` | 步驟 8 | P8 | 每次 |
| 使用者驗證 | 步驟 9 | P9 | 每次 |
| 檢查 Skill 是否照預期工作 | 步驟 10 | P10 | 每次 |
| `/skill-engineering` 優化 | 步驟 11 | P11（Claude Code）、P11b | 有 Skill 缺陷時 |
| 收尾 | 步驟 12 | P12 | 每次 |

#### 固定環境

每次迭代都固定下列項目，並在 P0 記進迭代紀錄。中途有變動時，也要記下來。目的：Skill 表現有差異時，能分辨是 Skill 改了，還是環境改了。

| 項目 | 固定值 | 變動時 |
|---|---|---|
| 電腦 | 開始時用的電腦 | 換電腦時，記下哪一台、工具版本、從哪一步接續（見 0.3） |
| 執行工具 | OpenCode 1.19.5，Build agent | 記下新版本 |
| 模型與 effort | Gemini 4 Argon，high | 記下新設定。Argon 到期後改 Claude Code，記下模型與 effort |
| Skill 版本 | 開始時 `git rev-parse --short HEAD` 的 commit SHA | 步驟 11 優化後，記下新的 commit SHA 與改了哪支 Skill |
| session | 每次迭代開一個新 session，從 P0 開始 | 中途重開 session 時，記下從哪一步接續 |
| 提示詞 | 本節 9.5 的提示詞，只換 9.2 的變數 | 臨時改寫提示詞時，把實際貼的內容記進迭代紀錄 |
| 功能描述與技術限制 | 9.3、9.4 的內容 | 臨時修改時，把實際內容記進迭代紀錄 |

### 9.1 使用方式

1. **一步一個提示詞。** 每次只貼一個提示詞，等 Argon 回報、你處理完確認閘門（回答 `clarify`、同意覆寫）之後，再貼下一個。理由：每支 Skill 都有需要你回答的閘門；一次貼整個迭代，Argon 容易跳過閘門或自己替你決定。
2. **提示詞固定，只換變數。** 每次迭代都用同一組提示詞，只替換 9.2 的變數。這樣每次迭代的執行方式一致，Skill 表現的差異才能比較。
3. **功能描述不寫答案。** 9.3 的功能描述故意不寫第 5 節「本次要觀察的規則」的答案（例如待審是否占位），讓 `clarify` 有機會主動問。如果把答案寫進描述，就觀察不到 `clarify` 有沒有問。
4. 每次迭代開新的 OpenCode session，從 P0 開始。

### 9.2 變數

| 變數 | 意思 | 例子 |
|---|---|---|
| `{N}` | 第幾次迭代 | `1` |
| `{FEATURE}` | 本次功能描述，取自 9.3 | — |
| `{SPEC_DIR}` | 本次 spec 目錄，P2 跑完後由 `s-specify` 決定 | `specs/003-equipment-booking` |
| `{PREV_SPEC_DIR}` | 上一次迭代的 spec 目錄；第 1 次寫「無」 | `specs/003-equipment-booking` |
| `{FIRST_SPEC_DIR}` | 第 1 次迭代的 spec 目錄（視覺風格來源） | `specs/003-equipment-booking` |
| `{TECH}` | 本次技術限制，取自 9.4 | — |

### 9.3 各次迭代的功能描述（`{FEATURE}`）

| 次 | `{FEATURE}` |
|---|---|
| 1 | 我要做一個設備借用與預約系統。成員用帳號密碼登入後，可以看到可借用的設備清單，選一台設備和一個時段來預約，也可以取消自己的預約。管理員也用帳號密碼登入。帳號先用預先建好的測試帳號，不做註冊。 |
| 2 | 延續 `{PREV_SPEC_DIR}` 已實作的系統，程式在 `apps/equipment-loan/`。管理員可以把指定的設備設定成需要人工審核。成員預約這類設備後，要等管理員核准或駁回。管理員有一個待審清單可以處理申請。 |
| 3 | 延續 `{PREV_SPEC_DIR}` 已實作的系統，程式在 `apps/equipment-loan/`。成員到現場領取設備時，由管理員在系統登記領取；歸還時，由管理員登記歸還。成員可以在系統查看自己借用中的設備和目前狀態。 |
| 4 | 延續 `{PREV_SPEC_DIR}` 已實作的系統，程式在 `apps/equipment-loan/`。成員可以申請把自己的預約改到另一個時段。改期成功之前，原本的預約要保留。 |
| 5（6 次路徑） | 延續 `{PREV_SPEC_DIR}` 已實作的系統，程式在 `apps/equipment-loan/`。管理員可以把設備設成送修或停用，也可以恢復成可用。設備送修或停用時，已經排在未來的預約要處理。 |
| 通知迭代（6 次路徑第 6 次；5 次路徑第 5 次） | 延續 `{PREV_SPEC_DIR}` 已實作的系統，程式在 `apps/equipment-loan/`。借用的設備超過歸還時間還沒歸還時，系統要發 Discord 通知提醒管理員。管理員可以看到每則通知有沒有送出成功，送出失敗的可以重送。管理員也可以手動執行一次逾期檢查。 |
| 7（餘裕） | 延續 `{PREV_SPEC_DIR}` 已實作的系統，程式在 `apps/equipment-loan/`。設備的時段已經被預約時，成員可以加入候補。前面的預約取消後，候補的成員可以在一段時間內確認要不要接手這個時段。 |

### 9.4 各次迭代的技術限制（`{TECH}`）

| 次 | `{TECH}` |
|---|---|
| 1 | 以 `specs/001-online-pvp-1a2b/techstack.md` 的技術堆疊作為研究起點，但每項都要寫出本系統採用的理由並重新查證版本。原始碼放在 `apps/equipment-loan/`，底下分 `frontend/`、`backend/`。需要帳號密碼登入與工作階段（1A2B 沒有，要重新研究）。除非需求需要即時推播，否則不引入 Socket.IO。 |
| 2～5、7 | 沿用 `{PREV_SPEC_DIR}/techstack.md`，只研究本次新增的技術主題。原始碼位置不變。 |
| 通知迭代 | 沿用 `{PREV_SPEC_DIR}/techstack.md`。本次新增主題：逾期檢查的排程方式；呼叫 Discord Webhook（用 `?wait=true` 確認送達，處理 `429` 與 `Retry-After`）；可切換成功、`429`、`5xx`、逾時的本機模擬器；Webhook URL 放在 `.env`，不 commit，log 不印完整 URL。 |

### 9.5 提示詞

#### P0 開場（每次迭代開新 session 時貼）

```text
我們要執行第三題第 {N} 次迭代。請先讀 docs/dev/迭代-runbook.md 全文，再做第 4 節的步驟 0（準備）。
規則：
- 每一步只做我貼給你的那一步，做完就停下來等我貼下一步。
- 每一步都用路徑指定 Skill：讀取 .agents/skills/<name>/SKILL.md 並依其 SOP 執行，不用同名的全域 Skill。
- 不修改任何 Skill（.claude/skills/、.agents/skills/）。發現 Skill 問題時，依 runbook 第 7 節格式記進 docs/iterations/iter-{N}.md。
- 我同意你在 runbook 第 4 節標出的檢查點自行 commit，commit 訊息依 .agents/skills/conventional-commits/SKILL.md。不 push、不打 tag。
- 每一步結束時，用 3 行以內回報：產出、問題、下一步。
- 用繁體中文回覆。
本次資料：
- 本次功能：見 runbook 9.3 第 {N} 列
- 上一次 spec 目錄：{PREV_SPEC_DIR}
做步驟 0 時，依 runbook 9.0「固定環境」，把執行工具版本、模型與 effort、Skill 版本（git rev-parse --short HEAD）寫進 docs/iterations/iter-{N}.md 的開頭。
```

#### P0r 接續（換電腦、或中途重開 session 時貼）

```text
我們要接續第三題第 {N} 次迭代。請先讀 docs/dev/迭代-runbook.md 全文，再讀 docs/iterations/iter-{N}.md。
規則與 P0 相同（一步只做我貼的那一步；用路徑指定 Skill；不改 Skill；檢查點可 commit、不 push、不打 tag；3 行回報；繁體中文）。
請做這幾件事，然後停下來等我貼下一步：
1. 依 iter-{N}.md 的步驟紀錄，告訴我最後完成的步驟與下一步。
2. 確認 git status 乾淨、最後一個 commit 與 iter-{N}.md 記錄的一致。
3. 在 iter-{N}.md 的「固定環境」記下這次接續：電腦、OpenCode 版本、模型與 effort、目前 commit SHA、從哪一步接續。
本次資料：
- 本次 spec 目錄：{SPEC_DIR}
- 上一次 spec 目錄：{PREV_SPEC_DIR}
```

#### P1 憲法增補（只在第 1 次迭代，或發現共同規則時）

```text
請做 runbook 步驟 1：讀取 .agents/skills/constitution/SKILL.md 並依其 SOP 執行。
本次要加入的規則：
1. API 的權限錯誤回應格式（未登入與權限不足要分開）。
2. 時間的表示方式與時區。
3. 資料模型的唯一性約束與歷程保留。
缺少的細節依 SOP 委派 clarify 問我。完成後，依 runbook 步驟 1 的檢查點 commit。
```

第 1 次以後發現共同規則時，把「本次要加入的規則」換成那條規則。

#### P2 `s-specify`

```text
請做 runbook 步驟 2：讀取 .agents/skills/s-specify/SKILL.md 並依其 SOP 執行。
功能描述：{FEATURE}
完成後告訴我 spec 目錄路徑，並依步驟 2 的「結束後的檢查」，對照 runbook 第 5 節第 {N} 列「本次要觀察的規則」，寫進 docs/iterations/iter-{N}.md。
```

#### P3 `clarify-over-specs`（P2 回報有推定需求、未確認事項，或有規則沒被問到時）

```text
請做 runbook 步驟 3：讀取 .agents/skills/clarify-over-specs/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
題數：5 題。優先處理 docs/iterations/iter-{N}.md 中「沒被問到的規則」。
完成後依步驟 3 的檢查點 commit。
```

不跑 P3 時，貼：

```text
本次不跑 clarify-over-specs，理由：<P2 沒有推定需求、未確認事項，第 5 節的規則都已問到>。請把理由寫進 docs/iterations/iter-{N}.md，然後做步驟 2～3 的檢查點 commit。
```

#### P4 `technical-research`

```text
請做 runbook 步驟 4：讀取 .agents/skills/technical-research/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
技術限制：{TECH}
完成後依步驟 4 的「結束後的檢查」回報。
```

#### P5 `system-analysis`（含 Planner）

第 1 次迭代：

```text
請做 runbook 步驟 5：讀取 .agents/skills/system-analysis/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
專案結構：原始碼放在 apps/equipment-loan/，底下分 frontend/、backend/；docker-compose.yml、README.md、跨前後端的 e2e 測試放在 apps/equipment-loan/ 這一層。
視覺風格：依 SOP 委派 clarify 問我。
Planner 子代理一律讀取 .agents/skills/<planner>/SKILL.md。完成後依步驟 5 的「結束後的檢查」回報，並依檢查點 commit。
```

第 2 次以後：

```text
請做 runbook 步驟 5：讀取 .agents/skills/system-analysis/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
專案結構：沿用 {PREV_SPEC_DIR}/plan.md 的專案結構（apps/equipment-loan/）。
視覺風格：沿用 {FIRST_SPEC_DIR}/ui/plan.md 的視覺風格，氣質、配色、字體都照它，不用再問我。
Planner 子代理一律讀取 .agents/skills/<planner>/SKILL.md。完成後依步驟 5 的「結束後的檢查」回報，並依檢查點 commit。
```

#### P5b 單獨重跑一個 Planner（P5 回報某個 Planner 停止、沒產出，或產出有問題時）

```text
請讀取 .agents/skills/<api-plan|data-plan|ui-plan>/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
負責介面：<plan.md 系統介面盤點中，這個 Planner 負責的介面編號>
重跑理由：<停止原因或產出問題>
完成後回報檢查腳本結果，並在 docs/iterations/iter-{N}.md 記下：哪個 Planner、為什麼重跑、重跑結果。
```

#### P6 `tasks`

```text
請做 runbook 步驟 6：讀取 .agents/skills/tasks/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
完成後依步驟 6 的「結束後的檢查」回報（舊資料遷移與回歸任務、demo seed 任務、Notes 待確認數量）。
```

#### P7 `analyze`

```text
請做 runbook 步驟 7：讀取 .agents/skills/analyze/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
完成後回報 CRITICAL、HIGH 的數量與每一項的處理 Skill。沒有 CRITICAL 時，依步驟 6～7 的檢查點 commit。
```

#### P7b 修正 CRITICAL（P7 有 CRITICAL 時，一項一項貼）

```text
analysis.md 的 <問題編號> 標出由 <處理 Skill> 處理。
請讀取 .agents/skills/<處理 Skill>/SKILL.md 並依其 SOP 執行，目標 spec：{SPEC_DIR}/spec.md，只修正這一項指出的問題。
修正後重跑 P7，並在 docs/iterations/iter-{N}.md 記下：問題、哪支 Skill 修、重跑結果。
```

#### P8 `implement`

```text
請做 runbook 步驟 8：讀取 .agents/skills/implement/SKILL.md 並依其 SOP 執行（一定用這個路徑，全域有一支同名的 implement）。
目標 tasks：{SPEC_DIR}/tasks.md
每個 Phase 結束就 commit。全部完成後，依步驟 8 的「結束後的檢查」，把受阻任務與自行決策逐條寫進 docs/iterations/iter-{N}.md。
```

範圍太大、一次跑不完時，改成「執行範圍：Phase <X>」，一個 Phase 貼一次。

#### P9 準備使用者驗證

```text
請做 runbook 步驟 9 的準備：
1. 寫出啟動方式（從乾淨環境開始的指令）。
2. 寫出本次驗證情境：成功操作、關鍵失敗、前幾次功能的回歸，每個情境寫「操作步驟」與「預期結果」。
3. 確認 demo seed 可以重設本次的展示資料，寫出重設指令。
寫進 docs/iterations/iter-{N}.md 的「使用者驗證」，然後停下來，等我操作完回報結果。
```

你操作完後，貼：

```text
驗證結果：<通過／不通過>。
情境結果與回饋：<逐條寫>。
請把結果與目前 commit SHA 寫進 docs/iterations/iter-{N}.md 的「使用者驗證」。
```

#### P10 檢查 Skill 的表現

```text
請做 runbook 步驟 10：依 docs/iterations/iter-{N}.md 的步驟紀錄與本次產出，填「Skill 表現檢查」表。
每個問題分類為需求缺漏、程式錯誤、Skill 缺陷或沒有問題，並附證據位置。沒有證據不算 Skill 缺陷；沒有問題就寫「沒有」。
分類為 Skill 缺陷的，依第 7 節格式寫進「Skill 問題」。
```

#### P11 交給 Claude Code 優化 Skill（貼在 Claude Code，不是 OpenCode）

```text
使用 skill-engineering 優化 <Skill 名稱>。
問題紀錄：docs/iterations/iter-{N}.md 的「Skill 問題」問題 <編號>（含原本預期與證據）。
優化 commit 的訊息依 docs/dev/迭代-runbook.md 第 7.2 節，寫出問題、預期、根因、修改部位、重跑結果。
完成後在該問題的「處理結果」填上優化 commit SHA。
```

#### P11b 優化後重跑（回到 OpenCode）

```text
<Skill 名稱> 已由 skill-engineering 優化，commit <SHA>。
請重跑受影響的步驟 P<編號>，比較重跑前後的產出，把重跑結果寫進 docs/iterations/iter-{N}.md 該問題的「處理結果」。
```

#### P12 收尾

```text
請做 runbook 步驟 12：
1. 更新 docs/iterations/iter-{N}.md 的「流程不足」與「影片素材清單」。
2. 依檢查點 commit。
3. 回報本次迭代的完成狀況，並列出還沒完成的項目。
```

使用者驗證通過時，Argon 會提議打 tag。你同意才打。

### 9.6 第 1 次迭代的貼上順序

1. 先完成第 0 節「開工前準備」
2. P0（`{N}`=1、`{PREV_SPEC_DIR}`=無）
3. P1（憲法增補）
4. P2（`{FEATURE}`=9.3 第 1 列）→ 記下 `{SPEC_DIR}`
5. P3（視 P2 回報）
6. P4（`{TECH}`=9.4 第 1 列）
7. P5（第 1 次迭代版）（→ 某個 Planner 有問題時 P5b）
8. P6 → P7（→ P7b）
9. P8
10. P9 → 你驗證 → 貼驗證結果
11. P10 →（有 Skill 缺陷時）P11 在 Claude Code → P11b
12. P12

第 2 次以後：同樣順序，跳過 P1（除非有新的共同規則），P5 用「第 2 次以後」版。通知迭代依第 8 節的 A/B 流程，在 P5 之後分 A、B 兩組。
