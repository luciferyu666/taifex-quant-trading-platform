#!/usr/bin/env node

import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const backendDir = join(repoRoot, "backend");
const frontendDir = join(repoRoot, "frontend");
const backendPython = join(backendDir, ".venv", "bin", "python");
const timeoutMs = Number(process.env.PAPER_UI_SMOKE_TIMEOUT_MS || 180000);
const requestTimeoutMs = Number(process.env.PAPER_UI_SMOKE_REQUEST_TIMEOUT_MS || 30000);
const smokeMode = process.argv.includes("--local-backend-demo")
  ? "local-backend-demo"
  : process.env.PAPER_UI_SMOKE_MODE || "approval-ui-flow";

const checks = [];
const failures = [];
const childProcesses = [];
let chromeClient = null;
let tempDir = "";
let cleanupTempDir = true;

function addCheck(message) {
  checks.push(message);
}

function addFailure(message) {
  failures.push(message);
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
    server.on("error", reject);
  });
}

function spawnLogged(label, command, args, options) {
  const detached = process.platform !== "win32";
  const child = spawn(command, args, {
    ...options,
    detached,
    stdio: ["ignore", "pipe", "pipe"],
  });
  childProcesses.push({ child, detached, label });
  child.stdout.on("data", (chunk) => process.stdout.write(`[${label}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
  child.on("exit", (code, signal) => {
    if (code !== null && code !== 0) {
      process.stderr.write(`[${label}] exited with code ${code}\n`);
    }
    if (signal) {
      process.stderr.write(`[${label}] exited with signal ${signal}\n`);
    }
  });
  return child;
}

async function waitForHttp(url, label) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (response.ok) {
        addCheck(`${label} returned HTTP ${response.status}`);
        return;
      }
    } catch {
      // Service may still be starting.
    }
    await sleep(1000);
  }
  throw new Error(`${label} did not become ready: ${url}`);
}

async function firstExistingPath(paths) {
  const { access } = await import("node:fs/promises");
  for (const path of paths) {
    if (!path) {
      continue;
    }
    try {
      await access(path);
      return path;
    } catch {
      // Continue.
    }
  }
  return "";
}

async function findChromePath() {
  const configured = process.env.PAPER_UI_SMOKE_CHROME_PATH;
  const path = await firstExistingPath([
    configured,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/mnt/c/Program Files/Google/Chrome Dev/Application/chrome.exe",
    "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
    "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ]);

  if (!path) {
    throw new Error(
      "No Chrome/Chromium/Edge executable found. Set PAPER_UI_SMOKE_CHROME_PATH to run the browser UI drill.",
    );
  }

  return path;
}

async function toChromePath(path, shouldConvert) {
  if (!shouldConvert) {
    return path;
  }

  return new Promise((resolvePath) => {
    const child = spawn("wslpath", ["-w", path], { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("close", (code) => {
      resolvePath(code === 0 && output.trim() ? output.trim() : path);
    });
  });
}

async function toWindowsPath(path) {
  return toChromePath(path, true);
}

class CdpClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.socket = null;
  }

  async connect() {
    this.socket = new WebSocket(this.webSocketUrl);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data.toString());
      if (!message.id) {
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result || {});
      }
    });
    await new Promise((resolveOpen, rejectOpen) => {
      this.socket.addEventListener("open", resolveOpen, { once: true });
      this.socket.addEventListener("error", rejectOpen, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.socket.send(payload);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text ||
          "Browser evaluation failed",
      );
    }
    return result.result?.value;
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

async function getWindowsHostIp() {
  try {
    const resolvConf = await readFile("/etc/resolv.conf", "utf8");
    const match = resolvConf.match(/^nameserver\s+([^\s]+)/m);
    if (match?.[1]) {
      return match[1];
    }
  } catch {
    // Fall back to localhost below.
  }
  return "127.0.0.1";
}

async function waitForChrome(cdpHost, cdpPort) {
  const versionUrl = `http://${cdpHost}:${cdpPort}/json/version`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(versionUrl);
      if (response.ok) {
        addCheck("Chrome DevTools endpoint returned HTTP 200");
        return;
      }
    } catch {
      // Chrome may still be starting.
    }
    await sleep(500);
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

async function createPage(cdpHost, cdpPort, url) {
  const newTarget = await fetch(
    `http://${cdpHost}:${cdpPort}/json/new?${encodeURIComponent(url)}`,
    { method: "PUT" },
  );
  if (!newTarget.ok) {
    throw new Error(`Could not create Chrome target: HTTP ${newTarget.status}`);
  }
  const target = await newTarget.json();
  const webSocketDebuggerUrl = String(target.webSocketDebuggerUrl || "")
    .replace("ws://127.0.0.1:", `ws://${cdpHost}:`)
    .replace("ws://localhost:", `ws://${cdpHost}:`);
  const client = new CdpClient(webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  chromeClient = client;
  await waitForPageReady(client);
  return client;
}

async function waitForPageReady(client) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60000) {
    try {
      const ready = await client.evaluate(`
        document.readyState === "complete" &&
          Boolean(document.body?.innerText?.includes("Web Command Center"))
      `);
      if (ready) {
        return;
      }
    } catch {
      // Navigation can destroy the current execution context; retry until stable.
    }
    await sleep(500);
  }
  throw new Error("Command Center page did not become ready.");
}

async function reloadAndOpenPaperTab(client) {
  await client.send("Page.reload", { ignoreCache: true });
  await sleep(1200);
  await waitForPageReady(client);
  await openPaperTab(client);
}

async function openPaperTab(client) {
  await client.evaluate(`${browserHelpers}
    (async () => {
      await waitFor(() => document.getElementById("tab-paper"), "Paper OMS tab button", 30000);
      const button = document.getElementById("tab-paper");
      const startedAt = Date.now();
      while (Date.now() - startedAt < 30000) {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        await wait(500);
        const panel = document.getElementById("panel-paper");
        if (panel && panel.hidden === false && !panel.hasAttribute("hidden")) {
          return true;
        }
      }
      await waitFor(() => {
        const panel = document.getElementById("panel-paper");
        return panel && panel.hidden === false;
      }, "Paper OMS tab");
    })()
  `);
  addCheck("Opened Paper OMS tab through the UI");
}

async function createApprovalRequest(client) {
  const result = await client.evaluate(`${browserHelpers}
    (async () => {
      const section = sectionByTitle("paper-approval-request-title");
      clickButton(section, "Create Approval Request");
      await waitFor(
        () => section.innerText.includes("Paper approval request created locally."),
        "approval request success",
      );
      const match = section.innerText.match(/paper-approval-request-[a-f0-9]+/);
      if (!match) {
        throw new Error("Created approval_request_id was not visible in the UI.");
      }
      if (!section.innerText.includes("pending_review")) {
        throw new Error("Created approval request did not start at pending_review.");
      }
      return {
        approvalRequestId: match[0],
        text: section.innerText,
      };
    })()
  `);
  addCheck(`Created paper approval request via UI: ${result.approvalRequestId}`);
  return result.approvalRequestId;
}

async function recordDecision(client, approvalRequestId, decision, reviewerId, reason) {
  const result = await client.evaluate(`${browserHelpers}
    (async () => {
      const section = sectionByTitle("paper-approval-decision-title");
      const approvalRequestId = ${JSON.stringify(approvalRequestId)};
      const decision = ${JSON.stringify(decision)};
      const reviewerRole = decision === "approved_for_paper_simulation" ? "risk_reviewer" : "research_reviewer";
      await waitFor(
        () => Array.from(section.querySelectorAll("option")).some((option) => option.value === approvalRequestId),
        "approval request option",
      );
      const selects = section.querySelectorAll("select");
      const inputs = Array.from(section.querySelectorAll("input")).filter((input) => !input.readOnly);
      const textarea = section.querySelector("textarea");
      setNativeValue(selects[0], approvalRequestId);
      selects[0].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(selects[1], decision);
      selects[1].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(selects[2], reviewerRole);
      selects[2].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(inputs[0], ${JSON.stringify(reviewerId)});
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(textarea, ${JSON.stringify(reason)});
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
      clickButton(section, "Record Decision");
      await waitFor(
        () => section.innerText.includes("Paper reviewer decision recorded locally."),
        "reviewer decision success",
      );
      if (!section.innerText.includes(decision)) {
        throw new Error("Decision result did not include " + decision + ".");
      }
      return {
        approvalRequestId,
        decision,
        text: section.innerText,
      };
    })()
  `);
  addCheck(`Recorded ${result.decision} via UI for ${result.approvalRequestId}`);
  return result;
}

async function submitPaperSimulation(client, approvalRequestId) {
  const result = await client.evaluate(`${browserHelpers}
    (async () => {
      const section = sectionByTitle("paper-submit-title");
      const approvalRequestId = ${JSON.stringify(approvalRequestId)};
      await waitFor(
        () => Array.from(section.querySelectorAll("option")).some((option) => option.value === approvalRequestId),
        "approved approval request option",
      );
      const selects = section.querySelectorAll("select");
      const inputs = Array.from(section.querySelectorAll("input")).filter((input) => !input.readOnly);
      setNativeValue(selects[0], approvalRequestId);
      selects[0].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(selects[1], "TMF");
      selects[1].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(inputs[0], "1");
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
      setNativeValue(selects[2], "fill");
      selects[2].dispatchEvent(new Event("change", { bubbles: true }));
      clickButton(section, "Create Paper Simulation");
      await waitFor(
        () => section.innerText.includes("Paper simulation recorded locally."),
        "paper simulation success",
      );
      const workflowMatch = section.innerText.match(/paper-workflow-[a-f0-9]+/);
      const orderMatch = section.innerText.match(/paper-order-[a-f0-9]+/);
      if (!workflowMatch || !orderMatch) {
        throw new Error("Paper simulation result did not show workflow/order IDs.");
      }
      if (!section.innerText.includes("FILLED")) {
        throw new Error("Paper simulation result did not show final FILLED OMS status.");
      }
      return {
        workflowRunId: workflowMatch[0],
        orderId: orderMatch[0],
        text: section.innerText,
      };
    })()
  `);
  addCheck(`Submitted controlled paper simulation via UI: ${result.workflowRunId}`);
  return result;
}

async function verifyOmsAuditViewer(client, workflowRunId, orderId) {
  await client.evaluate(`${browserHelpers}
    (async () => {
      const workflowRunId = ${JSON.stringify(workflowRunId)};
      const orderId = ${JSON.stringify(orderId)};
      const section = sectionByTitle("paper-records-title");
      await waitFor(
        () => section.innerText.includes(workflowRunId) && section.innerText.includes(orderId),
        "paper record visible",
      );
      if (!document.getElementById("paper-oms-title")) {
        throw new Error("OMS timeline panel was not visible.");
      }
      if (!document.getElementById("paper-audit-title")) {
        throw new Error("Audit timeline panel was not visible.");
      }
      if (!section.innerText.includes("FILLED")) {
        throw new Error("Paper records viewer did not show final OMS status.");
      }
      if (!section.innerText.includes("true")) {
        throw new Error("Paper records viewer did not expose paper-only safety flags.");
      }
      return {
        workflowRunId,
        orderId,
        text: section.innerText,
      };
    })()
  `);
  addCheck(`Verified OMS/Audit viewer for ${workflowRunId}`);
}

const browserHelpers = `
  var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function waitFor(predicate, label, timeoutMs = 15000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (predicate()) {
        return true;
      }
      await wait(250);
    }
    throw new Error("Timed out waiting for " + label);
  }

  function normalize(value) {
    return String(value || "").replace(/\\s+/g, " ").trim();
  }

  function sectionByTitle(titleId) {
    const heading = document.getElementById(titleId);
    if (!heading) {
      throw new Error("Missing section heading: " + titleId);
    }
    const section = heading.closest("section");
    if (!section) {
      throw new Error("Missing section for heading: " + titleId);
    }
    return section;
  }

  function clickButton(root, text) {
    const button = Array.from(root.querySelectorAll("button")).find((candidate) =>
      normalize(candidate.innerText).includes(text),
    );
    if (!button) {
      throw new Error("Missing button: " + text);
    }
    if (button.disabled) {
      throw new Error("Button is disabled: " + text);
    }
    button.click();
    return button;
  }

  function controlByLabel(root, labelText) {
    const label = Array.from(root.querySelectorAll("label")).find((candidate) =>
      normalize(candidate.innerText).includes(labelText),
    );
    if (!label) {
      throw new Error("Missing label: " + labelText);
    }
    const control = label.querySelector("input, select, textarea");
    if (!control) {
      throw new Error("Missing control for label: " + labelText);
    }
    return control;
  }

  function setNativeValue(control, value) {
    const prototype =
      control instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : control instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    descriptor.set.call(control, String(value));
  }

  function setField(root, labelText, value) {
    const control = controlByLabel(root, labelText);
    setNativeValue(control, value);
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }
`;

function printPassedChecks(approvalRequestId, workflowRunId, orderId) {
  console.log("Paper approval UI flow smoke drill passed:");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
  console.log(`- approval_request_id=${approvalRequestId}`);
  console.log(`- workflow_run_id=${workflowRunId}`);
  console.log(`- order_id=${orderId}`);
  console.log("- paper_only=true");
  console.log("- live_trading_enabled=false");
  console.log("- broker_api_called=false");
  console.log("- Live trading remains disabled by default.");
}

async function runBrowserDrill({ chromePath, chromeProfilePath, cdpHost, cdpPort, frontendUrl }) {
  spawnLogged(
    "chrome",
    chromePath,
    [
      "--headless=new",
      "--no-first-run",
      "--disable-background-networking",
      "--disable-extensions",
      "--disable-gpu",
      "--no-default-browser-check",
      "--remote-debugging-address=0.0.0.0",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${chromeProfilePath}`,
      "about:blank",
    ],
    {
      cwd: repoRoot,
      env: process.env,
    },
  );

  await waitForChrome(cdpHost, cdpPort);
  const client = await createPage(cdpHost, cdpPort, frontendUrl);
  await openPaperTab(client);

  const approvalRequestId = await createApprovalRequest(client);

  await reloadAndOpenPaperTab(client);
  await recordDecision(
    client,
    approvalRequestId,
    "research_approved",
    "ui-smoke-research-reviewer",
    "Browser UI smoke drill: research approval for paper-only review.",
  );

  await reloadAndOpenPaperTab(client);
  await recordDecision(
    client,
    approvalRequestId,
    "approved_for_paper_simulation",
    "ui-smoke-risk-reviewer",
    "Browser UI smoke drill: risk approval for paper simulation only.",
  );

  await reloadAndOpenPaperTab(client);
  const { workflowRunId, orderId } = await submitPaperSimulation(client, approvalRequestId);

  await reloadAndOpenPaperTab(client);
  await verifyOmsAuditViewer(client, workflowRunId, orderId);

  printPassedChecks(approvalRequestId, workflowRunId, orderId);
}

async function runLocalBackendDemoBrowserDrill({
  chromePath,
  chromeProfilePath,
  cdpHost,
  cdpPort,
  frontendUrl,
}) {
  spawnLogged(
    "chrome",
    chromePath,
    [
      "--headless=new",
      "--no-first-run",
      "--disable-background-networking",
      "--disable-extensions",
      "--disable-gpu",
      "--no-default-browser-check",
      "--remote-debugging-address=0.0.0.0",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${chromeProfilePath}`,
      "about:blank",
    ],
    {
      cwd: repoRoot,
      env: process.env,
    },
  );

  await waitForChrome(cdpHost, cdpPort);
  const client = await createPage(cdpHost, cdpPort, frontendUrl);
  await verifyLocalBackendDemoPanel(client);
  await openPaperTab(client);
  const { workflowRunId, orderId } = await verifySeededPaperRecords(client);
  printLocalBackendDemoChecks(workflowRunId, orderId);
}

async function verifyLocalBackendDemoPanel(client) {
  await client.evaluate(`${browserHelpers}
    (async () => {
      const section = sectionByTitle("local-backend-demo-title");
      await waitFor(
        () =>
          section.innerText.includes("Local Backend Demo Mode") &&
          section.innerText.includes("cannot directly read your local SQLite") &&
          section.innerText.includes("make backend") &&
          section.innerText.includes("make frontend") &&
          section.innerText.includes("make seed-paper-execution-demo") &&
          section.innerText.includes("make paper-execution-persistence-check") &&
          section.innerText.includes("PRODUCTION_SQLITE_ACCESS=false") &&
          section.innerText.includes("ENABLE_LIVE_TRADING=false"),
        "local backend demo mode panel",
        30000,
      );
      return section.innerText;
    })()
  `);
  addCheck("Verified Local Backend Demo Mode panel and local setup commands");
}

async function verifySeededPaperRecords(client) {
  const result = await client.evaluate(`${browserHelpers}
    (async () => {
      const section = sectionByTitle("paper-records-title");
      await waitFor(
        () =>
          section.innerText.includes("demo-paper-strategy") &&
          section.innerText.includes("PARTIALLY_FILLED") &&
          /paper-workflow-[a-f0-9]+/.test(section.innerText) &&
          /paper-order-[a-f0-9]+/.test(section.innerText),
        "seeded paper workflow record",
        30000,
      );
      const workflowMatch = section.innerText.match(/paper-workflow-[a-f0-9]+/);
      const orderMatch = section.innerText.match(/paper-order-[a-f0-9]+/);
      const omsPanel = document.getElementById("paper-oms-title")?.closest("article");
      const auditPanel = document.getElementById("paper-audit-title")?.closest("article");
      if (!workflowMatch || !orderMatch) {
        throw new Error("Seeded workflow/order IDs were not visible.");
      }
      if (!omsPanel || !auditPanel) {
        throw new Error("OMS or Audit timeline panel was not visible.");
      }
      if (!omsPanel.innerText.includes("PARTIAL_FILL")) {
        throw new Error("OMS timeline did not include PARTIAL_FILL.");
      }
      if (!auditPanel.innerText.includes("paper_execution.paper_broker_simulated")) {
        throw new Error("Audit timeline did not include paper broker simulation audit event.");
      }
      return {
        workflowRunId: workflowMatch[0],
        orderId: orderMatch[0],
      };
    })()
  `);
  addCheck(`Verified seeded paper OMS/Audit viewer record: ${result.workflowRunId}`);
  return result;
}

function printLocalBackendDemoChecks(workflowRunId, orderId) {
  console.log("Local backend demo browser drill passed:");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
  console.log(`- workflow_run_id=${workflowRunId}`);
  console.log(`- order_id=${orderId}`);
  console.log("- paper_only=true");
  console.log("- live_trading_enabled=false");
  console.log("- broker_api_called=false");
  console.log("- local_sqlite_only=true");
  console.log("- production_vercel_sqlite_access=false");
  console.log("- Live trading remains disabled by default.");
}

async function waitForChild(child, label) {
  return new Promise((resolveChild, rejectChild) => {
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolveChild();
        return;
      }
      rejectChild(new Error(`${label} exited with ${signal || `code ${code}`}`));
    });
  });
}

function quotePowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function runWindowsBrowserWorker({ chromePath, chromeProfilePath, cdpPort, frontendUrl }) {
  const scriptPath = await toWindowsPath(fileURLToPath(import.meta.url));
  const escapedScriptPath = scriptPath.replace(/`/g, "``").replace(/"/g, '`"');
  const envAssignments = [
    ["PAPER_UI_SMOKE_BROWSER_WORKER", "1"],
    ["PAPER_UI_SMOKE_CHROME_PATH", chromePath],
    ["PAPER_UI_SMOKE_CHROME_PROFILE_PATH", chromeProfilePath],
    ["PAPER_UI_SMOKE_CDP_PORT", String(cdpPort)],
    ["PAPER_UI_SMOKE_FRONTEND_URL", frontendUrl],
    ["PAPER_UI_SMOKE_MODE", smokeMode],
  ]
    .map(([key, value]) => `$env:${key}=${quotePowerShell(value)}`)
    .join("; ");
  const command = `${envAssignments}; & node --experimental-websocket "${escapedScriptPath}" --browser-worker`;
  const child = spawn("powershell.exe", ["-NoProfile", "-Command", command], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
  childProcesses.push({ child, label: "browser-worker" });
  child.stdout.on("data", (chunk) => process.stdout.write(`[browser-worker] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[browser-worker] ${chunk}`));
  await waitForChild(child, "Windows browser worker");
}

async function browserWorkerMain() {
  const chromePath = process.env.PAPER_UI_SMOKE_CHROME_PATH;
  const chromeProfilePath = process.env.PAPER_UI_SMOKE_CHROME_PROFILE_PATH;
  const frontendUrl = process.env.PAPER_UI_SMOKE_FRONTEND_URL;
  const cdpPort = Number(process.env.PAPER_UI_SMOKE_CDP_PORT || 0);
  const mode = process.env.PAPER_UI_SMOKE_MODE || "approval-ui-flow";
  if (!chromePath || !chromeProfilePath || !frontendUrl || !cdpPort) {
    throw new Error("Browser worker is missing required paper UI smoke environment variables.");
  }
  const drill = mode === "local-backend-demo" ? runLocalBackendDemoBrowserDrill : runBrowserDrill;
  await drill({
    chromePath,
    chromeProfilePath,
    cdpHost: "127.0.0.1",
    cdpPort,
    frontendUrl,
  });
}

async function cleanup() {
  if (chromeClient) {
    chromeClient.close();
  }
  for (const { child, detached } of childProcesses.reverse()) {
    if (!child.killed) {
      try {
        process.kill(detached ? -child.pid : child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  }
  await sleep(500);
  for (const { child, detached } of childProcesses.reverse()) {
    if (!child.killed) {
      try {
        process.kill(detached ? -child.pid : child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    }
  }
  if (tempDir && cleanupTempDir) {
    try {
      await rm(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
    } catch (error) {
      console.warn(
        `Warning: could not remove temporary UI smoke directory ${tempDir}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  } else if (tempDir) {
    console.warn(`Temporary UI smoke directory retained for Windows browser cleanup: ${tempDir}`);
  }
}

async function main() {
  const tempRoot = resolve(process.env.PAPER_UI_SMOKE_TMP_ROOT || join(repoRoot, ".tmp"));
  await mkdir(tempRoot, { recursive: true });
  tempDir = await mkdtemp(join(tempRoot, "paper-approval-ui-flow-"));
  const backendPort = Number(process.env.PAPER_UI_SMOKE_BACKEND_PORT || (await getFreePort()));
  const frontendPort = Number(process.env.PAPER_UI_SMOKE_FRONTEND_PORT || (await getFreePort()));
  const cdpPort = Number(process.env.PAPER_UI_SMOKE_CDP_PORT || (await getFreePort()));
  const dbPath = join(tempDir, "paper_execution_audit.sqlite");
  const chromePath = await findChromePath();
  const chromeRunsAsWindowsProcess = chromePath.endsWith(".exe") || chromePath.startsWith("/mnt/");
  const cdpHost = process.env.PAPER_UI_SMOKE_CDP_HOST ||
    (chromeRunsAsWindowsProcess ? await getWindowsHostIp() : "127.0.0.1");
  const chromeProfilePath = await toChromePath(
    join(tempDir, "chrome-profile"),
    chromeRunsAsWindowsProcess,
  );
  const frontendUrl = `http://127.0.0.1:${frontendPort}/?lang=en`;

  spawnLogged(
    "backend",
    backendPython,
    ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", String(backendPort)],
    {
      cwd: backendDir,
      env: {
        ...process.env,
        PAPER_EXECUTION_AUDIT_DB_PATH: dbPath,
        TRADING_MODE: "paper",
        ENABLE_LIVE_TRADING: "false",
        BROKER_PROVIDER: "paper",
      },
    },
  );

  spawnLogged(
    "frontend",
    "npm",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(frontendPort)],
    {
      cwd: frontendDir,
      env: {
        ...process.env,
        NEXT_PUBLIC_BACKEND_URL: `http://127.0.0.1:${backendPort}`,
      },
    },
  );

  await waitForHttp(`http://127.0.0.1:${backendPort}/health`, "Backend health");
  await waitForHttp(frontendUrl, "Frontend Command Center");

  if (smokeMode === "local-backend-demo") {
    await seedLocalDemoRecord(dbPath);
  }

  if (chromeRunsAsWindowsProcess && process.env.PAPER_UI_SMOKE_FORCE_WSL_CDP !== "1") {
    cleanupTempDir = false;
    await runWindowsBrowserWorker({
      chromePath: await toWindowsPath(chromePath),
      chromeProfilePath,
      cdpPort,
      frontendUrl,
    });
    return;
  }

  const drill =
    smokeMode === "local-backend-demo" ? runLocalBackendDemoBrowserDrill : runBrowserDrill;
  await drill({
    chromePath,
    chromeProfilePath,
    cdpHost,
    cdpPort,
    frontendUrl,
  });
}

async function seedLocalDemoRecord(dbPath) {
  const child = spawnLogged(
    "seed-demo",
    backendPython,
    [join(repoRoot, "scripts", "seed-paper-execution-demo.py")],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        PAPER_EXECUTION_AUDIT_DB_PATH: dbPath,
        TRADING_MODE: "paper",
        ENABLE_LIVE_TRADING: "false",
        BROKER_PROVIDER: "paper",
      },
    },
  );
  await waitForChild(child, "Local paper demo seed");
  addCheck("Seeded one local SQLite paper OMS/audit demo record");
}

const entrypoint = process.argv.includes("--browser-worker") ? browserWorkerMain : main;

entrypoint()
  .catch((error) => {
    addFailure(error instanceof Error ? error.message : String(error));
    console.error("Paper approval UI flow smoke drill failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
  });
