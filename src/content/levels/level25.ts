import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 3], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [6, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [7, 2], [8, 2], [9, 2], [9, 3], [9, 4], [9, 5],
  [10, 5], [11, 5], [12, 5], [13, 5],
]);

export const LEVEL25: LevelDef = {
  id: 'level25',
  name: "Spore Basin",
  blurb: "The basin exhales a living fog.",
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 410,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sporeling', count: 22, spacing: 0.22 }] },
    { entries: [{ enemyId: 'sporeling', count: 32, spacing: 0.16 }] },
    { entries: [{ enemyId: 'thornhound', count: 12, spacing: 0.26 }, { enemyId: 'sporeling', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'sporeling', count: 48, spacing: 0.12 }] },
    { entries: [{ enemyId: 'driftmote', count: 30, spacing: 0.16 }, { enemyId: 'sporeling', count: 22, spacing: 0.18 }] },
    { entries: [{ enemyId: 'barkhide', count: 3, spacing: 0.8 }, { enemyId: 'sporeling', count: 32, spacing: 0.15 }] },
    { entries: [{ enemyId: 'sporeling', count: 60, spacing: 0.1 }] },
    { entries: [{ enemyId: 'sporeling', count: 40, spacing: 0.11 }, { enemyId: 'sporeling', count: 40, spacing: 0.11 }] },
  ],
};
