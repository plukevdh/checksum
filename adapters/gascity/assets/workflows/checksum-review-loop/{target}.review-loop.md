# Checksum review loop control

Each iteration runs two GasCity lanes: `independent-review` (reviewer role,
report-only, actual model identity must differ from the implementer) and
`apply-findings` (implementer role, scoped fixes in the authorized workspace).
The apply lane owns `code_review.verdict=done|iterate` and
`code_review.report_path`; the inherited
`implementation-review-approved.sh` check repeats this loop until the latest
verdict is `done` or `max_attempts` is exhausted.

`done` means the reviewer approved a revision that the apply lane then left
unchanged. A round that changes source always ends `iterate` so the next
iteration re-reviews the new revision. Exhausting attempts closes this stage
with `gc.outcome=fail`; record the open findings and the last reviewed revision
in the portable root Handoff as a Blocked result with next action. Never lower
the bar to force `done`, and never continue through provider-native subagents.
