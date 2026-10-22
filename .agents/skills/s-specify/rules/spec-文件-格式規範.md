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

# Rule 4 - Assumptions 只寫預設前提與推定的引用

- 「未確認事項」中屬於範圍排除的項目，必須依 Rule 6 寫入 Out of Scope。
- 「推定需求」的每一項必須在 Assumptions 列一條，標題寫出推定採用的做法或 AI 決定的值，並引用對應的需求編號；Success Criteria 沿用某條推定需求的門檻時，在同一條引用中一併列出該 SC 編號。
- Success Criteria 的門檻不是沿用或直接換算自 FR、NFR，且依 `rules/功能與非功能需求-格式規範.md` Rule 6 的判斷屬於 AI 決定時，必須另列一條推定引用，標題寫出該門檻，並引用該 SC 編號。
- 「未確認事項」中其餘每一項必須寫成一條 Assumption，並寫出本次採用的預設內容。
- Assumption 不得描述系統必須做到的行為或品質，也不得重寫、補充或擴充任何 FR、NFR 或 Clarifications 決策的內容。

## Good Example

- 一般假設寫出預設使用情境；推定的系統行為與 AI 決定的門檻已寫成需求，Assumptions 只列推定的做法或值與編號；沿用 NFR-001 門檻的 SC-003 列在同一條，只出現在 Success Criteria 的 SC-001 門檻另列一條。

```markdown
- **個人單機／本地優先使用情境**：預設本應用程式為個人照片整理工具，由單一使用者直接操作管理。
- **刪除最後一個相簿時移除日期分組標題**（推定）：見 FR-011。
- **預覽 200 張照片 2 秒內呈現**（推定）：見 NFR-001、SC-003。
- **20 張照片 2 分鐘內完成整理、首次操作成功率 95%**（推定）：見 SC-001。
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

### Example 3

- 引用推定需求時又補上 FR-011 沒有的行為，Assumptions 與需求內容不一致。

```markdown
- **刪除最後一個相簿時移除日期分組標題**（推定）：見 FR-011；移除前另外顯示確認提示，並保留 7 天可復原。
```

### Example 4

- AI 決定的門檻沒有任何推定引用：NFR-001 的 2 秒只寫在需求裡，沿用它的 SC-003 也沒有列出；只出現在 Success Criteria 的 SC-001 門檻同樣沒有引用。

```markdown
- **個人單機／本地優先使用情境**：預設本應用程式為個人照片整理工具，由單一使用者直接操作管理。
- **刪除最後一個相簿時移除日期分組標題**（推定）：見 FR-011。
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

# Rule 6 - Out of Scope 必須列出本次不做的範圍並標示來源

- `## Out of Scope` 必須至少列出一項，每項描述一個本次不提供的功能或範圍，不得寫成預設值或假設。
- 每一項必須在標題後以括號標示來源：使用者在功能描述或 clarify 中明確排除的，標「使用者決定」；其餘由 AI 推定排除的，標「推定」。
- 同一項排除內容只能出現在 Out of Scope，不得同時寫在 Assumptions。

## Good Example

- 排除項只寫在 Out of Scope 並標示來源；Assumptions 只保留預設的使用情境。

```markdown
## Out of Scope

- **多人帳號與權限管理**（推定）：第一版不提供帳號登入、多人共用相簿與權限設定。

## Assumptions

- **個人單機／本地優先使用情境**：預設本應用程式為個人照片整理工具，由單一使用者直接操作管理。
```

## Bad Example

- 同一個排除同時寫在 Out of Scope 與 Assumptions，且 Out of Scope 的項目沒有標示來源。

```markdown
## Out of Scope

- **多人帳號與權限管理**：第一版不提供帳號登入、多人共用相簿與權限設定。

## Assumptions

- **個人單機／本地優先使用情境**：預設本應用程式為個人照片整理工具，第一版不包含多人權限管理與帳號登入。
```
