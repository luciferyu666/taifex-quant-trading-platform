# Paper, Shadow, and Future Live Boundary

## Paper

Paper mode is the default and only executable mode in the current roadmap implementation.

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- PaperBrokerGateway returns simulated acknowledgements only.
- Paper OMS reliability metadata is local-only:
  - idempotency keys are stored in local SQLite for duplicate prevention in local
    paper workflow sessions
  - outbox records are completed local metadata, not an asynchronous broker queue
  - execution reports are simulated paper metadata, not broker execution reports
  - timeout candidate scans are read-only and do not mutate OMS state
  - `production_oms_ready=false` remains explicit

Phase 3 strategy research is even narrower than paper execution:

- Dataset manifests are research-only.
- Strategy SDK examples emit signals only.
- Research preview never creates order intents.
- Research preview never calls Risk Engine, OMS, or Broker Gateway.

Phase 3 backtest preview is also narrower than paper execution:

- It consumes a research-only Feature Dataset Manifest and a signal-only
  `StrategySignal`.
- It produces a reproducibility hash and safety flags only.
- It does not calculate real performance.
- It returns `performance_claim=false`.
- It does not create order intents.
- It does not call Risk Engine, OMS, Broker Gateway, broker APIs, or databases.

Phase 3 backtest result schema preview is narrower again:

- It accepts only a safe Backtest Preview Contract.
- It defines future metric fields, but metric values stay `null`.
- It returns `simulated_metrics_only=true`.
- It does not make performance claims.
- It does not read external data, write databases, create orders, or call broker APIs.

Phase 3 toy backtest is still research-only:

- It uses local fixture bars only.
- It produces simulated metric values only.
- It marks every metric `simulated=true`, `research_only=true`, and
  `performance_claim=false`.
- It does not create orders or call Risk Engine, OMS, Broker Gateway, databases, or
  external data providers.

Phase 3 backtest artifact export stays local:

- API preview returns metadata only and `persisted=false`.
- SDK CLI writes a local JSON file only with explicit `--output`.
- Generated report JSON stays out of Git.
- Artifact checksums support auditability but are not performance certification.

Phase 3 artifact index is a catalog only:

- It summarizes local artifacts for future UI, comparison, and audit views.
- It does not rank results.
- It does not select the best strategy.
- It does not claim alpha or certify profitability.
- It does not create execution records or broker records.

Phase 3 artifact comparison is catalog metadata only:

- It compares data versions, strategy versions, parameter sets, metric names, and
  checksum status.
- It does not calculate performance ranking.
- It does not select a best strategy.
- It keeps `ranking_generated=false` and `best_strategy_selected=false`.
- It does not create order intents or call Risk Engine, OMS, Broker Gateway, broker
  APIs, databases, or external data providers.

Phase 3 research bundle is packaging metadata only:

- It packages the Phase 3 research-only chain for future UI, audit, and review views.
- It validates that all inputs are `execution_eligible=false` and
  `performance_claim=false`.
- It keeps `ranking_generated=false`, `best_strategy_selected=false`, and
  `persisted=false`.
- It may be exported to a local `.json` file only with an explicit CLI `--output`, at
  which point the output metadata can mark `persisted=true`.
- It is not a performance report, trading recommendation, or live-readiness approval.

Phase 3 research bundle index is a local catalog only:

- It summarizes multiple research bundles for future UI, review, and audit views.
- It keeps `ranking_generated=false`, `best_strategy_selected=false`, and
  `persisted=false`.
- It accepts duplicate bundle checksums only with a warning.
- It does not write databases, rank strategies, select winners, claim alpha, create
  order intents, or call Risk Engine, OMS, Broker Gateway, broker APIs, databases, or
  external data providers.

Phase 3 research review queue is pending-review metadata only:

- It consumes a safe research bundle index and creates `pending_review` items for
  future UI, review workflow, and audit views.
- It keeps `approval_for_live=false`, `ranking_generated=false`,
  `best_strategy_selected=false`, and `persisted=false`.
- It does not approve paper execution or live trading.
- It does not rank strategies, select winners, claim alpha, create order intents, or
  call Risk Engine, OMS, Broker Gateway, broker APIs, databases, or external data
  providers.

Phase 3 research review decision is dry-run decision metadata only:

- It records one of `rejected`, `needs_data_review`, or
  `approved_for_paper_research` against a queue item.
