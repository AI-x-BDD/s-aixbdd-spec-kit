# 根因報告：notification-plan－建立（含 tasks、analyze 接入）

- 紀錄目錄：`specs/skill-engineering/47-notification-plan-建立/`
- 問題證據：
  1. 主目錄 `docs/iterations/iter-6.md` 步驟紀錄 5～7 列。
  2. A 組 worktree（`/Volumes/data/Projects-practice/s-aixbdd-spec-kit-ab/group-a`，branch `ab/group-a`，commit `b0cac59`）的 `specs/008-overdue-discord-notification/tasks.md` Notes 待確認 1～3，與 `analysis.md` 的 E1～E3。A 組產出只讀，未修改。
  3. 共用起點 `ae040c0` 的 `specs/008-overdue-discord-notification/plan.md` 系統介面盤點 S1～S3、N1～N2 列，`research.md` §2、§3、§6，`data/data-model.dbml` 的 `Enum overdue_notification_status`、`Enum overdue_notification_failure_reason`。
  4. Skill 檔案：`system-analysis` SKILL.md Phase 4 步驟 1、Phase 5 步驟 1；`tasks` SKILL.md Phase 1 步驟 4、Phase 2 步驟 2、`rules/任務清單-格式規範.md` Rule 3、Rule 4；`analyze` SKILL.md Phase 1 步驟 5、`rules/分析問題-格式規範.md` Rule 1、Rule 5、`scripts/collect_coverage.py` 的 `expected_output`、`has_output`。
  5. 第四題規劃：`docs/dev/第三題選題討論.md`「第四題規劃」（2026-11-10 第 13 天閘門確認）。

模式說明：主體是新建模式（新 Skill `notification-plan`），SOP 規定新建模式略過根因分析。本報告依使用者要求，說明現有 workflow 為何產不出可交給 `tasks` 的規格，作為新建與接入的依據。`tasks`、`analyze` 的修改是「接入新產出」，不是修正既有缺陷。

## 1. 使用者回報的問題

`plan.md` 盤點出沒有 Planner 的端點：排程 S1～S3、通知服務 N1～N2。這 5 個介面目前只有 `research.md` 的文字決策，沒有可交給 `tasks` 的規格。結果：

1. `tasks` 把 S1～S3、N1～N2 寫成 Notes 待確認 1～3，T009～T015 的 Must Read 只能指向 `research.md` 章節與 `data/data-model.dbml`。
2. `analyze` 把同一缺口列成 E1（HIGH）、E2（HIGH）、E3（MEDIUM），處理 Skill 都寫「需要使用者決定（候選：`system-analysis`、`technical-research`）」，因為沒有任何 Skill 負責這類介面。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | `notification-plan` 產出 `<spec 目錄>/notification/plan.md`；「負責介面」的每個介面恰好有一個標題以「§編號 介面編號 介面名稱」開頭的章節；`plan.md` 中前端、後端、資料庫以外、但不負責通知觸發／送出／重試／結果追蹤的介面，列在「不在範疇」並寫理由 | 本次 | 通用 | S1、S4 |
| E2 | `notification/plan.md` 含第四題規定的 7 個主題：觸發條件、通知狀態與轉換、失敗分類、重試界線、重複處理、紀錄需求、驗收情境；每列引用 spec 中存在的 FR／NFR／SC／US 情境編號 | 本次 | 通用 | S1 |
| E3 | 狀態轉換表列出上游狀態 Enum 的每個值，每個轉換寫出觸發介面、寫入的欄位與需求編號；狀態值、失敗原因值、欄位名稱逐字取自 `data/`、`contracts/` | 本次 | 通用 | S1 |
| E4 | 排程介面寫出觸發時機、使用的時間來源、讀取與寫入的資料、重疊執行與系統恢復時的處理；外部通知服務介面寫出請求、每類回應對應的分類與狀態、通知內容逐行版面與一個填好值的範例；本機替身介面寫出控制操作、模式、各操作的回應與錯誤回應 | 本次 | 通用 | S1 |
| E5 | 失敗分類區分「確定對方沒收到」與「不確定對方是否收到」；驗收情境至少一個「對方可能已收到、本機沒收到回應」的情境；重複處理寫出殘留風險，不出現「保證不重複」 | 本次 | 通用 | S1 |
| E6 | spec 沒有決定、且不同做法會產生不同可觀察行為的業務規則，委派 `clarify` 問使用者並寫入決定；不自行推定 | 本次 | 通用 | S1 |
| E7 | 需要改 API 合約、資料模型或 UI 才能滿足的項目，列在「上游衝突」，寫出位置與處理 Skill（`api-plan`、`data-plan`、`ui-plan` 或 `technical-research`）；只建立 `notification/plan.md`，不修改其他檔案 | 本次 | 通用 | S1 |
| E8 | 目標 spec 目錄有 `notification/plan.md` 時，`tasks` 為 S1～S3、N1～N2 類介面寫的實作任務，Must Read 指向 `notification/plan.md` 的 § 章節；Notes 不再為這些介面寫「沒有規格」的待確認 | 本次 | 通用 | S2 |
| E9 | 目標 spec 目錄有 `notification/plan.md` 時，`analyze` 讀取它；`collect_coverage.py` 把有章節的介面算成有規劃產出；涉及 `notification/plan.md` 的問題，處理 Skill 填 `notification-plan`；排程、通知服務介面沒有任何規劃產出時，處理 Skill 填 `notification-plan`，不寫「需要使用者決定」 | 本次 | 通用 | S3 |
| E10 | `plan.md` 沒有負責通知的介面時，`notification-plan` 回報原因並停止，不建立任何檔案 | 推定 | 通用 | S4 |
| E11 | 目標 spec 目錄已有 `notification/plan.md` 時，先詢問是否覆寫；不同意時不修改任何檔案 | 推定 | 通用 | S5 |
| E12 | 沒有 `notification/` 的 spec 目錄，`tasks` 與 `analyze` 的行為與修改前相同；`collect_coverage.py` 的輸出與修改前相同 | 既有 | 通用 | S6 |

