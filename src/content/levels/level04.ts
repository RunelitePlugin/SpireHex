import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only — a hollow the road threads through twice, north and south.
const PATH = offsetPath([
  [0, 6], [1, 6], [2, 6], [3, 6], [3, 5], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2],
  [6, 2], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [9, 2],
  [10, 2], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [12, 6], [13, 6],
]);

export const LEVEL04: LevelDef = {
  id: 'level04',
  name: 'Duskwood Hollow',
  blurb: 'Unseen things march. Light the warden fires.',
  hint: 'Duskstalkers strike unseen — Warden Beacons reveal them.',
  hexes: rectHexes(14, 8),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 400,
  lives: 20,
  waveCountdown: 12, // extra thinking time — stealth punishes a wrong build hard
  earlyCallRate: 3,
  waves: [
    // 1 — visible warm-up.
    { entries: [{ enemyId: 'gloomling', count: 16, spacing: 0.35 }, { enemyId: 'frostmite', count: 16, spacing: 0.2 }] },
    // 2 — stealth debut: without a Sun Shrine these walk free.
    { entries: [{ enemyId: 'duskstalker', count: 3, spacing: 0.9 }, { enemyId: 'gloomling', count: 12, spacing: 0.3 }] },
    // 3 — swarm check between stealth waves.
    { entries: [{ enemyId: 'frostmite', count: 36, spacing: 0.15 }, { enemyId: 'gloomling', count: 12, spacing: 0.3 }] },
    // 4 — stalkers under chaff cover.
    { entries: [{ enemyId: 'duskstalker', count: 4, spacing: 0.75 }, { enemyId: 'gloomling', count: 14, spacing: 0.3 }] },
    // 5 — armor interlude.
    { entries: [{ enemyId: 'stoneshell', count: 3, spacing: 0.8 }, { enemyId: 'gloomling', count: 20, spacing: 0.25 }] },
    // 6 — the wood empties out.
    { entries: [{ enemyId: 'duskstalker', count: 5, spacing: 0.65 }, { enemyId: 'frostmite', count: 24, spacing: 0.15 }] },
    // 7 — finale: a stalker pack under full escort.
    { entries: [{ enemyId: 'duskstalker', count: 6, spacing: 0.6 }, { enemyId: 'frostmite', count: 24, spacing: 0.175 }, { enemyId: 'gloomling', count: 20, spacing: 0.225 }] },
  ],
};
