---
name: checksum-design
description: Write or revise a checksum design with observable success criteria when design is absent, incomplete or stale.
---

# Checksum: Design

Load the shared [workflow contract](../checksum/references/workflow-contract.md)
and [authorization](../checksum/references/authorization.md). Require the router's
context, selected backend, authority and effective `design` preferences.
Read existing code, conventions, relevant prior records and constraints first.

## Understand and compare

For defects, require the [diagnosis](../checksum-debug/references/diagnosis.md)
or confirmed causal evidence: observed/expected, reproduction or blocker,
confidence, fix boundary and regression condition. Carry complete risk/exception
records; return unexplained failures to debug rather than guessing.

Resolve every question that changes scope, behavior, risk, implementation
choices or external effects before design validation. Interactive asks the user
one consequential question at a time as soon as it is found; do not defer it to
an “open questions” list or ask an implementer to decide from a plan. Record the
answer and its source in the design, then revise affected sections. PR-gated
uses established requirements and evidence; an unanswered material question
blocks and is returned verbatim to the user through the host, without creating
a plan. Bounded non-material assumptions must be explicit decisions with
evidence/authority and an impact-if-false, never disguised open questions.
Decompose independent subsystems into independently shippable work when appropriate.

Compare two or three real approaches with tradeoffs, lead with the recommendation,
and preserve the decisive rejected alternative. Prefer existing patterns and
dependencies; strip unrequested features before designing them.

## Record and validate

Write the design to the chosen backend using the semantic content of
[design-template](references/design-template.md) (or configured template):

- Goal, observable success criteria and explicit in/out scope.
- Current state, exact constraints, chosen approach and rationale.
- Responsibilities, interfaces/data shapes, data flow, edge cases and failure
  behavior, including malformed/empty input, concurrency and partial failure.
- Verification strategy, assumptions and full defect/risk records when needed.

Self-review for placeholders, contradictions, unanswered questions, ambiguous
requirements, unsupported assumptions and overlarge scope. Every success
criterion names its proof. A design with an unanswered question remains Draft
or Blocked and is ineligible for plan; neither approval nor policy validation
may waive this gate. Set Draft while editing. Interactive presents the
question-complete record and waits for explicit approval of the exact revision,
then records Approved. PR-gated records criteria, actor, policy and revision as
Validated and continues without claiming approval.
Hand off through the router/host contract; do not begin implementation here.
