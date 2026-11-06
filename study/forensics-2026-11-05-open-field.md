# Forensics — 2026-11-05 Open Field win (match `2026-11-05T12-56-14-256Z-108637210829950`)

Read-only analysis of the public match log. **No match tool was called, no lobby/challenge/queue tool was called, and no identity key was read.** Every number below comes from the public match feed and the JSON log behind it.

**Match:** `2026-11-05T12-56-14-256Z-108637210829950`, started 2026-11-05T12:56:14.256Z, ended 2026-11-05T13:26:14.238Z, winner colony 1 (`omp-dolphin`), `time_up`, `decidedBy: kills`, `tick: 17999`. Seats: colony 0 `antwars/gpt-6-1-terra-max-fast` (`openai/gpt-6.1-terra`, thinking `max`, service tier `fast`, house bot), colony 1 `omp-dolphin`. Map Open Field 128×96, 18,000 ticks, colony cap 512, unrated 1v1. Rules `version: 27`; `colonyCap: 512`, `startAnts: 30`, `hatchIntervalTicks: 10` with `hatchTiming.soldierIntervalMultiplier: 2`, `markLifetimeTicks: 1,800`, `queenHp: {hp: 40,000, regenHp: 1,000, regenIntervalTicks: 100, regenClearTiles: 6}`, `earlyWin: {minTick: 6,000, holdTicks: 3,000, territoryRatioPermille: 6,000, minHeldTiles: 100}`, `adjudication: "kills-first"`.

**Source:** `GET https://antwars.ai/matches` (paged back through the public feed to this match) and `GET https://antwars.ai/matches/2026-11-05T12-56-14-256Z-108637210829950` → 200, 6,851,488 bytes, `format: antwar.match`, `version: 1`, `source: match-log`, `status: complete` — CONFIRMED. The only thing the feed marks unavailable is "calls refused before simulation (adapter validation, rate limits, post-match calls)"; 20 in-simulation refusals are recorded (see §3).

**Labels.** `CONFIRMED` = read directly from a log field or counted over log events, with n. `INFERRED` = my derivation from those fields, with the rule used. `NOT AVAILABLE` = the field does not exist in the public log.

**Log inventory (CONFIRMED, n = 67,031 events):** 54,205 `fight`, 4,723 `birth`, 4,244 `death`, 3,158 `mark`, 365 `call`, 229 `queenHp`, 63 `markGone`, 20 `territoryWin`, 14 `order`, 5 `queenFounded`, 2 `queenLost`, 2 `join`, 1 `end`.

**Field shapes (CONFIRMED).** `birth` = `{kind, antId}`; `death` = `{kind, antId, colony, x, y}`; `fight` = `{kind, antId, targetId, colony, tileX, tileY}`; `queenFounded`/`queenLost` = `{kind, queen}`; `queenHp` = `{kind, colony, queenId, hp}`; `mark` = `{kind, mark}`; `markGone` = `{kind, markId}`; `territoryWin` = `{kind, progress}`; `order` = `{kind, agent, order, tileX, tileY, intent}`; `call` = `{kind, agent, call, accepted, houseActivityTick}`; `end` = `{kind, result}`. A `death` position is 1/256-tile fixed point; a `fight` position is a whole tile.

**Method note.** `death.colony` is the colony of the ant that died, and `fight.colony` is the attacker's colony: checked against every death record, 0 contradictions in 4,516 ants. That gives a colony for 4,516 of the 4,783 ant ids; the remaining 267 ants never attack, are never attacked and never die, so their colony is unknown (see §2). Coordinates are not in the same units: a `fight` carries integer tiles, a `death` carries 1/256-tile fixed point — mixing the two silently moves every position by a factor of 256, which is the one trap in this log. In this log a fight's tile is the attacker's position (±1 tile: 68.4% of 852 attacker-fight/death pairs agree within 1 tile, mean error 0.83 tiles) — INFERRED, and used as a position proxy in §4. Ant-id parity is **not** a colony code here either: `antId % 2 == colony` holds for 2,043 of 4,516 ants (45.2%).

## 1. Every `queenFounded` and `queenLost` event (both colonies)

