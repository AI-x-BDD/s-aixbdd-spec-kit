# 根因報告：analyze－缺欄位涵蓋表與任務順序檢查

- 紀錄目錄：`specs/skill-engineering/56-analyze-缺欄位涵蓋表與任務順序檢查/`
- 問題證據：
  - 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md` 第 3.2 節 C15、C17、C20，第 4 節批 2，第 6 節批 2 那一列，第 7 節 R10；`docs/dev/spec-kit-1.4.2-落差分析.md` 第 93、95、98 行（C20 含「統計分類別件數」）。
  - 上游批 2 前兩步：`specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/blueprint.md` 第 1 節「固定寫法」；`specs/skill-engineering/55-tasks-欄位約束重抄未引用資料模型/blueprint.md` 第 1 節「受約束欄位」、第 6 節 W3、W4、W6、第 8 節。
  - Skill 檔案：`.claude/skills/analyze/` 的 `SKILL.md`、`rules/分析問題-格式規範.md`、`templates/analysis.md`、`templates/analysis.example.md`、`scripts/collect_coverage.py`（全文）。
  - 產出檔：`specs/007-equipment-maintenance-retire/analysis.md` 與同目錄 `tasks.md` T008、T043；`specs/001-online-pvp-1a2b/analysis.md` B1、`specs/006-reservation-reschedule/analysis.md` B1、`specs/007-equipment-maintenance-retire/analysis.md` B1；`docs/iterations/iter-5.md` 第 164、283 行。
  - 上游 v1.4.2：`.spec-kit/v1.4.2/templates/commands/analyze.md` 第 105-106、116、119-120、152-155、161、163-164、171、192-197 行。
  - 上游樣本：session 暫存沙盒 `/private/tmp/claude-501/-Volumes-data-Projects-practice-s-aixbdd-spec-kit/710a26be-a787-427d-a5de-1103e052c200/scratchpad/speckit142/`。以 `uvx --from git+https://github.com/github/spec-kit.git@v1.4.2 specify init . --integration claude --script sh --ignore-agent-tools --force` 安裝；放入 008 的 `spec.md`、`plan.md`、`data/`、`contracts/`，另放一份內容同 `data/data-model.dbml` 的 `data-model.md`，`.specify/feature.json` 指向該目錄。以 headless Claude（Sonnet）依序執行 `/speckit-tasks`（40 個任務）與 `/speckit-analyze`（輸出存在 `/private/tmp/claude-501/-Volumes-data-Projects-practice-s-aixbdd-spec-kit/710a26be-a787-427d-a5de-1103e052c200/scratchpad/speckit-out/analyze-run.md`）。`/speckit-analyze` 執行後 `git status` 為空，沒有修改檔案。沙盒在 session 暫存區，可能被清除；下面引用的內容已摘錄在本報告。

## 1. 使用者回報的問題

調整計畫批 2 要求 `analyze` 做三件事：

1. C15：和 `tasks` 的欄位引用（C14）成對，檢查每個受約束欄位有沒有被實作任務引用、任務寫的限制有沒有和資料模型矛盾，並出一張欄位涵蓋表。
2. C17：在不一致（F 類）加入任務順序矛盾。
3. C20：安全、效能描述模糊列 HIGH；涵蓋率分母不含上線後 KPI 類的 SC；統計分類別列件數。

`analyze` 要能獨立運作，不得依賴 `data-plan` 或 `tasks` 的腳本。

## 2. 驗收條件

