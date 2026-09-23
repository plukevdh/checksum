# Apply checksum review findings

Apply `checksum-host.binding` preflight, then load `checksum.checksum-execute`.
Read the independent review report for this iteration and its
`code_review.acceptance_verdict` and `code_review.reviewed_revision`.

**Reviewer approved and the workspace HEAD equals the reviewed revision:** make
no change. Write a short review summary under the build artifact root that
names the approved revision, then close with `code_review.verdict=done`.

**Reviewer approved but HEAD moved since the reviewed revision:** do not
accept a stale approval. Write the summary and close with
`code_review.verdict=iterate` so the new revision is reviewed.

**Findings remain:** work in the workspace named by the review context, on the
authorized work branch, within the completion set's scope. Fix blockers and
should-fixes with the smallest change; an unconfirmed cause routes through
`checksum.checksum-debug` first. Rerun the affected proof commands and read the
full output. Record each finding's disposition (fixed with evidence, or
declined with reasoning for the reviewer) in the portable root's review record.
Do not push, open PRs, or write the default branch. Then write the fix summary
and close with `code_review.verdict=iterate`; the next iteration re-reviews.

If the findings require scope the Authority does not grant, or the loop's
last attempt still has open blockers, record a Blocked result with the open
findings and next action in the Handoff and still close this lane with
`code_review.verdict=iterate`; the bounded check owns the loop termination.

Close with the exact claimed bead ID and quoted metadata only:

```bash
bd update "$CLAIMED_BEAD_ID" \
  --set-metadata 'gc.outcome=pass' \
  --set-metadata 'code_review.verdict=done' \
  --set-metadata 'code_review.report_path=<summary path>' \
  --set-metadata 'code_review.output_path=<summary path>'
bd close "$CLAIMED_BEAD_ID" --reason 'Checksum review approved at <sha>'
```

Do not invoke provider-native subagents; this lane is the fix delegation.
