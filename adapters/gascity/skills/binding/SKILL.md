---
name: binding
description: Mandatory host binding for every checksum GasCity stage; authority, Beads projections, and host-owned execution.
---

# Checksum / GasCity binding

This is host translation, not a second methodology. Load `checksum.checksum`
and its `references/workflow-contract.md`, `references/authorization.md`,
and `references/backends/beads.md`. Load other shared `checksum.checksum-*`
skills by phase. If shared references cannot be resolved, block, never substitute
vanilla GasCity methodology. Relative shared-skill references resolve within
the imported root skill pack, not this adapter directory.

Effective explicit selections are **work-backend=beads**,
**execution-host=gascity**, **approval-policy=pr-gated**. Record their launch/
adapter provenance in Effective preferences; do not silently override conflicting
recorded selections. Only these selections are supported by this adapter.
The portable contract is `checksum.workflow/v1`.

## Preflight on every claim, mandatory before prepare can dispatch

The upstream `gc-role-worker` template owns claim discovery. After claiming,
read only the explicit claimed step, its `gc.root_bead_id`, and the source
convoy/anchor IDs named by their metadata. Resolve the existing portable
checksum root by its explicit ID in the launch context or source task Handoff.
Nested formula roots are host coordination records, not new checksum roots.
If mapping is ambiguous or absent, record Blocked; do not search global work,
infer the root by title, or initialize a store.

Before ANY dispatch, task creation, workspace operation, source edit, test,
commit, or external effect:

1. Read the same portable root's Scope, Repository, Effective preferences,
   Authority, Plan, Completion set IDs, Handoff, and design field. Check
   `checksum.contract`, `checksum.repository`, `checksum.base`, `checksum.branch`,
   `checksum.method_revision`, `checksum.work_backend`, `checksum.execution_host`,
   `checksum.approval_policy`, `checksum.design_state`, `checksum.plan_state`,
   `checksum.session`, and backend/host/policy metadata against that record.
   Missing initial root structure or scope requires explicit launch correction;
   the adapter does not grant itself authority to bootstrap a vague request.
2. Validate repository identity, allowed file/task scope, named work branch,
   base, permitted remote and action allowlist, exception procedure and launch
   authorization provenance. Check current host workspace assignment. No
   default-branch edits/commits, merge, deploy, force-push, unrelated external
   actions, or retained-record cleanup. Unknown/conflicting inputs fail closed.
3. Validate current stage preconditions in the shared contract, exact completion
   set, native dependency/status/claim state, and upstream design/plan revision.
   Implementation needs policy-validated design/plan, not just artifact existence.
   All configurable methodology selectors must remain `checksum-*`, and
   `implementation_target` must be `checksum-host.implementer`; unsupported
   overrides block before draining. `interaction_mode` must be autonomous or
   headless; `review_mode` report or agent, never interactive.
4. Verify configured review routing and actual provenance are available. Record
   author/implementer model identity and configuration source. The reviewer must
   report its actual model identity and differ from the subject's author/
   implementer. Unknown identity, same model, or a fallback provider that erases
   separation blocks the required review. Different role names are not proof.
5. Retain the selected preferences, authority and preflight result in the
   portable root Handoff; project host paths and metadata only after this passes.

On failure, append the specific Blocked reason/next input to the portable root
when that root is unambiguously known. Always record `gc.outcome=fail`,
`gc.failure_class=checksum_preflight` and a concise reason on the claimed step;
then close only that step. Never close a blocking dependency as successful.
No routine human design/plan approval wait: valid scope proceeds autonomously;
authority exceptions/unknown decisions block instead of fabricating consent.

## Phase translation

