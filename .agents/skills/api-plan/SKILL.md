---
name: api-plan
description: 已有 plan.md、要為後端介面產出 API 合約時使用：依 plan.md 系統介面盤點中端點類型為後端的介面，或 system-analysis 委派的介面編號，參考 spec.md、技術研究結果與前面 Wave 的產出，把 HTTP 介面寫成 OpenAPI 3.1、WebSocket／Socket.IO 等事件介面寫成 AsyncAPI 3.0，存到 spec 目錄的 contracts/，每個 operation 標出所屬介面與需求編號。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 api-plan、API 合約、API 文件、OpenAPI、AsyncAPI、contracts 時使用。盤點介面與安排 Wave 改用 system-analysis；設計資料模型改用 data-plan；設計畫面與雛形改用 ui-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` 下的既有檔案（不存在的略過），加入「規劃輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為後端的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
7. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有後端介面、不產出合約，並停止執行。
8. `THINK` 依 `techstack.md`／`research.md` 採用的傳輸方式歸類「負責介面」：以 HTTP 傳輸的介面歸入 `contracts/openapi.yaml`，以 WebSocket、Socket.IO、SSE 或訊息佇列等事件傳輸的介面歸入 `contracts/asyncapi.yaml`，同時使用兩種傳輸的介面兩邊都歸入；傳輸方式不屬於這兩類的介面記為「無法規劃介面」；有歸入介面的檔案建立為「目標合約檔」，其餘介面建立為「可規劃介面」。
9. `WRITE` 「目標合約檔」中有已存在的檔案，且委派內容沒有說明使用者已同意覆寫時，列出這些檔案並詢問使用者是否覆寫；沒有已存在的檔案或委派內容已說明同意時，略過本步驟與下一步。
10. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有合約檔、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「可規劃介面」與「目標合約檔」已決定，且沒有既有合約檔或使用者已同意覆寫；或缺少輸入、沒有後端介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 設計 API 合約

1. `READ` 設計 API 合約時，讀取 `rules/API合約-格式規範.md` 的所有 Rule，建立「API 合約檢查清單」。
2. `THINK` 依「規劃輸入」與已載入的「API 合約檢查清單」，為「可規劃介面」設計 operation、request、response、錯誤回應與 schema，只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作，建立「API 設計」。

完成條件：「API 設計」已涵蓋每個「可規劃介面」。

## Phase 3 -- 產出合約檔

1. `READ` 「目標合約檔」包含 `contracts/openapi.yaml` 時讀取 `templates/openapi.yaml` 與 `templates/openapi.example.yaml`，包含 `contracts/asyncapi.yaml` 時讀取 `templates/asyncapi.yaml` 與 `templates/asyncapi.example.yaml`，命名載入結果為「合約樣板組」。
2. `WRITE` 依「合約樣板組」與「API 設計」，將「目標合約檔」寫入「目標 spec」所在目錄的 `contracts/`，不建立或修改其他檔案：`info.title` 填 spec.md 的功能名稱；`summary` 與 `description` 使用繁體中文，路徑、欄位名稱、`operationId` 等識別字使用英文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_contracts.py --spec <目標 spec 絕對路徑> --interfaces <可規劃介面編號，以逗號分隔> <目標合約檔絕對路徑…>`，取得「合約檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「合約檢查結果」沒有問題，逐條驗證「API 合約檢查清單」，比對合約檔與「合約樣板組」的頂層結構並確認沒有殘留的 `{{`，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正合約檔後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者或委派方回報每個合約檔的路徑、每個「可規劃介面」的 operation 數、「無法規劃介面」，以及「未通過項」（沒有時說明全部通過）。

完成條件：「目標合約檔」已寫入 `contracts/`，合約檢查結果、「API 合約檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
