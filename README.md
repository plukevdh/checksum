# checksum

A minimal, evidence-driven development workflow for coding agents:

**design → plan → execute → finish**, with **debug when the cause is unknown**

One methodology, usable directly in Claude Code and Codex or through an
orchestrator. The standalone file-backed workflow has no runtime dependencies.
Beads is an optional work backend; the GasCity adapter supplies orchestration,
not a second copy of the development method.

## Philosophy

- **Design is where quality is won.** Data shapes, contracts, and edge cases get
  decided before code exists. Evidence shows this beats letting architecture emerge
  from incremental implementation — or from incremental tests.
- **Tests as spec, not ritual.** Acceptance checks are written into the plan from
  the design, before implementation, and become real tests during execution.
  Strict in-loop red-green TDD is available as a preference, not imposed — research
  on agents doing TDD shows the ritual costs 3-8x tokens without reliable quality
  gains. Observed-red stays mandatory where it's cheap and meaningful: bug-fix
  regressions.
- **Evidence over claims.** No phase completes on "should work". Fresh command
  output, complete and read, or the claim isn't made.
- **Diagnose before fixing.** Debug is an entry and recovery mode, not another
  mandatory phase: reproduce, locate the failing boundary, test one falsifiable
  hypothesis at a time, then hand a causal diagnosis and regression condition to
  the appropriately light or full fix flow.
- **The artifact scales, the quality checks don't.** Every change gets design
  thinking, a plan with acceptance checks, independent review, and verified
  evidence. Interactive mode keeps your approval before implementation and local
  review before delivery. Explicit PR-gated runs do the work autonomously on a
  work branch; you review the PR before merge.
- **Artifacts are working papers.** Design and plan files are never committed
  unless you explicitly ask. Decisions are distilled into the PR description or
  commit body before temporary papers are cleared. Beads work records are retained,
  not deleted as temporary artifacts.
- **Capability-adaptive.** Execution dispatches a fresh subagent per task when the
  current standalone harness exposes a native dispatch tool, with the primary
  agent verifying every result. Without one it runs inline and uses `/goal`, where
  available. Under GasCity, the city owns scheduling and workspaces; checksum
  workers execute only their assigned work.

## Install

### From a local clone (both hosts)

```bash
git clone https://github.com/plukevdh/checksum && cd checksum
scripts/install-local.sh          # targets every host present; or --claude / --codex
```

For Claude Code this registers the repo as a local marketplace and installs the
plugin (`claude plugin marketplace add . && claude plugin install checksum@checksum`).
For Codex it symlinks `skills/*` into `~/.codex/skills/`, so edits to the clone are
live immediately (use `--copy` for a frozen copy). `--uninstall` reverses either.
To use goals during execution, enable them once: `codex features enable goals`.

> **Enterprise-managed Claude Code:** managed policies can restrict marketplace
> sources to an allowlist. If registration fails with a policy error, register the
> clone through an allowed `pathPattern` (e.g. symlink it to a directory named
> `claude-plugins-dev`) or publish to an allowlisted GitHub org — the script prints
> the specific hint when it hits this.

### Claude Code, from GitHub

```
/plugin marketplace add plukevdh/checksum
/plugin install checksum@checksum
```

### Codex, step by step

Codex discovers skills from `$CODEX_HOME/skills/` (default `~/.codex/skills/`) and
hot-reloads changes; there is no non-interactive plugin install. Either run the
script above with `--codex`, or do it manually:

```bash
git clone https://github.com/plukevdh/checksum ~/src/checksum
mkdir -p ~/.codex/skills
for s in ~/src/checksum/skills/*/; do
  ln -sfn "${s%/}" ~/.codex/skills/"$(basename "$s")"
done
```

(Symlinks keep the install live as the clone updates; `cp -R` instead for a frozen
copy.) Then enable the features checksum takes advantage of:

```bash
codex features enable goals          # /goal - autonomous runs against the plan's completion condition
codex features enable multi_agent    # optional: spawn_agent - flips execution to subagent-per-task
```

Verify inside Codex with `/skills` (all six `checksum*` skills should list) and
start with `$checksum <what you want to build>`. Cross-model review additionally
wants the `claude` CLI installed and authenticated so Codex can dispatch reviews to
it; without it, review falls back to a clean-context subagent.

## Use

Invoke the router and describe the change:

- Claude Code: `/checksum:checksum <what you want to build>`  (or just describe the
  task — the skills activate when relevant)
- Codex: `$checksum <what you want to build>`

The router sends unexplained failures to debug before entering the build loop,
classifies the resulting change (spike / light / full), and routes through the
phases under the selected authorization policy. Debug produces a diagnosis contract — reproduction,
evidence, causal confidence, fix boundary, and regression condition — rather than
implementation.

The default remains **files + standalone + interactive**:

| Phase | Output (full weight, files backend) | Interactive gate |
|---|---|---|
| design | `docs/checksum/YYYY-MM-DD-<slug>/design.md` | you approve the design |
| plan | `.../plan.md` — tasks with spec-derived acceptance checks | you approve the plan |
| execute | implementation task by task, evidence per task, adversarial review per delivery unit | agent stops on blockers |
| finish | loud completeness scan + fresh verification + condensed record + cleanup | **you review locally before any commit/push/PR/worktree cleanup** |

