# Customer Demo Script

## Purpose

This script provides a repeatable 30-45 minute customer evaluation flow. It keeps the demo focused on platform infrastructure, data governance, research workflow, release readiness, and safety controls.

Do not use this script to present the platform as production trading ready.

## Demo Setup

Before the session:

```bash
git status --short --branch
make customer-evaluation-check
make frontend-production-smoke-check
```

Confirm:

- `Release Readiness` GitHub Actions is passing.
- Web Command Center production alias is `Ready`.
- `TRADING_MODE=paper`.
- `ENABLE_LIVE_TRADING=false`.
- `BROKER_PROVIDER=paper`.

Optional local-only setup for demonstrating the Paper OMS / Audit Query Viewer:

```bash
make seed-paper-execution-demo
```

This creates one small paper workflow record in the local SQLite path configured by
`PAPER_EXECUTION_AUDIT_DB_PATH`. It does not call the FastAPI server, broker APIs, an
external database, or any live order path.

## 1. Opening Positioning

Suggested talk track:

```text
This is a Taiwan futures quantitative trading infrastructure platform. It is not a simple trading bot and it is not production trading ready. The current release is suitable for product evaluation, internal demo, and paper research preview only.
```

Emphasize:

- Data governance.
- Strategy research.
- Backtest artifacts.
- Paper/shadow workflow direction.
- Risk Engine and OMS boundaries.
- Broker Gateway isolation.
- Auditability and observability.

## 2. Marketing Website Walkthrough

Open:

```text
https://taifex-quant-trading-platform-websi.vercel.app
```

Show:

- Hero positioning.
- TX / MTX / TMF target instruments.
- Paper-first safety defaults.
- Commercial model.
- Compliance boundary.
- Roadmap and current repository status.

Do not claim:

- Production readiness.
- Guaranteed profit.
- Risk-free operation.
- Advisory, signal, copy-trading, managed account, or broker fee-sharing availability.

## 3. Web Command Center Walkthrough

Open:

```text
https://taifex-quant-trading-platform-front.vercel.app
```

Show:

- English / Traditional Chinese language switch.
- Release baseline panel.
- `NOT READY` production trading status.
- `TRADING_MODE=paper`.
- `ENABLE_LIVE_TRADING=false`.
- `BROKER_PROVIDER=paper`.
- Safety flags and read-only review components.
- Paper OMS / Audit Query Viewer:
  - If `make seed-paper-execution-demo` was run locally, show the seeded
    `workflow_run_id`, order ID, OMS timeline, and audit timeline.
  - If no local record exists, show the safe empty state.

Clarify:

```text
The Command Center is read-only in this release. It does not submit orders, approve live trading, approve paper execution, connect to brokers, or write customer data.
```

## 4. Local JSON Loader Demo

If demonstrating the local JSON loader:

1. Use only approved sample packet fixtures.
2. Do not upload files to a backend.
3. Do not use customer secrets or real trading records.
4. Show that unsafe packets are rejected.

Acceptable sample source:

```text
frontend/test-fixtures/research-review-packets/valid.sample.json
```

Optional local sample generation:

```bash
make sample-research-review-packet
```

## 5. Technical Architecture Discussion

Use these discussion anchors:

- Strategies emit signals only.
- Orders must pass through Risk Engine and OMS in future execution phases.
- Broker SDK access remains isolated behind Broker Gateway.
- Research data and execution price paths must remain separate.
- Continuous futures preview is research-only and execution-ineligible.
- Phase 2/3 artifacts are dry-run local metadata and not performance reports.

## 6. Known Limits

State these explicitly:

- No real broker integration.
- No live execution.
- No production OMS.
- No production Risk Engine.
- No production market data ingestion.
- No customer authentication, RBAC, or enterprise tenancy.
- No payment or subscription checkout.
- No investment advice or signal service.
- Local demo seed records are paper workflow samples only. They are not broker
  confirmations, real account records, performance reports, or trading advice.

## 7. Feedback Capture

Close the session with `docs/customer-feedback-form.md`.

Ask for feedback on:

- Website clarity.
- Web Command Center clarity.
- Safety posture.
- Data governance needs.
- Audit and reporting needs.
- Broker integration requirements.
- Enterprise procurement and security requirements.

## Demo Exit Criteria

The demo is complete only if the customer understands:

- The current platform is paper-first.
- Live trading is disabled.
- The current surfaces are presentation, internal demo, and paper research preview only.
- Production trading requires future legal, compliance, security, operational, and technical gates.

Live trading remains disabled by default.
