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
        "A Web platform for data governance, strategy research, backtesting, paper/shadow trading, risk control, OMS workflows, and broker gateway integration.",
      primaryCta: "View Architecture",
      secondaryCta: "Read Safety Principles",
      workflowLabel: "Platform workflow summary",
      workflow: ["Research", "Backtest", "Paper", "Shadow", "Small Live", "Full Live"],
      note: "Current defaults stop at paper trading until future approval and controls are added."
    },
    thesis: {
      eyebrow: "Platform thesis",
      title: "Trading infrastructure for a focused market",
      paragraphs: [
        "Taifex Quant Trading Platform is not a simple trading bot. It is a trading infrastructure platform for Taiwan Index Futures workflows where data governance, backtesting, paper/shadow trading, risk control, order management, broker integration, and auditability need to work as one system.",
        "Individual traders and smaller desks often stitch these capabilities together manually. This project aims to turn those fragmented workflows into a scalable SaaS and enterprise platform foundation."
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
      eyebrow: "Commercial model",
      title: "Potential monetization paths",
      body:
        "The platform can support multiple business models over time without depending on profitability claims. Every regulated commercial activity must be reviewed with qualified legal and compliance advisors.",
      note:
        "Performance fees, managed accounts, copy trading, signal subscriptions, or broker fee-sharing may require legal, regulatory, or licensed partner review.",
      models: [
        "SaaS subscriptions",
        "Professional trader plans",
        "Enterprise licensing",
        "Data services",
        "Strategy marketplace",
        "AI analysis add-ons",
        "Broker or institutional partnerships",
        "Compliance-dependent future performance-based models"
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
        "一套 Web 平台，用於資料治理、策略研究、回測、紙上交易與影子交易、風險控管、OMS 工作流程，以及未來的券商閘道整合。",
      primaryCta: "查看架構",
      secondaryCta: "閱讀安全原則",
      workflowLabel: "平台工作流程摘要",
      workflow: ["研究", "回測", "紙上交易", "影子交易", "小規模實盤", "完整實盤"],
      note: "目前預設停留在紙上交易；未來需完成明確核准與控制機制後，才可進一步擴充。"
    },
    thesis: {
      eyebrow: "平台論點",
      title: "為聚焦市場打造的交易基礎設施",
      paragraphs: [
        "台指期量化交易平台不是單一交易機器人，而是面向台灣指數期貨流程的交易基礎設施平台，讓資料治理、回測、紙上/影子交易、風險控管、訂單管理、券商整合與稽核能力能在同一套系統內協作。",
        "個人交易者與小型交易團隊往往以腳本、試算表、券商工具與臨時流程拼接工作流。本專案目標是將這些分散流程整理為可擴展的 SaaS 與企業平台基礎。"
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
      eyebrow: "商業模式",
      title: "潛在變現路徑",
      body:
        "平台長期可支援多種商業模式，但不依賴獲利承諾。任何受監管的商業活動，都必須由合格法律與合規顧問審查。",
      note:
        "績效費、代操帳戶、跟單交易、訊號訂閱或券商分潤，可能需要法律、監管或持牌合作夥伴審查。",
      models: [
        "SaaS 訂閱",
        "專業交易者方案",
        "企業授權",
        "資料服務",
        "策略市集",
        "AI 分析加值服務",
        "券商或機構合作",
        "依合規審查而定的未來績效型模式"
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
