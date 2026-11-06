# Antwars — next-match strategy (v5.1, experimental)

`prompt.md` contains strategic guidance only; `antwars-run.md` defines run procedure, authorization and stopping rules. Live rules and the live match briefing override anything here.

Labels: VERIFIED = server or run-log evidence in our reports; CONFIRMED = read from a match-log field in `study/maps.md` (269 finished 1v1 matches, 2026-10-25 to 2026-11-05) or in `study/forensics-2026-11-05-twin-shields.md` / `study/forensics-2026-11-05-open-field.md` (one full public log each), with the sample size; INFERRED / UNVERIFIED = interpretation or experiment. An "in-sight" count is what observations show, not a census of every ant. Numbers are reference targets, not rules.

## Evidence from our matches

- **Our record against house bots in the public feed (CONFIRMED, 7 seats, all as colony 1): 4 wins, 3 losses.** Reports are in `study/`.
  - Losses: Three Crossings v2 (`queens_killed` at 7:24 after a 100-soldier mark at 3:50; no extra queen ever founded). Wide Plain (`sustained_territory`; extras at 9:01 and 12:02; worker brood off at about 1481 s, workers 0, 4,451 food unspent). Central Lake v2 (`time_up`; only extra queen at 11:43).
  - Won Four Lanes (`queens_killed`, tick 10,126): extras at 5:23 and 9:58; queens 0 and 2 on soldiers from tick 6,347; 299 soldiers at the last count of 768 ants.
  - Won Central Lake v2 (`sustained_territory`, tick 16,532): extras at 7:46 and 11:27; about 510/512 in sight by 20:01 with 10,543 food unspent.
  - Won Twin Shields (`sustained_territory`, tick 13,450; forensics CONFIRMED): extra queen at tick 3,078 at (108.5,60.5), 36 tiles from home; no second extra (late attempts at (78,26) and (70,24) were refused `queen_too_close` by the enemy nest at (56.5,22.5)); our extra queen lost to a raid at tick 8,162; two enemy queens killed by marks within 1 tile; the third, at (36.5,68.5), never touched; the hold ran from tick 10,451 to 13,450.
  - Won Open Field against `antwars/gpt-6-1-terra-max-fast` (first on the 1v1 Model Index, 1963 over 19 rated matches) by `time_up`, `decidedBy: kills`, tick 17,999, **by 34 kills (2,139 to 2,105)** (forensics `study/forensics-2026-11-05-open-field.md`, CONFIRMED): extras at ticks 3,046 and 4,874, none of our queens damaged; queen 1 on soldiers from tick 3,076, queen 0 from 7,279, queen 2 on workers from 4,896 until 16,137; ten 6× territory runs, the longest 1,708 of the 3,000 ticks needed; two enemy queens killed, at (52.5,30.5) at tick 10,323 and (44.5,62.5) at tick 11,948, and the enemy re-founded a third at (12.5,49.5) at tick 13,416, so two enemy queens stood at the end; our biggest simultaneous ATTACK was 120 soldiers and never above 80 after tick 12,000. The agent's own census read 386 workers and 125 soldiers at tick 12,600 (the caste split cannot be checked in the log).
  - Pattern (small sample): all three losses had no extra queen or a late one; the four wins had one to three. A single queen dies in seconds once reached.
- **Opponent caveat:** the site owner reportedly weakened Opus 5.5 before ranked play (told to the project owner; not server-verified), so our three wins over it are weak evidence. The Open Field win over the top-rated model is stronger, but it is one match and was decided by 34 kills.
- **Archive (CONFIRMED, n=269):** a first ATTACK before 4:00 occurred in 121 matches; the side that attacked first won 66 of them, so early aggression is roughly a coin flip. Queens die close to home (median 0–4 tiles from their own start box) and fast (median 4–8 s from first damage; 55–66% within 10 s). The first extra queen lands at a median of about 5:15 on every map; the second at about 9:07. Territory wins end exactly 300 s after the final qualifying run began.

## Core idea: build, then strike

