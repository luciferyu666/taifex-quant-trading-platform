#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"
BACKEND_PYTHON="${REPO_ROOT}/backend/.venv/bin/python"

printf 'Checking local safety defaults...\n'
if ! grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example; then
  printf '.env.example must contain ENABLE_LIVE_TRADING=false.\n' >&2
  exit 1
fi

if ! grep -Fxq 'TRADING_MODE=paper' .env.example; then
  printf '.env.example must contain TRADING_MODE=paper.\n' >&2
  exit 1
fi

if ! grep -Fxq 'BROKER_PROVIDER=paper' .env.example; then
  printf '.env.example must contain BROKER_PROVIDER=paper.\n' >&2
  exit 1
fi

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env.\n' >&2
  exit 1
fi

if [[ -x "${BACKEND_PYTHON}" ]]; then
  printf 'Checking backend syntax...\n'
  "${BACKEND_PYTHON}" -m compileall -q backend/app backend/tests

  if "${BACKEND_PYTHON}" -m ruff --version >/dev/null 2>&1; then
    printf 'Running backend Ruff checks...\n'
    "${BACKEND_PYTHON}" -m ruff check backend
  else
    printf 'backend ruff is not installed; skipping Ruff checks.\n' >&2
  fi

  if "${BACKEND_PYTHON}" -m pytest --version >/dev/null 2>&1; then
    printf 'Running backend tests...\n'
    (cd backend && .venv/bin/python -m pytest)
  else
    printf 'backend pytest is not installed; skipping backend tests.\n' >&2
  fi
else
  printf 'backend/.venv/bin/python is missing; skipping backend runtime checks. Run bash scripts/bootstrap.sh.\n' >&2
fi

if command -v npm >/dev/null 2>&1; then
  if [[ -d frontend/node_modules ]]; then
    printf 'Running frontend typecheck...\n'
    (cd frontend && npm run typecheck)

    printf 'Running frontend build...\n'
    (cd frontend && npm run build)
  else
    printf 'frontend/node_modules is missing; skipping frontend checks. Run bash scripts/bootstrap.sh.\n' >&2
  fi
else
  printf 'npm is not available; skipping frontend checks.\n' >&2
fi

printf 'Checking website skeleton files...\n'
missing_website_file=0
for required_file in \
  website/package.json \
  website/tsconfig.json \
  website/astro.config.mjs \
  website/vercel.json \
  website/src/pages/index.astro \
  website/src/styles/global.css; do
  if [[ ! -f "${required_file}" ]]; then
    printf 'Missing required website file: %s\n' "${required_file}" >&2
    missing_website_file=1
  fi
done

if [[ "${missing_website_file}" -ne 0 ]]; then
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  if [[ -d website/node_modules ]]; then
    printf 'Running website Astro check...\n'
    (cd website && npm run check)

    printf 'Running website Astro build...\n'
    (cd website && npm run build)
  else
    printf 'Skipping website Astro build because dependencies are not installed. Run: cd website && npm install\n' >&2
  fi
else
  printf 'npm is not available; skipping website Astro checks.\n' >&2
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  printf 'Validating Docker Compose configuration...\n'
  docker compose config >/dev/null
else
  printf 'Docker Compose is not available; skipping docker compose config.\n' >&2
fi

printf '\nCheck summary: available checks completed with live trading disabled.\n'
