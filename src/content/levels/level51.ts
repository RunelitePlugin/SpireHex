import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [5, 4],
  [6, 4], [6, 5], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [9, 4], [10, 4], [10, 3],
  [10, 2], [11, 2], [12, 2], [12, 3], [12, 4], [13, 4],
]);

export const LEVEL51: LevelDef = {
  id: 'level51',
  name: "Nightfall Threshold",
  blurb: "The last descent begins.",
  hint: "Voidmotes flood in sheets — sunfire splash melts them.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 470,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 18, spacing: 0.28 }] },
    { entries: [{ enemyId: 'voidmote', count: 28, spacing: 0.2 }] },
    { entries: [{ enemyId: 'lumenmote', count: 18, spacing: 0.24 }, { enemyId: 'voidmote', count: 14, spacing: 0.3 }] },
    { entries: [{ enemyId: 'voidmote', count: 36, spacing: 0.16 }] },
    { entries: [{ enemyId: 'raywisp', count: 10, spacing: 0.3 }, { enemyId: 'voidmote', count: 18, spacing: 0.26 }] },
    { entries: [{ enemyId: 'voidmote', count: 46, spacing: 0.13 }] },
    { entries: [{ enemyId: 'voidmote', count: 34, spacing: 0.15 }, { enemyId: 'lumenmote', count: 20, spacing: 0.2 }] },
  ],
};
