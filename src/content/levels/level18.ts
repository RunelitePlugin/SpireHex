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

export const LEVEL18: LevelDef = {
  id: 'level18',
  name: "Twin Moraines",
  blurb: "Two ridgelines of rubble ice. Hold both.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 440,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'driftmote', count: 16, spacing: 0.25, pathIndex: 0 }, { enemyId: 'driftmote', count: 16, spacing: 0.25, pathIndex: 1 }] },
    { entries: [{ enemyId: 'icefang', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'glacierback', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'rimewraith', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'driftmote', count: 26, spacing: 0.17, pathIndex: 1 }] },
    { entries: [{ enemyId: 'frostbrand', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'icefang', count: 12, spacing: 0.26, pathIndex: 0 }] },
    { entries: [{ enemyId: 'driftmote', count: 34, spacing: 0.14, pathIndex: 0 }, { enemyId: 'driftmote', count: 34, spacing: 0.14, pathIndex: 1 }] },
    { entries: [{ enemyId: 'glacierback', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'rimewraith', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'frostbrand', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'driftmote', count: 26, spacing: 0.17, pathIndex: 1 }] },
    { entries: [{ enemyId: 'icefang', count: 16, spacing: 0.22, pathIndex: 1 }, { enemyId: 'glacierback', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'driftmote', count: 20, spacing: 0.2, pathIndex: 0 }] },
    { entries: [{ enemyId: 'frostbrand', count: 5, spacing: 0.6, pathIndex: 0 }, { enemyId: 'rimewraith', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'icefang', count: 12, spacing: 0.26, pathIndex: 1 }] },
  ],
};
