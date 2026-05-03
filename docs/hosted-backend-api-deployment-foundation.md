# Hosted Backend API Deployment Foundation

## Purpose

This document defines the first hosted backend/API foundation slice for the Hosted Paper product path. It turns the deployment boundary into an explicit, testable contract before any hosted database, customer account, reviewer login, tenant, broker integration, or live trading capability is introduced.

The current customer-operable paper workflow still requires local backend + local SQLite. Production Vercel can display Web Command Center UI, fallback samples, readiness panels, and local JSON evidence viewers, but it cannot read local SQLite paper records.

The Web Command Center now has an environment-aware API base URL contract. A
future Production Vercel deployment can read a hosted paper backend when
`NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL` is configured. If that public value is
not configured, the frontend falls back to `NEXT_PUBLIC_BACKEND_URL`, then
`http://localhost:8000`. These values are public routing configuration only and
must never contain secrets, broker credentials, account IDs, certificates, or
tokens.

## Implemented API

```text
GET /api/hosted-backend/environment
GET /api/hosted-backend/readiness
GET /api/hosted-paper/web-command-center/readiness
GET /api/hosted-paper/security-operations/readiness
```

These endpoints are read-only metadata. They do not authenticate users, create sessions, create tenants, write databases, write hosted records, call Risk Engine, call OMS, call Broker Gateway, call broker SDKs, collect credentials, create orders, or enable live trading.

## Response Requirements

The hosted backend environment contract must expose:

```text
current_environment: local / dev / staging / production
hosted_backend_enabled: false or staging_only
managed_datastore_enabled: false
local_sqlite_allowed_for_hosted: false
tenant_isolation_required: true
live_trading_enabled: false
broker_provider: paper
production_trading_ready: false
```

## Environment Boundary

| Environment | Purpose | Hosted backend state | Data boundary | Trading boundary |
| --- | --- | --- | --- | --- |
| `dev` | Developer-only backend rehearsal | `not_enabled` | Local SQLite allowed only for local demo, never as hosted datastore | Paper Only, no broker |
| `staging` | Future hosted paper API rehearsal | `staging_only` | Future controlled managed datastore testing only | Paper Only, no broker |
| `production` | Future hosted paper SaaS boundary | `not_ready` | Managed datastore required before hosted customer use | Live trading disabled |

Production Trading Platform remains `NOT READY`. A hosted backend deployment does not imply live trading, broker connectivity, real order routing, production OMS readiness, or production audit compliance.

## Required Foundation Before Hosted Customer Use

1. Hosted backend deployment target with health, readiness, CORS, and environment separation.
2. Managed datastore with tenant-scoped hosted paper records.
3. Auth/session provider with customer and reviewer identity.
4. RBAC / ABAC enforcement for paper approval and paper submit actions.
5. Tenant isolation on every hosted paper API path and persisted record.
6. Hosted paper workflow persistence for approval, OMS, risk, broker simulation, audit, and evidence records.
7. Retention, export, and audit integrity controls.
8. Staging security and operations review.
9. Secrets management, rate limiting, audit monitoring, observability, staging
   smoke, load/abuse, and auth boundary test gates.

## Explicit Non-Goals

This slice does not:

- deploy a customer SaaS workspace
- connect to a managed datastore
- write hosted records
- read hosted records
- create customer accounts
- create reviewer login
- create tenants
- collect credentials
- call broker APIs
- create paper orders
- create real orders
- enable live trading
- claim production trading readiness

## Infrastructure Placeholder

See:

```text
infra/hosted-backend/README.md
infra/hosted-backend/env-boundary.placeholder.md
```

These files are placeholders only. They are not deployment instructions for production customer traffic and must not be used to provision secrets or live trading routes.

## Validation

```bash
make hosted-backend-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_hosted_backend_environment_routes.py
make hosted-paper-api-readiness-check
make hosted-paper-security-operations-check
make check
```

## Acceptance Criteria

- `GET /api/hosted-backend/environment` returns HTTP 200.
- `GET /api/hosted-backend/readiness` returns HTTP 200.
- `GET /api/hosted-paper/web-command-center/readiness` returns HTTP 200.
- `GET /api/hosted-paper/security-operations/readiness` returns HTTP 200.
- The response includes `current_environment`.
- The response marks `managed_datastore_enabled=false`.
- The response marks `local_sqlite_allowed_for_hosted=false`.
- The response marks `tenant_isolation_required=true`.
- The frontend supports `NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL` as a public
  hosted backend API base URL.
- The Web Command Center displays mock login status, tenant, role, and
  permission context without enabling real login or hosted mutations.
- The response marks `live_trading_enabled=false`.
- The response marks `broker_provider=paper`.
- The response marks `production_trading_ready=false`.
- The docs explain dev / staging / production separation.
- The docs explain that local SQLite is not a hosted datastore.
- The security operations readiness response keeps secret storage, rate
  limiting, hosted audit monitoring, hosted observability, staging smoke,
  load/abuse tests, auth boundary tests, broker calls, hosted writes, and live
  trading disabled until reviewed implementation slices exist.

Live trading remains disabled by default.