Finish runs at two scopes: **task finalize** ships a delivery-flagged task (stacked
commit/PR, then its worktree is cleaned) and **plan finalize** verifies the
integrated whole, ships the condensed plan record, and clears the working papers.
Anything incomplete is reported loudly — every gap with its exact resume action —
and finalize refuses to proceed past it.

On a bug or unexpected failure, invoke `$checksum-debug` in Codex or
`/checksum:checksum-debug` in Claude Code directly, or let the checksum router select
it. Diagnosis returns to the same user-chosen light/full flow; it does not force a
written plan.

With the default files backend, light-weight tasks present design and plan in chat
instead of creating files. Beads-backed work persists even a light plan so another
session can resume it. Temporary artifact files are never committed unless you ask.

Resume any time with "resume checksum" and the work reference — phase selection
is driven by the selected backend's records, not session memory.

## Compose storage, execution, and authorization

These choices are independent:

| Setting | Default | Alternative |
|---|---|---|
| `work-backend` | `files` | `beads` — authoritative work graph, also usable without GasCity |
| `execution-host` | `standalone` | `gascity` — city-owned scheduling and workspaces |
| `approval-policy` | `interactive` | `pr-gated` — scoped autonomous work through PR delivery, never merge |

For standalone Beads use, add to your project preferences:

```markdown
## general
- work-backend: beads
```

Initialize and configure Beads separately; checksum does not install it, initialize
a database, or migrate existing work silently. The installed `bd` CLI and its
storage dependencies are required only for this backend. See the
[Beads mapping](skills/checksum/references/backends/beads.md) for commands, record
layout, claiming, and resume semantics.

Beads replaces task files, not the method. A run has one authoritative backend:
do not maintain both bead status and Markdown task status. Generated documents
needed by an external host are projections, not a second work tracker.

The [GasCity adapter](adapters/gascity/README.md) composes the same skills with
Beads and PR-gated execution. Its integration details and compatibility checks
live outside the standalone skills. Leaving GasCity does not require abandoning
the Beads records: resume them with checksum under a newly recorded standalone
handoff and authorization context.

**PR-gated is explicit authorization, not an environment heuristic.** Merely
installing GasCity or selecting Beads grants no extra permissions. The run records
its scope, repository, work branch, base, allowed remote and actions before
execution. Existing prohibitions cannot be silently relaxed. The policy permits
scoped branch commits, pushes and PR updates, not default-branch writes, merges,
deployment, or unrelated effects. Blockers remain visible; missing evidence is
not transformed into a passing result.

The shared [workflow contract](skills/checksum/references/workflow-contract.md)
and [authorization policy](skills/checksum/references/authorization.md) define
these boundaries. These are instructions for agents and adapters, not a security
sandbox; enforce merge protection and tool permissions in the host/repository.

## Make it yours

Preferences are plain markdown — any sentence you write under a phase heading is
binding. Project file wins over the global one:

- `~/.checksum/preferences.md` — everywhere
- `.checksum/preferences.md` — this repo

```markdown
---
execute.testing: spec-anchored
execute.goals: offer
---

## design
- Always propose at least one approach with no new dependencies.

## finish
- commit: one conventional commit per plan
- push: only when already on a feature branch
```

Recognized settings and defaults: [skills/checksum/references/preferences.md](skills/checksum/references/preferences.md).
When you correct the workflow mid-session, the agent offers to record the
correction as a preference — that's the intended way this framework grows.

## Layout

```
skills/
  checksum/            router: weight classification, phase selection, preferences
  checksum-debug/      diagnostic entry/recovery mode + diagnosis contract
  checksum-design/     design phase + template
  checksum-plan/       plan phase + template
  checksum-execute/    execute phase + testing policy, goals, delegation refs
  checksum-finish/     finish phase + verification reference
.claude-plugin/        Claude Code manifest + marketplace
.codex-plugin/         Codex manifest
.agents/plugins/       Codex repo marketplace
adapters/gascity/      GasCity integration, referencing the shared skills
tests/                distribution checks and workflow evaluation scenarios
```

## Evaluate this branch

The composition work is being evaluated on `feat/composable-workflows`, separately
from mainline checksum. Do not point an existing live symlink installation at this
checkout unless you intend to change that host's workflow. Use a separate host
profile or install a frozen copy into an isolated `CODEX_HOME` for evaluation.
Do not import the adapter into a production city before reviewing its permissions.

Run the dependency-free repository checks with Node.js 20 or newer:

```bash
node --test tests/*.test.mjs
sh -n scripts/install-local.sh
git diff --check
```

With Beads installed, opt into the actual persistence/claim/dependency round trip
in a new disposable embedded store (isolated home/configuration, no remote):

```bash
CHECKSUM_TEST_BEADS=1 node --test tests/beads-roundtrip.test.mjs
```

Optional tool-compatibility checks report when their tool is unavailable.
Structural checks do not prove an LLM follows the workflow: use the
[evaluation scenarios](tests/scenarios.md) to inspect behavior and retained
evidence, including blocked runs and resumed PR feedback.

## Provenance

What was taken from (and deliberately changed against) obra/superpowers,
leoxlin/smolpowers, testdouble/han, and the current research on agents and TDD:
[docs/influences.md](docs/influences.md).

## License

MIT
