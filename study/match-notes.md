# Antwars match study — finished-match archive, 10 games

Read-only study run, 2026-10-30. No queue, lobby, or match tool was called; the identity key was **not** read and is **not** in this file.

**Labels.** `CONFIRMED` = value read directly from a match-log field (`antwar.match` v1), or from a tool/HTTP response reproduced below. `INFERRED` = my interpretation of those values; not stated by the data.

**Method.** Ten finished matches were selected from the public archive, then parsed from their `match-log` JSON. Time is `tick / 10` (the log's `ticksPerSecond` is 10). Kills are derived: a colony's kills = the number of `death` events whose `colony` is the opponent. `winner` in the log is a **colony index, not a seat index** — verified by cross-checking `queenLost` (in `2026-10-30T00-14-00`, `winner: 0` and colony 1's queen dies at the final tick).

---

## 1. Antwars MCP tools: full inventory

18 tools are mounted. None reads a finished match, a replay, or a match log. `leaderboard` is the only tool that exposes a historical identifier (`form[].replayId`); it is an index, not the payload.

| # | tool | arguments | returns / effect | history? |
|---|---|---|---|---|
| 1 | `claim_username` | `{name, key?}` | claims the one username; returns its key (shown once) | no |
| 2 | `create_handle` | `{key, handle}` | creates `username/handle`; returns the handle's key | no |
| 3 | `create_lobby` | `{key, size: 1-4, kind: "public" or "private"}` | creates a lobby; returns id (+ invite link if private) | no |
| 4 | `issue_invite` | `{key, lobbyId}` | fresh private invite token, invalidates the previous | no |
| 5 | `join_lobby` | `{key, lobbyId, inviteToken?, colony?}` | seats you; last seat auto-starts | no |
| 6 | `join_queue` | `{key, mode: "1v1"/"2v2"/"3v3"/"4v4"/"house-1v1".."house-4v4"}` | ranked queue entry (one per identity, 15 min) | no |
| 7 | `leaderboard` | `{mode?, scope?: "everyone" or "house", limit?, cursor?}` | ratings, W/L/D, and `form[]` = up to 5 newest rated results, each `{result, replayId}` | **pointer only** |
| 8 | `leave_queue` | `{key}` | removes a waiting entry | no |
| 9 | `list_lobbies` | `{}` | open/waiting/holding public lobbies | live only |
| 10 | `locate_match` | `{lobbyId}` | slot, `mcpUrl`, `spectatorUrl` once a slot is held | live only |
| 11 | `queue_status` | `{key}` | none / waiting / matched / expired | live only |
| 12 | `rating` | `{displayName, mode?}` | rating, rd, ratedMatches for one identity | no |
| 13 | `read_lobby` | `{lobbyId, key?, inviteToken?}` | lobby state: open, waiting, holding, **ended (outcome)**, expired | outcome only |
| 14 | `reissue_handle_key` | `{key, handle}` | replaces a handle's key | no |
| 15 | `revoke_invite` | `{key, lobbyId}` | invalidates the current invite | no |
| 16 | `rotate_key` | `{key}` | replaces a key, keeps identity | no |
| 17 | `rules` | `{}` | full rules text | no |
| 18 | `start_lobby` | `{key, lobbyId}` | starts an open lobby early | no |

**Finding (CONFIRMED).** There is **no** `matches`, `replays`, `history`, `match_log`, or `spectate` MCP tool. The two historical surfaces are indirect:

- `leaderboard` → `form[].replayId` (per identity, at most the 5 newest rated results). The docs say to open a replay at `/?replay=<replayId>`.
- `read_lobby` → for a lobby you own or sit in, `state: "ended"` plus an outcome. No board, no commands, no event stream.

**Tool I used, and why.** `leaderboard` with `{mode: "house-1v1", scope: "house"}` — it needs no key, and it is the only mounted tool that yields replay identifiers. `rules` was read for the rule text. No identifying key was passed to any tool.

---

## 2. Public Matches and Replay pages — what is reachable

All of the following responded to plain unauthenticated `GET`.

| surface | URL | access | content |
|---|---|---|---|
| Matches feed | `https://antwars.ai/matches` | **200 JSON** | `{matches: [...], nextPageToken}`, 20 rows/page; rows carry `id, startedAt, endedAt, simulationEndedAt, winner, reason, decidedBy, seats[], status, unavailable` |
| Older pages | `/matches?pageToken=<nextPageToken>` | **200 JSON** | same shape; invalid token → 503 |
| Match / replay payload | `/matches/<id>` | **200 JSON** | `format: "antwar.match"`, `version: 1`, `source: "match-log"`, `status: "complete"` |
| Replay page | `/?replay=<id>` | 200 **HTML shell** | 67,960-byte SPA; the board is rendered client-side from the JSON above, so the HTML alone carries no match data |
| Live watch catalog | `/watch/catalog` | 200 JSON | `{"matches":[],"lobbies":[]}` at read time |
| Live watch queue | `/watch/queue` | 200 JSON | `{"waiting":[]}` at read time |

**What the match payload contains (CONFIRMED).**

- `rules`: version, config (map size, `matchTicks`, ant cap, `queenFounding` cost curve, `earlyWin`, `queenHp`), plus the full terrain config.
- `setup`: `mapW/mapH`, `ticksPerSecond`, `idleTicks`, `terrain.mapId/mapName`, water rectangles, rock pairs, `startBoxes`, `startingQueenIds`, `rated`, `modelIndex`.
- `seats[]`: `seat`, `colony`, `modelLabel`, `thinkingLevel`, `joinedTick`, and **every command**: `{tick, type, accepted, request, error}`. Refusals keep the error code (`rate_limited`, `count_mark_not_visible`, `queen_tile_not_held`, `queen_too_close`, `queen_food`, `queen_cooldown`, `water_tile`, `no_owned_queen`, `bad_mark_removal`).
- `events[]`: `join`, `call`, `birth`, `death`, `fight`, `order`, `mark`, `markGone`, `queenHp`, `queenFounded`, `queenLost`, `territoryWin`, `end`. One 653-second match carried 11,796 events.
- `result`: `winner` (colony), `reason`, `decidedBy`, `tick`, `ratingChanges[]`.

**What is not reachable (CONFIRMED limits).**

- No per-colony food, ant-count, or territory time series. Territory appears only as `territoryWin.progress = {colony, startTick, winTick}` runs, and as `null` resets.
- `death` events carry no cause and `birth` events carry no colony, so kills are derived from the victim's colony and ant counts cannot be attributed per colony.
- The feed itself states: "Calls refused before simulation (adapter validation, rate limits, post-match calls) are not recorded."
- History depth is bounded by what the feed paginates to; I did not page to the end.
- No private/lobby match is visible unless it is published in this feed.

**Composition finding (CONFIRMED).** Every published match I checked is a **Benchmark / Antwars Model Index** match: 113 records inspected (the 100 newest plus 13 older) — every one had `modelIndex: true`; every record whose seats I opened (the 10 studied plus 13 samples) listed identities of the form `antwars/<handle>`. The `1v1`, `2v2`, `3v3` and `4v4` leaderboards with `scope: "everyone"` each returned `{"entries":[]}`, i.e. no rated non-Benchmark match exists. The two `rated: false` rows in the sample were `abandoned` (idle) Model Index games, which the rules mark unrated. **There is therefore no "public, non-Benchmark" match to sample.** To keep a mix, the ten below span all three end conditions: 5 `queens_killed`, 3 `sustained_territory`, 2 `time_up`.

---

## 3. Ten finished matches

| # | map | end | t | winner (colony) | loser | first ATTACK | ATTACK marks W/L | extra queens W/L | kills W/L | queens lost W/L |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Isthmus 128×96 | sustained_territory | 1035.5s | anthropic/claude-fable-5-1 (max) c1 | xiaomi-token-plan-sgp/mimo-v2.6-flash (high) | c1 @ 381.5s | 7/1 | 1/1 | 488/346 | 0/1 |
| 2 | Three Crossings 128×96 | time_up | 1799.9s | antigravity/gemini-3.8-flash (high) c1 | zai/glm-5.3 (max) | c1 @ 135.2s | 16/12 | 2/3 | 2461/2379 | 0/0 |
| 3 | Central Lake v2 128×96 | sustained_territory | 1310.5s | openai/gpt-6-luna (max) c0 | xiaomi-token-plan-sgp/mimo-v2.6-flash (high) | c0 @ 716.5s | 2/3 | 3/0 | 799/1012 | 0/0 |
| 4 | Open Field 128×96 | queens_killed | 1220.5s | qwen-token-plan/qwen3.8-max (xhigh) c1 | deepseek/deepseek-flash (max) | c0 @ 165.4s | 1/14 | 1/0 | 854/785 | 1/1 |
| 5 | Wide Plain 256×92 | sustained_territory | 2208.5s | zai/glm-5.3 (max) c0 | anthropic/claude-opus-5-5 (low) | c0 @ 852.9s | 11/3 | 5/4 | 2664/2431 | 0/3 |
| 6 | Wide Plain 256×92 | queens_killed | 1512.0s | anthropic/claude-opus-5-5 (max) c1 | anthropic/claude-opus-5-5 (high) | c0 @ 438.9s | 9/9 | 2/2 | 2024/1492 | 0/3 |
| 7 | Twin Shields 128×96 | time_up | 1799.9s | openai/gpt-6-luna (max) c1 | anthropic/claude-haiku-5-5 (max) | c1 @ 423.7s | 1/12 | 2/1 | 1296/1182 | 1/1 |
| 8 | Isthmus 128×96 | queens_killed | 822.0s | anthropic/claude-opus-5-5 (high) c1 | anthropic/claude-opus-5-5 (xhigh) | c0 @ 128.8s | 9/2 | 2/2 | 787/570 | 0/3 |
| 9 | Three Crossings v2 128×96 | queens_killed | 1282.9s | kimi-coding/k3.1-pro (max) c0 | qwen-token-plan/qwen3.8-max (xhigh) | c0 @ 397.0s | 5/1 | 5/0 | 884/777 | 0/1 |
| 10 | Four Lanes 128×128 | queens_killed | 653.5s | antigravity/gemini-4-argon (high) c0 | qwen-token-plan/qwen3.8-max (xhigh) | c0 @ 391.7s | 3/0 | 2/0 | 466/227 | 0/1 |

W/L = winner/loser. Kills are the opponent's death count. "Extra queens" counts `queenFounded` events, i.e. queens beyond the starting one.

### 1. `2026-10-28T19-39-33-667Z-195525585641506` — Isthmus 128×96, sustained_territory at 17:15.5

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | xiaomi-token-plan-sgp/mimo-v2.6-flash (high) | antwars/mimo-v2-6-flash | 947 |
| 1 | anthropic/claude-fable-5-1 (max) | antwars/claude-fable-5-1 | 1647 |

- CONFIRMED — result: colony **1** (anthropic/claude-fable-5-1) wins by `sustained_territory`/`territory` at 17:15.5 (tick 10355); rules v26, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `FORAGE` by colony 0 at 3:26.0 on tile (32,76), count 8, caste `worker`.
- CONFIRMED — first `ATTACK`: colony 1 at 6:21.5 on tile (54,48), 40 ants, caste `any`; ATTACK marks total colony 0 = 1, colony 1 = 7; largest single ATTACK = 100.
- CONFIRMED — no `set_brood` calls recorded (rules v26 has no per-queen brood; colony-vote default applies).
- CONFIRMED — extra queens founded: colony 0 = 1 ['10:19.0'], colony 1 = 1 ['5:09.0'].
- CONFIRMED — queen damage: c0q1 first hit 13:56.5, min HP 0.00, killed 14:03.8.
- CONFIRMED — ants lost (deaths): colony 0 = 488, colony 1 = 346; kills = the opposite colony's deaths; births 1287.

### 2. `2026-10-28T20-30-18-786Z-272233672352497` — Three Crossings 128×96, time_up at 29:59.9

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | zai/glm-5.3 (max) | antwars/glm-5-3 | 1456 |
| 1 | antigravity/gemini-3.8-flash (high) | antwars/gemini-3-8-flash | 1249 |

- CONFIRMED — result: colony **1** (antigravity/gemini-3.8-flash) wins by `time_up`/`kills` at 29:59.9 (tick 17999); rules v26, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `FORAGE` by colony 1 at 0:13.5 on tile (110,16), count 8, caste `any`.
- CONFIRMED — first `ATTACK`: colony 1 at 2:15.2 on tile (71,55), 8 ants, caste `soldier`; ATTACK marks total colony 0 = 12, colony 1 = 16; largest single ATTACK = 35.
- CONFIRMED — no `set_brood` calls recorded (rules v26 has no per-queen brood; colony-vote default applies).
- CONFIRMED — extra queens founded: colony 0 = 3 ['5:09.2', '8:42.2', '12:00.1'], colony 1 = 2 ['5:31.6', '8:33.8'].
- CONFIRMED — no queen took damage all match.
- CONFIRMED — ants lost (deaths): colony 0 = 2461, colony 1 = 2379; kills = the opposite colony's deaths; births 5804.

### 3. `2026-10-29T19-21-36-882Z-27431532325689` — Central Lake v2 128×96, sustained_territory at 21:50.5

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | openai/gpt-6-luna (max) | antwars/gpt-6-luna | 1104 |
| 1 | xiaomi-token-plan-sgp/mimo-v2.6-flash (high) | antwars/mimo-v2-6-flash | 1052 |

- CONFIRMED — result: colony **0** (openai/gpt-6-luna) wins by `sustained_territory`/`territory` at 21:50.5 (tick 13105); rules v27, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `DEFEND` by colony 0 at 8:48.5 on tile (85,58), count 6, caste `soldier`.
- CONFIRMED — first `ATTACK`: colony 0 at 11:56.5 on tile (94,41), 8 ants, caste `soldier`; ATTACK marks total colony 0 = 2, colony 1 = 3; largest single ATTACK = 80.
- CONFIRMED — brood calls: 7:23.0 c0→workers (q1), 13:52.6 c0→soldiers (q2), 14:10.9 c1→soldiers, 19:37.3 c0→workers (q3), 21:13.8 c1→mixed.
- CONFIRMED — extra queens founded: colony 0 = 3 ['6:06.6', '11:05.1', '19:02.9'], colony 1 = 0 [].
- CONFIRMED — queen damage: c0q2 first hit 12:31.5, min HP 21.25, survived; c1q0 first hit 18:56.6, min HP 30.50, survived.
- CONFIRMED — ants lost (deaths): colony 0 = 1012, colony 1 = 799; kills = the opposite colony's deaths; births 2297.

### 4. `2026-10-29T20-21-03-559Z-20786915167107` — Open Field 128×96, queens_killed at 20:20.5

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | deepseek/deepseek-flash (max) | antwars/deepseek-flash | 1573 |
| 1 | qwen-token-plan/qwen3.8-max (xhigh) | antwars/qwen3-8-max | 1431 |

- CONFIRMED — result: colony **1** (qwen-token-plan/qwen3.8-max) wins by `queens_killed`/`queens_killed` at 20:20.5 (tick 12205); rules v27, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `ATTACK` by colony 0 at 2:45.4 on tile (63,22), count 20, caste `any`.
- CONFIRMED — first `ATTACK`: colony 0 at 2:45.4 on tile (63,22), 20 ants, caste `any`; ATTACK marks total colony 0 = 14, colony 1 = 1; largest single ATTACK = 40.
- CONFIRMED — brood calls: 1:16.3 c0→workers, 4:40.9 c0→mixed, 5:06.0 c1→workers, 5:15.6 c0→soldiers, 12:23.2 c0→mixed, 12:34.4 c0→soldiers, 14:12.5 c0→workers, 16:03.7 c0→soldiers, 19:08.6 c0→workers.
- CONFIRMED — extra queens founded: colony 0 = 0 [], colony 1 = 1 ['6:57.6'].
- CONFIRMED — queen damage: c0q0 first hit 20:12.5, min HP 0.00, killed 20:20.5; c1q1 first hit 7:45.0, min HP 0.00, killed 7:47.3.
- CONFIRMED — ants lost (deaths): colony 0 = 854, colony 1 = 785; kills = the opposite colony's deaths; births 1969.

### 5. `2026-10-29T20-24-07-068Z-102378695639659` — Wide Plain 256×92, sustained_territory at 36:48.5

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | zai/glm-5.3 (max) | antwars/glm-5-3 | 1422 |
| 1 | anthropic/claude-opus-5-5 (low) | antwars/claude-opus-5-5-low | 1253 |

- CONFIRMED — result: colony **0** (zai/glm-5.3) wins by `sustained_territory`/`territory` at 36:48.5 (tick 22085); rules v27, cap 768 ants, match limit 2700 s.
- CONFIRMED — first mark of any verb: `DEFEND` by colony 1 at 11:23.9 on tile (164,24), count 30, caste `soldier`.
- CONFIRMED — first `ATTACK`: colony 0 at 14:12.9 on tile (162,20), 24 ants, caste `any`; ATTACK marks total colony 0 = 11, colony 1 = 3; largest single ATTACK = 200.
- CONFIRMED — brood calls: 0:31.2 c0→workers, 5:45.5 c0→workers (q1), 8:56.3 c0→workers (q2), 12:57.5 c0→soldiers (q3), 12:58.4 c0→soldiers (q0), 16:00.1 c0→soldiers (q4), 25:50.8 c0→soldiers (q5).
- CONFIRMED — extra queens founded: colony 0 = 5 ['5:42.0', '8:48.8', '12:54.2', '15:55.7', '25:46.3'], colony 1 = 4 ['5:25.5', '9:00.7', '15:54.9', '28:18.2'].
- CONFIRMED — queen damage: c0q5 first hit 25:57.9, min HP 39.90, survived; c1q0 first hit 31:02.8, min HP 0.00, killed 32:40.6; c1q1 first hit 19:31.3, min HP 0.00, killed 19:56.3; c1q2 first hit 13:25.2, min HP 0.00, killed 13:26.2.
- CONFIRMED — ants lost (deaths): colony 0 = 2431, colony 1 = 2664; kills = the opposite colony's deaths; births 5803.

### 6. `2026-10-29T20-57-42-371Z-96917028562274` — Wide Plain 256×92, queens_killed at 25:12.0

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | anthropic/claude-opus-5-5 (high) | antwars/claude-opus-5-5 | 1674 |
| 1 | anthropic/claude-opus-5-5 (max) | antwars/claude-opus-5-5-max | 1689 |

- CONFIRMED — result: colony **1** (anthropic/claude-opus-5-5) wins by `queens_killed`/`queens_killed` at 25:12.0 (tick 15120); rules v27, cap 768 ants, match limit 2700 s.
- CONFIRMED — first mark of any verb: `FORAGE` by colony 0 at 0:26.0 on tile (84,16), count 12, caste `any`.
- CONFIRMED — first `ATTACK`: colony 0 at 7:18.9 on tile (106,40), 40 ants, caste `soldier`; ATTACK marks total colony 0 = 9, colony 1 = 9; largest single ATTACK = 300.
- CONFIRMED — brood calls: 0:14.7 c0→workers, 2:04.9 c1→workers, 2:11.0 c0→mixed, 4:21.2 c0→soldiers, 4:56.5 c1→soldiers, 6:13.8 c1→soldiers (q1), 9:26.0 c1→soldiers (q2), 11:03.6 c0→soldiers (q2), 11:57.7 c1→workers (q0), 11:58.3 c1→mixed (q2), 12:27.0 c1→workers (q1), 12:27.6 c1→workers (q2), 13:33.6 c0→soldiers (q1), 13:37.3 c1→soldiers (q1), 14:01.6 c1→mixed (q0), 14:02.2 c1→soldiers (q2), 17:11.1 c0→workers (q1), 18:35.0 c1→workers (q0), 18:35.6 c1→mixed (q2), 18:42.6 c0→workers (q0), 19:11.1 c1→workers (q1), 19:11.7 c1→workers (q2), 20:13.4 c0→mixed (q0), 21:13.6 c0→soldiers (q0), 21:34.2 c1→soldiers (q0), 21:34.8 c1→soldiers (q1), 21:35.4 c1→soldiers (q2), 23:09.4 c0→mixed (q1), 24:47.9 c0→workers (q1).
- CONFIRMED — extra queens founded: colony 0 = 2 ['5:10.2', '8:13.2'], colony 1 = 2 ['6:07.9', '9:25.4'].
- CONFIRMED — queen damage: c0q0 first hit 18:16.8, min HP 0.00, killed 22:28.6; c0q1 first hit 25:09.8, min HP 0.00, killed 25:12.0; c0q2 first hit 17:41.1, min HP 0.00, killed 17:49.0.
- CONFIRMED — ants lost (deaths): colony 0 = 2024, colony 1 = 1492; kills = the opposite colony's deaths; births 4229.

### 7. `2026-10-29T23-25-17-050Z-131029110203097` — Twin Shields 128×96, time_up at 29:59.9

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | anthropic/claude-haiku-5-5 (max) | antwars/claude-haiku-5-5 | 1189 |
| 1 | openai/gpt-6-luna (max) | antwars/gpt-6-luna | 1104 |

- CONFIRMED — result: colony **1** (openai/gpt-6-luna) wins by `time_up`/`kills` at 29:59.9 (tick 17999); rules v27, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `DEFEND` by colony 0 at 1:35.5 on tile (34,38), count 7, caste `soldier`.
- CONFIRMED — first `ATTACK`: colony 1 at 7:03.7 on tile (66,36), 6 ants, caste `soldier`; ATTACK marks total colony 0 = 12, colony 1 = 1; largest single ATTACK = 100.
- CONFIRMED — brood calls: 0:22.2 c0→workers, 1:34.9 c0→soldiers, 5:46.8 c0→soldiers (q1), 14:03.4 c1→soldiers (q0), 18:27.0 c1→soldiers (q2), 23:54.6 c0→workers (q0), 23:55.1 c0→workers (q1), 26:19.4 c1→workers (q2).
- CONFIRMED — extra queens founded: colony 0 = 1 ['5:41.3'], colony 1 = 2 ['5:35.8', '17:27.3'].
- CONFIRMED — queen damage: c0q1 first hit 29:41.1, min HP 0.00, killed 29:45.6; c1q1 first hit 7:38.5, min HP 0.00, killed 13:00.8.
- CONFIRMED — ants lost (deaths): colony 0 = 1296, colony 1 = 1182; kills = the opposite colony's deaths; births 2930.

### 8. `2026-10-29T23-32-59-721Z-262549377526526` — Isthmus 128×96, queens_killed at 13:42.0

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | anthropic/claude-opus-5-5 (xhigh) | antwars/claude-opus-5-5-xhigh | 1893 |
| 1 | anthropic/claude-opus-5-5 (high) | antwars/claude-opus-5-5 | 1642 |

- CONFIRMED — result: colony **1** (anthropic/claude-opus-5-5) wins by `queens_killed`/`queens_killed` at 13:42.0 (tick 8220); rules v27, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `LINE` by colony 0 at 1:45.9 on tile (62,40), count 12, caste `any`.
- CONFIRMED — first `ATTACK`: colony 0 at 2:08.8 on tile (67,47), 15 ants, caste `any`; ATTACK marks total colony 0 = 2, colony 1 = 9; largest single ATTACK = 80.
- CONFIRMED — brood calls: 0:04.1 c1→workers, 0:08.2 c0→workers, 2:05.7 c1→soldiers, 3:06.4 c0→mixed, 5:07.5 c1→workers (q1), 5:08.2 c0→soldiers (q1), 5:52.3 c0→soldiers (q0), 6:54.1 c0→workers (q0), 8:07.1 c1→workers (q2), 9:06.3 c1→mixed (q2), 9:59.0 c0→soldiers (q0), 10:28.6 c0→workers (q2), 11:04.1 c0→workers (q0).
- CONFIRMED — extra queens founded: colony 0 = 2 ['5:04.0', '10:23.5'], colony 1 = 2 ['5:00.7', '8:02.3'].
- CONFIRMED — queen damage: c0q0 first hit 11:31.2, min HP 0.00, killed 11:46.1; c0q1 first hit 9:58.0, min HP 0.00, killed 10:03.6; c0q2 first hit 13:36.8, min HP 0.00, killed 13:42.0.
- CONFIRMED — ants lost (deaths): colony 0 = 787, colony 1 = 570; kills = the opposite colony's deaths; births 1809.

### 9. `2026-10-29T23-42-14-206Z-37818742592862` — Three Crossings v2 128×96, queens_killed at 21:22.9

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | kimi-coding/k3.1-pro (max) | antwars/k3-1-pro | 1457 |
| 1 | qwen-token-plan/qwen3.8-max (xhigh) | antwars/qwen3-8-max | 1475 |

- CONFIRMED — result: colony **0** (kimi-coding/k3.1-pro) wins by `queens_killed`/`queens_killed` at 21:22.9 (tick 12829); rules v27, cap 512 ants, match limit 1800 s.
- CONFIRMED — first mark of any verb: `ATTACK` by colony 0 at 6:37.0 on tile (77,57), count 20, caste `soldier`.
- CONFIRMED — first `ATTACK`: colony 0 at 6:37.0 on tile (77,57), 20 ants, caste `soldier`; ATTACK marks total colony 0 = 5, colony 1 = 1; largest single ATTACK = 120.
- CONFIRMED — brood calls: 1:46.0 c0→workers, 4:59.7 c0→mixed, 12:33.2 c0→soldiers (q3), 15:13.3 c0→mixed (q3).
- CONFIRMED — extra queens founded: colony 0 = 5 ['5:11.1', '9:10.9', '12:13.3', '15:22.0', '20:30.1'], colony 1 = 0 [].
- CONFIRMED — queen damage: c1q0 first hit 21:18.9, min HP 0.00, killed 21:22.9.
- CONFIRMED — ants lost (deaths): colony 0 = 777, colony 1 = 884; kills = the opposite colony's deaths; births 2114.

### 10. `2026-10-30T00-14-00-777Z-107151765625491` — Four Lanes 128×128, queens_killed at 10:53.5

| colony | model (thinking) | Benchmark handle | rating before |
|---|---|---|---|
| 0 | antigravity/gemini-4-argon (high) | antwars/gemini-4-argon | 1534 |
| 1 | qwen-token-plan/qwen3.8-max (xhigh) | antwars/qwen3-8-max | 1444 |

- CONFIRMED — result: colony **0** (antigravity/gemini-4-argon) wins by `queens_killed`/`queens_killed` at 10:53.5 (tick 6535); rules v27, cap 768 ants, match limit 2700 s.
- CONFIRMED — first mark of any verb: `FORAGE` by colony 0 at 4:08.5 on tile (48,86), count 25, caste `any`.
- CONFIRMED — first `ATTACK`: colony 0 at 6:31.7 on tile (74,42), 35 ants, caste `soldier`; ATTACK marks total colony 0 = 3, colony 1 = 0; largest single ATTACK = 80.
- CONFIRMED — brood calls: 0:28.9 c0→workers, 2:28.9 c0→mixed, 5:55.2 c0→soldiers (q1), 5:57.5 c0→soldiers (q0), 7:00.6 c0→mixed (q0), 9:50.7 c0→soldiers (q2), 9:53.5 c0→soldiers (q0).
- CONFIRMED — extra queens founded: colony 0 = 2 ['5:31.2', '9:22.2'], colony 1 = 0 [].
- CONFIRMED — queen damage: c1q0 first hit 10:48.4, min HP 0.00, killed 10:53.5.
- CONFIRMED — ants lost (deaths): colony 0 = 227, colony 1 = 466; kills = the opposite colony's deaths; births 1105.


---

## 4. Cross-match observations

- CONFIRMED — the winner placed the **first** `ATTACK` mark in 7 of 10 matches.
- CONFIRMED — the winner finished with **more kills** in 9 of 10; the exception is match 3, won on territory while losing the kill count 799–1012.
- CONFIRMED — the winner founded **at least as many** extra queens in 9 of 10 (more in 6, equal in 3, fewer in 1).
- CONFIRMED — in all 5 `queens_killed` matches the loser lost **every** queen it owned. In 3 of those 5 the loser had founded no extra queen at all; in the other 2 it had three queens and lost all three.
- CONFIRMED — 16 queens were killed across these matches. From first HP loss to death: median 6.45 s; 11/16 within 10 s; only 3 took longer than 60 s (97.8, 251.8, 322.3 s).
- CONFIRMED — every `sustained_territory` win ended exactly 300.0 s after its final qualifying run began (735.6→1035.5, 1010.6→1310.5, 1908.6→2208.5 s). Those matches needed 5, 2 and 13 separate runs respectively, the earlier ones being reset.
- CONFIRMED — both `time_up` matches were decided on kills, by 82 and 114 ants (3.4% and 8.8% of the winner's total).
- CONFIRMED — brood: 11 of the 13 colonies that issued `set_brood` opened with `workers`; the two exceptions (match 3 colony 1, match 7 colony 1) went straight to `soldiers`.

---

## 5. The three patterns that most often decided a win

### P1. Queen depth, and denying the enemy a place to found — decided 5/5 queen-kill games

- CONFIRMED: every `queens_killed` loser lost all of its queens; three of the five had **zero** extra queens, so one successful raid ended the game.
- CONFIRMED: the two losers that had founded extras (matches 6 and 8, three queens each) survived 25:12 and 13:42 respectively, but still lost every queen.
- CONFIRMED: match 10's loser tried `found_queen` at 8:34.1 and 9:58.5 and was refused `queen_tile_not_held`; match 9's loser was refused the same at 11:54.2. Both finished with one queen and died to a single burst.
- CONFIRMED: queen kills are bursts, not grinds — median 6.45 s from first damage to death, 11/16 within 10 s (queen HP 40; bite 4 HP per 2 s, so ~10 adjacent ants kill in ~2 s).
- INFERRED: the decisive skill is not the queen fight but *reaching* the queen: a push that strips the defender's held tiles (its `found_queen` attempts were refused `queen_tile_not_held`) and then puts 10+ ants next to the queen. Extra queens convert a lost raid into a lost 40 HP, not a lost game.

### P2. Trading discipline in the kill race — decided 2/2 time-up games, correlated 9/10

- CONFIRMED: both `time_up` matches were decided on kills, margins 82 and 114.
- CONFIRMED: match 7's winner issued **one** `ATTACK` mark of 6 ants against the loser's 12 `ATTACK` marks (up to 100 ants) and still won the kill race 1296–1182.
- CONFIRMED: match 2's winner escalated its `ATTACK` marks from 8 to 35 ants and out-killed 2461–2379 with 16 marks to 12.
- INFERRED: `ATTACK` into ground the defender is holding trades ants at a loss; `DEFEND`/`LINE` plus queen bites and free-ant local defence convert defence into kills. Spamming attacks loses the tiebreak that decides 2 of the 3 non-elimination endings.

### P3. Sustained presence, not a single push — decided 3/3 territory games

- CONFIRMED: each territory win completed exactly 300 s after the final qualifying run started, so the win came from *holding* the 6× ratio, not from reaching it.
- CONFIRMED: the runs were repeatedly broken first — 13 attempts in the 256×92 match between 19:36 and the final hold at 31:48.6, 5 in match 1, 2 in match 3.
- CONFIRMED: match 3 won territory with *fewer* kills (799 vs 1012) and 3 extra queens to 0; territory does not require winning fights, only presence.
- INFERRED: tiles decay after 20 s without a visit, so a territory win is a coverage problem — spread, re-visit, and keep queens alive to hold the ground — and raiding armies that leave home undefended hand the opponent the 6× ratio.

---

## Appendix — reproduction

```bash
curl -s https://antwars.ai/matches                      # newest 20 finished matches
curl -s "https://antwars.ai/matches?pageToken=<token>"  # next page
curl -s https://antwars.ai/matches/<id> -o match.json   # full match log
```

Parsing notes that cost me time, recorded so they are not repeated:

- `mark` events repeat every tick while a mark is recruiting; dedupe on `mark.id` and take the first `laidTick`.
- `queenHp` is emitted only when HP changes, in thousandths (`40000` = 40 HP).
- `result.winner` is a **colony**, while `seats[].seat` and `mark.agent` are **seats**; the two are not aligned in every match.
- `territoryWin` with `progress: null` is a reset, not a win; the winning run is the last non-null `progress` and ends at `startTick + 3000`.

## Moved from `antwars-run.md` section 1 (2026-11-09, preflight trim)

- The server-verified November 4 report in `study/match-loss-2026-11-04.md` identifies public lobby `3fa2c6fe-85b6-40c2-a19b-64eb9a67ce8c`: `omp-dolphin` vs `antwars/gpt-6-1-terra-max-fast` on Wide Plain (256 × 92), ending at tick 18,058 (about 30:06) with a sustained-territory loss. The report records territory falling from 90‰ to 13‰, workers reaching zero, 48 soldiers remaining, 4,451 food stored, two additional queens founded and subsequently lost, mark expiry and rejected rate-limited calls.
- An earlier note in this command file records a November 4 queen-elimination run against the same handle at tick 4,448 (about 7 minutes), but gives no lobby or request ID. It may be a separate run; do not merge it with the identified lobby above. The earlier run's causal notes (worker-only brood for about 371 seconds, exposed nest, out-of-reach marks, unused food and no second queen) are UNVERIFIED for the identified tick-18,058 match. Its allowance counts are historical snapshots, not current availability.
