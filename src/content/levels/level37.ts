import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
  [7, 3], [8, 3], [9, 3], [9, 4], [9, 5], [9, 6], [10, 6], [11, 6], [12, 6], [12, 5],
  [13, 5], [14, 5], [15, 5],
]);

export const LEVEL37: LevelDef = {
  id: 'level37',
  name: "Squall Alley",
  blurb: "Every squall at once. Hold the alley.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 510,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 26, spacing: 0.19 }, { enemyId: 'galestrider', count: 8, spacing: 0.35 }] },
    { entries: [{ enemyId: 'thunderhide', count: 3, spacing: 0.8 }, { enemyId: 'sparkmote', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'mistwalker', count: 3, spacing: 0.8 }, { enemyId: 'galestrider', count: 12, spacing: 0.26 }] },
    { entries: [{ enemyId: 'stormbrute', count: 3, spacing: 0.8 }, { enemyId: 'sparkmote', count: 26, spacing: 0.17 }] },
    { entries: [{ enemyId: 'galestrider', count: 22, spacing: 0.19 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7 }, { enemyId: 'mistwalker', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'sparkmote', count: 54, spacing: 0.11 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7 }, { enemyId: 'galestrider', count: 15, spacing: 0.23 }, { enemyId: 'sparkmote', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'thunderhide', count: 5, spacing: 0.6 }, { enemyId: 'mistwalker', count: 4, spacing: 0.7 }, { enemyId: 'sparkmote', count: 26, spacing: 0.17 }] },
  ],
};
