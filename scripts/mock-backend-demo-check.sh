#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Mock Backend Demo MVP files...\n'
missing=0
for required_file in \
  backend/app/domain/mock_backend.py \
  backend/app/api/mock_backend_routes.py \
  backend/tests/test_mock_backend_routes.py \
  frontend/app/components/MockBackendDemoPanel.tsx \
  docs/mock-backend-demo-mvp.md; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required mock backend file: %s\n' "${required_file}" >&2
    missing=1
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking Mock Backend routes and safety flags...\n'
for needle in \
  '/api/mock-backend' \
  '"/status"' \
  '"/market-data/preview"' \
  '"/strategy/run"' \
  '"/order/simulate"' \
  '"/demo-session"' \
  '"/demo-session/reset"'; do
  if ! grep -q "${needle}" backend/app/api/mock_backend_routes.py; then
    printf 'Missing mock backend route marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

for needle in \
  'MockBackendSafetyFlags' \
  'paper_only: bool = True' \
  'mock_backend: bool = True' \
  'deterministic_data: bool = True' \
  'live_trading_enabled: bool = False' \
  'broker_api_called: bool = False' \
  'external_market_data_downloaded: bool = False' \
  'real_order_created: bool = False' \
  'credentials_collected: bool = False' \
  'production_trading_ready: bool = False' \
  'investment_advice: bool = False' \
  'simulate_mock_order' \
  'evaluate_paper_order' \
  'PaperBrokerGateway' \
  'apply_order_event'; do
  if ! grep -q "${needle}" backend/app/domain/mock_backend.py; then
    printf 'Missing mock backend domain marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

printf 'Checking Web Command Center mock backend panel...\n'
for needle in \
  'MockBackendDemoPanel' \
  '/api/mock-backend/status' \
  '/api/mock-backend/market-data/preview' \
  '/api/mock-backend/strategy/run' \
  '/api/mock-backend/order/simulate' \
  '/api/mock-backend/demo-session/reset' \
  'paper_only' \
  'live_trading_enabled' \
  'broker_api_called' \
  'external_market_data_downloaded' \
  'real_order_created' \
  'credentials_collected' \
  'production_trading_ready'; do
  if ! grep -q "${needle}" frontend/app/components/MockBackendDemoPanel.tsx; then
    printf 'Missing mock backend frontend marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

if ! grep -q 'MockBackendDemoPanel' frontend/app/page.tsx; then
  printf 'MockBackendDemoPanel must be mounted in frontend/app/page.tsx.\n' >&2
  exit 1
fi

if ! grep -q 'Mock Backend Demo MVP' frontend/app/i18n.ts; then
  printf 'frontend/app/i18n.ts must contain Mock Backend Demo MVP copy.\n' >&2
  exit 1
fi

printf 'Checking safety copy...\n'
for needle in \
  'Paper Only' \
  'Mock Backend' \
  'No broker' \
  'No real money' \
  'No live trading' \
  'Not investment advice'; do
  if ! grep -q "${needle}" frontend/app/i18n.ts docs/mock-backend-demo-mvp.md; then
    printf 'Missing required mock backend safety copy: %s\n' "${needle}" >&2
    exit 1
  fi
done

if grep -Eiq 'guaranteed profit|risk-free|保證獲利|零風險|live trading enabled|approve live|核准實盤' \
  frontend/app/components/MockBackendDemoPanel.tsx \
  docs/mock-backend-demo-mvp.md; then
  printf 'Unsafe mock backend copy found.\n' >&2
  exit 1
fi

printf 'Mock Backend Demo MVP OK. Live trading remains disabled by default.\n'
