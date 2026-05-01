"use client";

import { useState, type ChangeEvent } from "react";

import type { DashboardCopy } from "../i18n";
import type {
  HostedPaperPermissionDefinition,
  HostedPaperRoleDefinition,
  HostedPaperTenantContext,
} from "./HostedPaperMockSessionPanel";

type HostedPaperTenantBoundarySession = {
  user_id: string;
  session_id: string;
  authenticated: boolean;
  authentication_provider: string;
  authentication_mode: string;
  roles: string[];
  attributes: Record<string, string | boolean | number | null>;
};

type HostedPaperTenantBoundarySafetyFlags = {
  paper_only: boolean;
  read_only: boolean;
  hosted_paper_enabled: boolean;
  live_trading_enabled: boolean;
  broker_provider: string;
  broker_api_called: boolean;
  order_created: boolean;
  risk_engine_called: boolean;
  oms_called: boolean;
  broker_gateway_called: boolean;
  authenticated: boolean;
  hosted_auth_provider_enabled: boolean;
  session_cookie_issued: boolean;
  credentials_collected: boolean;
  broker_credentials_collected: boolean;
  database_written: boolean;
  hosted_datastore_enabled: boolean;
  hosted_datastore_written: boolean;
  external_db_written: boolean;
  local_sqlite_access: boolean;
  production_trading_ready: boolean;
  investment_advice: boolean;
};

type HostedPaperTenantBoundaryAssertions = {
  hosted_paper_mode_enabled: boolean;
  mock_read_only: boolean;
  authenticated: boolean;
  authentication_provider: string;
  session_cookie_issued: boolean;
  tenant_isolation_required: boolean;
  hosted_datastore_enabled: boolean;
  hosted_datastore_written: boolean;
  local_sqlite_access: boolean;
  broker_provider: string;
  broker_api_called: boolean;
  credentials_collected: boolean;
  broker_credentials_collected: boolean;
  live_trading_enabled: boolean;
  production_trading_ready: boolean;
  mutation_permissions_granted: boolean;
};

type HostedPaperTenantBoundaryEvidence = {
  evidence_type: "hosted_paper_tenant_boundary_evidence";
  evidence_id: string;
  generated_at: string;
  service: string;
  contract_state: string;
  summary: string;
  session: HostedPaperTenantBoundarySession;
  tenant: HostedPaperTenantContext;
  role_schema: HostedPaperRoleDefinition[];
  permission_schema: HostedPaperPermissionDefinition[];
  granted_permissions: HostedPaperPermissionDefinition[];
  denied_permissions: HostedPaperPermissionDefinition[];
  denied_mutation_permissions: HostedPaperPermissionDefinition[];
  safety_defaults: {
    trading_mode: string;
    enable_live_trading: boolean;
    broker_provider: string;
  };
  boundary_assertions: HostedPaperTenantBoundaryAssertions;
  safety_flags: HostedPaperTenantBoundarySafetyFlags;
  persisted: boolean;
  warnings: string[];
};

type ValidationResult =
  | { ok: true; evidence: HostedPaperTenantBoundaryEvidence }
  | { ok: false; reason: string };

const maxLocalEvidenceBytes = 500_000;

