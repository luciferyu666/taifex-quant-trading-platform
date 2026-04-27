#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(websiteRoot, "..");

const checks = [];
const failures = [];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function pass(message) {
  checks.push(message);
}

function fail(message) {
  failures.push(message);
}

function assertIncludes(text, needle, message) {
  if (text.includes(needle)) {
    pass(message);
  } else {
    fail(`${message} Missing: ${needle}`);
  }
}

function assertRegex(text, pattern, message) {
  if (pattern.test(text)) {
    pass(message);
  } else {
    fail(`${message} Pattern not found: ${pattern}`);
  }
}

function extractAnchors(source) {
  const anchors = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = anchorPattern.exec(source)) !== null) {
    const attrs = match[1];
    const body = match[2]
      .replace(/\{[^}]*\}/g, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const hrefMatch = attrs.match(/\bhref=(?:"([^"]+)"|'([^']+)'|\{([^}]+)\})/);
    anchors.push({
      href: hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "",
      label: body,
    });
  }
  return anchors;
}

const envExample = read(".env.example");
const content = read("website/src/i18n/content.ts");
const localizedHome = read("website/src/components/LocalizedHome.astro");
const css = read("website/src/styles/global.css");
const enGtm = read("website/src/pages/go-to-market.astro");
const zhGtm = read("website/src/pages/zh/go-to-market.astro");
const marketingSources = [
  ["website/src/i18n/content.ts", content],
  ["website/src/components/LocalizedHome.astro", localizedHome],
  ["website/src/pages/business.astro", read("website/src/pages/business.astro")],
  ["website/src/pages/zh/business.astro", read("website/src/pages/zh/business.astro")],
  ["website/src/pages/pricing.astro", read("website/src/pages/pricing.astro")],
  ["website/src/pages/zh/pricing.astro", read("website/src/pages/zh/pricing.astro")],
  ["website/src/pages/go-to-market.astro", enGtm],
  ["website/src/pages/zh/go-to-market.astro", zhGtm],
];

assertIncludes(envExample, "TRADING_MODE=paper", ".env.example keeps paper trading default.");
assertIncludes(envExample, "ENABLE_LIVE_TRADING=false", ".env.example keeps live trading disabled.");
assertIncludes(envExample, "BROKER_PROVIDER=paper", ".env.example keeps paper broker provider.");

assertIncludes(content, "Trading OS for Taiwan Index Futures", "English hero keeps Trading OS positioning.");
assertIncludes(content, "台灣指數期貨 Trading OS", "Chinese hero keeps Trading OS positioning.");
assertRegex(content, /paper-first|Paper-first|paper-only/i, "English copy keeps paper-first posture.");
assertRegex(content, /紙上優先|紙上交易|paper-only/i, "Chinese copy keeps paper-first posture.");
assertIncludes(content, "not investment advice", "English copy includes non-advisory language.");
assertIncludes(content, "不構成投資建議", "Chinese copy includes non-advisory language.");
assertIncludes(localizedHome, "ENABLE_LIVE_TRADING=false", "Homepage renders ENABLE_LIVE_TRADING=false.");
assertIncludes(localizedHome, "TRADING_MODE=paper", "Homepage renders TRADING_MODE=paper.");
assertIncludes(localizedHome, "BROKER_PROVIDER=paper", "Homepage renders BROKER_PROVIDER=paper.");

assertIncludes(enGtm, 'class="kpi-grid"', "English GTM page renders KPI dashboard as a grid.");
assertIncludes(zhGtm, 'class="kpi-grid"', "Chinese GTM page renders KPI dashboard as a grid.");
assertIncludes(enGtm, 'class="kpi-card"', "English GTM page renders KPI cards.");
assertIncludes(zhGtm, 'class="kpi-card"', "Chinese GTM page renders KPI cards.");
assertRegex(css, /\.kpi-grid\s*\{[\s\S]*grid-template-columns/, "CSS defines KPI grid columns.");
assertRegex(css, /@media[\s\S]*\.kpi-grid/, "CSS includes responsive KPI grid handling.");

const prohibitedClaims = [
  "guaranteed profit",
  "risk-free",
  "fully automated money machine",
  "guaranteed alpha",
  "principal guaranteed",
  "no loss",
  "保證獲利",
  "零風險",
  "全自動賺錢機器",
  "保證 alpha",
  "本金保證",
  "不會虧損",
];

const safeContextPattern =
  /(not|no|must not|do not|does not|without|avoid|prohibited|forbidden|compliance|review|dependent|warning|notice|不得|不能|不|無|避免|禁止|合規|審查|聲明|不構成)/i;

for (const [file, source] of marketingSources) {
  const lower = source.toLowerCase();
  for (const phrase of prohibitedClaims) {
    const needle = phrase.toLowerCase();
    let index = lower.indexOf(needle);
    while (index !== -1) {
      const before = source.slice(Math.max(0, index - 120), index);
      if (!safeContextPattern.test(before)) {
        fail(`Unsafe positive claim "${phrase}" in ${file}. Add compliance-safe context or remove it.`);
      }
      index = lower.indexOf(needle, index + needle.length);
    }
  }
}
if (!failures.some((item) => item.includes("Unsafe positive claim"))) {
  pass("Prohibited claim scan found no unsafe positive marketing usage.");
}

const ctaSources = [
  ["website/src/components/LocalizedHome.astro", localizedHome],
  ["website/src/components/CallToAction.astro", read("website/src/components/CallToAction.astro")],
  ["website/src/pages/business.astro", read("website/src/pages/business.astro")],
  ["website/src/pages/zh/business.astro", read("website/src/pages/zh/business.astro")],
  ["website/src/pages/pricing.astro", read("website/src/pages/pricing.astro")],
  ["website/src/pages/zh/pricing.astro", read("website/src/pages/zh/pricing.astro")],
  ["website/src/pages/go-to-market.astro", enGtm],
  ["website/src/pages/zh/go-to-market.astro", zhGtm],
];

const unsafeCtaPattern =
  /(open\s*account|start\s*live|activate\s*live|live\s*trading|place\s*order|submit\s*order|copy\s*trade|copy\s*trading|broker\s*login|approve\s*live|開戶|啟用實盤|開始實盤|實盤下單|立即下單|送單|跟單|券商登入|批准實盤)/i;

for (const [file, source] of ctaSources) {
  for (const anchor of extractAnchors(source)) {
    const combined = `${anchor.href} ${anchor.label}`;
    if (unsafeCtaPattern.test(combined)) {
      fail(`Unsafe CTA or link in ${file}: ${combined}`);
    }
  }
}
if (!failures.some((item) => item.includes("Unsafe CTA"))) {
  pass("CTA scan found no live-trading, broker-login, order, or account-opening actions.");
}

const trackingPattern = /(gtag|google-analytics|googletagmanager|hotjar|segment\.com|mixpanel|facebook pixel|fbq\()/i;
for (const [file, source] of marketingSources) {
  if (trackingPattern.test(source)) {
    fail(`Unexpected analytics or tracking snippet in ${file}.`);
  }
}
if (!failures.some((item) => item.includes("tracking"))) {
  pass("No third-party tracking snippets found in website marketing sources.");
}

if (failures.length > 0) {
  console.error("Website content safety check failed:");
  for (const item of failures) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Website content safety check passed:");
for (const item of checks) {
  console.log(`- ${item}`);
}
