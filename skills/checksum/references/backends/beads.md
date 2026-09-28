# Beads backend

Use when `work-backend: beads`. Read the
[workflow contract](../workflow-contract.md) and
[authorization](../authorization.md) first. Beads stores the same methodology;
it neither requires GasCity nor grants delivery authority. Defaults remain
`execution-host: standalone` and `approval-policy: interactive`.

## Durable mapping

One persistent root **epic** is the run. Its child **task** beads are the
implementation units. Native status, assignee, parent, and dependency edges are
the **only coordination truth**. Do not create parallel task Markdown or
`checksum.status`, `checksum.assignee`, or `checksum.depends` metadata.
Temporary file inputs/exports are projections, never an alternate editable store.

| Bead field | Contents |
|---|---|
| Root `description` | `## Scope`, `## Repository`, `## Effective preferences`, `## Authority`, `## Plan`, `## Completion set`, `## Handoff` |
| Root `design` | Complete design-template content: goal, success criteria, scope, current state, constraints, alternatives, design/interfaces/edge cases, verification strategy, assumptions |
| Root `acceptance` | Plan completion condition and full verification Run/Expect commands, tracing design success criteria |
| Root `notes` | Append-only, explicitly headed Diagnosis, Authorization, Verification, Review, Blockers, Delivery records |
| Child `description` | Task-template definition: outcome, root ID, files, interfaces, failure behavior, steps; diagnosis/containment where applicable |
| Child `acceptance` | Exact task Run/Expect checks written before implementation |
| Child `notes` | Explicit Result, Diagnosis, Verification, Review, Authorization, Blockers, Delivery records |
| Native `status` | `open` = pending, `in_progress` = claimed, `blocked` = blocked, `closed` = implementation done with evidence |
| Native `assignee` | Current owner; session metadata is an audit link, not a second owner |
| Native parent/dependencies | Root membership and actual prerequisite edges; prose lists are navigation only |

Root description sections must be sufficient for a fresh standalone agent:

- **Scope:** goal, in/out scope, constraints and relevant repository paths.
- **Repository:** canonical repository identity, local checkout expectation,
  base ref and resolved commit, permitted branch/workspace, remote destination
  if delivery is authorized, and verified Beads context identity.
- **Effective preferences:** resolved values and their sources, method revision
  (checksum package version or commit), and any explicitly approved overrides.
- **Authority:** policy, source/issuer and durable reference, permitted actions,
  prohibited actions, repository/branch boundaries, expiration/revalidation
  conditions. An unavailable grant blocks effects; city membership is no grant.
- **Plan:** goal, tech, global constraints, task IDs/outcomes, verification
  strategy. Do not maintain a duplicate task status/dependency table.
- **Completion set:** exact required child IDs and separately listed excluded
  follow-up IDs. Do not infer completion from all descendants being closed.
- **Handoff:** phase, current task or blocker, last observed revision, next
  action, and durable evidence/authorization references, not just a chat URL.

### Metadata keys

Use these exact, flat, namespaced keys. Values are strings unless stated
otherwise. Missing required context means repair the record before execution,
not infer it from an ambient city or old conversation.

Preference names use hyphens; Beads metadata keys use underscores.
`bd update --set-metadata` rejects hyphens in keys, even though a JSON metadata
object supplied at creation can contain them.

| Key | Meaning |
|---|---|
| `checksum.contract` | `checksum.workflow/v1` on root and children |
| `checksum.phase` | Current checksum phase on root |
| `checksum.work_backend` | `beads` |
| `checksum.execution_host` | `standalone` or `gascity` |
| `checksum.approval_policy` | `interactive` or `pr-gated`, independently selected |
| `checksum.design_state` | Root: `Draft`, `Approved` (human), or `Validated` (policy) |
| `checksum.plan_state` | Root: `Draft`, `Approved`, `Validated`, `Active`, or `Complete` |
| `checksum.repository` | Canonical repository identity |
| `checksum.base` | Base ref; resolved commit is in Repository section |
| `checksum.branch` | Authorized implementation branch |
| `checksum.method_revision` | Checksum version/commit used |
| `checksum.session` | Durable session URL/ID, root and claimed children |
| `checksum.deliver` | `plan`, `commit`, or `pr`; intent, not permission |
| `checksum.delivery_status` | `pending`, `pr-ready`, or `delivered`; distinct from native status and plan Complete |
| `checksum.delivery_url` | Durable PR/delivery URL when available |
| `checksum.merge_state` | `unknown`, `unmerged`, or `merged`; observed independently of delivery |
| `checksum.design_revision` | Exact design content revision approved or validated |
| `checksum.plan_revision` | Exact plan content revision approved or validated |

