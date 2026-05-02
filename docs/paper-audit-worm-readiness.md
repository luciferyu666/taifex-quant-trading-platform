# Paper Audit WORM Readiness Boundary

## Purpose

This document defines the boundary between the current local Paper Only audit
records and a future production WORM / immutable audit ledger.

The current implementation uses local SQLite records plus hash-chain metadata
for paper workflow demos, engineering review, and tamper-evidence preview. It is
not WORM storage, not an immutable ledger, not a centralized audit service, not
external signing, and not production audit compliance.

Live trading remains disabled by default.

## Current Scope

- Local SQLite paper audit records.
- Local hash-chain metadata for paper audit integrity preview.
- Read-only API metadata that describes current WORM readiness.
- Web Command Center display of the non-production audit posture.
- Local JSON evidence exported by paper-only audit verification scripts.

## Read-Only API

```text
GET /api/paper-execution/audit-integrity/worm-readiness
```

The endpoint returns:

- `readiness_state=local_sqlite_not_production_worm_ledger`
- `worm_storage_enabled=false`
- `immutable_ledger_enabled=false`
- `append_only_enforced_by_storage=false`
- `centralized_audit_service_enabled=false`
- `object_lock_enabled=false`
- `external_timestamping_enabled=false`
- `cryptographic_signing_enabled=false`
- `retention_policy_enforced=false`
- `production_audit_compliance=false`

The endpoint is read-only readiness metadata. It does not write databases,
repair chains, create orders, call brokers, collect credentials, or enable live
trading.

## Missing For Production WORM

- Storage-level WORM controls such as object lock or append-only ledger storage.
- Centralized audit service with controlled ingestion and review workflows.
- Cryptographic signing and external timestamping for audit records.
- Retention policy enforcement, legal hold, and deletion controls.
- Production RBAC/ABAC around audit access, export, and administration.
- Operational monitoring, incident response, and audit service recovery runbooks.
- Independent security, legal, and compliance review before WORM claims.

## Required Before Any WORM Claim

- Select a reviewed WORM-capable storage architecture.
- Define immutable audit schemas, retention periods, and legal hold rules.
- Implement append-only ingestion with immutable sequence guarantees.
- Add cryptographic signing, external timestamping, and key-management review.
- Add tenant-scoped audit access controls and reviewer identity enforcement.
- Create audited export workflows and operational review procedures.
- Complete security, legal, compliance, and disaster-recovery review.

## Web Command Center Boundary

The Web Command Center may show the WORM readiness status as a read-only panel.
It must not:

- claim production WORM compliance,
- claim immutable ledger compliance,
- repair or rewrite audit chains,
- upload local audit records,
- collect credentials,
- create orders,
- approve paper execution,
- approve live trading,
- call broker APIs.

## Acceptance Criteria

- The WORM readiness API returns `production_audit_compliance=false`.
- The Web Command Center displays that local SQLite is not a production WORM
  ledger.
- Safety defaults remain:
  - `TRADING_MODE=paper`
  - `ENABLE_LIVE_TRADING=false`
  - `BROKER_PROVIDER=paper`
- CI checks confirm the API, UI panel, docs, and safety copy exist.

## Validation

```bash
make paper-audit-worm-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_paper_audit_worm_readiness_routes.py
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

