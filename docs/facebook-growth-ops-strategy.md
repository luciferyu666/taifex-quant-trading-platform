# Facebook Growth Operations Strategy

## 1. Purpose

This strategy turns Facebook into a high-frequency but compliance-safe growth channel for the Web App Interactive Demo and official website. The goal is to recruit qualified users, increase product awareness, expand market penetration, and route interested users into a browser-only Paper Trading research experience.

The system prepares content, daily queues, checklists, UTM links, and manual publishing packs. It does not log in to Facebook, publish posts, automate engagement, scrape Facebook, collect credentials, or enable live trading.

Core positioning:

```text
台指期資料分析與 Paper Trading 研究平台
Browser-only Interactive Demo
Paper Only
不構成投資建議
ENABLE_LIVE_TRADING=false
```

Primary links:

- Web App: <https://taifex-quant-trading-platform-front.vercel.app/?lang=zh>
- Official Website: <https://taifex-quant-trading-platform-website-7rf8yy2zd.vercel.app/zh/>
- Facebook Group: <https://www.facebook.com/groups/1323940496297459>
- Facebook Page: <https://www.facebook.com/profile.php?id=61589020471520>

## 2. Channel Roles

| Channel | Role | Primary CTA |
| --- | --- | --- |
| Facebook Page | Public education, product updates, short demo clips, website traffic. | 查看官網 / 開啟 Web App Demo |
| Facebook Group | Moderated discussion, polls, research tasks, feedback collection, community retention. | 加入研究社群 / 留言取得 Checklist |
| Related topic groups | Manual, rule-reviewed educational distribution only. No repeated copy-paste promotion. | 查看教學 / 加入討論 if allowed |
| Web App | Browser-only Interactive Demo for market data, mock strategy, Paper Only order simulation, OMS timeline, simulated PnL, and evidence JSON. | 完成 Demo |
| Official website | Trust-building, positioning, feature explanation, compliance boundaries, and product routing. | 了解平台 / 預約 Demo |

## 3. Growth Funnel

```text
Social post
-> official website
-> Web App Interactive Demo
-> community / waitlist / interview / long-term user
```

The funnel must keep the user expectation clear: this is a Paper Trading research platform and browser-only demo path, not a production trading product.

## 4. Target Audiences

| Audience | Pain point | Message angle |
| --- | --- | --- |
| General investors | Unsure how TX / MTX / TMF exposure differs. | Learn futures workflow basics safely. |
| Strategy researchers | Research artifacts are hard to reproduce. | Standardize data, signals, backtests, and evidence. |
| Quant developers | Scripts lack workflow boundaries. | Separate StrategySignal, Risk Engine, OMS, and broker gateway. |
| Professional traders | Paper testing and review trails are fragmented. | Review paper workflow, risk checks, OMS timeline, and audit evidence. |
| Enterprise / broker / fintech partners | Need infrastructure and governance story. | Trading OS architecture, safety boundary, and hosted SaaS roadmap. |

## 5. Daily Publishing Model

- Publish 4 to 6 posts per day across Page and Group.
- Do not copy-paste identical posts across channels.
- Each post must have a distinct angle: education, demo, risk, data, community, case study, or recap.
- Each post must use one CTA only.
- Related groups require manual rule review before posting.
- Do not create artificial engagement instructions or ask users to mass-share.
- Every Demo-related post must mention Paper Only or 不構成投資建議.

## 6. Weekly Content Mix

| Mix | Category | Examples |
| --- | --- | --- |
| 40% | Education | TX / MTX / TMF exposure, data governance, strategy boundaries. |
| 20% | Web App demo | Browser-only market tick, mock strategy, Paper Only order, evidence JSON. |
| 15% | Risk / OMS / safety | Risk Engine checks, OMS lifecycle, Broker Gateway isolation. |
| 15% | Data / rollover / backtest | Rollover separation, data versioning, reproducibility. |
| 10% | Community interaction | Polls, Q&A prompts, research tasks, feedback requests. |

## 7. Cross-Posting Policy

- Own Page and own Group are primary channels.
- Third-party groups require manual rule review before any post.
- Do not post in groups where promotional posts are prohibited.
- Avoid posting identical content everywhere.
- Vary hook, body, CTA, and visual for each destination.
- Page posts should be public and polished.
- Group posts should invite discussion and feedback.
- Related group posts should be educational first and promotional only if rules allow.

## 8. CTA Framework

Use one CTA per post:

- 開啟 Web App Demo
- 查看官網
- 加入研究社群
- 留言取得 Checklist
- 預約 Demo

Recommended UTM pattern:

```text
?utm_source=facebook&utm_medium=social&utm_campaign=fb_growth_30d&utm_content=<post_id>
```

## 9. Compliance Guardrails

Allowed framing:

- Paper Only
- 不構成投資建議
- ENABLE_LIVE_TRADING=false
- 本社群不喊單、不代操、不提供投資建議
- 內容僅供研究、教育與系統開發討論
- Browser-only Interactive Demo
- 不連券商、不收憑證、不建立真實委託

Do not use posts to provide individualized trading advice, futures advisory service, managed account service, copy trading, signal subscription, broker login, credential collection, or production trading readiness claims.

## 10. 30-Day Operating Cadence

| Week | Operating focus |
| --- | --- |
| Week 1 | Launch Page/Group rhythm, education basics, first Web App demo clips. |
| Week 2 | Data, rollover, backtest reproducibility, evidence JSON education. |
| Week 3 | Paper Trading, Risk Engine, OMS lifecycle, safety boundary content. |
| Week 4 | Customer trial push, feedback collection, weekly recap, demo request routing. |

Daily rhythm:

1. Generate daily pack.
2. Review compliance.
3. Publish Page posts manually.
4. Publish Group posts manually.
5. Adapt any related-group post after checking rules.
6. Log URLs and metrics.
7. Collect comments into product feedback categories.

## 11. 90-Day Growth Targets

Targets are directional and should be reviewed weekly:

- Build a steady Page publishing rhythm.
- Convert education readers into Web App demo users.
- Grow the Facebook Group with qualified researchers.
- Collect repeatable feedback from demo users.
- Identify 10 to 20 interview candidates.
- Convert qualified prospects into customer evaluation calls.
- Validate which content pillars produce demo starts and evidence copies.

Do not use trading results, realized profit, or user account performance as growth targets.

## 12. Metrics And Review Process

Track:

- impressions
- reach
- reactions
- comments
- shares
- link clicks
- Web App sessions
- demo_start
- demo_complete
- evidence_copy
- group_join
- waitlist_signup
- demo_request
- post conversion rate

Weekly review:

1. Identify top posts by link click and qualified comment.
2. Classify feedback into UX, missing guidance, demo runtime issue, product request, safety boundary question, or out-of-scope live trading.
3. Convert repeated questions into next week's education posts.
4. Remove unsafe or unclear language from future posts.
5. Update the content queue and daily templates.

## 13. Daily Operator Checklist

- [ ] Run `make social-content-check`.
- [ ] Run `make social-daily-pack`.
- [ ] Open the daily pack.
- [ ] Open Facebook Page and Group manually.
- [ ] Confirm every post has one CTA.
- [ ] Confirm every Demo post says Paper Only or 不構成投資建議.
- [ ] Confirm no broker credentials, live trading claims, or real order language appear.
- [ ] Publish manually.
- [ ] Record published URL in `data/social/facebook-published-log.csv`.
- [ ] Reply to comments using safe educational wording.
- [ ] Escalate unsafe requests and remove posts/comments if needed.

Facebook publishing is a public external action. The authorized account owner must manually review and publish every post.

Live trading remains disabled by default.
