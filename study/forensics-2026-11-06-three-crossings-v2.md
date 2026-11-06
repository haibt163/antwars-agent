# Forensics — 2026-11-06 Three Crossings v2 win (match `2026-11-06T10-55-38-238Z-91455509329330`)

Read-only analysis of the public match log. **No match tool was called, no lobby/challenge/queue tool was called, and no identity key was read.** Every number below comes from the public match feed and the JSON log behind it.

**Match:** `2026-11-06T10-55-38-238Z-91455509329330`, started 2026-11-06T10:55:38.238Z, ended 2026-11-06T11:20:23.162Z, winner colony 1 (`omp-dolphin`), `queens_killed`, `tick: 14849`. Seats: colony 0 `antwars/gpt-6-1-terra-max-fast` (`openai/gpt-6.1-terra`, thinking `max`, tier `fast`, house bot), colony 1 `omp-dolphin`. Map Three Crossings v2 128×96, 18,000 ticks, colony cap 512, unrated 1v1. Rules `version: 27`.

**Source:** `GET https://antwars.ai/matches` (public feed) and `GET https://antwars.ai/matches/2026-11-06T10-55-38-238Z-91455509329330` → 200, 4,673,181 bytes, `format: antwar.match`, `version: 1`, `source: match-log`, `status: complete` — CONFIRMED. The only thing the feed marks unavailable is "calls refused before simulation (adapter validation, rate limits, post-match calls)".

**Command ticks vs reply ticks:** the log records the tick a command was applied on; the live replies reported the tick after processing. Most figures differ by one (8,203 in the log, 8,204 in the reply). I use the log's number and say so where it matters.

## 1. Every `queenFounded` and `queenLost` event (both colonies)

CONFIRMED, n = 6 foundings and 4 losses, all four losses in colony 0. Tile = (x, y) in the log's subunit coordinates ÷ 256, matching the tiles our observations showed.

| Queen | Tile | Founded | Lost | Peak HP seen | HP series |
|---|---|---|---|---|---|
| colony 0 **q0 — the start queen** | (29.5, 19.5) | 0 (setup) | **8,488** | 39,850 at 8,410 | 66 samples, 8,410 → 0 at 8,488 |
| colony 0 q1 | (38.5, 72.5) | 3,096 | **14,849** | 37,900 at 14,815 | 35 samples, 14,815 → 0 at 14,849 |
| colony 0 q2 | (4.5, 46.5) | 4,990 | **13,241** | 39,400 at 13,095 | 54 samples, 13,095 → 0 at 13,241 |
| colony 0 q3 | (1.5, 2.5) | 6,927 | **11,531** | 39,850 at 11,457 | 75 samples, 11,457 → 0 at 11,531 |
| colony 1 q0 | (110.5, 21.5) | 0 (setup) | — | 40,000 | no `queenHp` sample, no loss |
| colony 1 q1 | (110.5, 55.5) | 3,265 | — | 40,000 | no `queenHp` sample, no loss |
| colony 1 q2 | (110.5, 90.5) | 5,209 | — | 40,000 | no `queenHp` sample, no loss |
| colony 1 q3 | (77.5, 21.5) | 7,132 | — | 40,000 | no `queenHp` sample, no loss |

`rules.config.initialQueens` = `[[{"tileX": 29, "tileY": 19}], [{"tileX": 110, "tileY": 21}]]` — CONFIRMED. The (29,19) queen was the **enemy start queen**, not a forward queen: the question left open in the report and in strategy v5.2 is settled. The enemy founded **three extras** and lost all four queens.

**Which queens we ever had in sight** (agent run log, `observe.enemyQueens` — VERIFIED, not a public-log field): (29,19) at ticks 8,083 and 8,448 (40,000 → 30,100 mHP); (4,46) at 12,777 (40,000 mHP); (38,72) at 14,516 (40,000 mHP). The corner queen at **(1.5, 2.5) was never in sight**.

**Our marks within 6.5 tiles at each death** (CONFIRMED from `mark`/`markGone` events, Euclidean distance from mark tile to queen tile):

| Queen | Died | Nearest colony-1 mark at that tick | Distance |
|---|---|---|---|
| q0 (29,19) | 8,488 | mark 23, ATTACK soldier at (29,19) | 0.7 tiles |
| q1 (38,72) | 14,849 | mark 46, ATTACK soldier at (37,72) | 1.6 tiles |
| q2 (4,46) | 13,241 | mark 38, ATTACK soldier at (5,46) | 0.7 tiles |
| q3 (1.5,2.5) | 11,531 | **none** — nearest was mark 31 at (6,10), 8.8 tiles | — |

