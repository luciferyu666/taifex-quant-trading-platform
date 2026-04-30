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
        "user-agent": "tqtp-command-center-production-smoke-check/1.0",
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

    const contextStart = Math.max(0, index - 80);
    const contextEnd = Math.min(source.length, index + rule.phrase.length + 80);
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

const requiredSharedText = [
  "TRADING_MODE",
  "ENABLE_LIVE_TRADING",
  "BROKER_PROVIDER",
  "NOT READY",
];

const requiredEnglishText = ["Paper-first", "Paper Only"];
const requiredChineseText = ["實盤關閉", "僅限紙上交易"];

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

  for (const text of requiredSharedText) {
    requireContains("Production Command Center HTML", combinedHtml, text);
  }

  for (const text of requiredChineseText) {
    requireContains("Traditional Chinese production HTML", zhResponse.text, text);
  }

  for (const text of requiredEnglishText) {
    requireContains("English production HTML", enResponse.text, text);
  }

  for (const phrase of plainForbiddenPhrases) {
    requireNoPlainForbiddenPhrase(
      "Production Command Center HTML",
      combinedHtml,
      phrase,
    );
  }

  for (const rule of contextualForbiddenRules) {
    requireNoUnsafeContextualPhrase(
      "Production Command Center HTML",
      combinedHtml,
      rule,
    );
  }

  if (failures.length > 0) {
    console.error("Production Command Center smoke check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Production Command Center smoke check passed:");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
  console.log(`- production_url=${productionUrl}`);
  console.log("- Live trading remains disabled by default.");
};

main().catch((error) => {
  console.error("Production Command Center smoke check failed:");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
