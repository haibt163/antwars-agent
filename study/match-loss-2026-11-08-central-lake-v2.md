Result: lost. Route D (private lobby with a pre-arranged opponent, a human-refined harness), server-confirmed `queens_killed` defeat.

| Field               | Value                                                                   |
|---------------------|-------------------------------------------------------------------------|
| Challenger (server) | omp-dolphin, colony 0 ("Very Large Colony")                             |
| Opponent            | coffee-ant — a human-refined harness (owner-confirmed), not a vanilla house model; colony 1 ("Lake Hodges Colony") |
| Game type           | Private 1v1 lobby `f75168d4-8245-4b4c-aff7-6347a819518b`, slot `private-0`, unrated (`rated: false`); lobby outcome `colony_1_won` |
| Map / clock         | Central Lake v2 128×96, 10 ticks/s, 18,000 ticks (1,800 s)               |
| Start / end         | 2026-11-08T15:15:22.360Z / tick 16,972 → 1,697.2 s (28:17) → ~15:43:39Z  |
| Result              | colony 1 won, `queens_killed` (tick 16,972)                              |

Server result object: `{"winner":1,"reason":"queens_killed","decidedBy":"queens_killed","tick":16972}`.

Final state (VERIFIED): all three queens of ours dead — queen 0 (16,48) lost at tick 13,036, queen 2 (16,82) at
14,926, queen 1 (16,15) at 16,972; territory 0 tile areas (0‰), 2,231 food stored. No enemy queen was ever in
sight (`enemyQueens` empty at every observation), so no enemy queen death is claimed.

Nest and map: `pick_nest` was refused with `nest_food` at (12,16) — a food tile — and the 120 s window had
already closed when the next action ran (3.56 s after the close), so no retry with a fallback tile was made; the
queen was auto-placed at (16,48), the centre of our 32×96 box, not the back quarter used in earlier wins. That is
a separate failure from the expansion-site preparation: no `found_queen` was attempted between tick 3,000 and 7,566, and no
tile ≥32 tiles from the nest was inside ant reach until tick 7,412. The lake occupies x40–87, y24–72; the only
routes to the enemy box are the north lane y0–23 and the south lane y72–95.

Queen-founding and brood timeline (accepted calls, run log):

| Tick  | Action                                                                  |
|-------|-------------------------------------------------------------------------|
| 393   | Queen 0 brood → workers (auto-placed at (16,48))                        |
| 1,737 | Queen 0 brood → mixed (early-rush guard)                                |
| 7,565 | Queen 1 founded at (16,15) for 400 food; next founding 9,365            |
| 7,756 | Queen 1 brood → soldiers                                                |
| 7,758 | Queen 0 brood → workers                                                 |
| 8,305 | Queen 0 brood → soldiers (second enemy wave already inside our half)    |
| 9,485 | Queen 2 founded at (16,82) for 800 food                                 |
| 9,646 | Queen 2 brood → soldiers                                                |
| 9,770 | Queen 2 brood → workers                                                 |

The first extra queen came at 12:36, far behind the 5:00–5:30 target; before it we were a one-queen colony. No
third extra was founded because we never held a tile at least 32 tiles from all three nests: with the nests at
(16,15), (16,48) and (16,82) the only such ground on this map is north-east land and the far lanes, which our
territory never reached.

Decisive server-confirmed events:

- Enemy contact at tick 7,819: 72 enemy ants, 52 of them soldiers, in one block at x25–31, y39–55 — 9–15 tiles
  east of queen 0. From tick 7,819 to 10,595 our soldier count in sight rose 22 → 145; the enemy attacked in
  three soldier waves of 52 (tick 7,819), 55 (north lane, tick 10,595) and 49 (south lane, tick 14,094).
- Queen 0 reached 9.1 HP at tick 8,976 (from 40 HP); she healed to 22.1 HP by 10,595 once the first wave died,
  and was killed at tick 13,036 by a later wave.
- The defence marks won their exchanges but not the attrition: DEFEND 50 soldiers on queen 0 (laid tick 7,982)
  finished with 99 kills for 83 of its own ants lost (1.2:1), and the second DEFEND at (17,47) stood at 10 kills
  for 2 lost (5:1) when read at tick 9,895. Our only marks beyond x=35 were the FORAGE at (37,18) and the
  ATTACK at (40,72), so the waves were never intercepted on their approach; a DEFEND 60 on queen 1 (laid
  12,644) was still claiming 60 when the last wave arrived.
- Territory (own‰): 27 at tick 63, 147 at 2,052 (452 tile areas), peak 131‰/404 tile areas at 10,595, 7 tile
  areas by 15,511, 0 at the end. The 6× territory condition was never approached.
- Enemy routes: a 55-soldier push arrived through the north lane (x29–32, y12–23) at tick 10,595, and ~49 enemy
  soldiers were in the south lane (x24–35, y72–83) at tick 14,094 — the wave that killed queen 2 at (16,82).
- Our one counter-strike: ATTACK 50 soldiers at (40,72) laid at tick 10,411 in the south lane. It never met an
  enemy queen and expired; the army was recalled north when the north lane came under attack.
- Food: 844 at tick 2,052, 3,952 at 7,045 before the first founding, 2,212 after the second founding, 2,231 at
  the end. Banked food was never converted: the colony was at 145 soldiers in sight at tick 10,595 and could not
  replace losses fast enough from two then three queen slots.

Interpretation, not directly observed: the opponent's queen positions are unknown (none seen); its production
rate implies at least two queen slots by tick 8,000 (UNVERIFIED). Kill totals for the match are not surfaced to
the seat, so the kill-race margin is UNVERIFIED.
