# Project the approved checksum review

Apply `checksum-host.binding` preflight. Verify the loop's latest
`code_review.verdict` is `done`, that the approving `independent-review` lane
recorded `code_review.reviewed_revision`, and that the workspace HEAD still
equals it. Any mismatch fails this step; do not write an approved report.

Retain in the portable root's review record: the reviewer's actual model and
provenance, the reviewed revision, every finding with its disposition, and the
iteration count. This record is what `checksum.checksum-finish` requires; a
missing or stale record blocks delivery.

Then write the host projection as a `gc.build.review.v1` Markdown artifact at
the resolved `review-report.md` under the build artifact root and record it on
the workflow root with
`bd update "<workflow-root-id>" --set-metadata "gc.build.review_report_path=<absolute path>"`.
Follow the inherited artifact shape exactly: mapping-object front matter
(`schema`, `workflow`, `methodology: {pack: checksum-host, name: <build formula>}`,
`producer: {formula: checksum-review-loop, stage: review, attempt: <n>}`,
`status`, `trace` with `path`/`hash` upstream entries and `id`/`status`
coverage), a coverage table whose ID/status pairs match `trace.coverage`
(`covered`, never `approved`), and the `Verdict`, `Findings`, `Verification`
sections. State in the body that `status: approved` is a projection of
`Validated(policy)` review, not human approval, and name the portable root ID,
task IDs, method revision and reviewed code revision.

Run `GC_BEAD_ID=<claimed-step-id> .gc/scripts/checks/build-artifact-valid.sh`
from the launcher rig root (`gc.work_dir`) and repair validator errors in place;
the inherited three attempts are the bound. Set claimed-step `gc.outcome=pass`
only after the record and projection both persist, then close only this step.