Root policy/context applies to children; do not copy mutable policy into each
child. Children carry contract/session/deliver/delivery metadata as applicable.
Design/plan prose must not present a conflicting state header: metadata is the
state source; native status is the task source. Do not turn workflow design
states into custom native issue statuses.

Each evidence record names task/root ID, author/session, timestamp, exact code
revision (and dirty diff identity when relevant), command, actual result,
deviations, and disposition. Preserve observed-red regression evidence,
confidence, residual risk, reproduction exception, and containment action/risk/
rollback/monitoring/owner/removal condition from the existing templates and
debug contract. Authorization records identify approved content or policy
validation and its grant. Review records preserve rung, provider/model,
provenance, findings and resolutions.
Append superseding/invalidation records rather than erase old evidence.

## Verify context before commands

Examples below use an explicitly supplied absolute `$REPO`, known `$ROOT` and
`$TASK` IDs, and a distinct `$ACTOR` for this worker. Never let `update` choose
the last-touched issue. Creation is the exception to existing IDs: capture the
returned ID, inspect it, then use it explicitly for every subsequent operation.

```sh
bd -C "$REPO" --readonly context --json
bd -C "$REPO" --readonly info --json
bd -C "$REPO" --readonly show "$ROOT" --json
```

Compare repository, backend/database identity, redirects/shared-server settings
and root scope with the intended run before any write; `-C` alone does not prove
that auto-discovery targets the right database. If absent, ambiguous, mismatched,
unreachable or schema-incompatible, stop and ask for the intended context.
Do not automatically initialize, migrate, repair, change home configuration,
or fall back to a global store. Do not use a live city as a test fixture.

## Create and update records

These are operator examples, not commands to run as a smoke test. Input paths
are absolute scratch projections of complete records. First preview:

```sh
bd -C "$REPO" create --dry-run --type epic --title "$TITLE" \
  --body-file "$PLAN_INPUT" --design-file "$DESIGN_INPUT" \
  --acceptance "$ACCEPTANCE" \
  --metadata '{"checksum.contract":"checksum.workflow/v1","checksum.work_backend":"beads","checksum.design_state":"Draft","checksum.plan_state":"Draft"}'
```

After context and authority are established, the same command without
`--dry-run`, with complete context metadata, creates the root. Capture and verify
its returned ID before creating children:

```sh
bd -C "$REPO" create --type task --parent "$ROOT" --title "$TASK_TITLE" \
  --body-file "$TASK_INPUT" --acceptance "$TASK_ACCEPTANCE" \
  --metadata '{"checksum.contract":"checksum.workflow/v1","checksum.deliver":"plan"}'
bd -C "$REPO" --readonly show "$TASK" --json
bd -C "$REPO" dep add "$TASK" "$PREREQUISITE"
bd -C "$REPO" update "$ROOT" --design-file "$DESIGN_INPUT" \
  --set-metadata checksum.design_state=Draft
bd -C "$REPO" update "$TASK" --append-notes "$RESULT_RECORD" \
  --set-metadata "checksum.session=$SESSION"
```

`dep add TASK PREREQUISITE` means TASK is blocked by PREREQUISITE. Parentage
alone is not a sequencing dependency. After interrupted creation, inspect the
root/children before retrying; do not blindly duplicate records or replace
another writer's description/metadata. Whole-field updates require ownership
and a fresh read; use `--append-notes` and targeted `--set-metadata` for additions.

## Scheduling and claims

**Standalone:** the coordinating agent owns scheduling within this run only.

```sh
bd -C "$REPO" --readonly ready --parent "$ROOT" --unassigned --limit 0 --json
bd -C "$REPO" --readonly show "$TASK" --json
bd -C "$REPO" --readonly dep list "$TASK" --json
bd -C "$REPO" --actor "$ACTOR" update "$TASK" --claim
bd -C "$REPO" --readonly show "$TASK" --json
bd -C "$REPO" --readonly dep list "$TASK" --json
```

