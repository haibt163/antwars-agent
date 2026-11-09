# Handoff latency — why the 2026-11-09 14:50 match was lost without a join

Scope: the process defect behind `study/last-match.md` (the 2026-11-09 no-join report) (challenge
`3f933d3a-8f58-41ce-b304-c1bc7dc1dbd0`, lobby `effb0279-245c-400e-a981-de6bd040de3a`).
Every timestamp below comes from the OMP session transcript
(`~/.omp/agent/sessions/--C--Projects-antwars-agent--/2026-11-09T14-42-12-270Z_01a1c0c2-….jsonl`)
and from the lobby records returned by the server.

## 1. The timeline

| Time (UTC) | Event | Gap since previous assistant turn |
|---|---|---|
| 14:50:19.6 | `request_challenge` accepted: requestId, lobbyId, seat 1 | — |
| 14:51:34.7 | `challenge_status` + `read_lobby` (turn 1 after the challenge) | 75.0 s |
| 14:52:59.7 | `locate_match` (turn 2) | 84.4 s |
| 14:55:51.9 | MCP `initialize` on the match URL (turn 3) | 172.0 s |
| 14:58:19.8 | `tools/list` (turn 4) | 147.5 s |
| 15:00:15.5 | inputSchema dump for `join`/`pick_nest`/`order`/… (turn 5) | 114.8 s |
| 15:02:46.2 | first `join` attempt → `match_over` | 150.8 s |

- Lobby `startsAt` was **14:51:30.3**, 70.6 s after the request. The match therefore started
  while turn 1 was still in flight.
- The match ended at **tick 5,015 ≈ 501.5 s after the start**, i.e. about 14:59:52 — before
  turn 5 had finished. The first `join` was 597 s after the request and 8 minutes after the
  start.
- The four turns between `locate_match` and `join` alone cost **584.8 s** of model latency,
  and none of them touched the game: `tools/list` and the schema dump were pure discovery.

## 2. Why it did not bite before

Median assistant-turn latency, per session, from the same transcript field (tool-result
timestamp → next assistant timestamp):

| Day | Sessions (start) | Median turn |
|---|---|---|
| 2026-11-04 | 02:54, 05:51, 07:35, 08:21, 13:49 | 5.7, 31.3, 33.8, 10.8, 6.5 s |
| 2026-11-05 | 11:14, 11:39, 12:52 | 3.4, 3.2, 3.0 s |
| 2026-11-06 | 07:32, 10:50, 12:58 | 12.5, 5.8, 4.0 s |
| 2026-11-08 | 14:06, 14:59 | 4.2, 10.2 s |
| 2026-11-09 | 06:48, 08:13, 13:15, **14:42** | 12.4, 29.3, 51.3, **54.5 s** |

The same lateness was present all along, just short of fatal, and it is visible in the older
reports: 2026-11-04 "no nest pick — match had started before my first `pick_nest`";
2026-11-06 "seat joined at tick 3,979"; 2026-11-08 the nest window had closed before the retry;
2026-11-09 08:13 the seat forfeited at tick 4,710 after two turns of 3 m 05 s and 2 m 13 s.
Turn latency on 2026-11-09 is **10-18× the 11/05-11/06 baseline**, and the procedure still put
four to five turns between the challenge and the join. Today the product of the two exceeded
the match.

Aggravating, not causal: `xd://` tool-schema reads, a manual MCP client build, a rejected
`request_challenge` with a placeholder key, and the run procedure's own step 4.2
(`initialize` → `tools/list`, "then call the documented match tools"), which reads as a
per-turn checklist.

## 3. Root cause

1. **The critical path was model turns.** Procedure steps 3A-4.1 to 4.3 each needed their own
   turn: confirm, locate, initialize, list tools, join. At 50-170 s per turn, that is minutes.
2. **Nothing held or took the seat before the model arrived.** `keepalive.mjs` is step 4-3a,
   i.e. after the join, so it cannot cover the handoff gap.
