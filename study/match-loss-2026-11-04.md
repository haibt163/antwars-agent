 Route A. Match played; lost. Server-verified.

 ┌──────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                  │                                                                                              │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Challenger shown │ omp-dolphin (colony 1)                                                                       │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Opponent         │ antwars/gpt-6-1-terra-max-fast — "GPT-6.1 Terra", level max, tier fast (house bot, colony 0) │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Game type        │ House challenge, public lobby, unrated (lobby 3fa2c6fe…, request c57d8562…)                  │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Map / clock      │ Wide Plain 256×92, 10 ticks/s, 3600 s limit, ant cap 1024                                    │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Start            │ 2026-11-04T06:01:09.885Z                                                                     │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ End              │ tick 18058 → 1805.8 s (≈30:06)                                                               │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Result           │ colony 0 won, sustained_territory / decided by territory                                     │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Lobby outcome    │ colony_0_won; house seat held colony 0 (VERIFIED)                                            │
 ├──────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Allowance after  │ 17 of 20 shared, resets next UTC midnight                                                    │
 └──────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘

 Final state (VERIFIED from observe at tick 18059): queens 0 alive at 40 HP, queens 1 and 2 dead; 48 soldiers, 0
 workers, 4451 food stored, 80 territory tiles (13‰). Enemy visible: 100 soldiers, 69 workers.

 ┌────────┬──────────────────────────────────────────────────────────────────────────┐
 │ Tick   │ Event                                                                    │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 155    │ Running already; pick_nest window had closed, queen auto-placed (223,46) │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 2085   │ Brood workers; FORAGE 24 at home patch (216,26); 92 free ants            │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 5416   │ 2nd queen founded (202,20), cost 400                                     │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 7224   │ 3rd queen founded (190,51), cost 800                                     │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 7328   │ First enemy soldiers seen, x≈148 (148 visible)                           │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 8559   │ Brood switched to soldiers; DEFEND 60 at queen 2                         │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ ~11400 │ Queen 2 killed (server: "Queen 2 is not a live queen you own")           │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 14808  │ Mistake: both remaining queens switched to soldiers-only                 │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ ~16390 │ Queen 1 killed                                                           │
 ├────────┼──────────────────────────────────────────────────────────────────────────┤
 │ 18058  │ Territory win for colony 0; my territory 533 → 80 tiles                  │
 └────────┴──────────────────────────────────────────────────────────────────────────┘

 What actually decided it (VERIFIED): territory. My share fell 90‰ (t=594 s) → 45‰ (1280 s) → 13‰ (end) while enemy
 ants sat on my ground; they completed the 6×-for-300 s run.

 Own errors, evidence-backed: (1) no nest pick — match had started before my first pick_nest; (2) worker production
 switched off at 1481 s, so workers hit 0 and food income flatlined at ~4.5k, starving the army; (3) repeated
 rate_limited/call_rate windows wasted from 10 s command intervals; (4) 180 s mark expiry left queens undefended in
 gaps; (5) enemy nest never located, so no counter-raid. No further challenge or lobby was created.