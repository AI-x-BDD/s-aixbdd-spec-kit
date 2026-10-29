---
name: user-verify-skill
disable-model-invocation: true
description: 目標 Skill 已通過 skill-engineering 的子代理實跑驗收、要由使用者親自實際驗證時使用：在暫存專案以 Herdr 開新 pane 跑全新的 Claude Code，把 clarify 提問與確認閘門轉給使用者回答，獨立核對產出後請使用者判定；通過時移除 description 開頭的「（未驗證）」並把驗證經過寫入紀錄目錄的藍圖，不通過時整理問題證據交給 skill-engineering 優化後重跑。使用者提到 user-verify-skill、使用者實際驗證、親自驗證 Skill、拿掉未驗證時使用。建立或優化 Skill、執行子代理驗收時改用 skill-engineering。
---

# SOP

## Phase 1 -- 收斂驗證輸入

1. `READ` 使用者需求、專案 `.agents/skills/<目標 Skill 名稱>/`（不存在時改讀 `.claude/skills/<目標 Skill 名稱>/`）的 `SKILL.md` 與 `templates/` 中的範例檔，`specs/skill-engineering/` 下符合 `[0-9][0-9]-<目標 Skill 名稱>-*` 的目錄清單，以及主專案 `git rev-parse HEAD` 的結果，建立「驗證輸入」，並記下讀到目標 Skill 的那一側為「目標側」、HEAD 為「執行前 HEAD」。
2. `THINK` 依「驗證輸入」決定「紀錄目錄」：使用者指定時使用該目錄，未指定時使用目錄清單中編號最大的目錄；目標 Skill 或「紀錄目錄」不存在時記為缺少的輸入。
3. `READ` 「紀錄目錄」中 `blueprint.md` 的驗收條件、驗收情境與驗收結果段落，建立「驗收紀錄」。
4. `CHECK` 有缺少的輸入，或「驗收紀錄」的驗收結果為「尚未施工」，或目前版本有任一情境的最終結果未通過（同一情境有多筆結果時以最後一筆為準）時，告知使用者原因並停止執行。
5. `THINK` 決定「實跑需求」、「測試素材」與「測試模型」（模型與推理強度）：使用者已提供時沿用；未提供需求時擬候選需求，優先選「驗收紀錄」的驗收情境沒用過的需求；目標 Skill 需要測試素材而使用者未提供時，依「驗收紀錄」驗收情境描述的測試環境擬定；需求與測試素材都不得與目標 Skill 範例的情境相同；使用者未指定測試模型時，使用中階模型 `sonnet` 與推理強度 `medium`，不沿用執行者的主模型。
6. `WRITE` 向使用者展示「實跑需求」、「測試素材」與「測試模型」，請使用者確認或選定；使用者提供的需求與範例情境相同時，說明原因並請使用者更換；需求與需要的測試素材都由使用者提供且不需更換時，略過本步驟與下一步。
7. `CHECK` 使用者回覆：確認或選定時更新「實跑需求」、「測試素材」與「測試模型」並進入 Phase 2；提供新的需求時返回步驟 5；未回覆時停止執行。

完成條件：「紀錄目錄」與「驗收紀錄」已確定且目前版本的驗收情境最終結果全部通過，「實跑需求」與「測試素材」已由使用者提供或選定，且與目標 Skill 範例的情境不同，「測試模型」已決定；或已因缺少輸入、驗收未通過或使用者未回覆而停止。

## Phase 2 -- 建立測試環境並實跑

