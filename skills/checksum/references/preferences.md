# Preferences format

Plain Markdown, no loader or mandatory runtime. Read optional
`~/.checksum/preferences.md` and `.checksum/preferences.md`; project directives
win conflicts, nonconflicting user directives remain. Direct instructions and
project prohibitions constrain every policy. Under `## general` or a phase heading,
prose is binding. Optional YAML frontmatter uses flat keys (`execute.testing`,
`finish.commit`); frontmatter wins over the same file's headed setting.

Record effective values and source provenance in the
[workflow contract](workflow-contract.md). Preferences cannot manufacture
[authorization](authorization.md). Never create/edit preferences without asking.

## General settings

- `work-backend: files | beads` — default `files`; one authoritative store.
- `execution-host: standalone | gascity` — default `standalone`.
- `approval-policy: interactive | pr-gated` — default `interactive`; PR-gated
  also requires an explicit scoped run authority. Selection alone grants nothing.
- `artifacts dir: <path>` — files backend temporary papers, default `docs/checksum`.
- `activation: manual | suggest` — default `suggest`: offer once for a
  design-bearing change and respect the answer. `manual` requires invocation.

## Debug settings

- `containment: allow-with-approval | require-cause` — default
  `allow-with-approval`. Requires complete containment risk/follow-up records and
  the applicable authorization decision. `require-cause` cannot be bypassed by host.
- `uncertain-fix: allow-with-approval | require-cause` — same default, separately
  governs permanent corrections at probable/unknown confidence. PR-gated decisions
  must be explicitly permitted by run authority, not called human approval.
- `hypothesis-limit: <positive integer>` — default `3`; exhaustion persists blocked
  evidence. Extensions require explicit authorization, direction and new budget.
- Prose may specify diagnostics, observability and incident rules.

## Design and plan settings

- `template: <path>` under the relevant phase replaces its built-in content
  template, not shared semantic criteria or authority.
- Prose may specify architectural values, questions, task sizing and conventions.

## Execute settings

- `testing: spec-anchored | strict-tdd | lean` — default `spec-anchored`;
  [testing](../../checksum-execute/references/testing.md) defines nonremovable
  honesty and defect regression rules. Lean is throwaway only.
- `goals: offer | auto | never` — default `offer`, optional standalone capability;
  never substitutes for host scheduling.
- `delegation: auto | inline | subagent-per-task` — default `auto`, native tool
  capability determines standalone dispatch. Host assignment constraints override
  autonomous task dispatch; permitted narrow helpers stay within assigned scope.
- `reviewer: auto | cross-model | subagent | self` — default `auto`: cross-model,
  clean-context helper, structured self-pass. Unavailable rungs are disclosed.
- `reviewer-model: <host-supplied provider/model mapping>` — optional exact models.
  Review uses strongest available tier/highest reasoning; concrete provider routing
  belongs to host, actual selection/provenance belongs in review record.
- `review-depth: standard | deep` — default `standard`; deep traces each edge
  case to a test and inspects test honesty line by line.
- `fix-attempt-limit: <positive integer>` — default `3`, then durable blocked state.
- Prose may specify formatting, logging or review requirements.

## Finish settings

- `commit`, `push`, `pr: <instruction or never>` — interactive default asks after
  local review; PR-gated follows explicit scoped authority, not inferred defaults.
  A project `never`/ask-first prohibition is not silently relaxed by a host.
- `worktrees: clean | keep` — default `clean` for authorized standalone
  checksum-created clean worktrees only. Hosted workspaces belong to the host.
- `artifacts: clear | keep` — default `clear` for temporary files only after
  durable distillation; never clears retained backend records or follow-ups.
- Prose may specify changelog/PR format and cleanup expectations.

Adversarial review, honest evidence and temporary-artifact exclusion remain
mandatory. Interactive local-review gates stay default; only explicitly authorized
PR-gated runs replace routine human waits with recorded policy validation.
