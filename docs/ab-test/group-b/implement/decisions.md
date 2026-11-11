# B 組步驟 8 決策與備註（暫存）
## 委派者（主 session）
- 環境：在 equipment-loan-postgres 容器建立 equipment_loan_ab_b，backend/.env（忽略）指向它，不動主目錄 equipment_loan
- 每個 Phase 委派一個 implementer 子代理（Sonnet），--scope phase:N；委派者跑 status --reset、report 與各 Phase commit
- 發現：vitest/prisma 直接執行不讀 .env，退回 equipment_loan；Phase 1、2 的後端測試寫入主目錄 equipment_loan（結構未改：5 migration、無 overdue 表；預約 22 筆=seed 筆數）。Phase 3 起先 source .env
- Phase 1 commit 訊息少空行，amend 修正（未 push）
## Phase 1（7dda70c）決策：無。基準失敗 api.test.ts SC-001（時間相關）
## Phase 2（c7e3a3c）決策
- T004 Prisma 命令先 source .env；第一次 migrate diff（唯讀）連到 equipment_loan，無寫入
- T004 migrate dev --create-only 非互動中止＋partial unique index 偽差異 → migrate diff 產 SQL 後手寫 migration.sql
- T004 B 組 DB 先套用既有 5 支 migration 再套 008
- T003 partial index idx_overdue_notifications_due 於 T004 手寫 SQL 加入
## Phase 3（未 commit）決策
- T006 設定值不合法退回預設 true/60；webhook 空白或格式錯視為未設定；每次重讀 process.env
- T007 429 無 Retry-After → waitSeconds null，2/4/8 秒退避；未分類狀態碼→unknown；"bad port" 歸 unknown
- T008 __sim/mode 省略欄位用預設（retryAfterSeconds=2、statusCode=500、failTimes=null）；tsconfig include 無 scripts/，tsc 不檢查模擬器（未改）
- T009 id 用 gen_random_uuid()，created_at/updated_at 寫傳入 now
- T010 用 taipeiTime.getSlotStartUtc(date,endTime) 取時段結束
- T011 讀不到內容→unknown 不送；速率限制用模組 pausedUntilMs；領取時寫 updated_at
- T012 start() 回傳 stop，重複呼叫不重啟，timer unref
- T014 模擬器就緒用 url /__sim/state
- 驗證：後端 40/40（SC-001 12:06 通過）、前端 4/4、e2e 5/5；Independent Test success/503/timeout/重啟恢復
## Phase 3 commit abf9dc8（訊息 amend 修正模擬器模式描述）
## Phase 4（未 commit）決策
- T015 新逾期借用只用陳冠廷、EQ-101～103、昨天上午/下午，RV-20261110-20～23；另加 1 筆無通知的昨天下午借用（demo 共 3 筆無通知逾期借用，手動檢查 createdCount 預期 3）
- T016/T018 NOT_RESENDABLE 預設訊息自訂；實際拋出依 ui/plan §5 帶預約編號與狀態
- T018 歸還時間格式 YYYY-MM-DD HH:mm（台北）；競態更新 0 列回通用 NOT_RESENDABLE
- T020 待確認 1：失敗原因文字採 data-model/research/contracts 寫法（無法連線、通知設定有誤：沒有設定、Discord 拒絕訊息內容）
- T020 Must Read 沒列欄位標題/篩選/按鈕文字 → 讀 ui/overdue-notifications.html 當 Optional 延伸
- T020 新錯誤碼放獨立 OVERDUE_NOTIFICATION_ERROR_MESSAGES（ERROR_MESSAGES 維持 19 鍵）
- T023 待確認 4：固定 page=1、pageSize=100，顯示 totalItems
- T023 權限不足文字與「次」放 View 區域常數
- T025 待確認 3（F1）：管理員登入後仍進 equipment-status，只加頁籤；頁籤所有登入者可見，成員看到權限不足卡片；未登入提示文字更新
- 驗證：後端 40/40、前端 4/4、e2e 5/5；瀏覽器 Independent Test 通過
- 主 session：子代理用未限定目錄的 pkill（src/server.ts、discordWebhookSimulator）；確認 5173 屬其他專案、未受影響；停掉殘留 B 組 tsx watch（PID 20277）
## Phase 4 commit 8729f4c
## Phase 5（未 commit）決策
- T026 路由用 new Date() 呼叫 runOverdueCheck，回 200 {createdCount}
- T029 檢查中只停用「立即檢查逾期」「重新整理」，篩選不停用；tone 加 success（.banner-success）；data-testid overdue-check-btn；非 403 錯誤顯示後端訊息或「逾期檢查失敗，請稍後再試。」紅色橫幅
- T029 待確認 4：檢查後 page=1、pageSize=100 重查
- SOP 偏離：T029 沒讀 Must Read 的 ui/overdue-notifications.html（子代理認為 ui/plan.md 已涵蓋），--read 未列該部位
- 驗證：後端 40/40、前端 4/4、e2e 5/5；瀏覽器 Independent Test 通過；403 畫面未用瀏覽器實測（API 403 已測）
## Phase 5 commit 8b7de36
## Phase 6（未 commit）決策
- T030 README 寫間隔可設 10～300（依 notificationConfig）；README 7.1 註明 vitest/prisma/tsx 不讀 .env；README 寫管理員登入後先進設備狀態管理（待確認 3）
- T031 待確認 2：模擬器不能重現的 400、401/403、200 無 id、429 無秒數、204 → 臨時固定回應 HTTP 位址直接呼叫 send 驗證分類，不加模擬器模式
- T031 pausedUntilMs 無重設 → 每情境用不同日期（2031-03-02 起遞增）；只假造 Date，NS12/NS14 真等 10 秒；SC-001 以 60 秒間隔反覆呼叫驗證 0～10 分鐘
- T032 並發重送改用 supertest 打路由取得 202/409
- T034 搜尋 webhooks/000000000000000000 路徑片段，避免與模擬器訊息編號重疊誤判
- T036 新 migration 測試 DB 名 = DATABASE_URL 的 DB 名 + _migration_008_test；007 測試不改
- T038 007 遷移測試寫死 equipment_loan_migration_test（與他組共用風險）→ 完整測試排除它，另以暫存複本（DB 名 equipment_loan_ab_b_migration_007_tmp）跑，合計 76/76
- T039 US3 Independent Test 實測建立 3 則（tasks 寫 1 則為舉例）
- 驗證（12:35～12:41）：後端 76/76、前端 4/4、e2e 5/5；check、build 通過；agent-browser 手動走 US1～US3
