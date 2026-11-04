# Antwars — next-match strategic instructions

Use this file as the gameplay strategy reference for `/antwars-run`. It supplements the command's authorization, challenge, tool-use and stopping rules; it does not replace them.

**Authority order:** live match briefing and live rules first; the command's safety/authorization rules second; this strategy and historical study files after those. Never assume a historical number, command limit, map mechanic or tool schema is still current. Verify it from the live match.

## Evidence from our matches

- The server-verified November 4 match in `study/last-match.md` was on Wide Plain (256 × 92) against `antwars/gpt-6-1-terra-max-fast`. It ended at tick 18,058 (about 30:06) with a sustained-territory win for the opponent. Our territory share fell from 90‰ to 45‰ to 13‰; at the end we had 48 soldiers, 0 workers, 4,451 stored food and 80 territory tiles. The report records worker production being switched off, marks expiring, rejected calls and loss of both additional queens.
- The 10-game archive in `study/match-notes.md` found that winners placed the first ATTACK mark in 7/10 matches, had more kills in 9/10, and founded at least as many extra queens in 9/10. All 3 sampled territory wins depended on a final qualifying 300-second territory run. These are a small historical sample, not guarantees or a fixed build order.
- In the same archive, all 5 sampled queen-elimination losers lost every queen. Queen damage could become fatal very quickly: 11 of 16 recorded queen deaths occurred within 10 seconds of first recorded HP loss.
- The prior match report is evidence of what failed, not proof that simply producing more soldiers will fix it. Our key correction is to preserve worker income and home territory while applying selective military pressure.

## Strategic priorities

### 1. Secure the opening

- Read the map and briefing immediately. If the live rules allow a player-selected nest, make `pick_nest` the first gameplay action while its selection window is open. Do not delay it for extended analysis, scouting or other commands.
- Choose a defensible site with useful food access, away from obvious enemy crossing lanes and exposed central approaches. Do not automatically choose the back edge if it creates a poor food or expansion position.
- Confirm that the nest command was accepted. If the selection window has already closed, do not repeatedly retry it; assess the actual auto-placed queen and adapt.
- Establish worker production and useful FORAGE coverage early, using only visible, reachable targets and accepted commands.

### 2. Keep the economy alive

- Maintain a sustainable source of workers throughout the match. Do not switch every surviving queen to soldiers-only brood simultaneously.
- If live rules support per-queen brood assignments, use them to balance worker production and military production. If brood is controlled at colony level, use the live-supported setting that preserves a viable economy; do not assume per-queen control exists.
- With only one queen, avoid a permanent soldiers-only setting unless an immediate, clearly justified endgame threat makes it necessary. Reassess as the battlefield changes.
- Spend food deliberately on replenishing the workforce and army. Found additional queens when the live cost, cooldown, placement and tile-control requirements are satisfied and the new queen can realistically be defended.
- Do not allow stored food to accumulate while workers are at zero or the army is unable to replenish. Check why production has stopped and correct the cause.

### 3. Treat territory as a win condition, not a side effect

- Preserve a home defence reserve. Do not send the entire mobile force away from the colony to chase enemy units.
- Maintain useful coverage of home ground and strategically valuable routes. Use the live observation to identify areas being lost or left unattended; use suitable FORAGE, LINE, DEFEND or other supported orders only where they serve that objective.
- Watch the opponent's territory progress and our own trend. If a qualifying enemy territory run begins, prioritize disrupting it before its live sustained-hold timer completes.
- When pursuing territory, maintain presence and revisit important ground rather than relying on one temporary push. The historical study observed 300-second qualifying runs; confirm the current live condition before relying on that duration.
- Keep enough workers for food and coverage, and enough soldiers to remove enemy incursions. Do not trade away the home map merely to gain kills elsewhere.

### 4. Scout first; attack with purpose

- Explore progressively and identify the enemy's nest, approach routes, army concentration and exposed territory. Do not claim the enemy nest is located until the observation actually supports that conclusion.
- Prefer coordinated soldier pressure against a worthwhile target over repeated small attacks into concentrated defenders.
- Use ATTACK when the local numbers, route and objective justify it. Do not spam ATTACK marks or pursue kills at the expense of queen safety, worker income or territory.
- Reassess after each consequential order. If a command is refused, read its error, correct the cause and do not repeat the same invalid request.

### 5. Treat queen damage as an emergency

- Maintain appropriate defensive coverage around every living queen and keep a mobile reserve able to respond.
- Check every queen's live ID and HP in observations. Any HP reduction or nearby enemy concentration requires immediate reassessment; do not wait for the next relaxed observation interval.
- Queen damage can become fatal very quickly. Reinforce, reposition or redirect forces using only supported live commands. Never assume a queen is alive because it was alive in the previous observation.
- Before `found_queen` or queen-specific brood actions, verify the target queen is alive and that all live placement, food, cooldown and tile-control conditions are met.

### 6. Manage marks and command cadence

- Use the exact live mark duration, placement reach, visibility requirements and per-tool rate limits. Historical notes mention approximately 180-second expiry and a limited placement reach, but those values must be checked against the current briefing and rules.
- Refresh critical marks before they expire, allowing for command cooldowns and placement reach. Do not wait until protection has already lapsed.
- Do not issue commands on a blind fixed 10-second loop. Respect the live rate limits, observe the returned acceptance state, and batch only actions that are genuinely needed.
- Keep the command's observation and idle discipline: more frequent checks during the opening and active fights, slower checks during calm periods, and never exceed the documented idle limit. Refused calls do not count as accepted progress.

## Decision rule

At each observation, prioritize in this order:

1. Prevent an immediate queen loss.
2. Stop an imminent enemy territory win or defend critical home ground.
3. Restore worker income and sustainable production.
4. Correct exposed queens, broken marks or vulnerable expansion positions.
5. Expand, scout and launch selective attacks when the above are stable.

This is a priority order, not a rigid script. An imminent threat can change the order. Adapt to the actual map and live state; do not follow a fixed minute-by-minute build.

## End-of-match review

Report the server-confirmed winner, end condition, duration, final queen count and HP, worker and soldier counts, stored food, territory outcome, important accepted and rejected commands, and the decisive events. Separate server-confirmed facts from interpretation. Compare the result against the previous match's specific failure modes: worker collapse, territory loss, queen exposure, mark expiry and rejected calls.

**No strategy guarantees a win.** The objective is to avoid repeating documented mistakes and make each decision from the current battlefield.