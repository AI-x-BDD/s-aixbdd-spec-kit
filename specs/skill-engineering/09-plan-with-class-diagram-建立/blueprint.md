# 工程藍圖：plan-with-class-diagram－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/09-plan-with-class-diagram-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「確定」，確認全部驗收條件、To-Be SOP 與施工工作項；推定的 E4、E6、E7 經說明理由後一併確認；新建模式沒有刪除項目
- 委派來源：`artifact-to-skill-engineering` Phase 4。樣板組 `templates/class-diagram-proposal.md` 與 `templates/class-diagram-proposal.example.md` 已經使用者定稿，作為產出格式保留、不改寫；定稿範例 SHA-256 為 `e8c074d381b2c7ff26ef1d25102154283ff9e1dad87909b540fd8b51999fc65e`。
- 輸入樣本（推定，依定稿範例反推並經使用者確認）：「訂單系統要加『取消訂單』功能，取消後用現有的 OrderNotifier 通知使用者。另外，OrderService 現在直接用 LegacyOrderDao 存取訂單，請改成透過 Repository 介面，並用 SQL 實作；下單和取消都走新的 Repository，改完後把 LegacyOrderDao 移除。」

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 提案檔依樣板組依序包含「類別圖」（Mermaid 類別圖與圖例表）與「設計說明與實作順序」（「設計說明」與「實作順序」兩個子段落） | 本次：樣板組已經使用者定稿 | 通用 |
| E2 | 類別圖中每個類別恰好標示一種變更狀態（新增、修改、刪除、既有）的 stereotype 與對應樣式類別；標為新增的類別在既有程式碼中不存在，標為修改、刪除、既有的類別在既有程式碼中存在 | 本次：定稿範例與圖例 | 通用 |
| E3 | 修改類別中本次新增、修改簽章或行為、移除的成員，以及本次新增或移除的關係，在結尾分別標 `«new»`、`«changed»`、`«removed»`；未變動的成員與關係不加標記 | 本次：定稿範例與圖例 | 通用 |
| E4 | 類別圖只納入本次新增、修改、刪除的類別，以及與它們有直接關係的既有類別；與本次變更無直接關係的既有類別不出現在圖中 | 推定：使用者沒有明說納入範圍，但每次執行都必須決定；定稿範例只畫出變更類別與直接協作者 | 通用 |
| E5 | 設計說明逐一說明類別圖中每個類別並註明其變更狀態；實作順序依相依先後排列，刪除類別排在其依賴者改寫之後；類別圖、設計說明與實作順序提到的類別一致 | 本次：定稿範例 | 通用 |
| E6 | 提案檔中的 Mermaid 類別圖可被 Mermaid 渲染 | 推定：使用者以 Mermaid 預覽審閱提案，無法渲染就無法審閱 | 通用 |
| E7 | 提案檔寫入專案根目錄下的 `specs/plan/<NN>-<計畫名稱>/class-diagram-proposal.md`，`<NN>` 為既有最大兩位數編號加一，沒有既有計畫時為 `01` | 推定：使用者沒有指定產出位置，但每次執行都必須決定；`specs/` 是本專案放 SDD 產出物的目錄 | 通用 |
| E8 | 使用者明確確認提案前，不修改任何程式碼 | 本次：Skill 用途 | 通用 |
| E9 | 使用者確認後，依提案檔的實作順序修改程式碼，執行專案適用的測試並回報結果 | 本次：Skill 用途 | 通用 |

## 2. To-Be SOP

````markdown
---
name: plan-with-class-diagram
description: （由 W1 依 skill-form-description 撰寫：開頭標「（未驗證）」；說明寫程式前先產出標示新增／修改／刪除／既有的 Mermaid 類別圖提案，取得使用者明確確認後才依提案開發；觸發情境為使用者要求先規劃類別或畫類別圖再寫程式，或提到 plan-with-class-diagram、類別圖提案；只需寫需求規格時改用 s-specify）
---

# SOP

## Phase 1 -- 設計並產出類別圖提案

