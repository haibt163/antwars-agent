Result: won. Route A (house challenge), server-confirmed sustained-territory victory.

┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
│ Field               │ Value                                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Challenger (server) │ omp-dolphin, colony 1 (Lake Hodges Colony)                                   │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Opponent            │ antwars/claude-opus-5-5 — "Claude Opus 5.5", level high, house bot, colony 0  │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Game type           │ House challenge, public lobby f926bfc6…, request 39beef46…, slot public-0     │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Map / clock         │ Twin Shields 128×96, 10 ticks/s, 1800 s limit                                 │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Start / end         │ 2026-11-05T11:43:02Z / tick 13450 → 1345.0 s (~22:25), ~12:05:28Z             │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Result              │ colony 1 won, sustained_territory, decidedBy: territory                      │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Lobby outcome       │ colony_1_won (verified via read_lobby); challenge state finished             │
└─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘

Server result object: `{"matchOver":true,"winner":"Lake Hodges Colony","result":{"winner":1,"reason":"sustained_territory","decidedBy":"territory","tick":13450}}`.

Final state at tick 13,451 (VERIFIED): one queen alive at 40/40 HP — q0 (112,24), the starting nest; territory 180 tiles, share 58‰; 2,341 food stored;
169 of our soldiers and 159 enemy soldiers in colony sight; enemy workers in sight 0; enemy territory share 0 at the last sampled status.

Queen-founding and brood timeline (accepted calls, run log):

┌─────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Tick        │ Action                                                                     │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 0           │ Nest pick (112,24) accepted before the clock started                       │
│ 62          │ Queen 0 brood → workers                                                     │
│ 67          │ First mark FORAGE 24 at (111,24); claimed 24 of 27 free ants                │
│ 2016        │ Queen 0 brood → mixed (early-rush guard phase)                              │
│ 2157        │ DEFEND 12 soldiers at (110,32), home guard                                  │
│ 3078        │ Extra queen q1 founded at (108,60) for 400 food; next founding at 4878      │
│ 3109        │ Queen 0 brood → workers                                                     │
│ 3123        │ Queen 1 brood → soldiers                                                    │
│ 6308        │ Queen 0 brood → soldiers (soldier surge)                                    │
│ 8162        │ Queen 1 lost to an enemy raid on the south nest                             │
└─────────────┴────────────────────────────────────────────────────────────────────────────┘

Territory path: 306 tiles at tick 1,000, 557 at tick 2,733, down to 89 at tick 10,118 after the army pushed west and left home ground
unvisited; stationary ground-holding marks from tick 10,428 lifted it back over 100 by about tick 10,450 and held 154–251 tiles until the end.

Decisive server-confirmed events:

- Enemy foragers reached the frontline patch (x≈89–92, y≈25) by tick 2,120; from tick 2,155 to about 6,500 the two colonies traded in that band, and our
  worker count in sight fell from 134 to a low of 52 before recovering to about 130.
- Our extra queen q1 (108,60) was lost at tick 8,162 (server queen record: hp 0, lostTick 8162) to enemy soldiers raiding the south nest.
- Enemy forward queen at (56,22): 40,000 mHP when first seen at tick 7,875, 100 mHP at tick 8,231, out of sight from tick 8,285. No server message
  attributes a death, so her fate is UNVERIFIED. The ATTACK mark on that tile recorded 136 kills.
- Enemy start queen at (18,23): 40,000 mHP when seen at tick 9,150, out of sight by tick 9,710. Her fate is UNVERIFIED.
- Enemy workers in sight were 0 from about tick 8,900 to the end, and the enemy territory share read 0 at every sampled status from about tick 10,000;
  the enemy army was 135–159 soldiers.
- The server ended the match at tick 13,450 with `sustained_territory`, exactly 300 s (3,000 ticks) after the colony crossed back above 100 held tiles
  at about tick 10,450.

Interpretation, not directly observed: with the enemy at zero held territory, 180 own tiles satisfied the 6× ratio (a zero-territory opponent counts as one
tile area), so the decisive work was keeping the last queen alive while pinning ants to ground rather than pushing further; and trading soldiers for
enemy workers removed the enemy's ability to re-claim any tile.
