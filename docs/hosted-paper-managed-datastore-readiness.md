# Hosted Paper Managed Datastore Readiness Contract

## Purpose

This document defines the first schema-only contract for a future hosted paper managed datastore. It exists to make the SaaS gap explicit before any hosted database, customer account, or tenant record write is introduced.

The current platform remains a local demo and paper research preview. Production Vercel can show the Web Command Center UI and safe fallback data, but it cannot read local SQLite paper records.

## Current Status

- Hosted paper managed datastore: not enabled.
- Hosted paper records: not readable and not writable.
- Hosted backend/API customer workspace: not enabled.
- Customer account / reviewer login: not enabled.
- Tenant isolation enforcement: not enabled.
- Migration apply: disabled.
- Database connection: not configured and not attempted.
- Live trading: disabled by default.

## API Contract

`GET /api/hosted-paper/datastore-readiness`

The endpoint returns read-only metadata only. It does not connect to a database, does not read hosted records, does not write hosted records, does not create customer accounts, and does not create orders.

The production datastore boundary is tracked separately at:

```text
GET /api/hosted-paper/production-datastore/readiness
```

That contract lists the future production record groups for paper approvals,
paper orders, OMS events, and audit events, and keeps the response state at
`contract_only_no_production_datastore`. It does not read `DATABASE_URL`, does
not connect to a database, does not apply migrations, and does not write hosted
records. See `docs/hosted-paper-production-datastore-readiness.md`.

## Tenant Key

All future hosted paper tables must include:

```text
tenant_id
```

The `tenant_id` must be present on every future hosted paper record and every hosted paper read/write API path. It is not optional and must not be inferred only from client-side state.

## Future Hosted Record Models

| Table | Purpose | Primary identifiers |
| --- | --- | --- |
| `hosted_paper_approval_requests` | Paper-only approval request queue | `tenant_id`, `approval_request_id` |
| `hosted_paper_approval_decisions` | Reviewer decision history | `tenant_id`, `approval_decision_id` |
| `hosted_paper_workflow_runs` | Paper workflow run summary | `tenant_id`, `workflow_run_id` |
| `hosted_paper_oms_events` | Paper OMS state timeline | `tenant_id`, `workflow_run_id`, `event_id` |
| `hosted_paper_audit_events` | Paper audit trail | `tenant_id`, `audit_event_id` |

These are future hosted models only. They do not replace the current local SQLite demo store in this slice.
Local SQLite remains demo/development only and is not allowed as the production
hosted paper datastore.

## Migration Boundary

Current migration mode:

```text
schema_contract_only
```

Rules:

- Dry-run only.
- Apply is disabled.
- Automatic migration apply is disabled.
- A database URL must be reviewed before any future apply path exists.
- No database connection is configured or attempted in this slice.
- Required controls before future apply:
  - hosted backend/API deployment boundary reviewed
  - dev / staging / production environment separation reviewed
  - approved managed datastore selection
  - `tenant_id` required on every hosted paper table
  - migration dry-run output reviewed
  - backup and restore plan documented
  - retention policy approved
  - security review completed

## Migration Plan Dry-Run

The schema-only contract can be converted into a reviewable migration plan artifact:

```bash
make hosted-paper-datastore-migration-plan
```

Underlying script:

```bash
scripts/hosted-paper-datastore-migration-plan.py
```

The planner emits JSON to stdout by default. It does not read `DATABASE_URL`, does not connect to a hosted database, does not create tenants, does not create customer accounts, does not create reviewer login, does not write hosted records, does not call brokers, and does not create orders.

The plan must keep:

```text
migration_apply_enabled=false
connection_attempted=false
database_url_read=false
```

## Retention And Audit Requirements

Future hosted paper records require explicit retention and audit rules before hosted customer use:

- Approval records must be retained through the customer evaluation window plus review hold.
- Paper workflow records must be retained through the paper evaluation and audit review period.
- Audit events require an append-only retention policy before hosted use.
- Exports must be available for reviewer/customer evidence.
- Hosted audit events must support integrity verification before any hosted paper pilot.

## Non-Goals

This contract does not:

- create a hosted database
- deploy hosted backend/API customer workspace
- connect to a hosted database
- create customer accounts
- create reviewer login
- write hosted paper records
- read hosted paper records
- collect broker credentials
- call broker APIs
- create real orders
- enable live trading
- claim production trading readiness

## Acceptance Criteria

- `GET /api/hosted-paper/datastore-readiness` returns the schema-only contract.
- The response includes `tenant_id` as the required tenant key.
- The response lists the future hosted paper record models.
- The response marks hosted reads/writes as disabled.
- The response marks migration apply as disabled and connection attempted as false.
- `make hosted-paper-datastore-migration-plan` emits a dry-run plan listing table names, `tenant_id`, primary key drafts, index drafts, retention requirements, and audit requirements without connecting to a database.
- Web Command Center displays the contract as read-only metadata.
- Safety defaults remain `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.

Live trading remains disabled by default.
