import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [3, 6], [3, 5], [3, 4], [4, 4], [5, 4], [6, 4], [6, 5],
  [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [12, 3],
  [12, 4], [13, 4], [14, 4],
]);

export const LEVEL42: LevelDef = {
  id: 'level42',
  name: "Mirrorlight Ridge",
  blurb: "The ridge blazes with moving mirrors.",
  hint: "Raywisps streak like sunrise — chain lightning tracks them.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 510,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'raywisp', count: 8, spacing: 0.45 }] },
    { entries: [{ enemyId: 'lumenmote', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'raywisp', count: 12, spacing: 0.3 }, { enemyId: 'lumenmote', count: 14, spacing: 0.3 }] },
    { entries: [{ enemyId: 'galestrider', count: 12, spacing: 0.26 }, { enemyId: 'raywisp', count: 8, spacing: 0.4 }] },
    { entries: [{ enemyId: 'lumenmote', count: 36, spacing: 0.15 }] },
    { entries: [{ enemyId: 'raywisp', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'raywisp', count: 14, spacing: 0.25 }, { enemyId: 'lumenmote', count: 28, spacing: 0.16 }] },
  ],
};
