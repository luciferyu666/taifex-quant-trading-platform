# Taifex Quant Trading Platform

[![Release Readiness](https://github.com/luciferyu666/taifex-quant-trading-platform/actions/workflows/release-readiness.yml/badge.svg)](https://github.com/luciferyu666/taifex-quant-trading-platform/actions/workflows/release-readiness.yml)
![Release Baseline](https://img.shields.io/badge/release-v0.1.0--paper--research--preview-blue)
![Trading Mode](https://img.shields.io/badge/trading%20mode-paper-green)
![Live Trading](https://img.shields.io/badge/live%20trading-disabled-critical)

## Release / Deployment Health

| Surface | Current status |
| --- | --- |
| Latest baseline tag | `v0.1.0-paper-research-preview` |
| Verification record | `docs/release-verification-record-2026-04-28.md` |
| GitHub Actions gate | `Release Readiness` runs on PRs to `main`, pushes to `main`, and manual dispatch. |
| Marketing Website | External presentation candidate: <https://taifex-quant-trading-platform-websi.vercel.app> |
| Web Command Center | Internal demo candidate: <https://taifex-quant-trading-platform-front.vercel.app> |
| Paper Research Preview | Internal technical preview only; fixture-based, dry-run, local JSON / stdout artifacts. |
| Production Trading Platform | **NOT READY** for live trading, customer execution, managed accounts, copy trading, or signal services. |

Production-facing safety checks verify HTTP 200 responses, deployment id markers, bilingual safety copy, `TRADING_MODE=paper`, `ENABLE_LIVE_TRADING=false`, `BROKER_PROVIDER=paper`, `NOT READY`, and unsafe marketing-claim exclusions. The platform remains paper-first; live trading is disabled by default.

## Customer Evaluation Package

The current release can support controlled customer evaluation of the marketing website, read-only Web Command Center, and paper research preview surfaces. It must not be presented as a production trading platform.

Evaluation artifacts:

- `docs/customer-evaluation-package.md`
- `docs/customer-demo-script.md`
- `docs/customer-evaluation-checklist.md`
- `docs/customer-feedback-form.md`
- `docs/production-local-data-boundary.md`

Pre-demo check:

```bash
make customer-evaluation-check
make frontend-production-smoke-check
```

## Facebook Community Launch Kit

Facebook should be used for broad education, product demo traffic, and moderated community discussion around Taiwan futures quant infrastructure. The repo includes a launch playbook and first-month content calendar for:

- Facebook Page: `台指期量化交易平台`
- Facebook Group: `台指期量化交易研究社`
- weekly education posts
- weekly Paper Only product demo posts
- monthly livestream or online sharing

Artifacts:

- `docs/facebook-community-launch-plan.md`
- `docs/facebook-content-calendar.md`
- `docs/facebook-human-launch-runbook.md`

Safety check:

```bash
make social-content-check
make facebook-launch-check
```

The social media plan is educational and infrastructure-focused. It does not provide investment advice, real order instructions, broker login, credential collection, live trading approval, or profit claims.

## Executive Summary

Taifex Quant Trading Platform is a Web-based quantitative trading infrastructure platform for Taiwan Index Futures, focused on TX, MTX, and TMF workflows. It is not a simple trading bot. The platform vision is to combine data governance, strategy research, backtesting, paper trading, shadow trading, risk controls, OMS discipline, broker gateway isolation, monitoring, and enterprise controls into a coherent trading operating system for Taiwan futures quant teams.

The current repository is a development foundation. It provides a full-stack skeleton and safety-first defaults, not a completed production trading system.

## Investor Thesis

Taiwan futures quantitative trading is a focused market with specialized operational needs. Individual traders, professional desks, and emerging quant teams often struggle with reliable market data, continuous futures and rollover handling, backtest-to-live consistency, broker API integration, risk controls, and auditability.

Those workflows are commonly fragmented across local scripts, spreadsheets, vendor dashboards, and broker-specific SDKs. The opportunity is to turn those fragmented workflows into a scalable SaaS and enterprise platform with repeatable infrastructure, safer execution boundaries, and institutional-grade operational visibility.

## Product Vision

The product is positioned as a trading operating system for Taiwan futures quant workflows. It should help users move from research to execution through explicit gates:

```text
Research -> Backtest -> Paper -> Shadow -> Small Live -> Full Live
```

The current implementation is paper-first. Live trading is not enabled, not implemented as a default path, and must require explicit future implementation, review, approval, and additional controls.

## Target Instruments

The platform is designed around Taiwan Index Futures exposure normalization:

| Instrument | Description | Point Value |
| --- | --- | --- |
| TX | Taiwan Stock Exchange Capitalization Weighted Stock Index Futures | NTD 200 per index point |
| MTX | Mini Taiwan Stock Exchange Capitalization Weighted Stock Index Futures | NTD 50 per index point |
| TMF | Micro Taiwan Stock Exchange Capitalization Weighted Stock Index Futures | NTD 10 per index point |

Exposure equivalence:

```text
1 TX = 4 MTX = 20 TMF
1 MTX = 5 TMF
```

This matters because risk-based sizing should be expressed in normalized exposure rather than only in contract count. A strategy that targets 0.25 TX-equivalent exposure should be sized consistently across TX, MTX, and TMF, subject to liquidity, slippage, margin, and risk controls.

## Core Capabilities

### Market Data Pipeline

Future market data services should ingest raw Taifex and broker data, preserve immutable raw payloads, validate data quality, and produce research-ready datasets.

### Continuous Futures and Rollover Handling

Taiwan futures workflows require rollover-aware data handling. Research datasets may use adjusted continuous contracts, while live execution must map to real tradable contract symbols without look-ahead bias.

### Strategy Research and Backtesting

The platform is intended to support reproducible strategy research, parameter testing, and backtest results tied to data versions and code versions.

### Paper Trading and Shadow Trading

Paper trading is the default local mode. Shadow trading is a future validation stage where strategies observe live market data and theoretical execution without sending live orders.

### Risk Engine

The future Risk Engine should validate stale quotes, exposure limits, daily loss limits, order rates, and kill-switch conditions before any order reaches OMS.

### OMS

The future OMS should own idempotency, order lifecycle state, execution reports, reconciliation, and the transition from approved trading intent to broker-bound order requests.

### Broker Gateway

Broker SDK access must stay isolated behind `broker-gateway`. Strategies must never call broker SDKs directly.

### Web Command Center

The frontend is intended to become a command center for health, portfolio state, strategy status, paper trading, risk limits, and audit review.

The Mock Backend Demo MVP is documented in `docs/mock-backend-demo-mvp.md`.
It exposes deterministic paper-only endpoints under `/api/mock-backend/*` for
mock TX / MTX / TMF market data, signal-only strategy simulation, paper order
simulation through Risk Engine / OMS / Paper Broker Gateway, and paper-only
portfolio summaries. It does not connect to brokers, download external market
data, collect credentials, write production data, create real orders, or enable
live trading.

Production Vercel is a read-only presentation and evaluation surface. It cannot
directly read a user's local SQLite paper records; actual paper OMS / audit
records require local backend demo mode or a future controlled hosted API/data
layer. See `docs/frontend-local-backend-demo-mode.md` and
`docs/production-local-data-boundary.md`. The customer self-service path is
tracked in `docs/customer-self-service-paper-demo-roadmap.md`; the local launcher
is documented in `docs/customer-self-service-local-demo-launcher.md`, and the
customer-facing quick-start flow is documented in
`docs/customer-self-service-demo.md`. Preferred local demo commands are
`make customer-demo-env-check` followed by `make start-customer-demo`. Future
hosted paper API readiness is tracked in
`docs/hosted-paper-backend-api-readiness.md`; the current backend exposes
`GET /api/hosted-paper/environment`, `GET /api/hosted-paper/readiness`,
`GET /api/hosted-paper/datastore-readiness`,
`GET /api/hosted-paper/production-datastore/readiness`,
`GET /api/hosted-paper/sandbox-tenant/onboarding-readiness`,
`GET /api/hosted-paper/identity-readiness`,
`GET /api/hosted-paper/identity-access-contract`,
`GET /api/hosted-paper/auth-provider-selection`,
`GET /api/hosted-paper/session`, and `GET /api/hosted-paper/tenants/current` as
read-only environment, readiness, and mock contract responses only. The hosted
paper SaaS foundation path is documented in
`docs/hosted-paper-saas-foundation-roadmap.md`; Hosted Paper Mode is not enabled,
and Local Demo Mode remains the primary customer path for actual paper records.
The future browser-only customer sandbox tenant onboarding boundary is
documented in `docs/hosted-paper-sandbox-tenant-onboarding-readiness.md` and
exposed as read-only metadata at
`GET /api/hosted-paper/sandbox-tenant/onboarding-readiness`. It makes the
customer onboarding gap explicit: no online sandbox tenant, customer account,
login, session, hosted datastore write, broker call, order creation, or live
approval is enabled.
The future managed datastore contract is documented in
`docs/hosted-paper-managed-datastore-readiness.md`; it defines tenant-scoped
record models, migration boundaries, retention requirements, and audit
requirements without connecting to a hosted database or writing hosted records.
The future production datastore boundary for paper approvals, paper orders, OMS
events, and audit events is documented in
`docs/hosted-paper-production-datastore-readiness.md` and exposed as read-only
metadata at `GET /api/hosted-paper/production-datastore/readiness`. It keeps
production datastore selection, marketplace provisioning, migration apply,
hosted writes, backup configuration, restore drill verification, and retention
enforcement disabled; local SQLite remains demo/development only. The
reviewable dry-run v2 migration blueprint is documented in
`docs/hosted-paper-production-datastore-migration-plan-v2.md` and generated by
`make hosted-paper-production-datastore-migration-plan-v2`; it does not read
`DATABASE_URL`, connect to a database, apply migrations, or write hosted
records.
Future hosted login, session, RBAC, ABAC, and tenant boundaries are specified in
`docs/hosted-paper-auth-boundary-spec.md`; the identity/RBAC/tenant readiness
contract is documented in
`docs/hosted-paper-identity-rbac-tenant-readiness.md`; the identity access
contract separating future customer, reviewer, operator, and admin roles is
documented in `docs/hosted-paper-identity-access-contract.md`; the read-only
auth provider selection matrix comparing Clerk, Auth0, Descope, and Vercel OIDC
/ Sign in with Vercel is documented in
`docs/hosted-paper-auth-provider-selection-matrix.md`; the read-only
mock session contract is documented in `docs/hosted-paper-mock-session-contract.md`.
The current Paper Approval workflow is local scaffolding, not a formal
compliance approval system; the readiness boundary is documented in
`docs/paper-compliance-approval-readiness.md` and exposed as read-only metadata
at `GET /api/paper-execution/approvals/compliance-readiness`.
SQLite audit persistence is also local paper scaffolding, not production WORM
storage or an immutable audit ledger. The WORM readiness boundary is documented
in `docs/paper-audit-worm-readiness.md` and exposed as read-only metadata at
`GET /api/paper-execution/audit-integrity/worm-readiness`. The broader formal
audit/compliance trail readiness boundary is documented in
`docs/paper-audit-compliance-trail-readiness.md` and exposed as read-only
metadata at
`GET /api/paper-execution/audit-integrity/compliance-trail-readiness`; it keeps
append-only audit service, immutable audit log, reviewer identity, RBAC/ABAC,
decision history immutability, retention policy, and export policy unenforced.
Paper OMS is also local paper scaffolding, not a production OMS. The production
readiness boundary is documented in `docs/paper-oms-production-readiness.md` and
exposed as read-only metadata at
`GET /api/paper-execution/reliability/production-readiness`. Durable
queue/outbox workers, asynchronous order processing, full timeout handling,
amend/replace, broker execution report ingestion, and formal reconciliation
remain unavailable. The next production-grade Paper OMS blueprint is documented
in `docs/paper-oms-productionization-blueprint.md` and exposed as read-only
metadata at `GET /api/paper-execution/reliability/productionization-blueprint`.
It converts durable queue/outbox, async processing, duplicate prevention,
timeout handling, execution report, reconciliation, amend/replace/cancel, and
partial-fill accounting gaps into a reviewable plan without starting workers,
connecting databases, calling brokers, or creating orders.
The Web Command Center displays the mock session and tenant context as read-only
contract metadata. Reviewers can export the same mock session and tenant
boundary as local JSON evidence with
`docs/hosted-paper-tenant-boundary-evidence-export.md` and
`scripts/export-hosted-paper-tenant-boundary-evidence.py` via
`make hosted-paper-tenant-boundary-evidence-export`; the Web Command Center can
load that evidence read-only from an explicitly selected local JSON file. The
hosted Web Command Center API connection boundary is documented in
`docs/hosted-web-command-center.md` and exposed as read-only metadata at
`GET /api/hosted-paper/web-command-center/readiness`. The frontend resolves its
API base URL from `NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL`, then
`NEXT_PUBLIC_BACKEND_URL`, then `http://localhost:8000`; these are public
routing values only, not authentication or secrets. The UI can display login
status, tenant, role, and permissions from the mock session contract, but real
login, customer accounts, RBAC/ABAC enforcement, hosted datastore writes, broker
access, hosted customer login, and live trading remain disabled.
Hosted paper security and operations readiness is documented in
`docs/hosted-paper-security-operations-readiness.md` and exposed as read-only
metadata at `GET /api/hosted-paper/security-operations/readiness`. It lists
secrets management, rate limiting, audit monitoring, observability, CI/CD gates,
staging smoke tests, load/abuse tests, and auth boundary tests as required
hosted SaaS controls while keeping secret storage, rate limiting, hosted audit
monitoring, log drains, customer accounts, hosted writes, broker calls, and live
trading disabled.

### Audit and Observability

Enterprise users need logs, metrics, traces, audit records, and replayable state transitions. The current repository includes the development skeleton; production-grade observability is a future direction.

### AI-Assisted Analysis

The `ai-module` is future-facing. AI-assisted diagnostics, research summaries, and strategy review can be useful, but they must not bypass risk controls, OMS state, or broker gateway isolation.

## Architecture Overview

```text
Web Frontend
    |
API Gateway / Backend
    |
Strategy Registry / Backtest / Risk / OMS / Broker Gateway
    |
Event-driven future layer
    |
PostgreSQL / Redis / ClickHouse / Data Lake future
```

Current repository modules:

- `backend`: FastAPI service with health, manifest, and risk configuration endpoints.
- `frontend`: Next.js, React, and TypeScript dashboard skeleton.
- `strategy-engine`: Placeholder for future signal-only strategy runners.
- `data-pipeline`: Placeholder for ingestion, data quality, and rollover-aware datasets.
- `broker-gateway`: Placeholder for paper-first broker adapter boundaries.
- `ai-module`: Placeholder for future AI-assisted analysis outside the execution path.
- `infra`: Placeholder for future deployment, observability, and infrastructure assets.
- `docs`: Architecture, development, runbook, trading safety, and archive documents.
- `scripts`: Bootstrap, check, and Codex prompt helper scripts.

## Safety-First Trading Design

Default environment values are intentionally conservative:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

Safety rules:

- Strategies do not call broker SDKs directly.
- Strategies must only emit signals or target exposure intent.
- Orders must go through Risk Engine and OMS.
- Broker credentials, account IDs, certificates, API keys, and private keys must not be committed.
- This project is not financial advice.
- Live trading requires explicit future approval, implementation, review, operational controls, and legal or regulatory assessment where applicable.

## Technology Stack

- Frontend: Next.js, React, TypeScript
- Backend: FastAPI, Python, pydantic-settings
- Local infrastructure: Docker Compose
- Database: PostgreSQL / Timescale-compatible PostgreSQL
- Cache: Redis
- Analytics: ClickHouse
- Developer workflow: VS Code Dev Container, Makefile, Codex prompts
- Future production direction: Kubernetes, event bus, OpenTelemetry, centralized logging, metrics, secrets management, and isolated deployment environments

## Commercial Model

Potential monetization streams, subject to product maturity and compliance review:

- SaaS subscriptions for individual traders and research users
- Professional trader plans with higher compute, data, and workflow limits
- Enterprise licensing for proprietary trading desks, family offices, or institutional teams
- Data services built on cleaned Taiwan futures datasets
- Strategy marketplace infrastructure
- AI analysis add-ons for diagnostics, reporting, and research assistance
- Broker or institutional partnerships
- Compliance-dependent future performance-based models

Performance fees, managed accounts, signal subscriptions, copy trading, or broker fee-sharing may require legal, regulatory, or licensed partner review.

## Competitive Positioning

The platform is differentiated by:

- Taiwan futures specialization
- TX/MTX/TMF exposure normalization
- Rollover-aware data handling
- Paper-to-live workflow discipline
- Risk-first OMS design
- Enterprise auditability
- Local broker integration potential through broker gateway isolation

## Long-Term Moat

Potential long-term defensibility may come from:

- Proprietary cleaned Taiwan futures datasets
- Rollover and session-aware data models
- Backtest-to-live performance history
- Strategy marketplace network effects
- Broker integrations
- Enterprise workflow lock-in
- Risk and audit data

These are strategic directions, not current completed capabilities.

## Current Repository Status

This repository currently contains a full-stack development skeleton, not a completed trading platform.

Implemented foundation:

- FastAPI backend skeleton
- Next.js frontend skeleton
- Docker Compose local stack
- PostgreSQL / Timescale-compatible database service
- Redis service
- ClickHouse service
- VS Code Dev Container
- Codex prompt templates
- Safety-first environment defaults
- Bootstrap and check scripts

Not currently implemented:

- Real broker integration
- Live trading
- Production OMS
- Production Risk Engine
- Production market data ingestion
- Production backtesting engine
- Production observability and secrets management

## Marketing Website

The investor-facing Astro marketing website lives in `website/`.

- Local development: `make website`
- Static build: `make website-build`
- Deployment helper: `make website-deploy`
- Deployment guide: `docs/website-vercel-deploy.md`

## Cloud-Native Implementation Roadmap

The executable Phase 0-6 roadmap lives in `docs/implementation-roadmap.md`. The source blueprint lives in `docs/cloud-native-transformation-blueprint.md`.

Use these Codex prompts for the next implementation slices:

- `.codex/prompts/10-roadmap-phase-0-compliance.md`
- `.codex/prompts/17-roadmap-next-safe-slice.md`

Roadmap status command:

```bash
make roadmap-status
```

Phase 0-5 remain paper/shadow-only. Phase 6 is readiness planning only and does not enable live trading.

## System Architecture Specification

The system architecture enforces signal/execution separation: strategies emit signals, while the platform handles risk checks, OMS state transitions, paper broker gateway execution, reconciliation, auditability, and observability. Live trading remains disabled by default.

Architecture artifacts:

- `docs/system-architecture-spec.md`
- `docs/control-plane.md`
- `docs/trading-data-plane.md`
- `docs/data-lakehouse-architecture.md`
- `docs/oms-state-machine.md`
- `docs/broker-gateway-adapter-pattern.md`
- `docs/risk-engine-spec.md`
- `docs/security-vault-asvs.md`
- `docs/observability-dr-event-sourcing.md`

Architecture status command:

```bash
make architecture-status
```

## Business Operations Plan

The commercial model prioritizes SaaS tooling, data services, AI diagnostics, enterprise licensing, and implementation services for Taiwan futures quant infrastructure. Regulated services such as signal subscriptions, managed accounts, copy trading, performance fees, or broker fee-sharing require separate legal review.

Business artifacts:

- `docs/business-model.md`
- `docs/pricing-strategy.md`
- `docs/go-to-market.md`
- `docs/compliance-boundary.md`
- `docs/partner-profit-sharing.md`

## Quick Start

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform"
cp .env.example .env
make init
make check
make dev
```

Local URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
- System Manifest: http://localhost:8000/api/system/manifest
- Risk Config: http://localhost:8000/api/risk/config
- ClickHouse HTTP: http://localhost:8123

## Common Commands

```bash
make help           # Show available commands
make init           # Bootstrap local dependencies
make check          # Run available checks
make backend        # Run the FastAPI backend locally
make frontend       # Run the Next.js frontend locally
make infra          # Start local infrastructure services
make dev            # Start the full Docker Compose stack
make test           # Run backend tests
make codex-prompt   # Print the recommended Codex starting prompt
```

## Development Workflow

1. Read `AGENTS.md` first.
2. Use small vertical slices.
3. Keep paper trading defaults.
4. Add tests for backend APIs.
5. Keep the frontend resilient when the backend is unavailable.
6. Keep strategies signal-only.
7. Keep broker access isolated behind `broker-gateway`.
8. Run `make check` before committing or handing off work.

## Roadmap

### Phase 1: Development Foundation

Stabilize monorepo structure, Dev Container, Docker Compose, backend skeleton, frontend skeleton, scripts, and checks.

### Phase 2: Strategy Signal Contract and TX/MTX/TMF Risk Sizing

Define signal schemas, target exposure models, TX-equivalent sizing, and paper-only validation.

### Phase 3: Data Pipeline and Rollover Engine

Build market data ingestion, quality gates, session alignment, and continuous futures rollover handling.

### Phase 4: Backtesting and Paper Trading

Implement reproducible backtests, paper execution simulation, strategy reporting, and data snapshot tracking.

### Phase 5: Risk Engine and OMS Skeleton

Introduce risk checks, order intent validation, OMS state transitions, idempotency, and reconciliation models.

### Phase 6: Broker Gateway Integration

Integrate broker adapters behind paper-first gateway boundaries, with no strategy-level broker SDK access.

### Phase 7: Web Command Center

Expand the dashboard for strategy status, risk limits, paper trading state, alerts, and audit review.

### Phase 8: Enterprise Controls, Audit, Observability, and Deployment

Add RBAC, secrets management, audit logs, traces, metrics, deployment manifests, and operational runbooks.

## Compliance and Risk Notice

This software is for research and engineering development. It is not investment advice and does not promise investment returns. Futures trading involves substantial risk, including the risk of loss greater than initial capital.

Live trading, signal services, managed accounts, copy trading, broker fee-sharing, or performance-based services may require legal review, regulatory review, and proper licenses. Users are responsible for their own trading decisions and compliance obligations.

## License

License to be determined.

## Appendix: Design Principles

- Signal/execution separation
- Paper-first operation
- Risk before order execution
- Auditability
- Reproducibility
- Modularity
- No secrets in source code
