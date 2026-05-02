# Hosted Paper Identity Access Contract

## Purpose

This document defines the first productized contract for future hosted paper
identity, real login, customer accounts, tenant boundary, RBAC, and ABAC.

It is a read-only contract only. It does not implement a real authentication
provider, issue sessions, create customer accounts, enforce RBAC/ABAC, create
tenants, write hosted records, collect credentials, call brokers, create
orders, or enable live trading.

Live trading remains disabled by default.

## Implemented Endpoint

```text
GET /api/hosted-paper/identity-access-contract
```

The endpoint returns:

- future identity provider requirements
- future session boundary requirements
- future tenant boundary requirements
- role separation for `customer`, `reviewer`, `operator`, and `admin`
- RBAC permission boundaries
- ABAC policy boundaries
- blocked capabilities until real identity exists
- implementation sequence before hosted customer pilot
- explicit safety flags

## Current State

The current state is:

```text
contract_state=contract_only_not_implemented
provider_selected=false
real_login_enabled=false
customer_signup_enabled=false
reviewer_login_enabled=false
session_issuance_enabled=false
session_cookie_issued=false
rbac_enforced=false
abac_enforced=false
tenant_isolation_enforced=false
hosted_datastore_written=false
```

This means the platform still uses:

1. Production Vercel for read-only UI, fallback data, and local JSON evidence
   viewers.
2. Local backend + local SQLite for actual Paper Only approval, OMS, audit, and
   risk records.
3. Exported local evidence for reviewer/customer handoff.

## Future Role Separation

| Role | Intended Future Boundary |
| --- | --- |
| `customer` | Read the customer's own tenant paper workspace, paper records, evidence, and demo status. |
| `reviewer` | Record research/risk review decisions inside one tenant boundary. |
| `operator` | Submit a paper workflow only after the required approval sequence is complete. |
| `admin` | Manage paper-only tenant membership and configuration review. |

No role may enable live trading, upload broker credentials, create real orders,
connect a real broker, or access another tenant.

## Future Session Boundary

Every future hosted paper request must carry validated session context:

```text
user_id
tenant_id
session_id
roles
permissions
paper_only
environment
```

The future session lifecycle must cover issue, expiry, rotation, revocation, and
logout. Privileged roles such as reviewer, operator, and admin should require
MFA before any hosted customer pilot.

This repository does not currently issue a real session cookie.

## Future Tenant Boundary

Future hosted paper records must require `tenant_id` on every request and every
record. Tenant membership must be checked before reads or future writes.

Production Vercel must not read local SQLite as a hosted tenant datastore.
Local SQLite remains local demo infrastructure only.

## Future RBAC / ABAC Boundary

RBAC must separate:

- customer read-only access
- reviewer decision actions
- operator paper workflow submission
- admin tenant membership/configuration actions

ABAC must enforce:

- `paper_only=true`
- `live_trading_enabled=false`
- tenant scope
- environment scope
- approval state before paper workflow submission

## Blocked Until Real Identity Exists

These capabilities remain blocked:

- hosted customer account login
- reviewer login and session issuance
- tenant membership management
- RBAC enforcement for reviewer, admin, customer, and operator roles
- ABAC enforcement for paper-only mode, tenant scope, environment, and approval
  state
- hosted paper approval mutations
- hosted paper workflow submission
- hosted tenant paper record queries backed by managed datastore

## Safety Contract

The endpoint and UI must preserve:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

The response must keep these safety flags:

```text
paper_only=true
read_only=true
live_trading_enabled=false
auth_provider_enabled=false
real_login_enabled=false
customer_account_created=false
reviewer_login_created=false
admin_login_created=false
operator_login_created=false
session_cookie_issued=false
rbac_enforced=false
abac_enforced=false
tenant_isolation_enforced=false
hosted_datastore_written=false
external_db_written=false
credentials_collected=false
broker_credentials_collected=false
broker_api_called=false
order_created=false
production_trading_ready=false
```

## Web Command Center

The Web Command Center may display this contract as a read-only panel.

It must not add:

- login buttons
- signup forms
- customer account creation
- session issuance
- tenant mutation
- approval mutation
- hosted datastore writes
- credential forms
- broker calls
- order creation
- live trading controls

## Acceptance Criteria

- `GET /api/hosted-paper/identity-access-contract` returns HTTP 200.
- `contract_state=contract_only_not_implemented`.
- `role_permission_matrix` includes `customer`, `reviewer`, `operator`, and
  `admin`.
- `customer` cannot record reviewer decisions or submit paper workflows.
- `reviewer` cannot submit paper workflows.
- `operator` requires completed approval sequence and dual review before future
  paper workflow submission.
- `admin` can only administer future paper-only tenant membership/configuration.
- Every role denies live trading, broker credentials, real orders, real broker
  connection, and cross-tenant access.
- RBAC/ABAC are marked required but not enforced.
- Safety defaults remain paper-only.

## Validation

```bash
make hosted-paper-identity-access-check
cd backend && .venv/bin/python -m pytest tests/test_hosted_paper_identity_access_contract_routes.py
make frontend-i18n-check
make check
```
