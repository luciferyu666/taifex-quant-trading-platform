# Browser-only Mock Demo Runtime

This document defines the first browser-only interactive demo runtime for the
Web Command Center. The goal is to let customers open the production Web App and
operate a complete mock workflow without installing a local backend, connecting a
broker, reading local SQLite, or depending on any external market data source.

## Scope

The browser-only runtime lives in the frontend:

- `frontend/app/components/browserOnlyMockRuntime.ts`
- `frontend/app/components/BrowserOnlyMockDemoGuide.tsx`
- `frontend/app/components/BrowserOnlyMockDemoPanel.tsx`

It runs entirely in the browser and uses only local React state plus
`localStorage` for the current demo session.

The visualization layer lives in:

- `frontend/app/components/BrowserOnlyMockVisualizationPanel.tsx`
- `frontend/app/components/MarketRealismVisualizationPanel.tsx`

## Interactive Flow

The Web Command Center panel supports:

1. Generate next deterministic TX / MTX / TMF tick.
2. Run a signal-only mock strategy.
3. Simulate a Paper Only order.
4. Inspect the simulated Risk Engine result.
5. Inspect the simulated OMS lifecycle.
6. Inspect paper-only position, equity, and simulated PnL.
7. Reset the browser demo session.

## Information Architecture Alignment

The production Web App now includes a product value alignment panel before the
guided demo. It explains the first-stage positioning as a Taiwan index futures
data analysis and Paper Trading research platform, then maps each surface to a
specific user benefit:

- Market Data Lab: understand TX / MTX / TMF quote data and exposure context.
- Strategy Research: validate signal logic without creating orders directly.
- Paper Trading Simulator: experience a simulated order workflow without broker
  connectivity.
- Portfolio Review: connect simulated paper actions to position and PnL changes.
- Evidence Center: copy session metadata and evidence JSON for reviewer notes.

The detailed IA contract is maintained in
[interactive-demo-information-architecture.md](interactive-demo-information-architecture.md).

## Workflow Standardization Learning Layer

The production Web App also includes a `WorkflowStandardizationPanel` before the
customer demo tour. It turns
[quant-workflow-standardization.md](quant-workflow-standardization.md) into a
read-only learning layer inside the Command Center.

The panel maps the interactive browser demo to the standard workflow:

| Standardized workflow item | Browser demo touchpoint |
| --- | --- |
| Data standardization | Generate market tick. |
| StrategySignal standardization | Run mock strategy. |
| Backtest reproducibility | Inspect session id, deterministic seed, and evidence JSON. |
| Rollover data separation | Review TX / MTX / TMF contract context. |
| PaperOrderIntent flow | Simulate Paper Only order. |
| Risk Engine checks | Review risk approval result. |
| OMS lifecycle | Review OMS timeline. |
| Audit evidence | Copy demo summary or evidence JSON. |

This layer is product education only. It does not fetch backend data, write
databases, upload evidence, call brokers, create orders, collect credentials,
provide investment advice, or approve production trading.

## Guided UX Completion

The Browser-only Mock Demo now includes a guided stepper so a customer can
operate the flow without a local backend runbook:

1. Generate market tick.
2. Run mock strategy.
3. Simulate Paper Only order.
4. Review simulated OMS timeline.
5. Review simulated position / PnL.
6. Reset demo session.

Each step shows:

- the next operation button
- expected result
- safety boundary
- next-step guidance

The panel also exposes:

- browser-local `session_id`
- deterministic mock data seed
- `localStorage` key
- browser-only visualization layer
- clear browser state action
- copy demo summary action
- copy browser-only evidence JSON action
- market regime, spread, liquidity, quote age, and deterministic slippage
- fill reason for filled, partial, stale quote reject, and illiquid reject
- market realism visualization for regime sequence, quote quality, fill reason,
  and paper PnL context

The copied evidence is for reviewer notes only. It is not uploaded, persisted to
a backend, written to a database, or treated as a broker confirmation,
performance report, investment advice, or live-trading approval.

The evidence JSON also includes `market_realism` metadata:

- selected quote snapshot
- latest order realism metadata
- deterministic fill model id
- supported regimes
- `external_market_data_downloaded=false`
- `production_execution_model=false`

## Automatic Entry Behavior

The Web Command Center opens the `Paper OMS` tab first. The Browser-only Mock
Demo panel is mounted as the first surface in that tab, so a customer entering
the production Web App immediately sees the guided stepper before any local
backend, SQLite, approval queue, OMS audit, or hosted-readiness panels.

This automatic entry path is intentionally browser-only:

- it does not start a local backend
- it does not read local SQLite
- it does not call hosted paper APIs
- it does not create paper approval records
- it does not call Risk / OMS / Broker Gateway backend paths
- it does not collect credentials
- it does not connect brokers
- it does not create real orders

## Simulated Capabilities

Market data:

- TX / MTX / TMF deterministic price path
- market regime: `normal`, `trending`, `volatile`, `illiquid`,
  `stale_quote`
