# Phase 0: Compliance Boundary

## Objective

Define the legal, compliance, authorization, and safety boundary for all later platform work. This phase is paper-only and does not enable live trading.

## Deliverables

- Paper-first safety policy.
- Role boundary notes for researcher, trader/operator, risk reviewer, and admin.
- Live-trading prohibition until future explicit approval.
- Documentation for paper, shadow, and future live boundaries.

## Acceptance Criteria

- `.env.example` contains `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
- `AGENTS.md` tells Codex not to enable live trading.
- No broker credentials, account IDs, certificates, or secrets exist in source.
- All future orders must pass through Risk Engine and OMS.

## Safety Constraints

- Do not implement live trading.
- Do not collect broker credentials.
- Do not create account onboarding.
- Do not provide investment advice or profit claims.

## Suggested Commands

```bash
grep -n "TRADING_MODE=paper" .env.example
grep -n "ENABLE_LIVE_TRADING=false" .env.example
grep -n "BROKER_PROVIDER=paper" .env.example
make check
```

## Next Implementation Notes

Create role and approval models only after the paper-only service contracts are stable. Treat any live workflow as a future governance topic, not a software toggle.
