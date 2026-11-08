# 迭代 Runbook（OpenCode＋Gemini Argon 執行用）

- 建立日期：2026-11-08
- 適用範圍：第三題「設備借用與預約審核系統」的每一次迭代（`s-specify` → `implement`）
- 規劃依據：[第三題選題討論.md](./第三題選題討論.md)（題目、迭代內容、排程、證據保存、第四題 A/B）
- 狀態：未驗證。第 1 次迭代跑完後依實際情況修正本文件

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
| 原始碼位置 | `apps/equipment-loan/`，底下放 `frontend/`、`backend/`（**建議預設，待使用者確認**）。第 1 次迭代時，在 `technical-research` 與 `system-analysis` 以技術限制提供，讓 `plan.md` 的專案結構照這個位置寫 |
| spec 目錄 | `s-specify` 每次自動建新目錄 `specs/<NNN>-<short-name>/`，編號為現有最大編號加一。一次迭代一個 spec 目錄。目前最大編號 002，第 1 次迭代預期為 003 |
| 迭代紀錄 | `docs/iterations/iter-<N>.md`，格式見第 7 節。每一步結束就寫，不等迭代結束才補 |
| Skill 問題交接 | 寫在當次迭代紀錄的「Skill 問題」一節，格式見第 7 節 |
| commit | 依 `conventional-commits` Skill 撰寫訊息。在第 4 節標出的檢查點 commit。使用者在開場提示詞同意後，Argon 才可以自行 commit |
| tag | 依專案規則：使用者驗證通過後才提議，使用者同意才打。不 push |
| 不讀的目錄 | `.spec-kit/`、`specs/001-photo-album-organizer/`（參考素材，使用者要求時才讀） |

## 4. 一次迭代的步驟

每一步都寫成：要做什麼、給 Skill 的輸入、產出、使用者要做的事、結束後的檢查。

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
   - 第 1 次迭代：以 `specs/001-online-pvp-1a2b/techstack.md` 為研究起點，原始碼放 `apps/equipment-loan/`，外部通知用 Discord Webhook（第 5 次迭代才用到）。
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
| 4 | 成員申請改期，改期成功前保留原預約 | 改期失敗時原預約如何保留；重新審核 | 第 14 天要確認第四題方向，並選 1 個影片用的 Skill 優化案例 |
| 5 | 系統辨識逾期借用，呼叫 Discord 通知，管理員查看結果與重試 | 逾期檢查要能手動觸發；通知失敗、逾時、重複的處理 | 依第 8 節的 A/B 流程跑；Webhook URL 放 `.env`，不 commit |
| 6（選做） | 設備送修或停用，處理受影響的預約 | 送修時受影響預約的處理 | 第 14 天檢查點進度超前才做 |
| 7（選做） | 候補與限時確認 | 候補順序與確認期限 | 有餘裕才做 |

## 6. Argon 的可用期限

1. Argon API 預計 2026-11-26 到期。Argon 執行的工作要在 **2026-11-25** 前結束。
2. 到期後還沒做完的步驟，由誰執行：**待使用者決定**。
3. 第四題 A/B 比較時，A、B 兩組要用同一個模型。A/B 跨過到期日時，兩組都要改用同一個替代模型。

## 7. 樣板

### 7.1 迭代紀錄 `docs/iterations/iter-<N>.md`

```markdown
# 迭代 <N>：<本次功能>

- spec 目錄：specs/<NNN>-<short-name>/
- 執行者：OpenCode＋Gemini 4 Argon
- 開始／結束：<日期>／<日期>

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

## 8. 第 5 次迭代的 A/B 流程

詳細設計見 [第三題選題討論.md](./第三題選題討論.md) 的「A/B 比較設計」與「當下必須保存的證據」。執行順序：

1. 第 15 天：跑步驟 2～5，commit，記下這個 commit SHA 作為共用起點。
2. 從共用起點建立兩個 git worktree：A 組、B 組。兩組用同一個模型設定。
3. A 組：在 A 組 worktree 跑步驟 6～7（`tasks`、`analyze`）。產出先存在 A 組 worktree，不放進主目錄。
4. 第 16～18 天：Claude Code 用 `skill-engineering` 建第四題的新 Skill，並修改 `tasks`、`analyze` 接入。
5. B 組：在 B 組 worktree 跑新 Skill，再跑步驟 6～8。
6. 兩組都跑完後，把原始產出歸檔到 `docs/ab-test/group-a/`、`docs/ab-test/group-b/`，附上模型設定與 Skill 版本（commit SHA）。歸檔後不再修改。
7. 只把 B 組的實作合併回主線，繼續步驟 9～12。

## 9. 開場提示詞（每次迭代貼進 OpenCode）

```text
請讀取 docs/dev/迭代-runbook.md，依照它執行第 <N> 次迭代。
- 本次功能：<第 5 節的本次功能>
- 上一次 spec 目錄：<路徑；第 1 次寫「無」>
- 從步驟 <0> 開始。
- 每一步都用路徑指定 Skill：讀取 .agents/skills/<name>/SKILL.md 並依其 SOP 執行。
- 不修改任何 Skill。發現 Skill 問題時，依 runbook 第 7 節格式記進迭代紀錄。
- 我同意你在 runbook 第 4 節標出的檢查點自行 commit（不 push、不打 tag）。
- 每一步結束時，用 3 行以內回報：產出、問題、下一步。
```
