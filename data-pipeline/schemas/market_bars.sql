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
