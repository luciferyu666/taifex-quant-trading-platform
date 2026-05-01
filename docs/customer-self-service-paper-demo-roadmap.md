# Customer Self-Service Paper Demo Roadmap

## Purpose

This roadmap turns the current Production Vercel / local SQLite limitation into
a concrete product path for customer evaluation.

Production Vercel cannot directly read a user's local SQLite paper execution
database. Actual persisted paper approval, OMS, audit, risk, and
audit-integrity records require either:

- local backend demo mode with a shared `PAPER_EXECUTION_AUDIT_DB_PATH`, or
- a future controlled hosted paper backend/API with a governed data layer.

The goal is to make paper-only evaluation easier without weakening the existing
safety boundary.

## Current State

The current Web Command Center can:

- render release status, safety defaults, and bilingual safety copy on
  Production Vercel
- show fallback paper-safe UI when backend APIs are unavailable
- load explicitly selected local JSON evidence files client-side
- display actual paper records when the reviewer runs the local FastAPI backend
  and local frontend against the same local SQLite database

The current Web Command Center cannot:

- read local SQLite directly from Production Vercel
- call a user's local FastAPI backend from Production Vercel as a supported data
  access model
- create paper records from Production Vercel
- collect broker credentials
- call broker SDKs
- enable live trading

## Near-Term Track: Local Self-Service Demo Package

The next safe product step is a local self-service demo package. It should make
the existing local backend + local SQLite workflow repeatable for a customer or
reviewer without turning Production Vercel into a data access layer.

Suggested scope:

- one command to validate local prerequisites
- one command to create a temporary paper-only SQLite store
- one command to seed or create a demo paper approval workflow
- one command to launch local FastAPI and local Next.js
- browser instructions for opening `http://localhost:3000/?lang=zh`
- clear teardown instructions
- local evidence export commands for demo review

Required safety defaults:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

Acceptance criteria:

- local browser can show actual paper approval, OMS, audit, risk, and
  audit-integrity records
- local SQLite path is explicit
- no broker SDK is called
- no external database is written
- no real order is created
- Production Vercel remains read-only and does not access local SQLite

Existing commands that support this track:

```bash
make launch-self-service-paper-demo
make self-service-paper-demo-launcher-check
make frontend-local-backend-demo-check
make local-backend-demo-browser-drill
make seed-paper-execution-demo
make paper-execution-persistence-check
make paper-demo-evidence-export
```

## Future Track: Hosted Paper Backend/API

A hosted paper backend/API is a separate architecture step. It should not reuse
local SQLite as a production data layer.

Required design gates before implementation:

- authentication and session management
- RBAC/ABAC for reviewer and operator roles
- tenant isolation
- managed paper datastore
- append-only audit event model
- retention policy
- audit integrity verification
- rate limiting and abuse protection
- OpenTelemetry traces and operational monitoring
- explicit paper/live separation
- production incident and rollback plan

See [hosted-paper-backend-api-readiness.md](hosted-paper-backend-api-readiness.md)
for the hosted paper backend/API readiness specification. See
[hosted-paper-auth-boundary-spec.md](hosted-paper-auth-boundary-spec.md) for the
future login, session, RBAC, ABAC, and tenant boundary. The auth boundary spec is
paper-only design work; it does not enable customer login, credential collection,
hosted datastore writes, broker connectivity, or live trading.
The read-only mock session contract is documented in
[hosted-paper-mock-session-contract.md](hosted-paper-mock-session-contract.md).
Reviewer evidence for that mock session, tenant context, role schema,
permission schema, and denied mutation boundary is documented in
[hosted-paper-tenant-boundary-evidence-export.md](hosted-paper-tenant-boundary-evidence-export.md).

Hosted paper backend/API non-goals:

- live broker connectivity
- credential upload
- live order placement
- investment advice
- strategy ranking or best-strategy selection
- production trading readiness claims

## UI Requirements

The Web Command Center should keep three modes visible:

| Mode | Status | User Message |
| --- | --- | --- |
| Production Vercel | Read-only presentation surface | Can show release status, safety copy, fallback UI, and local JSON evidence viewers. Cannot read local SQLite. |
| Local backend demo | Customer/reviewer demo path | Can show actual paper records when backend, frontend, and SQLite run locally. |
| Future hosted paper API | Future product direction | Requires separate security, data, and operations review. |

Any button or link that starts paper activity must be available only in local
backend demo mode or future hosted paper mode. Production Vercel must keep the
data access boundary explicit.

## Verification Checklist

Before customer evaluation:

- `make frontend-production-smoke-check` passes
- `make frontend-local-backend-demo-check` passes
- `make local-backend-demo-browser-drill` passes when local browser automation is
  available
- `make customer-evaluation-check` passes
- `.env.example` contains paper-only safety defaults

During customer evaluation:

- explain that Production Vercel cannot read local SQLite
- use local backend demo mode for actual paper records
- use local JSON evidence viewers only with explicit file selection
- do not ask for broker credentials
- do not claim production trading readiness

After customer evaluation:

- export only small paper-only evidence artifacts when needed
- do not commit generated SQLite or generated JSON evidence
- collect feedback through the customer feedback form

## Next Implementation Slice

The next concrete slice should be:

```text
Customer Self-Service Local Demo Launcher
```

It should wrap the existing local demo steps into a guided command or script that
validates dependencies, creates a temporary paper-only SQLite path, seeds a safe
record, starts local services, and prints browser URLs. It must not deploy a
hosted backend, expose local SQLite to Production Vercel, connect brokers, or
enable live trading.

Implemented launcher:

```bash
make launch-self-service-paper-demo
```

The check-only gate is:

```bash
make self-service-paper-demo-launcher-check
```

See [customer-self-service-local-demo-launcher.md](customer-self-service-local-demo-launcher.md).

The future hosted paper API readiness gate is:

```bash
make hosted-paper-api-readiness-check
make hosted-paper-auth-boundary-check
make hosted-paper-mock-session-check
make hosted-paper-tenant-boundary-evidence-export
```

The current backend also exposes a read-only readiness response:

```text
GET /api/hosted-paper/readiness
GET /api/hosted-paper/session
GET /api/hosted-paper/tenants/current
```

The readiness endpoint reports that hosted paper backend/API mode is not enabled
yet and that actual paper workflow records still require local backend + local
SQLite demo mode. The session and tenant endpoints are read-only mock contract
samples; they do not create hosted sessions or write hosted records.

Live trading remains disabled by default.
