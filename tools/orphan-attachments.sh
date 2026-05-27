#!/usr/bin/env bash
# find-orphaned-attachments.sh
# Finds files in attachments/ with no Obsidian ![[embed]] references in any .md file
#
# Usage: ./find-orphaned-attachments.sh [/path/to/vault]
#        Defaults to current directory.

set -euo pipefail

VAULT="${1:-.}"
ATTACHMENTS_DIR="$VAULT/attachments"

if [[ ! -d "$ATTACHMENTS_DIR" ]]; then
    echo "Error: attachments/ not found under '$VAULT'" >&2
    exit 1
fi

tmpfile=$(mktemp)
trap 'rm -f "$tmpfile"' EXIT

# ── Step 1: collect all ![[embed]] targets from .md files ────────────────────
#
# Obsidian embed syntax:  ![[filename.ext]]
#                         ![[filename.ext|340]]        (width)
#                         ![[filename.ext|340x200]]    (dimensions)
#                         ![[subdir/filename.ext]]     (rare but possible)
#
# grep -hoE            prints only the matching portion, from all files, no filename prefix
# [^]|]+               matches chars that are not ] or | (stops before |size or ]])
# First sed            strips the leading ![[
# Second sed           strips any leading path component (Obsidian resolves by basename)
# sort -u              deduplicate

find "$VAULT" -name "*.md" -not -path "*/.obsidian/*" -print0 \
    | xargs -0 grep -hoE '!\[\[[^]|]+' \
    | sed -E 's/^!\[\[//' \
    | sed -E 's|.*/||' \
    | sort -u > "$tmpfile"

embed_count=$(wc -l < "$tmpfile" | tr -d ' ')
echo "Found $embed_count unique embed targets across all markdown files."
echo ""

# ── Step 2: walk attachments/ and flag anything not in that set ──────────────
#
# -print0 / read -d ''     handles filenames with spaces, newlines, special chars
# grep -xF                 exact full-line match, no regex interpretation of the filename

orphans=()
while IFS= read -r -d '' filepath; do
    filename=$(basename "$filepath")
    if ! grep -qxF "$filename" "$tmpfile"; then
        orphans+=("$filepath")
    fi
done < <(find "$ATTACHMENTS_DIR" -type f -print0)

# ── Step 3: report ───────────────────────────────────────────────────────────

if [[ ${#orphans[@]} -eq 0 ]]; then
    echo "✓ No orphaned attachments found."
else
    echo "Orphaned attachments (${#orphans[@]} files):"
    printf '  %s\n' "${orphans[@]}"
    echo ""
    echo "── Dry-run delete command (review before executing) ──"
    echo "  printf '%s\\0' \"\${orphans[@]}\" | xargs -0 rm"
fi
