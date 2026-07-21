import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only — double-back ramparts: the road passes the center three times.
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [5, 5], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [9, 2],
  [10, 2], [10, 3], [10, 4], [11, 4], [12, 4],
]);

export const LEVEL03: LevelDef = {
  id: 'level03',
  name: 'Stoneshell Ramparts',
  blurb: 'Armor shrugs small hits. Bring heavy stone.',
  hint: 'Stoneshells shed weak hits — heavy mortar shells crack them.',
  hexes: rectHexes(13, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 380,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    // 1 — soft opener to bank gold.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.35 }] },
    // 2 — armor arrives: flat damage struggles, storm (storm→nature ×1.5) shines.
    { entries: [{ enemyId: 'stoneshell', count: 3, spacing: 0.9 }, { enemyId: 'gloomling', count: 12, spacing: 0.3 }] },
    // 3 — chaff screen in front of shells.
    { entries: [{ enemyId: 'frostmite', count: 24, spacing: 0.175 }, { enemyId: 'stoneshell', count: 3, spacing: 0.8 }] },
    // 4 — shells with a chaff screen.
    { entries: [{ enemyId: 'stoneshell', count: 5, spacing: 0.7 }, { enemyId: 'gloomling', count: 12, spacing: 0.3 }] },
    // 5 — sustained pressure.
    { entries: [{ enemyId: 'gloomling', count: 20, spacing: 0.25 }, { enemyId: 'stoneshell', count: 4, spacing: 0.7 }] },
    // 6 — the wall thickens.
    { entries: [{ enemyId: 'stoneshell', count: 6, spacing: 0.6 }, { enemyId: 'frostmite', count: 24, spacing: 0.15 }] },
    // 7 — finale: the rampart marches.
    { entries: [{ enemyId: 'stoneshell', count: 8, spacing: 0.5 }, { enemyId: 'frostmite', count: 24, spacing: 0.15 }, { enemyId: 'gloomling', count: 16, spacing: 0.25 }] },
  ],
};