- bid / ask / last
- dynamic spread
- quote age
- quote size
- local liquidity score
- deterministic volatility path
- deterministic slippage estimate
- no external market data download

Strategy simulation:

- emits `StrategySignal`
- keeps `signals_only=true`
- does not create an order directly
- does not call a broker SDK
- does not provide investment advice

Paper order simulation:

- creates a browser-local `PaperOrderIntent` representation
- evaluates paper-only risk guardrails
- advances a simulated OMS lifecycle
- applies a deterministic browser-only fill / partial fill / reject model
  based on spread, liquidity, quote age, and slippage estimate
- never creates a real order

Portfolio simulation:

- position contracts
- TX-equivalent position
- average price
- mark price
- unrealized PnL
- realized PnL placeholder
- paper-only account equity

## Market Realism Layer

The demo now includes a deterministic market realism layer. It is designed to
make the browser-only experience more credible without connecting external
market data, a broker, or any hosted execution path.

The runtime cycles through five local regimes:

| Regime | Demo behavior |
| --- | --- |
| `normal` | Narrower spread, healthier bid / ask size, low quote age. |
| `trending` | Directional deterministic price path and moderate spread. |
| `volatile` | Wider spread, higher volatility path, lower liquidity score. |
| `illiquid` | Very low liquidity score and limited bid / ask size. |
| `stale_quote` | Quote age exceeds the paper risk threshold and is rejected. |

Every quote snapshot includes:

- `market_regime`
- `spread_points`
- `bid_size`
- `ask_size`
- `quote_age_seconds`
- `liquidity_score`
- `volatility_points`
- `slippage_points_estimate`

The paper fill model is deterministic and intentionally conservative:

- fills when the selected side has sufficient local quote size
- partially fills when bid / ask size is smaller than order quantity
- rejects stale quote snapshots
- rejects illiquid snapshots
- estimates fill price from the spread plus deterministic slippage
- records a fill reason in the OMS timeline and evidence JSON

This is not a market-matching engine, exchange replay, broker execution report
model, or performance simulation. It is a product demo layer for showing how
spread, liquidity, quote age, and slippage can affect a paper-only workflow.

## Market Realism Visualization Layer

The Web App now separates the market realism explanation into a dedicated
visualization panel:

- market regime timeline across the deterministic lookback window
- regime legend for `normal`, `trending`, `volatile`, `illiquid`, and
  `stale_quote`
- quote quality meters for spread, liquidity score, quote age, and slippage
  estimate
- bid size, ask size, and volatility path context
- fill explanation for `FILLED`, `PARTIALLY_FILLED`, or `REJECTED` paper order
  outcomes
- paper-only position and mark-to-market context
- safety badges for Browser-only, Paper Only, no external market data, no
  broker, no real order, no credentials, and not investment advice

The intent is to make the demo easier to understand at the moment of operation:
customers can see how a changing market regime affects quote quality and why the
paper fill model produced a fill, partial fill, stale quote reject, or illiquid
reject result. The panel remains deterministic and browser-only. It does not
download market data, call a backend, write a database, call a broker, collect
credentials, create a real order, provide investment advice, or make a
performance claim.

## Visualization Layer

The Web App now renders the browser-only demo as a visual workflow, not just a
table of values.

The visualization layer shows:

- deterministic price path line
- bid / ask band
- market regime strip
- spread bar
- liquidity score bar
- quote age bar
- slippage estimate bar
- paper order outcome rail
- fill / partial / reject reason
- paper position and simulated PnL snapshot

The visualization layer uses only `buildBrowserOnlyVisualizationData(...)` from
the browser-only runtime. It does not fetch a backend, call hosted APIs, read
local SQLite, write a database, download market data, connect to a broker,
collect credentials, create a real order, or provide investment advice.

The purpose is product comprehension: customers can see how market state,
liquidity, spread, quote age, and slippage affect a Paper Only workflow while
remaining in a deterministic mock environment.

## Production Vercel Behavior

This runtime is designed for browser-only customer evaluation. It does not
require:

- local FastAPI
- local SQLite
- hosted backend API
- hosted datastore
- customer login
- broker login
- credentials

The separate local backend / SQLite demo path remains useful for paper OMS audit
record persistence, but it is no longer required for this first interactive mock
product walkthrough.

## Safety Boundary

Required flags:

```text
paper_only=true
browser_only=true
mock_backend=true
deterministic_data=true
live_trading_enabled=false
broker_api_called=false
external_market_data_downloaded=false
real_order_created=false
credentials_collected=false
production_trading_ready=false
investment_advice=false
database_written=false
performance_claim=false
```

The runtime is explicitly:

- Paper Only.
- Browser-only.
- No backend required.
- No broker.
- No real money.
- No external market data.
- No credentials.
- No production database writes.
- No real orders.
- No live trading.
- Not investment advice.
- Not a performance claim.
- Not production trading ready.

## Validation

Run:

```bash
make browser-only-mock-demo-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

Live trading remains disabled by default.
