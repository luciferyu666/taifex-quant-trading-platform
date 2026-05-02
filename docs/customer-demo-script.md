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
make customer-demo-ui-smoke-check
make paper-approval-ui-flow-smoke-check
```

Confirm:

- `Release Readiness` GitHub Actions is passing.
- Web Command Center production alias is `Ready`.
- Customer Demo Guided Flow production smoke check is passing.
- Local Paper Approval UI Flow smoke drill is passing if the customer will test
  the full browser-based paper request / decision / submit path.
- Local Backend Demo Browser Drill is passing if the customer will test seeded
  local SQLite OMS / audit records through the Web Command Center.
- `TRADING_MODE=paper`.
- `ENABLE_LIVE_TRADING=false`.
- `BROKER_PROVIDER=paper`.

Optional local-only setup for demonstrating the Paper OMS / Audit Query Viewer:

```bash
make seed-paper-execution-demo
make paper-demo-evidence-export
```

This creates one small paper workflow record in the local SQLite path configured by
`PAPER_EXECUTION_AUDIT_DB_PATH`. It does not call the FastAPI server, broker APIs, an
external database, or any live order path.

`make paper-demo-evidence-export` prints a small customer-demo evidence summary to
stdout. It includes the approval request, reviewer decisions, workflow run, order ID,
final OMS status, OMS event count, audit event count, safety flags, local SQLite path,
and timestamp. It is read-only and does not upload data or write external databases.

Optional local-only verification for the controlled Paper Simulation Submit UI:

```bash
make paper-simulation-submit-check
```

This posts a bounded Paper Only payload to
`/api/paper-execution/workflow/record` through FastAPI `TestClient`, verifies the
Risk Engine / OMS / Paper Broker Gateway / audit trace, and uses a temporary local
SQLite database by default.

Optional local-only evidence export for the Paper Broker Simulation Model preview:

```bash
make paper-broker-simulation-evidence-export
```

This prints a small Paper Only broker simulation preview evidence JSON to stdout.
It captures caller-provided local quote inputs, simulated outcome, fill quantity,
fill price, remaining quantity, reason, and safety flags. It does not write
databases, download market data, call brokers, create orders, or call Risk Engine /
OMS / Broker Gateway execution paths. Use explicit `--output` only when a reviewer
needs a small local JSON artifact under `data-pipeline/reports/`.

Optional browser-level verification for the full Web UI paper approval flow:

```bash
make paper-approval-ui-flow-smoke-check
```

This starts a local backend, local frontend, temporary SQLite database, and
headless browser. It creates one paper approval request through the UI, records
two reviewer decisions through the UI, submits one controlled Paper Only
simulation through the UI, and confirms the OMS / Audit Viewer displays the
persisted workflow.

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

Set expectation before showing paper records:

- Production Vercel cannot directly read the evaluator's local SQLite paper
  records.
- Production Vercel is suitable for read-only UI, release status, safety copy,
  fallback content, and explicit local JSON evidence viewers.
- In the Release tab, review the Data Access Boundary matrix before opening
  Paper OMS records. It should state that actual paper records require local
  backend + local SQLite unless a future controlled hosted API is deployed.
- To show actual persisted paper OMS / audit records, run local backend + local
  frontend against the same local SQLite store. Preferred customer-facing path:

```bash
make customer-demo-env-check
make start-customer-demo
```

Operator-level launcher:

```bash
make launch-self-service-paper-demo
```

Manual fallback:

```bash
make backend
make frontend
make seed-paper-execution-demo
make paper-execution-persistence-check
```

Automated verification for this local backend demo path:

```bash
make customer-demo-env-check
make self-service-paper-demo-launcher-check
make local-backend-demo-browser-drill
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
- Paper Approval Queue / History:
  - Show the read-only paper approval status, pending queue, approval history,
    required review sequence, reviewer history, hash-chain references, and safety
    flags.
  - Explain that the queue/history panel is read-only and validates the reviewer
    workflow model.
- Paper Approval Request UI:
  - Create one local Paper Only approval request from a signals-only
    `StrategySignal` payload.
  - Confirm the created request starts at `pending_review`.
  - Confirm request creation does not create reviewer decisions, paper simulations,
    order intents, OMS records, broker gateway calls, credential flows, account
    login, or live approval.
  - Refresh the queue/history and locate the new `approval_request_id`.
