# Data Pipeline

Purpose: hold future market data ingestion, validation, session alignment, and dataset versioning work.

Planned responsibilities:

- Bronze raw ingestion from Taifex and broker payloads.
- Silver cleaned time-series data.
- Gold feature and analytics datasets.
- Data quality gates for invalid prices, missing bars, and session alignment.

## Phase 2 Scaffold

The current scaffold defines safe, illustrative SQL schemas only. It does not download market data, call broker APIs, or require external credentials.

- `schemas/contract_master.sql`: TX/MTX/TMF contract metadata and point values.
- `schemas/market_bars.sql`: cleaned bar storage with real contract symbols.
- `schemas/rollover_events.sql`: continuous futures rollover and adjustment metadata.
- `schemas/data_quality_checks.sql`: data quality report structure.
- `phase-2-plan.md`: Bronze/Silver/Gold data layer plan.

Real contract prices are reserved for paper/live order simulation. Back-adjusted and ratio-adjusted continuous contracts are reserved for research and backtesting.
