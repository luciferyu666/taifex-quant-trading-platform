# Risk Engine

The Risk Engine is the required gate before OMS and Broker Gateway. Current implementation is paper-only.

## Current Scope

- Evaluate `OrderIntent` objects.
- Reject when live trading is enabled.
- Reject when requested TX-equivalent exposure exceeds `MAX_TX_EQUIVALENT_EXPOSURE`.
- Return structured `RiskDecision` results.

## Future Checks

- Price reasonability.
- Stale quote.
- Max order size.
- Max position.
- Margin proxy.
- Daily loss.
- Broker heartbeat.
- Duplicate order prevention.

## Safety Rules

- Strategies do not call Risk Engine to place orders.
- UI and scripts must not bypass Risk Engine.
- Live trading remains disabled by default.

## Validation

```bash
cd backend && pytest tests/test_risk_engine.py tests/test_roadmap_routes.py
```
