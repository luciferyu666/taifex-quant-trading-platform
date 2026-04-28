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
- Paper Execution Approval Workflow panel is read-only and displays only paper
  simulation status, required route, and safety indicators.
- Paper Execution Approval Workflow panel does not include submit buttons,
  simulation triggers, broker connection controls, or live controls.
- Paper execution persistence status is display-only. It may show local record counts,
  but it must not create records, mutate records, upload files, write remote databases,
  or expose broker/live controls.

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
- The paper execution persistence status panel is also display-only. It reads
  `GET /api/paper-execution/persistence/status` and must not call
  `/workflow/record`, broker endpoints, Risk Engine mutation paths, OMS mutation paths,
  or any live approval path.

## Suggested Commands

```bash
cd frontend && npm run typecheck
cd frontend && npm run build
make paper-execution-workflow-check
make paper-execution-persistence-check
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
