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

## Safety Constraints

- Do not implement real broker order submission.
- Do not add broker SDKs.
- Do not bypass Risk Engine or OMS.
- Do not let strategies create orders directly.
- Do not treat `approved_for_paper_research` as approval for paper execution.
- Do not expose live controls in the Web Command Center.

## Suggested Commands

```bash
make paper-execution-workflow-check
cd backend && pytest tests/test_exposure_allocator.py tests/test_risk_engine.py tests/test_roadmap_routes.py
make check
```

## Next Implementation Notes

Next safe slice: persist paper OMS and audit events to PostgreSQL only after the
in-memory approval workflow, risk contract, and Paper Broker Gateway simulations
remain stable under tests.
