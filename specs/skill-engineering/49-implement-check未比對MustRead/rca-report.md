# 根因報告：implement－check 未比對 Must Read

- 紀錄目錄：`specs/skill-engineering/49-implement-check未比對MustRead/`
- 問題證據：主目錄 `docs/iterations/iter-6.md` 的「Skill 問題」問題 B-2（第 116～123 行）與步驟紀錄 8（B 組）列（第 92 行「SOP 偏離」）；B 組 worktree `/Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b` 的 `.agents/skills/implement/SKILL.md` 第 25、31 行、`.agents/skills/implement/scripts/tasks_state.py` 第 406～413 行、`specs/008-overdue-discord-notification/tasks.md` T029（第 290 行起）與 Reference Loading Contract；主目錄 `.agents/skills/implement/`（與 B 組逐檔相同）的 `rules/任務實作-格式規範.md` Rule 3 與 `tasks_state.py` 檔頭說明。

## 1. 使用者回報的問題

B 組執行 `implement`（Skill 版本 `b17d451`）時，T029 的子代理沒有讀 Must Read 的 `ui/overdue-notifications.html` → 雛形狀態「已建立逾期通知」「沒有新的逾期借用」，理由是判斷 `ui/plan.md` 已涵蓋。`check --read` 也沒有列這一項。`tasks_state.py check` 只檢查 `--read` 不為空，沒有和任務的 Must Read 清單比對，所以照常打勾，完成報告沒有列為偏離。這次沒有看到畫面錯誤（使用者驗證 S5、F1 符合），但閘門擋不下漏讀。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 執行 `check` 時，目前任務的每一項 Must Read 都必須出現在讀取紀錄中；有任何一項沒有出現時，`check` 不打勾、以非零狀態結束，並在標準錯誤列出缺少的 Must Read 項目 | 本次 | 通用 | S1 |
| E2 | Must Read 指向的部位在文件中找不到時，執行者可以把該項記為「找不到」並寫出原因，`check` 接受並在進度回報中顯示這一項與原因。推定理由：上游缺少部位的情況會發生（`tasks.md` Notes 的待確認），執行時必須決定這時能不能打勾；Must Read 是「一定要讀完」，所以只接受「找不到」，不接受「判斷不需要」 | 推定 | 通用 | S2 |
| E3 | `check` 原有的行為不變：只能打勾 `next` 發出的任務、一次一個；`--verify` 必須不為空；進度回報有「讀取」「驗證」兩行與剩餘任務提醒；`status`、`next`、`block`、`report` 的輸入與輸出不變 | 既有 | 通用 | S1、S3 |
| E4 | Optional 部位不要求出現在讀取紀錄中；只在遇到 Why 描述的情況時讀取，讀取時照舊寫進讀取紀錄 | 既有 | 通用 | S1 |
| E5 | 執行者照舊只讀任務綁定的部位（`rules/任務實作-格式規範.md` Rule 3），全程不向使用者提問；`tasks.md` 的格式與 `tasks` Skill 不需要修改 | 既有 | 通用 | S1、S3 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | T029 的 4 項 Must Read 都在讀取紀錄中，缺一項時 `check` 拒絕 | 讀取紀錄只有 3 項，`check` 照常打勾 | 觀察：iter-6.md 第 92 行「T029 沒有讀 Must Read 的 `ui/overdue-notifications.html`……`check --read` 也沒列」；觀察：B 組 `tasks.md` T029 的 Must Read 有 4 項，第 4 項是 `ui/overdue-notifications.html` → 雛形狀態；觀察：`tasks_state.py` 第 411～413 行只檢查 `--read` 不為空 |

## 4. 演練表

`implement`（B 組 Phase 5 的子代理執行 T029；主目錄 `.agents/skills/implement/` 與 B 組逐檔相同，觀察：本次對話 `diff -r` 沒有差異）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-5 | 無 | 無 | 目標 tasks、範圍、`status --reset` | 觀察：iter-6.md 第 92 行，主 session 跑 Phase 1，`--scope phase:5` 委派子代理 | 一致 |
| P2-1～P2-3 | 實作檢查清單、執行脈絡、憲法檢查清單 | 無證據（子代理逐步紀錄沒有保存） | 檢查清單與執行脈絡 | 無證據 | 無證據 |
| P2-4、P2-5 | 無 | 無 | `next` 發出 T029 | 觀察：T029 在 B 組 `tasks.md` 已打勾，只有 `next` 發出的任務能 `check`（`tasks_state.py` 第 419～423 行） | 一致 |
| P2-6 | 執行脈絡（Reference Loading Contract）、實作檢查清單 | 推論：已載入（依據 P2-6 要求依 Contract 讀取，且子代理讀了其他 3 項） | 讀取 T029 列出的所有 Must Read 部位 | 觀察：沒有讀第 4 項 `ui/overdue-notifications.html` → 雛形狀態，理由是「`ui/plan.md` 已涵蓋」（iter-6.md 第 92 行） | 偏離 |
| P2-9～P2-11 | 各檢查清單 | 無證據 | 實作與驗證 | 觀察：T029 的功能在使用者驗證 S5、F1 符合（iter-6.md「使用者驗證」B 組段落） | 一致 |
| P2-12 | 無 | 無 | `check --read` 寫出讀取的 Must Read 與 Optional；漏讀時應被擋下 | 觀察：`--read` 沒有列第 4 項，`check` 打勾成功 | 一致（腳本依現行設計只檢查不為空） |
| P3-1、P3-2 | 無 | 無 | 完成報告 | 觀察：iter-6.md 第 92 行，`report` 憲法偏離 0；SOP 偏離由主 session 另外記錄 | 一致 |

