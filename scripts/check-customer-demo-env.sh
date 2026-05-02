#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

fail() {
  printf 'Customer demo environment check failed: %s\n' "$1" >&2
  exit 1
}

require_file() {
  [[ -f "$1" ]] || fail "missing required file: $1"
}

printf 'Checking Customer Self-Service Demo environment...\n'

for required_file in \
  .env.example \
  Makefile \
  scripts/launch-self-service-paper-demo.sh \
  scripts/start-customer-demo.sh \
  scripts/start-customer-demo.ps1 \
  scripts/seed-paper-execution-demo.py \
  docs/customer-self-service-demo.md \
  docs/customer-self-service-local-demo-launcher.md \
  docs/production-local-data-boundary.md \
  frontend/app/components/LocalDemoSetupPanel.tsx \
  frontend/app/components/LocalBackendDemoModePanel.tsx; do
  require_file "${required_file}"
done

for safety_default in \
  'TRADING_MODE=paper' \
  'ENABLE_LIVE_TRADING=false' \
  'BROKER_PROVIDER=paper'; do
  grep -Fxq "${safety_default}" .env.example || fail ".env.example must contain ${safety_default}"
done

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  fail "unsafe local config: ENABLE_LIVE_TRADING is enabled in .env"
fi

command -v bash >/dev/null 2>&1 || fail "bash is required"
command -v curl >/dev/null 2>&1 || fail "curl is required"

if [[ ! -x backend/.venv/bin/python ]]; then
  fail "backend/.venv/bin/python is missing. Run bash scripts/bootstrap.sh before the customer demo."
fi

if ! command -v npm >/dev/null 2>&1; then
  fail "npm is required for the local frontend"
fi

if [[ ! -d frontend/node_modules ]]; then
  fail "frontend/node_modules is missing. Run bash scripts/bootstrap.sh before the customer demo."
fi

bash scripts/launch-self-service-paper-demo.sh --check-only

printf 'Customer demo environment check passed.\n'
printf 'Recommended start command: make start-customer-demo\n'
printf 'Production Vercel direct SQLite access remains false.\n'
printf 'Live trading remains disabled by default.\n'
