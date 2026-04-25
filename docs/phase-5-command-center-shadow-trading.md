# Phase 5: Command Center and Shadow Trading

## Objective

Expose roadmap phase status, contracts, safety mode, risk status, and paper-only simulation placeholders through the Web Command Center.

## Deliverables

- Roadmap phase cards.
- Contract table.
- Risk status card.
- Paper-only order simulation placeholder.
- Architecture module cards.

## Acceptance Criteria

- Frontend renders fallback data if backend is unavailable.
- Every order-related UI is labeled Paper Only.
- No live trading controls are present.

## Safety Constraints

- Do not add live order buttons.
- Do not collect broker credentials.
- Do not show production readiness claims.

## Suggested Commands

```bash
cd frontend && npm run typecheck
cd frontend && npm run build
make check
```

## Next Implementation Notes

Future shadow trading should observe market data and theoretical orders without sending broker-bound requests.
