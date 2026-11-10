#!/usr/bin/env node
/**
 * Wire test for scripts/open-match.mjs against a protocol-faithful mock server.
 *
 * Scenario 1 (--mcp-url): initialize with Mcp-Session-Id, a refused join
 * (lobby_loading) then success, observe retried until the match starts, a
 * tile-specific nest refusal then the fallback tile, set_brood, the first FORAGE
 * mark, the heartbeat loop, and the match_over exit.
 *
 * Scenario 2 (--opponent): request_challenge -> locate_match poll -> join, all in
 * one process. This is the 2026-11-09 failure path: the model needed 597 s over
 * four turns for it, and the match ended at tick 5,015 before the join. The test
 * fails if the same handoff takes more than a few seconds here.
 *
 * Run: node scripts/test-opener.mjs
 */
import { createServer } from "node:http";
import { readFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readCells } from "./cells.mjs";

const BOX = { x: 96, y: 0, width: 32, height: 96 };
const CENTRE = { tileX: BOX.x + BOX.width / 2, tileY: BOX.y + BOX.height / 2 };
const WATER = [[100, 0, 2, 6]];
const FOOD = [[112, 48, 12], [110, 44, 10], [98, 12, 14]];
let picked = null;
let mode = "end";
const takes = { join: 0, observe: 0, locate: 0, pick_nest: [], set_brood: [], count_mark: [], callrate: 0 };

function reset() {
  picked = null;
  takes.join = 0; takes.observe = 0; takes.locate = 0;
  takes.pick_nest = []; takes.set_brood = []; takes.count_mark = []; takes.callrate = 0;
}

/** The live wire shape (2026-11-10): one encoded cells string, not an array of cells. */
const FIXTURE_ANTS = [
  { tileX: 113, tileY: 48, antId: 10, hp: 4000, kind: 3 },   // worker, colony 1
  { tileX: 111, tileY: 48, antId: 11, hp: 4000, kind: 3 },   // worker, colony 1
  { tileX: 105, tileY: 44, antId: 12, hp: 4000, kind: 5 },   // soldier, colony 1
  { tileX: 108, tileY: 46, antId: 13, hp: 4000, kind: 2 },   // worker, colony 0
];
const CELLS_WIDTH = 128;
const CELLS_RADIX = 2;
const base36 = (n) => `${n < 0 ? "-" : ""}${Math.abs(n).toString(36)}`;
/** `p = (index - i) * radix + food`, ants `antId.k` with `k = hp * 6 + kind`. */
function encodeCells(entries) {
  let i = 0;
  const tokens = [];
  const sorted = [...entries].sort((a, b) => (a.tileY * CELLS_WIDTH + a.tileX) - (b.tileY * CELLS_WIDTH + b.tileX));
  for (const entry of sorted) {
    const index = entry.tileY * CELLS_WIDTH + entry.tileX;
    const p = (index - i) * CELLS_RADIX + (entry.food > 0 ? 1 : 0);
    i = index;
    const ants = (entry.ants ?? []).map((ant) => `${base36(ant.antId)}.${base36(ant.hp * 6 + ant.kind)}`).join("/");
    tokens.push(`${base36(p)}${ants === "" ? "" : `:${ants}`}`);
  }
  return { width: CELLS_WIDTH, height: 96, encoding: "test fixture", foodRadix: CELLS_RADIX, data: tokens.join(";") };
}
function cells() {
  const entries = FOOD.map(([tileX, tileY, food]) => ({ tileX, tileY, food }));
  for (const ant of FIXTURE_ANTS) {
    const at = entries.find((entry) => entry.tileX === ant.tileX && entry.tileY === ant.tileY);
    if (at) { at.ants = [...(at.ants ?? []), ant]; } else { entries.push({ tileX: ant.tileX, tileY: ant.tileY, ants: [ant] }); }
  }
  return encodeCells(entries);
}

