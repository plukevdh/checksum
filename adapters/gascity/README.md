# Checksum on GasCity

**Evaluation stage.** Compilation, configuration and graph-invariant checks
pass, and the composition gaps found by the earlier end-to-end review are now
routed through GasCity's own mechanisms:

- **Workspaces** are provisioned by the host's provisioning steps.
  `checksum-build.prepare` creates the Authority-named work branch worktree
  (shared by every task under `drain_policy=same-session`);
  `checksum-work.prepare-worktree` creates per-task branch worktrees under
  `separate`. Both follow the inherited `do-work` lane but replace
  `--detach HEAD` with named branches from the recorded base.
- **Review repair** uses the GasCity expansion + bounded check loop (the same
  mechanism as upstream `build-basic-review`): `checksum-review-loop` runs an
  independent cross-model review lane and a scoped fix lane until the reviewer
  approves an unchanged revision, bounded by `max_attempts`.
- **Commits** are every lane's handoff artifact: tasks commit on the branch
  their workspace is on (task branch under `separate`, work branch under
  `same-session`), and the review fix lane commits on the work branch, so review
  and integration operate on SHAs. Only `publish` pushes.
- **Integration** is a host step (`integrate`) between the drain and the
  summary in both publishing entrypoints: it rebases each closed task branch
  onto the work branch in convoy dependency order, fast-forwards, runs the plan's
  integrated verification, and records `checksum.integrated_revision`. Conflicts
  and verification failures block with evidence and a documented resume path;
  the host never resolves conflicts or pushes. Under `same-session` it only
  verifies. Dependent tasks under `separate` start stacked on their
  prerequisites' branches so they see that code before it lands.

Both drain policies are now complete graphs. Start with `same-session` (one
worktree, simplest to observe), then `separate` for parallel task worktrees.
No live run has been performed; a first launch must use a disposable rig.
Standalone checksum and its Beads backend do not depend on this adapter.

This is an **evaluation-stage GasCity adapter**, not a fork of checksum's
methodology. The root [skill pack](../../pack.toml) exposes the existing six
[shared skills](../../skills/checksum/SKILL.md). This pack imports them as
`checksum.checksum`, `checksum.checksum-design`, and so on, and provides four
host roles plus [one binding skill](skills/binding/SKILL.md).

The explicit policy is **Beads / GasCity / PR-gated**. There are no routine
human design/plan approval gates. Scope and authority must already be recorded;
unknown authority or required decisions block instead of guessing. PR-gated
allows only explicitly authorized scoped branch commits, pushes and PR
creation/updates. It never authorizes merging, default-branch changes, deploys,
force-pushes or unrelated effects.

## Supported surface

| Formula | Extends | Purpose |
| --- | --- | --- |
| `checksum-build` | `build-base` | Full prepare → requirements → plan → plan-review → decompose → implementation → integrate → summary → review loop → finalize → publish graph |
| `checksum-planning` | `planning-base` | Design and plan projection with policy review |
| `checksum-decomposition` | `decomposition-base` | Native Beads task/convoy decomposition |
| `checksum-implementation` | `implement` | Existing validated completion set: prepare (work branch) → drain → integrate → summary → publish; finish blocks delivery without aggregate review |
| `checksum-work` | `do-work` | Separate-drain task in a preassigned host workspace |
| `checksum-work-item` | `do-work-item` | Single-lane shared-drain task |
| `checksum-review` | `code-review-base` | Independent report-only review (selector for upstream wrappers) |
| `checksum-review-loop` | expansion | Independent review → scoped fixes, repeated under `implementation-review-approved.sh` (max 4 attempts), then a `gc.build.review.v1` projection |

All retain `graph.v2`. Both drain policies compile. GasCity owns assignments,
convoys, dependencies, bounded artifact repair, workspaces and review routing.
Workers cannot discover/claim globally ready work or start a nested scheduler.
`review_fix_formula` keeps the upstream default `fix-loop-base` for wrapper
compatibility; this adapter never dispatches it, the expansion is the repair route.

**Not supported:** upstream `build-from-*` or GitHub entrypoint wrappers as
end-to-end checksum workflows. Their outer side-effect/publishing lanes are
not bound by selecting a checksum methodology variable. The reusable selectors
are available for future composition, but selector compatibility is not whole
workflow authorization. Do not launch an upstream wrapper and assume this pack
guards its comments, pushes, merges, or other external actions. Arbitrary
`implementation_target` and non-checksum selector overrides fail preflight.
Interactive GasCity lanes and a files-backed GasCity mode are also unsupported.
Standalone files and standalone Beads remain independent of this adapter.

