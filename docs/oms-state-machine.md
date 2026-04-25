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

The current implementation lives in `backend/app/domain/order_state_machine.py`. It does not call brokers, does not persist state, and is intended for tests and architecture scaffolding only.

## Acceptance Criteria

- Invalid transitions raise an error.
- Unknown states are explicit.
- `MARK_UNKNOWN` can be applied from any state.
- No broker call occurs inside the state machine.

## Testing Plan

```bash
cd backend && pytest tests/test_order_state_machine.py
```
