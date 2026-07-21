import { describe, expect, it } from 'vitest';
import { TOWERS } from '../../src/content/towers';
import { ASCENSION_ARCHETYPE, ascensionSpriteGrid, ascTexKey } from '../../src/art/ascensionSprites';
import { specSpriteGrid, type SpriteGrid } from '../../src/art/sprites';

const ALLOWED_KEYS = '.oswSdmlgDMLG'; // composed grids may carry accent-remapped keys (D/M/L/G)

/** Number of differing pixels between two equal-sized grids. */
const diff = (a: SpriteGrid, b: SpriteGrid): number =>
  a.reduce((n, row, y) => n + [...row].filter((ch, x) => b[y][x] !== ch).length, 0);

describe('ascension sprites', () => {
  const allSpecs = Object.values(TOWERS).flatMap((def) =>
    def.specializations.map((spec) => ({ towerId: def.id, specId: spec.id })),
  );

  it('covers every spec id — no gaps, no orphans', () => {
    expect(allSpecs).toHaveLength(36);
    for (const { specId } of allSpecs) {
      expect(ASCENSION_ARCHETYPE[specId], `missing archetype for ${specId}`).toBeDefined();
    }
    expect(Object.keys(ASCENSION_ARCHETYPE)).toHaveLength(36);
  });

  it('composed grids are 20×20 and use only legal palette keys', () => {
    for (const { towerId, specId } of allSpecs) {
      const grid = ascensionSpriteGrid(towerId, specId);
      expect(grid.length, `${specId} height`).toBe(20);
      grid.forEach((row, i) => expect(row.length, `${specId} row ${i}`).toBe(20));
      for (const ch of new Set(grid.join('').split(''))) {
        expect(ALLOWED_KEYS.includes(ch), `${specId}: bad key '${ch}'`).toBe(true);
      }
    }
  });

  it('ascension composition changes at least 24 pixels vs the spec sprite — exceeds the tier law (≥12)', () => {
    for (const { towerId, specId } of allSpecs) {
      const spec = specSpriteGrid(towerId, specId);
      const asc = ascensionSpriteGrid(towerId, specId);
      expect(diff(spec, asc), `${specId} spec→ascension`).toBeGreaterThanOrEqual(24);
    }
  });

  it('all 36 ascension sprites are pairwise distinct', () => {
    const all = allSpecs.map(({ towerId, specId }) => ascensionSpriteGrid(towerId, specId).join('\n'));
    expect(new Set(all).size).toBe(all.length);
  });

  it('rows 16–19 are identical to the spec sprite — plinth untouched', () => {
    for (const { towerId, specId } of allSpecs) {
      const spec = specSpriteGrid(towerId, specId);
      const asc = ascensionSpriteGrid(towerId, specId);
      for (let y = 16; y < 20; y++) {
        expect(asc[y], `${specId} row ${y}`).toBe(spec[y]);
      }
    }
  });

  it('throws for an unknown spec id', () => {
    expect(() => ascensionSpriteGrid('emberSpire', 'notARealSpec')).toThrow();
  });

  it('ascTexKey namespaces by spec id', () => {
    expect(ascTexKey('emberMagmaMortar')).toBe('asc-emberMagmaMortar');
    expect(ascTexKey('sentryGatling')).toBe('asc-sentryGatling');
  });
});
