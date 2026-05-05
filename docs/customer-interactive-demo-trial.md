# Customer Interactive Demo Trial

## Purpose

This guide is the customer-facing trial entry point for the browser-only
Interactive Demo. It explains what a customer can test directly in the public
Web App, what value each function demonstrates, how to capture evidence, and
which boundaries remain in force.

The Interactive Demo is a Paper Only, browser-only product experience. It uses
deterministic mock market data and local browser state. It does not connect to a
broker, download real market data, write hosted records, collect credentials, or
create real orders.

## Production Web App

Open:

```text
https://taifex-quant-trading-platform-front.vercel.app
```

Recommended language views:

```text
https://taifex-quant-trading-platform-front.vercel.app/?lang=zh
https://taifex-quant-trading-platform-front.vercel.app/?lang=en
```

This Web App is one of four growth entry points documented in
[`web-app-growth-strategy.md`](web-app-growth-strategy.md):

- the marketing website builds trust and routes visitors to the demo
- the Web App provides browser-only Interactive Demo activation
- the Facebook Page provides public education and product updates
- the Facebook Group provides moderated discussion and feedback

The customer trial should therefore focus on completing the browser-only demo
and understanding the Paper Trading research workflow, not on live execution,
broker login, or account onboarding.

## Trial Positioning

The first-stage product positioning is:

```text
台指期資料分析與 Paper Trading 研究平台
Taiwan index futures data analysis and Paper Trading research platform
```

The customer should understand the trial as a research and simulation platform
for TX / MTX / TMF workflows, not as a production trading system.

## Demo Flow

Start with the Workflow Standardization panel, then run the flow in the Web
Command Center Paper OMS / Browser-only Demo section. The learning layer helps
customers connect each operation to the platform method in
`docs/quant-workflow-standardization.md`:

| Learning item | What the customer should understand |
| --- | --- |
| Data standardization | TX / MTX / TMF mock quotes need a common exposure language before strategy testing. |
| StrategySignal standardization | Strategies emit signals only; platform workflow owns paper intent, risk, OMS, and audit. |
| Backtest reproducibility | Session id, seed, and evidence JSON are used for reproducibility, not performance claims. |
| Rollover data separation | Research-only continuous data must remain separate from executable contract mapping. |
| PaperOrderIntent flow | Only the platform converts a signal into a Paper Only order intent. |
| Risk Engine checks | Risk checks explain accept/reject outcomes before any OMS transition. |
| OMS lifecycle | The timeline makes simulated order state visible and reviewable. |
| Audit evidence | Demo summary and evidence JSON support reviewer handoff and feedback classification. |

1. Generate market tick
   - Produces deterministic mock TX / MTX / TMF quote data.
   - Shows bid, ask, last, quote age, and repeatable market movement.

2. Run mock strategy
   - Produces a simulated `StrategySignal`.
   - Demonstrates how strategy research output is standardized before any order
     workflow exists.

3. Simulate Paper Only order
   - Converts the mock signal into a Paper Only simulated order path.
   - Demonstrates paper risk checks, OMS lifecycle, and simulated broker outcome.
   - Does not create a real order.

4. Review market realism visualization
   - Shows market regime, spread, liquidity score, quote age, slippage estimate,
     bid / ask size, and volatility path.
   - Explains why the Paper Only order filled, partially filled, or was rejected
     under the deterministic browser model.
   - Helps customers understand order outcome mechanics without relying on real
     market data or broker execution reports.

5. Review OMS timeline
   - Shows the simulated order lifecycle.
   - Helps customers understand acknowledgement, fill, partial fill, reject, and
     terminal order-state concepts.

6. Review simulated position / PnL
   - Shows paper-only position, average price, realized PnL, unrealized PnL, and
     account-style summary.
   - Values are simulated and are not investment performance.

7. Copy demo summary / evidence JSON
   - Copies a small local evidence payload for review or feedback.
   - Evidence is generated in the browser and is not uploaded automatically.

8. Reset demo session
   - Clears the demo flow and returns the browser state to the initial trial
     state.

## Feature To Benefit Mapping

| Feature | User benefit |
| --- | --- |
| Market Data Lab | Lets users inspect TX / MTX / TMF quote behavior and understand exposure units before testing a strategy. |
| Strategy Research | Shows how a strategy emits a standardized signal instead of directly creating orders. |
| Paper Trading Simulator | Lets users practice the signal-to-order workflow without real money or broker connectivity. |
| OMS Timeline | Makes order lifecycle states visible, so users can understand what happened after a simulated order. |
| Market Realism Visualization | Explains spread, liquidity, quote age, slippage, and fill reason so users can understand why a paper order filled, partially filled, or rejected. |
| Portfolio / PnL Review | Helps users see how simulated fills affect paper-only position and PnL state. |
| Evidence JSON | Provides a repeatable artifact for demo review, bug reports, and internal feedback. |
| Safety Flags | Keeps Paper Only, no broker, no live trading, and not investment advice boundaries visible. |

## QA Gates Already Passed

The latest verified Interactive Demo release passed:

- `make interactive-demo-conversion-check`
- `make frontend-production-smoke-check`
- `make frontend-i18n-check`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `make check`

The production conversion QA validates:

- Product positioning is visible.
- Feature to user benefit mapping is visible.
- Paper OMS / Browser-only Demo is discoverable.
- Generate market tick, Run mock strategy, Simulate paper order, Copy demo
  summary, and Copy evidence JSON controls are present.
- English and Traditional Chinese copy are present.
- Safety copy remains present.
- Prohibited profit and safety-minimizing claims are absent.

## Known Limits

- Browser-only mock data only.
- Deterministic mock price path, not real market data.
- No external market data download.
- No broker SDK call.
- No broker login.
- No credential upload.
- No real account data.
- No real order creation.
- No hosted datastore write.
- No customer account or tenant login.
- No production OMS.
- No production WORM audit ledger.
- No investment advice.
- No performance claim.
- Production Trading Platform remains NOT READY.

## Customer Feedback Checklist

Ask the customer to report:

- Did the page clearly explain that this is Paper Only / Mock Backend / Browser
  only?
- Could the customer find the interactive demo without engineer assistance?
- Could the customer complete Generate market tick -> Run mock strategy ->
  Simulate Paper Only order -> Review OMS timeline -> Review simulated position /
  PnL?
- Did the feature to benefit mapping explain why each module exists?
- Did the safety flags prevent confusion with live trading?
- Was the copied demo summary or evidence JSON useful for feedback?
- Which workflow step was unclear?
- Which capability should be added next for a hosted paper SaaS trial?

Use [customer-trial-feedback-workflow.md](customer-trial-feedback-workflow.md)
to classify and review feedback. The workflow defines the accepted feedback
fields, internal review checklist, allowed categories, and out-of-scope handling
for broker/live/credential requests.

## Operator Notes

- Do not ask customers for broker credentials, API keys, account IDs,
  certificates, or secrets.
- Do not describe simulated PnL as profit, alpha, or performance.
- Do not imply that the demo is ready for live trading or broker execution.
- Do not present the browser-only demo as a hosted production paper trading
  backend.

Live trading remains disabled by default.