| Tick | Event | Colony | Queen | Tile | HP (mHP) |
|---|---|---|---|---|---|
| 0 | setup (start queen) | 0 | 0 | (19.5, 17.5) | 40,000 |
| 0 | setup (start queen) | 1 | 0 | (110.5, 23.5) | 40,000 |
| 3,046 | `queenFounded` | 1 | 1 | (111.5, 56.5) | 40,000 |
| 3,302 | `queenFounded` | 0 | 1 | (52.5, 30.5) | 40,000 |
| 4,874 | `queenFounded` | 1 | 2 | (111.5, 90.5) | 40,000 |
| 5,667 | `queenFounded` | 0 | 2 | (44.5, 62.5) | 40,000 |
| 10,323 | `queenLost` | 0 | 1 | (52.5, 30.5) | 0 |
| 11,948 | `queenLost` | 0 | 2 | (44.5, 62.5) | 0 |
| 13,416 | `queenFounded` | 0 | 3 | (12.5, 49.5) | 40,000 |

CONFIRMED (n = 5 `queenFounded`, 2 `queenLost`, 2 setup queens from `setup.initialQueens` = `[[{19,17}], [{110,23}]]`).

**Did any enemy queen die? Yes — two, both colony 0.** Our colony lost **no** queen (`queenLost` for colony 1: 0 events; `queenHp` for colony 1: 0 samples), so "No queen was lost by either side" in `study/match-win-2026-11-05-open-field.md` is wrong on the enemy half. What killed them:

