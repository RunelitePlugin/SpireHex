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

export const LEVEL40: LevelDef = {
  id: 'level40',
  name: "Tempest Throne",
  blurb: "The Tempestcaller descends. End the Reach.",
  hint: "The Tempestcaller blinks past your kill zone — chill it.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 560,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 4,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 20, spacing: 0.22, pathIndex: 0 }, { enemyId: 'sparkmote', count: 20, spacing: 0.22, pathIndex: 1 }] },
    { entries: [{ enemyId: 'galestrider', count: 12, spacing: 0.26, pathIndex: 0 }, { enemyId: 'sparkmote', count: 26, spacing: 0.17, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'mistwalker', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'sparkmote', count: 28, spacing: 0.16, pathIndex: 0 }] },
    { entries: [{ enemyId: 'galestrider', count: 20, spacing: 0.19, pathIndex: 0 }, { enemyId: 'thunderhide', count: 4, spacing: 0.7, pathIndex: 1 }] },
    { entries: [{ enemyId: 'mistwalker', count: 5, spacing: 0.6, pathIndex: 0 }, { enemyId: 'sparkmote', count: 36, spacing: 0.13, pathIndex: 1 }] },
    { entries: [{ enemyId: 'thunderhide', count: 5, spacing: 0.6, pathIndex: 0 }, { enemyId: 'thunderhide', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'stormbrute', count: 5, spacing: 0.6, pathIndex: 1 }, { enemyId: 'galestrider', count: 16, spacing: 0.22, pathIndex: 0 }] },
    { entries: [{ enemyId: 'sparkmote', count: 40, spacing: 0.12, pathIndex: 0 }, { enemyId: 'sparkmote', count: 40, spacing: 0.12, pathIndex: 1 }] },
    { entries: [{ enemyId: 'tempestcaller', count: 1, spacing: 2, pathIndex: 0 }, { enemyId: 'galestrider', count: 16, spacing: 0.28, pathIndex: 1 }, { enemyId: 'sparkmote', count: 30, spacing: 0.17, pathIndex: 1 }, { enemyId: 'stormbrute', count: 4, spacing: 0.7, pathIndex: 1 }] },
  ],
};
