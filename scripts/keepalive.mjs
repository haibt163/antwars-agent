#!/usr/bin/env node
/**
 * Keepalive for one Antwars match seat.
 *
 * Purpose: the server forfeits a seat after houseIdleSeconds (300 s default)
 * without an accepted authenticated game-tool call. Model turns can be minutes
 * apart (2026-11-09: 3 m 05 s and 2 m 13 s between completions), so this process
 * makes one cheap accepted call per interval, independently of model turns.
 *
 * It sends only `observe` (no map, no since). Every resetting call builds a view
 * and drains the agent's pendingEvents; `observe` is the smallest such call.
 * Drained events are still retained in the agent's history (`observe {since:0}`),
 * and this log records their types so a missed notice can be spotted.
 *
 * The key is read from a file (raw key, or a NAME=<json string> line) and is
 * never printed: not on argv, not in the log, not in errors.
 *
 * Usage (live slot server):
 *   node scripts/keepalive.mjs --url https://<slot>.run.app/mcp --key-file %USERPROFILE%\.antwars\key --seat 1
 *   (--key-name NAME selects one NAME=<json string> line in a multi-key file)
 * Local comparison server (no key):
 *   node scripts/keepalive.mjs --url http://127.0.0.1:18085/mcp --token <reconnectToken>
 *
 * Stop: write the stop file (default <log>.stop) or send SIGINT. Exit 0 on
 * match end, stop, SIGINT/SIGTERM; 1 on a refused or unreadable seat.
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PROTOCOL = "2025-06-18";
const REQUEST_TIMEOUT_MS = 20_000;

function arg(name, env, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  if (at !== -1 && process.argv[at + 1] !== undefined) return process.argv[at + 1];
  const value = process.env[env];
  return value === undefined || value === "" ? fallback : value;
}

const url = arg("url", "ANTWAR_MCP_URL", "");
const keyFile = arg("key-file", "ANTWAR_KEY_FILE", join(homedir(), ".antwars", "key"));
const keyName = arg("key-name", "ANTWARS_KEY_NAME", "");
const seat = Number(arg("seat", "ANTWAR_SEAT", "1"));
const token = arg("token", "ANTWAR_RECONNECT_TOKEN", "");
const intervalS = Math.max(5, Number(arg("interval", "ANTWAR_INTERVAL_S", "60")));
const logPath = arg("log", "ANTWAR_LOG", join(homedir(), ".antwars", "keepalive.log"));
const stopPath = arg("stop-file", "ANTWAR_STOP_FILE", `${logPath}.stop`);
const once = process.argv.includes("--once");

if (!url) {
  console.error("keepalive: --url or ANTWAR_MCP_URL is required");
  process.exit(2);
}

// --detach: spawn this script detached from the caller's console and exit.
// Windows: detached + stdio ignore + windowsHide keeps it alive after the
// parent turn ends; the child logs its own pid in the start line.
if (process.argv.includes("--detach")) {
  const args = process.argv.slice(2).filter((value) => value !== "--detach");
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), ...args], {
    detached: true, stdio: "ignore", windowsHide: true,
  });
  child.unref();
  console.log(`keepalive detached pid ${child.pid}; heartbeats in ${logPath}`);
  process.exit(0);
}

let key = "";
if (!token) {
  try {
    key = readKey(keyFile);
  } catch (error) {
    console.error(`keepalive: ${error.message}`);
    process.exit(2);
  }
}

/** A raw key file, or the seat key file format (NAME=<json string>). Never printed. */
function readKey(file) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    throw new Error(`key file not readable: ${file}`);
  }
  for (const line of text.split(/\r?\n/)) {
    const at = line.indexOf("=");
    if (at <= 0) continue;
    if (keyName !== "" && line.slice(0, at).trim() !== keyName) continue;
    const raw = line.slice(at + 1).trim();
    if (raw.startsWith('"')) return JSON.parse(raw);
    return raw;
  }
  const raw = text.trim();
  if (raw === "") throw new Error(`key file is empty: ${file}`);
  return raw;
}

function logLine(entry) {
  try {
    appendFileSync(logPath, `${JSON.stringify({ at: new Date().toISOString(), pid: process.pid, ...entry })}\n`);
  } catch {
    // A full or locked log must not stop the keepalive.
  }
}

