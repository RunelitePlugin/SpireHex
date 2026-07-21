import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 5], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2], [6, 2],
  [6, 3], [6, 4], [7, 4], [8, 4], [9, 4], [9, 5], [9, 6], [9, 7], [10, 7], [11, 7],
  [11, 6], [11, 5], [12, 5], [13, 5],
]);

export const LEVEL57: LevelDef = {
  id: 'level57',
  name: "The Umbral Gauntlet",
  blurb: "Everything the Depths have, at once.",
  hexes: rectHexes(14, 10),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 520,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 26, spacing: 0.18 }] },
    { entries: [{ enemyId: 'gloomwing', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 4, spacing: 0.7 }, { enemyId: 'voidmote', count: 22, spacing: 0.2 }] },
    { entries: [{ enemyId: 'nullwraith', count: 4, spacing: 0.7 }, { enemyId: 'gloomwing', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 3, spacing: 0.9 }, { enemyId: 'voidmote', count: 28, spacing: 0.17 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 5, spacing: 0.6 }, { enemyId: 'nullwraith', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 4, spacing: 0.8 }, { enemyId: 'gloomwing', count: 14, spacing: 0.24 }, { enemyId: 'voidmote', count: 24, spacing: 0.2 }] },
  ],
};
