# Steve 與課程文章：長期交接入口

## 1. 現在從這裡接續

### 換機交接：最新文章需求已說清楚；本次只保存與推送

使用者最新指示：「把截至目前為止的對話內容還有變更都記到交接文件，提交並且 push，我要換電腦了」。本次授權兩個相關repo的既有變更保存、提交與push。課程寫稿、研究、測試、Skill修改及Steve施工維持暫停。以下歷史完整保留；較舊的「未授權commit／push」以本次保存授權更新，其他工程授權範圍保持。

#### 使用者最新需求（依本次原話整理）

- 輸入是一個大章節底下每個小節的逐字稿，各小節都要能轉成文章；不可只拿自製測試材料當最終交付。
- 可以寫約500～600字短文，也可以寫約2,000～3,000字中型文章。篇幅配合素材與需要的解說，不為湊長文增加無關內容。
- 文章可以包含執行步驟、學習心得或可執行的提示詞。內容只有概念時，就寫清楚概念；缺少可操作內容時不硬加操作。
- 要有SEO取向：從課程實際講的內容，研究Google可能有搜尋意圖與搜尋價值的關鍵字，再按適合的方向寫文。搜尋研究須支援課程能回答的問題。
- AI Agent Introduction若只教基本概念，可以寫成入門者能讀懂的上課筆記。使用者再次拒絕帶入與課程無關的產品字眼、案例及失控擴寫。

以上是已取得的需求，後續不用再問長短文、SEO或是否每篇強制操作。每節一定獨立成一篇、或多節如何編排成系列，使用者這次未細訂；遇到實際素材時才判斷必要取捨。不得自行把未成文內容永久略過。

#### 助理本次查核與解釋

已重新讀取課程repo工程04的rca-report.md前125行。當時最早可定位的偏離在大綱選材：原課已有搜尋工具循環，助理另設訂單案例，繼續補編號、金額、表格及練習。成稿規則又要求用讀者案例開頭和研究用詞小標，n8n儲存與日曆問題因此進入正文。檢查重點集中題答與資料一致，漏掉對原課理解的收益及閱讀負擔；獨立審查在保留案例前提下繼續擴寫。助理另曾把新選開頭／整理句記為沿用確認，這是執行偏離。

助理提出的寫法解釋：先找出課程能回答的問題，再研究搜尋需求與競爭情況。以「AI Agent是什麼」「AI Agent和固定工作流程有什麼差別」為候選示例；本次未研究其Google搜尋價值，不記為已選定關鍵字。產品除錯問題只有與本節內容實際相符時才可能納入。學習心得須區分課程啟發與使用者實際經驗，不能捏造經驗。

本次回覆只釐清需求及核對根因，尚未依這段新需求修改Skills或重寫S1。既有B2修改已存在工作樹；S2限定收尾完成；S1實際成果仍未通過使用者驗證；Steve尚未整合。詳下方歷史及課程repo的validation-b2-s2-r2/result.md。

#### 兩個repo與新電腦操作

| Repo | 遠端與分支 | 保存範圍 |
| --- | --- | --- |
| AI × BDD（公開） | git@github.com:AI-x-BDD/s-aixbdd-spec-kit.git；personal-helper-proposal | 本交接入口、舊入口轉址、交接索引、既有docs/materials方法資料 |
| 課程文章（私有） | git@github.com:stevecyj/lesson-preparation-perspective.git；main | 兩側課程Skills既有修改、文章工作紀錄、工程04完整設計／研究／失敗稿／驗收證據及換機紀錄 |

新電腦先設定可存取這兩個repo的GitHub登入或SSH金鑰，再執行（資料夾不存在時）：

```bash
git clone --branch personal-helper-proposal git@github.com:AI-x-BDD/s-aixbdd-spec-kit.git
git clone --branch main git@github.com:stevecyj/lesson-preparation-perspective.git
```

已有本機副本時，先檢查git status；乾淨且已切到指定分支時用git pull --ff-only。若有本機變更或分歧，保留後再處理，不使用reset或force push。公開repo目前有本機／遠端分歧，本次以保留雙方歷史的方式合併後推送。

新對話先讀本段，再從相鄰的lesson-preparation-perspective repo讀`specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/migration-handoff.md`及`validation-b2-s2-r2/result.md`。歷史檔中的`/Volumes/data/...`與`/private/tmp/...`是舊機位置；以新機repo實際位置定位工程內保存的outputs、final-output、fixtures與history，不要求舊暫存目錄存在。這次提供可讀的長期證據，跨機重跑測試仍需另行授權及環境核對。

Git只攜帶repo內檔案。Pi登入憑證、全域Skills／extensions與全域指引`/Users/steve/.pi/agent/AGENTS.md`位於repo外。本次不將登入憑證放入Git；新機需另行登入與安裝所用工具。全域設定整套遷移尚未執行。

下一動作是新電腦讀取交接與確認兩個repo版本；工程保持暫停。之後若使用者要求恢復原任務，沿用上述需求，先讀既有真實逐字稿及研究，針對缺少且會改變產出的資訊提問，不重問整體需求或自動另開假測試。

### 最新接續：S2 R2既有結果收尾已交付，後續工程維持暫停

使用者已核准三項測試預回覆。新分支從未確認大綱快照開始，完成新確認、獨立重驗、單項採用、作者清單、完整測試初稿與同版本接續；無新待答。最後核對：正文只採定義補充，另8處狀態文字更新；同版本接續只增加progress紀錄，稿／清單／檢查hash不變。前批錯誤確認原樣保留，缺陷稿單項採用測試未重跑。

本批權威結果：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b2-s2-r2/result.md`；直接成果為同目錄`final-output/article/draft-s2-r2-v1.md`。文件品質及用途判定見對應publication-check；真人及搜尋仍未完成。工程blueprint最新段已追加，不用前批待核准文字接續。

本次使用者指出回報漏掉水球Orchestrator。已重讀原文與本文§2／§6，確認整體目標為Steve按判準選Skill、交接及檢查回傳，使用不足經核准再改善子Skill。課程文章是第一條真實整合路徑。本批僅關閉S2受控分段測試，不再擴張S2；Steve尚未在本批實作或驗證。

寫後讀回時另發現下方已有「未達使用者預期，暫停投入與自動接續」停點。本次「繼續剛剛的任務」只完成已提出的S2收尾與交付，沒有新增模型測試；不推導成恢復整體工程。下方暫停決定完整保留。進入Steve的缺口整理僅記於result.md作未執行建議，S1、後續測試、安裝及Steve施工均等待明確新指示，不自動推進。

結果追加前，課程repo5180檔、前批工作區4973檔、早期工作區1158檔及來源快照4954檔hash不變。Skills、S1、原研究及歷史保留；未安裝、定稿、發布、commit或push。全域指引：`/Users/steve/.pi/agent/AGENTS.md`。新對話先讀本段及result.md。

### 最新停點：未達使用者預期，暫停投入與自動接續

使用者回報已投入約50～51小時，多次指出成本浪費；期待把課程逐字稿交給助理後取得有用筆記，實際成果仍未達預期。時間為使用者回報，未獨立計時。使用者表示先前模型原因分析像推託，並詢問如何讓這輪告一段落。

本輪停止推進課程Skill工程、追加測試及Steve整合，不以驗收尚欠收尾為由繼續投入，也不自行補做S1筆記。已有Skills、來源、失敗稿、錯誤確認、測試成果及紀錄全部保留；未達預期與尚未完成的驗收狀態保持。下面接續指令僅作歷史，後續對話先讀本停點，取得使用者明確新指示才恢復工作。此為目前停點，未決定永久放棄Steve整體目標。

助理承認執行重心偏向流程與容易檢查的測試，未先交付真實逐字稿筆記；測試回覆設定錯誤又造成返工及額外核准成本。此次只在既有入口保存停點，沒有新測試、Skill修改、檔案刪除、commit、push或跨機備份。檔案仍有本機未追蹤內容，遷移注意事項見下段。跨專案溝通規則：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：回到 Steve 整體目標；S2 R2已實跑，最終驗收收尾待辦

使用者追問當前工作與水球Orchestrator的關係，以及換電腦後長期記憶是否保留。本次重新核對 `docs/wb-secret-formula/決策樹.md`、本檔§2及§6。整體目標仍為Steve個人小幫手；課程文章是第一條真實整合路徑。既定順序維持：改善課程Skills → 經實測及使用者確認後安裝至AI × BDD → 整合Steve → 穩定後移植home repo。這次討論未另行核准Steve施工或改變既定關卡。

原文做法：各方法寫成「這一步做什麼 → 判準 → 下一步判斷」的Skills；Orchestrator依目標、現況、限制選擇及串接方法，收到成果後判斷結束、補資料或接續；使用中發現不足時帶具體問題學習，將新知識轉成可執行判準，經必要核准改善Skill。每次同時關注眼前成果與方法演進。來源及分工詳§2。Steve的實際路由／交接／結果判斷仍待建立，本次由主助理手動協調子Skill驗收。

助理已指出自己的執行偏移：追著子Skill局部測試推進，未持續交代其與Steve第一條路徑的關係，也未清楚管理改善結束及返回主線的條件。此為本輪查核與助理反省紀錄；後續先對照原總目標判斷剩餘工作，不將本次討論擴成新工程授權。

使用者已明確核准S2三項補充測試預回覆，下面舊「須補核准」保留歷史。新分支工程證據位於課程repo相對路徑 `specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b2-s2-r2/`。已執行01-confirm至06-same-version，原始提示、log及各次outputs快照已保存；05-draft/outputs/article/含完整測試初稿及publication-check，06-same-version/outputs/含接續後快照。先前回報：新確認、獨立重驗、單項採用、有效作者清單、測試初稿及同版本接續完成；本次只核對工程目錄存在，未重驗內容。最終協調端差異／保護核對及R2總結尚未完成，整體Phase5保持未全數驗收。舊錯誤確認及已通過缺陷稿測試保留，未重跑該缺陷稿測試。S1與Steve均未在本輪施工。

換機保存狀態：本次git檢查顯示本檔及課程repo的validation-b2-s2-r2/仍未追蹤；水球原文已受Git追蹤，遠端同步本次未查。換機需攜帶兩個repo的未提交工作檔；只clone遠端會遺漏未追蹤內容。以上工程路徑可依新電腦repo位置重定位。/tmp只作執行工作區，接續優先讀工程內outputs快照。全域指引 `/Users/steve/.pi/agent/AGENTS.md` 與Pi設定位於repo外，遷移須另處理。本次未commit、push或設定跨機備份。

### 最新接續：B2 S2功能驗收部分完成，測試確認範圍須補核准

本輪已依核准使用課程repo skill-engineering，在包含4954檔working-tree的隔離副本執行S2。8個成功程序含1次獨立四角色；7項隔離探針通過。初次大綱選材取得功能證據；獨立缺陷稿只採必要前提補充、保留無用重述，結構通過但必要性／整體／教學維持未通過，精確修改核對通過。真人0次，完整新稿及F3有效清單快速接續未跑。

協調端02-confirm把原S2預回覆擴成整份outline-v1確認，涵蓋原預回覆未明列的安排及小標。此為測試設定偏離，原提示與結果保留；後續確認／角色／採用／接續鏈列確認前提受影響，待明確測試預回覆後重驗。05作者閘門另停在新開頭、整合句及清單待答。不能沿用本批錯誤確認為新授權。

權威結果：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b2-s2/result.md`。同工程blueprint最上方已追加狀態；完整證據、fixtures、diff、verification及長期成果副本final-output/在validation-b2-s2/。下一輪先讀result.md的必要新輸入；取得明確測試預回覆後另建受影響分支，不覆寫本批歷史。其他可獨立執行的本批部位檢查已交付。

原repo4954檔與舊測試工作區1158檔於結果追加前hash不變。原S1失敗稿與使用者未通過狀態保留；Skills未改，未重跑研究、真人、S1/S5-a/S2-c，未安裝、發布、commit或push。兩次環境失敗及同提示重試已留證，未放寬隔離。全域指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：B2施工及授權檢查完成，功能驗收待驗證

B2-W1～W7全部完成，課程repo的10個主要側檔案及對應claude副本已修改。audit退出0、0 errors／5項既有按需重讀warnings；同步與 `--check` 通過。F只改3步，W SOP逐字保留，6條Rule及3組雙檔已更新；另外21個主要側檔案及1158個暫存驗收工作檔hash不變。

S1～S3文件演練已完成；本次模型功能實跑、獨立角色及真人測試為0次，S1未重寫。S1使用者驗證未通過及整體功能驗收待驗證狀態保持。證據存下述課程工程的 `implementation-b2/verification.json`、`audit.json`、`sync.txt`、`replay.md`，完整施工前備份在 `implementation-b2/before/`。本次授權成果已交付，沒有待答施工問題。後續先讀blueprint最新段與replay.md；功能驗收需另行授權，不自動重跑研究或S1。

### 本次Phase4核准及施工起點

本次使用者明確核准B2的7個工作項、10個主要側檔案及藍圖要求替換，要求直接施工及完成同步、結構檢查與文件演練。Phase4核准已記入課程工程blueprint及rca-report；全部B2組成文件與課程版工程／form Skills已載入，兩側各31檔與baseline一致，完整施工前備份及保護hash存課程工程 `implementation-b2/`。

實際施工repo：`/Volumes/data/Projects-practice/lesson-preparation-perspective`；權威藍圖為其 `specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/blueprint.md`。依B2-W1～W7施工；研究、獨立角色、讀者測試及S1重寫維持禁止。原需求、來源、失敗稿、歷史確認及其他未提交內容保留，不發布、不commit或push。全域溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1診斷已確認，B2重設完成，待Phase4施工核准

使用者對R1內容必要性缺少可檢查依據、R2讀者案例開頭無條件套用，以及保留有理解收益的例子／練習、刪減無新增用途重述回覆「同意」。已依課程repo版skill-engineering完成Phase2步驟8及Phase3步驟1～9，不重問診斷。

B2權威入口：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/blueprint.md` 最上方。完整八節設計、兩份完整To-Be、65條約束分配、逐元素處置與檢查存於同目錄 `s1-redesign-v1/`。7個工作項涵蓋10個主要側檔案；無整檔刪除，步驟／Rule／樣板組總數不增加。具體替換、復原及驗收範圍見design.md §3、§6、§7。

目前停在Phase4，等待使用者核准B2施工範圍。收到有效核准後先讀B2全部組成文件，使用課程repo版本家族依7項施工；不得把本次診斷同意擴成施工核准。研究、獨立角色、真人測試與S1重寫仍未授權，施工核准不自動解除這些限制；可先做核准範圍內結構／同步／文件演練並如實列未完成驗收。

本輪只修改工程紀錄及本入口，課程Skills與S1原稿未改。原需求、來源、研究、失敗初稿及歷史確認保留；S1使用者驗證仍未通過。S5-a、S2-c不接續；不外查、不發布、不安裝真實其他專案、不commit或push。跨專案溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1初稿根因已查核，待診斷確認後重設

已沿課程版skill-engineering完成Phase1及Phase2步驟1～7，成果在課程既有工程目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/rca-report.md` 最上方；同目錄blueprint.md§8已同步。證據`validation-b11/s1-draft-rca-v1/`保存78步演練、53檔綁定、31檔三處一致、結構診斷0錯誤／5警告。

診斷R1：大綱到全文的必要性要求無法獨立判斷新增內容的理解收益，檢查集中於自製教材內部一致性。R2：成稿規則無條件要求讀者案例開頭，把n8n研究帶入正文。R3：主助理把新選開頭及新整理句擴寫為沿用確認，屬執行偏離；依既有規則處理。原成文評估已明列候選／暫存，未將一節一篇列為根因。

目前停在Phase2步驟8診斷核准。只確認新邊界E3及根因：例子／練習須有具體理解收益，無新增用途的重述列待刪減；保留長短文章與原有能力。收到有效同意後直接進Phase3重設，實際施工仍經Phase4藍圖核准；不重問已說明的n8n與冗長問題。S1初稿維持使用者驗證未通過，原稿及案例歷史保留。未修改課程Skills、重跑研究／角色／真人測試、發布、commit或push。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 歷史接續：停止條件已補強，原需求核對與短示範已交付

使用者指出主助理說完計畫就停止。已更新並讀回全域指引 `/Users/steve/.pi/agent/AGENTS.md`；具體規則以該檔為準。本輪同時完成先前承諾的原需求核對、偏離整理與局部短示範，保存於 `/tmp/course-b11-validation/round2/S1-a/article/reset-sample-v1.md`。

核對結果：原需求允許文章長短不同，先保留收穫，再判斷獨立成文、合併或暫存；不能因本次失敗把整套Skill縮成只做短筆記。示範只用課程原有搜尋工具循環，供看見內容密度；尚未採用為新大綱。完整根因與Skill重設尚未完成，未修改課程Skills。draft-v1使用者驗證未通過及停止定稿的狀態維持。

### 歷史接續：S1初稿遭使用者判定失敗，暫停定稿

使用者閱讀draft-v1後指出：n8n等外部內容偏離課程；素材只有一小節，全文卻過度擴寫，並判定Skill失敗。實際回覆已保存於 `/tmp/course-b11-validation/round2/S1-a/article/progress.md` 的「使用者判定第一版全文失敗」段。最新狀態為使用者驗證未通過，停止定稿與後續推進。

已重讀課程原文與相關規則：n8n來自外部研究；成稿Rule1強制讀者案例開頭；成文Rule3原要求依內容價值評估成文、合併或暫存。本次初步發現是外部研究進入正文、自製教材擴張，以及文件檢查漏查課程貼合度與篇幅必要性。完整產出鏈根因尚待檢查，尚未修改Skill或重寫文章。後續先處理失敗原因，勿沿用下方歷史「等待定稿」動作，勿要求使用者重做背景訪談。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 歷史接續：S1第一版全文完成，待作者閱讀

