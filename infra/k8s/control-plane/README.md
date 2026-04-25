# Control Plane Kubernetes Placeholders

These files describe future Kubernetes boundaries for the Control Plane. They are placeholders only and must not be deployed without architecture, security, and operations review.

## Purpose

The Control Plane handles identity, RBAC/ABAC, strategy administration, approvals, reporting, audit viewing, and Web Command Center workflows.

## Boundary Rules

- No trading execution in the Control Plane.
- No broker SDK calls in Control Plane workloads.
- No broker credentials in manifests.
- Trading/Data Plane services must own market data, strategy runtime, risk, OMS, broker gateway, and reconciliation.

## Future Direction

- Dedicated namespace.
- Network policies separating Control Plane from Trading/Data Plane.
- Service account separation.
- RBAC/ABAC service boundary.
- Read-oriented audit/reporting access.

## Status

Placeholder-only. No production images, secrets, or deployment guarantees.
