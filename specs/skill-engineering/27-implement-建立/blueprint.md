# 工程藍圖：implement－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/27-implement-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「確認」（2026-11-01）：接受推定的 E9、E10、E11（皆為通用），確認 S1 以全量開發 001 驗收、執行前需啟動 Docker Desktop，確認藍圖其餘內容。
- 施工差異（2026-11-01，W2 前）：依 `skill-form-sop` 的 `SOP-按需載入-格式規範` Rule 1（不得為載入參考檔建立獨立 Phase、載入步驟須緊鄰第一個依賴步驟），原 Phase 2「載入執行規則」併入「逐一執行任務」，四份 RuleFile 改為在首次使用前「尚未載入時」載入；Phase 數 4 → 3，步驟數不變，行為與驗收條件不變。使用者回覆「確認」。
- 前置決策（2026-11-01，使用者以 clarify 回覆「都照建議」，建議依據為 wsa-course 第三章〈【基因工程】分割擊破的最後一步…/implement〉）：
  1. 設計與驗收以客製版 tasks.md 為準：先以 `tasks` Skill 為 `specs/001-online-pvp-1a2b/` 重新產出客製版並覆寫原版；新 Skill 不相容原版格式。
  2. 執行中遇到上游矛盾、待確認或修不好的錯誤時，不停下來問，依專業判斷自行決策並記錄，此規則優先於 tasks.md Reference Loading Contract 第 6、7 點。
  3. 不碰 git commit；第五章「implement 完成後詢問是否 commit」記入 `docs/待確認.md`，不預做。
- 目標位置：使用者指定 `.claude/skills/implement/`，完成後以 `scripts/sync-skills.sh --from claude` 同步到 `.agents/skills/`。
- 參考基因：`.spec-kit/claude-skills/speckit-implement/SKILL.md`（使用者明確要求參考）。

### speckit-implement 取捨

| # | speckit-implement 內容 | 處理 | 對應 |
| - | ---------------------- | ---- | ---- |
| K1 | 逐 Phase 執行、遵守依賴、Phase 結束驗證 | 保留：依 tasks.md 順序執行，Phase 完成時做 Checkpoint 驗證，User Story Phase 用 Independent Test | E1、E4 |
| K2 | 同檔案任務循序、`[P]` 可平行 | 收緊：一次只做一個任務、不跳步，`[P]` 不同時開工 | E1 |
| K3 | 完成的任務標 `[X]` | 保留並明確化：實作與驗證通過後立即標記 | E3 |
| K4 | 非平行任務失敗即停止 | 改寫：修正最多 3 輪，仍失敗時自行決策或記為受阻，繼續其他任務 | E5 |
| K5 | 完成時檢查符合 spec、plan 與測試 | 改寫：每個任務依類型驗證，Phase 完成時 Checkpoint 驗證 | E4 |
| K6 | 建立或補齊 ignore 檔 | 保留原則，只依任務實際引入的技術補齊，不搬 15 種語言清單 | E7 |
| K7 | 每個任務回報進度、最後完成報告 | 保留 | E2、E10 |
| K8 | argument-hint 的任務篩選 | 保留：可指定任務 ID、範圍或 Phase | E1 |
| D1 | Extension hooks（`.specify/extensions.yml`） | 刪除：本專案沒有此機制 | — |
| D2 | `check-prerequisites.sh` 等 `.specify/` 依賴 | 刪除：改從 `specs/<編號>-<名稱>/tasks.md` 決定目標 | E9 |
| D3 | `checklists/` 閘門 | 刪除：本流程不產生 checklists | — |
| D4 | 開工前全文載入 plan、data-model、contracts、research 等 | 刪除：改依 Reference Loading Contract 按任務載入 Must Read | E2 |
| D5 | 強制 TDD（Tests before code） | 刪除：依 tasks.md 的 `**Tests**:` 政策；TDD 為第四章內容 | E11 |
| D6 | 解析 Setup／Tests／Core／Integration／Polish | 刪除：改解析 Setup／Foundational／User Story／Polish | E1 |
| N1 | （新增）對外識別字逐字照上游 | 新增 | E6 |
| N2 | （新增）已打勾的任務不重做，可中斷後續跑 | 新增 | E1 |
| N3 | （新增）以腳本只取出下一個任務區塊、打勾 | 新增 | E1、E3 |
| N4 | （新增）待確認與矛盾的自主決策與紀錄 | 新增 | E5 |

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 未指定範圍時，從第一個未打勾的任務起依 tasks.md 順序一次執行一個任務，直到所有任務都打勾或記為受阻；使用者指定任務 ID、ID 範圍或 Phase 時只執行範圍內的任務；已打勾的任務不重做；`[P]` 任務不同時進行 | 本次（圖：按照 tasks 完成開發任務；課程：沒指定範圍時自動執行下一個已解鎖的 Task、支援執行單一 Task；K1、K2、K8、N2） | 通用 |
| E2 | 每個任務的進度回報列出本任務讀取的 Must Read 部位，與 tasks.md 該任務的 Must Read 一致；讀取 Optional 時寫出觸發的情況 | 本次（課程：執行參考、按需閱讀；D4） | 通用 |
| E3 | 任務的實作與驗證都通過後，才在 tasks.md 把該任務標為 `[X]`，並在開始下一個任務前完成；tasks.md 除了核取方塊以外沒有其他變更；受阻任務維持 `[ ]` | 本次（課程：完成後立刻回寫打勾；K3） | 通用 |
| E4 | 每個任務的進度回報寫出依任務類型選擇的驗證命令與結果，驗證實際執行任務要求的行為（例如端點任務實打端點並核對回應與錯誤碼），不只編譯；每個 Phase 完成時執行 Checkpoint 驗證，User Story Phase 依該 Phase 的 Independent Test | 本次（圖：高度可靠、最少 bugs；課程：依任務做最適合的驗證；K1、K5） | 通用 |
| E5 | 執行期間不向使用者提問、不等待回覆；遇到上游矛盾、Notes 待確認、Must Read 與任務描述矛盾或環境受阻時自行決策並繼續；完成報告的決策紀錄逐項寫出任務 ID、情況、決定、理由與影響範圍；受阻任務不以假實作或略過驗證充當完成 | 本次（前置決策 2；課程：阻塞也不要停下來問，依專業判斷決策並當責；K4、N4） | 通用 |
| E6 | 程式中對外可見的識別字（API 路徑與方法、錯誤碼、狀態碼、事件名稱、欄位、Enum 值、畫面文字）與任務描述或其參考部位逐字相同 | 本次（圖：最少 bugs；N1） | 通用 |
| E7 | 任務引入的技術會產生依賴目錄、建置輸出、環境變數檔或產生碼時，ignore 檔在該任務完成時已涵蓋；既有 ignore 條目不被刪除；migration、lock 檔與 `.env.example` 不被忽略 | 本次（課程：repo 衛生也要做；K6） | 通用 |
| E8 | 執行全程不建立 commit、不 push；完成報告列出新增與修改的檔案 | 本次（前置決策 3） | 通用 |
| E9 | 找不到 tasks.md、有多份且使用者未指定，或 tasks.md 不是 `tasks` Skill 的格式（沒有 Reference Loading Contract 或有任務沒有 Must Read）時，停止並告知原因與下一步，不修改任何檔案 | 推定：前置決策 1 只支援客製格式；這是開始實作前唯一的停止點，停止時不應留下半成品 | 通用 |
| E10 | 完成報告包含範圍內完成數與總數、受阻任務與原因、各 Phase Checkpoint 結果、決策紀錄、新增與修改的檔案，以及本機啟動與操作方式 | 推定：課程示範 implement 結束時說明如何啟動前後端；全自動執行時，報告是使用者唯一的檢查入口 | 通用 |
| E11 | 驗證時建立的臨時檔案與背景程序在驗證後清除；不新增 tasks.md 沒有要求的測試檔 | 推定：測試政策由 tasks.md 的 `**Tests**:` 決定（D5）；臨時檔留在 repo 會混入使用者的 commit | 通用 |

