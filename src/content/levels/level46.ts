import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [4, 3], [5, 3], [5, 4], [5, 5], [6, 5],
  [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [11, 4], [12, 4], [13, 4],
  [14, 4],
]);

export const LEVEL46: LevelDef = {
  id: 'level46',
  name: "Sungrazer Pass",
  blurb: "Grazing colossi burn up the pass.",
  hint: "Sungrazers leak three lives — stop them or pay dearly.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 550,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sungrazer', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'lumenmote', count: 32, spacing: 0.16 }] },
    { entries: [{ enemyId: 'sungrazer', count: 3, spacing: 0.8 }, { enemyId: 'raywisp', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 3, spacing: 0.8 }, { enemyId: 'lumenmote', count: 24, spacing: 0.19 }] },
    { entries: [{ enemyId: 'sungrazer', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'veilseraph', count: 3, spacing: 0.8 }, { enemyId: 'lumenmote', count: 30, spacing: 0.16 }] },
    { entries: [{ enemyId: 'sungrazer', count: 4, spacing: 0.7 }, { enemyId: 'raywisp', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'sungrazer', count: 5, spacing: 0.6 }, { enemyId: 'aegisbearer', count: 3, spacing: 0.8 }, { enemyId: 'lumenmote', count: 24, spacing: 0.18 }] },
  ],
};
