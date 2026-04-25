#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Taifex Quant Trading Platform business status\n\n'

required_docs=(
  docs/business-operations-plan.md
  docs/business-model.md
  docs/pricing-strategy.md
  docs/go-to-market.md
  docs/compliance-boundary.md
  docs/partner-profit-sharing.md
)

required_pages=(
  website/src/pages/business.astro
  website/src/pages/pricing.astro
  website/src/pages/go-to-market.astro
  website/src/pages/compliance.astro
  website/src/pages/zh/business.astro
  website/src/pages/zh/pricing.astro
  website/src/pages/zh/go-to-market.astro
  website/src/pages/zh/compliance.astro
)

missing=0

printf 'Business docs:\n'
for file in "${required_docs[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nWebsite business pages:\n'
for file in "${required_pages[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present  %s\n' "${file}"
  else
    printf '  missing  %s\n' "${file}"
    missing=1
  fi
done

printf '\nREADME business section:\n'
if grep -q 'Business Operations Plan' README.md; then
  printf '  present  README.md Business Operations Plan\n'
else
  printf '  missing  README.md Business Operations Plan\n'
  missing=1
fi

printf '\nSafety defaults from .env.example:\n'
grep -E '^(TRADING_MODE|ENABLE_LIVE_TRADING|BROKER_PROVIDER)=' .env.example || true

printf '\nSuggested next Codex prompt:\n'
printf '  .codex/prompts/18-business-operations-implementation.md\n'

if [[ "${missing}" -ne 0 ]]; then
  printf '\nBusiness status: missing required artifacts.\n' >&2
  exit 1
fi

printf '\nBusiness status: required artifacts are present. Live trading remains disabled by default.\n'
