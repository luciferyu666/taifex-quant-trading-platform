#!/usr/bin/env node

const DEFAULT_PRODUCTION_URL =
  "https://taifex-quant-trading-platform-front.vercel.app";

const productionUrl = (
  process.env.FRONTEND_PRODUCTION_URL || DEFAULT_PRODUCTION_URL
).replace(/\/$/, "");

const timeoutMs = Number(process.env.FRONTEND_PRODUCTION_TIMEOUT_MS || 15000);
const fetchAttempts = Number(process.env.FRONTEND_PRODUCTION_FETCH_ATTEMPTS || 3);

const checks = [];
const failures = [];

const addCheck = (message) => {
  checks.push(message);
};

const addFailure = (message) => {
  failures.push(message);
};

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchTextOnce = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "tqtp-interactive-demo-conversion-check/1.0",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text,
      url: response.url,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const fetchText = async (url) => {
  let lastError;
  for (let attempt = 1; attempt <= fetchAttempts; attempt += 1) {
    try {
      return await fetchTextOnce(url);
    } catch (error) {
      lastError = error;
      if (attempt < fetchAttempts) {
        await delay(1000 * attempt);
      }
    }
  }

  throw lastError;
};

const requireStatusOk = (label, response) => {
  if (response.ok && response.status === 200) {
    addCheck(`${label} returned HTTP 200`);
    return;
  }

  addFailure(`${label} expected HTTP 200 but received ${response.status}`);
};

const requireContains = (label, source, needle) => {
  if (source.includes(needle)) {
    addCheck(`${label} contains ${needle}`);
    return;
  }

  addFailure(`${label} missing required text: ${needle}`);
};

const requireAllContains = (label, source, needles) => {
  const missing = needles.filter((needle) => !source.includes(needle));

  if (missing.length === 0) {
    addCheck(`${label} contains ${needles.length} required entries`);
    return;
  }

  addFailure(`${label} missing required entries: ${missing.join(", ")}`);
};

const requireDeploymentId = (label, source) => {
  const deploymentId =
    source.match(/data-dpl-id="([^"]+)"/)?.[1] ||
    source.match(/[?&]dpl=(dpl_[A-Za-z0-9]+)/)?.[1];

  if (deploymentId) {
    addCheck(`${label} exposes deployment id ${deploymentId}`);
    return deploymentId;
  }

  addFailure(`${label} is missing a production deployment id marker`);
  return null;
};

const requireNoPlainForbiddenPhrase = (label, source, phrase) => {
  const lowerSource = source.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();

  if (!lowerSource.includes(lowerPhrase)) {
    addCheck(`${label} does not contain ${phrase}`);
    return;
  }

  addFailure(`${label} contains prohibited phrase: ${phrase}`);
};

const requireNoUnsafeContextualPhrase = (label, source, rule) => {
  const lowerSource = source.toLowerCase();
  const lowerPhrase = rule.phrase.toLowerCase();
  let cursor = 0;
  const unsafeMatches = [];

  while (cursor < lowerSource.length) {
    const index = lowerSource.indexOf(lowerPhrase, cursor);
    if (index === -1) {
      break;
    }

    const contextStart = Math.max(0, index - 100);
    const contextEnd = Math.min(source.length, index + rule.phrase.length + 100);
    const context = source.slice(contextStart, contextEnd);
    const normalizedContext = normalizeWhitespace(context);
    const normalizedLowerContext = normalizedContext.toLowerCase();

    const isAllowed = rule.allowedContexts.some((allowed) =>
      normalizedLowerContext.includes(allowed.toLowerCase()),
    );

    if (!isAllowed) {
      unsafeMatches.push(normalizedContext);
    }

    cursor = index + lowerPhrase.length;
  }

  if (unsafeMatches.length === 0) {
    addCheck(`${label} has no unsafe ${rule.phrase} usage`);
    return;
  }

  addFailure(
    `${label} contains unsafe ${rule.phrase} usage: ${unsafeMatches
      .slice(0, 3)
      .join(" | ")}`,
  );
};

const requiredSharedSafetyText = [
  "TRADING_MODE",
  "ENABLE_LIVE_TRADING",
  "BROKER_PROVIDER",
  "NOT READY",
  "Paper Only",
];

const englishProductValueText = [
  "Taiwan index futures data analysis and Paper Trading research platform",
  "Feature",
  "User benefit",
  "Market Data Lab",
  "Strategy Research",
  "Paper Trading Simulator",
  "Portfolio Review",
  "Evidence Center",
  "Market data preview",
  "StrategySignal generation",
  "Paper Only order simulation",
  "OMS timeline review",
  "Simulated position / PnL review",
  "Evidence JSON handoff",
  "No real broker connection",
  "No real order submission",
  "No credential collection",
  "No investment advice",
  "No performance claim",
  "Production Trading Platform remains NOT READY",
];

