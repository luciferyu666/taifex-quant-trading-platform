#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "docs/hosted-web-command-center.md"
  "backend/app/domain/hosted_web_command_center.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_web_command_center_routes.py"
  "frontend/app/apiBase.ts"
  "frontend/app/components/HostedWebCommandCenterPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  test -f "${required_file}"
done

grep -q "TRADING_MODE=paper" .env.example
grep -q "ENABLE_LIVE_TRADING=false" .env.example
grep -q "BROKER_PROVIDER=paper" .env.example
grep -q "NEXT_PUBLIC_COMMAND_CENTER_API_MODE=local" .env.example
grep -q "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" .env.example
grep -q "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL=" .env.example

grep -q "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL" frontend/app/apiBase.ts
grep -q "NEXT_PUBLIC_BACKEND_URL" frontend/app/apiBase.ts
grep -q "NEXT_PUBLIC_COMMAND_CENTER_API_MODE" frontend/app/apiBase.ts
grep -q "http://localhost:8000" frontend/app/apiBase.ts
grep -q "HostedWebCommandCenterPanel" frontend/app/page.tsx
grep -q "/api/hosted-paper/web-command-center/readiness" frontend/app/page.tsx
grep -q "/web-command-center/readiness" backend/app/api/hosted_paper_routes.py
grep -q "environment_aware_connection_contract_only" backend/app/domain/hosted_web_command_center.py
grep -q "secrets_allowed_in_public_env: bool = False" backend/app/domain/hosted_web_command_center.py
grep -q "broker_credentials_allowed_in_public_env: bool = False" backend/app/domain/hosted_web_command_center.py
grep -q "real_login_enabled: bool = False" backend/app/domain/hosted_web_command_center.py
grep -q "hosted_mutations_enabled: bool = False" backend/app/domain/hosted_web_command_center.py
grep -q "managed_datastore_enabled: bool = False" backend/app/domain/hosted_web_command_center.py
grep -q "Live trading remains disabled by default" docs/hosted-web-command-center.md

if rg -n \
  "^(NEXT_PUBLIC_.*(SECRET|TOKEN|KEY|CERTIFICATE|ACCOUNT_ID|PASSWORD)|API_KEY=.*|BROKER_.*=.*live|ENABLE_LIVE_TRADING=true)" \
  .env.example; then
  echo "Unsafe hosted Web Command Center public env or live-trading config detected." >&2
  exit 1
fi

if rg -n \
  "NEXT_PUBLIC_.*(SECRET|TOKEN|KEY|CERTIFICATE|ACCOUNT_ID|PASSWORD)" \
  frontend/app docs/hosted-web-command-center.md; then
  echo "Unsafe hosted Web Command Center public env or live-trading config detected." >&2
  exit 1
fi

if rg -n \
  "guaranteed profit|risk-free|保證獲利|零風險|production trading ready|正式交易已就緒" \
  docs/hosted-web-command-center.md frontend/app/components/HostedWebCommandCenterPanel.tsx; then
  echo "Unsafe hosted Web Command Center claim detected." >&2
  exit 1
fi

echo "Hosted Web Command Center readiness OK. Live trading remains disabled by default."
