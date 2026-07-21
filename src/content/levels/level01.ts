import type { LevelDef } from '../types';
import { offsetToAxial, rectHexes } from '../levelUtils';

const PATH_COLS_ROWS: Array<[number, number]> = [
  [0, 4], [1, 4], [2, 4], [3, 4], [3, 3], [4, 2], [5, 2], [6, 2], [7, 2], [7, 3],
  [8, 4], [8, 5], [8, 6], [9, 6], [10, 6], [11, 6], [11, 5], [12, 4], [13, 4],
];

const pathHexes = PATH_COLS_ROWS.map(([c, r]) => offsetToAxial(c, r));

export const LEVEL01: LevelDef = {
  id: 'level01',
  name: 'Emberfield',
  blurb: 'The first march. Hold the winding road.',
  hint: 'Gloomlings march in columns — mortar splash thins them.',
  hexes: rectHexes(14, 9),
  pathHexes,
  paths: [pathHexes],
  startingGold: 300,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    // 1 — the Phase-1 opener (simulation.waves.test.ts pins this exact timing: 12 @ 0.4).
    { entries: [{ enemyId: 'gloomling', count: 12, spacing: 0.4 }] },
    // 2 — a thicker column.
    { entries: [{ enemyId: 'gloomling', count: 18, spacing: 0.3 }] },
    // 3 — two staggered streams.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.25 }, { enemyId: 'gloomling', count: 10, spacing: 0.45 }] },
    // 4 — the road fills.
    { entries: [{ enemyId: 'gloomling', count: 30, spacing: 0.2 }] },
    // 5 — pressure holds.
    { entries: [{ enemyId: 'gloomling', count: 26, spacing: 0.2 }, { enemyId: 'gloomling', count: 12, spacing: 0.4 }] },
    // 6 — finale: the long column. (168 total — flavor lock ≥160)
    { entries: [{ enemyId: 'gloomling', count: 44, spacing: 0.16 }] },
  ],
};
