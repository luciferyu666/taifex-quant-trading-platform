# Phase 2 Data Platform Plan

## Objective

Build a paper-safe data platform foundation for Taiwan Index Futures research, backtesting, paper trading, and future audited execution.

## Bronze / Silver / Gold Layers

Bronze Raw:
- Immutable raw payloads from future data vendors, Taifex sources, or broker exports.
- S3/MinIO-style object storage is the future target.
- No mutation after ingest.

Silver Clean:
- PostgreSQL/Timescale-compatible cleaned bars and ticks.
- Real contract symbols and contract months remain explicit.
- Data quality reports track missing bars, invalid prices, duplicate timestamps, and session alignment.

Gold Feature:
- ClickHouse-style analytics tables for factors, features, and backtest results.
- Back-adjusted and ratio-adjusted continuous contracts live here for research only.

## Rollover Logic

`rollover_events` records:
- root symbol
- from/to contract month
- rollover timestamp
- spread points
- adjustment method
- data version

Execution simulation must use real contract prices. Continuous adjusted prices must not be treated as tradable prices.

## Validation Criteria

- Contract master includes TX, MTX, and TMF point values.
- Data versions are explicit.
- Quality checks are stored with pass/fail and severity.
- Execution bars reject adjusted continuous prices.
- Rollover adjustment events remain research-only.
- No external market data is downloaded by default.

## Backend Metadata Endpoints

- `GET /api/data/manifest`: Phase 2 data-platform manifest and safety boundaries.
- `GET /api/data/contracts/master`: TX/MTX/TMF contract master records.
- `GET /api/data/layers`: Bronze/Silver/Gold layer plan.
- `GET /api/data/quality/rules`: local data quality rule catalog.
- `POST /api/data/quality/validate-bar`: validate a single local bar payload.
- `POST /api/data/quality/validate-bars`: validate a batch of local bar rows.
- `GET /api/data/rollover/policy`: research-adjusted vs execution-price boundary.

These endpoints do not download data, call broker APIs, or place orders.

## Local CSV Fixture Validation

Phase 2 includes deterministic fixtures for validating the schema and quality rules:

- `data-pipeline/fixtures/market_bars_valid.csv`
- `data-pipeline/fixtures/market_bars_invalid.csv`
- `data-pipeline/fixtures/rollover_events_valid.csv`
- `data-pipeline/fixtures/rollover_events_invalid.csv`
- `data-pipeline/validation/validate_market_bar_fixtures.py`
- `data-pipeline/validation/validate_rollover_event_fixtures.py`
- `data-pipeline/validation/preview_continuous_futures.py`
- `data-pipeline/validation/build_feature_manifest.py`
- `data-pipeline/validation/persist_quality_report.py`
- `data-pipeline/validation/register_data_version.py`
- `data-pipeline/migrations/apply_local_migrations.py`
- `data-pipeline/migrations/verify_local_data_platform.py`
- `data-pipeline/reports/README.md`
- `data-pipeline/reports/.gitkeep`

The invalid fixture is intentional. It verifies that unsupported symbols, invalid OHLC ranges,
adjusted execution prices, and missing data versions are reported as row-level failures.

Rollover event fixtures use the same local-only approach. They verify supported root
symbols, distinct contract months, parseable timestamps, allowed adjustment methods,
`adjustment_method=none` factor consistency, research-only scope, and explicit
`data_version` binding.

The validation script can also write local JSON artifacts:

```bash
backend/.venv/bin/python data-pipeline/validation/validate_market_bar_fixtures.py \
  --input data-pipeline/fixtures/market_bars_valid.csv \
  --expect-pass \
  --output data-pipeline/reports/market_bars_valid.report.json
```

## Continuous Futures Preview

Phase 2 includes a dry-run continuous futures preview for research only:

```bash
make continuous-futures-preview
```

The preview consumes only local market bar and rollover event fixtures. It can produce
back-adjusted or ratio-adjusted research bars, but every response is explicitly marked:

- `research_only=true`
- `execution_eligible=false`
- `external_data_downloaded=false`
- `broker_api_called=false`

If input bars come from the execution price path, the preview returns a warning and keeps
the output research-only. This preview does not create tradable prices, write database
records, or generate orders.

## Feature Dataset Manifest

Phase 2 ends with a dry-run feature dataset manifest:

```bash
make feature-manifest-preview
```

The manifest is a reproducible data product handoff for Phase 3 Strategy SDK and
Backtest Foundation work. It records:

