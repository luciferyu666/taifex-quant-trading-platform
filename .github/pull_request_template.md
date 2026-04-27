# Pull Request

## Summary

<!-- Describe what changed and why. Keep scope explicit. -->

## Release Level

Select the highest applicable level:

- [ ] Marketing Website: external presentation candidate
- [ ] Web Command Center: internal demo candidate
- [ ] Paper Research Preview: internal technical preview
- [ ] Production Trading Platform: NOT READY / not applicable

## Scope

- [ ] Documentation
- [ ] Backend API/domain scaffolding
- [ ] Data platform dry-run tooling
- [ ] Strategy SDK / research-only tooling
- [ ] Frontend Web Command Center
- [ ] Marketing website
- [ ] Scripts / Makefile / CI-style checks
- [ ] Other:

## Trading Safety Checklist

- [ ] Live trading remains disabled by default.
- [ ] `.env.example` keeps `TRADING_MODE=paper`.
- [ ] `.env.example` keeps `ENABLE_LIVE_TRADING=false`.
- [ ] `.env.example` keeps `BROKER_PROVIDER=paper`.
- [ ] No real broker SDK order submission was added.
- [ ] No strategy code calls broker SDKs directly.
- [ ] No flow bypasses Risk Engine or OMS for future execution paths.
- [ ] No UI action enables live trading, broker login, account opening, or order submission.

## Secrets and Public-Release Checklist

- [ ] `.env` is not committed.
- [ ] Broker credentials, account IDs, certificates, API keys, Vault tokens, Vercel tokens, and customer data are not committed.
- [ ] `Documentation/*.md` source briefs were reviewed before inclusion, or remain excluded.
- [ ] Generated JSON reports under `data-pipeline/reports/*.json` are not committed.
- [ ] `node_modules`, venvs, `.next`, `dist`, logs, caches, and local database files are not committed.

## Marketing and Compliance Checklist

- [ ] No guaranteed profit claims.
- [ ] No risk-free trading claims.
- [ ] No investment advice language.
- [ ] No copy trading, managed accounts, signal subscriptions, or performance-fee offering is described as available without legal review.
- [ ] The current status is not represented as production trading readiness.

## Validation

Run before requesting review:

```bash
git status --short
make release-readiness-check
RELEASE_READINESS_STRICT=1 make release-readiness-check
make check
```

Results:

- `git status --short`:
- `make release-readiness-check`:
- `RELEASE_READINESS_STRICT=1 make release-readiness-check`:
- `make check`:

## Notes for Reviewers

<!-- Include known limitations, non-goals, blocked checks, and follow-up work. -->