| Host stage | Shared methodology and portable output |
| --- | --- |
| prepare / prepare-planning / validate-context | Router, authorization, Beads preflight above; retain existing root identity and resume context. |
| requirements | `checksum.checksum-design`; requirements, alternatives, chosen design and evidence in root design field. |
| plan | `checksum.checksum-plan`; full executable Plan in the portable root. Do not create a second Markdown task/status store. |
| plan-review | Shared plan review; record findings/model/revision, design/plan `Validated(policy)` only after required checks. |
| decompose | Shared plan and native Beads mapping; reuse or create only authorized task beads and dependencies, retain exact completion set IDs; stamp the shared `work_dir` under `same-session`. |
| implement / implement-item / apply-findings | `checksum.checksum-execute`; assigned task or review findings only, tests and verification evidence in that task's notes. |
| unexpected failure / uncertain cause | `checksum.checksum-debug`; retained diagnosis before fixes, bounded attempts, honest blocker on exhaustion. |
| review / write-report / independent-review | Shared execute/finish review contract; report-only, cross-model and exact-revision evidence. No reviewer fixes. |
| integrate | Host integration: rebase + fast-forward closed task branches into the work branch in dependency order, integrated verification, `checksum.integrated_revision`. No conflict resolution, no push. |
| summarize / summarize-implementation / finalize | Aggregate retained task/evidence records; cite `checksum.integrated_revision` and members' `checksum.integrated` SHAs, not pre-rebase item-summary SHAs. No source changes or delivery. |
| publish | `checksum.checksum-finish` checks and explicit branch/PR delivery only, as narrowed by launch flags. |

The inherited finalize stage writes a host result projection, NOT portable root
Complete. Keep the root Active until integrated verification, independent review
and all required delivery succeed in publish. Task finish may close only its
source task. Failed push/PR leaves root Active with delivery failure evidence.
A prepublication `pr-ready` candidate is not delivered; a successfully opened,
reviewed PR records `checksum.delivery_status=delivered` and
`checksum.merge_state=unmerged` (human-facing “PR ready”), never merged.

Inherited GasCity prompts use “approved” generically. A schema-required artifact
`status: approved` is only a projection of `Validated(policy)`, NEVER evidence of
`Approved(human)`. Explain that mapping in the projection; preserve the portable
state's actual validation provenance. Missing required review blocks even when
the inherited stage body says it may close with unresolved findings.

## Host scheduling and workspaces

GasCity alone assigns work, owns workspace lifecycle, drains convoys and routes
review/fix lanes. Do not call provider-native subagents, discover global ready
work, or run a nested scheduler. Only these host steps touch workspaces or
branches, and only as the Authority names them (named branch, recorded base and
remote, no detached HEAD, no reset/force/delete, no push):
`checksum-build.prepare` / `checksum-implementation.prepare` (work branch),
`checksum-work.prepare-worktree` (per-task branches), `integrate` (rebase +
fast-forward of closed task branches into the work branch). Every other step
validates the source anchor's authoritative `work_dir` and `branch` before
source reads, tests or edits and never switches or repairs worktrees.
`gc.work_dir` is the launcher root, not permission to edit there.

Commits: every task and the review fix lane make scoped commits on the branch
their workspace is checked out on, the task branch under `separate` or the work
branch under `same-session`. A commit is the lane's handoff artifact and what
later lanes review by SHA. Uncommitted work at the end of a lane is a failure of
that lane. Nothing but `publish` pushes; nothing ever writes the default branch.

### Work-branch workspace procedure

Used by `checksum-build.prepare` and `checksum-implementation.prepare`. From
the launcher rig root, with `WORK_BRANCH`, `BASE` and `REMOTE` taken from the
portable root Authority (creating exactly that branch is executing recorded
authority; any other name, base or remote blocks):

1. `git fetch --prune "$REMOTE"`.
2. `WT=<rig root>/worktrees/<workflow-root-id>`. Idempotently: if
   `$REMOTE/$WORK_BRANCH` exists, add the worktree tracking it (or check out the
   existing local branch and `git merge --ff-only`; stop on divergence); else if
   the local branch exists, `git worktree add "$WT" "$WORK_BRANCH"`; else
   `git worktree add "$WT" -b "$WORK_BRANCH" "$REMOTE/$BASE"`. If `$WT` exists
   and is not this repository's worktree on `WORK_BRANCH`, fail closed. Never
   `--detach`, reset, force or delete.
