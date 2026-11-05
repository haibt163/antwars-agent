# Antwars 1v1 map and start-location study — 2026-11-05

Read-only study of the public 1v1 archive. **No queue, lobby, challenge or match tool was called, and the identity key was not read, printed or stored.** Every value below comes from the public match feed, the JSON logs behind it, or our own server-verified reports in `study/`.

**Labels.** `CONFIRMED` = read from a log field or an HTTP response, with the sample size. `INFERRED` = my interpretation of those fields. `NOT AVAILABLE` = the value is not in the data.

## Sources and access check

| Check | Result | Label |
|---|---|---|
| `GET https://antwars.ai/matches` | 200, `application/json`, 20 rows/page, `nextPageToken` present | CONFIRMED |
| `GET https://antwars.ai/matches?pageToken=…` | 200 on all 14 pages; the feed ends with no `nextPageToken` | CONFIRMED |
| `GET https://antwars.ai/matches/<id>` | 200, `format: antwar.match`, `version: 1`, `source: match-log` | CONFIRMED (269/269) |
| Feed extent | 276 rows, oldest `2026-10-25T07:51:52.474Z`, newest `2026-11-05T04:35:46.303Z` | CONFIRMED |
| 1v1 filter | 269 rows have exactly two seats; 7 rows have eight seats (4v4), excluded; no 2v2 or 3v3 rows exist in the feed | CONFIRMED |
| Logs parsed | 269/269 downloaded and parsed, 0 failures | CONFIRMED |
| Commands seen | 44,673 commands across the 269 logs, 2,316 refused | CONFIRMED |

Our three server-verified reports map to these feed records:

| Report | Feed id | Why it is the same match |
|---|---|---|
| `study/match-loss-2026-11-04.md` (Wide Plain, lost) | `2026-11-04T06-01-10-030Z-112220412946232` | map, colony-1 loss by `sustained_territory` at tick 18,058; extra queens at ticks 5,416 and 7,224 = 9:01.6 and 12:02.4 |
| `study/match-win-2026-11-04.md` (Four Lanes, won) | `2026-11-04T08-29-16-734Z-14555784050447` | queens founded at ticks 3,233 and 5,988; `queens_killed` at tick 10,126 — the report's exact numbers |
| `study/last-match.md` (Central Lake v2, won) | `2026-11-04T13-59-00-957Z-272597896842160` | `startedAt 13:59:00.957Z`; queens founded 4,661 and 6,869; `sustained_territory` at tick 16,532 |

## Headline findings

1. **Every 1v1 map is an exact x-mirror.** Water and rock rectangles mirror across the map's vertical centre in all 269 matches; y-mirror and 180° rotation never fit (mean fit per map 0–64% of rectangles). CONFIRMED (n=269).
2. **Colony 0 always starts in the left box and colony 1 in the right box** on all nine maps (n=269). CONFIRMED.
3. **We have been colony 1 (right side) in every match against a house bot under our `omp-dolphin` username** — 5 challenge seats in this feed, including all three report matches. The one self-play match (`omp-dolphin` vs `omp-dolphin/spar`) put us on both sides. CONFIRMED (n=6).
4. **Enemy extra queens are not mirrors of ours.** Mirroring our founded queens and looking for the nearest enemy founded queen in the same match gives a median Manhattan distance of 17.5–36 tiles and a within-4-tiles rate of 0%–11% per map. Enemy sites cluster in the enemy's own half instead. CONFIRMED (n=1,031 foundings).
5. **The queen clock is shared, not a differentiator.** The first extra queen lands at a median of 312–330 s (about 5:15) on every map — the 3,000-tick `firstFoundTick` gate, not a strategic choice. Second founding median 547 s, third 920 s. CONFIRMED (n=1,031).
6. **Queens die at home.** Median distance from the queen's own start box is 0.0–4.0 tiles; median time from first damage to death 4.2–8.2 s, and 55%–66% die within 10 s. CONFIRMED (n=544 deaths).
7. **Early attacks are common and roughly a coin flip.** 121 of 269 matches had a first ATTACK before 4:00 by at least one side; of the 96 attacks launched before 4:00, the attacker won 53. CONFIRMED (n=269).
8. **Vision, not terrain, is the binding constraint.** `count_mark_not_visible` accounts for 1,088 of 2,316 refusals (47%). CONFIRMED.
9. **Colony-side win rates are confounded by seeding.** In rated matches the higher-rated model sat in colony 0 in 159/233 cases, so the raw colony-0 win edge co-varies with model strength rather than side. CONFIRMED (n=233); the causal reading is INFERRED.

## Map facts

| Map | `mapId` | Size | Rules | Ant cap | Match limit | 1v1 n | c0 wins | c1 wins | Abandoned | Median first ATTACK | Queen dmg <8:00 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Three Crossings | `three-crossings` | 128×96 | 24/25/26 | 512 | 18000 | 37 | 17 | 18 | 2 | 328 s | 21/37 |
| Central Lake | `central-lake` | 128×96 | 24/25/26 | 512 | 18000 | 30 | 10 | 15 | 5 | 308 s | 13/30 |
| Open Field | `open-field` | 128×96 | 24/25/26/27 | 512 | 18000 | 60 | 32 | 25 | 3 | 296 s | 33/60 |
| Isthmus | `isthmus` | 128×96 | 26/27 | 512 | 18000 | 25 | 12 | 13 | 0 | 258 s | 17/25 |
| Wide Plain | `wide-plain` | 256×92 | 26/27 | 512/768/1024 | 18000/27000/36000 | 36 | 14 | 18 | 4 | 394 s | 10/36 |
| Twin Shields | `twin-shields` | 128×96 | 26/27 | 512 | 18000 | 24 | 16 | 8 | 0 | 341 s | 16/24 |
| Four Lanes | `four-lanes` | 128×128 | 26/27 | 512/768 | 18000/27000 | 33 | 20 | 13 | 0 | 278 s | 23/33 |
| Three Crossings v2 | `three-crossings-v2` | 128×96 | 27 | 512 | 18000 | 12 | 9 | 3 | 0 | 216 s | 7/12 |
| Central Lake v2 | `central-lake-v2` | 128×96 | 27 | 512 | 18000 | 12 | 6 | 6 | 0 | 217 s | 5/12 |

Cap and match limit vary by rules config, not by map alone: Wide Plain ran at cap 512/768/1024 with limits 1800/27000/36000 ticks; Four Lanes at 512/768 with 1800/27000. CONFIRMED.

## Symmetry and terrain

| Map | Water rects | Rocks per match | x-mirror exact | y-mirror (mean fit) | 180° (mean fit) |
|---|---|---|---|---|---|
| Three Crossings | 4 | 12–16 | 37/37 | 23% | 23% |
| Central Lake | 25 | 12–16 | 30/30 | 64% | 64% |
| Open Field | 0 | 12–16 | 60/60 | 0% | 0% |
| Isthmus | 37 | 12–16 | 25/25 | 8% | 8% |
| Wide Plain | 28 | 12–16 | 36/36 | 10% | 10% |
| Twin Shields | 50 | 12–16 | 24/24 | 0% | 0% |
| Four Lanes | 16 | 12–16 | 33/33 | 7% | 7% |
| Three Crossings v2 | 46 | 12–16 | 12/12 | 24% | 24% |
| Central Lake v2 | 36 | 12–16 | 12/12 | 8% | 8% |

- Water layout is fixed per map: exactly one water set per `mapId` across all matches. CONFIRMED (n=269).
- Rocks are randomised per match: 12, 14 or 16 rectangles of 2×2 to 6×2; every match has a distinct rock set. CONFIRMED (n=269).
- Rock positions and sizes still mirror exactly, per match, under the x-mirror. Rock records carry a fifth number that does **not** mirror (e.g. 62↔190, 40↔168); its meaning is NOT AVAILABLE. CONFIRMED (n=269).
- Rocks never sealed a lane: the smallest free count in any single map column, over all 269 matches, was 14 tiles (median 48), and no column was ever fully blocked. CONFIRMED (n=269).

## Lanes and choke points (INFERRED)

Computed from the fixed water layout on an impassable-cell grid (rocks only narrow a lane). Widths are tiles on the narrowest cut line. Where the pinch sits inside one base's half, the map centre is wider — the reachable lanes listed are those on the narrowest line, not the only route.

| Map | Narrowest free column | Passable lanes on that line |
|---|---|---|
| Three Crossings | 24 tiles at x≈64 | y 16–23 (8), y 44–51 (8), y 72–79 (8) |
| Central Lake | 48 tiles at x≈64 | y 0–23 (24), y 72–95 (24) |
| Open Field | 96 tiles at x≈64 | y 0–95 (96) |
| Isthmus | 16 tiles at x≈64 | y 40–55 (16) |
| Wide Plain | 48 tiles at x≈178 | y 0–15 (16), y 38–53 (16), y 76–91 (16) |
| Twin Shields | 63 tiles at x≈86 | y 0–29 (30), y 63–95 (33) |
| Four Lanes | 84 tiles at x≈64 | y 0–19 (20), y 36–55 (20), y 72–93 (22), y 106–127 (22) |
| Three Crossings v2 | 24 tiles at x≈64 | y 16–23 (8), y 44–51 (8), y 72–79 (8) |
| Central Lake v2 | 48 tiles at x≈64 | y 0–23 (24), y 72–95 (24) |

Map-specific reading:

- **Open Field** — no water; a 128×96 open plain. Any column carries 96 free tiles, so there is no choke. The 12–16 randomised rock pairs give local cover and nothing more. INFERRED (n=60).
- **Three Crossings** — a vertical water wall at x 60–67 that spans the full height (y 0–15 and y 80–95 are water), leaving three 8-tile gates at y 16–23, 44–51 and 72–79; 24 passable tiles across the wall. INFERRED (n=37).
- **Three Crossings v2** — same three gates at y 16–23, 44–51, 72–79, but the wall is a ragged band x 56–71, so the gate mouths are longer. INFERRED (n=12).
- **Central Lake** — a diamond lake spans x 44–83, y 24–71. Two 24-tile lanes remain: y 0–23 (north) and y 72–95 (south). INFERRED (n=30).
- **Central Lake v2** — the same two lanes; the lake spans x 40–87 and its edge is ragged, adding a small notch around y 39–45 on the west side. INFERRED (n=12).
- **Isthmus** — water covers x 43–84 except one central corridor at y 40–55; the single crossing is 16 tiles wide at x≈62–65. This is the tightest 1v1 map in the sample. INFERRED (n=25).
- **Twin Shields** — two shield-shaped lakes near the bases (x 35–46 and x 81–92, y 29–66). The centre x 47–80 is fully open; each base exit is split into a top (y 0–35) and bottom (y 59–95) lane. No mid-map choke. INFERRED (n=24).
- **Wide Plain** — 256×92 with mirrored water pinches near each half (x 66–81 and x 174–189, y 16–75). At the pinch three 16-tile lanes remain: y 0–15, 38–53, 76–91; the outer lanes hug the map edges and the centre x 82–173 is open. INFERRED (n=36).
- **Four Lanes** — four 20–22 tile lanes at y 0–19, 36–55, 72–93, 106–127, separated by water walls inside x 36–91, y 20–105. The tightest single lane is still 20 tiles wide. INFERRED (n=33).

## Start boxes and our side

| Map | Colony 0 box | Colony 1 box |
|---|---|---|
| Three Crossings | (0, 0) 32×96 | (96, 0) 32×96 |
| Central Lake | (0, 0) 32×96 | (96, 0) 32×96 |
| Open Field | (0, 0) 32×96 | (96, 0) 32×96 |
| Isthmus | (0, 0) 32×96 | (96, 0) 32×96 |
| Wide Plain | (0, 0) 64×92 | (192, 0) 64×92 |
| Twin Shields | (0, 0) 32×96 | (96, 0) 32×96 |
| Four Lanes | (0, 0) 32×128 | (96, 0) 32×128 |
| Three Crossings v2 | (0, 0) 32×96 | (96, 0) 32×96 |
| Central Lake v2 | (0, 0) 32×96 | (96, 0) 32×96 |

The colony index is the start-box index: colony 0 is always the left box, colony 1 the right box, in 269/269 matches. The starting queen's tile lies inside its own box in 538/538 cases. CONFIRMED.

Our matches in the feed (`omp-dolphin` username and its handles):

| Match | Map | Handle | Colony | Result |
|---|---|---|---|---|
| `45095818` | twin-shields | omp-dolphin/spar | 1 | lost — queens_killed |
| `45095818` | twin-shields | omp-dolphin | 0 | won — queens_killed |
| `40634510` | three-crossings-v2 | omp-dolphin | 1 | lost — queens_killed |
| `12946232` | wide-plain | omp-dolphin | 1 | lost — sustained_territory |
| `95914540` | central-lake-v2 | omp-dolphin | 1 | lost — time_up |
| `84050447` | four-lanes | omp-dolphin | 1 | won — queens_killed |
| `96842160` | central-lake-v2 | omp-dolphin | 1 | won — sustained_territory |

Every one of the 5 challenge seats is colony 1 (right). The self-play match appears twice because we held both colonies. CONFIRMED (n=6).

There are also 4 challenge matches under the bare handle `kain` (2026-11-04/05), all colony 1. Whether that handle belongs to this project is NOT AVAILABLE from the feed, and the identity key was not read.

## Queen founding by map

| Map | Founded | First extra (median) | First extra, winners | Distance from own box, median (min–max) | Progress toward enemy, median | Refused `found_queen` |
|---|---|---|---|---|---|---|
| Three Crossings | 138 | 319 s | 313 s | 5.5 (0.0–54.5) | 0.22 | 64 |
| Central Lake | 103 | 326 s | 316 s | 3.5 (0.0–48.5) | 0.20 | 73 |
| Open Field | 213 | 327 s | 316 s | 7.5 (0.0–59.5) | 0.24 | 118 |
| Isthmus | 87 | 322 s | 318 s | 4.5 (0.0–72.5) | 0.21 | 39 |
| Wide Plain | 182 | 317 s | 314 s | 23.5 (0.0–136.5) | 0.29 | 53 |
| Twin Shields | 94 | 326 s | 313 s | 9.0 (0.0–60.5) | 0.26 | 56 |
| Four Lanes | 124 | 316 s | 316 s | 16.5 (0.0–78.5) | 0.34 | 70 |
| Three Crossings v2 | 48 | 312 s | 308 s | 10.5 (0.0–58.5) | 0.28 | 33 |
| Central Lake v2 | 42 | 330 s | 336 s | 5.0 (0.0–54.5) | 0.22 | 14 |

- The gate is structural: `queenFounding.firstFoundTick = 3000` (5:00) in every rules version in the sample, and the observed minimum is 300.0 s. CONFIRMED (n=1,031).
- Second founding median 547 s, third founding median 920 s. CONFIRMED (n=374 / 136).
- Founding tiles sit in the founder's own half: median progress 0.20–0.34 of the way from own box centre to enemy box centre, with per-map maxima of 0.67–0.98. CONFIRMED (n=1,031).
- Refusals by code across all maps: `queen_tile_not_held` 308, `queen_too_close` 133, `rate_limited` 30, `queen_too_early` 21, `queen_cooldown` 18, `queen_food` 8, `water_tile` 1, `rock_tile` 1. CONFIRMED (n=520).
- Refused calls cluster near the founder's own box: per-map median distance 8–27 tiles. The common failure is a nearby tile that is not held or is too close to a standing nest. CONFIRMED (n=520).

## Early pressure by map

| Map | First ATTACK median (any side) | First ATTACK, c0 | First ATTACK, c1 | ATTACK before 3:00 | ATTACK before 4:00 | Attacker won, <4:00 | Queen dmg <8:00 |
|---|---|---|---|---|---|---|---|
| Three Crossings | 328 s | 328 s | 386 s | 6 | 18 | 9 | 21/37 |
| Central Lake | 308 s | 310 s | 362 s | 6 | 14 | 7 | 13/30 |
| Open Field | 296 s | 325 s | 392 s | 15 | 28 | 14 | 33/60 |
| Isthmus | 258 s | 279 s | 373 s | 9 | 14 | 6 | 17/25 |
| Wide Plain | 394 s | 411 s | 492 s | 2 | 7 | 5 | 10/36 |
| Twin Shields | 341 s | 357 s | 374 s | 6 | 12 | 7 | 16/24 |
| Four Lanes | 278 s | 308 s | 388 s | 6 | 13 | 8 | 23/33 |
| Three Crossings v2 | 216 s | 268 s | 391 s | 4 | 8 | 5 | 7/12 |
| Central Lake v2 | 217 s | 418 s | 314 s | 6 | 7 | 5 | 5/12 |

A first ATTACK before 3:00 is normal in this archive: 52 such attacks across the 254 matches where at least one side attacked. Of the 96 attacks launched before 4:00, 53 belonged to the eventual winner — early aggression is neither a reliable win signal nor a reliable loss signal at this sample size. CONFIRMED (n=269).

## Outcome by colony index

| Map | c0 wins | c1 wins | `queens_killed` | `time_up` | `sustained_territory` | `abandoned` |
|---|---|---|---|---|---|---|
| Three Crossings | 17 | 18 | 23 | 12 | 0 | 2 |
| Central Lake | 10 | 15 | 13 | 11 | 1 | 5 |
| Open Field | 32 | 25 | 42 | 11 | 4 | 3 |
| Isthmus | 12 | 13 | 18 | 5 | 2 | 0 |
| Wide Plain | 14 | 18 | 18 | 5 | 9 | 4 |
| Twin Shields | 16 | 8 | 20 | 4 | 0 | 0 |
| Four Lanes | 20 | 13 | 28 | 3 | 2 | 0 |
| Three Crossings v2 | 9 | 3 | 11 | 1 | 0 | 0 |
| Central Lake v2 | 6 | 6 | 7 | 3 | 2 | 0 |

Totals: colony 0 136, colony 1 119, abandoned 14. CONFIRMED (n=269).

The colony-0 edge co-varies with seeding: in rated matches the higher-rated model was placed in colony 0 in 159/233 cases (68%). The win column therefore mixes side with model strength and should not be read as a side advantage. CONFIRMED (n=233); the causal reading is INFERRED.

## Queen deaths

| Map | Queens killed | Median distance from own box | Median progress toward enemy | Median first damage→death | Within 10 s |
|---|---|---|---|---|---|
| Three Crossings | 62 | 0.0 tiles | 0.10 | 4.2 s | 41/62 |
| Central Lake | 50 | 0.0 tiles | 0.14 | 8.2 s | 29/50 |
| Open Field | 113 | 0.5 tiles | 0.17 | 6.4 s | 72/113 |
| Isthmus | 54 | 0.0 tiles | 0.16 | 7.2 s | 31/54 |
| Wide Plain | 88 | 4.0 tiles | 0.19 | 7.7 s | 48/88 |
| Twin Shields | 56 | 0.2 tiles | 0.17 | 7.0 s | 36/56 |
| Four Lanes | 71 | 0.0 tiles | 0.12 | 6.8 s | 43/71 |
| Three Crossings v2 | 30 | 0.0 tiles | 0.10 | 7.8 s | 18/30 |
| Central Lake v2 | 20 | 0.0 tiles | 0.10 | 7.6 s | 11/20 |

All 544 deaths show the same pattern: queens die close to home and quickly once found. CONFIRMED (n=544).

## Enemy extra queens: where they actually appear

Six most frequent 8×8 tile cells for colony-0 (enemy, left box) founded queens, with colony-1 (ours) for comparison. Counts are founding events, not matches.

| Map | Enemy (c0) top cells | Ours (c1) top cells | Mirror fit |
|---|---|---|---|
| Three Crossings | (32,72) n=10, (48,16) n=6, (48,40) n=5, (56,48) n=3 | (96,72) n=8, (88,72) n=8, (72,24) n=5, (72,16) n=4 | 5/59 ≤4 tiles; median 21 |
| Central Lake | (32,72) n=10, (48,16) n=6, (32,80) n=4, (32,16) n=4 | (88,72) n=13, (104,8) n=5, (88,16) n=4, (104,16) n=3 | 4/46 ≤4 tiles; median 20 |
| Open Field | (32,72) n=12, (48,16) n=7, (32,64) n=6, (24,72) n=5 | (88,72) n=18, (88,16) n=8, (72,40) n=7, (88,64) n=6 | 5/96 ≤4 tiles; median 29 |
| Isthmus | (32,72) n=6, (32,64) n=5, (24,72) n=4, (48,48) n=4 | (88,72) n=7, (80,16) n=4, (72,40) n=3, (80,40) n=3 | 4/38 ≤4 tiles; median 18 |
| Wide Plain | (80,64) n=9, (80,16) n=8, (88,16) n=6, (80,72) n=5 | (168,72) n=6, (136,40) n=5, (168,16) n=5, (160,16) n=4 | 2/80 ≤4 tiles; median 35 |
| Twin Shields | (32,72) n=6, (32,64) n=4, (48,16) n=4, (24,64) n=3 | (88,72) n=4, (96,56) n=3, (120,48) n=3, (80,16) n=3 | 0/45 ≤4 tiles; median 33 |
| Four Lanes | (48,80) n=8, (48,48) n=6, (56,40) n=5, (48,40) n=5 | (80,80) n=8, (96,80) n=4, (72,40) n=4, (64,40) n=3 | 4/53 ≤4 tiles; median 36 |
| Three Crossings v2 | (32,72) n=4, (48,16) n=2, (16,56) n=2, (48,72) n=2 | (72,16) n=2, (80,56) n=1, (72,32) n=1, (96,64) n=1 | 1/19 ≤4 tiles; median 35 |
| Central Lake v2 | (32,72) n=4, (48,16) n=2, (80,72) n=2, (32,64) n=2 | (88,64) n=3, (64,72) n=2, (80,16) n=1, (88,56) n=1 | 0/18 ≤4 tiles; median 24 |

Enemy founders concentrate near their own box: on all nine maps the top two cells are within about 30 tiles of the left box, usually one north and one south of it. That is a home-half pattern, not a mirror of our right-side sites. CONFIRMED for the counts (n=1,031); the north/south reading is INFERRED.

## Rules and config taken from the logs

All values are from `rules.config` in the `antwar.match` logs; the four rules versions in the sample (24, 25, 26, 27) carry identical values for every key listed. CONFIRMED.

| Property | Value | Source | Label |
|---|---|---|---|
| Minimum mark size | count must be ≥ 1 (`bad_count_mark`: “a whole count of 1 or more”) | 12 refusals, all versions | CONFIRMED |
| `squadSize` | 6 | `rules.config.squadSize` | CONFIRMED field; gameplay meaning NOT AVAILABLE |
| Mark target visibility | tile must be within sight of a living ant; otherwise `count_mark_not_visible` | 1,088 refusals + error text | CONFIRMED |
| Per-ant control | none appears in the command vocabulary (`observe`, `count_mark`, `order`, `found_queen`, `set_brood`, `join`, `rejoin`); orders are colony-level (`forage`, `go_to`, `attack`, `hold`) | 44,673 commands, 269 matches | CONFIRMED for the sample; protocol-level NOT AVAILABLE |
| Sight radius | `sightTiles` = 12 | config, all versions | CONFIRMED |
| Command rate limit | one command per 10 s (`commandFloorTicks` 100 at 10 ticks/s); refusals say “One command per 10 s” | 624 `rate_limited` refusals | CONFIRMED |
| Queen minimum spacing | 32 tiles from every standing nest of either colony (`queenFounding.minDistanceTiles` 32) | 133 `queen_too_close` refusals + error text | CONFIRMED |
| Tile-hold decay | `territoryDecayTicks` = 200 ticks = 20 s at 10 ticks/s | config field; decay semantics INFERRED from the 2026-10-30 study | CONFIRMED field / INFERRED behaviour |
| Extra-queen cost curve | 400 food ×2 per founded-live queen; observed refusals at 400, 800 and 1,600 food | config + `queen_food` messages | CONFIRMED |
| First founding tick / cooldown | opens at tick 3,000; cooldown 1,800 ticks (180 s) | config + `queen_too_early` / `queen_cooldown` messages | CONFIRMED |
| Mark reach / lifetime | `markReachTiles` 20; `markLifetimeTicks` 1,800 (180 s) | config, all versions | CONFIRMED |
| Mark strength | `markStrengthPermille` 700 | config | CONFIRMED field; gameplay meaning NOT AVAILABLE |
| Clock | 10 ticks/s; match limit 18,000 / 27,000 / 36,000 ticks by config | `setup.ticksPerSecond`, `rules.config.matchTicks` | CONFIRMED |

## Claims in `prompt.md` v2 that the data contradicts or supports

