#!/usr/bin/env bash
# Builds one animation and publishes the package for the venue as a release download:
#   scripts/publish.sh <folder>
#   → https://github.com/<repo>/releases/download/<folder>/<folder>-dla-szkoly.zip
# The link stays the same across updates; only the file behind it changes.
#
# The package holds the frames ZIP, the music trimmed to the animation (if it has any),
# preview videos, the orientation test frame and <folder>/INSTRUKCJA.txt (if present).
set -euo pipefail

if [[ $# -ne 1 || ! -f "$1/index.json" && ! -f "$1/generate.ts" ]]; then
  echo "Usage: scripts/publish.sh <animation folder>   (a folder with index.json or generate.ts)" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$(basename "$1")"
REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
ASSET="$NAME-dla-szkoly.zip"
OUT="$ROOT/out"
STAGE="$OUT/publish/$NAME-dla-szkoly"

cd "$ROOT"
[[ -f "$NAME/generate.ts" ]] && node "$NAME/generate.ts"
(cd pixel && npm run build -- "../$NAME" --out ../out && npm run build -- examples/test-orientation --out ../out --no-preview)

rm -rf "$STAGE" "$OUT/publish/$ASSET"
mkdir -p "$STAGE"
cp "$OUT/$NAME/$NAME.zip" "$STAGE/"
cp "$OUT/$NAME/preview.mp4" "$STAGE/podglad.mp4"
cp "$OUT/$NAME/preview-floor.mp4" "$STAGE/podglad-podloga.mp4"
cp "$OUT/test-orientation/test-orientation.zip" "$STAGE/test-orientacji.zip"
[[ -f "$NAME/INSTRUKCJA.txt" ]] && cp "$NAME/INSTRUKCJA.txt" "$STAGE/"

# The build writes the music as <name of the source file>.mp3, cut to the animation's length.
AUDIO="$(node -e 'const a = JSON.parse(require("fs").readFileSync(process.argv[1])).audio; if (a) console.log(require("path").parse(a.src).name + ".mp3")' "$NAME/index.json")"
[[ -n "$AUDIO" ]] && cp "$OUT/$NAME/$AUDIO" "$STAGE/"

(cd "$OUT/publish" && zip -qr -X "$ASSET" "$NAME-dla-szkoly")

TITLE="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).title ?? process.argv[2])' "$NAME/index.json" "$NAME")"
NOTES="$TITLE – animacja na podłogę Pixel. Zaktualizowano: $(date '+%d.%m.%Y %H:%M') · $(git rev-parse --short HEAD)"
gh release view "$NAME" --repo "$REPO" >/dev/null 2>&1 || gh release create "$NAME" --repo "$REPO" --title "$TITLE" --notes "$NOTES" >/dev/null
gh release upload "$NAME" "$OUT/publish/$ASSET" --repo "$REPO" --clobber
gh release edit "$NAME" --repo "$REPO" --notes "$NOTES" >/dev/null
echo "Published: https://github.com/$REPO/releases/download/$NAME/$ASSET"