| Enemy queen | Tile | Founding | First damage | Death | Evidence |
|---|---|---|---|---|---|
| 1 (forward) | (52.5, 30.5) | 3,302 | 6,867 (39,850) | 10,323 | our ATTACK mark 37 at (52,30) laid tick 9,983, 60 soldiers claimed; damage ran 10,284 → 10,323 with 15 of our ants fighting within 2.5 tiles of her (105 fights, 0.71–2.12 tiles) (CONFIRMED for the fights and the damage, INFERRED for the mark link) |
| 2 (south) | (44.5, 62.5) | 5,667 | 11,854 (39,800) | 11,948 | our ATTACK mark 38 at (51,55) laid 10,425, 50 soldiers, alive to 12,224 — 9.9 tiles from her; 6 of our ants fought within 2.5 tiles of her tile between 11,876 and 11,936 (minimum 1.58 tiles), so the attackers were at her feet (CONFIRMED fights; INFERRED that mark 38's soldiers were the ones that reached her) |

Enemy queen coverage by period (CONFIRMED): 0–3,301 start (19.5,17.5); 3,302–5,666 + (52.5,30.5); 5,667–10,322 + (44.5,62.5); 10,323–11,947 start + south; 11,948–13,415 start only; 13,416–17,999 start + (12.5,49.5).

Damage windows from `queenHp` (CONFIRMED): forward queen 39,850 at 6,867 → 2,650 at 7,307 (n = 176 samples), 9,650 at 9,894 → 0 at 10,323; south queen 39,800 at 11,854 → 0 at 11,948 (n = 53). Our three queens took no recorded damage at all.

Our own founding record (CONFIRMED, from the colony-1 command list): refused `queen_too_early` at 2,941 (111,56) with `nextAllowedTick: 3000`; founded at (111,56) on 3,046; refused `queen_cooldown` at 4,805 (111,90) with `nextAllowedTick: 4846`; founded at (111,90) on 4,874. The enemy's two refusals were both `queen_tile_not_held` (3,147 at (44,38), 5,314 at (58,62)); its three foundings were at (52,30), (44,62) and (12,49).

## 2. Population by colony and caste (births minus deaths)

Best available count: live ants at tick *t* = 60 start ants + births ≤ *t* − deaths ≤ *t*. Totals are exact (CONFIRMED, n = 4,723 births, 4,244 deaths, 60 start ants, 0 duplicate ids, 0 deaths before birth). The **split** by colony is not exact: 267 ants (5.6%) have no recorded colony, so each colony gets a range whose width is the number of unattributed ants alive at that tick. Both colonies are hard-capped at 512, so ranges are clipped at 512.

| Tick | Colony 0 (live) | Colony 1 (live) | Unattributed alive | Total live |
|---|---|---|---|---|
| 6,000 | 290 [290–290] | 485 [485–485] | 0 | 775 |
| 9,000 | 142 [142–143] | 320 [320–321] | 1 | 463 |
| 11,857 | 24 [24–49] | 359 [359–384] | 25 | 408 |
| 12,600 | 44 [44–93] | 462 [462–511] | 49 | 555 |
| 14,395 | 165 [165–228] | 449 [449–512] | 63 | 677 |
| 14,400 | 166 [166–229] | 449 [449–512] | 63 | 678 |
| 17,900 | 59 [59–301] | 253 [253–495] | 242 | 554 |
| 17,999 (end) | 39 [39–306] | 233 [233–500] | 267 | 539 |

CONFIRMED for the totals and for the attributed columns; the brackets are the range implied by the unattributed ants (INFERRED bound, not a measurement). Read it as: **at tick 12,600 our colony was at 462–511 ants and the enemy at 44–93**; at 14,395 ours was 449–512 (the cap is reachable) and the enemy 165–228; at the end ours was 233–500 and the enemy 39–306. The population was not monotonic: both colonies were at 775 total at 6,000, fell to 408 at 11,857 (the mid-match slaughter), and rebuilt to 677 by 14,395.

**Caste: NOT AVAILABLE.** No `birth`, `death` or `fight` record carries a caste (n = 4,723 / 4,244 / 54,205). Caste appears only on `count_mark` requests and the resulting `mark` records, i.e. as a property of a mark, never of an ant. So "population by caste" cannot be counted from this log the way "population by colony" can, and every per-caste figure in our reports remains an estimate. What the log does pin down is the **brood schedule**, which decides what each hatch is (CONFIRMED, from accepted `set_brood` calls):

| Tick | Colony 1 queens | Colony 0 queens | Max hatch rate (per tick) C1 / C0 |
|---|---|---|---|
| 6,000 | q0 mixed, q1 soldiers, q2 workers | q0 soldiers, q1 workers, q2 workers | 0.25 / 0.25 |
| 9,000 | q0 soldiers, q1 soldiers, q2 workers | q0 soldiers, q1 soldiers, q2 workers | 0.20 / 0.20 |
| 12,600 | q0 soldiers, q1 soldiers, q2 workers | q0 soldiers (only queen alive) | 0.20 / 0.05 |
| 14,400 | q0 soldiers, q1 soldiers, q2 workers | q0 soldiers, q3 workers | 0.20 / 0.15 |
| 17,900 | q0 soldiers, q1 soldiers, q2 soldiers | q0 soldiers, q3 soldiers | 0.15 / 0.10 |

Brood changes, colony 1 (CONFIRMED, accepted `set_brood` ticks): q0 workers 80 → mixed 1,404 → soldiers 7,279; q1 soldiers 3,076 (founded 3,046); q2 workers 4,896 (founded 4,874) → soldiers 16,137. Colony 0: q0 workers 363 → soldiers 1,252 → mixed 11,813 → soldiers 12,478; q1 soldiers 6,402 (lost 10,323); q2 soldiers 7,482 → workers 7,995 → mixed 10,669 → soldiers 11,130 (lost 11,948); q3 workers 13,469 → soldiers 15,949.

Consequences that the log does support (INFERRED unless stated):

- Hatch cadence is CONFIRMED: workers every 10 ticks, soldiers every 20 (`hatchIntervalTicks` 10 × `soldierIntervalMultiplier` 2), so a worker queen out-produces a soldier queen two to one. In colony 1's two-soldier-queen phase (7,279–16,137) the births concentrate on two residues exactly 20 apart at mod 20 — 514 at 16 and 243 at 6 out of 1,233 attributed births — which is what two 20-tick streams look like (INFERRED: the residue split identifies streams, not individual ants).
- Hatch-interval decoding cannot turn that into a per-ant caste: after tick 4,896 colony 1 ran two 10-tick worker streams at different phases, and hatching pauses (food-limited, or at the cap) shift the phase, so a birth's residue no longer identifies its queen. Colony-1 births between 4,874 and 7,279 fall on residues 0 (160) and 6 (360) mod 10 — consistent with two worker streams, not one.
- After 16,137 all three of our queens were on soldiers, so every colony-1 hatch from then on is a soldier (CONFIRMED for the brood, INFERRED for the ant). The colony was at or near the cap for that whole stretch (14,395: 449–512; 17,900: 253–495), so those hatches only replaced the dead — 472 colony-1 deaths between 14,000 and 17,999 against ~450 colony-1 births in the same window (CONFIRMED deaths; births partly inside the unattributed bucket).
- Hatch-capacity weighting (INFERRED, weak): if unattributed births are split in proportion to each colony's maximum hatch rate at the birth tick, about 60% belong to colony 1. That would put 17,900 at roughly 400 ours and 150 enemy — but food limits hatching, so this is a direction, not a count.

**Against the in-sight census in `study/match-win-2026-11-05-open-field.md`:** the census total of 511 at tick 12,600 (386 workers + 125 soldiers) equals this log's *upper* bound for colony 1 at that tick (462 + 49), i.e. it is consistent only if every unattributed ant was ours — and then it is a colony-wide count, not a sight-limited one. At the end the census read 445 (359 + 86) against a log range of 233–500, which is consistent but proves nothing. At tick 11,857 the census reading of **510 cannot be right**: the whole match held only 408 live ants at that tick (both colonies), and ours was 359–384.

## 3. Our ATTACK marks

18 ATTACK marks were laid by colony 1, every one of them `caste: soldier` (CONFIRMED, from 3,158 `mark` records grouped by `id`+`revision`). A mark is re-emitted as its claim fills; `count` is the requested strength and `claimed` is the strength actually taken. `answered` is **0 in every mark record in the log** (n = 3,158), so the answered count is `NOT AVAILABLE`; `claimed` is the only measure of what answered. "End" is the `markGone` tick, or the 1,800-tick lifetime where the mark was never removed. The last two columns are deaths of each colony within 6 tiles of the mark tile during the mark's life (INFERRED: deaths are the only per-ant positions in the log; the fight tile is the attacker's position ±1 tile).

