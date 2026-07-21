import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [2, 5], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6],
  [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3], [11, 3], [11, 4],
  [12, 4], [13, 4], [14, 4],
]);

export const LEVEL32: LevelDef = {
  id: 'level32',
  name: "Galewind Flats",
  blurb: "Nothing on the flats slows the wind.",
  hint: "Galestriders outrun everything — slow them or lose them.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 450,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'galestrider', count: 8, spacing: 0.45 }] },
    { entries: [{ enemyId: 'sparkmote', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'galestrider', count: 12, spacing: 0.3 }, { enemyId: 'sparkmote', count: 14, spacing: 0.3 }] },
    { entries: [{ enemyId: 'thornhound', count: 14, spacing: 0.24 }, { enemyId: 'galestrider', count: 8, spacing: 0.4 }] },
    { entries: [{ enemyId: 'sparkmote', count: 36, spacing: 0.15 }] },
    { entries: [{ enemyId: 'galestrider', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'galestrider', count: 14, spacing: 0.25 }, { enemyId: 'sparkmote', count: 26, spacing: 0.17 }] },
  ],
};
