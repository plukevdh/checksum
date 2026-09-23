# Verification Evidence Rules

**No completion claims without fresh verification evidence.** If the command did not
run after the final change, its result is unknown — say so instead of claiming.

## The gate function

Before any claim of passing, fixed, done, or working:

1. Identify the command that proves the claim.
2. Run it, complete and fresh.
3. Read the full output and exit status — count failures, read warnings.
4. Claim only what the output shows, with the evidence alongside.

## Evidence matrix

| Design success criterion | Implementation evidence | Command | Result |
|---|---|---|---|
| [exact criterion from design record] | [file / behavior / diff hunk] | `fresh command` | exit status + counts |

Every success criterion gets a row. A criterion with no provable row is unmet —
report the gap, don't paper over it.

Retain the matrix with tested revision in the selected backend's result/review
record and durable delivery package. Policy validation is not human acceptance;
an open PR proves neither merge nor deployment.

## Freshness and sufficiency

- A previous run proves the tree it ran on, not this one.
- A focused test does not prove the suite; a linter does not prove the build; the
  build does not prove behavior. Each claim gets its own proof.
- Subagent and tool reports of success are claims — verify against the diff and by
  rerunning.
- Include untracked files when inspecting the final diff.

## Unavailable checks

When an integration can't run here (missing credentials, absent service), record
the command attempted, the exact failure, and what remains unverified. An honest
gap beats a fabricated pass.