使用者同意「寫稿前核對，核對完成後產出第一版全文」。已在 `/tmp/course-b11-validation/round2/S1-a/article/` 保存 `author-checklist-v1.md`、`draft-v1.md`、`publication-check-v1.md`、`draft-verification-v1.json`。初稿SHA-256：16a054caecb28dee4b27eadfa4a93407422fd5dff1d412444b704aca1565c991。沿用採用大綱、三段標題、訂單案例、CP1～CP3與原讀者。開頭使用既有客戶資料儲存困惑，完整展開三段解說、題目與答案，結尾提供速查與第一步。

寫稿前清單沒有新取捨，已確認事項直接沿用。全文逐段文件核對與機械核對通過；自用靜態回找及本文三段教學內容通過，真人效果與時間待驗證。E及新任務遷移題本繼續暫緩，搜尋相關文連結待補。初稿尚未定稿，等待作者閱讀後提出修改或明確確認定稿；不要求重答三題或重問背景。

已完成workflow Phase3步驟1～9及共用出口；下一步10～11接作者的初稿回饋。新對話先讀本段、article/progress.md最新事件及draft-v1.md，依實際回覆接續。未重做獨立審查、測試、訪談、外查、修改Skills、發布、commit或push。S5-a與S2-c未處理。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 歷史接續：S1大綱A～D已採用，E暫緩

使用者回覆「照建議」，採用A～D共7項。採用版為 `/tmp/course-b11-validation/round2/S1-a/article/outline-adopted-v1.md`，SHA-256：6b6c7ab13fa6f991788acee74e62d456f99a71440c4931d40477ab3a939997a9。原稿、全套候選、獨立報告與原確認保留歷史。CP1～CP3、三段安排、訂單案例、36則證據與原讀者設定沿用。

同目錄 `outline-adoption-record-v1.md` 保存實際展示、回覆、編號及採用後三用途核對；`outline-adoption-v1.diff` 與 `outline-adoption-verification-v1.json` 保存差異與版本證據。7項精確套用、狀態行更新及反向還原核對通過；15個來源／規則綁定雜湊一致。自用靜態回找與§5受影響教學規劃通過；§7題本及真人效果待補，搜尋連結待補。E暫緩，§7原文保留。

已完成writing Phase4步驟8、11～15及共用出口。本次大綱採用交付後停止，無新待決問題。後續先讀本段、採用紀錄與article/progress.md最新事件，再依新任務接續；全文與測試仍待另行授權。不重做獨立檢查、不重測、不訪談、不外查、不寫全文、不改Skills、不發布、不commit或push。S5-a與S2-c未處理。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 歷史接續：S1大綱v1已確認，獨立五角色檢查已交付

本次核對暫存交接與outline-v1，SHA-256均為21296b045e8198c1774ca5905d8e76055aa61f31b4c707b2f582a5089bc92cdf。已把作者對三段安排及訂單案例的確認存入 `/tmp/course-b11-validation/round2/S1-a/article/outline-confirmation-v1.md`。CP1～CP3、原讀者與36則證據沿用；嚴格適配累計未知。

一個全新獨立Pi程序完成五角色檢查，退出0。成果同目錄：`outline-review-v1.md`（逐節審查及精確修改）、`outline-candidate-review-v1.md`（套全部建議，尚未採用）、`outline-review-delivery-v1.md`（選項對照與協調核對）。9項修改含7項當前教學修改、1項未來檢核計畫及1項候選狀態。建議A補案例與驗收、B補前兩段題目、C補workflow釋義、D補概念範圍；E為未來檢核計畫，可暫緩。分組與精確角色編號映射見交付檔。

已核對原文唯一、不重疊、全部替換與候選逐字一致、報告內候選一致；原稿、既有文章檔案及綁定上游／規則未變。紀錄在 `outline-review-run-v1/verification.json`。3次新檔不存在的讀取錯誤已由後續建立及讀回排除。上下文隔離，未另加OS sandbox。真人效果與時間尚未驗證。

目前完成課程版writing Phase3步驟8～9及Phase4步驟1～7；下一步Phase4步驟8等待作者選擇修改，收到有效採用後直接另存採用版並核對。先讀本段及交付檔，沿用已確認安排，不重問、不重測、不訪談、不外查、不寫全文、不改Skills、不發布、不commit或push。S5-a、S2-c及其他未提交內容保留。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1文章大綱v1已產出，等作者確認受檢版本

使用者解除「不進大綱」限制，授權產出及必要檢查，全文仍暫不寫。已在 `/tmp/course-b11-validation/round2/S1-a/article/` 新增 `outline-v1.md` 及 `outline-v1-static-check.md`。用同一個自製訂單案例串起決策權、工具回傳與完成驗收；吸收試跑回饋，固定讀者角色並標明延伸情境。CP1～CP3、原題、主要／次要讀者與36則既有證據保留，不重做三題或訪談。

來源路徑、原文／確認雜湊、九節及三段檢核已做靜態核對。下一步：收到作者對 `outline-v1.md` 的確認後，先綁定展示版本及回覆，再依課程版 writing Phase 4 做五角色獨立檢查，展示可採用的修改。未確認前維持待確認；不外查、不寫全文、不改Skills、不發布、不commit或push。指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：已實際修正主持v3，三題原答與工程結果已保存

使用者再次指出只回報便停止。已接續完成 `/tmp/course-b11-validation/round2/S1-a/article/comprehension-test-v3-zh/participant.md` 及facilitator.md，修正Q1指代、Q2延伸應用標示、Q3角色，並明定逐題原樣展示與答後接續。中文閱讀材料沿用v2，v1/v2與場次001原答保留。v3為修訂基準，尚未真人重測；P01本輪三題已結束，不補考。

三層progress及課程工程blueprint／rca-report已更新為真人1位、主持品質未通過及v3已修正，場次結果仍見comprehension-session-001/result.md。工程證據：課程工程validation-b11/round2/s1-hosting-v3/。本輪未修改Skills，CP1～CP3、36則證據及其他分支限制保留。

下一個超出本輪授權的動作為文章大綱；目前「不進大綱、不寫稿」仍有效。若使用者決定推進文章，僅確認解除大綱限制的差異，沿用既有方向與素材，不重問背景、不重測本人三題。跨專案溝通規則來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1本人三題回應已保存，主持品質未通過

P01已回覆全部三題，原話及實際展示存 `/tmp/course-b11-validation/round2/S1-a/article/comprehension-session-001/question-01.md`至`question-03.md`，結果見同目錄`result.md`。第1題有改寫後補答，與首次拒答分開。已觀察到流程決策權辨識、工具結果交回LLM、向使用者請求權限的經驗，以及查表核對編號／金額與缺單判未完成。未明列的重複列檢查等保留未充分觀察，不代填答案。

本次主持品質未通過：Q1指代不明並擅自跳題；Q2未先說明權限情境屬新增應用；Q3將受測者同時當成果使用者及向使用者報告的人。主持臨時改寫與角色歧義影響規準適用，暫不計數字總分，不宣告三題全通過。使用者已完成本輪回應，不追加補考。現行主持措辭需修正；課程轉文章Skills的整體可用性仍待實際文章產出與讀者驗證，本輪未進大綱或全文。

Q3建議改成「你判定任務完成了嗎？請指出表格中的差異」，已存場次紀錄，尚未重測。跨專案角色一致及應用題來源標示要求已補入 `/Users/steve/.pi/agent/AGENTS.md`。接續先讀本段及result.md，依實際展示定位與修正主持缺陷，不再要求使用者回答已答三題。其餘既有限制保持。

### 最新接續：本人已讀中文材料並完成第1題，確認介面缺陷已記錄

使用者本人P01已同意參與並確認教材閱讀權限，已回覆「讀完」。停止背景訪談，未知背景保留；本場為已有接觸的流程試跑。場次紀錄：`/tmp/course-b11-validation/round2/S1-a/article/comprehension-session-001/intake.md`及`question-01.md`。第1題前兩小題已答；第三小題原展示含「上述判斷」，使用者指出歧義並拒答，之後要求重問。改寫後使用者明確回答流程與兩個條件均由設計者預先設定，故為固定工作流程。原答、實際展示及改寫後回答分開保存。主持已提前給第1題回饋，該偏離亦已記錄。第2題曾展示但尚無回答，第3題未展示。下次直接接第2題；不重問人選、權限、語言或閱讀完成，不重測第1題。

本輪已發生的主持缺陷：將假設其他讀者的權限情境帶入本人流程；提問使用不清楚指代；使用者要求釐清時擅自跳題；答完只宣告完成又停止，讓使用者反覆催促。使用者自述約九成力氣耗在確認介面、僅一成推進任務，並表示兩天休假完成量很少；這是使用者的成本回報，未做獨立計時。原始目標仍為把課程內容轉成文章，本輪測試需服務中文內容理解，未授權直接寫文章全文。

使用者已明確要求將上述缺陷存入全域及專案記憶。本次更新全域 `/Users/steve/.pi/agent/AGENTS.md` 的提問必要性、獨立清楚題意、釐清後接續及避免只回報即停止的要求；原「暫停推進」已釐清為解決當下問題後接續。跨專案規則以該檔為唯一來源，新請求須載入。專案只保留本事件、結果與停點。CP1～CP3、36則證據與既有範圍限制沿用。

### 最新接續：S1中文材料與測試流程修正完成，待真人接續

使用者已授權單次測試，並要求在外出約一小時期間先修正中文介面及主持缺陷。明確使用情境：提供原始英文資料，平常用中文翻譯搭配影片；對使用者的閱讀、題目、說明與回饋一律中文。此條件已確認，不再詢問英文能力或中文需求。使用者尚未指定受測人選，尚無閱讀權限答覆、受測者同意或真人回答。

現行採用 `/tmp/course-b11-validation/round2/S1-a/article/comprehension-test-v2-zh/`：reading-zh-TW.md為中文譯讀材料，participant.md保留原三題主體，facilitator.md為現行主持文件，session-template.json分開保存首次與提示後原答，source-map.md、revision-check.md、validation.json保存查核。原v1完整保留，停止使用其英文閱讀門檻及舊主持流程。已完成12段來源對照、11項程式靜態檢查與11種主持分支演練；真人與獨立模型實跑均0次。中文是否易懂及20～30分鐘時間初估待真人驗證。

新對話先讀本段、全域指引及v2 facilitator；直接說明「中文材料已準備好，閱讀後回答三題，我會整理哪些地方講清楚、哪些需要修改」，再告知時間初估並問本人或另一位讀者作答。確認同意與教材權限後才提供中文材料。已知背景沿用，逐項詢問其餘背景。每題先保存原答，三題完成後才回饋；提前提示標記受影響題目。允許搭配有權觀看的影片／字幕翻譯，記實際材料條件。由使用者主動接續，沒有提醒或排程；無須貼空白表格或重核准測試準備。

三層progress、課程工程blueprint及rca-report已更新。工程證據位於課程工程 `validation-b11/round2/s1-comprehension-zh-v2/`；課程工程根目錄仍為 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。跨專案溝通改善已寫入 `/Users/steve/.pi/agent/AGENTS.md` 並讀回，新請求須載入該指引。

本批完成Phase5第13步準備修正與第14步記錄，整體部分完成。CP1～CP3、36則證據、原題與概念型範圍保留；不外查、不聯絡、不進大綱／寫稿。S5-a不跑、S2-c暫存、Q5/Q6不問。未修改Skills、發布、安裝真實其他專案、施工Steve、commit或push；其他未提交內容保留。

### 最新接續：S1真人測試已授權，因使用者出門停在施測前

本次使用者已授權依 comprehension-test-v1 主持單次真人理解測試。已讀交接、課程版本工程家族、主持文件及題本；尚未取得受測人選、教材閱讀權限、英文閱讀需求與受測者同意，尚無真人回答。使用者表示現在要出門，測試停在施測前。沒有設定提醒或排程；後續需由使用者主動開啟對話並要求接續。接續時先讀本段及 `/tmp/course-b11-validation/round2/S1-a/article/comprehension-test-v1/facilitator.md`，直接詢問由本人或另一位讀者作答，一次確認一項必要條件，不重問單次測試授權。使用者本人作答依既有接觸標記流程試跑。模擬試跑僅曾被助理提出，使用者尚未選擇，不自行執行。

本輪只更新本長期交接入口，未更新工程判定或三層progress，未新增測試成績。CP1～CP3及36則證據沿用；不外查、不聯絡、不進大綱或寫稿。S5-a不重跑，S2-c暫存，Q5/Q6不重問。保留其他未提交內容；未修改Skills、發布、安裝真實專案、施工Steve、commit或push。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1三題理解測試包已準備，尚未施測

2026-11-22使用者同意只準備受測背景、三題及判讀標準。已讀原Intro全文、H001～H013、CP1～CP3依據與v4本地研究結果；v4最後S1檔案hash全部一致。新增`/tmp/course-b11-validation/round2/S1-a/article/comprehension-test-v1/participant.md`、`facilitator.md`及`validation.json`。受測題本與主持答案分開，三題為自製假設情境，分別測決策權、日曆工具回傳與訂單完成檢查。每題3個得分點，各題均通過才記本次個人三項通過。

A主要讀者須有親自使用LLM、預設分支理解及待選流程的任務；B的首次平台／特定工具／整體循環背景分開記。原Intro為英文，正式測試需有閱讀權限並記語言協助。設計採開卷讀後測，學習增益與未來文章效果仍待另驗。本次受測者0人、無招募／聯絡／網路查詢；僅文件靜態檢查，未新增獨立Skill實跑。

下一步建議：由使用者指定一位符合A、未看評分答案且有權閱讀教材的讀者，另行授權單次測試；只提供participant.md及指定教材，主持保留facilitator.md。人選與執行尚待安排，本次不啟動。CP1～CP3、36則研究與原題範圍維持；不進大綱／寫稿。S5-a不跑、S2-c暫存、Q5/Q6不問。未改Skills、發布、安裝真實專案、施工Steve、commit或push。工程證據：課程工程validation-b11/round2/s1-comprehension-prep-v1/。新對話讀本段與主持文件，勿重做補查或要求再次核准準備測試。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1背景補查v4已交付，下一步提議準備理解測試

2026-11-22使用者在對話中同意「由助理定向補查既有案例公開背景、只做一輪」。已執行完成，授權未擴到新案例、大綱、寫稿或真人聯絡。主助理直接完成課程版工程Phase5第13步核對及第14步保存，沒有新增第12步獨立實跑。

三版ledger共64列／62個URL。選4個既有n8n案例187642、285605、271853、103336；作者鍵／URL及原日期一致，4次HTTP200，公開stream全部返回。新增讀27則回覆、8則原作者回覆。法律RAG例補到實際用途；首次PA例補到剛入門及照影片自述。主要需求仍含實作／效能，未提升嚴格適配。累計36則A11/B13/C12、CP1～CP3、原題及概念型範圍沿用；嚴格累計未知。

成果根目錄`/tmp/course-b11-validation/round2/S1-a/article/`：reader-research-results-v4.md、research-continuation-v4.md、reader-research-verification-v4.md及public-reader-research-v4/。本輪補查已結束。**下一步提議由助理準備三題真人理解測試與判讀標準**，分別檢查決策者、工具回傳、外部完成判準。此新工作尚待使用者同意，未執行；準備階段不招募、不聯絡、不進大綱／寫稿。完整背景與真人理解缺口仍保留。

工程紀錄仍為課程工程根目錄既有blueprint.md及rca-report.md；證據validation-b11/round2/s1-background-v4/。起始S1的170檔與v3快照相符；舊檔只追加三層progress，其他167檔不變；5段引句核對及兩repo git diff --check通過。S5-a未重跑，S2-c暫存／不進規劃，Q5/Q6不重問。未改Skills、發布、安裝真實專案、施工Steve、commit或push，其他未提交內容保留。新對話讀本段與v4接續，不再沿用v3的等待新資料作為目前動作。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1 v3定向補查完成，累計36則，背景仍待補

2026-11-22依使用者授權，使用課程版skill-engineering完成本批Phase5第12～14步。沿用CP1～CP3、原題及概念型範圍。1次隔離獨立Pi研究退出0、最終stop、0模型／工具error；起始S1全檔hash與v2最後快照相符。6次定向查詢，新讀4篇（繁中3／英文1），另重讀2個既有案例。新增可計工作及嚴格適配0；累計不同原問題62篇，工作／反對適配36則（A11/B13/C12）。v1完整嚴格合取未編碼，累計仍未知。

繁中新讀已核實日期與作者鍵，情境為專案規則載入繼承、ChatGPT查學員打卡的MCP試作、多agent長任務交接停在第一層；主要需求超出目前概念題材，保存排除理由與邊界反例。英文新例為Todoist／Google Calendar排程可行性。既有n8n220707同帖核對到「LLM整理固定查詢結果」與「首次HTTP request tools」，支持B局部背景；首次整體工具循環背景仍缺。n8n94218銷售Wait案例未補出此前LLM使用背景。兩例與v1作者鍵／URL一致，不增加獨立數，不修改舊納排。

CP3維持A主要、B/C次要，原題「Agent與workflow差在哪：從下一步由誰決定，到為何需要驗收」與概念型範圍保留。無新待決事項，CP1～CP3、Q5/Q6不重問。本批研究交付完成；繁中嚴格背景、A主要決策選擇、B首次工具循環與真人理解仍待補。停止於資料及適配判讀，不進大綱、不寫稿。後續先載入本段及v3結果，再按新取得的直接背景資料定向核對；不因缺口自動擴大研究，不重跑整批。

最新成果根目錄 `/tmp/course-b11-validation/round2/S1-a/article/`：reader-research-results-v3.md、research-continuation-v3.md、reader-research-verification-v3.md及public-reader-research-v3/。去重須同讀v1/v2/v3 ledger；v3另列4新讀與2重讀。v1/v2、教材、確認與方向原樣保留，三層progress只追加。iT邦完全未請求，本批無403／429；僅正常公開免登入API，未聯絡作者或執行頁內操作。

