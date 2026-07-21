import { describe, expect, it } from 'vitest';
import { ELEMENT_IDS } from '../../src/content/elements';
import { TOWERS } from '../../src/content/towers';
import {
  composeGrid,
  ELEMENT_ACCENTS,
  ELEMENT_RAMPS,
  FX_DOT,
  FX_PALETTE,
  FX_SPARK,
  paletteFor,
  TIER_OVERLAYS,
  TOWER_GRIDS,
  towerSpriteGrid,
  type SpriteGrid,
  type SpritePalette,
} from '../../src/art/sprites';

const gridChars = (grid: SpriteGrid): Set<string> => new Set(grid.join('').split(''));

function expectWellFormed(name: string, grid: SpriteGrid, palette: SpritePalette): void {
  expect(grid.length, `${name}: has rows`).toBeGreaterThan(0);
  const width = grid[0].length;
  grid.forEach((row, i) => expect(row.length, `${name} row ${i} width`).toBe(width));
  for (const ch of gridChars(grid)) {
    if (ch === '.') continue;
    expect(palette[ch], `${name}: key '${ch}' missing from palette`).toBeDefined();
  }
}

describe('element ramps and palettes', () => {
  it('defines a 4-tone ramp for every element', () => {
    for (const e of ELEMENT_IDS) {
      const ramp = ELEMENT_RAMPS[e];
      expect(ramp).toBeDefined();
      for (const tone of [ramp.d, ramp.m, ramp.l, ramp.g]) {
        expect(tone).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('ELEMENT_ACCENTS is the numeric form of each ramp light tone', () => {
    expect(ELEMENT_ACCENTS.fire).toBe(0xe07b39);
    for (const e of ELEMENT_IDS) {
      expect(ELEMENT_ACCENTS[e]).toBe(parseInt(ELEMENT_RAMPS[e].l.slice(1), 16));
    }
  });

  it('paletteFor adds accent keys D/M/L/G only when an accent is given', () => {
    expect(paletteFor('fire').D).toBeUndefined();
    expect(paletteFor('fire', 'shadow').D).toBe(ELEMENT_RAMPS.shadow.d);
    expect(paletteFor('fire', 'shadow').G).toBe(ELEMENT_RAMPS.shadow.g);
  });
});

describe('composeGrid', () => {
  it('overlays non-dot pixels and preserves dots', () => {
    expect(composeGrid(['ab', 'cd'], ['.x', '..'])).toEqual(['ax', 'cd']);
  });

  it('rejects mismatched dimensions', () => {
    expect(() => composeGrid(['ab'], ['ab', 'cd'])).toThrow();
    expect(() => composeGrid(['ab', 'cd'], ['abc', 'cd.'])).toThrow();
  });
});

describe('tower sprite grids', () => {
  it('every tower id has a 20×20 grid using only its palette keys', () => {
    for (const def of Object.values(TOWERS)) {
      const grid = TOWER_GRIDS[def.id];
      expect(grid, `missing grid for ${def.id}`).toBeDefined();
      expect(grid.length, `${def.id} height`).toBe(20);
      expectWellFormed(def.id, grid, paletteFor(def.element));
    }
  });

  it('tower grids are pairwise distinct — each tower reads unique', () => {
    const flat = Object.values(TOWER_GRIDS).map((g) => g.join('\n'));
    expect(new Set(flat).size).toBe(flat.length);
  });

  it('tier upgrades visibly change the sprite', () => {
    for (const def of Object.values(TOWERS)) {
      const t0 = towerSpriteGrid(def.id, 0).join('\n');
      const t1 = towerSpriteGrid(def.id, 1).join('\n');
      const t2 = towerSpriteGrid(def.id, 2).join('\n');
      expect(t1, `${def.id} t1 vs t0`).not.toBe(t0);
      expect(t2, `${def.id} t2 vs t1`).not.toBe(t1);
    }
  });

  it('tier overlays land on the shared plinth — never on transparent pixels', () => {
    for (const overlay of TIER_OVERLAYS) {
      expect(overlay.length).toBe(20);
      for (const def of Object.values(TOWERS)) {
        const base = TOWER_GRIDS[def.id];
        overlay.forEach((row, y) => {
          for (let x = 0; x < row.length; x++) {
            if (row[x] !== '.') {
              expect(base[y][x], `${def.id}: overlay pixel ${x},${y} would float`).not.toBe('.');
            }
          }
        });
      }
    }
  });

  it('towerSpriteGrid throws for unknown tower ids', () => {
    expect(() => towerSpriteGrid('nope', 0)).toThrow();
  });
});

describe('fx grids', () => {
  it('are well formed against the fx palette', () => {
    expectWellFormed('FX_DOT', FX_DOT, FX_PALETTE);
    expectWellFormed('FX_SPARK', FX_SPARK, FX_PALETTE);
  });
});