「受約束欄位」沿用 `tasks` 的定義：`data/data-model.dbml` 中欄位 `note` 以「驗證：」或「轉換：」開頭的欄位，以及資料表 `Note` 的「跨欄位：」括號內列出的每個 `table.column`。

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | `analysis.md` 有「欄位涵蓋」表：每個受約束欄位一列，列出 `table.column`、資料模型位置、實作任務 ID（在 Must Read 以 `` `data/data-model.dbml` → `table.column` `` 引用它的非測試任務）與備註；列數等於受約束欄位數 | 本次 | 通用 | S1、S2 |
| E2 | 受約束欄位沒有實作任務引用時（只有測試任務引用、只引用 `Table <table>`、只在描述寫欄位名稱都不算），列一筆 E 類 HIGH 問題，寫出欄位；任務引用的 `table.column` 在資料模型找不到時，列一筆 E 類 HIGH 問題，寫出任務 ID 與該引用，不猜成別的欄位 | 本次 | 通用 | S1 |
| E3 | 任務描述寫出的欄位限制（長度、數值範圍、格式、可否為空、Enum 值、狀態轉換）和資料模型矛盾時，即使有引用也列一筆 F 類 HIGH 問題；位置列出任務 ID 與 `table.column`，摘要寫出兩邊的限制。只有引用、和資料模型一致的重述、不矛盾的「任務限定：」不列問題 | 本次 | 通用 | S1 |
| E4 | 沒有 `data/data-model.dbml`，或資料模型沒有受約束欄位時，「欄位涵蓋」寫「不適用」與原因，不產生 E2 的問題，也不虛構欄位。推定理由：上游 `analyze.md:106` 這樣規定；計畫風險 R12 規定舊目錄不重跑，舊寫法的資料模型沒有受約束欄位 | 推定 | 通用 | S3 |
| E5 | 任務順序矛盾列 F 類：(a) 任務用到後面任務才建立的檔案、資料表、函式或設定，且沒有寫出依賴，列 HIGH；(b) 任務改變既有行為，更新相依既有測試的任務卻排在後面的 Phase，列 HIGH；(c) 標 `[P]` 的任務依賴同 Phase 其他任務的結果，列 MEDIUM。位置可以是同一份 `tasks.md` 的兩個任務 ID。推定理由：上游 `analyze.md:161` 只列出情況，沒有給嚴重度；`implement` 依任務順序一次做一個，(a)(b) 會讓前面的任務或 Phase Checkpoint 無法通過驗證，(c) 不改變執行結果 | 本次（嚴重度為推定） | 通用 | S1、S3 |
| E6 | 安全或效能描述沒有量化標準（例如「一般網路條件下」「安全地」）時，列 B 類 HIGH | 本次 | 通用 | S3 |
| E7 | 「需求涵蓋」的每個 SC 標出是否計入涵蓋率；只能在上線後以實際使用資料量測的 SC（例如業務 KPI、客訴量、留存率）不計入需求總數與涵蓋率，也不因沒有任務列 E 類問題；其他 SC 照常計入。「統計」寫出不計入的 SC 數與 ID。判斷標準「只能在上線後以實際使用資料量測」為推定，理由：上游 `analyze.md:116` 只舉例「post-launch outcome metrics and business KPIs」，上游樣本把 7 個 SC 全部排除（包括需要建置量測的 SC-002、SC-005），沒有可檢查的標準時結果不穩定 | 本次（判斷標準為推定） | 通用 | S1、S2 |
| E8 | 「統計」列出 A～F 各類別的問題數與各嚴重度的問題數 | 本次 | 通用 | S1、S2、S3 |
| E9 | 欄位涵蓋需要的 DBML 解析與引用比對由 `analyze` 自己的部位完成，不呼叫或讀取 `data-plan`、`tasks` 的腳本 | 本次 | 通用 | S1、S2 |
| E10 | 只寫入 `analysis.md`，不修改任何上游文件；缺少 `spec.md`、`plan.md` 或 `tasks.md` 時停止，不建立任何檔案 | 既有 | 通用 | S1、S2、S3、S4 |
| E11 | 每個問題歸入 A～F 其中一類，ID 為類別字母加連續流水號；位置寫成 `` `檔案` → 識別字 `` 且可以 `grep -n` 找到；F 類位置至少列兩個不同文件（E5 的任務順序除外）；建議寫出文件、部位與方向；處理 Skill 填產出該文件的 Skill | 既有 | 通用 | S1、S2、S3 |
| E12 | 每份憲法檔的每條 Rule 都記一筆結果；違反「必須」或「不得」的列 D 類 CRITICAL | 既有 | 通用 | S2、S3 |
| E13 | 嚴重度分四級，符合多級時取最高；可以一一對應的命名差異不列 HIGH | 既有 | 通用 | S1、S2、S3 |
| E14 | 區塊結構與樣板一致，沒有殘留的 `{{`；問題最多 50 筆，超過的部分摘要筆數；「需求涵蓋」「介面涵蓋」「欄位涵蓋」「統計」的數字和涵蓋盤點一致 | 既有（「欄位涵蓋」為本次） | 通用 | S1、S2、S3 |
| E15 | 回報 `analysis.md` 路徑、各嚴重度的問題數、CRITICAL 問題的 ID 與摘要與「下一步」，並說明沒有修改上游文件 | 既有 | 通用 | S1、S2、S3 |

