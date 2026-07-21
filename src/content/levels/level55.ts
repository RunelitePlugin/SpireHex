import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [1, 3], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
  [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [6, 2], [7, 2], [7, 3], [7, 4],
  [7, 5], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [9, 3], [9, 2], [10, 2], [11, 2],
  [11, 3], [11, 4], [12, 4], [13, 4],
]);

export const LEVEL55: LevelDef = {
  id: 'level55',
  name: "Sea of Motes",
  blurb: "The dark comes in waves. Literally.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 480,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 30, spacing: 0.18 }] },
    { entries: [{ enemyId: 'voidmote', count: 44, spacing: 0.13 }] },
    { entries: [{ enemyId: 'voidmote', count: 40, spacing: 0.14 }, { enemyId: 'lumenmote', count: 16, spacing: 0.24 }] },
    { entries: [{ enemyId: 'voidmote', count: 56, spacing: 0.11 }] },
    { entries: [{ enemyId: 'voidmote', count: 48, spacing: 0.12 }, { enemyId: 'gloomwing', count: 8, spacing: 0.4 }] },
    { entries: [{ enemyId: 'voidmote', count: 64, spacing: 0.1 }] },
    { entries: [{ enemyId: 'voidmote', count: 56, spacing: 0.11 }, { enemyId: 'voidmote', count: 20, spacing: 0.2 }] },
  ],
};
