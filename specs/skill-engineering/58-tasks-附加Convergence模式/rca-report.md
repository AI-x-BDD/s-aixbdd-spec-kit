# 根因報告：tasks－附加 Convergence 模式

- 紀錄目錄：`specs/skill-engineering/58-tasks-附加Convergence模式/`
- 確認紀錄：使用者於 2026-11-20 回覆「確認根因報告，E7、E8、E9 照推定」，確認 E1～E11、S1～S6、R1、R2，推定的 E7、E8、E9 保留
- 問題證據：本次是新增功能，沒有錯誤回報。證據為：交接文件 `handoff-批3-converge-倒抽樣板.md` 第 2 節（上游 `/speckit-converge` 在 008 的樣本結果）與第 4.1、4.2 節；`converge` 的樣板組 `.agents/skills/converge/templates/convergence.md`、`convergence.example.md`；`converge/SKILL.md` Phase 3 步驟 2；`tasks` 的 `SKILL.md`、`rules/任務清單-格式規範.md`、`scripts/check_tasks.py`；007 在 commit `c7c2ac6` 的 `tasks.md`（`check_tasks.py` 實跑 0 issues、0 warnings）。

## 1. 使用者回報的問題

`converge` 會在 `convergence.md` 產出處理為「附加任務」的缺口，並在下一步要求「執行 `tasks` 附加模式，把 G# 附加為新的 Convergence Phase」。`tasks` 目前只能整份重新產生 `tasks.md`：已有 `tasks.md` 時先詢問覆寫，同意後整份重寫，會清掉已勾選的進度。使用者需要 `tasks` 只把「附加任務」寫成檔尾的新 Phase，前面內容不動，讓 `implement` 只跑新 Phase。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 使用者要求以 `convergence.md` 附加任務（提到附加模式、`convergence.md` 或 Convergence）且 `tasks.md` 已存在時，不詢問覆寫；只在 `tasks.md` 檔尾附加，附加前的內容逐位元組不變（`cmp -n <原大小>` 相同） | 本次 | 通用 | S1、S3 |
| E2 | 只附加 `convergence.md` 最新一輪「處理」為「附加任務」、且既有任務的 Must Read 沒有以 `` `convergence.md` → G# `` 引用的 G 項目；「上游缺口：…」「不處理」與較舊輪次的列都不附加 | 本次 | 通用 | S1、S2、S3 |
| E3 | 新 Phase 標題為 `## Phase <既有最大 Phase 編號＋1>: Convergence`；任務 ID 從既有最大 ID＋1 連續編號；任務不帶 `[US…]`；CRITICAL、HIGH 的任務排在 MEDIUM、LOW 之前；Phase 最後有 `**Checkpoint**:` 行 | 本次 | 通用 | S1、S3 |
| E4 | 每個附加任務的 Must Read 都有 `` `convergence.md` → G# ``，並依既有 Rule 3 引用該 G 項目來源與證據所指的上游部位（受約束欄位以 `table.column`）；任務描述結尾的括號引用需求編號與 G# | 本次 | 通用 | S1、S3 |
| E5 | 附加後 `check_tasks.py` 沒有 `issues`；`implement/scripts/tasks_state.py status` 沒有 `format_issues`；`tasks_state.py next --scope phase:<新編號>` 只發出新 Phase 的任務 | 本次 | 通用 | S1、S3 |
| E6 | 沒有可附加的 G 項目（最新一輪已收斂、沒有「附加任務」列，或都已被引用）時，`tasks.md` 的 sha256 不變，沒有空的 Phase 標題，並回報沒有修改 | 本次 | 通用 | S2、S4 |
| E7 | 附加模式下 spec 目錄沒有 `convergence.md` 時，停止並指名先執行 `converge`；沒有 `tasks.md` 時，停止並指名先以產生模式執行 `tasks`；兩種情況都不建立或修改任何檔案 | 推定 | 通用 | S5 |
| E8 | 「附加任務」的 G 項目需要上游沒有定義的識別字（operation、資料表、欄位、畫面狀態）才能寫成任務時，不附加該 G 項目、不修改 Notes，並回報 G# 與應處理的 Skill | 推定 | 通用 | S1 |
| E9 | 附加模式只修改 `tasks.md`，不修改 `convergence.md` 或其他檔案，也不 commit | 推定 | 通用 | S1、S2、S3、S4、S5 |
| E10 | 使用者沒有提到附加模式、`convergence.md` 或 Convergence 時，維持產生模式：已有 `tasks.md` 時詢問是否覆寫，不同意時不修改任何檔案 | 既有 | 通用 | S6 |
| E11 | 產生模式的 `tasks.md` 結構、Must Read 綁定、上游缺口寫成 Notes 待確認、`check_tasks.py` 檢查與回報內容維持不變 | 既有 | 通用 | S6（只驗證 Phase 1 分流；Phase 2、3 本次不修改，以施工後逐行比對確認） |

