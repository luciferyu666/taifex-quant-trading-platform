#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

required_files=(
  "docs/facebook-community-launch-plan.md"
  "docs/facebook-content-calendar.md"
  "docs/facebook-human-launch-runbook.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${file}" ]]; then
    printf 'Missing required Facebook launch file: %s\n' "${file}" >&2
    exit 1
  fi
done

combined_content="$(mktemp)"
trap 'rm -f "${combined_content}"' EXIT
cat "${required_files[@]}" > "${combined_content}"

required_terms=(
  "Paper Only"
  "research-only"
  "ENABLE_LIVE_TRADING=false"
  "Live trading remains disabled by default"
  "不構成投資建議"
  "不收 broker credentials"
  "不建立真實委託"
)

for term in "${required_terms[@]}"; do
  if ! grep -Fq "${term}" "${combined_content}"; then
    printf 'Facebook launch content must include required safety term: %s\n' "${term}" >&2
    exit 1
  fi
done

forbidden_patterns=(
  "guaranteed profit"
  "risk-free"
  "fully automated money machine"
  "guaranteed alpha"
  "principal guaranteed"
  "no loss"
  "we trade for you"
  "copy our signals for profit"
  "保證獲利"
  "零風險"
  "穩賺"
  "本金保證"
  "不會虧損"
  "代客操作"
  "跟單獲利"
)

for pattern in "${forbidden_patterns[@]}"; do
  if grep -Fqi "${pattern}" "${combined_content}"; then
    printf 'Unsafe Facebook launch content found: %s\n' "${pattern}" >&2
    exit 1
  fi
done

if grep -Eiq '(^|[^[:alnum:]])(buy|sell|long|short) (TX|MTX|TMF)([^[:alnum:]]|$)' "${combined_content}"; then
  printf 'Facebook content appears to contain direct trade instruction language.\n' >&2
  exit 1
fi

printf 'Facebook community launch content safety check passed.\n'
