# Paper Audit Compliance Trail Readiness

## Purpose

This document defines the gap between the current local paper audit trail and a
future formal audit / compliance trail.

The current implementation uses local SQLite and paper-only hash-chain metadata.
It is useful for demos, engineering review, and tamper-evidence preview. It is
not a formal append-only audit service, not WORM storage, not an immutable audit
ledger, and not production audit compliance.

Live trading remains disabled by default.

## API Contract

```text
GET /api/paper-execution/audit-integrity/compliance-trail-readiness
```

The endpoint returns read-only metadata:

- `service=paper-audit-compliance-trail-readiness`
- `readiness_state=local_sqlite_hash_chain_not_formal_compliance_trail`
- `capabilities`
- `requirements`
- `required_before_compliance_claim`
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
credentials_collected=false
auth_provider_enabled=false
reviewer_login_created=false
database_written=false
external_db_written=false
append_only_audit_service_enabled=false
immutable_log_claim=false
compliance_claim=false
production_trading_ready=false
```

## Current Scope

Current local paper audit capabilities:

- local SQLite paper audit records
- local hash-chain preview metadata
- local audit integrity verification
- local JSON evidence exports
- read-only WORM readiness boundary

These are not production compliance controls.

## Missing Capabilities

### Append-Only Audit Service

Current state:

- Audit events are persisted in local SQLite for demos and engineering review.

Missing:

- centralized append-only audit ingestion service
- monotonic sequence authority
- tenant-scoped correlation identifiers
- append-only storage enforcement
- service health, alerting, backup, and recovery monitoring

### Immutable Audit Log Or WORM Storage

Current state:

- Hash-chain metadata provides tamper-evidence preview only.

Missing:

- WORM-capable storage
- object lock or immutable ledger architecture
- cryptographic signing
- external timestamping
- legal hold and retention controls

### Reviewer Identity, RBAC, And ABAC

Current state:

- Reviewer IDs are local placeholders in paper approval and demo flows.

Missing:

- real identity provider
- reviewer login
- MFA for reviewer/operator/admin roles
- tenant-scoped RBAC
- ABAC policy enforcement
- session binding for privileged audit actions

### Decision History

Current state:

- Paper approval decisions are stored locally with hash-chain references.

Missing:

- immutable decision history
- verified reviewer/session claims
- correction and supersession policy
- dual-review and segregation-of-duty controls where required

### Retention Policy

Current state:

- Local SQLite demos do not enforce production retention.

Missing:

- tenant-aware retention schedule
- legal hold
- deletion-block workflow
- backup, restore, and disposal procedures
- retention review cadence

### Export Policy

Current state:

- Local JSON evidence exports are explicit and reviewer-operated for demos.

Missing:

- export request and approval workflow
- redaction and sensitive-field classification
- export checksum and chain-of-custody metadata
- export access logs
- export retention controls

## Required Before Any Compliance Claim

Before the platform can claim a formal audit/compliance trail:

1. Select and review append-only audit service architecture.
2. Select and review immutable audit log or WORM-capable storage.
3. Integrate verified reviewer identity, session, RBAC, ABAC, and tenant
   isolation.
4. Define immutable decision history schema and correction/supersession policy.
5. Define retention, legal hold, backup, restore, and disposal policies.
6. Define audit export approval, redaction, checksum, and access logging policy.
7. Complete security, legal, compliance, operations, and disaster-recovery review.

## Explicit Non-Goals

- Do not claim production audit compliance.
- Do not claim WORM readiness.
- Do not enable append-only audit service behavior in this slice.
- Do not add real reviewer login.
- Do not add RBAC/ABAC enforcement.
- Do not write to external databases.
- Do not collect credentials.
- Do not call brokers.
- Do not create orders.
- Do not enable live trading.

## Validation

```bash
make paper-audit-compliance-trail-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_paper_audit_compliance_trail_routes.py
make paper-audit-worm-readiness-check
make check
```

## Current Status

The current audit trail is paper-only local scaffolding. It can support customer
demo evidence, local review, and engineering verification. It is not formal
compliance infrastructure and must not be represented as production audit
readiness.
