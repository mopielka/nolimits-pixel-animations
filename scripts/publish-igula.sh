#!/usr/bin/env bash
# Builds Iga's animation and replaces the public download for the school with it:
# https://github.com/mopielka/nolimits-pixel-animations/releases/download/igula/igula-dla-szkoly.zip
# The URL stays the same across updates; only the file behind it changes.
set -euo pipefail

REPO="mopielka/nolimits-pixel-animations"
TAG="igula"
ASSET="igula-dla-szkoly.zip"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
STAGE="$OUT/publish/igula-dla-szkoly"

cd "$ROOT"
node igula/generate.ts
(cd pixel && npm run build -- ../igula --out ../out && npm run build -- examples/test-orientation --out ../out --no-preview)

rm -rf "$OUT/publish"
mkdir -p "$STAGE"
cp "$OUT/igula/igula.zip" "$OUT/igula/skolim.mp3" igula/INSTRUKCJA.txt "$STAGE/"
cp "$OUT/igula/preview.mp4" "$STAGE/podglad.mp4"
cp "$OUT/igula/preview-floor.mp4" "$STAGE/podglad-podloga.mp4"
cp "$OUT/test-orientation/test-orientation.zip" "$STAGE/test-orientacji.zip"
(cd "$OUT/publish" && zip -qr -X "$ASSET" igula-dla-szkoly)

NOTES="Animacja na podłogę Pixel dla Igi (16.11.2026). Zaktualizowano: $(date '+%d.%m.%Y %H:%M') · $(git rev-parse --short HEAD)"
gh release upload "$TAG" "$OUT/publish/$ASSET" --repo "$REPO" --clobber
gh release edit "$TAG" --repo "$REPO" --notes "$NOTES" >/dev/null
echo "Published: https://github.com/$REPO/releases/download/$TAG/$ASSET"
