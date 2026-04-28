# Trading Safety

This repository is paper-first by design.

## Defaults

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
MAX_TX_EQUIVALENT_EXPOSURE=0.25
MAX_DAILY_LOSS_TWD=5000
STALE_QUOTE_SECONDS=3
```

## Live Trading

Live trading is not enabled by default and real broker connectivity is not implemented in this skeleton. This protects local development from accidental real-market activity and keeps future execution work behind explicit review gates.

## Strategy and Execution Separation

Strategies emit target exposure signals only. They must not:

- Call broker SDKs.
- Create orders directly.
- Bypass risk checks.
- Bypass OMS state transitions.

Future order flow must be:

```text
Strategy signal -> Risk Engine -> OMS -> Broker Gateway
```

## Research and Backtest Preview Boundary

Phase 3 research and backtest preview artifacts are intentionally non-executable:

- Feature dataset manifests must remain `research_only=true`.
- Continuous futures artifacts must remain `execution_eligible=false`.
- Strategy research preview may emit a standardized signal only.
- Backtest preview may bind a manifest, signal, strategy version, and parameter set.
- Backtest preview must return `performance_claim=false`.
- Backtest preview must not create orders, call Risk Engine, call OMS, call Broker
  Gateway, write a database, or download external data.
- Backtest result schema preview may define metric names only. Metric values must
  remain null and `simulated_metrics_only=true`.
- Toy backtest may produce simulated research values from local fixtures only. Each
  metric must be marked `simulated=true`, `research_only=true`, and
  `performance_claim=false`.
- Backtest artifact preview may package simulated toy results as local JSON metadata.
  It defaults to `persisted=false` and must not write databases or imply live
  performance.
- Backtest artifact index may catalog local research artifacts only. It must not rank
  strategies, select a "best" result, claim alpha, or imply execution readiness.
- Backtest artifact comparison may compare catalog metadata only. It must keep
  `ranking_generated=false` and `best_strategy_selected=false`, and it must not be
  used as advice, alpha proof, or live readiness approval.
- Backtest research bundle may package the full research-only chain for UI, audit, and
  review workflows. It must remain `persisted=false` by default and must not be treated
  as a performance report, ranking, recommendation, or live readiness approval.
- Research bundle local export may mark `persisted=true` only when the user explicitly
  provides a local `.json` `--output` path. It must remain local metadata only and must
  not write databases, call brokers, or create orders.
- Backtest research bundle index may catalog local research bundles only. It must not
  rank strategies, select a best result, claim alpha, imply profitability, write
  databases, call brokers, or approve live deployment.
- Research review queue may create `pending_review` metadata only. It must keep
  `approval_for_live=false` and must not become an advisory, ranking, paper execution,
  or live deployment approval workflow.
- Research review decision may record `rejected`, `needs_data_review`, or
  `approved_for_paper_research` as dry-run metadata only. It must keep
  `approval_for_live=false` and `approval_for_paper_execution=false`; the paper
  research decision does not permit paper execution, OMS routing, Broker Gateway
  submission, or live trading.
- Research review decision index may summarize decision counts only. It must not use
  those counts to rank strategies, select a best result, recommend trades, approve
  paper execution, approve live trading, or imply profitability.
- Research review packet may package queue, decision, and decision-index metadata for
  future UI, audit, and reviewer handoff only. It must keep
  `approval_for_live=false`, `approval_for_paper_execution=false`,
  `ranking_generated=false`, `best_strategy_selected=false`, and `persisted=false`.

Any future performance report must be clearly labeled as research/backtest output and
must not be marketed as guaranteed profit or investment advice.

## Paper Execution Approval Workflow

Paper simulation is allowed only through a platform-owned workflow:

- Strategy code still emits `StrategySignal` only.
- `StrategySignal.reason.signals_only` must be `true`.
- A strategy must not create orders, call Risk Engine, call OMS, call Broker Gateway,
  or call broker APIs.
- The platform can create a `PaperOrderIntent` only when review status is
  `approved_for_paper_simulation`.
- `research_approved` means the research artifact can proceed in review; it is not a
  paper simulation approval.
- `rejected` and `needs_data_review` do not create paper order intents.
- Every `PaperOrderIntent` must pass Risk Engine before OMS submission.
- OMS owns the deterministic order lifecycle.
- Paper Broker Gateway simulates acknowledgement, rejection, partial fill, fill, and
  cancellation only.
- Every workflow run must emit audit events.
- `POST /api/paper-execution/workflow/record` may persist paper workflow metadata,
  OMS events, and audit events to local SQLite for audit review.
- Local paper persistence defaults to `data/paper_execution_audit.sqlite` through
  `PAPER_EXECUTION_AUDIT_DB_PATH`.
- Local `.sqlite` files remain ignored by git and must not contain broker secrets,
  account IDs, API keys, certificates, or live orders.
- No real broker SDK is called.
- No real order is placed.
- `ENABLE_LIVE_TRADING=false` remains required.

## Risk and OMS Rule

Every future order must pass pre-trade checks and be represented in the OMS state machine with idempotency. Broker Gateway is an adapter boundary, not a strategy execution surface.

## Secrets Policy

- Do not commit `.env`.
- Do not commit broker credentials, account IDs, certificates, private keys, or API keys.
- Keep `.env.example` limited to safe fake local defaults.
- Use a future secrets manager for real integrations.

## Future Live-Trading Approval Checklist

Before any future live mode exists, require:

- Explicit human approval.
- Dedicated non-paper broker adapter.
- Risk Engine checks for stale quotes, exposure, daily loss, and kill switch.
- OMS idempotency and reconciliation tests.
- Separate credentials and environment from paper/shadow trading.
- Audit logging for configuration changes and order lifecycle events.