- Paper Approval Decision UI:
  - Use it only with an existing local approval request in the pending queue.
  - Record a paper-only reviewer decision such as `research_approved`,
    `approved_for_paper_simulation`, `rejected`, or `needs_data_review`.
  - Confirm it writes only a local approval decision record and does not create
    approval requests, paper simulations, orders, live approval, credential flows,
    broker calls, Risk Engine calls, OMS calls, or Broker Gateway calls.
  - Refresh the queue/history after recording a decision.
- Paper Simulation Controlled Submit UI:
  - Use it only when a local FastAPI backend is running and the evaluator understands
    the action writes one local SQLite paper workflow record.
  - Confirm the UI says `Paper Only`, `ENABLE_LIVE_TRADING=false`, and
    `BROKER_PROVIDER=paper`.
  - Confirm a persisted `approval_request_id` with
    `approved_for_paper_simulation` is selected. If no approved request exists,
    submit must remain disabled.
  - Submit only the bounded paper payload tied to that persisted approval request.
    Do not enter broker credentials, account IDs, API keys, certificates, or
    customer financial data.
  - After submit, confirm the UI displays `workflow_run_id`,
    `approval_request_id`, order ID, final OMS status, SQLite persistence, and the
    paper broker simulation message.
  - Refresh records, select the generated workflow row, and inspect the OMS / audit
    timelines in the Paper OMS viewer.
  - The expected trace is:

```text
UI submit
-> /api/paper-execution/workflow/record
-> persisted approval_request_id verification
-> Risk Engine
-> OMS lifecycle
-> Paper Broker Gateway simulation
-> Audit events
-> Query Viewer
```

  - If the backend is not available, show the troubleshooting state and use
    `make paper-simulation-submit-check` to verify the same flow locally without a
    running server.
- Paper Demo Evidence Export:
  - After running a local seed or controlled submit, run
    `make paper-demo-evidence-export`.
  - Show the generated `approval_request_id`, reviewer decisions,
    `workflow_run_id`, order ID, final OMS status, OMS event count, audit event
    count, and safety flags.
  - Explain that explicit `--output` can write a small local JSON or Markdown
    summary for customer feedback, but the default is stdout and there is no upload.
  - If using the Web Command Center, explicitly select the exported local JSON in
    the Paper Demo Evidence Viewer under the Paper OMS tab.
  - Confirm that the viewer parses the file client-side, validates paper-only
    safety flags, and does not upload files, call backend mutation APIs, write
    databases, collect credentials, call brokers, or create orders.
  - Do not present this evidence as a broker confirmation, investment report,
    performance claim, or live approval.
- Paper Broker Simulation Preview Evidence Export:
  - After using the Paper Broker Simulation Model UI, run
    `make paper-broker-simulation-evidence-export` to show a stdout-only example
    of the same evidence shape.
  - Explain that the evidence records local quote inputs and preview outcome only.
    It is not a workflow record, broker confirmation, production matching result,
    performance claim, or live approval.
  - If a reviewer needs a local artifact, use explicit `--output` with a small
    `.json` path. Do not upload it through the Command Center and do not commit
    generated report JSON.
- Customer Demo Guided Flow:
  - Use the guided tour panel to walk through Release, Paper OMS, Research Packet,
    and Contracts in a predictable order.
  - Use Previous / Next step controls to keep the evaluation sequence consistent.
  - Use Copy checklist only for reviewer notes; it does not write backend state.
  - Confirm the prohibited-action list: no live trading, no broker login, no real
    orders, no credential upload, no customer account onboarding, and no trading
    recommendation.

Clarify:

```text
The Command Center is paper-first. Most surfaces are read-only. The controlled paper submit panel can create one local SQLite paper simulation record for demo purposes only. It does not submit real orders, approve live trading, connect to brokers, collect credentials, or write external databases.
```

Suggested in-app guided sequence:

1. Confirm release level.
2. Confirm safety defaults.
3. Review the paper OMS workflow.
4. Inspect paper audit records if local records exist.
5. Load the bundled safe Research Review Packet sample.
6. Review TX / MTX / TMF contract specs.
7. Confirm prohibited actions and current non-production status.

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