推定理由：E10、E11 是 SOP 一定要決定的停止與覆寫行為，沿用 `api-plan`、`data-plan`、`ui-plan` 的既有做法。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1～E7 | S1～S3、N1～N2 有可交給 `tasks` 的規格文件 | 觀察：沒有任何 Skill 產出這類文件，只有 research §2、§3、§6 的文字決策 | iter-6 步驟 5「沒有 Planner 的端點」；`plan.md` Wave 3 跳過 |
| E8 | T009～T015 的 Must Read 指向介面規格 | 觀察：Must Read 只能指向 `research.md` 章節與 `data/data-model.dbml`，三項待確認 | A 組 `tasks.md` Notes 待確認 1～3 |
| E9 | 缺口有明確的處理 Skill | 觀察：E1～E3 的處理 Skill 都是「需要使用者決定」 | A 組 `analysis.md` E1～E3 |

## 4. 演練表

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| `technical-research`（步驟 4） | spec、使用者限制 | 觀察：已讀 | 排程、Discord 呼叫、模擬器的技術決策 | 觀察：research §2、§3、§6 有決策與結果分類表 | 一致 |
| `system-analysis` P2-2 | 介面盤點檢查清單 | 觀察：已讀 | 盤點 S、N 端點類型 | 觀察：盤點 S1～S3、N1～N2，需求依據完整 | 一致 |
| `system-analysis` P4-1 | 介面清單、Wave 安排 | 觀察：已讀 | 前端、後端、資料庫以外的介面記為「沒有 Planner」 | 觀察：S、N 記為沒有 Planner，Wave 3 跳過 | 一致（依 SOP） |
| `system-analysis` P5-1 | 委派計畫 | 觀察：已讀 | 依賴缺口註明「未分析，請改依技術研究結果」 | 觀察：Wave 2 委派寫「N1、N2 未分析，請改依技術研究結果」 | 一致 |
| workflow：Planner 之後、`tasks` 之前 | — | — | S、N 介面的規格文件 | 觀察：沒有任何 Skill 在此位置 | 偏離 |
| `tasks` P2-2 | 任務清單檢查清單 | 觀察：已讀 | 每個介面在 contracts、data、ui 找到依據 | 觀察：S、N 找不到，依 Rule 4 記為上游缺口 | 一致（依 Rule 4） |
| `analyze` P2-4 | 問題檢查清單、涵蓋盤點 | 觀察：已讀 | 缺口有處理 Skill | 觀察：Rule 5 的對照表沒有負責 S、N 的 Skill，寫「需要使用者決定」 | 一致（依 Rule 5） |

