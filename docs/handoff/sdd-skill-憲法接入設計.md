# 交接：第三章第 18 單元「憲法」剩下的工作（2026-11-04）

給換電腦後接手的 agent 閱讀。第 18 單元只剩**最終驗收的收尾**。

## 1. 已完成的工作（只列位置，不重述）

| 工作 | 紀錄 |
|---|---|
| `constitution` Skill 建立並由使用者驗證 | `specs/skill-engineering/31-constitution-建立/`、`33-constitution-澄清答案強度被升級/` |
| 9 個 SDD Skill 接入憲法（子代理驗收 S1–S8 通過） | `specs/skill-engineering/32-sdd-skills-接入憲法/blueprint.md` 第 8 節 |
| 課程 32:00 的最終驗收：對 `002-room-game-chat` 執行 `technical-research` → `system-analysis` | 產出在 `specs/002-room-game-chat/`；過程與結果見 [002-最終驗收紀錄.md](./002-最終驗收紀錄.md) |

## 2. 待完成

依序做：

1. **使用者決定軟刪除衝突**（見驗收紀錄第 3.1 節）。建議：維持 `data-model.dbml` 的連帶刪除，用 `/constitution` 在 `skills/data-plan/data-model.md` Rule 2 加一條例外：「spec 明確要求不保留的資料，可以直接刪除」。
2. **使用者看過 002 的產出，確認驗收通過**：
   - 9 個 SDD Skill 的 `description` 目前開頭都有「（未驗證）」。
   - 使用者確認通過後，用 `user-verify-skill` 移除這 9 個 Skill 的「（未驗證）」，並在 32 號藍圖記錄使用者實際驗證。
   - 這 9 個 Skill 是：`s-specify`、`clarify-over-specs`、`technical-research`、`system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`tasks`、`implement`。
   - 使用者只驗證了 `technical-research`、`system-analysis` 以及 3 個 Planner。其他 4 個 Skill 是否一起移除標記，要先問使用者。
3. **記錄驗收時發現的問題**：把驗收紀錄第 4 節的發現 A、B 記到 `docs/待確認.md`。要記之前先問使用者。
4. **打 tag**：依 CLAUDE.md 規則 6，提議 `ch3-18-constitution`。打 tag 前先問使用者。
5. **提醒做 Analyze 作業**：見 `docs/待確認.md` 第 18 項。

## 3. 換電腦前（在舊電腦執行）

`specs/002-room-game-chat/` 的產出和本目錄都**還沒有 commit**。要先 commit 並 push，另一台電腦才拿得到。commit 前與 push 前都要先問使用者。commit 訊息用 `conventional-commits`。

## 4. 建議呼叫的 Skill

| 時機 | Skill |
|---|---|
| 修改 `data-model.md` 憲法（待完成 1） | `constitution` |
| 移除「（未驗證）」（待完成 2） | `user-verify-skill` |
| 寫 commit 訊息 | `conventional-commits` |
| 比對課程 32:00–35:35 | `wsa-course` MCP（`get_lesson_content`，chapterId 3，lessonId 18） |

## 5. 使用者偏好（接手時照做）

- 先給結論，只講重點。回答用繁體中文，並依 CLAUDE.md「回答方式」使用 ASD-STE100 寫法。
- 要使用者做選擇時，先給一個「不會出錯」的建議選項，用一兩句白話說明。不要寫很長的 Context。使用者這次看到兩次長篇提問，都看不懂，也覺得很煩。
- commit、push、打 tag 前都要先問使用者。

## 6. 可直接貼上的提示詞（新電腦，git pull 之後）

```text
請先讀 docs/handoff/sdd-skill-憲法接入設計.md 與 docs/handoff/002-最終驗收紀錄.md，接手第三章第 18 單元「憲法」剩下的工作。

1. 用 git log 確認 specs/002-room-game-chat/ 的 research.md、techstack.md、plan.md、ui/、data/、contracts/ 都已在本機；缺少時停下來告訴我。
2. 依交接文件第 2 節「待完成」從第 1 項開始做。每一項要我決定時，只給我一個建議選項和一句理由，我回「好」就照做。
3. commit、push、打 tag 前都先問我。
```
