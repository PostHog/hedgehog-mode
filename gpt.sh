#!/usr/bin/env bash
# Collect all files to paste to ChatGPT o1
OUTPUT="gpt.txt"

# Start fresh
> "$OUTPUT"

echo "" >> "$OUTPUT"

# Define the patterns you want to collect files from:
patterns=(
   "package.json"
   "game/app/*.tsx"
   "game/app/static-rendering/*.tsx"
   "hedgehog-mode/src/*.ts*"
   "hedgehog-mode/src/actors/*.ts*"
   "hedgehog-mode/src/actors/hedgehog/*.ts*"
   "hedgehog-mode/src/items/*.ts*"
   "hedgehog-mode/src/misc/*.ts*"
   "hedgehog-mode/src/sprites/*.ts*"
   "hedgehog-mode/src/static-renderer/*.ts*"
   "hedgehog-mode/src/ui/*.ts*"
   "hedgehog-mode/src/ui/components/*.ts*"
   "hedgehog-mode/src/ui/hooks/*.ts*"
)

for pattern in "${patterns[@]}"; do
    for f in $pattern; do
        # Check if the file actually exists and is a regular file
        if [ -f "$f" ]; then
            echo "$f" >> "$OUTPUT"
            echo "-------------" >> "$OUTPUT"
            cat "$f" >> "$OUTPUT"
            echo "-------------" >> "$OUTPUT"
        fi
    done
done
