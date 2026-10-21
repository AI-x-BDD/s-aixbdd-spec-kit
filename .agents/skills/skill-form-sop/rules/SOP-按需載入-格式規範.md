# Rule 1 - 參考檔只能在載入步驟中提名

- `rules/` 與 `templates/` 的參考檔路徑必須只出現在實際讀取該檔案的 `READ` 步驟。
- `scripts/` 的腳本路徑必須只出現在實際執行該腳本的 `DELEGATE` 步驟。
- 多個參考檔可以在同一個 `READ` 步驟中載入。
- 只在特定任務或條件下需要的參考檔，`READ` 步驟必須說明適用條件。
- 載入參考檔的 `READ` 步驟必須與第一個依賴載入結果的步驟位於同一個 Phase，且兩者之間只能有其他載入參考檔的 `READ` 步驟。
- SOP 不得為載入參考檔建立獨立 Phase。
- `THINK`、`WRITE`、`CHECK` 與完成條件不得重複參考檔的路徑。

## Good Example

- `READ` 與第一個依賴步驟位於同一個 Phase 且前後相鄰，參考檔路徑只出現一次。

```markdown
## Phase 1 -- 理解與設計

1. `READ` 使用者需求與目標檔案。
2. `THINK` 確認任務是否涉及錯誤訊息。
3. `READ` 任務涉及錯誤訊息時，讀取 `rules/example-格式規範.md` 的所有 Rule，建立完成檢查清單。
4. `THINK` 依已載入的完成檢查清單設計內容。

完成條件：已完成符合完成檢查清單的內容設計。
```

## Bad Example

- 載入參考檔被拆成獨立 Phase，且路徑在後續 Phase 重複出現。

```markdown
## Phase 1 -- 載入規則

1. `READ` `rules/example-格式規範.md` 的所有 Rule。

完成條件：已載入所有 Rule。

## Phase 2 -- 設計內容

1. `THINK` 依 `rules/example-格式規範.md` 設計內容。

完成條件：已完成內容設計。
```

# Rule 2 - 後續步驟必須使用載入結果

- `READ` 步驟必須為載入結果指定明確名稱。
- 載入結果名稱必須表明其用途，例如「完成檢查清單」。
- 後續步驟必須使用該名稱引用載入結果。

## Good Example

- `READ` 步驟產生「完成檢查清單」，後續步驟持續使用同一名稱。

```markdown
1. `READ` `rules/example-格式規範.md` 的所有 Rule，建立完成檢查清單。
2. `WRITE` 依已載入的完成檢查清單修改內容。
3. `CHECK` 逐條驗證完成檢查清單。
```

## Bad Example

- `READ` 步驟沒有命名載入結果，後續步驟也沒有可追蹤的輸入。

```markdown
1. `READ` 規範檔。
2. `WRITE` 修改內容。
3. `CHECK` 內容是否正確。
```
