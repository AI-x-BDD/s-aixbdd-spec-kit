# 根因報告：api-plan－Edge Case 正常結果與 Rule 2 衝突

- 紀錄目錄：`specs/skill-engineering/20-api-plan-Edge-Case正常結果與Rule2衝突/`
- 問題證據：`user-verify-skill` 實際驗證（2026-10-26）。實跑需求「specs/002-gym-class-booking 的系統分析已經做完了，幫我把後端的 API 合約寫出來。」；暫存專案 `scratchpad/uv-api-plan`；測試 session 對話紀錄 `~/.claude/projects/-private-tmp-claude-501--Volumes-data-Projects-practice-s-aixbdd-spec-kit-28561332-62f2-4a06-b1de-23f6fb954cf4-scratchpad-uv-api-plan/d0dd2b87-f41a-43a2-bc7b-39ebda054245.jsonl`；產出檔 `scratchpad/uv-api-plan/specs/002-gym-class-booking/contracts/openapi.yaml`；本次對話中使用者的判定「不通過，依建議優化」。

## 1. 使用者回報的問題

實際驗證 `api-plan` 時，測試 session 把 spec 定義為正常結果的兩個 Edge Case（兩位會員同時搶最後一個名額時一位成功、一位排入候補；綠界重複送出付款通知時不重複確認）寫成成功回應，並說明「和樣板範例的做法一致」。這個判斷符合需求，但違反 `rules/API合約-格式規範.md` Rule 2 的字面要求「每個 Edge Case 必須對應到至少一個 operation 的錯誤情況」。Skill 的規則與範例互相矛盾，換一個模型或一次執行，可能改依規則把正常結果寫成 4xx（例如綠界重送回 4xx 會讓綠界持續重送）。使用者判定不通過，並確認修正方向：spec 定義為拒絕的 Edge Case 與驗證規則寫成錯誤回應，定義為正常結果的寫在成功回應與 `description` 並引用需求編號。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 合約寫在目標 spec 目錄的 `contracts/`：HTTP 介面寫入 `openapi.yaml`（`openapi: 3.1.0`），WebSocket、Socket.IO 等事件介面寫入 `asyncapi.yaml`（`asyncapi: 3.0.0`）；只產出用到的檔案；Redocly lint 沒有 error | 既有（紀錄 18 E1） | 通用 | S1、S2 |
| E2 | 每個 operation 恰好一個 tag「<介面編號> <介面名稱>」且與 plan.md 一致；每個負責介面至少一個 operation；沒有負責介面以外的 tag | 既有（紀錄 18 E2） | 通用 | S1、S2 |
| E3 | 每個 operation 的 `description` 引用至少一個目標 spec 中存在的需求編號 | 既有（紀錄 18 E3） | 通用 | S1、S2 |
| E4 | 負責介面需求依據中的 Edge Cases 與驗證規則都在合約中有對應：spec 定義為拒絕或失敗的，在 OpenAPI 以 4xx 回應、在 AsyncAPI 以錯誤訊息表達，同一份合約共用一個錯誤 schema；spec 定義為正常結果的，在 OpenAPI 以成功回應、在 AsyncAPI 以一般事件訊息表達，並在該 operation 的 `description` 寫出這個 Edge Case 與對應結果，不得寫成錯誤回應或錯誤訊息 | 本次（使用者確認的修正方向；取代紀錄 18 E4） | 通用 | S1、S2 |
| E5 | 只產出 API 合約：目標 spec 目錄只新增或改寫 `contracts/` 下的合約檔；合約不含資料表設計或程式實作 | 既有（紀錄 18 E5） | 通用 | S1、S2 |
| E6 | 沒有 `plan.md`，或負責介面為空時停止並回報，不建立 `contracts/` | 既有（紀錄 18 E6） | 通用 | S3（回歸） |
| E7 | 要寫入的合約檔已存在且委派內容沒有說明使用者已同意時，先詢問；同意前不覆寫 | 既有（紀錄 18 E7） | 通用 | S4（回歸） |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E4 | Skill 的規則與範例對「Edge Case 是正常結果」給出同一個指引，產出不依賴模型自行取捨 | 規則要求所有 Edge Case 都寫成錯誤，範例卻把重複付款通知寫成 200 `1\|OK`；測試 session 依範例而非規則處理兩個 Edge Case | 觀察：`rules/API合約-格式規範.md` 第 41 行；`templates/openapi.example.yaml` 第 133、142、147 行；對話紀錄第 126 行（assistant 訊息「這兩種結果都是 spec 定義的正常行為，和樣板範例的做法一致」）；產出檔 `POST /bookings` 的 `description` 寫明同時搶最後名額時回 `BOOKED`／`WAITLISTED`，`POST /payments/ecpay/notify` 重複通知回 `1\|OK` |

