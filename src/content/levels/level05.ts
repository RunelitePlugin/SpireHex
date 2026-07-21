import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only — a long bog meander: splash towers get overlapping coverage.
const PATH = offsetPath([
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [6, 3], [6, 4], [5, 4],
  [4, 4], [3, 4], [2, 4], [2, 5], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
  [8, 6], [9, 6], [9, 5], [9, 4], [9, 3], [10, 3], [11, 3], [12, 3], [12, 4], [12, 5],
  [13, 5],
]);

export const LEVEL05: LevelDef = {
  id: 'level05',
  name: 'Mitegrave Bog',
  blurb: 'The mites come in thousands. Splash or drown.',
  hexes: rectHexes(14, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 340,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [
    // 1 — the flood begins.
    { entries: [{ enemyId: 'frostmite', count: 24, spacing: 0.2 }, { enemyId: 'gloomling', count: 12, spacing: 0.35 }] },
    // 2 — SWARM: pure chaff — single-target towers fall behind here.
    { entries: [{ enemyId: 'frostmite', count: 40, spacing: 0.15 }] },
    // 3 — bodies among the mites.
    { entries: [{ enemyId: 'gloomling', count: 20, spacing: 0.25 }, { enemyId: 'frostmite', count: 28, spacing: 0.15 }] },
    // 4 — SWARM: denser flood with bodies threaded through.
    { entries: [{ enemyId: 'frostmite', count: 48, spacing: 0.125 }, { enemyId: 'gloomling', count: 12, spacing: 0.3 }] },
    // 5 — shells wade the bog while mites screen them.
    { entries: [{ enemyId: 'stoneshell', count: 4, spacing: 0.75 }, { enemyId: 'frostmite', count: 32, spacing: 0.15 }] },
    // 6 — SWARM: stalkers under mite cover.
    { entries: [{ enemyId: 'duskstalker', count: 3, spacing: 0.8 }, { enemyId: 'frostmite', count: 40, spacing: 0.125 }] },
    // 7 — SWARM finale: the bog empties (the campaign's biggest single entry).
    { entries: [{ enemyId: 'frostmite', count: 60, spacing: 0.1 }, { enemyId: 'gloomling', count: 24, spacing: 0.2 }, { enemyId: 'duskstalker', count: 3, spacing: 0.8 }] },
  ],
};