驗收情境（施工後在暫存專案複本執行）：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E3、E5、E7～E11、E13～E15 | 本次 | 暫存複本的 `specs/008-overdue-discord-notification/`：先以改版後的 `data-plan`、`tasks` 重跑資料模型與任務清單（準備環境，不屬驗收），再注入 5 處缺陷：(1) 刪掉 `overdue_notifications.sent_at` 的所有引用；(2) 把一個引用改成 `overdue_notifications.discord_msg_id`；(3) 在一個寫入 `auto_retry_count` 的任務描述加「`auto_retry_count` 最多 5」；(4) 把建立 `overdue_notifications` 的任務移到第一個使用它的任務之後；(5) 在 `spec.md` 加 SC-008「上線後 3 個月內，管理員手動追討逾期設備的次數減少 50%」。接著執行 `analyze` | 無確認閘門 | (a) 「欄位涵蓋」列數等於準備環境時 `check_data_model.py` 報告的受約束欄位數；(b) (1)(2) 各一筆 E 類 HIGH，(3) 一筆 F 類 HIGH 並寫出「0 到 3」與「最多 5」，(4) 一筆 F 類 HIGH；(c) SC-008 標為不計入，需求總數與涵蓋率不含它，SC-001～SC-007 都計入；(d) 「統計」有各類別與各嚴重度件數；(e) 只有 `analysis.md` 改變 |
| S2 | E1、E7～E15 | 本次（換情境，計畫批 2 第 5 點） | 暫存複本的 `specs/006-reservation-reschedule/`：依序執行 `data-plan`、`tasks`、`analyze`，不注入缺陷 | `data-plan`、`tasks` 的覆寫詢問回覆「同意覆寫」 | (a) 「欄位涵蓋」列數等於 `check_data_model.py` 的受約束欄位數，`tasks` 的 `check_tasks.py` `uncited` 為空時沒有 E2 的問題；(b) SC-001～SC-006 都計入，需求總數與重跑前的 `analysis.md` 相同；(c) 列出和重跑前 `analysis.md` 的問題差異；(d) `tasks_state.py status` 的 `format_issues` 為空；(e) 只有 `data/data-model.dbml`、`tasks.md`、`analysis.md` 改變 |
| S3 | E4～E6、E8、E10～E15 | 本次（原始輸入）＋回歸 | 暫存複本的 `specs/007-equipment-maintenance-retire/` 原樣（舊寫法資料模型、迭代 5 的 `tasks.md`），只執行 `analyze` | 無確認閘門 | (a) 「欄位涵蓋」寫「不適用」，沒有 E2 的問題；(b) T008（Foundational）把 `isActive` 換成 `status`、T043（Polish）才修既有測試，列一筆 F 類 HIGH；(c) NFR-002「一般單機與區域網路環境」列 B 類 HIGH；(d) 重跑前 `analysis.md` 的 D、F 類問題仍列出或寫明消失原因；(e) 只有 `analysis.md` 改變 |
| S4 | E10 | 回歸 | 暫存複本的 `specs/008-overdue-discord-notification/` 刪掉 `tasks.md` 後執行 `analyze` | 無確認閘門 | 回報需要先執行 `tasks` 並停止；`git status` 只有刪除的 `tasks.md`，沒有新檔案 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1、E2、E3、E14 | 有欄位涵蓋表，檢查欄位引用與矛盾 | 沒有欄位層級的檢查與段落 | 觀察：`rules/分析問題-格式規範.md` Rule 1 的 E 類只有「需求沒有任務、介面沒有 Planner 產出或沒有任務、需要建置的 SC 沒有任務」，F 類沒有任務限制和資料模型的比對。觀察：`templates/analysis.md` 只有問題清單、需求涵蓋、介面涵蓋、憲法遵循、沒有對應需求的任務、統計、下一步 7 段。觀察：`scripts/collect_coverage.py` 的 `parse_data` 只讀 `Table` 名稱與資料表 `Note` 開頭的介面編號，不讀欄位與欄位 `note`；`parse_tasks` 不保留 Must Read 內容。觀察：`SKILL.md` Phase 3 步驟 2 只規定「需求涵蓋」「介面涵蓋」「統計」取自涵蓋盤點 |
| E5 | 任務順序矛盾列 F 類 | 沒有列出 | 觀察：007 `tasks.md` T008（Phase 2 Foundational）把 DTO 的 `isActive` 換成 `status`，T043（Phase 6 Polish）才「修正 003～006 既有測試中依賴 `isActive` 或 `unavailable` 的斷言」。觀察：007 `analysis.md` 只在需求涵蓋 FR-018、SC-005 列出 T043，問題清單沒有這項。觀察：`docs/iterations/iter-5.md:283` 記錄「Phase 2～5 的 Checkpoint 都有既有測試失敗，留到 Polish T043 才修」。觀察：Rule 1 F 類沒有任務順序；Rule 2 規定「F 類問題的位置必須至少列出兩個不同的文件」，只在 `tasks.md` 內的順序矛盾寫不出合規的位置 |
| E6 | 效能描述模糊列 HIGH | 列 LOW | 觀察：001 `analysis.md` B1（NFR-001「一般網路條件下」）、006 `analysis.md` B1 與 007 `analysis.md` B1（NFR-002「一般單機與區域網路環境」）都是 LOW。觀察：Rule 4 的 HIGH 只有「上游文件互相矛盾……、需求互相衝突，或驗收標準無法測試」，沒有安全或效能描述模糊；範例 `analysis.example.md` 的 B1（「盡快提示」）也是 LOW |
| E7 | 上線後指標 SC 不計入分母 | 規則與數字來源互相矛盾 | 觀察：Rule 1 E 類只把「需要建置的 SC 沒有任務」列為涵蓋缺口。觀察：`collect_coverage.py` 的 `metrics.requirements_total` 與 `coverage_rate` 計入 spec 的全部 FR、NFR、SC；`SKILL.md` Phase 3 步驟 2 規定「統計」數字取自涵蓋盤點。觀察：`analysis.example.md` 需求涵蓋 SC-001 寫「否」與「量測目標，不需要建置任務」，統計仍算進需求總數 8，涵蓋率 75%。觀察：上游樣本把 008 的 7 個 SC 全部排除，「Total Requirements：24（FR 21、NFR 3）」，其中 SC-002、SC-005 需要建置量測 |
| E8 | 統計分類別件數 | 統計沒有問題件數 | 觀察：`templates/analysis.md` 第 6 節「統計」只有需求、任務、介面的數字 |
| E9 | 獨立運作 | 目前符合 | 觀察：`collect_coverage.py` 檔頭與 import 只用標準函式庫，沒有呼叫其他 Skill 的腳本。新增欄位涵蓋時要維持 |

上游樣本的寫法（供設計參考，不是落差）：
- 上游 `/speckit-tasks` 在任務描述內寫 `` `data-model.md` 的 `overdue_notifications.status` ``，T004 一次列出 `overdue_notifications` 的 14 個欄位；它把每個有型別的欄位都算受約束欄位。
- 上游 `/speckit-analyze` 的「Constrained-Field Coverage」表把欄位分成 3 組，每組一列（例如 `status`、`attempt_count`……8 個欄位一列，實作任務 T004、T016、T017、T018、T026、T032），備註寫「一致」；沒有「Canonical Location」欄，和上游命令檔第 194 行的 4 欄表頭不同。表下另寫「任務中陳述的約束與 data-model 都相符：重試上限 3 次……」。
- 上游樣本找到一項接近任務順序的問題：I3「T002 需要 T001 新增的 `discord:sim` 腳本……兩者仍標 [P] 且沒寫相依」，列 LOW。
- 上游樣本的 ID 前綴與上游命令檔不一致（歧義用 A1、重複用 D1、憲法用 K1），統計只列 Ambiguity、Duplication、Critical 三種件數。

