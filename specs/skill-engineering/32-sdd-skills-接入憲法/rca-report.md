# 根因報告：sdd-skills－接入憲法

- 紀錄目錄：`specs/skill-engineering/32-sdd-skills-接入憲法/`
- 問題證據：本次對話上下文（使用者要求執行交接文件 8.4）；`docs/handoff/sdd-skill-憲法接入設計.md`（使用者以「都照建議」同意的方向）；課程第三章第 18 單元逐字稿 26:03–28:39、32:00–35:35（`wsa-course` MCP）；9 個 SDD Skill 的 `SKILL.md`；`.agents/constitution/` 下的 3 份憲法檔；`constitution` 的使用者實際驗證紀錄（`specs/skill-engineering/31-constitution-建立/blueprint.md`「使用者實際驗證（2026-11-03）」）與 S1 驗收紀錄；`docs/待確認.md` 第 15 項。

## 1. 使用者回報的問題

`constitution` Skill 已能把規則寫進 `.agents/constitution/`，但 9 個 SDD Skill（`s-specify`、`clarify-over-specs`、`technical-research`、`system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`tasks`、`implement`）產出時不讀取這些憲法，所以憲法無法約束產出物。使用者要求每個 Skill 在適當時機載入憲法，並以憲法規則作為最高優先權，覆蓋 Skill 自己對產出物的規範；但憲法不得改變流程與下游追溯結構（鎖定項目）。另外，`constitution` Phase 1 步驟 1 列出既有憲法檔時，兩次執行都用了會截斷輸出的 `ls -R … | head` 寫法，其中一次因此誤把既有檔案當成不存在而覆寫。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 9 個 SDD Skill 在 Phase 1 讀取 `.agents/constitution/shared.md` 與落點表中自己產出物的憲法檔（`clarify-over-specs` 讀 `skills/s-specify/spec.md`；`system-analysis` 只讀 `skills/system-analysis/plan.md`，不代替 Planner 讀取，委派內容也不轉述憲法），檔案不存在時略過；Planner 由 `system-analysis` 委派時也自行讀取 | 本次 | 通用 | S1、S5、S6 |
| E2 | 產出物符合已載入憲法的每條「必須」與「不得」規則；憲法和 Skill 內建規則、樣板或範例不同時，依憲法 | 本次 | 通用 | S1、S4、S5、S6 |
| E3 | 憲法規則和 Skill 的鎖定項目衝突時，鎖定項目不變、Skill 的檢查腳本仍通過；回報列出未套用的規則與衝突的鎖定項目 | 本次 | 通用 | S4 |
| E4 | 產出物違反「必須」或「不得」且可以修正時，修正後才完成；無法修正時（和 spec、上游產出或使用者需求衝突），會提問的 Skill 委派 `clarify` 詢問使用者，`implement` 不提問，把該任務記為受阻任務並寫進完成報告 | 本次 | 通用 | S2、S5 |
| E5 | 產出物偏離「應」規則時，可以完成，並在回報寫出偏離的規則與理由 | 本次 | 通用 | S5 |
| E6 | 完成回報有「憲法遵循」：已載入的憲法檔路徑（都不存在時寫「沒有憲法檔」）、「必須／不得」是否全部通過、「應」的偏離與理由、因鎖定項目而未套用的規則 | 本次 | 通用 | S1–S6 |
| E7 | 專案沒有任何憲法檔時，產出與接入前的規則相同：說明文字使用繁體中文，各 Skill 的檢查腳本通過 | 本次 | 通用 | S3 |
| E8 | 憲法規定說明文字的語言時，依憲法；沒有規定時使用繁體中文 | 本次 | 通用 | S4 |
| E9 | `technical-research` 不再讀取「專案中名為 `constitution.md` 的檔案」，改依 E1 讀取 `.agents/constitution/`；仍讀取使用者指定的專案原則文件 | 推定：舊步驟沿用 Spec-Kit 的單一 `constitution.md`，本專案已改為模組化憲法、沒有這個檔名；保留舊步驟會讓同一個約束有兩個來源 | 通用 | S1 |
| E10 | `clarify-over-specs` 和其他 Skill 一樣適用 E1–E6，讀取 `skills/s-specify/spec.md` 與 `shared.md`，寫回前後依 E2、E4 處理；不另外把憲法併入 10 類缺口掃描 | 推定：`docs/待確認.md` 第 15 項要求決定是否載入憲法；課程 27:37 確認 `clarify` 只負責互動提問，憲法相關的提問面向由上游 Skill 依 E4 帶入；另設掃描機制會在同一個 Skill 有兩套憲法處理方式 | 通用 | S6 |
| E11 | `constitution` Phase 1 步驟 1 以 `find .agents/constitution -type f` 列出全部既有憲法檔，再讀取每個檔案 | 本次 | 通用 | S7 |
| E12 | 各 Skill 既有的核心預期不變：產出路徑、樣板結構、確認閘門（覆寫詢問、clarify 委派）、檢查腳本與回報內容 | 既有 | 通用 | S1、S3（回歸） |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1、E2、E6 | 9 個 Skill 讀取並遵循 `.agents/constitution/`，回報憲法遵循 | 8 個 Skill 的 SOP、RuleFile、樣板都沒有提到憲法；`technical-research` 只提到 `constitution.md` | 觀察：`grep -rln "constitution\|憲法"` 在 9 個 Skill 目錄只找到 `technical-research/SKILL.md` P1-4 與 `templates/research.example.md`（範例內文，非步驟） |
| E3 | 每個 Skill 列出不可覆寫的鎖定項目 | 沒有任何 Skill 列出 | 觀察：同上 grep；`constitution` 的 `rules/鎖定項目-格式規範.md` Rule 1 第 2 條已預期「目標 Skill 憲法載入步驟列出的不可覆寫項目」，但目前沒有這種步驟 |
| E4、E5 | 違反時修正、委派 clarify 或記受阻；「應」偏離寫理由 | 沒有對應的 `CHECK` | 觀察：9 個 Skill 的 `CHECK` 步驟只驗證自己的 RuleFile、樣板與腳本（例如 `api-plan` P3-4、`data-plan` P3-4、`tasks` P3-4） |
| E7、E8 | 繁中為預設，憲法可覆寫 | 繁中寫死在 `WRITE` 步驟 | 觀察：`s-specify` P3-3、`technical-research` P2-5、`system-analysis` P3-3、`api-plan` P3-2、`data-plan` P3-2、`ui-plan` P3-4、`tasks` P3-2 都寫「內文使用繁體中文」或同義要求 |
| E9 | 讀 `.agents/constitution/` | 讀 `constitution.md` | 觀察：`technical-research` P1-4；`find .agents/constitution -name constitution.md` 沒有結果 |
| E10 | 寫回 spec.md 時遵循 s-specify 的憲法檔 | 沒有讀取憲法 | 觀察：`clarify-over-specs` P1-4～P2-6 只讀「目標 spec」、自己的 RuleFile 與 `s-specify` 的 RuleFile、樣板；`docs/待確認.md` 第 15 項 |
| E11 | 以 `find … -type f` 列出 | 步驟只寫「讀取所有既有憲法檔」，執行者自選指令 | 觀察：`constitution` P1-1；31 號藍圖 S1 紀錄「子代理以 `find \| head` 列檔，輸出被截斷，把既有檔案當成不存在而整檔覆寫」；使用者實際驗證的對話紀錄第 2 個工具呼叫為 `ls -R .agents/constitution .agents/skills .claude/skills 2>&1 \| head -80` |

## 4. 演練表

以課程 32:00 的原始輸入演練：在 `002-room-game-chat`（只有 `spec.md`）做 `technical-research` → `system-analysis`，`.agents/constitution/` 有 `shared.md`、`skills/api-plan/openapi.md`（分頁 5 條）、`skills/data-plan/data-model.md`（生命週期欄位、軟刪除）。以 `api-plan` 為代表演練；`data-plan`、`ui-plan` 的 Phase 結構相同。

`api-plan`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1 | 無 | 無 | 規劃輸入 | 觀察：SOP 讀取委派內容與 spec 清單 | 一致 |
| P1-2 | 無 | 無 | 目標 spec | 觀察：委派內容指定 | 一致 |
| P1-3 | 無 | 無 | 存在檢查 | 觀察：spec 存在 | 一致 |
| P1-4 | 目標 spec、plan.md、技術研究、既有產出，以及 `shared.md` 與 `skills/api-plan/openapi.md` | 觀察：SOP 只列 spec、`plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` | 含憲法規則的規劃輸入 | 推論：規劃輸入沒有憲法（依據 P1-4 的步驟內文） | 偏離 |
| P1-5～P1-10 | 無 | 無 | 負責介面、目標合約檔、覆寫確認 | 觀察：與憲法無關 | 一致 |
| P2-1 | API 合約檢查清單 | 觀察：讀 `rules/API合約-格式規範.md` | 檢查清單 | 觀察：沒有分頁規則（Rule 標題無分頁） | 一致 |
| P2-2 | 檢查清單與憲法 | 只有檢查清單 | 含 `page`／`pageSize` 與分頁回應的 API 設計 | 推論：沒有任何部位要求分頁（依據 P1-4、P2-1） | 無證據 |
| P3-1～P3-3 | 樣板組、檢查腳本 | 觀察：已列出 | 合約檔與檢查結果 | 推論：腳本只檢查 tag、介面涵蓋與需求編號，不檢查分頁 | 一致 |
| P3-4 | 憲法逐條核對 | 觀察：只驗證 RuleFile、樣板與腳本結果 | 違反憲法時修正 | 推論：沒有憲法核對 | 偏離 |
| P3-5 | 無 | 無 | 回報含憲法遵循 | 觀察：回報只列路徑、operation 數、無法規劃介面、未通過項 | 偏離 |

`technical-research`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 目標 spec | 觀察：與憲法無關 | 一致 |
| P1-4 | 目標 spec、`shared.md`、`skills/technical-research/research.md`、`techstack.md` 憲法檔 | 觀察：SOP 讀「名為 `constitution.md` 的檔案」 | 含憲法的研究輸入 | 推論：專案沒有 `constitution.md`，憲法被視為空（依據 find 的觀察） | 偏離 |

`constitution`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1 | 全部既有憲法檔 | 觀察：S1 子代理以 `find \| head` 列檔被截斷；使用者驗證時以 `ls -R … \| head -80` 列檔 | 完整的憲法輸入 | 觀察：S1 把既有 `data-model.md` 當成不存在而覆寫，之後自行還原；使用者驗證時之後逐一 `cat`，沒有誤判 | 偏離（S1） |

第一個偏離點：`api-plan` P1-4（其餘 7 個 Skill 對應的輸入 `READ` 步驟相同，`technical-research` 為 P1-4）；`constitution` 為 P1-1。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `s-specify`、`clarify-over-specs`、`system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`tasks`、`implement`／`SKILL.md` 的輸入 `READ`、產出 `WRITE`、驗證 `CHECK` 與回報 `WRITE` | 缺失 | 觀察：這 8 個 Skill 的任何部位都沒有提到憲法、優先順序、鎖定項目或憲法遵循回報（第 3 節 grep）；繁中寫死在 `WRITE`（第 3 節 E7、E8 列）。推論：憲法對產出沒有任何進入點（依據上述觀察） | 假設各 Skill 有載入步驟、優先順序、核對步驟與回報欄位：P1-4 讀到分頁規則，P2-2 依憲法設計 `page`／`pageSize`，P3-4 核對 5 條規則，P3-5 回報遵循；E1–E8、E10 可滿足，E12 不受影響 |
| R2 | `technical-research`／`SKILL.md`／Phase 1 步驟 4 | 未載入 | 觀察：步驟要求讀取「名為 `constitution.md` 的檔案」，`.agents/constitution/` 沒有這個檔名；其餘步驟也沒有憲法核對與回報。推論：憲法存在但沒有被載入（依據兩項觀察） | 假設 P1-4 改讀 `.agents/constitution/` 並加上 R1 的核對與回報：研究輸入含憲法，E1、E2、E6、E9 可滿足 |
| R3 | `constitution`／`SKILL.md`／Phase 1 步驟 1 | 載體過弱 | 觀察：步驟只寫「讀取 `.agents/constitution/` 下所有既有憲法檔」，沒有指定列檔指令；兩次執行都選了會截斷的 `head`，一次因此覆寫既有檔案。推論：可由指定指令保證的要求交給 AI 自選，結果不穩定（依據兩次執行的觀察） | 假設步驟指定 `find .agents/constitution -type f` 不截斷：S1 會列出 `data-model.md` 並附加 Rule，E11 可滿足，31 號藍圖的 E1–E14 不受影響 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| R1 改判「未載入」：憲法規則已寫在某個部位，只是載入太晚 | 未載入 | 觀察：8 個 Skill 的 SOP、RuleFile、樣板都沒有憲法的字樣（grep），沒有可以「晚載入」的部位 |
| 由 `system-analysis` 在委派內容轉述憲法，Planner 就會遵循 | 交接缺陷 | 觀察：使用者單獨執行 `api-plan` 時沒有 `system-analysis`（`api-plan` description「也可以單獨使用」）；設計文件第 1 節決定 Planner 各自載入。推論：交接無法涵蓋單獨使用的情況 |
| 由 `constitution` Skill 寫入時順便修改各 Skill | 流程缺陷 | 觀察：31 號藍圖 E11「不修改任何 Skill」；課程 23:56 後老師另以 `skill-engineering` 修改各 Skill |
| 落差來自模型能力，提示詞要求遵循憲法即可 | 非 Skill 問題 | 觀察：課程 32:00 的結果靠 Skill 步驟載入憲法（老師在 Phase 1 看到新增的讀取憲法步驟）；目前 SOP 沒有任何步驟提供憲法，模型無從得知檔案位置 |
| R3 改判「非 Skill 問題」：只是子代理執行習慣 | 非 Skill 問題 | 觀察：兩個不同 session（S1 子代理、使用者驗證的 Sonnet session）都出現截斷寫法。推論：步驟沒有指定指令時這個寫法會重複出現 |

