#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking Browser-only Mock Demo Runtime files...\n'
missing=0
for required_file in \
  frontend/app/components/browserOnlyMockRuntime.ts \
  frontend/app/components/BrowserOnlyMockDemoGuide.tsx \
  frontend/app/components/BrowserOnlyMockVisualizationPanel.tsx \
  frontend/app/components/MarketRealismVisualizationPanel.tsx \
  frontend/app/components/BrowserOnlyMockDemoPanel.tsx \
  frontend/app/components/ProductValueAlignmentPanel.tsx \
  docs/browser-only-mock-demo-runtime.md \
  docs/interactive-demo-information-architecture.md; do
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
  'buildBrowserOnlyVisualizationData' \
  'resetBrowserOnlyMockSession' \
  'paper_only: true' \
  'browser_only: true' \
  'live_trading_enabled: false' \
  'broker_api_called: false' \
  'external_market_data_downloaded: false' \
  'real_order_created: false' \
  'credentials_collected: false' \
  'database_written: false' \
  'performance_claim: false' \
  'BrowserMockMarketRegime' \
  'market_regime' \
  'spread_points' \
  'liquidity_score' \
  'slippage_points_estimate' \
  'deterministic_spread_liquidity_v1' \
  'stale_quote' \
  'illiquid'; do
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
  'Complete browser-only walkthrough' \
  'Taiwan index futures data analysis and Paper Trading research platform' \
  'Market Data Lab' \
  'Strategy Research' \
  'Paper Trading Simulator' \
  'User benefit' \
  'BrowserOnlyMockDemoGuide' \
  'BrowserOnlyMockVisualizationPanel' \
  'MarketRealismVisualizationPanel' \
  'runBrowserOnlyMockStrategy' \
  'simulateBrowserOnlyPaperOrder' \
  'copyDemoSummary' \
  'copyEvidenceJson' \
  'clearDemoState' \
  'assertBrowserOnlySafety' \
  'marketRegime' \
  'fillReason' \
  'market_realism' \
  'browser_only' \
  'database_written'; do
  if ! grep -q "${needle}" frontend/app/components/BrowserOnlyMockDemoPanel.tsx frontend/app/i18n.ts; then
    printf 'Missing browser-only panel marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

printf 'Checking browser-only visualization layer behavior...\n'
for needle in \
  'BrowserOnlyMockVisualizationPanel' \
  'buildBrowserOnlyVisualizationData' \
  'browser-price-chart' \
  'regime-strip' \
  'microstructure-list' \
  'order-outcome-rail' \
  'No external market data' \
  'No broker' \
  'No real order'; do
  if ! grep -q "${needle}" frontend/app/components/BrowserOnlyMockVisualizationPanel.tsx frontend/app/i18n.ts; then
    printf 'Missing browser-only visualization marker: %s\n' "${needle}" >&2
    exit 1
  fi
done

printf 'Checking market realism visualization layer behavior...\n'
for needle in \
  'MarketRealismVisualizationPanel' \
  'buildBrowserOnlyVisualizationData' \
  'market-regime-timeline' \
  'market-quality-meter' \
  'fill-explanation-box' \
  'Regime, spread, liquidity, slippage, and fill reason' \
  'Quote Quality' \
  'Fill Explanation' \
  '市場狀態、價差、流動性、滑價與成交原因' \
  '成交說明'; do
  if ! grep -q "${needle}" frontend/app/components/MarketRealismVisualizationPanel.tsx frontend/app/i18n.ts; then
    printf 'Missing market realism visualization marker: %s\n' "${needle}" >&2
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

if ! grep -q 'ProductValueAlignmentPanel' frontend/app/page.tsx; then
  printf 'ProductValueAlignmentPanel must be mounted in frontend/app/page.tsx.\n' >&2
  exit 1
fi

if ! grep -q 'useState<TabKey>("paper")' frontend/app/components/CommandCenterTabs.tsx; then
  printf 'Command Center must open Paper OMS tab first for the browser-only guided demo.\n' >&2
  exit 1
fi

if ! grep -q 'paper={[[:space:]]*$' frontend/app/page.tsx || \
   ! grep -q '<BrowserOnlyMockDemoPanel copy={copy.browserOnlyMockDemo} />' frontend/app/page.tsx; then
  printf 'BrowserOnlyMockDemoPanel must be mounted as the first Paper OMS tab surface.\n' >&2
  exit 1
fi

printf 'Checking browser-only safety copy...\n'
for needle in \
  'Browser-only Mock Runtime' \
  '台指期資料分析與 Paper Trading 研究平台' \
  '使用者利益' \
  '不送真實委託' \
  'Paper OMS tab opens first' \
  'No backend required' \
  'No broker' \
  'No real money' \
  'No live trading' \
  'Not investment advice' \
  'Copy evidence JSON' \
  'Deterministic mock seed' \
  'Market Realism' \
  'Market regime' \
  'Fill reason' \
  'Slippage estimate' \
  'Visualization Layer' \
  'Price Path' \
  'Microstructure' \
  'Order Outcome' \
  'Market path, microstructure, order outcome, and paper PnL' \
  'Market Realism Visualization' \
  'Regime, spread, liquidity, slippage, and fill reason' \
  'Quote Quality' \
  'Fill Explanation' \
  '市場真實度' \
  '市場狀態' \
  '成交原因' \
  '滑價估計' \
  '市場路徑、微結構、訂單結果與紙上 PnL' \
  '市場真實度視覺化' \
  '市場狀態、價差、流動性、滑價與成交原因' \
  '完整 Browser-only 操作流程' \
  '預設先開啟 Paper OMS' \
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
  frontend/app/components/BrowserOnlyMockVisualizationPanel.tsx \
  frontend/app/components/MarketRealismVisualizationPanel.tsx \
  docs/browser-only-mock-demo-runtime.md; then
  printf 'Unsafe browser-only mock demo copy found.\n' >&2
  exit 1
fi

printf 'Browser-only Mock Demo Runtime OK. Live trading remains disabled by default.\n'
