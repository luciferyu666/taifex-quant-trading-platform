# Hosted Paper API Auth Boundary Spec

## Purpose

This document defines the future authentication, session, RBAC, ABAC, and
tenant boundary for a hosted paper-only API.

It is a boundary specification only. No hosted authentication provider is
implemented, no credentials are collected, no hosted datastore writes are
enabled, and no broker integration is introduced by this document.

The current implemented hosted paper endpoint remains:

```text
GET /api/hosted-paper/readiness
```

That endpoint is read-only and reports that hosted paper mode is not enabled.

## Current Posture

The current customer evaluation path is still:

- Production Vercel Web Command Center for read-only presentation, fallback UI,
  safety copy, and local JSON evidence viewers.
- Local backend demo mode for actual paper approval, OMS, audit, and SQLite
  records.
- Explicit local scripts for demo seed, evidence export, and verification.

The platform does not currently provide:

- hosted customer login
- hosted user session creation
- hosted tenant workspaces
- hosted customer paper records
- hosted datastore writes
- credential upload
- broker login
- live approval
- production trading readiness

## Scope

Future hosted paper mode should support paper-only customer workspaces with:

- authenticated user/session context
- tenant-scoped paper records
- RBAC role checks
- ABAC policy checks
- reviewer and operator action boundaries
- evidence export and audit review
- explicit separation from live trading and broker connectivity

The boundary must preserve:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

Production Trading Platform remains NOT READY.

## Non-Goals

This specification does not implement or approve:

- a real hosted authentication provider
- customer credential collection
- broker credential upload
- account ID, certificate, API key, or token storage
- hosted datastore writes
- real broker login
- broker SDK calls
- live trading
- live approval
- paper-to-live escalation
- investment advice
- strategy ranking or best-strategy selection
- production trading readiness claims

## Future Identity Model

Hosted paper requests should eventually carry an authenticated session context:

| Field | Purpose |
| --- | --- |
| `user_id` | Stable future identity for the authenticated user. |
| `tenant_id` | Required tenant boundary for every hosted paper record. |
| `session_id` | Future authenticated session identifier. |
| `roles` | RBAC roles assigned within the tenant. |
| `attributes` | ABAC attributes such as environment, paper-only mode, and review scope. |

The session context must never expose broker credentials to strategies,
frontend code, or strategy runners.

## Future Roles

Suggested initial roles:

| Role | Intended permission boundary |
| --- | --- |
| `viewer` | Read tenant-scoped paper readiness, status, and evidence. |
| `research_reviewer` | Review research packets and mark paper research readiness. |
| `risk_reviewer` | Review paper risk guardrails and paper approval requests. |
| `paper_operator` | Submit approved paper-only workflows after required review is complete. |
| `tenant_admin` | Manage tenant members and paper-only workspace settings. |

These roles are future design targets only. They are not implemented as a
hosted authorization system yet.

## Future Permission Matrix

| Capability | Viewer | Research Reviewer | Risk Reviewer | Paper Operator | Tenant Admin |
| --- | --- | --- | --- | --- | --- |
| Read hosted readiness | Yes | Yes | Yes | Yes | Yes |
| Read tenant paper records | Yes | Yes | Yes | Yes | Yes |
| Create paper approval request | No | Yes | Yes | No | Yes |
| Record research review decision | No | Yes | No | No | Yes |
| Record risk review decision | No | No | Yes | No | Yes |
| Submit approved paper workflow | No | No | No | Yes | Yes |
| Export paper evidence | Yes | Yes | Yes | Yes | Yes |
| Enable live trading | No | No | No | No | No |
| Upload broker credentials | No | No | No | No | No |

## Boundary Rules

- Every future hosted paper request must include authenticated user/session
  context.
- Every future hosted paper record must include `tenant_id`.
- Tenant isolation is mandatory for reads, writes, exports, and audit review.
- RBAC must gate every reviewer and paper operator action.
- ABAC must enforce paper-only mode, environment boundary, tenant scope, and
  approval status.
- Strategies must still emit signals only.
- Strategies must never receive session tokens, API keys, certificates, broker
  account IDs, or any secret material.
- Controlled paper submit must require a persisted, completed
  `approval_request_id`.
- Broker SDK calls remain forbidden.
- Live trading remains disabled by default.

## Future Endpoint Shape

The following endpoints are future design references only:

```text
GET /api/hosted-paper/session
GET /api/hosted-paper/tenants/current
GET /api/hosted-paper/approvals/queue
POST /api/hosted-paper/approvals/requests
POST /api/hosted-paper/approvals/requests/{approval_request_id}/decisions
POST /api/hosted-paper/workflows/submit
GET /api/hosted-paper/workflows
GET /api/hosted-paper/audit-events
```

They must not be exposed as hosted mutation paths until identity, tenancy,
RBAC/ABAC, datastore, audit, rate limiting, and operations controls are reviewed.

The only current hosted-paper endpoint is still:

```text
GET /api/hosted-paper/readiness
```

## Hosted Data Boundary

Future hosted paper records must be tenant-scoped and must not use local SQLite
as the hosted data layer.

Local SQLite remains a customer demo mechanism only. It is not a hosted
customer datastore, not a production OMS ledger, and not a production WORM audit
store.

## Safety Requirements

- no hosted authentication provider is implemented
- no credentials are collected
- no hosted datastore writes
- no broker credentials are uploaded
- no broker SDK calls
- no live approval
- no real orders
- no investment advice
- no production trading readiness claims

## Acceptance Criteria

Before any hosted paper auth implementation begins:

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- `GET /api/hosted-paper/readiness` remains read-only
- future session context requires `user_id`, `tenant_id`, and `session_id`
- RBAC and ABAC policy boundaries are documented
- all reviewer/operator mutation paths require tenant-scoped authorization
- Broker SDK calls remain forbidden
- no credentials are collected
- no hosted datastore writes are added by this slice
- Production Trading Platform remains NOT READY

## Verification Commands

```bash
make hosted-paper-auth-boundary-check
make hosted-paper-api-readiness-check
make check
```

Live trading remains disabled by default.
