# 迭代 Runbook（OpenCode＋Gemini Argon 執行用）

- 建立日期：2026-11-08
- 適用範圍：第三題「設備借用與預約審核系統」的每一次迭代（`s-specify` → `implement`）；第 4 節的小變更路徑用在既有 spec 目錄的小修改；第 10 節的錯誤修正流程也可以在迭代以外使用；第 11 節的構想評估流程在寫 `spec.md` 之前使用
- 規劃依據：[第三題選題討論.md](./第三題選題討論.md)（題目、迭代內容、排程、證據保存、第四題 A/B）
- 狀態：未驗證。第 1 次迭代跑完後依實際情況修正本文件

## 流程總覽

本 runbook 有 4 種做法。先依下表選一種，再到該節照步驟做。

| 做法 | 什麼時候用 | 第一個提示詞 | 本文位置 |
|---|---|---|---|
| 構想評估 | 有一個構想，還沒決定要不要做 | I1 | 第 11 節 |
| SDD 迭代 | 已決定要做一個新功能 | P0 → P2 | 第 4 節步驟 0～12 |
| 小變更 | 只改既有 spec 目錄的 Planner 產出，不新增介面、技術主題與需求 | P0s → P5b | 第 4 節「小變更路徑」 |
| 錯誤修正 | 程式和已同意的文件不一致 | B1 | 第 10 節 |

做法之間的銜接：

1. 構想評估的結論為 go、你決定採用時：依第 11 節步驟 2，先貼 P0 開新迭代，再貼報告中的 `s-specify` 指令代替 P2，最後做步驟 2 的「結束後的檢查」。
2. 步驟 10 分類為程式錯誤時：走第 10 節的錯誤修正流程。
3. 步驟 10 分類為意圖改變，或 `bug-assess` 判定為意圖改變時：照步驟 10 的意圖改變處理。只動到 Planner 產出時，可以走小變更路徑。

自訂流程的做法：

| 要做的事 | 用什麼 |
|---|---|
| 新增或改變流程、步驟、Skill | `skill-engineering`；有產出物範例時用 `artifact-to-skill-engineering` |
| 約束某個產出物的內容 | `constitution` |
| 串接步驟、放人工關卡、續跑 | 本 runbook（一步一個提示詞，迭代紀錄記進度） |
| 自動接續 | 自動模式（`scripts/auto-mode.sh`） |
| 每種工作用哪個模型 | `CLAUDE.md`「模型與 effort」表 |
| 多個 agent 共用 | `scripts/sync-skills.sh` |

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
| 使用者 | — | 回答 `clarify` 的問題；同意覆寫；核准錯誤修正的修法與命令；實際操作驗證；同意 commit 與 tag | — |

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
4. 讀第 5 節各列的「遺留項」。和本次功能有關的項目，記進本次迭代紀錄。
5. 依第 7 節樣板建立 `docs/iterations/iter-<N>.md`，填入本次功能與開始時間。

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
   - 相容邊界：第 2 次迭代起，寫出本次必須保持不變的既有行為、資料與介面（變數 `{COMPAT}`，見 9.2）。不寫第 5 節「本次要觀察的規則」的答案（9.1 第 3 點）。
3. 使用者要做的事：回答 `clarify` 的問題。
4. 產出：`specs/<NNN>-<short-name>/spec.md`。
5. 結束後的檢查：
   - 對照第 5 節「本次要觀察的規則」，記下 `clarify` 有沒有問到。沒問到的寫進迭代紀錄的「Skill 問題」。
   - 記下 spec.md 的「推定需求」與「未確認事項」數量。
   - 相容邊界的每一項都寫進了 spec.md（段落不限）。漏寫的項目記進迭代紀錄的「Skill 問題」。

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
4. 產出：`plan.md`；Planner 依 Wave 產出 `contracts/`（`api-plan`）、`data/data-model.dbml`（`data-plan`）、`ui/`（`ui-plan`）。資料庫介面排在後端之前的 Wave（批 5），有資料庫與後端的功能會多一個 Wave。
5. 結束後的檢查：
   - 每個 Planner 都有產出，或回報了停止原因。
   - `plan.md` 中標為「沒有 Planner」的端點，記進迭代紀錄（第四題的證據）。
   - 各 Planner 的檢查腳本結果。
6. 檢查點（步驟 4～5 結束）：commit `docs(specs): ...`。

### 步驟 5n（視需要）：`notification-plan`

