import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 5], [1, 5], [2, 5], [3, 5], [3, 4], [4, 4], [5, 4], [6, 4], [6, 5], [6, 6],
  [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [11, 4], [12, 4],
  [13, 4], [14, 4],
]);

export const LEVEL26: LevelDef = {
  id: 'level26',
  name: "Mirehulk Wallow",
  blurb: "The mud stirs. Something vast stands up.",
  hint: "Mirehulks leak three lives — never let one walk home.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 430,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'mirehulk', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'sporeling', count: 32, spacing: 0.16 }] },
    { entries: [{ enemyId: 'mirehulk', count: 3, spacing: 0.8 }, { enemyId: 'thornhound', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'barkhide', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 22, spacing: 0.19 }] },
    { entries: [{ enemyId: 'mirehulk', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'gladeshade', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 28, spacing: 0.17 }] },
    { entries: [{ enemyId: 'mirehulk', count: 4, spacing: 0.7 }, { enemyId: 'thornhound', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'mirehulk', count: 5, spacing: 0.6 }, { enemyId: 'barkhide', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 22, spacing: 0.19 }] },
  ],
};
