# 工程藍圖：tasks－改變既有行為時未在同一 Phase 排既有測試更新

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/46-tasks-改變既有行為時未在同一Phase排既有測試更新/`
- 根因報告：`rca-report.md`（R1、R2，使用者已確認；確認紀錄見第 9 節）
- 確認紀錄：
  - 2026-11-10 根因報告：使用者同意 E1～E7（含推定 E3、E4、E5）與 R1、R2；只改 `tasks`，不改 `implement`、`ui-plan`、`technical-research`；同意驗收情境 S1～S4。
  - 2026-11-10 工程藍圖：使用者同意 W1、W2 與第 2 節 SOP、Rule 5 全文；同意兩項刪除（Rule 5 第 2 點不分新舊的「測試任務」、Rule 5 原標題）；驗收情境 S1～S4 不變。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 某個任務會改變既有程式的行為，而既有自動化測試依賴這個行為時（例如登入後的預設頁面或頁籤、既有服務交易內對資料庫的呼叫、既有回應欄位），`tasks.md` 在同一個 Phase、排在該任務之後，有一個更新既有測試的任務；任務描述寫出要改的測試檔案、受影響的位置（測試名稱、`data-testid`、mock 物件等），以及是哪個任務的哪項行為改變造成的 | 本次 | 通用 |
| E2 | 更新既有測試的任務中寫出的每個測試檔案與位置，都實際存在於專案，並且確實依賴被改變的行為；不得寫出專案中不存在的斷言或測試（例如 007 T043 的 `isActive` 斷言） | 本次 | 通用 |
| E3 | spec 沒有明確要求測試時，User Story Phase 仍不產生「為新功能撰寫測試」的任務（Rule 5 不變）；更新既有測試的任務不受這個限制；`**Tests**:` 行寫出既有測試更新的做法 | 推定（已確認） | 通用 |
| E4 | spec 的 Success Criteria 要求前版回歸通過時，Polish 仍有一個重跑完整既有測試並量測通過率的任務；這個任務不再承接可以在前面 Phase 排定的既有測試修改 | 推定（已確認） | 通用 |
| E5 | 專案沒有既有程式與測試（第一次開發）時，不產生更新既有測試的任務，`tasks.md` 的結構與現在相同 | 推定（已確認） | 通用 |
| E6 | 依 spec 的 User Story 與 plan.md 盤點排成 Setup、Foundational、每個 User Story 一個 Phase 與 Polish，Phase 內依資料庫、後端、前端分組；每個任務有 Must Read；上游缺口寫成 Notes 待確認；`check_tasks.py` 沒有 issues；只寫入 `tasks.md` | 既有 | 通用 |
| E7 | 同目錄已有 `tasks.md` 時先詢問是否覆寫；不同意時不修改任何檔案 | 既有 | 通用 |

## 2. To-Be SOP

只改 Phase 2：在步驟 3（排任務）之後新增步驟 4（`READ` 查找既有測試依賴）與步驟 5（`THINK` 調整任務規劃），原步驟 4～6 改為 6～8，完成條件加一句。frontmatter、Phase 1、Phase 3 保留原文。

R2 的修改方向（未載入：修正載入步驟的位置或適用條件）：要載入哪些既有測試，取決於哪些任務修改既有檔案，要等步驟 3 排出「任務規劃」之後才知道。所以載入放在 Phase 2 步驟 3 之後，不放在 Phase 1 步驟 4；Phase 1 步驟 4 讀 spec 目錄的部分不變。

### `tasks/SKILL.md` Phase 2 的 To-Be（其餘不變）

````markdown
## Phase 2 -- 規劃任務

1. `READ` 規劃任務時，讀取 `rules/任務清單-格式規範.md` 的所有 Rule，建立「任務清單檢查清單」。
2. `THINK` 依「任務輸入」與已載入的「任務清單檢查清單」，為 `plan.md`「系統介面盤點」的每個介面找出 contracts、data、ui 中實作所依據的 operation、資料表或畫面，並記下上游缺口，建立「介面對照」。
3. `THINK` 依「任務輸入」、「介面對照」、「憲法檢查清單」與已載入的「任務清單檢查清單」，把工作排入 Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish，逐一寫出任務描述與 Must Read／Optional 參考，建立「任務規劃」。
4. `READ` 「任務規劃」中有任務修改專案中已存在的程式檔時，依已載入的「任務清單檢查清單」，在專案既有的自動化測試中查找依賴這些任務所改變之行為的測試，讀取命中的段落，建立「既有測試依賴」；專案沒有既有的自動化測試，或沒有任務修改已存在的程式檔時，「既有測試依賴」為空。
5. `THINK` 依「既有測試依賴」與已載入的「任務清單檢查清單」，調整「任務規劃」中更新既有測試的任務、`**Tests**:` 說明與 Polish 的回歸驗證任務；「既有測試依賴」為空時略過本步驟。
6. `THINK` 比對「憲法檢查清單」的必須／不得規則與「任務輸入」，列出和 spec 或上游產出無法同時滿足的項目，建立「憲法衝突」。
7. `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「任務規劃」；「憲法衝突」為空時略過本步驟與下一步。
8. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。

