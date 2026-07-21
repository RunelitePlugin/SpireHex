import { describe, expect, it } from 'vitest';
import { CAMPAIGN, CONTENT, LEVELS } from '../../src/content';
import { BIOME_FAMILY, BIOME_FOR_LEVEL_CONTENT } from '../../src/content/biomeRoster';
import type { LevelDef } from '../../src/content/types';
import { hexDistance, hexKey } from '../../src/sim/hex';
import { TICK_RATE } from '../../src/sim/constants';

/** Total count of one enemy type across every wave of a level. */
function enemyCount(level: LevelDef, enemyId: string): number {
  return level.waves
    .flatMap((w) => w.entries)
    .filter((e) => e.enemyId === enemyId)
    .reduce((sum, e) => sum + e.count, 0);
}

describe('campaign registry', () => {
  it('orders levels level01..levelNN and mirrors them in LEVELS', () => {
    expect(CAMPAIGN.length).toBeGreaterThanOrEqual(1);
    CAMPAIGN.forEach((level, i) => {
      expect(level.id).toBe(`level${String(i + 1).padStart(2, '0')}`);
      expect(LEVELS[level.id]).toBe(level);
    });
    expect(Object.keys(LEVELS)).toHaveLength(CAMPAIGN.length);
  });

  it('gives every level the campaign fields: blurb, countdown, early-call rate, 20 lives', () => {
    for (const level of CAMPAIGN) {
      expect(level.blurb.length, level.id).toBeGreaterThan(0);
      expect(level.blurb.length, level.id).toBeLessThanOrEqual(48); // fits the select card
      expect(level.waveCountdown, level.id).toBeGreaterThan(0);
      // Tick-exactness: waveCountdown must convert to a whole number of ticks — the
      // sim rounds it (Math.round) into countdownTicks, so a fractional-tick value
      // would silently drift instead of failing loudly here.
      expect(Number.isInteger(level.waveCountdown * TICK_RATE), level.id).toBe(true);
      expect(level.earlyCallRate, level.id).toBeGreaterThanOrEqual(0);
      expect(level.lives, level.id).toBe(20); // spec §5: 20 lives per level
      expect(level.startingGold, level.id).toBeGreaterThan(0);
    }
  });
});

describe('campaign paths', () => {
  it('keeps every path on-grid with 2+ hex-adjacent waypoints', () => {
    for (const level of CAMPAIGN) {
      const grid = new Set(level.hexes.map(hexKey));
      expect(level.paths.length, level.id).toBeGreaterThanOrEqual(1);
      for (const path of level.paths) {
        expect(path.length).toBeGreaterThanOrEqual(2);
        for (const h of path) expect(grid.has(hexKey(h)), `${level.id}: ${hexKey(h)} off-grid`).toBe(true);
        for (let i = 1; i < path.length; i++) {
          expect(hexDistance(path[i - 1], path[i]), `${level.id} path step ${i} not adjacent`).toBe(1);
        }
      }
    }
  });

  it('covers every path hex in pathHexes so building is blocked on all roads', () => {
    for (const level of CAMPAIGN) {
      const blocked = new Set(level.pathHexes.map(hexKey));
      for (const path of level.paths) {
        for (const h of path) expect(blocked.has(hexKey(h)), `${level.id}: ${hexKey(h)} unblocked`).toBe(true);
      }
    }
  });
});

describe('campaign waves', () => {
  it('references only real enemies, positive counts/spacing, and valid path indexes', () => {
    for (const level of CAMPAIGN) {
      for (const [wi, wave] of level.waves.entries()) {
        expect(wave.entries.length, `${level.id} wave ${wi}`).toBeGreaterThan(0);
        for (const entry of wave.entries) {
          expect(CONTENT.enemies[entry.enemyId], `${level.id}: ${entry.enemyId}`).toBeDefined();
          expect(entry.count).toBeGreaterThan(0);
          expect(entry.spacing).toBeGreaterThan(0);
          expect(entry.pathIndex ?? 0, `${level.id} wave ${wi}`).toBeGreaterThanOrEqual(0);
          expect(entry.pathIndex ?? 0, `${level.id} wave ${wi}`).toBeLessThan(level.paths.length);
        }
      }
    }
  });
});

