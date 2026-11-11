#!/usr/bin/env bash
# Bouwt het deploy-pakket voor App Service: de getrackte bestanden van HEAD,
# zonder tests/infra, plus productie-node_modules voor server/ en de skill-zip.
# Gebruik: scripts/package-app.sh <uitvoer.zip>
set -euo pipefail
out="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
root="$(git rev-parse --show-toplevel)"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

git -C "$root" archive HEAD | tar -x -C "$stage"
rm -rf "$stage/tests" "$stage/infra" "$stage/.github" "$stage/server/test"

python3 "$stage/scripts/generate-assets.py" >/dev/null 2>&1 || python "$stage/scripts/generate-assets.py" >/dev/null
(cd "$stage/server" && npm ci --omit=dev --silent)
(cd "$stage/skills" && rm -f wigo4it-huisstijl.zip && python3 -m zipfile -c wigo4it-huisstijl.zip wigo4it-huisstijl 2>/dev/null \
  || python -m zipfile -c wigo4it-huisstijl.zip wigo4it-huisstijl)

rm -f "$out"
(cd "$stage" && python3 -m zipfile -c "$out" . 2>/dev/null || python -m zipfile -c "$out" .)
echo "$out"
