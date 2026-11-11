# 根因報告：analyze－tags 同縮排清單讀不到

- 紀錄目錄：`specs/skill-engineering/48-analyze-tags同縮排清單讀不到/`
- 問題證據：主目錄 `docs/iterations/iter-6.md` 的「Skill 問題」問題 B-1（第 108～115 行）與步驟紀錄 7（B 組）列（第 91 行「涵蓋盤點的限制」）；B 組 worktree `/Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b` 的 `.agents/skills/analyze/scripts/collect_coverage.py` 第 234～251 行、`specs/008-overdue-discord-notification/contracts/openapi.yaml` 第 28～29 行、`specs/008-overdue-discord-notification/analysis.md` 第 66、109、115 行；本次對話以主目錄的 `collect_coverage.py`（與 B 組逐檔相同）對 B 組 spec 目錄重新執行的輸出；主目錄 `.agents/skills/api-plan/scripts/check_contracts.py` 第 24、79、87、127 行；`.agents/skills/api-plan/rules/API合約-格式規範.md` 第 17、22、35 行；`specs/007-equipment-maintenance-retire/contracts/openapi.yaml` 第 14～15、31 行。

## 1. 使用者回報的問題

B 組執行 `analyze`（Skill 版本 `b17d451`）時，`collect_coverage.py` 把 B1～B4 判成「沒有 Planner 產出」（`interfaces_without_planner_output` 4）。合約的 operation `tags` 用 YAML 的同縮排清單寫法（`tags:` 的下一行是同一縮排的 `- B1 逾期通知紀錄查詢 API`），腳本讀不到任何 tag。主 session 以 `grep -n` 確認 operation 都存在並加註，但 `analysis.md`「統計」依 SOP 照抄錯誤的 4。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | OpenAPI 合約的 operation `tags` 以同縮排清單寫法（`tags:` 下一行為同一縮排的 `- <tag>`）撰寫時，`collect_coverage.py` 讀出的每個 operation `tags` 等於該清單的全部項目，不多讀到後面的鍵（例如 `summary:`）；以 B 組 008 spec 目錄執行時，B1～B4 都對應到至少一個合約 operation，`metrics.interfaces_without_planner_output` 為 0 | 本次 | 通用 | S1 |
| E2 | 以行內清單（`tags: [B1 …]`）或縮排清單（`tags:` 下一行為多縮排 2 格的 `- <tag>`）撰寫的合約，`collect_coverage.py` 的輸出與修改前完全相同 | 既有 | 通用 | S2、S3 |
| E3 | AsyncAPI 合約的 operation `tags` 以同縮排清單寫法撰寫、每項為 `- name: <tag>` 時，`collect_coverage.py` 讀出的 `tags` 為各項的 `name` 值。推定理由：同一個函式也讀 AsyncAPI 的 operation（`collect_coverage.py` 第 302 行），api-plan 的檢查腳本也接受物件形式的 tag（`check_contracts.py` 第 87 行），執行時必須決定這種寫法要不要讀 | 推定 | 通用 | S3 |
| E4 | `collect_coverage.py` 仍只讀取檔案、不寫入檔案、不連網，成功時退出狀態為 0 並輸出一個 JSON 物件；輸出欄位的名稱與結構不變 | 既有 | 通用 | S1、S2、S3 |
| E5 | `analysis.md`「統計」的數字仍取自「涵蓋盤點」（SOP Phase 3 步驟 2、3 不變） | 既有 | 通用 | S1 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | B1～B4 各對應到合約 operation，`interfaces_without_planner_output` 為 0 | B1～B4 的合約 operation 數都是 0，`interfaces_without_planner_output` 為 4 | 觀察：本次對話以主目錄腳本對 B 組 008 spec 目錄重新執行，`metrics` 為 `interfaces_without_planner_output: 4`，`interfaces` 中 B1～B4 的合約對應數為 0；觀察：B 組 `analysis.md` 第 109 行「沒有 Planner 產出的介面數｜4」 |
| E5 | 「統計」數字取自「涵蓋盤點」且為正確值 | 數字取自「涵蓋盤點」（符合 SOP），但「涵蓋盤點」本身錯誤，所以寫成 4 | 觀察：B 組 `analysis.md` 第 109、115 行 |

## 4. 演練表

`analyze`（B 組執行，Skill 版本 `b17d451`；主目錄 `.agents/skills/analyze/` 與 B 組逐檔相同，觀察：本次對話 `diff -r` 沒有差異）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-4 | 無 | 無 | 決定目標 spec，確認 `plan.md`、`tasks.md` 存在 | 觀察：iter-6.md 第 91 行，目標為 B 組 008，沒有停止 | 一致 |
| P1-5 | 無 | 無 | 讀取 spec 與上游文件 | 觀察：iter-6.md 第 91 行「讀取範圍」，`contracts/openapi.yaml` 以腳本解析全檔 | 一致 |
| P1-6 | 無 | 無 | 憲法輸入 | 觀察：iter-6.md 第 91 行，憲法 3 份 12 條 | 一致 |
| P2-1 | `scripts/collect_coverage.py` | 觀察：已執行 | 正確的涵蓋盤點，B1～B4 有合約 operation | 觀察：`interfaces_without_planner_output` 4，B1～B4 沒有合約對應 | 偏離 |
| P2-2 | 無 | 無 | 退出狀態 0、JSON 可解析 | 觀察：iter-6.md 第 91 行「退出 0」 | 一致 |
| P2-3～P2-5 | 問題檢查清單 | 觀察：已讀取 | 問題清單；位置以 `grep -n` 確認 | 觀察：主 session 以 `grep -n` 找到 B1～B4 的 operation，不列為問題（`analysis.md` 第 66 行） | 一致 |
| P3-1～P3-3 | 分析報告樣板組 | 觀察：已讀取 | 「統計」取自涵蓋盤點 | 觀察：`analysis.md` 第 109 行照抄 4，第 115 行加註原因 | 一致 |