| Mark | Laid | Tile | Requested | Claimed | End | Our kills (deaths of colony 0 ≤6 tiles) | Our losses (deaths of colony 1 ≤6 tiles) |
|---|---|---|---|---|---|---|---|
| 19 | 5,200 | (99, 23) | 60 | 60 | 5,474 (removed) | 0 | 0 |
| 20 | 5,349 | (90, 22) | 60 | 60 | 5,753 (removed) | 0 | 0 |
| 21 | 5,619 | (79, 21) | 60 | 60 | 6,006 (removed) | 0 | 0 |
| 22 | 5,888 | (70, 20) | 60 | 60 | 6,265 (removed) | 0 | 0 |
| 24 | 6,135 | (61, 18) | 60 | 60 | 6,499 (removed) | 4 | 31 |
| 25 | 6,370 | (53, 16) | 60 | 60 | 6,681 (removed) | 0 | 5 |
| 27 | 6,830 | (52, 24) | 60 | 60 | 8,137 (removed) | 51 | 70 |
| 28 | 6,958 | (52, 29) | 60 | 60 | 8,245 (removed) | 83 | 100 |
| 29 | 7,251 | (52, 30) | 60 | **0** | 7,971 (removed) | 53 | 48 |
| 33 | 8,909 | (66, 25) | 40 | 40 | 9,233 (removed) | 10 | 22 |
| 35 | 9,350 | (52, 30) | 70 | **40** | 9,624 (removed) | 38 | 28 |
| 37 | 9,983 | (52, 30) | 60 | 60 | 10,673 (removed) | 90 | 64 |
| 38 | 10,425 | (51, 55) | 50 | 50 | 12,224 (removed) | 73 | 133 |
| 45 | 12,143 | (44, 60) | 30 | 30 | 13,942 (removed) | 0 | 0 |
| 51 | 13,822 | (45, 60) | 24 | 24 | 15,621 (removed) | 4 | 22 |
| 59 | 15,160 | (38, 55) | 40 | 40 | 16,959 (removed) | 99 | 110 |
| 60 | 15,440 | (36, 60) | 30 | 30 | 17,239 (removed) | 92 | 69 |
| 64 | 16,839 | (28, 50) | 40 | 40 | 17,999 (match end) | 165 | 189 |

