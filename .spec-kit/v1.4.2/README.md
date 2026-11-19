# Spec Kit v1.4.2 部分檔案

本目錄放[調整計畫](../../docs/dev/spec-kit-1.4.2-調整計畫.md)用到的 Spec Kit v1.4.2 檔案。`.spec-kit/` 的其他內容是 `1.2.2.dev0`，保留不動（調整計畫第 9 節決定 7）。

- 上游：https://github.com/github/spec-kit
- tag：`v1.4.2`（tag 物件 `31f0b7163fb06e4f11c580884ef7170599e04467`）
- commit：`1e421b58805e33507258d917a16e4d2a403e8358`（2026-11-17，`chore: bump version to 1.4.2`）
- 複製日期：2026-11-19
- 複製方式：原樣複製，路徑保留上游 repo 根目錄的相對路徑，內容沒有修改。
- 授權：MIT，見 [`.spec-kit/LICENSE`](../LICENSE)。

## 檔案與用途

| 上游路徑 | 供哪一批使用 | 用途 |
|---|---|---|
| `extensions/bug/`（`extension.yml`、`README.md`、`commands/speckit.bug.{assess,fix,test}.md`） | 批 1 | 錯誤修正流程 `bug-assess`、`bug-fix`、`bug-test` 的基因來源 |
| `extensions/assess/`（`extension.yml`、`README.md`、`commands/speckit.assess.{intake,research,define,shape,decide}.md`） | 批 6 | 構想評估 `idea-assess` 的基因來源 |
| `templates/commands/converge.md` | 批 3 | 新建 `converge`、`tasks` 附加模式的基因來源 |
| `templates/commands/tasks.md` | 批 2、3 | 欄位引用（`Entity.field`）規則；converge 附加任務的格式 |
| `templates/commands/analyze.md` | 批 2 | Constrained-Field Coverage 表、任務順序檢查、嚴重度細節 |
| `templates/tasks-template.md` | 批 2 | v1.4.2 任務樣板，對照欄位引用的寫法 |
| `docs/how-to/contract-driven-development.md` | 批 5 | `api-plan` 的行為語意與權威擁有者 |
| `docs/how-to/evolving-specs.md` | 批 1 | 缺陷與意圖改變的分流（`bug-assess` 的「意圖改變」判定） |
