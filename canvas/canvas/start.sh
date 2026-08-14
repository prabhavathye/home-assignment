#!/usr/bin/env bash
# Launches the Canvas drawing program.
# Every invocation starts fresh: the program keeps all state in memory only,
# so nothing persists between runs.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but was not found on PATH." >&2
  exit 1
fi

exec node src/index.js