## 4. 演練表

### 表 A：007 的實際產出（`specs/007-equipment-maintenance-retire/analysis.md`）

當次對話紀錄沒有保存，載入行為只能從產出推論。

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-4 | 無 | 無 | 目標 spec，輸入齊全 | 觀察：報告的 Spec 目錄為 007 | 一致 |
| P1-5 | 上游文件全文 | 觀察：「已分析文件」含 `tasks.md`、`spec.md` | 分析輸入 | 觀察：需求涵蓋列出 T043 | 一致 |
| P1-6 | 憲法檔 | 觀察：「已讀取的憲法檔」有列出 | 憲法輸入 | 觀察：第 4 節逐條對照 | 一致 |
| P2-1～P2-2 | 無 | 無 | 涵蓋盤點 | 推論：需求涵蓋與統計數字齊全（依據第 2、6 節的觀察） | 一致 |
| P2-3 | RuleFile | 推論：已讀取（位置格式符合 Rule 2，憲法表符合 Rule 3） | 問題檢查清單 | 觀察：清單內沒有任務順序、沒有安全或效能描述的嚴重度 | 一致 |
| P2-4 | 分析輸入、涵蓋盤點、檢查清單 | — | T008／T043 順序矛盾的 F 類；NFR-002 模糊列 HIGH | 觀察：沒有 T008／T043 的問題；B1 列 LOW | 偏離 |
| P2-5 | 檢查清單 | — | 檢查通過 | 推論：清單沒有對應條列，檢查只能通過（依據 P2-3 的觀察） | 一致 |
| P3-1～P3-4 | 樣板組 | 推論：已讀取（區塊順序與樣板一致） | `analysis.md` | 觀察：7 段齊全 | 一致 |

第一個偏離點：P2-4（`THINK` 比對各文件、決定類別與嚴重度）。P2-4 依的「問題檢查清單」沒有任務順序的條列，Rule 4 也沒有把效能描述模糊列為 HIGH。

### 表 B：新寫法資料模型的靜態演練（依 Skill 檔案，輸入為 `tasks` 批 2 驗收 S1 那種有受約束欄位的 008）

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-5 | `data/data-model.dbml`、`tasks.md` 全文 | 觀察：步驟要求讀 `data/` 下所有檔案 | 分析輸入含欄位 `note` 與 Must Read | 同左 | 一致 |
| P2-1 | 無 | 無 | 涵蓋盤點含受約束欄位、各欄位的引用任務、找不到的引用；SC 分母規則可檢查 | 觀察：`collect_coverage.py` 不輸出欄位與 Must Read；`requirements_total` 計入全部 SC | 偏離 |
| P2-3 | RuleFile | — | 檢查清單含欄位涵蓋、欄位矛盾、上線後 SC 的處理 | 觀察：Rule 1～5 都沒有 | 偏離 |
| P3-1、P3-2 | 樣板組 | — | 有「欄位涵蓋」段 | 觀察：樣板沒有這一段 | 偏離 |

