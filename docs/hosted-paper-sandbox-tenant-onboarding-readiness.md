# Hosted Paper Sandbox Tenant Onboarding Readiness

This document defines the next customer onboarding boundary for the hosted
paper SaaS path. The goal is to move customer evaluation away from
engineering-run local backend/frontend setup and toward a browser-only hosted
sandbox tenant with guided demo data.

This is a readiness contract only. It does not create a tenant, account,
session, database record, broker connection, or order.

Live trading remains disabled by default.

## API

```text
GET /api/hosted-paper/sandbox-tenant/onboarding-readiness
```

The endpoint returns read-only metadata for:

- the current customer onboarding gap
- required hosted sandbox tenant steps
- guided demo data contract
- Paper Only safety flags
- unavailable customer self-service capabilities
- documents that define the hosted paper SaaS path

## Current State

Current customer evaluation still depends on one of these paths:

- Production Vercel Web Command Center for read-only UI and fallback samples.
- Local backend plus local SQLite for actual paper workflow records.
- Explicit local JSON evidence export/import for reviewer artifacts.

This is useful for engineering review, but it is not suitable as a complete
SaaS customer onboarding experience.

## Target Customer Experience

The intended hosted paper customer flow is:

1. Customer receives access to an online sandbox tenant.
2. Customer uses browser-only Web Command Center.
3. Customer sees guided demo data without running backend/frontend locally.
4. Customer sees clear `Paper Only` labels on every workflow.
5. Customer sees `ENABLE_LIVE_TRADING=false`.
6. Customer cannot access live approval, broker login, credential upload, or
   real order submission.
7. Reviewer and operator actions remain separated by RBAC/ABAC in a future
   implementation.

## Guided Demo Data Contract

Future guided demo data should include:

- sample paper approval request
- sample reviewer decisions
- sample paper workflow run
- sample OMS events
- sample audit events
- sample risk evaluation
- sample broker simulation preview
- sample readiness evidence

Constraints:

- demo records must be simulated
- demo records must be labeled Paper Only
- demo records must not contain broker credentials
- demo records must not contain real account data
- demo records must not contain investment advice
- demo records must not imply live readiness

## Required Hosted Onboarding Steps

1. Hosted backend staging
   - Deploy reviewed paper-only hosted backend in staging.
   - Production Vercel must not read local SQLite.

2. Managed tenant datastore
   - Every hosted paper record requires `tenant_id`.
   - Local SQLite remains demo/dev only.

3. Customer login and session
   - Use a reviewed auth/session provider.
   - Do not collect broker credentials during sandbox onboarding.

4. Sandbox tenant provisioning
   - Provision a Paper Only tenant with explicit safety flags.
   - Do not grant live approval or production trading access.

5. Guided demo data
   - Seed simulated paper approval, OMS, audit, risk, and broker preview data.
   - Keep all records clearly labeled as simulated and Paper Only.

6. Customer browser demo flow
   - Customer should eventually use only the browser.
   - Current actual records still require local backend or future hosted backend.

7. Security and operations gate
   - Add rate limits, audit monitoring, observability, and staging smoke tests.
   - Keep all sandbox actions Paper Only.

## Safety Boundary

- Paper Only.
- Read-only readiness metadata only.
- No online sandbox tenant is created.
- No customer account is created.
- No reviewer account is created.
- No login or session is created.
- No hosted datastore is written.
- No external database is written.
- No broker API is called.
- No broker credentials are collected.
- No order is created.
- No real money is visible.
- No live trading approval exists.
- Production Trading Platform remains NOT READY.
- Live trading remains disabled by default.

## Acceptance Criteria

- `GET /api/hosted-paper/sandbox-tenant/onboarding-readiness` returns HTTP 200.
- Response includes `online_sandbox_tenant_enabled=false`.
- Response includes `customer_account_created=false`.
- Response includes `hosted_datastore_written=false`.
- Response includes `broker_api_called=false`.
- Response includes `order_created=false`.
- Response includes `live_trading_enabled=false`.
- Web Command Center displays the onboarding boundary as read-only metadata.
- `make hosted-paper-sandbox-onboarding-check` passes.

## Validation

```bash
make hosted-paper-sandbox-onboarding-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```