## 2. To-Be SOP

````markdown
---
name: implement
description: （由 W1 依 skill-form-description 撰寫）
---

# SOP

## Phase 1 -- 確定執行範圍

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/tasks.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/tasks.md` 取得；沒有符合的檔案時清單為空），建立「執行輸入」。
2. `THINK` 決定「目標 tasks」與「執行範圍」：使用者指定 spec 目錄或 tasks.md 路徑時使用該份，未指定且清單只有一份時使用該份，其餘情況視為未決定；使用者指定任務 ID、ID 範圍或 Phase 時，執行範圍寫成 `--scope` 參數（例如 `T005,T010-T014,phase:3`），未指定時為全部任務。
3. `CHECK` 「目標 tasks」不存在時，告知使用者需要先產出 tasks.md（可使用 `tasks`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py status <tasks.md 絕對路徑> [--scope <執行範圍>]`，取得「任務狀態」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
5. `CHECK` 腳本退出狀態不為零時，依標準錯誤輸出修正參數後重新執行步驟 4；「任務狀態」的 `format_issues` 不為空時，列出問題，告知使用者以 `tasks` 重新產出 tasks.md 並停止執行；「任務狀態」的 `scope.remaining` 為空時，回報範圍內已全部完成並停止執行。

完成條件：已決定目標 tasks 與執行範圍，tasks.md 格式符合且範圍內有未完成的任務；或已停止並回報原因，沒有修改任何檔案。

## Phase 2 -- 逐一執行任務

1. `READ` 「任務狀態」的 `context`（tasks.md 的 Tests 政策、Reference Loading Contract、Path Conventions、Dependencies & Execution Order 與 Notes），建立「執行脈絡」，並建立空的「受阻任務」與「決策紀錄」。
2. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py next <tasks.md 絕對路徑> [--scope <執行範圍>] [--skip <受阻任務 ID>...]`，取得「目前任務」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
3. `CHECK` 腳本退出狀態不為零時，依標準錯誤輸出修正參數後重新執行步驟 2；「目前任務」的 `task` 為 `null` 時進入 Phase 3。
4. `READ` 依「執行脈絡」的 Reference Loading Contract，讀取「目前任務」列出的所有 Must Read 部位，建立「任務參考」。
5. `READ` 尚未載入時，讀取 `rules/自主決策-格式規範.md` 的所有 Rule，建立「決策檢查清單」。
6. `READ` 尚未載入時，讀取 `rules/專案衛生-格式規範.md` 的所有 Rule，建立「專案衛生檢查清單」。
7. `READ` 尚未載入時，讀取 `rules/任務實作-格式規範.md` 的所有 Rule，建立「實作檢查清單」。
8. `WRITE` 依「目前任務」、「任務參考」、「實作檢查清單」、「專案衛生檢查清單」與「決策檢查清單」實作任務；遇到 Optional 的 Why 所描述的情況時，讀取該 Optional 部位。
9. `READ` 尚未載入時，讀取 `rules/任務驗證-格式規範.md` 的所有 Rule，建立「驗證檢查清單」。
10. `CHECK` 依「驗證檢查清單」驗證本任務，取得「驗證結果」；未通過時修正後重新驗證，最多 3 輪；第 3 輪仍未通過時依「決策檢查清單」處理，任務記入「受阻任務」時略過步驟 11。
11. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py check <tasks.md 絕對路徑> <任務 ID>`，把本任務標為 `[X]`，確認退出狀態為零；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
12. `WRITE` 回報本任務進度：任務 ID、完成或受阻、讀取的 Must Read 與 Optional 部位（Optional 附觸發情況）、驗證命令與結果、本任務的決策；決策同時依「決策檢查清單」加入「決策紀錄」。
13. `CHECK` 「目前任務」的 `closes_phase` 為 `true` 時，依「驗證檢查清單」執行該 Phase 的 Checkpoint 驗證，未通過時修正後重新驗證，最多 3 輪，仍未通過時依「決策檢查清單」記入「決策紀錄」；之後返回步驟 2。