3. **The match starts on the server's clock, not ours.** `startsAt` came 70 s after the
   request; the house seat played from tick 0. An unjoined colony loses its queens inside the
   first ~500 ticks.
4. **Optional work ran inside the window.** `tools/list`, schema dumping and a hand-rolled
   HTTP client were all avoidable: the tool surface is fixed and the opener ships the client.

## 4. Fix — one process owns the handoff

`scripts/open-match.mjs` (new) does everything between "the route is chosen" and "the colony is
playing", with 1-2 s retries and no model turn in between:

```
request_challenge   -> read_lobby (seat names)  -> locate_match (2 s poll)
-> initialize+join  -> pick_nest (+1 fallback on a tile refusal)
-> observe          -> set_brood workers       -> FORAGE count_mark (nearest food)
-> observe every 45 s, FORAGE relay while it runs, until matchOver
```

- `--opponent` (route A), `--queue 1v1` (route D ranked), `--lobby <id>` (route D lobby),
  `--request <id>` (resume), `--mcp-url` (direct/local), `--probe` (read-only availability).
- It seats the match server **during the nest window**, so the pick, the brood order and
  the forage mark all land before the first tick. That also removes the visibility handicap:
  the opening is no longer "whatever the auto-placer left after two minutes of idle".
- It keeps the 300 s forfeit clock reset itself, so a 3-minute model turn no longer risks the
  seat.
- Bugs found while building it: the opener deletes a stale `keepalive.log.stop` before it
  starts (one was left from 14:00:18 and would have ended the next keepalive instantly), and
  the fallback nest tile is chosen from a ring that excludes the refused tile.

## 5. Verification (no match played)

`node scripts/test-opener.mjs` runs the real script against a protocol-faithful mock match
server (Streamable HTTP + SSE, `Mcp-Session-Id`) and asserts the whole opening:

```
ok  scenario 1 (direct): start -> joined -> nest_pick -> nest_pick_retry -> brood -> forage
    -> heartbeat -> forage_relay -> heartbeat -> result -> exit
ok  scenario 1: join attempts 2 (lobby_loading retry), nest refused 112,48 then 112,47,
    brood workers, forage 112,48, beats 2, exit 0
ok  scenario 2 (challenge): request -> locate -> join in 2026 ms; challenger omp-dolphin
ok  scenario 3 (queue): waiting -> matched -> joined
```

Scenario 2 is the exact path that took 597 s today; in-process it took **2.0 s** (one refused
`locate_match` plus one 2 s poll). Live read-only probe against the real entry server:
`node scripts/open-match.mjs --probe --opponent antwars/gpt-6-astra` returned
`allowanceLeft 12, available true` in 2.35 s.

## 6. Rules changed

- `.omp/commands/antwars-run.md`: preflight cut to two model calls; the opener is the only
  handoff path; model-issued `challenge_status` / `read_lobby` / `locate_match` / `tools/list`
  and manual client setup are banned between the challenge and the join; "one match turn = one
  eval cell" for play; the keepalive is now the fallback for a resumed match, not the first
  defence; the report must include `challenge`→`located`→`joined` timings and the first-command
  tick.
- `README.md`: startup contract with the exact commands and the measured numbers.
- `prompt.md`: the opening bullet states that the opener makes the nest pick, brood order and
  first FORAGE before tick 0, and that the model verifies rather than repeats them.
- `scripts/keepalive.mjs` is unchanged and remains the tool for a seat that is already playing.

## 7. Open items

- The real proof is a live match: `challenge`→`joined` must be ≤ 5 s and the first FORAGE must
  land at tick ≤ 100. Not yet observed (this note was written before any further match).
- The 45 s heartbeat is a forfeit guard, not a player: during a long model turn the colony
  still runs the opener's static plan (worker brood, one FORAGE mark), which is the intended
  floor, not a substitute for turn-by-turn play.
