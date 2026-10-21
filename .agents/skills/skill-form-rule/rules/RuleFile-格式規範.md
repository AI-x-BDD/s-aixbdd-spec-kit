# Rule 1 - 每條規則使用固定結構

- RuleFile 必須直接從 `# Rule 1 - <Rule name>` 開始，不得加入檔案標題或 Purpose section；適用範圍由檔名與 `SKILL.md`
  的引用說明。
- RuleFile 必須包含一條或多條規則。
- 每條規則必須以 `# Rule N - <Rule name>` 作為標題。
- `N` 必須從 `1` 開始連續編號。
- 每條規則必須依序包含規則說明、`## Good Example` 與 `## Bad Example`。

## Good Example

- 標題格式、編號與 section 順序都符合固定結構。

````markdown
# Rule 1 - 錯誤訊息必須指出失敗原因

- 錯誤訊息必須描述實際失敗的條件。

## Good Example

- 訊息指出錯誤欄位與預期格式。

```text
Invalid port "abc": expected an integer between 1 and 65535.
```

## Bad Example

- 訊息只表示操作失敗。

```text
Invalid input.
```
````

## Bad Example

- 編號不連續，且缺少 `## Bad Example`，無法用固定結構完整檢查這條規則。

```markdown
# Rule 3 - 錯誤訊息

- 錯誤訊息應該清楚。

## Good Example

- 提供一則清楚的錯誤訊息。
```

# Rule 2 - 每個 RuleFile 只規範一個主題

- 一個 RuleFile 必須只處理一個完整主題。
- 同一主題下可以包含多條相關 Rule。
- 需要處理不同主題時，必須拆成不同 RuleFile。

## Good Example

- `CLI-錯誤訊息-格式規範.md` 內的兩條 Rule 都屬於 CLI 錯誤訊息主題。

```text
Rule 1: 錯誤訊息必須指出失敗原因
Rule 2: 錯誤訊息必須提供修正方式
```

## Bad Example

- 同一檔案混合 CLI 錯誤訊息與資料庫命名，無法從單一主題判斷適用範圍。

```text
Rule 1: 錯誤訊息必須指出失敗原因
Rule 2: 資料庫 table 必須使用 snake_case
```

# Rule 3 - 跨部位引用只能補充本地規則，不得重述

- Rule 可以引用其他 Rule、RuleFile、樣板組或腳本以補充共用定義。
- 每條 Rule 必須在本檔內完整說明其核心要求，不得只要求讀者參閱其他檔案。
- RuleFile 之間不得循環引用。
- Rule 不得重述同一個 Skill 其他 RuleFile、樣板組、腳本或 SOP 步驟內文已規範的要求。

## Good Example

### Example 1

- 本地 Rule 已定義必須使用 kebab-case，外部引用只補充共用的轉換細節。

```markdown
- 檔名必須使用 kebab-case。
- 字元轉換方式參見 `rules/naming-conventions.md`。
```

### Example 2

- 報告樣板組的骨架已固定摘要、分析與結論三個段落，RuleFile 只規範樣板無法保證的內容判準。

```markdown
# Rule 1 - 數字必須標明單位

- 報告中的每個數字必須標明單位。
```

## Bad Example

### Example 1

- 規則本體完全位於另一個檔案，本地 Rule 無法獨立理解。

```markdown
- 檔名規則參見 `rules/naming-conventions.md`。
```

### Example 2

- 同一情境中，RuleFile 又重述樣板骨架已固定的段落結構；修改樣板的段落時，必須同步修改 RuleFile。

```markdown
# Rule 1 - 報告結構與數字格式

- 報告必須依序包含摘要、分析與結論三個段落。
- 報告中的每個數字必須標明單位。
```

# Rule 4 - 檔名與內文必須使用一致的語言格式

- RuleFile 檔名必須使用 `<主題>-格式規範.md`。
- 主題中的專有名詞必須保留其標準大小寫，例如 `RuleFile-格式規範.md` 與 `SOP-格式規範.md`。
- 內文必須使用目標 Skill 的主要語言。
- 中文內文必須使用全形中文標點；程式碼、格式字面值、識別字與專有名詞可以保留原文。

## Good Example

- 檔名保留 `RuleFile` 的標準大小寫，中文說明使用全形標點，格式字面值保留英文。

