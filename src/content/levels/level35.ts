import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [7, 3], [7, 4], [7, 5], [7, 6], [8, 6], [9, 6], [10, 6], [10, 5], [10, 4], [11, 4],
  [12, 4], [13, 4], [14, 4],
]);

export const LEVEL35: LevelDef = {
  id: 'level35',
  name: "Static Sea",
  blurb: "A sea of static. Waves without end.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 470,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'sparkmote', count: 30, spacing: 0.2 }] },
    { entries: [{ enemyId: 'sparkmote', count: 40, spacing: 0.15 }] },
    { entries: [{ enemyId: 'sparkmote', count: 34, spacing: 0.16 }, { enemyId: 'sporeling', count: 16, spacing: 0.24 }] },
    { entries: [{ enemyId: 'sparkmote', count: 52, spacing: 0.11 }] },
    { entries: [{ enemyId: 'galestrider', count: 10, spacing: 0.3 }, { enemyId: 'sparkmote', count: 36, spacing: 0.14 }] },
    { entries: [{ enemyId: 'sparkmote', count: 60, spacing: 0.09 }] },
    { entries: [{ enemyId: 'sparkmote', count: 48, spacing: 0.12 }, { enemyId: 'sparkmote', count: 24, spacing: 0.2 }] },
  ],
};
