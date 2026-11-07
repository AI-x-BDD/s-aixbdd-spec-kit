# 工程藍圖：constitution－實跑回報沒有分開檢查紀錄

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/36-constitution-實跑回報沒有分開檢查紀錄/`
- 根因報告：`rca-report.md`（R1 未載入，2026-11-07 使用者確認；缺陷類型由「載體過弱」修正為「未載入」，已於藍圖確認時確認）
- 確認紀錄：見第 9 節

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 有寫入憲法檔時，給使用者的回報中，一致性檢查分成「檢查紀錄」與「衝突清單」兩段：檢查紀錄逐筆列出已檢查的 Skill 部位與產出物路徑、對應的憲法檔與 Rule 編號、判定；衝突清單逐筆列出位置、憲法檔與 Rule 編號、說明與處理 Skill | 本次 | 通用 |
| E2 | 紀錄 35 的 E2–E13 維持成立 | 既有 | 通用 |

## 2. To-Be SOP

只有 Phase 4 步驟 1 改變，其餘與紀錄 35 的 To-Be（即目前的 `SKILL.md`）逐字相同。

````markdown
## Phase 4 -- 回報

1. `WRITE` 向使用者回報：每個建立或修改的憲法檔路徑、新增或修改的 Rule 標題、每條規則的落點理由、「拒絕清單」的每項原因與建議的做法，以及依「一致性檢查清單」Rule 3 分成「檢查紀錄」與「衝突清單」兩段的「一致性檢查結果」；沒有寫入任何憲法檔時，一致性檢查寫「未寫入，未執行一致性檢查」；有寫入時，提醒使用者以 `git diff` 檢視規則是否符合本意。

完成條件：已向使用者回報寫入結果、拒絕清單與一致性檢查結果。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | R1 是「未載入」，只修正套用位置，不刪除內容 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| Phase 4 步驟 1 | 修改 | 「以及『一致性檢查結果』」改為「以及依『一致性檢查清單』Rule 3 分成『檢查紀錄』與『衝突清單』兩段的『一致性檢查結果』」 | R1；E1；C28 |

修改理由（重新設計 Rule 3、Rule 4）：

- R1 是「未載入」，修改方向是修正載入步驟的位置或適用條件，不新增內容。
- 刪除無法處理：格式本身沒有錯，紀錄 35 的 S1–S7 都依它產出分段結果。
- 改寫 Rule 3 無法處理：問題不在規則內容，而在產出回報的步驟沒有套用它。
- 改換存放位置不適用：回報不是檔案，不能改用樣板；把格式搬到步驟內文會讓 Rule 3 與步驟重複存放（約束分配 Rule 1）。
- 所以只在 Phase 4 步驟 1 引用「一致性檢查清單」Rule 3 的載入結果，不重述欄位內容。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter、Phase 1–3 全部步驟與完成條件、Phase 4 完成條件 | E2（紀錄 35 的追溯不變） | 紀錄 35 第 5 節 C1–C27、C29 |
| 4 個 RuleFile 與樣板組 | E2 | 紀錄 35 第 5 節 C2–C5、C8、C13–C18、C21a–C25 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 4 | 4 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 4 | 4 | 0 |
| Rule | 13 | 13 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- 內容增減：Phase 4 步驟 1 的一個片語改寫（R1）；`rules/一致性檢查-格式規範.md` Rule 3 的條列改寫為固定欄位的表格要求並更新正反例（R2）；Phase 4 步驟 1 補一句限制、完成條件補一個可檢查的結果（R3）；沒有新增或刪除元素。

## 5. 約束分配表

沿用紀錄 35 第 5 節 C1–C29（含 C21a、C21b），只有 C28 修改：

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C28 | 回報內容；一致性檢查結果依「一致性檢查清單」Rule 3 的兩段格式回報（只引用載入結果，欄位內容仍由 C24 存放在 Rule 3）；沒寫入時寫「未寫入，未執行一致性檢查」；有寫入時提醒 `git diff` | P4-1 | 步驟內文 | 只屬於單一步驟；回報是對話輸出；兩段格式的欄位由 C24 的 RuleFile 存放，步驟只引用 |
| C30 | 回報時與回報後都不得建立、修改或刪除 `.agents/constitution/` 以外的檔案，包括「衝突清單」列出的檔案；修正交給處理 Skill | P4-1 | 步驟內文 | R3（缺失）：只屬於回報步驟，一句話可表達，不需正反例；放在每次都會執行的 Phase 4 步驟 1。與 C19（P2-6 寫入範圍）、C27（Phase 3 不改檔）約束的時機不同 |
| C24 | 結果分成檢查紀錄與衝突清單兩個表格；檢查紀錄欄位「路徑與部位｜憲法檔與 Rule 編號｜判定」，目標 Skill 的 `SKILL.md`、`rules/`、`templates/` 各佔一列（缺少的列為無法檢查）；衝突清單欄位「位置｜憲法檔與 Rule 編號｜說明｜處理 Skill」；處理 Skill 對應 | P3-5（P4-1 引用載入結果） | `rules/一致性檢查-格式規範.md` Rule 3 | R2（不可檢查）：改寫為可逐列檢查的固定欄位；需判斷部位與判定，仍為 RuleFile；回報是對話輸出，不選樣板 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `SKILL.md` Phase 4「回報」的 `WRITE` 步驟 | 改寫一個片語 | C28 | 已完成 |
| 2 | W2 | `skill-form-rule` | `rules/一致性檢查-格式規範.md` Rule 3 | 改為兩個欄位固定的表格 | C24 | 已完成 |
| 3 | W3 | `skill-form-sop` | `SKILL.md` Phase 4「回報」的 `WRITE` 步驟與完成條件 | 補上不修改憲法檔以外檔案的限制 | C30 | 已完成 |

### 工作項內容

#### W1 — `skill-form-sop`

- 目標：`.agents/skills/constitution/SKILL.md` Phase 4「回報」中以 `WRITE` 向使用者回報的步驟。
- Before：「…「拒絕清單」的每項原因與建議的做法，以及「一致性檢查結果」；沒有寫入任何憲法檔時…」
- After：「…「拒絕清單」的每項原因與建議的做法，以及依「一致性檢查清單」Rule 3 分成「檢查紀錄」與「衝突清單」兩段的「一致性檢查結果」；沒有寫入任何憲法檔時…」
- 其他文字不變。

#### W3 — `skill-form-sop`（R3，2026-11-07 使用者確認）

- 目標：`.agents/skills/constitution/SKILL.md` Phase 4「回報」中以 `WRITE` 向使用者回報的步驟與 Phase 4 完成條件。
- 步驟：在「有寫入時，提醒使用者以 `git diff` 檢視規則是否符合本意。」之後加上「回報時與回報後都不建立、修改或刪除 `.agents/constitution/` 以外的檔案，包括「衝突清單」列出的檔案，修正交給各衝突的處理 Skill。」
- 完成條件：「已向使用者回報寫入結果、拒絕清單與一致性檢查結果。」改為「已向使用者回報寫入結果、拒絕清單與一致性檢查結果，且 `.agents/constitution/` 以外沒有檔案被建立、修改或刪除。」
- 其他文字不變。

#### W2 — `skill-form-rule`（R2，2026-11-07 使用者確認）

- 目標：`.agents/skills/constitution/rules/一致性檢查-格式規範.md` Rule 3。
- 標題改為「結果必須分成檢查紀錄與衝突清單兩個表格，並標出處理 Skill」。
- 條列改為：
  - 一致性檢查結果必須分成「檢查紀錄」與「衝突清單」兩個 Markdown 表格。
  - 檢查紀錄的欄位必須是「路徑與部位｜憲法檔與 Rule 編號｜判定」，每個已檢查的 Skill 部位與產出物各佔一列。
  - 目標 Skill 的 `SKILL.md`、`rules/`、`templates/` 必須各佔至少一列；目標 Skill 缺少的部位也必須列出，判定為「無法檢查」。
  - 判定只能是「符合」、「例外成立」、「衝突」、「無法檢查」；「無法檢查」必須在同一格寫出原因。
  - 檢查紀錄不得填處理 Skill。
  - 衝突清單的欄位必須是「位置｜憲法檔與 Rule 編號｜說明｜處理 Skill」；沒有衝突時，表格下方寫「無」。
  - 位置必須包含檔案路徑與部位：Rule 編號、樣板區段、Phase 與步驟，或產出物的段落（原條列，不變）。
  - 處理 Skill 的對應表（原表，不變）。
- Good／Bad Example 改用表格示範；情境沿用現有的資料模型 Enum 情境，不得使用驗收情境的主題（API 錯誤回應的 `message`、`console.log`）。其他 Rule 不變。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2 | 本次原始問題 | 使用者實際驗證的同一份測試素材（001、002 spec，`.agents/constitution/`、`.agents/skills/api-plan/`；`.claude/skills/` 只有 `constitution`、`clarify`）；需求「幫專案訂一條 API 規範：所有錯誤回應除了錯誤碼 code，還必須附一段給人看的 message 說明。」；子代理只取得專案路徑與需求，不被告知 Skill 名稱或要逐步照 SOP，自行找到並觸發 Skill | clarify 提問時回答「沒有其他要求，照描述寫」 | 回報的一致性檢查有「檢查紀錄」與「衝突清單」兩段；檢查紀錄逐筆列出 `api-plan` 的 Skill 部位與兩份 `openapi.yaml`，每筆有憲法檔與 Rule 編號及判定；衝突清單列出兩份 `openapi.yaml` 的 `Error`，處理 Skill 為 `api-plan`；快照差異只在 `.agents/constitution/` |
| S2 | E1、E2 | 回歸 | 紀錄 35 的 S3 測試環境（`implement` 不得使用 `console.log`）；子代理同 S1 的方式 | 同 S1 | 回報有兩段；`app/main.ts` 列在衝突清單（`implement`）；spec 007 在檢查紀錄判定「無法檢查」，原因「指定路徑不存在」 |
| S3 | E2 | 回歸 | 紀錄 35 的 S5 測試環境與輸入 | 無 | 兩項列入拒絕清單，沒有寫入；回報寫「未寫入，未執行一致性檢查」 |

所有情境都在暫存專案複本執行，執行前後以 `find . -type f -not -path './.git/*' -print0 | sort -z | xargs -0 shasum` 快照比對。

## 8. 驗收結果

### 第 1 輪（W1 後，2026-11-07）

- 施工後結構診斷：errors 0、warnings 0；同步「兩邊一致」。
- 驗收方式：S1、S2 以 Herdr 開全新的 Claude Code（`claude --model sonnet --effort medium`），只送自然語言需求，由 session 自行觸發 `constitution`；S3 以 `skill-tester` 子代理（Sonnet、medium）。信任資料夾由主 session 選擇（驗收用暫存專案）；S2 第一次啟動時 `down` 按鍵沒有生效，選到「No, exit」而結束，同一 pane 重新啟動後沒有再出現信任提示。
- S1：不通過（E1）。回報有兩段，但檢查紀錄每筆沒有憲法檔與 Rule 編號，`api-plan` 的 `SKILL.md` 沒有列出。→ 補充根因 R2，新增 W2。
- S2：通過。檢查紀錄寫出 `code.md` Rule 1、`implement` 的 `SKILL.md`、`rules/`、`templates/`（無法檢查：找不到路徑）、`app/main.ts`（衝突）、`server/sync.ts`（無法檢查：指定路徑不存在）；衝突清單 `app/main.ts`（`implement`）。
- S3：通過。兩項列入拒絕清單；回報「未寫入，未執行一致性檢查」。
- 副作用：三個情境的快照差異都只在 `.agents/constitution/`。

### 第 2 輪（W2 後，2026-11-07）

- 施工後結構診斷：errors 0、warnings 0；同步「兩邊一致」。
- 驗收方式同第 1 輪（S1、S2 以 Herdr 開全新的 `claude --model sonnet --effort medium`，自行觸發 `constitution`）；暫存專案以本次修改重建。S3 不受 W2 影響（沒有寫入時不產生一致性檢查結果），沿用第 1 輪的通過結果。
- S1：兩段都改為表格，檢查紀錄每列都有「憲法檔與 Rule 編號」（`skills/api-plan/openapi.md` Rule 6）與判定，衝突清單列出兩份 `openapi.yaml` 的 `Error`（`api-plan`）。仍缺 `api-plan` 的 `SKILL.md`、`rules/` 兩列；測試 session 回報「沒有逐一核對 `SKILL.md` 各步驟，所以沒有完整的檢查紀錄表格」，屬於跳過 Phase 3 讀取步驟（`docs/待確認.md` 第 27 項第 1、4 點）。
- S2：**不通過（E10）**。回報的表格格式符合（`implement` 的 `SKILL.md`、`rules/`、`templates/`、`app/main.ts`、spec 007 各一列，衝突清單 `app/main.ts` 第 2 行／`implement`），但測試 session 寫入憲法檔後，以 Edit 刪除了 `app/main.ts` 的 `console.log("add", t);`，回報沒有提到這次修改。對話紀錄：`~/.claude/projects/*accept36-S2/eab1321b-*.jsonl` 以外的最新一份（第 2 輪）。
- 副作用：S1 的快照差異只在 `.agents/constitution/`；S2 另有 `app/main.ts` 被修改。主 session 在使用者判定前只依回報判斷，快照比對晚於判定，回報 S2 通過是錯誤的，已向使用者更正。
- 判定：使用者先依錯誤的回報判定第 2 輪通過（2026-11-07）；更正後待使用者重新判定。S1 剩餘落差已記入 `docs/待確認.md` 第 27 項第 4 點。
- 個案驗收條件的調整建議：無。

### 第 3 輪（W3 後，2026-11-07）

- 施工後結構診斷：errors 0、warnings 0；同步「兩邊一致」。
- 驗收方式同第 1 輪（S1、S2 以 Herdr 開全新的 `claude --model sonnet --effort medium`，自行觸發 `constitution`；S3 以 `skill-tester` 子代理，Sonnet、medium）；暫存專案以本次修改重建。這一輪先比對快照，再判斷結果。
- S1：通過。兩個表格；檢查紀錄列出 `api-plan` 的 `SKILL.md`（Phase 2 步驟 2、4）、`rules/API合約-格式規範.md`、`templates/` 與兩份 `openapi.yaml`，每列都有 `openapi.md` Rule 6 與判定；衝突清單列出兩份 `openapi.yaml` 的 `components.schemas.Error`（`api-plan`）。快照差異只有 `.agents/constitution/skills/api-plan/openapi.md`。
- S2：通過。檢查紀錄列出 `implement` 的 `SKILL.md`、`rules/`、`templates/`（無法檢查：找不到路徑）、`app/main.ts`（衝突）、`server/sync.ts`（無法檢查：指定路徑不存在）；衝突清單 `app/main.ts` 第 2 行（`implement`）；回報寫明「我沒有修改衝突的檔案」。快照差異只有新建的 `.agents/constitution/skills/implement/code.md`，`app/main.ts` 沒有變動。
- S3：通過。兩項列入拒絕清單；回報「未寫入，未執行一致性檢查」；快照沒有差異。
- 結論：S1–S3 全部通過，交回 `user-verify-skill` 以相同的實跑需求與測試素材重跑實際驗證。

### 使用者實際驗證（2026-11-07）

- 方式：`user-verify-skill`。實跑需求「幫專案訂一條 API 規範：所有錯誤回應除了錯誤碼 code，還必須附一段給人看的 message 說明。」以自然語言送出，`constitution` 由測試 session 自行觸發。測試素材：`specs/001-online-pvp-1a2b/`、`specs/002-room-game-chat/`、`.agents/constitution/`、`.agents/skills/api-plan/`；暫存專案的 `.claude/skills/` 只有 `constitution`、`clarify`。測試模型：`sonnet`、推理強度 `medium`，以 Herdr 開新 pane 啟動全新的 Claude Code。
- 權限處理：第 1 輪的信任資料夾由使用者選擇 Yes；第 2 輪同一路徑沒有再出現信任提示。兩輪都沒有提問或確認閘門；唯讀命令由測試 session 的 auto mode 自動放行，主 session 沒有代按權限確認。
- 結果：
  - 第 1 輪（紀錄 35 的版本）：不通過。回報的一致性檢查沒有分開「檢查紀錄」與「衝突清單」，沒有逐筆列出 Skill 部位與 Rule 編號。交由 `skill-engineering` 優化（本紀錄 R1、R2、R3 與 W1–W3，驗收 3 輪）。
  - 第 2 輪（本紀錄施工後）：通過。回報為兩個表格；檢查紀錄列出 `api-plan` 的 `SKILL.md`（Phase 2 步驟 2）、`rules/API合約-格式規範.md`、`templates/` 與兩份 `openapi.yaml`，每列都有 `skills/api-plan/openapi.md` Rule 6 與判定；衝突清單列出兩份 `components.schemas.Error`（`api-plan`）；`git status` 只有 `.agents/constitution/skills/api-plan/openapi.md`，回報寫明沒有修改憲法檔以外的檔案。
- 觀察：
  1. 兩個表格前沒有「檢查紀錄」「衝突清單」的段落標題，但欄位可以區分。
  2. 仍在寫入前以 `find .agents/skills/api-plan specs -type f` 一次讀取，沒有執行 Phase 3 的 `find specs -mindepth 1 -maxdepth 1 -type d`（`docs/待確認.md` 第 27 項第 1 點），結果沒有遺漏。
  3. E7（排除受保護目錄）無法親自證實：測試素材沒有這兩個目錄。
  4. 第 1 輪多寫的「兩者必須與 `code` 在同一個 object 內」這次沒有出現，回報寫明規則沒有規定包裝結構。
- 結論：使用者判定第 2 輪通過；已移除 `constitution` 的 `description` 開頭的「（未驗證）」，其餘文字不變；`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」。

## 9. 確認紀錄

- 2026-11-07：使用者確認本藍圖，並確認 R1 的缺陷類型由「載體過弱」修正為「未載入」。沒有推定的驗收條件。
- 2026-11-07：第 1 輪驗收 S1 不通過後，使用者確認補充根因 R2 與工作項 W2。
- 2026-11-07：第 2 輪驗收 S2 修改了 `app/main.ts`，主 session 更正回報後，使用者判定不通過，確認補充根因 R3 與工作項 W3。
