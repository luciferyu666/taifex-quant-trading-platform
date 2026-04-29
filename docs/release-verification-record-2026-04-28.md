# Release Verification Record - 2026-04-28

## Purpose

This record captures the verification trail for the paper-first release baseline after release observability was added to the repository. It documents the exact commit, CI run, Vercel production alias, production smoke gate, safety defaults, and local git state used for this verification.

This is not a production trading certification. It verifies presentation, internal demo, and paper research preview readiness only.

## Verification Summary

| Item | Result |
| --- | --- |
| Verification time | 2026-04-28 12:02:20 CST (+0800) |
| Branch | `main` |
| Commit | `31a1d03` (`31a1d0385ac1085c02828c5c9670b629b3cebb4a`) |
| Baseline tag | `v0.1.0-paper-research-preview` |
| GitHub Actions workflow | `Release Readiness` |
| GitHub Actions run | `25032257263` |
| GitHub Actions status | `success` |
| Node 20 runtime deprecation scan | No Node 20 runtime deprecation warnings found |
| Web Command Center production alias | <https://taifex-quant-trading-platform-front.vercel.app> |
| Web Command Center deployment URL | <https://taifex-quant-trading-platform-frontend-9w4xx0gbb.vercel.app> |
| Web Command Center deployment id | `dpl_31xcqJDCChD3GCh2WQosLAvG9aQ5` |
| Web Command Center deployment status | `Ready` |
| Marketing Website URL | <https://taifex-quant-trading-platform-websi.vercel.app> |
| Marketing Website HTTP check | `HTTP/2 200` |
| Local git state after verification | clean: `## main...origin/main` |

## Release Level

| Surface | Verified release level |
| --- | --- |
| Marketing Website | External presentation candidate |
| Web Command Center | Internal demo candidate |
| Paper Research Preview | Internal technical preview |
| Production Trading Platform | **NOT READY** |

The platform remains paper-first. Live trading is not enabled by this release record.

## GitHub Actions Verification

Command:

```bash
gh run view 25032257263 --json conclusion,status,displayTitle,headSha,url,createdAt,updatedAt,event,workflowName
```

Observed result:

```text
workflowName: Release Readiness
displayTitle: Add release baseline observability
event: push
status: completed
conclusion: success
headSha: 31a1d0385ac1085c02828c5c9670b629b3cebb4a
createdAt: 2026-04-28T03:27:54Z
updatedAt: 2026-04-28T03:29:22Z
url: https://github.com/luciferyu666/taifex-quant-trading-platform/actions/runs/25032257263
```

Node runtime compatibility scan:

```bash
gh run view 25032257263 --log | rg -i "node\\.js 20|node 20|node20|deprecated"
```

Observed result:

```text
No Node 20 runtime deprecation warnings found in Release Readiness run 25032257263.
```

## Vercel Production Alias Verification

Command:

```bash
cd "/mnt/f/From C download/taifex-quant-trading-platform/frontend"
vercel inspect https://taifex-quant-trading-platform-front.vercel.app
```

Observed result:

```text
id: dpl_31xcqJDCChD3GCh2WQosLAvG9aQ5
name: taifex-quant-trading-platform-frontend
target: production
status: Ready
url: https://taifex-quant-trading-platform-frontend-9w4xx0gbb.vercel.app
alias: https://taifex-quant-trading-platform-front.vercel.app
created: Tue Apr 28 2026 11:27:54 GMT+0800
```

## Production Smoke Gate Verification

Command:

```bash
make frontend-production-smoke-check
```

Observed result:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_31xcqJDCChD3GCh2WQosLAvG9aQ5.
```

Safety copy confirmed present:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

Unsafe copy confirmed absent:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

## Latest Vercel Deployment Refresh

After this verification record was committed, the docs-only push triggered a new Web Command Center production deployment. The production alias was re-checked and the smoke gate passed again.

Refresh time:

```text
2026-04-28 15:30:47 CST (+0800)
```

Refresh commit:

```text
ab5a0b9 Add release verification record
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-ooh2p1sux.vercel.app
id: dpl_AKK12hZGX64X6GgJnMZdLUenvCFe
target: production
status: Ready
created: Tue Apr 28 2026 13:14:03 GMT+0800
```

Production smoke gate refresh:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_AKK12hZGX64X6GgJnMZdLUenvCFe.
```

