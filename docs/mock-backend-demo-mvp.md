# Mock Backend Demo MVP

This document defines the first safe Mock Backend Demo MVP slice for the Web
Command Center. The goal is to let users operate a complete product demo before
any real broker, real market data, hosted customer account, or live trading path
exists.

## Scope

The mock backend provides deterministic local demo data and paper-only simulated
workflow responses:

- `GET /api/mock-backend/status`
- `GET /api/mock-backend/market-data/preview`
- `POST /api/mock-backend/strategy/run`
- `POST /api/mock-backend/order/simulate`
- `GET /api/mock-backend/demo-session`
- `POST /api/mock-backend/demo-session/reset`

## Simulated Capabilities

Market data:

- TX / MTX / TMF deterministic price path
- bid / ask / last
- quote age
- local liquidity score
- no external market data download

Strategy simulation:

- emits `StrategySignal`
- keeps `signals_only=true`
- does not create a real order
- does not call Risk Engine, OMS, or Broker Gateway directly from the strategy

Paper order simulation:

- builds a platform-owned `PaperOrderIntent`
- evaluates the intent through the paper Risk Engine
- advances the OMS lifecycle in memory
- uses the paper broker gateway with deterministic / local quote-based simulated
  outcomes
- returns an OMS timeline and paper-only portfolio summary

Portfolio simulation:

- position contracts
- TX-equivalent position
- average price
- mark price
- unrealized PnL
- realized PnL placeholder
- paper-only account equity summary

## Web Command Center

The `MockBackendDemoPanel` provides a safe interactive flow:

1. Generate next tick.
2. Run mock strategy.
3. Simulate paper order.
4. Reset demo session.

The panel displays:

- deterministic market data
- generated signal
- paper order status
- OMS timeline
- paper portfolio state
- safety flags
- warning copy

For customers who should not install a local backend, the browser-only runtime is
documented separately in `docs/browser-only-mock-demo-runtime.md`. It provides
the same first-pass product walkthrough entirely in the browser with local
state/localStorage and no backend dependency.

## Safety Boundary

This MVP is explicitly not a trading system:

- Paper Only.
- Mock Backend only.
- No broker.
- No real money.
- No external market data.
- No credentials.
- No production database writes.
- No real orders.
- No live trading.
- Not investment advice.
- No profitability claim.

Required flags:

```text
paper_only=true
mock_backend=true
deterministic_data=true
live_trading_enabled=false
broker_api_called=false
external_market_data_downloaded=false
real_order_created=false
credentials_collected=false
production_trading_ready=false
investment_advice=false
```

## Validation

Run:

```bash
make mock-backend-demo-check
cd backend && .venv/bin/python -m pytest tests/test_mock_backend_routes.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

Live trading remains disabled by default.
