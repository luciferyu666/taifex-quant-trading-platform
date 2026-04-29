# Paper Approval Workflow Foundation

## Purpose

The previous paper execution flow accepted `approval_decision` directly in the paper
workflow request. That remains useful for controlled local demos, but it is not a
productized approval system.

This foundation adds a separate paper-only approval queue, approval history, role
metadata, dual-review rules, and append-only hash-chained records before any future
UI or workflow depends on approval state.

This is still **not** production authentication, production RBAC, production WORM
storage, broker integration, or live-trading approval.

## Current Scope

Implemented backend foundation:

- `backend/app/domain/paper_approval.py`
- `backend/app/services/paper_approval_store.py`
- `backend/app/api/paper_approval_routes.py`
- `backend/tests/test_paper_approval_store.py`
- `backend/tests/test_paper_approval_routes.py`

API prefix:

```text
/api/paper-execution/approvals
```

Endpoints:

```text
GET  /api/paper-execution/approvals/status
POST /api/paper-execution/approvals/requests
GET  /api/paper-execution/approvals/queue
GET  /api/paper-execution/approvals/history
GET  /api/paper-execution/approvals/requests/{approval_request_id}
GET  /api/paper-execution/approvals/requests/{approval_request_id}/history
POST /api/paper-execution/approvals/requests/{approval_request_id}/decisions
```

## Decision Model

Supported decisions:

| Decision | Meaning | Execution effect |
| --- | --- | --- |
| `research_approved` | Research reviewer allows continued paper-only review. | Does not create orders. |
| `approved_for_paper_simulation` | Second reviewer allows paper simulation only. | Does not approve live trading. |
| `rejected` | Stops the request. | No paper order path. |
| `needs_data_review` | Stops the request until data is reviewed. | No paper order path. |

## Dual-Review Rule

Paper simulation approval requires two distinct reviewers:

1. `research_approved` by `research_reviewer` or `compliance_reviewer`.
2. `approved_for_paper_simulation` by a different reviewer with `risk_reviewer` or
   `compliance_reviewer` role.

The same `reviewer_id` cannot approve both steps.

Rejected and needs-data-review decisions are terminal.

## Record Integrity

The local approval store uses append-only API behavior:

- Approval requests are inserted into `paper_approval_requests`.
- Approval decisions are inserted into `paper_approval_decisions`.
- Decisions are not updated by the API.
- Each decision includes `previous_chain_hash`.
- Each decision includes `decision_hash`.
- The second decision must point to the first decision hash.

This provides local tamper-evidence for demos and tests. It is not a production WORM
ledger, legal audit vault, or regulated record archive.

## Safety Rules

- `paper_only=true` is required.
- `approval_for_live=false` is required.
- `live_execution_eligible=false` is returned.
- `broker_api_called=false` is returned.
- No broker SDK is called.
- No credentials are collected.
- No real order is created.
- No external database is required.
- Local SQLite remains the only persistence backend in this slice.

## Relationship to Paper Execution

Controlled paper submit calls:

```text
POST /api/paper-execution/workflow/record
```

and must include a persisted `approval_request_id` whose approval history has
reached `approved_for_paper_simulation`. The backend loads the approval history from
local SQLite, verifies the required review sequence, confirms `approval_for_live=false`,
and checks that the submitted `StrategySignal` matches the signal associated with the
approval request.

The request no longer accepts `approval_decision` as the source of authority for
paper simulation.

## Web Command Center Approval Surfaces

The Web Command Center includes a read-only approval queue and history panel.
It reads these endpoints:

```text
GET /api/paper-execution/approvals/status
GET /api/paper-execution/approvals/queue
GET /api/paper-execution/approvals/history
```

The panel displays pending approval requests, current status, required review
sequence, reviewer history, hash-chain references, and paper-only safety flags.

The Web Command Center also includes a paper-only reviewer decision form. It may
submit decisions only to:

```text
POST /api/paper-execution/approvals/requests/{approval_request_id}/decisions
```

The decision form is intentionally narrow:

- It selects an existing pending approval request.
- It records only `research_approved`, `approved_for_paper_simulation`,
  `rejected`, or `needs_data_review`.
- It always sends `paper_only=true`.
- It does not create approval requests.
- It does not create paper simulations, order intents, or OMS records.
- It does not collect broker credentials or account data.
- It does not call brokers, Risk Engine, OMS, or Broker Gateway.
- It does not grant live-trading access.

Controlled Paper Submit remains a separate step and can proceed only after a
persisted approval request has completed the required review sequence.

## Validation

```bash
make paper-approval-workflow-check
cd backend && .venv/bin/python -m pytest \
  tests/test_paper_approval_store.py \
  tests/test_paper_approval_routes.py
make check
```

Live trading remains disabled by default.
