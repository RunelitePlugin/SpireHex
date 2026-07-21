import { describe, expect, it } from 'vitest';
import { CAMPAIGN } from '../../src/content';
import { BIOME_FOR_LEVEL_CONTENT } from '../../src/content/biomeRoster';
import { BIOMES, BIOME_FOR_LEVEL, biomeForLevel, type BiomePalette } from '../../src/art/biomes';

const isColor = (n: unknown): boolean => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 0xffffff;

function allColors(p: BiomePalette): number[] {
  return [
    ...p.groundTones, p.gridLine, p.edgeLight, p.pathFill, p.pathSpeckle, p.pathEmber,
    p.cliffFace, p.cliffTop, p.decoTuft, p.decoStone, p.decoStoneDark, p.decoSpark,
    ...p.background.skyBands, ...p.background.ridges, p.background.mote,
  ];
}

describe('biome palettes', () => {
  it('every campaign level resolves to a defined biome palette', () => {
    for (const level of CAMPAIGN) {
      const biome = biomeForLevel(level.id);
      expect(biome, level.id).toBeDefined();
      expect(BIOMES[biome.id]).toBe(biome);
    }
  });

  it('every campaign level is an OWN key of the biome table — the ember fallback must never mask a forgotten keying', () => {
    for (const level of CAMPAIGN) {
      expect(Object.prototype.hasOwnProperty.call(BIOME_FOR_LEVEL, level.id), level.id).toBe(true);
    }
  });

  it('BIOME_FOR_LEVEL is the content registry (single source of truth, P11)', () => {
    expect(BIOME_FOR_LEVEL).toEqual(BIOME_FOR_LEVEL_CONTENT);
  });

  it('every palette field is a valid 24-bit color', () => {
    for (const p of Object.values(BIOMES)) {
      for (const c of allColors(p)) expect(isColor(c), `${p.id}: ${c}`).toBe(true);
      expect(p.background.skyBands.length).toBeGreaterThanOrEqual(3);
      expect(p.background.ridges.length).toBe(2);
    }
  });

  it('ground tones are three distinct values (seeded per-hex variation needs contrast)', () => {
    for (const p of Object.values(BIOMES)) {
      expect(new Set(p.groundTones).size).toBe(3);
    }
  });

  it('path fill differs from every ground tone (the route must read at a glance)', () => {
    for (const p of Object.values(BIOMES)) {
      for (const tone of p.groundTones) expect(p.pathFill).not.toBe(tone);
    }
  });

  it('unknown level ids fall back to ember (forward-compat for dev/scratch levels)', () => {
    expect(biomeForLevel('no-such-level').id).toBe('ember');
  });

  it('endless variant ids inherit the base level biome (P13 gate finding)', () => {
    expect(biomeForLevel('level11-endless').id).toBe('frost');
    expect(biomeForLevel('level31-endless').id).toBe('storm');
    expect(biomeForLevel('level41-endless').id).toBe('radiant');
  });
});
