# Testing Policy

Checksum defaults to **spec-anchored** testing rather than in-loop red-green TDD.
This is a deliberate, evidence-based divergence from most agent workflow frameworks.

## Why spec-anchored is the default

- Controlled comparisons of agents doing strict in-loop TDD vs. implementing from a
  full upfront design found **no reliable quality gain from the TDD ritual at 3-8x
  the token cost** — and the TDD runs often produced *worse* designs, because
  architecture emerged from whatever shape the first test locked in instead of from
  deliberate upfront decisions (Böckeler, "TDD inside the agent loop", Thoughtworks
  2026).
- The same work showed agents faking or skipping the red step, and writing
  tautological tests *despite* writing them first. The ritual does not buy the
  honesty it promises.
- What the research does support (TDD-Agent, TENET, Mathews & Nagappan): giving the
  model **concrete expected behaviors before implementation** improves correctness.
  The value is tests-as-executable-spec, not the red-green loop.

Checksum therefore moves the test-first thinking to where it pays: the **plan**
writes acceptance checks from the design before any implementation exists, and
execution materializes them as real tests. Design pressure comes from the design
phase and the per-task refactor checkpoint, not from incremental test-sizing.

## Modes

Selected by the `testing` preference; default `spec-anchored`.

### `spec-anchored` (default)

For each task:

1. Materialize the task's acceptance checks as real automated tests **before or
   alongside** the implementation. Expected values come from the plan and design —
   never from running the implementation to see what it produces.
2. Implement the task fully, with the design in view. No need to grow the code
   test-by-test.
3. Run the task's tests and the neighboring tests they affect; fix code (not tests)
   until green with clean output.

### `strict-tdd`

Classic red-green-refactor: no production code without an observed failing test;
one behavior per cycle; minimal code to green; refactor while green. Choose this for
high-risk logic, unfamiliar domains, or when the user wants the tightest possible
feedback loop and accepts the cost. If a test errors instead of failing, fix the
setup; if it passes immediately, it tests existing behavior — rewrite it.

### `lean`

For spikes and throwaway prototypes only: implement, then run the plan's checks at
the end. Anything built this way stays labeled throwaway; promoting it to kept code
re-enters the workflow at design.

## Universal rules (every mode)

- **Permanent bug fixes keep observed-red.** Write the regression test (or
  executable reproduction) from the diagnosis contract or recorded inline
  diagnosis and watch it fail against the pre-fix behavior before fixing. This
  applies to every kept-code mode and cannot be disabled by project preference.
  Record the exact command and failing result in the selected backend's task Result; for light work,
  record it in the host task tracker or an explicit execution evidence block.
  `lean` output is throwaway and must re-enter at design before becoming kept code.
  If reproduction is genuinely blocked, record the exact blocker and best
  available evidence, define the strongest executable proxy check, and get the
  applicable explicit exception authorization under the shared
  [authorization policy](../../checksum/references/authorization.md) before
  implementation (human acceptance interactively; expressly permitted policy
  decision in PR-gated mode). Carry that
  exception and residual risk into finish; never claim the proxy was observed
  failing against the original bug.
- **Containment uses a suppression check, not the permanent regression check.**
  Derive it from the affected symptom, observe it fail before containment and pass
  afterward, and keep it linked to the open diagnosis. This proves temporary
  restoration only; it does not discharge the permanent fix's observed-red rule.
- **No tautology.** A test's expected value never comes from executing the code
  under test, and a test never re-runs the implementation to compute "expected".
- **Assert real behavior, not mocks.** Mock only what cannot be used directly
  (network, clock, external services), and never assert on the mock as the outcome.
- **Never weaken a test to pass it.** Failing test means fix the code, or escalate
  a plan defect. Deleting assertions, loosening matchers, or special-casing inputs
  is falsifying evidence.
- **Proportionality.** Config, docs, generated files, and harness metadata get the
  narrowest direct validator (schema check, build, render), not an invented unit
  test — record the reason in the task result.
- **Pristine output.** Green with warnings or stray errors is not green.
