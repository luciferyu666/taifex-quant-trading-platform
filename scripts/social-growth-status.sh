#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

printf 'Facebook Page: %s\n' 'https://www.facebook.com/profile.php?id=61589020471520'
printf 'Facebook Group: %s\n' 'https://www.facebook.com/groups/1323940496297459'
printf 'Web App: %s\n' 'https://taifex-quant-trading-platform-front.vercel.app/?lang=zh'
printf 'Website: %s\n' 'https://taifex-quant-trading-platform-website-7rf8yy2zd.vercel.app/zh/'
printf '\nRequired docs:\n'

required_docs=(
  docs/facebook-growth-ops-strategy.md
  docs/facebook-daily-publishing-sop.md
  docs/facebook-content-pillars.md
  docs/facebook-30-day-content-queue.md
  docs/facebook-daily-post-template.md
  docs/facebook-growth-loop-playbook.md
  docs/facebook-posting-compliance-checklist.md
  docs/facebook-performance-tracking.md
  docs/facebook-operator-quickstart.md
)

for file in "${required_docs[@]}"; do
  if [[ -f "${file}" ]]; then
    printf '  present: %s\n' "${file}"
  else
    printf '  missing: %s\n' "${file}"
  fi
done

if [[ -f data/social/facebook-post-queue.csv ]]; then
  rows="$(python3 - <<'PY'
import csv
with open("data/social/facebook-post-queue.csv", newline="", encoding="utf-8") as handle:
    print(sum(1 for _ in csv.DictReader(handle)))
PY
)"
  printf '\nContent queue rows: %s\n' "${rows}"
else
  printf '\nContent queue missing.\n'
fi

if [[ -f data/social/facebook-published-log.csv ]]; then
  printf 'Published log: present\n'
else
  printf 'Published log: missing\n'
fi

printf '\nSafety defaults:\n'
grep -E '^(TRADING_MODE|ENABLE_LIVE_TRADING|BROKER_PROVIDER)=' .env.example || true

printf '\nNext recommended command: make social-daily-pack\n'
