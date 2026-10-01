#!/bin/sh
# Install checksum into Claude Code, Codex, and/or Pi.
#
# Usage:
#   scripts/install-local.sh [--claude] [--codex] [--pi] [--copy] [--uninstall]
#
# With no host flag, installs to every host whose CLI/home is present.
#   --copy       Copy skill dirs instead of symlinking (Codex and Pi)
#   --uninstall  Remove what this script installed
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
CODEX_SKILLS="$CODEX_HOME/skills"
PI_AGENT_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
PI_SKILLS="$PI_AGENT_DIR/skills"

do_claude=false
do_codex=false
do_pi=false
mode=install
sym_link=true

for arg in "$@"; do
  case "$arg" in
    --claude) do_claude=true ;;
    --codex) do_codex=true ;;
    --pi) do_pi=true ;;
    --copy) sym_link=false ;;
    --uninstall) mode=uninstall ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

# Default: target whatever is present on this machine.
if ! $do_claude && ! $do_codex && ! $do_pi; then
  command -v claude >/dev/null 2>&1 && do_claude=true
  [ -d "$CODEX_HOME" ] && do_codex=true
  command -v pi >/dev/null 2>&1 && do_pi=true
  if ! $do_claude && ! $do_codex && ! $do_pi; then
    echo "No supported host found (claude CLI, $CODEX_HOME, or pi CLI). Nothing to do." >&2
    exit 1
  fi
fi

claude_install() {
  if ! command -v claude >/dev/null 2>&1; then
    cat >&2 <<EOF
claude CLI not found. Install manually inside Claude Code:
  /plugin marketplace add $ROOT
  /plugin install checksum@checksum
EOF
    return 1
  fi
  if out=$(claude plugin marketplace add "$ROOT" 2>&1); then
    echo "claude: marketplace 'checksum' registered from $ROOT"
  elif printf '%s' "$out" | grep -qi 'already'; then
    # Already registered; refresh it to pick up local changes.
    if ! claude plugin marketplace update checksum; then
      printf '%s\n' "$out" >&2
      echo "claude: FAILED to refresh existing marketplace" >&2
      return 1
    fi
  else
    printf '%s\n' "$out" >&2
    echo "claude: FAILED to register marketplace from $ROOT" >&2
    if printf '%s' "$out" | grep -qi 'enterprise policy'; then
      cat >&2 <<'EOF'
claude: an enterprise policy restricts marketplace sources. If the allowlist
claude: includes a pathPattern (e.g. /claude-plugins-dev$), register through a
claude: matching path instead:
claude:   ln -s <this clone> ~/src/claude-plugins-dev
claude:   claude plugin marketplace add ~/src/claude-plugins-dev
claude:   claude plugin install checksum@checksum
claude: or publish the repo to an allowlisted GitHub org.
EOF
    fi
    return 1
  fi
  if claude plugin install checksum@checksum; then
    echo "claude: installed checksum@checksum"
  else
    echo "claude: FAILED to install checksum@checksum" >&2
    return 1
  fi
}

claude_uninstall() {
  command -v claude >/dev/null 2>&1 || { echo "claude CLI not found" >&2; return 1; }
  claude plugin uninstall checksum@checksum || true
  claude plugin marketplace remove checksum || true
  echo "claude: uninstalled"
}

codex_install() {
  mkdir -p "$CODEX_SKILLS"
  for dir in "$ROOT"/skills/*/; do
    name=$(basename "$dir")
    dest="$CODEX_SKILLS/$name"
    rm -rf "$dest"
    if $sym_link; then
      ln -s "${dir%/}" "$dest"
    else
      cp -R "${dir%/}" "$dest"
    fi
    echo "codex: $dest $($sym_link && echo '->' "${dir%/}" || echo '(copied)')"
  done
  echo "codex: done. Codex picks up skill changes automatically."
  echo "codex: for goals support, run once: codex features enable goals"
}

codex_uninstall() {
  for dir in "$ROOT"/skills/*/; do
    dest="$CODEX_SKILLS/$(basename "$dir")"
    [ -e "$dest" ] || [ -L "$dest" ] || continue
    rm -rf "$dest"
    echo "codex: removed $dest"
  done
}

pi_install() {
  mkdir -p "$PI_SKILLS"
  for dir in "$ROOT"/skills/*/; do
    name=$(basename "$dir")
    dest="$PI_SKILLS/$name"
    rm -rf "$dest"
    if $sym_link; then
      ln -s "${dir%/}" "$dest"
    else
      cp -R "${dir%/}" "$dest"
    fi
    echo "pi: $dest $($sym_link && echo '->' "${dir%/}" || echo '(copied)')"
  done
  echo "pi: done. Restart Pi or run /reload to discover changes."
}

pi_uninstall() {
  for dir in "$ROOT"/skills/*/; do
    dest="$PI_SKILLS/$(basename "$dir")"
    [ -e "$dest" ] || [ -L "$dest" ] || continue
    rm -rf "$dest"
    echo "pi: removed $dest"
  done
}

status=0
if $do_claude; then
  if [ "$mode" = install ]; then claude_install || status=1; else claude_uninstall || status=1; fi
fi
if $do_codex; then
  if [ "$mode" = install ]; then codex_install; else codex_uninstall; fi
fi
if $do_pi; then
  if [ "$mode" = install ]; then pi_install || status=1; else pi_uninstall; fi
fi
exit $status
