import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 5], [2, 6], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4],
  [6, 4], [7, 4], [8, 4], [8, 3], [8, 2], [9, 2], [10, 2], [11, 2], [11, 3], [11, 4],
  [12, 4], [13, 4], [13, 5], [14, 5], [15, 5],
]);

export const LEVEL29: LevelDef = {
  id: 'level29',
  name: "The Deepway",
  blurb: "The oldest road under the oldest trees.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 470,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 30, spacing: 0.16 }] },
    { entries: [{ enemyId: 'thornhound', count: 14, spacing: 0.24 }, { enemyId: 'sporeling', count: 16, spacing: 0.24 }] },
    { entries: [{ enemyId: 'barkhide', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'gladeshade', count: 4, spacing: 0.7 }, { enemyId: 'sporeling', count: 24, spacing: 0.18 }] },
    { entries: [{ enemyId: 'mirehulk', count: 4, spacing: 0.7 }, { enemyId: 'thornhound', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'sporeling', count: 56, spacing: 0.1 }] },
    { entries: [{ enemyId: 'barkhide', count: 5, spacing: 0.6 }, { enemyId: 'gladeshade', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'mirehulk', count: 5, spacing: 0.6 }, { enemyId: 'sporeling', count: 32, spacing: 0.14 }] },
    { entries: [{ enemyId: 'barkhide', count: 4, spacing: 0.7 }, { enemyId: 'mirehulk', count: 4, spacing: 0.7 }, { enemyId: 'thornhound', count: 14, spacing: 0.24 }] },
  ],
};
