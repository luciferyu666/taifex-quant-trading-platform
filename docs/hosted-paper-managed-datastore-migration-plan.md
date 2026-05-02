# Hosted Paper Managed Datastore Migration Plan

## Purpose

This document defines the dry-run migration planner for the future hosted paper managed datastore. It converts the existing schema-only readiness contract into a reviewable migration plan artifact without connecting to any database.

The current platform remains a local Paper Only demo and paper research preview. This planner does not enable hosted SaaS paper trading and does not make the system a production trading platform.

## CLI

```bash
make hosted-paper-datastore-migration-plan
```

Underlying script:

```bash
scripts/hosted-paper-datastore-migration-plan.py
```

Default behavior prints JSON to stdout. It writes nothing unless an operator explicitly provides a local `.json` path:

```bash
backend/.venv/bin/python scripts/hosted-paper-datastore-migration-plan.py \
  --output /tmp/hosted-paper-datastore-migration-plan.json
```

## Output Contract

The migration plan includes:

- future table names
- `tenant_id` requirements
- primary key drafts
- index drafts
- required fields
- retention and audit requirements
- controls required before any future apply path
- warnings
- `migration_apply_enabled=false`
- `connection_attempted=false`
- `database_url_read=false`

Future table drafts:

| Table | Tenant key | Purpose |
| --- | --- | --- |
| `hosted_paper_approval_requests` | `tenant_id` | Future paper approval request queue |
| `hosted_paper_approval_decisions` | `tenant_id` | Future reviewer decision history |
| `hosted_paper_workflow_runs` | `tenant_id` | Future paper workflow run summary |
| `hosted_paper_oms_events` | `tenant_id` | Future paper OMS timeline |
| `hosted_paper_audit_events` | `tenant_id` | Future paper audit trail |

## Safety Boundary

The planner is dry-run only:

- DATABASE_URL is not read.
- No database connection is configured or attempted.
- No hosted paper records are read or written.
- No customer account is created.
- No tenant is created.
- No reviewer login is created.
- No broker API is called.
- No order is created.
- No credentials are collected.
- Live trading remains disabled by default.

## Required Controls Before Future Apply

Before any future hosted datastore migration apply path exists, the project must define and review:

- approved managed datastore selection
- tenant-scoped schema ownership
- `tenant_id` enforcement on every hosted paper table
- authenticated customer and reviewer identity
- RBAC / ABAC enforcement
- backup and restore plan
- retention policy
- append-only audit path
- audit export and integrity verification
- staging migration rehearsal
- rollback plan
- security review

## Non-Goals

This planner does not:

- connect to a hosted database
- create hosted customer accounts
- create tenants
- create reviewer login
- write hosted records
- migrate local SQLite data
- create paper orders
- call Risk Engine, OMS, or Broker Gateway execution paths
- call real broker APIs
- enable live trading

## Validation

```bash
make hosted-paper-datastore-migration-plan
cd backend && .venv/bin/python -m pytest tests/test_hosted_paper_datastore_migration_plan_script.py
make hosted-paper-api-readiness-check
make check
```

## Acceptance Criteria

- The CLI emits valid JSON to stdout by default.
- The CLI writes a local `.json` artifact only when `--output` is provided.
- The plan lists all future hosted paper tables.
- Every table requires `tenant_id`.
- The plan includes primary key and index drafts.
- The plan includes retention and audit requirements.
- The plan marks `migration_apply_enabled=false`.
- The plan marks `connection_attempted=false`.
- The plan marks `database_url_read=false`.
- The plan never creates hosted records, accounts, tenants, reviewer logins, orders, broker calls, or credentials.

Live trading remains disabled by default.