The economy exists to fund an army that ends the match. Do not keep adding workers once income and population are strong, and do not sit in defence waiting for the territory clock. Three win paths, one army: (a) strip enemy-held ground and reach the queens, (b) hold the 6× territory ratio for 300 s, (c) lead on kills when the 1,800 s limit arrives (`time_up`, decided on kills). Pick (c) deliberately; see the kill race below.

## Opening and the queen clock

- Make ONE `pick_nest` attempt, set worker brood, FORAGE a large share of free ants on the nearest reachable food (as in `antwars-run.md`).
- Extra queens (rules identical in all versions seen, CONFIRMED): earliest at tick 3,000 (5:00); cost 400 food, doubling per live extra (400, 800, 1,600); 180 s cooldown; the tile must be held by us and at least 32 tiles from every standing nest, ours or the enemy's.
- Refusals seen most: `queen_tile_not_held` (308 of 520), then `queen_too_close` (133). Prepare before 5:00: from about 4:00 choose a tile in our own half at least 34 tiles from our home queen (margin; the exact metric is not stated), keep ants on it (held tiles decay after 20 s unvisited), and keep 400 food unspent. Try at tick 3,000–3,300.
- If refused, read the code and fix the cause once: not held means put ants on that tile and retry; too close means move farther away. Do not repeat an unchanged request.
- Targets: first extra at 5:00–5:30; second at 8:00–9:00 (cooldown makes 8:00 the earliest; archive median 9:07); a third (1,600 food) when food is banked. Being a single-queen colony past about 6:00 was the common thread in our losses; the Twin Shields win ended with one extra queen ever founded and 2,341 food banked.
- Enemy nests count for the 32-tile rule. Found the second extra before the enemy plants a forward nest, and plan both extra tiles inside our own box before 5:00 (INFERRED: on a 96-tile box with the home queen near one end, tiles about 34 tiles apart along the long axis fit three nests). Late attempts at forward tiles outside our box failed in the Twin Shields win. If an extra queen is lost, re-found it at the same safe tile when cooldown and food allow.
- Placement (UNVERIFIED): our own half, away from the enemy approach lane, not forward or central — except on ground the army has just taken, which worked once (VERIFIED founding and survival, 11/06 Three Crossings v2: the 1,600-food third queen at (77,21), 33 tiles from home, stood at 40/40 HP at match end — `study/last-match.md`).

## Early rush guard (experimental)

The Three Crossings v2 loss shows one 100-soldier mark at 3:50 can end a one-queen game by 7:24. In the archive a first ATTACK before 3:00 happened in dozens of matches.

- Start mixed or soldier brood by about 3:30 so a guard of roughly 15–25 soldiers (UNVERIFIED sizing) is near the home queen by 4:00, held with a DEFEND mark that is refreshed before its 180 s lifetime ends. Return to worker-first brood after the second queen is up.
- If any enemy ant is seen near the nest earlier, switch to mixed or soldier brood at once.
- Treat any queen HP loss as urgent. A second queen turns a lost raid into a lost 40 HP, not a lost game.
- Guard every queen, not only the home nest. The Twin Shields extra queen had a 4-worker DEFEND from tick 1,996; the first enemy contact at tick 8,079 killed it by tick 8,162 (CONFIRMED). Once enemy ants are seen within about 20 tiles of any queen, put a soldier DEFEND mark (about 15 or more) on that queen and refresh it before its 180 s lifetime ends.

## Command budget

The live limit is one command per 10 s, and marks last 180 s (CONFIRMED in `rules.config`; 624 `rate_limited` refusals in the archive). That is about 18 commands per mark lifetime, shared by brood, founding, FORAGE, DEFEND and ATTACK marks. Spend them in this order: queen safety, founding, brood, refreshing the marks that matter, then everything else. Do not retry a refused command unchanged. Check the live rules for whether `observe` shares the limit.

## Soldier surge (economy-to-army conversion)

