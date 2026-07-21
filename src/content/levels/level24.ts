import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [7, 2],
  [8, 2], [9, 2], [10, 2], [11, 2], [11, 3], [12, 3], [13, 3], [14, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7],
  [8, 8], [9, 8], [10, 8], [11, 8], [11, 7], [12, 7], [13, 7], [14, 7],
]);

export const LEVEL24: LevelDef = {
  id: 'level24',
  name: "The Rootfork",
  blurb: "The great root splits the way in two.",
  hint: "Gladeshades slip by unseen — keep a warden posted.",
  hexes: rectHexes(15, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 430,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 16, spacing: 0.28, pathIndex: 0 }, { enemyId: 'sporeling', count: 16, spacing: 0.28, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thornhound', count: 8, spacing: 0.3, pathIndex: 0 }, { enemyId: 'sporeling', count: 22, spacing: 0.19, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.24, pathIndex: 0 }, { enemyId: 'gladeshade', count: 2, spacing: 0.5, pathIndex: 1 }] },
    { entries: [{ enemyId: 'barkhide', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'thornhound', count: 10, spacing: 0.3, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gladeshade', count: 3, spacing: 0.5, pathIndex: 1 }, { enemyId: 'sporeling', count: 26, spacing: 0.17, pathIndex: 0 }] },
    { entries: [{ enemyId: 'sporeling', count: 32, spacing: 0.15, pathIndex: 0 }, { enemyId: 'barkhide', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sporeling', count: 18, spacing: 0.24, pathIndex: 0 }, { enemyId: 'thornhound', count: 12, spacing: 0.26, pathIndex: 1 }, { enemyId: 'gladeshade', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'barkhide', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'thornhound', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'gladeshade', count: 4, spacing: 0.7, pathIndex: 1 }] },
  ],
};
