import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const files = {
  i18n: "frontend/app/i18n.ts",
  page: "frontend/app/page.tsx",
  apiBase: "frontend/app/apiBase.ts",
  demoGuide: "frontend/app/components/DemoGuidePanel.tsx",
  commandTabs: "frontend/app/components/CommandCenterTabs.tsx",
  productValueAlignment: "frontend/app/components/ProductValueAlignmentPanel.tsx",
  workflowStandardization: "frontend/app/components/WorkflowStandardizationPanel.tsx",
  deploymentDataBoundary: "frontend/app/components/DeploymentDataBoundaryPanel.tsx",
  hostedWebCommandCenter: "frontend/app/components/HostedWebCommandCenterPanel.tsx",
  hostedPaperEnvironment: "frontend/app/components/HostedPaperEnvironmentPanel.tsx",
  hostedPaperDatastore:
    "frontend/app/components/HostedPaperDatastoreReadinessPanel.tsx",
  hostedPaperProductionDatastore:
    "frontend/app/components/HostedPaperProductionDatastoreReadinessPanel.tsx",
  hostedPaperReadiness: "frontend/app/components/HostedPaperReadinessPanel.tsx",
  hostedPaperIdentityReadiness:
    "frontend/app/components/HostedPaperIdentityReadinessPanel.tsx",
  hostedPaperIdentityAccess:
    "frontend/app/components/HostedPaperIdentityAccessContractPanel.tsx",
  hostedPaperAuthProviderSelection:
    "frontend/app/components/HostedPaperAuthProviderSelectionPanel.tsx",
  hostedPaperSecurityOperations:
    "frontend/app/components/HostedPaperSecurityOperationsPanel.tsx",
  hostedPaperSandboxOnboarding:
    "frontend/app/components/HostedPaperSandboxOnboardingPanel.tsx",
  hostedPaperSession: "frontend/app/components/HostedPaperMockSessionPanel.tsx",
  hostedPaperTenantEvidence:
    "frontend/app/components/HostedPaperTenantBoundaryEvidencePanel.tsx",
  localBackendMode: "frontend/app/components/LocalBackendDemoModePanel.tsx",
  localDemoSetup: "frontend/app/components/LocalDemoSetupPanel.tsx",
  browserOnlyMockRuntime: "frontend/app/components/browserOnlyMockRuntime.ts",
  browserOnlyMockGuide: "frontend/app/components/BrowserOnlyMockDemoGuide.tsx",
  browserOnlyMockDemo: "frontend/app/components/BrowserOnlyMockDemoPanel.tsx",
  mockBackendDemo: "frontend/app/components/MockBackendDemoPanel.tsx",
  paperComplianceApproval:
    "frontend/app/components/PaperComplianceApprovalReadinessPanel.tsx",
  paperApprovals: "frontend/app/components/PaperApprovalQueuePanel.tsx",
  paperApprovalRequest: "frontend/app/components/PaperApprovalRequestPanel.tsx",
  paperApprovalDecision: "frontend/app/components/PaperApprovalDecisionPanel.tsx",
  paperDemoEvidence: "frontend/app/components/PaperDemoEvidencePanel.tsx",
  paperBrokerEvidence: "frontend/app/components/PaperBrokerSimulationEvidencePanel.tsx",
  paperBrokerSimulation: "frontend/app/components/PaperBrokerSimulationModelPanel.tsx",
  paperBrokerSimulationReadiness:
    "frontend/app/components/PaperBrokerSimulationReadinessPanel.tsx",
  paperRisk: "frontend/app/components/PaperRiskGuardrailsPanel.tsx",
  paperRiskCrossAccountReadiness:
    "frontend/app/components/PaperRiskCrossAccountReadinessPanel.tsx",
  paperOmsReliability: "frontend/app/components/PaperOmsReliabilityPanel.tsx",
  paperOmsProductionReadiness:
    "frontend/app/components/PaperOmsProductionReadinessPanel.tsx",
  paperAuditIntegrity: "frontend/app/components/PaperAuditIntegrityPanel.tsx",
  paperAuditWormReadiness: "frontend/app/components/PaperAuditWormReadinessPanel.tsx",
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
requireContains("Product value alignment panel is implemented", sourceByFile.productValueAlignment, "ProductValueAlignmentPanel");
requireContains("Product value alignment panel is mounted on page", sourceByFile.page, "ProductValueAlignmentPanel");
requireContains("English product positioning copy exists", sourceByFile.i18n, "Taiwan index futures data analysis and Paper Trading research platform");
requireContains("Chinese product positioning copy exists", sourceByFile.i18n, "台指期資料分析與 Paper Trading 研究平台");
requireContains("Product value copy maps Feature to User benefit", sourceByFile.i18n, "User benefit");
requireContains("Chinese product value copy maps features to benefits", sourceByFile.i18n, "使用者利益");
requireContains("Product value copy names Market Data Lab", sourceByFile.i18n, "Market Data Lab");
requireContains("Product value copy names Strategy Research", sourceByFile.i18n, "Strategy Research");
requireContains("Product value copy names Paper Trading Simulator", sourceByFile.i18n, "Paper Trading Simulator");
requireContains("Product value copy names Portfolio Review", sourceByFile.i18n, "Portfolio Review");
requireContains("Product value copy names Evidence Center", sourceByFile.i18n, "Evidence Center");
requireContains("Product value flow includes market data preview", sourceByFile.i18n, "Market data preview");
requireContains("Product value flow includes StrategySignal generation", sourceByFile.i18n, "StrategySignal generation");
requireContains("Product value flow includes Paper Only order simulation", sourceByFile.i18n, "Paper Only order simulation");
requireContains("Product value safety keeps no investment advice", sourceByFile.i18n, "No investment advice");
requireContains("Product value safety keeps production not ready", sourceByFile.i18n, "Production Trading Platform remains NOT READY");
requireNotContains("Product value panel does not fetch backend", sourceByFile.productValueAlignment, "fetch(");
requireNotContains("Product value panel does not collect API keys", sourceByFile.productValueAlignment.toLowerCase(), "api_key");
requireNotContains("Product value panel does not collect account IDs", sourceByFile.productValueAlignment.toLowerCase(), "account_id");
requireNotContains("Product value panel does not collect certificates", sourceByFile.productValueAlignment.toLowerCase(), "certificate");
requireContains("Workflow standardization panel is implemented", sourceByFile.workflowStandardization, "WorkflowStandardizationPanel");
requireContains("Workflow standardization panel is mounted on page", sourceByFile.page, "WorkflowStandardizationPanel");
requireContains("Workflow standardization English copy exists", sourceByFile.i18n, "How the demo maps to the quant operating workflow");
requireContains("Workflow standardization Chinese copy exists", sourceByFile.i18n, "Demo 如何對應量化交易標準作業流程");
requireContains("Workflow standardization references docs guide", sourceByFile.i18n, "docs/quant-workflow-standardization.md");
requireContains("Workflow standardization includes Data standardization", sourceByFile.i18n, "Data standardization");
requireContains("Workflow standardization includes StrategySignal standardization", sourceByFile.i18n, "StrategySignal standardization");
requireContains("Workflow standardization includes Backtest reproducibility", sourceByFile.i18n, "Backtest reproducibility");
requireContains("Workflow standardization includes Rollover data separation", sourceByFile.i18n, "Rollover data separation");
requireContains("Workflow standardization includes PaperOrderIntent flow", sourceByFile.i18n, "PaperOrderIntent flow");
requireContains("Workflow standardization includes Risk Engine checks", sourceByFile.i18n, "Risk Engine checks");
requireContains("Workflow standardization includes OMS lifecycle", sourceByFile.i18n, "OMS lifecycle");
requireContains("Workflow standardization includes Audit evidence", sourceByFile.i18n, "Audit evidence");
requireContains("Workflow standardization safety keeps Paper Only", sourceByFile.i18n, "Paper Only");
requireContains("Workflow standardization safety keeps browser-only mock boundary", sourceByFile.i18n, "Browser-only / mock demo where applicable");
requireContains("Workflow standardization safety keeps no broker", sourceByFile.i18n, "No broker");
requireContains("Workflow standardization safety keeps no real order", sourceByFile.i18n, "No real order");
requireContains("Workflow standardization safety keeps no credentials", sourceByFile.i18n, "No credentials");
requireContains("Workflow standardization safety keeps not investment advice", sourceByFile.i18n, "Not investment advice");
requireContains("Workflow standardization safety keeps production not ready", sourceByFile.i18n, "Production Trading Platform: NOT READY");
requireNotContains("Workflow standardization panel does not fetch backend", sourceByFile.workflowStandardization, "fetch(");
requireNotContains("Workflow standardization panel does not collect API keys", sourceByFile.workflowStandardization.toLowerCase(), "api_key");
requireNotContains("Workflow standardization panel does not collect account IDs", sourceByFile.workflowStandardization.toLowerCase(), "account_id");
requireNotContains("Workflow standardization panel does not collect certificates", sourceByFile.workflowStandardization.toLowerCase(), "certificate");

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
requireContains("English hosted Web Command Center copy exists", sourceByFile.i18n, "Environment-aware hosted backend connection");
requireContains("Traditional Chinese hosted Web Command Center copy exists", sourceByFile.i18n, "具環境感知的 hosted backend 連線");
requireContains("Hosted Web Command Center component is implemented", sourceByFile.hostedWebCommandCenter, "HostedWebCommandCenterPanel");
requireContains("Hosted Web Command Center API base resolver is implemented", sourceByFile.apiBase, "getCommandCenterApiConfig");
requireContains("Hosted Web Command Center prefers hosted public env var", sourceByFile.apiBase, "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL");
requireContains("Hosted Web Command Center keeps local fallback env var", sourceByFile.apiBase, "NEXT_PUBLIC_BACKEND_URL");
requireContains("Hosted Web Command Center exposes API mode env var", sourceByFile.apiBase, "NEXT_PUBLIC_COMMAND_CENTER_API_MODE");
requireContains("Hosted Web Command Center endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/web-command-center/readiness");
requireContains("Hosted Web Command Center panel is mounted on page", sourceByFile.page, "HostedWebCommandCenterPanel");
requireContains("Hosted Web Command Center displays login status", sourceByFile.hostedWebCommandCenter, "authenticated");
requireContains("Hosted Web Command Center displays tenant context", sourceByFile.hostedWebCommandCenter, "tenant_id");
requireContains("Hosted Web Command Center displays roles", sourceByFile.hostedWebCommandCenter, "roles");
requireContains("Hosted Web Command Center displays permissions", sourceByFile.hostedWebCommandCenter, "grantedPermissions");
requireContains("Hosted Web Command Center shows public API base is not auth", sourceByFile.i18n, "configuration, not authentication");
requireContains("Hosted Web Command Center Chinese copy states public API base is not auth", sourceByFile.i18n, "公開 API base URL 只是設定，不是身份驗證");
requireContains("Hosted Web Command Center displays credential safety flag", sourceByFile.i18n, "credentials_collected");
requireNotContains("Hosted Web Command Center panel does not call workflow record", sourceByFile.hostedWebCommandCenter, "workflow/record");
requireNotContains("Hosted Web Command Center panel does not collect API keys", sourceByFile.hostedWebCommandCenter, "apiKey");
requireNotContains("Hosted Web Command Center panel does not collect account IDs", sourceByFile.hostedWebCommandCenter, "accountId");
requireNotContains("Hosted Web Command Center panel does not collect certificates", sourceByFile.hostedWebCommandCenter, "certificate");
requireContains("English hosted identity access contract copy exists", sourceByFile.i18n, "Identity access contract");
requireContains("Traditional Chinese hosted identity access contract copy exists", sourceByFile.i18n, "真實 login、session");
requireContains("Hosted identity access contract component is implemented", sourceByFile.hostedPaperIdentityAccess, "HostedPaperIdentityAccessContractPanel");
requireContains("Hosted identity access contract endpoint is mounted", sourceByFile.page, "/api/hosted-paper/identity-access-contract");
requireContains("Hosted identity access separates customer role", sourceByFile.i18n, "customer");
requireContains("Hosted identity access separates reviewer role", sourceByFile.i18n, "reviewer");
requireContains("Hosted identity access separates operator role", sourceByFile.i18n, "operator");
requireContains("Hosted identity access separates admin role", sourceByFile.i18n, "admin");
requireContains("English hosted paper auth provider selection copy exists", sourceByFile.i18n, "Auth provider selection matrix");
requireContains("Traditional Chinese hosted paper auth provider selection copy exists", sourceByFile.i18n, "選型狀態");
requireContains("Hosted paper auth provider selection component is implemented", sourceByFile.hostedPaperAuthProviderSelection, "HostedPaperAuthProviderSelectionPanel");
requireContains("Hosted paper auth provider selection endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/auth-provider-selection");
requireContains("Hosted paper auth provider selection panel is mounted on page", sourceByFile.page, "HostedPaperAuthProviderSelectionPanel");
requireContains("Hosted paper auth provider selection compares Clerk", sourceByFile.i18n, "Clerk");
requireContains("Hosted paper auth provider selection compares Auth0", sourceByFile.i18n, "Auth0");
requireContains("Hosted paper auth provider selection compares Descope", sourceByFile.i18n, "Descope");
requireContains("Hosted paper auth provider selection compares Vercel OIDC", sourceByFile.i18n, "Vercel OIDC");
requireContains("Hosted paper auth provider selection shows provider_selected flag", sourceByFile.hostedPaperAuthProviderSelection, "provider_selected");
requireContains("Hosted paper auth provider selection shows integration_enabled flag", sourceByFile.hostedPaperAuthProviderSelection, "integration_enabled");
requireContains("Hosted paper auth provider selection shows auth_provider_enabled flag", sourceByFile.hostedPaperAuthProviderSelection, "auth_provider_enabled");
requireContains("Hosted paper auth provider selection shows credentials_collected flag", sourceByFile.hostedPaperAuthProviderSelection, "credentials_collected");
requireContains("Hosted paper auth provider selection shows secrets_added flag", sourceByFile.hostedPaperAuthProviderSelection, "secrets_added");
requireContains("Hosted paper auth provider selection shows hosted datastore write flag", sourceByFile.hostedPaperAuthProviderSelection, "hosted_datastore_written");
requireContains("Hosted paper auth provider selection shows broker call flag", sourceByFile.hostedPaperAuthProviderSelection, "broker_api_called");
requireContains("Hosted paper auth provider selection shows order flag", sourceByFile.hostedPaperAuthProviderSelection, "order_created");
requireContains("Hosted paper auth provider selection shows production readiness flag", sourceByFile.hostedPaperAuthProviderSelection, "production_trading_ready");
requireNotContains("Hosted paper auth provider selection panel does not fetch directly", sourceByFile.hostedPaperAuthProviderSelection, "fetch(");
requireNotContains("Hosted paper auth provider selection panel does not call workflow record", sourceByFile.hostedPaperAuthProviderSelection, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper auth provider selection panel does not collect API keys", sourceByFile.hostedPaperAuthProviderSelection.toLowerCase(), "api_key");
requireNotContains("Hosted paper auth provider selection panel does not collect account IDs", sourceByFile.hostedPaperAuthProviderSelection.toLowerCase(), "account_id");
requireNotContains("Hosted paper auth provider selection panel does not collect certificates", sourceByFile.hostedPaperAuthProviderSelection.toLowerCase(), "certificate");
requireContains("English hosted paper security operations copy exists", sourceByFile.i18n, "Hosted Paper security operations readiness");
requireContains("Traditional Chinese hosted paper security operations copy exists", sourceByFile.i18n, "Hosted Paper security operations 就緒狀態");
requireContains("Hosted paper security operations component is implemented", sourceByFile.hostedPaperSecurityOperations, "HostedPaperSecurityOperationsPanel");
requireContains("Hosted paper security operations endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/security-operations/readiness");
requireContains("Hosted paper security operations panel is mounted on page", sourceByFile.page, "HostedPaperSecurityOperationsPanel");
requireContains("Hosted paper security operations shows secrets management flag", sourceByFile.hostedPaperSecurityOperations, "secrets_management_enabled");
requireContains("Hosted paper security operations shows rate limiting flag", sourceByFile.hostedPaperSecurityOperations, "rate_limiting_enabled");
requireContains("Hosted paper security operations shows audit monitoring flag", sourceByFile.hostedPaperSecurityOperations, "audit_monitoring_enabled");
requireContains("Hosted paper security operations shows observability flag", sourceByFile.hostedPaperSecurityOperations, "observability_pipeline_enabled");
requireContains("Hosted paper security operations shows CI gate flag", sourceByFile.hostedPaperSecurityOperations, "ci_release_readiness_gate_enabled");
requireContains("Hosted paper security operations shows staging smoke flag", sourceByFile.hostedPaperSecurityOperations, "staging_smoke_gate_enabled");
requireContains("Hosted paper security operations shows load test flag", sourceByFile.hostedPaperSecurityOperations, "load_test_gate_enabled");
requireContains("Hosted paper security operations shows abuse test flag", sourceByFile.hostedPaperSecurityOperations, "abuse_test_gate_enabled");
requireContains("Hosted paper security operations shows auth boundary flag", sourceByFile.hostedPaperSecurityOperations, "auth_boundary_test_gate_enabled");
requireContains("Hosted paper security operations shows production operations false", sourceByFile.hostedPaperSecurityOperations, "production_operations_ready");
requireContains("Hosted paper security operations shows secret safety flag", sourceByFile.hostedPaperSecurityOperations, "secrets_stored");
requireContains("Hosted paper security operations shows credential safety flag", sourceByFile.hostedPaperSecurityOperations, "credentials_collected");
requireContains("Hosted paper security operations shows broker safety flag", sourceByFile.hostedPaperSecurityOperations, "broker_api_called");
requireContains("Hosted paper security operations shows order safety flag", sourceByFile.hostedPaperSecurityOperations, "order_created");
requireNotContains("Hosted paper security operations panel does not fetch directly", sourceByFile.hostedPaperSecurityOperations, "fetch(");
requireNotContains("Hosted paper security operations panel does not call workflow record", sourceByFile.hostedPaperSecurityOperations, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper security operations panel does not collect API keys", sourceByFile.hostedPaperSecurityOperations.toLowerCase(), "api_key");
requireNotContains("Hosted paper security operations panel does not collect account IDs", sourceByFile.hostedPaperSecurityOperations.toLowerCase(), "account_id");
requireNotContains("Hosted paper security operations panel does not collect certificates", sourceByFile.hostedPaperSecurityOperations.toLowerCase(), "certificate");
requireContains("English hosted paper sandbox onboarding copy exists", sourceByFile.i18n, "Hosted Paper Sandbox Tenant Onboarding");
requireContains("Traditional Chinese hosted paper sandbox onboarding copy exists", sourceByFile.i18n, "目標客戶體驗");
requireContains("Hosted paper sandbox onboarding component is implemented", sourceByFile.hostedPaperSandboxOnboarding, "HostedPaperSandboxOnboardingPanel");
requireContains("Hosted paper sandbox onboarding endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/sandbox-tenant/onboarding-readiness");
requireContains("Hosted paper sandbox onboarding panel is mounted on page", sourceByFile.page, "HostedPaperSandboxOnboardingPanel");
requireContains("Hosted paper sandbox onboarding shows online tenant flag", sourceByFile.hostedPaperSandboxOnboarding, "online_sandbox_tenant_enabled");
requireContains("Hosted paper sandbox onboarding shows browser-only flag", sourceByFile.hostedPaperSandboxOnboarding, "browser_only_customer_onboarding_enabled");
requireContains("Hosted paper sandbox onboarding shows guided data contract flag", sourceByFile.hostedPaperSandboxOnboarding, "guided_demo_data_contract_defined");
requireContains("Hosted paper sandbox onboarding shows guided data hosted flag", sourceByFile.hostedPaperSandboxOnboarding, "guided_demo_data_hosted");
requireContains("Hosted paper sandbox onboarding shows Paper Only boundary", sourceByFile.hostedPaperSandboxOnboarding, "paper_only_boundary_visible");
requireContains("Hosted paper sandbox onboarding shows live controls false", sourceByFile.hostedPaperSandboxOnboarding, "live_trading_controls_visible");
requireContains("Hosted paper sandbox onboarding shows tenant creation safety flag", sourceByFile.hostedPaperSandboxOnboarding, "online_sandbox_tenant_created");
requireContains("Hosted paper sandbox onboarding shows customer account safety flag", sourceByFile.hostedPaperSandboxOnboarding, "customer_account_created");
requireContains("Hosted paper sandbox onboarding shows hosted datastore safety flag", sourceByFile.hostedPaperSandboxOnboarding, "hosted_datastore_written");
requireContains("Hosted paper sandbox onboarding shows broker safety flag", sourceByFile.hostedPaperSandboxOnboarding, "broker_api_called");
requireContains("Hosted paper sandbox onboarding shows order safety flag", sourceByFile.hostedPaperSandboxOnboarding, "order_created");
requireContains("Hosted paper sandbox onboarding shows production customer onboarding false", sourceByFile.hostedPaperSandboxOnboarding, "production_customer_onboarding_ready");
requireContains("Hosted paper sandbox onboarding shows future demo records", sourceByFile.hostedPaperSandboxOnboarding, "records_included");
requireNotContains("Hosted paper sandbox onboarding panel does not fetch directly", sourceByFile.hostedPaperSandboxOnboarding, "fetch(");
requireNotContains("Hosted paper sandbox onboarding panel does not call workflow record", sourceByFile.hostedPaperSandboxOnboarding, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper sandbox onboarding panel does not collect API keys", sourceByFile.hostedPaperSandboxOnboarding.toLowerCase(), "api_key");
requireNotContains("Hosted paper sandbox onboarding panel does not collect account IDs", sourceByFile.hostedPaperSandboxOnboarding.toLowerCase(), "account_id");
requireNotContains("Hosted paper sandbox onboarding panel does not collect certificates", sourceByFile.hostedPaperSandboxOnboarding.toLowerCase(), "certificate");
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
requireContains("Command Center opens Paper OMS tab first", sourceByFile.commandTabs, 'useState<TabKey>("paper")');
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
requireContains("English hosted paper environment copy exists", sourceByFile.i18n, "Hosted Paper API Environment Contract");
requireContains("Traditional Chinese hosted paper environment copy exists", sourceByFile.i18n, "Hosted Paper API 環境契約");
requireContains("Hosted paper environment component is implemented", sourceByFile.hostedPaperEnvironment, "HostedPaperEnvironmentPanel");
requireContains("Hosted paper environment endpoint is fetched", sourceByFile.page, "/api/hosted-paper/environment");
requireContains("Hosted paper environment panel is mounted on page", sourceByFile.page, "HostedPaperEnvironmentPanel");
requireContains("Hosted paper environment shows Local Demo Mode", combinedSource, "Local Demo Mode");
requireContains("Hosted paper environment shows Hosted Paper Mode", combinedSource, "Hosted Paper Mode");
requireContains("Hosted paper environment shows Production Trading Platform", combinedSource, "Production Trading Platform");
requireContains("Hosted paper environment shows current customer mode", combinedSource, "current_customer_mode");
requireContains("Hosted paper environment keeps hosted mode not enabled", combinedSource, "not_enabled");
requireContains("Hosted paper environment keeps production not ready", combinedSource, "not_ready");
requireContains("Hosted paper environment shows managed datastore boundary", combinedSource, "Managed datastore");
requireContains("Hosted paper environment shows tenant isolation boundary", combinedSource, "Tenant isolation");
requireNotContains("Hosted paper environment does not fetch directly", sourceByFile.hostedPaperEnvironment, "fetch(");
requireNotContains("Hosted paper environment does not call workflow record", sourceByFile.hostedPaperEnvironment, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper environment does not collect API keys", sourceByFile.hostedPaperEnvironment.toLowerCase(), "api_key");
requireNotContains("Hosted paper environment does not collect account IDs", sourceByFile.hostedPaperEnvironment.toLowerCase(), "account_id");
requireNotContains("Hosted paper environment does not collect certificates", sourceByFile.hostedPaperEnvironment.toLowerCase(), "certificate");
requireContains("English hosted paper datastore copy exists", sourceByFile.i18n, "Hosted Paper Managed Datastore Readiness");
requireContains("Traditional Chinese hosted paper datastore copy exists", sourceByFile.i18n, "Hosted Paper Managed Datastore 就緒狀態");
requireContains("Hosted paper datastore component is implemented", sourceByFile.hostedPaperDatastore, "HostedPaperDatastoreReadinessPanel");
requireContains("Hosted paper datastore endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/datastore-readiness");
requireContains("Hosted paper datastore panel is mounted on page", sourceByFile.page, "HostedPaperDatastoreReadinessPanel");
requireContains("Hosted paper datastore shows tenant_id", combinedSource, "tenant_id");
requireContains("Hosted paper datastore shows schema-only state", combinedSource, "schema_only_no_hosted_datastore");
requireContains("Hosted paper datastore shows managed datastore flag", combinedSource, "managed_datastore_enabled");
requireContains("Hosted paper datastore shows hosted write flag", combinedSource, "hosted_records_writable");
requireContains("Hosted paper datastore shows migration boundary", combinedSource, "migration_boundary");
requireContains("Hosted paper datastore shows retention requirements", combinedSource, "retention_requirements");
requireContains("Hosted paper datastore shows approval request table", combinedSource, "hosted_paper_approval_requests");
requireContains("Hosted paper datastore shows workflow run table", combinedSource, "hosted_paper_workflow_runs");
requireContains("Hosted paper datastore shows audit event table", combinedSource, "hosted_paper_audit_events");
requireNotContains("Hosted paper datastore panel does not fetch directly", sourceByFile.hostedPaperDatastore, "fetch(");
requireNotContains("Hosted paper datastore panel does not call workflow record", sourceByFile.hostedPaperDatastore, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper datastore panel does not collect API keys", sourceByFile.hostedPaperDatastore.toLowerCase(), "api_key");
requireNotContains("Hosted paper datastore panel does not collect account IDs", sourceByFile.hostedPaperDatastore.toLowerCase(), "account_id");
requireNotContains("Hosted paper datastore panel does not collect certificates", sourceByFile.hostedPaperDatastore.toLowerCase(), "certificate");
requireContains("English hosted paper production datastore copy exists", sourceByFile.i18n, "Hosted Paper Production Datastore Readiness");
requireContains("Traditional Chinese hosted paper production datastore copy exists", sourceByFile.i18n, "Hosted Paper Production Datastore 就緒狀態");
requireContains("Hosted paper production datastore component is implemented", sourceByFile.hostedPaperProductionDatastore, "HostedPaperProductionDatastoreReadinessPanel");
requireContains("Hosted paper production datastore endpoint is fetched on page", sourceByFile.page, "/api/hosted-paper/production-datastore/readiness");
requireContains("Hosted paper production datastore panel is mounted on page", sourceByFile.page, "HostedPaperProductionDatastoreReadinessPanel");
requireContains("Hosted paper production datastore shows contract-only state", combinedSource, "contract_only_no_production_datastore");
requireContains("Hosted paper production datastore shows managed Postgres pattern", combinedSource, "managed_postgres_via_marketplace_candidate");
requireContains("Hosted paper production datastore shows approval table", combinedSource, "hosted_paper_approval_requests");
requireContains("Hosted paper production datastore shows order table", combinedSource, "hosted_paper_orders");
requireContains("Hosted paper production datastore shows OMS event table", combinedSource, "hosted_paper_oms_events");
requireContains("Hosted paper production datastore shows audit event table", combinedSource, "hosted_paper_audit_events");
requireContains("Hosted paper production datastore shows DATABASE_URL boundary", sourceByFile.hostedPaperProductionDatastore, "database_url_read");
requireContains("Hosted paper production datastore shows local SQLite production false", combinedSource, "local_sqlite_allowed_for_production");
requireNotContains("Hosted paper production datastore panel does not fetch directly", sourceByFile.hostedPaperProductionDatastore, "fetch(");
requireNotContains("Hosted paper production datastore panel does not call workflow record", sourceByFile.hostedPaperProductionDatastore, "/api/paper-execution/workflow/record");
requireNotContains("Hosted paper production datastore panel does not collect API keys", sourceByFile.hostedPaperProductionDatastore.toLowerCase(), "api_key");
requireNotContains("Hosted paper production datastore panel does not collect account IDs", sourceByFile.hostedPaperProductionDatastore.toLowerCase(), "account_id");
requireNotContains("Hosted paper production datastore panel does not collect certificates", sourceByFile.hostedPaperProductionDatastore.toLowerCase(), "certificate");
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
requireContains("English paper compliance approval readiness copy exists", sourceByFile.i18n, "Local paper scaffolding, not formal compliance approval");
requireContains("Traditional Chinese paper compliance approval readiness copy exists", sourceByFile.i18n, "本地紙上骨架，不是正式合規審批");
requireContains("Paper compliance approval readiness component is implemented", sourceByFile.paperComplianceApproval, "PaperComplianceApprovalReadinessPanel");
requireContains("Paper compliance approval readiness endpoint is fetched on page", sourceByFile.page, "/api/paper-execution/approvals/compliance-readiness");
requireContains("Paper compliance approval readiness panel is mounted on page", sourceByFile.page, "PaperComplianceApprovalReadinessPanel");
requireContains("Paper compliance approval readiness panel shows formal compliance status", sourceByFile.paperComplianceApproval, "formal_compliance_approval_enabled");
requireContains("Paper compliance approval readiness panel shows production approval authority", sourceByFile.paperComplianceApproval, "production_approval_authority");
requireContains("Paper compliance approval readiness panel shows reviewer identity status", sourceByFile.paperComplianceApproval, "reviewer_identity_verified");
requireContains("Paper compliance approval readiness panel shows RBAC/ABAC status", sourceByFile.paperComplianceApproval, "rbac_abac_enforced");
requireContains("Paper compliance approval readiness panel shows WORM status", sourceByFile.paperComplianceApproval, "worm_ledger_enabled");
requireContains("Paper compliance approval readiness panel shows centralized audit status", sourceByFile.paperComplianceApproval, "centralized_audit_service_enabled");
requireContains("Paper compliance approval readiness panel shows production compliance flag", sourceByFile.paperComplianceApproval, "production_compliance_approval");
requireContains("Paper compliance approval readiness panel shows live approval flag", sourceByFile.paperComplianceApproval, "live_approval_granted");
requireContains("Paper compliance approval readiness panel shows paper execution approval flag", sourceByFile.paperComplianceApproval, "paper_execution_approval_granted");
requireContains("Paper compliance approval readiness panel shows safety defaults", sourceByFile.paperComplianceApproval, "TRADING_MODE");
requireContains("Paper compliance approval readiness panel shows live disabled default", sourceByFile.paperComplianceApproval, "ENABLE_LIVE_TRADING");
requireContains("Paper compliance approval readiness panel shows paper broker default", sourceByFile.paperComplianceApproval, "BROKER_PROVIDER");
requireNotContains("Paper compliance approval readiness panel does not fetch directly", sourceByFile.paperComplianceApproval, "fetch(");
requireNotContains("Paper compliance approval readiness panel does not call workflow record", sourceByFile.paperComplianceApproval, "/api/paper-execution/workflow/record");
requireNotContains("Paper compliance approval readiness panel does not call approval mutations", sourceByFile.paperComplianceApproval, "/api/paper-execution/approvals/requests");
requireNotContains("Paper compliance approval readiness panel does not collect API keys", sourceByFile.paperComplianceApproval.toLowerCase(), "api_key");
requireNotContains("Paper compliance approval readiness panel does not collect account IDs", sourceByFile.paperComplianceApproval.toLowerCase(), "account_id");
requireNotContains("Paper compliance approval readiness panel does not collect certificates", sourceByFile.paperComplianceApproval.toLowerCase(), "certificate");
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
requireContains("Local demo setup English copy exists", sourceByFile.i18n, "Start a local Paper Only demo");
requireContains("Local demo setup Chinese copy exists", sourceByFile.i18n, "啟動本地 Paper Only Demo");
requireContains("Local demo setup component is implemented", sourceByFile.localDemoSetup, "LocalDemoSetupPanel");
requireContains("Local demo setup exposes env check command", sourceByFile.localDemoSetup, "make customer-demo-env-check");
requireContains("Local demo setup exposes start command", sourceByFile.localDemoSetup, "make start-customer-demo");
requireContains("Local demo setup exposes Windows wrapper", sourceByFile.localDemoSetup, "scripts/start-customer-demo.ps1");
requireContains("Local demo setup shows local-only flag", sourceByFile.localDemoSetup, "LOCAL_MACHINE_ONLY=true");
requireContains("Local demo setup shows no hosted accounts", sourceByFile.localDemoSetup, "HOSTED_CUSTOMER_ACCOUNTS=false");
requireContains("Local demo setup shows no broker credentials", sourceByFile.localDemoSetup, "BROKER_CREDENTIALS_COLLECTED=false");
requireContains("Local demo setup is mounted on page", sourceByFile.page, "LocalDemoSetupPanel");
requireNotContains("Local demo setup does not fetch backend", sourceByFile.localDemoSetup, "fetch(");
requireNotContains("Local demo setup does not call workflow record", sourceByFile.localDemoSetup, "/api/paper-execution/workflow/record");
requireNotContains("Local demo setup does not collect API keys", sourceByFile.localDemoSetup.toLowerCase(), "api_key");
requireNotContains("Local demo setup does not collect account IDs", sourceByFile.localDemoSetup.toLowerCase(), "account_id");
requireNotContains("Local demo setup does not collect certificates", sourceByFile.localDemoSetup.toLowerCase(), "certificate");
requireContains("English browser-only mock demo copy exists", sourceByFile.i18n, "Browser-only Mock Runtime");
requireContains("Traditional Chinese browser-only mock demo copy exists", sourceByFile.i18n, "瀏覽器內互動 Demo");
requireContains("Browser-only mock runtime is implemented", sourceByFile.browserOnlyMockRuntime, "createInitialBrowserOnlyMockSession");
requireContains("Browser-only mock runtime advances ticks", sourceByFile.browserOnlyMockRuntime, "advanceBrowserOnlyMockTick");
requireContains("Browser-only mock runtime runs signal-only strategy", sourceByFile.browserOnlyMockRuntime, "runBrowserOnlyMockStrategy");
requireContains("Browser-only mock runtime simulates paper order", sourceByFile.browserOnlyMockRuntime, "simulateBrowserOnlyPaperOrder");
requireContains("Browser-only mock runtime keeps browser_only flag", sourceByFile.browserOnlyMockRuntime, "browser_only: true");
requireContains("Browser-only mock runtime keeps live disabled", sourceByFile.browserOnlyMockRuntime, "live_trading_enabled: false");
requireContains("Browser-only mock runtime keeps broker disabled", sourceByFile.browserOnlyMockRuntime, "broker_api_called: false");
requireContains("Browser-only mock runtime keeps database write disabled", sourceByFile.browserOnlyMockRuntime, "database_written: false");
requireContains("Browser-only mock runtime keeps performance claim disabled", sourceByFile.browserOnlyMockRuntime, "performance_claim: false");
requireContains("Browser-only mock runtime includes market regime model", sourceByFile.browserOnlyMockRuntime, "BrowserMockMarketRegime");
requireContains("Browser-only mock runtime includes stale quote regime", sourceByFile.browserOnlyMockRuntime, "stale_quote");
requireContains("Browser-only mock runtime includes dynamic spread", sourceByFile.browserOnlyMockRuntime, "spread_points");
requireContains("Browser-only mock runtime includes liquidity model", sourceByFile.browserOnlyMockRuntime, "liquidity_score");
requireContains("Browser-only mock runtime includes slippage estimate", sourceByFile.browserOnlyMockRuntime, "slippage_points_estimate");
requireContains("Browser-only mock runtime includes market realism evidence", sourceByFile.browserOnlyMockRuntime, "BrowserMockMarketRealism");
requireContains("Browser-only mock guide is implemented", sourceByFile.browserOnlyMockGuide, "BrowserOnlyMockDemoGuide");
requireContains("Browser-only mock guide uses stepper actions", sourceByFile.browserOnlyMockGuide, "BrowserOnlyGuideAction");
requireContains("Browser-only mock guide exposes session id", sourceByFile.browserOnlyMockGuide, "session_id");
requireContains("Browser-only mock guide exposes mock seed", sourceByFile.browserOnlyMockGuide, "mock_seed");
requireContains("Browser-only mock guide explains results", sourceByFile.browserOnlyMockGuide, "resultLabel");
requireContains("Browser-only mock demo component is implemented", sourceByFile.browserOnlyMockDemo, "BrowserOnlyMockDemoPanel");
requireContains("Browser-only mock demo uses localStorage", sourceByFile.browserOnlyMockDemo, "localStorage");
requireContains("Browser-only mock demo asserts safety", sourceByFile.browserOnlyMockDemo, "assertBrowserOnlySafety");
requireContains("Browser-only mock demo copies summary", sourceByFile.browserOnlyMockDemo, "copyDemoSummary");
requireContains("Browser-only mock demo copies evidence", sourceByFile.browserOnlyMockDemo, "copyEvidenceJson");
requireContains("Browser-only mock demo clears local state", sourceByFile.browserOnlyMockDemo, "clearDemoState");
requireContains("Browser-only mock demo shows market regime", sourceByFile.browserOnlyMockDemo, "marketRegime");
requireContains("Browser-only mock demo shows fill reason", sourceByFile.browserOnlyMockDemo, "fillReason");
requireContains("Browser-only mock demo panel is mounted on page", sourceByFile.page, "BrowserOnlyMockDemoPanel");
requireContains("Browser-only mock demo is mounted before paper workflow", sourceByFile.page, "paper={\n          <>\n            <BrowserOnlyMockDemoPanel");
requireContains("Browser-only mock copy keeps no backend language", sourceByFile.i18n, "No backend required");
requireContains("Browser-only mock copy keeps Chinese no backend language", sourceByFile.i18n, "不需要後端");
requireContains("Browser-only mock copy includes guided demo", sourceByFile.i18n, "Complete browser-only walkthrough");
requireContains("Browser-only mock copy includes Chinese guided demo", sourceByFile.i18n, "完整 Browser-only 操作流程");
requireContains("Browser-only mock copy includes market realism", sourceByFile.i18n, "Market Realism");
requireContains("Browser-only mock copy includes Chinese market realism", sourceByFile.i18n, "市場真實度");
requireContains("Browser-only mock copy includes stale quote boundary", sourceByFile.i18n, "stale_quote");
requireContains("Browser-only mock copy includes fill reason", sourceByFile.i18n, "Fill reason");
requireContains("Browser-only mock copy includes Chinese fill reason", sourceByFile.i18n, "成交原因");
requireContains("Command Center copy states Paper OMS opens first", sourceByFile.i18n, "Paper OMS tab opens first");
requireContains("Chinese Command Center copy states Paper OMS opens first", sourceByFile.i18n, "預設先開啟 Paper OMS");
requireNotContains("Browser-only mock demo does not fetch backend", sourceByFile.browserOnlyMockDemo, "fetch(");
requireNotContains("Browser-only mock demo does not call command API base", sourceByFile.browserOnlyMockDemo, "commandCenterApiBaseUrl");
requireNotContains("Browser-only mock runtime does not call fetch", sourceByFile.browserOnlyMockRuntime, "fetch(");
requireNotContains("Browser-only mock demo does not call paper workflow record", sourceByFile.browserOnlyMockDemo, "/api/paper-execution/workflow/record");
requireNotContains("Browser-only mock demo does not collect API keys", sourceByFile.browserOnlyMockDemo.toLowerCase(), "api_key");
requireNotContains("Browser-only mock demo does not collect account IDs", sourceByFile.browserOnlyMockDemo.toLowerCase(), "account_id");
requireNotContains("Browser-only mock demo does not collect certificates", sourceByFile.browserOnlyMockDemo.toLowerCase(), "certificate");
requireContains("English mock backend demo copy exists", sourceByFile.i18n, "Mock Backend Demo MVP");
requireContains("Traditional Chinese mock backend demo copy exists", sourceByFile.i18n, "模擬後端");
requireContains("Mock backend demo component is implemented", sourceByFile.mockBackendDemo, "MockBackendDemoPanel");
requireContains("Mock backend status endpoint is called", sourceByFile.mockBackendDemo, "/api/mock-backend/status");
requireContains("Mock backend market data endpoint is called", sourceByFile.mockBackendDemo, "/api/mock-backend/market-data/preview");
requireContains("Mock backend strategy endpoint is called", sourceByFile.mockBackendDemo, "/api/mock-backend/strategy/run");
requireContains("Mock backend order endpoint is called", sourceByFile.mockBackendDemo, "/api/mock-backend/order/simulate");
requireContains("Mock backend reset endpoint is called", sourceByFile.mockBackendDemo, "/api/mock-backend/demo-session/reset");
requireContains("Mock backend panel checks paper_only", sourceByFile.mockBackendDemo, "paper_only");
requireContains("Mock backend panel checks live disabled", sourceByFile.mockBackendDemo, "live_trading_enabled");
requireContains("Mock backend panel checks broker flag", sourceByFile.mockBackendDemo, "broker_api_called");
requireContains("Mock backend panel checks external data flag", sourceByFile.mockBackendDemo, "external_market_data_downloaded");
requireContains("Mock backend panel checks real order flag", sourceByFile.mockBackendDemo, "real_order_created");
requireContains("Mock backend panel checks credential flag", sourceByFile.mockBackendDemo, "credentials_collected");
requireContains("Mock backend panel checks production readiness flag", sourceByFile.mockBackendDemo, "production_trading_ready");
requireContains("Mock backend panel is mounted on page", sourceByFile.page, "MockBackendDemoPanel");
requireContains("Mock backend copy keeps no real money language", sourceByFile.i18n, "No real money");
requireContains("Mock backend copy keeps no broker language", sourceByFile.i18n, "No broker");
requireContains("Mock backend copy keeps not investment advice language", sourceByFile.i18n, "Not investment advice");
requireNotContains("Mock backend panel does not call paper workflow record", sourceByFile.mockBackendDemo, "/api/paper-execution/workflow/record");
requireNotContains("Mock backend panel does not collect API keys", sourceByFile.mockBackendDemo.toLowerCase(), "api_key");
requireNotContains("Mock backend panel does not collect account IDs", sourceByFile.mockBackendDemo.toLowerCase(), "account_id");
requireNotContains("Mock backend panel does not collect certificates", sourceByFile.mockBackendDemo.toLowerCase(), "certificate");
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
requireContains("English paper risk cross-account readiness copy exists", sourceByFile.i18n, "Paper risk cross-account readiness");
requireContains("Traditional Chinese paper risk cross-account readiness copy exists", sourceByFile.i18n, "紙上跨帳戶風控 Readiness");
requireContains("Paper risk cross-account readiness panel is implemented", sourceByFile.paperRiskCrossAccountReadiness, "PaperRiskCrossAccountReadinessPanel");
requireContains("Paper risk cross-account readiness endpoint is read on page", sourceByFile.page, "/api/paper-risk/cross-account-readiness");
requireContains("Paper risk cross-account readiness panel is mounted on page", sourceByFile.page, "PaperRiskCrossAccountReadinessPanel");
requireContains("Paper risk cross-account readiness panel shows local paper guardrails", sourceByFile.paperRiskCrossAccountReadiness, "local_paper_guardrails_enabled");
requireContains("Paper risk cross-account readiness panel shows local paper state", sourceByFile.paperRiskCrossAccountReadiness, "local_paper_state_enabled");
requireContains("Paper risk cross-account readiness panel shows single account demo state", sourceByFile.paperRiskCrossAccountReadiness, "single_account_demo_state_enabled");
requireContains("Paper risk cross-account readiness panel shows risk evaluation detail", sourceByFile.paperRiskCrossAccountReadiness, "risk_evaluation_detail_enabled");
requireContains("Paper risk cross-account readiness panel shows local duplicate idempotency", sourceByFile.paperRiskCrossAccountReadiness, "duplicate_idempotency_local_check_enabled");
requireContains("Paper risk cross-account readiness panel shows cross-account aggregation false", sourceByFile.paperRiskCrossAccountReadiness, "cross_account_aggregation_enabled");
requireContains("Paper risk cross-account readiness panel shows account hierarchy false", sourceByFile.paperRiskCrossAccountReadiness, "account_hierarchy_enabled");
requireContains("Paper risk cross-account readiness panel shows tenant-isolated risk state false", sourceByFile.paperRiskCrossAccountReadiness, "tenant_isolated_risk_state_enabled");
requireContains("Paper risk cross-account readiness panel shows real account margin feed false", sourceByFile.paperRiskCrossAccountReadiness, "real_account_margin_feed_enabled");
requireContains("Paper risk cross-account readiness panel shows broker position feed false", sourceByFile.paperRiskCrossAccountReadiness, "broker_position_feed_enabled");
requireContains("Paper risk cross-account readiness panel shows centralized risk limits false", sourceByFile.paperRiskCrossAccountReadiness, "centralized_risk_limits_enabled");
requireContains("Paper risk cross-account readiness panel shows distributed kill switch false", sourceByFile.paperRiskCrossAccountReadiness, "distributed_kill_switch_enabled");
requireContains("Paper risk cross-account readiness panel shows durable risk state store false", sourceByFile.paperRiskCrossAccountReadiness, "durable_risk_state_store_enabled");
requireContains("Paper risk cross-account readiness panel shows equity PnL tracking false", sourceByFile.paperRiskCrossAccountReadiness, "real_time_equity_pnl_tracking_enabled");
requireContains("Paper risk cross-account readiness panel shows production cross-account risk false", sourceByFile.paperRiskCrossAccountReadiness, "production_cross_account_risk_system");
requireContains("Paper risk cross-account readiness panel shows external account data safety flag", sourceByFile.paperRiskCrossAccountReadiness, "external_account_data_loaded");
requireContains("Paper risk cross-account readiness panel shows real account data safety flag", sourceByFile.paperRiskCrossAccountReadiness, "real_account_data_loaded");
requireContains("Paper risk cross-account readiness panel shows production risk approval false", sourceByFile.paperRiskCrossAccountReadiness, "production_risk_approval");
requireNotContains("Paper risk cross-account readiness panel does not call workflow record", sourceByFile.paperRiskCrossAccountReadiness, "/api/paper-execution/workflow/record");
requireNotContains("Paper risk cross-account readiness panel does not call risk evaluate mutation", sourceByFile.paperRiskCrossAccountReadiness, "/api/paper-risk/evaluate");
requireNotContains("Paper risk cross-account readiness panel does not fetch backend", sourceByFile.paperRiskCrossAccountReadiness, "fetch(");
requireNotContains("Paper risk cross-account readiness panel does not collect API keys", sourceByFile.paperRiskCrossAccountReadiness.toLowerCase(), "api_key");
requireNotContains("Paper risk cross-account readiness panel does not collect account IDs", sourceByFile.paperRiskCrossAccountReadiness.toLowerCase(), "account_id");
requireNotContains("Paper risk cross-account readiness panel does not collect certificates", sourceByFile.paperRiskCrossAccountReadiness.toLowerCase(), "certificate");
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
requireContains("English paper broker simulation readiness copy exists", sourceByFile.i18n, "Paper broker simulation is not market matching");
requireContains("Traditional Chinese paper broker simulation readiness copy exists", sourceByFile.i18n, "紙上券商模擬不是真實市場撮合");
requireContains("Paper broker simulation readiness panel is implemented", sourceByFile.paperBrokerSimulationReadiness, "PaperBrokerSimulationReadinessPanel");
requireContains("Paper broker simulation readiness endpoint is read on page", sourceByFile.page, "/api/paper-execution/broker-simulation/readiness");
requireContains("Paper broker simulation readiness panel is mounted on page", sourceByFile.page, "PaperBrokerSimulationReadinessPanel");
requireContains("Paper broker simulation readiness panel shows deterministic simulation", sourceByFile.paperBrokerSimulationReadiness, "deterministic_broker_simulation_enabled");
requireContains("Paper broker simulation readiness panel shows local quote preview", sourceByFile.paperBrokerSimulationReadiness, "local_quote_snapshot_preview_enabled");
requireContains("Paper broker simulation readiness panel shows paper outcomes", sourceByFile.paperBrokerSimulationReadiness, "paper_ack_reject_partial_fill_fill_cancel_enabled");
requireContains("Paper broker simulation readiness panel shows caller-provided quote only", sourceByFile.paperBrokerSimulationReadiness, "caller_provided_quote_only");
requireContains("Paper broker simulation readiness panel shows real matching false", sourceByFile.paperBrokerSimulationReadiness, "real_market_matching_engine_enabled");
requireContains("Paper broker simulation readiness panel shows order book replay false", sourceByFile.paperBrokerSimulationReadiness, "exchange_order_book_replay_enabled");
requireContains("Paper broker simulation readiness panel shows broker execution report model false", sourceByFile.paperBrokerSimulationReadiness, "broker_execution_report_model_enabled");
requireContains("Paper broker simulation readiness panel shows latency queue model false", sourceByFile.paperBrokerSimulationReadiness, "latency_queue_position_model_enabled");
requireContains("Paper broker simulation readiness panel shows slippage liquidity calibration false", sourceByFile.paperBrokerSimulationReadiness, "slippage_liquidity_calibration_enabled");
requireContains("Paper broker simulation readiness panel shows reconciliation false", sourceByFile.paperBrokerSimulationReadiness, "real_account_reconciliation_enabled");
requireContains("Paper broker simulation readiness panel shows production execution model false", sourceByFile.paperBrokerSimulationReadiness, "production_execution_model");
requireContains("Paper broker simulation readiness panel shows external data safety flag", sourceByFile.paperBrokerSimulationReadiness, "external_market_data_downloaded");
requireContains("Paper broker simulation readiness panel shows real order flag", sourceByFile.paperBrokerSimulationReadiness, "real_order_created");
requireNotContains("Paper broker simulation readiness panel does not fetch backend", sourceByFile.paperBrokerSimulationReadiness, "fetch(");
requireNotContains("Paper broker simulation readiness panel does not call workflow record", sourceByFile.paperBrokerSimulationReadiness, "/api/paper-execution/workflow/record");
requireNotContains("Paper broker simulation readiness panel does not call broker simulation preview", sourceByFile.paperBrokerSimulationReadiness, "/api/paper-execution/broker-simulation/preview");
requireNotContains("Paper broker simulation readiness panel does not collect API keys", sourceByFile.paperBrokerSimulationReadiness.toLowerCase(), "api_key");
requireNotContains("Paper broker simulation readiness panel does not collect account IDs", sourceByFile.paperBrokerSimulationReadiness.toLowerCase(), "account_id");
requireNotContains("Paper broker simulation readiness panel does not collect certificates", sourceByFile.paperBrokerSimulationReadiness.toLowerCase(), "certificate");
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
requireContains("English paper OMS production readiness copy exists", sourceByFile.i18n, "Paper OMS is not a production OMS");
requireContains("Traditional Chinese paper OMS production readiness copy exists", sourceByFile.i18n, "Paper OMS 不是 production OMS");
requireContains("Paper OMS production readiness panel is implemented", sourceByFile.paperOmsProductionReadiness, "PaperOmsProductionReadinessPanel");
requireContains("Paper OMS production readiness endpoint is read on page", sourceByFile.page, "/api/paper-execution/reliability/production-readiness");
requireContains("Paper OMS production readiness panel is mounted on page", sourceByFile.page, "PaperOmsProductionReadinessPanel");
requireContains("Paper OMS production readiness panel shows state machine flag", sourceByFile.paperOmsProductionReadiness, "order_state_machine_enabled");
requireContains("Paper OMS production readiness panel shows local outbox metadata", sourceByFile.paperOmsProductionReadiness, "local_outbox_metadata_enabled");
requireContains("Paper OMS production readiness panel shows duplicate idempotency metadata", sourceByFile.paperOmsProductionReadiness, "duplicate_idempotency_metadata_enabled");
requireContains("Paper OMS production readiness panel shows execution report metadata", sourceByFile.paperOmsProductionReadiness, "execution_report_metadata_enabled");
requireContains("Paper OMS production readiness panel shows timeout candidate scan", sourceByFile.paperOmsProductionReadiness, "timeout_candidate_scan_enabled");
requireContains("Paper OMS production readiness panel shows async processing flag", sourceByFile.paperOmsProductionReadiness, "asynchronous_order_processing_enabled");
requireContains("Paper OMS production readiness panel shows durable queue flag", sourceByFile.paperOmsProductionReadiness, "distributed_durable_queue_enabled");
requireContains("Paper OMS production readiness panel shows outbox worker flag", sourceByFile.paperOmsProductionReadiness, "outbox_worker_enabled");
requireContains("Paper OMS production readiness panel shows timeout worker flag", sourceByFile.paperOmsProductionReadiness, "full_timeout_worker_enabled");
requireContains("Paper OMS production readiness panel shows amend replace flag", sourceByFile.paperOmsProductionReadiness, "amend_replace_enabled");
requireContains("Paper OMS production readiness panel shows broker execution report ingestion flag", sourceByFile.paperOmsProductionReadiness, "broker_execution_report_ingestion_enabled");
requireContains("Paper OMS production readiness panel shows reconciliation loop flag", sourceByFile.paperOmsProductionReadiness, "formal_reconciliation_loop_enabled");
requireContains("Paper OMS production readiness panel shows production OMS false", sourceByFile.paperOmsProductionReadiness, "production_oms_ready");
requireNotContains("Paper OMS production readiness panel does not fetch backend", sourceByFile.paperOmsProductionReadiness, "fetch(");
requireNotContains("Paper OMS production readiness panel does not call workflow record", sourceByFile.paperOmsProductionReadiness, "/api/paper-execution/workflow/record");
requireNotContains("Paper OMS production readiness panel does not call timeout mutation", sourceByFile.paperOmsProductionReadiness, "/api/paper-execution/reliability/timeout-mark");
requireNotContains("Paper OMS production readiness panel does not collect API keys", sourceByFile.paperOmsProductionReadiness.toLowerCase(), "api_key");
requireNotContains("Paper OMS production readiness panel does not collect account IDs", sourceByFile.paperOmsProductionReadiness.toLowerCase(), "account_id");
requireNotContains("Paper OMS production readiness panel does not collect certificates", sourceByFile.paperOmsProductionReadiness.toLowerCase(), "certificate");
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
requireContains("English paper audit WORM readiness copy exists", sourceByFile.i18n, "SQLite audit is not a production WORM ledger");
requireContains("Traditional Chinese paper audit WORM readiness copy exists", sourceByFile.i18n, "SQLite audit 不是 production WORM ledger");
requireContains("Paper audit WORM readiness panel is implemented", sourceByFile.paperAuditWormReadiness, "PaperAuditWormReadinessPanel");
requireContains("Paper audit WORM readiness endpoint is read on page", sourceByFile.page, "/api/paper-execution/audit-integrity/worm-readiness");
requireContains("Paper audit WORM readiness panel is mounted on page", sourceByFile.page, "PaperAuditWormReadinessPanel");
requireContains("Paper audit WORM readiness panel shows local SQLite status", sourceByFile.paperAuditWormReadiness, "local_sqlite_audit_enabled");
requireContains("Paper audit WORM readiness panel shows local hash chain status", sourceByFile.paperAuditWormReadiness, "local_hash_chain_enabled");
requireContains("Paper audit WORM readiness panel shows WORM storage flag", sourceByFile.paperAuditWormReadiness, "worm_storage_enabled");
requireContains("Paper audit WORM readiness panel shows immutable ledger flag", sourceByFile.paperAuditWormReadiness, "immutable_ledger_enabled");
requireContains("Paper audit WORM readiness panel shows append-only storage flag", sourceByFile.paperAuditWormReadiness, "append_only_enforced_by_storage");
requireContains("Paper audit WORM readiness panel shows centralized audit flag", sourceByFile.paperAuditWormReadiness, "centralized_audit_service_enabled");
requireContains("Paper audit WORM readiness panel shows object lock flag", sourceByFile.paperAuditWormReadiness, "object_lock_enabled");
requireContains("Paper audit WORM readiness panel shows external timestamping flag", sourceByFile.paperAuditWormReadiness, "external_timestamping_enabled");
requireContains("Paper audit WORM readiness panel shows cryptographic signing flag", sourceByFile.paperAuditWormReadiness, "cryptographic_signing_enabled");
requireContains("Paper audit WORM readiness panel shows retention policy flag", sourceByFile.paperAuditWormReadiness, "retention_policy_enforced");
requireContains("Paper audit WORM readiness panel shows no compliance claim", sourceByFile.paperAuditWormReadiness, "worm_compliance_claim");
requireContains("Paper audit WORM readiness panel shows production audit compliance false", sourceByFile.paperAuditWormReadiness, "production_audit_compliance");
requireNotContains("Paper audit WORM readiness panel does not fetch backend", sourceByFile.paperAuditWormReadiness, "fetch(");
requireNotContains("Paper audit WORM readiness panel does not call workflow record", sourceByFile.paperAuditWormReadiness, "/api/paper-execution/workflow/record");
requireNotContains("Paper audit WORM readiness panel does not call audit verify mutation", sourceByFile.paperAuditWormReadiness, "/api/paper-execution/audit-integrity/verify");
requireNotContains("Paper audit WORM readiness panel does not collect API keys", sourceByFile.paperAuditWormReadiness.toLowerCase(), "api_key");
requireNotContains("Paper audit WORM readiness panel does not collect account IDs", sourceByFile.paperAuditWormReadiness.toLowerCase(), "account_id");
requireNotContains("Paper audit WORM readiness panel does not collect certificates", sourceByFile.paperAuditWormReadiness.toLowerCase(), "certificate");
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