Select only an explicitly listed completion-set task returned as ready; inspect
its dependencies and current owner immediately before claim. `--claim` atomically
sets ownership/status, **not dependency validation**. Recheck native blockers
and prerequisites after claim and before work (ready excludes in-progress tasks,
so inspect dependencies directly after claiming). If dependency state changes,
pause and record the blocker. No project-wide `bd ready --claim`.

On claim failure, retry, or assignment conflict, re-read; do not use `--assignee`
to overwrite the winner. An idempotent claim by the same actor is not proof
that this session owns an old assignment. Reconcile session and host ownership.
Stale work needs explicit reassignment by the responsible coordinator; no
destructive reclaim, force-close, delete or dependency removal to obtain work.

**GasCity:** only execute the host-assigned bead in the host-provided workspace.
Verify assignment and dependencies; report mismatch/blockage to the host.
Workers never call ready/claim to compete with its dispatcher, create their own
scheduling layer, or clear host ownership. The standalone examples above do not
apply to dispatched workers.

## Resume, completion, and follow-ups

Start from verified `$REPO` and `$ROOT`; read root fields/metadata, then:

```sh
bd -C "$REPO" --readonly show "$ROOT" --children --json
bd -C "$REPO" --readonly show "$TASK" --json
bd -C "$REPO" --readonly dep list "$TASK" --json
```

Recover all completion-set IDs, inspect each task and current owner, reload the
method revision and effective preferences, verify authority against current
instructions, and rerun the last completed checks. A move out of GasCity needs
explicit ownership/authority handoff, not merely changing host metadata.

Native `closed` means implementation checks passed for that task. Only plan
finalize may set root plan Complete, after fresh verification of the declared
completion set, resolved change-wide review and successful required delivery.
A failed push/PR creation leaves the root Active and delivery pending. Task
finalize updates only its own delivery record, never root Complete or cleanup.
Record the evidence before closing the implementation task:

```sh
bd -C "$REPO" update "$TASK" --append-notes "$VERIFICATION_RECORD" --status closed
```

PR readiness additionally requires current full verification, adversarial review,
and applicable authorization. Delivery and observed merge state remain separate.
`pr-ready` is not a published PR; `delivered` is the authorized commit/PR delivery;
`checksum.merge_state=merged` requires observed merge evidence, never automatic
merge permission. Record its source and observation time in Delivery notes.
An actual open PR ready for human review has `delivery_status=delivered` and
`merge_state=unmerged`; finish's human-facing “PR ready” label describes that
delivered PR, not the prepublication `pr-ready` metadata state.
Code changes or PR feedback invalidate affected verification/review and readiness;
append that fact, reopen affected task status as appropriate, and re-verify.
Changed design/plan returns to Draft for approval or policy validation.

Create operational follow-ups as persistent beads with evidence, confidence,
next signal, risk, owner and removal/completion condition. List them explicitly
outside the root completion set (they may be separate roots linked in notes).
They remain open after this run completes; never close them merely to make an
epic's descendants appear complete.

Beads are retained project records, not disposable working papers. Finish must
not compact, delete, prune, mark ephemeral or garbage-collect them. File
`artifacts: clear` affects only temporary projections, never these records.

## Compatibility and validation limits

Command syntax checked against installed `bd version 1.2.2 (Homebrew)` using
`bd --help`, `bd create --help`, `bd update --help`, `bd ready --help`,
`bd show --help`, `bd info --help`, `bd context --help`,
`bd dep add --help`, and `bd dep list --help`.
These confirm `-C`, `--readonly`, `--dry-run`, `--body-file`, `--design-file`,
`--acceptance`, `--append-notes`, `--set-metadata`, parent-scoped ready and claim.

The opt-in `tests/beads-roundtrip.test.mjs` creates a disposable embedded Dolt
store with an isolated home/configuration and no remote. Against Beads 1.2.2 it
verified design/acceptance/notes and flat metadata persistence, parent-scoped
readiness, prerequisite release after close, and rejection of a second actor's
claim. Every read is a fresh CLI process. It does not prove concurrent or
cross-machine claim behavior, GasCity scheduling, or agent compliance.

Run it from the checksum checkout with
`CHECKSUM_TEST_BEADS=1 node --test tests/beads-roundtrip.test.mjs`.
No existing project/store is used. Initialization in this fixture uses an
explicit working directory: `-C` itself requires an already initialized Beads
project. Check behavior against a disposable project before relying on another
CLI/backend version; help compatibility is not proof of runtime semantics.
