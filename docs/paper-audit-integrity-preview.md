# Paper Audit Integrity Layer Preview

## Purpose

Paper Audit Integrity Layer Preview adds a local, paper-only verification layer for
paper workflow audit events stored in SQLite. It helps reviewers detect broken
local audit hash-chain metadata before the platform has a production WORM audit
service.

This is not a production audit system. It is not WORM storage, immutable storage,
external signing, centralized audit, regulated compliance approval, or live
trading readiness.

## Scope

- Store `previous_hash` and `event_hash` metadata for new local paper audit events.
- Verify local SQLite paper audit events in read-only mode.
- Detect missing hash metadata, broken hash chains, duplicate `audit_id` values,
  and workflow continuity issues.
- Expose read-only API endpoints for Web Command Center display.
- Provide a local CLI that writes only stdout by default.
- Allow optional explicit small local JSON output with `--output`.

## Commands

```bash
make seed-paper-execution-demo
make paper-audit-integrity-check
backend/.venv/bin/python scripts/verify-paper-audit-integrity.py
backend/.venv/bin/python scripts/verify-paper-audit-integrity.py \
  --output data-pipeline/reports/paper_audit_integrity.preview.json
```

Generated report JSON under `data-pipeline/reports/*.json` remains ignored by git.

## API

```text
GET /api/paper-execution/audit-integrity/status
GET /api/paper-execution/audit-integrity/verify
GET /api/paper-execution/audit-integrity/verify?workflow_run_id=<id>
GET /api/paper-execution/runs/{workflow_run_id}/audit-integrity
```

All endpoints are read-only and local SQLite only.

## Verification Model

Each new paper audit event stores:

- `previous_hash`
- `event_hash`

The event hash is calculated from:

- `workflow_run_id`
- `audit_id`
- actor / action / resource
- timestamp
- `paper_only`
- metadata payload
- previous hash

The first event in each workflow uses a zero genesis hash. Later events must
reference the previous event hash.

## Safety Flags

The verification output must preserve:

```text
paper_only=true
local_sqlite_only=true
live_trading_enabled=false
broker_api_called=false
worm_ledger=false
immutable_audit_log=false
centralized_audit_service=false
production_audit_compliance=false
```

## Non-Goals

- No external database write.
- No WORM ledger.
- No production immutable audit log.
- No centralized audit service.
- No broker API call.
- No credential collection.
- No order creation.
- No OMS mutation.
- No live trading enablement.

## Web Command Center

The Web Command Center may display:

- latest verification status
- audit event count
- missing hash count
- broken chain count
- duplicate `audit_id` count
- event-level hash check summaries
- known gaps and warnings

It must remain read-only. It must not repair chains, upload records, write
databases, call brokers, collect credentials, create orders, or grant live
approval.

## Validation

```bash
make paper-audit-integrity-check
cd backend && .venv/bin/python -m pytest tests/test_audit_integrity.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

Live trading remains disabled by default.
