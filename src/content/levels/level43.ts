import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [5, 4],
  [6, 4], [6, 5], [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [10, 4], [11, 4],
  [11, 3], [12, 3], [13, 3],
]);

export const LEVEL43: LevelDef = {
  id: 'level43',
  name: "Aegis Road",
  blurb: "A phalanx of mirror-shields advances.",
  hint: "Aegisbearers raise mirror plates — heavy shots crack them.",
  hexes: rectHexes(14, 10),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 520,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'aegisbearer', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'lumenmote', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 3, spacing: 0.8 }, { enemyId: 'lumenmote', count: 14, spacing: 0.28 }] },
    { entries: [{ enemyId: 'raywisp', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'lumenmote', count: 40, spacing: 0.13 }, { enemyId: 'aegisbearer', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'raywisp', count: 16, spacing: 0.22 }, { enemyId: 'aegisbearer', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'aegisbearer', count: 6, spacing: 0.6 }, { enemyId: 'lumenmote', count: 24, spacing: 0.18 }] },
  ],
};