1. 什麼時候跑：步驟 5 的 `plan.md` 有沒有 Planner 的通知類介面（觸發通知的排程、送出與重試程序、外部通知服務與它的本機替身）。通知迭代的 A/B 流程只有 B 組跑，A 組不跑（第 8 節）。
2. 指令：「讀取 `.agents/skills/notification-plan/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
3. 使用者要做的事：回答 `clarify` 的問題（spec 沒決定的業務規則、憲法衝突）；同意覆寫（若跳出）。
4. 產出：`specs/<NNN>-<short-name>/notification/plan.md`。
5. 結束後的檢查：
   - 每個負責介面都有一個 §5.n 章節。記下 `check_notification_plan.py` 的 issues、warnings 與未通過項。
   - 記下 `clarify` 問了幾題、決定了什麼，以及決定是否帶進 spec 沒要求的新行為（`docs/待確認.md` 第 31 項第 2 點）。
   - 記下回報列出的上游檔案是否都實際讀過（`docs/待確認.md` 第 31 項第 1 點）。
   - 上游衝突逐條記進迭代紀錄：編號、內容、處理 Skill。通知迭代的 B 組只記錄，不修改上游（理由見第 8 節第 5 點）。其他情況依處理 Skill 修正上游，再重跑 P5n。
6. 檢查點：commit `docs(specs): ...`。通知迭代的 B 組 commit 到 B 組 branch。

### 步驟 6：`tasks`

1. 指令：「讀取 `.agents/skills/tasks/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
2. 使用者要做的事：同意覆寫（若跳出）。
3. 產出：`tasks.md`。
4. 結束後的檢查：
   - 第 2 次迭代起，有沒有舊資料遷移與舊功能回歸的任務。
   - 有沒有擴充 demo seed 的任務。沒有時記進「Skill 問題」，並在步驟 9 手動補。
   - Notes 的待確認項目數量。
   - 欄位引用：`tasks` 回報的「未通過項」沒有「受約束欄位 … 沒有任何任務在 Must Read … 引用」（`check_tasks.py` 輸出的 `uncited` 為空），也就是資料模型的每個受約束欄位（`note` 以「驗證：」「轉換：」開頭，或列在「跨欄位：」）都有實作任務在 Must Read 以 `` `data/data-model.dbml` → `table.column` `` 引用。不是空的時，記進「Skill 問題」。

### 步驟 7：`analyze`

1. 指令：「讀取 `.agents/skills/analyze/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
2. 產出：`analysis.md`。
3. 結束後的檢查：「欄位涵蓋」的列數等於資料模型的受約束欄位數（沒有受約束欄位時寫「不適用」），而且問題清單沒有欄位缺引用或找不到引用的 E 類問題；有的話，依處理 Skill（通常是 `tasks`）修正後重跑步驟 7。
4. 有 CRITICAL 時：
   1. 依 `analysis.md` 標出的處理 Skill 修正上游文件（例如 `api-plan`、`tasks`）。
   2. 重跑 `analyze`。
   3. 在迭代紀錄寫下：問題、哪支 Skill 修、重跑結果。
5. 檢查點（步驟 6～7 結束）：commit `docs(specs): ...`。

### 步驟 8：`implement`

1. 指令：「讀取 `.agents/skills/implement/SKILL.md` 並依其 SOP 執行，目標 tasks：<路徑>」。一定要用路徑指定，全域有一支同名的 `implement`。
2. `implement` 全程不向使用者提問。上游矛盾與受阻由它自己決策，寫進完成報告。
3. 產出：`apps/equipment-loan/` 的程式碼與測試；更新後的 `tasks.md`；完成報告。
4. 結束後的檢查：
   - 完成報告中的受阻任務與自行決策，逐條記進迭代紀錄。
   - 測試全部通過。
5. 檢查點：每個 Phase 結束 commit 一次 `feat(...)` 或 `fix(...)`。
6. 全部 Phase 完成後，進步驟 8c。從步驟 8t 回到這一步時，只執行新附加的 Convergence Phase（執行範圍：Phase <N>），完成後再進步驟 8c。

### 步驟 8c：`converge`

1. 指令：「讀取 `.agents/skills/converge/SKILL.md` 並依其 SOP 執行，目標 spec：<路徑>」。
2. `converge` 全程不向使用者提問。它不啟動系統、不跑測試，只新增或修改 spec 目錄的 `convergence.md`。重跑時在檔尾新增一輪，舊輪次不動。
3. 產出：`convergence.md`。
4. 結束後的檢查：
   - 最新一輪的「結果」。「已收斂」時，進步驟 9。
   - 使用者確認每個缺口是不是真的缺口。不是缺口或決定不處理的，由使用者把「處理」手動改為「不處理」。
   - 「處理」為「上游缺口：<Skill>」的缺口：依該 Skill 修正上游文件（做法同 P7b，問題編號改用 `convergence.md` 的 G 編號），修正後重跑步驟 8c。
   - 「處理」為「附加任務」的缺口：進步驟 8t。
   - 缺口逐條記進迭代紀錄：G 編號、類型、嚴重度、處理。
5. 檢查點：commit `docs(specs): ...`。

### 步驟 8t：`tasks` 附加模式

1. 指令：「讀取 `.agents/skills/tasks/SKILL.md`，依 <spec 目錄>/convergence.md 執行附加模式」。
2. 附加模式不詢問覆寫。它只把最新一輪「附加任務」且還沒有被任務引用的缺口，寫成 `tasks.md` 檔尾的 `## Phase <N>: Convergence`，前面的內容不變。
3. 產出：更新後的 `tasks.md`。沒有可附加的缺口時，`tasks.md` 不變。
4. 結束後的檢查：
   - `git diff` 只有檔尾新增的 Convergence Phase。
   - 回報的「未附加缺口」：依回報的處理 Skill 修正上游文件，修正後重跑步驟 8c。
5. 檢查點：commit `docs(specs): ...`。
6. 回到步驟 8，只執行新的 Convergence Phase，再進步驟 8c。重複 8 → 8c → 8t，直到 `convergence.md` 最新一輪的結果為「已收斂」，再進步驟 9。

### 步驟 9：使用者驗證

1. Argon 寫出啟動方式與驗證情境（成功操作、關鍵失敗、舊功能回歸）。
2. 確認 demo seed 可以重設本次的展示資料。
3. 使用者實際操作驗證。成員與管理員各用一個瀏覽器視窗（一般視窗、無痕視窗）。
4. 在迭代紀錄寫下：驗證的 commit SHA、情境、結果、使用者回饋。

