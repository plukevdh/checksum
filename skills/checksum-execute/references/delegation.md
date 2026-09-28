# Delegation without a second scheduler

Follow the [workflow contract](../../checksum/references/workflow-contract.md).
Standalone `auto` uses a native dispatch capability when actually available;
otherwise execute inline. Host tools define mechanics, not methodology.

GasCity owns workflow scheduling and workspaces. A worker handles only its assigned
task/phase, never queries global ready work and never autonomously dispatches
other workflow tasks or creates nested phase runs. Host-invoked phase agents
load their phase normally; they are not narrow helpers excluded by router/debug.
Narrow helpers are permitted only when the host allows them, within the assigned
scope, without autonomous claims, delivery or workspace allocation.

## Self-contained helper dispatch

The primary owns authoritative backend bookkeeping and claim before dispatch.
Use a clean context and provide:

```
Implement only this assigned scope. Do not commit, push, modify work records,
dispatch workflow tasks, or edit outside the listed scope.

Context: repository/base/work branch, root/task IDs, backend/host/policy,
method/preference revision, run authority and exclusions.
Design and plan: complete relevant content and validated revisions.
Constraints: verbatim global constraints.
Task: files, interfaces, failure behavior, dependencies, checks, expected values.
Testing: selected testing policy and defect observed-red/exception requirements.
Diagnosis: complete evidence, confidence, risk and budgets used.
Report: exact changed paths, commands with actual output, deviations, raw failures
and unresolved risks. Stop at unexplained failure; do not try speculative fixes.
```

No model names or provider CLI commands are hard-coded here. Host routing records
actual provider/model/context/provenance and respects repository access controls.

## Primary verification

Read the actual diff, rerun acceptance checks and inspect full output. Check files,
interfaces, scope, placeholders and test honesty. Only then record Result and done.
A helper's report is a claim, not evidence. Review failures get a focused repair;
after two failed helper review rounds take over inline within remaining budget.
Unknown failures go to the owning debug phase; plan defects route back to plan.
Shared budgets survive helper replacement, phase handoff and resume.

Standalone may parallelize eligible disjoint tasks within the selected root;
claim first and verify separately. Hosted concurrency is the scheduler's decision.
