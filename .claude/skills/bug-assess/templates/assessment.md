# 錯誤評估：{{BUG_TITLE}}

- **代號**：{{BUG_SLUG}}
- **建立日期**：{{CREATED_DATE}}
- **來源**：{{REPORT_SOURCE}}
- **判定**：{{VERDICT}}
- **嚴重度**：{{SEVERITY}}
- **核准狀態**：{{APPROVAL_STATUS}}

## 回報內容

{{REPORT_QUOTE}}

## 症狀

{{SYMPTOM}}

## 完整預期行為

「目前」欄依程式碼判斷，{{UNMEASURED_NOTE}}。修正前與修正後的實測由 `bug-test` 依「量測方式」執行。{{MEASURE_CONDITIONS}}

| # | 預期行為 | 目前 | 量測方式 | 通過標準 |
|---|---|---|---|---|
{{EXPECTED_BEHAVIOR_ROWS}}

## 重現步驟

{{REPRODUCTION_STEPS}}

## 搜尋線索

| 線索 | 類型 | 搜尋結果 |
|---|---|---|
{{SEARCH_CLUE_ROWS}}

## 可疑程式路徑

{{SUSPECTED_CODE_PATHS}}

## 相關測試

| 測試 | 共用的資料或前提 | 是否受影響 | 說明 |
|---|---|---|---|
{{RELATED_TEST_ROWS}}

## 根本原因假設

{{ROOT_CAUSE_HYPOTHESIS}}

### 嚴重度理由

{{SEVERITY_CONCLUSION}}

- 使用者影響：{{SEVERITY_USER_IMPACT}}
- 波及範圍：{{SEVERITY_SCOPE}}
- 資料風險：{{SEVERITY_DATA_RISK}}
- 新的回歸或長期存在：{{SEVERITY_REGRESSION_OR_LONG_STANDING}}

## 修法

**首選**：{{PREFERRED_SUMMARY}}

{{PREFERRED_STEPS}}

**替代做法**：

{{ALTERNATIVES}}

**要改的檔案**：

{{FILES_TO_CHANGE}}

**要補的測試**：

{{TESTS_TO_ADD}}

**需要核准的命令**：

{{COMMANDS_NEEDING_APPROVAL}}

## 轉回 SDD 流程的項目

下列項目要改變已同意的意圖，不放進本次修法，由處理 Skill 先修改上游文件，再走 `tasks` → `implement`。

| # | 要改的事 | 已同意的意圖 | 處理 Skill |
|---|---|---|---|
{{INTENT_CHANGE_ROWS}}

## 風險

| 面向 | 檢查結果 |
|---|---|
| API 相容性 | {{RISK_API_COMPATIBILITY}} |
| migration | {{RISK_MIGRATION}} |
| 效能 | {{RISK_PERFORMANCE}} |
| 安全 | {{RISK_SECURITY}} |
| 可觀測性 | {{RISK_OBSERVABILITY}} |

{{OTHER_RISKS}}

## 使用者關卡

### 澄清紀錄

| # | 問題 | 使用者回答 | 寫回位置 |
|---|---|---|---|
{{CLARIFICATION_ROWS}}

### 核准

- 核准日期：{{APPROVAL_DATE}}
- 核准的修法：{{APPROVED_ITEMS}}
- 核准執行的命令：{{APPROVED_COMMANDS}}
- 不在本次修正範圍：{{OUT_OF_SCOPE_ITEMS}}