完成條件：範圍內每個任務都已標為 `[X]` 或記入「受阻任務」，每個完成的 Phase 都已執行 Checkpoint 驗證。

## Phase 3 -- 完成報告

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py status <tasks.md 絕對路徑> [--scope <執行範圍>]`，取得「最終狀態」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；並在專案根目錄執行 `git status --short`，取得「檔案變更」。
2. `WRITE` 向使用者回報完成報告：範圍內完成數與總數（依「最終狀態」）、「受阻任務」與原因及因此略過的任務、各 Phase Checkpoint 驗證結果、「決策紀錄」、「檔案變更」中新增與修改的檔案，以及本機啟動與操作方式。

完成條件：完成報告已回報使用者。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name`、`description` | 觸發與分流 |
| Phase 1 -- 確定執行範圍（5 步） | 新增 | 決定目標 tasks 與範圍、找不到或多份時停止、腳本檢查格式與狀態 | E1、E9；C1–C5 |
| Phase 2 -- 逐一執行任務（13 步） | 新增 | 載入執行脈絡、取下一個任務、讀 Must Read、按需載入四份檢查清單、實作、驗證、打勾、回報、Checkpoint | E1–E7、E11；C6–C10、C20–C23 |
| Phase 3 -- 完成報告（2 步） | 新增 | 取得最終狀態與檔案變更、回報 | E8、E10；C24 |
| `rules/任務驗證-格式規範.md`（3 條 Rule） | 新增 | 依類型驗證、Checkpoint、清除驗證痕跡 | E4、E11；C11–C13 |
| `rules/自主決策-格式規範.md`（3 條 Rule） | 新增 | 不提問自行決策與權威順序、受阻處理、決策紀錄 | E5；C14–C16 |
| `rules/專案衛生-格式規範.md`（1 條 Rule） | 新增 | ignore 檔依實際技術補齊 | E7；C17 |
| `rules/任務實作-格式規範.md`（2 條 Rule） | 新增 | 只做目前任務、對外識別字逐字 | E1、E6、E8、E11；C18、C19 |
| `scripts/tasks_state.py` | 新增 | `status`、`next`、`check` 三個子命令 | E1、E3、E9；C3、C7、C9 |
| `LICENSE` | 新增 | 註明 speckit-implement 衍生內容並保留 MIT 全文；更新根目錄 `LICENSE` 授權範圍 | CLAUDE.md 規則 3 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 20 | +20 |
| RuleFile | 0 | 4 | +4 |
| Rule | 0 | 9 | +9 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 0 | 1 | +1 |

