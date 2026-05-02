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
GET /api/hosted-paper/environment
GET /api/hosted-paper/readiness
```

`GET /api/hosted-paper/environment` defines three explicit modes:

| Mode | Current Status | Meaning |
| --- | --- | --- |
| Local Demo Mode | Primary local demo | Actual paper records can be created and read only through local backend + local SQLite. |
| Hosted Paper Mode | NOT ENABLED | Future SaaS paper workspace requiring hosted backend, auth, tenant isolation, and managed datastore. |
| Production Trading Platform | NOT READY | No live trading, broker connectivity, real order routing, or production OMS readiness. |

The endpoint is read-only metadata. It does not authenticate users, create
sessions, write databases, create orders, call brokers, collect credentials, or
enable live trading.

## Required SaaS Foundation Path

1. Hosted backend
2. Managed database
3. Auth/session
4. Tenant isolation
5. Paper workflow persistence
6. Hosted customer demo tenant

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
- Do not claim production trading readiness.
- Do not describe paper simulation as real market matching.

## Acceptance Criteria

- `GET /api/hosted-paper/environment` returns Local Demo Mode as the current
  customer path.
- Hosted Paper Mode returns `not_enabled`.
- Production Trading Platform returns `not_ready`.
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

Live trading remains disabled by default.
