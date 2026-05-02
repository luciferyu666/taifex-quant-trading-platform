#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper auth provider selection matrix...\n'

required_files=(
  "docs/hosted-paper-auth-provider-selection-matrix.md"
  "docs/hosted-paper-auth-boundary-spec.md"
  "docs/hosted-paper-saas-foundation-roadmap.md"
  "backend/app/domain/hosted_paper_auth_provider_selection.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_auth_provider_selection_routes.py"
  "frontend/app/components/HostedPaperAuthProviderSelectionPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper auth provider selection file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_doc_text=(
  "Hosted Paper Auth Provider Selection Matrix"
  "GET /api/hosted-paper/auth-provider-selection"
  "selection_state=selection_matrix_only"
  "Clerk"
  "Auth0"
  "Descope"
  "Vercel OIDC / Sign in with Vercel"
  "tenant_boundary"
  "role_mapping"
  "session_security"
  "mfa_for_privileged_roles"
  "paper_only_policy_enforcement"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "provider_selected=false"
  "integration_enabled=false"
  "auth_provider_enabled=false"
  "customer_account_created=false"
  "reviewer_login_created=false"
  "session_cookie_issued=false"
  "credentials_collected=false"
  "secrets_added=false"
  "hosted_datastore_written=false"
  "broker_api_called=false"
  "order_created=false"
  "production_trading_ready=false"
  "Live trading remains disabled by default"
)

for text in "${required_doc_text[@]}"; do
  if ! grep -Fq "${text}" docs/hosted-paper-auth-provider-selection-matrix.md; then
    printf 'Hosted paper auth provider selection doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

required_code_text=(
  "HostedPaperAuthProviderSelectionResponse"
  "get_hosted_paper_auth_provider_selection"
  "hosted-paper-auth-provider-selection"
  "selection_matrix_only"
  "Clerk"
  "Auth0"
  "Descope"
  "Vercel OIDC / Sign in with Vercel"
  "provider_selected"
  "integration_enabled"
  "auth_provider_enabled"
  "customer_account_created"
  "reviewer_login_created"
  "session_cookie_issued"
  "credentials_collected"
  "secrets_added"
  "hosted_datastore_written"
  "broker_api_called"
  "order_created"
  "production_trading_ready"
  "/auth-provider-selection"
  "HostedPaperAuthProviderSelectionPanel"
)

for text in "${required_code_text[@]}"; do
  if ! grep -R -Fq "${text}" \
    backend/app/domain/hosted_paper_auth_provider_selection.py \
    backend/app/api/hosted_paper_routes.py \
    backend/tests/test_hosted_paper_auth_provider_selection_routes.py \
    frontend/app/components/HostedPaperAuthProviderSelectionPanel.tsx \
    frontend/app/page.tsx; then
    printf 'Hosted paper auth provider selection implementation must contain: %s\n' "${text}" >&2
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
  'provider_selected=true' \
  'integration_enabled=true' \
  'auth_provider_enabled=true' \
  'customer_account_created=true' \
  'reviewer_login_created=true' \
  'session_cookie_issued=true' \
  'credentials_collected=true' \
  'secrets_added=true' \
  'hosted_datastore_written=true' \
  'broker_api_called=true' \
  'order_created=true' \
  'guaranteed profit' \
  'risk-free'; do
  if grep -R -Fiq "${forbidden_text}" \
    docs/hosted-paper-auth-provider-selection-matrix.md \
    backend/app/domain/hosted_paper_auth_provider_selection.py \
    backend/app/api/hosted_paper_routes.py \
    frontend/app/components/HostedPaperAuthProviderSelectionPanel.tsx; then
    printf 'Hosted paper auth provider selection contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper auth provider selection matrix OK. Live trading remains disabled by default.\n'
