-- Phase 2 scaffold: contract master schema.
-- Safe default: no external data download and no broker API usage.

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
