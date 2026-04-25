#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Taifex Quant Trading Platform architecture status\n\n'

architecture_docs=(
  docs/system-architecture-spec.md
  docs/control-plane.md
  docs/trading-data-plane.md
  docs/data-lakehouse-architecture.md
  docs/oms-state-machine.md
  docs/broker-gateway-adapter-pattern.md
  docs/risk-engine-spec.md
  docs/security-vault-asvs.md
  docs/observability-dr-event-sourcing.md
)

backend_modules=(
  backend/app/domain/order_state_machine.py
  backend/app/domain/allocator.py
  backend/app/domain/risk_rules.py
  backend/app/services/paper_broker_gateway.py
  backend/app/services/reconciliation.py
  backend/app/api/architecture_routes.py
)

infra_placeholders=(
  infra/k8s/control-plane/README.md
  infra/k8s/control-plane/namespace.placeholder.yaml
  infra/k8s/control-plane/api-gateway-deployment.placeholder.yaml
  infra/k8s/control-plane/strategy-registry-deployment.placeholder.yaml
  infra/k8s/control-plane/web-command-center-deployment.placeholder.yaml
  infra/k8s/control-plane/audit-service-deployment.placeholder.yaml
  infra/k8s/trading-data-plane/README.md
  infra/k8s/trading-data-plane/namespace.placeholder.yaml
  infra/k8s/trading-data-plane/market-data-service-deployment.placeholder.yaml
  infra/k8s/trading-data-plane/strategy-runner-deployment.placeholder.yaml
  infra/k8s/trading-data-plane/risk-engine-deployment.placeholder.yaml
  infra/k8s/trading-data-plane/oms-deployment.placeholder.yaml
  infra/k8s/trading-data-plane/broker-gateway-deployment.placeholder.yaml
  infra/vault/transit-policy.placeholder.hcl
  infra/observability/opentelemetry-collector.placeholder.yaml
)

missing=0

print_group() {
  local title="$1"
  shift
  local files=("$@")
  printf '%s:\n' "${title}"
  for file in "${files[@]}"; do
    if [[ -f "${file}" ]]; then
      printf '  present  %s\n' "${file}"
    else
      printf '  missing  %s\n' "${file}"
      missing=1
    fi
  done
  printf '\n'
}

print_group "Architecture docs" "${architecture_docs[@]}"
print_group "Backend architecture modules" "${backend_modules[@]}"
print_group "Infrastructure placeholders" "${infra_placeholders[@]}"

printf 'Safety defaults from .env.example:\n'
grep -E '^(TRADING_MODE|ENABLE_LIVE_TRADING|BROKER_PROVIDER)=' .env.example || true

printf '\nSuggested next Codex prompt:\n'
printf '  .codex/prompts/19-system-architecture-implementation.md\n'

if [[ "${missing}" -ne 0 ]]; then
  printf '\nArchitecture status: missing required artifacts.\n' >&2
  exit 1
fi

printf '\nArchitecture status: required artifacts are present. Live trading remains disabled by default.\n'
