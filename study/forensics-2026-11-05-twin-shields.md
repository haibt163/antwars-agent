# Forensics — 2026-11-05 Twin Shields win (lobby `f926bfc6…`)

Read-only analysis of the public match log. **No match tool was called, no lobby/challenge/queue tool was called, and no identity key was read.** Every number below comes from the public match feed and the JSON log behind it.

**Match:** `2026-11-05T11-43-02-988Z-176866793674375`, started 2026-11-05T11:43:02.988Z, ended 12:05:28.004Z, winner colony 1 (`omp-dolphin`), `sustained_territory`, tick 13,450. Seats: colony 0 `antwars/claude-opus-5-5` (`anthropic/claude-opus-5-5`, thinking `high`), colony 1 `omp-dolphin`. Map Twin Shields 128×96, 18,000 ticks, cap 512.

**Source:** `GET https://antwars.ai/matches` (newest row) and `GET https://antwars.ai/matches/2026-11-05T11-43-02-988Z-176866793674375` → 200, 3,012,865 bytes, `format: antwar.match`, `version: 1`, `source: match-log` — CONFIRMED.

**Labels.** `CONFIRMED` = read directly from a log field or from a count over log events, with n. `INFERRED` = my derivation from those fields, with the rule used. `NOT AVAILABLE` = the field does not exist in the public log.

**Log inventory (CONFIRMED, n = 29,294 events):** 22,759 `fight`, 2,216 `birth`, 1,948 `death`, 1,712 `mark`, 641 of those ours, 304 `queenHp`, 285 `call`, 48 `markGone`, 7 `order`, 6 `territoryWin`, 3 `queenFounded`, 3 `queenLost`, 2 `join`, 1 `end`.

**Method note.** A `fight` event carries `antId` (attacker), `targetId` and one `colony` value; that value is the attacker's colony (checked against every death record: 0 contradictions in 2,003 ants). An ant's colony is therefore known when it ever attacks, is ever attacked, or dies. Ant ids are allocation-ordered, **not** parity-coded: `antId % 2 == colony` holds for only 57.8% of the 2,003 evidenced ants, so any per-colony split made from id parity is invalid.

## 1. Every queenFounded and queenLost event (both colonies)

| Tick | Event | Colony | Queen id | Tile | HP |
|---|---|---|---|---|---|
| 0 | start (setup) | 0 | 0 | (18.5, 23.5) | 40,000 |
| 0 | start (setup) | 1 | 0 | (112.5, 24.5) | 40,000 |
| 3,029 | queenFounded | 0 | 1 | (36.5, 68.5) | 40,000 |
| 3,078 | queenFounded | 1 | 1 | (108.5, 60.5) | 40,000 |
| 4,877 | queenFounded | 0 | 2 | (56.5, 22.5) | 40,000 |
| 8,162 | queenLost | 1 | 1 | (108.5, 60.5) | 0 |
| 8,231 | queenLost | 0 | 2 | (56.5, 22.5) | 0 |
| 9,454 | queenLost | 0 | 0 | (18.5, 23.5) | 0 |

CONFIRMED (n = 3 `queenFounded`, 3 `queenLost`, 2 setup queens). Enemy queen coverage by period:

| Period (ticks) | Enemy queens standing |
|---|---|
| 0 – 3,028 | (18.5, 23.5) |
| 3,029 – 4,876 | (18.5, 23.5), (36.5, 68.5) |
| 4,877 – 8,230 | (18.5, 23.5), (36.5, 68.5), (56.5, 22.5) |
| 8,231 – 9,453 | (18.5, 23.5), (36.5, 68.5) |
| 9,454 – 13,450 | (36.5, 68.5) only |

Damage windows from `queenHp` (CONFIRMED): enemy north queen (56.5, 22.5) 39,850 at tick 7,558 → 0 at 8,231 (n = 205 samples); enemy start queen (18.5, 23.5) 39,850 at 9,427 → 0 at 9,454 (n = 28); our queen 1 (108.5, 60.5) 39,700 at 8,088 → 0 at 8,162 (n = 71). The surviving enemy queen (36.5, 68.5) has **no** `queenHp` events — it was never damaged (CONFIRMED).

## 2. Every `found_queen` call by colony 1 at or after tick 3,078

