import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
  [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3], [13, 3], [14, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [6, 7], [7, 7],
  [8, 7], [9, 7], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
]);

export const LEVEL34: LevelDef = {
  id: 'level34',
  name: "The Forked Lightning",
  blurb: "The road splits under a forked sky.",
  hint: "Mistwalkers ride unseen winds — post wardens on each road.",
  hexes: rectHexes(15, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 500,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 16, spacing: 0.28, pathIndex: 0 }, { enemyId: 'sparkmote', count: 16, spacing: 0.28, pathIndex: 1 }] },
    { entries: [{ enemyId: 'galestrider', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'sparkmote', count: 22, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sporeling', count: 16, spacing: 0.24, pathIndex: 0 }, { enemyId: 'mistwalker', count: 2, spacing: 0.9, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thunderhide', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'galestrider', count: 10, spacing: 0.3, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mistwalker', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'sparkmote', count: 26, spacing: 0.17, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sparkmote', count: 32, spacing: 0.15, pathIndex: 0 }, { enemyId: 'thunderhide', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sparkmote', count: 18, spacing: 0.24, pathIndex: 0 }, { enemyId: 'galestrider', count: 12, spacing: 0.26, pathIndex: 1 }, { enemyId: 'mistwalker', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'galestrider', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'mistwalker', count: 4, spacing: 0.7, pathIndex: 1 }] },
  ],
};
