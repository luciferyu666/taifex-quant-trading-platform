#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

if [[ ! -f website/package.json ]]; then
  printf 'website/package.json is missing. Cannot deploy website.\n' >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'npm is not available. Install Node.js 22.12.0 or newer.\n' >&2
  exit 1
fi

if [[ ! -d website/node_modules ]]; then
  printf 'Installing website dependencies...\n'
  (cd website && npm install)
fi

printf 'Building website before deployment...\n'
(cd website && npm run build)

if ! command -v vercel >/dev/null 2>&1; then
  printf 'Vercel CLI is not installed. Install it with: npm i -g vercel\n' >&2
  exit 1
fi

printf 'Using Vercel CLI: '
vercel --version
vercel --prod
