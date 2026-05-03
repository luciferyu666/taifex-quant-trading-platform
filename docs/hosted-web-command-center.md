# Hosted Web Command Center

## Purpose

This document defines the first safe contract for making the Production Vercel
Web Command Center environment-aware. The UI can resolve an API base URL for a
future hosted paper backend while still preserving the local demo and fallback
paths.

This is not a hosted SaaS launch. It does not add real login, customer
accounts, RBAC/ABAC enforcement, managed datastore writes, broker access, or
live trading.

Live trading remains disabled by default.

## Public API Base URL Contract

The frontend resolves its backend API base URL in this order:

```text
1. NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL
2. NEXT_PUBLIC_BACKEND_URL
3. http://localhost:8000
```

The default safe values in `.env.example` are:

```text
NEXT_PUBLIC_COMMAND_CENTER_API_MODE=local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL=
```

Important boundary:

- `NEXT_PUBLIC_*` values are public browser-visible configuration.
- Never place secrets, API keys, broker credentials, certificates, account IDs,
  or tokens in `NEXT_PUBLIC_*` variables.
- A public API base URL is routing configuration, not authentication.
- Hosted environments should use HTTPS.

## Backend Contract

```text
GET /api/hosted-paper/web-command-center/readiness
```

The endpoint returns read-only metadata for:

- API base URL environment contract
- required read endpoints
- mock session / tenant / role / permission display requirements
- safety defaults
- safety flags
- requirements before hosted customer use

It does not authenticate users, issue sessions, write records, create tenants,
call brokers, create orders, or enable live trading.

## Frontend Display

The Web Command Center now displays:

- resolved API base URL
- base URL source
- `NEXT_PUBLIC_COMMAND_CENTER_API_MODE`
- whether hosted backend URL is configured
- login status from mock session contract
- tenant context from mock tenant contract
- current roles
- granted read permissions
- denied mutation permissions
- required read endpoints
- safety flags

## Required Before Customer Hosted Use

Before customer-facing hosted paper SaaS use:

1. Deploy a reviewed hosted backend runtime for paper-only staging.
2. Configure `NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL` for the frontend
   deployment.
3. Keep public API base URL values non-secret and HTTPS-only for hosted
   environments.
4. Add real login, logout, session validation, and reviewer/customer identity.
5. Enforce tenant isolation on every hosted request and hosted record.
6. Enforce RBAC/ABAC before any hosted mutation or paper workflow submit.
7. Connect a managed datastore only after migration, backup, retention, and
   restore review.
8. Complete security and operations review before customer-hosted paper use.

## Explicit Non-Goals

- Do not enable hosted customer accounts.
- Do not enable real reviewer login.
- Do not enable RBAC/ABAC enforcement.
- Do not write hosted records.
- Do not collect credentials.
- Do not collect broker credentials.
- Do not call broker APIs.
- Do not create real orders.
- Do not enable live trading.
- Do not claim production trading readiness.

## Validation

```bash
make hosted-web-command-center-check
make hosted-backend-readiness-check
make hosted-paper-mock-session-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

## Current Status

The Web Command Center can resolve a hosted backend API base URL when configured,
but the hosted backend, real auth, managed datastore, and tenant-enforced
customer SaaS workflow are still not enabled. Local Demo Mode remains the
primary path for actual paper records.
