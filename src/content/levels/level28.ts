import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [5, 2], [6, 2], [7, 2], [8, 2],
  [9, 2], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [13, 4], [14, 4], [15, 4],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [3, 7], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [7, 7],
  [8, 7], [9, 7], [10, 7], [10, 8], [11, 8], [12, 8], [13, 8], [13, 7], [14, 7], [15, 7],
]);

export const LEVEL28: LevelDef = {
  id: 'level28',
  name: "Twin Roots",
  blurb: "Two roots of the World-tree. Hold both.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 470,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 18, spacing: 0.24, pathIndex: 0 }, { enemyId: 'sporeling', count: 18, spacing: 0.24, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thornhound', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'barkhide', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gladeshade', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'sporeling', count: 30, spacing: 0.15, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mirehulk', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'thornhound', count: 12, spacing: 0.26, pathIndex: 0 }] },
    { entries: [{ enemyId: 'sporeling', count: 36, spacing: 0.13, pathIndex: 0 }, { enemyId: 'sporeling', count: 36, spacing: 0.13, pathIndex: 1 }] },
    { entries: [{ enemyId: 'barkhide', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'gladeshade', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mirehulk', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'sporeling', count: 30, spacing: 0.15, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thornhound', count: 16, spacing: 0.22, pathIndex: 1 }, { enemyId: 'barkhide', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'sporeling', count: 22, spacing: 0.19, pathIndex: 0 }] },
    { entries: [{ enemyId: 'mirehulk', count: 4, spacing: 0.6, pathIndex: 0 }, { enemyId: 'gladeshade', count: 3, spacing: 0.7, pathIndex: 1 }, { enemyId: 'thornhound', count: 12, spacing: 0.26, pathIndex: 1 }] },
  ],
};
