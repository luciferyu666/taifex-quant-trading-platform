# Hosted Paper Tenant Boundary Evidence Export

## Purpose

This document defines the local evidence export for the Hosted Paper mock
session and tenant boundary.

The export is a reviewer artifact only. It proves that the current hosted paper
surface is still a read-only contract with no login, no session issuance, no
hosted datastore writes, no broker calls, no credential collection, and no live
trading.

## Command

```bash
make hosted-paper-tenant-boundary-evidence-export
```

The command prints a small JSON evidence artifact to stdout by default.

To write a local JSON file explicitly:

```bash
backend/.venv/bin/python scripts/export-hosted-paper-tenant-boundary-evidence.py \
  --output data-pipeline/reports/hosted_paper_tenant_boundary.preview.json
```

Generated JSON evidence under `data-pipeline/reports/*.json` must remain
uncommitted.

## Evidence Contents

The evidence includes:

- `evidence_type=hosted_paper_tenant_boundary_evidence`
- `evidence_id`
- `generated_at`
- `service=hosted-paper-mock-session-contract`
- `contract_state=mock_read_only`
- mock session metadata
- mock tenant context
- future role schema
- future permission schema
- granted read-only permissions
- denied permissions
- denied mutation permissions
- safety defaults
- safety flags
- boundary assertions
- warnings

## Required Boundary Assertions

The evidence must show:

```text
authenticated=false
authentication_provider=none
session_cookie_issued=false
hosted_paper_enabled=false
hosted_datastore_enabled=false
hosted_datastore_written=false
local_sqlite_access=false
credentials_collected=false
broker_credentials_collected=false
broker_api_called=false
live_trading_enabled=false
production_trading_ready=false
mutation_permissions_granted=false
```

## Denied Mutation Permissions

The evidence must keep these permissions denied:

- `create_paper_approval_request`
- `record_paper_reviewer_decision`
- `submit_approved_paper_workflow`
- `enable_live_trading`
- `upload_broker_credentials`

These denied permissions are contract metadata only. They do not enable hosted
paper workflow mutation, broker credential upload, live approval, or live
trading.

## Safety Rules

- Paper Only.
- Read-only contract evidence only.
- Defaults to stdout.
- Writes local JSON only when `--output` is explicitly provided.
- Does not authenticate users.
- Does not issue session cookies.
- Does not write databases.
- Does not write hosted datastore records.
- Does not read or write local SQLite.
- Does not collect credentials.
- Does not collect broker credentials.
- Does not call brokers or broker SDKs.
- Does not create orders.
- Does not call Risk Engine, OMS, or Broker Gateway execution paths.
- Does not approve paper execution.
- Does not approve live trading.
- Does not claim production trading readiness.

## Verification Commands

```bash
make hosted-paper-tenant-boundary-evidence-export
make hosted-paper-mock-session-check
cd backend && .venv/bin/python -m pytest tests/test_hosted_paper_tenant_boundary_evidence_export_script.py
make check
```

Live trading remains disabled by default.
