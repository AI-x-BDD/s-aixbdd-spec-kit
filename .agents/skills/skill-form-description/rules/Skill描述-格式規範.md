# Rule 1 - frontmatter 只包含允許的欄位與格式

- `SKILL.md` 必須以 `---` 包圍的 YAML frontmatter 開頭，且必須包含 `name` 與 `description`。
- frontmatter 只能使用 `name`、`description`、`license`、`allowed-tools`、`metadata` 與 `compatibility` 欄位。
- `name` 必須是 64 字元內的 kebab-case，且必須與 Skill 目錄名稱相同。
- `description` 必須是 1024 字元內的單一字串，且不得包含 `<` 或 `>`。

## Good Example

- 欄位都在允許範圍內，`name` 與目錄 `api-error-review/` 相同。

```yaml
---
name: api-error-review
description: 撰寫或審查 API 錯誤回應時使用；檢查錯誤訊息是否指出失敗欄位、收到的值與修正方式。
---
```

## Bad Example

- `name` 不是 kebab-case 且與目錄不同，多了未允許的欄位，`description` 含有角括號。

```yaml
---
name: API_Error_Review
version: 2
description: 審查 <API> 錯誤回應。
---
```

# Rule 2 - description 必須同時說明用途與觸發情境

- `description` 是 Agent 決定是否使用 Skill 的唯一依據，必須同時說明 Skill 完成什麼結果，以及在哪些使用者請求或任務情境下使用。
- 觸發情境必須列出使用者實際會提到的任務、產出或關鍵字，包括常見的英文術語。
- 觸發語氣必須使用「時使用」或「必須使用此 Skill」等明確用詞，不得使用「可以考慮」等未定義強度的用詞。
- `description` 必須使用 Skill 的主要語言撰寫。

## Good Example

- 說明了產出結果，並列出使用者會提到的任務與關鍵字。

```yaml
description: 撰寫或審查 API 錯誤回應時使用；檢查錯誤訊息是否指出失敗欄位、收到的值與修正方式。使用者提到 error response、錯誤訊息格式、400 回應內容或 validation error 時，必須使用此 Skill。
```

## Bad Example

- 只描述主題，沒有說明產出或觸發情境，Agent 無法判斷何時使用。

```yaml
description: 關於 API 錯誤的一些最佳實踐，可以考慮參考。
```

# Rule 3 - description 必須劃出與相鄰 Skill 的邊界

- 同一專案的任何 skills 目錄中有範圍重疊的 Skill 時，`description` 必須說明本 Skill 不處理的情境，並指名應改用的 Skill。
- 邊界說明必須使用可從使用者請求判斷的條件，例如任務範圍、產出類型或處理對象。

## Good Example

- 指出單一步驟的抽取改用 `skill-derive-rule`，判斷條件可從請求範圍得知。

```yaml
description: 建立新 Skill，或依使用者回報的問題優化既有 Skill 的整體結構時使用。只為單一 SOP 步驟補強規則時，改用 skill-derive-rule。
```

## Bad Example

- 與 `skill-derive-rule` 範圍重疊，卻沒有說明分流條件。

```yaml
description: 建立或修改 Skill 與其規則時使用。
```

# Rule 4 - description 不得描述流程細節

- `description` 不得列出 Phase、步驟順序、載入的檔案或內部檢查方式；這些內容必須留在 `# SOP` 與部位檔案中。
- `description` 可以提及影響是否使用本 Skill 的關鍵行為，例如「修改前會先取得使用者確認」。

## Good Example

- 只說明結果、觸發情境與一項影響使用決策的關鍵行為。

```yaml
description: 撰寫或審查 API 錯誤回應時使用；檢查錯誤訊息是否指出失敗欄位、收到的值與修正方式，修改既有回應前會先取得使用者確認。
```

## Bad Example

- 把 SOP 的步驟與載入檔案寫進 description，佔用觸發判斷的空間，也與 SOP 重複。

```yaml
description: 先讀取 rules/API-錯誤訊息-格式規範.md，再分析欄位，接著寫入錯誤訊息，最後逐條檢查。
```
