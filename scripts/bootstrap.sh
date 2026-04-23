#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"
BACKEND_VENV="${REPO_ROOT}/backend/.venv"

if [[ ! -f .env ]]; then
  cp .env.example .env
  printf 'Created .env from .env.example with paper-trading defaults.\n'
else
  printf '.env already exists; leaving it unchanged.\n'
fi

if grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf 'Unsafe local config: ENABLE_LIVE_TRADING is enabled in .env. Refusing bootstrap.\n' >&2
  exit 1
fi

if command -v python3.12 >/dev/null 2>&1; then
  PYTHON_BIN="python3.12"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  printf 'Python is not available. Install Python 3.12 or reopen in the Dev Container.\n' >&2
  exit 1
fi

if [[ ! -d "${BACKEND_VENV}" ]]; then
  "${PYTHON_BIN}" -m venv "${BACKEND_VENV}"
  printf 'Created backend virtual environment at backend/.venv.\n'
else
  printf 'backend/.venv already exists; reusing it.\n'
fi

"${BACKEND_VENV}/bin/python" -m pip install --upgrade pip
"${BACKEND_VENV}/bin/python" -m pip install -e backend

if [[ -f frontend/package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    (cd frontend && npm install)
  else
    printf 'npm is not available; skipping frontend dependency install.\n' >&2
  fi
fi

printf '\nBootstrap complete.\n'
printf 'Next commands:\n'
printf '  make check\n'
printf '  make infra\n'
printf '  make backend\n'
printf '  make frontend\n'
