#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Paper OMS production readiness boundary files...\n'
missing_file=0
for required_file in \
  docs/paper-oms-production-readiness.md \
  backend/app/domain/paper_oms_production_readiness.py \
  backend/app/api/paper_execution_routes.py \
  backend/tests/test_paper_oms_production_readiness_routes.py \
  frontend/app/components/PaperOmsProductionReadinessPanel.tsx \
  frontend/app/page.tsx \
  frontend/app/i18n.ts; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required Paper OMS production readiness file: %s\n' "${required_file}" >&2
    missing_file=1
  fi
done

if [[ "${missing_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking Paper OMS safety defaults...\n'
grep -Fxq 'TRADING_MODE=paper' .env.example
grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example
grep -Fxq 'BROKER_PROVIDER=paper' .env.example

printf 'Checking Paper OMS production readiness API and UI copy...\n'
grep -q 'local_paper_oms_scaffolding_not_production_oms' backend/app/domain/paper_oms_production_readiness.py
grep -q 'asynchronous_order_processing_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'distributed_durable_queue_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'outbox_worker_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'full_timeout_worker_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'amend_replace_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'broker_execution_report_ingestion_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'formal_reconciliation_loop_enabled: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q 'production_oms_ready: bool = False' backend/app/domain/paper_oms_production_readiness.py
grep -q '"/reliability/production-readiness"' backend/app/api/paper_execution_routes.py
grep -q '/api/paper-execution/reliability/production-readiness' frontend/app/page.tsx
grep -q 'Paper OMS is not a production OMS' frontend/app/i18n.ts
grep -q 'Paper OMS 不是 production OMS' frontend/app/i18n.ts
grep -q 'Paper OMS is not a production OMS' docs/paper-oms-production-readiness.md
grep -q 'not a production OMS' README.md

printf 'Checking Paper OMS production readiness negative safety claims...\n'
if rg -n --glob '!scripts/paper-oms-production-readiness-check.sh' \
  'production OMS is ready|production OMS ready|live OMS ready|正式 OMS 已就緒|可正式實盤 OMS' \
  README.md docs backend frontend; then
  printf 'Unsafe production OMS readiness claim detected.\n' >&2
  exit 1
fi

printf 'Paper OMS production readiness OK. Live trading remains disabled by default.\n'
