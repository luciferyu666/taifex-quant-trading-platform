# Paper, Shadow, and Future Live Boundary

## Paper

Paper mode is the default and only executable mode in the current roadmap implementation.

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- PaperBrokerGateway returns simulated acknowledgements only.

## Shadow

Shadow trading is a future validation stage. It may observe live-like data and theoretical orders, but it must not submit broker-bound orders.

## Future Live

Future live trading is out of scope for Phase 0-6 implementation work. Phase 6 only defines readiness planning.

Future live work requires:
- Legal and compliance review.
- Explicit approval workflow.
- Real broker certification.
- Secrets management.
- Kill switch.
- Reconciliation.
- Monitoring.
- Incident response.

## Prohibited Current Behavior

- No real order submission.
- No broker credentials in source.
- No live order buttons.
- No strategy-level broker SDK calls.
