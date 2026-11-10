# Match report — 2026-11-10 loss, Twin Shields

| Field | Value |
|---|---|
| Result | Colony 0 (`Very Large Colony`) won; colony 1 (`omp-dolphin`, `Lake Hodges Colony`) lost; `queens_killed`, `decidedBy: queens_killed`, tick 17,224 |
| Route | A — house challenge, unrated public lobby |
| Challenger | `omp-dolphin`, colony 1 (VERIFIED: lobby `colonies[1][0]`) |
| Opponent | `antwars/k3-1-pro-highspeed` (house seat, colony 0; lobby `challenge.heldColony: 0`) |
| Lobby | `49d87e88-88dd-4985-be82-7c5d22249ae3`; request `503e1123-b465-4011-a83c-90111eff92be`; seat 1 |
| Map | Twin Shields, 128 × 96; 18,000-tick (1,800 s) limit; ant cap 512 per colony |
| Clock | Server `matchStarts` 2026-11-10T06:04:07.229Z; end tick 17,224 ≈ 06:32:50Z (1,722 s of the 1,800 s limit) |

## Final state (server-confirmed)

| Field | Value |
|---|---|
| Territory | 0 original-size tile areas (0‰) against 349‰ for colony 0 at the end |
| Queens | All three lost: queen 1 (110,10) at tick 14,687, queen 0 (111,48) at 16,237, queen 2 (106,84) at 17,224 |
| Stored food | 4 at tick 13,490 (last read); no recovery observed |
| Ants in sight | 507 at tick 5,386 (292 workers, 150 soldiers, 65 enemy); 39 at tick 14,544 (15 soldiers) |
| Peaks | Territory 662.5 areas / 215‰ at tick 5,024; 1,156 food at tick 4,828 |
| Count-mark credits | ATTACK at (76,22): 30 kills / 27 lost (tick 7,938); ATTACK at (56,20): 45 / 36 (tick 8,584); ATTACK at (34,80): 8 / 1 (tick 13,490); ATTACK at (8,48): 7 / 9 (tick 14,146); DEFEND at (106,84): 1 / 2 (tick 9,146); DEFEND at (111,48): 57 / 51 (tick 16,370) |

Enemy queens were seen twice and never engaged: (32,80) at 40/40 HP (tick 11,477) and (16,48) at 40/40 HP (tick 14,146). No mark landed on either tile.

## Queen-founding and brood timeline

| Tick | Event |
|---|---|
| 0 | Queen 0 auto-placed at (111,48); the join carried no nest window (`nestSelection.required: false`), so no pick was made |
| 9 | Queen 0 set to workers |
| 2,104 | Queen 0 set to mixed (early-rush guard) |
| 3,008 | Queen 1 founded at (110,10), 400 food |
| 3,140 | Queen 0 back to workers; queen 1 to soldiers at 3,142 |
| 4,902 | Queen 2 founded at (106,84), 800 food; queen 2 to workers at 4,912, to soldiers at 6,653 |
| 9,619 | Queen 0 to soldiers — from here every queen bred soldiers |

## Decisive server-confirmed events

- Tick 8,584: the ATTACK mark at (56,20) held 47 soldiers and finished 45 kills against 36 losses; the enemy's main group stood at (48,16) with 34 ants in sight at that observation.
- Tick 11,477: first enemy queen seen, (32,80) at 40/40 HP, with our nearest ants 8 tiles away.
- Tick 13,490: stored food 4; our territory 141‰ against 187‰ for colony 0.
- Tick 14,146: second enemy queen seen, (16,48) at 40/40 HP; the 200-soldier mark at (8,48) answered with only 66 ants.
- Tick 14,687: queen 1 (110,10) lost. Tick 16,237: queen 0 (111,48) lost. Our ants in sight had fallen from 151 at tick 13,490 to 39 at tick 14,544.
- Tick 15,722: our territory 35‰ against 269‰ for colony 0.
- Tick 17,221–17,224: queen 2 at 1.6 HP, then 0; `queens_killed`, winner colony 0, tick 17,224.

All count-mark credits above are per-mark values at the last observation that still listed the mark; they are not colony kill or loss totals.
