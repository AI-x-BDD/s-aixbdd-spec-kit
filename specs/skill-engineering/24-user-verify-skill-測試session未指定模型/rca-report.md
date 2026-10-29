# 根因報告：user-verify-skill－測試 session 未指定模型

- 紀錄目錄：`specs/skill-engineering/24-user-verify-skill-測試session未指定模型/`
- 問題證據：本次對話上下文（使用者要求依課程原則讓測試 session 自動使用中階模型，減少手動切換）；`docs/待確認.md` 第 7 項；`specs/skill-engineering/19-data-plan-建立/blueprint.md` 第 218、220、221、225 行；`specs/skill-engineering/20-api-plan-Edge-Case正常結果與Rule2衝突/blueprint.md` 第 159、160、164 行；`.claude/skills/user-verify-skill/SKILL.md` Phase 2 步驟 4、7 與 Phase 4 步驟 4

## 1. 使用者回報的問題

以 `user-verify-skill` 實際驗證 Skill 時，測試 session 會沿用 Claude Code 的預設主模型（目前是 Opus 5.5、effort high）。課程〈【基因工程】系統分析的初步規劃 - 多端點盤點：/system-analysis〉要求「要測試的話用笨一點的模型」，所以每次都要由使用者或主代理另外手動指定 `claude --model sonnet`。使用者希望測試 session 依 `skill-engineering` Phase 5 步驟 12 的選模原則自動使用中階模型與推理強度，不必再手動切換。支援 Codex（`docs/待確認.md` 第 6 項）不在本次範圍。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 在 Herdr 中啟動測試 session 時，`herdr agent start` 在 `--` 之後帶 `--model <測試模型> --effort <測試推理強度>`；測試 session 的對話紀錄顯示實際使用該模型 | 本次 | 通用 | S1 |
| E2 | 使用者自行執行時，提供的啟動指令為 `cd <暫存專案絕對路徑> && claude --model <測試模型> --effort <測試推理強度>` | 本次 | 通用 | S2 |
| E3 | 預設的測試模型與 `skill-engineering` Phase 5 步驟 12 的選模原則一致：定位低於執行者主模型的中階模型，同時決定推理強度；主模型為 Opus 5.5 時為 `sonnet`、`medium` | 本次 | 通用 | S1、S2 |
| E4 | 使用者指定測試模型或推理強度時，沿用使用者的指定 | 推定 | 通用 | S3 |
| E5 | 「實跑紀錄」記下測試 session 使用的模型與推理強度，Phase 4 寫入藍圖的驗證紀錄在「方式」寫出這兩項 | 推定 | 通用 | S1、S2 |
| E6 | 其餘既有行為不變：Phase 1 由使用者確認實跑需求與測試素材，提問與確認閘門轉給使用者回答，使用者判定通過後才移除「（未驗證）」，不執行 `git commit` | 既有 | 通用 | S1（回歸，Phase 1–2）；Phase 3–4 本次未修改，逐步演練 |

推定理由：

- E4：紀錄 19 第 221 行、紀錄 20 第 160 行的第 2 輪都是使用者同意後換模型重跑；使用者有時需要用特定模型比較結果，Skill 執行時必須決定是否沿用。
- E5：紀錄 19、20、23 的驗證紀錄都由主代理手動寫出模型與 effort，日後比較不同輪次的結果需要這兩項；Phase 4 步驟 4 目前沒有要求。

驗收情境：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E3、E5、E6 | 本次 | 在包含本次修改的主專案暫存複本中，於 Herdr 環境（`HERDR_ENV=1`）執行 `/user-verify-skill s-specify`，紀錄目錄使用 `07-s-specify-依賴決定了故事優先級`；實跑需求「團隊共用會議室預約：成員可以預約時段與取消，同一時段不能重複預約」，不需要測試素材；執行者主模型為 Opus 5.5 | Phase 1 步驟 6 回覆「確認」；信任資料夾回答「Yes, I trust this folder」；測試 session 出現第一個 `clarify` 提問或確認閘門時回覆「停止」 | `herdr agent start` 指令在 `--` 後含 `--model sonnet --effort medium`；測試 session 的 `.jsonl` 對話紀錄中 assistant 訊息的 `model` 為 Sonnet；回報的「實跑紀錄」含模型與推理強度；Phase 1 步驟 6 有展示實跑需求並等待確認 |
| S2 | E2、E3、E5 | 本次 | 同 S1，但 Phase 2 步驟 3 的檢查以 `env -u HERDR_ENV` 執行，使檢查不成立 | Phase 1 步驟 6 回覆「確認」；Phase 2 步驟 5 不回報已跑完 | 展示給使用者的指令為 `cd <暫存專案絕對路徑> && claude --model sonnet --effort medium`；回報的「實跑紀錄」含模型與推理強度；因未回報而停止並保留暫存專案 |
| S3 | E4 | 本次 | 同 S2，但需求附上「測試 session 用 opus、effort high」 | 同 S2 | 展示給使用者的指令為 `cd <暫存專案絕對路徑> && claude --model opus --effort high` |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 以 Sonnet、medium 啟動測試 session | 第 1 輪以 `claude` 預設模型啟動，實際為 Opus 5.5、high | 觀察：紀錄 19 第 220 行「第 1 輪，Opus 5.5 high effort，`claude` 預設模型」；紀錄 20 第 159 行相同 |
| E2 | 指令帶 `--model` 與 `--effort` | 指令只有 `cd <暫存專案絕對路徑> && claude` | 觀察：`SKILL.md` Phase 2 步驟 4 |
| E3 | 依選模原則決定測試模型與推理強度 | 沒有任何步驟決定測試模型 | 觀察：`SKILL.md` Phase 1–2 全部步驟；結構診斷 `parts` 與 `references` 為空，沒有其他部位 |
| E4 | 沿用使用者指定的模型 | 沒有任何步驟處理使用者指定的模型；第 2 輪是主代理在 Skill 之外手動以 `claude --model sonnet` 重跑 | 觀察：紀錄 19 第 221 行；`SKILL.md` Phase 1–2 |
| E5 | 驗證紀錄寫出模型與推理強度 | 步驟只要求寫方式、權限處理、結果、觀察與結論；紀錄 19、20 中的模型是主代理自行補寫 | 觀察：`SKILL.md` Phase 4 步驟 4；紀錄 19 第 220–221 行 |

