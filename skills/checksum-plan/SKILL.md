---
name: checksum-plan
description: Translate a current Approved or policy-Validated checksum design into self-contained tasks with spec-derived acceptance checks.
---

# Checksum: Plan

Load the shared [workflow contract](../checksum/references/workflow-contract.md)
and [authorization](../checksum/references/authorization.md). Require a current
Approved/Validated design, backend context and effective `plan` preferences.
Return stale or missing design to the router/host. Before writing any plan or
task, read the complete design and confirm it has no unanswered questions or
uncertain assumptions whose answer changes scope, behavior, risk,
implementation choices, verification or external effects. Status alone is not
proof. Interactive returns each question to the user (one consequential
question at a time), records the answer in a revised design and obtains renewed
approval; PR-gated records Blocked and returns the exact question through the
host. Do not copy a question into the plan, turn it into an implementation
step, or let an implementer choose.

Plan for an implementer with zero conversation context. Read the touched code
before choosing file responsibilities, interfaces, task boundaries and order.
Each task is the smallest independently verifiable outcome; fold scaffolding into
its consumer. Prefer incremental working states, no speculative abstractions.

## Acceptance first

Derive checks from design success criteria and edge cases before implementation.
Each names an exact command and expected result; expectations never come from
running the implementation. Config/docs/generated work gets the narrowest direct
validator and an explanation of why a unit test is not applicable.

Defect tasks carry the complete [diagnosis](../checksum-debug/references/diagnosis.md)
and regression condition. Include residual-risk, reproduction-exception and
containment blocks when applicable. Follow-ups live outside the current completion
set under [lifecycle](../checksum/references/lifecycle.md#durable-operational-follow-up).
Containment checks prove suppression and an executable rollback, not permanent cure.

## Write to the chosen backend

Use the semantic sections of [plan-template](references/plan-template.md) and
[task-template](references/task-template.md). File paths/frontmatter are the files
mapping only; Beads uses native task coordination, description/design/acceptance
and notes. Light work is concise but retains the same criteria.

- Copy global constraints verbatim from design.
- Specify files, responsibilities, exact consumed/produced interfaces, failure
  behavior, acceptance commands, steps and full verification.
- List only real dependencies (consumed interfaces or overlapping edits), no cycles
  or missing IDs. Keep independent tasks parallelizable for the scheduler.
- `deliver: plan` is default; `commit`/`pr` requests scoped finish. Stacks need
  independently reviewable units and authorized source/base branches.
- Write contracts, not implementation bodies. Exact assertions/schemas/signatures
  are appropriate; “TBD”, “similar to task 2” and vague checks are not.
- Provide a completion condition with measurable results, exact proof and scope.

## Validate and hand off

Trace every design requirement/edge case to a task, check interface consistency,
dependency sanity, check sufficiency and granular delivery boundaries.
Interactive presents Draft and waits for explicit approval, then records Approved.
PR-gated records criteria, revision, actor and policy as Validated and proceeds.
Use the shared handoff; planning grants no extra delivery authority. Temporary file
artifacts stay out of commits unless explicitly requested.
