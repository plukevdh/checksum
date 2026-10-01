# Preferences Format

Preferences are how the user grows this framework to fit them. They are plain
markdown — no schema, no loader script, no runtime dependencies. Any prose directive
under a phase heading is binding for that phase. Recognized settings below have
documented defaults; anything else is a free-form rule the phase skill must honor as
if it were written into the skill itself.

Recognized settings may also be written as YAML frontmatter at the top of the file
(flat `key: value` pairs, phase-scoped keys spelled `execute.testing`,
`finish.commit`, etc.). Frontmatter and headed sections are equivalent; if both set
the same key, frontmatter wins within its file. Free-form prose rules always live
under the phase headings.

Two locations, both optional:

| File | Scope |
|---|---|
| `~/.checksum/preferences.md` | every repository |
| `.checksum/preferences.md` | this repository (wins on conflict) |

Conflict is judged per directive, not per file: keep every directive that does not
contradict a project-level one.

## Recognized settings

### `## general`

- `artifacts dir: <path>` — where artifact directories are created. Skills refer
  to this configured value as `<artifacts dir>`. Default: `docs/checksum`.
- `activation: manual | suggest` — `manual`: run only when explicitly invoked.
  `suggest` (default): when a design-bearing change starts without checksum, offer it
  once and respect the answer.

### `## debug`

- `containment: allow-with-approval | require-cause` — default
  `allow-with-approval`. A temporary production containment needs explicit user
  approval, rollback, monitoring, risk, an owner, and a durable removal follow-up;
  it is applied and delivered only through the normal checksum build and review
  flow, and diagnosis remains open. `require-cause` permits no deployed containment
  before a confirmed causal path; local diagnostic edits are allowed but reverted.
  A durable follow-up may be an external issue/ticket or a stable heading in a
  committed project tracking file, never a checksum artifact.
- `uncertain-fix: allow-with-approval | require-cause` — default
  `allow-with-approval`. Controls permanent corrections at probable or unknown
  root-cause confidence separately from temporary containment. Approval requires
  residual risk, rollback, a falsifying/monitoring signal, an owner, and a durable
  follow-up outside the current plan's completion set using either carrier
  described above.
- `hypothesis-limit: <positive integer>` — default `3`. After this many disproved
  or inconclusive hypotheses on one failure, stop and ask which direction to take;
  the limit is an escalation point, not evidence of an architectural defect. An
  explicit choice to continue grants and records a fresh budget.
- Free-form: required diagnostics, observability rules, incident conventions.

### `## design`

- `template: <path>` — replaces the built-in design template.
- Free-form: questions to always ask, sections to always include, architectural
  values ("prefer boring technology", "no new dependencies without a listed
  alternative"), documentation style.

### `## plan`

- `template: <path>` — replaces the built-in plan template.
- Free-form: task sizing rules, commit conventions, review requirements.

### `## execute`

- `testing: spec-anchored | strict-tdd | lean` — default `spec-anchored`.
  See the execute skill's `references/testing.md` for what each mode means and the
  evidence behind the default.
- `goals: offer | auto | never` — default `offer`. Whether to propose (or set) a
  `/goal` completion condition when starting execution on a host that supports goals.
- `delegation: auto | inline | subagent-per-task` — default `auto`, which follows
  actual capability: fresh subagent per task when a native dispatch tool is in the
  current tool list (for example, Claude Code's Task tool or Codex's `spawn_agent`
  when `features.multi_agent` is enabled), direct inline execution otherwise. Set
  explicitly to override on any host; do not assume a host has dispatch based on
  its name.
- `reviewer: auto | cross-model | subagent | self` — default `auto`: best available
  rung of the ladder (cross-model → clean-context subagent → structured self-pass).
  Adversarial review runs at the end of execution, once per delivery unit.
  Cross-model dispatches the review to another available agent CLI (currently
  documented recipes: `codex exec` / `claude -p`) so no model evaluates its own
  work; it needs that CLI installed and authenticated, and spends its tokens. Pi is
  a host, not a corresponding reviewer agent; the user chooses the agent running in
  Pi. If no supported separate reviewer CLI is available, fall down the ladder.
- `reviewer-model: codex=<name>, claude=<name>` — model each configured CLI should
  review with. Default: the strongest tier the CLI offers. Reviews always run at the
  highest reasoning effort the CLI exposes; pin exact names here as tiers evolve.
- `review-depth: standard | deep` — default `standard`; `deep` additionally asks
  the reviewer to trace every design edge case to a test and inspect test honesty
  line by line.
- `fix-attempt-limit: <positive integer>` — default `3`. After this many
  consecutive implementation attempts fail despite a confirmed cause, stop and ask
  whether to revise the fix boundary/plan, reopen diagnosis, or pause.
- Free-form: linting/formatting expectations, commit cadence, logging rules.

### `## finish`

- `commit: <instruction or never>` — e.g. `make one conventional commit`.
  Default: ask.
- `push: <instruction or never>` — e.g. `push only when already on a branch`.
  Default: ask.
- `pr: <instruction or never>` — e.g. `open a PR with the repo template`.
  Default: ask.
- `worktrees: clean | keep` — default `clean`: task finalize removes a delivered
  task's checksum-created worktree (the branch and PR carry the work); plan
  finalize removes the rest. Worktrees with uncommitted files are never
  force-removed.
- `artifacts: clear | keep` — default `clear`: plan finalize deletes the artifact
  directory once the condensed plan record has shipped as the PR description or
  commit body. `keep` retains artifacts with Status Complete.
- Free-form: changelog rules, PR description format, cleanup expectations.

Note: three rules are built in and not preference-removable: adversarial review,
the user's local review gate before any git action, and the exclusion of checksum
artifacts from every changeset (committed only on explicit request).

## Starter file

```markdown
---
execute.testing: spec-anchored
execute.goals: offer
execute.fix-attempt-limit: 3
---

# Checksum Preferences

## general
- activation: suggest

## debug
- containment: allow-with-approval
- uncertain-fix: allow-with-approval
- hypothesis-limit: 3

## execute
- reviewer: cross-model
- reviewer-model: codex=<top-tier codex model>, claude=<top-tier claude model>
- Run the formatter before declaring any task complete.

## finish
- commit: make one conventional commit per completed plan
- push: ask first
```

## Growing preferences over time

When the user corrects the workflow itself ("always show me the diff before
committing", "stop writing tests for config files"), offer to record the correction
in the appropriate preferences section so it holds in future sessions. Never edit
preferences without asking.
