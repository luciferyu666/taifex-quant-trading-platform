# Security and Governance

This document captures placeholder governance requirements for the cloud-native roadmap. It is not a production security certification.

## Current Baseline

- No secrets in source code.
- `.env` is ignored.
- `.env.example` contains safe fake defaults only.
- Live trading is disabled by default.
- Broker access is isolated behind `broker-gateway`.

## Future Controls

- Vault or cloud secrets manager.
- RBAC/ABAC.
- MFA for command-center users.
- Immutable audit log.
- OWASP ASVS-aligned web controls.
- Approval workflow for high-risk operations.

## High-Risk Feature Rule

Any future feature that can affect order generation, order routing, position state, risk limits, credentials, or broker connectivity must include dedicated safety documentation and tests.

## Suggested Checks

```bash
grep -n "ENABLE_LIVE_TRADING=false" .env.example
grep -n "BROKER_PROVIDER=paper" .env.example
make check
```