describe('campaign difficulty flavor', () => {
  it('level01 is the gloomling march: 160+ in columns', () => {
    expect(enemyCount(LEVELS.level01, 'gloomling')).toBeGreaterThanOrEqual(160); // P11 measured 168
  });

  it('level02 stages the splash lesson: 216+ frostmites, 72+ gloomlings', () => {
    expect(enemyCount(LEVELS.level02, 'frostmite')).toBeGreaterThanOrEqual(216); // measured 228
    expect(enemyCount(LEVELS.level02, 'gloomling')).toBeGreaterThanOrEqual(72);  // measured 80
  });

  it('level03 is the armored gauntlet: 25+ stoneshells', () => {
    // P8: heavies deliberately kept baseline counts (29) — threshold unchanged.
    expect(enemyCount(LEVELS.level03, 'stoneshell')).toBeGreaterThanOrEqual(25);
  });

  it('level04 leans on stealth: duskstalkers in at least 3 waves', () => {
    const waves = LEVELS.level04.waves.filter((w) => w.entries.some((e) => e.enemyId === 'duskstalker'));
    expect(waves.length).toBeGreaterThanOrEqual(3);
  });

  it('level05 is the swarm flood: 256+ frostmites', () => {
    expect(enemyCount(LEVELS.level05, 'frostmite')).toBeGreaterThanOrEqual(256); // P8: measured 272
  });

  it('level06 is the speed gauntlet: 164+ cinderwisps', () => {
    expect(enemyCount(LEVELS.level06, 'cinderwisp')).toBeGreaterThanOrEqual(164); // P8: measured 176
  });

  it('level10 is the boss finale: exactly one cinderlord, wisp escorts fielded', () => {
    expect(enemyCount(LEVELS.level10, 'cinderlord')).toBe(1);
    expect(enemyCount(LEVELS.level10, 'flamewisp')).toBeGreaterThanOrEqual(20); // measured 22
  });

  it('level07 is the first fork: two roads, both fed in every wave', () => {
    const level = LEVELS.level07;
    expect(level.paths.length).toBe(2);
    for (const wave of level.waves) {
      const roads = new Set(wave.entries.map((e) => e.pathIndex ?? 0));
      expect(roads.has(0)).toBe(true);
      expect(roads.has(1)).toBe(true);
    }
  });
});