課程工程根目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。既有blueprint第8節與rca-report已更新。新證據 `validation-b11/round2/s1-public-followup-v3/` 保存binding、probe、起始git狀態與未提交diff、獨立prompt/events/reply/exit、verification、前後快照；下次以final-verified-workspace及final-verification.json比對。協調者核對6則短引／背景及去重，另重抓全部6 API，HTTP200，日期、作者鍵與引句皆相符。

隔離探針、12個保護目錄hash、三層progress前綴與兩repo git diff --check通過。S5-a未跑，S2-c暫存／不進規劃，整體Phase5仍部分完成。未改Skills、發布、安裝真實其他專案、施工Steve、commit或push，全部其他未提交內容保留。同步及結構未重跑。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1定向補查已交付，累計36則，指定背景與繁中適配仍待補

2026-11-22已依使用者授權沿用CP1～CP3與原30則，使用課程版本skill-engineering完成Phase5第12～14步本批。新增1次獨立隔離Pi研究，退出0、最終stop、0模型error。起始S1與前輪final-verified-workspace全檔hash一致，原成果及其他未提交內容保留。

補查5個繁中發現查詢與5個英文A/B查詢，新增讀10篇原帖（繁中3、英文7）。納入6則工作／反對適配證據，A3、B3；累計讀58篇、納入36則（A11、B13、C12）。新增納入4則近12月、A2則24月擴窗。新增同時符合指定背景與主要概念需求者0；v1未編碼嚴格合取，累計嚴格適配數保留未知。未重跑九原詞或整批48帖；E03沿用前輪限定詞且無新增原帖，查詢紀錄保留。B本批未追加24月查詢。

具體結果：n8n 103336有固定Perplexity→ChatGPT與agent選工具的比較，主要追問品質／延遲／token；n8n 271853有首次PA專案的日曆回傳疑問，仍缺基本LLM經驗與首次工具學習的同時自述。n8n 240317電子報parser問題保留為技術需求超出概念教材的反證。繁中iT邦3帖已讀，含Google Calendar工具命名衝突；追加metadata遇403後停止路線，發文日／作者鍵語義待核，未計入獨立工作數。繁中與A/B指定背景缺口持續保留。

CP3維持A主要、B/C次要、原題「Agent與workflow差在哪：從下一步由誰決定，到為何需要驗收」及概念型範圍，無新待決事項，不重問CP1～CP3、Q5/Q6。研究交付本批完成，完整適配及真人理解測試仍待補。停止於資料與適配判讀，不進大綱或寫稿。後續若繼續研究，先沿用36則並聚焦尚缺的背景原話；不得再以A距10則缺2描述現況。受阻iT邦本批不重試；新研究僅用正常公開免登入路線，不聯絡作者、不使用私人憑證或繞過控制。

最新成果根目錄 `/tmp/course-b11-validation/round2/S1-a/article/`：reader-research-results-v2.md、research-continuation-v2.md、reader-research-verification-v2.md及public-reader-research-v2/。v1原始成果全部保留。下次先讀本段、v2結果及v2/v1 ledger；以v2累計數接續，來源與CP確認仍沿用原版本。三層progress僅追加。10則引文、6則去重計數核對通過；協調者另重抓EN2/EN3/EN5三API，HTTP200且原話／日期／作者鍵一致。真人理解效果未測。

課程工程證據：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b11/round2/s1-public-followup/`。保存起始git與diff、binding、probe、原始獨立log、verification、source-spot-check及final-verified-workspace；下次先比對此最後快照。隔離探針、保護hash、進度前綴與兩repo git diff --check通過。唯一工具error為403，Bing低相關已記；協調者補齊query-log三個空結果欄，查詢JSON未動。

既有blueprint第8節與rca-report已更新，整體Phase5仍部分完成。S5-a未重跑；S2-c暫存／不進規劃及文章下游未完成。未改Skills、發布、安裝真實其他專案、施工Steve、commit或push。同步與結構未重跑。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 最新接續：S1公開讀者研究已交付，下一批聚焦繁中與概念需求缺口

使用者已授權公開網頁研究，沿用CP1～CP3、原題及概念型範圍。已用課程版本工程家族完成Phase5第12～14步本批；1次獨立Pi研究成功，正常stop、退出0、0模型error。9組原查詢、9次Bing替代及14組補查均保存，原帖從公開n8n／GitHub API取得，未登入或用網站憑證。

本輪讀48則原帖，納入30則不同平台作者鍵／URL的工作問題及反對適配證據，排除18則。A8、B10、C12；A2及B3為24個月擴窗，其餘25則近12月。英文27、中文2、中英混合1，純繁中0。研究支持決策權／工具回傳／外部驗收主線：銷售流程作者因Wait節點疑惑自主，首次HTTP工具使用者看不懂Tavily回傳循環；同時大量建置者需要架構／協議除錯，另有已明定驗收卻只驗scratch副本的自述。上述皆原作者工作報告，未重現故障或真人理解效果。

保留CP3暫採A主要、B/C次要，無新待答問題，不重問CP1～CP3。研究執行與交付本批完成，完整讀者適配驗證仍部分完成。A缺至少2則才達最低工作樣本數；更重要的缺口是A主要卡在固定／動態決策、B首次工具學習背景、C概念需求及繁中資料。下次直接聚焦這些缺口，沿用已取得30則，不重跑整批查詢；只對新證據改變的適配提出差異。使用者已授權公開研究，持續限定不進大綱、不寫稿；新方向或擴大工作才另問。

成果根目錄 `/tmp/course-b11-validation/round2/S1-a/article/`：research-continuation-v1.md、reader-research-results-v1.md、reader-research-verification-v1.md及public-reader-research-v1/（query-log、ledger、48份匿名化正文、日期／查詢／讀取紀錄、counts、validation與研究輔助腳本）。三層progress只追加，原素材、收穫、索引、方向與確認hash不變。後續對話先讀本最新段、結果報告的「偏差與新缺口」及ledger，再接續補查；歷史「各群0則」保留為研究前狀態。

長期證據為課程工程 `validation-b11/round2/s1-public-research/`：binding、probe、profile、verification、source-spot-check、前後workspace、三次原始程序log。48則短引對保存正文及計數核對通過；另重抓5個API，HTTP200，原話／日期／作者鍵一致。S1專用隔離探針、保護hash、progress前綴及兩repo git diff --check通過。2次Node啟動退出-6後改pipe擷取成功；1次here-document拒寫改S1腳本成功。Google空正文、Bing低相關、n8n一次429均留紀錄。同步與結構未重跑。

整體Phase5仍部分完成。S5-a未重跑；S2-c暫存／不進規劃及文章下游未完成，Q5/Q6不重問。未改Skills、發布、安裝真實其他專案、施工Steve、commit或push，其他未提交內容保留。課程blueprint、rca-report與本唯一長期交接已更新。課程工程根目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：S1 CP3已確認，暫採讀者與範圍；本次僅記錄

使用者同意暫採「為既有自動化任務選流程、知道基本LLM與預設分支的人」為主要讀者；拆解工具型agent的學習者與訂AI完成條件的人為次要。原題「Agent與workflow差在哪：從下一步由誰決定，到為何需要驗收」及概念型範圍保留。CP1、CP2沿用，CP3已答，不重問。

本次重讀directions-v1及其構想、研究計畫、暫定分析、CP2確認、交接及原四項依賴，重算S1工作區與原素材hash，與CP2長期快照／binding一致。展示SHA-256：944632388040a0c4c78450524b4f4ff5adec1e57055c90a1df48044b6baf3115。新增 `/tmp/course-b11-validation/round2/S1-a/article/cp3-confirmation-v1.md`保存實際回覆與範圍；三層progress只追加。directions-v1為暫採方向依據，原展示及歷史保留。

真實研究缺口保留，各群0則資料，背景／問題／原話／日期／理解測試仍待補。研究計畫未執行。本次只記錄確認，沒有新待答問題；不外查、不進大綱、不寫稿。停止原因為使用者限定本次範圍。下一個可推進動作是取得真實資料或新的研究授權後核對資料，屆時沿用CP1～CP3，只重評新證據影響的適配。新對話先讀本段、課程blueprint第8節最新段及cp3-confirmation-v1，不再要求確認同一讀者安排。

完成課程工程Phase5第13～14步本次記錄，第12步新增0次。版本綁定、前後workspace與verification在課程工程目錄 `validation-b11/round2/s1-cp3/`；原檔hash、progress前綴與兩repo git diff --check通過。先前獨立實跑、隔離、同步及結構結果為先前回報，尚未重驗。整體Phase5仍部分完成；使用者閱讀及理解效果待驗證。

S5-a不重跑；S2-c維持暫存／不進規劃及文章下游未完成，Q5/Q6不重問。未修改Skills、發布、安裝真實其他專案、施工Steve、commit或push；全部其他未提交內容保留。既有課程blueprint、rca-report及本唯一長期交接已更新。課程工程根目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：S1 CP2暫定分析完成，下一項為讀者與適配確認

使用者已選CP2「暫定分析」，要求保留原題、沿用CP1。本次完整核對原展示及source／harvest／index／intro與教材依賴，保存hash後，依課程版本工程家族Phase5第12～14步新增1次獨立Pi實跑，正常stop、退出0、0模型／工具error。CP2答案已記錄，不重問。

成果位於 `/tmp/course-b11-validation/round2/S1-a/article/`：新增cp2-confirmation-v1.md、idea-v1.md、reader-research-plan-v1.md、reader-analysis-provisional-v1.md、directions-v1.md。文章、課程與入口progress僅追加；原展示、來源與13項收穫保留。研究計畫包含3群候選讀者、每群中文2組／英文1組查詢、10–20則採樣目標、近12個月不足放寬24個月、來源與原話核對、反證及理解測試。全部尚未執行，各群真實樣本0則。

具體建議全部標為假設：主要讀者A是「為既有自動化任務選流程、知道基本LLM與預設分支的人」；次要B是拆解工具型agent的學習者，C是訂AI完成條件的人。保留「Agent與workflow差在哪：從下一步由誰決定，到為何需要驗收」原題及概念主線。預期可觀察成果為辨識下一步決策者、追蹤工具回傳、提出外部完成判準。若A實際要部署／API就降低適配；若B的loop問題更貼合教材就重評主要讀者。真實背景、工作問題、原話、來源日期與理解效果仍待補。

本批CP2接續及暫定分析文件測試通過，真實研究未完成。新待答只限directions-v1末節CP3：是否暫採A主要、B/C次要及概念型範圍，可修改或暫緩。尚未代答，未進大綱、角色檢查或寫稿。下一輪先讀本最新段、課程blueprint第8節最新段與CP3實際展示，將使用者新答案綁定directions-v1及其依賴後記錄；外查、測試或大綱依新授權範圍執行。

長期證據存課程工程目錄 `validation-b11/round2/s1-cp2/`，含bindings、專用sandbox探針、前後workspace、verification及腳本；原始log在同層s1-cp2-analysis。原repo拒讀、Skills／S5／站外拒寫及S1可寫探針通過，認證寫入例外沿用。保護hash、原progress歷史前綴與兩repo git diff --check通過；同步及結構未重跑。協調者一次offset超界後已全文重讀。受測程序內缺角色委派工具；協調層本次已用獨立Pi執行，能力分層記錄。

整體Phase5仍部分完成；S5-a未重跑，S2-c維持暫存／不進規劃及文章下游未完成，Q5/Q6不重問。未外查、修改Skills、發布、安裝真實其他專案、施工Steve、commit或push，其他未提交內容保留。已同步更新既有課程blueprint及rca-report。課程工程根目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：S5-a大綱規劃驗收完成，下一項為S1讀者資料路線

使用者在釐清Calc只是測試文章的教學工具後，回覆「OK，回到剛剛，繼續下一步」。本次沿用行政讀者／Calc設定，完成S5-a大綱接續、獨立四角色檢查、指定單項採用及採用後用途核對。大綱確認與只採編輯-1來自既有S5測試預回覆，與實際使用者回覆分開保存。未要求使用者操作Calc或再次回答同批採用問題。

新增2次獨立Pi程序，正常stop、退出0、0模型error。新S5-a含可讀idea，與先前無idea的S5-b/g不同，因此依完整依賴新做角色檢查，未重跑舊分支。採用版只將第5段標題「5. 帶著驗收清單交付」改為「5. 依驗收清單判斷能否交付」；全檔精確比對通過，其他四項建議未採用。自用回找與非搜尋題文一致性有限通過，教學及Calc實作仍待補。使用者真人閱讀、操作及20分鐘驗證新增0次。

成果在 `/tmp/course-b11-validation/outputs/S5-a1/article/`：outline-review-s5a-v1.md、confirmation-s5a-v1.md、outline-adopted-s5a-v1.md、outline-review-adopted-s5a-v1.md及progress。長期證據位於課程工程目錄 `validation-b11/round2/s5a-resume/`，含前後快照、bindings、probe、diff、verification及腳本；原始log為同層s5a-role-review與s5a-resume-adopt。專用sandbox探針、保護目錄hash、原檔及progress歷史前綴、兩repo git diff --check通過；4次新檔ENOENT後成果已讀回。同步與結構未重跑。

工程Phase5第12～14步本批完成，整體仍部分完成。S5-a規劃與單項採用已完成，不重問工具、讀者或原大綱確認。S2-c仍暫存／不進規劃，文章下游未完成，Q5/Q6不重問。未執行Calc、寫全文、研究、修改Skills、發布、安裝真實其他專案、施工Steve、commit或push，其他未提交內容保留。

下一個具體選擇已從實際展示讀取：`/tmp/course-b11-validation/round2/S1-a/article/research-gate-v1.md` 的CP2。這個測試以真實Intro課程規劃「Agent與workflow差在哪：從下一步由誰決定，到為何需要驗收」，缺真實讀者背景、問題／原話與來源日期。建議選1「暫定分析」，只保存研究計畫與暫定讀者／適配建議供確認，不外查、不寫稿、不冒稱完成研究。使用者亦可選2補資料或3暫緩；尚未收到選擇，未啟動S1。下次收到答案先核對本展示及其依賴，使用課程版本工程家族接續，沿用CP1，不重跑S5-a或其他完成項。

本次結果另已更新課程blueprint第8節與rca-report開頭。課程工程目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：S2-c Q6已確認，只記錄決定並維持暫存

使用者實際回覆：「同意S2-c Q6的新版內容判斷：第一節觀念價值增強，保留於合併候選；兩節以觀念與驗證方法互補作合併理由；新增風險資訊由同一候選承載，暫不另開章級文章。」已讀實際展示並綁定 `/tmp/course-b11-validation/round2/gap-check/S2-c-latest/courses/backup-restore/decisions/source-revision-reevaluation-v1.md` 末節Q6；SHA-256：`f69fffdd9e8f0bb515afbb8c69ec6aa23b74f1079f306c4882628f4e802105d2`。同目錄progress.md已追加Q6最新回覆。原決策展示與歷史待答文字保持原樣，最新狀態依progress末節。

Q6已答，Q5不重問。確認限新版內容判斷，例如第一節的副本損壞風險接第二節的小範圍驗證及安全邊界，仍放在同一合併候選。既有暫存／不進規劃、第三節不另成文繼續保留；選題研究、大綱及寫稿等待另行授權。S2-c文章下游維持未完成，不製造歷史文章或確認。其他分支維持等待，已完成項目不重跑。

本次依課程版本skill-engineering完成Phase5第13步回覆與展示核對、第14步記錄；第12步未新增，整體Phase5仍部分完成。只更新分支progress、課程blueprint第8節、rca-report開頭及本唯一長期交接。未重建五份成果、執行runner或新增模型實跑、全文提示詞驗收及使用者功能驗證；歷史驗收為先前回報，尚未重驗。保留全部其他未提交內容；未修改Skills、發布、安裝真實其他專案、施工Steve、commit或push。

本次停止於決定記錄，無新增待答問題。下次先載入本最新段及課程blueprint最新段，需要核對確認時讀分支progress末節與原Q6展示；沿用Q5、Q6，等待使用者另行指定工作，不自動進研究或規劃。課程工程目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。溝通指引：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：S2-c修訂成果已完成，等待Q6新版成文理由

使用者另授權來源鏈、受影響收穫、索引及單節／兩節／章級重評後，本次沿用Q5及課程版本工程家族，完成Phase5第12～14步的本批接續。新增1次獨立模型實跑，退出0。成果根目錄 `/tmp/course-b11-validation/round2/gap-check/S2-c-latest/courses/backup-restore/` 新增source-v4.md、lesson-01/02的harvest-v2.md、learning-index-v4.md、decisions/source-revision-reevaluation-v1.md，progress僅追加；第三節原收穫沿用，由新索引映射現行內容。

新版建議：第一節觀念價值增強；兩節以定義／風險與驗證方法互補作合併理由；新增風險資訊可由同一合併候選承載，暫不另開章級篇。Q6全文在新決策末節，等待使用者對上述新版內容判斷回覆。Q5已完成，不重問；暫存／不進規劃及第三節不另成文繼續保留。收到Q6只記錄或依指定理由重評，不自動進研究、大綱或寫稿。

五份成果已讀回；來源、安全條件及無實測限制已核對。程式核對新增5檔、只改progress、歷史前綴保留、原impact不變、未建立article；Skills、fixtures與P/A/B歷史hash不變。執行證據及前置命令受阻／修復詳課程blueprint第8節最新段與 validation-b11/round2/s2c-q5-rebuild/。全文提示詞驗收、使用者功能驗證新增0次；整體Phase5仍部分完成。

S2-c文章下游維持未完成，不製造歷史文章或確認。其他分支未盤點，完成項未重跑；保留其他未提交內容，未修改Skills、發布、安裝真實專案、施工Steve、commit或push。後續對話讀本段、課程blueprint最新段及S2-c決策／progress即可接續。溝通指引：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：S2-c Q5影響清單範圍已確認，後續執行等待授權

使用者實際回覆：「同意影響清單範圍」。已綁定 `/tmp/course-b11-validation/round2/gap-check/S2-c-latest/courses/backup-restore/source-revision-impact-v1.md` 的 Q5，並於同目錄 progress.md 追加最新回覆。確認保留未受影響內容與確認；新版合併理由及「無額外章級增值」列為待重評。Q5已答，不再重問。

本次沿用課程版本工程家族，只核對確認範圍並記錄決定，完成Phase5第13～14步的本次記錄；第12步未執行。下游重建、重新評估及寫稿維持等待授權。S2-c文章下游維持未完成，不製造歷史文章或確認。其他分支維持等待，未重新盤點；站1D、全文單項定稿、全文提示詞驗收、本地S3及其他已完成項不重問、不重跑。

只更新分支progress、課程blueprint第8節、rca-report最新段及本唯一長期交接，保留原展示與歷史。未改Skills、素材、評估或文章；未新增模型實跑、全文提示詞驗收或功能驗證。歷史驗收為先前回報，尚未重驗。保留全部其他未提交內容；未發布、未安裝真實其他專案、未施工Steve、未commit或push。

後續對話先讀本段及課程blueprint最新段，沿用Q5確認。若使用者要求接續，先展示S2-c下一批具體工作及寫入範圍供授權，再進行第12步；本次尚未授權該批工作。整體Phase5仍部分完成。溝通指引來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：剩餘輸入已核對，等待新答案或資料

本輪使用課程版本工程家族完成Phase5第13步核對與第14步記錄。已重讀課程blueprint第7節與最新結果、rca-report、預回覆表，以及S1、S2-c、S4、S5、S6、S8、S9-F主線與三缺項的實際待辦；站1驗收v2末尾文字取捨亦已讀取。各分支仍缺新答案或資料，本輪沒有可直接推進的項目，未新增第12步實跑。

剩餘等待：S1研究路線、S2-c Q5影響邊界、S4試改整合、S5讀者與Calc路線、S6回顧提案、S8真實研究資料、S9-F各自成文決定，以及站1歷史狀態／未實測文字更新。逐檔來源及判定存於課程blueprint第8節最新表。例如S2-c仍只獲准列影響，未重建下游；文章下游保持未完成，不製造歷史文章或確認。

站1D、全文單項定稿與P1、本地S3及其他已完成項保留，不重問、不重跑；其實跑與精確驗收為先前回報，尚未重驗。此次新增模型實跑0次、全文提示詞驗收0次、使用者驗證0次。兩repo git status已查，git diff --check通過。未重跑隔離、同步或結構檢查；首次read工程Skill的offset超出檔尾，已改全文讀取。

只更新既有課程blueprint、rca-report及本唯一長期交接，寫後讀回。未改受測progress、Skills、文章或素材；全部其他未提交內容保留。未發布、未安裝真實其他專案、未施工Steve、未commit或push。整體Phase5仍部分完成。

下次先載入本段及課程blueprint最新表。取得任一分支有效新答案或資料後，再核對該實際展示與依賴，接第12～14步；無新輸入時維持等待，不重複相同盤點。已完成站1及本地S3不可重跑。工程與證據路徑沿用下段，溝通指引來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：站1已選D，全文單項定稿與提示詞驗收完成

已依使用者實際答案承接D「每個填入的值都要對得回原句。」先重算blueprint保存的展示與兩份採用依賴SHA，三檔相符，再綁定author-checklist-core-pending-cont-v1。其餘七項有效確認、四句認同及既有採用範圍沿用，不重問A～E。使用課程工程家族完成本批Phase5第12～14步。

新增4次獨立Pi程序，均正常stop、退出0、0模型error／逾時。其中1次只收到全文實際七行提示詞與測資，三列六欄18格及兩項缺值精確核對通過。定稿提示詞與實際輸入逐字相同。例如B保留2026-12-02，負責人仍待確認；C截止日待確認。初稿後完整讀取M1展示，依blueprint第7節既有單項採用與定稿預回覆綁定，只改第3節小標加入「怕AI替我亂填？」；全文精確diff通過。D只確認核心句；M1來源為既有測試預回覆，使用者閱讀驗證尚待完成。

實際定稿：`/tmp/course-b11-validation/station-1/outputs/round2-S3/article/final-core-d-m1-cont-v1.md`。最新驗收及用途為同目錄acceptance-core-d-m1-cont-v2.md、publication-check-core-d-m1-cont-v2.md，文章及課程progress已更新。稿內歷史初稿／未實測文字按單項範圍保留；是否更新仍保存待取捨，未擬替代文案。教學仍未通過：B理由檢核、五欄答案另附第六欄、第一步只指檔名三處原缺口保留；真人理解、操作及20分鐘待驗證。自用靜態回找、非搜尋題文一致性通過。

第一次交證據只給目錄，受測者找不到確切檔名；第13步補六檔完整路徑後另跑，完成證據交回。10個工具錯誤（offset、EISDIR及ENOENT）及原v1全部保留，後續已完整讀取252行P1事件及成果。未識別需返回Phase2施工的Skill缺陷。

站1專用隔離探針通過，含原repo／站2／symlink拒讀及站外／Skills／symlink拒寫；指定輸出可寫。同步check、兩repo git diff --check通過。課程兩側agent目錄、真實articles／materials／scripts、本地與兩站Skills起訖hash相同；原站1既有檔僅兩層progress變更，無刪除。結構診斷及站2探針為先前回報，尚未重驗。

長期證據根目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b11/round2/station1-core-d/`。內含bindings、probe、verification、事件索引、diff、腳本與前後workspace；定稿長期副本為final-workspace/article/final-core-d-m1-cont-v1.md。四次原始log在同層station1-core-d-draft、station1-core-d-fulltext-P1、station1-core-d-adopt及station1-core-d-evidence-return。完整結果以課程blueprint第8節最新段及rca-report開頭為準。

