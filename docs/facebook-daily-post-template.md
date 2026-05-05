# Facebook Daily Post Templates

Use one CTA per post. Add UTM-tagged links manually or through `make social-daily-pack`. Every product or demo post must preserve Paper Only, 不構成投資建議, and ENABLE_LIVE_TRADING=false.

## 1. 教育短文

- Hook: `台指期研究常見的問題，不是策略不夠多，而是資料與流程沒有標準化。`
- Context: Explain one concept such as TX-equivalent exposure, data_version, or rollover.
- Value explanation: Show how the concept reduces confusion during research.
- CTA: `查看官網`
- Compliance footer: `本內容僅供研究、教育與系統開發討論，不構成投資建議。Paper Only，ENABLE_LIVE_TRADING=false。`
- UTM placeholder: `{url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 2. Web App Demo 貼文

- Hook: `打開 Web App，不需要本地後端，也可以跑完整 Browser-only Demo。`
- Context: Describe market tick -> mock strategy -> Paper Only order -> OMS -> evidence.
- Value explanation: Users can understand the platform workflow before any real trading integration.
- CTA: `開啟 Web App Demo`
- Compliance footer: `Demo 為 Paper Only / browser-only，不連券商、不建立真實委託、不構成投資建議。`
- UTM placeholder: `{web_app_url}&utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 3. 圖卡貼文

- Hook: `一張圖看懂：StrategySignal 為什麼不能直接下單。`
- Context: Use a visual flow: StrategySignal -> PaperOrderIntent -> Risk Engine -> OMS -> Paper Broker simulation.
- Value explanation: Makes platform boundaries easier to explain.
- CTA: `加入研究社群`
- Compliance footer: `內容僅供教育與產品展示，不構成投資建議。`
- UTM placeholder: `{group_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 4. 社團互動問題

- Hook: `你目前最想標準化哪一段流程？`
- Context: Offer choices: data, rollover, backtest, paper trading, risk, OMS.
- Value explanation: Community responses become future education topics.
- CTA: `留言分享你的流程痛點`
- Compliance footer: `請勿張貼帳戶資料、委託紀錄、券商憑證或個人金融資料。`
- UTM placeholder: `{group_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 5. 投票貼文

- Hook: `你目前用什麼方式做台指期策略研究？`
- Context: Poll options should be workflow tools, not trading outcomes.
- Value explanation: Helps identify audience maturity and content needs.
- CTA: `投票並留言補充`
- Compliance footer: `本投票僅供研究流程討論，不構成投資建議。`
- UTM placeholder: `{group_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 6. 長文導流

- Hook: `台指期換月不是小細節，它會直接影響研究資料能否重現。`
- Context: Explain rollover events, continuous futures, and execution price separation.
- Value explanation: Demonstrates platform methodology.
- CTA: `查看官網`
- Compliance footer: `本文為資料治理與研究流程說明，不構成投資建議。`
- UTM placeholder: `{website_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 7. 直播預告

- Hook: `本週直播：從資料治理到 Paper Trading 控制台。`
- Context: Agenda with safety boundary, TX/MTX/TMF exposure, rollover, Web App Demo, Q&A.
- Value explanation: Converts passive readers into qualified demo users.
- CTA: `加入研究社群`
- Compliance footer: `直播不提供個別交易建議、不示範實盤委託、不收憑證。`
- UTM placeholder: `{group_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 8. 直播回顧

- Hook: `直播回顧：最多人問的是 Paper Trading 如何留下 audit evidence。`
- Context: Summarize 3 to 5 educational points.
- Value explanation: Reuses live content for users who missed it.
- CTA: `開啟 Web App Demo`
- Compliance footer: `回顧內容僅供教育與產品展示，不構成投資建議。`
- UTM placeholder: `{web_app_url}&utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 9. 產品更新

- Hook: `Web App 更新：新增 market realism visualization。`
- Context: Describe what users can now see.
- Value explanation: Shows ongoing product progress and makes the demo easier to understand.
- CTA: `開啟 Web App Demo`
- Compliance footer: `此更新為 browser-only / Paper Only demo，不連券商、不建立真實委託。`
- UTM placeholder: `{web_app_url}&utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 10. 合規 / 風控提醒

- Hook: `研究平台和實盤交易平台，邊界必須清楚。`
- Context: Explain no broker, no credentials, no real order, no live trading.
- Value explanation: Builds trust through clear scope control.
- CTA: `查看官網`
- Compliance footer: `Production Trading Platform: NOT READY。ENABLE_LIVE_TRADING=false。`
- UTM placeholder: `{website_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 11. 研究任務

- Hook: `本週研究任務：用 Web App 看懂一次 Paper Only order 的 OMS timeline。`
- Context: Give a short task users can complete in the browser.
- Value explanation: Converts readers into active demo users.
- CTA: `完成 Web App Demo`
- Compliance footer: `任務使用 browser-only mock data，不構成投資建議。`
- UTM placeholder: `{web_app_url}&utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

## 12. 週報

- Hook: `本週整理：資料、策略、Paper Trading、風控各一篇。`
- Context: Summarize best posts and link to Web App/website.
- Value explanation: Helps new users catch up quickly.
- CTA: `加入研究社群`
- Compliance footer: `週報僅供教育與產品展示，不構成投資建議。`
- UTM placeholder: `{group_url}?utm_source=facebook&utm_medium=social&utm_campaign={campaign}&utm_content={post_id}`

Live trading remains disabled by default.
