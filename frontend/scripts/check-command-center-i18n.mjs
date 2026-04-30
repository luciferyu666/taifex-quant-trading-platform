import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const files = {
  i18n: "frontend/app/i18n.ts",
  page: "frontend/app/page.tsx",
  demoGuide: "frontend/app/components/DemoGuidePanel.tsx",
  commandTabs: "frontend/app/components/CommandCenterTabs.tsx",
  paperApprovals: "frontend/app/components/PaperApprovalQueuePanel.tsx",
  paperApprovalRequest: "frontend/app/components/PaperApprovalRequestPanel.tsx",
  paperApprovalDecision: "frontend/app/components/PaperApprovalDecisionPanel.tsx",
  paperDemoEvidence: "frontend/app/components/PaperDemoEvidencePanel.tsx",
  paperBrokerEvidence: "frontend/app/components/PaperBrokerSimulationEvidencePanel.tsx",
  paperBrokerSimulation: "frontend/app/components/PaperBrokerSimulationModelPanel.tsx",
  paperRisk: "frontend/app/components/PaperRiskGuardrailsPanel.tsx",
  paperOmsReliability: "frontend/app/components/PaperOmsReliabilityPanel.tsx",
  paperRecords: "frontend/app/components/PaperExecutionRecordsPanel.tsx",
  paperSubmit: "frontend/app/components/PaperSimulationSubmitPanel.tsx",
  paperOmsTimeline: "frontend/app/components/PaperOmsTimelinePanel.tsx",
  paperAuditTimeline: "frontend/app/components/PaperAuditTimelinePanel.tsx",
  releasePanel: "frontend/app/components/ReleaseBaselinePanel.tsx",
  packetLoader: "frontend/app/components/ResearchReviewPacketJsonLoader.tsx",
  packetPanel: "frontend/app/components/ResearchReviewPacketPanel.tsx",
  safetyFlags: "frontend/app/components/SafetyFlagsPanel.tsx",
  decisionSummary: "frontend/app/components/DecisionSummaryPanel.tsx",
};

const sourceByFile = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [
    key,
    readFileSync(join(repoRoot, path), "utf8"),
  ]),
);

const combinedSource = Object.values(sourceByFile).join("\n");
const failures = [];
const passes = [];

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function requireContains(label, source, needle) {
  if (source.includes(needle)) {
    pass(label);
  } else {
    fail(`${label}: missing "${needle}"`);
  }
}

function requireAny(label, source, needles) {
  const found = needles.find((needle) => source.includes(needle));
  if (found) {
    pass(`${label}: found "${found}"`);
  } else {
    fail(`${label}: missing one of ${needles.map((needle) => `"${needle}"`).join(", ")}`);
  }
}

function requireNotContains(label, source, needle) {
  if (source.includes(needle)) {
    fail(`${label}: prohibited text found "${needle}"`);
  } else {
    pass(label);
  }
}

function scanForbiddenPatterns() {
  const alwaysForbidden = [
    "guaranteed profit",
    "risk-free",
    "fully automated money machine",
    "passive income",
    "guaranteed alpha",
    "principal guaranteed",
    "no loss",
    "保證獲利",
    "零風險",
    "穩賺",
    "保證 alpha",
    "本金保證",
    "不會虧損",
  ];

  for (const phrase of alwaysForbidden) {
    requireNotContains(`Forbidden claim scan for ${phrase}`, combinedSource.toLowerCase(), phrase);
  }

  const contextualForbidden = [
    {
      phrase: "approve live",
      allowedFragments: [
        "does not approve live",
        "not approve live",
        "never approve live",
        "no approve live",
      ],
    },
    {
      phrase: "approved for live",
      allowedFragments: [
        "not approved for live",
        "never approved for live",
      ],
    },
    {
      phrase: "live trading enabled",
      allowedFragments: [],
    },
    {
      phrase: "enable live trading",
      allowedFragments: [
        "do not enable live trading",
        "does not enable live trading",
        "never enable live trading",
      ],
    },
    {
      phrase: "核准實盤",
      allowedFragments: [
        "不核准實盤",
        "未核准實盤",
        "不會核准實盤",
        "禁止核准實盤",
      ],
    },
    {
      phrase: "批准實盤",
      allowedFragments: [
        "不批准實盤",
        "未批准實盤",
        "不會批准實盤",
        "禁止批准實盤",
      ],
    },
  ];

  for (const rule of contextualForbidden) {
    const offendingLines = combinedSource
      .split("\n")
      .map((line, index) => ({ line, index: index + 1, normalized: line.toLowerCase() }))
      .filter(({ line, normalized }) => {
        const haystack = /[\u3400-\u9fff]/.test(rule.phrase) ? line : normalized;
        if (!haystack.includes(rule.phrase)) {
          return false;
        }
        return !rule.allowedFragments.some((fragment) => haystack.includes(fragment));
      });

    if (offendingLines.length > 0) {
      fail(
        `Contextual forbidden phrase "${rule.phrase}" found without an explicit negative safety context: ${offendingLines
          .map(({ index }) => `line ${index}`)
          .join(", ")}`,
      );
    } else {
      pass(`Contextual forbidden phrase scan for ${rule.phrase}`);
    }
  }
}

