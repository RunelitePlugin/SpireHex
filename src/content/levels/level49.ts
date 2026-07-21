import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [6, 4], [7, 4], [8, 4], [8, 5], [8, 6], [9, 6], [10, 6], [11, 6], [11, 5], [11, 4],
  [12, 4], [13, 4], [13, 3], [14, 3], [15, 3],
]);

export const LEVEL49: LevelDef = {
  id: 'level49',
  name: "The Last Stair",
  blurb: "The last stair. Everything descends.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 590,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 30, spacing: 0.16 }] },
    { entries: [{ enemyId: 'raywisp', count: 16, spacing: 0.22 }, { enemyId: 'lumenmote', count: 14, spacing: 0.26 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'veilseraph', count: 4, spacing: 0.7 }, { enemyId: 'lumenmote', count: 24, spacing: 0.18 }] },
    { entries: [{ enemyId: 'sungrazer', count: 4, spacing: 0.7 }, { enemyId: 'raywisp', count: 10, spacing: 0.3 }] },
    { entries: [{ enemyId: 'lumenmote', count: 60, spacing: 0.09 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 5, spacing: 0.6 }, { enemyId: 'veilseraph', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'sungrazer', count: 5, spacing: 0.6 }, { enemyId: 'lumenmote', count: 32, spacing: 0.14 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 4, spacing: 0.7 }, { enemyId: 'sungrazer', count: 4, spacing: 0.7 }, { enemyId: 'raywisp', count: 16, spacing: 0.22 }] },
  ],
};
