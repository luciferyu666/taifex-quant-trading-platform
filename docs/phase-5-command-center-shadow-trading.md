# Phase 5: Command Center and Shadow Trading

## Objective

Expose roadmap phase status, contracts, safety mode, risk status, and paper-only simulation placeholders through the Web Command Center.

## Deliverables

- Roadmap phase cards.
- Contract table.
- Risk status card.
- Paper-only order simulation placeholder.
- Architecture module cards.
- Read-only Research Review Packet viewer.
- Client-side local Research Review Packet JSON loader.
- Local-only safe Research Review Packet sample generator for manual loader tests.
- Local JSON fixture set for accepted and rejected loader safety paths.
- Shared pure validation function used by both the React local JSON loader and
  the fixture validator CLI.
- Decision summary panel for `rejected`, `needs_data_review`, and
  `approved_for_paper_research` counts.
- Safety flags panel that keeps paper/live safety flags visible and false.
- Checksum and warning sections for future audit and reviewer handoff.
- Read-only Release Baseline dashboard for `v0.1.0-paper-research-preview`.
- Backend release baseline endpoint:
  `GET /api/release/baseline`.
- Release level, validation status, safety defaults, and known non-production
  gaps displayed in the Web Command Center.
- Safe read-only interaction layer with Release / Paper OMS / Research Packet /
  Contracts tabs.
- Read-only refresh/retry action for frontend status reloading.
- Backend-unavailable troubleshooting panel with a local demo seed command copy
  block.
- Read-only Paper Execution Approval Workflow panel showing:
  `research_approved`, `approved_for_paper_simulation`, `rejected`, and
  `needs_data_review`.
- Paper execution route display:
  `StrategySignal -> Platform PaperOrderIntent -> Risk Engine -> OMS -> Paper Broker Gateway -> Audit Event`.
- Paper execution safety indicators:
  `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`, and
  `BROKER_API_CALLED=false`.
- Read-only paper execution persistence status showing local SQLite backend, local-only
  state, persisted workflow run count, OMS event count, audit event count, and local DB
  path.
- Read-only Paper OMS / Audit Query Viewer showing persisted paper workflow run
  summaries, latest selected run context, OMS event timeline, and audit event
  timeline.
- Selectable paper workflow rows for switching the displayed OMS and audit
  timeline through read-only query APIs.
- Copy controls for `workflow_run_id`, `order_id`, and the local demo seed command.
- Bundled safe Research Review Packet sample loader and clear-local-JSON action.
- Customer Demo Guided Flow panel with a seven-step read-only evaluation sequence:
  release level, safety defaults, paper OMS workflow, paper audit records,
  research packet sample, contract specs, and prohibited actions.
- Demo guide Previous / Next / Reset / Copy checklist controls that modify only
  frontend local state or clipboard contents.
- Local Backend Demo Mode panel explaining that the production Vercel frontend
  cannot directly read local SQLite paper records, and that actual paper records
  require local backend + local SQLite or a future controlled hosted backend/API.
- Deployment Data Boundary panel that shows a reviewer-facing matrix for
  Production Vercel fallback UI, Local Backend + SQLite records, and the future
  hosted API/data-layer direction.
- Local Backend Demo Browser Drill that starts local backend/frontend, seeds a
  temporary local SQLite paper workflow record, and verifies the browser can see
  actual OMS / audit timelines.

## Acceptance Criteria

- Frontend renders fallback data if backend is unavailable.
- Frontend can render a safe sample from
  `GET /api/strategy/research-review/packet/sample`.
- Research Review Packet UI shows packet ID, queue ID, decision index ID, bundle
  count, decision count, decision summary, included sections, checksums, warnings,
  and safety flags.
- Local JSON loader requires an explicit user-selected `.json` file.
- Local JSON loader validates required packet fields, checksum formats, decision
  summary counts, and all read-only safety flags before display.
- Local JSON loader fixtures cover a valid sample plus unsafe live-safety escalation,
  execution eligibility, performance claim, checksum, and decision-summary cases.
- Fixture validation imports the same `researchReviewPacketValidation.ts` pure
  function that the UI loader uses, preventing duplicated safety rules.
- Local JSON loader does not upload files, call backend mutation APIs, write
  databases, persist browser state, call brokers, call Risk Engine, or call OMS.
- Safe packet sample generator prints to stdout by default and writes local `.json`
  only when an explicit `--output` path is provided.
- Generated sample JSON remains ignored by git and keeps `persisted=false` so it
  matches the read-only frontend loader safety contract.
- Every order-related UI is labeled Paper Only.
- No live trading controls are present.
- No approval, ranking, best-strategy, order, broker, Risk Engine, or OMS action is
  exposed from the packet viewer.