requireContains("i18n exports dashboard copy", sourceByFile.i18n, "export const dashboardCopy");
requireContains("i18n defines English locale", sourceByFile.i18n, "en: {");
requireContains("i18n defines Traditional Chinese locale", sourceByFile.i18n, "zh: {");
requireContains("i18n defines resolver", sourceByFile.i18n, "resolveLanguage");

requireContains("Page reads lang search param", sourceByFile.page, "searchParams");
requireContains("Page links English language view", sourceByFile.page, "/?lang=en");
requireContains("Page links Traditional Chinese language view", sourceByFile.page, "/?lang=zh");
requireContains("Page applies localized lang attribute", sourceByFile.page, "lang={copy.htmlLang}");

for (const needle of [
  "TRADING_MODE",
  "ENABLE_LIVE_TRADING",
  "BROKER_PROVIDER",
  "paper",
  "NOT READY",
]) {
  requireContains(`Required safety token ${needle}`, combinedSource, needle);
}

for (const needle of [
  "Paper-first",
  "Paper Only",
  "Read-only",
  "not a production trading release",
]) {
  requireAny(`Required English safety copy ${needle}`, combinedSource, [
    needle,
    needle.toLowerCase(),
  ]);
}

for (const needle of [
  "實盤關閉",
  "僅限紙上交易",
  "紙上優先",
  "尚未達正式交易上線標準",
  "不核准實盤",
]) {
  requireContains(`Required Traditional Chinese safety copy ${needle}`, combinedSource, needle);
}