- 新建模式，所有元素都是新增。
- 腳本：一份 tasks.md 約 60 個任務、160 項參考；逐次找出「範圍內第一個未打勾且未受阻」的任務、判斷是否為 Phase 最後一個、只改一行核取方塊，都可由程式判斷且可重複執行，也讓每個任務只把該任務區塊載入上下文（E1、E3、E9）。
- RuleFile：驗證（E4、E11）、自主決策（E5）、專案衛生（E7）、任務實作（E1、E6、E8）是四個不同主題，各自需要語意判斷與正反例，不合併。
- 不建立樣板組：Skill 的產出是程式碼與對話中的報告，沒有固定格式的產出檔案；報告欄位一句話即可寫在步驟內文。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 目標 tasks 的決定規則（指定優先，否則唯一一份）與執行範圍寫成 `--scope` | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達；腳本無法解讀使用者的自然語言範圍 |
| C2 | 找不到或多份未指定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C3 | 格式檢查（有 `## Reference Loading Contract`、每個任務有 Must Read、任務 ID 不重複）、範圍內完成數、`context` 擷取 | P1-4、P3-1 | `scripts/tasks_state.py` `status` | 輸入輸出明確、可重複執行、結果可由程式判斷 |
| C4 | 格式不符或範圍內已全部完成時停止 | P1-5 | SOP 流程 | 屬於分支與停止 |
| C5 | 腳本缺 `uv` 的處理 | P1-4、P2-2、P2-11、P3-1 | 各步驟內文 | skill-form-script 規定的固定寫法，不視為重複 |
| C6 | 初始化「受阻任務」與「決策紀錄」 | P2-1 | P2-1 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C7 | 下一個任務 = 範圍內依檔案順序第一個未打勾、不在 `--skip` 的任務；輸出任務區塊原文、所屬 Phase 的 Goal／Independent Test／Checkpoint、端點組標題、任務引用的待確認原文、`closes_phase`（同 Phase 其他任務都已打勾或在 `--skip` 中） | P2-2 | `scripts/tasks_state.py` `next` | 可由程式判斷；避免每次讀整份 tasks.md |
| C8 | 沒有下一個任務時進入 Phase 3 | P2-3 | SOP 流程 | 屬於 Phase 轉移 |
| C9 | 打勾只把該任務那一行的 `- [ ]` 改為 `- [X]`；任務不存在或已打勾時失敗 | P2-11 | `scripts/tasks_state.py` `check` | 可由程式判斷；避免手動編輯改到其他內容（E3） |
| C10 | Must Read 依 tasks.md 的 Reference Loading Contract 讀取；Optional 只在 Why 描述的情況讀取 | P2-4、P2-8 | 各步驟內文（引用 tasks.md 的 Contract） | 讀取方式已由 tasks.md 自帶的 Contract 規定，Skill 只引用不重述 |
| C11 | 依任務類型選擇驗證方式，並實際執行任務要求的行為（設定與套件、schema 與 migration、後端模組與端點、即時事件、前端元件與畫面、文件），記錄命令與結果 | P2-10 | `rules/任務驗證-格式規範.md` Rule 1 | 判斷任務類型與足夠的驗證需要語意；需要「只跑 `tsc` 就算驗證端點」的反例 |
| C12 | Phase Checkpoint：Foundational 確認兩端型別檢查與伺服器啟動；User Story 依 Independent Test 以 HTTP／Socket.IO 腳本等可自動化方式走一次，需要人工操作瀏覽器的步驟列入完成報告的人工驗證項目；Polish 依其任務 | P2-13 | `rules/任務驗證-格式規範.md` Rule 2 | Independent Test 轉成可執行步驟需要判斷與正反例 |
| C13 | 驗證用的臨時檔案、資料與背景程序在驗證後清除；不新增 tasks.md 沒有要求的測試檔 | P2-10、P2-13 | `rules/任務驗證-格式規範.md` Rule 3 | 判斷什麼算臨時檔需要正反例 |
| C14 | 執行期間不向使用者提問；矛盾依權威順序決策（spec.md 需求與驗收情境 > contracts／data／ui 介面規格 > research／techstack 技術決策 > tasks.md 任務描述；Notes 待確認的暫行做法不違反上層時沿用）；同層矛盾以不改動任一方對外契約的轉換處理；本規則優先於 Contract 第 6、7 點 | P2-8、P2-10、P2-13 | `rules/自主決策-格式規範.md` Rule 1 | 權威判斷需要語意與正反例 |
| C15 | 受阻判定：先找根因並嘗試替代做法，只有環境限制（服務無法啟動、無法安裝、缺少權限或憑證）才記為受阻；受阻任務不打勾；直接依賴其產出的後續任務一併記入受阻，其餘照常；不得以假實作、略過驗證或降低要求充當完成 | P2-10 | `rules/自主決策-格式規範.md` Rule 2 | 區分環境受阻與程式錯誤需要判斷與反例 |
| C16 | 決策紀錄每項寫出任務 ID、情況（引用矛盾的部位）、決定、理由與影響範圍 | P2-12、P2-13 | `rules/自主決策-格式規範.md` Rule 3 | 需要「只寫『已處理』」的反例 |
| C17 | ignore 檔依任務實際引入的技術補齊（依賴目錄、建置輸出、環境變數檔、日誌、產生碼、OS 雜檔）；Dockerfile 存在才建立 `.dockerignore`；已存在時只補缺少的條目、不刪既有條目；不忽略 migration、lock 檔、`.env.example` | P2-8 | `rules/專案衛生-格式規範.md` Rule 1 | 判斷技術會產生什麼、哪些不能忽略需要正反例 |
| C18 | 只實作目前任務：只建立或修改任務描述提到的檔案與內容（加上 ignore 檔）；不提前做後面任務的內容；不加任務沒有要求的功能、測試或重構；`[P]` 不同時開工；不修改 tasks.md 的內容；不執行 git commit、push 或改寫歷史 | P2-8 | `rules/任務實作-格式規範.md` Rule 1 | 判斷是否超出任務範圍需要正反例 |
| C19 | 對外可見的識別字與任務描述或參考部位逐字相同；只有內部名稱可以自取 | P2-8 | `rules/任務實作-格式規範.md` Rule 2 | 區分對外與內部名稱需要正反例 |
| C20 | 驗證最多 3 輪，仍未通過依決策檢查清單處理；受阻時略過打勾 | P2-10 | SOP 流程 | 屬於執行順序與分支 |
| C21 | 進度回報欄位 | P2-12 | P2-12 步驟內文 | 只屬於回報步驟，一句話即可表達 |
| C22 | Phase 最後一個任務完成後執行 Checkpoint，再返回取下一個任務 | P2-13 | SOP 流程 | 屬於執行順序 |
| C23 | 實作時同時套用實作、衛生與決策檢查清單 | P2-8 | P2-8 步驟內文 | 只屬於單一步驟 |
| C24 | 完成報告欄位 | P3-2 | P3-2 步驟內文 | 只屬於回報步驟，一句話即可表達；報告是對話輸出，不是檔案，不適用樣板組 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.claude/skills/implement/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.claude/skills/implement/SKILL.md` SOP | 寫入胖 SOP | C1–C24 | 已完成 |
| 3 | W3 | `skill-derive-script` | Phase 3 狀態步驟、Phase 2 打勾步驟、Phase 2 取任務步驟、Phase 1 檢查狀態步驟（由後往前） | 抽取 `scripts/tasks_state.py` | C3、C7、C9 | 已完成 |
| 4 | W4 | `skill-derive-rule` | Phase 2 的 Checkpoint 與驗證 `CHECK` 步驟 | 抽取 `rules/任務驗證-格式規範.md` | C11–C13 | 已完成 |
| 5 | W5 | `skill-derive-rule` | Phase 2 的驗證 `CHECK` 與實作 `WRITE` 步驟 | 抽取 `rules/自主決策-格式規範.md` | C14–C16 | 已完成 |
| 6 | W6 | `skill-derive-rule` | Phase 2 的實作 `WRITE` 步驟 | 抽取 `rules/專案衛生-格式規範.md` | C17 | 已完成 |
| 7 | W7 | `skill-derive-rule` | Phase 2 的實作 `WRITE` 步驟 | 抽取 `rules/任務實作-格式規範.md` | C18、C19 | 已完成 |
| 8 | W8 | `skill-engineering` 直接撰寫 | `.claude/skills/implement/LICENSE`、根目錄 `LICENSE` | 註明 speckit-implement 衍生內容並保留 MIT 全文；授權範圍加入 `implement` | CLAUDE.md 規則 3 | 已完成 |
| 9 | W9 | `skill-engineering` 直接撰寫 | `docs/待確認.md` | 新增一項：第五章 implement 完成後詢問是否 commit，本次不預做 | 前置決策 3、CLAUDE.md 規則 5 | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: implement`
- `description`：已有 `tasks` Skill 產出的 tasks.md（含 Reference Loading Contract 與每個任務的 Must Read／Optional），要依任務清單實際開發時使用：依 tasks.md 順序一次執行一個任務，開工前只讀該任務的 Must Read 部位，實作後依任務類型驗證，通過才在 tasks.md 打勾，Phase 完成時做 Checkpoint 驗證；全程不向使用者提問，上游矛盾與受阻自行決策並記錄，最後回報完成報告；可指定任務 ID、範圍或 Phase。觸發關鍵字：implement、實作、開發 tasks.md、執行任務、照任務開發。分流：沒有 tasks.md 或要產生、修改任務清單改用 `tasks`；規劃類別圖改用 `plan-with-class-diagram`。
- 未經使用者實際驗證前，`description` 開頭加「（未驗證）」。

