# 交接：用 Steve 處理下一節課程文章

## 新對話現在要做的事

在目前同一個 `personal-helper-proposal` Git 工作目錄接續。讀取 `.agents/skills/steve/SKILL.md`，使用 Steve 處理下一節課程文章。使用者尚未指定本次是哪一節；先問「這次要用哪一節的逐字稿？」若使用者已在新對話提供來源，直接沿用。確認來源後，才確認私有輸出位置；若已提供則直接沿用。取得兩項必要輸入後，實際交接給 `course-article`，核對文章、筆記與檢查結果，再回報。保留既有正式稿、筆記與原逐字稿，不 push。

## 接續所需狀態

- Steve 第一條路徑已實作。先前回報的暫存驗收涵蓋正常交稿、退回修好、重驗仍失敗；詳 `specs/skill-engineering/66-steve-建立/blueprint.md` §5。這會是使用者的實際試用。勿為了接續重跑同一篇示範。
- `course-article` 實作、潤稿依賴及來源終檢，以 `.agents/skills/course-article/SKILL.md` 和 `specs/skill-engineering/65-course-article-可替換潤稿依賴/blueprint.md` §8 為準。使用者已確認先前試稿的文風可以；不重問文風、篇幅或是否每篇加操作。
- 本次確認 Steve 兩側 Skill 和 66 號藍圖仍為本機未追蹤內容。沿用同一個工作目錄，勿切去其他 checkout、移除既有變更或以重新 clone 取代。私有課程素材與輸出留在私人位置，參考根目錄 `AGENTS.md`「個人小幫手（Steve）目標」。

## 建議使用的 Skills（Suggested skills）

1. `steve`：有 Skill 工具時先呼叫；否則讀 `.agents/skills/steve/SKILL.md`。由它選路、交接與收件。
2. `course-article`：在 Steve 補齊輸入後由 Steve 委派；有 Skill 工具時呼叫，否則依 `.agents/skills/course-article/SKILL.md` 執行。沿用專案設定選擇的潤稿 Skill。
