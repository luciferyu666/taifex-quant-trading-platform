# Customer Evaluation Package

## Purpose

This package defines how a customer, broker partner, technical advisor, or internal reviewer can safely evaluate the Taifex Quant Trading Platform at the current release baseline.

The package is designed for controlled product evaluation. It is not a production trading onboarding guide, broker integration guide, investment advisory workflow, or managed account workflow.

## Current Evaluation Level

| Surface | Evaluation level | Customer-facing interpretation |
| --- | --- | --- |
| Marketing Website | External presentation candidate | Suitable for product positioning, commercial model, architecture, and safety review. |
| Web Command Center | Controlled customer demo candidate | Suitable for read-only UI evaluation and bilingual safety posture review. |
| Paper Research Preview | Technical preview | Suitable for engineering review of fixture-only dry-run data/research artifacts. |
| Production Trading Platform | **NOT READY** | Not available for live trading, customer execution, broker-connected trading, copy trading, signal services, or managed accounts. |

Live trading remains disabled by default.

## Public Demo URLs

- Marketing Website: <https://taifex-quant-trading-platform-websi.vercel.app>
- Web Command Center: <https://taifex-quant-trading-platform-front.vercel.app>

Both surfaces are presentation and read-only evaluation surfaces. They do not provide live order entry, broker login, account opening, payment checkout, subscription checkout, managed account onboarding, or regulated signal service enrollment.

## What Customers Can Test

Customers may evaluate:

- Product positioning for Taiwan futures quant workflows.
- TX / MTX / TMF exposure normalization messaging.
- Commercial model and compliance boundary wording.
- Bilingual website and Web Command Center copy.
- Release baseline and deployment health visibility.
- Paper-first safety defaults:
  - `TRADING_MODE=paper`
  - `ENABLE_LIVE_TRADING=false`
  - `BROKER_PROVIDER=paper`
- Web Command Center read-only status panels.
- Web Command Center customer demo guided flow:
  - Release level confirmation.
  - Paper-first safety defaults.
  - Paper OMS workflow explanation.
  - Paper audit record inspection.
  - Safe Research Review Packet sample loading.
  - TX / MTX / TMF contract spec review.
  - Prohibited-action confirmation.
- Research review packet viewer behavior using approved local sample JSON fixtures.
- Paper OMS / Audit Query Viewer behavior using an explicitly generated local paper
  demo seed record.
- Local Backend Demo Mode boundary:
  - Production Vercel cannot directly read local SQLite paper records.
  - Actual persisted paper OMS / audit records require local backend + local SQLite.
  - Future hosted record display requires a controlled backend/API and governed
    data layer.
  - The Release tab includes a Data Access Boundary matrix. Review
    [production-local-data-boundary.md](production-local-data-boundary.md) before
    asking customers to inspect actual paper records.
  - The self-service productization path is tracked in
    [customer-self-service-paper-demo-roadmap.md](customer-self-service-paper-demo-roadmap.md).
  - The one-command local launcher is documented in
    [customer-self-service-local-demo-launcher.md](customer-self-service-local-demo-launcher.md).
  - Hosted paper backend/API readiness is documented in
    [hosted-paper-backend-api-readiness.md](hosted-paper-backend-api-readiness.md).
- Paper OMS reliability metadata review:
  - local idempotency key count
  - completed local outbox metadata
  - simulated execution report count
  - read-only timeout candidate scan
  - explicit `production_oms_ready=false`
- Paper Simulation Controlled Submit UI when a local backend is running:
  - Creates one bounded Paper Only workflow record through
    `/api/paper-execution/workflow/record`.
  - Writes only to local SQLite through `PAPER_EXECUTION_AUDIT_DB_PATH`.
  - Does not collect broker credentials, account IDs, certificates, API keys, or
    customer financial data.
- Local developer setup and dry-run validation commands when the customer is a technical evaluator.

## What Customers Must Not Test

Customers must not test:

- Live trading.
- Real broker login.
- Real broker SDK access.
- Real order submission.
- Account opening.
- Real API keys, certificates, account IDs, private keys, or broker credentials.
- Production database writes.
- External market data downloads unless separately licensed and approved.
- Copy trading.
- Signal subscriptions.
- Managed account or discretionary trading flows.
- Strategy ranking as investment advice.
- Any claim that the system is production trading ready.
- Any attempt to use the paper simulation UI for real orders, live approval, broker
  login, credential upload, or account onboarding.