1. `READ` 使用者需求，以及需求涉及的既有程式碼與測試（沒有既有程式碼時視為空），建立「程式碼現況」。
2. `READ` 設計類別圖提案時，讀取 `rules/類別圖提案-格式規範.md` 的所有 Rule，建立「提案檢查清單」。
3. `THINK` 依使用者需求、「程式碼現況」與已載入的「提案檢查清單」，決定類別圖納入的類別、類別與成員及關係的變更狀態、設計說明與實作順序，並決定本次計畫名稱。
4. `READ` `templates/class-diagram-proposal.md` 與 `templates/class-diagram-proposal.example.md`，載入骨架與範例，命名載入結果為「類別圖提案樣板組」。
5. `WRITE` 依「類別圖提案樣板組」與步驟 3 的設計建立計畫目錄，將提案檔寫入專案根目錄下的 `specs/plan/<NN>-<本次計畫名稱>/class-diagram-proposal.md`；`<NN>` 為 `specs/plan/` 下既有最大兩位數編號加一，沒有既有計畫時為 `01`。
6. `CHECK` 逐條驗證「提案檢查清單」，並以 Mermaid 渲染工具渲染提案檔中的類別圖；未通過或渲染失敗時修正提案檔後重新驗證。

完成條件：提案檔已寫入指定路徑，通過「提案檢查清單」且類別圖可渲染，程式碼尚未修改。

## Phase 2 -- 確認提案

1. `WRITE` 向使用者展示提案檔路徑與完整內容，請求明確確認是否依此開發。
2. `CHECK` 使用者回覆：要求修改時依回覆返回 Phase 1 步驟 3；明確確認時進入 Phase 3；未明確確認時停止執行。

完成條件：使用者已明確確認目前版本的提案檔。

## Phase 3 -- 按圖開發與驗證

1. `READ` 已確認的提案檔與最新的相關程式碼。
2. `WRITE` 依提案檔「實作順序」逐項修改程式碼。
3. `CHECK` 程式碼中的類別、成員與關係符合已確認的類別圖，並執行專案適用的測試；需要改變類別圖才能完成時，返回 Phase 1 步驟 3 修訂提案並重新取得確認。
4. `WRITE` 向使用者回報已完成的實作順序項目與測試結果。

