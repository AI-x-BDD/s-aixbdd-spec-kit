# 工程藍圖：artifact-to-skill-engineering－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/08-artifact-to-skill-engineering-建立/`
- 根因報告：無（新建模式略過 Phase 2）
- 確認紀錄：使用者於 Phase 4 回覆「同意」：同意全部驗收條件，含推定的 E1 後半（不修改參考範例原檔）、E8（缺輸入樣本時由 AI 擬推定樣本）、E9（外部來源附來源與授權）、E10（回報內容），以及 frontmatter 設 `disable-model-invocation: true`；無刪除項目；同意全部施工工作項
- 設計依據：
  - 課程第三章〈【基因工程】改造屬於自己的 SDD 工作流：/specify〉：Artifact-First 四步（範例放進 `templates/`、依需求直接改範例並以 clarify 釐清、`skill-form-template` 倒抽樣板、`skill-engineering` 以樣板為目標後設反推 SOP 與 rules）；劃界 Prompt「完全不要參考 Spec-Kit、不要做落差分析」。
  - 課程第三章〈【基因工程】提煉 Artifact-First 流程：/artifact-to-skill-engineering〉：課程版 Skill 的 5 個 Phase（收斂參考 Artifact 與目標 Skill 目前階段、互動式定稿 Example、從 Example 反向抽 Template 並委派 `skill-form-template`、以模板反推 Skill 並委派 `skill-engineering`、驗證單一溯源並交付）。
  - 本 repo 建立 `s-specify` 的實際過程：範例依課程改造後，以 `/skill-form-template` 產出 `spec.template.md`，再交給 `skill-engineering`（紀錄 01）；施工後 `audit_skill.py` 回報 `TPL001`，骨架改名為 `spec.md` 才與範例 `spec.example.md` 成對。採納 `speckit-specify` 優點（紀錄 03）屬於課程「比較 v1 與 v2」步驟，不在 Artifact-First 四步之內。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 參考範例放在目標 Skill 的 `.agents/skills/<目標 Skill 名稱>/templates/<樣板名字>.example.<格式>`；參考範例原檔內容不變 | 本次：課程 /specify 單元第一步「先把 Artifact 放在新的 Skill 的 templates 裡面」；檔名依本 repo `skill-form-template` Rule 1；不改原檔為推定，理由是原檔屬參考來源，本 Skill 只需要副本 | 通用 |
| E2 | 使用者明確確認範例定稿前，目標 Skill 的 `templates/` 不出現骨架 `<樣板名字>.<格式>`，也不委派 `skill-engineering` | 本次：課程 /artifact-to-skill-engineering 單元「等使用者說 OK，這個版本我滿意了，接下來第三步就是抽 Template」 | 通用 |
| E3 | 使用者的客製化需求直接改寫在範例檔內容上；範例是具體實例，不含填位符號；客製化需求有歧義時先經 `clarify` 提問，使用者回答後才修改 | 本次：課程 /specify 單元 Prompt「直接去改這個檔案，以此檔案來呈現我需求改變後的樣貌⋯⋯如果需求不清楚或有歧義，請你 clarify」、「要搬就搬最具體的範例」；〈/system-analysis〉單元「這不是 Template，改成 plan.example.md，要具體範例」 | 通用 |
| E4 | 骨架 `templates/<樣板名字>.<格式>` 由 `skill-form-template` 依定稿範例建立，與範例使用相同樣板名字；骨架建立後與交付時，範例內容與使用者確認定稿時相同 | 本次：課程 /artifact-to-skill-engineering 單元第三步與 Phase 5「Example 先被定稿，Template 由 Example 抽出」；命名成對來自紀錄 01 的 `TPL001` | 通用 |
| E5 | 委派 `skill-engineering` 時，委派內容包含：樣板組是目標 Skill 必須產出的 Artifact、產出範例時的輸入樣本、後設反推從輸入到 Artifact 的推理流程、先寫最簡 SOP 再視需要增加 rules 或 scripts、避免過度工程、樣板組保留不改寫，以及不讀取參考來源中範例以外的內容、不做與參考來源的落差分析 | 本次：課程 /specify 單元反推 Prompt 與劃界 Prompt；課程 /artifact-to-skill-engineering 單元第四步 | 通用 |
| E6 | 交付時，目標 Skill 的 SOP 有步驟載入這組骨架與範例作為產出格式，且目標 Skill 的 `templates/` 沒有另一組產出同一種檔案的樣板組 | 本次：課程 /artifact-to-skill-engineering 單元 Phase 5「會以這個 Artifact 的模板範例作為目標的產出物，而不是平行新增第二套規格」 | 通用 |
| E7 | 依目標 Skill 目錄的現況判定起始階段並告知使用者；骨架與範例都已存在且沒有新的客製化需求時，不重新定稿、不重抽骨架，直接進入反推 | 本次：課程 /artifact-to-skill-engineering 單元 Phase 1「了解目前在哪個階段」，實測時 AI 判定「目前的 Example 還沒有被客製化」 | 通用 |
| E8 | 使用者沒有提供產出範例時的輸入樣本時，由 AI 依定稿範例擬一段輸入樣本，在委派內容中標為推定 | 推定：課程中老師找回了原始 Prompt，但從別處拿到的產出物不一定有原始輸入；反推時必須有輸入樣本 | 通用 |
| E9 | 參考範例來自外部專案時，委派內容附上來源網址與授權 | 推定：CLAUDE.md 規則 3 要求衍生外部內容的 Skill 放 `LICENSE` 並更新根目錄 `LICENSE`；`skill-engineering` 需要來源資訊才能處理（紀錄 01 的 W6） | 通用 |
| E10 | 完成回報包含目標 Skill 路徑、樣板組路徑、`skill-engineering` 紀錄目錄與驗收結果摘要，以及單一溯源檢查結果；未通過的檢查逐項列出 | 推定：Skill 結束時必須決定回報內容 | 通用 |

