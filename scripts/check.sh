#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"
BACKEND_PYTHON="${REPO_ROOT}/backend/.venv/bin/python"

printf 'Checking local safety defaults...\n'
if ! grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example; then
  printf '.env.example must contain ENABLE_LIVE_TRADING=false.\n' >&2
  exit 1
fi

if ! grep -Fxq 'TRADING_MODE=paper' .env.example; then
  printf '.env.example must contain TRADING_MODE=paper.\n' >&2
  exit 1
fi

if ! grep -Fxq 'BROKER_PROVIDER=paper' .env.example; then
  printf '.env.example must contain BROKER_PROVIDER=paper.\n' >&2
  exit 1
fi

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  exit 1
fi

printf 'Checking business operations files...\n'
missing_business_file=0
for required_file in \
  docs/business-operations-plan.md \
  docs/business-model.md \
  docs/pricing-strategy.md \
  docs/go-to-market.md \
  docs/compliance-boundary.md \
  docs/partner-profit-sharing.md \
  .codex/prompts/18-business-operations-implementation.md \
  scripts/business-status.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required business file: %s\n' "${required_file}" >&2
    missing_business_file=1
  fi
done

if ! grep -q 'Business Operations Plan' README.md; then
  printf 'README.md must contain Business Operations Plan section.\n' >&2
  missing_business_file=1
fi

if [[ "${missing_business_file}" -ne 0 ]]; then
  exit 1
fi

if [[ -x scripts/business-compliance-check.sh ]]; then
  bash scripts/business-compliance-check.sh
else
  printf 'scripts/business-compliance-check.sh is missing or not executable.\n' >&2
  exit 1
fi

printf 'Checking roadmap scaffold files...\n'
missing_roadmap_file=0
for required_file in \
  docs/cloud-native-transformation-blueprint.md \
  docs/implementation-roadmap.md \
  docs/phase-0-compliance-boundary.md \
  docs/phase-1-infrastructure-foundation.md \
  docs/phase-2-data-platform.md \
  docs/phase-3-strategy-sdk-backtest.md \
  docs/phase-4-risk-oms-broker-gateway.md \
  docs/phase-5-command-center-shadow-trading.md \
  docs/phase-6-reliability-go-live-readiness.md \
  backend/app/domain/contracts.py \
  backend/app/domain/exposure.py \
  backend/app/services/risk_engine.py \
  backend/app/services/oms.py \
  backend/app/services/broker_gateway.py \
  backend/app/api/roadmap_routes.py \
  data-pipeline/schemas/contract_master.sql \
  strategy-engine/sdk/base_strategy.py \
  scripts/roadmap-status.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required roadmap scaffold file: %s\n' "${required_file}" >&2
    missing_roadmap_file=1
  fi
done

if [[ "${missing_roadmap_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking system architecture scaffold files...\n'
missing_architecture_file=0
for required_file in \
  docs/system-architecture-spec.md \
  docs/control-plane.md \
  docs/trading-data-plane.md \
  docs/data-lakehouse-architecture.md \
  docs/oms-state-machine.md \
  docs/broker-gateway-adapter-pattern.md \
  docs/risk-engine-spec.md \
  docs/security-vault-asvs.md \
  docs/observability-dr-event-sourcing.md \
  backend/app/domain/order_state_machine.py \
  backend/app/domain/allocator.py \
  backend/app/domain/risk_rules.py \
  backend/app/services/paper_broker_gateway.py \
  backend/app/services/reconciliation.py \
  backend/app/api/architecture_routes.py \
  infra/k8s/control-plane/README.md \
  infra/k8s/trading-data-plane/README.md \
  infra/vault/transit-policy.placeholder.hcl \
  infra/observability/opentelemetry-collector.placeholder.yaml \
  .codex/prompts/19-system-architecture-implementation.md \
  scripts/architecture-status.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required architecture scaffold file: %s\n' "${required_file}" >&2
    missing_architecture_file=1
  fi
done

if [[ "${missing_architecture_file}" -ne 0 ]]; then
  exit 1
fi

if [[ -x scripts/architecture-safety-check.sh ]]; then
  bash scripts/architecture-safety-check.sh
else
  printf 'scripts/architecture-safety-check.sh is missing or not executable.\n' >&2
  exit 1
fi

if [[ -x "${BACKEND_PYTHON}" ]]; then
  printf 'Checking backend syntax...\n'
  "${BACKEND_PYTHON}" -m compileall -q backend/app backend/tests

  if "${BACKEND_PYTHON}" -m ruff --version >/dev/null 2>&1; then
    printf 'Running backend Ruff checks...\n'
    "${BACKEND_PYTHON}" -m ruff check backend
  else
    printf 'backend ruff is not installed; skipping Ruff checks.\n' >&2
  fi

  if "${BACKEND_PYTHON}" -m pytest --version >/dev/null 2>&1; then
    printf 'Running backend tests...\n'
    (cd backend && .venv/bin/python -m pytest)
  else
    printf 'backend pytest is not installed; skipping backend tests.\n' >&2
  fi
else
  printf 'backend/.venv/bin/python is missing; skipping backend runtime checks. Run bash scripts/bootstrap.sh.\n' >&2
fi

if command -v python3 >/dev/null 2>&1; then
  printf 'Checking Strategy SDK syntax...\n'
  python3 -m compileall -q strategy-engine/sdk
else
  printf 'python3 is not available; skipping Strategy SDK syntax check.\n' >&2
fi

if command -v npm >/dev/null 2>&1; then
  if [[ -d frontend/node_modules ]]; then
    printf 'Running frontend typecheck...\n'
    (cd frontend && npm run typecheck)

    printf 'Running frontend build...\n'
    (cd frontend && npm run build)
  else
    printf 'frontend/node_modules is missing; skipping frontend checks. Run bash scripts/bootstrap.sh.\n' >&2
  fi
else
  printf 'npm is not available; skipping frontend checks.\n' >&2
fi

printf 'Checking website skeleton files...\n'
missing_website_file=0
for required_file in \
  website/package.json \
  website/tsconfig.json \
  website/astro.config.mjs \
  website/vercel.json \
  website/src/pages/index.astro \
  website/src/styles/global.css; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required website file: %s\n' "${required_file}" >&2
    missing_website_file=1
  fi
done

if [[ "${missing_website_file}" -ne 0 ]]; then
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  if [[ -d website/node_modules ]]; then
    printf 'Running website Astro check...\n'
    (cd website && npm run check)

    printf 'Running website Astro build...\n'
    (cd website && npm run build)
  else
    printf 'Skipping website Astro build because dependencies are not installed. Run: cd website && npm install\n' >&2
  fi
else
  printf 'npm is not available; skipping website Astro checks.\n' >&2
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  printf 'Validating Docker Compose configuration...\n'
  docker compose config >/dev/null
else
  printf 'Docker Compose is not available; skipping docker compose config.\n' >&2
fi

printf '\nCheck summary: available checks completed with live trading disabled.\n'