function view(tick) {
  const nest = picked ?? CENTRE;
  return {
    tick, colony: 1, colonyName: "Colony 1", ticksLeft: 18000 - tick, secondsLeft: 1800 - tick / 10,
    squad: [{ antId: 3, tileX: nest.tileX, tileY: nest.tileY, carrying: false }],
    queens: [{ queenId: 0, tileX: nest.tileX, tileY: nest.tileY, foundedTick: 0, lostTick: null, overrunTicks: 0, hp: 40000, maxHp: 40000, brood: "workers" }],
    queenFounding: { cost: 400, cooldownTicks: 1800, minDistanceTiles: 32, foodStore: 0, nextFoundTick: 3000 },
    cells: cells(), marks: [], myMarks: [],
    territoryRows: [], territoryTiles: 0, territorySharePermille: 0, events: [], result: null,
  };
}

const server = createServer((request, response) => {
  let body = "";
  request.on("data", (chunk) => { body += chunk; });
  request.on("end", () => {
    if (body.trim() === "") { response.writeHead(202).end(); return; }        // notifications/initialized
    const message = JSON.parse(body);
    const send = (payload) => {
      response.writeHead(200, { "content-type": "text/event-stream", "mcp-session-id": "test-session" });
      response.end(`event: message\ndata: ${JSON.stringify(payload)}\n\n`);
    };
    if (message.method === "initialize") {
      send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "mock", version: "0" } } });
      return;
    }
    if (message.method !== "tools/call") { send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "no" } }); return; }
    const { name, arguments: args } = message.params;
    const reply = (data, isError = false) => send({ jsonrpc: "2.0", id: message.id, result: { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data, isError } });

    // Entry-server tools: the challenge handoff.
    if (name === "request_challenge") return reply({ requestId: "req-1", lobbyId: "lob-1", seat: 1 });
    if (name === "challenge_status") return reply({ requestId: args?.requestId ?? "req-1", lobbyId: "lob-1", handle: "antwars/mock", state: "playing" });
    if (name === "read_lobby") return reply({ lobby: { id: args?.lobbyId ?? "lob-1", kind: "public", size: 1, state: "holding",
      colonies: [[{ id: "house", displayName: "antwars/mock" }], [{ id: "us", displayName: "omp-dolphin" }]],
      startsAt: Date.now() + 60_000, challenge: { kind: "house", heldFor: "antwars/mock", heldColony: 0 } } });
    if (name === "join_queue") return reply({ queue: { state: "waiting", mode: args?.mode ?? "1v1", joinedAt: Date.now(), expiresAt: Date.now() + 43_200_000 } });
    if (name === "queue_status") {
      takes.queue = (takes.queue ?? 0) + 1;
      if (takes.queue === 1) return reply({ queue: { state: "waiting", mode: "1v1", joinedAt: Date.now(), expiresAt: Date.now() + 43_200_000 } });
      return reply({ queue: { state: "matched", mode: "1v1", lobbyId: "lob-2", matchedAt: Date.now() } });
    }
    if (name === "locate_match") {
      takes.locate += 1;
      if (takes.locate === 1) return reply({ error: { code: "lobby_not_holding", message: "no slot yet" } }, true);
      return reply({ slot: "public-0", mcpUrl: `http://127.0.0.1:${server.address().port}/mcp` });
    }

    // Match-server tools.
    if (name === "join") {
      takes.join += 1;
      if (takes.join === 1) return reply({ error: { code: "lobby_loading", message: "loading" } }, true);
      // 2026-11-10 challenge join: no nestSelection and no view until the start.
      if (mode === "waiting") return reply({ agentId: "agent-1", colony: 1, matchStarts: "2026-11-10T00:30:31.500Z" });
      return reply({ agentId: "agent-1", colony: 1, matchStarts: "soon",
        nestSelection: { required: false, box: BOX, closesAt: Date.now() + 60_000, terrain: { water: WATER, rocks: [] }, picks: [] } });
    }
    if (name === "pick_nest") {
      takes.pick_nest.push({ ...args, at: Date.now() });
      const inFood = FOOD.some(([tileX, tileY]) => tileX === args.tileX && tileY === args.tileY);
      if (inFood) return reply({ error: { code: "nest_food", message: "That tile contains food." } }, true);
      picked = { tileX: args.tileX, tileY: args.tileY };
      return reply({ accepted: true });
    }
    if (name === "set_brood") { takes.set_brood.push({ ...args, at: Date.now() }); return reply({ accepted: true, tick: 0, queenId: 0, brood: args.brood }); }
    if (name === "count_mark") {
      takes.count_mark.push({ ...args, at: Date.now() });
      if (!FOOD.some(([tileX, tileY]) => tileX === args.tileX && tileY === args.tileY)) return reply({ error: { code: "count_mark_not_visible", message: "no" } }, true);
      return reply({ accepted: true, tick: 0 });
    }
    if (name === "observe") {
      takes.observe += 1;
      if (mode === "callrate" && takes.observe === 3) {
        takes.callrate += 1;
        return reply({ error: { code: "call_rate", message: "At most 2 calls per second per agent.", retryAfterMs: 250 } }, true);
      }
      if (mode === "live") return reply({ view: view(40 * takes.observe), status: [300, "observe", 0], matchOver: false });
      if (mode === "waiting") {
        // 2026-11-10 wire shape: success, no view, no error code, while the slot waits to start.
        if (takes.observe <= 2) return reply({ waiting: true, matchStarts: "2026-11-10T00:30:31.500Z",
          message: "Your match has not started; keep calling observe.", houseIdleSeconds: 300, status: [300, "order count_mark found_queen set_brood observe rules join", 0] });
        return reply({ view: view(40 * (takes.observe - 2)), status: [300, "observe", 0], matchOver: false });
      }
      if (takes.observe === 1) return reply({ error: { code: "match_not_started", message: "not yet" } }, true);
      const tick = 40 * (takes.observe - 1);
      if (takes.observe >= 4) {
        const result = { winner: 1, reason: "test", decidedBy: "test", tick };
        return reply({ matchOver: true, winner: "Mock", result, view: { ...view(tick), result }, status: [300, "observe", 0] });
      }
      return reply({ view: view(tick), status: [300, "observe", 0], matchOver: false });
    }
    return reply({ error: { code: "unknown_tool", message: name } }, true);
  });
});

