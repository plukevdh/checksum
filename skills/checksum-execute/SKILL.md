---
name: checksum-execute
description: Execute current Approved or policy-Validated checksum plans with spec-anchored checks, bounded repair and fresh evidence.
---

# Checksum: Execute

Load [workflow contract](../checksum/references/workflow-contract.md) and
[authorization](../checksum/references/authorization.md). Read the entire current
design and plan, validation provenance and effective `execute` preferences.
Stale, inconsistent or incomplete records return to design/plan before edits.
Record pre-existing changes and set the plan Active without erasing validation.
For light chat work restate the task, checks and complete diagnosis/risk blocks.

## Assignment and delegation

Standalone selects eligible tasks within this work/root; native dependencies and
claims govern eligibility. `delegation: auto` uses a fresh helper per task when
a native dispatch tool is actually available, otherwise inline execution.
Explicit preferences may override. See [delegation](references/delegation.md).
Independent tasks may run concurrently only with disjoint edits.

GasCity owns scheduler and workspaces: execute only the assigned task, never
select other ready work or autonomously dispatch workflow tasks. Narrow helpers
may assist only within the assigned scope when the host permits them; they are
not orchestrator phase invocations. Host-owned next phases return via handoff.
Optional standalone [goals](references/goals.md) never replace host scheduling.

## Task loop

1. Confirm eligibility and claim/assignment in the authoritative backend before
   edits. Reconcile stale claims with the host; do not take over live work.
2. Apply [testing](references/testing.md), default `spec-anchored`: materialize
   spec-derived checks before or alongside implementation, never derive expected
   values from executing the code. Observe defect red before its fix.
3. Implement the smallest change satisfying the task and its constraints.
4. Run acceptance and affected neighboring checks; read complete output.
5. Refactor checkpoint: compare structure to design and tidy naming, duplication
   and placement within scope while keeping checks green.
6. Record exact commands, actual results, tested revision, deviations and red
   evidence. Only observed passing checks permit done.
7. `deliver: commit | pr` requests scoped review and finish, not authority.
   Leave delivery pending until finish succeeds. Execute never pushes and never
   writes the default branch. Standalone leaves commits to finish. Under an
   execution host whose Authority names the branch (GasCity), a scoped commit on
   the branch the task or review-fix lane runs on is its handoff artifact, and
   the host integrates task branches into the work branch by rebase and
   fast-forward; finish verifies and publishes.

## Failures and budgets

Unconfirmed cause routes to debug before further production edits. A causal
compiler diagnostic or equivalent may establish cause directly: record
observed/expected, evidence and regression condition, and continue only if the
current plan already describes the correction and no new risk/scope is introduced.
Wrong acceptance checks are plan defects, never permission to weaken tests.

Helpers report raw failures; the primary or host-owned debug phase maintains
diagnosis and the shared hypothesis budget. Resume only under a current plan with
confirmed cause or an explicitly permitted uncertain-fix record. After consecutive
implementation-attempt limit (default three), persist blocked evidence and next
action under shared authorization; no blind retries, polling or phase-budget resets.
Missing credentials/dependencies, out-of-scope effects or ambiguity also block.

## Review and handoff

Run [adversarial review](references/adversarial-review.md) per delivery unit and
change-wide integration. Fix blockers/should-fixes and reverify; retain findings
and resolutions in the authoritative task/root review record. Finish refuses a
missing or stale record. Return results, evidence, delivery state and exact next
phase through the shared handoff, not a claim of merge or human acceptance.
