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

Current controlled paper submit still calls:

```text
POST /api/paper-execution/workflow/record
```

and includes `approval_decision=approved_for_paper_simulation` in the request payload.
That path remains a controlled demo path.

The next productization step is to make the submit UI and paper workflow reference a
persisted `approval_request_id` whose history has reached
`approved_for_paper_simulation`, instead of trusting a decision value submitted by the
client.

## Validation

```bash
make paper-approval-workflow-check
cd backend && .venv/bin/python -m pytest \
  tests/test_paper_approval_store.py \
  tests/test_paper_approval_routes.py
make check
```

Live trading remains disabled by default.
