# Prepare the checksum review context

Apply `checksum-host.binding` preflight first. This step gathers evidence; it
never edits source or changes portable state.

Resolve the workflow root and the portable checksum root. Resolve the review
subject: the authorized work branch checked out in the workspace recorded as
`checksum.work_dir` on the workflow root (same-session drain) or, later, the
integrated work branch. Record the exact subject revision with `git rev-parse
HEAD` in that workspace; confirm the tree is clean or list the uncommitted paths
that belong to the completion set.

Write one review context file under the build artifact root containing: the
portable root ID, completion-set task IDs and their retained verification notes,
the design/plan revisions that were `Validated(policy)`, the subject workspace,
branch, base and revision, changed files versus base, the proof commands each
task recorded, and the author/implementer model identity with its configuration
provenance. Record that path on the workflow root as
`gc.build.code_review_context_path` and the revision as
`gc.build.code_review_subject_revision`.

Do not invoke provider-native subagents; the GasCity lanes below are the review
and fix delegation. Set claimed-step `gc.outcome=pass` only after both keys are
recorded, then close only this step.
