#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

STRICT="${RELEASE_READINESS_STRICT:-0}"
status_output="$(git status --porcelain=v1)"
dirty_count=0
tracked_dirty_count=0
untracked_count=0

if [[ -n "${status_output}" ]]; then
  dirty_count="$(printf '%s\n' "${status_output}" | sed '/^$/d' | wc -l | tr -d ' ')"
  tracked_dirty_count="$(printf '%s\n' "${status_output}" | grep -vc '^??' || true)"
  untracked_count="$(printf '%s\n' "${status_output}" | grep -c '^??' || true)"
fi

printf 'Taifex Quant Trading Platform release readiness audit\n'
printf '\n'
printf 'Git context:\n'
printf '  branch: %s\n' "$(git branch --show-current 2>/dev/null || printf 'unknown')"
printf '  commit: %s\n' "$(git rev-parse --short HEAD 2>/dev/null || printf 'unknown')"
printf '  dirty entries: %s tracked=%s untracked=%s\n' "${dirty_count}" "${tracked_dirty_count}" "${untracked_count}"
printf '\n'

printf 'Release level:\n'
printf '  Marketing Website: external presentation candidate after website checks pass\n'
printf '  Web Command Center: internal demo candidate\n'
printf '  Paper Research Preview: internal technical preview\n'
printf '  Production Trading Platform: NOT READY\n'
printf '\n'

printf 'Checking safety defaults...\n'
missing_safety=0
for required_line in \
  'TRADING_MODE=paper' \
  'ENABLE_LIVE_TRADING=false' \
  'BROKER_PROVIDER=paper'; do
  if grep -Fxq "${required_line}" .env.example; then
    printf '  safe     %s\n' "${required_line}"
  else
    printf '  missing  %s\n' "${required_line}" >&2
    missing_safety=1
  fi
done

if [[ -f .env ]] && grep -Eiq '^ENABLE_LIVE_TRADING=(true|1|yes)$' .env; then
  printf '  unsafe   .env enables live trading\n' >&2
  missing_safety=1
fi

if [[ "${missing_safety}" -ne 0 ]]; then
  printf 'Release readiness failed: unsafe safety defaults.\n' >&2
  exit 1
fi

printf '\n'
printf 'Checking release-readiness artifacts...\n'
missing_file=0
for required_file in \
  docs/release-readiness-audit.md \
  docs/website-conversion-qa.md \
  docs/implementation-roadmap.md \
  docs/trading-safety.md \
  docs/paper-shadow-live-boundary.md \
  scripts/release-readiness-check.sh \
  scripts/check.sh \
  Makefile; do
  if [[ -f "${required_file}" ]]; then
    printf '  present  %s\n' "${required_file}"
  else
    printf '  missing  %s\n' "${required_file}" >&2
    missing_file=1
  fi
done

if [[ "${missing_file}" -ne 0 ]]; then
  printf 'Release readiness failed: required readiness artifacts are missing.\n' >&2
  exit 1
fi

printf '\n'
printf 'Git hygiene checks:\n'
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  printf '  unsafe   .env is tracked by git\n' >&2
  exit 1
else
  printf '  safe     .env is not tracked\n'
fi

for ignored_path in \
  backend/.venv \
  frontend/node_modules \
  website/node_modules \
  frontend/.next \
  website/dist \
  logs; do
  if git ls-files "${ignored_path}" | grep -q .; then
    printf '  review   tracked local/generated path: %s\n' "${ignored_path}" >&2
  else
    printf '  safe     not tracked: %s\n' "${ignored_path}"
  fi
done

printf '\n'
if [[ -z "${status_output}" ]]; then
  printf 'Worktree status: clean\n'
  printf 'Release candidate gate: PASS for worktree cleanliness\n'
else
  printf 'Worktree status: dirty\n'
  printf 'Release candidate gate: NOT READY until intended files are committed on a release branch\n'
  printf '\n'
  printf 'Tracked modified/staged files:\n'
  printf '%s\n' "${status_output}" | grep -v '^??' | sed 's/^/  /' || printf '  none\n'
  printf '\n'
  printf 'Untracked files/directories:\n'
  printf '%s\n' "${status_output}" | grep '^??' | sed 's/^/  /' || printf '  none\n'
  printf '\n'
  printf 'Recommended next commit inclusion set:\n'
  printf '  include  backend Phase 2/3/5 paper-only API/domain/test scaffolding\n'
  printf '  include  data-pipeline fixtures, schemas, dry-run validators, docs\n'
  printf '  include  strategy-engine SDK dry-run contracts and examples\n'
  printf '  include  frontend read-only Command Center packet viewer and fixtures\n'
  printf '  include  docs, scripts, Makefile targets needed by make check\n'
  printf '  review   Documentation/*.md before committing proprietary source briefs\n'
  printf '  exclude  .env, node_modules, venvs, build outputs, logs, generated report JSON, secrets\n'
fi

printf '\n'
printf 'Clean verification command after committing intended release scope:\n'
printf '  bash scripts/bootstrap.sh && make check\n'
printf '\n'
printf 'Audit summary: live trading remains disabled by default.\n'

if [[ "${STRICT}" == "1" && -n "${status_output}" ]]; then
  printf 'Strict release readiness failed: worktree is dirty.\n' >&2
  exit 1
fi
