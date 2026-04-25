export const content = {
  en: {
    lang: "en",
    path: "/",
    alternatePath: "/zh/",
    meta: {
      title: "Taifex Quant Trading Platform",
      description: "Enterprise-grade quantitative trading infrastructure for Taiwan Index Futures."
    },
    language: {
      label: "Language",
      english: "EN",
      chinese: "繁中"
    },
    hero: {
      eyebrow: "Taiwan futures quant infrastructure",
      title: "Taifex Quant Trading Platform",
      subtitle: "Enterprise-grade quantitative trading infrastructure for Taiwan Index Futures.",
      description:
        "A Web platform for data governance, strategy research, backtesting, paper and shadow trading, risk control, OMS workflows, and broker gateway integration.",
      primaryCta: "View Architecture",
      secondaryCta: "Read Safety Principles",
      workflowLabel: "Platform workflow summary",
      workflow: ["Research", "Backtest", "Paper", "Shadow", "Small Live", "Full Live"],
      note: "Current defaults stop at paper trading until future approval, governance, and controls are added."
    },
    thesis: {
      eyebrow: "Platform thesis",
      title: "Trading infrastructure for a focused market",
      paragraphs: [
        "Taifex Quant Trading Platform is not a simple trading bot. It is a trading operating system for Taiwan Index Futures workflows where data governance, strategy research, backtesting, risk control, order management, broker isolation, and auditability need to work as one governed stack.",
        "Individual traders and smaller desks often stitch these capabilities together manually with scripts, spreadsheets, broker tools, and local databases. This project aims to turn that fragmented workflow into a scalable SaaS and enterprise platform foundation."
      ]
    },
    business: {
      eyebrow: "Business positioning",
      title: "From MVP scripts to a Trading OS",
      body:
        "The commercial plan positions the platform as a durable trading operating system rather than a one-off automation script. The website presents the business plan as decision-ready product architecture: a modular stack, governed execution boundaries, and enterprise continuity across data, risk, OMS, and broker adapters.",
      labels: {
        traditional: "Traditional script stack",
        platform: "Trading OS platform",
        impact: "Business impact"
      },
      rows: [
        {
          dimension: "Technical foundation",
          traditional: "Local Python scripts, ad hoc files, single-machine operations",
          platform: "Containerized services, shared storage, service boundaries, replaceable adapters",
          impact: "Supports multi-user workflows, team operations, and future enterprise deployment paths"
        },
        {
          dimension: "Data governance",
          traditional: "CSV exports and unreconciled local databases",
          platform: "Versioned market data, rollover-aware datasets, analytics storage, reproducible inputs",
          impact: "Reduces backtest-to-live drift and improves institutional trust"
        },
        {
          dimension: "Risk control",
          traditional: "Hard-coded checks inside a strategy script",
          platform: "Dedicated risk engine policies before OMS and broker gateway",
          impact: "Creates a compliance-oriented control plane instead of hidden assumptions"
        },
        {
          dimension: "Audit and continuity",
          traditional: "Local logs and operator memory",
          platform: "Centralized events, role boundaries, recovery-oriented architecture",
          impact: "Improves operational resilience and partner confidence"
        }
      ]
    },
    instruments: {
      eyebrow: "Target instruments",
      title: "TX / MTX / TMF exposure normalization",
      body:
        "Taiwan futures sizing needs a shared risk language. TX-equivalent exposure keeps strategy limits, portfolio checks, and paper-to-live controls aligned across contract sizes.",
      pointUnit: "Per index point",
      equivalenceLabel: "Contract equivalence"
    },
    architecture: {
      eyebrow: "Architecture overview",
      title: "A platform, not a single trading bot",
      body:
        "The system separates command surfaces, research workflows, risk decisions, order management, broker access, and analytics storage so future live execution can be governed and audited.",
      label: "Platform architecture diagram",
      layers: {
        frontend: "Web Frontend",
        backend: "API / Backend",
        strategy: "Strategy Registry",
        data: "Data Pipeline",
        risk: "Risk Engine",
        oms: "OMS",
        broker: "Broker Gateway",
        event: "Future Event Bus / Observability",
        dataLake: "Data Lake Future"
      }
    },
    safety: {
      eyebrow: "Safety-first trading design",
      title: "Paper-first by default",
      body:
        "The repository is designed to keep execution risk constrained while the platform foundation is built. Live trading requires explicit future approval, additional controls, and compliance review.",
      defaultsLabel: "Safe environment defaults",
      rules: [
        {
          title: "Strategy/execution separation",
          body: "Strategies emit signals only. They do not call broker SDKs directly."
        },
        {
          title: "Risk before order execution",
          body: "Orders must pass through the Risk Engine and OMS before any broker gateway boundary."
        },
        {
          title: "No secrets in source",
          body: "Broker credentials, account IDs, API keys, and certificates must not be committed."
        }
      ]
    },
    modules: {
      eyebrow: "Core modules",
      title: "Modular services for the quant workflow",
      body: "Each module is scoped to keep data, strategy signals, risk controls, and execution boundaries clear.",
      items: [
        ["Market Data Pipeline", "Ingest, validate, store, and serve Taiwan futures market data for research and operations."],
        ["Continuous Futures / Rollover Engine", "Planned session-aware and rollover-aware datasets to reduce backtest/live drift."],
        ["Strategy Research", "A future workspace for signal generation, experiment tracking, and reproducible research."],
        ["Backtesting", "Planned historical simulation that respects futures sessions, contract multipliers, and risk limits."],
        ["Paper and Shadow Trading", "Paper-first execution workflows for validating behavior before any future live deployment."],
        ["Risk Engine", "Central policy enforcement for exposure, stale quotes, daily loss limits, and order eligibility."],
        ["OMS", "Order lifecycle management designed to sit between strategy signals and broker gateway access."],
        ["Broker Gateway", "A broker SDK isolation boundary for future integrations, never called directly by strategies."],
        ["Web Command Center", "Operational UI for monitoring health, mode, safety defaults, modules, and future workflows."],
        ["Audit and Observability", "Future logs, metrics, traces, and audit records for institutional review and incident response."],
        ["AI-Assisted Analysis", "Future-facing analysis support for research review, diagnostics, and operator workflows."]
      ]
    },
    commercial: {
      eyebrow: "Commercial design",
      title: "Recurring software revenue before regulated execution services",
      body:
        "The business plan translates into a staged revenue model that starts with software subscriptions, usage-based analytics, and enterprise delivery instead of premature claims about trading profitability.",
      disclaimer:
        "Illustrative pricing and packaging from the business plan are presented as directional commercial design, not a public offer.",
      note:
        "Performance fees, managed accounts, copy trading, signal subscriptions, or broker fee-sharing may require legal, regulatory, or licensed partner review.",
      tiersTitle: "Illustrative subscription tiers",
      usageTitle: "Usage-based expansion",
      servicesTitle: "Enterprise delivery",
      pathsTitle: "Monetization paths with service logic",
      paths: [
        {
          title: "SaaS subscriptions",
          service: "Self-serve research, backtesting, paper trading, dashboards, alerts, and workflow storage.",
          logic: "Recurring revenue is tied to workflow depth, data precision, compute capacity, and retained operating history rather than trading outcomes.",
          scenarios: ["Beginner quant onboarding", "Individual research workspace", "Paper-trading workflow validation"],
          value: "Creates predictable ARR while giving users a safe path from research to paper operation.",
          compliance: "Research tooling and paper trading only by default."
        },
        {
          title: "Professional trader plans",
          service: "Higher-frequency data access, webhook risk alerts, strategy runner capacity, richer reporting, and production-like paper workflows.",
          logic: "Pricing expands with operational maturity: second-level or tick workflows, more compute, higher retention, and better monitoring.",
          scenarios: ["Active discretionary-plus-systematic traders", "Small teams validating strategies", "Shadow trading preparation"],
          value: "Helps serious users reduce manual workflow gaps without promising investment performance.",
          compliance: "No live order routing by default; broker access remains a reviewed future boundary."
        },
        {
          title: "Enterprise licensing",
          service: "Private cloud or on-prem deployment, RBAC/ABAC direction, WORM audit log direction, SLA, security review support, and custom integration scope.",
          logic: "Enterprise revenue is based on governance, deployment control, auditability, support terms, and integration complexity.",
          scenarios: ["Proprietary desks", "Family offices", "Broker innovation teams", "Institutional research groups"],
          value: "Turns the platform into procurement-ready infrastructure with clearer risk ownership and operating boundaries.",
          compliance: "Contracts should define platform responsibility, customer trading decisions, audit retention, and incident handling."
        },
        {
          title: "Data services",
          service: "Rollover-aware TX/MTX/TMF datasets, cleaned bars and ticks, data quality reports, research-only adjusted continuous futures, and data APIs.",
          logic: "Cleaned and versioned Taiwan futures data can become a high-retention asset because research, backtests, and operations depend on consistent inputs.",
          scenarios: ["Backtest data packs", "Data API subscriptions", "Enterprise data governance", "Rollover validation reports"],
          value: "Improves reproducibility and reduces backtest-to-live drift for users who currently rely on scattered files.",
          compliance: "Data licensing, redistribution rights, and exchange/vendor restrictions must be reviewed."
        },
        {
          title: "Strategy marketplace",
          service: "Future marketplace infrastructure for strategy authors, validation reports, risk labels, versioned strategy packages, and review workflows.",
          logic: "Marketplace economics can create network effects once the platform has review, risk labeling, and clear author responsibility.",
          scenarios: ["Strategy author distribution", "Research template library", "Institutional strategy review queue"],
          value: "Connects developers and users around standardized signal contracts without letting strategies bypass risk or OMS.",
          compliance: "Copy trading, signal subscriptions, or advisory-like distribution require separate legal and regulatory review."
        },
        {
          title: "AI analysis add-ons",
          service: "AI-assisted overfitting checks, parameter sensitivity summaries, anomaly review, strategy documentation, and operational diagnostics.",
          logic: "Usage-based AI diagnostics can monetize compute-heavy review workflows while keeping human users in control.",
          scenarios: ["Backtest review", "Strategy health reports", "Experiment comparison", "Incident postmortem summaries"],
          value: "Speeds research review and operational learning without turning AI into an autonomous trading authority.",
          compliance: "AI output must remain analytical tooling, not individualized investment advice."
        },
        {
          title: "Broker or institutional partnerships",
          service: "White-label infrastructure, co-branded research tools, broker adapter projects, training programs, and institutional workflow pilots.",
          logic: "Partner revenue comes from integration, distribution, and operational enablement rather than unreviewed order-routing economics.",
          scenarios: ["Broker developer portal", "Fintech sandbox", "Institutional pilot deployment", "Education and onboarding programs"],
          value: "Gives partners a governed Taiwan futures quant stack while preserving broker-gateway isolation.",
          compliance: "Broker fee-sharing, referrals, or order-routing monetization are compliance-dependent future options."
        },
        {
          title: "Compliance-dependent performance models",
          service: "Future-only structures such as performance fees, managed accounts, copy trading, signal subscriptions, or broker fee-sharing.",
          logic: "These can only be considered after licensing, legal review, customer suitability, operational controls, disclosure, and conflict management are defined.",
          scenarios: ["Licensed partner structure", "Reviewed signal distribution", "Approved managed-account framework"],
          value: "Preserves optionality without marketing regulated services as currently available.",
          compliance: "Not available in the current product; no profit guarantee and no live trading by default."
        }
      ],
      plans: [
        {
          name: "Basic",
          audience: "Quant beginners",
          precision: "1m data",
          price: "~TWD 1,980 / month",
          features: ["Core backtesting", "Paper trading", "Foundational workflow visibility"]
        },
        {
          name: "Pro",
          audience: "Active traders",
          precision: "1s data",
          price: "~TWD 8,800 / month",
          features: ["API access", "Webhook risk alerts", "Higher-frequency workflow support"]
        },
        {
          name: "Elite",
          audience: "Professional traders",
          precision: "Tick data",
          price: "~TWD 29,800 / month",
          features: ["Multi-account reconciliation", "AI strategy diagnostics", "Cloud runner capacity"]
        },
        {
          name: "Enterprise",
          audience: "Institutions and family offices",
          precision: "Level 2 depth",
          price: "TWD 250,000+ / month",
          features: ["Private cloud deployment", "Audit-oriented logging", "SLA-backed integration"]
        }
      ],
      usage: [
        {
          title: "AI diagnosis tokens",
          body: "High-margin analysis credits for overfitting detection, parameter sensitivity review, and strategy health checks."
        },
        {
          title: "Tick replay and TCA workloads",
          body: "Additional billing for high-frequency replays, historical reconstruction, and execution-cost analysis workflows."
        }
      ],
      services: [
        {
          title: "Private cloud and on-prem delivery",
          body: "Longer-term enterprise licensing with deployment control, data locality, and institution-specific operating boundaries."
        },
        {
          title: "Adapter and workflow integration",
          body: "Paid integration work for broker adapters, internal controls, reporting, and operational change management."
        }
      ]
    },
    segments: {
      eyebrow: "Customer strategy",
      title: "Pricing and messaging by operating maturity",
      body:
        "The business plan distinguishes between self-directed traders seeking better local-market tooling and institutions buying governance, continuity, and control. The website reflects that split directly.",
      items: [
        {
          title: "Retail and professional traders",
          body: "Lead with localized data quality, rollover-aware datasets, and a clear research-to-paper workflow.",
          bullets: [
            "TX / MTX / TMF risk-equivalent sizing",
            "Continuous futures data as a premium differentiator",
            "Trading journal and workflow stickiness for retention"
          ]
        },
        {
          title: "Institutions and family offices",
          body: "Sell governance capabilities, role separation, and infrastructure resilience rather than a promise of strategy alpha.",
          bullets: [
            "RBAC and operating boundary design",
            "High-availability deployment direction",
            "Auditability, reconciliation, and procurement readiness"
          ]
        }
      ]
    },
    moat: {
      eyebrow: "Go-to-market and moat",
      title: "Specialize first, expand from infrastructure",
      body:
        "The business plan argues for a Taiwan futures-first wedge. The moat is not a single strategy; it is the accumulated operating system around localized data, controlled execution, repeatable workflows, and ecosystem gravity.",
      phasesTitle: "Three-stage growth path",
      phases: [
        {
          title: "Phase 1: Tool-led growth",
          body: "Acquire early technical users through a strong backtesting foundation and better rollover-aware market data."
        },
        {
          title: "Phase 2: Ecosystem expansion",
          body: "Add broker adapters, collaboration workflows, and a strategy marketplace to lower acquisition cost through third-party participation."
        },
        {
          title: "Phase 3: Infrastructure moat",
          body: "Move upmarket with enterprise controls, deployment flexibility, and stronger audit and governance expectations."
        }
      ],
      advantagesTitle: "Durable advantages",
      advantages: [
        {
          title: "Proprietary Taiwan futures datasets",
          body: "Versioned, cleaned, rollover-aware datasets become operational infrastructure rather than commodity files."
        },
        {
          title: "Broker abstraction layer",
          body: "A neutral broker gateway model reduces lock-in to any single broker and supports continuity planning."
        },
        {
          title: "Workflow and audit history",
          body: "Backtest, paper, risk, and order-state history compound into a durable switching cost for teams."
        }
      ]
    },
    roadmap: {
      eyebrow: "Roadmap",
      title: "Realistic platform buildout",
      body:
        "The current repository is a development skeleton. The roadmap progresses from foundation to governed execution boundaries before any future live workflow.",
      phases: [
        "Phase 1: Development foundation",
        "Phase 2: Strategy signal contract and TX/MTX/TMF risk sizing",
        "Phase 3: Data pipeline and rollover engine",
        "Phase 4: Backtesting and paper trading",
        "Phase 5: Risk Engine and OMS skeleton",
        "Phase 6: Broker gateway integration",
        "Phase 7: Web command center",
        "Phase 8: Enterprise controls, audit, observability, deployment"
      ]
    },
    governance: {
      eyebrow: "Governance and compliance",
      title: "Compliance framing as a commercial capability",
      body:
        "The business plan treats compliance as a sales accelerator. Clear system boundaries, security alignment, and operational responsibility definitions reduce friction with institutional customers and partners.",
      items: [
        {
          title: "SaaS-first commercial boundary",
          body: "The early platform position is software and infrastructure tooling. Regulated trading services remain outside the default product scope."
        },
        {
          title: "Procurement readiness",
          body: "Security controls, audit trails, role separation, and kill-switch design shorten third-party risk review for larger customers."
        },
        {
          title: "Contract clarity",
          body: "Reconciliation, service levels, and emergency controls should be explicit in customer agreements, not implied by marketing copy."
        }
      ]
    },
    compliance: {
      eyebrow: "Compliance and risk notice",
      title: "Research software, not investment advice",
      paragraphs: [
        "This website and repository are for research, engineering, and product development. They do not provide investment advice, do not guarantee profit, and do not remove the substantial risk involved in futures trading.",
        "Live trading, signal services, managed accounts, copy trading, broker fee-sharing, or other regulated services require separate legal and compliance review before any release or customer use."
      ]
    },
    cta: {
      eyebrow: "Research and engineering development",
      title: "Build the platform foundation before execution risk",
      body: "Explore the repository, review the safety principles, and continue in small verified slices.",
      primary: "Explore the Repository",
      secondary: "Review Safety Principles"
    }
  },
  zh: {
    lang: "zh-Hant",
    path: "/zh/",
    alternatePath: "/",
    meta: {
      title: "台指期量化交易平台",
      description: "面向台灣指數期貨的企業級量化交易基礎設施。"
    },
    language: {
      label: "語言",
      english: "EN",
      chinese: "繁中"
    },
    hero: {
      eyebrow: "台灣期貨量化交易基礎設施",
      title: "台指期量化交易平台",
      subtitle: "面向台灣指數期貨的企業級量化交易基礎設施。",
      description:
        "一套 Web 平台，用於資料治理、策略研究、回測、紙上與影子交易、風險控管、OMS 工作流程，以及未來的券商閘道整合。",
      primaryCta: "查看架構",
      secondaryCta: "閱讀安全原則",
      workflowLabel: "平台工作流程摘要",
      workflow: ["研究", "回測", "紙上交易", "影子交易", "小規模實盤", "完整實盤"],
      note: "目前預設停留在紙上交易；未來需完成明確核准、治理與控制機制後，才可進一步擴充。"
    },
    thesis: {
      eyebrow: "平台論點",
      title: "為聚焦市場打造的交易基礎設施",
      paragraphs: [
        "台指期量化交易平台不是單一交易機器人，而是面向台灣指數期貨流程的 Trading OS，讓資料治理、策略研究、回測、風險控管、訂單管理、券商隔離與稽核能力能在同一套受治理的系統內協作。",
        "個人交易者與小型交易團隊往往以腳本、試算表、券商工具與本地資料庫拼接工作流。本專案目標是將這些分散流程整理為可擴展的 SaaS 與企業平台基礎。"
      ]
    },
    business: {
      eyebrow: "商業定位",
      title: "從 MVP 腳本走向 Trading OS",
      body:
        "這份商業企劃書將平台定位為可持續擴張的交易作業系統，而不是一次性的自動化腳本。網站上不直接貼整份企劃，而是把其核心邏輯轉譯成可讀的產品架構：模組化服務、受治理的執行邊界，以及跨資料、風控、OMS 與券商適配層的企業級持續營運能力。",
      labels: {
        traditional: "傳統腳本模式",
        platform: "Trading OS 平台",
        impact: "商業增益"
      },
      rows: [
        {
          dimension: "技術底座",
          traditional: "本地 Python 腳本、零散檔案、單機運作",
          platform: "容器化服務、共享儲存、清楚服務邊界、可替換適配器",
          impact: "支援多人協作、團隊營運與未來企業級部署路徑"
        },
        {
          dimension: "資料治理",
          traditional: "CSV 匯出與無法對帳的本地資料庫",
          platform: "版本化市場資料、換月感知資料集、分析儲存與可重現輸入",
          impact: "降低回測到實盤的落差，提升機構信任度"
        },
        {
          dimension: "風險控管",
          traditional: "把檢查邏輯硬寫在策略腳本內",
          platform: "Risk Engine 政策先於 OMS 與 Broker Gateway 執行",
          impact: "形成可對外說明的合規控制面，而不是隱藏假設"
        },
        {
          dimension: "稽核與持續營運",
          traditional: "本地日誌與操作人員記憶",
          platform: "集中事件、角色邊界、以復原為導向的架構設計",
          impact: "提升營運韌性與合作夥伴信心"
        }
      ]
    },
    instruments: {
      eyebrow: "目標商品",
      title: "TX / MTX / TMF 曝險標準化",
      body:
        "台灣期貨部位 sizing 需要共通的風險語言。以 TX 等值曝險表達部位，可以讓策略限制、投組檢查，以及紙上交易到實盤前的控制在不同契約規格間保持一致。",
      pointUnit: "每指數點",
      equivalenceLabel: "契約等值關係"
    },
    architecture: {
      eyebrow: "架構總覽",
      title: "這是平台，不是單一交易機器人",
      body:
        "系統將操作介面、研究流程、風險決策、訂單管理、券商存取與分析儲存分離，使未來實盤執行能被治理、追蹤與稽核。",
      label: "平台架構圖",
      layers: {
        frontend: "Web 前端",
        backend: "API / 後端",
        strategy: "策略註冊表",
        data: "資料管線",
        risk: "風險引擎",
        oms: "OMS",
        broker: "券商閘道",
        event: "未來事件匯流排 / 可觀測性",
        dataLake: "未來 Data Lake"
      }
    },
    safety: {
      eyebrow: "安全優先交易設計",
      title: "預設採用紙上交易",
      body:
        "本 repository 的設計目標，是在平台基礎尚未完成前限制執行風險。實盤交易需要未來明確核准、額外控制措施與合規審查。",
      defaultsLabel: "安全環境預設",
      rules: [
        {
          title: "策略與執行分離",
          body: "策略只輸出訊號，不直接呼叫券商 SDK。"
        },
        {
          title: "下單前先經風控",
          body: "任何訂單都必須通過 Risk Engine 與 OMS，才能到達券商閘道邊界。"
        },
        {
          title: "原始碼不放秘密",
          body: "券商憑證、帳號 ID、API keys 與憑證檔不可提交到原始碼。"
        }
      ]
    },
    modules: {
      eyebrow: "核心模組",
      title: "支援量化交易流程的模組化服務",
      body: "每個模組都維持清楚邊界，讓資料、策略訊號、風險控管與執行流程彼此分離。",
      items: [
        ["市場資料管線", "擷取、驗證、儲存並提供台灣期貨市場資料，支援研究與營運。"],
        ["連續期貨 / 換月引擎", "規劃建立 session-aware 與 rollover-aware 的資料集，降低回測與實盤落差。"],
        ["策略研究", "未來提供訊號產生、實驗追蹤與可重現研究工作區。"],
        ["回測", "規劃尊重交易時段、契約乘數與風險限制的歷史模擬能力。"],
        ["紙上與影子交易", "以 paper-first 工作流驗證行為，再考慮任何未來實盤部署。"],
        ["風險引擎", "集中執行曝險、報價陳舊、單日損失限制與訂單資格檢查。"],
        ["OMS", "管理策略訊號到券商閘道之間的訂單生命週期。"],
        ["券商閘道", "隔離未來券商 SDK 整合；策略不得直接呼叫。"],
        ["Web 指揮中心", "監控健康狀態、模式、安全預設、模組與未來工作流程。"],
        ["稽核與可觀測性", "未來提供日誌、指標、追蹤與稽核紀錄，以支援機構級審查。"],
        ["AI 輔助分析", "未來可支援研究審查、診斷與操作流程，但不得繞過風控與 OMS。"]
      ]
    },
    commercial: {
      eyebrow: "商業設計",
      title: "先建立經常性軟體收入，再處理受監管執行服務",
      body:
        "商業企劃中的營收模型，對應到網站上應呈現為分階段的產品化收費邏輯：先以軟體訂閱、用量計費與企業導入建立收入基礎，而不是過早以交易獲利作為銷售主張。",
      disclaimer: "以下價格與方案內容來自商業企劃書，作為方向性商業設計示意，並非公開報價。",
      note:
        "績效費、代操帳戶、跟單交易、訊號訂閱或券商分潤，可能需要法律、監管或持牌合作夥伴審查。",
      tiersTitle: "示意訂閱方案",
      usageTitle: "用量型擴充",
      servicesTitle: "企業導入服務",
      pathsTitle: "變現路徑的服務邏輯",
      paths: [
        {
          title: "SaaS 訂閱",
          service: "提供自助式研究、回測、紙上交易、儀表板、告警與工作流保存。",
          logic: "收入來自工作流深度、資料精度、運算容量與操作歷史保存，而不是交易結果。",
          scenarios: ["量化初學者上手", "個人研究工作區", "紙上交易流程驗證"],
          value: "建立可預測 ARR，並讓使用者以安全方式從研究走向紙上營運。",
          compliance: "預設僅限研究工具與紙上交易。"
        },
        {
          title: "專業交易者方案",
          service: "提供較高頻資料、Webhook 風控告警、策略 runner 容量、進階報表與類生產環境的紙上工作流。",
          logic: "定價隨營運成熟度提高：秒級或逐筆資料、更多運算、更長保存期與更完整監控。",
          scenarios: ["活躍交易者", "小型策略團隊驗證", "影子交易前準備"],
          value: "協助重度使用者降低手動流程落差，但不承諾投資績效。",
          compliance: "預設不提供實盤下單；券商存取仍是未來審查後的邊界。"
        },
        {
          title: "企業授權",
          service: "提供私有雲或地端部署、RBAC/ABAC 方向、WORM 稽核方向、SLA、安全審查支援與客製整合範圍。",
          logic: "企業收入來自治理、部署控制、稽核能力、支援條款與整合複雜度。",
          scenarios: ["自營交易團隊", "家族辦公室", "券商創新部門", "機構研究團隊"],
          value: "把平台轉化為可採購的基礎設施，讓責任歸屬與操作邊界更清楚。",
          compliance: "契約需定義平台責任、客戶交易決策、稽核保存與事件處理。"
        },
        {
          title: "資料服務",
          service: "提供換月感知 TX/MTX/TMF 資料集、清洗後 bars/ticks、資料品質報告、研究用連續期貨與資料 API。",
          logic: "清洗且版本化的台灣期貨資料具高留存價值，因為研究、回測與營運都依賴一致輸入。",
          scenarios: ["回測資料包", "資料 API 訂閱", "企業資料治理", "換月驗證報告"],
          value: "提升可重現性，降低使用者目前以零散檔案回測到營運的落差。",
          compliance: "資料授權、轉售權與交易所/供應商限制需另行審查。"
        },
        {
          title: "策略市集",
          service: "未來提供策略作者分發、驗證報告、風險標籤、版本化策略套件與審查流程。",
          logic: "只有在具備審查、風險標籤與作者責任邊界後，市集經濟才適合建立網路效應。",
          scenarios: ["策略作者分發", "研究模板庫", "機構策略審查佇列"],
          value: "以標準化訊號契約連接開發者與使用者，同時不允許策略繞過風控或 OMS。",
          compliance: "跟單、訊號訂閱或近似顧問的分發模式需獨立法律與監管審查。"
        },
        {
          title: "AI 分析加值服務",
          service: "提供 AI 輔助過度擬合檢查、參數敏感度摘要、異常檢視、策略文件化與營運診斷。",
          logic: "以用量型 AI 診斷變現高運算量的研究審查流程，同時保留人為決策控制。",
          scenarios: ["回測審查", "策略健康報告", "實驗比較", "事件復盤摘要"],
          value: "加速研究審查與營運學習，但不讓 AI 成為自動交易決策者。",
          compliance: "AI 輸出必須維持分析工具定位，不構成個別化投資建議。"
        },
        {
          title: "券商或機構合作",
          service: "提供白標基礎設施、共同品牌研究工具、券商適配專案、教育訓練與機構工作流試點。",
          logic: "合作收入來自整合、分發與營運賦能，而不是未審查的下單導流經濟。",
          scenarios: ["券商開發者入口", "Fintech sandbox", "機構試點部署", "教育與上線計畫"],
          value: "讓合作夥伴取得受治理的台灣期貨量化堆疊，同時維持券商閘道隔離。",
          compliance: "券商分潤、轉介或訂單導流變現皆屬合規依賴的未來選項。"
        },
        {
          title: "依合規審查而定的未來績效型模式",
          service: "僅作未來選項：績效費、代操帳戶、跟單交易、訊號訂閱或券商分潤。",
          logic: "必須先完成牌照、法律審查、客戶適合度、營運控制、揭露與利益衝突管理後，才可評估。",
          scenarios: ["持牌合作夥伴架構", "審查後訊號分發", "核准後代管框架"],
          value: "保留長期選項，但不把受監管服務包裝成目前已可使用的產品。",
          compliance: "目前產品不提供；不保證獲利，且 Live Trading 預設關閉。"
        }
      ],
      plans: [
        {
          name: "Basic",
          audience: "量化初學者",
          precision: "1 分鐘資料",
          price: "~TWD 1,980 / 月",
          features: ["基礎回測", "紙上交易", "核心工作流可視化"]
        },
        {
          name: "Pro",
          audience: "活躍交易者",
          precision: "1 秒資料",
          price: "~TWD 8,800 / 月",
          features: ["API 存取", "Webhook 風控告警", "較高頻工作流支援"]
        },
        {
          name: "Elite",
          audience: "專業交易員",
          precision: "逐筆資料",
          price: "~TWD 29,800 / 月",
          features: ["多帳戶對帳", "AI 策略健檢", "雲端 runner 容量"]
        },
        {
          name: "Enterprise",
          audience: "機構與家族辦公室",
          precision: "Level 2 深度資料",
          price: "TWD 250,000+ / 月",
          features: ["私有雲部署", "稽核導向日誌", "SLA 級整合服務"]
        }
      ],
      usage: [
        {
          title: "AI 診斷代幣",
          body: "將過度擬合偵測、參數敏感度分析與策略健康檢查包裝為高毛利分析點數服務。"
        },
        {
          title: "逐筆重播與 TCA 工作負載",
          body: "對高頻回放、歷史重建與交易成本分析等高耗資源流程進行額外計費。"
        }
      ],
      services: [
        {
          title: "私有雲與地端部署",
          body: "以長期企業授權提供部署控制、資料落地需求與機構自定營運邊界。"
        },
        {
          title: "適配器與流程整合",
          body: "針對券商適配、內控流程、報表與營運變更管理，提供付費導入與客製整合。"
        }
      ]
    },
    segments: {
      eyebrow: "客群策略",
      title: "依營運成熟度區分產品訊息與定價",
      body:
        "商業企劃書明確區分兩類客群：需要更好在地市場工具的自營交易者，以及購買治理、持續營運與控制能力的機構客戶。網站應直接反映這個切分。",
      items: [
        {
          title: "個人與專業交易者",
          body: "主打在地化資料品質、換月感知資料集，以及從研究到紙上交易的清楚工作流。",
          bullets: [
            "TX / MTX / TMF 風險等值 sizing",
            "連續期貨資料作為高溢價差異化功能",
            "交易日誌與工作流黏著度提升留存"
          ]
        },
        {
          title: "機構與家族辦公室",
          body: "核心銷售點不是單一策略績效，而是治理能力、角色分離與基礎設施韌性。",
          bullets: [
            "RBAC 與操作邊界設計",
            "高可用部署方向",
            "稽核、對帳與採購審查友善度"
          ]
        }
      ]
    },
    moat: {
      eyebrow: "市場進入與護城河",
      title: "先專精台指期，再從基礎設施往外擴張",
      body:
        "這份商業企劃主張的差異化，不是某一個神奇策略，而是圍繞台灣期貨市場建立的作業系統：在地資料治理、受控執行、可重現流程與生態系網路效應。",
      phasesTitle: "三階段成長路徑",
      phases: [
        {
          title: "Phase 1：Tool-led Growth",
          body: "先以較強的回測基礎與更好的換月資料，吸引早期技術型使用者。"
        },
        {
          title: "Phase 2：Ecosystem Expansion",
          body: "再加入券商適配、協作流程與策略市集，透過第三方參與降低獲客成本。"
        },
        {
          title: "Phase 3：Infrastructure Moat",
          body: "最後向上延伸到企業控制、部署彈性，以及更強的稽核與治理需求。"
        }
      ],
      advantagesTitle: "長期優勢",
      advantages: [
        {
          title: "台灣期貨專屬資料資產",
          body: "版本化、清洗過、具換月感知能力的資料集，會成為營運基礎設施，而不是一般檔案商品。"
        },
        {
          title: "Broker Gateway 抽象層",
          body: "中立的券商閘道模型降低對單一券商的依賴，也支援業務連續性規劃。"
        },
        {
          title: "工作流與稽核歷史",
          body: "回測、紙上交易、風控與訂單狀態累積的歷史，會逐漸形成團隊級切換成本。"
        }
      ]
    },
    roadmap: {
      eyebrow: "路線圖",
      title: "務實的平台建置路徑",
      body:
        "目前 repository 是開發骨架。路線圖會先從基礎設施前進到受治理的執行邊界，再考慮任何未來實盤工作流。",
      phases: [
        "Phase 1：開發基礎",
        "Phase 2：策略訊號契約與 TX/MTX/TMF 風險 sizing",
        "Phase 3：資料管線與換月引擎",
        "Phase 4：回測與紙上交易",
        "Phase 5：Risk Engine 與 OMS 骨架",
        "Phase 6：券商閘道整合",
        "Phase 7：Web 指揮中心",
        "Phase 8：企業控制、稽核、可觀測性與部署"
      ]
    },
    governance: {
      eyebrow: "治理與合規",
      title: "把合規框架呈現成商業能力",
      body:
        "商業企劃把合規視為銷售加速器。清楚的系統邊界、安全標準對齊與責任歸屬定義，能降低機構客戶與合作夥伴的採購摩擦。",
      items: [
        {
          title: "SaaS 優先的商業邊界",
          body: "早期平台定位為軟體與基礎設施工具，受監管的交易服務不在預設產品範圍內。"
        },
        {
          title: "採購審查就緒",
          body: "安全控制、稽核軌跡、角色分離與 kill-switch 設計，有助縮短大型客戶第三方風險評估流程。"
        },
        {
          title: "契約責任清楚",
          body: "對帳、服務等級與緊急停機機制，應在客戶契約中明確定義，而不是留在行銷文案暗示。"
        }
      ]
    },
    compliance: {
      eyebrow: "合規與風險聲明",
      title: "研究軟體，不是投資建議",
      paragraphs: [
        "本網站與 repository 用於研究、工程與產品開發，不構成投資建議，不保證獲利，也不消除期貨交易所涉及的重大風險。",
        "實盤交易、訊號服務、代操帳戶、跟單交易、券商分潤或其他受監管服務，在任何發布或客戶使用前，都需要獨立法律與合規審查。"
      ]
    },
    cta: {
      eyebrow: "研究與工程開發",
      title: "先建立平台基礎，再處理執行風險",
      body: "查看 repository、審閱安全原則，並以小而可驗證的切片持續推進。",
      primary: "查看 Repository",
      secondary: "檢視安全原則"
    }
  }
} as const;

export type Locale = keyof typeof content;
export type PageContent = ((typeof content)["en"]) | ((typeof content)["zh"]);