第一個偏離點：P2-1（`DELEGATE` 取得涵蓋盤點）。盤點沒有欄位層級的資料，後面的 P2-3、P2-4、P3-2 都沒有可依據的內容。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `analyze`／`scripts/collect_coverage.py`（`parse_data`、`parse_tasks`、`build`）；`rules/分析問題-格式規範.md` Rule 1（E、F 類）與 Rule 4（HIGH）；`templates/analysis.md`、`templates/analysis.example.md`（沒有「欄位涵蓋」段）；`SKILL.md` Phase 3 步驟 2 | 缺失 | 觀察：見落差 E1、E2、E3、E14。觀察：上游 `analyze.md:119-120、153-155、163-164、171、192-197` 規定欄位盤點、引用對照、缺引用與矛盾列 HIGH、Constrained-Field Coverage 表；本 Skill 沒有任何一處表達。推論：C15 的預期沒有在任何部位表達（依據上述觀察） | 假設腳本輸出受約束欄位與引用、Rule 規定 E 類與 F 類的欄位情況與 HIGH、樣板有「欄位涵蓋」段：P2-1 取得欄位清單，P2-4 依清單列出缺引用、錯引用與矛盾，P3-2 寫出表格；E1～E4、E9、E14 可滿足 |
| R2 | `analyze`／`rules/分析問題-格式規範.md` Rule 1 F 類、Rule 2 第 3 條（F 類至少兩個文件） | 缺失 | 觀察：見落差 E5。觀察：上游 `analyze.md:161` 把任務順序矛盾列在 Inconsistency。推論：預期沒有表達；即使模型看到 T008／T043，Rule 2 第 3 條也讓只在 `tasks.md` 內的矛盾無法寫成合規的 F 類（依據 Rule 2 原文） | 假設 F 類包含任務順序矛盾、Rule 2 允許以同一份 `tasks.md` 的兩個任務 ID 定位、Rule 4 給出嚴重度：表 A 的 P2-4 會列出 T008／T043；E5 可滿足 |
| R3 | `analyze`／`rules/分析問題-格式規範.md` Rule 1 E 類（「需要建置的 SC」）；`scripts/collect_coverage.py` 的 `metrics`；`templates/analysis.example.md` 需求涵蓋 SC-001 與統計 | 衝突 | 觀察：見落差 E7。Rule 只把需要建置的 SC 列為缺口，腳本的分母卻計入全部 SC；範例寫「不需要建置任務」卻算進分母，涵蓋率 75%。觀察：沒有任何部位寫出「上線後指標」的判斷標準；上游樣本沒有標準時把 7 個 SC 全部排除。推論：規則、腳本與範例對分母的要求互相矛盾，模型無法同時遵守 | 假設規則寫出判斷標準與每個 SC 的標示方式、分母和統計依同一個規則計算、範例一致：P2-4 會逐一判斷 SC，P3-2 的涵蓋率依排除後的分母，P3-3 能核對；E7 可滿足 |
| R4 | `analyze`／`rules/分析問題-格式規範.md` Rule 4（HIGH 沒有安全或效能描述模糊）；`templates/analysis.md` 第 6 節「統計」（沒有類別與嚴重度件數） | 缺失 | 觀察：見落差 E6、E8。觀察：上游 `analyze.md:171` 的 HIGH 包含「ambiguous security/performance attribute」；上游 Metrics 列出 Ambiguity、Duplication、Critical 件數。推論：預期沒有表達，所以 3 份 `analysis.md` 的效能模糊都依「文字與輕微」列 LOW（依據 3 份產出的觀察） | 假設 Rule 4 的 HIGH 加入安全或效能描述沒有量化標準、統計加入分類別與分嚴重度件數：表 A 的 P2-4 會把 NFR-002 列 HIGH，P3-2 會寫出件數；E6、E8 可滿足 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H5：RuleFile 或樣板沒有在偵測前載入 | 未載入 | 觀察：`SKILL.md` Phase 2 步驟 3 在步驟 4 之前讀取全部 Rule；007 `analysis.md` 的位置格式符合 Rule 2、憲法表符合 Rule 3，區塊順序符合樣板 |
| H6：`tasks` 沒有交出欄位引用 | 交接缺陷 | 觀察：`tasks` 批 2 驗收 S1、S2（`specs/skill-engineering/55-…/blueprint.md` 第 8 節）已在 Must Read 寫出 `table.column`，`check_tasks.py` 的 `uncited` 為空。既有 `specs/` 的 `tasks.md` 是舊寫法，依計畫 R12 不重跑 |
| H7：T008／T043 的順序問題是 `tasks` 的錯，不是 `analyze` 的 | 交接缺陷 | 觀察：`tasks` 已在 `b09eaa7` 修正排法（`iter-5.md:164`），但 `analyze` 的職責是實作前找出跨文件問題；007 `analysis.md` 已讀到 T043（需求涵蓋有列），偏離發生在 `analyze` 的 P2-4。兩邊都要能擋住，`tasks` 的修正不取代 R2 |
| H8：模型能力不足，看不出順序與效能問題 | 非 Skill 問題 | 觀察：上游樣本以 Sonnet 執行時，有規則就列出了接近任務順序的 I3 與欄位涵蓋表。觀察：3 份 `analysis.md` 都已列出效能描述模糊，只是嚴重度依 Rule 4 列 LOW；推論：模型找得到問題，等級來自規則（依據上述觀察） |
| H9：SC 分母只交給 AI 判斷，結果不穩定 | 載體過弱 | 推論：上游樣本把需要建置的 SC 也排除，顯示判斷不穩（依據落差 E7 的觀察）；但目前本 Skill 連判斷標準都沒有，而且規則和腳本互相矛盾，先要有一致的規則。腳本能保證到哪裡（例如列出每個 SC、依標示計算分母），在藍圖決定。歸入 R3，不另立根因 |

## 7. 影響範圍

- 呼叫 `analyze` 的 Skill：無。結構診斷的呼叫圖沒有指向 `analyze` 的邊；以內文核對，`constitution` 只在分流說明提到 `analyze`，不委派它。
- 上游（只被讀取，不受影響）：`tasks` 的 `tasks.md`（批 2 第 2 步的 `table.column` 引用）、`data-plan` 的 `data/data-model.dbml`（「驗證」「轉換」「跨欄位」）。`analyze` 要自己解析，不依賴這兩個 Skill 的腳本。
- 讀取 `analysis.md` 的下游：使用者依 runbook 步驟 7（`docs/dev/迭代-runbook.md` 第 213 行、P7 提示詞第 585 行）交給處理 Skill。計畫第 6 節批 2 要在 runbook 步驟 6、7 的檢查點加欄位引用與涵蓋表，`analyze` 做完後和 `tasks` 一起改。
- 計畫 R10：SC 分母規則改變後，新舊 `analysis.md` 的涵蓋率不能直接比較；要在迭代紀錄註明分母規則改變的 commit。這件事在迭代紀錄，不在 `analyze` 內。
- 既有 `specs/` 的 `analysis.md` 不重跑（計畫風險 R12）。
- `analyze/LICENSE`：計畫第 6 節要求註明 v1.4.2 欄位涵蓋的衍生。

## 8. 待確認事項

1. 第 2 節的驗收條件 E1～E15 與驗收情境 S1～S4 是否正確、完整？
2. E4（沒有資料模型或沒有受約束欄位時「不適用」）是推定，是否保留？
3. E5 的嚴重度（(a)(b) HIGH、(c) MEDIUM）是推定，是否同意？
4. E7 的判斷標準「只能在上線後以實際使用資料量測」是推定，是否同意？
5. 是否同意第 5 節的根因 R1～R4？
6. 缺少的證據：007 `analysis.md` 當次的對話紀錄沒有保存，載入行為只能從產出推論；R1～R4 都可由 Skill 檔案直接核對，不受影響。上游樣本只跑一次。

## 9. 確認紀錄

