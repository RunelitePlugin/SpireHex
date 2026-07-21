import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 5], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [4, 3], [5, 3], [6, 3], [6, 4],
  [6, 5], [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [11, 4], [12, 4],
  [13, 4],
]);

export const LEVEL21: LevelDef = {
  id: 'level21',
  name: "Mossgate",
  blurb: "The forest gate creaks open.",
  hint: "Sporelings bloom in sheets — wide splash keeps them mown.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 380,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 16, spacing: 0.3 }] },
    { entries: [{ enemyId: 'sporeling', count: 26, spacing: 0.2 }] },
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.25 }, { enemyId: 'sporeling', count: 14, spacing: 0.3 }] },
    { entries: [{ enemyId: 'sporeling', count: 34, spacing: 0.16 }] },
    { entries: [{ enemyId: 'driftmote', count: 24, spacing: 0.2 }, { enemyId: 'sporeling', count: 16, spacing: 0.28 }] },
    { entries: [{ enemyId: 'sporeling', count: 44, spacing: 0.13 }] },
    { entries: [{ enemyId: 'sporeling', count: 30, spacing: 0.16 }, { enemyId: 'gloomling', count: 18, spacing: 0.22 }] },
  ],
};
