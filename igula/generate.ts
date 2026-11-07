// Generates index.json for Iga's animation: `node igula/generate.ts`
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { textWidth } from '../pixel/src/core/font.ts';
import type { Animation, Keyframe, Layer, LayersScene } from '../pixel/src/core/types.ts';
import { HEART, HEART_BEAT, HEART_FULL, HEART_STEPS, IGA, MICHAL, sprites } from './sprites.ts';

const WRO = { x: 2, y: 12 };
const KONIN = { x: 24, y: 2 };
const MEETING = { x: 22, y: 4 };
const CENTRE = { x: 13, y: 7 };
/** Middle of the floor; hearts are anchored here so every size shares one centre. */
const MIDDLE = { x: 14, y: 8 };

/** Days from 17.07 to the visit on 16.11. */
const DAYS_TOGETHER = 122;

const fadeIn = (at: number, length = 0.6): Keyframe[] => [
  { t: at, opacity: 0 },
  { t: at + length, opacity: 1 },
];
const fadeOut = (at: number, length = 0.5): Keyframe[] => [
  { t: at, opacity: 1 },
  { t: at + length, opacity: 0 },
];

/** A one-pixel "message" flying between the two dots. */
function message(from: { x: number; y: number }, to: { x: number; y: number }, start: number, length: number, color: string): Layer {
  return {
    name: 'message',
    rect: [1, 1],
    color,
    from: start,
    to: start + length,
    x: from.x + 0.5,
    y: from.y + 0.5,
    keyframes: [
      { t: start, x: from.x + 0.5, y: from.y + 0.5 },
      { t: start + length, x: to.x + 0.5, y: to.y + 0.5, ease: 'in-out' },
    ],
  };
}

/** Messages get more frequent and quicker, alternating who sends. */
function volley(start: number, end: number, firstGap: number): Layer[] {
  const layers: Layer[] = [];
  let t = start;
  let gap = firstGap;
  let fromMichal = false;
  while (t < end) {
    const length = Math.max(0.6, gap);
    layers.push(fromMichal ? message(WRO, KONIN, t, length, MICHAL) : message(KONIN, WRO, t, length, IGA));
    fromMichal = !fromMichal;
    t += gap;
    gap = Math.max(0.25, gap * 0.75);
  }
  return layers;
}

/** A date in the middle of the floor, in the colour of whoever made it happen. */
function date(name: string, text: string, color: string, from: number, to: number): Layer {
  return { name, text, color, x: 14, y: 7.5, anchor: 'center', from, to, keyframes: [...fadeIn(from, 0.4), ...fadeOut(to - 0.4, 0.4)] };
}

/** Michał's dot with two fading copies trailing behind it on the trip to Konin. */
function journey(start: number, length: number): Layer[] {
  return [0.24, 0.12, 0].map((lag, i) => ({
    name: i === 2 ? 'michal' : 'trail',
    sprite: 'michal',
    opacity: [0.3, 0.6, 1][i],
    from: start,
    to: MEET_END,
    x: WRO.x,
    y: WRO.y,
    keyframes: [
      { t: start + lag, x: WRO.x, y: WRO.y },
      { t: start + lag + length, x: MEETING.x, y: MEETING.y, ease: 'in-out' },
    ],
  }));
}

const MEET_END = 17.6;