已更新既有blueprint、rca-report與本唯一長期交接，寫後讀回。整體Phase5仍部分完成，使用者驗證本批新增0次。本地S3與其他已完成分支未重做；S2-c文章下游維持未完成，未製造歷史文章或確認。其他未知取捨保存等待；未發布、未安裝真實專案、未施工Steve、未改Skills／工程家族、未commit或push，全部其他未提交內容保留。

新對話先載入本段、課程blueprint最新站1D段及rca-report開頭，再接第13步核對剩餘分支有效輸入。站1D、全文單項定稿及P1已完成，不重問不重跑；本地S3已完成範圍同樣保留。需要稿內歷史狀態文字更新時，先依實際稿件提出精確差異，取得對應採用後才回第12步；其餘未知取捨等待。溝通指引來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：剩餘主線已核對，只等待站1核心句選擇

本輪依課程工程家族Phase5第13步，重讀blueprint第7節與gap-check、rca-report及實際待辦。已核對S1研究路線、S2-c最新影響清單、S4試改整合、S5原工具路線、S6回顧提案、S7站1、S8-F資料及S9-F主線與三缺項；均仍缺新決定或資料，未找到可直接推進的新主線。逐項來源與判定存課程blueprint第8節最新段。新增模型實跑0次、全文提示詞驗收0次、使用者驗證0次。

本次只展示站1全篇核心句選擇。站1七項確認及四句認同均保留；尚缺哪句作為全篇主軸。選項為A「先留下來源，再整理內容。」、B「決議記選擇，待辦記工作。」、C「沒寫的值就留待確認。」、D「每個填入的值都要對得回原句。」、E自行提供。協調者建議D，以來源核對貫穿分類、缺值與回查；建議尚未採用，作者尚未回覆。此題僅適用隔離站1，勿套用本地S3核心句或社群A選擇。

實際展示：`/tmp/course-b11-validation/station-1/outputs/round2-S3/article/author-checklist-core-pending-cont-v1.md`。本輪完整讀取展示，核對progress最新事件，重算展示、outline-adopted-editor1-cont-v1及outline-review-post-editor1-cont-v1的SHA，已保存在課程blueprint最新段。收到核心句答案後先比對，再交獨立程序接續；其他有效確認不重問。

本地S3 Q4B、全文、全文P1與CP5保持完成，未重做。其他已完成支線及原精確驗收為先前回報，尚未重驗。S2-c文章下游維持未完成，未製造歷史文章或確認。未改受測progress、Skills、真實文章或素材；其他未知取捨保存等待。未發布、未安裝真實其他專案、未施工Steve、未commit或push，全部其他未提交內容保留。

完成本批第13步待辦核對與第14步記錄；只更新既有blueprint、rca-report及本唯一長期交接，寫後讀回。未重跑模型、隔離探針、同步或結構檢查。下次先讀本段及課程blueprint第8節最新段；依站1實際答案再接第12～14步。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：本地S3已確認A開頭，社群定稿完成

使用者已明確選threads-draft-v1的A開頭，確認完整共用正文，全文網址保持待補，不發布。已重算草稿SHA並比對前輪長期快照相同，保存展示、全文依賴hash及實際回覆，再交課程版本獨立程序接續。此答案僅適用本地S3 CP5，未套用S6選擇。

本批完成Phase5第12～14步，新增1次獨立Pi實跑，正常stop、退出0、無模型error／逾時。另存threads-final-v1與cp5-threads-draft-v1-confirmation-v1，更新article/progress。外部精確核對定稿為A開頭＋完整共用正文，304字元，另有檔尾換行；原草稿及全文依賴hash未變。全文網址仍待補，未發布、未新增回顧任務。Q4B、全文定稿及全文提示詞驗收未重做，本次全文提示詞新增實跑0次。

定稿路徑：`/tmp/course-b11-validation/round2/S3-a1/article/threads-final-v1.md`。長期證據根目錄仍為課程工程目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`；其 `validation-b11/round2/s3-cp5/`保存binding、probe、verification、腳本及前後workspace，`s3-cp5-final/`保存原始執行log。長期定稿副本為s3-cp5/final-workspace/article/threads-final-v1.md。完整判定見blueprint第8節最新CP5段及rca-report開頭。

本地隔離探針、同步check及兩repo git diff --check通過。課程兩側agent目錄、真實articles／materials／scripts、隔離及兩站Skills與起始hash一致。S3既有檔案僅article/progress修改，無刪除；兩個新檔ENOENT及一個offset工具錯誤留log，後續成果已讀回。結構檢查及兩站OS探針為先前回報，尚未重驗。

本地S3社群選擇與定稿分支已完成。使用者確認範圍為所展示的A開頭與正文，真人閱讀、操作及時間效果仍待驗證。整體Phase5仍部分完成，其他未知取捨保存等待；S2-c文章下游未完成，不製造歷史成果。已更新blueprint、rca-report及本唯一長期交接並讀回。未修改Skills、未安裝真實其他專案、未施工Steve、未commit或push，全部其他未提交內容保留。

新對話先讀本段、課程blueprint最新CP5段及第7節剩餘情境，依第13步核對尚未完成分支與有效輸入；有足夠輸入及既有核准才回第12步執行。已完成Q4B、全文、全文P1及社群定稿不重跑，不再詢問CP5開頭。未知取捨只展示必要新差異。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：本地S3已承接Q4B，全文及獨立提示詞驗收完成

已先核對課程blueprint保存的author-checklist-v2、confirmation-v1、outline-v2三檔SHA，全部相符，再將使用者Q4選B交獨立程序接續。另存confirmation-v2；Q1／Q2／Q3／Q5有效確認沿用，未重問A/B。稿內保留提示詞、人工目標答案與逐列核對方法，預測試只留驗收紀錄，也不再寫從未試跑。

本輪依課程工程家族完成Phase5第12～14步的本地S3批次，新增3次獨立Pi程序，全部正常stop、0模型error／0逾時。其中1次只收到全文實際P1及內嵌資料，三列六欄18格精確核對通過，B缺人／C缺日期仍待確認。與舊大綱預測試分開保存。完整證據已交回全文驗收、定稿用途檢查及article/progress。

已產生初稿與CP4展示，將blueprint第7節S3-b既有單項採用及定稿預回覆綁到實際M1，完成final-v1。正文精確比對只有第2節一句釐清紀錄未指定負責人；全檔另有初稿→定稿狀態註記更新，false結果及diff保留。定稿P1與實跑輸入逐字相同，人工答案未換成模型回覆。自用文字回找、非搜尋題文一致性通過；教學仍待真人理解、操作及15分鐘驗證。

Threads草稿與三開頭已保存，A/B/C加正文分別304／310／304字元。**唯一新增本地S3等待為CP5：選開頭及確認社群內容。**原S3預回覆沒有指定A/B/C，S6第二開頭答案限S6，未移用。網址待補，未發布。其他未知取捨保留；S2-c文章下游維持未完成，未建立歷史文章、fixture或確認；followup、S6及S9-e未重做。

本地隔離探針、同步check、兩repo git diff --check通過；結構0 error／5 warning。來源兩側agent目錄、真實articles、materials、scripts、隔離及兩站Skills與起始hash一致；S3既有檔案只改article/progress，其餘新增、無刪除。13個模型工具錯誤及後續正確讀取已保存，含新檔ENOENT、誤找binding檔名、EISDIR與offset；兩站OS探針本次未重跑。未識別需返回Phase2施工的Skill缺陷。

長期證據在課程工程目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b11/round2/s3-q4b/`：bindings、verification、事件索引、diff、腳本及前後workspace。三次原始log在同層s3-q4b-draft、s3-q4b-fulltext-P1、s3-q4b-adopt。臨時成果為 `/tmp/course-b11-validation/round2/S3-a1/article/`；長期副本為s3-q4b/final-workspace/article/。

已更新既有blueprint、rca-report及本唯一長期交接，寫後讀回。Phase5全體部分完成，使用者尚未驗證文章、操作或研究。未修改Skills／工程家族，未安裝真實其他專案、未施工Steve、未commit或push，全部其他未提交內容保留。

下次讀本段、課程blueprint第8節最新S3 Q4B段及實際progress，沿用既有核准。Q4B、全文與全文P1驗收不重做。若接續社群，先展示threads-draft-v1的CP5並取得實際答案，再綁定版本接第12～14步；其餘分支等待依blueprint前輪gap-check，本次未重驗。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：剩餘預回覆已核對，只等待本地S3稿內實測用途選擇

本輪重讀課程blueprint第7節、第8節gap-check、rca-report開頭、課程工程家族及預回覆表，核對各未完成主線的實際progress。現有預回覆未涵蓋目前的新選擇或缺資料；沒有重做followup、S6或S9-e。S2-c文章下游維持未完成，未建立歷史文章、fixture或確認。

本次向使用者只展示本地S3的Q4：A把既有單次提示詞預測試的模型、版本、實際回覆與限制寫進文章；B只保留驗收紀錄，文章仍有提示詞、人工目標答案及逐列核對方法。助理建議B，讓會議待辦教學保持聚焦；建議尚未採用，使用者尚未回答。兩案都保留後續全文提示詞獨立實跑。Q1／Q2／Q3／Q5有效確認保留，不重問。

展示綁定為`/tmp/course-b11-validation/round2/S3-a1/article/author-checklist-v2.md`及`author-checklist-v2-confirmation-v1.md`。本輪已完整讀取兩檔並核對progress最新事件；兩檔及outline-v2的重算SHA保存在課程blueprint第8節最新「gap-check接續」。收到A／B或其他處理後，先核對該版本，再交新程序接續；答案只適用本地S3。其餘等待仍按下方gap-check，未取得新答案。

本輪完成Phase5第13步待辦核對與第14步記錄，第12步新實跑等待Q4。新增模型實跑0次、全文提示詞驗收0次，使用者驗證仍待完成。只更新blueprint、rca-report及本唯一交接，寫後讀回；未改Skills、測試成果、真實文章或素材。保留其他未提交內容，未安裝、未施工Steve、未commit或push。前輪結構、同步及隔離結果為先前回報，尚未重驗。新對話讀本段及課程blueprint最新段即可接續，勿再次盤點或重問已確認四題。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪結果：round2 gap-check補查S6、S2-c及兩入口缺位置接續

沿用既有核准與課程工程家族，接續Phase5第12～14步。本輪新增3次獨立Pi實跑，均正常stop、0模型error／0逾時。完整逐分支判定維持於課程blueprint第8節最新gap-check與rca-report開頭。

S6已重讀原稿、三開頭、定稿、回顧、progress及原模型事件。機器精確比對定稿正文為第二開頭＋原正文，116字、符合500字限制；這是既有實跑證據靜態重驗，本輪未新增S6實跑。回顧保留虛構100曝光、缺基準不推趨勢，標題句型提案仍待選。原S6主情境的作者經驗、測試網址及真實回顧資料仍缺。模型事件整檔讀規則，限定只讀Rule3段落的粒度未驗證。

S2-c以最新三節累積及已確認章級評估起跑，核對來源、收穫、索引、四份決策及Q1～Q4。只新增完整現存下游影響表與progress，保留暫存／不進規劃限制；變更後合併理由與章級增值待重評，新Q5保存等待。協調者實際列檔三處S2工作區，均無article成果；文章／大綱／定稿失效支線仍未覆蓋。需先有依有效決定產生的下游或明確控制fixture範圍，保留未完成，不製造歷史確認。舊S2-c Q-S2c-1亦未代答。

S9-e兩入口各自綁定原無位置對話展示全文及SHA，提供隔離測試位置後獨立實跑，均把待辦落檔，素材等缺項保留。W另存展示副本僅多一個檔尾換行，byte-level比對false與正文一致核對均保存；原展示未變。沒有選題、規劃或寫稿。

