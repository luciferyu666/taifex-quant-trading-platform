# Hosted Paper Backend/API Readiness

## Purpose

This document defines the next product path after local demo mode: a hosted
paper-only backend/API with a governed data layer.

The current Production Vercel frontend cannot directly read local SQLite. A
hosted paper backend/API is the correct future path for customers to log in to an
online environment and operate a paper workflow without running local services.

This document is a readiness specification only. It does not deploy a hosted
backend, enable live trading, add broker connectivity, collect credentials, or
claim production trading readiness.

## Current Gap

Today, real paper records are available through:

- local backend demo mode
- local SQLite through `PAPER_EXECUTION_AUDIT_DB_PATH`
- explicit local JSON evidence viewers

Customers cannot yet:

- authenticate into a hosted paper workspace
- access tenant-scoped paper records online
- persist paper approval/workflow records in a managed hosted datastore
- review hosted audit records with retention controls
- use a hosted paper API as the backend for Web Command Center operations

## Target Capability

Future hosted paper mode should support:

- customer login for paper evaluation only
- tenant-scoped paper workspaces
- role-based reviewer/operator permissions
- hosted paper approval requests and decisions
- controlled paper-only workflow submission
- hosted paper OMS/audit query APIs
- managed paper datastore
- audit integrity checks
- evidence export
- operational monitoring

It must preserve:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

## Proposed Architecture

```text
Vercel Web Command Center
  -> Hosted Paper API
  -> Auth / session boundary
  -> RBAC / ABAC policy check
  -> Paper approval service
  -> Paper risk guardrails
  -> Paper OMS workflow service
  -> Paper broker simulation service
  -> Managed paper datastore
  -> Paper audit integrity service
```

This architecture must not use local SQLite as a hosted datastore. Local SQLite
remains for local demo mode only.

## Required Boundaries

| Boundary | Requirement |
| --- | --- |
| Identity | Every hosted request must have authenticated user/session context. |
| Tenancy | Every paper record must be tenant-scoped. |
| Authorization | Reviewer/operator actions require RBAC or ABAC checks. |
| Data layer | Use a managed hosted datastore, not local SQLite. |
| Audit | Paper workflow, approval, OMS, and risk events must be append-only. |
| Broker | Broker SDK calls remain forbidden. |
| Live trading | Hosted paper mode must not enable live trading. |
| Secrets | No broker credentials, certificates, account IDs, or API keys are collected. |

## Future API Surface

The future API should expose paper-only endpoints behind authentication:

```text
GET  /api/hosted-paper/readiness
GET  /api/hosted-paper/status
GET  /api/hosted-paper/session
GET  /api/hosted-paper/tenants/current
GET  /api/hosted-paper/approvals/queue
POST /api/hosted-paper/approvals/requests
POST /api/hosted-paper/approvals/requests/{approval_request_id}/decisions
POST /api/hosted-paper/workflows/submit
GET  /api/hosted-paper/workflows
GET  /api/hosted-paper/workflows/{workflow_run_id}
GET  /api/hosted-paper/audit-events
GET  /api/hosted-paper/audit-integrity/verify
```

Initial implementation should use paper-only mock/session scaffolding before any
production identity provider is introduced.

The current implemented endpoint is:

```text
GET /api/hosted-paper/readiness
```

It returns a read-only readiness response showing:

- hosted paper backend is not enabled
- local demo mode remains the primary path for actual paper records
- Production Vercel remains read-only for UI, fallback samples, and explicit
  local JSON evidence
- live trading is disabled
- broker provider remains paper
- Production Trading Platform remains `NOT READY`

It does not authenticate users, write records, create orders, call Risk Engine,
call OMS, call Broker Gateway, call broker SDKs, collect credentials, or enable
live trading.

## Data Layer Requirements

Hosted paper records require a managed data layer with:

- tenant id
- user id / reviewer id
- approval request id
- workflow run id
- idempotency key
- order id
- OMS event records
- audit event records
- risk evaluation records
- paper broker simulation records
- hash-chain references
- retention metadata

The hosted datastore must not store:

- broker credentials
- real account IDs
- certificates
- private keys
- live broker tokens
- real order routing credentials

## Migration Path

1. Readiness specification and safety gate.
2. Hosted paper API status endpoint with paper-only static response.
3. Mock authenticated session contract for local and preview environments.
4. Tenant-scoped managed datastore adapter in dry-run mode.
5. Paper approval queue and decision APIs backed by hosted datastore.
6. Controlled paper submit using persisted hosted `approval_request_id`.
7. Hosted paper OMS/audit query viewer.
8. Evidence export for hosted paper records.
9. Security review before any production customer pilot.

## Non-Goals

- Live trading.
- Real broker integration.
- Broker credential upload.
- Production OMS claims.
- Production WORM audit claims.
- Investment advice.
- Strategy ranking or best-strategy selection.
- Copy trading, managed accounts, or signal subscriptions.

## Acceptance Criteria

Before hosted paper mode can be used for customer evaluation:

- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- authentication/session context exists
- tenant id is required for every persisted paper record
- role checks gate reviewer decisions and paper submit actions
- managed datastore is used instead of local SQLite
- no broker SDK package or call path exists
- no credential collection UI exists
- every hosted paper workflow has audit events
- Web Command Center clearly labels the mode as `Paper Only`
- Production Trading Platform remains `NOT READY`

## Verification Commands

Current readiness gate:

```bash
make hosted-paper-api-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_hosted_paper_readiness_routes.py
make check
```

Future implementation gates should add API tests, data-layer tests, security
tests, and UI smoke tests before hosted paper mode is exposed to customers.

Live trading remains disabled by default.
