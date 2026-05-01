# Hosted Paper Mock Session Contract

## Purpose

This document defines the read-only mock session contract for future hosted
paper mode.

It is schema and sample API scaffolding only. It does not introduce real login,
issue session cookies, collect credentials, write a hosted datastore, call
brokers, create orders, or enable live trading.

## Current Implemented Read-Only Endpoints

```text
GET /api/hosted-paper/readiness
GET /api/hosted-paper/session
GET /api/hosted-paper/tenants/current
```

`GET /api/hosted-paper/session` returns a mock session response. It is not a
real authenticated session.

`GET /api/hosted-paper/tenants/current` returns the same mock tenant context
from the session contract. It is not backed by a hosted tenant datastore.

The Web Command Center displays these endpoints in a read-only Hosted Paper Mock
Session panel. The panel renders mock session, tenant, role, permission, and
safety flag metadata only. It does not create login flows, issue sessions, write
databases, collect credentials, call brokers, or authorize paper workflow
mutations.

The mock session and tenant boundary can also be exported as local JSON evidence
with [hosted-paper-tenant-boundary-evidence-export.md](hosted-paper-tenant-boundary-evidence-export.md).
That export is read-only reviewer evidence; it does not authenticate users,
write databases, collect credentials, call brokers, or enable hosted paper mode.

## Mock Session Response

The mock session response must include:

| Field | Requirement |
| --- | --- |
| `service` | `hosted-paper-mock-session-contract` |
| `contract_state` | `mock_read_only` |
| `session.user_id` | A placeholder mock user id. |
| `session.session_id` | A placeholder mock session id. |
| `session.authenticated` | Always `false`. |
| `session.authentication_provider` | Always `none`. |
| `tenant.tenant_id` | A placeholder mock tenant id. |
| `tenant.hosted_datastore_enabled` | Always `false`. |
| `role_schema` | The future RBAC roles. |
| `permission_schema` | The future permission contract. |
| `safety_defaults` | `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`. |
| `safety_flags` | Explicit no-auth, no-credential, no-broker, no-DB-write flags. |

## Tenant Context

The mock tenant context uses:

```text
tenant_id=mock-tenant-paper-evaluation
tenant_mode=paper_only_mock
tenant_isolation_required=true
hosted_datastore_enabled=false
local_sqlite_access=false
live_trading_enabled=false
broker_provider=paper
```

This tenant context is a contract sample. It does not represent a real customer
tenant, customer account, broker account, or hosted workspace.

## Role Schema

Future roles:

- `viewer`
- `research_reviewer`
- `risk_reviewer`
- `paper_operator`
- `tenant_admin`

All roles are paper-only. No role can enable live trading or upload broker
credentials.

## Permission Schema

Read-only permissions granted in the mock session:

- `read_hosted_readiness`
- `read_mock_session`
- `read_current_tenant`

Future permissions defined but not granted in the mock session:

- `read_tenant_paper_records`
- `create_paper_approval_request`
- `record_paper_reviewer_decision`
- `submit_approved_paper_workflow`

Forbidden permissions:

- `enable_live_trading`
- `upload_broker_credentials`

`submit_approved_paper_workflow` must require a completed
`approval_request_id` before any future hosted paper workflow submit API can be
implemented.

## Safety Flags

The mock session must keep:

```text
paper_only=true
read_only=true
live_trading_enabled=false
broker_api_called=false
order_created=false
credentials_collected=false
broker_credentials_collected=false
hosted_auth_provider_enabled=false
session_cookie_issued=false
hosted_datastore_written=false
external_db_written=false
production_trading_ready=false
```

## Non-Goals

- no real auth provider
- no customer login
- no session cookie
- no credential collection
- no broker credential upload
- no hosted datastore write
- no approval mutation
- no paper workflow submit
- no Risk Engine / OMS / Broker Gateway call
- no broker SDK call
- no live approval
- no real order
- no production trading readiness claim

## Acceptance Criteria

- `GET /api/hosted-paper/session` returns HTTP 200.
- `GET /api/hosted-paper/tenants/current` returns HTTP 200.
- Web Command Center displays both endpoints as read-only mock contract status.
- `session.authenticated=false`.
- `session.authentication_provider=none`.
- `tenant.hosted_datastore_enabled=false`.
- `tenant.local_sqlite_access=false`.
- no mutation permissions are granted in the mock session.
- `enable_live_trading` is not granted.
- `upload_broker_credentials` is not granted.
- `TRADING_MODE=paper`.
- `ENABLE_LIVE_TRADING=false`.
- `BROKER_PROVIDER=paper`.
- Broker SDK calls remain forbidden.
- Production Trading Platform remains NOT READY.

## Verification Commands

```bash
make hosted-paper-tenant-boundary-evidence-export
make hosted-paper-mock-session-check
make frontend-i18n-check
make hosted-paper-auth-boundary-check
make hosted-paper-api-readiness-check
make check
```

Live trading remains disabled by default.