站2證據交回、S4-b來源修訂及S5-g新版採用未重跑。本輪核對8份原模型log正常stop，followup workspace、站2及S5-g成果與長期快照hash完全相符。既有全文提示詞驗收證據保留，本輪未新增全文提示詞執行。

本地OS探針、同步check與兩repo git diff --check通過；結構0錯誤／5警告。課程兩側agent目錄、真實articles、materials、scripts、兩站Skills、原outputs及followup與起始hash一致；受測payload與來源一致。本輪未重跑兩站OS探針。全部其他未提交內容保留；未安裝真實其他專案、未施工Steve、未commit或push。

新證據位於課程工程目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b11/round2/`：`gap-*/`為三次原始log；`gap-check/`為verification、事件索引、binding、腳本、S6快照及workspace。本輪測試位置為 `/tmp/course-b11-validation/round2/gap-check/`。舊證據與原outputs均保留。

下一次先讀本段、課程blueprint第7節及第8節最新gap-check、rca-report開頭與實際待辦。保留等待：本地S3稿內實測用途、站1核心句、真實S4試改整合、S1研究路線、原S5-a工具路線、S9-F各成文決定、真實搜尋資料、S6回顧採用及S2-c Q5。對有新回覆的分支先綁定實際展示再執行；其他尚未重驗項逐列標於blueprint。勿重做已完成followup或S9-e落檔，也勿將S2文章下游列完成。Phase5仍部分完成，接續第12～14步。使用者尚未驗證文章、操作或研究。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪結果：round2 followup完成證據交回、S4-b來源修訂及S5-g新版採用

本次沿用既有核准及課程工程家族，新增8次獨立Pi實跑，均正常stop，0模型error／0逾時。完整分支判定只維護課程blueprint第8節最新followup與rca-report開頭。

已先將站2全文P1實際輸入、回覆、模型事件及final-v1提示詞一致核對交回。新版用途檢查與文章／課程progress已保存；原定稿hash不變，未新增稿內實測敘述。自用僅靜態通過，教學／搜尋與真人理解、操作、時間仍待驗證。

S4-b以實際完成的站2自製全文建兩個副本。無來源變更分支另存用途檢查，沿用有效確認。來源修訂分支將B日期12-02改12-03，保存影響表及下游失效，只重新處理受影響確認；按實際Q6／Q7展示綁定原預回覆後另存大綱、修訂全文及定稿。精確比對通過：大綱2處日期及來源依賴，全文8處日期及來源連結；定稿與確認版相同。修訂全文提示詞亦已獨立實跑，三列六欄18格符合新版，兩個缺值仍待確認；證據已交回新版用途檢查與progress。真實Intro試改等待未動。

S5-g已對新版實際展示綁定編輯-1，只改文件主標題為「用LibreOffice Calc把排班表匯出CSV並核對」。精確比對通過；舊review第5段標題未套用。未擴張為原工具路線或整體大綱確認，未採用缺口照實保留。

本輪同步check、兩repo git diff --check通過，結構0錯誤／5警告。本地及站2OS探針通過。課程兩側agent目錄、真實articles、materials、scripts及兩站Skills與起始hash一致，受測兩目標payload與當前來源相同。保留工程家族、全部其他未提交內容；未安裝真實其他專案、未施工Steve、未commit或push。

證據仍在課程工程目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`：`validation-b11/round2/follow-*/`保存8次原始執行；`round2/followup/`保存新verification、run-events-index、綁定、路徑映射、diff、腳本及workspace／station-2-final-output／S5-g-final-output快照。S4-b映射後歷史log只作副本接續，原cont紀錄保持原樣。實際測試目錄仍為 `/tmp/course-b11-validation/`。

下一次先讀本段、課程blueprint第7節與第8節最新followup、rca-report開頭及實際待辦。站2證據交回、S4-b與S5-g本輪指定工作已完成，勿重做。接續盤點S6、S2-c完整下游及其餘矩陣中可沿用預回覆的分支。未知等待仍為本地S3稿內實測用途、站1核心句、真實S4試改採用、S1研究路線、原S5-a工具路線、S9-F成文決定與真實搜尋資料。S6及其他未重跑結果為先前回報，尚未重驗。兩站全流程、本地S3全文／社群等仍有未完成範圍；使用者尚未驗證文章。Phase5仍部分完成，接續第12～14步，不重新訪談或施工。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪結果：round2 continuation已補故障分支，站2完成全文及提示詞實跑

本次沿用既有核准、課程工程家族與預回覆，新增23次獨立Pi實跑，全部正常stop、0模型error。先將本地S3大綱P1輸入、回覆及模型識別交回CP3核對；四項清單確認已保存，唯一新等待是是否在稿內引用此次實測。完整結果集中於課程blueprint第8節最新continuation及rca-report開頭，不另建平行工程結論。

S4已核對字幕副本SHA並解除來源映射缺口，試改整合採用仍等待。S5-f已測有效確認不重問，以及故障注入的漏套／多套攔截與修復；修復全檔比對通過。S5-g缺欄退回、工具受阻、外部四角色補傳及W4.6核對均已實跑，新回傳停在修改採用。

兩站各按自己的大綱獨立五角色檢查。首次輸入漏上游來源，補齊後另存v2重跑。兩站分別只採新版編輯-1，精確比對通過。站1清單剩全篇核心句選擇；站2完成全文、M1標題單項定稿及用途檢查。站2定稿身分由progress保存，歷史初稿標記依單項修改限制保留。站2原任務終點為全文，未新增社群任務。

站2全文第3節的實際提示詞已交全新程序獨立執行，三列六欄18格全數符合原文；B缺人、C缺日期保持待確認。定稿提示詞與實跑輸入逐字相同。此結果與本地S3大綱P1預測試分開保存。實跑證據尚未交回站2progress／用途檢查，這是下一個可直接執行動作；只補驗證紀錄，稿內新增實測論點仍保留作者決定。

本次同步check、兩repo git diff --check通過；結構0錯誤／5警告。來源Skills、真實articles及兩站各198檔Skills與起始hash一致。原repo／前站／symlink拒讀、站外及Skill拒寫探針通過。最初探針因cwd受拒讀造成Python載入錯誤，改測試cwd後通過，原log保留。未施工Skills、工程家族、真實文章或素材；未安裝真實其他專案、未施工Steve、未commit或push，其他未提交內容保留。

證據：課程工程目錄 `specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b11/round2/cont-*/` 為逐次log；`round2/continuation/` 為新verification、run-events-index、綁定、故障fixture、腳本及長期快照。課程根目錄 `/Volumes/data/Projects-practice/lesson-preparation-perspective/`。真實臨時環境仍在 `/tmp/course-b11-validation/`，保留全部舊證據。

接續先讀本段、課程blueprint第7節與第8節最新continuation、rca-report開頭及對應實際待辦。依序交回站2全文實跑證據，處理S4-b及其他無新取捨分支。S5-g若繼續採用，重新綁定新review實際修改，舊編輯-1內容不可沿用。未知等待：本地S3實測敘述用途、站1核心句、S4試改採用、S1研究路線、原S5-a工具路線、S9-F成文決定與真實搜尋資料。S6為先前回報，尚未重驗；本地S3全文／社群、兩站全流程與S4-b等仍有未完成範圍。使用者尚未驗證文章。Phase5維持部分完成，繼續第12～14步，無須重新訪談或施工。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪結果：Phase 5 round2已追加實跑，完整驗收仍待完成

沿用B1.1與既有預回覆，使用課程工程家族，沒有重新訪談或重做施工。本輪54次獨立Pi程序包含8次憑證更新錯誤及1次逾時；失敗紀錄保留，重跑另取名稱。實際結果與分支表已更新課程blueprint第8節round2及rca-report開頭。

已實跑：S2第三節／章級無新素材／來源v2影響表；S3 F→W大綱、外部獨立五角色檢查及只採講師-1；S5獨立四角色檢查、只採編輯-1、全部不採用、再看看及拒絕額外合併；S1真實Intro、S4舊第8步、S8資料缺項比較、S9兩入口缺項及無位置等分支。具體例：S5只採編輯-1，實際新版只改指定標題，精確字串比對通過；S3正文只補指定答案表，另有版本註解，差異單獨保存。

兩站各198檔未變、31檔課程payload與來源相符；新版OS探針通過。各站已跑S3至大綱確認後缺隔離工具出口，另跑自製舊第8步S4。兩站全文主流程仍未完成。站點package-record保留舊摘要版本，與staging差異有紀錄，不覆寫歷史證據。

大綱outline-v2的P1已由獨立新程序只收提示詞執行，三列正確，B缺人／C缺日期保持待確認。全文尚未產生，全文提示詞驗收仍待完成。S3停在寫稿前CP3 Q4：補齊P1執行證據或刪除成功宣稱的新取捨；本輪後段已取得P1證據，但尚未交回此關卡。下次先交實際input/result及模型log讓受測流程核對，仍需作者決定的差異保存等待，不代答。

其餘等待：S1讀者研究路線、S5原LibreOffice路線、S9-F成文決定及真實搜尋資料。可接續分支：S4來源映射、S5-f／g、各站依實際outline另派獨立角色；S3全文／定稿／社群及完整兩站流程待前置關卡。S6為先前回報，尚未重驗。使用者尚未驗證文章。

本輪同步check與git diff --check通過，結構0錯誤／5警告；課程來源全部Skills及真實文章目錄hash與起始一致，工程家族／指引／scripts的git diff為0。只新增驗收證據並更新既有blueprint、rca-report與本唯一交接。未安裝真實其他專案、未施工Steve、未commit或push；全部其他未提交內容保留。

證據根目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/validation-b11/round2/`。逐次輸入／回覆／JSONL及快照、verification.json、run-events-index.json、P1-binding.json、S3-outline.diff、audit-final.json已保存。完整臨時成果快照為final-workspace與station-*-final-outputs；原臨時環境仍在`/tmp/course-b11-validation`，恢復時記映射與hash。真實素材副本只作驗收，不在套件payload。

新對話先讀本段、課程blueprint第7節及第8節round2、rca-report開頭與實際待辦檔；接續Phase5第12～14步。不要重做施工或重核已核准設計。工具需使用`/opt/homebrew/bin/python3`及已保存的round2 sandbox profiles；Pi退出0仍須查模型error。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪結果：Phase 5 檔案施工完成，驗收部分完成

使用者已核准B1.1整批施工與驗收，授權持續適用。本輪保留W1，寫入W2～W10及19列抽取子項，修改課程兩入口SOP、W四份規則與四組樣板，新增F三份規則與七組雙檔。來源為課程工程家族。最終兩SKILL.md逐字符合藍圖，並同步課程`.agents/skills/`與`.claude/skills/`。

同步check、git diff --check通過；結構診斷0錯誤、5個跨Phase按需重讀警告。共9個Phase、102步、7規則檔36條、11組雙檔。工程家族、AGENTS／CLAUDE及scripts的git diff為0。保留既有文章、素材及其他未提交內容，未安裝至真實其他專案、未施工Steve、未commit或push。

本輪已實跑Pi新程序工具smoke。S2首兩輪實際保留原收穫與確認，H002修正仍保留來源鏈，新增ID從H005接續；S6新對話採用第二開頭後另存定稿。S5只完成待確認大綱；S9-W交虛構三候選比較，S9-F停在成文決定。S7兩站各198檔清單一致，拒讀原repo／前站及symlink、限定寫入的OS探針通過；兩站主流程未跑。原始log、固定fixtures及hash、中間稿、成果快照、兩份候選package-record保存在課程既有工程目錄的`validation-b11/`。31檔payload hash已核對；公開許可條件待補。

整批驗收尚未完成：S1、S3、S4、S8未跑；S2其餘分支、S3研究fixture／全文提示詞獨立實測、S5隔離角色與修改採用系列、S7兩站主流程、S9缺項系列待執行。S5新增LibreOffice路線問題、S9-F新增成文確認已依未知問題策略停等，未代替作者回答。使用者尚未驗證文章。Docker狀態為先前回報，尚未重驗。

下次先讀本段、課程blueprint第8節最新結果與第7節分支表、rca-report開頭，再接續剩餘驗收；不要重做W1或重新訪談核准。各新程序先核對實際成果版本與既有預回覆；未知取捨維持等待。工程根目錄：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/`。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。以下保留前輪歷史。

### 前輪結果：B1.1整批文件修訂完成，當時目標Skill尚未施工

使用者已核准依課程blueprint第8節Q1～Q16一次更新完整To-Be、約束分配、施工工作項、計數與測試分支。先將核准記入本入口及既有rca-report，再完成B1.1修訂及文件一致性核對。沿用既有需求、B1及第3.1節內容替換核准，無重新訪談或逐項確認。

結果存於課程 `specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/blueprint.md` 第2～8節與 `rca-report.md` 第23節。現在有完整兩入口102步（F55／W47）、C1～C63單一位置及舊新映射、11組樣板設計、抽取子項及S1～S9分支預回覆。W1～W10及所有子項均待施工。

具體設計結果：新對話回「只採用編輯-1」時，讀原待辦與檢查版本，接續套用所選修改；對採用後版本另存用途檢查。作者未採用的建議及缺口保留，既有有效確認沿用。節收穫與跨節索引分開保存；F明確題材缺讀者研究仍先補研究。

本次唯讀Python計數、連續編號與待施工狀態核對通過；兩repo git diff --check通過，課程Skills／指引／scripts的git diff為0。修改內容已讀回核對。Pi／Docker／sandbox與同步check為先前回報，尚未重驗。S1～S9、獨立模型執行、兩站隔離與使用者成果驗證尚待Phase5。

只更新blueprint、既有rca-report與本唯一長期交接。保留既有文章progress、局部試改及全部其他未提交內容。不安裝、不移植、不施工Steve、不commit或push。後續新對話先讀本段、第6／9節與課程blueprint第8節最新結果，再依使用者下一次施工指示接續；無須重核B1或本次文件修訂。下方舊待授權及計數均為歷史。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪狀態：完整藍圖查核完成，交付一批工程修正提案

已先記錄使用者最新任務，再完整核對B1全部78步、需求追溯、部位、工作項及驗收情境。16組問題與最小修正方案集中於課程 `blueprint.md` 第8節「整份重新查核」；結果及原診斷更正記於 `rca-report.md` 第22節。兩個Skill未修改，B1 To-Be原文保留，W1～W10均待施工。

主要影響：新對話的確認可能回到錯誤起點；明確題材可能略過原有讀者研究；作者只採部分修改後的檢查仍指舊版本；等待進度、角色證據與成套紀錄的交接需補齊。其餘為作者清單承接、抽取順序、約束分配、樣板與測試細節。建議一次修訂B1文件，保留兩入口、收穫累積、按價值成文、三用途與作者決定權。索引樣板建議獨立為第11組，成果位置不變。

原三處READ間隔有規則依據，但原W1首次使用定位漏讀「每個WRITE後登記progress」的共同要求。只搬三處的修法不完整。當時停止寫入符合使用者授權邊界；完整查核仍可繼續，先前只等待三處核准的接續安排已更正。未測得載入先後對文章品質的影響。

工具實查：Pi CLI有新程序與控制自動載入參數，openai憑證檢查ready；Docker daemon可回應；sandbox-exec單一路徑成對拒讀探針通過。完整獨立模型執行及兩站隔離仍待smoke test。同步check通過，目標skills／指引／scripts的git diff為0。S1～S9未實跑。

此次沒有新增需重新訪談的成果取捨。下一個必要授權只限把整批修正寫回B1文件；可一次核准，避免逐項詢問。此次先不施工目標Skill，原B1與先前施工授權保留，接續依使用者最新指示。已更新三份既有紀錄並寫後讀回核對。新對話讀本文、課程blueprint第8節及rca-report第22節後接續，歷史段落的三處核准等待均已被取代。

保留全部既有未提交內容。不安裝、不移植、不施工Steve、不commit或push。唯一長期入口維持本文。溝通規則來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪狀態：已授權施工，前置核對發現載入順序差異，已停止

使用者已明確要求依 B1 進入 Phase 5，修改課程兩個 Skill，完成專案內同步與驗收。B1 核准及既有需求直接沿用。此次前置核對發現 B1 三處樣板載入位置違反課程 skill-form-sop 的按需載入 Rule 1，依使用者「超出藍圖的必要變更先說明差異再停下」及施工委派 Rule 5 停止。

具體差異：workflow 入口與 writing 入口提前載入 progress 樣板；writing 研究階段提前載入 directions 樣板，中間穿插判斷、寫入或研究委派。規則要求樣板載入緊接首次使用，中間僅可有其他參考檔 READ。例如方向樣板應在研究結果完成後、產生方向之前讀取。建議只搬動三處樣板載入，調整受影響的編號、返回點及計數；研究、產出與作者關卡均保留。局部修正尚未核准，B1 To-Be 原文未改。

差異表保存於課程既有工程目錄 `blueprint.md` 第 8 節，施工授權與停止紀錄保存於 `rca-report.md` 第 21 節。W1～W10 皆待施工，兩個 Skill 尚未修改。下一步只核准上述局部載入順序調整，再接續原施工；無須重問 B1 整體設計或診斷。

本次完整讀取暫存交接、本文、課程 AGENTS、blueprint、rca-report、replay 及當前工程規則。兩 repo git status 已查，既有變更保留。課程兩側 skills、AGENTS／CLAUDE 的 diff 無差異；未執行同步、施工後結構診斷或 S1～S9。工具介面無隔離子代理；已查到 pi CLI 存在，其隔離執行能力尚待查核。未安裝到其他專案、移植、施工 Steve、commit 或 push。只更新三份既有紀錄並讀回核對。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪狀態：Phase 4 已完成，B1 已核准，停在 Phase 5 施工前

使用者本次明確核准 `blueprint.md` B1：兩入口分工、收穫累積、成文與章級整合判斷、讀者提示詞、三用途檢查、成套交付，以及第 3.1 節列出的內容替換。核准已記入藍圖開頭確認紀錄與既有 `rca-report.md` 第 20 節。E1～E22、R1～R6、S1～S9 及 S7 兩站分支沿用。

