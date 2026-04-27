#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(websiteRoot, "..");

const failures = [];
const checks = [];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function pass(message) {
  checks.push(message);
}

function fail(message) {
  failures.push(message);
}

function assertFile(relativePath) {
  if (existsSync(join(repoRoot, relativePath))) {
    pass(`Route/source exists: ${relativePath}`);
  } else {
    fail(`Missing route/source: ${relativePath}`);
  }
}

function assertIncludes(text, needle, message) {
  if (text.includes(needle)) {
    pass(message);
  } else {
    fail(`${message} Missing: ${needle}`);
  }
}

const content = read("website/src/i18n/content.ts");
const siteNav = read("website/src/components/SiteNav.astro");
const languageSwitch = read("website/src/components/LanguageSwitch.astro");
const localizedHome = read("website/src/components/LocalizedHome.astro");

const requiredRoutePairs = [
  ["website/src/pages/index.astro", "website/src/pages/zh/index.astro"],
  ["website/src/pages/business.astro", "website/src/pages/zh/business.astro"],
  ["website/src/pages/pricing.astro", "website/src/pages/zh/pricing.astro"],
  ["website/src/pages/go-to-market.astro", "website/src/pages/zh/go-to-market.astro"],
  ["website/src/pages/compliance.astro", "website/src/pages/zh/compliance.astro"],
];

for (const [enRoute, zhRoute] of requiredRoutePairs) {
  assertFile(enRoute);
  assertFile(zhRoute);
}

const enStart = content.indexOf("  en: {");
const zhStart = content.indexOf("  zh: {");
if (enStart === -1 || zhStart === -1) {
  fail("content.ts must define both en and zh locale blocks.");
} else {
  pass("content.ts defines en and zh locale blocks.");
}

const enBlock = enStart === -1 || zhStart === -1 ? "" : content.slice(enStart, zhStart);
const zhBlock = zhStart === -1 ? "" : content.slice(zhStart);

const requiredSections = [
  "hero",
  "thesis",
  "business",
  "instruments",
  "architecture",
  "safety",
  "modules",
  "commercial",
  "segments",
  "moat",
  "roadmap",
  "governance",
  "compliance",
  "cta",
];

for (const section of requiredSections) {
  assertIncludes(enBlock, `${section}:`, `English locale includes ${section}.`);
  assertIncludes(zhBlock, `${section}:`, `Chinese locale includes ${section}.`);
}

const requiredEnglishTerms = [
  "Trading OS",
  "Paper-first",
  "paper-only",
  "not investment advice",
  "Risk Engine",
  "OMS",
  "Broker Gateway",
];

for (const term of requiredEnglishTerms) {
  assertIncludes(enBlock, term, `English locale includes "${term}".`);
}

const requiredChineseTerms = [
  "Trading OS",
  "紙上",
  "不構成投資建議",
  "風險引擎",
  "OMS",
  "券商閘道",
];

for (const term of requiredChineseTerms) {
  assertIncludes(zhBlock, term, `Chinese locale includes "${term}".`);
}

const homeMarkup = `${localizedHome}\n${siteNav}\n${languageSwitch}`;
for (const term of ["TRADING_MODE=paper", "ENABLE_LIVE_TRADING=false", "BROKER_PROVIDER=paper"]) {
  assertIncludes(homeMarkup, term, `Homepage or shared component renders ${term}.`);
}

const navPairs = [
  ["Business", "商業模式"],
  ["Pricing", "定價策略"],
  ["Go-to-Market", "市場進入"],
  ["Compliance", "合規邊界"],
];

for (const [en, zh] of navPairs) {
  assertIncludes(`${siteNav}\n${languageSwitch}`, en, `Navigation includes ${en}.`);
  assertIncludes(`${siteNav}\n${languageSwitch}`, zh, `Navigation includes ${zh}.`);
}

assertIncludes(content, 'english: "EN"', "Language content includes EN switch label.");
assertIncludes(content, 'chinese: "繁中"', "Language content includes Traditional Chinese switch label.");

const enCommercialPathCount = (enBlock.match(/title: "/g) ?? []).length;
const zhCommercialPathCount = (zhBlock.match(/title: "/g) ?? []).length;
if (enCommercialPathCount < 20 || zhCommercialPathCount < 20) {
  fail("Locale content appears too sparse for current commercial/home sections.");
} else {
  pass("Both locales include substantial commercial/home section content.");
}

if (failures.length > 0) {
  console.error("Website i18n content check failed:");
  for (const item of failures) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Website i18n content check passed:");
for (const item of checks) {
  console.log(`- ${item}`);
}
