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
- On 2026-11-04 a challenge against `antwars/gpt-6-1-terra-max-fast` (the only handle available) was played to the end and lost by queen elimination at tick 4448 (about 7 minutes). Daily allowance after that match: 1 of 20 shared, 1 of 5 for this username. The causes in the player's own report (UNVERIFIED, not server-confirmed): worker-only brood for the first ~371 s, nest placed under the northern food patch and enemy crossing lane, count marks refused for being out of reach, about 1,500 food never spent, and no second queen founded.

Treat these as the last known state, not a guarantee. Re-check availability every run.

## 2. Preflight

1. Read the live `rules` output once. Look for changes to the challenge route, opponent availability, or house admission.
2. Call `list_challenge_opponents` (no key needed). Record each handle's `available` flag and `reason`.
3. Check the current state with `queue_status`, `list_lobbies` and `challenge_status`. Resume an eligible match if one exists. Never create a duplicate queue entry, lobby or challenge.
4. Read the key only when a documented call needs it. Keep it in session memory. Never print, quote, save, log or commit it.
5. Do not dump all rules or schemas. Do not run a local mock server, write helper files, or perform speculative transport tests. Do not call `rating` or other tools that are not needed for the route.
6. Stop the preflight once a route in section 3 is chosen or ruled out.

## 3. Choose a route

### A. Challenge a house handle

**Choosing the handle**

- If the command names a handle (for example `antwars/claude-opus-5-5`), use that exact handle. It must appear in the `list_challenge_opponents` result with `available: true`.
  - If it is missing or unavailable, stop and report it. Do not substitute another handle.
- If the command names no handle, pick any handle with `available: true`. Prefer one matching the most recent live list.
- If no handle is available, do not send a challenge request. Report the full list of unavailable handles with their reasons, and stop. (The 2026-11-03 refusal showed that a request against an unavailable handle is wasted.)

**Sending the challenge**

- Call `request_challenge` once with `{key, opponent}` using the exact live schema.
- One challenge, one wait window of at most 15 minutes. Poll at the documented cadence. Stop immediately on a terminal state or match handoff. Do not leave, rejoin, or resend.
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

1. When a match is confirmed, call `locate_match` and use only the exact `mcpUrl`, credentials and session details it returns. Never guess an endpoint.
2. If match tools are dynamically mounted, use them. Otherwise use the runtime's supported Streamable HTTP MCP client against that exact URL: initialize, capture and reuse `Mcp-Session-Id` when supplied, send the initialized notification, call `tools/list`, then call the documented match tools. If the real endpoint cannot be reached, report the exact error and stop. Do not test against a mock first.
3. Read the match briefing, live rules, tool schemas, command limits and idle limit. Follow the briefing if it differs from this file.
4. Start playing promptly. Never let more than 60 seconds pass between accepted game-tool calls. Observe about every 15-20 seconds during the opening and fights, and about every 30 seconds in calm periods. Refused calls do not reset the idle clock.
5. Use `order`, `count_mark`, `found_queen` and `set_brood` only according to their live schemas and limits. After consequential actions, check whether each command was accepted and adapt to the board.
6. Continue until the server confirms `matchOver: true` (or its documented equivalent), the winner or draw, and the result.

## 4A. Play plan (from one lost match; always use the live rules and briefing values, which override these numbers)

Before play, if a file named `match-notes.md` exists in the project directory, read it once and apply its lessons. Do not search elsewhere for it.

1. **Nest position.** Read the map and briefing first. If the nest tile can be chosen, avoid sitting directly on an enemy crossing lane or a food patch. Prefer a spot away from the main lanes, near the back edge, while still within reach of food.
2. **Brood.** Do not run worker-only brood for long. Set a mixed brood from the start, or as early as the live rules allow, so defenders are not all low-HP workers against soldiers.
3. **Spend food.** Do not let food pile up unused. When food is high, spend it on brood, and on a second queen once the live cost and placement rules allow. Check the live cost; do not rely on the number from the last match.
4. **Marks.** Count marks expire and have a placement reach from a living ant (last match: about 180 s and 12 tiles; check the live schema). Re-lay marks before they expire, place them within reach, and do not repeat a placement that was just refused.
5. **First contact.** Keep early foragers out of the enemy approach lane. When enemy ants are seen near your ants or nest, observe more often than the normal cadence and pull defenders back toward the nest.
6. **Nest defense.** Keep a defend mark and soldiers near the queen. Check queen HP at every observation.

Keep this plan short. Do not stall the match to over-plan. Adapt to what the board shows.

## 5. Report and stopping rules

- Report the route used (A, B, D, or none), the challenger name shown by the server, the opponent identity and type, match start and end, winner or draw, duration if provided, final stats, and important confirmed events.
- Separate VERIFIED facts from interpretation. Label anything not confirmed as UNVERIFIED.
- If no match was started, state what was checked in this run and the exact blocker (tool name, error text, or rule wording). Do not claim house bots are inaccessible beyond what was observed.
- Do not start another queue, lobby, challenge, identity or match after this run unless the user explicitly asks again.
- Never include the key.