describe('campaign completeness (the Phase 4 slice)', () => {
  it('ships exactly 60 levels', () => { // P14: Umbral Depths registered — the campaign is complete
    expect(CAMPAIGN).toHaveLength(60);
  });

  it('ships at least 2 multi-path maps', () => {
    expect(CAMPAIGN.filter((l) => l.paths.length >= 2).length).toBeGreaterThanOrEqual(2);
  });

  it('fields every biome-1 family enemy and the Ember boss (P12-14 extend per biome)', () => {
    for (const enemyId of [...BIOME_FAMILY.ember, 'cinderlord', ...BIOME_FAMILY.frost, 'rimelord', ...BIOME_FAMILY.verdant, 'verdantheart', ...BIOME_FAMILY.storm, 'tempestcaller', ...BIOME_FAMILY.radiant, 'luminarch', ...BIOME_FAMILY.umbral, 'umbrageist']) {
      const used = CAMPAIGN.some((l) => enemyCount(l, enemyId) > 0);
      expect(used, `${enemyId} never appears`).toBe(true);
    }
  });

  it('level15 is the Frostfell swarm bog: 280+ driftmotes', () => {
    expect(enemyCount(LEVELS.level15, 'driftmote')).toBeGreaterThanOrEqual(280); // measured 296
  });

  it('level20 is the Frostfell finale: exactly one rimelord on two fed roads', () => {
    expect(enemyCount(LEVELS.level20, 'rimelord')).toBe(1);
    expect(LEVELS.level20.paths.length).toBe(2);
  });

  it('level25 is the Verdant swarm basin: 300+ sporelings', () => {
    expect(enemyCount(LEVELS.level25, 'sporeling')).toBeGreaterThanOrEqual(300); // measured 314
  });

  it('level30 is the Verdant finale: exactly one verdantheart on two fed roads', () => {
    expect(enemyCount(LEVELS.level30, 'verdantheart')).toBe(1);
    expect(LEVELS.level30.paths.length).toBe(2);
  });

  it('level35 is the Storm swarm sea: 300+ sparkmotes', () => {
    expect(enemyCount(LEVELS.level35, 'sparkmote')).toBeGreaterThanOrEqual(300); // measured 324
  });

  it('level40 is the Storm finale: exactly one tempestcaller on two fed roads', () => {
    expect(enemyCount(LEVELS.level40, 'tempestcaller')).toBe(1);
    expect(LEVELS.level40.paths.length).toBe(2);
  });

  it('level45 is the Radiant glimmer flood: 320+ lumenmotes', () => {
    expect(enemyCount(LEVELS.level45, 'lumenmote')).toBeGreaterThanOrEqual(320); // measured 338
  });

  it('level50 is the Radiant finale: exactly one luminarch on two fed roads', () => {
    expect(enemyCount(LEVELS.level50, 'luminarch')).toBe(1);
    expect(LEVELS.level50.paths.length).toBe(2);
  });

  it('level10 is the combo finale: two roads and 4+ archetypes including armor, stealth, swarm', () => {
    const finale = LEVELS.level10;
    expect(finale.paths.length).toBe(2);
    const ids = new Set(finale.waves.flatMap((w) => w.entries.map((e) => e.enemyId)));
    expect(ids.size).toBeGreaterThanOrEqual(4);
    for (const required of ['stoneshell', 'duskstalker', 'frostmite']) {
      expect(ids.has(required), `finale missing ${required}`).toBe(true);
    }
  });

  it('level10 fields a designated swarm wave: 40+ frostmites in one entry (spec §2 band)', () => {
    const swarmEntry = LEVELS.level10.waves
      .flatMap((w) => w.entries)
      .some((e) => e.enemyId === 'frostmite' && e.count >= 40);
    expect(swarmEntry).toBe(true);
  });

  it('level55 is the Umbral mote sea: 330+ voidmotes', () => {
    expect(enemyCount(LEVELS.level55, 'voidmote')).toBeGreaterThanOrEqual(330); // measured 358
  });

  it('level60 is the campaign finale: exactly one umbrageist on two fed roads', () => {
    expect(enemyCount(LEVELS.level60, 'umbrageist')).toBe(1);
    expect(LEVELS.level60.paths.length).toBe(2);
  });
});

describe('P15 full-campaign sweep invariant', () => {
  it("every biome family enemy marches in its own biome's campaign levels (no orphaned roster entries)", () => {
    // Rainbow (and per-map endless) draw rosters from BIOME_FAMILY — this pins
    // that the campaign actually TEACHES every family member before free play
    // can send it. Derivation-based: sweeps all 60 wave tables, no id lists.
    const used: Record<string, Set<string>> = {};
    for (const level of CAMPAIGN) {
      const biome = BIOME_FOR_LEVEL_CONTENT[level.id];
      used[biome] ??= new Set();
      for (const wave of level.waves) for (const entry of wave.entries) used[biome].add(entry.enemyId);
    }
    for (const [biome, family] of Object.entries(BIOME_FAMILY)) {
      for (const id of family) {
        expect(used[biome].has(id), `${biome}: ${id} never appears in its biome's levels`).toBe(true);
      }
    }
  });
});
