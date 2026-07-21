import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [6, 4], [7, 4], [8, 4], [8, 5], [8, 6], [9, 6], [10, 6], [11, 6], [11, 5], [11, 4],
  [12, 4], [13, 4], [13, 3], [14, 3], [15, 3],
]);

export const LEVEL39: LevelDef = {
  id: 'level39',
  name: "The Conduit",
  blurb: "One conduit carries the whole storm.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 530,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 28, spacing: 0.17 }] },
    { entries: [{ enemyId: 'galestrider', count: 15, spacing: 0.23 }, { enemyId: 'sparkmote', count: 14, spacing: 0.26 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'mistwalker', count: 4, spacing: 0.7 }, { enemyId: 'sparkmote', count: 22, spacing: 0.19 }] },
    { entries: [{ enemyId: 'stormbrute', count: 4, spacing: 0.7 }, { enemyId: 'galestrider', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'sparkmote', count: 56, spacing: 0.1 }] },
    { entries: [{ enemyId: 'thunderhide', count: 5, spacing: 0.6 }, { enemyId: 'mistwalker', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'stormbrute', count: 5, spacing: 0.6 }, { enemyId: 'sparkmote', count: 30, spacing: 0.15 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7 }, { enemyId: 'stormbrute', count: 4, spacing: 0.7 }, { enemyId: 'galestrider', count: 15, spacing: 0.23 }] },
  ],
};
