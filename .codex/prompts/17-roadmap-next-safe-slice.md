# Next Safe Roadmap Slice

Read `AGENTS.md` and `docs/implementation-roadmap.md` first. Inspect the repository before editing.

Select the next smallest paper-only vertical slice from the Phase 0-6 roadmap. State the selected phase, objective, files to touch, expected tests, and safety constraints before editing.

Rules:
- Do not enable live trading.
- Do not add real broker order submission.
- Do not add secrets.
- Keep strategies signal-only.
- Keep Risk Engine and OMS in the execution path.
- Run `make check`.

Finish by reporting files changed, checks passed, blockers, and the exact next command.
