# 根因報告：implement－完成報告未執行 report

- 紀錄目錄：`specs/skill-engineering/40-implement-完成報告未執行report/`
- 問題證據：`user-verify-skill` 第 4 輪實跑（2026-11-08，紀錄 39 修改後版本）；暫存專案 scratchpad `verify-implement/`；對話紀錄 `~/.claude/projects/-private-tmp-…-scratchpad-verify-implement/c23dbc0a-42a7-4187-bb67-b50831191fa9.jsonl`；`.agents/skills/implement/SKILL.md` Phase 2 步驟 5、Phase 3 步驟 1–2；`scripts/tasks_state.py` 的 `remaining_tail` 與 `next`；紀錄 29 R4

## 1. 使用者回報的問題

實跑需求「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1 與 Phase 2」。憲法載入、衝突受阻、一次一個任務都正確，但 Phase 3 沒有執行 `report`，完成報告由 AI 自行撰寫，沒有「憲法遵循」。使用者判定不通過，並選擇修改腳本提醒文字的方向。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 範圍內任務都打勾或受阻後，Phase 3 執行一次 `report`，完成報告的資料來自其工具輸出（含「憲法遵循」5 項） | 本次 | 通用 | S1、S2 |
| E2 | 紀錄 37、38、39 的驗收條件仍成立 | 既有 | 通用 | S1、S2 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 1 次 `report` | 0 次；完成報告沒有「憲法遵循」 | 觀察：對話紀錄 `tasks_state.py` 呼叫統計 `status` 1、`next` 21、`check` 2、`block` 18、`report` 0；最後一則訊息只列受阻原因、新增檔案與解除方式 |

## 4. 演練表

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P2-12、P2-13（T020） | 無 | 無 | `block` 輸出與進度回報 | 觀察：`block T020` 的 `progress` 末行「範圍內任務已全部完成：進入完成報告」 | 一致 |
| P2-4、P2-5 | 無 | 無 | `next` 回傳 `task: null` 後進入 Phase 3 | 觀察：`next` 共 21 次 | 一致 |
| P3-1 | 無 | 無 | 執行 `report` 取得「完成報告摘要」 | 觀察：沒有 `report` 呼叫 | 偏離 |
| P3-2 | 無 | 無 | 原文輸出 `report` 再補其他項目 | 觀察：AI 自行撰寫，缺「憲法遵循」 | 偏離（連帶） |

第一個偏離點：P3-1。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R4' | `implement`／`scripts/tasks_state.py` 的 `remaining_tail`（範圍完成時的提醒）與 `next` 回傳 `task: null` 的輸出；對應 Phase 3 步驟 1 | 載體過弱 | 觀察：Phase 2 期間每個 `check`／`block` 的提醒都指名下一個命令（「立即執行 next」），AI 都照做；範圍完成時的提醒只寫「進入完成報告」，`next` 的 `null` 輸出也沒有下一步，Phase 3 要執行 `report` 只在 SOP 文字中。觀察：第 4 輪 AI 直接撰寫報告，沒有呼叫 `report`。觀察：紀錄 29 R4 以腳本提醒文字解決了「中途停下」，同類做法有效。推論：Phase 3 的入口命令沒有由腳本提示，交給 AI 記得 SOP 文字，結果不穩定 | 假設範圍完成時的提醒與 `next` 的 `null` 輸出都指名「執行 report 取得完成報告摘要」：AI 在進入 Phase 3 時直接看到下一個命令，P3-1 執行 `report`，P3-2 依其輸出撰寫，E1 滿足；Phase 2 行為不變，E2 不受影響 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H10：SOP 沒有要求執行 `report` | 缺失 | 觀察：Phase 3 步驟 1 原文為 `DELEGATE` 執行 `tasks_state.py report` |
| H11：`report` 無法執行 | 非 Skill 問題 | 觀察：紀錄 38、39 的實跑與驗收中 `report` 都能執行並輸出正確內容 |

## 7. 影響範圍

- 沒有其他 Skill 委派 `implement`。

## 8. 待確認事項

1. 驗收條件 E1、E2 是否正確、完整？
2. 是否同意 R4'（載體過弱）？
3. 缺少的證據：無。

## 確認紀錄

- 2026-11-08 使用者參考課程依據後回覆「照建議」：確認 E1、E2 與 R4'。