Set the mix before the cap. At the cap new ants only replace the dead, so brood changes then produce nothing until ants die. In Open Field our colony stood at 449–512 ants by tick 14,395 (the cap is reachable from tick 12,606; it was NOT at the cap at tick 11,857, CONFIRMED from the log). Workers rarely die and soldiers die in every strike, so a colony that is worker-heavy at the cap stays worker-heavy. Hatch cadence is CONFIRMED: one worker per 10 ticks per worker queen, one soldier per 20 ticks per soldier queen, so one worker queen out-produces a soldier queen two to one, and two soldier queens plus one worker queen hatch about half workers. No ant carries a caste in the public log, so every worker and soldier count in our reports is an estimate; the agent's census read 386 workers and 125 soldiers at tick 12,600 (a colony-wide total of 511 that matches the log, but an unverifiable split).

Schedule (reference numbers, UNVERIFIED):

- Queen 0 on workers (mixed during the early rush guard). Queen 1 on soldiers from founding.
- Queen 2 on workers only while food is short. Switch it to soldiers once stored food is about 1,000 or more and rising at two successive observations, and in any case by about 12:00 (tick 7,200). In Open Field it stayed on workers until tick 16,137, long after the colony reached 449–512 ants, with 5,543 food banked at tick 14,049 (the agent's status; the public log has no food field).
- After that all three queens are on soldiers; keep them there through the cap so every loss is replaced by a soldier.
- Worker floor: put one queen back on workers only if workers fall below about a third of the cap or income clearly collapses (Wide Plain ended with 0 workers).
- Soldier target at the cap: about 40% (benchmark: Four Lanes, 299 of 768 = 39% at the last count; its report does not say whether that was a colony-wide count, so treat it as soft). Up to 50% is EXPERIMENTAL, for a planned kill race. The Open Field soldier share is unknown (no caste in the log); the agent's estimate was about 24% at tick 12,600.
- Below the cap, banked food means too few queens (INFERRED). Turn it into queens first (800, then 1,600), then soldiers.
- Record worker and soldier counts at every observation and call them in-sight estimates unless every ant is visible. The 3:1 and 5:1 figures quoted earlier are not confirmed by any log.

## Concentrated push

- Stage at the edge of our own half in the chosen lane's y-range (our win used (100,22) on Central Lake v2), by setting the soldier queen's spawn point there. Then step ATTACK marks along ONE lane toward the enemy. The Four Lanes win stepped west along y≈80: (55,80) 26, (42,80) 30, (26,80) 40 soldiers.
- Mass first (67 soldiers within one 10×10 block at tick 7,873 on Central Lake v2). Prefer forward enemy groups and foragers (Four Lanes: a lane group of 23 workers and 3 soldiers fell for 4 losses). Avoid attacking into dense defenders on held ground (INFERRED from the 10-match archive).
- Deploy the army you have, and keep it fed. Open Field's mid-match marks show the pool running dry: the reinforcement mark on the queen at tick 7,251 requested 60 soldiers and claimed 0, and the one at tick 9,350 requested 70 and claimed 40 (CONFIRMED; the cause is INFERRED: the earlier marks at (52,24) and (52,29) already held 120). Late in the match the marks asked for only 24–40 soldiers while the colony held 449–512 ants (CONFIRMED). So do both: run the surge earlier, and once it has run put about 70% of live soldiers on one lane with the rest as home reserve and queen guards.
- Marks bleed. A mark keeps claiming replacements for its whole 1,800-tick life. In Open Field only 4 of 18 ATTACK marks finished with more enemy deaths than our losses within 6 tiles of the mark (INFERRED); the mark at (51,55) took 133 of our ants for 73 enemy deaths over 1,799 ticks. Check the trade after each mark and do not re-lay a losing one at the same size. The per-mark credits quoted in the Open Field report could not be reproduced from the log (UNVERIFIED).
- Keep a home reserve; do not strip home ground for kills. Territory decays when ants leave: in the Twin Shields win two qualifying territory runs were cancelled (at ticks 9,802 and 10,101) after the army pushed west, and the run that counted began at 10,451. Before the army leaves, lay stationary ground-holding marks across home tiles; the report says the run restarted once the colony held more than 100 tiles (threshold UNVERIFIED; check live rules).
- Put the ATTACK mark ON the queen tile. Both enemy queens that died fell within 357 and 179 ticks of a mark laid within 1 tile of them (CONFIRMED, Twin Shields). Take a fresh `observe` immediately before each mark. A mark needs a tile within sight (sightTiles 12) of a living ant and within reach (markReachTiles 20); `count_mark_not_visible` was 47% of all 2,316 refusals.
- Stepped marks are also the scouting method: orders are colony-level and there is no per-ant control (CONFIRMED in the command vocabulary), so a lone-worker spy is not possible.

## Queen hunt

- The enemy start queen is somewhere in its own start box, weighted toward the box centre (for example (16.5,48.5) on the 96-tile maps) but an enemy queen stood near the map edge (VERIFIED sighting: (4,46), 4 tiles in from x0, 11/06 Three Crossings v2, `study/last-match.md`; whether she was the start queen or an extra is UNVERIFIED), and is NOT at the mirror of ours (Central Lake v2: ours (112.5,28.5), theirs (20.5,21.5)). Enemy extra queens go where the map playbook says. Scout inside the enemy box with stepped marks, then re-observe before ordering.
- Count the enemy's queens. In the Twin Shields win the enemy had three (start (18.5,23.5), (36.5,68.5) founded at tick 3,029, forward (56.5,22.5) founded at tick 4,877). We killed two, and the one in the playbook's south cell survived untouched. After one lane is cleared, sweep the playbook's other cell with stepped marks before settling into a hold.
- When a queen is seen, record tile, HP and tick, and put at least 10 soldiers next to it. Stripping enemy-held tiles also blocks their founding.
- A damaged queen regenerates 1 HP per 10 s only when no enemy ant is within 6 tiles at the check (live rule). VERIFIED in the Open Field log: the queen at (52.5,30.5) was struck from about 39.5 HP to 2.65 HP in about 15 s (ticks 7,162–7,307), then sat at 2.65 HP for over 1,100 ticks, regained only 7 HP in 259 s because our ants were near her about half the time, and died at tick 10,323 when 15 of our ants reached her (9.5 HP to 0 in 39 ticks). The strike mass is not the problem; staying on her is. Lay the next mark on her tile while the first is still alive, keep about 20 soldiers free (unclaimed by other marks) to claim it, and keep ants within 6 tiles until the server shows her dead.
- A queen that leaves sight is not dead unless the server says so.
- Hold and hunt are not exclusive. Once nothing of the enemy is in sight and its territory is 0, keep the 300 s hold running with ground-holding marks and send the rest of the army to sweep for the remaining queens, keeping a soldier DEFEND on each of our queens. Abandon the sweep only if it empties home ground. A reachable queen kill ends the match sooner than the hold (queens_killed); the Twin Shields hold took 3,000 ticks after the enemy had no ants.

## Kill race (experimental)

- If neither side wins by queens or by a 300 s territory hold, `time_up` goes to the side with more kills (Open Field, `decidedBy: kills`, margin 34 of 4,244 deaths). The public log gives exact per-colony kills after the match (deaths by colony) but no per-mark credits; whether the live `observe` or status shows kill totals is UNVERIFIED, so check at the start of the run. If it does not, rely on the time trigger below and judge trades from losses and enemy ants seen.
- Trigger: the 6× territory ratio is not established and not safely progressing, and about 330 s or less remain (the extra 30 s over the 300 s hold is an EXPERIMENTAL margin, not a game rule), or earlier when a visible kill count shows us clearly behind. In Open Field the 6× ratio was met in ten runs but never held for 300 s (CONFIRMED). Do not abandon a territory hold that is safely progressing.
- In kill race: keep a soldier DEFEND on every queen and enough home ground to deny a territory win; put most soldiers on ONE lane; prefer good trades (enemy workers and foragers, isolated groups, a queen we can finish); send no small waves into a defended position; stop marks whose losses exceed their kills; re-observe before each mark; keep going until the server confirms the result.
- Last resort (UNVERIFIED trade quality): if soldiers are too few and food is banked, an ATTACK with caste `any` can draft workers.

## 1v1 map playbook (we are colony 1 on the right; if seated as colony 0, mirror x: 127−x, or 255−x on Wide Plain)

Source: `study/maps.md`. Water is fixed per map; rocks are random each match and never sealed a lane. Boxes: standard maps enemy x0–31 and ours x96–127; Wide Plain enemy x0–63 and ours x192–255. Enemy extra-queen cells are the 8×8 cell whose top-left is (x,y), from founding events by the left colony (CONFIRMED, n shown). The lane to push is INFERRED: the lane that leads to the commonest enemy extra cell.

- **Overall:** the enemy's first extra queen is in the southern half of its side in 149 of 253 cases (my recount from `study/maps.md` Appendix C); on Central Lake, Isthmus, Three Crossings and Twin Shields it is south in about 2 of 3 or more. Enemy extras sit in their own half, not at the mirror of ours.
- **Three Crossings** (n=37) and **v2** (n=12): three 8-tile gates at y16–23, 44–51, 72–79 in a water wall at x≈60–67 (v2 x56–71). Enemy extras (32,72) n=10, then (48,16) n=6. Push the south gate y72–79 first. 11/06 v2 win: enemy queens were seen at (29,19), (4,46) and (38,72); the north-gate fight (y16–23) broke their field army before the sweep.
- **Central Lake** (n=30) and **v2** (n=12): lake x44–83 (v2 x40–87), lanes north y0–23 and south y72–95. Enemy extras (32,72) n=10, (48,16) n=6. South lane leads to the first cell, north lane to the second; choose by what the first observations show.
- **Open Field** (n=60): no water, no choke. Enemy extras (32,72) n=12, (48,16) n=7, (32,64) n=6. Push on one row; do not spread. In our 11/05 win the foragers met at (86–88,21–23) from tick 1,347, the enemy placed queens at (52.5,30.5), (44.5,62.5) and, after losing both, (12.5,49.5); the attack stepped west along y≈18–24 from (99,23).
- **Isthmus** (n=25): one crossing, y40–55 at x≈62–65 (the tightest map). Enemy extras (32,72) n=6, (32,64) n=5. Hold the crossing mouth, push through, then turn south-west.
- **Wide Plain** 256×92 (n=36): pinches at x66–81 (enemy side) and x174–189 (ours), lanes y0–15, 38–53, 76–91. Enemy extras sit forward at (80,64) n=9 and (80,16) n=8, just outside their pinch; the open centre x82–173 reaches them without passing the pinch (INFERRED). Keep ground in front of the pinch on our side; the loss came from enemy ants sitting on our ground.
- **Twin Shields** (n=24): lakes at x35–46 and x81–92 (y29–66), centre open, top lane y0–35 and bottom lane y59–95. Enemy extras (32,72) n=6, (32,64) n=4. Push the bottom lane. Our 11/05 win fought in the top lane (enemy forward nest (56.5,22.5), start queen (18.5,23.5)) and never reached the south queen at (36.5,68.5), inside the playbook cell. Clear the top lane if that is where the fight is, then sweep south.
- **Four Lanes** 128×128 (n=33): lanes y0–19, 36–55, 72–93, 106–127. Enemy extras (48,80) n=8, (48,48) n=6. Push y72–93 (our win used it) or y36–55.

## Decision rule

At each observation, prioritize:

1. Prevent an immediate queen loss.
2. Stop an imminent enemy territory win or defend critical home ground.
3. Found the next extra queen when gate, cooldown, food and a held tile allow.
4. Restore worker income and sustainable production.
5. Correct exposed queens, broken marks or vulnerable expansion positions.
6. Run the soldier surge on schedule; if 1–5 are stable, assemble most soldiers and push on one lane, with ground-holding marks left at home; prioritise exposed queens and sweep the playbook cells for every remaining one.
7. Switch to kill race when the territory route is not safely progressing and about 330 s or less remain.
8. Otherwise expand, scout and take selective trades.

This is a priority order, not a rigid build order. Do not trade a reliable territory win for a risky queen chase.

**No strategy guarantees a win.**