requireContains("English Web Command Center label exists", sourceByFile.i18n, "Web Command Center");
requireContains("Traditional Chinese Web Command Center label exists", sourceByFile.i18n, "Web 指揮中心");
requireContains("English release baseline title exists", sourceByFile.i18n, "v0.1.0 paper research preview");
requireContains("Traditional Chinese release baseline title exists", sourceByFile.i18n, "v0.1.0 紙上研究預覽");
requireContains("English local JSON loader copy exists", sourceByFile.i18n, "Select local .json");
requireContains("Traditional Chinese local JSON loader copy exists", sourceByFile.i18n, "選擇本地 .json");
requireContains("English no-upload copy exists", sourceByFile.i18n, "The file was not uploaded");
requireContains("Traditional Chinese no-upload copy exists", sourceByFile.i18n, "檔案未上傳");
requireContains("English demo guide copy exists", sourceByFile.i18n, "Customer Demo Guided Flow");
requireContains("Traditional Chinese demo guide copy exists", sourceByFile.i18n, "客戶測試導覽流程");
requireContains("Demo guide component is implemented", sourceByFile.demoGuide, "DemoGuidePanel");
requireContains("Demo guide previous action exists", sourceByFile.demoGuide, "goToPreviousStep");
requireContains("Demo guide next action exists", sourceByFile.demoGuide, "goToNextStep");
requireContains("Demo guide copy checklist action exists", sourceByFile.demoGuide, "copyChecklist");
requireContains("Demo guide renders prohibited actions", sourceByFile.demoGuide, "prohibitedItems");
requireContains("Demo guide is mounted on page", sourceByFile.page, "DemoGuidePanel");
requireContains("English read-only interaction copy exists", sourceByFile.i18n, "Read-only Command Center tools");
requireContains("Traditional Chinese read-only interaction copy exists", sourceByFile.i18n, "只讀 Command Center 工具");
requireContains("Command Center tabs are implemented", sourceByFile.commandTabs, "role=\"tablist\"");
requireContains("Command Center refresh action exists", sourceByFile.i18n, "Refresh status");
requireContains("Command Center backend troubleshooting exists", sourceByFile.commandTabs, "troubleshooting-panel");
requireContains("English paper records copy exists", sourceByFile.i18n, "Persisted paper workflow records");
requireContains("Traditional Chinese paper records copy exists", sourceByFile.i18n, "已持久化紙上流程紀錄");
requireContains("English paper evidence copy exists", sourceByFile.i18n, "Paper demo evidence viewer");
requireContains("Traditional Chinese paper evidence copy exists", sourceByFile.i18n, "紙上 demo evidence viewer");
requireContains("Paper demo evidence panel is implemented", sourceByFile.paperDemoEvidence, "PaperDemoEvidencePanel");
requireContains("Paper demo evidence panel validates local JSON", sourceByFile.paperDemoEvidence, "validatePaperDemoEvidence");
requireContains("Paper demo evidence panel accepts explicit JSON only", sourceByFile.paperDemoEvidence, "accept=\".json,application/json\"");
requireContains("Paper demo evidence panel does not upload files", sourceByFile.i18n, "not uploaded");
requireContains("Paper demo evidence panel checks paper_only=true", sourceByFile.paperDemoEvidence, "paper_only: true");
requireContains("Paper demo evidence panel checks live_trading_enabled=false", sourceByFile.paperDemoEvidence, "live_trading_enabled: false");
requireContains("Paper demo evidence panel checks broker_api_called=false", sourceByFile.paperDemoEvidence, "broker_api_called: false");
requireContains("Paper demo evidence panel checks approval_for_live=false", sourceByFile.paperDemoEvidence, "approval_for_live: false");
requireContains("Paper demo evidence panel checks real_order_created=false", sourceByFile.paperDemoEvidence, "real_order_created: false");
requireContains("Paper demo evidence panel displays approval_request_id", sourceByFile.paperDemoEvidence, "approval_request_id");
requireContains("Paper demo evidence panel displays workflow_run_id", sourceByFile.paperDemoEvidence, "workflow_run_id");
requireContains("Paper demo evidence panel displays OMS event count", sourceByFile.paperDemoEvidence, "oms_event_count");
requireContains("Paper demo evidence panel displays audit event count", sourceByFile.paperDemoEvidence, "audit_event_count");
requireContains("Paper demo evidence panel is mounted on page", sourceByFile.page, "PaperDemoEvidencePanel");
requireNotContains("Paper demo evidence panel does not fetch backend", sourceByFile.paperDemoEvidence, "fetch(");
requireNotContains("Paper demo evidence panel does not call workflow record", sourceByFile.paperDemoEvidence, "/api/paper-execution/workflow/record");
requireNotContains("Paper demo evidence panel does not collect API keys", sourceByFile.paperDemoEvidence.toLowerCase(), "api_key");
requireNotContains("Paper demo evidence panel does not collect account IDs", sourceByFile.paperDemoEvidence.toLowerCase(), "account_id");
requireNotContains("Paper demo evidence panel does not collect certificates", sourceByFile.paperDemoEvidence.toLowerCase(), "certificate");
requireContains("English paper submit copy exists", sourceByFile.i18n, "Create a paper simulation record");
requireContains("Traditional Chinese paper submit copy exists", sourceByFile.i18n, "建立紙上模擬紀錄");
requireContains("Paper submit component is implemented", sourceByFile.paperSubmit, "PaperSimulationSubmitPanel");
requireContains("Paper submit calls workflow record only", sourceByFile.paperSubmit, "/api/paper-execution/workflow/record");
requireContains("Paper submit requires persisted approval request", sourceByFile.paperSubmit, "approval_request_id");
requireContains("Paper submit uses approved approval history", sourceByFile.paperSubmit, "paper_simulation_approved");
requireNotContains("Paper submit no longer sends client approval decision", sourceByFile.paperSubmit, "approval_decision:");
requireNotContains("Paper submit does not create approval requests", sourceByFile.paperSubmit, "/api/paper-execution/approvals/requests");
requireContains("Paper submit is mounted on page", sourceByFile.page, "PaperSimulationSubmitPanel");
requireContains("English paper risk copy exists", sourceByFile.i18n, "Paper risk guardrail expansion");
requireContains("Traditional Chinese paper risk copy exists", sourceByFile.i18n, "紙上風控 Guardrail 擴充");
requireContains("Paper risk panel is implemented", sourceByFile.paperRisk, "PaperRiskGuardrailsPanel");
requireContains("Paper risk status endpoint is read on page", sourceByFile.page, "/api/paper-risk/status");
requireContains("Paper risk panel is mounted on page", sourceByFile.page, "PaperRiskGuardrailsPanel");
requireContains("Paper risk panel shows price reasonability", sourceByFile.paperRisk, "price_reasonability_band_pct");
requireContains("Paper risk panel shows max order size", sourceByFile.paperRisk, "max_order_size_by_contract");
requireContains("Paper risk panel shows margin proxy", sourceByFile.paperRisk, "max_margin_proxy_twd");
requireContains("Paper risk panel shows duplicate prevention", sourceByFile.i18n, "duplicate_order_prevention");
requireContains("Paper risk panel shows kill switch", sourceByFile.paperRisk, "kill_switch_active");
requireContains("Paper risk panel shows broker heartbeat", sourceByFile.paperRisk, "broker_heartbeat_healthy");
requireNotContains("Paper risk panel does not call workflow record", sourceByFile.paperRisk, "/api/paper-execution/workflow/record");
requireNotContains("Paper risk panel does not call broker simulation", sourceByFile.paperRisk, "/api/paper-execution/broker-simulation/preview");
requireNotContains("Paper risk panel does not call mutation endpoints", sourceByFile.paperRisk, "fetch(");
requireNotContains("Paper risk panel does not collect API keys", sourceByFile.paperRisk.toLowerCase(), "api_key");
requireNotContains("Paper risk panel does not collect account IDs", sourceByFile.paperRisk.toLowerCase(), "account_id");
requireNotContains("Paper risk panel does not collect certificates", sourceByFile.paperRisk.toLowerCase(), "certificate");
requireContains("English paper broker simulation copy exists", sourceByFile.i18n, "Local quote-based simulation preview");
requireContains("Traditional Chinese paper broker simulation copy exists", sourceByFile.i18n, "本地 quote-based 模擬預覽");
requireContains("Paper broker simulation component is implemented", sourceByFile.paperBrokerSimulation, "PaperBrokerSimulationModelPanel");
requireContains("Paper broker simulation calls preview endpoint only", sourceByFile.paperBrokerSimulation, "/api/paper-execution/broker-simulation/preview");
requireContains("Paper broker simulation uses caller-provided local quote snapshot", sourceByFile.i18n, "caller-provided local quote");
requireContains("Paper broker simulation keeps paper_only=true", sourceByFile.paperBrokerSimulation, "paper_only: true");
requireContains("Paper broker simulation checks live_trading_enabled=false", sourceByFile.paperBrokerSimulation, "live_trading_enabled !== false");
requireContains("Paper broker simulation checks broker_api_called=false", sourceByFile.paperBrokerSimulation, "broker_api_called !== false");
requireContains("Paper broker simulation checks external data flag", sourceByFile.paperBrokerSimulation, "external_market_data_downloaded !== false");
requireContains("Paper broker simulation checks production model flag", sourceByFile.paperBrokerSimulation, "production_execution_model !== false");
requireContains("Paper broker simulation exposes quote inputs", sourceByFile.paperBrokerSimulation, "quoteAgeSeconds");
requireContains("Paper broker simulation exposes liquidity input", sourceByFile.paperBrokerSimulation, "liquidityScore");
requireContains("Paper broker simulation is mounted on page", sourceByFile.page, "PaperBrokerSimulationModelPanel");
requireNotContains("Paper broker simulation does not call workflow record", sourceByFile.paperBrokerSimulation, "/api/paper-execution/workflow/record");
requireNotContains("Paper broker simulation does not call approval decisions", sourceByFile.paperBrokerSimulation, "/decisions");
requireNotContains("Paper broker simulation does not collect API keys", sourceByFile.paperBrokerSimulation.toLowerCase(), "api_key");
requireNotContains("Paper broker simulation does not collect account IDs", sourceByFile.paperBrokerSimulation.toLowerCase(), "account_id");
requireNotContains("Paper broker simulation does not collect certificates", sourceByFile.paperBrokerSimulation.toLowerCase(), "certificate");
requireContains("English paper broker evidence copy exists", sourceByFile.i18n, "Paper broker simulation evidence viewer");
requireContains("Traditional Chinese paper broker evidence copy exists", sourceByFile.i18n, "紙上券商模擬 evidence viewer");
requireContains("Paper broker evidence panel is implemented", sourceByFile.paperBrokerEvidence, "PaperBrokerSimulationEvidencePanel");
requireContains("Paper broker evidence panel validates local JSON", sourceByFile.paperBrokerEvidence, "validatePaperBrokerSimulationEvidence");
requireContains("Paper broker evidence panel accepts explicit JSON only", sourceByFile.paperBrokerEvidence, "accept=\".json,application/json\"");
requireContains("Paper broker evidence panel checks paper_only=true", sourceByFile.paperBrokerEvidence, "paper_only: true");
requireContains("Paper broker evidence panel checks live_trading_enabled=false", sourceByFile.paperBrokerEvidence, "live_trading_enabled: false");
requireContains("Paper broker evidence panel checks broker_api_called=false", sourceByFile.paperBrokerEvidence, "broker_api_called: false");
requireContains("Paper broker evidence panel checks external data flag", sourceByFile.paperBrokerEvidence, "external_market_data_downloaded: false");
requireContains("Paper broker evidence panel checks production model flag", sourceByFile.paperBrokerEvidence, "production_execution_model: false");
requireContains("Paper broker evidence panel displays evidence_id", sourceByFile.paperBrokerEvidence, "evidence_id");
requireContains("Paper broker evidence panel displays quote snapshot", sourceByFile.paperBrokerEvidence, "quote_age_seconds");
requireContains("Paper broker evidence panel displays simulation outcome", sourceByFile.paperBrokerEvidence, "simulation_outcome");
requireContains("Paper broker evidence panel displays fill quantity", sourceByFile.paperBrokerEvidence, "simulated_fill_quantity");
requireContains("Paper broker evidence panel displays safety flags", sourceByFile.paperBrokerEvidence, "safety_flags");
requireContains("Paper broker evidence panel is mounted on page", sourceByFile.page, "PaperBrokerSimulationEvidencePanel");
requireNotContains("Paper broker evidence panel does not fetch backend", sourceByFile.paperBrokerEvidence, "fetch(");
requireNotContains("Paper broker evidence panel does not call workflow record", sourceByFile.paperBrokerEvidence, "/api/paper-execution/workflow/record");
requireNotContains("Paper broker evidence panel does not call broker simulation endpoint", sourceByFile.paperBrokerEvidence, "/api/paper-execution/broker-simulation/preview");
requireNotContains("Paper broker evidence panel does not collect API keys", sourceByFile.paperBrokerEvidence.toLowerCase(), "api_key");
requireNotContains("Paper broker evidence panel does not collect account IDs", sourceByFile.paperBrokerEvidence.toLowerCase(), "account_id");
requireNotContains("Paper broker evidence panel does not collect certificates", sourceByFile.paperBrokerEvidence.toLowerCase(), "certificate");
requireContains("English paper approval queue copy exists", sourceByFile.i18n, "Paper-only approval queue and history");
requireContains("Traditional Chinese paper approval queue copy exists", sourceByFile.i18n, "紙上審批佇列與歷史");
requireContains("Paper approval queue panel is implemented", sourceByFile.paperApprovals, "PaperApprovalQueuePanel");
requireContains("English paper approval request copy exists", sourceByFile.i18n, "Create a paper-only approval request");
requireContains("Traditional Chinese paper approval request copy exists", sourceByFile.i18n, "建立紙上 approval request");
requireContains("Paper approval request panel is implemented", sourceByFile.paperApprovalRequest, "PaperApprovalRequestPanel");
requireContains("Paper approval request panel calls request endpoint", sourceByFile.paperApprovalRequest, "/api/paper-execution/approvals/requests");
requireContains("Paper approval request panel stays paper-only", sourceByFile.paperApprovalRequest, "paper_only: true");
requireContains("Paper approval request panel creates signal-only payload", sourceByFile.paperApprovalRequest, "signals_only: true");
requireContains("Paper approval request starts pending review", sourceByFile.paperApprovalRequest, "pending_review");
requireContains("Paper approval request refreshes server data", sourceByFile.paperApprovalRequest, "router.refresh()");
requireNotContains("Paper approval request panel does not call workflow record", sourceByFile.paperApprovalRequest, "/api/paper-execution/workflow/record");
requireNotContains("Paper approval request panel does not record reviewer decisions", sourceByFile.paperApprovalRequest, "/decisions");
requireNotContains("Paper approval request panel does not collect API keys", sourceByFile.paperApprovalRequest.toLowerCase(), "api_key");
requireNotContains("Paper approval request panel does not collect account IDs", sourceByFile.paperApprovalRequest.toLowerCase(), "account_id");
requireNotContains("Paper approval request panel does not collect certificates", sourceByFile.paperApprovalRequest.toLowerCase(), "certificate");
requireNotContains("Paper approval request panel does not call broker APIs", sourceByFile.paperApprovalRequest, "broker_api_called: true");
requireContains("Paper approval request panel is mounted on page", sourceByFile.page, "PaperApprovalRequestPanel");
requireContains("English paper approval decision copy exists", sourceByFile.i18n, "Record a paper-only reviewer decision");
requireContains("Traditional Chinese paper approval decision copy exists", sourceByFile.i18n, "記錄紙上覆核決策");
requireContains("Paper approval decision panel is implemented", sourceByFile.paperApprovalDecision, "PaperApprovalDecisionPanel");
requireContains("Paper approval decision panel calls decision endpoint", sourceByFile.paperApprovalDecision, "/decisions");
requireContains("Paper approval decision panel stays paper-only", sourceByFile.paperApprovalDecision, "paper_only: true");
requireContains("Paper approval decision panel records reviewer decisions", sourceByFile.paperApprovalDecision, "reviewer_id");
requireNotContains("Paper approval decision panel does not create approval requests", sourceByFile.paperApprovalDecision, "/api/paper-execution/approvals/requests\"");
requireNotContains("Paper approval decision panel does not collect API keys", sourceByFile.paperApprovalDecision.toLowerCase(), "api_key");
requireNotContains("Paper approval decision panel does not collect account IDs", sourceByFile.paperApprovalDecision.toLowerCase(), "account_id");
requireNotContains("Paper approval decision panel does not collect certificates", sourceByFile.paperApprovalDecision.toLowerCase(), "certificate");
requireNotContains("Paper approval decision panel does not call broker APIs", sourceByFile.paperApprovalDecision, "broker_api_called: true");
requireContains("Paper approval decision panel is mounted on page", sourceByFile.page, "PaperApprovalDecisionPanel");
requireContains("Paper approval status endpoint is read on page", sourceByFile.page, "/api/paper-execution/approvals/status");
requireContains("Paper approval queue endpoint is read on page", sourceByFile.page, "/api/paper-execution/approvals/queue");
requireContains("Paper approval history endpoint is read on page", sourceByFile.page, "/api/paper-execution/approvals/history");
requireContains("Paper approval queue panel is mounted on page", sourceByFile.page, "PaperApprovalQueuePanel");
requireContains("Paper approval panel shows hash-chain references", sourceByFile.paperApprovals, "latest_chain_hash");
requireContains("Paper approval panel shows reviewer history", sourceByFile.paperApprovals, "reviewer_id");
requireContains("Paper approval panel shows required review sequence", sourceByFile.paperApprovals, "required_decision_sequence");
requireContains("Paper approval panel shows safety flags", sourceByFile.paperApprovals, "live_execution_eligible");
requireNotContains("Paper approval panel does not call mutation endpoints", sourceByFile.paperApprovals, "/decisions");
requireNotContains("Paper approval panel does not create approval requests", sourceByFile.paperApprovals, "/requests");
requireNotContains("Paper approval panel does not fetch directly", sourceByFile.paperApprovals, "fetch(");
requireContains("Paper records panel is read-only", combinedSource, "Read-only");
requireContains("Paper records rows are selectable", sourceByFile.paperRecords, "aria-pressed");
requireContains("Paper records workflow copy action exists", sourceByFile.i18n, "Copy workflow ID");
requireContains("Paper records order copy action exists", sourceByFile.i18n, "Copy order ID");
requireContains("Paper records panel avoids broker calls", combinedSource, "broker_api_called");
requireContains("English paper OMS reliability copy exists", sourceByFile.i18n, "Paper OMS reliability metadata");
requireContains("Traditional Chinese paper OMS reliability copy exists", sourceByFile.i18n, "紙上 OMS reliability metadata");
requireContains("Paper OMS reliability panel is implemented", sourceByFile.paperOmsReliability, "PaperOmsReliabilityPanel");
requireContains("Paper OMS reliability status endpoint is read on page", sourceByFile.page, "/api/paper-execution/reliability/status");
requireContains("Paper OMS outbox endpoint is read on page", sourceByFile.page, "/api/paper-execution/outbox");
requireContains("Paper OMS execution reports endpoint is read on page", sourceByFile.page, "/execution-reports");
requireContains("Paper OMS timeout candidates endpoint is read on page", sourceByFile.page, "/api/paper-execution/reliability/timeout-candidates");
requireContains("Paper OMS timeout preview endpoint is called by panel", sourceByFile.paperOmsReliability, "/api/paper-execution/reliability/timeout-preview");
requireContains("Paper OMS timeout mark endpoint is called by panel", sourceByFile.paperOmsReliability, "/api/paper-execution/reliability/timeout-mark");
requireContains("Paper OMS timeout mark action is explicit", sourceByFile.i18n, "Mark EXPIRED locally");
requireContains("Paper OMS timeout handling stays paper-only", sourceByFile.paperOmsReliability, "paper_only: true");
requireContains("Paper OMS reliability panel shows production_oms_ready", sourceByFile.paperOmsReliability, "production_oms_ready");
requireContains("Paper OMS reliability panel shows async_order_processing_enabled", sourceByFile.paperOmsReliability, "async_order_processing_enabled");
requireContains("Paper OMS reliability panel shows execution report model", sourceByFile.paperOmsReliability, "execution_report_model_enabled");
requireContains("Paper OMS reliability panel shows duplicate prevention", sourceByFile.paperOmsReliability, "duplicate_order_prevention_enabled");
requireContains("Paper OMS reliability panel shows timeout scan", sourceByFile.paperOmsReliability, "timeout_candidate_scan_enabled");
requireContains("Paper OMS reliability panel is mounted on page", sourceByFile.page, "PaperOmsReliabilityPanel");
requireNotContains("Paper OMS reliability panel does not call workflow record", sourceByFile.paperOmsReliability, "/api/paper-execution/workflow/record");
requireNotContains("Paper OMS reliability panel does not call approval decisions", sourceByFile.paperOmsReliability, "/decisions");
requireNotContains("Paper OMS reliability panel does not collect API keys", sourceByFile.paperOmsReliability.toLowerCase(), "api_key");
requireNotContains("Paper OMS reliability panel does not collect account IDs", sourceByFile.paperOmsReliability.toLowerCase(), "account_id");
requireNotContains("Paper OMS reliability panel does not collect certificates", sourceByFile.paperOmsReliability.toLowerCase(), "certificate");
requireContains("Packet loader bundled sample action exists", sourceByFile.i18n, "Load safe sample");
requireContains("Packet loader clear local JSON action exists", sourceByFile.i18n, "Clear local JSON");
requireContains("Packet loader still performs local validation", sourceByFile.packetLoader, "validateResearchReviewPacket");

scanForbiddenPatterns();

if (failures.length > 0) {
  console.error("Command Center i18n QA check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Command Center i18n QA check passed:");
for (const item of passes) {
  console.log(`- ${item}`);
}
