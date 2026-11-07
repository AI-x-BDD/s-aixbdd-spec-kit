# 根因報告：constitution－規則更新後未檢查一致性

- 紀錄目錄：`specs/skill-engineering/35-constitution-規則更新後未檢查一致性/`
- 問題證據：使用者本次需求（2026-11-07 對話）；`.agents/skills/constitution/SKILL.md` Phase 1–3；`.agents/skills/constitution/rules/憲法落點-格式規範.md` Rule 1 落點表；`.agents/skills/constitution/rules/憲法規則-格式規範.md` Rule 3、Rule 4；`.agents/skills/analyze/rules/分析問題-格式規範.md` Rule 3、Rule 5；`.agents/skills/analyze/SKILL.md` `description`；課程第三章第 18 單元約 14:20；本次對話以 `audit_skill.py --graph` 取得的結構診斷

## 1. 使用者回報的問題

`constitution` 寫入或修改規則後，不檢查相關 Skill 與既有產出物是否仍然符合新規則。規則更新後，Skill 的 rules、樣板，以及 `specs/` 裡的既有產出物可能和新規則衝突，但使用者不會知道。課程第三章第 18 單元約 14:20 指出，Spec-Kit 憲法的第 4 個機制是「更新憲法時，同步檢查樣板與 Skill 是否仍然一致」。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 有寫入憲法檔時，回報包含「一致性檢查」結果：每條寫入或修改的 Rule 都列出實際檢查的 Skill 部位路徑與產出物路徑（不限 `specs/`），每筆結果對應憲法檔與 Rule 編號 | 本次 | 通用 | S1、S2、S3 |
| E2 | 既有產出物違反新規則時，列出檔案路徑與部位；符合新規則的產出物，以及 Rule 明定的例外成立的產出物，不列為衝突 | 本次 | 通用 | S1、S2 |
| E3 | 目標 Skill 的 `rules/` 或 `templates/` 和新規則衝突時，列出衝突的檔案與部位（Rule 編號或樣板區段） | 本次 | 通用 | S1 |
| E4 | 目標 Skill 的 `SKILL.md` 有步驟直接規定產出物內容，且和新規則衝突時，列出 Phase 與步驟 | 推定 | 通用 | S1 |
| E5 | 每個衝突都標出處理 Skill：產出物衝突填產出該產出物的 Skill（`spec.md` 填 `s-specify` 或 `clarify-over-specs`；`research.md`、`techstack.md` 填 `technical-research`；`plan.md` 填 `system-analysis`；`contracts/` 填 `api-plan`；`data/` 填 `data-plan`；`ui/` 填 `ui-plan`；`tasks.md` 填 `tasks`；程式碼填 `implement`）；Skill 部位衝突填 `skill-engineering` | 本次 | 通用 | S1、S2、S3 |
| E6 | 寫入 `shared.md` 的 Rule，檢查範圍是落點表列出的所有 Skill 與其產出物，並依該 Rule 的適用條件判定 | 推定 | 通用 | S2 |
| E7 | 一致性檢查與 Good／Bad Example 取材都不讀取 `specs/001-photo-album-organizer/` 與 `specs/skill-engineering/` | 本次 | 通用 | S2 |
| E8 | 程式碼產出物依 spec 目錄的 `plan.md` 專案結構與 `tasks.md` 的檔案路徑定位；路徑不存在時列為「無法檢查」並寫「指定路徑不存在」，不自行判斷為尚未實作 | 推定 | 通用 | S3 |
| E9 | 無法檢查的項目列為「無法檢查」並寫出原因（沒有任何 spec 目錄有該產出物、找不到路徑、讀取失敗、目標 Skill 不存在），不列為通過；目標 Skill 缺少某個部位時，其他部位仍要檢查 | 本次 | 通用 | S3、S4 |
| E10 | 一致性檢查只讀取、不修改；整次執行只在 `.agents/constitution/` 下建立或修改檔案（比對執行前後的檔案狀態） | 本次 | 通用 | S1–S7 |
| E11 | 「規則需求」為空、沒有寫入任何憲法檔時，不執行一致性檢查，回報寫「未寫入，未執行一致性檢查」，不寫成「檢查通過」 | 推定 | 通用 | S5 |
| E12 | 規則寫入落點表指定的憲法檔，每條 Rule 有 Good／Bad Example；流程類需求與鎖定項目衝突的需求列入拒絕清單 | 既有 | 通用 | S1、S5 |
| E13 | 寫成規則所需的細節缺少時先委派 `clarify`，使用者未回覆時不寫入；規則只包含使用者的要求與澄清結果；同一面向已有 Rule 時修改該 Rule，其他 Rule 的原文不變 | 既有 | 通用 | S1、S6、S7 |