const chineseProductValueText = [
  "台指期資料分析與 Paper Trading 研究平台",
  "功能",
  "使用者利益",
  "Market Data Lab",
  "Strategy Research",
  "Paper Trading Simulator",
  "Portfolio Review",
  "Evidence Center",
  "市場資料預覽",
  "StrategySignal 產生",
  "Paper Only 訂單模擬",
  "OMS 時間線檢視",
  "模擬持倉 / PnL 檢視",
  "Evidence JSON 交付",
  "不連真實券商",
  "不送真實委託",
  "不收集憑證",
  "不構成投資建議",
  "不做績效主張",
  "Production Trading Platform 仍為 NOT READY",
];

const englishInteractiveControls = [
  "Browser-only Mock Runtime",
  "Interactive Demo in this browser",
  "Complete browser-only walkthrough",
  "Generate next tick",
  "Run mock strategy",
  "Simulate paper order",
  "Copy demo summary",
  "Copy evidence JSON",
  "Clear browser state",
  "Deterministic mock seed",
  "localStorage key",
  "No backend required",
  "No broker",
  "No real money",
  "No live trading",
  "Not investment advice",
];

const chineseInteractiveControls = [
  "瀏覽器內互動 Demo",
  "完整 Browser-only 操作流程",
  "產生下一筆行情",
  "執行模擬策略",
  "模擬紙上訂單",
  "複製 demo 摘要",
  "複製 evidence JSON",
  "清除瀏覽器狀態",
  "Deterministic mock seed",
  "localStorage key",
  "不需要後端",
  "無券商",
  "無真實資金",
  "實盤關閉",
  "不構成投資建議",
];

const plainForbiddenPhrases = [
  "guaranteed profit",
  "risk-free",
  "保證獲利",
  "零風險",
];

const contextualForbiddenRules = [
  {
    phrase: "approve live",
    allowedContexts: [
      "does not approve live",
      "not approve live",
      "never approve live",
      "not a live",
    ],
  },
  {
    phrase: "核准實盤",
    allowedContexts: [
      "不核准實盤",
      "未核准實盤",
      "不會核准實盤",
      "禁止核准實盤",
    ],
  },
];

const main = async () => {
  const zhUrl = `${productionUrl}/?lang=zh`;
  const enUrl = `${productionUrl}/?lang=en`;

  const [rootResponse, zhResponse, enResponse] = await Promise.all([
    fetchText(`${productionUrl}/`),
    fetchText(zhUrl),
    fetchText(enUrl),
  ]);

  requireStatusOk("Production root", rootResponse);
  requireStatusOk("Traditional Chinese page", zhResponse);
  requireStatusOk("English page", enResponse);

  const rootDeploymentId = requireDeploymentId("Production root", rootResponse.text);
  const zhDeploymentId = requireDeploymentId("Traditional Chinese page", zhResponse.text);
  const enDeploymentId = requireDeploymentId("English page", enResponse.text);

  if (
    rootDeploymentId &&
    zhDeploymentId &&
    enDeploymentId &&
    new Set([rootDeploymentId, zhDeploymentId, enDeploymentId]).size === 1
  ) {
    addCheck(`All checked pages use deployment id ${rootDeploymentId}`);
  } else if (rootDeploymentId && zhDeploymentId && enDeploymentId) {
    addFailure(
      `Checked pages returned different deployment ids: ${[
        rootDeploymentId,
        zhDeploymentId,
        enDeploymentId,
      ].join(", ")}`,
    );
  }

  const combinedHtml = `${rootResponse.text}\n${zhResponse.text}\n${enResponse.text}`;

  requireAllContains("Production shared safety copy", combinedHtml, requiredSharedSafetyText);
  requireAllContains("English product value section", enResponse.text, englishProductValueText);
  requireAllContains("Traditional Chinese product value section", zhResponse.text, chineseProductValueText);
  requireAllContains("English interactive demo controls", enResponse.text, englishInteractiveControls);
  requireAllContains("Traditional Chinese interactive demo controls", zhResponse.text, chineseInteractiveControls);
  requireContains("English page defaults into Paper OMS tab", enResponse.text, 'class="tab-panel active" id="panel-paper"');
  requireContains("Traditional Chinese page defaults into Paper OMS tab", zhResponse.text, 'class="tab-panel active" id="panel-paper"');

  for (const phrase of plainForbiddenPhrases) {
    requireNoPlainForbiddenPhrase(
      "Production interactive demo HTML",
      combinedHtml,
      phrase,
    );
  }

  for (const rule of contextualForbiddenRules) {
    requireNoUnsafeContextualPhrase(
      "Production interactive demo HTML",
      combinedHtml,
      rule,
    );
  }

  if (failures.length > 0) {
    console.error("Interactive Demo conversion QA check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Interactive Demo conversion QA check passed:");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
  console.log(`- production_url=${productionUrl}`);
  console.log("- Live trading remains disabled by default.");
};

main().catch((error) => {
  console.error("Interactive Demo conversion QA check failed:");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
