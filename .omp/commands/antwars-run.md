---
description: Challenge a house handle (named in the command, or any available one) as omp-dolphin; otherwise a pre-arranged real opponent
---

You are the autonomous player for Antwars. Use the mounted Antwars MCP tools for lobby work and `scripts/open-match.mjs` for the match handoff. Play without asking the user to steer ordinary gameplay. Never claim success unless a tool response confirms it.

## 0. Goal and authorization

- Identity: `omp-dolphin` (reuse it). Key file: `C:\Users\haibt\.antwars\key`.
- Every challenge must be issued by `omp-dolphin`, so it shows up under that name. Use only the key for this identity. The `request_challenge` schema is `{key, opponent}` and has no display-name field, so the name comes from the key. The opener logs the lobby's seat names after the request; check that `omp-dolphin` holds colony 1 (see section 3A).
- Goal: play one match against a house handle (house bot / Model Index opponent) by the challenge route. If that is not possible, play a pre-arranged real opponent (route D). If the command names a real opponent who is ready now, that opponent is the goal (route D).
- The user has authorized one challenge per run. Do not ask for another YES before taking the supported steps below.
- Do not create another identity, another handle, or rotate the key. Do not try to obtain or use any key that is not omp-dolphin's.

## 1. What is known

- **The start is the whole game.** The model needs 40-170 s per turn (measured from the session transcripts: median 3-6 s on 2026-11-04..06, 29 s on 2026-11-09 08:13, **54.5 s on 2026-11-09 14:42**, max 177 s). A handoff split across model turns cannot seat a match: on 2026-11-09 the four turns between `request_challenge` and `join` took 597 s, and the match ended by `queens_killed` at tick 5,015 (501 s) with our colony never joined. **The handoff therefore runs entirely inside `scripts/open-match.mjs`, in one process, with no model turn in the critical path.**
- Challenge route: `request_challenge` with `{key, opponent}`, where `opponent` is an `antwars/<handle>` string taken from `list_challenge_opponents`. Challenge games are public lobby games and are always unrated.
- Daily limits: 20 challenges per UTC day, shared; 5 per username across its handles.
- A challenge is refused while the username is in the ranked queue, sitting in another live lobby, or already has an active challenge.
- A challenge whose house seat does not join within the lobby's 15-minute window expires uncharged.
- On 2026-11-03 the house owner marked all 34 handles `available: false`; a request to an unavailable handle is refused with `opponent_unavailable`. This is server-side policy, not a transient error.
- `house-1v1` in the ranked queue is for antwars-owned handles only (`not_house`). Do not use it.
- Past match reports are in `study/`. Do not read them during a run.

Treat these as the last known state, not a guarantee. Re-check availability every run.

## 2. Preflight — at most two model calls

The only preflight goal is to choose the route. Every extra turn here is harmless for the match clock (nothing has started yet) but costs wall-clock time, and every extra turn after the challenge is fatal.

1. Read the repository-root `prompt.md` once. It is the only file read before the match.
2. Resolve the route with one call:
   - **A named handle** (for example `antwars/gpt-6-astra`): run `node scripts/open-match.mjs --probe --opponent <handle>`. It prints that handle's `available` flag, `reason` and today's `allowanceLeft` in about 2 s, read-only.
   - **No handle named (route A, pick the strongest available)**: one `list_challenge_opponents` call, then ONE `leaderboard` call (house scope, live schema) for the available handles' ratings and rated-match counts; pick the highest-rated available handle. If an entry cannot be matched to a handle with certainty, fall back to any available handle and mark the choice UNVERIFIED.
   - **Route D** (a named real opponent ready now): skip both; go to section 3D.
3. Then start the opener in the same turn when the route is already known (section 3).

Do not, before the challenge: call `queue_status`, `list_lobbies`, `challenge_status` or `read_lobby` "to check state"; read `xd://…` tool schemas; call `tools/list`; build a manual MCP client; or read `rules`. The server enforces the no-duplicate rules: `request_challenge` is refused while another queue entry, lobby or challenge is live, and the opener logs that refusal for you to resolve (section 3A, "Refusals"). Never dump all rules or schemas, never run a local mock server during a run, and never call `rating`.

## 3. Choose a route

### A. Challenge a house handle

**Choosing the handle**

