# Hosted Paper Identity / RBAC / Tenant Readiness

## Purpose

This document defines the current readiness boundary for future hosted paper
identity, reviewer login, customer accounts, RBAC/ABAC, and tenant isolation.

It is a read-only readiness contract only. It does not implement real login,
customer accounts, session issuance, RBAC enforcement, ABAC enforcement, hosted
tenant records, broker integration, credential collection, or live trading.

Live trading remains disabled by default.

## Current Status

The current implemented endpoint is:

```text
GET /api/hosted-paper/identity-readiness
```

It returns structured readiness metadata showing:

- real reviewer login is not enabled
- customer accounts are not enabled
- authentication provider is `none`
- session issuance is not enabled
- session cookies are not issued
- RBAC is not enforced
- ABAC is not enforced
- tenant isolation is required but not yet enforced by a hosted datastore
- hosted tenant records are not enabled
- Production Vercel cannot read local SQLite
- broker provider remains `paper`
- Production Trading Platform remains `NOT READY`

## Current Customer Path

Until hosted identity and tenant isolation exist, customer evaluation remains:

1. Production Vercel Web Command Center for read-only UI, fallback samples, and
   explicit local JSON evidence viewers.
2. Local backend + local SQLite for actual Paper Only approval, OMS, audit, and
   risk records.
3. Local evidence export files for reviewer/customer handoff.

## Blocked Until Identity Layer Exists

These capabilities must remain unavailable:

- real reviewer login
- customer account onboarding
- tenant-scoped hosted paper workspace
- hosted approval queue mutations
- hosted paper workflow submission
- hosted tenant paper record queries backed by a managed datastore

## Future Requirements

A future hosted paper identity layer must complete all of the following before a
customer pilot:

- choose and review a hosted authentication provider
- define session issuance, expiry, rotation, and logout behavior
- implement tenant-scoped account and membership records
- enforce RBAC for reviewer and paper operator actions
- enforce ABAC for paper-only mode, tenant scope, environment, and approval
  state
- add dual-review rules before hosted paper workflow submission
- add audit trail for identity, authorization, and tenant-boundary decisions
- complete security and operations review

## Safety Contract

The readiness endpoint must preserve:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

The response must keep these flags false:

```text
reviewer_login_created=false
customer_account_created=false
hosted_auth_provider_enabled=false
session_cookie_issued=false
rbac_abac_enforced=false
tenant_isolation_enforced=false
hosted_datastore_written=false
external_db_written=false
broker_api_called=false
credentials_collected=false
broker_credentials_collected=false
order_created=false
production_trading_ready=false
```

## Web Command Center

The Web Command Center may display this readiness response as a read-only panel.
The panel must not add login buttons, signup forms, customer account creation,
credential upload, hosted datastore mutation, approval mutation, broker calls,
or live trading controls.

## Acceptance Criteria

- `GET /api/hosted-paper/identity-readiness` returns HTTP 200.
- `readiness_state=schema_only_not_enabled`.
- `identity.reviewer_login_enabled=false`.
- `identity.customer_accounts_enabled=false`.
- `identity.authentication_provider=none`.
- `identity.session_cookie_issued=false`.
- `access_control.rbac_enabled=false`.
- `access_control.abac_enabled=false`.
- `tenant_isolation.tenant_isolation_required=true`.
- `tenant_isolation.tenant_isolation_enforced=false`.
- `safety_flags.paper_only=true`.
- `safety_flags.read_only=true`.
- `safety_flags.live_trading_enabled=false`.
- `safety_flags.production_trading_ready=false`.
- Browser UI remains read-only and paper-only.

## Validation

```bash
make hosted-paper-identity-readiness-check
make hosted-paper-mock-session-check
make frontend-i18n-check
cd backend && .venv/bin/python -m pytest tests/test_hosted_paper_identity_readiness_routes.py
make check
```