- Release Baseline dashboard displays:
  `Marketing Website = external presentation candidate`,
  `Web Command Center = internal demo candidate`,
  `Paper Research Preview = internal technical preview`, and
  `Production Trading Platform = NOT READY`.
- Release Baseline dashboard keeps `TRADING_MODE=paper`,
  `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`, and
  `live_trading_enabled=false` visible.
- Release Baseline dashboard lists validation status for
  `release-readiness-check`, `make check`, and GitHub Actions release gate.
- Release Baseline dashboard lists known non-production gaps and does not claim
  production trading readiness.
- Command Center tabs group the read-only surfaces into Release, Paper OMS,
  Research Packet, and Contracts sections without adding mutation paths.
- Customer Demo Guided Flow provides a customer-safe walkthrough and keeps all
  steps presentation-only.
- Local Backend Demo Mode must clearly distinguish production Vercel fallback /
  local JSON evidence inspection from actual local paper record querying through
  a local backend.
- Local Backend Demo Mode must show `make launch-self-service-paper-demo` plus
  the manual fallback commands needed to run backend, frontend, demo seed, and
  persistence verification without enabling live trading.
- Deployment Data Boundary must show `PRODUCTION_SQLITE_ACCESS=false` and
  `LOCAL_BACKEND_REQUIRED_FOR_RECORDS=true`.
- `make local-backend-demo-browser-drill` must verify the complete seeded local
  demo read path without creating real orders, calling brokers, or using
  production Vercel direct SQLite access.
- Demo guide controls may change the active guide step or copy a checklist, but
  they must not call backend mutation APIs.
- Refresh/retry only reloads frontend status. It must not call mutation endpoints.
- Backend-unavailable troubleshooting panel explains safe fallback behavior and
  shows `make seed-paper-execution-demo` as an explicit local demo setup command.
- Paper demo evidence export is available through the explicit local command
  `make paper-demo-evidence-export`. It reads local SQLite in read-only mode and
  produces stdout evidence by default, with optional local JSON or Markdown output
  only when `--output` is supplied.
- Paper Demo Evidence Viewer is a read-only local JSON viewer in the Paper OMS
  tab. It parses explicitly selected evidence JSON client-side, validates safety
  flags, and never uploads files, calls backend mutation APIs, writes databases,
  collects credentials, calls brokers, creates orders, or grants live approval.
- Paper Execution Approval Workflow panel is read-only and displays only paper
  simulation status, required route, and safety indicators.
- Paper Execution Approval Workflow panel does not include submit buttons,
  simulation triggers, broker connection controls, or live controls.
- Paper execution persistence status is display-only. It may show local record counts,
  but it must not create records, mutate records, upload files, write remote databases,
  or expose broker/live controls.
- Paper OMS / Audit Query Viewer uses only existing read-only query APIs:
  `/api/paper-execution/runs`,
  `/api/paper-execution/runs/{workflow_run_id}/oms-events`, and
  `/api/paper-execution/runs/{workflow_run_id}/audit-events`.
- Paper OMS / Audit Query Viewer renders an empty safe state when no local SQLite
  paper records exist or when the backend is unavailable.
- Paper OMS / Audit Query Viewer supports selecting a persisted workflow row and
  fetching that workflow's OMS and audit timelines through read-only endpoints.
- Copy buttons may copy IDs to the clipboard, but they must not write backend state.
- Research Review Packet loader can load a bundled safe sample or clear the local
  JSON selection without uploading files, writing databases, or mutating backend
  state.
- Paper OMS / Audit Query Viewer does not submit simulations, create order intents,
  alter persisted records, call brokers, call Risk Engine mutation paths, call OMS
  mutation paths, or provide trading recommendations.

## Safety Constraints

- Do not add live order buttons.
- Do not add approve-live or approve-paper-execution buttons.
- Do not turn decision counts into rankings, recommendations, or performance claims.
- Do not collect broker credentials.
- Do not show production readiness claims.
- The packet viewer is a read-only display surface. It must not write databases,
  create order intents, call brokers, call Risk Engine, or call OMS.
- The local JSON loader is client-side inspection only. Rejected packets must remain
  rejected if any execution, approval, ranking, broker, Risk Engine, OMS, persistence,
  or performance-claim flag is unsafe.
- The sample generator must not upload files, call backend mutation APIs, write
  databases, call brokers, call Risk Engine, call OMS, create orders, or approve
  paper/live execution.
- Loader safety fixtures are local static JSON only. They must not contain secrets,
  broker credentials, account IDs, tokens, or any executable approval workflow.
- The Release Baseline endpoint and dashboard are read-only status surfaces. They
  must not write databases, call brokers, call Risk Engine, call OMS, create
  orders, approve paper execution, approve live trading, or imply production
  readiness.
