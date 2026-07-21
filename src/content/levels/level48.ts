import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [6, 3], [7, 3], [8, 3],
  [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [13, 3], [14, 3], [15, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 8], [1, 8], [2, 8], [3, 8], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 8],
  [8, 8], [9, 8], [10, 8], [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7],
]);

export const LEVEL48: LevelDef = {
  id: 'level48',
  name: "Twin Prisms",
  blurb: "Twin prisms scatter the host.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 590,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 18, spacing: 0.22, pathIndex: 0 }, { enemyId: 'lumenmote', count: 18, spacing: 0.22, pathIndex: 1 }] },
    { entries: [{ enemyId: 'raywisp', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'aegisbearer', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'veilseraph', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'lumenmote', count: 30, spacing: 0.15, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sungrazer', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'raywisp', count: 12, spacing: 0.26, pathIndex: 0 }] },
    { entries: [{ enemyId: 'lumenmote', count: 32, spacing: 0.14, pathIndex: 0 }, { enemyId: 'lumenmote', count: 32, spacing: 0.14, pathIndex: 1 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'veilseraph', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sungrazer', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'lumenmote', count: 30, spacing: 0.15, pathIndex: 1 }] },
    { entries: [{ enemyId: 'raywisp', count: 14, spacing: 0.24, pathIndex: 1 }, { enemyId: 'aegisbearer', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'lumenmote', count: 24, spacing: 0.18, pathIndex: 0 }] },
    { entries: [{ enemyId: 'sungrazer', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'veilseraph', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'raywisp', count: 12, spacing: 0.26, pathIndex: 1 }] },
  ],
};
