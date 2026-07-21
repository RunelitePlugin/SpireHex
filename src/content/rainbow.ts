/**
 * P15: Rainbow Mode (spec §9) — "Completing all six biomes unlocks Rainbow
 * Mode: an endless gauntlet alternating through all biome enemy palettes wave
 * by wave." Wave w draws its roster from the biome family of
 * RAINBOW_CYCLE[w % 6] (campaign order), on Rainbow's own map. Built ENTIRELY
 * on the endless generator (§11: the sim is untouched — this file is pure
 * data-side content); the determinism contract is identical: every wave is a
 * pure function of (attempt, waveIndex), so records and replays are exact.
 */
import type { ContentDb, WaveDef } from './types';
import { CONTENT } from './index';
import { BIOME_FAMILY, type BiomeId } from './biomeRoster';
import { ENDLESS_LOOKAHEAD, endlessContent, endlessWave, type EndlessLevel } from './endless';
import { RAINBOW_LEVEL } from './levels/rainbow';

/** The wave-by-wave biome rotation — campaign order, one full spin every 6 waves. */
export const RAINBOW_CYCLE: readonly BiomeId[] = ['ember', 'frost', 'verdant', 'storm', 'radiant', 'umbral'];

/** Which biome owns wave `wave` (0-based). */
export function rainbowBiome(wave: number): BiomeId {
  return RAINBOW_CYCLE[wave % RAINBOW_CYCLE.length];
}

/** Wave `wave`'s draw pool: that biome's non-boss family, sorted (endless convention). */
export function rainbowFamily(wave: number): readonly string[] {
  return [...BIOME_FAMILY[rainbowBiome(wave)]].sort();
}

/** Every enemy Rainbow can ever send: the union of all six families, sorted. No bosses. */
export function rainbowRoster(): string[] {
  return [...new Set(Object.values(BIOME_FAMILY).flat())].sort();
}

/** Run-local ContentDb with hp/bounty variants for ALL six families (~31 base enemies). */
export function rainbowContent(content: ContentDb = CONTENT): ContentDb {
  return endlessContent(RAINBOW_LEVEL, content, rainbowRoster());
}

/** One Rainbow wave: the endless generator, roster forced to the wave's biome family. */
export function rainbowWave(attempt: number, wave: number, content: ContentDb = CONTENT): WaveDef {
  return endlessWave(RAINBOW_LEVEL, attempt, wave, content, rainbowFamily(wave));
}

/**
 * Build the run level (id 'rainbow-endless'). Same defeat-only contract as
 * makeEndlessLevel: the waves array is kept ENDLESS_LOOKAHEAD ahead of the
 * sim's win check (extendRainbowLevel on every waveStarted), so 'won' is
 * unreachable and every Rainbow run ends in defeat (spec §9).
 */
export function makeRainbowLevel(attempt: number, content: ContentDb = CONTENT): EndlessLevel {
  const level: EndlessLevel = {
    ...RAINBOW_LEVEL,
    id: `${RAINBOW_LEVEL.id}-endless`,
    blurb: 'Rainbow — every biome, endless.',
    hint: undefined,
    waves: [],
    endless: { baseId: RAINBOW_LEVEL.id, attempt },
  };
  extendRainbowLevel(level, ENDLESS_LOOKAHEAD, content);
  return level;
}

/** Append generated waves until the level holds at least `upTo`. Pure append; idempotent. */
export function extendRainbowLevel(level: EndlessLevel, upTo: number, content: ContentDb = CONTENT): void {
  while (level.waves.length < upTo) {
    level.waves.push(rainbowWave(level.endless.attempt, level.waves.length, content));
  }
}