驗收情境（輸入都不用 008 與範例 G5；測試環境為 007 在 `c7c2ac6` 的暫存複本，`convergence.md` 由驗收者手寫）：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E5、E8、E9 | 本次 | `convergence.md` 2 輪：第 1 輪有一列「附加任務」；第 2 輪有 MEDIUM「附加任務」、HIGH「附加任務」、「上游缺口：`ui-plan`」、手改的「不處理」，以及一列需要 contracts 沒有的 operation 的 LOW「附加任務」。輸入「依 convergence.md 執行 tasks 附加模式」 | 無確認閘門 | 只多 `## Phase 7: Convergence`，HIGH 的任務在 MEDIUM 前，ID 從 T047 起；第 1 輪與上游缺口、不處理的列沒有附加；LOW 那列沒有附加且有回報；`cmp -n` 前段相同；兩支腳本檢查通過，`next --scope phase:7` 只發出 Phase 7 的任務；`git status` 只有 `tasks.md` 改變 |
| S2 | E2、E6、E9 | 本次 | S1 完成後，不改 `convergence.md`，再輸入一次同樣的要求 | 無 | `tasks.md` sha256 不變，回報沒有可附加的 G 項目 |
| S3 | E1～E5、E9 | 本次 | S1 的結果加上第 3 輪：一列 CRITICAL「附加任務」、一列「上游缺口：`data-plan`」 | 無 | 只多 `## Phase 8: Convergence`，接在 Phase 7 之後；Phase 7 以前逐位元組不變；ID 接續；只附加 CRITICAL 那列 |
| S4 | E6、E9 | 本次 | `convergence.md` 最新一輪結果為「已收斂」，缺口表沒有列 | 無 | `tasks.md` sha256 不變，沒有空 Phase 標題 |
| S5 | E7、E9 | 本次 | spec 目錄沒有 `convergence.md`，輸入「依 convergence.md 執行 tasks 附加模式」 | 無 | 回報先執行 `converge`；`git status` 沒有變化 |
| S6 | E10、E11 | 回歸 | 已有 `tasks.md`，輸入「為 007 產生 tasks.md」 | 覆寫詢問回覆「不同意」 | 有覆寫詢問；回覆後 `tasks.md` sha256 不變，沒有其他檔案 |

推定理由：