const map: LayersScene = {
  type: 'layers',
  name: 'Wrocław – Konin: 17.07 and 4.08',
  duration: 19,
  layers: [
    { name: 'michal at WRO', sprite: 'michal', ...WRO, to: 11.2, keyframes: fadeIn(0) },
    { name: 'WRO', text: 'WRO', color: MICHAL, x: 5, y: 10, to: 4, keyframes: [...fadeIn(0.3), ...fadeOut(3.2)] },
    {
      name: 'iga at KONIN',
      sprite: 'iga',
      ...KONIN,
      keyframes: [
        ...fadeIn(1.2),
        { t: MEET_END, x: KONIN.x, y: KONIN.y },
        { t: 18.8, x: CENTRE.x + 1, y: CENTRE.y, ease: 'in-out' },
      ],
    },
    { name: 'KONIN', text: 'KONIN', color: IGA, x: 0, y: 1, to: 4, keyframes: [...fadeIn(1.5), ...fadeOut(3.2)] },

    message(WRO, KONIN, 3.6, 1.0, MICHAL),
    date('15.07 – first message', '15.07', MICHAL, 4.7, 6.3),
    message(KONIN, WRO, 6.5, 1.0, IGA),
    date('17.07 – she replied', '17.07', IGA, 7.6, 9.3),

    ...volley(9.4, 10.8, 0.5),
    ...journey(11.2, 2.5),

    { name: '4.08', text: '4.08', x: 2, y: 2, from: 13.9, to: 17.6, keyframes: [...fadeIn(13.9, 0.4), ...fadeOut(17)] },
    { name: 'KONIN again', text: 'KONIN', color: IGA, x: 1, y: 10, from: 14.6, to: 17.6, keyframes: [...fadeIn(14.6, 0.5), ...fadeOut(17)] },

    {
      name: 'michal to centre',
      sprite: 'michal',
      from: MEET_END,
      ...MEETING,
      keyframes: [{ t: MEET_END, ...MEETING }, { t: 18.8, x: CENTRE.x - 1, y: CENTRE.y, ease: 'in-out' }],
    },
    { name: 'spark', rect: [2, 2], color: HEART, ...CENTRE, from: 18.8 },
  ],
};

const BEAT_EVERY = 1.2;
const GROWN = 2.5;
const SHRINK_FROM = 13;

/** "Lub-dub": two quick contractions, then rest. */
function heartbeats(start: number, end: number): Keyframe[] {
  const keys: Keyframe[] = [];
  for (let t = start; t < end; t += BEAT_EVERY) {
    keys.push(
      { t, sprite: HEART_BEAT },
      { t: t + 0.12, sprite: HEART_FULL },
      { t: t + 0.24, sprite: HEART_BEAT },
      { t: t + 0.36, sprite: HEART_FULL },
    );
  }
  return keys;
}

const growth: Keyframe[] = HEART_STEPS.map((sprite, i) => ({ t: (i * GROWN) / (HEART_STEPS.length - 1), sprite }));
const shrink: Keyframe[] = HEART_STEPS.slice(0, -1)
  .reverse()
  .map((sprite, i) => ({ t: SHRINK_FROM + i * 0.2, sprite }));

const insideHeart = (layer: Layer, from: number, to: number): Layer => ({
  ...layer,
  anchor: 'center',
  x: MIDDLE.x,
  from,
  to,
  keyframes: [...fadeIn(from, 0.3), ...fadeOut(to - 0.3, 0.3), ...(layer.keyframes ?? [])],
});

const heart: LayersScene = {
  type: 'layers',
  name: 'heart: 122 days and a cat',
  duration: SHRINK_FROM + HEART_STEPS.length * 0.2,
  layers: [
    { name: 'michal fading', sprite: 'michal', x: CENTRE.x - 1, y: CENTRE.y, to: 0.6, keyframes: fadeOut(0) },
    { name: 'iga fading', sprite: 'iga', x: CENTRE.x + 1, y: CENTRE.y, to: 0.6, keyframes: fadeOut(0) },
    {
      name: 'heart',
      sprite: HEART_STEPS[0],
      anchor: 'center',
      ...MIDDLE,
      to: SHRINK_FROM + (HEART_STEPS.length - 1) * 0.2,
      keyframes: [...growth, ...heartbeats(GROWN + 0.8, SHRINK_FROM - 0.5), { t: SHRINK_FROM - 0.2, sprite: HEART_FULL }, ...shrink],
    },
    insideHeart({ name: 'days', text: String(DAYS_TOGETHER), y: 6.5 }, 3.8, 6.4),
    insideHeart({ name: 'DNI', text: 'DNI', y: 6.5 }, 6.6, 9.0),
    insideHeart(
      {
        name: 'cat',
        sprite: 'cat-head',
        y: 7.5,
        keyframes: [
          { t: 10.6, sprite: 'cat-head-blink' },
          { t: 10.75, sprite: 'cat-head' },
          { t: 11.9, sprite: 'cat-head-blink' },
          { t: 12.05, sprite: 'cat-head' },
        ],
      },
      9.3,
      12.8,
    ),
  ],
};

