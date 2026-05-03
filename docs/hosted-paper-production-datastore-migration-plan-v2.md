# Hosted Paper Production Datastore Migration Plan v2

## Purpose

This document defines a reviewable migration blueprint for the future Hosted
Paper production datastore.

The current platform still does not have a production hosted datastore. Local
SQLite remains allowed only for demo and developer workflows. This v2 planner
converts the production datastore readiness contract into a detailed blueprint
for future review, but it does not apply migrations or touch any database.

Live trading remains disabled by default.

## CLI

```bash
make hosted-paper-production-datastore-migration-plan-v2
```

Underlying script:

```bash
scripts/hosted-paper-production-datastore-migration-plan-v2.py
```

Default behavior prints JSON to stdout. It writes nothing unless an operator
explicitly provides a local `.json` path:

```bash
backend/.venv/bin/python scripts/hosted-paper-production-datastore-migration-plan-v2.py \
  --output /tmp/hosted-paper-production-datastore-migration-plan-v2.json
```

## Source Contract

```text
GET /api/hosted-paper/production-datastore/readiness
```

Expected source state:

```text
readiness_state=contract_only_no_production_datastore
recommended_datastore_pattern=managed_postgres_via_marketplace_candidate
production_datastore_enabled=false
managed_postgres_selected=false
marketplace_provisioning_enabled=false
hosted_records_writable=false
hosted_records_readable=false
migrations_apply_enabled=false
database_url_read=false
connection_attempted=false
apply_enabled=false
database_written=false
external_db_written=false
broker_api_called=false
order_created=false
production_trading_ready=false
```

## Output Contract

The v2 blueprint includes:

- `blueprint_type=hosted_paper_production_datastore_migration_plan_v2`
- `blueprint_version=v2`
- source contract reference
- readiness state
- recommended datastore pattern
- migration phases
- table, column, index, and constraint drafts
- backup requirements
- restore requirements
- retention boundaries
- required controls before apply
- safety flags
- reproducibility hash

The output must keep:

```text
dry_run_only=true
migration_apply_enabled=false
automatic_apply_enabled=false
database_url_read=false
connection_attempted=false
database_written=false
external_db_written=false
hosted_records_written=false
customer_account_created=false
tenant_created=false
reviewer_login_created=false
broker_api_called=false
order_created=false
```

## Future Production Tables

Every table must include `tenant_id`.

| Record Group | Table |
| --- | --- |
| `paper_approval` | `hosted_paper_approval_requests` |
| `paper_approval` | `hosted_paper_approval_decisions` |
| `paper_order` | `hosted_paper_workflow_runs` |
| `paper_order` | `hosted_paper_orders` |
| `paper_order` | `hosted_paper_risk_evaluations` |
| `oms_event` | `hosted_paper_oms_events` |
| `oms_event` | `hosted_paper_execution_reports` |
| `oms_event` | `hosted_paper_outbox_events` |
| `audit_event` | `hosted_paper_audit_events` |
| `audit_event` | `hosted_paper_audit_integrity_snapshots` |
| `audit_event` | `hosted_paper_evidence_exports` |

## Migration Phases

The v2 blueprint lists future phases only. All phases keep `apply_enabled=false`
in this slice.

1. `preflight_review`
2. `schema_draft`
3. `backup_restore_retention_review`
4. `staging_rehearsal_future`

No phase is executable yet.

## Backup, Retention, And Restore

Production paper records need these controls before any customer-hosted pilot:

- scheduled backup policy
- point-in-time recovery
- tenant-scoped restore procedure
- restore drill evidence
- failed migration rollback procedure
- retention policy for paper approval records
- retention policy for paper order and workflow records
- retention policy for OMS event timelines
- append-only audit event retention
- legal hold review before deletion

This planner only lists the requirements. It does not configure backup,
retention, restore, legal hold, or WORM storage.

## Safety Boundary

The v2 planner is dry-run only:

- DATABASE_URL is not read.
- No production database connection is configured or attempted.
- No hosted paper records are read or written.
- No production migration apply path exists.
- No customer account is created.
- No tenant is created.
- No reviewer login is created.
- No broker API is called.
- No Risk Engine, OMS, or Broker Gateway execution path is called.
- No order is created.
- No credentials are collected.
- Local SQLite remains demo/development only.
- Production Trading Platform remains NOT READY.

Safety defaults:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

## Validation

```bash
make hosted-paper-production-datastore-migration-plan-v2
cd backend && .venv/bin/python -m pytest \
  tests/test_hosted_paper_production_datastore_migration_plan_v2_script.py
make hosted-paper-production-datastore-readiness-check
make check
```

## Acceptance Criteria

- CLI emits valid JSON to stdout by default.
- CLI writes local `.json` only when `--output` is explicitly provided.
- CLI does not expose `DATABASE_URL` even if present in the environment.
- Blueprint includes all future production tables.
- Every future production table requires `tenant_id`.
- Blueprint includes column, index, and constraint drafts.
- Blueprint includes backup, retention, and restore requirements.
- Blueprint marks `migration_apply_enabled=false`.
- Blueprint marks `database_url_read=false`.
- Blueprint marks `connection_attempted=false`.
- Blueprint marks `hosted_records_written=false`.
- Blueprint creates no hosted records, tenants, customer accounts, reviewer
  logins, orders, broker calls, or credentials.

Live trading remains disabled by default.
