# STATUS（一頁，上限 40 行；直接改寫，不往上疊）

更新：2026-11-23｜基準提交：本 repo 5aaee77（含 STATUS.md 以外的提交）、課程 repo main cbe1d3b
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
- 舊 Skill `lesson-prep-writing`、`lesson-prep-workflow` 已於 2026-11-23 刪除（使用者同意）。復原：`git checkout 8b23981 -- .agents/skills/lesson-prep-writing .agents/skills/lesson-prep-workflow`，再執行 `scripts/sync-skills.sh --from agents`。寫文 Skill 現為 `course-article`（未驗證標記仍在，S2、S3 未做）。
- 舊驗證證據（約 310 MB）已刪除；根因報告與設計文件留在課程 repo `specs/`。

## 現在卡在哪
`course-article` 已施工，S1 驗收通過（概念型小節）。等使用者閱讀 S1 文章並判斷：
`lesson-preparation-perspective/articles/intro-to-ai-agents/course-article-s1/article.md`（約 2,500 字）。
Skill：`.agents/skills/course-article/`。藍圖與驗收結果：`specs/skill-engineering/63-course-article-建立/blueprint.md`。

## 下一個動作
使用者讀 S1 文章，回覆方向對不對。要驗收操作型小節（S2）與章級整合（S3）時，使用者提供第二份真實逐字稿。

## 不要做
- 不用自製測試材料當交付；不帶入課程以外的產品、案例。
- 不自動推進安裝或 Steve 施工；未經授權不 push。

## 需求全文（只在需要細節時讀）
`docs/handoff/Steve與課程筆記-目前狀態.md` §2–§4（第 783 行起）。該文件不再往上加新段落。
