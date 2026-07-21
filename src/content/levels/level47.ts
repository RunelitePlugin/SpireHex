import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 5], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
  [7, 4], [8, 4], [9, 4], [9, 5], [9, 6], [10, 6], [11, 6], [12, 6], [12, 5], [12, 4],
  [13, 4], [14, 4], [15, 4],
]);

export const LEVEL47: LevelDef = {
  id: 'level47',
  name: "Zenith Steps",
  blurb: "The steps climb into blinding sky.",
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 570,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'lumenmote', count: 28, spacing: 0.18 }, { enemyId: 'raywisp', count: 8, spacing: 0.35 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 3, spacing: 0.8 }, { enemyId: 'lumenmote', count: 22, spacing: 0.19 }] },
    { entries: [{ enemyId: 'veilseraph', count: 3, spacing: 0.8 }, { enemyId: 'raywisp', count: 12, spacing: 0.26 }] },
    { entries: [{ enemyId: 'sungrazer', count: 3, spacing: 0.8 }, { enemyId: 'lumenmote', count: 28, spacing: 0.16 }] },
    { entries: [{ enemyId: 'raywisp', count: 22, spacing: 0.19 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 4, spacing: 0.7 }, { enemyId: 'veilseraph', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'lumenmote', count: 58, spacing: 0.1 }] },
    { entries: [{ enemyId: 'sungrazer', count: 4, spacing: 0.7 }, { enemyId: 'raywisp', count: 15, spacing: 0.23 }, { enemyId: 'lumenmote', count: 20, spacing: 0.21 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 5, spacing: 0.6 }, { enemyId: 'veilseraph', count: 4, spacing: 0.7 }, { enemyId: 'lumenmote', count: 28, spacing: 0.16 }] },
  ],
};
