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
- Paper-only order intent flag.
- Platform-created paper intent metadata linking source signal, strategy version, and
  paper simulation approval ID.

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

`backend/app/domain/risk_rules.py` rejects live trading, non-paper mode, non-paper broker provider, missing idempotency keys, non-paper intents, excess exposure, and stale quotes.

The paper execution workflow creates `PaperOrderIntent` only after
`approved_for_paper_simulation`, then calls Risk Engine before OMS submission and
before Paper Broker Gateway simulation.

Completed paper workflow runs can be persisted to local SQLite for audit review after
Risk Engine evaluation. The persisted records are paper-only metadata and do not
represent broker orders, live orders, or production OMS records.

## Paper Risk Guardrail Expansion

The current paper-only risk layer now exposes expanded guardrails through
`backend/app/domain/risk_rules.py`, `backend/app/domain/paper_risk_state.py`, and
`GET /api/paper-risk/status`.

Implemented paper-only checks:

- `PRICE_REASONABILITY`: rejects paper prices outside the configured reference
  band when both order price and reference price are supplied.
- `MAX_ORDER_SIZE_BY_CONTRACT`: caps TX / MTX / TMF paper order quantity.
- `MARGIN_PROXY`: rejects paper exposure above the local margin proxy.
- `DUPLICATE_ORDER_PREVENTION`: rejects known idempotency keys from local paper
  state.
- `DAILY_LOSS_LIMIT`: rejects when local paper daily loss state reaches the max.
- `POSITION_LIMIT`: rejects projected paper position above the configured TX
  equivalent limit.
- `KILL_SWITCH`: rejects when the paper placeholder kill switch is active.
- `BROKER_HEARTBEAT`: rejects when simulated paper broker heartbeat is unhealthy.

These checks are not production market risk controls. They do not connect brokers,
read live balances, place orders, modify real positions, or enable live trading.

Paper risk evaluation can be exported as local JSON evidence with
`make paper-risk-evidence-export`. The evidence captures intent, policy, state,
`RiskEvaluation`, passed checks, failed checks, and explicit safety flags. The
export is stdout-only by default and writes a local `.json` file only when
`--output` is explicitly supplied.

## Paper Risk Cross-Account Readiness Boundary

Paper Risk Engine guardrails are not a cross-account risk system. The current
risk state is paper-only and local. It does not aggregate exposure across real
customers, accounts, strategies, brokers, contracts, margin, equity, PnL, orders,
or fills.

The read-only endpoint `GET /api/paper-risk/cross-account-readiness` documents
this boundary for reviewers and the Web Command Center. It returns
`production_cross_account_risk_system=false`, `broker_api_called=false`,
`real_account_data_loaded=false`, and `production_risk_approval=false`.

Cross-account risk remains future work and requires tenant/account hierarchy,
account-scoped and group-scoped risk limits, durable risk state, real
account/broker feeds, reconciliation, audited limit changes, RBAC/ABAC, and
security/legal/compliance review. The current endpoint is metadata only; it does
not write databases, create orders, call brokers, collect credentials, or enable
live trading.

## Acceptance Criteria

- Risk Engine rejects when live trading is enabled.
- Risk Engine rejects non-paper trading mode.
- Risk Engine rejects non-paper broker provider.
- Risk Engine rejects exposure above the configured limit.
- Risk Engine rejects stale quotes.
- Risk Engine rejects unreasonable paper prices, oversized contract orders, margin
  proxy breaches, duplicate idempotency keys, daily loss breaches, position limit
  breaches, active paper kill switch, and unhealthy simulated broker heartbeat.
- Risk Engine rejects any `PaperOrderIntent` where `paper_only=false`.
- No order is placed by Risk Engine.

## Validation

```bash
cd backend && pytest tests/test_risk_rules.py tests/test_architecture_routes.py
make paper-risk-guardrails-check
make paper-risk-evidence-export
make paper-risk-cross-account-readiness-check
cd backend && pytest tests/test_paper_risk_evidence_export_script.py
make paper-execution-workflow-check
make paper-execution-persistence-check
```