完成條件：「介面對照」涵蓋盤點表的每個介面，「任務規劃」已涵蓋每個 User Story，並已依「既有測試依賴」排入更新既有測試的任務。
````

### `tasks/rules/任務清單-格式規範.md` Rule 5 的 To-Be

Rule 1～4 保留原文。Rule 5 改寫標題與條列；Good Example、Bad Example 原有的一組改為 Example 1（原文保留），各新增 Example 2。

````markdown
# Rule 5 - 測試任務必須依 spec 的要求與既有測試的依賴而定

- spec.md 明確要求撰寫自動化測試或採用 TDD 時，每個 User Story Phase 必須在實作任務之前加入該故事的測試任務。
- spec.md 沒有明確要求時，User Story Phase 不得產生為新功能撰寫測試的任務，且 `**Tests**:` 必須說明 spec 沒有要求，以及 Setup 是否仍安裝測試工具。
- 任務會改變既有程式的行為（例如登入後的預設頁面或頁籤、既有服務在交易內對資料庫的呼叫、既有回應的欄位），而專案既有的自動化測試依賴這個行為時，必須在同一個 Phase、同一個端點組、該任務之後，加入更新這些測試的任務。這類任務不是第 1、2 點的測試任務，不受 spec 是否要求測試的限制。
- 查找依賴時，必須以任務改變的檔案、函式、畫面元素識別字（例如 `data-testid`）與預設值，在既有測試中搜尋，並讀取命中的段落確認；不得只以資料欄位或 Enum 改名的關鍵字搜尋，沒有命中就判定沒有依賴。
- 更新既有測試的任務描述必須寫出測試檔案、受影響的位置（測試名稱、`data-testid`、mock 物件等），以及造成影響的任務 ID 與行為改變；只寫出讀過、確實依賴該行為的測試，不得寫出專案中不存在的測試或斷言。
- 專案有既有的自動化測試時，`**Tests**:` 必須再寫出既有測試更新的做法；專案沒有既有測試時不寫。
- Success Criteria 中的量測要求（例如「以 100 組資料測試正確率達 100%」「1 秒內更新」「前版功能回歸測試通過率 100%」）不視為要求撰寫測試；必須在 Polish 以驗證任務處理，任務描述寫出量測方式並引用該 SC 編號。前版回歸的驗證任務只重跑完整的既有測試並記錄通過率，不承接可以在前面 Phase 排定的既有測試修改。

## Good Example

### Example 1

- spec 沒有要求測試，SC-002 要求「以 50 組預約資料測試，重複預約全部被拒絕」，Tests 說明不產生測試任務，量測放在 Polish。

```markdown
**Tests**: spec.md 沒有明確要求撰寫測試或 TDD，因此各使用者故事不產生測試任務。Setup 依 research §8 安裝測試工具，供之後需要時使用。

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T030 [P] 以 50 組預約資料呼叫 `createReservation`，確認同一讀者對同一複本的重複預約全部回 `DUPLICATE_RESERVATION`（SC-002）
```

### Example 2

- 圖書館系統第二版：spec 沒有要求測試，SC-004 要求前版功能回歸測試 100% 通過。US1 依 ui/plan §3.1 讓讀者登入後先進「我的借閱」（原本是「館藏搜尋」）；US2 依 research §3 在 `renewLoan` 的交易第一個語句加 `SELECT … FOR UPDATE`。以 `App.vue` 的預設頁面、`nav-search` 與 `renewLoan` 搜尋既有測試，讀過命中段落：`e2e/search.spec.ts` 的「搜尋館藏」登入後直接填 `search-input`；`server/tests/unit/loan.test.js` 的 `fakeClient` 只 mock 了 `update`。更新任務排在各自 Phase、同一組的實作任務之後，Polish 只重跑。

