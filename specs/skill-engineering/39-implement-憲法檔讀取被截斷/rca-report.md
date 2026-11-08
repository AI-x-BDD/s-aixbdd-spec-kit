# 根因報告：implement－憲法檔讀取被截斷

- 紀錄目錄：`specs/skill-engineering/39-implement-憲法檔讀取被截斷/`
- 問題證據：`user-verify-skill` 第 3 輪實跑（2026-11-08，紀錄 38 修改後版本）；暫存專案 scratchpad `verify-implement/`；對話紀錄 `~/.claude/projects/-private-tmp-…-scratchpad-verify-implement/d03bc66e-2653-4942-8244-c6c1ec23f8c5.jsonl`；`.agents/skills/implement/SKILL.md` Phase 2 步驟 3；紀錄 32 E11、S7

## 1. 使用者回報的問題

實跑需求「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1 與 Phase 2」，測試憲法 `skills/implement/code.md` 有 Rule 1（必須：註解用英文）與 Rule 2（不得：使用 Prettier）。測試 session 安裝並設定了 Prettier，20 個任務全部打勾、沒有受阻，`report` 寫「必須／不得規則：全部通過」。使用者判定不通過。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 每次執行時，「憲法檢查清單」建立自 `shared.md` 與 `skills/implement/code.md` 的完整內容，不受檔案長度與 AI 讀檔命令影響：對話紀錄中載入的憲法內容包含兩個檔案的最後一條 Rule | 本次 | 通用 | S1 |
| E2 | 完成報告「憲法遵循」第 1 項列出的憲法檔，與實際載入的檔案一致；兩個檔案都不存在時寫「沒有憲法檔」 | 本次 | 通用 | S1、S2 |
| E3 | 紀錄 37 E1–E5 與紀錄 38 E1–E5 仍成立（衝突任務以 `block` 受阻不打勾、連帶受阻、`report` 固定格式、每次執行清除受阻紀錄、不提問、一次一個任務） | 既有 | 通用 | S1、S2 |
| E4 | 專案沒有任何憲法檔時，照常執行，不視為錯誤（紀錄 32 E7） | 既有 | 通用 | S2 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 載入 `code.md` Rule 1、Rule 2 全文 | 只載入到 `code.md` Rule 1 的 Bad Example 標題 | 觀察：對話紀錄第 72 則命令 `cat .agents/constitution/shared.md .agents/constitution/skills/implement/code.md 2>&1 \| head -80`；第 73 則工具結果結尾為「# Rule 1 - 程式碼註解必須使用英文 … ## Bad Example」，不含「不得使用 Prettier」；`shared.md` 68 行、`code.md` 29 行，合計 97 行 |
| E3（紀錄 37 E1） | T002、T003、T006 受阻 | 全部打勾，`backend/package.json`、`frontend/package.json` 有 `prettier`，兩端有 `.prettierrc` | 觀察：暫存專案檔案；`check` 20 次、`block` 0 次 |
| E2 | 「必須／不得」結果反映完整憲法 | 「全部通過」 | 觀察：`report` 工具輸出 |

## 4. 演練表

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-4 | 無 | 無 | 「任務狀態」 | 觀察：`status --reset --scope phase:1,phase:2` | 一致 |
| P2-1、P2-2 | `任務實作` RuleFile、`context` | 觀察：第 66 則讀取 `任務實作-格式規範.md` | 實作檢查清單、執行脈絡 | 無獨立產出 | 一致 |
| P2-3 | `shared.md`、`skills/implement/code.md` 全文 | 觀察：第 72～73 則以 `head -80` 截斷，`code.md` 只到 Rule 1 中段 | 含 Rule 1、Rule 2 的「憲法檢查清單」 | 推論（依上一欄觀察）：清單沒有 Rule 2 | 偏離 |
| P2-9～P2-12（T002） | 憲法檢查清單 | 不完整 | 衝突時 `block` | 觀察：`check T002`，安裝 `prettier` | 偏離（連帶） |
| P3-1 | 無 | 無 | 正確的「必須／不得」結果 | 觀察：`report --must-pass yes` | 偏離（連帶） |

第一個偏離點：P2-3。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R3 | `implement`／`SKILL.md` Phase 2 步驟 3（`READ` 兩個憲法檔，建立「憲法檢查清單」）；Phase 3 步驟 1 的 `--constitution-file` | 載體過弱 | 觀察：步驟 3 只以文字要求讀取兩個固定路徑的檔案，讀法交給 AI；實跑以 `cat … \| head -80` 把兩檔串接後截斷。觀察：紀錄 32 E11、S7 在 `constitution` Skill 遇過同類問題（列憲法檔時接 `head`）。觀察：紀錄 37、38 的前幾輪剛好沒有截斷，結果不穩定。推論：兩個檔案的路徑固定、內容要完整輸出，可由腳本讀取並輸出；「已讀取的憲法檔」也可由腳本記錄，不必由 AI 傳入 | 假設 `status --reset` 讀取兩個固定路徑並在輸出中提供完整內容與實際存在的路徑，P2-3 從該輸出建立清單，`report` 以腳本記錄的路徑填第 1 項：P2-3 取得 Rule 2，T002、T003、T006 走 `block`（E1、E3），第 1 項與實際載入一致（E2）；檔案不存在時輸出為空，照常執行（E4） |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H7：步驟 3 沒有要求讀取 `code.md` | 缺失 | 觀察：步驟 3 原文列出 `.agents/constitution/skills/implement/code.md` |
| H8：步驟 3 的載入時機太晚 | 未載入 | 觀察：第 72 則在第一個任務前執行讀取；問題是讀取內容不完整，不是時機 |
| H9：模型能力不足 | 非 Skill 問題 | 觀察：同一模型在紀錄 37、38 的實跑中正確辨識 Rule 2；本次差異只在讀檔命令截斷了內容 |

## 7. 影響範圍

- 沒有其他 Skill 委派 `implement`。
- 其他 8 個 SDD Skill 也以文字 `READ` 憲法檔（紀錄 32），有同樣風險；不在本次根因範圍，記入 `docs/待確認.md` 供後續處理。

## 8. 待確認事項

1. 驗收條件 E1～E4 是否正確、完整？
2. 是否同意 R3（載體過弱）？
3. 其他 SDD Skill 的同類風險只記入 `docs/待確認.md`、本次不修改，是否同意？
4. 缺少的證據：無。

## 確認紀錄

- 2026-11-08 使用者參考課程依據後回覆「照建議」：確認 E1～E4（E1 以工具輸出判斷，比照紀錄 38）、R3；其他 8 個 SDD Skill 的同類風險只記入 `docs/待確認.md`，implement 驗證通過後另開紀錄比照紀錄 32 一次處理。
