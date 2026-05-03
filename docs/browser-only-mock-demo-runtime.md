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

## Interactive Flow

The Web Command Center panel supports:

1. Generate next deterministic TX / MTX / TMF tick.
2. Run a signal-only mock strategy.
3. Simulate a Paper Only order.
4. Inspect the simulated Risk Engine result.
5. Inspect the simulated OMS lifecycle.
6. Inspect paper-only position, equity, and simulated PnL.
7. Reset the browser demo session.

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
- clear browser state action
- copy demo summary action
- copy browser-only evidence JSON action

The copied evidence is for reviewer notes only. It is not uploaded, persisted to
a backend, written to a database, or treated as a broker confirmation,
performance report, investment advice, or live-trading approval.

## Simulated Capabilities

Market data:

- TX / MTX / TMF deterministic price path
- bid / ask / last
- quote age
- quote size
- local liquidity score
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
- never creates a real order

Portfolio simulation:

- position contracts
- TX-equivalent position
- average price
- mark price
- unrealized PnL
- realized PnL placeholder
- paper-only account equity

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
