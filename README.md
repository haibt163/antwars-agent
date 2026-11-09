# antwars-agent

OMP-powered Antwars agent project.

## Starting a match

Run the `antwars-run` command (`.omp/commands/antwars-run.md`). What you add after it decides how fast it starts:

- **House bot:** run it with no text, or name a handle. OMP checks which handles are available, then sends one challenge.
- **A real opponent who is waiting now:** say so and name the route. OMP skips the house-bot checks and goes straight to the queue. Example:

  ```
  Real opponent (route D): "<name>" is waiting in the ranked 1v1 queue right now. Join the ranked 1v1 queue with one entry, within one 15-minute window, and confirm from the match briefing that the opponent is <name>. If you are not paired within the window, leave the queue and report why.
  ```

Ranked matches count toward the rating; challenge matches are unrated.

### Startup contract (non-negotiable)

The model needs 40-170 s per turn, so **no match step may depend on a model turn once the challenge is sent**. One process does the whole handoff:

```sh
node scripts/open-match.mjs --detach --opponent antwars/<handle>   # house challenge (route A)
node scripts/open-match.mjs --detach --queue 1v1                   # ranked queue (route D)
node scripts/open-match.mjs --detach --lobby <lobbyId>             # pre-arranged lobby (route D)
node scripts/open-match.mjs --probe --opponent antwars/<handle>    # read-only availability + allowance
```

It requests the challenge (or joins the queue), polls `locate_match` every 2 s, joins the match server before the nest window closes (`nestSelection.closesAt`), picks the nest, sets worker brood, lays the first FORAGE mark, then sends one `observe` every 45 s until `matchOver` and relays FORAGE while it runs. Log: `%USERPROFILE%\.antwars\opener.log`; live state: `%USERPROFILE%\.antwars\opener-state.json`. In-process handoff is measured at ~2 s; a model-driven handoff measured 597 s on 2026-11-09 and the match ended before the join.

Verify the wire behaviour with `node scripts/test-opener.mjs` (mock match server: join retry, nest refusal + fallback, brood, FORAGE, heartbeats, challenge and queue handoffs). It runs in about 35 s and needs no key and no match.

Files: `prompt.md` is the strategy, `scripts/open-match.mjs` performs the handoff and opening, `scripts/keepalive.mjs` keeps the seat alive when the opener is not running (resume path), `scripts/test-opener.mjs` is the wire test, and `study/` holds match reports and notes. Keep anything OMP does not need before a match out of the run command.

## Post-match update procedure

**Trigger:** When the project owner reports a completed match, first read this section. Run it only after the server confirms a win, loss or draw.

**Evidence:** Use only the server-confirmed result and the run log, never the agent's self-summary. If they disagree, record the server's version and mark the disagreement UNVERIFIED.

**Archive and replace:** Before replacing `study/last-match.md`, move its current contents to `study/match-<result>-<YYYY-MM-DD>-<map-slug>.md` (for example, `study/match-win-2026-11-05-open-field.md`). Use the match start date, the result `win`, `loss` or `draw`, and the map name from the report as a lowercase slug (spaces become hyphens, for example `central-lake-v2`). Always include the map slug, because several matches can finish on the same day with the same result. Never overwrite an existing archive: if the exact name already exists, add `-2` (then `-3`) before `.md` and say so in the PR description; do not stop to ask. Archives made before this rule keep their existing names; do not rename them.

Write the new `study/last-match.md` as a report of the match only: result, route, opponent, map, start/end times and ticks, final state, queen-founding and brood timeline, and decisive server-confirmed events. Exclude agent/tool behaviour such as failed calls, timeouts, retries and delays; put those in the PR description, not the report.

**Strategy:** Update `prompt.md` only for a verified lesson. Cite the match report, label each lesson VERIFIED (server or run-log evidence) or UNVERIFIED (inference), make the smallest wording change, and preserve live-rules-first authority. If there is no new lesson, leave `prompt.md` unchanged and say so in the PR. Never change `antwars-run.md` because of a match result; process changes require a separate PR reviewing the procedure itself.

**References:** Search the repository for references to the previous `study/last-match.md`; update references about that old match to its archived filename. Keep references about the new match pointing to `study/last-match.md`.

**PR:** Open one PR per match from `docs/match-<YYYY-MM-DD>-<result>-<map-slug>` into the current `main`. List the server-confirmed result, changed files, process problems seen during the run (PR description only), and anything still UNVERIFIED.

**Verify before reporting:** Show `git diff --stat` against `main`; confirm the archive exists, the new report is the only new content in `study/last-match.md`, and no files outside the archive, report, justified `prompt.md` update and necessary reference fixes changed. Give the PR link. Do not claim tests were run unless they were.
