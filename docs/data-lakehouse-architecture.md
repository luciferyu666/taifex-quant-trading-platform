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

## Data Quality Gates

- Missing bar and tick detection.
- Session boundary validation.
- Duplicate record checks.
- Outlier checks.
- Rollover continuity checks.
- Data version immutability checks.

## Data Versioning

Every research dataset should be tied to a source version, cleaning version, adjustment method, and build timestamp. Backtest results must reference data versions.

## Suggested SQL/Table Links

- `data-pipeline/schemas/contract_master.sql`
- `data-pipeline/schemas/market_bars.sql`
- `data-pipeline/schemas/rollover_events.sql`
- `data-pipeline/schemas/data_quality_checks.sql`

## Acceptance Criteria

- Real contract data path and research-adjusted data path are documented as separate.
- TX/MTX/TMF contract specs are centrally defined.
- Rollover events include adjustment method and data version.
- No external data download or broker API call is required for local checks.
