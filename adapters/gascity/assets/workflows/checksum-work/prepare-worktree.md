# Provision the per-task checksum workspace

Apply `checksum-host.binding` preflight first. Read the claimed step's
`gc.root_bead_id`, then that formula root's `gc.input_convoy_id`. Verify the
latter matches runtime `{{convoy_id}}`. Read the input convoy; if
`gc.synthetic_kind=drain-unit-convoy`, use its `gc.drain_member_id` as source
anchor, never the synthetic convoy itself. Otherwise use the input convoy ID.
If the formula root also has `gc.drain_member_id`, both values must agree.
Unwrap a one-element list returned by `bd show --json`.

This is the inherited `do-work` provisioning lane with two changes: the
workspace is created from the Authority's work branch on a named task branch
instead of `--detach HEAD`, and the branch is recorded alongside `work_dir`.
This is infrastructure only; do not edit source in the launcher checkout
(`gc.work_dir`), which is never an implementation workspace.

Read the portable root Authority: repository, work branch `WORK_BRANCH`, base,
remote, task-branch pattern (default `WORK_BRANCH/<source-anchor-id>`) and
task scope. Missing task-branch authority blocks: GasCity may only create the
workspace the Authority already names. The task branch is based on the work
branch (`checksum.branch` on the workflow root), never on the default branch.

Idempotently, from the launcher rig root:

1. `git fetch --prune <remote>`.
2. If the source anchor already has `work_dir` and `branch`, reuse them when
   the path is a worktree of this repository checked out on that branch; a
   prior blocked note means resume, not redo. Otherwise fall through.
3. `TASK_BRANCH=<pattern applied to source-anchor-id>`;
   `WT=<rig root>/worktrees/<source-anchor-id>`. If `<remote>/TASK_BRANCH` or a
   local `TASK_BRANCH` exists, add the worktree on it (fast-forward only; stop
   on divergence). Else `git worktree add "$WT" -b "$TASK_BRANCH" WORK_BRANCH`
   from the provisioned work branch's current tip. If `WT` exists but is not
   this repository's worktree on `TASK_BRANCH`, fail closed. Never `--detach`,
   reset, delete or force.
4. Write `<rig root>/.beads` into `$WT/.beads/redirect`.
5. `bd update <source-anchor-id> --set-metadata work_dir="$WT" --set-metadata
   branch="$TASK_BRANCH"`. Never persist these on a synthetic drain-unit convoy.
   Read the anchor back and verify both keys before closing.

Retain the source anchor/workspace/branch mapping in the portable Handoff and
close only this claimed step with `gc.outcome=pass`. On failure, retain the
blocking reason and set `gc.outcome=fail` and
`gc.failure_class=checksum_workspace` before closing this claimed step.