Review findings are repaired inside the `checksum-review-loop` expansion:
the fix lane closes `iterate` after any source change so the next iteration
re-reviews the new revision, and `done` requires an approval of the revision
that is still HEAD. Exhausting the loop closes the stage failed with the open
findings retained in the portable root. The inherited artifact validator has
three bounded attempts; an artifact-schema pass alone is not semantic review or
evidence of completion.

## Before a real launch

1. Use a disposable evaluation rig first. Initialize/configure its Beads store
   yourself; this adapter never initializes or migrates stores.
2. Create/select the portable root following the shared
   [Beads mapping](../../skills/checksum/references/backends/beads.md).
   Record its explicit ID in the launch context and every task's Handoff.
   Preserve Scope, Repository, Effective preferences, Authority, Plan,
   Completion set IDs, Handoff, and the root design field. Nested GasCity formula
   roots are not new portable checksum roots.
3. Record explicit launch authority: repository, file/task scope, named work
   branch, base, allowed remote, action allowlist, authorized task branches,
   exception procedure and provenance. Select
   `work-backend=beads`, `execution-host=gascity`, `approval-policy=pr-gated`.
   Preference keys have hyphens; stored Beads metadata uses underscores, e.g.
   `checksum.work_backend`, `checksum.approval_policy`, `checksum.plan_state`.
4. Let the host provision workspaces. `prepare` creates
   `<rig>/worktrees/<workflow-root-id>` on the Authority's work branch from the
   recorded base and records `checksum.work_dir`/`checksum.branch` on the
   workflow root; under `same-session`, `decompose` stamps that `work_dir` on
   every task bead. Under `separate`, `checksum-work.prepare-worktree` creates
   `<rig>/worktrees/<task-id>` on the Authority's task-branch pattern (default
   `<work-branch>/<task-id>`) and records `work_dir`/`branch` on the task. The
   Authority must name the branch pattern and base; otherwise provisioning
   blocks. `integrate` brings task branches back into the work branch; a rebase
   conflict blocks the build with `checksum_integration_conflict` and the
   conflicting member IDs, and is resolved as task work, not by the host. The
   launcher `gc.work_dir` is never an implementation workspace.
5. Configure different author/implementer and reviewer models and record their
   actual identities and configuration provenance. Provider aliases below are
   examples of routing, not proof of actual model separation. Unknown or same
   actual model blocks required review.
6. Keep `push=false` and `open_pr=false` until the recorded authority explicitly
   grants the corresponding delivery actions. True flags cannot expand authority.
   Only the finisher can deliver after checks. The earlier finalize stage never
   marks the portable root Complete. Failed delivery leaves it Active.

Do not erase portable records after delivery. GasCity artifact files are
disposable schema-compliant projections carrying root/task IDs and revisions.
The same Beads root/task records retain complete decisions, tests/results,
diagnosis, review/dispositions, provenance, delivery and next action so standalone
checksum can resume without those files or the original conversation.
`Validated(policy)` is not `Approved(human)`; an upstream artifact's
`status: approved` is only a compatibility projection of policy validation.

## Import and routing configuration

Keep the **whole checksum checkout** when distributing it: `source = "../.."`
is relative to `adapters/gascity/pack.toml`. Copying only the adapter folder
cannot resolve the shared skills. A remote pack install must preserve that
repository layout; remote-fetch distribution itself has not been exercised.

Example for a separately managed evaluation city's `city.toml`:

```toml
[workspace]
name = "checksum-evaluation"
provider = "author"

[providers.author]
base = "builtin:claude"
[providers.review]
base = "builtin:codex"

[[rigs]]
name = "evaluation-repo"

[rigs.imports.checksum-host]
source = "/absolute/path/to/checksum/adapters/gascity"

[[rigs.patches]]
agent = "operator"
provider = "author"
[[rigs.patches]]
agent = "implementer"
provider = "author"
[[rigs.patches]]
agent = "reviewer"
provider = "review"
[[rigs.patches]]
agent = "finisher"
provider = "author"
```

Use the exact `checksum-host` import alias: formula routing names it explicitly.
Register the rig's local path in that evaluation city's `.gc/site.toml`:

```toml
workspace_name = "checksum-evaluation"
[[rig]]
name = "evaluation-repo"
path = "/absolute/path/to/evaluation-repo"
```

In installed **gc 1.4.1**, patches for these directly imported role definitions
resolve **bare names** (`reviewer`, `implementer`). The qualified
`checksum-host.reviewer` patch was rejected as “agent not found in pack”, even
though runtime routes use `checksum-host.reviewer`. The evaluator checks the
resulting `config show --json` providers. Do not assume upstream `gc.*` patch
examples automatically apply to this pack's local definitions.

