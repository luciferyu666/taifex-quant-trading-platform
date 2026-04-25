# Risk Engine Specification

## Purpose

Risk Engine is the required gate before OMS and Broker Gateway. Current implementation is paper-only and rejects unsafe runtime configuration.

## Pre-Trade Rules

- Price reasonability.
- Max order size.
- Max position.
- Max TX-equivalent exposure.
- Stale quote.
- Margin proxy.
- Duplicate order prevention through idempotency keys.
- Paper broker only in current implementation.

## In-Trade Rules

- Equity threshold.
- Max daily loss.
- Broker heartbeat.
- Order rejection rate.
- Duplicate order monitoring.

## Post-Trade Rules

- Reconciliation.
- Realized/unrealized PnL.
- Audit trail.
- Performance attribution.

## Kill Switch Future Paths

Future kill switch paths should include Web UI, API, and CLI controls. Current implementation does not enable live trading and exposes only placeholder paper-safe behavior.

## Paper-Only Current Safety Posture

Defaults:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
MAX_TX_EQUIVALENT_EXPOSURE=0.25
MAX_DAILY_LOSS_TWD=5000
STALE_QUOTE_SECONDS=3
```

`backend/app/domain/risk_rules.py` rejects live trading, non-paper mode, non-paper broker provider, missing idempotency keys, excess exposure, and stale quotes.

## Acceptance Criteria

- Risk Engine rejects when live trading is enabled.
- Risk Engine rejects non-paper trading mode.
- Risk Engine rejects non-paper broker provider.
- Risk Engine rejects exposure above the configured limit.
- Risk Engine rejects stale quotes.
- No order is placed by Risk Engine.

## Validation

```bash
cd backend && pytest tests/test_risk_rules.py tests/test_architecture_routes.py
```
