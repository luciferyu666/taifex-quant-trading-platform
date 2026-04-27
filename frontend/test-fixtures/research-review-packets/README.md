# Research Review Packet Loader Fixtures

These small JSON files are manual safety test fixtures for the Web Command Center
Research Review Packet local JSON loader.

They are local-only browser input samples:

- They are not uploaded by the frontend.
- They must not contain secrets, broker credentials, account IDs, certificates, or
  tokens.
- They must not be treated as database records, approval records, execution
  instructions, rankings, recommendations, or performance reports.

## Fixture Matrix

| File | Expected loader result | Purpose |
| --- | --- | --- |
| `valid.sample.json` | Accept | Safe packet generated from the SDK sample exporter. |
| `invalid-live-approval.json` | Reject | Verifies `approval_for_live=true` is blocked. |
| `invalid-execution-eligible.json` | Reject | Verifies `execution_eligible=true` is blocked. |
| `invalid-performance-claim.json` | Reject | Verifies `performance_claim=true` is blocked. |
| `invalid-checksum.json` | Reject | Verifies invalid SHA-256 checksum formatting is blocked. |
| `invalid-decision-summary.json` | Reject | Verifies decision summary counts must equal `decision_count`. |

## Manual UI Check

1. Start the frontend.
2. Open the Web Command Center page.
3. Use the local JSON loader.
4. Select `valid.sample.json`; it should render the packet viewer.
5. Select each `invalid-*.json`; each should show a rejection reason and must not
   update the displayed packet.

## CLI Check

```bash
node --experimental-strip-types frontend/scripts/validate-research-review-packet-fixtures.mjs
```

The CLI mirrors the current loader safety checks and is included in `make check`.
The CLI imports `frontend/app/components/researchReviewPacketValidation.ts`, the
same pure validation function used by the React loader component, so fixture
checks and UI checks do not drift apart.
