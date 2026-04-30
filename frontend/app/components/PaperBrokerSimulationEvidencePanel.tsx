"use client";

import { useState, type ChangeEvent } from "react";

import type { DashboardCopy } from "../i18n";

type BrokerSimulationSafetyFlags = {
  paper_only: boolean;
  live_trading_enabled: boolean;
  broker_api_called: boolean;
  external_market_data_downloaded: boolean;
  production_execution_model: boolean;
  database_written?: boolean;
  order_created?: boolean;
  risk_engine_called?: boolean;
  oms_called?: boolean;
  broker_credentials_collected?: boolean;
  investment_advice?: boolean;
};

type BrokerSimulationEvidenceInput = {
  symbol: "TX" | "MTX" | "TMF";
  side: "BUY" | "SELL";
  order_type: "MARKET" | "LIMIT";
  quantity: number;
  bid_price: number;
  ask_price: number;
  last_price: number;
  bid_size: number;
  ask_size: number;
  quote_age_seconds: number;
  liquidity_score: number;
  limit_price?: number | null;
  max_spread_points?: number;
  stale_quote_seconds?: number;
  tx_equivalent_exposure?: number;
  paper_only: boolean;
};

type BrokerSimulationEvidenceResult = {
  simulation_outcome: string;
  simulated_fill_quantity: number;
  simulated_fill_price: number | null;
  remaining_quantity: number;
  reason: string;
  reference_price?: number | null;
  requested_quantity?: number;
  spread_points?: number;
  available_size?: number;
  checks?: Record<string, boolean>;
  warnings?: string[];
};

type BrokerSimulationEvidence = {
  evidence_type: "paper_broker_simulation_preview_evidence";
  evidence_id: string;
  generated_at: string;
  input: BrokerSimulationEvidenceInput;
  result: BrokerSimulationEvidenceResult;
  safety_flags: BrokerSimulationSafetyFlags;
  warnings: string[];
  persisted?: boolean;
};

type ValidationResult =
  | { ok: true; evidence: BrokerSimulationEvidence }
  | { ok: false; reason: string };

const maxLocalEvidenceBytes = 500_000;

