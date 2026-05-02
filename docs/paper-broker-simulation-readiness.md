# Paper Broker Simulation Readiness Boundary

## Purpose

This document defines the boundary between the current Paper Broker Gateway
simulation and a future production execution model.

Paper broker simulation is not market matching. Paper fills are simulated
metadata only, not broker execution reports, real market fills, certified
liquidity modeling, or production execution readiness.

Live trading remains disabled by default.

## Current Scope

- Deterministic `broker_simulation` outcomes for paper workflow tests.
- Caller-provided local quote snapshot preview.
- Paper-only simulated acknowledgement, rejection, partial fill, fill, and
  cancellation outcomes.
- Local evidence export and local JSON evidence viewer for paper simulation
  previews.

## Read-Only API

```text
GET /api/paper-execution/broker-simulation/readiness
```

The endpoint returns:

- `readiness_state=local_paper_simulation_not_market_matching_or_broker_execution`
- `real_market_matching_engine_enabled=false`
- `exchange_order_book_replay_enabled=false`
- `broker_execution_report_model_enabled=false`
- `latency_queue_position_model_enabled=false`
- `slippage_liquidity_calibration_enabled=false`
- `real_account_reconciliation_enabled=false`
- `production_execution_model=false`

The endpoint is read-only metadata. It does not create orders, call Risk Engine,
call OMS, call Broker Gateway execution paths, write databases, download market
data, call brokers, collect credentials, or enable live trading.

## Missing For Production Execution Model

- Real market matching engine.
- Exchange order book replay.
- Broker execution report ingestion and normalization.
- Latency and queue position model.
- Slippage and liquidity calibration against historical or market data.
- Real account, order, fill, and position reconciliation.
- Broker-specific rejection, cancel, amend, and replace semantics.
- Operational monitoring and incident runbooks for execution simulation.

## Required Before Production Execution Model

- Define broker execution report schema behind broker-gateway.
- Define market data and order book replay sources with data licensing review.
- Design latency, queue position, slippage, and liquidity model assumptions.
- Add reconciliation loop between platform orders, simulated reports, and
  account state.
- Add failure, replay, duplicate, and recovery tests.
- Complete security, operations, legal, and compliance review before live use.

## Web Command Center Boundary

The Web Command Center may show broker simulation readiness as a read-only panel.
It must not:

- create orders,
- call Risk Engine,
- call OMS,
- call Broker Gateway execution paths,
- write databases,
- download external market data,
- call broker APIs,
- collect broker credentials,
- claim real fill accuracy,
- claim production execution readiness.

## Acceptance Criteria

- The API returns `production_execution_model=false`.
- The UI explicitly states that Paper Broker simulation is not market matching.
- Safety defaults remain:
  - `TRADING_MODE=paper`
  - `ENABLE_LIVE_TRADING=false`
  - `BROKER_PROVIDER=paper`
- CI checks confirm the API, UI panel, docs, and safety copy exist.

## Validation

```bash
make paper-broker-simulation-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_paper_broker_simulation_readiness_routes.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```
