/**
 * P11: content-side biome registry. Endless rosters, boss→tower unlocks, and
 * the level→biome keying all read THIS file; src/art/biomes.ts keys its
 * palettes off the same BiomeId (art may import content; never the reverse).
 * P14 closed the set: all six biomes shipped — do not extend.
 */
import { deepFreeze } from './freeze';

export type BiomeId = 'ember' | 'frost' | 'verdant' | 'storm' | 'radiant' | 'umbral'; // COMPLETE (P14): all six biomes shipped

/** Level id → biome. Complete at 60 levels (P14). */
export const BIOME_FOR_LEVEL_CONTENT: Record<string, BiomeId> = deepFreeze({
  level01: 'ember', level02: 'ember', level03: 'ember', level04: 'ember', level05: 'ember',
  level06: 'ember', level07: 'ember', level08: 'ember', level09: 'ember', level10: 'ember',
  level11: 'frost', level12: 'frost', level13: 'frost', level14: 'frost', level15: 'frost',
  level16: 'frost', level17: 'frost', level18: 'frost', level19: 'frost', level20: 'frost',
  level21: 'verdant', level22: 'verdant', level23: 'verdant', level24: 'verdant', level25: 'verdant',
  level26: 'verdant', level27: 'verdant', level28: 'verdant', level29: 'verdant', level30: 'verdant',
  level31: 'storm', level32: 'storm', level33: 'storm', level34: 'storm', level35: 'storm',
  level36: 'storm', level37: 'storm', level38: 'storm', level39: 'storm', level40: 'storm',
  level41: 'radiant', level42: 'radiant', level43: 'radiant', level44: 'radiant', level45: 'radiant',
  level46: 'radiant', level47: 'radiant', level48: 'radiant', level49: 'radiant', level50: 'radiant',
  level51: 'umbral', level52: 'umbral', level53: 'umbral', level54: 'umbral', level55: 'umbral',
  level56: 'umbral', level57: 'umbral', level58: 'umbral', level59: 'umbral', level60: 'umbral',
});

/** Non-boss enemy family per biome — the endless draw pool (bosses NEVER appear in endless). */
export const BIOME_FAMILY: Record<BiomeId, readonly string[]> = deepFreeze({
  ember: ['gloomling', 'stoneshell', 'cinderwisp', 'frostmite', 'duskstalker', 'flamewisp'],
  frost: ['driftmote', 'icefang', 'glacierback', 'rimewraith', 'frostbrand'],
  verdant: ['sporeling', 'thornhound', 'barkhide', 'gladeshade', 'mirehulk'],
  storm: ['sparkmote', 'galestrider', 'thunderhide', 'mistwalker', 'stormbrute'],
  radiant: ['lumenmote', 'raywisp', 'aegisbearer', 'veilseraph', 'sungrazer'],
  umbral: ['voidmote', 'gloomwing', 'umbrahusk', 'nullwraith', 'dreadmaw'],
});

/** The biome's finale boss. */
export const BIOME_BOSS: Record<BiomeId, string> = deepFreeze({
  ember: 'cinderlord', frost: 'rimelord', verdant: 'verdantheart', storm: 'tempestcaller', radiant: 'luminarch', umbral: 'umbrageist',
});

/** Defeating the biome boss unlocks this element tower (spec §4: acquisition is the campaign's spine). */
export const BIOME_TOWER_UNLOCK: Record<BiomeId, string> = deepFreeze({
  ember: 'emberSpire', frost: 'frostObelisk', verdant: 'thornTotem', storm: 'stormPylon', radiant: 'sunShrine', umbral: 'umbraMonolith',
});
