# Influences and Evidence

Checksum synthesizes open frameworks and current research. This file records
what was adopted, what was rejected, and why — so future preference and skill
changes can argue against the original reasoning instead of rediscovering it.

## From [obra/superpowers](https://github.com/obra/superpowers)

**Adopted:**
- Interactive approval gates that never scale down with task size (brainstorming's
  "the ceremony scales; the approval gate never does"). Explicit PR-gated execution
  is a later extension: quality checks stay, while human review moves to the PR.
- Plans written for a zero-context implementer: exact files, signatures, commands,
  expected output; "no placeholders" as a plan failure class.
- Verification-before-completion: no claims without fresh evidence; the gate
  function (identify → run → read → then claim).
- Finish as a menu where integration is the human's decision; discard only on an
  explicit typed request; never force-push.
- Subagent-per-task execution with primary-agent verification, including "a
  subagent report is a claim, not evidence". Checksum keys this on whether a
  dispatch tool is present in the tool list rather than on host brand: Claude Code
  always ships one (Task); Codex ships one behind the opt-in
  `features.multi_agent` flag (`spawn_agent`). The Codex dispatch mechanics
  (`fork_turns: "none"` for clean-context spawns, `followup_task` for fix rounds,
  no short-polling `wait_agent`) come from superpowers' `codex-tools` reference.
- Task classification (spike / bounded / architectural → checksum's
  spike / light / full). Superpowers' "when in doubt, take the heavier path"
  ratchet is replaced with asking: the user owns the weight decision, at
  classification time and when scope grows mid-task.
- obra/superpowers'
  [systematic-debugging skill](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md)
  contributes its useful core: preserve and reproduce the failure, locate the
  failing boundary, trace bad state to its source, compare working and failing
  paths, and test one falsifiable hypothesis at a time before implementing a
  permanent correction.

**Rejected:**
- Strict TDD as an iron law ("delete the code and start over") — see research below.
- Debug as rigid four-phase ceremony for every technical issue. Checksum makes it
  an entry/recovery mode with a compact diagnosis contract; most fixes remain a
  light chat flow. Its hypothesis limit is an escalation point, not proof that the
  architecture is wrong. The operational policy, including approved pre-cause
  containment, lives in the
  [debug skill](../skills/checksum-debug/SKILL.md).
- The fixed, non-configurable methodology — checksum is preference-driven.
- Session-start hook injection and rationalization-table tone; checksum relies on
  skill descriptions and explicit invocation, and keeps failure-mode tables short.
- Keeping worktrees until a PR lands — in stacked flows checksum removes a
  delivered task's worktree at task finalize; the branch and PR carry the work,
  and feedback checks the branch out fresh. (The never-force-remove rule for
  worktrees with uncommitted files is kept.)
- Code-heavy plan bodies (full implementation code inside plan tasks) — that writes
  the implementation twice, once as unverified pseudo-code that goes stale on
  contact with reality. Checksum plans are contract-heavy instead: exact names,
  signatures, interfaces, and acceptance checks; code blocks only where the content
  *is* the contract (test assertions, schemas). Implementation bodies get written
  once, during execution, with compiler and test feedback.
- Committing specs and plans to the repository as a matter of course — checksum
  artifacts are working papers, excluded from every changeset unless the user
  explicitly asks. At plan finalize they are distilled into a condensed record
  that ships as the PR description (or commit body) and the artifact directory is
  cleared: the decisions stay referable with the code forever; the papers don't
  outlive it.
- Quiet, prose-y incompleteness handling — checksum's finalize (task- and
  plan-scoped) opens with a loud completeness scan that leads with every gap and
  its exact resume action, and refuses to proceed past any of them.
- A written plan document for every planned change — checksum keeps the planning
  ceremony (tasks, acceptance checks, approval) at every weight, but the plan
  *file* is a full-weight artifact; light work (most bug fixes) plans in chat.

