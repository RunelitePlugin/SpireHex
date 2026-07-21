import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [6, 5],
  [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [10, 4], [11, 4], [12, 4], [12, 3],
  [13, 3], [14, 3],
]);

export const LEVEL22: LevelDef = {
  id: 'level22',
  name: "Thornhound Trail",
  blurb: "Something fast moves between the trunks.",
  hint: "Thornhounds bound past slow guns — chill them with frost.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 390,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'thornhound', count: 8, spacing: 0.4 }] },
    { entries: [{ enemyId: 'sporeling', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'thornhound', count: 12, spacing: 0.28 }, { enemyId: 'sporeling', count: 14, spacing: 0.28 }] },
    { entries: [{ enemyId: 'icefang', count: 12, spacing: 0.26 }, { enemyId: 'thornhound', count: 8, spacing: 0.38 }] },
    { entries: [{ enemyId: 'sporeling', count: 36, spacing: 0.15 }] },
    { entries: [{ enemyId: 'thornhound', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'thornhound', count: 14, spacing: 0.24 }, { enemyId: 'sporeling', count: 26, spacing: 0.17 }] },
  ],
};
