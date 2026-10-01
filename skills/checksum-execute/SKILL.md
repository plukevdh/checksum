---
name: checksum-execute
description: Execute an approved checksum plan task by task with spec-anchored checks and fresh evidence. Use when the checksum router selects the execute phase - an Approved or Active plan has unchecked tasks or failing checks.
---

# Checksum: Execute

Execute the plan as written; the thinking already happened. Your job here is
faithful implementation, honest checks, and knowing when to stop and route back.

Require preferences and an approved plan from the `checksum` router — a plan file
for full-weight work, the approved chat plan for light work. Read the **entire plan
and the design** before editing anything. If either is stale, inconsistent, or has
a gap that blocks starting, return to the router — do not improvise around a broken
plan. Honor every directive in the `## execute` preferences section.

Before the first edit: set the plan file `**Status:** Active` (light: the task
tracker is the status), and note any pre-existing uncommitted user changes (never
mix them into your work). Full-weight task state lives in the task files'
frontmatter (`tasks/NN-*.md`; semantics in the router's `references/lifecycle.md`)
— mirror it into the host's task tracker for visibility, but the files are the
source of truth.

For light work, first restate the active task, acceptance checks, and any complete
`## Diagnosis`, `## Containment`, or residual-risk block from the approved chat
plan. That explicit restatement is the handoff into execution.

## Choose the delegation mode

With `delegation: auto` (the default), the deciding question is whether a native
subagent dispatch tool is **in your current tool list** — not which brand of host
you are on. Claude Code ships one always (Task); Codex has one only when the user
enabled `features.multi_agent` (`spawn_agent` et al.); enabling it is the user
opting into multi-agent execution, so honor it. Other hosts (e.g. Pi) may expose
dispatch through their tools or extensions.

- **Dispatch tool present** → **subagent-per-task**. Each task runs in a fresh
  context; the plan was written for a zero-context implementer, so hand it over
  whole. Follow [references/delegation.md](references/delegation.md) for the
  dispatch prompt, per-host dispatch mechanics, and the non-negotiable rule: the
  primary agent verifies every result itself — read the diff, rerun the acceptance
  checks. A subagent's "done" is a claim, not evidence.
- **No dispatch tool** (Codex default config, most other hosts) → **inline
  execution**, tasks in sequence. This is where the host's goals feature shines:
  per the `goals` preference, offer to set `/goal` using the plan's Completion
  Condition so the run continues autonomously across turns. Phrasing rules:
  [references/goals.md](references/goals.md).

An explicit `delegation:` preference overrides the auto choice on either host.
Parallel dispatch only for tasks the plan explicitly marks independent.

## The task loop

A task is claimable when its `status` is `pending` and every task in `depends` is
`done`. For each claimable task, preferring numeric order:

1. **Claim it**: set `status: claimed` and `claimed-by` in its frontmatter before
   the first edit. (Claimed by a stale session? Reclaimable — re-verify any partial
   work first.)
2. Apply the testing policy from [references/testing.md](references/testing.md)
   using the `testing` preference (default `spec-anchored`): materialize the task's
   acceptance checks as real tests before or alongside the implementation, with
   expected values taken from the plan — never from running the code.
3. Implement the steps as written. Smallest change that satisfies the task; no
   scope beyond it.
4. Run the acceptance checks and the neighboring tests they affect. Read complete
   output.
5. **Refactor checkpoint:** compare what now exists against the design's structure.
   Tidy naming, duplication, and file placement within the task's scope while
   checks stay green. This scheduled pass replaces red-green ritual as the design
   pressure.
6. Only after you watched its checks pass in this session: check its checkboxes,
   fill its Result section with actual output, and set `status: done`.
7. **Per-task delivery:** a task flagged `deliver: commit` or `deliver: pr` is its
   own delivery unit — run a task-scoped adversarial review first (see below),
   incorporate the findings, then hand to `checksum-finish` for **task finalize**:
   loud completeness scan, fresh scoped verification, delivery (commits authorized
   only by the task-finalize local-review go; pushes/PRs require that same go), and
   worktree cleanup.
   In stacked flows, work each `pr` task on its own branch cut from the previous
   task's branch — in its own worktree when agents run in parallel — so the PRs
   stack cleanly.

A task you cannot move past gets `status: blocked` with the reason written into its
Result section — that is visible progress for other agents, not failure.

## When checks fail

If the cause is not confirmed by causal evidence, invoke `checksum-debug` before
editing further; that skill loads `## debug` preferences and owns the hypothesis
limit. Carry its [diagnosis contract](../checksum-debug/references/diagnosis.md)
into the affected task. For a bug fix, the regression condition must be present in
the task or approved chat plan and observed failing against the broken behavior as
required by [references/testing.md](references/testing.md), unless that policy's
blocked-reproduction exception was explicitly accepted. Never weaken a test, delete
an assertion, or special-case the check to get to green; if the check itself is
wrong, that is a plan defect — say so and route back through the router.

When the error itself supplies causal evidence (for example, a compiler diagnostic
that identifies the invalid symbol), record observed vs. expected behavior, that
evidence, and the regression condition in the affected task or approved chat plan,
then continue only if the approved plan already describes the correction and no new
containment or fix-boundary change was introduced. Otherwise return to the router
for plan/design approval. Do not invoke debug merely to produce a formal contract.

Under subagent-per-task execution, the child stops at an unconfirmed failure and
reports its raw evidence without trying speculative fixes. The primary agent invokes
debug, owns diagnosis/task updates and the escalation decision, and dispatches again
only when the cause is confirmed or the user has explicitly approved proceeding
under `uncertain-fix` with the complete `### Residual risk` section recorded. The
approved plan must still describe the correction.

After the configured consecutive implementation-attempt limit (default 3) fails
despite a confirmed cause, stop and show the evidence. Ask whether to revise the
fix boundary or plan, reopen diagnosis, or pause; repeated failure is an escalation
signal, not proof of an architectural defect.

## Review before handoff

Adversarial review is execute's exit step, run once per **delivery unit** — each
`commit`/`pr`-flagged task before it delivers, and the whole change (integration
included) after all tasks are `done`. With granular delivery this means multiple
reviews across branches, agents, or PRs; that is by design.

Follow [references/adversarial-review.md](references/adversarial-review.md): the
reviewer ladder (cross-model first, at review strength), the checklist, and the
triage rule — blockers and should-fixes get fixed and re-verified now, and the
findings-plus-resolutions record is written into the task's Result section (task
reviews) or a `## Review` section in `plan.md` (the change-wide review). Finish
will refuse delivery without that record.

## Stop and ask

Pause for the user when you hit: a missing dependency or credential, an instruction
you don't understand, scope growing past the design, any destructive action, or any
external effect (push, publish, third-party calls with side effects). Blocked is
reportable; guessing is not.

## Transition

When every task is `done` with observed passing checks and the change-wide review
is incorporated and recorded, report the plan path, per-task results, and the
review record to the router — it will route to `checksum-finish`. Beyond
recording the requested boundary in `deliver`, execute never commits, pushes, or
publishes; every delivery belongs to finish, behind the user's local-review gate.
