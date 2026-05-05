#!/usr/bin/env bash
set -euo pipefail

# Manual review and publishing only.
# This script only opens or prints URLs. It does not log in, click, submit,
# scrape, automate a browser, or publish anything to Facebook.

urls=(
  "https://www.facebook.com/profile.php?id=61589020471520"
  "https://www.facebook.com/groups/1323940496297459"
  "https://taifex-quant-trading-platform-front.vercel.app/?lang=zh"
  "https://taifex-quant-trading-platform-website-7rf8yy2zd.vercel.app/zh/"
)

if command -v xdg-open >/dev/null 2>&1; then
  for url in "${urls[@]}"; do
    xdg-open "${url}" >/dev/null 2>&1 || printf '%s\n' "${url}"
  done
else
  printf 'Open these URLs manually:\n'
  for url in "${urls[@]}"; do
    printf '%s\n' "${url}"
  done
fi

printf 'Manual review and publishing only. Do not auto-post to Facebook.\n'
