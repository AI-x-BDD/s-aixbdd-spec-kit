# 工程藍圖：class-diagram-planner－類別變更標示

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/02-class-diagram-planner-類別變更標示/`
- 根因報告：同一紀錄目錄的 `rca-report.md`，使用者已確認 E1–E6 與 R1；推定的 E7 經使用者回覆不需要，已移除
- 確認紀錄：使用者於 Phase 4 回覆「確認」，同意全部刪除項目與施工工作項

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 類別圖中每個類別都依本次變更的角色，以 annotation 標示 `<<new>>`（新增）、`<<modified>>`（修改）或 `<<existing>>`（未修改的既有類別）其中一種 | 本次 | 通用 |
| E2 | 提案檔依序包含「類別圖」與「設計說明與實作順序」兩個頂層 Section | 既有 | 通用 |
| E3 | 使用者明確確認提案前，不修改任何程式碼 | 既有 | 通用 |
| E4 | 本次類別圖改用淺色主題 | 本次 | 個案，不修改 Skill |
| E5 | 類別圖、設計說明與實作順序互相對應 | 既有 | 通用 |
| E6 | 使用者確認後，程式碼依已確認的類別圖與實作順序實作 | 既有 | 通用 |

## 2. To-Be SOP

````markdown
---
name: class-diagram-planner
description: 實作會新增或修改類別的功能或重構前，必須使用此 Skill；先提出 Mermaid 類別圖提案並取得使用者明確確認，再依已確認的類別圖與相依順序實作。使用者提到 class diagram、類別設計、重構規劃時使用。
---

# SOP

## Phase 1 -- 分析與提案

1. `READ` 使用者需求、專案規範、Java 原始碼路徑（若有），以及專案根目錄下既有的 `specs/plan/` 計畫目錄（若存在），建立「專案輸入」。
2. `THINK` 若「專案輸入」顯示本次需求涉及 Java 原始碼，依需求與原始碼路徑選定完整名稱的入口類別。
3. `DELEGATE` 若已選定 Java 入口類別，在本 Skill 目錄執行 `uv run --script scripts/inspect_java_classes.py --project-root <專案根目錄絕對路徑> --entry <完整類別名稱>`，從標準輸出取得 JSON 類別結構摘要；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止此步驟。
4. `CHECK` 執行腳本時確認退出狀態為零且標準輸出為可解析的 JSON，並檢視未解析引用及截斷狀態；失敗時依標準錯誤輸出修正入口並重試，仍失敗時回報原因。
5. `READ` 已取得類別結構摘要時依摘要選擇相關原始碼深入閱讀；未取得摘要時直接閱讀相關程式碼，建立「相關程式碼現況」。
6. `READ` 設計類別時，讀取 `rules/類別設計-格式規範.md` 的所有 Rule，建立類別設計檢查清單。
7. `THINK` 依「相關程式碼現況」與已載入的類別設計檢查清單，設計類別與實作順序；並決定本次計畫名稱及下一個可用的兩位數編號 `<NN>`（從既有最大編號加一，沒有既有計畫時從 `01` 開始）。
8. `CHECK` 逐條驗證類別設計檢查清單；未通過時修正設計。
9. `READ` 產生類別圖時，讀取 `rules/類別圖輸出-格式規範.md` 的所有 Rule，建立類別圖輸出檢查清單。
10. `READ` `templates/class-diagram-proposal.md` 與 `templates/class-diagram-proposal.example.md`，載入骨架與範例，命名載入結果為「類別圖提案樣板組」。
11. `WRITE` 依已載入的類別圖輸出檢查清單與「類別圖提案樣板組」，建立計畫目錄，將完整 Markdown 類別圖提案檔寫入專案根目錄下的 `specs/plan/<NN>-<本次計畫名稱>/class-diagram-proposal.md`。
12. `CHECK` 逐條驗證類別圖輸出檢查清單，並確認提案檔位於指定路徑且涵蓋需求。

完成條件：類別設計與類別圖輸出檢查清單均已通過，完整 Markdown 類別圖提案檔可供使用者評估，且程式碼尚未修改。

## Phase 2 -- 確認提案

1. `WRITE` 向使用者展示完整 Markdown 類別圖提案檔，並請求明確確認。
2. `CHECK` 使用者回覆；要求修改時返回 Phase 1，未明確確認時停止執行。

完成條件：使用者已明確確認目前版本的 Markdown 類別圖提案檔與實作順序。

## Phase 3 -- 按圖開發與驗證

1. `READ` 已確認的 Markdown 類別圖提案檔、最新的相關程式碼與專案規範。
2. `THINK` 比對最新的相關程式碼與已確認的 Markdown 類別圖提案檔；實際狀態需要改變類別圖時，返回 Phase 1 修訂並重新取得確認。
3. `WRITE` 依已確認的 Markdown 類別圖提案檔中的實作順序修改程式碼。
4. `CHECK` 類別組織符合已確認的 Markdown 類別圖提案檔中的類別圖，並執行適用的測試、型別檢查與 lint。

完成條件：程式碼符合已確認的 Markdown 類別圖提案檔中的類別圖，且所有適用驗證結果已回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 「第一個頂層 Section 放置 Mermaid 類別圖，第二個頂層 Section 放置設計說明與實作順序」 | P1-11 內文 | 無法追溯：E2 已由類別圖提案樣板組保證（C2） |
| 「兩個頂層 Section 結構、Mermaid 類別圖、設計說明與實作順序彼此一致」 | P1-12 內文 | 無法追溯：E2 由樣板組保證（C2），E5 由 `rules/類別圖輸出-格式規範.md` Rule 5 保證（C3），P1-12 已逐條驗證該檢查清單 |
| 「（第一個頂層 Section 為 Mermaid 類別圖，第二個頂層 Section 為設計說明與實作順序）」 | P2-1 內文 | 無法追溯：展示的就是已依樣板組產生的提案檔（C2） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `rules/類別圖輸出-格式規範.md` Rule 2 | 修改 | 加入條列：每個類別必須在類別本體第一行以 annotation 標示 `<<new>>`、`<<modified>>` 或 `<<existing>>` 其中一種；Good Example 補上標示，Bad Example 改為缺少標示 | R1、E1（C1） |
| `templates/class-diagram-proposal.example.md` | 修改 | 為 `OrderService` 與 `OrderRepository` 加上符合 Rule 2 的 annotation；骨架不變 | E1，範例與 C1 一致 |
| P1-11、P1-12、P2-1 | 修改 | 刪除上表所列重複描述，其餘文字保留原文 | 刪除的描述表達 C2、C3；保留的文字中，P1-11 表達 C14，P1-12 表達 C15 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（`name` 與 `description`） | E3、E6：description 已說明先確認提案再實作 | 無（只概述用途與觸發情境） |
| 三個 Phase 的完成條件 | Phase 1：E2、E3、E5；Phase 2：E3；Phase 3：E6 | 無（只概述結果） |
| Phase 1 -- 分析與提案 | E1、E2、E5 | 無（只組織步驟） |
| P1-1～P1-6、P1-8～P1-10（讀取輸入、執行類別結構腳本、閱讀相關程式碼、載入與驗證檢查清單、載入樣板組） | E1、E2、E5 | 無（只讀取、委派、載入或驗證） |
| P1-7（設計類別並決定計畫編號） | E5、E6 | C12 |
| Phase 2 -- 確認提案（P2-2） | E3 | C13 |
| Phase 3 -- 按圖開發與驗證（P3-1～P3-4） | E6 | 無（只依已確認提案實作與驗證） |
| `rules/類別設計-格式規範.md` Rule 1～4 | E5、E6 | C4–C7 |
| `rules/類別圖輸出-格式規範.md` Rule 1、3、4 | E2、E5 | C8–C10 |
| `rules/類別圖輸出-格式規範.md` Rule 5 | E5 | C3 |
| `templates/class-diagram-proposal.md` | E2 | C2 |
| `scripts/inspect_java_classes.py` | E1 | C11 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 18 | 18 | 0 |
| RuleFile | 2 | 2 | 0 |
| Rule | 9 | 9 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 1 | 0 |

內容增減：Rule 2 新增一個條列（R1，缺失類型，沒有可刪除或改寫的既有內容能表達 E1）；刪除三個步驟中重複的結構與一致性描述。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 每個類別標示變更類型 | P1-11 | `rules/類別圖輸出-格式規範.md` Rule 2 | 判斷新增、修改或既有需要設計語意，腳本無法判斷；骨架以區塊填位符號產生類別，樣板無法逐類別保證；需要正反例；屬於既有的類別圖輸出主題 |
| C2 | 提案檔依序包含兩個頂層 Section | P1-11 | 類別圖提案樣板組 | 約束的是整份提案檔的結構 |
| C3 | 類別圖、設計說明與實作順序互相對應 | P1-11 | `rules/類別圖輸出-格式規範.md` Rule 5 | 需要判斷語意是否一致，腳本無法保證；需要正反例 |
| C4 | 類別與責任可追溯至需求 | P1-7 | `rules/類別設計-格式規範.md` Rule 1 | 既有，不變；需要判斷與正反例 |
| C5 | 類別責任具有明確邊界 | P1-7 | `rules/類別設計-格式規範.md` Rule 2 | 既有，不變；需要判斷與正反例 |
| C6 | 類別關係符合實際語意 | P1-7 | `rules/類別設計-格式規範.md` Rule 3 | 既有，不變；需要判斷與正反例 |
| C7 | 實作順序依相依性排列 | P1-7 | `rules/類別設計-格式規範.md` Rule 4 | 既有，不變；需要判斷與正反例 |
| C8 | 類別圖通過 Mermaid 語法檢查 | P1-11 | `rules/類別圖輸出-格式規範.md` Rule 1 | 既有，不變；樣板無法限制填入的語法 |
| C9 | 類別成員維持設計層級 | P1-11 | `rules/類別圖輸出-格式規範.md` Rule 3 | 既有，不變；需要判斷與正反例 |
| C10 | 關係使用對應的 Mermaid 符號 | P1-11 | `rules/類別圖輸出-格式規範.md` Rule 4 | 既有，不變；需要判斷與正反例 |
| C11 | 類別結構摘要的輸出上限，以及找不到入口類別時失敗 | P1-3 | `scripts/inspect_java_classes.py` | 既有，不變；可由程式判斷 |
| C12 | 計畫編號為既有最大編號加一，沒有既有計畫時從 `01` 開始 | P1-7 | P1-7 步驟內文 | 既有，不變；只屬於單一步驟，一句話即可表達 |
| C13 | 使用者明確確認提案前不修改程式碼 | P2-2 | SOP 流程 | 既有，不變；屬於使用者確認閘門 |
| C14 | 提案檔寫入 `specs/plan/<NN>-<本次計畫名稱>/class-diagram-proposal.md` | P1-11 | P1-11 步驟內文 | 既有，不變；只屬於單一步驟，一句話即可表達 |
| C15 | 提案檔涵蓋需求 | P1-12 | P1-12 步驟內文 | 既有，不變；只屬於單一步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | Phase 1 -- 分析與提案的 `WRITE` 產生提案檔步驟與 `CHECK` 驗證類別圖輸出步驟；Phase 2 -- 確認提案的 `WRITE` 展示步驟 | 依 To-Be SOP 刪除三段重複描述 | C2、C3 | 已完成 |
| 2 | W2 | `skill-form-rule` | `rules/類別圖輸出-格式規範.md` Rule 2 | 加入 annotation 條列，並更新 Good Example 與 Bad Example | C1 | 已完成 |
| 3 | W3 | `skill-form-template` | `templates/class-diagram-proposal.example.md` | 為兩個類別加上 annotation，骨架不變 | C1 | 已完成 |

### 工作項內容

#### W1：SOP 修改

依第 2 節 To-Be SOP 修改下列三個步驟，其餘步驟保留原文：

| 步驟 | 修改後全文 |
| ---- | ---------- |
| Phase 1 -- 分析與提案的 `WRITE` 產生提案檔步驟 | `WRITE` 依已載入的類別圖輸出檢查清單與「類別圖提案樣板組」，建立計畫目錄，將完整 Markdown 類別圖提案檔寫入專案根目錄下的 `specs/plan/<NN>-<本次計畫名稱>/class-diagram-proposal.md`。 |
| Phase 1 -- 分析與提案的 `CHECK` 驗證類別圖輸出步驟 | `CHECK` 逐條驗證類別圖輸出檢查清單，並確認提案檔位於指定路徑且涵蓋需求。 |
| Phase 2 -- 確認提案的 `WRITE` 展示步驟 | `WRITE` 向使用者展示完整 Markdown 類別圖提案檔，並請求明確確認。 |

#### W2：`rules/類別圖輸出-格式規範.md` Rule 2

- 新增條列：每個類別必須在類別本體的第一行，以 annotation 標示 `<<new>>`、`<<modified>>` 或 `<<existing>>` 其中一種。
- Good Example：沿用既有情境，`OrderService` 標示 `<<modified>>`，`OrderRepository` 標示 `<<new>>`。
- Bad Example：沿用既有情境，兩個類別都沒有 annotation。
- 其餘條列與 Rule 1、3、4、5 保留原文。

#### W3：`templates/class-diagram-proposal.example.md`

- 在 `OrderService` 類別本體第一行加入 `<<modified>>`，在 `OrderRepository` 類別本體第一行加入 `<<new>>`。
- 設計說明與實作順序保留原文；骨架 `templates/class-diagram-proposal.md` 不修改。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E5、E6 | 本次 | 為既有訂單系統新增退款功能，原始碼含 `OrderService` 與 `PaymentGateway` | Phase 2 回覆「確認」 | `RefundService` 為 `<<new>>`、`OrderService` 為 `<<modified>>`、`PaymentGateway` 為 `<<existing>>`；兩個頂層 Section 完整；程式碼依實作順序修改 |
| S2 | E2、E3、E5 | 回歸 | 從零建立通知模組，沒有既有類別 | Phase 2 回覆「先不要」 | 所有類別為 `<<new>>`；兩個頂層 Section 完整；沒有修改任何程式碼 |

## 8. 驗收結果

- 結構診斷：`class-diagram-planner` 為 0 個 error、0 個 warning。
- S1 通過：子代理在包含本次未提交修改的暫存專案複本中實際執行，三個類別的標示均正確，程式碼依實作順序新增 `RefundService` 並修改 `OrderService`。
- S2 通過：子代理在暫存目錄中實際執行，所有類別為 `<<new>>`，收到「先不要」後停止，沒有修改程式碼。
- 約束分配：C1–C15 各只出現在指定的存放位置，保留與修改的元素引用的約束，存放位置都是該元素本身。
- 個案驗收條件 E4：建議只在本次提案檔加入淺色主題設定，不修改 Skill。
