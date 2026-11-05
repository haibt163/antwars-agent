Result: won. Route A (house challenge), server-confirmed `time_up` victory decided on kills.

┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
│ Field               │ Value                                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Challenger (server) │ omp-dolphin, colony 1 (Lake Hodges Colony)                                   │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Opponent            │ antwars/gpt-6-1-terra-max-fast — "GPT-6.1 Terra", level max, tier fast,       │
│                     │ house bot, colony 0                                                          │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Game type           │ House challenge, public lobby 383955ff…, request 0ec1d3a4…, slot public-0     │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Map / clock         │ Open Field 128×96, 10 ticks/s, 512 cap, 1800 s limit                         │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Start / end         │ 2026-11-05T12:56:14.179Z / tick 17999 → 1799.9 s (30:00) → ~13:26:14Z         │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Result              │ colony 1 won, time_up, decidedBy: kills                                      │
├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Lobby outcome       │ colony_1_won (verified via read_lobby); challenge state finished             │
└─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘

Server result object: `{"winner":1,"reason":"time_up","decidedBy":"kills","tick":17999}`.

Final state at tick 18,000 (VERIFIED): three queens alive at 40/40 HP — q0 (110,23), q1 (111,56), q2 (111,90), all on
soldier brood; territory 1,043 tile areas, share 339‰ against an enemy share of 48‰; 8,780 food stored; in-sight census
445 own ants (359 workers, 86 soldiers) against 53 enemy ants (7 workers, 46 soldiers). No queen was lost by either side.

Queen-founding and brood timeline (accepted calls, run log):

┌─────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Tick        │ Action                                                                     │
├─────────────┼────────────────────────────────────────────────────────────────────────────┤
│ 0           │ Nest pick (110,23) accepted before the clock started                       │
│ 81          │ Queen 0 brood → workers                                                     │
│ 150         │ First mark FORAGE 24 at (105,22); claimed 24 of 34 free ants                │
│ 1405        │ Queen 0 brood → mixed                                                       │
│ 3046        │ Extra queen q1 founded at (111,56) for 400 food; next founding 4846         │
│ 3077        │ Queen 1 brood → soldiers                                                    │
│ 4874        │ Extra queen q2 founded at (111,90) for 800 food; next founding 6674         │
│ 4897        │ Queen 2 brood → workers                                                     │
│ 7280        │ Queen 0 brood → soldiers                                                    │
│ 16138       │ Queen 2 brood → soldiers                                                    │
└─────────────┴────────────────────────────────────────────────────────────────────────────┘

Territory path (server status share, own‰ / enemy‰): 34/34 at tick 350, 182/120 at tick 3696, 275/114 at 7200,
213/90 at 8675 after the front was pulled back, 278/52 at 10859, 301/65 at 14008, 291/109 at 14988, 325/28 at 16323,
339/48 at 18000. The 6× condition was crossed in several windows (for example 353/47 at tick 17892) but never held for
300 s, so the match ran to the time limit and the kill count decided it.

Decisive server-confirmed events:

- Own foragers met enemy foragers at (86–88, 21–23) from tick 1,347; the enemy was already 24 tiles from our nest inside
  the first two minutes, before any extra queen existed.
- The attack force left the nest at tick 5,201 (ATTACK 60 soldiers at (99,23)) and stepped west along y≈18–24, reaching
  (53,16) by tick 6,371.
- The enemy's forward nest stood at (52,30). Its queen read 40,000 mHP when first seen at tick 6,563, then 26,350 mHP at
  tick 7,200, 10,900 at 7,250 and 2,650 at 7,372. Our ants on her tile then died and she regenerated: 4,650 mHP at 8,675,
  8,650 at 9,175 and 9,650 at 10,188. She survived the match. The three ATTACK marks aimed at that nest — (52,24), (52,29)
  and (52,30) — credited 99, 89 and 118 enemy kills while losing 193, 53 and 84 ants.
- The enemy worker economy collapsed under that pressure: 51 enemy workers and 13 soldiers in sight at tick 9,900, then 5
  workers and 14 soldiers at 11,360, 12 workers at 12,176 and 20 workers with no soldiers at 14,049. Their territory share
  fell to 19‰ at tick 11,011, rebounded to 109‰ by tick 14,988 as their soldiers spread, then fell back to 28‰ at 16,323.
- Our own census reached the 512 cap: 510 ants in sight at tick 11,857 and 512 at 14,395; at tick 12,600 that census read
  386 workers and 125 soldiers. Food rose to 5,543 by tick 14,049 and 8,780 at the end while the colony stayed at the cap,
  so brood changes made after the cap was reached produced no new ants until ants died.
- The server ended the match at tick 17,999 with `time_up` and `decidedBy: kills`. The server did not return per-colony
  kill totals; the largest single mark credit observed was 118 kills, and the mid-match strike marks credited 85–118
  kills each against 53–193 losses.

Interpretation, not directly observed: the win came from the kill total rather than the territory hold, since the 6×
window never lasted 300 s; and the forward queen at (52,30) survived because her 40 HP plus 1 HP/10 s regeneration
outlasted every strike once our ants on her tile were killed.