本次只記錄 Phase 4 核准，依使用者要求停在 Phase 5 施工前。W1～W10 全部維持待施工，後續收到施工指示才接續，無須重問 B1 核准。例如「先保存每節收穫，再判斷是否成文」已成為核准設計；Skill 檔案本次維持原狀。

本次只更新藍圖確認紀錄、既有工程報告及本唯一長期交接，寫後重新讀取修改段落核對。兩 repo 起始 git status 已查，既有變更保留。未修改 Skill、流程 docs 或文章，未安裝或移植、施工 Steve、commit 或 push。未執行驗收測試。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

下方各輪狀態保留歷史。新對話依本段、第 6 節與第 9 節接續。

### 前輪狀態：Phase 3 已完成，B1 藍圖等待 Phase 4 核准

使用者已明確核准以課程 rca-report.md 第18節收斂的根因範圍及既有驗收條件作為設計依據。本輪已先將核准寫入工程報告及本入口，再完成 `blueprint.md` B1。現在停在Phase4；所有施工工作項待施工。下方Phase2等待安排均為歷史，接續以本段及第9節為準。

藍圖：`/Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/blueprint.md`。核准與結果存於同目錄 `rca-report.md` 第19節。既有E1～E22、R1～R6、S1～S9及S7兩站分支沿用。

推薦設計：保留兩入口，由workflow管理收穫累積、成文判斷、全文、社群及回顧，並委派writing做選題與大綱。每節收穫及跨節索引與文章分開保存。章級整合需新增關係或判斷價值。讀者提示詞接續文章同一任務，三用途各列檢查結果。兩個Skill目錄同版本成套交付，必要規則與樣板隨附；來源、版本hash、授權依據與轉交站保留。原docs及既有文章留原檔，停止以宿主docs作執行依賴。

具體例子（假設）：第二節補充復原驗證限制時，索引連回第一節備份收穫並保留修正來源；第三節只重述時可暫存，不強制增加文章。此次只有設計例，未示範文章。

需使用者核准的實質差異集中在藍圖第2.1節與第3.1節：共用規劃與成套交付、收穫先保存、按增值成文，以及將固定收穫上限、固定篇數、固定操作段落改為成果導向判斷。作者確認、來源、版本、社群與回顧均保留。使用者可核准B1或指出需改設計；不重問診斷。

本輪完整讀取指定暫存交接、本文、rca-report、replay、課程AGENTS與工程規則／樣板；重讀兩入口及writing全部部位、存檔表與寫作docs執行段。文件編號、計數及10項待施工狀態已檢查；設計為9個Phase、78個明列步驟、7份RuleFile、36條Rule、10組樣板、0腳本。步驟增量包含原先藏在docs的流程展開，各次只走適用分支。藍圖與修改段落寫後重讀核對。

本輪只新增藍圖、更新既有工程報告及本唯一長期交接。兩repo起始git status已查，既有變更保留。未修改Skill、流程docs或文章，未追加授權研究、選SEO題目、安裝／移植、施工Steve、commit或push。S1～S9與兩站隔離測試尚未執行；先前結構、同步與Hook測試為先前回報，尚未重驗。溝通指引來源：`/Users/steve/.pi/agent/AGENTS.md`。

本文件是 Steve 個人小幫手計畫的唯一持續更新交接入口。沿用既有檔名，不另開平行版本。使用者已要求清除過時安排；本版取代「先設計 Steve」「另找真實案例」及「整合方式以後再決定」等舊建議。

**最新計畫：先改善可獨立安裝的課程文章 Skill → 安裝到 AI × BDD 的 personal 試作分支 → 整合 Steve → 穩定後再移植到未來的 home repo。**

課程Skill的Phase1～4及原施工授權保留。最新已完成B1.1整批文件修訂與一致性核對，結果見blueprint第8節最新段及rca-report第23節；此次未施工，接續以上方最新狀態為準。E1～E22、S1～S9、R1～R6及各次確認範圍保留。

新對話可繼續在目前 AI × BDD 工作目錄開啟，透過完整路徑處理課程專案。不要再要求使用者搬資料、切換 repo 或重講需求。

### 前輪接續：Phase 2 查核已收斂，等待設計依據核准

本輪完整讀取暫存交接及必讀入口，核對工程報告第 9～17 節的使用者回覆。確認範圍整理、R1 跨節／章級與 R5 用途別檢查的局部靜態演練、替代解釋與反事實，已存於既有 rca-report.md 第 18 節。前兩項、讀者提示詞、R6 及第 14～16 節的局部確認原樣沿用。E1～E22、S1～S9 及 S7 兩站分支保留。

本輪重讀 workflow SOP、完整存檔表及完整執行提示詞（docs/用備課角度寫文章.md 第 1～450 行）。既有流程已有各節卡、系列依賴排序、來源與教學檢查；剩餘缺口為跨節新增／修正的比較、章級無新增價值時的出口，以及三用途各自的檢查結果。這些均已在既有需求與驗收情境內。writing 獨立入口內容診斷及既有測試為先前回報，尚未重驗。

收斂判斷：目前資料足以提出設計，沒有需要新增診斷題的需求差異。剩下的兩入口分工、收穫保存方式、章級評估時機、提示詞交付方式、用途檢查位置與套件／版本／安裝機制，留 Phase 3 設計。例子（假設）：第二節補充第一節方法的限制，要能指出修正了哪項舊收穫；整合只有重述時可暫不成文。需求已保存，檔案與步驟如何安排尚未定案。

目前維持 Phase 2 步驟 8。唯一必要回覆為：是否同意以工程報告第 18 節收斂的根因範圍與既有驗收條件作為設計依據，授權產出 Phase 3 工程藍圖供審核。使用者尚未回覆核准；不將既有局部認同擴大。藍圖另經 Phase 4 核准後才施工。第 17 節授權等待已撤回，不追加研究，也不再逐項重問既有需求。

本輪只修改既有工程報告及本唯一長期交接，寫後重讀核對。兩 repo 起始 git status 已查，保留全部既有變更。未修改 Skill、流程文件或文章，未進藍圖、選 SEO 題目、示範寫作、安裝、移植、施工 Steve、commit 或 push。S1～S9 尚未實跑。新對話完整讀本入口與工程報告，優先依第 18 節及下方第 9 節接續。溝通規則來源：`/Users/steve/.pi/agent/AGENTS.md`。

### 前輪接續：撤回偏離的授權確認，回到 Skill 的 Phase 2

使用者已明確糾正：提供貼文是規劃參考，目標是消化課程、結合搜尋意圖，建立自己的有用文章、步驟與提示詞。助理自行假設整份參考文件會公開轉交，將授權查核推成目前確認關卡，造成偏離。課程 rca-report.md 開頭及第 17 節已記錄糾正；撤回該節授權局部確認的等待安排，查核保留歷史。E16 原有交付要求保留，實際檔案範圍留後續設計。

助理隨後自行讀 Intro 並在對話示範選題、文章段落，使用者再次指出建立 Skill 的流程尚未完成。該示範未寫入文章檔案，停止接續。現在由助理核對既有報告第 9～16 節的確認範圍與剩餘診斷，完成必要局部查核後只展示一個影響 Skill 改善的新差異。使用者只需判斷這個新差異，無須重述完整需求或重核已認同問題。

維持 Phase 2；未核准整份根因報告，未進工程藍圖。未修改 Skill、流程文件或文章，未安裝、移植、施工 Steve、commit 或 push。本次只更新既有工程報告與本入口並重讀核對。下方授權等待與接續安排為歷史，依本段及第 9 節新提示詞執行。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪紀錄：已查公開來源，個人重製與公開轉交須分開處理

2026-11-21 已接續課程 rca-report.md 第 17 節完成公開使用條件蒐證。主文以 Defuddle 讀取成功；接續貼文改用瀏覽器讀取成功。已讀正文與個人頁回傳範圍未列站外重製／再散布許可。主文瀏覽器出現登入介面，未登入；本地貼文 3 與作者留言缺獨立網址，這兩項及另行許可仍待補。詳細網址、方法、條款位置與受阻結果均存於既有報告第 17 節末「公開來源查核」。

已讀 Threads 與 Instagram 官方條款的內容授權段。授權主體為 Meta，並有指定服務及互通分享機制；一般 Git repo 的整包轉交仍需對應使用依據。臺灣著作權法第 51、52、64、65 條提供個人非營利重製與合理引用的條件；第 10-1 條區分表達與方法。此為以臺灣法為前提的條件式分析，個案合理範圍仍待評估。

具體影響（假設）：在自己的非公開目錄間帶到 AI × BDD、再帶往下一章，依個人非營利重製條件評估。若任一站公開 GitHub，三則貼文及留言全文可供他人取得，該次公開交付需另外補足許可或合理引用／使用的依據。必要流程能力與檔尾逐字內容仍分別盤點；尚未決定拆檔、刪除、改寫、套件邊界或許可方案。

剩餘事項已核對報告並集中於第 17 節末表格：此次授權診斷待局部確認；另行許可與兩則來源待補；Notion 改寫及其他依賴的授權待盤點；跨節／章級與用途別檢查仍有未展示差異；搜尋研究輸入留實際研究前取得；兩入口及套件機制留設計關卡；S1～S9 與 S7 兩站仍待實跑。前兩項、讀者提示詞、R6 及第 14～16 節確認全部沿用。

目前完成 Phase 2 步驟 7 的補充蒐證，停在步驟 8。下一個使用者回覆只限此次新差異：「整份流程文件對外轉交時，逐字貼文的使用依據仍需補足」。不重問版本困擾、授權需求或整批移植意願。局部確認後，由助理從跨節／章級或用途別檢查挑一個實質差異接續，維持 Phase 2。

本輪只修改課程既有 rca-report.md 與本文，寫後重新讀取核對。兩 repo git status 已查，既有變更保留。公開擷取暫存於 /tmp/course-license-check/；長期結果只維護本入口與既有工程報告，不依賴暫存檔。未修改 Skill、流程文件或文章，未安裝、移植、同步、進藍圖、施工 Steve、commit 或 push，未聯絡作者。既有測試為先前回報，尚未重驗。新對話完整讀本文及報告，接續第 17 節末。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：必要流程文件的第三方逐字內容，缺隨附授權條件

本輪完整讀取本文及課程 rca-report.md，沿用既有局部確認與第 16 節涵蓋核對。從 R4 選取授權紀錄單項查核，結果存於報告第 17 節。E15／E16 與 S7 兩站分支原樣保留。

已完整讀取 workflow SOP、兩份流程 docs 及本次根因分析所需規則與樣板。`docs/用備課角度寫文章.md` 第 548～593 行保存水球三則逐字貼文與作者回覆，已有作者及來源網址。同檔第 20、454 行明列背景資料執行時不用看。課程 repo 排除 .git 的授權類檔名搜尋，以及 AGENTS／CLAUDE、docs、兩目標 Skill、scripts 的授權文字搜尋均無結果。此次確認本地紀錄缺口；外部 Threads、Notion、作者另行許可及平台條款尚未查核。

具體影響（假設）：若為帶齊流程而整檔複製，提示詞與檔尾逐字貼文會一起移植。接收者可查作者與網址，重製／再散布條件仍需另查。此項納入 R4／E16 授權面向；未決定拆檔、刪除、改寫或套件邊界。

本輪完成 Phase 2 步驟 7 的單項展示，停在步驟 8；本項尚未取得使用者局部確認。下一個蒐證動作可查上述逐字貼文的公開來源使用條件，保存依據或受阻結果，不重問版本困擾、授權需求或整批移植意願。既有確認均保留。

只更新課程既有 rca-report.md 與本文，寫後重讀。兩 repo git status 已查，既有變更保留。未修改 Skill、流程 docs、文章或全域指引，未進藍圖、安裝、同步、實跑、施工 Steve、commit 或 push。S7 尚未執行；既有測試為先前回報，尚未重驗。新對話完整讀本文及報告，接續第 17 節；溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：集中後整批移植的涵蓋核對已完成

本輪完整讀取暫存交接、本文、課程 rca-report.md 與 replay.md，依目標專案 skill-engineering 的當前規則核對。結果：既有 E15／E16 已涵蓋完整能力、必要依賴、指定輸出位置、來源版本、檔案範圍、授權及來源驗證後更新，原文直接沿用。缺漏為 S7 原本只測一次乾淨安裝，尚未測經 AI × BDD 集中副本再次整批移植。

已在既有報告第 2 節補入 S7 兩站分支，第 16 節保存涵蓋對照及結論。第一站模擬目前 AI × BDD，集中課程能力與現有 Skills（含工程家族）；第二站從第一站整批取得副本。第二站禁止讀取原課程 repo 及第一站，仍須能執行課程流程，並保有課程來源版本、必要依賴與授權。整批 Skills 清單另作本次個案核對，其他 Skills 的功能回歸留待後續移植工作。

具體例子（假設）：下一章只帶走集中後的副本、另提供素材與工具，就能把課程成果寫到指定目錄，並查出這份課程能力的原來源版本。這次補入的情境會檢查中間轉交有沒有漏掉文件或版本紀錄。

本輪只更新既有工程報告及本文，寫入後重新讀取核對。E1～E22、R1～R6 編號及既有確認均保留。未修改 Skill、建立藍圖、安裝、同步、實跑、commit 或 push。S7 補充分支尚未執行；先前實作診斷與測試為先前回報，尚未重驗。兩 repo git status 已查，既有變更保留。

目前完成本次涵蓋核對，回到 Phase 2 步驟 8。下一項可接續 R4 尚未處理的授權與完整套件範圍查核，一次只處理一項；套件邊界與工具選擇留在後續設計關卡。新對話先讀本文及報告第 16 節「涵蓋核對結果」，直接沿用本輪結果，不重做相同確認。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：版本追蹤困擾已確認，Skills 先集中再整批延續

使用者確認版本追蹤問題會造成困擾，並補充預計做法：課程 Skills 完成後，在目前 AI × BDD 專案保有完整副本，與現有 Skills（含 skill-engineering 系列）集中；下一章開新目錄時，以當前所有 Skills 為基礎整批延續。使用者估計五章各約四週，各章可能因教學目的使用不同目錄。此為預計安排，尚未執行。

本次已把局部問題確認與使用情境寫入課程 rca-report.md 第 16 節。既有安排仍為課程專案開發維護、驗證後複製完整能力到 AI × BDD。後續章節專案與未來 home repo 分別記錄；同步工具、方向與更新衝突尚未設計。

使用者詢問這是否算回覆及下一步要做什麼。本次先釐清：回覆已成立，需求不再重問。下一步由助理核對既有可移植要求是否涵蓋「集中後再整批帶到下一章」，只補缺漏。一般跨專案同步另留後續工作，目前不施工同步系統或工程家族。本輪暫停展示新問題，尚未執行該涵蓋檢查。

只更新既有工程報告及本文，未修改 Skill、建立藍圖、安裝、同步、commit 或 push。先前靜態查核與測試狀態尚未重驗。新對話讀本文及報告第 16 節最新回覆接續。溝通事件詳見該節；溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：固定輸出位置已確認，展示安裝副本來源版本

使用者本次明確回覆：「我認同這項局部診斷：目前課程 Skill 把成果位置固定在 articles，尚未承接我指定的輸出位置。」已記入課程 rca-report.md 最新狀態與第 15 節。確認限 R4 的指定輸出位置缺口；前兩項、R6、讀者提示詞用途銜接及第 14 節必要流程文件確認均沿用。

完整讀取既有工程報告與 replay.md 後，本次從 R4／E16 選取下一項：安裝副本缺少來源版本紀錄。詳細查核、局部演練、替代解釋及反事實存於報告第 16 節。本次重讀兩個課程 SOP、AGENTS.md 與 sync-skills.sh，列出目標 Skill 檔案並搜尋管理文件。現有 progress 追蹤文章版本；同步腳本複製同 repo 的兩個 agent 目錄，未保存跨專案副本的來源版本。

具體例子（假設）：課程能力先裝到 AI × BDD，之後來源專案修正讀者提示詞。副本未帶來源版本紀錄時，需另比對檔案或查安裝歷史，才能知道 AI × BDD 是否包含該修正。此為靜態診斷；未執行安裝或更新，使用者全域安裝工具本次未查。若外部工具已交付可讀的來源版本紀錄，此局部缺口可由該工具補足。

當時只展示第 16 節這一項並等待回覆。最新已取得局部問題確認與整批延續的情境補充，見上方最新接續。授權與完整套件範圍仍待後續，不修改 Skill，不進藍圖。

本次只更新既有工程報告與本文。已查兩 repo git status，保留既有變更。首輪搜尋因根目錄 README.md 不存在退出 2，移除該路徑後已對存在範圍重跑成功。未安裝、未實跑或重跑同步測試，未 commit 或 push。既有測試為先前回報，尚未重驗。新對話先完整讀本文與課程報告，從第 15、16 節接續。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前輪接續：必要文件缺口已確認，展示固定輸出位置

使用者已明確認同：「只複製目前的課程 Skill 資料夾，會漏掉執行必需的流程文件。」原話與窄範圍確認已寫入課程 rca-report.md 第 14 節。前兩項、R6 及第 11 節讀者提示詞局部確認直接沿用。

本次完整讀取指定暫存交接、本文、rca-report.md、replay.md，依既有 R4 與演練紀錄選取固定輸出位置為下一項。完整重讀兩個課程 SOP 與工作流程存檔表後，確認 workflow 首次存檔固定為 articles/<slug>/workflow/，writing 各步固定為 articles/<slug>/。目前已讀的路徑要求未提供指定輸出根目錄的分支。