- E7：附加模式的輸入和產生模式不同，Skill 執行時必須決定缺少輸入怎麼處理；沿用 `converge` Phase 1 步驟 3「停止並指名要先執行的 Skill」的做法。
- E8：既有 Rule 4 要求上游缺口寫成 Notes 待確認；附加模式不能改 Notes（E1），所以 Skill 必須決定這種 G 項目怎麼處理。不附加並回報，使用者可以把該列改成上游缺口後重跑 `converge`。
- E9：E2 以 `tasks.md` 的引用判斷 G 項目是否已附加，不需要回寫 `convergence.md`；`converge` 的 SOP 也只讓 `converge` 寫 `convergence.md`。
- E10 列為「既有」：它是目前 Phase 1 步驟 7、8 的確認閘門；本次要確認新增的分流不影響它。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 不詢問覆寫，只在檔尾附加 | 已有 `tasks.md` 時一律詢問覆寫，同意後整份重寫 | 觀察：`tasks/SKILL.md` Phase 1 步驟 7、8；Phase 3 步驟 2「將 `tasks.md` 寫入」整份 |
| E2、E4、E6、E8 | 依 `convergence.md` 最新一輪篩選 G 項目並寫成任務 | 沒有任何步驟讀取 `convergence.md` | 觀察：`tasks/SKILL.md` Phase 1 步驟 4 的讀取清單沒有 `convergence.md` |
| E3 | Convergence Phase 的標題、ID、排序與 Checkpoint 有規定 | 規則只定義 Setup、Foundational、User Story、Polish | 觀察：`rules/任務清單-格式規範.md` Rule 1 第 6 點、Rule 2 最後一點 |
| E5 | 附加結果通過兩支腳本 | 腳本可以解析 Notes 之後的 Phase，但 `tasks` 沒有產出這種 Phase 的步驟 | 觀察：交接文件第 2 節，008 樣本的 Phase 7 在兩支腳本都只回報「T040 沒有 Must Read」 |
| E7 | 缺 `convergence.md` 時停止並指名 `converge` | 沒有這個分支 | 觀察：Phase 1 步驟 3、6 只檢查 spec.md 與 plan.md |

## 4. 演練表

輸入：007 的 spec 目錄（已有 `tasks.md` 與含「附加任務」列的 `convergence.md`），使用者說「依 convergence.md 執行 tasks 附加模式」。

`tasks`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1 | 使用者需求、spec 清單 | 觀察：步驟要求讀取 | 任務輸入 | 觀察：依步驟文字建立 | 一致 |
| P1-2 | 無 | 無 | 目標 spec | 觀察：使用者指定或清單決定 | 一致 |
| P1-3 | 無 | 無 | 缺少 spec 時停止 | 觀察：007 有 spec.md，繼續 | 一致 |
| P1-4 | spec 目錄的上游文件與 `convergence.md` | 觀察：讀取清單沒有 `convergence.md` | 「附加任務」的 G 項目 | 觀察：沒有讀取 | 偏離 |
| P1-5 | 憲法檔 | 觀察：步驟要求讀取 | 憲法檢查清單 | 觀察：已建立 | 一致 |
| P1-6 | 無 | 無 | 有 plan.md 時繼續 | 觀察：007 有 plan.md | 一致 |
| P1-7 | 無 | 無 | 附加模式不詢問覆寫 | 觀察：步驟要求詢問是否覆寫 | 偏離 |
| P1-8 | 無 | 無 | 進入附加 Phase | 觀察：只有「同意覆寫進入 Phase 2」或「停止」兩個分支 | 偏離 |
| P3-2 | 任務規劃 | 觀察：步驟要求整份寫入 | 只在檔尾附加 Convergence Phase | 觀察：整份寫入 `tasks.md` | 偏離 |

