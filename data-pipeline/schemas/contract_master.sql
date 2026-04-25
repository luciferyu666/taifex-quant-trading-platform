-- Phase 2 scaffold: illustrative contract master schema.
-- Safe default: no external data download and no broker API usage.

CREATE TABLE IF NOT EXISTS contract_master (
    symbol TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    point_value_twd INTEGER NOT NULL CHECK (point_value_twd > 0),
    tx_equivalent_ratio NUMERIC(10, 4) NOT NULL CHECK (tx_equivalent_ratio > 0),
    exchange TEXT NOT NULL DEFAULT 'TAIFEX',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO contract_master (symbol, product_name, point_value_twd, tx_equivalent_ratio)
VALUES
    ('TX', 'Taiwan Index Futures', 200, 1.0000),
    ('MTX', 'Mini Taiwan Index Futures', 50, 0.2500),
    ('TMF', 'Micro Taiwan Index Futures', 10, 0.0500)
ON CONFLICT (symbol) DO NOTHING;
