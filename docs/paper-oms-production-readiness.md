# Paper OMS Production Readiness Boundary

## Purpose

This document defines the boundary between the current local Paper OMS
scaffolding and a future production OMS.

The current implementation is useful for Paper Only demos, customer evaluation,
engineering review, and audit traceability. It is not a production OMS.
Paper OMS is not a production OMS.

Live trading remains disabled by default.

## Current Scope

- Deterministic paper OMS state machine and lifecycle transitions.
- Local SQLite paper workflow, OMS event, audit event, and execution-report
  metadata.
- Local outbox metadata for completed paper workflow submissions.
- Duplicate idempotency metadata checks across local paper records.
- Read-only timeout candidate scan.
- Explicit paper-only timeout preview and timeout mark.

## Read-Only API

```text
GET /api/paper-execution/reliability/production-readiness
```

The endpoint returns:

- `readiness_state=local_paper_oms_scaffolding_not_production_oms`
- `asynchronous_order_processing_enabled=false`
- `distributed_durable_queue_enabled=false`
- `outbox_worker_enabled=false`
- `full_timeout_worker_enabled=false`
- `amend_replace_enabled=false`
- `broker_execution_report_ingestion_enabled=false`
- `formal_reconciliation_loop_enabled=false`
- `production_oms_ready=false`

The endpoint is read-only metadata. It does not submit orders, process queues,
mutate OMS state, write databases, call brokers, collect credentials, or enable
live trading.

## Missing For Production OMS

- Asynchronous order processing worker.
- Distributed durable queue or production outbox worker.
- Crash-safe retry, dead-letter, and replay policy.
- Full automated timeout scheduler and recovery workflow.
- Amend and replace order lifecycle.
- Production-grade partial-fill quantity accounting.
- Broker execution report ingestion and normalization.
- Formal reconciliation loop against broker/account state.
- Operational monitoring, alerting, and incident runbooks.

## Required Before Production OMS

- Select and review durable queue/outbox architecture.
- Implement idempotent asynchronous OMS worker processing.
- Define retry, timeout, dead-letter, replay, and recovery semantics.
- Implement amend/replace and cancellation lifecycle contracts.
- Implement broker execution-report ingestion behind broker-gateway.
- Implement formal reconciliation loop and locked-state handling.
- Add load, failure-injection, recovery, and duplicate prevention tests.
- Complete security, operations, and legal/compliance review before live use.

## Web Command Center Boundary

The Web Command Center may show the production readiness status as a read-only
panel. It must not:

- submit orders,
- process outbox workers,
- mutate OMS state,
- approve paper execution,
- approve live trading,
- call broker APIs,
- collect broker credentials,
- claim production OMS readiness.

## Acceptance Criteria

- The API returns `production_oms_ready=false`.
- The UI explicitly states Paper OMS is not a production OMS.
- Safety defaults remain:
  - `TRADING_MODE=paper`
  - `ENABLE_LIVE_TRADING=false`
  - `BROKER_PROVIDER=paper`
- CI checks confirm the API, UI panel, docs, and safety copy exist.

## Validation

```bash
make paper-oms-production-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_paper_oms_production_readiness_routes.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```