No file was edited. Line references are to the v2 text, which is now on `main` (merged as PR #7).

| Claim in v2 | Verdict from 269 matches |
|---|---|
| “Expect enemy extra queens roughly mirrored to ours.” | **Contradicted.** Mirroring our queen sites finds an enemy queen within 4 tiles in only 0%–11% of cases per map (median distance 17.5–36 tiles). Enemy queens cluster in their own half. CONFIRMED (n=1,031). |
| “The enemy start is the other start box on the map.” | **Supported.** Colony 0 is always at the opposite end of the x-mirror from colony 1. CONFIRMED (n=269). |
| “First extra queen at about 5:00.” | **Supported.** Median first extra queen 312–330 s per map; the 3,000-tick gate makes 5:00 the floor. CONFIRMED (n=1,031). |
| “Second at about 8:30–9:00.” | **Slightly late.** Observed second-founding median 547 s (p25 508, p75 632). Keep as a target, but the archive number is optimistic. CONFIRMED (n=374). |
| “Winners placed the first ATTACK in 7/10 … had more kills in 9/10.” | **Does not generalise.** When both sides attacked (192 matches), the winner attacked first only 53% of the time. The 10-match archive was too small to support a rule. CONFIRMED (n=192). |
| “A queen dies in seconds once ~10 ants reach it.” | **Supported.** Median 4.2–8.2 s from first damage to death; 55%–66% within 10 s. CONFIRMED (n=544). |
| “Extra queens at 7:46 and 11:27” (Central Lake v2 win). | **Supported.** Log: founded ticks 4,661 (7:46.1) and 6,869 (11:26.9). CONFIRMED. |
| “Our queens stood at (112,28) and (112,62); enemy queens were seen at (20,21) and (30,66).” | **Supported.** Log: our start (112.5,28.5), founded (112.5,62.5); enemy start (20.5,21.5), founded (30.5,66.5). CONFIRMED. |
| “Territory wins end exactly 300 s after the final qualifying run.” | **Supported on the larger sample.** All 20 `sustained_territory` wins held exactly 300 s. CONFIRMED (n=20). |
| “Population ≥ ~75% of the live cap”, “ratio near 3:1”, “2.8k–10.5k food unspent” | **NOT AVAILABLE.** The logs carry no per-colony food, ant-count or population time series — only births, deaths, marks and queen HP. |

## Appendix A — first ATTACK per side, all 269 matches

`c0`/`c1` cells are `tick (tile) count caste`; `—` means that colony laid no ATTACK. `Q<8` lists colonies whose queen took damage before tick 8,000.

| Match | Map | Result | c0 first ATTACK | c1 first ATTACK | Q<8 |
|---|---|---|---|---|---|
| `33507518` | three-crossings | c1 time_up | 4656 (56,76) 140 soldier | 4702 (72,78) 25 soldier | — |
| `08226173` | central-lake | c0 time_up | 4494 (46,74) 70 soldier | — | — |
| `53631010` | open-field | c0 queens_killed | 2357 (62,42) 15 soldier | — | c1 |
| `77391170` | open-field | c0 time_up | 5327 (90,48) 10 soldier | — | — |
| `48795416` | open-field | c0 queens_killed | 2702 (37,38) 16 soldier | 3601 (36,48) 20 soldier | c1 |
| `31088488` | central-lake | c1 time_up | 2823 (68,20) 80 soldier | 3539 (88,21) 40 soldier | c0 |
| `18228022` | three-crossings | c1 queens_killed | — | 4536 (68,76) 100 soldier | — |
| `35053660` | open-field | c1 queens_killed | 2802 (34,38) 10 any | 1733 (28,38) 20 soldier | — |
| `11700020` | central-lake | c1 time_up | 1878 (52,26) 20 soldier | 4698 (60,21) 10 any | c0 |
| `25267632` | central-lake | c1 time_up | 1876 (70,75) 8 any | 2091 (69,78) 12 soldier | — |
| `87976804` | open-field | c0 queens_killed | 2795 (66,48) 30 soldier | 6211 (92,38) 60 soldier | — |
| `41660520` | three-crossings | c1 time_up | 3785 (58,52) 12 soldier | 4997 (72,48) 10 soldier | — |
| `73198516` | open-field | c1 queens_killed | 7317 (50,50) 12 any | 5158 (54,48) 16 soldier | — |
| `41645846` | open-field | c0 queens_killed | 3608 (64,48) 60 soldier | — | c1 |
| `89973811` | three-crossings | c0 queens_killed | 3941 (66,20) 90 soldier | 4129 (64,76) 20 soldier | c1 |
| `32532129` | open-field | c0 queens_killed | 2571 (72,25) 28 soldier | — | c1 |
| `05043520` | open-field | c1 queens_killed | — | 2994 (68,32) 40 soldier | — |
| `75159841` | open-field | c0 time_up | 2337 (64,72) 12 soldier | — | c0 |
| `34134008` | open-field | c0 time_up | 4593 (58,48) 12 soldier | 4008 (52,22) 12 soldier | — |
| `74282007` | open-field | c1 time_up | 2484 (68,74) 20 soldier | 3846 (52,25) 30 soldier | — |
| `83881612` | central-lake | c0 time_up | 10960 (76,20) 40 any | — | — |
| `67682322` | open-field | c1 queens_killed | 4619 (69,48) 40 soldier | 4152 (60,76) 40 soldier | — |
| `32062548` | open-field | c1 queens_killed | 3076 (60,76) 12 soldier | 7028 (56,48) 20 soldier | — |
| `10133600` | open-field | c0 queens_killed | 2372 (75,48) 20 soldier | 1753 (68,71) 12 soldier | — |
| `26108256` | three-crossings | c1 time_up | 3938 (52,22) 20 soldier | 3944 (62,20) 40 soldier | — |
| `40274979` | three-crossings | c1 queens_killed | 2184 (34,47) 10 soldier | 3458 (84,76) 35 soldier | — |
| `39629863` | open-field | c1 time_up | 6350 (40,48) 8 soldier | 3067 (17,47) 40 soldier | — |
| `16088424` | central-lake | c1 time_up | 4059 (44,21) 55 soldier | 3620 (56,18) 40 soldier | — |
| `58494966` | three-crossings | c0 time_up | 3221 (64,48) 40 soldier | 3857 (82,48) 25 soldier | — |
| `78116464` | open-field | c0 queens_killed | 4177 (58,48) 30 soldier | — | — |
| `19117228` | three-crossings | c0 time_up | 4747 (62,48) 60 soldier | 1891 (98,42) 12 soldier | — |
| `88370146` | central-lake | c0 time_up | 5287 (86,25) 60 soldier | 8809 (62,76) 30 soldier | — |
| `81685402` | open-field | c0 queens_killed | 6101 (110,48) 175 soldier | — | c1 |
| `00019141` | open-field | c1 queens_killed | 2350 (62,48) 20 soldier | 3224 (58,48) 40 any | c0 |
| `59740912` | central-lake | c1 queens_killed | 4887 (33,50) 12 soldier | 3852 (38,78) 50 soldier | c0 |
| `60794745` | central-lake | c0 queens_killed | 2509 (85,17) 40 soldier | 2936 (38,76) 6 soldier | c0 |
| `29353446` | open-field | c1 time_up | 5022 (48,45) 4 any | 12337 (82,50) 16 soldier | — |
| `41888640` | open-field | c0 queens_killed | 1592 (54,17) 6 soldier | 3764 (15,23) 4 soldier | c0 |
| `31032909` | three-crossings | c1 time_up | — | 4129 (66,22) 12 any | — |
| `93231109` | open-field | c1 time_up | — | 4273 (58,20) 30 soldier | — |
| `21716146` | open-field | abandoned | — | 865 (87,58) 4 soldier | — |
| `13341575` | open-field | abandoned | — | — | — |
| `87878967` | three-crossings | c1 queens_killed | 1436 (35,48) 4 soldier | 3642 (86,24) 60 soldier | c0 |
| `57117331` | central-lake | c0 queens_killed | 3707 (62,20) 55 soldier | 1718 (64,20) 8 soldier | c1 |
| `83751506` | open-field | c0 queens_killed | 3844 (68,20) 60 soldier | 3746 (62,21) 40 soldier | — |
| `24078806` | central-lake | c1 sustained_territory | — | 1701 (70,20) 45 soldier | c0 |
| `81715116` | three-crossings | c0 queens_killed | 522 (58,76) 24 soldier | — | c1 |
| `45810419` | central-lake | c0 queens_killed | 1988 (56,19) 40 soldier | 1814 (55,20) 40 soldier | c1 |
| `51297630` | three-crossings | c1 queens_killed | 2482 (67,20) 25 soldier | 2550 (58,20) 40 soldier | c0 |
| `38724343` | central-lake | c1 queens_killed | 2263 (64,18) 12 soldier | 1688 (80,20) 8 soldier | c0 |
| `72546330` | open-field | abandoned | 4098 (48,38) 6 soldier | 4262 (55,25) 30 soldier | — |
| `40240427` | three-crossings | abandoned | 2223 (72,48) 20 soldier | 5108 (102,48) 30 soldier | — |
| `11161133` | central-lake | abandoned | — | — | — |
| `57765625` | open-field | c0 queens_killed | 3463 (70,20) 70 soldier | 8772 (56,72) 80 soldier | c1 |
| `65826274` | open-field | c0 sustained_territory | 5094 (85,21) 60 soldier | — | c1 |
| `94153018` | open-field | c1 sustained_territory | 1863 (52,22) 6 soldier | 12175 (67,22) 40 any | — |
| `14544450` | central-lake | abandoned | — | 4125 (98,48) 24 soldier | — |
| `33092905` | three-crossings | abandoned | — | — | — |
| `81580872` | three-crossings | c1 time_up | 8663 (56,33) 30 soldier | 3843 (56,24) 20 soldier | — |
| `67071163` | open-field | c1 time_up | 5521 (96,48) 12 soldier | 7773 (66,40) 20 any | — |
| `63552135` | open-field | c0 queens_killed | 2816 (58,48) 18 soldier | 5062 (20,14) 25 soldier | c1 |
| `89178265` | central-lake | c1 time_up | 5476 (58,74) 30 soldier | 4646 (56,75) 70 soldier | — |
| `58486958` | three-crossings | c0 time_up | 6526 (68,23) 30 soldier | — | c1 |
| `00005030` | central-lake | abandoned | — | — | — |
| `99970207` | central-lake | c1 queens_killed | 3117 (73,20) 16 soldier | 6399 (84,28) 8 soldier | — |
| `39087893` | three-crossings | c0 queens_killed | 1582 (62,48) 15 soldier | 3675 (101,47) 15 any | c1 |
| `94220267` | three-crossings | c1 time_up | 7221 (55,70) 6 soldier | 5730 (68,23) 12 soldier | — |
| `82895072` | central-lake | c1 queens_killed | — | 3561 (60,20) 100 soldier | c0 |
| `82521085` | central-lake | c1 queens_killed | 1352 (70,18) 50 soldier | 1623 (75,18) 20 soldier | c0 |
| `47845196` | central-lake | abandoned | — | — | — |
| `00825646` | central-lake | c1 queens_killed | 3081 (68,18) 24 soldier | 4027 (70,19) 110 any | c0 |
| `81160100` | open-field | c1 queens_killed | 1724 (59,27) 12 soldier | 1887 (58,26) 20 soldier | c0 |
| `47820274` | open-field | c1 queens_killed | 8076 (48,72) 20 any | 7740 (45,70) 12 soldier | c1 |
| `05184122` | open-field | c0 time_up | 9955 (58,26) 25 soldier | 7242 (68,44) 24 soldier | — |
| `90417063` | central-lake | abandoned | 2830 (70,74) 25 soldier | 2835 (86,18) 8 soldier | — |
| `22098734` | three-crossings | c0 queens_killed | 1192 (86,20) 12 soldier | — | c1 |
| `36603752` | open-field | c0 sustained_territory | 2178 (68,48) 12 soldier | 2458 (71,46) 41 soldier | c1 |
| `89796189` | central-lake | c0 queens_killed | 4298 (68,17) 48 soldier | 4357 (71,19) 24 soldier | — |
| `24005336` | open-field | c0 queens_killed | 4264 (70,24) 80 soldier | 5315 (74,24) 10 any | — |
| `78125926` | open-field | c1 queens_killed | 3700 (60,48) 110 soldier | 8773 (68,48) 100 soldier | c1 |
| `83942814` | open-field | c0 queens_killed | 4198 (68,47) 15 soldier | — | c1 |
| `05550689` | three-crossings | c0 queens_killed | 3769 (66,74) 8 soldier | 5395 (92,60) 6 soldier | c1 |
| `13080499` | central-lake | c1 time_up | 13288 (54,20) 120 soldier | 4411 (58,79) 40 soldier | — |
| `90451723` | three-crossings | c0 queens_killed | 1867 (70,17) 8 soldier | 1854 (70,18) 10 soldier | c1 |
| `76287737` | three-crossings | c1 queens_killed | 3801 (70,48) 15 soldier | 3793 (58,76) 60 soldier | c0 |
| `99875775` | isthmus | c0 queens_killed | 2080 (105,34) 80 any | — | c1 |
| `78158756` | wide-plain | c0 queens_killed | 4131 (128,32) 50 soldier | 7156 (159,40) 12 soldier | c1 |
| `70899180` | twin-shields | c0 time_up | 8206 (60,22) 100 soldier | 13954 (102,25) 60 soldier | — |
| `58334824` | four-lanes | c0 queens_killed | 3520 (78,43) 36 soldier | 4866 (73,47) 40 soldier | c1 |
| `78547385` | open-field | c1 queens_killed | — | 3849 (64,26) 50 soldier | c0 |
| `21191950` | three-crossings | c0 queens_killed | 4807 (109,47) 250 any | — | c1 |
| `90609688` | four-lanes | c1 time_up | — | 6106 (46,20) 8 soldier | — |
| `75196224` | four-lanes | c1 queens_killed | 7831 (50,40) 40 soldier | 2861 (54,41) 24 soldier | — |
| `45901815` | open-field | c1 time_up | 2770 (55,44) 30 soldier | 3866 (60,30) 120 soldier | — |
| `95750130` | four-lanes | c1 queens_killed | 2570 (44,50) 24 soldier | 2486 (74,12) 16 soldier | c0 |
| `22253010` | wide-plain | c0 time_up | 2060 (86,20) 25 soldier | 10245 (154,30) 80 soldier | — |
| `71531877` | three-crossings | c0 time_up | 8264 (55,48) 100 soldier | 8996 (72,80) 24 soldier | — |
| `46768027` | three-crossings | c0 time_up | 3925 (58,58) 60 soldier | 3586 (70,74) 80 soldier | — |
| `54632998` | open-field | c0 queens_killed | 3763 (73,74) 60 soldier | 5469 (75,70) 12 soldier | c1 |
| `90998417` | wide-plain | c0 time_up | 1502 (96,70) 20 soldier | 5231 (131,58) 60 soldier | — |
| `43489473` | three-crossings | c0 queens_killed | 3349 (70,20) 60 soldier | — | c1 |
| `08324812` | central-lake | c0 time_up | 4791 (65,74) 100 soldier | 4176 (72,72) 12 soldier | c0,c1 |
| `02857985` | isthmus | c0 sustained_territory | 4067 (74,46) 8 soldier | 3885 (89,46) 6 soldier | c1 |
| `35368272` | four-lanes | c0 time_up | — | 7165 (72,45) 12 soldier | — |
| `68922728` | wide-plain | c1 sustained_territory | 4098 (108,74) 16 soldier | 7787 (148,44) 60 soldier | — |
| `71112256` | twin-shields | c0 queens_killed | 3315 (58,24) 60 soldier | 3577 (64,26) 10 soldier | c1 |
| `08128762` | twin-shields | c0 queens_killed | 6282 (74,48) 100 soldier | 7085 (73,37) 50 soldier | — |
| `66669342` | four-lanes | c1 sustained_territory | 4017 (45,45) 25 soldier | 6567 (65,47) 6 soldier | — |
| `39347650` | three-crossings | c1 queens_killed | 3978 (70,79) 20 soldier | 4213 (66,48) 15 soldier | c0 |
| `40108162` | wide-plain | c1 time_up | 3791 (120,24) 48 soldier | 3713 (118,46) 100 worker | — |
| `11956920` | open-field | c1 time_up | 4555 (65,74) 90 soldier | 1468 (60,24) 32 soldier | — |
| `36533908` | central-lake | c0 queens_killed | 2531 (68,19) 8 soldier | — | — |
| `06884074` | isthmus | c0 queens_killed | 2676 (72,48) 16 soldier | — | c1 |
| `03071116` | central-lake | c1 time_up | 9054 (69,74) 25 soldier | 4423 (84,22) 12 any | — |
| `09286179` | isthmus | c0 time_up | 6381 (44,60) 50 soldier | — | — |
| `62236412` | wide-plain | c1 queens_killed | — | 3360 (117,19) 80 soldier | c0 |
| `31412721` | open-field | c1 queens_killed | 2127 (44,27) 32 soldier | 3911 (64,49) 30 soldier | c0 |
| `46745331` | wide-plain | abandoned | 2040 (135,46) 40 soldier | 5841 (149,17) 60 soldier | — |
| `42750609` | three-crossings | c0 queens_killed | 2017 (48,50) 30 soldier | 5526 (88,54) 30 soldier | c1 |
| `95345568` | twin-shields | c0 queens_killed | 2882 (70,45) 25 soldier | 4967 (73,24) 12 soldier | c1 |
| `83007497` | twin-shields | c1 queens_killed | 1035 (68,20) 6 soldier | 3889 (56,24) 10 soldier | — |
| `73408736` | isthmus | c1 queens_killed | — | 5807 (40,23) 40 soldier | — |
| `03999726` | wide-plain | abandoned | 4506 (138,73) 16 soldier | — | c1 |
| `34390249` | isthmus | c0 time_up | 4432 (40,24) 20 soldier | 13391 (88,66) 25 soldier | — |
| `18345156` | three-crossings | c1 queens_killed | 2155 (61,22) 50 soldier | 3203 (68,21) 100 any | c0,c1 |
| `59289768` | twin-shields | c0 queens_killed | 1423 (70,20) 40 soldier | — | c1 |
| `28454922` | four-lanes | c0 queens_killed | 4149 (70,48) 100 soldier | 4870 (93,61) 6 soldier | c1 |
| `19005412` | four-lanes | c1 queens_killed | 1921 (29,39) 6 soldier | 4737 (54,88) 45 soldier | c0 |
| `58787130` | isthmus | c1 queens_killed | 2392 (55,48) 12 soldier | 5304 (66,48) 20 soldier | c0 |
| `04996456` | four-lanes | c1 time_up | 8069 (70,48) 20 soldier | 11066 (69,47) 150 any | — |
| `26036548` | wide-plain | c0 queens_killed | 4385 (134,47) 12 soldier | 3465 (140,67) 20 soldier | — |
| `48386624` | wide-plain | c1 queens_killed | 2654 (118,20) 8 soldier | 2415 (118,14) 40 soldier | c0 |
| `25283870` | twin-shields | c1 queens_killed | 1876 (38,47) 6 soldier | 2392 (75,24) 14 soldier | — |
| `15454562` | three-crossings | c1 queens_killed | 1864 (60,22) 10 soldier | 1813 (58,74) 15 soldier | c0 |
| `85641506` | isthmus | c1 sustained_territory | 4040 (33,72) 6 soldier | 3815 (54,48) 40 any | — |
| `06911844` | open-field | c0 queens_killed | 3247 (63,78) 20 soldier | — | c1 |
| `26157212` | three-crossings | c1 queens_killed | 1969 (70,20) 18 soldier | 5451 (58,48) 140 soldier | c1 |
| `17319532` | four-lanes | c0 queens_killed | 2149 (82,47) 60 soldier | — | c1 |
| `52867757` | three-crossings | c1 queens_killed | 2509 (56,20) 6 soldier | 1235 (62,20) 30 soldier | c0 |
| `54536879` | four-lanes | c0 queens_killed | 1544 (62,15) 8 soldier | 3089 (62,15) 6 soldier | — |
| `40169361` | three-crossings | c0 queens_killed | 2191 (68,20) 24 soldier | 5039 (88,23) 24 soldier | c1 |
| `89641178` | open-field | c0 queens_killed | 3911 (55,24) 80 soldier | 5128 (66,24) 70 soldier | c1 |
| `75345202` | isthmus | c0 time_up | 4073 (68,48) 40 soldier | 4337 (66,48) 10 soldier | — |
| `72352497` | three-crossings | c1 time_up | 2111 (63,48) 10 soldier | 1352 (71,55) 8 soldier | — |
| `89204527` | three-crossings | c1 queens_killed | 3497 (76,20) 48 soldier | 3463 (64,20) 45 soldier | c0 |
| `40841877` | wide-plain | c1 sustained_territory | 5346 (113,74) 80 any | 4191 (117,48) 40 soldier | — |
| `43994773` | central-lake | c1 queens_killed | 2097 (62,20) 32 soldier | 1802 (70,22) 8 soldier | — |
| `31815150` | open-field | c0 queens_killed | 3761 (80,25) 90 soldier | — | c1 |
| `23707719` | twin-shields | c0 queens_killed | 2059 (66,16) 36 any | 3600 (85,17) 40 soldier | c1 |
| `26389634` | three-crossings | c0 queens_killed | 4764 (70,21) 12 soldier | — | — |
| `65696178` | twin-shields | c0 queens_killed | 3730 (54,24) 70 soldier | — | c1 |
| `98007426` | central-lake | c0 queens_killed | 1155 (84,78) 14 soldier | — | c1 |
| `32389383` | isthmus | c1 queens_killed | 3945 (63,51) 10 soldier | 2581 (87,77) 10 soldier | c0 |
| `08805277` | open-field | c0 queens_killed | 4761 (49,55) 50 soldier | 3655 (60,48) 60 soldier | — |
| `01137641` | wide-plain | c1 time_up | 6307 (118,22) 30 soldier | 4652 (140,51) 10 soldier | — |
| `88906667` | isthmus | c0 time_up | 2540 (84,22) 14 any | 1742 (86,25) 8 soldier | c1 |
| `24771668` | three-crossings | c0 queens_killed | 2527 (68,49) 30 soldier | — | c1 |
| `27591708` | twin-shields | c1 time_up | 4179 (45,75) 20 soldier | 3741 (55,78) 16 soldier | — |
| `51975704` | wide-plain | c0 queens_killed | 4418 (120,21) 50 soldier | — | — |
| `12750394` | three-crossings-v2 | c0 queens_killed | 5450 (52,77) 20 soldier | — | c1 |
| `60721254` | three-crossings-v2 | c1 queens_killed | 3936 (30,48) 40 soldier | 6102 (44,76) 40 soldier | c0 |
| `96971751` | central-lake-v2 | c0 queens_killed | 1868 (80,24) 30 soldier | 2416 (87,22) 10 soldier | — |
| `06488655` | four-lanes | c1 queens_killed | 3789 (27,45) 15 soldier | 4614 (32,46) 300 worker | c0 |
| `54781230` | wide-plain | c1 queens_killed | — | 1809 (155,76) 24 soldier | — |
| `99374676` | wide-plain | abandoned | 8137 (134,49) 24 soldier | 11440 (142,15) 30 soldier | — |
| `75124707` | three-crossings-v2 | c0 queens_killed | 2161 (57,22) 15 soldier | 1596 (71,53) 8 soldier | c1 |
| `92887237` | four-lanes | c0 queens_killed | 1844 (65,44) 24 soldier | 3871 (76,50) 100 soldier | c0 |
| `10475112` | isthmus | c0 queens_killed | 3623 (60,50) 30 soldier | — | c1 |
| `85854384` | open-field | c0 queens_killed | 1391 (48,44) 20 soldier | 1755 (74,46) 60 soldier | c1 |
| `24468816` | central-lake-v2 | c0 queens_killed | 2807 (80,20) 100 soldier | 2472 (77,71) 35 soldier | — |
| `48522177` | four-lanes | c0 queens_killed | 1900 (34,27) 20 soldier | — | c1 |
| `61734508` | twin-shields | c0 queens_killed | 4225 (57,27) 20 soldier | 2669 (68,50) 20 soldier | c1 |
| `45031709` | wide-plain | c1 time_up | 4570 (140,23) 24 soldier | 4768 (128,42) 35 soldier | c1 |
| `53881845` | twin-shields | c0 queens_killed | 3848 (69,40) 30 soldier | — | c1 |
| `29185700` | open-field | c0 queens_killed | 3363 (55,39) 30 soldier | 2957 (58,39) 10 soldier | c1 |
| `50075265` | wide-plain | c0 queens_killed | 3637 (116,78) 100 soldier | 6218 (216,21) 20 soldier | — |
| `52821656` | twin-shields | c0 queens_killed | 2088 (64,20) 40 soldier | 1829 (73,41) 6 soldier | c0 |
| `47742847` | central-lake-v2 | c1 time_up | 4254 (70,21) 30 soldier | 1445 (88,22) 40 any | — |
| `50236048` | wide-plain | c0 queens_killed | 4185 (120,14) 160 soldier | 6269 (146,22) 120 soldier | c0 |
| `17031689` | four-lanes | c0 queens_killed | 2784 (70,48) 100 soldier | 10385 (103,21) 30 any | c1 |
| `93827779` | wide-plain | c0 queens_killed | 4473 (164,22) 50 soldier | 4179 (190,16) 60 soldier | — |
| `35223225` | wide-plain | c1 queens_killed | 1847 (118,46) 100 soldier | 3506 (168,42) 25 soldier | — |
| `80206802` | twin-shields | c1 queens_killed | 4391 (70,30) 24 soldier | 4054 (70,30) 40 soldier | — |
| `41473189` | wide-plain | c1 queens_killed | 3999 (146,20) 20 soldier | 3538 (122,70) 120 soldier | — |
| `19542838` | four-lanes | c0 queens_killed | 8367 (81,51) 40 soldier | 7290 (80,50) 12 soldier | — |
| `60075481` | open-field | c1 queens_killed | — | 6438 (30,25) 100 soldier | — |
| `41978417` | wide-plain | c0 queens_killed | 4370 (140,43) 16 soldier | 4272 (126,37) 45 soldier | — |
| `82550959` | central-lake-v2 | c1 queens_killed | 1482 (70,20) 60 soldier | 1217 (91,20) 8 soldier | c0 |
| `40507422` | three-crossings-v2 | c0 queens_killed | 1775 (69,20) 48 soldier | 3093 (86,33) 60 soldier | c0,c1 |
| `53383878` | four-lanes | c0 queens_killed | 1367 (79,48) 80 soldier | 3854 (52,46) 100 soldier | c1 |
| `54627875` | open-field | c0 queens_killed | 1265 (30,48) 6 soldier | — | c1 |
| `77124500` | wide-plain | abandoned | 5502 (146,23) 90 soldier | — | c0 |
| `45481725` | open-field | c0 sustained_territory | 2186 (45,24) 20 soldier | 1185 (65,26) 80 soldier | c0,c1 |
| `38486478` | open-field | c0 queens_killed | 5025 (62,76) 15 soldier | 1981 (88,20) 16 soldier | — |
| `32325689` | central-lake-v2 | c0 sustained_territory | 7165 (94,41) 8 soldier | 8385 (86,30) 80 soldier | c0 |
| `12781908` | four-lanes | c0 queens_killed | 3822 (63,46) 30 soldier | 2680 (75,50) 14 soldier | c1 |
| `46462074` | twin-shields | c1 queens_killed | 3835 (60,22) 60 soldier | 3871 (44,20) 30 soldier | c0 |
| `26763663` | central-lake-v2 | c1 queens_killed | 6794 (21,20) 10 any | 4096 (64,20) 10 soldier | c0 |
| `07171152` | central-lake-v2 | c1 queens_killed | 5792 (66,80) 110 soldier | 1317 (85,20) 36 soldier | c0,c1 |
| `80047765` | isthmus | c1 queens_killed | 2364 (58,46) 20 soldier | 4409 (55,45) 30 soldier | c0 |
| `88576342` | central-lake-v2 | c0 queens_killed | 1082 (39,18) 16 soldier | 4336 (89,26) 70 soldier | c1 |
| `28654954` | four-lanes | c0 queens_killed | 4249 (64,48) 36 soldier | — | c1 |
| `52539743` | wide-plain | c1 queens_killed | 3739 (120,42) 80 soldier | 3965 (131,46) 60 soldier | c0 |
| `74817325` | twin-shields | c0 queens_killed | 4140 (78,68) 25 soldier | — | c1 |
| `33399664` | three-crossings-v2 | c1 queens_killed | 1527 (24,38) 20 soldier | 4718 (62,74) 14 soldier | — |
| `15167107` | open-field | c1 queens_killed | 1654 (63,22) 20 any | 6724 (98,26) 40 soldier | c1 |
| `95639659` | wide-plain | c0 sustained_territory | 8529 (162,20) 24 any | 12116 (215,24) 100 any | — |
| `28947529` | four-lanes | c0 queens_killed | 2452 (68,43) 25 soldier | 2593 (77,45) 16 soldier | c1 |
| `66491321` | central-lake-v2 | c0 time_up | 4116 (48,26) 10 soldier | 3795 (84,32) 12 soldier | — |
| `40130340` | wide-plain | c1 queens_killed | 2490 (100,20) 100 soldier | 1430 (200,36) 30 soldier | — |
| `14122607` | three-crossings-v2 | c0 queens_killed | 4663 (46,45) 80 soldier | 2155 (52,44) 50 soldier | c0 |
| `02201651` | isthmus | c0 queens_killed | 1722 (63,47) 18 soldier | 3654 (90,48) 90 soldier | c1 |
| `28562274` | wide-plain | c1 queens_killed | 4389 (106,40) 40 soldier | 6333 (160,30) 200 soldier | — |
| `71038034` | four-lanes | c0 queens_killed | 5416 (76,48) 40 soldier | 3360 (59,49) 18 soldier | — |
| `96189858` | four-lanes | c0 queens_killed | 2121 (50,48) 70 soldier | 674 (80,46) 20 soldier | c0,c1 |
| `09908045` | three-crossings-v2 | c1 queens_killed | — | 1873 (75,18) 40 soldier | — |
| `77111020` | isthmus | c0 queens_killed | 6112 (92,41) 20 soldier | — | c1 |
| `78956615` | isthmus | c1 queens_killed | — | 5202 (62,49) 30 soldier | c0 |
| `13521590` | twin-shields | c1 time_up | 3637 (44,21) 30 soldier | 5652 (78,20) 120 soldier | — |
| `97911868` | four-lanes | c1 queens_killed | 5273 (105,37) 25 soldier | 2429 (60,42) 90 soldier | c0,c1 |
| `83553837` | open-field | c1 queens_killed | 1743 (72,20) 40 any | 5709 (75,18) 20 soldier | c0 |
| `57392126` | twin-shields | c0 queens_killed | 1421 (57,46) 8 soldier | 1235 (69,47) 20 worker | c0 |
| `10203097` | twin-shields | c1 time_up | 7216 (70,27) 30 soldier | 4237 (66,36) 6 soldier | c1 |
| `77526526` | isthmus | c1 queens_killed | 1288 (67,47) 15 any | 1781 (68,47) 30 soldier | c0 |
| `42592862` | three-crossings-v2 | c0 queens_killed | 3970 (77,57) 20 soldier | 9119 (96,23) 120 soldier | — |
| `47227971` | four-lanes | c1 sustained_territory | 3752 (70,42) 24 soldier | 3602 (60,78) 10 soldier | — |
| `22084743` | isthmus | c0 queens_killed | 1733 (67,41) 30 any | 1893 (65,42) 70 soldier | c1 |
| `65625491` | four-lanes | c0 queens_killed | 3917 (74,42) 35 soldier | — | c1 |
| `68905560` | four-lanes | c0 queens_killed | 3619 (64,78) 50 soldier | 3673 (55,42) 80 soldier | c1 |
| `97412628` | twin-shields | c0 queens_killed | 1747 (62,25) 14 soldier | 2599 (73,24) 20 soldier | c0,c1 |
| `45922662` | open-field | c1 queens_killed | 2268 (37,22) 40 soldier | 5774 (46,54) 40 soldier | c0 |
| `97084013` | wide-plain | c1 sustained_territory | 3560 (116,44) 15 soldier | 3643 (141,44) 100 soldier | — |
| `81377373` | isthmus | c0 queens_killed | 2964 (50,46) 120 soldier | 1220 (100,48) 8 soldier | c1 |
| `16511683` | twin-shields | c0 queens_killed | 2822 (58,22) 30 any | 1028 (85,22) 8 soldier | c1 |
| `45095818` | twin-shields | c0 queens_killed | 4253 (82,21) 30 any | — | — |
| `73130888` | isthmus | c1 time_up | — | 5012 (82,28) 12 soldier | — |
| `96911155` | four-lanes | c1 queens_killed | — | 4536 (20,36) 30 soldier | c0 |
| `61743710` | three-crossings-v2 | c0 queens_killed | 3058 (30,22) 8 soldier | 5662 (52,22) 100 soldier | — |
| `35195771` | wide-plain | c1 sustained_territory | — | 6333 (104,80) 12 any | — |
| `86877264` | twin-shields | c1 queens_killed | 3506 (40,25) 60 soldier | 5539 (36,27) 40 soldier | c0 |
| `65513121` | isthmus | c1 queens_killed | 2898 (65,50) 6 soldier | 790 (98,40) 80 soldier | c1 |
| `93364582` | four-lanes | c1 queens_killed | 3376 (72,83) 30 soldier | 3749 (54,84) 60 any | c0 |
| `05136457` | isthmus | c1 queens_killed | — | 1755 (68,48) 40 soldier | — |
| `94787452` | open-field | c0 queens_killed | 1920 (62,24) 40 soldier | — | c1 |
| `87038152` | wide-plain | c1 queens_killed | 3422 (122,45) 100 soldier | 4327 (158,46) 45 soldier | c0 |
| `54775085` | open-field | c1 queens_killed | — | 1317 (56,42) 12 any | c0 |
| `77578512` | wide-plain | c1 queens_killed | 4608 (156,44) 120 soldier | 4921 (176,51) 12 soldier | c0 |
| `41944606` | open-field | c1 queens_killed | 1846 (36,26) 12 soldier | 3920 (66,30) 150 any | c0 |
| `01107838` | four-lanes | c1 queens_killed | 2164 (79,40) 80 soldier | 4255 (72,41) 60 soldier | c0 |
| `44279384` | isthmus | c1 queens_killed | 2197 (56,48) 60 soldier | 5055 (56,48) 40 soldier | c0 |
| `67747747` | three-crossings-v2 | c0 time_up | — | — | — |
| `51174202` | open-field | c0 queens_killed | 1053 (57,22) 30 soldier | 1560 (63,24) 20 soldier | c1 |
| `07731018` | wide-plain | c0 queens_killed | 1933 (112,20) 20 soldier | 5382 (146,31) 160 soldier | — |
| `43751345` | four-lanes | c0 queens_killed | 820 (34,47) 48 soldier | 3880 (50,46) 100 soldier | c1 |
| `11093785` | four-lanes | c0 queens_killed | 1389 (54,44) 12 soldier | 1471 (50,45) 30 soldier | — |
| `02536813` | four-lanes | c0 queens_killed | 2428 (34,64) 30 soldier | 4062 (34,63) 30 soldier | c1 |
| `17112598` | isthmus | c1 queens_killed | 1132 (52,40) 80 soldier | 3584 (56,47) 80 soldier | c0 |
| `40634510` | three-crossings-v2 | c0 queens_killed | 2297 (68,26) 100 soldier | 2423 (94,21) 18 any | c1 |
| `83622689` | wide-plain | c1 sustained_territory | — | 10912 (50,28) 40 soldier | — |
| `02847231` | wide-plain | c0 sustained_territory | 3700 (117,70) 40 soldier | 8591 (170,19) 40 soldier | — |
| `99328130` | isthmus | c1 queens_killed | — | 3327 (70,52) 20 soldier | — |
| `12946232` | wide-plain | c0 sustained_territory | 4284 (120,44) 70 soldier | 8889 (172,50) 40 soldier | — |
| `81674301` | central-lake-v2 | c1 queens_killed | 4946 (52,26) 12 any | 5135 (48,20) 20 soldier | — |
| `95914540` | central-lake-v2 | c0 time_up | 10000 (42,38) 24 soldier | 10673 (48,23) 40 soldier | — |
| `84050447` | four-lanes | c1 queens_killed | 2370 (51,48) 18 soldier | 7011 (55,80) 26 soldier | c0 |
| `96842160` | central-lake-v2 | c1 sustained_territory | 1589 (57,21) 14 soldier | 2495 (92,22) 30 any | — |
| `74803645` | three-crossings-v2 | c0 queens_killed | 1794 (35,25) 80 soldier | 7746 (100,50) 40 soldier | c1 |
| `56212171` | wide-plain | c0 sustained_territory | 3784 (125,44) 60 soldier | 20449 (163,39) 65 soldier | — |
| `64331040` | twin-shields | c0 queens_killed | 1841 (68,20) 30 soldier | 2433 (80,21) 30 soldier | c1 |

## Appendix B — every match with an ATTACK before 4:00 and what followed

| Match | Map | Attacker | t | Tile | Size | Outcome | End tick | Attacker's queens lost |
|---|---|---|---|---|---|---|---|---|
| `81715116` | three-crossings | c0 | 52.2 s | (58,76) | 24 soldier | c0 queens_killed | 6317 | 0 |
| `96189858` | four-lanes | c1 | 67.4 s | (80,46) | 20 soldier | c0 queens_killed | 6519 | 3 |
| `65513121` | isthmus | c1 | 79.0 s | (98,40) | 80 soldier | c1 queens_killed | 12392 | 0 |
| `43751345` | four-lanes | c0 | 82.0 s | (34,47) | 48 soldier | c0 queens_killed | 7915 | 0 |
| `21716146` | open-field | c1 | 86.5 s | (87,58) | 4 soldier | abandoned | 1889 | 0 |
| `16511683` | twin-shields | c1 | 102.8 s | (85,22) | 8 soldier | c0 queens_killed | 7087 | 2 |
| `83007497` | twin-shields | c0 | 103.5 s | (68,20) | 6 soldier | c1 queens_killed | 16129 | 2 |
| `51174202` | open-field | c0 | 105.3 s | (57,22) | 30 soldier | c0 queens_killed | 7179 | 0 |
| `88576342` | central-lake-v2 | c0 | 108.2 s | (39,18) | 16 soldier | c0 queens_killed | 6700 | 0 |
| `17112598` | isthmus | c0 | 113.2 s | (52,40) | 80 soldier | c1 queens_killed | 7853 | 2 |
| `98007426` | central-lake | c0 | 115.5 s | (84,78) | 14 soldier | c0 queens_killed | 4327 | 0 |
| `45481725` | open-field | c1 | 118.5 s | (65,26) | 80 soldier | c0 sustained_territory | 15162 | 2 |
| `22098734` | three-crossings | c0 | 119.2 s | (86,20) | 12 soldier | c0 queens_killed | 6892 | 0 |
| `82550959` | central-lake-v2 | c1 | 121.7 s | (91,20) | 8 soldier | c1 queens_killed | 10837 | 0 |
| `81377373` | isthmus | c1 | 122.0 s | (100,48) | 8 soldier | c0 queens_killed | 9498 | 3 |
| `52867757` | three-crossings | c1 | 123.5 s | (62,20) | 30 soldier | c1 queens_killed | 9482 | 0 |
| `57392126` | twin-shields | c1 | 123.5 s | (69,47) | 20 worker | c0 queens_killed | 11791 | 3 |
| `54627875` | open-field | c0 | 126.5 s | (30,48) | 6 soldier | c0 queens_killed | 10888 | 0 |
| `77526526` | isthmus | c0 | 128.8 s | (67,47) | 15 any | c1 queens_killed | 8220 | 3 |
| `07171152` | central-lake-v2 | c1 | 131.7 s | (85,20) | 36 soldier | c1 queens_killed | 10551 | 0 |
| `54775085` | open-field | c1 | 131.7 s | (56,42) | 12 any | c1 queens_killed | 6018 | 0 |
| `82521085` | central-lake | c0 | 135.2 s | (70,18) | 50 soldier | c1 queens_killed | 6555 | 3 |
| `72352497` | three-crossings | c1 | 135.2 s | (71,55) | 8 soldier | c1 time_up | 17999 | 0 |
| `53383878` | four-lanes | c0 | 136.7 s | (79,48) | 80 soldier | c0 queens_killed | 9488 | 0 |
| `11093785` | four-lanes | c0 | 138.9 s | (54,44) | 12 soldier | c0 queens_killed | 12700 | 0 |
| `85854384` | open-field | c0 | 139.1 s | (48,44) | 20 soldier | c0 queens_killed | 6309 | 0 |
| `57392126` | twin-shields | c0 | 142.1 s | (57,46) | 8 soldier | c0 queens_killed | 11791 | 0 |
| `59289768` | twin-shields | c0 | 142.3 s | (70,20) | 40 soldier | c0 queens_killed | 7083 | 0 |
| `40130340` | wide-plain | c1 | 143.0 s | (200,36) | 30 soldier | c1 queens_killed | 14916 | 1 |
| `87878967` | three-crossings | c0 | 143.6 s | (35,48) | 4 soldier | c1 queens_killed | 12041 | 3 |
| `47742847` | central-lake-v2 | c1 | 144.5 s | (88,22) | 40 any | c1 time_up | 17999 | 0 |
| `11956920` | open-field | c1 | 146.8 s | (60,24) | 32 soldier | c1 time_up | 17999 | 1 |
| `11093785` | four-lanes | c1 | 147.1 s | (50,45) | 30 soldier | c0 queens_killed | 12700 | 4 |
| `82550959` | central-lake-v2 | c0 | 148.2 s | (70,20) | 60 soldier | c1 queens_killed | 10837 | 4 |
| `90998417` | wide-plain | c0 | 150.2 s | (96,70) | 20 soldier | c0 time_up | 17999 | 2 |
| `33399664` | three-crossings-v2 | c0 | 152.7 s | (24,38) | 20 soldier | c1 queens_killed | 16233 | 3 |
| `54536879` | four-lanes | c0 | 154.4 s | (62,15) | 8 soldier | c0 queens_killed | 8647 | 0 |
| `51174202` | open-field | c1 | 156.0 s | (63,24) | 20 soldier | c0 queens_killed | 7179 | 2 |
| `39087893` | three-crossings | c0 | 158.2 s | (62,48) | 15 soldier | c0 queens_killed | 6711 | 0 |
| `96842160` | central-lake-v2 | c0 | 158.9 s | (57,21) | 14 soldier | c1 sustained_territory | 16532 | 2 |
| `41888640` | open-field | c0 | 159.2 s | (54,17) | 6 soldier | c0 queens_killed | 11717 | 0 |
| `75124707` | three-crossings-v2 | c1 | 159.6 s | (71,53) | 8 soldier | c0 queens_killed | 9457 | 3 |
| `82521085` | central-lake | c1 | 162.3 s | (75,18) | 20 soldier | c1 queens_killed | 6555 | 0 |
| `15167107` | open-field | c0 | 165.4 s | (63,22) | 20 any | c1 queens_killed | 12205 | 1 |
| `38724343` | central-lake | c1 | 168.8 s | (80,20) | 8 soldier | c1 queens_killed | 9972 | 0 |
| `24078806` | central-lake | c1 | 170.1 s | (70,20) | 45 soldier | c1 sustained_territory | 12115 | 0 |
| `57117331` | central-lake | c1 | 171.8 s | (64,20) | 8 soldier | c0 queens_killed | 6619 | 2 |
| `02201651` | isthmus | c0 | 172.2 s | (63,47) | 18 soldier | c0 queens_killed | 4511 | 0 |
| `81160100` | open-field | c0 | 172.4 s | (59,27) | 12 soldier | c1 queens_killed | 5171 | 2 |
| `35053660` | open-field | c1 | 173.3 s | (28,38) | 20 soldier | c1 queens_killed | 10942 | 0 |
| `22084743` | isthmus | c0 | 173.3 s | (67,41) | 30 any | c0 queens_killed | 5197 | 0 |
| `88906667` | isthmus | c1 | 174.2 s | (86,25) | 8 soldier | c0 time_up | 17999 | 2 |
| `83553837` | open-field | c0 | 174.3 s | (72,20) | 40 any | c1 queens_killed | 10208 | 3 |
| `97412628` | twin-shields | c0 | 174.7 s | (62,25) | 14 soldier | c0 queens_killed | 9434 | 0 |
| `10133600` | open-field | c1 | 175.3 s | (68,71) | 12 soldier | c0 queens_killed | 11418 | 3 |
| `85854384` | open-field | c1 | 175.5 s | (74,46) | 60 soldier | c0 queens_killed | 6309 | 2 |
| `05136457` | isthmus | c1 | 175.5 s | (68,48) | 40 soldier | c1 queens_killed | 10225 | 0 |
| `40507422` | three-crossings-v2 | c0 | 177.5 s | (69,20) | 48 soldier | c0 queens_killed | 5182 | 0 |
| `77526526` | isthmus | c1 | 178.1 s | (68,47) | 30 soldier | c1 queens_killed | 8220 | 0 |
| `74803645` | three-crossings-v2 | c0 | 179.4 s | (35,25) | 80 soldier | c0 queens_killed | 15216 | 0 |
| `43994773` | central-lake | c1 | 180.2 s | (70,22) | 8 soldier | c1 queens_killed | 15776 | 0 |
| `54781230` | wide-plain | c1 | 180.9 s | (155,76) | 24 soldier | c1 queens_killed | 13103 | 0 |
| `15454562` | three-crossings | c1 | 181.3 s | (58,74) | 15 soldier | c1 queens_killed | 7970 | 0 |
| `45810419` | central-lake | c1 | 181.4 s | (55,20) | 40 soldier | c0 queens_killed | 7705 | 2 |
| `52821656` | twin-shields | c1 | 182.9 s | (73,41) | 6 soldier | c0 queens_killed | 10972 | 3 |
| `64331040` | twin-shields | c0 | 184.1 s | (68,20) | 30 soldier | c0 queens_killed | 7045 | 0 |
| `92887237` | four-lanes | c0 | 184.4 s | (65,44) | 24 soldier | c0 queens_killed | 20548 | 0 |
| `41944606` | open-field | c0 | 184.6 s | (36,26) | 12 soldier | c1 queens_killed | 6208 | 2 |
| `35223225` | wide-plain | c0 | 184.7 s | (118,46) | 100 soldier | c1 queens_killed | 12627 | 2 |
| `90451723` | three-crossings | c1 | 185.4 s | (70,18) | 10 soldier | c0 queens_killed | 7758 | 3 |
| `94153018` | open-field | c0 | 186.3 s | (52,22) | 6 soldier | c1 sustained_territory | 13926 | 0 |
| `15454562` | three-crossings | c0 | 186.4 s | (60,22) | 10 soldier | c1 queens_killed | 7970 | 2 |
| `90451723` | three-crossings | c0 | 186.7 s | (70,17) | 8 soldier | c0 queens_killed | 7758 | 0 |
| `96971751` | central-lake-v2 | c0 | 186.8 s | (80,24) | 30 soldier | c0 queens_killed | 10671 | 0 |
| `09908045` | three-crossings-v2 | c1 | 187.3 s | (75,18) | 40 soldier | c1 queens_killed | 10351 | 0 |
| `25267632` | central-lake | c0 | 187.6 s | (70,75) | 8 any | c1 time_up | 17999 | 2 |
| `25283870` | twin-shields | c0 | 187.6 s | (38,47) | 6 soldier | c1 queens_killed | 15353 | 4 |
| `11700020` | central-lake | c0 | 187.8 s | (52,26) | 20 soldier | c1 time_up | 17999 | 1 |
| `81160100` | open-field | c1 | 188.7 s | (58,26) | 20 soldier | c1 queens_killed | 5171 | 0 |
| `19117228` | three-crossings | c1 | 189.1 s | (98,42) | 12 soldier | c0 time_up | 17999 | 0 |
| `22084743` | isthmus | c1 | 189.3 s | (65,42) | 70 soldier | c0 queens_killed | 5197 | 2 |
| `48522177` | four-lanes | c0 | 190.0 s | (34,27) | 20 soldier | c0 queens_killed | 7352 | 0 |
| `94787452` | open-field | c0 | 192.0 s | (62,24) | 40 soldier | c0 queens_killed | 4313 | 0 |
| `19005412` | four-lanes | c0 | 192.1 s | (29,39) | 6 soldier | c1 queens_killed | 10396 | 3 |
| `07731018` | wide-plain | c0 | 193.3 s | (112,20) | 20 soldier | c0 queens_killed | 15179 | 0 |
| `26157212` | three-crossings | c0 | 196.9 s | (70,20) | 18 soldier | c1 queens_killed | 11570 | 3 |
| `38486478` | open-field | c1 | 198.1 s | (88,20) | 16 soldier | c0 queens_killed | 9694 | 2 |
| `45810419` | central-lake | c0 | 198.8 s | (56,19) | 40 soldier | c0 queens_killed | 7705 | 0 |
| `42750609` | three-crossings | c0 | 201.7 s | (48,50) | 30 soldier | c0 queens_killed | 15028 | 0 |
| `46745331` | wide-plain | c0 | 204.0 s | (135,46) | 40 soldier | abandoned | 26031 | 1 |
| `23707719` | twin-shields | c0 | 205.9 s | (66,16) | 36 any | c0 queens_killed | 7415 | 0 |
| `22253010` | wide-plain | c0 | 206.0 s | (86,20) | 25 soldier | c0 time_up | 17999 | 1 |
| `99875775` | isthmus | c0 | 208.0 s | (105,34) | 80 any | c0 queens_killed | 3129 | 0 |
| `52821656` | twin-shields | c0 | 208.8 s | (64,20) | 40 soldier | c0 queens_killed | 10972 | 1 |
| `25267632` | central-lake | c1 | 209.1 s | (69,78) | 12 soldier | c1 time_up | 17999 | 0 |
| `43994773` | central-lake | c0 | 209.7 s | (62,20) | 32 soldier | c1 queens_killed | 15776 | 5 |
| `72352497` | three-crossings | c0 | 211.1 s | (63,48) | 10 soldier | c1 time_up | 17999 | 0 |
| `96189858` | four-lanes | c0 | 212.1 s | (50,48) | 70 soldier | c0 queens_killed | 6519 | 0 |
| `31412721` | open-field | c0 | 212.7 s | (44,27) | 32 soldier | c1 queens_killed | 12199 | 4 |
| `17319532` | four-lanes | c0 | 214.9 s | (82,47) | 60 soldier | c0 queens_killed | 6610 | 0 |
| `18345156` | three-crossings | c0 | 215.5 s | (61,22) | 50 soldier | c1 queens_killed | 7947 | 3 |
| `14122607` | three-crossings-v2 | c1 | 215.5 s | (52,44) | 50 soldier | c0 queens_killed | 15011 | 3 |
| `75124707` | three-crossings-v2 | c0 | 216.1 s | (57,22) | 15 soldier | c0 queens_killed | 9457 | 0 |
| `01107838` | four-lanes | c0 | 216.4 s | (79,40) | 80 soldier | c1 queens_killed | 8972 | 2 |
| `36603752` | open-field | c0 | 217.8 s | (68,48) | 12 soldier | c0 sustained_territory | 9842 | 0 |
| `40274979` | three-crossings | c0 | 218.4 s | (34,47) | 10 soldier | c1 queens_killed | 16799 | 4 |
| `45481725` | open-field | c0 | 218.6 s | (45,24) | 20 soldier | c0 sustained_territory | 15162 | 1 |
| `40169361` | three-crossings | c0 | 219.1 s | (68,20) | 24 soldier | c0 queens_killed | 8433 | 0 |
| `44279384` | isthmus | c0 | 219.7 s | (56,48) | 60 soldier | c1 queens_killed | 11709 | 4 |
| `40240427` | three-crossings | c0 | 222.3 s | (72,48) | 20 soldier | abandoned | 8550 | 0 |
| `38724343` | central-lake | c0 | 226.3 s | (64,18) | 12 soldier | c1 queens_killed | 9972 | 2 |
| `45922662` | open-field | c0 | 226.8 s | (37,22) | 40 soldier | c1 queens_killed | 8054 | 3 |
| `40634510` | three-crossings-v2 | c0 | 229.7 s | (68,26) | 100 soldier | c0 queens_killed | 4448 | 0 |
| `75159841` | open-field | c0 | 233.7 s | (64,72) | 12 soldier | c0 time_up | 17999 | 2 |
| `00019141` | open-field | c0 | 235.0 s | (62,48) | 20 soldier | c1 queens_killed | 4565 | 2 |
| `53631010` | open-field | c0 | 235.7 s | (62,42) | 15 soldier | c0 queens_killed | 6856 | 0 |
| `80047765` | isthmus | c0 | 236.4 s | (58,46) | 20 soldier | c1 queens_killed | 8337 | 3 |
| `84050447` | four-lanes | c0 | 237.0 s | (51,48) | 18 soldier | c1 queens_killed | 10126 | 3 |
| `10133600` | open-field | c0 | 237.2 s | (75,48) | 20 soldier | c0 queens_killed | 11418 | 0 |
| `58787130` | isthmus | c0 | 239.2 s | (55,48) | 12 soldier | c1 queens_killed | 11308 | 3 |
| `25283870` | twin-shields | c1 | 239.2 s | (75,24) | 14 soldier | c1 queens_killed | 15353 | 0 |

## Appendix C — every `queenFounded` event (1,031)

`outcome` is W if the founding colony won, L if it lost, `-` if the match was abandoned. `dist` is Chebyshev distance in tiles from the colony's own start box; `prog` is 0 at the own box centre and 1 at the enemy box centre.

```text
map,id8,tick,colony,x,y,dist,prog,outcome
three-crossings,33507518,3203,1,108.5,10.5,0,0.04,W
three-crossings,33507518,3367,0,36.5,74.5,4.5,0.21,L
three-crossings,33507518,5364,1,98.5,79.5,0,0.14,W
three-crossings,33507518,7044,0,58.5,50.5,26.5,0.44,L
three-crossings,33507518,10183,1,76.5,20.5,19.5,0.37,W
three-crossings,33507518,16714,0,74.5,18.5,42.5,0.61,L
central-lake,08226173,3221,1,74.5,16.5,21.5,0.39,L
central-lake,08226173,3865,0,36.5,74.5,4.5,0.21,W
central-lake,08226173,6087,1,90.5,74.5,5.5,0.22,L
central-lake,08226173,9661,1,110.5,16.5,0,0.02,L
open-field,53631010,3044,0,29.5,74.5,0,0.14,W
open-field,53631010,4008,1,80.5,24.5,15.5,0.33,L
open-field,53631010,4881,0,47.5,22.5,15.5,0.33,W
open-field,77391170,3021,0,50.5,44.5,18.5,0.36,W
open-field,77391170,3565,1,92.5,73.5,3.5,0.20,L
open-field,77391170,5024,0,61.5,81.5,29.5,0.47,W
open-field,77391170,5782,1,93.5,21.5,2.5,0.19,L
open-field,77391170,12426,1,62.5,12.5,33.5,0.52,L
open-field,48795416,3143,1,80.5,48.5,15.5,0.33,L
open-field,48795416,3208,0,37.5,26.5,5.5,0.22,W
open-field,48795416,5138,0,36.5,70.5,4.5,0.21,W
open-field,48795416,5441,1,88.5,79.5,7.5,0.24,L
central-lake,31088488,3045,1,108.5,14.5,0,0.04,W
central-lake,31088488,3366,0,32.5,72.5,0.5,0.17,L
central-lake,31088488,5209,0,62.5,20.5,30.5,0.48,L
three-crossings,18228022,3346,1,86.5,76.5,9.5,0.27,W
three-crossings,18228022,5711,1,88.5,18.5,7.5,0.24,W
three-crossings,18228022,12348,1,52.5,48.5,43.5,0.62,W
open-field,35053660,3034,1,80.5,26.5,15.5,0.33,W
open-field,35053660,3441,0,54.5,70.5,22.5,0.40,L
open-field,35053660,5066,1,88.5,73.5,7.5,0.24,W
open-field,35053660,5431,0,37.5,19.5,5.5,0.22,L
open-field,35053660,8934,0,48.5,65.5,16.5,0.34,L
central-lake,11700020,3319,1,110.5,16.5,0,0.02,W
central-lake,11700020,4116,0,52.5,20.5,20.5,0.38,L
central-lake,11700020,8005,0,30.5,74.5,0,0.15,L
central-lake,25267632,3489,0,37.5,81.5,5.5,0.22,L
central-lake,25267632,3530,1,90.5,20.5,5.5,0.22,W
central-lake,25267632,5601,1,91.5,68.5,4.5,0.21,W
central-lake,25267632,5853,0,14.5,14.5,0,-0.02,L
open-field,87976804,3235,0,20.5,16.5,0,0.05,W
open-field,87976804,5060,1,112.5,16.5,0,-0.01,L
open-field,87976804,5087,0,48.5,48.5,16.5,0.34,W
open-field,87976804,7193,0,48.5,80.5,16.5,0.34,W
three-crossings,41660520,3272,0,40.5,22.5,8.5,0.26,L
three-crossings,41660520,4664,1,94.5,80.5,1.5,0.18,W
three-crossings,41660520,5981,0,48.5,72.5,16.5,0.34,L
three-crossings,41660520,8002,1,75.5,24.5,20.5,0.38,W
three-crossings,41660520,11973,0,16.5,84.5,0,0.01,L
open-field,73198516,3741,1,88.5,22.5,7.5,0.24,W
open-field,73198516,6468,0,32.5,79.5,0.5,0.17,L
open-field,73198516,6469,1,87.5,69.5,8.5,0.26,W
open-field,41645846,3094,0,30.5,18.5,0,0.15,W
open-field,41645846,3787,1,92.5,18.5,3.5,0.20,L
open-field,41645846,5168,0,56.5,44.5,24.5,0.42,W
open-field,41645846,6183,1,88.5,72.5,7.5,0.24,L
open-field,41645846,10383,1,62.5,6.5,33.5,0.52,L
three-crossings,89973811,3062,1,96.5,16.5,0,0.16,L
three-crossings,89973811,3298,0,38.5,76.5,6.5,0.23,W
three-crossings,89973811,5153,0,52.5,15.5,20.5,0.38,W
three-crossings,89973811,5282,1,98.5,78.5,0,0.14,L
open-field,32532129,3188,0,54.5,44.5,22.5,0.40,W
open-field,05043520,3395,1,77.5,42.5,18.5,0.36,W
open-field,05043520,6016,1,92.5,74.5,3.5,0.20,W
open-field,75159841,3042,0,36.5,20.5,4.5,0.21,W
open-field,75159841,3405,1,76.5,44.5,19.5,0.37,L
open-field,75159841,5205,1,88.5,76.5,7.5,0.24,L
open-field,75159841,5207,0,38.5,72.5,6.5,0.23,W
open-field,75159841,10603,1,36.5,20.5,59.5,0.79,L
open-field,75159841,12700,0,32.5,18.5,0.5,0.17,W
open-field,75159841,14953,0,36.5,76.5,4.5,0.21,W
open-field,34134008,3352,1,86.5,78.5,9.5,0.27,L
open-field,34134008,3664,0,50.5,48.5,18.5,0.36,W
open-field,34134008,5839,0,25.5,17.5,0,0.10,W
open-field,34134008,6204,1,90.5,38.5,5.5,0.22,L
open-field,74282007,3053,0,16.5,80.5,0,0.01,L
open-field,74282007,3158,1,78.5,22.5,17.5,0.35,W
open-field,74282007,5720,1,73.5,71.5,22.5,0.40,W
open-field,74282007,6054,0,0.5,16.5,0,-0.16,L
central-lake,83881612,3178,0,44.5,26.5,12.5,0.30,W
central-lake,83881612,3898,1,84.5,20.5,11.5,0.29,L
central-lake,83881612,5586,0,55.5,80.5,23.5,0.41,W
central-lake,83881612,7639,0,14.5,14.5,0,-0.02,W
central-lake,83881612,8317,1,92.5,79.5,3.5,0.20,L
open-field,67682322,3005,1,92.5,79.5,3.5,0.20,W
open-field,67682322,3797,0,40.5,48.5,8.5,0.26,L
open-field,67682322,5294,1,110.5,14.5,0,0.02,W
open-field,67682322,8752,1,76.5,30.5,19.5,0.37,W
open-field,32062548,3792,1,69.5,48.5,26.5,0.44,W
open-field,32062548,5592,1,86.5,20.5,9.5,0.27,W
open-field,10133600,3267,0,30.5,18.5,0,0.15,W
open-field,10133600,3349,1,82.5,22.5,13.5,0.31,L
open-field,10133600,5331,0,32.5,77.5,0.5,0.17,W
open-field,10133600,7681,1,90.5,78.5,5.5,0.22,L
three-crossings,26108256,3053,1,96.5,74.5,0,0.16,W
three-crossings,26108256,3076,0,30.5,74.5,0,0.15,L
three-crossings,26108256,5091,0,50.5,34.5,18.5,0.36,L
three-crossings,26108256,6841,1,122.5,5.5,0,-0.11,W
three-crossings,40274979,3195,0,24.5,26.5,0,0.09,L
three-crossings,40274979,3316,1,94.5,76.5,1.5,0.18,W
three-crossings,40274979,6774,0,54.5,77.5,22.5,0.40,L
three-crossings,40274979,8681,1,109.5,14.5,0,0.03,W
three-crossings,40274979,16323,0,56.5,77.5,24.5,0.42,L
open-field,39629863,3207,1,92.5,80.5,3.5,0.20,W
open-field,39629863,5725,0,44.5,30.5,12.5,0.30,L
open-field,39629863,9091,0,34.5,78.5,2.5,0.19,L
open-field,39629863,9547,1,102.5,13.5,0,0.10,W
central-lake,16088424,3009,0,36.5,80.5,4.5,0.21,L
central-lake,16088424,3160,1,93.5,75.5,2.5,0.19,W
central-lake,16088424,4883,0,38.5,16.5,6.5,0.23,L
central-lake,16088424,5895,1,110.5,8.5,0,0.02,W
central-lake,16088424,16221,1,74.5,20.5,21.5,0.39,W
three-crossings,58494966,3042,0,38.5,80.5,6.5,0.23,W
three-crossings,58494966,3188,1,106.5,14.5,0,0.06,L
three-crossings,58494966,5615,0,12.5,16.5,0,-0.04,W
three-crossings,58494966,5657,1,90.5,77.5,5.5,0.22,L
three-crossings,58494966,10686,1,71.5,25.5,24.5,0.42,L
open-field,78116464,4907,0,14.5,14.5,0,-0.02,W
open-field,78116464,6923,0,30.5,84.5,0,0.15,W
three-crossings,19117228,3066,0,36.5,20.5,4.5,0.21,W
three-crossings,19117228,3090,1,98.5,78.5,0,0.14,L
three-crossings,19117228,5400,1,91.5,22.5,4.5,0.21,L
three-crossings,19117228,5644,0,32.5,78.5,0.5,0.17,W
three-crossings,19117228,9811,1,72.5,49.5,23.5,0.41,L
central-lake,88370146,3202,0,28.5,80.5,0,0.13,W
central-lake,88370146,3533,1,108.5,14.5,0,0.04,L
central-lake,88370146,5481,1,92.5,78.5,3.5,0.20,L
central-lake,88370146,5913,0,50.5,20.5,18.5,0.36,W
central-lake,88370146,15192,1,92.5,77.5,3.5,0.20,L
open-field,81685402,3730,1,91.5,21.5,4.5,0.21,L
open-field,81685402,5491,0,32.5,70.5,0.5,0.17,W
open-field,81685402,6495,1,103.5,52.5,0,0.09,L
open-field,81685402,9294,0,66.5,46.5,34.5,0.53,W
open-field,81685402,10897,1,92.5,76.5,3.5,0.20,L
open-field,00019141,3007,1,94.5,18.5,1.5,0.18,W
open-field,00019141,3133,0,51.5,61.5,19.5,0.37,L
central-lake,59740912,3076,1,99.5,75.5,0,0.13,W
central-lake,59740912,3525,0,20.5,14.5,0,0.05,L
central-lake,59740912,5171,1,66.5,72.5,29.5,0.47,W
central-lake,59740912,6072,0,32.5,79.5,0.5,0.17,L
central-lake,59740912,8691,0,54.5,18.5,22.5,0.40,L
central-lake,59740912,11064,0,26.5,47.5,0,0.11,L
central-lake,60794745,3151,0,35.5,72.5,3.5,0.20,W
central-lake,60794745,3657,1,91.5,76.5,4.5,0.21,L
open-field,29353446,3582,0,32.5,16.5,0.5,0.17,L
open-field,29353446,3734,1,107.5,40.5,0,0.05,W
open-field,29353446,6164,1,97.5,74.5,0,0.15,W
open-field,29353446,8504,1,83.5,15.5,12.5,0.30,W
open-field,41888640,3191,0,63.5,76.5,31.5,0.49,W
open-field,41888640,5180,0,55.5,19.5,23.5,0.41,W
open-field,41888640,8814,0,44.5,50.5,12.5,0.30,W
three-crossings,31032909,3029,1,104.5,60.5,0,0.08,W
three-crossings,31032909,3376,0,29.5,37.5,0,0.14,L
three-crossings,31032909,5884,0,53.5,69.5,21.5,0.39,L
three-crossings,31032909,6706,1,68.5,24.5,27.5,0.45,W
open-field,93231109,3013,1,88.5,70.5,7.5,0.24,W
open-field,93231109,3808,0,36.5,12.5,4.5,0.21,L
open-field,93231109,5469,1,72.5,40.5,23.5,0.41,W
open-field,93231109,6259,0,36.5,46.5,4.5,0.21,L
open-field,93231109,9848,0,55.5,81.5,23.5,0.41,L
open-field,93231109,14109,0,43.5,83.5,11.5,0.29,L
three-crossings,87878967,3028,0,32.5,80.5,0.5,0.17,L
three-crossings,87878967,3052,1,96.5,72.5,0,0.16,W
three-crossings,87878967,5001,0,54.5,22.5,22.5,0.40,L
three-crossings,87878967,5297,1,124.5,90.5,0,-0.13,W
central-lake,57117331,3391,0,30.5,76.5,0,0.15,W
central-lake,57117331,3655,1,94.5,80.5,1.5,0.18,L
open-field,83751506,3062,0,31.5,72.5,0,0.16,W
open-field,83751506,4129,1,98.5,76.5,0,0.14,L
open-field,83751506,5099,0,46.5,40.5,14.5,0.32,W
open-field,83751506,6667,1,122.5,50.5,0,-0.11,L
open-field,83751506,6929,0,4.5,92.5,0,-0.12,W
central-lake,24078806,3128,1,104.5,23.5,0,0.08,W
central-lake,24078806,3359,0,32.5,73.5,0.5,0.17,L
central-lake,24078806,4977,1,70.5,82.5,25.5,0.43,W
central-lake,24078806,5767,0,2.5,56.5,0,-0.14,L
central-lake,24078806,8339,0,8.5,90.5,0,-0.08,L
three-crossings,81715116,4710,0,86.5,80.5,54.5,0.73,W
central-lake,45810419,3122,1,90.5,76.5,5.5,0.22,L
central-lake,45810419,3147,0,52.5,12.5,20.5,0.38,W
three-crossings,51297630,3075,0,34.5,72.5,2.5,0.19,L
three-crossings,51297630,3098,1,92.5,76.5,3.5,0.20,W
three-crossings,51297630,5057,1,76.5,24.5,19.5,0.37,W
three-crossings,51297630,6056,0,6.5,54.5,0,-0.10,L
central-lake,38724343,3029,1,80.5,20.5,15.5,0.33,W
central-lake,38724343,3199,0,40.5,70.5,8.5,0.26,L
open-field,72546330,3505,0,55.5,25.5,23.5,0.41,-
open-field,72546330,3579,1,96.5,48.5,0,0.16,-
open-field,72546330,5787,0,60.5,66.5,28.5,0.46,-
three-crossings,40240427,3300,1,91.5,75.5,4.5,0.21,-
three-crossings,40240427,4179,0,50.5,22.5,18.5,0.36,-
open-field,57765625,3073,1,112.5,16.5,0,-0.01,L
open-field,57765625,3089,0,54.5,20.5,22.5,0.40,W
open-field,57765625,4942,0,32.5,60.5,0.5,0.17,W
open-field,57765625,5161,1,112.5,80.5,0,-0.01,L
open-field,57765625,7024,1,80.5,48.5,15.5,0.33,L
open-field,57765625,7401,0,32.5,92.5,0.5,0.17,W
open-field,57765625,13220,1,112.5,48.5,0,-0.01,L
open-field,65826274,3852,0,38.5,72.5,6.5,0.23,W
open-field,65826274,4219,1,90.5,18.5,5.5,0.22,L
open-field,94153018,3434,1,75.5,22.5,20.5,0.38,W
open-field,94153018,5491,0,30.5,60.5,0,0.15,L
open-field,94153018,5898,1,99.5,50.5,0,0.13,W
open-field,94153018,8233,1,90.5,81.5,5.5,0.22,W
central-lake,14544450,3009,0,39.5,68.5,7.5,0.24,-
three-crossings,81580872,3130,1,98.5,76.5,0,0.14,W
three-crossings,81580872,3457,0,39.5,73.5,7.5,0.24,L
three-crossings,81580872,5728,0,9.5,85.5,0,-0.07,L
three-crossings,81580872,6620,1,82.5,47.5,13.5,0.31,W
open-field,67071163,3096,0,48.5,22.5,16.5,0.34,L
open-field,67071163,3977,1,88.5,74.5,7.5,0.24,W
open-field,67071163,12544,1,116.5,50.5,0,-0.05,W
open-field,63552135,3108,0,20.5,14.5,0,0.05,W
open-field,63552135,4988,0,48.5,47.5,16.5,0.34,W
central-lake,89178265,3159,0,50.5,18.5,18.5,0.36,L
central-lake,89178265,3276,1,91.5,18.5,4.5,0.21,W
central-lake,89178265,5112,0,50.5,78.5,18.5,0.36,L
central-lake,89178265,5157,1,95.5,78.5,0.5,0.17,W
central-lake,89178265,11971,0,16.5,16.5,0,0.01,L
three-crossings,58486958,3109,0,41.5,23.5,9.5,0.27,W
three-crossings,58486958,4947,0,20.5,54.5,0,0.05,W
three-crossings,58486958,5755,1,79.5,27.5,16.5,0.34,L
three-crossings,58486958,7085,0,34.5,84.5,2.5,0.19,W
three-crossings,58486958,8828,1,93.5,83.5,2.5,0.19,L
three-crossings,58486958,10337,0,59.5,51.5,27.5,0.45,W
central-lake,99970207,4799,1,95.5,75.5,0.5,0.17,W
central-lake,99970207,8878,1,107.5,14.5,0,0.05,W
central-lake,99970207,10684,1,63.5,75.5,32.5,0.51,W
three-crossings,39087893,3201,0,30.5,78.5,0,0.15,W
three-crossings,94220267,4219,1,119.5,16.5,0,-0.08,W
three-crossings,94220267,4675,0,34.5,74.5,2.5,0.19,L
three-crossings,94220267,6024,1,101.5,79.5,0,0.11,W
three-crossings,94220267,6617,0,19.5,14.5,0,0.04,L
three-crossings,94220267,7931,1,88.5,26.5,7.5,0.24,W
three-crossings,94220267,13653,0,51.5,45.5,19.5,0.37,L
central-lake,82895072,3193,1,94.5,77.5,1.5,0.18,W
central-lake,82895072,4106,0,31.5,70.5,0,0.16,L
central-lake,82521085,3004,1,98.5,75.5,0,0.14,W
central-lake,82521085,3252,0,50.5,16.5,18.5,0.36,L
central-lake,82521085,5080,0,50.5,76.5,18.5,0.36,L
central-lake,82521085,5112,1,51.5,18.5,44.5,0.63,W
central-lake,47845196,3196,0,36.5,18.5,4.5,0.21,-
central-lake,00825646,3742,1,87.5,23.5,8.5,0.26,W
central-lake,00825646,5812,0,32.5,74.5,0.5,0.17,L
open-field,81160100,3298,1,95.5,71.5,0.5,0.17,W
open-field,81160100,3876,0,57.5,74.5,25.5,0.43,L
open-field,47820274,3648,1,79.5,47.5,16.5,0.34,W
open-field,47820274,5796,1,50.5,72.5,45.5,0.64,W
open-field,47820274,8889,1,86.5,15.5,9.5,0.27,W
open-field,05184122,4253,1,92.5,18.5,3.5,0.20,L
open-field,05184122,5272,0,40.5,20.5,8.5,0.26,W
open-field,05184122,6584,1,92.5,78.5,3.5,0.20,L
open-field,05184122,10460,0,40.5,72.5,8.5,0.26,W
open-field,05184122,11175,1,76.5,48.5,19.5,0.37,L
central-lake,90417063,3186,0,32.5,80.5,0.5,0.17,-
central-lake,90417063,3379,1,92.5,20.5,3.5,0.20,-
central-lake,90417063,5113,0,33.5,18.5,1.5,0.18,-
three-crossings,22098734,3038,0,36.5,70.5,4.5,0.21,W
three-crossings,22098734,4871,0,50.5,40.5,18.5,0.36,W
open-field,36603752,3055,0,28.5,71.5,0,0.13,W
open-field,36603752,4342,1,84.5,67.5,11.5,0.29,L
open-field,36603752,5003,0,55.5,40.5,23.5,0.41,W
central-lake,89796189,3086,0,47.5,15.5,15.5,0.33,W
central-lake,89796189,4063,1,89.5,75.5,6.5,0.23,L
central-lake,89796189,5145,0,47.5,79.5,15.5,0.33,W
central-lake,89796189,6073,1,110.5,14.5,0,0.02,L
open-field,24005336,3085,0,39.5,23.5,7.5,0.24,W
open-field,24005336,4323,1,88.5,24.5,7.5,0.24,L
open-field,24005336,6646,0,35.5,76.5,3.5,0.20,W
open-field,24005336,6787,1,88.5,70.5,7.5,0.24,L
open-field,78125926,3104,0,50.5,48.5,18.5,0.36,L
open-field,78125926,3284,1,93.5,77.5,2.5,0.19,W
open-field,78125926,5156,1,91.5,12.5,4.5,0.21,W
open-field,83942814,3072,0,36.5,15.5,4.5,0.21,W
open-field,83942814,5057,0,39.5,69.5,7.5,0.24,W
three-crossings,05550689,3198,0,28.5,70.5,0,0.13,W
three-crossings,05550689,5029,0,40.5,8.5,8.5,0.26,W
central-lake,13080499,3010,1,100.5,78.5,0,0.12,W
central-lake,13080499,3428,0,32.5,81.5,0.5,0.17,L
central-lake,13080499,4826,1,96.5,18.5,0,0.16,W
central-lake,13080499,5321,0,32.5,20.5,0.5,0.17,L
central-lake,13080499,9071,1,66.5,86.5,29.5,0.47,W
three-crossings,90451723,3112,0,30.5,72.5,0,0.15,W
three-crossings,90451723,3398,1,100.5,60.5,0,0.12,L
three-crossings,90451723,5232,1,112.5,92.5,0,-0.01,L
three-crossings,76287737,3069,0,38.5,68.5,6.5,0.23,L
three-crossings,76287737,3081,1,94.5,70.5,1.5,0.18,W
three-crossings,76287737,4990,0,48.5,16.5,16.5,0.34,L
three-crossings,76287737,5329,1,82.5,40.5,13.5,0.31,W
three-crossings,76287737,7120,0,8.5,82.5,0,-0.08,L
isthmus,99875775,3060,0,34.5,74.5,2.5,0.19,W
wide-plain,78158756,3052,0,84.5,79.5,20.5,0.27,W
wide-plain,78158756,4036,1,200.5,68.5,0,0.12,L
wide-plain,78158756,4898,0,36.5,60.5,0,0.02,W
wide-plain,78158756,5975,1,164.5,42.5,27.5,0.31,L
wide-plain,78158756,6748,0,6.5,40.5,0,-0.13,W
wide-plain,78158756,8173,1,223.5,11.5,0,0.00,L
twin-shields,70899180,3274,1,96.5,62.5,0,0.16,L
twin-shields,70899180,3427,0,38.5,68.5,6.5,0.23,W
twin-shields,70899180,5209,1,72.5,22.5,23.5,0.41,L
twin-shields,70899180,6994,0,4.5,62.5,0,-0.12,W
twin-shields,70899180,10280,1,127.5,51.5,0,-0.16,L
four-lanes,58334824,3245,0,62.5,45.5,30.5,0.48,W
four-lanes,58334824,3323,1,112.5,76.5,0,-0.01,L
four-lanes,58334824,5127,0,33.5,80.5,1.5,0.18,W
open-field,78547385,3042,0,52.5,70.5,20.5,0.38,L
open-field,78547385,3238,1,102.5,79.5,0,0.10,W
open-field,78547385,5379,1,122.5,53.5,0,-0.11,W
three-crossings,21191950,3340,0,15.5,12.5,0,-0.01,W
four-lanes,90609688,3616,1,80.5,49.5,15.5,0.33,W
four-lanes,90609688,5566,1,110.5,30.5,0,0.02,W
four-lanes,90609688,7591,1,80.5,82.5,15.5,0.33,W
four-lanes,90609688,12809,1,46.5,20.5,49.5,0.68,W
four-lanes,75196224,3043,1,82.5,84.5,13.5,0.31,W
four-lanes,75196224,3264,0,32.5,32.5,0.5,0.17,L
four-lanes,75196224,4971,1,76.5,12.5,19.5,0.37,W
four-lanes,75196224,6057,0,40.5,90.5,8.5,0.26,L
four-lanes,75196224,7580,1,64.5,46.5,31.5,0.49,W
open-field,45901815,3080,1,92.5,72.5,3.5,0.20,W
open-field,45901815,3328,0,36.5,70.5,4.5,0.21,L
open-field,45901815,5755,0,48.5,8.5,16.5,0.34,L
open-field,45901815,6518,1,78.5,24.5,17.5,0.35,W
open-field,45901815,14372,0,64.5,54.5,32.5,0.51,L
four-lanes,95750130,3210,1,82.5,80.5,13.5,0.31,W
four-lanes,95750130,3306,0,48.5,50.5,16.5,0.34,L
four-lanes,95750130,5277,0,15.5,16.5,0,-0.01,L
four-lanes,95750130,5558,1,68.5,114.5,27.5,0.45,W
wide-plain,22253010,3084,1,166.5,63.5,25.5,0.30,L
wide-plain,22253010,3197,0,86.5,20.5,22.5,0.28,W
wide-plain,22253010,4992,1,160.5,28.5,31.5,0.33,L
wide-plain,22253010,5262,0,86.5,76.5,22.5,0.28,W
wide-plain,22253010,6857,1,200.5,72.5,0,0.12,L
wide-plain,22253010,7431,0,120.5,45.5,56.5,0.46,W
wide-plain,22253010,16431,0,60.5,54.5,0,0.15,W
three-crossings,71531877,3117,0,48.5,47.5,16.5,0.34,W
three-crossings,71531877,4128,1,84.5,16.5,11.5,0.29,L
three-crossings,71531877,5201,0,48.5,80.5,16.5,0.34,W
three-crossings,71531877,6183,1,90.5,80.5,5.5,0.22,L
three-crossings,71531877,7606,0,48.5,14.5,16.5,0.34,W
three-crossings,71531877,8092,1,124.5,80.5,0,-0.13,L
three-crossings,71531877,10092,0,15.5,13.5,0,-0.01,W
three-crossings,71531877,10824,1,124.5,16.5,0,-0.13,L
three-crossings,71531877,14827,0,15.5,80.5,0,-0.01,W
three-crossings,46768027,3032,1,100.5,70.5,0,0.12,L
three-crossings,46768027,3236,0,25.5,26.5,0,0.10,W
three-crossings,46768027,4845,1,82.5,28.5,13.5,0.31,L
three-crossings,46768027,5666,0,0.5,48.5,0,-0.16,W
open-field,54632998,3093,0,32.5,70.5,0.5,0.17,W
open-field,54632998,4144,1,86.5,20.5,9.5,0.27,L
open-field,54632998,4986,0,48.5,38.5,16.5,0.34,W
open-field,54632998,6211,1,78.5,51.5,17.5,0.35,L
wide-plain,90998417,3197,0,84.5,69.5,20.5,0.27,W
wide-plain,90998417,3470,1,178.5,82.5,13.5,0.24,L
wide-plain,90998417,5005,0,84.5,10.5,20.5,0.27,W
wide-plain,90998417,6210,1,190.5,10.5,1.5,0.17,L
wide-plain,90998417,8629,0,118.5,10.5,54.5,0.45,W
three-crossings,43489473,3133,0,38.5,69.5,6.5,0.23,W
three-crossings,43489473,5000,0,52.5,20.5,20.5,0.38,W
central-lake,08324812,3066,1,114.5,12.5,0,-0.03,L
central-lake,08324812,3419,0,37.5,72.5,5.5,0.22,W
central-lake,08324812,4916,1,104.5,80.5,0,0.08,L
central-lake,08324812,5469,0,48.5,21.5,16.5,0.34,W
central-lake,08324812,6769,1,82.5,26.5,13.5,0.31,L
central-lake,08324812,10033,0,4.5,72.5,0,-0.12,W
central-lake,08324812,11431,1,94.5,78.5,1.5,0.18,L
central-lake,08324812,13856,0,39.5,0.5,7.5,0.24,W
isthmus,02857985,3138,1,92.5,20.5,3.5,0.20,L
isthmus,02857985,3692,0,43.5,30.5,11.5,0.29,W
isthmus,02857985,5593,1,92.5,75.5,3.5,0.20,L
isthmus,02857985,6522,0,36.5,74.5,4.5,0.21,W
isthmus,02857985,8769,0,70.5,50.5,38.5,0.57,W
four-lanes,35368272,3437,0,50.5,47.5,18.5,0.36,W
four-lanes,35368272,4073,1,111.5,29.5,0,0.01,L
four-lanes,35368272,5769,0,48.5,80.5,16.5,0.34,W
four-lanes,35368272,5974,1,111.5,97.5,0,0.01,L
four-lanes,35368272,10658,1,80.5,15.5,15.5,0.33,L
wide-plain,68922728,3555,0,63.5,45.5,0,0.16,L
wide-plain,68922728,3564,1,168.5,73.5,23.5,0.29,W
wide-plain,68922728,5893,0,39.5,14.5,0,0.04,L
wide-plain,68922728,6071,1,167.5,22.5,24.5,0.29,W
wide-plain,68922728,10560,1,131.5,46.5,60.5,0.48,W
twin-shields,71112256,3077,0,30.5,68.5,0,0.15,W
twin-shields,71112256,3135,1,111.5,15.5,0,0.01,L
twin-shields,71112256,5097,0,62.5,70.5,30.5,0.48,W
twin-shields,71112256,5752,1,95.5,75.5,0.5,0.17,L
twin-shields,71112256,9612,1,80.5,23.5,15.5,0.33,L
twin-shields,08128762,3301,0,32.5,76.5,0.5,0.17,W
twin-shields,08128762,5115,0,60.5,48.5,28.5,0.46,W
twin-shields,08128762,7208,1,94.5,80.5,1.5,0.18,L
four-lanes,66669342,3101,0,15.5,95.5,0,-0.01,L
four-lanes,66669342,5649,1,88.5,40.5,7.5,0.24,W
four-lanes,66669342,6900,0,45.5,45.5,13.5,0.31,L
four-lanes,66669342,7752,1,70.5,123.5,25.5,0.43,W
four-lanes,66669342,11489,1,62.5,17.5,33.5,0.52,W
three-crossings,39347650,3036,1,76.5,17.5,19.5,0.37,W
three-crossings,39347650,3135,0,31.5,68.5,0,0.16,L
three-crossings,39347650,5119,0,56.5,46.5,24.5,0.42,L
three-crossings,39347650,5343,1,94.5,72.5,1.5,0.18,W
wide-plain,40108162,3148,1,170.5,74.5,21.5,0.28,W
wide-plain,40108162,3153,0,84.5,74.5,20.5,0.27,L
wide-plain,40108162,4997,0,104.5,35.5,40.5,0.38,L
wide-plain,40108162,5521,1,154.5,40.5,37.5,0.36,W
open-field,11956920,3056,1,95.5,80.5,0.5,0.17,W
open-field,11956920,3278,0,30.5,74.5,0,0.15,L
open-field,11956920,5041,1,72.5,48.5,23.5,0.41,W
open-field,11956920,5655,0,8.5,48.5,0,-0.08,L
open-field,11956920,11689,0,1.5,93.5,0,-0.15,L
open-field,11956920,13165,1,72.5,12.5,23.5,0.41,W
central-lake,36533908,3114,0,36.5,77.5,4.5,0.21,W
central-lake,36533908,3747,1,112.5,15.5,0,-0.01,L
central-lake,36533908,4982,0,42.5,44.5,10.5,0.28,W
central-lake,36533908,6549,1,97.5,80.5,0,0.15,L
central-lake,36533908,10565,0,80.5,20.5,48.5,0.67,W
isthmus,06884074,3321,1,84.5,20.5,11.5,0.29,L
isthmus,06884074,3637,0,30.5,54.5,0,0.15,W
isthmus,06884074,5949,0,67.5,50.5,35.5,0.54,W
isthmus,06884074,9698,0,104.5,70.5,72.5,0.92,W
central-lake,03071116,3293,1,86.5,76.5,9.5,0.27,W
central-lake,03071116,3414,0,40.5,62.5,8.5,0.26,L
central-lake,03071116,5844,1,90.5,20.5,5.5,0.22,W
central-lake,03071116,8432,0,52.5,25.5,20.5,0.38,L
central-lake,03071116,11231,1,89.5,82.5,6.5,0.23,W
isthmus,09286179,3202,0,34.5,69.5,2.5,0.19,W
isthmus,09286179,3875,1,76.5,44.5,19.5,0.37,L
isthmus,09286179,6027,1,95.5,70.5,0.5,0.17,L
isthmus,09286179,12390,0,46.5,24.5,14.5,0.32,W
isthmus,09286179,15023,1,80.5,32.5,15.5,0.33,L
wide-plain,62236412,3030,1,192.5,42.5,0,0.16,W
wide-plain,62236412,5789,0,68.5,48.5,4.5,0.19,L
open-field,31412721,3091,1,93.5,70.5,2.5,0.19,W
open-field,31412721,3258,0,36.5,76.5,4.5,0.21,L
open-field,31412721,5076,0,51.5,26.5,19.5,0.37,L
open-field,31412721,5896,1,122.5,52.5,0,-0.11,W
open-field,31412721,7438,0,4.5,64.5,0,-0.12,L
wide-plain,46745331,3133,0,84.5,52.5,20.5,0.27,-
wide-plain,46745331,3162,1,168.5,72.5,23.5,0.29,-
wide-plain,46745331,5196,1,146.5,14.5,45.5,0.40,-
wide-plain,46745331,7452,0,104.5,20.5,40.5,0.38,-
wide-plain,46745331,14619,1,221.5,60.5,0,0.01,-
wide-plain,46745331,16522,0,84.5,18.5,20.5,0.27,-
three-crossings,42750609,3029,1,100.5,66.5,0,0.12,L
three-crossings,42750609,3134,0,32.5,76.5,0.5,0.17,W
three-crossings,42750609,4866,1,76.5,22.5,19.5,0.37,L
three-crossings,42750609,5165,0,52.5,44.5,20.5,0.38,W
three-crossings,42750609,11553,0,66.5,76.5,34.5,0.53,W
twin-shields,95345568,3156,0,36.5,70.5,4.5,0.21,W
twin-shields,95345568,4212,1,90.5,48.5,5.5,0.22,L
twin-shields,95345568,5745,0,60.5,28.5,28.5,0.46,W
twin-shields,83007497,3340,1,94.5,60.5,1.5,0.18,W
twin-shields,83007497,3374,0,32.5,70.5,0.5,0.17,L
twin-shields,83007497,5701,1,64.5,48.5,31.5,0.49,W
twin-shields,83007497,8129,1,67.5,84.5,28.5,0.46,W
isthmus,73408736,3242,1,92.5,72.5,3.5,0.20,W
isthmus,73408736,6369,1,71.5,39.5,24.5,0.42,W
wide-plain,03999726,3254,0,88.5,33.5,24.5,0.29,-
wide-plain,03999726,3316,1,192.5,22.5,0,0.16,-
wide-plain,03999726,5070,0,90.5,70.5,26.5,0.30,-
wide-plain,03999726,6593,1,158.5,61.5,33.5,0.34,-
wide-plain,03999726,6907,0,126.5,70.5,62.5,0.49,-
wide-plain,03999726,9935,1,175.5,74.5,16.5,0.25,-
wide-plain,03999726,12628,0,118.5,16.5,54.5,0.45,-
isthmus,34390249,3030,1,100.5,69.5,0,0.12,L
isthmus,34390249,4868,1,70.5,48.5,25.5,0.43,L
isthmus,34390249,5393,0,26.5,74.5,0,0.11,W
isthmus,34390249,7176,1,84.5,16.5,11.5,0.29,L
isthmus,34390249,8238,0,32.5,20.5,0.5,0.17,W
isthmus,34390249,12586,0,60.5,50.5,28.5,0.46,W
three-crossings,18345156,3267,0,50.5,21.5,18.5,0.36,L
three-crossings,18345156,3439,1,90.5,73.5,5.5,0.22,W
three-crossings,18345156,5624,0,18.5,60.5,0,0.03,L
twin-shields,59289768,3137,0,64.5,20.5,32.5,0.51,W
twin-shields,59289768,3582,1,90.5,75.5,5.5,0.22,L
twin-shields,59289768,6457,0,64.5,54.5,32.5,0.51,W
four-lanes,28454922,3504,0,56.5,42.5,24.5,0.42,W
four-lanes,28454922,5349,0,50.5,78.5,18.5,0.36,W
four-lanes,19005412,3054,1,84.5,86.5,11.5,0.29,W
four-lanes,19005412,3244,0,45.5,88.5,13.5,0.31,L
four-lanes,19005412,5051,0,55.5,12.5,23.5,0.41,L
four-lanes,19005412,6003,1,48.5,81.5,47.5,0.66,W
four-lanes,19005412,9202,1,76.5,118.5,19.5,0.37,W
isthmus,58787130,3014,0,32.5,70.5,0.5,0.17,L
isthmus,58787130,3493,1,104.5,14.5,0,0.08,W
isthmus,58787130,4901,0,54.5,44.5,22.5,0.40,L
isthmus,58787130,5470,1,89.5,73.5,6.5,0.23,W
four-lanes,04996456,3331,0,48.5,48.5,16.5,0.34,L
four-lanes,04996456,4837,1,94.5,34.5,1.5,0.18,W
four-lanes,04996456,5656,0,48.5,82.5,16.5,0.34,L
four-lanes,04996456,11957,1,70.5,110.5,25.5,0.43,W
four-lanes,04996456,15424,0,52.5,4.5,20.5,0.38,L
four-lanes,04996456,22540,0,50.5,48.5,18.5,0.36,L
wide-plain,26036548,3140,0,84.5,63.5,20.5,0.27,W
wide-plain,26036548,3312,1,175.5,73.5,16.5,0.25,L
wide-plain,26036548,4987,0,88.5,20.5,24.5,0.29,W
wide-plain,26036548,9928,0,140.5,46.5,76.5,0.57,W
wide-plain,48386624,3073,1,167.5,23.5,24.5,0.29,W
wide-plain,48386624,3308,0,108.5,72.5,44.5,0.40,L
wide-plain,48386624,5137,1,130.5,18.5,61.5,0.49,W
wide-plain,48386624,5260,0,62.5,63.5,0,0.16,L
twin-shields,25283870,3016,1,90.5,20.5,5.5,0.22,W
twin-shields,25283870,3966,0,41.5,18.5,9.5,0.27,L
twin-shields,25283870,6588,0,34.5,80.5,2.5,0.19,L
twin-shields,25283870,7094,1,90.5,78.5,5.5,0.22,W
twin-shields,25283870,12859,0,32.5,47.5,0.5,0.17,L
three-crossings,15454562,3188,1,90.5,68.5,5.5,0.22,W
three-crossings,15454562,3487,0,44.5,28.5,12.5,0.30,L
three-crossings,15454562,5468,1,78.5,24.5,17.5,0.35,W
isthmus,85641506,3090,1,102.5,30.5,0,0.10,W
isthmus,85641506,6190,0,36.5,22.5,4.5,0.21,L
open-field,06911844,3030,0,40.5,72.5,8.5,0.26,W
open-field,06911844,3815,1,84.5,74.5,11.5,0.29,L
open-field,06911844,5008,0,52.5,16.5,20.5,0.38,W
open-field,06911844,6671,1,112.5,14.5,0,-0.01,L
open-field,06911844,6829,0,80.5,72.5,48.5,0.67,W
three-crossings,26157212,3029,1,92.5,78.5,3.5,0.20,W
three-crossings,26157212,3097,0,34.5,72.5,2.5,0.19,L
three-crossings,26157212,4863,1,72.5,48.5,23.5,0.41,W
three-crossings,26157212,5692,0,6.5,54.5,0,-0.10,L
four-lanes,17319532,3022,1,96.5,84.5,0,0.16,L
four-lanes,17319532,3316,0,52.5,82.5,20.5,0.38,W
four-lanes,17319532,5140,0,60.5,46.5,28.5,0.46,W
three-crossings,52867757,3073,1,84.5,68.5,11.5,0.29,W
three-crossings,52867757,3141,0,40.5,76.5,8.5,0.26,L
three-crossings,52867757,5022,1,72.5,22.5,23.5,0.41,W
three-crossings,52867757,7878,0,26.5,44.5,0,0.11,L
four-lanes,54536879,3092,0,51.5,49.5,19.5,0.37,W
four-lanes,54536879,4945,0,58.5,16.5,26.5,0.44,W
four-lanes,54536879,7147,0,48.5,81.5,16.5,0.34,W
three-crossings,40169361,3307,0,32.5,73.5,0.5,0.17,W
three-crossings,40169361,4068,1,88.5,60.5,7.5,0.24,L
three-crossings,40169361,5281,0,56.5,45.5,24.5,0.42,W
open-field,89641178,3208,1,106.5,76.5,0,0.06,L
open-field,89641178,3250,0,32.5,73.5,0.5,0.17,W
open-field,89641178,5071,0,52.5,40.5,20.5,0.38,W
open-field,89641178,5342,1,86.5,48.5,9.5,0.27,L
isthmus,75345202,3182,0,34.5,72.5,2.5,0.19,W
isthmus,75345202,3705,1,100.5,16.5,0,0.12,L
isthmus,75345202,5086,0,42.5,10.5,10.5,0.28,W
isthmus,75345202,6150,1,92.5,76.5,3.5,0.20,L
isthmus,75345202,13462,1,80.5,42.5,15.5,0.33,L
isthmus,75345202,14642,0,2.5,60.5,0,-0.14,W
three-crossings,72352497,3092,0,56.5,48.5,24.5,0.42,L
three-crossings,72352497,3316,1,98.5,41.5,0,0.14,W
three-crossings,72352497,5138,1,88.5,72.5,7.5,0.24,W
three-crossings,72352497,5222,0,40.5,76.5,8.5,0.26,L
three-crossings,72352497,7201,0,52.5,16.5,20.5,0.38,L
three-crossings,89204527,3009,1,114.5,58.5,0,-0.03,W
three-crossings,89204527,3267,0,38.5,76.5,6.5,0.23,L
three-crossings,89204527,4890,1,78.5,24.5,17.5,0.35,W
three-crossings,89204527,5192,0,53.5,44.5,21.5,0.39,L
wide-plain,40841877,3046,1,170.5,70.5,21.5,0.28,W
wide-plain,40841877,4876,1,166.5,30.5,25.5,0.30,W
wide-plain,40841877,5154,0,76.5,39.5,12.5,0.23,L
wide-plain,40841877,8708,0,108.5,24.5,44.5,0.40,L
wide-plain,40841877,14982,1,138.5,78.5,53.5,0.45,W
wide-plain,40841877,20537,1,134.5,45.5,57.5,0.47,W
central-lake,43994773,3016,1,95.5,75.5,0.5,0.17,W
central-lake,43994773,3270,0,32.5,76.5,0.5,0.17,L
central-lake,43994773,4841,1,72.5,24.5,23.5,0.41,W
central-lake,43994773,6333,0,49.5,0.5,17.5,0.35,L
central-lake,43994773,9420,0,0.5,48.5,0,-0.16,L
central-lake,43994773,12871,0,32.5,76.5,0.5,0.17,L
open-field,31815150,3141,0,56.5,48.5,24.5,0.42,W
open-field,31815150,5142,0,36.5,74.5,4.5,0.21,W
twin-shields,23707719,3003,0,54.5,16.5,22.5,0.40,W
twin-shields,23707719,3336,1,88.5,79.5,7.5,0.24,L
twin-shields,23707719,5052,0,92.5,22.5,60.5,0.80,W
three-crossings,26389634,3112,0,33.5,46.5,1.5,0.18,W
three-crossings,26389634,4125,1,72.5,48.5,23.5,0.41,L
three-crossings,26389634,5304,0,56.5,18.5,24.5,0.42,W
twin-shields,65696178,3036,0,38.5,76.5,6.5,0.23,W
twin-shields,65696178,3466,1,84.5,76.5,11.5,0.29,L
twin-shields,65696178,4849,0,52.5,20.5,20.5,0.38,W
twin-shields,65696178,5957,1,80.5,40.5,15.5,0.33,L
twin-shields,65696178,7908,0,90.5,20.5,58.5,0.78,W
central-lake,98007426,3022,0,22.5,30.5,0,0.07,W
isthmus,32389383,3245,1,96.5,72.5,0,0.16,W
isthmus,32389383,3402,0,48.5,48.5,16.5,0.34,L
isthmus,32389383,6438,1,64.5,48.5,31.5,0.49,W
isthmus,32389383,6526,0,32.5,64.5,0.5,0.17,L
open-field,08805277,3035,0,22.5,60.5,0,0.07,W
open-field,08805277,3093,1,78.5,46.5,17.5,0.35,L
open-field,08805277,4904,0,6.5,92.5,0,-0.10,W
open-field,08805277,5546,1,94.5,74.5,1.5,0.18,L
wide-plain,01137641,3012,0,72.5,15.5,8.5,0.21,L
wide-plain,01137641,3694,1,176.5,44.5,15.5,0.25,W
wide-plain,01137641,5178,0,82.5,66.5,18.5,0.26,L
wide-plain,01137641,12877,0,44.5,70.5,0,0.07,L
wide-plain,01137641,16249,0,108.5,40.5,44.5,0.40,L
wide-plain,01137641,22432,1,150.5,66.5,41.5,0.38,W
isthmus,88906667,3010,0,32.5,73.5,0.5,0.17,W
isthmus,88906667,3090,1,95.5,77.5,0.5,0.17,L
isthmus,88906667,4821,0,60.5,46.5,28.5,0.46,W
isthmus,88906667,5176,1,86.5,20.5,9.5,0.27,L
three-crossings,24771668,3101,0,32.5,26.5,0.5,0.17,W
three-crossings,24771668,4058,1,98.5,72.5,0,0.14,L
three-crossings,24771668,4912,0,66.5,48.5,34.5,0.53,W
twin-shields,27591708,3074,1,94.5,70.5,1.5,0.18,W
twin-shields,27591708,3334,0,40.5,26.5,8.5,0.26,L
twin-shields,27591708,4988,1,72.5,23.5,23.5,0.41,W
twin-shields,27591708,5232,0,34.5,60.5,2.5,0.19,L
twin-shields,27591708,6992,1,62.5,80.5,33.5,0.52,W
wide-plain,51975704,3060,0,88.5,21.5,24.5,0.29,W
wide-plain,51975704,5451,1,174.5,72.5,17.5,0.26,L
three-crossings-v2,12750394,3055,0,36.5,72.5,4.5,0.21,W
three-crossings-v2,12750394,4543,1,86.5,56.5,9.5,0.27,L
three-crossings-v2,12750394,5035,0,54.5,18.5,22.5,0.40,W
three-crossings-v2,12750394,9037,0,84.5,57.5,52.5,0.71,W
three-crossings-v2,60721254,3115,1,79.5,32.5,16.5,0.34,W
three-crossings-v2,60721254,3745,0,34.5,79.5,2.5,0.19,L
three-crossings-v2,60721254,4989,1,96.5,70.5,0,0.16,W
three-crossings-v2,60721254,9201,1,54.5,54.5,41.5,0.60,W
three-crossings-v2,60721254,9456,0,12.5,14.5,0,-0.04,L
three-crossings-v2,60721254,12105,1,46.5,21.5,49.5,0.68,W
central-lake-v2,96971751,3097,0,36.5,54.5,4.5,0.21,W
central-lake-v2,96971751,3652,1,84.5,20.5,11.5,0.29,L
central-lake-v2,96971751,4945,0,68.5,74.5,36.5,0.55,W
four-lanes,06488655,3076,1,78.5,45.5,17.5,0.35,W
wide-plain,54781230,3062,1,154.5,76.5,37.5,0.36,W
wide-plain,54781230,3833,0,100.5,20.5,36.5,0.36,L
wide-plain,54781230,6476,1,120.5,70.5,71.5,0.54,W
wide-plain,54781230,7696,0,33.5,14.5,0,0.01,L
wide-plain,99374676,3706,0,50.5,15.5,0,0.10,-
wide-plain,99374676,6337,0,110.5,38.5,46.5,0.41,-
wide-plain,99374676,8636,1,224.5,12.5,0,-0.00,-
wide-plain,99374676,8709,0,150.5,65.5,86.5,0.62,-
wide-plain,99374676,12614,0,96.5,72.5,32.5,0.34,-
three-crossings-v2,75124707,3038,0,20.5,56.5,0,0.05,W
three-crossings-v2,75124707,3132,1,80.5,24.5,15.5,0.33,L
three-crossings-v2,75124707,4917,0,16.5,89.5,0,0.01,W
three-crossings-v2,75124707,5952,1,96.5,78.5,0,0.16,L
three-crossings-v2,75124707,6748,0,50.5,72.5,18.5,0.36,W
four-lanes,92887237,3000,1,98.5,82.5,0,0.14,L
four-lanes,92887237,3112,0,48.5,76.5,16.5,0.34,W
four-lanes,92887237,5122,0,51.5,44.5,19.5,0.37,W
four-lanes,92887237,6104,1,100.5,116.5,0,0.12,L
four-lanes,92887237,16066,0,28.5,10.5,0,0.13,W
isthmus,10475112,3304,0,30.5,76.5,0,0.15,W
isthmus,10475112,5213,0,41.5,28.5,9.5,0.27,W
open-field,85854384,3024,1,88.5,76.5,7.5,0.24,L
open-field,85854384,3052,0,52.5,22.5,20.5,0.38,W
open-field,85854384,5046,0,50.5,64.5,18.5,0.36,W
central-lake-v2,24468816,3253,0,38.5,76.5,6.5,0.23,W
central-lake-v2,24468816,3810,1,92.5,58.5,3.5,0.20,L
central-lake-v2,24468816,5099,0,60.5,20.5,28.5,0.46,W
four-lanes,48522177,3051,0,53.5,42.5,21.5,0.39,W
four-lanes,48522177,4888,0,85.5,57.5,53.5,0.72,W
twin-shields,61734508,3241,1,76.5,40.5,19.5,0.37,L
twin-shields,61734508,3709,0,36.5,16.5,4.5,0.21,W
twin-shields,61734508,5077,1,68.5,72.5,27.5,0.45,L
twin-shields,61734508,5882,0,32.5,77.5,0.5,0.17,W
twin-shields,61734508,7493,1,70.5,28.5,25.5,0.43,L
wide-plain,45031709,3038,0,80.5,15.5,16.5,0.25,L
wide-plain,45031709,3625,1,138.5,45.5,53.5,0.45,W
wide-plain,45031709,4997,0,84.5,64.5,20.5,0.27,L
wide-plain,45031709,5536,1,166.5,71.5,25.5,0.30,W
wide-plain,45031709,8150,1,172.5,19.5,19.5,0.27,W
wide-plain,45031709,11353,0,120.5,75.5,56.5,0.46,L
wide-plain,45031709,16987,1,172.5,53.5,19.5,0.27,W
wide-plain,45031709,20286,0,160.5,70.5,96.5,0.67,L
wide-plain,45031709,23513,1,198.5,47.5,0,0.13,W
twin-shields,53881845,3101,1,98.5,54.5,0,0.14,L
twin-shields,53881845,3130,0,52.5,48.5,20.5,0.38,W
twin-shields,53881845,4982,0,52.5,16.5,20.5,0.38,W
twin-shields,53881845,6940,0,52.5,80.5,20.5,0.38,W
open-field,29185700,3038,0,36.5,68.5,4.5,0.21,W
open-field,29185700,3845,1,80.5,18.5,15.5,0.33,L
open-field,29185700,5029,0,68.5,78.5,36.5,0.55,W
open-field,29185700,7546,1,62.5,46.5,33.5,0.52,L
wide-plain,50075265,3390,0,104.5,78.5,40.5,0.38,W
twin-shields,52821656,3264,0,54.5,48.5,22.5,0.40,W
twin-shields,52821656,3635,1,88.5,70.5,7.5,0.24,L
twin-shields,52821656,5733,0,26.5,68.5,0,0.11,W
twin-shields,52821656,8695,0,58.5,82.5,26.5,0.44,W
twin-shields,52821656,8987,1,95.5,4.5,0.5,0.17,L
central-lake-v2,47742847,3100,0,37.5,73.5,5.5,0.22,L
central-lake-v2,47742847,4129,1,92.5,70.5,3.5,0.20,W
central-lake-v2,47742847,5105,0,55.5,21.5,23.5,0.41,L
central-lake-v2,47742847,6326,1,124.5,55.5,0,-0.13,W
central-lake-v2,47742847,8684,1,118.5,92.5,0,-0.07,W
central-lake-v2,47742847,15350,0,4.5,62.5,0,-0.12,L
wide-plain,50236048,3233,0,84.5,70.5,20.5,0.27,W
wide-plain,50236048,3256,1,188.5,55.5,3.5,0.18,L
wide-plain,50236048,5187,0,146.5,14.5,82.5,0.60,W
wide-plain,50236048,7315,0,110.5,14.5,46.5,0.41,W
wide-plain,50236048,9332,1,166.5,28.5,25.5,0.30,L
wide-plain,50236048,12389,0,52.5,84.5,0,0.11,W
wide-plain,50236048,14241,1,132.5,34.5,59.5,0.48,L
wide-plain,50236048,20391,0,84.5,70.5,20.5,0.27,W
four-lanes,17031689,3013,1,99.5,69.5,0,0.13,L
four-lanes,17031689,3311,0,48.5,48.5,16.5,0.34,W
four-lanes,17031689,6322,0,52.5,82.5,20.5,0.38,W
four-lanes,17031689,7915,1,105.5,4.5,0,0.07,L
wide-plain,93827779,3033,1,240.5,75.5,0,-0.09,L
wide-plain,93827779,3108,0,90.5,22.5,26.5,0.30,W
wide-plain,93827779,5765,0,138.5,22.5,74.5,0.55,W
wide-plain,35223225,3029,0,118.5,46.5,54.5,0.45,L
wide-plain,35223225,3119,1,180.5,40.5,11.5,0.23,W
wide-plain,35223225,7134,1,153.5,16.5,38.5,0.37,W
twin-shields,80206802,3081,1,100.5,72.5,0,0.12,W
twin-shields,80206802,3566,0,54.5,24.5,22.5,0.40,L
twin-shields,80206802,5382,1,66.5,78.5,29.5,0.47,W
twin-shields,80206802,7449,1,126.5,51.5,0,-0.15,W
wide-plain,41473189,3133,1,132.5,70.5,59.5,0.48,W
wide-plain,41473189,3155,0,82.5,69.5,18.5,0.26,L
wide-plain,41473189,5081,0,92.5,18.5,28.5,0.32,L
wide-plain,41473189,5333,1,136.5,38.5,55.5,0.46,W
four-lanes,19542838,3092,0,16.5,28.5,0,0.01,W
four-lanes,19542838,8856,0,66.5,50.5,34.5,0.53,W
open-field,60075481,4308,1,74.5,21.5,21.5,0.39,W
open-field,60075481,4871,0,30.5,72.5,0,0.15,L
open-field,60075481,6994,1,42.5,21.5,53.5,0.72,W
wide-plain,41978417,3231,1,170.5,35.5,21.5,0.28,L
wide-plain,41978417,3403,0,124.5,36.5,60.5,0.48,W
wide-plain,41978417,6847,0,90.5,38.5,26.5,0.30,W
wide-plain,41978417,6997,1,196.5,66.5,0,0.14,L
wide-plain,41978417,17810,0,160.5,20.5,96.5,0.67,W
wide-plain,41978417,21120,0,200.5,22.5,136.5,0.88,W
central-lake-v2,82550959,3101,0,54.5,20.5,22.5,0.40,L
central-lake-v2,82550959,3165,1,110.5,63.5,0,0.02,W
central-lake-v2,82550959,5062,1,70.5,75.5,25.5,0.43,W
central-lake-v2,82550959,5325,0,36.5,74.5,4.5,0.21,L
central-lake-v2,82550959,9545,0,16.5,54.5,0,0.01,L
central-lake-v2,82550959,10305,1,52.5,20.5,43.5,0.62,W
three-crossings-v2,40507422,3185,0,74.5,20.5,42.5,0.61,W
four-lanes,53383878,3033,1,82.5,82.5,13.5,0.31,L
four-lanes,53383878,3113,0,52.5,46.5,20.5,0.38,W
open-field,54627875,4315,0,34.5,76.5,2.5,0.19,W
open-field,54627875,4492,1,92.5,72.5,3.5,0.20,L
open-field,54627875,6706,0,40.5,20.5,8.5,0.26,W
open-field,54627875,7967,1,80.5,24.5,15.5,0.33,L
open-field,54627875,10552,0,66.5,76.5,34.5,0.53,W
wide-plain,77124500,3177,0,83.5,71.5,19.5,0.27,-
wide-plain,77124500,5145,0,88.5,23.5,24.5,0.29,-
wide-plain,77124500,5173,1,168.5,22.5,23.5,0.29,-
wide-plain,77124500,7086,0,126.5,22.5,62.5,0.49,-
wide-plain,77124500,9987,1,140.5,46.5,51.5,0.43,-
wide-plain,77124500,12358,0,122.5,74.5,58.5,0.47,-
open-field,45481725,3086,1,88.5,74.5,7.5,0.24,L
open-field,45481725,3354,0,54.5,60.5,22.5,0.40,W
open-field,45481725,5207,0,54.5,20.5,22.5,0.40,W
open-field,45481725,9443,0,54.5,60.5,22.5,0.40,W
open-field,45481725,11352,0,86.5,76.5,54.5,0.73,W
open-field,45481725,12892,1,126.5,0.5,0,-0.15,L
open-field,38486478,3188,1,92.5,68.5,3.5,0.20,L
open-field,38486478,3635,0,45.5,40.5,13.5,0.31,W
open-field,38486478,6001,0,36.5,72.5,4.5,0.21,W
central-lake-v2,32325689,3666,0,50.5,72.5,18.5,0.36,W
central-lake-v2,32325689,6651,0,84.5,72.5,52.5,0.71,W
central-lake-v2,32325689,11429,0,52.5,24.5,20.5,0.38,W
four-lanes,12781908,3052,0,50.5,80.5,18.5,0.36,W
four-lanes,12781908,3206,1,84.5,82.5,11.5,0.29,L
four-lanes,12781908,5044,1,76.5,115.5,19.5,0.37,L
four-lanes,12781908,6451,0,61.5,45.5,29.5,0.47,W
four-lanes,12781908,8478,0,54.5,12.5,22.5,0.40,W
four-lanes,12781908,9222,1,91.5,76.5,4.5,0.21,L
twin-shields,46462074,3300,1,72.5,24.5,23.5,0.41,W
twin-shields,46462074,3326,0,26.5,56.5,0,0.11,L
central-lake-v2,26763663,3154,0,24.5,15.5,0,0.09,L
central-lake-v2,26763663,3381,1,92.5,68.5,3.5,0.20,W
central-lake-v2,26763663,5429,1,70.5,22.5,25.5,0.43,W
central-lake-v2,26763663,5516,0,46.5,68.5,14.5,0.32,L
central-lake-v2,07171152,3046,1,90.5,70.5,5.5,0.22,W
central-lake-v2,07171152,3244,0,36.5,74.5,4.5,0.21,L
central-lake-v2,07171152,4956,1,72.5,14.5,23.5,0.41,W
central-lake-v2,07171152,5159,0,8.5,52.5,0,-0.08,L
isthmus,80047765,3166,1,78.5,40.5,17.5,0.35,W
isthmus,80047765,4492,0,44.5,40.5,12.5,0.30,L
isthmus,80047765,6581,0,16.5,58.5,0,0.01,L
central-lake-v2,88576342,3130,0,36.5,66.5,4.5,0.21,W
central-lake-v2,88576342,5056,0,86.5,74.5,54.5,0.73,W
four-lanes,28654954,3020,1,78.5,49.5,17.5,0.35,L
four-lanes,28654954,4482,0,40.5,40.5,8.5,0.26,W
four-lanes,28654954,4820,1,76.5,84.5,19.5,0.37,L
four-lanes,28654954,7108,0,8.5,32.5,0,-0.08,W
wide-plain,52539743,3027,1,172.5,62.5,19.5,0.27,W
wide-plain,52539743,3090,0,86.5,76.5,22.5,0.28,L
wide-plain,52539743,4836,1,140.5,40.5,51.5,0.43,W
wide-plain,52539743,4924,0,96.5,40.5,32.5,0.34,L
wide-plain,52539743,7346,0,32.5,76.5,0,0.00,L
twin-shields,74817325,3144,0,35.5,67.5,3.5,0.20,W
twin-shields,74817325,3235,1,94.5,60.5,1.5,0.18,L
twin-shields,74817325,5255,0,62.5,48.5,30.5,0.48,W
twin-shields,74817325,6288,1,100.5,56.5,0,0.12,L
three-crossings-v2,33399664,3234,0,40.5,64.5,8.5,0.26,L
three-crossings-v2,33399664,3545,1,89.5,62.5,6.5,0.23,W
three-crossings-v2,33399664,6312,1,122.5,54.5,0,-0.11,W
three-crossings-v2,33399664,7429,0,52.5,20.5,20.5,0.38,L
open-field,15167107,4176,1,94.5,20.5,1.5,0.18,W
wide-plain,95639659,3255,1,196.5,18.5,0,0.14,L
wide-plain,95639659,3420,0,84.5,20.5,20.5,0.27,W
wide-plain,95639659,5288,0,86.5,65.5,22.5,0.28,W
wide-plain,95639659,5407,1,164.5,16.5,27.5,0.31,L
wide-plain,95639659,7742,0,120.5,45.5,56.5,0.46,W
wide-plain,95639659,9549,1,222.5,64.5,0,0.01,L
wide-plain,95639659,9557,0,150.5,24.5,86.5,0.62,W
wide-plain,95639659,15463,0,191.5,27.5,127.5,0.83,W
wide-plain,95639659,16982,1,248.5,6.5,0,-0.13,L
four-lanes,28947529,3136,0,51.5,45.5,19.5,0.37,W
four-lanes,28947529,3541,1,84.5,84.5,11.5,0.29,L
four-lanes,28947529,4981,0,46.5,85.5,14.5,0.32,W
central-lake-v2,66491321,3066,1,79.5,43.5,16.5,0.34,L
central-lake-v2,66491321,3347,0,36.5,70.5,4.5,0.21,W
central-lake-v2,66491321,7235,1,70.5,75.5,25.5,0.43,L
wide-plain,40130340,3009,1,166.5,62.5,25.5,0.30,W
wide-plain,40130340,3096,0,86.5,20.5,22.5,0.28,L
wide-plain,40130340,5277,0,90.5,54.5,26.5,0.30,L
wide-plain,40130340,5622,1,140.5,40.5,51.5,0.43,W
three-crossings-v2,14122607,3022,1,76.5,48.5,19.5,0.37,L
three-crossings-v2,14122607,3071,0,20.5,60.5,0,0.05,W
three-crossings-v2,14122607,6057,0,24.5,93.5,0,0.09,W
three-crossings-v2,14122607,6850,1,54.5,23.5,41.5,0.60,L
isthmus,02201651,3144,0,36.5,74.5,4.5,0.21,W
wide-plain,28562274,3102,0,83.5,66.5,19.5,0.27,L
wide-plain,28562274,3679,1,172.5,17.5,19.5,0.27,W
wide-plain,28562274,4932,0,86.5,19.5,22.5,0.28,L
wide-plain,28562274,5654,1,232.5,64.5,0,-0.04,W
four-lanes,71038034,3164,0,46.5,78.5,14.5,0.32,W
four-lanes,71038034,5046,0,51.5,9.5,19.5,0.37,W
four-lanes,71038034,5315,1,86.5,44.5,9.5,0.27,L
four-lanes,71038034,9743,0,52.5,114.5,20.5,0.38,W
four-lanes,96189858,3110,1,74.5,46.5,21.5,0.39,L
four-lanes,96189858,3214,0,44.5,80.5,12.5,0.30,W
four-lanes,96189858,5140,0,110.5,50.5,78.5,0.98,W
four-lanes,96189858,5345,1,96.5,82.5,0,0.16,L
three-crossings-v2,09908045,3084,1,75.5,23.5,20.5,0.38,W
three-crossings-v2,09908045,3151,0,40.5,74.5,8.5,0.26,L
three-crossings-v2,09908045,4910,1,85.5,70.5,10.5,0.28,W
three-crossings-v2,09908045,6150,0,46.5,42.5,14.5,0.32,L
isthmus,77111020,3352,0,60.5,48.5,28.5,0.46,W
isthmus,77111020,4219,1,97.5,50.5,0,0.15,L
isthmus,77111020,5154,0,34.5,70.5,2.5,0.19,W
isthmus,77111020,8913,1,103.5,43.5,0,0.09,L
isthmus,78956615,3168,0,32.5,74.5,0.5,0.17,L
isthmus,78956615,3599,1,88.5,80.5,7.5,0.24,W
isthmus,78956615,5141,0,54.5,48.5,22.5,0.40,L
isthmus,78956615,6038,1,100.5,16.5,0,0.12,W
twin-shields,13521590,3012,1,104.5,64.5,0,0.08,W
twin-shields,13521590,3029,0,16.5,58.5,0,0.01,L
twin-shields,13521590,4849,1,119.5,93.5,0,-0.08,W
twin-shields,13521590,5167,0,49.5,22.5,17.5,0.35,L
twin-shields,13521590,6649,1,80.5,90.5,15.5,0.33,W
twin-shields,13521590,9342,0,49.5,57.5,17.5,0.35,L
four-lanes,97911868,3021,1,73.5,45.5,22.5,0.40,W
four-lanes,97911868,3348,0,52.5,7.5,20.5,0.38,L
four-lanes,97911868,5108,1,39.5,45.5,56.5,0.76,W
open-field,83553837,3040,0,60.5,20.5,28.5,0.46,L
open-field,83553837,4184,1,88.5,54.5,7.5,0.24,W
open-field,83553837,6307,1,76.5,84.5,19.5,0.37,W
open-field,83553837,6697,0,58.5,20.5,26.5,0.44,L
open-field,83553837,8505,1,108.5,84.5,0,0.04,W
twin-shields,57392126,3059,1,80.5,70.5,15.5,0.33,L
twin-shields,57392126,3206,0,35.5,77.5,3.5,0.20,W
twin-shields,57392126,5026,0,51.5,48.5,19.5,0.37,W
twin-shields,57392126,6082,1,66.5,18.5,29.5,0.47,L
twin-shields,10203097,3358,1,80.5,18.5,15.5,0.33,W
twin-shields,10203097,3413,0,54.5,44.5,22.5,0.40,L
twin-shields,10203097,10473,1,80.5,8.5,15.5,0.33,W
isthmus,77526526,3007,1,96.5,66.5,0,0.16,W
isthmus,77526526,3040,0,48.5,41.5,16.5,0.34,L
isthmus,77526526,4823,1,82.5,16.5,13.5,0.31,W
isthmus,77526526,6235,0,31.5,74.5,0,0.16,L
three-crossings-v2,42592862,3111,0,54.5,48.5,22.5,0.40,W
three-crossings-v2,42592862,5509,0,36.5,76.5,4.5,0.21,W
three-crossings-v2,42592862,7333,0,82.5,28.5,50.5,0.69,W
three-crossings-v2,42592862,9220,0,90.5,60.5,58.5,0.78,W
three-crossings-v2,42592862,12301,0,18.5,48.5,0,0.03,W
four-lanes,47227971,3077,0,32.5,65.5,0.5,0.17,L
four-lanes,47227971,3127,1,92.5,80.5,3.5,0.20,W
four-lanes,47227971,4957,0,56.5,12.5,24.5,0.42,L
four-lanes,47227971,6774,1,108.5,114.5,0,0.04,W
four-lanes,47227971,8745,1,96.5,6.5,0,0.16,W
four-lanes,47227971,8860,0,34.5,100.5,2.5,0.19,L
isthmus,22084743,3048,0,27.5,70.5,0,0.12,W
isthmus,22084743,3054,1,82.5,40.5,13.5,0.31,L
four-lanes,65625491,3312,0,50.5,39.5,18.5,0.36,W
four-lanes,65625491,5622,0,48.5,85.5,16.5,0.34,W
four-lanes,68905560,3014,0,38.5,76.5,6.5,0.23,W
four-lanes,68905560,3252,1,70.5,42.5,25.5,0.43,L
four-lanes,68905560,5309,0,48.5,10.5,16.5,0.34,W
twin-shields,97412628,3023,0,31.5,73.5,0,0.16,W
twin-shields,97412628,3288,1,103.5,78.5,0,0.09,L
twin-shields,97412628,5085,0,52.5,27.5,20.5,0.38,W
twin-shields,97412628,7843,1,127.5,54.5,0,-0.16,L
open-field,45922662,3051,1,76.5,42.5,19.5,0.37,W
open-field,45922662,4597,0,32.5,54.5,0.5,0.17,L
open-field,45922662,4936,1,88.5,74.5,7.5,0.24,W
open-field,45922662,6430,0,42.5,87.5,10.5,0.28,L
open-field,45922662,7284,1,54.5,18.5,41.5,0.60,W
wide-plain,97084013,3029,1,179.5,46.5,12.5,0.23,W
wide-plain,97084013,3057,0,86.5,22.5,22.5,0.28,L
wide-plain,97084013,4833,1,141.5,44.5,50.5,0.43,W
wide-plain,97084013,5022,0,52.5,46.5,0,0.11,L
wide-plain,97084013,12587,0,10.5,62.5,0,-0.11,L
isthmus,81377373,3133,0,36.5,80.5,4.5,0.21,W
isthmus,81377373,3592,1,92.5,74.5,3.5,0.20,L
isthmus,81377373,6040,1,92.5,20.5,3.5,0.20,L
isthmus,81377373,6045,0,70.5,48.5,38.5,0.57,W
twin-shields,16511683,3200,0,30.5,66.5,0,0.15,W
twin-shields,16511683,4026,1,98.5,58.5,0,0.14,L
twin-shields,16511683,5125,0,72.5,23.5,40.5,0.59,W
twin-shields,45095818,3010,0,41.5,20.5,9.5,0.27,W
twin-shields,45095818,4935,0,56.5,51.5,24.5,0.42,W
isthmus,73130888,3075,0,50.5,48.5,18.5,0.36,L
isthmus,73130888,4123,1,105.5,40.5,0,0.07,W
isthmus,73130888,5134,0,17.5,16.5,0,0.02,L
isthmus,73130888,6562,1,90.5,76.5,5.5,0.22,W
isthmus,73130888,12905,0,48.5,40.5,16.5,0.34,L
four-lanes,96911155,3100,0,48.5,50.5,16.5,0.34,L
four-lanes,96911155,3111,1,76.5,12.5,19.5,0.37,W
four-lanes,96911155,9106,1,78.5,52.5,17.5,0.35,W
three-crossings-v2,61743710,3315,1,74.5,21.5,21.5,0.39,L
three-crossings-v2,61743710,3550,0,38.5,76.5,6.5,0.23,W
three-crossings-v2,61743710,7184,1,96.5,56.5,0,0.16,L
three-crossings-v2,61743710,7842,0,72.5,80.5,40.5,0.59,W
wide-plain,35195771,3541,1,156.5,26.5,35.5,0.35,W
wide-plain,35195771,5456,1,150.5,74.5,41.5,0.38,W
wide-plain,35195771,9182,0,82.5,18.5,18.5,0.26,L
wide-plain,35195771,12006,1,120.5,52.5,71.5,0.54,W
twin-shields,86877264,3094,1,80.5,22.5,15.5,0.33,W
twin-shields,86877264,3277,0,38.5,72.5,6.5,0.23,L
twin-shields,86877264,5575,0,70.5,74.5,38.5,0.57,L
twin-shields,86877264,7806,1,48.5,30.5,47.5,0.66,W
isthmus,65513121,3104,1,76.5,44.5,19.5,0.37,W
isthmus,65513121,3652,0,44.5,40.5,12.5,0.30,L
isthmus,65513121,6728,1,96.5,76.5,0,0.16,W
isthmus,65513121,7954,0,40.5,74.5,8.5,0.26,L
four-lanes,93364582,3070,0,54.5,84.5,22.5,0.40,L
four-lanes,93364582,3100,1,98.5,86.5,0,0.14,W
four-lanes,93364582,4960,0,35.5,67.5,3.5,0.20,L
four-lanes,93364582,5250,1,118.5,6.5,0,-0.07,W
isthmus,05136457,3074,1,78.5,48.5,17.5,0.35,W
isthmus,05136457,3517,0,36.5,64.5,4.5,0.21,L
open-field,94787452,3082,0,52.5,20.5,20.5,0.38,W
wide-plain,87038152,3004,1,180.5,51.5,11.5,0.23,W
wide-plain,87038152,3267,0,110.5,45.5,46.5,0.41,L
wide-plain,87038152,4893,1,168.5,21.5,23.5,0.29,W
wide-plain,87038152,5459,0,130.5,10.5,66.5,0.51,L
wide-plain,87038152,9743,0,3.5,19.5,0,-0.15,L
open-field,54775085,3044,1,100.5,62.5,0,0.12,W
open-field,54775085,3886,0,54.5,26.5,22.5,0.40,L
open-field,54775085,4920,1,74.5,42.5,21.5,0.39,W
wide-plain,77578512,3088,0,89.5,67.5,25.5,0.30,L
wide-plain,77578512,3139,1,172.5,64.5,19.5,0.27,W
wide-plain,77578512,5078,0,110.5,21.5,46.5,0.41,L
wide-plain,77578512,5292,1,170.5,20.5,21.5,0.28,W
wide-plain,77578512,7538,1,136.5,20.5,55.5,0.46,W
wide-plain,77578512,8196,0,70.5,39.5,6.5,0.20,L
open-field,41944606,3155,1,96.5,62.5,0,0.16,W
open-field,41944606,3156,0,44.5,28.5,12.5,0.30,L
four-lanes,01107838,3262,1,96.5,64.5,0,0.16,W
four-lanes,01107838,3296,0,58.5,44.5,26.5,0.44,L
four-lanes,01107838,7264,1,62.5,47.5,33.5,0.52,W
isthmus,44279384,3378,0,51.5,48.5,19.5,0.37,L
isthmus,44279384,4226,1,85.5,40.5,10.5,0.28,W
isthmus,44279384,6370,0,31.5,72.5,0,0.16,L
isthmus,44279384,8777,0,5.5,48.5,0,-0.11,L
isthmus,44279384,8892,1,52.5,34.5,43.5,0.62,W
three-crossings-v2,67747747,3029,0,28.5,52.5,0,0.13,W
three-crossings-v2,67747747,3051,1,76.5,40.5,19.5,0.37,L
three-crossings-v2,67747747,4914,1,90.5,72.5,5.5,0.22,L
three-crossings-v2,67747747,8126,0,42.5,82.5,10.5,0.28,W
open-field,51174202,3127,0,42.5,42.5,10.5,0.28,W
open-field,51174202,3215,1,91.5,70.5,4.5,0.21,L
open-field,51174202,4961,0,31.5,73.5,0,0.16,W
wide-plain,07731018,3090,1,163.5,19.5,28.5,0.32,L
wide-plain,07731018,3109,0,104.5,24.5,40.5,0.38,W
wide-plain,07731018,5072,0,88.5,60.5,24.5,0.29,W
wide-plain,07731018,5713,1,188.5,39.5,3.5,0.18,L
wide-plain,07731018,7137,0,124.5,52.5,60.5,0.48,W
wide-plain,07731018,8945,1,221.5,53.5,0,0.01,L
four-lanes,43751345,3072,1,66.5,46.5,29.5,0.47,L
four-lanes,43751345,3527,0,30.5,60.5,0,0.15,W
four-lanes,43751345,5426,0,26.5,95.5,0,0.11,W
four-lanes,43751345,5674,1,98.5,72.5,0,0.14,L
four-lanes,11093785,3140,1,76.5,45.5,19.5,0.37,L
four-lanes,11093785,3154,0,30.5,65.5,0,0.15,W
four-lanes,11093785,4988,0,52.5,12.5,20.5,0.38,W
four-lanes,11093785,5076,1,78.5,80.5,17.5,0.35,L
four-lanes,11093785,8569,0,20.5,99.5,0,0.05,W
four-lanes,11093785,10263,1,110.5,8.5,0,0.02,L
four-lanes,02536813,3035,1,92.5,72.5,3.5,0.20,L
four-lanes,02536813,3414,0,34.5,63.5,2.5,0.19,W
four-lanes,02536813,5039,1,68.5,50.5,27.5,0.45,L
four-lanes,02536813,6118,0,26.5,0.5,0,0.11,W
isthmus,17112598,3042,1,99.5,72.5,0,0.13,W
isthmus,17112598,3224,0,30.5,70.5,0,0.15,L
isthmus,17112598,5373,1,76.5,48.5,19.5,0.37,W
three-crossings-v2,40634510,3057,0,43.5,38.5,11.5,0.29,W
wide-plain,83622689,3052,1,216.5,72.5,0,0.04,W
wide-plain,83622689,5065,1,224.5,4.5,0,-0.00,W
wide-plain,83622689,9014,1,128.5,46.5,63.5,0.50,W
wide-plain,02847231,3073,0,82.5,74.5,18.5,0.26,W
wide-plain,02847231,3199,1,219.5,73.5,0,0.02,L
wide-plain,02847231,4883,0,76.5,14.5,12.5,0.23,W
wide-plain,02847231,5189,1,222.5,2.5,0,0.01,L
wide-plain,02847231,6735,0,124.5,54.5,60.5,0.48,W
wide-plain,02847231,15652,0,166.5,74.5,102.5,0.70,W
wide-plain,02847231,21105,1,250.5,35.5,0,-0.14,L
isthmus,99328130,3006,1,84.5,34.5,11.5,0.29,W
wide-plain,12946232,3253,0,92.5,18.5,28.5,0.32,W
wide-plain,12946232,5416,1,202.5,20.5,0,0.11,L
wide-plain,12946232,5497,0,98.5,70.5,34.5,0.35,W
wide-plain,12946232,7224,1,190.5,51.5,1.5,0.17,L
wide-plain,12946232,7458,0,131.5,78.5,67.5,0.52,W
wide-plain,12946232,16050,0,160.5,42.5,96.5,0.67,W
central-lake-v2,81674301,3736,0,42.5,39.5,10.5,0.28,L
central-lake-v2,81674301,3845,1,74.5,16.5,21.5,0.39,W
central-lake-v2,95914540,7031,1,96.5,77.5,0,0.16,L
central-lake-v2,95914540,9530,0,29.5,30.5,0,0.14,W
four-lanes,84050447,3233,1,86.5,40.5,9.5,0.27,W
four-lanes,84050447,3510,0,44.5,80.5,12.5,0.30,L
four-lanes,84050447,5888,0,9.5,86.5,0,-0.07,L
four-lanes,84050447,5988,1,83.5,80.5,12.5,0.30,W
central-lake-v2,96842160,3070,0,30.5,66.5,0,0.15,L
central-lake-v2,96842160,4661,1,112.5,62.5,0,-0.01,W
central-lake-v2,96842160,4964,0,2.5,48.5,0,-0.14,L
central-lake-v2,96842160,6869,1,94.5,90.5,1.5,0.18,W
three-crossings-v2,74803645,3053,0,48.5,72.5,16.5,0.34,W
three-crossings-v2,74803645,3542,1,82.5,20.5,13.5,0.31,L
three-crossings-v2,74803645,4954,0,88.5,75.5,56.5,0.76,W
three-crossings-v2,74803645,5459,1,112.5,50.5,0,-0.01,L
three-crossings-v2,74803645,6808,0,14.5,65.5,0,-0.02,W
three-crossings-v2,74803645,12262,0,2.5,0.5,0,-0.14,W
wide-plain,56212171,3167,1,239.5,22.5,0,-0.08,L
wide-plain,56212171,3375,0,83.5,18.5,19.5,0.27,W
wide-plain,56212171,5461,0,120.5,44.5,56.5,0.46,W
wide-plain,56212171,7463,1,221.5,51.5,0,0.01,L
wide-plain,56212171,14974,0,94.5,66.5,30.5,0.33,W
twin-shields,64331040,3026,0,36.5,78.5,4.5,0.21,W
twin-shields,64331040,3289,1,96.5,72.5,0,0.16,L
twin-shields,64331040,5473,0,54.5,46.5,22.5,0.40,W
```

## Appendix D — every refused `found_queen` call (520)

```text
map,id8,tick,colony,x,y,code,dist
three-crossings,33507518,3057,1,112,85,queen_tile_not_held,0
central-lake,08226173,5596,1,53,79,queen_too_close,43
central-lake,08226173,6321,0,68,80,queen_too_close,36
open-field,53631010,2998,0,29,74,queen_too_early,0
open-field,77391170,3404,1,112,16,queen_tile_not_held,0
open-field,77391170,4766,0,70,69,queen_tile_not_held,38
open-field,77391170,4913,0,74,75,queen_too_close,42
open-field,77391170,5001,0,63,81,queen_too_close,31
open-field,77391170,5016,0,62,82,queen_too_close,30
open-field,35053660,4956,1,86,72,queen_tile_not_held,10
open-field,35053660,5307,0,53,24,queen_too_close,21
open-field,35053660,10818,0,46,54,queen_tile_not_held,14
central-lake,11700020,3742,0,26,12,queen_tile_not_held,0
central-lake,11700020,11814,0,72,20,queen_tile_not_held,40
central-lake,11700020,11830,0,74,20,queen_tile_not_held,42
central-lake,11700020,11845,0,70,20,queen_tile_not_held,38
central-lake,11700020,11860,0,76,22,queen_tile_not_held,44
central-lake,11700020,11950,0,82,16,queen_too_close,50
central-lake,11700020,12021,0,65,12,queen_tile_not_held,33
central-lake,11700020,12037,0,60,10,queen_tile_not_held,28
central-lake,11700020,12052,0,50,10,queen_tile_not_held,18
central-lake,11700020,12067,0,40,12,queen_tile_not_held,8
central-lake,25267632,3132,1,88,20,queen_tile_not_held,8
central-lake,25267632,3299,0,40,84,queen_tile_not_held,8
central-lake,25267632,5651,0,6,18,queen_tile_not_held,0
three-crossings,41660520,4655,1,103,16,queen_tile_not_held,0
three-crossings,41660520,6747,1,99,81,queen_too_close,0
three-crossings,41660520,11311,0,16,84,queen_tile_not_held,0
three-crossings,41660520,11497,0,8,8,queen_tile_not_held,0
three-crossings,41660520,14954,0,72,16,queen_too_close,40
open-field,32532129,5676,0,86,28,queen_tile_not_held,54
open-field,05043520,3146,1,80,40,queen_tile_not_held,16
open-field,05043520,3148,1,78,38,queen_tile_not_held,18
open-field,05043520,5306,1,50,66,queen_tile_not_held,46
open-field,05043520,5310,1,46,64,queen_tile_not_held,50
open-field,05043520,5323,1,48,60,queen_tile_not_held,48
open-field,05043520,5327,1,52,72,queen_tile_not_held,44
open-field,05043520,5462,1,34,72,queen_too_close,62
open-field,05043520,5466,1,35,73,queen_too_close,61
open-field,05043520,5479,1,36,72,queen_too_close,60
open-field,05043520,6012,1,95,72,queen_tile_not_held,1
open-field,34134008,3422,0,42,48,queen_tile_not_held,10
open-field,34134008,5571,1,66,36,queen_too_close,30
open-field,34134008,5580,1,80,40,queen_too_close,16
open-field,34134008,11621,1,58,34,queen_too_close,38
open-field,34134008,11626,1,58,35,queen_too_close,38
central-lake,83881612,4154,1,100,15,queen_tile_not_held,0
central-lake,83881612,5105,0,72,10,queen_tile_not_held,40
central-lake,83881612,5170,0,28,80,queen_tile_not_held,0
central-lake,83881612,6405,1,81,75,queen_too_close,15
central-lake,83881612,7151,1,79,78,queen_too_close,17
central-lake,83881612,7514,0,15,12,queen_tile_not_held,0
central-lake,83881612,7720,1,76,75,queen_too_close,20
central-lake,83881612,7834,1,76,75,queen_too_close,20
central-lake,83881612,7948,1,76,75,queen_too_close,20
central-lake,83881612,8062,1,77,76,queen_too_close,19
central-lake,83881612,8176,1,75,74,queen_too_close,21
central-lake,83881612,8290,1,75,74,queen_too_close,21
central-lake,83881612,10070,0,80,20,queen_tile_not_held,48
central-lake,83881612,10186,0,77,20,queen_tile_not_held,45
central-lake,83881612,10302,0,76,20,queen_too_close,44
open-field,67682322,8727,1,70,50,queen_too_close,26
open-field,67682322,9155,0,16,16,queen_tile_not_held,0
open-field,32062548,4062,0,52,48,queen_tile_not_held,20
open-field,32062548,6861,0,48,48,queen_tile_not_held,16
three-crossings,40274979,5830,0,52,82,queen_tile_not_held,20
three-crossings,40274979,5838,0,50,86,queen_tile_not_held,18
three-crossings,40274979,5846,0,54,40,queen_tile_not_held,22
three-crossings,40274979,5854,0,48,88,queen_tile_not_held,16
three-crossings,40274979,16240,0,14,62,queen_tile_not_held,0
three-crossings,40274979,16253,0,15,63,queen_tile_not_held,0
open-field,39629863,4473,0,40,20,queen_tile_not_held,8
open-field,39629863,5100,0,40,76,queen_tile_not_held,8
open-field,39629863,7916,0,44,66,queen_tile_not_held,12
open-field,39629863,8541,0,36,14,queen_tile_not_held,4
open-field,39629863,9443,1,104,12,queen_tile_not_held,0
central-lake,16088424,3073,1,94,76,queen_tile_not_held,2
three-crossings,58494966,10545,1,72,33,queen_tile_not_held,24
three-crossings,58494966,11345,0,52,40,queen_too_close,20
three-crossings,58494966,11420,0,46,26,queen_tile_not_held,14
three-crossings,58494966,11630,0,55,20,queen_too_close,23
open-field,78116464,4765,0,14,16,queen_tile_not_held,0
three-crossings,19117228,3015,1,97,80,queen_tile_not_held,0
three-crossings,19117228,5136,1,91,22,rate_limited,5
three-crossings,19117228,5637,0,30,80,queen_tile_not_held,0
central-lake,88370146,5746,0,52,14,queen_tile_not_held,20
central-lake,88370146,7322,1,76,27,queen_tile_not_held,20
central-lake,88370146,7433,1,75,23,queen_tile_not_held,21
central-lake,88370146,12001,1,59,73,queen_too_close,37
central-lake,88370146,12124,1,56,73,queen_too_close,40
central-lake,88370146,12235,1,48,71,queen_too_close,48
central-lake,88370146,12358,1,46,69,queen_too_close,50
central-lake,88370146,12469,1,48,71,queen_too_close,48
central-lake,88370146,12639,1,59,73,queen_too_close,37
central-lake,88370146,17025,1,108,15,queen_tile_not_held,0
open-field,81685402,3059,1,110,14,queen_tile_not_held,0
open-field,81685402,3142,1,110,14,queen_tile_not_held,0
open-field,81685402,3225,1,110,14,queen_tile_not_held,0
open-field,81685402,3308,1,110,14,queen_tile_not_held,0
open-field,81685402,3391,1,110,14,queen_tile_not_held,0
open-field,81685402,3474,1,110,14,queen_tile_not_held,0
open-field,81685402,3560,1,110,14,queen_tile_not_held,0
open-field,81685402,5604,1,77,48,queen_too_close,19
open-field,81685402,5788,1,91,21,queen_too_close,5
open-field,81685402,5882,1,91,21,queen_too_close,5
open-field,81685402,5976,1,91,21,queen_too_close,5
open-field,81685402,6070,1,91,21,queen_too_close,5
open-field,81685402,6164,1,91,21,queen_too_close,5
open-field,81685402,6343,1,91,21,queen_too_close,5
open-field,81685402,10709,1,91,54,queen_too_close,5
open-field,81685402,10803,1,91,54,queen_too_close,5
open-field,00019141,3050,0,30,80,queen_tile_not_held,0
central-lake,59740912,3512,0,20,82,queen_tile_not_held,0
central-lake,59740912,5785,0,20,82,queen_tile_not_held,0
central-lake,59740912,5798,0,22,80,queen_tile_not_held,0
central-lake,59740912,5811,0,18,84,queen_tile_not_held,0
central-lake,59740912,5824,0,24,86,queen_tile_not_held,0
central-lake,59740912,5925,0,53,69,rate_limited,21
central-lake,59740912,7938,0,44,71,queen_too_close,12
open-field,41888640,3120,0,40,44,queen_tile_not_held,8
three-crossings,31032909,5054,1,71,59,queen_tile_not_held,25
three-crossings,31032909,5161,1,80,20,queen_too_close,16
three-crossings,31032909,5268,1,88,90,queen_tile_not_held,8
three-crossings,31032909,5375,1,76,60,queen_tile_not_held,20
three-crossings,31032909,5482,1,92,85,queen_tile_not_held,4
three-crossings,31032909,5589,1,95,85,queen_tile_not_held,1
three-crossings,31032909,5696,1,99,50,queen_tile_not_held,0
three-crossings,31032909,6156,1,78,35,queen_tile_not_held,18
three-crossings,31032909,6158,1,70,75,queen_too_close,26
three-crossings,31032909,6356,1,60,76,queen_too_close,36
three-crossings,31032909,6463,1,64,72,queen_tile_not_held,32
open-field,93231109,5790,0,52,40,queen_tile_not_held,20
open-field,93231109,5952,0,50,41,queen_too_close,18
open-field,83751506,3604,1,96,75,rate_limited,0
open-field,83751506,3617,1,97,75,rate_limited,0
open-field,83751506,3630,1,96,74,rate_limited,0
open-field,83751506,5007,0,52,37,queen_tile_not_held,20
central-lake,24078806,3065,1,106,23,queen_tile_not_held,0
three-crossings,81715116,4669,0,80,76,queen_tile_not_held,48
three-crossings,51297630,5152,0,56,47,queen_too_close,24
three-crossings,51297630,5245,0,59,50,queen_too_close,27
three-crossings,51297630,5252,0,59,45,queen_too_close,27
open-field,72546330,3020,0,52,36,queen_tile_not_held,20
open-field,72546330,5584,0,61,68,queen_tile_not_held,29
three-crossings,40240427,3121,1,116,68,queen_tile_not_held,0
open-field,94153018,5746,1,100,50,queen_tile_not_held,0
open-field,94153018,9557,0,56,32,queen_tile_not_held,24
open-field,67071163,5324,0,76,38,queen_tile_not_held,44
open-field,67071163,6275,1,68,44,queen_too_close,28
open-field,63552135,4241,1,118,50,queen_tile_not_held,0
central-lake,89178265,5029,1,95,78,queen_cooldown,1
three-crossings,58486958,2623,0,10,60,queen_tile_not_held,0
three-crossings,58486958,5146,1,79,29,queen_tile_not_held,17
three-crossings,39087893,3072,0,20,12,queen_tile_not_held,0
three-crossings,39087893,3910,1,93,82,queen_food,3
central-lake,82521085,4960,1,58,18,queen_tile_not_held,38
central-lake,00825646,3785,0,61,12,rate_limited,29
central-lake,00825646,3806,0,61,12,rate_limited,29
central-lake,00825646,3827,0,61,12,rate_limited,29
central-lake,00825646,3848,0,61,12,rate_limited,29
central-lake,00825646,3869,0,61,12,rate_limited,29
central-lake,00825646,3890,0,61,12,queen_too_close,29
central-lake,00825646,4456,0,32,74,queen_tile_not_held,0
central-lake,00825646,5707,0,32,74,rate_limited,0
central-lake,00825646,5728,0,32,74,rate_limited,0
central-lake,00825646,5749,0,32,74,rate_limited,0
central-lake,00825646,5770,0,32,74,rate_limited,0
central-lake,00825646,5791,0,32,74,rate_limited,0
open-field,81160100,3372,0,15,15,queen_tile_not_held,0
open-field,47820274,5062,0,16,47,queen_too_close,0
open-field,47820274,5324,0,61,27,queen_tile_not_held,29
open-field,47820274,5671,0,55,26,queen_tile_not_held,23
open-field,05184122,8849,1,76,48,queen_food,20
three-crossings,22098734,6870,0,92,22,rate_limited,60
open-field,36603752,4220,1,102,16,queen_tile_not_held,0
central-lake,89796189,7297,0,79,9,queen_too_close,47
central-lake,89796189,7462,0,15,15,queen_tile_not_held,0
central-lake,89796189,8575,1,76,18,queen_tile_not_held,20
central-lake,89796189,8999,1,78,16,queen_too_close,18
central-lake,89796189,9620,1,78,16,queen_tile_not_held,18
central-lake,89796189,13818,0,80,15,queen_too_close,48
open-field,24005336,3431,1,95,10,queen_tile_not_held,1
open-field,83942814,4935,0,30,78,queen_tile_not_held,0
central-lake,13080499,4820,1,98,16,queen_tile_not_held,0
three-crossings,76287737,5040,1,78,26,queen_too_close,18
wide-plain,78158756,3112,1,190,45,queen_tile_not_held,2
wide-plain,78158756,3515,1,223,77,queen_tile_not_held,0
twin-shields,70899180,5314,0,62,42,queen_too_close,30
twin-shields,70899180,6381,0,70,62,queen_too_close,38
four-lanes,58334824,5008,0,33,80,queen_cooldown,1
open-field,78547385,2986,0,52,70,queen_too_early,20
four-lanes,90609688,11606,1,110,96,queen_tile_not_held,0
four-lanes,90609688,12129,1,48,49,queen_tile_not_held,48
four-lanes,75196224,2982,1,82,84,queen_too_early,14
open-field,45901815,6455,1,78,24,queen_food,18
four-lanes,95750130,5194,1,64,45,queen_too_close,32
three-crossings,71531877,3146,1,80,48,queen_too_close,16
three-crossings,71531877,3218,1,79,47,queen_too_close,17
three-crossings,71531877,3289,1,78,48,queen_too_close,18
three-crossings,46768027,2994,1,100,70,queen_too_early,0
three-crossings,46768027,4821,1,82,28,queen_cooldown,14
open-field,54632998,3115,1,95,15,queen_tile_not_held,1
open-field,54632998,3437,1,111,15,queen_tile_not_held,0
wide-plain,90998417,6068,1,190,10,rate_limited,2
isthmus,02857985,5805,0,43,64,queen_tile_not_held,11
four-lanes,35368272,3178,1,111,30,queen_tile_not_held,0
four-lanes,35368272,3218,0,40,95,queen_tile_not_held,8
four-lanes,35368272,5578,0,20,98,queen_tile_not_held,0
four-lanes,35368272,5724,0,20,96,queen_tile_not_held,0
four-lanes,35368272,5763,0,30,90,queen_too_close,0
four-lanes,35368272,9792,1,78,45,queen_too_close,18
four-lanes,35368272,9905,1,78,82,queen_too_close,18
four-lanes,35368272,10144,1,60,45,queen_too_close,36
four-lanes,35368272,10389,1,30,45,queen_tile_not_held,66
four-lanes,35368272,11591,0,20,100,queen_tile_not_held,0
four-lanes,35368272,11597,0,15,30,queen_tile_not_held,0
four-lanes,35368272,11603,0,80,100,water_tile,48
four-lanes,35368272,12237,0,15,96,queen_tile_not_held,0
four-lanes,35368272,14018,0,80,82,queen_tile_not_held,48
twin-shields,71112256,5380,1,111,79,queen_tile_not_held,0
twin-shields,08128762,5416,1,74,22,queen_too_close,22
four-lanes,66669342,4052,1,95,10,queen_tile_not_held,1
four-lanes,66669342,6747,0,15,31,queen_tile_not_held,0
four-lanes,66669342,6906,0,48,45,rate_limited,16
four-lanes,66669342,11315,1,48,45,queen_too_close,48
three-crossings,39347650,2929,1,108,70,queen_tile_not_held,0
open-field,11956920,5105,0,50,46,queen_too_close,18
open-field,11956920,12044,1,40,48,queen_too_close,56
isthmus,06884074,3384,0,16,50,queen_tile_not_held,0
isthmus,06884074,10971,1,116,16,queen_tile_not_held,0
isthmus,09286179,11387,0,42,36,queen_tile_not_held,10
isthmus,09286179,11796,0,47,24,queen_tile_not_held,15
isthmus,09286179,14778,1,80,33,queen_tile_not_held,16
wide-plain,62236412,2890,1,192,42,queen_too_early,0
wide-plain,46745331,7376,0,124,52,queen_tile_not_held,60
twin-shields,95345568,5195,0,68,70,queen_too_close,36
twin-shields,95345568,5354,0,60,24,queen_tile_not_held,28
twin-shields,83007497,6036,0,58,50,queen_tile_not_held,26
wide-plain,03999726,5494,1,160,52,queen_tile_not_held,32
isthmus,34390249,4782,1,70,48,queen_cooldown,26
isthmus,34390249,4816,1,70,48,queen_cooldown,26
isthmus,34390249,11391,0,60,50,queen_too_close,28
three-crossings,18345156,5550,0,20,60,queen_tile_not_held,0
four-lanes,28454922,5381,1,76,48,queen_tile_not_held,20
four-lanes,28454922,5993,1,80,44,queen_too_close,16
four-lanes,28454922,6624,1,78,42,queen_tile_not_held,18
four-lanes,28454922,6924,1,76,78,queen_too_close,20
four-lanes,19005412,5000,0,55,12,queen_cooldown,23
isthmus,58787130,3078,1,112,14,queen_tile_not_held,0
isthmus,58787130,3225,1,110,14,queen_tile_not_held,0
isthmus,58787130,5427,1,104,80,queen_tile_not_held,0
four-lanes,04996456,15264,0,50,12,queen_tile_not_held,18
four-lanes,04996456,15327,0,50,10,queen_tile_not_held,18
four-lanes,04996456,22392,0,40,40,queen_tile_not_held,8
twin-shields,25283870,2983,1,90,20,queen_too_early,6
twin-shields,25283870,3587,0,34,73,queen_tile_not_held,2
twin-shields,25283870,7050,1,86,78,queen_tile_not_held,10
isthmus,85641506,5227,1,72,50,queen_tile_not_held,24
isthmus,85641506,5619,1,70,40,queen_tile_not_held,26
open-field,06911844,4938,0,52,16,rate_limited,20
open-field,06911844,6082,1,112,12,queen_tile_not_held,0
three-crossings,26157212,3063,0,34,72,rate_limited,2
three-crossings,26157212,4815,1,72,48,queen_cooldown,24
three-crossings,26157212,5090,0,54,22,queen_too_close,22
four-lanes,17319532,2998,1,96,84,queen_too_early,0
three-crossings,52867757,2976,1,84,68,queen_too_early,12
three-crossings,52867757,6099,0,48,40,queen_tile_not_held,16
three-crossings,52867757,6193,0,50,44,queen_tile_not_held,18
four-lanes,54536879,4948,1,81,51,queen_too_close,15
four-lanes,54536879,6645,1,83,48,queen_tile_not_held,13
four-lanes,54536879,6872,0,85,49,queen_too_close,53
three-crossings,40169361,3512,1,84,42,queen_tile_not_held,12
isthmus,75345202,5045,0,42,8,queen_tile_not_held,10
isthmus,75345202,12693,1,79,42,queen_tile_not_held,17
three-crossings,72352497,3112,1,80,30,queen_too_close,16
three-crossings,72352497,3186,1,80,60,queen_too_close,16
three-crossings,72352497,4993,1,90,74,queen_tile_not_held,6
three-crossings,72352497,5074,0,38,78,queen_tile_not_held,6
three-crossings,72352497,7094,0,48,14,queen_tile_not_held,16
three-crossings,72352497,9136,1,74,16,queen_too_close,22
wide-plain,40841877,5003,0,94,46,queen_tile_not_held,30
wide-plain,40841877,14724,1,204,50,queen_tile_not_held,0
central-lake,43994773,5217,0,64,74,queen_too_close,32
central-lake,43994773,6636,1,60,72,queen_cooldown,36
central-lake,43994773,6683,1,60,72,queen_too_close,36
three-crossings,26389634,7204,1,112,28,queen_tile_not_held,0
three-crossings,26389634,10914,0,33,80,queen_tile_not_held,1
three-crossings,26389634,11068,1,104,20,queen_food,0
open-field,08805277,4815,0,6,92,rate_limited,0
open-field,08805277,4857,0,6,92,rate_limited,0
wide-plain,01137641,2722,0,44,1,queen_tile_not_held,0
wide-plain,01137641,2933,0,72,15,queen_too_early,8
wide-plain,01137641,3370,1,190,52,queen_tile_not_held,2
wide-plain,01137641,12387,0,44,70,queen_tile_not_held,0
isthmus,88906667,2889,0,32,73,rate_limited,0
isthmus,88906667,2973,0,32,73,queen_too_early,0
isthmus,88906667,4668,0,60,46,queen_cooldown,28
isthmus,88906667,4706,0,60,46,queen_cooldown,28
isthmus,88906667,4749,0,60,46,queen_cooldown,28
isthmus,88906667,4921,1,76,48,queen_too_close,20
twin-shields,27591708,6818,1,60,60,queen_too_close,36
twin-shields,27591708,9082,0,66,48,queen_tile_not_held,34
twin-shields,27591708,9289,0,66,48,queen_tile_not_held,34
twin-shields,27591708,9715,0,64,48,queen_too_close,32
twin-shields,27591708,10001,0,66,46,queen_tile_not_held,34
three-crossings-v2,12750394,3824,1,80,30,queen_tile_not_held,16
three-crossings-v2,12750394,4151,1,96,50,queen_tile_not_held,0
three-crossings-v2,12750394,4922,0,56,46,queen_too_close,24
three-crossings-v2,12750394,6886,1,58,75,queen_tile_not_held,38
three-crossings-v2,12750394,7079,1,74,20,queen_tile_not_held,22
three-crossings-v2,12750394,7839,1,80,24,queen_tile_not_held,16
three-crossings-v2,12750394,8237,1,80,20,queen_too_close,16
three-crossings-v2,12750394,9061,1,59,81,queen_tile_not_held,37
three-crossings-v2,60721254,8517,1,50,16,queen_tile_not_held,46
three-crossings-v2,60721254,8627,1,42,26,queen_tile_not_held,54
three-crossings-v2,60721254,9042,1,49,48,queen_tile_not_held,47
wide-plain,54781230,6234,1,120,74,queen_tile_not_held,72
wide-plain,54781230,6257,0,96,58,queen_food,32
wide-plain,54781230,6502,0,96,58,queen_tile_not_held,32
wide-plain,54781230,6668,0,64,46,queen_tile_not_held,0
wide-plain,54781230,7498,0,112,54,queen_tile_not_held,48
wide-plain,99374676,3205,0,82,18,queen_tile_not_held,18
wide-plain,99374676,5846,0,94,30,queen_tile_not_held,30
wide-plain,99374676,6680,1,168,75,queen_tile_not_held,24
wide-plain,99374676,11652,0,80,56,queen_tile_not_held,16
wide-plain,99374676,11879,0,85,58,queen_tile_not_held,21
four-lanes,92887237,5414,1,66,82,queen_too_close,30
isthmus,10475112,4114,1,92,76,queen_tile_not_held,4
open-field,85854384,4940,0,38,78,queen_tile_not_held,6
central-lake-v2,24468816,6493,1,64,76,queen_too_close,32
twin-shields,61734508,5028,1,68,72,queen_cooldown,28
wide-plain,45031709,3343,1,175,52,queen_tile_not_held,17
wide-plain,45031709,10602,0,152,51,queen_too_close,88
wide-plain,45031709,20236,0,152,68,queen_tile_not_held,88
twin-shields,53881845,4896,1,66,64,queen_tile_not_held,30
twin-shields,53881845,4946,1,62,60,queen_tile_not_held,34
twin-shields,53881845,5491,1,67,66,queen_tile_not_held,29
open-field,29185700,3273,1,80,46,queen_tile_not_held,16
open-field,29185700,3478,1,96,64,queen_tile_not_held,0
open-field,29185700,4850,0,52,36,queen_tile_not_held,20
open-field,29185700,4940,0,68,81,queen_tile_not_held,36
open-field,29185700,6424,1,48,14,queen_tile_not_held,48
open-field,29185700,6548,1,48,27,queen_tile_not_held,48
open-field,29185700,6696,1,48,14,queen_too_close,48
open-field,29185700,7102,1,67,52,queen_too_close,29
open-field,29185700,9721,1,114,22,queen_tile_not_held,0
twin-shields,52821656,3500,1,72,38,queen_too_close,24
twin-shields,52821656,5423,0,92,12,queen_too_close,60
twin-shields,52821656,5613,1,50,72,queen_too_close,46
twin-shields,52821656,6103,1,40,74,queen_tile_not_held,56
twin-shields,52821656,6205,1,54,68,queen_too_close,42
twin-shields,52821656,7202,1,58,20,queen_too_close,38
twin-shields,52821656,7276,1,66,45,queen_too_close,30
central-lake-v2,47742847,3853,1,92,70,queen_tile_not_held,4
central-lake-v2,47742847,4995,0,53,12,queen_tile_not_held,21
four-lanes,17031689,2978,1,99,69,queen_too_early,0
four-lanes,17031689,5186,0,80,48,queen_too_close,48
four-lanes,17031689,5272,0,80,56,queen_tile_not_held,48
four-lanes,17031689,7139,1,105,4,queen_food,0
four-lanes,17031689,7707,1,105,4,queen_tile_not_held,0
four-lanes,17031689,7834,1,105,4,rate_limited,0
four-lanes,17031689,7857,1,105,4,rate_limited,0
wide-plain,35223225,5029,1,170,71,queen_tile_not_held,22
wide-plain,35223225,5408,1,147,38,queen_too_close,45
wide-plain,35223225,5700,1,147,15,queen_tile_not_held,45
twin-shields,80206802,5306,0,36,76,queen_tile_not_held,4
twin-shields,80206802,6000,0,46,60,queen_tile_not_held,14
twin-shields,80206802,7267,0,46,64,queen_too_close,14
twin-shields,80206802,7543,0,42,68,queen_tile_not_held,10
twin-shields,80206802,7950,0,36,76,queen_tile_not_held,4
twin-shields,80206802,8434,0,36,76,queen_too_close,4
twin-shields,80206802,8883,0,38,80,queen_tile_not_held,6
twin-shields,80206802,8970,0,36,78,queen_tile_not_held,4
twin-shields,80206802,9054,0,36,72,queen_tile_not_held,4
twin-shields,80206802,9136,0,34,74,queen_tile_not_held,2
wide-plain,41473189,3061,0,90,69,queen_tile_not_held,26
four-lanes,19542838,5944,1,80,50,queen_tile_not_held,16
open-field,60075481,3289,1,70,30,queen_tile_not_held,26
open-field,60075481,3544,0,42,18,queen_tile_not_held,10
open-field,60075481,3903,1,70,78,queen_tile_not_held,26
open-field,60075481,4372,0,42,18,queen_tile_not_held,10
open-field,60075481,7644,0,58,50,queen_tile_not_held,26
wide-plain,41978417,3072,1,172,16,queen_tile_not_held,20
wide-plain,41978417,3182,0,128,40,queen_tile_not_held,64
wide-plain,41978417,20820,0,200,22,queen_tile_not_held,136
central-lake-v2,82550959,10213,1,38,21,queen_too_close,58
three-crossings-v2,40507422,2974,0,74,20,queen_too_early,42
open-field,54627875,6798,1,78,24,queen_tile_not_held,18
open-field,54627875,8831,0,65,48,queen_tile_not_held,33
wide-plain,77124500,9207,1,218,14,queen_tile_not_held,0
wide-plain,77124500,12150,0,168,71,queen_tile_not_held,104
open-field,38486478,3080,0,45,23,queen_tile_not_held,13
open-field,38486478,3160,0,47,34,queen_tile_not_held,15
open-field,38486478,5724,0,58,78,queen_tile_not_held,26
open-field,38486478,5921,0,58,76,queen_tile_not_held,26
open-field,38486478,7015,1,72,34,queen_too_close,24
open-field,38486478,7237,1,70,36,queen_tile_not_held,26
open-field,38486478,7551,1,64,48,queen_tile_not_held,32
central-lake-v2,32325689,10653,0,52,24,queen_tile_not_held,20
four-lanes,12781908,3024,1,81,82,queen_tile_not_held,15
four-lanes,12781908,6235,0,52,38,queen_tile_not_held,20
four-lanes,12781908,9084,1,95,76,queen_tile_not_held,1
twin-shields,46462074,3107,1,88,70,queen_tile_not_held,8
twin-shields,46462074,5628,0,66,42,queen_too_close,34
central-lake-v2,26763663,5445,0,30,78,queen_tile_not_held,0
isthmus,80047765,6193,1,42,42,queen_food,54
central-lake-v2,88576342,5091,1,92,68,queen_tile_not_held,4
central-lake-v2,88576342,5588,1,92,50,queen_tile_not_held,4
four-lanes,28654954,2926,1,78,49,queen_too_early,18
four-lanes,28654954,2967,1,78,49,queen_too_early,18
four-lanes,28654954,6664,0,48,76,queen_too_close,16
four-lanes,28654954,6669,1,80,18,queen_tile_not_held,16
four-lanes,28654954,6726,1,84,20,queen_tile_not_held,12
four-lanes,28654954,6821,0,8,30,queen_tile_not_held,0
four-lanes,28654954,6873,1,80,14,queen_tile_not_held,16
wide-plain,52539743,2988,1,172,62,rate_limited,20
wide-plain,52539743,4788,1,140,40,queen_cooldown,52
three-crossings-v2,33399664,3128,1,96,72,queen_tile_not_held,0
three-crossings-v2,33399664,3260,1,95,69,queen_tile_not_held,1
three-crossings-v2,33399664,5690,0,72,72,queen_tile_not_held,40
three-crossings-v2,33399664,5745,0,72,74,queen_too_close,40
wide-plain,95639659,2933,1,228,66,queen_tile_not_held,0
wide-plain,95639659,3138,1,218,1,queen_tile_not_held,0
wide-plain,95639659,4781,1,160,18,queen_cooldown,32
wide-plain,95639659,5333,1,160,18,queen_tile_not_held,32
wide-plain,95639659,7762,1,168,66,queen_food,24
wide-plain,95639659,16850,1,208,2,queen_too_close,0
wide-plain,95639659,16898,1,246,4,queen_tile_not_held,0
wide-plain,95639659,16935,1,244,8,queen_too_close,0
four-lanes,28947529,3203,1,84,84,queen_tile_not_held,12
central-lake-v2,66491321,6567,1,84,78,queen_tile_not_held,12
central-lake-v2,66491321,6622,1,88,80,queen_tile_not_held,8
central-lake-v2,66491321,7083,1,84,78,queen_tile_not_held,12
wide-plain,40130340,5557,1,130,60,queen_tile_not_held,62
three-crossings-v2,14122607,4871,1,44,48,queen_too_close,52
wide-plain,28562274,3003,0,84,64,queen_tile_not_held,20
four-lanes,71038034,8065,1,54,50,queen_too_close,42
four-lanes,96189858,3060,1,74,46,rate_limited,22
three-crossings-v2,09908045,5627,0,54,44,queen_too_close,22
three-crossings-v2,09908045,5847,0,46,42,queen_tile_not_held,14
isthmus,77111020,3554,1,95,50,queen_tile_not_held,1
isthmus,77111020,10059,0,95,35,queen_tile_not_held,63
isthmus,78956615,3233,1,64,48,queen_tile_not_held,32
twin-shields,13521590,4811,1,119,93,queen_cooldown,0
twin-shields,13521590,6519,1,80,90,queen_cooldown,16
four-lanes,97911868,3267,0,52,43,queen_too_close,20
open-field,83553837,2672,0,60,20,rate_limited,28
open-field,83553837,2728,0,60,20,queen_too_early,28
open-field,83553837,2949,0,60,20,queen_too_early,28
open-field,83553837,3353,1,89,33,queen_too_close,7
twin-shields,57392126,3162,0,33,75,queen_tile_not_held,1
twin-shields,57392126,4883,1,54,48,queen_tile_not_held,42
twin-shields,57392126,4985,0,51,48,queen_cooldown,19
twin-shields,57392126,5029,1,62,44,queen_too_close,34
twin-shields,57392126,5097,1,56,48,queen_tile_not_held,40
twin-shields,57392126,5189,1,68,28,queen_too_close,28
twin-shields,57392126,5291,1,68,18,queen_tile_not_held,28
twin-shields,10203097,7414,1,70,50,queen_tile_not_held,26
twin-shields,10203097,9472,1,80,8,queen_tile_not_held,16
three-crossings-v2,42592862,4969,0,36,76,queen_tile_not_held,4
three-crossings-v2,42592862,5191,0,40,78,queen_tile_not_held,8
three-crossings-v2,42592862,7142,1,86,22,queen_tile_not_held,10
four-lanes,65625491,5141,1,76,42,queen_tile_not_held,20
four-lanes,65625491,5477,0,82,39,queen_too_close,50
four-lanes,65625491,5985,1,69,37,queen_tile_not_held,27
twin-shields,97412628,5396,1,126,54,queen_tile_not_held,0
twin-shields,97412628,5843,1,78,24,queen_too_close,18
open-field,45922662,2976,1,76,42,queen_too_early,20
open-field,45922662,3393,0,54,22,queen_too_close,22
open-field,45922662,3626,0,32,54,queen_tile_not_held,0
wide-plain,97084013,4936,0,116,40,queen_too_close,52
isthmus,81377373,3132,1,82,36,queen_tile_not_held,14
isthmus,81377373,3457,1,90,22,queen_tile_not_held,6
twin-shields,16511683,3021,0,30,68,queen_tile_not_held,0
isthmus,73130888,3316,1,94,40,queen_tile_not_held,2
isthmus,73130888,3552,1,100,40,queen_tile_not_held,0
isthmus,73130888,4965,0,36,80,queen_tile_not_held,4
four-lanes,96911155,8909,1,90,54,rate_limited,6
four-lanes,96911155,8944,1,90,54,rate_limited,6
four-lanes,96911155,9005,1,90,54,queen_tile_not_held,6
four-lanes,96911155,10340,0,56,42,queen_too_close,24
three-crossings-v2,61743710,5347,0,60,45,queen_cooldown,28
three-crossings-v2,61743710,5530,0,60,45,queen_too_close,28
three-crossings-v2,61743710,6030,0,34,42,queen_tile_not_held,2
wide-plain,35195771,14861,0,78,76,queen_tile_not_held,14
twin-shields,86877264,2797,1,80,22,queen_too_early,16
twin-shields,86877264,5402,1,46,28,queen_too_close,50
twin-shields,86877264,5445,1,48,30,queen_tile_not_held,48
twin-shields,86877264,7685,1,66,52,queen_tile_not_held,30
isthmus,05136457,3080,0,54,43,queen_too_close,22
open-field,94787452,3135,1,77,28,queen_tile_not_held,19
open-field,54775085,3188,0,38,72,queen_tile_not_held,6
wide-plain,77578512,7362,1,138,20,queen_too_close,54
wide-plain,77578512,7915,0,74,14,queen_tile_not_held,10
open-field,41944606,3060,0,44,16,queen_tile_not_held,12
isthmus,44279384,3356,1,86,44,queen_tile_not_held,10
isthmus,44279384,3743,1,80,48,queen_too_close,16
isthmus,44279384,5906,0,33,72,queen_tile_not_held,1
isthmus,44279384,6545,1,52,48,queen_too_close,44
three-crossings-v2,67747747,2964,1,76,44,queen_too_early,20
three-crossings-v2,67747747,2989,1,76,44,queen_tile_not_held,20
three-crossings-v2,67747747,4866,0,54,22,queen_too_close,22
three-crossings-v2,67747747,7117,1,44,22,queen_tile_not_held,52
three-crossings-v2,67747747,7185,1,56,68,queen_tile_not_held,40
three-crossings-v2,67747747,7228,1,57,69,queen_tile_not_held,39
three-crossings-v2,67747747,8362,1,44,22,queen_too_close,52
three-crossings-v2,67747747,16501,0,52,20,queen_tile_not_held,20
four-lanes,43751345,2984,1,66,46,queen_too_early,30
four-lanes,11093785,8879,1,25,12,queen_too_close,71
wide-plain,83622689,2944,1,216,72,queen_too_early,0
wide-plain,83622689,4880,1,218,4,queen_tile_not_held,0
wide-plain,83622689,5020,1,203,5,queen_tile_not_held,0
isthmus,99328130,7204,1,56,56,queen_tile_not_held,40
isthmus,99328130,7470,1,54,52,queen_tile_not_held,42
central-lake-v2,81674301,3669,0,20,30,queen_too_close,0
central-lake-v2,81674301,3700,0,40,40,rock_tile,8
central-lake-v2,95914540,6133,1,101,79,queen_tile_not_held,0
four-lanes,84050447,3086,0,48,40,queen_tile_not_held,16
four-lanes,84050447,3191,0,48,54,queen_tile_not_held,16
four-lanes,84050447,3368,0,42,80,queen_tile_not_held,10
```

## Map playbook block (copy-paste ready, ≤ 1.5 KB)

```text
ANTWARS 1v1 MAP PLAYBOOK 2026-11-05 ([C]=CONFIRMED,[I]=INFERRED,n=matches)
Boxes: c0 left, c1 right, exact x-mirror (n=269); we are c1. Standard c0 x0-31 / c1 x96-127; wide-plain c0 x0-63 / c1 x192-255.
three-crossings 128x96: enemy c0 x0-31; lanes y16-23/y44-51/y72-79 [I n=37]; stage (64,16) [I atk 5/29]; extras (32,72) n=10,(48,16) n=6/76 [C]
central-lake 128x96: enemy c0 x0-31; lanes y0-23/y72-95 [I n=30]; stage (64,16) [I atk 5/23]; extras (32,72) n=10,(48,16) n=6/54 [C]
open-field 128x96: enemy c0 x0-31; lanes y0-95 [I n=60]; stage (56,24) [I atk 4/46]; extras (32,72) n=12,(48,16) n=7/109 [C]
isthmus 128x96: enemy c0 x0-31; lanes y40-55 [I n=25]; stage (64,48) [I atk 4/20]; extras (32,72) n=6,(32,64) n=5/46 [C]
wide-plain 256x92: enemy c0 x0-63; lanes y0-15/y38-53/y76-91 [I n=36]; stage (152,40) [I atk 2/33]; extras (80,64) n=9,(80,16) n=8/99 [C]
twin-shields 128x96: enemy c0 x0-31; lanes y0-29/y63-95 [I n=24]; stage (72,24) [I atk 3/19]; extras (32,72) n=6,(32,64) n=4/49 [C]
four-lanes 128x128: enemy c0 x0-31; lanes y0-19/y36-55/y72-93/y106-127 [I n=33]; stage (48,40) [I atk 5/29]; extras (48,80) n=8,(48,48) n=6/66 [C]
three-crossings-v2 128x96: enemy c0 x0-31; lanes y16-23/y44-51/y72-79 [I n=12]; stage (40,72) [I atk 1/10]; extras (32,72) n=4,(48,16) n=2/29 [C]
central-lake-v2 128x96: enemy c0 x0-31; lanes y0-23/y72-95 [I n=12]; stage (88,16) [I atk 3/12]; extras (32,72) n=4,(48,16) n=2/24 [C]
```

Block size: 1423 bytes (limit 1,536).

