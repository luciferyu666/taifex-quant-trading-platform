-- Phase 2 scaffold: data quality report structure.

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
