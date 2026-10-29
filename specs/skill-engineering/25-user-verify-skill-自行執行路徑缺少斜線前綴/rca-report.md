# 根因報告：user-verify-skill－自行執行路徑缺少斜線前綴

- 紀錄目錄：`specs/skill-engineering/25-user-verify-skill-自行執行路徑缺少斜線前綴/`
- 問題證據：本次對話上下文中紀錄 24 驗收情境 S2、S3 子代理的回報；`.claude/skills/user-verify-skill/SKILL.md` Phase 2 步驟 4、步驟 9；紀錄 24 `blueprint.md` 第 8 節的「觀察」

## 1. 使用者回報的問題

紀錄 24 驗收時發現：使用者自行執行的路徑（Phase 2 步驟 4）只要求提供「實跑需求」原文，沒有像 Herdr 路徑（步驟 9）一樣規定，目標 Skill 有 `disable-model-invocation: true` 時要在需求前加上 `/<目標 Skill 名稱>`。這類 Skill 不會被自然語言觸發，使用者照原文送出，測試 session 就不會執行目標 Skill。使用者要求修正步驟 4。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 使用者自行執行時，目標 Skill 的 frontmatter 有 `disable-model-invocation: true`，提供給使用者的需求以 `/<目標 Skill 名稱>` 開頭 | 本次 | 通用 | S1 |
| E2 | 使用者自行執行時，目標 Skill 沒有 `disable-model-invocation: true`，提供給使用者的需求是自然語言原文，不加 `/` 前綴、不指名目標 Skill | 既有 | 通用 | S2 |
| E3 | 使用者自行執行時，提供的啟動指令仍為 `cd <暫存專案絕對路徑> && claude --model <測試模型> --effort <測試推理強度>` | 既有 | 通用 | S1、S2 |
| E4 | 其餘既有行為不變，包含 Herdr 路徑的步驟 9 | 既有 | 通用 | 步驟 9 本次未修改，逐步演練 |

驗收情境：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E3 | 本次 | 在含本次修改的主專案暫存複本中，執行 `/user-verify-skill s-specify`，紀錄目錄 `07-s-specify-依賴決定了故事優先級`；實跑需求「團隊共用會議室預約：成員可以預約時段與取消，同一時段不能重複預約」，不需要測試素材；Phase 2 步驟 3 的檢查以 `env -u HERDR_ENV` 執行 | Phase 2 步驟 5 不回報已跑完 | 步驟 4 提供的需求以 `/s-specify` 開頭；指令為 `cd <暫存專案絕對路徑> && claude --model sonnet --effort medium` |
| S2 | E2、E3 | 回歸 | 同 S1 的環境，執行 `/user-verify-skill plan-with-class-diagram`，紀錄目錄 `11-plan-with-class-diagram-新增循序圖段落`；實跑需求「規劃一個圖書館借書與還書的 Java 類別設計，從零開始、沒有既有程式碼」，不需要測試素材 | Phase 2 步驟 5 不回報已跑完 | 步驟 4 提供的需求是自然語言原文，沒有 `/` 前綴，也沒有寫出 `plan-with-class-diagram`；指令同 S1 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 步驟 4 規定加上 `/<目標 Skill 名稱>` | 步驟 4 只寫「『實跑需求』原文」；S2、S3 的子代理比照步驟 9 自行加上前綴，並各自回報「SOP 沒有明確規定，是我的判斷」 | 觀察：`SKILL.md` Phase 2 步驟 4、步驟 9；紀錄 24 S2、S3 子代理回報；紀錄 24 `blueprint.md` 第 8 節「觀察」第 1 點 |

## 4. 演練表

`user-verify-skill`，以紀錄 24 的 S2 演練（目標 `s-specify`，有 `disable-model-invocation: true`，不在 Herdr）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-7 | 目標 Skill、紀錄目錄 | 觀察：子代理讀取 `s-specify` 與紀錄 07 | 驗證輸入、實跑需求、測試模型 | 觀察：需求為會議室預約，測試模型 `sonnet`／`medium` | 一致 |
| P2-1～P2-2 | 無 | 無 | 乾淨的暫存專案 | 觀察：`.claude/skills/` 只有 `s-specify`、`clarify`，`git status` 為空 | 一致 |
| P2-3 | 無 | 無 | 不在 Herdr 的分支 | 觀察：檢查結果 exit 1，進入步驟 4 | 一致 |
| P2-4 | 目標 Skill 的 frontmatter（P1-1 已讀） | 觀察：子代理已知 `s-specify` 有 `disable-model-invocation: true` | 需求以 `/s-specify` 開頭，由 SOP 規定 | 觀察：需求以 `/s-specify` 開頭，但子代理回報這是比照步驟 9 的自行判斷，步驟 4 沒有規定 | 偏離 |

第一個偏離點：P2-4（`WRITE` 提供使用者自行執行的指令與需求）。產出碰巧正確，但正確與否取決於執行者是否自行比照步驟 9；步驟文字照字面執行會得到沒有前綴的「原文」。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `user-verify-skill`／`SKILL.md`／Phase 2 步驟 4 | 缺失 | 觀察：步驟 9 有「目標 Skill 的 frontmatter 有 `disable-model-invocation: true` 時，改在需求前加上 `/<目標 Skill 名稱>`」，步驟 4 沒有對應要求，只寫提供「實跑需求」原文；本 Skill 沒有其他部位（結構診斷 `parts` 為空）。推論：照字面執行步驟 4 時，手動觸發的 Skill 不會被執行（依據步驟 4 的文字與 `disable-model-invocation` 的作用）。 | 假設步驟 4 也規定有 `disable-model-invocation: true` 時加前綴：S2、S3 的子代理不需要自行判斷就會產出 `/s-specify` 開頭的需求，E1 可滿足；沒有該欄位時仍提供原文，E2 可滿足；指令不變，E3 可滿足；步驟 9 不受影響，E4 可滿足。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：步驟 4 與步驟 9 的要求互相矛盾 | 衝突 | 觀察：步驟 4 沒有任何關於前綴的要求，步驟 9 的前綴規則只寫在 Herdr 分支；兩者沒有矛盾的規定，而是步驟 4 缺少要求 |
| H3：執行者能自行比照步驟 9，屬於模型能力範圍，不是 Skill 問題 | 非 Skill 問題 | 觀察：S2、S3 的子代理都把加前綴標成「SOP 沒有明確規定，是我的判斷」並請委派者確認。推論：結果依賴執行者是否自行推論，換一個執行者或不同情境可能照字面送出原文（依據兩份回報的觀察） |

## 7. 影響範圍

無：沒有其他 Skill 委派 `user-verify-skill`（結構診斷 `callers.user-verify-skill` 為空）。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整？
2. 是否同意第 5 節的根因 R1？
3. 回歸情境 S2 以 `plan-with-class-diagram`（沒有 `disable-model-invocation`）驗證不加前綴的情況，是否合適？

## 確認紀錄

- 2026-10-29：使用者回覆「確認」，同意第 2 節驗收條件、第 5 節根因 R1，以及回歸情境 S2 使用 `plan-with-class-diagram`。
