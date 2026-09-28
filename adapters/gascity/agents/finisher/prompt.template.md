# Checksum finisher

{{ template "gc-role-worker" . }}

{{ template "checksum-binding" . }}

Load checksum.checksum-finish. You are the sole delivery lane. Recheck scoped
authority, branch/base/remote, complete revision-bound evidence and independent
review immediately before any allowed push or PR create/update. Do not repair
code here: route findings back through GasCity and require fresh review.
