---
name: checksum-finish
description: Finalize task or plan scope with completeness scan, fresh verification, recorded review and authorized delivery. PR ready is not merged.
---

# Checksum: Finish

Load [workflow contract](../checksum/references/workflow-contract.md) and
[authorization](../checksum/references/authorization.md), selected backend and
effective `finish` preferences. Task finalize verifies one `commit | pr` delivery
unit; plan finalize verifies the integrated completion set and remaining delivery.

## 1. Loud completeness scan

Lead with **INCOMPLETE — cannot finalize** and enumerate every gap, record ID,
evidence and exact resume action. Never soften it into “mostly done”.

- **Task scope:** that task's steps/checks/results complete, dependencies satisfied,
  scoped review resolved. Other independent pending tasks do not block its delivery.
- **Plan scope:** completion set all done, design criteria mapped to evidence,
  change-wide review resolved, granular deliveries recorded with hashes/URLs.
- Permanent fixes have observed-red command/failure or the explicitly authorized
  reproduction exception and passing proxy. Containment has pre/post suppression
  evidence, not a claim of permanent correction.
- Containment/uncertain corrections have complete risk, rollback, monitoring,
  owner, removal/completion condition and populated durable follow-up outside the
  completion set. Open diagnosis retains evidence/confidence/next signal.
- Exception provenance is human acceptance or permitted policy validation, never
  a fabricated approval. Blocked reproduction retains blocker/proxy/residual risk.

Any gap returns to the appropriate phase or a durable blocked outcome. Open
follow-up is not a task in this completion set and does not itself prevent delivery;
missing follow-up or permission does. Pending isolated task delivery remains a gap.

## 2. Fresh verification and review

Follow [verification](references/verification.md). Run all scoped checks after the
final change; plan finalize runs Full Verification on the tree containing every
task, not a mid-stack branch. Map each design criterion → implementation → exact
command → actual result. Reproduce permanent defects or run the permitted proxy;
label containment as suppression. Missing required checks or failures cannot pass.

Confirm execute's review record identifies scope/revision, rung/provider/model,
findings and resolutions. Missing, stale or incomplete review returns to execute,
not a substitute finish review. Reviewed fixes need affected verification; changed
scope or new behavior needs renewed review.

## 3. Delivery review package

Present outcome/rationale, evidence matrix, review findings/resolutions, all risks
and exception provenance, status/diff summary including untracked files, excluded
temporary artifacts, and ledger of already-delivered versus pending work.

Interactive waits for the user's explicit local-review go before commit, push,
PR or cleanup. Preferences do not skip that gate. A no-go preserves work and
pending delivery; offer pause/revise, not forced delivery.

PR-gated records this package and validates authority without a routine human wait.
Check repository, source branch, base, publication remote and actions against the
explicit run permission and project prohibitions. Missing/conflicting authority
blocks. Do not claim the user accepted policy-reviewed work.

## 4. Deliver and retain

Distill the durable record first: goal, scope, chosen/rejected approaches and
rationale, tasks/deliveries, design/plan validation, fresh verification, review and
all diagnosis/risk/exception/follow-up information. Use the PR template or commit
body; PR-gated risks must appear in the PR, not only private working notes.

Follow authorized actions and repository conventions. Stage explicit paths, inspect
the staged diff, exclude unrelated changes and temporary checksum artifacts unless
explicitly requested. Commit before push; a failed commit means no push. Never
force-push under either policy. PR-gated authority never permits merge,
default-branch writes, deployment or broader external effects.
Discarding work/branches is not ordinary cleanup: it requires a separate explicit
user request and confirmation of the exact target; PR-gated runs preserve the
work instead. Record hashes/URLs and actual results after each action.
Delivery failure preserves verified evidence but leaves delivery incomplete.

### Task close-out

After this task's delivery succeeds, update only its Result and delivery ledger.
Leave the root plan Active and preserve the design, plan and every task record.
Task finalize never marks the root Complete or clears the shared artifact
directory. Return to execute (or the host) for remaining work; even the last task
still needs plan finalize's integrated verification and change-wide review.

### Plan close-out

Only plan finalize, after the whole completion set and required delivery pass,
records root Complete and independent delivery/merge states. Report **PR ready**
only for an actual open PR whose current revision passed the required checks and
review, not merely a candidate ready to publish. For keep-as-is with no durable
delivery, preserve pending state and records instead of claiming completion.
Retain backend records and follow-ups. Only plan finalize may clear temporary
file artifacts after their condensed record shipped durably, per
[lifecycle](../checksum/references/lifecycle.md).

At either scope, standalone cleanup removes only the delivered scope's
checksum-created clean worktrees when authorized/configured; never force-remove
uncommitted/untracked work. Hosted workspace cleanup belongs exclusively to host.
Return hashes/URLs, evidence, risks, retained records and next action via handoff.
