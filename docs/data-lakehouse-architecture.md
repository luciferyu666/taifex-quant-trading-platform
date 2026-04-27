# Data Lakehouse Architecture

## Bronze Raw

Bronze Raw is the immutable source layer. Future implementation can use S3/MinIO-style object storage for raw Taifex, broker, vendor, and internal event payloads.

## Silver Clean

Silver Clean stores validated time-series data in TimescaleDB/PostgreSQL-compatible tables. It should contain cleaned bars, ticks, sessions, contract metadata, and data quality reports.

## Gold Feature

Gold Feature stores analytics-ready data in ClickHouse-style OLAP structures: features, factors, backtest results, performance analytics, and research aggregates.

## Contract Master

Contract Master owns TX/MTX/TMF contract lifecycle, point values, expiry, session calendar, trading status, and execution symbol mapping.

## Rollover Event Table

Rollover events should record:
- rollover date
- source and destination contract
- basis/spread
- adjustment method
- adjustment factor
- data version
- validation status

## Adjusted Continuous Futures vs Real-Contract Prices

Back-adjusted and ratio-adjusted continuous futures are research-only. Paper/live execution simulation must use real contract symbols and real-contract prices.

Phase 2 provides a local fixture-based continuous futures preview only. The preview can
show how validated rollover metadata affects research bars, but output is always
`research_only=true` and `execution_eligible=false`.

Phase 2 also emits a feature dataset manifest preview. The manifest bundles source
fixture checksums, data version, continuous futures configuration, feature metadata, and
a reproducibility hash for Phase 3 strategy/backtest inputs. It is not a signal or
backtest result.

## Data Quality Gates

- Missing bar and tick detection.
- Session boundary validation.
- Duplicate record checks.
- Outlier checks.
- Rollover continuity checks.
- Data version immutability checks.

## Data Versioning

Every research dataset should be tied to a source version, cleaning version, adjustment method, and build timestamp. Backtest results must reference data versions.

Phase 2 introduces `data_versions` as the registry for reproducibility. A record links
contract schema version, market bars source, rollover rule version, optional quality
report path, optional report checksum, creation time, and lifecycle status.

Local migration state is tracked separately in `data_migration_runs` by migration file
name, checksum, status, and apply timestamp. This keeps schema evolution auditable without
mixing it with market data versions.

## Suggested SQL/Table Links

- `data-pipeline/migrations/001_phase_2_data_platform.sql`
- `data-pipeline/schemas/contract_master.sql`
- `data-pipeline/schemas/market_bars.sql`
- `data-pipeline/schemas/rollover_events.sql`
- `data-pipeline/schemas/data_quality_checks.sql`
- `data-pipeline/schemas/data_versions.sql`

Backend metadata and validation endpoints:

- `GET /api/data/manifest`
- `GET /api/data/contracts/master`
- `GET /api/data/layers`
- `GET /api/data/quality/rules`
- `POST /api/data/quality/validate-bar`
- `POST /api/data/quality/validate-bars`
- `GET /api/data/rollover/policy`
- `GET /api/data/versions`
- `POST /api/data/versions/register`
- `GET /api/data/versions/{version_id}`
- `POST /api/data/continuous-futures/preview`
- `POST /api/data/features/manifest/preview`

Local fixture validation:

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
- `make data-fixtures-check`
- `make rollover-fixtures-check`
- `make continuous-futures-preview`
- `make feature-manifest-preview`
- `make data-quality-reports-dry-run`
- `make data-version-register-dry-run`
- `make data-migrations-dry-run`
- `make data-platform-verify`

Generated JSON reports under `data-pipeline/reports/` are local artifacts and should stay
out of git. They are intended for CI review, manual QA, or a future explicit database write
path into `data_quality_reports`.

Persistence remains dry-run by default. Database writes require `--apply` and an explicit
database URL.

Migration apply remains dry-run by default. Schema verification can run without a database URL
to print expected checks, or with a database URL to verify the local PostgreSQL schema.

## Acceptance Criteria

- Real contract data path and research-adjusted data path are documented as separate.
- TX/MTX/TMF contract specs are centrally defined.
- Rollover events include adjustment method and data version.
- Feature manifests include source checksums and a reproducibility hash.
- No external data download or broker API call is required for local checks.
