import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [3, 6], [3, 5], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
  [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3],
  [13, 3], [14, 3], [15, 3],
]);

export const LEVEL27: LevelDef = {
  id: 'level27',
  name: "Canopy Switchback",
  blurb: "The path climbs through every ambush.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 450,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 26, spacing: 0.18 }, { enemyId: 'thornhound', count: 8, spacing: 0.34 }] },
    { entries: [{ enemyId: 'barkhide', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'gladeshade', count: 3, spacing: 0.8 }, { enemyId: 'thornhound', count: 12, spacing: 0.26 }] },
    { entries: [{ enemyId: 'mirehulk', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 26, spacing: 0.17 }] },
    { entries: [{ enemyId: 'thornhound', count: 20, spacing: 0.2 }] },
    { entries: [{ enemyId: 'barkhide', count: 4, spacing: 0.7 }, { enemyId: 'gladeshade', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'sporeling', count: 52, spacing: 0.11 }] },
    { entries: [{ enemyId: 'mirehulk', count: 4, spacing: 0.7 }, { enemyId: 'thornhound', count: 14, spacing: 0.24 }, { enemyId: 'sporeling', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'barkhide', count: 5, spacing: 0.6 }, { enemyId: 'gladeshade', count: 4, spacing: 0.7 }, { enemyId: 'sporeling', count: 26, spacing: 0.17 }] },
  ],
};
