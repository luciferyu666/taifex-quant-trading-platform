import type { ResearchReviewPacket } from "./ResearchReviewPacketPanel";

type ValidationResult =
  | { ok: true; packet: ResearchReviewPacket }
  | { ok: false; reason: string };

const expectedSafetyFlags = {
  research_only: true,
  execution_eligible: false,
  order_created: false,
  broker_api_called: false,
  risk_engine_called: false,
  oms_called: false,
  performance_claim: false,
  simulated_metrics_only: true,
  external_data_downloaded: false,
  ranking_generated: false,
  best_strategy_selected: false,
  approval_for_live: false,
  approval_for_paper_execution: false,
  persisted: false,
} as const;

export function validateResearchReviewPacket(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, reason: "packet payload must be a JSON object" };
  }

  const stringFields = [
    "packet_id",
    "packet_label",
    "review_queue_id",
    "decision_index_id",
    "reproducibility_hash",
  ] as const;
  for (const field of stringFields) {
    if (!isNonEmptyString(payload[field])) {
      return { ok: false, reason: `${field} is required` };
    }
  }

  const bundleCount = payload.bundle_count;
  const decisionCount = payload.decision_count;
  if (!isPositiveInteger(bundleCount)) {
    return { ok: false, reason: "bundle_count must be a positive integer" };
  }
  if (!isPositiveInteger(decisionCount)) {
    return { ok: false, reason: "decision_count must be a positive integer" };
  }

  const summary = payload.decision_summary;
  if (!isRecord(summary)) {
    return { ok: false, reason: "decision_summary is required" };
  }

  const rejected = numberField(summary.rejected_count);
  const needsDataReview = numberField(summary.needs_data_review_count);
  const paperResearch = numberField(summary.approved_for_paper_research_count);
  if (rejected === null || needsDataReview === null || paperResearch === null) {
    return { ok: false, reason: "decision_summary counts must be numbers" };
  }
  if (rejected + needsDataReview + paperResearch !== decisionCount) {
    return {
      ok: false,
      reason: "decision_summary counts must equal decision_count",
    };
  }

  const includedSections = stringArray(payload.included_sections);
  if (!includedSections) {
    return { ok: false, reason: "included_sections must be a string array" };
  }
  for (const section of ["review_queue", "decisions", "decision_index"]) {
    if (!includedSections.includes(section)) {
      return { ok: false, reason: `included_sections missing ${section}` };
    }
  }

  const checksums = payload.checksums;
  if (!isRecord(checksums)) {
    return { ok: false, reason: "checksums object is required" };
  }
  for (const checksumField of [
    "queue_checksum",
    "index_checksum",
    "packet_checksum",
  ] as const) {
    if (!isSha256Digest(checksums[checksumField])) {
      return { ok: false, reason: `${checksumField} must be a SHA-256 digest` };
    }
  }
  const decisionChecksums = stringArray(checksums.decision_checksums);
  if (!decisionChecksums) {
    return { ok: false, reason: "decision_checksums must be a string array" };
  }
  if (decisionChecksums.length !== decisionCount) {
    return {
      ok: false,
      reason: "decision_checksums length must equal decision_count",
    };
  }
  if (decisionChecksums.some((checksum) => !isSha256Digest(checksum))) {
    return { ok: false, reason: "decision_checksums must be SHA-256 digests" };
  }

  if (!isSha256Digest(payload.reproducibility_hash)) {
    return {
      ok: false,
      reason: "reproducibility_hash must be a SHA-256 digest",
    };
  }

  const warnings = stringArray(payload.warnings);
  if (!warnings) {
    return { ok: false, reason: "warnings must be a string array" };
  }

  for (const [flag, expected] of Object.entries(expectedSafetyFlags)) {
    if (payload[flag] !== expected) {
      return {
        ok: false,
        reason: `${flag} must be ${String(expected)} for read-only review`,
      };
    }
  }

  return {
    ok: true,
    packet: payload as ResearchReviewPacket,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function numberField(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }
  return value;
}

function isSha256Digest(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length === 64 &&
    /^[a-f0-9]+$/.test(value)
  );
}
