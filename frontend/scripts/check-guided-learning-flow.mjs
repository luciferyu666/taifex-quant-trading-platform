#!/usr/bin/env node

import { readFileSync } from "node:fs";

const DEFAULT_PRODUCTION_URL =
  "https://taifex-quant-trading-platform-front.vercel.app";

const productionUrl = (
  process.env.FRONTEND_PRODUCTION_URL || DEFAULT_PRODUCTION_URL
).replace(/\/$/, "");

const timeoutMs = Number(process.env.FRONTEND_PRODUCTION_TIMEOUT_MS || 15000);
const fetchAttempts = Number(process.env.FRONTEND_PRODUCTION_FETCH_ATTEMPTS || 3);

const localGuidedLearningSource = [
  readFileSync(new URL("../app/i18n.ts", import.meta.url), "utf8"),
  readFileSync(new URL("../app/components/browserOnlyMockRuntime.ts", import.meta.url), "utf8"),
  readFileSync(new URL("../app/components/BrowserOnlyMockDemoPanel.tsx", import.meta.url), "utf8"),
  readFileSync(new URL("../app/components/BrowserOnlyMockDemoGuide.tsx", import.meta.url), "utf8"),
  readFileSync(new URL("../app/components/BrowserOnlyMockVisualizationPanel.tsx", import.meta.url), "utf8"),
  readFileSync(new URL("../app/components/MarketRealismVisualizationPanel.tsx", import.meta.url), "utf8"),
].join("\n");

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
        "user-agent": "tqtp-guided-learning-flow-check/1.0",
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

const workflowItems = [
  "Data standardization",
  "StrategySignal standardization",
  "Backtest reproducibility",
  "Rollover data separation",
  "PaperOrderIntent flow",
  "Risk Engine checks",
  "OMS lifecycle",
  "Audit evidence",
];

const englishDemoActions = [
  "Generate market tick",
  "Run mock strategy",
  "Simulate Paper Only order",
  "Review OMS timeline",
  "Copy demo summary",
  "Copy evidence JSON",
];

const chineseDemoActions = [
  "Generate market tick",
  "Run mock strategy",
  "Simulate Paper Only order",
  "Review OMS timeline",
  "複製 demo summary",
  "複製 evidence JSON",
];

const localMarketRealismMarkers = [
  "BrowserMockMarketRegime",
  "normal",
  "trending",
  "volatile",
  "illiquid",
  "stale_quote",
  "Market Realism",
  "Market regime",
  "Spread",
  "Liquidity score",
  "Slippage estimate",
  "Fill reason",
  "市場真實度",
  "市場狀態",
  "價差",
  "流動性分數",
  "滑價估計",
  "成交原因",
  "Result explanation",
  "結果說明",
  "Visualization Layer",
  "browser-price-chart",
  "regime-strip",
  "microstructure-list",
  "order-outcome-rail",
  "Market path, microstructure, order outcome, and paper PnL",
  "MarketRealismVisualizationPanel",
  "market-regime-timeline",
  "market-quality-meter",
  "fill-explanation-box",
  "Regime, spread, liquidity, slippage, and fill reason",
  "市場狀態、價差、流動性、滑價與成交原因",
  "Quote Quality",
  "Fill Explanation",
  "成交說明",
];

const englishSafetyText = [
  "Paper Only",
  "Browser-only / mock demo",
  "No broker",
  "No real order",
  "No credentials",
  "Not investment advice",
  "Production Trading Platform: NOT READY",
];

const chineseSafetyText = [
  "Paper Only",
  "Browser-only / mock demo",
  "不連券商",
  "不建立真實委託",
  "不收集憑證",
  "不構成投資建議",
  "Production Trading Platform: NOT READY",
];

const sharedSafetyText = [
  "TRADING_MODE",
  "ENABLE_LIVE_TRADING",
  "BROKER_PROVIDER",
  "NOT READY",
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

  requireAllContains(
    "Local guided learning market realism source",
    localGuidedLearningSource,
    localMarketRealismMarkers,
  );

  requireAllContains("Production shared safety copy", combinedHtml, sharedSafetyText);

  requireContains("English Workflow Standardization panel", enResponse.text, "Workflow Standardization");
  requireContains("Traditional Chinese Workflow Standardization panel", zhResponse.text, "流程標準化");
  requireAllContains("English workflow standardization items", enResponse.text, workflowItems);
  requireAllContains("Traditional Chinese workflow standardization items", zhResponse.text, workflowItems);
  requireAllContains("English guided demo actions", enResponse.text, englishDemoActions);
  requireAllContains("Traditional Chinese guided demo actions", zhResponse.text, chineseDemoActions);
  requireAllContains("English guided learning safety boundary", enResponse.text, englishSafetyText);
  requireAllContains("Traditional Chinese guided learning safety boundary", zhResponse.text, chineseSafetyText);

  for (const phrase of plainForbiddenPhrases) {
    requireNoPlainForbiddenPhrase("Production guided learning HTML", combinedHtml, phrase);
  }

  for (const rule of contextualForbiddenRules) {
    requireNoUnsafeContextualPhrase("Production guided learning HTML", combinedHtml, rule);
  }

  if (failures.length > 0) {
    console.error("Guided Learning Flow QA check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Guided Learning Flow QA check passed:");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
  console.log(`- production_url=${productionUrl}`);
  console.log("- Live trading remains disabled by default.");
};

main().catch((error) => {
  console.error("Guided Learning Flow QA check failed:");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
