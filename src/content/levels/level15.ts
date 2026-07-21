import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [4, 4], [4, 5], [4, 6], [5, 6], [6, 6],
  [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [10, 4],
  [10, 5], [11, 5], [12, 5], [13, 5],
]);

export const LEVEL15: LevelDef = {
  id: 'level15',
  name: "Drift Hollow",
  blurb: "The hollow fills with powder snow.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 380,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'driftmote', count: 20, spacing: 0.25 }] },
    { entries: [{ enemyId: 'driftmote', count: 30, spacing: 0.18 }] },
    { entries: [{ enemyId: 'icefang', count: 12, spacing: 0.28 }, { enemyId: 'driftmote', count: 16, spacing: 0.25 }] },
    { entries: [{ enemyId: 'driftmote', count: 44, spacing: 0.13 }] },
    { entries: [{ enemyId: 'frostmite', count: 36, spacing: 0.14 }, { enemyId: 'driftmote', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'glacierback', count: 3, spacing: 0.8 }, { enemyId: 'driftmote', count: 30, spacing: 0.16 }] },
    { entries: [{ enemyId: 'driftmote', count: 56, spacing: 0.11 }] },
    { entries: [{ enemyId: 'driftmote', count: 40, spacing: 0.12 }, { enemyId: 'driftmote', count: 40, spacing: 0.12 }] },
  ],
};
