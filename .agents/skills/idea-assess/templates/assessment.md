# 構想評估：{{IDEA_TITLE}}

- **Slug**：{{SLUG}}
- **建立日期**：{{CREATED_DATE}}
- **結論**：go／needs-clarification／kill
- **推薦方案**：{{RECOMMENDED_PLAN}}
- **整體證據信心**：high／medium／low

## 1. 構想收件

- **來源**：{{IDEA_SOURCE}}
- **類型**：new-capability／improvement／fix／exploration／cost-saving／compliance／other

### 構想原文

> {{IDEA_ORIGINAL_TEXT}}

### 重述

{{IDEA_RESTATEMENT}}

### 提出者與背景

- **提出者**：{{PROPOSER}}
- **觸發原因**：{{TRIGGER_REASON}}

### 初步未知事項

- [NEEDS CLARIFICATION: {{INITIAL_UNKNOWN}}]

## 2. 證據研究

{{EVIDENCE_OVERVIEW}}

### 使用者與需求

- {{USER_NEED_FINDING}} — [來源：{{USER_NEED_SOURCE}}]（信心：high／medium／low）

### 先例

- {{PRECEDENT_FINDING}} — {{PRECEDENT_IMPLICATION}} — [來源：{{PRECEDENT_SOURCE}}]（信心：high／medium／low）

### 市場與現況

- {{MARKET_FINDING}} — [來源：{{MARKET_SOURCE}}]（信心：high／medium／low）

### 資料與限制

- {{DATA_CONSTRAINT_FINDING}} — [來源：{{DATA_CONSTRAINT_SOURCE}}]（信心：high／medium／low）

### 反對這個構想的證據

- {{COUNTER_EVIDENCE}} — [來源：{{COUNTER_EVIDENCE_SOURCE}}]

### 缺口與待確認問題

- [NEEDS CLARIFICATION: {{EVIDENCE_GAP}}]

### 來源

| 網址 | host | 抓取結果 | 性質 |
| ---- | ---- | -------- | ---- |
| {{SOURCE_URL}} | {{SOURCE_HOST}} | {{FETCH_RESULT}} | {{SOURCE_NATURE}} |

## 3. 問題定義

### 問題陳述

{{PROBLEM_STATEMENT}}

### 受影響的使用者與利害關係人

- **使用者**：{{USER_ROLE}} — {{USER_ROLE_DESCRIPTION}}
- **利害關係人**：{{STAKEHOLDER_ROLE}} — {{STAKEHOLDER_DESCRIPTION}}（來源：{{STAKEHOLDER_SOURCE}}）

### 目標

- {{GOAL}}

### 非目標

- {{NON_GOAL}}

### 成功指標

- {{SUCCESS_METRIC}}（{{METRIC_TYPE}}；基準：{{METRIC_BASELINE}}）

### 不做的代價

{{COST_OF_INACTION}}

### 待確認問題

- [NEEDS CLARIFICATION: {{PROBLEM_OPEN_QUESTION}}]

## 4. 方案構想

### 方案

#### 方案 A — {{PLAN_A_TITLE}}

- **概述**：{{PLAN_A_SUMMARY}}
- **投入規模**：small／medium／large
- **取捨**：{{PLAN_A_TRADEOFF}}
- **範圍失控風險**：{{PLAN_A_SCOPE_RISK}}

#### 方案 B — {{PLAN_B_TITLE}}

- **概述**：{{PLAN_B_SUMMARY}}
- **投入規模**：small／medium／large
- **取捨**：{{PLAN_B_TRADEOFF}}
- **範圍失控風險**：{{PLAN_B_SCOPE_RISK}}

#### 方案 C — {{PLAN_C_TITLE}}

- **概述**：{{PLAN_C_SUMMARY}}
- **投入規模**：small／medium／large
- **取捨**：{{PLAN_C_TRADEOFF}}
- **範圍失控風險**：{{PLAN_C_SCOPE_RISK}}

### 推薦

{{RECOMMENDATION}}

### 不在範圍內（方案 {{RECOMMENDED_PLAN_LETTER}}）

- {{OUT_OF_SCOPE_ITEM}}

### 待驗證的假設

- {{ASSUMPTION_TO_VERIFY}}

## 5. 判定

### 評分表

| 準則 | 評級 | 理由 |
| ---- | ---- | ---- |
| 問題成立度 | strong／adequate／weak／unknown | {{PROBLEM_VALIDITY_REASON}} |
| 證據強度 | strong／adequate／weak／unknown | {{EVIDENCE_STRENGTH_REASON}} |
| 價值與不做的代價 | strong／adequate／weak／unknown | {{VALUE_REASON}} |
| 可行性與投入規模 | strong／adequate／weak／unknown | {{FEASIBILITY_REASON}} |
| 策略契合度 | strong／adequate／weak／unknown | {{STRATEGIC_FIT_REASON}} |
| 風險掌握度 | strong／adequate／weak／unknown | {{RISK_CONTROL_REASON}} |

### 判定理由

{{VERDICT_REASON}}

### 交接給 `s-specify`

- **問題**：{{HANDOFF_PROBLEM}}
- **採用方案**：{{HANDOFF_PLAN}}
- **範圍**：{{HANDOFF_SCOPE}}
- **成功指標**：{{HANDOFF_SUCCESS_METRICS}}
- **帶到規格的待確認問題**：{{HANDOFF_OPEN_QUESTIONS}}

```text
讀取 `.agents/skills/s-specify/SKILL.md` 並依其 SOP 執行。功能描述：{{S_SPECIFY_FEATURE_DESCRIPTION}}
```

### 阻擋問題與要補的段落

- [NEEDS CLARIFICATION: {{BLOCKING_QUESTION}}] — 要補的段落：{{SECTION_TO_COMPLETE}}

### 決定性理由

{{KILL_DECISIVE_REASON}}
