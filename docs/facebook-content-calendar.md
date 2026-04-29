# Facebook Content Calendar

This calendar provides the first month of Facebook posts for the Page `台指期量化交易平台` and Group `台指期量化交易研究社`.

All posts must be reviewed by a human owner before publishing. Do not publish posts that imply investment advice, live trading readiness, profit promises, copy trading, or broker credential collection.

Standard footer for every post:

```text
本內容僅供教育與產品展示，不構成投資建議。平台目前以 Paper Only / research-only workflow 為主，ENABLE_LIVE_TRADING=false，Live trading remains disabled by default.
```

## Week 1

### Post 1: Image Teaching - TX / MTX / TMF Exposure Conversion

Format: image + short explainer

Copy:

```text
台指期不是只有「口數」問題，還有曝險單位問題。

TX / MTX / TMF 的每點價值：
- TX：每點 200 TWD
- MTX：每點 50 TWD
- TMF：每點 10 TWD

換算關係：
- 1 TX = 4 MTX = 20 TMF
- 1 MTX = 5 TMF

如果策略只說「做 1 口」，其實沒有說清楚風險曝險。較穩的方式是先用 TX-equivalent 統一曝險，再由平台轉換成合約組合。

這也是為什麼量化平台需要 Risk Engine 與 OMS 邊界，而不是讓策略直接下單。
```

Visual brief:

```text
Three-column card: TX / MTX / TMF, point value, TX-equivalent ratio, and a simple bar scale showing 1 TX = 20 TMF units.
```

CTA:

```text
想看更多台指期量化基礎設施筆記，可以追蹤粉專並加入「台指期量化交易研究社」。
```

### Post 2: Education - Why Paper Trading Is A Workflow, Not A Toy

Format: text + architecture diagram

Copy:

```text
Paper Trading 不只是把成交價改成模擬。

一個可被審查的 paper workflow 至少要留下：
1. StrategySignal
2. PaperOrderIntent
3. Risk Engine decision
4. OMS state transition
5. Paper Broker Gateway simulation
6. Audit Event

如果沒有這些紀錄，紙上交易很容易變成「看起來有跑」，但事後無法回答：
- 這筆模擬交易是誰批准的？
- 用哪一版資料？
- 風控是否通過？
- OMS 當時狀態是什麼？
- 是否有 audit trail？

我們目前的 Web Command Center 展示的是 Paper Only 流程，不會送出真實委託。
```

### Post 3: Poll - Current Backtesting Method

Format: poll

Question:

```text
你目前主要用什麼方式做台指期回測？
```

Options:

```text
Excel / Google Sheets
Python script
TradingView / chart tool
Broker platform
還沒有固定流程
```

Follow-up comment:

```text
之後會整理一篇「台指期回測最容易忽略的資料治理問題」，包含換月、缺值、資料版本與連續合約研究用途。
```

### Post 4: Product Demo - Paper Trading Console Walkthrough

Format: short video

Script:

```text
今天快速看 Web Command Center 的 Paper Only 控制台。

Demo 重點：
1. Release 狀態明確標示 NOT READY for production trading
2. Safety defaults 顯示 TRADING_MODE=paper
3. Paper approval request 需要進入審批流程
4. Controlled Paper Submit 必須引用 approval_request_id
5. OMS timeline 與 audit timeline 可以追蹤紙上流程

這支影片不示範實盤下單，也不收券商憑證。
```

On-screen labels:

```text
Paper Only
ENABLE_LIVE_TRADING=false
No broker credentials
No real orders
```

## Week 2

### Post 5: Long Form - How Rollover Affects Backtesting

Format: long text

Copy:

```text
台指期回測常見問題：換月處理不清楚，回測結果就很難被重現。

期貨合約有到期日。研究時常會把不同月份合約接成 continuous futures，但這裡有幾個關鍵邊界：

1. 研究用連續合約不等於可交易價格
Back-adjusted 或 ratio-adjusted continuous futures 適合研究趨勢與因子，但不能直接拿來做實盤成交價格。

2. Rollover event 必須版本化
換月日期、價差、調整方式、調整因子都應該進入 rollover event table，並且綁定 data_version。

3. Paper / live simulation 應使用真實合約價格路徑
研究資料與執行價格路徑要分開，否則回測到執行之間會產生不一致。

4. Data quality report 要跟回測結果一起保存
否則未來看到某次回測，無法確認它使用的資料是否有缺值、異常 OHLC、時間戳問題。

量化平台的價值，不只是跑策略，而是讓資料、研究、審批、paper workflow 都能被追溯。
```

### Post 6: Education - Data Version Registry

Format: carousel

Slides:

```text
Slide 1: 為什麼 data version 很重要？
Slide 2: data_version 連結 contract schema、market bars、rollover rules
Slide 3: quality report checksum 讓資料品質可追溯
Slide 4: reproducibility hash 幫助 reviewer 回看研究上下文
Slide 5: research-only manifest 不等於 execution-ready signal
```

Caption:

```text
回測不是只保存一個數字，而是保存「用哪一版資料、哪一版規則、哪一份品質報告」。
```

### Post 7: Education - StrategySignal Should Not Call Broker SDK

Format: text + simple flow diagram

Copy:

```text
策略模組最好只做一件事：輸出標準化 signal。

安全邊界：
StrategySignal -> PaperOrderIntent -> Risk Engine -> OMS -> Broker Gateway

為什麼不讓 strategy 直接呼叫 broker SDK？
- 很難統一風控
- 很難做審批
- 很難避免重複送單
- 很難留下完整 audit trail
- 很難做未來 reconciliation

我們目前的策略研究鏈條仍是 signals only，不產生真實委託。
```

### Post 8: Product Demo - Audit Timeline

Format: short video or screenshots

