# Keepalive notes — the 300 s forfeit (2026-11-09 follow-up)

Read-only investigation plus one new script and two run-procedure lines. Source paths are in
`C:\Projects\antwars-source` @ `a80bde5`; the local server is the same clone.

## 1. The two timers

**Forfeit (300 s).** `Game.advanceMatch` computes `idleTicks = houseIdleSeconds × ticksPerSecond`
(`src/mcp/game.ts:963`), tests each agent against the per-agent `houseActivity` tick (`game.ts:964`),
and after the tick marks activity for every accepted call whose `countsAsHouseActivity !== false`
(`game.ts:973-974`). An idle colony loses (house matches abandon instead) at `game.ts:978-984`; the
terminal `{ idle }` becomes `reason:"idle"` in `step.ts:373-376`. `houseIdleSeconds` defaults to 300
(`src/mcp/config.ts:117-123`); `ANTWAR_HOUSE_IDLE_SECONDS` overrides it.

**Which calls reset it:** every accepted join/rejoin, `observe`, `rules`, and every accepted command
(`order`, `count_mark`, `found_queen`, `set_brood`, `SPAWN`, `REMOVE`). Refusals do not: adapter
refusals are represented as observe inputs with `countsAsHouseActivity:false` (`game.ts:224-226`), and
only `out.results[index]?.ok` sets activity (`game.ts:974`). `rules` is literally an observe call
(`src/mcp/tools.ts:725-726`). **`pick_nest` does not reset the clock**: it is an adapter action, not a
sim input (`game.ts:488-498`), and it is absent from the status reset list.

**Command-only timer (180 s).** `commandIdleTicks: 180 × ticksPerSecond` is set for redesign
(`src/sim/config.ts:586`). `lapseSquads` (`src/sim/agents.ts:636-655`) would set the agent idle,
release its squad and delete its count marks. It runs only when `!houseActive` (`step.ts:265,278`), and
every server tick passes `houseActive = true` (`game.ts:972`; "live seats never lapse into command-idle
takeover", `step.ts:204-205`). **It never fires in a live match.** The 180 s value is not exposed in a
joined seat's observe status.

**Live observe status (local test, idle set to 90 s for the test):**

```json
[90,"order count_mark found_queen set_brood observe rules join",13]
```

`status[0]` is the forfeit clock (`observeInfoForAgent`, `game.ts:1397-1413`), `status[1]` names every
tool that resets it, `status[2]` is the enemy share. The base `observeInfo` command-clock value
(`game.ts:1474-1483`) is overridden for joined seats.

## 2. Event drain, and the least invasive call

Any view drains `agent.pendingEvents` (`src/sim/view.ts:351-352`). Every call that resets the forfeit
clock builds such a view: `rules` calls `game.call(agentId, {type:"observe"})`
(`tools.ts:726`); a key rejoin is a `rejoin` input that also returns a view (`game.ts:558-560`). **No
resetting call is drain-free.**

Least invasive: **`observe` with no arguments** — no map, no `since`, no command side effects, no
event-cursor advance, smallest reply. `rules` adds a ~15.7 KB briefing for no benefit; `rejoin` repeats
seat/auth work. Drained events are retained in the agent's history (`retainEvents`,
`game.ts:1326-1341`) and recoverable with `observe {since:0}`; the keepalive logs the event types it
consumed.

Local probe: a second session's `observe` at tick 64 saw `hatch@48`; the main session's next observe at
tick 71 saw only `hatch@68`; `observe {since:0}` still returned the earlier hatches.

## 3. Keepalive

One process, `scripts/keepalive.mjs`, zero dependencies, one `observe` per 60 s, no game moves. It reads
the key from `%USERPROFILE%\.antwars\key` (or `NAME=<json string>` lines), never prints or passes it,
logs JSONL heartbeats, and exits 0 on `match_over`, a stop file (`<log>.stop`) or SIGINT/SIGTERM.
`--detach` spawns a detached copy (`detached:true, stdio:"ignore", windowsHide:true`, `unref`).

### Local Windows test (one run)

```sh
PORT=18085 DATA_DIR=<temp> ANTWAR_RULES=redesign ANTWAR_PLAYERS=2 ANTWAR_HOUSE_IDLE_SECONDS=90 npm start
# two seats joined, then two detached keepalives at the 60 s default
node scripts/keepalive.mjs --url http://127.0.0.1:18085/mcp --token <A> --interval 60 --log <dir>/ka-a.log
node scripts/keepalive.mjs --url http://127.0.0.1:18085/mcp --token <B> --interval 60 --log <dir>/ka-b.log
```

Result (log excerpts):

```json
{"at":"2026-11-09T12:39:27.970Z","pid":7880,"event":"heartbeat","ok":true,"tick":29,"idleLeft":90,"events":[]}
{"at":"2026-11-09T12:40:28.076Z","pid":7880,"event":"heartbeat","ok":true,"tick":630,"idleLeft":90,"events":["hatch@548", "..."]}
{"at":"2026-11-09T12:41:09.567Z","pid":7880,"event":"exit","reason":"stop_file","code":0}
```

- Heartbeats 60.9 s apart; `idleLeft` stayed 90, so the clock reset; tick 29 → 630.
- At 100 s, past the 90 s limit, a fresh session joining the seat got a live view (`matchOver: null`).
- The detached children survived the parent process exiting (pids 7880 and 524).
- Stop files produced `exit stop_file code 0` in both logs.
- Key test: a fake 43-character key file, key mode against the local (keyless) join → `refused:
  bad_arguments`, exit 1; the key string appeared in neither stdout/stderr nor the log.
- Fatal-path test (closed port): `{"event":"fatal","error":"fetch failed"}`, exit 1, and the same
  `--detach` path printed the child's pid and the child logged its start/fatal lines.

## 4. Run-log change

`.omp/commands/antwars-run.md`: step 3a starts the keepalive after the first commands; step 5 adds one
JSON line per match turn — `{"at","tick","idleLeft"}` in `%USERPROFILE%\.antwars\run-log.jsonl` — so
consecutive timestamps measure turn latency and `idleLeft` shows the forfeit headroom. The keepalive's
heartbeats fill the gaps between turns.

## Sources

`game.ts`, `tools.ts`, `config.ts`, `http.ts`, `step.ts`, `view.ts`, `agents.ts`, `territory.ts`
(`C:\Projects\antwars-source`); local server run with `ANTWAR_RULES=redesign`; `scripts/keepalive.mjs`
and its test logs under `C:\Projects\_tmp_media\ka-test`.