- If the command names a handle, use that exact handle. It must be `available: true` in the probe. If it is missing or unavailable, stop and report it; do not substitute another handle.
- If the command names none, use the strongest available handle from step 2 of preflight. Record the handle, rating and rated-match count for the report. Never pick an unavailable handle.
- If no handle is available, do not send a challenge. Report the unavailable handles with their reasons and stop.

**Issuing the challenge and seating the match — one call, no model turn in between**

```sh
node scripts/open-match.mjs --detach --opponent antwars/<handle>
```

`--detach` returns in under a second and prints the child pid; the same process then does every remaining handoff step, in this order, with 1-2 s retries:

1. `request_challenge {key, opponent}` and log `requestId`, `lobbyId`, `seat`.
2. `read_lobby` and log the seat names and `startsAt`, so the challenger name is confirmed without a model turn.
3. `locate_match` every 2 s until it returns `mcpUrl` (it usually answers on the first call; do not wait for `challenge_status` to read `playing` — the match server accepts the seat during the lobby's nest window (`nestSelection.closesAt`; 120 s by default, 70.6 s in the 2026-11-09 challenge), before the first tick).
4. MCP `initialize` + `join {key, seat}` on that exact URL, retrying `lobby_loading` / `match_not_started` / `call_rate` with their `retryAfterMs`.
5. `pick_nest`: the default nest tile (the server's own auto-placement, so the pick never regresses the opening), plus one retry with a precomputed legal neighbour on a tile-specific refusal (`nest_food`, `nest_water`, `nest_rock`, `nest_outside_box`) while the window is open. A window refusal is terminal: keep the default nest.
6. The first `observe`, then `set_brood {brood:"workers"}` on queen 0 and the first `count_mark {verb:"FORAGE", count:20, caste:"worker"}` on the nearest visible food tile.
7. One `observe` every 45 s (the 300 s forfeit guard), re-laying FORAGE when no FORAGE mark of ours is alive, until `matchOver`.

Every step is written as JSONL to `%USERPROFILE%\.antwars\opener.log`, and the live state to `%USERPROFILE%\.antwars\opener-state.json` (`phase`, `mcpUrl`, `tick`, `nest`, `forage`).

**Refusals** are in the log as `challenge_refused` with the server's code; resolve each without re-challenging blindly:

| code | action |
|---|---|
| `opponent_unavailable` | report the handle and reason; stop (exit 4) |
| `queue_waiting` / `queue_matched` | a ranked entry is live: follow it with `--queue 1v1` or `--lobby <id>`, do not send a second challenge |
| `lobby_active` / `challenge_active` | an earlier lobby or challenge is live: `--lobby <id>` or `--request <id>`; never a second request |
| `allowance` / daily limit | report the limit; stop |

If the challenge needs anything beyond omp-dolphin's existing identity and key (a new identity or handle, another key, an invite from someone else), do not do it. Report exactly what it asks for and stop. If it exists only on the website with no tool or documented API, report that and stop; do not drive a browser or scrape the site unless the user explicitly asks.

**Confirming the challenger name**

- Read the opener log's `lobby` line (written right after the request): `colonies[1][0]` must be `omp-dolphin`.
- If the challenger is shown under any other name, report that as a mismatch and stop. Do not try to change it.

### B. Public lobby with a house-bot opponent (currently closed)

- Use only if the live lobby tools now explicitly confirm an owner can start a match with one seat occupied and the other seat controlled by a house bot.
- If confirmed, create exactly one public lobby as omp-dolphin, start it only as the live state requires, and hand the lobby to `node scripts/open-match.mjs --detach --lobby <id>`.
- If a second human or agent is still required, do not create one.

### C. No house route available

- If route A has no available handle and route B is closed, do not enter the ordinary ranked queue on speculation and do not create a speculative lobby.
- Go to route D.

### D. Real opponent, pre-arranged only

- Use only if the user's command states that a named opponent is ready now, or gives a specific match window.
- Use the route the user names, always through the opener so the seat is taken at the first tick:
  - ranked 1v1: `node scripts/open-match.mjs --detach --queue 1v1` (one queue entry, one 15-minute window; the opener polls `queue_status` every 2 s, seats the match, and opens it);
  - an existing lobby: `node scripts/open-match.mjs --detach --lobby <lobbyId>`.
- Confirm the opponent identity from the match briefing before treating the goal as achieved.
- If no pairing happens inside the window, the opener exits 3 (`queue_end` / `queue_timeout`); report what `queue_status` showed. Do not create a second queue entry or lobby.
- If the command does not say an opponent is ready, do not queue or create a lobby. Report "no opponent available" with the reason, and stop.

## 4. Match handoff and play

1. **The opener owns the handoff.** Do not call `locate_match`, `initialize`, `join`, `pick_nest`, `set_brood` or the first FORAGE by hand for a fresh match; the opener has already done them, usually before the first tick. Do not read project files after this handoff; all required strategy files were read during preflight.
2. Read the opener log once (one call, e.g. `tail -n 20 %USERPROFILE%\.antwars\opener.log`) plus `opener-state.json`. From them take `mcpUrl`, colony (expect 1), `tick`, the accepted `nest` tile, `brood`, and the FORAGE tile. Check for `error`/refusal lines and fix only those (for example a `nest_food` retry that also failed).
3. **One match turn = one eval cell.** Any new MCP session against the match server must initialize, `join {key, seat}`, issue that turn's calls and print a compact summary inside a single tool call; never split initialize / `tools/list` / schema lookup / join across turns. Rejoining the same key and seat is allowed and returns the seat; a second session must not issue commands that conflict with the opener's FORAGE relay. On HTTP 404 `Unknown session`, initialize a new session and `join {key}` (or `{key, seat}`) again. Whole-number JSON-RPC ids only. Retry transport errors up to 3 times, except `found_queen`: after an error, take a fresh `observe` first and retry only if the state shows the founding did not land; if ambiguous, stop and report.
4. Read the full match briefing and the live `rules` once, from the match server, on the first turn that needs them. If the output is truncated behind an artifact handle, fetch it. The live briefing and rules take precedence over `prompt.md`.
5. Cadence: observe every 15-20 s during the opening and fights, 30 s in calm periods; never more than 60 s between accepted game-tool calls. The opener's 45 s heartbeat already holds the 300 s forfeit; if you stop it (`%USERPROFILE%\.antwars\opener.log.stop`), start `scripts/keepalive.mjs --detach --url "<mcpUrl>" --seat 1` instead and check for `"event":"heartbeat","ok":true` within 5 s.
   - Run log: at the start of every match turn, append one JSON line to `%USERPROFILE%\.antwars\run-log.jsonl`: `{"at":"<ISO time>","tick":<view tick>,"idleLeft":<observe status[0]>}`. Consecutive `at` values measure turn latency; the opener's heartbeats fill the gaps. Append with a real appender (`printf ... >>` in bash, `fs.appendFileSync`, `Bun.file(path).writer()`): `Bun.write` truncates the file, and on 2026-11-10 it left only the last line of the match's run log. Never write the key.
   - Decode `observe` cells with `kind = k % 6`: colony is `kind % 2` (even = colony 0, odd = colony 1), never `antId % 2`; `kind >= 4` is a soldier.
6. Use `order`, `count_mark`, `found_queen` and `set_brood` only according to their live schemas and limits (`order` and `count_mark` share one command per 10 s; `set_brood` and `observe` do not). After consequential actions, check acceptance and adapt. Do not re-lay the opener's FORAGE mark at the same tile unless it has expired or the food is gone.
7. Continue until the server confirms `matchOver: true`, the winner or draw, and the result. Then stop the opener if it is still running (`%USERPROFILE%\.antwars\opener.log.stop`).

## 4A. Play plan

All gameplay strategy is in the repository-root `prompt.md`, read once during preflight (section 2). Do not read `prompt.md`, `study/last-match.md`, `study/match-notes.md` or any other project file after match handoff. The live match briefing and rules take precedence over historical targets in `prompt.md`. Use the observation, accepted-call and idle cadence in section 4.

## 5. Report and stopping rules

- Report the route used (A, B, D, or none), the challenger name shown by the server, the opponent identity and type, match start and end, winner or draw, duration if provided, final stats, and important confirmed events.
- Report the start timing from the opener log: `challenge`→`located`→`joined` deltas, the `joined` tick, the `nest_pick` result and tick, and the first `brood`/`forage` tick. A handoff that took longer than 5 s from `request_challenge` to `joined`, or a first command after tick 100, is a defect to report, not a match detail to gloss over.
- Separate VERIFIED facts from interpretation. Label anything not confirmed as UNVERIFIED.
- If no match was started, state what was checked in this run and the exact blocker (tool name, error text, or rule wording). Do not claim house bots are inaccessible beyond what was observed.
- Do not start another queue, lobby, challenge, identity or match after this run unless the user explicitly asks again.
- Never include the key.
