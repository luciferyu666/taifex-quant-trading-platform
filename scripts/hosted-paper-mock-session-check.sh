#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Checking hosted paper mock session contract...\n'

required_files=(
  "docs/hosted-paper-mock-session-contract.md"
  "docs/hosted-paper-auth-boundary-spec.md"
  "backend/app/domain/hosted_paper_session.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_mock_session_routes.py"
  "frontend/app/components/HostedPaperMockSessionPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required hosted paper mock session file: %s\n' "${required_file}" >&2
    exit 1
  fi
done

required_doc_text=(
  "Hosted Paper Mock Session Contract"
  "GET /api/hosted-paper/session"
  "GET /api/hosted-paper/tenants/current"
  "Web Command Center displays these endpoints"
  "hosted-paper-mock-session-contract"
  "mock_read_only"
  "session.authenticated"
  "session.authentication_provider"
  "tenant_id=mock-tenant-paper-evaluation"
  "viewer"
  "research_reviewer"
  "risk_reviewer"
  "paper_operator"
  "tenant_admin"
  "read_hosted_readiness"
  "read_mock_session"
  "read_current_tenant"
  "create_paper_approval_request"
  "record_paper_reviewer_decision"
  "submit_approved_paper_workflow"
  "enable_live_trading"
  "upload_broker_credentials"
  "TRADING_MODE=paper"
  "ENABLE_LIVE_TRADING=false"
  "BROKER_PROVIDER=paper"
  "Broker SDK calls remain forbidden"
  "Production Trading Platform remains NOT READY"
  "Live trading remains disabled by default"
)

for text in "${required_doc_text[@]}"; do
  if ! grep -Fq "${text}" docs/hosted-paper-mock-session-contract.md; then
    printf 'Hosted paper mock session doc must contain: %s\n' "${text}" >&2
    exit 1
  fi
done

required_code_text=(
  "HostedPaperMockSessionResponse"
  "HostedPaperTenantContext"
  "get_hosted_paper_mock_session"
  "hosted-paper-mock-session-contract"
  "mock_read_only"
  "@router.get(\"/session\""
  "@router.get(\"/tenants/current\""
  "HostedPaperMockSessionPanel"
)

for text in "${required_code_text[@]}"; do
  if ! grep -R -Fq "${text}" backend/app/domain/hosted_paper_session.py backend/app/api/hosted_paper_routes.py backend/tests/test_hosted_paper_mock_session_routes.py frontend/app/components/HostedPaperMockSessionPanel.tsx; then
    printf 'Hosted paper mock session implementation must contain: %s\n' "${text}" >&2
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
  'real auth provider enabled' \
  'session cookie issued' \
  'broker credential upload enabled' \
  'real broker login enabled' \
  'guaranteed profit' \
  'risk-free'; do
  if grep -R -Fiq "${forbidden_text}" docs/hosted-paper-mock-session-contract.md backend/app/domain/hosted_paper_session.py backend/app/api/hosted_paper_routes.py frontend/app/components/HostedPaperMockSessionPanel.tsx; then
    printf 'Hosted paper mock session contains forbidden text: %s\n' "${forbidden_text}" >&2
    exit 1
  fi
done

printf 'Hosted paper mock session contract OK. Live trading remains disabled by default.\n'