## 2. To-Be SOP

````markdown
---
name: artifact-to-skill-engineering
disable-model-invocation: true
description: 以一份具體的產出物範例（Artifact）為目標建立 Skill 時使用（Artifact-First）：使用者手上有別的工具產出的檔案或自己想要的產出樣貌，想打造一個能穩定產出同格式檔案的 Skill。會先和使用者把範例改到定稿、取得明確確認後，才倒抽樣板並交給 skill-engineering 反推 SOP 與 rules。使用者提到 artifact-first、artifact-to-skill、以範例反推 skill、參考某份產出物做 skill、基因工程時使用。沒有範例、直接描述 Skill 需求時改用 skill-engineering；只為既有 Skill 的某個步驟抽樣板時改用 skill-derive-template；只修改樣板內容時改用 skill-form-template；產出物是程式碼等無法樣板化的內容時不使用此 Skill。
---

# SOP

## Phase 1 -- 收斂參考範例與目前階段

1. `READ` 使用者需求，取得目標 Skill 名稱、參考範例的檔案路徑、參考範例的來源與授權、產出參考範例時的輸入樣本，以及客製化需求，建立「任務輸入」。
2. `READ` 專案根目錄 `.agents/skills/<目標 Skill 名稱>/` 下的 `SKILL.md` 與 `templates/` 檔案清單（目錄或檔案不存在時視為空），建立「目標 Skill 現況」。
3. `THINK` 依「任務輸入」與「目標 Skill 現況」決定樣板名字與格式，並判定起始階段：`templates/` 已有 `<樣板名字>.<格式>` 與 `<樣板名字>.example.<格式>` 且「任務輸入」沒有客製化需求時為「反推 Skill」，已有範例但不符合前述條件時為「定稿範例」，沒有範例時為「放入範例」；同時列出缺少的輸入（目標 Skill 名稱，以及起始階段為「放入範例」時的參考範例路徑），建立「階段判定」。
4. `CHECK` 「階段判定」沒有缺少的輸入時進入步驟 7；有缺少的輸入時進入步驟 5。
5. `WRITE` 向使用者索取「階段判定」列出的缺少輸入。
6. `CHECK` 使用者回覆：補齊時返回步驟 1；未補齊時停止執行。
7. `WRITE` 起始階段為「放入範例」時，將參考範例複製為 `.agents/skills/<目標 Skill 名稱>/templates/<樣板名字>.example.<格式>`，不修改參考範例原檔。
8. `WRITE` 向使用者回報「階段判定」的樣板名字、範例路徑、起始階段與接下來的步驟。

完成條件：「階段判定」已決定樣板名字、格式與起始階段，目標 Skill 的 `templates/` 已有範例，且已向使用者回報起始階段。

## Phase 2 -- 互動定稿範例