#### W2：胖 SOP

Phase 1 與 Phase 3 與 To-Be SOP 全文相同，但腳本步驟在 W3 前先寫成手動步驟：

- P1-4 寫成：`THINK` 讀取「目標 tasks」，確認有 `## Reference Loading Contract` 區塊、每個任務（`- [ ] T` 或 `- [X] T` 開頭的行）下方有 `**Must Read**` 與至少一項參考、任務 ID 不重複，計算範圍內已打勾與未打勾的任務數，並擷取 Tests 政策、Reference Loading Contract、Path Conventions、Dependencies & Execution Order 與 Notes，建立「任務狀態」。
- P1-5 寫成：`CHECK` 「任務狀態」有格式問題時，列出問題，告知使用者以 `tasks` 重新產出 tasks.md 並停止執行；範圍內沒有未完成的任務時，回報已全部完成並停止執行。
- P3-1 寫成：`THINK` 重新計算範圍內已打勾與未打勾的任務數，建立「最終狀態」，並在專案根目錄執行 `git status --short`，取得「檔案變更」。

Phase 2 寫成：

```markdown
## Phase 2 -- 逐一執行任務

1. `READ` 「任務狀態」中擷取的 Tests 政策、Reference Loading Contract、Path Conventions、Dependencies & Execution Order 與 Notes，建立「執行脈絡」，並建立空的「受阻任務」與「決策紀錄」。
2. `READ` 在 tasks.md 中找出執行範圍內依檔案順序第一個未打勾、不在「受阻任務」中的任務，取得該任務區塊原文、所屬 Phase 的 Goal／Independent Test／Checkpoint、端點組標題與任務引用的待確認原文，並判斷同 Phase 其他任務是否都已打勾或受阻，建立「目前任務」。
3. `CHECK` 找不到「目前任務」時進入 Phase 3。
4. `READ` （同 To-Be P2-4）
5. `WRITE` 依「目前任務」與「任務參考」實作任務；遇到 Optional 的 Why 所描述的情況時，讀取該 Optional 部位：
   - 只建立或修改任務描述提到的檔案與內容（加上 ignore 檔）；不提前做後面任務的內容；不加任務沒有要求的功能、測試或重構；`[P]` 任務不同時開工；不修改 tasks.md 的內容；不執行 git commit、push 或改寫歷史。
   - 對外可見的識別字（API 路徑與方法、錯誤碼、狀態碼、事件名稱、欄位、Enum 值、畫面文字）與任務描述或參考部位逐字相同；只有內部名稱可以自取。
   - 任務引入的技術會產生依賴目錄、建置輸出、環境變數檔、日誌、產生碼或 OS 雜檔時，建立或補齊 ignore 檔；Dockerfile 存在才建立 `.dockerignore`；已存在時只補缺少的條目、不刪既有條目；不忽略 migration、lock 檔與 `.env.example`。
   - 不向使用者提問；遇到上游矛盾時依權威順序決策：spec.md 需求與驗收情境 > contracts／data／ui 介面規格 > research／techstack 技術決策 > tasks.md 任務描述；Notes 待確認的暫行做法不違反上層時沿用；同層矛盾以不改動任一方對外契約的轉換處理；本規則優先於 tasks.md Contract 第 6、7 點。
6. `CHECK` 驗證本任務，取得「驗證結果」：依任務類型選擇驗證方式並實際執行任務要求的行為（設定與套件、schema 與 migration、後端模組與端點、即時事件、前端元件與畫面、文件），記錄命令與結果；驗證用的臨時檔案、資料與背景程序在驗證後清除，不新增 tasks.md 沒有要求的測試檔；未通過時修正後重新驗證，最多 3 輪；第 3 輪仍未通過時，先找根因並嘗試替代做法，只有環境限制（服務無法啟動、無法安裝、缺少權限或憑證）才把任務與直接依賴其產出的後續任務記入「受阻任務」並略過步驟 7；不得以假實作、略過驗證或降低要求充當完成。
7. `WRITE` 在 tasks.md 中只把本任務那一行的 `- [ ]` 改為 `- [X]`。
8. `WRITE` （同 To-Be P2-12）；每項決策寫出任務 ID、情況（引用矛盾的部位）、決定、理由與影響範圍。
9. `CHECK` 本任務是所屬 Phase 最後一個未完成任務時，執行該 Phase 的 Checkpoint 驗證：Foundational 確認兩端型別檢查與伺服器啟動；User Story 依 Independent Test 以 HTTP／Socket.IO 腳本等可自動化方式走一次，需要人工操作瀏覽器的步驟列入完成報告的人工驗證項目；Polish 依其任務；未通過時修正後重新驗證，最多 3 輪，仍未通過時記入「決策紀錄」；之後返回步驟 2。

完成條件：（同 To-Be）
```

#### W3：抽取 `scripts/tasks_state.py`

