# 收斂評估：{{FEATURE_NAME}}

- **spec 目錄**：`{{SPEC_DIR}}`
- **程式目錄**：`{{CODE_DIR}}`
- **輪次**：{{ROUND_COUNT}}

{{PREVIOUS_ROUNDS}}

## 第 {{ROUND}} 輪

- **日期**：{{ROUND_DATE}}
- **評估狀態**：{{EVALUATED_STATE}}
- **結果**：{{ROUND_RESULT}}（附加任務 {{APPEND_TASK_COUNT}}、上游缺口 {{UPSTREAM_GAP_COUNT}}、不處理 {{NO_ACTION_COUNT}}）

### 檢查範圍

| 項目 | 數量 | 說明 |
|---|---|---|
{{SCOPE_ROWS}}

{{CODE_SCOPE}}

{{PREVIOUS_GAP_RECHECK}}

### 缺口

| ID | 缺口類型 | 嚴重度 | 來源 | 證據 | 剩餘工作 | 處理 |
|---|---|---|---|---|---|---|
{{GAP_ROWS}}

### 下一步

{{NEXT_STEPS}}