- `approved_for_paper_research` means continued research review only.
- It keeps `approval_for_live=false`, `approval_for_paper_execution=false`,
  `ranking_generated=false`, `best_strategy_selected=false`, and `persisted=false`.
- It does not approve paper execution, live trading, OMS routing, Broker Gateway
  submission, order creation, strategy ranking, or investment recommendations.

Phase 3 research review decision index is dry-run catalog metadata only:

- It summarizes counts for `rejected`, `needs_data_review`, and
  `approved_for_paper_research`.
- The count distribution is not a strategy ranking, approval queue, performance
  report, or investment recommendation.
- It keeps `approval_for_live=false`, `approval_for_paper_execution=false`,
  `ranking_generated=false`, `best_strategy_selected=false`, and `persisted=false`.
- It does not approve paper execution, live trading, OMS routing, Broker Gateway
  submission, order creation, strategy ranking, or investment recommendations.

Phase 3 research review packet is dry-run handoff metadata only:

- It packages a review queue, review decisions, and a decision index for future UI,
  audit trail, and reviewer handoff.
- It keeps `approval_for_live=false`, `approval_for_paper_execution=false`,
  `ranking_generated=false`, `best_strategy_selected=false`, and `persisted=false`.
- It does not write databases, approve paper execution, approve live trading, create
  orders, call Risk Engine, call OMS, route through Broker Gateway, rank strategies,
  select winners, certify performance, or make investment recommendations.

Phase 4 paper execution approval workflow is the first controlled paper simulation path:

- `StrategySignal` remains signal-only and must include `reason.signals_only=true`.
- Strategies still do not create orders, call Risk Engine, call OMS, or call Broker
  Gateway.
- The platform may create a `PaperOrderIntent` only after the review decision is
  `approved_for_paper_simulation`.
- `research_approved`, `rejected`, and `needs_data_review` do not create paper order
  intents.
- Every created paper intent is evaluated by Risk Engine before OMS submission.
- OMS records deterministic event transitions for create, risk approval/rejection,
  submit, acknowledgement, rejection, partial fill, fill, and cancellation.
- Paper Broker Gateway simulates acknowledgement, rejection, partial fill, fill, or
  cancellation only. It never submits real orders or calls a real broker SDK.
- Paper Broker Gateway may derive a paper outcome from caller-provided local quote
  snapshots through the quote-based simulation model preview. This model uses
  local bid/ask, order type, limit price, available size, quote age, spread, and
  liquidity score only. It does not download market data, call brokers, write
  databases, or represent production matching logic.
- Web Command Center may expose that quote-based simulation model as Paper Only UI
  controls. The panel may call only
  `/api/paper-execution/broker-simulation/preview` and must remain preview-only.
  It must not create workflow records, write databases, call Risk Engine, call OMS,
  call broker gateways for execution, collect credentials, or download market data.
- Paper Broker Simulation Evidence Export may capture one preview as local evidence
  through `make paper-broker-simulation-evidence-export`. It prints stdout by
  default and writes a small local `.json` only when `--output` is explicitly
  supplied. It must not write databases, download market data, call brokers,
  create orders, call Risk Engine, call OMS, call Broker Gateway execution paths,
  collect credentials, or claim production matching behavior.
- Paper Broker Simulation Evidence Viewer may load an explicitly selected local
  evidence JSON file client-side for read-only display. It must reject unsafe
  safety flags and must not upload files, write databases, call backend mutation
  APIs, call brokers, create orders, call Risk Engine, call OMS, call Broker
  Gateway execution paths, collect credentials, or grant live approval.
- Audit events are emitted for approval, intent creation, risk evaluation, paper
  broker simulation, and OMS lifecycle recording.
- `/api/paper-execution/workflow/record` can persist a completed paper workflow run to
  local SQLite for audit review. It records paper workflow metadata, OMS events, and
  audit events only.
- Local paper execution persistence uses `PAPER_EXECUTION_AUDIT_DB_PATH`, defaults to
  `data/paper_execution_audit.sqlite`, and remains local-only.
- Persisted paper records are queryable through read-only `/api/paper-execution/runs`,
  `/api/paper-execution/orders/{order_id}/oms-events`, and audit-event endpoints.
- Local `.sqlite` outputs must stay ignored by git and must not contain broker
  credentials, account IDs, API keys, certificates, or live orders.
- `ENABLE_LIVE_TRADING=false` and `BROKER_PROVIDER=paper` remain required.

Phase 5 Paper OMS / Audit Query Viewer is read-only UI:

