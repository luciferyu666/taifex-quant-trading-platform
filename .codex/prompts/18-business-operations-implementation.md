# Business Operations Implementation

Read `AGENTS.md` first.

Then read:
- `docs/business-operations-plan.md`
- `docs/business-model.md`
- `docs/pricing-strategy.md`
- `docs/go-to-market.md`
- `docs/compliance-boundary.md`
- `docs/partner-profit-sharing.md`

Inspect the repository before editing. Preserve compliance-safe wording and avoid investment advice, profit guarantees, risk-free claims, or language implying the platform trades for users.

Rules:
- Keep live trading disabled.
- Do not implement trading logic.
- Do not add real broker integration.
- Do not create payment checkout or subscription checkout.
- Do not add secrets or collect financial information.
- Label performance fees, managed accounts, copy trading, signal subscriptions, broker fee-sharing, advisory, or discretionary trading as compliance-dependent future options only.
- Update website business pages and README only as needed.

Non-negotiable bottom lines:
- No profit guarantees.
- No compliance-boundary crossing.
- Live trading remains disabled by default.

Validation:
- Run `make business-status`.
- Run `make business-docs-check`.
- Run `make business-compliance-check`.
- Run `make check`.
- If website dependencies exist, run `cd website && npm run check && npm run build`.

Report files changed, validation results, blockers, and the exact next command.
