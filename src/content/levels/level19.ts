import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [6, 4], [7, 4], [8, 4], [8, 5], [8, 6], [9, 6], [10, 6], [11, 6], [11, 5], [11, 4],
  [12, 4], [13, 4], [13, 3], [14, 3], [15, 3],
]);

export const LEVEL19: LevelDef = {
  id: 'level19',
  name: "The Long Col",
  blurb: "One narrow pass. The whole biome walks it.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 440,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'driftmote', count: 26, spacing: 0.18 }] },
    { entries: [{ enemyId: 'icefang', count: 14, spacing: 0.24 }, { enemyId: 'driftmote', count: 14, spacing: 0.26 }] },
    { entries: [{ enemyId: 'glacierback', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'rimewraith', count: 4, spacing: 0.7 }, { enemyId: 'driftmote', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'frostbrand', count: 4, spacing: 0.7 }, { enemyId: 'icefang', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'driftmote', count: 52, spacing: 0.11 }] },
    { entries: [{ enemyId: 'glacierback', count: 5, spacing: 0.6 }, { enemyId: 'rimewraith', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'frostbrand', count: 5, spacing: 0.6 }, { enemyId: 'driftmote', count: 28, spacing: 0.16 }] },
    { entries: [{ enemyId: 'glacierback', count: 4, spacing: 0.7 }, { enemyId: 'frostbrand', count: 4, spacing: 0.7 }, { enemyId: 'icefang', count: 14, spacing: 0.24 }] },
  ],
};
