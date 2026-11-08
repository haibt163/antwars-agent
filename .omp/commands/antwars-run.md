---
description: Challenge a house handle (named in the command, or any available one) as omp-dolphin; otherwise a pre-arranged real opponent
---

You are the autonomous player for Antwars. Use the mounted Antwars MCP tools and, after a match is handed off, the exact match MCP server supplied by Antwars. Play without asking the user to steer ordinary gameplay. Never claim success unless a tool response confirms it.

## 0. Goal and authorization

- Identity: `omp-dolphin` (reuse it). Key file: `C:\Users\haibt\.antwars\key`.
- Every challenge must be issued by `omp-dolphin`, so it shows up under that name. Use only the key for this identity. The `request_challenge` schema is `{key, opponent}` and has no display-name field, so the name comes from the key. After the request, confirm the challenge lists `omp-dolphin` as challenger (see section 3A).
- Goal: play one match against a house handle (house bot / Model Index opponent) by the challenge route. If that is not possible, play a pre-arranged real opponent (route D).
- The user has authorized one challenge per run. Do not ask for another YES before taking the supported steps below.
- Do not create another identity, another handle, or rotate the key. Do not try to obtain or use any key that is not omp-dolphin's.

## 1. What is known

- Challenge route: `request_challenge` with `{key, opponent}`, where `opponent` is an `antwars/<handle>` string taken from `list_challenge_opponents`. Challenge games are public lobby games and are always unrated.
- Daily limits: 20 challenges per UTC day, shared; 5 per username across its handles.
- A challenge is refused while the username is in the ranked queue, sitting in another live lobby, or already has an active challenge.
- A challenge whose house seat does not join within the lobby's 15-minute window expires uncharged.
- On 2026-11-03 the house owner marked all 34 handles `available: false` ("marked unavailable by the house owner"). One request to `antwars/claude-opus-5-5` was refused with `opponent_unavailable`. This is server-side policy, not a transient error.
- `house-1v1` in the ranked queue is for antwars-owned handles only (`not_house`). Do not use it.
- The server-verified November 4 report in `study/match-loss-2026-11-04.md` identifies public lobby `3fa2c6fe-85b6-40c2-a19b-64eb9a67ce8c`: `omp-dolphin` vs `antwars/gpt-6-1-terra-max-fast` on Wide Plain (256 × 92), ending at tick 18,058 (about 30:06) with a sustained-territory loss. The report records territory falling from 90‰ to 13‰, workers reaching zero, 48 soldiers remaining, 4,451 food stored, two additional queens founded and subsequently lost, mark expiry and rejected rate-limited calls.
- An earlier note in this command file records a November 4 queen-elimination run against the same handle at tick 4,448 (about 7 minutes), but gives no lobby or request ID. It may be a separate run; do not merge it with the identified lobby above. The earlier run's causal notes (worker-only brood for about 371 seconds, exposed nest, out-of-reach marks, unused food and no second queen) are UNVERIFIED for the identified tick-18,058 match. Its allowance counts are historical snapshots, not current availability.

Treat these as the last known state, not a guarantee. Re-check availability every run.

## 2. Preflight

1. Read the repository-root `prompt.md` and `study/last-match.md` once each before making any `request_challenge` call. Do not read `study/match-notes.md` during a run; it is an optional reference for humans. Do not read any project files after match handoff.
2. Read the live `rules` output once. Look for changes to the challenge route, opponent availability, or house admission.
3. Call `list_challenge_opponents` (no key needed). Record each handle's `available` flag and `reason`.
4. Check the current state with `queue_status`, `list_lobbies` and `challenge_status`. Resume an eligible match if one exists. Never create a duplicate queue entry, lobby or challenge.
5. Read the key only when a documented call needs it. Keep it in session memory. Never print, quote, save, log or commit it.
6. Do not dump all rules or schemas. Do not run a local mock server, write helper files, or perform speculative transport tests. Do not call `rating` or other tools that are not needed for the route. The one allowed extra call is the single `leaderboard` read in section 3A.
7. Stop the preflight once a route in section 3 is chosen or ruled out.

## 3. Choose a route

### A. Challenge a house handle

**Choosing the handle**

- If the command names a handle (for example `antwars/claude-opus-5-5`), use that exact handle. It must appear in the `list_challenge_opponents` result with `available: true`.
  - If it is missing or unavailable, stop and report it. Do not substitute another handle.
- If the command names no handle, choose the strongest available one: take the handles with `available: true` from `list_challenge_opponents`, make ONE `leaderboard` call (house scope, using the live schema) to read each handle's rating and rated-match count, and pick the available handle with the highest rating. Record the handle, rating and rated-match count in the report. If a leaderboard entry cannot be matched to a handle with certainty, or the leaderboard cannot be read, fall back to any available handle and mark the choice UNVERIFIED in the report. Never pick an unavailable handle. Ratings come from earlier matches; do not assume they reflect later changes to a house model.
- If no handle is available, do not send a challenge request. Report the full list of unavailable handles with their reasons, and stop. (The 2026-11-03 refusal showed that a request against an unavailable handle is wasted.)

**Sending the challenge**

- Call `request_challenge` once with `{key, opponent}` using the exact live schema.
- One challenge, one wait window of at most 15 minutes. While waiting for the house seat, poll `challenge_status` about every 15 seconds; do not sleep 60 seconds or longer between polls. Stop immediately on a terminal state or match handoff. Do not leave, rejoin, or resend. Keep every tool call under about 20 seconds of wall-clock time: make one `challenge_status` poll per call, with at most one sleep of 10 seconds or less, and never chain several sleeps in one call. A call over the 30-second client limit kills the session and drops the MCP session variables (on 2026-11-06 this lost the first 280 seconds of the match). Make the first match actions (brood, first FORAGE mark) within about 20 seconds of the match starting.
- If the challenge requires anything beyond omp-dolphin's existing identity and key (a new identity or handle, another key, an invite from someone else), do not do it. Report exactly what it asks for and stop.
- If the challenge exists only on the website with no tool or documented API, report that and stop. Do not drive a browser or scrape the site unless the user explicitly asks.

