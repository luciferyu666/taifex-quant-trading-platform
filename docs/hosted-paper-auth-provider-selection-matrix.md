# Hosted Paper Auth Provider Selection Matrix

## Purpose

This document compares Clerk, Auth0, Descope, and Vercel OIDC / Sign in with
Vercel against the future hosted paper SaaS identity requirements.

It is a selection matrix only. No authentication provider is selected,
installed, configured, or enabled by this slice. No customer account, reviewer
login, session cookie, hosted datastore record, broker credential, broker call,
or order is created.

Live trading remains disabled by default.

## Current Endpoint

```text
GET /api/hosted-paper/auth-provider-selection
```

The endpoint returns read-only provider comparison metadata for the Web Command
Center. It must remain safe fallback metadata until a future staging-only proof
of concept is explicitly approved.

Current response state:

```text
service=hosted-paper-auth-provider-selection
selection_state=selection_matrix_only
provider_selected=false
integration_enabled=false
auth_provider_enabled=false
customer_account_created=false
reviewer_login_created=false
session_cookie_issued=false
credentials_collected=false
secrets_added=false
hosted_datastore_written=false
broker_api_called=false
order_created=false
production_trading_ready=false
```

Safety defaults remain:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

## Selection Criteria

| Criterion | Why it matters |
| --- | --- |
| `tenant_boundary` | Every hosted paper record and request must be scoped by `tenant_id`. |
| `role_mapping` | Customer, reviewer, operator, and admin permissions must remain separate. |
| `session_security` | Sessions need expiry, rotation, revocation, logout, and audit events. |
| `mfa_for_privileged_roles` | Reviewer, operator, and admin roles should require stronger assurance. |
| `auditability` | Identity and authorization decisions must be traceable for review. |
| `paper_only_policy_enforcement` | Auth must carry attributes needed to enforce paper-only mode. |
| `vercel_deployment_fit` | The provider should fit the planned hosted frontend/backend deployment path. |

## Candidate Matrix

| Provider | Fit | Strengths | Watch Items |
| --- | --- | --- | --- |
| Clerk | Strong pilot candidate | Vercel Marketplace path, prebuilt Next.js UI patterns, session management, fast pilot fit. | Confirm enterprise SSO, audit export, tenant membership, pricing, and data residency before selection. |
| Auth0 | Strong enterprise candidate | Mature enterprise identity ecosystem, SSO, custom claims, organization modeling. | Higher setup and operations complexity; requires careful tenant and claim mapping. |
| Descope | Pilot candidate | Passwordless onboarding and visual flow-oriented identity workflows. | Validate RBAC/ABAC, tenant membership depth, audit, compliance, and enterprise needs. |
| Vercel OIDC / Sign in with Vercel | Internal/operator candidate | Useful for developer or internal operator tooling where users already have Vercel accounts. | Not a default customer SaaS login option; most customers should not need Vercel accounts. |

## Current Recommendation

The current recommendation is not to select a provider yet. The next safe step
is to review product requirements for the four future roles:

- `customer`
- `reviewer`
- `operator`
- `admin`

Then confirm tenant membership, audit requirements, session lifecycle, MFA
needs, and paper-only ABAC attributes before selecting one provider for a
staging-only proof of concept.

## Non-Goals

- Do not install provider SDKs in this slice.
- Do not create login or signup pages.
- Do not create customer accounts.
- Do not issue session cookies.
- Do not add secrets or environment variables.
- Do not write hosted datastore records.
- Do not collect broker credentials.
- Do not call brokers or create orders.
- Do not enable live trading.

## Web Command Center Boundary

The Web Command Center may display the matrix as read-only metadata. It must
not add login buttons, signup flows, credential forms, hosted account creation,
session issuance, provider connection controls, broker connectivity, or order
submission.

## Acceptance Criteria

- `GET /api/hosted-paper/auth-provider-selection` returns all four candidates.
- The endpoint reports `selection_state=selection_matrix_only`.
- All provider integration flags remain false.
- All account/session/credential/datastore/broker/order flags remain false.
- The Web Command Center displays the matrix as read-only metadata.
- `make hosted-paper-auth-provider-selection-check` passes.
- `make check` passes.

Production Trading Platform remains NOT READY.
