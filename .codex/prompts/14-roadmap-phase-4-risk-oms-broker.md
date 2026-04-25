# Phase 4 Risk, OMS, and Paper Broker

Read `AGENTS.md` and `docs/implementation-roadmap.md` first. Inspect the repository before editing.

Implement only Phase 4 or the smallest safe execution-core slice:
- TX/MTX/TMF allocator
- Risk Engine checks
- OMS event-style state transitions
- paper broker gateway acknowledgements
- backend tests for paper-only APIs

Do not implement real broker order submission. Do not add broker credentials. Do not bypass Risk Engine or OMS. Do not enable live trading.

Run `make check` before finishing. Report files changed, checks passed, blockers, and the exact next command.
