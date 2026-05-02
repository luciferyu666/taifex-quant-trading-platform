#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Paper Broker simulation readiness boundary files...\n'
missing_file=0
for required_file in \
  docs/paper-broker-simulation-readiness.md \
  backend/app/domain/paper_broker_simulation_readiness.py \
  backend/app/api/paper_execution_routes.py \
  backend/tests/test_paper_broker_simulation_readiness_routes.py \
  frontend/app/components/PaperBrokerSimulationReadinessPanel.tsx \
  frontend/app/page.tsx \
  frontend/app/i18n.ts; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required Paper Broker simulation readiness file: %s\n' "${required_file}" >&2
    missing_file=1
  fi
done

if [[ "${missing_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking Paper Broker simulation safety defaults...\n'
grep -Fxq 'TRADING_MODE=paper' .env.example
grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example
grep -Fxq 'BROKER_PROVIDER=paper' .env.example

printf 'Checking Paper Broker simulation readiness API and UI copy...\n'
grep -q 'local_paper_simulation_not_market_matching_or_broker_execution' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'real_market_matching_engine_enabled: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'exchange_order_book_replay_enabled: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'broker_execution_report_model_enabled: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'latency_queue_position_model_enabled: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'slippage_liquidity_calibration_enabled: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'real_account_reconciliation_enabled: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q 'production_execution_model: bool = False' backend/app/domain/paper_broker_simulation_readiness.py
grep -q '"/broker-simulation/readiness"' backend/app/api/paper_execution_routes.py
grep -q '/api/paper-execution/broker-simulation/readiness' frontend/app/page.tsx
grep -q 'Paper broker simulation is not market matching' frontend/app/i18n.ts
grep -q '紙上券商模擬不是真實市場撮合' frontend/app/i18n.ts
grep -q 'Paper broker simulation is not market matching' docs/paper-broker-simulation-readiness.md

printf 'Checking Paper Broker simulation readiness negative safety claims...\n'
if rg -n --glob '!scripts/paper-broker-simulation-readiness-check.sh' \
  'real market fills are guaranteed|production execution model ready|live broker simulation ready|正式撮合已就緒|真實成交保證|production execution 已就緒' \
  README.md docs backend frontend; then
  printf 'Unsafe broker simulation readiness claim detected.\n' >&2
  exit 1
fi

printf 'Paper Broker simulation readiness OK. Live trading remains disabled by default.\n'
