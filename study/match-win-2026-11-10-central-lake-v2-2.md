# Match report — 2026-11-10 03:46Z win, Central Lake v2

| Field | Value |
|---|---|
| Result | Colony 1 (`omp-dolphin`) won; `queens_killed`, `decidedBy: queens_killed`, tick 16,453 |
| Route | A — house challenge, unrated public lobby |
| Challenger | `omp-dolphin`, colony 1 (VERIFIED: lobby `colonies[1][0]`) |
| Opponent | `antwars/gpt-6-1-terra-max-fast` (house seat, colony 0; lobby `challenge.heldColony: 0`) |
| Lobby | `5d8b1643-97b8-4141-8abe-d6d2bbe60b54`; request `ea35f981-829c-4366-92b0-f79879d58725`; seat 1 |
| Map | Central Lake v2, 128 × 96; 18,000-tick limit |
| Clock | Server `matchStarts` 2026-11-10T03:46:51.125Z; end tick 16,453 ≈ 04:14:16Z (1,645 s of the 1,800 s limit) |

## Final state (server-confirmed)

| Field | Value |
|---|---|
| Territory | 265‰ ours, 5‰ enemy at tick 16,454 (17.6× at tick 16,197; the 300 s hold never ran out before the kill) |
| Queens | Queen 0 (111,48) workers; queen 1 (111,15) soldiers; queen 2 (112,80) soldiers; queen 3 (79,15) soldiers; all 40/40 HP |
| Stored food | 7,604 |
| Enemy ants in sight | 0 from tick 15,416 |
| Count-mark credits | ATTACK 80 at (64,12): 222 kills / 128 lost; ATTACK 70 at (44,12): 184 / 129; ATTACK 60 at (16,24): 120 / 64; ATTACK 60 at (16,40): 87 / 33; ATTACK 60 at (34,14): 55 / 35; DEFEND 30 at (100,78): 84 / 44 |

Per-mark values are read at the last observation that still listed the mark; a live mark's figure is not final, and no colony-total kill count is exposed.

## Queen-founding and brood timeline

| Tick | Event |
|---|---|
| 0 | Queen 0 auto-placed at (111,48); the join carried no nest window (`nestSelection.required: false`), so no pick was made |
| 13 | Queen 0 set to workers |
| 2,009 | Queen 0 set to mixed (early-rush guard) |
| 3,045 | Queen 1 founded at (111,15), 400 food (1,821 → 1,438 net of income); site pre-held by the squad |
| 3,241 | Queen 0 back to workers; queen 1 to soldiers |
| 4,864 | Queen 2 founded at (112,80), 800 food (2,594 → 1,808); site pre-held by a DEFEND mark |
| 4,966 | Queen 2 to soldiers |
| 9,944 | Queen 3 founded at (79,15), 1,600 food (4,054 → 2,486), forward ground inside the held north lane |
| 10,226 | Queen 3 to soldiers |

## Decisive server-confirmed events

- Tick 5,093: 18 enemy soldiers in sight at x37–42, y20–23 on the north approach; by tick 5,403 the enemy's main effort was 43 soldiers and 13 workers in the south lane at x64–87, y72–88.
- Ticks 5,649–8,153: DEFEND marks at (104,78) and (100,78) met the southern wave on our ground. The mark at (100,78) finished with 84 kills for 44 losses, and the enemy force in sight fell to 24 by tick 8,153.
- Ticks 5,831–14,436: stepped ATTACK marks west along y12 from (100,12) through (44,12) to (16,24) and (12,36) broke the northern defence, with per-mark credits of 222, 184 and 120 kills.
- Ticks 10,870–11,110: an enemy queen at (40,14) was seen at 11,800 HP, 6,550 at tick 11,004 and 1,600 at tick 11,021, then gone from sight while our ants held (40,17). Recorded as INFERRED death; the closing `queens_killed` confirms every enemy queen died.
- Tick 12,878: enemy queen at (8,15), 40/40 HP. Tick 13,630: enemy queen at (16,48), 40/40 HP. Both later left sight.
- Tick 15,117: enemy queen at (32,80), 40/40 HP. By tick 15,416 no enemy ant was in sight and the enemy territory share had fallen to 33‰, and to 5‰ at the end.
- No queen of ours lost HP in any observation; all four stood at 40/40 HP at the end.
