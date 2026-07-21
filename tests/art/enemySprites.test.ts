import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../../src/content/enemies';
import { ENEMY_GRIDS } from '../../src/art/enemySprites';
import { paletteFor } from '../../src/art/sprites';

describe('enemy sprite grids', () => {
  // P11: bosses get their own 20×20 grid system (src/art/bossSprites.ts, baked
  // ×4, Task 12-14) — NOT the 12×12 ENEMY_GRIDS non-boss enemies use here.
  const nonBoss = Object.values(ENEMIES).filter((def) => def.boss === undefined);

  it('every non-boss enemy id has a 12×12 grid using only its palette keys', () => {
    for (const def of nonBoss) {
      const grid = ENEMY_GRIDS[def.id];
      expect(grid, `missing grid for ${def.id}`).toBeDefined();
      expect(grid.length, `${def.id} height`).toBe(12);
      const palette = paletteFor(def.element);
      grid.forEach((row, i) => {
        expect(row.length, `${def.id} row ${i}`).toBe(12);
        for (const ch of row) {
          if (ch === '.') continue;
          expect(palette[ch], `${def.id}: key '${ch}'`).toBeDefined();
        }
      });
    }
    expect(Object.keys(ENEMY_GRIDS)).toHaveLength(nonBoss.length);
  });

  it('enemy grids are pairwise distinct — archetypes read differently', () => {
    const flat = Object.values(ENEMY_GRIDS).map((g) => g.join('\n'));
    expect(new Set(flat).size).toBe(flat.length);
  });
});
