# Phase 4: Risk, OMS, and Paper Broker Gateway

## Objective

Create a paper-only execution core where order intents are evaluated by Risk Engine, tracked by OMS, and acknowledged by a paper broker gateway.

## Deliverables

- TX/MTX/TMF exposure allocator.
- RiskConfig, OrderIntent, and RiskDecision models.
- In-memory OMS state machine.
- PaperBrokerGateway.
- Backend paper APIs.
- Paper execution approval workflow:
  - `StrategySignal` remains signal-only.
  - Platform creates `PaperOrderIntent` only after
    `approved_for_paper_simulation`.
  - Risk Engine evaluates every paper intent before broker simulation.
  - OMS records lifecycle transitions for acknowledgement, rejection,
    partial fill, fill, and cancellation.
- Paper Broker Gateway simulates outcomes only and never submits real orders.
- Paper Broker Gateway simulation model preview:
  - `POST /api/paper-execution/broker-simulation/preview` derives a paper outcome
    from a caller-provided local quote snapshot, order type, limit price, available
    size, quote age, spread, and liquidity score.
  - `PaperExecutionWorkflowRequest.broker_simulation_model` can optionally use that
    same local model to derive the paper broker outcome instead of relying only on a
    directly supplied deterministic `broker_simulation`.
  - This is still paper-only, local, and not a production matching engine or live
    liquidity model.
- Paper Broker simulation readiness boundary:
  - `GET /api/paper-execution/broker-simulation/readiness` reports that the
    current simulation is deterministic/local quote-based paper scaffolding, not
    real market matching or a broker execution report model.
  - It keeps real market matching, exchange order book replay, broker execution
    report modeling, latency/queue position modeling, slippage/liquidity
    calibration, real account reconciliation, and production execution modeling
    disabled.
  - The endpoint is read-only and does not create orders, call Risk Engine, call
    OMS, call Broker Gateway execution paths, write databases, download market
    data, call brokers, collect credentials, or claim real fill accuracy.
- Audit events are emitted for approval, intent creation, risk evaluation,
  broker simulation, and OMS lifecycle recording.
- Paper approval workflow foundation:
  - `POST /api/paper-execution/approvals/requests` creates local paper-only
    approval queue entries.
  - `POST /api/paper-execution/approvals/requests/{approval_request_id}/decisions`
    appends review decisions.
  - `approved_for_paper_simulation` requires prior `research_approved` and a
    distinct second reviewer.
  - Approval history is queryable and hash-chained for local tamper-evidence.
  - This is not production login, production RBAC, production WORM storage, or live
    approval.
- Paper compliance approval readiness:
  - `GET /api/paper-execution/approvals/compliance-readiness` exposes read-only
    metadata that the local approval workflow is paper scaffolding only.
  - Formal compliance approval, production approval authority, verified reviewer
    identity, RBAC/ABAC enforcement, WORM ledger, centralized audit service,
    paper execution approval, and live approval remain unavailable through this
    readiness endpoint.
- Local paper OMS/audit persistence:
  - `POST /api/paper-execution/workflow/record` records a paper workflow run to
    local SQLite only.
  - Query APIs expose persisted paper workflow runs, OMS events, and audit events.
  - The default path is `data/paper_execution_audit.sqlite`.
  - Generated `.sqlite` files remain ignored by git.
- Paper OMS reliability foundation:
  - Local SQLite records idempotency keys to reject duplicate paper order intents
    across workflow sessions.
  - Local outbox metadata records completed paper workflow submission records for
    review. This is not an asynchronous worker or distributed durable queue.
  - Execution report records summarize simulated acknowledgements, fills,
    partial fills, rejections, cancellations, and expirations.
  - Timeout candidate scans identify nonterminal paper orders that may need
    review.
  - Explicit paper-only timeout preview/mark endpoints can validate and append a
    local SQLite `EXPIRE` OMS event, audit event, and simulated execution report.
    This is not an asynchronous production timeout worker.
  - Reliability status explicitly reports `production_oms_ready=false`.
- Paper OMS production readiness boundary:
  - `GET /api/paper-execution/reliability/production-readiness` reports that the
    current Paper OMS is local scaffolding, not a production OMS.
  - It keeps asynchronous processing, distributed durable queues, outbox workers,
    full timeout workers, amend/replace, broker execution report ingestion, and
    formal reconciliation disabled.
  - The endpoint is read-only and does not submit orders, mutate OMS state, write
    databases, call brokers, collect credentials, approve live trading, or claim
    production readiness.
- Controlled Paper Simulation UI:
  - The Web Command Center may call only
    `/api/paper-execution/workflow/record`.
  - The UI must reference a persisted `approval_request_id` whose local approval
    history has reached `approved_for_paper_simulation`.
  - The backend verifies that the submitted `StrategySignal` matches the signal
    payload associated with the persisted approval request.
  - The UI must not collect credentials, expose live approval, or call a real broker.

## Acceptance Criteria

- Risk Engine rejects over-limit exposure.
- Risk Engine rejects when live trading is enabled.
- Paper orders return simulated acknowledgements only.
- OMS uses event-style state transitions.
- Paper execution workflow refuses `rejected`, `needs_data_review`, and
  `research_approved` decisions before any paper order intent is created.
- Paper execution workflow converts only signal-only `StrategySignal` payloads into
  platform-owned `PaperOrderIntent` objects.