const failure = (message) => { console.error(`FAIL ${message}`); process.exit(1); };

async function run(args, logPath, timeoutMs) {
  rmSync(logPath, { force: true });
  const child = spawn(process.execPath, ["scripts/open-match.mjs", ...args, "--log", logPath,
    "--state", `${logPath}.json`], { stdio: ["ignore", "inherit", "inherit"] });
  const timer = setTimeout(() => child.kill(), timeoutMs);
  const code = await new Promise((resolve) => child.on("exit", resolve));
  clearTimeout(timer);
  const lines = readFileSync(logPath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
  return { code, lines, events: lines.map((line) => line.event), text: readFileSync(logPath, "utf8") };
}

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/mcp`;
const dir = tmpdir();

// ---------------------------------------------------------------- cells decode
{
  // Captured live `view.cells` from this repo's 2026-11-10 match (tick 318,
  // Central Lake v2): 149 cells with content, 103 food tiles, 58 colony-1 workers.
  const LIVE_CELLS = { width: 128, height: 96, foodRadix: 2, data: "3q7;dx;5*5;3*2;dh;3*2;5;d;5*3;d9;5*3;d;3*2;5;3*2;5;d5;5*3;4:e.iir;h;5*2;d5;5*4;5:i.iir;5*5;6k:2l.iir;6l;5*3;6:2a.iir;2:o.iir/28.iir;5*5;6i:2.iir;6r;5*2;5:c.iir;9;5*3;6m:1q.iir/2n.iir;6v;5*2;2:2k.iir;4:1a.iir;2:4.iir;5*2;6q:25.iir;6:23.iir/2b.iir;6y:20.iir;6:1o.iir;6y:12.iir/1t.iir;4:1i.iir;2:q.iir;74:2f.iir;6y:s.iir/10.iir;74:u.iir;2:1k.iir;2:1c.iir;70:1g.iir;2:2d.iir;2:y.iir/21.iir;72:16.iir;2:1y.iir;70:14.iir;2:2i.iir;2:2x.iir;74:8.iir/1w.iir;70:a.iir;2:2g.iir;dq:1r.iir;i:2z.iir;6q:26.iir;e,1,uv4;-6pv;dx;5*4;3*4;dh;3*2;5*2;3*2;9;3*2;5;db;3;5;x;d9;13;3;cz;3;1b;4ar;a:w.iir/1e.iir;6y:6.iir/g.iir;4:18.iir;a:1v.iir;2:1m.iir;6f;3;2:2q.iir;8:2s.iir;2:2p.iir;6:2u.iir;2:k.iir/m.iir;6:2v.iir;dn" };
  const decoded = readCells(LIVE_CELLS);
  const liveFood = decoded.filter((cell) => cell.food > 0);
  const liveAnts = decoded.flatMap((cell) => cell.ants);
  const fail = (message) => { console.error(`FAIL cells decode: ${message}`); process.exit(1); };
  if (decoded.length !== 149) fail(`cells ${decoded.length}, expected 149`);
  if (liveFood.length !== 103) fail(`food ${liveFood.length}, expected 103`);
  if (liveAnts.length !== 58) fail(`ants ${liveAnts.length}, expected 58`);
  if (!liveAnts.every((ant) => ant.colony === 1 && ant.caste === "worker")) fail("caste or colony decode");
  if (!liveFood.some((cell) => cell.tileX === 111 && cell.tileY === 18)) fail("missing food at (111,18)");
  console.log("ok  cells decode: captured live payload -> 149 cells, 103 food, 58 colony-1 workers");
}

// ---------------------------------------------------------------- scenario 1
{
  reset();
  const logPath = join(dir, `opener-test-a-${process.pid}.log`);
  const { code, lines, events, text } = await run(["--mcp-url", url, "--token", "test-token", "--interval", "15"], logPath, 90_000);
  const fail = (message) => { console.error(`FAIL scenario 1: ${message}\nevents: ${events.join(" -> ")}`); process.exit(1); };
  if (code !== 0) fail(`exit ${code}`);
  if (events[0] !== "start") fail("no start");
  if (!events.includes("joined")) fail("no join");
  if (takes.join !== 2) fail(`join attempts ${takes.join}, expected 2 (lobby_loading retry)`);
  const pick = lines.find((line) => line.event === "nest_pick");
  const retry = lines.find((line) => line.event === "nest_pick_retry");
  if (pick === undefined || pick.ok !== false || pick.code !== "nest_food") fail("first pick was not refused on food");
  if (retry === undefined || retry.ok !== true) fail("fallback pick not accepted");
  if (retry.tile[0] === CENTRE.tileX && retry.tile[1] === CENTRE.tileY) fail("fallback equals the refused tile");
  if (FOOD.some(([tileX, tileY]) => retry.tile[0] === tileX && retry.tile[1] === tileY)) fail("fallback on a food tile");
  if (WATER.some(([x, y, w, h]) => retry.tile[0] >= x && retry.tile[0] < x + w && retry.tile[1] >= y && retry.tile[1] < y + h)) fail("fallback in water");
  const brood = lines.find((line) => line.event === "brood");
  if (brood === undefined || brood.ok !== true) fail("brood not accepted");
  if (takes.set_brood[0]?.brood !== "workers") fail("brood not workers");
  const forage = lines.find((line) => line.event === "forage");
  if (forage === undefined || forage.ok !== true) fail("forage not accepted");
  const broodAt = takes.set_brood[0]?.at;
  const markAt = takes.count_mark[0]?.at;
  if (broodAt === undefined || markAt === undefined) fail("missing brood/count_mark timestamps");
  if (markAt - broodAt < 900) fail(`opening FORAGE ${markAt - broodAt} ms after brood, expected >= 900 (2 calls/s)`);
  const nest = retry.tile;
  const nearest = FOOD.map(([tileX, tileY]) => ({ tileX, tileY, d: (tileX - nest[0]) ** 2 + (tileY - nest[1]) ** 2 }))
    .sort((a, b) => a.d - b.d || a.tileY - b.tileY || a.tileX - b.tileX)[0];
  if (forage.tile[0] !== nearest.tileX || forage.tile[1] !== nearest.tileY) fail(`forage tile ${forage.tile}, expected ${nearest.tileX},${nearest.tileY}`);
  const beats = lines.filter((line) => line.event === "heartbeat" && line.ok === true);
  if (beats.length < 1) fail("no heartbeat");
  if (beats[0].workersInSight !== 2 || beats[0].soldiersInSight !== 1) {
    fail(`cell decode counts ${beats[0].workersInSight} workers / ${beats[0].soldiersInSight} soldiers, expected 2 / 1`);
  }
  if (!events.includes("result")) fail("no result event");
  if (events[events.length - 1] !== "exit") fail("no exit event");
  const state = JSON.parse(readFileSync(`${logPath}.json`, "utf8"));
  if (state.phase !== "playing") fail(`state phase ${state.phase}`);
  if (text.includes("test-token")) fail("token leaked into the log");
  console.log(`ok  scenario 1 (direct): ${events.join(" -> ")}`);
}

// ---------------------------------------------------------------- scenario 2
{
  reset();
  takes.join = 1;                    // already joined once in scenario 1's mock state
  const logPath = join(dir, `opener-test-b-${process.pid}.log`);
  const { code, lines, events } = await run(["--entry-url", url, "--opponent", "antwars/mock", "--token", "test-token", "--once"], logPath, 60_000);
  const fail = (message) => { console.error(`FAIL scenario 2: ${message}\nevents: ${events.join(" -> ")}`); process.exit(1); };
  const challenge = lines.find((line) => line.event === "challenge");
  const located = lines.find((line) => line.event === "located");
  const joined = lines.find((line) => line.event === "joined");
  if (code !== 0) fail(`exit ${code}`);
  if (challenge === undefined) fail("no challenge event");
  if (located === undefined) fail("no locate event");
  if (joined === undefined) fail("no join after locate");
  if (located.sinceRequestMs === null || located.sinceRequestMs > 6000) fail(`request->locate took ${located.sinceRequestMs} ms`);
  if (!lines.some((line) => line.event === "nest_pick")) fail("no nest pick");
  const lobby = lines.find((line) => line.event === "lobby");
  if (lobby === undefined) fail("no lobby confirmation");
  if (lobby.colonies?.[1]?.[0] !== "omp-dolphin") fail(`challenger not confirmed: ${JSON.stringify(lobby.colonies)}`);
  if (lobby.challenge?.heldFor !== "antwars/mock") fail("house seat not shown");
  console.log(`ok  scenario 2 (challenge): request -> locate -> join in ${located.sinceRequestMs} ms; challenger ${lobby.colonies[1][0]}; ${events.join(" -> ")}`);
}

// ---------------------------------------------------------------- scenario 3
{
  reset();
  takes.join = 1;
  takes.locate = 1;
  const logPath = join(dir, `opener-test-c-${process.pid}.log`);
  const { code, lines, events } = await run(["--entry-url", url, "--queue", "1v1", "--token", "test-token", "--once"], logPath, 60_000);
  const fail = (message) => { console.error(`FAIL scenario 3: ${message}\nevents: ${events.join(" -> ")}`); process.exit(1); };
  if (code !== 0) fail(`exit ${code}`);
  if (!events.includes("queue")) fail("queue join not logged");
  if (!events.includes("queue_matched")) fail("no queue match");
  const matched = lines.find((line) => line.event === "queue_matched");
  const joined = lines.find((line) => line.event === "joined");
  if (matched?.lobbyId !== "lob-2") fail(`matched lobby ${matched?.lobbyId}`);
  if (joined === undefined) fail("no join after queue match");
  console.log(`ok  scenario 3 (queue): waiting -> matched lob-2 -> joined; ${events.join(" -> ")}`);
}

// ---------------------------------------------------------------- scenario 4
{
  reset();
  const { spawnSync, spawn: spawnKeepalive } = await import("node:child_process");
  const { writeFileSync, utimesSync } = await import("node:fs");
  mode = "live";
  const logPath = join(dir, `keepalive-test-${process.pid}.log`);
  const stopPath = `${logPath}.stop`;
  rmSync(logPath, { force: true });
  // A stop file left behind by an earlier match (10 s old) must be ignored.
  writeFileSync(stopPath, "");
  const old = new Date(Date.now() - 10_000);
  utimesSync(stopPath, old, old);
  const child = spawnKeepalive(process.execPath, ["scripts/keepalive.mjs", "--url", url, "--token", "test-token",
    "--interval", "5", "--log", logPath, "--stop-file", stopPath], { stdio: ["ignore", "inherit", "inherit"] });
  await new Promise((resolve) => setTimeout(resolve, 3500));
  if (child.exitCode !== null) { console.error("FAIL scenario 4: keepalive exited on a stale stop file"); process.exit(1); }
  writeFileSync(stopPath, "");
  const code = await Promise.race([
    new Promise((resolve) => child.on("exit", resolve)),
    new Promise((resolve) => setTimeout(() => resolve("timeout"), 8000)),
  ]);
  if (code !== 0) { console.error(`FAIL scenario 4: exit ${code}`); process.exit(1); }
  const lines = readFileSync(logPath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
  const exit = lines.find((line) => line.event === "exit");
  if (exit?.reason !== "stop_file") { console.error(`FAIL scenario 4: exit reason ${exit?.reason}`); process.exit(1); }
  if (!lines.some((line) => line.event === "heartbeat" && line.ok === true)) { console.error("FAIL scenario 4: no heartbeat"); process.exit(1); }
  console.log("ok  scenario 4 (keepalive): stale stop file ignored, 5 s heartbeat, live stop file exits 0");
}

// ---------------------------------------------------------------- scenario 5
// 2026-11-10 defect: the join reply carried no nestSelection and every pre-start
// observe answered {waiting:true} with no view. firstView treated that as final,
// openMatch read view.queens on undefined, and the opener died 166 ms after join.
{
  reset();
  mode = "waiting";
  const logPath = join(dir, `opener-test-e-${process.pid}.log`);
  const { code, lines, events, text } = await run(["--mcp-url", url, "--token", "test-token", "--once"], logPath, 60_000);
  const fail = (message) => { console.error(`FAIL scenario 5: ${message}\nevents: ${events.join(" -> ")}`); process.exit(1); };
  if (code !== 0) fail(`exit ${code}`);
  if (text.includes("fatal")) fail("opener crashed on a viewless pre-start reply");
  const nest = lines.find((line) => line.event === "nest");
  if (nest?.skipped !== "no nestSelection") fail(`nest event ${JSON.stringify(nest)}`);
  if (takes.pick_nest.length !== 0) fail("pick_nest sent without a nest window");
  if (!events.includes("observe_wait")) fail("no observe_wait event");
  const brood = lines.find((line) => line.event === "brood");
  if (brood === undefined || brood.ok !== true) fail("brood not accepted after the wait");
  const forage = lines.find((line) => line.event === "forage");
  if (forage === undefined || forage.ok !== true) fail("forage not accepted after the wait");
  const state = JSON.parse(readFileSync(`${logPath}.json`, "utf8"));
  if (state.phase !== "playing") fail(`state phase ${state.phase}`);
  console.log(`ok  scenario 5 (pre-start waiting): ${events.join(" -> ")}`);
}

// ---------------------------------------------------------------- scenario 6
// 2026-11-10 defect: one `call_rate` refusal on the 45 s heartbeat made beat()
// return false, and the opener exited at tick ~5,012 with the seat unguarded for
// the rest of the match. The refusal must be retried, not treated as fatal.
{
  reset();
  mode = "callrate";
  const logPath = join(dir, `opener-test-f-${process.pid}.log`);
  const { code, lines, events } = await run(["--mcp-url", url, "--token", "test-token", "--interval", "15"], logPath, 90_000);
  const fail = (message) => { console.error(`FAIL scenario 6: ${message}\nevents: ${events.join(" -> ")}`); process.exit(1); };
  if (code !== 0) fail(`exit ${code}`);
  if (takes.callrate !== 1) fail(`mock refused ${takes.callrate} heartbeats, expected 1`);
  const refused = lines.find((line) => line.event === "heartbeat" && line.ok === false);
  if (refused !== undefined) fail(`heartbeat logged as failed: ${JSON.stringify(refused)}`);
  if (!events.includes("result")) fail("opener exited before the result after a call_rate refusal");
  if (events[events.length - 1] !== "exit") fail("no exit event");
  console.log(`ok  scenario 6 (heartbeat call_rate): retried, ${events.join(" -> ")}`);
}

server.close();