完成條件：程式碼符合已確認的類別圖，測試結果已回報使用者。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name` 與 `description`，`description` 開頭標「（未驗證）」（`CLAUDE.md` 規定未經學員實際驗證的 Skill 須標明） | E8、E9：概述先提案、確認後開發 |
| Phase 1 -- 設計並產出類別圖提案（P1-1～P1-6） | 新增 | 讀取現況、載入檢查清單、設計、載入樣板組、寫入提案檔、驗證 | E1～E7；C6、C7 |
| Phase 2 -- 確認提案（P2-1、P2-2） | 新增 | 展示提案並等待明確確認 | E8；C8 |
| Phase 3 -- 按圖開發與驗證（P3-1～P3-4） | 新增 | 依實作順序開發、比對類別圖、執行測試並回報 | E9；C9、C10 |
| `rules/類別圖提案-格式規範.md` Rule 1～4 | 新增 | 類別變更狀態、成員與關係標記、類別圖範圍、設計說明與實作順序的一致性 | E2～E5；C2～C5 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `templates/class-diagram-proposal.md` 與 `templates/class-diagram-proposal.example.md`（使用者已定稿，不改寫） | E1 | C1 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 12 | +12 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 4 | +4 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- Phase 與步驟：新建模式，三個 Phase 分別對應產出提案（E1～E7）、確認閘門（E8）與按圖開發（E9）。
- RuleFile 與 Rule：E2～E5 的判斷需要設計語意與正反例，樣板組無法逐類別保證，因此建立一個以「類別圖提案內容」為主題的 RuleFile。
- 腳本：沒有。變更狀態與範圍判斷需要語意，無法由程式判斷；渲染以既有 Mermaid 工具的單一命令完成，不另建腳本。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 提案檔的段落順序、Mermaid 主題設定、圖例表，以及各變更狀態對應的 stereotype 與樣式類別 | P1-5 | 類別圖提案樣板組 | 約束的是整份提案檔的結構與固定字面內容；判斷結果無法由腳本產生 |
| C2 | 每個類別依「程式碼現況」判定一種變更狀態：不存在的為新增；存在且本次改變成員或行為的為修改；存在且本次刪除的為刪除；存在、不修改、只呈現協作關係的為既有 | P1-3 | `rules/類別圖提案-格式規範.md` Rule 1 | 需要比對程式碼與需求的語意，腳本無法判斷；樣板只能提供標記，不能決定每個類別的狀態；需要正反例 |
| C3 | 只在修改類別的成員結尾標 `«new»`、`«changed»`、`«removed»`；新增或移除的關係在標籤結尾標 `«new»`、`«removed»`，兩端都是新增類別的關係不另標；新增與刪除類別的成員不另標 | P1-3 | `rules/類別圖提案-格式規範.md` Rule 2 | 判斷成員或關係是否為本次變動需要語意；需要正反例 |
| C4 | 類別圖只納入新增、修改、刪除的類別與其直接協作的既有類別；成員只列本次變動的成員與說明協作所需的公開成員，不列私有欄位、存取器與測試類別 | P1-3 | `rules/類別圖提案-格式規範.md` Rule 3 | 取捨範圍需要判斷，腳本與樣板無法保證；需要正反例 |
| C5 | 設計說明逐一涵蓋圖中每個類別並註明狀態；實作順序依相依先後排列，刪除類別排在其依賴者改寫之後；圖、說明、順序提到的類別一致 | P1-3 | `rules/類別圖提案-格式規範.md` Rule 4 | 樣板只固定段落，不能保證內容互相對應；需要判斷與正反例 |
| C6 | 類別圖必須以 Mermaid 渲染工具實際渲染成功 | P1-6 | P1-6 步驟內文 | 既有工具的單一命令即可完成，不另建腳本；一句話即可表達 |
| C7 | 提案檔寫入 `specs/plan/<NN>-<本次計畫名稱>/class-diagram-proposal.md`，`<NN>` 為既有最大兩位數編號加一，沒有時為 `01` | P1-5 | P1-5 步驟內文 | 只屬於單一步驟，一句話即可表達，不需要正反例 |
| C8 | 使用者明確確認提案前不修改程式碼 | P2-2 | SOP 流程 | 屬於使用者確認閘門 |
| C9 | 確認後依提案檔「實作順序」修改程式碼，執行測試並回報結果 | P3-2～P3-4 | SOP 流程 | 屬於執行順序 |
| C10 | 開發中需要改變類別圖時，返回 Phase 1 修訂並重新取得確認 | P3-3 | SOP 流程 | 屬於分支與 Phase 轉移 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `SKILL.md` frontmatter | 撰寫 `name` 與 `description` | 無 | 已完成 |
| 2 | W2 | `skill-form-sop` | `SKILL.md` SOP | 寫入胖 SOP | C2～C10 | 已完成 |
| 3 | W3 | `skill-derive-rule` | Phase 1 -- 設計並產出類別圖提案的 `THINK` 設計步驟 | 抽出 `rules/類別圖提案-格式規範.md` Rule 1～4，插入載入步驟並改寫驗證步驟 | C2～C5 | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name`：`plan-with-class-diagram`
- `description` 要點：開頭標「（未驗證）」；寫程式前先產出 Mermaid 類別圖提案，標出新增、修改、刪除與既有類別，並附設計說明與實作順序；取得使用者明確確認後才依提案開發；觸發情境為使用者要求先規劃類別、先畫類別圖再寫程式，或提到 plan-with-class-diagram、類別圖提案；只需寫需求規格文件時改用 `s-specify`。

#### W2：胖 SOP

寫入下列 SOP。Phase 1 的 `THINK` 設計步驟先以內文承載 C2～C5，由 W3 抽出；樣板組已存在，因此其載入步驟直接寫入。

