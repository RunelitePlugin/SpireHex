import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [6, 3], [7, 3], [8, 3],
  [9, 3], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [13, 3], [14, 3], [15, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 8], [1, 8], [2, 8], [3, 8], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 8],
  [8, 8], [9, 8], [10, 8], [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7],
]);

export const LEVEL38: LevelDef = {
  id: 'level38',
  name: "Twin Cyclones",
  blurb: "Two cyclones. Two roads. No shelter.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 530,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 18, spacing: 0.24, pathIndex: 0 }, { enemyId: 'sparkmote', count: 18, spacing: 0.24, pathIndex: 1 }] },
    { entries: [{ enemyId: 'galestrider', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'thunderhide', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mistwalker', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'sparkmote', count: 24, spacing: 0.18, pathIndex: 1 }] },
    { entries: [{ enemyId: 'stormbrute', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'galestrider', count: 10, spacing: 0.3, pathIndex: 0 }] },
    { entries: [{ enemyId: 'sparkmote', count: 30, spacing: 0.15, pathIndex: 0 }, { enemyId: 'sparkmote', count: 30, spacing: 0.15, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'mistwalker', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'sparkmote', count: 24, spacing: 0.18, pathIndex: 1 }] },
    { entries: [{ enemyId: 'galestrider', count: 14, spacing: 0.24, pathIndex: 1 }, { enemyId: 'thunderhide', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'sparkmote', count: 22, spacing: 0.19, pathIndex: 0 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'mistwalker', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'galestrider', count: 12, spacing: 0.26, pathIndex: 1 }] },
  ],
};
