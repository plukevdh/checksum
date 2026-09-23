# Portable workflow contract

`checksum.workflow/v1` is a semantic record contract, not a required runtime or
serialization format. Every phase loads this contract and [authorization](authorization.md).
One methodology applies to every combination:

| Selection | Values | Default |
|---|---|---|
| `work-backend` | `files`, `beads` | `files` |
| `execution-host` | `standalone`, `gascity` | `standalone` |
| `approval-policy` | `interactive`, `pr-gated` | `interactive` |

Select exactly one authoritative work backend: [files](backends/files.md) or
[Beads](backends/beads.md). Backend references define storage and commands;
hosts define dispatch and workspace mechanics. Core phases know neither.
No backend, host, environment variable, or installed tool grants permission.

## Required resumable record

The following are logical fields; backend mappings choose their concrete names.
Absent optional state is explicitly absent, not silently inferred from chat.

- **Identity and context:** schema, stable work/root identifier, repository
  identity and location, base branch/revision, work/source branch, permitted
  remote(s), goal, scope in/out, constraints, weight and current phase.
- **Configuration:** all three selections, checksum method revision, effective
  preferences and their sources/overrides, backend/host compatibility assumptions.
- **Run authority:** issuer and explicit instruction/policy reference, authorized
  repository, scope, source branch, base, remotes, actions, exclusions and limits;
  exception permissions and any expiration. Record conflicts or missing authority.
- **Design:** complete narrative or durable reference, revision, observable success
  criteria, alternatives/rationale, interfaces, edge cases, status and validation.
- **Plan:** complete narrative or durable reference, revision/design revision,
  constraints, completion condition, full verification, task index, status and
  validation. Validation records actor, time, content revision, criteria checked,
  outcome and authority reference; human approval and policy validation differ.
- **Tasks:** stable IDs, scope/files, interfaces, expected failure behavior,
  dependencies, acceptance commands and expected results derived before coding,
  steps, claimant, status, delivery boundary, and results (commands, actual output,
  tested revision, deviations, red evidence, blockers and review references).
- **Diagnosis and risk:** observed/expected, reproduction, experiments and budget,
  confidence, causal evidence, fix boundary, regression condition; complete
  containment, uncertain-fix and reproduction-exception records when applicable.
- **Review:** delivery scope/revision, reviewer rung, actual provider/model and
  reasoning strength, dispatch provenance, limitations, findings and resolutions.
- **Delivery:** intended and completed actions, branches/bases, commit hashes, PR
  URLs, verification/review references, disclosed risks, and independent merge
  state. `PR ready` is not `merged`, nor is implementation done permission to merge.
- **Blocking:** reason, evidence, attempts/budget consumed, missing permission or
  dependency, exact next action and responsible role. Preserve partial results.

In Beads, descriptions/design/acceptance/notes hold these narratives and evidence;
native status, assignee and dependencies are authoritative. Do not create shadow
coordination state in prose or metadata. File projections are not a second store.

## Phase handoff and resume

Every handoff identifies work/root and assigned task IDs, repository/base/work
branch, selected backend/host/policy, method/preference revisions, authority
reference, current and next phase, record references/revisions, validation,
dependencies/claim state, evidence, unresolved risks/block reason and next action.
The receiver reads the actual records and tree; a prior agent's success is a claim.
Reverify recent completed work before relying on it and invalidate stale validation
when content, scope or repository assumptions change. Never resume from chat alone
when a retained backend record exists.

Standalone routing may select eligible work within the chosen root only. GasCity
owns scheduling, assignment, resume, phase handoffs and workspaces: a worker acts
only on its assigned task/phase, returns its result through the host, and never
scans a global ready queue or autonomously dispatches other workflow tasks.
Host-invoked phase agents are not narrow helper subagents: the router/debug
helper exclusions do not disable host phase invocation. Narrow helpers implement
only their delegated scope and report to their primary (see
[delegation](../../checksum-execute/references/delegation.md)).

Persist successful, partial and blocked outcomes before returning control. Retain
authoritative records; only temporary file artifacts may be cleared after their
complete durable handoff/delivery record exists. See [lifecycle](lifecycle.md).
