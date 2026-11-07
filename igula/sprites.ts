import type { SpriteDef } from '../pixel/src/core/types.ts';

export const IGA = '#ff4fa3';
export const MICHAL = '#33e6ff';
export const HEART = '#ff1a2e';

const CAT = { w: '#ffffff', o: '#ff8c1a', k: '#5a5a5a', e: '#7dff4f', n: '#ff8fb8', b: '#000000' };

export const dot = (color: string): SpriteDef => ({ palette: { o: color }, rows: ['oo', 'oo'] });

/** Hearts from a spark to almost the whole floor, all centred on the same point when anchored. */
const HEART_ROWS: string[][] = [
  ['rr', 'rr'],
  ['rr.rr', 'rrrrr', '.rrr.', '..r..'],
  ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'],
  [
    '.rrr...rrr.',
    'rrrrr.rrrrr',
    'rrrrrrrrrrr',
    'rrrrrrrrrrr',
    '.rrrrrrrrr.',
    '..rrrrrrr..',
    '...rrrrr...',
    '....rrr....',
    '.....r.....',
  ],
  [
    '..rrrr.....rrrr..',
    '.rrrrrr...rrrrrr.',
    'rrrrrrrr.rrrrrrrr',
    'rrrrrrrrrrrrrrrrr',
    'rrrrrrrrrrrrrrrrr',
    'rrrrrrrrrrrrrrrrr',
    '.rrrrrrrrrrrrrrr.',
    '..rrrrrrrrrrrrr..',
    '...rrrrrrrrrrr...',
    '....rrrrrrrrr....',
    '.....rrrrrrr.....',
    '......rrrrr......',
    '.......rrr.......',
    '........r........',
  ],
  mirror([
    '...rrrrr....',
    '.rrrrrrrrr..',
    'rrrrrrrrrrr.',
    'rrrrrrrrrrrr',
    'rrrrrrrrrrrr',
    'rrrrrrrrrrrr',
    '.rrrrrrrrrrr',
    '..rrrrrrrrrr',
    '...rrrrrrrrr',
    '....rrrrrrrr',
    '.....rrrrrrr',
    '.......rrrrr',
    '.........rrr',
    '...........r',
  ]),
];

function mirror(half: string[]): string[] {
  return half.map((row) => row + [...row].reverse().join(''));
}

/** The full heart shrunk by one pixel all round, for the heartbeat. */
function erode(rows: string[]): string[] {
  const filled = (x: number, y: number) => rows[y]?.[x] === 'r';
  return rows.map((row, y) =>
    [...row].map((c, x) => (c === 'r' && filled(x - 1, y) && filled(x + 1, y) && filled(x, y - 1) && filled(x, y + 1) ? 'r' : '.')).join(''),
  );
}

export const HEART_STEPS = HEART_ROWS.map((_, i) => `heart-${i + 1}`);
export const HEART_FULL = HEART_STEPS.at(-1)!;
export const HEART_BEAT = 'heart-beat';

/** Black outline so the head stands out on the red heart. */
const CAT_HEAD = [
  '.b.......b.',
  'bob.....bkb',
  'boobbbbbkkb',
  'boowwwwwkkb',
  'bwewwwwwewb',
  'bwwwwnwwwwb',
  'bwwwkwkwwwb',
  '.bwwwwwwwb.',
  '..bbbbbbb..',
];
const CAT_EYES_ROW = 4;

/** Side view facing right: tail on the left, head on the right. */
const CAT_BODY = ['k...o.k', 'kowwwew', '.wkkwwn'];
const CAT_LEGS = { a: '.w..w..', b: '..ww...', sit: '.www.w.' };
const CAT_TAIL_DOWN = ['....o.k', 'kowwwew', '.wkkwwn'];

const flip = (rows: string[]) => rows.map((r) => [...r].reverse().join(''));
const cat = (rows: string[]): SpriteDef => ({ palette: CAT, rows });

const GHOST = ['..www..', '.wwwww.', 'ww.w.ww', 'wwwwwww', 'wwwwwww', 'wwwwwww'];

const HOUSE: SpriteDef = {
  palette: { y: '#ffcc33' },
  rows: [
    '.....yy.....',
    '....y..y....',
    '...y....y...',
    '..y......y..',
    '.y........y.',
    'yyyyyyyyyyyy',
    '.y........y.',
    '.y........y.',
    '.y........y.',
    '.yyyyyyyyyy.',
  ],
};

export const sprites: Record<string, SpriteDef> = {
  'cat-right-a': cat([...CAT_BODY, CAT_LEGS.a]),
  'cat-right-b': cat([...CAT_BODY, CAT_LEGS.b]),
  'cat-left-a': cat(flip([...CAT_BODY, CAT_LEGS.a])),
  'cat-left-b': cat(flip([...CAT_BODY, CAT_LEGS.b])),
  'cat-sit': cat([...CAT_BODY, CAT_LEGS.sit]),
  'cat-sit-wag': cat([...CAT_TAIL_DOWN, CAT_LEGS.sit]),
  'cat-sit-left': cat(flip([...CAT_BODY, CAT_LEGS.sit])),
  'cat-sit-left-wag': cat(flip([...CAT_TAIL_DOWN, CAT_LEGS.sit])),
  // Curled up facing left, eyes closed.
  'cat-sleep': cat(['k.o.....', 'wkwwowkk', 'nwwwwwwk']),
  z: { palette: { z: '#bfe8ff' }, rows: ['zzzz', '..z.', '.z..', 'zzzz'] },
  // A little ghost for Boo; the two frames ripple its hem as it floats.
  'ghost-a': { palette: { w: '#e8f4ff' }, rows: [...GHOST, 'w.w.w.w'] },
  'ghost-b': { palette: { w: '#e8f4ff' }, rows: [...GHOST, '.w.w.w.'] },
  house: HOUSE,
  iga: dot(IGA),
  michal: dot(MICHAL),
  ...Object.fromEntries(HEART_ROWS.map((rows, i) => [HEART_STEPS[i], { palette: { r: HEART }, rows }])),
  [HEART_BEAT]: { palette: { r: HEART }, rows: erode(HEART_ROWS.at(-1)!) },
  'cat-head': { palette: CAT, rows: CAT_HEAD },
  'cat-head-blink': { palette: CAT, rows: CAT_HEAD.map((r, y) => (y === CAT_EYES_ROW ? r.replace(/e/g, 'k') : r)) },
};
