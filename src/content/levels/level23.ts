import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [2, 5], [2, 4], [2, 3], [3, 3], [4, 3], [5, 3], [5, 4],
  [5, 5], [6, 5], [7, 5], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3], [10, 4], [10, 5],
  [11, 5], [12, 5], [13, 5],
]);

export const LEVEL23: LevelDef = {
  id: 'level23',
  name: "Barkhide Grove",
  blurb: "Walking trees with hides like iron.",
  hint: "Barkhide plates eat small hits — bring your biggest guns.",
  hexes: rectHexes(14, 10),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 400,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'barkhide', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'sporeling', count: 30, spacing: 0.17 }] },
    { entries: [{ enemyId: 'barkhide', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 14, spacing: 0.28 }] },
    { entries: [{ enemyId: 'thornhound', count: 14, spacing: 0.25 }] },
    { entries: [{ enemyId: 'barkhide', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'sporeling', count: 40, spacing: 0.14 }, { enemyId: 'barkhide', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'thornhound', count: 16, spacing: 0.22 }, { enemyId: 'barkhide', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'barkhide', count: 5, spacing: 0.65 }, { enemyId: 'sporeling', count: 24, spacing: 0.18 }] },
  ],
};