### 步驟 10：檢查 Skill 的表現

1. 填迭代紀錄的「Skill 表現檢查」表（第 7 節）。
2. 每個問題先分類：需求缺漏、意圖改變、程式錯誤、Skill 缺陷。
   - 需求缺漏：spec 沒寫到、`clarify` 也沒問到的規則。回到 `clarify-over-specs` 或下一次迭代處理。
   - 意圖改變：要改變已同意的 `spec.md`、`ui/plan.md` 或雛形。不修程式，轉回 SDD 流程：由寫出該內容的 Skill（例如 `s-specify`、`ui-plan`）修改，或放進下一次迭代的功能描述。
   - 程式錯誤：程式和已同意的文件不一致。走第 10 節的錯誤修正流程，不直接修程式。分不清是程式錯誤還是意圖改變時，也走錯誤修正流程，由 `bug-assess` 判定。
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
2. 更新第 5 節本次這一列的「狀態」與「遺留項」：
   - 本次沒有處理完的問題，逐項寫進「遺留項」，寫出來源位置與去向。
   - 其他列的遺留項本次處理了，在該項後面標「已處理（commit SHA）」，不刪除。
3. 檢查點：commit `docs(iterations): ...`。
4. 使用者驗證通過時，提議打 tag，使用者同意才打。

### 小變更路徑

1. 什麼時候用：下列條件都成立時。
   - 要改的是既有 spec 目錄中 Planner 的產出：`ui/`（`ui-plan`）、`contracts/`（`api-plan`）、`data/data-model.dbml`（`data-plan`）。這個目錄已經有 `spec.md`、`plan.md`、`techstack.md` 或 `research.md`，以及 `tasks.md`。
   - 不新增介面：`plan.md` 的系統介面盤點不變。
   - 不新增技術主題：`research.md`、`techstack.md` 不變。
   - 不改 `spec.md` 的需求。
   - 常見來源：步驟 10 分類為意圖改變、只動到 Planner 產出的項目。
2. 不適用時：走步驟 0～12，由 `s-specify` 建立新的 spec 目錄。新的 spec 目錄沒有 `plan.md` 與技術研究結果，`system-analysis` 與 Planner 會停止，所以不能在新目錄跳過步驟 4、5。
3. 步驟：
   1. 準備（P0s）：同步驟 0。`{N}` 用 `small-<序號>`（例如 `small-1`），迭代紀錄是 `docs/iterations/iter-small-<序號>.md`，寫明本次變更與目標 spec 目錄（`{SPEC_DIR}`）。之後的提示詞照常代換 `{N}`。
   2. 重跑受影響的 Planner（P5b）：「重跑理由」寫本次變更。Planner 會列出既有檔案並詢問是否覆寫，你同意後它才重寫。一次重跑一個 Planner；有兩個以上時，依 `plan.md` 的 Wave 順序。
      - 結束後的檢查：`git diff` 只有受影響 Planner 的產出；記下檢查腳本結果。
      - 改了兩個以上 Planner 的產出時，先跑 P7（`analyze`），確認產出之間一致，再進下一步。
      - 檢查點：commit `docs(specs): ...`。P5b 的提示詞沒有寫 commit；Planner 完成後，依這個檢查點 commit（P0s 已同意）。
   3. `converge`（P8c）：對照新的文件與程式，找出缺口。照步驟 8c 的「結束後的檢查」處理。
   4. `tasks` 附加模式（P8t）→ `implement` 只執行新的 Convergence Phase（P8）→ 再跑 P8c。重複到 `convergence.md` 最新一輪的結果為「已收斂」。不用 `tasks` 的產生模式，已打勾的任務不會被覆寫。
   5. 使用者驗證、Skill 表現檢查與收尾：同步驟 9～12。步驟 12 不在第 5 節新增列；本次變更來自某一列的遺留項時，在該項後面標「已處理（commit SHA）」。
4. 跳過的步驟：步驟 1～4、步驟 5 的 `system-analysis`、步驟 6 的產生模式；步驟 7 只在第 3 點第 2 步要求時跑。
5. 狀態：未驗證。`converge` 也還是「未驗證」。第一次照這個路徑做完後，依實際情況修正本節。

## 5. 各次迭代的備註

欄位說明：ID 是該次的 spec 目錄名，還沒建立時寫「（未建立）」。狀態只用已完成、未開始、不做。遺留項寫成「項目（來源位置）→ 去向」，一項一行；步驟 0 讀取，步驟 12 更新，處理後標「已處理（commit SHA）」，不刪除。

