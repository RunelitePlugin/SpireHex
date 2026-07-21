import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [5, 5], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3],
  [11, 3], [11, 4], [12, 4], [13, 4],
]);

export const LEVEL13: LevelDef = {
  id: 'level13',
  name: "Glacier Wall",
  blurb: "Plated crawlers grind down the ice road.",
  hint: "Glacierbacks shrug small hits — heavy shots crack them.",
  hexes: rectHexes(14, 10),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 360,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'glacierback', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'driftmote', count: 26, spacing: 0.2 }] },
    { entries: [{ enemyId: 'glacierback', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 12, spacing: 0.3 }] },
    { entries: [{ enemyId: 'icefang', count: 14, spacing: 0.25 }] },
    { entries: [{ enemyId: 'glacierback', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'driftmote', count: 34, spacing: 0.15 }, { enemyId: 'glacierback', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'icefang', count: 16, spacing: 0.22 }, { enemyId: 'glacierback', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'glacierback', count: 6, spacing: 0.6 }, { enemyId: 'driftmote', count: 20, spacing: 0.2 }] },
  ],
};