1. `CHECK` 起始階段為「反推 Skill」時，執行 `shasum -a 256 <範例路徑>` 將結果記為「定稿雜湊」，略過 Phase 2 與 Phase 3，進入 Phase 4。
2. `READ` 目標 Skill 的範例 `templates/<樣板名字>.example.<格式>`，建立「範例現況」。
3. `THINK` 依「範例現況」與「任務輸入」的客製化需求，盤點會改變範例修改方式的歧義與未決定事項，建立「客製化缺口」。
4. `DELEGATE` 「客製化缺口」不為空時，委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取 `clarify` 的 `SKILL.md` 並依其 SOP 執行），以「客製化缺口」為優先提問面向、不要求詳記問答紀錄，取得已確認決策，建立「客製化決策」；「客製化缺口」為空時略過本步驟。
5. `READ` 修改範例時，讀取 `rules/範例定稿-格式規範.md` 的所有 Rule，建立「範例定稿檢查清單」。
6. `WRITE` 依已載入的「範例定稿檢查清單」，以客製化需求與「客製化決策」直接修改範例檔。
7. `CHECK` 逐條驗證「範例定稿檢查清單」；未通過時修正範例後重新驗證。
8. `WRITE` 向使用者展示本輪對範例的修改摘要與範例路徑，請使用者確認定稿，或提出新的客製化需求。
9. `CHECK` 使用者回覆：提出新的客製化需求時，以該回覆作為客製化需求返回步驟 2；明確確認定稿時，執行 `shasum -a 256 <範例路徑>` 將結果記為「定稿雜湊」；未明確確認時停止執行。

完成條件：使用者已明確確認範例定稿，範例已通過「範例定稿檢查清單」，且「定稿雜湊」已記錄；或起始階段為「反推 Skill」，已記錄「定稿雜湊」並略過本 Phase。

## Phase 3 -- 倒抽樣板

1. `DELEGATE` 委派 `skill-form-template` Skill，以定稿範例為內容來源，在目標 Skill 的 `templates/` 建立或更新骨架 `<樣板名字>.<格式>`；委派時說明範例已經使用者定稿、不得修改範例，需要修改範例才能符合樣板規範時回報而不修改。
2. `CHECK` 執行 `shasum -a 256 <範例路徑>`：結果與「定稿雜湊」相同且骨架已建立時進入 Phase 4；`skill-form-template` 回報需要修改範例，或結果與「定稿雜湊」不同時，進入步驟 3。
3. `WRITE` 向使用者說明範例需要修改或已被修改的內容與原因。
4. `CHECK` 使用者回覆：同意修改時，以該修改作為客製化需求返回 Phase 2 步驟 2；不同意或未回覆時停止執行。

完成條件：骨架 `<樣板名字>.<格式>` 已建立，且範例的雜湊與「定稿雜湊」相同。

## Phase 4 -- 反推 Skill

1. `THINK` 「任務輸入」沒有輸入樣本時，依定稿範例擬一段使用者為產出此範例可能輸入的需求描述，命名為「推定輸入樣本」。
2. `DELEGATE` 委派 `skill-engineering` Skill 建立或優化目標 Skill，委派內容包含：樣板組 `templates/<樣板名字>.<格式>` 與 `templates/<樣板名字>.example.<格式>` 是目標 Skill 必須產出的 Artifact；輸入樣本（或標明為推定的「推定輸入樣本」）；請後設反推使用者輸入此類需求後，要經過什麼推理流程才能高可靠度地產出此 Artifact；先寫最簡 SOP，再視需要增加 rules 或 scripts，避免過度工程；樣板組已經使用者定稿，作為產出格式保留、不改寫；只依樣板組設計，不讀取參考來源中範例以外的內容，也不做與參考來源的落差分析；參考範例來自外部專案時，附上「任務輸入」的來源網址與授權。
3. `CHECK` `skill-engineering` 已完成並回報驗收結果時進入 Phase 5；`skill-engineering` 停止執行時，向使用者回報停止原因與其紀錄目錄並停止執行。

完成條件：`skill-engineering` 已完成目標 Skill 的施工與驗收，且已取得其紀錄目錄與驗收結果。

## Phase 5 -- 驗證單一溯源並交付

1. `CHECK` 逐項確認並記錄結果為「溯源檢查結果」：執行 `shasum -a 256 <範例路徑>` 的結果與「定稿雜湊」相同；目標 Skill 的 `SKILL.md` 有 `READ` 步驟載入 `templates/<樣板名字>.<格式>` 與 `templates/<樣板名字>.example.<格式>`，並以該載入結果產出 Artifact；目標 Skill 的 `templates/` 沒有另一組產出同一種檔案的樣板組。
2. `WRITE` 向使用者回報目標 Skill 路徑、樣板組路徑、`skill-engineering` 的紀錄目錄與驗收結果摘要，以及「溯源檢查結果」；有未通過的項目時逐項列出。