The refreshed smoke gate again confirmed:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

The refreshed smoke gate again rejected unsafe copy:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

Local state after refresh:

```text
## main...origin/main
```

## Customer Evaluation Package Deployment Refresh

After the Customer Evaluation Package was added, the `main` push triggered a new `Release Readiness` run and a new Web Command Center production deployment. The production alias was re-checked and the automated production smoke gate passed.

Refresh time:

```text
2026-04-28 17:04:19 CST (+0800)
```

Refresh commit:

```text
e1b8e2c Add customer evaluation package
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25042567193
event: push
branch: main
status: completed
conclusion: success
duration: 1m35s
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-7mx68kwgf.vercel.app
id: dpl_G79T1Bm4oqgA134v2boGVMtsrb9p
target: production
status: Ready
created: Tue Apr 28 2026 16:33:29 GMT+0800
```

Production smoke gate refresh:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_G79T1Bm4oqgA134v2boGVMtsrb9p.
```

The refreshed smoke gate confirmed:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

The refreshed smoke gate rejected unsafe copy:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

Customer evaluation package status:

```text
Customer evaluation docs and demo workflow are now versioned on main.
Customer testing is limited to marketing review, read-only Web Command Center review, local JSON artifact review, checklist completion, and feedback capture.
Customer testing does not include live trading, paper execution approval, broker connectivity, account onboarding, or regulated investment advice.
```

Local state after refresh:

```text
## main...origin/main
```

## Paper Execution Approval Workflow Deployment Refresh

After the Paper Execution Approval Workflow was added, the `main` push triggered a
new `Release Readiness` run and a new Web Command Center production deployment. The
production alias was re-checked and the automated production smoke gate passed.

Refresh time:

```text
2026-04-28 20:41:00 CST (+0800)
```

Refresh commit:

```text
db65ce6 Add paper execution approval workflow
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25052491609
event: push
branch: main
status: completed
conclusion: success
duration: 1m19s
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-lq2i461uc.vercel.app
id: dpl_BLY1Uh8c3LKLMaDjsRcaS3cNekfg
target: production
status: Ready
created: Tue Apr 28 2026 20:21:49 GMT+0800
```

Production smoke gate refresh:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_BLY1Uh8c3LKLMaDjsRcaS3cNekfg.
```

The refreshed smoke gate confirmed:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

The refreshed smoke gate rejected unsafe copy:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

Paper execution workflow status:

```text
Paper execution approval workflow is now versioned on main.
StrategySignal remains signal-only.
PaperOrderIntent can be created only by the platform after approved_for_paper_simulation.
Paper order simulation must pass through Risk Engine, OMS, Paper Broker Gateway, and audit events.
Web Command Center shows the workflow as Paper Only and read-only.
No live trading controls, real broker adapters, broker SDK calls, or real orders were added.
```

Local state after refresh:

```text
## main...origin/main
```

## Paper Execution Verification Docs Deployment Refresh

After the paper execution verification record was committed, the docs-only push
triggered another Web Command Center production deployment. The production alias was
re-checked and the automated smoke gate passed again.

Refresh time:

```text
2026-04-28 21:11:55 CST (+0800)
```

Refresh commit:

```text
80ec04a Update release verification for paper execution workflow
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25053655899
event: push
branch: main
status: completed
conclusion: success
duration: 1m20s
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-k6mno0udh.vercel.app
id: dpl_677MFAp3YEqpQwjMUxPyWxpsbhtv
target: production
status: Ready
created: Tue Apr 28 2026 20:47:13 GMT+0800
```

