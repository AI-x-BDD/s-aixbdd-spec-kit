# 工程藍圖：analyze－tags 同縮排清單讀不到

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/48-analyze-tags同縮排清單讀不到/`
- 根因報告：同一紀錄目錄的 `rca-report.md`，使用者已確認 E1～E5 與 R1，推定的 E3 保留
- 確認紀錄：2026-11-11 使用者於 Phase 4 回覆：同意修改方案（W1 只改 `collect_coverage.py` 的 `block_tags` 與檔頭說明）、沒有刪除項目、驗收情境 S1～S3；推定的 E3 已於 Phase 2 確認保留

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | OpenAPI 合約的 operation `tags` 以同縮排清單寫法（`tags:` 下一行為同一縮排的 `- <tag>`）撰寫時，`collect_coverage.py` 讀出的每個 operation `tags` 等於該清單的全部項目，不多讀到後面的鍵（例如 `summary:`）；以 B 組 008 spec 目錄執行時，B1～B4 都對應到至少一個合約 operation，`metrics.interfaces_without_planner_output` 為 0 | 本次 | 通用 |
| E2 | 以行內清單（`tags: [B1 …]`）或縮排清單（`tags:` 下一行為多縮排 2 格的 `- <tag>`）撰寫的合約，`collect_coverage.py` 的輸出與修改前完全相同 | 既有 | 通用 |
| E3 | AsyncAPI 合約的 operation `tags` 以同縮排清單寫法撰寫、每項為 `- name: <tag>` 時，`collect_coverage.py` 讀出的 `tags` 為各項的 `name` 值 | 推定（使用者已確認保留） | 通用 |
| E4 | `collect_coverage.py` 仍只讀取檔案、不寫入檔案、不連網，成功時退出狀態為 0 並輸出一個 JSON 物件；輸出欄位的名稱與結構不變 | 既有 | 通用 |
| E5 | `analysis.md`「統計」的數字仍取自「涵蓋盤點」（SOP Phase 3 步驟 2、3 不變） | 既有 | 通用 |

## 2. To-Be SOP

To-Be 的 `SKILL.md` 與 As-Is 逐字相同（frontmatter、3 個 Phase、15 個步驟、完成條件都不變）。推導如下：

1. 依 R1（缺失，位於 `scripts/collect_coverage.py` 的 `block_tags`）推導：E1、E3 要求的「讀出同縮排清單」可由程式判斷，存放位置是腳本（C14），修改落在根因位置。
2. 依 E2、E4 推導：腳本的輸出結構、其他 tag 寫法的讀法與只讀檔的行為不變。
3. 依 E5 推導：Phase 2 步驟 1 已委派這支腳本，Phase 3 步驟 2、3 已規定「統計」取自涵蓋盤點；腳本改正後，SOP 不需要任何修補步驟。
4. 對照 As-Is：SOP、RuleFile、樣板組的追溯結果都相同，保留原文；只有腳本的 `block_tags` 與檔頭說明修改。

````markdown
（與 As-Is `.agents/skills/analyze/SKILL.md` 逐字相同，不重抄）
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 依重新設計 Rule 4 依序考慮：刪除不適用，沒有表達「讀出同縮排清單」的既有內容可刪；SOP、RuleFile、樣板組的每個元素都能追溯（見「保留」） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `scripts/collect_coverage.py` 的 `block_tags`（第 244～249 行） | 修改 | 讀 `tags:` 之後的清單時，縮排小於 `tags:` 的非空行才結束；縮排等於 `tags:` 時，以 `-` 開頭的行仍是清單項目，不以 `-` 開頭的行（例如 `summary:`）才結束；縮排大於 `tags:` 的行照舊處理。行內清單分支（第 241～242 行）與項目解析（第 247～249 行，含 `name:`）不變 | R1、E1、E2、E3（C14） |
| `scripts/collect_coverage.py` 檔頭說明 | 修改 | 在「Contracts are read as YAML text …」一句後補一句：operation 的 `tags` 可以是行內清單、縮排清單或同縮排清單，項目可以是字串或 `name:` 物件。其餘說明保留原文 | E1、E3（C14 的介面說明） |

改寫說明（重新設計 Rule 4）：刪除不適用（見上）；改寫適用，第 245 行的停止條件改寫即可表達 E1、E3，不必新增函式、參數或部位；不需要改換存放位置（腳本已是強制力最高的位置）；不新增任何元素。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（`name` 與 `description`） | E5：description 已概述產出 `analysis.md` | 無（只概述用途與觸發情境） |
| 三個 Phase 的完成條件 | Phase 1：E5 的前提（輸入已讀取）；Phase 2：E1、E5；Phase 3：E5 | 無（只概述結果） |
| Phase 1 -- 收斂分析輸入（P1-1～P1-6） | 必要流程（取得分析輸入）；E5 的前提 | C1～C5 |
| P2-1、P2-2（執行與檢查 `collect_coverage.py`） | E1、E4 | C6 |
| P2-3（載入問題檢查清單） | 必要流程 | 無（只載入） |
| P2-4、P2-5（偵測問題、`grep -n` 確認位置） | 必要流程（分析與驗證） | C7 |
| P3-1（載入分析報告樣板組） | 必要流程 | 無（只載入） |
| P3-2、P3-3（寫入與檢查 `analysis.md`） | E5 | C8～C10 |
| P3-4（回報） | 必要流程 | C11 |
| `rules/分析問題-格式規範.md` Rule 1～5 | 必要流程（問題判斷） | C12 |
| 分析報告樣板組（`templates/analysis.md`、`templates/analysis.example.md`） | E5 | C13 |
| `scripts/collect_coverage.py` 中 `block_tags` 以外的部分 | E2、E4 | C15 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 15 | 15 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 5 | 5 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 1 | 0 |

內容增減：只改寫 `block_tags` 的清單結束條件（R1，缺失類型），並在腳本檔頭補一句支援的 tag 寫法；沒有刪除，因為沒有不能追溯的既有內容。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得 spec 清單 | P1-1 | P1-1 步驟內文 | 既有，不變；既有工具的單一命令，寫在步驟內文 |
| C2 | 目標 spec 的決定方式（指定、只有一份、其餘未決定） | P1-2 | P1-2 步驟內文 | 既有，不變；只屬於單一步驟，一句話可表達 |
| C3 | 缺少 spec、多份未指定、缺少 `plan.md` 或 `tasks.md` 時停止，不建立檔案 | P1-3、P1-4 | SOP 流程 | 既有，不變；屬於分支與停止 |
| C4 | 讀取範圍（spec、plan、tasks、research、techstack 與 `ui/`、`data/`、`contracts/`、`notification/`） | P1-5 | P1-5 步驟內文 | 既有，不變；只屬於單一步驟 |
| C5 | 以 `find .agents/constitution -type f` 列出並讀取憲法檔與鎖定項目步驟 | P1-6 | P1-6 步驟內文 | 既有，不變；既有工具的單一命令 |
| C6 | 腳本退出狀態為零且輸出可解析的 JSON，失敗時修正重試或停止 | P2-2 | SOP 流程 | 既有，不變；屬於分支 |
| C7 | 以 `grep -n` 確認每個位置的識別字都搜尋得到 | P2-5 | P2-5 步驟內文 | 既有，不變；既有工具的單一命令 |
| C8 | `analysis.md` 寫入目標 spec 目錄、繁體中文、依嚴重度排序、最多 50 筆、不修改其他檔案 | P3-2 | P3-2 步驟內文 | 既有，不變；只屬於單一步驟 |
| C9 | 「需求涵蓋」、「介面涵蓋」與「統計」的數字取自涵蓋盤點 | P3-2 | P3-2 步驟內文 | 既有，不變；E5 |
| C10 | 檢查沒有殘留 `{{`、統計與涵蓋盤點一致、只有 `analysis.md` 被建立或修改 | P3-3 | P3-3 步驟內文 | 既有，不變；只屬於單一步驟 |
| C11 | 回報路徑、各嚴重度數量、CRITICAL 摘要與下一步，說明沒有修改上游 | P3-4 | P3-4 步驟內文 | 既有，不變；只屬於單一步驟 |
| C12 | 問題類別與 ID、位置、憲法對照、嚴重度、建議與處理 Skill 的判斷 | P2-4 | `rules/分析問題-格式規範.md` Rule 1～5 | 既有，不變；需要判斷與正反例 |
| C13 | `analysis.md` 的 7 個區塊結構 | P3-2 | 分析報告樣板組 | 既有，不變；約束整份產出檔案的結構 |
| C14 | operation `tags` 以行內清單、縮排清單或同縮排清單撰寫時都讀出全部項目，項目可以是字串或 `name:` 物件，不讀到清單後面的鍵（本次修改） | P2-1 | `scripts/collect_coverage.py` 的 `block_tags` 與檔頭說明 | 輸入（合約文字）與輸出（tags 清單）明確、可重複執行，結果可由程式判斷，順序 1 的腳本即符合；這支腳本已負責解析合約，屬於同一主題 |
| C15 | 涵蓋盤點的其他欄位（需求、User Story、任務、介面對應、資料表、UI 與通知章節、待確認、填位符號）、輸出結構，以及只讀檔、不連網 | P2-1 | `scripts/collect_coverage.py`（`block_tags` 以外） | 既有，不變；可由程式判斷 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-script` | `analyze` 的 `scripts/collect_coverage.py`（主目錄 `.agents/skills/analyze/`） | 改寫 `block_tags` 的清單結束條件，補檔頭說明 | C14 | 已完成 |

施工完成後依 SOP 以 `./scripts/sync-skills.sh --from agents` 同步到 `.claude/skills/`，再以 `--check` 確認兩邊一致。不修改 B 組 worktree。

### 工作項內容

#### W1：`scripts/collect_coverage.py`

- `block_tags` 的非行內分支，逐行讀 `tags:` 之後的內容：
  - 空白行略過（與現行相同）。
  - 縮排小於 `tags:` 的行：結束清單。
  - 縮排等於 `tags:` 的行：以 `-` 開頭時仍是清單項目；不以 `-` 開頭時結束清單。
  - 縮排大於 `tags:` 的行：照現行方式處理（以 `-` 開頭時是項目，其他行略過）。
  - 項目解析沿用現行的 `^\s*-\s*(?:name:\s*)?(.+?)\s*$`，不改。
- 行內清單分支、`block_tags` 的參數、`parse_contracts` 與其他函式都不修改。
- 檔頭說明：在「Contracts are read as YAML text (OpenAPI and AsyncAPI); JSON contracts are not parsed.」之後補一句，說明 operation 的 `tags` 可以是行內清單、縮排清單或同縮排清單，項目可以是字串或 `name:` 物件。其餘說明保留原文。
- 不新增 PEP 723 依賴（維持 `dependencies = []`）。

## 7. 驗收情境

修改前先以 As-Is 腳本產生 S2、S3 的基準輸出，供比對。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E4、E5 | 本次 | B 組 `specs/008-overdue-discord-notification/` 的唯讀複本（放在暫存目錄），以修改後的腳本執行 `--spec-dir <複本>` | 無（腳本沒有確認閘門） | 退出狀態 0，輸出可解析的 JSON，頂層鍵與修改前相同；27 個合約 operation 的 `tags` 都恰好 1 項，且以 B1～B4 其中一個開頭、不含 `summary` 等其他鍵的內容；`interfaces` 中 B1～B4 各對應到至少 1 個合約 operation；`metrics.interfaces_without_planner_output` 為 0；暫存目錄的檔案雜湊在執行前後相同；`SKILL.md` 與修改前逐字相同（E5，逐步演練） |
| S2 | E2、E4 | 回歸 | 主目錄 `specs/003-equipment-loan-booking/`～`specs/007-equipment-maintenance-retire/` 各執行一次 | 無 | 5 份輸出與修改前的基準輸出逐字相同，退出狀態都是 0 |
| S3 | E2、E3、E4 | 本次（推定的 E3）與回歸（E2） | 暫存目錄中自建的最小 spec 目錄：`spec.md` 有 1 條 FR；`plan.md` 的系統介面盤點有後端 B1、B2；`tasks.md` 有 1 個任務；`contracts/openapi.yaml` 的 1 個 operation 用縮排清單 `tags:` ＋多縮排 2 格的 `- B1 測試 API`，後接 `summary:`；`contracts/asyncapi.yaml` 的 1 個 operation 用同縮排清單 `- name: B2 測試事件`，下一行為多縮排的 `description:`，再後接同縮排的 `action:` | 無 | 退出狀態 0；OpenAPI operation 的 `tags` 為 `["B1 測試 API"]`，與修改前的基準輸出相同；AsyncAPI operation 的 `tags` 為 `["B2 測試事件"]`（修改前為空），不含 `description`、`action` 的內容；B1、B2 都對應到合約 operation |

## 8. 驗收結果

- 施工：W1 由 `skill-form-script` 完成。`block_tags` 新增 `tags_indent`，縮排小於 `tags:` 時結束，縮排等於 `tags:` 且不以 `-` 開頭時結束；檔頭補 2 行說明支援的 tags 寫法。`skill-form-script` Phase 2 以暫存資料檢查 `--help`、不存在的目錄（退出 2，標準錯誤有原因）與成功情境，Python 腳本完成檢查清單 Rule 1～6 都通過（單檔、PEP 723 `dependencies = []` 不變、`argparse` 與 `Path` 不變、退出狀態不變、沒有 shell 命令、沒有 lockfile）。
- 施工後結構診斷：`analyze` 為 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 退出 0，`--check` 為「兩邊一致」；git 只有 `.agents/skills/analyze/scripts/collect_coverage.py` 與 `.claude/skills/analyze/scripts/collect_coverage.py` 有差異。同步輸出中沒有只存在於目標端、未被刪除的 Skill。施工時主 session 以 `python3 -I` 匯入腳本測試，產生 `__pycache__`，同步也複製到 `.claude` 側；已刪除兩側的 `__pycache__`，重新 `--check` 為「兩邊一致」。
- 與 To-Be 一致性：`SKILL.md`、RuleFile、樣板組沒有差異；腳本的修改只在 `block_tags` 的結束條件與檔頭說明，與 W1 及 C14 一致。
- 驗收方式：在 `/tmp/48-accept/` 建立暫存環境，複製修改後的 `analyze`、主目錄 `specs/003`～`007`、B 組 `specs/008-overdue-discord-notification`（改名 `b008`）與自建的 `fixture`，spec 目錄設為唯讀並記錄雜湊；以修改前的腳本對同一批目錄產生基準輸出。由不帶本次分析脈絡的 `general-purpose` 子代理執行，模型 Sonnet、推理強度 medium，透過 Agent 工具指定。
- S1 通過：退出 0，頂層鍵與基準相同；27 個 operation 的 `tags` 都恰好 1 項（B1 1、B2 1、B3 1、B4 24），沒有讀到其他鍵；B1～B4 的合約 operation 數為 1、1、1、24；`interfaces_without_planner_output` 從 4 變 0；與基準的差異只在 `interfaces` 的 B1～B4 `contracts` 與這個 metric。`SKILL.md` 與修改前逐字相同（E5，逐步演練）。
- S2 通過：003～007 共 5 次退出 0，輸出以 `cmp` 比對都與基準逐字相同。
- S3 通過：退出 0；`getPing` 的 `tags` 為 `["B1 測試 API"]`，與基準相同；`sendTestEvent` 的 `tags` 為 `["B2 測試事件"]`，不含 `description`、`action`；B1、B2 都對應到合約；與基準的差異只在 B2 的 `contracts`（0 → 1）與 `interfaces_without_planner_output`（1 → 0）。
- 副作用：spec 目錄的雜湊在執行前後相同。子代理回報 `env/skills/analyze/scripts/` 出現 `__pycache__`，已由子代理刪除。主 session 複查：單獨以 `uv run --script` 執行腳本不會產生 `__pycache__`；來源是驗收指示中用 `python3 -I` 匯入腳本檢查 tags（`-I` 會忽略 `PYTHONDONTWRITEBYTECODE`），不是腳本的副作用。
- 個案驗收條件：無。
