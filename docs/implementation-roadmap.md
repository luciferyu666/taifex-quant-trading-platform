# Implementation Roadmap

## Executive Purpose

This roadmap converts the cloud-native transformation blueprint into executable Phase 0-6 work for the Taifex Quant Trading Platform. The goal is to evolve the current full-stack skeleton into a modular, auditable, paper-first trading infrastructure system for Taiwan Index Futures.

Phase 0-5 are paper/shadow-only. Phase 6 is readiness planning only and does not enable live trading.

## How To Use This Roadmap With Codex

1. Read `AGENTS.md` and this roadmap before editing.
2. Pick one phase or one smaller vertical slice.
3. Inspect current files before patching.
4. Preserve `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, and `BROKER_PROVIDER=paper`.
5. Add tests for backend contracts and APIs.
6. Run `make check` before finishing.
7. Update the relevant phase document when scope changes.

## Phase Overview

| Phase | Name | Safety Mode | Primary Output |
| --- | --- | --- | --- |
| 0 | Compliance Boundary | Paper only | Legal, roles, approval, safety policy |
| 1 | Infrastructure Foundation | Paper only | Docker, K8s placeholders, Vault and observability placeholders |
| 2 | Data Platform | Paper only | Contract master, bars, rollover, data quality schemas |
| 3 | Strategy SDK and Backtest | Paper only | Signal contract, base strategy, research-only SDK |
| 4 | Risk / OMS / Broker Gateway | Paper only | Exposure allocator, Risk Engine, OMS, paper broker |
| 5 | Command Center and Shadow Trading | Paper and shadow only | Web Command Center, paper/shadow status, timeline |
| 6 | Reliability and Go-Live Readiness | Readiness only | DR, security, runbooks, small-live checklist |

## Phase 0: Compliance Boundary

Objective: Define the safety, compliance, role, and authorization baseline before building execution workflows.

Scope:
- Document no-live-trading policy.
- Define roles, approval boundaries, and high-risk feature gates.
- Establish paper-first environment defaults.

Non-goals:
- No live trading.
- No broker credentials.
- No account onboarding.

Required files/modules:
- `docs/phase-0-compliance-boundary.md`
- `docs/paper-shadow-live-boundary.md`
- `docs/security-governance.md`
- `AGENTS.md`
- `.env.example`

Acceptance criteria:
- Safety defaults are paper-only.
- Every future live path is documented as disabled.
- Codex prompts instruct future runs not to enable live trading.

Validation commands:
- `grep -n "ENABLE_LIVE_TRADING=false" .env.example`
- `grep -n "TRADING_MODE=paper" .env.example`
- `make check`

Safety checks:
- Strategies emit signals only.
- Broker SDK access is prohibited outside broker gateway.
- All future orders pass Risk Engine and OMS.

Next Codex prompt file: `.codex/prompts/10-roadmap-phase-0-compliance.md`

## Phase 1: Infrastructure Foundation

Objective: Prepare local and future cloud infrastructure boundaries without deploying production systems.

Scope:
- Docker Compose local services.
- Kubernetes placeholder manifests.
- Vault and observability placeholders.
- Roadmap status script.

Non-goals:
- No production deployment.
- No secret storage.
- No managed cloud provisioning.

Required files/modules:
- `infra/k8s/`
- `infra/vault/`
- `infra/observability/`
- `scripts/roadmap-status.sh`

Acceptance criteria:
- Placeholder manifests exist and are marked non-production.
- No secrets appear in source.
- `make roadmap-status` reports required roadmap files.

Validation commands:
- `bash scripts/roadmap-status.sh`
- `make roadmap-status`
- `make check`

Safety checks:
- Paper broker remains default.
- No live broker integration is introduced.

Next Codex prompt file: `.codex/prompts/11-roadmap-phase-1-infrastructure.md`

## Phase 2: Data Platform

Objective: Define the safe data platform foundation for market data, rollover, and quality checks.

Scope:
- Contract master schema.
- Market bars schema.
- Rollover events schema.
- Data quality reports schema.
- Bronze/Silver/Gold data plan.

Non-goals:
- No market data download.
- No external vendor integration.
- No broker API usage.

Required files/modules:
- `data-pipeline/schemas/contract_master.sql`
- `data-pipeline/schemas/market_bars.sql`
- `data-pipeline/schemas/rollover_events.sql`
- `data-pipeline/schemas/data_quality_checks.sql`
- `data-pipeline/phase-2-plan.md`
- `backend/app/services/market_data.py`

Acceptance criteria:
- TX/MTX/TMF contract specs are available through backend contracts and `/api/contracts`.
- SQL schemas separate real contract prices from research adjusted series.
- Data quality checks are defined without external dependencies.

Validation commands:
- `test -f data-pipeline/schemas/contract_master.sql`
- `cd backend && pytest tests/test_contracts.py`
- `make check`

Safety checks:
- Real contract prices are reserved for paper/live simulation.
- Adjusted continuous contracts are reserved for research/backtesting.

Next Codex prompt file: `.codex/prompts/12-roadmap-phase-2-data-platform.md`

## Phase 3: Strategy SDK and Backtest

Objective: Provide a signal-only strategy SDK and backtest foundation boundary.

Scope:
- Strategy signal model.
- Base strategy interface.
- Example paper-safe signal strategy.
- Strategy registry skeleton.

Non-goals:
- No broker calls.
- No order submission.
- No live market data dependency.

Required files/modules:
- `backend/app/domain/signals.py`
- `backend/app/services/strategy_registry.py`
- `strategy-engine/sdk/`
- `docs/phase-3-strategy-sdk-backtest.md`

Acceptance criteria:
- Strategies emit target exposure signals only.
- Example strategy produces a serializable signal-like object.
- Strategy SDK docs explicitly forbid broker SDK access.

Validation commands:
- `cd backend && pytest`
- `python -m compileall strategy-engine/sdk`
- `make check`

Safety checks:
- No broker SDK import in `strategy-engine/`.
- No order API from the SDK.

Next Codex prompt file: `.codex/prompts/13-roadmap-phase-3-strategy-sdk.md`

## Phase 4: Risk / OMS / Broker Gateway

Objective: Create the first paper-only path from order intent to risk decision, OMS state, and paper broker acknowledgement.

Scope:
- TX/MTX/TMF allocator.
- RiskConfig, OrderIntent, RiskDecision.
- In-memory OMS.
- PaperBrokerGateway.
- Backend paper order APIs.

Non-goals:
- No real broker order submission.
- No live trading.
- No durable OMS database.

Required files/modules:
- `backend/app/domain/exposure.py`
- `backend/app/domain/risk.py`
- `backend/app/domain/orders.py`
- `backend/app/services/risk_engine.py`
- `backend/app/services/oms.py`
- `backend/app/services/broker_gateway.py`
- `backend/app/api/roadmap_routes.py`

Acceptance criteria:
- Over-limit paper orders are rejected by Risk Engine.
- Approved paper orders return simulated acknowledgements only.
- OMS status changes through events.

Validation commands:
- `cd backend && pytest tests/test_exposure_allocator.py tests/test_risk_engine.py tests/test_roadmap_routes.py`
- `make check`

Safety checks:
- Risk Engine rejects when live trading is enabled.
- PaperBrokerGateway never calls broker SDKs.

Next Codex prompt file: `.codex/prompts/14-roadmap-phase-4-risk-oms-broker.md`

## Phase 5: Command Center and Shadow Trading

Objective: Expose paper/shadow state, roadmap progress, contract specs, and risk state through the Web Command Center.

Scope:
- Frontend phase cards.
- Contract table.
- Risk status card.
- Paper-only order simulation placeholder.
- Backend fallback behavior in UI.

Non-goals:
- No live order button.
- No account onboarding.
- No broker credential collection.

Required files/modules:
- `frontend/app/page.tsx`
- `frontend/app/globals.css`
- `docs/phase-5-command-center-shadow-trading.md`

Acceptance criteria:
- Frontend renders if backend is unavailable.
- All order-related UI is labeled Paper Only.
- Architecture modules remain visible.

Validation commands:
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `make check`

Safety checks:
- UI does not offer live trading controls.
- UI does not collect broker secrets.

Next Codex prompt file: `.codex/prompts/15-roadmap-phase-5-command-center.md`

## Phase 6: Reliability and Go-Live Readiness

Objective: Define reliability, security, DR, and go-live readiness without enabling live trading.

Scope:
- Reliability readiness checklist.
- DR runbook placeholder.
- OWASP ASVS-aligned checklist placeholder.
- Future small-live preconditions.

Non-goals:
- No live trading.
- No production broker credentials.
- No production deployment claim.

Required files/modules:
- `docs/reliability-readiness.md`
- `docs/phase-6-reliability-go-live-readiness.md`
- `infra/observability/README.md`
- `infra/vault/README.md`

Acceptance criteria:
- Phase 6 is documented as readiness planning only.
- Live trading remains disabled by default.
- Runbooks describe preconditions, not enablement.

Validation commands:
- `bash scripts/roadmap-status.sh`
- `make check`

Safety checks:
- No production-ready claim.
- No profit claim.
- No live mode toggle in code.

Next Codex prompt file: `.codex/prompts/16-roadmap-phase-6-reliability-readiness.md`

## Next Safe Slice

Use `.codex/prompts/17-roadmap-next-safe-slice.md` to select the smallest paper-only vertical slice after this foundation is validated.
