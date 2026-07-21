import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (see levelUtils.offsetPath) — winding S through the fen.
const PATH = offsetPath([
  [0, 1], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [3, 4], [2, 4], [1, 4], [1, 5],
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [6, 3], [7, 3],
  [7, 4], [7, 5], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [9, 3], [9, 2], [10, 2],
  [11, 2],
]);

export const LEVEL02: LevelDef = {
  id: 'level02',
  name: 'Frostfen Crossing',
  blurb: 'The mites flood. Single shots will not do.',
  hint: 'Frostmites swarm in bulk — splash damage thins the tide.',
  hexes: rectHexes(12, 8),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 320,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    // 1 — warm-up column.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.4 }] },
    // 2 — frost chaff floods: the splash lesson begins.
    { entries: [{ enemyId: 'frostmite', count: 36, spacing: 0.175 }, { enemyId: 'gloomling', count: 10, spacing: 0.35 }] },
    // 3 — bodies among the chaff.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.3 }, { enemyId: 'frostmite', count: 24, spacing: 0.175 }] },
    // 4 — SWARM: the splash lesson bites. PROTOTYPE-LOCKED KNEE: 2×40 @ 0.09 —
    //     sentry-lean bleeds to 6/20 while mortar-lean cruises 20/20; at 0.12
    //     nobody leaks, at 3×40 sentry-lean LOSES. Do not round these numbers.
    { entries: [{ enemyId: 'frostmite', count: 40, spacing: 0.09 }, { enemyId: 'frostmite', count: 40, spacing: 0.09 }] },
    // 5 — twin streams.
    { entries: [{ enemyId: 'gloomling', count: 20, spacing: 0.25 }, { enemyId: 'frostmite', count: 24, spacing: 0.15 }] },
    // 6 — finale: the flood in bulk. (228 mites total — flavor lock ≥216)
    { entries: [{ enemyId: 'frostmite', count: 32, spacing: 0.12 }, { enemyId: 'frostmite', count: 32, spacing: 0.12 }, { enemyId: 'gloomling', count: 18, spacing: 0.25 }] },
  ],
};
