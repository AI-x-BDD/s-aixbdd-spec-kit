# 工程藍圖：course-article－可替換潤稿依賴

- 模式：優化既有 Skill。
- 根因與 E1～E4：[根因報告](rca-report.md)。使用者已明確核准依本版施工與暫存驗收；私有課程檔案、Steve、全域 Skill 保持原樣，未授權推送。

## 1. 驗收條件

沿用根因報告 E1～E4。S1～S4 定義見 §7。更換定義為下一次執行時讀取所選版本；同一篇稿固定使用開工時檢查過的版本。

## 2. To-Be SOP（現有基線加以下差異）

- 基線：`.agents/skills/course-article/SKILL.md`，commit `d47dfe1`。保留原有三個 Phase、frontmatter、選材、筆記、篇幅、來源與關鍵字規則。
- Phase 1 過完素材缺漏檢查後，讀取 `course-article/polisher.json`。其唯一選擇欄位 `bundle` 指向專案相對路徑 `vendor/skills/shuorenhua/2.5.0`。解析後限制在專案 `vendor/skills/`。從所選目錄的 `bundle.json` 取得名稱、版本、來源、固定 commit、執行檔清單與雜湊；確認入口與所需檔案可讀且版本雜湊相符。選定後保存給本次任務使用。缺檔、版本不符或無法讀取時，回報路徑及恢復已隨附副本的方法，在寫入草稿前停止。禁止到全域找同名替代品。
- Phase 3 在原本生成正文和終檢之間加入潤稿。先保留工作草稿，讀取所選 Skill 完整入口並依其指示載入參考。交接只給草稿及編輯邊界：改表達，保留事實、例子、適用條件、確定程度、操作與提示詞。潤稿只處理文字，不改逐字稿、筆記或其他檔案。回傳全文或明確回報全文原樣保留；交接失敗時回報草稿位置及原因，不交正式稿。
- 以潤稿後正文執行原正文與篇幅檢查；發現偏差先修正再重查，通過才交 `article.md`。沿用原有篇幅無計數工具處理方式。交稿時加上潤稿 Skill 名稱、版本與結果。

## 3. 差異表

- 刪除：無。Steve、課程私有 repo、全域安裝、原分析與章級流程都不修改。
- 修改：`.agents/skills/course-article/SKILL.md` 的 Phase 1 和 Phase 3，以及根目錄 `LICENSE` 的範圍說明。按現有腳本同步 `.claude/skills/`。
- 新增：`.agents/skills/course-article/polisher.json`、專案 `vendor/skills/shuorenhua/2.5.0/` 下 `bundle.json` 和上游 3 個執行檔及 `LICENSE`，並新增受 `course-article` SOP 呼叫的唯讀依賴檢查腳本。第三方檔案保持上游位元組，來源 `https://github.com/MrGeDiao/shuorenhua.git` 固定 commit `5a9eafefe03807404135f4d2ee4f42fe61d58759`。
- 保留：上游完整 `SKILL.md`、`references/editing-guide.md`、`references/examples.md`。範圍由上游 `runtime-files.json` 定義；上游開發檔不納入執行套件。

## 4. 淨增減

Phase 維持 3 個；新增 1 個選擇設定、1 個唯讀檢查腳本、1 份上游執行副本及其描述。專案共用同一份上游副本，避免在全域與專案同時註冊同名指令，也避免 `.agents` 與 `.claude` 各帶一份上游檔案。整套移植時需攜帶所選 `vendor/skills/` 目錄。

## 5. 約束分配表

| 約束 | 所屬步驟 | 存放位置 | 理由 |
|---|---|---|---|
| 固定版本、由單一設定切換 | P1 | `polisher.json`、`bundle.json` | 分開選擇與套件資料 |
| 路徑、缺檔、雜湊預檢 | P1 | 唯讀腳本與 SOP 的受阻分支 | 給出可重現結果 |
| 全套規則自行判斷怎麼改 | P3 | 上游原版 Skill | 避免拆解成單篇規則 |
| 交接邊界及最終內容檢查 | P3 | `course-article` SOP 與既有正文規則 | 替換潤稿 Skill 時獨立保留 |

## 6. 施工工作項

| 順序 | 執行者 | 工作項 | 狀態 |
|---|---|---|---|
| W1 | 主 session | 按固定 commit 複製上游 3 檔和 MIT 授權，生成 `bundle.json`，補根目錄授權範圍 | 已完成 |
| W2 | `skill-form-script` | 實作唯讀檢查腳本；以 `polisher.json` 為單一選擇，輸出選定入口或指出缺項 | 已完成 |
| W3 | `skill-form-sop` | 將預檢、潤稿與終檢接到既有 SOP；同步及診斷 | 已完成 |
| W4 | 獨立驗收程序 | 在隔離環境執行 S1～S4，現有私有文章僅作為參考，所有試稿只落暫存目錄 | 部分通過，見 §8 |

## 7. 驗收情境