**How the corner queen died is only partly recoverable.** CONFIRMED: no colony-1 mark was within 6.5 tiles, no `fight` record of either colony falls within 2.5 tiles of her tile in the last 400 ticks, yet two colony-1 ants died within 1.2 and 1.5 tiles of her at ticks 11,477 and 11,497, and her HP fell 39,850 → 0 between 11,457 and 11,531. CONFIRMED for the other three: fights within 2.5 tiles in the last 400 ticks numbered 135 ours / 101 theirs at (29,19), 33 / 143 at (38,72), 20 / 11 at (4,46). **NOT AVAILABLE:** which ant landed any particular bite — the log has no per-bite record against queens, only the 230 `queenHp` samples. INFERRED: the corner kill came from ants drawn past a mark's 6-tile pursuit radius or passing through on a march, not from a mark laid on her.

## 2. `rules` values (CONFIRMED, quoted field names from `rules.config`)

| Field | Value | Note |
|---|---|---|
| `sightTiles` | **12** | what an ant sees; also the wording in the count_mark refusal, "within sight of a living ant" |
| `markReachTiles` | **20** | a separate knob; nothing in this log shows it gating placement |
| `smellTiles` | **16** | **display radius** — matches the live line "Colony marks within 16 tiles of any living colony ant" |
| `countMarks` | `{"recruitTiles": 16, "defendTiles": 6, "defendHolds": true, "casteSelection": true, "combatTotals": true, "recruitColonyWide": true, "placement": "colony_sight", "reportClaimAvailability": true}` | `placement: "colony_sight"` is the operative gate — **placement is sight-governed, 12 tiles** |
| `markLifetimeTicks` | **1,800** | 180 s |
| `attackRadiusTiles` | 6 | matches the "pursue within 6 tiles of the mark" behaviour |
| `colonyCap` | **512** | the cap for this seed, so "512 in sight" was the cap |
| `startAnts` | 30 per colony | 60 start ants (`antId` 1–60, no birth record) |
| `queenFounding` | `{"cost": 400, "costMultiplier": 2, "costBasis": "founded-live", "firstFoundTick": 3000, "cooldownTicks": 1800, "minDistanceTiles": 32, "houseReserveFood": 200, "standingNestsOnly": true, "guardsPerQueen": true, "totalGuardSharePermille": 600}` | price curve **400 → 800 → 1,600 → 3,200** by live founded queens |
| `queenHp` | `{"hp": 40000, "biteDamage": 4000, "biteIntervalTicks": 20, "regenHp": 1000, "regenIntervalTicks": 100, "regenClearTiles": 6, "shieldTicks": 3000}` | 40 HP; a bite is 4 HP per 20 ticks |

**This settles the "12 against 20" question.** Both numbers are real and mean different things: `markReachTiles` is 20, but count-mark *placement* is gated by `countMarks.placement: "colony_sight"` and therefore by `sightTiles` 12. The Open Field forensics' clause "within reach (markReachTiles 20)" describes no gate I can find in either log, and nothing in this match ever exercised a 20-tile reach. What `markReachTiles` 20 does gate is **NOT AVAILABLE** from the log. The display radius is 16 (`smellTiles`).

## 3. Early losses: the colony's 193 against one mark's 57

CONFIRMED (n = 2,910 death events, each carrying `colony`): colony 1 lost **193 ants by tick 3,725**; colony 0 lost **156** by the same tick.

Our first FORAGE mark (id 7, laid tick 2,804) reported `lost 57, kills 16` at tick 3,725 in the live reply. **That 57 is one mark's own counter, not the colony's losses.** The public log carries no per-mark loss or kill field at all — a `mark` record is `{id, agent, colony, tileX, tileY, words, laidTick, answered, verb, count, claimed, revision, caste}` — so 57 is VERIFIED from the run log only, and the ratio "57 workers to 11 enemy soldiers" is a statement about one mark, not about the colony's opening.

## 4. Mark mechanics as they actually ran

