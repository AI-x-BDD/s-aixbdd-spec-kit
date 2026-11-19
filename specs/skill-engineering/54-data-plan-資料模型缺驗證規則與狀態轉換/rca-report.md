# 根因報告：data-plan－資料模型缺驗證規則與狀態轉換

- 紀錄目錄：`specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/`
- 問題證據：
  - 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md` 第 3.2 節 C13（「C14、C15 要引用的欄位約束必須先寫在資料模型裡」）、第 4 節批 2。
  - 落差分析：`docs/dev/spec-kit-1.4.2-落差分析.md` C13（「data-plan 只要求 Enum、unique、not null、索引、Ref」）。
  - Skill 檔案：`.claude/skills/data-plan/` 的 `SKILL.md`、`rules/資料模型-格式規範.md`、`templates/data-model.dbml`、`templates/data-model.example.dbml`、`scripts/check_data_model.py --help`。
  - 產出檔：`specs/006-reservation-reschedule/data/data-model.dbml`、`specs/008-overdue-discord-notification/data/data-model.dbml`；下游產出 `specs/008-overdue-discord-notification/tasks.md` T003。
  - 上游 v1.4.2：`templates/commands/plan.md` Phase 1 第 1 點（gh api 讀取 tag `v1.4.2`，與 `.spec-kit/claude-skills/speckit-plan/SKILL.md:139-140` 內容相同）、`.spec-kit/v1.4.2/templates/commands/tasks.md:74、201-204`、`.spec-kit/v1.4.2/templates/commands/analyze.md:105-106、119、163`。

## 1. 使用者回報的問題

調整計畫 C13 要求資料模型寫出驗證規則（長度、範圍、格式）與狀態轉換。理由是批 2 的 C14（`tasks` 以 `table.column` 引用欄位約束）與 C15（`analyze` 的欄位涵蓋表）都把資料模型當成欄位約束的唯一來源。目前 `data-plan` 沒有要求這兩項。產出檔裡有時寫了，但寫在一般說明文字中，下游無法逐欄位找出約束。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 需求中限制單一欄位值的驗證規則（長度、數值範圍、格式、可接受的日期範圍），都寫在 `data-model.dbml` 該欄位的定義上，用固定寫法並附需求編號；只看固定寫法就能列出每個 `table.column` 的約束，不需要讀一般說明文字 | 本次 | 通用 | S1、S2 |
| E2 | 需求規定狀態會改變的 Enum 欄位，在 `data-model.dbml` 有一處完整的狀態轉換：列出 Enum 每個值、每個允許的「從 → 到」與需求編號、哪些是終態；沒有列出的轉換即不允許。同一欄位的轉換不分散在 Enum 值、欄位與資料表的 `Note` | 本次 | 通用 | S1 |
| E3 | 跨欄位的驗證規則（例如 `status = failed` 時 `failure_reason` 必填）寫在資料表層級，列出涉及的每個 `table.column` 與需求編號。推定理由：C13 的驗證規則包含條件式規則，006、008 都有；下游 C14 引用時要知道涉及哪些欄位 | 推定 | 通用 | S1 |
| E4 | 狀態轉換寫到 Enum 沒有的值，或約束引用 spec 沒有的需求編號時，`data-plan` 先修正再寫出，3 輪仍未通過時列為「未通過項」。推定理由：固定寫法要能被檢查，否則下游會引用錯的值 | 推定 | 通用 | S1 |
| E5 | 需求沒有限制的欄位，固定寫法中不出現需求沒有的長度、範圍或格式約束；需求沒有狀態轉換時不寫轉換。推定理由：上游 `analyze.md:106` 要求不虛構欄位或約束；多出的約束會讓下游多出任務 | 推定 | 通用 | S2 |
| E6 | 每張資料表的 `Note` 以負責介面編號開頭並寫出需求依據；每個負責介面至少一張資料表；Key Entities 都有對應資料表或寫明併入哪張表 | 既有 | 通用 | S1、S2 |
| E7 | 關聯用 `Ref` 標明基數；每張表有主鍵；固定狀態集合用 `Enum`；唯一、必填與查詢效能所需的欄位分別有 `unique`、`not null`、`indexes` | 既有 | 通用 | S1、S2 |
| E8 | 驗證規則與狀態轉換只描述資料值的限制，不寫 API 錯誤碼、畫面提示或程式實作 | 既有 | 通用 | S1、S2 |
| E9 | `check_data_model.py` 沒有問題（官方 DBML parser 可解析、`database_type` 與技術研究一致），區塊結構與樣板一致，沒有殘留的 `{{` | 既有 | 通用 | S1、S2 |
| E10 | 只寫入 `data/data-model.dbml`；既有檔案要先取得覆寫同意，不同意時不修改任何檔案 | 既有 | 通用 | S1、S3 |
| E11 | 遵循憲法檔的必須／不得規則（例如軟刪除、`timestamptz`），回報路徑、介面與資料表對應、「未通過項」與「憲法遵循」 | 既有 | 通用 | S1、S2 |

驗收情境（施工後在暫存專案複本執行）：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E4、E6～E11 | 本次 | 對 `specs/006-reservation-reschedule/` 執行 `data-plan`，負責介面為 plan.md 的資料庫介面 | 覆寫詢問回覆「同意覆寫」 | (1) `reschedule_requests.to_reservation_date` 的 7 天、`reschedule_requests.reject_reason` 的 200 字、`captcha_challenges.captcha_code` 的英數 7 碼，都在該欄位的固定寫法中並附需求編號；(2) `reschedule_requests.status` 與 `reservations.status` 各有一處完整的轉換，涵蓋 Enum 每個值與終態；(3) 「新時段不同於原時段」寫在資料表層級並列出涉及的欄位；(4) 故意把一個轉換改成不存在的 Enum 值時，檢查會找出來；(5) 腳本沒有問題，只有 `data/data-model.dbml` 改變 |
| S2 | E1、E5～E9、E11 | 回歸 | 對 `specs/002-room-game-chat/` 執行 `data-plan` | 覆寫詢問回覆「同意覆寫」 | 訊息「最多 100 字」與「不得為空白」在該欄位的固定寫法中；沒有任何狀態轉換段；沒有需求以外的約束；Rule 1、Rule 2 的既有要求與腳本檢查都通過 |
| S3 | E10 | 回歸 | 對 `specs/004-equipment-approval-review/` 執行 `data-plan` | 覆寫詢問回覆「不同意」 | 回報沒有修改既有資料模型；`git status` 與執行前相同 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 欄位約束用固定寫法，與說明文字分開 | 約束混在 `note` 的說明句中，寫法每次不同 | 觀察：006 `reschedule_requests.to_reservation_date` 的 note「必須在當日起算 7 天內」、`captcha_challenges.captcha_code` 的 note「同時含英文與阿拉伯數字的 7 位數驗證碼」；008 `overdue_notifications.auto_retry_count` 的 note「0～3」；範例 `cart_items.quantity` 的 note「必須大於 0」 |
| E1 | 下游能逐欄位帶出約束 | 下游重抄欄位時漏掉約束 | 觀察：008 `tasks.md` T003 寫 `auto_retry_count`（`Int`，預設 0），沒有 0～3 |
| E2 | 每個會變的狀態欄位有一處完整轉換 | 轉換分散在 3 處，且不完整 | 觀察：006 `reschedule_requests` 的轉換分散在 `Enum reschedule_request_status` 各值的 note、`status` 欄位 note（「只允許由 pending_approval 轉移到其他 4 種終態」）與資料表 `Note`；006 `reservations.status` 的 note 只寫取消與登記領取兩種轉換，沒有 `pending_approval → confirmed／rejected`。008 `overdue_notifications.status` 同樣分散在 Enum 值 note、欄位 note 與資料表 `Note` |
| E3 | 跨欄位規則在資料表層級並列出欄位 | 寫在其中一個欄位的 note | 觀察：008 `failure_reason` 的 note「status = failed 時必填」；006 `to_slot_id` 的 note「與 to_reservation_date 的組合必須不同於原日期時段」 |
| E4 | 轉換與約束的引用會被檢查 | 沒有任何檢查 | 觀察：`check_data_model.py --help` 只檢查資料表 note 的介面編號、介面涵蓋與需求編號 |

## 4. 演練表

`data-plan`（以 006 的產出為對象；當次對話紀錄沒有保存，載入行為無法直接觀察）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 目標 spec | 觀察：產出檔頭 `Spec: specs/006-reservation-reschedule/spec.md` | 一致 |
| P1-4 | 無 | 無 | 含 spec 全文的規劃輸入 | 觀察：產出的 note 含 spec FR-001 的「7 天內」與 Key Entities 的「上限 200 字」 | 一致 |
| P1-5 | 憲法檔 | 觀察：產出每張表有 4 個生命週期欄位並寫軟刪除 | 憲法檢查清單 | 推論：憲法已讀取（依據左欄觀察） | 一致 |
| P1-6～P1-10 | 無 | 無 | 負責介面 D1、D2 | 觀察：`TableGroup` 為 D1、D2 | 一致 |
| P2-1 | `rules/資料模型-格式規範.md` | 無證據 | 資料模型檢查清單 | 推論：清單只含 Rule 1、Rule 2（依據 RuleFile 只有兩個 Rule） | 一致 |
| P2-2 | 資料模型檢查清單 | 推論：已使用（產出符合 Rule 1、Rule 2，例如 partial unique index 與 Enum） | 含欄位驗證規則、跨欄位規則與狀態轉換的資料模型設計 | 觀察：驗證規則與轉換只以說明文字散在 note，`reservations.status` 轉換不完整 | 偏離 |
| P2-3～P2-5 | 憲法檢查清單 | 無證據 | 憲法衝突 | 觀察：回報不存在，無法核對 | 無證據 |
| P3-1 | 資料模型樣板組 | 無證據 | 樣板組 | 觀察：骨架只有 Enums、Tables、Table Groups、Relationships 四區；範例的約束寫在 note | 一致 |
| P3-2 | 樣板組、資料模型設計 | — | `data-model.dbml` | 觀察：區塊結構與骨架一致 | 一致 |
| P3-3～P3-4 | 檢查清單、腳本 | — | 檢查結果 | 推論：腳本與 Rule 1、Rule 2 都沒有約束與轉換的項目，檢查只能通過（依據 `--help` 與 RuleFile） | 一致 |

第一個偏離點：P2-2（`THINK` 設計資料模型）。P2-2 依的「資料模型檢查清單」與 P3-1 的樣板組都沒有驗證規則與狀態轉換；推論：模型只能自行決定寫不寫、寫在哪裡（依據 P2-1、P3-1 的觀察）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `data-plan`／`rules/資料模型-格式規範.md`／Rule 2；`templates/data-model.dbml` 與 `templates/data-model.example.dbml`（沒有約束與轉換的寫法） | 缺失 | 觀察：Rule 2 只要求 `Ref`、主鍵、`Enum`、`unique`、`not null`、`indexes`，沒有長度、範圍、格式、跨欄位規則與狀態轉換；骨架沒有放這些內容的位置；範例把「必須大於 0」寫成 note 說明，`order_status` 沒有轉換。觀察：上游 v1.4.2 `plan.md` Phase 1 要求 data-model 寫「Validation rules from requirements」與「State transitions if applicable」，`tasks.md:201` 把 data-model 當欄位約束的唯一來源。推論：預期沒有在任何部位表達，P2-2 每次自由決定寫法（依據 006、008 寫法不同的觀察）。 | 假設 Rule 2 與樣板組規定固定寫法：P2-2 會為每個受約束欄位寫出約束、為每個會變的狀態欄位寫出一處完整轉換；P3-4 逐條驗證可檢查 E1～E5；E6～E11 的既有要求不受影響。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：規則沒有在設計前載入 | 未載入 | 觀察：SKILL.md Phase 2 步驟 1 在設計前讀取全部 Rule；產出符合 Rule 1、Rule 2 的細節（介面編號開頭的 `Note`、Enum、partial unique index） |
| H3：上游沒有交出驗證規則 | 交接缺陷 | 觀察：P1-4 讀取 spec 全文；006 產出含 spec FR-001 的「7 天內」與 Key Entities 的「上限 200 字」，輸入已經到達 |
| H4：模型能力不足 | 非 Skill 問題 | 觀察：006 與 008 兩次產出都寫出部分約束，但寫法與位置不同；推論：落差來自沒有規定的寫法，不是能力（依據兩份產出的觀察） |
| H5：檢查只交給 AI，腳本沒有檢查 | 載體過弱 | 觀察：偏離發生在 P2-2 設計，不在 P3-4 檢查；推論：沒有規定寫法前，腳本無法檢查任何東西，這是 R1 的結果（依據演練表） |

## 7. 影響範圍

- 呼叫 `data-plan` 的 Skill：`system-analysis`（Phase 3 步驟 1 把資料庫介面交給 `data-plan`）。結構診斷的呼叫圖沒有抓到這條，以 `system-analysis/SKILL.md` 第 45 行為準。沒有 Skill 呼叫 `system-analysis`。
- 讀取 `data-model.dbml` 的下游（不是呼叫者）：
  - `tasks`、`analyze`：批 2 的下兩步，會依新寫法引用與檢查欄位約束。
  - `notification-plan`：`rules/通知規劃-格式規範.md` Rule 3 要求自己的狀態表列出資料模型 Enum 的每個值。資料模型有了允許的轉換後，兩處都會寫「從 → 到」，可能互相不一致。批 2 的範圍沒有 `notification-plan`。
  - `constitution`、`implement`：讀 `data-model.dbml`，不受寫法影響。
- 既有 `specs/` 的資料模型不重跑（計畫風險 R12）。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整？
2. E3（跨欄位規則寫在資料表層級）、E4（引用錯誤要被檢查）、E5（不加需求沒有的約束）是推定的預期，是否都要保留？
3. 是否同意第 5 節的根因 R1？
4. `notification-plan` 的狀態表和資料模型的轉換可能重複。我建議批 2 不改 `notification-plan`，把這項記入 `docs/待確認.md`，是否同意？
5. 缺少的證據：當次執行 006 `data-plan` 的對話紀錄沒有保存，載入行為只能從產出推論。這不影響 R1，因為 R1 可由 Skill 檔案直接核對。

## 9. 確認紀錄

- 2026-11-19，使用者回覆「都同意，E3～E5 保留，繼續 Phase 3」：
  - 第 2 節驗收條件 E1～E11 正確、完整；推定的 E3、E4、E5 保留。
  - 同意根因 R1。
  - 同意批 2 不改 `notification-plan`，已記入 `docs/待確認.md` 第 37 項。
