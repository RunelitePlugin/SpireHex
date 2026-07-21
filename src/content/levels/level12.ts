import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [2, 5], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6],
  [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [9, 3], [10, 3], [10, 4], [11, 4],
  [12, 4], [13, 4], [14, 4],
]);

export const LEVEL12: LevelDef = {
  id: 'level12',
  name: "Icefang Run",
  blurb: "Shard-wolves sprint the frozen riverbed.",
  hint: "Icefangs outrun slow shells — fast bolts bring them down.",
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 350,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    { entries: [{ enemyId: 'icefang', count: 8, spacing: 0.45 }] },
    { entries: [{ enemyId: 'driftmote', count: 24, spacing: 0.2 }] },
    { entries: [{ enemyId: 'icefang', count: 12, spacing: 0.3 }, { enemyId: 'driftmote', count: 12, spacing: 0.3 }] },
    { entries: [{ enemyId: 'cinderwisp', count: 14, spacing: 0.25 }, { enemyId: 'icefang', count: 8, spacing: 0.4 }] },
    { entries: [{ enemyId: 'driftmote', count: 30, spacing: 0.16 }] },
    { entries: [{ enemyId: 'icefang', count: 18, spacing: 0.22 }] },
    { entries: [{ enemyId: 'icefang', count: 14, spacing: 0.25 }, { enemyId: 'driftmote', count: 24, spacing: 0.18 }] },
  ],
};
