#!/usr/bin/env python3
"""
Find and replace LaTeX-hostile Unicode characters in Obsidian markdown files.
Usage:
  python3 fix_unicode.py [--fix] [path]
  Default path is current directory. Without --fix, runs in dry-run mode.
"""

import sys
from pathlib import Path

# Map of problematic chars -> replacements
# Extend this as Quartz surfaces more warnings
REPLACEMENTS = {
    '\u201c': '"',   # LEFT DOUBLE QUOTATION MARK
    '\u201d': '"',   # RIGHT DOUBLE QUOTATION MARK
    '\u2018': "'",   # LEFT SINGLE QUOTATION MARK
    '\u2019': "'",   # RIGHT SINGLE QUOTATION MARK
    '\u00a0': ' ',   # NO-BREAK SPACE
    '\u202f': ' ',   # NARROW NO-BREAK SPACE
#   '\u2013': '--',  # EN DASH
#   '\u2014': '--',  # EM DASH (bonus: you hate these anyway)
    '\u2026': '...', # HORIZONTAL ELLIPSIS
}

def process_file(path: Path, fix: bool) -> list[tuple[int, str, str]]:
    """Returns list of (line_num, original_line, fixed_line) for affected lines."""
    text = path.read_text(encoding='utf-8', errors='replace')
    hits = []
    for i, line in enumerate(text.splitlines(), 1):
        fixed = line
        for bad, good in REPLACEMENTS.items():
            fixed = fixed.replace(bad, good)
        if fixed != line:
            hits.append((i, line, fixed))
    
    if fix and hits:
        fixed_text = text
        for bad, good in REPLACEMENTS.items():
            fixed_text = fixed_text.replace(bad, good)
        path.write_text(fixed_text, encoding='utf-8')
    
    return hits

def main():
    fix = '--fix' in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    root = Path(args[0]) if args else Path('.')

    md_files = sorted(root.rglob('*.md'))
    total_files, total_lines = 0, 0

    for path in md_files:
        hits = process_file(path, fix)
        if hits:
            total_files += 1
            total_lines += len(hits)
            print(f"\n{'[FIXED]' if fix else '[DRY RUN]'} {path}")
            for lineno, orig, fixed in hits:
                # Show the offending chars as Unicode escapes for clarity
                escaped = orig.encode('unicode_escape').decode('ascii')
                print(f"  L{lineno}: {escaped}")

    print(f"\n{'Fixed' if fix else 'Would fix'} {total_lines} lines across {total_files} files.")
    if not fix and total_files > 0:
        print("Re-run with --fix to apply changes.")

if __name__ == '__main__':
    main()
