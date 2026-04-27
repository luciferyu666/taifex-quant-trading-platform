import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateResearchReviewPacket } from "../app/components/researchReviewPacketValidation.ts";

const fixtureDir = "frontend/test-fixtures/research-review-packets";
const expectedResults = {
  "valid.sample.json": { ok: true },
  "invalid-live-approval.json": {
    ok: false,
    reasonIncludes: "approval_for_live must be false",
  },
  "invalid-execution-eligible.json": {
    ok: false,
    reasonIncludes: "execution_eligible must be false",
  },
  "invalid-performance-claim.json": {
    ok: false,
    reasonIncludes: "performance_claim must be false",
  },
  "invalid-checksum.json": {
    ok: false,
    reasonIncludes: "packet_checksum must be a SHA-256 digest",
  },
  "invalid-decision-summary.json": {
    ok: false,
    reasonIncludes: "decision_summary counts must equal decision_count",
  },
};

let failures = 0;

for (const [fileName, expected] of Object.entries(expectedResults)) {
  const payload = JSON.parse(readFileSync(join(fixtureDir, fileName), "utf8"));
  const result = validateResearchReviewPacket(payload);
  if (result.ok !== expected.ok) {
    console.error(
      `${fileName}: expected ok=${expected.ok}, received ok=${result.ok}`,
    );
    failures += 1;
    continue;
  }
  if (!expected.ok && !result.reason.includes(expected.reasonIncludes)) {
    console.error(
      `${fileName}: expected reason containing "${expected.reasonIncludes}", received "${result.reason}"`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log("Research Review Packet loader fixtures OK.");