Copy:

```text
Paper Only demo：同一筆紙上流程可以看 OMS timeline 與 audit timeline。

這種設計的目的不是宣稱交易表現，而是讓 reviewer 可以回答：
- order_id 是什麼？
- final OMS status 是什麼？
- 哪些事件被記錄？
- 是否有 hash-chain reference？
- 是否仍維持 broker_api_called=false？

這是從「策略研究」走向「可審查 paper workflow」的必要基礎。
```

## Week 3

### Post 9: Image Teaching - Risk Engine Checks

Format: image + checklist

Copy:

```text
一筆 paper order 進 OMS 前，至少應該先過 Risk Engine。

初始 paper-only checks：
- live trading disabled
- trading mode is paper
- broker provider is paper
- exposure within max limit
- idempotency key present
- quote not stale

這些不是保證結果，而是降低流程失控的基礎工程。
```

### Post 10: Education - Approval Workflow

Format: text

Copy:

```text
從 research-only 到 paper execution，中間應該有 approval workflow。

目前 demo flow：
1. Create Paper Approval Request
2. Reviewer Decision
3. Controlled Paper Submit
4. OMS / Audit Viewer

重要邊界：
- approval_for_live=false
- approval_for_paper_execution 仍是 paper-only
- 不收 broker credentials
- 不建立真實委託

這樣客戶可以體驗完整流程，但不會誤以為平台已經能實盤交易。
```

### Post 11: Poll - Biggest Data Pain

Format: poll

Question:

```text
你在台指期量化研究中，最大痛點是哪一個？
```

Options:

```text
資料來源不穩定
換月處理麻煩
回測結果難重現
風控與下單流程混在一起
缺少可審計紀錄
```

### Post 12: Product Demo - Timeout Candidates And Paper OMS Reliability

Format: short demo clip

Copy:

```text
Paper OMS reliability demo：如何看 timeout candidates？

目前這是 paper-only、local metadata preview：
- 可以列出 nonterminal paper orders
- 可以 preview timeout mark
- 只有明確操作才會把本地 paper record 標記為 EXPIRED
- 不處理 production OMS queue
- 不呼叫 broker

這個功能展示的是 OMS reliability 的方向，不是正式實盤 OMS。
```

## Week 4

### Post 13: Long Form - From Script To Trading OS

Format: long text

Copy:

```text
很多量化交易一開始都是一支 script。

但只要開始面對團隊協作、paper workflow、審批、稽核與未來券商串接，script 很快會碰到邊界：

- 策略研究與執行混在一起
- 回測資料版本不清楚
- 風控沒有獨立入口
- OMS 狀態不完整
- 審批紀錄無法追溯
- broker SDK 散落在策略程式裡

Trading OS 的方向，是把這些流程拆成清楚的模組：
Data Platform / Strategy SDK / Risk Engine / OMS / Broker Gateway / Web Command Center。

目前展示版本仍是 Paper Only 與 internal demo candidate，目標是先把資料治理與模擬交易流程做穩，而不是跳到實盤。
```

### Post 14: Education - What NOT READY Means

Format: text

Copy:

```text
我們在 Web Command Center 明確標示 Production Trading Platform = NOT READY。

這代表目前不支援：
- 實盤下單
- 真實券商登入
- API Key 或憑證上傳
- 真實帳戶持倉與委託整合
- 自動交易啟用
- live approval
- 策略排名或最佳策略推薦

目前適合體驗的是：
- release baseline dashboard
- Paper Only workflow
- approval request / decision demo
- OMS / audit timeline
- research packet viewer
- TX / MTX / TMF contract specs
```

### Post 15: Education - What Customer Demo Can Safely Test

Format: checklist

Copy:

```text
客戶測試可以安全體驗：

- 切換中英文
- 查看 release level
- 確認 safety defaults
- 建立 Paper Approval Request
- 建立 reviewer decision
- Controlled Paper Submit
- 檢視 OMS timeline
- 檢視 audit timeline
- 載入本地 research packet JSON
- 載入 demo evidence JSON

客戶不應測試：
- 實盤下單
- 券商登入
- 憑證上傳
- 真實帳戶資料
- 自動交易啟用
- 投資建議或策略推薦
```

### Post 16: Product Demo - Full Paper Approval Flow

Format: short video

Script:

```text
這支 demo 串起完整 Paper Only workflow：

1. 建立 Paper Approval Request
2. Reviewer 做出 paper-only decision
3. Controlled Paper Submit 引用 approval_request_id
4. 進入 Risk Engine
5. 進入 OMS lifecycle
6. Paper Broker Gateway 模擬結果
7. Web Command Center 檢視 OMS / audit timeline

整個流程不連 broker、不收 credentials、不建立真實委託。
```

## Monthly Live Event

Title:

```text
台指期量化交易平台 Demo：從 TX 曝險換算到 Paper OMS 稽核
```

Announcement copy:

```text
本月線上分享會將示範台指期量化基礎設施的核心流程：

- TX / MTX / TMF 曝險換算
- 換月資料治理與 data_version
- StrategySignal 到 PaperOrderIntent 的安全邊界
- Paper Approval Workflow
- Paper OMS / Audit Viewer
- 目前不支援哪些實盤功能

這是一場教育與產品展示，不提供投資建議，也不示範實盤下單。
```

Live CTA:

```text
留言你最想看的主題：資料治理、回測、Paper OMS、審批流程、還是 Web Command Center？
```

## Repurposing Rules

- Convert each long post into one carousel and one short video.
- Convert each demo post into one pinned group discussion.
- Convert poll results into next week education post.
- Use screenshots only from Paper Only UI states.
- Blur any local paths if they reveal private user machine details.
- Never show API keys, broker credentials, account IDs, certificates, or real customer data.

