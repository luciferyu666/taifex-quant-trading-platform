#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper backend/API readiness documentation...\n'

required_files=(
  "docs/hosted-paper-backend-api-readiness.md"
  "docs/customer-self-service-paper-demo-roadmap.md"
  "docs/production-local-data-boundary.md"
  "docs/frontend-local-backend-demo-mode.md"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper readiness file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_text=(
  "hosted paper backend/API"
  "managed hosted datastore"
  "remains for local demo mode only"
  "authentication"
  "RBAC"
  "tenant"
  "Broker SDK calls remain forbidden"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "Live trading remains disabled by default"
)

for text in "${required_text[@]}"; do
  if ! grep -R -Fq "${text}" docs/hosted-paper-backend-api-readiness.md; then
    printf 'Hosted paper readiness doc must contain: %s\n' "${text}" >&2
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

for forbidden_text in \
  'ENABLE_LIVE_TRADING=true' \
  'BROKER_PROVIDER=shioaji' \
  'BROKER_PROVIDER=fubon' \
  'production trading ready'; do
  if grep -R -Fiq "${forbidden_text}" docs/hosted-paper-backend-api-readiness.md; then
    printf 'Hosted paper readiness doc contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper backend/API readiness OK. Live trading remains disabled by default.\n'
