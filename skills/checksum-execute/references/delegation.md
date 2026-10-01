# Subagent-Per-Task Execution

Used when a native dispatch tool is in your tool list and `delegation` is `auto` or
`subagent-per-task`. The value: each task gets a fresh context with no accumulated
drift, and the primary agent stays cheap enough to act as a real reviewer between
tasks.

## Per-host dispatch mechanics

Trust your actual tool list over this table when they disagree. Pi has no built-in
dispatch assumption; if a Pi extension or other host exposes a suitable dispatch
tool, follow that tool's documented invocation and use the prompt below.

- **Claude Code (Task tool):** dispatch each task as a Task with the prompt below.
- **Codex (`spawn_agent`, requires `features.multi_agent = true`):**
  - Spawn with `fork_turns: "none"` — the default copies your entire transcript
    into the child, defeating the fresh-context purpose and paying for it.
  - For fix rounds, message the existing child with `followup_task` instead of
    spawning a fresh implementer.
  - Don't short-poll `wait_agent`: while you have local work (verifying the
    previous task), don't wait at all; when idle, wait in long bounded stretches.
  - Set `model` and `reasoning_effort` explicitly on every spawn.

## Dispatch prompt

Claim the task file first (`status: claimed`, `claimed-by` set to the primary
session's durable reference — e.g. `delta://thread/$DELTA_CURRENT_THREAD_ID` on
Delta — plus ` agent=<child label>`; format table in the router's
`references/lifecycle.md`) — the primary agent owns all frontmatter writes;
subagents implement, they don't bookkeep. Then give the subagent everything — it has no conversation memory:

```
You are implementing one task from an approved plan. Do exactly this task; nothing
more. Do not commit, push, edit the task/plan files, or touch files outside the
task's file list.

## Global constraints
<plan.md's Global Constraints section, verbatim>

## Testing policy
<the selected mode's rules from testing.md, verbatim>

## Your task
<the task file body, verbatim: files, interfaces, failure behavior, acceptance
checks, steps>

## Report format
When done, report: files created/modified; each acceptance check command with its
actual complete output; anything that deviated from the task and why.
```

## Primary-agent verification (non-negotiable)

After each subagent reports:

1. Read the actual diff — not the report.
2. Rerun the task's acceptance checks yourself; read complete output.
3. Check conformance: files touched match the task list; interfaces match what the
   plan says later tasks consume; no scope creep, placeholders, or weakened tests.
4. Only then update the task file: checkboxes, Result section, `status: done`.

A subagent report of success is a claim. Verification is yours.

## Failure handling

- Review found problems → dispatch one focused fix subagent with the findings.
- Same task fails review twice → take it over inline; something about the task
  needs judgment the dispatch loop lacks.
- An implementation or check fails for an unconfirmed reason → the child stops and
  reports raw evidence; the primary invokes `checksum-debug`, updates the task, and
  decides whether the plan remains valid before any further dispatch.
- The fix reveals a plan defect → stop dispatching and return to the router.

## Parallelism

Dispatch concurrently any set of claimable tasks (status `pending`, all `depends`
done) whose file lists don't overlap — claim each before dispatch so the
frontmatter shows who has what — and verify each result separately before marking
any of them done.
