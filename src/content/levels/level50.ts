import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
  [8, 3], [9, 3], [10, 3], [11, 3], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [3, 7], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [7, 7],
  [8, 7], [9, 7], [10, 7], [11, 7], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6],
]);

export const LEVEL50: LevelDef = {
  id: 'level50',
  name: "Luminarch Sanctum",
  blurb: "The Luminarch shines. End the ascent.",
  hint: "The Luminarch shields in cycles — slow it and outlast.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 620,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 4,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 22, spacing: 0.2, pathIndex: 0 }, { enemyId: 'lumenmote', count: 22, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'raywisp', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'lumenmote', count: 28, spacing: 0.16, pathIndex: 1 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'veilseraph', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sungrazer', count: 5, spacing: 0.6, pathIndex: 1 }, { enemyId: 'lumenmote', count: 34, spacing: 0.13, pathIndex: 0 }] },
    { entries: [{ enemyId: 'raywisp', count: 24, spacing: 0.17, pathIndex: 0 }, { enemyId: 'aegisbearer', count: 4, spacing: 0.7, pathIndex: 1 }] },
    { entries: [{ enemyId: 'veilseraph', count: 5, spacing: 0.6, pathIndex: 0 }, { enemyId: 'lumenmote', count: 44, spacing: 0.11, pathIndex: 1 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 6, spacing: 0.55, pathIndex: 0 }, { enemyId: 'aegisbearer', count: 4, spacing: 0.7, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sungrazer', count: 6, spacing: 0.55, pathIndex: 1 }, { enemyId: 'raywisp', count: 16, spacing: 0.22, pathIndex: 0 }] },
    { entries: [{ enemyId: 'lumenmote', count: 48, spacing: 0.1, pathIndex: 0 }, { enemyId: 'lumenmote', count: 48, spacing: 0.1, pathIndex: 1 }] },
    { entries: [{ enemyId: 'luminarch', count: 1, spacing: 2, pathIndex: 0 }, { enemyId: 'raywisp', count: 14, spacing: 0.3, pathIndex: 1 }, { enemyId: 'lumenmote', count: 30, spacing: 0.17, pathIndex: 1 }, { enemyId: 'sungrazer', count: 4, spacing: 0.7, pathIndex: 1 }] },
  ],
};
