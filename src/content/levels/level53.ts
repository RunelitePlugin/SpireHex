import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [2, 5], [2, 4], [2, 3], [3, 3], [4, 3], [5, 3], [5, 4],
  [5, 5], [6, 5], [7, 5], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3], [11, 3], [11, 4],
  [11, 5], [12, 5], [13, 5],
]);

export const LEVEL53: LevelDef = {
  id: 'level53',
  name: "Husk Barrow",
  blurb: "The barrow mounds are walking.",
  hint: "Umbra Husks shrug bolts — pierce or heavy shells crack them.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 490,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 22, spacing: 0.2 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'gloomwing', count: 10, spacing: 0.3 }, { enemyId: 'voidmote', count: 16, spacing: 0.28 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 5, spacing: 0.7 }] },
    { entries: [{ enemyId: 'voidmote', count: 34, spacing: 0.15 }, { enemyId: 'umbrahusk', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 6, spacing: 0.6 }, { enemyId: 'gloomwing', count: 8, spacing: 0.35 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 7, spacing: 0.55 }, { enemyId: 'voidmote', count: 24, spacing: 0.2 }] },
  ],
};