- The Paper Execution Approval Workflow panel is a display surface only. It must not
  create paper simulations, create order intents, call Risk Engine, call OMS, call
  Broker Gateway, write databases, connect brokers, or expose live controls.
- The Paper Simulation Controlled Submit UI is the only allowed paper mutation in
  this release. It may call `/api/paper-execution/workflow/record` only, with
  a persisted `approval_request_id` whose approval history has reached
  `approved_for_paper_simulation`, the approved signal payload, small quantity, and
  a paper broker simulation outcome. It must not collect credentials, call real
  brokers, expose live approval, or submit real orders.
- Paper approval workflow API is available as a backend foundation. The Command
  Center may display approval queue/history as read-only data through
  `GET /api/paper-execution/approvals/status`,
  `GET /api/paper-execution/approvals/queue`, and
  `GET /api/paper-execution/approvals/history`.
- The Paper Approval Decision UI may submit paper-only reviewer decisions only to
  `POST /api/paper-execution/approvals/requests/{approval_request_id}/decisions`.
  It must not create approval requests, create paper simulations, call Risk Engine,
  call OMS, call Broker Gateway, collect credentials, connect brokers, expose live
  approval, or grant production authorization.
- The Paper Approval Request UI may submit paper-only local approval requests only
  to `POST /api/paper-execution/approvals/requests`. It creates `pending_review`
  requests from signals-only payloads and must not create reviewer decisions, paper
  simulations, order intents, OMS records, broker gateway calls, credential flows,
  account login, or live approval.
- The paper execution persistence status panel is also display-only. It reads
  `GET /api/paper-execution/persistence/status` and must not call
  `/workflow/record`, broker endpoints, Risk Engine mutation paths, OMS mutation paths,
  or any live approval path.
- The Paper OMS / Audit Query Viewer is a display surface only. It must not call
  `/api/paper-execution/workflow/record`, any paper simulation submit endpoint, any
  approval escalation endpoint, any broker endpoint, or any live-control path.
- The Paper OMS Reliability Viewer is a display surface only. It may read
  `/api/paper-execution/reliability/status`, `/api/paper-execution/outbox`,
  `/api/paper-execution/orders/{order_id}/execution-reports`, and
  `/api/paper-execution/reliability/timeout-candidates`. It may also call
  `POST /api/paper-execution/reliability/timeout-preview` and
  `POST /api/paper-execution/reliability/timeout-mark` only for explicit
  paper-only timeout handling. Preview must not write. Mark may write only local
  SQLite EXPIRE OMS metadata, audit metadata, and simulated execution-report
  metadata. It must not process outbox workers, call brokers, collect
  credentials, approve execution, enable live trading, or imply production OMS
  readiness.
- The Safe Read-Only Interaction Layer may expose refresh, tab switching, row
  selection, clipboard copy, bundled sample loading, and local JSON clearing only.
  It must not create orders, write databases, upload local JSON, call broker
  endpoints, call Risk Engine mutation paths, call OMS mutation paths, approve paper
  execution, approve live trading, or collect credentials.
- The Customer Demo Guided Flow may expose Previous, Next, Reset, step selection,
  and Copy checklist controls only. It must not submit simulations, create orders,
  write databases, upload files, call brokers, call Risk Engine mutation paths, call
  OMS mutation paths, collect credentials, or imply production readiness.
- The Local Backend Demo Mode panel is explanatory and clipboard-only. It must
  not make production Vercel read local SQLite, write databases, upload local
  files, call brokers, create orders, collect credentials, or imply that Vercel
  production can display local SQLite records without a local backend/API.
- The Paper Broker Simulation Model UI may preview local quote-based paper outcomes
  through `/api/paper-execution/broker-simulation/preview` only. It must not submit
  workflow records, write databases, download market data, call Risk Engine, call
  OMS, call real brokers, collect credentials, or imply production matching logic.
- Paper Broker Simulation Evidence Export is an explicit local command:
  `make paper-broker-simulation-evidence-export`. It captures one quote-based
  preview input/output pair with paper-only safety flags and prints JSON to stdout
  by default. It must not write databases, download market data, call brokers,
  create orders, call Risk Engine, call OMS, call Broker Gateway execution paths,
  collect credentials, or imply production matching logic. A local `.json` file may
  be written only when `--output` is explicitly supplied.
- Paper Broker Simulation Evidence Viewer is a read-only local JSON viewer in the
  Paper OMS tab. It parses explicitly selected evidence JSON client-side, validates
  `paper_only=true`, `live_trading_enabled=false`, `broker_api_called=false`,
  `external_market_data_downloaded=false`, and `production_execution_model=false`,
  and never uploads files, writes databases, calls backend mutation APIs, calls
  brokers, creates orders, calls Risk Engine, calls OMS, calls Broker Gateway
  execution paths, collects credentials, or grants live approval.
