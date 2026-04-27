-- Phase 2 scaffold: rollover metadata for continuous futures research series.
-- Continuous adjusted prices are not tradable contract prices.

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