推定理由：

- E4：Phase 1 步驟 4 已把目標 Skill 的 `SKILL.md`、`rules/`、`templates/` 一起讀成「目標 Skill 現況」；`SKILL.md` 的步驟也可能直接規定產出物內容，只查 `rules/`、`templates/` 會漏掉。
- E6：使用者要求在藍圖決定 `shared.md` 的範圍；`shared.md` 適用全部產出物（落點 Rule 2），所以範圍取落點表全部列。
- E8：落點表包含 `implement` → 程式碼，但程式碼不在 `specs/`；`plan.md` 的專案結構與 `tasks.md` 的任務路徑是 SDD 產出物中記載程式位置的地方。路徑不存在可能是尚未實作，也可能是路徑過期或檔案搬移，所以只寫觀察得到的事實。
- E11：沒有新規則時沒有檢查對象；Phase 1 步驟 7 規定「規則需求」為空時直接進入 Phase 3。

驗收情境（都在暫存專案複本執行）：

| 編號 | 輸入 | 預先回覆 | 通過判斷 | 類型 |
| ---- | ---- | -------- | -------- | ---- |
| S1 | 為 `data-plan` 新增規則：「資料表主鍵欄位必須命名為 `id`；spec 明確要求使用自然鍵時可以例外」。測試環境：spec A 的 `data-model.dbml` 有主鍵 `room_code`（違反）；spec B 全部用 `id`（符合）；spec C 的 spec 明確要求自然鍵、資料模型使用自然鍵（例外成立）；三個 spec 都沒有 `tasks.md`；`data-plan` 的樣板範例改成主鍵 `pk_id`，`data-plan` 的某個 RuleFile 加一條「主鍵命名為 `<表名>_key`」的 Rule，SKILL.md 的某一步驟改成規定主鍵命名 `<表名>_id` | clarify 提問時回答「沒有其他要求，照描述寫」 | 寫入 `skills/data-plan/data-model.md`；一致性檢查列出 spec A 的位置與 `data-plan`，不列 spec B、spec C；列出樣板區段、RuleFile 的 Rule 編號與 SKILL.md 步驟，處理 Skill 為 `skill-engineering`；憲法目錄外沒有變動 | 本次原始問題 |
| S2 | 在 `shared.md` 新增規則：「文件說明文字不得使用 emoji」。測試環境：spec D 的 `ui/plan.md` 有 emoji、spec E 沒有；`specs/001-photo-album-organizer/` 與 `specs/skill-engineering/` 都放有 emoji 的檔案 | 同 S1 | 檢查範圍涵蓋落點表全部 Skill 與產出物；列出 spec D 的位置與 `ui-plan`；不列 spec E；兩個排除目錄沒有被讀取，也沒有出現在結果或範例中 | 本次 |
| S3 | 為 `implement` 新增規則：「程式碼不得使用 `console.log`」。測試環境：spec F 的 `plan.md` 專案結構列出 `app/`，`app/main.ts` 有 `console.log`；spec G 的 `plan.md` 列出的目錄不存在 | 同 S1 | 列出 `app/main.ts` 的位置與 `implement`；spec G 列為「無法檢查」，原因「指定路徑不存在」 | 本次 |
| S4 | 為 `ui-plan` 的 `ui/*.html` 新增規則：「按鈕文字不得超過 6 個字」。測試環境：所有 spec 都沒有 `ui/*.html`；`ui-plan` 沒有 `templates/` 中對應 HTML 的樣板 | 同 S1 | 產出物列為「無法檢查」，原因「沒有任何 spec 目錄有該產出物」；`ui-plan` 的 `SKILL.md`、`rules/` 仍有檢查結果 | 本次 |
| S5 | 兩個需求：「每次產出 spec.md 之後都要先跑一次 analyze」，以及「tasks.md 的任務 ID 改成 `TASK-001` 格式」 | 無 | 兩項都列入拒絕清單（流程類需求；和任務 ID 格式這個鎖定項目衝突，寫出依賴者），沒有寫入任何檔案；回報寫「未寫入，未執行一致性檢查」 | 回歸 |
| S6 | 測試環境：`skills/api-plan/openapi.md` 有 Rule 1「清單 `pageSize` 上限 100」與 Rule 2「分頁回應必須含 `total`」。輸入：「清單 `pageSize` 上限改成 50」 | clarify 提問時回答「其他不變」 | 修改 Rule 1，沒有新增 Rule；Rule 2 原文不變 | 回歸 |
| S7 | 「API 的時間欄位要統一格式」（沒有說是哪一種格式） | clarify 提問後不回覆 | 停止執行，沒有寫入任何檔案 | 回歸 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 回報包含一致性檢查結果 | 回報只列寫入的檔案、Rule 標題、落點理由與拒絕清單 | 觀察：`SKILL.md` Phase 3 步驟 1 |
| E2、E3、E4 | 寫入後檢查產出物與 Skill 部位 | 寫入後沒有任何檢查步驟；Phase 2 步驟 7 只驗證規則格式與落點，完成後直接進入 Phase 3 | 觀察：`SKILL.md` Phase 2 步驟 7 與完成條件；Phase 3 只有步驟 1 |
| E5 | 衝突標出處理 Skill | 沒有衝突清單，所以沒有處理 Skill | 推論：依上兩項觀察 |
| E6、E8、E9 | 範圍、程式碼定位與無法檢查的規定 | 沒有規定 | 觀察：`SKILL.md` 與 3 個 RuleFile 都沒有寫入後的檢查範圍、定位或回報方式 |
| E7 | 一致性檢查與範例取材排除受保護目錄 | 沒有掃描 `specs/` 的步驟；範例取材規則要求情境取自 `specs/`，沒有排除規定 | 觀察：`憲法規則-格式規範.md` Rule 4 第 1 條 |
| E10 | 只寫 `.agents/constitution/` | 靜態規範成立 | 觀察：`SKILL.md` Phase 2 步驟 6 |
| E11 | 沒寫入時不檢查，回報明示 | 靜態規範成立一半：不檢查成立（目前沒有檢查），回報沒有明示 | 觀察：`SKILL.md` Phase 1 步驟 7、Phase 3 步驟 1 |
| E12、E13 | 既有核心行為 | 靜態規範成立，並有實跑通過紀錄 | 觀察：`SKILL.md` Phase 1 步驟 2–6、Phase 2 步驟 1–7；`specs/skill-engineering/31-constitution-建立/blueprint.md` 第 274 行、`specs/skill-engineering/33-constitution-澄清答案強度被升級/blueprint.md` 第 168 行的使用者判定通過 |

