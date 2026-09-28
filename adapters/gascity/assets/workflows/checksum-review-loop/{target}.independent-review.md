# Independent checksum review lane

Apply `checksum-host.binding` preflight, then load `checksum.checksum-execute`
and its `references/adversarial-review.md`. Read the review context at
`gc.build.code_review_context_path` and any prior round's fix report.

Report your actual model identity and configuration provenance. If it is
unknown or matches the recorded author/implementer identity, do not review:
close with `code_review.acceptance_verdict=iterate`, a report stating the
separation failure, and `gc.failure_class=checksum_review_provenance`.

Review the exact recorded subject revision in the workspace named by the
context (`cd` there, verify `git rev-parse HEAD` equals
`gc.build.code_review_subject_revision` and `git status --porcelain` is empty;
a mismatch or dirty tree is a blocking finding, not something to repair). Cover the shared review checklist: behavior against the validated
design/plan and task acceptance, test evidence honesty (spec-anchored checks,
observed red for defects, first and final proof commands), scope discipline,
simplicity, and residual risk. Read only; never edit source, run fixes, or
publish.

Write the report under the build artifact root. Each blocker or should-fix
names a file/command/artifact and the task ID it belongs to. Retain the findings
and the reviewed revision in the portable root's review record before closing.

Close with explicit lane metadata (the loop check reads it):

```bash
bd update "$CLAIMED_BEAD_ID" \
  --set-metadata 'gc.outcome=pass' \
  --set-metadata 'code_review.acceptance_verdict=approve' \
  --set-metadata 'code_review.reviewed_revision=<git sha>' \
  --set-metadata 'code_review.output_path=<report path>'
bd close "$CLAIMED_BEAD_ID" --reason 'Checksum independent review: approve'
```

Use `code_review.acceptance_verdict=iterate` when any blocker or should-fix
remains. Do not set `code_review.verdict` or `code_review.report_path`; the
apply lane owns the loop verdict. Do not invoke provider-native subagents.