Production smoke gate refresh:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_677MFAp3YEqpQwjMUxPyWxpsbhtv.
```

The refreshed smoke gate confirmed:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

The refreshed smoke gate rejected unsafe copy:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

Local state after refresh:

```text
## main...origin/main
```

## Paper OMS / Audit Persistence Verification

The paper OMS/audit persistence slice was committed to `main`, verified by GitHub
Actions, deployed through the Web Command Center Vercel project, and rechecked with
the production smoke gate.

Verification time:

```text
2026-04-29 03:35 CST (+0800)
```

Verified commit:

```text
98818e7 Add paper OMS audit persistence
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25072918221
event: push
branch: main
status: completed
conclusion: success
duration: 1m23s
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-3v5nbuz72.vercel.app
id: dpl_2ynQnfSEUipSMJPs1UWZnss3RK8m
target: production
status: Ready
created: Wed Apr 29 2026 03:20:39 GMT+0800
```

Production smoke gate:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_2ynQnfSEUipSMJPs1UWZnss3RK8m.
```

The smoke gate confirmed:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

The smoke gate rejected unsafe copy:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

Paper persistence scope:

```text
Paper OMS/audit persistence is local SQLite only.
Default path: data/paper_execution_audit.sqlite
The `.sqlite` output remains ignored by git.
The persistence store records paper workflow metadata, OMS events, and audit events.
It is not production OMS storage.
It does not call broker SDKs.
It does not place real orders.
Live trading remains disabled by default.
```

Local state before updating this record:

```text
## main...origin/main
```

## Paper OMS / Audit Query Viewer Verification

The read-only Paper OMS / Audit Query Viewer was committed to `main`, verified by
GitHub Actions, deployed through the Web Command Center Vercel project, and rechecked
with the production smoke gate.

Verification time:

```text
2026-04-29 04:35 CST (+0800)
```

Verified commit:

```text
d82d92a Add paper OMS audit query viewer
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25075703161
event: push
branch: main
status: completed
conclusion: success
duration: 1m58s
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-1vagq7bt7.vercel.app
id: dpl_266tooQTqognbN7sNoJVQsfan7ht
target: production
status: Ready
created: Wed Apr 29 2026 04:22:08 GMT+0800
```

Production smoke gate:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_266tooQTqognbN7sNoJVQsfan7ht.
```

The smoke gate confirmed:

- `TRADING_MODE`
- `ENABLE_LIVE_TRADING`
- `BROKER_PROVIDER`
- `NOT READY`
- `實盤關閉`
- `僅限紙上交易`
- `Paper-first`
- `Paper Only`

The smoke gate rejected unsafe copy:

- `guaranteed profit`
- `risk-free`
- `保證獲利`
- `零風險`
- unsafe `approve live`
- unsafe `核准實盤`

Viewer scope:

```text
The Paper OMS / Audit Query Viewer is read-only.
It displays persisted paper workflow run summaries, OMS timeline, and audit timeline.
It uses existing query APIs only.
It does not call /api/paper-execution/workflow/record.
It does not add simulation submit controls.
It does not add approval escalation.
It does not add live controls.
It does not call broker SDKs.
It does not write databases.
It does not modify persisted records.
Live trading remains disabled by default.
```

Local state before updating this record:

```text
## main...origin/main
```

## Paper Execution Demo Seed Verification

Commit:

```text
16a8930 Add paper execution demo seed
```

Release Readiness CI:

```text
run id: 25081314261
status: completed / success
workflow: Release Readiness
branch: main
event: push
created: 2026-04-28T22:38:29Z
```

Vercel production deployment:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
deployment url: https://taifex-quant-trading-platform-frontend-ea6550vb0.vercel.app
deployment id: dpl_DSms6389h5AUeqPrdPzDwC2q1qT6
target: production
status: Ready
created: Wed Apr 29 2026 06:38:29 GMT+0800
```