## 4. 演練表

以下是依 SOP 文字的靜態演練：「實際載入」與「實際產出」欄是依步驟文字推論的結果，不是某次執行的紀錄。情境為「新增一條 `data-plan` 規則，某個 spec 的 `data-model.dbml` 已違反」。

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1 | 使用者需求、既有憲法檔 | 推論：步驟 1 要求讀取兩者 | 憲法輸入 | 憲法輸入 | 一致 |
| P1-2、P1-3 | 落點 RuleFile | 推論：步驟 2 要求讀取 | 規則需求與落點 | 同左 | 一致 |
| P1-4 | 目標 Skill 的 SKILL.md、rules、templates | 推論：步驟 4 要求讀取 | 目標 Skill 現況 | 同左，只交給步驟 6 的鎖定檢查使用 | 一致 |
| P1-5、P1-6 | 鎖定 RuleFile | 推論：步驟 5 要求讀取 | 拒絕清單 | 同左 | 一致 |
| P1-7 | 無 | 無 | 轉移到 Phase 2 | 同左 | 一致 |
| P2-1～P2-3 | clarify | 推論：步驟 2 要求委派 | 澄清結果 | 同左 | 一致 |
| P2-4～P2-7 | 規則 RuleFile、樣板組 | 推論：步驟 4、5 要求讀取 | 寫入的憲法檔，通過格式與落點檢查 | 同左 | 一致 |
| （P2-7 之後、P3-1 之前） | 新規則、目標 Skill 現況、受約束的既有產出物 | 無：沒有任何步驟要求載入既有產出物 | 一致性檢查結果（衝突位置與處理 Skill） | 無 | 偏離 |
| P3-1 | 寫入結果、一致性檢查結果 | 只有寫入結果 | 含一致性檢查的回報 | 不含一致性檢查的回報 | 偏離 |