第一個偏離點：P2-6（`READ` 讀取目前任務的所有 Must Read 部位）。之後的 P2-12 沒有擋下，因為 `check` 依現行設計只檢查 `--read` 不為空；推論：P2-6 的要求在之後沒有任何能判斷違反的檢查（依據 P2-12 的觀察與 `tasks_state.py` 第 411～413 行）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `implement`／`SKILL.md` Phase 2 步驟 6 的「讀取所有 Must Read 部位」，與 `scripts/tasks_state.py` 的 `check`（第 411～413 行） | 載體過弱 | 觀察：「讀完所有 Must Read」只寫在 SOP 步驟 6 的文字；`rules/任務實作-格式規範.md` Rule 3 只規定「怎麼讀、不讀其他部位」，沒有檢查是否讀齊。觀察：`check` 只要求 `--read` 不為空，沒有讀任務區塊的 Must Read 行；但同一支腳本已能解析每個任務的 Must Read 參考行（`format_issues` 第 262～275 行用 `MUST_READ_RE`、`REF_LINE_RE`）。推論：「Must Read 是否都出現在讀取紀錄」是輸入輸出明確、可由程式判斷的要求，卻只以文字交給執行者，執行者自行判斷「已涵蓋」就略過了（依據上列觀察與 P2-6 的觀察）。 | 假設 `check` 比對目前任務的 Must Read 清單，讀取紀錄缺任何一項就拒絕並列出缺少的項目：T029 的子代理在 P2-12 會被擋下，必須回去讀第 4 項或明確記為找不到，E1 滿足；找不到的部位能記錄原因時，E2 滿足；Optional 不在比對範圍，E4 不受影響；只動 `check` 的檢查，E3、E5 不受影響。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：SOP 缺少一個「確認任務參考涵蓋所有 Must Read」的 `CHECK` 步驟 | 流程缺陷 | 觀察：偏離來自子代理自行判斷「`ui/plan.md` 已涵蓋」，不是忘記讀（iter-6.md 第 92 行）。推論：再加一個由同一個執行者以文字判斷的 `CHECK`，同樣可以被「已涵蓋」的判斷通過，E1 不能保證；可由程式判斷的要求應放在腳本（依據上列觀察） |
| H3：tasks 的 Reference Loading Contract 沒有交代 `ui/*.html` 的部位怎麼定位，子代理找不到部位才略過 | 交接缺陷 | 觀察：B 組 `tasks.md` Reference Loading Contract 第 4 點列出各文件的定位識別字，確實沒有 `ui/*.html`；但子代理的理由是「`ui/plan.md` 已涵蓋」，不是找不到（iter-6.md 第 92 行）；觀察：「雛形狀態」可在 `ui/overdue-notifications.html` 以 `grep` 找到（第 277、595 行）。推論：定位方式不是這次略過的原因（依據上列觀察） |
| H4：只是模型能力，換模型就不會發生 | 非 Skill 問題 | 觀察：SOP 選模規定實作委派 Sonnet 子代理（CLAUDE.md 選模表），這是 Skill 預期的執行者；`check` 的設計本來就是讓腳本把關打勾（SKILL.md Phase 2 步驟 3「核取方塊只由 `tasks_state.py check` 變更」）。推論：預期的執行者會出現這種判斷時，閘門應該能擋下；不能歸為非 Skill 問題（依據上列觀察） |

## 7. 影響範圍

無：沒有其他 Skill 委派 `implement`（結構診斷 `graph.callers.implement` 為空）。`tasks_state.py` 讀的是 `tasks` Skill 產出的 `tasks.md`；`tasks` 是上游產出者，不是呼叫者。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整，適用範圍的判定是否符合你的預期？
2. 是否同意第 5 節的根因 R1？
3. E2「Must Read 找不到時可以記為『找不到』並寫原因，`check` 接受；不接受『判斷不需要』」是推定的預期，是否需要？
4. 缺少的證據：T029 子代理的逐步紀錄沒有保存，P2-1～P2-3、P2-9～P2-11 只能判為「無證據」或以結果推論；這不影響第一個偏離點的判定。

## 確認紀錄

- 2026-11-11 使用者回覆：驗收條件 E1～E5 正確完整，同意根因 R1，保留推定的 E2。沒有補充內容。
