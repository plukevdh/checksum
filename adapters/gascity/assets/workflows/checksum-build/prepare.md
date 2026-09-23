# Prepare the checksum build and its work-branch workspace

Apply `checksum-host.binding` preflight first: resolve the portable checksum
root named in the launch context, and validate its Authority (repository, work
branch, base, remote, scope, action allowlist) before anything below.

## Inherited build-base prepare contract

Perform the upstream `build-base` `prepare` contract unchanged (read its body
with `gc formula show build-base --json` if needed): validate `interaction_mode`
(`autonomous`|`headless` only here), `review_mode` (`report`|`agent`), and
`drain_policy`; persist every launch input as `gc.var.<name>` on the workflow
root; derive and record `gc.build.requirements_path`, `gc.build.plan_path`,
`gc.build.decomposition_path`, `gc.build.implementation_summary_path`,
`gc.build.review_report_path` and `gc.build.final_report_path` under the
artifact root using the canonical filenames. Unsupported values stop the
workflow with `gc.build.status=blocked`, `gc.blocked_reason`, `gc.outcome=fail`
and `gc.failure_class=methodology_incompatible`.

## Workspace provisioning (host-owned)

GasCity owns the workspace; this step is where it is provisioned. The launcher
checkout (`gc.work_dir`) is never an implementation workspace.

1. From the launcher rig root, `git fetch --prune <authorized remote>`.
2. Let `WORK_BRANCH` and `BASE` be the Authority's named work branch and base.
   Creating exactly that branch from `<remote>/<BASE>` is executing recorded
   authority, not inventing it. Any other branch name, base or remote blocks.
3. Worktree path: `<rig root>/worktrees/<workflow-root-id>`. Idempotently:
   - if `<remote>/WORK_BRANCH` exists, add the worktree tracking it
     (`git worktree add <path> --track -b WORK_BRANCH <remote>/WORK_BRANCH`,
     or check out the existing local branch and `git merge --ff-only`; stop on
     divergence);
   - else if the local branch exists, `git worktree add <path> WORK_BRANCH`;
   - else `git worktree add <path> -b WORK_BRANCH <remote>/BASE`.
   If the path already exists and is not a worktree of this repository on
   WORK_BRANCH, fail closed. Never use `--detach`, never reset or force.
4. Write `<rig root>/.beads` as the target of `<path>/.beads/redirect` so `bd`
   resolves the rig store from inside the worktree.
5. Record on the workflow root: `checksum.work_dir=<absolute path>`,
   `checksum.branch=WORK_BRANCH`, `checksum.base=BASE`,
   `checksum.remote=<remote>`; retain the same in the portable root Handoff.

For `same-session` drain this single workspace is shared by every task;
`decompose` stamps it on each task bead. For `separate` drain per-task
workspaces are provisioned later by `checksum-work.prepare-worktree`.

Set claimed-step `gc.outcome=pass` only after the inherited keys and the
workspace metadata are recorded, then close only this step.