| ID | 次 | 本次功能 | 本次要觀察的規則（`clarify` 有沒有問到） | 狀態 | 遺留項 | 備註 |
|---|---|---|---|---|---|---|
| `003-equipment-loan-booking` | 1 | 成員登入、查看預建設備、預約固定時段與取消 | 設備與預約單位（單一組織、單件設備、單日固定時段）；同時搶同一時段 | 已完成 | api-plan 與 data-plan 的既有欄位命名不一致（`iter-1.md:124`）→ `docs/待確認.md` 第 39 項；新欄位已由批 5 處理 | 先做步驟 1 的憲法增補；決定視覺風格；建立專案骨架與 demo seed；帳號為預建的成員與管理員 |
| `004-equipment-approval-review` | 2 | 管理員把指定設備改成人工審核，並處理申請 | 待審是否占用時段；引入審核後舊預約怎麼處理 | 已完成 | 同第 1 列的既有欄位命名（`iter-2.md:126`）→ `docs/待確認.md` 第 39 項 | 要有舊資料遷移與前一次的回歸 |
| `005-equipment-pickup-return` | 3 | 管理員登記領取與歸還，成員查看借用狀態 | 預約與借用的狀態轉移限制 | 已完成 | 無 | 檢查 API 與 UI 對「可操作狀態」的定義是否一致 |
| `006-reservation-reschedule` | 4 | 成員申請改期，改期成功前保留原預約 | 改期失敗時原預約如何保留；重新審核 | 已完成 | 需求缺漏 C3：核准改期時本人在新時段已有預約，錯誤訊息不精確（`iter-4.md:126`）→ 下一次迭代或 `clarify-over-specs`<br>research 缺漏 C1（`request_no` 規則）、C4（改期申請並發控制），只有暫行做法（`iter-4.md:118`）→ 下一次迭代或 `clarify-over-specs`<br>淺色琥珀文字對比 3.19:1，低於 WCAG AA（`iter-4.md:107`）→ `ui-plan` 調色<br>設備預約頁橫向超出 30px、管理頁超出 10px（`iter-4.md:106`）→ 紀錄沒有寫去向<br>使用者親手抽查 S2、S3、F5（`iter-4.md:156`）→ 待補 | 第 13 天閘門：決定走 6 次或 5 次路徑；確認第四題方向；選 1 個影片用的 Skill 優化案例。**2026-11-10（第 3 天）使用者決定**：走 6 次路徑；第四題維持外部通知；影片案例用 api-plan 問題 1（`6669ebd`）；第四題在第 5 次迭代完成後才做，不平行。尚缺：使用者親手抽查第 4 次的 S2、S3、F5。詳見選題討論「第 13 天閘門結果」 |
| `007-equipment-maintenance-retire` | 5 | 設備送修或停用、恢復可用，處理受影響的未來預約 | 送修時受影響預約的處理；停用與刪除的差別 | 已完成 | SC-002「同時發生時」的計算時間點（`iter-5.md:131`）→ 使用者決定<br>正式目錄的 spec、research、`ui/plan.md`、合約、`tasks.md` 保留優化前內容，和程式不一致（`iter-5.md:286`）→ 刻意保留為優化前證據<br>`data-plan` 沒有上游衝突步驟（`iter-5.md:114`、`iter-5.md:147`）→ 紀錄沒有寫去向<br>US1 情境 16 的停用版本沒有專屬測試（`iter-5.md:99`）→ 步驟 9 使用者驗證補<br>使用者親手驗證（`iter-5.md:285`）→ 待補 | 只在 6 次路徑做；預估 2 天 |
| `008-overdue-discord-notification` | 6（通知迭代） | 系統辨識逾期借用（可手動觸發），呼叫 Discord 通知，管理員查看結果與重試 | 逾期檢查要能手動觸發；通知失敗、逾時、重複的處理 | 已完成 | T042 第 3 次修正未經使用者驗證（`iter-6.md:311`）→ `docs/待確認.md` 第 32 項<br>runbook 沒寫 A/B 的資料庫隔離與載入 `.env`（`iter-6.md:342`）、合併後重跑 `npx prisma generate`（`iter-6.md:347`）、步驟 9 用真實 Discord 驗證（`iter-6.md:350`）→ 修改 runbook<br>委派提示詞沒有「只停自己啟動的程序」（`iter-6.md:344`）→ 紀錄沒有寫去向<br>007 遷移測試寫死資料庫名稱（`iter-6.md:343`）→ 紀錄沒有寫去向<br>demo seed 的「送出成功」通知帶假的 Message ID（`iter-6.md:351`）→ 紀錄沒有寫去向<br>畫面沒有顯示 Message ID（`iter-6.md:333`）、「重送」按鈕文字擠成兩行（`iter-6.md:334`）→ 紀錄沒有寫去向<br>`constitution` 產出物對照表缺 `notification/plan.md`、`notification-plan` 檔頭列了沒讀全文的檔案（`iter-6.md:50`、`iter-6.md:91`）→ `docs/待確認.md` 第 30、31 項<br>small-1：`ui-plan` 沒有對比規則，配色低於 WCAG AA（`iter-small-1.md:179`）→ 用 `constitution` 新增 `ui-plan` 的對比規則，門檻與套用元件由使用者決定，下一次迭代步驟 1 處理<br>small-1：同一頁「已歸還」徽章 Light Mode 4.34:1、「借用中」徽章 Dark Mode 3.68:1（`iter-small-1.md:107`）→ 對比規則確定後，以小變更路徑（`ui-plan`）處理，和第 4 列的淺色琥珀文字一起<br>small-1：`pg` 的 `DeprecationWarning`，來源是 Prisma 內部（`iter-small-1.md:367`）→ 升級 `pg` 到 9.0 或升級 Prisma 之前處理<br>small-1：`converge` 搜尋關鍵字規則的 2 個邊界、前一輪沒有缺口時重新確認段的寫法（`iter-small-1.md:203`、`iter-small-1.md:230`）→ 下次用 `skill-engineering` 優化 `converge` 時一起處理 | 依第 8 節的 A/B 流程跑；Webhook URL 放 `.env`，不 commit。5 次路徑時，這次改成第 5 次 |
| （未建立） | 7（餘裕） | 候補與限時確認 | 候補順序與確認期限 | 未開始 | 無 | 通知迭代完成、還有時間才做 |

