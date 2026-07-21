import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only — a SHORT pass (22 hexes): sprinters cross fast, slows are gold.
const PATH = offsetPath([
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [4, 4], [4, 5], [5, 5], [6, 5], [7, 5],
  [8, 5], [8, 4], [8, 3], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3], [12, 4],
  [13, 4], [14, 4],
]);

export const LEVEL06: LevelDef = {
  id: 'level06',
  name: 'Cinderrun Pass',
  blurb: 'Fast feet on a short road. Shoot faster.',
  hint: 'Cinderwisps sprint — rapid sentries catch them.',
  hexes: rectHexes(15, 8),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 340,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    // 1 — mixed opener.
    { entries: [{ enemyId: 'cinderwisp', count: 12, spacing: 0.35 }, { enemyId: 'gloomling', count: 12, spacing: 0.3 }] },
    // 2 — the sprint: frost slows pay for themselves.
    { entries: [{ enemyId: 'cinderwisp', count: 20, spacing: 0.25 }] },
    // 3 — bodies then speed.
    { entries: [{ enemyId: 'gloomling', count: 20, spacing: 0.25 }, { enemyId: 'cinderwisp', count: 16, spacing: 0.25 }] },
    // 4 — sprint plus chaff.
    { entries: [{ enemyId: 'cinderwisp', count: 24, spacing: 0.2 }, { enemyId: 'frostmite', count: 20, spacing: 0.175 }] },
    // 5 — stealth at speed.
    { entries: [{ enemyId: 'duskstalker', count: 4, spacing: 0.75 }, { enemyId: 'cinderwisp', count: 16, spacing: 0.25 }] },
    // 6 — armor anchors the sprints.
    { entries: [{ enemyId: 'stoneshell', count: 5, spacing: 0.65 }, { enemyId: 'cinderwisp', count: 20, spacing: 0.2 }] },
    // 7 — the pass fills.
    { entries: [{ enemyId: 'cinderwisp', count: 32, spacing: 0.175 }, { enemyId: 'frostmite', count: 24, spacing: 0.15 }] },
    // 8 — finale: everything runs.
    { entries: [{ enemyId: 'cinderwisp', count: 36, spacing: 0.15 }, { enemyId: 'duskstalker', count: 4, spacing: 0.7 }, { enemyId: 'gloomling', count: 24, spacing: 0.2 }] },
  ],
};
