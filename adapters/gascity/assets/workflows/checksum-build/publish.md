# Finish under the portable authority, not the host's default publisher

Load `checksum-host.binding` and `checksum.checksum-finish`. This replaces the
upstream publish body; do not run the inherited publisher, launch `publish`,
or duplicate delivery side effects. The shared finish skill performs its full
checks once here, then only allowed delivery.

Read the explicit portable root Authority and the launch inputs persisted on
this workflow root: `gc.var.push` and `gc.var.open_pr` (missing means false).
Defaults remain `push=false` and `open_pr=false`. PR-gated is a policy selection,
not evidence of launch authority. A true flag narrows the recorded action
allowlist; it cannot expand it. Require push permission for a branch push,
and PR create/update permission for the corresponding action. Never infer a
remote, repository, base, branch, completion set, or authority from a role name.
NEVER merge, write the default branch, deploy, force-push, delete work state,
or perform unrelated external effects.

Work only in `checksum.work_dir` on `checksum.branch`. Its HEAD must be the
revision the review loop approved (`gc.build.code_review_subject_revision`),
which must descend from `checksum.integrated_revision`, with a clean tree;
otherwise block with `gc.failure_class=checksum_delivery_blocked`. Finish
verifies that integration; it never integrates or rebases here.

Before delivery, revalidate checksum policy against the current repository and
work branch: design/plan validation, task acceptance and native dependencies,
complete retained verification evidence, cross-model review with actual model
provenance, and exact reviewed revision. A direct implementation entrypoint has
no built-in aggregate review stage; missing aggregate review/evidence blocks
delivery here. Request host-routed review; do not self-review or spawn subagents.
Unknown or changed evidence, missing authority, or exhausted repair attempts
records Blocked; never treat a generated report or artifact schema pass as proof.

If flags disable delivery, retain the work and record an explicit no-op; do not
push or create/update a PR. If enabled and authorized, let checksum-finish do the
single scoped push/PR action, recording the actual result and URL. Retain the
portable root and task records for standalone resume and PR feedback.
If the portable root requires delivery, disabled flags are a delivery blocker:
leave that root Active and fail this stage rather than declaring overall success.
Only a run whose recorded deliverable needs no external delivery may finish with
a successful no-op. Failed delivery likewise leaves the portable root Active.

Project the result into both this claimed publish bead and its workflow root:
`gc.build.publish_status=published|noop|failed`,
`gc.build.publish_action=push|pr|push_pr|noop|failed`,
`gc.build.publish_recorded_at=<UTC timestamp>`,
`gc.build.publish_artifact_path=<absolute result projection path>`,
`gc.build.publish_reason=<machine-readable reason>`, and
`gc.build.publish_remote_status=<observed status>`.
Keep `checksum.delivery_status` and `checksum.delivery_url` plus full delivery/
blocking evidence in the portable Handoff consistent with that projection.
Write the result artifact under the resolved artifact root when available.
Only after both records persist, set claimed-step `gc.outcome=pass` for a
successful authorized result/no-op, or `gc.outcome=fail` and
`gc.failure_class=checksum_delivery_blocked` for a failed/blocked result; then
close only that claimed step with a concise reason. No merge occurs here.
