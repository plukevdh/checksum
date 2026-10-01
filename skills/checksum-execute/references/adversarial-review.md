# Adversarial Review

The review's stance: **assume the implementation is wrong somewhere and go find it.**
Its inputs are the design, the plan, and the full diff (tracked and untracked) —
not the conversation, and not the implementer's explanations.

**When:** at the end of execution, once per delivery unit — a task-scoped review
before each `deliver: commit`/`pr` task ships (its diff only), and a change-wide
review after all tasks are done (integration included; task diffs already reviewed
get re-examined only where later work touched them). Finish does not run reviews;
it checks the record exists.

## Reviewer selection ladder

A model should not evaluate itself: models recognize and favor their own output
(self-preference bias), and executor and reviewer from the same model share blind
spots. With `reviewer: auto` (default), take the first rung that works:

1. **Cross-model** — another available host's CLI reviews this host's work. The
   documented recipes are from Claude Code to `codex exec` and from Codex to
   `claude -p`. Pi has no built-in cross-model CLI dispatch recipe; use this rung
   only if a separately available CLI is configured.
2. **Clean-context subagent** — same model, no conversation memory, no stake in
   the code. Removes context bias, not model bias; say so in the report.
3. **Structured self-pass** — the checklist below, run cold after re-reading design
   and plan. Weakest; label it as such.

An explicit `reviewer:` preference pins a rung. If the pinned rung is unavailable
(CLI missing or unauthenticated), report that and fall down the ladder rather than
skipping review.

## Cross-model dispatch

Prepare inputs the reviewer can read without tool permissions drama:

1. Write the full diff — including untracked files — to a temp file
   (e.g. `git diff` plus `git diff --no-index /dev/null <new-file>` per untracked
   file, concatenated).
2. Build the prompt from the template below with filesystem paths to the design,
   plan, task files, and the diff file.
3. Dispatch, read-only, **at review strength**: reviews run on a top-tier model at
   the highest reasoning effort the CLI exposes — a junior reviewer adds little.
   Use the `reviewer-model` preference values when set; otherwise the strongest
   tier the CLI offers.
   - from Claude Code:
     `codex exec --sandbox read-only -m <model> -c model_reasoning_effort="xhigh" "<prompt>"`
   - from Codex: `claude -p --model <model> "<prompt>"`, raising the thinking
     budget if the CLI exposes it (e.g. `MAX_THINKING_TOKENS`); the reviewer only
     needs to read the referenced files
4. Triage the findings exactly as with any reviewer. The cross-model reviewer's
   report is still a claim — verify each blocker against the code before acting
   on it, and never let a reviewer's *approval* substitute for Gate 1 evidence.

If the other CLI errors or hangs, note it and drop to rung 2.

## Reviewer dispatch prompt (all rungs)

```
You are reviewing a completed implementation you did not write. Be adversarial:
your job is to find what is wrong, missing, or dishonest before a human relies on
it. Judge only from the documents and diff; implementer intent doesn't count.

## Design
<design.md verbatim, or its path for a cross-model reviewer>

## Plan
<plan.md + task files verbatim (statuses as claimed), or their paths>

## Diff
<full diff including untracked files, or the diff file's path>

Work the checklist below. Report findings as:
- BLOCKER: incorrect behavior, unmet design criterion, dishonest test/evidence
- SHOULD-FIX: real problems that can ship behind a follow-up only if the user says so
- NIT: style and polish
Cite file:line for every finding. If you find nothing in a category, say what you
checked to conclude that.
```

## Checklist (both dispatch and inline review)

**Conformance**
1. Every design success criterion is actually implemented — point to where.
2. Every design edge case has handling — point to it. Missing handling is a blocker.
3. Interfaces match what the plan declared later tasks and callers consume.
4. Global constraints hold across the whole diff.

**Scope**
5. Nothing implemented beyond the design (unrequested features, speculative
   abstraction, drive-by refactors).
6. No unrelated or pre-existing user changes swept into the work.

**Honesty**
7. Tests assert real behavior: no expected values computed by running the code
   under test, no assertions on mocks as outcomes, no weakened or deleted
   assertions relative to the plan's acceptance checks.
8. Checked checkboxes correspond to checks that actually exist and pass.

**Hygiene**
9. No placeholders, TODOs, commented-out code, or debug output.
10. No secrets, credentials, or local paths in the diff.
11. Errors are handled per the design's failure behavior, not swallowed.

**Deep mode** (`review-depth: deep`): additionally map every design edge case to a
specific test by name, and read each new test asking "what production bug would
this fail to catch?"

## Triage

Review feedback is incorporated **before** the user review gate — the user reviews
the post-review state, not a list of known problems:

- **Blockers and should-fixes: fix them now** (substantive fixes return to execute
  and re-verify; rerun whatever verification the fixes touch). A finding you
  believe is wrong is not silently dropped — verify against the code and present
  the disagreement with evidence at the user gate.
- **Nits:** fix when trivial and in scope; otherwise list them at the gate.
- The review summary is recorded where finish can find it — the task's Result
  section for task-scoped reviews, a `## Review` section in `plan.md` for the
  change-wide one — reporting reviewer rung and model, findings, and what changed
  in response: findings plus resolutions, not a to-do list.