3. Write `<rig root>/.beads` into `$WT/.beads/redirect`, and add
   `.beads/redirect` to `$(git -C "$WT" rev-parse --git-path info/exclude)` so
   it is never committed and never dirties a clean-tree check. Do the same in
   every per-task worktree.
4. Record on the workflow root `checksum.work_dir=$WT`,
   `checksum.branch=$WORK_BRANCH`, `checksum.base=$BASE`,
   `checksum.remote=$REMOTE`; retain the same in the portable root Handoff.
   Stamp `checksum.branch` and `checksum.base` on every convoy member as soon
   as the members exist (`decompose` in the build; `prepare` in the direct
   entrypoint) so per-task lanes, whose own formula root is a `do-work` child,
   never have to locate the parent workflow root.

Under `same-session` every task runs in `$WT` and commits on `WORK_BRANCH`
(`decompose`/`prepare` stamp `$WT` as each task's `work_dir`). Under `separate`,
`checksum-work.prepare-worktree` creates each task's branch worktree, and
`integrate` rebases and fast-forwards closed task branches back in dependency
order before integrated verification and review. Conflicts block; they are task
work, never resolved by the host. Clean-tree checks ignore excluded paths.

Review repair uses the GasCity expansion + check loop (`checksum-review-loop`):
an independent report-only review lane and a scoped fix lane repeat until the
reviewer approves an unchanged revision or the bounded attempts are exhausted.
The `review_fix_formula` selector is not dispatched by this adapter.

Workers report only their task completion, never global readiness. Host drains
own latches and source-anchor close semantics. Preserve inherited sink/dependency
ordering. No task closes the portable root or the parent convoy. Follow-up work
outside the completion set is recorded separately, not silently included.

## Artifact bridge: projections, not coordination truth

Keep all inherited `gc.build.*` / `gc.implementation.*` paths, artifact-schema
metadata and sink outcomes. GasCity needs Markdown artifacts with YAML
frontmatter conforming to its pinned schemas. Those are disposable projections
of the SAME portable Beads root/task records, not authoritative design or status.
Persist complete decisions, acceptance, diagnosis, verification commands/results,
review findings and their dispositions, actual model/configuration provenance,
delivery result, and next action in Beads BEFORE closing the producing stage.
A path and hash alone are insufficient for standalone resume without files.

Every projection identifies portable root ID, relevant task IDs, method revision
and reviewed code/plan revision in its body. Include versioned/hash-qualified
trace inputs and requirement coverage. Use schema mapping objects `workflow`,
`methodology`, `producer`, `trace`, required body headings and coverage tables.
`trace.upstream` uses `path`/`hash`; `trace.coverage` uses `id`/`status`, and its
table must agree. `approved` is not the coverage status `covered`.

Before closing, record the absolute artifact path on the formula root keys
specified by the inherited step's `gc.build.artifact_path_keys`. Copy only
host-specific pointers there; portable decisions remain on the original root.
Use the inherited `.gc/scripts/checks/build-artifact-valid.sh` gate. Preserve its
three-attempt bound; on retry inspect `gc.attempt_log`, repair the projection and
retain substantive changes back to Beads. Exhaustion blocks; never bypass checks
or advance after stale review. The upstream validator requires Python/PyYAML;
checksum adds no Python implementation or standalone dependency.

Native Beads statuses, dependencies and claims remain authoritative. Do not make
a shadow Markdown work log. `bd --readonly` constrains Beads commands only, not
filesystem isolation; configure provider/workspace isolation independently for
reviewers, and permit only scoped report/Beads result writes.

Retain the portable root, task records and evidence after delivery, including
PR feedback and the distinction between implementation complete, delivered and
merged. Standalone checksum can resume from these records without GasCity
artifact files or the original conversation.
