# Antwars — next-match strategy (v3, experimental)

`prompt.md` contains strategic guidance only; `antwars-run.md` defines run procedure, authorization and stopping rules. Live rules and the live match briefing override anything here.

Labels: VERIFIED = server or run-log evidence in our reports; CONFIRMED = read from a match-log field in `study/maps.md` (269 finished 1v1 matches, 2026-10-25 to 2026-11-05) with the sample size; INFERRED / UNVERIFIED = interpretation or experiment. Numbers are reference targets, not rules.

## Evidence from our matches

- **Our record against house bots in the public feed (CONFIRMED, 5 seats, all as colony 1): 2 wins, 3 losses.**
  - Lost Three Crossings v2 by `queens_killed` at tick 4,448 (about 7:24): the enemy laid a 100-soldier ATTACK mark at tick 2,297 (about 3:50). The feed shows no extra queen founded and no `found_queen` attempt by us.
  - Lost Wide Plain by `sustained_territory` at tick 18,058: our extra queens came at 9:01 and 12:02; the enemy's first ATTACK (70 soldiers) came at about 7:08. Worker brood was switched off at about 1481 s; workers reached 0 with 4,451 food unspent.
  - Lost Central Lake v2 at the time limit (`time_up`): our only extra queen came at tick 7,031 (about 11:43).
  - Won Four Lanes (`queens_killed`, tick 10,126): extras at 5:23 and 9:58, soldiers stepped west along one lane, one queen held worker brood to the end.
  - Won Central Lake v2 (`sustained_territory`, tick 16,532): extras at 7:46 and 11:27; near the 512 cap by about 20:01 with 10,543 food unspent; the match then ran 7+ more minutes.
  - Pattern (small sample): all three losses had no extra queen or a late one; both wins had two. A single queen dies in seconds once reached.
- **Opponent caveat:** the site owner reportedly weakened Opus 5.5 before ranked play (told to the project owner; not server-verified). Wins over it are weak evidence against full-strength models.
- **Archive (CONFIRMED, n=269):** a first ATTACK before 4:00 occurred in 121 matches; the side that attacked first won 66 of them, so early aggression is roughly a coin flip. Queens die close to home (median 0–4 tiles from their own start box) and fast (median 4–8 s from first damage; 55–66% within 10 s). The first extra queen lands at a median of about 5:15 on every map; the second at about 9:07. Territory wins end exactly 300 s after the final qualifying run began.

## Core idea: build, then strike

The economy exists to fund an army that ends the match. Do not keep adding workers once income and population are strong, and do not sit in defence waiting for the territory clock. Two win paths, one army: (a) strip enemy-held ground and reach the queens, (b) hold the 6× territory ratio for 300 s.

## Opening and the queen clock

- Make ONE `pick_nest` attempt, set worker brood, FORAGE a large share of free ants on the nearest reachable food (as in `antwars-run.md`).
- Extra queens (rules identical in all versions seen, CONFIRMED): earliest at tick 3,000 (5:00); cost 400 food, doubling per live extra (400, 800, 1,600); 180 s cooldown; the tile must be held by us and at least 32 tiles from every standing nest, ours or the enemy's.
- Refusals seen most: `queen_tile_not_held` (308 of 520), then `queen_too_close` (133). Prepare before 5:00: from about 4:00 choose a tile in our own half at least 34 tiles from our home queen (margin; the exact metric is not stated), keep ants on it (held tiles decay after 20 s unvisited), and keep 400 food unspent. Try at tick 3,000–3,300.
- If refused, read the code and fix the cause once: not held means put ants on that tile and retry; too close means move farther away. Do not repeat an unchanged request.
- Targets: first extra at 5:00–5:30; second at 8:00–9:00 (cooldown makes 8:00 the earliest; archive median 9:07); a third (1,600 food) only when food is piling up. Being a single-queen colony past about 6:00 was the common thread in our losses.
- Placement (UNVERIFIED): our own half, away from the enemy approach lane, not forward or central.

## Early rush guard (experimental)

The Three Crossings v2 loss shows one 100-soldier mark at 3:50 can end a one-queen game by 7:24. In the archive a first ATTACK before 3:00 happened in dozens of matches.

- Start mixed or soldier brood by about 3:30 so a guard of roughly 15–25 soldiers (UNVERIFIED sizing) is near the home queen by 4:00, held with a DEFEND mark that is refreshed before its 180 s lifetime ends. Return to worker-first brood after the second queen is up.
- If any enemy ant is seen near the nest earlier, switch to mixed or soldier brood at once.
- Treat any queen HP loss as urgent. A second queen turns a lost raid into a lost 40 HP, not a lost game.

## Command budget

The live limit is one command per 10 s, and marks last 180 s (CONFIRMED in `rules.config`; 624 `rate_limited` refusals in the archive). That is about 18 commands per mark lifetime, shared by brood, founding, FORAGE, DEFEND and ATTACK marks. Spend them in this order: queen safety, founding, brood, refreshing the marks that matter, then everything else. Do not retry a refused command unchanged. Check the live rules for whether `observe` shares the limit.

## Economy-to-army conversion

Default queen roles: queen 0 workers; queen 1 soldiers from founding; queen 2 workers early, soldiers once the trigger is met.

**Army-readiness trigger (alert, not an automatic rule):** act when at least two hold: population is about 75% of the live cap or more; stored food is rising and unspent; two or more queens alive; no enemy territory run in progress. (Our own `observe` output gives these; the archive logs do not carry them.)

