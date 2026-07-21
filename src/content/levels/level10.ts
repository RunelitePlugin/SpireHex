import type { LevelDef } from '../types';
import { offsetPath, rectHexes, uniqueHexes } from '../levelUtils';

// Rook moves only — two rivers of enemies meeting at neighboring exits.
const PATH_NORTH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [6, 3],
  [7, 3], [8, 3], [9, 3], [10, 3], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4],
]);
const PATH_SOUTH = offsetPath([
  [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [4, 6], [5, 6], [6, 6], [7, 6], [7, 7],
  [8, 7], [9, 7], [10, 7], [11, 7], [11, 6], [11, 5], [12, 5], [13, 5], [14, 5], [15, 5],
]);

export const LEVEL10: LevelDef = {
  id: 'level10',
  name: 'The Confluence',
  blurb: 'The Cinderlord marches. End the Ember Wastes.',
  hint: 'The Cinderlord splits as it burns — hold damage for wisps.',
  hexes: rectHexes(16, 10),
  pathHexes: uniqueHexes([PATH_NORTH, PATH_SOUTH]),
  paths: [PATH_NORTH, PATH_SOUTH],
  startingGold: 420,
  lives: 20,
  waveCountdown: 12,
  earlyCallRate: 4, // richer bonus — the finale rewards confident early calls
  waves: [
    // 1 — twin columns.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.3, pathIndex: 0 }, { enemyId: 'gloomling', count: 16, spacing: 0.3, pathIndex: 1 }] },
    // 2 — element split: chaff north, sprinters south.
    { entries: [{ enemyId: 'frostmite', count: 28, spacing: 0.15, pathIndex: 0 }, { enemyId: 'cinderwisp', count: 16, spacing: 0.25, pathIndex: 1 }] },
    // 3 — armor north, stealth south: no single tower answers both.
    { entries: [{ enemyId: 'stoneshell', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'duskstalker', count: 3, spacing: 0.8, pathIndex: 1 }] },
    // 4 — the flood changes rivers.
    { entries: [{ enemyId: 'frostmite', count: 36, spacing: 0.14, pathIndex: 1 }, { enemyId: 'gloomling', count: 20, spacing: 0.25, pathIndex: 0 }] },
    // 5 — speed north, armor south — flame wisps preview the boss's spawn.
    { entries: [{ enemyId: 'cinderwisp', count: 20, spacing: 0.2, pathIndex: 0 }, { enemyId: 'flamewisp', count: 10, spacing: 0.3, pathIndex: 0 }, { enemyId: 'stoneshell', count: 4, spacing: 0.7, pathIndex: 1 }] },
    // 6 — stealth north under mite cover south.
    { entries: [{ enemyId: 'duskstalker', count: 4, spacing: 0.7, pathIndex: 0 }, { enemyId: 'frostmite', count: 36, spacing: 0.14, pathIndex: 1 }] },
    // 7 — the double wall.
    { entries: [{ enemyId: 'stoneshell', count: 6, spacing: 0.6, pathIndex: 0 }, { enemyId: 'stoneshell', count: 6, spacing: 0.6, pathIndex: 1 }] },
    // 8 — fast and unseen.
    { entries: [{ enemyId: 'cinderwisp', count: 28, spacing: 0.175, pathIndex: 1 }, { enemyId: 'duskstalker', count: 5, spacing: 0.65, pathIndex: 0 }] },
    // 9 — SWARM: THE frostmite wave — both rivers run white, 40 per road (80 total).
    { entries: [{ enemyId: 'frostmite', count: 40, spacing: 0.11, pathIndex: 0 }, { enemyId: 'frostmite', count: 40, spacing: 0.11, pathIndex: 1 }] },
    // 10 — finale: THE CINDERLORD on the north river, escorts on the south.
    { entries: [
      { enemyId: 'cinderlord', count: 1, spacing: 2, pathIndex: 0 },
      { enemyId: 'flamewisp', count: 12, spacing: 0.4, pathIndex: 1 },
      { enemyId: 'gloomling', count: 20, spacing: 0.25, pathIndex: 1 },
      { enemyId: 'cinderwisp', count: 14, spacing: 0.3, pathIndex: 1 },
    ] },
  ],
};
