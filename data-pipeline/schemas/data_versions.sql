-- Phase 2 data version registry and local migration status tracking.
-- Safe default: schema only. No external data download, broker API, or live trading.

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
