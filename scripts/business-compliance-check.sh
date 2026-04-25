#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

fail=0

require_file() {
  local file="$1"
  if [[ ! -f "${file}" ]]; then
    printf 'Missing required file: %s\n' "${file}" >&2
    fail=1
  fi
}

require_line() {
  local file="$1"
  local line="$2"
  if ! grep -Fxq "${line}" "${file}"; then
    printf 'Missing required line in %s: %s\n' "${file}" "${line}" >&2
    fail=1
  fi
}

require_pattern() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  if ! grep -Eiq "${pattern}" "${file}"; then
    printf 'Missing %s in %s\n' "${description}" "${file}" >&2
    fail=1
  fi
}

printf 'Checking business compliance guardrails...\n'

for file in \
  AGENTS.md \
  README.md \
  .env.example \
  docs/business-operations-plan.md \
  docs/business-model.md \
  docs/pricing-strategy.md \
  docs/go-to-market.md \
  docs/compliance-boundary.md \
  docs/partner-profit-sharing.md \
  .codex/prompts/18-business-operations-implementation.md \
  website/src/pages/business.astro \
  website/src/pages/pricing.astro \
  website/src/pages/go-to-market.astro \
  website/src/pages/compliance.astro \
  website/src/pages/zh/business.astro \
  website/src/pages/zh/pricing.astro \
  website/src/pages/zh/go-to-market.astro \
  website/src/pages/zh/compliance.astro; do
  require_file "${file}"
done

if [[ "${fail}" -ne 0 ]]; then
  exit 1
fi

require_line .env.example 'TRADING_MODE=paper'
require_line .env.example 'ENABLE_LIVE_TRADING=false'
require_line .env.example 'BROKER_PROVIDER=paper'

require_pattern AGENTS.md 'Do not claim guaranteed returns' 'business no-guarantee rule'
require_pattern AGENTS.md 'Do not write investment advice' 'business no-investment-advice rule'
require_pattern AGENTS.md 'Keep live trading disabled by default' 'live-trading-disabled rule'

require_pattern .codex/prompts/18-business-operations-implementation.md 'Keep live trading disabled' 'prompt live-trading-disabled rule'
require_pattern .codex/prompts/18-business-operations-implementation.md 'profit guarantees' 'prompt no-profit-guarantee rule'
require_pattern .codex/prompts/18-business-operations-implementation.md 'compliance-dependent future options only' 'prompt compliance-dependent rule'

require_pattern README.md 'not financial advice|not investment advice' 'README advice disclaimer'
require_pattern README.md 'Live trading.*requires explicit future approval|Live trading.*require legal review' 'README live-trading gate'
require_pattern README.md 'Regulated services.*require separate legal review|may require legal review' 'README regulated-services warning'

require_pattern docs/compliance-boundary.md 'guaranteed profit' 'prohibited phrase list'
require_pattern docs/compliance-boundary.md 'risk-free' 'prohibited phrase list'
require_pattern docs/compliance-boundary.md 'we trade for you' 'prohibited phrase list'
require_pattern docs/compliance-boundary.md 'not investment advice|not legal advice' 'compliance disclaimer'
require_pattern docs/compliance-boundary.md 'consult licensed legal counsel' 'legal review reminder'

require_pattern docs/business-model.md 'not as a guaranteed-profit strategy|no guaranteed returns' 'business model no-guarantee positioning'
require_pattern docs/pricing-strategy.md 'Do not sell guaranteed returns' 'pricing guardrail'
require_pattern docs/go-to-market.md 'not as a profit guarantee' 'GTM no-guarantee positioning'
require_pattern docs/partner-profit-sharing.md 'legal review' 'partner legal-review warning'

require_pattern website/src/pages/compliance.astro 'not investment advice' 'website English investment disclaimer'
require_pattern website/src/pages/compliance.astro 'do not guarantee profit' 'website English no-profit-guarantee disclaimer'
require_pattern website/src/pages/zh/compliance.astro '不構成投資建議' 'website Chinese investment disclaimer'
require_pattern website/src/pages/zh/compliance.astro '不保證獲利' 'website Chinese no-profit-guarantee disclaimer'
require_pattern website/src/components/SafetyDefaults.astro 'ENABLE_LIVE_TRADING=false' 'website safety defaults'

for marketing_file in \
  website/src/pages/business.astro \
  website/src/pages/pricing.astro \
  website/src/pages/go-to-market.astro \
  website/src/pages/zh/business.astro \
  website/src/pages/zh/pricing.astro \
  website/src/pages/zh/go-to-market.astro; do
  risky_hits="$(grep -Ein 'guaranteed profit|risk-free|fully automated money machine|we trade for you|copy our signals for profit|guaranteed alpha|principal guaranteed|no loss|保證獲利|零風險|我們替你交易|保證沒有虧損' "${marketing_file}" || true)"
  risky_hits="$(printf '%s\n' "${risky_hits}" | grep -Eiv 'must not|do not|not |avoid|prohibited|不得|不要|禁止|避免|不' || true)"
  if [[ -n "${risky_hits}" ]]; then
    printf 'Risky prohibited marketing claim found in %s\n' "${marketing_file}" >&2
    printf '%s\n' "${risky_hits}" >&2
    fail=1
  fi
done

if [[ "${fail}" -ne 0 ]]; then
  exit 1
fi

printf 'Business compliance guardrails OK. Live trading remains disabled by default.\n'
