import type { DashboardCopy } from "../i18n";

export type HostedPaperDatastoreRecordModel = {
  record_name: string;
  table_name: string;
  tenant_key: string;
  tenant_key_required: boolean;
  primary_identifiers: string[];
  required_fields: string[];
  audit_requirements: string[];
  retention_class: string;
  notes: string;
};

export type HostedPaperDatastoreReadiness = {
  service: string;
  readiness_state: string;
  summary: string;
  tenant_key: string;
  capabilities: Record<string, boolean>;
  record_models: HostedPaperDatastoreRecordModel[];
  migration_boundary: {
    migration_mode: string;
    dry_run_only: boolean;
    apply_enabled: boolean;
    database_url_required_before_apply: boolean;
    automatic_migration_apply: boolean;
    connection_attempted: boolean;
    required_controls_before_apply: string[];
  };
  retention_requirements: Array<{
    record_group: string;
    minimum_policy: string;
    delete_behavior: string;
    export_required: boolean;
    audit_required: boolean;
  }>;
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  safety_flags: Record<string, boolean>;
  docs: Record<string, string>;
  warnings: string[];
};

type HostedPaperDatastoreReadinessPanelProps = {
  readiness: HostedPaperDatastoreReadiness;
  available: boolean;
  copy: DashboardCopy["hostedPaperDatastore"];
  error?: string;
};

function label(labels: Readonly<Record<string, string>>, value: string): string {
  return labels[value] ?? value;
}

export function HostedPaperDatastoreReadinessPanel({
  readiness,
  available,
  copy,
  error,
}: HostedPaperDatastoreReadinessPanelProps) {
  return (
    <section
      className="release-section hosted-paper-datastore-panel"
      aria-labelledby="hosted-paper-datastore-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="hosted-paper-datastore-title">{copy.title}</h2>
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
          <h3>GET /api/hosted-paper/datastore-readiness</h3>
          <p>{readiness.summary}</p>
          <p>
            {copy.tenantKeyLabel}: <code>{readiness.tenant_key}</code>
          </p>
        </div>
        <span className="metric warn">
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
              <dt>{copy.dryRunLabel}</dt>
              <dd>{String(readiness.migration_boundary.dry_run_only)}</dd>
            </div>
            <div>
              <dt>{copy.applyEnabledLabel}</dt>
              <dd>{String(readiness.migration_boundary.apply_enabled)}</dd>
            </div>
            <div>
              <dt>{copy.connectionAttemptedLabel}</dt>
              <dd>{String(readiness.migration_boundary.connection_attempted)}</dd>
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
        <p className="card-kicker">{copy.recordModelsLabel}</p>
        <div className="datastore-model-grid">
          {readiness.record_models.map((model) => (
            <section className="datastore-model-card" key={model.table_name}>
              <h3>{label(copy.recordNameLabels, model.record_name)}</h3>
              <p>
                {copy.tableLabel}: <code>{model.table_name}</code>
              </p>
              <p>
                {copy.tenantKeyRequiredLabel}:{" "}
                <strong>{String(model.tenant_key_required)}</strong>
              </p>
              <p>
                {copy.retentionClassLabel}:{" "}
                <strong>{label(copy.retentionClassLabels, model.retention_class)}</strong>
              </p>
              <p>{label(copy.modelNotesLabels, model.notes)}</p>
              <p className="card-kicker">{copy.primaryIdentifiersLabel}</p>
              <ul className="pill-list">
                {model.primary_identifiers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="card-kicker">{copy.auditRequirementsLabel}</p>
              <ul className="warning-list">
                {model.audit_requirements.map((item) => (
                  <li key={item}>{label(copy.auditRequirementLabels, item)}</li>
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
            {readiness.retention_requirements.map((item) => (
              <li key={item.record_group}>
                <strong>{label(copy.recordGroupLabels, item.record_group)}</strong>
                <br />
                {label(copy.retentionPolicyLabels, item.minimum_policy)}
              </li>
            ))}
          </ul>
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
      </div>

      <article className="release-card release-gaps">
        <p className="card-kicker">{copy.warningLabel}</p>
        <ul className="warning-list">
          {readiness.warnings.map((warning) => (
            <li key={warning}>{label(copy.warningLabels, warning)}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
