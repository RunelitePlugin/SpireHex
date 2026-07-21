import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [4, 3], [5, 3], [6, 3], [7, 3], [7, 2],
  [8, 2], [9, 2], [10, 2], [11, 2], [11, 3], [12, 3], [13, 3], [14, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [3, 7], [3, 6], [4, 6], [5, 6], [6, 6], [6, 7], [7, 7],
  [8, 7], [9, 7], [10, 7], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
]);

export const LEVEL44: LevelDef = {
  id: 'level44',
  name: "The Split Halo",
  blurb: "The halo splits. Watch both arcs.",
  hint: "Veilseraphs climb the south arc — a warden there sees true.",
  hexes: rectHexes(15, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 560,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 16, spacing: 0.26, pathIndex: 0 }, { enemyId: 'lumenmote', count: 16, spacing: 0.26, pathIndex: 1 }] },
    { entries: [{ enemyId: 'raywisp', count: 8, spacing: 0.35, pathIndex: 0 }, { enemyId: 'lumenmote', count: 20, spacing: 0.22, pathIndex: 1 }] },
    { entries: [{ enemyId: 'sparkmote', count: 20, spacing: 0.2, pathIndex: 0 }, { enemyId: 'veilseraph', count: 2, spacing: 0.9, pathIndex: 1 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 2, spacing: 0.9, pathIndex: 0 }, { enemyId: 'raywisp', count: 8, spacing: 0.35, pathIndex: 1 }] },
    { entries: [{ enemyId: 'veilseraph', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'lumenmote', count: 26, spacing: 0.17, pathIndex: 0 }] },
    { entries: [{ enemyId: 'lumenmote', count: 26, spacing: 0.17, pathIndex: 0 }, { enemyId: 'aegisbearer', count: 2, spacing: 0.9, pathIndex: 1 }] },
    { entries: [{ enemyId: 'lumenmote', count: 18, spacing: 0.24, pathIndex: 0 }, { enemyId: 'raywisp', count: 10, spacing: 0.3, pathIndex: 1 }, { enemyId: 'veilseraph', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'raywisp', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'veilseraph', count: 4, spacing: 0.7, pathIndex: 1 }] },
  ],
};