```markdown
**Tests**: spec.md 沒有明確要求撰寫測試或 TDD，因此各使用者故事不為新功能產生測試任務。Setup 沿用前一版已安裝的 Vitest 與 Playwright。任務改變既有行為、既有測試依賴該行為時，在同一個 Phase 排更新既有測試的任務；前版回歸在 Polish 重跑（SC-004）。

## Phase 3: User Story 1 - 查看我的借閱 (Priority: P1) 🎯 MVP

### 前端（F1）
- [ ] T012 [US1] 在 `web/src/App.vue` 讓讀者登入後先進入「我的借閱」……（FR-001）
- [ ] T013 [US1] 更新 `e2e/search.spec.ts` 的「搜尋館藏」測試：T012 讓讀者登入後先進「我的借閱」，登入後先點 `nav-search`，再填 `search-input`（FR-001、SC-004）
  - **Must Read**
    - `ui/plan.md` → §3.1 — Why：讀者登入後進入的頁面，以及切到館藏搜尋的導覽

## Phase 4: User Story 2 - 線上續借 (Priority: P2)

### 後端（B2）
- [ ] T016 [US2] 在 `server/services/loanService.js` 的 `renewLoan`，交易第一個語句改為以 `client.query` 執行 `SELECT … FOR UPDATE` 鎖定借閱列……（FR-004）
- [ ] T017 [US2] 更新 `server/tests/unit/loan.test.js` 的 `fakeClient`：T016 讓 `renewLoan` 的交易先呼叫 `client.query`，補上 `query` 的 mock（FR-004、SC-004）
  - **Must Read**
    - `research.md` → §3 — Why：續借交易第一個語句鎖定借閱列

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 執行 `npm run test:backend` 與 `npm run test:e2e`，確認前版既有測試 100% 通過並記錄通過率（SC-004）
  - **Must Read**
    - `spec.md` → SC-004 — Why：前版回歸的通過標準
```

## Bad Example

### Example 1

- 同一份 spec 因為 SC-002 出現「測試」兩字，就在每個 User Story 加入單元測試任務，Tests 欄也沒有說明依據。

```markdown
**Tests**: 包含測試。

## Phase 3: User Story 1 - 預約館藏 (Priority: P1) 🎯 MVP

- [ ] T010 [P] [US1] 在 `server/tests/reservationService.test.js` 撰寫 `createReservation` 的單元測試（SC-002）
```

### Example 2

- 同 Good Example 2 的情境，只以資料表改名的欄位 `is_available` 搜尋既有測試，沒有命中，仍在 Polish 寫修斷言；T012、T016 所在的 Phase 沒有更新任務，US1、US2 的 Checkpoint 都帶著既有測試失敗。

