#!/usr/bin/env bash

if [ ! -d content ]; then
    echo "No content directory. Did you remember to symlink your Obsidian vault?" >&2
    echo "ln -s /path/to/obsidian/vault content" >&2
    exit 1
fi

rsync_only() {
    rsync --delete --chmod ugo+rX -rltvP public/ webhost:glennklockwood.com/garden/
}

compare() {
    rsync -avzi --dry-run public/ webhost:glennklockwood.com/garden/
}

build_only() {
    npx quartz build --concurrency 8
    mv -v public/static/.htaccess public/
}

if [ "$1" == "test" -o "$1" == "--test" ]; then
    npx quartz build --serve
elif [ "$1" == "rsync" -o "$1" == "--rsync" ]; then
    rsync_only
elif [ "$1" == "build-only" -o "$1" == "--build-only" ]; then
    build_only
elif [ "$1" == "compare" -o "$1" == "--compare" ]; then
    compare
else
    build_only 8 && rsync_only
fi