- data version
- contract schema version
- market bar fixture path and checksum
- rollover event fixture path and checksum
- optional quality report path and checksum
- continuous futures preview settings
- feature set name and timeframe
- reproducibility hash

The manifest is not a trading signal, not a backtest result, and not execution-eligible.
It is always `research_only=true` and `execution_eligible=false`.

Generated report JSON files are ignored by git. Keep only `data-pipeline/reports/README.md`
and `data-pipeline/reports/.gitkeep` committed.

Report persistence is explicit and dry-run by default. The persistence script validates
artifact schema and only writes `data_quality_reports` rows when both conditions are true:

- `--apply` is present.
- `DATABASE_URL` or `--database-url` is provided.

The default dry-run command never opens a database connection:

```bash
make data-quality-reports-dry-run
```

## Data Version Registry

`data_versions` records the version boundary used by future research, backtests, and
paper simulations. Each record links:

- contract schema version
- market bars source
- rollover rule version
- optional data quality report path
- optional data quality report checksum
- status: `draft`, `validated`, `rejected`, or `retired`

The backend exposes an in-memory Phase 2 registry:

- `GET /api/data/versions`
- `POST /api/data/versions/register`
- `GET /api/data/versions/{version_id}`

The local CLI validates optional report artifact schema and is dry-run by default:

```bash
make data-version-register-dry-run
```

It writes `data_versions` only when both conditions are true:

- `--apply` is present.
- `DATABASE_URL` or `--database-url` is provided.

## Local Migration Apply and Verification

Migration apply is explicit and dry-run by default:

```bash
make data-migrations-dry-run
```

The migration script only writes to PostgreSQL when both conditions are true:

- `--apply` is present.
- `DATABASE_URL` or `--database-url` is provided.

Schema verification is also dry-run by default:

```bash
make data-platform-verify
```

With a database URL, verification checks:

- `contract_master`, `market_bars`, `rollover_events`, `data_quality_reports`,
  `data_versions`, and `data_migration_runs` tables.
- Required `contract_master` columns.
- Required `data_quality_reports` columns.
- Required `data_versions` and `data_migration_runs` columns.
- TX, MTX, and TMF records in `contract_master`.

## Suggested Commands

```bash
test -f data-pipeline/migrations/001_phase_2_data_platform.sql
test -f data-pipeline/fixtures/market_bars_valid.csv
test -f data-pipeline/fixtures/market_bars_invalid.csv
test -f data-pipeline/fixtures/rollover_events_valid.csv
test -f data-pipeline/fixtures/rollover_events_invalid.csv
test -f data-pipeline/reports/README.md
test -f data-pipeline/validation/persist_quality_report.py
test -f data-pipeline/validation/register_data_version.py
test -f data-pipeline/validation/validate_rollover_event_fixtures.py
test -f data-pipeline/validation/preview_continuous_futures.py
test -f data-pipeline/validation/build_feature_manifest.py
test -f data-pipeline/migrations/apply_local_migrations.py
test -f data-pipeline/migrations/verify_local_data_platform.py
test -f backend/app/domain/continuous_futures.py
test -f backend/app/api/continuous_futures_routes.py
test -f backend/app/domain/feature_manifest.py
test -f backend/app/api/feature_manifest_routes.py
test -f data-pipeline/schemas/contract_master.sql
test -f data-pipeline/schemas/market_bars.sql
test -f data-pipeline/schemas/rollover_events.sql
test -f data-pipeline/schemas/data_quality_checks.sql
test -f data-pipeline/schemas/data_versions.sql
make data-fixtures-check
make rollover-fixtures-check
make continuous-futures-preview
make feature-manifest-preview
make data-quality-reports-dry-run
make data-version-register-dry-run
make data-migrations-dry-run
make data-platform-verify
cd backend && .venv/bin/python -m pytest tests/test_data_platform.py
cd backend && .venv/bin/python -m pytest tests/test_rollover_fixture_validation_script.py
cd backend && .venv/bin/python -m pytest tests/test_continuous_futures.py
cd backend && .venv/bin/python -m pytest tests/test_continuous_futures_preview_script.py
cd backend && .venv/bin/python -m pytest tests/test_feature_manifest.py
cd backend && .venv/bin/python -m pytest tests/test_feature_manifest_script.py
cd backend && .venv/bin/python -m pytest tests/test_data_quality_report_persistence.py
cd backend && .venv/bin/python -m pytest tests/test_data_platform_migration_scripts.py
cd backend && .venv/bin/python -m pytest tests/test_data_versions.py
cd backend && .venv/bin/python -m pytest tests/test_data_version_registry_script.py
make check
```