Configure provider permissions/sandbox separately. `bd --readonly` prevents
Beads mutations, not filesystem writes. Reviewers need narrowly scoped report/
result writes without source editing or publication authority. Skill discovery
does not prove provider skill materialization or runtime enforcement.

## Safe, repeatable local evaluation

Assumptions: **gc 1.4.1**, **bd 1.2.2**, Node.js for these optional checks, and
the cached `gascity-packs` checkout at
`3b3b89f2011e06d84459aa7bea1552382f13930a`. The adapter's production manifest pins
that upstream commit. Its artifact validator/claim template uses upstream Python
and PyYAML; checksum adds no Python code and standalone use needs neither.

Run from the checksum repository:

```sh
node --test tests/gascity.test.mjs

# Point to the existing LOCAL checkout's gascity subdirectory; no fetch occurs.
export CHECKSUM_GASCITY_SOURCE=/absolute/path/to/cached/gascity-packs/gascity
CHECKSUM_GASCITY_SOURCE="$CHECKSUM_GASCITY_SOURCE" \
  node --test tests/gascity.test.mjs

# Or run the installed-CLI evaluation directly:
node adapters/gascity/checks/evaluate.mjs "$CHECKSUM_GASCITY_SOURCE"
```

The evaluator checks the upstream Git revision, relocates the whole skill/adapter
layout into a fresh scratch directory, and changes **only the scratch manifest**
to use the local upstream dependency. It prints the evidence directory and
retains compiled recipes there for inspection. It does not fetch dependencies,
call a model, initialize/write Beads, start a controller, cook/sling work, push,
or call GitHub. No live city configuration is read or changed.

Equivalent read-only inspection commands for the generated scratch fixture:

```sh
gc --city "$EVIDENCE/city" lint "$EVIDENCE/relocated-checksum/adapters/gascity" --json
gc --city "$EVIDENCE/city" config show --validate
gc --city "$EVIDENCE/city" --rig fixture formula list --json
gc --city "$EVIDENCE/city" --rig fixture formula show checksum-build --json \
  --var drain_policy=separate
gc --city "$EVIDENCE/city" --rig fixture formula show checksum-build --json \
  --var drain_policy=same-session
gc --city "$EVIDENCE/city" --rig fixture skill list --agent operator --json
```

Set `EVIDENCE` to the evaluator's printed directory. Scratch config may warn
that builtin `core`/`bd` packs are absent: they are deliberately not needed for
read-only compilation. Do not run `gc doctor --fix`, `gc formula cook`, or
`gc sling --dry-run` against a live store for this evaluation.

## Compatibility evidence and limits

- Root shared skills resolve inside the relocated repository through `../..`;
  all six skill bodies match the original distribution.
- Adapter pack lint and scratch configuration validation check prompt-template
  composition and declared role routes. Provider patches are inspected, not
  assumed to create cross-model independence.
- Seven contracts compile in both drain selections (14 adapter recipes plus
  upstream comparisons). The evaluator compares exact dependency/sink graphs,
  producer/check step IDs, schema/path metadata, bounded-check metadata, shared
  prompt assets and host-bound routes. For `checksum-build` the review
  expansion's control shape (spec/iteration/scope/ralph beads and check scripts)
  is compared against upstream `build-basic`'s own `build-basic-review`
  expansion, its two lanes and their roles are asserted, and the review sink
  keeps the `gc.build.review.v1` artifact gate. The inserted `integrate` node is
  spliced out before graph comparison so any other edge drift still fails.
  Publish defaults remain false.
- `extends` **replaces whole step blocks** in gc 1.4.1; it does not merge
  individual step fields. Consequently each changed role route retains its
  complete stable step envelope (`needs`, schema/path metadata, `check`, etc.).
  Unchanged bodies are resolved from the imported upstream assets, not copied.
  The pin and comparison checks protect this necessary repetition against drift.
- Large prompts compile to external asset references and formula-variable hints.
  The evaluator compares the referenced prompt contract separately from selected
  methodology defaults.
- `gc lint` on the repository root recursively sees nested adapter templates
  without the adapter's import context; lint the adapter path above. The root
  pack and imported skills are also loaded by scratch config/skill validation.

Not exercised by these checks: actual provider sessions/skill materialization,
runtime model identity, controller scheduling, Beads stage transitions, artifact
production/repair against a store, semantic review/fix behavior, workspace
integration, or Git/PR delivery. The safety rules are agent workflow contracts,
not a machine-enforced capability sandbox. A disposable end-to-end run under
explicit scoped authority is still required before operational adoption.