- 目標步驟（由後往前）：Phase 3 -- 完成報告的 `THINK`（「重新計算範圍內已打勾與未打勾的任務數」）；Phase 2 -- 逐一執行任務的打勾 `WRITE`（「只把本任務那一行的 `- [ ]` 改為 `- [X]`」）與取任務 `READ`（「找出執行範圍內依檔案順序第一個未打勾」）；Phase 1 -- 確定執行範圍的 `THINK`（「確認有 `## Reference Loading Contract` 區塊」）。
- 介面：`uv run --script scripts/tasks_state.py {status|next|check} <tasks.md> ...`；只用標準函式庫；標準輸出 JSON；退出碼 0 成功、1 邏輯錯誤（任務不存在、已打勾）、2 參數或檔案錯誤。
- `--scope`：逗號分隔，元素為 `T005`、`T010-T014` 或 `phase:3`；省略時為全部任務。
- `status <tasks.md> [--scope]`：`{"total", "done", "scope": {"total", "done", "remaining"}, "phases": [{"number", "title", "total", "done"}], "format_issues": [...], "context": "<Tests 行、Reference Loading Contract、Path Conventions、Dependencies & Execution Order、Notes 原文>"}`；`format_issues` 包含：沒有 `## Reference Loading Contract`、沒有任何任務、任務 ID 重複、任務沒有 `**Must Read**` 或其下沒有參考行、`--scope` 指到不存在的任務或 Phase。
- `next <tasks.md> [--scope] [--skip ID ...]`：`{"task": {"id", "block", "phase": {"number", "title", "goal", "independent_test", "checkpoint"}, "group", "pending": [{"n", "text"}], "closes_phase"} | null, "scope_remaining", "skipped"}`；`block` 為任務行到下一個任務或標題前的原文；`pending` 為任務區塊中「待確認 n」對應的 Notes 原文；`closes_phase` 為同 Phase 其他任務都已打勾或在 `--skip` 中。
- `check <tasks.md> <ID>`：只把該任務行的 `- [ ]` 改為 `- [X]`，其餘位元組不變；輸出 `{"id", "done", "total"}`。
- 驗證：以重產的 001 客製版 tasks.md 複本與一份臨時建立的小型 tasks.md 執行三個子命令；以原版格式的 tasks.md（git `ec338e1` 版本）確認 `format_issues` 不為空；`check` 前後以 diff 確認只有一行改變。
- After：P1-4 改為 `DELEGATE` 執行 `status`（To-Be P1-4），P1-5 改為判讀腳本輸出（To-Be P1-5）；P2-1 改為讀取「任務狀態」的 `context`；P2-2 改為 `DELEGATE` 執行 `next`、P2-3 判讀 `task` 為 `null`；打勾步驟改為 `DELEGATE` 執行 `check`；Checkpoint 步驟改為判讀 `closes_phase`；P3-1 改為 `DELEGATE` 執行 `status`。

- 施工註記（W3）：依 `skill-derive-script` 的 `腳本委派-格式規範` Rule 3（執行腳本後必須檢查退出狀態），P1-5、P2-3 加入「腳本退出狀態不為零時，依標準錯誤輸出修正參數後重新執行」，P1-5 的「範圍內沒有未完成的任務」改為判讀 `scope.remaining`，P3-1 加入缺少 `uv` 的處理；To-Be SOP 已同步為施工後內容，行為不變。
- 施工註記（W3 驗證）：以 001 客製版 tasks.md 執行 `status`（59 個任務、`format_issues` 為空）、原版格式 tasks.md（`ec338e1`，60 項 `format_issues`）、`next --scope phase:3`（T021，Goal／Independent Test 正確）、`next --scope T017`（帶出待確認 5 原文）、`check`（diff 只有一行）、重複打勾（退出 1）、`--skip`、`--scope` 格式錯誤（退出 2）、不存在的檔案（退出 2）、反向範圍 `T020-T008`。

#### W4：抽取 `rules/任務驗證-格式規範.md`

- 目標步驟：Phase 2 的驗證 `CHECK`（「依任務類型選擇驗證方式」）與 Checkpoint `CHECK`（「執行該 Phase 的 Checkpoint 驗證」）。
- Rule 1 依任務類型驗證並實際執行任務行為（C11）；Rule 2 Phase Checkpoint（C12）；Rule 3 清除驗證痕跡、不新增測試檔（C13）。正反範例使用與 1A2B、購物車不同的情境。
- After：驗證 `CHECK` 前加入「尚未載入時」的 `READ` 載入步驟建立「驗證檢查清單」（To-Be P2-9）；驗證與 Checkpoint 步驟改為依「驗證檢查清單」，刪除內文中屬於 C11–C13 的描述。

#### W5：抽取 `rules/自主決策-格式規範.md`

- 目標步驟：Phase 2 的實作 `WRITE`（「不向使用者提問」條列）與驗證 `CHECK`（「先找根因並嘗試替代做法」）。
- Rule 1 不提問、權威順序、優先於 Contract 第 6、7 點（C14）；Rule 2 受阻判定與處理（C15）；Rule 3 決策紀錄（C16）。
- After：實作 `WRITE` 前加入「尚未載入時」的 `READ` 載入步驟建立「決策檢查清單」（To-Be P2-5）；實作、驗證、回報與 Checkpoint 步驟改為依「決策檢查清單」，刪除內文中屬於 C14–C16 的描述。

#### W6：抽取 `rules/專案衛生-格式規範.md`

- 目標步驟：Phase 2 的實作 `WRITE`（「建立或補齊 ignore 檔」條列）。
- Rule 1 ignore 檔依實際技術補齊（C17）。
- After：在決策檢查清單載入步驟之後、實作 `WRITE` 之前加入「尚未載入時」的 `READ` 載入步驟建立「專案衛生檢查清單」（To-Be P2-6）；實作步驟刪除該條列，改為依「專案衛生檢查清單」。

#### W7：抽取 `rules/任務實作-格式規範.md`

