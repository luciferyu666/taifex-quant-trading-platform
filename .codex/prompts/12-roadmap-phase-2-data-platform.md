# Phase 2 Data Platform

Read `AGENTS.md` and `docs/implementation-roadmap.md` first. Inspect the repository before editing.

Implement only Phase 2 or the smallest safe data-platform slice:
- contract master
- market bars schema
- rollover events
- data quality checks
- Bronze/Silver/Gold plan
- backend contract metadata endpoints or tests

Do not download external market data. Do not connect to broker APIs. Do not enable live trading. Real contract prices are for paper/live simulation; adjusted continuous contracts are for research/backtesting only.

Run `make check` before finishing. Report files changed, checks passed, blockers, and the exact next command.
