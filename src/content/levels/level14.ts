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

export const LEVEL14: LevelDef = {
  id: 'level14',
  name: "The Split Floe",
  blurb: "The ice cracks. Two roads over the floe.",
  hint: "Rimewraiths walk unseen — a warden lights them up.",
  hexes: rectHexes(15, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 400,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'driftmote', count: 14, spacing: 0.3, pathIndex: 0 }, { enemyId: 'driftmote', count: 14, spacing: 0.3, pathIndex: 1 }] },
    { entries: [{ enemyId: 'icefang', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'driftmote', count: 20, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gloomling', count: 14, spacing: 0.25, pathIndex: 0 }, { enemyId: 'rimewraith', count: 2, spacing: 0.9, pathIndex: 1 }] },
    { entries: [{ enemyId: 'glacierback', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'icefang', count: 10, spacing: 0.3, pathIndex: 1 }] },
    { entries: [{ enemyId: 'rimewraith', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'driftmote', count: 24, spacing: 0.18, pathIndex: 1 }] },
    { entries: [{ enemyId: 'driftmote', count: 30, spacing: 0.15, pathIndex: 0 }, { enemyId: 'glacierback', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'driftmote', count: 16, spacing: 0.25, pathIndex: 0 }, { enemyId: 'icefang', count: 12, spacing: 0.25, pathIndex: 1 }, { enemyId: 'rimewraith', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'glacierback', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'icefang', count: 12, spacing: 0.25, pathIndex: 0 }, { enemyId: 'rimewraith', count: 4, spacing: 0.7, pathIndex: 1 }] },
  ],
};