- Paper broker simulations can produce acknowledgement, rejection, partial fill,
  fill, and cancellation states without any real broker SDK call.
- Paper broker simulation model preview can derive acknowledgement, rejection,
  partial fill, or fill from local quote and liquidity inputs without downloading
  market data, calling brokers, or writing databases.
- Paper workflow records can be queried by workflow run ID, order ID, and audit event
  list endpoints.
- Persistence status reports local-only SQLite counts for runs, OMS events, and audit
  events.
- Paper OMS reliability status reports local-only outbox metadata, idempotency key
  count, execution report count, timeout candidates, and known production gaps.
- Paper timeout handling preview does not write, and paper timeout mark writes only
  local SQLite metadata with `paper_only=true`, `broker_api_called=false`, and
  `production_oms_ready=false`.
- Controlled UI submissions create local SQLite paper records only and preserve
  `paper_only=true`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
- Paper approval queue and history can be queried without broker calls, credentials,
  external databases, or live approval.

## Safety Constraints

- Do not implement real broker order submission.
- Do not add broker SDKs.
- Do not bypass Risk Engine or OMS.
- Do not let strategies create orders directly.
- Do not treat `approved_for_paper_research` as approval for paper execution.
- Do not expose live controls in the Web Command Center.
- Do not treat local SQLite persistence as production OMS storage.
- Do not write paper execution records to external databases without a separate
  reviewed persistence design.
- Do not treat local approval queue records as production identity, final compliance
  approval, or live readiness.
- Do not describe the local paper approval workflow as a formal compliance
  approval system.
- Do not let a client-supplied `approval_decision` become the source of authority
  for paper simulation. Controlled Paper Submit must use persisted approval history.
- Do not treat the local outbox metadata as asynchronous production processing.
- Do not treat paper execution reports as broker execution reports.
- Do not treat explicit paper timeout mark as production timeout processing.
- Do not treat the Paper OMS production readiness panel as production OMS
  enablement. It is a read-only gap statement.
- Do not treat deterministic or local quote-based Paper Broker simulation as real
  market matching, broker execution reports, or production execution modeling.
- Do not implement amend/replace or reconciliation loops without a separate paper-only
  design and tests.
- Do not treat the local quote-based paper broker simulation model as production
  matching logic, certified liquidity modeling, broker execution reporting, or
  investment advice.

## Suggested Commands

```bash
make paper-risk-guardrails-check
make paper-broker-simulation-model-check
make paper-broker-simulation-readiness-check
make paper-approval-workflow-check
make paper-execution-workflow-check
make paper-execution-persistence-check
make paper-oms-reliability-check
make paper-oms-timeout-check
make paper-oms-production-readiness-check
cd backend && pytest tests/test_exposure_allocator.py tests/test_risk_engine.py tests/test_roadmap_routes.py
make check
```

## Next Implementation Notes

Next safe slice: expose quote-based paper broker simulation model inputs in the Web
Command Center as an explicit Paper Only demo control if needed. Do not add external
market data downloads, asynchronous workers, external databases, live adapters,
amend/replace, real broker execution reports, or reconciliation loops until the
paper-only contracts and release readiness gates remain stable under tests.

## Paper Risk Guardrail Expansion

The Phase 4 paper risk layer now includes a paper-only guardrail set for:

- price reasonability
- max order size by TX / MTX / TMF contract
- margin proxy
- duplicate idempotency key detection
- daily loss state tracking
- position limit tracking
- paper kill switch placeholder
- simulated broker heartbeat placeholder

The guardrails return `RiskEvaluation` check details and are exposed through
`/api/paper-risk/status`, `/api/paper-risk/evaluate`, and
`/api/paper-risk/state/reset`. This is still a local paper simulation layer. It is
not a production risk engine, does not place orders, does not call broker APIs, and
does not enable live trading.

`make paper-risk-evidence-export` exports one paper risk evaluation evidence JSON
to stdout by default. With explicit `--output`, it writes a small local `.json`
artifact that captures the input intent, policy, local state, passed checks, failed
checks, and safety flags. The export does not write databases, create orders, call
OMS, call Broker Gateway, collect credentials, or call brokers.

## Paper Audit Integrity Preview

Paper audit integrity preview adds local SQLite hash-chain metadata to new paper
audit events and exposes read-only verification through:

- `GET /api/paper-execution/audit-integrity/status`
- `GET /api/paper-execution/audit-integrity/verify`
- `GET /api/paper-execution/runs/{workflow_run_id}/audit-integrity`
- `make paper-audit-integrity-check`

The preview verifies `previous_hash` / `event_hash` continuity for local paper
audit events and can detect missing hash metadata, broken chains, duplicate
`audit_id` values, and workflow continuity issues. It is still local paper
metadata only. It is not WORM storage, not an immutable audit log, not a
centralized audit service, and not production compliance certification.

## Paper Audit WORM Readiness Boundary

Paper audit persistence remains local SQLite plus paper-only hash-chain metadata.
A read-only readiness endpoint now documents the gap to production WORM storage:

```text
GET /api/paper-execution/audit-integrity/worm-readiness
make paper-audit-worm-readiness-check
```

This is not WORM storage, not an immutable audit ledger, not centralized audit,
not external signing, and not production audit compliance. Future WORM work must
include reviewed storage architecture, immutable schemas, retention/legal-hold
rules, append-only ingestion, signing/timestamping, RBAC/ABAC, tenant isolation,
and legal/security/compliance review.