```markdown
## Phase 1 -- 設計並產出類別圖提案

1. `READ` 使用者需求，以及需求涉及的既有程式碼與測試（沒有既有程式碼時視為空），建立「程式碼現況」。
2. `THINK` 依使用者需求與「程式碼現況」，決定類別圖納入的類別、類別與成員及關係的變更狀態、設計說明與實作順序，並決定本次計畫名稱：每個類別依「程式碼現況」判定一種變更狀態，不存在的為新增，存在且本次改變成員或行為的為修改，存在且本次刪除的為刪除，存在、不修改、只呈現協作關係的為既有；只在修改類別的成員結尾標 `«new»`、`«changed»`、`«removed»`，新增或移除的關係在標籤結尾標 `«new»`、`«removed»`，兩端都是新增類別的關係不另標，新增與刪除類別的成員不另標；類別圖只納入新增、修改、刪除的類別與其直接協作的既有類別，成員只列本次變動的成員與說明協作所需的公開成員，不列私有欄位、存取器與測試類別；設計說明逐一涵蓋圖中每個類別並註明狀態，實作順序依相依先後排列，刪除類別排在其依賴者改寫之後，圖、說明、順序提到的類別一致。
3. `READ` `templates/class-diagram-proposal.md` 與 `templates/class-diagram-proposal.example.md`，載入骨架與範例，命名載入結果為「類別圖提案樣板組」。
4. `WRITE` 依「類別圖提案樣板組」與步驟 2 的設計建立計畫目錄，將提案檔寫入專案根目錄下的 `specs/plan/<NN>-<本次計畫名稱>/class-diagram-proposal.md`；`<NN>` 為 `specs/plan/` 下既有最大兩位數編號加一，沒有既有計畫時為 `01`。
5. `CHECK` 確認提案檔符合步驟 2 的設計要求，並以 Mermaid 渲染工具渲染提案檔中的類別圖；未通過或渲染失敗時修正提案檔後重新驗證。

完成條件：提案檔已寫入指定路徑，符合設計要求且類別圖可渲染，程式碼尚未修改。
```

Phase 2 與 Phase 3 依第 2 節 To-Be SOP 原文寫入，但其中兩處「返回 Phase 1 步驟 3」在胖 SOP 階段寫成「返回 Phase 1 步驟 2」，指向 `THINK` 設計步驟；W3 插入載入步驟後改回「步驟 3」。

> 施工差異紀錄：確認版原寫「在胖 SOP 階段指向 `THINK` 設計步驟，W3 插入載入步驟後仍為步驟 3」，但胖 SOP 的 `THINK` 設計步驟是步驟 2，步驟 3 是樣板組載入步驟。W2 施工時發現並修正為上述寫法；只影響施工中間狀態，To-Be SOP、驗收條件與約束分配不變。

#### W3：抽出 `rules/類別圖提案-格式規範.md`

- 來源：W2 胖 SOP 中 Phase 1 -- 設計並產出類別圖提案的 `THINK` 設計步驟內文。
- Rule 1（C2）：類別變更狀態依「程式碼現況」判定。
- Rule 2（C3）：成員與關係的變更標記。
- Rule 3（C4）：類別圖納入範圍與成員顆粒度。
- Rule 4（C5）：設計說明、實作順序與類別圖一致。
- 正反例情境不得使用定稿範例的訂單情境，也不得與第 7 節驗收情境的圖書館情境相同。
- After：在 `THINK` 設計步驟前插入 `READ` 載入步驟（To-Be P1-2），`THINK` 改為依已載入的「提案檢查清單」設計（To-Be P1-3），`CHECK` 改為逐條驗證「提案檢查清單」（To-Be P1-6），Phase 1 完成條件改為「通過『提案檢查清單』」，Phase 2 與 Phase 3 的「返回 Phase 1 步驟 2」改為「步驟 3」；結果須與第 2 節 To-Be SOP 一致。

## 7. 驗收情境

