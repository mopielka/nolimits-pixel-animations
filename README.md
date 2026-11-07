# nolimits-pixel-animations

Private animations for the Pixel LED floor. The tools (format, build, player) live in the public repo [mopielka/nolimits-pixel](https://github.com/mopielka/nolimits-pixel), included here as the `pixel/` submodule.

- `igula/` – the animation for Iga, 16.11.2026: 2:10 with Skolim – "Daj mi jedno słowo" (`skolim.mp3`, heartbeats synced to its 138.65 BPM). `generate.ts` + `sprites.ts` write `index.json`.

## Setup

```bash
git clone --recurse-submodules git@github.com:mopielka/nolimits-pixel-animations.git
cd nolimits-pixel-animations
(cd pixel && npm install)   # only needed for building; generating needs nothing
```

Node 26+ and, for preview videos, `ffmpeg`.

## Work on an animation

```bash
node igula/generate.ts                                   # regenerate igula/index.json
node --watch igula/generate.ts                           # …on every save
(cd pixel && npm run build -- ../igula --out ../out)     # → out/igula/: PNG frames, igula.zip for the school, previews
```

**Watch it while editing:** open https://mopielka.github.io/nolimits-pixel-player/ in Chrome or Edge, click **Otwórz folder…** and pick this repo's folder (it lists every animation in it) or `igula/` itself. With `node --watch igula/generate.ts` running, every save shows up in the player within a second, at the same moment and with the music. After reloading the page, **📁 Wznów** reopens the folder. Other browsers load the folder once (drag it onto the page).

**The finished files:** drop `out/igula/igula.zip` together with `out/igula/skolim.mp3` onto the player to check exactly what the school gets.

Don't copy or symlink this animation into `pixel/animations/` – the player bundles everything there, and `npm run web:deploy` would publish it.

## Music

This repo is private, so the song can live here: put it in the animation folder and reference it from `generate.ts` (`audio: { src: 'song.mp3' }`). It's included in the build and preview videos. Never copy it into the public `pixel` repo – its `.gitignore` and deploy script reject audio files.

## Updating the tools

```bash
git submodule update --remote pixel && git commit -am "chore: update pixel tools"
```
