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
- Audit events are emitted for approval, intent creation, risk evaluation,
  broker simulation, and OMS lifecycle recording.
- Local paper OMS/audit persistence:
  - `POST /api/paper-execution/workflow/record` records a paper workflow run to
    local SQLite only.
  - Query APIs expose persisted paper workflow runs, OMS events, and audit events.
  - The default path is `data/paper_execution_audit.sqlite`.
  - Generated `.sqlite` files remain ignored by git.

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
- Paper workflow records can be queried by workflow run ID, order ID, and audit event
  list endpoints.
- Persistence status reports local-only SQLite counts for runs, OMS events, and audit
  events.

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

## Suggested Commands

```bash
make paper-execution-workflow-check
make paper-execution-persistence-check
cd backend && pytest tests/test_exposure_allocator.py tests/test_risk_engine.py tests/test_roadmap_routes.py
make check
```

## Next Implementation Notes

Next safe slice: add read-only filters and export tooling around persisted paper
workflow records. Do not move to external databases, live adapters, or real broker
execution until paper-only persistence, audit querying, and release readiness gates
remain stable under tests.