- 2026-11-19，使用者回覆「都同意」：
  - 第 2 節驗收條件 E1～E15 與驗收情境 S1～S4 正確、完整；推定的 E4、E5 嚴重度、E7 判斷標準保留。
  - 同意根因 R1～R4。

---

# 根因報告（第 2 次）：analyze－S3 (d) 漏列重跑前的不一致問題

- 紀錄目錄：`specs/skill-engineering/56-analyze-缺欄位涵蓋表與任務順序檢查/`
- 觸發：Phase 5 步驟 17，驗收情境 S3 (d) 未通過，返回 Phase 2。第 1 次報告（上方 R1～R4）已確認，本次不改動，根因編號從 R5 接續。
- 問題證據：
  - 藍圖第 8 節「S3 未通過」（S3 第一次、S3b、S3c 診斷實跑）與「S2 通過」(c)。
  - 交接文件 `$TMPDIR/handoff-批2-analyze-S3診斷實跑.md` 第 4 節對照表（S3 第一次、S3b、S3c 三欄）。
  - S3c 子代理回報全文（本次對話，Opus／high；`analysis.md` 寫入被平台擋下，以文字回報）。
  - 基準：`git show 96ef51b:specs/007-equipment-maintenance-retire/analysis.md` 第 1 節 14 筆。
  - 舊版 Skill：`git show 96ef51b:.claude/skills/analyze/`（`SKILL.md`、`rules/分析問題-格式規範.md`）；`git diff 96ef51b -- .claude/skills/analyze/` 與目前工作目錄的差異。
  - 舊報告的執行紀錄：`git show 96ef51b:docs/iterations/iter-5.md` 步驟 5、7 兩列與「流程不足」。
  - 007 上游文件：`git diff 96ef51b -- specs/007-equipment-maintenance-retire/` 只有 `tasks.md` 46 個核取方塊由 `[ ]` 改為 `[X]`，任務文字沒有改變。

## 1. 使用者回報的問題

驗收情境 S3 (d) 要求：重跑前 `analysis.md` 的 D、F 類問題仍列出，或寫明消失原因。Sonnet 兩次（S3、S3b）與 Opus 一次（S3c 診斷實跑）都漏掉 5 筆以上，也沒有寫消失原因。S3b 與 S3c 漏掉的是同一組：F1、F9、F11、F12、F13；F8 三次都只列出兩個錯誤碼中的一個。007 的上游文件內容沒有改變。

## 2. 驗收條件

沿用第 1 次報告第 2 節與藍圖第 1 節的 E1～E15、第 7 節的 S1～S4，本次不新增驗收條件。和本次落差有關的是 S3 (d)。S3 (d) 屬於回歸檢查，E1～E15 沒有一條直接要求「找出所有跨文件不一致」。

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| S3 (d) | 重跑前 `analysis.md` 的 D、F 類問題仍列出或寫明消失原因 | 既有（回歸） | 個案（007 的 13 筆 F 類） | S3 |
| E11 | 問題歸入 A～F 一類；F 類至少兩個文件（任務順序除外）……（全文見藍圖第 1 節） | 既有 | 通用 | S1、S2、S3 |

觀察：`SKILL.md` Phase 1 步驟 5 與 Phase 2 都沒有讀取既有 `analysis.md`；S3b、S3c 的提示詞也要求不讀它。推論：S3 (d) 的「寫明消失原因」這個分支，Skill 沒有資料可寫；(d) 實際上等於要求列出全部 13 筆 F 類（依據上述觀察）。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| S3 (d) | 舊 F1：FR-009 與 FR-019 互相矛盾（research §3 第 69 行、`createReservation`、T039） | S3b、S3c 沒有列出；S3 第一次列出，但該次子代理先讀過舊 `analysis.md` | 觀察：交接文件第 4 節 F1 列；S3c 回報第 3 節問題清單 |
| S3 (d) | 舊 F8：`updateEquipmentStatus` 的 `EQUIPMENT_STATUS_UNCHANGED` 與確認時的 `EQUIPMENT_ON_LOAN` 都沒有畫面回饋 | 三次都只列 `EQUIPMENT_STATUS_UNCHANGED` | 觀察：交接文件第 4 節 F8 列；S3c F7 |
| S3 (d) | 舊 F9：核准、改期的 `EQUIPMENT_UNAVAILABLE` 在 `admin.html`、`my-reservations.html` 沒有回饋 | 三次都沒有列出 | 觀察：交接文件第 4 節 F9 列 |
| S3 (d) | 舊 F11：T008、T010 的 `status` 寫三種值，合約 `MemberVisibleEquipmentStatus` 只有兩種 | 三次都沒有列出 | 觀察：交接文件第 4 節 F11 列；`contracts/openapi.yaml:1014` |
| S3 (d) | 舊 F12：`EQUIPMENT_UNAVAILABLE` 的訊息文字和 `ui/plan.md` §5 不同 | 三次都沒有列出 | 觀察：交接文件第 4 節 F12 列 |
| S3 (d) | 舊 F13：`ui/plan.md` §5 的部分狀態不在雛形面板（`ui/plan.md:170` 寫「錯誤狀態同樣可從『雛形狀態』面板切換」） | 三次都沒有列出 | 觀察：交接文件第 4 節 F13 列 |

同類現象：觀察：藍圖第 8 節 S2 (c)，006 重跑後，指向 `research.md`、`contracts/`、`ui/` 的舊 F1、F2、C2～C4、F6、F7、A1 沒有列出，這些文件沒有改變。

## 4. 演練表

