#!/usr/bin/env python3
"""
Find files in the vault's attachments/ directory that are not referenced
anywhere -- neither by an Obsidian [[wikilink]] / ![[embed]] in a markdown
file, nor by the rendered Quartz site in public/ (e.g. a CSS background
image, an <img> injected by a layout component, an og:image meta tag).

Quartz slugifies attachment filenames when it emits them ("Foo Bar.png" ->
"foo-bar.png"), so references found in public/ are compared against the
slugified name of each attachment.

Assumes `npx quartz build` has already populated public/.

Usage:
  orphan-attachments.py [--public DIR] [--attachments NAME] [-v] [-0] [VAULT]

  VAULT               path to the Obsidian vault (default: .)
  --public DIR        Quartz output directory (default: <repo>/public)
  --attachments NAME  attachments directory name inside the vault
                      (default: attachments)
  -v, --verbose       also list attachments referenced only by rendered output
  -0, --print0        print orphan paths NUL-separated (for `xargs -0 rm`)
"""

import argparse
import html
import os
import re
import sys
import unicodedata
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

# ── Quartz slug logic ─────────────────────────────────────────────────────────
#
# Port of slugifyFilePath() / slugifyPath() from @quartz-community/utils.
# The extension is preserved as-is; only the stem is transformed.


def quartz_slugify(path: str) -> str:
    path = path.strip("/")
    m = re.search(r"\.[A-Za-z0-9]+$", path)
    ext = m.group(0) if m else ""
    stem = path[: -len(ext)] if ext else path
    segments = []
    for seg in stem.split("/"):
        seg = re.sub(r"\s", "-", seg)
        seg = seg.replace("&", "-and-").replace("%", "-percent")
        seg = seg.replace("?", "").replace("#", "")
        segments.append(seg.lower())
    return "/".join(segments) + ext


def nfc(s: str) -> str:
    # macOS/iCloud filenames may come back NFD; Quartz output is NFC.
    return unicodedata.normalize("NFC", s)


# ── Step 1: markdown references ───────────────────────────────────────────────
#
# Obsidian syntax:  ![[filename.ext]]            embed
#                   ![[filename.ext|340]]         embed with width
#                   [[filename.ext]]              plain link (e.g. to a PDF)
#                   ![alt](attachments/f.png)     standard markdown
#
# Obsidian resolves by basename, so any leading path is stripped.

WIKILINK_RE = re.compile(r"!?\[\[([^\]|#]+)")
MDLINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)")


def markdown_refs(vault: str, attachments_name: str) -> set[str]:
    refs: set[str] = set()
    for root, dirs, files in os.walk(vault, followlinks=True):
        dirs[:] = [d for d in dirs if d != ".obsidian"]
        for fn in files:
            if not fn.endswith(".md"):
                continue
            try:
                with open(os.path.join(root, fn), encoding="utf-8", errors="replace") as f:
                    text = f.read()
            except OSError:
                continue
            for target in WIKILINK_RE.findall(text):
                refs.add(nfc(os.path.basename(target.strip())))
            for target in MDLINK_RE.findall(text):
                target = unquote(urlsplit(target).path)
                if f"{attachments_name}/" in target:
                    refs.add(nfc(os.path.basename(target)))
    return refs


# ── Step 2: references in rendered output ─────────────────────────────────────
#
# Collect every URL-ish value in public/ whose path passes through the
# attachments directory, and keep its basename. HTML is walked with a real
# parser so attribute quoting and entity escaping are handled; CSS and other
# text files are scanned with regexes.

TEXT_EXTS = {".html", ".htm", ".css", ".js", ".xml", ".json", ".txt", ".svg", ".webmanifest"}
URL_ATTRS = {"src", "href", "poster", "content", "data", "srcset", "data-src", "style"}
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.S)
QUOTED_RE = re.compile(r"[\"']([^\"'\n]*?)[\"']")


