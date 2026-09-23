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

GasCity owns the workspace; this step is where it is provisioned. Follow the
**work-branch workspace procedure** in `checksum-host.binding` exactly: named
work branch from the Authority's base and remote, `<rig root>/worktrees/
<workflow-root-id>`, `.beads/redirect`, and `checksum.work_dir` /
`checksum.branch` / `checksum.base` / `checksum.remote` recorded on the
workflow root and in the portable Handoff. Never `--detach`, reset or force.
The launcher checkout (`gc.work_dir`) is never an implementation workspace.

For `same-session` drain this single workspace is shared by every task;
`decompose` stamps it on each task bead. For `separate` drain per-task
workspaces are provisioned later by `checksum-work.prepare-worktree` and
integrated back by `integrate`.

Set claimed-step `gc.outcome=pass` only after the inherited keys and the
workspace metadata are recorded, then close only this step.