When triggered:

- Move every queen except one to soldiers. The remaining queen stays on workers or mixed so income and replacements continue. Never switch all queens to soldiers-only (the Wide Plain loss).
- At or near the cap, unspent food means production is capped, not food-limited: spend the population on the army instead of holding it at home.
- If food stops growing or workers fall low, put one queen back on workers.
- Record worker and soldier counts at every observation so the next report can state the real ratio. The 3:1 and 5:1 figures quoted so far are not confirmed by any server log.

## Concentrated push

- Stage at the edge of our own half in the chosen lane's y-range (our win used (100,22) on Central Lake v2), by setting the soldier queen's spawn point there. Then step ATTACK marks along ONE lane toward the enemy. The Four Lanes win stepped west along y≈80: (55,80) 26, (42,80) 30, (26,80) 40 soldiers.
- Mass first (67 soldiers within one 10×10 block at tick 7,873 on Central Lake v2). Prefer forward enemy groups and foragers (Four Lanes: a lane group of 23 workers and 3 soldiers fell for 4 losses). Avoid attacking into dense defenders on held ground (INFERRED from the 10-match archive).
- Keep a home reserve; do not strip home ground for kills. Take a fresh `observe` immediately before each mark. A mark needs a tile within sight (sightTiles 12) of a living ant and within reach (markReachTiles 20); `count_mark_not_visible` was 47% of all 2,316 refusals.
- Stepped marks are also the scouting method: orders are colony-level and there is no per-ant control (CONFIRMED in the command vocabulary), so a lone-worker spy is not possible.

## Queen hunt

- The enemy start queen is somewhere in its own start box, weighted toward the box centre (for example (16.5,48.5) on the 96-tile maps). Do not assume it mirrors ours.
- Enemy queens die near their own start box, but the enemy start queen is NOT at the mirror of ours (Central Lake v2: ours (112.5,28.5), theirs (20.5,21.5)). Scout inside the enemy box with stepped marks, then re-observe before ordering.
- When a queen is seen, record tile, HP and tick, and put at least 10 soldiers next to it. Stripping enemy-held tiles also blocks their founding.
- A queen that leaves sight is not dead unless the server says so.
- If a territory win is close and the 300 s hold is running, keep holding rather than chasing a queen.

## 1v1 map playbook (we are colony 1 on the right; if seated as colony 0, mirror x: 127−x, or 255−x on Wide Plain)

Source: `study/maps.md`. Water is fixed per map; rocks are random each match and never sealed a lane. Boxes: standard maps enemy x0–31 and ours x96–127; Wide Plain enemy x0–63 and ours x192–255. Enemy extra-queen cells are the 8×8 cell whose top-left is (x,y), from founding events by the left colony (CONFIRMED, n shown). The lane to push is INFERRED: the lane that leads to the commonest enemy extra cell.

- **Overall:** the enemy's first extra queen is in the southern half of its side in 149 of 253 cases (my recount from `study/maps.md` Appendix C); on Central Lake, Isthmus, Three Crossings and Twin Shields it is south in about 2 of 3 or more. Enemy extras sit in their own half, not at the mirror of ours.
- **Three Crossings** (n=37) and **v2** (n=12): three 8-tile gates at y16–23, 44–51, 72–79 in a water wall at x≈60–67 (v2 x56–71). Enemy extras (32,72) n=10, then (48,16) n=6. Push the south gate y72–79 first.
- **Central Lake** (n=30) and **v2** (n=12): lake x44–83 (v2 x40–87), lanes north y0–23 and south y72–95. Enemy extras (32,72) n=10, (48,16) n=6. South lane leads to the first cell, north lane to the second; choose by what the first observations show.
- **Open Field** (n=60): no water, no choke. Enemy extras (32,72) n=12, (48,16) n=7, (32,64) n=6. Push on one row; do not spread.
- **Isthmus** (n=25): one crossing, y40–55 at x≈62–65 (the tightest map). Enemy extras (32,72) n=6, (32,64) n=5. Hold the crossing mouth, push through, then turn south-west.
- **Wide Plain** 256×92 (n=36): pinches at x66–81 (enemy side) and x174–189 (ours), lanes y0–15, 38–53, 76–91. Enemy extras sit forward at (80,64) n=9 and (80,16) n=8, just outside their pinch; the open centre x82–173 reaches them without passing the pinch (INFERRED). Keep ground in front of the pinch on our side; the loss came from enemy ants sitting on our ground.
- **Twin Shields** (n=24): lakes at x35–46 and x81–92 (y29–66), centre open, top lane y0–35 and bottom lane y59–95. Enemy extras (32,72) n=6, (32,64) n=4. Push the bottom lane.
- **Four Lanes** 128×128 (n=33): lanes y0–19, 36–55, 72–93, 106–127. Enemy extras (48,80) n=8, (48,48) n=6. Push y72–93 (our win used it) or y36–55.

## Decision rule

At each observation, prioritize:

1. Prevent an immediate queen loss.
2. Stop an imminent enemy territory win or defend critical home ground.
3. Found the next extra queen when gate, cooldown, food and a held tile allow.
4. Restore worker income and sustainable production.
5. Correct exposed queens, broken marks or vulnerable expansion positions.
6. If the army-readiness trigger is met and 1–5 are stable, assemble and push on one lane; prioritise exposed queens.
7. Otherwise expand, scout and take selective trades.

This is a priority order, not a rigid build order. Do not trade a reliable territory win for a risky queen chase.

**No strategy guarantees a win.**