## 7. 影響範圍

- R1：`system-analysis` 委派 `ui-plan`、`api-plan`、`data-plan`；其他 Skill 沒有被任何 Skill 委派（`audit_skill.py --graph`）。`tasks`、`implement` 依序讀取上游產出，不透過委派。
- R2：沒有其他 Skill 委派 `technical-research`。
- R3：沒有其他 Skill 委派 `constitution`。
- `clarify` 被 `s-specify`、`clarify-over-specs`、`technical-research`、`system-analysis`、`ui-plan`、`constitution` 委派；本次不修改 `clarify`。

## 8. 待確認事項

1. 驗收條件 E1–E12 是否正確、完整？
2. 是否同意 R1、R2、R3？
3. 兩條推定的驗收條件需要你逐條確認：E9、E10。
4. S2 的衝突案例改在測試複本的 spec.md 加一條「玩家離開房間後必須永久刪除其猜測紀錄」來製造。

## 9. 確認紀錄（2026-11-03）

- 使用者回覆「照建議」，確認：
  - E1–E12 與 R1–R3。
  - E9 同意。
  - E10 改為精簡版：`clarify-over-specs` 和其他 Skill 一樣適用 E1–E6，不另外把憲法併入 10 類缺口掃描；`docs/待確認.md` 第 15 項的結論記為「載入 `skills/s-specify/spec.md`，依共同機制處理」。
  - S2 以測試複本加一條永久刪除猜測紀錄的需求製造衝突；交接文件第 5 節第 4 點的描述有誤（001 的 spec 沒有刪除資料的需求），單元完成後修正。
  - S1 的 DBML 以 4 個生命週期欄位都存在為通過標準（比課程 35:00 只有 `created_at` 嚴格，依 `data-model.md` Rule 1 的「必須」）。
