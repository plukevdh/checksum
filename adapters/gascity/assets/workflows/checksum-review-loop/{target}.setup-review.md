# Prepare the checksum review context

Apply `checksum-host.binding` preflight first. This step gathers evidence; it
never edits source or changes portable state.

Resolve the workflow root and the portable checksum root. The review subject
is always the work branch in `checksum.work_dir` at
`checksum.integrated_revision`. Verify `git -C <work_dir> rev-parse HEAD`
equals that revision and `git status --porcelain` is empty; a mismatch or a
dirty tree fails this step (`gc.failure_class=checksum_review_subject`) rather
than reviewing something `integrate` did not verify.

Write one review context file under the build artifact root containing: the
portable root ID, completion-set task IDs and their retained verification notes,
the design/plan revisions that were `Validated(policy)`, the subject workspace,
branch, base and revision, changed files versus base, the proof commands each
task recorded, and the author/implementer model identity with its configuration
provenance. Record that path on the workflow root as
`gc.build.code_review_context_path` and the revision as
`gc.build.code_review_subject_revision` (equal to
`checksum.integrated_revision` at this point; the fix lane advances it).

Do not invoke provider-native subagents; the GasCity lanes below are the review
and fix delegation. Set claimed-step `gc.outcome=pass` only after both keys are
recorded, then close only this step.
