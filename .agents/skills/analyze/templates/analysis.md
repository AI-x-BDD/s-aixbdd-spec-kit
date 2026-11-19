# 一致性分析報告：{{FEATURE_NAME}}

- **Spec 目錄**：`{{SPEC_DIR}}`
- **分析日期**：{{ANALYSIS_DATE}}
- **已分析文件**：{{ANALYZED_FILES}}
- **已讀取的憲法檔**：{{CONSTITUTION_FILES}}
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
{{ISSUE_ROWS}}

超過 50 筆的部分：{{ISSUE_OVERFLOW_SUMMARY}}

## 2. 需求涵蓋

| 需求編號 | 計入涵蓋率 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- | --- |
{{REQUIREMENT_ROWS}}

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
{{INTERFACE_ROWS}}

## 4. 欄位涵蓋

| 欄位 | 資料模型位置 | 規則 | 實作任務 | 備註 |
| --- | --- | --- | --- | --- |
{{FIELD_ROWS}}

## 5. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
{{CONSTITUTION_ROWS}}

## 6. 沒有對應需求的任務

{{UNMAPPED_TASKS}}

## 7. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | {{TOTAL_REQUIREMENTS}} |
| 不計入涵蓋率的 SC | {{EXCLUDED_SC}} |
| 計入涵蓋率的需求數 | {{COUNTED_REQUIREMENTS}} |
| 有任務的需求數 | {{COVERED_REQUIREMENTS}} |
| 涵蓋率 | {{COVERAGE_RATE}} |
| 任務總數 | {{TOTAL_TASKS}} |
| 介面總數 | {{TOTAL_INTERFACES}} |
| 沒有 Planner 產出的介面數 | {{INTERFACES_WITHOUT_PLANNER_OUTPUT}} |
| 沒有任務的介面數 | {{INTERFACES_WITHOUT_TASKS}} |
| 受約束欄位數 | {{CONSTRAINED_FIELDS}} |
| 沒有 Must Read 引用的受約束欄位數 | {{FIELDS_WITHOUT_MUST_READ}} |
| 找不到的欄位引用數 | {{UNRESOLVED_FIELD_CITATIONS}} |
| 問題數（依類別） | {{ISSUES_BY_CATEGORY}} |
| 問題數（依嚴重度） | {{ISSUES_BY_SEVERITY}} |

## 8. 下一步

{{NEXT_STEPS}}