完成條件：「溯源檢查結果」已記錄，且已向使用者回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `SKILL.md` frontmatter | 新增 | `name: artifact-to-skill-engineering`、`disable-model-invocation: true` 與第 2 節的 `description` | E1–E6（概述用途與觸發情境） |
| Phase 1 -- 收斂參考範例與目前階段（P1-1～P1-8） | 新增 | 讀取任務輸入與目標 Skill 現況、判定起始階段、索取缺少的輸入、放入範例、回報階段 | E1、E7；C1–C5 |
| Phase 2 -- 互動定稿範例（P2-1～P2-9） | 新增 | 反推階段直接記雜湊；盤點客製化缺口、委派 clarify、載入範例定稿規則、改範例、驗證、使用者確認定稿並記雜湊 | E2、E3、E4；C6–C11 |
| Phase 3 -- 倒抽樣板（P3-1～P3-4） | 新增 | 委派 `skill-form-template` 建骨架、以雜湊確認範例未變、需要改範例時回到使用者 | E4；C12–C13 |
| Phase 4 -- 反推 Skill（P4-1～P4-3） | 新增 | 擬推定輸入樣本、委派 `skill-engineering`、確認完成 | E5、E8、E9；C14–C17 |
| Phase 5 -- 驗證單一溯源並交付（P5-1～P5-2） | 新增 | 雜湊、SOP 載入樣板組、沒有第二組樣板，回報 | E4、E6、E10；C18–C19 |
| `rules/範例定稿-格式規範.md`（Rule 1～3） | 新增 | 範例必須是具體實例、客製化直接呈現在範例內容、範例維持單一情境且前後一致 | E3；C6–C8 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 5 | +5 |
| 步驟 | 0 | 26 | +26 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 3 | +3 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 0 | 0 | 0 |