## From [leoxlin/smolpowers](https://github.com/leoxlin/smolpowers)

**Adopted:**
- The minimal four-phase shape (design → plan → execute → finish) with a router
  skill selecting the phase from artifact presence and `Status:` lines — making the
  workflow resumable from artifacts, not session memory. Checksum extends this with
  per-task files (`tasks/NN-*.md`) whose frontmatter tracks claim state
  (`pending | claimed | done | blocked`), hard dependencies, and a `deliver` flag
  (`plan | commit | pr`) — so multiple agents can coordinate through the filesystem
  and tasks can ship as task-scoped commits or stacked PRs.
- Configuration layering (user-global then project) and template overrides.
- Proportionality: config/docs/generated files get the narrowest direct validator,
  not invented unit tests.
- Return-to-earlier-phase on stale artifacts rather than improvising forward.

**Rejected:**
- JSON config + Python loader — replaced with plain markdown preferences (optional
  YAML frontmatter) so free-form prose rules are first-class and there is no
  runtime dependency.
- ASD-STE100 controlled language for artifacts — clarity rules kept, the formal
  standard dropped.
- Artifact files for every activated change — checksum scales the artifact with
  task weight, not the ceremony.

## From [testdouble/han](https://github.com/testdouble/han)

**Adopted:**
- Dual-host distribution: one repo, `.claude-plugin/` + `.codex-plugin/` manifests
  over a shared `skills/` tree, with marketplace files for both hosts.
- Templates and rules split into `references/` so SKILL.md stays small and the
  heavy material loads only when needed (progressive disclosure).
- Evidence rules as standalone documents that multiple skills cite.

**Rejected (for now):**
- The multi-plugin suite decomposition — checksum ships as one plugin until it
  earns splitting.
- Specialist agent rosters — the two dispatch prompts (implementer, adversarial
  reviewer) live as reference templates instead.

## Composition with Beads and GasCity

The integration separates method, work storage, execution host, and authorization:

