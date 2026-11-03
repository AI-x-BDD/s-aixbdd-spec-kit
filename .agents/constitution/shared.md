# Rule 1 - 文件的說明文字必須使用繁體中文

- 本規則適用於 `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/`、`data/` 與 `tasks.md` 中給人閱讀的說明文字，例如段落、表格內容、OpenAPI 的 `summary` 與 `description`、DBML 的 `Note` 與 `note`。
- 說明文字必須使用臺灣繁體中文。
- 識別字、路徑、指令、套件名稱與業界通用的技術術語必須保留原文，例如 `operationId`、`chat_messages`、`PostgreSQL`、`JSON`。
- 本規則不適用於產品畫面文字，例如 `ui/*.html` 的按鈕文字與錯誤提示；產品畫面文字的語言依 spec 的需求。
- 本規則不適用於程式碼與程式碼註解；程式碼註解的語言依 `skills/implement/code.md`，該檔不存在時不限定。

## Good Example

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

## Bad Example

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
