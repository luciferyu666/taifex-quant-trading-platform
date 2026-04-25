SHELL := /usr/bin/env bash

.PHONY: help init infra dev backend frontend website website-build website-preview website-check website-deploy roadmap-status architecture-status architecture-docs-check architecture-safety-check business-docs-check business-compliance-check business-status check test codex-prompt clean

help:
	@printf 'Taifex Quant Trading Platform commands\n'
	@printf '\n'
	@printf '  make init          Bootstrap local dependencies\n'
	@printf '  make infra         Start database/cache/analytics services\n'
	@printf '  make dev           Start the full Docker Compose stack\n'
	@printf '  make backend       Run FastAPI backend locally\n'
	@printf '  make frontend      Run Next.js frontend locally\n'
	@printf '  make website       Run Astro marketing website locally\n'
	@printf '  make website-build Build Astro marketing website\n'
	@printf '  make website-preview Preview built Astro website locally\n'
	@printf '  make website-check Run Astro website checks\n'
	@printf '  make website-deploy Build and deploy website with Vercel CLI\n'
	@printf '  make roadmap-status Print Phase 0-6 roadmap scaffold status\n'
	@printf '  make architecture-status Print system architecture scaffold status\n'
	@printf '  make architecture-docs-check Validate architecture documentation files\n'
	@printf '  make architecture-safety-check Validate architecture safety guardrails\n'
	@printf '  make business-docs-check Validate business documentation files\n'
	@printf '  make business-compliance-check Validate business compliance guardrails\n'
	@printf '  make business-status Print business artifact status\n'
	@printf '  make check         Run validation checks\n'
	@printf '  make test          Run backend tests\n'
	@printf '  make codex-prompt  Print the recommended Codex prompt\n'
	@printf '  make clean         Remove local caches and build artifacts\n'

init:
	bash scripts/bootstrap.sh

infra:
	@if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then \
		docker compose up -d postgres redis clickhouse; \
	else \
		printf 'Docker Compose is not available. Install Docker Desktop or Docker Engine with Compose v2.\n' >&2; \
		exit 1; \
	fi

dev:
	@if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then \
		docker compose up --build; \
	else \
		printf 'Docker Compose is not available. Install Docker Desktop or Docker Engine with Compose v2.\n' >&2; \
		exit 1; \
	fi

backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --host "$${BACKEND_HOST:-0.0.0.0}" --port "$${BACKEND_PORT:-8000}"

frontend:
	cd frontend && npm run dev -- --hostname 0.0.0.0 --port "$${FRONTEND_PORT:-3000}"

website:
	cd website && npm run dev

website-build:
	cd website && npm run build

website-preview:
	cd website && npm run preview

website-check:
	cd website && npm run check

website-deploy:
	bash scripts/deploy-website-vercel.sh

roadmap-status:
	bash scripts/roadmap-status.sh

architecture-status:
	bash scripts/architecture-status.sh

architecture-docs-check:
	@test -f docs/system-architecture-spec.md
	@test -f docs/control-plane.md
	@test -f docs/trading-data-plane.md
	@test -f docs/data-lakehouse-architecture.md
	@test -f docs/oms-state-machine.md
	@test -f docs/broker-gateway-adapter-pattern.md
	@test -f docs/risk-engine-spec.md
	@test -f docs/security-vault-asvs.md
	@test -f docs/observability-dr-event-sourcing.md
	@echo "Architecture docs OK"

architecture-safety-check:
	bash scripts/architecture-safety-check.sh

business-docs-check:
	@test -f docs/business-model.md
	@test -f docs/pricing-strategy.md
	@test -f docs/go-to-market.md
	@test -f docs/compliance-boundary.md
	@test -f docs/partner-profit-sharing.md
	@echo "Business docs OK"

business-compliance-check:
	bash scripts/business-compliance-check.sh

business-status:
	bash scripts/business-status.sh

check:
	bash scripts/check.sh

test:
	cd backend && . .venv/bin/activate && pytest

codex-prompt:
	bash scripts/codex-prompt.sh

clean:
	@printf 'Removing local caches and build artifacts only.\n'
	find . -type d \( -name '__pycache__' -o -name '.pytest_cache' -o -name '.ruff_cache' -o -name '.next' -o -name 'dist' -o -name 'build' \) -prune -exec rm -r {} +
