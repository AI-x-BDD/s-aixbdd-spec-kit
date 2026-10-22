# Rule 1 - 段落與條目必須依實際內容增減

- 使用者故事、驗收情境、FR、NFR、Edge Cases、Key Entities、Success Criteria 與 Assumptions 的條目數必須依實際內容決定，不得為了對齊樣板的條目數而補湊或刪減。
- 使用者故事沒有專屬 NFR 時，必須省略該故事的 `**Non-Functional Requirements**:` 小節，不得留下空小節或填寫「無」。
- 全域需求沒有 FR 時，必須省略 `#### Functional Requirements`；沒有 NFR 時，必須省略 `#### Non-Functional Requirements`；兩者都沒有時，必須省略整個 `### Global Requirements`。
- 沒有進行澄清時，必須省略整個 `## Clarifications`。
- 功能不涉及需要保存或管理的資料時，必須省略 `### Key Entities`。

## Good Example

- 使用者故事 1 沒有專屬 NFR，因此只保留驗收情境與功能需求，直接接到分隔線。

```markdown
**Acceptance Scenarios**:

1. **Given** 使用者已有數個不同日期的相簿，**When** 檢視主頁面，**Then** 相簿依「年＋月」分組顯示。

**Functional Requirements**:

- **FR-003**: 系統必須 (MUST) 依相簿日期以「年＋月」為粒度自動分組顯示相簿。

---
```

## Bad Example

- 同一個故事沒有專屬 NFR，卻保留空的 NFR 小節並填寫「無」。

```markdown
**Functional Requirements**:

- **FR-003**: 系統必須 (MUST) 依相簿日期以「年＋月」為粒度自動分組顯示相簿。

**Non-Functional Requirements**:

- 無

---
```

# Rule 2 - Clarifications 必須對應已確認的決策

- 每條 `Q → A` 必須對應「澄清結果」中一項經使用者回答的已確認決策；使用者沒有回答的問題不得寫入。
- 每條 `Q → A` 的問題後方必須以括號標註受該決策影響的 FR 或 NFR 編號。
- `### Session` 後方必須使用進行澄清當天的日期，格式為 `YYYY-MM-DD`。

## Good Example

- 問答來自使用者已回答的決策，標註了受影響的 `FR-003`，Session 是澄清當天的日期。

```markdown
### Session 2026-10-20

- Q: 主頁面上的相簿日期分組應該採用哪種時間粒度? (FR-003) → A: 依「年＋月」分組，預設由新到舊排列。
```

## Bad Example

- 問答沒有標註受影響的需求編號，答案也是 AI 自行補上、使用者沒有回答過的內容。

```markdown
### Session 2026-10-20

- Q: 主頁面上的相簿日期分組應該採用哪種時間粒度? → A: 應該是依日分組比較直覺。
```

# Rule 3 - Success Criteria 必須可量測且技術中立

- 每條 Success Criteria 必須包含可檢查的數值、比率或時間門檻。
- Success Criteria 不得提及框架、資料庫、API 或其他技術實作。

## Good Example

- 成功標準用照片數量與秒數表達，不涉及任何技術實作。

```markdown
- **SC-003**: 當單一相簿包含達 200 張照片時，平鋪式預覽介面的初始呈現時間低於 2 秒。
```

## Bad Example

### Example 1

- 成功標準只描述感受，沒有可檢查的門檻。

```markdown
- **SC-003**: 使用者會覺得瀏覽相簿很流暢。
```

### Example 2

- 成功標準有門檻，但量測對象是技術實作的快取。

```markdown
- **SC-003**: 相簿縮圖的 Redis 快取命中率達 90% 以上。
```

# Rule 4 - Assumptions 必須寫出預設內容且不得引入新需求

- 「待寫入假設」的每一項必須寫成一條 Assumption，並寫出本次採用的預設內容。
- Assumption 不得引入新的必做功能；拿掉後會改變系統必備行為的內容，必須寫成 FR 或 NFR。

## Good Example

- 假設寫出了使用者沒有指定、由 AI 採用的預設範圍，沒有新增必做功能。

```markdown
- **個人單機／本地優先使用情境**：預設本應用程式為個人照片整理工具，第一版不包含多人權限管理與帳號登入。
```

## Bad Example

### Example 1

- 假設只指出不確定之處，沒有寫出採用的預設內容。

```markdown
- **使用者人數**：不確定是單人還是多人使用。
```

### Example 2

- 假設偷渡了一項新的必做功能，拿掉後會改變系統行為，應寫成 FR。

```markdown
- **相簿命名**：系統必須以 AI 自動產生每個相簿的名稱與封面。
```

# Rule 5 - 澄清決策、需求、驗收情境與 Edge Cases 必須一致

- Clarifications 中的每項決策必須反映在其標註編號之 FR 或 NFR 的內文。
- 驗收情境的 `Then` 與 Edge Cases 描述的處理方式不得與 FR 或 NFR 衝突。

## Good Example

- 澄清決定以「年＋月」分組，FR-003 與驗收情境使用相同的粒度。

情境：

- Clarifications：`(FR-003) → A: 依「年＋月」分組`。
- FR-003：系統必須 (MUST) 依相簿日期以「年＋月」為粒度自動分組顯示相簿。
- 驗收情境：**Then** 相簿依「年＋月」分組顯示。

## Bad Example

- 同一個澄清決策沒有反映到 FR-003，驗收情境又使用第三種粒度。

情境：

- Clarifications：`(FR-003) → A: 依「年＋月」分組`。
- FR-003：系統必須 (MUST) 依拍攝日期逐日分組顯示相簿。
- 驗收情境：**Then** 相簿依年份分組顯示。