export function HostedPaperTenantBoundaryEvidencePanel({
  copy,
}: {
  copy: DashboardCopy;
}) {
  const labels = copy.hostedPaperTenantEvidence;
  const [evidence, setEvidence] = useState<HostedPaperTenantBoundaryEvidence | null>(
    null,
  );
  const [loaderMessage, setLoaderMessage] = useState<string>(labels.initialMessage);
  const [loaderState, setLoaderState] = useState<"idle" | "ok" | "error">("idle");
  const [sourceLabel, setSourceLabel] = useState<string>(labels.noSource);

  async function handleEvidenceFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      reject(labels.rejectExtension);
      return;
    }

    if (file.size > maxLocalEvidenceBytes) {
      reject(labels.rejectSize);
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validation = validateHostedPaperTenantBoundaryEvidence(parsed);
      if (!validation.ok) {
        reject(`${labels.rejectPrefix}: ${validation.reason}`);
        return;
      }

      setEvidence(validation.evidence);
      setSourceLabel(`${labels.loadedPrefix}: ${file.name}`);
      setLoaderState("ok");
      setLoaderMessage(labels.loadedMessage);
    } catch (error) {
      reject(
        error instanceof Error
          ? `${labels.rejectPrefix}: ${error.message}`
          : labels.invalidJson,
      );
    }
  }

  function reject(message: string) {
    setLoaderState("error");
    setLoaderMessage(message);
    setEvidence(null);
    setSourceLabel(labels.noSource);
  }

  function clearEvidence() {
    setEvidence(null);
    setSourceLabel(labels.noSource);
    setLoaderState("idle");
    setLoaderMessage(labels.clearMessage);
  }

  return (
    <section
      className="paper-evidence-section hosted-paper-tenant-evidence-section"
      aria-labelledby="hosted-paper-tenant-evidence-title"
    >
      <div className="paper-evidence-loader panel">
        <div>
          <p className="card-kicker">{labels.eyebrow}</p>
          <h2 id="hosted-paper-tenant-evidence-title">{labels.title}</h2>
          <p>{labels.description}</p>
          <p>
            {labels.currentSource}: <strong>{sourceLabel}</strong>
          </p>
        </div>
        <label className="file-picker">
          <span>{labels.selectFile}</span>
          <input
            accept=".json,application/json"
            aria-describedby="hosted-paper-tenant-evidence-loader-status"
            onChange={handleEvidenceFileChange}
            type="file"
          />
        </label>
        <div className="packet-loader-actions">
          <button className="action-button secondary" type="button" onClick={clearEvidence}>
            {labels.clearLocalJson}
          </button>
        </div>
        <p
          className={
            loaderState === "error"
              ? "loader-status error"
              : loaderState === "ok"
                ? "loader-status ok"
                : "loader-status"
          }
          id="hosted-paper-tenant-evidence-loader-status"
        >
          {loaderMessage}
        </p>
      </div>

      {evidence ? (
        <div className="paper-evidence-layout">
          <article className="paper-record-panel selected-run">
            <p className="card-kicker">{labels.identityKicker}</p>
            <h3>{labels.identityTitle}</h3>
            <dl className="detail-list">
              <Detail label={labels.fields.evidenceId} value={evidence.evidence_id} />
              <Detail label={labels.fields.generatedAt} value={evidence.generated_at} />
              <Detail label={labels.fields.service} value={evidence.service} />
              <Detail label={labels.fields.contractState} value={evidence.contract_state} />
              <Detail label={labels.fields.persisted} value={String(evidence.persisted)} />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.sessionKicker}</p>
            <h3>{labels.sessionTitle}</h3>
            <dl className="detail-list compact">
              <Detail label={labels.fields.userId} value={evidence.session.user_id} />
              <Detail label={labels.fields.sessionId} value={evidence.session.session_id} />
              <Detail
                label={labels.fields.authenticated}
                value={String(evidence.session.authenticated)}
              />
              <Detail
                label={labels.fields.authenticationProvider}
                value={evidence.session.authentication_provider}
              />
              <Detail
                label={labels.fields.authenticationMode}
                value={evidence.session.authentication_mode}
              />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.tenantKicker}</p>
            <h3>{labels.tenantTitle}</h3>
            <dl className="detail-list compact">
              <Detail label={labels.fields.tenantId} value={evidence.tenant.tenant_id} />
              <Detail label={labels.fields.tenantMode} value={evidence.tenant.tenant_mode} />
              <Detail
                label={labels.fields.tenantIsolation}
                value={String(evidence.tenant.tenant_isolation_required)}
              />
              <Detail
                label={labels.fields.hostedDatastore}
                value={String(evidence.tenant.hosted_datastore_enabled)}
              />
              <Detail
                label={labels.fields.localSqliteAccess}
                value={String(evidence.tenant.local_sqlite_access)}
              />
              <Detail
                label={labels.fields.brokerProvider}
                value={evidence.tenant.broker_provider}
              />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.permissionsKicker}</p>
            <h3>{labels.permissionsTitle}</h3>
            <dl className="detail-list compact">
              <Detail
                label={labels.fields.grantedPermissions}
                value={String(evidence.granted_permissions.length)}
              />
              <Detail
                label={labels.fields.deniedPermissions}
                value={String(evidence.denied_permissions.length)}
              />
              <Detail
                label={labels.fields.deniedMutationPermissions}
                value={String(evidence.denied_mutation_permissions.length)}
              />
              <Detail
                label={labels.fields.mutationPermissionsGranted}
                value={String(evidence.boundary_assertions.mutation_permissions_granted)}
              />
            </dl>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{labels.deniedMutationKicker}</p>
            <h3>{labels.deniedMutationTitle}</h3>
            <ul className="warning-list">
              {evidence.denied_mutation_permissions.map((permission) => (
                <li key={permission.permission}>
                  <strong>
                    {labels.permissionLabels[
                      permission.permission as keyof typeof labels.permissionLabels
                    ] ?? permission.permission}
                  </strong>
                  : {permission.description}
                </li>
              ))}
            </ul>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{labels.safetyKicker}</p>
            <h3>{labels.safetyTitle}</h3>
            <div className="flag-grid">
              {Object.entries(evidence.safety_flags).map(([key, value]) => (
                <span className={isSafeEvidenceFlag(key, value) ? "flag ok" : "flag danger"} key={key}>
                  {labels.safetyLabels[key as keyof typeof labels.safetyLabels] ?? key}
                  <strong>{String(value)}</strong>
                </span>
              ))}
            </div>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{labels.assertionsKicker}</p>
            <h3>{labels.assertionsTitle}</h3>
            <div className="flag-grid">
              {Object.entries(evidence.boundary_assertions).map(([key, value]) => (
                <span
                  className={isSafeBoundaryAssertion(key, value) ? "flag ok" : "flag danger"}
                  key={key}
                >
                  {labels.assertionLabels[key as keyof typeof labels.assertionLabels] ?? key}
                  <strong>{String(value)}</strong>
                </span>
              ))}
            </div>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{labels.warningsKicker}</p>
            <h3>{labels.warningsTitle}</h3>
            <ul className="warning-list">
              {evidence.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="read-only-note">{labels.readOnlyNote}</p>
          </article>
        </div>
      ) : (
        <p className="empty-state">{labels.empty}</p>
      )}
    </section>
  );
}