具體例子（假設）：作者指定 notes/course-demo/，按 SOP 的位置要求，source、大綱與 progress 仍指向 articles。即使必要流程文件已帶齊，執行者仍須自行處理兩種位置要求。這是規則靜態對照；執行者可能遵循作者指定位置，實際行為待 S7。詳細來源、演練、替代解釋與反事實存於報告第 15 節。

當時只展示這一項並等待回覆；本次已取得指定輸出位置的局部確認，見上方最新接續及報告第 15 節。來源版本追溯已接續至第 16 節；授權清單維持待處理。完整 R4 及其他議題依各自原核准狀態處理。

本次只更新既有工程報告與本文，寫入後重新讀取核對。未修改 Skill、流程 docs、文章或全域指引，未建立藍圖，未執行安裝或 Skill 實跑，未 commit 或 push。兩 repo git status 已查並保留既有變更；先前測試為先前回報，尚未重驗。新對話先讀本文與課程報告第 14、15 節。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 前項查核：Skill 目錄未包含必讀流程文件

已完整讀取指定暫存交接、本文、課程 rca-report.md 與 replay.md。沿用前兩項、R6 與提示詞用途銜接的局部確認，選取原 R4 尚未單項展示的必要文件問題。最新詳細紀錄在課程 rca-report.md 第 14 節。

本次重讀兩個課程 SOP、工作流程存檔表及工程所需規則與樣板。列檔確認 workflow 目錄只有 SKILL.md；其 P1-1 要求從專案根目錄讀取 docs/備課寫作工作流程.md，P2-1 再讀 docs/用備課角度寫文章.md。推論：只將目前 Skill 目錄複製到新專案時，第一步即缺所需文件。既有可獨立安裝需求直接沿用；本次未執行乾淨安裝，未決定套件邊界或安裝方法。

本項局部診斷已取得使用者明確確認，見上方最新接續及報告第 14 節末尾。完整 R4、其他根因及施工仍保留原核准狀態。可移植需求直接沿用。下方歷史段落的提示詞待補問題已由第 11 節最新查核接續完成。

本次只更新既有工程報告與本文，重新讀取核對；未修改 Skills、流程 docs、文章或全域指引，未 commit 或 push。兩 repo git status 已查，既有變更保留。此狀態存於專案紀錄，新對話先讀本文與課程報告第 14 節。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 最新讀者提示詞確認：文章與提示詞接續同一任務

使用者指出助理例子從「挑選適合 AI agent 的工作」跳到已選定工作的處理方式。助理改以「教判斷方法 → 列出工作 → 用提示詞比較 → 核對理由」說明後，使用者回覆「大概是這個樣子啦」，並詢問是否需要調整 Skill。此為用途銜接的局部認同，已存於課程 rca-report.md 第 11 節最新補充。

最新查核完成：完整讀取兩個目標 SOP、workflow 兩份 docs、writing 4 份規則及 outline／outline-review 兩組雙檔樣板。一般目標、練習對應、前提與跳步檢查已存在。writing 的檢查範例甚至指出「未安排寫測試卻要求執行」的缺口。此次助理解說的用途跳轉可依既有要求指出。

剩餘缺口：讀者提示詞尚非適用步驟的必要交付；其輸入、任務、預期輸出與核對方法尚未要求逐一對回文章成果。納入既有 R3，不另增一般一致性根因。局部演練、替代解釋與反事實存於 rca-report.md 第 11 節「本次局部查核」。本輪未實跑 Skill 或讀者測試；writing idea／directions 樣板與其他 Skill 呼叫者未重驗。

前兩項、R6 與用途銜接的局部認同沿用。只更新工程報告及本文，維持 Phase 2，未修改 Skill、流程 docs、文章或全域指引，未建立藍圖，未 commit 或 push。後續接續其他尚未處理的局部議題，不再要求使用者盤點同一提示詞用法。下文等待補充或等待本次查核的描述為先前狀態，以本段為準。

### 最新補充：先降低確認成本，不直接進藍圖

使用者表示無法完整審核大量驗收條件、根因、演練表與交叉引用；估計審核成本可能比自己撰寫高 5～10 倍。這是使用者的負擔回報，尚非實際量測。使用者希望保留判斷權，不接受把全部思考交給 AI。

先前助理提供的「我確認 E1～E18 與 R1～R5，進入 Phase 3」提示詞**尚未被使用者採用，現在不要請使用者直接執行**。使用者說「好」並詢問下一步，不等於核准全部根因或任何 Skill 修改。

最新狀態：搜尋選題局部根因分析已完成，存入課程 rca-report.md 第 5 節 R6、第 13 節及 replay.md 第 4 節。第 2 節 E19～E22、S8～S9 及第 12 節需求證據沿用。R6 已取得局部確認，下一步回到讀者提示詞尚未說明的差異，未進藍圖。第三項討論引出搜尋導向選題需求。使用者已大致認同從課程探索搜尋意圖、查搜尋量、評估競爭後推薦題目的方向；目前優先選擇需求值得投入、競爭符合現有能力的題目。讀者提示詞部分僅初步回覆「七成方向對」。仍在需求澄清，未進入工程藍圖。最新結果見下方「第三項最新展示」及課程工程紀錄 `rca-report.md` 第 11 節；歷史段落中的第二項接續指示以本段為準。第一項核心共識已保存，直接沿用。第二項「有練習，但解說可能不足」已完成局部試改及使用者閱讀確認。使用者針對展示的解說與練習回覆：「這次感覺清楚了，比之前清楚很多」。直接沿用這項確認，後續保留先講原因、再追蹤流程、最後換條件問理由的做法。來源、授權與回饋存於課程工程紀錄 `rca-report.md` 第 10 節。前兩項確認直接沿用，目前只處理第三項。不要先寫候選全文或工程藍圖，不要求使用者讀完工程報告才回答。

助理提出的協作建議：使用者掌握目的、取捨與可觀察結果；助理負責文件一致性、來源追蹤、內部規則核對與測試證據。完整工程紀錄供追查，不當作必讀作業。保留根因與藍圖關卡，改進展示方式，不默默跳過或宣稱已通過。

本次已依此方式重新核對 Intro 逐字稿、相關產物與 0A／0B／大綱規則，將第一項展示存入既有 `rca-report.md` 第 9 節。具體落差：現有修訂大綱教追出何時回傳答案，卻未保存「模型自認完成不等於符合人的要求」的判斷收穫；scope 曾提到成功條件與誤判，不能說完全沒提。流程比較明確延後，護欄僅留後續主題。實際意圖卡只有兩個目標，未達三個上限，不能把漏收直接歸因於名額用完。source 已選搜尋迴圈、讀者卡記錄作者同意方向，歷史首次限縮原因仍未知。

**第一項核心問題描述已獲使用者認同；細項與整份報告尚未核准。** 使用者表示先前展示太長，看不出問題。助理改以「流程把整理這節課的收穫與挑選這篇文章的內容混在一起做；文章要聚焦，連帶讓課程收穫也被縮小」說明。使用者核對是否指備課寫文步驟太早選主題、可能忽略重點後，回覆：「OK，差不多有這種感覺，對，蠻符合我心中所想的」。此回覆已存入 `rca-report.md` 第 9 節，只記為認同核心問題與局部診斷方向，不擴張為 E2／E3 細項、完整 R1 或整份報告已核准，也不證明歷史規則因果。

使用者之後再次回報看不懂「完成標準」的說明，並質疑未來文章的可理解性。使用者指出反覆確認耗費時間、金錢與注意力。本次助理判讀：已認同的問題又被換成驗收／Phase 等流程語言要求確認，增加負擔；不能只歸因於缺少回報格式，因為專案原本已提供該格式。

先前曾暫停課程確認流程以處理溝通問題。本次使用者已要求回到課程 Skill 檢查。Pi 全域指引 `~/.pi/agent/AGENTS.md` 已載入本次對話，解說效果待使用者回饋。此檔是本機全域設定。

### 第三項最新展示：讀者看懂做法，操作時仍得自己補寫指令

本次已完整讀取短期交接、本文、課程專案規則及 skill-engineering SOP／根因規則、既有 rca-report/replay，以及 workflow SOP 和兩份流程 docs（含本地上游貼文）。結果追加於既有 `rca-report.md` 第 11 節。未重新分析 writing 獨立入口或 Intro 產物。

查核結果：現行 docs 提供作者用來設計大綱、寫稿、試讀的提示詞，也要求檢查第一步所需資訊。文章內給讀者使用的輸入、可複製指令、執行方式、預期結果與核對方法，尚未列成完整要求。

展示採用自製假設情境：文章教讀者用 AI 整理會議待辦。資料寫「小林整理登入頁錯誤；客服範本負責人下次再決定」，兩項均無期限。讀者即使得到步驟與表格範例，仍需知道怎麼下指令、缺值怎麼呈現，以及逐句核對負責人與期限。若 AI 替客服範本填了小林，或填入週五，讀者需能抓出原文未提供的欄位。例子沿用既有 S3 的方向，未冒充課程內容、既有文章或實測結果。概念文章按學習目的判斷適用性，保留不加提示詞的選擇。

局部診斷為 R3 的 workflow 要求缺失。一般可操作性檢查及寫稿時可能補齊，均保存為反向證據與替代解釋。外部網址未重抓；本次依本地內容查核。

### 最新確認：找有需求、目前也有能力競爭的搜尋題目

使用者由上述例子的互動過程提出搜尋導向選題需求。已大致認同：課程內容 → 關鍵字探索與 Google SERP → 搜尋意圖、搜尋量及趨勢 → 課程適配與競爭評估 → 推薦值得先寫的題目。助理負責查證與排序，作者決定採用與投入。第五步重點為搜尋價值與 SEO 曝光機會。

使用者補充：「搜尋量太少的沒有什麼價值，搜尋量太大的我目前也沒有什麼進攻的本錢」。現階段優先找需求值得投入、競爭符合現有能力、課程又有內容支持的題目。搜尋量與競爭程度分別查核後共同排序。尚未設定固定搜尋量上下限、目標市場或競爭能力指標；尚未實際搜尋或取得數據。

原話、提案及確認範圍已追加至課程 `rca-report.md` 第 11 節末尾。前兩項確認沿用；讀者提示詞議題保留為部分認同。新增需求涉及搜尋曝光與選題，本輪已依 Phase 2 步驟 8 完成 Phase 1 相關需求與證據更新。課程工程紀錄新增 E19～E21 的搜尋證據、量與競爭分查、排序要求，以及 E22 的作者現階段個案取捨；新增 S8 真實課程研究與 S9 自製資料／受阻分支情境，尚未執行。本輪重讀 docs 1A～1D：既有流程可取得真實發文與課程適配，還缺搜尋量、自然排名競爭與作者資源共同支持的題目排序。需求觀察在第 12 節；最新局部分析在第 13 節，摘要如下。不重問已認同方向，不進藍圖，不修改 Skill 或施工 Steve。此為專案需求紀錄，新對話先讀本文及第 13 節。

### 最新分析：選題研究尚缺四項資料的共同比較

本次完整讀取短期交接、本文、課程規則、skill-engineering SOP／根因規則／驗收規則／報告樣板、既有報告與演練。完整重讀 workflow SOP 和兩份 docs，並獨立追查 writing SOP、4 份規則及 4 組雙檔樣板。更新既有 replay.md、rca-report.md 與本文。

已查核的規則事實：

- workflow 0B 在研究以前已挑行動與篇序。1A 計畫、1B／1C 搜尋與 1D 推薦，主要用真實發文驗證讀者及其卡點。
- 現有流程保留來源、原話、詞彙、素材能／不能幫忙的理由與作者關卡。這些能力繼續保留。
- 搜尋量缺工具、估計值與市場期間要求。競爭缺一般 Google SERP 的排名頁面、內容涵蓋及可補足處。
- 作者定位與晚間約 90 分鐘的排程已存在於 docs；仍缺當前適用性、網站狀態及各題待補工作與可投入資源的比較。
- 課程適配已有基礎，尚缺逐候選搜尋問題的課程部位、可回答範圍與待補內容對照。
- writing 為獨立入口。明確題材在 P1-2 可直接進大綱，模糊想法才做選題。兩分支均缺搜尋比較要求，workflow 沒有委派 writing。

診斷推論：新增 R6「搜尋導向選題所需的證據與比較要求缺失」。workflow 最早順序偏離在 0B，與既有 R1 相交；研究要求缺口從 1A 延續到 1D。即使把篇序暫定，後面仍缺搜尋資料。R6 與 R5 分列：R5 檢查文章用途，R6 檢查選哪題的依據。只增加末端檢查會在選題之後才發現資料缺漏。

替代解釋已記錄：完整要求漏載入、只有篇序過早、只有工具／輸入不足、一般紅隊已涵蓋、Google／Search Console／回顧已涵蓋、作者自行判斷、執行者可能自行補齊。保留實際工具／資料缺口與個別執行者補充的可能；局部靜態診斷仍支持 R6。反事實同時追查兩入口及缺資料分支。

本次未查 Google、搜尋量或網站，未執行 S8／S9，未重讀 Intro 素材或文章。實際題目排序留待研究資料。先前結構診斷、同步測試與 Hook 測試為先前回報，尚未重驗。本次查核兩個 repo 的 git status，既有文章試改及其他工作區變更保留。未修改 Skill、流程 docs、文章或全域指引，未建立藍圖，未 commit 或 push。

最新確認：使用者明確認同「現行研究能找到讀者困擾，但缺少搜尋量、排名內容、作者資源與逐題課程支持的共同比較」，並要求記為 R6 局部確認。已寫入課程 rca-report.md 第 5 節與第 13.6 節。前兩項確認沿用；搜尋方向直接沿用。其他議題與工程授權維持各自狀態。

讀者提示詞接續：本輪完整讀取指定暫存交接、本文及 rca-report.md（含第 9～11 節），並載入目標專案 skill-engineering 與當前規則、樣板。第 11 節保存「七成方向對」，其後轉入搜尋需求，尚未列出其餘差異。已在該節記錄單一接續問題：搜尋選題補入後，文章內讀者提示詞是否仍有最在意、尚未涵蓋的用法？若原先保留主要就是搜尋選題，可直接說明。既有 E9、E10 的輸入、指令、執行、預期結果與核對需求沿用，不再逐項重問。等待實際回覆，R3 維持部分認同。

本輪只修改既有報告與本文，未重做搜尋診斷或實跑驗收。先前規則診斷與測試為先前回報，尚未重驗。維持 Phase 2 步驟 8；未修改 Skill、流程 docs、文章或全域指引，未建立藍圖，未 commit 或 push。溝通規則來源：/Users/steve/.pi/agent/AGENTS.md。

### 最新優先事項：已安裝全域回覆規則 Hook

使用者回報溝通改善只存於專案紀錄仍無效，要求直接更新 Pi 全域指引，再明確授權安裝每次生效的 Extension hook。

已更新 `/Users/steve/.pi/agent/AGENTS.md`，加入每次處理問題及送出前的執行檢查。已安裝 `/Users/steve/.pi/agent/extensions/response-guidelines/index.ts`，以 `context_with_system` 在每次模型請求前讀取最新全域指引，加入 system section，包含工具後續請求。檔案讀取失敗時呼叫 abort。狀態列與 `/response-guidelines-status` 可查看注入次數；session 記錄規則雜湊。

5 項本機測試通過；Pi 1.6.0 真實 loader 的全域自動發現與 hook 註冊測試通過。目前互動 session 已驗證啟用：session 先後記錄 request 1 與 request 2，包含使用者訊息後及工具執行後的請求，兩次 SHA-256 均與全域 AGENTS.md 一致。本次接續亦已收到 Hook 注入的 `global_response_guidelines` 全文。回覆品質持續依實際內容檢查。本版自動注入規則並要求內部自查，未加入額外審稿模型或輸出攔截。說明與測試存於 extension 目錄。下文「全域指引尚未另加規則」為先前階段紀錄，以本段最新狀態為準。

使用者已要求回到課程工作。本次重新讀取並展示已授權的 Intro 第二段試改，讓使用者直接閱讀解說與新題。使用者已確認這段展示清楚許多，局部閱讀確認完成。既有問題與局部試改授權直接沿用。後續接續尚未處理的課程 Skill 檢查項目，仍一次展示一項；整份根因報告與 Skill 施工依原關卡處理。

### 第二項最新展示：畫得出箭頭，仍可能接不上模型呼叫的用途

本次完整讀取短期交接、目標專案 AGENTS.md、skill-engineering SOP 與根因規則、既有 rca-report/replay、Intro 逐字稿及 source／意圖卡／scope／讀者卡／修訂大綱、workflow SOP 與 `docs/用備課角度寫文章.md`。未重跑整份分析。

選取修訂大綱第 2 段：「從舊版文件畫箭頭到下一輪輸入」，重點為前一次工具結果進入下一輪。表格已有第二次模型呼叫，練習也有比較版本差異。助理的閱讀推演：讀者可能畫對箭頭，仍問「搜尋都回來了，為何還要叫模型一次？這次模型要判斷什麼？」需要銜接的解說是模型對照原問題，判斷搜尋資料是否足以回答；此例要查最新版，回來的是舊版，所以再次要求搜尋。此概念已在意圖卡與逐字稿內。

相關規則：docs 提示詞 1 的大綱欄位及提示詞 3 的段落格式都以練習與一句重點為中心。流程也已有找前提、查跳步的要求，須一併保留此事實。局部推論為固定格式可能留下練習、卻省略必要解說。大綱精簡且未進初稿，是保留的替代解釋。讀者理解尚待實際試讀。

初次展示仍讓使用者看不懂。使用者指出反覆追問消耗兩倍時間與成本。助理改述為「大綱叫讀者做題目，卻可能還沒把做題目需要的觀念教清楚」，再依要求分別提出回覆改善與文章改善提案。

使用者已明確核准：「OK 兩個都進行調整，我不想要再看到這種廢話回應、兩倍廢話回應，這樣我事情做不完了啦」。直接執行，勿再重問同一授權。

