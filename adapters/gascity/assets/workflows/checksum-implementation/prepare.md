# Validate the implementation convoy and provision the work-branch workspace

Apply `checksum-host.binding` preflight first: resolve the portable checksum
root named in the launch context and validate its Authority (repository, work
branch, base, remote, scope, action allowlist). The completion set must already
be `Validated(policy)` at the current design/plan revision; this entrypoint
never designs or plans.

## Inherited implement prepare contract

Perform the upstream `implement` `prepare` validation unchanged (read its body
with `gc formula show implement --json` if needed): identify the claimed step
from `CLAIMED_BEAD_ID`/`$GC_BEAD_ID`, read the workflow root's
`gc.input_convoy_id`, verify it equals runtime `{{convoy_id}}` and is a convoy
or normalized singleton convoy, reject legacy `issue`/`bead_id`/user
`convoy_id` inputs, validate `context_path` `{{context_path}}` when set, reject
`drain_policy` values other than `separate`/`same-session`, record `push`
`{{push}}` and `open_pr` `{{open_pr}}`, and write a run-status artifact when
`summary_path` `{{summary_path}}` or an artifact root is provided. Every convoy
member must be a task of the resolved portable root; foreign members block. The
upstream "convoy target branch, defaulting to the repo default branch" is
replaced: the target is the Authority's work branch, and a convoy or member
`metadata.target` that names anything else blocks.

## Workspace provisioning (host-owned)

The upstream body forbids creating worktrees because vanilla `do-work`
provisions detached ones per item. Checksum instead provisions the Authority's
work branch here, so the only deviation from the inherited contract is this
section. Follow the **work-branch workspace procedure** in
`checksum-host.binding` exactly, recording `checksum.work_dir`,
`checksum.branch`, `checksum.base` and `checksum.remote` on the workflow root
and in the portable Handoff. Stamp `checksum.branch` and `checksum.base` on
every convoy member. Under `same-session`, also stamp `work_dir=<that path>`
and `branch=<work branch>` on every member so the inherited item lane finds
them and commits on the work branch. Under `separate`, leave member
`work_dir`/`branch` unset; `checksum-work.prepare-worktree` creates per-task
branch worktrees and `integrate` brings them back.

No other side effects: no task creation, source edits, commits, refs beyond the
work branch, or publish records. Set claimed-step `gc.outcome=pass` after the
validation and workspace metadata are recorded, then close only this step.
