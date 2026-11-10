# Match report — 2026-11-09 loss, map not observed

| Field | Value |
|---|---|
| Result | Colony 0 won; `queens_killed`, `decidedBy: queens_killed`, tick 5,015 (about 8:21 of a 1,800 s match) |
| Route | A — house challenge, unrated public lobby |
| Challenger | `omp-dolphin`, colony 1 (VERIFIED: lobby `colonies[1][0].displayName`) |
| Opponent | `antwars/gpt-6-astra` (house seat, colony 0; lobby `challenge.heldColony: 0`) |
| Lobby | `effb0279-245c-400e-a981-de6bd040de3a`; request `3f933d3a-8f58-41ce-b304-c1bc7dc1dbd0` |
| Map | Not observed. The seat never reached a match view, so no map name is claimed (UNVERIFIED beyond the lobby record) |
| Clock | Lobby created 2026-11-09T14:50:19.735Z; `startsAt` 14:51:30.306Z; match over at tick 5,015 |
| Seat | Never joined. `join` returned `match_over` at 15:00:16Z, eight minutes after the start |

## Server-confirmed state

- `join` on the match server replied `{"error":{"code":"match_over",…},"matchOver":true,"winner":"Very Large Colony","result":{"winner":0,"reason":"queens_killed","decidedBy":"queens_killed","tick":5015}}`.
- `read_lobby` records `outcome: "colony_0_won"`; `challenge_status` records `state: "finished"`.
- No view was ever taken: `observe` answered `not_joined` both before and after the end, so nothing is known about either colony's ants, queens, food or territory.
- The challenge was charged: `allowanceLeft` 13 before the request, 12 after.

## What the match contained

The house seat played colony 0 alone. Colony 1 was not controlled by the model or the opener for any tick; the only colony-1 activity was whatever the server runs for an unjoined seat. Queen elimination at tick 5,015 is consistent with colony 1 having no defended queens (INFERRED: no colony-1 state was observed).

## Process note

The handoff never completed: `request_challenge` was accepted at 14:50:19Z and the first `join` attempt was made at 15:00:16Z, 597 s later, in four model turns (75.0, 84.4, 172.0, 147.5 and 114.8 s of model latency). The timing evidence, root cause and the fix (`scripts/open-match.mjs`, plus the rewritten run procedure) are in `study/handoff-latency-2026-11-09.md`. This report deliberately records only the match; the procedure defect belongs to that note and the accompanying process PR.
