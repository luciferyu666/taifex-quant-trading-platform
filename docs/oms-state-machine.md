# OMS State Machine

## Purpose

OMS owns order lifecycle state after Risk Engine approval. It must provide deterministic transitions, idempotency, event history, and future recovery through event sourcing.

Current implementation is in-memory and paper-only.

## Order State List

- PENDING
- NEW
- RISK_CHECKED
- SUBMITTED
- ACCEPTED
- PARTIALLY_FILLED
- FILLED
- CANCEL_REQUESTED
- CANCELLED
- REJECTED
- EXPIRED
- UNKNOWN_NEEDS_RECONCILIATION

## Allowed Transitions

| From | Events |
| --- | --- |
| PENDING | CREATE, RISK_REJECT |
| NEW | RISK_APPROVE, RISK_REJECT, CANCEL_REQUEST, REJECT, EXPIRE |
| RISK_CHECKED | SUBMIT, CANCEL_REQUEST, REJECT, EXPIRE |
| SUBMITTED | ACKNOWLEDGE, CANCEL_REQUEST, REJECT, EXPIRE |
| ACCEPTED | PARTIAL_FILL, FILL, CANCEL_REQUEST, REJECT, EXPIRE |
| PARTIALLY_FILLED | PARTIAL_FILL, FILL, CANCEL_REQUEST, EXPIRE |
| CANCEL_REQUESTED | CANCEL, REJECT |
| FILLED | terminal |
| CANCELLED | terminal |
| REJECTED | terminal |
| EXPIRED | terminal |
| UNKNOWN_NEEDS_RECONCILIATION | terminal until manual recovery |

`MARK_UNKNOWN` is allowed from any state and moves the order to `UNKNOWN_NEEDS_RECONCILIATION`.

## Idempotency Key Rule

Every order requires an idempotency key before it enters OMS. Future durable OMS storage should reject duplicate idempotency keys for active order intents.

## Event-Sourced Future Design

Long-term OMS state should be rebuilt from immutable events. Event records should include source, sequence, timestamp, actor, reason, payload, and causation/correlation IDs.

## Recovery Model

If OMS state cannot be reconciled with broker state, the order must be marked `UNKNOWN_NEEDS_RECONCILIATION`. Future production systems should lock execution and require operator review.

## Paper-Only Current Implementation

The core state machine lives in `backend/app/domain/order_state_machine.py`. It does
not call brokers and remains deterministic.

The paper execution approval workflow now uses this state machine after a platform
review decision reaches `approved_for_paper_simulation`. The workflow records:

- `CREATE` when the platform creates a `PaperOrderIntent` from a signal-only
  `StrategySignal`.
- `RISK_APPROVE` or `RISK_REJECT` after Risk Engine evaluation.
- `SUBMIT` before the Paper Broker Gateway simulation.
- `ACKNOWLEDGE`, `REJECT`, `PARTIAL_FILL`, `FILL`, `CANCEL_REQUEST`, or `CANCEL`
  according to the simulated paper broker outcome.

`backend/app/services/paper_execution_store.py` can persist completed paper workflow
runs, OMS event history, and audit events to local SQLite through
`POST /api/paper-execution/workflow/record`. This persistence is local-only and
queryable for audit review. It is not a production OMS database, not an external
database integration, not a broker reconciliation source, and not connected to any
real broker.

## Acceptance Criteria

- Invalid transitions raise an error.
- Unknown states are explicit.
- `MARK_UNKNOWN` can be applied from any state.
- No broker call occurs inside the state machine.
- Paper execution tests cover acknowledgement, rejection, partial fill, fill, and
  cancellation simulations.
- Local paper persistence tests cover run records, OMS event records, audit event
  records, and query endpoints.

## Testing Plan

```bash
cd backend && pytest tests/test_order_state_machine.py
make paper-execution-workflow-check
make paper-execution-persistence-check
```