```markdown
**Tests**: spec.md 沒有明確要求撰寫測試或 TDD，因此各使用者故事不產生測試任務。前版回歸放在 Polish 處理。

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 修正前版既有測試中依賴 `is_available` 的斷言，再執行 `npm run test:backend` 與 `npm run test:e2e`，確認前版回歸 100% 通過（SC-004）
```
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 第 2 點「User Story Phase 不得產生測試任務」中不分新舊的「測試任務」 | `rules/任務清單-格式規範.md` Rule 5 第 2 點 | R1：字面把「更新既有測試」也算成禁止的測試任務，和 E1 相反。改寫成「不得產生為新功能撰寫測試的任務」（列在下表「修改」）。**刪除後的影響**：只放寬既有測試更新，新功能測試的規定不變（E3） |
| Rule 5 標題「測試任務必須依 spec 是否明確要求而定」 | Rule 5 標題 | R1：標題只有 spec 一個依據。改寫成「依 spec 的要求與既有測試的依賴而定」 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| Rule 5 標題 | 修改 | 加上「既有測試的依賴」 | R1；E1、E3；C14 |
| Rule 5 第 2 點 | 修改 | 「測試任務」改為「為新功能撰寫測試的任務」；其餘原文保留 | R1；E3；C14 |
| Rule 5 第 3 點 | 新增 | 任務改變既有行為、既有測試依賴時，同一 Phase、同一組、該任務之後排更新任務；不算第 1、2 點的測試任務 | R1（缺失）；E1、E3；C15 |
| Rule 5 第 4 點 | 新增 | 以任務改變的檔案、函式、畫面識別字與預設值搜尋，讀取命中段落確認；不得只用欄位或 Enum 改名關鍵字 | R2；E2；C16 |
| Rule 5 第 5 點 | 新增 | 更新任務寫出測試檔案、位置、造成影響的任務 ID 與行為改變；只寫讀過、確實依賴的測試 | R1、R2；E1、E2；C17 |
| Rule 5 第 6 點 | 新增 | 有既有測試時 `**Tests**:` 寫出更新做法；沒有時不寫 | E3、E5；C18 |
| Rule 5 第 7 點（As-Is 第 3 點） | 修改 | 例子加上「前版功能回歸測試通過率 100%」；加一句「前版回歸的驗證任務只重跑，不承接可在前面 Phase 排定的修改」 | E4；C19 |
| Rule 5 Good Example 2、Bad Example 2 | 新增 | 圖書館系統第二版（不是 003～007 的驗收領域）。Good：預設頁面與交易鎖兩種行為改變，更新任務排在同一 Phase 同一組之後，Polish 只重跑；Bad：本次的失敗型態（用欄位改名關鍵字搜尋、Polish 修不存在的斷言） | R1、R2；E1～E4；C15～C19 |
| Rule 5 原 Good／Bad Example | 修改 | 改名為 Example 1，內文保留原文 | E3；C14、C19 |
| `SKILL.md` Phase 2 步驟 4（新） | 新增 | `READ`：任務規劃中有任務修改已存在的程式檔時，依檢查清單查找依賴的既有測試，讀取命中段落，建立「既有測試依賴」；沒有時為空 | R2（未載入）；E2、E5；C9 |
| `SKILL.md` Phase 2 步驟 5（新） | 新增 | `THINK`：依「既有測試依賴」調整更新任務、`**Tests**:` 與 Polish 回歸任務；為空時略過 | R1、R2；E1、E3、E4；C10 |
| `SKILL.md` Phase 2 原步驟 4～6 | 修改（只改編號） | 改為步驟 6～8，內文保留原文；原步驟 5 的「略過本步驟與下一步」仍指向 CHECK | E6；C11、C12 |
| `SKILL.md` Phase 2 完成條件 | 修改 | 加上「並已依「既有測試依賴」排入更新既有測試的任務」 | E1；概述，不是存放位置 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（name、description） | 觸發與分流；本次不改變觸發，description 是概述 | — |
| Phase 1 步驟 1～8 與完成條件 | E6、E7（目標 spec、上游文件、憲法、plan.md 檢查、覆寫確認）；步驟 4 讀 spec 目錄的部分仍是任務的依據，既有測試改在 Phase 2 步驟 4 載入 | C1～C6 |
| Phase 2 步驟 1～3 | E6；步驟 3 只引用檢查清單 | C7、C8 |
| Phase 3 步驟 1～5 與完成條件 | E6（樣板、寫入、腳本、逐條驗證、回報）；步驟 4 逐條驗證整份檢查清單，已涵蓋新 Rule 5 | C20～C25 |
| `rules/任務清單-格式規範.md` Rule 1～4 | E6 | C13 |
| tasks 樣板組（`templates/tasks.md`、`tasks.example.md`） | E6、E5；樣板的 `**Tests**: {{TESTS_POLICY}}` 由 Rule 5 決定內容；範例是第一次開發的 004 購物車，沒有既有測試，依 Rule 5 第 6 點不寫既有測試做法，和新規則一致 | C21 |
| `scripts/check_tasks.py` | E6；不檢查測試任務位置，新 Rule 5 不需要腳本配合 | C23 |
| 下游 `implement` | 更新既有測試的任務在描述中寫出測試檔案，implement Rule 1 第 7 點「只改任務描述提到的檔案」允許修改；不需改 | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 19 | 21 | +2 |
| RuleFile | 1 | 1 | 0 |
| Rule | 5 | 5 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 1 | 0 |

- 步驟 +2 的理由（R2；E1、E2、E5）：依序考慮刪除、改寫、改換存放位置與新增。
  - 刪除：R2 是未載入，沒有錯誤內容可刪。
  - 改寫：Phase 1 步驟 4 在排任務之前執行，還不知道哪些任務修改既有檔案，無法決定要讀哪些測試；Phase 2 步驟 3 是 `THINK`，不能混入讀檔動作。
  - 改換存放位置：載入的是專案的既有測試，不是 Skill 的部位，不能交給腳本或樣板；查找方法已放在 Rule 5 第 4 點。
  - 新增：步驟 4 是載入（修正載入的位置），步驟 5 依載入結果調整規劃。沒有步驟 5，調整只會留到 Phase 3 步驟 4 的 `CHECK` 才修正，那是在症狀出現的位置補償。
