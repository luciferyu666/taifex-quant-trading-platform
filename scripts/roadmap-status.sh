#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Taifex Quant Trading Platform roadmap status\n\n'

required_docs=(
  docs/cloud-native-transformation-blueprint.md
  docs/implementation-roadmap.md
  docs/phase-0-compliance-boundary.md
  docs/phase-1-infrastructure-foundation.md
  docs/phase-2-data-platform.md
  docs/phase-3-strategy-sdk-backtest.md
  docs/phase-4-risk-oms-broker-gateway.md
  docs/phase-5-command-center-shadow-trading.md
  docs/phase-6-reliability-go-live-readiness.md
)

required_backend=(
  backend/app/domain/contracts.py
  backend/app/domain/signals.py
  backend/app/domain/exposure.py
  backend/app/domain/risk.py
  backend/app/domain/orders.py
  backend/app/domain/events.py
  backend/app/services/risk_engine.py
  backend/app/services/oms.py
  backend/app/services/broker_gateway.py
  backend/app/services/strategy_registry.py
  backend/app/services/market_data.py
  backend/app/api/roadmap_routes.py
)

missing=0

printf 'Roadmap docs:\n'
for file in "${required_docs[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nBackend scaffold:\n'
for file in "${required_backend[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nSafety defaults from .env.example:\n'
grep -E '^(TRADING_MODE|ENABLE_LIVE_TRADING|BROKER_PROVIDER|MAX_TX_EQUIVALENT_EXPOSURE|MAX_DAILY_LOSS_TWD|STALE_QUOTE_SECONDS)=' .env.example || true

printf '\nSuggested next Codex prompt:\n'
printf '  .codex/prompts/17-roadmap-next-safe-slice.md\n'

if [[ "${missing}" -ne 0 ]]; then
  printf '\nRoadmap status: missing required scaffold files.\n' >&2
  exit 1
fi

printf '\nRoadmap status: required scaffold files are present. Live trading remains disabled by default.\n'