迭代次數：目標 6 次、保底 5 次。詳細理由與兩條路徑見 [第三題選題討論.md](./第三題選題討論.md) 的「迭代次數（第三次修正）」。

## 6. Argon 的可用期限

1. Argon API 預計 2026-11-26 到期。Argon 執行的工作要在 **2026-11-25** 前結束。
2. 第 1 天是 2026-11-08 或 11-09，所以第 18 天是 11-25 或 11-26。依 6 次路徑，Argon 執行第 1～5 次迭代，以及通知迭代的步驟 2～5（第 16 天）。走 5 次路徑時，Argon 執行第 1～4 次迭代與通知迭代的步驟 2～5（第 14 天）。
3. 到期後由 **Claude Code** 接手執行（使用者 2026-11-08 決定），步驟與紀錄方式不變，迭代紀錄的「執行者」改寫 Claude Code 與模型名稱。
4. 第四題 A/B 比較的 A、B 兩組要用同一個模型。B 組一定在到期後才跑，所以 **A 組的步驟 6～7 也由 Claude Code 跑**，不由 Argon 跑。兩組使用同一個 Claude 模型與 effort，開跑時記進迭代紀錄。
5. 通知迭代之前的迭代與通知迭代的執行模型不同。Skill 表現的差異可能來自模型，不一定來自 Skill。整理流程不足時要標出這一點。
6. **2026-11-10 使用者決定：第 5 次迭代起，全部改由 Claude Code 執行，不再用 Argon。** 本節第 1～4 點的期限與分工不再適用。第 4 次迭代步驟 2 中途已改由 Claude Code＋Opus 5.5（effort high）執行，之後沿用同一個模型與 effort，P0 記進迭代紀錄的「固定環境」。本 runbook 寫「Argon」或「OpenCode」的地方，改成 Claude Code；OpenCode 專屬的說明（第 2 節）不適用。第 5 點的提醒照樣適用：第 1～3 次迭代（Argon）和第 5 次起（Claude Code）的 Skill 表現不能直接比較。

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

| Skill | 預期 | 實際 | 分類（需求缺漏／意圖改變／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
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
5. B 組：由 Claude Code 用與 A 組相同的模型設定，在 B 組 worktree 依序做下列事：
   1. 把新 Skill 帶進 B 組 branch。只 cherry-pick 修改 Skill 的 commit，不 merge 主線。理由：主線有迭代紀錄與 `skill-engineering` 藍圖，寫了 A 組 `tasks`、`analyze` 的結果，B 組讀到會影響比較。
      - 第 6 次迭代只帶 `fd8e032`（`notification-plan`）、`be648df`（`tasks`、`analyze` 接入）。`5e407d7` 加上 description 的「（未驗證）」，`0ad3b3f` 又移除它，兩個合起來沒有變動，不帶。
      - cherry-pick 後跑 `scripts/sync-skills.sh --check`，再跑 `git diff main HEAD -- .agents/skills .claude/skills`，確認沒有差異。
      - 把 B 組的 Skill 版本（B 組 `git rev-parse --short HEAD`）與來源 commit 記進迭代紀錄的「A/B worktree」。
   2. 跑步驟 5n（`notification-plan`，提示詞 P5n）。上游衝突只記錄，不修改上游（`plan.md`、`research.md`、`techstack.md`、`contracts/`、`data/`、`ui/`）。理由：上游是 A、B 兩組的共用起點，B 組改了上游，兩組的差異就不只來自新 Skill。上游衝突在 A/B 比較完成後再處理。
   3. 跑步驟 6～8。
   4. 迭代紀錄寫在主目錄的 `docs/iterations/iter-<N>.md`，和 A 組相同。B 組 worktree 只 commit spec 目錄的產出。
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
| `/notification-plan`（第四題新 Skill） | 步驟 5n | P5n | `plan.md` 有沒有 Planner 的通知類介面時；通知迭代只在 B 組跑（第 8 節第 5 點） |
| `/tasks` | 步驟 6 | P6 | 每次 |
| `/analyze` | 步驟 7 | P7；P7b（修 CRITICAL） | 每次 |
| `/implement` | 步驟 8 | P8 | 每次 |
| `/converge` | 步驟 8c | P8c | 每次，步驟 8 全部完成後；之後每跑完一個 Convergence Phase 再跑一次 |
| `/tasks` 附加模式 | 步驟 8t | P8t | `convergence.md` 最新一輪有「附加任務」時 |
| 使用者驗證 | 步驟 9 | P9 | 每次 |
| 檢查 Skill 是否照預期工作 | 步驟 10 | P10 | 每次 |
| 錯誤修正 | 第 10 節 | B1～B5 | 步驟 10 有程式錯誤時；迭代外發現錯誤時 |
| 構想評估 | 第 11 節 | I1、I1r | 寫 `spec.md` 之前，要判斷構想值不值得做時 |
| 小變更 | 第 4 節「小變更路徑」 | P0s → P5b → P8c → P8t → P8 | 只改既有 spec 目錄的 Planner 產出時 |
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
3. **功能描述不寫答案。** 9.3 的功能描述故意不寫第 5 節「本次要觀察的規則」的答案（例如待審是否占位），讓 `clarify` 有機會主動問。如果把答案寫進描述，就觀察不到 `clarify` 有沒有問。相容邊界 `{COMPAT}` 也一樣，不寫這些答案。
4. 每次迭代開新的 OpenCode session，從 P0 開始。

