#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Browser-only Mock Demo Runtime files...\n'
missing=0
for required_file in \
  frontend/app/components/browserOnlyMockRuntime.ts \
  frontend/app/components/BrowserOnlyMockDemoPanel.tsx \
  docs/browser-only-mock-demo-runtime.md; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required browser-only mock demo file: %s\n' "${required_file}" >&2
    missing=1
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking browser-only runtime safety markers...\n'
for needle in \
  'createInitialBrowserOnlyMockSession' \
  'advanceBrowserOnlyMockTick' \
  'runBrowserOnlyMockStrategy' \
  'simulateBrowserOnlyPaperOrder' \
  'resetBrowserOnlyMockSession' \
  'paper_only: true' \
  'browser_only: true' \
  'live_trading_enabled: false' \
  'broker_api_called: false' \
  'external_market_data_downloaded: false' \
  'real_order_created: false' \
  'credentials_collected: false' \
  'database_written: false' \
  'performance_claim: false'; do
  if ! grep -q "${needle}" frontend/app/components/browserOnlyMockRuntime.ts; then
    printf 'Missing browser-only runtime marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

printf 'Checking browser-only panel behavior...\n'
for needle in \
  'BrowserOnlyMockDemoPanel' \
  'localStorage' \
  'Generate next tick' \
  'runBrowserOnlyMockStrategy' \
  'simulateBrowserOnlyPaperOrder' \
  'assertBrowserOnlySafety' \
  'browser_only' \
  'database_written'; do
  if ! grep -q "${needle}" frontend/app/components/BrowserOnlyMockDemoPanel.tsx frontend/app/i18n.ts; then
    printf 'Missing browser-only panel marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

if grep -q 'fetch(' frontend/app/components/BrowserOnlyMockDemoPanel.tsx; then
  printf 'Browser-only mock demo panel must not call fetch.\n' >&2
  exit 1
fi

if grep -q 'commandCenterApiBaseUrl' frontend/app/components/BrowserOnlyMockDemoPanel.tsx; then
  printf 'Browser-only mock demo panel must not depend on backend API base URL.\n' >&2
  exit 1
fi

if ! grep -q 'BrowserOnlyMockDemoPanel' frontend/app/page.tsx; then
  printf 'BrowserOnlyMockDemoPanel must be mounted in frontend/app/page.tsx.\n' >&2
  exit 1
fi

printf 'Checking browser-only safety copy...\n'
for needle in \
  'Browser-only Mock Runtime' \
  'No backend required' \
  'No broker' \
  'No real money' \
  'No live trading' \
  'Not investment advice' \
  '不需要後端' \
  '無券商' \
  '無真實資金' \
  '實盤關閉' \
  '不構成投資建議'; do
  if ! grep -q "${needle}" frontend/app/i18n.ts docs/browser-only-mock-demo-runtime.md; then
    printf 'Missing browser-only safety copy: %s\n' "${needle}" >&2
    exit 1
  fi
done

if grep -Eiq 'guaranteed profit|risk-free|保證獲利|零風險|live trading enabled|approve live|核准實盤' \
  frontend/app/components/browserOnlyMockRuntime.ts \
  frontend/app/components/BrowserOnlyMockDemoPanel.tsx \
  docs/browser-only-mock-demo-runtime.md; then
  printf 'Unsafe browser-only mock demo copy found.\n' >&2
  exit 1
fi

printf 'Browser-only Mock Demo Runtime OK. Live trading remains disabled by default.\n'
