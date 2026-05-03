# Hosted Paper SaaS Foundation Roadmap

## Purpose

This document defines the path from the current local Paper Only demo to a
future hosted paper SaaS product.

The current system is not a complete SaaS paper trading product. Actual paper
workflow records require local backend + local SQLite. Production Vercel is a
read-only presentation surface and cannot directly read a user's local SQLite
paper records.

## Implemented First Slice

The first hosted paper SaaS slice is a read-only environment contract:

```text
GET /api/hosted-backend/environment
GET /api/hosted-backend/readiness
GET /api/hosted-paper/environment
GET /api/hosted-paper/readiness
GET /api/hosted-paper/web-command-center/readiness
GET /api/hosted-paper/datastore-readiness
GET /api/hosted-paper/production-datastore/readiness
GET /api/hosted-paper/sandbox-tenant/onboarding-readiness
GET /api/hosted-paper/identity-access-contract
GET /api/hosted-paper/auth-provider-selection
GET /api/hosted-paper/security-operations/readiness
```

`GET /api/hosted-backend/environment` and
`GET /api/hosted-backend/readiness` define the deployable backend/API boundary
before any hosted customer workspace exists. They expose dev / staging /
production separation, mark Hosted Paper customer SaaS as not enabled, mark the
future managed datastore as disabled, forbid local SQLite as a hosted datastore,
require tenant isolation, and keep live trading disabled.

`GET /api/hosted-paper/environment` defines three explicit modes:

| Mode | Current Status | Meaning |
| --- | --- | --- |
| Local Demo Mode | Primary local demo | Actual paper records can be created and read only through local backend + local SQLite. |
| Hosted Paper Mode | NOT ENABLED | Future SaaS paper workspace requiring hosted backend, auth, tenant isolation, and managed datastore. |
| Production Trading Platform | NOT READY | No live trading, broker connectivity, real order routing, or production OMS readiness. |

The endpoint is read-only metadata. It does not authenticate users, create
sessions, write databases, create orders, call brokers, collect credentials, or
enable live trading.

`GET /api/hosted-paper/web-command-center/readiness` defines how the Production
Vercel Web Command Center can resolve a future hosted paper backend API base
URL without embedding secrets or enabling hosted SaaS operations. The frontend
resolution order is `NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL`,
`NEXT_PUBLIC_BACKEND_URL`, then `http://localhost:8000`. These are public
routing values only, not authentication. The UI can display mock login status,
tenant, roles, and permissions from the existing mock session contract, while
real login, customer accounts, RBAC/ABAC enforcement, managed datastore writes,
broker access, and live trading remain disabled.

`GET /api/hosted-paper/datastore-readiness` defines the future managed
datastore contract for hosted paper records. It lists tenant-scoped record
models, the required `tenant_id` key, dry-run migration boundaries,
retention requirements, and audit requirements. It is schema-only and does not
connect to a hosted database, read hosted records, or write hosted records.

The datastore contract can be rendered as a dry-run migration plan:

```bash
make hosted-paper-datastore-migration-plan
```

The planner outputs a reviewable JSON artifact with future table names,
`tenant_id` requirements, primary key drafts, index drafts, retention/audit
requirements, `migration_apply_enabled=false`, `connection_attempted=false`,
and `database_url_read=false`. It does not read `DATABASE_URL`, connect to a
database, create hosted records, create customer accounts, create tenants,
create reviewer login, call brokers, or create orders.

`GET /api/hosted-paper/production-datastore/readiness` defines the production
datastore boundary for the future hosted paper SaaS product. It is a read-only,
contract-only response that lists required production record groups for paper
approval, paper order, OMS events, and audit events. It marks local SQLite as
demo/development only, requires a future managed Postgres-style datastore
review, and keeps migration apply, database connection, hosted writes, backup
configuration, retention enforcement, and restore drill verification disabled
until a formal datastore implementation slice is approved.

The production datastore readiness contract can be converted into a more
detailed dry-run migration blueprint:

```bash
make hosted-paper-production-datastore-migration-plan-v2
```

The v2 blueprint lists future production tables, column drafts, index drafts,
constraint drafts, backup requirements, restore requirements, retention
boundaries, and required controls before apply. It keeps
`migration_apply_enabled=false`, `database_url_read=false`,
`connection_attempted=false`, and `hosted_records_written=false`.

`GET /api/hosted-paper/sandbox-tenant/onboarding-readiness` defines the
customer onboarding boundary for a future online sandbox tenant. It documents
the target browser-only customer experience, guided demo data contract, and
required onboarding steps while keeping sandbox tenant provisioning, customer
accounts, login/session, hosted records, broker calls, order creation, and live
trading disabled.

`GET /api/hosted-paper/identity-access-contract` defines the future hosted
paper identity, session, tenant, RBAC, and ABAC boundary. It separates
`customer`, `reviewer`, `operator`, and `admin` responsibilities, but remains a
read-only contract. It does not select an auth provider, create real login,
issue sessions, create customer accounts, enforce RBAC/ABAC, write hosted
records, collect credentials, call brokers, or enable live trading.

`GET /api/hosted-paper/auth-provider-selection` compares Clerk, Auth0, Descope,
and Vercel OIDC / Sign in with Vercel against future hosted paper SaaS identity
needs. It remains a read-only selection matrix with
`selection_state=selection_matrix_only`; it does not select, install, configure,
or enable any provider, create accounts, issue sessions, add secrets, write
hosted records, call brokers, or create orders.

