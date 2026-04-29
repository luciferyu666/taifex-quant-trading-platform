# Data Quality Report Artifacts

This directory is reserved for local Phase 2 data quality report outputs.

Generated reports are intentionally ignored by git. Keep only this README and `.gitkeep`
under version control so local validation can write artifacts without committing bulky or
environment-specific files.

Example:

```bash
backend/.venv/bin/python data-pipeline/validation/validate_market_bar_fixtures.py \
  --input data-pipeline/fixtures/market_bars_valid.csv \
  --expect-pass \
  --output data-pipeline/reports/market_bars_valid.report.json
```

Dry-run persistence:

```bash
backend/.venv/bin/python data-pipeline/validation/persist_quality_report.py \
  --input data-pipeline/reports/*.json
```

Apply persistence only with explicit intent:

```bash
DATABASE_URL="postgresql://tqtp:tqtp@localhost:5432/tqtp" \
backend/.venv/bin/python data-pipeline/validation/persist_quality_report.py \
  --input data-pipeline/reports/*.json \
  --apply
```

Safety boundaries:

- Do not place broker credentials or secrets in reports.
- Do not download market data as part of fixture validation.
- Do not treat adjusted continuous futures as execution prices.
- Do not commit generated report JSON files.
- Do not write reports to a database without explicit `--apply`.

Research Review Packet sample:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/export_sample_research_review_packet.py
```

Explicit local output for manual Web Command Center loader testing:

```bash
PYTHONPATH=strategy-engine backend/.venv/bin/python \
  strategy-engine/sdk/examples/export_sample_research_review_packet.py \
  --output data-pipeline/reports/research_review_packet.sample.json
```

The sample is local metadata only. It is ignored by git, is never uploaded by the
frontend JSON loader, and keeps `approval_for_live=false`,
`approval_for_paper_execution=false`, `execution_eligible=false`, and
`persisted=false`.

Paper demo evidence export:

```bash
backend/.venv/bin/python scripts/export-paper-demo-evidence.py \
  --output data-pipeline/reports/paper_demo_evidence.preview.json
```

Markdown output is also supported with explicit intent:

```bash
backend/.venv/bin/python scripts/export-paper-demo-evidence.py \
  --format markdown \
  --output data-pipeline/reports/paper_demo_evidence.preview.md
```

Paper demo evidence files are local handoff artifacts only. They are ignored by
git, are not uploaded, and must not include secrets, broker credentials, real
account identifiers, or customer financial data.