已執行兩項調整：

1. 回覆先講具體問題、影響或結果與必要建議；送出前檢查開頭能否讓使用者立刻知道正在處理什麼。來源分析由助理維護，按需提供。依已核准提案先試行行為，全域指引尚未另加規則。
2. 新增課程專案 `articles/intro-to-ai-agents/workflow/07-outline-review-explanation-trial.md`：先解說再次呼叫模型的用途，保留追蹤練習，再問「第一次已找到完整相容表時怎麼做、為什麼」。附參考答案、來源與教學設計標記。原大綱保留，`progress.md` 已登記局部試改。

試改已靜態核對教學意圖卡及逐字稿；閱讀效果待回饋。全篇仍待第 8 步作者清單。根因報告第 10 節已保存回饋、提案、核准與結果。下一次只接續試改的實際意見。整份根因報告與通用 Skill 施工維持待核准；未建立藍圖，未施工 Steve，未 commit 或 push。

本文件其餘先前執行狀態（例如結構診斷、同步結果與 Git ahead/behind）屬先前回報，尚未重驗。本次只重查兩個工作區的 `git status --short`，保留全部既有變更。

後續仍停在 Phase 2，不重問核心問題，也不把同一意思換成完成標準再問一次。需要保留的核准關卡，應只展示尚未決定且會影響結果的具體差異。不要求閱讀整份報告，不進藍圖。

目前只把這項回饋、分項展示與接續方式保存於工程紀錄及交接文件。**沒有授權修改課程 Skills 或 skill-engineering 家族。** 若之後要把降低審核成本做成通用 Skill 改善，須另行提出並取得授權，不混入本次施工。

## 2. 角色與 repo 分工（已對齊）

| 名稱 | 角色 | 所在位置與責任 |
| --- | --- | --- |
| skill-engineering | 製作與改善 Skill 的工具，不是第三個產品 | 依目標專案規則使用；兩個 repo 都有家族 Skills |
| 課程文章 Skill | 專門能力，持有備課與寫作 SOP | 在課程專案開發、改善、驗證，再安裝完整版本至 AI × BDD |
| Steve Orchestrator | 有判準的路由與交接者 | 在 AI × BDD personal 試作分支建立；不包含專門 Skill 的詳細 SOP |
| 未來 home repo | 個人 Skills、wiki、操作習慣的整合基地 | 長期計畫，現在不建立，也不一次規劃所有生活領域 |

課程專案：`/Volumes/data/Projects-practice/lesson-preparation-perspective`

目前 AI × BDD 工作目錄：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit-worktrees/personal-helper-proposal`

使用者想趁水球課程，在 personal 分支試作個人小幫手。目前已有 `personal-helper-proposal`，不自行再開新分支。

### Steve 的界線

使用者提供任務與現況 → Steve 依判準選 Skill → 交付需求、素材與完成條件 → 專門 Skill 執行 → 回傳成果與狀態 → Steve 判斷結束、退回或接續。

- Steve 決定現在走哪個方法；專門 Skill 決定方法內部如何執行。
- 可用 router／Skill Hub 比喻，但不只是搜尋名稱，還需要條件判斷與交接。
- 缺資訊時只問影響選路的問題；沒有適用能力時指出缺口，不自己偷偷承接全部工作。
- 課程文章是第一個真實工作與整合路徑，不是 Steve 的完整範圍，也不是還要另找目標的虛構案例。
- 完成眼前工作與改善下次方法分開。新知識或實際不足只有在能改變具體判準／做法時，才提出改善建議；不得自行增加規則或修改 Skill。

### 原文依據與邊界

讀 `docs/wb-secret-formula/決策樹.md` 與 `docs/wb-secret-formula/sop.jpg`。

原文明確寫：「為各流程各做一個 Skill 接著，再去打造 Orchestrator Skill 來去整合不同領域的 子 skill」，前文例子為創業 Lean canvas、產品 JTBD／Kano、工程 BDD／DDD。不是每個領域只能有一個 Skill。

「這一步做啥 → 判準 → 下一步判斷」是原文要求。截圖中細部流程是 AI 提案，底部不完整；尚未取得水球完整 `/wb` 實作，不宣稱已知其內部架構。router／Skill Hub 是本次對話的理解比喻。

## 3. 課程文章 Skill 的完整需求

### 輸入與累積

- 接受課程內容、字幕、逐字稿等長短素材；可以只提供一小節，之後逐節追加。
- 「五章、每章五節、1-1 至 1-5」只是說明輸入方式的例子，不是固定結構。
- 每份素材先判斷值得保留的收穫，不強迫每小節都寫一篇。
- 根據實際內容建議獨立成文、合併或暫存；不因 Introduction 名稱直接排除。
- 即使不發文章，也保留必要收穫與來源，供之後小節或整章使用。
- 章級成果需增加觀念關係、使用順序或整體判斷，不只是拼接小節摘要；沒有新價值時不強迫再寫一篇。

### 收穫與文章

核心問題：「看完原始素材，讀者可以得到什麼？」

- 學習成果：能解釋、判斷或完成什麼。
- 可帶走的工具：步驟、清單、提示詞、執行提示詞與結果核對方式。
- 不要求每節都有所有種類。概念內容可以透過判斷題驗收，不硬湊操作。
- 有依據地推導下一步；區分原課程內容、新增的教學設計／練習，以及尚缺資訊的部分。
- 同時幫助使用者記憶、理解與實作，也教會外部讀者；不改成二選一。
- 收穫以文章呈現，可成為部落格文章與社群貼文，長短皆可。
- 適合 AI 協助的步驟需有可直接使用的提示詞，包含輸入、執行方式、預期結果與核對方法。
- 區分並接起「產製文章的流程提示詞」與「文章內供讀者完成任務的提示詞」。
- 減少反覆貼提示詞與搬運結果，同時改善品質；單純自動跑完舊流程不算達標。

### 發表與品質

三個目的分別驗收：

1. 自用：找得到來源、能回想解說、可取用步驟與提示詞。
2. 對外教學：不看原課程也能理解必要前提，達成文章承諾的成果。
3. 搜尋曝光：先從課程探索關鍵字與 Google SERP 搜尋意圖，分別查搜尋量及自然搜尋競爭，再比對課程可回答範圍、待補內容及作者目前資源，交付有證據的選題優先順序。現階段優先需求值得投入且有能力競爭的題目，不先設任意搜尋量門檻。文章保留具體問題、相符標題與相關連結要求。

搜尋量需有來源及適用市場／期間；SERP、搜尋量與作者能力資料的缺口需列明及說明對排序的影響。目標市場、網站現況、可投入資源及搜尋量工具尚未具體設定，開始實際研究前補齊。最新已完成需求補充與局部規則診斷，尚未實際搜尋。

保留來源追溯、讀者研究、作者確認、版本、社群改寫與回顧。改善使用時機，不擅自刪除既有保護措施。未決定做付費產品。

## 4. 可移植與安裝要求（最新補充，必須納入設計）

使用者不接受 Steve 的課程路徑在使用時必須同時保有兩個開發 repo。

- 課程專案作為開發與維護來源；AI × BDD 安裝驗證過的完整 Skill 副本。
- 最新使用情境：使用者預計將做好的課程 Skills 與目前 AI × BDD Skills（含 skill-engineering 系列）集中保存。後續章節可能另開目錄，以當前全部 Skills 為基礎整批延續。跨專案同步方式留待後續工作；本輪尚未設計或執行。
- 執行必要的規則、樣板、腳本、參考文件與授權隨 Skill 安裝，不可依賴原開發 repo 的絕對路徑。
- 現有課程 Skill 讀取 `docs/` 的流程文件，需盤點並設計可移植依賴，不是只複製 SKILL.md。
- 課程字幕、購買教材、範例程式與既有文章是工作資料，不自動全部複製；執行時指定素材與輸出位置。必要工作資料可以提供，但原開發 repo 不能是隱藏依賴。
- 公開 repo 不擅自加入付費課程素材。開發與移植保留必要來源與授權。
- 記錄安裝來源、版本與檔案範圍；更新先在來源專案驗證，再同步安裝版本。避免兩邊各改一套。
- 初期不建立大型套件管理系統；未來 home repo 可再次安裝同一套能力，不搬整個 AI × BDD。

必要驗收：安裝到乾淨專案，只提供素材與輸出位置、明確列出的執行工具，即使無法存取原開發 repo 也能運作。S7 已補入本次兩站情境：先集中到 AI × BDD 的臨時副本，再連同現有全部 Skills 帶至下一章的臨時專案。第二站禁止讀取原課程 repo 及第一站，課程能力仍須運作，來源版本、必要依賴及授權須保留。對照兩站 Skills 清單核對整批攜帶範圍；其他 Skills 的功能回歸另留後續。此情境尚未實跑，未指定同步工具或衝突策略。

B1 已核准保留兩入口、兩個完整 Skill 目錄同版本成套交付，以及藍圖第 2.6 節的來源版本、hash 與更新方式。實際安裝或移植仍須另行授權；本次只記錄核准。

## 5. 已檢查的實際狀態

### 課程大綱與樣本

`materials/courses/ai-agents-fundamentals-v2/README.md` 列出 11 章。**使用者已確認這就是完整大綱，且正在上這門課。** 文件原有「43 節／可辨識 37 節」數字差異，不再當作需向使用者索取大綱的阻礙。

已讀取的真實逐字稿：
`materials/courses/ai-agents-fundamentals-v2/02-agent-basics/01-intro-to-ai-agents/transcript.md`

這是第 2 章第 1 節，不是全課第 1 章 Introduction。大綱完整不代表已讀取所有小節字幕，不能根據節名編造內容。

### 現有 Skill 與產物

- `.agents/skills/lesson-prep-writing/SKILL.md`：選題、大綱與大綱檢查，明確不寫全文。
- `.agents/skills/lesson-prep-workflow/SKILL.md`：依 docs 執行完整 12 步流程，包含定稿、社群與回顧。
- 兩個入口描述有重疊風險，但未有執行紀錄證明曾誤觸發。
- 已讀 `docs/用備課角度寫文章.md` 全文、`docs/備課寫作工作流程.md`、writing 的備課規則，以及既有文章的意圖卡、範圍、讀者卡、修訂大綱、作者清單與進度。
- 既有文章 `articles/intro-to-ai-agents/workflow/` 記載第 1–7 步完成、第 8 步待作者勾選；當時目錄未見初稿或定稿。這是文章狀態，不是 Skill 驗收完成。

初步檢查紀錄（已寫入課程專案）：
`specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/preliminary-review.md`

觀察與假設：

1. 現有一小節／單一行動、有限意圖卡等規定，可能過早壓縮內容。
2. 概念文章也使用小練習式段落，可能缺少前後解說。
3. 已讀核心流程未明列文章內 AI 提示詞的完整品質要求。
4. 既有讀者卡記載作者曾同意看懂 demo 的方向，不可逕自判定當時方向錯誤。

使用者認同改善方向，並補充逐節累積、章級整合與 SEO 目的。上述紀錄是初步檢查，不是已確認根因報告。該紀錄中「尚待確認主要不滿」不可拿來重問完整需求；以本文件新共識接續分析。

本輪已完整重讀兩個課程 Skill、writing 的全部 4 份規則與 4 組雙檔樣板、兩份 docs、Intro 的全部 10 份產物、課程大綱與 Intro 逐字稿。已完成結構診斷與逐步靜態演練。結構診斷為 0 error、1 warning（writing 重複載入證據規則）；課程 repo 同步檢查為「兩邊一致」。這些檢查不代表文章品質通過。

本輪新增工程紀錄：
- `specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/rca-report.md`：E1～E18、S1～S7、R1～R5、替代假設與確認事項。
- 同目錄 `replay.md`：逐步靜態演練，明確區分本輪讀取與未知的歷史載入。
- 同目錄 `structure-audit.json`：本輪結構診斷完整輸出。

待確認診斷：前期流程以文章為單位且先限縮收穫；概念教學被統一套成操作練習；文章內提示詞缺少交付條件；安裝交接未包含必要 repo 外部依賴；三種用途缺少分開驗收。這是相對最新需求的診斷，不是認定作者當時選擇錯誤。

尚未完成使用者根因確認、工程藍圖、外部專家來源重驗、Skill 實跑或使用者成果驗證。歷史首次限縮內容的時間沒有工具紀錄可證明。當前工具沒有隔離子代理；後續不得把主 session 演練冒充獨立實跑。

## 6. 接下來的工作與確認關卡

### 現在做：課程 Skill 改善設計與樣本

1. 讀本文件與課程專案 `AGENTS.md`，載入相關 `skill-engineering`。兩邊家族版本已發現不完全相同；遵守目標專案的同步限制，不擅自覆蓋家族 Skill。
2. 在既有 `04-lesson-prep-workflow-產出與課程文章需求落差/` 紀錄接續。設計依據核准已記入rca-report第19節。前兩項、R6、讀者提示詞及第14～16節確認沿用，不重問診斷，不追加授權研究。
3. B1及原施工授權保留；B1.1整批文件修訂已核准並完成。blueprint第2～7節為施工依據，第8節最新段及rca-report第23節保存結果。W1～W10與子項全待施工。收到下一次施工指示後進Phase5；先重讀課程版本工程家族，核對環境、依工作項施工及專案內同步，再做工具smoke test、測資／兩份候選交付紀錄準備及實跑。不重問既有需求或已記錄核准。
4. 規劃真實樣本對照：使用現有 Intro 產出收穫紀錄、成文建議；適合成文時另存完整試稿，不只展示大綱。不適合時展示累積成果與合併條件，不為展示硬寫。樣本為設計驗證，不覆寫既有成果，不宣稱 Skill 已驗收。
5. Phase5依B1.1修改、同步、實跑；本次文件修訂未執行這些動作。驗收包含單節處理、分次接續、章級整合、提示詞可用性、乾淨環境安裝。現在僅有一份已讀逐字稿，整章品質不能宣稱通過；若用測試素材需明確標示，後續再用真實素材驗證。

候選驗收條件：單節可開始；利用完整大綱定位但不虛構後續內容；收穫有來源；不強迫成文；文章可獨立閱讀且達成成果；步驟與提示詞可使用；跨次累積；章級文章有新增價值；部落格／社群各有用途；安裝後不依賴原開發 repo。

### 之後做：回到 Steve

課程 Skill 經實測與使用者確認後，安裝至 AI × BDD，再定義 Steve 第一條交接路徑與驗收情境。需要的交接資訊為用途、輸入、輸出、完成條件與受阻狀態，不把寫作 SOP 搬進 Steve。home repo 留待實際使用穩定後處理。

## 7. 工作記憶與協作規則

- 每次開始先讀本文件，涉及設計再對照來源；每次有決定或產出就更新同一份文件。
- 分清楚使用者確認、原文、助理解讀、候選設計、實作、驗收與使用者驗證。
- 不再混用「決策」與「執行 SOP」，也不把課程工作縮成只供自用的筆記。
- 不重問已提供的目標、課程大綱或新案例；只問會改變當前決定的缺口。
- 先具體展示輸入、動作、結果與誰決定，再介紹術語。不反覆堆疊抽象提案或範圍外清單。
- 目前優先課程 Skill，是後續已對齊的順序；不要沿用早期「尚未核准先做課程」的狀態。
- 本文件管整體計畫；課程 repo 的工程紀錄管診斷、藍圖與驗收。兩者分工，不各自維護相互矛盾的總計畫。

## 8. 路徑、Git 與安全事項

重要來源：

- `docs/wb-secret-formula/決策樹.md`、`sop.jpg`：Orchestrator 原始依據。
- `docs/dev/概念解說偏好.md`：解說偏好。
- 課程 repo 的 `docs/用備課角度寫文章.md`、`docs/備課寫作工作流程.md`：當前執行依據；本 repo `docs/materials/` 是使用者參考素材，不混為已安裝依賴。
- 課程 repo 的 `preliminary-review.md`：初步檢查證據與已讀檔案清單。

先前回報，尚未重驗：AI × BDD為`personal-helper-proposal`，相對origin ahead 8、behind 1。本文件與 `docs/materials/` 在更新前為未追蹤。不要自行 pull、force push、重做先前 Git 整合，或提交使用者素材。

先前回報，尚未重驗：課程repo為`main...origin/main`，HEAD為`13d0747d7f63adc8555b5e20462159a7810dd22c`。當輪新增根因報告、演練與結構診斷。本次文件修訂開始時，另有既存Intro progress修改及解說試作未追蹤檔；均保留，未處理分支分歧。

本次未修改Skill，只更新課程blueprint、rca-report及本交接。交接索引的既有修改保留，沒有commit或push。本文件目前已存本機但尚未提交；同一工作目錄的新對話可讀，跨機不能假設已同步。

## 9. 新對話提示詞

請完整讀取 docs/handoff/Steve與課程筆記-目前狀態.md，以及 /Volumes/data/Projects-practice/lesson-preparation-perspective/specs/skill-engineering/04-lesson-prep-workflow-產出與課程文章需求落差/ 的blueprint.md、rca-report.md、replay.md。B1.1整批文件修訂已完成，結果見blueprint第8節最新段及rca-report第23節；第2～7節為目前設計，舊78步查核留歷史。沿用既有需求、B1及此次修訂核准，不重新訪談或逐項確認。W1～W10與子項仍待施工；是否開始Phase5依本次使用者最新指示。若要求施工，先載入課程AGENTS及課程版本工程家族所需部位，依B1.1工作項修改課程兩Skill並專案內同步；依第7節準備工具smoke test、固定測資、候選交付紀錄，再實跑S1～S9與真正限制原來源／前站讀取的兩站測試。工具受阻如實保存。保留工程家族、文章、素材與其他未提交內容；不安裝到真實其他專案、不移植、不施工Steve、不commit或push。維護既有工程紀錄及本唯一長期交接，寫後重新讀取核對。
