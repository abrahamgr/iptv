#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_root/.agents/skills"
target_dir="$repo_root/.claude/skills"

echo "Linking skills ..."

if [[ ! -d "$source_dir" ]]; then
  echo "Source skills directory not found: $source_dir" >&2
  exit 1
fi

mkdir -p "$target_dir"

for source_path in "$source_dir"/*; do
  if [[ ! -d "$source_path" ]]; then
    continue
  fi

  skill_name="$(basename "$source_path")"
  target_path="$target_dir/$skill_name"
  desired_target="../../.agents/skills/$skill_name"

  if [[ -L "$target_path" ]]; then
    current_target="$(readlink "$target_path")"

    if [[ "$current_target" != "$desired_target" ]]; then
      rm "$target_path"
      ln -s "$desired_target" "$target_path"
    fi

    continue
  fi

  if [[ -e "$target_path" ]]; then
    echo "Refusing to replace non-symlink path: $target_path" >&2
    exit 1
  fi

  ln -s "$desired_target" "$target_path"
done

echo "Skills linked successfully."

claude_md="$repo_root/CLAUDE.md"
agents_md_rel="AGENTS.md"

if [[ -L "$claude_md" ]]; then
  if [[ "$(readlink "$claude_md")" != "$agents_md_rel" ]]; then
    rm "$claude_md"
    ln -s "$agents_md_rel" "$claude_md"
    echo "CLAUDE.md symlink updated."
  fi
elif [[ -e "$claude_md" ]]; then
  echo "Refusing to replace non-symlink CLAUDE.md" >&2
  exit 1
else
  ln -s "$agents_md_rel" "$claude_md"
  echo "CLAUDE.md symlinked to AGENTS.md."
fi
