# Engine notes — live rules vs source (2026-11-09)

Read-only study: no agent behaviour, prompt or run procedure is changed here. Every source path is in
`C:\Projects\antwars-source`, a clone of `github.com/Zobristai/antwars` at `a80bde5` ("Run production
deploys in Cloud Build as the deploy service account (#3)"). Labels: **VERIFIED** = read in the named
file and line, or observed in the named run; **UNVERIFIED** = inference not confirmed by source or a run.

## 0. Environment and setup

- `node -v` → **v22.23.4** (npm 12.2.1). The repo requires Node 24: `"engines": { "node": ">=24 <25" }`
  (`package.json:21-23`). The source nevertheless boots and plays on 22.23.4: `npm start` runs
  `node --import ./src/ts-resolve.mjs src/main.ts` (`package.json:5`), and `src/ts-resolve.mjs:1-3`
  relies on `registerHooks` plus Node's TypeScript type stripping, both present in 22.23.4.
  `npm install --omit=dev --ignore-scripts` prints `npm warn EBADENGINE` and succeeds (167 packages).
  **VERIFIED** by running it.
- Local comparison server, run for this study:
  `PORT=18080 DATA_DIR=<temp> ANTWAR_RULES=redesign ANTWAR_PLAYERS=2 npm start`
  → `antwar comparison run: rules redesign, 2 players, seed 6006`, listening on `/mcp`.
  **VERIFIED** (process output).
- Live rules: one `rules` call on the mounted Antwars MCP (`https://antwars.ai/mcp`), 18,932 characters.
  Live briefing numbers were also compared against the *resolved* config written in a local redesign
  match's log header (`match-2026-11-09T08-48-33-428Z-1.jsonl`), which is the post-`withGridScale`
  config the simulation actually plays.

Unit convention: the sim plays at **grid scale 2** — every match. Length constants are written in
*reference* tiles and multiplied by 2 by `withGridScale` (`src/sim/gridScale.ts:66-121`); the tiles in
`observe` (128×96, 128×128, 256×92) are *fine* tiles. Counts (food, HP, ticks, counts) are never scaled
(`gridScale.ts:61-65`).

| Quantity | Live `rules` text | Resolved config | Source constant |
|---|---|---|---|
| Sight | 12 tiles | `sightTiles: 12` | `config.ts:489` × `gridScale.ts:75` |
| found_queen spacing | 32 tiles | `minDistanceTiles: 32` | `config.ts:63` × `gridScale.ts:89` |
| Queen regen radius | 6 tiles | `regenClearTiles: 6` | `config.ts:453` × `gridScale.ts:102` |
| Queen-defence radius | 6 tiles | `localAnts.defendTiles: 6` | `config.ts:440` × `gridScale.ts:96` |
| Patrol link | 12 tiles | `patrolLinkTiles: 12` | `config.ts:584` × `gridScale.ts:78` |
| Soft radius / soldier radius | 200 / 1600 subunits | 200 / 1600 | `config.ts:578` × `gridScale.ts:111-121` |

## 1. Audit items

### a. Time-up adjudication is kills-first — **VERIFIED**

`decideTimeUp` compares enemy deaths first when `config.adjudication === "kills-first"`
(`src/sim/territory.ts:114-120`), then territory, ants alive, delivered food, draw
(`territory.ts:121-127`). `compare([deaths[1], deaths[0]])` returns colony 0 when colony 1's deaths are
higher, i.e. "we killed more wins". Every new match carries the marker: `PUBLIC_CONFIG` sets
`adjudication: "kills-first"` (`config.ts:561`) and `rulesConfig` spreads it into `redesign`
(`config.ts:577-586`). The same order decides a double queen loss on one tick (`territory.ts:212,224`).

- Kills are **ant deaths only** (`state.stats.deaths`); there is exactly one death site,
  `combat.ts:120-141`, and queen bites land through the same damage map (`combat.ts:183`), so ants killed
  by a queen count. Queens themselves are not "kills".
- Kills tie → territory. A 0-0 kill tie is common early; the live text's "kills>territory>ants alive>
  food delivered>draw" matches exactly.
- Ordering nuance the live text omits: the **sustained-territory check runs before time-up**
  (`step.ts:367-369`), so a hold that completes on the final tick reports `sustained_territory`, not
  `time_up`. Queen elimination is resolved before both (`step.ts:367`).

### b. Queen shield, HP, and ant-vs-queen gating — **VERIFIED**

- 40 HP is `hp: 40_000` milli-HP (`config.ts:448`); `view.queens[].hp/maxHp` are milli-HP.
- Shield: ant damage to a queen requires `tick >= queenHp.shieldTicks` = 3000 ticks = **300 s**
  (`combat.ts:97-102`, `config.ts:454`). The *queen's own* bite starts at the combat grace, 60 s
  (`combat.ts:67`, `config.ts` `combatGraceTicks: 600`), for 4 HP every 2 s (`combat.ts:175-187`).
- Gate: an ant damages a queen **only when `pickTarget` found no enemy ant in reach**
  (`combat.ts:95-102`). Reach is Chebyshev 2 fine tiles = one original tile (`combat.ts:28,154-155`).
  Carriers are skipped entirely before this (`combat.ts:88-91`), so a carrying worker never bites a queen.
- No territory bonus applies to queen damage: the hit is `worker` or `soldier` (`combat.ts:101`),
  i.e. 1 HP/s or 1.5 HP/s. The live text's "normal damage" understates a soldier by 50 %.
- Regen: 1 HP per 100 ticks (10 s) while no enemy is within 6 fine tiles, capped at 40 HP
  (`combat.ts:188-197`, radius `config.ts:453` × `gridScale.ts:102`).

### c. found_queen — **VERIFIED**, with a unit trap

- First allowed: `firstFoundTick: 3000` ticks = **300 s** (`config.ts:63`); `nextQueenFoundingTick` is
  `max(firstFoundTick, lastFounded + cooldown)` (`map.ts:683-685`), and the initial
  `lastQueenFoundedTick = -cooldown` (`map.ts:208`) puts the first opportunity at tick 3000.
- Cooldown: `cooldownTicks: 1800` = **180 s** (`config.ts:63`).
- Spacing: `minDistanceTiles: 16` in `config.ts:63` is **16 reference tiles = 32 fine tiles**. The live
  rules say 32 because it reports the resolved config; `gridScale.ts:88-90` does the doubling. A prompt
  that says "16 tiles" in `observe` coordinates is wrong; "32 tiles" (what `prompt.md` already says) is right.
- Cost curve, `queenFoundingCost` (`map.ts:672-681`), `costBasis: "founded-live"`:

  ```
  price = 400 * 2^k     k = live queens founded by the colony (starting queens excluded)
  ```

  400 → 800 → 1600 → 3200. Because `k` counts *live* founded queens, the price **falls back** when a
  founded queen dies — the live text's "per additional living founded queen" is exact.
- Both colonies' standing nests block a site (`agents.ts:824-830`), lost queens do not
  (`queenSpacingNests`, `map.ts:688-690`). Refusal order: water/rock, then `queen_tile_not_held`,
  `queen_too_early`, `queen_limit`, `queen_cooldown`, `queen_too_close`, `queen_food`
  (`agents.ts:843-866`). A seated agent has **no food reserve**; `houseReserveFood: 200` applies only to
  house colonies (`houseBot.ts:744-745,753`).

### d. Sustained-territory win — **VERIFIED**

`EARLY_WIN_RULES` (`config.ts:444-446`): `minTick: 6000` (600 s), `holdTicks: 3000` (300 s),
`territoryRatioPermille: 6000` (6×), `minHeldTiles: 100`. `sustainedTerritoryWin`
(`territory.ts:131-145`) requires, on the same tick: tick ≥ 6000, a strict leader, the leader's held area
≥ 100, and `held * 1000 >= max(1, opponent) * 6000`. The `max(1, …)` is the live text's "a zero-territory
opponent counts as one original-size tile area". `territoryCounts` divides fine cells by 4
(`territory.ts:95-100`, `physicalTileArea`, `gridScale.ts:35-37`), so 100 means **original-size tile
areas**, not fine tiles. Ties, an insufficient ratio, or a change of leader reset the clock
(`territory.ts:138-143`).

### e. Worker vs soldier cost-efficiency — **VERIFIED**

Numbers: worker 3 food, 4 HP, 1 HP/s, 1 hatch interval (`config.ts:486,492`, `forage.ts:226-230`);
soldier 6 food, 8 HP (2× HP permille), 1.5 HP/s, 2 hatch intervals, no carrying
(`config.ts:526-530`, `config.ts:40`). Defender bonus 1.25× on own territory (`config.ts:494`,
`combat.ts:74-76,110`). Every death leaves 1 food (`config.ts:488`, `combat.ts:131`).

| Per 6 food | HP | Damage/s | Damage/s on own ground | Cap slots | Food dropped on death |
|---|---|---|---|---|---|
| 1 soldier | 8 | 1.5 | 1.875 | 1 | 1 |
| 2 workers | 8 | 2.0 | 2.5 | 2 | 2 |

So workers dominate per food in raw HP and damage, and they can carry food; a soldier's real advantages
are 2× HP per **cap slot**, concentrated HP (one death instead of two for the same HP), and no economic
distraction. Food per hatch interval is identical (3 food/s per queen either way), so soldier brood is a
cap/concentration choice, not a throughput choice. **VERIFIED** from the constants; the cap-slot and
death-food framing is direct arithmetic (**INFERRED** as strategy).

`pickTarget` (`combat.ts:26-58`) hits the **lowest-HP enemy, then lowest id**, per tile of ants; damage
is simultaneous and the dead are removed after all hits (`combat.ts:120-142`). Carriers never bite
(`combat.ts:87-91`) and keep delivering under any order or mark (`agents.ts:779-790,909`;
`houseBot.ts:616`).

### f. What free ants do without orders — **VERIFIED**

For a **seated** colony under the redesign config, every free ant runs `localDirection`
(`houseBot.ts:610-693`) via `housePhase` (`step.ts:52-61`). The ladder, in order:

1. **Carrying** → walk to the nearest live friendly queen; no combat, ever (`houseBot.ts:616`,
   `combat.ts:88-91`).
2. **Enemy ant in combat reach** (2 fine tiles, diagonals) → stand and bite (`houseBot.ts:617`).
3. **Adjacent enemy queen** (same reach, after the 300 s shield) → stand and bite (`houseBot.ts:618`;
   `localArrival.ts:114-122`). Queens are not pursued from range.
4. **Within `defendTiles` (6 view tiles) of the nearest live own queen, and an enemy within that radius
   of her** → chase that enemy (`houseBot.ts:639-649`).
5. **Soldier**: if an enemy is in its own 12-tile sight, push when local friends × 1000 ≥ enemies × 600,
   else fall back toward the nearest live queen (`houseBot.ts:519-528,650-656`); otherwise hold within
   6 view tiles of its **hold point** (`houseBot.ts:611-615,657-658`, `holdPointDirection`
   `houseBot.ts:591-603`).
6. **Worker**: no colony-seen food → walk outward from the nest until food is seen; otherwise forage the
   nearest colony-seen food and deliver (`houseBot.ts:672-692`).

The hold point is fixed at the first local plan (hatch tile), or at the spawn tile on arrival of a spawn
walk (`spawnWalk.ts:31-38`; soldier arrival radius 3 reference tiles = 6 view tiles,
`spawnWalk.ts:15`). A released count-mark soldier re-takes its current tile (`marks.ts:123-131`).

`localSoldierAssignments` (`houseBot.ts:315-395`) returns **empty sets for a seated colony**
(`houseBot.ts:320-323`): no front share, no patch detail, no worker home guard, no queen-threat recall.
So `BALANCED_LOCAL_ANT_RULES`' `soldierFrontSharePermille`, `soldierPatchSharePermille`,
`workerHomeGuard*`, `workerQueenThreatTiles`, `workerQueenRecallCount` and
`workerPatchDispatchSharePermille` (`config.ts:441-443`) are **inert for us**; only `defendTiles`
(6) and the `pushRatioPermille` 600 check act. The live text's free-ant paragraph matches this exactly.

`localRulesSide` is true while at least one agent of the colony is not idle (`marks.ts:113-114`). On a
live server a seat never lapses into command-idle takeover: every server tick passes `houseActive = true`
(`game.ts:972`, documented as "live seats never lapse into command-idle takeover", `step.ts:204-205`),
which skips both `lapseSquads` calls (`step.ts:265,278`). Squads and marks therefore persist until they
expire or are replaced.

## 2. Live rules vs source: mismatches

| # | Live `rules` text | Source | Impact |
|---|---|---|---|
| 1 | "Minimum Euclidean distance: 32 tiles" | `minDistanceTiles: 16` reference tiles × grid scale 2 (`config.ts:63`, `gridScale.ts:89`) | Not a behavioural mismatch; a **unit trap**. 16 is correct only in reference tiles. Any note that says "16 tiles" next to `observe` coordinates is wrong. |
| 2 | Ants do "normal damage" to an adjacent queen | worker 1 HP/s, soldier 1.5 HP/s, no bonus (`combat.ts:101`) | Minor: the live wording understates a soldier hit. |
| 3 | "Early win: from 600 s … wins immediately"; time-up described separately | sustained check precedes time-up (`step.ts:367-369`) | Unstated precedence; a hold completing on the last tick reports `sustained_territory`, not `time_up`. No rule conflict. |
| 4 | "no bot takeover" (300 s idle rule) | command-idle takeover code exists but is disabled on every server tick (`step.ts:204-205,265`; `game.ts:972`) | Consistent. Worth knowing that `commandIdleTicks: 1800` (`config.ts:586`) is a display/simulation-policy field, not a live takeover. |

No other mismatch found. The live text's soft-separation, point-arrival, sight, patrol, count-mark,
queen-HP, founding and territory numbers all equal the resolved config in the local match log header
(post-grid-scale). Live-vs-source drift on this commit is limited to wording/units, not rules.

## 3. `packages/antwars-seat` vs our harness

Our harness is agent-driven: one OMP command (`.omp/commands/antwars-run.md`) playing one identity over
the mounted entry `https://antwars.ai/mcp` (`.omp/mcp.json`), with strategy in `prompt.md`. It has no
process, no shared session and no scripted call layer. Concrete gaps worth adopting — not a rewrite:

1. **A detached idle observer.** The seat runs `observer start`: one `observe` every 60 s, retried after
   10 s, re-joins a lost session, stops on `matchOver`
   (`packages/antwars-seat/lib/observer.mjs:10-30,25-61`). Our only defence is the agent's own cadence,
   and the 2026-11-09 run lost on `idle` at tick 4,710 (`study/last-match.md:1,12,45-46`). This is the
   highest-value gap. Catch: the observer attaches to the seat's own `state/match.json` session, so it
   protects a seat joined *through the seat*, not an OMP session joined through the mounted tools.
2. **Idempotent calls and pacing.** The seat spaces calls 600 ms apart, retries `call_rate`/`not_applied`
   after `retryAfterMs`, re-initialises on HTTP 404, and sends one `_meta["antwars/callId"]` per command
   so a retried send cannot apply twice (`lib/mcp.mjs:2-8,159-190,258-275`). Our run procedure retries a
   failed call up to 3 times and compensates only for `found_queen` by observing first
   (`.omp/commands/antwars-run.md` §4.2). Adoptable only with a real MCP client: the mounted tool
   interface cannot set `_meta`.
3. **A decoded board.** `antwars-seat board` prints one `observe` reply as rows of food/queen/ant glyphs
   and territory ranges (`README` "Reading the map"; `lib/board.mjs`), ~5.5 KB typical on 128×96. Our
   procedure tells the model to decode `kind = k % 6` itself every observation. Adoptable as an output
   form for a client, not as a prompt change; the 11/08 `nest_food` pick came from exactly this kind of
   hand-decoding (`prompt.md` line 31).
4. **A token-free wait with a lock.** `go`/`join-lobby` poll queue/lobby state outside the model and stop
   in the nest window, with one run per seat (`lib/cli.mjs:36,160,230-242`; `go.lock`). Our procedure
   polls `challenge_status` inside the model every 15 s (`.omp/commands/antwars-run.md` §3A). The seat
   explicitly does not cover challenges, so what is adoptable is the *pattern* (background wait that
   wakes the agent), not the command.

Not a gap: nest picking. The seat deliberately stops before `pick_nest`; our procedure already picks
with one retry.

## 4. Can the local server run an A/B between two prompt versions?

**Yes at the engine level; no with the current harness.**

VERIFIED:

- `ANTWAR_RULES` + `ANTWAR_PLAYERS` select a held comparison match with a **fixed seed 6006**,
  `maxAgentsPerMatch = players`, and stdout tick logs (`src/server.ts:658-684`); the match starts after
  the second accepted join (`src/server/modes.ts:135-190`).
- Booted it and joined two sessions. With no key (the root join schema has no `key` field,
  `src/mcp/tools.ts:618-630`): A got `colony: Very Large Colony`, B `Lake Hodges Colony`; `observe`
  advanced from tick 21 to tick 47; `rules` and `observe` both worked. Board 128×96, redesign config,
  any accepted call every <300 s keeps both seats inside the idle limit (`game.ts:963-965`).
- The match is real-time only: 10 ticks/s and `matchTicks: 18000` in the resolved config — a 30-minute
  run per A/B, with no tick-rate environment variable in `main.ts`, `server.ts` or `mcp/config.ts`.
- The seat CLI cannot drive it: it always sends `key` (and `seat`) in `join`
  (`packages/antwars-seat/lib/match.mjs:17-18`), which the root join schema refuses as an unknown field.

What stops an A/B today, concretely:

1. Our harness is a single agent with one prompt and one run procedure; there is no second seat, no
   per-arm client, and no way to give two prompt versions their own MCP sessions from the mounted tools.
2. `.omp/mcp.json` mounts only `https://antwars.ai/mcp`; the local `http://127.0.0.1:<port>/mcp` is not
   mounted, and the run procedure forbids helper scripts/local mock servers.
3. No automated result capture or comparison; the only output is the local match log (stdout and
   `DATA_DIR/*.jsonl`). Both arms must also keep calling or the 300 s idle rule ends the match.

So the missing piece is harness plumbing (two clients, a local MCP mount, result diffing), not the server.

## 5. Sources used

- Live MCP `rules` (18,932 chars, 2026-11-09) and live `observe`/`join` replies on the local server.
- `C:\Projects\antwars-source` @ `a80bde5`: `src/sim/{config,combat,territory,map,gridScale,step,agents,
  marks,houseBot,localArrival,spawnWalk,forage,mapShapes}.ts`; `src/mcp/{game,tools,briefing,config}.ts`;
  `src/server.ts`, `src/server/modes.ts`; `src/main.ts`, `src/ts-resolve.mjs`;
  `packages/antwars-seat/{README.md,lib/mcp.mjs,lib/cli.mjs,lib/observer.mjs,lib/match.mjs}`.
- `C:\Projects\antwars-agent`: `prompt.md`, `.omp/commands/antwars-run.md`, `.omp/mcp.json`,
  `study/last-match.md`.
- Local redesign match log header `match-2026-11-09T08-48-33-428Z-1.jsonl` (resolved config).
- Not verified: ratings, lobby/queue behaviour, house-bot strategy beyond `houseFounding`, and any live
  behaviour that depends on the deployed build differing from this commit.

## 6. Proposed `prompt.md` changes (ranked, max 5)

1. **State that unmarked soldiers do not advance.** Add to "Soldier surge": a free soldier holds within
   6 tiles of where it became free (its hatch tile, or its queen's spawn point once it walks there) and
   only moves to fight enemies in its own 12-tile sight when local friends ≥ 0.6× enemies (or to chase one
   within 6 tiles of an own queen); it never pursues a queen. Count unmarked soldiers as home garrison, and place soldiers forward only with
   `SPAWN` + marks. Evidence: `houseBot.ts:611-615,650-658,519-528`; `spawnWalk.ts:31-38`; live text
   "free soldiers … hold within 6 tiles of where they became free". **VERIFIED.**
2. **Make the queen-damage gate explicit in "Queen hunt".** An ant damages a queen only when **no enemy
   ant is within 2 tiles of it** (and it is not carrying); a strike that reaches the queen while her
   guards are adjacent does zero queen damage. Kill the ants inside 2 tiles first, or the raid is wasted.
   Evidence: `combat.ts:88-102`; live "Non-carrying ant with no enemy ant in reach". **VERIFIED.**
3. **Do not count foragers as a screen.** Add one line where worker losses are judged: carriers never
   bite ants or queens and walk past enemies to deliver, so a lane full of foragers contributes no
   damage; only non-carriers defend. Evidence: `combat.ts:87-91`, `houseBot.ts:616`,
   `agents.ts:779-790,909`. **VERIFIED.**
4. **Re-frame the 40–50 % soldier target as a cap/concentration choice, not a damage choice.** Per 6
   food, 2 workers have the same HP, more damage/s (2.0 vs 1.5; 2.5 vs 1.875 on own ground) and can
   carry; a soldier wins 2× HP per cap slot and drops 1 food per 8 HP instead of 2. Keep soldier brood
   for the cap, for staying power, and for a planned kill race — not for food-efficiency. Evidence:
   `config.ts:486,492,494,526-530`; `forage.ts:226-230`; `combat.ts:71-76,131`. **VERIFIED** constants,
   **INFERRED** as guidance.
5. **Add the unit rule next to the founding rule.** Say "32 view tiles = 16 reference tiles × grid scale
   2", and that the other geometry (sight 12, defend 6, patrol 12) is already in view tiles. Keeps a
   future edit from writing "16" beside `observe` coordinates. Evidence: `config.ts:63`,
   `gridScale.ts:88-90`, live "32 tiles". **VERIFIED.**
