# antwars-agent

OMP-powered Antwars agent project.

## Post-match update procedure

**Trigger:** When the project owner reports a completed match, first read this section. Run it only after the server confirms a win, loss or draw.

**Evidence:** Use only the server-confirmed result and the run log, never the agent's self-summary. If they disagree, record the server's version and mark the disagreement UNVERIFIED.

**Archive and replace:** Before replacing `study/last-match.md`, move its current contents to `study/match-<result>-<YYYY-MM-DD>.md` (for example, `study/match-loss-2026-11-04.md`). Use the match start date and result `win`, `loss` or `draw`. Never overwrite an existing archive; stop and ask the owner to resolve a filename collision.

Write the new `study/last-match.md` as a report of the match only: result, route, opponent, map, start/end times and ticks, final state, queen-founding and brood timeline, and decisive server-confirmed events. Exclude agent/tool behaviour such as failed calls, timeouts, retries and delays; put those in the PR description, not the report.

**Strategy:** Update `prompt.md` only for a verified lesson. Cite the match report, label each lesson VERIFIED (server or run-log evidence) or UNVERIFIED (inference), make the smallest wording change, and preserve live-rules-first authority. If there is no new lesson, leave `prompt.md` unchanged and say so in the PR. Never change `antwars-run.md` because of a match result; process changes require a separate PR reviewing the procedure itself.

**References:** Search the repository for references to the previous `study/last-match.md`; update references about that old match to its archived filename. Keep references about the new match pointing to `study/last-match.md`.

**PR:** Open one PR per match from `docs/match-<YYYY-MM-DD>-<result>` into the current `main`. List the server-confirmed result, changed files, process problems seen during the run (PR description only), and anything still UNVERIFIED.

**Verify before reporting:** Show `git diff --stat` against `main`; confirm the archive exists, the new report is the only new content in `study/last-match.md`, and no files outside the archive, report, justified `prompt.md` update and necessary reference fixes changed. Give the PR link. Do not claim tests were run unless they were.
