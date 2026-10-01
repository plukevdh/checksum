# Using Goals Features

Some hosts can keep a session working toward a completion condition without
per-turn prompting. Checksum plans are written to plug into this: the plan's
**Completion Condition** section is a ready-to-use goal when the host supports one.

| Host | Feature | Notes |
|---|---|---|
| Claude Code | `/goal <condition>` | A small evaluator model checks the condition after each turn, judging **only from the transcript**. Cleared on success, judged-impossible, or user-facing error. |
| Codex | `/goal <condition>` (`features.goals = true` in `config.toml`, or `codex features enable goals`) | Supports `/goal pause`, `resume`, `clear`. Suited to multi-hour autonomous runs. |
| Pi | No native goals feature is assumed | Continue inline and surface progress/checkpoint evidence; do not invent `/goal` support. |

## When to engage

Follow the `goals` preference:

- `offer` (default): after the plan is approved and execution is about to start,
  if the plan has 3+ tasks or clearly spans many turns, offer once: present the
  goal text and let the user set it (or decline).
- `auto`: set the goal yourself when the host allows, then announce it.
- `never`: skip.

Goals pair naturally with **inline execution**. Under subagent-per-task execution
the primary agent already drives continuation, so a goal adds less — offer it only
for long plans. If the host has no goals feature (including Pi), continue inline
without setting a goal.

## Phrasing a goal that evaluators can judge

The evaluator cannot run commands or read files; it sees only what lands in the
conversation. So:

1. **Measurable end state** — test results, exit codes, counts, file budgets.
   Not "the refactor is done".
2. **Named proof** — the exact commands whose output demonstrates the state
   (the plan's Full Verification list).
3. **Constraints that must hold** — scope boundaries ("no files outside `src/x/`"),
   things that must not regress.
4. **A bound** — optional turn or time clause for safety ("or stop after 20 turns").

Template, filled from the plan:

```
/goal Every task in <plan path> is checked with its acceptance checks observed
passing; <full verification commands> all exit 0 and their output is shown;
no files outside <scope> modified. Stop after <N> turns if not met.
```

During a goal run, surface the proof: run the verification commands and let their
output land in the transcript at each checkpoint, and keep a short progress note
(current task, what was verified, what remains).

## Hard limits

- Never include commit, push, publish, or any external effect in a goal condition —
  those live behind the finish phase's user review gate.
- A goal does not override stop-and-ask rules: destructive actions and scope growth
  still pause for the user (pause the goal if needed).
