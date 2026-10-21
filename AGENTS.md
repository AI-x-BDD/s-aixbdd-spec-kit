# CLAUDE.md

給在本專案中工作的 AI coding agent（Claude Code、Codex、OpenCode、Antigravity、Cursor 等）閱讀的共用指引。下方「課程產出規範」取自[官方 Template](https://github.com/AI-x-BDD/aixbdd-skill-homework-template)。

## 專案概覽

《AI x BDD》課程第三章「基因工程」的練習 repo：以 Spec-Kit 為基因來源，用 `skill-engineering` 家族打造自己的 SDD 工作流 Skills。

## 目錄結構

```
.
├── .claude/skills/        專案 Skills（Claude Code 讀這裡）
├── .agents/skills/        與 .claude/skills/ 實體相同（Codex 等讀這裡）
├── .spec-kit/             Spec-Kit 基因庫：Spec-Kit 的 Skills、commands 與 .specify 設定，未安裝到 agent 目錄
├── specs/001-photo-album-organizer/  用 Spec-Kit 實際跑出的 artifacts，作為基因樣本
├── docs/待確認.md         尚未確認的事項；確認後更新
├── LICENSE                授權與範圍
└── scripts/sync-skills.sh 同步兩邊的 skills 與 CLAUDE.md／AGENTS.md
```

## 規則

1. `.spec-kit/` 與 `specs/001-photo-album-organizer/` 是參考素材。只有使用者明確要求參考時才讀取，不要主動拿它們做落差分析或修改。
2. 外部 Skill 保持原樣，不直接修改內容；要更新時從上游重新複製：
   - `clarify`：來自 https://github.com/Waterball-Software-Academy/aixbdd ，Apache-2.0，授權與來源見 `clarify/LICENSE`
   - `.spec-kit/`：來自 https://github.com/github/spec-kit ，MIT，授權見 `.spec-kit/LICENSE`
3. 自建的 Skill（`skill-engineering`、`skill-form-*`、`skill-derive-*`、`conventional-commits`，以及之後新建的 SDD Skills）可以直接修改。參考外部 Skill 改寫時，在該 Skill 目錄放 `LICENSE`，註明來源並保留原授權全文，同時更新根目錄 `LICENSE` 的「授權範圍」，列出該 Skill 含有哪個來源的衍生內容。
4. 在任一邊建立、修改或刪除 Skill，或修改 `CLAUDE.md`／`AGENTS.md` 之後，從自己編輯的那一邊執行同步：
   - 改的是 `.claude/skills/` 或 `CLAUDE.md`：`scripts/sync-skills.sh --from claude`
   - 改的是 `.agents/skills/` 或 `AGENTS.md`：`scripts/sync-skills.sh --from agents`
   - 刪除 Skill 時，腳本不會刪除另一邊的同名資料夾，要手動刪掉兩邊。
   - 同步後用 `scripts/sync-skills.sh --check` 確認兩邊一致。

## 課程產出規範

本 repo 是水球軟體學院「AI x BDD」課程的學員產出 repo（由官方 template 產生），可能是道館作業，也可能是學員想分享的 skill 群——定位由學員決定。
你（AI agent）在此 repo 的所有產出必須遵守本規範。

### 語言

- 與學員互動、文件內容一律使用繁體中文。
- 程式碼、識別字、指令、技術術語維持原文，不翻譯。

### 結構錨點不可動（最重要）

課程平台依固定路徑**自動抓取並展示 skills**，以下一律不得更名、搬移、刪除：

- 根目錄 `.claude/skills/`、`.agents/skills/` 路徑
- 根目錄 `VERSION` 檔
- 根目錄 `README.md` 文末的官方區塊：「官方宣告」「開源專案：AI x BDD」「相關問題洽詢管道」與版權宣告

### skills 就是產出

- 若本 repo 是道館作業：要繳交的 skill 清單以**課程平台道館頁列出的題目為準**——不多做、不漏做。
- skill 放進學員所用 agent 對應的目錄（`.claude/skills/` 或 `.agents/skills/`）。
- 每個 skill 必須可獨立運作：用途、觸發時機、步驟齊備，不依賴當次對話的上下文。
- 未經學員實際驗證的 skill，要在說明中標明「未驗證」，不得寫成已驗證。

### 宣傳自由 vs 規範界線

- 文末官方區塊以外，README 與 repo 內容**隨學員自由發揮**——這個 repo 同時是學員的開源作品集，鼓勵個人風格與對外宣傳。
- 不要主動把 README 改造成制式表單；學員要展示什麼、怎麼展示，由學員決定。

### 提交前守門（僅當學員把本 repo 當道館作業繳交）

學員表示要繳交時，逐項核對、缺漏明確列出、不默默略過：

1. 道館頁列出的 skills 是否都已就位（路徑正確、可獨立運作）。
2. demo 影片（3 分鐘內）是否已備妥。
3. 提醒學員：回課程平台貼上本 repo 連結＋影片連結，缺一不可。
4. 非繳交條件（不得列為缺漏）：可提醒學員，若這套方法論有幫助，歡迎到開源專案 https://github.com/Waterball-Software-Academy/aixbdd 按 Star 支持。
