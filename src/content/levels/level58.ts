import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 1], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2], [5, 2], [6, 2], [6, 3], [7, 3],
  [8, 3], [9, 3], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3], [13, 3], [14, 3], [15, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 8], [1, 8], [2, 8], [2, 7], [3, 7], [4, 7], [5, 7], [5, 8], [6, 8], [7, 8],
  [8, 8], [8, 7], [9, 7], [10, 7], [11, 7], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6],
]);

export const LEVEL58: LevelDef = {
  id: 'level58',
  name: "The Black Stair",
  blurb: "The stair descends. So do they.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 560,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 18, spacing: 0.22, pathIndex: 0 }, { enemyId: 'voidmote', count: 18, spacing: 0.22, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gloomwing', count: 10, spacing: 0.3, pathIndex: 1 }, { enemyId: 'voidmote', count: 18, spacing: 0.22, pathIndex: 0 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 2, spacing: 1.0, pathIndex: 0 }, { enemyId: 'voidmote', count: 22, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'umbrahusk', count: 2, spacing: 1.0, pathIndex: 0 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 2, spacing: 1.1, pathIndex: 0 }, { enemyId: 'voidmote', count: 22, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gloomwing', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'dreadmaw', count: 4, spacing: 0.8, pathIndex: 0 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 3, spacing: 0.9, pathIndex: 1 }, { enemyId: 'gloomwing', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'voidmote', count: 18, spacing: 0.24, pathIndex: 0 }] },
    { entries: [{ enemyId: 'nullwraith', count: 5, spacing: 0.6, pathIndex: 1 }, { enemyId: 'umbrahusk', count: 3, spacing: 0.8, pathIndex: 0 }] },
  ],
};
