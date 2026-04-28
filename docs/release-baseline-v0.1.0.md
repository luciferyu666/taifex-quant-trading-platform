# Release Baseline v0.1.0 Paper Research Preview

## Purpose

This document records the first post-merge release baseline after PR #1, `Prepare paper-first release readiness candidate`, was merged into `main`.

This baseline is intended to be versioned as `v0.1.0-paper-research-preview`. It is a paper-first engineering and presentation baseline, not a production trading release.

## Release / Deployment Observability

| Signal | Current baseline |
| --- | --- |
| Git tag | `v0.1.0-paper-research-preview` |
| GitHub Actions badge | `README.md` exposes the `Release Readiness` workflow badge. |
| Release readiness workflow | `.github/workflows/release-readiness.yml` runs on pull requests to `main`, pushes to `main`, and manual dispatch. |
| Marketing Website | <https://taifex-quant-trading-platform-websi.vercel.app> |
| Web Command Center | <https://taifex-quant-trading-platform-front.vercel.app> |
| Production smoke gate | `make frontend-production-smoke-check` checks the Web Command Center production alias. |
| Repository-wide gate | `make check` runs backend tests, dry-run data/research checks, frontend checks, website checks, and Docker Compose config validation when available. |

Production-facing smoke checks are read-only. They verify HTTP 200 responses, deployment id markers, bilingual safety copy, `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`, `NOT READY`, and unsafe claim exclusions. They do not deploy, write data, call brokers, approve paper execution, or enable live trading.

## Release Level

| Surface | Release level | Status |
| --- | --- | --- |
| Marketing Website | External presentation candidate | Suitable for investor, partner, and technical-advisor review after website QA and build checks pass. |
| Web Command Center | Internal demo candidate | Read-only research review packet viewer and explicit local JSON loader. |
| Paper Research Preview | Internal technical preview | Fixture-only, dry-run, local JSON / stdout research artifacts. |
| Production Trading Platform | NOT READY | No live trading, real broker adapter, production OMS, customer execution, advisory service, signal service, copy trading, or managed account capability. |

## Included Scope

- Phase 2 Data Platform:
  - contract master, market bars, rollover event, data quality, and data version scaffolding
  - local CSV fixture validation
  - data quality report artifacts and dry-run persistence tooling
  - dry-run migration apply and schema verification commands
  - continuous futures preview marked research-only and non-execution-eligible
  - feature dataset manifest preview for Phase 3 inputs
- Phase 3 Strategy SDK:
  - dataset manifest input contract
  - research context and standardized signal preview
  - backtest preview contract and result schema preview
  - toy backtest runner using local fixtures only
  - backtest artifacts, artifact index, comparison, research bundle, and review workflow artifacts
  - local JSON / stdout examples with no database writes by default
- Phase 5 Web Command Center:
  - read-only research review packet viewer
  - explicit local JSON loader with safety validation
  - safe and unsafe packet fixtures for frontend rejection-path checks
  - safe sample research review packet generator
- Release readiness:
  - release readiness audit document
  - GitHub pull request template
  - GitHub Actions release readiness workflow
  - `make release-readiness-check`
  - website content safety and i18n checks
  - expanded `make check` coverage

## Excluded Scope

- Live trading enablement
- Real broker SDK integration
- Real order submission
- Payment, subscription, broker login, account opening, or onboarding flows
- Production database writes by default
- External market data downloads
- Generated large reports
- `.env`, credentials, API keys, broker account IDs, certificates, tokens, customer data, or private source briefs
- Investment advice, signal subscription, copy trading, managed account, or performance-fee service claims

## Safety Defaults

The baseline requires these defaults in `.env.example`:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

The platform remains paper-first. Strategies emit signals only. Research, backtest preview, artifact, bundle, review, and UI flows must not create orders or call Risk Engine, OMS, or Broker Gateway unless explicitly defined as a future paper-only execution slice.

## Validation Commands

Run from the repository root after switching to `main`:

```bash
git switch main
git pull --ff-only origin main
make release-readiness-check
RELEASE_READINESS_STRICT=1 make release-readiness-check
make check
```

GitHub Actions should report the `Release readiness gate` workflow as passing for the release baseline commit or an explicitly dispatched run on `main`.

## Known Non-Production Gaps

- No production trading path exists.
- No real broker adapter exists.
- No live trading approval workflow exists.
- Risk Engine, OMS, Broker Gateway, reconciliation, and audit remain incomplete for production use.
- Data platform is based on local fixtures, dry-run validation, and schema scaffolding.
- Backtest outputs are simulated research artifacts, not performance reports.
- Web Command Center is read-only for research review packet inspection.
- Security controls such as RBAC/ABAC, Vault integration, immutable audit storage, observability, incident response, and disaster recovery remain future work.
- Commercial, advisory, signal, managed account, fee-sharing, and copy-trading models require separate legal and regulatory review before any launch.

## Next Recommended Phase

The next engineering phase should remain non-execution by default. Recommended options:

- Phase 5 Web Command Center: read-only research review dashboard polish and visual QA.
- Phase 2 Data Platform: deeper data version and rollover reproducibility checks using local fixtures.
- Phase 4 preparation: paper-only Risk Engine and OMS contract tests without broker integration.

Do not proceed to real broker integration or live trading until Phase 6 readiness, compliance review, security review, and explicit approval gates exist.

## Tagging

After validation passes on a clean `main`, create the baseline tag:

```bash
git tag -a v0.1.0-paper-research-preview -m "Paper-first release readiness baseline"
git push origin v0.1.0-paper-research-preview
```

Live trading remains disabled by default.
