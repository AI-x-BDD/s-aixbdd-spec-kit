# 類別圖

```mermaid
%%{init: {'themeCSS': '.added rect, .added path { fill: #e6f4ea; stroke: #1e8e3e; } .changed rect, .changed path { fill: #fef7e0; stroke: #e37400; } .removed rect, .removed path { fill: #fce8e6; stroke: #d93025; stroke-dasharray: 5 5; } .kept rect, .kept path { fill: #f1f3f4; stroke: #80868b; } .added text, .changed text, .removed text, .kept text { fill: #202124; } .added span, .changed span, .removed span, .kept span { color: #202124; }'}}%%
classDiagram
    {{RELATION_1_SOURCE}} {{RELATION_1_ARROW}} {{RELATION_1_TARGET}} : {{RELATION_1_LABEL}}
    {{RELATION_2_SOURCE}} {{RELATION_2_ARROW}} {{RELATION_2_TARGET}} : {{RELATION_2_LABEL}} «new»
    {{RELATION_3_SOURCE}} {{RELATION_3_ARROW}} {{RELATION_3_TARGET}} : {{RELATION_3_LABEL}} «removed»
    {{RELATION_4_SOURCE}} {{RELATION_4_ARROW}} {{RELATION_4_TARGET}} : {{RELATION_4_LABEL}} «new»
    {{RELATION_5_SOURCE}} {{RELATION_5_ARROW}} {{RELATION_5_TARGET}}

    class {{MODIFIED_CLASS}}:::changed {
        <<modified>>
        {{MODIFIED_CLASS_CHANGED_MEMBER}} «changed»
        {{MODIFIED_CLASS_NEW_MEMBER}} «new»
    }

    class {{NEW_INTERFACE}}:::added {
        <<interface · new>>
        {{NEW_INTERFACE_MEMBER_1}}
        {{NEW_INTERFACE_MEMBER_2}}
    }

    class {{NEW_CLASS}}:::added {
        <<new>>
    }

    class {{DELETED_CLASS}}:::removed {
        <<deleted>>
        {{DELETED_CLASS_MEMBER}}
    }

    class {{EXISTING_INTERFACE}}:::kept {
        <<interface · existing>>
    }

    class {{EXISTING_CLASS}}:::kept {
        <<existing>>
    }
```

圖例：

| 標記 | 標在 | 意義 | 樣式類別 |
| ---- | ---- | ---- | -------- |
| `<<new>>` | 類別 | 本次新增的類別 | `added`（綠） |
| `<<modified>>` | 類別 | 既有類別，本次修改其成員或行為 | `changed`（橘） |
| `<<deleted>>` | 類別 | 既有類別，本次刪除 | `removed`（紅色虛線框） |
| `<<existing>>` | 類別 | 既有類別，本次不修改，只呈現協作關係 | `kept`（灰） |
| `«new»` | 成員、關係標籤結尾 | 本次新增的成員或關係 | — |
| `«changed»` | 成員結尾 | 本次修改簽章或行為的成員 | — |
| `«removed»` | 成員、關係標籤結尾 | 本次移除的成員或關係 | — |

# 設計說明與實作順序

## 設計說明

- `{{NEW_INTERFACE}}`（新增）：{{NEW_INTERFACE_DESIGN_NOTE}}
- `{{NEW_CLASS}}`（新增）：{{NEW_CLASS_DESIGN_NOTE}}
- `{{MODIFIED_CLASS}}`（修改）：{{MODIFIED_CLASS_DESIGN_NOTE}}
- `{{DELETED_CLASS}}`（刪除）：{{DELETED_CLASS_DESIGN_NOTE}}
- `{{EXISTING_INTERFACE}}`（既有）：{{EXISTING_INTERFACE_DESIGN_NOTE}}
- `{{EXISTING_CLASS}}`（既有）：{{EXISTING_CLASS_DESIGN_NOTE}}

## 實作順序

1. {{IMPLEMENTATION_STEP_1}}
2. {{IMPLEMENTATION_STEP_2}}
3. {{IMPLEMENTATION_STEP_3}}