第一個偏離點：`system-analysis` 與 Planner 完成後、`tasks` 之前，沒有任何 Skill 規劃「沒有 Planner」的通知類介面。各 Skill 都照 SOP 執行，落差在 workflow 缺一個步驟。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | SDD Skill 集合：`system-analysis` 之後、`tasks` 之前沒有負責通知類介面的 Skill（`system-analysis` SKILL.md Phase 4 步驟 1 把這類介面記為「沒有 Planner」） | 缺失 | 觀察：`system-analysis` Phase 4 步驟 1 只把前端、後端、資料庫分給 `ui-plan`、`api-plan`、`data-plan`；第四題閘門決定 1 規定新 Skill 獨立，不由 `system-analysis` 委派 | 假設此位置有一個 Skill 產出 `notification/plan.md`：S、N 有規格，E1～E7 可滿足；但 `tasks`、`analyze` 不讀它，E8、E9 仍不滿足，因此需要 R2、R3 |
| R2 | `tasks`：SKILL.md Phase 1 步驟 4（只讀 `contracts/`、`data/`、`ui/`）、`rules/任務清單-格式規範.md` Rule 3（Must Read 的來源）、Rule 4 第 1 條（只在 contracts、data、ui 找依據） | 缺失 | 觀察：Rule 4 第 1 條規定「在 contracts、data、ui 找不到」就記上游缺口；A 組待確認 1～3 依此產生 | 假設 Phase 1 步驟 4 讀 `notification/`、Rule 3／Rule 4 把它列為依據：S、N 任務的 Must Read 指向它，不再寫待確認，E8 可滿足 |
| R3 | `analyze`：SKILL.md Phase 1 步驟 5、`rules/分析問題-格式規範.md` Rule 1（E、F 類）、Rule 3（憲法檔對照）、Rule 5（處理 Skill 對照）、`scripts/collect_coverage.py`（`has_output` 只看 contracts、data、ui） | 缺失 | 觀察：Rule 5 的對照表沒有負責 S、N 的 Skill；`collect_coverage.py` 不讀 `notification/` | 假設讀取 `notification/`、腳本計入章節、Rule 5 對照 `notification-plan`：E9 可滿足 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H1：`technical-research` 應該寫出介面規格 | 缺失（在 `technical-research`） | 觀察：research §2、§3、§6 已有排程、結果分類、模擬器模式的決策；A 組 E1、E2 要求的是狀態轉換表、讀寫欄位、通知版面、控制端點回應，屬介面規格，不屬技術選型。`technical-research` 的 description 只負責選型與決策紀錄 |
| H2：`tasks` 執行者判斷錯誤 | 非 Skill 問題 | 觀察：`tasks` Rule 4 第 1 條要求找不到依據時記為待確認，A 組照規則執行 |
| H3：`system-analysis` 委派時沒交出資訊 | 交接缺陷 | 觀察：Wave 2 委派內容已寫「N1、N2 未分析，請改依技術研究結果」（iter-6 步驟 5），資訊已交出；問題是沒有接收這類介面的 Skill |
| H4：改由 `system-analysis` 委派一個新 Planner | 流程缺陷 | 觀察：第四題閘門決定 1 規定新 Skill 是獨立步驟，不改成由 `system-analysis` 委派 |

## 7. 影響範圍

- `tasks`、`analyze`：沒有其他 Skill 委派它們（`audit_skill.py --graph` 沒有指向兩者的邊），沒有呼叫者要回歸。
- `implement`：只讀 `tasks.md` 的 Must Read，路徑通用，不受影響。
- `system-analysis`：不修改（閘門決定 1）。

## 8. 待確認事項

1. 驗收條件 E1～E12 是否正確、完整？
2. 是否同意 R1～R3？
3. E10、E11 是推定的預期（沿用其他 Planner 的停止與覆寫行為），是否需要？
4. 仍缺少的證據：無。
