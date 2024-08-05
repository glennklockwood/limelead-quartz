#!/usr/bin/env bash

# if --test is passed on the command line,

if [ "$1" == "test" -o "$1" == "--test" ]; then
    npx quartz build --serve
else
    npx quartz build --concurrency 8 && rsync -avP public/ webhost:glennklockwood.com/garden/
fi

