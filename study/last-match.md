Result: won. Route A (house challenge), server-confirmed `queens_killed` victory.

┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
│ Field               │ Value                                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Challenger (server) │ omp-dolphin, colony 1 (Lake Hodges Colony)                                   │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Opponent            │ antwars/gpt-6-1-terra-max-fast — "GPT-6.1 Terra", level max, tier fast,       │
│                     │ house seat, colony 0                                                         │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Game type           │ House challenge, public lobby fed56bbf…, request bf75a2d6…, slot public-0,    │
│                     │ unrated                                                                      │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Map / clock         │ Three Crossings v2 128×96, 10 ticks/s, 1800 s limit                          │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Start / end         │ 2026-11-06T10:55:38.106Z / tick 14849 → 1484.9 s (24:45) → ~11:20:23Z         │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Result              │ colony 1 won, queens_killed (decidedBy queens_killed, tick 14849)            │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Lobby outcome       │ colony_1_won (verified via read_lobby); challenge state finished             │
└─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘

Server result object: `{"winner":1,"reason":"queens_killed","decidedBy":"queens_killed","tick":14849}`.

Final state at tick 14,850 (VERIFIED): four queens alive at 40/40 HP — q0 (110,21) on workers, q1 (110,55),
q2 (110,90) and q3 (77,21) on soldiers; territory 903.25 tile areas, share 294‰ against an enemy share of 0‰;
9,440 food stored; in-sight census 512 own ants (362 workers, 150 soldiers) against 0 enemy ants. No enemy queen
remained in sight. No queen of ours took damage in the match.

Queen-founding and brood timeline (accepted calls, run log):

┌─────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Tick        │ Action                                                                     │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 0           │ Nest pick (110,21) accepted before the clock started                       │
│ 2799        │ Queen 0 brood → workers                                                    │
│ 2804        │ First mark FORAGE 26 at (99,20); claimed 26 of 61 free ants                │
│ 3265        │ Queen 1 founded at (110,55) for 400 food; next founding 5065               │
│ 3721        │ Queen 1 brood → soldiers                                                   │
│ 5209        │ Queen 2 founded at (110,90) for 800 food; next founding 7009               │
│ 5316        │ Queen 2 brood → workers                                                    │
│ 6957        │ Queen 2 brood → soldiers                                                   │
│ 7132        │ Queen 3 founded at (77,21) for 1,600 food; next founding 8932              │
│ 7173        │ Queen 3 brood → soldiers                                                   │
└─────────────┴────────────────────────────────────────────────────────────────────────────┘

Queen 3 sat 33 tiles from queen 0, outside the back quarter, on ground the army had taken two minutes earlier
(mark ATTACK 70 at (77,20), tick 5673). All three founding attempts were accepted; none was refused.

Territory path (server status share, own‰ / enemy‰): 42/102 at tick 2932, 106/100 at 4693, 158/104 at 5451,
224/143 at 6248, 306/80 at 11575, 318/25 at 12039, 345/6 at 14151, 294/0 at 14850. The 6× condition was crossed
from about tick 12,039 but dipped to 5.8× at tick 13,313, so no 300 s hold completed (UNVERIFIED that any window
ran; the server never reported an early-win trigger).

Decisive server-confirmed events:

- Enemy contact from tick 3,725: 11 enemy soldiers at (84–93, 18–27) inside the north lane, already mauling our
  foragers — the FORAGE mark had lost 57 workers and credited 16 kills by then.
- Gate battle in the north lane (water wall x56–71, gate y16–23): enemy strength in sight rose 32 (5451) → 52
  (5626) → 79 (6248) soldiers, then fell to 11 by tick 7664 after our ATTACK marks traded 40 kills for 21 losses
  and 66 for 46 on successive steps.
- Enemy queen at (29,19): 40,000 mHP when first seen at tick 8083, 30,100 mHP at 8448 with a 70-soldier ATTACK
  mark on her tile (mark credited 98 kills), and out of sight by tick 8741 while our ants held the tile.
- Enemy rebuild: from 11 soldiers at tick 8448 the colony fielded 54 by tick 10165 and 5 by 11575 — its queens kept
  producing after the field army was broken, so the match continued until the queens themselves were found.
- Enemy queen at (4,46): 40,000 mHP at tick 12777 — near the west map edge, 4 tiles in from x0, not at the box
  centre and not the mirror of our (110,21). An ATTACK mark was laid on (5,46) at tick 13084 and she was out of
  sight by 13313.
- Enemy queen at (38,72): 40,000 mHP at tick 14516 in the playbook's south extra-queen cell. ATTACK 100 was laid
  on (37,72) at tick 14679 and the server ended the match 170 ticks later at tick 14849 with `queens_killed`.

Interpretation, not directly observed: the win came from queen elimination, not from the territory hold, since the
6× ratio never lasted 300 s (label UNVERIFIED). The individual death ticks of the three enemy queens were never
reported — enemy `queen_lost` events are not surfaced to the opposing seat — so each death is inferred from the
queen leaving sight with our ants on her tile; only the final `queens_killed` verdict is server-confirmed.
The 512-ant in-sight reading at tick 13,313 happens to equal the smallest published colony cap, but the cap for this
seed was not read (UNVERIFIED).
