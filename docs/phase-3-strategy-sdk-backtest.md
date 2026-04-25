# Phase 3: Strategy SDK and Backtest

## Objective

Create a signal-only Strategy SDK and paper-safe backtest foundation.

## Deliverables

- Strategy signal model.
- Base strategy class.
- Example strategy that emits a signal-like object.
- Documentation that prohibits broker access from strategies.

## Acceptance Criteria

- Strategy code emits target exposure signals only.
- No order placement API exists in the SDK.
- No broker SDK import exists under `strategy-engine/`.

## Safety Constraints

- Strategies must never call broker SDKs directly.
- Strategies must not create orders.
- Strategies must not manage account credentials.

## Suggested Commands

```bash
python -m compileall strategy-engine/sdk
cd backend && pytest
make check
```

## Next Implementation Notes

Future backtest work should bind each result to strategy version, data version, and parameter set.
