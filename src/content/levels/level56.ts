import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 3], [1, 3], [2, 3], [2, 4], [2, 5], [3, 5], [4, 5], [4, 4], [4, 3], [5, 3],
  [6, 3], [6, 4], [6, 5], [7, 5], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3], [10, 4],
  [10, 5], [11, 5], [12, 5], [12, 4], [13, 4], [14, 4],
]);

export const LEVEL56: LevelDef = {
  id: 'level56',
  name: "Dreadmaw Warrens",
  blurb: "Something below is chewing through.",
  hint: "Dreadmaws leak three lives — mass your damage early.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 510,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'voidmote', count: 24, spacing: 0.2 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 2, spacing: 1.2 }] },
    { entries: [{ enemyId: 'gloomwing', count: 12, spacing: 0.28 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 3, spacing: 0.9 }, { enemyId: 'voidmote', count: 20, spacing: 0.22 }] },
    { entries: [{ enemyId: 'umbrahusk', count: 4, spacing: 0.7 }, { enemyId: 'gloomwing', count: 8, spacing: 0.35 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 4, spacing: 0.8 }, { enemyId: 'voidmote', count: 26, spacing: 0.18 }] },
    { entries: [{ enemyId: 'dreadmaw', count: 5, spacing: 0.7 }, { enemyId: 'gloomwing', count: 10, spacing: 0.3 }] },
  ],
};
