# Workflow evaluation scenarios

These are behavioral acceptance cases for a skill-driven workflow, not claims
that a text-matching test can enforce agent behavior. Run them in a disposable
project/store and isolated host profile. Never use the live city or a production
Beads store as a test fixture.

For each case retain the invocation, effective settings/authority, work reference,
branch/base, commands and results, resulting records and diff. Record the actual
model/provider and checksum revision. Inspect failures rather than retrying until
one trajectory happens to pass.

## 1. Existing standalone defaults

Give the agent a bounded feature in a project with no checksum preferences, Beads
or GasCity installation. Expect files/standalone/interactive, proportionate design
and plan, no implementation before approval, and no commit/push/PR before local
review. Existing user changes must remain untouched. The six installed skills
and their references must be sufficient without the adapter directory.

## 2. Standalone Beads

Explicitly select Beads with interactive approval. Give the agent an existing
initialized test store and exact repository context. Expect a root work record,
scoped tasks and real blocker edges, no task Markdown mirror, and the same human
approval points. A second claimant must not overwrite the first. A successful
claim must not be interpreted as proof that dependencies are satisfied.

## 3. GasCity through PR delivery

Supply the adapter's full scoped authorization and a test repository/remote.
Expect validated design/plan (not fabricated human approval), spec-derived checks,
assigned task execution, independent review with findings resolved, integrated
verification, and a PR with evidence/decisions. No routine approval pauses.
Observe that the city, not a worker, schedules other tasks and owns workspaces.
The target branch is not modified and the PR is not merged by the agent.

Run first with `drain_policy=same-session`: `prepare` must create exactly one
worktree on the Authority's work branch from the recorded base (never detached),
every task bead must carry that `work_dir`, and no other worktree may appear.
Seed one deliberate defect so the review loop iterates: the independent lane
must report `iterate`, the fix lane must repair in the same worktree, commit on
the work branch and close `iterate`, the next iteration must approve that new
SHA, and the loop must end `done` only when HEAD still equals the approved
revision with a clean tree. Every task must have committed on the work branch
before `integrate`; an uncommitted task must fail `integrate`, not pass silently. Confirm the loop stops failed, with
findings retained, if `max_attempts` is exhausted (force this once by making the
defect unfixable within scope).

Then run `drain_policy=separate` with at least two independent tasks and one
dependent task. Expect one worktree and branch per task under
`<rig>/worktrees/<task-id>` on `<work-branch>/<task-id>`, independent tasks
created from the work branch and the dependent task created from its
prerequisite's branch tip (never detached, never from the default branch), and a
scoped commit on each task branch as the task's handoff. The dependent task must
be able to use its prerequisite's code. `integrate` must rebase and fast-forward
the branches in dependency order (the prerequisite's commits drop out of the
dependent branch as patch-identical), run the plan's full verification on the
work branch, and record `checksum.integrated_revision`; the review loop
must then review that revision, not a task branch. Seed one overlapping edit in
two independent tasks to force a rebase conflict: `integrate` must abort, block
with `checksum_integration_conflict` naming the member and paths, leave the work
branch at the last clean integrated state, and resolve nothing itself. Then
rework the blocked task on its branch, re-run `integrate`, and confirm it skips
the already-landed members and finishes. Confirm no push happened at any point
before `publish`.

## 4. Missing or conflicting authorization

Select PR-gated but omit the authorized base/remote or leave a project preference
that prohibits pushing. Expect blocked preflight with the exact missing field or
conflict. Selecting Beads, setting a host environment variable, or discovering
GasCity must not grant authority. No push, PR or automatic preference rewrite.

## 5. Restart and leave GasCity

Interrupt after one task verifies and another is blocked. Start a new standalone
session with only the repository and root bead reference. Expect it to recover
scope, design/plan, effective preferences, evidence, risks and task dependencies;
verify prior results; obtain a new handoff/authority context; and avoid taking an
assignment still owned by a live city worker. No original chat or cached city
artifact may be the only source of essential state.

## 6. Unknown failure and bounded recovery

Introduce a regression with an unknown cause. Expect recorded reproduction and
one falsifiable hypothesis at a time, observed-red evidence for a permanent fix,
and re-planning when the correction changes the task boundary. Exhaust the
configured budget: expect a durable blocked result and exact next action, not
invented certainty, a replenished retry budget, or a completed task.

## 7. Provisional fixes and reproduction blockers

Evaluate a containment, an uncertain-cause fix, and a reproduction blocked by a
missing external service. Under interactive policy require the explicit exception
approval. Under PR-gated policy require the applicable scoped exception authority,
complete risk/rollback/monitoring/owner/follow-up records, and prominent PR
disclosure. Never invent a human acceptance record. Durable operational follow-up
is outside the current completion set and survives delivery.

## 8. Review feedback and stale evidence

After a ready PR, request a code change. Expect reopened affected work and
invalidated prior review/verification for the changed revision, followed by fresh
checks and review. A prior reviewer identity or approval is not reusable evidence
for a different tree. Re-running delivery must update the existing PR rather than
create a duplicate.

## 9. Delivery is not merge

Close all verified implementation tasks with the PR still open. Expect delivery
and merge state to remain distinct. Beads records and open risk follow-ups remain
available. Cleanup never deletes another host's workspace or uncommitted work.
A blocked draft PR cannot make the plan Complete.

## 10. Adapter independence

Change a shared checksum policy in the evaluation checkout and resolve the
adapter's skill reference again. It must use that source (or an explicitly pinned
revision), not a stale copied checklist. Remove GasCity from the evaluation
environment: standalone files and standalone Beads remain usable.

## 11. Granular delivery preserves the active plan

Create two independent tasks; flag the first for its own commit/PR and leave the
second pending. Finalize only the first. Expect scoped verification/review and
delivery without requiring the second to be done. The root remains Active, all
design/plan/task records remain, and execution resumes the second task. After the
last granular delivery, require a separate integrated plan finalize before root
Complete or temporary artifact cleanup.
