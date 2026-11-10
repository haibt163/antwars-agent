#!/usr/bin/env node
/**
 * Open an Antwars match with zero model turns in the critical path.
 *
 * Why: the model needs 40-170 s per turn (measured from the session transcripts:
 * median 54.5 s on 2026-11-09, 3-6 s on 2026-11-04..06). A handoff that needs four
 * model turns (challenge_status -> locate_match -> initialize/tools_list -> join)
 * took 597 s on 2026-11-09, while the match itself ended at tick 5,015 (501 s) with
 * our colony never joined. This process does the whole handoff in one go:
 *
 *   request_challenge -> locate_match (poll 2 s) -> initialize -> join
 *   -> pick_nest -> set_brood workers -> FORAGE mark -> observe keepalive
 *
 * It seats the match server during the 120 s nest window, i.e. before the first
 * tick, so the opening (nest, brood, forage) happens at tick 0 instead of minutes
 * late, and it keeps the seat inside the 300 s forfeit afterwards.
 *
 * The key is read from a file and never printed: not on argv, not in the log.
 *
 * Usage:
 *   node scripts/open-match.mjs --detach --opponent antwars/gpt-6-astra
 *   node scripts/open-match.mjs --detach --lobby <lobbyId>          # route D, pre-arranged
 *   node scripts/open-match.mjs --detach --request <requestId>      # resume a pending challenge
 *   node scripts/open-match.mjs --detach --queue 1v1                # route D: ranked queue, then seat and open
 *   node scripts/open-match.mjs --mcp-url http://127.0.0.1:18085/mcp --token <t>   # local
 *   node scripts/open-match.mjs --detach --probe                    # read-only wiring check
 *
 * Logs JSONL to %USERPROFILE%\.antwars\opener.log; the current state, for the model
 * to resume from, is rewritten to %USERPROFILE%\.antwars\opener-state.json.
 * Exit codes: 0 match over or --once done, 1 refused/fatal, 2 bad usage,
 * 3 challenge ended before a join, 4 opponent unavailable.
 */
import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCells } from "./cells.mjs";

const PROTOCOL = "2025-06-18";
const REQUEST_TIMEOUT_MS = 20_000;
const CHALLENGE_WINDOW_MS = 15 * 60_000;

function arg(name, env, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  if (at !== -1 && process.argv[at + 1] !== undefined) return process.argv[at + 1];
  const value = process.env[env];
  return value === undefined || value === "" ? fallback : value;
}

const detach = process.argv.includes("--detach");
const once = process.argv.includes("--once");
const probe = process.argv.includes("--probe");

const home = join(homedir(), ".antwars");
const entryUrl = arg("entry-url", "ANTWAR_ENTRY_URL", "https://antwars.ai/mcp");
const directUrl = arg("mcp-url", "ANTWAR_MCP_URL", "");
const opponent = arg("opponent", "ANTWAR_OPPONENT", "");
const lobbyId = arg("lobby", "ANTWAR_LOBBY", "");
const requestId = arg("request", "ANTWAR_REQUEST", "");
const queueMode = arg("queue", "ANTWAR_QUEUE", "");
const keyFile = arg("key-file", "ANTWAR_KEY_FILE", join(home, "key"));
const keyName = arg("key-name", "ANTWARS_KEY_NAME", "");
const seat = Number(arg("seat", "ANTWAR_SEAT", "1"));
const token = arg("token", "ANTWAR_RECONNECT_TOKEN", "");
const intervalS = Math.max(15, Number(arg("interval", "ANTWAR_INTERVAL_S", "45")));
const forageCount = Math.max(1, Number(arg("forage-count", "ANTWAR_FORAGE_COUNT", "20")));
const autoForage = !process.argv.includes("--no-auto-forage");
const logPath = arg("log", "ANTWAR_LOG", join(home, "opener.log"));
const stopPath = arg("stop-file", "ANTWAR_STOP_FILE", `${logPath}.stop`);
const statePath = arg("state", "ANTWAR_STATE", join(home, "opener-state.json"));

if (directUrl === "" && lobbyId === "" && requestId === "" && opponent === "" && queueMode === "") {
  console.error("open-match: one of --opponent, --lobby, --request, --mcp-url is required");
  process.exit(2);
}

if (detach) {
  const args = process.argv.slice(2).filter((value) => value !== "--detach");
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), ...args], {
    detached: true, stdio: "ignore", windowsHide: true,
  });
  child.unref();
  console.log(`opener detached pid ${child.pid}; log ${logPath}`);
  process.exit(0);
}

