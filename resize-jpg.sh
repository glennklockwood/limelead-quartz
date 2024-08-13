#!/usr/bin/env bash

# applies convert input.jpg -resize 1280x1280\> -quality 85% output.jpg to a given jpg file

INPUT_FILE="$1"

# check if the input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "File not found: $INPUT_FILE" >&2
    exit 1
fi

# get the file extension of the input file
FILE_EXTENSION="${INPUT_FILE##*.}"

echo "Got file extension $FILE_EXTENSION"

TMP_FILE="./tmp.${FILE_EXTENSION}"

set -e
ls -l "$INPUT_FILE"
cp "$INPUT_FILE" "$TMP_FILE"
convert "$TMP_FILE" -resize 1280x1280\> -quality 85% "$INPUT_FILE"
rm $TMP_FILE
ls -l "$INPUT_FILE"
