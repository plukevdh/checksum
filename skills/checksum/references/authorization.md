# Authorization and validation

Apply direct instructions and project prohibitions before preferences and defaults.
Record effective authority in the [workflow contract](workflow-contract.md).
`interactive` is the default. Selecting a host/backend or finding credentials is
not authorization. Before starting, check that the selected policy can complete
its intended delivery without violating existing instructions. Missing required
authorization or conflicting prohibitions blocks early; a host must not silently
relax a project rule such as “ask before push”.

## Interactive

Preserve the existing human gates: confirm weight, obtain explicit approval of
the exact design and plan before implementation, and present the finish local-review
package and wait for an explicit go before commit, push, PR or cleanup.
Preferences configure actions after that go, not permission to skip it.
Ask about ambiguity, scope changes, external effects and risk exceptions.
Revised content becomes Draft and needs renewed approval. Only an actual human
approval permits the label **Approved**.

## PR-gated

Requires explicit run authorization from the user or an authorized project policy.
Record the repository, bounded scope, source/work branch (not the default branch),
base branch, permitted publication remote(s), allowed commit/push/PR actions and
limits. A policy name alone is insufficient. Verify the actual branch, base and
remote before every delivery; never infer a publication remote from a local
checkout backlink. Branch stacks require explicitly authorized branches/bases.

Within that authority, validate design and plan against their semantic criteria,
record **Validated** with policy/actor/content-revision provenance, and continue.
Do not wait for routine human design, plan, debugging-exception or finish approval.
Choose bounded implementation details from the approved scope and record reasoning;
material ambiguity or scope expansion blocks rather than inventing requirements.
Revisions return to Draft and must be revalidated before execution.

Finish may make scoped feature-branch commits, push to the authorized remote and
create/update the scoped PR after fresh verification and adversarial review.
When the run authority names a task-branch pattern and base, the host may
provision exactly those workspaces/branches and a task may commit to its own
task branch; that is executing recorded authority, not expanding it. Integration
into the work branch remains a finish action under the same authority.
Human review occurs at the PR. The delivery report says **PR ready**, never
human-approved or merged. Neither policy nor a task delivery flag authorizes merge,
default-branch writes, deployment, destructive actions, force-push, unrelated
external effects, or publishing packages. Such work is outside this policy.

## Risk exceptions and budgets

Semantic safeguards apply under both policies:

- A permanent fix at probable/unknown confidence requires permission under the
  effective `uncertain-fix` policy, residual risk, rollback, a falsifying/monitoring
  signal, owner and durable follow-up outside the current completion set.
- Containment requires permission under `containment`, risk, rollback, monitoring,
  owner, removal condition and durable follow-up. It is symptom suppression, not
  a confirmed fix; no deployment authority follows.
- A blocked reproduction exception requires the exact blocker, strongest
  executable proxy, what it cannot prove, and explicit exception authorization.
  A proxy is never described as observed-red.

Interactive obtains explicit human acceptance. PR-gated may proceed only when
the run authority explicitly permits the applicable exception and no project
`require-cause` rule forbids it. Record the policy decision, never fabricated
human acceptance, and disclose every exception and risk in the PR. Missing
permission or an unavailable durable follow-up blocks; no routine polling.
Creating external follow-ups needs separate scoped permission, or use an authorized
retained backend record/project tracking entry.

Hypothesis and implementation-attempt budgets default to three each. Exhaustion
produces a durable blocked result with evidence and next action, not an automatic
restart or a fresh budget disguised as a new phase. Interactive may ask for an
explicit extension and record its direction/budget; PR-gated returns control to the
host without human polling. A later authorized resume must record any extension.

Adversarial review, honest verification, explicit scope and exclusion of temporary
checksum artifacts from commits are not removed by PR-gated authorization.
