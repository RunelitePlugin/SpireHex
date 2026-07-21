import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only — the long night road: one lane, nine waves, no mercy.
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
  [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7],
  [10, 6], [10, 5], [10, 4], [10, 3], [10, 2], [10, 1], [11, 1], [12, 1], [13, 1], [13, 2],
  [13, 3], [13, 4], [14, 4], [15, 4],
]);

export const LEVEL09: LevelDef = {
  id: 'level09',
  name: 'Nightmarch',
  blurb: 'Nine waves. Everything you learned, at once.',
  hexes: rectHexes(16, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 400,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 3,
  waves: [
    // 1 — the march begins.
    { entries: [{ enemyId: 'gloomling', count: 20, spacing: 0.25 }] },
    // 2 — armor behind chaff.
    { entries: [{ enemyId: 'stoneshell', count: 4, spacing: 0.7 }, { enemyId: 'frostmite', count: 24, spacing: 0.15 }] },
    // 3 — the unseen join.
    { entries: [{ enemyId: 'duskstalker', count: 4, spacing: 0.75 }, { enemyId: 'gloomling', count: 20, spacing: 0.25 }] },
    // 4 — speed and armor.
    { entries: [{ enemyId: 'cinderwisp', count: 24, spacing: 0.2 }, { enemyId: 'stoneshell', count: 4, spacing: 0.7 }] },
    // 5 — SWARM: the flood, screened by stalkers.
    { entries: [{ enemyId: 'frostmite', count: 48, spacing: 0.125 }, { enemyId: 'duskstalker', count: 3, spacing: 0.8 }] },
    // 6 — the wall.
    { entries: [{ enemyId: 'stoneshell', count: 6, spacing: 0.6 }, { enemyId: 'cinderwisp', count: 20, spacing: 0.225 }] },
    // 7 — night deepens.
    { entries: [{ enemyId: 'duskstalker', count: 6, spacing: 0.6 }, { enemyId: 'frostmite', count: 32, spacing: 0.15 }] },
    // 8 — the long column.
    { entries: [{ enemyId: 'stoneshell', count: 7, spacing: 0.55 }, { enemyId: 'gloomling', count: 28, spacing: 0.2 }, { enemyId: 'cinderwisp', count: 20, spacing: 0.2 }] },
    // 9 — SWARM finale: dawn is earned.
    { entries: [
      { enemyId: 'duskstalker', count: 7, spacing: 0.55 },
      { enemyId: 'stoneshell', count: 6, spacing: 0.6 },
      { enemyId: 'frostmite', count: 40, spacing: 0.125 },
      { enemyId: 'cinderwisp', count: 24, spacing: 0.175 },
    ] },
  ],
};
