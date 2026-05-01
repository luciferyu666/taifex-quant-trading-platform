#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

MODE="run"
SEED_DEMO=1
RUNTIME_DIR="${PAPER_DEMO_RUNTIME_DIR:-${REPO_ROOT}/.tmp/self-service-paper-demo}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

usage() {
  cat <<'EOF'
Usage:
  scripts/launch-self-service-paper-demo.sh [options]

Options:
  --check-only           Validate prerequisites and safety defaults only.
  --seed-only            Create the local SQLite demo record and exit.
  --no-seed              Start local services without seeding a demo record.
  --runtime-dir PATH     Runtime directory for logs and local SQLite.
  --backend-port PORT    Local FastAPI port. Default: 8000.
  --frontend-port PORT   Local Next.js port. Default: 3000.
  -h, --help             Show this help.

This launcher is Paper Only. It starts local services only, uses local SQLite,
does not call brokers, does not collect credentials, and does not enable live
trading.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check-only)
      MODE="check"
      shift
      ;;
    --seed-only)
      MODE="seed"
      shift
      ;;
    --no-seed)
      SEED_DEMO=0
      shift
      ;;
    --runtime-dir)
      RUNTIME_DIR="$2"
      shift 2
      ;;
    --backend-port)
      BACKEND_PORT="$2"
      shift 2
      ;;
    --frontend-port)
      FRONTEND_PORT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

BACKEND_PYTHON="${REPO_ROOT}/backend/.venv/bin/python"
FRONTEND_PACKAGE="${REPO_ROOT}/frontend/package.json"
BACKEND_LOG="${RUNTIME_DIR}/logs/backend.log"
FRONTEND_LOG="${RUNTIME_DIR}/logs/frontend.log"
DB_PATH="${PAPER_EXECUTION_AUDIT_DB_PATH:-${RUNTIME_DIR}/paper_execution_audit.sqlite}"

BACKEND_PID=""
FRONTEND_PID=""

fail() {
  printf 'Self-service paper demo launcher error: %s\n' "$1" >&2
  exit 1
}

require_file() {
  [[ -f "$1" ]] || fail "missing required file: $1"
}

validate_integer_port() {
  local label="$1"
  local value="$2"
  if ! [[ "${value}" =~ ^[0-9]+$ ]] || [[ "${value}" -lt 1 ]] || [[ "${value}" -gt 65535 ]]; then
    fail "${label} must be a TCP port from 1 to 65535"
  fi
}

validate_port_available() {
  local port="$1"
  "${BACKEND_PYTHON}" - "$port" <<'PY'
import socket
import sys

port = int(sys.argv[1])
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(("127.0.0.1", port))
    except OSError:
        raise SystemExit(1)
PY
}

validate_safety() {
  cd "${REPO_ROOT}"
  require_file ".env.example"
  grep -Fxq 'TRADING_MODE=paper' .env.example || fail ".env.example must contain TRADING_MODE=paper"
  grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example || fail ".env.example must contain ENABLE_LIVE_TRADING=false"
  grep -Fxq 'BROKER_PROVIDER=paper' .env.example || fail ".env.example must contain BROKER_PROVIDER=paper"

  if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
    fail "unsafe local config: ENABLE_LIVE_TRADING is enabled in .env"
  fi
}

validate_prerequisites() {
  require_file "${BACKEND_PYTHON}"
  require_file "${FRONTEND_PACKAGE}"
  require_file "${REPO_ROOT}/scripts/seed-paper-execution-demo.py"
  command -v npm >/dev/null 2>&1 || fail "npm is required for the local frontend"
  command -v curl >/dev/null 2>&1 || fail "curl is required for readiness checks"
  validate_integer_port "BACKEND_PORT" "${BACKEND_PORT}"
  validate_integer_port "FRONTEND_PORT" "${FRONTEND_PORT}"
  if [[ "${BACKEND_PORT}" == "${FRONTEND_PORT}" ]]; then
    fail "backend and frontend ports must be different"
  fi
  if [[ "${MODE}" == "run" ]]; then
    validate_port_available "${BACKEND_PORT}" || fail "backend port ${BACKEND_PORT} is already in use"
    validate_port_available "${FRONTEND_PORT}" || fail "frontend port ${FRONTEND_PORT} is already in use"
  fi
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local started_at
  started_at="$(date +%s)"
  while (( "$(date +%s)" - started_at < 120 )); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      printf '%s ready: %s\n' "${label}" "${url}"
      return 0
    fi
    sleep 1
  done
  fail "${label} did not become ready: ${url}"
}

