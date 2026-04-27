# Release Readiness Audit

## Purpose

This document turns the current dirty local worktree into a repeatable release-candidate audit process. It does not certify the trading platform as production-ready. It defines what can be treated as a versioned release candidate and what must remain internal, paper-only, or explicitly reviewed.

## Current Release Level

| Surface | Current Level | Assessment |
| --- | --- | --- |
| Marketing Website | External presentation candidate | Suitable for investor, partner, and technical-advisor viewing when `make website-content-check` and website build pass. |
| Web Command Center | Internal demo candidate | Suitable for internal engineering demos and read-only research review workflows. |
| Paper Research Preview | Internal technical preview | Suitable for fixture-only, dry-run, research-only validation. |
| Trading Platform | Not production-ready | Not suitable for customer trading, broker-connected trading, live execution, managed accounts, signal services, or copy trading. |

The repository remains paper-first. Live trading remains disabled by default.

## Release Candidate Definition

A repository state may be called a release candidate only when:

- The worktree is clean or intentionally staged on a dedicated release branch.
- `.env.example` keeps `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
- `make check` passes from a clean clone or clean branch.
- Website content QA passes.
- Backend tests pass.
- Frontend and Astro builds pass.
- No generated build artifacts, dependency folders, logs, local reports, credentials, or secrets are included.
- README and roadmap docs clearly state that this is not a production trading platform.

## Current Commit Scope Decision

The current local worktree contains a large Phase 2/3/5 implementation set. The next release-candidate commit should be intentional and broad enough to preserve cross-file consistency.

Recommended inclusion set:

- Backend Phase 2 data platform routes, domain models, validation helpers, and tests.
- Phase 3 Strategy SDK dry-run contracts, examples, and tests.
- Phase 5 Web Command Center read-only packet viewer, loader fixtures, validation scripts, and tests.
- Data-pipeline local fixtures, schemas, dry-run migration helpers, and docs.
- Strategy-engine SDK files and examples.
- Documentation updates for Phase 2, Phase 3, Phase 5, trading safety, and paper/shadow/live boundaries.
- Makefile targets and check scripts that validate the above.
- Website conversion QA docs and scripts.

Do not include:

- `.env`
- `.venv`, `backend/.venv`
- `node_modules`
- `.next`, `dist`, build artifacts, caches, coverage outputs
- `logs/`
- local generated report JSON files under `data-pipeline/reports/*.json`
- broker credentials, account IDs, certificates, API keys, Vault tokens, Vercel tokens, or customer data

Review before deciding whether to include:

- User-authored source files under `Documentation/`, especially if they contain proprietary business planning material.
- Any local screenshots, exports, or source briefs that were used to derive website content.

## Clean Clone Verification

After committing the intended release candidate, verify from a clean clone or clean branch:

```bash
git clone https://github.com/luciferyu666/taifex-quant-trading-platform.git /tmp/tqtp-release-check
cd /tmp/tqtp-release-check
bash scripts/bootstrap.sh
make check
```

If dependency installation is already available locally, a faster branch-based check is:

```bash
git switch -c release/readiness-audit
make release-readiness-check
make check
```

## Release Readiness Command

Run:

```bash
make release-readiness-check
```

The command reports:

- current git branch and commit
- worktree cleanliness
- tracked modified files
- untracked files
- safety defaults
- required readiness artifacts
- local-only / ignored generated artifacts
- release level
- next command to produce a versioned release candidate

For strict gating:

```bash
RELEASE_READINESS_STRICT=1 make release-readiness-check
```

Strict mode fails when the worktree is dirty, because a dirty tree cannot be a final release candidate.

## Pull Request Review Workflow

The release branch should be reviewed through a GitHub pull request before merging. Use `docs/release-candidate-pr-notes.md` as the PR description source and `.github/pull_request_template.md` as the standing checklist for future PRs.

Before requesting review:

```bash
git status --short
make release-readiness-check
RELEASE_READINESS_STRICT=1 make release-readiness-check
make check
```

GitHub must also report the `Release readiness gate` check from `.github/workflows/release-readiness.yml`. The workflow installs backend, frontend, and website dependencies in a clean runner, then runs the strict release gate and `make check`.

The PR must explicitly state this release level:

- Marketing Website: external presentation candidate
- Web Command Center: internal demo candidate
- Paper Research Preview: internal technical preview
- Production Trading Platform: NOT READY

The PR reviewer should verify:

- `Documentation/*.md` source briefs remain excluded unless separately approved for public release.
- `.env`, secrets, generated JSON reports, dependency directories, and build outputs are not tracked.
- Live trading defaults remain `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
- No broker SDK, live order path, account-opening flow, or production trading readiness claim was introduced.
- All trading-related new behavior is paper-only, research-only, dry-run, or read-only.
- GitHub Actions reports `Release readiness gate` as passing before merge.

## Acceptance Criteria

- `make release-readiness-check` reports safety defaults as safe.
- Dirty files are visible and categorized.
- Release level is not misrepresented as production trading readiness.
- `make check` passes before any release-candidate branch is pushed.
- Release candidate PR notes and PR template are present.
- GitHub Actions release-readiness workflow is present.
- Live trading remains disabled by default.

## Non-Goals

- Do not deploy during this audit.
- Do not connect to brokers.
- Do not enable live trading.
- Do not write production database records.
- Do not collect or store credentials.
- Do not claim profitability, production readiness, investment advice, or licensed advisory status.
