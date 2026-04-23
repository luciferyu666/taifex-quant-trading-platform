# Taifex Quant Trading Platform

Taifex Quant Trading Platform is a local-first development skeleton for an enterprise-grade web platform for Taiwan Index Futures quantitative trading across TX, MTX, and TMF. It is designed around strict separation between strategy signals and order execution, with future orders flowing through risk checks, OMS state management, and broker gateways.

## Key Features

- FastAPI backend skeleton with health and system manifest endpoints.
- Next.js + TypeScript frontend dashboard skeleton.
- Docker Compose services for PostgreSQL, Redis, ClickHouse, backend, and frontend.
- VS Code Dev Container and workspace tasks.
- Paper-trading defaults with live trading disabled.
- Codex prompt templates and project rules.
- Local bootstrap and validation scripts.

## Architecture Overview

The platform preserves a production-minded split between the control plane and trading/data plane.

- Control plane: UI, configuration, audit, user workflows, strategy lifecycle.
- Trading/data plane: market data, strategy signal intake, Risk Engine, OMS, Broker Gateway, portfolio state.
- Event flow: Strategy Engine emits target exposure signals. Risk Engine validates them. OMS owns order state transitions. Broker Gateway is the only future integration point for broker SDK access.

## Key Modules

- `backend`: FastAPI API boundary for health, system manifest, and future control-plane endpoints.
- `frontend`: Next.js + TypeScript operator dashboard.
- `strategy-engine`: Future signal-only strategy runners.
- `data-pipeline`: Future ingestion, session alignment, rollover, and data quality workflows.
- `broker-gateway`: Future paper-first broker adapter boundary. Strategies must not import broker SDKs.
- `ai-module`: Future analytics and research assistance outside the order execution path.
- `infra`: Future Docker, Kubernetes, observability, and deployment assets.

## Safety Defaults

This repository defaults to paper trading:

- `TRADING_MODE=paper`
- `ENABLE_LIVE_TRADING=false`
- `BROKER_PROVIDER=paper`
- Conservative exposure and daily loss defaults are provided in `.env.example`.

Live trading is intentionally not implemented or enabled. This project is not financial advice.
Live trading must require explicit future implementation, review, and approval.

## Quick Start

```bash
cp .env.example .env
bash scripts/bootstrap.sh
make check
make dev
```

## Common Commands

```bash
make help           # Show available commands
make init           # Bootstrap local Python and Node dependencies
make infra          # Start local infrastructure services
make backend        # Run FastAPI locally
make frontend       # Run Next.js locally
make dev            # Start the full Docker Compose stack
make check          # Run validation checks
make test           # Run backend tests
make codex-prompt   # Print the recommended Codex starting prompt
```

## Local Service URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend health: http://localhost:8000/health
- Backend manifest: http://localhost:8000/api/system/manifest
- Risk config: http://localhost:8000/api/risk/config
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- ClickHouse HTTP: http://localhost:8123

## Development Workflow

1. Read `AGENTS.md` before making changes.
2. Start from a small vertical slice.
3. Keep strategies signal-only.
4. Keep broker access isolated behind `broker-gateway`.
5. Run `make check` before handing off work.

This project defaults to paper trading and is not financial advice.
Live trading must require explicit future implementation and approval.