1. `WRITE` 在 scratchpad 目錄（沒有時以 `mktemp -d` 建立）建立暫存專案：把工作目錄中的目標 Skill，以及其 SOP 以 `DELEGATE` 委派的 Skill（含再委派的 Skill）複製到暫存專案的 `.claude/skills/`，放入「測試素材」，執行 `git init`，把 `.claude/` 加入 `.git/info/exclude`，再把測試素材提交為初始 commit（沒有測試素材時以 `git commit --allow-empty` 建立）；建立「實跑紀錄」，記下暫存專案路徑、「實跑需求」與「測試模型」。
2. `CHECK` 暫存專案的 `git status --short` 沒有輸出，且 `.claude/skills/` 只有步驟 1 複製的 Skill；不符合時修正暫存專案。
3. `CHECK` 執行 `test "${HERDR_ENV:-}" = 1`：成立時進入步驟 6；不成立時進入步驟 4。
4. `WRITE` 向使用者提供 `cd <暫存專案絕對路徑> && claude --model <測試模型的模型> --effort <測試模型的推理強度>` 指令與「實跑需求」原文（目標 Skill 的 frontmatter 有 `disable-model-invocation: true` 時，在需求前加上 `/<目標 Skill 名稱>`），請使用者在另一個終端機自行執行、親自回答提問與確認閘門，跑完後在該 session 執行 `/export` 存成檔案，並回報檔案路徑。
5. `CHECK` 使用者回報已跑完時，把 `/export` 檔案路徑記入「實跑紀錄」並進入 Phase 3；未回報時停止執行，保留暫存專案。
6. `READ` 執行 `herdr --skill` 取得 Herdr 使用說明，建立「Herdr 操作說明」。
7. `DELEGATE` 依「Herdr 操作說明」以 `herdr pane split --current --direction <呼叫者 pane 寬時為 right，窄或高時為 down> --cwd <暫存專案絕對路徑> --no-focus` 在呼叫者 pane 旁開新 pane，再以 `herdr agent start <測試 session 名稱> --kind claude --pane <新 pane> -- --model <測試模型的模型> --effort <測試模型的推理強度>` 在其中啟動全新的 Claude Code，命名為「測試 session」；`agent start` 回傳 `agent_not_ready` 時照樣進入下一步。
8. `CHECK` 以 `herdr agent get` 讀取「測試 session」的狀態，並以 `herdr agent read` 讀取畫面（pane 已不存在時沿用最後一次讀到的畫面），不論 Herdr 回報的狀態，先依畫面分支：畫面停在唯讀並只涉及暫存專案的權限確認時進入步驟 10；畫面停在信任資料夾、其他權限確認、`clarify` 提問、選項或確認閘門時進入步驟 11。畫面不屬於以上情況時再依狀態分支：idle 或 done 時，尚未送出「實跑需求」且畫面停在輸入框則進入步驟 9，已送出「實跑需求」且畫面顯示回合已結束則進入 Phase 3，無法判斷則進入步驟 11；working 時不重送，以 `herdr agent wait <測試 session> --timeout 120000` 等到狀態改變後重新執行本步驟（逾時只代表到了下一次讀取狀態的時間，不是等待上限）；找不到 agent、pane 已不存在、狀態為 unknown，或 herdr 回傳 timeout、`agent_prompt_stalled` 後無法確認需求或回答已送達時，進入步驟 11。
9. `DELEGATE` 以 `herdr agent prompt <測試 session> --wait --timeout 120000` 送出「實跑需求」：需求以自然語言送出、不指名目標 Skill；目標 Skill 的 frontmatter 有 `disable-model-invocation: true` 時，改在需求前加上 `/<目標 Skill 名稱>`；記入「實跑紀錄」後返回步驟 8。
10. `DELEGATE` 依使用者事先授權，以 `herdr agent send-keys` 選擇單次放行（不選「不再詢問」類選項），再以 `herdr agent wait <測試 session> --until working --timeout 10000` 確認測試 session 已繼續工作（逾時也不重送），把放行內容記入「實跑紀錄」後返回步驟 8。
11. `WRITE` 向使用者轉述畫面上提問或確認的完整內容，包含所有選項與推薦，請使用者回答；因找不到 agent、狀態不明或無法確認送達而進入本步驟時，改為展示最後讀到的畫面與目前狀態：測試 session 仍存在時，詢問使用者要繼續等待、重送或停止；找不到 agent 或 pane 已不存在時，說明原 session 已無法繼續，詢問使用者要重建測試環境重跑或停止。
12. `CHECK` 使用者回覆：已回答，或選擇繼續等待、重送、重建測試環境重跑時進入步驟 13；選擇停止或未回覆時停止執行，保留暫存專案與仍存在的測試 session。
13. `DELEGATE` 依使用者回答的原意轉成測試 session 要求的格式，以 `herdr agent prompt --wait --timeout 120000` 送入，或以 `herdr agent send-keys` 送入後再以 `herdr agent wait <測試 session> --until working --timeout 10000` 確認測試 session 已繼續工作（逾時也不重送）；使用者選擇重送時送入前一次的需求或回答；選擇繼續等待時不送入任何內容，以 `herdr agent wait <測試 session> --timeout 120000` 等待；記入「實跑紀錄」後返回步驟 8；選擇重建測試環境重跑時，以 `herdr pane close` 關閉仍存在的測試 pane、刪除暫存專案，記入「實跑紀錄」後返回步驟 1，以相同的「實跑需求」與「測試素材」重跑。

完成條件：測試 session 已依「實跑需求」跑完，所有提問、確認閘門、信任資料夾，以及非唯讀或超出暫存專案範圍的權限確認都由使用者回答，「實跑紀錄」已記下每次放行與回答（使用者自行執行時已記下 `/export` 檔案路徑）；或已因使用者未回覆而停止。

## Phase 3 -- 獨立核對與判定

