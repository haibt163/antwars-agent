Result: won. Route A (house challenge), server-confirmed `queens_killed` victory.

┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
│ Field               │ Value                                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Challenger (server) │ omp-dolphin, colony 1                                                        │
│ Opponent            │ antwars/claude-opus-5-5-max — "Claude Opus 5.5", level max, house seat,       │
│                     │ colony 0                                                                     │
│ Game type           │ House challenge, public lobby 63339777-99d6-431e-9c21-48df4f4dfb8f,          │
│                     │ request be8881e2-283e-4178-a7b0-60ccb7955980, slot public-0, unrated          │
│ Map / clock         │ Four Lanes 128×128, 10 ticks/s, 2,700 s limit (27,000 ticks)                 │
│ Start / end         │ 2026-11-06T13:02:44.113Z / tick 11,541 → 1,154.1 s (19:14) → ~13:21:58Z      │
│ Result              │ colony 1 won, queens_killed (decidedBy queens_killed, tick 11,541)           │
│ Lobby outcome       │ colony_1_won (read_lobby); challenge state finished                          │
└─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘

Server result object: `{"winner":1,"reason":"queens_killed","decidedBy":"queens_killed","tick":11541}`.

Final state at tick 11,542 (VERIFIED): four queens alive at 40/40 HP — q0 (110,24) on workers, q1 (110,58),
q2 (110,92) and q3 (110,126) on soldiers; territory 984 tile areas, share 240‰ against an enemy share of 0‰;
1,362 food stored; in-sight census 768 own ants (405 workers, 363 soldiers) against 0 enemy ants. No queen of
ours took damage in the match.

Nest and map: the back-quarter strip (x 96–127, full height) held no water or rocks; the nest was picked at
(110,24) before the clock started.

Queen-founding and brood timeline (accepted calls, run log):

┌─────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Tick        │ Action                                                                     │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 0           │ Nest pick (110,24) accepted before the clock started                       │
│ 74          │ Queen 0 brood → workers                                                    │
│ 187         │ First mark FORAGE 26 at (106,36); claimed 26 of 38 free ants               │
│ 1816        │ Queen 0 brood → mixed (early rush guard)                                   │
│ 3081        │ Queen 1 founded at (110,58) for 400 food; next founding 4881               │
│ 3110        │ Queen 1 brood → soldiers                                                   │
│ 3112        │ Queen 0 brood → workers                                                    │
│ 4949        │ Queen 2 founded at (110,92) for 800 food; next founding 6749               │
│ 4993        │ Queen 2 brood → soldiers                                                   │
│ 11315       │ Queen 3 founded at (110,126) for 1,600 food (food store 1,065 after)       │
│ 11340       │ Queen 3 brood → soldiers                                                   │
└─────────────┴────────────────────────────────────────────────────────────────────────────┘

All four foundings were accepted; none was refused. The three extra nests sit on one column 34 tiles apart
(x = 110, y = 58, 92, 126), all inside our own box.

Territory path (server status share, own‰ / enemy‰): 16/31 at tick 275, 75/53 at 2,349, 141/47 at 5,730,
181/62 at 7,619, 186/23 at 8,838, 223/4 at 9,697, 240/0 at 11,542. The early game was the only stretch with
less territory than the opponent (16‰ against 31‰ at tick 275); the 6× condition was crossed during the
9,000s and held to the end, and the match ended by queen elimination before any 300 s hold completed.

Decisive server-confirmed events:

- Enemy contact in the open middle lane (y40–55) from tick 2,412; enemy ants at (48–50, 42–48) by tick 3,184,
  rising to 51 soldiers in sight by tick 4,464, 45 of them around (48,40) and (48,48) — their two playbook
  extra-queen cells.
- Middle-lane interception: ATTACK 60 soldiers at (96,50), laid at tick 4,513 on our own edge of the lane;
  it expired with 8 kills and 0 losses.
- South push: ATTACK 90 at (96,82) laid at tick 5,563 and stepped through (80,80), (68,80), (56,80), (40,80),
  (30,84) and (14,84). The (56,80) stage traded 147 kills for 189 losses, the worst trade of the match; the
  middle mark at (40,48) stood at 16 kills for 7 losses when read at tick 9,697.
- Enemy queen at (40,80): 40,000 mHP at ticks 7,619 and 7,764; she left `enemyQueens` at tick 8,043 with 73
  of our soldiers inside 6 tiles of her tile. Death INFERRED.
- Enemy queen at (20,39): 40 HP at tick 9,790; out of sight by 10,516 with our nearest ant 13.0 tiles away,
  so she was alive at that point. ATTACK 80 was laid at (30,40) at tick 11,448; the server ended the match
  93 ticks later at tick 11,541 with `queens_killed`.
- Enemy field army: 58 soldiers in sight at tick 4,427 and 0 by tick 7,049; enemy ants in sight 0 at match
  end. Enemy territory share peaked at 70‰ (tick 5,115) and finished at 0‰.

Interpretation, not directly observed: enemy queen deaths are not surfaced to the opposing seat, so each
death is inferred from the queen leaving sight while our ants held her tile; only the final `queens_killed`
verdict is server-confirmed. The fourth queen was founded 226 ticks before the end and is assumed to have
contributed nothing measurable (UNVERIFIED).
