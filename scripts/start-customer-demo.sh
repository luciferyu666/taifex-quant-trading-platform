#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

cat <<'EOF'
Customer Self-Service Demo Launcher

Scope:
- Paper Only
- local backend + local frontend
- local SQLite paper demo records
- no broker call
- no external database
- no credential collection
- Production Trading Platform remains NOT READY
EOF

bash scripts/check-customer-demo-env.sh
exec bash scripts/launch-self-service-paper-demo.sh "$@"
