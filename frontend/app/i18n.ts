export type Language = "en" | "zh";

export const dashboardCopy = {
  en: {
    htmlLang: "en",
    languageToggleLabel: "Language",
    languageOptions: {
      en: "English",
      zh: "繁中",
    },
    hero: {
      eyebrow: "Web Command Center",
      title: "Taifex Quant Trading Platform",
      lead:
        "Paper-first control surface for the Phase 0-6 cloud-native roadmap. Strategy signals, risk checks, OMS state, and broker gateway boundaries stay decoupled.",
      safetyAria: "Runtime safety status",
      tradingModePrefix: "TRADING_MODE",
      liveDisabled: "Live disabled",
      brokerPrefix: "Broker",
    },
    summary: {
      ariaLabel: "System summary",
      backendHealth: {
        kicker: "Backend Health",
        connected: "Connected",
        fallback: "Fallback Mode",
      },
      safetyMode: {
        kicker: "Safety Mode",
        paperOnly: "Paper Only",
        reviewRequired: "Review Required",
      },
      riskDefaults: {
        kicker: "Risk Defaults",
        title: "TX-equivalent limit",
        text: "Max daily loss and stale quote limits are visible before any future OMS workflow.",
      },
    },
    productValueAlignment: {
      eyebrow: "Product Positioning",
      title: "Taiwan index futures data analysis and Paper Trading research platform",
      description:
        "This Web App turns the website promise into an interactive research workflow: users can inspect mock TX / MTX / TMF data, validate a strategy hypothesis, simulate a Paper Only order, review OMS events, and copy evidence without broker connectivity or real-money exposure.",
      featureLabel: "Feature",
      benefitLabel: "User benefit",
      cards: [
        {
          kicker: "Market Data Lab",
          title: "Understand TX / MTX / TMF data before trading decisions",
          feature:
            "Deterministic quote snapshots, bid / ask / last, quote age, spread, and contract exposure context.",
          benefit:
            "Users can learn how market data flows through the platform and compare contract sizing before testing a strategy.",
        },
        {
          kicker: "Strategy Research",
          title: "Validate signal logic without creating orders",
          feature:
            "A mock strategy emits a standardized StrategySignal with signals_only=true.",
          benefit:
            "Users can separate research judgment from execution and quickly see what a strategy would request before any paper order simulation.",
        },
        {
          kicker: "Paper Trading Simulator",
          title: "Experience order workflow without broker risk",
          feature:
            "PaperOrderIntent, paper risk checks, simulated OMS lifecycle, and browser-local paper fill outcomes.",
          benefit:
            "Users can practice the end-to-end workflow and understand why a simulated order is accepted, rejected, partially filled, or filled.",
        },
        {
          kicker: "Portfolio Review",
          title: "See simulated position and PnL impact",
          feature:
            "Paper-only position, average price, unrealized PnL, paper equity, and resettable session state.",
          benefit:
            "Users can connect each simulated action to position changes while keeping the output clearly marked as demo metrics, not performance claims.",
        },
        {
          kicker: "Evidence Center",
          title: "Keep demo results reviewable",
          feature:
            "Copy demo summary, evidence JSON, session id, deterministic seed, and localStorage key.",
          benefit:
            "Users and reviewers can reproduce the browser-local scenario, share feedback, and audit what was shown in the demo.",
        },
      ],
      flowAriaLabel: "Interactive demo value flow",
      flowKicker: "Research Workflow",
      flowTitle: "From analysis to paper decision review",
      flowSteps: [
        "Market data preview",
        "StrategySignal generation",
        "Paper Only order simulation",
        "OMS timeline review",
        "Simulated position / PnL review",
        "Evidence JSON handoff",
      ],
      safetyKicker: "Safety Boundary",
      safetyTitle: "What this platform deliberately does not do",
      safetyItems: [
        "No real broker connection",
        "No real order submission",
        "No credential collection",
        "No investment advice",
        "No performance claim",
        "Production Trading Platform remains NOT READY",
      ],
    },
    workflowStandardization: {
      eyebrow: "Workflow Standardization",
      title: "How the demo maps to the quant operating workflow",
      description:
        "This learning layer connects the browser demo to the standardized method in docs/quant-workflow-standardization.md. It shows how data, strategy, backtest, rollover, Paper Trading, Risk Engine, OMS, and audit evidence fit together before any production trading path exists.",
      demoActionLabel: "Demo action",
      standardLabel: "Standardized control",
      steps: [
        {
          kicker: "Data",
          title: "Data standardization",
          description:
            "TX / MTX / TMF quote snapshots use a common exposure language before strategy logic runs.",
          demoAction: "Generate market tick",
          standard:
            "Market data should carry symbol, bid, ask, last, quote age, session context, and TX-equivalent exposure meaning.",
        },
        {
          kicker: "Signal",
          title: "StrategySignal standardization",
          description:
            "The strategy emits a signal only; the platform owns all order-like workflow steps.",
          demoAction: "Run mock strategy",
          standard:
            "StrategySignal stays signals_only=true and never calls broker, Risk Engine, OMS, or Broker Gateway directly.",
        },
        {
          kicker: "Backtest",
          title: "Backtest reproducibility",
          description:
            "Research outputs should be tied to data versions, code versions, parameters, costs, and review notes.",
          demoAction: "Inspect session id, seed, and evidence JSON",
          standard:
            "Backtest and demo artifacts must remain reproducible metadata and must not be treated as performance claims.",
        },
        {
          kicker: "Rollover",
          title: "Rollover data separation",
          description:
            "Research can use adjusted continuous data, but paper and future execution mapping must reference real contracts.",
          demoAction: "Review TX / MTX / TMF contract context",
          standard:
            "Rollover metadata separates research-only continuous futures from executable contract symbols and prices.",
        },
        {
          kicker: "Paper intent",
          title: "PaperOrderIntent flow",
          description:
            "Only the platform converts a StrategySignal into a Paper Only order intent.",
          demoAction: "Simulate Paper Only order",
          standard:
            "PaperOrderIntent is platform-owned and cannot approve live trading, collect credentials, or create real orders.",
        },
        {
          kicker: "Risk",
          title: "Risk Engine checks",
          description:
            "Paper risk checks explain why a simulated workflow can proceed or must be rejected.",
          demoAction: "Review risk approval result",
          standard:
            "Risk checks cover paper mode, live-disabled status, stale quotes, exposure, size, duplicate keys, and safety flags.",
        },
        {
          kicker: "OMS",
          title: "OMS lifecycle",
          description:
            "The simulated OMS timeline makes lifecycle transitions visible instead of hiding them in strategy code.",
          demoAction: "Review OMS timeline",
          standard:
            "OMS owns order state, idempotency, terminal status, and future reconciliation boundaries.",
        },
        {
          kicker: "Audit",
          title: "Audit evidence",
          description:
            "Reviewer handoff requires a small evidence artifact that describes what happened and what stayed simulated.",
          demoAction: "Copy demo summary or evidence JSON",
          standard:
            "Audit evidence must preserve safety flags and remain local/browser-only unless a future reviewed data layer exists.",
        },
      ],
      safetyKicker: "Safety Boundary",
      safetyTitle: "Learning layer only, not an execution path",
      safetyDescription:
        "This panel is read-only product education. It does not fetch backend data, upload evidence, write databases, call brokers, create orders, collect credentials, or provide investment advice.",
      safetyItems: [
        "Paper Only",
        "Browser-only / mock demo where applicable",
        "No broker",
        "No real order",
        "No credentials",
        "Not investment advice",
        "Production Trading Platform: NOT READY",
      ],
    },
    demoGuide: {
      ariaLabel: "Customer demo guided flow",
      eyebrow: "Demo Tour",
      title: "Customer Demo Guided Flow",
      description:
        "A read-only walkthrough for understanding release level, safety defaults, paper OMS records, research packets, and contract specs. The tour changes only local UI state.",
      readOnlyBadge: "Read-only tour",
      stepListLabel: "Demo tour steps",
      activeStepLabel: "Step",
      suggestedTabLabel: "Open tab",
      expectedLabel: "What to verify",
      safetyLabel: "Safety boundary",
      previous: "Previous",
      next: "Next",
      reset: "Reset tour",
      copyChecklist: "Copy checklist",
      copied: "Checklist copied.",
      copyFailed: "Copy failed. Copy the checklist manually.",
      checklistIntro: "Customer Demo Guided Flow checklist",
      prohibitedKicker: "Prohibited actions",
      prohibitedTitle: "This release is not a production trading product",
      prohibitedItems: [
        "No live trading",
        "No broker login",
        "No real orders",
        "No credential upload",
        "No customer account onboarding",
        "No trading recommendation",
      ],
      steps: [
        {
          title: "Confirm Release Level",
          tab: "Release",
          body:
            "Start with the release baseline and confirm the customer understands the current level before discussing any workflow.",
          expected:
            "Marketing Website is an external presentation candidate, Web Command Center is an internal demo candidate, Paper Research Preview is an internal technical preview, and Production Trading Platform is NOT READY.",
          safety:
            "This confirms the platform is available for evaluation only and is not positioned as production trading ready.",
        },
        {
          title: "Confirm Safety Defaults",
          tab: "Release",
          body:
            "Review the visible runtime defaults and verify that paper mode remains the default across the interface.",
          expected:
            "TRADING_MODE=paper, ENABLE_LIVE_TRADING=false, and BROKER_PROVIDER=paper are visible.",
          safety:
            "The tour does not change environment variables, runtime configuration, or trading mode.",
        },
        {
          title: "Review Paper OMS Workflow",
          tab: "Paper OMS",
          body:
            "Walk through the controlled paper path from signal to risk, OMS, paper gateway, and audit events.",
          expected:
            "StrategySignal -> Platform PaperOrderIntent -> Risk Engine -> OMS -> Paper Broker Gateway -> Audit Event.",
          safety:
            "The UI explains the workflow but does not submit simulations, create orders, or call brokers.",
        },
        {
          title: "Inspect Paper Audit Records",
          tab: "Paper OMS",
          body:
            "Select a paper workflow row, inspect the OMS timeline and audit timeline, and copy IDs when needed for review notes.",
          expected:
            "The selected workflow, order ID, final OMS status, OMS events, and audit events are visible as read-only data.",
          safety:
            "Selection, timeline reload, and clipboard copy do not write databases or mutate persisted records.",
        },
        {
          title: "Load Research Packet Sample",
          tab: "Research Packet",
          body:
            "Load the bundled safe sample or inspect an explicit local JSON packet in the browser.",
          expected:
            "Safety flags stay research_only=true and execution_eligible=false, with no performance claim.",
          safety:
            "Local packet inspection does not upload files, write databases, call Risk Engine, call OMS, or call brokers.",
        },
        {
          title: "Review Contract Specs",
          tab: "Contracts",
          body:
            "Review TX, MTX, and TMF point values and TX-equivalent sizing relationships.",
          expected:
            "TX, MTX, and TMF contract specs support risk-normalized sizing discussion.",
          safety:
            "Contract specs are informational and do not create signals, orders, recommendations, or account actions.",
        },
        {
          title: "Confirm Prohibited Actions",
          tab: "Release",
          body:
            "Close by confirming what the customer must not attempt during this release evaluation.",
          expected:
            "The customer understands that live trading, broker login, real orders, credential upload, and customer onboarding are not available.",
          safety:
            "The demo remains read-only and paper-first from start to finish.",
        },
      ],
    },
    interactions: {
      ariaLabel: "Safe read-only interaction layer",
      eyebrow: "Interaction Layer",
      title: "Read-only Command Center tools",
      description:
        "The Paper OMS tab opens first so customers immediately enter the Browser-only Mock Demo stepper. Safe controls remain available for refreshing status, switching views, inspecting local samples, selecting paper audit records, and copying IDs. These controls do not submit real orders, write production databases, or connect brokers.",
      readOnlyBadge: "Read-only",
      refresh: "Refresh status",
      tabsLabel: "Command Center sections",
      tabs: {
        release: "Release",
        paper: "Paper OMS",
        packet: "Research Packet",
        contracts: "Contracts",
      },
      troubleshootingKicker: "Backend unavailable",
      troubleshootingTitle: "Safe fallback is active",
      troubleshootingText:
        "The production frontend can still show checked-in paper-safe data when the backend is unavailable. For a local demo, start the backend or create one local paper audit sample with the command below.",
      demoSeedKicker: "Local demo seed",
      copyCommand: "Copy command",
      copied: "Copied to clipboard.",
      copyFailed: "Copy failed. Copy the command manually.",
    },
    localBackendMode: {
      eyebrow: "Deployment Boundary",
      title: "Local Backend Demo Mode",
      description:
        "The production Vercel frontend cannot directly read your local SQLite paper audit store. It can show read-only UI, checked fallback data, and explicitly selected local JSON evidence. To inspect actual paper records, run the backend and frontend locally against the same local SQLite file.",
      modes: [
        {
          kicker: "Production Vercel",
          title: "Read-only presentation surface",
          text:
            "Shows safety copy, release status, fallback data, and local JSON viewers. It does not access local SQLite, write databases, call brokers, or create orders.",
        },
        {
          kicker: "Local Demo",
          title: "Backend + local SQLite required",
          text:
            "Start the FastAPI backend and Next.js frontend locally, then seed a paper demo record. The Web Command Center can query the local backend for actual paper OMS and audit records.",
        },
        {
          kicker: "Future Cloud",
          title: "Controlled hosted API and data layer",
          text:
            "A future deployment may use a controlled backend/API and governed data layer. That is separate from local SQLite and still must preserve paper/live boundaries.",
        },
      ],
      commandsKicker: "Local setup",
      commandsTitle: "Commands for actual paper records",
      commandsText:
        "Run the one-command launcher locally when a reviewer needs to see persisted paper records in the Command Center. The manual fallback remains available. These commands do not enable live trading or connect brokers.",
      copyCommands: "Copy local demo commands",
      copied: "Local demo commands copied.",
      copyFailed: "Copy failed. Copy the commands manually.",
      safetyLabel: "Local backend demo safety flags",
    },
    localDemoSetup: {
      eyebrow: "Self-Service Demo",
      title: "Start a local Paper Only demo",
      description:
        "A lower-friction local launcher for customer evaluation. It validates safety defaults, uses local SQLite, can seed a paper workflow record, and starts local backend/frontend services without hosted accounts or broker connectivity.",
      steps: [
        {
          kicker: "Step 1",
          title: "Check prerequisites",
          text:
            "Run the environment check first. It verifies backend Python, frontend dependencies, local ports, and paper-only defaults before any service starts.",
        },
        {
          kicker: "Step 2",
          title: "Start the local demo",
          text:
            "Start FastAPI and Next.js locally with one command. The launcher prints the Web Command Center URL, backend health URL, SQLite path, and log files.",
        },
        {
          kicker: "Step 3",
          title: "Review paper records",
          text:
            "Use the local Web Command Center to inspect seeded paper approval, OMS, audit, risk, and evidence surfaces. Production Vercel remains a read-only presentation surface.",
        },
      ],
      commandKicker: "Recommended commands",
      commandTitle: "Customer-ready local demo path",
      commandText:
        "Use these commands when a reviewer needs actual local paper records without reading the full engineering runbook.",
      copyCommands: "Copy customer demo commands",
      copied: "Customer demo commands copied.",
      copyFailed: "Copy failed. Copy the commands manually.",
      windowsKicker: "Windows helper",
      windowsTitle: "PowerShell wrapper",
      windowsText:
        "Windows reviewers can use the PowerShell wrapper from the repo root. It delegates to the same paper-only Bash launcher and does not collect credentials.",
      safetyLabel: "Customer self-service demo safety flags",
    },
    deploymentDataBoundary: {
      eyebrow: "Data Access Boundary",
      title: "Where actual paper records can be read",
      description:
        "Production Vercel, local backend demo mode, and a future hosted API have different data access boundaries. This panel keeps the reviewer path explicit before they inspect OMS or audit records.",
      canShowLabel: "Can show",
      requiresLabel: "Requires",
      cannotDoLabel: "Cannot do",
      modes: [
        {
          kicker: "Production Vercel",
          title: "Read-only UI and fallback",
          canShow:
            "Release status, safety defaults, checked fallback data, and explicit local JSON evidence selected in the browser.",
          requires:
            "No backend is required for fallback UI. Local evidence viewing requires the user to choose a local JSON file.",
          cannotDo:
            "Cannot directly read local SQLite, call local FastAPI, write databases, create orders, collect credentials, or call brokers.",
        },
        {
          kicker: "Local Backend",
          title: "Actual local paper records",
          canShow:
            "Paper approval requests, paper workflow runs, OMS timelines, audit timelines, risk state, and audit integrity records stored in local SQLite.",
          requires:
            "Run FastAPI and Next.js locally with the same PAPER_EXECUTION_AUDIT_DB_PATH, then seed or create Paper Only records.",
          cannotDo:
            "Cannot be treated as production OMS, production audit, real broker connectivity, or live readiness.",
        },
        {
          kicker: "Future Hosted API",
          title: "Governed cloud data path",
          canShow:
            "Potential future paper records through an authenticated backend/API and controlled data layer after architecture review.",
          requires:
            "Separate work for authentication, RBAC/ABAC, retention, audit integrity, monitoring, and data governance.",
          cannotDo:
            "Cannot bypass paper/live separation, cannot expose broker credentials to strategies, and cannot claim production trading readiness.",
        },
      ],
      operatorKicker: "Reviewer rule",
      operatorTitle: "Use local backend for actual SQLite records",
      operatorText:
        "If a customer must see real seeded paper OMS or audit records, use local backend demo mode. Production Vercel should be treated as a read-only presentation surface unless a future controlled backend/API is deployed.",
      safetyLabel: "Deployment data boundary safety flags",
    },
    hostedWebCommandCenter: {
      eyebrow: "Hosted Web Command Center",
      title: "Environment-aware hosted backend connection",
      description:
        "Production Vercel can be configured to read a future hosted paper backend through a public API base URL. The current view displays mock login, tenant, role, and permission context only; it does not enable real login, hosted mutations, broker access, or live trading.",
      fallbackPrefix: "Hosted Web Command Center readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      connectionStateLabel: "Connection state",
      connectionStates: {
        hosted: "Hosted backend URL configured",
        localOrFallback: "Local or fallback API path",
      },
      apiBaseLabel: "Environment-aware API base URL",
      publicEnvLabel: "Public frontend environment variables",
      identityLabel: "Login status and role display",
      tenantLabel: "Tenant context display",
      grantedPermissionsLabel: "Granted read permissions",
      deniedMutationsLabel: "Denied mutation permissions",
      endpointsLabel: "Hosted read endpoints",
      safetyFlagsLabel: "Safety flags",
      requiredBeforeUseLabel: "Required before hosted customer use",
      warningLabel: "Boundary warnings",
      notConfigured: "not configured",
      fields: {
        apiBaseUrl: "Resolved API base URL",
        apiBaseSource: "Base URL source",
        apiMode: "Command Center API mode",
        hostedConfigured: "Hosted backend configured",
        usesLocalDefault: "Uses local default",
        authenticated: "Authenticated",
        authenticationProvider: "Authentication provider",
        authenticationMode: "Authentication mode",
        roles: "Roles",
        sessionAvailable: "Session endpoint available",
        tenantId: "Tenant ID",
        tenantMode: "Tenant mode",
        tenantIsolation: "Tenant isolation required",
        hostedDatastore: "Hosted datastore enabled",
        tenantAvailable: "Tenant endpoint available",
      },
      sourceLabels: {
        hosted_backend_public_env: "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL",
        backend_public_env: "NEXT_PUBLIC_BACKEND_URL",
        local_default: "local default http://localhost:8000",
      },
      permissionLabels: {
        read_hosted_readiness: "Read hosted readiness",
        read_mock_session: "Read mock session",
        read_current_tenant: "Read current tenant",
        create_paper_approval_request: "Create paper approval request",
        record_paper_reviewer_decision: "Record paper reviewer decision",
        submit_approved_paper_workflow: "Submit approved paper workflow",
        enable_live_trading: "Live trading permission",
        upload_broker_credentials: "Upload broker credentials",
      },
      endpointPurposeLabels: {
        "Backend health and paper-safe runtime status.":
          "Backend health and paper-safe runtime status.",
        "Hosted backend dev/staging/production environment boundary.":
          "Hosted backend dev/staging/production environment boundary.",
        "Hosted backend readiness and missing SaaS capabilities.":
          "Hosted backend readiness and missing SaaS capabilities.",
        "Hosted paper API readiness boundary.": "Hosted paper API readiness boundary.",
        "Mock session contract for login status, role, and permission display.":
          "Mock session contract for login status, role, and permission display.",
        "Mock tenant context for tenant boundary display.":
          "Mock tenant context for tenant boundary display.",
        "Web Command Center hosted backend connectivity contract.":
          "Web Command Center hosted backend connectivity contract.",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only_contract: "read_only_contract",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        auth_provider_enabled: "auth_provider_enabled",
        session_cookie_issued: "session_cookie_issued",
        customer_account_created: "customer_account_created",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        live_approval_granted: "live_approval_granted",
        production_trading_ready: "production_trading_ready",
      },
      requiredBeforeUseLabels: {
        "Deploy a reviewed hosted backend runtime for paper-only staging.":
          "Deploy a reviewed hosted backend runtime for paper-only staging.",
        "Configure NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL for the frontend deployment.":
          "Configure NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL for the frontend deployment.",
        "Keep public API base URL values non-secret and HTTPS-only for hosted environments.":
          "Keep public API base URL values non-secret and HTTPS-only for hosted environments.",
        "Add real login, logout, session validation, and reviewer/customer identity.":
          "Add real login, logout, session validation, and reviewer/customer identity.",
        "Enforce tenant isolation on every hosted request and hosted record.":
          "Enforce tenant isolation on every hosted request and hosted record.",
        "Enforce RBAC/ABAC before any hosted mutation or paper workflow submit.":
          "Enforce RBAC/ABAC before any hosted mutation or paper workflow submit.",
        "Connect a managed datastore only after migration, backup, retention, and restore review.":
          "Connect a managed datastore only after migration, backup, retention, and restore review.",
        "Complete security and operations review before customer-hosted paper use.":
          "Complete security and operations review before customer-hosted paper use.",
      },
      warningLabels: {
        "This endpoint is read-only hosted Web Command Center metadata only.":
          "This endpoint is read-only hosted Web Command Center metadata only.",
        "A public API base URL is configuration, not authentication.":
          "A public API base URL is configuration, not authentication.",
        "No real login, session cookie, customer account, or tenant record is created.":
          "No real login, session cookie, customer account, or tenant record is created.",
        "No hosted datastore is written and no broker API is called.":
          "No hosted datastore is written and no broker API is called.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperSecurityOperations: {
      eyebrow: "Security / Operations",
      title: "Hosted Paper security operations readiness",
      description:
        "Read-only security and operations boundary for a future hosted paper SaaS product. It documents secrets management, rate limiting, audit monitoring, observability, CI/CD gates, staging smoke tests, load/abuse tests, and auth boundary tests without enabling those systems.",
      fallbackPrefix:
        "Hosted paper security operations readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      stateLabel: "Readiness state",
      capabilitiesLabel: "Operations capabilities",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      controlLabel: "Control",
      currentStatusLabel: "Current status",
      enabledLabel: "Enabled",
      requiredBeforeHostedUseLabel: "Required before hosted customer use",
      requiredNextSlicesLabel: "Required next slices",
      warningLabel: "Boundary warnings",
      capabilityLabels: {
        secrets_management_enabled: "Secrets management enabled",
        vault_or_managed_secret_store_enabled: "Vault or managed secret store enabled",
        static_secret_scan_gate_enabled: "Static secret scan gate enabled",
        rate_limiting_enabled: "Rate limiting enabled",
        audit_monitoring_enabled: "Audit monitoring enabled",
        observability_pipeline_enabled: "Observability pipeline enabled",
        ci_release_readiness_gate_enabled: "CI release readiness gate enabled",
        production_smoke_gate_enabled: "Production smoke gate enabled",
        staging_smoke_gate_enabled: "Staging smoke gate enabled",
        load_test_gate_enabled: "Load test gate enabled",
        abuse_test_gate_enabled: "Abuse test gate enabled",
        auth_boundary_test_gate_enabled: "Auth boundary test gate enabled",
        incident_runbook_enabled: "Incident runbook enabled",
        production_operations_ready: "Production operations ready",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        secrets_stored: "secrets_stored",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        auth_provider_enabled: "auth_provider_enabled",
        customer_account_created: "customer_account_created",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        load_test_executed: "load_test_executed",
        abuse_test_executed: "abuse_test_executed",
        production_security_approval: "production_security_approval",
        production_trading_ready: "production_trading_ready",
      },
      controlLabels: {
        secrets_management: "Secrets management",
        rate_limiting: "Rate limiting",
        audit_monitoring: "Audit monitoring",
        observability: "Observability",
        ci_cd_deployment_gates: "CI/CD deployment gates",
        staging_smoke_test: "Staging smoke test",
        basic_load_abuse_testing: "Basic load / abuse testing",
        auth_boundary_testing: "Auth boundary testing",
      },
      purposeLabels: {
        "Store hosted credentials and signing material outside source code.":
          "Store hosted credentials and signing material outside source code.",
        "Protect hosted paper endpoints from accidental or abusive traffic.":
          "Protect hosted paper endpoints from accidental or abusive traffic.",
        "Alert on suspicious approval, OMS, audit, and integrity events.":
          "Alert on suspicious approval, OMS, audit, and integrity events.",
        "Trace paper request flow and collect logs/metrics safely.":
          "Trace paper request flow and collect logs/metrics safely.",
        "Block unsafe releases and verify production-facing safety copy.":
          "Block unsafe releases and verify production-facing safety copy.",
        "Verify a staging hosted backend before customer-facing rollout.":
          "Verify a staging hosted backend before customer-facing rollout.",
        "Exercise rate limits, denial paths, and read-only endpoint resilience.":
          "Exercise rate limits, denial paths, and read-only endpoint resilience.",
        "Verify unauthenticated, cross-tenant, and role-denied paths.":
          "Verify unauthenticated, cross-tenant, and role-denied paths.",
      },
      statusLabels: {
        contract_only_no_secret_store_connected: "Contract only; no secret store connected",
        not_enabled_rate_limit_policy_required: "Not enabled; rate limit policy required",
        not_enabled_monitoring_rules_required: "Not enabled; monitoring rules required",
        placeholder_only_no_hosted_pipeline: "Placeholder only; no hosted pipeline",
        release_readiness_and_production_smoke_gate_enabled:
          "Release readiness and production smoke gate enabled",
        not_enabled_staging_backend_required: "Not enabled; staging backend required",
        not_executed_test_plan_required: "Not executed; test plan required",
        not_enabled_real_auth_required: "Not enabled; real auth required",
      },
      requiredNextSliceLabels: {
        "Select managed secrets store and define rotation policy.":
          "Select managed secrets store and define rotation policy.",
        "Add non-production rate limit middleware and denial evidence.":
          "Add non-production rate limit middleware and denial evidence.",
        "Define audit monitoring alerts for paper approval and OMS events.":
          "Define audit monitoring alerts for paper approval and OMS events.",
        "Wire OpenTelemetry/log drain preview in staging only.":
          "Wire OpenTelemetry/log drain preview in staging only.",
        "Add staging smoke test against a non-production hosted backend.":
          "Add staging smoke test against a non-production hosted backend.",
        "Add basic load and abuse tests against read-only endpoints.":
          "Add basic load and abuse tests against read-only endpoints.",
        "Add auth boundary negative tests before any real login provider.":
          "Add auth boundary negative tests before any real login provider.",
        "Create incident response and rollback runbooks.":
          "Create incident response and rollback runbooks.",
      },
      warningLabels: {
        "This endpoint is read-only security and operations metadata only.":
          "This endpoint is read-only security and operations metadata only.",
        "No real secret store, rate limiter, hosted audit monitor, or log drain is enabled.":
          "No real secret store, rate limiter, hosted audit monitor, or log drain is enabled.",
        "No load, abuse, or real auth boundary test was executed by this endpoint.":
          "No load, abuse, or real auth boundary test was executed by this endpoint.",
        "Hosted paper SaaS remains NOT READY for customer production use.":
          "Hosted paper SaaS remains NOT READY for customer production use.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperReadiness: {
      eyebrow: "Hosted Paper API",
      title: "Hosted Paper API Readiness",
      description:
        "Read-only status from the backend readiness endpoint. It explains that hosted paper backend/API mode is not enabled yet, so actual paper workflow records still require local backend + local SQLite.",
      fallbackPrefix: "Hosted paper readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      stateLabel: "Readiness state",
      capabilitiesLabel: "Current capability status",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      currentPathLabel: "Current customer path",
      unavailableLabel: "Unavailable until hosted backend exists",
      futureRequirementsLabel: "Future requirements",
      warningLabel: "Boundary warnings",
      capabilityLabels: {
        customer_login_enabled: "Customer login enabled",
        hosted_backend_enabled: "Hosted backend enabled",
        hosted_datastore_enabled: "Hosted datastore enabled",
        rbac_abac_enabled: "RBAC / ABAC enabled",
        paper_workflow_online_enabled: "Online paper workflow enabled",
        local_demo_mode_primary: "Local demo mode remains primary",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      customerPathLabels: {
        "Use the Production Vercel Web Command Center for read-only UI and fallback samples.":
          "Use the Production Vercel Web Command Center for read-only UI and fallback samples.",
        "Use local backend + local SQLite to create and inspect actual paper workflow records.":
          "Use local backend + local SQLite to create and inspect actual paper workflow records.",
        "Use explicit local evidence export/import for customer review artifacts.":
          "Use explicit local evidence export/import for customer review artifacts.",
      },
      unavailableLabels: {
        "Customer login to an online paper workspace.":
          "Customer login to an online paper workspace.",
        "Tenant-scoped hosted paper records.": "Tenant-scoped hosted paper records.",
        "Hosted approval queue and decision persistence.":
          "Hosted approval queue and decision persistence.",
        "Hosted paper OMS/audit query APIs backed by a managed datastore.":
          "Hosted paper OMS/audit query APIs backed by a managed datastore.",
      },
      futureRequirementLabels: {
        "Authenticated session context.": "Authenticated session context.",
        "Tenant-scoped managed hosted datastore.":
          "Tenant-scoped managed hosted datastore.",
        "RBAC/ABAC checks for reviewer and operator actions.":
          "RBAC/ABAC checks for reviewer and operator actions.",
        "Paper-only approval workflow backed by hosted persistence.":
          "Paper-only approval workflow backed by hosted persistence.",
        "Paper-only workflow submit that references a persisted approval_request_id.":
          "Paper-only workflow submit that references a persisted approval_request_id.",
        "Append-only hosted paper audit events with integrity verification.":
          "Append-only hosted paper audit events with integrity verification.",
        "Security and operations review before any customer pilot.":
          "Security and operations review before any customer pilot.",
      },
      warningLabels: {
        "This endpoint is read-only readiness metadata, not a hosted paper backend.":
          "This endpoint is read-only readiness metadata, not a hosted paper backend.",
        "It does not authenticate users, write records, call brokers, create orders, or turn live trading on.":
          "It does not authenticate users, write records, call brokers, create orders, or turn live trading on.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
      },
    },
    hostedPaperSandboxOnboarding: {
      eyebrow: "Customer Onboarding",
      title: "Hosted Paper Sandbox Tenant Onboarding",
      description:
        "Read-only contract for the future browser-only customer sandbox tenant. It shows the gap between local demo setup and a SaaS onboarding flow without creating accounts, tenants, sessions, records, orders, or broker connections.",
      fallbackPrefix:
        "Hosted paper sandbox onboarding unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      goalLabel: "Target customer experience",
      stateLabel: "Readiness state",
      capabilitiesLabel: "Onboarding capabilities",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      blockersLabel: "Current blockers",
      guidedDemoLabel: "Guided demo data contract",
      datasetStatusLabel: "Dataset status",
      recordsLabel: "Future demo records",
      requiredStepsLabel: "Required onboarding steps",
      currentStatusLabel: "Current status",
      requiredBeforeSelfServiceLabel: "Required before customer self-service",
      demoWarningLabel: "Guided demo warnings",
      warningLabel: "Boundary warnings",
      capabilityLabels: {
        online_sandbox_tenant_enabled: "Online sandbox tenant enabled",
        browser_only_customer_onboarding_enabled:
          "Browser-only customer onboarding enabled",
        hosted_backend_enabled: "Hosted backend enabled",
        managed_datastore_enabled: "Managed datastore enabled",
        real_login_enabled: "Real login enabled",
        tenant_isolation_enforced: "Tenant isolation enforced",
        guided_demo_data_contract_defined: "Guided demo data contract defined",
        guided_demo_data_hosted: "Guided demo data hosted",
        paper_only_boundary_visible: "Paper Only boundary visible",
        live_trading_controls_visible: "Live trading controls visible",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        online_sandbox_tenant_created: "online_sandbox_tenant_created",
        customer_account_created: "customer_account_created",
        login_enabled: "login_enabled",
        session_cookie_issued: "session_cookie_issued",
        tenant_record_created: "tenant_record_created",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        broker_api_called: "broker_api_called",
        broker_credentials_collected: "broker_credentials_collected",
        order_created: "order_created",
        real_money_visible: "real_money_visible",
        production_customer_onboarding_ready:
          "production_customer_onboarding_ready",
        production_trading_ready: "production_trading_ready",
      },
      blockerLabels: {
        "No hosted sandbox tenant provisioning exists.":
          "No hosted sandbox tenant provisioning exists.",
        "No customer login or session provider is enabled.":
          "No customer login or session provider is enabled.",
        "No tenant-isolated managed datastore is connected.":
          "No tenant-isolated managed datastore is connected.",
        "No hosted paper approval, OMS, audit, or evidence records are written.":
          "No hosted paper approval, OMS, audit, or evidence records are written.",
        "Production Vercel remains a read-only UI surface unless connected to a reviewed hosted backend.":
          "Production Vercel remains a read-only UI surface unless connected to a reviewed hosted backend.",
      },
      datasetStatusLabels: {
        contract_only_not_hosted: "contract_only_not_hosted",
      },
      intentLabels: {
        "Future guided customer demo data for paper approval requests, paper-only reviewer decisions, controlled paper submit, OMS timeline, audit timeline, risk evidence, and broker simulation evidence.":
          "Future guided customer demo data for paper approval requests, paper-only reviewer decisions, controlled paper submit, OMS timeline, audit timeline, risk evidence, and broker simulation evidence.",
      },
      recordLabels: {
        sample_paper_approval_request: "sample_paper_approval_request",
        sample_reviewer_decisions: "sample_reviewer_decisions",
        sample_paper_workflow_run: "sample_paper_workflow_run",
        sample_oms_events: "sample_oms_events",
        sample_audit_events: "sample_audit_events",
        sample_risk_evaluation: "sample_risk_evaluation",
        sample_broker_simulation_preview: "sample_broker_simulation_preview",
        sample_readiness_evidence: "sample_readiness_evidence",
      },
      stepLabels: {
        hosted_backend_staging: "Hosted backend staging",
        managed_tenant_datastore: "Managed tenant datastore",
        customer_login_session: "Customer login and session",
        sandbox_tenant_provisioning: "Sandbox tenant provisioning",
        guided_demo_data: "Guided demo data",
        customer_browser_demo_flow: "Customer browser demo flow",
        security_operations_gate: "Security and operations gate",
      },
      statusLabels: {
        contract_only: "contract_only",
        migration_plan_only: "migration_plan_only",
        provider_not_selected: "provider_not_selected",
        not_enabled: "not_enabled",
        local_demo_required_today: "local_demo_required_today",
        readiness_contract_only: "readiness_contract_only",
      },
      demoWarningLabels: {
        "Guided demo data is a contract only and is not hosted by this release.":
          "Guided demo data is a contract only and is not hosted by this release.",
        "Future demo records must remain simulated, Paper Only, and clearly labeled.":
          "Future demo records must remain simulated, Paper Only, and clearly labeled.",
        "Future demo records must not contain broker credentials, real account data, or investment advice.":
          "Future demo records must not contain broker credentials, real account data, or investment advice.",
      },
      warningLabels: {
        "This endpoint is read-only onboarding readiness metadata only.":
          "This endpoint is read-only onboarding readiness metadata only.",
        "No online sandbox tenant is created.":
          "No online sandbox tenant is created.",
        "No customer account, reviewer account, login, or session is created.":
          "No customer account, reviewer account, login, or session is created.",
        "No hosted datastore is written.": "No hosted datastore is written.",
        "No broker API is called and no broker credentials are collected.":
          "No broker API is called and no broker credentials are collected.",
        "No order is created and no live trading approval exists.":
          "No order is created and no live trading approval exists.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperEnvironment: {
      eyebrow: "SaaS Foundation",
      title: "Hosted Paper API Environment Contract",
      description:
        "Read-only deployment boundary for the future SaaS paper product. It separates Local Demo Mode, Hosted Paper Mode, and Production Trading Platform readiness without enabling hosted accounts or execution.",
      fallbackPrefix: "Hosted paper environment unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      currentModeLabel: "Current customer mode",
      deploymentModelLabel: "Deployment model",
      productionStateLabel: "Production trading platform",
      modeLabel: "Mode",
      stateLabel: "State",
      canReadLabel: "Can read actual paper records",
      canWriteLabel: "Can write paper records",
      authRequiredLabel: "Auth required",
      tenantRequiredLabel: "Tenant isolation required",
      managedDatastoreLabel: "Managed datastore required",
      localSqliteLabel: "Local SQLite allowed",
      limitationsLabel: "Limitations",
      roadmapLabel: "SaaS foundation path",
      statusLabel: "Status",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      currentModeLabels: {
        local_demo_mode: "Local Demo Mode",
      },
      modeLabels: {
        local_demo: "Local Demo Mode",
        hosted_paper: "Hosted Paper Mode",
        production_trading_platform: "Production Trading Platform",
      },
      modeTitleLabels: {
        "Local Demo Mode": "Local Demo Mode",
        "Hosted Paper Mode": "Hosted Paper Mode",
        "Production Trading Platform": "Production Trading Platform",
      },
      stateLabels: {
        primary_local_demo: "PRIMARY LOCAL DEMO",
        not_enabled: "NOT ENABLED",
        staging_only_future: "STAGING ONLY FUTURE",
        ready_future: "READY FUTURE",
        not_ready: "NOT READY",
      },
      descriptionLabels: {
        "Primary customer evaluation path for actual paper workflow records. Runs on the reviewer's machine with local backend and local SQLite.":
          "Primary customer evaluation path for actual paper workflow records. Runs on the reviewer's machine with local backend and local SQLite.",
        "Future SaaS paper workflow path with authenticated sessions, tenant-scoped records, RBAC/ABAC, and managed datastore.":
          "Future SaaS paper workflow path with authenticated sessions, tenant-scoped records, RBAC/ABAC, and managed datastore.",
        "Production trading platform remains NOT READY. This contract does not enable live trading, broker connectivity, or real order routing.":
          "Production trading platform remains NOT READY. This contract does not enable live trading, broker connectivity, or real order routing.",
      },
      limitationLabels: {
        "Engineering-style local setup is still required.":
          "Engineering-style local setup is still required.",
        "Records are not available from Production Vercel.":
          "Records are not available from Production Vercel.",
        "Local SQLite is not a hosted tenant datastore.":
          "Local SQLite is not a hosted tenant datastore.",
        "No hosted customer account or reviewer login is available.":
          "No hosted customer account or reviewer login is available.",
        "Hosted backend/API is not deployed as a customer paper workspace.":
          "Hosted backend/API is not deployed as a customer paper workspace.",
        "Managed paper datastore is not connected.":
          "Managed paper datastore is not connected.",
        "Customer login, reviewer identity, and tenant isolation are not enabled.":
          "Customer login, reviewer identity, and tenant isolation are not enabled.",
        "Hosted paper workflow persistence is not enabled.":
          "Hosted paper workflow persistence is not enabled.",
        "No live trading approval exists.": "No live trading approval exists.",
        "No broker SDK path is enabled.": "No broker SDK path is enabled.",
        "No broker credentials are collected.":
          "No broker credentials are collected.",
        "No production OMS, WORM audit ledger, or cross-account risk system exists.":
          "No production OMS, WORM audit ledger, or cross-account risk system exists.",
      },
      capabilityLabels: {
        "Hosted backend": "Hosted backend",
        "Managed database": "Managed database",
        "Auth/session": "Auth/session",
        "Tenant isolation": "Tenant isolation",
        "Paper workflow persistence": "Paper workflow persistence",
        "Hosted customer demo tenant": "Hosted customer demo tenant",
      },
      statusLabels: {
        not_enabled: "not_enabled",
        schema_only: "schema_only",
        local_only: "local_only",
      },
      notesLabels: {
        "Deploy controlled backend/API for paper-only hosted workspace.":
          "Deploy controlled backend/API for paper-only hosted workspace.",
        "Replace local SQLite with tenant-scoped managed datastore.":
          "Replace local SQLite with tenant-scoped managed datastore.",
        "Introduce real customer login and reviewer identity.":
          "Introduce real customer login and reviewer identity.",
        "Require tenant id on every hosted paper record and API read/write.":
          "Require tenant id on every hosted paper record and API read/write.",
        "Move approval, paper OMS, risk, broker simulation, and audit records into hosted datastore.":
          "Move approval, paper OMS, risk, broker simulation, and audit records into hosted datastore.",
        "Provision a paper-only tenant with sample records after auth, data, audit, and security gates pass.":
          "Provision a paper-only tenant with sample records after auth, data, audit, and security gates pass.",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only environment contract metadata only.":
          "This endpoint is read-only environment contract metadata only.",
        "Hosted Paper Mode is not enabled for customer SaaS operation.":
          "Hosted Paper Mode is not enabled for customer SaaS operation.",
        "Production Vercel cannot read local SQLite paper records.":
          "Production Vercel cannot read local SQLite paper records.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperDatastore: {
      eyebrow: "Managed Datastore",
      title: "Hosted Paper Managed Datastore Readiness",
      description:
        "Read-only schema contract for future tenant-scoped hosted paper records. It defines models, tenant key, migration boundary, retention, and audit requirements without connecting to a database.",
      fallbackPrefix:
        "Hosted paper datastore readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      tenantKeyLabel: "Tenant key",
      stateLabel: "Readiness state",
      capabilitiesLabel: "Capability flags",
      migrationLabel: "Migration boundary",
      migrationModeLabel: "Migration mode",
      dryRunLabel: "Dry-run only",
      applyEnabledLabel: "Apply enabled",
      connectionAttemptedLabel: "Connection attempted",
      requiredControlsLabel: "Required controls before apply",
      recordModelsLabel: "Future hosted paper record models",
      tableLabel: "Table",
      tenantKeyRequiredLabel: "Tenant key required",
      retentionClassLabel: "Retention class",
      primaryIdentifiersLabel: "Primary identifiers",
      auditRequirementsLabel: "Audit requirements",
      retentionLabel: "Retention requirements",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      statusLabels: {
        schema_only_no_hosted_datastore: "SCHEMA ONLY - NO HOSTED DATASTORE",
      },
      capabilityLabels: {
        managed_datastore_enabled: "Managed datastore enabled",
        hosted_records_writable: "Hosted records writable",
        hosted_records_readable: "Hosted records readable",
        tenant_key_enforced: "Tenant key enforced",
        migrations_apply_enabled: "Migration apply enabled",
        retention_policy_enforced: "Retention policy enforced",
        audit_append_only_enforced: "Audit append-only enforced",
        local_sqlite_replacement_required: "Local SQLite replacement required",
      },
      controlLabels: {
        "approved managed datastore selection": "Approved managed datastore selection",
        "tenant_id required on every hosted paper table":
          "tenant_id required on every hosted paper table",
        "migration dry-run output reviewed": "Migration dry-run output reviewed",
        "backup and restore plan documented": "Backup and restore plan documented",
        "retention policy approved": "Retention policy approved",
        "security review completed": "Security review completed",
      },
      recordNameLabels: {
        "Paper approval request": "Paper approval request",
        "Paper approval decision": "Paper approval decision",
        "Paper workflow run": "Paper workflow run",
        "Paper OMS event": "Paper OMS event",
        "Paper audit event": "Paper audit event",
      },
      retentionClassLabels: {
        paper_approval_governance: "paper_approval_governance",
        paper_review_history: "paper_review_history",
        paper_execution_workflow: "paper_execution_workflow",
        paper_oms_timeline: "paper_oms_timeline",
        paper_audit_trail: "paper_audit_trail",
      },
      modelNotesLabels: {
        "Future hosted approval requests must be tenant-scoped.":
          "Future hosted approval requests must be tenant-scoped.",
        "Future reviewer decisions require authenticated identity.":
          "Future reviewer decisions require authenticated identity.",
        "Future hosted paper workflow runs remain Paper Only.":
          "Future hosted paper workflow runs remain Paper Only.",
        "Future hosted OMS events require tenant-scoped ordering.":
          "Future hosted OMS events require tenant-scoped ordering.",
        "Future hosted audit events must support integrity verification.":
          "Future hosted audit events must support integrity verification.",
      },
      auditRequirementLabels: {
        "append-only request creation event": "append-only request creation event",
        "hash-chain reference": "hash-chain reference",
        "reviewer-visible payload snapshot": "reviewer-visible payload snapshot",
        "distinct reviewer identity": "distinct reviewer identity",
        "immutable decision event": "immutable decision event",
        "previous decision hash": "previous decision hash",
        "risk evaluation reference": "risk evaluation reference",
        "OMS event sequence reference": "OMS event sequence reference",
        "paper broker simulation reference": "paper broker simulation reference",
        "deterministic sequence": "deterministic sequence",
        "idempotency key reference": "idempotency key reference",
        "event payload hash": "event payload hash",
        "append-only write path": "append-only write path",
        "hash-chain continuity": "hash-chain continuity",
        "retention and export metadata": "retention and export metadata",
      },
      recordGroupLabels: {
        approval_records: "approval_records",
        paper_workflow_records: "paper_workflow_records",
        audit_events: "audit_events",
      },
      retentionPolicyLabels: {
        "retain through customer evaluation window plus review hold":
          "Retain through customer evaluation window plus review hold",
        "retain through paper evaluation and audit review period":
          "Retain through paper evaluation and audit review period",
        "append-only retention policy required before hosted use":
          "Append-only retention policy required before hosted use",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is a schema-only datastore readiness contract.":
          "This endpoint is a schema-only datastore readiness contract.",
        "No hosted database connection is configured or attempted.":
          "No hosted database connection is configured or attempted.",
        "No hosted records are read or written.":
          "No hosted records are read or written.",
        "Local SQLite remains for local demo mode only.":
          "Local SQLite remains for local demo mode only.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperProductionDatastore: {
      eyebrow: "Production Datastore",
      title: "Hosted Paper Production Datastore Readiness",
      description:
        "Read-only boundary for the future production datastore. It defines paper approval, paper order, OMS event, audit event, migration, backup, retention, and restore requirements without connecting to a database.",
      fallbackPrefix:
        "Hosted paper production datastore readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      tenantKeyLabel: "Tenant key",
      recommendedPatternLabel: "Recommended datastore pattern",
      stateLabel: "Readiness state",
      capabilitiesLabel: "Capability flags",
      migrationLabel: "Migration boundary",
      migrationModeLabel: "Migration mode",
      databaseUrlReadLabel: "DATABASE_URL read",
      connectionAttemptedLabel: "Connection attempted",
      applyEnabledLabel: "Apply enabled",
      requiredControlsLabel: "Required controls",
      recordGroupsLabel: "Production record groups",
      tablesLabel: "Tables",
      localSqliteAllowedLabel: "Local SQLite allowed",
      backupRequiredLabel: "Backup required",
      retentionRequiredLabel: "Retention required",
      restoreRequiredLabel: "Restore required",
      retentionLabel: "Retention and deletion boundaries",
      localSqliteBoundaryLabel: "Local SQLite boundary",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      statusLabels: {
        contract_only_no_production_datastore:
          "CONTRACT ONLY - NO PRODUCTION DATASTORE",
      },
      capabilityLabels: {
        production_datastore_enabled: "Production datastore enabled",
        managed_postgres_selected: "Managed Postgres selected",
        marketplace_provisioning_enabled: "Marketplace provisioning enabled",
        hosted_records_writable: "Hosted records writable",
        hosted_records_readable: "Hosted records readable",
        migrations_apply_enabled: "Migration apply enabled",
        backup_policy_configured: "Backup policy configured",
        point_in_time_recovery_required: "Point-in-time recovery required",
        restore_drill_verified: "Restore drill verified",
        retention_policy_enforced: "Retention policy enforced",
        local_sqlite_allowed_for_production:
          "Local SQLite allowed for production",
      },
      recordGroupLabels: {
        paper_approval: "Paper approval",
        paper_order: "Paper order",
        oms_event: "OMS event",
        audit_event: "Audit event",
      },
      controlLabels: {
        "authenticated reviewer identity": "Authenticated reviewer identity",
        "tenant-scoped RBAC and ABAC": "Tenant-scoped RBAC and ABAC",
        "dual-review sequence where required": "Dual-review sequence where required",
        "append-only decision audit trail": "Append-only decision audit trail",
        "completed approval_request_id": "Completed approval_request_id",
        "risk evaluation reference": "Risk evaluation reference",
        "duplicate order prevention across sessions":
          "Duplicate order prevention across sessions",
        "paper-only execution eligibility": "Paper-only execution eligibility",
        "durable queue/outbox design": "Durable queue/outbox design",
        "deterministic event ordering": "Deterministic event ordering",
        "timeout and retry metadata": "Timeout and retry metadata",
        "reconciliation reference": "Reconciliation reference",
        "append-only audit write path": "Append-only audit write path",
        "hash-chain verification": "Hash-chain verification",
        "retention and legal hold metadata": "Retention and legal hold metadata",
        "exportable evidence references": "Exportable evidence references",
        "managed Postgres provider selected and security-reviewed":
          "Managed Postgres provider selected and security-reviewed",
        "dev/staging/production database separation documented":
          "dev/staging/production database separation documented",
        "tenant_id required on every hosted paper table":
          "tenant_id required on every hosted paper table",
        "migration dry-run reviewed": "Migration dry-run reviewed",
        "backup policy documented": "Backup policy documented",
        "restore drill documented": "Restore drill documented",
        "retention policy approved": "Retention policy approved",
        "audit integrity requirements reviewed":
          "Audit integrity requirements reviewed",
      },
      retentionRequirementLabels: {
        "retain through customer evaluation, dispute review, and audit hold":
          "Retain through customer evaluation, dispute review, and audit hold",
        "retain through paper workflow review and customer evidence export":
          "Retain through paper workflow review and customer evidence export",
        "retain full event timeline through workflow lifecycle and audit review":
          "Retain full event timeline through workflow lifecycle and audit review",
        "append-only retention with integrity verification":
          "Append-only retention with integrity verification",
      },
      deleteBehaviorLabels: {
        "soft delete request metadata only after retention review":
          "Soft delete request metadata only after retention review",
        "archive before deletion; no direct user hard delete":
          "Archive before deletion; no direct user hard delete",
        "append corrective events instead of mutating history":
          "Append corrective events instead of mutating history",
        "no user deletion path before legal and compliance review":
          "No user deletion path before legal and compliance review",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only production datastore readiness metadata.":
          "This endpoint is read-only production datastore readiness metadata.",
        "No production database is selected, provisioned, connected, or written.":
          "No production database is selected, provisioned, connected, or written.",
        "No DATABASE_URL is read by this contract.":
          "No DATABASE_URL is read by this contract.",
        "Local SQLite remains for demo and development only.":
          "Local SQLite remains for demo and development only.",
        "Backup, retention, and restore controls are required before hosted use.":
          "Backup, retention, and restore controls are required before hosted use.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperIdentityReadiness: {
      eyebrow: "Hosted Paper Identity",
      title: "Identity, RBAC, and tenant readiness",
      description:
        "Read-only status for future reviewer login, customer accounts, RBAC/ABAC, and tenant isolation. These controls are schema-only and are not enabled.",
      fallbackPrefix:
        "Hosted paper identity readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      stateLabel: "Readiness state",
      identityLabel: "Identity status",
      accessControlLabel: "Access control status",
      tenantIsolationLabel: "Tenant isolation status",
      rolesLabel: "Future roles",
      blockedLabel: "Blocked until identity exists",
      futureRequirementsLabel: "Future requirements",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      identityLabels: {
        reviewer_login_enabled: "Reviewer login enabled",
        customer_accounts_enabled: "Customer accounts enabled",
        authentication_provider: "Authentication provider",
        session_issuance_enabled: "Session issuance enabled",
        session_cookie_issued: "Session cookie issued",
        mfa_enabled: "MFA enabled",
      },
      accessControlLabels: {
        rbac_enabled: "RBAC enabled",
        abac_enabled: "ABAC enabled",
        mutation_permissions_granted: "Mutation permissions granted",
        live_permissions_granted: "Live permissions granted",
      },
      tenantLabels: {
        tenant_isolation_required: "Tenant isolation required",
        tenant_isolation_enforced: "Tenant isolation enforced",
        hosted_tenant_datastore_enabled: "Hosted tenant datastore enabled",
        hosted_tenant_records_enabled: "Hosted tenant records enabled",
        tenant_created: "Tenant created",
        local_sqlite_access_from_production_vercel:
          "Local SQLite access from Production Vercel",
      },
      roleLabels: {
        viewer: "Viewer",
        research_reviewer: "Research reviewer",
        risk_reviewer: "Risk reviewer",
        paper_operator: "Paper operator",
        tenant_admin: "Tenant admin",
      },
      blockedLabels: {
        "Real reviewer login.": "Real reviewer login.",
        "Customer account onboarding.": "Customer account onboarding.",
        "Tenant-scoped hosted paper workspace.":
          "Tenant-scoped hosted paper workspace.",
        "Hosted approval queue mutations.": "Hosted approval queue mutations.",
        "Hosted paper workflow submission.": "Hosted paper workflow submission.",
        "Hosted tenant paper record queries backed by a managed datastore.":
          "Hosted tenant paper record queries backed by a managed datastore.",
      },
      futureRequirementLabels: {
        "Choose and review a hosted authentication provider.":
          "Choose and review a hosted authentication provider.",
        "Define session issuance, expiry, rotation, and logout behavior.":
          "Define session issuance, expiry, rotation, and logout behavior.",
        "Implement tenant-scoped account and membership records.":
          "Implement tenant-scoped account and membership records.",
        "Enforce RBAC for reviewer and paper operator actions.":
          "Enforce RBAC for reviewer and paper operator actions.",
        "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.":
          "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.",
        "Add dual-review rules before any hosted paper workflow submission.":
          "Add dual-review rules before any hosted paper workflow submission.",
        "Add audit trail for identity, authorization, and tenant-boundary decisions.":
          "Add audit trail for identity, authorization, and tenant-boundary decisions.",
        "Complete security and operations review before customer pilot.":
          "Complete security and operations review before customer pilot.",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        hosted_auth_provider_enabled: "hosted_auth_provider_enabled",
        reviewer_login_created: "reviewer_login_created",
        customer_account_created: "customer_account_created",
        session_cookie_issued: "session_cookie_issued",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        rbac_abac_enforced: "rbac_abac_enforced",
        tenant_isolation_enforced: "tenant_isolation_enforced",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only identity readiness metadata only.":
          "This endpoint is read-only identity readiness metadata only.",
        "It does not create reviewer login, customer accounts, sessions, tenant records, or RBAC/ABAC enforcement.":
          "It does not create reviewer login, customer accounts, sessions, tenant records, or RBAC/ABAC enforcement.",
        "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.":
          "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
      },
    },
    hostedPaperIdentityAccessContract: {
      eyebrow: "Hosted Paper Identity",
      title: "Identity access contract",
      description:
        "Read-only contract for future real login, sessions, customer accounts, tenant boundary, and RBAC/ABAC role separation. This release does not authenticate users or issue sessions.",
      fallbackPrefix:
        "Hosted paper identity access contract unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      stateLabel: "Contract state",
      providerLabel: "Identity provider boundary",
      sessionBoundaryLabel: "Session boundary",
      tenantBoundaryLabel: "Tenant boundary",
      requiredClaimsLabel: "Required future session claims",
      sessionLifecycleLabel: "Required session lifecycle",
      sessionValidationLabel: "Session validation enabled",
      sessionAuditLabel: "Session audit required",
      roleLabel: "Separated future role",
      requiresMfaLabel: "Requires MFA",
      requiresDualReviewLabel: "Requires dual review",
      livePermissionLabel: "Live permission granted",
      futureMutationsLabel: "Future paper-only mutations",
      noneLabel: "None",
      abacPoliciesLabel: "ABAC policy contracts",
      enabledLabel: "enabled",
      blockedLabel: "Blocked until real identity exists",
      implementationSequenceLabel: "Implementation sequence",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      providerLabels: {
        provider_required: "Provider required",
        provider_selected: "Provider selected",
        provider_name: "Provider name",
        real_login_enabled: "Real login enabled",
        customer_signup_enabled: "Customer signup enabled",
        reviewer_login_enabled: "Reviewer login enabled",
        session_issuance_enabled: "Session issuance enabled",
        session_cookie_issued: "Session cookie issued",
        mfa_required_for_privileged_roles: "MFA required for privileged roles",
        mfa_enabled: "MFA enabled",
      },
      tenantLabels: {
        tenant_id_required_on_every_request: "tenant_id required on every request",
        tenant_id_required_on_every_record: "tenant_id required on every record",
        membership_required: "Tenant membership required",
        cross_tenant_access_allowed: "Cross-tenant access allowed",
        tenant_isolation_enforced: "Tenant isolation enforced",
        tenant_admin_role_required_for_membership_changes:
          "Tenant admin required for membership changes",
        local_sqlite_allowed_for_hosted_tenant_records:
          "Local SQLite allowed for hosted tenant records",
      },
      roleLabels: {
        customer: "Customer",
        reviewer: "Reviewer",
        operator: "Operator",
        admin: "Admin",
      },
      rolePurposeLabels: {
        "Future tenant member who can read the customer's own paper workspace, paper evidence, and demo status.":
          "Future tenant member who can read the customer's own paper workspace, paper evidence, and demo status.",
        "Future paper-only reviewer for research and risk decisions inside one tenant boundary.":
          "Future paper-only reviewer for research and risk decisions inside one tenant boundary.",
        "Future paper-only operator who can submit a paper workflow only after completed approval sequence.":
          "Future paper-only operator who can submit a paper workflow only after completed approval sequence.",
        "Future tenant administrator for paper-only tenant membership and configuration review.":
          "Future tenant administrator for paper-only tenant membership and configuration review.",
      },
      permissionLabels: {
        read_own_tenant_readiness: "Read own tenant readiness",
        read_own_paper_records: "Read own paper records",
        read_own_evidence: "Read own evidence",
        read_tenant_readiness: "Read tenant readiness",
        read_tenant_approval_queue: "Read tenant approval queue",
        read_tenant_paper_records: "Read tenant paper records",
        read_tenant_evidence: "Read tenant evidence",
        read_completed_approval_requests: "Read completed approval requests",
        read_tenant_members: "Read tenant members",
        read_tenant_audit_events: "Read tenant audit events",
        record_research_review_decision: "Record research review decision",
        record_risk_review_decision: "Record risk review decision",
        submit_approved_paper_workflow: "Submit approved paper workflow",
        manage_tenant_members: "Manage tenant members",
        rotate_tenant_reviewers: "Rotate tenant reviewers",
        None: "None",
      },
      abacPolicyLabels: {
        paper_only_mode: "Paper-only mode",
        tenant_scope: "Tenant scope",
        environment_scope: "Environment scope",
        approval_state: "Approval state",
      },
      enforcementTargetLabels: {
        "all hosted paper requests": "all hosted paper requests",
        "all tenant record reads and future writes":
          "all tenant record reads and future writes",
        "hosted paper API routing": "hosted paper API routing",
        "future paper workflow submission": "future paper workflow submission",
      },
      blockedLabels: {
        "Hosted customer account login.": "Hosted customer account login.",
        "Reviewer login and session issuance.": "Reviewer login and session issuance.",
        "Tenant membership management.": "Tenant membership management.",
        "RBAC enforcement for reviewer, admin, customer, and operator roles.":
          "RBAC enforcement for reviewer, admin, customer, and operator roles.",
        "ABAC enforcement for paper-only mode, tenant scope, environment, and approval state.":
          "ABAC enforcement for paper-only mode, tenant scope, environment, and approval state.",
        "Hosted paper approval mutations.": "Hosted paper approval mutations.",
        "Hosted paper workflow submission.": "Hosted paper workflow submission.",
        "Hosted tenant paper record queries backed by managed datastore.":
          "Hosted tenant paper record queries backed by managed datastore.",
      },
      implementationLabels: {
        "Select and security-review an authentication provider.":
          "Select and security-review an authentication provider.",
        "Implement tenant and membership datastore models.":
          "Implement tenant and membership datastore models.",
        "Implement real login, logout, session issue, session rotation, and session expiry.":
          "Implement real login, logout, session issue, session rotation, and session expiry.",
        "Attach tenant_id, roles, permissions, and attributes to every hosted request.":
          "Attach tenant_id, roles, permissions, and attributes to every hosted request.",
        "Enforce RBAC for reviewer, admin, customer, and operator permissions.":
          "Enforce RBAC for reviewer, admin, customer, and operator permissions.",
        "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.":
          "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.",
        "Add identity and authorization audit events.":
          "Add identity and authorization audit events.",
        "Run security review before hosted customer pilot.":
          "Run security review before hosted customer pilot.",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        auth_provider_enabled: "auth_provider_enabled",
        real_login_enabled: "real_login_enabled",
        customer_account_created: "customer_account_created",
        reviewer_login_created: "reviewer_login_created",
        admin_login_created: "admin_login_created",
        operator_login_created: "operator_login_created",
        session_cookie_issued: "session_cookie_issued",
        rbac_enforced: "rbac_enforced",
        abac_enforced: "abac_enforced",
        tenant_isolation_enforced: "tenant_isolation_enforced",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This is a read-only identity access contract, not a login system.":
          "This is a read-only identity access contract, not a login system.",
        "No customer account, reviewer login, admin login, operator login, or session is created.":
          "No customer account, reviewer login, admin login, operator login, or session is created.",
        "RBAC and ABAC are required for hosted SaaS but are not enforced by this slice.":
          "RBAC and ABAC are required for hosted SaaS but are not enforced by this slice.",
        "No credentials are collected, no hosted datastore is written, no broker is called, and no order is created.":
          "No credentials are collected, no hosted datastore is written, no broker is called, and no order is created.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperAuthProviderSelection: {
      eyebrow: "Hosted Paper Auth",
      title: "Auth provider selection matrix",
      description:
        "Read-only comparison of Clerk, Auth0, Descope, and Vercel OIDC / Sign in with Vercel for future hosted paper SaaS identity. No provider is selected, installed, or enabled.",
      fallbackPrefix:
        "Hosted paper auth provider selection unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      stateLabel: "Selection state",
      categoryLabel: "Category",
      paperSaasFitLabel: "Paper SaaS fit",
      integrationEnabledLabel: "Integration enabled",
      secretsAddedLabel: "Secrets added",
      recommendedUseLabel: "Recommended use",
      criteriaLabel: "Selection criteria",
      nonGoalsLabel: "Non-goals",
      nextStepsLabel: "Recommended next steps",
      safetyDefaultsLabel: "Safety defaults",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      providerLabels: {
        Clerk: "Clerk",
        Auth0: "Auth0",
        Descope: "Descope",
        "Vercel OIDC / Sign in with Vercel": "Vercel OIDC / Sign in with Vercel",
      },
      categoryLabels: {
        "Vercel Marketplace auth platform": "Vercel Marketplace auth platform",
        "Enterprise identity platform": "Enterprise identity platform",
        "Passwordless and workflow-oriented auth platform":
          "Passwordless and workflow-oriented auth platform",
        "Developer-facing OAuth/OIDC identity":
          "Developer-facing OAuth/OIDC identity",
      },
      fitLabels: {
        strong_pilot_candidate: "Strong pilot candidate",
        strong_enterprise_candidate: "Strong enterprise candidate",
        pilot_candidate: "Pilot candidate",
        internal_operator_candidate: "Internal/operator candidate",
      },
      fitSummaryLabels: {
        "Strong candidate for a fast hosted paper SaaS pilot on Vercel when prebuilt UI, session management, and lower integration overhead are more important than deep enterprise identity customization.":
          "Strong candidate for a fast hosted paper SaaS pilot on Vercel when prebuilt UI, session management, and lower integration overhead are more important than deep enterprise identity customization.",
        "Strong candidate when enterprise SSO, mature identity governance, custom claims, and large organization requirements dominate.":
          "Strong candidate when enterprise SSO, mature identity governance, custom claims, and large organization requirements dominate.",
        "Candidate for passwordless customer onboarding and guided identity flows where visual flow configuration is useful.":
          "Candidate for passwordless customer onboarding and guided identity flows where visual flow configuration is useful.",
        "Useful for developer/operator tooling where users already have Vercel accounts, but not a default fit for general customer SaaS login.":
          "Useful for developer/operator tooling where users already have Vercel accounts, but not a default fit for general customer SaaS login.",
      },
      recommendedUseLabels: {
        "Shortlist for first hosted paper customer pilot evaluation.":
          "Shortlist for first hosted paper customer pilot evaluation.",
        "Shortlist for enterprise or broker-partner paper SaaS pilots.":
          "Shortlist for enterprise or broker-partner paper SaaS pilots.",
        "Evaluate if passwordless onboarding is a product priority.":
          "Evaluate if passwordless onboarding is a product priority.",
        "Keep as an internal/admin tooling option, not customer default.":
          "Keep as an internal/admin tooling option, not customer default.",
      },
      criterionLabels: {
        tenant_boundary: "Tenant boundary",
        role_mapping: "Role mapping",
        session_security: "Session security",
        mfa_for_privileged_roles: "MFA for privileged roles",
        auditability: "Auditability",
        paper_only_policy_enforcement: "Paper-only policy enforcement",
        vercel_deployment_fit: "Vercel deployment fit",
      },
      criterionReasonLabels: {
        "Every hosted paper record and request must be scoped by tenant_id.":
          "Every hosted paper record and request must be scoped by tenant_id.",
        "Customer, reviewer, operator, and admin permissions must remain separate.":
          "Customer, reviewer, operator, and admin permissions must remain separate.",
        "Sessions need expiry, rotation, revocation, logout, and audit events.":
          "Sessions need expiry, rotation, revocation, logout, and audit events.",
        "Reviewer, operator, and admin roles should require stronger assurance.":
          "Reviewer, operator, and admin roles should require stronger assurance.",
        "Identity and authorization decisions must be traceable for review.":
          "Identity and authorization decisions must be traceable for review.",
        "Auth must carry attributes needed to enforce paper-only mode.":
          "Auth must carry attributes needed to enforce paper-only mode.",
        "The provider should fit the planned hosted frontend/backend deployment path.":
          "The provider should fit the planned hosted frontend/backend deployment path.",
      },
      nonGoalLabels: {
        "Do not install provider SDKs in this slice.":
          "Do not install provider SDKs in this slice.",
        "Do not create login or signup pages.":
          "Do not create login or signup pages.",
        "Do not create customer accounts.": "Do not create customer accounts.",
        "Do not issue session cookies.": "Do not issue session cookies.",
        "Do not add secrets or environment variables.":
          "Do not add secrets or environment variables.",
        "Do not write hosted datastore records.":
          "Do not write hosted datastore records.",
        "Do not collect broker credentials.": "Do not collect broker credentials.",
        "Do not call brokers or create orders.":
          "Do not call brokers or create orders.",
        "Do not enable live trading.": "Do not enable live trading.",
      },
      nextStepLabels: {
        "Review product requirements for customer, reviewer, operator, and admin roles.":
          "Review product requirements for customer, reviewer, operator, and admin roles.",
        "Confirm tenant membership and audit requirements before choosing a provider.":
          "Confirm tenant membership and audit requirements before choosing a provider.",
        "Run a security review of shortlisted provider data handling and session behavior.":
          "Run a security review of shortlisted provider data handling and session behavior.",
        "Select one provider for a staging-only proof of concept in a future slice.":
          "Select one provider for a staging-only proof of concept in a future slice.",
        "Keep production hosted paper customer access disabled until auth, tenant datastore, RBAC, ABAC, and audit controls are implemented.":
          "Keep production hosted paper customer access disabled until auth, tenant datastore, RBAC, ABAC, and audit controls are implemented.",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        provider_selected: "provider_selected",
        integration_enabled: "integration_enabled",
        auth_provider_enabled: "auth_provider_enabled",
        customer_account_created: "customer_account_created",
        reviewer_login_created: "reviewer_login_created",
        session_cookie_issued: "session_cookie_issued",
        credentials_collected: "credentials_collected",
        secrets_added: "secrets_added",
        hosted_datastore_written: "hosted_datastore_written",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This is a read-only selection matrix, not an authentication integration.":
          "This is a read-only selection matrix, not an authentication integration.",
        "No provider is selected or enabled by this slice.":
          "No provider is selected or enabled by this slice.",
        "No credentials, secrets, customer accounts, sessions, hosted records, broker calls, or orders are created.":
          "No credentials, secrets, customer accounts, sessions, hosted records, broker calls, or orders are created.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperSession: {
      eyebrow: "Hosted Paper Session",
      title: "Mock session and tenant contract",
      description:
        "Read-only view of the future hosted paper session, tenant, roles, and permissions schema. It does not authenticate users, issue session cookies, write hosted records, collect credentials, call brokers, and does not enable live trading.",
      fallbackPrefix: "Hosted paper mock session unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoints",
      stateLabel: "Contract state",
      sessionLabel: "Mock session",
      tenantLabel: "Mock tenant context",
      rolesLabel: "Future RBAC roles",
      grantedPermissionsLabel: "Granted in mock session",
      deniedMutationPermissionsLabel: "Denied mutation permissions",
      safetyFlagsLabel: "Safety flags",
      warningLabel: "Boundary warnings",
      fields: {
        userId: "User ID",
        sessionId: "Session ID",
        authenticated: "Authenticated",
        authenticationProvider: "Authentication provider",
        authenticationMode: "Authentication mode",
        tenantId: "Tenant ID",
        tenantMode: "Tenant mode",
        tenantIsolation: "Tenant isolation required",
        hostedDatastore: "Hosted datastore enabled",
        localSqliteAccess: "Local SQLite access",
      },
      roleLabels: {
        viewer: "Viewer",
        research_reviewer: "Research reviewer",
        risk_reviewer: "Risk reviewer",
        paper_operator: "Paper operator",
        tenant_admin: "Tenant admin",
      },
      roleDescriptionLabels: {
        "Read hosted readiness, mock session, tenant context, and evidence metadata.":
          "Read hosted readiness, mock session, tenant context, and evidence metadata.",
        "Future paper-only role for research review decisions.":
          "Future paper-only role for research review decisions.",
        "Future paper-only role for risk review decisions.":
          "Future paper-only role for risk review decisions.",
        "Future paper-only role for submitting approved paper workflows.":
          "Future paper-only role for submitting approved paper workflows.",
        "Future paper-only role for tenant workspace administration.":
          "Future paper-only role for tenant workspace administration.",
      },
      permissionLabels: {
        read_hosted_readiness: "Read hosted readiness",
        read_mock_session: "Read mock session",
        read_current_tenant: "Read current tenant",
        read_tenant_paper_records: "Read tenant paper records",
        create_paper_approval_request: "Create paper approval request",
        record_paper_reviewer_decision: "Record paper reviewer decision",
        submit_approved_paper_workflow: "Submit approved paper workflow",
        enable_live_trading: "Live trading permission denied",
        upload_broker_credentials: "Upload broker credentials",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        hosted_auth_provider_enabled: "hosted_auth_provider_enabled",
        session_cookie_issued: "session_cookie_issued",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is a mock contract only; no hosted authentication provider is enabled.":
          "This endpoint is a mock contract only; no hosted authentication provider is enabled.",
        "No credentials are collected, no session cookie is issued, and no hosted datastore is written.":
          "No credentials are collected, no session cookie is issued, and no hosted datastore is written.",
        "Mock permissions do not authorize paper workflow mutations or live trading.":
          "Mock permissions do not authorize paper workflow mutations or live trading.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
      },
    },
    hostedPaperTenantEvidence: {
      eyebrow: "Hosted Paper Evidence",
      title: "Tenant boundary evidence viewer",
      description:
        "Read-only local JSON viewer for hosted paper mock session, tenant, roles, permissions, denied mutation permissions, and safety flags. The file is parsed client-side only and is not uploaded.",
      initialMessage:
        "Select local evidence exported by make hosted-paper-tenant-boundary-evidence-export.",
      noSource: "No local hosted paper tenant boundary evidence selected",
      currentSource: "Current source",
      selectFile: "Select local .json",
      clearLocalJson: "Clear local JSON",
      clearMessage: "Local hosted paper tenant boundary evidence cleared.",
      rejectExtension: "Only local .json evidence files are accepted.",
      rejectSize: "Evidence file is too large for the local viewer.",
      rejectPrefix: "Rejected unsafe hosted paper tenant boundary evidence",
      invalidJson: "Invalid JSON evidence file.",
      loadedPrefix: "Loaded",
      loadedMessage:
        "Hosted paper tenant boundary evidence loaded locally. The file was not uploaded.",
      empty:
        "Export local evidence, then select the .json file to inspect hosted paper boundary status.",
      identityKicker: "Evidence",
      identityTitle: "Boundary artifact identity",
      sessionKicker: "Mock Session",
      sessionTitle: "No real authentication",
      tenantKicker: "Tenant Context",
      tenantTitle: "Mock tenant boundary",
      permissionsKicker: "Permissions",
      permissionsTitle: "Read-only grant summary",
      deniedMutationKicker: "Denied Mutations",
      deniedMutationTitle: "Mutation permissions remain denied",
      safetyKicker: "Safety Flags",
      safetyTitle: "No login, DB, broker, or live path",
      assertionsKicker: "Boundary Assertions",
      assertionsTitle: "Reviewer checks",
      warningsKicker: "Warnings",
      warningsTitle: "Evidence limitations",
      readOnlyNote:
        "This viewer is read-only. It does not authenticate, upload, write databases, call brokers, collect credentials, create orders, grant paper execution approval, or grant live-trading approval.",
      fields: {
        evidenceId: "Evidence ID",
        generatedAt: "Generated at",
        service: "Service",
        contractState: "Contract state",
        persisted: "Persisted",
        userId: "User ID",
        sessionId: "Session ID",
        authenticated: "Authenticated",
        authenticationProvider: "Authentication provider",
        authenticationMode: "Authentication mode",
        tenantId: "Tenant ID",
        tenantMode: "Tenant mode",
        tenantIsolation: "Tenant isolation required",
        hostedDatastore: "Hosted datastore enabled",
        localSqliteAccess: "Local SQLite access",
        brokerProvider: "Broker provider",
        grantedPermissions: "Granted permissions",
        deniedPermissions: "Denied permissions",
        deniedMutationPermissions: "Denied mutation permissions",
        mutationPermissionsGranted: "Mutation permissions granted",
      },
      permissionLabels: {
        read_hosted_readiness: "Read hosted readiness",
        read_mock_session: "Read mock session",
        read_current_tenant: "Read current tenant",
        read_tenant_paper_records: "Read tenant paper records",
        create_paper_approval_request: "Create paper approval request",
        record_paper_reviewer_decision: "Record paper reviewer decision",
        submit_approved_paper_workflow: "Submit approved paper workflow",
        enable_live_trading: "Live trading permission denied",
        upload_broker_credentials: "Upload broker credentials",
      },
      safetyLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        hosted_paper_enabled: "hosted_paper_enabled",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        risk_engine_called: "risk_engine_called",
        oms_called: "oms_called",
        broker_gateway_called: "broker_gateway_called",
        authenticated: "authenticated",
        hosted_auth_provider_enabled: "hosted_auth_provider_enabled",
        session_cookie_issued: "session_cookie_issued",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        database_written: "database_written",
        hosted_datastore_enabled: "hosted_datastore_enabled",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        local_sqlite_access: "local_sqlite_access",
        production_trading_ready: "production_trading_ready",
        investment_advice: "investment_advice",
      },
      assertionLabels: {
        hosted_paper_mode_enabled: "hosted_paper_mode_enabled",
        mock_read_only: "mock_read_only",
        authenticated: "authenticated",
        authentication_provider: "authentication_provider",
        session_cookie_issued: "session_cookie_issued",
        tenant_isolation_required: "tenant_isolation_required",
        hosted_datastore_enabled: "hosted_datastore_enabled",
        hosted_datastore_written: "hosted_datastore_written",
        local_sqlite_access: "local_sqlite_access",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        live_trading_enabled: "live_trading_enabled",
        production_trading_ready: "production_trading_ready",
        mutation_permissions_granted: "mutation_permissions_granted",
      },
    },
    paperExecution: {
      eyebrow: "Paper Execution",
      title: "Paper simulation approval workflow",
      description:
        "Read-only view of the controlled path from StrategySignal to PaperOrderIntent, Risk Engine, OMS, Paper Broker Gateway, and audit events. This UI does not submit simulations or expose live controls.",
      fallbackPrefix: "Backend paper execution status unavailable. Rendering safe fallback:",
      approvalKicker: "Approval States",
      approvalTitle: "Allowed review outcomes",
      pathKicker: "Paper Path",
      pathTitle: "Required simulation route",
      safetyKicker: "Safety State",
      safetyTitle: "Paper Only, no live controls",
      safetyText:
        "A platform-created PaperOrderIntent may be simulated only after paper review. It remains separate from live trading and never calls a real broker.",
      brokerApiCalled: "BROKER_API_CALLED",
      persistenceBackend: "Persistence",
      persistenceAria: "Local paper execution persistence status",
      localOnly: "LOCAL_ONLY",
      runs: "Runs",
      omsEvents: "OMS events",
      auditEvents: "Audit events",
      executionReports: "Execution reports",
      outboxItems: "Outbox metadata",
      productionOmsReady: "Production OMS ready",
      dbPath: "Local DB",
      statusLabels: {
        research_approved: "Research approved",
        approved_for_paper_simulation: "Approved for paper simulation",
        rejected: "Rejected",
        needs_data_review: "Needs data review",
      },
      pathLabels: {
        StrategySignal: "StrategySignal",
        "Platform PaperOrderIntent": "Platform PaperOrderIntent",
        "Risk Engine": "Risk Engine",
        OMS: "OMS",
        "Paper Broker Gateway": "Paper Broker Gateway",
        "Audit Event": "Audit Event",
      },
    },
    paperRisk: {
      eyebrow: "Paper Risk Engine",
      title: "Paper risk guardrail expansion",
      description:
        "Read-only status for expanded paper-only Risk Engine checks: price reasonability, contract size, margin proxy, duplicate order prevention, daily loss, position limits, kill switch, and simulated broker heartbeat.",
      fallbackPrefix: "Backend paper risk status unavailable. Rendering safe fallback:",
      guardrailKicker: "Guardrails",
      guardrailTitle: "Expanded pre-trade and in-trade checks",
      guardrails: [
        "price_reasonability rejects paper prices outside the configured reference band.",
        "max_order_size_by_contract caps TX / MTX / TMF paper quantity.",
        "margin_proxy blocks paper exposure that exceeds the local margin proxy.",
        "duplicate_order_prevention rejects previously seen idempotency keys.",
        "daily_loss_state_tracking and position_limit_tracking use local paper state only.",
        "kill_switch_status and broker_heartbeat_status are simulated paper placeholders.",
      ],
      policyKicker: "Policy",
      policyTitle: "Paper-only risk policy",
      stateKicker: "Local State",
      stateTitle: "Paper risk state snapshot",
      contractKicker: "Contract Limits",
      contractTitle: "Max order size by contract",
      checksKicker: "Check Names",
      checksTitle: "RiskEvaluation check detail keys",
      readOnlyNote:
        "Read-only guardrail surface. It does not submit orders, approve execution, write databases, call brokers, collect credentials, turn live trading on, or provide investment advice.",
      fields: {
        maxExposure: "Max TX-equivalent exposure",
        staleQuoteSeconds: "Stale quote seconds",
        priceBand: "Price reasonability band",
        marginProxy: "Max margin proxy",
        positionLimit: "Max position TX-equivalent",
        dailyLoss: "Max daily loss",
        dailyLossState: "Daily realized loss state",
        positionState: "Current position TX-equivalent",
        seenIdempotencyKeys: "Seen idempotency keys",
        updatedAt: "Updated at",
      },
    },
    paperRiskCrossAccountReadiness: {
      eyebrow: "Paper Risk Boundary",
      title: "Paper risk cross-account readiness",
      description:
        "Read-only boundary showing that current Risk Engine guardrails use local paper state only. They are not a formal cross-account risk system, account hierarchy, margin feed, or centralized risk limit service.",
      fallbackPrefix:
        "Backend cross-account risk readiness unavailable. Rendering safe fallback:",
      statusKicker: "Readiness State",
      statusTitle: "Local paper risk, not cross-account risk",
      readinessState: "Readiness state",
      productionCrossAccountRisk: "Production cross-account risk",
      localPaperState: "Local paper state",
      paperGuardrails: "Paper guardrails",
      capabilitiesKicker: "Current Capabilities",
      capabilitiesTitle: "Implemented local paper scope",
      gapsKicker: "Non-production Gaps",
      gapsTitle: "Missing cross-account controls",
      currentScopeKicker: "Current Scope",
      currentScopeTitle: "What exists today",
      missingKicker: "Missing Controls",
      missingTitle: "Required for cross-account risk",
      requiredKicker: "Before Production",
      requiredTitle: "Required implementation path",
      warningsKicker: "Warnings",
      warningsTitle: "Readiness caveats",
      safetyKicker: "Safety Flags",
      safetyTitle: "Paper-only risk boundary",
      readOnlyNote:
        "Read-only readiness surface. It does not create orders, write databases, load real account data, call brokers, collect credentials, grant production risk approval, or provide investment advice.",
      capabilityLabels: {
        local_paper_guardrails_enabled: "local_paper_guardrails_enabled",
        local_paper_state_enabled: "local_paper_state_enabled",
        single_account_demo_state_enabled: "single_account_demo_state_enabled",
        risk_evaluation_detail_enabled: "risk_evaluation_detail_enabled",
        duplicate_idempotency_local_check_enabled:
          "duplicate_idempotency_local_check_enabled",
        cross_account_aggregation_enabled: "cross_account_aggregation_enabled",
        account_hierarchy_enabled: "account_hierarchy_enabled",
        tenant_isolated_risk_state_enabled: "tenant_isolated_risk_state_enabled",
        real_account_margin_feed_enabled: "real_account_margin_feed_enabled",
        broker_position_feed_enabled: "broker_position_feed_enabled",
        centralized_risk_limits_enabled: "centralized_risk_limits_enabled",
        distributed_kill_switch_enabled: "distributed_kill_switch_enabled",
        durable_risk_state_store_enabled: "durable_risk_state_store_enabled",
        real_time_equity_pnl_tracking_enabled:
          "real_time_equity_pnl_tracking_enabled",
        production_cross_account_risk_system:
          "production_cross_account_risk_system",
      },
      safetyLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        external_account_data_loaded: "external_account_data_loaded",
        real_account_data_loaded: "real_account_data_loaded",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        database_written: "database_written",
        hosted_datastore_written: "hosted_datastore_written",
        production_risk_approval: "production_risk_approval",
        production_cross_account_risk: "production_cross_account_risk",
        production_trading_ready: "production_trading_ready",
      },
    },
    paperReliability: {
      eyebrow: "Paper OMS Reliability",
      title: "Paper OMS reliability metadata",
      description:
        "Read-only reliability view for local paper OMS metadata: outbox records, idempotency keys, execution reports, timeout candidates, and explicit non-production gaps. It does not process orders, write records, or contact brokers.",
      fallbackPrefix: "Backend paper OMS reliability data unavailable. Rendering safe fallback:",
      statusKicker: "Reliability Status",
      statusTitle: "Local paper OMS foundation",
      safetyKicker: "Safety Flags",
      safetyTitle: "Paper-only reliability boundary",
      capabilitiesKicker: "Local Capabilities",
      capabilitiesTitle: "Implemented metadata checks",
      gapsKicker: "Non-production Gaps",
      gapsTitle: "Not a production OMS",
      noKnownGaps: "No reliability gaps were reported by the backend.",
      outboxKicker: "Outbox Metadata",
      outboxTitle: "Latest local outbox records",
      executionReportsKicker: "Execution Reports",
      executionReportsTitle: "Latest selected-order execution reports",
      timeoutKicker: "Timeout Scan",
      timeoutTitle: "Paper timeout candidates",
      timeoutActionNote:
        "Timeout handling is an explicit paper-only action. Preview validates the local EXPIRE metadata first; Mark writes only local SQLite OMS, audit, and execution-report metadata.",
      timeoutActionReason:
        "Command Center explicit paper-only timeout mark. No broker, live trading, or production OMS path.",
      previewTimeout: "Preview timeout mark",
      previewing: "Previewing...",
      markTimeout: "Mark EXPIRED locally",
      marking: "Marking...",
      previewReady: "Preview ready.",
      markSuccess: "Timeout mark persisted locally.",
      actionError: "Timeout action failed.",
      actionResultKicker: "Timeout Action",
      actionResultTitle: "Paper timeout handling result",
      outboxItems: "Outbox items",
      idempotencyKeys: "Idempotency keys",
      executionReports: "Execution reports",
      timeoutCandidates: "Timeout candidates",
      latestOrder: "Latest selected order",
      none: "None",
      emptyOutbox: "No local outbox metadata is available.",
      emptyExecutionReports: "No execution reports are available for the selected order.",
      emptyTimeouts: "No paper timeout candidates are available.",
      readOnlyNote:
        "Read-only reliability surface. It does not mutate OMS state, submit orders, process outbox workers, approve execution, write databases, call brokers, collect credentials, or provide investment advice.",
      flagLabels: {
        paper_only: "PAPER_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        production_oms_ready: "PRODUCTION_OMS_READY",
        local_sqlite_only: "LOCAL_SQLITE_ONLY",
        async_order_processing_enabled: "ASYNC_ORDER_PROCESSING",
        durable_outbox_metadata_enabled: "LOCAL_OUTBOX_METADATA",
        duplicate_order_prevention_enabled: "DUPLICATE_ORDER_PREVENTION",
        timeout_candidate_scan_enabled: "TIMEOUT_CANDIDATE_SCAN",
        execution_report_model_enabled: "EXECUTION_REPORT_MODEL",
        amend_replace_enabled: "AMEND_REPLACE",
        reconciliation_loop_enabled: "RECONCILIATION_LOOP",
      },
      fields: {
        outboxId: "Outbox ID",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        idempotencyKey: "Idempotency key",
        action: "Action",
        attempts: "Attempts",
        reportId: "Report ID",
        orderStatus: "Order status",
        lastQuantity: "Last quantity",
        cumulativeFilled: "Cumulative filled",
        leaves: "Leaves",
        timestamp: "Timestamp",
        ageSeconds: "Age seconds",
        timeoutSeconds: "Timeout seconds",
        message: "Message",
        previousStatus: "Previous status",
        newStatus: "New status",
        persisted: "Persisted",
        eventId: "OMS event ID",
        auditId: "Audit ID",
        paperOnly: "Paper only",
        brokerApiCalled: "Broker API called",
        productionOmsReady: "Production OMS ready",
      },
    },
    paperOmsProductionReadiness: {
      eyebrow: "Paper OMS Readiness",
      title: "Paper OMS is not a production OMS",
      description:
        "Read-only production readiness boundary for the local Paper OMS. The current system has deterministic paper state transitions and local metadata, but not durable async processing, production timeout workers, amend/replace, broker execution report ingestion, or formal reconciliation.",
      fallbackPrefix: "Backend Paper OMS production readiness data unavailable. Rendering safe fallback:",
      statusKicker: "Readiness Status",
      statusTitle: "Current production OMS boundary",
      capabilitiesKicker: "Current Paper Capabilities",
      capabilitiesTitle: "Local paper scaffolding",
      gapsKicker: "Production OMS Gaps",
      gapsTitle: "Controls not enabled",
      currentScopeKicker: "Current Scope",
      currentScopeTitle: "What exists today",
      missingKicker: "Missing Controls",
      missingTitle: "Needed for production OMS",
      requiredKicker: "Before Production OMS",
      requiredTitle: "Required implementation and review",
      warningsKicker: "Warnings",
      warningsTitle: "OMS readiness notes",
      safetyKicker: "Safety Flags",
      safetyTitle: "Read-only paper boundary",
      readinessState: "Readiness state",
      productionOmsReady: "Production OMS ready",
      localSqlite: "Local SQLite metadata",
      stateMachine: "State machine",
      readOnlyNote:
        "Read-only production OMS readiness surface. It does not submit orders, process queues, mutate OMS state, approve execution, write databases, call brokers, collect credentials, or turn on live trading.",
      capabilityLabels: {
        order_state_machine_enabled: "ORDER_STATE_MACHINE",
        local_outbox_metadata_enabled: "LOCAL_OUTBOX_METADATA",
        duplicate_idempotency_metadata_enabled: "DUPLICATE_IDEMPOTENCY_METADATA",
        execution_report_metadata_enabled: "EXECUTION_REPORT_METADATA",
        timeout_candidate_scan_enabled: "TIMEOUT_CANDIDATE_SCAN",
        explicit_paper_timeout_mark_enabled: "EXPLICIT_PAPER_TIMEOUT_MARK",
        asynchronous_order_processing_enabled: "ASYNC_ORDER_PROCESSING",
        distributed_durable_queue_enabled: "DISTRIBUTED_DURABLE_QUEUE",
        outbox_worker_enabled: "OUTBOX_WORKER",
        full_timeout_worker_enabled: "FULL_TIMEOUT_WORKER",
        amend_replace_enabled: "AMEND_REPLACE",
        broker_execution_report_ingestion_enabled: "BROKER_EXECUTION_REPORT_INGESTION",
        formal_reconciliation_loop_enabled: "FORMAL_RECONCILIATION_LOOP",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        read_only: "READ_ONLY",
        live_trading_enabled: "LIVE_TRADING_ENABLED",
        broker_api_called: "BROKER_API_CALLED",
        order_created: "ORDER_CREATED",
        credentials_collected: "CREDENTIALS_COLLECTED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        production_oms_ready: "PRODUCTION_OMS_READY",
        live_approval_granted: "LIVE_APPROVAL_GRANTED",
        production_trading_ready: "PRODUCTION_TRADING_READY",
      },
    },
    paperAuditIntegrity: {
      eyebrow: "Paper Audit Integrity",
      title: "Local audit hash-chain verification",
      description:
        "Read-only verification preview for local SQLite paper audit events. It checks stored previous_hash and event_hash metadata, but it is not WORM storage, centralized audit, signing, or production compliance.",
      fallbackPrefix: "Backend paper audit integrity data unavailable. Rendering safe fallback:",
      statusKicker: "Integrity Status",
      statusTitle: "Local audit verification preview",
      safetyKicker: "Safety Flags",
      safetyTitle: "Not a production audit ledger",
      checksKicker: "Event Checks",
      checksTitle: "Latest hash-chain checks",
      gapsKicker: "Known Gaps",
      gapsTitle: "Non-production audit posture",
      warningsKicker: "Warnings",
      warningsTitle: "Verification notes",
      verified: "Verified",
      auditEvents: "Audit events",
      brokenChains: "Broken chains",
      missingHashes: "Missing hashes",
      emptyChecks: "No local paper audit events are available to verify.",
      checkPassed: "verified",
      checkFailed: "failed",
      readOnlyNote:
        "Read-only audit integrity surface. It does not write databases, repair chains, upload records, call brokers, collect credentials, create orders, grant live approval, or claim WORM / immutable audit compliance.",
      flagLabels: {
        paper_only: "PAPER_ONLY",
        local_sqlite_only: "LOCAL_SQLITE_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        worm_ledger: "WORM_LEDGER",
        immutable_audit_log: "IMMUTABLE_AUDIT_LOG",
        centralized_audit_service: "CENTRALIZED_AUDIT_SERVICE",
        production_audit_compliance: "PRODUCTION_AUDIT_COMPLIANCE",
      },
      fields: {
        workflowRunId: "Workflow run",
        auditId: "Audit ID",
        sequence: "Sequence",
        previousHashValid: "previous_hash valid",
        eventHashValid: "event_hash valid",
        duplicateAuditId: "Duplicate audit_id",
      },
    },
    paperAuditWormReadiness: {
      eyebrow: "Paper Audit WORM Readiness",
      title: "SQLite audit is not a production WORM ledger",
      description:
        "Read-only readiness boundary for the audit storage posture. Local SQLite with hash-chain metadata is useful for paper demos, but it is not WORM storage, an immutable ledger, centralized audit, signing, or production compliance.",
      fallbackPrefix: "Backend WORM readiness data unavailable. Rendering safe fallback:",
      statusKicker: "Readiness Status",
      statusTitle: "Current audit storage boundary",
      storageKicker: "Production WORM Gaps",
      storageTitle: "Controls not enabled",
      currentScopeKicker: "Current Scope",
      currentScopeTitle: "What exists today",
      missingKicker: "Missing Controls",
      missingTitle: "Needed for production WORM posture",
      requiredKicker: "Before Any WORM Claim",
      requiredTitle: "Required review and implementation",
      safetyKicker: "Safety Flags",
      safetyTitle: "Read-only paper boundary",
      warningsKicker: "Warnings",
      warningsTitle: "Audit posture notes",
      readinessState: "Readiness state",
      localSqlite: "Local SQLite audit",
      localHashChain: "Local hash chain",
      wormStorage: "WORM storage",
      readOnlyNote:
        "Read-only WORM readiness surface. It does not write databases, upload audit records, repair chains, call brokers, collect credentials, create orders, grant live approval, or claim WORM / immutable audit compliance.",
      storageLabels: {
        worm_storage_enabled: "WORM_STORAGE_ENABLED",
        immutable_ledger_enabled: "IMMUTABLE_LEDGER_ENABLED",
        append_only_enforced_by_storage: "APPEND_ONLY_STORAGE_ENFORCED",
        centralized_audit_service_enabled: "CENTRALIZED_AUDIT_SERVICE_ENABLED",
        object_lock_enabled: "OBJECT_LOCK_ENABLED",
        external_timestamping_enabled: "EXTERNAL_TIMESTAMPING_ENABLED",
        cryptographic_signing_enabled: "CRYPTOGRAPHIC_SIGNING_ENABLED",
        retention_policy_enforced: "RETENTION_POLICY_ENFORCED",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        read_only: "READ_ONLY",
        live_trading_enabled: "LIVE_TRADING_ENABLED",
        broker_api_called: "BROKER_API_CALLED",
        order_created: "ORDER_CREATED",
        credentials_collected: "CREDENTIALS_COLLECTED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        worm_compliance_claim: "WORM_COMPLIANCE_CLAIM",
        production_audit_compliance: "PRODUCTION_AUDIT_COMPLIANCE",
        production_trading_ready: "PRODUCTION_TRADING_READY",
      },
    },
    paperAuditIntegrityEvidence: {
      eyebrow: "Audit Integrity Evidence",
      title: "Paper audit integrity evidence viewer",
      description:
        "Read-only local JSON viewer for evidence exported by scripts/verify-paper-audit-integrity.py. Files are parsed in this browser only and are not uploaded, persisted, or sent to backend APIs.",
      currentSource: "Current source",
      noSource: "No local audit integrity evidence loaded",
      selectFile: "Select audit integrity evidence .json",
      initialMessage:
        "Select an explicit local paper audit integrity verification JSON to inspect it in this browser.",
      rejectExtension: "Rejected: selected evidence file must be .json.",
      rejectSize: "Rejected: evidence JSON is larger than 500 KB.",
      rejectPrefix: "Rejected",
      invalidJson: "Rejected: invalid JSON evidence.",
      loadedPrefix: "Local audit integrity evidence",
      loadedMessage:
        "Loaded locally. The audit integrity evidence file was not uploaded, persisted, or sent to backend APIs.",
      clearLocalJson: "Clear evidence",
      clearMessage: "Local audit integrity evidence cleared. No backend mutation occurred.",
      empty:
        "No local audit integrity evidence loaded. Run scripts/verify-paper-audit-integrity.py with --output, then explicitly select the JSON file.",
      identityKicker: "Evidence Identity",
      identityTitle: "Paper audit integrity verification evidence",
      summaryKicker: "Verification Summary",
      summaryTitle: "Local hash-chain result",
      safetyKicker: "Safety Flags",
      safetyTitle: "Paper-only local verification",
      checksKicker: "Event Checks",
      checksTitle: "Evidence hash-chain checks",
      warningsKicker: "Warnings",
      warningsTitle: "Verification notes",
      emptyChecks: "The evidence contains no audit event checks.",
      checkPassed: "verified",
      checkFailed: "failed",
      none: "None",
      readOnlyNote:
        "Read-only evidence viewer. It does not upload files, write databases, repair chains, call brokers, collect credentials, create orders, grant live approval, or claim WORM / immutable audit compliance.",
      fields: {
        generatedAt: "Generated at",
        workflowRunId: "Workflow run",
        dbPath: "Local SQLite path",
        message: "Message",
        verified: "Verified",
        auditEvents: "Audit events",
        brokenChains: "Broken chains",
        duplicateAuditIds: "Duplicate audit IDs",
        auditId: "Audit ID",
        sequence: "Sequence",
        previousHashValid: "previous_hash valid",
        eventHashValid: "event_hash valid",
        duplicateAuditId: "Duplicate audit_id",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        local_sqlite_only: "LOCAL_SQLITE_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        worm_ledger: "WORM_LEDGER",
        immutable_audit_log: "IMMUTABLE_AUDIT_LOG",
        centralized_audit_service: "CENTRALIZED_AUDIT_SERVICE",
        production_audit_compliance: "PRODUCTION_AUDIT_COMPLIANCE",
        broker_credentials_collected: "BROKER_CREDENTIALS_COLLECTED",
      },
    },
    paperBrokerSimulation: {
      eyebrow: "Paper Broker Simulation",
      title: "Local quote-based simulation preview",
      description:
        "Preview how a Paper Broker Gateway outcome can be derived from caller-provided local quote and liquidity inputs. This does not submit orders, download market data, write databases, or call a broker.",
      paperOnlyBadge: "Paper Only",
      previewOnlyBadge: "Preview only",
      initialMessage:
        "Adjust local quote inputs and preview a paper-only simulated broker outcome.",
      previewing: "Previewing local paper simulation...",
      previewReady: "Paper simulation preview ready.",
      unknownError: "Paper broker simulation preview failed.",
      fields: {
        symbol: "Contract",
        side: "Side",
        orderType: "Order type",
        quantity: "Quantity",
        txEquivalentExposure: "TX-equivalent exposure",
        limitPrice: "Limit price",
        bidPrice: "Bid price",
        askPrice: "Ask price",
        lastPrice: "Last price",
        bidSize: "Bid size",
        askSize: "Ask size",
        quoteAgeSeconds: "Quote age seconds",
        liquidityScore: "Liquidity score",
        maxSpreadPoints: "Max spread points",
        staleQuoteSeconds: "Stale quote seconds",
      },
      sideOptions: {
        BUY: "BUY",
        SELL: "SELL",
      },
      orderTypeOptions: {
        MARKET: "MARKET",
        LIMIT: "LIMIT",
      },
      guardrails: [
        "Paper Only: calls /api/paper-execution/broker-simulation/preview only.",
        "Inputs are caller-provided local quote snapshots; no external market data is downloaded.",
        "The preview does not create orders, write databases, call Risk Engine, call OMS, or call a real broker.",
        "This is not a production matching engine, broker execution report, live liquidity model, or trading recommendation.",
      ],
      preview: "Preview Paper Outcome",
      resultKicker: "Simulation Result",
      resultTitle: "Derived paper broker outcome",
      none: "None",
      outcomeLabels: {
        acknowledge: "Acknowledge only",
        partial_fill: "Partial fill",
        fill: "Fill",
        reject: "Reject",
        cancel: "Cancel",
      },
      result: {
        outcome: "Outcome",
        fillQuantity: "Simulated fill quantity",
        fillPrice: "Simulated fill price",
        remainingQuantity: "Remaining quantity",
        spread: "Spread points",
        availableSize: "Available size",
        reason: "Reason",
      },
    },
    paperBrokerSimulationReadiness: {
      eyebrow: "Broker Simulation Readiness",
      title: "Paper broker simulation is not market matching",
      description:
        "Read-only boundary for deterministic and local quote-based paper simulation. Paper fills are simulated metadata only, not real market fills, broker execution reports, or production execution modeling.",
      fallbackPrefix:
        "Backend paper broker simulation readiness data unavailable. Rendering safe fallback:",
      statusKicker: "Readiness Status",
      statusTitle: "Current broker simulation boundary",
      capabilitiesKicker: "Current Paper Capabilities",
      capabilitiesTitle: "Local paper simulation",
      gapsKicker: "Production Execution Gaps",
      gapsTitle: "Controls not enabled",
      currentScopeKicker: "Current Scope",
      currentScopeTitle: "What exists today",
      missingKicker: "Missing Controls",
      missingTitle: "Needed for production execution modeling",
      requiredKicker: "Before Production Execution Model",
      requiredTitle: "Required implementation and review",
      warningsKicker: "Warnings",
      warningsTitle: "Broker simulation readiness notes",
      safetyKicker: "Safety Flags",
      safetyTitle: "Read-only paper boundary",
      readinessState: "Readiness state",
      productionExecutionModel: "Production execution model",
      localQuotePreview: "Local quote preview",
      deterministicSimulation: "Deterministic simulation",
      readOnlyNote:
        "Read-only broker simulation readiness surface. It does not create orders, call Risk Engine, call OMS, call Broker Gateway execution paths, write databases, download market data, call brokers, collect credentials, or claim real fill accuracy.",
      capabilityLabels: {
        deterministic_broker_simulation_enabled: "DETERMINISTIC_SIMULATION",
        local_quote_snapshot_preview_enabled: "LOCAL_QUOTE_PREVIEW",
        paper_ack_reject_partial_fill_fill_cancel_enabled: "PAPER_OUTCOMES",
        caller_provided_quote_only: "CALLER_PROVIDED_QUOTE_ONLY",
        real_market_matching_engine_enabled: "REAL_MARKET_MATCHING_ENGINE",
        exchange_order_book_replay_enabled: "EXCHANGE_ORDER_BOOK_REPLAY",
        broker_execution_report_model_enabled: "BROKER_EXECUTION_REPORT_MODEL",
        latency_queue_position_model_enabled: "LATENCY_QUEUE_POSITION_MODEL",
        slippage_liquidity_calibration_enabled: "SLIPPAGE_LIQUIDITY_CALIBRATION",
        real_account_reconciliation_enabled: "REAL_ACCOUNT_RECONCILIATION",
        production_execution_model: "PRODUCTION_EXECUTION_MODEL",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        read_only: "READ_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        external_market_data_downloaded: "EXTERNAL_MARKET_DATA_DOWNLOADED",
        real_order_created: "REAL_ORDER_CREATED",
        order_created: "ORDER_CREATED",
        credentials_collected: "CREDENTIALS_COLLECTED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        production_execution_model: "PRODUCTION_EXECUTION_MODEL",
        production_trading_ready: "PRODUCTION_TRADING_READY",
      },
    },
    paperBrokerEvidence: {
      eyebrow: "Broker Simulation Evidence",
      title: "Paper broker simulation evidence viewer",
      description:
        "Read-only local JSON viewer for evidence exported by make paper-broker-simulation-evidence-export. Files are parsed in this browser only and are not uploaded, persisted, or sent to backend APIs.",
      currentSource: "Current source",
      noSource: "No local broker simulation evidence loaded",
      selectFile: "Select broker evidence .json",
      initialMessage:
        "Select an explicit local paper broker simulation evidence JSON to inspect it in this browser.",
      rejectExtension: "Rejected: selected evidence file must be .json.",
      rejectSize: "Rejected: evidence JSON is larger than 500 KB.",
      rejectPrefix: "Rejected",
      invalidJson: "Rejected: invalid JSON evidence.",
      loadedPrefix: "Local broker evidence",
      loadedMessage:
        "Loaded locally. The broker simulation evidence file was not uploaded, persisted, or sent to backend APIs.",
      clearLocalJson: "Clear evidence",
      clearMessage: "Local broker simulation evidence cleared. No backend mutation occurred.",
      empty:
        "No local broker simulation evidence is loaded. Export one with make paper-broker-simulation-evidence-export and select the JSON file explicitly.",
      identityKicker: "Evidence Identity",
      identityTitle: "Paper broker preview evidence",
      inputKicker: "Quote Snapshot",
      inputTitle: "Caller-provided local inputs",
      resultKicker: "Preview Result",
      resultTitle: "Paper-only simulated outcome",
      safetyKicker: "Safety Flags",
      safetyTitle: "No execution path used",
      checksKicker: "Model Checks",
      checksTitle: "Preview validation checks",
      warningsKicker: "Warnings",
      warningsTitle: "Evidence review notes",
      none: "None",
      readOnlyNote:
        "Read-only evidence surface. It does not upload files, write databases, call brokers, collect credentials, create orders, call Risk Engine, call OMS, call Broker Gateway execution paths, grant live approval, or provide investment advice.",
      fields: {
        evidenceId: "Evidence ID",
        generatedAt: "Generated at",
        persisted: "Persisted",
        symbol: "Contract",
        side: "Side",
        orderType: "Order type",
        quantity: "Quantity",
        bidPrice: "Bid price",
        askPrice: "Ask price",
        lastPrice: "Last price",
        bidSize: "Bid size",
        askSize: "Ask size",
        quoteAgeSeconds: "Quote age seconds",
        liquidityScore: "Liquidity score",
        simulationOutcome: "Simulation outcome",
        fillQuantity: "Simulated fill quantity",
        fillPrice: "Simulated fill price",
        remainingQuantity: "Remaining quantity",
        referencePrice: "Reference price",
        spreadPoints: "Spread points",
        availableSize: "Available size",
        reason: "Reason",
      },
      safetyLabels: {
        paper_only: "Paper only",
        live_trading_enabled: "Live disabled flag",
        broker_api_called: "Broker API called",
        external_market_data_downloaded: "External market data downloaded",
        production_execution_model: "Production execution model",
        database_written: "Database written",
        order_created: "Order created",
        risk_engine_called: "Risk Engine called",
        oms_called: "OMS called",
        broker_credentials_collected: "Broker credentials collected",
        investment_advice: "Investment advice",
      },
    },
    browserOnlyMockDemo: {
      eyebrow: "Browser-only Mock Runtime",
      title: "Interactive Demo in this browser",
      description:
        "Runs deterministic TX / MTX / TMF market data with market regime, spread, liquidity, quote age, and slippage estimates, plus signal-only strategy simulation, PaperOrderIntent risk checks, OMS timeline, paper broker fill simulation, and simulated portfolio metrics entirely in the browser. It requires no local backend, no broker, no database, no real money, and no live trading.",
      initialMessage: "Browser-only mock demo is ready. No backend is required.",
      restoredMessage: "Browser-only mock demo restored from this browser's local state.",
      badges: {
        paperOnly: "Paper Only",
        browserOnly: "Browser-only",
        noBackendRequired: "No backend required",
        noBroker: "No broker",
        noRealMoney: "No real money",
        noLiveTrading: "No live trading",
        notAdvice: "Not investment advice",
      },
      actions: {
        nextTick: "Generate next tick",
        runStrategy: "Run mock strategy",
        simulateOrder: "Simulate paper order",
        resetSession: "Reset browser demo",
        clearState: "Clear browser state",
        copySummary: "Copy demo summary",
        copyEvidence: "Copy evidence JSON",
      },
      messages: {
        tickReady: "Next deterministic browser-only tick generated.",
        signalReady: "StrategySignal generated in this browser. No order was created by the strategy.",
        orderReady:
          "Paper order simulation completed in this browser. No backend, broker, DB, or real order was used.",
        resetReady: "Browser-only mock demo reset.",
        clearReady: "Browser-only local state cleared and reset. No backend or database was touched.",
        reviewOmsReady: "Review the simulated OMS lifecycle below. It is browser-only and not a broker confirmation.",
        reviewPortfolioReady:
          "Review the paper-only portfolio and simulated metrics below. This is not a performance claim.",
        summaryCopied: "Demo summary copied to clipboard.",
        evidenceCopied: "Browser-only evidence JSON copied to clipboard.",
        copyFailed: "Copy failed. Copy the values manually from the panel.",
      },
      guide: {
        eyebrow: "Guided Demo",
        title: "Complete browser-only walkthrough",
        description:
          "Follow these steps to operate the demo from market tick to signal, Paper Only order, simulated OMS, and paper-only metrics. Every step stays inside this browser.",
        stepListLabel: "Browser-only demo steps",
        activeStepLabel: "Step",
        expectedLabel: "Expected result",
        resultLabel: "Result explanation",
        safetyLabel: "Safety boundary",
        nextLabel: "Next step",
        previous: "Previous",
        next: "Next",
        sessionMetaLabel: "Browser-only session metadata",
        sessionIdLabel: "Session",
        seedLabel: "Seed",
        paperOnlyLabel: "Paper Only",
        browserOnlyLabel: "Browser-only",
        steps: [
          {
            title: "Generate market tick",
            actionLabel: "Generate next tick",
            body:
              "Create the next deterministic TX / MTX / TMF quote snapshot in this browser.",
            expected:
              "Bid, ask, last, quote age, quote size, and liquidity score update without external market data.",
            result:
              "The tick also shows a deterministic market regime such as normal, trending, volatile, illiquid, or stale_quote, so spread and liquidity can change without live data.",
            safety:
              "No backend, broker, external market feed, database write, or live trading path is used.",
            next: "Run the signal-only mock strategy against the selected symbol.",
          },
          {
            title: "Run mock strategy",
            actionLabel: "Run mock strategy",
            body:
              "Generate a StrategySignal from the deterministic browser price path.",
            expected:
              "A StrategySignal appears with direction, target TX-equivalent exposure, confidence, and signals_only=true.",
            result:
              "The signal is based on the deterministic volatility path and remains a research signal, not an order instruction.",
            safety:
              "The strategy emits a signal only. It does not create an order or call Risk / OMS / Broker Gateway.",
            next: "Convert the signal into a platform-owned PaperOrderIntent simulation.",
          },
          {
            title: "Simulate Paper Only order",
            actionLabel: "Simulate paper order",
            body:
              "Run the browser-local paper risk checks and simulated OMS / paper fill path.",
            expected:
              "The workflow shows risk approval or rejection, OMS status, fill quantity, fill price, and remaining quantity.",
            result:
              "The fill model uses spread, liquidity, quote age, and deterministic slippage to explain filled, partial, stale quote reject, or illiquid reject outcomes.",
            safety:
              "This creates no real order, no broker request, no database record, and no live approval.",
            next: "Review the simulated OMS lifecycle.",
          },
          {
            title: "Review OMS timeline",
            actionLabel: "Review OMS timeline",
            body:
              "Inspect CREATE, RISK_CHECK, SUBMIT, ACCEPT, FILL, PARTIAL_FILL, or REJECT transitions.",
            expected:
              "The timeline explains how the paper workflow moved through simulated OMS states.",
            result:
              "Each OMS event carries a reason, including whether the order filled because sufficient liquidity existed or was rejected by stale / illiquid conditions.",
            safety:
              "These events are browser-local demo events, not exchange or broker execution reports.",
            next: "Review paper-only position and simulated PnL.",
          },
          {
            title: "Review simulated position / PnL",
            actionLabel: "Review simulated metrics",
            body:
              "Inspect paper position, average price, unrealized PnL, and paper equity.",
            expected:
              "The portfolio summary updates from deterministic mock fills and current browser tick marks.",
            result:
              "The paper-only metrics reflect the current deterministic mark price and copied evidence can include market realism metadata.",
            safety:
              "Simulated PnL is product workflow output only. It is not investment advice or a performance claim.",
            next: "Reset the demo session or copy the evidence JSON for reviewer notes.",
          },
          {
            title: "Reset demo session",
            actionLabel: "Reset browser demo",
            body:
              "Clear the browser-local session back to a safe initial state.",
            expected:
              "Tick, signal, order, OMS, position, and simulated metrics return to the initial paper-only state.",
            result:
              "The session returns to the same deterministic seed so the reviewer can repeat the market regime and fill model walkthrough.",
            safety:
              "Reset affects only this browser's local demo state and does not delete backend or database records.",
            next: "Start again with Generate market tick when the reviewer wants to repeat the demo.",
          },
        ],
      },
      visualization: {
        eyebrow: "Visualization Layer",
        title: "Market path, microstructure, order outcome, and paper PnL",
        description:
          "Turns the browser-only demo into visual evidence: deterministic price path, bid / ask band, market regime strip, spread, liquidity, quote age, slippage estimate, paper order outcome, and simulated PnL.",
        pricePathKicker: "Price Path",
        pricePathTitle: "Deterministic TX / MTX / TMF market path",
        priceChartLabel: "Browser-only deterministic price path with bid and ask band",
        regimeStripLabel: "Market regime strip",
        latestSnapshot: "Latest visual snapshot",
        microstructureKicker: "Microstructure",
        microstructureTitle: "Spread / liquidity / quote age / slippage",
        microstructureNote:
          "These bars are deterministic mock data only. They are not external market data and do not represent live liquidity.",
        orderOutcomeKicker: "Order Outcome",
        orderOutcomeTitle: "Paper fill / partial / reject visual",
        orderRailLabel: "Paper order simulated fill versus remaining quantity",
        noOrderYet:
          "Simulate a Paper Only order to visualize fill quantity, remaining quantity, and fill reason.",
        portfolioKicker: "Paper Portfolio",
        portfolioTitle: "Position and simulated PnL snapshot",
        fields: {
          currentTick: "Current tick",
          tick: "Tick",
          marketRegime: "Market regime",
          spread: "Spread",
          liquidity: "Liquidity score",
          quoteAge: "Quote age",
          slippage: "Slippage estimate",
          outcome: "Outcome",
          fillQuantity: "Fill quantity",
          fillReason: "Fill reason",
          position: "Position",
          unrealizedPnl: "Unrealized PnL",
          equity: "Paper equity",
        },
        safety: {
          browserOnly: "Browser-only",
          noExternalData: "No external market data",
          noBroker: "No broker",
          noRealOrder: "No real order",
        },
      },
      sections: {
        sessionKicker: "Session",
        sessionTitle: "Browser-local demo state",
        marketKicker: "Market Data",
        marketTitle: "Deterministic browser price path",
        regimeLegend: "Market regimes: normal, trending, volatile, illiquid, stale_quote.",
        signalKicker: "Strategy",
        signalTitle: "Signal-only strategy output",
        orderKicker: "Paper Order",
        orderTitle: "Browser-only paper workflow result",
        realismKicker: "Market Realism",
        realismTitle: "Spread, liquidity, quote age, and slippage model",
        performanceKicker: "Simulated Metrics",
        performanceTitle: "Paper-only portfolio and PnL",
        omsKicker: "OMS",
        omsTitle: "Simulated OMS lifecycle",
        timelineKicker: "Demo Timeline",
        timelineTitle: "Browser session events",
        safetyKicker: "Safety",
        safetyTitle: "Browser-only safety flags",
        warningsKicker: "Warnings",
        warningsTitle: "Demo boundaries",
      },
      fields: {
        symbol: "Symbol",
        quantity: "Quantity",
        tick: "Tick",
        sessionId: "Session ID",
        mockSeed: "Deterministic mock seed",
        storageKey: "localStorage key",
        bid: "Bid",
        ask: "Ask",
        marketRegime: "Market regime",
        spread: "Spread",
        last: "Last",
        change: "Change",
        quoteAge: "Quote age",
        liquidity: "Liquidity score",
        volatility: "Volatility path",
        activeSnapshot: "Active snapshot",
        signalId: "Signal ID",
        direction: "Direction",
        targetExposure: "Target TX-equivalent exposure",
        confidence: "Confidence",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        riskApproved: "Risk approved",
        omsStatus: "OMS status",
        fillQuantity: "Simulated fill quantity",
        fillPrice: "Simulated fill price",
        remainingQuantity: "Remaining quantity",
        slippage: "Slippage estimate",
        fillReason: "Fill reason",
        position: "Position",
        averagePrice: "Average price",
        unrealizedPnl: "Unrealized PnL",
        equity: "Paper equity",
        performanceClaim: "Performance claim",
      },
      emptySignal: "Generate a tick and run the mock strategy to see a StrategySignal.",
      emptyOrder: "Run a strategy, then simulate a paper order to see Risk / OMS / paper fill results.",
      readOnlyNote:
        "This runtime uses only browser local state and localStorage. It does not upload data, write a database, call a broker, or create a real order. Live trading stays disabled.",
      summary: {
        title: "Browser-only mock demo summary",
        safetyLine:
          "Paper Only; browser-only; deterministic market realism; no external market data; no backend; no broker; no real money; no live trading; not investment advice; no performance claim.",
      },
    },
    mockBackendDemo: {
      eyebrow: "Mock Backend",
      title: "Mock Backend Demo MVP",
      description:
        "Runs deterministic mock market data, signal-only strategy simulation, PaperOrderIntent risk checks, OMS lifecycle, paper broker simulation, and a paper-only portfolio summary. It uses no broker, no real money, no external market data, and no live trading.",
      initialMessage: "Mock Backend is ready for a Paper Only demo.",
      readyMessage: "Mock Backend status loaded. All data is deterministic demo data.",
      backendUnavailable:
        "Mock Backend is unavailable. Start the local backend to operate this demo panel.",
      unknownError: "Mock Backend action failed.",
      badges: {
        paperOnly: "Paper Only",
        mockBackend: "Mock Backend",
        noBroker: "No broker",
        noRealMoney: "No real money",
        noLiveTrading: "No live trading",
        notAdvice: "Not investment advice",
      },
      actions: {
        nextTick: "Generate next tick",
        runStrategy: "Run mock strategy",
        simulateOrder: "Simulate paper order",
        resetSession: "Reset demo session",
      },
      messages: {
        generatingTick: "Generating deterministic mock tick...",
        tickReady: "Next deterministic mock tick generated.",
        runningStrategy: "Running signal-only mock strategy...",
        signalReady: "StrategySignal generated. No order was created by the strategy.",
        simulatingOrder:
          "Simulating paper order through Risk Engine, OMS, and Paper Broker Gateway...",
        orderReady: "Paper order simulation complete. No real order was created.",
        resetting: "Resetting local mock demo session...",
        resetReady: "Mock demo session reset.",
      },
      sections: {
        marketKicker: "Market Data",
        marketTitle: "Deterministic TX / MTX / TMF price path",
        signalKicker: "Strategy",
        signalTitle: "Signal-only strategy output",
        orderKicker: "Paper Order",
        orderTitle: "Paper workflow result",
        portfolioKicker: "Portfolio",
        portfolioTitle: "Paper-only account summary",
        omsKicker: "OMS",
        omsTitle: "Simulated OMS timeline",
        safetyKicker: "Safety",
        safetyTitle: "Mock backend safety flags",
        warningsKicker: "Warnings",
        warningsTitle: "Demo boundaries",
      },
      fields: {
        symbol: "Symbol",
        quantity: "Quantity",
        tick: "Tick",
        bid: "Bid",
        ask: "Ask",
        last: "Last",
        change: "Change",
        quoteAge: "Quote age",
        activeSnapshot: "Active snapshot",
        signalId: "Signal ID",
        direction: "Direction",
        targetExposure: "Target TX-equivalent exposure",
        confidence: "Confidence",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        riskApproved: "Risk approved",
        omsStatus: "OMS status",
        fillQuantity: "Simulated fill quantity",
        position: "Position",
        averagePrice: "Average price",
        unrealizedPnl: "Unrealized PnL",
        equity: "Paper equity",
      },
      emptySignal: "Run the mock strategy to generate a StrategySignal.",
      emptyOrder: "Simulate a paper order to inspect OMS and portfolio output.",
      readOnlyNote:
        "This panel calls only /api/mock-backend/* endpoints. It does not collect credentials, write production data, call a real broker, create a real order, or provide investment advice.",
    },
    paperSubmit: {
      eyebrow: "Controlled Paper Submit",
      title: "Create a paper simulation record",
      description:
        "Creates one Paper Only simulation through the backend workflow record API only when the selected persisted approval_request_id has completed the required review sequence. It cannot approve live trading, collect credentials, or call a real broker.",
      paperOnlyBadge: "Paper Only submit",
      approvalRequiredBadge: "Persisted approval required",
      defaultReason: "Controlled customer demo: paper simulation only.",
      fields: {
        approvalRequestId: "Persisted approval request",
        direction: "Signal direction",
        symbol: "Contract",
        quantity: "Quantity",
        targetExposure: "Target TX-equivalent exposure",
        brokerSimulation: "Paper broker outcome",
        approvalDecision: "Approval decision",
        approvalReason: "Audit reason",
      },
      noApprovedRequests: "No approved paper approval requests available",
      missingApproval:
        "Submit is disabled until a persisted approval_request_id reaches approved_for_paper_simulation.",
      directionOptions: {
        LONG: "LONG",
        SHORT: "SHORT",
      },
      simulationOptions: {
        acknowledge: "Acknowledge only",
        partial_fill: "Partial fill",
        fill: "Fill",
        reject: "Reject",
        cancel: "Cancel",
      },
      guardrails: [
        "Paper Only: calls /api/paper-execution/workflow/record only with a persisted approval_request_id.",
        "The selected approval request must already be approved_for_paper_simulation through the local approval queue.",
        "StrategySignal remains the approved signal payload and cannot call broker, Risk Engine, or OMS directly.",
        "No live approval, no credential upload, no account login, and no real broker connection.",
      ],
      approvalContext: {
        strategy: "Approved strategy",
        requiredSequence: "Required review sequence",
        latestHash: "Latest approval chain hash",
      },
      submit: "Create Paper Simulation",
      submitting: "Creating paper simulation...",
      refreshRecords: "Refresh records",
      success: "Paper simulation recorded locally. Refresh records to view the OMS and audit timelines.",
      unknownError: "Paper simulation failed.",
      resultKicker: "Paper Result",
      resultTitle: "Recorded workflow summary",
      result: {
        workflowRunId: "Workflow run",
        approvalRequestId: "Approval request",
        orderId: "Order ID",
        finalStatus: "Final OMS status",
        persistence: "Persisted",
        brokerMessage: "Paper broker message",
      },
    },
    paperApprovalRequest: {
      eyebrow: "Paper Approval Request",
      title: "Create a paper-only approval request",
      description:
        "Creates one local approval request for a StrategySignal. This is the paper-only starting point for reviewer workflow and does not create orders, call Risk Engine, call OMS, collect credentials, or connect brokers.",
      paperOnlyBadge: "Paper Only request",
      noOrderBadge: "No order created",
      defaultReason: "Customer demo request for paper simulation review only.",
      fields: {
        strategyId: "Strategy ID",
        strategyVersion: "Strategy version",
        signalId: "Signal ID",
        direction: "Signal direction",
        targetExposure: "Target TX-equivalent exposure",
        confidence: "Confidence",
        stopDistance: "Stop distance points",
        requesterId: "Requester ID",
        requestReason: "Request reason",
      },
      guardrails: [
        "Paper Only: calls only /api/paper-execution/approvals/requests.",
        "Request creation starts at pending_review and does not create reviewer decisions.",
        "StrategySignal remains signals-only and does not call Risk Engine, OMS, Broker Gateway, or brokers.",
        "No live approval, credential upload, account login, broker connection, paper simulation, or real order is available in this step.",
      ],
      submit: "Create Approval Request",
      submitting: "Creating approval request...",
      refreshQueue: "Refresh queue",
      success:
        "Paper approval request created locally. The approval queue has been refreshed for reviewer decisions.",
      unknownError: "Paper approval request failed.",
      resultKicker: "Request Result",
      resultTitle: "Created approval request",
      result: {
        approvalRequestId: "Approval request",
        currentStatus: "Current status",
        strategy: "Strategy",
        signal: "Signal",
        paperOnly: "Paper only",
        latestHash: "Latest chain hash",
      },
    },
    paperApprovalDecision: {
      eyebrow: "Paper Approval Decision",
      title: "Record a paper-only reviewer decision",
      description:
        "Creates one reviewer decision for an existing local approval request. This form is paper-only, writes only the local approval decision record, and does not create orders, collect credentials, or call brokers.",
      paperOnlyBadge: "Paper Only decision",
      noCredentialsBadge: "No credentials",
      defaultReason: "Local paper review decision for controlled simulation evaluation.",
      noActionableRequests:
        "No actionable approval requests are available. Create a local paper approval request before recording reviewer decisions.",
      fields: {
        approvalRequestId: "Approval request",
        currentStatus: "Current status",
        decision: "Reviewer decision",
        reviewerRole: "Reviewer role",
        reviewerId: "Reviewer ID",
        decisionReason: "Decision reason",
      },
      decisionLabels: {
        research_approved: "Research approved",
        approved_for_paper_simulation: "Approved for paper simulation",
        rejected: "Rejected",
        needs_data_review: "Needs data review",
      },
      roleLabels: {
        research_reviewer: "Research reviewer",
        risk_reviewer: "Risk reviewer",
        compliance_reviewer: "Compliance reviewer",
      },
      context: {
        strategy: "Strategy",
        signal: "Signal",
        requiredSequence: "Required review sequence",
        latestHash: "Latest approval chain hash",
      },
      guardrails: [
        "Paper Only: calls only the local approval decision endpoint for an existing approval_request_id.",
        "This form records reviewer decisions only. It does not create paper simulations, orders, or paper execution approval by itself.",
        "Dual review still requires distinct reviewer IDs and the backend validates the required sequence.",
        "No live approval, credential upload, account login, broker connection, or real order path is available.",
      ],
      submit: "Record Decision",
      submitting: "Recording decision...",
      refreshQueue: "Refresh queue",
      success:
        "Paper reviewer decision recorded locally. Refresh the queue before controlled paper submit.",
      unknownError: "Paper reviewer decision failed.",
      resultKicker: "Decision Result",
      resultTitle: "Updated approval request",
      result: {
        approvalRequestId: "Approval request",
        currentStatus: "Current status",
        decisionCount: "Decision count",
        paperSimulationApproved: "Paper simulation approved",
        latestHash: "Latest chain hash",
      },
    },
    paperApprovals: {
      eyebrow: "Paper Approval Queue",
      title: "Paper-only approval queue and history",
      description:
        "Read-only view of persisted paper approval requests, reviewer history, required review sequence, hash-chain references, and safety flags. This panel does not submit decisions, approve execution, collect credentials, or call brokers.",
      fallbackPrefix: "Backend paper approval data unavailable. Rendering safe fallback:",
      statusKicker: "Approval Status",
      statusTitle: "Local paper governance state",
      queueKicker: "Pending Queue",
      queueTitle: "Pending approval requests",
      historyKicker: "Reviewer History",
      historyTitle: "Approval history and hash-chain references",
      emptyQueue: "No pending paper approval requests are available.",
      emptyHistory: "No paper approval history is available.",
      approvalMode: "Approval mode",
      reviewerRoles: "Reviewer roles",
      supportedDecisions: "Supported decisions",
      recordPolicy: "Record policy",
      dualReview: "DUAL_REVIEW_REQUIRED",
      brokerApiCalled: "BROKER_API_CALLED",
      strategy: "Strategy",
      signal: "Signal",
      requiredSequence: "Required review sequence",
      createdAt: "Created at",
      pendingSecondReview: "Pending second review",
      reviewer: "Reviewer",
      reason: "Reason",
      hashChain: "Hash-chain references",
      requestHash: "Request hash",
      latestHash: "Latest chain hash",
      previousHash: "Previous chain hash",
      decisionHash: "Decision hash",
      noDecisions: "No reviewer decisions have been recorded yet.",
      safetyFlags: "Paper approval safety flags",
      paperOnly: "PAPER_ONLY",
      noLiveApproval: "APPROVAL_FOR_LIVE",
      executionEligible: "LIVE_EXECUTION_ELIGIBLE",
      readOnlyNote:
        "Read-only approval surface. It does not create approval requests, submit reviewer decisions, write databases, call brokers, collect credentials, create orders, or grant live-trading access.",
    },
    paperComplianceApprovalReadiness: {
      eyebrow: "Compliance Approval Boundary",
      title: "Local paper scaffolding, not formal compliance approval",
      description:
        "Read-only readiness view showing that the current approval workflow is local Paper Only scaffolding. It is not a formal compliance approval system and does not grant paper execution or live approval by itself.",
      fallbackPrefix:
        "Backend paper compliance approval readiness unavailable. Rendering safe fallback:",
      endpointLabel: "Read-only endpoint",
      stateLabel: "Readiness state",
      scaffoldingLabel: "Approval scaffolding",
      auditLabel: "Audit posture",
      safetyDefaultsLabel: "Safety defaults",
      currentScopeLabel: "Current local paper scope",
      missingLabel: "Missing for formal compliance",
      requiredLabel: "Required before formal approval",
      safetyFlagsLabel: "Safety flags",
      decisionsLabel: "Paper-only decisions",
      warningLabel: "Boundary warnings",
      scaffoldingLabels: {
        local_paper_approval_queue_enabled: "Local paper approval queue enabled",
        local_sqlite_persistence_enabled: "Local SQLite persistence enabled",
        local_dual_review_rule_enabled: "Local dual-review rule enabled",
        formal_compliance_approval_enabled: "Formal compliance approval enabled",
        production_approval_authority: "Production approval authority",
        reviewer_identity_verified: "Reviewer identity verified",
        rbac_abac_enforced: "RBAC/ABAC enforced",
        segregation_of_duties_enforced: "Segregation of duties enforced",
        compliance_policy_engine_enabled: "Compliance policy engine enabled",
        approval_policy_versioning_enabled: "Approval policy versioning enabled",
        tenant_scoped_approval_records_enabled: "Tenant-scoped approval records enabled",
        legal_retention_policy_enforced: "Legal retention policy enforced",
      },
      auditLabels: {
        local_hash_chain_enabled: "Local hash-chain enabled",
        worm_ledger_enabled: "WORM ledger enabled",
        immutable_audit_log_enabled: "Immutable audit log enabled",
        centralized_audit_service_enabled: "Centralized audit service enabled",
        signed_approval_records_enabled: "Signed approval records enabled",
        external_timestamping_enabled: "External timestamping enabled",
        retention_policy_enforced: "Retention policy enforced",
        production_compliance_archive_enabled: "Production compliance archive enabled",
      },
      currentScopeLabels: {
        "Local Paper Only approval queue and history for demos and technical testing.":
          "Local Paper Only approval queue and history for demos and technical testing.",
        "Local SQLite persistence with hash-chain references for paper approval decisions.":
          "Local SQLite persistence with hash-chain references for paper approval decisions.",
        "Controlled Paper Submit can reference a persisted approval_request_id.":
          "Controlled Paper Submit can reference a persisted approval_request_id.",
        "Web Command Center can create local paper requests and decisions for paper simulation only.":
          "Web Command Center can create local paper requests and decisions for paper simulation only.",
      },
      missingLabels: {
        "Real reviewer login and verified reviewer identity.":
          "Real reviewer login and verified reviewer identity.",
        "Formal RBAC/ABAC enforcement for approval authority.":
          "Formal RBAC/ABAC enforcement for approval authority.",
        "Tenant-scoped customer accounts and hosted approval records.":
          "Tenant-scoped customer accounts and hosted approval records.",
        "Compliance policy engine with versioned approval rules.":
          "Compliance policy engine with versioned approval rules.",
        "Segregation of duties enforced by identity and authorization controls.":
          "Segregation of duties enforced by identity and authorization controls.",
        "Immutable WORM ledger or centralized compliance audit service.":
          "Immutable WORM ledger or centralized compliance audit service.",
        "Signed approval records, external timestamping, and retention policy enforcement.":
          "Signed approval records, external timestamping, and retention policy enforcement.",
        "Legal, regulatory, security, and operations review for customer-facing approval workflows.":
          "Legal, regulatory, security, and operations review for customer-facing approval workflows.",
      },
      requiredLabels: {
        "Select and review an authentication provider.":
          "Select and review an authentication provider.",
        "Implement reviewer identity, session lifecycle, MFA, and logout behavior.":
          "Implement reviewer identity, session lifecycle, MFA, and logout behavior.",
        "Implement tenant-scoped customer accounts and membership records.":
          "Implement tenant-scoped customer accounts and membership records.",
        "Enforce RBAC/ABAC for reviewer, risk, compliance, and paper operator roles.":
          "Enforce RBAC/ABAC for reviewer, risk, compliance, and paper operator roles.",
        "Define and version compliance approval policies.":
          "Define and version compliance approval policies.",
        "Implement WORM or centralized immutable audit storage.":
          "Implement WORM or centralized immutable audit storage.",
        "Implement signed approval records and tamper-evident export.":
          "Implement signed approval records and tamper-evident export.",
        "Complete legal/regulatory review before presenting any approval as formal compliance approval.":
          "Complete legal/regulatory review before presenting any approval as formal compliance approval.",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        database_written: "database_written",
        external_db_written: "external_db_written",
        production_compliance_approval: "production_compliance_approval",
        live_approval_granted: "live_approval_granted",
        paper_execution_approval_granted: "paper_execution_approval_granted",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only compliance approval readiness metadata only.":
          "This endpoint is read-only compliance approval readiness metadata only.",
        "The local paper approval workflow is not formal compliance approval, not legal approval, and not live trading approval.":
          "The local paper approval workflow is not formal compliance approval, not legal approval, and not live trading approval.",
        "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.":
          "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform remains NOT READY.",
      },
    },
    paperRecords: {
      eyebrow: "Paper OMS / Audit",
      title: "Persisted paper workflow records",
      description:
        "Read-only local SQLite audit view for paper workflow runs, OMS events, and audit events. This view does not create records, submit simulations, connect brokers, or grant live-trading approval.",
      fallbackPrefix: "Backend paper record query unavailable. Rendering safe empty state:",
      runsKicker: "Paper Runs",
      runsTitle: "Latest persisted workflows",
      selectedKicker: "Selected Run",
      selectedTitle: "Audit context",
      empty: "No local paper workflow records are available yet.",
      noSelectedRun: "No workflow run is selected.",
      workflowRunId: "Workflow run",
      approvalId: "Approval ID",
      approvalDecision: "Approval decision",
      orderId: "Order ID",
      finalStatus: "Final OMS status",
      sourceSignal: "Source signal",
      strategy: "Strategy",
      paperOnly: "Paper only",
      brokerApiCalled: "Broker API called",
      none: "None",
      readOnlyNote:
        "Read-only audit surface. It does not write databases, alter persisted records, call brokers, create orders, escalate approvals, or provide trading advice.",
      selectRun: "Select run",
      copyWorkflow: "Copy workflow ID",
      copyOrder: "Copy order ID",
      copied: "copied",
      copyFailed: "Copy failed. Copy the ID manually.",
      refreshTimelines: "Refresh timeline",
      timelineLoading: "Loading timeline",
      timelineReady: "Timeline ready",
      timelineError: "Unable to load paper timeline.",
    },
    paperEvidence: {
      eyebrow: "Demo Evidence",
      title: "Paper demo evidence viewer",
      description:
        "Read-only local JSON viewer for evidence exported by make paper-demo-evidence-export. Files are parsed in this browser only and are not uploaded, persisted, or sent to backend APIs.",
      currentSource: "Current source",
      noSource: "No local evidence loaded",
      selectFile: "Select evidence .json",
      initialMessage:
        "Select an explicit local paper demo evidence JSON to inspect it in this browser.",
      rejectExtension: "Rejected: selected evidence file must be .json.",
      rejectSize: "Rejected: evidence JSON is larger than 500 KB.",
      rejectPrefix: "Rejected",
      invalidJson: "Rejected: invalid JSON evidence.",
      loadedPrefix: "Local evidence",
      loadedMessage:
        "Loaded locally. The evidence file was not uploaded, persisted, or sent to backend APIs.",
      clearLocalJson: "Clear evidence",
      clearMessage: "Local evidence cleared. No backend mutation occurred.",
      empty:
        "No local demo evidence is loaded. Export one with make paper-demo-evidence-export and select the JSON file explicitly.",
      identityKicker: "Evidence Identity",
      identityTitle: "Paper workflow evidence",
      decisionsKicker: "Reviewer Decisions",
      decisionsTitle: "Approval decision trail",
      safetyKicker: "Safety Flags",
      safetyTitle: "Paper-only evidence checks",
      warningsKicker: "Warnings",
      warningsTitle: "Evidence review notes",
      readOnlyNote:
        "Read-only evidence surface. It does not upload files, write databases, call brokers, collect credentials, create orders, grant live approval, or provide investment advice.",
      fields: {
        approvalRequestId: "Approval request",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        finalStatus: "Final OMS status",
        omsEventCount: "OMS event count",
        auditEventCount: "Audit event count",
        localSqlitePath: "Local SQLite path",
        generatedAt: "Generated at",
        reviewer: "Reviewer",
        reviewerRole: "Reviewer role",
        decidedAt: "Decided at",
        decisionHash: "Decision hash",
      },
      safetyLabels: {
        paper_only: "Paper only",
        live_trading_enabled: "Live disabled flag",
        broker_api_called: "Broker API called",
        paper_broker_gateway_called: "Paper broker gateway called",
        local_sqlite_only: "Local SQLite only",
        external_db_written: "External DB written",
        broker_credentials_collected: "Broker credentials collected",
        real_order_created: "Real order created",
        approval_for_live: "Live approval",
        investment_advice: "Investment advice",
      },
    },
    paperOmsTimeline: {
      kicker: "OMS Timeline",
      title: "Paper order lifecycle",
      empty: "No OMS events are available for the selected paper workflow.",
      orderId: "Order ID",
      timestamp: "Timestamp",
      reason: "Reason",
    },
    paperAuditTimeline: {
      kicker: "Audit Timeline",
      title: "Paper workflow audit events",
      empty: "No audit events are available for the selected paper workflow.",
      actor: "Actor",
      resource: "Resource",
      timestamp: "Timestamp",
      paperOnly: "Paper only",
    },
    release: {
      eyebrow: "Release Baseline",
      title: "v0.1.0 paper research preview",
      fallbackPrefix:
        "Backend release baseline unavailable. Rendering checked-in safe fallback:",
      currentTag: "Current tag",
      description:
        "This baseline is an external presentation, internal demo, and paper research preview. It is not a production trading release.",
      releaseLevel: "Release Level",
      safetyDefaults: "Safety Defaults",
      validation: "Validation",
      knownGaps: "Known Non-Production Gaps",
      levelLabels: {
        marketing_website: "Marketing Website",
        web_command_center: "Web Command Center",
        paper_research_preview: "Paper Research Preview",
        production_trading_platform: "Production Trading Platform",
      },
      statusLabels: {
        "external presentation candidate": "external presentation candidate",
        "internal demo candidate": "internal demo candidate",
        "internal technical preview": "internal technical preview",
        "NOT READY": "NOT READY",
      },
      validationLabels: {
        release_readiness_check: "release-readiness-check",
        make_check: "make check",
        github_actions_release_gate: "GitHub Actions release gate",
      },
      validationStatusLabels: {
        passed: "passed",
      },
      gapLabels: {
        "No production trading path exists.": "No production trading path exists.",
        "No real broker adapter exists.": "No real broker adapter exists.",
        "No live execution path exists.": "No live execution path exists.",
        "Data platform is based on local fixtures, dry-run validation, and schema scaffolding.":
          "Data platform is based on local fixtures, dry-run validation, and schema scaffolding.",
        "Backtest outputs are simulated research artifacts, not performance reports.":
          "Backtest outputs are simulated research artifacts, not performance reports.",
        "Web Command Center is read-only for research review packet inspection.":
          "Web Command Center is read-only for research review packet inspection.",
      },
    },
    packetLoader: {
      localJsonKicker: "Local JSON",
      title: "Research packet source",
      currentSource: "Current source",
      backendSample: "Backend sample",
      fallbackSample: "Fallback sample",
      selectFile: "Select local .json",
      initialMessage: "Select an explicit local .json packet to inspect it in this browser.",
      rejectExtension: "Rejected: selected file must be a .json packet.",
      rejectSize: "Rejected: packet metadata JSON is larger than 500 KB.",
      rejectPrefix: "Rejected",
      loadedPrefix: "Local JSON",
      loadedMessage:
        "Loaded locally. The file was not uploaded, persisted, or sent to backend APIs.",
      invalidJson: "Rejected: invalid JSON packet.",
      bundledSample: "Bundled safe sample",
      loadBundledSample: "Load safe sample",
      bundledMessage:
        "Loaded bundled safe sample. No upload, database write, broker call, or backend mutation occurred.",
      clearLocalJson: "Clear local JSON",
      clearMessage:
        "Local JSON selection cleared. Rendering backend sample or checked-in fallback again.",
    },
    packet: {
      eyebrow: "Research Review Packet",
      title: "Read-only reviewer handoff",
      fallbackPrefix:
        "Backend sample packet unavailable. Rendering paper-safe fallback:",
      identityKicker: "Packet Identity",
      packetId: "Packet ID",
      reviewQueue: "Review queue",
      decisionIndex: "Decision index",
      bundles: "Bundles",
      sectionsKicker: "Sections",
      sectionsTitle: "Included metadata",
      checksumsKicker: "Checksums",
      checksumsTitle: "Audit references",
      checksumQueue: "Queue",
      checksumDecisionIndex: "Decision index",
      checksumPacket: "Packet",
      checksumReproducibility: "Reproducibility",
      warningsKicker: "Warnings",
      warningsTitle: "Review notes",
      warningLabels: {
        "Fallback packet is read-only UI metadata. It does not approve paper execution or live trading, rank strategies, call brokers, or claim performance.":
          "Fallback packet is read-only UI metadata. It does not approve paper execution or live trading, rank strategies, call brokers, or claim performance.",
      },
    },
    decisionSummary: {
      kicker: "Review Status",
      title: "Decision summary",
      total: "Total decisions",
      rejected: "Rejected",
      needsDataReview: "Needs data review",
      paperResearchOnly: "Paper research only",
    },
    safetyFlags: {
      kicker: "Guardrails",
      title: "Read-only safety flags",
      labels: {
        research_only: "Research only",
        execution_eligible: "Execution eligible",
        order_created: "Order created",
        broker_api_called: "Broker API called",
        risk_engine_called: "Risk Engine called",
        oms_called: "OMS called",
        performance_claim: "Performance claim",
        simulated_metrics_only: "Simulated metrics only",
        external_data_downloaded: "External data downloaded",
        ranking_generated: "Ranking generated",
        best_strategy_selected: "Best strategy selected",
        approval_for_live: "Live disabled check",
        approval_for_paper_execution: "Paper execution approval",
        persisted: "Persisted",
      },
    },
    roadmap: {
      eyebrow: "Phase Roadmap",
      title: "Phase 0-6 implementation status",
      phasePrefix: "Phase",
      statusPrefix: "Status",
      names: {
        0: "Compliance Boundary",
        1: "Infrastructure Foundation",
        2: "Data Platform",
        3: "Strategy SDK and Backtest",
        4: "Risk / OMS / Broker Gateway",
        5: "Command Center and Shadow Trading",
        6: "Reliability and Go-Live Readiness",
      },
      statuses: {
        planned: "planned",
      },
    },
    contracts: {
      ariaLabel: "Contracts and paper simulation",
      eyebrow: "Contracts",
      title: "TX / MTX / TMF point values",
      headers: {
        symbol: "Symbol",
        pointValue: "Point Value",
        txEquivalent: "TX Equivalent",
        description: "Description",
      },
      descriptions: {
        TX: "Taiwan Index Futures",
        MTX: "Mini Taiwan Index Futures",
        TMF: "Micro Taiwan Index Futures",
      },
    },
    paperPanel: {
      eyebrow: "Paper Only",
      title: "Order simulation placeholder",
      text:
        "Paper order APIs route through Risk Engine, OMS, and Paper Broker Gateway. This UI does not place orders or expose live trading controls.",
    },
    modules: {
      eyebrow: "Architecture Modules",
      title: "Signal-to-execution boundaries",
      cards: [
        [
          "Data Platform",
          "Bronze/Silver/Gold layers, contract master, market bars, rollover events.",
        ],
        [
          "Strategy SDK",
          "Signal-only strategy interface. No broker SDK access and no order submission.",
        ],
        [
          "Risk Engine",
          "Paper risk checks for live-disabled state and TX-equivalent exposure limits.",
        ],
        ["OMS", "Event-style order state machine that owns lifecycle transitions."],
        [
          "Broker Gateway",
          "Paper broker acknowledgement boundary. No real orders are placed.",
        ],
        [
          "Web Command Center",
          "Operator view for roadmap, safety mode, contracts, and paper-only status.",
        ],
      ],
    },
  },
  zh: {
    htmlLang: "zh-Hant",
    languageToggleLabel: "語言",
    languageOptions: {
      en: "English",
      zh: "繁中",
    },
    hero: {
      eyebrow: "Web 指揮中心",
      title: "台指期量化交易平台",
      lead:
        "Phase 0-6 雲原生路線圖的紙上優先控制介面。策略訊號、風險檢查、OMS 狀態與券商閘道邊界維持解耦。",
      safetyAria: "執行安全狀態",
      tradingModePrefix: "TRADING_MODE",
      liveDisabled: "實盤關閉",
      brokerPrefix: "券商模式",
    },
    summary: {
      ariaLabel: "系統摘要",
      backendHealth: {
        kicker: "後端健康狀態",
        connected: "已連線",
        fallback: "安全備援模式",
      },
      safetyMode: {
        kicker: "安全模式",
        paperOnly: "僅限紙上交易",
        reviewRequired: "需要審查",
      },
      riskDefaults: {
        kicker: "風控預設",
        title: "TX 等值曝險上限",
        text: "在任何未來 OMS 工作流之前，先清楚呈現每日虧損上限與 stale quote 限制。",
      },
    },
    productValueAlignment: {
      eyebrow: "產品定位",
      title: "台指期資料分析與 Paper Trading 研究平台",
      description:
        "這個 Web App 把官網主張轉成可操作研究流程：使用者可以檢視 TX / MTX / TMF 模擬資料、驗證策略假設、模擬 Paper Only 訂單、查看 OMS 事件，並複製 evidence；全程不連券商、不使用真實資金。",
      featureLabel: "功能",
      benefitLabel: "使用者利益",
      cards: [
        {
          kicker: "Market Data Lab",
          title: "先理解 TX / MTX / TMF 資料，再討論交易決策",
          feature:
            "Deterministic quote snapshot、bid / ask / last、quote age、spread 與合約曝險脈絡。",
          benefit:
            "使用者可以理解市場資料如何進入平台，並在測試策略前比較合約規格與曝險大小。",
        },
        {
          kicker: "Strategy Research",
          title: "驗證 signal 邏輯，但不建立訂單",
          feature:
            "Mock strategy 只輸出標準化 StrategySignal，且 signals_only=true。",
          benefit:
            "使用者可以把研究判斷與執行流程分開，先看策略想表達什麼，再進入紙上模擬。",
        },
        {
          kicker: "Paper Trading Simulator",
          title: "在無券商風險下體驗訂單流程",
          feature:
            "PaperOrderIntent、paper risk checks、模擬 OMS lifecycle 與 browser-local paper fill outcomes。",
          benefit:
            "使用者可以練習端到端流程，理解模擬訂單為何通過、拒絕、部分成交或成交。",
        },
        {
          kicker: "Portfolio Review",
          title: "查看模擬持倉與 PnL 影響",
          feature:
            "Paper-only position、average price、unrealized PnL、paper equity 與可重置 session state。",
          benefit:
            "使用者可以把每個模擬動作連到部位變化，同時清楚知道這只是 demo 指標，不是績效主張。",
        },
        {
          kicker: "Evidence Center",
          title: "讓 Demo 結果可回顧與回報",
          feature:
            "複製 demo summary、evidence JSON、session id、deterministic seed 與 localStorage key。",
          benefit:
            "使用者與 reviewer 可以重現 browser-local 情境、回傳問題，並稽核 demo 當下呈現的內容。",
        },
      ],
      flowAriaLabel: "互動 demo 價值流程",
      flowKicker: "研究流程",
      flowTitle: "從資料分析到紙上決策檢視",
      flowSteps: [
        "市場資料預覽",
        "StrategySignal 產生",
        "Paper Only 訂單模擬",
        "OMS 時間線檢視",
        "模擬持倉 / PnL 檢視",
        "Evidence JSON 交付",
      ],
      safetyKicker: "安全邊界",
      safetyTitle: "本平台刻意不做的事",
      safetyItems: [
        "不連真實券商",
        "不送真實委託",
        "不收集憑證",
        "不構成投資建議",
        "不做績效主張",
        "Production Trading Platform 仍為 NOT READY",
      ],
    },
    workflowStandardization: {
      eyebrow: "流程標準化",
      title: "Demo 如何對應量化交易標準作業流程",
      description:
        "這個導覽層把 browser demo 連到 docs/quant-workflow-standardization.md 的方法論，說明資料、策略、回測、換月、Paper Trading、Risk Engine、OMS 與 audit evidence 在正式交易路徑出現前如何串接。",
      demoActionLabel: "Demo 操作",
      standardLabel: "標準化控制",
      steps: [
        {
          kicker: "資料",
          title: "Data standardization",
          description:
            "TX / MTX / TMF quote snapshot 先使用共同曝險語言，再進入策略邏輯。",
          demoAction: "Generate market tick",
          standard:
            "市場資料應包含 symbol、bid、ask、last、quote age、session context 與 TX-equivalent exposure 意義。",
        },
        {
          kicker: "訊號",
          title: "StrategySignal standardization",
          description:
            "策略只輸出 signal；所有類訂單流程都由平台負責。",
          demoAction: "Run mock strategy",
          standard:
            "StrategySignal 維持 signals_only=true，不直接呼叫券商、Risk Engine、OMS 或 Broker Gateway。",
        },
        {
          kicker: "回測",
          title: "Backtest reproducibility",
          description:
            "研究輸出應綁定資料版本、程式版本、參數、成本與 review notes。",
          demoAction: "檢視 session id、seed 與 evidence JSON",
          standard:
            "Backtest 與 demo artifact 只能作為可重現 metadata，不得被呈現為績效主張。",
        },
        {
          kicker: "換月",
          title: "Rollover data separation",
          description:
            "研究可使用 adjusted continuous data，但紙上與未來執行 mapping 必須參照真實合約。",
          demoAction: "查看 TX / MTX / TMF 契約脈絡",
          standard:
            "Rollover metadata 必須分離 research-only continuous futures 與可執行合約代碼及價格。",
        },
        {
          kicker: "紙上意圖",
          title: "PaperOrderIntent flow",
          description:
            "只有平台能把 StrategySignal 轉成 Paper Only order intent。",
          demoAction: "Simulate Paper Only order",
          standard:
            "PaperOrderIntent 由平台擁有，不核准實盤、不收集憑證，也不建立真實委託。",
        },
        {
          kicker: "風控",
          title: "Risk Engine checks",
          description:
            "紙上風控檢查會解釋模擬流程為何可以繼續或必須拒絕。",
          demoAction: "查看 risk approval result",
          standard:
            "Risk checks 涵蓋 paper mode、實盤關閉、stale quote、exposure、size、duplicate key 與 safety flags。",
        },
        {
          kicker: "OMS",
          title: "OMS lifecycle",
          description:
            "模擬 OMS timeline 讓 lifecycle transitions 可見，而不是藏在策略程式碼中。",
          demoAction: "Review OMS timeline",
          standard:
            "OMS 負責 order state、idempotency、terminal status 與未來 reconciliation 邊界。",
        },
        {
          kicker: "稽核",
          title: "Audit evidence",
          description:
            "Reviewer handoff 需要小型 evidence artifact，說明發生了什麼，以及哪些仍是模擬。",
          demoAction: "複製 demo summary 或 evidence JSON",
          standard:
            "Audit evidence 必須保留 safety flags；除非未來有受審查資料層，否則維持本地 / browser-only。",
        },
      ],
      safetyKicker: "安全邊界",
      safetyTitle: "僅作為學習導覽，不是執行路徑",
      safetyDescription:
        "此面板是只讀產品教育內容；不讀取後端、不上傳 evidence、不寫資料庫、不呼叫券商、不建立訂單、不收集憑證，也不構成投資建議。",
      safetyItems: [
        "Paper Only",
        "Browser-only / mock demo where applicable",
        "不連券商",
        "不建立真實委託",
        "不收集憑證",
        "不構成投資建議",
        "Production Trading Platform: NOT READY",
      ],
    },
    demoGuide: {
      ariaLabel: "客戶 demo 導覽流程",
      eyebrow: "Demo Tour",
      title: "客戶測試導覽流程",
      description:
        "只讀導覽用於理解版本層級、安全預設、紙上 OMS 紀錄、研究 Packet 與契約規格。此導覽只改變前端本地 UI 狀態。",
      readOnlyBadge: "只讀導覽",
      stepListLabel: "Demo tour 步驟",
      activeStepLabel: "步驟",
      suggestedTabLabel: "建議分頁",
      expectedLabel: "應確認內容",
      safetyLabel: "安全邊界",
      previous: "上一步",
      next: "下一步",
      reset: "重設導覽",
      copyChecklist: "複製 checklist",
      copied: "Checklist 已複製。",
      copyFailed: "複製失敗，請手動複製 checklist。",
      checklistIntro: "客戶測試導覽流程 checklist",
      prohibitedKicker: "禁止操作",
      prohibitedTitle: "此版本不是正式交易產品",
      prohibitedItems: [
        "不支援實盤交易",
        "不支援券商登入",
        "不支援真實委託",
        "不支援憑證上傳",
        "不支援客戶帳戶開通",
        "不提供交易建議",
      ],
      steps: [
        {
          title: "確認版本層級",
          tab: "版本",
          body: "先查看 release baseline，確認客戶理解目前版本定位，再進入功能展示。",
          expected:
            "Marketing Website 是對外展示候選，Web Command Center 是內部 demo 候選，Paper Research Preview 是內部技術預覽，Production Trading Platform = NOT READY。",
          safety: "此步驟確認平台僅供評估，不會被定位為正式交易上線版本。",
        },
        {
          title: "確認安全預設",
          tab: "版本",
          body: "檢查畫面上的執行預設，確認整體介面仍維持 paper mode。",
          expected:
            "畫面可見 TRADING_MODE=paper、ENABLE_LIVE_TRADING=false、BROKER_PROVIDER=paper。",
          safety: "導覽不會變更環境變數、runtime 設定或交易模式。",
        },
        {
          title: "查看紙上 OMS 流程",
          tab: "紙上 OMS",
          body: "說明從 signal 到 risk、OMS、paper gateway 與 audit events 的受控紙上路徑。",
          expected:
            "StrategySignal -> 平台 PaperOrderIntent -> Risk Engine -> OMS -> Paper Broker Gateway -> Audit Event。",
          safety: "此 UI 只說明流程，不送出模擬、不建立訂單，也不呼叫券商。",
        },
        {
          title: "檢視紙上稽核紀錄",
          tab: "紙上 OMS",
          body: "選取 paper workflow row，檢視 OMS timeline 與 audit timeline，必要時複製 ID 作為 review notes。",
          expected:
            "可看到選取 workflow、order ID、最終 OMS 狀態、OMS events 與 audit events。",
          safety: "選取、重新整理時間線與複製 ID 都不寫資料庫，也不修改持久化紀錄。",
        },
        {
          title: "載入研究 Packet 範例",
          tab: "研究 Packet",
          body: "載入內建安全範例，或在瀏覽器內檢視使用者明確選取的本地 JSON packet。",
          expected:
            "安全旗標維持 research_only=true、execution_eligible=false，且 performance_claim=false。",
          safety:
            "本地 packet 檢視不會上傳檔案、不寫資料庫、不呼叫 Risk Engine、不呼叫 OMS，也不呼叫券商。",
        },
        {
          title: "查看契約規格",
          tab: "契約規格",
          body: "查看 TX、MTX、TMF 點值與 TX-equivalent sizing 關係。",
          expected: "TX、MTX、TMF 契約規格可支援風險等值 sizing 討論。",
          safety: "契約規格僅供資訊檢視，不建立訊號、訂單、建議或帳戶操作。",
        },
        {
          title: "確認禁止操作",
          tab: "版本",
          body: "結尾再次確認客戶在此版本評估期間不得嘗試的項目。",
          expected: "客戶理解此版本不提供實盤交易、券商登入、真實委託、憑證上傳或客戶開通。",
          safety: "整個 demo 從開始到結束都維持只讀與 paper-first。",
        },
      ],
    },
    interactions: {
      ariaLabel: "安全只讀互動層",
      eyebrow: "互動層",
      title: "只讀 Command Center 工具",
      description:
        "系統預設先開啟 Paper OMS 分頁，讓客戶立即進入 Browser-only Mock Demo stepper。仍可安全重新整理狀態、切換區段、檢視本地樣本、選取紙上稽核紀錄與複製 ID；這些控制項不送出真實委託、不寫 production database，也不連接券商。",
      readOnlyBadge: "只讀",
      refresh: "重新整理狀態",
      tabsLabel: "Command Center 區段",
      tabs: {
        release: "版本",
        paper: "紙上 OMS",
        packet: "研究 Packet",
        contracts: "契約規格",
      },
      troubleshootingKicker: "後端無法連線",
      troubleshootingTitle: "安全備援已啟用",
      troubleshootingText:
        "即使後端無法連線，production 前端仍會顯示已檢查的紙上安全資料。本地 demo 可啟動後端，或使用下方指令建立一筆本地紙上稽核樣本。",
      demoSeedKicker: "本地 demo seed",
      copyCommand: "複製指令",
      copied: "已複製到剪貼簿。",
      copyFailed: "複製失敗，請手動複製指令。",
    },
    localBackendMode: {
      eyebrow: "部署邊界",
      title: "本地後端 Demo 模式",
      description:
        "Production Vercel 前端無法直接讀取你的本機 SQLite 紙上稽核資料庫。它可以顯示只讀 UI、已檢查的備援資料，以及使用者明確選取的本地 JSON evidence。若要檢視實際 paper records，必須在本機啟動 backend 與 frontend，並使用同一個本地 SQLite 檔案。",
      modes: [
        {
          kicker: "Production Vercel",
          title: "只讀展示介面",
          text:
            "可顯示安全文案、版本狀態、備援資料與本地 JSON viewer；不讀取本機 SQLite、不寫資料庫、不呼叫券商，也不建立訂單。",
        },
        {
          kicker: "本地 Demo",
          title: "需要 backend + local SQLite",
          text:
            "在本機啟動 FastAPI backend 與 Next.js frontend，並 seed 一筆 paper demo record。Web Command Center 即可透過本地 backend 查詢實際 paper OMS 與 audit records。",
        },
        {
          kicker: "未來 Cloud",
          title: "受控 hosted API 與資料層",
          text:
            "未來部署可導入受控 backend/API 與治理資料層；這與本地 SQLite 分離，且仍必須維持 paper/live 邊界。",
        },
      ],
      commandsKicker: "本地設定",
      commandsTitle: "檢視實際 paper records 的指令",
      commandsText:
        "Reviewer 需要在 Command Center 檢視已持久化紙上紀錄時，請優先在本機執行一鍵 launcher；也保留手動 fallback。這些指令不會啟用實盤，也不會連接券商。",
      copyCommands: "複製本地 demo 指令",
      copied: "已複製本地 demo 指令。",
      copyFailed: "複製失敗，請手動複製指令。",
      safetyLabel: "本地後端 demo 安全旗標",
    },
    localDemoSetup: {
      eyebrow: "自助 Demo",
      title: "啟動本地 Paper Only Demo",
      description:
        "降低客戶測試門檻的本地 launcher。它會檢查安全預設、使用本地 SQLite、可 seed 一筆紙上流程紀錄，並啟動本地 backend/frontend；不建立 hosted account，也不連接券商。",
      steps: [
        {
          kicker: "步驟 1",
          title: "檢查前置條件",
          text:
            "先執行環境檢查。它會確認 backend Python、frontend dependencies、本地 port 與 paper-only defaults，然後才允許啟動服務。",
        },
        {
          kicker: "步驟 2",
          title: "啟動本地 Demo",
          text:
            "用一個指令在本機啟動 FastAPI 與 Next.js。launcher 會列出 Web Command Center URL、backend health URL、SQLite 路徑與 log 檔。",
        },
        {
          kicker: "步驟 3",
          title: "檢視 paper records",
          text:
            "使用本地 Web Command Center 檢視已 seed 的紙上審批、OMS、audit、risk 與 evidence 介面。Production Vercel 仍只是只讀展示介面。",
        },
      ],
      commandKicker: "建議指令",
      commandTitle: "客戶可跟著執行的本地 demo 路徑",
      commandText:
        "Reviewer 需要檢視實際本地 paper records，但不想先閱讀完整工程 runbook 時，請使用這組指令。",
      copyCommands: "複製客戶 demo 指令",
      copied: "已複製客戶 demo 指令。",
      copyFailed: "複製失敗，請手動複製指令。",
      windowsKicker: "Windows helper",
      windowsTitle: "PowerShell wrapper",
      windowsText:
        "Windows reviewer 可在 repo root 使用 PowerShell wrapper。它會委派到同一個 paper-only Bash launcher，且不收集憑證。",
      safetyLabel: "客戶自助 demo 安全旗標",
    },
    deploymentDataBoundary: {
      eyebrow: "資料存取邊界",
      title: "實際 paper records 可讀取的位置",
      description:
        "Production Vercel、本地後端 demo 模式與未來 hosted API 具有不同資料存取邊界。此區塊讓 reviewer 在檢視 OMS 或 audit records 前，先確認正確操作路徑。",
      canShowLabel: "可顯示",
      requiresLabel: "需要",
      cannotDoLabel: "不可執行",
      modes: [
        {
          kicker: "Production Vercel",
          title: "只讀 UI 與 fallback",
          canShow:
            "版本狀態、安全預設、已檢查的 fallback 資料，以及使用者在瀏覽器明確選取的本地 JSON evidence。",
          requires:
            "Fallback UI 不需要 backend；檢視本地 evidence 時，需要使用者自行選擇本地 JSON 檔。",
          cannotDo:
            "不可直接讀取本機 SQLite、不可呼叫本地 FastAPI、不可寫資料庫、不可建立訂單、不可收集憑證，也不可呼叫券商。",
        },
        {
          kicker: "本地 Backend",
          title: "實際本地 paper records",
          canShow:
            "儲存在本地 SQLite 的 paper approval requests、paper workflow runs、OMS timelines、audit timelines、risk state 與 audit integrity records。",
          requires:
            "使用同一個 PAPER_EXECUTION_AUDIT_DB_PATH 在本機啟動 FastAPI 與 Next.js，然後 seed 或建立 Paper Only records。",
          cannotDo:
            "不可視為 production OMS、production audit、真實券商連線或 live readiness。",
        },
        {
          kicker: "未來 Hosted API",
          title: "受治理的雲端資料路徑",
          canShow:
            "未來可在架構審查後，透過具身份驗證的 backend/API 與受控資料層顯示 paper records。",
          requires:
            "需要另行實作 authentication、RBAC/ABAC、retention、audit integrity、monitoring 與 data governance。",
          cannotDo:
            "不可繞過 paper/live 分離、不可讓策略接觸券商憑證，也不可宣稱已達正式交易上線標準。",
        },
      ],
      operatorKicker: "Reviewer 規則",
      operatorTitle: "實際 SQLite records 必須使用本地 backend",
      operatorText:
        "若客戶需要看到已 seed 的真實 paper OMS 或 audit records，請使用本地後端 demo 模式。除非未來部署受控 backend/API，Production Vercel 應視為只讀展示介面。",
      safetyLabel: "部署資料邊界安全旗標",
    },
    hostedWebCommandCenter: {
      eyebrow: "Hosted Web Command Center",
      title: "具環境感知的 hosted backend 連線",
      description:
        "Production Vercel 可透過公開 API base URL 設定，讀取未來 hosted paper backend。目前只顯示 mock login、tenant、role 與 permission context；不啟用真實登入、hosted mutations、券商連線或實盤交易。",
      fallbackPrefix: "Hosted Web Command Center readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      connectionStateLabel: "連線狀態",
      connectionStates: {
        hosted: "已設定 hosted backend URL",
        localOrFallback: "本地或 fallback API 路徑",
      },
      apiBaseLabel: "具環境感知的 API base URL",
      publicEnvLabel: "公開前端環境變數",
      identityLabel: "登入狀態與角色顯示",
      tenantLabel: "Tenant context 顯示",
      grantedPermissionsLabel: "已授予只讀權限",
      deniedMutationsLabel: "拒絕的 mutation 權限",
      endpointsLabel: "Hosted read endpoints",
      safetyFlagsLabel: "安全旗標",
      requiredBeforeUseLabel: "Hosted customer use 前必要條件",
      warningLabel: "邊界警示",
      notConfigured: "未設定",
      fields: {
        apiBaseUrl: "解析後 API base URL",
        apiBaseSource: "Base URL 來源",
        apiMode: "Command Center API mode",
        hostedConfigured: "已設定 hosted backend",
        usesLocalDefault: "使用本地預設",
        authenticated: "已登入",
        authenticationProvider: "身份提供者",
        authenticationMode: "身份模式",
        roles: "角色",
        sessionAvailable: "Session endpoint 可用",
        tenantId: "Tenant ID",
        tenantMode: "Tenant mode",
        tenantIsolation: "需要 tenant isolation",
        hostedDatastore: "Hosted datastore 已啟用",
        tenantAvailable: "Tenant endpoint 可用",
      },
      sourceLabels: {
        hosted_backend_public_env: "NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL",
        backend_public_env: "NEXT_PUBLIC_BACKEND_URL",
        local_default: "本地預設 http://localhost:8000",
      },
      permissionLabels: {
        read_hosted_readiness: "讀取 hosted readiness",
        read_mock_session: "讀取 mock session",
        read_current_tenant: "讀取 current tenant",
        create_paper_approval_request: "建立 paper approval request",
        record_paper_reviewer_decision: "記錄 paper reviewer decision",
        submit_approved_paper_workflow: "提交已核准 paper workflow",
        enable_live_trading: "啟用實盤交易",
        upload_broker_credentials: "上傳 broker credentials",
      },
      endpointPurposeLabels: {
        "Backend health and paper-safe runtime status.":
          "Backend health 與 paper-safe runtime status。",
        "Hosted backend dev/staging/production environment boundary.":
          "Hosted backend dev / staging / production 環境邊界。",
        "Hosted backend readiness and missing SaaS capabilities.":
          "Hosted backend readiness 與缺少的 SaaS 能力。",
        "Hosted paper API readiness boundary.": "Hosted paper API readiness 邊界。",
        "Mock session contract for login status, role, and permission display.":
          "用於顯示登入狀態、角色與權限的 mock session contract。",
        "Mock tenant context for tenant boundary display.":
          "用於 tenant boundary 顯示的 mock tenant context。",
        "Web Command Center hosted backend connectivity contract.":
          "Web Command Center hosted backend 連線契約。",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only_contract: "read_only_contract",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        auth_provider_enabled: "auth_provider_enabled",
        session_cookie_issued: "session_cookie_issued",
        customer_account_created: "customer_account_created",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        live_approval_granted: "live_approval_granted",
        production_trading_ready: "production_trading_ready",
      },
      requiredBeforeUseLabels: {
        "Deploy a reviewed hosted backend runtime for paper-only staging.":
          "部署已 review 的 paper-only staging hosted backend runtime。",
        "Configure NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL for the frontend deployment.":
          "為 frontend deployment 設定 NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL。",
        "Keep public API base URL values non-secret and HTTPS-only for hosted environments.":
          "公開 API base URL 不得包含秘密，hosted environments 應使用 HTTPS。",
        "Add real login, logout, session validation, and reviewer/customer identity.":
          "加入真實 login、logout、session validation 與 reviewer/customer identity。",
        "Enforce tenant isolation on every hosted request and hosted record.":
          "每個 hosted request 與 hosted record 都必須強制 tenant isolation。",
        "Enforce RBAC/ABAC before any hosted mutation or paper workflow submit.":
          "任何 hosted mutation 或 paper workflow submit 前必須強制 RBAC/ABAC。",
        "Connect a managed datastore only after migration, backup, retention, and restore review.":
          "必須完成 migration、backup、retention 與 restore review 後，才能連接 managed datastore。",
        "Complete security and operations review before customer-hosted paper use.":
          "Customer-hosted paper use 前必須完成 security 與 operations review。",
      },
      warningLabels: {
        "This endpoint is read-only hosted Web Command Center metadata only.":
          "此 endpoint 僅為 hosted Web Command Center 只讀 metadata。",
        "A public API base URL is configuration, not authentication.":
          "公開 API base URL 只是設定，不是身份驗證。",
        "No real login, session cookie, customer account, or tenant record is created.":
          "不建立真實 login、session cookie、customer account 或 tenant record。",
        "No hosted datastore is written and no broker API is called.":
          "不寫入 hosted datastore，也不呼叫 broker API。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperSecurityOperations: {
      eyebrow: "Security / Operations",
      title: "Hosted Paper security operations 就緒狀態",
      description:
        "針對未來 hosted paper SaaS 的只讀 security 與 operations 邊界。此區塊文件化 secrets management、rate limiting、audit monitoring、observability、CI/CD gates、staging smoke tests、load / abuse tests 與 auth boundary tests，但不啟用這些系統。",
      fallbackPrefix:
        "Hosted paper security operations readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      stateLabel: "就緒狀態",
      capabilitiesLabel: "Operations 能力",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      controlLabel: "控制項",
      currentStatusLabel: "目前狀態",
      enabledLabel: "已啟用",
      requiredBeforeHostedUseLabel: "Hosted customer use 前必要",
      requiredNextSlicesLabel: "下一步必要切片",
      warningLabel: "邊界警示",
      capabilityLabels: {
        secrets_management_enabled: "Secrets management 已啟用",
        vault_or_managed_secret_store_enabled: "Vault 或 managed secret store 已啟用",
        static_secret_scan_gate_enabled: "Static secret scan gate 已啟用",
        rate_limiting_enabled: "Rate limiting 已啟用",
        audit_monitoring_enabled: "Audit monitoring 已啟用",
        observability_pipeline_enabled: "Observability pipeline 已啟用",
        ci_release_readiness_gate_enabled: "CI release readiness gate 已啟用",
        production_smoke_gate_enabled: "Production smoke gate 已啟用",
        staging_smoke_gate_enabled: "Staging smoke gate 已啟用",
        load_test_gate_enabled: "Load test gate 已啟用",
        abuse_test_gate_enabled: "Abuse test gate 已啟用",
        auth_boundary_test_gate_enabled: "Auth boundary test gate 已啟用",
        incident_runbook_enabled: "Incident runbook 已啟用",
        production_operations_ready: "Production operations ready",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        secrets_stored: "secrets_stored",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        auth_provider_enabled: "auth_provider_enabled",
        customer_account_created: "customer_account_created",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        load_test_executed: "load_test_executed",
        abuse_test_executed: "abuse_test_executed",
        production_security_approval: "production_security_approval",
        production_trading_ready: "production_trading_ready",
      },
      controlLabels: {
        secrets_management: "Secrets management",
        rate_limiting: "Rate limiting",
        audit_monitoring: "Audit monitoring",
        observability: "Observability",
        ci_cd_deployment_gates: "CI/CD deployment gates",
        staging_smoke_test: "Staging smoke test",
        basic_load_abuse_testing: "Basic load / abuse testing",
        auth_boundary_testing: "Auth boundary testing",
      },
      purposeLabels: {
        "Store hosted credentials and signing material outside source code.":
          "將 hosted credentials 與 signing material 存放於 source code 外。",
        "Protect hosted paper endpoints from accidental or abusive traffic.":
          "保護 hosted paper endpoints，避免非預期或濫用流量。",
        "Alert on suspicious approval, OMS, audit, and integrity events.":
          "針對可疑 approval、OMS、audit 與 integrity events 觸發告警。",
        "Trace paper request flow and collect logs/metrics safely.":
          "安全追蹤 paper request flow 並收集 logs / metrics。",
        "Block unsafe releases and verify production-facing safety copy.":
          "阻擋不安全 release，並驗證 production-facing safety copy。",
        "Verify a staging hosted backend before customer-facing rollout.":
          "Customer-facing rollout 前先驗證 staging hosted backend。",
        "Exercise rate limits, denial paths, and read-only endpoint resilience.":
          "測試 rate limits、denial paths 與 read-only endpoint resilience。",
        "Verify unauthenticated, cross-tenant, and role-denied paths.":
          "驗證 unauthenticated、cross-tenant 與 role-denied paths。",
      },
      statusLabels: {
        contract_only_no_secret_store_connected: "僅 contract；尚未連接 secret store",
        not_enabled_rate_limit_policy_required: "尚未啟用；需要 rate limit policy",
        not_enabled_monitoring_rules_required: "尚未啟用；需要 monitoring rules",
        placeholder_only_no_hosted_pipeline: "僅 placeholder；沒有 hosted pipeline",
        release_readiness_and_production_smoke_gate_enabled:
          "Release readiness 與 production smoke gate 已啟用",
        not_enabled_staging_backend_required: "尚未啟用；需要 staging backend",
        not_executed_test_plan_required: "尚未執行；需要 test plan",
        not_enabled_real_auth_required: "尚未啟用；需要 real auth",
      },
      requiredNextSliceLabels: {
        "Select managed secrets store and define rotation policy.":
          "選擇 managed secrets store 並定義 rotation policy。",
        "Add non-production rate limit middleware and denial evidence.":
          "加入 non-production rate limit middleware 與 denial evidence。",
        "Define audit monitoring alerts for paper approval and OMS events.":
          "定義 paper approval 與 OMS events 的 audit monitoring alerts。",
        "Wire OpenTelemetry/log drain preview in staging only.":
          "僅在 staging 串接 OpenTelemetry / log drain preview。",
        "Add staging smoke test against a non-production hosted backend.":
          "針對 non-production hosted backend 加入 staging smoke test。",
        "Add basic load and abuse tests against read-only endpoints.":
          "針對 read-only endpoints 加入 basic load 與 abuse tests。",
        "Add auth boundary negative tests before any real login provider.":
          "任何 real login provider 前先加入 auth boundary negative tests。",
        "Create incident response and rollback runbooks.":
          "建立 incident response 與 rollback runbooks。",
      },
      warningLabels: {
        "This endpoint is read-only security and operations metadata only.":
          "此 endpoint 僅為 security 與 operations 只讀 metadata。",
        "No real secret store, rate limiter, hosted audit monitor, or log drain is enabled.":
          "未啟用真實 secret store、rate limiter、hosted audit monitor 或 log drain。",
        "No load, abuse, or real auth boundary test was executed by this endpoint.":
          "此 endpoint 不執行 load、abuse 或 real auth boundary test。",
        "Hosted paper SaaS remains NOT READY for customer production use.":
          "Hosted paper SaaS 尚未達 customer production use 標準。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperReadiness: {
      eyebrow: "Hosted Paper API",
      title: "Hosted Paper API 就緒狀態",
      description:
        "由後端 readiness endpoint 提供的只讀狀態。它說明 hosted paper backend/API 尚未啟用，因此實際 paper workflow records 仍需要本地 backend + local SQLite。",
      fallbackPrefix: "Hosted paper readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      stateLabel: "就緒狀態",
      capabilitiesLabel: "目前能力狀態",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      currentPathLabel: "目前客戶操作路徑",
      unavailableLabel: "Hosted backend 建立前不可用",
      futureRequirementsLabel: "未來必要條件",
      warningLabel: "邊界警示",
      capabilityLabels: {
        customer_login_enabled: "客戶登入已啟用",
        hosted_backend_enabled: "Hosted backend 已啟用",
        hosted_datastore_enabled: "Hosted datastore 已啟用",
        rbac_abac_enabled: "RBAC / ABAC 已啟用",
        paper_workflow_online_enabled: "線上 paper workflow 已啟用",
        local_demo_mode_primary: "本地 demo 模式仍是主要路徑",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      customerPathLabels: {
        "Use the Production Vercel Web Command Center for read-only UI and fallback samples.":
          "使用 Production Vercel Web Command Center 檢視只讀 UI 與 fallback samples。",
        "Use local backend + local SQLite to create and inspect actual paper workflow records.":
          "使用本地 backend + local SQLite 建立並檢視實際 paper workflow records。",
        "Use explicit local evidence export/import for customer review artifacts.":
          "透過明確的本地 evidence 匯出 / 匯入，提供客戶 review artifacts。",
      },
      unavailableLabels: {
        "Customer login to an online paper workspace.":
          "客戶登入線上 paper workspace。",
        "Tenant-scoped hosted paper records.": "Tenant-scoped hosted paper records。",
        "Hosted approval queue and decision persistence.":
          "Hosted approval queue 與 decision persistence。",
        "Hosted paper OMS/audit query APIs backed by a managed datastore.":
          "由 managed datastore 支撐的 hosted paper OMS / audit query APIs。",
      },
      futureRequirementLabels: {
        "Authenticated session context.": "Authenticated session context。",
        "Tenant-scoped managed hosted datastore.": "Tenant-scoped managed hosted datastore。",
        "RBAC/ABAC checks for reviewer and operator actions.":
          "針對 reviewer 與 operator actions 的 RBAC / ABAC checks。",
        "Paper-only approval workflow backed by hosted persistence.":
          "由 hosted persistence 支撐的 Paper-only approval workflow。",
        "Paper-only workflow submit that references a persisted approval_request_id.":
          "Paper-only workflow submit 必須引用 persisted approval_request_id。",
        "Append-only hosted paper audit events with integrity verification.":
          "具 integrity verification 的 append-only hosted paper audit events。",
        "Security and operations review before any customer pilot.":
          "任何 customer pilot 前必須完成 security 與 operations review。",
      },
      warningLabels: {
        "This endpoint is read-only readiness metadata, not a hosted paper backend.":
          "此 endpoint 只是只讀 readiness metadata，不是 hosted paper backend。",
        "It does not authenticate users, write records, call brokers, create orders, or turn live trading on.":
          "它不驗證使用者、不寫入 records、不呼叫券商、不建立訂單，也不啟用實盤交易。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
      },
    },
    hostedPaperSandboxOnboarding: {
      eyebrow: "Customer Onboarding",
      title: "Hosted Paper Sandbox Tenant Onboarding",
      description:
        "未來 browser-only customer sandbox tenant 的只讀契約。它顯示 local demo setup 與 SaaS onboarding flow 之間的缺口，但不建立 account、tenant、session、record、order 或 broker connection。",
      fallbackPrefix:
        "Hosted paper sandbox onboarding 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      goalLabel: "目標客戶體驗",
      stateLabel: "就緒狀態",
      capabilitiesLabel: "Onboarding capabilities",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      blockersLabel: "目前 blockers",
      guidedDemoLabel: "Guided demo data contract",
      datasetStatusLabel: "Dataset status",
      recordsLabel: "未來 demo records",
      requiredStepsLabel: "必要 onboarding steps",
      currentStatusLabel: "目前狀態",
      requiredBeforeSelfServiceLabel: "Customer self-service 前必要",
      demoWarningLabel: "Guided demo warnings",
      warningLabel: "邊界警示",
      capabilityLabels: {
        online_sandbox_tenant_enabled: "Online sandbox tenant 已啟用",
        browser_only_customer_onboarding_enabled:
          "Browser-only customer onboarding 已啟用",
        hosted_backend_enabled: "Hosted backend 已啟用",
        managed_datastore_enabled: "Managed datastore 已啟用",
        real_login_enabled: "Real login 已啟用",
        tenant_isolation_enforced: "Tenant isolation 已強制",
        guided_demo_data_contract_defined: "Guided demo data contract 已定義",
        guided_demo_data_hosted: "Guided demo data 已 hosted",
        paper_only_boundary_visible: "Paper Only 邊界可見",
        live_trading_controls_visible: "Live trading controls 可見",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        online_sandbox_tenant_created: "online_sandbox_tenant_created",
        customer_account_created: "customer_account_created",
        login_enabled: "login_enabled",
        session_cookie_issued: "session_cookie_issued",
        tenant_record_created: "tenant_record_created",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        broker_api_called: "broker_api_called",
        broker_credentials_collected: "broker_credentials_collected",
        order_created: "order_created",
        real_money_visible: "real_money_visible",
        production_customer_onboarding_ready:
          "production_customer_onboarding_ready",
        production_trading_ready: "production_trading_ready",
      },
      blockerLabels: {
        "No hosted sandbox tenant provisioning exists.":
          "尚未有 hosted sandbox tenant provisioning。",
        "No customer login or session provider is enabled.":
          "尚未啟用 customer login 或 session provider。",
        "No tenant-isolated managed datastore is connected.":
          "尚未連接 tenant-isolated managed datastore。",
        "No hosted paper approval, OMS, audit, or evidence records are written.":
          "尚未寫入 hosted paper approval、OMS、audit 或 evidence records。",
        "Production Vercel remains a read-only UI surface unless connected to a reviewed hosted backend.":
          "除非連接經審查的 hosted backend，Production Vercel 仍是只讀 UI surface。",
      },
      datasetStatusLabels: {
        contract_only_not_hosted: "contract_only_not_hosted",
      },
      intentLabels: {
        "Future guided customer demo data for paper approval requests, paper-only reviewer decisions, controlled paper submit, OMS timeline, audit timeline, risk evidence, and broker simulation evidence.":
          "未來 guided customer demo data 會涵蓋 paper approval requests、paper-only reviewer decisions、controlled paper submit、OMS timeline、audit timeline、risk evidence 與 broker simulation evidence。",
      },
      recordLabels: {
        sample_paper_approval_request: "sample_paper_approval_request",
        sample_reviewer_decisions: "sample_reviewer_decisions",
        sample_paper_workflow_run: "sample_paper_workflow_run",
        sample_oms_events: "sample_oms_events",
        sample_audit_events: "sample_audit_events",
        sample_risk_evaluation: "sample_risk_evaluation",
        sample_broker_simulation_preview: "sample_broker_simulation_preview",
        sample_readiness_evidence: "sample_readiness_evidence",
      },
      stepLabels: {
        hosted_backend_staging: "Hosted backend staging",
        managed_tenant_datastore: "Managed tenant datastore",
        customer_login_session: "Customer login and session",
        sandbox_tenant_provisioning: "Sandbox tenant provisioning",
        guided_demo_data: "Guided demo data",
        customer_browser_demo_flow: "Customer browser demo flow",
        security_operations_gate: "Security and operations gate",
      },
      statusLabels: {
        contract_only: "contract_only",
        migration_plan_only: "migration_plan_only",
        provider_not_selected: "provider_not_selected",
        not_enabled: "not_enabled",
        local_demo_required_today: "local_demo_required_today",
        readiness_contract_only: "readiness_contract_only",
      },
      demoWarningLabels: {
        "Guided demo data is a contract only and is not hosted by this release.":
          "Guided demo data 只是 contract，本版本尚未 hosted。",
        "Future demo records must remain simulated, Paper Only, and clearly labeled.":
          "未來 demo records 必須維持 simulated、Paper Only，並清楚標示。",
        "Future demo records must not contain broker credentials, real account data, or investment advice.":
          "未來 demo records 不得包含 broker credentials、real account data 或 investment advice。",
      },
      warningLabels: {
        "This endpoint is read-only onboarding readiness metadata only.":
          "此 endpoint 只是只讀 onboarding readiness metadata。",
        "No online sandbox tenant is created.":
          "不建立 online sandbox tenant。",
        "No customer account, reviewer account, login, or session is created.":
          "不建立 customer account、reviewer account、login 或 session。",
        "No hosted datastore is written.": "不寫入 hosted datastore。",
        "No broker API is called and no broker credentials are collected.":
          "不呼叫 broker API，也不收集 broker credentials。",
        "No order is created and no live trading approval exists.":
          "不建立 order，也不存在 live trading approval。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperEnvironment: {
      eyebrow: "SaaS Foundation",
      title: "Hosted Paper API 環境契約",
      description:
        "針對未來 SaaS paper product 的只讀部署邊界。它區分 Local Demo Mode、Hosted Paper Mode 與 Production Trading Platform readiness，但不啟用 hosted accounts 或交易執行。",
      fallbackPrefix: "Hosted paper environment 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      currentModeLabel: "目前客戶模式",
      deploymentModelLabel: "部署模型",
      productionStateLabel: "Production Trading Platform",
      modeLabel: "模式",
      stateLabel: "狀態",
      canReadLabel: "可讀取實際 paper records",
      canWriteLabel: "可寫入 paper records",
      authRequiredLabel: "需要身份驗證",
      tenantRequiredLabel: "需要 tenant isolation",
      managedDatastoreLabel: "需要 managed datastore",
      localSqliteLabel: "允許 local SQLite",
      limitationsLabel: "限制",
      roadmapLabel: "SaaS foundation path",
      statusLabel: "狀態",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      currentModeLabels: {
        local_demo_mode: "Local Demo Mode",
      },
      modeLabels: {
        local_demo: "Local Demo Mode",
        hosted_paper: "Hosted Paper Mode",
        production_trading_platform: "Production Trading Platform",
      },
      modeTitleLabels: {
        "Local Demo Mode": "Local Demo Mode",
        "Hosted Paper Mode": "Hosted Paper Mode",
        "Production Trading Platform": "Production Trading Platform",
      },
      stateLabels: {
        primary_local_demo: "PRIMARY LOCAL DEMO",
        not_enabled: "NOT ENABLED",
        staging_only_future: "STAGING ONLY FUTURE",
        ready_future: "READY FUTURE",
        not_ready: "NOT READY",
      },
      descriptionLabels: {
        "Primary customer evaluation path for actual paper workflow records. Runs on the reviewer's machine with local backend and local SQLite.":
          "目前客戶檢視實際 paper workflow records 的主要路徑。它在 reviewer 的本機執行 local backend 與 local SQLite。",
        "Future SaaS paper workflow path with authenticated sessions, tenant-scoped records, RBAC/ABAC, and managed datastore.":
          "未來 SaaS paper workflow 路徑，需要 authenticated sessions、tenant-scoped records、RBAC/ABAC 與 managed datastore。",
        "Production trading platform remains NOT READY. This contract does not enable live trading, broker connectivity, or real order routing.":
          "Production trading platform 仍為 NOT READY。此 contract 不啟用實盤交易、券商連線或真實委託路由。",
      },
      limitationLabels: {
        "Engineering-style local setup is still required.":
          "仍需要偏工程導向的本地啟動流程。",
        "Records are not available from Production Vercel.":
          "Production Vercel 無法讀取這些 records。",
        "Local SQLite is not a hosted tenant datastore.":
          "Local SQLite 不是 hosted tenant datastore。",
        "No hosted customer account or reviewer login is available.":
          "尚未提供 hosted customer account 或 reviewer login。",
        "Hosted backend/API is not deployed as a customer paper workspace.":
          "Hosted backend/API 尚未部署成客戶 paper workspace。",
        "Managed paper datastore is not connected.":
          "Managed paper datastore 尚未連接。",
        "Customer login, reviewer identity, and tenant isolation are not enabled.":
          "Customer login、reviewer identity 與 tenant isolation 尚未啟用。",
        "Hosted paper workflow persistence is not enabled.":
          "Hosted paper workflow persistence 尚未啟用。",
        "No live trading approval exists.": "不存在 live trading approval。",
        "No broker SDK path is enabled.": "未啟用任何 broker SDK path。",
        "No broker credentials are collected.": "不收集 broker credentials。",
        "No production OMS, WORM audit ledger, or cross-account risk system exists.":
          "尚未具備 production OMS、WORM audit ledger 或 cross-account risk system。",
      },
      capabilityLabels: {
        "Hosted backend": "Hosted backend",
        "Managed database": "Managed database",
        "Auth/session": "Auth/session",
        "Tenant isolation": "Tenant isolation",
        "Paper workflow persistence": "Paper workflow persistence",
        "Hosted customer demo tenant": "Hosted customer demo tenant",
      },
      statusLabels: {
        not_enabled: "not_enabled",
        schema_only: "schema_only",
        local_only: "local_only",
      },
      notesLabels: {
        "Deploy controlled backend/API for paper-only hosted workspace.":
          "部署受控 backend/API，作為 paper-only hosted workspace。",
        "Replace local SQLite with tenant-scoped managed datastore.":
          "以 tenant-scoped managed datastore 取代 local SQLite。",
        "Introduce real customer login and reviewer identity.":
          "導入真實 customer login 與 reviewer identity。",
        "Require tenant id on every hosted paper record and API read/write.":
          "每筆 hosted paper record 與 API read/write 都必須帶 tenant id。",
        "Move approval, paper OMS, risk, broker simulation, and audit records into hosted datastore.":
          "將 approval、paper OMS、risk、broker simulation 與 audit records 移入 hosted datastore。",
        "Provision a paper-only tenant with sample records after auth, data, audit, and security gates pass.":
          "在 auth、data、audit 與 security gates 通過後，建立 paper-only sample tenant。",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only environment contract metadata only.":
          "此 endpoint 只是只讀 environment contract metadata。",
        "Hosted Paper Mode is not enabled for customer SaaS operation.":
          "Hosted Paper Mode 尚未啟用為 customer SaaS operation。",
        "Production Vercel cannot read local SQLite paper records.":
          "Production Vercel 無法讀取 local SQLite paper records。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperDatastore: {
      eyebrow: "Managed Datastore",
      title: "Hosted Paper Managed Datastore 就緒狀態",
      description:
        "未來 tenant-scoped hosted paper records 的只讀 schema contract。它定義資料模型、tenant key、migration boundary、retention 與 audit requirements，但不連接資料庫。",
      fallbackPrefix:
        "Hosted paper datastore readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      tenantKeyLabel: "Tenant key",
      stateLabel: "就緒狀態",
      capabilitiesLabel: "能力旗標",
      migrationLabel: "Migration boundary",
      migrationModeLabel: "Migration mode",
      dryRunLabel: "Dry-run only",
      applyEnabledLabel: "Apply enabled",
      connectionAttemptedLabel: "Connection attempted",
      requiredControlsLabel: "Apply 前必要控制",
      recordModelsLabel: "未來 hosted paper record models",
      tableLabel: "資料表",
      tenantKeyRequiredLabel: "Tenant key required",
      retentionClassLabel: "Retention class",
      primaryIdentifiersLabel: "Primary identifiers",
      auditRequirementsLabel: "Audit requirements",
      retentionLabel: "Retention requirements",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      statusLabels: {
        schema_only_no_hosted_datastore: "SCHEMA ONLY - NO HOSTED DATASTORE",
      },
      capabilityLabels: {
        managed_datastore_enabled: "Managed datastore 已啟用",
        hosted_records_writable: "Hosted records 可寫入",
        hosted_records_readable: "Hosted records 可讀取",
        tenant_key_enforced: "Tenant key 已強制",
        migrations_apply_enabled: "Migration apply 已啟用",
        retention_policy_enforced: "Retention policy 已強制",
        audit_append_only_enforced: "Audit append-only 已強制",
        local_sqlite_replacement_required: "需要取代 local SQLite",
      },
      controlLabels: {
        "approved managed datastore selection": "已核准 managed datastore selection",
        "tenant_id required on every hosted paper table":
          "每個 hosted paper table 都必須有 tenant_id",
        "migration dry-run output reviewed": "Migration dry-run output 已審查",
        "backup and restore plan documented": "Backup 與 restore plan 已文件化",
        "retention policy approved": "Retention policy 已核准",
        "security review completed": "Security review 已完成",
      },
      recordNameLabels: {
        "Paper approval request": "Paper approval request",
        "Paper approval decision": "Paper approval decision",
        "Paper workflow run": "Paper workflow run",
        "Paper OMS event": "Paper OMS event",
        "Paper audit event": "Paper audit event",
      },
      retentionClassLabels: {
        paper_approval_governance: "paper_approval_governance",
        paper_review_history: "paper_review_history",
        paper_execution_workflow: "paper_execution_workflow",
        paper_oms_timeline: "paper_oms_timeline",
        paper_audit_trail: "paper_audit_trail",
      },
      modelNotesLabels: {
        "Future hosted approval requests must be tenant-scoped.":
          "未來 hosted approval requests 必須 tenant-scoped。",
        "Future reviewer decisions require authenticated identity.":
          "未來 reviewer decisions 必須有 authenticated identity。",
        "Future hosted paper workflow runs remain Paper Only.":
          "未來 hosted paper workflow runs 仍必須是 Paper Only。",
        "Future hosted OMS events require tenant-scoped ordering.":
          "未來 hosted OMS events 必須支援 tenant-scoped ordering。",
        "Future hosted audit events must support integrity verification.":
          "未來 hosted audit events 必須支援 integrity verification。",
      },
      auditRequirementLabels: {
        "append-only request creation event": "append-only request creation event",
        "hash-chain reference": "hash-chain reference",
        "reviewer-visible payload snapshot": "reviewer-visible payload snapshot",
        "distinct reviewer identity": "distinct reviewer identity",
        "immutable decision event": "immutable decision event",
        "previous decision hash": "previous decision hash",
        "risk evaluation reference": "risk evaluation reference",
        "OMS event sequence reference": "OMS event sequence reference",
        "paper broker simulation reference": "paper broker simulation reference",
        "deterministic sequence": "deterministic sequence",
        "idempotency key reference": "idempotency key reference",
        "event payload hash": "event payload hash",
        "append-only write path": "append-only write path",
        "hash-chain continuity": "hash-chain continuity",
        "retention and export metadata": "retention and export metadata",
      },
      recordGroupLabels: {
        approval_records: "approval_records",
        paper_workflow_records: "paper_workflow_records",
        audit_events: "audit_events",
      },
      retentionPolicyLabels: {
        "retain through customer evaluation window plus review hold":
          "保留至 customer evaluation window 加 review hold 結束",
        "retain through paper evaluation and audit review period":
          "保留至 paper evaluation 與 audit review period 結束",
        "append-only retention policy required before hosted use":
          "Hosted use 前必須先有 append-only retention policy",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is a schema-only datastore readiness contract.":
          "此 endpoint 只是 schema-only datastore readiness contract。",
        "No hosted database connection is configured or attempted.":
          "未設定也未嘗試連接 hosted database。",
        "No hosted records are read or written.":
          "不讀取也不寫入 hosted records。",
        "Local SQLite remains for local demo mode only.":
          "Local SQLite 仍只用於 local demo mode。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperProductionDatastore: {
      eyebrow: "Production Datastore",
      title: "Hosted Paper Production Datastore 就緒狀態",
      description:
        "未來 production datastore 的只讀邊界。它定義 paper approval、paper order、OMS event、audit event、migration、backup、retention 與 restore requirements，但不連接資料庫。",
      fallbackPrefix:
        "Hosted paper production datastore readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      tenantKeyLabel: "Tenant key",
      recommendedPatternLabel: "建議 datastore pattern",
      stateLabel: "就緒狀態",
      capabilitiesLabel: "能力旗標",
      migrationLabel: "Migration boundary",
      migrationModeLabel: "Migration mode",
      databaseUrlReadLabel: "DATABASE_URL 已讀取",
      connectionAttemptedLabel: "Connection attempted",
      applyEnabledLabel: "Apply enabled",
      requiredControlsLabel: "必要控制",
      recordGroupsLabel: "Production record groups",
      tablesLabel: "資料表",
      localSqliteAllowedLabel: "允許 Local SQLite",
      backupRequiredLabel: "需要 backup",
      retentionRequiredLabel: "需要 retention",
      restoreRequiredLabel: "需要 restore",
      retentionLabel: "Retention 與 deletion boundaries",
      localSqliteBoundaryLabel: "Local SQLite 邊界",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      statusLabels: {
        contract_only_no_production_datastore:
          "CONTRACT ONLY - NO PRODUCTION DATASTORE",
      },
      capabilityLabels: {
        production_datastore_enabled: "Production datastore 已啟用",
        managed_postgres_selected: "Managed Postgres 已選定",
        marketplace_provisioning_enabled: "Marketplace provisioning 已啟用",
        hosted_records_writable: "Hosted records 可寫入",
        hosted_records_readable: "Hosted records 可讀取",
        migrations_apply_enabled: "Migration apply 已啟用",
        backup_policy_configured: "Backup policy 已設定",
        point_in_time_recovery_required: "需要 point-in-time recovery",
        restore_drill_verified: "Restore drill 已驗證",
        retention_policy_enforced: "Retention policy 已強制",
        local_sqlite_allowed_for_production:
          "Production 可使用 Local SQLite",
      },
      recordGroupLabels: {
        paper_approval: "Paper approval",
        paper_order: "Paper order",
        oms_event: "OMS event",
        audit_event: "Audit event",
      },
      controlLabels: {
        "authenticated reviewer identity": "Authenticated reviewer identity",
        "tenant-scoped RBAC and ABAC": "Tenant-scoped RBAC and ABAC",
        "dual-review sequence where required": "必要時雙人覆核 sequence",
        "append-only decision audit trail": "Append-only decision audit trail",
        "completed approval_request_id": "Completed approval_request_id",
        "risk evaluation reference": "Risk evaluation reference",
        "duplicate order prevention across sessions":
          "跨 session duplicate order prevention",
        "paper-only execution eligibility": "Paper-only execution eligibility",
        "durable queue/outbox design": "Durable queue/outbox design",
        "deterministic event ordering": "Deterministic event ordering",
        "timeout and retry metadata": "Timeout and retry metadata",
        "reconciliation reference": "Reconciliation reference",
        "append-only audit write path": "Append-only audit write path",
        "hash-chain verification": "Hash-chain verification",
        "retention and legal hold metadata": "Retention 與 legal hold metadata",
        "exportable evidence references": "Exportable evidence references",
        "managed Postgres provider selected and security-reviewed":
          "Managed Postgres provider 已選定並完成 security review",
        "dev/staging/production database separation documented":
          "dev/staging/production database separation 已文件化",
        "tenant_id required on every hosted paper table":
          "每個 hosted paper table 都必須有 tenant_id",
        "migration dry-run reviewed": "Migration dry-run 已審查",
        "backup policy documented": "Backup policy 已文件化",
        "restore drill documented": "Restore drill 已文件化",
        "retention policy approved": "Retention policy 已核准",
        "audit integrity requirements reviewed":
          "Audit integrity requirements 已審查",
      },
      retentionRequirementLabels: {
        "retain through customer evaluation, dispute review, and audit hold":
          "保留至 customer evaluation、dispute review 與 audit hold 結束",
        "retain through paper workflow review and customer evidence export":
          "保留至 paper workflow review 與 customer evidence export 結束",
        "retain full event timeline through workflow lifecycle and audit review":
          "保留完整 event timeline 至 workflow lifecycle 與 audit review 結束",
        "append-only retention with integrity verification":
          "具 integrity verification 的 append-only retention",
      },
      deleteBehaviorLabels: {
        "soft delete request metadata only after retention review":
          "Retention review 後才 soft delete request metadata",
        "archive before deletion; no direct user hard delete":
          "刪除前先 archive；不提供 user direct hard delete",
        "append corrective events instead of mutating history":
          "用 corrective events 追加修正，不改寫 history",
        "no user deletion path before legal and compliance review":
          "Legal 與 compliance review 前不提供 user deletion path",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        database_written: "database_written",
        external_db_written: "external_db_written",
        broker_credentials_collected: "broker_credentials_collected",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only production datastore readiness metadata.":
          "此 endpoint 只是只讀 production datastore readiness metadata。",
        "No production database is selected, provisioned, connected, or written.":
          "未選定、provision、連接或寫入 production database。",
        "No DATABASE_URL is read by this contract.":
          "此 contract 不讀取 DATABASE_URL。",
        "Local SQLite remains for demo and development only.":
          "Local SQLite 仍只用於 demo 與 development。",
        "Backup, retention, and restore controls are required before hosted use.":
          "Hosted use 前必須完成 backup、retention 與 restore controls。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperIdentityReadiness: {
      eyebrow: "Hosted Paper Identity",
      title: "Identity、RBAC 與 tenant readiness",
      description:
        "只讀檢視未來 reviewer login、customer accounts、RBAC/ABAC 與 tenant isolation 狀態。這些控制目前只是 schema-only，尚未啟用。",
      fallbackPrefix:
        "Hosted paper identity readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      stateLabel: "就緒狀態",
      identityLabel: "Identity 狀態",
      accessControlLabel: "Access control 狀態",
      tenantIsolationLabel: "Tenant isolation 狀態",
      rolesLabel: "未來 roles",
      blockedLabel: "Identity layer 建立前不可用",
      futureRequirementsLabel: "未來必要條件",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      identityLabels: {
        reviewer_login_enabled: "Reviewer login 已啟用",
        customer_accounts_enabled: "Customer accounts 已啟用",
        authentication_provider: "Authentication provider",
        session_issuance_enabled: "Session issuance 已啟用",
        session_cookie_issued: "Session cookie 已發出",
        mfa_enabled: "MFA 已啟用",
      },
      accessControlLabels: {
        rbac_enabled: "RBAC 已啟用",
        abac_enabled: "ABAC 已啟用",
        mutation_permissions_granted: "Mutation permissions 已授予",
        live_permissions_granted: "實盤權限已授予",
      },
      tenantLabels: {
        tenant_isolation_required: "需要 tenant isolation",
        tenant_isolation_enforced: "Tenant isolation 已強制執行",
        hosted_tenant_datastore_enabled: "Hosted tenant datastore 已啟用",
        hosted_tenant_records_enabled: "Hosted tenant records 已啟用",
        tenant_created: "Tenant 已建立",
        local_sqlite_access_from_production_vercel:
          "Production Vercel 讀取 local SQLite",
      },
      roleLabels: {
        viewer: "Viewer",
        research_reviewer: "Research reviewer",
        risk_reviewer: "Risk reviewer",
        paper_operator: "Paper operator",
        tenant_admin: "Tenant admin",
      },
      blockedLabels: {
        "Real reviewer login.": "真實 reviewer login。",
        "Customer account onboarding.": "Customer account onboarding。",
        "Tenant-scoped hosted paper workspace.":
          "Tenant-scoped hosted paper workspace。",
        "Hosted approval queue mutations.": "Hosted approval queue mutations。",
        "Hosted paper workflow submission.": "Hosted paper workflow submission。",
        "Hosted tenant paper record queries backed by a managed datastore.":
          "由 managed datastore 支撐的 hosted tenant paper record queries。",
      },
      futureRequirementLabels: {
        "Choose and review a hosted authentication provider.":
          "選擇並審查 hosted authentication provider。",
        "Define session issuance, expiry, rotation, and logout behavior.":
          "定義 session issuance、expiry、rotation 與 logout 行為。",
        "Implement tenant-scoped account and membership records.":
          "實作 tenant-scoped account 與 membership records。",
        "Enforce RBAC for reviewer and paper operator actions.":
          "針對 reviewer 與 paper operator actions 強制 RBAC。",
        "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.":
          "針對 paper-only mode、tenant scope、environment 與 approval state 強制 ABAC。",
        "Add dual-review rules before any hosted paper workflow submission.":
          "任何 hosted paper workflow submission 前加入 dual-review rules。",
        "Add audit trail for identity, authorization, and tenant-boundary decisions.":
          "為 identity、authorization 與 tenant-boundary decisions 加入 audit trail。",
        "Complete security and operations review before customer pilot.":
          "Customer pilot 前完成 security 與 operations review。",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        hosted_auth_provider_enabled: "hosted_auth_provider_enabled",
        reviewer_login_created: "reviewer_login_created",
        customer_account_created: "customer_account_created",
        session_cookie_issued: "session_cookie_issued",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        rbac_abac_enforced: "rbac_abac_enforced",
        tenant_isolation_enforced: "tenant_isolation_enforced",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only identity readiness metadata only.":
          "此 endpoint 只是只讀 identity readiness metadata。",
        "It does not create reviewer login, customer accounts, sessions, tenant records, or RBAC/ABAC enforcement.":
          "它不建立 reviewer login、customer accounts、sessions、tenant records，也不強制 RBAC/ABAC。",
        "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.":
          "它不啟用實盤交易、不寫資料庫、不收 credentials、不呼叫券商，也不建立訂單。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
      },
    },
    hostedPaperIdentityAccessContract: {
      eyebrow: "Hosted Paper Identity",
      title: "Identity access contract",
      description:
        "只讀檢視未來真實 login、session、customer account、tenant boundary 與 RBAC/ABAC role separation 契約。本版本不驗證使用者，也不發 session。",
      fallbackPrefix:
        "Hosted paper identity access contract 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      stateLabel: "契約狀態",
      providerLabel: "Identity provider 邊界",
      sessionBoundaryLabel: "Session 邊界",
      tenantBoundaryLabel: "Tenant 邊界",
      requiredClaimsLabel: "未來 session 必要 claims",
      sessionLifecycleLabel: "必要 session lifecycle",
      sessionValidationLabel: "Session validation 已啟用",
      sessionAuditLabel: "需要 session audit",
      roleLabel: "分離的未來 role",
      requiresMfaLabel: "需要 MFA",
      requiresDualReviewLabel: "需要雙人覆核",
      livePermissionLabel: "實盤權限已授予",
      futureMutationsLabel: "未來 paper-only mutations",
      noneLabel: "無",
      abacPoliciesLabel: "ABAC policy contracts",
      enabledLabel: "已啟用",
      blockedLabel: "真實 identity 建立前不可用",
      implementationSequenceLabel: "導入順序",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      providerLabels: {
        provider_required: "需要 provider",
        provider_selected: "Provider 已選定",
        provider_name: "Provider 名稱",
        real_login_enabled: "真實 login 已啟用",
        customer_signup_enabled: "Customer signup 已啟用",
        reviewer_login_enabled: "Reviewer login 已啟用",
        session_issuance_enabled: "Session issuance 已啟用",
        session_cookie_issued: "Session cookie 已發出",
        mfa_required_for_privileged_roles: "Privileged roles 需要 MFA",
        mfa_enabled: "MFA 已啟用",
      },
      tenantLabels: {
        tenant_id_required_on_every_request: "每個 request 都需要 tenant_id",
        tenant_id_required_on_every_record: "每筆 record 都需要 tenant_id",
        membership_required: "需要 tenant membership",
        cross_tenant_access_allowed: "允許跨 tenant 存取",
        tenant_isolation_enforced: "Tenant isolation 已強制執行",
        tenant_admin_role_required_for_membership_changes:
          "Membership changes 需要 tenant admin",
        local_sqlite_allowed_for_hosted_tenant_records:
          "Hosted tenant records 可使用 local SQLite",
      },
      roleLabels: {
        customer: "Customer",
        reviewer: "Reviewer",
        operator: "Operator",
        admin: "Admin",
      },
      rolePurposeLabels: {
        "Future tenant member who can read the customer's own paper workspace, paper evidence, and demo status.":
          "未來 tenant member，只能讀取自己的 paper workspace、paper evidence 與 demo status。",
        "Future paper-only reviewer for research and risk decisions inside one tenant boundary.":
          "未來 paper-only reviewer，只能在單一 tenant boundary 內處理 research 與 risk decisions。",
        "Future paper-only operator who can submit a paper workflow only after completed approval sequence.":
          "未來 paper-only operator，只能在 approval sequence 完成後提交 paper workflow。",
        "Future tenant administrator for paper-only tenant membership and configuration review.":
          "未來 tenant administrator，負責 paper-only tenant membership 與 configuration review。",
      },
      permissionLabels: {
        read_own_tenant_readiness: "讀取自己的 tenant readiness",
        read_own_paper_records: "讀取自己的 paper records",
        read_own_evidence: "讀取自己的 evidence",
        read_tenant_readiness: "讀取 tenant readiness",
        read_tenant_approval_queue: "讀取 tenant approval queue",
        read_tenant_paper_records: "讀取 tenant paper records",
        read_tenant_evidence: "讀取 tenant evidence",
        read_completed_approval_requests: "讀取已完成 approval requests",
        read_tenant_members: "讀取 tenant members",
        read_tenant_audit_events: "讀取 tenant audit events",
        record_research_review_decision: "記錄 research review decision",
        record_risk_review_decision: "記錄 risk review decision",
        submit_approved_paper_workflow: "提交已審批 paper workflow",
        manage_tenant_members: "管理 tenant members",
        rotate_tenant_reviewers: "輪替 tenant reviewers",
        None: "無",
      },
      abacPolicyLabels: {
        paper_only_mode: "Paper-only mode",
        tenant_scope: "Tenant scope",
        environment_scope: "Environment scope",
        approval_state: "Approval state",
      },
      enforcementTargetLabels: {
        "all hosted paper requests": "所有 hosted paper requests",
        "all tenant record reads and future writes":
          "所有 tenant record reads 與 future writes",
        "hosted paper API routing": "hosted paper API routing",
        "future paper workflow submission": "未來 paper workflow submission",
      },
      blockedLabels: {
        "Hosted customer account login.": "Hosted customer account login。",
        "Reviewer login and session issuance.": "Reviewer login 與 session issuance。",
        "Tenant membership management.": "Tenant membership management。",
        "RBAC enforcement for reviewer, admin, customer, and operator roles.":
          "針對 reviewer、admin、customer、operator roles 強制 RBAC。",
        "ABAC enforcement for paper-only mode, tenant scope, environment, and approval state.":
          "針對 paper-only mode、tenant scope、environment 與 approval state 強制 ABAC。",
        "Hosted paper approval mutations.": "Hosted paper approval mutations。",
        "Hosted paper workflow submission.": "Hosted paper workflow submission。",
        "Hosted tenant paper record queries backed by managed datastore.":
          "由 managed datastore 支撐的 hosted tenant paper record queries。",
      },
      implementationLabels: {
        "Select and security-review an authentication provider.":
          "選擇並完成 authentication provider security review。",
        "Implement tenant and membership datastore models.":
          "實作 tenant 與 membership datastore models。",
        "Implement real login, logout, session issue, session rotation, and session expiry.":
          "實作真實 login、logout、session issue、session rotation 與 session expiry。",
        "Attach tenant_id, roles, permissions, and attributes to every hosted request.":
          "每個 hosted request 都附上 tenant_id、roles、permissions 與 attributes。",
        "Enforce RBAC for reviewer, admin, customer, and operator permissions.":
          "針對 reviewer、admin、customer、operator permissions 強制 RBAC。",
        "Enforce ABAC for paper-only mode, tenant scope, environment, and approval state.":
          "針對 paper-only mode、tenant scope、environment 與 approval state 強制 ABAC。",
        "Add identity and authorization audit events.":
          "加入 identity 與 authorization audit events。",
        "Run security review before hosted customer pilot.":
          "Hosted customer pilot 前執行 security review。",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        auth_provider_enabled: "auth_provider_enabled",
        real_login_enabled: "real_login_enabled",
        customer_account_created: "customer_account_created",
        reviewer_login_created: "reviewer_login_created",
        admin_login_created: "admin_login_created",
        operator_login_created: "operator_login_created",
        session_cookie_issued: "session_cookie_issued",
        rbac_enforced: "rbac_enforced",
        abac_enforced: "abac_enforced",
        tenant_isolation_enforced: "tenant_isolation_enforced",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This is a read-only identity access contract, not a login system.":
          "這是只讀 identity access contract，不是 login system。",
        "No customer account, reviewer login, admin login, operator login, or session is created.":
          "不建立 customer account、reviewer login、admin login、operator login 或 session。",
        "RBAC and ABAC are required for hosted SaaS but are not enforced by this slice.":
          "Hosted SaaS 需要 RBAC 與 ABAC，但本切片尚未強制執行。",
        "No credentials are collected, no hosted datastore is written, no broker is called, and no order is created.":
          "不收 credentials、不寫 hosted datastore、不呼叫券商，也不建立訂單。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperAuthProviderSelection: {
      eyebrow: "Hosted Paper Auth",
      title: "Auth provider selection matrix",
      description:
        "只讀比較 Clerk、Auth0、Descope、Vercel OIDC / Sign in with Vercel 與未來 hosted paper SaaS identity 需求。本切片不選定、不安裝、也不啟用任何 provider。",
      fallbackPrefix:
        "Hosted paper auth provider selection 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      stateLabel: "選型狀態",
      categoryLabel: "類型",
      paperSaasFitLabel: "Paper SaaS 適配",
      integrationEnabledLabel: "Integration 已啟用",
      secretsAddedLabel: "Secrets 已加入",
      recommendedUseLabel: "建議用途",
      criteriaLabel: "選型標準",
      nonGoalsLabel: "非目標",
      nextStepsLabel: "建議下一步",
      safetyDefaultsLabel: "安全預設",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      providerLabels: {
        Clerk: "Clerk",
        Auth0: "Auth0",
        Descope: "Descope",
        "Vercel OIDC / Sign in with Vercel": "Vercel OIDC / Sign in with Vercel",
      },
      categoryLabels: {
        "Vercel Marketplace auth platform": "Vercel Marketplace auth platform",
        "Enterprise identity platform": "Enterprise identity platform",
        "Passwordless and workflow-oriented auth platform":
          "Passwordless and workflow-oriented auth platform",
        "Developer-facing OAuth/OIDC identity":
          "Developer-facing OAuth/OIDC identity",
      },
      fitLabels: {
        strong_pilot_candidate: "強 pilot 候選",
        strong_enterprise_candidate: "強 enterprise 候選",
        pilot_candidate: "Pilot 候選",
        internal_operator_candidate: "Internal/operator 候選",
      },
      fitSummaryLabels: {
        "Strong candidate for a fast hosted paper SaaS pilot on Vercel when prebuilt UI, session management, and lower integration overhead are more important than deep enterprise identity customization.":
          "若早期 hosted paper SaaS pilot 重視 Vercel 上快速導入、預建 UI、session management 與較低整合成本，Clerk 是強候選。",
        "Strong candidate when enterprise SSO, mature identity governance, custom claims, and large organization requirements dominate.":
          "若 enterprise SSO、成熟 identity governance、custom claims 與大型組織需求是主軸，Auth0 是強候選。",
        "Candidate for passwordless customer onboarding and guided identity flows where visual flow configuration is useful.":
          "若需要 passwordless customer onboarding 與 guided identity flows，Descope 可列入評估。",
        "Useful for developer/operator tooling where users already have Vercel accounts, but not a default fit for general customer SaaS login.":
          "適合既有 Vercel 帳號的 developer/operator tooling，但不適合作為一般 customer SaaS login 預設。",
      },
      recommendedUseLabels: {
        "Shortlist for first hosted paper customer pilot evaluation.":
          "列入第一個 hosted paper customer pilot 的 shortlist。",
        "Shortlist for enterprise or broker-partner paper SaaS pilots.":
          "列入 enterprise 或 broker-partner paper SaaS pilot shortlist。",
        "Evaluate if passwordless onboarding is a product priority.":
          "若 passwordless onboarding 是產品優先事項，列入評估。",
        "Keep as an internal/admin tooling option, not customer default.":
          "保留為 internal/admin tooling 選項，不作為 customer default。",
      },
      criterionLabels: {
        tenant_boundary: "Tenant boundary",
        role_mapping: "Role mapping",
        session_security: "Session security",
        mfa_for_privileged_roles: "Privileged roles MFA",
        auditability: "Auditability",
        paper_only_policy_enforcement: "Paper-only policy enforcement",
        vercel_deployment_fit: "Vercel deployment fit",
      },
      criterionReasonLabels: {
        "Every hosted paper record and request must be scoped by tenant_id.":
          "每筆 hosted paper record 與 request 都必須由 tenant_id 限定範圍。",
        "Customer, reviewer, operator, and admin permissions must remain separate.":
          "Customer、reviewer、operator、admin 權限必須分離。",
        "Sessions need expiry, rotation, revocation, logout, and audit events.":
          "Session 需要 expiry、rotation、revocation、logout 與 audit events。",
        "Reviewer, operator, and admin roles should require stronger assurance.":
          "Reviewer、operator、admin roles 應有更高 assurance 要求。",
        "Identity and authorization decisions must be traceable for review.":
          "Identity 與 authorization decisions 必須可供審查追溯。",
        "Auth must carry attributes needed to enforce paper-only mode.":
          "Auth 必須攜帶可強制 paper-only mode 的 attributes。",
        "The provider should fit the planned hosted frontend/backend deployment path.":
          "Provider 應符合規劃中的 hosted frontend/backend deployment path。",
      },
      nonGoalLabels: {
        "Do not install provider SDKs in this slice.":
          "本切片不安裝 provider SDK。",
        "Do not create login or signup pages.":
          "不建立 login 或 signup pages。",
        "Do not create customer accounts.": "不建立 customer accounts。",
        "Do not issue session cookies.": "不發 session cookies。",
        "Do not add secrets or environment variables.":
          "不加入 secrets 或 environment variables。",
        "Do not write hosted datastore records.":
          "不寫 hosted datastore records。",
        "Do not collect broker credentials.": "不收 broker credentials。",
        "Do not call brokers or create orders.": "不呼叫券商，也不建立訂單。",
        "Do not enable live trading.": "不啟用實盤交易。",
      },
      nextStepLabels: {
        "Review product requirements for customer, reviewer, operator, and admin roles.":
          "審查 customer、reviewer、operator、admin roles 的產品需求。",
        "Confirm tenant membership and audit requirements before choosing a provider.":
          "選定 provider 前先確認 tenant membership 與 audit requirements。",
        "Run a security review of shortlisted provider data handling and session behavior.":
          "針對 shortlist provider 的資料處理與 session behavior 做 security review。",
        "Select one provider for a staging-only proof of concept in a future slice.":
          "在未來切片選一個 provider 做 staging-only proof of concept。",
        "Keep production hosted paper customer access disabled until auth, tenant datastore, RBAC, ABAC, and audit controls are implemented.":
          "在 auth、tenant datastore、RBAC、ABAC 與 audit controls 完成前，production hosted paper customer access 保持關閉。",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        provider_selected: "provider_selected",
        integration_enabled: "integration_enabled",
        auth_provider_enabled: "auth_provider_enabled",
        customer_account_created: "customer_account_created",
        reviewer_login_created: "reviewer_login_created",
        session_cookie_issued: "session_cookie_issued",
        credentials_collected: "credentials_collected",
        secrets_added: "secrets_added",
        hosted_datastore_written: "hosted_datastore_written",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This is a read-only selection matrix, not an authentication integration.":
          "這是只讀 selection matrix，不是 authentication integration。",
        "No provider is selected or enabled by this slice.":
          "本切片不選定也不啟用任何 provider。",
        "No credentials, secrets, customer accounts, sessions, hosted records, broker calls, or orders are created.":
          "不建立 credentials、secrets、customer accounts、sessions、hosted records、broker calls 或 orders。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
        "Live trading remains disabled by default.":
          "Live trading remains disabled by default.",
      },
    },
    hostedPaperSession: {
      eyebrow: "Hosted Paper Session",
      title: "Mock session 與 tenant contract",
      description:
        "只讀檢視未來 hosted paper session、tenant、roles 與 permissions schema。它不驗證使用者、不發 session cookie、不寫 hosted records、不收 credentials、不呼叫券商，也不啟用實盤交易。",
      fallbackPrefix: "Hosted paper mock session 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoints",
      stateLabel: "Contract state",
      sessionLabel: "Mock session",
      tenantLabel: "Mock tenant context",
      rolesLabel: "未來 RBAC roles",
      grantedPermissionsLabel: "Mock session 已授權",
      deniedMutationPermissionsLabel: "被拒絕的 mutation permissions",
      safetyFlagsLabel: "安全旗標",
      warningLabel: "邊界警示",
      fields: {
        userId: "User ID",
        sessionId: "Session ID",
        authenticated: "Authenticated",
        authenticationProvider: "Authentication provider",
        authenticationMode: "Authentication mode",
        tenantId: "Tenant ID",
        tenantMode: "Tenant mode",
        tenantIsolation: "需要 tenant isolation",
        hostedDatastore: "Hosted datastore 已啟用",
        localSqliteAccess: "Local SQLite access",
      },
      roleLabels: {
        viewer: "Viewer",
        research_reviewer: "Research reviewer",
        risk_reviewer: "Risk reviewer",
        paper_operator: "Paper operator",
        tenant_admin: "Tenant admin",
      },
      roleDescriptionLabels: {
        "Read hosted readiness, mock session, tenant context, and evidence metadata.":
          "讀取 hosted readiness、mock session、tenant context 與 evidence metadata。",
        "Future paper-only role for research review decisions.":
          "未來 paper-only research review decisions 角色。",
        "Future paper-only role for risk review decisions.":
          "未來 paper-only risk review decisions 角色。",
        "Future paper-only role for submitting approved paper workflows.":
          "未來提交已審批 paper workflows 的 paper-only 角色。",
        "Future paper-only role for tenant workspace administration.":
          "未來 tenant workspace 管理的 paper-only 角色。",
      },
      permissionLabels: {
        read_hosted_readiness: "讀取 hosted readiness",
        read_mock_session: "讀取 mock session",
        read_current_tenant: "讀取 current tenant",
        read_tenant_paper_records: "讀取 tenant paper records",
        create_paper_approval_request: "建立 paper approval request",
        record_paper_reviewer_decision: "記錄 paper reviewer decision",
        submit_approved_paper_workflow: "提交已審批 paper workflow",
        enable_live_trading: "實盤權限（拒絕）",
        upload_broker_credentials: "上傳券商 credentials",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        hosted_auth_provider_enabled: "hosted_auth_provider_enabled",
        session_cookie_issued: "session_cookie_issued",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is a mock contract only; no hosted authentication provider is enabled.":
          "此 endpoint 只是 mock contract；沒有啟用 hosted authentication provider。",
        "No credentials are collected, no session cookie is issued, and no hosted datastore is written.":
          "不收 credentials、不發 session cookie，也不寫入 hosted datastore。",
        "Mock permissions do not authorize paper workflow mutations or live trading.":
          "Mock permissions 不授權 paper workflow mutations 或實盤交易。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
      },
    },
    hostedPaperTenantEvidence: {
      eyebrow: "Hosted Paper Evidence",
      title: "Tenant boundary evidence viewer",
      description:
        "只讀載入 hosted paper mock session、tenant、roles、permissions、被拒絕的 mutation permissions 與安全旗標 JSON。檔案只在瀏覽器端解析，不會上傳。",
      initialMessage:
        "請選擇由 make hosted-paper-tenant-boundary-evidence-export 匯出的本地 evidence。",
      noSource: "尚未選擇本地 hosted paper tenant boundary evidence",
      currentSource: "目前來源",
      selectFile: "選擇本地 .json",
      clearLocalJson: "清除本地 JSON",
      clearMessage: "已清除本地 hosted paper tenant boundary evidence。",
      rejectExtension: "只接受本地 .json evidence 檔案。",
      rejectSize: "Evidence 檔案過大，無法在本地 viewer 載入。",
      rejectPrefix: "拒絕不安全的 hosted paper tenant boundary evidence",
      invalidJson: "JSON evidence 檔案格式無效。",
      loadedPrefix: "已載入",
      loadedMessage:
        "Hosted paper tenant boundary evidence 已在本地載入。檔案未上傳。",
      empty:
        "請先匯出本地 evidence，再選擇 .json 檔案檢視 hosted paper boundary 狀態。",
      identityKicker: "Evidence",
      identityTitle: "Boundary artifact identity",
      sessionKicker: "Mock Session",
      sessionTitle: "沒有真實登入",
      tenantKicker: "Tenant Context",
      tenantTitle: "Mock tenant boundary",
      permissionsKicker: "Permissions",
      permissionsTitle: "只讀授權摘要",
      deniedMutationKicker: "Denied Mutations",
      deniedMutationTitle: "Mutation permissions 維持拒絕",
      safetyKicker: "安全旗標",
      safetyTitle: "無登入、無 DB、無券商、無實盤路徑",
      assertionsKicker: "Boundary Assertions",
      assertionsTitle: "Reviewer 檢查",
      warningsKicker: "Warnings",
      warningsTitle: "Evidence 限制",
      readOnlyNote:
        "此 viewer 僅供只讀檢視；不驗證使用者、不上傳、不寫資料庫、不呼叫券商、不收 credentials、不建立訂單、不核准紙上執行，也不核准實盤。",
      fields: {
        evidenceId: "Evidence ID",
        generatedAt: "Generated at",
        service: "Service",
        contractState: "Contract state",
        persisted: "Persisted",
        userId: "User ID",
        sessionId: "Session ID",
        authenticated: "Authenticated",
        authenticationProvider: "Authentication provider",
        authenticationMode: "Authentication mode",
        tenantId: "Tenant ID",
        tenantMode: "Tenant mode",
        tenantIsolation: "需要 tenant isolation",
        hostedDatastore: "Hosted datastore 已啟用",
        localSqliteAccess: "Local SQLite access",
        brokerProvider: "Broker provider",
        grantedPermissions: "Granted permissions",
        deniedPermissions: "Denied permissions",
        deniedMutationPermissions: "Denied mutation permissions",
        mutationPermissionsGranted: "Mutation permissions granted",
      },
      permissionLabels: {
        read_hosted_readiness: "讀取 hosted readiness",
        read_mock_session: "讀取 mock session",
        read_current_tenant: "讀取 current tenant",
        read_tenant_paper_records: "讀取 tenant paper records",
        create_paper_approval_request: "建立 paper approval request",
        record_paper_reviewer_decision: "記錄 paper reviewer decision",
        submit_approved_paper_workflow: "提交已審批 paper workflow",
        enable_live_trading: "實盤權限（拒絕）",
        upload_broker_credentials: "上傳券商 credentials",
      },
      safetyLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        hosted_paper_enabled: "hosted_paper_enabled",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        risk_engine_called: "risk_engine_called",
        oms_called: "oms_called",
        broker_gateway_called: "broker_gateway_called",
        authenticated: "authenticated",
        hosted_auth_provider_enabled: "hosted_auth_provider_enabled",
        session_cookie_issued: "session_cookie_issued",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        database_written: "database_written",
        hosted_datastore_enabled: "hosted_datastore_enabled",
        hosted_datastore_written: "hosted_datastore_written",
        external_db_written: "external_db_written",
        local_sqlite_access: "local_sqlite_access",
        production_trading_ready: "production_trading_ready",
        investment_advice: "investment_advice",
      },
      assertionLabels: {
        hosted_paper_mode_enabled: "hosted_paper_mode_enabled",
        mock_read_only: "mock_read_only",
        authenticated: "authenticated",
        authentication_provider: "authentication_provider",
        session_cookie_issued: "session_cookie_issued",
        tenant_isolation_required: "tenant_isolation_required",
        hosted_datastore_enabled: "hosted_datastore_enabled",
        hosted_datastore_written: "hosted_datastore_written",
        local_sqlite_access: "local_sqlite_access",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        live_trading_enabled: "live_trading_enabled",
        production_trading_ready: "production_trading_ready",
        mutation_permissions_granted: "mutation_permissions_granted",
      },
    },
    paperExecution: {
      eyebrow: "紙上執行",
      title: "紙上模擬審批流程",
      description:
        "只讀檢視從 StrategySignal 到 PaperOrderIntent、Risk Engine、OMS、Paper Broker Gateway 與 audit events 的受控路徑。此 UI 不送出模擬，不提供任何實盤控制。",
      fallbackPrefix: "後端紙上執行狀態無法取得，正在顯示安全備援資料：",
      approvalKicker: "審核狀態",
      approvalTitle: "允許的審核結果",
      pathKicker: "紙上路徑",
      pathTitle: "必要模擬路由",
      safetyKicker: "安全狀態",
      safetyTitle: "僅限 Paper Only，無實盤控制",
      safetyText:
        "平台建立的 PaperOrderIntent 只有在紙上審核後才能模擬，且與實盤交易分離，永遠不呼叫真實券商。",
      brokerApiCalled: "BROKER_API_CALLED",
      persistenceBackend: "持久化",
      persistenceAria: "本地紙上執行持久化狀態",
      localOnly: "LOCAL_ONLY",
      runs: "執行紀錄",
      omsEvents: "OMS 事件",
      auditEvents: "稽核事件",
      executionReports: "Execution reports",
      outboxItems: "Outbox metadata",
      productionOmsReady: "Production OMS ready",
      dbPath: "本地 DB",
      statusLabels: {
        research_approved: "研究已通過",
        approved_for_paper_simulation: "已核准紙上模擬",
        rejected: "已拒絕",
        needs_data_review: "需要資料審查",
      },
      pathLabels: {
        StrategySignal: "StrategySignal",
        "Platform PaperOrderIntent": "平台 PaperOrderIntent",
        "Risk Engine": "Risk Engine",
        OMS: "OMS",
        "Paper Broker Gateway": "Paper Broker Gateway",
        "Audit Event": "Audit Event",
      },
    },
    paperRisk: {
      eyebrow: "紙上 Risk Engine",
      title: "紙上風控 Guardrail 擴充",
      description:
        "只讀顯示擴充後的 paper-only Risk Engine checks：price reasonability、契約單筆數量、margin proxy、duplicate order prevention、daily loss、position limit、kill switch 與模擬 broker heartbeat。",
      fallbackPrefix: "後端紙上風控狀態無法取得，正在顯示安全備援資料：",
      guardrailKicker: "Guardrails",
      guardrailTitle: "擴充的 pre-trade / in-trade checks",
      guardrails: [
        "price_reasonability 會拒絕超出 reference band 的紙上價格。",
        "max_order_size_by_contract 限制 TX / MTX / TMF 紙上單筆數量。",
        "margin_proxy 會阻擋超過本地 margin proxy 的紙上曝險。",
        "duplicate_order_prevention 會拒絕已出現過的 idempotency key。",
        "daily_loss_state_tracking 與 position_limit_tracking 僅使用本地紙上狀態。",
        "kill_switch_status 與 broker_heartbeat_status 是模擬紙上 placeholder。",
      ],
      policyKicker: "Policy",
      policyTitle: "Paper-only 風控政策",
      stateKicker: "本地狀態",
      stateTitle: "紙上風控 state snapshot",
      contractKicker: "契約限制",
      contractTitle: "各契約單筆最大數量",
      checksKicker: "Check Names",
      checksTitle: "RiskEvaluation checks 明細 key",
      readOnlyNote:
        "只讀 guardrail 介面。它不送出訂單、不核准執行、不寫資料庫、不呼叫券商、不收集憑證、不啟用實盤，也不提供投資建議。",
      fields: {
        maxExposure: "最大 TX 等值曝險",
        staleQuoteSeconds: "Stale quote seconds",
        priceBand: "Price reasonability band",
        marginProxy: "最大 margin proxy",
        positionLimit: "最大持倉 TX 等值",
        dailyLoss: "最大單日損失",
        dailyLossState: "單日已實現損失狀態",
        positionState: "目前持倉 TX 等值",
        seenIdempotencyKeys: "已記錄 idempotency keys",
        updatedAt: "更新時間",
      },
    },
    paperRiskCrossAccountReadiness: {
      eyebrow: "紙上風控邊界",
      title: "紙上跨帳戶風控 Readiness",
      description:
        "只讀顯示目前 Risk Engine guardrails 仍使用本地紙上狀態。它不是正式跨帳戶風控系統、帳戶層級、保證金 feed 或集中式風控限制服務。",
      fallbackPrefix: "後端跨帳戶風控 readiness 無法取得，正在顯示安全備援資料：",
      statusKicker: "Readiness 狀態",
      statusTitle: "本地紙上風控，尚非跨帳戶風控",
      readinessState: "Readiness state",
      productionCrossAccountRisk: "Production cross-account risk",
      localPaperState: "本地紙上狀態",
      paperGuardrails: "紙上 guardrails",
      capabilitiesKicker: "目前能力",
      capabilitiesTitle: "已實作本地紙上範圍",
      gapsKicker: "非 production 缺口",
      gapsTitle: "尚缺跨帳戶控制",
      currentScopeKicker: "目前範圍",
      currentScopeTitle: "目前已存在內容",
      missingKicker: "缺少控制項",
      missingTitle: "跨帳戶風控所需能力",
      requiredKicker: "Production 前置條件",
      requiredTitle: "必要實作路徑",
      warningsKicker: "警示",
      warningsTitle: "Readiness caveats",
      safetyKicker: "安全旗標",
      safetyTitle: "Paper-only 風控邊界",
      readOnlyNote:
        "只讀 readiness 介面。它不建立訂單、不寫資料庫、不載入真實帳戶資料、不呼叫券商、不收集憑證、不授予 production risk approval，也不提供投資建議。",
      capabilityLabels: {
        local_paper_guardrails_enabled: "local_paper_guardrails_enabled",
        local_paper_state_enabled: "local_paper_state_enabled",
        single_account_demo_state_enabled: "single_account_demo_state_enabled",
        risk_evaluation_detail_enabled: "risk_evaluation_detail_enabled",
        duplicate_idempotency_local_check_enabled:
          "duplicate_idempotency_local_check_enabled",
        cross_account_aggregation_enabled: "cross_account_aggregation_enabled",
        account_hierarchy_enabled: "account_hierarchy_enabled",
        tenant_isolated_risk_state_enabled: "tenant_isolated_risk_state_enabled",
        real_account_margin_feed_enabled: "real_account_margin_feed_enabled",
        broker_position_feed_enabled: "broker_position_feed_enabled",
        centralized_risk_limits_enabled: "centralized_risk_limits_enabled",
        distributed_kill_switch_enabled: "distributed_kill_switch_enabled",
        durable_risk_state_store_enabled: "durable_risk_state_store_enabled",
        real_time_equity_pnl_tracking_enabled:
          "real_time_equity_pnl_tracking_enabled",
        production_cross_account_risk_system:
          "production_cross_account_risk_system",
      },
      safetyLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        external_account_data_loaded: "external_account_data_loaded",
        real_account_data_loaded: "real_account_data_loaded",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        database_written: "database_written",
        hosted_datastore_written: "hosted_datastore_written",
        production_risk_approval: "production_risk_approval",
        production_cross_account_risk: "production_cross_account_risk",
        production_trading_ready: "production_trading_ready",
      },
    },
    paperReliability: {
      eyebrow: "紙上 OMS Reliability",
      title: "紙上 OMS reliability metadata",
      description:
        "只讀檢視本地紙上 OMS metadata：outbox 紀錄、idempotency keys、execution reports、timeout candidates 與明確非 production 缺口。此畫面不處理訂單、不寫紀錄，也不連接券商。",
      fallbackPrefix: "後端紙上 OMS reliability 資料無法取得，正在顯示安全備援資料：",
      statusKicker: "Reliability 狀態",
      statusTitle: "本地紙上 OMS 基礎",
      safetyKicker: "安全旗標",
      safetyTitle: "紙上 reliability 邊界",
      capabilitiesKicker: "本地能力",
      capabilitiesTitle: "已實作 metadata checks",
      gapsKicker: "非 production 缺口",
      gapsTitle: "尚非 production OMS",
      noKnownGaps: "後端未回報 reliability 缺口。",
      outboxKicker: "Outbox Metadata",
      outboxTitle: "最新本地 outbox 紀錄",
      executionReportsKicker: "Execution Reports",
      executionReportsTitle: "最新選取訂單 execution reports",
      timeoutKicker: "Timeout Scan",
      timeoutTitle: "紙上 timeout candidates",
      timeoutActionNote:
        "Timeout handling 是明確的 paper-only 操作。Preview 先驗證本地 EXPIRE metadata；Mark 只寫入本地 SQLite 的 OMS、稽核與 execution-report metadata。",
      timeoutActionReason:
        "Command Center 明確 paper-only timeout mark。不連券商、不啟用實盤，也不是 production OMS 路徑。",
      previewTimeout: "預覽 timeout mark",
      previewing: "預覽中...",
      markTimeout: "本地標記 EXPIRED",
      marking: "標記中...",
      previewReady: "預覽已就緒。",
      markSuccess: "Timeout mark 已寫入本地。",
      actionError: "Timeout action 失敗。",
      actionResultKicker: "Timeout Action",
      actionResultTitle: "紙上 timeout handling 結果",
      outboxItems: "Outbox items",
      idempotencyKeys: "Idempotency keys",
      executionReports: "Execution reports",
      timeoutCandidates: "Timeout candidates",
      latestOrder: "最新選取訂單",
      none: "無",
      emptyOutbox: "目前沒有本地 outbox metadata。",
      emptyExecutionReports: "目前選取訂單沒有 execution reports。",
      emptyTimeouts: "目前沒有紙上 timeout candidates。",
      readOnlyNote:
        "只讀 reliability 介面。它不修改 OMS 狀態、不送出訂單、不處理 outbox workers、不核准執行、不寫資料庫、不呼叫券商、不收集憑證，也不提供投資建議。",
      flagLabels: {
        paper_only: "PAPER_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        production_oms_ready: "PRODUCTION_OMS_READY",
        local_sqlite_only: "LOCAL_SQLITE_ONLY",
        async_order_processing_enabled: "ASYNC_ORDER_PROCESSING",
        durable_outbox_metadata_enabled: "LOCAL_OUTBOX_METADATA",
        duplicate_order_prevention_enabled: "DUPLICATE_ORDER_PREVENTION",
        timeout_candidate_scan_enabled: "TIMEOUT_CANDIDATE_SCAN",
        execution_report_model_enabled: "EXECUTION_REPORT_MODEL",
        amend_replace_enabled: "AMEND_REPLACE",
        reconciliation_loop_enabled: "RECONCILIATION_LOOP",
      },
      fields: {
        outboxId: "Outbox ID",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        idempotencyKey: "Idempotency key",
        action: "Action",
        attempts: "Attempts",
        reportId: "Report ID",
        orderStatus: "Order status",
        lastQuantity: "Last quantity",
        cumulativeFilled: "Cumulative filled",
        leaves: "Leaves",
        timestamp: "Timestamp",
        ageSeconds: "Age seconds",
        timeoutSeconds: "Timeout seconds",
        message: "訊息",
        previousStatus: "前一狀態",
        newStatus: "新狀態",
        persisted: "已持久化",
        eventId: "OMS event ID",
        auditId: "Audit ID",
        paperOnly: "僅限紙上",
        brokerApiCalled: "已呼叫券商 API",
        productionOmsReady: "Production OMS ready",
      },
    },
    paperOmsProductionReadiness: {
      eyebrow: "Paper OMS Readiness",
      title: "Paper OMS 不是 production OMS",
      description:
        "只讀 production readiness boundary。現有系統具備 deterministic paper state transitions 與本地 metadata，但尚未具備 durable async processing、production timeout workers、amend/replace、broker execution report ingestion 或 formal reconciliation。",
      fallbackPrefix: "後端 Paper OMS production readiness 資料無法取得，正在顯示安全備援資料：",
      statusKicker: "Readiness 狀態",
      statusTitle: "目前 production OMS 邊界",
      capabilitiesKicker: "目前紙上能力",
      capabilitiesTitle: "本地紙上骨架",
      gapsKicker: "Production OMS 缺口",
      gapsTitle: "尚未啟用的控制",
      currentScopeKicker: "目前範圍",
      currentScopeTitle: "目前已存在項目",
      missingKicker: "缺少控制",
      missingTitle: "Production OMS 所需項目",
      requiredKicker: "Production OMS 前",
      requiredTitle: "必要實作與審查",
      warningsKicker: "警示",
      warningsTitle: "OMS readiness 備註",
      safetyKicker: "安全旗標",
      safetyTitle: "只讀紙上邊界",
      readinessState: "Readiness state",
      productionOmsReady: "Production OMS ready",
      localSqlite: "本地 SQLite metadata",
      stateMachine: "State machine",
      readOnlyNote:
        "只讀 production OMS readiness 介面。它不送出訂單、不處理 queues、不修改 OMS 狀態、不核准執行、不寫資料庫、不呼叫券商、不收集憑證，並維持實盤關閉。",
      capabilityLabels: {
        order_state_machine_enabled: "ORDER_STATE_MACHINE",
        local_outbox_metadata_enabled: "LOCAL_OUTBOX_METADATA",
        duplicate_idempotency_metadata_enabled: "DUPLICATE_IDEMPOTENCY_METADATA",
        execution_report_metadata_enabled: "EXECUTION_REPORT_METADATA",
        timeout_candidate_scan_enabled: "TIMEOUT_CANDIDATE_SCAN",
        explicit_paper_timeout_mark_enabled: "EXPLICIT_PAPER_TIMEOUT_MARK",
        asynchronous_order_processing_enabled: "ASYNC_ORDER_PROCESSING",
        distributed_durable_queue_enabled: "DISTRIBUTED_DURABLE_QUEUE",
        outbox_worker_enabled: "OUTBOX_WORKER",
        full_timeout_worker_enabled: "FULL_TIMEOUT_WORKER",
        amend_replace_enabled: "AMEND_REPLACE",
        broker_execution_report_ingestion_enabled: "BROKER_EXECUTION_REPORT_INGESTION",
        formal_reconciliation_loop_enabled: "FORMAL_RECONCILIATION_LOOP",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        read_only: "READ_ONLY",
        live_trading_enabled: "LIVE_TRADING_ENABLED",
        broker_api_called: "BROKER_API_CALLED",
        order_created: "ORDER_CREATED",
        credentials_collected: "CREDENTIALS_COLLECTED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        production_oms_ready: "PRODUCTION_OMS_READY",
        live_approval_granted: "LIVE_APPROVAL_GRANTED",
        production_trading_ready: "PRODUCTION_TRADING_READY",
      },
    },
    paperAuditIntegrity: {
      eyebrow: "紙上稽核完整性",
      title: "本地 audit hash-chain 驗證",
      description:
        "只讀驗證本地 SQLite 紙上 audit events。此預覽檢查 stored previous_hash 與 event_hash metadata，但不是 WORM 儲存、集中式稽核、簽章或 production compliance。",
      fallbackPrefix: "後端紙上稽核完整性資料無法取得，正在顯示安全備援資料：",
      statusKicker: "完整性狀態",
      statusTitle: "本地稽核驗證預覽",
      safetyKicker: "安全旗標",
      safetyTitle: "不是 production audit ledger",
      checksKicker: "事件檢查",
      checksTitle: "最新 hash-chain checks",
      gapsKicker: "已知缺口",
      gapsTitle: "非 production audit posture",
      warningsKicker: "警示",
      warningsTitle: "驗證備註",
      verified: "已驗證",
      auditEvents: "Audit events",
      brokenChains: "Broken chains",
      missingHashes: "Missing hashes",
      emptyChecks: "目前沒有可驗證的本地紙上 audit events。",
      checkPassed: "已通過",
      checkFailed: "未通過",
      readOnlyNote:
        "只讀 audit integrity 介面。它不寫資料庫、不修補 chain、不上傳紀錄、不呼叫券商、不收集憑證、不建立訂單、不核准實盤，也不宣稱 WORM / immutable audit compliance。",
      flagLabels: {
        paper_only: "PAPER_ONLY",
        local_sqlite_only: "LOCAL_SQLITE_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        worm_ledger: "WORM_LEDGER",
        immutable_audit_log: "IMMUTABLE_AUDIT_LOG",
        centralized_audit_service: "CENTRALIZED_AUDIT_SERVICE",
        production_audit_compliance: "PRODUCTION_AUDIT_COMPLIANCE",
      },
      fields: {
        workflowRunId: "Workflow run",
        auditId: "Audit ID",
        sequence: "Sequence",
        previousHashValid: "previous_hash valid",
        eventHashValid: "event_hash valid",
        duplicateAuditId: "重複 audit_id",
      },
    },
    paperAuditWormReadiness: {
      eyebrow: "Paper Audit WORM Readiness",
      title: "SQLite audit 不是 production WORM ledger",
      description:
        "只讀稽核儲存 readiness boundary。本地 SQLite 搭配 hash-chain metadata 可用於紙上 demo，但不是 WORM 儲存、immutable ledger、集中式稽核、簽章或 production compliance。",
      fallbackPrefix: "後端 WORM readiness 資料無法取得，正在顯示安全備援資料：",
      statusKicker: "Readiness 狀態",
      statusTitle: "目前稽核儲存邊界",
      storageKicker: "Production WORM 缺口",
      storageTitle: "尚未啟用的控制",
      currentScopeKicker: "目前範圍",
      currentScopeTitle: "目前已存在項目",
      missingKicker: "缺少控制",
      missingTitle: "Production WORM posture 所需項目",
      requiredKicker: "宣稱 WORM 前",
      requiredTitle: "必要審查與實作",
      safetyKicker: "安全旗標",
      safetyTitle: "只讀紙上邊界",
      warningsKicker: "警示",
      warningsTitle: "稽核姿態備註",
      readinessState: "Readiness state",
      localSqlite: "本地 SQLite audit",
      localHashChain: "本地 hash chain",
      wormStorage: "WORM storage",
      readOnlyNote:
        "只讀 WORM readiness 介面。它不寫資料庫、不上傳 audit records、不修補 chain、不呼叫券商、不收集憑證、不建立訂單、不核准實盤，也不宣稱 WORM / immutable audit compliance。",
      storageLabels: {
        worm_storage_enabled: "WORM_STORAGE_ENABLED",
        immutable_ledger_enabled: "IMMUTABLE_LEDGER_ENABLED",
        append_only_enforced_by_storage: "APPEND_ONLY_STORAGE_ENFORCED",
        centralized_audit_service_enabled: "CENTRALIZED_AUDIT_SERVICE_ENABLED",
        object_lock_enabled: "OBJECT_LOCK_ENABLED",
        external_timestamping_enabled: "EXTERNAL_TIMESTAMPING_ENABLED",
        cryptographic_signing_enabled: "CRYPTOGRAPHIC_SIGNING_ENABLED",
        retention_policy_enforced: "RETENTION_POLICY_ENFORCED",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        read_only: "READ_ONLY",
        live_trading_enabled: "LIVE_TRADING_ENABLED",
        broker_api_called: "BROKER_API_CALLED",
        order_created: "ORDER_CREATED",
        credentials_collected: "CREDENTIALS_COLLECTED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        worm_compliance_claim: "WORM_COMPLIANCE_CLAIM",
        production_audit_compliance: "PRODUCTION_AUDIT_COMPLIANCE",
        production_trading_ready: "PRODUCTION_TRADING_READY",
      },
    },
    paperAuditIntegrityEvidence: {
      eyebrow: "Audit Integrity Evidence",
      title: "紙上稽核完整性 evidence viewer",
      description:
        "只讀本地 JSON viewer，用於檢視 scripts/verify-paper-audit-integrity.py 匯出的 evidence。檔案只在此瀏覽器內解析，不會上傳、不會持久化，也不會送往後端 API。",
      currentSource: "目前來源",
      noSource: "尚未載入本地 audit integrity evidence",
      selectFile: "選擇 audit integrity evidence .json",
      initialMessage: "請明確選取本地紙上稽核完整性驗證 JSON，僅在此瀏覽器內檢視。",
      rejectExtension: "拒絕：選取 evidence 檔案必須是 .json。",
      rejectSize: "拒絕：evidence JSON 超過 500 KB。",
      rejectPrefix: "拒絕",
      invalidJson: "拒絕：JSON evidence 格式無效。",
      loadedPrefix: "本地 audit integrity evidence",
      loadedMessage: "已於本機讀取。稽核完整性 evidence 檔案未上傳、未持久化，也未送往後端 API。",
      clearLocalJson: "清除 evidence",
      clearMessage: "已清除本地 audit integrity evidence，沒有後端 mutation。",
      empty:
        "尚未載入本地 audit integrity evidence。請先用 scripts/verify-paper-audit-integrity.py 搭配 --output 匯出，再明確選取 JSON 檔。",
      identityKicker: "Evidence 識別",
      identityTitle: "紙上稽核完整性驗證 evidence",
      summaryKicker: "驗證摘要",
      summaryTitle: "本地 hash-chain 結果",
      safetyKicker: "安全旗標",
      safetyTitle: "僅限紙上的本地驗證",
      checksKicker: "事件檢查",
      checksTitle: "Evidence hash-chain checks",
      warningsKicker: "警示",
      warningsTitle: "驗證備註",
      emptyChecks: "此 evidence 不包含 audit event checks。",
      checkPassed: "已驗證",
      checkFailed: "未通過",
      none: "無",
      readOnlyNote:
        "只讀 evidence viewer。它不上傳檔案、不寫資料庫、不修補 chain、不呼叫券商、不收集憑證、不建立訂單、不核准實盤，也不宣稱 WORM / immutable audit compliance。",
      fields: {
        generatedAt: "產生時間",
        workflowRunId: "Workflow run",
        dbPath: "本地 SQLite 路徑",
        message: "訊息",
        verified: "已驗證",
        auditEvents: "Audit events",
        brokenChains: "Broken chains",
        duplicateAuditIds: "重複 audit IDs",
        auditId: "Audit ID",
        sequence: "Sequence",
        previousHashValid: "previous_hash valid",
        eventHashValid: "event_hash valid",
        duplicateAuditId: "重複 audit_id",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        local_sqlite_only: "LOCAL_SQLITE_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        worm_ledger: "WORM_LEDGER",
        immutable_audit_log: "IMMUTABLE_AUDIT_LOG",
        centralized_audit_service: "CENTRALIZED_AUDIT_SERVICE",
        production_audit_compliance: "PRODUCTION_AUDIT_COMPLIANCE",
        broker_credentials_collected: "BROKER_CREDENTIALS_COLLECTED",
      },
    },
    paperBrokerSimulation: {
      eyebrow: "紙上券商模擬",
      title: "本地 quote-based 模擬預覽",
      description:
        "使用使用者提供的本地 quote 與 liquidity 輸入，預覽 Paper Broker Gateway 可能推導出的紙上結果。此功能不送出訂單、不下載行情、不寫資料庫，也不呼叫券商。",
      paperOnlyBadge: "僅限紙上",
      previewOnlyBadge: "僅限預覽",
      initialMessage: "調整本地 quote 輸入，預覽 paper-only 模擬券商結果。",
      previewing: "正在預覽本地紙上模擬...",
      previewReady: "紙上模擬預覽已就緒。",
      unknownError: "紙上券商模擬預覽失敗。",
      fields: {
        symbol: "契約",
        side: "買賣方向",
        orderType: "委託型態",
        quantity: "數量",
        txEquivalentExposure: "TX 等值曝險",
        limitPrice: "限價",
        bidPrice: "Bid price",
        askPrice: "Ask price",
        lastPrice: "Last price",
        bidSize: "Bid size",
        askSize: "Ask size",
        quoteAgeSeconds: "Quote age seconds",
        liquidityScore: "Liquidity score",
        maxSpreadPoints: "Max spread points",
        staleQuoteSeconds: "Stale quote seconds",
      },
      sideOptions: {
        BUY: "BUY",
        SELL: "SELL",
      },
      orderTypeOptions: {
        MARKET: "MARKET",
        LIMIT: "LIMIT",
      },
      guardrails: [
        "Paper Only：只呼叫 /api/paper-execution/broker-simulation/preview。",
        "輸入僅為使用者提供的本地 quote snapshot；不下載外部行情資料。",
        "此預覽不建立訂單、不寫資料庫、不呼叫 Risk Engine、不呼叫 OMS，也不呼叫真實券商。",
        "這不是 production 撮合引擎、券商 execution report、實盤 liquidity model，也不是交易建議。",
      ],
      preview: "預覽紙上結果",
      resultKicker: "模擬結果",
      resultTitle: "推導出的紙上券商結果",
      none: "無",
      outcomeLabels: {
        acknowledge: "僅 ACK",
        partial_fill: "部分成交",
        fill: "成交",
        reject: "拒單",
        cancel: "取消",
      },
      result: {
        outcome: "結果",
        fillQuantity: "模擬成交數量",
        fillPrice: "模擬成交價格",
        remainingQuantity: "剩餘數量",
        spread: "Spread points",
        availableSize: "Available size",
        reason: "原因",
      },
    },
    paperBrokerSimulationReadiness: {
      eyebrow: "券商模擬 Readiness",
      title: "紙上券商模擬不是真實市場撮合",
      description:
        "針對 deterministic 與本地 quote-based 紙上模擬的只讀邊界。Paper fill 只是模擬 metadata，不是真實市場成交、券商 execution report，也不是 production execution model。",
      fallbackPrefix: "後端紙上券商模擬 readiness 資料不可用。顯示安全 fallback：",
      statusKicker: "Readiness 狀態",
      statusTitle: "目前券商模擬邊界",
      capabilitiesKicker: "目前 Paper 能力",
      capabilitiesTitle: "本地紙上模擬",
      gapsKicker: "Production Execution 缺口",
      gapsTitle: "尚未啟用的控制",
      currentScopeKicker: "目前範圍",
      currentScopeTitle: "現在已存在項目",
      missingKicker: "缺少控制",
      missingTitle: "Production execution model 所需項目",
      requiredKicker: "Production Execution Model 前",
      requiredTitle: "必要實作與審查",
      warningsKicker: "警示",
      warningsTitle: "券商模擬 readiness 備註",
      safetyKicker: "安全旗標",
      safetyTitle: "只讀紙上邊界",
      readinessState: "Readiness state",
      productionExecutionModel: "Production execution model",
      localQuotePreview: "本地 quote preview",
      deterministicSimulation: "Deterministic simulation",
      readOnlyNote:
        "只讀券商模擬 readiness 介面。它不建立訂單、不呼叫 Risk Engine、不呼叫 OMS、不呼叫 Broker Gateway 執行路徑、不寫資料庫、不下載行情、不呼叫券商、不收集憑證，也不宣稱真實成交精準度。",
      capabilityLabels: {
        deterministic_broker_simulation_enabled: "DETERMINISTIC_SIMULATION",
        local_quote_snapshot_preview_enabled: "LOCAL_QUOTE_PREVIEW",
        paper_ack_reject_partial_fill_fill_cancel_enabled: "PAPER_OUTCOMES",
        caller_provided_quote_only: "CALLER_PROVIDED_QUOTE_ONLY",
        real_market_matching_engine_enabled: "REAL_MARKET_MATCHING_ENGINE",
        exchange_order_book_replay_enabled: "EXCHANGE_ORDER_BOOK_REPLAY",
        broker_execution_report_model_enabled: "BROKER_EXECUTION_REPORT_MODEL",
        latency_queue_position_model_enabled: "LATENCY_QUEUE_POSITION_MODEL",
        slippage_liquidity_calibration_enabled: "SLIPPAGE_LIQUIDITY_CALIBRATION",
        real_account_reconciliation_enabled: "REAL_ACCOUNT_RECONCILIATION",
        production_execution_model: "PRODUCTION_EXECUTION_MODEL",
      },
      safetyLabels: {
        paper_only: "PAPER_ONLY",
        read_only: "READ_ONLY",
        live_trading_enabled: "LIVE_TRADING_FLAG",
        broker_api_called: "BROKER_API_CALLED",
        external_market_data_downloaded: "EXTERNAL_MARKET_DATA_DOWNLOADED",
        real_order_created: "REAL_ORDER_CREATED",
        order_created: "ORDER_CREATED",
        credentials_collected: "CREDENTIALS_COLLECTED",
        database_written: "DATABASE_WRITTEN",
        external_db_written: "EXTERNAL_DB_WRITTEN",
        production_execution_model: "PRODUCTION_EXECUTION_MODEL",
        production_trading_ready: "PRODUCTION_TRADING_READY",
      },
    },
    paperBrokerEvidence: {
      eyebrow: "券商模擬 Evidence",
      title: "紙上券商模擬 evidence viewer",
      description:
        "只讀本地 JSON viewer，用於檢視 make paper-broker-simulation-evidence-export 匯出的 evidence。檔案只在此瀏覽器內解析，不會上傳、不會持久化，也不會送往後端 API。",
      currentSource: "目前來源",
      noSource: "尚未載入本地券商模擬 evidence",
      selectFile: "選擇 broker evidence .json",
      initialMessage: "請明確選取本地紙上券商模擬 evidence JSON，僅在此瀏覽器內檢視。",
      rejectExtension: "拒絕：選取 evidence 檔案必須是 .json。",
      rejectSize: "拒絕：evidence JSON 超過 500 KB。",
      rejectPrefix: "拒絕",
      invalidJson: "拒絕：JSON evidence 格式無效。",
      loadedPrefix: "本地 broker evidence",
      loadedMessage: "已於本機讀取。券商模擬 evidence 檔案未上傳、未持久化，也未送往後端 API。",
      clearLocalJson: "清除 evidence",
      clearMessage: "已清除本地券商模擬 evidence，沒有後端 mutation。",
      empty:
        "尚未載入本地券商模擬 evidence。請先用 make paper-broker-simulation-evidence-export 匯出，再明確選取 JSON 檔。",
      identityKicker: "Evidence 識別",
      identityTitle: "紙上券商預覽 evidence",
      inputKicker: "Quote Snapshot",
      inputTitle: "使用者提供的本地輸入",
      resultKicker: "預覽結果",
      resultTitle: "paper-only 模擬結果",
      safetyKicker: "安全旗標",
      safetyTitle: "未使用執行路徑",
      checksKicker: "模型檢查",
      checksTitle: "預覽驗證檢查",
      warningsKicker: "警示",
      warningsTitle: "Evidence review notes",
      none: "無",
      readOnlyNote:
        "只讀 evidence 介面。它不上傳檔案、不寫資料庫、不呼叫券商、不收集憑證、不建立訂單、不呼叫 Risk Engine、不呼叫 OMS、不呼叫 Broker Gateway 執行路徑、不授予實盤核准，也不提供投資建議。",
      fields: {
        evidenceId: "Evidence ID",
        generatedAt: "產生時間",
        persisted: "已持久化",
        symbol: "契約",
        side: "買賣方向",
        orderType: "委託型態",
        quantity: "數量",
        bidPrice: "Bid price",
        askPrice: "Ask price",
        lastPrice: "Last price",
        bidSize: "Bid size",
        askSize: "Ask size",
        quoteAgeSeconds: "Quote age seconds",
        liquidityScore: "Liquidity score",
        simulationOutcome: "模擬結果",
        fillQuantity: "模擬成交數量",
        fillPrice: "模擬成交價格",
        remainingQuantity: "剩餘數量",
        referencePrice: "Reference price",
        spreadPoints: "Spread points",
        availableSize: "Available size",
        reason: "原因",
      },
      safetyLabels: {
        paper_only: "僅限紙上",
        live_trading_enabled: "實盤交易已啟用",
        broker_api_called: "已呼叫券商 API",
        external_market_data_downloaded: "已下載外部行情",
        production_execution_model: "Production execution model",
        database_written: "已寫資料庫",
        order_created: "已建立訂單",
        risk_engine_called: "已呼叫 Risk Engine",
        oms_called: "已呼叫 OMS",
        broker_credentials_collected: "已收集券商憑證",
        investment_advice: "投資建議",
      },
    },
    browserOnlyMockDemo: {
      eyebrow: "Browser-only Mock Runtime",
      title: "瀏覽器內互動 Demo",
      description:
        "完全在瀏覽器內執行 deterministic TX / MTX / TMF 行情，並顯示市場狀態、價差、流動性、quote age 與滑價估計，再串接 signal-only 策略模擬、PaperOrderIntent 風控檢查、OMS 時間線、紙上券商成交模擬與模擬投組指標。它不需要本地後端、不連券商、不寫資料庫、不使用真實資金，也不啟用實盤交易。",
      initialMessage: "Browser-only mock demo 已準備好，不需要後端。",
      restoredMessage: "已從此瀏覽器的本地狀態還原 browser-only mock demo。",
      badges: {
        paperOnly: "Paper Only",
        browserOnly: "Browser-only",
        noBackendRequired: "不需要後端",
        noBroker: "無券商",
        noRealMoney: "無真實資金",
        noLiveTrading: "實盤關閉",
        notAdvice: "不構成投資建議",
      },
      actions: {
        nextTick: "產生下一筆行情",
        runStrategy: "執行模擬策略",
        simulateOrder: "模擬紙上訂單",
        resetSession: "重置瀏覽器 demo",
        clearState: "清除瀏覽器狀態",
        copySummary: "複製 demo 摘要",
        copyEvidence: "複製 evidence JSON",
      },
      messages: {
        tickReady: "下一筆 deterministic browser-only tick 已產生。",
        signalReady: "StrategySignal 已在此瀏覽器產生。策略本身沒有建立訂單。",
        orderReady:
          "紙上訂單模擬已在此瀏覽器完成。沒有使用後端、券商、資料庫或真實委託。",
        resetReady: "Browser-only mock demo 已重置。",
        clearReady: "Browser-only 本地狀態已清除並重置。沒有碰觸後端或資料庫。",
        reviewOmsReady:
          "請檢視下方模擬 OMS lifecycle。這是 browser-only 結果，不是券商成交回報。",
        reviewPortfolioReady:
          "請檢視下方 paper-only 投組與模擬指標。這不是績效主張。",
        summaryCopied: "Demo 摘要已複製到剪貼簿。",
        evidenceCopied: "Browser-only evidence JSON 已複製到剪貼簿。",
        copyFailed: "複製失敗，請從 panel 手動複製數值。",
      },
      guide: {
        eyebrow: "互動導覽",
        title: "完整 Browser-only 操作流程",
        description:
          "依序從行情 tick、策略 signal、Paper Only 訂單、模擬 OMS 到 paper-only 指標完成體驗。每一步都只留在此瀏覽器內。",
        stepListLabel: "Browser-only demo steps",
        activeStepLabel: "步驟",
        expectedLabel: "預期結果",
        resultLabel: "結果說明",
        safetyLabel: "安全邊界",
        nextLabel: "下一步",
        previous: "上一步",
        next: "下一步",
        sessionMetaLabel: "Browser-only session metadata",
        sessionIdLabel: "Session",
        seedLabel: "Seed",
        paperOnlyLabel: "Paper Only",
        browserOnlyLabel: "Browser-only",
        steps: [
          {
            title: "產生行情 tick",
            actionLabel: "產生下一筆行情",
            body:
              "在此瀏覽器內建立下一筆 deterministic TX / MTX / TMF quote snapshot。",
            expected:
              "Bid、ask、last、quote age、quote size 與 liquidity score 會更新，且不下載外部行情。",
            result:
              "Tick 也會顯示 deterministic 市場狀態，例如 normal、trending、volatile、illiquid 或 stale_quote，讓價差與流動性可在不接真實行情下變化。",
            safety:
              "不使用後端、不連券商、不接外部行情、不寫資料庫，也不進入實盤路徑。",
            next: "用選定契約執行僅輸出 signal 的模擬策略。",
          },
          {
            title: "執行模擬策略",
            actionLabel: "執行模擬策略",
            body:
              "根據 deterministic browser price path 產生 StrategySignal。",
            expected:
              "畫面會顯示 direction、target TX-equivalent exposure、confidence 與 signals_only=true。",
            result:
              "Signal 來自 deterministic volatility path，仍只是研究訊號，不是下單指令。",
            safety:
              "策略只輸出 signal，不建立訂單，也不呼叫 Risk / OMS / Broker Gateway。",
            next: "將 signal 轉成平台擁有的 PaperOrderIntent 模擬。",
          },
          {
            title: "模擬 Paper Only 訂單",
            actionLabel: "模擬紙上訂單",
            body:
              "執行瀏覽器本地 paper risk checks 與模擬 OMS / paper fill 路徑。",
            expected:
              "Workflow 會顯示 risk approval 或 rejection、OMS status、fill quantity、fill price 與 remaining quantity。",
            result:
              "成交模型會使用價差、流動性、quote age 與 deterministic slippage 解釋 filled、partial、stale quote reject 或 illiquid reject。",
            safety:
              "不建立真實委託、不送券商請求、不寫資料庫，也不產生 live approval。",
            next: "檢視模擬 OMS lifecycle。",
          },
          {
            title: "檢視 OMS 時間線",
            actionLabel: "檢視 OMS 時間線",
            body:
              "檢查 CREATE、RISK_CHECK、SUBMIT、ACCEPT、FILL、PARTIAL_FILL 或 REJECT transitions。",
            expected:
              "Timeline 會說明 paper workflow 如何通過模擬 OMS 狀態。",
            result:
              "每個 OMS event 都會附上原因，包括是否因流動性足夠而成交，或因 stale / illiquid 條件被拒絕。",
            safety:
              "這些是瀏覽器本地 demo events，不是交易所或券商 execution reports。",
            next: "檢視 paper-only position 與 simulated PnL。",
          },
          {
            title: "檢視模擬持倉 / PnL",
            actionLabel: "檢視模擬指標",
            body:
              "檢查 paper position、average price、unrealized PnL 與 paper equity。",
            expected:
              "Portfolio summary 會根據 deterministic mock fills 與目前 browser tick 更新。",
            result:
              "Paper-only 指標會依目前 deterministic mark price 更新，複製 evidence 時也會包含 market realism metadata。",
            safety:
              "Simulated PnL 只用於產品 workflow 展示，不構成投資建議或績效主張。",
            next: "重置 demo session，或複製 evidence JSON 供 reviewer 做筆記。",
          },
          {
            title: "重置 demo session",
            actionLabel: "重置瀏覽器 demo",
            body:
              "把瀏覽器本地 session 清回安全初始狀態。",
            expected:
              "Tick、signal、order、OMS、position 與模擬指標會回到初始 paper-only 狀態。",
            result:
              "Session 會回到同一個 deterministic seed，reviewer 可以重複檢查市場狀態與成交模型。",
            safety:
              "Reset 只影響此瀏覽器的本地 demo state，不刪除後端或資料庫紀錄。",
            next: "Reviewer 若要重複體驗，可重新從產生行情 tick 開始。",
          },
        ],
      },
      visualization: {
        eyebrow: "Visualization Layer",
        title: "市場路徑、微結構、訂單結果與紙上 PnL",
        description:
          "把 browser-only demo 轉成可視化證據：deterministic price path、bid / ask band、市場狀態條、價差、流動性、quote age、滑價估計、紙上訂單結果與模擬 PnL。",
        pricePathKicker: "價格路徑",
        pricePathTitle: "Deterministic TX / MTX / TMF market path",
        priceChartLabel: "Browser-only deterministic price path with bid and ask band",
        regimeStripLabel: "Market regime strip",
        latestSnapshot: "最新可視化 snapshot",
        microstructureKicker: "市場微結構",
        microstructureTitle: "價差 / 流動性 / quote age / 滑價",
        microstructureNote:
          "這些長條都是 deterministic mock data，不是外部行情，也不代表真實流動性。",
        orderOutcomeKicker: "訂單結果",
        orderOutcomeTitle: "紙上成交 / 部分成交 / 拒單視覺化",
        orderRailLabel: "Paper order simulated fill versus remaining quantity",
        noOrderYet:
          "模擬 Paper Only 訂單後，即可視覺化成交數量、剩餘數量與成交原因。",
        portfolioKicker: "紙上投組",
        portfolioTitle: "持倉與模擬 PnL snapshot",
        fields: {
          currentTick: "目前 tick",
          tick: "Tick",
          marketRegime: "市場狀態",
          spread: "價差",
          liquidity: "流動性分數",
          quoteAge: "Quote age",
          slippage: "滑價估計",
          outcome: "結果",
          fillQuantity: "成交數量",
          fillReason: "成交原因",
          position: "持倉",
          unrealizedPnl: "未實現 PnL",
          equity: "紙上權益",
        },
        safety: {
          browserOnly: "Browser-only",
          noExternalData: "不下載外部行情",
          noBroker: "無券商",
          noRealOrder: "無真實委託",
        },
      },
      sections: {
        sessionKicker: "Session",
        sessionTitle: "瀏覽器本地 demo state",
        marketKicker: "行情資料",
        marketTitle: "瀏覽器 deterministic 價格路徑",
        regimeLegend: "市場狀態：normal、trending、volatile、illiquid、stale_quote。",
        signalKicker: "策略",
        signalTitle: "僅輸出 signal 的策略結果",
        orderKicker: "紙上訂單",
        orderTitle: "Browser-only 紙上 workflow 結果",
        realismKicker: "市場真實度",
        realismTitle: "價差、流動性、quote age 與滑價模型",
        performanceKicker: "模擬指標",
        performanceTitle: "Paper-only 投組與 PnL",
        omsKicker: "OMS",
        omsTitle: "模擬 OMS lifecycle",
        timelineKicker: "Demo 時間線",
        timelineTitle: "瀏覽器 session events",
        safetyKicker: "安全旗標",
        safetyTitle: "Browser-only safety flags",
        warningsKicker: "警示",
        warningsTitle: "Demo 邊界",
      },
      fields: {
        symbol: "契約",
        quantity: "數量",
        tick: "Tick",
        sessionId: "Session ID",
        mockSeed: "Deterministic mock seed",
        storageKey: "localStorage key",
        bid: "Bid",
        ask: "Ask",
        marketRegime: "市場狀態",
        spread: "價差",
        last: "Last",
        change: "變動",
        quoteAge: "Quote age",
        liquidity: "流動性分數",
        volatility: "波動路徑",
        activeSnapshot: "目前 snapshot",
        signalId: "Signal ID",
        direction: "方向",
        targetExposure: "目標 TX-equivalent exposure",
        confidence: "信心值",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        riskApproved: "Risk approved",
        omsStatus: "OMS status",
        fillQuantity: "模擬成交數量",
        fillPrice: "模擬成交價格",
        remainingQuantity: "剩餘數量",
        slippage: "滑價估計",
        fillReason: "成交原因",
        position: "持倉",
        averagePrice: "平均價格",
        unrealizedPnl: "未實現 PnL",
        equity: "紙上權益",
        performanceClaim: "績效主張",
      },
      emptySignal: "先產生行情並執行模擬策略，即可看到 StrategySignal。",
      emptyOrder: "執行策略後，再模擬紙上訂單，即可看到 Risk / OMS / paper fill 結果。",
      readOnlyNote:
        "此 runtime 只使用瀏覽器本地狀態與 localStorage。它不上傳資料、不寫資料庫、不呼叫券商、不建立真實委託，實盤維持關閉。",
      summary: {
        title: "Browser-only mock demo 摘要",
        safetyLine:
          "Paper Only；browser-only；deterministic market realism；不下載外部行情；不需要後端；無券商；無真實資金；實盤關閉；不構成投資建議；不是績效主張。",
      },
    },
    mockBackendDemo: {
      eyebrow: "模擬後端",
      title: "Mock Backend Demo MVP",
      description:
        "執行 deterministic mock market data、signal-only 策略模擬、PaperOrderIntent 風控檢查、OMS lifecycle、紙上券商模擬與 paper-only portfolio summary。它不連券商、不使用真實資金、不下載外部行情，也不啟用實盤交易。",
      initialMessage: "Mock Backend 已準備好進行 Paper Only demo。",
      readyMessage: "Mock Backend 狀態已載入。所有資料都是 deterministic demo data。",
      backendUnavailable:
        "Mock Backend 目前無法連線。請啟動本地 backend 後再操作此 demo panel。",
      unknownError: "Mock Backend 操作失敗。",
      badges: {
        paperOnly: "Paper Only",
        mockBackend: "Mock Backend",
        noBroker: "無券商",
        noRealMoney: "無真實資金",
        noLiveTrading: "實盤關閉",
        notAdvice: "不構成投資建議",
      },
      actions: {
        nextTick: "產生下一筆行情",
        runStrategy: "執行模擬策略",
        simulateOrder: "模擬紙上訂單",
        resetSession: "重置 demo session",
      },
      messages: {
        generatingTick: "正在產生 deterministic mock tick...",
        tickReady: "下一筆 deterministic mock tick 已產生。",
        runningStrategy: "正在執行 signal-only 模擬策略...",
        signalReady: "StrategySignal 已產生。策略本身沒有建立訂單。",
        simulatingOrder: "正在透過 Risk Engine、OMS 與 Paper Broker Gateway 模擬紙上訂單...",
        orderReady: "紙上訂單模擬完成。沒有建立真實委託。",
        resetting: "正在重置本地 mock demo session...",
        resetReady: "Mock demo session 已重置。",
      },
      sections: {
        marketKicker: "行情資料",
        marketTitle: "Deterministic TX / MTX / TMF 價格路徑",
        signalKicker: "策略",
        signalTitle: "僅輸出 signal 的策略結果",
        orderKicker: "紙上訂單",
        orderTitle: "紙上 workflow 結果",
        portfolioKicker: "投組",
        portfolioTitle: "Paper-only 帳戶摘要",
        omsKicker: "OMS",
        omsTitle: "模擬 OMS 時間線",
        safetyKicker: "安全旗標",
        safetyTitle: "Mock backend safety flags",
        warningsKicker: "警示",
        warningsTitle: "Demo 邊界",
      },
      fields: {
        symbol: "契約",
        quantity: "數量",
        tick: "Tick",
        bid: "Bid",
        ask: "Ask",
        last: "Last",
        change: "變動",
        quoteAge: "Quote age",
        activeSnapshot: "目前快照",
        signalId: "Signal ID",
        direction: "方向",
        targetExposure: "目標 TX 等值曝險",
        confidence: "信心分數",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        riskApproved: "風控通過",
        omsStatus: "OMS 狀態",
        fillQuantity: "模擬成交數量",
        position: "持倉",
        averagePrice: "平均價格",
        unrealizedPnl: "未實現損益",
        equity: "紙上權益",
      },
      emptySignal: "執行模擬策略即可產生 StrategySignal。",
      emptyOrder: "模擬紙上訂單即可檢視 OMS 與投組輸出。",
      readOnlyNote:
        "此 panel 只呼叫 /api/mock-backend/* endpoints。不收集憑證、不寫 production data、不呼叫真實券商、不建立真實委託，也不提供投資建議。",
    },
    paperSubmit: {
      eyebrow: "受控紙上送出",
      title: "建立紙上模擬紀錄",
      description:
        "只有在選取的 persisted approval_request_id 已完成必要審批順序後，才會透過後端 workflow record API 建立一筆 Paper Only 模擬。它不提供實盤核准、不能收集憑證，也不會呼叫真實券商。",
      paperOnlyBadge: "Paper Only submit",
      approvalRequiredBadge: "必須引用已持久化審批",
      defaultReason: "受控客戶 demo：僅限紙上模擬。",
      fields: {
        approvalRequestId: "已持久化 approval request",
        direction: "訊號方向",
        symbol: "契約",
        quantity: "數量",
        targetExposure: "目標 TX 等值曝險",
        brokerSimulation: "紙上券商結果",
        approvalDecision: "審批決策",
        approvalReason: "稽核原因",
      },
      noApprovedRequests: "目前沒有已核准的紙上 approval request",
      missingApproval:
        "必須先有 persisted approval_request_id 達到 approved_for_paper_simulation，才能送出紙上模擬。",
      directionOptions: {
        LONG: "LONG",
        SHORT: "SHORT",
      },
      simulationOptions: {
        acknowledge: "僅 ACK",
        partial_fill: "部分成交",
        fill: "成交",
        reject: "拒單",
        cancel: "取消",
      },
      guardrails: [
        "Paper Only：只以 persisted approval_request_id 呼叫 /api/paper-execution/workflow/record。",
        "選取的 approval request 必須已經在本地審批佇列中達到 approved_for_paper_simulation。",
        "StrategySignal 仍是已核准的訊號 payload，不能直接呼叫券商、Risk Engine 或 OMS。",
        "不提供實盤核准、不上傳憑證、不登入帳戶，也不連接真實券商。",
      ],
      approvalContext: {
        strategy: "已核准策略",
        requiredSequence: "必要審批順序",
        latestHash: "最新審批鏈 hash",
      },
      submit: "建立紙上模擬",
      submitting: "正在建立紙上模擬...",
      refreshRecords: "重新整理紀錄",
      success: "已於本地記錄紙上模擬。重新整理紀錄即可查看 OMS 與稽核時間線。",
      unknownError: "紙上模擬失敗。",
      resultKicker: "紙上結果",
      resultTitle: "已記錄 workflow 摘要",
      result: {
        workflowRunId: "Workflow run",
        approvalRequestId: "Approval request",
        orderId: "Order ID",
        finalStatus: "最終 OMS 狀態",
        persistence: "已持久化",
        brokerMessage: "紙上券商訊息",
      },
    },
    paperApprovalRequest: {
      eyebrow: "紙上審批請求",
      title: "建立紙上 approval request",
      description:
        "針對 StrategySignal 建立一筆本地 approval request。這是覆核 workflow 的 Paper Only 起點，不建立訂單、不呼叫 Risk Engine、不呼叫 OMS、不收集憑證，也不連接券商。",
      paperOnlyBadge: "僅限紙上請求",
      noOrderBadge: "不建立訂單",
      defaultReason: "客戶 demo request：僅供紙上模擬覆核。",
      fields: {
        strategyId: "Strategy ID",
        strategyVersion: "策略版本",
        signalId: "Signal ID",
        direction: "訊號方向",
        targetExposure: "目標 TX 等值曝險",
        confidence: "信心值",
        stopDistance: "停損距離點數",
        requesterId: "Requester ID",
        requestReason: "請求原因",
      },
      guardrails: [
        "Paper Only：只呼叫 /api/paper-execution/approvals/requests。",
        "建立 request 後初始狀態為 pending_review，不會建立覆核人決策。",
        "StrategySignal 仍只輸出訊號，不直接呼叫 Risk Engine、OMS、Broker Gateway 或券商。",
        "此步驟不提供實盤核准、不上傳憑證、不登入帳戶、不連接券商、不建立紙上模擬，也不建立真實委託。",
      ],
      submit: "建立 approval request",
      submitting: "正在建立 approval request...",
      refreshQueue: "重新整理佇列",
      success:
        "已於本地建立紙上 approval request。審批佇列已重新整理，可接續覆核決策。",
      unknownError: "紙上 approval request 建立失敗。",
      resultKicker: "請求結果",
      resultTitle: "已建立 approval request",
      result: {
        approvalRequestId: "Approval request",
        currentStatus: "目前狀態",
        strategy: "策略",
        signal: "訊號",
        paperOnly: "僅限紙上",
        latestHash: "最新鏈 hash",
      },
    },
    paperApprovalDecision: {
      eyebrow: "紙上審批決策",
      title: "記錄紙上覆核決策",
      description:
        "針對既有本地 approval request 建立一筆覆核人決策。此表單僅限紙上，僅寫入本地審批決策紀錄，不建立訂單、不收集憑證，也不呼叫券商。",
      paperOnlyBadge: "僅限紙上決策",
      noCredentialsBadge: "不收集憑證",
      defaultReason: "本地紙上 review decision，用於受控模擬評估。",
      noActionableRequests:
        "目前沒有可操作的 approval request。請先建立本地紙上 approval request，再記錄覆核人決策。",
      fields: {
        approvalRequestId: "Approval request",
        currentStatus: "目前狀態",
        decision: "覆核決策",
        reviewerRole: "覆核角色",
        reviewerId: "Reviewer ID",
        decisionReason: "決策原因",
      },
      decisionLabels: {
        research_approved: "研究已通過",
        approved_for_paper_simulation: "核准紙上模擬",
        rejected: "拒絕",
        needs_data_review: "需要資料審查",
      },
      roleLabels: {
        research_reviewer: "研究覆核人",
        risk_reviewer: "風控覆核人",
        compliance_reviewer: "合規覆核人",
      },
      context: {
        strategy: "策略",
        signal: "訊號",
        requiredSequence: "必要審批順序",
        latestHash: "最新審批鏈 hash",
      },
      guardrails: [
        "Paper Only：只針對既有 approval_request_id 呼叫本地審批決策 endpoint。",
        "此表單只記錄覆核人決策；它本身不建立紙上模擬、訂單或紙上執行核准。",
        "雙人覆核仍需要不同 reviewer ID，且後端會驗證必要順序。",
        "不提供實盤核准、不上傳憑證、不登入帳戶、不連接券商，也不建立真實委託路徑。",
      ],
      submit: "記錄決策",
      submitting: "正在記錄決策...",
      refreshQueue: "重新整理佇列",
      success: "已於本地記錄紙上覆核決策。受控紙上送出前請重新整理佇列。",
      unknownError: "紙上覆核決策失敗。",
      resultKicker: "決策結果",
      resultTitle: "已更新 approval request",
      result: {
        approvalRequestId: "Approval request",
        currentStatus: "目前狀態",
        decisionCount: "決策數",
        paperSimulationApproved: "已核准紙上模擬",
        latestHash: "最新鏈 hash",
      },
    },
    paperApprovals: {
      eyebrow: "紙上審批佇列",
      title: "紙上審批佇列與歷史",
      description:
        "只讀檢視已持久化的紙上審批請求、覆核人歷史、必要審批順序、雜湊鏈參考與安全旗標。此面板不送出決策、不核准執行、不收集憑證，也不呼叫券商。",
      fallbackPrefix: "後端紙上審批資料無法取得，正在顯示安全備援資料：",
      statusKicker: "審批狀態",
      statusTitle: "本地紙上治理狀態",
      queueKicker: "待審佇列",
      queueTitle: "待審 approval requests",
      historyKicker: "覆核人歷史",
      historyTitle: "審批歷史與雜湊鏈參考",
      emptyQueue: "目前沒有待審的紙上 approval request。",
      emptyHistory: "目前沒有紙上審批歷史。",
      approvalMode: "審批模式",
      reviewerRoles: "覆核人角色",
      supportedDecisions: "支援決策",
      recordPolicy: "紀錄政策",
      dualReview: "DUAL_REVIEW_REQUIRED",
      brokerApiCalled: "BROKER_API_CALLED",
      strategy: "策略",
      signal: "訊號",
      requiredSequence: "必要審批順序",
      createdAt: "建立時間",
      pendingSecondReview: "等待第二覆核",
      reviewer: "覆核人",
      reason: "原因",
      hashChain: "雜湊鏈參考",
      requestHash: "Request hash",
      latestHash: "Latest chain hash",
      previousHash: "Previous chain hash",
      decisionHash: "Decision hash",
      noDecisions: "尚未記錄覆核人決策。",
      safetyFlags: "紙上審批安全旗標",
      paperOnly: "PAPER_ONLY",
      noLiveApproval: "APPROVAL_FOR_LIVE",
      executionEligible: "LIVE_EXECUTION_ELIGIBLE",
      readOnlyNote:
        "只讀審批介面。它不建立 approval request、不送出覆核決策、不寫資料庫、不呼叫券商、不收集憑證、不建立訂單，也不授予實盤交易權限。",
    },
    paperComplianceApprovalReadiness: {
      eyebrow: "合規審批邊界",
      title: "本地紙上骨架，不是正式合規審批",
      description:
        "只讀檢視目前 approval workflow 仍是本地 Paper Only scaffolding。它不是正式合規審批系統，本身不授予紙上執行或實盤核准。",
      fallbackPrefix: "後端紙上合規審批 readiness 無法取得，正在顯示安全備援資料：",
      endpointLabel: "只讀 endpoint",
      stateLabel: "就緒狀態",
      scaffoldingLabel: "審批骨架",
      auditLabel: "稽核姿態",
      safetyDefaultsLabel: "安全預設",
      currentScopeLabel: "目前本地紙上範圍",
      missingLabel: "正式合規審批缺口",
      requiredLabel: "正式審批前必要條件",
      safetyFlagsLabel: "安全旗標",
      decisionsLabel: "紙上決策",
      warningLabel: "邊界警示",
      scaffoldingLabels: {
        local_paper_approval_queue_enabled: "本地紙上審批佇列已啟用",
        local_sqlite_persistence_enabled: "本地 SQLite 持久化已啟用",
        local_dual_review_rule_enabled: "本地雙人覆核規則已啟用",
        formal_compliance_approval_enabled: "正式合規審批已啟用",
        production_approval_authority: "Production approval authority",
        reviewer_identity_verified: "Reviewer identity 已驗證",
        rbac_abac_enforced: "RBAC/ABAC 已強制執行",
        segregation_of_duties_enforced: "職責分離已強制執行",
        compliance_policy_engine_enabled: "Compliance policy engine 已啟用",
        approval_policy_versioning_enabled: "Approval policy versioning 已啟用",
        tenant_scoped_approval_records_enabled: "Tenant-scoped approval records 已啟用",
        legal_retention_policy_enforced: "Legal retention policy 已強制執行",
      },
      auditLabels: {
        local_hash_chain_enabled: "本地 hash-chain 已啟用",
        worm_ledger_enabled: "WORM ledger 已啟用",
        immutable_audit_log_enabled: "Immutable audit log 已啟用",
        centralized_audit_service_enabled: "Centralized audit service 已啟用",
        signed_approval_records_enabled: "Signed approval records 已啟用",
        external_timestamping_enabled: "External timestamping 已啟用",
        retention_policy_enforced: "Retention policy 已強制執行",
        production_compliance_archive_enabled: "Production compliance archive 已啟用",
      },
      currentScopeLabels: {
        "Local Paper Only approval queue and history for demos and technical testing.":
          "用於 demo 與技術測試的本地 Paper Only approval queue 與 history。",
        "Local SQLite persistence with hash-chain references for paper approval decisions.":
          "針對紙上 approval decisions 的本地 SQLite persistence 與 hash-chain references。",
        "Controlled Paper Submit can reference a persisted approval_request_id.":
          "Controlled Paper Submit 可引用已持久化的 approval_request_id。",
        "Web Command Center can create local paper requests and decisions for paper simulation only.":
          "Web Command Center 僅可為紙上模擬建立本地 paper requests 與 decisions。",
      },
      missingLabels: {
        "Real reviewer login and verified reviewer identity.":
          "真實 reviewer login 與已驗證 reviewer identity。",
        "Formal RBAC/ABAC enforcement for approval authority.":
          "針對 approval authority 的正式 RBAC/ABAC enforcement。",
        "Tenant-scoped customer accounts and hosted approval records.":
          "Tenant-scoped customer accounts 與 hosted approval records。",
        "Compliance policy engine with versioned approval rules.":
          "具備 versioned approval rules 的 compliance policy engine。",
        "Segregation of duties enforced by identity and authorization controls.":
          "由 identity 與 authorization controls 強制執行的職責分離。",
        "Immutable WORM ledger or centralized compliance audit service.":
          "Immutable WORM ledger 或 centralized compliance audit service。",
        "Signed approval records, external timestamping, and retention policy enforcement.":
          "Signed approval records、external timestamping 與 retention policy enforcement。",
        "Legal, regulatory, security, and operations review for customer-facing approval workflows.":
          "針對 customer-facing approval workflows 的 legal、regulatory、security 與 operations review。",
      },
      requiredLabels: {
        "Select and review an authentication provider.":
          "選擇並審查 authentication provider。",
        "Implement reviewer identity, session lifecycle, MFA, and logout behavior.":
          "實作 reviewer identity、session lifecycle、MFA 與 logout behavior。",
        "Implement tenant-scoped customer accounts and membership records.":
          "實作 tenant-scoped customer accounts 與 membership records。",
        "Enforce RBAC/ABAC for reviewer, risk, compliance, and paper operator roles.":
          "針對 reviewer、risk、compliance 與 paper operator roles 強制 RBAC/ABAC。",
        "Define and version compliance approval policies.":
          "定義並版本化 compliance approval policies。",
        "Implement WORM or centralized immutable audit storage.":
          "實作 WORM 或 centralized immutable audit storage。",
        "Implement signed approval records and tamper-evident export.":
          "實作 signed approval records 與 tamper-evident export。",
        "Complete legal/regulatory review before presenting any approval as formal compliance approval.":
          "任何 approval 被呈現為正式合規審批前，必須完成 legal/regulatory review。",
      },
      safetyFlagLabels: {
        paper_only: "paper_only",
        read_only: "read_only",
        live_trading_enabled: "live_trading_enabled",
        broker_provider: "broker_provider",
        broker_api_called: "broker_api_called",
        order_created: "order_created",
        credentials_collected: "credentials_collected",
        broker_credentials_collected: "broker_credentials_collected",
        database_written: "database_written",
        external_db_written: "external_db_written",
        production_compliance_approval: "production_compliance_approval",
        live_approval_granted: "live_approval_granted",
        paper_execution_approval_granted: "paper_execution_approval_granted",
        production_trading_ready: "production_trading_ready",
      },
      warningLabels: {
        "This endpoint is read-only compliance approval readiness metadata only.":
          "此 endpoint 僅為只讀 compliance approval readiness metadata。",
        "The local paper approval workflow is not formal compliance approval, not legal approval, and not live trading approval.":
          "本地 paper approval workflow 不是正式合規審批、不是法律核准，也不是實盤核准。",
        "It does not enable live trading, write databases, collect credentials, call brokers, or create orders.":
          "它不啟用實盤、不寫資料庫、不收集憑證、不呼叫券商，也不建立訂單。",
        "Production Trading Platform remains NOT READY.":
          "Production Trading Platform 仍為 NOT READY。",
      },
    },
    paperRecords: {
      eyebrow: "紙上 OMS / 稽核",
      title: "已持久化紙上流程紀錄",
      description:
        "只讀檢視本地 SQLite 中的紙上 workflow runs、OMS events 與 audit events。此畫面不建立紀錄、不送出模擬、不連接券商，也不提供實盤控制。",
      fallbackPrefix: "後端紙上紀錄查詢無法取得，正在顯示安全空狀態：",
      runsKicker: "紙上紀錄",
      runsTitle: "最新持久化 workflow",
      selectedKicker: "選取流程",
      selectedTitle: "稽核上下文",
      empty: "目前沒有可用的本地紙上 workflow 紀錄。",
      noSelectedRun: "目前沒有選取 workflow run。",
      workflowRunId: "Workflow run",
      approvalId: "審核 ID",
      approvalDecision: "審核決策",
      orderId: "Order ID",
      finalStatus: "最終 OMS 狀態",
      sourceSignal: "來源訊號",
      strategy: "策略",
      paperOnly: "僅限紙上",
      brokerApiCalled: "已呼叫券商 API",
      none: "無",
      readOnlyNote:
        "只讀稽核介面。它不寫入資料庫、不修改持久化紀錄、不呼叫券商、不建立訂單、不升級審批，也不提供交易建議。",
      selectRun: "選取流程",
      copyWorkflow: "複製 workflow ID",
      copyOrder: "複製 order ID",
      copied: "已複製",
      copyFailed: "複製失敗，請手動複製 ID。",
      refreshTimelines: "重新整理時間線",
      timelineLoading: "時間線載入中",
      timelineReady: "時間線已就緒",
      timelineError: "無法載入紙上時間線。",
    },
    paperEvidence: {
      eyebrow: "Demo Evidence",
      title: "紙上 demo evidence viewer",
      description:
        "只讀本地 JSON viewer，用於檢視 make paper-demo-evidence-export 匯出的 evidence。檔案只在此瀏覽器內解析，不會上傳、不會持久化，也不會送往後端 API。",
      currentSource: "目前來源",
      noSource: "尚未載入本地 evidence",
      selectFile: "選擇 evidence .json",
      initialMessage: "請明確選取本地紙上 demo evidence JSON，僅在此瀏覽器內檢視。",
      rejectExtension: "拒絕：選取 evidence 檔案必須是 .json。",
      rejectSize: "拒絕：evidence JSON 超過 500 KB。",
      rejectPrefix: "拒絕",
      invalidJson: "拒絕：JSON evidence 格式無效。",
      loadedPrefix: "本地 evidence",
      loadedMessage: "已於本機讀取。Evidence 檔案未上傳、未持久化，也未送往後端 API。",
      clearLocalJson: "清除 evidence",
      clearMessage: "已清除本地 evidence，沒有後端 mutation。",
      empty:
        "尚未載入本地 demo evidence。請先用 make paper-demo-evidence-export 匯出，再明確選取 JSON 檔。",
      identityKicker: "Evidence 識別",
      identityTitle: "紙上 workflow evidence",
      decisionsKicker: "覆核決策",
      decisionsTitle: "審批決策軌跡",
      safetyKicker: "安全旗標",
      safetyTitle: "紙上 evidence 檢查",
      warningsKicker: "警示",
      warningsTitle: "Evidence review notes",
      readOnlyNote:
        "只讀 evidence 介面。它不上傳檔案、不寫資料庫、不呼叫券商、不收集憑證、不建立訂單、不授予實盤核准，也不提供投資建議。",
      fields: {
        approvalRequestId: "Approval request",
        workflowRunId: "Workflow run",
        orderId: "Order ID",
        finalStatus: "最終 OMS 狀態",
        omsEventCount: "OMS 事件數",
        auditEventCount: "稽核事件數",
        localSqlitePath: "本地 SQLite 路徑",
        generatedAt: "產生時間",
        reviewer: "覆核人",
        reviewerRole: "覆核角色",
        decidedAt: "決策時間",
        decisionHash: "Decision hash",
      },
      safetyLabels: {
        paper_only: "僅限紙上",
        live_trading_enabled: "實盤交易已啟用",
        broker_api_called: "已呼叫券商 API",
        paper_broker_gateway_called: "已呼叫 Paper Broker Gateway",
        local_sqlite_only: "僅限本地 SQLite",
        external_db_written: "已寫外部 DB",
        broker_credentials_collected: "已收集券商憑證",
        real_order_created: "已建立真實委託",
        approval_for_live: "實盤核准",
        investment_advice: "投資建議",
      },
    },
    paperOmsTimeline: {
      kicker: "OMS 時間線",
      title: "紙上委託生命週期",
      empty: "選取的紙上 workflow 目前沒有 OMS events。",
      orderId: "Order ID",
      timestamp: "時間",
      reason: "原因",
    },
    paperAuditTimeline: {
      kicker: "稽核時間線",
      title: "紙上 workflow 稽核事件",
      empty: "選取的紙上 workflow 目前沒有 audit events。",
      actor: "Actor",
      resource: "Resource",
      timestamp: "時間",
      paperOnly: "僅限紙上",
    },
    release: {
      eyebrow: "版本基準",
      title: "v0.1.0 紙上研究預覽",
      fallbackPrefix: "後端版本基準無法取得，正在顯示內建安全備援資料：",
      currentTag: "目前標籤",
      description:
        "此基準可作為對外展示、內部 demo 與紙上研究預覽；它不是正式實盤交易版本。",
      releaseLevel: "版本層級",
      safetyDefaults: "安全預設",
      validation: "驗證狀態",
      knownGaps: "非正式上線缺口",
      levelLabels: {
        marketing_website: "官方網站",
        web_command_center: "Web 指揮中心",
        paper_research_preview: "紙上研究預覽",
        production_trading_platform: "正式交易平台",
      },
      statusLabels: {
        "external presentation candidate": "對外展示候選",
        "internal demo candidate": "內部 demo 候選",
        "internal technical preview": "內部技術預覽",
        "NOT READY": "NOT READY（尚未達正式交易上線標準）",
      },
      validationLabels: {
        release_readiness_check: "release-readiness-check",
        make_check: "make check",
        github_actions_release_gate: "GitHub Actions release gate",
      },
      validationStatusLabels: {
        passed: "通過",
      },
      gapLabels: {
        "No production trading path exists.": "目前不存在正式實盤交易路徑。",
        "No real broker adapter exists.": "目前不存在真實券商 adapter。",
        "No live execution path exists.": "目前不存在實盤執行路徑。",
        "Data platform is based on local fixtures, dry-run validation, and schema scaffolding.":
          "資料平台目前以本地 fixtures、dry-run 驗證與 schema 骨架為主。",
        "Backtest outputs are simulated research artifacts, not performance reports.":
          "回測輸出是模擬研究 artifact，不是績效報告。",
        "Web Command Center is read-only for research review packet inspection.":
          "Web 指揮中心目前只讀，用於檢視研究審核 packet。",
      },
    },
    packetLoader: {
      localJsonKicker: "本地 JSON",
      title: "研究 packet 來源",
      currentSource: "目前來源",
      backendSample: "後端範例",
      fallbackSample: "備援範例",
      selectFile: "選擇本地 .json",
      initialMessage: "請明確選取本地 .json packet，僅在此瀏覽器內檢視。",
      rejectExtension: "拒絕：選取檔案必須是 .json packet。",
      rejectSize: "拒絕：packet metadata JSON 超過 500 KB。",
      rejectPrefix: "拒絕",
      loadedPrefix: "本地 JSON",
      loadedMessage: "已於本機讀取。檔案未上傳、未持久化，也未送往後端 API。",
      invalidJson: "拒絕：JSON packet 格式無效。",
      bundledSample: "內建安全範例",
      loadBundledSample: "載入安全範例",
      bundledMessage:
        "已載入內建安全範例。沒有上傳、沒有寫資料庫、沒有呼叫券商，也沒有後端 mutation。",
      clearLocalJson: "清除本地 JSON",
      clearMessage: "已清除本地 JSON 選取，改回後端範例或已檢查的備援資料。",
    },
    packet: {
      eyebrow: "研究審核 Packet",
      title: "只讀 reviewer handoff",
      fallbackPrefix: "後端範例 packet 無法取得，正在顯示 paper-safe 備援資料：",
      identityKicker: "Packet 識別",
      packetId: "Packet ID",
      reviewQueue: "審核 Queue",
      decisionIndex: "決策 Index",
      bundles: "Bundle 數",
      sectionsKicker: "區段",
      sectionsTitle: "已包含 metadata",
      checksumsKicker: "Checksums",
      checksumsTitle: "稽核參考",
      checksumQueue: "Queue",
      checksumDecisionIndex: "Decision index",
      checksumPacket: "Packet",
      checksumReproducibility: "可重現性",
      warningsKicker: "警示",
      warningsTitle: "審核備註",
      warningLabels: {
        "Fallback packet is read-only UI metadata. It does not approve paper execution or live trading, rank strategies, call brokers, or claim performance.":
          "備援 packet 僅為只讀 UI metadata；不核准紙上執行、不核准實盤、不排名策略、不呼叫券商，也不形成績效宣稱。",
      },
    },
    decisionSummary: {
      kicker: "審核狀態",
      title: "決策摘要",
      total: "決策總數",
      rejected: "已拒絕",
      needsDataReview: "需要資料審查",
      paperResearchOnly: "僅允許紙上研究",
    },
    safetyFlags: {
      kicker: "安全邊界",
      title: "只讀安全旗標",
      labels: {
        research_only: "僅限研究",
        execution_eligible: "可進入執行",
        order_created: "已建立訂單",
        broker_api_called: "已呼叫券商 API",
        risk_engine_called: "已呼叫 Risk Engine",
        oms_called: "已呼叫 OMS",
        performance_claim: "績效宣稱",
        simulated_metrics_only: "僅模擬指標",
        external_data_downloaded: "已下載外部資料",
        ranking_generated: "已產生排名",
        best_strategy_selected: "已選擇最佳策略",
        approval_for_live: "實盤關閉檢查",
        approval_for_paper_execution: "紙上執行核准",
        persisted: "已持久化",
      },
    },
    roadmap: {
      eyebrow: "Phase 路線圖",
      title: "Phase 0-6 實作狀態",
      phasePrefix: "Phase",
      statusPrefix: "狀態",
      names: {
        0: "合規邊界",
        1: "基礎設施底座",
        2: "資料平台",
        3: "Strategy SDK 與回測",
        4: "風控 / OMS / 券商閘道",
        5: "指揮中心與影子交易",
        6: "可靠性與上線準備",
      },
      statuses: {
        planned: "規劃中",
      },
    },
    contracts: {
      ariaLabel: "契約與紙上模擬",
      eyebrow: "契約規格",
      title: "TX / MTX / TMF 點值",
      headers: {
        symbol: "代號",
        pointValue: "每點價值",
        txEquivalent: "TX 等值",
        description: "說明",
      },
      descriptions: {
        TX: "台灣指數期貨",
        MTX: "小型台灣指數期貨",
        TMF: "微型台灣指數期貨",
      },
    },
    paperPanel: {
      eyebrow: "僅限紙上",
      title: "訂單模擬佔位",
      text:
        "紙上訂單 API 必須經過 Risk Engine、OMS 與 Paper Broker Gateway。此 UI 不會下單，也不暴露任何實盤交易控制。",
    },
    modules: {
      eyebrow: "架構模組",
      title: "訊號到執行的邊界",
      cards: [
        ["資料平台", "Bronze/Silver/Gold 分層、contract master、market bars 與 rollover events。"],
        ["Strategy SDK", "策略介面只輸出 signal，不可存取券商 SDK，也不可送出訂單。"],
        ["Risk Engine", "紙上風控檢查涵蓋 live-disabled 狀態與 TX 等值曝險限制。"],
        ["OMS", "事件式訂單狀態機，負責完整 lifecycle transitions。"],
        ["券商閘道", "目前僅提供 paper acknowledgement 邊界，不會送出真實訂單。"],
        ["Web 指揮中心", "檢視路線圖、安全模式、契約規格與 paper-only 狀態的操作介面。"],
      ],
    },
  },
} as const;

export type DashboardCopy = (typeof dashboardCopy)[Language];

export function resolveLanguage(value: string | string[] | undefined): Language {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === "zh" ? "zh" : "en";
}
