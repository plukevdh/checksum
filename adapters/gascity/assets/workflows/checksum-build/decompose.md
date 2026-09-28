# Decompose the validated checksum plan into native Beads tasks

Apply `checksum-host.binding` preflight, then load `checksum.checksum-plan` and
the shared `references/backends/beads.md` mapping. Implementation needs a
`Validated(policy)` design and plan on the portable root at the current
revision; otherwise block.

Perform the upstream `build-base` `decompose` contract unchanged: create or
reuse only the plan's task beads (child of the portable root, native `blocks`
dependencies, `checksum.deliver` metadata, acceptance and scope from the plan),
create a NEW implementation convoy containing exactly those runnable task beads
(never the launch/source convoy), and record
`gc.input_convoy_id` and `gc.build.implementation_convoy_id` on the workflow
root in one quoted `bd update`. Retain the exact completion-set IDs in the
portable root.

## Workspace assignment

`drain_policy={{drain_policy}}`.

Stamp `checksum.branch` and `checksum.base` from the workflow root onto every
task bead under both policies; per-task lanes read them from their own source
anchor. Then:

- `same-session`: every task runs in the shared work-branch workspace that
  `prepare` provisioned and commits on the work branch. Stamp
  `work_dir=<checksum.work_dir>` and `branch=<checksum.branch>` on each task
  bead (the keys the inherited item lane reads). Do not create additional
  worktrees.
- `separate`: leave `work_dir`/`branch` unset; `checksum-work.prepare-worktree`
  provisions a per-task workspace and branch under the same Authority.

Write the `gc.build.decomposition.v1` projection at the resolved decomposition
path, naming the portable root ID, each task ID and its dependencies, and the
plan revision; record the path as `gc.build.decomposition_path`. Validate with
`GC_BEAD_ID=<claimed-step-id> .gc/scripts/checks/build-artifact-valid.sh` from
the launcher rig root and repair in place within the inherited three attempts.
Set claimed-step `gc.outcome=pass` after the convoy, task metadata and
projection are recorded, then close only this step.