let session = null;
let failures = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function post(body, withSession = true) {
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream" };
  if (withSession && session !== null) {
    headers["mcp-session-id"] = session;
    headers["mcp-protocol-version"] = PROTOCOL;
  }
  const response = await fetch(url, {
    method: "POST", headers, body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await response.text();
  return { response, text };
}

/** The JSON-RPC reply with this id from a JSON or SSE body. */
function reply(contentType, text, id) {
  const messages = (contentType ?? "").includes("text/event-stream")
    ? text.split(/\r?\n\r?\n/).flatMap((frame) => frame.split(/\r?\n/)
      .filter((line) => line.startsWith("data:")).map((line) => line.slice(5).replace(/^ /, "")).join("\n"))
      .filter((data) => data.trim() !== "")
      .map((data) => { try { return JSON.parse(data); } catch { return null; } })
    : [JSON.parse(text)].flat();
  return messages.find((message) => message && message.id === id && ("result" in message || "error" in message)) ?? null;
}

let nextId = 1;

async function initialize() {
  const id = nextId++;
  const { response } = await post({ jsonrpc: "2.0", id, method: "initialize",
    params: { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: "antwars-keepalive", version: "1.0.0" } } }, false);
  const sessionId = response.headers.get("mcp-session-id");
  if (!response.ok || sessionId === null) throw new Error(`initialize failed: HTTP ${response.status}`);
  session = sessionId;
  await post({ jsonrpc: "2.0", method: "notifications/initialized" });
}

/** One tool call. Returns { ok, data, errorCode }. */
async function call(name, args = {}) {
  if (session === null) await initialize();
  const id = nextId++;
  const { response, text } = await post({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });
  if (response.status === 404) {
    session = null;
    return { ok: false, data: null, errorCode: "session_gone" };
  }
  const message = reply(response.headers.get("content-type"), text, id);
  if (message === null) throw new Error(`no reply (HTTP ${response.status})`);
  if (message.error) {
    // The transport-level "Unknown session" refusal.
    if (String(message.error.message ?? "").startsWith("Unknown session")) {
      session = null;
      return { ok: false, data: null, errorCode: "session_gone" };
    }
    throw new Error(`rpc ${message.error.code}: ${String(message.error.message ?? "").slice(0, 160)}`);
  }
  const result = message.result;
  const data = result?.structuredContent ?? JSON.parse((result?.content ?? []).filter((part) => part.type === "text")
    .map((part) => part.text).join("\n") || "null");
  const errorCode = data?.error?.code ?? null;
  return { ok: result?.isError !== true && errorCode === null, data, errorCode };
}

async function joinSeat() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const joined = token === ""
      ? await call("join", { key, seat })
      : await call("join", { reconnectToken: token });
    if (joined.ok) return joined;
    if (joined.errorCode === "lobby_loading") {
      await sleep(Number(joined.data?.retryAfterMs) > 0 ? Number(joined.data.retryAfterMs) : 1000);
      continue;
    }
    if (joined.errorCode === "call_rate") {
      await sleep(Number(joined.data?.retryAfterMs) > 0 ? Number(joined.data.retryAfterMs) : 1000);
      continue;
    }
    return joined;
  }
  return { ok: false, data: null, errorCode: "join_retries" };
}

let stopping = false;
function stop(reason, code) {
  if (stopping) return;
  stopping = true;
  logLine({ event: "exit", reason, code });
  process.exit(code);
}

process.on("SIGINT", () => stop("sigint", 0));
process.on("SIGTERM", () => stop("sigterm", 0));
process.on("unhandledRejection", (error) => {
  logLine({ event: "fatal", error: String(error?.message ?? error).slice(0, 200) });
  process.exit(1);
});

async function heartbeat() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const observed = await call("observe", {});
    if (observed.ok) {
      const view = observed.data?.view ?? {};
      const status = observed.data?.status ?? observed.data?.observeInfo?.status ?? null;
      const events = (view.events ?? []).map((event) => `${event.type ?? "?"}@${event.tick ?? "?"}`).slice(0, 8);
      logLine({ event: "heartbeat", ok: true, tick: view.tick ?? null, idleLeft: Array.isArray(status) ? status[0] : null, events });
      failures = 0;
      return true;
    }
    if (observed.errorCode === "session_gone") {
      const rejoined = await joinSeat();
      if (!rejoined.ok) return stopFailed(rejoined);
      continue;
    }
    if (observed.errorCode === "call_rate") {
      await sleep(Number(observed.data?.retryAfterMs) > 0 ? Number(observed.data.retryAfterMs) : 1000);
      continue;
    }
    if (observed.errorCode === "match_over" || observed.errorCode === "match_not_played") return stop(observed.errorCode, 0);
    return stopFailed(observed);
  }
  logLine({ event: "heartbeat", ok: false, error: "retries" });
  return false;
}

function stopFailed(outcome) {
  logLine({ event: "refused", code: outcome.errorCode, ok: false });
  stop(`refused:${outcome.errorCode ?? "unknown"}`, 1);
  return false;
}

async function main() {
  logLine({ event: "start", url, intervalS, mode: token === "" ? "key" : "token" });
  const joined = await joinSeat();
  if (!joined.ok) stopFailed(joined);
  logLine({ event: "joined", agentId: joined.data?.agentId ?? null });
  if (once) {
    await heartbeat();
    stop("once", 0);
  }
  await heartbeat();

  const stopWatch = setInterval(() => {
    if (existsSync(stopPath)) {
      clearInterval(stopWatch);
      stop("stop_file", 0);
    }
  }, 1000);
  stopWatch.unref();

  for (;;) {
    await sleep(intervalS * 1000);
    if (stopping) break;
    const observed = await heartbeat();
    if (observed === false) failures += 1;
    if (failures >= 3) stop("three_failures", 1);
  }
}

main().catch((error) => {
  logLine({ event: "fatal", error: String(error?.message ?? error).slice(0, 200) });
  process.exit(1);
});
