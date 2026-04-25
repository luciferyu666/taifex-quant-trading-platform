# Phase 6: Reliability and Go-Live Readiness

## Objective

Define reliability, disaster recovery, security, and go-live readiness planning. This phase does not enable live trading.

## Deliverables

- Reliability readiness checklist.
- DR and rollback checklist.
- Security checklist placeholder.
- Small-live preconditions.

## Acceptance Criteria

- Live trading remains disabled by default.
- Readiness docs describe preconditions, not enablement.
- Operators can identify remaining blockers before any future live pilot.

## Safety Constraints

- Do not enable live trading.
- Do not create production credentials.
- Do not claim the system is production-ready.

## Suggested Commands

```bash
bash scripts/roadmap-status.sh
make check
```

## Next Implementation Notes

Any future small-live proposal must include legal review, broker certification, kill switch, reconciliation, limits, monitoring, and explicit human approval.