- It may fetch persisted local paper workflow summaries from
  `GET /api/paper-execution/runs`.
- It may fetch OMS and audit timelines for the latest local paper workflow run.
- It may let the user select a persisted paper workflow row to view that workflow's
  OMS and audit timeline through read-only query APIs.
- It may copy `workflow_run_id` and `order_id` values to the clipboard.
- It may display workflow run ID, approval decision, order ID, final OMS status,
  OMS events, and audit events.
- It must render a safe empty state when no local paper records exist.
- It must not call `/api/paper-execution/workflow/record`, create simulations,
  create order intents, approve paper execution, approve live trading, write
  databases, call brokers, call Risk Engine mutation paths, call OMS mutation paths,
  rank strategies, or provide trading recommendations.

Phase 5 Paper Simulation Controlled Submit UI is the only frontend paper mutation
allowed in this release:

- It may call `POST /api/paper-execution/workflow/record` only.
- It must reference a persisted `approval_request_id` whose local approval history
  has reached `approved_for_paper_simulation`.
- It uses the StrategySignal payload associated with the persisted approval request.
- It keeps `approval_for_live=false`.
- It lets the user choose only TX/MTX/TMF symbol, small quantity, and paper broker
  simulation outcome after approval history is selected.
- The separate Paper Broker Simulation Model UI may preview quote-based inputs, but
  controlled submit still writes workflow records only after persisted paper
  approval and must not bypass Risk Engine, OMS, or audit recording.
- It writes only local SQLite paper OMS/audit records through the backend.
- It must not collect broker credentials, account IDs, API keys, certificates, or
  customer financial information.
- It must not expose live approval, broker login, real order submission, account
  onboarding, or production trading readiness claims.

Phase 5 Safe Read-Only Interaction Layer is UI navigation and inspection only:

- It may provide tabs for Release, Paper OMS, Research Packet, and Contracts views.
- It may refresh/retry frontend status by reloading the page.
- It may show backend-unavailable troubleshooting text and copy the explicit local
  demo seed command `make seed-paper-execution-demo`.
- It may load a bundled safe Research Review Packet sample into the frontend viewer.
- It may clear the currently selected local JSON and return to backend or fallback
  sample data.
- It must not upload local JSON, write databases, create orders, submit paper
  simulations, approve paper execution, approve live trading, collect credentials,
  call brokers, call Risk Engine mutation paths, or call OMS mutation paths.

Paper Execution Demo Seed is an explicit local-only sample generator:

- `make seed-paper-execution-demo` runs `scripts/seed-paper-execution-demo.py`.
- It creates one `approved_for_paper_simulation` sample workflow with a paper broker
  partial-fill simulation.
- It writes only to local SQLite through `PAPER_EXECUTION_AUDIT_DB_PATH`.
- It calls backend domain and service code directly; it does not call the FastAPI
  server, external databases, broker APIs, real broker SDKs, or live order paths.
- It prints `workflow_run_id`, `order_id`, and `final_oms_status` for demo setup.
- The resulting record is for read-only UI evaluation and audit-view demonstration
  only. It is not a broker confirmation, account record, performance report, trading
  recommendation, or live-readiness approval.

Paper Demo Evidence Export is an explicit local-only evidence handoff:

- `make paper-demo-evidence-export` runs
  `scripts/export-paper-demo-evidence.py`.
- It reads the local SQLite paper execution audit store in read-only mode.
- It prints a small evidence summary to stdout by default and writes a local JSON
  or Markdown file only when the user explicitly passes `--output`.
- It includes approval request ID, reviewer decisions, workflow run ID, order ID,
  final OMS status, OMS event count, audit event count, safety flags, local SQLite
  path, and timestamp.
- It must not upload data, write external databases, call brokers, collect
  credentials, create orders, approve live trading, or produce investment advice.
- It is a customer demo traceability artifact only; it is not a production WORM
  ledger, broker confirmation, performance report, or live-readiness approval.
- The Web Command Center Paper Demo Evidence Viewer may load an explicitly
  selected local evidence JSON file client-side for read-only display.
- The viewer must reject unsafe evidence flags and must not upload files, call
  backend mutation APIs, write databases, collect credentials, call brokers,
  create orders, or grant live approval.

Paper Approval Workflow Foundation is local paper governance scaffolding:

- It creates a separate approval queue under `/api/paper-execution/approvals`.
- The Web Command Center may display approval status, queue, and history through
  read-only GET endpoints.
