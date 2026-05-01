#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking customer self-service paper demo roadmap...\n'

required_files=(
  "docs/customer-self-service-paper-demo-roadmap.md"
  "docs/customer-self-service-local-demo-launcher.md"
  "docs/production-local-data-boundary.md"
  "docs/frontend-local-backend-demo-mode.md"
  "docs/customer-evaluation-package.md"
  "scripts/launch-self-service-paper-demo.sh"
  "frontend/app/i18n.ts"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required self-service demo file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_text=(
  "Production Vercel cannot directly read"
  "local SQLite"
  "local backend demo"
  "future controlled hosted"
  "make launch-self-service-paper-demo"
  "make self-service-paper-demo-launcher-check"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "Live trading remains disabled by default"
)

for text in "${required_text[@]}"; do
  if ! grep -R -Fq "${text}" \
    docs/customer-self-service-paper-demo-roadmap.md \
    docs/customer-self-service-local-demo-launcher.md \
    docs/production-local-data-boundary.md \
    docs/frontend-local-backend-demo-mode.md; then
    printf 'Self-service paper demo docs must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for safety_default in \
  'TRADING_MODE=paper' \
  'ENABLE_LIVE_TRADING=false' \
  'BROKER_PROVIDER=paper'; do
  if ! grep -Fxq "${safety_default}" .env.example; then
    printf '.env.example must contain %s\n' "${safety_default}" >&2
    exit 1
  fi
done

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  exit 1
fi

printf 'Customer self-service paper demo roadmap OK. Live trading remains disabled by default.\n'
