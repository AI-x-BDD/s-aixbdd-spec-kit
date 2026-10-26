---
name: data-plan
description: 已有 plan.md、要為資料庫介面設計資料模型時使用：依 plan.md 系統介面盤點中端點類型為資料庫的介面，或 system-analysis 委派的介面編號，參考 spec.md 的 Key Entities 與需求、技術研究採用的資料庫與前面 Wave 的產出，以 DBML 寫出資料表、欄位約束、Enum 與關聯，存成 spec 目錄的 data/data-model.dbml，每張資料表標出所屬介面與需求依據。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 data-plan、資料模型、data model、DBML、資料表設計、ER 圖時使用。盤點介面與安排 Wave 改用 system-analysis；設計 API 合約改用 api-plan；設計畫面與雛形改用 ui-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` 下的既有檔案（不存在的略過），加入「規劃輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為資料庫的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
7. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有資料庫介面、不產出資料模型，並停止執行。
8. `WRITE` `data/data-model.dbml` 已存在，且委派內容沒有說明使用者已同意覆寫時，詢問使用者是否覆寫；不存在或委派內容已說明同意時，略過本步驟與下一步。
9. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有資料模型、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「負責介面」已決定，且沒有既有資料模型或使用者已同意覆寫；或缺少輸入、沒有資料庫介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 設計資料模型

1. `READ` 設計資料模型時，讀取 `rules/資料模型-格式規範.md` 的所有 Rule，建立「資料模型檢查清單」。
2. `THINK` 依「規劃輸入」與已載入的「資料模型檢查清單」，為「負責介面」設計資料表、欄位、Enum、索引與關聯，欄位型別使用技術研究採用的資料庫支援的型別，不設計 API 或程式實作，建立「資料模型設計」。

完成條件：「資料模型設計」已涵蓋每個「負責介面」。

## Phase 3 -- 產出 data-model.dbml

1. `READ` `templates/data-model.dbml` 與 `templates/data-model.example.dbml`，載入骨架與範例，命名載入結果為「資料模型樣板組」。
2. `WRITE` 依「資料模型樣板組」與「資料模型設計」，將 `data-model.dbml` 寫入「目標 spec」所在目錄的 `data/`，不建立或修改其他檔案：`Project` 名稱使用目標 spec 目錄名稱去掉編號後的英文名稱，`database_type` 填技術研究採用的資料庫；`Note` 使用繁體中文，資料表、欄位與 Enum 名稱使用英文 snake_case。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_data_model.py --spec <目標 spec 絕對路徑> --interfaces <負責介面編號，以逗號分隔> <data-model.dbml 絕對路徑>`，取得「資料模型檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「資料模型檢查結果」沒有問題且其中的 `database_type` 與技術研究採用的資料庫一致，逐條驗證「資料模型檢查清單」，比對 `data-model.dbml` 與「資料模型樣板組」的區塊結構並確認沒有殘留的 `{{`，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `data-model.dbml` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者或委派方回報 `data-model.dbml` 路徑、每個「負責介面」對應的資料表，以及「未通過項」（沒有時說明全部通過）。

完成條件：`data/data-model.dbml` 已寫入，資料模型檢查結果、「資料模型檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
