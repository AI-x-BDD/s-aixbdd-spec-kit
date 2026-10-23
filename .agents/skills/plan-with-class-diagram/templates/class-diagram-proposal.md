# 類別圖

```mermaid
%%{init: {'themeCSS': '.added rect, .added path { fill: #e6f4ea; stroke: #1e8e3e; } .changed rect, .changed path { fill: #fef7e0; stroke: #e37400; } .removed rect, .removed path { fill: #fce8e6; stroke: #d93025; stroke-dasharray: 5 5; } .kept rect, .kept path { fill: #f1f3f4; stroke: #80868b; } .added text, .changed text, .removed text, .kept text { fill: #202124; } .added span, .changed span, .removed span, .kept span { color: #202124; }'}}%%
classDiagram
    {{RELATIONSHIP_LINES}}

    {{CLASS_BLOCKS}}
```

圖例：

| 標記 | 標在 | 意義 | 樣式類別 |
| ---- | ---- | ---- | -------- |
| `<<new>>` | 類別 | 本次新增的類別 | `added`（綠） |
| `<<modified>>` | 類別 | 既有類別，本次修改其成員或行為 | `changed`（橘） |
| `<<deleted>>` | 類別 | 既有類別，本次刪除 | `removed`（紅色虛線框） |
| `<<existing>>` | 類別 | 既有類別，本次不修改，只呈現協作關係 | `kept`（灰） |
| `«new»` | 成員、關係標籤、循序圖訊息結尾 | 本次新增的成員、關係或呼叫 | — |
| `«changed»` | 成員結尾 | 本次修改簽章或行為的成員 | — |
| `«removed»` | 成員、關係標籤結尾 | 本次移除的成員或關係 | — |

# 循序圖

{{SEQUENCE_SCENARIOS}}

# 設計說明與實作順序

## 設計說明

{{DESIGN_NOTE_ITEMS}}

## 實作順序

{{IMPLEMENTATION_STEPS}}
