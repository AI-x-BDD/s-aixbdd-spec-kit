# STATUS（一頁，上限 40 行；直接改寫，不往上疊）

更新：2026-11-23｜基準提交：本 repo 8b23981（寫入 STATUS.md 之前）、課程 repo main 5cb8604
`git log` 在基準提交之後出現 STATUS.md 以外的新提交時，先回報「STATUS 可能過期」，再做事。

## 最終目標（只有使用者能改）
個人 Orchestrator「Steve」：依判準選 Skill → 交接素材與完成條件 → 檢查回傳。
依據：`docs/wb-secret-formula/決策樹.md`。

## 這一段目標（只有使用者能改）
第一個子 Skill「課程文章 Skill」：小節逐字稿 → 有 SEO 方向的文章，只用課程內容。
短文 500–600 字或中型 2,000–3,000 字；概念課不硬加操作。

## 已確定決定（只有使用者能改）
- 順序：重做課程文章 Skill → 使用者驗證 → 定義 Steve 第一條交接路徑 → home repo 最後。
- 舊寫文 Skill 重做，使用 skill-engineering；以真實逐字稿驗收，不建自製測試資料。
- Steve 只做選路與交接，不放寫作 SOP。
- 長短文、SEO、是否每篇有操作，都已回答，不再問。
- Skill 可公開；付費逐字稿與文章只放私有課程 repo。

## 位置
- Steve 與所有 Skill：本 repo `personal-helper-proposal` 分支的 `.agents/skills/`、`.claude/skills/`。
- 逐字稿與文章：私有 repo `/Volumes/data/Projects-practice/lesson-preparation-perspective`（`materials/`、`articles/`）。該 repo 已不含任何 Skill。
- 舊 Skill `lesson-prep-writing`、`lesson-prep-workflow` 已移入本 repo，內容尚未依新需求修改。
- 舊驗證證據（約 310 MB）已刪除；根因報告與設計文件留在課程 repo `specs/`。

## 現在卡在哪
示範文章 `lesson-preparation-perspective/articles/intro-to-ai-agents/demo-article.md` 等使用者判斷方向。

## 下一個動作
使用者讀示範文章，回覆方向對不對、哪裡太多或太少。確認後用 skill-engineering 重做 Skill。

## 不要做
- 不用自製測試材料當交付；不帶入課程以外的產品、案例。
- 不自動推進安裝或 Steve 施工；未經授權不 push。

## 需求全文（只在需要細節時讀）
`docs/handoff/Steve與課程筆記-目前狀態.md` §2–§4（第 783 行起）。該文件不再往上加新段落。