## Evaluation Prerequisites

Before a customer evaluation:

1. Confirm GitHub Actions `Release Readiness` is passing.
2. Confirm the Web Command Center production smoke gate is passing.
3. Confirm production alias points to a `Ready` deployment.
4. Confirm `.env.example` keeps paper-first defaults.
5. Confirm customer-facing language says the platform is not investment advice and not production trading ready.
6. Confirm no private `Documentation/*.md` source briefs, credentials, generated reports, or secrets are shared.

Suggested commands:

```bash
git status --short --branch
make customer-evaluation-check
make frontend-production-smoke-check
make customer-demo-ui-smoke-check
make paper-approval-ui-flow-smoke-check
make paper-simulation-submit-check
make release-readiness-check
```

## Recommended Evaluation Flow

Use this sequence for a 30-45 minute customer session:

1. Position the product as Taiwan futures quant infrastructure, not a trading bot.
2. Open the Marketing Website and review platform thesis, safety defaults, instruments, commercial model, and compliance boundary.
3. Open the Web Command Center and review release baseline, NOT READY status, bilingual toggle, and paper-only safety copy.
4. Use the in-app Customer Demo Guided Flow to walk through Release, Paper OMS,
   Research Packet, and Contracts in a consistent order.
5. Optional local-only setup for the Paper OMS / Audit Query Viewer:

```bash
make backend
make frontend
make seed-paper-execution-demo
make paper-demo-evidence-export
```

6. Confirm the evaluator understands that production Vercel may show fallback or
   empty paper records because it cannot directly read local SQLite. Use the local
   frontend at `http://localhost:3000` with local backend for actual records.
   The automated browser check for this path is:

```bash
make local-backend-demo-browser-drill
```

7. Optional local-only paper simulation:
   use the controlled Paper Only submit panel only with a running local backend, then
   refresh records and inspect the generated local SQLite audit record.
   Before a customer session, validate both the browser UI flow and API trace:

```bash
make paper-approval-ui-flow-smoke-check
make paper-simulation-submit-check
```

7. Demonstrate local Research Review Packet JSON loading using a safe sample packet only.
8. If a local demo seed or controlled paper submit was used, show the paper workflow summary, OMS
   timeline, and audit timeline.
9. If the customer needs a handoff artifact, export a local Paper Demo Evidence
   JSON or Markdown summary. The default export is stdout; explicit `--output`
   writes only a small local file.
10. Optionally load the exported local JSON into the Web Command Center Paper Demo
    Evidence Viewer. This is client-side only and does not upload files, write
    databases, call brokers, collect credentials, or create orders.
11. Explain what the current system does not do: no live trading, no broker integration, no customer execution.
12. Collect structured feedback using `docs/customer-feedback-form.md`.

## Success Criteria

A successful customer evaluation should produce:

- Clear understanding of current release level.
- Confirmation that the customer understands live trading is disabled.
- Feedback on website clarity, Web Command Center usability, and enterprise workflow needs.
- Technical questions about data governance, research artifacts, broker gateway boundaries, risk, OMS, and auditability.
- No request to enter real credentials, place orders, or activate live trading during the evaluation.

## Evaluation Artifacts

- Demo script: `docs/customer-demo-script.md`
- Evaluation checklist: `docs/customer-evaluation-checklist.md`
- Feedback form: `docs/customer-feedback-form.md`
- Release baseline: `docs/release-baseline-v0.1.0.md`
- Release verification record: `docs/release-verification-record-2026-04-28.md`
- Production verification runbook: `docs/frontend-command-center-deployment-verification.md`
- Customer demo UI smoke test: `docs/customer-demo-ui-smoke-test.md`
- Paper demo evidence export: `docs/paper-demo-evidence-export.md`
- Hosted paper tenant boundary evidence export:
  `docs/hosted-paper-tenant-boundary-evidence-export.md`
- Hosted paper tenant boundary evidence viewer:
  Web Command Center read-only local JSON loader
- Paper execution demo seed: `scripts/seed-paper-execution-demo.py`
- Paper demo evidence exporter: `scripts/export-paper-demo-evidence.py`
- Hosted paper tenant boundary evidence exporter:
  `scripts/export-hosted-paper-tenant-boundary-evidence.py`

## Safety Statement

This project is for research, engineering development, controlled demonstrations, and paper-first workflow evaluation. It is not investment advice, does not guarantee profit, and is not ready for production trading.

Live trading remains disabled by default.
