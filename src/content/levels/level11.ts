import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [6, 5],
  [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [10, 4], [11, 4], [11, 3], [12, 3],
  [13, 3],
]);

export const LEVEL11: LevelDef = {
  id: 'level11',
  name: "Snowline Pass",
  blurb: "Cold winds rise. Frostfell begins.",
  hint: "Driftmotes swarm in flurries — splash and burn thin them.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 340,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'driftmote', count: 16, spacing: 0.3 }] },
    { entries: [{ enemyId: 'driftmote', count: 24, spacing: 0.22 }] },
    { entries: [{ enemyId: 'gloomling', count: 14, spacing: 0.3 }, { enemyId: 'driftmote', count: 12, spacing: 0.35 }] },
    { entries: [{ enemyId: 'driftmote', count: 30, spacing: 0.18 }] },
    { entries: [{ enemyId: 'gloomling', count: 20, spacing: 0.22 }, { enemyId: 'driftmote', count: 16, spacing: 0.3 }] },
    { entries: [{ enemyId: 'driftmote', count: 40, spacing: 0.15 }] },
    { entries: [{ enemyId: 'driftmote', count: 30, spacing: 0.16 }, { enemyId: 'gloomling', count: 16, spacing: 0.25 }] },
  ],
};
