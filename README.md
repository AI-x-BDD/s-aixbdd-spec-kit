# s-aixbdd-spec-kit

## 關於這個 repo

《AI x BDD》課程第三章「基因工程」的練習 repo：以 [Spec-Kit](https://github.com/github/spec-kit) 為基因來源，用自建的 `skill-engineering` 家族打造自己的 SDD 工作流 Skills。

## 結構說明

| 路徑 | 內容 |
|---|---|
| `.claude/skills/` | Claude Code 格式的 skills |
| `.agents/skills/` | Codex／.agents 格式的 skills，與 `.claude/skills/` 實體相同 |
| `.spec-kit/` | Spec-Kit 基因庫（Skills、commands、`.specify` 設定），MIT 授權 |
| `specs/001-photo-album-organizer/` | 用 Spec-Kit 實際跑出的照片相簿 artifacts，作為基因樣本 |
| `docs/待確認.md` | 建立 repo 時尚未確認的事項 |
| `scripts/sync-skills.sh` | 同步兩邊的 skills 與 `CLAUDE.md`／`AGENTS.md` |
| `VERSION` | template 版本 |

> `.claude/skills/`、`.agents/skills/`、`VERSION` 是《AI x BDD》課程平台抓取與展示 skills 的固定位置，請勿更名、搬移或刪除。

## Skills

| Skill | 來源 | 說明 |
|---|---|---|
| `skill-engineering` | 自建（第二份作業） | 建立或優化 Skill，編排下列 `skill-form-*`、`skill-derive-*` |
| `skill-form-description`、`skill-form-sop`、`skill-form-rule`、`skill-form-template`、`skill-form-script` | 自建（第二份作業） | 撰寫 Skill 單一部位 |
| `skill-derive-rule`、`skill-derive-template`、`skill-derive-script` | 自建（第二份作業） | 為 SOP 步驟抽出部位 |
| `clarify` | [Waterball-Software-Academy/aixbdd](https://github.com/Waterball-Software-Academy/aixbdd)，Apache-2.0，原樣複製 | 需求訪談，供其他 Skill 委派 |

## 待確認

還有 2 項尚未確認：001 的 `spec.md` 沒有 NFR 段落、opencode／agy／cursor-agent 讀哪個 skills 目錄。細節與後續處理見 [docs/待確認.md](docs/待確認.md)。

## 授權

自建內容採 MIT，`clarify`、`.spec-kit/` 與課程官方內容保留各自授權，範圍見 [LICENSE](LICENSE)。

## 交流

這些 skills 歡迎直接取用，或依你的專案調整。如果有使用上的問題或改進建議，歡迎開 issue 與我討論。

---

## 官方宣告（以下區塊請保留）

本 repo 為[水球軟體學院](https://world.waterballsa.tw)《AI x BDD：規格驅動全自動化開發術》課程的學員產出，用於公告課程中道館作業的展示，並依[官方 Template](https://github.com/AI-x-BDD/aixbdd-skill-homework-template) 建立。

《AI x BDD：規格驅動全自動化開發術》課程四大特色：

1. **【軟工方法論＋結果導向】**
   只談 AI coding 不談軟工方法論，是不學無術！課程中強調結果導向的開發方法：只要訂好驗收標準，就可以 One-Shot 開發到位！
2. **【最完整的 SDD 概念與實作】**
   市面上最完整的 SDD 課程，一次教你 Skills、SDD、TDD、BDD 的知識與實踐，輕鬆實踐高效可靠全自動開發。
3. **【企業級實戰導入】**
   用企業級實踐導入高規格，不只學會工具，更知道如何舉一反三完全客製化企業專案需求。
4. **【課程教學方式與物超所值】**
   這是一堂理論、實務跟實戰三者兼具的 SDD 線上課程，用工作坊級別的學習體驗，不是只是教概念，而是直接帶著做！

[了解更多課程內容說明](https://waterballs.tw/Ghl6O)

## 開源專案：AI x BDD

水球老師把這套 AI x BDD 的方法論做成開源 pipeline skill：把產品迭代寫成 Gherkin，再一路帶到 RED → GREEN → REFACTOR。

覺得有幫助，歡迎給它一顆 Star：

[![Star Waterball-Software-Academy/aixbdd](https://img.shields.io/github/stars/Waterball-Software-Academy/aixbdd?style=social)](https://github.com/Waterball-Software-Academy/aixbdd)

## 相關問題洽詢管道

1. [水球軟體學院 LINE 官方帳號](https://lin.ee/STIsOLZ)
2. 客服信箱：[support@waterballsa.tw](mailto:support@waterballsa.tw)
3. [水球軟體學院（社群）Discord](https://discord.gg/Ymjz7NmZXn)

---

© 2026 水球球特務有限公司版權所有，侵害必究。