function validateHostedPaperTenantBoundaryEvidence(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, reason: "evidence payload must be a JSON object" };
  }
  if (payload.evidence_type !== "hosted_paper_tenant_boundary_evidence") {
    return {
      ok: false,
      reason: "evidence_type must be hosted_paper_tenant_boundary_evidence",
    };
  }

  for (const field of [
    "evidence_id",
    "generated_at",
    "service",
    "contract_state",
    "summary",
  ] as const) {
    if (!isNonEmptyString(payload[field])) {
      return { ok: false, reason: `${field} is required` };
    }
  }
  if (payload.contract_state !== "mock_read_only") {
    return { ok: false, reason: "contract_state must be mock_read_only" };
  }
  if (typeof payload.persisted !== "boolean") {
    return { ok: false, reason: "persisted must be boolean" };
  }

  const sessionValidation = validateSession(payload.session);
  if (!sessionValidation.ok) {
    return sessionValidation;
  }

  const tenantValidation = validateTenant(payload.tenant);
  if (!tenantValidation.ok) {
    return tenantValidation;
  }

  if (!Array.isArray(payload.role_schema) || payload.role_schema.length === 0) {
    return { ok: false, reason: "role_schema must be a non-empty array" };
  }
  if (!Array.isArray(payload.permission_schema) || payload.permission_schema.length === 0) {
    return { ok: false, reason: "permission_schema must be a non-empty array" };
  }
  if (!Array.isArray(payload.granted_permissions)) {
    return { ok: false, reason: "granted_permissions must be an array" };
  }
  if (!Array.isArray(payload.denied_permissions)) {
    return { ok: false, reason: "denied_permissions must be an array" };
  }
  if (!Array.isArray(payload.denied_mutation_permissions)) {
    return { ok: false, reason: "denied_mutation_permissions must be an array" };
  }

  for (const permission of payload.granted_permissions) {
    if (!isRecord(permission) || permission.mutation !== false) {
      return { ok: false, reason: "granted_permissions must be read-only permissions" };
    }
  }

  const deniedMutationNames = new Set<string>();
  for (const permission of payload.denied_mutation_permissions) {
    if (!isRecord(permission) || permission.mutation !== true) {
      return {
        ok: false,
        reason: "denied_mutation_permissions must contain mutation permissions",
      };
    }
    if (!isNonEmptyString(permission.permission)) {
      return {
        ok: false,
        reason: "denied_mutation_permissions.permission is required",
      };
    }
    deniedMutationNames.add(permission.permission);
  }
  for (const permission of [
    "create_paper_approval_request",
    "record_paper_reviewer_decision",
    "submit_approved_paper_workflow",
    "enable_live_trading",
    "upload_broker_credentials",
  ]) {
    if (!deniedMutationNames.has(permission)) {
      return { ok: false, reason: `${permission} must be denied` };
    }
  }

  if (!isRecord(payload.safety_defaults)) {
    return { ok: false, reason: "safety_defaults object is required" };
  }
  if (
    payload.safety_defaults.trading_mode !== "paper" ||
    payload.safety_defaults.enable_live_trading !== false ||
    payload.safety_defaults.broker_provider !== "paper"
  ) {
    return { ok: false, reason: "safety_defaults must remain paper-only" };
  }

  if (!isRecord(payload.safety_flags)) {
    return { ok: false, reason: "safety_flags object is required" };
  }
  const safetyFlags = {
    paper_only: true,
    read_only: true,
    hosted_paper_enabled: false,
    live_trading_enabled: false,
    broker_api_called: false,
    order_created: false,
    risk_engine_called: false,
    oms_called: false,
    broker_gateway_called: false,
    authenticated: false,
    hosted_auth_provider_enabled: false,
    session_cookie_issued: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    database_written: false,
    hosted_datastore_enabled: false,
    hosted_datastore_written: false,
    external_db_written: false,
    local_sqlite_access: false,
    production_trading_ready: false,
    investment_advice: false,
  } as const;
  for (const [flag, expected] of Object.entries(safetyFlags)) {
    if (payload.safety_flags[flag] !== expected) {
      return { ok: false, reason: `safety_flags.${flag} must be ${String(expected)}` };
    }
  }
  if (payload.safety_flags.broker_provider !== "paper") {
    return { ok: false, reason: "safety_flags.broker_provider must be paper" };
  }

  const assertionValidation = validateBoundaryAssertions(payload.boundary_assertions);
  if (!assertionValidation.ok) {
    return assertionValidation;
  }

  if (!Array.isArray(payload.warnings) || payload.warnings.some((item) => typeof item !== "string")) {
    return { ok: false, reason: "warnings must be a string array" };
  }

  return { ok: true, evidence: payload as HostedPaperTenantBoundaryEvidence };
}

