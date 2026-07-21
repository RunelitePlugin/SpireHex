import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [4, 3], [5, 3], [6, 3], [6, 2], [7, 2],
  [8, 2], [9, 2], [9, 3], [10, 3], [11, 3], [12, 3], [12, 4], [13, 4], [14, 4],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [2, 6], [3, 6], [4, 6], [5, 6], [5, 7], [6, 7], [7, 7],
  [8, 7], [8, 6], [9, 6], [10, 6], [11, 6], [11, 5], [12, 5], [13, 5], [14, 5],
]);

export const LEVEL54: LevelDef = {
  id: 'level54',
  name: "Veilsplit Hollow",
  blurb: "Two roads; one of them lies.",
  hint: "Nullwraiths walk unseen on the south road — ward or pierce.",
  hexes: rectHexes(15, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 500,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 16, spacing: 0.24, pathIndex: 0 }, { enemyId: 'voidmote', count: 16, spacing: 0.24, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gloomwing', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'voidmote', count: 20, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'voidmote', count: 18, spacing: 0.24, pathIndex: 0 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 2, spacing: 1.0, pathIndex: 0 }, { enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'voidmote', count: 26, spacing: 0.18, pathIndex: 0 }, { enemyId: 'gloomwing', count: 8, spacing: 0.35, pathIndex: 1 }] },
    { entries: [{ enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'umbrahusk', count: 3, spacing: 0.8, pathIndex: 0 }] },
    { entries: [{ enemyId: 'gloomwing', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'voidmote', count: 16, spacing: 0.22, pathIndex: 1 }] },
  ],
};
