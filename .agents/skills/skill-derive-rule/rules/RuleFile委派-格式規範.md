# Rule 1 - 委派內容必須對應已確認提案

- 委派 `skill-form-rule` 時，必須完整指定已確認的 RuleFile 歸屬與 Rule 清單，且不得加入、刪除或改寫未經確認的規則。

## Good Example

- 委派內容完整指定已確認的目標檔案與唯一一條 Rule，沒有擴張提案範圍。

情境：

- 已確認的 RuleFile：`rules/API-錯誤訊息-格式規範.md`。
- 已確認的 Rule：錯誤訊息必須指出失敗欄位。
- 委派內容：使用 `skill-form-rule` 建立 `rules/API-錯誤訊息-格式規範.md`，只寫入「錯誤訊息必須指出失敗欄位」這條 Rule。

## Bad Example

- 委派內容沒有指定已確認的 Rule，並授權加入未經確認的其他規則。

情境：

- 已確認的 RuleFile：`rules/API-錯誤訊息-格式規範.md`。
- 已確認的 Rule：錯誤訊息必須指出失敗欄位。
- 委派內容：使用 `skill-form-rule` 建立適合的 API 錯誤訊息規則，並補充其他可能需要的 Rule。
