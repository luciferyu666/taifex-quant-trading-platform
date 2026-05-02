import type { DashboardCopy } from "../i18n";

export type HostedPaperProductionDatastoreReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  recommended_datastore_pattern: string;
  tenant_key: string;
  capabilities: Record<string, boolean>;
  record_groups: Array<{
    record_group: string;
    table_names: string[];
    tenant_key: string;
    required_identifiers: string[];
    required_controls: string[];
    backup_required: boolean;
    retention_required: boolean;
    restore_required: boolean;
    local_sqlite_allowed: boolean;
  }>;
  migration_boundary: {
    migration_mode: string;
    dry_run_only: boolean;
    database_url_read: boolean;
    connection_attempted: boolean;
    apply_enabled: boolean;
    automatic_apply_enabled: boolean;
    backup_before_apply_required: boolean;
    restore_drill_before_customer_pilot_required: boolean;
    required_controls_before_apply: string[];
  };
  retention_boundaries: Array<{
    record_group: string;
    minimum_requirement: string;
    delete_behavior: string;
    export_required: boolean;
    audit_required: boolean;
    legal_hold_required_before_delete: boolean;
  }>;
  local_sqlite_boundary: string;
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperProductionDatastoreReadinessPanelProps = {
  readiness: HostedPaperProductionDatastoreReadiness;
  available: boolean;
  copy: DashboardCopy["hostedPaperProductionDatastore"];
  error?: string;
};

function label(labels: Readonly<Record<string, string>>, value: string): string {
  return labels[value] ?? value;
}

export function HostedPaperProductionDatastoreReadinessPanel({
  readiness,
  available,
  copy,
  error,
}: HostedPaperProductionDatastoreReadinessPanelProps) {
  return (
    <section
      className="release-section hosted-paper-production-datastore-panel"
      aria-labelledby="hosted-paper-production-datastore-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-production-datastore-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      {!available ? (
        <p className="notice warn">
          {copy.fallbackPrefix} {error}
        </p>
      ) : null}

      <div className="release-hero panel">
        <div>
          <p className="card-kicker">{copy.endpointLabel}</p>
          <h3>GET /api/hosted-paper/production-datastore/readiness</h3>
          <p>{readiness.summary}</p>
          <p>
            {copy.tenantKeyLabel}: <code>{readiness.tenant_key}</code>
          </p>
          <p>
            {copy.recommendedPatternLabel}:{" "}
            <code>{readiness.recommended_datastore_pattern}</code>
          </p>
        </div>
        <span className="metric danger">
          {copy.stateLabel}: {label(copy.statusLabels, readiness.readiness_state)}
        </span>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.capabilitiesLabel}</p>
          <div className="validation-list">
            {Object.entries(readiness.capabilities).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{label(copy.capabilityLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.migrationLabel}</p>
          <dl className="detail-list">
            <div>
              <dt>{copy.migrationModeLabel}</dt>
              <dd>{readiness.migration_boundary.migration_mode}</dd>
            </div>
            <div>
              <dt>{copy.databaseUrlReadLabel}</dt>
              <dd>{String(readiness.migration_boundary.database_url_read)}</dd>
            </div>
            <div>
              <dt>{copy.connectionAttemptedLabel}</dt>
              <dd>{String(readiness.migration_boundary.connection_attempted)}</dd>
            </div>
            <div>
              <dt>{copy.applyEnabledLabel}</dt>
              <dd>{String(readiness.migration_boundary.apply_enabled)}</dd>
            </div>
          </dl>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.requiredControlsLabel}</p>
          <ul className="warning-list">
            {readiness.migration_boundary.required_controls_before_apply.map((item) => (
              <li key={item}>{label(copy.controlLabels, item)}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="release-card">
        <p className="card-kicker">{copy.recordGroupsLabel}</p>
        <div className="datastore-model-grid">
          {readiness.record_groups.map((group) => (
            <section className="datastore-model-card" key={group.record_group}>
              <h3>{label(copy.recordGroupLabels, group.record_group)}</h3>
              <p>
                {copy.localSqliteAllowedLabel}:{" "}
                <strong>{String(group.local_sqlite_allowed)}</strong>
              </p>
              <p>
                {copy.backupRequiredLabel}: <strong>{String(group.backup_required)}</strong>
              </p>
              <p>
                {copy.retentionRequiredLabel}:{" "}
                <strong>{String(group.retention_required)}</strong>
              </p>
              <p>
                {copy.restoreRequiredLabel}:{" "}
                <strong>{String(group.restore_required)}</strong>
              </p>
              <p className="card-kicker">{copy.tablesLabel}</p>
              <ul className="pill-list">
                {group.table_names.map((table) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
              <p className="card-kicker">{copy.requiredControlsLabel}</p>
              <ul className="warning-list">
                {group.required_controls.map((item) => (
                  <li key={item}>{label(copy.controlLabels, item)}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.retentionLabel}</p>
          <ul className="warning-list">
            {readiness.retention_boundaries.map((item) => (
              <li key={item.record_group}>
                <strong>{label(copy.recordGroupLabels, item.record_group)}</strong>
                <br />
                {label(copy.retentionRequirementLabels, item.minimum_requirement)}
                <br />
                {label(copy.deleteBehaviorLabels, item.delete_behavior)}
              </li>
            ))}
          </ul>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.localSqliteBoundaryLabel}</p>
          <p>{readiness.local_sqlite_boundary}</p>
        </article>

        <article className="release-card">
          <p className="card-kicker">{copy.safetyDefaultsLabel}</p>
          <div className="flag-grid">
            <span className="flag ok">
              <span>TRADING_MODE</span>
              <strong>{readiness.safety_defaults.trading_mode}</strong>
            </span>
            <span
              className={
                readiness.safety_defaults.enable_live_trading
                  ? "flag danger"
                  : "flag ok"
              }
            >
              <span>ENABLE_LIVE_TRADING</span>
              <strong>{String(readiness.safety_defaults.enable_live_trading)}</strong>
            </span>
            <span className="flag ok">
              <span>BROKER_PROVIDER</span>
              <strong>{readiness.safety_defaults.broker_provider}</strong>
            </span>
          </div>
        </article>
      </div>

      <div className="release-grid">
        <article className="release-card">
          <p className="card-kicker">{copy.safetyFlagsLabel}</p>
          <div className="validation-list">
            {Object.entries(readiness.safety_flags).map(([key, value]) => (
              <span className="validation-row" key={key}>
                <span>{label(copy.safetyFlagLabels, key)}</span>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className="release-card release-gaps">
          <p className="card-kicker">{copy.warningLabel}</p>
          <ul className="warning-list">
            {readiness.warnings.map((warning) => (
              <li key={warning}>{label(copy.warningLabels, warning)}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