```text
檔名：RuleFile-格式規範.md
內文：每條規則必須以 `# Rule N - <Rule name>` 作為標題。
```

## Bad Example

- 檔名的專有名詞大小寫不一致，中文說明也混用半形標點。

```text
檔名：rulefile_規範.md
內文：每條規則必須有標題, 格式應該清楚.
```

# Rule 5 - RuleFile 必須由 SKILL.md 按需載入

- 擁有 RuleFile 的 `SKILL.md` 必須以 `READ` 步驟按需載入 RuleFile，且只載入當前任務需要的 RuleFile。
- 載入步驟的提名位置、適用條件與載入結果命名，依 `skill-form-sop` 的 `rules/SOP-按需載入-格式規範.md`。

## Good Example

- 流程先確認 RuleFile 適用，再於第一個依賴步驟前載入所有 Rule 並命名結果。

```markdown
1. `READ` 使用者需求與目標檔案。
2. `THINK` 確認任務是否涉及 API 錯誤訊息。
3. `READ` 任務涉及 API 錯誤訊息時，讀取 `rules/API-錯誤訊息-格式規範.md` 的所有 Rule，建立錯誤訊息檢查清單。
4. `THINK` 依已載入的錯誤訊息檢查清單設計內容。
5. `WRITE` 寫入錯誤訊息。
6. `CHECK` 逐條驗證錯誤訊息檢查清單。
```

## Bad Example

- RuleFile 在確認適用前就載入，且路徑在後續步驟重複出現。

```markdown
1. `READ` 使用者需求與 `rules/API-錯誤訊息-格式規範.md`。
2. `THINK` 確認任務是否涉及 API 錯誤訊息。
3. `WRITE` 依 `rules/API-錯誤訊息-格式規範.md` 修改內容。
4. `CHECK` 內容是否符合 `rules/API-錯誤訊息-格式規範.md`。
```

# Rule 6 - 規則說明必須可執行且可檢查

- 規則說明必須在 Rule 標題下使用條列描述。
- 每項說明必須指出要求的行為、格式或限制，使 Agent 能判斷輸出是否符合規則。
- 需要定義欄位、對應關係或較複雜的格式時，可以使用 Markdown table 或 code block 補充。

## Good Example

- 說明指定了標題的字面格式，可以直接檢查。

```markdown
- 每條規則必須以 `# Rule N - <Rule name>` 作為標題。
```

## Bad Example

- 「清楚」沒有可觀察的判斷條件，Agent 無法一致檢查。

```markdown
- 規則的格式應該清楚。
```

# Rule 7 - 規則強度必須使用固定用詞

- Rule 標題不得加入 `[LEVEL]`；規範強度必須由規則說明中的固定用詞表達。
- 硬性要求必須使用「必須」；禁止行為必須使用「不得」。
- 預設應遵守、但在任務情境提供具體理由時可以偏離的要求，必須使用「應」。
- 不影響合規性的選項必須使用「可以」。
- 規則說明不得使用「盡量」、「最好」或「原則上」等未定義的強度用詞。
- 每個獨立要求必須明確使用一種規範強度；不同強度的獨立要求必須拆成不同條列。

## Good Example

- 各條說明使用固定用詞表達強度，並將不同強度的獨立要求拆開。

```markdown
# Rule 3 - Log 的內容

- Log 應包含 request ID。
- 執行環境無法取得 request ID 時，可以省略 request ID。
- 省略 request ID 時，必須說明原因。
```

## Bad Example

- 「盡量」沒有定義規範強度，Agent 無法一致判斷是否必須遵守。

```markdown
# Rule 3 - Log 的內容

- Log 盡量包含 request ID。
```

# Rule 8 - Example 必須使用適合內容的原生格式

- `## Good Example` 與 `## Bad Example` 中，說明之後的示範本體必須使用最能呈現其結構的原生格式。
- 程式碼、設定檔、命令或字面輸出必須使用 code block，並標記適合的語言；純文字輸出使用 `text`。
- 欄位、對應關係或多項條件的比較必須使用原生 Markdown table，不得包在 code block 內。
- 行為、流程或情境必須使用原生條列，不得包在 code block 內。
- 同一個範例包含多種資料類型時，可以混合使用 code block、Markdown table 與條列。

## Good Example

- 範例要比較欄位的必要性與用途，因此使用可直接閱讀的原生 Markdown table。

| 欄位          | 必要性 | 用途         |
| ------------- | ------ | ------------ |
| `name`        | 必須   | 識別 Rule    |
| `description` | 必須   | 說明檢查條件 |

## Bad Example

- Markdown table 被包在 code block 內，只能顯示原始字元，無法呈現表格結構。

````markdown
```markdown
| 欄位   | 必要性 | 用途      |
| ------ | ------ | --------- |
| `name` | 必須   | 識別 Rule |
```
````

# Rule 9 - 正反範例必須具體展示規則差異

- `## Good Example` 必須包含一段簡短說明，指出範例符合規則的原因。
- `## Bad Example` 必須包含一段簡短說明，指出範例違反規則的位置或差異。
- 每個 Example section 必須提供至少一個完整範例，並依 Rule 8 選擇示範本體的格式。
- 每個 Example section 可以提供多組範例；只有一組時不加子標題，多組時必須使用 `### Example 1`、`### Example 2`
  連續編號。
- Good Example 與 Bad Example 必須針對同一個規則重點與情境，讓讀者能直接比較差異。

## Good Example

- 條列情境交代了實際輸入與輸出，並聚焦在「指出失敗原因」。

情境：

1. 使用者將 port 設為 `abc`。
2. 系統顯示 `Invalid port "abc": expected an integer between 1 and 65535.`。

## Bad Example

- 條列情境使用相同輸入，但輸出沒有指出錯誤值或預期格式。

情境：

1. 使用者將 port 設為 `abc`。
2. 系統顯示 `Invalid input.`。
