import { describe, expect, it } from 'vitest';
import { CONTENT, LEVELS } from '../../src/content';
import {
  ENDLESS_LOOKAHEAD,
  ENDLESS_MAX_TIER,
  baseEnemyId,
  endlessContent,
  endlessRoster,
  endlessSeed,
  endlessWave,
  extendEndlessLevel,
  hpTier,
  makeEndlessLevel,
  variantId,
} from '../../src/content/endless';

const L01 = LEVELS.level01;
const L07 = LEVELS.level07; // multi-path

describe('endless wave generator (spec §9)', () => {
  it('endlessSeed separates level, attempt, and wave', () => {
    const seeds = [
      endlessSeed('level01', 1, 0),
      endlessSeed('level01', 2, 0),
      endlessSeed('level02', 1, 0),
      endlessSeed('level01', 1, 1),
    ];
    expect(new Set(seeds).size).toBe(seeds.length);
  });

  it('is deterministic: same (level, attempt, wave) yields deep-equal waves', () => {
    for (let k = 0; k < 20; k++) {
      expect(endlessWave(L01, 3, k)).toEqual(endlessWave(L01, 3, k));
    }
  });

  it('a different attempt reshuffles the run (some wave among the first 8 differs)', () => {
    const differs = Array.from({ length: 8 }, (_, k) =>
      JSON.stringify(endlessWave(L01, 1, k)) !== JSON.stringify(endlessWave(L01, 2, k)),
    );
    expect(differs).toContain(true);
  });

  it('rosters the level biome family, sorted (P11: never the level\'s own waves once biome-keyed)', () => {
    expect(endlessRoster(L01)).toEqual(['cinderwisp', 'duskstalker', 'flamewisp', 'frostmite', 'gloomling', 'stoneshell']);
  });

  it('falls back to wave-derived rostering for a level with no biome key (scratch/test levels)', () => {
    // P11: level01 is gloomling-only post-conversion (Task 9) — the fallback
    // derives strictly from the scratch level's own waves.
    const scratch = { ...L01, id: 'scratchLevel99' };
    expect(endlessRoster(scratch)).toEqual(['gloomling']);
  });

  it('locks the level01 attempt-1 opener exactly (prototype-measured)', () => {
    expect(endlessWave(L01, 1, 0)).toEqual({
      entries: [
        { enemyId: 'cinderwisp', count: 5, spacing: 0.35, pathIndex: 0 },
        { enemyId: 'cinderwisp', count: 5, spacing: 0.35, pathIndex: 0 },
      ],
    });
  });

  it('never sends stealth before wave 4 (radiant is unaffordable that early)', () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      for (let k = 0; k < 4; k++) {
        for (const e of endlessWave(L01, attempt, k).entries) {
          expect(CONTENT.enemies[baseEnemyId(e.enemyId)].stealth).not.toBe(true);
        }
      }
    }
  });

  it('caps stealth at one group per wave', () => {
    for (let k = 4; k <= 40; k++) {
      const stealthGroups = endlessWave(L01, 1, k).entries.filter(
        (e) => CONTENT.enemies[baseEnemyId(e.enemyId)].stealth === true,
      );
      expect(stealthGroups.length).toBeLessThanOrEqual(1);
    }
  });

  it('bounds counts to [2,30] and spacing to [0.12,0.9] across 60 waves', () => {
    for (const attempt of [1, 2]) {
      for (let k = 0; k < 60; k++) {
        for (const e of endlessWave(L01, attempt, k).entries) {
          expect(e.count).toBeGreaterThanOrEqual(2);
          expect(e.count).toBeLessThanOrEqual(30);
          expect(e.spacing).toBeGreaterThanOrEqual(0.12);
          expect(e.spacing).toBeLessThanOrEqual(0.9);
        }
      }
    }
  });

  it('spreads multi-path pressure legally (every pathIndex < paths.length)', () => {
    const indices = new Set<number>();
    for (let k = 0; k < 40; k++) {
      for (const e of endlessWave(L07, 1, k).entries) {
        expect(e.pathIndex).toBeLessThan(L07.paths.length);
        indices.add(e.pathIndex ?? 0);
      }
    }
    expect(indices.size).toBe(L07.paths.length); // both roads actually used
    for (const e of endlessWave(L01, 1, 5).entries) expect(e.pathIndex).toBe(0);
  });

  it('hpTier steps every 5 waves and caps at ENDLESS_MAX_TIER', () => {
    expect(hpTier(0)).toBe(1);
    expect(hpTier(4)).toBe(1);
    expect(hpTier(5)).toBe(2);
    expect(hpTier(194)).toBe(39); // cap NOT yet reached: 1 + floor(194/5) = 39
    expect(hpTier(195)).toBe(ENDLESS_MAX_TIER);
    expect(hpTier(500)).toBe(ENDLESS_MAX_TIER);
    expect(variantId('gloomling', 1)).toBe('gloomling');
    expect(variantId('gloomling', 5)).toBe('gloomling@5');
  });
});

