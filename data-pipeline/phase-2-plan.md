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
- No external market data is downloaded by default.

## Suggested Commands

```bash
test -f data-pipeline/schemas/contract_master.sql
test -f data-pipeline/schemas/market_bars.sql
test -f data-pipeline/schemas/rollover_events.sql
test -f data-pipeline/schemas/data_quality_checks.sql
make check
```
