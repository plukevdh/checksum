# Files backend

Use this mapping when `work-backend: files` (the default). Read the
[workflow contract](../workflow-contract.md), [authorization](../authorization.md),
and [lifecycle](../lifecycle.md) first. Storage does not select approval policy:
the independent defaults are `execution-host: standalone` and
`approval-policy: interactive`.

## Record mapping

For full-weight work, keep the existing `<artifacts dir>/YYYY-MM-DD-<slug>/`
layout (`artifacts dir` defaults to `docs/checksum`). This directory is the
authoritative work record; do not mirror coordination into Beads.
Light work retains the existing explicit chat design/plan and host task tracker,
not newly mandatory files. Its handoff must carry the same context and evidence;
without retained records, a new session needs that explicit handoff, not a guess.

| Portable record | Authoritative location |
|---|---|
| Contract and run context | `plan.md`, `## Workflow Context` |
| Goal, scope, constraints, alternatives, chosen approach, edge cases | `design.md`, using the existing design template |
| Design state | `design.md` Status: Draft, Approved (human), or Validated (policy) |
| Plan state | `plan.md` Status: Draft, Approved, Validated, Active, or Complete |
| Plan, full verification, completion set | `plan.md`, existing plan template and Task Index |
| Task definition, files, interfaces, steps, failure behavior | `tasks/NN-<slug>.md`, existing task template |
| Acceptance and observed results | Task Acceptance checks and Result; full-run verification in `plan.md` |
| Coordination | Task frontmatter `status`, `claimed-by`, `depends`, `deliver` |
| Diagnosis and containment | Design/task Diagnosis and Containment; optional requested `diagnosis.md` |
| Review, authorization, blockers, delivery | Explicit named sections in task Result and plan close-out |

`## Workflow Context` records `contract: checksum.workflow/v1`, run identity,
repository identity/path, base ref and resolved commit, branch/workspace scope,
`work-backend`, `execution-host`, `approval-policy`, effective preferences with
their sources, method revision, and authority source plus allowed/prohibited
actions. Include a durable session link, completion-set task IDs, excluded
follow-up references, current phase, and the next action/blocker. Record absent
authority as absent, not as an assumed grant. If no plan exists yet, place this
section in the design or requested diagnosis and move it into the plan when
created; keep a pointer rather than a second editable copy.

Preserve all template evidence, not merely the status: exact Run/Expect checks,
actual output and revision tested, red regression evidence for defects,
confidence and reproduction exceptions, containment rollback/monitoring/owner/
removal condition, review findings and dispositions, and approval or policy
validation tied to the exact content. Effective preferences are a snapshot for
resume, not permission to bypass current repository instructions.

## Claims and resumption

Standalone scheduling reads the task index and current task files. A task is
eligible only when `status: pending` and every `depends` entry is `done` with
applicable evidence. Set `status: claimed` and `claimed-by` before editing.
Statuses remain `pending | claimed | done | blocked`; record blocker details
in Result. `deliver: plan | commit | pr` is intent, not authority.

**File edits are not atomic claims.** Re-read immediately before and after a
claim and coordinate overlapping agents through one owner; do not advertise
this backend as a distributed lock. On a conflict or stale claimant, stop and
resolve ownership explicitly, preserving partial work. Never overwrite another
claimant simply because a session appears idle. GasCity workers use only their
host assignment and workspace; they do not scan files and compete for work.

To resume without chat: read Workflow Context, design, plan, all completion-set
tasks and referenced evidence; verify repository/base/branch and authority,
inspect ownership/dependencies, and rerun the last completed checks. Revised
design/plan content returns to Draft for the applicable human approval or policy
validation. Code changes invalidate affected verification and review evidence;
record the new revision and rerun before claiming completion.

## Delivery and retention

`done` is task implementation completion. Only plan finalize may mark root
Complete, after fresh verification of its explicit completion set, resolved
change-wide review, and successful required delivery. Failed push/PR creation
leaves delivery pending and the plan Active, even with passing checks. Task
finalize never closes the root or clears the shared work records.
Record delivery status, branch/commit, PR URL, and observed merge state separately,
with source and time. Complete does not mean merged. Report “PR ready” only when
the actual open PR's current revision passed verification/review; a PR-gated run
still cannot authorize its own merge.

Operational follow-ups are outside the completion set and must survive cleanup:
use a durable issue or committed project tracking entry, not another temporary
task file. Keep the evidence, owner, risk, next signal, and removal condition
in that carrier.

Artifacts remain excluded from changesets unless explicitly requested. Preserve
the existing finish policy: clear working papers only after the condensed record
has shipped durably, or retain them under `artifacts: keep`. A blocked delivery
does not authorize cleanup. This file cleanup rule never applies to retained
Beads records.