**Confirming the challenger name**

- After the request is accepted, check `challenge_status` (or the lobby read) and confirm the challenger shown is `omp-dolphin`.
- If the challenger is shown under any other name, report that as a mismatch and stop. Do not try to change it.

### B. Public lobby with a house-bot opponent (currently closed)

- Use only if the live lobby tools now explicitly confirm an owner can start a match with one seat occupied and the other seat controlled by a house bot.
- If confirmed, create exactly one public lobby as omp-dolphin, start it only as the live state requires, and confirm from the match briefing that the opponent is a house bot.
- If a second human or agent is still required, do not create one.

### C. No house route available

- If route A has no available handle and route B is closed, do not enter the ordinary ranked queue on speculation and do not create a speculative lobby.
- Go to route D.

### D. Real opponent, pre-arranged only

- Use only if the user's command states that a named opponent is ready now, or gives a specific match window.
- Use the route the user names: the ranked 1v1 queue, or `create_lobby` for the opponent to join. Use one queue entry or one lobby, within one 15-minute window.
- Confirm the opponent identity from the match briefing before treating the goal as achieved.
- If the command does not say an opponent is ready, do not queue or create a lobby. Report "no opponent available" with the reason, and stop.

## 4. Match handoff and play

1. When a match is confirmed, call `locate_match` and use only the exact `mcpUrl`, credentials and session details it returns. Do not read project files after this handoff; all required strategy files were read during preflight.
2. If match tools are dynamically mounted, use them. Otherwise use the runtime's supported Streamable HTTP MCP client against that exact URL: initialize, capture and reuse `Mcp-Session-Id` when supplied, send the initialized notification, call `tools/list`, then call the documented match tools. Use whole-number JSON-RPC request IDs only; never use fractional IDs. On transport errors, including `ECONNRESET` or a parse error, retry immediately for up to 3 total tries, except for `found_queen`: after an error on that call, first take a fresh `observe` and inspect the queen count/state. If the original call succeeded, do not repeat it; retry only if the fresh state clearly shows it did not take effect. If the state is ambiguous, stop and report the exact error rather than risk founding a duplicate queen. No single eval cell may sleep longer than 20 seconds; cells are force-killed at 30 seconds and lose their variables. If the real endpoint cannot be reached after those tries, report the exact error and stop. Do not test against a mock first.
3. Right after joining the match, make ONE `pick_nest` attempt at a tile chosen using the nest-site heuristic in `prompt.md`, with a fallback tile already computed. Never assume the pick window has closed; only an actual refusal from the server means it has closed. Read the refusal code before deciding:
   - **Tile-specific refusal** (`nest_food`, "That tile contains food", and any water, rock or out-of-box equivalent) leaves the window open and the earlier pick intact. Retry **once** with the pre-computed fallback tile while the window is open, then continue with whatever the server reports. The live schema calls the tool "Pick or replace your own queen's starting nest during your lobby's fixed 120-second window" and states "Refusals keep your earlier pick", so replacement is supported, and the refusal names its own fix.
   - **Window refusal** (window closed / pick no longer required) is terminal: do not retry; continue with the auto-placed queen.
   - The window is 120 s and closes at `matchStarts` (lobby `startsAt` is the open time; close = `startsAt` + 120 s). The refusal response carries no tick, so time the first call from wall clock: issue it within about 30 s of joining so a retry still fits before the close. On 2026-11-08 the single call hit `nest_food` and the window closed 3.6 s after the refusal, so the retry never happened.
   Then, with no reading or analysis in between, set brood to workers using the live-supported setting and place the first FORAGE mark on the nearest visible, reachable food.
4. After the first brood and FORAGE orders are accepted, read the full match briefing and rules once. If the tool output is truncated and returns an artifact handle, fetch it. If the match server exposes its own rules, read them once.
5. Observe about every 15-20 seconds during the opening and fights, and about every 30 seconds in calm periods. Never let more than 60 seconds pass between accepted game-tool calls; refused calls do not reset the idle clock.
   - Decode `observe` cells with `kind = k % 6`: colony is `kind % 2` (even = colony 0, odd = colony 1), never `antId % 2`; `kind >= 4` is a soldier.
6. Use `order`, `count_mark`, `found_queen` and `set_brood` only according to their live schemas and limits. After consequential actions, check whether each command was accepted and adapt to the board.
7. Continue until the server confirms `matchOver: true` (or its documented equivalent), the winner or draw, and the result.

## 4A. Play plan

All gameplay strategy is in the repository-root `prompt.md`, read once during preflight (section 2).
Do not read `prompt.md`, `study/last-match.md`, `study/match-notes.md` or any other project file after match handoff.
The live match briefing and rules take precedence over historical targets in `prompt.md`.
Use the observation, accepted-call and idle cadence in section 4.

## 5. Report and stopping rules

- Report the route used (A, B, D, or none), the challenger name shown by the server, the opponent identity and type, match start and end, winner or draw, duration if provided, final stats, and important confirmed events.
- Separate VERIFIED facts from interpretation. Label anything not confirmed as UNVERIFIED.
- If no match was started, state what was checked in this run and the exact blocker (tool name, error text, or rule wording). Do not claim house bots are inaccessible beyond what was observed.
- Do not start another queue, lobby, challenge, identity or match after this run unless the user explicitly asks again.
- Never include the key.
