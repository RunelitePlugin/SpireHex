import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [6, 5],
  [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [10, 4], [11, 4], [11, 3], [12, 3],
  [13, 3],
]);

export const LEVEL41: LevelDef = {
  id: 'level41',
  name: "Dawnlit Ascent",
  blurb: "First light on the summit road.",
  hint: "Lumenmotes drift in dazzling swarms — splash thins them.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 500,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 18, spacing: 0.26 }] },
    { entries: [{ enemyId: 'lumenmote', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'sparkmote', count: 18, spacing: 0.22 }, { enemyId: 'lumenmote', count: 14, spacing: 0.3 }] },
    { entries: [{ enemyId: 'lumenmote', count: 36, spacing: 0.15 }] },
    { entries: [{ enemyId: 'galestrider', count: 10, spacing: 0.3 }, { enemyId: 'lumenmote', count: 20, spacing: 0.24 }] },
    { entries: [{ enemyId: 'lumenmote', count: 46, spacing: 0.12 }] },
    { entries: [{ enemyId: 'lumenmote', count: 34, spacing: 0.14 }, { enemyId: 'sparkmote', count: 20, spacing: 0.2 }] },
  ],
};
