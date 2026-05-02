# Paper Compliance Approval Readiness

## Purpose

This document defines the boundary between the current local Paper Only
approval workflow and a future formal compliance approval system.

The current workflow is local paper scaffolding for demos, reviewer walkthroughs,
and technical validation. It is not formal compliance approval, not legal
approval, not live trading approval, and not production trading readiness.

Live trading remains disabled by default.

## Current Status

The current implemented endpoint is:

```text
GET /api/paper-execution/approvals/compliance-readiness
```

It returns structured readiness metadata showing:

- local paper approval queue is enabled
- local SQLite persistence is enabled
- local dual-review rule is enabled for paper simulation
- formal compliance approval is not enabled
- production approval authority is not enabled
- reviewer identity is not verified
- RBAC/ABAC is not enforced
- tenant-scoped approval records are not enabled
- WORM ledger is not enabled
- centralized audit service is not enabled
- signed approval records are not enabled
- legal retention policy is not enforced
- Production Trading Platform remains `NOT READY`

## Current Local Paper Scope

The current approval workflow supports:

- local Paper Only approval requests
- local reviewer decisions for `research_approved`,
  `approved_for_paper_simulation`, `rejected`, and `needs_data_review`
- local SQLite records for paper approval queue/history
- local hash-chain references for paper approval decisions
- Controlled Paper Submit using a persisted `approval_request_id`

This scope is useful for customer demos and technical review, but it must not be
presented as formal compliance approval.

## Missing For Formal Compliance

A formal compliance approval system still requires:

- real reviewer login and verified reviewer identity
- formal RBAC/ABAC enforcement for approval authority
- tenant-scoped customer accounts and hosted approval records
- compliance policy engine with versioned approval rules
- segregation of duties enforced by identity and authorization controls
- immutable WORM ledger or centralized compliance audit service
- signed approval records, external timestamping, and retention policy
  enforcement
- legal, regulatory, security, and operations review for customer-facing
  approval workflows

## Required Before Formal Approval

Before any approval workflow can be described as formal compliance approval, the
platform must complete:

- authentication provider selection and review
- reviewer identity, session lifecycle, MFA, and logout behavior
- tenant-scoped customer accounts and membership records
- RBAC/ABAC enforcement for reviewer, risk, compliance, and paper operator roles
- versioned compliance approval policies
- WORM or centralized immutable audit storage
- signed approval records and tamper-evident export
- legal/regulatory review

## Safety Contract

The readiness endpoint must preserve:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

The response must keep these flags false:

```text
formal_compliance_approval_enabled=false
production_approval_authority=false
reviewer_identity_verified=false
rbac_abac_enforced=false
tenant_scoped_approval_records_enabled=false
worm_ledger_enabled=false
centralized_audit_service_enabled=false
signed_approval_records_enabled=false
production_compliance_approval=false
live_approval_granted=false
paper_execution_approval_granted=false
broker_api_called=false
credentials_collected=false
database_written=false
external_db_written=false
order_created=false
production_trading_ready=false
```

## Web Command Center

The Web Command Center may show this readiness response as a read-only panel.

The panel must not:

- create approvals
- create reviewer decisions
- grant paper execution approval
- grant live approval
- collect credentials
- call brokers
- write databases
- create orders
- imply formal compliance approval

## Acceptance Criteria

- `GET /api/paper-execution/approvals/compliance-readiness` returns HTTP 200.
- `readiness_state=local_paper_scaffolding_not_formal_compliance_system`.
- `scaffolding.formal_compliance_approval_enabled=false`.
- `scaffolding.production_approval_authority=false`.
- `scaffolding.reviewer_identity_verified=false`.
- `scaffolding.rbac_abac_enforced=false`.
- `audit.worm_ledger_enabled=false`.
- `audit.centralized_audit_service_enabled=false`.
- `safety_flags.paper_only=true`.
- `safety_flags.read_only=true`.
- `safety_flags.live_trading_enabled=false`.
- `safety_flags.production_compliance_approval=false`.
- `safety_flags.live_approval_granted=false`.
- `safety_flags.paper_execution_approval_granted=false`.
- Browser UI remains read-only and Paper Only.

## Validation

```bash
make paper-compliance-approval-readiness-check
cd backend && .venv/bin/python -m pytest tests/test_paper_compliance_approval_readiness_routes.py
make frontend-i18n-check
make check
```
