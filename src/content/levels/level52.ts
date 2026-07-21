import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6],
  [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [9, 4], [10, 4], [10, 3], [10, 2], [11, 2],
  [12, 2], [12, 3], [12, 4], [13, 4], [14, 4],
]);

export const LEVEL52: LevelDef = {
  id: 'level52',
  name: "Gloomwing Pass",
  blurb: "Nothing in the pass flies slower than you fear.",
  hint: "Gloomwings ride the dark wind — slow them or lose them.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 480,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'gloomwing', count: 8, spacing: 0.45 }] },
    { entries: [{ enemyId: 'voidmote', count: 30, spacing: 0.18 }] },
    { entries: [{ enemyId: 'gloomwing', count: 12, spacing: 0.3 }, { enemyId: 'voidmote', count: 16, spacing: 0.3 }] },
    { entries: [{ enemyId: 'raywisp', count: 12, spacing: 0.26 }, { enemyId: 'gloomwing', count: 8, spacing: 0.4 }] },
    { entries: [{ enemyId: 'voidmote', count: 38, spacing: 0.15 }] },
    { entries: [{ enemyId: 'gloomwing', count: 12, spacing: 0.3 }] },
    { entries: [{ enemyId: 'gloomwing', count: 12, spacing: 0.28 }, { enemyId: 'voidmote', count: 24, spacing: 0.19 }] },
  ],
};