Production smoke gate:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_DSms6389h5AUeqPrdPzDwC2q1qT6.
```

Demo seed command:

```bash
make seed-paper-execution-demo
```

Observed result:

```text
workflow_run_id=paper-workflow-d7b2ac8fefc1163b
order_id=paper-order-3cf67787047bb55d
final_oms_status=PARTIALLY_FILLED
paper_only=True
live_trading_enabled=False
broker_api_called=False
```

Persistence validation:

```text
make paper-execution-persistence-check
10 passed
```

Seed scope:

- Explicit local command only.
- Local SQLite only via `PAPER_EXECUTION_AUDIT_DB_PATH`.
- No FastAPI server call.
- No broker API or broker SDK call.
- No external database write.
- No real order submission.
- Local `data/` runtime output remains ignored by git.
- Live trading remains disabled by default.

## Safe Read-Only Command Center Interactions Verification

The safe read-only interaction layer was committed to `main`, verified by GitHub
Actions, deployed through the Web Command Center Vercel project, and rechecked with
the production smoke gate.

Verification time:

```text
2026-04-29 07:49 CST (+0800)
```

Verified commit:

```text
7bcab7e Add safe read-only Command Center interactions
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25083369825
event: push
branch: main
status: completed
conclusion: success
duration: 1m33s
created: 2026-04-28T23:41:09Z
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-8jlkrff1a.vercel.app
id: dpl_2fjXS229uhHM8CncXc1GZ7wvJTNm
target: production
status: Ready
created: Wed Apr 29 2026 07:41:08 GMT+0800
```

Production smoke gate:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_2fjXS229uhHM8CncXc1GZ7wvJTNm.
```

Interaction scope:

- Tabs for Release, Paper OMS, Research Packet, and Contracts.
- Refresh/retry status.
- Paper run row selection.
- Read-only OMS and audit timeline reload.
- Clipboard copy for `workflow_run_id`, `order_id`, and the local demo seed command.
- Bundled safe Research Review Packet sample load.
- Clear selected local JSON.
- Backend-unavailable troubleshooting panel.

Safety scope:

- Mutation endpoints: none.
- Broker SDK calls: none.
- Database writes: none.
- Order creation: none.
- Paper execution approval escalation: none.
- Live approval controls: none.
- Credential collection: none.
- Live trading remains disabled by default.

## Customer Demo Guided Flow Verification

The Customer Demo Guided Flow was committed to `main`, verified by GitHub Actions,
deployed through the Web Command Center Vercel project, and rechecked with the
production smoke gate.

Verification time:

```text
2026-04-29 10:37 CST (+0800)
```

Verified commit:

```text
61ce678 Add customer demo guided flow
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25087844047
event: push
branch: main
status: completed
conclusion: success
duration: 1m25s
created: 2026-04-29T02:24:51Z
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-3qu680z7h.vercel.app
id: dpl_6BgWm4KLx5cQBtJiX6u2Z1ZgzLym
target: production
status: Ready
created: Wed Apr 29 2026 10:24:50 GMT+0800
```

