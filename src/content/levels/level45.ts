import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [7, 3], [7, 4], [7, 5], [7, 6], [8, 6], [9, 6], [10, 6], [10, 5], [10, 4], [11, 4],
  [12, 4], [13, 4], [14, 4],
]);

export const LEVEL45: LevelDef = {
  id: 'level45',
  name: "Glimmer Flood",
  blurb: "Light floods every step of the stair.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 530,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 32, spacing: 0.19 }] },
    { entries: [{ enemyId: 'lumenmote', count: 42, spacing: 0.14 }] },
    { entries: [{ enemyId: 'lumenmote', count: 34, spacing: 0.16 }, { enemyId: 'sparkmote', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'lumenmote', count: 54, spacing: 0.1 }] },
    { entries: [{ enemyId: 'raywisp', count: 10, spacing: 0.3 }, { enemyId: 'lumenmote', count: 38, spacing: 0.13 }] },
    { entries: [{ enemyId: 'lumenmote', count: 62, spacing: 0.09 }] },
    { entries: [{ enemyId: 'lumenmote', count: 50, spacing: 0.11 }, { enemyId: 'lumenmote', count: 26, spacing: 0.19 }] },
  ],
};
