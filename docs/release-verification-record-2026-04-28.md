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
- The Web Command Center remains read-only and paper-first.
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