- 目標步驟：Phase 2 的實作 `WRITE`（「只建立或修改任務描述提到的檔案」與「對外可見的識別字」條列）。
- Rule 1 只實作目前任務（C18）；Rule 2 對外識別字逐字（C19）。
- After：在專案衛生檢查清單載入步驟之後、實作 `WRITE` 之前加入「尚未載入時」的 `READ` 載入步驟建立「實作檢查清單」（To-Be P2-7）；實作步驟改為 To-Be P2-8 文字。

#### W8：LICENSE

- `.claude/skills/implement/LICENSE`：本 Skill 為自建 Skill，K1–K8 所保留的行為約束（逐 Phase 執行與依賴、完成後標 `[X]`、進度回報、ignore 檔補齊、完成驗證）衍生自 GitHub Spec Kit 的 `speckit-implement`（`templates/commands/implement.md`，MIT License，Copyright GitHub, Inc.）；SOP、RuleFile 與 `scripts/tasks_state.py` 為重新撰寫，未直接複製該檔案；保留 MIT 授權全文。
- 根目錄 `LICENSE` 授權範圍：比照 `tasks` 加入一行 `implement`。

#### W9：`docs/待確認.md`

- 新增一項：第五章〈區分 Truth 和 Plan 兩種 Artifacts (2/2)〉約 6:34、11:58，implement 完成且驗證通過後詢問是否 git commit，作為交付一個 Plan；本次（2026-11-01）依前置決策 3 不預做，上到第五章再處理。

## 7. 驗收情境

測試環境皆為含本次未提交修改的專案暫存複本；情境輸入使用 1A2B spec package（重產的客製版 tasks.md），與 RuleFile 範例情境不同。S1 需要 Docker daemon 已啟動（T014 `prisma migrate dev` 需要 PostgreSQL 容器）。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E8、E10、E11 | 本次 | 「/implement 開發 specs/001-online-pvp-1a2b/ 的 tasks.md 直到完成」 | 無（不應出現提問；若出現，回覆「請依專業判斷自行決定」並記為未通過） | 執行中沒有向使用者提問；tasks.md 所有任務為 `[X]` 或在完成報告列為受阻，且 `git diff` 顯示 tasks.md 只有核取方塊變更；每個任務都有進度回報，列出的 Must Read 與 tasks.md 一致、含驗證命令與結果；每個 Phase 有 Checkpoint 結果；抽查 5 個錯誤碼、2 個事件名稱與 3 句畫面文字在程式中逐字出現；`.gitignore` 涵蓋 `node_modules/`、`dist/`、`.env`，沒有忽略 `prisma/migrations`、lock 檔與 `.env.example`；`git log` 與執行前相同；沒有新增 tasks.md 未要求的測試檔、沒有殘留背景程序；完成報告含 E10 各欄位，決策紀錄涵蓋 tasks.md Notes 的待確認項目 |
| S2 | E1、E3、E5 | 本次 | 暫存複本先依 tasks.md 完成 T001（建立目錄）並打勾；把 `research.md` §1 Decision 結尾的「轉給後端」改為「轉給 `http://localhost:4000` 的後端」，使 T004 的 Must Read 與任務描述（轉給 `http://localhost:3000`）矛盾；輸入「/implement 只執行 specs/001-online-pvp-1a2b 的 Phase 1」 | 無（同 S1） | 從第二個未打勾任務開始，已打勾任務沒有重做；只有 Phase 1 任務被打勾，Phase 2 沒有任何檔案被建立；沒有提問；決策紀錄寫出矛盾的任務 ID、引用的部位、決定與理由 |
| S3 | E9 | 本次 | (a) 暫存複本的 001 tasks.md 換成原版格式（git `ec338e1` 版本），輸入「/implement 開發 specs/001-online-pvp-1a2b/」；(b) 暫存複本刪除所有 `specs/*/tasks.md`，輸入同 (a) | 無 | (a) 停止並指出缺少 Reference Loading Contract／Must Read，建議以 `tasks` 重新產出；(b) 停止並指向 `tasks`；兩者 `git status` 與檔案雜湊皆與執行前相同 |

## 8. 驗收結果

### 施工後結構診斷

- `audit_skill.py --skills-root .claude/skills --skill implement`：errors 0、warnings 0；`rules/` 四份 RuleFile 各由一個 `READ` 步驟載入（P2-5、P2-6、P2-7、P2-9），`scripts/tasks_state.py` 由 P1-4、P2-2、P2-11、P3-1 執行。
- `sync-skills.sh --from claude` 後 `--check` 為「兩邊一致」；同步輸出沒有只存在於目標端的 Skill。

### 驗收方式（第 1 輪）

- 驗收模型：Claude Sonnet（Agent 工具 `model: sonnet`、`effort: medium`），每個情境一個不帶本次分析脈絡的子代理，只提供 Skill 路徑、測試環境、情境輸入與預先回覆；四個子代理平行執行。
- 測試環境：scratchpad 下 `implement-accept/<情境>` 為含本次未提交修改的專案複本，各自提交為 baseline commit，執行前記錄 `git status` 與 spec 目錄所有檔案的 sha256。
- 判斷：主代理以 `git diff`、`git log`、`grep`、雜湊比對與 `npm run check` 獨立核對。
- 測試環境註記：S1、S2 的 `backend/docker-compose.yml` 都位於名為 `backend` 的目錄，Compose 專案名稱相同，S1 沿用了 S2 先啟動的 `backend-postgres-1` 容器；S2 先完成、S1 結束時容器資料已清空，不影響判斷。
- 回報註記：S1、S2 子代理的最終回報都被分類器中途攔下，以 SendMessage 請其以條列補報；S1 另將逐任務回報原文存於 scratchpad 的 `implement-accept/reports.md`。

