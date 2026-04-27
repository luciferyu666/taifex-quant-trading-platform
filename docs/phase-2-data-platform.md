# Phase 2: Data Platform

## Objective

Define a safe data foundation for TX/MTX/TMF contract metadata, market bars, rollover events, and data quality reports.

## Deliverables

- Contract master schema.
- Market bars schema.
- Rollover events schema.
- Data quality reports schema.
- Bronze/Silver/Gold data layer plan.
- Executable migration: `data-pipeline/migrations/001_phase_2_data_platform.sql`.
- Backend data-platform endpoints under `/api/data/*`.
- Backend tests for contract metadata, quality validation, and rollover policy.
- Local CSV fixtures and deterministic fixture validation script.
- Local rollover event CSV fixtures and deterministic rollover validation script.
- Research-only continuous futures preview from local market bar and rollover fixtures.
- Research-only feature dataset manifest preview for Phase 3 strategy/backtest inputs.
- Local data quality report artifact directory with generated JSON files ignored by git.
- Dry-run default report persistence script for `data_quality_reports`.
- Dry-run default local PostgreSQL migration apply and schema verification scripts.
- Data version registry schema, backend API, and dry-run default registration CLI.
- Local migration status tracking through `data_migration_runs`.

## Acceptance Criteria

- Contract specs include TX, MTX, and TMF point values.
- Research adjusted series are separate from real contract prices.
- Rollover data records adjustment method and data version.
- Execution data rejects adjusted continuous prices.
- Data quality validation can run without database, Docker, vendor feeds, or broker access.
- Local CSV fixtures produce deterministic pass/fail reports.
- Rollover event fixtures enforce TX/MTX/TMF root symbols, distinct contract months,
  valid timestamps, research-only scope, and explicit data versions.
- Continuous futures preview is dry-run only, consumes local fixtures only, and always
  returns `research_only=true` plus `execution_eligible=false`.
- Feature dataset manifest records source file checksums, continuous futures settings,
  optional quality report reference, and a reproducibility hash.
- Fixture validation can write JSON artifacts for CI or manual review without committing them.
- Report persistence requires explicit `--apply` and a database URL.
- Migration apply requires explicit `--apply` and a database URL.
- Schema verification can print expected checks without a database connection.
- Data version registration can run in dry-run mode and validates optional report artifacts.
- Data versions link contract schema version, market bars source, rollover rule version,
  and data quality report checksum.
- No external market data is downloaded by default.

## Safety Constraints

- Do not connect to broker APIs.
- Do not imply adjusted continuous contracts are tradable.
- Do not use external credentials.
- Do not write quality reports to the database unless `--apply` is explicitly provided.
- Do not apply migrations unless `--apply` is explicitly provided.
- Do not write data version records unless `--apply` is explicitly provided.
- Do not treat continuous futures preview output as tradable or execution-eligible.
- Do not treat feature manifests as trading signals or backtest results.

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
test -f data-pipeline/schemas/rollover_events.sql
test -f data-pipeline/schemas/data_versions.sql
make data-fixtures-check
make rollover-fixtures-check
make continuous-futures-preview
make feature-manifest-preview
make data-quality-reports-dry-run
make data-version-register-dry-run
make data-migrations-dry-run
make data-platform-verify
cd backend && pytest tests/test_contracts.py
cd backend && pytest tests/test_data_platform.py
cd backend && pytest tests/test_data_fixture_validation_script.py
cd backend && pytest tests/test_rollover_fixture_validation_script.py
cd backend && pytest tests/test_continuous_futures.py
cd backend && pytest tests/test_continuous_futures_preview_script.py
cd backend && pytest tests/test_feature_manifest.py
cd backend && pytest tests/test_feature_manifest_script.py
cd backend && pytest tests/test_data_quality_report_persistence.py
cd backend && pytest tests/test_data_platform_migration_scripts.py
cd backend && pytest tests/test_data_versions.py
cd backend && pytest tests/test_data_version_registry_script.py
make check
```

## Next Implementation Notes

Next safe slice: begin Phase 3 by defining a Strategy SDK dataset input contract that
accepts this manifest but still emits signals only. Do not run live trading or broker code.
