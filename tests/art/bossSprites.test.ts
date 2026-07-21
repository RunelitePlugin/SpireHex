import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../../src/content/enemies';
import { BOSS_GRIDS, BOSS_SPRITE_SCALE } from '../../src/art/bossSprites';
import { ENEMY_GRIDS } from '../../src/art/enemySprites';
import { paletteFor } from '../../src/art/sprites';

function nonTransparentCount(grid: readonly string[]): number {
  return grid.reduce((n, row) => n + [...row].filter((ch) => ch !== '.').length, 0);
}

describe('boss sprite grids', () => {
  const bossIds = Object.values(ENEMIES)
    .filter((def) => def.boss !== undefined)
    .map((def) => def.id);

  it('BOSS_GRIDS has exactly the six boss-flagged enemy ids as keys', () => {
    expect(new Set(Object.keys(BOSS_GRIDS))).toEqual(new Set(bossIds));
    expect(Object.keys(BOSS_GRIDS)).toHaveLength(6);
  });

  it('every boss grid is 20 rows x 20 chars using only legal palette keys', () => {
    for (const id of Object.keys(BOSS_GRIDS)) {
      const grid = BOSS_GRIDS[id];
      const def = ENEMIES[id];
      expect(grid.length, `${id} height`).toBe(20);
      const palette = paletteFor(def.element);
      grid.forEach((row, i) => {
        expect(row.length, `${id} row ${i}`).toBe(20);
        for (const ch of row) {
          if (ch === '.') continue;
          expect(palette[ch], `${id}: key '${ch}'`).toBeDefined();
        }
      });
    }
  });

  it('boss grids are pairwise distinct', () => {
    const flat = Object.values(BOSS_GRIDS).map((g) => g.join('\n'));
    expect(new Set(flat).size).toBe(flat.length);
  });

  it('every boss grid has at least 120 non-transparent pixels (bosses fill the frame)', () => {
    for (const [id, grid] of Object.entries(BOSS_GRIDS)) {
      expect(nonTransparentCount(grid), `${id} non-transparent pixel count`).toBeGreaterThanOrEqual(120);
    }
  });

  it('BOSS_SPRITE_SCALE is 4 — bosses bake larger than the shared SPRITE_SCALE=3 (art-direction §Bosses)', () => {
    expect(BOSS_SPRITE_SCALE).toBe(4);
  });

  it('bosses fill the frame more densely than non-boss enemies (silhouette dominance, art-direction §Bosses)', () => {
    const bossAvg =
      Object.values(BOSS_GRIDS).reduce((sum, g) => sum + nonTransparentCount(g), 0) / Object.keys(BOSS_GRIDS).length;
    const enemyAvg =
      Object.values(ENEMY_GRIDS).reduce((sum, g) => sum + nonTransparentCount(g), 0) / Object.keys(ENEMY_GRIDS).length;
    expect(bossAvg).toBeGreaterThan(enemyAvg);
  });
});
