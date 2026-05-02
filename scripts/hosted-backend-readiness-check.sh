#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted backend/API deployment foundation...\n'

required_files=(
  "docs/hosted-backend-api-deployment-foundation.md"
  "docs/hosted-paper-saas-foundation-roadmap.md"
  "docs/hosted-paper-managed-datastore-readiness.md"
  "infra/hosted-backend/README.md"
  "infra/hosted-backend/env-boundary.placeholder.md"
  "backend/app/domain/hosted_backend_environment.py"
  "backend/app/api/hosted_backend_routes.py"
  "backend/tests/test_hosted_backend_environment_routes.py"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing hosted backend readiness file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

for text in \
  "Hosted Backend API Deployment Foundation" \
  "GET /api/hosted-backend/environment" \
  "GET /api/hosted-backend/readiness" \
  "current_environment" \
  "managed_datastore_enabled=false" \
  "local_sqlite_allowed_for_hosted=false" \
  "tenant_isolation_required=true" \
  "live_trading_enabled=false" \
  "broker_provider=paper" \
  "production_trading_ready=false" \
  "dev" \
  "staging" \
  "production" \
  "Live trading remains disabled by default"; do
  if ! grep -Fq "${text}" docs/hosted-backend-api-deployment-foundation.md; then
    printf 'Hosted backend foundation doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "local SQLite is not a hosted datastore" \
  "No managed datastore is connected" \
  "No customer account is created" \
  "No reviewer login is created" \
  "No broker SDK is configured" \
  "No live trading route is enabled"; do
  if ! grep -Fiq "${text}" infra/hosted-backend/README.md; then
    printf 'Hosted backend placeholder README must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "TRADING_MODE=paper" \
  "ENABLE_LIVE_TRADING=false" \
  "BROKER_PROVIDER=paper"; do
  if ! grep -Fq "${text}" infra/hosted-backend/env-boundary.placeholder.md; then
    printf 'Hosted backend environment placeholder must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for text in \
  "HostedBackendEnvironmentResponse" \
  "HostedBackendReadinessResponse" \
  "hosted_backend_enabled" \
  "managed_datastore_enabled" \
  "local_sqlite_allowed_for_hosted" \
  "tenant_isolation_required" \
  "production_trading_ready"; do
  if ! grep -R -Fq "${text}" \
    backend/app/domain/hosted_backend_environment.py \
    backend/app/api/hosted_backend_routes.py \
    backend/tests/test_hosted_backend_environment_routes.py; then
    printf 'Hosted backend contract code must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

for route_text in \
  'prefix="/api/hosted-backend"' \
  '@router.get("/environment"' \
  '@router.get("/readiness"' \
  "get_hosted_backend_environment" \
  "get_hosted_backend_readiness"; do
  if ! grep -R -Fq "${route_text}" backend/app/api/hosted_backend_routes.py backend/app/main.py; then
    printf 'Hosted backend route registration must contain: %s\n' "${route_text}" >&2
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

for forbidden_text in \
  'ENABLE_LIVE_TRADING=true' \
  'BROKER_PROVIDER=shioaji' \
  'BROKER_PROVIDER=fubon' \
  'BROKER_API_KEY=' \
  'BROKER_CERTIFICATE='; do
  if grep -R -Fiq "${forbidden_text}" \
    docs/hosted-backend-api-deployment-foundation.md \
    infra/hosted-backend/README.md \
    infra/hosted-backend/env-boundary.placeholder.md; then
    printf 'Hosted backend foundation contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted backend/API deployment foundation OK. Live trading remains disabled by default.\n'
