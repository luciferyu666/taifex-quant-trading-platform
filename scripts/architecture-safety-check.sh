#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

fail=0

printf 'Checking system architecture safety guardrails...\n'

require_line() {
  local file="$1"
  local line="$2"
  if ! grep -Fxq "${line}" "${file}"; then
    printf 'Missing required safe default in %s: %s\n' "${file}" "${line}" >&2
    fail=1
  fi
}

require_file() {
  local file="$1"
  if [[ ! -f "${file}" ]]; then
    printf 'Missing required architecture file: %s\n' "${file}" >&2
    fail=1
  fi
}

require_line .env.example 'TRADING_MODE=paper'
require_line .env.example 'ENABLE_LIVE_TRADING=false'
require_line .env.example 'BROKER_PROVIDER=paper'

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  fail=1
fi

for file in \
  docs/system-architecture-spec.md \
  docs/control-plane.md \
  docs/trading-data-plane.md \
  docs/broker-gateway-adapter-pattern.md \
  docs/security-vault-asvs.md \
  backend/app/domain/order_state_machine.py \
  backend/app/domain/risk_rules.py \
  backend/app/services/paper_broker_gateway.py \
  backend/app/services/reconciliation.py \
  backend/app/api/architecture_routes.py \
  infra/vault/transit-policy.placeholder.hcl \
  infra/observability/opentelemetry-collector.placeholder.yaml; do
  require_file "${file}"
done

if [[ "${fail}" -ne 0 ]]; then
  exit 1
fi

broker_sdk_hits="$(
  rg -n --glob '*.py' \
    '(^|\s)(import|from)\s+(shioaji|fubon|fubon_neo|sinopac)(\s|\.|$)|Shioaji\s*\(|Fubon' \
    strategy-engine backend/app || true
)"

if [[ -n "${broker_sdk_hits}" ]]; then
  printf 'Forbidden broker SDK usage detected outside reviewed broker-gateway boundary:\n' >&2
  printf '%s\n' "${broker_sdk_hits}" >&2
  fail=1
fi

if rg -n --glob '*.py' 'live_trading_enabled\s*=\s*True|enable_live_trading\s*=\s*True' backend/app strategy-engine >/tmp/tqtp-live-flag-hits.txt; then
  printf 'Unsafe live trading default detected:\n' >&2
  cat /tmp/tqtp-live-flag-hits.txt >&2
  fail=1
fi
rm -f /tmp/tqtp-live-flag-hits.txt

for placeholder in \
  infra/k8s/control-plane/*.placeholder.yaml \
  infra/k8s/trading-data-plane/*.placeholder.yaml \
  infra/vault/transit-policy.placeholder.hcl \
  infra/observability/opentelemetry-collector.placeholder.yaml; do
  if [[ -f "${placeholder}" ]] && ! grep -Eiq 'placeholder|Placeholder' "${placeholder}"; then
    printf 'Placeholder file is not clearly marked as placeholder-only: %s\n' "${placeholder}" >&2
    fail=1
  fi
done

secret_hits="$(
  rg -n \
    '(BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY|api[_-]?key\s*[:=]\s*["'\''][^"'\'']+|token\s*[:=]\s*["'\''][^"'\'']+|password\s*[:=]\s*["'\''][^"'\'']+|secret\s*[:=]\s*["'\''][^"'\'']+)' \
    infra/k8s infra/vault infra/observability backend/app strategy-engine || true
)"

if [[ -n "${secret_hits}" ]]; then
  printf 'Potential secret material detected in architecture/runtime scaffolding:\n' >&2
  printf '%s\n' "${secret_hits}" >&2
  fail=1
fi

if ! grep -Eq 'Risk Engine.*before OMS/Broker Gateway|Risk Engine must approve before OMS/Broker Gateway' AGENTS.md; then
  printf 'AGENTS.md must keep Risk Engine before OMS/Broker Gateway rule.\n' >&2
  fail=1
fi

if ! grep -q 'Live trading remains disabled by default' docs/system-architecture-spec.md; then
  printf 'docs/system-architecture-spec.md must state live trading remains disabled by default.\n' >&2
  fail=1
fi

if [[ "${fail}" -ne 0 ]]; then
  exit 1
fi

printf 'System architecture safety guardrails OK. Live trading remains disabled by default.\n'