- Simultaneous ATTACK strength (CONFIRMED, sum of `claimed` over live ATTACK marks, 100-tick steps): **maximum 120 ants**, reached during the westward push (ticks 5,400–8,100). After tick 12,000 the maximum was **80** and the mean 32 (12,000–15,000) and 62 (15,000–18,000). Our marks were never bigger than 120 soldiers while the colony held 500+ ants.
- Marks are cheap to lose: mark 38 at (51,55) ran 1,799 ticks and took 133 of our ants for 73 enemy deaths; mark 27 at (52,24) took 70 for 51. Only four marks finished with more enemy deaths than our losses inside 6 tiles — 29 (53/48), 35 (38/28), 37 (90/64) and 60 (92/69) — and all four were marches onto enemy ground, not defences.
- All 21 DEFEND marks were also soldier caste except six worker marks at (90,25), (90,50), (90,75), (91,25), (91,50), (91,75) (12–20 ants each, ticks 11,606–13,700) — worker-priced ground holding, not queen guards. There was one FORAGE mark (24 ants at (105,22), tick 149) and three LINE marks (20–24 ants, ticks 14,218–14,876).
- **Per-mark kill credits: NOT AVAILABLE.** A `mark` record carries `count`, `claimed`, `caste`, `revision`, `laidTick` — no kills, no losses. The colony-wide death deltas between our `count_mark` calls are a different series (largest +143 kills / +116 losses, at tick 16,839) and match none of the report's figures, so `study/match-win-2026-11-05-open-field.md`'s "credited 99, 89 and 118 enemy kills while losing 193, 53 and 84 ants" cannot be reproduced from the public log, and its "three ATTACK marks aimed at that nest" is wrong: the nest at (52,30) was marked **five** times (7,251, 9,350, 9,983 — and (52,24)/(52,29) before that), and the queen died during mark 37, not before it.
- Command budget: 20 refusals in the whole match (CONFIRMED) — colony 1: 9 `count_mark` `rate_limited`, 4 `count_mark_not_visible`, 3 `order` `rate_limited`, 1 `found_queen` `queen_too_early`, 1 `found_queen` `queen_cooldown`; colony 0: 2 `found_queen` `queen_tile_not_held`. The archive's "624 `rate_limited` refusals" do not repeat here because we paced the commands.

## 4. The queen at (52.5, 30.5): every `queenHp` sample

All 176 samples (tick:mHP; 40,000 = 40 HP) — CONFIRMED, colony 0 queen 1, founded tick 3,302, lost tick 10,323:

