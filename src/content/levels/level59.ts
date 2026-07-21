import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [5, 5], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [9, 2],
  [10, 2], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [12, 6], [13, 6], [13, 5], [13, 4],
  [14, 4], [15, 4],
]);

export const LEVEL59: LevelDef = {
  id: 'level59',
  name: "The Long Dark",
  blurb: "One long road with no dawn at the end.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 540,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 28, spacing: 0.17 }] },
    { entries: [{ enemyId: 'gloomwing', count: 16, spacing: 0.22 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 5, spacing: 0.6 }] },
    { entries: [{ enemyId: 'nullwraith', count: 5, spacing: 0.6 }, { enemyId: 'voidmote', count: 24, spacing: 0.2 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 4, spacing: 0.8 }] },
    { entries: [{ enemyId: 'voidmote', count: 44, spacing: 0.12 }, { enemyId: 'gloomwing', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 6, spacing: 0.55 }, { enemyId: 'nullwraith', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 5, spacing: 0.7 }, { enemyId: 'voidmote', count: 30, spacing: 0.16 }] },
  ],
};
