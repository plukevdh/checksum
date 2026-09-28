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

1. **Cross-model** — a different model reviews the executor's work through a
   host-supplied provider route. Record actual executor/reviewer models; a
   different CLI or agent name alone does not prove model independence.
2. **Clean-context subagent** — same model, no conversation memory, no stake in
   the code. Removes context bias, not model bias; say so in the report.
3. **Structured self-pass** — the checklist below, run cold after re-reading design
   and plan. Weakest; label it as such.

An explicit `reviewer:` preference requests a rung. If unavailable, disclose why
and fall down the ladder rather than skipping review, unless project instructions
require that rung (then block). Record rung, provider/model, reasoning strength,
dispatch provenance, reviewed revision, scope and limitations.

## Cross-model dispatch

Standalone uses the bundled
[host binding](../../checksum/references/hosts/standalone.md); a GasCity adapter
supplies its own role/provider route. Prepare complete inputs through that route:

1. Write the full diff — including untracked files — to a temp file
   (e.g. `git diff` plus `git diff --no-index /dev/null <new-file>` per untracked
   file, concatenated).
2. Build the prompt below with complete design, plan, task records and full diff.
   Use durable references or read-only projections if the backend is not files.
3. Dispatch, read-only, **at review strength**: reviews run on a top-tier model at
   the highest reasoning effort the CLI exposes — a junior reviewer adds little.
   Use the `reviewer-model` preference values when set; otherwise the strongest
   available host-supplied tier. Concrete provider commands and sandbox setup
   belong to the host, not core methodology. Verify effective filesystem/tool
   isolation separately: a read-only backend/bead flag does not isolate the
   filesystem or prevent other side effects. Do not send private code to a
   third-party provider without permission.
4. Triage the findings exactly as with any reviewer. The cross-model reviewer's
   report is still a claim — verify each blocker against the code before acting
   on it, and never let a reviewer's *approval* substitute for fresh verification.

If the route errors or times out, record it and use the next permitted rung.

## Reviewer dispatch prompt (all rungs)

```
You are reviewing a completed implementation you did not write. Be adversarial:
your job is to find what is wrong, missing, or dishonest before a human relies on
it. Judge only from the documents and diff; implementer intent doesn't count.

## Design
<complete design record, or accessible read-only reference>

## Plan
<complete plan and task records (statuses as claimed), or accessible references>

## Diff
<full diff including untracked files, or the diff file's path>

Work the checklist below. Report findings as:
- BLOCKER: incorrect behavior, unmet design criterion, dishonest test/evidence
- SHOULD-FIX: real problems to resolve before delivery, not an unattended to-do list
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

Review feedback is incorporated **before** finish's delivery review package under
either approval policy:

- **Blockers and should-fixes: fix them now** (substantive fixes return to execute
  and re-verify; rerun whatever verification the fixes touch). A finding you
  believe is wrong is not silently dropped — verify against the code and present
  the disagreement with evidence in the package and PR when applicable.
- **Nits:** fix when trivial and in scope; otherwise disclose them.
- Record findings and resolutions in the selected backend's task Result (scoped)
  or root Review (change-wide), with reviewer provenance and tested revision.
  Policy validation is not human acceptance. Repairs stay within configured
  budgets; exhaustion records blocked state rather than another review loop.
