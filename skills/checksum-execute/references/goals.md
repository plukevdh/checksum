# Optional standalone goals

A host goal feature can continue toward the plan's measurable completion condition.
It is optional, never a core dependency or an authority source.

For standalone execution, `goals: offer` (default) offers once for a long plan,
`auto` sets a goal if permitted, and `never` skips. Under PR-gated execution do not
insert a routine human wait for a goal; use an already permitted feature or skip.
With GasCity do not install a competing goal loop: scheduler and resume belong
to the host.

Use measurable results, exact proof commands, scope boundaries and a finite bound:

```
Every task in <work record> has observed passing acceptance checks;
<full verification commands> exit 0 with expected results;
no changes outside <scope>. Stop after <N> attempts/turns if not met.
```

Surface proof in the transcript and retain it in the selected backend. Goals
never authorize commit, push, PR, deployment or other effects; delivery remains
finish's responsibility under the run's authorization. Budgets and blockers stop
the goal and produce durable results, not repeated polling or automatic resets.