- Persisted paper records shown in the viewer are audit metadata only. They must not
  be presented as execution performance, investment advice, strategy ranking, or
  production trading readiness.

## Suggested Commands

```bash
cd frontend && npm run typecheck
cd frontend && npm run build
make frontend-i18n-check
make paper-approval-ui-flow-smoke-check
make paper-execution-workflow-check
make paper-execution-persistence-check
make paper-broker-simulation-evidence-export
make paper-broker-simulation-ui-check
make paper-audit-integrity-check
make sample-research-review-packet
make research-review-packet-fixtures-check
cd backend && .venv/bin/python -m pytest tests/test_release_baseline_routes.py
cd backend && .venv/bin/python -m pytest tests/test_research_review_packet.py
make check
```

## Next Implementation Notes

Future shadow trading should observe market data and theoretical orders without sending broker-bound requests.
Future packet viewer work may load explicit local JSON artifacts or persisted packet
metadata after a separate persistence design exists. It must remain read-only until
Phase 4 Risk/OMS and future Phase 6 readiness controls are reviewed.
If future persistence is added, it must be implemented as a separate reviewed slice
with server-side schema validation and audit rules. The current loader intentionally
does not persist or upload local packet JSON.
The local sample export command exists only to produce a small, safe fixture for
manual reviewer UI testing.
The fixture suite under `frontend/test-fixtures/research-review-packets/` exists
to exercise the loader's accept/reject behavior before a browser test framework is
introduced.
The fixture CLI is intentionally dependency-free and does not introduce Vitest,
Playwright, backend behavior, persistence, uploads, broker calls, Risk Engine calls,
or OMS calls.
The Release Baseline dashboard should remain a status and audit-readiness surface.
Future changes may add historical release comparisons, but must not add release
approval buttons, live-trading enablement, broker actions, or production-readiness
claims without a separate Phase 6 readiness and compliance review.
The paper execution persistence status panel now shows local SQLite paper workflow
record counts only. Future UI may add read-only tables for persisted runs and events,
but must not add paper simulation submit controls, approval escalation, broker
connection controls, or live trading controls without a separate reviewed slice.
The Paper OMS / Audit Query Viewer now displays persisted local paper workflow
records as read-only audit metadata. Future work may add filtering and pagination,
but must keep mutation, broker, approval, recommendation, and live-trading behavior
out of the viewer.
The Safe Read-Only Interaction Layer now provides the minimum interaction needed for
customer evaluation: tabs, refresh/retry, selectable paper runs, timeline reload,
clipboard copy, bundled safe packet loading, local JSON clearing, and backend
troubleshooting. Future UI enhancements should preserve this read-only boundary and
avoid adding submit, approval, live, broker, credential, or persistence controls.
The Customer Demo Guided Flow now gives reviewers a predictable seven-step path
through the Command Center. Future guide changes should remain educational and
local-state-only, without turning the tour into an execution, approval, onboarding,
credential, ranking, or recommendation workflow.
The paper approval workflow foundation is the next backend dependency for a more
productized paper simulation submit flow. The current frontend still uses the
controlled demo submit path, while the Command Center can now show approval
queue/history as read-only workflow context. Future UI should require persisted
approval history before allowing paper simulation submission.
The Paper OMS Reliability Viewer now surfaces local-only outbox metadata,
idempotency key counts, simulated execution report metadata, timeout candidates,
non-production gaps, and explicit paper-only timeout preview/mark actions. Future
work should keep this panel bounded to local paper metadata until a separate
backend slice introduces durable queues, asynchronous processing, amend/replace,
and reconciliation under explicit paper-only tests.
The Paper Broker Simulation Model UI now exposes quote, size, spread, quote-age,
order-type, limit-price, and liquidity-score inputs for previewing a local paper
broker outcome. Future UI work may connect this preview to controlled paper submit
payloads only after a separate approval and audit review; it must not download
external market data, call brokers, bypass Risk Engine/OMS, or imply production
execution modeling.
The Paper Audit Integrity panel now shows local SQLite audit hash-chain verification
status, latest event-level checks, known gaps, and warnings. It is read-only and
does not repair audit chains, write databases, upload records, call brokers,
collect credentials, create orders, grant live approval, or claim WORM / immutable
audit compliance.
The Paper Audit Integrity Evidence Viewer now lets reviewers explicitly select a
local JSON evidence file exported by `scripts/verify-paper-audit-integrity.py`.
It validates paper-only safety flags and displays the verification summary,
event checks, and warnings client-side only. It must not upload evidence, call
backend APIs, write databases, repair hash chains, call brokers, collect
credentials, create orders, grant live approval, or claim WORM / immutable audit
compliance.
