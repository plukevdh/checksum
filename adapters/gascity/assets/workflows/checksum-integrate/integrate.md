# Integrate completed task branches into the work branch

Apply `checksum-host.binding` preflight first. This step is host-owned
integration under the Authority that names the work branch; it never edits
source by hand, never touches the default branch or any remote, and never
resolves conflicts. `drain_policy={{drain_policy}}`.

Resolve the workflow root, the portable checksum root, the implementation
convoy (`gc.input_convoy_id`) and the work-branch workspace that `prepare`
recorded (`WORK_DIR=checksum.work_dir`, `WORK_BRANCH=checksum.branch`). Verify
`git -C "$WORK_DIR" rev-parse --abbrev-ref HEAD` equals `WORK_BRANCH` and
`git -C "$WORK_DIR" status --porcelain` is empty (paths listed in
`info/exclude`, such as `.beads/redirect`, do not appear there). A dirty tree,
detached HEAD or wrong branch fails this step: under both policies every lane
commits its work, so uncommitted changes here mean a lane did not finish.

Read the drain control bead of the predecessor that actually ran (the
non-skipped `implement`/`implement-same-session` or `drain-*` step) and its
`gc.drain_manifest.v1` rows, with the same rules as upstream `wait-for-drain`:
every convoy member must be `succeeded`/`pass` or already closed with
`gc.outcome=pass`. Any failed, skipped or open member fails this step with the
member IDs in the reason. Do not close, reopen or reassign members.

## Land task branches (`separate` only)

Under `same-session` every task committed directly on `WORK_BRANCH`; confirm
each member's `work_dir` equals `WORK_DIR` and skip to verification.

Under `separate` each member ran in its own worktree (`work_dir`) on its own
task branch (`branch`). Order members topologically over the `blocks` edges
between convoy members only (ignore edges to the portable root or anything
outside the convoy); break ties by (`created_at`, id); a cycle fails this step.
For each member in that order, with `MEMBER_WT` and `TASK_BRANCH` from its
source anchor:

1. `git -C "$MEMBER_WT" status --porcelain` must be empty and its HEAD must be
   `TASK_BRANCH`. Record `PRE=$(git -C "$MEMBER_WT" rev-parse HEAD)`.
2. If `git -C "$WORK_DIR" merge-base --is-ancestor "$TASK_BRANCH" "$WORK_BRANCH"`
   succeeds the member is already landed (a resume, or a task with no
   commits): record it and continue.
3. `git -C "$MEMBER_WT" rebase "$WORK_BRANCH"`. Commits already landed via a
   stacked prerequisite drop out as patch-identical. On any conflict:
   `git -C "$MEMBER_WT" rebase --abort`, then record the member ID, the
   conflicting paths and the work-branch revision landed so far in the portable
   root Handoff as Blocked, set `gc.outcome=fail` and
   `gc.failure_class=checksum_integration_conflict`, and close this step. Never
   resolve conflicts here; that is task work that needs re-review.
4. `git -C "$WORK_DIR" merge --ff-only "$TASK_BRANCH"`. Nothing else writes
   `WORK_BRANCH` during this step, so a non-fast-forward here is an invariant
   violation: fail closed with the same failure class.
5. `POST=$(git -C "$MEMBER_WT" rev-parse HEAD)`; record
   `checksum.integrated=<TASK_BRANCH>@<PRE>..<POST>` on the member. Item
   summaries cite `PRE`; later stages cite `POST` and the integrated revision.

The member worktrees stay on their rewritten branches. If a task branch was
ever pushed it now diverges from the remote; that is expected and only
`publish` may reconcile remotes.

## Integrated verification (both policies)

Run the plan's integrated verification (the full check set the plan names, not
per-task subsets) in `WORK_DIR` and read complete output. A failure here is a
defect of the combination: record the failing commands and output in the
Handoff, set `gc.outcome=fail` and
`gc.failure_class=checksum_integration_verification`, leave the work branch at
its current state, and close this step. The review loop does not run on an
unverified integration.

## Resume after a block

There is no automatic retry. The operator reopens the blocked member; its task
lane reworks on its own task branch (rebasing onto the current work branch and
resolving the conflict there, with re-review of that task); the drain closes it
again; and a re-run of this step skips already-landed members via the ancestor
check and continues from the blocked one.

## Record

On success record on the workflow root
`checksum.integrated_revision=$(git -C "$WORK_DIR" rev-parse HEAD)`,
`checksum.integrated_members=<comma-separated member IDs>`, and the exact
verification commands with results in the portable root Handoff. Downstream
summaries and the review loop operate on this revision in `WORK_DIR`. Set
claimed-step `gc.outcome=pass`, then close only this step. Never push.
