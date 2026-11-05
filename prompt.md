# Antwars — next-match strategy (v2, experimental)

`prompt.md` contains strategic guidance only; `antwars-run.md` defines run procedure, authorization and stopping rules. Live rules and the live match briefing override anything here.

Labels: VERIFIED = server or run-log evidence in our reports; CONFIRMED-ARCHIVE = from `study/match-notes.md` (10 finished Model Index matches); UNVERIFIED = inference or experiment. Treat every number below as a reference target, not a rule.

## Evidence from our matches

- **Loss (`study/match-loss-2026-11-04.md`):** Wide Plain 256×92, lost to `antwars/gpt-6-1-terra-max-fast` by sustained territory at tick 18,058 (about 30:06). Territory fell from 90‰ to 13‰; final state 48 soldiers, 0 workers, 4,451 food unspent. Worker brood was switched off at about 1481 s; extra queens came at 9:01 and 12:02; the enemy nest was never located.
- **Win, Four Lanes (`study/match-win-2026-11-04.md`):** beat `antwars/claude-opus-5-5` by `queens_killed` at tick 10,126 (about 16:53). One queen held worker brood to the end; soldier ATTACK marks stepped west along one lane ((55,80) 26, (42,80) 30, (26,80) 40 soldiers). The 768 cap was reached by about tick 9,600 with 2,792 food unspent.
- **Win, Central Lake v2 (`study/last-match.md`):** beat `antwars/claude-opus-5-5` by `sustained_territory` at tick 16,532 (about 27:33). Extra queens at 7:46 and 11:27 (later than the archive winners). Soldier brood only began at 8:28. The colony stood near the 512 cap at tick 12,012 (about 20:01) yet the match ran another 7+ minutes with 10,543 food unspent. UNVERIFIED: whether the (100,22) forward staging helped.
- **Opponent strength caveat:** the site owner reportedly weakened Opus 5.5 before ranked play (told to the project owner; not server-verified). Wins over it are weak evidence against full-strength models.
- **Archive (CONFIRMED-ARCHIVE, 10 matches, small sample):** winners placed the first ATTACK in 7/10 and had more kills in 9/10. Three of the ten had a first ATTACK before 3:00 (at 2:08, 2:15 and 2:45). Queen kills are bursts: median 6.45 s from first damage to death; 11 of 16 within 10 s. Every `queens_killed` loser lost all its queens; three of the five had no extra queen. Territory wins end exactly 300 s after the final qualifying run starts.

## Core idea: build, then strike

Treat it like a StarCraft timing attack. The economy exists to fund an army that ends the match. Do not keep expanding workers once income and population are already strong, and do not sit in defence waiting for the territory clock. Two win paths; pursue both with the same army: (a) strip enemy-held ground and reach the queens, (b) hold the 6× territory ratio for 300 s.

## Opening

- Make ONE `pick_nest` attempt, set worker brood, FORAGE a large share of free ants on the nearest reachable food (both as in `antwars-run.md`).
- First extra queen at about 5:00 (Four Lanes win: 5:23; archive winners: 5:00–6:58). Second at about 8:30–9:00, subject to live cost, cooldown, placement and tile-control rules. If founding is refused, read the error and fix the cause once.
- Placement (UNVERIFIED): choose held ground on the side away from the enemy approach lane, not forward or central. Refusals seen in the archive: `queen_tile_not_held`, `queen_too_close`, `queen_food`, `queen_cooldown`.

## Early rush guard (experimental)

Three of ten archive matches had a first ATTACK before 3:00, and one earlier unidentified loss ended at about 7 minutes (UNVERIFIED cause). Cheap insurance:

- By about 3:30–4:00 have a small soldier guard (about 10–15, UNVERIFIED sizing) on a DEFEND mark near the queen, then return to worker-first brood.
- If any enemy ant is seen near the nest earlier, switch to mixed or soldier brood at once.
- Treat any queen HP loss as urgent. A queen dies in seconds once ~10 ants reach it.

## Economy-to-army conversion (main change)

Default queen roles: queen 0 workers, queen 1 soldiers from founding, queen 2 workers early then soldiers once the trigger below is met.

**Army-readiness trigger (alert, not an automatic rule):** act when at least two hold: population ≥ about 75% of the live cap; stored food is rising and unspent (our wins ended with 2.8k–10.5k unused); two or more queens alive; no enemy territory run in progress.

When triggered:

- Move every queen except one to soldiers. The remaining queen stays on workers or mixed so income and replacements continue. Never switch all queens to soldiers-only (the loss: workers reached 0, income flatlined).
- At or near the cap, unspent food means production is capped, not food-limited. Spend the population on the army instead of holding it at home.
- If food stops growing or workers fall low, put one queen back on workers.
- Record worker and soldier counts at every observation so the next report can state the real ratio. The owner's replay reading (about 3:1) and ChatGPT's 5:1 figure are both unconfirmed by the server log. Treat a ratio near 3:1 as an alert, not a rule.

## Concentrated push

- Keep forward staging: set the soldier queen's spawn point on a tile toward the enemy (done at (100,22) on Central Lake).
- Mass first. Reference: 67 soldiers within one 10×10 block at tick 7,873 (Central Lake). Then use stepped ATTACK marks along ONE lane, not many small marks in several places.
- Prefer targets that trade well: forward enemy groups and foragers. VERIFIED: on Four Lanes a lane group of 23 workers and 3 soldiers was destroyed for 4 losses. INFERRED (archive): attacking into dense defenders on held ground trades at a loss.
- Keep a home reserve; do not strip home ground for kills. Take a fresh `observe` immediately before each mark and check reach (three `count_mark_not_visible` refusals occurred on Central Lake).
- Refresh marks before expiry and respect the live rate limit; do not burn calls on refused commands.

## Queen hunt

- When an enemy queen is seen, record tile, HP and tick. Re-observe before ordering. Concentrate at least ~10 soldiers on the approach rather than splitting.
- Stripping enemy-held tiles blocks their founding (`queen_tile_not_held`) and exposes queens (archive INFERRED).
- A queen that leaves sight is not dead unless the server says so.
- If a territory win is close and the 300 s hold is running, keep holding rather than chasing a queen.

## Locating the enemy

- The enemy start is the other start box on the map. Expect enemy extra queens roughly mirrored to ours. On Central Lake v2 our queens stood at (112,28) and (112,62); enemy queens were seen at (20,21) and (30,66). On Four Lanes the enemy force came from the west lane. UNVERIFIED as an exact rule; use as first scouting and ATTACK candidates, then confirm with a fresh `observe`.
- Per-map notes from the study go here once `study/maps.md` is reviewed (none yet).

## Scouting and harassment (check live rules first)

- Marks need visible tiles (`count_mark_not_visible`), so assume a lone-worker spy cannot be sent into unseen ground. Check the live rules for per-ant control and minimum mark size before planning it. Forward staging and a forward queen spawn point are the confirmed ways to extend sight.
- Harass only where the live rules allow a small squad and the target is foragers or forward workers, not held defences.

## Decision rule

At each observation, prioritize:

1. Prevent an immediate queen loss.
2. Stop an imminent enemy territory win or defend critical home ground.
3. Restore worker income and sustainable production.
4. Correct exposed queens, broken marks or vulnerable expansion positions.
5. If the army-readiness trigger is met and 1–4 are stable, assemble and push on one lane; prioritise exposed queens.
6. Otherwise expand, scout and take selective trades.

This is a priority order, not a rigid build order. Adapt to the actual map and current battlefield. Do not trade a reliable territory win for a risky queen chase.

**No strategy guarantees a win.**