- Rule 數不變：R1 是缺失，依約束分配 Rule 3（同主題集中），測試任務的主題已有 Rule 5，所以改寫 Rule 5、新增條列，不新增 Rule。刪改了第 2 點的範圍與標題。
- 內容增減：Rule 5 由 3 個條列、正反例各 1 組，改為 7 個條列、正反例各 2 組。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 讀取需求與 spec 清單，決定目標 spec，缺少或多份時停止 | P1-1～P1-3 | SOP 流程 | 分支與停止；既有，不變 |
| C2 | 讀取 spec、plan、techstack、research 與 `contracts/`、`data/`、`ui/` | P1-4 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C3 | 讀取憲法檔並列出鎖定項目 | P1-5 | 步驟內文 | 單一步驟；既有，不變 |
| C4 | 沒有 plan.md 時停止 | P1-6 | SOP 流程 | 分支；既有，不變 |
| C5 | 已有 tasks.md 的覆寫確認 | P1-7、P1-8 | SOP 流程 | 使用者確認閘門；既有，不變 |
| C6 | 上游缺口寫成待確認（介面對照的上游缺口） | P2-2 | 任務清單 Rule 4 | 既有，不變 |
| C7 | 規劃前載入任務清單檢查清單 | P2-1 | SOP 流程 | 載入時機；既有，不變 |
| C8 | Phase 的排法（Setup、Foundational、每個 User Story、Polish） | P2-3 | 任務清單 Rule 1 | 既有，不變 |
| C9 | 排完任務後，任務修改已存在的程式檔時才查找既有測試依賴；沒有既有測試或沒有修改時為空 | P2-4（新） | SOP 流程 | 載入時機與適用條件（分支）；查找方法不在這裡，由 C16 規定 |
| C10 | 依既有測試依賴調整規劃；為空時略過 | P2-5（新） | SOP 流程 | 分支（略過）；調整內容由 C15、C17～C19 規定，步驟只引用檢查清單 |
| C11 | 憲法衝突的建立 | P2-6 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C12 | 憲法衝突委派 `clarify`（以路徑讀取），沒有 `clarify` 或未回覆時停止 | P2-7、P2-8 | SOP 流程 | 委派與分支；既有，不變 |
| C13 | 任務描述可直接實作、Must Read／Optional 綁定部位、上游缺口待確認 | P2-3、P3-4 | 任務清單 Rule 2～4 | 既有，不變 |
| C14 | spec 要求測試時 US Phase 先排測試任務；沒要求時不為新功能寫測試，`**Tests**:` 說明 spec 沒要求與 Setup 是否安裝工具 | P2-3、P3-4 | 任務清單 Rule 5 第 1、2 點 | 既有，改寫第 2 點的範圍；需要判斷且有正反例；同主題，留在 Rule 5 |
| C15 | 任務改變既有行為且既有測試依賴時，同一 Phase、同一組、該任務之後排更新任務；不算第 1、2 點的測試任務 | P2-5、P3-4 | 任務清單 Rule 5 第 3 點 | 腳本無法判斷哪項行為被哪些測試依賴；不是整份檔案結構，樣板無法保證；需要判斷與正反例；和 C14 同主題，放同一條 Rule 才能界定兩者的關係 |
| C16 | 以任務改變的檔案、函式、畫面識別字與預設值搜尋，讀取命中段落確認；不得只用欄位或 Enum 改名關鍵字 | P2-4、P3-4 | 任務清單 Rule 5 第 4 點 | 查找方法需要判斷，本次的失敗型態要用 Bad Example 才能一致執行；步驟內文一句話寫不出正反兩面。腳本無法判斷搜尋關鍵字是否對應行為 |
| C17 | 更新任務描述寫出測試檔案、位置、造成影響的任務 ID 與行為改變；只寫讀過、確實依賴的測試 | P2-5、P3-4 | 任務清單 Rule 5 第 5 點 | 同 C15 |
| C18 | 有既有測試時 `**Tests**:` 寫出更新做法；沒有時不寫 | P2-5、P3-4 | 任務清單 Rule 5 第 6 點 | `**Tests**:` 的內容要依專案狀態判斷；樣板只有佔位字；同主題 |
| C19 | SC 量測放在 Polish；前版回歸驗證任務只重跑，不承接可在前面 Phase 排定的修改 | P2-3、P2-5、P3-4 | 任務清單 Rule 5 第 7 點 | 既有（第 3 點）加一句；同主題 |
| C20 | 寫入前載入 tasks 樣板組 | P3-1 | SOP 流程 | 載入時機；既有，不變 |
| C21 | tasks.md 的整體結構與固定段落 | P3-2、P3-4 | tasks 樣板組 | 既有，不變 |
| C22 | 標題、Reference Loading Contract 第 4 點、User Story Phase 數、語言的填寫要求，不建立其他檔案 | P3-2 | 步驟內文 | 既有，不變 |
| C23 | ID、標籤、參考行、部位識別字、介面涵蓋、需求引用、待確認對應的檢查 | P3-3 | `scripts/check_tasks.py` | 既有，不變 |
| C24 | 驗證順序、憲法優先、鎖定項目、最多 3 輪 | P3-4 | SOP 流程 | 迴圈與優先順序；既有，不變 |
| C25 | 回報項目 | P3-5 | 步驟內文 | 既有，不變 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `.agents/skills/tasks/SKILL.md` Phase 2 | 依第 2 節 To-Be 新增步驟 4、5，原步驟 4～6 改編號，修改完成條件 | C9～C12 | 已完成 |
| 2 | W2 | `skill-form-rule` | `.agents/skills/tasks/rules/任務清單-格式規範.md` Rule 5 | 依第 2 節 To-Be 改寫 Rule 5 的標題、條列與正反例 | C14～C19 | 已完成 |