- The Web Command Center may record paper-only reviewer decisions through
  `POST /api/paper-execution/approvals/requests/{approval_request_id}/decisions`.
  This is local approval workflow scaffolding only, not production identity,
  production RBAC, regulated compliance approval, broker authorization, or live
  readiness approval.
- `research_approved` is a first review only; it does not authorize paper simulation.
- `approved_for_paper_simulation` requires a distinct second reviewer after
  `research_approved`.
- Approval records are append-only through the API and hash-chained in local SQLite.
- It is not production login, production RBAC, production WORM storage, live approval,
  or broker authorization.
- It does not collect credentials, call brokers, create orders, call OMS, or call
  Broker Gateway.
- Controlled Paper Submit now uses persisted approval history instead of trusting a
  client supplied `approval_decision` payload.

Phase 5 Research Review Packet Viewer is read-only UI:

- It may fetch `GET /api/strategy/research-review/packet/sample` or render fallback
  packet metadata.
- It may inspect an explicitly selected local `.json` packet in the browser only.
- It may display packet identity, decision summary, checksums, warnings, and safety
  flags.
- It must not expose approve-live, approve-paper-execution, ranking, best-strategy,
  order creation, broker, Risk Engine, or OMS actions.
- It does not upload files, call backend mutation APIs, write databases, persist
  packet metadata, call brokers, call Risk Engine, or call OMS.

Phase 5 Research Review Packet sample export is local metadata only:

- It prints a safe sample packet to stdout by default.
- It writes a small local `.json` only with explicit `--output`.
- The output is intended for manual JSON loader testing in the Web Command Center.
- Generated sample JSON stays ignored by git.
- It keeps `approval_for_live=false`, `approval_for_paper_execution=false`,
  `execution_eligible=false`, `performance_claim=false`, `ranking_generated=false`,
  `best_strategy_selected=false`, and `persisted=false`.
- It does not upload files, call backend mutation APIs, write databases, call
  brokers, call Risk Engine, call OMS, create orders, rank strategies, or make
  performance claims.

Phase 5 Research Review Packet loader fixtures are local test inputs only:

- `valid.sample.json` is a safe acceptance sample.
- `invalid-*.json` files intentionally violate one safety rule each.
- They are used to test local loader rejection paths for unsafe live escalation,
  execution eligibility, performance claims, checksum formatting, and decision
  summary consistency.
- They must not be uploaded, persisted, routed to backend mutation APIs, or used
  as approval records, rankings, recommendations, order instructions, or
  performance reports.

## Production Vercel vs Local SQLite Boundary

The production Vercel Web Command Center cannot directly read a user's local
SQLite paper execution audit database. Production Vercel can display read-only
UI, safe fallback content, release status, safety copy, and explicit local JSON
evidence selected by the user in the browser.

Actual persisted paper workflow runs, OMS timelines, audit timelines, approval
records, risk state, reliability metadata, and audit-integrity status require
one of these paths:

- local backend + local SQLite demo mode
- future controlled hosted backend/API + governed data layer

The current safe local path is:

```bash
make backend
make frontend
make seed-paper-execution-demo
make paper-execution-persistence-check
```

This boundary must not be bypassed by attempting to expose local SQLite directly
from production Vercel. Future hosted API work requires separate architecture,
identity, RBAC/ABAC, audit, data governance, and operational review.

The current hosted paper identity readiness endpoint is read-only only:

```text
GET /api/hosted-paper/identity-readiness
```

It exists to show that real reviewer login, customer accounts, formal RBAC/ABAC
enforcement, and tenant isolation are not enabled yet. It must not be treated as
production identity, customer onboarding, hosted tenancy, or authorization
enforcement.

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
- No strategy research path may mark a dataset manifest as execution-eligible.
- No strategy research path may convert signals into orders.
- No backtest preview path may present a performance claim or execution-eligible
  artifact.
- No backtest result schema preview may populate real performance values.
- No toy backtest path may be used as a live trading, broker execution, or marketing
  performance claim path.
- No artifact export path may be used as a regulated performance report or broker
  execution record.
- No artifact index path may be used as a strategy ranking, advisory signal, or live
  readiness approval.
- No artifact comparison path may rank strategies, select winners, claim alpha, or
  convert research metadata into execution decisions.
- No research review packet may approve paper execution, approve live trading, rank
  strategies, certify performance, or become a regulated report.
- No Research Review Packet Viewer UI may expose execution controls, approval
  escalation, broker submission, ranking, or recommendation behavior.
