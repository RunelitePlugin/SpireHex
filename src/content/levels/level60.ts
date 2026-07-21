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

export const LEVEL60: LevelDef = {
  id: 'level60',
  name: "Throne of the Umbrageist",
  blurb: "The Umbrageist waits. End the campaign.",
  hint: "The boss fades from sight — wards and radiant reveal it.",
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 660,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 4,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 24, spacing: 0.18, pathIndex: 0 }, { enemyId: 'voidmote', count: 24, spacing: 0.18, pathIndex: 1 }] },
    { entries: [{ enemyId: 'gloomwing', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'voidmote', count: 24, spacing: 0.18, pathIndex: 1 }] },
    { entries: [{ enemyId: 'voidmote', count: 30, spacing: 0.15, pathIndex: 0 }, { enemyId: 'gloomwing', count: 8, spacing: 0.35, pathIndex: 1 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 2, spacing: 1.0, pathIndex: 0 }, { enemyId: 'nullwraith', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'voidmote', count: 12, spacing: 0.28, pathIndex: 1 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 3, spacing: 0.8, pathIndex: 1 }, { enemyId: 'voidmote', count: 28, spacing: 0.16, pathIndex: 0 }] },
    { entries: [{ enemyId: 'gloomwing', count: 16, spacing: 0.22, pathIndex: 0 }, { enemyId: 'umbrahusk', count: 4, spacing: 0.7, pathIndex: 1 }] },
    { entries: [{ enemyId: 'nullwraith', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'voidmote', count: 17, spacing: 0.2, pathIndex: 0 }, { enemyId: 'voidmote', count: 17, spacing: 0.2, pathIndex: 1 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 5, spacing: 0.6, pathIndex: 0 }, { enemyId: 'umbrahusk', count: 3, spacing: 0.8, pathIndex: 1 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 4, spacing: 0.7, pathIndex: 1 }, { enemyId: 'gloomwing', count: 12, spacing: 0.26, pathIndex: 0 }] },
    { entries: [{ enemyId: 'voidmote', count: 38, spacing: 0.13, pathIndex: 0 }, { enemyId: 'voidmote', count: 38, spacing: 0.13, pathIndex: 1 }] },
    { entries: [{ enemyId: 'umbrageist', count: 1, spacing: 2, pathIndex: 0 }, { enemyId: 'gloomwing', count: 10, spacing: 0.32, pathIndex: 1 }, { enemyId: 'voidmote', count: 20, spacing: 0.22, pathIndex: 1 }, { enemyId: 'dreadmaw', count: 3, spacing: 0.8, pathIndex: 1 }] },
  ],
};