- [Beads](https://github.com/gastownhall/beads) supplies native work IDs,
  dependency-aware readiness and atomic claims. Its records can carry checksum
  design, plan, evidence and review without a second Markdown task tracker.
- [GasCity](https://github.com/gastownhall/gascity) supplies scheduling, sessions,
  workspaces and formula composition. Its methodology contracts are an adapter
  boundary, not a reason to copy checksum's skills into another pack.
- The installed CLI surfaces inspected for this work were Beads **1.2.2** and
  GasCity **1.4.1**. The inspected `gascity-packs` revision was
  `3b3b89f2011e06d84459aa7bea1552382f13930a`. These are compatibility observations,
  not promises that future upstream versions preserve every contract.
- GasCity's artifact schemas remain adapter concerns. They do not force the
  standalone method to adopt a heavier design format. Beads is authoritative in
  city mode; required host artifacts are projections with source references.
- Human approval and quality validation are different. The interactive default
  keeps local approval; a scoped PR-gated run can validate design/plan and prepare
  a reviewed PR without inventing human approval. Neither policy allows an agent
  to call a failing or blocked result complete.
- Beads claim atomicity is not dependency validation, filesystem isolation, or a
  distributed lock across disconnected stores. Separate provider roles do not
  prove independent review without actual provider/model provenance.

**Rejected:** a GasCity-specific methodology fork; bidirectional task-file/Beads
mirroring; a workflow engine inside checksum; deriving permissions from an
installed tool; and deleting durable work records like temporary working papers.
Leaving the orchestrator must not require abandoning the work record or method.

The operational contract is in
[workflow-contract.md](../skills/checksum/references/workflow-contract.md), the
policy in [authorization.md](../skills/checksum/references/authorization.md), and
the host-specific integration in the [adapter](../adapters/gascity/README.md).

## Research shaping the testing default

- **Böckeler, ["TDD inside the agent loop — theater or actual value?"](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html)
  (Thoughtworks, 2026):** across batches, in-loop TDD showed no reliable quality
  gain at ~3-8.5x token cost; non-TDD runs often ranked higher on design because
  they did full upfront design before any code; agents faked/skipped red steps and
  wrote tautological tests despite test-first ordering; mutation scores showed no
  TDD advantage. Hypothesis (Ördög): training data contains finished code, not
  step-by-step TDD processes.
- **Mathews & Nagappan, ["Test-Driven Development for Code Generation"](https://arxiv.org/abs/2402.13521)
  (2024); TDD-Agent (2026); TENET (2025-26):** providing tests/expected behaviors
  *before* implementation consistently improves correctness at function and
  repository level. The benefit is tests-as-executable-spec.

**Conclusion embodied in checksum:** move test-first thinking into the plan
(acceptance checks derived from the design before implementation exists), keep an
anti-tautology rule and a bug-fix observed-red requirement, schedule refactoring as
a per-task checkpoint, and leave strict red-green as an opt-in preference.
Design pressure comes from the design phase; honesty comes from verification and
adversarial review, not from ritual ordering.

## Research shaping the review default

- **Self-preference bias:** LLM evaluators recognize and favor their own
  generations (Panickssery, Bowman & Feng,
  ["LLM Evaluators Recognize and Favor Their Own Generations"](https://arxiv.org/abs/2404.13076),
  2024). A clean-context subagent removes conversation bias but not model bias —
  executor and reviewer from the same model share blind spots.
- Checksum therefore defaults adversarial review to **cross-model**: the other
  host's CLI (`codex exec` from Claude Code, `claude -p` from Codex) reviews the
  work read-only, falling back to clean-context subagent, then a labeled
  structured self-pass. A reviewer's report is still a claim — blockers get
  verified against the code, and reviewer approval never substitutes for fresh
  verification evidence.
- Reviews run at **review strength**: top-tier models at the highest reasoning
  effort the CLI exposes (names pinned via the `reviewer-model` preference).
  Findings are incorporated before the human review gate — the user reviews the
  post-review state with findings and resolutions, not a to-do list.
- Review is **execute's exit step, per delivery unit** — each `commit`/`pr` task
  before it ships, plus a change-wide pass at the end — rather than a finish-phase
  step. Granular delivery means multiple reviews per plan; accepted cost. Finish
  verifies the review record exists instead of running reviews.

## Goals features

- **Claude Code `/goal`** ([docs](https://code.claude.com/docs/en/goal)): per-turn
  evaluator model judging the condition from the transcript only.
- **Codex `/goal`** ([docs](https://developers.openai.com/codex/use-cases/follow-goals)):
  `features.goals`, pause/resume/clear, suited to multi-hour runs.

Both reward the same plan property: a completion condition stated as exact commands
with expected output plus scope constraints. Checksum's plan template carries a
`Completion Condition` section for this; execution surfaces proof output into the
transcript so evaluators can judge. Goals do not grant authority for Git actions or
external effects: those belong to finish under the selected authorization policy.

## Distribution learnings (from installing this plugin)

- **Claude Code** installs from marketplaces only; local directories work via
  `claude plugin marketplace add <path>` — *unless* an enterprise managed policy
  restricts sources to an allowlist (specific `github:` repos and `pathPattern:`
  entries such as `/claude-plugins-dev$`). On managed machines, register the clone
  through an allowed path (symlink or clone named to match the pattern) or publish
  to an allowlisted GitHub org. The install script surfaces the policy error and
  hints at this.
- **Codex** has no non-interactive plugin install; the reliable local mechanism is
  placing (symlinking) skill directories under `$CODEX_HOME/skills/`, which Codex
  hot-reloads. Goals require a one-time `codex features enable goals`.
- Skill names are prefixed (`checksum-*`) because Codex does not reliably namespace
  skills by plugin the way Claude Code does (`/checksum:...`).
