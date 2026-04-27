-- Phase 2 executable migration: Taiwan futures data platform foundation.
-- Safe default: no external market data download, no broker API usage, no live trading.
-- Apply manually with:
--   psql "$DATABASE_URL" -f data-pipeline/migrations/001_phase_2_data_platform.sql

BEGIN;

CREATE TABLE IF NOT EXISTS contract_master (
    symbol TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    point_value_twd INTEGER NOT NULL CHECK (point_value_twd > 0),
    tx_equivalent_ratio NUMERIC(10, 4) NOT NULL CHECK (tx_equivalent_ratio > 0),
    exchange TEXT NOT NULL DEFAULT 'TAIFEX',
    session_template TEXT NOT NULL DEFAULT 'regular_and_after_hours',
    execution_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    research_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO contract_master (
    symbol,
    product_name,
    point_value_twd,
    tx_equivalent_ratio,
    notes
)
VALUES
    (
        'TX',
        'Taiwan Index Futures',
        200,
        1.0000,
        'Real contract prices only for execution simulation; adjusted series are research-only.'
    ),
    (
        'MTX',
        'Mini Taiwan Index Futures',
        50,
        0.2500,
        'Real contract prices only for execution simulation; adjusted series are research-only.'
    ),
    (
        'TMF',
        'Micro Taiwan Index Futures',
        10,
        0.0500,
        'Real contract prices only for execution simulation; adjusted series are research-only.'
    )
ON CONFLICT (symbol) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    point_value_twd = EXCLUDED.point_value_twd,
    tx_equivalent_ratio = EXCLUDED.tx_equivalent_ratio,
    notes = EXCLUDED.notes,
    updated_at = NOW();

CREATE TABLE IF NOT EXISTS market_bars (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL REFERENCES contract_master(symbol),
    contract_month TEXT NOT NULL,
    bar_start TIMESTAMPTZ NOT NULL,
    timeframe TEXT NOT NULL,
    open NUMERIC(18, 4) NOT NULL,
    high NUMERIC(18, 4) NOT NULL,
    low NUMERIC(18, 4) NOT NULL,
    close NUMERIC(18, 4) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    data_version TEXT NOT NULL,
    source TEXT NOT NULL,
    price_usage TEXT NOT NULL DEFAULT 'execution' CHECK (
        price_usage IN ('execution', 'research')
    ),
    adjustment_method TEXT NOT NULL DEFAULT 'none' CHECK (
        adjustment_method IN ('none', 'back_adjusted', 'ratio_adjusted')
    ),
    inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (high >= low),
    CHECK (open >= 0 AND high >= 0 AND low >= 0 AND close >= 0),
    CHECK (volume >= 0),
    CHECK (
        NOT (
            price_usage = 'execution'
            AND adjustment_method <> 'none'
        )
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS market_bars_unique_bar
ON market_bars (symbol, contract_month, timeframe, bar_start, data_version);

CREATE TABLE IF NOT EXISTS research_continuous_bars (
    id BIGSERIAL PRIMARY KEY,
    root_symbol TEXT NOT NULL REFERENCES contract_master(symbol),
    continuous_symbol TEXT NOT NULL,
    bar_start TIMESTAMPTZ NOT NULL,
    timeframe TEXT NOT NULL,
    open NUMERIC(18, 4) NOT NULL,
    high NUMERIC(18, 4) NOT NULL,
    low NUMERIC(18, 4) NOT NULL,
    close NUMERIC(18, 4) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    adjustment_method TEXT NOT NULL CHECK (
        adjustment_method IN ('back_adjusted', 'ratio_adjusted')
    ),
    data_version TEXT NOT NULL,
    source TEXT NOT NULL,
    inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (high >= low),
    CHECK (open >= 0 AND high >= 0 AND low >= 0 AND close >= 0),
    CHECK (volume >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS research_continuous_bars_unique_bar
ON research_continuous_bars (
    root_symbol,
    continuous_symbol,
    timeframe,
    bar_start,
    adjustment_method,
    data_version
);

CREATE TABLE IF NOT EXISTS rollover_events (
    id BIGSERIAL PRIMARY KEY,
    root_symbol TEXT NOT NULL REFERENCES contract_master(symbol),
    from_contract_month TEXT NOT NULL,
    to_contract_month TEXT NOT NULL,
    rollover_timestamp TIMESTAMPTZ NOT NULL,
    spread_points NUMERIC(18, 4) NOT NULL,
    adjustment_method TEXT NOT NULL CHECK (
        adjustment_method IN ('none', 'back_adjusted', 'ratio_adjusted')
    ),
    adjustment_factor NUMERIC(18, 8) NOT NULL DEFAULT 0,
    data_version TEXT NOT NULL,
    research_only BOOLEAN NOT NULL DEFAULT TRUE,
    validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        validation_status IN ('pending', 'validated', 'rejected')
    ),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (research_only = TRUE),
    CHECK (
        adjustment_method <> 'none'
        OR adjustment_factor = 0
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS rollover_events_unique_version
ON rollover_events (
    root_symbol,
    from_contract_month,
    to_contract_month,
    rollover_timestamp,
    data_version
);

CREATE TABLE IF NOT EXISTS data_quality_reports (
    id BIGSERIAL PRIMARY KEY,
    dataset_name TEXT NOT NULL,
    data_version TEXT NOT NULL,
    check_name TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
    observed_count BIGINT NOT NULL DEFAULT 0 CHECK (observed_count >= 0),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS data_quality_reports_dataset_version
ON data_quality_reports (dataset_name, data_version, check_name);

CREATE TABLE IF NOT EXISTS data_versions (
    version_id TEXT PRIMARY KEY,
    contract_schema_version TEXT NOT NULL,
    market_bars_source TEXT NOT NULL,
    rollover_rule_version TEXT NOT NULL,
    data_quality_report_path TEXT,
    data_quality_report_checksum TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'validated', 'rejected', 'retired')
    ),
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS data_versions_status_created_at
ON data_versions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS data_migration_runs (
    migration_name TEXT PRIMARY KEY,
    migration_checksum TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'applied', 'failed')
    ),
    applied_at TIMESTAMPTZ,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
