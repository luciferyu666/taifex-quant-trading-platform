# Facebook 30-Day Content Queue

This queue supports high-frequency but compliance-safe Facebook operations. Every item is a draft for human review. Do not auto-post. Do not use bots. Do not publish to third-party groups unless the group rules allow educational or promotional posts.

Primary links:

- Web App: <https://taifex-quant-trading-platform-front.vercel.app/?lang=zh>
- Website: <https://taifex-quant-trading-platform-website-7rf8yy2zd.vercel.app/zh/>
- Facebook Group: <https://www.facebook.com/groups/1323940496297459>
- Facebook Page: <https://www.facebook.com/profile.php?id=61589020471520>

Standard compliance note: `Paper Only；不構成投資建議；ENABLE_LIVE_TRADING=false；內容僅供研究、教育與系統開發討論。`

## Weekly Themes

| Day | Theme |
| --- | --- |
| Monday | 台指期量化觀念 |
| Tuesday | 資料 / 換月 |
| Wednesday | Web App Demo |
| Thursday | 風控 / OMS |
| Friday | 社群問答 |
| Saturday | 長文 / 案例 |
| Sunday | 本週整理 / 下週預告 |

## 30-Day Queue

| Day | Slot | Channel | Pillar | Post title | Short hook | Body outline | CTA | Link target | Visual suggestion | Compliance note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Day 1 Mon | 09:00 | Page | 台指期量化入門 | 台指期研究先看流程 | 研究不是先找策略，而是先定義流程。 | 說明資料、策略、Paper Trading、風控、OMS 的順序。 | 查看官網 | Website | 五段流程圖 | Paper Only；不構成投資建議。 |
| Day 1 Mon | 12:30 | Group | TX / MTX / TMF 曝險換算 | 口數不同，曝險不一定不同 | TX、MTX、TMF 要用等值曝險比較。 | 介紹 TX-equivalent 概念與研究用途。 | 留言取得 Checklist | Facebook Group | 曝險換算圖卡 | 教育用途；不提供交易建議。 |
| Day 1 Mon | 16:00 | Page + Group | 策略研究標準化 | StrategySignal 只該輸出 signal | 策略研究與下單意圖要分離。 | 說明 StrategySignal -> PaperOrderIntent 的責任切分。 | 開啟 Web App Demo | Web App | signal 到 intent 流程圖 | Paper Only；不構成投資建議。 |
| Day 1 Mon | 20:30 | Related groups if allowed | 社群問答與研究任務 | 你最想標準化哪一段？ | 資料、回測、Paper Trading、風控，哪段最容易亂？ | 提出 4 個選項，邀請留言流程痛點。 | 加入研究社群 | Facebook Group | 投票圖卡 | 先確認社團規則；不重複貼文。 |
| Day 2 Tue | 09:00 | Page | 回測與換月資料 | 換月資料不是回測小細節 | 連續期貨資料與可交易價格要分開。 | 說明 rollover event、data_version、研究資料邊界。 | 查看官網 | Website | 換月時間軸 | 不構成投資建議。 |
| Day 2 Tue | 12:30 | Group | 資料治理 | 你的回測資料有版本嗎？ | 沒有 data_version，回測很難被重現。 | 分享資料版本、來源、清洗紀錄的基本欄位。 | 留言取得 Checklist | Facebook Group | 資料表欄位圖 | 教育用途；不收帳戶資料。 |
| Day 2 Tue | 16:00 | Page | 回測與換月資料 | continuous futures 的常見誤解 | 研究價格不等於下單價格。 | 說明 continuous futures 可用於研究，但不能直接當成實際成交資料。 | 查看官網 | Website | 對照表 | 不宣稱績效。 |
| Day 2 Tue | 20:30 | Group | 社群問答與研究任務 | 本週資料任務：列出你的資料欄位 | 先看資料欄位，再談策略研究。 | 邀請使用者列出資料來源、頻率、換月處理方式。 | 留言分享你的流程 | Facebook Group | 問答卡 | 不貼個人帳戶或委託資料。 |
| Day 3 Wed | 09:00 | Page | Web App Interactive Demo | 打開瀏覽器就能跑 demo | 不需要本地後端，也能體驗資料到 Paper order。 | 介紹 Browser-only Demo 的 6 步流程。 | 開啟 Web App Demo | Web App | Demo stepper 截圖 | Paper Only；不構成投資建議。 |
| Day 3 Wed | 12:30 | Group | Paper Trading | Generate market tick 怎麼看 | 模擬行情不是實際行情，但能訓練流程判讀。 | 說明 bid/ask/spread/quote age 的展示目的。 | 開啟 Web App Demo | Web App | 行情卡片 | deterministic mock data only。 |
| Day 3 Wed | 16:00 | Page + Group | Web App Interactive Demo | Run mock strategy 的價值 | 策略先輸出 signal，不直接建立真實委託。 | 說明 signal-only 研究流程與 Paper Only 邊界。 | 開啟 Web App Demo | Web App | signal 面板截圖 | No broker；no real order。 |
| Day 3 Wed | 20:30 | Group | 社群問答與研究任務 | 你希望 demo 多顯示哪個欄位？ | 讓使用者回饋行情、策略、OMS、PnL 欄位。 | 收集 UX 問題與產品需求。 | 留言提供回饋 | Facebook Group | 問答卡 | 不收憑證或帳戶資訊。 |
| Day 4 Thu | 09:00 | Page | Risk Engine / OMS | Risk Engine 在 OMS 前面 | 先風控，再進 OMS，這是交易基礎設施邏輯。 | 說明 stale quote、exposure、order size 等檢查。 | 查看官網 | Website | 風控閘門圖 | 不構成投資建議。 |
| Day 4 Thu | 12:30 | Group | Risk Engine / OMS | stale quote 為何要拒絕 | 報價過舊時，Paper order 也應被拒絕。 | 用 demo 說明 quote age 與拒單原因。 | 開啟 Web App Demo | Web App | stale quote 圖卡 | Paper Only；不是真實成交。 |
| Day 4 Thu | 16:00 | Page | Risk Engine / OMS | OMS timeline 讓流程可被檢視 | 訂單生命週期比成交結果更重要。 | 說明 accepted、risk_checked、submitted、filled/rejected。 | 開啟 Web App Demo | Web App | OMS timeline 截圖 | 模擬資料；不構成投資建議。 |
| Day 4 Thu | 20:30 | Group | Broker Gateway / 安全邊界 | 為什麼策略不能碰券商 SDK | 策略層不應直接連 broker。 | 說明 broker gateway isolation 與 future adapter 邊界。 | 查看官網 | Website | 架構分層圖 | No broker；ENABLE_LIVE_TRADING=false。 |
| Day 5 Fri | 09:00 | Page | 社群問答與研究任務 | 本週問答：你怎麼做回測紀錄？ | 留下研究證據比只看結果更重要。 | 提出 evidence JSON、data_version、code_version 三個概念。 | 加入研究社群 | Facebook Group | Q&A 圖卡 | 不討論個別交易判斷。 |
| Day 5 Fri | 12:30 | Group | 社群問答與研究任務 | 投票：你目前卡在哪裡？ | 資料、換月、回測、Paper Trading、風控，選一個。 | 使用 poll 收集下週內容方向。 | 投票並留言 | Facebook Group | 投票貼文 | 教育討論；不提供投資建議。 |
| Day 5 Fri | 16:00 | Page | Web App Interactive Demo | Copy evidence JSON 可以做什麼 | Demo 完成後可以把結果帶回來討論。 | 說明 evidence 用於回饋、bug 回報、流程驗證。 | 開啟 Web App Demo | Web App | evidence JSON 卡片 | 不含真實帳戶資料。 |
| Day 5 Fri | 20:30 | Group | 社群問答與研究任務 | 週五研究任務：完成一次 demo | 依序按 market tick、strategy、Paper order。 | 邀請使用者貼出非敏感 summary，不貼憑證或帳戶資料。 | 留言完成狀態 | Facebook Group | 任務清單 | Paper Only；不構成投資建議。 |
| Day 6 Sat | 09:00 | Page | 長文 / 案例 | 從腳本到 Trading OS | 單一策略腳本不等於交易基礎設施。 | 長文比較 script、research workflow、Risk/OMS/audit 分層。 | 查看官網 | Website | 架構圖 | 不宣稱 production trading ready。 |
| Day 6 Sat | 12:30 | Group | 策略研究標準化 | 案例：策略只輸出 signal | signal-only 可以降低流程耦合。 | 用一個假想策略說明 signal 與 PaperOrderIntent 分離。 | 開啟 Web App Demo | Web App | 流程圖 | 不是交易建議。 |
| Day 6 Sat | 16:00 | Page | 企業級 Trading OS | 企業為什麼需要 audit evidence | 可追蹤流程比口頭描述可靠。 | 說明 audit event、hash-chain preview、release record。 | 預約 Demo | Website | audit trail 圖 | 非正式 WORM；教育展示。 |
| Day 6 Sat | 20:30 | Group | 社群問答與研究任務 | 長文討論：你如何保存研究紀錄？ | 研究紀錄要能被回看與驗證。 | 邀請分享欄位設計與回測紀錄方式。 | 加入討論 | Facebook Group | 討論卡 | 不貼個人金融資料。 |
| Day 7 Sun | 09:00 | Page | 本週整理 / 下週預告 | 本週整理：從資料到 Paper order | 一週內容幫你建立完整研究流程地圖。 | 回顧台指期觀念、資料、demo、風控、OMS。 | 查看官網 | Website | 週報圖卡 | 教育用途；不構成投資建議。 |
| Day 7 Sun | 12:30 | Group | 本週整理 / 下週預告 | 社群整理：最多人問的 3 件事 | 資料版本、換月、OMS timeline。 | 整理回覆並提出下週主題。 | 留言下週想看主題 | Facebook Group | FAQ 卡 | 不提供交易判斷。 |
| Day 7 Sun | 16:00 | Page + Group | Web App Interactive Demo | 下週 Demo 主題：市場狀態視覺化 | 看懂 spread、liquidity、slippage。 | 預告 market realism visualization。 | 開啟 Web App Demo | Web App | 預告圖 | Paper Only；mock data。 |
| Day 7 Sun | 20:30 | Group | 社群問答與研究任務 | 下週研究任務預告 | 觀察 quote age 與 Paper fill reason。 | 發布任務說明與安全邊界。 | 加入研究社群 | Facebook Group | 任務預告卡 | 不構成投資建議。 |
| Day 8 Mon | 09:00 | Page | 台指期量化入門 | 先定義研究問題，再做回測 | 策略研究要先問：資料、規則、驗證目標是什麼？ | 三步說明研究問題格式。 | 查看官網 | Website | 三步驟卡 | 教育用途。 |
| Day 8 Mon | 12:30 | Group | TX / MTX / TMF 曝險換算 | TX-equivalent 如何避免誤判 | 用等值曝險比較策略，不只看口數。 | 舉例 1 TX / 4 MTX / 20 TMF 的研究意義。 | 留言取得 Checklist | Facebook Group | 換算表 | 不建議交易標的。 |
| Day 8 Mon | 16:00 | Page | 策略研究標準化 | 研究 artifact 應該有哪些欄位 | data_version、signal_id、risk_check、evidence。 | 說明可重現研究包的最小欄位。 | 查看官網 | Website | artifact 欄位表 | 不宣稱績效。 |
| Day 8 Mon | 20:30 | Group | 社群問答與研究任務 | 你會怎麼命名策略版本？ | 命名規則會影響可追蹤性。 | 邀請分享版本命名與記錄方式。 | 留言分享 | Facebook Group | 問答卡 | 不貼策略交易指令。 |
| Day 9 Tue | 09:00 | Page | 回測與換月資料 | 換月日要從資料層被記錄 | 不記錄 rollover event，回測很難解釋。 | 說明 rollover event table 的用途。 | 查看官網 | Website | rollover table 圖 | 教育用途。 |
| Day 9 Tue | 12:30 | Group | 資料治理 | 缺值不是小問題 | 缺值會影響訊號與回測路徑。 | 討論 missing bar、stale quote、資料品質報告。 | 留言取得 Checklist | Facebook Group | data quality 圖卡 | 不提供交易建議。 |
| Day 9 Tue | 16:00 | Page | 回測與換月資料 | 回測結果要附資料來源 | 沒有資料來源的回測不容易被審查。 | 說明 data_source、data_version、generated_at。 | 查看官網 | Website | 欄位對照圖 | 不宣稱未來表現。 |
| Day 9 Tue | 20:30 | Related groups if allowed | 回測與換月資料 | 教育分享：換月資料處理清單 | 先確認社團可接受教育貼文。 | 簡化成 5 點資料治理 checklist。 | 查看官網 | Website | checklist 圖 | 手動審核社團規則。 |
| Day 10 Wed | 09:00 | Page | Web App Interactive Demo | 3 分鐘跑一次 Browser-only Demo | 從行情到 evidence，都在瀏覽器完成。 | 介紹操作順序與輸出結果。 | 開啟 Web App Demo | Web App | Demo 流程圖 | Paper Only；No broker。 |
| Day 10 Wed | 12:30 | Group | Paper Trading | Paper order 為什麼要先經 Risk Engine | 即使是模擬，也要保留風控流程。 | 說明 demo 的 risk check 與 OMS 事件。 | 開啟 Web App Demo | Web App | 風控流程截圖 | 不是真實委託。 |
| Day 10 Wed | 16:00 | Page | Web App Interactive Demo | evidence JSON 如何幫助回報問題 | 比截圖更容易描述 demo 狀態。 | 說明 session_id、seed、tick、signal、order。 | 開啟 Web App Demo | Web App | JSON 摘要圖 | 不含個資或憑證。 |
| Day 10 Wed | 20:30 | Group | 社群問答與研究任務 | 完成 Demo 後你最想改善哪裡？ | 收集 UI/UX 回饋。 | 提供選項：行情、策略、OMS、PnL、evidence。 | 留言回饋 | Facebook Group | 回饋卡 | 不收敏感資料。 |
| Day 11 Thu | 09:00 | Page | Risk Engine / OMS | 風控不是最後一道補丁 | 風控要在 OMS 之前。 | 說明 pre-trade checks 的角色。 | 查看官網 | Website | Risk before OMS 圖 | 教育用途。 |
| Day 11 Thu | 12:30 | Group | Risk Engine / OMS | position limit 在 Paper Demo 的意義 | 模擬流程也能訓練限制意識。 | 說明 paper/local 狀態與 production gap。 | 開啟 Web App Demo | Web App | limit 卡 | Paper Only。 |
| Day 11 Thu | 16:00 | Page | Broker Gateway / 安全邊界 | Paper Broker simulation 不是真實市場撮合 | 模擬成交只能用於流程理解。 | 說明 deterministic / local quote-based boundary。 | 查看官網 | Website | boundary 圖 | 不宣稱真實成交精準度。 |
| Day 11 Thu | 20:30 | Group | Risk Engine / OMS | 你希望風控面板顯示什麼？ | 讓社群回饋風控可視化欄位。 | 提供 stale quote、exposure、position、kill switch 選項。 | 留言分享 | Facebook Group | poll 卡 | 不涉及實盤。 |
| Day 12 Fri | 09:00 | Page | 社群問答與研究任務 | 問答：Paper Trading 和實盤差在哪 | 先講邊界，再談研究價值。 | 說明 no broker、no real money、no real order。 | 查看官網 | Website | 對照圖 | 不構成投資建議。 |
| Day 12 Fri | 12:30 | Group | 社群問答與研究任務 | 投票：你最需要哪種教學？ | 曝險換算、換月、回測、Paper Demo、OMS。 | 用投票決定下週內容比例。 | 投票 | Facebook Group | 投票圖 | 教育討論。 |
| Day 12 Fri | 16:00 | Page | Web App Interactive Demo | 從 Demo summary 看產品價值 | 一段 summary 可以串起行情、策略、OMS、PnL。 | 說明 copy demo summary 的用途。 | 開啟 Web App Demo | Web App | summary 截圖 | simulated only。 |
| Day 12 Fri | 20:30 | Group | 社群問答與研究任務 | 週五回饋串 | 請回報 demo 卡住的步驟。 | 收集 browser、語言、完成步驟、期待功能。 | 留言回饋 | Facebook Group | 回饋表 | 不收帳戶或憑證。 |
| Day 13 Sat | 09:00 | Page | 長文 / 案例 | 案例：一次 Paper order 的完整生命週期 | 看懂 order lifecycle 才能談系統化。 | 長文拆解 signal、intent、risk、OMS、broker simulation、audit。 | 開啟 Web App Demo | Web App | 生命週期圖 | Paper Only。 |
| Day 13 Sat | 12:30 | Group | Paper Trading | 案例討論：partial fill 代表什麼 | 部分成交在 demo 中用於理解流動性限制。 | 說明 bid/ask size 與 fill reason。 | 開啟 Web App Demo | Web App | liquidity 圖 | 模擬資料。 |
| Day 13 Sat | 16:00 | Page | 企業級 Trading OS | 為什麼 Trading OS 要分層 | 研究、執行、風控、稽核各自有責任。 | 企業視角說明分層價值。 | 預約 Demo | Website | 分層架構圖 | 非 production trading。 |
| Day 13 Sat | 20:30 | Group | 社群問答與研究任務 | 你如何定義可審查的策略研究？ | 討論 artifact、evidence、review queue。 | 引導社群討論研究審查流程。 | 加入討論 | Facebook Group | 討論卡 | 不提供個別策略建議。 |
| Day 14 Sun | 09:00 | Page | 本週整理 / 下週預告 | 本週整理：資料品質到風控邊界 | 回顧本週教育與 demo 主題。 | 整理 5 個學習重點。 | 查看官網 | Website | 週報圖 | 教育用途。 |
| Day 14 Sun | 12:30 | Group | 本週整理 / 下週預告 | 社群本週 3 個問題 | 整理資料版本、partial fill、風控欄位。 | 回覆社群常見問題。 | 留言補充 | Facebook Group | FAQ 卡 | 不構成投資建議。 |
| Day 14 Sun | 16:00 | Page + Group | Web App Interactive Demo | 下週預告：更清楚看懂 market realism | spread、liquidity、slippage 會成為 demo 重點。 | 預告視覺化內容。 | 開啟 Web App Demo | Web App | 預告圖 | deterministic mock data。 |
| Day 14 Sun | 20:30 | Group | 社群問答與研究任務 | 下週任務：解讀 fill reason | 觀察為何 filled、partial、rejected。 | 發布操作任務與回饋格式。 | 加入研究社群 | Facebook Group | 任務卡 | Paper Only。 |
| Day 15 Mon | 09:00 | Page | 台指期量化入門 | 量化不是自動化按鈕 | 先建立可驗證流程，再談自動化。 | 說明研究、審批、Paper、風控、OMS 的順序。 | 查看官網 | Website | 流程圖 | 不構成投資建議。 |
| Day 15 Mon | 12:30 | Group | TX / MTX / TMF 曝險換算 | 曝險換算如何協助風控 | contract count 與風險 exposure 要分開看。 | 討論 max order size 與 TX-equivalent。 | 留言取得 Checklist | Facebook Group | 曝險風控表 | 教育用途。 |
| Day 15 Mon | 16:00 | Page | 策略研究標準化 | PaperOrderIntent 的產品意義 | 平台建立 paper intent，策略只保留 signal。 | 說明 governance 與 audit 好處。 | 開啟 Web App Demo | Web App | intent 卡 | Paper Only。 |
| Day 15 Mon | 20:30 | Group | 社群問答與研究任務 | 你會如何描述一個 signal？ | 討論 symbol、side、confidence、reason。 | 收集 StrategySignal 欄位需求。 | 留言分享 | Facebook Group | 欄位卡 | 不提供交易方向建議。 |
| Day 16 Tue | 09:00 | Page | 回測與換月資料 | data lineage 是研究可信度來源 | 從 raw data 到 research artifact 都要可追蹤。 | 說明資料血緣與版本。 | 查看官網 | Website | lineage 圖 | 不宣稱績效。 |
| Day 16 Tue | 12:30 | Group | 資料治理 | 你如何處理異常價？ | 問社群如何標記、排除、保留異常。 | 引導資料治理討論。 | 加入研究社群 | Facebook Group | 問答卡 | 不涉及實盤建議。 |
| Day 16 Tue | 16:00 | Page | 回測與換月資料 | 回測報告應該附哪些警示 | 模擬結果不是投資建議。 | 說明 warnings、data caveats、safety flags。 | 查看官網 | Website | 警示卡 | 不構成投資建議。 |
| Day 16 Tue | 20:30 | Related groups if allowed | 資料治理 | 教育分享：data_version 的最小欄位 | 分享可重現研究的欄位。 | 簡述 source、symbol、timeframe、checksum。 | 查看官網 | Website | 欄位圖 | 先人工審核社團規則。 |
| Day 17 Wed | 09:00 | Page | Web App Interactive Demo | Market regime 讓 demo 更接近流程訓練 | normal、trending、volatile、illiquid、stale。 | 說明不同 regime 對 fill outcome 的影響。 | 開啟 Web App Demo | Web App | regime 狀態卡 | mock data only。 |
| Day 17 Wed | 12:30 | Group | Paper Trading | spread 變大時 demo 會發生什麼 | 讓使用者理解價差與滑價估計。 | 引導觀察 spread、slippage、fill reason。 | 開啟 Web App Demo | Web App | spread 圖 | simulated only。 |
| Day 17 Wed | 16:00 | Page + Group | Web App Interactive Demo | 從 Paper order 看 OMS timeline | 每一步都應該可追蹤。 | 操作 demo 並查看 timeline。 | 開啟 Web App Demo | Web App | timeline 截圖 | Paper Only。 |
| Day 17 Wed | 20:30 | Group | 社群問答與研究任務 | 你看到的 fill reason 是哪一種？ | filled、partial、stale reject、illiquid reject。 | 邀請回報非敏感 demo summary。 | 留言回饋 | Facebook Group | fill reason 卡 | 不貼帳戶資料。 |
| Day 18 Thu | 09:00 | Page | Risk Engine / OMS | kill switch 在研究平台的定位 | 目前是 paper readiness，不是實盤開關。 | 說明 readiness boundary。 | 查看官網 | Website | boundary 卡 | Live trading disabled。 |
| Day 18 Thu | 12:30 | Group | Risk Engine / OMS | duplicate order prevention 為什麼重要 | idempotency key 可避免重複 submit。 | 用 paper workflow 說明。 | 開啟 Web App Demo | Web App | idempotency 圖 | Paper Only。 |
| Day 18 Thu | 16:00 | Page | Broker Gateway / 安全邊界 | No broker by design | 目前 demo 不需要券商帳號。 | 說明 no broker、no credentials、no real order。 | 查看官網 | Website | 安全邊界卡 | 不收憑證。 |
| Day 18 Thu | 20:30 | Group | Risk Engine / OMS | 你想在風控 evidence 看見什麼？ | checks passed/failed、policy、state、reason。 | 收集 evidence 欄位需求。 | 留言分享 | Facebook Group | evidence 欄位卡 | 不收敏感資料。 |
| Day 19 Fri | 09:00 | Page | 社群問答與研究任務 | 問答：為什麼 demo 顯示 PnL？ | simulated PnL 用於流程理解，不是投資績效。 | 說明 simulated / research-only boundary。 | 開啟 Web App Demo | Web App | PnL boundary 卡 | 不構成投資建議。 |
| Day 19 Fri | 12:30 | Group | 社群問答與研究任務 | 投票：你會優先看哪個面板？ | Market、Signal、OMS、Position、Evidence。 | 用 poll 指導 UI 優化。 | 投票 | Facebook Group | poll 卡 | 教育用途。 |
| Day 19 Fri | 16:00 | Page | Web App Interactive Demo | Copy evidence JSON 的 3 個使用場景 | 回報 bug、分享學習狀態、做內部審查。 | 說明 evidence 不包含真實帳戶資料。 | 開啟 Web App Demo | Web App | JSON 卡 | browser-only。 |
| Day 19 Fri | 20:30 | Group | 社群問答與研究任務 | 週五回饋：哪一步最不直覺？ | market tick、strategy、order、OMS、PnL。 | 收集 UX 阻塞。 | 留言回饋 | Facebook Group | 回饋卡 | 不構成投資建議。 |
| Day 20 Sat | 09:00 | Page | 長文 / 案例 | 案例：illiquid snapshot 如何影響 Paper fill | 流動性不足時，demo 可能 partial 或 reject。 | 長文解釋 liquidity_score、bid/ask size。 | 開啟 Web App Demo | Web App | liquidity 流程圖 | simulated only。 |
| Day 20 Sat | 12:30 | Group | Paper Trading | 案例討論：slippage estimate 的研究用途 | 模擬滑價用來理解流程，不代表真實成交。 | 討論 deterministic slippage metadata。 | 開啟 Web App Demo | Web App | slippage 圖卡 | 不宣稱精準度。 |
| Day 20 Sat | 16:00 | Page | 企業級 Trading OS | 從 demo 到 SaaS 還缺什麼 | auth、tenant、managed datastore、audit service。 | 說明 roadmap 與邊界。 | 查看官網 | Website | SaaS roadmap 圖 | Production trading NOT READY。 |
| Day 20 Sat | 20:30 | Group | 社群問答與研究任務 | 你對 SaaS 版本最在意什麼？ | 登入、資料保存、團隊權限、audit、報表。 | 收集產品需求。 | 加入討論 | Facebook Group | 需求卡 | 不收帳戶資料。 |
| Day 21 Sun | 09:00 | Page | 本週整理 / 下週預告 | 本週整理：從 market regime 到 evidence | 回顧 market realism 與 Paper workflow。 | 整理 5 個學習重點。 | 查看官網 | Website | 週報圖 | 教育用途。 |
| Day 21 Sun | 12:30 | Group | 本週整理 / 下週預告 | 社群整理：最常見的 demo 問題 | PnL、fill reason、no broker、local state。 | 回答常見問題。 | 留言補充 | Facebook Group | FAQ 卡 | 不構成投資建議。 |
| Day 21 Sun | 16:00 | Page + Group | Web App Interactive Demo | 下週預告：從回饋到產品改版 | 用 demo feedback 轉成 UX 修正。 | 說明 evidence review workflow。 | 開啟 Web App Demo | Web App | 預告圖 | Paper Only。 |
| Day 21 Sun | 20:30 | Group | 社群問答與研究任務 | 下週任務：提出一個 demo 改善建議 | 用實際操作回饋產品。 | 發布任務格式。 | 加入研究社群 | Facebook Group | 任務卡 | 不收敏感資料。 |
| Day 22 Mon | 09:00 | Page | 台指期量化入門 | 研究平台的第一價值：降低流程混亂 | 不是預測答案，而是讓流程可檢查。 | 說明資料、策略、Paper、OMS、evidence 的價值。 | 查看官網 | Website | 價值對照圖 | 不構成投資建議。 |
| Day 22 Mon | 12:30 | Group | TX / MTX / TMF 曝險換算 | 曝險表怎麼接到策略研究 | signal 需要轉成 normalized exposure。 | 討論 contract multiplier 與研究欄位。 | 留言取得 Checklist | Facebook Group | 曝險表 | 不建議下單。 |
| Day 22 Mon | 16:00 | Page | 策略研究標準化 | 從研究到 demo 的標準化路徑 | Data -> Signal -> PaperOrderIntent -> Risk -> OMS。 | 顯示 workflow standardization panel 的概念。 | 開啟 Web App Demo | Web App | standardization 圖 | Paper Only。 |
| Day 22 Mon | 20:30 | Group | 社群問答與研究任務 | 你會把哪些資料放進 evidence？ | tick、signal、order、OMS、position、warnings。 | 收集 evidence schema 回饋。 | 留言分享 | Facebook Group | schema 卡 | 不收真實交易資料。 |
| Day 23 Tue | 09:00 | Page | 回測與換月資料 | 回測的可重現性來自紀錄 | 只看圖表不夠，要知道資料與規則。 | 說明 checksum、config、seed、version。 | 查看官網 | Website | reproducibility 卡 | 不宣稱績效。 |
| Day 23 Tue | 12:30 | Group | 資料治理 | 你會保存 raw data 嗎？ | raw / cleaned / feature data 應分層。 | 問社群資料治理習慣。 | 加入研究社群 | Facebook Group | 分層圖 | 教育用途。 |
| Day 23 Tue | 16:00 | Page | 回測與換月資料 | rollover separation 的產品價值 | 研究連續資料與執行合約要明確分開。 | 說明防止混淆的資料模型。 | 查看官網 | Website | rollover separation 圖 | 不提供交易建議。 |
| Day 23 Tue | 20:30 | Related groups if allowed | 回測與換月資料 | 教育分享：回測報告 5 個必要欄位 | 簡短 checklist。 | data_version、parameter、period、warnings、evidence。 | 查看官網 | Website | checklist 圖 | 先確認社團規則。 |
| Day 24 Wed | 09:00 | Page | Web App Interactive Demo | 這不是靜態展示：可以自己操作 | 使用者可產生行情、跑策略、模擬 Paper order。 | 說明 interactive demo 與靜態頁差異。 | 開啟 Web App Demo | Web App | 操作按鈕截圖 | Paper Only。 |
| Day 24 Wed | 12:30 | Group | Paper Trading | 你完成到第幾步？ | tick、strategy、order、OMS、PnL、evidence。 | 發起完成度回報。 | 留言完成步驟 | Facebook Group | stepper 圖 | 不構成投資建議。 |
| Day 24 Wed | 16:00 | Page + Group | Web App Interactive Demo | Demo summary 怎麼讀 | summary 串起 market regime、signal、fill、PnL。 | 拆解 summary 欄位。 | 開啟 Web App Demo | Web App | summary 圖 | simulated only。 |
| Day 24 Wed | 20:30 | Group | 社群問答與研究任務 | 你希望下一版 demo 加什麼？ | 圖表、更多策略、更多風控、更多 evidence。 | 收集需求，不承諾實盤。 | 留言回饋 | Facebook Group | 需求卡 | no broker / no credentials。 |
| Day 25 Thu | 09:00 | Page | Risk Engine / OMS | OMS 不是成交報表 | OMS 管的是狀態與流程。 | 說明 lifecycle、idempotency、timeout、audit gap。 | 查看官網 | Website | OMS 狀態圖 | 非 production OMS。 |
| Day 25 Thu | 12:30 | Group | Risk Engine / OMS | timeout handling 為何重要 | 系統要知道等待過久的 order。 | 說明 paper timeout preview 與 production gap。 | 查看官網 | Website | timeout 卡 | Paper-only readiness。 |
| Day 25 Thu | 16:00 | Page | Broker Gateway / 安全邊界 | Paper Broker simulation 的邊界 | deterministic / local quote-based，不是真實券商回報。 | 說明 missing production execution model。 | 查看官網 | Website | broker boundary 圖 | 不連 broker。 |
| Day 25 Thu | 20:30 | Group | Risk Engine / OMS | 問答：audit evidence 不是正式 WORM | 目前是 preview，正式稽核系統是未來工作。 | 清楚標示產品邊界。 | 加入討論 | Facebook Group | audit boundary 卡 | 不宣稱合規完成。 |
| Day 26 Fri | 09:00 | Page | 社群問答與研究任務 | 問答：為何不直接接券商？ | 先把研究與 Paper workflow 做穩。 | 說明 safety-first roadmap。 | 查看官網 | Website | roadmap 圖 | live trading disabled。 |
| Day 26 Fri | 12:30 | Group | 社群問答與研究任務 | 投票：你最想先產品化哪個模組？ | market data、strategy、risk、OMS、audit、SaaS。 | 用 poll 收集 roadmap 優先順序。 | 投票 | Facebook Group | poll 卡 | 不涉及實盤。 |
| Day 26 Fri | 16:00 | Page | Web App Interactive Demo | 客戶試用怎麼回饋最有效？ | summary + evidence JSON + 卡住步驟。 | 說明 feedback workflow。 | 開啟 Web App Demo | Web App | feedback 卡 | 不收憑證。 |
| Day 26 Fri | 20:30 | Group | 社群問答與研究任務 | 週五回饋串：分享一個 demo insight | 只貼非敏感摘要。 | 引導 users 回報學習結果。 | 留言回饋 | Facebook Group | 回饋卡 | 不構成投資建議。 |
| Day 27 Sat | 09:00 | Page | 長文 / 案例 | 案例：從社群問題變成產品改進 | 回饋閉環是 MVP 的一部分。 | 長文說明 content -> demo -> evidence -> improvement。 | 加入研究社群 | Facebook Group | growth loop 圖 | 教育用途。 |
| Day 27 Sat | 12:30 | Group | 社群問答與研究任務 | 案例討論：一個 UX 問題如何回報 | 用 evidence JSON 與完成步驟描述問題。 | 提供回饋格式。 | 留言回饋 | Facebook Group | 回報模板 | 不收敏感資料。 |
| Day 27 Sat | 16:00 | Page | 企業級 Trading OS | B2B 角度：為何需要 tenant / RBAC | Hosted Paper SaaS 未啟用，但 roadmap 清楚。 | 說明 future auth/tenant/datastore。 | 預約 Demo | Website | SaaS 架構圖 | 不建立客戶帳號。 |
| Day 27 Sat | 20:30 | Group | 社群問答與研究任務 | 你會如何設計 reviewer 權限？ | reviewer、admin、customer、operator。 | 討論 RBAC/ABAC 需求。 | 加入討論 | Facebook Group | role 卡 | 非正式審批系統。 |
| Day 28 Sun | 09:00 | Page | 本週整理 / 下週預告 | 本週整理：demo、風控、SaaS 邊界 | 一篇掌握目前能做與不能做。 | 整理 completed demo path 和 known gaps。 | 查看官網 | Website | 週報圖 | Production Trading Platform: NOT READY。 |
| Day 28 Sun | 12:30 | Group | 本週整理 / 下週預告 | 社群整理：本週最佳回饋 | 整理 3 個產品方向。 | 回應社群建議。 | 留言補充 | Facebook Group | 回饋整理卡 | 不構成投資建議。 |
| Day 28 Sun | 16:00 | Page + Group | Web App Interactive Demo | 下週預告：從 demo 使用者到產品路線 | 從 feedback 到 waitlist / interview。 | 說明下一階段試用與訪談。 | 預約 Demo | Website | roadmap card | Paper Only。 |
| Day 28 Sun | 20:30 | Group | 社群問答與研究任務 | 下週任務：邀請一位研究朋友試 demo | 只邀請真實有興趣的人，避免洗版。 | 鼓勵合規分享，不要求大量轉貼。 | 加入研究社群 | Facebook Group | 任務卡 | 不做人工互動操縱。 |
| Day 29 Mon | 09:00 | Page | 台指期量化入門 | 30 天後，你應該看懂哪些流程 | 資料、策略、回測、Paper Trading、風控、OMS。 | 回顧學習路徑。 | 查看官網 | Website | learning map | 教育用途。 |
| Day 29 Mon | 12:30 | Group | TX / MTX / TMF 曝險換算 | 最後複習：曝險不是口數 | 用 TX-equivalent 做研究比較。 | 發布簡短複習卡。 | 留言取得 Checklist | Facebook Group | 曝險卡 | 不建議交易。 |
| Day 29 Mon | 16:00 | Page | 策略研究標準化 | 從 signal 到 evidence 的完整閉環 | signal 不是終點，evidence 才能回饋。 | 串起 full workflow。 | 開啟 Web App Demo | Web App | workflow card | Paper Only。 |
| Day 29 Mon | 20:30 | Group | 社群問答與研究任務 | 你的 30 天學習成果是什麼？ | 讓社群總結最有幫助的內容。 | 收集 user benefits。 | 留言分享 | Facebook Group | 問答卡 | 不構成投資建議。 |
| Day 30 Tue | 09:00 | Page | 回測與換月資料 | 30 天總結：研究平台該解決什麼 | 標準化、可重現、可操作、可回饋。 | 總結 Web App / website / community 分工。 | 查看官網 | Website | 總結圖 | 不宣稱 production ready。 |
| Day 30 Tue | 12:30 | Group | 社群問答與研究任務 | 30 天社群回顧 | 哪些問題最值得做成下一版功能？ | 發布回顧與下一輪議題。 | 加入研究社群 | Facebook Group | 回顧卡 | 教育討論。 |
| Day 30 Tue | 16:00 | Page + Group | Web App Interactive Demo | 請完成一次完整 demo 並回饋 | 從 market tick 到 evidence JSON。 | 提供 6 步操作與回饋格式。 | 開啟 Web App Demo | Web App | demo checklist | Paper Only；不構成投資建議。 |
| Day 30 Tue | 20:30 | Page | 企業級 Trading OS | 下一階段：從 Interactive Demo 到 Hosted Paper SaaS | Demo 已可操作，SaaS 還需要 auth、tenant、DB、audit。 | 說明 roadmap 與 safety boundary。 | 預約 Demo | Website | SaaS roadmap | Live trading remains disabled by default。 |