## 4. 演練表

`api-plan`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 目標 spec | 觀察：對話紀錄中執行 `ls specs/[0-9][0-9][0-9]-*/spec.md`，選定 `specs/002-gym-class-booking/spec.md` | 一致 |
| P1-4～P1-5 | 無 | 無 | 規劃輸入，確認有 plan.md | 觀察：讀取 spec.md、plan.md、techstack.md | 一致 |
| P1-6～P1-7 | 無 | 無 | 負責介面 B1–B5 | 觀察：最終回報涵蓋 B1–B5 | 一致 |
| P1-8 | 無 | 無 | B1–B4 歸入 openapi.yaml，B5 為無法規劃介面 | 觀察：最終回報「沒寫進合約的介面：B5……不走 HTTP，也不走事件傳輸」；只產出 openapi.yaml | 一致 |
| P1-9～P1-10 | 無 | 無 | 沒有既有合約檔，略過 | 觀察：沒有詢問覆寫，`contracts/` 原本不存在 | 一致 |
| P2-1 | `rules/API合約-格式規範.md` | 觀察：對話紀錄中以 `cat rules/*.md` 讀取 | API 合約檢查清單 | 觀察：已讀取 Rule 1、Rule 2 | 一致 |
| P2-2 | API 合約檢查清單 | 觀察：已讀取 | 依檢查清單設計的 API 設計；依 Rule 2 字面，每個 Edge Case 都應對應錯誤情況 | 觀察：兩個 Edge Case 設計成成功回應，理由引用樣板範例（對話紀錄第 126 行） | 偏離 |
| P3-1 | OpenAPI 樣板組 | 觀察：以 `cat templates/openapi.yaml`、`cat templates/openapi.example.yaml` 讀取 | 合約樣板組 | 觀察：已讀取，範例含重複付款通知回 200 `1\|OK` | 一致 |
| P3-2 | 合約樣板組 | 觀察：已使用 | `contracts/openapi.yaml` | 觀察：已寫入 | 一致 |
| P3-3 | 無 | 無 | 合約檢查結果 | 觀察：`check_contracts.py --interfaces B1,B2,B3,B4` 的 `issues` 為空 | 一致 |
| P3-4 | API 合約檢查清單 | 觀察：已使用 | 逐條驗證結果 | 觀察：回報未通過項為無；Rule 2 與產出的不一致沒有被列出 | 偏離（承接 P2-2） |
| P3-5 | 無 | 無 | 回報 | 觀察：回報路徑、各介面 operation 數、B5、自行做的判斷 | 一致 |

