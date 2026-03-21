#!/usr/bin/env bash

# applies convert input.jpg -resize 1280x1280\> -quality 85% output.jpg to a
# given image.

set -e

INPUT_FILE="$1"

# check if the input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "File not found: $INPUT_FILE" >&2
    exit 1
fi

# get the file extension of the input file
FILE_EXTENSION="${INPUT_FILE##*.}"

# use mktemp or tempfile or whatever the preferred command is to make a new
# file with the same extension as the input file. it has to work on both
# linux and macos
#TMP_FILE=$(mktemp -u --suffix=".${FILE_EXTENSION}")
TMP_FILE="$(mktemp -u).${FILE_EXTENSION}"

ls -l "$INPUT_FILE"
cp -v "$INPUT_FILE" "$TMP_FILE"
convert "$TMP_FILE" -resize 1280x1280\> -quality 85% "$INPUT_FILE"
rm -v $TMP_FILE
ls -l "$INPUT_FILE"