```text
6,867:39,850 7,162:39,550 7,163:39,250 7,164:38,950 7,165:38,650 7,166:38,350 7,167:38,050 7,168:37,750 7,169:37,450 7,170:37,000
7,171:36,550 7,172:36,100 7,174:35,950 7,175:35,800 7,176:35,350 7,177:34,900 7,178:34,450 7,179:34,000 7,180:33,550 7,181:33,100
7,182:32,650 7,183:32,500 7,184:32,350 7,185:32,200 7,186:31,750 7,187:31,300 7,188:30,850 7,189:30,400 7,190:29,950 7,191:29,500
7,192:29,050 7,194:28,600 7,195:28,150 7,196:27,700 7,197:27,250 7,198:26,800 7,199:26,350 7,200:25,900 7,201:25,450 7,202:25,000
7,203:24,550 7,204:24,100 7,205:23,650 7,206:23,200 7,207:22,750 7,208:22,300 7,209:21,850 7,210:21,400 7,211:20,950 7,212:20,500
7,214:20,350 7,215:19,900 7,216:19,750 7,217:19,600 7,218:19,450 7,219:19,300 7,220:19,150 7,221:19,000 7,222:18,850 7,223:18,700
7,224:18,550 7,225:18,400 7,226:18,250 7,227:18,100 7,228:17,950 7,229:17,800 7,230:17,650 7,231:17,500 7,232:17,350 7,234:17,200
7,235:16,750 7,236:16,300 7,237:15,850 7,238:15,400 7,239:14,950 7,240:14,500 7,241:14,050 7,242:13,600 7,243:13,150 7,244:12,700
7,245:12,250 7,246:11,800 7,247:11,350 7,248:11,050 7,249:10,900 7,250:10,750 7,251:10,600 7,252:10,450 7,254:10,300 7,255:10,150
7,256:10,000 7,257:9,850 7,258:9,700 7,259:9,550 7,260:9,400 7,261:9,250 7,262:9,100 7,263:8,950 7,264:8,800 7,265:8,650
7,266:8,500 7,267:8,350 7,268:8,200 7,269:8,050 7,270:7,900 7,271:7,750 7,272:7,600 7,274:7,450 7,275:7,300 7,276:7,150
7,277:7,000 7,278:6,850 7,279:6,700 7,280:6,550 7,281:6,400 7,282:6,250 7,283:6,100 7,284:5,950 7,285:5,800 7,286:5,650
7,287:5,500 7,288:5,350 7,289:5,200 7,290:5,050 7,291:4,900 7,292:4,750 7,294:4,600 7,295:4,450 7,296:4,300 7,297:4,150
7,298:4,000 7,299:3,850 7,300:3,700 7,301:3,550 7,302:3,400 7,303:3,250 7,304:3,100 7,305:2,950 7,306:2,800 7,307:2,650
8,479:3,650 8,579:4,650 8,679:5,650 8,779:6,650 9,040:7,650 9,140:8,650 9,894:9,650 10,284:9,500 10,287:9,350 10,288:9,200
10,289:8,900 10,290:8,600 10,291:8,300 10,292:8,000 10,297:7,850 10,299:7,700 10,300:7,550 10,301:7,250 10,302:6,950 10,303:6,650
10,304:6,500 10,305:6,200 10,306:6,050 10,307:5,600 10,308:5,300 10,309:4,850 10,310:4,250 10,311:3,650 10,312:3,500 10,315:3,050
10,317:2,750 10,319:2,150 10,320:1,850 10,321:1,400 10,322:650 10,323:0
```

Shape of the series (CONFIRMED): first seen 39,850 mHP at tick 6,867; struck down to **2,650 mHP minimum at 7,307** (36,900 mHP lost between 7,162 and 7,307, i.e. ~254 mHP/tick once the mass arrived, and she was already down 300 mHP by 7,162); then **seven** regen steps of +1,000 mHP each — 3,650 at 8,479, 4,650 at 8,579, 5,650 at 8,679, 6,650 at 8,779, 7,650 at 9,040, 8,650 at 9,140, 9,650 at 9,894 — then damage from 10,284 (9,500 → 0 in 39 ticks, ~244 mHP/tick) and death at 10,323. Total regeneration = +7,000 mHP (7 HP) over 2,587 ticks. The rule is `regenHp: 1,000` per `regenIntervalTicks: 100`, so at most 26 regen events could have fired in that span and **7 did** (INFERRED): the 6-tile condition was satisfied at about 7 of 26 checks, not for a quarter of the wall clock. Continuous clear ground would have been +25,870 mHP.

Ticks at which no enemy ant was within 6 tiles — the log has **no position track** (positions exist only at a `fight`, in integer tiles, or a `death`, in 1/256 tile), so this is bounded, never measured:

1. From the rule, each +1,000 step is a tick at which the 6-tile condition held (CONFIRMED as an effect, not as a position), and the sample tick is the regen tick: 8,479, 8,579, 8,679, 8,779, 9,040, 9,140, 9,894.
2. From positions, our ants were recorded within 6 tiles at these ticks (CONFIRMED as presence; absence is *not* evidence of absence): 6,867–6,935, 6,957–7,327, 7,350–7,494, 7,518–8,262, 8,284–8,404, 8,491–8,547, 8,745–8,760, 8,791–8,961, 9,106–9,113, 9,223–9,794, 9,836–9,884, 9,928–9,978, 10,022–10,070, 10,098–10,323. That is **1,655 contact ticks out of 3,161** between 7,162 and 10,323 (52%): our ants were near her about half the time, and continuously from 10,098 to her death.