測試環境：暫存目錄中的小型 Python 圖書館專案，含 `library/library_service.py`（`LibraryService`：`borrow`、`return_book`，依賴 `BookDao` 與 `ReceiptPrinter`）、`library/book_dao.py`（`BookDao`）、`library/receipt_printer.py`（`ReceiptPrinter`）、`library/email_sender.py`（`EmailSender`，目前沒有被 `LibraryService` 使用）、`library/report_generator.py`（`ReportGenerator`，與借還書無關）與 `tests/`（pytest 可通過），沒有 `specs/plan/`，已 `git init` 並提交。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E8 | 本次 | `/plan-with-class-diagram` 圖書館系統要加「預約」功能：書被借走時，會員可以排隊預約；書歸還時，用現有的 EmailSender 通知排第一位的預約者。另外，借書收據不再用 ReceiptPrinter 印紙本，改用 EmailSender 寄給會員，ReceiptPrinter 改完後移除。 | Phase 2 回覆「先不要實作」 | 提案檔位於 `specs/plan/01-*/class-diagram-proposal.md`，段落依樣板組；預約相關新類別為新增；`LibraryService` 為修改，新增的預約方法標 `«new»`、改變行為的 `borrow`／`return_book` 標 `«changed»`；`ReceiptPrinter` 為刪除；`EmailSender` 為既有；`LibraryService` 到 `ReceiptPrinter` 的關係標 `«removed»`、到 `EmailSender` 的關係標 `«new»`；`ReportGenerator` 不在圖中；設計說明涵蓋圖中每個類別；實作順序中 `ReceiptPrinter` 的刪除排在 `LibraryService` 改寫之後；Mermaid 渲染成功；`git status` 只有新增的提案檔，沒有程式碼變更 |
| S2 | E1、E2、E5、E6、E9 | 本次 | `/plan-with-class-diagram` 借書超過 14 天才歸還要收逾期罰款，每天 10 元；歸還時把罰款金額記到會員帳上。 | Phase 2 回覆「確認」 | 提案檔段落依樣板組、每個類別有一種變更狀態、設計說明涵蓋圖中每個類別且 Mermaid 渲染成功；程式碼依實作順序修改，程式碼中的類別與已確認類別圖一致；pytest 已執行且結果已回報 |

## 8. 驗收結果

- 結構診斷：`plan-with-class-diagram` 為 0 個 error、0 個 warning；`rules/類別圖提案-格式規範.md` 由 P1-2 載入，樣板組由 P1-4 載入。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 均成功，結果為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- To-Be 一致性：`SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同；定稿範例 SHA-256 施工前後皆為 `e8c074d381b2c7ff26ef1d25102154283ff9e1dad87909b540fd8b51999fc65e`。
- S1 通過：子代理在暫存的 Python 圖書館專案中實際執行。提案檔位於 `specs/plan/01-book-reservation-and-email-receipt/class-diagram-proposal.md`，段落依樣板組；`ReservationQueue` 為新增，`LibraryService` 為修改（`reserve` 標 `«new»`，`borrow`、`return_book`、建構子標 `«changed»`），`ReceiptPrinter` 為刪除，`EmailSender` 與 `BookDao` 為既有；到 `ReceiptPrinter` 的關係標 `«removed»`、到 `EmailSender` 的關係標 `«new»`；`ReportGenerator` 不在圖中；設計說明涵蓋五個類別；`ReceiptPrinter` 刪除排在 `LibraryService` 改寫之後；Mermaid 渲染成功；收到「先不要實作」後停在 Phase 2 步驟 2，`git status` 只有新增的提案檔。
- S2 通過：子代理在另一份暫存專案中實際執行。提案檔段落依樣板組，五個類別各有一種變更狀態（新增 1、修改 2、既有 2），設計說明涵蓋每個類別，Mermaid 渲染成功；收到「確認」後依實作順序新增 `library/overdue_fine_policy.py` 並修改 `library/book.py`、`library/library_service.py`、`tests/test_library_service.py`；程式碼的類別與公開成員對應類別圖；`uvx pytest@8.3.4 -q -p no:cacheprovider` 結果 `5 passed`，已回報使用者。
- 子代理回報的觀察（未造成情境失敗，列為後續優化候選，需經使用者確認後以優化模式處理）：
  1. Mermaid 語法陷阱：沒有回傳型別的成員，結尾變更標記會被當成回傳型別；Python dunder 名稱會被當成粗體。兩個子代理都靠渲染後看圖才發現並自行修正，P1-6 只寫「渲染失敗」，沒有涵蓋「渲染成功但顯示錯誤」。
  2. 需求有歧義時沒有澄清步驟，兩個子代理都把假設寫進設計說明，由確認閘門把關。
  3. 樣板骨架的固定槽位（介面、刪除類別、5 條關係）用不到時是否刪除，沒有明說；兩個子代理都直接刪除。
  4. Rule 2 對「既有協作對象、本次新增用途」的關係是否算新增沒有定義；Rule 4「不得提到圖中沒有的類別」是否包含內建型別、例外與測試函式不明確。
  5. 計畫名稱的語言與格式沒有規範（兩次都用英文 kebab-case）。