第一個偏離點是 P2-1（`DELEGATE` 執行 `collect_coverage.py`）。這一步委派的是腳本，不是其他 Skill，所以在腳本內繼續追查：

| 位置 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ---- |
| `parse_contracts` 第 282～298 行 | 切出每個 method 區塊，交給 `block_tags(block, 4)` | 觀察：B 組合約第 26～29 行的 method 區塊含 `tags:`（縮排 6）與 `- B1 逾期通知紀錄查詢 API`（縮排 6），區塊切分正確 | 一致 |
| `block_tags` 第 237～239 行 | 找到縮排 6 的 `tags:` | 觀察：第 28 行符合 | 一致 |
| `block_tags` 第 244～246 行 | 讀取 `tags:` 之後的清單項目 | 觀察：第 245 行遇到縮排小於等於 `tags:` 的非空行就停止；下一行 `- B1 …` 縮排也是 6，所以第一行就停止，`tags` 為空 | 偏離 |

第一個偏離點：P2-1；腳本內的第一個偏離點為 `block_tags` 第 245 行的停止條件。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `analyze`／`scripts/collect_coverage.py`／`block_tags`（第 244～249 行） | 缺失 | 觀察：`block_tags` 只處理行內清單（第 241～242 行）與比 `tags:` 多縮排的清單（第 244～249 行）；第 245 行把同縮排的 `- ` 項目當成區塊結束。觀察：B 組合約第 28～29 行使用同縮排清單寫法，這是合法的 YAML 區塊清單。觀察：api-plan 的 `check_contracts.py` 以 `yaml.safe_load` 讀合約（第 127 行），任何合法的清單寫法都接受。推論：analyze 腳本支援的 tag 寫法是合法 YAML 的子集，「讀出同縮排清單」這項預期沒有在任何部位表達（依據上列三項觀察）。 | 假設第 245 行改成「同縮排的 `- ` 項目仍屬於清單，同縮排的其他鍵才結束」：B 組合約的 27 個 operation 都讀到 1 個 tag，B1～B4 對應到 operation，`interfaces_without_planner_output` 為 0，E1 滿足；行內清單與多縮排清單走原本的分支，E2 不受影響；第 247 行已處理 `name:`，E3 可滿足；E4、E5 不受影響。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：api-plan 沒有交出 analyze 能讀的 tag 寫法，應要求合約一律用行內清單 | 交接缺陷 | 觀察：`API合約-格式規範.md` 第 17、22、35 行只在範例中用行內清單，沒有規則要求寫法；觀察：`check_contracts.py` 第 127 行以 `yaml.safe_load` 讀合約，接受同縮排清單。推論：B 組合約是 api-plan 允許的產出；只改 api-plan 時，人工修改或其他工具寫出的合法合約仍會被誤判，E1 不滿足（依據上列觀察） |
| H3：analyze SOP 缺少「涵蓋盤點與 `grep` 結果不一致時更正統計」的步驟 | 流程缺陷 | 觀察：P2-5 已以 `grep -n` 找到 B1～B4 的 operation；P3-3 規定「統計」必須與涵蓋盤點一致。推論：加一個更正步驟只是在症狀出現處修補，腳本仍輸出錯誤的 `interfaces_without_planner_output`，E1 不滿足（依據上列觀察） |
| H4：執行環境或輸入不正確 | 非 Skill 問題 | 觀察：本次對話在另一個工作目錄，以主目錄腳本對同一份合約重新執行，結果相同（4）；觀察：合約是合法 YAML（`check_contracts.py` 以 `yaml.safe_load` 接受）。推論：落差可以重現，且不依賴環境（依據上列觀察） |

## 7. 影響範圍

無：沒有其他 Skill 委派 `analyze`（結構診斷 `graph.callers.analyze` 為空）。`collect_coverage.py` 只由 `analyze` SOP Phase 2 步驟 1 使用。

前幾次迭代（003～007）的合約都用行內清單（觀察：`specs/007-equipment-maintenance-retire/contracts/openapi.yaml` 第 31 行 `tags: [B1 …]`），所以先前的 `analyze` 結果沒有受到這個缺陷影響。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整，適用範圍的判定是否符合你的預期？
2. 是否同意第 5 節的根因 R1？
3. E3「AsyncAPI 的同縮排 `- name: <tag>` 也要讀」是推定的預期，是否需要保留？
4. 沒有缺少的證據。

## 確認紀錄

- 2026-11-11 使用者回覆：驗收條件 E1～E5 正確完整，同意根因 R1，保留推定的 E3。沒有補充內容。
