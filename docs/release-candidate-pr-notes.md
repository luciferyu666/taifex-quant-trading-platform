# Release Candidate PR Notes

## Purpose

This document is the review handoff for the `release/readiness-audit` branch. It is intended to be copied into the GitHub pull request description and used as the merge gate for this release candidate.

This release candidate is not a production trading release. It packages paper-first Phase 2/3/5 implementation scaffolding, release-readiness checks, and website content QA into a reviewable branch.

## Proposed PR Title

```text
Prepare paper-first release readiness candidate
```

## Release Level

| Surface | Release level | Notes |
| --- | --- | --- |
| Marketing Website | External presentation candidate | Suitable for investor, partner, and technical-advisor viewing after website QA and build pass. |
| Web Command Center | Internal demo candidate | Read-only research review packet viewer only. No order entry or approval escalation. |
| Paper Research Preview | Internal technical preview | Fixture-only, dry-run, local JSON / stdout research artifacts. |
| Production Trading Platform | NOT READY | No live trading, real broker integration, production OMS, managed accounts, advisory service, or customer execution. |

## Included Scope

- Phase 2 Data Platform:
  - local market bar and rollover fixture validation
  - data quality report dry-run artifacts
  - data version registry and migration status scaffolding
  - dry-run migration apply and schema verification scripts
  - continuous futures preview and feature dataset manifest preview
- Phase 3 Strategy SDK:
  - dataset manifest input contract
  - research context and standardized signal preview
  - backtest preview, result schema preview, toy backtest runner
  - backtest artifact, artifact index, comparison, research bundle, and review workflow artifacts
  - all outputs remain research-only, simulated, and non-execution-eligible
- Phase 5 Web Command Center:
  - read-only research review packet viewer
  - explicit local JSON loader with safety validation
  - safe/unsafe local fixture set for loader rejection paths
  - sample packet generator for local reviewer workflow
- Release readiness:
  - release audit documentation
  - `make release-readiness-check`
  - website conversion QA and i18n content checks
  - expanded `make check` coverage

## Explicitly Excluded

- Live trading enablement
- Real broker SDK integration or order submission
- Payment, subscription, onboarding, account-opening, or broker-login flows
- Production database writes by default
- Generated report JSON under `data-pipeline/reports/*.json`
- `.env`, credentials, account IDs, certificates, tokens, node_modules, venvs, `.next`, `dist`, logs, and caches
- User-authored source briefs under `Documentation/*.md` unless separately reviewed and approved for public release

## Safety Assertions

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- Strategies emit signals only.
- Backtest and research artifacts do not create orders.
- Risk Engine, OMS, and Broker Gateway are not called by research-only preview flows.
- Broker Gateway remains paper-only in current implementation.
- Research review decisions cannot approve paper execution or live trading.
- Marketing copy must not claim guaranteed profit, risk-free operation, investment advice, or production trading readiness.

## Merge Checklist

- [ ] PR branch is `release/readiness-audit`.
- [ ] PR target branch is correct.
- [ ] `Documentation/*.md` source briefs remain untracked or excluded unless explicitly approved.
- [ ] `.env` is not tracked.
- [ ] Generated report JSON is not tracked.
- [ ] `node_modules`, `.next`, `dist`, venvs, logs, caches, and local database files are not tracked.
- [ ] `git status --short` is clean before final merge.
- [ ] `make release-readiness-check` passes.
- [ ] `RELEASE_READINESS_STRICT=1 make release-readiness-check` passes.
- [ ] `make check` passes.
- [ ] GitHub Actions `Release readiness gate` passes.
- [ ] Reviewer confirms release level is not described as production trading readiness.
- [ ] Reviewer confirms live trading remains disabled by default.

## Validation Commands

Run from the repository root:

```bash
git status --short
make release-readiness-check
RELEASE_READINESS_STRICT=1 make release-readiness-check
make check
```

Optional clean clone validation:

```bash
git clone https://github.com/luciferyu666/taifex-quant-trading-platform.git /tmp/tqtp-release-check
cd /tmp/tqtp-release-check
git switch release/readiness-audit
bash scripts/bootstrap.sh
make check
```

## Known Non-Production Gaps

- No real broker adapter is implemented.
- No live trading approval workflow exists.
- OMS and Risk Engine remain scaffolded for paper-only and research-only flows.
- Data pipelines use local fixtures and dry-run validation.
- Backtest outputs are simulated research artifacts, not performance reports.
- Web Command Center is read-only for review packet inspection.
- Security, RBAC/ABAC, Vault, observability, disaster recovery, and production deployment controls remain future work.

## Recommended PR Body

```markdown
## Summary

This PR packages the current paper-first Phase 2/3/5 work into a reviewable release candidate. It adds data platform dry-run artifacts, Strategy SDK research-only contracts, a read-only Web Command Center review packet viewer, website QA checks, and release-readiness gates.

## Release Level

- Marketing Website: external presentation candidate
- Web Command Center: internal demo candidate
- Paper Research Preview: internal technical preview
- Production Trading Platform: NOT READY

## Safety

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- No broker credentials, account IDs, certificates, tokens, `.env`, generated reports, or private `Documentation/*.md` source briefs are included.
- No real broker order submission is implemented.
- Live trading remains disabled by default.

## Validation

- [ ] `git status --short`
- [ ] `make release-readiness-check`
- [ ] `RELEASE_READINESS_STRICT=1 make release-readiness-check`
- [ ] `make check`
- [ ] GitHub Actions `Release readiness gate`

## Reviewer Notes

Please review this PR as a release-readiness and internal-demo candidate, not as a production trading platform release. Confirm that all trading-related flows remain paper-only, research-only, dry-run, or read-only.
```