/** Alternates the cat's two walking frames. */
function walk(start: number, end: number, facing: 'left' | 'right'): Keyframe[] {
  const keys: Keyframe[] = [];
  for (let t = start, i = 0; t < end; t += 0.2, i++) keys.push({ t, sprite: `cat-${facing}-${i % 2 ? 'b' : 'a'}` });
  return keys;
}

function sitAndWag(from: number, until: number, facing: 'left' | 'right' = 'right'): Keyframe[] {
  const sit = facing === 'right' ? 'cat-sit' : 'cat-sit-left';
  const keys: Keyframe[] = [{ t: from, sprite: sit }];
  for (let t = from + 1; t < until; t += 1) keys.push({ t, sprite: `${sit}-wag` }, { t: t + 0.25, sprite: sit });
  return keys;
}

const HOUSE_AT = { x: 1, y: 6 };
const MOVE_END = 10.5;
const MOVE_FADE = 9.8;
const TRAVEL = { from: 2.8, to: 7 };

const movingDot = (sprite: string, start: { x: number; y: number }, home: { x: number; y: number }): Layer => ({
  name: `${sprite} moving`,
  sprite,
  ...start,
  keyframes: [
    ...fadeIn(0),
    { t: TRAVEL.from, ...start },
    { t: TRAVEL.to, ...home, ease: 'in-out' },
    ...fadeOut(MOVE_FADE, 0.6),
  ],
});

const move2027: LayersScene = {
  type: 'layers',
  name: '2027: moving to Wrocław together',
  duration: MOVE_END,
  layers: [
    { name: '2027', text: '2027', x: MIDDLE.x, y: 10, anchor: 'center', to: 2.8, keyframes: [...fadeIn(0.3), ...fadeOut(2.3)] },
    movingDot('michal', { x: 20, y: 4 }, { x: 4, y: 13 }),
    movingDot('iga', { x: 23, y: 4 }, { x: 7, y: 13 }),
    { name: 'house', sprite: 'house', ...HOUSE_AT, from: TRAVEL.to, keyframes: [...fadeIn(TRAVEL.to, 0.7), ...fadeOut(MOVE_FADE, 0.6)] },
    {
      name: 'cat moving in',
      sprite: 'cat-left-a',
      x: 20,
      y: 0,
      from: 1,
      keyframes: [
        ...fadeIn(1, 0.5),
        { t: TRAVEL.from + 0.3, x: 20, y: 0 },
        { t: TRAVEL.to + 0.3, x: 3, y: 2, ease: 'in-out' },
        ...walk(TRAVEL.from + 0.3, TRAVEL.to + 0.3, 'left'),
        ...sitAndWag(TRAVEL.to + 0.3, MOVE_FADE),
        ...fadeOut(MOVE_FADE, 0.6),
      ],
    },
    { name: 'WRO', text: 'WRO', color: MICHAL, x: 14, y: 10, from: 8, keyframes: [...fadeIn(8), ...fadeOut(MOVE_FADE, 0.6)] },
  ],
};

const FINALE_END = 16.3;
const FINALE_FADE = 14.6;
const CIE_HOME = 8;
const KOCHAM_HOME = 1;
const PULL_KOCHAM = { from: 0.6, to: 3.4 };
const PUSH_CIE = { from: 3.7, to: 6 };

/** The cat walks on the line's baseline, one pixel clear of the text's left edge at `textX`. */
const catLeftOf = (textX: number, textY: number) => ({ x: textX - 8, y: textY + 1 });

/** Start positions that keep both the text and the cat beside it off the floor. */
const offRight = 28 + 8;
const offLeft = (text: string) => -textWidth(text) - 8;

