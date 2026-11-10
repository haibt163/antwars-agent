# Match report — 2026-11-10 win, Central Lake v2

| Field | Value |
|---|---|
| Result | Colony 1 (`omp-dolphin`) won; `queens_killed`, `decidedBy: queens_killed`, tick 8,573 |
| Route | A — house challenge, unrated public lobby |
| Challenger | `omp-dolphin`, colony 1 (VERIFIED: lobby `colonies[1][0]`) |
| Opponent | `antwars/gpt-6-astra` (house seat, colony 0; lobby `challenge.heldColony: 0`) |
| Lobby | `39c3e1db-dc33-4bc4-b6e5-7f3fc65a22e0`; request `a6bf208d-d5c5-4080-8d47-450b2963f29a`; seat 1 |
| Map | Central Lake v2, 128 × 96; 18,000-tick limit; ant cap 512 |
| Clock | Server `matchStarts` 2026-11-10T00:30:31.500Z; end tick 8,573 ≈ 00:44:49Z (857 s of a 1,800 s match) |

## Final state (server-confirmed)

| Field | Value |
|---|---|
| Territory | 781.25 tile areas; 11‰ enemy share |
| Queens | Queen 0 (111,48), queen 1 (100,8), queen 2 (92,76); all 40/40 HP |
| Stored food | 1,217 at tick 8,278 |
| Population in sight | 512 at tick 7,638: 276 soldiers, 236 workers (in-sight estimate) |
| Count-mark credits | 433 kills for 190 losses over nine marks (sum of per-mark `kills`/`lost`) |

## Queen-founding and brood timeline

| Tick | Event |
|---|---|
| 0 | Queen 0 auto-placed at (111,48); no nest window was open at the join, so no pick was made |
| 193 | Queen 0 set to workers |
| 2,375 | Queen 0 set to mixed (early-rush guard); stayed mixed to the end |
| 3,006 | Queen 1 founded at (100,8), 400 food (992 → 593), 41.5 tiles from queen 0, site pre-held by the squad |
| 3,129 | Queen 1 set to soldiers |
| 4,838 | Queen 2 founded at (92,76), 800 food (1,018 → 218), 68.5 tiles from queen 1, site pre-held by the squad |
| 4,952 | Queen 2 set to workers |
| 6,493 | Queen 2 set to soldiers |

## Decisive server-confirmed events

- Tick 3,005: a 77-soldier enemy group stood at x84–91, y15–16 on the north approach, west of our box. No queen of ours lost HP at any point in the match.
- Tick 5,179: enemy queen in sight at (64,20), 40 HP. ATTACK marks were laid at (77,20) then on her tile; by tick 5,689 she was gone from sight with 86 of our soldiers within 12 tiles.
- Tick 6,442: enemy queen in sight at (30,26), 40 HP. Marks at (38,24) then (30,26); gone from sight by tick 7,206 with 85 of our soldiers within 10 tiles.
- Tick 8,278: enemy queen in sight at (30,66), 40 HP, 22 of our soldiers within 8 tiles. The match ended `queens_killed` at tick 8,573, so all enemy queens were dead (VERIFIED by the closing reason).
- Territory rose 105 → 281 → 534 → 716 → 772 → 781 areas at ticks 366 / 893 / 5,265 / 6,442 / 7,638 / end; enemy share fell 78‰ (tick 4,952) → 9‰ (tick 8,278) → 11‰ (end).
- Enemy queen deaths are not exposed as events; each disappearance is recorded here as "gone from sight while our ants held her tile" (INFERRED death), and the closing `queens_killed` confirms the count (VERIFIED).
