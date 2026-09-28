# [Change Name] Implementation Plan

> **For implementers:** Execute with the `checksum-execute` skill. Tasks live in
> the selected authoritative backend; claim before working, respect dependencies,
> and mark done only after observed passing checks. File examples below apply to
> the files mapping; replace links with stable record IDs for other backends.

**Status:** Draft
**Design:** [design record reference and revision]
**Revision and validation:** [content revision; human Approved or policy Validated;
actor/time/authority/criteria/outcome]
**Work context:** [root ID; repository/base/work branch/remotes; backend/host/policy;
method/effective preferences/run authority references]
**Goal:** [One sentence.]
**Tech:** [Languages, frameworks, key existing dependencies.]

## Global Constraints

- [Copied verbatim from the design. Every task implicitly includes these.]

## Completion Condition

[The machine-checkable definition of done, phrased so an evaluator reading only
terminal output can judge it. Exact commands, expected outcomes, and boundary
constraints. This block is ready to paste into `/goal` on hosts that support goals.]

> Example: `npm test` exits 0 with no failures, `npm run lint` reports 0 errors,
> and no files outside `src/retry/` and `tests/retry/` were modified.

## Task Index

| Task | Outcome | Depends | Deliver |
|---|---|---|---|
| [task record ID/reference] | [one line] | — | plan |
| [task record ID/reference] | [one line] | [dependency ID] | plan |

**Completion set:** [exact task IDs; risk follow-ups excluded]

## Handoff

[Current/next phase, assigned task, record revisions, validation and evidence,
authority, unresolved risk/block reason and next action. Persist on interruption.]

## Review and Delivery

[Review scope/revision, rung/provider/model/provenance, findings/resolutions;
commit hashes/PR URLs, pending delivery, independent merge state.]

## Full Verification

```
Run: <full suite / lint / typecheck / build commands, one per line>
Expect: <pass condition for each>
```

[The finish phase runs these fresh and traces each design success criterion to
evidence. Anything unlisted here will not be checked — list everything that matters.]
