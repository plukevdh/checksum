# Lifecycle and phase selection

Use the [workflow contract](workflow-contract.md), [authorization](authorization.md)
and selected [files](backends/files.md) or [Beads](backends/beads.md) mapping.
“Record”, “task” and “result” are semantic roles, not mandatory files.

## States

| Design/plan state | Meaning |
|---|---|
| Draft | Unvalidated content, including any material revision |
| Approved | Human explicitly approved this exact revision |
| Validated | PR-gated criteria passed under recorded policy authority |
| Active | Plan execution started; original validation provenance retained |
| Complete | Required tasks verified and intended delivery succeeded |

Never label policy review Approved. Validation records actor, authority, revision,
criteria and outcome. Changed scope/behavior/repository assumptions invalidate it:
stale design routes to design, stale plan to plan. Explain the revision and obtain
approval or policy revalidation before execution.

Logical task states are pending, claimed, done and blocked; backend-native
equivalents govern coordination. A task is eligible only when real dependencies
are done, it is within scope and assignment/claim is valid. Claim before edits;
record a durable session reference. A stale claim is not permission to steal work:
reconcile with backend/host and reverify partial changes before resuming.
Done means acceptance checks observed passing, not delivery or merge.

`deliver: plan | commit | pr` defines a delivery boundary, never authority.
Granular commit/PR tasks need scoped review and finish; plan finalize also verifies
integration and change-wide review. A pending isolated delivery cannot disappear
into plan delivery: first integrate it under authority, or retain and report its
branch/workspace and pending delivery. Dependencies and delivery remain distinct.

## Durable operational follow-up

Containment and uncertain fixes require a follow-up outside the current completion
set. Use a retained backend task, resolvable authorized external ticket, or stable
heading in committed project tracking documentation, never a temporary artifact.
The entry itself contains current evidence, confidence, next investigation signal,
risk, rollback/monitoring, owner and removal/completion condition. A bare link is
not enough. Creation follows authorization rules; no permission means blocked.
Open diagnosis remains open even when a containment delivery completes.

## Storage, retention and resume

Files full-weight convention: `<artifacts dir>/YYYY-MM-DD-<slug>/` with
`design.md`, `plan.md`, `tasks/NN-<slug>.md` and optional requested `diagnosis.md`.
The date remains the design-start date. Files light work may use an explicit
approved/validated chat plan; execute restates its task, checks and full diagnosis/risk
before editing. Beads stores narrative in durable records.

Temporary checksum files are working papers, not deliverables: never stage them
unless the user explicitly asks in this session. Stage explicit paths, never
sweep unrelated changes/artifacts into a commit. Interactive may offer once to
ignore the artifacts directory; never edit ignore rules without authority.

Retain authoritative backend records and incomplete/blocked state. `artifacts:
clear` applies only to temporary files after the full condensed decision,
evidence, review and risk record has shipped durably to a PR/commit. If no durable
record shipped, retain them. Beads records and durable follow-ups are never cleared
by this preference. Complete does not mean merged; record merge state separately.

On resume, identify the explicit root/task (host assignment wins over directory
recency), read design/plan/results/authority, inspect the actual tree, and reverify
recent done checks. If standalone files context is unspecified, locate relevant
incomplete work; ask rather than choosing among ambiguous candidates.
On interruption preserve partial evidence, attempts, claims, branch and next action.
The host owns hosted workspaces and cleanup; workers never remove them.
