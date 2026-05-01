#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking customer evaluation package files...\n'

missing=0
for required_file in \
  docs/customer-evaluation-package.md \
  docs/customer-demo-script.md \
  docs/customer-evaluation-checklist.md \
  docs/customer-feedback-form.md \
  docs/paper-approval-ui-flow-smoke-drill.md \
  docs/local-backend-demo-browser-drill.md \
  docs/production-local-data-boundary.md \
  docs/release-baseline-v0.1.0.md \
  docs/release-verification-record-2026-04-28.md \
  docs/frontend-command-center-deployment-verification.md \
  frontend/scripts/check-paper-approval-ui-flow.mjs; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing customer evaluation file: %s\n' "${required_file}" >&2
    missing=1
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

printf 'Checking customer evaluation safety wording...\n'
for required_text in \
  'Production Trading Platform' \
  'NOT READY' \
  'Live trading remains disabled by default' \
  'TRADING_MODE=paper' \
  'ENABLE_LIVE_TRADING=false' \
  'BROKER_PROVIDER=paper'; do
  if ! grep -R -Fq "${required_text}" \
    docs/customer-evaluation-package.md \
    docs/customer-demo-script.md \
    docs/customer-evaluation-checklist.md \
    docs/customer-feedback-form.md; then
    printf 'Customer evaluation docs must contain required safety text: %s\n' "${required_text}" >&2
    exit 1
  fi
done

printf 'Checking environment safety defaults...\n'
grep -Fxq 'TRADING_MODE=paper' .env.example
grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example
grep -Fxq 'BROKER_PROVIDER=paper' .env.example

printf 'Customer evaluation package OK. Live trading remains disabled by default.\n'
