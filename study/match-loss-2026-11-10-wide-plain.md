# Match report — 2026-11-10 loss, Wide Plain

| Field | Value |
|---|---|
| Result | Colony 0 (`Very Large Colony`) won; colony 1 (`omp-dolphin`) lost; `sustained_territory`, `decidedBy: territory`, tick 17,002 |
| Route | A — house challenge, unrated public lobby |
| Challenger | `omp-dolphin`, colony 1 (VERIFIED: lobby `colonies[1][0]`) |
| Opponent | `antwars/k3-1-pro-highspeed` (house seat, colony 0; lobby `challenge.heldColony: 0`) |
| Lobby | `04d39500-b042-453a-8fe3-082777609233`; request `642bd974-8b35-48e8-8142-d869f7ad5c2e`; seat 1 |
| Map | Wide Plain, 256 × 92; 36,000-tick (3,600 s) limit; ant cap 1,024 per colony |
| Clock | Server `matchStarts` 2026-11-10T04:50:10.779Z; first view tick 12 at 04:52:11Z; end tick 17,002 ≈ 05:20:30Z (1,700 s of the 3,600 s limit) |

## Final state (server-confirmed)

| Field | Value |
|---|---|
| Territory | 1 original-size tile area (0‰) against ~200‰ for colony 0 |
| Queens | Queen 0 (223,46) and queen 1 (223,14) lost; queen 2 (223,78) and queen 3 (191,64) at 40/40 HP |
| Stored food | 0 at the end |
| Ants in sight | 0 from tick 15,509 to the end |
| Peaks | 989 ants in sight at tick 8,040 (552 workers, 437 soldiers); territory 41‰ / 244 areas at tick 13,915 |
| Count-mark credits | ATTACK 100 at (184,8): 400 kills / 298 lost (last read tick 11,080); DEFEND 40 at (223,46): 40 / 18 (tick 13,915); ATTACK 100 at (210,48): 112 / 52 (tick 15,068); a FORAGE mark in the north lane lost 240 workers |

No enemy queen was seen at any point in the match.

## Queen-founding and brood timeline

| Tick | Event |
|---|---|
| 0 | Queen 0 auto-placed at (223,46); the join carried no nest window (`nestSelection.required: false`), so no pick was made |
| 12 | Queen 0 set to workers |
| 2,067 | Queen 0 set to mixed (early-rush guard) |
| 2,999 | Queen 1 founded at (223,14), 400 food |
| 3,241 | Queen 0 back to workers; queen 1 to soldiers |
| 4,846 | Queen 2 founded at (223,78), 800 food; queen 2 to soldiers at 4,966 |
| 9,944 | Queen 3 founded at (191,64), 1,600 food, on the south side of our pinch; queen 3 to soldiers at 10,226 and to workers at 14,644 |

## Decisive server-confirmed events

- Tick 8,040: 989 ants in sight, but our half held only 13 visible food tiles; the remaining food lay west of our pinch beside the enemy's ~150-worker swarm.
- Ticks 9,572–11,372: the ATTACK mark at (184,8) fought that swarm and finished with 400 kills for 298 losses. A FORAGE mark in the same lane lost 240 workers before it expired.
- Ticks ~12,000–13,200: a 70+ enemy column came through the north lane into our box at x176–215, y16–35. Queen 1 (223,14) was lost by tick 12,288 and queen 0 (223,46) by tick 13,173; our 85-soldier field force stood 60 tiles away at (160,80).
- Tick 13,915: last territory peak, 41‰ / 244 areas. By tick ~14,600 our share was 0‰ against ~200‰ for the enemy.
- Tick 15,509: stored food 0 and no ant of ours in sight. No hatch was observed with food at 0 (INFERRED food-gated hatching); queens 2 and 3 stayed at 40/40 HP to the end.
- Tick 17,002: `sustained_territory`. Colony 0 held at least 100 tile areas and at least 6× our territory for 300 s.