Production smoke gate:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_6BgWm4KLx5cQBtJiX6u2Z1ZgzLym.
```

Guided flow scope:

- Seven-step customer demo tour.
- Bilingual English and Traditional Chinese guide copy.
- Previous / Next / Reset / Copy checklist controls.
- Release, safety default, paper OMS, audit record, research packet, contract spec,
  and prohibited-action walkthrough.
- Prohibited-action list for live trading, broker login, real orders, credential
  upload, customer onboarding, and trading recommendations.

Safety scope:

- Read-only UI behavior only.
- Backend mutation endpoints: none.
- Order submission: none.
- Broker SDK calls: none.
- Database writes: none.
- File uploads: none.
- Credential collection: none.
- Paper execution approval escalation: none.
- Live approval controls: none.
- Production trading readiness claim: none.
- Live trading remains disabled by default.

## Customer Demo UI Smoke Test Verification

The Customer Demo UI Smoke Test was committed to `main`, verified by GitHub
Actions, deployed through the Web Command Center Vercel project, and rechecked
against the production alias.

Verification time:

```text
2026-04-29 11:03 CST (+0800)
```

Verified commit:

```text
1c77a64 Add customer demo UI smoke test
```

GitHub Actions verification:

```text
workflow: Release Readiness
run: 25088717366
event: push
branch: main
status: completed
conclusion: success
duration: 1m35s
created: 2026-04-29T03:00:24Z
```

Production alias inspection:

```text
alias: https://taifex-quant-trading-platform-front.vercel.app
url: https://taifex-quant-trading-platform-frontend-ioem9dla9.vercel.app
id: dpl_DJUQLTvNDvHH1o7pFSGwF41WBomC
target: production
status: Ready
created: Wed Apr 29 2026 11:00:25 GMT+0800
```

Customer demo UI smoke gate:

```text
Customer Demo UI smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_DJUQLTvNDvHH1o7pFSGwF41WBomC.
English and Traditional Chinese demo guide steps are present.
Previous / Next / Reset / Copy checklist controls are present.
Release / Paper OMS / Research Packet / Contracts tabs are present.
Prohibited-action lists are present.
```

Production safety smoke gate:

```text
Production Command Center smoke check passed.
Production root returned HTTP 200.
Traditional Chinese page returned HTTP 200.
English page returned HTTP 200.
All checked pages use deployment id dpl_DJUQLTvNDvHH1o7pFSGwF41WBomC.
Safety copy includes TRADING_MODE, ENABLE_LIVE_TRADING, BROKER_PROVIDER,
NOT READY, Paper Only, 實盤關閉, and 僅限紙上交易.
```

Smoke test scope:

- Production URL HTTP 200 checks.
- Vercel deployment id marker checks.
- Customer Demo Guided Flow / 客戶測試導覽流程 presence checks.
- Seven English and seven Traditional Chinese demo step checks.
- Previous / Next / Reset / Copy checklist control checks.
- Release / Paper OMS / Research Packet / Contracts tab copy checks.
- Prohibited-action list checks.
- Prohibited claim checks for guaranteed profit, risk-free, 保證獲利, and 零風險.
- Unsafe live-approval wording checks for approve live and 核准實盤.

Safety scope:

- HTML-level read-only production smoke check only.
- Browser automation: none.
- Backend mutation endpoints: none.
- Order submission: none.
- Broker SDK calls: none.
- Database writes: none.
- File uploads: none.
- Credential collection: none.
- Paper execution approval escalation: none.
- Live approval controls: none.
- Live trading remains disabled by default.

## Controlled Paper Simulation Submit UI Verification

The controlled Paper Only submit UI was committed to `main`, verified by GitHub
Actions, deployed by Vercel, and checked by the production safety gates.

Commit:

```text
b7defa1 Add controlled paper simulation submit UI
```

GitHub Actions:

```text
Workflow: Release Readiness
Run ID: 25092584967
Status: passed
```

Vercel deployment:

```text
Deployment URL: https://taifex-quant-trading-platform-frontend-dl568pu1x.vercel.app
Deployment ID: dpl_C85JA4sQz2KrYpqrp35esq2PeANJ
Production alias: https://taifex-quant-trading-platform-front.vercel.app
Status: Ready
```

Production smoke gate:

```text
make frontend-production-smoke-check
make customer-demo-ui-smoke-check
```

Observed result:

```text
Both production smoke gates passed.
All checked pages use deployment id dpl_C85JA4sQz2KrYpqrp35esq2PeANJ.
Safety copy includes TRADING_MODE, ENABLE_LIVE_TRADING, BROKER_PROVIDER,
NOT READY, Paper Only, 實盤關閉, and 僅限紙上交易.
```

Controlled submit scope:

- UI is labeled Paper Only.
- The UI calls only `POST /api/paper-execution/workflow/record`.
- `StrategySignal` remains signal-only.
- Initial approval handling was fixed to `approved_for_paper_simulation`; this
  was later superseded by the persisted `approval_request_id` requirement below.
- No live approval control is present.
- No broker credentials are collected.
- No broker SDK calls are made.
- No real order path is added.
- Backend CORS allows the Command Center origin without credentials.
- Persistence remains local paper OMS / audit storage only.
- Live trading remains disabled by default.

## Persisted Approval Requirement Verification

The Paper Only submit path was upgraded so controlled paper execution must
reference a persisted `approval_request_id` whose local approval history has
completed the required review sequence and reached
`approved_for_paper_simulation`.

Commit:

```text
afa3d3d Require persisted approval for paper submit
```

GitHub Actions:

```text
Workflow: Release Readiness
Run ID: 25105951074
Status: passed
```

Vercel deployment:

```text
Deployment URL: https://taifex-quant-trading-platform-frontend-5kzx9zupr.vercel.app
Deployment ID: dpl_HjGNgwBurDowigTJikAxy5328YzL
Production alias: https://taifex-quant-trading-platform-front.vercel.app
Status: Ready
```

Validation commands:

```bash
make paper-simulation-submit-check
make paper-approval-workflow-check
make paper-execution-persistence-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make check
make frontend-production-smoke-check
make customer-demo-ui-smoke-check
```

Observed result:

```text
All listed checks passed. Production smoke gates confirmed deployment id
dpl_HjGNgwBurDowigTJikAxy5328YzL and required safety copy on English and
Traditional Chinese pages.
```

Persisted approval scope:

- `POST /api/paper-execution/workflow/preview` and `/record` now load approval
  history from the local paper approval store.
- Paper submit requests must include `approval_request_id`.
- Client-supplied `approval_decision`, `reviewer_id`, and `approval_reason` are
  no longer accepted as the source of paper execution authority.
- Backend verifies the required approval sequence, distinct persisted decisions,
  paper-only flags, no live approval, no broker API call, and signal identity
  consistency before creating a paper order intent.
- The Web Command Center submit UI only uses approved approval histories and
  submits the persisted approval request reference.
- Demo seed and submit verification scripts create local approval requests and
  decisions before creating a paper workflow record.
- Persistence remains local SQLite only.
- No broker SDK calls, credential collection, real orders, or live trading path
  were added.

## Paper Approval Decision UI Verification

The Web Command Center now includes a narrow paper-only reviewer decision form for
existing approval requests. This UI records local reviewer decisions only; it does
not create approval requests, create paper simulations, call brokers, collect
credentials, or grant live-trading access.

Commit:

```text
760fd77 Add paper approval decision UI
```

GitHub Actions:

```text
Workflow: Release Readiness
Run ID: 25108010416
Status: passed
```

Vercel deployment:

```text
Deployment URL: https://taifex-quant-trading-platform-frontend-d4u3kvgqr.vercel.app
Deployment ID: dpl_F6GNqokYf1j1fknN2FSfsXJPBwDB
Production alias: https://taifex-quant-trading-platform-front.vercel.app
Status: Ready
```

Validation commands:

```bash
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make paper-approval-workflow-check
make check
make frontend-production-smoke-check
```

Observed result:

```text
All listed checks passed. Production smoke gate confirmed deployment id
dpl_F6GNqokYf1j1fknN2FSfsXJPBwDB and required safety copy on English and
Traditional Chinese pages.
```

Decision UI scope:

- The UI selects an existing local approval request from the pending queue.
- It may submit only `research_approved`, `approved_for_paper_simulation`,
  `rejected`, or `needs_data_review`.
- It sends `paper_only=true` to the existing paper approval decision endpoint.
- It does not create approval requests.
- It does not create paper simulations, order intents, OMS records, or broker
  gateway calls.
- It does not collect API keys, account IDs, certificates, broker credentials, or
  customer financial data.
- It does not expose live approval or production authorization controls.

## Paper Approval Request UI Verification

Verification date: 2026-04-29

Commit:

```text
b23febf Add paper approval request UI
```

GitHub Actions:

```text
Workflow: Release Readiness
Run ID: 25109530007
Status: passed
```

Vercel deployment:

```text
Deployment URL: https://taifex-quant-trading-platform-frontend-jzdyjuhfc.vercel.app
Deployment ID: dpl_9ooYPH9s6Z83rWknJ4SPe99WjRrR
Production alias: https://taifex-quant-trading-platform-front.vercel.app
Status: Ready
```

Validation commands:

```bash
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make paper-approval-workflow-check
make paper-simulation-submit-check
make check
make frontend-production-smoke-check
```

Observed result:

```text
All listed checks passed. Production smoke gate confirmed deployment id
dpl_9ooYPH9s6Z83rWknJ4SPe99WjRrR and required safety copy on English and
Traditional Chinese pages.
```

Request UI scope:

- The UI creates one local Paper Only approval request through
  `POST /api/paper-execution/approvals/requests`.
- New requests start at `pending_review`.
- The request payload contains a signals-only `StrategySignal` and
  `paper_only=true`.
- The UI refreshes server-rendered approval queue/history data after request
  creation.
- It does not create reviewer decisions, paper simulations, order intents, OMS
  records, Risk Engine calls, Broker Gateway calls, broker connections,
  credential flows, account login, or live approval.

## Paper Approval UI Flow Smoke Drill Verification

Commit:

```text
e5dcd3c Add paper approval UI flow smoke drill
```

GitHub Actions:

```text
Workflow: Release Readiness
Run ID: 25113343367
Status: passed
```

Vercel deployment:

```text
Deployment URL: https://taifex-quant-trading-platform-frontend-k9uqjei0k.vercel.app
Deployment ID: dpl_7Da8vcU9saD6spLnxQ2Zf8TbWpFm
Production alias: https://taifex-quant-trading-platform-front.vercel.app
Status: Ready
```

Validation commands:

```bash
make paper-approval-ui-flow-smoke-check
make frontend-i18n-check
cd frontend && npm run typecheck
cd frontend && npm run build
make paper-approval-workflow-check
make paper-simulation-submit-check
make check
make frontend-production-smoke-check
```

Observed result:

```text
All listed checks passed. The local browser drill completed the full
Paper Approval Request -> research_approved decision ->
approved_for_paper_simulation decision -> Controlled Paper Submit ->
OMS/Audit Viewer path through the Web Command Center UI.
Production smoke gate confirmed deployment id dpl_7Da8vcU9saD6spLnxQ2Zf8TbWpFm
and required safety copy on English and Traditional Chinese pages.
```

UI drill scope:

- Starts a local FastAPI backend, local Next.js frontend, temporary local SQLite
  audit database, and headless browser.
- Creates a paper-only approval request from the Web UI.
- Records two reviewer decisions from the Web UI.
- Submits one controlled Paper Only simulation from the Web UI.
- Confirms persisted OMS and audit timelines are visible in the Web UI.
- Does not call a real broker, collect credentials, write external databases,
  enable live trading, or create real orders.

## Marketing Website Reachability

Command:

```bash
curl -I -L -s https://taifex-quant-trading-platform-websi.vercel.app/
```

Observed result:

```text
HTTP/2 200
server: Vercel
```

## Safety Defaults Verification

Command:

```bash
grep -n "TRADING_MODE=paper\|ENABLE_LIVE_TRADING=false\|BROKER_PROVIDER=paper" .env.example
```

Observed result:

```text
TRADING_MODE=paper
ENABLE_LIVE_TRADING=false
BROKER_PROVIDER=paper
```

## Git Clean State Verification

Command:

```bash
git status --short --branch
```

Observed result:

```text
## main...origin/main
```

## Safety Conclusion

- Live trading remains disabled by default.
- The Web Command Center remains paper-first. Most surfaces are read-only; the only controlled mutation is the Paper Only simulation submit path that calls `/api/paper-execution/workflow/record`.
- The release baseline is suitable for external presentation, internal demo, and paper research preview use.
- The repository is **not** ready for production trading, live execution, broker-connected trading, signal services, copy trading, managed accounts, or performance-based services.

## Next Verification Step

After this record is committed, run:

```bash
make release-readiness-check
make frontend-production-smoke-check
make check
git status --short --branch
```

Then confirm the resulting `Release Readiness` GitHub Actions run passes on `main`.