| 編號 | 驗證 | 輸入 | 預先回覆 | 判斷方式 |
|---|---|---|---|---|
| S1 | E1、E4 | 〈Intro to AI Agents〉真實逐字稿暫存副本、空 HOME、專案隨附 `shuorenhua`、暫存輸出位置 | 無 | 紀錄顯示使用固定版本並執行潤稿；原文內容、概念文分支、引句、篇幅與關鍵字狀態通過；現有正式文章不變。 |
| S2 | E1、E2 | 同素材、測試專用替換 Skill、只變更 `bundle` 設定值 | 無 | 紀錄顯示改讀該入口；SOP 與 Steve 無 diff；測試副本不作正式交付。 |
| S3 | E3 | 隔離副本刪去套件的必讀參考檔 | 無 | 預檢點名缺檔、停止，無新筆記或文章、無全域替代。 |
| S4 | E4（回歸） | 暫存、可寫出觀念關係的多節來源筆記；演練另含無新增價值分支 | 無 | 有新增價值維持章級輸出與來源追溯；無新增價值照舊結束。若真實多節來源不可用，記為演練並揭露。 |

## 8. 驗收結果

結構診斷 0 error／0 warning，Skill 兩側同步一致，`git diff --check` 通過。上游 3 個執行檔與 MIT 授權逐檔比對一致。

S1～S3 以 Pi 1.6.0、`openai/gpt-6-luna`、`medium` 在 `/tmp/course-polish.dVmC9o/` 的三個獨立程序執行。每個環境用空 HOME、獨立 agent dir，關閉全域 Skill 探索與擴充。`s1/`～`s3/` 各有 `run.jsonl`、`preflight.out`、`preflight.err` 與輸出目錄。暫存的 3 份 Pi 登入副本經使用者核准後刪除；本機原登入檔保留。

| 情境 | 結果 | 證據 |
|---|---|---|
| S1 | 部分通過 | 選到並讀取 `shuorenhua 2.5.0` 與兩份參考，實際改動工作草稿並交稿；正文 2,187 字，引句獨立重驗 6 段通過。人工回看發現試稿把「讀者坐駕駛座，LLM 提供導航」寫成「一般 LLM 像坐在駕駛座上的人」。執行紀錄顯示，角色錯置在第一次寫入工作草稿時已出現，潤稿及終檢未修正；正文忠實度未通過。 |
| S2 | 通過 | 只切換設定至 `test-polisher` v1；讀取替換入口，回報 `SWITCH-65` 與原樣保留結果，585 字，引句獨立重驗 7 段通過。SOP 與正式版相同。 |
| S3 | 通過 | 缺少 `references/editing-guide.md` 時預檢退出 1。模型回報缺檔及還原方式，無草稿、筆記或文章。 |
| S4 | 靜態演練，未實跑 | 有新增價值時沿用 P1 規劃、P2 章級來源核對及新增的 P3 潤稿；無新增價值時照舊在 P1 結束。已查私有文章目錄，只有本節的 `notes.md`，未用假素材替代真實多節回歸。 |

私有 `article.md`、`notes.md` 的 SHA-256 與施工前相同。全域 `shuorenhua` 的 Git 工作區乾淨；未修改 Steve、未提交或推送。S1 內容問題依 Skill 工程流程回到診斷，避免先改上游潤稿規則；完整驗收待來源終檢回歸。

### 來源終檢回歸

使用者核准只修改潤稿後、交稿前的核對。Phase 3 第 6 步與正文 Rule 3 要求待交稿子句和來源並列、兩邊角色各自記錄；缺稿件短引時不能通過。只同步本次終檢修改；既有依賴、全域檔、Steve 和私有產物維持原樣。

- 已知錯稿：Claude Code Sonnet、medium，三次新程序。前兩次即使整理出來源角色，仍把錯句判為相符，第二次只是改成另一種不正確的比喻。最後版本的 `challenge3/out/check-log.md` 第 22 行逐字擷取錯句、判為不符、修正後重核；`challenge3/out/article.md` 第 11 行保留人駕駛、LLM 提供導航，另一種情境才由 LLM 駕駛。角色錯置回歸通過。
- 真實逐字稿從頭重跑：第一次遇到 Claude 寫入許可受阻；第二次完成筆記、草稿與 `shuorenhua 2.5.0` 潤稿，在交付前逾時（嘗試使用的 `cp` 被權限拒絕）。另開新程序由已潤稿全文接續 Phase 3 第 6～7 步，留下 `fresh/out/check-log.md` 和 `article.md`。新稿第 25 行的開車比喻角色對應來源；第 37 行保留延遲限制的適用條件與確定程度，第 43 行保留「最大的失敗模式之一」。執行者重算正文 2,292 字，筆記引句 25 段逐字相符。以上為分段驗證，之後另加單次完整重跑。
- 單次完整重跑：沿用 Claude Code Sonnet、medium，限制以 Write 或 Edit 寫入暫存 `out/`。同一程序從逐字稿走完規劃、筆記、`shuorenhua 2.5.0` 潤稿、來源終檢與交付。獨立重驗正文 2,333 字、43 段筆記引句逐字相符；另回查正文第 27、39、45 行，分別確認開車比喻的角色、延遲限制的條件、失敗模式的範圍均與來源相符。結果保存在 `full.jsonl`、`full/out/article.md` 和 `full/out/source-check.md`。本次要求的兩項驗證均已完成。
- 記錄根目錄 `/tmp/course-source-check.PdZi36/`；`challenge3.jsonl`、`fresh2.jsonl`、`fresh-finish.jsonl` 保存工具與結果。驗收直接使用既有 Claude 登入，未另存登入憑證。同步一致、結構診斷 0 error／0 warning，`git diff --check` 通過；私有文章與筆記雜湊相符。未重跑章級、切換或缺檔情境；未推送。
