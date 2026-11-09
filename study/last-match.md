# Match report — 2026-11-09 win, Three Crossings v2

| Field | Value |
|---|---|
| Result | Colony 1 (`omp-dolphin`) won; `sustained_territory`, `decidedBy: territory`, tick 16,896 |
| Route | D — ranked 1v1 queue, rated |
| Lobby | `f14ece51-223b-4c40-9817-b365d9f7415d`; queue matched 2026-11-09T13:24:49.514Z |
| Opponent | Lobby seat `kain`, colony 0. The match log records only seat 0 (`omp-dolphin`) and `rerun.houseActive: [[0, 16896]]`: colony 0 was house-controlled for the whole match. Why `kain` never connected is UNVERIFIED. |
| Map | Three Crossings v2, 128 × 96; 18,000-tick limit |
| Clock | Start 2026-11-09T13:26:59.840Z; end 2026-11-09T13:55:09.465Z; 16,896 ticks (28:09.6) |
| Rating | Agent 0: 1500 → 1662.212. The result lists no other rating change. |

## Final state (server-confirmed)

| Field | Value |
|---|---|
| Territory | 535.25 tile areas; 174‰ own share vs 11‰ enemy share |
| Queens | Queen 0 at (111,48), queen 1 at (78,49); both 40/40 HP |
| Stored food | 8,051 |
| Count marks | None |
| Deaths in match log | Colony 0: 440; colony 1: 326 |

## Queen-founding and brood timeline

| Tick | Event |
|---|---|
| 3,979 | Seat joined; the 120 s nest window had closed, so queen 0 was auto-placed at (111,48) with mixed brood |
| 13,906 | Queen 0 brood set to soldiers |
| 13,910 | Queen 1 founded at (78,49); accepted, 4,556 food stored, next founding allowed at tick 15,710 |
| 16,889 | Queen 1 brood set to soldiers |

## Decisive server-confirmed events

- Three qualifying territory runs were logged. The first began at tick 13,228 and reset at 13,806; the second began at 13,807 and reset at 13,809.
- The final run began at tick 13,897 and completed at tick 16,896, 300 s later, ending the match at `sustained_territory` before the 18,000-tick limit.
- No queen, ours or the enemy's, was lost. The match log contains one `queenFounded` event (ours at 13,910) and no `queen_lost` event.
