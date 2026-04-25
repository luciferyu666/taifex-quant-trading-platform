# Control Plane

## Purpose

The Control Plane provides human-facing governance for the platform. It owns access, configuration, approvals, reporting, audit viewing, and administration. It must not execute trades or bypass the Trading/Data Plane.

## Responsibilities

- Identity and future RBAC/ABAC.
- Strategy configuration and lifecycle administration.
- Approval workflows for high-risk changes.
- Reporting and audit viewing.
- Web Command Center administration.
- Future user, team, and environment management.

## Services

- Identity Service.
- Strategy Registry.
- Approval Workflow Service.
- Reporting Service.
- Audit Viewer.
- Web Command Center.

## Non-Goals

- No broker SDK calls.
- No order submission.
- No direct market execution.
- No plaintext broker credential access.
- No live trading enablement.

## RBAC/ABAC Placeholder

Future role and attribute checks should separate researchers, operators, reviewers, administrators, and auditors. High-risk actions should require explicit approval and audit logging.

## Strategy Lifecycle Administration

The Control Plane can register strategy metadata, versions, owners, risk labels, deployment status, and approval state. Strategy execution remains in the Trading/Data Plane.

## Reporting and Audit Viewing

The Control Plane can read audit and execution records. It should not mutate OMS state outside approved operational commands.

## Failure Boundary

Control Plane downtime must not interrupt paper/shadow trading runtime in the Trading/Data Plane. Control Plane load, reporting queries, or dashboards must not starve risk, OMS, or broker gateway workflows.

## Acceptance Criteria

- Control Plane docs clearly prohibit trade execution.
- Future RBAC/ABAC boundary is documented.
- Reporting and audit viewing are read-oriented by default.
- Strategy lifecycle administration does not grant broker access.

## Next Implementation Steps

1. Add identity and role placeholder models.
2. Add strategy lifecycle API endpoints.
3. Add audit viewer API stubs.
4. Document approval workflow for future live readiness.
