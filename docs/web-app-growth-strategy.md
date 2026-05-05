# Web App Growth Strategy

## Purpose

This document defines the four-entry growth strategy for the current public
surfaces:

- Web App / Web Command Center:
  <https://taifex-quant-trading-platform-front.vercel.app/?lang=zh>
- Marketing website:
  <https://taifex-quant-trading-platform-websi.vercel.app/zh/>
- Facebook Group: `台指期量化交易研究社`
- Facebook Page: `台指期量化交易平台`

The growth motion is product-led and education-led: the website and Facebook
channels build trust, the Web App lets users complete a browser-only Interactive
Demo, and the Facebook Group turns questions and feedback into the next content
and product iteration.

The positioning must remain:

```text
台指期策略研究、回測、換月資料、Paper Trading 與風控流程的標準化平台。
```

This is not a signal service, brokerage product, managed account service, or
production trading platform. Live trading remains disabled by default.

## Core Positioning

The platform should be presented as Taiwan futures quant infrastructure, not as
an outcome promise. The commercial message is:

```text
Standardize the research, data, backtest, rollover, Paper Trading, Risk Engine,
OMS, and audit workflow for TX / MTX / TMF before any future live-trading path.
```

This positioning supports three audience groups:

| Audience | Need | Message |
| --- | --- | --- |
| General investors | Learn the workflow safely | Start with a Paper Only demo; no broker, no real money, no real order. |
| Strategy researchers | Standardize research and validation | Use reproducible data, StrategySignal, backtest metadata, rollover separation, and evidence artifacts. |
| Professional teams / institutions | Govern execution workflow | Strategies emit signals only; platform boundaries handle Risk Engine, OMS, Broker Gateway isolation, and audit review. |

## Four Entry Roles

### 1. Marketing Website: Trust And Conversion

The website explains:

- what the platform is
- what problem it solves
- why the safety boundary is credible
- what the visitor should do next

Primary CTA:

```text
Start the 3-minute Paper-first Demo
```

Secondary CTAs:

- Join the Facebook research group.
- Review the Paper Trading checklist.
- Request a product conversation.

The website should route visitors to the Web App Interactive Demo rather than
implying account opening, broker login, or live order capability.

### 2. Web App: Activation

The Web App is the activation surface. A successful activation is not just a
page view; it is the moment a user completes the browser-only demo and
understands:

```text
StrategySignal -> PaperOrderIntent -> Risk Engine -> OMS -> Paper Broker simulation -> Evidence
```

Current activation flow:

1. Confirm Paper Only safety defaults.
2. Generate deterministic mock TX / MTX / TMF market data.
3. Run a mock strategy and inspect the StrategySignal.
4. Simulate a Paper Only order.
5. Review OMS timeline and simulated position / PnL.
6. Copy demo summary or evidence JSON.

The Web App must keep these safety facts visible:

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- Browser-only mock data where applicable
- no broker call
- no real order
- no credentials
- not investment advice
- Production Trading Platform: `NOT READY`

### 3. Facebook Page: Public Exposure

The Facebook Page is the public education and announcement channel.

Recommended content:

- TX / MTX / TMF exposure explainers
- short Web App demo clips
- rollover and backtest education
- Paper Only workflow updates
- monthly livestream announcements

Safe CTA examples:

- Open the Paper-first demo.
- Read the workflow guide.
- Join the research group.

The page must not be used for individualized trade recommendations, broker
credential collection, real account onboarding, live order instructions, or
performance claims.

### 4. Facebook Group: Retention And Feedback

The Facebook Group is the moderated discussion and feedback loop.

Recommended weekly rhythm:

- Monday: research topic of the week
- Wednesday: Web App demo task
- Friday: Q&A summary
- Monthly: online walkthrough or livestream

The group should remain a research community, not an order room or signal room.
Use the safety rules in
[`facebook-community-launch-plan.md`](facebook-community-launch-plan.md) and
[`facebook-human-launch-runbook.md`](facebook-human-launch-runbook.md).

## Audience Acquisition Paths

| Audience | Entry content | Next action | Product proof |
| --- | --- | --- | --- |
| General investors | Paper Trading basics, TX / MTX / TMF exposure | Web App 3-minute demo | Safety defaults and browser-only order simulation |
| Strategy researchers | rollover, data quality, backtest reproducibility | Workflow Standardization panel | StrategySignal, evidence JSON, reproducibility seed |
| Professional traders | Risk Engine, OMS, idempotency, audit | Paper OMS / audit viewer | OMS lifecycle, risk checks, paper-only evidence |
| Enterprises / brokers / FinTech | Trading OS, control plane, audit, RBAC roadmap | Product conversation | Hosted Paper readiness contracts and safety boundary |