- No Paper Execution Approval Workflow UI panel may create simulations, create
  order intents, connect brokers, trigger Risk Engine, trigger OMS, call Broker
  Gateway, or expose live controls.
- No Paper Execution persistence status UI panel may call `/workflow/record`, create
  simulations, mutate databases, connect brokers, approve paper execution, approve
  live trading, or expose live controls.
- No Paper Approval Workflow API may be treated as production authentication,
  regulated compliance approval, live-readiness approval, or broker authorization.
- No Paper Approval Queue UI may create approval requests, collect credentials,
  call brokers, create paper simulations, create order intents, or expose live
  controls.
- Paper Approval Request UI may mutate only local SQLite approval-request records
  through `POST /api/paper-execution/approvals/requests`. It must start requests
  as `pending_review`, use signals-only payloads, keep `paper_only=true`, and must
  not create reviewer decisions, paper simulations, orders, OMS records, Risk
  Engine calls, Broker Gateway calls, broker connections, credential collection,
  account login, or live controls.
- Paper Approval Decision UI may mutate only local SQLite approval-decision records
  through the paper-only decision endpoint. It must not create approval requests,
  create paper simulations, call Risk Engine, call OMS, call Broker Gateway,
  collect credentials, connect brokers, or expose live controls.
- No Paper OMS / Audit Query Viewer UI panel may mutate persisted records, trigger
  paper simulation, grant approval escalation, connect brokers, call Risk Engine,
  call OMS, create order intents, show performance claims, or expose live controls.
- Paper OMS Reliability Viewer timeout actions may only preview or explicitly mark
  a local paper timeout through the paper-only timeout endpoints. Preview must not
  write. Mark may write only local SQLite EXPIRE OMS metadata, audit metadata, and
  simulated execution-report metadata. It must not process outbox workers, amend
  or replace orders, run reconciliation, call brokers, collect credentials, approve
  execution, enable live trading, or claim production OMS readiness.
- No local packet JSON loader may accept unsafe approval, execution, ranking,
  persistence, broker, Risk Engine, OMS, external download, or performance-claim
  flags.
- No Paper Broker Simulation Evidence artifact may be treated as a persisted
  workflow record, broker confirmation, live approval, production matching result,
  execution report, investment advice, strategy ranking, or performance claim.
- No Paper Risk Guardrail Expansion API or UI may be treated as production risk
  approval, broker heartbeat verification, margin confirmation, live position
  validation, or live readiness. Its kill switch and heartbeat are paper-only
  placeholders, and its daily loss / position state is local paper state only.
- No Paper Risk Evidence Export may be treated as production risk approval,
  broker confirmation, live readiness, investment advice, or a real order record.
  It is a local JSON evidence artifact for one paper risk evaluation and must not
  write databases, call OMS, call Broker Gateway, call brokers, collect
  credentials, or enable live trading.
- No Paper Audit Integrity Layer Preview may be treated as WORM storage,
  immutable audit compliance, centralized audit, production signing, or live
  readiness. It verifies local SQLite `previous_hash` / `event_hash` metadata for
  paper audit events only and must not repair records, write external databases,
  call brokers, collect credentials, create orders, or enable live trading.
- No Paper Audit Integrity Evidence Viewer may be treated as a production audit
  console, WORM verifier, signing service, or live-readiness attestation. It may
  load only an explicitly selected local JSON evidence file client-side, reject
  unsafe safety flags, and display the paper-only verification result without
  uploading files, writing databases, repairing chains, calling brokers,
  collecting credentials, creating orders, or enabling live trading.
- No local Research Review Packet sample export may be used as paper execution
  approval, live readiness, persisted audit record, broker instruction, performance
  report, ranking, or recommendation.
- No Research Review Packet loader fixture may be used outside local UI safety
  testing or future automated browser/component tests.
- No research bundle path may be used as a regulated performance report, advisory
  recommendation, ranking, or live deployment approval.
- No research bundle index path may be used as a strategy ranking, best-strategy
  selection, advisory signal, regulated report, or live deployment approval.
- No research review queue path may be used as a paper execution approval, live
  readiness, advisory workflow, strategy ranking, or broker execution instruction.
- No research review decision path may be used as a paper execution approval, live
  readiness, advisory workflow, strategy ranking, broker execution instruction, or
  performance certification.
- No research review decision index path may be used as a paper execution approval,
  live readiness, advisory workflow, strategy ranking, broker execution instruction,
  or performance certification.
