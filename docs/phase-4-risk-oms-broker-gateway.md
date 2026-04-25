# Phase 4: Risk, OMS, and Paper Broker Gateway

## Objective

Create a paper-only execution core where order intents are evaluated by Risk Engine, tracked by OMS, and acknowledged by a paper broker gateway.

## Deliverables

- TX/MTX/TMF exposure allocator.
- RiskConfig, OrderIntent, and RiskDecision models.
- In-memory OMS state machine.
- PaperBrokerGateway.
- Backend paper APIs.

## Acceptance Criteria

- Risk Engine rejects over-limit exposure.
- Risk Engine rejects when live trading is enabled.
- Paper orders return simulated acknowledgements only.
- OMS uses event-style state transitions.

## Safety Constraints

- Do not implement real broker order submission.
- Do not add broker SDKs.
- Do not bypass Risk Engine or OMS.

## Suggested Commands

```bash
cd backend && pytest tests/test_exposure_allocator.py tests/test_risk_engine.py tests/test_roadmap_routes.py
make check
```

## Next Implementation Notes

Next safe slice: persist OMS events to PostgreSQL only after in-memory contract tests are stable.