Every one of the seven regen ticks falls inside one of the recorded no-contact gaps — 8,404–8,491 (87 ticks) for 8,479; 8,547–8,745 (198) for 8,579 and 8,679; 8,760–8,791 (31) for 8,779; 8,961–9,106 (145) for 9,040; 9,113–9,223 (110) for 9,140; 9,884–9,928 (44) for 9,894 (INFERRED: consistent, and it shows the check reads contact at the regen tick rather than requiring a 100-tick clear run — at 8,479 an ant was recorded 4.5 tiles out only 18 ticks later). **Bottom line: she was in contact about half the time, recovered 7 HP in 259 s, and died on the next sustained strike.**

Who killed her (CONFIRMED): 15 distinct colony-1 ants fought within 2.5 tiles of her tile between 10,284 and 10,323 (105 fights, at 0.71–2.12 tiles); the first colony-1 fight within 2.5 tiles of her was at tick 6,812 and the last at 10,557. The same test on the south queen at (44.5,62.5) finds 6 of our ants fighting within 2.5 tiles of her between 11,876 and 11,936, minimum distance 1.58 tiles — she was killed at her feet too, not by a stray.

## 5. Territory

**Territory share per tick: NOT AVAILABLE.** The public log has no territory state, no status snapshots and no per-tick share for either colony; `territoryWin` is the only territory record, and it reports qualifying runs only.

