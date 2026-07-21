import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only — two independent roads: north ridge and south hollow.
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [6, 3], [7, 3], [8, 3],
  [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3], [13, 3], [14, 3],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [3, 7], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [7, 7],
  [8, 7], [9, 7], [10, 7], [11, 7], [11, 6], [12, 6], [13, 6], [14, 6],
]);

export const LEVEL07: LevelDef = {
  id: 'level07',
  name: 'The Forkroad',
  blurb: 'Two roads. One purse. Split your defenses well.',
  hexes: rectHexes(15, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 380,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    // 1 — equal pressure introduces the split.
    { entries: [{ enemyId: 'gloomling', count: 12, spacing: 0.35, pathIndex: 0 }, { enemyId: 'gloomling', count: 12, spacing: 0.35, pathIndex: 1 }] },
    // 2 — asymmetric elements: chaff north, sprinters south.
    { entries: [{ enemyId: 'frostmite', count: 24, spacing: 0.175, pathIndex: 0 }, { enemyId: 'cinderwisp', count: 12, spacing: 0.3, pathIndex: 1 }] },
    // 3 — armor north, bodies south.
    { entries: [{ enemyId: 'stoneshell', count: 3, spacing: 0.8, pathIndex: 0 }, { enemyId: 'gloomling', count: 16, spacing: 0.25, pathIndex: 1 }] },
    // 4 — the elements swap roads.
    { entries: [{ enemyId: 'cinderwisp', count: 16, spacing: 0.25, pathIndex: 0 }, { enemyId: 'frostmite', count: 24, spacing: 0.175, pathIndex: 1 }] },
    // 5 — stealth picks the road you defended less.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.25, pathIndex: 0 }, { enemyId: 'duskstalker', count: 3, spacing: 0.8, pathIndex: 1 }] },
    // 6 — armor south this time.
    { entries: [{ enemyId: 'cinderwisp', count: 16, spacing: 0.25, pathIndex: 0 }, { enemyId: 'stoneshell', count: 4, spacing: 0.7, pathIndex: 1 }] },
    // 7 — SWARM: synchronized floods, 64 mites across both roads.
    { entries: [{ enemyId: 'frostmite', count: 32, spacing: 0.15, pathIndex: 0 }, { enemyId: 'frostmite', count: 32, spacing: 0.15, pathIndex: 1 }] },
    // 8 — finale: heavy north, sneaky-fast south.
    { entries: [
      { enemyId: 'stoneshell', count: 4, spacing: 0.7, pathIndex: 0 },
      { enemyId: 'duskstalker', count: 4, spacing: 0.7, pathIndex: 1 },
      { enemyId: 'cinderwisp', count: 20, spacing: 0.2, pathIndex: 0 },
      { enemyId: 'gloomling', count: 20, spacing: 0.2, pathIndex: 1 },
    ] },
  ],
};