## 4. 演練表

`user-verify-skill`，以紀錄 19 的第 1 輪實際驗證（`data-plan`，Herdr 路徑）演練：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-4 | 目標 Skill、紀錄目錄清單、HEAD | 觀察：紀錄 19 第 218 行以 `data-plan` 與紀錄 19 為對象 | 驗證輸入、紀錄目錄、驗收紀錄 | 觀察：使用紀錄 19 的驗收紀錄 | 一致 |
| P1-5～P1-7 | 驗收紀錄 | 觀察：已使用 | 使用者確認的實跑需求與測試素材 | 觀察：第 218 行記下健身房課程預約需求與素材 | 一致 |
| P2-1～P2-2 | 無 | 無 | 只含 `data-plan` 的暫存專案 | 觀察：第 218 行「`.claude/skills/` 只放 `data-plan`」 | 一致 |
| P2-3 | 無 | 無 | Herdr 分支判定 | 觀察：第 218 行「以 Herdr 在同一個 tab 各開一個 pane」 | 一致 |
| P2-6 | Herdr 操作說明 | 無證據 | Herdr 操作說明 | 無證據 | 無證據 |
| P2-7 | Herdr 操作說明 | 無證據 | 以中階模型與推理強度啟動的測試 session | 觀察：第 218 行「啟動全新的 Claude Code」，第 220 行「Opus 5.5 high effort，`claude` 預設模型」 | 偏離 |
| P2-8～P2-13 | 無 | 無 | 轉接信任資料夾與提問 | 觀察：第 219 行信任資料夾由使用者回答 | 一致 |
| P3-1～P3-4 | 驗收紀錄 | 觀察：已使用 | 核對結果與使用者判定 | 觀察：第 220 行 E1–E5 符合；第 221 行使用者同意以 Sonnet 重跑後再判定 | 一致 |

第一個偏離點：P2-7（`DELEGATE` 以 Herdr 啟動測試 session）。P2-6 無證據，但 Herdr 操作說明只涉及指令用法，與要使用哪個模型無關；推論：P2-6 不影響偏離（依據 P2-7 的步驟文字沒有任何模型參數）。使用者自行執行的分支 P2-4 沒有實跑證據，但步驟文字同樣只給 `claude`（觀察：`SKILL.md` Phase 2 步驟 4）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `user-verify-skill`／`SKILL.md`／Phase 2 步驟 4、7（另及 Phase 4 步驟 4 的紀錄項目） | 缺失 | 觀察：Phase 2 步驟 7 只寫「以 `herdr agent start` 在其中啟動全新的 Claude Code」，步驟 4 只給 `claude`，Phase 1–2 沒有任何步驟決定測試模型或推理強度；結構診斷顯示本 Skill 沒有其他部位。推論：測試 session 一定沿用 Claude Code 的預設模型，與主 session 相同（依據紀錄 19 第 220 行、紀錄 20 第 159 行的觀察）。 | 假設 Skill 在 Phase 2 前依選模原則決定測試模型與推理強度（使用者指定時沿用），步驟 7 在 `--` 後傳 `--model`、`--effort`，步驟 4 的指令也帶同樣參數，並在實跑紀錄與 Phase 4 方式中記下：紀錄 19 第 1 輪會以 Sonnet、medium 啟動，E1–E5 可滿足；Phase 1 閘門、Phase 3–4 判定與收尾不受影響，E6 可滿足。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：選模原則已寫在 `skill-engineering` Phase 5 步驟 12，只是 `user-verify-skill` 沒有載入 | 未載入 | 觀察：`skill-engineering` Phase 5 步驟 12 只用於該 Skill 自己的驗收子代理，`user-verify-skill` 只在 Phase 3 步驟 7 委派 `skill-engineering` 優化，與測試 session 啟動無關；結構診斷顯示 `user-verify-skill` 沒有任何部位引用選模原則。表達預期的部位對本 Skill 不存在，所以是缺失而不是未載入 |
| H3：Claude Code 的預設模型是 Opus，屬於執行環境問題 | 非 Skill 問題 | 觀察：紀錄 19 第 221 行、紀錄 20 第 160 行以 `claude --model sonnet` 啟動成功，模型可以在啟動時指定；是否指定由 Skill 步驟決定。推論：改主 session 的預設模型會連帶降低主代理的設計能力，不是本次預期（依據使用者要求主 session 維持 Opus） |

## 7. 影響範圍

無：沒有其他 Skill 委派 `user-verify-skill`（結構診斷 `callers.user-verify-skill` 為空）。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整，適用範圍的判定是否符合你的預期？
2. 是否同意第 5 節的根因 R1？
3. E4「使用者指定測試模型或推理強度時沿用」是推定的預期，是否需要？
4. E5「實跑紀錄與 Phase 4 驗證紀錄寫出模型與推理強度」是推定的預期，是否需要？

## 確認紀錄

- 2026-10-29：使用者回覆「確認」，同意第 2 節驗收條件（含推定的 E4、E5）與第 5 節根因 R1。
