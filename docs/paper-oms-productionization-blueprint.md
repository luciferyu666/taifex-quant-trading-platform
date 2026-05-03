# Paper OMS Productionization Blueprint

## Purpose

This document defines the next production-grade Paper OMS work as a reviewable
blueprint. It converts known OMS gaps into explicit design areas, required
runtime components, acceptance criteria, and safety boundaries.

This is not a production OMS implementation. It does not start workers, connect
to a hosted datastore, write records, call brokers, create orders, approve live
trading, or claim production readiness.

Live trading remains disabled by default.

## API Contract

```text
GET /api/paper-execution/reliability/productionization-blueprint
```

The endpoint returns read-only metadata:

- `service=paper-oms-productionization-blueprint`
- `blueprint_version=v1`
- `readiness_state=blueprint_only_no_production_oms`
- `productionization_areas`
- `proposed_processing_flow`
- `staged_delivery_order`
- `safety_defaults`
- `safety_flags`
- `warnings`

Required safety flags:

```text
paper_only=true
read_only=true
live_trading_enabled=false
broker_provider=paper
broker_api_called=false
order_created=false
queue_worker_started=false
async_processing_enabled=false
hosted_database_connected=false
database_written=false
external_db_written=false
credentials_collected=false
production_oms_enabled=false
production_trading_ready=false
```

## Productionization Areas

### Durable Queue And Outbox

Current state:

- Local SQLite stores outbox metadata for completed paper workflow submissions.
- No distributed durable queue or production outbox worker exists.

Required before production-grade paper OMS:

- queue provider selection and failure-mode review
- outbox schema with `tenant_id`, ordering, status, retry count, next retry time,
  dead-letter status, and replay metadata
- idempotent dispatcher
- dead-letter queue and replay CLI
- operator runbook for replay and stuck-message resolution

Acceptance criteria:

- outbox records survive process restart
- dispatch retries are idempotent
- replay is explicit and audit-visible

### Asynchronous Order Processing

Current state:

- Paper workflow processing is synchronous inside the API request.

Required before production-grade paper OMS:

- API enqueue path separated from OMS worker processing
- worker ownership and lease semantics
- retry, backoff, crash recovery, and stale lease handling
- worker heartbeat and metrics

Acceptance criteria:

- duplicate worker processing cannot create duplicate OMS events
- worker crash recovery resumes from durable state
- all state transitions remain deterministic

### Duplicate Prevention Across Sessions

Current state:

- Local SQLite checks idempotency keys for local paper workflow records.

Required before production-grade paper OMS:

- tenant-scoped idempotency ledger
- managed datastore unique constraints
- duplicate request response contract
- duplicate attempt audit events

Acceptance criteria:

- the same tenant cannot persist duplicate active idempotency keys
- cross-tenant idempotency keys remain isolated
- duplicate attempts are queryable for audit

### Timeout Handling Productionization

Current state:

- Timeout handling is an explicit Paper Only preview/mark action.

Required before production-grade paper OMS:

- automated timeout scanner
- timeout SLA matrix by OMS state
- stale-order recovery workflow
- operator escalation and locked-state policy

Acceptance criteria:

- nonterminal stale orders are detected automatically
- timeout actions are idempotent and auditable
- unknown orders enter review or locked state instead of silent mutation

### Execution Report Model

Current state:

- Paper execution report metadata is derived from simulated paper events.

Required before production-grade paper OMS:

- normalized execution report schema
- broker-gateway report adapter contract
- report sequence, duplicate, correction, and rejection policy
- report-to-OMS transition mapper

Acceptance criteria:

- execution reports are normalized before OMS mutation
- duplicate broker reports are ignored or reconciled deterministically
- unexpected reports mark orders for reconciliation

### Reconciliation Loop

Current state:

- Only simulated reconciliation helpers exist.

Required before production-grade paper OMS:

- recurring reconciliation worker
- platform order, broker order, fill, position, and account state comparison
- mismatch severity matrix
- locked-state workflow and operator resolution trail

Acceptance criteria:

- mismatches are detected and audit-visible
- critical mismatches lock execution paths
- operator resolution is tracked and reproducible

### Amend, Replace, And Cancel Lifecycle

Current state:

- Basic cancel metadata exists.
- Full amend/replace semantics do not exist.

Required before production-grade paper OMS:

- amend/replace intent schema
- risk validation path for amendments
- state transition table for amend, replace, cancel, late-fill, and reject paths
- broker gateway adapter contract

Acceptance criteria:

- amend/replace cannot bypass Risk Engine
- late fills after cancel/amend are reconciled
- all lifecycle changes are event-sourced and audit-visible

### Partial Fill Quantity Accounting

Current state:

- Paper partial fill metadata exists for demos.

Required before production-grade paper OMS:

- authoritative open quantity, cumulative fill, average price, and remaining
  quantity model
- correction and bust/cancel policy
- invariant checks
- position projection boundary

Acceptance criteria:

- cumulative fill never exceeds order quantity
- remaining quantity is deterministic after every report
- corrections are event-sourced and reconciled

## Proposed Processing Flow

Future production-grade paper OMS should follow this flow only after separate
review, tests, and staging validation:

1. API validates tenant, session, RBAC/ABAC, and paper-only environment.
2. API writes an idempotent order command plus transactional outbox record.
3. Durable queue/outbox dispatches the command to an OMS worker.
4. OMS worker leases the command and applies deterministic state transitions.
5. Broker gateway adapter emits normalized execution reports for paper/staging.
6. OMS maps execution reports to order events and quantity accounting records.
7. Reconciliation worker compares platform state with broker/account state.
8. Critical mismatches move affected workflows into locked review state.

## Staged Delivery Order

1. Review durable queue/outbox architecture and tenant-scoped schema.
2. Add staging-only managed datastore migrations behind explicit apply gates.
3. Implement idempotent async OMS worker for paper commands only.
4. Add execution report persistence and quantity accounting invariants.
5. Add automated timeout scanner with operator review state.
6. Add amend/replace/cancel lifecycle contracts and tests.
7. Add reconciliation loop and locked-state handling.
8. Run load, restart, duplicate, timeout, and reconciliation drills before any
   production claim.

## Explicit Non-Goals

- Do not start a durable queue worker in this slice.
- Do not implement async processing in this slice.
- Do not connect to a hosted database.
- Do not write hosted records.
- Do not call broker APIs.
- Do not collect credentials.
- Do not create real orders.
- Do not enable live trading.
- Do not claim production OMS readiness.

## Validation

```bash
make paper-oms-productionization-blueprint-check
cd backend && .venv/bin/python -m pytest tests/test_paper_oms_productionization_blueprint_routes.py
make paper-oms-production-readiness-check
make check
```

## Current Status

The current Paper OMS remains local paper scaffolding. It is suitable for Paper
Only demos, review workflows, local SQLite audit visibility, and readiness
boundary validation. It is not a production OMS, not a hosted SaaS execution
system, and not a live trading platform.