function slidingText(name: string, text: string, start: number, home: number, y: number, move: { from: number; to: number }): Layer {
  return {
    name,
    text,
    color: HEART,
    x: start,
    y,
    to: 9.1,
    keyframes: [{ t: move.from, x: start }, { t: move.to, x: home, ease: 'in-out' }, ...fadeOut(8.6)],
  };
}
/** The cat makes room for IGULA by moving to the bottom-right corner. */
const CAT_STROLL = { from: 8.6, to: 10.4 };

const finale: LayersScene = {
  type: 'layers',
  name: 'KOCHAM CIĘ, IGULA',
  duration: FINALE_END,
  layers: [
    slidingText('KOCHAM pulled in by the cat', 'KOCHAM', offRight, KOCHAM_HOME, 1, PULL_KOCHAM),
    slidingText('CIĘ pushed in by the cat', 'CIĘ', CIE_HOME + offLeft('CIĘ'), CIE_HOME, 9, PUSH_CIE),
    {
      name: 'cat pushing',
      sprite: 'cat-right-a',
      ...catLeftOf(offRight, 1),
      to: FINALE_FADE + 1.2,
      keyframes: [
        // KOCHAM fills the width, so the cat can't push it and stay in sight: it tows it
        // in from the right and walks off the left edge...
        { t: PULL_KOCHAM.from, ...catLeftOf(offRight, 1) },
        { t: PULL_KOCHAM.to, ...catLeftOf(KOCHAM_HOME, 1), ease: 'in-out' },
        ...walk(PULL_KOCHAM.from, PULL_KOCHAM.to, 'left'),
        // ...then comes back along the bottom line pushing CIĘ, and stays.
        { t: PUSH_CIE.from, ...catLeftOf(CIE_HOME + offLeft('CIĘ'), 9), ease: 'step' },
        { t: PUSH_CIE.to, ...catLeftOf(CIE_HOME, 9), ease: 'in-out' },
        ...walk(PUSH_CIE.from, PUSH_CIE.to, 'right'),
        ...sitAndWag(PUSH_CIE.to, CAT_STROLL.from),
        { t: CAT_STROLL.from, x: CIE_HOME - 8, y: 10 },
        { t: CAT_STROLL.to, x: 21, y: 12, ease: 'in-out' },
        ...walk(CAT_STROLL.from, CAT_STROLL.to, 'right'),
        ...sitAndWag(CAT_STROLL.to, FINALE_FADE, 'left'),
        ...fadeOut(FINALE_FADE, 1.2),
      ],
    },
    {
      name: 'heart over IGULA',
      sprite: HEART_STEPS[1],
      anchor: 'center',
      x: MIDDLE.x,
      y: 3,
      from: 9.6,
      keyframes: [
        ...fadeIn(9.6, 0.4),
        ...Array.from({ length: 8 }, (_, i): Keyframe => ({ t: 10 + i * 0.6, sprite: HEART_STEPS[i % 2 ? 1 : 2] })),
        ...fadeOut(FINALE_FADE, 1.2),
      ],
    },
    {
      name: 'IGULA',
      text: 'IGULA',
      color: IGA,
      anchor: 'center',
      x: MIDDLE.x,
      y: 9,
      from: 9.4,
      keyframes: [...fadeIn(9.4), ...fadeOut(FINALE_FADE, 1.2)],
    },
    ...(['michal', 'iga'] as const).map((sprite, i): Layer => ({
      name: `${sprite} together`,
      sprite,
      x: [9, 17][i],
      y: 13,
      from: 10.2,
      keyframes: [...fadeIn(10.2, 0.4), { t: 10.2, x: [9, 17][i] }, { t: 11.2, x: [12, 14][i], ease: 'out' }, ...fadeOut(FINALE_FADE, 1.2)],
    })),
  ],
};

const animation: Omit<Animation, 'width' | 'height' | 'fps' | 'background'> = {
  version: 1,
  title: 'Igula',
  sprites,
  scenes: [map, heart, move2027, finale],
};

writeFileSync(join(import.meta.dirname, 'index.json'), JSON.stringify(animation, null, 2) + '\n');
