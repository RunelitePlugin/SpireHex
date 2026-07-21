import { beforeEach, describe, expect, it } from 'vitest';
import { CAMPAIGN } from '../../src/content';
import {
  BIOME_TITLES,
  biomePages,
  defaultBiomePage,
  recordWin,
  resetCampaignProgress,
  restoreProgress,
  unlockedLevelCount,
} from '../../src/game/campaign';

describe('campaign unlocks (in-memory, Phase 5 persists)', () => {
  beforeEach(resetCampaignProgress);

  it('starts with only the first level unlocked', () => {
    expect(unlockedLevelCount()).toBe(1);
  });

  it('unlocks the next level on a win', () => {
    recordWin(0);
    expect(unlockedLevelCount()).toBe(2);
  });

  it('never regresses when an earlier level is replayed and re-won', () => {
    recordWin(0);
    recordWin(1);
    recordWin(0);
    expect(unlockedLevelCount()).toBe(3);
  });

  it('caps at the campaign length on the final win', () => {
    for (let i = 0; i < CAMPAIGN.length; i++) recordWin(i);
    expect(unlockedLevelCount()).toBe(CAMPAIGN.length);
  });

  it('restoreProgress sets the unlocked count from a save', () => {
    restoreProgress(4);
    expect(unlockedLevelCount()).toBe(4);
  });

  it('restoreProgress clamps to [1, campaign length] and floors', () => {
    restoreProgress(0);
    expect(unlockedLevelCount()).toBe(1);
    restoreProgress(99);
    expect(unlockedLevelCount()).toBe(CAMPAIGN.length);
    restoreProgress(2.9); // a hand-edited save should not break unlocks
    expect(unlockedLevelCount()).toBe(2);
  });
});

describe('biome pages (P12 paged level select)', () => {
  it('derives one page per biome in campaign order, 10 levels each', () => {
    const pages = biomePages();
    expect(pages.map((p) => p.biome)).toEqual(['ember', 'frost', 'verdant', 'storm', 'radiant', 'umbral']);
    for (const page of pages) {
      expect(page.levels).toHaveLength(10);
      expect(page.title).toBe(BIOME_TITLES[page.biome]);
    }
    // global campaign indices are preserved (Battle scene needs them)
    expect(pages[1].levels[0].index).toBe(10);
    expect(pages[2].levels[9].index).toBe(29);
    expect(pages[3].levels[0].index).toBe(30);
    expect(pages[4].levels[9].index).toBe(49);
    expect(pages[5].levels[0].index).toBe(50);
    expect(pages[5].levels[9].index).toBe(59);
  });

  it('defaults to the page holding the furthest-unlocked level', () => {
    expect(defaultBiomePage(1)).toBe(0); // fresh save → Ember Wastes
    expect(defaultBiomePage(10)).toBe(0); // level10 unlocked, not yet beaten past it
    expect(defaultBiomePage(11)).toBe(1); // Frostfell open
    expect(defaultBiomePage(21)).toBe(2); // Verdant open
    expect(defaultBiomePage(31)).toBe(3); // Storm Reach open
    expect(defaultBiomePage(41)).toBe(4); // Radiant Summits open
    expect(defaultBiomePage(51)).toBe(5); // Umbral Depths open
    expect(defaultBiomePage(99)).toBe(5); // clamped
  });
});

describe('P12/P13: unlock state spans the full campaign', () => {
  it('recordWin caps at the 60-level campaign and restoreProgress clamps into it', () => {
    resetCampaignProgress();
    recordWin(58);                       // winning level59 unlocks level60
    expect(unlockedLevelCount()).toBe(60);
    recordWin(59);                       // winning the campaign finale never overflows
    expect(unlockedLevelCount()).toBe(60);
    restoreProgress(99);                 // corrupt/legacy save clamps to CAMPAIGN.length
    expect(unlockedLevelCount()).toBe(60);
    restoreProgress(11);                 // a mid-Frostfell save restores exactly
    expect(unlockedLevelCount()).toBe(11);
    resetCampaignProgress();
  });
});