- **Free-soldier starvation at mark lay** (CONFIRMED): mark 23 laid at 8,203 claimed **5**; mark 35 at 12,222 claimed **0**; mark 37 at 12,833 claimed **0**.
- **The 175** (CONFIRMED, exact): at tick 12,833 the live colony-1 soldier ATTACK marks held `60 + 90 + 25 = 175` — mark 31 at (6,10) with 60, mark 34 at (16,40) with 90, mark 35 at (16,48) with 25. That is why a new mark claimed 0.
- **Expiry beats REMOVE** (CONFIRMED): mark 25 was laid at 9,544 with a 1,800-tick lifetime and went `markGone` at **11,343**; our `REMOVE` at **11,449** was refused `bad_mark_removal` — 106 ticks after it no longer existed. Redirecting a mark therefore costs two command slots and must happen before expiry.
- **The paging gap** (CONFIRMED): the observation that lost the (29,19) queen is at 8,741; the next command in the log is at 9,544 — a gap of **803 ticks**, and the whole 8,741–12,777 stretch with no queen in sight lasted 4,036 ticks (6.7 minutes). Eight `observe` history pages produced no enemy `queen_lost`, because the seat is never sent them; the public log has all four.

## 5. Population by colony (births minus deaths)

Live ants at tick *t* = 60 start ants + births ≤ *t* − deaths ≤ *t*. Totals are exact (CONFIRMED, n = 3,362 births, 2,910 deaths, 60 start ants, 0 duplicate ids, 0 deaths before birth). The **split** is not exact: 187 of the 3,422 ants that ever existed (5.5%) carry no colony in any record, so each colony gets a range whose width is the unattributed ants alive at that tick. Both colonies are capped at 512, so ranges clip there.

| Tick | Colony 0 (live) | Colony 1 (live) | Unattributed alive | Total live |
|---|---|---|---|---|
| 5,000 | 169 [169–174] | 286 [286–291] | 5 | 460 |
| 8,741 | 60 [60–91] | 362 [362–393] | 31 | 453 |
| 12,000 | 18 [18–139] | 391 [391–512] | 121 | 530 |
| 14,500 | 24 [24–184] | 352 [352–512] | 160 | 536 |

CONFIRMED for the totals and the attributed columns; the brackets are the range implied by the unattributed ants (INFERRED bound, not a measurement). Cross-check: our in-sight census at 8,741 read 275 workers + 117 soldiers = **392**, inside the log's colony-1 range [362–393]; at 14,516 the census read 355 + 157 = **512**, at the cap. Total live peaked at 665 around the middle of the match and never approached 1,024, so the two colonies were never both at their caps.

**Caste: NOT AVAILABLE.** No `birth`, `death` or `fight` record carries a caste (n = 3,362 / 2,910 / 36,338). Caste exists only on mark requests and `mark` records.

## 6. Statements in `study/last-match.md` now superseded

Listed only; that file is not edited here.

1. **Line 74–76** — "The individual death ticks of the three enemy queens were never reported — enemy `queen_lost` events are not surfaced to the opposing seat — so each death is inferred from the queen leaving sight with our ants on her tile; only the final `queens_killed` verdict is server-confirmed."
   Superseded twice: there were **four** enemy queens, not three, and the log carries every death tick — 8,488 / 11,531 / 13,241 / 14,849.
2. **Line 77** — "The 512-ant in-sight reading at tick 13,313 happens to equal the smallest published colony cap, but the cap for this seed was not read (UNVERIFIED)."
   Superseded: `colonyCap` is **512** in `rules.config`; the reading was the cap.
3. **Lines 67–69** — "Enemy queen at (4,46): 40,000 mHP at tick 12777 — near the west map edge, 4 tiles in from x0, not at the box centre and not the mirror of our (110,21). An ATTACK mark was laid on (5,46) at tick 13084 and she was out of sight by 13313."
   Superseded: she **died at 13,241**, and she was an **extra founded at 4,990** — the report does not say which queen she was.
4. **Lines 62–64** — "Enemy queen at (29,19): … out of sight by tick 8741 with the mark credited 98 kills, while our ants held the tile."
   Superseded: she was the **start queen** (`initialQueens`) and **died at 8,488**, one tick-nameable event before the 8,741 observation.
5. **Lines 70–71** — "ATTACK 100 was laid on (37,72) at tick 14679".
   Cosmetic: the log records the mark at **14,678**; 14,679 is the reply tick. Same one-tick convention as elsewhere.