`analyze`（S3c，Opus／high；輸入為 S3c 複本的 007）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-4 | 無 | 無 | 目標 spec；`plan.md`、`tasks.md` 存在 | 觀察：S3c 回報第 1 節，沒有觸發停止條件 | 一致 |
| P1-5 | 無 | 無 | 上游文件全文 | 觀察：S3c `analysis.md`「已分析文件」列出 13 個檔案；回報第 5 點寫 `ui/plan.md` §4、§5 與 html 檔名「依全文閱讀補上」；問題 F2 引用 `ui/admin.html` 的 `noteCell` | 一致 |
| P1-6 | 無 | 無 | 憲法輸入 | 觀察：讀取 3 份憲法檔與鎖定項目（另讀了兩份 SKILL.md 全文，多讀不影響） | 一致 |
| P2-1、P2-2 | 無 | 無 | 涵蓋盤點 JSON | 觀察：退出 0，需求 28、任務 46、介面 14 | 一致 |
| P2-3 | 無 | 無 | 問題檢查清單 | 觀察：產出套用了本次新增的 Rule（F6 任務順序 HIGH、B1 HIGH、欄位涵蓋「不適用」） | 一致 |
| P2-4 | 問題檢查清單、分析輸入 | 觀察：已使用 | 問題清單含舊 F1、F8 兩個錯誤碼、F9、F11～F13 | 觀察：12 筆，缺上列 5 筆半；另新增 F6、F9（欄位命名）、A1 | 偏離 |
| P2-5 | 問題檢查清單 | 觀察：已使用 | 逐條驗證與位置 grep | 觀察：全部通過。推論：步驟 5 只能驗證已列出的問題，沒有可以發現漏列的檢查項（依據 `SKILL.md` Phase 2 步驟 5 原文） | 一致 |
| P3-1～P3-4 | 分析報告樣板組 | 觀察：已讀取 | `analysis.md` 與回報 | 觀察：結構、統計一致；寫入被平台擋下，以文字回報 | 一致 |

第一個偏離點：P2-4（`THINK` 比對各文件找出問題）。

舊版對照（同一個偏離點）：

| 項目 | 96ef51b 舊版 | 目前版 | 證據 |
| ---- | ------------ | ------ | ---- |
| P2-4 文字 | 「比對各文件找出問題」，單一 `THINK` | 相同，多了判斷「不計入的 SC」 | 觀察：`git show 96ef51b:.claude/skills/analyze/SKILL.md` Phase 2 步驟 4 |
| F 類定義 | 「同一概念在不同文件的命名或值不同、同一情境的行為說法不同、合約的錯誤碼在 `ui/plan.md` 沒有對應的回饋……」 | 相同，只多了 `notification/` | 觀察：`git diff 96ef51b -- .claude/skills/analyze/rules/` |
| 逐項比對的載體 | 沒有（`collect_coverage.py` 只盤點需求、任務、介面） | 沒有（腳本多了欄位涵蓋，不含錯誤碼、畫面狀態、需求的跨文件引用） | 觀察：兩版 `collect_coverage.py` 的輸出鍵 |
| 執行者 | Opus 5.5／high 的子代理執行 SOP，主 session 寫入 | Opus／high 的 `skill-tester` 子代理（S3c） | 觀察：`iter-5.md` 第 7 步那一列；本次 Agent 呼叫 |
| 執行時的脈絡 | 主 session 已知步驟 5 的 3 項上游衝突、11 項待確認，以及待驗證假設「`analyze` 漏查衝突」；委派給子代理的提示詞沒有保存 | 不帶分析脈絡 | 觀察：`iter-5.md` 步驟 5、7 兩列與「流程不足」第 1 列；委派提示詞：無證據 |

