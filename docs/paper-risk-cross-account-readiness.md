# Paper Risk Cross-Account Readiness Boundary

## Purpose

This document defines the boundary between the current paper-only Risk Engine
guardrails and a future formal cross-account risk system.

Paper Risk Engine guardrails are not a cross-account risk system. The current
implementation uses local paper state for demo and engineering review. It does
not aggregate real customer accounts, broker positions, margin, equity, PnL,
orders, or fills.

Live trading remains disabled by default.

## Current Scope

- Paper-only guardrail evaluation for local simulation workflows.
- Local in-memory paper risk state for demo and engineering checks.
- Single-account style paper state snapshot in the current Web Command Center.
- RiskEvaluation detail output for explainable paper-only checks.
- Local duplicate idempotency key checks inside paper evaluation state.

## Read-Only API

```text
GET /api/paper-risk/cross-account-readiness
```

The endpoint returns:

- `readiness_state=local_paper_risk_state_not_cross_account_risk_system`
- `local_paper_guardrails_enabled=true`
- `local_paper_state_enabled=true`
- `single_account_demo_state_enabled=true`
- `cross_account_aggregation_enabled=false`
- `account_hierarchy_enabled=false`
- `tenant_isolated_risk_state_enabled=false`
- `real_account_margin_feed_enabled=false`
- `broker_position_feed_enabled=false`
- `centralized_risk_limits_enabled=false`
- `distributed_kill_switch_enabled=false`
- `durable_risk_state_store_enabled=false`
- `real_time_equity_pnl_tracking_enabled=false`
- `production_cross_account_risk_system=false`

The endpoint is read-only metadata. It does not create orders, write databases,
load real account data, call brokers, collect credentials, grant production
risk approval, or enable live trading.

## Missing For Cross-Account Risk

- Tenant and account hierarchy with enforced isolation.
- Cross-account exposure aggregation by customer, strategy, symbol, and
  contract.
- Per-account and group-level risk limit registry.
- Real account margin, equity, cash, PnL, order, fill, and position feeds.
- Broker-side position and order reconciliation per account.
- Centralized durable risk state store with replay and recovery.
- Distributed kill switch propagation across accounts and strategy runners.
- Formal RBAC/ABAC policy for risk administrators and reviewers.
- Operational monitoring, alerting, escalation, and incident runbooks.

## Required Before Cross-Account Risk

- Define tenant, account, portfolio, strategy, and reviewer identity model.
- Design account-scoped and group-scoped risk limit schemas.
- Select reviewed durable storage for cross-account risk state.
- Integrate broker/account feeds behind broker-gateway with credential
  isolation.
- Implement reconciliation between platform state, broker state, and risk state.
- Implement audited risk-limit change workflow with reviewer roles.
- Add failure, replay, stale-state, duplicate, and concurrency tests.
- Complete security, operations, legal, and compliance review before hosted use.

## Web Command Center Boundary

The Web Command Center may show cross-account risk readiness as a read-only
panel. It must not:

- create orders,
- write databases,
- call Risk Engine mutation endpoints,
- call OMS or Broker Gateway execution paths,
- load real account data,
- call broker APIs,
- collect broker credentials,
- grant paper execution or live approval,
- claim production risk readiness.

## Acceptance Criteria

- The API returns `production_cross_account_risk_system=false`.
- The UI explicitly states that paper risk state is local and not
  cross-account risk.
- Safety defaults remain:
  - `TRADING_MODE=paper`
  - `ENABLE_LIVE_TRADING=false`
  - `BROKER_PROVIDER=paper`
- CI checks confirm the API, UI panel, docs, and safety copy exist.

## Validation

```bash
make paper-risk-cross-account-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_paper_risk_cross_account_readiness_routes.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```
