import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
  [7, 3], [8, 3], [9, 3], [9, 4], [9, 5], [9, 6], [10, 6], [11, 6], [12, 6], [12, 5],
  [13, 5], [14, 5], [15, 5],
]);

export const LEVEL17: LevelDef = {
  id: 'level17',
  name: "Whiteout Bend",
  blurb: "Visibility zero. Everything at once.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 420,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'driftmote', count: 24, spacing: 0.2 }, { enemyId: 'icefang', count: 8, spacing: 0.35 }] },
    { entries: [{ enemyId: 'glacierback', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'rimewraith', count: 3, spacing: 0.8 }, { enemyId: 'icefang', count: 12, spacing: 0.26 }] },
    { entries: [{ enemyId: 'frostbrand', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 24, spacing: 0.18 }] },
    { entries: [{ enemyId: 'icefang', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'glacierback', count: 4, spacing: 0.7 }, { enemyId: 'rimewraith', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'driftmote', count: 48, spacing: 0.12 }] },
    { entries: [{ enemyId: 'frostbrand', count: 4, spacing: 0.7 }, { enemyId: 'icefang', count: 14, spacing: 0.24 }, { enemyId: 'driftmote', count: 16, spacing: 0.24 }] },
    { entries: [{ enemyId: 'glacierback', count: 5, spacing: 0.6 }, { enemyId: 'rimewraith', count: 4, spacing: 0.7 }, { enemyId: 'driftmote', count: 24, spacing: 0.18 }] },
  ],
};
