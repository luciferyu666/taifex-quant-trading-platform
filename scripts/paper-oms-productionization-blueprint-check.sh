#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Paper OMS productionization blueprint files...\n'
missing_file=0
for required_file in \
  docs/paper-oms-productionization-blueprint.md \
  backend/app/domain/paper_oms_productionization_blueprint.py \
  backend/app/api/paper_execution_routes.py \
  backend/tests/test_paper_oms_productionization_blueprint_routes.py \
  scripts/paper-oms-productionization-blueprint-check.sh; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required Paper OMS productionization blueprint file: %s\n' "${required_file}" >&2
    missing_file=1
  fi
done

if [[ "${missing_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking Paper OMS productionization safety defaults...\n'
grep -Fxq 'TRADING_MODE=paper' .env.example
grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example
grep -Fxq 'BROKER_PROVIDER=paper' .env.example

printf 'Checking Paper OMS productionization blueprint contract...\n'
grep -q 'paper-oms-productionization-blueprint' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'blueprint_only_no_production_oms' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'durable_queue_outbox' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'async_order_processing' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'duplicate_prevention_across_sessions' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'timeout_handling_productionization' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'execution_report_model' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'reconciliation_loop' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'amend_replace_cancel_lifecycle' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'partial_fill_quantity_accounting' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'queue_worker_started: bool = False' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'async_processing_enabled: bool = False' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'hosted_database_connected: bool = False' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q 'production_oms_enabled: bool = False' backend/app/domain/paper_oms_productionization_blueprint.py
grep -q '"/reliability/productionization-blueprint"' backend/app/api/paper_execution_routes.py
grep -q 'Paper OMS Productionization Blueprint' docs/paper-oms-productionization-blueprint.md
grep -q 'not a production OMS' docs/paper-oms-productionization-blueprint.md
grep -q 'Live trading remains disabled by default' docs/paper-oms-productionization-blueprint.md

printf 'Checking Paper OMS productionization negative safety claims...\n'
if rg -n --glob '!scripts/paper-oms-productionization-blueprint-check.sh' \
  'production OMS is enabled|production OMS enabled|async OMS enabled|durable queue enabled|正式 OMS 已啟用|正式 OMS 已就緒|實盤 OMS 已啟用' \
  README.md docs backend frontend; then
  printf 'Unsafe Paper OMS productionization claim detected.\n' >&2
  exit 1
fi

printf 'Paper OMS productionization blueprint OK. Live trading remains disabled by default.\n'