### 9.2 變數

| 變數 | 意思 | 例子 |
|---|---|---|
| `{N}` | 第幾次迭代；小變更用 `small-<序號>` | `1`、`small-1` |
| `{FEATURE}` | 本次功能描述，取自 9.3 | — |
| `{SPEC_DIR}` | 本次 spec 目錄，P2 跑完後由 `s-specify` 決定 | `specs/003-equipment-booking` |
| `{PREV_SPEC_DIR}` | 上一次迭代的 spec 目錄；第 1 次寫「無」 | `specs/003-equipment-booking` |
| `{FIRST_SPEC_DIR}` | 第 1 次迭代的 spec 目錄（視覺風格來源） | `specs/003-equipment-booking` |
| `{TECH}` | 本次技術限制，取自 9.4 | — |
| `{CHANGE}` | 小變更的內容與來源（P0s 用） | `008 逾期通知紀錄畫面顯示送出成功通知的 Message ID；來源：第 5 節第 6 列遺留項（iter-6.md:333）` |
| `{COMPAT}` | 相容邊界：本次必須保持不變的既有行為、資料與介面。第 1 次寫「無」 | `既有的預約、取消與審核 API 路徑與回應欄位不變；既有預約資料不刪除` |

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

#### P0s 小變更開場（走第 4 節「小變更路徑」時，開新 session 貼）

