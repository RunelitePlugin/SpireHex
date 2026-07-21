import { describe, expect, it } from 'vitest';
import { CAMPAIGN, CONTENT } from '../../src/content';
import { BIOME_BOSS, BIOME_FAMILY, BIOME_FOR_LEVEL_CONTENT, BIOME_TOWER_UNLOCK } from '../../src/content/biomeRoster';
import type { BiomeId } from '../../src/content/biomeRoster';

const BIOME_IDS = Object.keys(BIOME_FAMILY) as BiomeId[];

describe('biome registry (P11 spec §5)', () => {
  it('every BIOME_FAMILY id exists in CONTENT.enemies and is not boss-flagged', () => {
    for (const biome of BIOME_IDS) {
      for (const enemyId of BIOME_FAMILY[biome]) {
        const def = CONTENT.enemies[enemyId];
        expect(def, `${biome}: ${enemyId} missing from CONTENT.enemies`).toBeDefined();
        expect(def.boss, `${biome}: ${enemyId} is boss-flagged but is a family enemy`).toBeUndefined();
      }
    }
  });

  it('every BIOME_BOSS id exists, is boss-flagged, and pays a heavy multi-life bounty (spec §5)', () => {
    for (const biome of BIOME_IDS) {
      const bossId = BIOME_BOSS[biome];
      const def = CONTENT.enemies[bossId];
      expect(def, `${biome}: boss ${bossId} missing from CONTENT.enemies`).toBeDefined();
      expect(def.boss, `${biome}: ${bossId} is not boss-flagged`).toBeDefined();
      expect(def.livesCost, `${biome}: ${bossId} livesCost`).toBeGreaterThanOrEqual(5);
      expect(def.bounty, `${biome}: ${bossId} bounty`).toBeGreaterThanOrEqual(150);
    }
  });

  it('every boss ability split/spawnAdds spawnId references a real enemy', () => {
    for (const def of Object.values(CONTENT.enemies)) {
      if (!def.boss) continue;
      for (const ability of def.boss.abilities) {
        if (ability.effect.kind === 'split' || ability.effect.kind === 'spawnAdds') {
          expect(
            CONTENT.enemies[ability.effect.spawnId],
            `${def.id}: ${ability.effect.kind} spawnId ${ability.effect.spawnId} is not a real enemy`,
          ).toBeDefined();
        }
      }
    }
  });

  it('every BIOME_TOWER_UNLOCK is a real tower matching the biome boss element', () => {
    for (const biome of BIOME_IDS) {
      const towerId = BIOME_TOWER_UNLOCK[biome];
      const tower = CONTENT.towers[towerId];
      expect(tower, `${biome}: unlock tower ${towerId} missing from CONTENT.towers`).toBeDefined();
      const bossDef = CONTENT.enemies[BIOME_BOSS[biome]];
      expect(tower.element, `${biome}: unlock tower element mismatch`).toBe(bossDef.element);
    }
  });

  it('BIOME_FOR_LEVEL_CONTENT keys exactly the campaign level ids (CAMPAIGN-derived)', () => {
    expect(Object.keys(BIOME_FOR_LEVEL_CONTENT).sort()).toEqual(CAMPAIGN.map((l) => l.id).sort());
    for (const biome of Object.values(BIOME_FOR_LEVEL_CONTENT)) {
      expect(BIOME_IDS, `unknown biome ${biome}`).toContain(biome);
    }
  });

  it('exactly 6 bosses exist, one per element', () => {
    const bosses = Object.values(CONTENT.enemies).filter((e) => e.boss !== undefined);
    expect(bosses).toHaveLength(6);
    expect(new Set(bosses.map((b) => b.element)).size).toBe(6);
  });

  it('boss ability kinds pin the spec §5 table', () => {
    const kindsOf = (id: string) => new Set(CONTENT.enemies[id].boss!.abilities.map((a) => a.effect.kind));
    expect(kindsOf('cinderlord')).toEqual(new Set(['split']));
    expect(kindsOf('rimelord')).toEqual(new Set(['freezeTowers']));
    expect(kindsOf('verdantheart')).toEqual(new Set(['regen', 'spawnAdds']));
    expect(kindsOf('tempestcaller')).toEqual(new Set(['blink']));
    expect(kindsOf('luminarch')).toEqual(new Set(['shield']));
    expect(kindsOf('umbrageist')).toEqual(new Set(['stealthPhase', 'curseTowers']));
  });

  it('P12: frost and verdant registries are wired (families, bosses, unlocks)', () => {
    expect(BIOME_FAMILY.frost).toEqual(['driftmote', 'icefang', 'glacierback', 'rimewraith', 'frostbrand']);
    expect(BIOME_FAMILY.verdant).toEqual(['sporeling', 'thornhound', 'barkhide', 'gladeshade', 'mirehulk']);
    expect(BIOME_BOSS.frost).toBe('rimelord');
    expect(BIOME_BOSS.verdant).toBe('verdantheart');
    expect(BIOME_TOWER_UNLOCK.frost).toBe('frostObelisk');
    expect(BIOME_TOWER_UNLOCK.verdant).toBe('thornTotem');
  });

  it('P13: storm and radiant registries are wired (families, bosses, unlocks)', () => {
    expect(BIOME_FAMILY.storm).toEqual(['sparkmote', 'galestrider', 'thunderhide', 'mistwalker', 'stormbrute']);
    expect(BIOME_FAMILY.radiant).toEqual(['lumenmote', 'raywisp', 'aegisbearer', 'veilseraph', 'sungrazer']);
    expect(BIOME_BOSS.storm).toBe('tempestcaller');
    expect(BIOME_BOSS.radiant).toBe('luminarch');
    expect(BIOME_TOWER_UNLOCK.storm).toBe('stormPylon');
    expect(BIOME_TOWER_UNLOCK.radiant).toBe('sunShrine');
  });

  it('P14: the umbral registry completes all six biomes (family, boss, unlock)', () => {
    expect(BIOME_FAMILY.umbral).toEqual(['voidmote', 'gloomwing', 'umbrahusk', 'nullwraith', 'dreadmaw']);
    expect(BIOME_BOSS.umbral).toBe('umbrageist');
    expect(BIOME_TOWER_UNLOCK.umbral).toBe('umbraMonolith');
  });
});
