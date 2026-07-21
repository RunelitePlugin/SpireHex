import { describe, expect, it } from 'vitest';
import { CAMPAIGN, CONTENT, LEVELS } from '../../src/content';
import { BIOME_FAMILY } from '../../src/content/biomeRoster';
import { ENDLESS_LOOKAHEAD, ENDLESS_MAX_TIER, baseEnemyId, hpTier, variantId } from '../../src/content/endless';
import { RAINBOW_LEVEL } from '../../src/content/levels/rainbow';
import {
  RAINBOW_CYCLE,
  extendRainbowLevel,
  makeRainbowLevel,
  rainbowBiome,
  rainbowContent,
  rainbowFamily,
  rainbowRoster,
  rainbowWave,
} from '../../src/content/rainbow';

describe('Rainbow Mode generator (spec §9, P15)', () => {
  it('cycles all six biomes wave-by-wave in campaign order', () => {
    expect(RAINBOW_CYCLE).toEqual(['ember', 'frost', 'verdant', 'storm', 'radiant', 'umbral']);
    expect(Array.from({ length: 6 }, (_, w) => rainbowBiome(w))).toEqual([...RAINBOW_CYCLE]);
    expect(rainbowBiome(6)).toBe('ember'); // wraps
    expect(rainbowBiome(11)).toBe('umbral');
  });

  it("every wave's spawns come from that wave's biome family — correct variant tier, never a boss", () => {
    const content = rainbowContent();
    for (const attempt of [1, 2]) {
      for (let w = 0; w < 30; w++) {
        const family = new Set(rainbowFamily(w));
        for (const e of rainbowWave(attempt, w, content).entries) {
          const base = baseEnemyId(e.enemyId);
          expect(family.has(base), `attempt ${attempt} wave ${w}: ${e.enemyId}`).toBe(true);
          expect(e.enemyId).toBe(variantId(base, hpTier(w)));
          expect(content.enemies[e.enemyId].boss, e.enemyId).toBeUndefined();
        }
      }
    }
  });

  it('is deterministic per (attempt, wave) and reshuffles across attempts', () => {
    const content = rainbowContent();
    for (let w = 0; w < 12; w++) {
      expect(rainbowWave(3, w, content)).toEqual(rainbowWave(3, w, content));
    }
    const differs = Array.from({ length: 8 }, (_, w) =>
      JSON.stringify(rainbowWave(1, w, content)) !== JSON.stringify(rainbowWave(2, w, content)),
    );
    expect(differs).toContain(true);
  });

  it('rosters the union of all six families: 31 sorted ids, boss-free', () => {
    const roster = rainbowRoster();
    expect(roster).toHaveLength(31); // ember 6 + 5×5 (measured: zero id overlap across families)
    expect(roster).toEqual([...roster].sort());
    expect(new Set(roster)).toEqual(new Set(Object.values(BIOME_FAMILY).flat()));
    for (const id of roster) expect(CONTENT.enemies[id].boss, id).toBeUndefined();
  });

  it('rainbowContent scales variants for every roster enemy; frozen CONTENT untouched', () => {
    const content = rainbowContent();
    for (const id of rainbowRoster()) {
      expect(content.enemies[variantId(id, 2)], id).toBeDefined();
      expect(content.enemies[variantId(id, ENDLESS_MAX_TIER)], id).toBeDefined();
    }
    expect(Object.keys(CONTENT.enemies).some((id) => id.includes('@'))).toBe(false);
  });

  it('makeRainbowLevel: defeat-only endless shell on the Causeway, lookahead primed', () => {
    const level = makeRainbowLevel(1);
    expect(level.id).toBe('rainbow-endless');
    expect(level.endless).toEqual({ baseId: 'rainbow', attempt: 1 });
    expect(level.hint).toBeUndefined();
    expect(level.waves).toHaveLength(ENDLESS_LOOKAHEAD);
    extendRainbowLevel(level, 9);
    expect(level.waves).toHaveLength(9);
    extendRainbowLevel(level, 4); // idempotent — never truncates
    expect(level.waves).toHaveLength(9);
  });

  it('the Causeway is NOT a campaign level: every campaign-derived pin stays at 60', () => {
    expect(CAMPAIGN.some((l) => l.id === RAINBOW_LEVEL.id)).toBe(false);
    expect(LEVELS[RAINBOW_LEVEL.id]).toBeUndefined();
    expect(RAINBOW_LEVEL.waves).toHaveLength(0); // authored waves stay empty — Rainbow generates
    expect(RAINBOW_LEVEL.hint).toBeUndefined(); // hint law: no debut, no hint
  });

  it('locks the attempt-1 opener exactly (prototype-measured): ember wave 0, frost wave 1', () => {
    expect(rainbowWave(1, 0)).toEqual({
      entries: [
        { enemyId: 'frostmite', count: 10, spacing: 0.27, pathIndex: 0 },
        { enemyId: 'cinderwisp', count: 5, spacing: 0.35, pathIndex: 0 },
      ],
    });
    expect(rainbowWave(1, 1)).toEqual({
      entries: [
        { enemyId: 'frostbrand', count: 2, spacing: 0.891, pathIndex: 0 },
        { enemyId: 'driftmote', count: 13, spacing: 0.317, pathIndex: 0 },
      ],
    });
  });
});
