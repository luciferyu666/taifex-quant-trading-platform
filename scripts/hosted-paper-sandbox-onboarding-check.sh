#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "docs/hosted-paper-sandbox-tenant-onboarding-readiness.md"
  "backend/app/domain/hosted_paper_sandbox_onboarding.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_sandbox_onboarding_routes.py"
  "frontend/app/components/HostedPaperSandboxOnboardingPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  test -f "${required_file}"
done

grep -q "TRADING_MODE=paper" .env.example
grep -q "ENABLE_LIVE_TRADING=false" .env.example
grep -q "BROKER_PROVIDER=paper" .env.example

grep -q "GET /api/hosted-paper/sandbox-tenant/onboarding-readiness" \
  docs/hosted-paper-sandbox-tenant-onboarding-readiness.md
grep -q "/sandbox-tenant/onboarding-readiness" backend/app/api/hosted_paper_routes.py
grep -q "HostedPaperSandboxOnboardingReadinessResponse" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "contract_only_no_online_sandbox_tenant" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "online_sandbox_tenant_enabled: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "browser_only_customer_onboarding_enabled: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "guided_demo_data_contract_defined: bool = True" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "guided_demo_data_hosted: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "online_sandbox_tenant_created: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "customer_account_created: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "hosted_datastore_written: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "broker_api_called: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py
grep -q "order_created: bool = False" \
  backend/app/domain/hosted_paper_sandbox_onboarding.py

grep -q "HostedPaperSandboxOnboardingPanel" frontend/app/page.tsx
grep -q "/api/hosted-paper/sandbox-tenant/onboarding-readiness" frontend/app/page.tsx
grep -q "hostedPaperSandboxOnboarding" frontend/app/i18n.ts
grep -q "Hosted Paper Sandbox Tenant Onboarding" frontend/app/i18n.ts
grep -q "HostedPaperSandboxOnboardingPanel" \
  frontend/app/components/HostedPaperSandboxOnboardingPanel.tsx

if rg -n \
  "ENABLE_LIVE_TRADING=true|BROKER_PROVIDER=shioaji|BROKER_PROVIDER=fubon|BROKER_API_KEY=|BROKER_CERTIFICATE=|VERCEL_TOKEN=|VAULT_TOKEN=" \
  docs/hosted-paper-sandbox-tenant-onboarding-readiness.md \
  frontend/app/components/HostedPaperSandboxOnboardingPanel.tsx \
  backend/app/domain/hosted_paper_sandbox_onboarding.py; then
  echo "Unsafe hosted paper sandbox onboarding secret or live config detected." >&2
  exit 1
fi

if rg -n \
  "guaranteed profit|risk-free|保證獲利|零風險|正式交易已就緒" \
  docs/hosted-paper-sandbox-tenant-onboarding-readiness.md \
  frontend/app/components/HostedPaperSandboxOnboardingPanel.tsx; then
  echo "Unsafe hosted paper sandbox onboarding claim detected." >&2
  exit 1
fi

echo "Hosted Paper sandbox tenant onboarding readiness OK. Live trading remains disabled by default."
