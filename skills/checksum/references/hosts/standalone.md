# Standalone host binding

Use with `execution-host: standalone`. This binding ships with the router skill,
so a standalone installation needs no GasCity pack. The shared methodology owns
review criteria; this document supplies the Claude Code/Codex invocation route.

## Cross-model review

From Claude Code, prefer the installed authenticated **Codex CLI**. From Codex,
prefer **Claude Code**. Other hosts may use either, provided actual model
identities differ. Verify availability and current flags through local CLI help,
and resolve `reviewer-model` to an available top-tier model and its highest
supported effort. The existing `reviewer-model: codex=<name>, claude=<name>`
preference remains supported: select the entry for the reviewer CLI, not the
implementer. Do not hard-code a model name that will age with providers.
Missing authentication/permission or an unavailable required model is a reported
limitation, not evidence of a completed review.

Create an absolute `$REVIEW_INPUT` file containing the shared
[review prompt](../../../checksum-execute/references/adversarial-review.md#reviewer-dispatch-prompt-all-rungs),
complete design/plan/task records, full tracked and untracked diff, and relevant
source context. Do not send private code to another provider without permission.
Use fresh sessions, not the implementer's resumed conversation.

For Codex (set `$REVIEW_MODEL` and `$REVIEW_EFFORT` to verified supported values):

```sh
codex exec --sandbox read-only --ephemeral \
  --model "$REVIEW_MODEL" \
  --config "model_reasoning_effort=\"$REVIEW_EFFORT\"" \
  - < "$REVIEW_INPUT"
```

For Claude Code, this prompt-complete route disables model tool use and MCP:

```sh
claude -p --model "$REVIEW_MODEL" --effort "$REVIEW_EFFORT" \
  --tools "" --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
  --disable-slash-commands --no-session-persistence < "$REVIEW_INPUT"
```

A tool-less reviewer cannot inspect references: include actual content, and let
it report missing context instead of approving unseen code. If repository-reading
tools are needed, configure a separately verified read-only review environment.
The Codex filesystem sandbox is not a blanket prohibition on MCP/external tools;
inspect and disable side-effect-capable integrations. Never use permission or
sandbox bypass flags. Host-managed settings, hooks and policy still apply.

Bound invocation time using the host's timeout mechanism. Record actual provider,
model, effort, command/options, reviewed revision, result and limitations.
On error/timeout, use the next permitted reviewer rung; if the project requires
cross-model review, block rather than quietly substitute a self-pass.

## Execution and ownership

The [delegation reference](../../../checksum-execute/references/delegation.md)
defines native subagent versus inline execution. The primary owns the selected
root's scheduling and verifies child results. Backend claiming remains in the
selected backend reference. This binding neither grants Git authority nor changes
interactive approval defaults.