// A stale stop file from an earlier match must not end this one.
try { rmSync(stopPath, { force: true }); } catch { /* ignore */ }

let key = "";
if (!token) {
  try {
    key = readKey(keyFile);
  } catch (error) {
    console.error(`open-match: ${error.message}`);
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

const state = { phase: "start", mcpUrl: null, lobbyId: lobbyId || null, requestId: requestId || null };
function saveState() {
  try { writeFileSync(statePath, `${JSON.stringify({ at: new Date().toISOString(), ...state }, null, 1)}\n`); } catch { /* ignore */ }
}
function logLine(entry) {
  try { appendFileSync(logPath, `${JSON.stringify({ at: new Date().toISOString(), pid: process.pid, ...entry })}\n`); } catch { /* ignore */ }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One Streamable-HTTP MCP session. Same wire shape as scripts/keepalive.mjs. */
function client(url, name) {
  const s = { url, session: null, nextId: 1 };
  const post = async (body, withSession = true) => {
    const headers = { "content-type": "application/json", accept: "application/json, text/event-stream" };
    if (withSession && s.session !== null) {
      headers["mcp-session-id"] = s.session;
      headers["mcp-protocol-version"] = PROTOCOL;
    }
    const response = await fetch(url, {
      method: "POST", headers, body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    return { response, text };
  };
  const reply = (contentType, text, id) => {
    const messages = (contentType ?? "").includes("text/event-stream")
      ? text.split(/\r?\n\r?\n/).flatMap((frame) => frame.split(/\r?\n/)
        .filter((line) => line.startsWith("data:")).map((line) => line.slice(5).replace(/^ /, "")).join("\n"))
        .filter((data) => data.trim() !== "")
        .map((data) => { try { return JSON.parse(data); } catch { return null; } })
      : [JSON.parse(text)].flat();
    return messages.find((message) => message && message.id === id && ("result" in message || "error" in message)) ?? null;
  };
  s.initialize = async () => {
    const id = s.nextId++;
    const { response } = await post({ jsonrpc: "2.0", id, method: "initialize",
      params: { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name, version: "1.0.0" } } }, false);
    const sessionId = response.headers.get("mcp-session-id");
    if (!response.ok || sessionId === null) throw new Error(`initialize failed: HTTP ${response.status}`);
    s.session = sessionId;
    await post({ jsonrpc: "2.0", method: "notifications/initialized" });
  };
  s.call = async (tool, args = {}) => {
    if (s.session === null) await s.initialize();
    const id = s.nextId++;
    const { response, text } = await post({ jsonrpc: "2.0", id, method: "tools/call", params: { name: tool, arguments: args } });
    if (response.status === 404) { s.session = null; return { ok: false, data: null, errorCode: "session_gone" }; }
    const message = reply(response.headers.get("content-type"), text, id);
    if (message === null) throw new Error(`no reply (HTTP ${response.status})`);
    if (message.error) {
      if (String(message.error.message ?? "").startsWith("Unknown session")) {
        s.session = null;
        return { ok: false, data: null, errorCode: "session_gone" };
      }
      throw new Error(`rpc ${message.error.code}: ${String(message.error.message ?? "").slice(0, 160)}`);
    }
    const result = message.result;
    const data = result?.structuredContent ?? JSON.parse((result?.content ?? []).filter((part) => part.type === "text")
      .map((part) => part.text).join("\n") || "null");
    const errorCode = data?.error?.code ?? null;
    return { ok: result?.isError !== true && errorCode === null, data, errorCode };
  };
  return s;
}

const entry = client(entryUrl, "antwars-opener");

// ---------------------------------------------------------------- tile choice

const inRect = (rects, x, y) => rects.some(([rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh);

/** Tiles the server refuses: water, rock (static) or the food it reports in sight. */
function legalTile(sel, cells, x, y) {
  const box = sel.box;
  if (x < box.x || x >= box.x + box.width || y < box.y || y >= box.y + box.height) return false;
  const terrain = sel.terrain ?? {};
  if (inRect(terrain.water ?? [], x, y)) return false;
  if (inRect(terrain.rocks ?? [], x, y)) return false;
  if (cells.some((cell) => cell.tileX === x && cell.tileY === y && cell.food > 0)) return false;
  if (sel.picks?.some((pick) => pick.tileX === x && pick.tileY === y && !pick.mine)) return false;
  return true;
}

/**
 * The default nest first (the server's own auto-placement, so a pick never
 * regresses the opening), then the nearest legal neighbour as the fallback.
 */
function chooseNest(sel, cells) {
  const box = sel.box ?? { x: 0, y: 0, width: 128, height: 96 };
  const cx = box.x + Math.floor(box.width / 2);
  const cy = box.y + Math.floor(box.height / 2);
  const primary = legalTile(sel, cells, cx, cy) ? { tileX: cx, tileY: cy } : null;
  const ring = [];
  for (let dy = -6; dy <= 6; dy += 1) for (let dx = -6; dx <= 6; dx += 1) {
    const x = cx + dx, y = cy + dy;
    if (dx === 0 && dy === 0) continue;
    if (!legalTile(sel, cells, x, y)) continue;
    ring.push({ tileX: x, tileY: y, d: dx * dx + dy * dy });
  }
  ring.sort((a, b) => a.d - b.d || a.tileY - b.tileY || a.tileX - b.tileX);
  const fallback = ring.length > 0 ? { tileX: ring[0].tileX, tileY: ring[0].tileY } : primary;
  return { primary: primary ?? fallback, fallback };
}

/** Nearest visible food tile to a reference tile, then a second choice one tile off. */
function chooseForage(view) {
  const ref = view.queens?.find((queen) => queen.lostTick === null) ?? view.squad?.[0] ?? { tileX: 0, tileY: 0 };
  const food = readCells(view.cells).filter((cell) => cell.food > 0)
    .map((cell) => ({ ...cell, d: (cell.tileX - ref.tileX) ** 2 + (cell.tileY - ref.tileY) ** 2 }))
    .sort((a, b) => a.d - b.d || a.tileY - b.tileY || a.tileX - b.tileX);
  return food.length === 0 ? null : { primary: food[0], fallback: food[Math.min(1, food.length - 1)] };
}

// ---------------------------------------------------------------- opening

const TILE_REFUSALS = new Set(["nest_food", "nest_water", "nest_rock", "nest_outside_box", "nest_invalid_tile"]);

/** pick_nest once, plus one retry with the fallback on a tile-specific refusal. */
async function pickNest(match, sel, view) {
  const cells = readCells(view?.cells);
  if (sel === undefined || sel === null) { logLine({ event: "nest", skipped: "no nestSelection" }); return null; }
  const remaining = sel.closesAt === undefined ? 0 : sel.closesAt - Date.now();
  if (remaining <= 0) {
    logLine({ event: "nest", skipped: "window_closed", closesAt: sel.closesAt ? new Date(sel.closesAt).toISOString() : null });
    return null;
  }
  const { primary, fallback } = chooseNest(sel, cells);
  let attempt = await match.call("pick_nest", { tileX: primary.tileX, tileY: primary.tileY });
  logLine({ event: "nest_pick", tile: [primary.tileX, primary.tileY], ok: attempt.ok, code: attempt.errorCode,
    remainingMs: sel.closesAt - Date.now() });
  if (attempt.ok) { state.nest = primary; saveState(); return primary; }
  if (TILE_REFUSALS.has(attempt.errorCode) && fallback !== null
    && (fallback.tileX !== primary.tileX || fallback.tileY !== primary.tileY) && sel.closesAt - Date.now() > 1000) {
    attempt = await match.call("pick_nest", { tileX: fallback.tileX, tileY: fallback.tileY });
    logLine({ event: "nest_pick_retry", tile: [fallback.tileX, fallback.tileY], ok: attempt.ok, code: attempt.errorCode,
      remainingMs: sel.closesAt - Date.now() });
    if (attempt.ok) { state.nest = fallback; saveState(); return fallback; }
  }
  return null;
}

/** Retry a seat that is still loading; the house seat may take a minute to arrive. */
async function joinMatch(match, budgetMs = 180_000) {
  const deadline = Date.now() + budgetMs;
  let last = { ok: false, data: null, errorCode: "join_retries" };
  while (Date.now() < deadline) {
    last = token === ""
      ? await match.call("join", { key, seat })
      : await match.call("join", { reconnectToken: token });
    if (last.ok) return last;
    if (last.errorCode !== "lobby_loading" && last.errorCode !== "match_not_started" && last.errorCode !== "call_rate") return last;
    await sleep(Math.max(250, Math.min(2000, Number(last.data?.retryAfterMs) || 500)));
  }
  return last;
}

/** One view, retried while the match has not started. */
async function firstView(match, budgetMs = 150_000) {
  const deadline = Date.now() + budgetMs;
  let waitLogged = false;
  while (Date.now() < deadline) {
    const observed = await match.call("observe", {});
    // A pre-start seat gets a successful reply with no view: {"waiting":true,...}.
    // Treating it as final made openMatch dereference an undefined view (2026-11-10).
    if (observed.ok === true && observed.data?.view === undefined) {
      if (!waitLogged) logLine({ event: "observe_wait", waiting: observed.data?.waiting ?? null, matchStarts: observed.data?.matchStarts ?? null });
      waitLogged = true;
      await sleep(1000);
      continue;
    }
    if (observed.ok && observed.data?.view) return observed;
    if (observed.errorCode === "match_over") return observed;
    if (observed.errorCode === "session_gone") return observed;
    if (observed.errorCode === "not_joined" || observed.errorCode === "match_not_started" || observed.errorCode === "call_rate") {
      await sleep(Math.max(250, Math.min(2000, Number(observed.data?.retryAfterMs) || 500)));
      continue;
    }
    return observed;
  }
  return { ok: false, data: null, errorCode: "no_view" };
}

async function openMatch(match, joined) {
  const sel = joined.data?.nestSelection ?? null;
  state.colony = joined.data?.colony ?? null;
  state.seat = seat;
  state.joinedAt = new Date().toISOString();
  state.phase = "joined";
  saveState();
  logLine({ event: "joined", colony: state.colony, tick: joined.data?.view?.tick ?? null, matchStarts: joined.data?.matchStarts ?? null,
    nestBox: sel?.box ?? null, nestClosesAt: sel?.closesAt ? new Date(sel.closesAt).toISOString() : null,
    nestRemainingMs: sel?.closesAt === undefined ? null : sel.closesAt - Date.now() });

  // The nest window runs before the first tick: pick now, without waiting for a view.
  await pickNest(match, sel, null);

  const observed = await firstView(match);
  if (observed.ok === false) { logLine({ event: "no_view", code: observed.errorCode }); return observed; }
  const view = observed.data?.view;
  if (view === undefined) {
    logLine({ event: "no_view", code: observed.data?.waiting === true ? "still_waiting" : "no_view_payload" });
    return { ok: false, data: null, errorCode: "no_view" };
  }
  if (observed.data.matchOver === true) return observed;

  // Brood first, then forage: workers carry, so this is the income that funds everything.
  const queen = view.queens?.find((entry) => entry.lostTick === null);
  if (queen !== undefined) {
    const brood = await match.call("set_brood", { brood: "workers", ...(view.queens.length > 1 ? { queenId: queen.queenId } : {}) });
    logLine({ event: "brood", ok: brood.ok, code: brood.errorCode, queenId: queen.queenId, tick: brood.data?.tick ?? view.tick });
  }

  const target = chooseForage(view);
  if (target !== null) {
    await sleep(1000);   // the view's observe and the brood call were <1 s ago; the limit is 2 calls/s
    const marked = await match.call("count_mark", { verb: "FORAGE", count: forageCount, tileX: target.primary.tileX,
      tileY: target.primary.tileY, caste: "worker" });
    logLine({ event: "forage", ok: marked.ok, code: marked.errorCode, tile: [target.primary.tileX, target.primary.tileY],
      count: forageCount, food: target.primary.food, tick: marked.data?.tick ?? view.tick });
    if (!marked.ok && marked.errorCode === "count_mark_not_visible" && target.fallback !== target.primary) {
      const again = await match.call("count_mark", { verb: "FORAGE", count: forageCount, tileX: target.fallback.tileX,
        tileY: target.fallback.tileY, caste: "worker" });
      logLine({ event: "forage_retry", ok: again.ok, code: again.errorCode, tile: [target.fallback.tileX, target.fallback.tileY] });
    }
    state.forage = { tile: [target.primary.tileX, target.primary.tileY], tick: marked.data?.tick ?? view.tick };
  } else {
    logLine({ event: "forage", skipped: "no visible food" });
  }
  state.phase = "playing";
  state.tick = view.tick;
  saveState();
  return observed;
}

// ---------------------------------------------------------------- keepalive

function summary(view, status) {
  const mine = (view.squad ?? []).length;
  const ants = readCells(view.cells).flatMap((cell) => cell.ants);
  const workers = ants.filter((ant) => ant.colony === view.colony && ant.caste === "worker").length;
  const soldiers = ants.filter((ant) => ant.colony === view.colony && ant.caste === "soldier").length;
  return { tick: view.tick, idleLeft: Array.isArray(status) ? status[0] : null, enemyShare: Array.isArray(status) ? status[2] : null,
    queens: (view.queens ?? []).filter((queen) => queen.lostTick === null).length,
    squad: mine, workersInSight: workers, soldiersInSight: soldiers,
    food: view.queenFounding?.foodStore ?? null, territoryPermille: view.territorySharePermille ?? null,
    marks: (view.myMarks ?? []).map((mark) => `${mark.verb ?? "?"}:${mark.count ?? 0}@${mark.tileX},${mark.tileY}`) };
}

async function beat(match) {
  let observed = await match.call("observe", {});
  if (observed.errorCode === "session_gone") {
    await match.initialize();
    const rejoined = await joinMatch(match, 15_000);
    if (!rejoined.ok) { logLine({ event: "rejoin_failed", code: rejoined.errorCode }); return false; }
    observed = await match.call("observe", {});
  }
  if (!observed.ok) {
    if (observed.errorCode === "match_over") { logLine({ event: "match_over", tick: null }); return false; }
    logLine({ event: "heartbeat", ok: false, code: observed.errorCode });
    return false;
  }
  const view = observed.data?.view;
  if (view === undefined) { logLine({ event: "heartbeat", ok: false, code: "no_view_payload" }); return true; }
  const status = observed.data.status ?? null;
  logLine({ event: "heartbeat", ok: true, ...summary(view, status) });
  state.tick = view.tick;
  saveState();
  if (observed.data.matchOver === true || view.result !== null) {
    logLine({ event: "result", result: observed.data.result ?? view.result, winner: observed.data.winner ?? null });
    return false;
  }
  // Keep the opening's income alive while the model is between turns. One mark
  // lifetime is 180 s, so without this a 3-minute model turn leaves free workers idle.
  if (autoForage && !(view.myMarks ?? []).some((mark) => mark.verb === "FORAGE")) {
    const target = chooseForage(view);
    if (target !== null) {
      const marked = await match.call("count_mark", { verb: "FORAGE", count: Math.min(forageCount, 8), tileX: target.primary.tileX,
        tileY: target.primary.tileY, caste: "worker" });
      logLine({ event: "forage_relay", ok: marked.ok, code: marked.errorCode, tile: [target.primary.tileX, target.primary.tileY] });
    }
  }
  return true;
}

// ---------------------------------------------------------------- entry phase

async function readChallenge(rid) {
  const status = await entry.call("challenge_status", { key, requestId: rid });
  return status.ok ? status.data : null;
}

async function locate() {
  const deadline = Date.now() + CHALLENGE_WINDOW_MS;
  let lastCode = null;
  while (Date.now() < deadline) {
    const at = await entry.call("locate_match", { key, lobbyId: state.lobbyId });
    if (at.ok && at.data?.mcpUrl) return { ok: true, url: at.data.mcpUrl, slot: at.data.slot };
    if (at.errorCode !== lastCode) { logLine({ event: "locate_wait", code: at.errorCode }); lastCode = at.errorCode; }
    if (state.requestId !== null) {
      const challenge = await readChallenge(state.requestId);
      const status = challenge?.state ?? null;
      if (status === "expired" || status === "house_unavailable" || status === "finished") {
        return { ok: false, reason: status, challenge };
      }
    }
    await sleep(2000);
  }
  return { ok: false, reason: "locate_timeout" };
}

async function main() {
  logLine({ event: "start", entryUrl, directUrl: directUrl || null, opponent: opponent || null, lobby: lobbyId || null,
    request: requestId || null, seat, intervalS, mode: token === "" ? "key" : "token" });
  saveState();

  if (probe) {
    const listed = await entry.call("list_challenge_opponents", {});
    const target = listed.data?.opponents?.find((entry0) => entry0.handle === opponent) ?? null;
    logLine({ event: "probe", ok: listed.ok, allowanceLeft: listed.data?.allowanceLeft ?? null,
      opponent: target === null ? null : { handle: target.handle, available: target.available, reason: target.reason } });
    console.log(JSON.stringify({ allowanceLeft: listed.data?.allowanceLeft ?? null,
      opponent: target === null ? null : { handle: target.handle, available: target.available, reason: target.reason } }));
    process.exit(listed.ok ? 0 : 1);
  }

  if (directUrl === "") {
    if (opponent !== "" && requestId === "") {
      const requested = await entry.call("request_challenge", { key, opponent });
      if (!requested.ok) {
        logLine({ event: "challenge_refused", code: requested.errorCode, message: requested.data?.error?.message ?? null });
        console.error(`open-match: challenge refused: ${requested.errorCode}`);
        process.exit(requested.errorCode === "opponent_unavailable" ? 4 : 1);
      }
      state.requestId = requested.data.requestId;
      state.lobbyId = requested.data.lobbyId;
      state.requestedAt = new Date().toISOString();
      state.phase = "requested";
      saveState();
      logLine({ event: "challenge", requestId: state.requestId, lobbyId: state.lobbyId, seat: requested.data.seat ?? null, opponent });
      const lobby = await entry.call("read_lobby", { key, lobbyId: state.lobbyId });
      logLine({ event: "lobby", colonies: (lobby.data?.lobby?.colonies ?? []).map((colony) => colony.map((sitting) => sitting.displayName)),
        state: lobby.data?.lobby?.state ?? null, startsAt: lobby.data?.lobby?.startsAt ?? null,
        challenge: lobby.data?.lobby?.challenge ?? null });
    } else if (state.requestId !== null) {
      const challenge = await readChallenge(state.requestId);
      state.lobbyId = challenge?.lobbyId ?? state.lobbyId;
      logLine({ event: "resume", requestId: state.requestId, lobbyId: state.lobbyId, state: challenge?.state ?? null });
    } else if (queueMode !== "") {
      const queued = await entry.call("join_queue", { key, mode: queueMode });
      if (!queued.ok) {
        logLine({ event: "queue_refused", code: queued.errorCode, message: queued.data?.error?.message ?? null });
        console.error(`open-match: queue refused: ${queued.errorCode}`);
        process.exit(1);
      }
      logLine({ event: "queue", mode: queueMode, entry: queued.data?.queue ?? null });
      const deadline = Date.now() + CHALLENGE_WINDOW_MS;
      let matched = null;
      while (Date.now() < deadline) {
        const status = await entry.call("queue_status", { key });
        const current = status.data?.queue ?? null;
        if (current?.state === "matched") { matched = current; break; }
        if (current !== null && (current.state === "expired" || current.state === "none")) {
          logLine({ event: "queue_end", queue: current });
          console.error(`open-match: queue ${current.state}`);
          process.exit(3);
        }
        await sleep(2000);
      }
      if (matched === null) {
        logLine({ event: "queue_timeout" });
        console.error("open-match: no match inside the window");
        process.exit(3);
      }
      state.lobbyId = matched.lobbyId;
      state.requestedAt = new Date(matched.matchedAt ?? Date.now()).toISOString();
      state.phase = "matched";
      saveState();
      logLine({ event: "queue_matched", lobbyId: matched.lobbyId, mode: matched.mode });
    }
    const at = await locate();
    if (!at.ok) {
      logLine({ event: "no_match", reason: at.reason, challenge: at.challenge ?? null });
      console.error(`open-match: no match: ${at.reason}`);
      process.exit(3);
    }
    state.mcpUrl = at.url;
    state.phase = "located";
    saveState();
    logLine({ event: "located", mcpUrl: at.url, slot: at.slot ?? null, sinceRequestMs: state.requestedAt === undefined ? null : Date.now() - Date.parse(state.requestedAt) });
  } else {
    state.mcpUrl = directUrl;
    state.phase = "located";
    saveState();
  }

  const match = client(state.mcpUrl, "antwars-opener");
  await match.initialize();
  const joined = await joinMatch(match);
  if (!joined.ok) {
    logLine({ event: "join_failed", code: joined.errorCode, data: joined.data?.error ?? null });
    console.error(`open-match: join failed: ${joined.errorCode}`);
    process.exit(joined.errorCode === "match_over" ? 0 : 1);
  }

  const opened = await openMatch(match, joined);
  if (opened.errorCode === "match_over") {
    logLine({ event: "match_over_before_play" });
    process.exit(0);
  }
  if (once) process.exit(0);

  const stopWatch = setInterval(() => {
    if (existsSync(stopPath)) { clearInterval(stopWatch); logLine({ event: "exit", reason: "stop_file" }); process.exit(0); }
  }, 1000);
  stopWatch.unref();

  for (;;) {
    await sleep(intervalS * 1000);
    const alive = await beat(match);
    if (!alive) { logLine({ event: "exit", reason: "match_over_or_failure" }); process.exit(0); }
  }
}

main().catch((error) => {
  logLine({ event: "fatal", error: String(error?.message ?? error).slice(0, 200) });
  process.exit(1);
});
