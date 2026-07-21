import { describe, expect, it } from 'vitest';
import { CAMPAIGN } from '../../src/content';

/**
 * Spec §6: a level carries a hint IFF it debuts an enemy type. The debut set
 * is DERIVED from the wave tables in campaign order — never hardcoded — so
 * the P11 biome-1 conversion and P12–14 level authoring inherit the rule.
 */
function debutMap(): Map<string, string[]> {
  const seen = new Set<string>();
  const debuts = new Map<string, string[]>();
  for (const level of CAMPAIGN) {
    const ids = [...new Set(level.waves.flatMap((w) => w.entries.map((e) => e.enemyId)))];
    const fresh = ids.filter((id) => !seen.has(id));
    fresh.forEach((id) => seen.add(id));
    if (fresh.length > 0) debuts.set(level.id, fresh);
  }
  return debuts;
}

describe('level hints (spec §6)', () => {
  it('hint present IFF the level debuts an enemy type', () => {
    const debuts = debutMap();
    for (const level of CAMPAIGN) {
      if (debuts.has(level.id)) {
        expect(level.hint, `${level.id} debuts [${debuts.get(level.id)!.join(', ')}] and must carry a hint`).toBeDefined();
      } else {
        expect(level.hint, `${level.id} debuts nothing and must NOT carry a hint`).toBeUndefined();
      }
    }
  });

  it('hints are one short line (≤ 60 chars, no newline, non-blank)', () => {
    for (const level of CAMPAIGN) {
      if (level.hint === undefined) continue;
      expect(level.hint.trim().length, level.id).toBeGreaterThanOrEqual(10);
      expect(level.hint.length, level.id).toBeLessThanOrEqual(60);
      expect(level.hint.includes('\n'), level.id).toBe(false);
    }
  });

  it('biome-1 debut spread: gloomling→mite→shell→stalker→wisp→boss (P11 conversion)', () => {
    const debuts = debutMap();
    expect(debuts.size).toBe(36); // 6 per biome × 6 biomes (P14: the campaign is complete)
    expect(debuts.get('level01')).toEqual(['gloomling']);
    expect(debuts.get('level02')).toEqual(['frostmite']);
    expect(debuts.get('level03')).toEqual(['stoneshell']);
    expect(debuts.get('level04')).toEqual(['duskstalker']);
    expect(debuts.get('level06')).toEqual(['cinderwisp']);
    expect(debuts.get('level10')?.sort()).toEqual(['cinderlord', 'flamewisp']);
  });

  it('biome-2 debut spread: mote→fang→back→wraith→brand→boss (P12)', () => {
    const debuts = debutMap();
    expect(debuts.get('level11')).toEqual(['driftmote']);
    expect(debuts.get('level12')).toEqual(['icefang']);
    expect(debuts.get('level13')).toEqual(['glacierback']);
    expect(debuts.get('level14')).toEqual(['rimewraith']);
    expect(debuts.get('level16')).toEqual(['frostbrand']);
    expect(debuts.get('level20')).toEqual(['rimelord']);
  });

  it('biome-3 debut spread: spore→hound→hide→shade→hulk→boss (P12)', () => {
    const debuts = debutMap();
    expect(debuts.get('level21')).toEqual(['sporeling']);
    expect(debuts.get('level22')).toEqual(['thornhound']);
    expect(debuts.get('level23')).toEqual(['barkhide']);
    expect(debuts.get('level24')).toEqual(['gladeshade']);
    expect(debuts.get('level26')).toEqual(['mirehulk']);
    expect(debuts.get('level30')).toEqual(['verdantheart']);
  });

  it('biome-4 debut spread: mote→strider→hide→walker→brute→boss (P13)', () => {
    const debuts = debutMap();
    expect(debuts.get('level31')).toEqual(['sparkmote']);
    expect(debuts.get('level32')).toEqual(['galestrider']);
    expect(debuts.get('level33')).toEqual(['thunderhide']);
    expect(debuts.get('level34')).toEqual(['mistwalker']);
    expect(debuts.get('level36')).toEqual(['stormbrute']);
    expect(debuts.get('level40')).toEqual(['tempestcaller']);
  });

  it('biome-5 debut spread: mote→wisp→bearer→seraph→grazer→boss (P13)', () => {
    const debuts = debutMap();
    expect(debuts.get('level41')).toEqual(['lumenmote']);
    expect(debuts.get('level42')).toEqual(['raywisp']);
    expect(debuts.get('level43')).toEqual(['aegisbearer']);
    expect(debuts.get('level44')).toEqual(['veilseraph']);
    expect(debuts.get('level46')).toEqual(['sungrazer']);
    expect(debuts.get('level50')).toEqual(['luminarch']);
  });

  it('biome-6 debut spread: mote→wing→husk→wraith→maw→boss (P14)', () => {
    const debuts = debutMap();
    expect(debuts.get('level51')).toEqual(['voidmote']);
    expect(debuts.get('level52')).toEqual(['gloomwing']);
    expect(debuts.get('level53')).toEqual(['umbrahusk']);
    expect(debuts.get('level54')).toEqual(['nullwraith']);
    expect(debuts.get('level56')).toEqual(['dreadmaw']);
    expect(debuts.get('level60')).toEqual(['umbrageist']);
  });
});
