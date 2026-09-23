---
name: checksum-debug
description: Diagnose defects and unexplained failures before permanent fixes. Produce causal evidence, confidence and a fix boundary. Narrow implementation helpers report raw evidence to their primary; host-assigned debug phases use this skill.
---

# Checksum: Debug

Load [workflow contract](../checksum/references/workflow-contract.md) and
[authorization](../checksum/references/authorization.md), plus effective `debug`
and `general` [preferences](../checksum/references/preferences.md). Direct
investigation needs no design or plan. Narrow helpers stop and report raw failure
evidence; a host-assigned debug phase owns diagnosis and budget for its assignment.

## Preserve and localize

Before production edits record observed/expected behavior, exact command/steps,
complete errors/warnings, relevant environment and reproducibility. Reproduce;
measure intermittent frequency/conditions rather than treating one pass as proof.
If blocked, state why and collect the strongest alternative evidence.
Inspect recent changes and the closest working example.

Trace bad state backward to its first incorrect boundary. In multi-component
paths inspect inputs/outputs between layers. Compare working/failing paths and
list differences before attributing cause. Use minimal temporary instrumentation.

## One falsifiable hypothesis at a time

State cause, supporting evidence and the observation that would disprove it.
Run the smallest one-variable experiment, record its result, then choose the next.
Before diagnostic production edits record the baseline diff, keep edits local
and uncommitted, and revert only those edits after recording results. Inspect the
full diff at handoff and disclose leftovers; never erase pre-existing user work.
A passing experiment confirms only what it tested.

Do not stack speculative fixes. Experiments can survive only after entering the
normal authorized design/plan/execute/review/finish flow as a permanent correction
or permitted containment. Debug itself grants no production delivery authority.
At the hypothesis limit (default three), record a durable blocked diagnosis and
next action using the shared budget rules; no automatic reset or human polling.

## Record the diagnosis

Use [diagnosis contract](references/diagnosis.md) in the selected backend:

- **confirmed:** causal experiment or trace identifies the source.
- **probable:** converging evidence without direct causal confirmation.
- **unknown:** evidence bounds the failure but not its source.

Separate facts and inference. Specify the smallest fix boundary and symptom-derived
regression condition. Permanent fixes need observed-red under
[testing](../checksum-execute/references/testing.md), or the explicitly authorized
blocked-reproduction exception. Record risk exceptions under shared authorization,
including retained follow-ups; never invent human acceptance for a policy decision.
`require-cause` preferences remain binding in PR-gated runs.

Full work carries diagnosis in the affected task; light work includes the complete
block in its explicit plan/handoff. Diagnosis-only files work may report in chat
unless retention is requested; retained backends preserve it in notes. Do not
create a standalone file by default.

## Return evidence, not a hidden implementation

Diagnosis-only/environmental cause: report evidence, confidence and next signal.
Permanent fix or permitted containment: propose router re-entry with diagnosis,
scope and risk. A changed fix boundary reopens plan/design. Resume execute only
when the current authorized plan describes the correction and confidence/risk
requirements are met. Hosted runs return this handoff through the host.
