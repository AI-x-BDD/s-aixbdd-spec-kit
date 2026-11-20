# 規格品質清單：{{FEATURE_TITLE}}

**目的**：進入技術規劃前，確認 spec.md 的完整度與品質
**建立日期**：{{CREATED_DATE}}
**規格**：[spec.md](../spec.md)
**判定方式**：項目括號內引用的規則全部通過時為 `- [x]`，任一未通過時為 `- [ ]`。

## 內容品質

- [{{CQ_1_STATUS}}] 不含技術實作：FR、NFR 不指定框架、程式語言、資料庫或部署方式（功能與非功能需求 Rule 4）
- [{{CQ_2_STATUS}}] 以使用者價值撰寫：每個使用者故事描述使用者能得到的成果，優先級依使用者價值排列（使用者故事 Rule 1、Rule 2）
- [{{CQ_3_STATUS}}] 讀者是非技術利害關係人：FR、NFR 與 SC 以外的段落不使用技術用語（spec 文件 Rule 7）
- [{{CQ_4_STATUS}}] 必要段落齊全：段落順序與條目格式和 spec 樣板相同，省略的段落符合規則（spec 文件 Rule 1、spec 樣板）

## 需求完整性

- [{{RC_1_STATUS}}] 沒有殘留待澄清事項：每個未確認事項都已有預設內容，並寫成推定需求、Assumptions 或 Out of Scope（功能與非功能需求 Rule 6、spec 文件 Rule 4）
- [{{RC_2_STATUS}}] 需求可測試且無歧義：FR、NFR 依性質區分並以 MUST 陳述可驗證條件，編號唯一，歸屬正確（功能與非功能需求 Rule 1～3）
- [{{RC_3_STATUS}}] 成功標準可量測、技術中立，並從使用者或業務角度描述（spec 文件 Rule 3）
- [{{RC_4_STATUS}}] Edge Cases 已列出：Edge Cases 至少一條，處理方式和 FR、NFR 一致（spec 文件 Rule 1、Rule 5）
- [{{RC_5_STATUS}}] 範圍有界：Out of Scope 至少一項並標示來源（spec 文件 Rule 6）
- [{{RC_6_STATUS}}] 依賴與假設已列出：依賴標「（依賴）」，預設前提與推定引用都寫在 Assumptions（spec 文件 Rule 4）

## 功能就緒

- [{{FR_1_STATUS}}] 驗收情境齊全：每個故事的驗收情境以 Given／When／Then 描述可觀察結果，涵蓋成功路徑與至少一個例外（使用者故事 Rule 3）
- [{{FR_2_STATUS}}] 每條 FR 有驗收情境：每條 FR 都有驗證它的驗收情境，澄清決策、需求與驗收情境一致（功能與非功能需求 Rule 5、spec 文件 Rule 2）

## Notes

- {{NOTE_1}}
