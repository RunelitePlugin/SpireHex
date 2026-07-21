import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [3, 4], [3, 5], [4, 5], [5, 5], [6, 5], [6, 4], [6, 3],
  [7, 3], [8, 3], [9, 3], [9, 4], [9, 5], [10, 5], [11, 5], [11, 4], [12, 4], [13, 4],
  [14, 4],
]);

export const LEVEL16: LevelDef = {
  id: 'level16',
  name: "Frostbrand March",
  blurb: "Giants of packed ice march in step.",
  hint: "Frostbrands are pure mass — melt them early with fire.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 400,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'frostbrand', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'driftmote', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'frostbrand', count: 3, spacing: 0.8 }, { enemyId: 'icefang', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'glacierback', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'frostbrand', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'rimewraith', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 26, spacing: 0.18 }] },
    { entries: [{ enemyId: 'frostbrand', count: 4, spacing: 0.7 }, { enemyId: 'icefang', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'frostbrand', count: 5, spacing: 0.6 }, { enemyId: 'glacierback', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 20, spacing: 0.2 }] },
  ],
};