第一個偏離點：Phase 2 步驟 7 完成之後、Phase 3 步驟 1 之前，SOP 沒有檢查寫入後一致性的步驟。

E7 的範例取材另行演練（情境：專案只有 `specs/001-photo-album-organizer/` 和另一個 spec 有符合規則的情境）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P2-4 | `rules/憲法規則-格式規範.md` | 推論：步驟 4 要求讀取 | 規則檢查清單，含「範例情境取自 `specs/` 但排除受保護目錄」 | 規則檢查清單；Rule 4 第 1 條只寫「情境取自 `specs/` 下的文件」，沒有排除 | 偏離 |
| P2-6 | 規則檢查清單 | 同上 | 範例只取材自非排除目錄 | 推論：可能讀取並取材自 `specs/001-photo-album-organizer/` | 偏離 |

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `constitution` `SKILL.md` Phase 2 步驟 7 與 Phase 3 步驟 1 之間 | 流程缺陷 | 觀察：SOP 在寫入並驗證格式後直接回報，缺少檢查 Skill 部位與既有產出物的步驟；Phase 3 步驟 1 的回報內容沒有檢查結果。觀察：3 個 RuleFile 與 2 個樣板都只規範落點、鎖定與規則寫法，沒有一致性檢查的判斷方式 | 假設在寫入後新增檢查步驟，並有判斷衝突、例外、範圍、程式碼定位、排除目錄與「無法檢查」的規則，且回報包含檢查結果：S1–S4 的違反項目都會被列出並標出處理 Skill，符合與例外成立的項目不列，滿足 E1–E6、E8、E9；檢查只讀取，E10 仍滿足；檢查放在寫入之後，「規則需求」為空時 Phase 1 步驟 7 直接跳到 Phase 3，回報補上明示後滿足 E11；既有步驟不變，E12、E13 仍滿足。E7 中「一致性檢查不讀排除目錄」由檢查規則滿足；「範例取材不讀排除目錄」發生在檢查之前，R1 無法處理，見 R2 |
| R2 | `constitution` `rules/憲法規則-格式規範.md` Rule 4 第 1 條 | 缺失 | 觀察：Rule 4 第 1 條要求範例情境「取自 `specs/` 下的文件或使用者的描述」，沒有排除 `specs/001-photo-album-organizer/` 與 `specs/skill-engineering/`；其他部位也沒有排除規定 | 假設 Rule 4 第 1 條補上排除這兩個目錄：P2-4 載入的規則檢查清單包含排除，P2-6 只取材自其他 spec 或使用者描述，滿足 E7 的範例取材部分；Rule 4 其他條列不變，E12 仍滿足 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| 已有檢查的要求，但沒有在正確時機載入 | 未載入 | 觀察：Phase 1 步驟 4 的「目標 Skill 現況」只交給步驟 6 的鎖定檢查；任何部位都沒有寫入後一致性的要求可以載入 |
| 要求存在但寫得無法檢查 | 不可檢查 | 觀察：3 個 RuleFile 與 SKILL.md 都沒有一致性檢查的文字，沒有可改寫的既有要求 |
| （R2）範例取材的排除規定存在，但寫範例前沒有載入 | 未載入 | 觀察：Phase 2 步驟 4 在步驟 6 寫入前讀取 `rules/憲法規則-格式規範.md`；該檔 Rule 4 與其他 RuleFile 都沒有排除規定，沒有可載入的內容 |
| （R2）排除規定和其他規則衝突 | 衝突 | 觀察：CLAUDE.md 規則 1 限制讀取參考素材，`constitution` 的部位沒有任何相反的要求；問題是缺少規定，不是兩個要求互相矛盾 |
| 應由下游 `analyze` 負責，不屬於 `constitution` | 非 Skill 問題 | 觀察：`analyze` 的 `description` 要求 spec 目錄已有 `tasks.md`，沒有 `tasks.md` 的 spec 檢查不到；`analyze` 也不檢查 Skill 的 `rules/`、`templates/`。觀察：課程第 18 單元約 14:20 把這個機制歸在更新憲法時 |

