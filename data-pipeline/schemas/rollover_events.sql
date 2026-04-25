-- Phase 2 scaffold: rollover metadata for continuous futures research series.
-- Continuous adjusted prices are not tradable contract prices.

CREATE TABLE IF NOT EXISTS rollover_events (
    id BIGSERIAL PRIMARY KEY,
    root_symbol TEXT NOT NULL,
    from_contract_month TEXT NOT NULL,
    to_contract_month TEXT NOT NULL,
    rollover_timestamp TIMESTAMPTZ NOT NULL,
    spread_points NUMERIC(18, 4) NOT NULL,
    adjustment_method TEXT NOT NULL CHECK (
        adjustment_method IN ('none', 'back_adjusted', 'ratio_adjusted')
    ),
    data_version TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS rollover_events_unique_version
ON rollover_events (
    root_symbol,
    from_contract_month,
    to_contract_month,
    rollover_timestamp,
    data_version
);