推論：舊版對這 5 類比對沒有任何目前版沒有的部位；舊報告找得到，不是舊版 Skill 的性質，而是那一次執行的結果（依據上表前三列的觀察）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R5 | `analyze`／`SKILL.md` Phase 2 步驟 4、5；`rules/分析問題-格式規範.md` Rule 1 F 類；`scripts/collect_coverage.py`（沒有比對單位的輸出） | 載體過弱 | 觀察：F 類定義已明寫「合約的錯誤碼在 `ui/plan.md` 沒有對應的回饋」，規則也已載入（P2-3 一致），但 F9 三次都漏、F8 三次都只列一半。觀察：比對範圍是 `contracts/openapi.yaml` 2379 行、25 個錯誤碼、24 個 operation，`ui/plan.md` 200 行、5 個雛形頁面，`tasks.md` 480 行；`ui/plan.md` 沒有寫任何錯誤碼名稱，以情境文字描述回饋。觀察：P2-4 是一個 `THINK` 步驟，同時負責所有文件之間的比對、欄位涵蓋、任務順序、SC 判斷與憲法對照；沒有任何部位列出要逐一比對的單位（每個錯誤碼、每個 `ui/plan.md` 狀態、每個需求編號在 research／合約／任務的說法、任務引用的合約 schema 值）；P2-5 只驗證已列出的問題。推論：哪些比對被做到，取決於該次執行的注意力分配，所以三次的結果各不相同，卻都漏掉需要大量交叉查找的同一組（依據上述觀察與第 3 節）。舊版有同樣的弱點（第 4 節舊版對照），所以這是既有缺陷，批 2 沒有新增它；批 2 在同一步驟加入更多檢查，可能讓漏列更常發生，但沒有證據可以分開這兩個因素 | 假設這些比對單位已逐項列出，P2-4 必須對每一項寫出結果，P2-5 檢查每一項都有結果：<br>• 錯誤碼清單會有 `updateEquipmentStatus` 的 `EQUIPMENT_ON_LOAN`、`approveReservation`／`approveRescheduleRequest`／`createRescheduleRequest` 的 `EQUIPMENT_UNAVAILABLE`，各需判斷 `ui/plan.md` §5 有沒有回饋、訊息是否一致 → 舊 F8 另一半、F9、F12 會列出。<br>• `ui/plan.md` §5 的狀態清單逐一對照雛形 `STATES` → 舊 F13 會列出。<br>• 任務引用的合約 schema（`EquipmentWithSlotAvailability.status` → `MemberVisibleEquipmentStatus`）對照任務寫的值 → 舊 F11 會列出。<br>• FR-009 的列會同時出現 research §3 第 69 行（「依 FR-019 拒絕」）、`createReservation` description 與 T039 的斷言 → 舊 F1 的矛盾在同一列可見，列出的可能性提高，但仍要模型判斷並行語意。<br>S3 (d) 的 13 筆中，F8～F13 可滿足；F1 只能提高機率，不能保證。E11、E13、E14 不受影響 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H10：驗收模型（Sonnet／medium）能力不足 | 非 Skill 問題 | 觀察：S3c 改用與舊報告相同的 Opus／high，仍漏掉和 S3b 完全相同的 5 筆 |
| H11：子代理沒有讀全文 | 未載入 | 觀察：S3c 列出 13 個已分析檔案，並引用只在全文才看得到的 `ui/admin.html` `noteCell`、`ui/plan.md` §4、§5。S3 第一次確實沒有讀全文（藍圖第 8 節），但 S3b、S3c 已排除這個因素，結果仍漏同一組 |
| H12：批 2 的修改刪掉或改壞了這些比對規則（回歸） | 衝突 | 觀察：`git diff 96ef51b` 顯示 F 類定義、Rule 2、Rule 4 對這 5 類比對的文字沒有刪改，只新增欄位、任務順序、SC 與 `notification/` 的內容。新增檢查讓 P2-4 負擔變重的影響，機制已歸入 R5（沒有比對單位時才會因注意力分配而漏列），不另立根因 |
| H13：這 5 筆不是真的問題，舊報告誤報 | 非 Skill 問題 | 觀察：`ui/plan.md` 沒有任何錯誤碼名稱，§5 只有 `booking.html` 的「預約時設備已送修」「預約時設備已停用」對應 `EQUIPMENT_UNAVAILABLE`；`ui/plan.md:170` 寫錯誤狀態可從雛形面板切換；`contracts/openapi.yaml:1014` 有 `MemberVisibleEquipmentStatus`；`research.md:69` 同時引用 FR-009 與 FR-019。上游文件自舊報告後沒有改變 |
| H14：只是單次執行的隨機變異，不是 Skill 問題 | 非 Skill 問題 | 觀察：三次執行各自漏掉或找到的項目不同（舊 F3、F10 在 S3 第一次漏、在 S3b／S3c 找到），變異確實存在；但 F9、F11、F12、F13 三次都漏，F8 三次都只列一半，不是隨機分布。推論：變異來自 R5 的載體弱點，不能當成不修改 Skill 的理由（依據上述觀察）。F1 例外：只有它在有比對單位時仍需要深入推理，殘留的變異屬於模型判斷 |

## 7. 影響範圍

- 呼叫 `analyze` 的 Skill：無（同第 1 次報告第 7 節）。
- 讀取 `analysis.md` 的下游：使用者依 runbook 步驟 7 交給處理 Skill。漏列的問題會在 `implement` 時才被發現。
- 既有 `specs/` 的 `analysis.md`（001～008）都由同一個弱點的版本產出，漏列的程度不明；依計畫風險 R12 不重跑。
- 第 1 次報告的 R1～R4 與已施工的 W1～W8 不受影響：S1、S2、S4 已通過，S3 的 (a)(b)(c)(e) 也符合。

## 8. 待確認事項

1. S3 (d) 的「或寫明消失原因」：Skill 不讀既有 `analysis.md`，這個分支不會發生，(d) 實際上要求列出全部 13 筆 F 類。這個驗收條件要維持原樣，還是改寫？
2. 是否同意根因 R5（載體過弱，舊版也有，不是批 2 造成的）？
3. R5 要在這一輪（紀錄 56，批 2）處理，還是記到 `docs/待確認.md`、另開一輪？前者會擴大批 2 的範圍。
4. 舊 F1（需求之間的並行語意矛盾）即使修正 R5 也只能提高找到的機率。是否接受 F1 這類問題屬於模型判斷、不納入必過的驗收？
5. 缺少的證據：舊報告當時委派給子代理的提示詞沒有保存；S3b 的完整回報不在本次對話，只有交接文件的對照表。這兩項不影響 R5 的判定，但無法排除舊報告受到額外脈絡的幫助。

## 9. 確認紀錄

- 2026-11-19，使用者回覆「1 照建議改寫 (d)、2 同意 R5、3 另開一輪、4 接受」：
  - 待確認 1：S3 (d) 改寫為回歸檢查，只要求本次修改範圍（E1～E7）的舊問題不消失；範圍外的漏列記入驗收結果。驗收條件改變，依 Phase 2 步驟 8 返回 Phase 1 更新藍圖第 7 節。
  - 待確認 2：同意根因 R5。
  - 待確認 3：R5 不在紀錄 56 處理，記在 `docs/待確認.md` 第 38 項，之後另開一輪。
  - 待確認 4：舊 F1 這類需要推理並行語意的問題屬於模型判斷，只記錄有無，不列為必過。
