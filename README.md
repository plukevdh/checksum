# checksum

A minimal, evidence-driven development workflow for coding agents:

**design → plan → execute → finish**, with **debug when the cause is unknown**

One shared skills library for Claude Code, Codex, and Pi, with zero runtime
dependencies — the entire framework is markdown. Built to start small and grow
with your preferences.

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
- **The artifact scales, the ceremony doesn't.** Every change gets design thinking,
  a plan with acceptance checks, your approval, and verified evidence — but only
  full-weight changes get artifact files. Light work (most bug fixes) runs the
  whole ceremony in chat. And whatever the weight: your yes before implementation,
  and your local review before any commit/push/PR, never scale away.
- **Artifacts are working papers.** Design and plan docs are never committed unless
  you explicitly ask — they stay out of every changeset. When the change ships, the
  plan is distilled into the PR description (or commit body) as the permanent
  record of the decisions, and the working papers are cleared.
- **Capability-adaptive.** Execution dispatches a fresh subagent per task when the
  current harness exposes a native dispatch tool, with the primary agent verifying
  every result. Without one it runs inline and uses `/goal`, where available, for
  long autonomous runs.

## Install

### From a local clone

```bash
git clone https://github.com/plukevdh/checksum && cd checksum
scripts/install-local.sh          # targets every host present; or --claude / --codex / --pi
```

For Claude Code this registers the repo as a local marketplace and installs the
plugin (`claude plugin marketplace add . && claude plugin install checksum@checksum`).
For Codex it symlinks `skills/*` into `~/.codex/skills/`, so edits to the clone are
live immediately (use `--copy` for a frozen copy). For Pi it symlinks `skills/*`
into `$PI_CODING_AGENT_DIR/skills/` (default `~/.pi/agent/skills/`). `--uninstall`
reverses any selected host install. To use goals during execution, enable them once:
`codex features enable goals`. The Pi local installer does not manage
package-manager installs; use `pi remove` for those.

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

### Pi, via its package manager

Pi can install this repository as a package directly from Git; it discovers the
existing `skills/` directory, so no Pi extension or duplicated skill files are
needed:

```bash
pi install git:github.com/plukevdh/checksum
```

In Pi, invoke the router explicitly with `/skill:checksum <what you want to build>`
(or let Pi load it when relevant). Use `/skill:checksum-debug` for direct diagnosis.
Manage the package with `pi list`, `pi update git:github.com/plukevdh/checksum`, and
`pi remove git:github.com/plukevdh/checksum`. Package-manager installs and the local
installer are separate; uninstall them using their corresponding mechanism.

Pi project-local package settings/resources are trust-gated. Review the source and
grant project trust when prompted. A personal package install avoids project-local
trust configuration. Skills are instructions, not executable Pi extensions.

Pi does not include a native `/goal` or built-in cross-model CLI dispatch for
optional workflow features. Checksum runs tasks inline,
uses evidence-based self-review when no clean-context subagent is available, and
does not attempt to invoke an unsupported `/goal`. If your Pi setup exposes a
subagent/dispatch tool, Checksum adapts to the capability actually present.

Verify installation in Pi with `/skill:checksum` (or `/skill:checksum-debug`) and
confirm Pi loads the six skills. Use `/reload` after manual skill changes.

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
- Pi: `/skill:checksum <what you want to build>`

The router sends unexplained failures to debug before entering the build loop,
classifies the resulting change (spike / light / full), routes through the phases,
and stops at every gate. Debug produces a diagnosis contract — reproduction,
evidence, causal confidence, fix boundary, and regression condition — rather than
implementation.

| Phase | Output (full weight) | Gate |
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

On a bug or unexpected failure, invoke `$checksum-debug` in Codex,
`/checksum:checksum-debug` in Claude Code, or `/skill:checksum-debug` in Pi directly;
you can also let the checksum router select it. Diagnosis returns to the same
user-chosen light/full flow; it does not force a written plan.

Light-weight tasks run the same phases and gates with design and plan presented in
chat instead of files. Artifact files are never committed unless you ask.

Resume any time with "resume checksum" — phase selection is driven by the artifacts
and their status lines, not session memory.

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
  checksum-finish/     finish phase + verification, adversarial review refs
.claude-plugin/        Claude Code manifest + marketplace
.codex-plugin/         Codex manifest
.agents/plugins/       Codex repo marketplace
                       Pi uses skills/ directly as a native package
```

## Provenance

What was taken from (and deliberately changed against) obra/superpowers,
leoxlin/smolpowers, testdouble/han, and the current research on agents and TDD:
[docs/influences.md](docs/influences.md).

## License

MIT