施工順序依施工委派 Rule 3：沒有刪除部位檔案與 frontmatter 修改；先 SOP（W1），再修改既有部位內容（W2）；沒有抽取工作項。新步驟 4 讀的是專案的既有測試，不是 Skill 的部位，所以不改變部位的載入步驟；Rule 5 已由 Phase 2 步驟 1 整份載入，W2 交給 `skill-form-rule`。施工後執行 `./scripts/sync-skills.sh --from agents` 與 `--check`。

### 工作項內容

- **W1**：在 `SKILL.md`「## Phase 2 -- 規劃任務」中：
  1. 在以「`THINK` 依「任務輸入」、「介面對照」、「憲法檢查清單」」開頭的步驟（建立「任務規劃」）之後，插入第 2 節 To-Be 的步驟 4（以「`READ` 「任務規劃」中有任務修改專案中已存在的程式檔時」開頭）與步驟 5（以「`THINK` 依「既有測試依賴」」開頭）全文。
  2. 原「`THINK` 比對「憲法檢查清單」」、「`DELEGATE` 「憲法衝突」不為空時」、「`CHECK` 兩個 `SKILL.md` 都不存在時」三個步驟改編號為 6、7、8，內文不變。
  3. 完成條件改為第 2 節 To-Be 的完成條件全文。
  其他 Phase 與 frontmatter 不變。
- **W2**：把 `rules/任務清單-格式規範.md` 的 Rule 5（從「# Rule 5」到檔案結尾）整段換成第 2 節 To-Be「# Rule 5 - 測試任務必須依 spec 的要求與既有測試的依賴而定」全文。Rule 1～4 不變。

## 7. 驗收情境

