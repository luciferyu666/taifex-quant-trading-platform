# Codex Prompt: Facebook Growth Operations System

You are working inside VS Code / Codex IDE Extension.

Project:
`taifex-quant-trading-platform`

Task:
Maintain the Facebook high-frequency growth operations system.

Start by reading:
- `AGENTS.md`
- `README.md`
- `docs/facebook-growth-ops-strategy.md`
- `docs/facebook-daily-publishing-sop.md`
- `docs/facebook-content-pillars.md`
- `docs/facebook-30-day-content-queue.md`
- `docs/facebook-daily-post-template.md`
- `docs/facebook-growth-loop-playbook.md`
- `docs/facebook-posting-compliance-checklist.md`
- `docs/facebook-performance-tracking.md`
- `docs/facebook-operator-quickstart.md`
- `data/social/facebook-post-queue.csv`

Rules:
- Do not automate Facebook posting.
- Do not log in to Facebook.
- Do not scrape Facebook.
- Do not ask for or store credentials, cookies, sessions, tokens, API keys, broker account IDs, certificates, or secrets.
- Content generation, queue maintenance, daily packs, UTM links, and manual checklists are allowed.
- Chrome tab opening for manual review is allowed only through `make social-open`; it must not click, submit, scrape, or publish.
- Preserve Paper Only, 不構成投資建議, and `ENABLE_LIVE_TRADING=false`.
- Never promise profit.
- Never offer signals, copy trading, managed accounts, or investment advice.
- Respect third-party group rules.
- Avoid spam and repetitive content.

Useful commands:

```bash
make social-daily-pack
make social-growth-status
make social-content-check
make check
```

When updating the system:
1. Inspect existing files before patching.
2. Update the content queue with distinct, non-repetitive drafts.
3. Generate daily packs only; do not publish.
4. Run `make social-content-check`.
5. Run `make check` when feasible.
6. Report changed files, validation results, and the next manual action for the account owner.

Final reminder:
Facebook publishing is a public external action. The account owner must manually review and publish posts on Facebook. Live trading remains disabled by default.