## Activation Metrics

Track product understanding, not trading outcomes:

- Web App visits
- Demo start rate
- demo step completion
- mock strategy run rate
- Paper Only order simulation rate
- OMS timeline view rate
- evidence JSON copy rate
- customer feedback submission rate
- Facebook Group join rate from demo traffic
- product conversation requests

Do not use realized trading results, customer account screenshots, claimed
returns, or user PnL as growth metrics.

## Growth Loops

### Loop 1: Education -> Demo -> Group Discussion -> New Content

```text
Facebook explainer
-> Website article
-> Web App Interactive Demo
-> Group question
-> New explainer / demo task
-> More Web App users
```

Example:

```text
TX / MTX / TMF exposure post
-> Web App Paper Only workflow
-> Group question about TX-equivalent sizing
-> New content on allocator discipline
```

### Loop 2: Free Checklist -> Trial -> Interview -> Product Improvement

Lead magnets:

- TX / MTX / TMF exposure checklist
- Paper Trading acceptance checklist
- rollover backtest checklist
- OMS duplicate-order prevention checklist

Flow:

```text
Checklist download
-> Web App trial
-> feedback workflow
-> product improvement
-> release note / demo update
```

### Loop 3: Group Poll -> Product Demo -> Short Video

Use moderated polls to identify friction:

- data and rollover
- backtest reproducibility
- Paper Trading
- Risk Engine / OMS
- hosted paper SaaS readiness

The highest-friction topic should become the next education post, demo clip, and
Web App guidance improvement.

## Content Map

| Funnel layer | Topics |
| --- | --- |
| New user education | What is Taiwan futures quant research? What is Paper Trading? Why start without broker connectivity? |
| Research workflow | rollover handling, data versions, backtest reproducibility, StrategySignal boundaries |
| Paper workflow | PaperOrderIntent, Risk Engine, OMS lifecycle, simulated fills, evidence JSON |
| Professional operations | idempotency, audit trail, broker gateway isolation, paper-to-shadow-to-live readiness |
| Enterprise readiness | control plane / trading plane separation, RBAC/ABAC roadmap, WORM readiness, hosted paper SaaS boundary |

## 90-Day Execution Plan

### Days 1-30: Foundation Funnel

- Add clear "Start 3-minute Paper-first Demo" entry points from website and
  social content.
- Keep Web App default entry focused on browser-only Interactive Demo.
- Publish weekly Facebook education posts and Paper Only demo clips.
- Collect customer feedback through
  [`customer-trial-feedback-workflow.md`](customer-trial-feedback-workflow.md).

Target health indicators:

- users can find the demo without engineer assistance
- users can complete the browser-only flow
- users can explain why StrategySignal and execution workflow are separated
- users can identify the safety boundary

### Days 31-60: Content And Community Loop

- Publish SEO and social content around rollover, exposure, backtest discipline,
  Paper Trading, Risk Engine, and OMS.
- Turn Facebook Group questions into new docs, posts, and demo guidance.
- Refine Web App copy based on customer feedback categories.

### Days 61-90: Early Access Discovery

- Invite qualified researchers and professional users to guided trial sessions.
- Use evidence JSON and customer feedback forms for structured review.
- Separate product requests from out-of-scope broker/live/credential requests.
- Prepare hosted paper SaaS discovery without enabling production trading.

## Safe Growth Copy Rules

Allowed language:

- education
- research workflow
- Paper Only demo
- deterministic mock data
- strategy signal standardization
- risk and OMS governance
- evidence and audit review
- product trial / product conversation

Disallowed positioning:

- profit promise
- risk-minimizing claims
- individualized trade instruction
- broker account onboarding
- credential collection
- copy-trading claims
- managed account claims
- live trading approval
- production trading readiness

Standard safety footer:

```text
This content is for education and product demonstration only. It is not
investment advice. The current Web App is Paper Only / browser-only demo where
applicable. ENABLE_LIVE_TRADING=false. Live trading remains disabled by default.
```

## Immediate Operating Checklist

1. Route website and Facebook traffic to the Web App Interactive Demo.
2. Keep the first Web App experience focused on the Paper Only browser demo.
3. Use Facebook Page for public education and release updates.
4. Use Facebook Group for moderated questions, polls, and customer feedback.
5. Review every public post against the safety rules before publishing.
6. Track activation and feedback metrics, not trading outcomes.
7. Convert repeated customer questions into docs, Web App guidance, and safe
   social posts.

Live trading remains disabled by default.
