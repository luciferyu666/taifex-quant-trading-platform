import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const files = {
  i18n: "frontend/app/i18n.ts",
  page: "frontend/app/page.tsx",
  demoGuide: "frontend/app/components/DemoGuidePanel.tsx",
  commandTabs: "frontend/app/components/CommandCenterTabs.tsx",
  deploymentDataBoundary: "frontend/app/components/DeploymentDataBoundaryPanel.tsx",
  hostedPaperReadiness: "frontend/app/components/HostedPaperReadinessPanel.tsx",
  hostedPaperIdentityReadiness:
    "frontend/app/components/HostedPaperIdentityReadinessPanel.tsx",
  hostedPaperSession: "frontend/app/components/HostedPaperMockSessionPanel.tsx",
  hostedPaperTenantEvidence:
    "frontend/app/components/HostedPaperTenantBoundaryEvidencePanel.tsx",
  localBackendMode: "frontend/app/components/LocalBackendDemoModePanel.tsx",
  paperApprovals: "frontend/app/components/PaperApprovalQueuePanel.tsx",
  paperApprovalRequest: "frontend/app/components/PaperApprovalRequestPanel.tsx",
  paperApprovalDecision: "frontend/app/components/PaperApprovalDecisionPanel.tsx",
  paperDemoEvidence: "frontend/app/components/PaperDemoEvidencePanel.tsx",
  paperBrokerEvidence: "frontend/app/components/PaperBrokerSimulationEvidencePanel.tsx",
  paperBrokerSimulation: "frontend/app/components/PaperBrokerSimulationModelPanel.tsx",
  paperRisk: "frontend/app/components/PaperRiskGuardrailsPanel.tsx",
  paperOmsReliability: "frontend/app/components/PaperOmsReliabilityPanel.tsx",
  paperAuditIntegrity: "frontend/app/components/PaperAuditIntegrityPanel.tsx",
  paperAuditIntegrityEvidence: "frontend/app/components/PaperAuditIntegrityEvidencePanel.tsx",
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
requireContains("English local backend demo copy exists", sourceByFile.i18n, "Local Backend Demo Mode");
requireContains("Traditional Chinese local backend demo copy exists", sourceByFile.i18n, "本地後端 Demo 模式");
requireContains("English deployment data boundary copy exists", sourceByFile.i18n, "Where actual paper records can be read");
requireContains("Traditional Chinese deployment data boundary copy exists", sourceByFile.i18n, "實際 paper records 可讀取的位置");
requireContains("Deployment data boundary component is implemented", sourceByFile.deploymentDataBoundary, "DeploymentDataBoundaryPanel");
requireContains("Deployment data boundary distinguishes production Vercel", sourceByFile.i18n, "Production Vercel");
requireContains("Deployment data boundary distinguishes local backend", sourceByFile.i18n, "Local Backend");
requireContains("Deployment data boundary distinguishes future hosted API", sourceByFile.i18n, "Future Hosted API");
requireContains("Deployment data boundary states production SQLite access false", sourceByFile.deploymentDataBoundary, "PRODUCTION_SQLITE_ACCESS=false");
requireContains("Deployment data boundary states local backend required", sourceByFile.deploymentDataBoundary, "LOCAL_BACKEND_REQUIRED_FOR_RECORDS=true");
requireContains("Deployment data boundary is mounted on page", sourceByFile.page, "DeploymentDataBoundaryPanel");
requireNotContains("Deployment data boundary panel does not fetch backend", sourceByFile.deploymentDataBoundary, "fetch(");
requireNotContains("Deployment data boundary panel does not call workflow record", sourceByFile.deploymentDataBoundary, "/api/paper-execution/workflow/record");
requireNotContains("Deployment data boundary panel does not collect API keys", sourceByFile.deploymentDataBoundary.toLowerCase(), "api_key");
requireNotContains("Deployment data boundary panel does not collect account IDs", sourceByFile.deploymentDataBoundary.toLowerCase(), "account_id");
requireNotContains("Deployment data boundary panel does not collect certificates", sourceByFile.deploymentDataBoundary.toLowerCase(), "certificate");
requireContains("English hosted paper readiness copy exists", sourceByFile.i18n, "Hosted Paper API Readiness");
requireContains("Traditional Chinese hosted paper readiness copy exists", sourceByFile.i18n, "Hosted Paper API 就緒狀態");
requireContains("Hosted paper readiness component is implemented", sourceByFile.hostedPaperReadiness, "HostedPaperReadinessPanel");
requireContains("Hosted paper readiness endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/readiness");
requireContains("Hosted paper readiness panel is mounted on page", sourceByFile.page, "HostedPaperReadinessPanel");
requireContains("Hosted paper readiness panel shows hosted backend status", sourceByFile.hostedPaperReadiness, "hosted_backend_enabled");
requireContains("Hosted paper readiness panel shows hosted datastore status", sourceByFile.hostedPaperReadiness, "hosted_datastore_enabled");
requireContains("Hosted paper readiness panel shows customer login status", sourceByFile.hostedPaperReadiness, "customer_login_enabled");
requireContains("Hosted paper readiness panel shows local demo primary status", sourceByFile.hostedPaperReadiness, "local_demo_mode_primary");
requireContains("Hosted paper readiness panel shows safety defaults", sourceByFile.hostedPaperReadiness, "TRADING_MODE");
requireContains("Hosted paper readiness panel shows live disabled flag", sourceByFile.hostedPaperReadiness, "ENABLE_LIVE_TRADING");
requireContains("Hosted paper readiness panel shows paper broker provider", sourceByFile.hostedPaperReadiness, "BROKER_PROVIDER");
requireContains("Hosted paper readiness panel shows credential collection flag", sourceByFile.hostedPaperReadiness, "broker_credentials_collected");
requireContains("Hosted paper readiness panel shows production readiness flag", sourceByFile.hostedPaperReadiness, "production_trading_ready");
requireNotContains("Hosted paper readiness panel does not fetch directly", sourceByFile.hostedPaperReadiness, "fetch(");
requireNotContains("Hosted paper readiness panel does not call workflow record", sourceByFile.hostedPaperReadiness, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper readiness panel does not call paper approval mutations", sourceByFile.hostedPaperReadiness, "/api/paper-execution/approvals/requests");
requireNotContains("Hosted paper readiness panel does not collect API keys", sourceByFile.hostedPaperReadiness.toLowerCase(), "api_key");
requireNotContains("Hosted paper readiness panel does not collect account IDs", sourceByFile.hostedPaperReadiness.toLowerCase(), "account_id");
requireNotContains("Hosted paper readiness panel does not collect certificates", sourceByFile.hostedPaperReadiness.toLowerCase(), "certificate");
requireContains("English hosted paper identity readiness copy exists", sourceByFile.i18n, "Identity, RBAC, and tenant readiness");
requireContains("Traditional Chinese hosted paper identity readiness copy exists", sourceByFile.i18n, "Identity、RBAC 與 tenant readiness");
requireContains("Hosted paper identity readiness component is implemented", sourceByFile.hostedPaperIdentityReadiness, "HostedPaperIdentityReadinessPanel");
requireContains("Hosted paper identity readiness endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/identity-readiness");
requireContains("Hosted paper identity readiness panel is mounted on page", sourceByFile.page, "HostedPaperIdentityReadinessPanel");
requireContains("Hosted paper identity readiness panel shows reviewer login status", sourceByFile.hostedPaperIdentityReadiness, "reviewer_login_enabled");
requireContains("Hosted paper identity readiness panel shows customer account status", sourceByFile.hostedPaperIdentityReadiness, "customer_accounts_enabled");
requireContains("Hosted paper identity readiness panel shows auth provider status", sourceByFile.hostedPaperIdentityReadiness, "authentication_provider");
requireContains("Hosted paper identity readiness panel shows session cookie status", sourceByFile.hostedPaperIdentityReadiness, "session_cookie_issued");
requireContains("Hosted paper identity readiness panel shows RBAC status", sourceByFile.hostedPaperIdentityReadiness, "rbac_enabled");
requireContains("Hosted paper identity readiness panel shows ABAC status", sourceByFile.hostedPaperIdentityReadiness, "abac_enabled");
requireContains("Hosted paper identity readiness panel shows mutation permission status", sourceByFile.hostedPaperIdentityReadiness, "mutation_permissions_granted");
requireContains("Hosted paper identity readiness panel shows tenant isolation requirement", sourceByFile.hostedPaperIdentityReadiness, "tenant_isolation_required");
requireContains("Hosted paper identity readiness panel shows tenant isolation enforcement", sourceByFile.hostedPaperIdentityReadiness, "tenant_isolation_enforced");
requireContains("Hosted paper identity readiness panel shows Production Vercel SQLite boundary", sourceByFile.hostedPaperIdentityReadiness, "local_sqlite_access_from_production_vercel");
requireContains("Hosted paper identity readiness panel shows safety defaults", sourceByFile.hostedPaperIdentityReadiness, "TRADING_MODE");
requireContains("Hosted paper identity readiness panel shows live disabled flag", sourceByFile.hostedPaperIdentityReadiness, "ENABLE_LIVE_TRADING");
requireContains("Hosted paper identity readiness panel shows paper broker provider", sourceByFile.hostedPaperIdentityReadiness, "BROKER_PROVIDER");
requireContains("Hosted paper identity readiness panel shows production readiness flag", sourceByFile.hostedPaperIdentityReadiness, "production_trading_ready");
requireNotContains("Hosted paper identity readiness panel does not fetch directly", sourceByFile.hostedPaperIdentityReadiness, "fetch(");
requireNotContains("Hosted paper identity readiness panel does not call workflow record", sourceByFile.hostedPaperIdentityReadiness, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper identity readiness panel does not call paper approval mutations", sourceByFile.hostedPaperIdentityReadiness, "/api/paper-execution/approvals/requests");
requireNotContains("Hosted paper identity readiness panel does not collect API keys", sourceByFile.hostedPaperIdentityReadiness.toLowerCase(), "api_key");
requireNotContains("Hosted paper identity readiness panel does not collect account IDs", sourceByFile.hostedPaperIdentityReadiness.toLowerCase(), "account_id");
requireNotContains("Hosted paper identity readiness panel does not collect certificates", sourceByFile.hostedPaperIdentityReadiness.toLowerCase(), "certificate");
requireContains("English hosted paper session copy exists", sourceByFile.i18n, "Mock session and tenant contract");
requireContains("Traditional Chinese hosted paper session copy exists", sourceByFile.i18n, "Mock session 與 tenant contract");
requireContains("Hosted paper mock session component is implemented", sourceByFile.hostedPaperSession, "HostedPaperMockSessionPanel");
requireContains("Hosted paper mock session endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/session");
requireContains("Hosted paper current tenant endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/tenants/current");
requireContains("Hosted paper mock session panel is mounted on page", sourceByFile.page, "HostedPaperMockSessionPanel");
requireContains("Hosted paper mock session panel shows mock_read_only", sourceByFile.hostedPaperSession, "contract_state");
requireContains("Hosted paper mock session panel shows authenticated=false", sourceByFile.hostedPaperSession, "authenticated");
requireContains("Hosted paper mock session panel shows authentication provider", sourceByFile.hostedPaperSession, "authentication_provider");
requireContains("Hosted paper mock session panel shows session cookie flag", sourceByFile.hostedPaperSession, "session_cookie_issued");
requireContains("Hosted paper mock session panel shows tenant id", sourceByFile.hostedPaperSession, "tenant_id");
requireContains("Hosted paper mock session panel shows tenant isolation", sourceByFile.hostedPaperSession, "tenant_isolation_required");
requireContains("Hosted paper mock session panel shows hosted datastore disabled", sourceByFile.hostedPaperSession, "hosted_datastore_enabled");
requireContains("Hosted paper mock session panel shows role schema", sourceByFile.hostedPaperSession, "role_schema");
requireContains("Hosted paper mock session panel shows permission schema", sourceByFile.hostedPaperSession, "permission_schema");
requireContains("Hosted paper mock session panel shows denied mutation permissions", sourceByFile.hostedPaperSession, "deniedMutationPermissions");
requireContains("Hosted paper mock session panel shows credential collection flag", sourceByFile.hostedPaperSession, "credentials_collected");
requireContains("Hosted paper mock session panel shows broker credential flag", sourceByFile.hostedPaperSession, "broker_credentials_collected");
requireContains("Hosted paper mock session panel shows production readiness flag", sourceByFile.hostedPaperSession, "production_trading_ready");
requireNotContains("Hosted paper mock session panel does not fetch directly", sourceByFile.hostedPaperSession, "fetch(");
requireNotContains("Hosted paper mock session panel does not call workflow record", sourceByFile.hostedPaperSession, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper mock session panel does not call paper approval mutations", sourceByFile.hostedPaperSession, "/api/paper-execution/approvals/requests");
requireNotContains("Hosted paper mock session panel does not collect API keys", sourceByFile.hostedPaperSession.toLowerCase(), "api_key");
requireNotContains("Hosted paper mock session panel does not collect account IDs", sourceByFile.hostedPaperSession.toLowerCase(), "account_id");
requireNotContains("Hosted paper mock session panel does not collect certificates", sourceByFile.hostedPaperSession.toLowerCase(), "certificate");
requireContains("English hosted paper tenant evidence copy exists", sourceByFile.i18n, "Tenant boundary evidence viewer");
requireContains("Traditional Chinese hosted paper tenant evidence copy exists", sourceByFile.i18n, "Tenant boundary evidence viewer");
requireContains("Hosted paper tenant evidence panel is implemented", sourceByFile.hostedPaperTenantEvidence, "HostedPaperTenantBoundaryEvidencePanel");
requireContains("Hosted paper tenant evidence panel validates local JSON", sourceByFile.hostedPaperTenantEvidence, "validateHostedPaperTenantBoundaryEvidence");
requireContains("Hosted paper tenant evidence panel accepts explicit JSON only", sourceByFile.hostedPaperTenantEvidence, 'accept=".json,application/json"');
requireContains("Hosted paper tenant evidence panel checks evidence type", sourceByFile.hostedPaperTenantEvidence, "hosted_paper_tenant_boundary_evidence");
requireContains("Hosted paper tenant evidence panel checks mock_read_only", sourceByFile.hostedPaperTenantEvidence, "mock_read_only");
requireContains("Hosted paper tenant evidence panel checks authenticated=false", sourceByFile.hostedPaperTenantEvidence, "authenticated: false");
requireContains("Hosted paper tenant evidence panel checks auth provider none", sourceByFile.hostedPaperTenantEvidence, "authentication_provider");
requireContains("Hosted paper tenant evidence panel checks session cookie false", sourceByFile.hostedPaperTenantEvidence, "session_cookie_issued: false");
requireContains("Hosted paper tenant evidence panel checks hosted paper disabled", sourceByFile.hostedPaperTenantEvidence, "hosted_paper_enabled: false");
requireContains("Hosted paper tenant evidence panel checks hosted datastore false", sourceByFile.hostedPaperTenantEvidence, "hosted_datastore_enabled: false");
requireContains("Hosted paper tenant evidence panel checks hosted datastore writes false", sourceByFile.hostedPaperTenantEvidence, "hosted_datastore_written: false");
requireContains("Hosted paper tenant evidence panel checks local SQLite false", sourceByFile.hostedPaperTenantEvidence, "local_sqlite_access: false");
requireContains("Hosted paper tenant evidence panel checks credential flags", sourceByFile.hostedPaperTenantEvidence, "credentials_collected: false");
requireContains("Hosted paper tenant evidence panel checks broker credential flags", sourceByFile.hostedPaperTenantEvidence, "broker_credentials_collected: false");
requireContains("Hosted paper tenant evidence panel checks broker calls false", sourceByFile.hostedPaperTenantEvidence, "broker_api_called: false");
requireContains("Hosted paper tenant evidence panel checks live disabled", sourceByFile.hostedPaperTenantEvidence, "live_trading_enabled: false");
requireContains("Hosted paper tenant evidence panel checks production readiness false", sourceByFile.hostedPaperTenantEvidence, "production_trading_ready: false");
requireContains("Hosted paper tenant evidence panel checks denied mutations", sourceByFile.hostedPaperTenantEvidence, "denied_mutation_permissions");
requireContains("Hosted paper tenant evidence panel checks mutation permissions not granted", sourceByFile.hostedPaperTenantEvidence, "mutation_permissions_granted");
requireContains("Hosted paper tenant evidence panel is mounted on page", sourceByFile.page, "HostedPaperTenantBoundaryEvidencePanel");
requireNotContains("Hosted paper tenant evidence panel does not fetch backend", sourceByFile.hostedPaperTenantEvidence, "fetch(");
requireNotContains("Hosted paper tenant evidence panel does not call workflow record", sourceByFile.hostedPaperTenantEvidence, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper tenant evidence panel does not call hosted paper API", sourceByFile.hostedPaperTenantEvidence, "/api/hosted-paper/");
requireNotContains("Hosted paper tenant evidence panel does not collect API keys", sourceByFile.hostedPaperTenantEvidence.toLowerCase(), "api_key");
requireNotContains("Hosted paper tenant evidence panel does not collect account IDs", sourceByFile.hostedPaperTenantEvidence.toLowerCase(), "account_id");
requireNotContains("Hosted paper tenant evidence panel does not collect certificates", sourceByFile.hostedPaperTenantEvidence.toLowerCase(), "certificate");
requireContains("Local backend demo component is implemented", sourceByFile.localBackendMode, "LocalBackendDemoModePanel");
requireContains("Local backend demo panel states Vercel SQLite boundary", sourceByFile.i18n, "cannot directly read your local SQLite");
requireContains("Local backend demo panel states Chinese Vercel SQLite boundary", sourceByFile.i18n, "無法直接讀取你的本機 SQLite");
requireContains("Local backend demo panel exposes one-command launcher", sourceByFile.localBackendMode, "make launch-self-service-paper-demo");
requireContains("Local backend demo panel exposes backend command", sourceByFile.localBackendMode, "make backend");
requireContains("Local backend demo panel exposes frontend command", sourceByFile.localBackendMode, "make frontend");
requireContains("Local backend demo panel exposes demo seed command", sourceByFile.localBackendMode, "make seed-paper-execution-demo");
requireContains("Local backend demo panel exposes persistence check command", sourceByFile.localBackendMode, "make paper-execution-persistence-check");
requireContains("Local backend demo panel is mounted on page", sourceByFile.page, "LocalBackendDemoModePanel");
requireNotContains("Local backend demo panel does not fetch backend", sourceByFile.localBackendMode, "fetch(");
requireNotContains("Local backend demo panel does not call workflow record", sourceByFile.localBackendMode, "/api/paper-execution/workflow/record");
requireNotContains("Local backend demo panel does not collect API keys", sourceByFile.localBackendMode.toLowerCase(), "api_key");
requireNotContains("Local backend demo panel does not collect account IDs", sourceByFile.localBackendMode.toLowerCase(), "account_id");
requireNotContains("Local backend demo panel does not collect certificates", sourceByFile.localBackendMode.toLowerCase(), "certificate");
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
requireContains("English paper audit integrity copy exists", sourceByFile.i18n, "Local audit hash-chain verification");
requireContains("Traditional Chinese paper audit integrity copy exists", sourceByFile.i18n, "本地 audit hash-chain 驗證");
requireContains("Paper audit integrity panel is implemented", sourceByFile.paperAuditIntegrity, "PaperAuditIntegrityPanel");
requireContains("Paper audit integrity status endpoint is read on page", sourceByFile.page, "/api/paper-execution/audit-integrity/status");
requireContains("Paper audit integrity verify endpoint is read on page", sourceByFile.page, "/api/paper-execution/audit-integrity/verify");
requireContains("Paper audit integrity panel is mounted on page", sourceByFile.page, "PaperAuditIntegrityPanel");
requireContains("Paper audit integrity panel shows verified status", sourceByFile.paperAuditIntegrity, "verification.verified");
requireContains("Paper audit integrity panel shows missing hash count", sourceByFile.paperAuditIntegrity, "missing_hash_count");
requireContains("Paper audit integrity panel shows broken chain count", sourceByFile.paperAuditIntegrity, "broken_chain_count");
requireContains("Paper audit integrity panel shows duplicate audit IDs", sourceByFile.paperAuditIntegrity, "duplicate_audit_id");
requireContains("Paper audit integrity panel shows WORM false", sourceByFile.paperAuditIntegrity, "worm_ledger");
requireContains("Paper audit integrity panel shows centralized audit false", sourceByFile.paperAuditIntegrity, "centralized_audit_service");
requireNotContains("Paper audit integrity panel does not fetch backend", sourceByFile.paperAuditIntegrity, "fetch(");
requireNotContains("Paper audit integrity panel does not call workflow record", sourceByFile.paperAuditIntegrity, "/api/paper-execution/workflow/record");
requireNotContains("Paper audit integrity panel does not collect API keys", sourceByFile.paperAuditIntegrity.toLowerCase(), "api_key");
requireNotContains("Paper audit integrity panel does not collect account IDs", sourceByFile.paperAuditIntegrity.toLowerCase(), "account_id");
requireNotContains("Paper audit integrity panel does not collect certificates", sourceByFile.paperAuditIntegrity.toLowerCase(), "certificate");
requireContains("English paper audit evidence copy exists", sourceByFile.i18n, "Paper audit integrity evidence viewer");
requireContains("Traditional Chinese paper audit evidence copy exists", sourceByFile.i18n, "紙上稽核完整性 evidence viewer");
requireContains("Paper audit evidence panel is implemented", sourceByFile.paperAuditIntegrityEvidence, "PaperAuditIntegrityEvidencePanel");
requireContains("Paper audit evidence panel validates local JSON", sourceByFile.paperAuditIntegrityEvidence, "validatePaperAuditIntegrityEvidence");
requireContains("Paper audit evidence panel accepts explicit JSON only", sourceByFile.paperAuditIntegrityEvidence, 'accept=".json,application/json"');
requireContains("Paper audit evidence panel checks paper_only=true", sourceByFile.paperAuditIntegrityEvidence, "paper_only: true");
requireContains("Paper audit evidence panel checks live_trading_enabled=false", sourceByFile.paperAuditIntegrityEvidence, "live_trading_enabled: false");
requireContains("Paper audit evidence panel checks broker_api_called=false", sourceByFile.paperAuditIntegrityEvidence, "broker_api_called: false");
requireContains("Paper audit evidence panel checks database_written=false", sourceByFile.paperAuditIntegrityEvidence, "database_written: false");
requireContains("Paper audit evidence panel checks external_db_written=false", sourceByFile.paperAuditIntegrityEvidence, "external_db_written: false");
requireContains("Paper audit evidence panel checks WORM false", sourceByFile.paperAuditIntegrityEvidence, "worm_ledger: false");
requireContains("Paper audit evidence panel checks centralized audit false", sourceByFile.paperAuditIntegrityEvidence, "centralized_audit_service: false");
requireContains("Paper audit evidence panel displays verification result", sourceByFile.paperAuditIntegrityEvidence, "evidence.verified");
requireContains("Paper audit evidence panel displays audit events", sourceByFile.paperAuditIntegrityEvidence, "audit_events_count");
requireContains("Paper audit evidence panel displays broken chain count", sourceByFile.paperAuditIntegrityEvidence, "broken_chain_count");
requireContains("Paper audit evidence panel displays duplicate audit IDs", sourceByFile.paperAuditIntegrityEvidence, "duplicate_audit_ids_count");
requireContains("Paper audit evidence panel is mounted on page", sourceByFile.page, "PaperAuditIntegrityEvidencePanel");
requireNotContains("Paper audit evidence panel does not fetch backend", sourceByFile.paperAuditIntegrityEvidence, "fetch(");
requireNotContains("Paper audit evidence panel does not call workflow record", sourceByFile.paperAuditIntegrityEvidence, "/api/paper-execution/workflow/record");
requireNotContains("Paper audit evidence panel does not call audit integrity API", sourceByFile.paperAuditIntegrityEvidence, "/api/paper-execution/audit-integrity");
requireNotContains("Paper audit evidence panel does not collect API keys", sourceByFile.paperAuditIntegrityEvidence.toLowerCase(), "api_key");
requireNotContains("Paper audit evidence panel does not collect account IDs", sourceByFile.paperAuditIntegrityEvidence.toLowerCase(), "account_id");
requireNotContains("Paper audit evidence panel does not collect certificates", sourceByFile.paperAuditIntegrityEvidence.toLowerCase(), "certificate");
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
