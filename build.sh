#!/usr/bin/env bash

if [ ! -d content ]; then
    echo "No content directory. Did you remember to symlink your Obsidian vault?" >&2
    echo "ln -s /path/to/obsidian/vault content" >&2
    exit 1
fi

if [ "$1" == "test" -o "$1" == "--test" ]; then
    npx quartz build --serve
else
    npx quartz build --concurrency 8 && rsync --delete -avP public/ webhost:glennklockwood.com/garden/
fi