- 新建模式，所有元素均為新增，各自追溯如差異表。5 個 Phase 對應課程版 Skill 的 5 個 Phase。
- 只有 1 份 RuleFile：只有「怎樣才算改好的範例」需要判斷與正反例；倒抽樣板的格式要求已由 `skill-form-template` 的 RuleFile 負責，反推 SOP 的設計要求已由 `skill-engineering` 的 RuleFile 負責，本 Skill 不重複。
- 沒有樣板組：本 Skill 的產出是目標 Skill 的檔案，格式由被委派的 Skill 決定。
- 沒有腳本：雜湊比對以既有工具的單一命令 `shasum -a 256` 完成（約束分配 Rule 2）。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 目標 Skill 位於專案根目錄 `.agents/skills/<目標 Skill 名稱>/` | P1-2 | P1-2 步驟內文 | 只屬於讀取位置，一句話即可表達；與 `skill-engineering` 新建模式的位置一致 |
| C2 | 起始階段依 `templates/` 現況與有無客製化需求判定為「反推 Skill」、「定稿範例」或「放入範例」 | P1-3 | P1-3 步驟內文 | 屬於分支判斷的條件，判斷依據是檔案是否存在，一句話即可表達，不需要正反例；不是產出檔案結構，不用樣板組；只有三個條件，不另建腳本 |
| C3 | 缺少目標 Skill 名稱，或「放入範例」時缺少參考範例路徑，先向使用者索取 | P1-4～P1-6 | SOP 流程 | 屬於分支與使用者確認 |
| C4 | 範例副本命名為 `templates/<樣板名字>.example.<格式>` | P1-7 | P1-7 步驟內文 | 只屬於本步驟的路徑；命名規範本身存放在 `skill-form-template` 的 RuleFile，此處只寫路徑 |
| C5 | 不修改參考範例原檔 | P1-7 | P1-7 步驟內文 | 只屬於本步驟，一句話即可表達 |
| C6 | 範例必須是具體實例：不含填位符號、「請填入」等抽象說明，內容取自單一具體情境 | P2-6 | `rules/範例定稿-格式規範.md` Rule 1 | 判斷內容是否夠具體需要正反例；不是整份檔案的固定結構，樣板組無法保證；填位符號寫法依格式而異，腳本無法可靠判斷 |
| C7 | 客製化需求必須改寫在範例內容本身（結構、段落、條目），不得以註解、待辦或「此處改為⋯⋯」等說明文字呈現；使用者要求刪除的段落整段移除 | P2-6 | `rules/範例定稿-格式規範.md` Rule 2 | 需要判斷改法是否「呈現樣貌」，需要正反例 |
| C8 | 修改後整份範例仍描述同一個情境，編號與交互引用前後一致；搬移或重組條目時不遺漏使用者沒有要求刪除的內容 | P2-6 | `rules/範例定稿-格式規範.md` Rule 3 | 需要判斷語意一致與內容是否遺漏，需要正反例 |
| C9 | 「客製化缺口」不為空時先委派 clarify，回答後才修改範例 | P2-4 | SOP 流程 | 屬於分支與使用者確認 |
| C10 | 使用者明確確認定稿前，不建立骨架、不委派 `skill-engineering` | P2-8～P2-9 | SOP 流程 | 屬於使用者確認與 Phase 轉移 |
| C11 | 確認定稿時（或起始階段為「反推 Skill」時）以 `shasum -a 256` 記錄「定稿雜湊」 | P2-1、P2-9 | 步驟內文 | 既有工具單一命令即可完成，依約束分配 Rule 2 寫在步驟內文，不另建腳本 |
| C12 | 骨架由 `skill-form-template` 依定稿範例建立；委派時說明不得修改範例，需要修改時回報 | P3-1 | P3-1 步驟內文 | 只屬於本步驟的委派內容；骨架格式規範存放在 `skill-form-template` |
| C13 | 範例需要修改或雜湊不同時，回到使用者決定，同意後走定稿流程 | P3-2～P3-4 | SOP 流程 | 屬於分支與使用者確認 |
| C14 | 沒有輸入樣本時，依定稿範例擬一段並命名為「推定輸入樣本」 | P4-1 | P4-1 步驟內文 | 只屬於本步驟，一句話即可表達 |
| C15 | 委派 `skill-engineering` 的內容：樣板組為目標 Artifact、輸入樣本、後設反推推理流程、最簡 SOP 起步、避免過度工程、樣板組保留不改寫 | P4-2 | P4-2 步驟內文 | 只屬於本步驟的委派內容；`skill-engineering` 自己的設計規範（從驗收條件推導、約束分配等）存放在其 RuleFile，此處不重述 |
| C16 | 不讀取參考來源中範例以外的內容，不做與參考來源的落差分析 | P4-2 | P4-2 步驟內文 | 只屬於本步驟的委派內容，一句話即可表達 |
| C17 | 參考範例來自外部專案時附上來源網址與授權 | P4-2 | P4-2 步驟內文 | 只屬於本步驟的委派內容，一句話即可表達；如何寫 `LICENSE` 由專案 CLAUDE.md 規則 3 與 `skill-engineering` 負責 |
| C18 | 單一溯源的三項檢查：範例雜湊不變、SOP 載入此樣板組產出 Artifact、沒有第二組同用途樣板組 | P5-1 | P5-1 步驟內文 | 只屬於本步驟，三項都可直接檢查，不需要正反例；檢查需要讀 SOP 語意，不適合腳本 |
| C19 | 回報內容 | P5-2 | P5-2 步驟內文 | 只屬於本步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/artifact-to-skill-engineering/SKILL.md` frontmatter | 建立 `name`、`disable-model-invocation` 與 `description` | — | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/artifact-to-skill-engineering/SKILL.md` 的 `# SOP` | 寫入胖 SOP | C1–C19 | 已完成 |
| 3 | W3 | `skill-derive-rule` | Phase 2 -- 互動定稿範例的 `WRITE` 直接修改範例檔步驟 | 抽出 `rules/範例定稿-格式規範.md`，並新增載入步驟、改寫驗證步驟 | C6–C8 | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: artifact-to-skill-engineering`
- `disable-model-invocation: true`（比照課程與 `s-specify`，由使用者明確輸入 `/artifact-to-skill-engineering` 才啟動；避免使用者只說「建立 skill」時與 `skill-engineering` 搶觸發）
- `description`：使用第 2 節 To-Be SOP 的 `description` 原文（已含與 `skill-engineering`、`skill-derive-template`、`skill-form-template` 的分流）。

#### W2：胖 SOP

寫入下列胖 SOP。Phase 1、Phase 3、Phase 4、Phase 5 與第 2 節 To-Be SOP 相同；Phase 2 尚未有 RuleFile，待抽取的 C6–C8 先寫在修改範例步驟的內文。

````markdown
# SOP

## Phase 1 -- 收斂參考範例與目前階段

（與第 2 節 To-Be SOP 的 Phase 1 相同，含完成條件。）

## Phase 2 -- 互動定稿範例

1. `CHECK` 起始階段為「反推 Skill」時，執行 `shasum -a 256 <範例路徑>` 將結果記為「定稿雜湊」，略過 Phase 2 與 Phase 3，進入 Phase 4。
2. `READ` 目標 Skill 的範例 `templates/<樣板名字>.example.<格式>`，建立「範例現況」。
3. `THINK` 依「範例現況」與「任務輸入」的客製化需求，盤點會改變範例修改方式的歧義與未決定事項，建立「客製化缺口」。
4. `DELEGATE` 「客製化缺口」不為空時，委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取 `clarify` 的 `SKILL.md` 並依其 SOP 執行），以「客製化缺口」為優先提問面向、不要求詳記問答紀錄，取得已確認決策，建立「客製化決策」；「客製化缺口」為空時略過本步驟。
5. `WRITE` 以客製化需求與「客製化決策」直接修改範例檔；範例必須是具體實例，不含填位符號或「請填入」等抽象說明，內容取自單一具體情境；客製化需求必須改寫在範例內容本身（結構、段落、條目），不得以註解、待辦或「此處改為⋯⋯」等說明文字呈現，使用者要求刪除的段落整段移除；修改後整份範例仍描述同一個情境，編號與交互引用前後一致，搬移或重組條目時不遺漏使用者沒有要求刪除的內容。
6. `CHECK` 確認範例符合上一步的要求；未通過時修正範例後重新驗證。
7. `WRITE` 向使用者展示本輪對範例的修改摘要與範例路徑，請使用者確認定稿，或提出新的客製化需求。
8. `CHECK` 使用者回覆：提出新的客製化需求時，以該回覆作為客製化需求返回步驟 2；明確確認定稿時，執行 `shasum -a 256 <範例路徑>` 將結果記為「定稿雜湊」；未明確確認時停止執行。

完成條件：使用者已明確確認範例定稿，範例已通過驗證，且「定稿雜湊」已記錄；或起始階段為「反推 Skill」，已記錄「定稿雜湊」並略過本 Phase。

## Phase 3 -- 倒抽樣板

（與第 2 節 To-Be SOP 的 Phase 3 相同，含完成條件。）

## Phase 4 -- 反推 Skill

（與第 2 節 To-Be SOP 的 Phase 4 相同，含完成條件。）

## Phase 5 -- 驗證單一溯源並交付

（與第 2 節 To-Be SOP 的 Phase 5 相同，含完成條件。）
````

#### W3：抽出 `rules/範例定稿-格式規範.md`

- 目標步驟：Phase 2 -- 互動定稿範例的 `WRITE` 直接修改範例檔步驟（內文含「以客製化需求與「客製化決策」直接修改範例檔」）。
- 正反例情境統一使用「會議紀錄」產出物（例如 `meeting-minutes.example.md`，含出席者、決議、待辦事項），不得使用 ADR、API changelog 或事故檢討報告，避免與驗收情境重疊。
- Rule 1（C6）：範例必須是具體實例。Good Example：決議與待辦寫出真實的人名、日期與事項；Bad Example：保留 `{{DECISION}}`、「請在此填入待辦事項」。
- Rule 2（C7）：客製化需求直接呈現在範例內容。Good Example：使用者要求「待辦改成表格並加上負責人欄」，範例的待辦段落就改成含負責人欄的表格；Bad Example：保留原本的條列，在下方加註「（此段之後改成表格）」。
- Rule 3（C8）：範例維持單一情境且前後一致。Good Example：把「決議」拆成「已決議」與「待決議」後，原本 5 條決議都還在、待辦引用的決議編號同步更新；Bad Example：拆分時漏掉一條決議，或待辦仍引用已不存在的編號。
- After：在該步驟前新增 `READ` 載入步驟，讀取 `rules/範例定稿-格式規範.md` 的所有 Rule，命名「範例定稿檢查清單」；該步驟改為依已載入的「範例定稿檢查清單」，以客製化需求與「客製化決策」直接修改範例檔；其後的 `CHECK` 改為逐條驗證「範例定稿檢查清單」，未通過時修正範例後重新驗證；Phase 2 完成條件改為範例已通過「範例定稿檢查清單」。結果需與第 2 節 To-Be SOP 的 Phase 2 一致。

## 7. 驗收情境

測試環境為本 repo 含本次未提交修改的暫存複本。S1、S3 的參考範例放在複本外的獨立目錄，作為「外部參考來源」。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E4、E5、E6、E9、E10 | 本次 | `/artifact-to-skill-engineering` 目標 Skill：`s-adr`；參考範例：`<外部目錄>/adr-0007-order-events.md`（一份具體的 ADR：訂單服務把同步 HTTP 呼叫改成發布事件到訊息佇列，含 Context、Decision、Consequences，來源註明「https://github.com/example/shop-platform ，MIT」）；輸入樣本：「我們決定把訂單服務呼叫庫存服務的同步 HTTP 改成發布 OrderPlaced 事件，請幫我寫成 ADR」；客製化需求：「Consequences 拆成『正面影響』與『負面影響與緩解』兩個小節，負面影響每一條都要寫緩解方式」。測試環境沒有 `.agents/skills/s-adr/` | clarify 提問回覆「全部採用推薦選項」；定稿確認回覆「確認定稿」；`skill-engineering` 的藍圖確認回覆「同意」；其餘確認閘門回覆「同意」 | 範例位於 `.agents/skills/s-adr/templates/<樣板名字>.example.md`，外部原檔雜湊不變；定稿確認閘門展示時，`templates/` 只有範例沒有骨架，也沒有 `specs/skill-engineering/*-s-adr-*` 目錄；範例的 Consequences 有兩個小節，每條負面影響都有緩解方式，不含 `{{` 或「請填入」；骨架 `<樣板名字>.md` 與範例同名成對，交付時範例雜湊等於定稿時雜湊；子代理回報的 `skill-engineering` 委派內容含 E5 列出的各項與 E9 的來源網址及授權；`s-adr/SKILL.md` 有 `READ` 步驟載入這組骨架與範例，`templates/` 只有這一組樣板；完成回報含 E10 各項 |
| S2 | E4、E5、E7、E8 | 本次 | `/artifact-to-skill-engineering` 目標 Skill：`s-api-changelog`；不提供參考範例、輸入樣本與客製化需求。測試環境預先放好 `.agents/skills/s-api-changelog/templates/api-changelog.md`（骨架）與 `api-changelog.example.md`（一份具體的 API 版本變更紀錄），沒有 `SKILL.md` | `skill-engineering` 的藍圖確認回覆「先不要」 | 回報的起始階段為「反推 Skill」，沒有出現範例定稿確認；兩個樣板檔的雜湊與執行前相同；子代理回報的 `skill-engineering` 委派內容含標明為推定的輸入樣本，以及 E5 列出的各項；`specs/skill-engineering/` 下有 `s-api-changelog` 的紀錄目錄與藍圖，且停止於藍圖確認 |
| S3 | E2、E3 | 本次 | `/artifact-to-skill-engineering` 目標 Skill：`s-postmortem`；參考範例：`<外部目錄>/postmortem-template.md`（抽象骨架，含 `{{INCIDENT_TITLE}}`、`{{TIMELINE}}` 與「請描述根因」等說明）；客製化需求：「時間軸改成表格」。測試環境沒有 `.agents/skills/s-postmortem/` | clarify 提問回覆「全部採用推薦選項」；定稿確認回覆「先不要，我晚點再看」 | `.agents/skills/s-postmortem/templates/` 下的範例不含 `{{`、「請描述」等抽象說明，內容是單一具體事故；時間軸以表格呈現；`templates/` 沒有骨架 `postmortem.md`；沒有 `specs/skill-engineering/*-s-postmortem-*` 目錄 |

## 8. 驗收結果

- 施工後結構診斷：`artifact-to-skill-engineering` 0 個 error、0 個 warning；`rules/範例定稿-格式規範.md` 由 Phase 2 步驟 5 的 `READ` 載入。
- 同步：`./scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端的 Skill；`CLAUDE.md` 內容未變。
- 一致性：`SKILL.md` 與第 2 節 To-Be 逐字相同；C6～C8 只存放在 RuleFile，Phase 2 步驟 6 只引用「範例定稿檢查清單」。
- 驗收方式：三個情境各在含本次未提交修改的暫存專案複本中，以不帶本次分析脈絡的子代理實跑；子代理不使用 Skill 工具，委派其他 Skill 時讀取複本內的 `SKILL.md` 執行。S1 為控制成本，被委派的 `skill-engineering` 的 Phase 5 驗收情境改為逐步演練（只影響 `s-adr` 自己的驗收，不影響本 Skill 的判斷項目）。
- S1 通過：範例複製為 `.agents/skills/s-adr/templates/adr.example.md`，外部原檔雜湊不變；定稿確認閘門展示時 `templates/` 只有範例、`specs/skill-engineering/` 沒有 `s-adr` 紀錄目錄；clarify 3 題（緩解格式、緩解具體程度、範例開頭的來源註解）採推薦後，Consequences 拆成「正面影響」與「負面影響與緩解」，3 條負面影響各有「緩解：」子項目，無填位符號；骨架 `adr.md` 與範例成對，交付時範例雜湊等於定稿雜湊（`9e1ea7f5…de129`）；`skill-engineering` 委派內容含 E5 各項與來源網址、MIT 授權，`s-adr` 因此新增 `LICENSE` 並更新根目錄 `LICENSE`；`s-adr/SKILL.md` Phase 1 以 `READ` 載入這組樣板並於 Phase 2 依其寫入 ADR，`templates/` 只有這一組；完成回報含 E10 各項，三項溯源檢查均通過。
- S2 通過：起始階段判定為「反推 Skill」，沒有出現定稿確認；兩個樣板檔雜湊與執行前相同；`skill-engineering` 委派內容含標明「推定」的輸入樣本與 E5 各項；`specs/skill-engineering/09-s-api-changelog-建立/blueprint.md` 已寫入，於藍圖確認閘門收到「先不要」後停止，本 Skill 回報停止原因與紀錄目錄。
- S3 通過：抽象骨架的參考範例在定稿階段改成單一具體事故（clarify 多問了一題「範例用哪個事故情境」），不含 `{{`、`<…>`、「請描述」；時間軸改成「時間｜事件」表格；收到「先不要，我晚點再看」後停止，`templates/` 沒有骨架 `postmortem.md`，也沒有 `s-postmortem` 紀錄目錄；外部原檔雜湊不變。
- 執行觀察（不影響驗收結論）：
  1. 樣板名字由執行者自行決定（S3 把 `postmortem-template` 去掉 `-template`），結果合理，SOP 只寫「決定樣板名字」。
  2. S1 產出的 `s-adr` 沒有加 `disable-model-invocation`，也沒有標「未驗證」；兩者都屬於 `skill-engineering` 對目標 Skill 的設計，不屬於本 Skill 的範圍。
  3. 授權檔的處理依 CLAUDE.md 規則 3 由 `skill-engineering` 列為工作項完成，本 Skill 只負責傳入來源與授權（E9），運作如預期。
- 驗收後調整：使用者要求依 CLAUDE.md「未經學員實際驗證的 skill 要標明未驗證」，以 `skill-form-description` 在 `description` 開頭加上「（未驗證）」，其餘文字不變；因此 `SKILL.md` 的 `description` 與第 2 節 To-Be 差在這個前綴。調整後結構診斷 0 個 error、0 個 warning，同步檢查「兩邊一致」。使用者親自實跑驗證後再移除。
- 使用者實際驗證（2026-10-23）：使用者親自輸入 `/artifact-to-skill-engineering`，目標 Skill 為 `plan-with-class-diagram`，起始階段判定為「定稿範例」（`templates/` 只有使用者放入的 `class-diagram-proposal.example.md`）。
  - 定稿：使用者要求補上兩條關係的 `«new»`、`«removed»` 標記後明確回覆「確認定稿」，定稿雜湊 `e8c074d3…fc65e`。
  - 倒抽：`skill-form-template` 產出骨架 `class-diagram-proposal.md`，以範例值填回骨架與範例逐字相同，範例實際以 Mermaid 渲染成功。
  - 反推：`skill-engineering` 在 `specs/skill-engineering/09-plan-with-class-diagram-建立/` 完成藍圖確認、施工與兩個子代理驗收情境，均通過。
  - 溯源：交付時範例雜湊等於定稿雜湊；`SKILL.md` Phase 1 以 `READ` 載入這組樣板並依其寫入提案檔；`templates/` 只有這一組。
  - 結論：使用者確認驗證通過，以 `skill-form-description` 移除 `description` 開頭的「（未驗證）」，其餘文字不變。
- 實際驗證中的觀察（不影響結論，未修改本 Skill）：
  1. 使用者把目標 Skill 建在 `.claude/skills/`，本 Skill 的 Phase 1 讀取 `.agents/skills/`，需先執行 `scripts/sync-skills.sh --from claude` 才讀得到範例。
  2. Phase 1 要求的「產出範例時的輸入樣本」不存在：範例是早期 AI 修改 Skill 時寫的示範，沒有任何使用者需求產出它；使用者一度難以理解這項輸入的意思。最後依 Phase 4 步驟 1 以「推定輸入樣本」處理，並經使用者確認。
