import type { LevelDef } from '../types';
import { offsetPath, rectHexes } from '../levelUtils';

// Rook moves only (offsetPath rule).
const PATH = offsetPath([
  [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4],
  [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2], [9, 2],
  [9, 3], [9, 4], [9, 5], [9, 6], [10, 6], [11, 6], [11, 5], [11, 4], [12, 4], [13, 4],
  [14, 4],
]);

/**
 * P15: Rainbow Mode's own map (spec §9) — deliberately NOT registered in
 * CAMPAIGN/LEVELS (it is not a campaign level; every campaign-derived pin
 * stays at 60). A long triple-serpentine road with deep tower pockets: the
 * victory-lap map for a nine-tower profile. Played ONLY through
 * makeRainbowLevel (../rainbow.ts) — the authored waves array is empty and
 * stays that way; Rainbow generates its waves.
 */
export const RAINBOW_LEVEL: LevelDef = {
  id: 'rainbow',
  name: 'The Prismatic Causeway',
  blurb: 'Every biome. One road. No end.',
  hexes: rectHexes(15, 9),
  pathHexes: PATH,
  paths: [PATH],
  startingGold: 500,
  lives: 20,
  waveCountdown: 10,
  earlyCallRate: 3,
  waves: [], // generated per-run — see makeRainbowLevel/extendRainbowLevel
};
