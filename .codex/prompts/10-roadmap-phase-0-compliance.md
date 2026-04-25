# Phase 0 Compliance Boundary

Read `AGENTS.md` and `docs/implementation-roadmap.md` first. Inspect the repository before editing.

Implement only Phase 0 or the smallest safe Phase 0 slice:
- paper-first safety policy
- role and authorization boundary notes
- paper/shadow/live boundary documentation
- no-live-trading baseline checks

Do not enable live trading. Do not add broker credentials, account IDs, certificates, tokens, or secrets. Do not add broker SDK calls.

Run `make check` before finishing. Report files changed, checks passed, blockers, and the exact next command.
