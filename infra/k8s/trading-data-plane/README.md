# Trading/Data Plane Kubernetes Placeholders

These files describe future Kubernetes boundaries for the Trading/Data Plane. They are placeholders only and must not be deployed without architecture, security, and operations review.

## Purpose

The Trading/Data Plane owns high-priority runtime workflows: market data, strategy runners, Risk Engine, OMS, Broker Gateway, reconciliation, and trading state.

## Boundary Rules

- Strategies emit signals only.
- Risk Engine must approve before OMS/Broker Gateway.
- Broker SDK calls are forbidden outside Broker Gateway.
- Current implementation is paper-only.
- Paper, shadow, and future live environments must be separated by namespace, credentials, database instance, and network boundary.

## Future Direction

- Dedicated namespace.
- Strict network policies.
- Separate service accounts.
- Broker Gateway credential isolation.
- Event and audit stream isolation.

## Status

Placeholder-only. No production images, secrets, broker SDK calls, or live trading configuration.