共同環境：每個情境用獨立的暫存目錄 `/tmp/acc46/sN`。以 `git archive <commit> <路徑> | tar -x` 展開；複製修改後的 `.agents`、`.claude`（排除 `node_modules`）、`AGENTS.md`、`CLAUDE.md`；`git init` 並 commit 一次當作基準。驗收子代理以 Agent 工具指定 `subagent_type: general-purpose`、`model: sonnet`、`effort: medium`，平行執行；只提供 Skill 路徑（讀 SKILL.md，不用 Skill 工具）、環境位置、使用者輸入與預先回覆，回報確認閘門內容、最終回報原文、`git status --short` 與 `git diff --stat`。主 session 自己打開 `tasks.md` 核對。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E4、E6 | 原始輸入（iter-5） | `git archive 96ef51b specs apps/equipment-loan`（`apps/` 是 006 版本）；刪除 `specs/007-equipment-maintenance-retire/tasks.md`。使用者輸入：「為 `specs/007-equipment-maintenance-retire/spec.md` 產出 tasks.md」 | `clarify` 提問時每題選推薦選項 | (1) 有任務讓管理員登入後先進「設備狀態管理」時，同一個 Phase、排在它之後有任務更新 `e2e/equipment-loan.spec.ts` 與 `e2e/reschedule.spec.ts` 中管理員登入後操作「審核與借用管理」的位置；(2) 有任務在改期交易加入鎖定設備列的查詢時，同一個 Phase、排在它之後有任務更新 `backend/tests/unit/reschedule.test.ts` 的 `fakeTx`；(3) 所有更新既有測試的任務寫出的檔案與位置都在 `apps/equipment-loan/` 中存在，沒有 `isActive`／`unavailable` 斷言這類不存在的項目；(4) User Story Phase 沒有為新功能撰寫測試的任務，`**Tests**:` 寫出既有測試更新的做法；(5) Polish 有重跑完整既有測試的任務（SC-005），不承接修改；(6) `check_tasks.py` 沒有 issues，`git status` 只有 `tasks.md`。產出沒有排出 (1) 或 (2) 的行為改變時，該項記為「未觸發」，以 S2 判斷 E1 |
| S2 | E1～E4、E6 | 原始輸入（iter-4 同類） | `git archive b4253c2 specs apps/equipment-loan`（`apps/` 是 005 版本）；刪除 `specs/006-reservation-reschedule/tasks.md`。使用者輸入：「為 `specs/006-reservation-reschedule/spec.md` 產出 tasks.md」 | 同 S1 | (1) 有任務把管理員待審區塊預設改成「改期申請」分頁時，同一個 Phase、排在它之後有任務更新 `e2e/equipment-loan.spec.ts` 中核准、駁回 `RV-20261109-08`／`RV-20261109-09` 這一段（第 97 行附近），補上切換到「預約申請」分頁；(2) 同 S1 判斷 (3)～(6) |
| S3 | E3、E5、E6 | 回歸（第一次開發） | `git archive 3a890f8 specs`（沒有 `apps/`）；刪除 `specs/003-equipment-loan-booking/tasks.md`。使用者輸入：「為 `specs/003-equipment-loan-booking/spec.md` 產出 tasks.md」 | 同 S1 | 沒有更新既有測試的任務；`**Tests**:` 依 Rule 5 寫出 spec 是否要求測試，沒有既有測試的做法；Phase 結構符合 E6；`check_tasks.py` 沒有 issues；`git status` 只有 `tasks.md` |
| S4 | E7 | 回歸 | 同 S1 的環境，但保留 `tasks.md`。使用者輸入同 S1 | 覆寫確認回答「不同意」 | 先詢問是否覆寫；回覆後停止，`git status` 沒有變更，`tasks.md` 雜湊值不變 |

直接呼叫者：無（結構診斷 `callers.tasks` 為空），不需要呼叫者回歸情境。

## 8. 驗收結果

### 8.1 施工與結構

- W1、W2 已完成。W1 依 `skill-form-sop` 的 SOP 格式規範 Rule 1～5 逐條驗證通過；W2 依 `skill-form-rule` 的 RuleFile 格式規範逐條驗證通過，`git diff` 只刪除 Rule 5 的標題、第 2 點與第 3 點原句（第 3 點改寫為第 7 點），Example 1 原文保留。
- 施工後結構診斷：`audit_skill.py --skill tasks`，errors 0、warnings 0，沒有 findings。
- 同步：`./scripts/sync-skills.sh --from agents` 退出狀態 0；`--check` 為「兩邊一致」。同步輸出沒有「只存在於目標端」的 Skill。`git status` 只有 `tasks` 的 `SKILL.md` 與 `rules/任務清單-格式規範.md`（兩邊各一份）與本紀錄目錄。
- To-Be 一致性：`SKILL.md` Phase 2 與第 2 節 To-Be 逐字相同（步驟 4、5 新增，6～8 只改編號，完成條件已改）；Rule 5 與第 2 節 To-Be 逐字相同（由藍圖原文替換）；frontmatter、Phase 1、Phase 3、Rule 1～4、樣板組、腳本未修改。

### 8.2 驗收方式

- 驗收模型：Sonnet（Agent 工具 `model: sonnet`）、推理強度 medium（`effort: medium`），`subagent_type: general-purpose`，4 個情境平行執行。
- 每個情境的環境：`/tmp/acc46/sN`，以 `git archive` 展開，複製修改後的 `.agents`、`.claude`（排除 `node_modules`）、`AGENTS.md`、`CLAUDE.md`，`git init` 後 commit 當基準（s1 `2bdf4ff`、s2 `9858089`、s3 `6bee626`、s4 `fdfddad`）。
- 委派內容只有 Skill 路徑（讀 SKILL.md，不用 Skill 工具）、環境位置、使用者輸入與預先回覆；沒有分析脈絡。
- 主 session 打開每份 `tasks.md` 核對，在環境內重跑 `check_tasks.py`，並在環境的 `apps/equipment-loan/` 中以 `grep` 確認更新任務寫出的測試位置存在。

