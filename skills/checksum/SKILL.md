---
name: checksum
description: Start or resume checksum for features, diagnosis, fixes and refactors. Routes design → plan → execute → finish with debug recovery. Not for read-only questions, trivial edits or narrow helper subagents; host-assigned phase invocations remain supported.
---

# Checksum: Workflow Router

One portable methodology: design before code, evidence before claims, bounded
scope, and explicit authority. Load [workflow-contract](references/workflow-contract.md)
and [authorization](references/authorization.md) before any phase. No mandatory
runtime is needed for the default files/standalone/interactive workflow.

## Initialize or resume

1. Load optional user `~/.checksum/preferences.md` and project
   `.checksum/preferences.md`; project directives win conflicts, direct
   instructions and project prohibitions remain binding. See
   [preferences](references/preferences.md). Do not create preferences implicitly.
2. Resolve backend, host and approval policy; load the selected backend reference.
   Record method revision, effective preferences and run authority. Missing
   required authority blocks before edits; never infer it from the host.
3. Load the explicit work/root and assigned task, or locate the relevant current
   record using [lifecycle](references/lifecycle.md). Read complete records, not
   just statuses. Revalidate stale assumptions and reverify recent completed work.
   With GasCity, assignment, resume and subsequent phase invocation belong to the
   host; report the selected next phase rather than launching other work.

## Diagnose before classifying

For a defect or unexplained failure, invoke `checksum-debug` unless causal
evidence already confirms the cause. Carry observed/expected behavior,
reproduction or exact blocker, confidence, evidence, fix boundary and regression
condition into the work record either way. Do not repeat diagnosis merely to
produce a formal document. Probable/unknown corrections and containment use the
authorization risk-exception rules; inference is never confirmation.

## Choose proportional weight

- **Spike:** bounded feasibility question, throwaway code only, answer and evidence.
- **Light:** small change to an existing flow; concise design and plan with the
  same acceptance, diagnosis, review and finish criteria. Files/interactive may
  carry these in an explicit chat handoff and task tracker; retained backends keep
  them in their record rather than relying on conversation memory.
- **Full:** new capability/component/interface, persistence, security, concurrency
  or external effects; complete design, plan and task records.

Interactive proposes a weight for user confirmation; light design/plan may share
one explicit approval. PR-gated chooses and records an appropriate weight within
authorized scope without a routine wait. Growth or ambiguity that changes scope
requires renewed authority, not silent implementation.

## Select and hand off

Select the first applicable phase:

1. `checksum-design`: missing, incomplete or stale design.
2. `checksum-plan`: current question-complete Approved (interactive) or
   Validated (PR-gated) design, but no current validated/approved plan. Any
   unanswered design question routes back to design/user clarification, not plan.
3. `checksum-execute`: authorized current plan with unfinished tasks or failing
   checks. Active retains its design/plan validation provenance.
4. `checksum-finish`: all relevant tasks done with passing evidence, delivery pending.

Debug returns evidence and the proposed next phase. A changed fix boundary or
containment returns to plan, or design if behavior/scope changed. Do not implement
around stale documents. A completed change gets new work identity for new scope;
PR feedback within existing scope reopens the affected tasks, invalidates stale
evidence/review and repeats verification before updating the same authorized PR.

Every handoff follows the shared contract, including context, record references,
authority, evidence, budgets, risk and exact next action. Standalone invokes the
selected phase; a hosted phase returns that handoff to its orchestrator. Stop for
design-only, plan-only or diagnosis-only requests. Blocked work is durable progress,
not a reason to poll humans or invent permission.