describe('endless variant content + level assembly', () => {
  it('variant ids round-trip through baseEnemyId', () => {
    expect(baseEnemyId(variantId('stoneshell', 17))).toBe('stoneshell');
    expect(baseEnemyId('gloomling')).toBe('gloomling');
  });

  it('endlessContent carries every base enemy untouched plus roster tiers 2..40', () => {
    const c = endlessContent(L01);
    for (const id of Object.keys(CONTENT.enemies)) expect(c.enemies[id]).toEqual(CONTENT.enemies[id]);
    for (const id of endlessRoster(L01)) {
      for (let t = 2; t <= ENDLESS_MAX_TIER; t++) expect(c.enemies[variantId(id, t)]).toBeDefined();
    }
    expect(c.towers).toBe(CONTENT.towers);
  });

  it('variants follow the growth formulas exactly (gloomling@5: hp 89, bounty 8)', () => {
    const v = endlessContent(L01).enemies['gloomling@5'];
    expect(v.hp).toBe(Math.round(40 * Math.pow(1.22, 4)));   // = 89
    expect(v.bounty).toBe(Math.round(3 * Math.pow(1.28, 4))); // = 8
    expect(v.hp).toBe(89);
    expect(v.bounty).toBe(8);
  });

  it('variants keep speed/armor/element/livesCost/stealth identical to the base', () => {
    const c = endlessContent(L01);
    for (const id of endlessRoster(L01)) {
      const base = CONTENT.enemies[id];
      const v = c.enemies[variantId(id, 9)];
      expect(v.speed).toBe(base.speed);
      expect(v.armor).toBe(base.armor);
      expect(v.element).toBe(base.element);
      expect(v.livesCost).toBe(base.livesCost);
      expect(v.stealth ?? false).toBe(base.stealth ?? false);
    }
  });

  it('never mutates the frozen campaign content', () => {
    endlessContent(L01);
    for (const key of Object.keys(CONTENT.enemies)) expect(key.includes('@')).toBe(false);
    expect(Object.isFrozen(CONTENT.enemies)).toBe(true);
  });

  it('makeEndlessLevel: derived id, no hint, LOOKAHEAD waves, run meta, shared geometry', () => {
    const level = makeEndlessLevel(L01, 7);
    expect(level.id).toBe('level01-endless');
    expect(level.hint).toBeUndefined();
    expect(level.waves).toHaveLength(ENDLESS_LOOKAHEAD);
    expect(level.endless).toEqual({ baseId: 'level01', attempt: 7 });
    expect(level.hexes).toBe(L01.hexes);
    expect(level.paths).toBe(L01.paths);
    expect(level.startingGold).toBe(L01.startingGold);
    expect(level.lives).toBe(L01.lives);
    expect(level.waves[0]).toEqual(endlessWave(L01, 7, 0));
  });

  it('extendEndlessLevel tops up to the target and is idempotent', () => {
    const level = makeEndlessLevel(L01, 1);
    extendEndlessLevel(level, L01, 10);
    expect(level.waves).toHaveLength(10);
    expect(level.waves[9]).toEqual(endlessWave(L01, 1, 9));
    extendEndlessLevel(level, L01, 5); // upTo below length: no-op
    expect(level.waves).toHaveLength(10);
  });

  it('every enemy in 60 generated waves resolves in endlessContent, and 10-wave block hp strictly climbs', () => {
    const c = endlessContent(L01);
    const totals: number[] = [];
    for (let k = 0; k < 60; k++) {
      let hp = 0;
      for (const e of endlessWave(L01, 1, k, c).entries) {
        const def = c.enemies[e.enemyId];
        expect(def).toBeDefined();
        hp += def.hp * e.count;
      }
      totals.push(hp);
    }
    // Strict per-wave monotonicity is FALSE under composition variance (prototype-
    // proven); the honest invariant is that 10-wave block totals strictly climb.
    for (let b = 0; b + 1 < 6; b++) {
      const sum = (i: number) => totals.slice(i * 10, i * 10 + 10).reduce((a, x) => a + x, 0);
      expect(sum(b + 1)).toBeGreaterThan(sum(b));
    }
  });
});
