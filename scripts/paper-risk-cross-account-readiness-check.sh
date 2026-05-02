#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Paper Risk cross-account readiness boundary files...\n'
missing_file=0
for required_file in \
  docs/paper-risk-cross-account-readiness.md \
  backend/app/domain/paper_risk_cross_account_readiness.py \
  backend/app/api/paper_risk_routes.py \
  backend/tests/test_paper_risk_cross_account_readiness_routes.py \
  frontend/app/components/PaperRiskCrossAccountReadinessPanel.tsx \
  frontend/app/page.tsx \
  frontend/app/i18n.ts; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required Paper Risk cross-account readiness file: %s\n' "${required_file}" >&2
    missing_file=1
  fi
done

if [[ "${missing_file}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking Paper Risk cross-account safety defaults...\n'
grep -Fxq 'TRADING_MODE=paper' .env.example
grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example
grep -Fxq 'BROKER_PROVIDER=paper' .env.example

printf 'Checking Paper Risk cross-account readiness API and UI copy...\n'
grep -q 'local_paper_risk_state_not_cross_account_risk_system' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'cross_account_aggregation_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'account_hierarchy_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'tenant_isolated_risk_state_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'real_account_margin_feed_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'broker_position_feed_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'centralized_risk_limits_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'distributed_kill_switch_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'durable_risk_state_store_enabled: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q 'production_cross_account_risk_system: bool = False' backend/app/domain/paper_risk_cross_account_readiness.py
grep -q '"/cross-account-readiness"' backend/app/api/paper_risk_routes.py
grep -q '/api/paper-risk/cross-account-readiness' frontend/app/page.tsx
grep -q 'Paper risk cross-account readiness' frontend/app/i18n.ts
grep -q '紙上跨帳戶風控 Readiness' frontend/app/i18n.ts
grep -q 'Paper Risk Engine guardrails are not a cross-account risk system' docs/paper-risk-cross-account-readiness.md

printf 'Checking Paper Risk cross-account readiness negative safety claims...\n'
if rg -n --glob '!scripts/paper-risk-cross-account-readiness-check.sh' \
  'cross-account risk ready|production risk approval granted|formal cross-account risk system enabled|正式跨帳戶風控已啟用|production risk 已核准|已具備正式跨帳戶風控' \
  README.md docs backend frontend; then
  printf 'Unsafe Paper Risk cross-account readiness claim detected.\n' >&2
  exit 1
fi

printf 'Paper Risk cross-account readiness OK. Live trading remains disabled by default.\n'