`GET /api/hosted-paper/security-operations/readiness` defines the security and
operations boundary for future hosted paper SaaS. It lists secrets management,
rate limiting, audit monitoring, observability, CI/CD gates, staging smoke
tests, load/abuse tests, auth boundary tests, and incident runbooks as required
controls. It keeps secret storage, runtime rate limiting, hosted audit
monitoring, hosted observability, staging smoke, load/abuse/auth boundary test
gates, customer accounts, hosted writes, broker calls, and live trading
disabled.

## Required SaaS Foundation Path

1. Hosted backend/API deployment foundation
2. Managed datastore migration plan review
3. Production datastore readiness contract and provider security review
4. Managed database with tenant-scoped hosted paper records
5. Auth provider selection and security review
6. Auth/session identity access contract
7. Tenant isolation enforcement
8. RBAC/ABAC enforcement
9. Paper workflow persistence
10. Hosted customer demo tenant
11. Browser-only sandbox tenant onboarding
12. Guided demo data seeding
13. Security / operations readiness controls
14. Staging smoke, load, abuse, and auth boundary tests

## Environment Boundary

| Capability | Local Demo | Hosted Paper | Production Trading |
| --- | --- | --- | --- |
| Actual paper records | Local only | Future | Not available |
| Data store | Local SQLite | Future managed datastore | Future production datastore |
| Customer login | Not enabled | Required before SaaS | Required before production |
| Tenant isolation | Not enabled | Required before SaaS | Required before production |
| Broker SDK | Forbidden | Forbidden | Not enabled |
| Live trading | Disabled | Disabled | NOT READY |

## Current Customer Path

Use:

```bash
make customer-demo-env-check
make start-customer-demo
```

This starts the customer self-service local demo path. It remains Paper Only,
local machine only, and does not create hosted customer accounts.

## Non-Goals

- Do not enable live trading.
- Do not add real broker SDK calls.
- Do not collect broker credentials, account IDs, certificates, or API keys.
- Do not create hosted customer accounts in this slice.
- Do not write hosted paper records in this slice.
- Do not connect to a hosted database in this slice.
- Do not claim production trading readiness.
- Do not describe paper simulation as real market matching.

## Acceptance Criteria

- `GET /api/hosted-paper/environment` returns Local Demo Mode as the current
  customer path.
- `GET /api/hosted-backend/environment` returns the hosted backend/API
  deployment boundary with dev / staging / production separation.
- `GET /api/hosted-backend/readiness` marks managed datastore disabled, local
  SQLite forbidden for hosted records, tenant isolation required, broker
  provider paper, live trading disabled, and Production Trading Platform
  `not_ready`.
- Hosted Paper Mode returns `not_enabled`.
- Production Trading Platform returns `not_ready`.
- `GET /api/hosted-paper/datastore-readiness` returns
  `schema_only_no_hosted_datastore`.
- `make hosted-paper-datastore-migration-plan` emits the dry-run datastore
  migration plan without reading `DATABASE_URL` or connecting to a database.
- `GET /api/hosted-paper/production-datastore/readiness` returns
  `contract_only_no_production_datastore`, lists paper approval, paper order,
  OMS event, and audit event production record groups, and keeps
  `database_url_read=false`, `connection_attempted=false`, `apply_enabled=false`,
  and `local_sqlite_allowed_for_production=false`.
- `make hosted-paper-production-datastore-migration-plan-v2` emits a dry-run
  migration blueprint for future production paper approval, paper order, OMS
  event, and audit event tables without reading `DATABASE_URL`, connecting to a
  database, applying migrations, or writing hosted records.
- `GET /api/hosted-paper/identity-access-contract` returns
  `contract_only_not_implemented` and separates customer, reviewer, operator,
  and admin boundaries.
- `GET /api/hosted-paper/auth-provider-selection` returns
  `selection_matrix_only` and compares Clerk, Auth0, Descope, and Vercel OIDC /
  Sign in with Vercel without selecting or enabling any provider.
- `GET /api/hosted-paper/security-operations/readiness` returns
  `readiness_contract_only_not_operational`, marks CI release readiness and
  production smoke gates enabled, and marks secrets management, rate limiting,
  audit monitoring, observability pipeline, staging smoke, load, abuse, and auth
  boundary gates not enabled.
- `GET /api/hosted-paper/sandbox-tenant/onboarding-readiness` returns
  `contract_only_no_online_sandbox_tenant`, keeps
  `online_sandbox_tenant_enabled=false`, `customer_account_created=false`,
  `hosted_datastore_written=false`, `broker_api_called=false`,
  `order_created=false`, and `live_trading_enabled=false`, and lists the future
  guided demo data contract.
- Future hosted paper record models require `tenant_id`.
- Migration apply remains disabled and no hosted database connection is
  attempted.
- Safety defaults remain:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

- The Web Command Center displays Local Demo Mode, Hosted Paper Mode, and
  Production Trading Platform status as read-only metadata.
- `make hosted-paper-api-readiness-check` validates the endpoint, docs, tests,
  and frontend panel.
- `make hosted-backend-readiness-check` validates the hosted backend foundation
  docs, placeholder infra, API routes, and tests.
- `make hosted-paper-production-datastore-readiness-check` validates the
  production datastore readiness API, Web Command Center panel, docs, and safety
  boundaries without reading `DATABASE_URL`.
- `make hosted-paper-sandbox-onboarding-check` validates the sandbox tenant
  onboarding readiness API, Web Command Center panel, docs, and safety
  boundaries without creating tenants, accounts, sessions, records, orders, or
  broker connections.

Live trading remains disabled by default.
