#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper identity/RBAC/tenant readiness boundary...\n'

required_files=(
  "docs/hosted-paper-identity-rbac-tenant-readiness.md"
  "docs/hosted-paper-auth-boundary-spec.md"
  "backend/app/domain/hosted_paper_identity.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_identity_readiness_routes.py"
  "frontend/app/components/HostedPaperIdentityReadinessPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper identity readiness file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_doc_text=(
  "Hosted Paper Identity / RBAC / Tenant Readiness"
  "GET /api/hosted-paper/identity-readiness"
  "real reviewer login is not enabled"
  "customer accounts are not enabled"
  "authentication provider is"
  "RBAC is not enforced"
  "ABAC is not enforced"
  "tenant isolation is required"
  "Production Vercel cannot read local SQLite"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "reviewer_login_created=false"
  "customer_account_created=false"
  "rbac_abac_enforced=false"
  "tenant_isolation_enforced=false"
  "broker_api_called=false"
  "credentials_collected=false"
  "production_trading_ready=false"
  "Live trading remains disabled by default"
)

for text in "${required_doc_text[@]}"; do
  if ! grep -Fq "${text}" docs/hosted-paper-identity-rbac-tenant-readiness.md; then
    printf 'Hosted paper identity readiness doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

required_code_text=(
  "HostedPaperIdentityReadinessResponse"
  "get_hosted_paper_identity_readiness"
  "hosted-paper-identity-rbac-tenant-readiness"
  "schema_only_not_enabled"
  "reviewer_login_enabled"
  "customer_accounts_enabled"
  "authentication_provider"
  "rbac_enabled"
  "abac_enabled"
  "tenant_isolation_required"
  "tenant_isolation_enforced"
  "local_sqlite_access_from_production_vercel"
  "reviewer_login_created"
  "customer_account_created"
  "rbac_abac_enforced"
  "production_trading_ready"
  "@router.get("
  "/identity-readiness"
  "HostedPaperIdentityReadinessPanel"
)

for text in "${required_code_text[@]}"; do
  if ! grep -R -Fq "${text}" backend/app/domain/hosted_paper_identity.py backend/app/api/hosted_paper_routes.py backend/tests/test_hosted_paper_identity_readiness_routes.py frontend/app/components/HostedPaperIdentityReadinessPanel.tsx; then
    printf 'Hosted paper identity readiness implementation must contain: %s\n' "${text}" >&2
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
  'production trading ready' \
  'real auth provider enabled' \
  'session cookie issued' \
  'customer account created' \
  'reviewer login created' \
  'RBAC enabled=true' \
  'ABAC enabled=true' \
  'broker credential upload enabled' \
  'real broker login enabled' \
  'guaranteed profit' \
  'risk-free'; do
  if grep -R -Fiq "${forbidden_text}" docs/hosted-paper-identity-rbac-tenant-readiness.md backend/app/domain/hosted_paper_identity.py backend/app/api/hosted_paper_routes.py frontend/app/components/HostedPaperIdentityReadinessPanel.tsx; then
    printf 'Hosted paper identity readiness contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper identity/RBAC/tenant readiness OK. Live trading remains disabled by default.\n'
