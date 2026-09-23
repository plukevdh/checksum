# [Change Name] Design

**Date:** YYYY-MM-DD
**Status:** Draft
**Slug:** `<slug>`
**Revision and validation:** [content revision; Approved by human or Validated by
policy; actor/time/authority/criteria/outcome]
**Work context:** [root ID; repository/base/work branch; backend/host/policy;
method revision and effective preferences reference]

This is a content template; use the selected backend's design field or file.

## Goal

[The user-visible or system result, in one or two sentences.]

## Success Criteria

[Each criterion is observable and names its proof. These become acceptance checks in
the plan and the verification matrix at finish.]

- [Criterion] — proven by: [exact command / behavior / artifact]

## Scope

**In:**
- [Required behavior]

**Out:**
- [Explicit exclusion, with a word on why]

## Current State

[What the repository does today in this area.]

## Diagnosis (defects only)

[Observed vs. expected behavior, reproduction or its exact blocker, causal
evidence, confidence, fix boundary, and regression condition. When applicable,
include the checksum-debug contract's complete `### Residual risk`,
`### Reproduction exception`, and `### Containment` sections. Omit for
non-defects.]

## Constraints

- [Compatibility, dependency, platform, performance, and delivery limits — exact values.]

## Approaches Considered

### Chosen: [Approach]

[Why this is the smallest correct approach.]

### Rejected: [Alternative]

[The decisive reason. Keep it short but keep it — future you will ask.]

## Design

[Components, responsibilities, interfaces, data flow. Diagrams welcome where they
beat prose.]

### Data shapes and contracts

[Types, schemas, signatures other components depend on — exact names.]

### Edge cases and failure behavior

[Malformed input, empty states, concurrency, partial failure, resource limits — what
happens in each. Whatever is missing here will be missing from the code.]

## Verification Strategy

[How the implementation will prove each success criterion: test approach, manual
checks, and anything that needs special setup.]

## Resolved Questions & Assumptions

[Record consequential questions only after the user or established authority
answers them. An Approved/Validated design has no unanswered questions; an
unanswered material question keeps the design Draft/Blocked and prevents
planning.]

- **Question:** [What needed deciding?] **Answer:** [Decision.] **Source:**
  [User/policy/evidence and date.]
- **Assumption:** [Bounded non-material assumption.] **Evidence/authority:**
  [Why it is permitted.] **Impact if false:** [What changes or blocks.]
