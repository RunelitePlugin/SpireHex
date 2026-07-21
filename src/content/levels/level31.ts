import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2], [6, 2], [6, 3],
  [6, 4], [6, 5], [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [12, 3],
  [12, 4], [13, 4],
]);

export const LEVEL31: LevelDef = {
  id: 'level31',
  name: "Stormfront Steppe",
  blurb: "Static rolls in off the peaks.",
  hint: "Sparkmotes flood in sheets — thorns and splash mow them.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 440,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 18, spacing: 0.28 }] },
    { entries: [{ enemyId: 'sparkmote', count: 26, spacing: 0.2 }] },
    { entries: [{ enemyId: 'sporeling', count: 16, spacing: 0.26 }, { enemyId: 'sparkmote', count: 14, spacing: 0.3 }] },
    { entries: [{ enemyId: 'sparkmote', count: 34, spacing: 0.16 }] },
    { entries: [{ enemyId: 'thornhound', count: 12, spacing: 0.28 }, { enemyId: 'sparkmote', count: 18, spacing: 0.26 }] },
    { entries: [{ enemyId: 'sparkmote', count: 44, spacing: 0.13 }] },
    { entries: [{ enemyId: 'sparkmote', count: 32, spacing: 0.15 }, { enemyId: 'sporeling', count: 18, spacing: 0.22 }] },
  ],
};