第一個偏離點：P1-4（`READ` 上游文件）。推論：P1-4 之前沒有判斷模式的步驟，P1-4 只能依產生模式讀取；後面 P1-7、P1-8、P3-2 的偏離都來自同一個缺少的分流（依據 P1-4、P1-7、P1-8 的觀察）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `tasks`／`SKILL.md`／frontmatter description 與 SOP Phase 1（步驟 4、7、8）；整個 SOP 沒有附加 Phase | 缺失 | 觀察：description 沒有附加、`convergence.md`、Convergence 等觸發詞；Phase 1 沒有判斷模式的步驟，讀取清單沒有 `convergence.md`；Phase 3 步驟 2 只能整份寫入。觀察：`converge/SKILL.md` Phase 3 步驟 2 與範例第 2 輪的下一步都要求「執行 `tasks` 附加模式」。推論：`converge` 交出的下一步在 `tasks` 中沒有對應的流程（依據上兩項觀察）。 | 假設 Phase 1 先判斷模式，附加模式略過覆寫詢問，進入讀取 `convergence.md`、篩選 G 項目、檔尾附加並檢查前段不變的 Phase：E1、E2、E6、E7、E8、E9 可滿足；E10、E11 的產生模式路徑不變。E3、E4 的格式另需 R2。 |
| R2 | `tasks`／`rules/任務清單-格式規範.md`／Rule 1～5 都沒有 Convergence Phase 的規定 | 缺失 | 觀察：Rule 1 第 6 點只定義 User Story Phase 與 Polish 的編號；Rule 2 最後一點只規定 User Story、Setup、Foundational、Polish 的 `[US]` 標籤；沒有規則定義 Convergence Phase 的位置、ID、排序、Checkpoint 與 `convergence.md` 的引用寫法。觀察：008 樣本的上游輸出 T040 沒有 Must Read（交接文件第 2 節）。 | 假設 RuleFile 定義 Convergence Phase 的寫法並附正反範例，附加 Phase 在寫入前載入：E3、E4 可滿足，且 `check_tasks.py` 既有的 ID 連續、`[US]` 與 Must Read 檢查可直接驗證 E5。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H3：`check_tasks.py` 無法解析 Notes 之後的 Phase，需要改腳本 | 載體過弱 | 觀察：交接文件第 2 節，008 樣本附加 Phase 7 後，`check_tasks.py` 與 `tasks_state.py` 都能解析，只回報 T040 沒有 Must Read；觀察：`check_tasks.py` 第 32 行 `PHASE_RE` 以 `^## Phase (\d+): (.+)$` 比對，不限位置。施工後仍以實跑確認。 |
| H4：`converge` 沒有交出寫任務需要的資訊 | 交接缺陷 | 觀察：`convergence.md` 樣板缺口表有來源、證據（含 `file:line`）、剩餘工作與處理；範例 G5 的剩餘工作寫出要實作的 A14 換頁列與 4 個狀態，來源指向 `ui/plan.md` A14。 |
| H5：`tasks` 的樣板組缺少 Convergence 段 | 缺失（樣板） | 觀察：Phase 3 步驟 2 以樣板寫出整份 `tasks.md`；推論：附加模式不重寫整份檔案，只寫一個 Phase，寫法放在 RuleFile 即可由寫入步驟載入，不需要樣板（依據 Phase 3 步驟 2 的觀察）。交接決定也不改樣板組。 |
| H6：`implement` 不能只跑新 Phase | 交接缺陷 | 觀察：`tasks_state.py --help` 的 `next` 支援 `--scope`；交接文件第 4.1 節第 5 點記錄 `--scope phase:N` 已可只跑新 Phase（計畫 R4）。 |

## 7. 影響範圍

- 委派呼叫者：無。`audit_skill.py --graph` 的 `callers.tasks` 為空，沒有 Skill 委派 `tasks`。
- 文字引用者（不是委派，但依賴附加模式存在）：`converge`（SOP Phase 3 步驟 2 的下一步、description 的分流「把附加任務寫進 tasks.md 改用 tasks 的附加模式」）。
- 下游讀取者：`implement`（讀取 `tasks.md`，以 `tasks_state.py` 執行）。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整？適用範圍都判為「通用」，是否符合你的預期？
2. 是否同意第 5 節的根因 R1、R2？
3. 以下是推定的驗收條件，請逐條確認是否需要：
   - E7：附加模式缺 `convergence.md` 時指名 `converge`，缺 `tasks.md` 時指名以產生模式執行 `tasks`，都不建立檔案。
   - E8：「附加任務」的 G 項目需要上游沒有的識別字時，不附加、不改 Notes，回報 G# 與應處理的 Skill。
   - E9：附加模式只修改 `tasks.md`，不回寫 `convergence.md`。
4. 仍缺少的證據：無。驗收情境 S1～S6 的測試環境在批 3 第 4 步建立（S1、S3 用 007 `c7c2ac6` 的暫存複本加上手寫的 `convergence.md`，不用 008 的 G5）。
