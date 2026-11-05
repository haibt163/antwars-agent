Result: won. Route A (house challenge), server-confirmed sustained-territory victory.

┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
│ Field               │ Value                                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Challenger (server) │ omp-dolphin, colony 1                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Opponent            │ antwars/claude-opus-5-5 — "Claude Opus 5.5", level high, house bot, colony 0  │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Game type           │ House challenge, public lobby bd2010ce…, request 4b2d1515…, slot public-0      │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Map / clock         │ Central Lake v2 128×96, 10 ticks/s, 1800 s limit, ant cap 512                │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Start / end         │ 2026-11-04T13:59:01Z / tick 16532 → 1653.2 s (~27:33), 14:26:34Z             │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Result              │ colony 1 won, sustained_territory, decidedBy: territory                      │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Lobby outcome       │ colony_1_won (verified via read_lobby); challenge state finished             │
└─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘

Server result object: `{"matchOver":true,"winner":"Lake Hodges Colony","result":{"winner":1,"reason":"sustained_territory","decidedBy":"territory","tick":16532}}`.

Final state at tick 16,533 (VERIFIED): 3 queens alive at 40/40 HP — q0 (112,28) starting nest, q1 (112,62) founded tick 4,661,
q2 (94,90) founded tick 6,869; territory 665.5 tiles, 216‰; 10,543 food stored; enemy share 0; no enemy ant or queen in sight.
The colony stood at roughly 510 of the 512 ant cap when observed at tick 12,012. Territory was 101 tiles at tick 171.

Queen-founding and brood timeline (accepted calls, run log):

┌─────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Tick        │ Action                                                                     │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 366         │ Queen 0 brood → workers, and held workers for the whole match              │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 368         │ First mark FORAGE 24 at (104,20); claimed 24 of 37 free ants               │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 4661        │ Extra queen q1 founded at (112,62) for 400 food                            │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 5085        │ Queen 1 brood → soldiers                                                   │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 5087        │ Queen 1 spawn point set to (100,22), a forward staging tile                │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 6869        │ Extra queen q2 founded at (94,90) for 800 food                             │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 6872        │ Queen 2 brood → workers                                                    │
└─────────────┴────────────────────────────────────────────────────────────────────────────┘

Decisive server-confirmed events:

- Nest pick accepted at (112,28); the visible home food (132 tiles in sight at tick 763, across x 80–117, y 10–30) was worked by the 24-ant FORAGE mark from tick 368.
- Forward staging (VERIFIED): queen 1's spawn point was set to (100,22) at tick 5,087, and at tick 7,873, 67 of the 162 soldiers in colony sight stood in the 10×10 block x 100–109, y 20–29 that contains that tile. Whether the staging shortened any march or contributed to the result is UNVERIFIED.
- Enemy buildup peaked at 123 enemy ants in sight around x 47–55, y 9–25 at tick 10,837; a separate enemy group of 78, including 61 workers, was seen at x ≈ 40, y 71–79 at tick 11,721.
- Stepped soldier ATTACK marks along the north corridor traded favourably: the largest single mark peaked at 248 kills and 148 losses at tick ~12,570.
- Enemy queens seen: (20,21) at 29.5 of 40 HP at tick 14,147 and out of sight afterwards; (30,66) at 40 HP on ticks 15,623–15,895 and out of sight by tick 16,196.
- Enemy territory share reached 0; the server ended the match at tick 16,532 with `sustained_territory`.

Interpretation, not directly observed: the two enemy queens that left sight were most likely killed by the advancing soldier marks, but no server message
attributed their deaths, and whether the enemy had further queens outside our sight is unknown.