## 7. 影響範圍

無。沒有其他 Skill 委派 `constitution`（觀察：本次對話執行 `audit_skill.py --graph` 的 `graph.edges` 中，`constitution` 只有一條指向 `clarify` 的邊，沒有任何邊指向 `constitution`）。`clarify` 不受影響。

## 8. 待確認事項

1. 驗收條件 E1–E13 是否正確、完整？
2. 推定的 E4、E6、E8、E11 是否同意？
3. 是否同意 R1（流程缺陷：寫入後缺少一致性檢查步驟）與 R2（缺失：範例取材沒有排除受保護目錄）？
4. 是否還缺少證據？

### 確認紀錄（2026-11-07）

使用者不在場，授權由 Claude 與 Codex 討論後決定。Codex 第 1 輪審查同意 R1，提出 10 項補正：

1. E1 不限 `specs/`，每筆結果對應憲法檔與 Rule 編號。
2. E2 補「例外成立不列為衝突」。
3. 新增 E4（推定）：檢查目標 Skill 的 `SKILL.md`。
4. E5 補程式碼由 `implement` 處理。
5. E6 改為推定，並依 Rule 的適用條件判定。
6. E7 的排除也套用到 Good／Bad Example 取材。
7. 新增 E8（推定）：程式碼產出物的定位與「尚未實作」。
8. E9 區分無法檢查的原因；缺少部位時仍檢查其他部位。
9. E10 以執行前後的檔案狀態比對；E11 回報明示「未執行一致性檢查」。
10. 新增 E13 保留既有核心預期；演練表改標為靜態推論；刪除沒有當次輸出佐證的歷史斷言；補上證據位置與 S1–S6 的情境內容。

Codex 第 2 輪指出 4 項，已納入：

1. E8 路徑不存在時寫「指定路徑不存在」，不自行判斷為尚未實作。
2. S6 明定既有 Rule；新增 S7 驗收「細節缺少、使用者未回覆」。
3. S1 補 `rules/` 衝突；S5 補鎖定項目衝突。
4. 範例取材的排除另行演練，新增 R2；R1 的反事實檢驗不再宣稱涵蓋 E7 的取材部分。

Codex 第 3 輪：S5 的輸入和 `constitution` RuleFile 的範例相同，已換成不同的流程需求與鎖定衝突。

結論：Codex 第 4 輪回覆「確認」。E1–E13（含推定的 E4、E6、E8、E11）、R1、R2 視為已確認。
