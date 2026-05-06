#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

required_files=(
  "docs/facebook-community-launch-plan.md"
  "docs/facebook-content-calendar.md"
  "docs/facebook-human-launch-runbook.md"
  "docs/facebook-growth-ops-strategy.md"
  "docs/facebook-daily-publishing-sop.md"
  "docs/facebook-content-pillars.md"
  "docs/facebook-30-day-content-queue.md"
  "docs/facebook-daily-post-template.md"
  "docs/facebook-growth-loop-playbook.md"
  "docs/facebook-posting-compliance-checklist.md"
  "docs/facebook-performance-tracking.md"
  "docs/facebook-operator-quickstart.md"
  "data/social/facebook-post-queue.csv"
  "data/social/facebook-published-log.csv"
  "scripts/social/generate_daily_facebook_pack.py"
  "scripts/social/generate_4_post_facebook_pack.py"
  "scripts/social/open_facebook_workspace.sh"
  "scripts/social/social_content_guard.py"
  "scripts/social-growth-status.sh"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${file}" ]]; then
    printf 'Missing required Facebook growth file: %s\n' "${file}" >&2
    exit 1
  fi
done

grep -Fxq 'TRADING_MODE=paper' .env.example
grep -Fxq 'ENABLE_LIVE_TRADING=false' .env.example
grep -Fxq 'BROKER_PROVIDER=paper' .env.example

python3 scripts/social/social_content_guard.py
python3 scripts/social/generate_daily_facebook_pack.py >/dev/null
python3 scripts/social/generate_4_post_facebook_pack.py >/dev/null

printf 'Facebook growth operations safety check passed.\n'
printf 'Safety defaults: TRADING_MODE=paper, ENABLE_LIVE_TRADING=false, BROKER_PROVIDER=paper.\n'
printf 'Manual review and publishing only. Do not auto-post to Facebook.\n'
