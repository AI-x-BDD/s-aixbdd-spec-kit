# Codex 選模與委派

本文件只適用於 Codex。Claude Code 使用共用指引中原有的 Claude Code 規則。

## 工作分配

主 session 預期使用 `gpt-6.1-sol`／`high`，負責日常跟練、Skill 設計、需求訪談、統整與回報。保留使用者目前選定的主模型；本規則不會改變正在執行的主 session。

| 工作 | 自訂代理 | model | effort |
|---|---|---|---|
| 已確認計畫的施工 | `course-implementer` | `gpt-6.1-sol` | `medium` |
| 跨 Skill 職責重設，或已嘗試修正仍重現的複雜根因分析 | `course-analyst` | `gpt-6-astra` | `high` |
| 由 Sol 設計之 Skill 的獨立驗收 | `skill-tester-luna` | `gpt-6-luna` | `high` |
| 由 Astra 設計之 Skill 的獨立驗收 | `skill-tester-sol` | `gpt-6.1-sol` | `medium` |

以本次已確認藍圖的設計模型決定驗收代理，不以負責回報或施工的模型決定。多個模型參與設計時，使用定位最高者作為依據。設計模型不在表中或無法確認時，先詢問使用者。

Luna／high 是候選驗收基準，尚未完成本專案 Skills 的整體校準。單次設定測試不代表 Skill 已通過驗收。

## 委派方式

1. 工作符合表列條件且所需輸入已齊備時，直接委派，不另詢問例行選模。Skill 的需求澄清、根因確認與藍圖確認閘門照常執行。
2. 支援自訂代理的 Codex client 使用 `.codex/agents/` 中對應代理；支援顯式選模的委派工具可依表指定 model、effort，並提供對應 TOML 中的 `developer_instructions`。驗收必須建立全新代理，不帶設計對話（工具有 `fork_turns` 時設為 `none`）。
3. 目前 client 不支援前述方式時，可在已準備好的暫存測試專案，以 `codex exec -C <測試專案> -m <model> -c 'model_reasoning_effort="<effort>"' --json -o <結果檔> - < <提示檔>` 啟動獨立 CLI。顯式選模方式須同時載入對應代理指引，沿用目前權限限制，不藉啟動新程序放寬權限。
4. 代理指引來自表列 TOML 的 `developer_instructions`。以 CLI 執行時，提示檔包含該指引、測試環境、Skill 絕對路徑、情境輸入及預先回覆；不加入設計理由或預期正確答案。測試專案需包含受測 Skill 所需的依賴。
5. 模型不可用或無法啟動時，保留錯誤並請使用者選模型；未取得回覆前停止該項委派，不自動換模型。驗收失敗不觸發模型備援，依原 Skill 流程分析；較強模型的診斷重跑須獨立記錄，不覆蓋原驗收結果。
6. 由主 session 依驗收條件核對結果，記錄情境、代理名稱、指定 model／effort、執行方式、產出與錯誤。平台提供實際執行設定時另行記錄，未提供時註明「僅確認指定值，未取得實際執行設定」，不以模型自述作為證據。

`.codex/agents/*.toml` 是各代理執行設定的來源；新增或調整時同步更新本表。主 session 與全域 Codex 設定不由這些代理檔變更。

## 依據

- [Codex custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents)：專案代理使用 `.codex/agents/*.toml`，明確設定 model 與 model_reasoning_effort。
- [Codex models](https://learn.chatgpt.com/docs/models)：主 session 由使用者介面或啟動參數選模。