```text
我們要走 runbook 第 4 節的「小變更路徑」，代號 {N}。請先讀 docs/dev/迭代-runbook.md 全文，再做小變更路徑第 3 點第 1 步（準備）。
規則：
- 每一步只做我貼給你的那一步，做完就停下來等我貼下一步。
- 每一步都用路徑指定 Skill：讀取 .agents/skills/<name>/SKILL.md 並依其 SOP 執行，不用同名的全域 Skill。
- 不修改任何 Skill（.claude/skills/、.agents/skills/）。發現 Skill 問題時，依 runbook 第 7 節格式記進 docs/iterations/iter-{N}.md。
- 我同意你在 runbook 第 4 節（含小變更路徑）標出的檢查點自行 commit，commit 訊息依 .agents/skills/conventional-commits/SKILL.md。不 push、不打 tag。
- 每一步結束時，用 3 行以內回報：產出、問題、下一步。
- 用繁體中文回覆。
本次資料：
- 目標 spec 目錄：{SPEC_DIR}
- 本次變更：{CHANGE}
做準備時：
1. 確認本次變更符合小變更路徑第 1 點的每個條件。有不符合的條件時，列出來並停下來。
2. 依第 7 節樣板建立 docs/iterations/iter-{N}.md，「本次功能」寫本次變更，並依 9.0「固定環境」寫進執行工具版本、模型與 effort、Skill 版本（git rev-parse --short HEAD）。
3. 回報下一步要貼的 P5b 中「負責介面」應填的介面編號（取自 {SPEC_DIR}/plan.md 的系統介面盤點）。
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
相容邊界：{COMPAT}
完成後告訴我 spec 目錄路徑與 `checklists/requirements.md` 的通過數，並依步驟 2 的「結束後的檢查」（含相容邊界是否都寫進 spec.md），對照 runbook 第 5 節第 {N} 列「本次要觀察的規則」，寫進 docs/iterations/iter-{N}.md。
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

#### P5n `notification-plan`（P5 的 `plan.md` 有沒有 Planner 的通知類介面時；通知迭代只在 B 組 worktree 貼）

```text
請做 runbook 步驟 5n：讀取 .agents/skills/notification-plan/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
上游衝突只記錄、不修改上游：不修改 plan.md、research.md、techstack.md、contracts/、data/、ui/。
完成後依步驟 5n 的「結束後的檢查」，把結果與每一項上游衝突（編號、內容、處理 Skill）寫進主目錄的 docs/iterations/iter-{N}.md，並依步驟 5n 的檢查點 commit 到目前的 branch。
```

不是通知迭代的 B 組時，刪掉第 3 行，並把「主目錄的」刪掉；上游衝突依處理 Skill 修正後，再重跑 P5n。

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

範圍太大、一次跑不完時，改成「執行範圍：Phase <X>」，一個 Phase 貼一次。從 P8t 回來時，一定要改成「執行範圍：Phase <N>」，`<N>` 是 P8t 回報的新 Convergence Phase 編號。

#### P8c `converge`

```text
請做 runbook 步驟 8c：讀取 .agents/skills/converge/SKILL.md 並依其 SOP 執行。
目標 spec：{SPEC_DIR}/spec.md
完成後依步驟 8c 的「結束後的檢查」回報：最新一輪的結果、每個缺口的 G 編號、類型、嚴重度與處理，並逐條寫進 docs/iterations/iter-{N}.md。不要修改 convergence.md 的「處理」欄，等我確認缺口。
```

結果為「已收斂」時，跳到 P9。有「上游缺口」時，用 P7b 的做法逐項修正（`analysis.md` 換成 `convergence.md`，問題編號換成 G 編號），修正後重貼 P8c。有「附加任務」時，確認缺口後貼 P8t。

#### P8t `tasks` 附加模式

```text
請做 runbook 步驟 8t：讀取 .agents/skills/tasks/SKILL.md，依 {SPEC_DIR}/convergence.md 執行附加模式。
目標 spec：{SPEC_DIR}/spec.md
完成後回報新 Phase 的編號、任務 ID 範圍、每個任務對應的 G 編號與「未附加缺口」，並依步驟 8t 的檢查點 commit。
```

接著回到 P8，執行範圍改成新的 Convergence Phase，完成後再貼 P8c。重複 P8 → P8c → P8t，直到 P8c 回報「已收斂」，再進 P9。

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
每個問題分類為需求缺漏、意圖改變、程式錯誤、Skill 缺陷或沒有問題，並附證據位置。沒有證據不算 Skill 缺陷；沒有問題就寫「沒有」。
分類為 Skill 缺陷的，依第 7 節格式寫進「Skill 問題」。
分類為程式錯誤的，寫出錯誤回報（症狀、在哪裡看到、證據位置），交給第 10 節 B1。
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
9. P8 → P8c（→ P8t → P8 只跑新 Phase → P8c，重複到「已收斂」）
10. P9 → 你驗證 → 貼驗證結果
11. P10 →（有程式錯誤時）第 10 節 B1～B5 →（有 Skill 缺陷時）P11 在 Claude Code → P11b
12. P12

第 2 次以後：同樣順序，跳過 P1（除非有新的共同規則），P5 用「第 2 次以後」版，P2 的 `{COMPAT}` 寫本次的相容邊界。小變更從 P0s 開始，依第 4 節「小變更路徑」的順序貼。構想評估的結論為 go 時，依第 11 節步驟 2 開始。通知迭代依第 8 節的 A/B 流程，在 P5 之後分 A、B 兩組；B 組在 P6 之前先跑 P5n。

## 10. 錯誤修正流程

### 10.1 什麼時候用

1. 步驟 10 分類為程式錯誤的問題。
2. 迭代以外發現的錯誤，例如 `docs/待確認.md` 記下的測試問題。
3. 不用於意圖改變、需求缺漏、Skill 缺陷（見步驟 10）。

報告放在 `specs/bugs/<代號>/`。3 支 Skill 都不 commit。

### 10.2 步驟

1. `bug-assess`（B1）：寫 `assessment.md`。不改程式。
   - 使用者要做：回答 `clarify` 的問題；核准修法與命令。
   - 判定為成立、已核准：進第 2 步。
   - 判定為待重現：先用 `bug-test` 做修正前實測（B3），再用 B1r 重新評估。
   - 判定為意圖改變：結束這個流程。依「轉回 SDD 流程的項目」轉回 SDD 流程（步驟 10 的意圖改變）。
   - 判定為不成立：結束這個流程。理由留在 `assessment.md`。
2. `bug-fix`（B2）：只依已核准的修法修改列出的檔案。寫 `fix.md`。
   - 狀態為已套用：進第 3 步。
   - 狀態為部分套用或未套用：用 B1r 重新評估，並把 `fix.md` 的偏離當新證據。
3. `bug-test`（B3）：在修正前和修正後各量一次。不改程式。寫 `test.md`。
   - 結果為待使用者驗證：進第 4 步。
   - 結果為部分：補齊 `test.md` 列出的條件後，重跑 B3。
   - 結果為失敗、已重現或未重現：用 B1r 重新評估。
4. 使用者驗證（B4）：使用者依 `test.md` 的驗證項目操作，回覆結果。`bug-test` 把結果寫進 `test.md`。
   - 結果為使用者已驗證：進第 5 步。
   - 結果為使用者驗證未通過：用 B1r 重新評估。
5. 檢查點（B5）：commit 程式、測試與 `specs/bugs/<代號>/`。在迭代中使用時，把報告位置與 commit SHA 寫進迭代紀錄。
6. 判定為成立、`assessment.md` 的「轉回 SDD 流程的項目」不是「無」時（例如回報同時要求新功能），第 5 步之後，把這些項目照步驟 10 的意圖改變處理。

### 10.3 變數

| 變數 | 意思 | 例子 |
|---|---|---|
| `{BUG_SLUG}` | 代號；B1 沒有時由 `bug-assess` 擬定，之後沿用 | `pickup-test-time-dependent` |
| `{BUG_REPORT}` | 錯誤回報：症狀、在哪裡看到、證據位置 | — |
| `{NEW_EVIDENCE}` | 重新評估的新證據 | `specs/bugs/<代號>/test.md 的結果` |

### 10.4 提示詞

#### B1 `bug-assess`

```text
請做 runbook 第 10 節步驟 1：讀取 .agents/skills/bug-assess/SKILL.md 並依其 SOP 執行。
錯誤回報：{BUG_REPORT}
代號：{BUG_SLUG}（沒有時寫「由 bug-assess 擬定」）
不修改程式，不 commit。依 SOP 請我核准修法與命令後停下來。
```

#### B1r 重新評估（第 1 步判定為待重現，或第 2～4 步要求重新評估時）

```text
請重新執行 runbook 第 10 節步驟 1：讀取 .agents/skills/bug-assess/SKILL.md 並依其 SOP 重新評估代號 {BUG_SLUG}。
新證據：{NEW_EVIDENCE}
不修改程式，不 commit。依 SOP 請我核准修法與命令後停下來。
```

#### B2 `bug-fix`

```text
請做 runbook 第 10 節步驟 2：讀取 .agents/skills/bug-fix/SKILL.md 並依其 SOP 執行，代號：{BUG_SLUG}。
不 commit。完成後回報狀態與下一步，然後停下來。
```

#### B3 `bug-test`

```text
請做 runbook 第 10 節步驟 3：讀取 .agents/skills/bug-test/SKILL.md 並依其 SOP 執行，代號：{BUG_SLUG}。
不修改程式，不 commit。結果是「待使用者驗證」時，列出驗證項目後停下來等我回覆。
```

#### B4 回覆驗證結果

```text
代號 {BUG_SLUG} 的驗證結果：<逐項寫通過或不通過，以及看到的情況>。
請讀取 .agents/skills/bug-test/SKILL.md，依 Phase 4 把結果寫進 specs/bugs/{BUG_SLUG}/test.md。
```

要 agent 代為執行時，把第 1 行改成「請代為執行代號 {BUG_SLUG} 的驗證項目」。

#### B5 檢查點

```text
請做 runbook 第 10 節步驟 5：確認 specs/bugs/{BUG_SLUG}/test.md 的結果是「使用者已驗證」，不是時停下來告訴我。
1. 依 .agents/skills/conventional-commits/SKILL.md commit 程式、測試與 specs/bugs/{BUG_SLUG}/。訊息寫根本原因、修改內容、報告位置與使用者驗證結果。不 push。
2. 在迭代中使用時，在 docs/iterations/iter-{N}.md「Skill 表現檢查」該列的證據位置，寫上 specs/bugs/{BUG_SLUG}/ 與 commit SHA。
3. specs/bugs/{BUG_SLUG}/assessment.md 的「轉回 SDD 流程的項目」不是「無」時，列出每一項與處理 Skill，依 runbook 第 10 節步驟 6 交給 SDD 流程。
```

## 11. 構想評估流程

### 11.1 什麼時候用

1. 有一個產品或功能構想，還沒決定要做，要在寫 `spec.md` 之前判斷值不值得做。
2. 不用於已決定要做的功能：直接用步驟 2 的 `s-specify`（P2）。
3. 不用於只需訪談釐清需求的情況（改用 `clarify`），也不用於錯誤回報（改用第 10 節）。

報告放在 `specs/ideas/<slug>/assessment.md`。`idea-assess` 評估過程中不提問（沒有構想或報告已存在時除外），只寫報告目錄，不執行 `s-specify`。

### 11.2 步驟

1. `idea-assess`（I1）：寫 `assessment.md`，回報結論、推薦方案與整體證據信心。
   - 報告已存在、提示詞沒有指明時：`idea-assess` 問你要覆寫還是改用新 slug。你選一種。
   - 結論為 go：進第 2 步。
   - 結論為 needs-clarification：你回答報告列出的阻擋問題，再用 I1r 帶著回答重新執行 `idea-assess`。
   - 結論為 kill：結束這個流程。決定性理由留在 `assessment.md`。要另提構想時，用新 slug 從第 1 步重新開始。
2. 決定是否採用（I2）：你讀報告，決定要不要做。
   - 採用時：依下列順序接回第 4 節。
     1. 貼 P0 開新迭代。P0 的「本次功能」改寫成「見 specs/ideas/{IDEA_SLUG}/assessment.md 的交接摘要」，把實際貼的內容記進迭代紀錄（9.0「固定環境」）。在第 5 節新增本次的一列。
     2. 貼上 `assessment.md` 判定段「交接給 `s-specify`」的指令區塊，代替 P2。延續既有系統時，在指令最後加一行「相容邊界：{COMPAT}」。貼上的指令會執行 `s-specify`，產出 `spec.md`。
     3. 請 agent 做步驟 2 的「結束後的檢查」，寫進迭代紀錄。之後從步驟 3 繼續。
   - 不採用時：結束這個流程。

### 11.3 變數

| 變數 | 意思 | 例子 |
|---|---|---|
| `{IDEA}` | 構想描述：要解決什麼問題、給誰用、已知限制，可附專案檔案路徑 | — |
| `{IDEA_SLUG}` | slug；I1 沒有時由 `idea-assess` 擬定，之後沿用 | `equipment-loan-notify` |
| `{ANSWERS}` | 阻擋問題的回答，一題一行 | — |

### 11.4 提示詞

#### I1 `idea-assess`

```text
請做 runbook 第 11 節步驟 1：讀取 .agents/skills/idea-assess/SKILL.md 並依其 SOP 執行。
構想：{IDEA}
Slug：{IDEA_SLUG}（沒有時寫「由 idea-assess 擬定」）
不 commit，不執行 s-specify。依 SOP 回報結論後停下來。
```

#### I1r 重新評估（第 1 步結論為 needs-clarification 時）

```text
請重新執行 runbook 第 11 節步驟 1：讀取 .agents/skills/idea-assess/SKILL.md 並依其 SOP 重新評估 slug {IDEA_SLUG}，覆寫 specs/ideas/{IDEA_SLUG}/assessment.md。
構想：{IDEA}
阻擋問題的回答：{ANSWERS}
不 commit，不執行 s-specify。依 SOP 回報結論後停下來。
```

I2 沒有固定提示詞：依 11.2 步驟 2，先貼 P0，再貼 `assessment.md` 判定段的 `s-specify` 指令區塊。
