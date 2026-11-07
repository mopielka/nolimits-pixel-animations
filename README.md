# nolimits-pixel-animations

Animations for the Pixel LED floor. The tools (format, build, player) live in [mopielka/nolimits-pixel](https://github.com/mopielka/nolimits-pixel), included here as the `pixel/` submodule. Each animation is a folder at the top level; nothing outside it is specific to any animation.

## Animations

| Folder | What | Download for the venue |
| --- | --- | --- |
| `igula/` | For Iga, 16.11.2026 – 2:10 with Skolim, "Daj mi jedno słowo" | [igula-dla-szkoly.zip](https://github.com/mopielka/nolimits-pixel-animations/releases/download/igula/igula-dla-szkoly.zip) |

Each download link always serves the latest published version.

## Setup

```bash
git clone --recurse-submodules git@github.com:mopielka/nolimits-pixel-animations.git
cd nolimits-pixel-animations
(cd pixel && npm install)   # only needed for building; generating needs nothing
```

Node 26+ and, for preview videos, `ffmpeg`.

## A new animation

Make a folder, e.g. `urodziny/`, with either a hand-written `index.json` or a `generate.ts` that writes one (see `igula/generate.ts`, or `pixel/examples/layers/generate.ts` for a smaller start). Import the tools as `../pixel/src/core/...`. Format reference: [pixel/FORMAT.md](https://github.com/mopielka/nolimits-pixel/blob/main/FORMAT.md). Optional extras in the folder:

- a music file, referenced from `index.json` (`"audio": { "src": "song.mp3" }`);
- `INSTRUKCJA.txt` – notes for the venue (which side the viewer stands on, length, music), shipped in the package.

## Work on an animation

```bash
node --watch <folder>/generate.ts                          # regenerate index.json on every save (if it has one)
(cd pixel && npm run build -- ../<folder> --out ../out)    # → out/<folder>/: PNG frames, <folder>.zip for the venue, previews
```

**Watch it while editing:** open https://mopielka.github.io/nolimits-pixel-player/ in Chrome or Edge, click **Otwórz folder…** and pick this repo's folder (it lists every animation in it) or one animation's folder. Every save shows up in the player within a second, at the same moment and with the music. After reloading the page, **📁 Wznów** reopens the folder. Other browsers load the folder once (drag it onto the page).

**The finished files:** drop `out/<folder>/<folder>.zip` together with the built `.mp3` next to it onto the player to check exactly what the venue gets.

Don't copy or symlink animations into `pixel/animations/` – the player bundles everything there, and `npm run web:deploy` would publish it inside the tools.

## Publish for the venue

```bash
scripts/publish.sh <folder>
```

Builds the animation and uploads `<folder>-dla-szkoly.zip` to the release named after the folder (created on first publish), replacing the previous file behind the same link: `https://github.com/mopielka/nolimits-pixel-animations/releases/download/<folder>/<folder>-dla-szkoly.zip`. Inside: the frames ZIP for the floor, the music cut to the animation's length (if any), preview videos with sound, the orientation test frame and `INSTRUKCJA.txt` (if any). Add the link to the table above.

## Music

Songs live here, next to their animation, and end up in the published packages. The public `pixel` repo rejects audio files – never copy them there.

## Updating the tools

```bash
git submodule update --remote pixel && git commit -am "chore: update pixel tools"
```