class _AttrCollector(HTMLParser):
    def __init__(self, sink):
        super().__init__(convert_charrefs=True)
        self.sink = sink
        self._in_style = False

    def handle_starttag(self, tag, attrs):
        if tag == "style":
            self._in_style = True
        for name, value in attrs:
            if value is None:
                continue
            if name == "style":
                for _, u in CSS_URL_RE.findall(value):
                    self.sink(u)
            elif name == "srcset":
                for cand in value.split(","):
                    self.sink(cand.strip().split(" ")[0])
            elif name in URL_ATTRS or name.startswith("data-"):
                self.sink(value)

    def handle_endtag(self, tag):
        if tag == "style":
            self._in_style = False

    def handle_data(self, data):
        if self._in_style:
            for _, u in CSS_URL_RE.findall(data):
                self.sink(u)


def rendered_refs(public: str, attachments_name: str) -> set[str]:
    refs: set[str] = set()

    def sink(url: str):
        path = unquote(html.unescape(urlsplit(url.strip()).path))
        parts = path.split("/")
        if attachments_name in parts[:-1] and parts[-1]:
            refs.add(nfc(parts[-1]))

    for root, _, files in os.walk(public):
        for fn in files:
            ext = os.path.splitext(fn)[1].lower()
            if ext not in TEXT_EXTS:
                continue
            fp = os.path.join(root, fn)
            try:
                with open(fp, encoding="utf-8", errors="replace") as f:
                    text = f.read()
            except OSError:
                continue
            if ext in (".html", ".htm"):
                _AttrCollector(sink).feed(text)
            elif ext == ".css":
                for _, u in CSS_URL_RE.findall(text):
                    sink(u)
            else:
                for u in QUOTED_RE.findall(text):
                    sink(u)
                for _, u in CSS_URL_RE.findall(text):
                    sink(u)
    return refs


# ── Step 3: classify attachments ──────────────────────────────────────────────


def main() -> int:
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("vault", nargs="?", default=".")
    ap.add_argument("--public", default=os.path.join(repo_root, "public"))
    ap.add_argument("--attachments", default="attachments")
    ap.add_argument("-v", "--verbose", action="store_true")
    ap.add_argument("-0", "--print0", action="store_true")
    args = ap.parse_args()

    attachments_dir = os.path.join(args.vault, args.attachments)
    if not os.path.isdir(attachments_dir):
        print(f"Error: {args.attachments}/ not found under '{args.vault}'", file=sys.stderr)
        return 1
    if not os.path.isdir(args.public) or not os.path.isfile(os.path.join(args.public, "index.html")):
        print(f"Error: '{args.public}' does not look like a built Quartz site; run the build first", file=sys.stderr)
        return 1

    md = markdown_refs(args.vault, args.attachments)
    rendered = rendered_refs(args.public, args.attachments)

    orphans, rendered_only, md_used = [], [], 0
    for root, _, files in os.walk(attachments_dir):
        for fn in sorted(files):
            fp = os.path.join(root, fn)
            name = nfc(fn)
            if name in md:
                md_used += 1
            elif quartz_slugify(name) in rendered or name in rendered:
                rendered_only.append(fp)
            else:
                orphans.append(fp)

    if args.print0:
        sys.stdout.write("\0".join(orphans) + ("\0" if orphans else ""))
        return 0

    print(f"Found {len(md)} unique markdown link/embed targets and "
          f"{len(rendered)} unique attachment references in {args.public}.")
    print(f"  referenced from markdown:        {md_used}")
    print(f"  referenced only by rendered site: {len(rendered_only)}")
    print(f"  orphaned:                         {len(orphans)}")
    print()

    if args.verbose and rendered_only:
        print("Referenced only by rendered output (kept):")
        for fp in rendered_only:
            print(f"  {fp}")
        print()

    if not orphans:
        print("✓ No orphaned attachments found.")
        return 0

    print(f"Orphaned attachments ({len(orphans)} files):")
    for fp in orphans:
        print(f"  {fp}")
    print()
    print("── Dry-run delete command (review before executing) ──")
    print(f"  {sys.argv[0]} --print0 {args.vault} | xargs -0 rm")
    return 0


if __name__ == "__main__":
    sys.exit(main())