function validateSession(payload: unknown): { ok: true } | { ok: false; reason: string } {
  if (!isRecord(payload)) {
    return { ok: false, reason: "session object is required" };
  }
  if (payload.authenticated !== false) {
    return { ok: false, reason: "session.authenticated must be false" };
  }
  if (payload.authentication_provider !== "none") {
    return { ok: false, reason: "session.authentication_provider must be none" };
  }
  for (const field of ["user_id", "session_id", "authentication_mode"] as const) {
    if (!isNonEmptyString(payload[field])) {
      return { ok: false, reason: `session.${field} is required` };
    }
  }
  return { ok: true };
}

function validateTenant(payload: unknown): { ok: true } | { ok: false; reason: string } {
  if (!isRecord(payload)) {
    return { ok: false, reason: "tenant object is required" };
  }
  if (payload.tenant_id !== "mock-tenant-paper-evaluation") {
    return { ok: false, reason: "tenant.tenant_id must be the mock tenant" };
  }
  if (payload.tenant_mode !== "paper_only_mock") {
    return { ok: false, reason: "tenant.tenant_mode must be paper_only_mock" };
  }
  const tenantFlags = {
    tenant_isolation_required: true,
    hosted_datastore_enabled: false,
    local_sqlite_access: false,
    live_trading_enabled: false,
  } as const;
  for (const [flag, expected] of Object.entries(tenantFlags)) {
    if (payload[flag] !== expected) {
      return { ok: false, reason: `tenant.${flag} must be ${String(expected)}` };
    }
  }
  if (payload.broker_provider !== "paper") {
    return { ok: false, reason: "tenant.broker_provider must be paper" };
  }
  return { ok: true };
}

function validateBoundaryAssertions(
  payload: unknown,
): { ok: true } | { ok: false; reason: string } {
  if (!isRecord(payload)) {
    return { ok: false, reason: "boundary_assertions object is required" };
  }
  const assertions = {
    hosted_paper_mode_enabled: false,
    mock_read_only: true,
    authenticated: false,
    session_cookie_issued: false,
    tenant_isolation_required: true,
    hosted_datastore_enabled: false,
    hosted_datastore_written: false,
    local_sqlite_access: false,
    broker_api_called: false,
    credentials_collected: false,
    broker_credentials_collected: false,
    live_trading_enabled: false,
    production_trading_ready: false,
    mutation_permissions_granted: false,
  } as const;
  for (const [field, expected] of Object.entries(assertions)) {
    if (payload[field] !== expected) {
      return {
        ok: false,
        reason: `boundary_assertions.${field} must be ${String(expected)}`,
      };
    }
  }
  if (payload.authentication_provider !== "none") {
    return {
      ok: false,
      reason: "boundary_assertions.authentication_provider must be none",
    };
  }
  if (payload.broker_provider !== "paper") {
    return { ok: false, reason: "boundary_assertions.broker_provider must be paper" };
  }
  return { ok: true };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "n/a"}</dd>
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSafeEvidenceFlag(key: string, value: unknown): boolean {
  if (key === "paper_only" || key === "read_only") {
    return value === true;
  }
  if (key === "broker_provider") {
    return value === "paper";
  }
  return value === false;
}

function isSafeBoundaryAssertion(key: string, value: unknown): boolean {
  if (key === "mock_read_only" || key === "tenant_isolation_required") {
    return value === true;
  }
  if (key === "authentication_provider") {
    return value === "none";
  }
  if (key === "broker_provider") {
    return value === "paper";
  }
  return value === false;
}
