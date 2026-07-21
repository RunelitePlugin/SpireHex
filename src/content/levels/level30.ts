import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
  [8, 2], [9, 2], [10, 2], [11, 2], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 8], [1, 8], [2, 8], [3, 8], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 8],
  [8, 8], [9, 8], [10, 8], [11, 8], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7],
]);

export const LEVEL30: LevelDef = {
  id: 'level30',
  name: "Heart of the Deep",
  blurb: "The Verdantheart beats. End the Deep.",
  hint: "The Verdantheart regrows — outpace it or drown in adds.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 520,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 4,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 20, spacing: 0.22, pathIndex: 0 }, { enemyId: 'sporeling', count: 20, spacing: 0.22, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thornhound', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'sporeling', count: 26, spacing: 0.17, pathIndex: 1 }] },
    { entries: [{ enemyId: 'barkhide', count: 2, spacing: 0.8, pathIndex: 0 }, { enemyId: 'gladeshade', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mirehulk', count: 2, spacing: 0.7, pathIndex: 1 }, { enemyId: 'sporeling', count: 26, spacing: 0.16, pathIndex: 0 }] },
    { entries: [{ enemyId: 'thornhound', count: 18, spacing: 0.2, pathIndex: 0 }, { enemyId: 'barkhide', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gladeshade', count: 3, spacing: 0.7, pathIndex: 0 }, { enemyId: 'sporeling', count: 36, spacing: 0.13, pathIndex: 1 }] },
    { entries: [{ enemyId: 'barkhide', count: 5, spacing: 0.6, pathIndex: 0 }, { enemyId: 'mirehulk', count: 3, spacing: 0.7, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mirehulk', count: 5, spacing: 0.6, pathIndex: 1 }, { enemyId: 'thornhound', count: 14, spacing: 0.24, pathIndex: 0 }] },
    { entries: [{ enemyId: 'sporeling', count: 40, spacing: 0.1, pathIndex: 0 }, { enemyId: 'sporeling', count: 40, spacing: 0.1, pathIndex: 1 }] },
    { entries: [{ enemyId: 'verdantheart', count: 1, spacing: 2, pathIndex: 0 }, { enemyId: 'thornhound', count: 12, spacing: 0.3, pathIndex: 1 }, { enemyId: 'sporeling', count: 26, spacing: 0.18, pathIndex: 1 }, { enemyId: 'mirehulk', count: 3, spacing: 0.8, pathIndex: 1 }] },
  ],
};