1. `READ` 暫存專案的 `git status --short -uall`、新增或修改的檔案內容，「測試 session」的最後回報，以及測試 session 的對話紀錄檔（Claude Code 存在 `~/.claude/projects/` 下以暫存專案路徑命名的目錄中的 `.jsonl`；使用者自行執行時改讀 `/export` 檔案），建立「實跑結果」。
2. `CHECK` 獨立核對「實跑結果」：可重跑的測試自行重跑（不寫入快取），產出含圖時親自查看渲染結果，逐條對照「驗收紀錄」的通用驗收條件並標記符合、不符合或無法親自證實（從紀錄無法確認的一律標無法親自證實），記下目標 Skill 是否由測試 session 自行觸發（以 `/<目標 Skill 名稱>` 送出時記為「手動觸發，未驗證自動觸發」）與實跑中意料之外的地方，建立「核對結果」。
3. `WRITE` 向使用者回報實跑過程、「實跑紀錄」中每次自行放行的內容、「核對結果」與產出檔的絕對路徑，請使用者判定通過或不通過；不通過時請說明哪裡不符合。
4. `CHECK` 使用者回覆：判定通過時進入 Phase 4；判定不通過時進入步驟 5；未明確判定時停止執行，不修改目標 Skill、不寫入紀錄，保留測試環境。
5. `THINK` 將「實跑需求」、「測試素材」、暫存專案路徑、測試 session 對話紀錄檔的路徑、使用者的每個回答、產出檔中與問題相關的內容、使用者指出的問題，以及「核對結果」中不符合的項目整理成「問題證據」，加入「實跑紀錄」。
6. `DELEGATE` 依「Herdr 操作說明」以 `herdr pane close` 關閉 Phase 2 開啟的 pane（使用者自行執行或 pane 已不存在時略過），暫存專案保留。
7. `DELEGATE` 委派 `skill-engineering` Skill 以優化模式處理目標 Skill，提供「問題證據」作為問題證據；本 Skill 不直接修改目標 Skill。
8. `CHECK` `skill-engineering` 完成且驗收情境全部通過時進入步驟 9；`skill-engineering` 停止時，保留暫存專案，回報停止原因、暫存專案路徑、`skill-engineering` 的紀錄目錄與「實跑紀錄」並停止執行。
9. `DELEGATE` 刪除暫存專案，以 `skill-engineering` 的紀錄目錄更新「紀錄目錄」，返回 Phase 2 步驟 1，以相同的「實跑需求」與「測試素材」重跑。

完成條件：使用者已判定通過；或判定不通過後已交由 `skill-engineering` 優化並返回 Phase 2 重跑；或已因使用者未判定、`skill-engineering` 停止而停止。

## Phase 4 -- 收尾

1. `DELEGATE` 目標 Skill 在「目標側」的 `description` 以「（未驗證）」開頭時，委派 `skill-form-description` Skill 只移除這個前綴、其餘文字不變；沒有這個前綴時略過本步驟。
2. `DELEGATE` 在專案根目錄執行 `./scripts/sync-skills.sh --from <「目標側」為 .agents/skills 時為 agents，為 .claude/skills 時為 claude>` 與 `./scripts/sync-skills.sh --check`，取得「同步檢查結果」；專案沒有這個腳本時記入「實跑紀錄」，並略過本步驟與下一步。
3. `CHECK` 兩次執行的退出狀態均為零，且「同步檢查結果」為兩邊一致；失敗時依錯誤輸出修正後重新執行上一步，仍失敗時回報原因與已發生的修改並停止執行。
4. `WRITE` 在「紀錄目錄」的 `blueprint.md` 驗收結果段落末尾新增 `### 使用者實際驗證（<YYYY-MM-DD>）` 一節，依「實跑紀錄」與「核對結果」，依序以條列寫出方式（含「測試模型」的模型與推理強度）、權限處理、結果（有多輪時逐輪寫）、觀察與結論。
5. `DELEGATE` 依「Herdr 操作說明」以 `herdr pane close` 關閉 Phase 2 開啟的 pane（使用者自行執行或 pane 已不存在時略過），並刪除暫存專案。
6. `CHECK` 交付前逐項確認：目標 Skill 的 `description` 除了「（未驗證）」前綴外與修改前逐字相同，兩邊 skills 一致（或已記錄專案沒有同步腳本），驗證紀錄一節已寫入且每一輪都有記錄，主專案 `git rev-parse HEAD` 與「執行前 HEAD」相同，測試 pane 與暫存專案都已移除；未通過的項目修正後重新確認。
7. `WRITE` 向使用者回報主專案中被修改的檔案清單；不執行 `git commit`，由使用者決定是否提交。

完成條件：目標 Skill 的 `description` 已不以「（未驗證）」開頭且兩邊 skills 一致（或已記錄專案沒有同步腳本），驗證經過已寫入「紀錄目錄」的藍圖，測試 pane 與暫存專案已移除，交付前檢查全部通過，且已回報變更清單。