第一個偏離點：P2-2（`THINK` 依「API 合約檢查清單」設計 API 合約）。P2-1 與 P3-1 都已載入對應部位；推論：偏離不是未載入，而是同時載入的兩個部位給出互相矛盾的指引，執行者選了範例（依據 P2-1、P3-1 的觀察與對話紀錄第 126 行）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `api-plan`／`rules/API合約-格式規範.md`／Rule 2 第一條 | 衝突 | 觀察：Rule 2 第一條要求「可規劃介面需求依據中的每個 Edge Case 與驗證規則，必須對應到至少一個 operation 的錯誤情況」；`templates/openapi.example.yaml` 第 133 行把「重複的付款通知（Edge Cases）」寫成仍回應 `1\|OK` 的成功結果。推論：Rule 2 沒有區分 spec 定義為拒絕與定義為正常結果的 Edge Case，與範例互相矛盾（依據兩處觀察）；測試 session 依範例處理（依據對話紀錄第 126 行）。 | 假設 Rule 2 第一條改為區分「拒絕或失敗→錯誤回應」與「正常結果→成功回應並在 `description` 寫出 Edge Case 與結果」：P2-2 的設計與規則、範例三者一致，P3-4 能依規則檢查正常結果沒有被寫成錯誤，E4 可滿足；E1–E3、E5–E7 不受影響。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H2：設計步驟沒有載入 API 合約規則或樣板範例 | 未載入 | 觀察：對話紀錄顯示 P2-1 以 `cat rules/*.md` 讀取 RuleFile，P3-1 讀取 `templates/openapi.yaml` 與 `templates/openapi.example.yaml` |
| H3：模型自行偏離規則，與 Skill 內容無關 | 非 Skill 問題 | 觀察：對話紀錄第 126 行的理由明確引用樣板範例；推論：偏離由 Skill 內兩個部位的矛盾引起，不是模型憑空決定（依據該觀察） |
| H4：範例錯誤，應把重複付款通知改成錯誤回應 | 衝突（改範例一方） | 觀察：spec Edge Cases 寫「綠界重複送出同一筆付款通知時，不得重複確認或重複扣名額」，屬於正常處理結果；使用者確認的修正方向是保留「正常結果寫成成功回應」。推論：改範例會讓合約違反需求，也與使用者的判斷相反（依據兩項觀察） |

## 7. 影響範圍

無：目前沒有其他 Skill 委派 `api-plan`（`audit_skill.py --graph` 的 `callers.api-plan` 為空）。之後 `system-analysis` 升級為指揮者時會成為呼叫者，Rule 2 的修改不改變 `api-plan` 的輸入、輸出與確認方式，不影響委派介面。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整？E4 改寫後取代紀錄 18 的 E4，其餘沿用紀錄 18。
2. 是否同意第 5 節的根因 R1（衝突，位置在 Rule 2 第一條）？
3. 驗收情境預計：S1 用本次原始輸入（健身房預約，自然語言需求）；S2 回歸用 1A2B PostgreSQL 版素材（spec 的 Edge Cases 多數是正常結果，例如配對碼被占用時開新房、重複猜同一組數字照常回報）；S3（E6）、S4（E7）不受本次修改影響，改為逐步演練。是否同意？

## 確認紀錄

- 使用者參考 wsa-course 的提案後回覆「都依建議執行」（2026-10-26）：同意 R1；E4 依建議補上 AsyncAPI 的寫法（正常結果以一般事件訊息表達，已改入第 2 節）；驗收情境 S2 加上判斷「1A2B 的 AsyncAPI 合約中，配對碼被占用時開新房、重複猜同一組數字、設定答案階段有人離開等正常結果，不出現在錯誤碼中」；驗收子代理用 Sonnet，優化後的使用者實際驗證以 `claude --model sonnet` 啟動測試 session。
- 課程依據：〈/plan - 2：最專業的地方 -- 系統分析＆規劃產出物〉約 26:15「spec.md……一直被作為是主要的參考資料」、約 6:07「每個產出物在描述的，都會是它的使用者在乎的」；〈【基因工程】系統分析的單一職責原則 - 產出多個 Planner Skills〉約 24:03 範例改成無關情境以免測試抄答案；〈【基因工程】系統分析的初步規劃 - 多端點盤點：/system-analysis〉約 23:29「要測試的話用笨一點的模型」。