| Tick | Tile | Outcome | Error code |
|---|---|---|---|
| 3,078 | (108, 60) | accepted | — |
| 7,641 | (78, 26) | refused | `rate_limited` |
| 7,709 | (78, 26) | refused | `queen_too_close` |
| 7,748 | (70, 24) | refused | `queen_too_close` |

CONFIRMED (n = 4 of 7 `found_queen` calls in the match; the other 3 are colony 0's). There were no further `found_queen` calls after 7,748 — the colony finished with one extra queen. The two `queen_too_close` refusals are explained by the log: the enemy's forward nest stood at (56.5, 22.5) from tick 4,877, i.e. 21.8 and 13.6 tiles from the refused tiles.

## 3. Population by colony at ticks 6,000 / 9,000 / 12,000 / 13,400

Population is computed as living ants: an ant counts if its birth tick ≤ t and it has no death tick ≤ t (start ants count from tick 0; 30 per colony). Colony attribution uses the fight/death evidence described above.

| Tick | Colony 0 (attributed) | Colony 1 (attributed) | Unattributed alive | Total alive |
|---|---|---|---|---|
| 6,000 | 108 | 273 | 1 | 382 |
| 9,000 | 19 | 68 | 57 | 144 |
| 12,000 | 0 | 55 | 200 | 255 |
| 13,400 | 0 | 55 | 270 | 325 |
| 13,450 (end) | 0 | 55 | 273 | 328 |

CONFIRMED for the attributable columns and the totals (n = 2,216 births, 1,948 deaths, 60 start ants); the "unattributed" column is CONFIRMED as unattributed (n = 273 ants that never attack, are never attacked and never die).

**By caste: NOT AVAILABLE.** The public log records no caste for any ant: `birth` carries only `{kind, antId}` (n = 2,216), `death` carries `{antId, colony, x, y}` (n = 1,948), `fight` carries `{antId, targetId, colony, tileX, tileY}` (n = 22,759). Caste appears only on `count_mark` requests and resulting `mark` records. Birth-interval decoding works for single-queen spans (colony 1 alone: gaps are only 10 or 20 ticks, n = 264 before tick 3,000) but fails as soon as two queens hatch concurrently (colony 1 shows gaps of 3, 7 and 17 ticks after tick 3,000: 231, 160 and 71 occurrences), so it cannot produce a per-caste population for either colony.

What the log does pin down about caste (INFERRED from `set_brood` plus hatch cadence):

- Every birth at or after tick 8,961 belongs to one strict 20-tick stream: 225 births from 8,961 to 13,441, and every consecutive gap is exactly 20 ticks (n = 224 gaps, no gap below 20) — one queen hatching 2-interval soldiers. CONFIRMED as a cadence.
- Our queen 0 was on `soldiers` from tick 6,307 to the end, and both enemy queens standing at 8,503/8,509 were set to `workers` (1-interval, 10-tick cadence). No 10-tick hatch appears at or after 8,961, and every one of the 225 births sits at tick mod 20 = 1, the same phase as our queen 0's soldier hatches (that residue carries 100 of the 216 colony-1 births between 6,000 and 8,960, while the second stream sits at residue 18). So the whole stream is colony 1 soldiers — INFERRED (n = 225 births; the phase match rests on 216 colony-1 births between 6,000 and 8,960). Colony 0's own hatching stops at tick 8,906 although two of its queens were alive and set to workers, which points to an empty food store — INFERRED.
- The other 56 unattributed live ants (births 3,638 – 8,941) have no clean cadence and cannot be assigned.

## 4. Our ATTACK and DEFEND marks against the enemy queen tiles

32 unique mark definitions were laid by colony 1 (CONFIRMED, n = 32, from 641 of our `mark` events; repeats of the same mark are distinguished by `revision`). The table below shows 27 rows: the four count-lowering re-lays to 1 (at ticks 3,625, 6,120, 8,775 and 9,030) are omitted, and the tick-12,007 increase from 15 to 40 sits on one row. "Nearest enemy queen" is the closest queen standing at that tick.

| Laid tick | Verb | Tile | Count | Caste | Nearest standing enemy queen | Distance |
|---|---|---|---|---|---|---|
| 1,854 | DEFEND | (103,52) | 3 | worker | start (18.5,23.5) | 89.2 |
| 1,996 | DEFEND | (108,60) | 4 | worker | start (18.5,23.5) | 96.7 |
| 2,156 | DEFEND | (110,32) | 12 | soldier | start (18.5,23.5) | 91.9 |
| 3,353 | ATTACK | (102,68) | 20 | soldier | south (36.5,68.5) | 65.5 |
| 3,625 | ATTACK | (92,68) | 24 | soldier | south (36.5,68.5) | 55.5 |
| 3,992 | DEFEND | (112,26) | 25 | soldier | south (36.5,68.5) | 86.6 |
| 4,511 | ATTACK | (100,60) | 24 | soldier | south (36.5,68.5) | 64.1 |
| 4,667 | ATTACK | (104,22) | 20 | soldier | south (36.5,68.5) | 82.0 |
| 5,024 | ATTACK | (92,26) | 20 | soldier | north (56.5,22.5) | 35.7 |
| 5,338 | ATTACK | (84,24) | 34 | soldier | north (56.5,22.5) | 27.5 |
| 5,601 | ATTACK | (76,24) | 30 | soldier | north (56.5,22.5) | 19.6 |
| 5,949 | DEFEND | (112,26) | 12 | soldier | north (56.5,22.5) | 55.6 |
| 6,120 | ATTACK | (68,22) | 25 | soldier | north (56.5,22.5) | 11.5 |
| 6,800 | DEFEND | (100,24) | 25 | soldier | north (56.5,22.5) | 43.5 |
| 6,945 | ATTACK | (68,24) | 20 | soldier | north (56.5,22.5) | 11.6 |
| 7,223 | ATTACK | (58,26) | 25 | soldier | north (56.5,22.5) | **3.8** |
| 7,563 | ATTACK | (48,26) | 25 | soldier | north (56.5,22.5) | 9.2 |
| 7,874 | ATTACK | (56,22) | 25 | soldier | north (56.5,22.5) | **0.7** |
| 8,310 | ATTACK | (46,24) | 20 | soldier | start (18.5,23.5) | 27.5 |
| 8,557 | DEFEND | (112,26) | 15 | soldier | south (36.5,68.5) | 86.6 |
| 8,775 | ATTACK | (36,24) | 20 | soldier | start (18.5,23.5) | 17.5 |
| 9,030 | ATTACK | (26,24) | 20 | soldier | start (18.5,23.5) | 7.5 |
| 9,275 | ATTACK | (18,23) | 25 | soldier | start (18.5,23.5) | **0.7** |
| 9,886 | ATTACK | (52,34) | 20 | soldier | south (36.5,68.5) | 37.8 |
| 10,427 | DEFEND | (112,34) | 10 | soldier | south (36.5,68.5) | 83.0 |
| 12,007 | DEFEND | (112,26) | 15 → 40 | soldier | south (36.5,68.5) | 86.6 |
| 12,674 | DEFEND | (112,20) | 30 | soldier | south (36.5,68.5) | 89.7 |

Those three bold rows are the only ATTACK marks laid within the 6-tile pursuit area of a standing enemy queen (CONFIRMED). Their effect, from `queenHp`: the mark at (58,26) at 7,223 precedes the first damage to the north queen at 7,558; the mark at (56,22) at 7,874 sits 0.7 tiles from her centre and she dies at 8,231; the mark at (18,23) at 9,275 precedes the start queen's first damage at 9,427 and her death at 9,454. The surviving enemy queen at (36.5,68.5) was never targeted: the closest our marks ever came was (52,34) at 9,886, 37.8 tiles away (CONFIRMED, n = 32 marks).

Note the timing that the log makes unambiguous: our queen 1 died at 8,162, i.e. **69 ticks before** the enemy north queen died at 8,231; the "trade" was not simultaneous.

## 5. First enemy contact at each of our queens

Contact means a `fight` event within 2 tiles of the queen's tile centre, i.e. our ant biting an enemy ant (or the reverse) at her feet.

| Our queen | First contact | First queen damage | Closest enemy ant | Enemy deaths within 2 tiles | Outcome |
|---|---|---|---|---|---|
| 0 — (112.5, 24.5) | tick 8,981: our ant 1452 bites enemy 1980 at (112,26), 1.6 tiles out | none — 0 `queenHp` samples | 0.71 tiles at tick 9,102, tile (112,24) | 0 | survived, 40/40 |
| 1 — (108.5, 60.5) | tick 8,079: our ant 1966 bites enemy 1890 at (108,60), 0.5 tiles out | tick 8,088 (39,700 mHP) | 0.71 tiles at tick 8,163, tile (109,60) | 2 (ticks 8,128 and 8,160) | lost at 8,162 |

CONFIRMED (n = 105 fights within 2 tiles of queen 0, 2 colony-0 deaths there; n = 22,759 fights overall). Enemy ants did reach both queens — one stood on the tile directly south of queen 1 at tick 8,079 and one stood at (112,24), half a tile from queen 0, at tick 9,102 — but queen 0 took no damage at all (0 `queenHp` events for colony 1 queen 0), while queen 1 lost 40 HP in 74 ticks. Queen 1's damage begins 9 ticks after the first contact and ends with her death at 8,162.

**Caste of the attackers: NOT AVAILABLE** per ant. The two enemy ants at our south queen were ids 1890 (born 7,791) and 1921 (born 7,909); the enemy's brood settings then were `soldiers` on queens 1 and 2 and `mixed` on queen 0, so soldiers are the likely caste — INFERRED, not recorded.

## Settled questions

| Question | Answer | Label |
|---|---|---|
| Tick our extra queen died — 8,162 or about 12,250? | **8,162.** `queenLost` colony 1 queen 1, tile (108.5,60.5), hp 0; hp events 8,088 → 8,162. Nothing happens to any queen near 12,250; the last queen event in the match is 9,454. | CONFIRMED (n = 1 event, 71 hp samples) |
| Where was the surviving enemy queen? | **(36.5, 68.5)** — founded tick 3,029, `lostTick: null`, never damaged, in their southern half. Our nearest mark ever: 37.8 tiles. | CONFIRMED (n = 1) |
| How many enemy soldiers existed at the end? | **0 enemy ants of any caste.** No colony-0 ant is alive at or after tick 9,138: their last attack is 9,112, their last death 9,138, their last birth 8,906, and the evidenced colony-0 population is 0 from 9,138 to the end. Caste is not in the log, so "soldiers" cannot be counted; the unattributed bucket bounds the enemy at ≤56 ants. | CONFIRMED for 0 survivors (n = 0 alive colony-0 ants at 9,138 and 13,450); INFERRED for the ≤56 bound |

Two further server-recorded facts that bear on the win:

- `territoryWin` progress events (CONFIRMED, n = 3 attempts): colony 1 qualified at tick 9,145 and the run was cancelled at 9,802; qualified again at 9,893, cancelled at 10,101; the run that counted began at **10,451** and completed at **13,450** — exactly 300 s.
- The enemy held a live queen with an empty colony from tick 9,138 to the end; the 6× territory condition was met against zero enemy territory, so our own hold, not enemy ground, decided the clock.

## What the log cannot answer

- Per-caste population for either colony at any tick (no caste on births, deaths or fights).
- Which queen hatched a given ant (births carry no queen id), so hatch streams cannot be split once two queens are alive.
- Food store per colony, and therefore why colony 0's hatching stops at 8,906 (a food floor is the only consistent explanation, since its queen survived and the ant cap was far away — INFERRED).

## Correction to the match report now on `main`

`study/match-win-2026-11-05.md` (the Twin Shields report, then at `study/last-match.md`) makes two population claims from the in-match cell decode: "169 of our soldiers and 159 enemy soldiers in colony sight; enemy workers in sight 0" (line 24) and "the enemy army was 135–159 soldiers" (line 55). Both came from a decode that split ants by `antId % 2`; the log shows that rule matches the true colony for only 57.8% of the 2,003 evidenced ants, and 169 + 159 = 328 is exactly the log's total live-ant count, so the split was parity noise over the whole population, not a sight-limited census. The log's evidence-based end state is **0 colony-0 ants and 55 attributable colony-1 ants, plus 273 unattributed live ants** (217 of them colony-1 soldiers by hatch cadence). The report's result, timings, queen events and territory figures are unaffected and match this log.
