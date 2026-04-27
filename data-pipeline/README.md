# Data Pipeline

Purpose: hold future market data ingestion, validation, session alignment, and dataset versioning work.

Planned responsibilities:

- Bronze raw ingestion from Taifex and broker payloads.
- Silver cleaned time-series data.
- Gold feature and analytics datasets.
- Data quality gates for invalid prices, missing bars, and session alignment.

## Phase 2 Executable Scaffold

The current scaffold defines safe SQL schemas plus a single idempotent migration. It does not
download market data, call broker APIs, or require external credentials.

- `schemas/contract_master.sql`: TX/MTX/TMF contract metadata and point values.
- `schemas/market_bars.sql`: cleaned bar storage with real contract symbols and a separate
  research continuous series table.
- `schemas/rollover_events.sql`: continuous futures rollover and adjustment metadata.
- `schemas/data_quality_checks.sql`: data quality report structure.
- `schemas/data_versions.sql`: data version registry and migration status tracking.
- `migrations/001_phase_2_data_platform.sql`: executable PostgreSQL-compatible migration.
- `fixtures/market_bars_valid.csv`: local valid CSV fixture.
- `fixtures/market_bars_invalid.csv`: local invalid CSV fixture used to verify diagnostics.
- `fixtures/rollover_events_valid.csv`: local valid rollover metadata fixture.
- `fixtures/rollover_events_invalid.csv`: local invalid rollover metadata fixture.
- `validation/validate_market_bar_fixtures.py`: deterministic local fixture validation script.
- `validation/validate_rollover_event_fixtures.py`: deterministic rollover fixture validation.
- `validation/preview_continuous_futures.py`: dry-run research-only continuous futures preview.
- `validation/build_feature_manifest.py`: dry-run feature dataset manifest builder.
- `validation/persist_quality_report.py`: dry-run default report persistence script.
- `validation/register_data_version.py`: dry-run default data version registration script.
- `migrations/apply_local_migrations.py`: dry-run default migration apply script.
- `migrations/verify_local_data_platform.py`: dry-run default schema verification script.
- `reports/`: local JSON report output directory; generated reports are ignored by git.
- `phase-2-plan.md`: Bronze/Silver/Gold data layer plan.

Real contract prices are reserved for paper/live order simulation. Back-adjusted and ratio-adjusted continuous contracts are reserved for research and backtesting.

Apply the migration manually against a local PostgreSQL-compatible database:

```bash
psql "$DATABASE_URL" -f data-pipeline/migrations/001_phase_2_data_platform.sql
```

The backend also exposes paper-safe metadata and validation endpoints under `/api/data/*`.

Validate the local fixtures without downloading external data:

```bash
make data-fixtures-check
make rollover-fixtures-check
```

Write a local JSON report artifact:

```bash
backend/.venv/bin/python data-pipeline/validation/validate_market_bar_fixtures.py \
  --input data-pipeline/fixtures/market_bars_valid.csv \
  --expect-pass \
  --output data-pipeline/reports/market_bars_valid.report.json
```

Validate rollover event fixture metadata:

```bash
backend/.venv/bin/python data-pipeline/validation/validate_rollover_event_fixtures.py
```

Rollover fixtures enforce supported TX/MTX/TMF roots, distinct contract months,
parseable timestamps, allowed adjustment methods, research-only scope, and explicit
`data_version` binding. They do not generate continuous futures or tradable prices.

Preview research-only continuous futures from local fixtures:

```bash
make continuous-futures-preview
```

The preview can write an optional JSON artifact, but generated files under
`data-pipeline/reports/*.json` remain ignored by git:

```bash
backend/.venv/bin/python data-pipeline/validation/preview_continuous_futures.py \
  --adjustment-method ratio_adjusted \
  --output data-pipeline/reports/continuous_futures_preview.report.json
```

Continuous futures preview output is always marked `research_only=true` and
`execution_eligible=false`.

Build the Phase 2 feature dataset manifest for Phase 3 handoff:

```bash
make feature-manifest-preview
```

The manifest records source file checksums, continuous futures settings, feature metadata,
and a reproducibility hash. It is not a trading signal, not a backtest result, and never
execution-eligible.

Optional JSON output remains local and ignored by git:

```bash
backend/.venv/bin/python data-pipeline/validation/build_feature_manifest.py \
  --output data-pipeline/reports/feature_manifest.report.json
```

Dry-run report persistence without database writes:

```bash
make data-quality-reports-dry-run
```

Persist report rows only after explicitly applying with a database URL:

```bash
DATABASE_URL="postgresql://tqtp:tqtp@localhost:5432/tqtp" \
backend/.venv/bin/python data-pipeline/validation/persist_quality_report.py \
  --input data-pipeline/reports/*.json \
  --apply
```

The persistence script validates the artifact schema and refuses unsafe reports that indicate
external data download or broker API usage.

Register a data version without touching PostgreSQL:

```bash
make data-version-register-dry-run
```

Register a data version only after explicitly applying with a database URL:

```bash
DATABASE_URL="postgresql://tqtp:tqtp@localhost:5432/tqtp" \
backend/.venv/bin/python data-pipeline/validation/register_data_version.py \
  --version-id local-fixture-v1 \
  --data-quality-report data-pipeline/reports/market_bars_valid.report.json \
  --status validated \
  --apply
```

`register_data_version.py` validates optional quality report artifacts and stores only a
repository-relative path plus checksum. It does not store large report payloads.

List local migrations without touching PostgreSQL:

```bash
make data-migrations-dry-run
```

Apply local migrations only with explicit intent:

```bash
DATABASE_URL="postgresql://tqtp:tqtp@localhost:5432/tqtp" \
backend/.venv/bin/python data-pipeline/migrations/apply_local_migrations.py --apply
```

Applied migration files are tracked in `data_migration_runs` by file name and checksum.

Dry-run schema verification without touching PostgreSQL:

```bash
make data-platform-verify
```

Verify the local database after applying migrations:

```bash
DATABASE_URL="postgresql://tqtp:tqtp@localhost:5432/tqtp" \
backend/.venv/bin/python data-pipeline/migrations/verify_local_data_platform.py
```
