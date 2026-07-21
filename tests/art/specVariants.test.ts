import { describe, expect, it } from 'vitest';
import { TOWERS } from '../../src/content/towers';
import { SPEC_VARIANTS } from '../../src/art/specSprites';
import { specSpriteGrid, towerSpriteGrid } from '../../src/art/sprites';

const ALLOWED_KEYS = '.oswSdmlg'; // overlays are authored in base keys; accentRemap runs at compose time

describe('specialization sprite variants', () => {
  const allSpecs = Object.values(TOWERS).flatMap((def) =>
    def.specializations.map((spec) => ({ towerId: def.id, specId: spec.id })),
  );

  it('covers every spec id — no gaps, no orphans', () => {
    expect(allSpecs).toHaveLength(36);
    for (const { specId } of allSpecs) {
      expect(SPEC_VARIANTS[specId], `missing variant for ${specId}`).toBeDefined();
    }
    expect(Object.keys(SPEC_VARIANTS)).toHaveLength(36);
  });

  it('overlays are 20×20 and use only allowed keys', () => {
    for (const [specId, { overlay }] of Object.entries(SPEC_VARIANTS)) {
      expect(overlay.length, `${specId} height`).toBe(20);
      overlay.forEach((row, i) => expect(row.length, `${specId} row ${i}`).toBe(20));
      for (const ch of new Set(overlay.join('').split(''))) {
        expect(ALLOWED_KEYS.includes(ch), `${specId}: bad key '${ch}'`).toBe(true);
      }
    }
  });

  it('every composed spec sprite differs from tier 2 and from every other spec', () => {
    const composed = allSpecs.map(({ towerId, specId }) => specSpriteGrid(towerId, specId).join('\n'));
    expect(new Set(composed).size).toBe(composed.length);
    for (const { towerId, specId } of allSpecs) {
      expect(specSpriteGrid(towerId, specId).join('\n'), `${specId} identical to tier 2`).not.toBe(
        towerSpriteGrid(towerId, 2).join('\n'),
      );
    }
  });
});
