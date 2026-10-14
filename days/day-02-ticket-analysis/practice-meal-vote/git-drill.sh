#!/usr/bin/env bash
# Builds a throwaway repo pair for the Day 02 git block: a teammate pushes a change to the same
# line you edited locally, so `git pull --rebase` stops on a merge conflict you have to resolve.
# Usage: bash git-drill.sh [sandbox-dir]   (default: /tmp/day02-git-drill)
set -euo pipefail

SANDBOX="${1:-/tmp/day02-git-drill}"
if [ -e "$SANDBOX" ]; then
  echo "Sandbox $SANDBOX already exists. Remove it first: rm -rf $SANDBOX" >&2
  exit 1
fi

SRC="$(cd "$(dirname "$0")" && pwd)"
git_as() { local who="$1"; shift; git -c user.name="$who" -c user.email="$who@example.test" "$@"; }

mkdir -p "$SANDBOX"
git init -q --bare -b main "$SANDBOX/origin.git"

# Seed the shared repo with the practice app
git clone -q "$SANDBOX/origin.git" "$SANDBOX/teammate" 2>/dev/null
cp "$SRC"/vote-tally.js "$SRC"/show-winner.js "$SRC"/config.json "$SRC"/votes-*.json "$SANDBOX/teammate/"
git_as teammate -C "$SANDBOX/teammate" add .
git_as teammate -C "$SANDBOX/teammate" commit -qm "Add meal vote app"
git_as teammate -C "$SANDBOX/teammate" push -q origin main

# Your clone starts from the same commit
git clone -q "$SANDBOX/origin.git" "$SANDBOX/you"

# Teammate: moves the cut-off to 11:30 and pushes first
sed -i.bak 's/"closesAt": "11:00"/"closesAt": "11:30"/' "$SANDBOX/teammate/config.json" && rm "$SANDBOX/teammate/config.json.bak"
git_as teammate -C "$SANDBOX/teammate" commit -qam "Move voting cut-off to 11:30 (KITCHEN-47)"
git_as teammate -C "$SANDBOX/teammate" push -q origin main

# You: fix the timezone offset on the neighbouring line, commit locally, not pushed yet
sed -i.bak 's/"utcOffsetHours": 0/"utcOffsetHours": 7/' "$SANDBOX/you/config.json" && rm "$SANDBOX/you/config.json.bak"
git -C "$SANDBOX/you" config user.name you
git -C "$SANDBOX/you" config user.email you@example.test
git -C "$SANDBOX/you" commit -qam "Use office timezone for the cut-off (KITCHEN-44)"

cat <<EOF
Sandbox ready: $SANDBOX
  origin.git  shared remote
  teammate/   already pushed "Move voting cut-off to 11:30"
  you/        your local commit "Use office timezone" (not pushed)

Now:
  cd $SANDBOX/you
  git log --oneline --graph --all     # see where you are
  git fetch && git log --oneline main..origin/main   # what the teammate pushed
  git diff main origin/main           # read their change before pulling
  git pull --rebase                   # stops on a conflict in config.json
EOF
