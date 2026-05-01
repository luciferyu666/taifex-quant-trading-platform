#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper auth/session/RBAC boundary specification...\n'

required_files=(
  "docs/hosted-paper-auth-boundary-spec.md"
  "docs/hosted-paper-backend-api-readiness.md"
  "scripts/hosted-paper-api-readiness-check.sh"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper auth boundary file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_text=(
  "Hosted Paper API Auth Boundary"
  "GET /api/hosted-paper/readiness"
  "GET /api/hosted-paper/session"
  "GET /api/hosted-paper/tenants/current"
  "tenant_id"
  "session_id"
  "RBAC"
  "ABAC"
  "viewer"
  "research_reviewer"
  "risk_reviewer"
  "paper_operator"
  "tenant_admin"
  "no hosted authentication provider is implemented"
  "no credentials are collected"
  "no hosted datastore writes"
  "Broker SDK calls remain forbidden"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "Production Trading Platform remains NOT READY"
  "Live trading remains disabled by default"
)

for text in "${required_text[@]}"; do
  if ! grep -Fq "${text}" docs/hosted-paper-auth-boundary-spec.md; then
    printf 'Hosted paper auth boundary spec must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for safety_default in \
  'TRADING_MODE=paper' \
  'ENABLE_LIVE_TRADING=false' \
  'BROKER_PROVIDER=paper'; do
  if ! grep -Fxq "${safety_default}" .env.example; then
    printf '.env.example must contain %s\n' "${safety_default}" >&2
    exit 1
  fi
done

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  exit 1
fi

for forbidden_text in \
  'ENABLE_LIVE_TRADING=true' \
  'BROKER_PROVIDER=shioaji' \
  'BROKER_PROVIDER=fubon' \
  'production trading ready' \
  'guaranteed profit' \
  'risk-free' \
  'broker credential upload enabled' \
  'real broker login enabled'; do
  if grep -Fiq "${forbidden_text}" docs/hosted-paper-auth-boundary-spec.md; then
    printf 'Hosted paper auth boundary spec contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper auth boundary OK. Live trading remains disabled by default.\n'
