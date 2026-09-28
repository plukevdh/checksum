{{ define "checksum-binding" -}}
## Mandatory checksum binding

After the upstream claim protocol, but BEFORE acting on the claimed stage,
load skill `checksum-host.binding` and shared skill `checksum.checksum`.
If either skill is unavailable, record `gc.outcome=fail` with
`gc.failure_class=checksum_binding_unavailable` on the claimed bead and stop.
Do not fall back to vanilla GasCity methodology.

The binding constrains every inherited stage body: upstream uses "approved",
may offer interactive review, and may request a commit; none of those words
grants human approval, a human-wait gate, filesystem authority, or delivery
permission. Apply checksum policy first, preserve upstream artifact/schema/
dependency/close contracts only where compatible, and fail closed otherwise.
{{- end }}
