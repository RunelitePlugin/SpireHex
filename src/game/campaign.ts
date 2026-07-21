import { CAMPAIGN } from '../content';
import type { LevelDef } from '../content/types';
import { BIOME_FOR_LEVEL_CONTENT, type BiomeId } from '../content/biomeRoster';

// In-memory campaign unlock state. Phase 5: main.ts restores it from the local
// save at boot (restoreProgress) and BattleScene mirrors it back into the save
// on victory/defeat. Phaser-free on purpose — unit-testable.
let unlockedCount = 1;

/** How many campaign levels are playable (the first N of CAMPAIGN). */
export function unlockedLevelCount(): number {
  return unlockedCount;
}

/** Winning level i unlocks level i+1. Never regresses; capped at the campaign length. */
export function recordWin(levelIndex: number): void {
  unlockedCount = Math.min(Math.max(unlockedCount, levelIndex + 2), CAMPAIGN.length);
}

/**
 * Adopt a saved unlock count (boot-time restore). Clamped so a bad save cannot brick the menu.
 * Intentionally non-monotonic — the boot-after-resetSave path depends on being able to regress.
 */
export function restoreProgress(count: number): void {
  unlockedCount = Math.min(Math.max(1, Math.floor(count)), CAMPAIGN.length);
}

/** Back to only level 1 unlocked (tests; also what resetting the save gives you). */
export function resetCampaignProgress(): void {
  unlockedCount = 1;
}

/** Display names, one per shipped biome — P14 MUST extend this (Record forces it). */
export const BIOME_TITLES: Record<BiomeId, string> = {
  ember: 'Ember Wastes',
  frost: 'Frostfell',
  verdant: 'Verdant Deep',
  storm: 'Storm Reach',
  radiant: 'Radiant Summits',
  umbral: 'Umbral Depths',
};

export interface BiomePage {
  biome: BiomeId;
  title: string;
  /** Levels with their GLOBAL campaign index (BattleScene starts by index). */
  levels: Array<{ level: LevelDef; index: number }>;
}

/** One page per biome, campaign order preserved. Pure — derived, never stored. */
export function biomePages(): BiomePage[] {
  const pages: BiomePage[] = [];
  CAMPAIGN.forEach((level, index) => {
    const biome = BIOME_FOR_LEVEL_CONTENT[level.id];
    const page = pages[pages.length - 1];
    if (page === undefined || page.biome !== biome) {
      pages.push({ biome, title: BIOME_TITLES[biome], levels: [{ level, index }] });
    } else {
      page.levels.push({ level, index });
    }
  });
  return pages;
}

/** The page holding the furthest-unlocked level (clamped) — where the player left off. */
export function defaultBiomePage(unlockedCount: number): number {
  const idx = Math.min(Math.max(1, Math.floor(unlockedCount)), CAMPAIGN.length) - 1;
  const biome = BIOME_FOR_LEVEL_CONTENT[CAMPAIGN[idx].id];
  return biomePages().findIndex((p) => p.biome === biome);
}
