import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only — two veins: armor grinds the north, speed floods the south.
const PATH_NORTH = offsetPath([
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 3], [6, 3], [7, 3],
  [8, 3], [9, 3], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2],
]);
const PATH_SOUTH = offsetPath([
  [0, 8], [1, 8], [2, 8], [2, 7], [3, 7], [4, 7], [5, 7], [5, 6], [6, 6], [7, 6],
  [8, 6], [9, 6], [10, 6], [10, 7], [11, 7], [12, 7], [13, 7],
]);

export const LEVEL08: LevelDef = {
  id: 'level08',
  name: 'Twin Veins',
  blurb: 'Armor grinds one vein. Speed floods the other.',
  hexes: rectHexes(14, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  // P7 balance ticket: startingGold stays 380 — batch runs DISPROVED the +20-40g
  // hypothesis (opening corpus 9/36 wins at +0g, +20g, +30g AND +40g; wave-1
  // softening also 9/36). The real killers were the wave 3-5 ramp and the
  // finale's 5-stalker column — softened below. See `npm run balance`.
  startingGold: 380,
  lives: 20,
  // Pacing differentiation from level07 (10s): heavier waves, longer rebuild
  // breathers, bigger early-call bank (12s × 3 = 36g vs 30g). 12 × 30 ticks exactly.
  waveCountdown: 12,
  earlyCallRate: 3,
  waves: [
    // 1 — probing columns on both veins.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.3, pathIndex: 0 }, { enemyId: 'gloomling', count: 16, spacing: 0.3, pathIndex: 1 }] },
    // 2 — the split declares itself: shells north, wisps south.
    { entries: [{ enemyId: 'stoneshell', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'cinderwisp', count: 16, spacing: 0.25, pathIndex: 1 }] },
    // 3 — heavier on both (P7 ramp softening preserved: 3 shells).
    { entries: [{ enemyId: 'stoneshell', count: 3, spacing: 0.75, pathIndex: 0 }, { enemyId: 'cinderwisp', count: 16, spacing: 0.225, pathIndex: 1 }] },
    // 4 — chaff north, stealth south (P7: 2 stalkers preserved; radiant is barely online this early).
    { entries: [{ enemyId: 'frostmite', count: 32, spacing: 0.15, pathIndex: 0 }, { enemyId: 'duskstalker', count: 2, spacing: 0.8, pathIndex: 1 }] },
    // 5 — the grind deepens.
    { entries: [{ enemyId: 'stoneshell', count: 4, spacing: 0.65, pathIndex: 0 }, { enemyId: 'cinderwisp', count: 20, spacing: 0.2, pathIndex: 1 }] },
    // 6 — stealth swaps north, chaff floods south.
    { entries: [{ enemyId: 'duskstalker', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'frostmite', count: 32, spacing: 0.15, pathIndex: 1 }] },
    // 7 — near-finale pressure.
    { entries: [{ enemyId: 'stoneshell', count: 6, spacing: 0.6, pathIndex: 0 }, { enemyId: 'cinderwisp', count: 28, spacing: 0.175, pathIndex: 1 }] },
    // 8 — finale: both veins burst (P7 stealth-tax softening preserved: 3 stalkers).
    { entries: [
      { enemyId: 'stoneshell', count: 6, spacing: 0.6, pathIndex: 0 },
      { enemyId: 'duskstalker', count: 3, spacing: 0.65, pathIndex: 1 },
      { enemyId: 'frostmite', count: 32, spacing: 0.125, pathIndex: 0 },
      { enemyId: 'cinderwisp', count: 24, spacing: 0.2, pathIndex: 1 },
    ] },
  ],
};