### 各情境結果（第 1 輪）

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1 | 通過 | 執行中沒有提問；59 個任務全部 `[X]`、無受阻；`git diff` 顯示 tasks.md 只有 59 行核取方塊變更，其他 spec 文件未修改；每個任務都有進度回報（Must Read、Optional、依類型的驗證命令與結果、決策）；Phase 2–6 Checkpoint 以 Playwright 與 Supertest／Socket.IO 腳本實際走完 Independent Test（US1 12 項、US2 16 項、US3 17 項 PASS），Checkpoint 期間發現並修正 2 個缺陷（`.env` 載入、雙方同時離開留下孤兒房間）；抽查 `MATCH_BUSY`、`NOT_YOUR_TURN`、`SECRET_ALREADY_SET`、`OPPONENT_NOT_JOINED`、`ALREADY_CONNECTED`、`room:updated`、`game:ended`、`room:closed` 與 3 句畫面文字皆在程式中逐字出現；`.gitignore` 涵蓋 `node_modules/`、`dist/`、`.env`，未忽略 migrations、lock 檔與 `.env.example`；`git log` 與 baseline 相同；兩端 `npm run check` 通過；沒有新增測試檔、沒有殘留 dev server；決策紀錄 20 項，涵蓋 Notes 待確認 1–6，每項含任務 ID、情況、決定、理由與影響範圍；完成報告各欄（完成數、受阻、Checkpoint、決策、檔案、啟動方式）以補報核對 |
| S2 | 未通過 | 通過部分：沒有提問；從 T002 開始、T001 未重做；只有 T002–T007 打勾、Phase 2 沒有任何檔案；T004 依權威順序採 3000（asyncapi `servers.development` 權威 2 高於 research §1 權威 3），上游文件未修改。未通過：T004 的矛盾在執行當下沒有記入決策紀錄（子代理補報時自述「當時沒有把這項正式記入決策紀錄」），不符 E5；Phase 1 結束時沒有可依循的 Setup Checkpoint 規則，子代理自行補一項收尾檢查（S1 也記為「Setup 無 Checkpoint 條目」），E4「每個 Phase 完成時執行 Checkpoint」缺少依據 |
| S3 | 通過 | (a) 原版格式：停止並指出缺少 Reference Loading Contract 與 59 個任務沒有 Must Read，建議以 `tasks` 重新產出；(b) 沒有 tasks.md：停止並指向 `tasks`；兩者沒有提問，`git status` 乾淨，spec 檔案雜湊與執行前相同 |

### 觀察（不影響判定）

- S2 的 T004 為了確認 port 讀取了 Optional（`asyncapi.yaml` → `servers.development`），當時並未出現 Optional 的 Why 所述情況；子代理在回報中揭露。
- S2 在 `vitest.config` 加入任務沒有要求的 `passWithNoTests`；S1 在 T035 為讓推播運作提前補上 `playing` 狀態對應。兩者都在回報中揭露。

### 失敗處理

- S2 的兩項未通過都來自 Skill（新建模式），返回 Phase 3 修正設計，見「修正設計（第 2 輪）」。

### 修正設計（第 2 輪）

使用者於 2026-11-01 回覆「確認」。只修改既有 RuleFile 內容、不改 SOP 與載入步驟（`skill-form-rule`）：

| 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ------ | ------ | ---- | ---- | ---- | ---- |
| W10 | `skill-form-rule` | `rules/自主決策-格式規範.md` Rule 3 | 新增「依 Rule 1 處理的每一個文件矛盾都必須記入決策紀錄，即使最後採用的做法與任務描述相同」，正反範例加入採用做法與任務描述相同的矛盾（預約保留時間，避開 S2 的埠號情境） | C16 | 已完成 |
| W11 | `skill-form-rule` | `rules/任務驗證-格式規範.md` Rule 2 | 新增 Setup 的 Checkpoint：各端依賴已安裝、Setup 建立的檢查、測試與建置命令都能執行，因尚無原始碼而無法執行的命令寫出留給哪個 Phase 驗證 | C12 | 已完成 |

- 施工後結構診斷：errors 0、warnings 0；`sync-skills.sh --from claude` 後 `--check` 為「兩邊一致」。

### 各情境結果（第 2 輪）

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S2（重跑，全新環境 `S2r`） | 通過 | 沒有提問；T001 未重做，只有 T002–T007 打勾，tasks.md 只有 6 行核取方塊變更，research.md 等上游文件未修改；T004 採 3000，決策紀錄在完成報告中列出「T004｜research §1 寫 4000，T004、openapi `servers`、asyncapi `servers.development` 寫 3000｜proxy 用 3000｜contracts 權威 2 高於 research 權威 3｜vite.config.ts 與後續 T014 監聽埠」；Phase 1 Checkpoint 依新規則確認依賴、lint、prettier、test、Playwright 設定與資料庫連線，並寫出後端 check／build 與前端 build 留給 Phase 2；`git log` 與 baseline 相同，沒有新增測試檔、沒有殘留背景程序 |
| S1、S3 | 沿用第 1 輪通過結果 | W10、W11 只新增要求：S1 的 20 項決策都已記錄、Setup 也做了收尾檢查；S3 在 Phase 1 停止，不經過兩份 RuleFile |

### 觀察（第 2 輪，不影響判定）

- 子代理在 T005 偵測到第 1 輪 S2 留下的 `backend-postgres-1` 佔用 5432，把 compose 埠寫成 `${POSTGRES_PORT:-5432}` 並以專案名稱 `s2r` 驗證，記入決策紀錄；屬測試環境造成的調整。
- T004 仍為了解決矛盾讀取 Optional，並在進度回報寫出原因。

### 收尾

- 驗收結束後以 `docker compose down -v` 移除各測試環境啟動的 PostgreSQL 容器與資料卷。
- 個案驗收條件：無。
- 結論：所有驗收情境均已通過；`description` 保留「（未驗證）」，待使用者以 `user-verify-skill` 實際驗證。
