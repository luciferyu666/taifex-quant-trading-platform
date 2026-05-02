#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper identity access contract...\n'

required_files=(
  "docs/hosted-paper-identity-access-contract.md"
  "docs/hosted-paper-auth-boundary-spec.md"
  "backend/app/domain/hosted_paper_identity_access.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_identity_access_contract_routes.py"
  "frontend/app/components/HostedPaperIdentityAccessContractPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper identity access file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_doc_text=(
  "Hosted Paper Identity Access Contract"
  "GET /api/hosted-paper/identity-access-contract"
  "contract_state=contract_only_not_implemented"
  "customer"
  "reviewer"
  "operator"
  "admin"
  "RBAC"
  "ABAC"
  "tenant_id"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "real_login_enabled=false"
  "customer_account_created=false"
  "reviewer_login_created=false"
  "admin_login_created=false"
  "operator_login_created=false"
  "session_cookie_issued=false"
  "rbac_enforced=false"
  "abac_enforced=false"
  "tenant_isolation_enforced=false"
  "credentials_collected=false"
  "broker_api_called=false"
  "order_created=false"
  "production_trading_ready=false"
  "Live trading remains disabled by default"
)

for text in "${required_doc_text[@]}"; do
  if ! grep -Fq "${text}" docs/hosted-paper-identity-access-contract.md; then
    printf 'Hosted paper identity access doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

required_code_text=(
  "HostedPaperIdentityAccessContractResponse"
  "get_hosted_paper_identity_access_contract"
  "hosted-paper-identity-access-contract"
  "contract_only_not_implemented"
  "HostedPaperRolePermissionContract"
  "HostedPaperAbacPolicyContract"
  "customer"
  "reviewer"
  "operator"
  "admin"
  "tenant_id_required_on_every_request"
  "cross_tenant_access_allowed"
  "real_login_enabled"
  "session_cookie_issued"
  "rbac_enforced"
  "abac_enforced"
  "broker_api_called"
  "production_trading_ready"
  "/identity-access-contract"
  "HostedPaperIdentityAccessContractPanel"
)

for text in "${required_code_text[@]}"; do
  if ! grep -R -Fq "${text}" \
    backend/app/domain/hosted_paper_identity_access.py \
    backend/app/api/hosted_paper_routes.py \
    backend/tests/test_hosted_paper_identity_access_contract_routes.py \
    frontend/app/components/HostedPaperIdentityAccessContractPanel.tsx \
    frontend/app/page.tsx; then
    printf 'Hosted paper identity access implementation must contain: %s\n' "${text}" >&2
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
  'auth_provider_enabled=true' \
  'real_login_enabled=true' \
  'customer_account_created=true' \
  'reviewer_login_created=true' \
  'session_cookie_issued=true' \
  'rbac_enforced=true' \
  'abac_enforced=true' \
  'tenant_isolation_enforced=true' \
  'credentials_collected=true' \
  'broker_api_called=true' \
  'order_created=true' \
  'guaranteed profit' \
  'risk-free'; do
  if grep -R -Fiq "${forbidden_text}" \
    docs/hosted-paper-identity-access-contract.md \
    backend/app/domain/hosted_paper_identity_access.py \
    backend/app/api/hosted_paper_routes.py \
    frontend/app/components/HostedPaperIdentityAccessContractPanel.tsx; then
    printf 'Hosted paper identity access contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper identity access contract OK. Live trading remains disabled by default.\n'
