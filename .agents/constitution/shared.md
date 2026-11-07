# Rule 1 - 文件的說明文字必須使用繁體中文

- 本規則適用於 `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/`、`data/` 與 `tasks.md` 中給人閱讀的說明文字，例如段落、表格內容、OpenAPI 的 `summary` 與 `description`、DBML 的 `Note` 與 `note`。
- 說明文字必須使用臺灣繁體中文。
- 識別字、路徑、指令、套件名稱與業界通用的技術術語必須保留原文，例如 `operationId`、`chat_messages`、`PostgreSQL`、`JSON`。
- 本規則不適用於 Skill 樣板規定保留原文的英文固定段落，例如 `tasks.md` 的 Format、各 Phase 的 Purpose、Implementation Strategy 與 Notes；這些段落可以保留英文。
- 本規則不適用於產品畫面文字，例如 `ui/*.html` 的按鈕文字與錯誤提示；產品畫面文字的語言依 spec 的需求。
- 本規則不適用於程式碼與程式碼註解；程式碼註解的語言依 `skills/implement/code.md`，該檔不存在時不限定。

## Good Example

### Example 1

- OpenAPI 與 DBML 的說明文字都使用繁體中文，識別字保留英文。

```yaml
operationId: listChatMessages
summary: 查詢本房聊天歷史
```

```dbml
Table chat_messages {
  Note: 'D2：同一間房間的聊天訊息，依送出時間排序（FR-002）'
}
```

### Example 2

- `tasks.md` 的 Purpose 與 Implementation Strategy 保留樣板的英文，任務描述的說明文字使用繁體中文。

```markdown
## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 依 plan.md 的 Source Code 建立 `frontend/` 與 `backend/` 目錄結構

## Implementation Strategy

### MVP First (User Story 1 Only)
```

## Bad Example

### Example 1

- 說明文字使用英文，識別字卻被翻成中文。

```yaml
operationId: 查詢聊天訊息
summary: List chat messages
```

```dbml
Table 聊天訊息 {
  Note: 'Chat messages of a room'
}
```

### Example 2

- 任務描述不屬於樣板的英文固定段落，卻以英文撰寫。

```markdown
## Phase 3: User Story 1 - 以四碼配對碼開房或加入房間 (Priority: P1) 🎯 MVP

- [ ] T020 [US1] Create the room with a four-digit pair code in `backend/src/rooms/service.ts`
```
