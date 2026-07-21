import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [5, 5], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3],
  [11, 3], [11, 4], [12, 4], [13, 4],
]);

export const LEVEL33: LevelDef = {
  id: 'level33',
  name: "Thunderhide Crossing",
  blurb: "Plated storm-beasts ford the wash.",
  hint: "Thunderhides shrug small arms — heavy shots break them.",
  hexes: rectHexes(14, 10),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 460,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'thunderhide', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'sparkmote', count: 28, spacing: 0.18 }] },
    { entries: [{ enemyId: 'thunderhide', count: 3, spacing: 0.8 }, { enemyId: 'sparkmote', count: 14, spacing: 0.28 }] },
    { entries: [{ enemyId: 'galestrider', count: 14, spacing: 0.24 }] },
    { entries: [{ enemyId: 'thunderhide', count: 4, spacing: 0.7 }] },
    { entries: [{ enemyId: 'sparkmote', count: 38, spacing: 0.14 }, { enemyId: 'thunderhide', count: 2, spacing: 1.0 }] },
    { entries: [{ enemyId: 'galestrider', count: 16, spacing: 0.22 }, { enemyId: 'thunderhide', count: 3, spacing: 0.8 }] },
    { entries: [{ enemyId: 'thunderhide', count: 6, spacing: 0.6 }, { enemyId: 'sparkmote', count: 22, spacing: 0.19 }] },
  ],
};
