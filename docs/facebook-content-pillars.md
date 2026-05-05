# Facebook Content Pillars

All pillars must preserve Paper Only, 不構成投資建議, ENABLE_LIVE_TRADING=false, no broker credentials, no real order, and no production trading readiness claims.

| Pillar | Purpose | Target audience | Example post hooks | CTA | Risk wording to avoid | Suggested landing link |
| --- | --- | --- | --- | --- | --- | --- |
| 台指期量化入門 | Explain core Taiwan futures workflow concepts. | General investors, new researchers. | 台指期研究先從曝險單位開始; 為什麼策略不能只看口數; Paper Trading 是研究流程的一部分. | 查看官網 | Any phrase that implies a trade recommendation or outcome promise. | Official Website |
| TX / MTX / TMF 曝險換算 | Teach point value and TX-equivalent sizing. | General investors, strategy researchers. | 1 TX = 4 MTX = 20 TMF 的研究意義; 口數不同不代表風險相同; 用 TX-equivalent 看策略曝險. | 留言取得 Checklist | Do not tell users which contract to trade. | Official Website |
| 策略研究標準化 | Explain StrategySignal, reproducibility, and workflow separation. | Quant developers, researchers. | 策略只輸出 signal; 為什麼下單意圖由平台建立; signals-only 如何降低流程混亂. | 開啟 Web App Demo | Do not imply signals are recommendations. | Web App |
| 回測與換月資料 | Explain data versioning, rollover, and research/execution separation. | Strategy researchers, professional traders. | 換月資料如何影響回測; continuous futures 不等於可交易價格; data_version 為什麼重要. | 查看官網 | Do not present backtest output as future performance. | Official Website |
| Paper Trading | Show paper workflow and browser-only demo. | Demo users, researchers. | 從市場 tick 到 Paper Only order; 模擬 OMS timeline 怎麼看; evidence JSON 如何協助回饋. | 開啟 Web App Demo | Do not call simulated PnL performance. | Web App |
| Risk Engine / OMS | Explain pre-trade checks and lifecycle visibility. | Professional traders, engineers. | Risk Engine 在 OMS 前面; stale quote 為何會被拒絕; OMS timeline 讓 paper flow 可檢視. | 開啟 Web App Demo | Do not imply production OMS readiness. | Web App |
| Broker Gateway / 安全邊界 | Explain broker isolation and non-live posture. | Developers, enterprise partners. | 為什麼策略不直接碰券商 SDK; Broker Gateway 目前是 paper simulation; no broker credentials by design. | 查看官網 | Do not imply broker integration is live. | Official Website |
| Web App Interactive Demo | Drive activation into browser-only demo. | All trial users. | 打開瀏覽器即可跑完整 demo; 產生行情、策略、紙上訂單與 evidence; 不需要本地 backend. | 開啟 Web App Demo | Do not claim real trading execution. | Web App |
| 企業級 Trading OS | Position architecture and enterprise roadmap. | Enterprise, broker, fintech partners. | Trading OS 不是單一 bot; 研究、風控、OMS、audit 的分層; Hosted Paper SaaS roadmap. | 預約 Demo | Do not claim production trading readiness. | Official Website |
| 社群問答與研究任務 | Create discussion, feedback, and content loops. | Group members, researchers. | 你目前怎麼處理換月; 你希望 Web App 多顯示哪個欄位; 本週研究任務：看懂 OMS timeline. | 加入研究社群 | Do not ask users to post account data or trading screenshots. | Facebook Group |

Standard footer:

```text
本內容僅供研究、教育與系統開發討論，不構成投資建議。展示內容維持 Paper Only，ENABLE_LIVE_TRADING=false。
```
