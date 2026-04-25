-- Phase 2 scaffold: cleaned market bars for real contract symbols.
-- Adjusted continuous contracts should be stored separately for research.

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
    inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (high >= low),
    CHECK (open >= 0 AND high >= 0 AND low >= 0 AND close >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS market_bars_unique_bar
ON market_bars (symbol, contract_month, timeframe, bar_start, data_version);
