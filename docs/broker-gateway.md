# Broker Gateway

Broker Gateway is the only future boundary for broker SDK access. Current implementation exposes `PaperBrokerGateway` only.

## Current Scope

- Accept a risk-approved paper `OrderIntent`.
- Return a simulated acknowledgement.
- Never place real orders.
- Never import broker SDKs.

## Future Scope

- Broker-specific adapters.
- Credential injection from future secrets management.
- Broker heartbeat.
- Execution report normalization.
- Reconciliation inputs.

## Safety Rules

- Strategies must never call broker SDKs directly.
- Backend APIs must keep Risk Engine and OMS in the path.
- Live trading requires explicit future approval and additional controls.

## Validation

```bash
cd backend && pytest tests/test_roadmap_routes.py
```
