import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [4, 3], [5, 3], [6, 3], [6, 4], [6, 5],
  [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [11, 4], [12, 4], [13, 4],
  [14, 4],
]);

export const LEVEL36: LevelDef = {
  id: 'level36',
  name: "Brute Front",
  blurb: "Thunderheads walk the front line.",
  hint: "Stormbrutes are walking thunderheads — burn them early.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 490,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'stormbrute', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'sparkmote', count: 30, spacing: 0.17 }] },
    { entries: [{ enemyId: 'stormbrute', count: 3, spacing: 0.8 }, { enemyId: 'galestrider', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'thunderhide', count: 3, spacing: 0.8 }, { enemyId: 'sparkmote', count: 22, spacing: 0.2 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'mistwalker', count: 3, spacing: 0.8 }, { enemyId: 'sparkmote', count: 28, spacing: 0.17 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7 }, { enemyId: 'galestrider', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'stormbrute', count: 5, spacing: 0.6 }, { enemyId: 'thunderhide', count: 3, spacing: 0.8 }, { enemyId: 'sparkmote', count: 22, spacing: 0.2 }] },
  ],
};
