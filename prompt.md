# Antwars — next-match strategy

`prompt.md` is the single source of gameplay strategy for `/antwars-run`.

**Authority order:** live match briefing and live rules first; the command's safety and authorization rules second; this strategy and historical study files after those. Never treat historical values or tactics as overriding the live match.

## Evidence from our matches

- **Our server-verified loss:** the November 4 match ended by sustained territory at tick 18,058 (about 30:06). Our territory share fell from 90‰ to 13‰; the final state had 48 soldiers, 0 workers and 4,451 stored food. Two additional queens had been founded and were later lost.
- **Historical study:** in 10 archived matches, winners placed the first ATTACK mark in 7/10, had more kills in 9/10, and founded at least as many extra queens in 9/10. Three sampled territory wins required a final qualifying 300-second hold. Small sample; not a guaranteed formula.

## Secure the opening

- **Nest-site heuristic — UNVERIFIED as a game mechanic:** based on our own match report, choose a site with food access, away from the enemy approach lane and exposed central ground.
- If the pick window has closed, adapt to the auto-placed queen; do not retry `pick_nest`.
- Immediately after `pick_nest`, set brood to workers using the live-supported workers-first setting, then place a FORAGE mark on the nearest visible, reachable food. Target the first FORAGE within about 30 seconds of match start.

## Queen timing (reference targets)

- **From `study/match-notes.md` (10 matches, winners):** every winner's first extra queen was founded between 5:00 and 6:58. Most winners that founded a second extra queen did so between about 8:00 and 9:25 (one at 11:05).
- **From `study/last-match.md` (our loss):** our extra queens came at 9:01 (tick 5416) and 12:02 (tick 7224), about 3.5 minutes behind the winners' first extra queen.
- **UNVERIFIED explanation:** although we finished with 4,451 food stored, production may have been limited by queen count rather than food.
- **Targets:** first extra queen at about 5:00; second at about 8:30–9:00, subject to live cost, cooldown, placement and tile-control rules. If founding is refused, read the error and fix the cause once; do not repeat the same request.
- **Applicability:** the archive covers older rules v26/v27; its Wide Plain examples used a 768-ant cap and 2,700-second limit. Our last match had a 1,024-ant cap and 3,600-second limit. Treat these as reference targets, not a fixed build order.

## Strategic priorities

- **Economy:** keep worker production sustainable; do not switch every surviving queen to soldiers-only brood. Spend food deliberately and expand only when the new queen can be placed and defended.
- **Territory:** keep a home defence reserve, maintain useful coverage and interrupt an opponent's qualifying territory run before its hold completes. Do not trade away home ground for kills.
- **Scouting and attacks:** identify enemy positions before committing forces. Prefer coordinated soldier pressure against worthwhile targets over repeated small attacks into concentrated defenders.
- **Queens and marks:** treat any queen HP loss as urgent. Verify queen IDs before queen-specific actions; refresh important marks before expiry and within their actual reach and cooldown.

## Decision rule

At each observation, prioritize:

1. Prevent an immediate queen loss.
2. Stop an imminent enemy territory win or defend critical home ground.
3. Restore worker income and sustainable production.
4. Correct exposed queens, broken marks or vulnerable expansion positions.
5. Expand, scout and launch selective attacks when the above are stable.

This is a priority order, not a rigid build order. Adapt to the actual map and current battlefield.

## End-of-match review

Report the server-confirmed winner, end condition, duration, final queen count and HP, worker and soldier counts, stored food, territory outcome, important accepted and rejected commands, and decisive events. Separate VERIFIED facts from interpretation and compare the result with our documented failure modes.

**No strategy guarantees a win.**