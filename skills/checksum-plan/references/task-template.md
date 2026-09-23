---
status: pending
claimed-by: # on claim: durable session link, e.g. delta://thread/$DELTA_CURRENT_THREAD_ID
depends: []
deliver: plan
---

The frontmatter above is files-backend coordination only. Other backends use
native status, assignee and dependencies; do not mirror those as shadow truth.
Store the narrative sections below in the selected backend.

# Task NN: [Outcome, stated as a result]

**Plan:** [record reference/revision] · **Design:** [record reference/revision]
(Global constraints in the plan apply to this task.)
**Authority/context:** [root ID, repository/base/work branch, scoped run authority]

## Diagnosis

[Observed vs. expected behavior, reproduction, evidence, root-cause confidence,
fix boundary, and regression condition from checksum-debug's Diagnosis Contract.
When applicable, include its complete `### Residual risk` and
`### Reproduction exception` sections. Omit for non-defects.]

## Containment

[For an authorized temporary mitigation: action, risk, rollback, monitoring, removal
condition, explicit owner, and the durable follow-up outside this plan's completion
set that owns removal. Omit when none.]

**Files:**
- Create: `exact/path/new_file.py`
- Modify: `exact/path/existing.py`
- Test: `tests/exact/path/test_file.py`

**Interfaces:**
- Consumes: [exact signatures from dependency tasks or existing code]
- Produces: [exact names, parameters, return types later tasks rely on]

**Failure behavior:** [What this component does on bad input / partial failure,
from the design's edge-case section.]

**Acceptance checks** (expected values from the design, written before implementation):

```
Run: <exact command>
Expect: <specific output, count, or exit status>
```

**Steps:**

- [ ] [Concrete step stated by outcome and constraint — code blocks only where the
      exact content is the contract (test assertions, schemas, signatures);
      implementation bodies are written during execution, not here]
- [ ] […]
- [ ] Run the acceptance checks above and the neighboring tests they affect;
      record actual output.

## Result

[Filled on completion: commands run, actual output summary, deviations from the
task and why. For a permanent defect fix: the exact observed-red command and failing
result. For containment: the pre/post suppression-check results. If blocked: what
was tried and what blocks.]

**Review:** [scope/revision, rung/provider/model/provenance, findings/resolutions]
**Delivery:** [pending/completed actions, hashes/PR URLs, independent merge state]
**Handoff:** [next phase/action, evidence, budgets used, unresolved risk/block reason]
