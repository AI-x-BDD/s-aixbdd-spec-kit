# 通知規劃：{{FEATURE_NAME}}

- spec：`{{SPEC_PATH}}`
- 上游：`plan.md`、{{UPSTREAM_FILES}}
- 負責介面：{{ASSIGNED_INTERFACE_IDS}}

## 1. 範疇

### 負責介面

| 介面 | 名稱 | 端點類型 | 本文件負責 | 需求依據 |
| ---- | ---- | -------- | ---------- | -------- |
| {{INTERFACE_ID}} | {{INTERFACE_NAME}} | {{ENDPOINT_TYPE}} | {{RESPONSIBILITY}} | {{REQUIREMENT_IDS}} |

### 不在範疇

| 介面 | 名稱 | 理由 |
| ---- | ---- | ---- |
| {{OUT_OF_SCOPE_INTERFACE_ID}} | {{OUT_OF_SCOPE_INTERFACE_NAME}} | {{OUT_OF_SCOPE_REASON}} |

### 觸發條件

| 編號 | 條件 | 觸發介面 | 讀取的資料 | 需求 |
| ---- | ---- | -------- | ---------- | ---- |
| TR{{TRIGGER_NO}} | {{TRIGGER_CONDITION}} | {{TRIGGER_INTERFACE_ID}} | {{TRIGGER_READ_FIELDS}} | {{TRIGGER_REQUIREMENT_IDS}} |

## 2. 通知狀態與轉換

狀態來源：{{STATUS_ENUM_SOURCE}}

| 狀態值 | 意義 | 終態 | 需求 |
| ------ | ---- | ---- | ---- |
| `{{STATUS_VALUE}}` | {{STATUS_MEANING}} | {{IS_TERMINAL}} | {{STATUS_REQUIREMENT_IDS}} |

| 從 | 事件 | 到 | 觸發介面 | 寫入欄位 | 需求 |
| -- | ---- | -- | -------- | -------- | ---- |
| `{{FROM_STATUS}}` | {{TRANSITION_EVENT}} | `{{TO_STATUS}}` | {{TRANSITION_INTERFACE_ID}} | {{WRITTEN_FIELDS}} | {{TRANSITION_REQUIREMENT_IDS}} |

系統恢復運作時：

| 停止時的狀態 | 恢復後的處理 | 觸發介面 | 需求 |
| ------------ | ------------ | -------- | ---- |
| `{{INTERRUPTED_STATUS}}` | {{RECOVERY_ACTION}} | {{RECOVERY_INTERFACE_ID}} | {{RECOVERY_REQUIREMENT_IDS}} |

## 3. 失敗分類與重試界線

| 回應 | 分類 | 對方是否收到 | 自動重試 | 等待與上限 | 最終狀態與原因 | 需求 |
| ---- | ---- | ------------ | -------- | ---------- | -------------- | ---- |
| {{RESPONSE}} | {{FAILURE_CLASS}} | {{RECEIVED}} | {{AUTO_RETRY}} | {{WAIT_AND_LIMIT}} | {{FINAL_STATUS_AND_REASON}} | {{FAILURE_REQUIREMENT_IDS}} |

## 4. 重複處理

| 來源 | 防護 | 殘留風險 |
| ---- | ---- | -------- |
| {{DUPLICATE_SOURCE}} | {{DUPLICATE_GUARD}} | {{RESIDUAL_RISK}} |

## 5. 介面規格

### 5.{{SECTION_NO}} {{INTERFACE_ID}} {{INTERFACE_NAME}}

{{INTERFACE_SPEC}}

## 6. 紀錄需求

| 紀錄項目 | 寫入位置 | 寫入時機 | 不得記錄 | 需求 |
| -------- | -------- | -------- | -------- | ---- |
| {{RECORD_ITEM}} | {{RECORD_LOCATION}} | {{RECORD_TIMING}} | {{RECORD_FORBIDDEN}} | {{RECORD_REQUIREMENT_IDS}} |

## 7. 驗收情境

### NS{{SCENARIO_NO}} {{SCENARIO_TITLE}}

- 介面：{{SCENARIO_INTERFACE_IDS}}
- 需求：{{SCENARIO_REQUIREMENT_IDS}}
- Given {{GIVEN}}
- When {{WHEN}}
- Then {{THEN}}

## 8. 上游衝突與使用者決定

### 上游衝突

| 編號 | 位置 | 問題 | 處理 Skill |
| ---- | ---- | ---- | ---------- |
| UC{{CONFLICT_NO}} | {{CONFLICT_LOCATION}} | {{CONFLICT_PROBLEM}} | {{CONFLICT_SKILL}} |

### 使用者決定

| 編號 | 問題 | 決定 | 影響段落 |
| ---- | ---- | ---- | -------- |
| UD{{DECISION_NO}} | {{DECISION_QUESTION}} | {{DECISION}} | {{DECISION_SECTIONS}} |