export function PaperBrokerSimulationEvidencePanel({ copy }: { copy: DashboardCopy }) {
  const labels = copy.paperBrokerEvidence;
  const [evidence, setEvidence] = useState<BrokerSimulationEvidence | null>(null);
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
      const validation = validatePaperBrokerSimulationEvidence(parsed);
      if (!validation.ok) {
        reject(`${labels.rejectPrefix}: ${validation.reason}`);
        return;
      }

      setEvidence(validation.evidence);
      setSourceLabel(`${labels.loadedPrefix}: ${file.name}`);
      setLoaderState("ok");
      setLoaderMessage(labels.loadedMessage);
    } catch (error) {
      reject(error instanceof Error ? `${labels.rejectPrefix}: ${error.message}` : labels.invalidJson);
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
      className="paper-evidence-section paper-broker-evidence-section"
      aria-labelledby="paper-broker-evidence-title"
    >
      <div className="paper-evidence-loader panel">
        <div>
          <p className="card-kicker">{labels.eyebrow}</p>
          <h2 id="paper-broker-evidence-title">{labels.title}</h2>
          <p>{labels.description}</p>
          <p>
            {labels.currentSource}: <strong>{sourceLabel}</strong>
          </p>
        </div>
        <label className="file-picker">
          <span>{labels.selectFile}</span>
          <input
            accept=".json,application/json"
            aria-describedby="paper-broker-evidence-loader-status"
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
          id="paper-broker-evidence-loader-status"
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
              <Detail label={labels.fields.persisted} value={String(Boolean(evidence.persisted))} />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.inputKicker}</p>
            <h3>{labels.inputTitle}</h3>
            <dl className="detail-list compact">
              <Detail label={labels.fields.symbol} value={evidence.input.symbol} />
              <Detail label={labels.fields.side} value={evidence.input.side} />
              <Detail label={labels.fields.orderType} value={evidence.input.order_type} />
              <Detail label={labels.fields.quantity} value={String(evidence.input.quantity)} />
              <Detail label={labels.fields.bidPrice} value={String(evidence.input.bid_price)} />
              <Detail label={labels.fields.askPrice} value={String(evidence.input.ask_price)} />
              <Detail label={labels.fields.lastPrice} value={String(evidence.input.last_price)} />
              <Detail label={labels.fields.bidSize} value={String(evidence.input.bid_size)} />
              <Detail label={labels.fields.askSize} value={String(evidence.input.ask_size)} />
              <Detail
                label={labels.fields.quoteAgeSeconds}
                value={String(evidence.input.quote_age_seconds)}
              />
              <Detail
                label={labels.fields.liquidityScore}
                value={String(evidence.input.liquidity_score)}
              />
            </dl>
          </article>

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.resultKicker}</p>
            <h3>{labels.resultTitle}</h3>
            <dl className="detail-list compact">
              <Detail
                label={labels.fields.simulationOutcome}
                value={evidence.result.simulation_outcome}
              />
              <Detail
                label={labels.fields.fillQuantity}
                value={String(evidence.result.simulated_fill_quantity)}
              />
              <Detail
                label={labels.fields.fillPrice}
                value={formatNullableNumber(evidence.result.simulated_fill_price, labels.none)}
              />
              <Detail
                label={labels.fields.remainingQuantity}
                value={String(evidence.result.remaining_quantity)}
              />
              <Detail
                label={labels.fields.referencePrice}
                value={formatNullableNumber(evidence.result.reference_price, labels.none)}
              />
              <Detail
                label={labels.fields.spreadPoints}
                value={formatOptionalNumber(evidence.result.spread_points, labels.none)}
              />
              <Detail
                label={labels.fields.availableSize}
                value={formatOptionalNumber(evidence.result.available_size, labels.none)}
              />
              <Detail label={labels.fields.reason} value={evidence.result.reason} />
            </dl>
          </article>

          <article className="paper-record-panel">
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

          <article className="paper-record-panel">
            <p className="card-kicker">{labels.checksKicker}</p>
            <h3>{labels.checksTitle}</h3>
            <div className="flag-grid">
              {Object.entries(evidence.result.checks ?? {}).map(([key, value]) => (
                <span className={value ? "flag ok" : "flag danger"} key={key}>
                  {key}
                  <strong>{String(value)}</strong>
                </span>
              ))}
            </div>
          </article>

          <article className="paper-record-panel paper-evidence-wide">
            <p className="card-kicker">{labels.warningsKicker}</p>
            <h3>{labels.warningsTitle}</h3>
            <ul className="warning-list">
              {[...evidence.warnings, ...(evidence.result.warnings ?? [])].map((warning) => (
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

function validatePaperBrokerSimulationEvidence(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, reason: "evidence payload must be a JSON object" };
  }
  if (payload.evidence_type !== "paper_broker_simulation_preview_evidence") {
    return {
      ok: false,
      reason: "evidence_type must be paper_broker_simulation_preview_evidence",
    };
  }
  if (!isNonEmptyString(payload.evidence_id)) {
    return { ok: false, reason: "evidence_id is required" };
  }
  if (!isNonEmptyString(payload.generated_at)) {
    return { ok: false, reason: "generated_at is required" };
  }
  if (!isRecord(payload.input)) {
    return { ok: false, reason: "input object is required" };
  }
  if (!validateEvidenceInput(payload.input)) {
    return { ok: false, reason: "input fields are incomplete or unsafe" };
  }
  if (!isRecord(payload.result)) {
    return { ok: false, reason: "result object is required" };
  }
  if (!validateEvidenceResult(payload.result)) {
    return { ok: false, reason: "result fields are incomplete" };
  }
  if (!isRecord(payload.safety_flags)) {
    return { ok: false, reason: "safety_flags object is required" };
  }

  const requiredFlags = {
    paper_only: true,
    live_trading_enabled: false,
    broker_api_called: false,
    external_market_data_downloaded: false,
    production_execution_model: false,
  } as const;
  for (const [flag, expected] of Object.entries(requiredFlags)) {
    if (payload.safety_flags[flag] !== expected) {
      return {
        ok: false,
        reason: `safety_flags.${flag} must be ${String(expected)}`,
      };
    }
  }

  for (const flag of [
    "database_written",
    "order_created",
    "risk_engine_called",
    "oms_called",
    "broker_credentials_collected",
  ] as const) {
    if (payload.safety_flags[flag] !== undefined && payload.safety_flags[flag] !== false) {
      return {
        ok: false,
        reason: `safety_flags.${flag} must be false when present`,
      };
    }
  }

  const warnings = payload.warnings;
  if (!Array.isArray(warnings) || warnings.some((item) => typeof item !== "string")) {
    return { ok: false, reason: "warnings must be a string array" };
  }

  return { ok: true, evidence: payload as BrokerSimulationEvidence };
}

function validateEvidenceInput(input: Record<string, unknown>): boolean {
  return (
    isOneOf(input.symbol, ["TX", "MTX", "TMF"]) &&
    isOneOf(input.side, ["BUY", "SELL"]) &&
    isOneOf(input.order_type, ["MARKET", "LIMIT"]) &&
    isPositiveInteger(input.quantity) &&
    isNumber(input.bid_price) &&
    isNumber(input.ask_price) &&
    isNumber(input.last_price) &&
    isNonNegativeInteger(input.bid_size) &&
    isNonNegativeInteger(input.ask_size) &&
    isNumber(input.quote_age_seconds) &&
    input.quote_age_seconds >= 0 &&
    isNumber(input.liquidity_score) &&
    input.liquidity_score >= 0 &&
    input.liquidity_score <= 1 &&
    input.paper_only === true
  );
}

function validateEvidenceResult(result: Record<string, unknown>): boolean {
  return (
    isNonEmptyString(result.simulation_outcome) &&
    isNonNegativeInteger(result.simulated_fill_quantity) &&
    (result.simulated_fill_price === null || isNumber(result.simulated_fill_price)) &&
    isNonNegativeInteger(result.remaining_quantity) &&
    isNonEmptyString(result.reason)
  );
}

function Detail({ label, value }: { label: string; value: string | undefined }) {
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

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function isSafeEvidenceFlag(key: string, value: unknown): boolean {
  if (key === "paper_only") {
    return value === true;
  }
  return value === false;
}

function formatNullableNumber(value: number | null | undefined, fallback: string): string {
  return typeof value === "number" ? String(value) : fallback;
}

function formatOptionalNumber(value: number | undefined, fallback: string): string {
  return typeof value === "number" ? String(value) : fallback;
}