### 8.3 各情境結果

| 情境 | 結果 | 依據 |
| ---- | ---- | ---- |
| S1（007，`apps/` 為 006 版） | 通過（判斷 (1) 未觸發） | (1) 未觸發：子代理沒有排「管理員登入後先進設備狀態管理」，記為 Notes 待確認 1（ui/plan §3.1 與 research §4、plan.md 不一致），T012 確認登入後預設頁維持 006 行為，所以既有 e2e 不受影響。(2) 通過：US1 後端組 T021 在 `createRescheduleRequest` 加入鎖定設備列，T022 緊接在後，更新 `backend/tests/unit/reschedule.test.ts` 的 `fakeTx` 補 `$queryRaw`，並列出「可改期條件：createRescheduleRequest 的拒絕判斷（FR-001）」的 5 個測試（該 describe 在第 168 行）。另有 Foundational 前端組 T011 更新 `frontend/tests/unit/zh-TW.test.ts` 的 `toHaveLength(19)`（第 12 行存在），由 T010 新增 2 個錯誤碼造成。(3) 通過：沒有 `isActive`／`unavailable` 斷言這類不存在的項目。(4) 通過：US Phase 沒有新功能測試任務；`**Tests**:` 寫出既有測試更新的做法。(5) 通過：Polish T047 只重跑 backend、frontend、e2e 並記錄通過率（SC-005、FR-018）。(6) 通過：`check_tasks.py` issues 0、warnings 0；`git status` 只有 `tasks.md`。沒有確認閘門 |
| S2（006，`apps/` 為 005 版） | 通過 | (1) 通過：US2 前端組 T028 把待審區塊改成「改期申請」「預約申請」兩個分頁、預設「改期申請」，T029 緊接在後，更新 `e2e/equipment-loan.spec.ts`，在 `approve-btn-RV-20261109-08`（第 98 行）之前先點 `admin-pending-tab-reservation`。另排 T010（`zh-TW.test.ts` 錯誤碼數量，Foundational）、T042（`UI_TEXT.slotStatus` 的 `toEqual`，US3）、T047（第 196 行「已取消已核准／有效預約 RV-20261108-04」，US3）、T049（第 84 行「已完成登記領取！預約編號 RV-20261108-06」，US3），各自排在造成影響的任務之後；寫出的位置都在檔案中存在。(2) 通過：沒有不存在的斷言；US Phase 沒有新功能測試；`**Tests**:` 寫出做法；Polish T056 只重跑並記錄通過率（SC-006）；`check_tasks.py` issues 0、warnings 0；`git status` 只有 `tasks.md`。沒有確認閘門 |
| S3（003，沒有 `apps/`） | 通過 | 子代理回報「專案內沒有既有的自動化測試，所以「既有測試依賴」為空」；`tasks.md` 沒有更新既有測試的任務；`**Tests**:` 只寫 spec 沒有要求、Setup 安裝工具、SC 量測放在 Polish，沒有既有測試的做法；Phase 為 Setup、Foundational、US1～US3、Polish；`check_tasks.py` issues 0、warnings 0；`git status` 只有 `tasks.md`。沒有確認閘門 |
| S4（覆寫確認） | 通過 | 子代理在 Phase 1 步驟 7 詢問是否覆寫，收到「不同意」後回報「沒有修改既有 `tasks.md`，也沒有產出任何檔案」並停止；`git status` 為空，`tasks.md` 雜湊值 `0108adf0…` 與基準相同 |

### 8.4 觀察（不列為根因）

1. S1 沒有觸發「管理員登入後預設頁改變」：子代理依 research §4 與 plan.md 不新增頁面，把 ui/plan §3.1 的獨立頁面記為待確認 1。這是上游不一致時的處理，屬於 Rule 4 的範圍，和本次修改無關；E1 的頁籤情境由 S2 證明。
2. S2 子代理第 1 次執行 `check_tasks.py` 有 2 個 issues：Optional 參考指向程式檔（`reservationService.ts`、`taipeiTime.ts`），刪除後通過。Rule 3 與腳本已擋下，和本次修改無關。
3. S2 的 T047、T049 會改既有斷言的預期文字，原因是同一次規劃中 T046、T048 依 ui/plan 改了橫幅文字。Rule 5 沒有禁止修改斷言，只要求寫出依賴與原因，這兩項都寫出了。

### 8.5 個案驗收條件的調整建議

無。本次所有驗收條件都是通用。
