#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "docs/hosted-paper-security-operations-readiness.md"
  "backend/app/domain/hosted_paper_security_operations.py"
  "backend/app/api/hosted_paper_routes.py"
  "backend/tests/test_hosted_paper_security_operations_routes.py"
  "frontend/app/components/HostedPaperSecurityOperationsPanel.tsx"
)

for required_file in "${required_files[@]}"; do
  test -f "${required_file}"
done

grep -q "TRADING_MODE=paper" .env.example
grep -q "ENABLE_LIVE_TRADING=false" .env.example
grep -q "BROKER_PROVIDER=paper" .env.example

grep -q "GET /api/hosted-paper/security-operations/readiness" \
  docs/hosted-paper-security-operations-readiness.md
grep -q "/security-operations/readiness" backend/app/api/hosted_paper_routes.py
grep -q "HostedPaperSecurityOperationsReadinessResponse" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "readiness_contract_only_not_operational" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "secrets_management_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "rate_limiting_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "audit_monitoring_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "observability_pipeline_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "staging_smoke_gate_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "load_test_gate_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "abuse_test_gate_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py
grep -q "auth_boundary_test_gate_enabled: bool = False" \
  backend/app/domain/hosted_paper_security_operations.py

grep -q "HostedPaperSecurityOperationsPanel" frontend/app/page.tsx
grep -q "/api/hosted-paper/security-operations/readiness" frontend/app/page.tsx
grep -q "hostedPaperSecurityOperations" frontend/app/i18n.ts
grep -q "Hosted Paper security operations readiness" frontend/app/i18n.ts
grep -q "Hosted Paper security operations 就緒狀態" frontend/app/i18n.ts

if rg -n \
  "ENABLE_LIVE_TRADING=true|BROKER_PROVIDER=shioaji|BROKER_PROVIDER=fubon|BROKER_API_KEY=|BROKER_CERTIFICATE=|VERCEL_TOKEN=|VAULT_TOKEN=" \
  docs/hosted-paper-security-operations-readiness.md \
  frontend/app/components/HostedPaperSecurityOperationsPanel.tsx \
  backend/app/domain/hosted_paper_security_operations.py; then
  echo "Unsafe hosted paper security operations secret or live config detected." >&2
  exit 1
fi

if rg -n \
  "guaranteed profit|risk-free|保證獲利|零風險|production trading ready|正式交易已就緒" \
  docs/hosted-paper-security-operations-readiness.md \
  frontend/app/components/HostedPaperSecurityOperationsPanel.tsx; then
  echo "Unsafe hosted paper security operations claim detected." >&2
  exit 1
fi

echo "Hosted Paper security operations readiness OK. Live trading remains disabled by default."