The 6× condition itself (our share ≥ 6.0× the enemy's; `territoryRatioPermille: 6,000`) was met in **ten** windows, all ours, each as a `territoryWin` progress record with `startTick` and the `winTick` it would have completed at (+2,999 ticks), and a following `progress: null` when the run was cancelled (CONFIRMED, n = 20 records = 10 runs):

| Run | Start tick | Cancelled / ended | Duration (ticks) | Duration (s) |
|---|---|---|---|---|
| 1 | 10,892 | 11,272 | 380 | 38.0 |
| 2 | 11,388 | 11,390 | 2 | 0.2 |
| 3 | 11,394 | 12,015 | 621 | 62.1 |
| 4 | 12,016 | 12,017 | 1 | 0.1 |
| 5 | 12,244 | 13,952 | **1,708** | **170.8** |
| 6 | 16,146 | 16,540 | 394 | 39.4 |
| 7 | 16,978 | 17,071 | 93 | 9.3 |
| 8 | 17,076 | 17,079 | 3 | 0.3 |
| 9 | 17,080 | 17,086 | 6 | 0.6 |
| 10 | 17,572 | 17,999 (match end) | 427 | 42.7 |

The longest hold was 1,708 ticks = 170.8 s, 1,292 ticks short of the 3,000-tick (300 s) requirement; the last run was still in progress when the clock ran out. So "the 6× ratio was crossed several times but never held 300 s" is CONFIRMED, and the reason the match ended `time_up` is visible: the ratio flipped on and off around our army's movements (runs 2, 4, 8 and 9 lasted 1–6 ticks). The report's own share path (34/34 at 350 … 353/47 at 17,892 … 339/48 at 18,000) comes from the run log, not from this file, and the 17,892 reading falls inside run 10 (17,572 onward) — consistent.

## 6. Kill totals

The log **does** give per-colony kill totals, via `death.colony` (CONFIRMED, n = 4,244 deaths):

| | Colony 0 deaths (= colony 1 kills) | Colony 1 deaths (= colony 0 kills) |
|---|---|---|
| Total | **2,139** | **2,105** |

Margin **+34 for us**, winner colony 1 with `decidedBy: kills` — consistent with `adjudication: "kills-first"`. Combat attribution of deaths: 4,242 of 4,244 ants were the target of a `fight` within the 400 ticks before they died (an ant dies after ~4 s of sustained damage); the two exceptions are colony-1 ants 2,485 (died 11,251) and 1,813 (died 11,854), cause not recorded. So the totals are ±2 at worst and the 34-kill margin is safe.

Deaths per 2,000 ticks (CONFIRMED), colony 0 / colony 1: 44/30, 93/71, 155/148, 546/622, 337/370, 369/311, 52/81, 266/222, 277/250. The attrition peaked between 6,000 and 8,000, where 1,168 ants died in 200 s and the total population fell from 775 to ~460.

**Per-mark credits are still NOT AVAILABLE** (§3), so the per-mark ledger the strategy asks us to keep cannot be rebuilt from this log; the colony-wide death counts above can, but only after the match.

## Settled questions

| Question | Answer | Label |
|---|---|---|
| Did any enemy queen die? | Yes — two, both colony 0: (52.5,30.5) at tick 10,323 and (44.5,62.5) at tick 11,948. None of ours was lost or damaged. | CONFIRMED (n = 2 `queenLost`, 0 for colony 1; 0 `queenHp` samples for our queens) |
| Did the queen at (52,30) survive the match, as the report says? | No. She went to 0 HP at tick 10,323, during the (52,30) mark laid at 9,983 (damage 10,284 → 10,323; 15 of our ants fought within 2.5 tiles of her). | CONFIRMED (n = 176 hp samples, 1 `queenLost`) |
| How many ants did each colony have? | Exact totals; the colony split is a range because 267 ants have no recorded colony. 12,600: ours 462–511, enemy 44–93. 14,395: ours 449–512, enemy 165–228. | CONFIRMED totals, INFERRED split |
| How many soldiers did each colony have? | Unknown per ant — no caste in births, deaths or fights. The brood schedule is known; every ATTACK mark was soldier-caste and capped at 60–70 requested (120 on the map at once). | NOT AVAILABLE |
| Was the 512 cap reached? | Reachable from tick 12,606 (first tick the upper bound hits 512); at 14,395 ours was 449–512. It was **not** at 11,857. | CONFIRMED bound |
| Did the 6× ratio ever hold 300 s? | No. Ten runs, longest 1,708 ticks (170.8 s). | CONFIRMED (n = 10 runs) |
| What decided the match? | Kills: 2,139 to 2,105, margin 34. | CONFIRMED (n = 4,244 deaths) |
| Our biggest simultaneous attack | 120 soldiers on ATTACK marks (ticks 5,400–8,100); 80 at most after tick 12,000. | CONFIRMED (sum of `claimed`) |

## What the log cannot answer

- Caste of any individual ant or the caste composition of either colony at any tick (no caste field anywhere; hatch-cadence decoding breaks once two queens of one colony hatch concurrently and hatching pauses).
- Which colony an unattributed ant belongs to (267 ants never fight, are never attacked and never die).
- **Food store** for either colony, and therefore the 5,543 at 14,049 and 8,780 at the end: NOT AVAILABLE.
- **Territory share per tick**, and the number of held tiles behind each 6× run: NOT AVAILABLE.
- **Per-mark kill and loss credits**: NOT AVAILABLE; only colony-wide death counts can be rebuilt.
- The `answered` count on any mark: the field exists but is 0 in all 3,158 records.
- Positions of ants except at a fight or a death, so "no enemy within 6 tiles" is bounded, never measured (§4).

## Corrections to the reports now on `main`

This PR changes exactly one sentence in `study/match-win-2026-11-05-open-field.md` (the conditional fix agreed for this task): "No queen was lost by either side." became a sentence naming our zero losses and the enemy's two. Four other statements in that file are contradicted by the log and were **left untouched** because the task froze everything except that one sentence:

- line 60: "She survived the match." — she died at tick 10,323.
- line 65: "510 ants in sight at tick 11,857" — the whole match held 408 live ants at that tick; ours was 359–384.
- lines 60–61: "The three ATTACK marks aimed at that nest … credited 99, 89 and 118 enemy kills while losing 193, 53 and 84 ants" — five marks were aimed at that nest, and the public log records no per-mark credits, so those numbers are not reproducible.
- lines 72–74: "the forward queen at (52,30) survived because her 40 HP plus 1 HP/10 s regeneration outlasted every strike" — she regenerated 7 HP in total and died on the next strike.