cleanup() {
  local exit_code=$?
  if [[ -n "${FRONTEND_PID}" ]] && kill -0 "${FRONTEND_PID}" >/dev/null 2>&1; then
    kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" >/dev/null 2>&1; then
    kill "${BACKEND_PID}" >/dev/null 2>&1 || true
  fi
  exit "${exit_code}"
}

seed_demo_record() {
  mkdir -p "$(dirname "${DB_PATH}")"
  printf 'Seeding Paper Only demo record into local SQLite:\n  %s\n' "${DB_PATH}"
  (
    cd "${REPO_ROOT}"
    env \
      APP_ENV=development \
      TRADING_MODE=paper \
      ENABLE_LIVE_TRADING=false \
      BROKER_PROVIDER=paper \
      PAPER_EXECUTION_AUDIT_DB_PATH="${DB_PATH}" \
      "${BACKEND_PYTHON}" scripts/seed-paper-execution-demo.py
  )
}

start_backend() {
  mkdir -p "$(dirname "${BACKEND_LOG}")"
  printf 'Starting local FastAPI backend on http://127.0.0.1:%s\n' "${BACKEND_PORT}"
  (
    cd "${REPO_ROOT}/backend"
    env \
      APP_ENV=development \
      TRADING_MODE=paper \
      ENABLE_LIVE_TRADING=false \
      BROKER_PROVIDER=paper \
      BACKEND_HOST=127.0.0.1 \
      BACKEND_PORT="${BACKEND_PORT}" \
      PAPER_EXECUTION_AUDIT_DB_PATH="${DB_PATH}" \
      "${BACKEND_PYTHON}" -m uvicorn app.main:app --host 127.0.0.1 --port "${BACKEND_PORT}"
  ) >"${BACKEND_LOG}" 2>&1 &
  BACKEND_PID="$!"
}

start_frontend() {
  mkdir -p "$(dirname "${FRONTEND_LOG}")"
  printf 'Starting local Next.js frontend on http://127.0.0.1:%s\n' "${FRONTEND_PORT}"
  (
    cd "${REPO_ROOT}/frontend"
    env \
      NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:${BACKEND_PORT}" \
      npm run dev -- --hostname 127.0.0.1 --port "${FRONTEND_PORT}"
  ) >"${FRONTEND_LOG}" 2>&1 &
  FRONTEND_PID="$!"
}

validate_safety
validate_prerequisites

if [[ "${MODE}" == "check" ]]; then
  printf 'Self-service paper demo launcher check passed.\n'
  printf 'Backend port: %s\n' "${BACKEND_PORT}"
  printf 'Frontend port: %s\n' "${FRONTEND_PORT}"
  printf 'Runtime dir: %s\n' "${RUNTIME_DIR}"
  printf 'Local SQLite path: %s\n' "${DB_PATH}"
  printf 'Production Vercel direct SQLite access remains false.\n'
  printf 'Live trading remains disabled by default.\n'
  exit 0
fi

mkdir -p "${RUNTIME_DIR}/logs"

if [[ "${MODE}" == "seed" ]]; then
  seed_demo_record
  printf 'Seed complete. No backend, frontend, broker, or live trading path was started.\n'
  exit 0
fi

if [[ "${SEED_DEMO}" -eq 1 ]]; then
  seed_demo_record
fi

trap cleanup INT TERM EXIT
start_backend
start_frontend

wait_for_http "http://127.0.0.1:${BACKEND_PORT}/health" "Backend"
wait_for_http "http://127.0.0.1:${FRONTEND_PORT}/?lang=zh" "Frontend"

cat <<EOF

Customer self-service local paper demo is ready.

Open:
  http://127.0.0.1:${FRONTEND_PORT}/?lang=zh
  http://127.0.0.1:${FRONTEND_PORT}/?lang=en

Local backend:
  http://127.0.0.1:${BACKEND_PORT}

Local SQLite:
  ${DB_PATH}

Logs:
  ${BACKEND_LOG}
  ${FRONTEND_LOG}

Safety:
  TRADING_MODE=paper
  ENABLE_LIVE_TRADING=false
  BROKER_PROVIDER=paper
  Production Vercel direct SQLite access=false

Press Ctrl-C to stop the local backend and frontend.
EOF

wait -n "${BACKEND_PID}" "${FRONTEND_PID}"
