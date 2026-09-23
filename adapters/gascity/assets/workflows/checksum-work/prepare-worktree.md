# Provision the per-task checksum workspace

Apply `checksum-host.binding` preflight first. Read the claimed step's
`gc.root_bead_id`, then that formula root's `gc.input_convoy_id`. Verify the
latter matches runtime `{{convoy_id}}`. Read the input convoy; if
`gc.synthetic_kind=drain-unit-convoy`, use its `gc.drain_member_id` as source
anchor, never the synthetic convoy itself. Otherwise use the input convoy ID.
If the formula root also has `gc.drain_member_id`, both values must agree.
Unwrap a one-element list returned by `bd show --json`.

This is the inherited `do-work` provisioning lane with two changes: the
workspace is created on a named task branch stacked on its prerequisites
instead of `--detach HEAD`, and the branch is recorded alongside `work_dir`.
This is infrastructure only; do not edit source in the launcher checkout
(`gc.work_dir`), which is never an implementation workspace.

Read the portable root Authority: repository, work branch, base, remote,
task-branch pattern (default `<work-branch>/<source-anchor-id>`) and task
scope. Read `checksum.branch` (the work branch) from the source anchor itself;
the host stamps it on every member, so do not search for a parent workflow
root. Missing task-branch authority or missing `checksum.branch` blocks:
GasCity may only create the workspace the Authority already names.

**Start point.** The task branch starts from the work branch tip, plus the
tips of every task branch this member `blocks`-depends on inside the convoy:
for each such prerequisite `P` (all are closed `gc.outcome=pass`, or the drain
would not have released this member) read `branch` from `P`'s source anchor;
the start point is the first prerequisite tip when there is exactly one, and
when there are several, a fresh start from the work-branch tip followed by
`git merge --ff-only` of each prerequisite in dependency order, failing closed
if any is not a fast-forward (stacked prerequisites that diverged are task work
for `integrate` to surface, not for this step to merge). Record the start point
SHA. Stacking is what lets a dependent task see its prerequisites' code before
`integrate` lands them on the work branch; `integrate` later drops the
already-landed commits during rebase.

Idempotently, from the launcher rig root:

1. `git fetch --prune <remote>`.
2. If the source anchor already has `work_dir` and `branch`, reuse them when
   the path is a worktree of this repository checked out on that branch; a
   prior blocked note means resume, not redo. Otherwise fall through.
3. `TASK_BRANCH=<pattern applied to source-anchor-id>`;
   `WT=<rig root>/worktrees/<source-anchor-id>`. If a local `TASK_BRANCH`
   exists (or `<remote>/TASK_BRANCH`, fast-forward only; stop on divergence),
   add the worktree on it. Else `git worktree add "$WT" -b "$TASK_BRANCH"
   <start point>`. If `WT` exists but is not this repository's worktree on
   `TASK_BRANCH`, fail closed. Never `--detach`, reset, delete or force.
4. Write `<rig root>/.beads` into `$WT/.beads/redirect` and add
   `.beads/redirect` to `$(git -C "$WT" rev-parse --git-path info/exclude)`.
5. `bd update <source-anchor-id> --set-metadata work_dir="$WT" --set-metadata
   branch="$TASK_BRANCH" --set-metadata checksum.start_point=<sha>`. Never
   persist these on a synthetic drain-unit convoy. Read the anchor back and
   verify the keys before closing.

Retain the source anchor/workspace/branch mapping in the portable Handoff and
close only this claimed step with `gc.outcome=pass`. On failure, retain the
blocking reason and set `gc.outcome=fail` and
`gc.failure_class=checksum_workspace` before closing this claimed step.
